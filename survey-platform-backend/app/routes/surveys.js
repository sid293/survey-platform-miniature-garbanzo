import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
// import { Survey } from "../models/index.js";
import { 
    createNewSurvey, 
    getSurveyById, 
    listSurveys, 
    updateSurvey, 
    deleteSurvey, 
    publishSurvey,
    getPublicSurvey 
} from "../controllers/surveys.js";
import { submitResponse, getSurveyResponses } from "../controllers/responses.js";

const router = Router();

router.get("/", authenticateToken, async (req, res) => {
    try {
        const result = await listSurveys(req.user.userId, req.query);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error("Error fetching surveys:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching surveys"
        });
    }
});

router.get("/:id", authenticateToken, async (req, res) => {
    try {
        const survey = await getSurveyById(req.params.id, req.user.userId);
        res.json({
            success: true,
            data: { survey }
        });
    } catch (error) {
        console.error("Error fetching survey:", error);
        if (error.message === 'Survey not found') {
            return res.status(404).json({
                success: false,
                message: "Survey not found"
            });
        }
        res.status(500).json({
            success: false,
            message: "Error fetching survey"
        });
    }
});

router.post("/", authenticateToken, async (req, res) => {
    const surveyData = req.body;
    surveyData.user_id = req.user.userId;
    
    if (!surveyData) {
        return res.status(400).json({
            success: false,
            message: "Please enter all fields"
        });
    }    
    try {
        const createdSurvey = await createNewSurvey(surveyData);
        res.status(201).json({
            success: true, 
            message: "Survey created successfully", 
            data: {
                survey: createdSurvey
            } 
        });
    } catch(error) {
        console.error("Survey error:", error);
        res.status(500).json({
            success: false,
            message: "Survey error"
        });
    }
});

router.put("/:id", authenticateToken, async (req, res) => {
    try {
        const survey = await updateSurvey(req.params.id, req.user.userId, req.body);
        res.json({
            success: true,
            message: "Survey updated successfully",
            data: { survey }
        });
    } catch (error) {
        console.error("Error updating survey:", error);
        if (error.message === 'Survey not found') {
            return res.status(404).json({
                success: false,
                message: "Survey not found"
            });
        }
        res.status(500).json({
            success: false,
            message: "Error updating survey"
        });
    }
});

router.delete("/:id", authenticateToken, async (req, res) => {
    try {
        await deleteSurvey(req.params.id, req.user.userId);
        res.json({
            success: true,
            message: "Survey deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting survey:", error);
        if (error.message === 'Survey not found') {
            return res.status(404).json({
                success: false,
                message: "Survey not found"
            });
        }
        res.status(500).json({
            success: false,
            message: "Error deleting survey"
        });
    }
});

router.post("/:id/publish", authenticateToken, async (req, res) => {
    try {
        const survey = await publishSurvey(req.params.id, req.user.userId);
        res.json({
            success: true,
            message: "Survey published successfully",
            data: { survey }
        });
    } catch (error) {
        console.error("Error publishing survey:", error);
        if (error.message === 'Survey not found') {
            return res.status(404).json({
                success: false,
                message: "Survey not found"
            });
        }
        res.status(500).json({
            success: false,
            message: "Error publishing survey"
        });
    }
});

router.get("/:id/public", async (req, res) => {
    try {
        const survey = await getPublicSurvey(req.params.id);
        res.json({
            success: true,
            data: { survey }
        });
    } catch (error) {
        console.error("Error fetching public survey:", error);
        if (error.message === 'Survey not found') {
            return res.status(404).json({
                success: false,
                message: "Survey not found"
            });
        }
        res.status(500).json({
            success: false,
            message: "Error fetching survey"
        });
    }
});

router.post("/:id/responses", submitResponse);
router.get("/:id/responses", authenticateToken, getSurveyResponses);

export default router;