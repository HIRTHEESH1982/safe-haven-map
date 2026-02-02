import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, MapPin, FileText, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Layout from '@/components/layout/Layout';
import IncidentCard from '@/components/incidents/IncidentCard';
import { useIncidents } from '@/hooks/useIncidents';

const Home: React.FC = () => {
  const { data: incidents, isLoading } = useIncidents();

  const highSeverityCount = incidents?.filter(i => i.severity === 'high').length || 0;
  const totalIncidents = incidents?.length || 0;

  const stats = [
    {
      title: 'Total Reports',
      value: totalIncidents,
      icon: FileText,
      description: 'Active incident reports',
    },
    {
      title: 'High Priority',
      value: highSeverityCount,
      icon: AlertTriangle,
      description: 'Require caution',
    },
    {
      title: 'Safe Zones',
      value: '12+',
      icon: Shield,
      description: 'Verified safe areas',
    },
    {
      title: 'Community',
      value: '2.5K+',
      icon: Users,
      description: 'Active contributors',
    },
  ];

  return (
    <Layout>
      <div className="container py-6 md:py-8">
        {/* Hero Section */}
        <div className="mb-8 rounded-xl bg-gradient-to-r from-primary to-accent p-6 text-primary-foreground md:p-8">
          <div className="max-w-2xl">
            <h1 className="mb-2 text-2xl font-bold md:text-3xl">
              Welcome to SafeRoute Chicago
            </h1>
            <p className="mb-4 text-primary-foreground/90">
              Your trusted companion for safe travel in the Windy City. View real-time safety reports from fellow tourists and locals.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link to="/map" state={{ fromUi: true }} className="flex-1">
                <div className="group relative h-full overflow-hidden rounded-xl bg-background/10 p-6 transition-all hover:bg-background/20 hover:shadow-lg border border-primary-foreground/20">
                  <div className="flex h-full items-start justify-between">
                    <div className="flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-white">Safety Map</h3>
                        <p className="mt-1 text-sm text-primary-foreground/80">
                          View real-time safety incidents and safe zones.
                        </p>
                      </div>
                    </div>
                    <div className="rounded-full bg-white/20 p-2 text-white transition-colors group-hover:bg-white/30">
                      <MapPin className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </Link>

              <Link to="/report" state={{ fromUi: true }} className="flex-1">
                <div className="group relative h-full overflow-hidden rounded-xl bg-destructive/90 p-6 transition-all hover:bg-destructive hover:shadow-lg border border-destructive-foreground/20">
                  <div className="flex h-full items-start justify-between">
                    <div className="flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">Report Incident</h3>
                        <p className="mt-1 text-sm text-destructive-foreground/80">
                          Submit a new report to alert others.
                        </p>
                      </div>
                    </div>
                    <div className="rounded-full bg-white/20 p-2 text-white transition-colors group-hover:bg-white/30">
                      <FileText className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ title, value, icon: Icon, description }) => (
            <Card key={title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Incidents */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Recent Reports</h2>
              <p className="text-sm text-muted-foreground">
                Latest safety incidents reported in Chicago
              </p>
            </div>
            <Link to="/map" state={{ fromUi: true }}>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {incidents
                ?.sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())
                .slice(0, 4)
                .map(incident => (
                  <IncidentCard key={incident.id} incident={incident} />
                ))}
            </div>
          )}
        </div>
        {/* Safety Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Safety Tips for Tourists
            </CardTitle>
            <CardDescription>
              Stay safe while exploring Chicago
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 sm:grid-cols-2">
              <li className="flex items-start gap-2">
                <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                <span className="text-sm">Stay in well-lit, populated areas at night</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                <span className="text-sm">Keep valuables secure and out of sight</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                <span className="text-sm">Use official transportation services</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                <span className="text-sm">Check safety map before visiting new areas</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Home;
