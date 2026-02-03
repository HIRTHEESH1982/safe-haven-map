import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, LogIn, Eye, EyeOff, Lock, Mail, ArrowRight, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();

  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.email.trim()) {
      toast({ title: "Email Required", description: "Please enter your email.", variant: "destructive" });
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({ title: "Invalid Email", description: "Please enter a valid email format.", variant: "destructive" });
      return false;
    }

    if (!formData.password) {
      toast({ title: "Password Required", description: "Please enter your password.", variant: "destructive" });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const user = await login({
        email: formData.email,
        password: formData.password,
        role: role,
      });

      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Invalid email or password. Please try again.";
      toast({
        title: "Login Failed",
        description: message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background font-sans">
      {/* Left Side - Form */}
      <div className="flex w-full lg:w-2/5 items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">

          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <Shield className="h-10 w-10 text-primary" />
              <span className="text-2xl font-bold text-foreground">SafeRoute</span>
            </Link>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight">Sign In</h2>
            <p className="text-muted-foreground">
              Enter your credentials to access your account.
            </p>
          </div>

          <Tabs defaultValue="user" className="w-full" onValueChange={(value) => setRole(value as 'user' | 'admin')}>
            <TabsList className="grid w-full grid-cols-2 mb-6 h-12 p-1 bg-muted/50">
              <TabsTrigger value="user" className="h-full data-[state=active]:bg-background data-[state=active]:shadow-sm">User</TabsTrigger>
              <TabsTrigger value="admin" className="h-full data-[state=active]:bg-background data-[state=active]:shadow-sm">Administrator</TabsTrigger>
            </TabsList>

            <TabsContent value="user" className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="tourist@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 h-11 transition-all hover:border-primary/50 focus:scale-[1.01]"
                    />
                    <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10 h-11 transition-all hover:border-primary/50 focus:scale-[1.01]"
                    />
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r from-primary to-green-600"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="admin" className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="rounded-md bg-amber-500/10 p-3 text-amber-600 border border-amber-500/20 text-sm flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Admin access requires elevated privileges.</span>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <div className="relative">
                    <Input
                      id="admin-email"
                      name="email"
                      type="email"
                      placeholder="admin@saferoute.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 h-11 transition-all hover:border-primary/50 focus:scale-[1.01]"
                    />
                    <Shield className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-password">Admin Password</Label>
                  <div className="relative">
                    <Input
                      id="admin-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10 h-11 transition-all hover:border-primary/50 focus:scale-[1.01]"
                    />
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r from-primary to-green-600"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Login to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link to="/register" className="font-semibold text-primary hover:text-primary/80 transition-colors">
              Create Free Account
            </Link>
          </div>

          <div className="mt-8 text-center hidden lg:block">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Visuals (Desktop only) */}
      <div className="hidden lg:relative lg:flex lg:w-3/5 flex-col justify-between bg-zinc-900 p-12 text-white">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2144&auto=format&fit=crop"
            alt="Chicago City Lights"
            className="h-full w-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-zinc-900/50 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full flex justify-end">
          <Link to="/" className="inline-flex items-center gap-2 text-white transition-opacity hover:opacity-80">
            <Shield className="h-8 w-8 text-green-400" />
            <span className="text-xl font-bold tracking-tight">SafeRoute Chicago</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="mb-6 inline-flex items-center rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-sm font-medium text-green-300 backdrop-blur-sm">
            <MapPin className="mr-2 h-4 w-4" />
            Navigate with Confidence
          </div>
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight leading-tight">
            Welcome Back. <br />
            <span className="text-green-400">Travel Safely.</span>
          </h1>
          <p className="text-lg text-zinc-300 max-w-lg leading-relaxed">
            Access your personalized safe routes, real-time safety insights, and community reports.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
