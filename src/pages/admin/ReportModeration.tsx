import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/adminService';
import AdminLayout from '@/layouts/AdminLayout';
import IncidentCard from '@/components/incidents/IncidentCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'; // Assuming Tabs component
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Incident } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';

// Re-implementing a simple Incident item view for admin since IncidentCard might be public-facing focused
const AdminIncidentItem = ({ incident, onVerify, onReject }: {
    incident: Incident,
    onVerify: (id: string) => void,
    onReject: (id: string) => void
}) => (
    <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg bg-card items-start md:items-center justify-between">
        <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
                <Badge variant={
                    incident.severity === 'high' ? 'destructive' :
                        incident.severity === 'medium' ? 'default' : 'secondary' // Fixed 'warning' to 'default' or similar if warning doesn't exist
                }>
                    {incident.severity}
                </Badge>
                <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(incident.reportedAt), { addSuffix: true })}
                </span>
                <Badge variant="outline">{incident.category}</Badge>
            </div>
            <h3 className="font-semibold text-lg">{incident.title}</h3>
            <p className="text-sm text-muted-foreground mb-1">{incident.description}</p>
            <p className="text-xs text-muted-foreground">📍 {incident.location}</p>
        </div>

        {incident.status === 'pending' && (
            <div className="flex gap-2">
                <Button
                    size="sm"
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => onVerify(incident.id)}
                >
                    <CheckCircle className="h-4 w-4 mr-1" /> Approve
                </Button>
                <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onReject(incident.id)}
                >
                    <XCircle className="h-4 w-4 mr-1" /> Reject
                </Button>
            </div>
        )}
        {incident.status !== 'pending' && (
            <Badge variant="outline" className={incident.status === 'verified' ? 'text-green-600 border-green-600' : 'text-red-600 border-red-600'}>
                {incident.status.toUpperCase()}
            </Badge>
        )}
    </div>
);

const ReportModeration = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: incidents, isLoading } = useQuery({
        queryKey: ['adminIncidents', activeTab],
        queryFn: () => adminService.getIncidents(activeTab === 'all' ? undefined : activeTab)
    });

    const moderateMutation = useMutation({
        mutationFn: ({ id, status, reason }: { id: string; status: 'verified' | 'rejected'; reason?: string }) =>
            adminService.moderateIncident(id, status, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminIncidents'] });
            toast({ title: 'Report Moderated', description: 'The report status has been updated.' });
        }
    });

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Report Moderation</h1>
            </div>

            <Tabs defaultValue="pending" className="w-full" onValueChange={setActiveTab}>
                {/* TabsList and Triggers skipped/unchanged */}
                <TabsList>
                    <TabsTrigger value="pending">Pending Review</TabsTrigger>
                    <TabsTrigger value="verified">Verified</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                    {/* <TabsTrigger value="all">All Reports</TabsTrigger> */}
                </TabsList>

                <div className="mt-6 space-y-4">
                    {isLoading ? (
                        [1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)
                    ) : (incidents && incidents.length > 0 ? (
                        incidents.map(incident => (
                            <AdminIncidentItem
                                key={incident.id}
                                incident={incident}
                                onVerify={(id) => moderateMutation.mutate({ id, status: 'verified' })}
                                onReject={(id) => moderateMutation.mutate({ id, status: 'rejected', reason: 'Spam' })}
                            />
                        ))
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            No reports found in this category.
                        </div>
                    ))}
                </div>
            </Tabs>
        </AdminLayout>
    );
};

export default ReportModeration;
