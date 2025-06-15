import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    email : string;
    telefone: string;
    user: string;
    nome: string;
    sobrenome: string;
    foto?: string;
    senha: string
}

const UserSchema: Schema = new Schema({
    email : { type : String, required: true, unique: true, lowercase: true },
    telefone: { type : String, required: true, unique: true },
    user: { type : String, required: true, unique: true, lowercase: true  },
    nome: { type : String, required: true },
    sobrenome: { type: String, required: true },
    foto:   { type : String, required: false },
    senha: { type : String, required: true, select: false },
}, {
    timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);