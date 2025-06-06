import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import surveyRoutes from './routes/surveys.js';
import respondentRoutes from './routes/respondents.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const corsOptions = {
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        "https://survey-platform-miniature-garbanzo-theta.vercel.app"
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/surveys', surveyRoutes);
app.use('/respondents', respondentRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!'
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});