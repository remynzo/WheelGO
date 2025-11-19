import { Router } from 'express';
// Importe a nova função updateUserProfile
import { createUser, loginUser, updateUserProfile } from '../controller/userController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', createUser);
router.post('/login', loginUser);

// ✅ ROTA NOVA: O app chama isso para salvar a foto no banco
router.put('/profile', protect, updateUserProfile);

export default router;