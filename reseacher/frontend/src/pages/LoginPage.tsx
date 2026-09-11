import React, { useState } from 'react';
import { useAuth } from '@/store/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  FlaskConical, Stethoscope, Users, Building2, LayoutDashboard, 
  ShieldAlert, Lock, UserPlus, LogIn, CheckCircle2, AlertTriangle, ArrowRight,
  Eye, EyeOff
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { toast } from 'sonner';

export function LoginPage() {
  const { login } = useAuth();
  
  // Auth Mode: 'signin' | 'signup'
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Password Visibility States
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Sign In State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLockedError, setIsLockedError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Participant Sign Up State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLockedError(false);
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err: any) {
      const status = err?.response?.status;
      let detail = err?.response?.data?.detail || err?.message || 'Invalid email or password';
      
      if (!err.response && err.message === 'Network Error') {
        detail = 'Unable to reach backend server. Please verify the FastAPI backend is running on port 8000.';
      }

      if (status === 423 || status === 429 || detail.toLowerCase().includes('lock') || detail.toLowerCase().includes('attempts')) {
        setIsLockedError(true);
        setError(detail);
      } else {
        setError(detail);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters long');
      return;
    }

    setIsRegistering(true);
    try {
      await api.post('/auth/register', {
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        password: regPassword,
        role: 'PARTICIPANT'
      });

      setRegSuccess(true);
      toast.success('Registration successful! Logging you in...');

      // Attempt immediate login with new credentials
      try {
        await login(regEmail.trim().toLowerCase(), regPassword);
      } catch (loginErr) {
        // Fallback: switch to sign in mode with email pre-filled
        setEmail(regEmail.trim().toLowerCase());
        setAuthMode('signin');
        toast.info('Please enter your password to sign in.');
      }
    } catch (err: any) {
      if (!err.response && err.message === 'Network Error') {
        setRegError('Unable to reach backend server. Please verify the FastAPI backend is running on port 8000.');
      } else {
        const detail = err?.response?.data?.detail || err?.message || 'Registration failed. Please try again.';
        setRegError(detail);
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo123');
    setError('');
    setIsLockedError(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-['Plus_Jakarta_Sans']">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl border border-slate-200/60 p-8 shadow-sm"
      >
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black border border-zinc-800 p-0.5 overflow-hidden shadow-inner mb-3">
            <img src="/logo.png" alt="TrialBridge Logo" className="h-full w-full object-contain rounded-lg" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome to TrialBridge</h1>
          <p className="text-sm text-slate-500 mt-1">
            {authMode === 'signin' ? 'Sign in to access your clinical portal' : 'Create a participant account to join trials'}
          </p>
        </div>

        {/* Tab Selector: Sign In vs Participant Sign Up */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl mb-6 text-sm">
          <button
            type="button"
            onClick={() => { setAuthMode('signin'); setError(''); }}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-all ${
              authMode === 'signin'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('signup'); setRegError(''); }}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-all ${
              authMode === 'signup'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Participant Sign Up
          </button>
        </div>

        {/* SIGN IN FORM */}
        {authMode === 'signin' ? (
          <>
            {error && (
              <div className={`mb-4 p-3.5 rounded-xl border text-sm ${
                isLockedError 
                  ? 'bg-red-50 border-red-200 text-red-700' 
                  : 'bg-red-50 border-red-100 text-red-600'
              }`}>
                <div className="flex items-start gap-2.5">
                  {isLockedError ? (
                    <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-semibold text-xs uppercase tracking-wider">
                      {isLockedError ? 'Account Security Alert' : 'Authentication Error'}
                    </p>
                    <p className="text-xs leading-relaxed">{error}</p>
                    {isLockedError && (
                      <p className="text-[11px] text-red-600/90 pt-1 border-t border-red-200/60 font-medium">
                        🛡️ This account requires unlock approval from the Platform Admin via the Security Control Center.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@trialbridge.io" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-xl border-slate-200 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-xs font-semibold text-slate-700">Password</Label>
                  <span className="text-[11px] text-slate-400">Protected by Brute-Force Shield</span>
                </div>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showLoginPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="rounded-xl border-slate-200 text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 transition-colors"
                    title={showLoginPassword ? "Hide password" : "Show password"}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 font-medium transition-colors"
              >
                {isSubmitting ? 'Authenticating...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-7">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-semibold">
                  <span className="bg-white px-2.5 text-slate-400">Quick Test Credentials</span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-1.5">
                <Button variant="outline" size="sm" onClick={() => handleDemoLogin('sarah.chen@trialbridge.io')} className="justify-start text-xs rounded-xl border-slate-200 hover:bg-slate-50">
                  <LayoutDashboard className="mr-2 h-3.5 w-3.5 text-blue-600" /> 
                  <span className="font-semibold text-slate-800 mr-2">Platform Admin:</span> 
                  <span className="text-slate-500 font-mono text-[11px]">sarah.chen@trialbridge.io</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDemoLogin('j.patel@cityhospital.org')} className="justify-start text-xs rounded-xl border-slate-200 hover:bg-slate-50">
                  <Stethoscope className="mr-2 h-3.5 w-3.5 text-indigo-600" /> 
                  <span className="font-semibold text-slate-800 mr-2">Principal Investigator:</span> 
                  <span className="text-slate-500 font-mono text-[11px]">j.patel@cityhospital.org</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDemoLogin('maya.r@trialbridge.io')} className="justify-start text-xs rounded-xl border-slate-200 hover:bg-slate-50">
                  <Users className="mr-2 h-3.5 w-3.5 text-emerald-600" /> 
                  <span className="font-semibold text-slate-800 mr-2">Coordinator:</span> 
                  <span className="text-slate-500 font-mono text-[11px]">maya.r@trialbridge.io</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDemoLogin('rahul.mehta@email.com')} className="justify-start text-xs rounded-xl border-slate-200 hover:bg-slate-50">
                  <Users className="mr-2 h-3.5 w-3.5 text-teal-600" /> 
                  <span className="font-semibold text-slate-800 mr-2">Participant:</span> 
                  <span className="text-slate-500 font-mono text-[11px]">rahul.mehta@email.com</span>
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* PARTICIPANT SIGN UP FORM */
          <div className="space-y-4">
            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-800 flex items-start gap-2">
              <UserPlus className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Registering creates a participant profile linked with our clinical research and trial discovery network.
              </span>
            </div>

            {regError && (
              <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{regError}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="space-y-1">
                <Label htmlFor="reg-name" className="text-xs font-semibold text-slate-700">Full Name</Label>
                <Input 
                  id="reg-name" 
                  type="text" 
                  placeholder="e.g. Yusuf" 
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  className="rounded-xl border-slate-200 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="reg-email" className="text-xs font-semibold text-slate-700">Email Address</Label>
                <Input 
                  id="reg-email" 
                  type="email" 
                  placeholder="yusufabdul0709@gmail.com" 
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  className="rounded-xl border-slate-200 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="reg-password" className="text-xs font-semibold text-slate-700">Password</Label>
                <div className="relative">
                  <Input 
                    id="reg-password" 
                    type={showRegPassword ? "text" : "password"} 
                    placeholder="Minimum 6 characters" 
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    className="rounded-xl border-slate-200 text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 transition-colors"
                    title={showRegPassword ? "Hide password" : "Show password"}
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="reg-confirm" className="text-xs font-semibold text-slate-700">Confirm Password</Label>
                <div className="relative">
                  <Input 
                    id="reg-confirm" 
                    type={showRegConfirmPassword ? "text" : "password"} 
                    placeholder="Re-enter password" 
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    required
                    className="rounded-xl border-slate-200 text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 transition-colors"
                    title={showRegConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isRegistering}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 font-medium transition-colors mt-2"
              >
                {isRegistering ? 'Creating Account...' : 'Register as Participant'}
              </Button>
            </form>

            <p className="text-center text-xs text-slate-500 pt-2">
              Already have an account?{' '}
              <button 
                type="button" 
                onClick={() => setAuthMode('signin')} 
                className="text-blue-600 hover:underline font-semibold"
              >
                Sign In
              </button>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
