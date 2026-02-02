import React, { useState } from 'react';
import { MapPin, List, Filter } from 'lucide-react';
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

const MapPage: React.FC = () => {
  const { data: incidents, isLoading } = useIncidents();
  const [view, setView] = useState<'map' | 'list'>('map');
  const [severityFilter, setSeverityFilter] = useState<IncidentSeverity | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<IncidentCategory | 'all'>('all');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const filteredIncidents = incidents?.filter(incident => {
    if (severityFilter !== 'all' && incident.severity !== severityFilter) return false;
    if (categoryFilter !== 'all' && incident.category !== categoryFilter) return false;
    return true;
  }) || [];

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
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Skeleton className="h-full w-full" />
            </div>
          ) : view === 'map' ? (
            <div className="relative h-full">
              <MapView
                incidents={filteredIncidents}
                onMarkerClick={setSelectedIncident}
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
    </Layout>
  );
};

export default MapPage;
