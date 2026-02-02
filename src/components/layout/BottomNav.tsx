import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MapPin, FileText, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const BottomNav: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/map', label: 'Map', icon: MapPin },
    { to: '/report', label: 'Report', icon: FileText },
    { to: isAuthenticated ? '/profile' : '/login', label: isAuthenticated ? 'Profile' : 'Login', icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card shadow-lg md:hidden">
      <div className="flex items-center justify-around">
        {navItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            state={{ fromUi: true }}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
              isActive(to)
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className={cn('h-5 w-5', isActive(to) && 'text-primary')} />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
