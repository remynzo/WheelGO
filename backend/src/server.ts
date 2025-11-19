// backend/src/server.ts
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './rotas/userRotas';
import avaliacaoRoutes from './rotas/avaliacaoRotas';
import uploadRoutes from './rotas/uploadRotas'; // Garanta que o arquivo existe com esse nome
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORTA = process.env.PORTA || 3001;

app.use(cors());

// CORREÇÃO 1: Aumentar limite para aceitar fotos em Base64 (Avaliações)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rotas principais
app.use('/api/users', userRoutes);
app.use('/api/avaliacoes', avaliacaoRoutes);

// CORREÇÃO 2: Ajustar a rota para bater com o frontend (/api/uploads)
// Se o uploadRotas usa '/', ao montar em '/api/uploads', o final vira '/api/uploads'
app.use('/api/uploads', uploadRoutes);

// Servir arquivos estáticos da pasta de uploads (Para exibir as fotos)
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use('/uploads', express.static(uploadDir));

// Rota padrão de teste
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Servidor Funcionando' });
});

// Conexão com o MongoDB
const mongoURI = process.env.MONGO_URI;

const startServer = async () => {
  if (!mongoURI) {
    console.error('MONGO_URI não está definida no .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoURI);
    console.log('✅ Conectado ao MongoDB');

    app.listen(PORTA, () => {
      console.log(`🚀 Servidor rodando na porta ${PORTA}`);
    });
  } catch (error) {
    console.error('❌ Erro ao conectar no MongoDB', error);
    process.exit(1);
  }
};

startServer();