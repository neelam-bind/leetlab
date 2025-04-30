import express from 'express';
import { authMiddleware, checkAdmin } from '../middleware/auth.middleware.js';
import { createProblem, getAllProblems, getProblemById, updateProblemById } from '../controllers/problem.controller.js';

const problemRoutes = express.Router();

problemRoutes.post("/create-problem", authMiddleware , checkAdmin, createProblem);

problemRoutes.get("/get-all-problems", authMiddleware , getAllProblems);

problemRoutes.get("/get-problem/:id", authMiddleware , getProblemById);

problemRoutes.put("/update-problem/:id", authMiddleware , checkAdmin, updateProblemById);

export default problemRoutes;