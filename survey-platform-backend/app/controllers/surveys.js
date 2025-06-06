import { Survey } from "../models/index.js";
// import { SurveyService } from "../services/surveyService.js";

export async function createNewSurvey(surveyData) {
    const survey = new Survey(surveyData);
    await survey.save();
    return formatSurveyResponse(survey);
}

export async function getSurveyById(surveyId, userId) {
    const survey = await Survey.findOne({ _id: surveyId, user_id: userId });
    if (!survey) {
        throw new Error('Survey not found');
    }
    const responsesCount = await Survey.countDocuments({ survey_id: surveyId });
    return formatSurveyResponse(survey, responsesCount);
}

export async function listSurveys(userId, query = {}) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { user_id: userId };
    if (query.status) {
        filter.status = query.status;
    }
    if (query.search) {
        filter.$or = [
            { title: { $regex: query.search, $options: 'i' } },
            { description: { $regex: query.search, $options: 'i' } }
        ];
    }

    const [surveys, total] = await Promise.all([
        Survey.find(filter)
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit),
        Survey.countDocuments(filter)
    ]);

    return {
        surveys: surveys.map(survey => formatSurveyResponse(survey)),
        pagination: {
            current_page: page,
            total_pages: Math.ceil(total / limit),
            total_items: total,
            items_per_page: limit
        }
    };
}

export async function updateSurvey(surveyId, userId, updateData) {
    const survey = await Survey.findOneAndUpdate(
        { _id: surveyId, user_id: userId },
        { ...updateData, updated_at: new Date() },
        { new: true }
    );
    if (!survey) {
        throw new Error('Survey not found');
    }
    return formatSurveyResponse(survey);
}

export async function deleteSurvey(surveyId, userId) {
    const survey = await Survey.findOneAndDelete({ _id: surveyId, user_id: userId });
    if (!survey) {
        throw new Error('Survey not found');
    }
}

export async function publishSurvey(surveyId, userId) {
    const survey = await Survey.findOneAndUpdate(
        { _id: surveyId, user_id: userId },
        { 
            status: 'active',
            published_at: new Date(),
            updated_at: new Date()
        },
        { new: true }
    );
    if (!survey) {
        throw new Error('Survey not found');
    }
    return formatSurveyResponse(survey);
}

export async function getPublicSurvey(surveyId) {
    const survey = await Survey.findOne({ 
        _id: surveyId,
        status: 'active'
    });
    if (!survey) {
        throw new Error('Survey not found');
    }
    return formatSurveyResponse(survey);
}

function formatSurveyResponse(survey, responsesCount = 0) {
    return {
        id: survey._id,
        title: survey.title,
        description: survey.description,
        status: survey.status,
        questions: survey.questions,
        responses_count: responsesCount,
        created_at: survey.created_at,
        updated_at: survey.updated_at,
        published_at: survey.published_at
    };
}