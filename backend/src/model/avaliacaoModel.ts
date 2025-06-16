import mongoose, { Schema, Document } from 'mongoose';


export interface IAvaliacao extends Document {
    nota: number;
    texto: string;
    IDlugar: string;
    fotos?: string[]; 
    video?: string; 
    user: mongoose.Schema.Types.ObjectId; 
}

const AvaliacaoSchema: Schema = new Schema({
    nota:{ 
        type: Number, 
        required: true,
        min: 0, 
        max: 5, 
    },
    texto: { type: String, required: true },
    IDlugar: { type: String, required: true }, 
    fotos: { type: [String], default: [] },
    video: { type: [String], default: [] },
    user: { 
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
}, {
    timestamps: true 
});


export default mongoose.model<IAvaliacao>('Avaliacao', AvaliacaoSchema);
