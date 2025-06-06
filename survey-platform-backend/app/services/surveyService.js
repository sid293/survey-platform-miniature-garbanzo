import { Survey } from "../models/index.js";

export class SurveyService {
    static async listSurveys(userId, query = {}) {
        const { status, page = 1, limit = 10, search } = query;
        const skip = (page - 1) * limit;

        let filter = { user_id: userId };
        if (status) filter.status = status;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const [surveys, total] = await Promise.all([
            Survey.find(filter)
                .skip(skip)
                .limit(limit)
                .sort({ created_at: -1 }),
            Survey.countDocuments(filter)
        ]);

        return {
            surveys,
            pagination: {
                current_page: page,
                total_pages: Math.ceil(total / limit),
                total_items: total,
                items_per_page: limit
            }
        };
    }

    static async getSurveyById(surveyId, userId) {
        const survey = await Survey.findOne({
            _id: surveyId,
            user_id: userId
        });

        if (!survey) {
            throw new Error('Survey not found');
        }

        return survey;
    }

    static async updateSurvey(surveyId, userId, updateData) {
        const survey = await Survey.findOneAndUpdate(
            { _id: surveyId, user_id: userId },
            { $set: updateData },
            { new: true }
        );

        if (!survey) {
            throw new Error('Survey not found');
        }

        return survey;
    }

    static async deleteSurvey(surveyId, userId) {
        const result = await Survey.deleteOne({
            _id: surveyId,
            user_id: userId
        });

        if (result.deletedCount === 0) {
            throw new Error('Survey not found');
        }

        return true;
    }

    static async publishSurvey(surveyId, userId) {
        const survey = await Survey.findOneAndUpdate(
            { _id: surveyId, user_id: userId },
            { 
                $set: { 
                    status: 'active',
                    published_at: new Date()
                }
            },
            { new: true }
        );

        if (!survey) {
            throw new Error('Survey not found');
        }

        return survey;
    }

    static async getPublicSurvey(surveyId) {
        const survey = await Survey.findOne({
            _id: surveyId,
            status: 'active'
        });

        if (!survey) {
            throw new Error('Survey not found');
        }

        return survey;
    }
} 