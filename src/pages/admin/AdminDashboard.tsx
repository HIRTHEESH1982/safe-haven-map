import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/adminService';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF4444'];

const AdminDashboard = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['adminStats'],
        queryFn: adminService.getStats
    });

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
                </div>
                <Skeleton className="h-96" />
            </AdminLayout>
        );
    }

    const { cards, charts } = data || { cards: {}, charts: {} };

    const statCards = [
        { title: 'Total Users', value: cards?.totalUsers, icon: Users, color: 'text-blue-500' },
        { title: 'Total Reports', value: cards?.totalReports, icon: FileText, color: 'text-purple-500' },
        { title: 'Pending Review', value: cards?.pendingReports, icon: AlertTriangle, color: 'text-yellow-500' },
        { title: 'Verified Reports', value: cards?.verifiedReports, icon: CheckCircle, color: 'text-green-500' },
    ];

    return (
        <AdminLayout>
            <h1 className="text-3xl font-bold tracking-tight mb-8">Dashboard Overview</h1>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                {statCards.map((card, idx) => (
                    <Card key={idx}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                            <card.icon className={`h-4 w-4 ${card.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{card.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Line Chart */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Reports Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={charts?.reportsPerDay}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Pie Chart */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Category Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={charts?.categoryDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="count"
                                        nameKey="_id"
                                    >
                                        {charts?.categoryDistribution?.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
