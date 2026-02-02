import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, AlertTriangle, MapPin } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useCreateIncident } from '@/hooks/useIncidents';
import { IncidentCategory, IncidentSeverity, INCIDENT_CATEGORIES } from '@/types';

interface ReportIncidentModalProps {
    isOpen: boolean;
    onClose: () => void;
    location: { lat: number; lng: number } | null;
}

interface ReportFormData {
    title: string;
    description: string;
    category: IncidentCategory;
    severity: IncidentSeverity;
}

const ReportIncidentModal: React.FC<ReportIncidentModalProps> = ({
    isOpen,
    onClose,
    location,
}) => {
    const { mutate: createIncident, isPending } = useCreateIncident();
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<ReportFormData>({
        defaultValues: {
            category: 'other',
            severity: 'medium',
        },
    });

    const category = watch('category');
    const severity = watch('severity');

    const onSubmit = (data: ReportFormData) => {
        if (!location) {
            setError('No location selected');
            return;
        }

        createIncident(
            {
                ...data,
                latitude: location.lat,
                longitude: location.lng,
                location: `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`, // Ideally reverse geocode here
            },
            {
                onSuccess: () => {
                    reset();
                    onClose();
                },
                onError: () => {
                    setError('Failed to submit report. Please try again.');
                },
            }
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-warning" />
                        Report Incident
                    </DialogTitle>
                    <DialogDescription>
                        Report a safety incident at the selected location to help others.
                    </DialogDescription>
                </DialogHeader>

                {location && (
                    <div className="flex items-center gap-2 rounded-md bg-muted p-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>Selected: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}</span>
                    </div>
                )}

                {error && <div className="text-sm text-destructive">{error}</div>}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            placeholder="Brief title of incident"
                            {...register('title', { required: 'Title is required' })}
                        />
                        {errors.title && (
                            <p className="text-xs text-destructive">{errors.title.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                            value={category}
                            onValueChange={(val) => setValue('category', val as IncidentCategory)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {INCIDENT_CATEGORIES.map((cat) => (
                                    <SelectItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="severity">Severity</Label>
                        <Select
                            value={severity}
                            onValueChange={(val) => setValue('severity', val as IncidentSeverity)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select severity" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low - Minor issue</SelectItem>
                                <SelectItem value="medium">Medium - Be cautious</SelectItem>
                                <SelectItem value="high">High - Danger/Emergency</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe what happened..."
                            {...register('description', { required: 'Description is required' })}
                        />
                        {errors.description && (
                            <p className="text-xs text-destructive">
                                {errors.description.message}
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Report
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ReportIncidentModal;
