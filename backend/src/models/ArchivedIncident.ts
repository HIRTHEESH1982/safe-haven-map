import mongoose, { Schema, Document } from 'mongoose';

export interface IArchivedIncident extends Document {
    originalId: mongoose.Types.ObjectId;
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
    originalCreatedAt: Date;
    deletedAt: Date;
    deletedBy?: mongoose.Types.ObjectId;
}

const ArchivedIncidentSchema: Schema = new Schema({
    originalId: { type: Schema.Types.ObjectId, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high'], required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    location: { type: String, required: true },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reportedByEmail: { type: String },
    status: { type: String, enum: ['pending', 'verified', 'rejected'] },
    moderatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    moderationReason: { type: String },
    originalCreatedAt: { type: Date },
    deletedAt: { type: Date, default: Date.now },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' }
});

export default mongoose.model<IArchivedIncident>('ArchivedIncident', ArchivedIncidentSchema);
