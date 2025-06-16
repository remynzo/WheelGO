import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import UserModel from '../model/userModel'; 

export interface AuthenticatedRequest extends Request {
  user?: any; 
}



export const protect: RequestHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {

      token = req.headers.authorization.split(' ')[1];


      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };


      req.user = await UserModel.findById(decoded.id).select('-senha');
      

      if (!req.user) {

        res.status(401).json({ message: 'Não autorizado, usuário não encontrado.' });
        return;
      }

      next();
      return; 

    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Não autorizado, token falhou.' });
      return;
    }
  }


  if (!token) {
    res.status(401).json({ message: 'Não autorizado, nenhum token fornecido.' });
    return; 
  }
};
