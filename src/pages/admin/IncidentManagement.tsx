import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/adminService';
import AdminLayout from '@/layouts/AdminLayout';
import MapView from '@/components/map/MapView';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Search,
    CheckCircle,
    XCircle,
    Trash2,
    MapPin,
    AlertTriangle,
    Filter
} from 'lucide-react';
import { Incident, CHICAGO_CENTER } from '@/types';
import { formatDistanceToNow } from 'date-fns';

const IncidentManagement = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
    const [activeTab, setActiveTab] = useState('pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [mapCenter, setMapCenter] = useState(CHICAGO_CENTER);
    const [mapZoom, setMapZoom] = useState(11);

    // Fetch Incidents based on tab
    const { data: incidents, isLoading } = useQuery({
        queryKey: ['adminIncidents', activeTab],
        queryFn: () => adminService.getIncidents(activeTab === 'all' ? undefined : activeTab)
    });

    // Mutations
    const moderateMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: 'verified' | 'rejected' }) =>
            adminService.moderateIncident(id, status),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['adminIncidents'] });
            toast({
                title: variables.status === 'verified' ? 'Report Verified' : 'Report Rejected',
                description: 'The incident status has been updated.',
                variant: variables.status === 'verified' ? 'default' : 'destructive'
            });
            if (selectedIncident?.id === variables.id) {
                setSelectedIncident(null);
            }
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminService.deleteIncident(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminIncidents'] });
            toast({ title: 'Report Deleted', description: 'The report has been permanently removed.' });
            setSelectedIncident(null);
        }
    });

    // Filter logic
    const filteredIncidents = incidents?.filter(incident =>
        incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleIncidentClick = (incident: Incident) => {
        setSelectedIncident(incident);
        setMapCenter({ lat: incident.latitude, lng: incident.longitude });
        setMapZoom(15);
    };

    return (
        <AdminLayout>
            <div className="flex h-[calc(100vh-6rem)] gap-4">
                {/* Left Panel: List & Controls */}
                <div className="w-1/3 flex flex-col gap-4 min-w-[350px]">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-bold">Incident Command</h1>
                        <p className="text-muted-foreground text-sm">Review, verify, and manage reports.</p>
                    </div>

                    <Card className="flex-1 flex flex-col overflow-hidden border-2">
                        <CardHeader className="py-3 px-4 border-b bg-muted/40">
                            <div className="flex items-center gap-2">
                                <Search className="w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search reports..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-background"
                                />
                            </div>
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="pending">Pending</TabsTrigger>
                                    <TabsTrigger value="verified">Verified</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-hidden bg-muted/10">
                            <ScrollArea className="h-full">
                                <div className="flex flex-col">
                                    {isLoading ? (
                                        Array(5).fill(0).map((_, i) => (
                                            <div key={i} className="p-4 border-b">
                                                <Skeleton className="h-4 w-3/4 mb-2" />
                                                <Skeleton className="h-3 w-1/2" />
                                            </div>
                                        ))
                                    ) : filteredIncidents?.length === 0 ? (
                                        <div className="p-8 text-center text-muted-foreground">
                                            No reports found.
                                        </div>
                                    ) : (
                                        filteredIncidents?.map((incident) => (
                                            <div
                                                key={incident.id}
                                                onClick={() => handleIncidentClick(incident)}
                                                className={`p-4 border-b cursor-pointer transition-colors hover:bg-muted/50 ${selectedIncident?.id === incident.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-semibold line-clamp-1">{incident.title || 'Untitled'}</h3>
                                                    <Badge variant={incident.severity === 'high' ? 'destructive' : 'outline'}>
                                                        {incident.severity || 'medium'}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                                    {incident.description || 'No description'}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <MapPin className="w-3 h-3" />
                                                    <span className="truncate max-w-[150px]">
                                                        {typeof incident.reportedBy === 'object' && incident.reportedBy?.name
                                                            ? incident.reportedBy.name
                                                            : 'Anonymous'} | {incident.location || 'Unknown Location'}
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        {(() => {
                                                            try {
                                                                return formatDistanceToNow(new Date(incident.reportedAt), { addSuffix: true });
                                                            } catch (e) {
                                                                return 'Recently';
                                                            }
                                                        })()}
                                                    </span>
                                                </div>

                                                {/* Quick Actions in List - Only for active selection */}
                                                {selectedIncident?.id === incident.id && (
                                                    <div className="flex gap-2 mt-3 pt-3 border-t">
                                                        {incident.status === 'pending' && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="default"
                                                                    className="h-7 bg-green-600 hover:bg-green-700 w-full"
                                                                    onClick={(e) => { e.stopPropagation(); moderateMutation.mutate({ id: incident.id, status: 'verified' }) }}
                                                                >
                                                                    <CheckCircle className="w-3 h-3 mr-1" /> Verify
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-7 text-destructive hover:bg-destructive/10 w-full"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (confirm('Rejecting this report will permanently delete it. Continue?')) {
                                                                            deleteMutation.mutate(incident.id);
                                                                        }
                                                                    }}
                                                                >
                                                                    <XCircle className="w-3 h-3 mr-1" /> Reject
                                                                </Button>
                                                            </>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-7 w-8 p-0 text-muted-foreground hover:text-destructive"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (confirm('Delete this report permanently?')) deleteMutation.mutate(incident.id);
                                                            }}
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Panel: Map */}
                <div className="flex-1 rounded-xl border overflow-hidden shadow-sm relative h-full">
                    <MapView
                        incidents={filteredIncidents || []}
                        center={mapCenter}
                        zoom={mapZoom}
                        onMarkerClick={handleIncidentClick}
                    />

                    {/* Overlay Selected Details on Map (Optional, currently shown in list) */}
                    {selectedIncident && (
                        <div className="absolute top-4 right-4 bg-background/95 backdrop-blur p-4 rounded-lg shadow-lg border w-80 z-[1000] animate-in fade-in slide-in-from-right-10">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold">{selectedIncident.title}</h3>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setSelectedIncident(null)}>
                                    <XCircle className="w-4 h-4" />
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">{selectedIncident.description}</p>
                            <div className="grid grid-cols-2 gap-2">
                                {selectedIncident.status === 'pending' && (
                                    <>
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => moderateMutation.mutate({ id: selectedIncident.id, status: 'verified' })}>
                                            Verify
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => {
                                            if (confirm('Rejecting this report will permanently delete it. Continue?')) {
                                                deleteMutation.mutate(selectedIncident.id);
                                            }
                                        }}>
                                            Reject
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout >
    );
};

export default IncidentManagement;
