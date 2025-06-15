import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './rotas/userRotas';

dotenv.config();

const app = express();
const PORTA = process.env.PORTA || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);

app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Servidor Funcionando'});
});

const mongoURI = process.env.MONGO_URI;

const startServer = async () => {

    if(!mongoURI) {
        console.error('MONGO_URI nao ta no env doidao');
        process.exit(1);
    }

    try {

        await mongoose.connect(mongoURI)
        console.log('conectou no mongol ✅✅✅✅')

        app.listen(PORTA, () => {
            console.log(`server ta rodando na porta ${PORTA}`);
        });
    } catch (error) {
        console.error('deu red❌❌❌', error);
        process.exit(1);
    }
};

startServer();