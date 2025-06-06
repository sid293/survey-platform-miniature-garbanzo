import { ResponseService } from '../services/responseService.js';

export async function submitResponse(req, res) {
    try {
        const response = await ResponseService.submitResponse(req.params.id, req.body);
        res.status(201).json({
            success: true,
            message: 'Response submitted successfully',
            data: {
                response_id: response._id
            }
        });
    } catch (error) {
        console.error('Error submitting response:', error);
        if (error.message === 'Survey not found') {
            return res.status(404).json({
                success: false,
                message: 'Survey not found'
            });
        }
        if (error.message === 'Survey is not active') {
            return res.status(400).json({
                success: false,
                message: 'Survey is not active'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error submitting response'
        });
    }
}

export async function getSurveyResponses(req, res) {
    try {
        const result = await ResponseService.getSurveyResponses(req.params.id, req.user.userId, req.query);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error fetching responses:', error);
        if (error.message === 'Survey not found') {
            return res.status(404).json({
                success: false,
                message: 'Survey not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error fetching responses'
        });
    }
} 