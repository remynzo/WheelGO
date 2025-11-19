import { Router } from 'express';
// Importe as novas funções
import { 
    createAvaliacao, 
    getTodasAvaliacoes, 
    getAvaliacoesPorLugar, 
    getMinhasAvaliacoes,
    updateAvaliacao, // <--- NOVO
    deleteAvaliacao  // <--- NOVO
} from '../controller/avaliacaoController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/novaAvaliacao', protect, createAvaliacao);
router.get('/', getTodasAvaliacoes);
router.get('/minhas', protect, getMinhasAvaliacoes);

// Rotas de Edição e Remoção (precisam do ID da avaliação)
router.put('/:id', protect, updateAvaliacao);   // <--- NOVO
router.delete('/:id', protect, deleteAvaliacao); // <--- NOVO

router.get('/:idLugar', getAvaliacoesPorLugar);

export default router;