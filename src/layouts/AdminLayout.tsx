import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Map, LogOut, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const location = useLocation();
    const { logout, user } = useAuth();

    const navItems = [
        { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/admin/users', label: 'User Management', icon: Users },
        { to: '/admin/incidents', label: 'Incident Command', icon: ShieldAlert },
    ];

    return (
        <div className="flex h-screen bg-muted/20">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-card hidden md:flex md:flex-col">
                <div className="flex h-16 items-center border-b px-6">
                    <Link to="/" className="flex items-center gap-2 font-bold text-primary">
                        <ShieldAlert className="h-6 w-6" />
                        <span>Safe Haven Admin</span>
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="grid gap-1 px-2">
                        {navItems.map(({ to, label, icon: Icon }) => (
                            <Link
                                key={to}
                                to={to}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                    location.pathname === to
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="border-t p-4">
                    <div className="flex items-center gap-3 px-2 py-2 mb-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                            {user?.name?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div className="text-sm">
                            <p className="font-medium">{user?.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full justify-start gap-2" onClick={logout}>
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="container py-6">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
