import { Respondent } from '../models/index.js';

export class RespondentService {
    static async listRespondents(query = {}) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const skip = (page - 1) * limit;
        
        let searchQuery = {};
        if (query.search) {
            searchQuery = {
                $or: [
                    { name: { $regex: query.search, $options: 'i' } },
                    { email: { $regex: query.search, $options: 'i' } }
                ]
            };
        }

        const [respondents, total] = await Promise.all([
            Respondent.find(searchQuery)
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(limit),
            Respondent.countDocuments(searchQuery)
        ]);

        return {
            respondents,
            pagination: {
                current_page: page,
                total_pages: Math.ceil(total / limit),
                total_items: total,
                items_per_page: limit
            }
        };
    }

    static async getRespondentById(respondentId) {
        const respondent = await Respondent.findById(respondentId);
        if (!respondent) {
            throw new Error('Respondent not found');
        }
        return respondent;
    }

    static async createOrUpdateRespondent(respondentData) {
        const { email, name, metadata } = respondentData;
        
        let respondent = await Respondent.findOne({ email });
        
        if (respondent) {
            respondent.name = name;
            if (metadata) {
                respondent.metadata = { ...respondent.metadata, ...metadata };
            }
            await respondent.save();
        } else {
            respondent = new Respondent({
                email,
                name,
                metadata,
                surveys_completed: 0
            });
            await respondent.save();
        }
        
        return respondent;
    }

    static async incrementSurveysCompleted(respondentId) {
        const respondent = await Respondent.findById(respondentId);
        if (!respondent) {
            throw new Error('Respondent not found');
        }

        respondent.surveys_completed += 1;
        respondent.last_response_at = new Date();
        await respondent.save();
        
        return respondent;
    }
} 