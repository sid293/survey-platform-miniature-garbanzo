import { Response, Survey } from '../models/index.js';
import { RespondentService } from './respondentService.js';

export class ResponseService {
    static async submitResponse(surveyId, responseData) {
        console.log("surveyid: ",surveyId)
        console.log("responseData: ",responseData)
        const survey = await Survey.findById(surveyId);
        if (!survey) {
            throw new Error('Survey not found');
        }
        if (survey.status !== 'active') {
            throw new Error('Survey is not active');
        }

        const respondent = await RespondentService.createOrUpdateRespondent(responseData.respondent);

        const response = new Response({
            survey_id: surveyId,
            respondent: responseData.respondent,
            answers: responseData.answers
        });
        await response.save();

        await RespondentService.incrementSurveysCompleted(respondent._id);

        return response;
    }

    static async getSurveyResponses(surveyId, userId, query = {}) {
        const survey = await Survey.findOne({ _id: surveyId, user_id: userId });
        if (!survey) {
            throw new Error('Survey not found');
        }

        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const skip = (page - 1) * limit;

        const [responses, total] = await Promise.all([
            Response.find({ survey_id: surveyId })
                .sort({ completed_at: -1 })
                .skip(skip)
                .limit(limit),
            Response.countDocuments({ survey_id: surveyId })
        ]);

        return {
            responses,
            pagination: {
                current_page: page,
                total_pages: Math.ceil(total / limit),
                total_items: total,
                items_per_page: limit
            }
        };
    }
} 