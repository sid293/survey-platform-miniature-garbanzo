import mongoose from "mongoose";
import 'dotenv/config'

// User Schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

// Survey Schema
const surveySchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    status: {
        type: String,
        enum: ['draft', 'active', 'completed'],
        default: 'draft'
    },
    questions: [{
        id: String,
        type: {
            type: String,
            enum: ['single-choice', 'multiple-choice', 'long-text', 'short-text'],
            required: true
        },
        question: {
            type: String,
            required: true
        },
        options: [String],
        required: {
            type: Boolean,
            default: false
        }
    }],
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    published_at: Date
});

// Respondent Schema
const respondentSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    metadata: {
        location: String,
        source: String
    },
    surveys_completed: {
        type: Number,
        default: 0
    },
    last_response_at: {
        type: Date
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

// Response Schema
const responseSchema = new mongoose.Schema({
    survey_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Survey',
        required: true
    },
    respondent: {
        email: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        }
    },
    answers: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        required: true
    },
    completed_at: {
        type: Date,
        default: Date.now
    }
});

// Create indexes
// userSchema.index({ email: 1 });
surveySchema.index({ user_id: 1 });
surveySchema.index({ status: 1 });
// respondentSchema.index({ email: 1 });
respondentSchema.index({ name: 1 });
respondentSchema.index({ created_at: -1 });
responseSchema.index({ survey_id: 1 });
responseSchema.index({ 'respondent.email': 1 });
responseSchema.index({ completed_at: -1 });

// Create models
const User = mongoose.model('User', userSchema);
const Survey = mongoose.model('Survey', surveySchema);
const Respondent = mongoose.model('Respondent', respondentSchema);
const Response = mongoose.model('Response', responseSchema);

// Database connection
async function main() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
}

main();

// Export models
export {
    User,
    Survey,
    Respondent,
    Response
};