import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { 
    listRespondents, 
    getRespondentById, 
    createOrUpdateRespondent 
} from '../controllers/respondents.js';

const router = Router();

router.get('/', authenticateToken, listRespondents);

router.get('/:id', authenticateToken, getRespondentById);

router.post('/', authenticateToken, createOrUpdateRespondent);

export default router;

