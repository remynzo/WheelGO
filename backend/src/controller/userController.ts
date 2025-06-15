import { Request, Response, RequestHandler } from 'express';
import UserModel from '../model/userModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const createUser: RequestHandler = async (req, res) => {
    try {
        const { email, telefone, user, nome, sobrenome, foto, senha } = req.body;

        if (!email || !telefone || !user || !nome || !sobrenome || !senha) {

            res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos.' });
            return;
        }

        const userExistente = await UserModel.findOne({ email });
        if (userExistente) {
            res.status(409).json({ message: 'Já existe uma conta com este e-mail.' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const senhaCriptografada = await bcrypt.hash(senha, salt);

       
        const userSalvo = await UserModel.create({
            email,
            telefone,
            user,
            nome,
            sobrenome,
            foto,
            senha: senhaCriptografada,
        });

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('O segredo JWT (JWT_SECRET) não foi definido no arquivo .env');
        }

        const payload = { id: userSalvo._id };
        
        const token = jwt.sign(
            payload,
            jwtSecret,
            { expiresIn: '30d' }
        );

    
        res.status(201).json({
            message: 'Usuário criado com sucesso!',
            user: userSalvo,
            token: token,
        });

    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ message: 'Ocorreu um erro interno no servidor.' });
    }

};
