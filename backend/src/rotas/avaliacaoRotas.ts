import { Router } from 'express';
// IMPORTANTE: Importar a função que faltava
import { createAvaliacao, getTodasAvaliacoes, getAvaliacoesPorLugar } from '../controller/avaliacaoController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/novaAvaliacao', protect, createAvaliacao);
router.get('/', getTodasAvaliacoes);
// ADICIONAR ESTA LINHA:
router.get('/:idLugar', getAvaliacoesPorLugar);

export default router;