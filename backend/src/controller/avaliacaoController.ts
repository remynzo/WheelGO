
import { Response, RequestHandler } from 'express';
import AvaliacaoModel, { IAvaliacao } from '../model/avaliacaoModel'; 
import { AuthenticatedRequest } from '../middleware/authMiddleware'; 

interface CreateAvaliacaoBody {
    nota: number;
    texto: string;
    IDlugar: string;
    fotos?: string[]; 
    video?: string;   
}

export const createAvaliacao: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {

        const { nota, texto, IDlugar, fotos, video } = req.body as CreateAvaliacaoBody;


        const user = req.user;

        if (!user) {
            res.status(401).json({ message: 'Não autorizado, utilizador não encontrado no pedido.' });
            return;
        }

        if (!nota || !texto || !IDlugar) {
            res.status(400).json({ message: 'Nota, texto e ID do lugar são obrigatórios.' });
            return;
        }

   
        const novaAvaliacao = await AvaliacaoModel.create({
            nota,
            texto,
            IDlugar,
            fotos,
            video,
            user: user._id, 
        });

        res.status(201).json(novaAvaliacao);

    } catch (error) {
        console.error('Erro ao criar avaliação:', error);
        res.status(500).json({ message: 'Ocorreu um erro interno no servidor.' });
    }
};

export const getAvaliacoesPorLugar: RequestHandler = async (req, res) => {
    try {
        const { idLugar } = req.params;

        const avaliacoes = await AvaliacaoModel.find({ IDlugar: idLugar })
            .populate('user', 'nome foto');
        res.status(200).json(avaliacoes);
        return;
        
    } catch(error){
        console.error("erro ao buscar avaliações:", error);
        res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
        return;
    }
    
};
