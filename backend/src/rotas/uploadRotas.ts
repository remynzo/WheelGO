// backend/src/rotas/uploadRotas.ts
import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Garante que o diretório de uploads exista
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Rota POST /api/uploads
router.post('/uploads', upload.single('avatar'), (req: Request, res: Response): void => {
  // A CORREÇÃO ESTÁ AQUI: Adicionei o tipo de retorno ': void' explícito
  // e separei o return do res.json
  
  if (!req.file) {
    res.status(400).json({ error: 'Nenhum arquivo enviado' });
    return; // Para a execução aqui, retornando void
  }

  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  console.log('🖼️ Arquivo recebido:', req.file.originalname);
  
  res.json({ url: fileUrl });
  // Não precisa de return aqui, a função acaba naturalmente
});

export default router;