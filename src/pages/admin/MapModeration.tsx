import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/adminService';
import AdminLayout from '@/layouts/AdminLayout';
import MapView from '@/components/map/MapView';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import { Incident } from '@/types';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const MapModeration = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedIncident, setSelectedIncident] = React.useState<Incident | null>(null);

    const { data: incidents, isLoading } = useQuery({
        queryKey: ['adminMapIncidents'],
        queryFn: () => adminService.getIncidents() // Get all incidents
    });

    const moderateMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: 'verified' | 'rejected' }) =>
            adminService.moderateIncident(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminMapIncidents'] });
            toast({ title: 'Report Moderated', description: ' The report status has been updated.' });
            setSelectedIncident(null);
        }
    });

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Map Moderation</h1>
            </div>

            <div className="h-[600px] w-full rounded-lg border bg-card overflow-hidden relative" style={{ minHeight: '600px' }}>
                {isLoading ? (
                    <Skeleton className="h-full w-full" />
                ) : (
                    <MapView
                        incidents={incidents || []}
                        clickableMap={false}
                        onMarkerClick={(incident) => setSelectedIncident(incident)}
                    />
                )}
            </div>

            {/* Moderation Modal for Map */}
            <Dialog open={!!selectedIncident} onOpenChange={(open) => !open && setSelectedIncident(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Moderate Report</DialogTitle>
                        <DialogDescription>
                            Review the details of this report.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedIncident && (
                        <div className="py-4">
                            <h3 className="font-semibold text-lg">{selectedIncident.title}</h3>
                            <div className="flex gap-2 my-2">
                                <span className="text-xs border px-2 py-0.5 rounded capitalize bg-muted">{selectedIncident.severity}</span>
                                <span className="text-xs border px-2 py-0.5 rounded capitalize bg-muted">{selectedIncident.category}</span>
                                <span className={`text-xs border px-2 py-0.5 rounded capitalize ${selectedIncident.status === 'verified' ? 'bg-green-100 text-green-800' :
                                    selectedIncident.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {selectedIncident.status}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{selectedIncident.description}</p>
                            <p className="text-xs text-muted-foreground mt-2">📍 {selectedIncident.location}</p>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="destructive"
                            onClick={() => selectedIncident && moderateMutation.mutate({ id: selectedIncident.id, status: 'rejected' })}
                        >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                        </Button>
                        <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => selectedIncident && moderateMutation.mutate({ id: selectedIncident.id, status: 'verified' })}
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Verify
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
};

export default MapModeration;
