import { Router } from 'express';
import { createAvaliacao } from '../controller/avaliacaoController';

import { protect } from '../middleware/authMiddleware';

const router = Router();


router.post('/novaAvaliacao', protect, createAvaliacao);


export default router;