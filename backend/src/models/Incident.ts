import mongoose, { Schema, Document } from 'mongoose';

export interface IIncident extends Document {
    // Schema updated to remove votes, __v and include email
    title: string;
    description: string;
    category: string;
    severity: 'low' | 'medium' | 'high';
    latitude: number;
    longitude: number;
    location: string;
    reportedBy: mongoose.Types.ObjectId;
    reportedByEmail: string;
    status: 'pending' | 'verified' | 'rejected';
    moderatedBy?: mongoose.Types.ObjectId;
    moderationReason?: string;
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
    reportedByEmail: { type: String },
    status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    moderatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    moderationReason: { type: String },
    createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

export default mongoose.model<IIncident>('Incident', IncidentSchema);
