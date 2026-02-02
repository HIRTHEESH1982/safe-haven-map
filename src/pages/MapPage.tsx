import React, { useState } from 'react';
import { MapPin, List, Filter, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Layout from '@/components/layout/Layout';
import MapView from '@/components/map/MapView';
import MapLegend from '@/components/map/MapLegend';
import IncidentCard from '@/components/incidents/IncidentCard';
import { useIncidents } from '@/hooks/useIncidents';
import { Incident, IncidentSeverity, IncidentCategory, INCIDENT_CATEGORIES } from '@/types';
import ReportIncidentModal from '@/components/incidents/ReportIncidentModal';
import { useToast } from '@/hooks/use-toast';

const MapPage: React.FC = () => {
  const { data: incidents, isLoading } = useIncidents();
  const { toast } = useToast();
  const [view, setView] = useState<'map' | 'list'>('map');
  const [severityFilter, setSeverityFilter] = useState<IncidentSeverity | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<IncidentCategory | 'all'>('all');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Reporting State
  const [isReportMode, setIsReportMode] = useState(false);
  const [reportLocation, setReportLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);


  const filteredIncidents = incidents?.filter(incident => {
    if (severityFilter !== 'all' && incident.severity !== severityFilter) return false;
    if (categoryFilter !== 'all' && incident.category !== categoryFilter) return false;
    return true;
  }) || [];

  // Routing State
  const [routeStart, setRouteStart] = useState<{ lat: number, lng: number } | null>(null);
  const [routeEnd, setRouteEnd] = useState<{ lat: number, lng: number } | null>(null);
  const [routePath, setRoutePath] = useState<[number, number][] | undefined>(undefined);
  const [isRouting, setIsRouting] = useState(false);

  const handleMapClick = (lat: number, lng: number) => {
    if (isReportMode) {
      setReportLocation({ lat, lng });
      setIsReportModalOpen(true);
      setIsReportMode(false); // Turn off report mode after selection? Or keep it? Let's turn off.
      return;
    }

    // Existing Routing Logic
    if (!routeStart) {
      setRouteStart({ lat, lng });
      toast({
        title: "Start Point Set",
        description: "Now click destination or use 'Report Incident' mode.",
      });
    } else if (!routeEnd) {
      setRouteEnd({ lat, lng });
      toast({
        title: "Destination Set",
        description: "Click 'Get Safe Route' to calculate path.",
      });
    } else {
      // Reset if both set
      setRouteStart({ lat, lng });
      setRouteEnd(null);
      setRoutePath(undefined);
    }
  };

  const toggleReportMode = () => {
    setIsReportMode(!isReportMode);
    if (!isReportMode) {
      toast({
        title: "Report Mode Active",
        description: "Click on the map location where the incident occurred.",
        variant: "default", // or use a specific style
      });
      setRouteStart(null);
      setRouteEnd(null);
      setRoutePath(undefined);
    }
  };

  const handleGetRoute = async () => {
    if (!routeStart || !routeEnd) return;
    setIsRouting(true);
    try {
      const { routeService } = await import('@/services/routeService');
      const path = await routeService.getRoute(
        [routeStart.lat, routeStart.lng],
        [routeEnd.lat, routeEnd.lng]
      );
      setRoutePath(path);
    } catch (error) {
      console.error("Failed to get route", error);
      toast({
        title: "Error",
        description: "Failed to calculate route.",
        variant: "destructive"
      });
    } finally {
      setIsRouting(false);
    }
  };

  return (
    <Layout>
      <div className="flex h-[calc(100vh-4rem-4rem)] flex-col md:h-[calc(100vh-4rem)]">
        {/* Header Bar */}
        <div className="border-b bg-card p-4">
          <div className="container flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold">Safety Map</h1>
              <p className="text-sm text-muted-foreground">
                {filteredIncidents.length} incidents in Chicago
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Controls */}
              <div className="flex items-center gap-2 border-r pr-4 mr-2">
                <Button
                  size="sm"
                  variant={isReportMode ? "destructive" : "outline"}
                  onClick={toggleReportMode}
                  className="gap-2"
                >
                  <AlertTriangle className="h-4 w-4" />
                  {isReportMode ? "Cancel Report" : "Report Incident"}
                </Button>

                <Button
                  size="sm"
                  variant={routeStart ? "default" : "outline"}
                  onClick={() => { setRouteStart(null); setRouteEnd(null); setRoutePath(undefined); }}
                  disabled={isReportMode}
                >
                  {routeStart ? "Reset Route" : "Route Mode"}
                </Button>
                <Button
                  size="sm"
                  disabled={!routeStart || !routeEnd || isRouting || isReportMode}
                  onClick={handleGetRoute}
                >
                  {isRouting ? "Calculating..." : "Get Safe Route"}
                </Button>
              </div>

              {/* Severity Filter */}
              <Select
                value={severityFilter}
                onValueChange={(value) => setSeverityFilter(value as IncidentSeverity | 'all')}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select
                value={categoryFilter}
                onValueChange={(value) => setCategoryFilter(value as IncidentCategory | 'all')}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {INCIDENT_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="flex rounded-lg border">
                <Button
                  variant={view === 'map' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="rounded-r-none"
                  onClick={() => setView('map')}
                >
                  <MapPin className="h-4 w-4" />
                </Button>
                <Button
                  variant={view === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="rounded-l-none"
                  onClick={() => setView('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden relative">
          {/* Report Mode Overlay Hint */}
          {isReportMode && (
            <div className="absolute top-4 left-1/2 z-[1000] -translate-x-1/2 rounded-full bg-destructive px-6 py-2 text-white shadow-lg animate-pulse font-medium">
              Click on the map to mark incident location
            </div>
          )}

          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Skeleton className="h-full w-full" />
            </div>
          ) : view === 'map' ? (
            <div className="relative h-full">
              <MapView
                incidents={filteredIncidents}
                onMarkerClick={setSelectedIncident}
                clickableMap={true}
                onMapClick={handleMapClick}
                routeCoordinates={routePath}
              />
              <MapLegend className="absolute bottom-4 left-4 z-[1000] w-auto" />

              {/* Selected Incident Panel */}
              {selectedIncident && (
                <Card className="absolute right-4 top-4 z-[1000] w-80 shadow-lg">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{selectedIncident.title}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedIncident(null)}
                      >
                        ✕
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {selectedIncident.description}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      📍 {selectedIncident.location}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="container h-full overflow-y-auto py-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredIncidents.map(incident => (
                  <IncidentCard
                    key={incident.id}
                    incident={incident}
                    onClick={() => setSelectedIncident(incident)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ReportIncidentModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        location={reportLocation}
      />
    </Layout>
  );
};

export default MapPage;
