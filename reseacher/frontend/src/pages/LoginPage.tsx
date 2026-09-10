import React, { useState } from 'react';
import { useAuth } from '@/store/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FlaskConical, Stethoscope, Users, Building2, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import logoImg from '@/assets/logo.png';

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-['Plus_Jakarta_Sans']">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl border border-slate-200/60 p-8 shadow-sm"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black border border-zinc-800 p-0.5 overflow-hidden shadow-inner mb-4">
            <img src={logoImg} alt="TrialBridge Logo" className="h-full w-full object-contain rounded-lg" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome to TrialBridge</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            Sign In
          </Button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">Demo Accounts</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2">
            <Button variant="outline" size="sm" onClick={() => handleDemoLogin('sarah.chen@trialbridge.io')} className="justify-start">
              <LayoutDashboard className="mr-2 h-4 w-4 text-slate-500" /> Platform Admin
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDemoLogin('m.torres@pharmaco.com')} className="justify-start">
              <Building2 className="mr-2 h-4 w-4 text-slate-500" /> Organization
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDemoLogin('j.patel@cityhospital.org')} className="justify-start">
              <Stethoscope className="mr-2 h-4 w-4 text-slate-500" /> Principal Investigator
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDemoLogin('maya.r@trialbridge.io')} className="justify-start">
              <Users className="mr-2 h-4 w-4 text-slate-500" /> Research Coordinator
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDemoLogin('rahul.mehta@email.com')} className="justify-start">
              <Users className="mr-2 h-4 w-4 text-slate-500" /> Participant
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
