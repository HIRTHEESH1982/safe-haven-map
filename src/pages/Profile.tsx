import React from 'react';
import { User, FileText, MapPin, Calendar, Shield, LogOut, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Import Tabs
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/layout/Layout';
import IncidentCard from '@/components/incidents/IncidentCard'; // You can reuse IncidentCard or create a custom one
import { useAuth } from '@/context/AuthContext';
import { useUserIncidents, useUserArchivedIncidents } from '@/hooks/useIncidents'; // Import hook
import { formatDistanceToNow } from 'date-fns';

const RejectedReportsList = ({ userId }: { userId: string | undefined }) => {
  const { data: archivedIncidents, isLoading } = useUserArchivedIncidents(userId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {[1, 2].map(i => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!archivedIncidents || archivedIncidents.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 py-8 text-center">
          <Shield className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            No rejected reports found.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {archivedIncidents.map((incident: any) => (
        <Card key={incident.id} className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base font-semibold leading-tight">{incident.title}</CardTitle>
              <Badge variant="destructive">Rejected</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground line-clamp-2">{incident.description}</p>
            <div className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">
              <div className="font-semibold flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Rejection Reason:
              </div>
              {incident.moderationReason || 'Spam'}
            </div>
            <div className="text-xs text-muted-foreground pt-2">
              Deleted {formatDistanceToNow(new Date(incident.deletedAt), { addSuffix: true })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { data: userIncidents, isLoading } = useUserIncidents(user?.id);

  const initials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U';

  const stats = [
    {
      label: 'Reports Submitted',
      value: userIncidents?.length || 0,
      icon: FileText,
    },
    {
      label: 'Member Since',
      value: user?.createdAt
        ? formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })
        : 'Recently',
      icon: Calendar,
    },
  ];

  return (
    <Layout>
      <div className="container py-6 md:py-8">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary text-xl text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold">{user?.name || 'Tourist'}</h1>
                <p className="text-muted-foreground">{user?.email}</p>
                <div className="mt-2 flex items-center justify-center gap-2 sm:justify-start">
                  <Shield className="h-4 w-4 text-success" />
                  <span className="text-sm text-muted-foreground">Verified Contributor</span>
                </div>
              </div>
              <Button variant="outline" onClick={logout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <Card key={label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* User's Reports Tabs */}
        <div className="w-full">
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="mb-4 grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="active">Active Reports</TabsTrigger>
              <TabsTrigger value="rejected">Rejected Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Your Active Reports
                  </CardTitle>
                  <CardDescription>
                    Incidents you've reported that are pending or verified
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-32 w-full" />
                      ))}
                    </div>
                  ) : userIncidents && userIncidents.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {userIncidents.map(incident => (
                        <IncidentCard key={incident.id} incident={incident} />
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        You haven't reported any incidents yet.
                      </p>
                      <Button className="mt-4" asChild>
                        <a href="/report">Submit Your First Report</a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rejected">
              <RejectedReportsList userId={user?.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
