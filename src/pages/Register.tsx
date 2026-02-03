import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, UserPlus, Eye, EyeOff, CheckCircle, XCircle, Loader2, ArrowRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, verifyOTP, checkEmailAvailability } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [otp, setOtp] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'available' | 'taken' | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailMessage, setEmailMessage] = useState<string>('');

  const checkEmail = async (email: string) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

    setIsCheckingEmail(true);
    setEmailMessage('');
    try {
      const result = await checkEmailAvailability(email);
      if (result.available) {
        setEmailStatus('available');
        setEmailMessage('Email is available');
      } else {
        setEmailStatus('taken');
        const message = result.message || 'Email is not available';
        setEmailMessage(message);
        toast({ title: "Invalid Email", description: message, variant: "destructive" });
      }
    } catch (error) {
      console.error('Failed to check email', error);
      setEmailStatus(null);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'email') {
      setEmailStatus(null);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast({ title: "Name Required", description: "Please enter your full name.", variant: "destructive" });
      return false;
    }

    if (!formData.email.trim()) {
      toast({ title: "Email Required", description: "Please enter your email.", variant: "destructive" });
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
      return false;
    }

    if (!formData.password) {
      toast({ title: "Password Required", description: "Please enter a password.", variant: "destructive" });
      return false;
    } else if (formData.password.length < 8) {
      toast({ title: "Weak Password", description: "Password must be at least 8 characters.", variant: "destructive" });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Password Mismatch", description: "Passwords do not match.", variant: "destructive" });
      return false;
    }

    return true;
  };

  const passwordChecks = [
    { check: formData.password.length >= 8, label: 'At least 8 characters' },
    { check: /[A-Z]/.test(formData.password), label: 'One uppercase letter' },
    { check: /[0-9]/.test(formData.password), label: 'One number' },
    { check: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password), label: 'One special character' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (emailStatus === 'taken') {
      toast({ title: "Invalid Email", description: emailMessage || "This email is invalid or already registered.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      setStep('otp');
    } catch (error: any) {
      if (error.response?.data?.message === 'User already exists') {
        toast({ title: "Registration Failed", description: "User already exists with this email.", variant: "destructive" });
      } else {
        toast({ title: "Registration Failed", description: "Please try again later.", variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      toast({ title: "Invalid OTP", description: "Please enter a valid 6-digit OTP.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const user = await verifyOTP(formData.email, otp);
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (error) {
      toast({ title: "Verification Failed", description: "Invalid or expired OTP.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background font-sans">
      {/* Left Side - Visuals (Desktop only) */}
      <div className="hidden lg:relative lg:flex lg:w-3/5 flex-col justify-between bg-zinc-900 p-12 text-white">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1494522855154-9297ac14b55f?q=80&w=2070&auto=format&fit=crop"
            alt="Chicago Skyline"
            className="h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-zinc-900/40 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-white transition-opacity hover:opacity-80">
            <Shield className="h-8 w-8 text-green-400" />
            <span className="text-xl font-bold tracking-tight">SafeRoute Chicago</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight leading-tight">
            Travel Safer. <br />
            <span className="text-green-400">Choose Smarter Routes.</span>
          </h1>
          <p className="text-xl text-zinc-300 max-w-lg mb-8 leading-relaxed">
            Join thousands of Chicagoans navigating the city with confidence.
            Real-time safety data, community reports, and protected paths at your fingertips.
          </p>

          <div className="flex items-center gap-8 text-sm font-medium text-zinc-400">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-400" />
              <span>Verified Data</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 w-8 rounded-full border-2 border-zinc-900 bg-zinc-700" />
                ))}
              </div>
              <span className="text-white">+20k Users</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full lg:w-2/5 items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">

          {/* Mobile Logo (Visible only on small screens) */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <Shield className="h-10 w-10 text-primary" />
              <span className="text-2xl font-bold text-foreground">SafeRoute</span>
            </Link>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight">
              {step === 'form' ? 'Get Started' : 'Verify Your Email'}
            </h2>
            <p className="text-muted-foreground">
              {step === 'form'
                ? 'Create your account to access premium safety features.'
                : `We've sent a 6-digit code to ${formData.email}`}
            </p>
          </div>

          {step === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <Input
                      id="name"
                      name="name"
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="pl-10 h-11 transition-all hover:border-primary/50 focus:scale-[1.01]"
                    />
                    <UserPlus className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative group">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={() => checkEmail(formData.email)}
                      className={`pl-10 h-11 transition-all hover:border-primary/50 focus:scale-[1.01] ${emailStatus === 'taken' ? 'border-destructive' : emailStatus === 'available' ? 'border-success' : ''
                        }`}
                    />
                    <div className="absolute left-3 top-3.5 text-muted-foreground group-hover:text-primary transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                    </div>
                    <div className="absolute right-3 top-3.5">
                      {isCheckingEmail ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : emailStatus === 'available' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : emailStatus === 'taken' ? (
                        <XCircle className="h-4 w-4 text-destructive" />
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 h-11 pr-10 transition-all hover:border-primary/50 focus:scale-[1.01]"
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
                  {/* Password Strength Indicators - Only show when typing */}
                  {formData.password.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {passwordChecks.map(({ check, label }) => (
                        <div key={label} className={`text-[10px] flex items-center gap-1.5 ${check ? 'text-green-600' : 'text-muted-foreground'}`}>
                          <div className={`h-1.5 w-1.5 rounded-full ${check ? 'bg-green-600' : 'bg-zinc-300'}`} />
                          {label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="pl-10 h-11 transition-all hover:border-primary/50 focus:scale-[1.01]"
                    />
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  </div>
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
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Free Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground px-4">
                By signing up, you agree to our <Link to="/terms" className="underline hover:text-primary">Terms</Link> and <Link to="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  name="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="text-center text-3xl tracking-[1em] h-16 font-mono font-bold transition-all focus:scale-[1.02] border-2"
                  maxLength={6}
                />
                <p className="text-xs text-muted-foreground text-center">
                  Check your email for the verification code.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base shadow-lg hover:shadow-primary/30 transition-all bg-gradient-to-r from-primary to-green-600"
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </Button>

              <div className="text-center">
                <Button variant="ghost" type="button" onClick={() => setStep('form')} className="text-sm">
                  ← Change Email
                </Button>
              </div>
            </form>
          )}

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
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
