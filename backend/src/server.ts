import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './rotas/userRotas';
import avaliacaoRoutes from './rotas/avaliacaoRotas';
import uploadRoutes from './rotas/uploadRotas'; // Certifique-se que o nome do arquivo é uploadRotas.ts
import path from 'path';

dotenv.config();

const app = express();
const PORTA = process.env.PORTA || 3001;

// Middlewares
app.use(cors());

// 🔴 CORREÇÃO IMPORTANTE AQUI:
// Aumentamos o limite para 50MB para aceitar as fotos em Base64 da avaliação
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rotas principais
app.use('/api/users', userRoutes);
app.use('/api/avaliacoes', avaliacaoRoutes);
app.use('/api', uploadRoutes); // Isso cria a rota /api/uploads (se o uploadRotas estiver certo)

// Servir arquivos estáticos da pasta de uploads (Para ver a foto de perfil)
const uploadDir = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadDir));

// Rota padrão
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