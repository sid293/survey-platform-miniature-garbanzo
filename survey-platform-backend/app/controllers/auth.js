import { User } from "../models/index.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';


export async function registerUser(email, password, name) {
    if (email === "" || password === "" || name === "") {
        return "all fields required";
    }
    
    try { 
        const hashPassword = async (password) => {
            const saltRounds = 12;
            return await bcrypt.hash(password, saltRounds);
        };
        const user = new User({
            email,
            "password": await hashPassword(password),
            name
        });
        
        await user.save();
        
        return {
            success: true, 
            message: "User created", 
            data: { user }, 
        };
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;  
    }
}

export async function loginUser(email, password) {
    if(!email ||!password) {
        throw new Error("all fields required");
    }
    try {
        const user = await User.findOne({ 
            email: email
        });
        const verifyPassword = async (password, hashedPassword) => {
            return await bcrypt.compare(password, hashedPassword);
        };
        let isPasswordValid = await verifyPassword(password, user.password);
        
        if (!user || !isPasswordValid) {
            throw new Error("Invalid credentials");
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        return {
            success: true,
            message: "Login successful",
            data: { user },
            token
        };
    } catch (error) {
        console.error("Login error:", error);
        throw error;  
    }
}

export async function getUserData(req, res) {
    let userEmail = req.user.email;
    let user = await User.findOne({
        email: userEmail
    });
    if (!user) {
        return res.status(401).json({
            success: false,
            message: "User not authenticated"
        });
    }
    res.json({
        success: true,
        data: { user }
    });
    
}