import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, UserPlus, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, verifyOTP } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [otp, setOtp] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    } else if (formData.password.length < 6) {
      toast({ title: "Weak Password", description: "Password must be at least 6 characters.", variant: "destructive" });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Password Mismatch", description: "Passwords do not match.", variant: "destructive" });
      return false;
    }

    return true;
  };

  const passwordChecks = [
    { check: formData.password.length >= 6, label: 'At least 6 characters' },
    { check: /[A-Z]/.test(formData.password), label: 'One uppercase letter' },
    { check: /[0-9]/.test(formData.password), label: 'One number' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      // Move to OTP step
      setStep('otp');
    } catch (error: any) {
      // Check if message says "User already exists"
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
      await verifyOTP(formData.email, otp);
      navigate('/');
    } catch (error) {
      toast({ title: "Verification Failed", description: "Invalid or expired OTP.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link to="/" className="mb-4 inline-flex items-center justify-center gap-2">
            <Shield className="h-10 w-10 text-primary" />
          </Link>
          <CardTitle className="text-2xl">
            {step === 'form' ? 'Create Account' : 'Verify Email'}
          </CardTitle>
          <CardDescription>
            {step === 'form'
              ? 'Join SafeRoute Chicago and help keep tourists safe'
              : `We sent a code to ${formData.email}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Existing Form Fields */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                // className={errors.name ? 'border-destructive' : ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tourist@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                // className={errors.email ? 'border-destructive' : ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className='pr-10'
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {/* Password Checks */}
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    {passwordChecks.map(({ check, label }) => (
                      <div key={label} className="flex items-center gap-2 text-xs">
                        <CheckCircle className={`h-3 w-3 ${check ? 'text-success' : 'text-muted-foreground'}`} />
                        <span className={check ? 'text-success' : 'text-muted-foreground'}>{label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                // className={errors.confirmPassword ? 'border-destructive' : ''}
                />
              </div>



              <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                <UserPlus className="h-4 w-4" />
                {isLoading ? 'Sending Code...' : 'Create Account'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Enter Verification Code</Label>
                <Input
                  id="otp"
                  name="otp"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className='text-center text-2xl tracking-widest'
                  maxLength={6}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </Button>

              <div className="mt-4 text-center">
                <Button variant="link" type="button" onClick={() => setStep('form')} className="text-sm text-muted-foreground">
                  ← Back to Details
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
