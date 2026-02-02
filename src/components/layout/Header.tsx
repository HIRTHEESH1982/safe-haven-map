import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, MapPin, FileText, User, LogIn, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const Header: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { to: '/', label: 'Home', icon: Shield },
    { to: '/map', label: 'Safety Map', icon: MapPin },
    { to: '/report', label: 'Report', icon: FileText },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">
            SafeRoute <span className="text-primary">Chicago</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              state={{ fromUi: true }}
              className={cn(
                'flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary',
                isActive(to) ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons - Desktop */}
        <div className="hidden items-center gap-4 md:flex">
          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                state={{ fromUi: true }}
                className={cn(
                  'flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary',
                  isActive('/profile') ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <User className="h-4 w-4" />
                {user?.name || 'Profile'}
              </Link>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t bg-card md:hidden">
          <nav className="container flex flex-col gap-2 py-4">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                state={{ fromUi: true }}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive(to)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  state={{ fromUi: true }}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive('/profile')
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <User className="h-5 w-5" />
                  Profile
                </Link>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link to="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link to="/register" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
