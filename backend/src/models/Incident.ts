import mongoose, { Schema, Document } from 'mongoose';

export interface IIncident extends Document {
    title: string;
    description: string;
    category: string;
    severity: 'low' | 'medium' | 'high';
    latitude: number;
    longitude: number;
    location: string;
    reportedBy: mongoose.Types.ObjectId;
    verified: boolean;
    votes: number;
    createdAt: Date;
}

const IncidentSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high'], required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    location: { type: String, required: true },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    verified: { type: Boolean, default: false },
    votes: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IIncident>('Incident', IncidentSchema);
