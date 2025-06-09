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
            sameSite: "None",
            secure: process.env.NODE_ENV !== "development",
            maxAge: 7 * 24 * 60 * 60 * 1000      
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

export const login = async (req, res) => {
    const {email ,password} = req.body;
    try {
        const user = await db.user.findUnique({
            where: {
                email
            }
        });

        if (!user) {
            return res.status(401).json({ 
                message: "user not found" 
            });
        }
        // Check if the password is correct
        const isMatch = await bcyrptjs.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                message: "Invalid credentials" 
            });
        }
        // Generate a JWT token and send it in the response
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: "7d"
        });
        // Set the token in a cookie
        res.cookie ("jwt", token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV !== "development",
            sameSite: "None",
            maxAge: 7 * 24 * 60 * 60 * 1000         // 7 days   
        })
        // Send the user data in the response
        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            user:{
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            message: "Internal server error" 
        });
    }
}

export const logout = async (req, res) => {
    // Clear the cookie by setting its expiration date to a past date
    try {
        res.clearCookie("jwt",{
            httpOnly: true,
            sameSite:"None",
            secure: process.env.NODE_ENV !== "development"
        });
        // Send a response indicating successful logout
        res.status(200).json({
            success: true,
            message: "User logged out successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
    
}

export const check = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: "User authenticated successfully",
            user: req.user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}
