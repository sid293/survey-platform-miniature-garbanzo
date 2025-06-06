import { Router } from "express";
import { registerUser, loginUser, getUserData } from "../controllers/auth.js";
import { authenticateToken } from "../middleware/auth.js";
// import jwt from 'jsonwebtoken';

console.log("auth.js running");

const router = Router();

router.post("/register", async (req, res) => {
    const {email, password, name} = req.body;
    if (!email || !password || !name) {
        return res.status(400).json({
            success: false,
            message: "Please enter all fields"
        });
    }
    try {
        const response = await registerUser(email, password, name);
        res.json(response);
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error during registration", 
            error: error.message 
        });
    }
});

router.post("/login", async (req, res) => {
    const {email, password} = req.body;
    if (!email || !password) {
        return res.status(400).json({
            success: false, 
            message: "Please enter all fields"
        });
    }
    try {
        const response = await loginUser(email, password);
        res.json(response);
    } catch (error) {
        console.error("Login error:", error);
        res.status(401).json({ 
            success: false, 
            message: error.message || "Error during login"
        });
    }
});

router.get("/me",authenticateToken, getUserData);

export default router;