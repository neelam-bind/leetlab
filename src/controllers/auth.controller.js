import bcyrptjs from "bcryptjs";
import { db } from "../libs/db.js";
import { Prisma, UserRole } from "../generated/prisma/index.js";
import jwt from "jsonwebtoken";


export const register = async (req, res) => {
    const { email, password ,name} = req.body;

    try {
        const existinguser = await db.user.findUnique({
            where: {
                email
            }
        });
        if (existinguser) {
            return res.status(400).json({ 
                message: "User already exists" });
        }
        
        const hashedPassword = await bcyrptjs.hash(password, 10);
        const newuser = await db.user.create({
            data: {
                email: email,
                password: hashedPassword,
                name: name,
                role: UserRole.USER
            }
        });

        const token = jwt.sign({ id: newuser.id }, process.env.JWT_SECRET, {
            expiresIn: "7d"
        });
        res.cookie ("jwt", token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV !== "development",
            maxAge: 7 * 24 * 60 * 60 * 1000         // 7 days
    })
    res.status(201).json({
        success: true,
        message: "User created successfully",
        user:{
            id: newuser.id,
            email: newuser.email,
            name: newuser.name,
            role: newuser.role
        }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            message: "Internal server error" 
        });
    }
}

export const login = async (req, res) => {}

export const logout = async (req, res) => {}

export const check = async (req, res) => {}