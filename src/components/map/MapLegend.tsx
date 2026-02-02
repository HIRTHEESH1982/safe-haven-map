import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MapLegendProps {
  className?: string;
}

const MapLegend: React.FC<MapLegendProps> = ({ className }) => {
  const items = [
    { color: 'bg-success', label: 'Low Severity' },
    { color: 'bg-warning', label: 'Medium Severity' },
    { color: 'bg-destructive', label: 'High Severity' },
  ];

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Legend</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${color}`} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default MapLegend;
