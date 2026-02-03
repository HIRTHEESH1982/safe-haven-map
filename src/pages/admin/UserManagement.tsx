import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/adminService';
import AdminLayout from '@/layouts/AdminLayout';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton'; // Assuming Skeleton is available
import { User } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { Shield, UserX, UserCheck, ShieldOff, Trash2 } from 'lucide-react';

const UserManagement = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: users, isLoading } = useQuery({
        queryKey: ['adminUsers'],
        queryFn: adminService.getUsers
    });

    const updateRoleMutation = useMutation({
        mutationFn: ({ id, role }: { id: string; role: 'user' | 'admin' }) =>
            adminService.updateUserRole(id, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            toast({ title: 'Role Updated', description: 'User role has been changed successfully.' });
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: 'active' | 'suspended' }) =>
            adminService.updateUserStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            toast({ title: 'Status Updated', description: 'User status has been updated.' });
        }
    });

    const deleteUserMutation = useMutation({
        mutationFn: (id: string) => adminService.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            toast({ title: 'User Deleted', description: 'User has been permanently removed.' });
        },
        onError: (error: any) => {
            toast({
                title: 'Delete Failed',
                description: error.response?.data?.message || 'Could not delete user. Please try again.',
                variant: 'destructive',
            });
        }
    });

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            [1, 2, 3, 4, 5].map(i => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-[100px]" /></TableCell>
                                </TableRow>
                            ))
                        ) : (
                            users?.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === 'admin' ? 'default' : user.role === 'owner' ? 'outline' : 'secondary'} className={user.role === 'owner' ? 'border-amber-500 text-amber-500' : ''}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.status === 'active' ? 'secondary' : 'destructive'}>
                                            {user.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right flex justify-end gap-2">
                                        {user.role === 'owner' ? (
                                            <Badge variant="outline" className="border-amber-500 text-amber-500">
                                                Owner
                                            </Badge>
                                        ) : (
                                            <>
                                                <Button
                                                    title={user.role === 'user' ? "Promote to Admin" : "Demote to User"}
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => updateRoleMutation.mutate({
                                                        id: user.id,
                                                        role: user.role === 'admin' ? 'user' : 'admin'
                                                    })}
                                                >
                                                    {user.role === 'user' ? <Shield className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
                                                </Button>
                                                <Button
                                                    title={user.status === 'active' ? "Suspend User" : "Activate User"}
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => updateStatusMutation.mutate({
                                                        id: user.id,
                                                        status: user.status === 'active' ? 'suspended' : 'active'
                                                    })}
                                                    className={user.status === 'active' ? 'text-destructive' : 'text-green-600'}
                                                >
                                                    {user.status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                                </Button>
                                                <Button
                                                    title="Delete User"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                                                            deleteUserMutation.mutate(user.id);
                                                        }
                                                    }}
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </AdminLayout>
    );
};

export default UserManagement;
