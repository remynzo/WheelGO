import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './rotas/userRotas';
import avaliacaoRoutes from './rotas/avaliacaoRotas';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORTA = process.env.PORTA || 3001;

app.use(cors());
app.use(express.json());

// 👉 Rota padrão
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Servidor Funcionando' });
});

// 👉 Rotas principais
app.use('/api/users', userRoutes);
app.use('/api/avaliacoes', avaliacaoRoutes);

// 👉 Configuração de upload com multer
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// 👉 Rota de upload
app.post('/api/upload', upload.single('avatar'), (req: Request, res: Response) => {
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file?.filename}`;
  res.json({ url: fileUrl });
});

// 👉 Pasta estática pública
app.use('/uploads', express.static(uploadDir));

// 👉 Inicializa o servidor
const mongoURI = process.env.MONGO_URI;

const startServer = async () => {
  if (!mongoURI) {
    console.error('MONGO_URI nao ta no env doidao');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoURI);
    console.log('conectou no mongol ✅✅✅✅');

    app.listen(PORTA, () => {
      console.log(`server ta rodando na porta ${PORTA}`);
    });
  } catch (error) {
    console.error('deu red❌❌❌', error);
    process.exit(1);
  }
};

startServer();
