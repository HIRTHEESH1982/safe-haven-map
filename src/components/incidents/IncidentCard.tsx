import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Incident, IncidentSeverity, IncidentCategory } from '@/types';
import { cn } from '@/lib/utils';

interface IncidentCardProps {
  incident: Incident;
  onClick?: () => void;
}

const severityConfig: Record<IncidentSeverity, { label: string; className: string }> = {
  low: { label: 'Low', className: 'bg-success text-success-foreground' },
  medium: { label: 'Medium', className: 'bg-warning text-warning-foreground' },
  high: { label: 'High', className: 'bg-destructive text-destructive-foreground' },
};

const categoryLabels: Record<IncidentCategory, string> = {
  theft: 'Theft',
  assault: 'Assault',
  vandalism: 'Vandalism',
  harassment: 'Harassment',
  scam: 'Scam/Fraud',
  unsafe_area: 'Unsafe Area',
  other: 'Other',
};

const IncidentCard: React.FC<IncidentCardProps> = ({ incident, onClick }) => {
  const severityInfo = severityConfig[incident.severity];
  const categoryLabel = categoryLabels[incident.category];

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        onClick && 'hover:border-primary'
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-semibold leading-tight">
            {incident.title}
          </CardTitle>
          <Badge className={severityInfo.className}>{severityInfo.label}</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{categoryLabel}</Badge>
          {incident.verified && (
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Verified
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {incident.description}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {incident.location}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(incident.reportedAt), { addSuffix: true })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default IncidentCard;
