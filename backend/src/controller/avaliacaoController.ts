
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

export const getTodasAvaliacoes: RequestHandler = async (req, res) => {
    try {

        const avaliacoes = await AvaliacaoModel.find({ })
            .populate('user', 'nome foto');
        res.status(200).json(avaliacoes);
        return;
        
    } catch(error){
        console.error("erro ao buscar avaliações:", error);
        res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
        return;
    }

    
};

export const getMinhasAvaliacoes: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;

        if (!user) {
             res.status(401).json({ message: 'Usuário não identificado.' });
             return;
        }

        // Busca onde o campo 'user' é igual ao ID do usuário logado
        const avaliacoes = await AvaliacaoModel.find({ user: user._id }).sort({ createdAt: -1 }); // Mais recentes primeiro
        
        res.status(200).json(avaliacoes);

    } catch(error){
        console.error("Erro ao buscar minhas avaliações:", error);
        res.status(500).json({ message: "Erro interno no servidor." });
    }
};

// ... imports existentes ...

// ATUALIZAR (EDITAR) AVALIAÇÃO
export const updateAvaliacao: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { nota, texto, fotos } = req.body;
        const user = req.user;

        const avaliacao = await AvaliacaoModel.findById(id);

        if (!avaliacao) {
             res.status(404).json({ message: 'Avaliação não encontrada.' });
             return;
        }

        // VERIFICAÇÃO DE SEGURANÇA: Só o dono pode editar
        if (avaliacao.user.toString() !== user?._id.toString()) {
             res.status(401).json({ message: 'Não autorizado.' });
             return;
        }

        // Atualiza os campos
        avaliacao.nota = nota || avaliacao.nota;
        avaliacao.texto = texto || avaliacao.texto;
        if (fotos) avaliacao.fotos = fotos; // Se vier novas fotos, substitui

        const atualizada = await avaliacao.save();
        res.json(atualizada);

    } catch (error) {
        console.error("Erro ao atualizar:", error);
        res.status(500).json({ message: "Erro interno." });
    }
};

// DELETAR AVALIAÇÃO
export const deleteAvaliacao: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const avaliacao = await AvaliacaoModel.findById(id);

        if (!avaliacao) {
             res.status(404).json({ message: 'Avaliação não encontrada.' });
             return;
        }

        // VERIFICAÇÃO DE SEGURANÇA: Só o dono pode deletar
        if (avaliacao.user.toString() !== user?._id.toString()) {
             res.status(401).json({ message: 'Não autorizado.' });
             return;
        }

        await avaliacao.deleteOne();
        res.json({ message: 'Avaliação removida com sucesso.' });

    } catch (error) {
        console.error("Erro ao deletar:", error);
        res.status(500).json({ message: "Erro interno." });
    }
};