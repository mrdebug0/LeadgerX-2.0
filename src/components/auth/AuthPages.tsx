import React, { useState } from 'react';
import { Store, User, Lock, Mail, Phone, ArrowLeft, Sparkles, Building2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../context/AuthContext';

interface AuthPagesProps {
  initialMode?: 'login' | 'signup';
  onNavigateHome: () => void;
  onSuccess: () => void;
}

export const AuthPages: React.FC<AuthPagesProps> = ({
  initialMode = 'login',
  onNavigateHome,
  onSuccess,
}) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const { login, register, demoLogin, loading } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('owner@leadgerx.com');
  const [loginPassword, setLoginPassword] = useState('password123');

  // Register form state
  const [storeName, setStoreName] = useState('');
  const [businessType, setBusinessType] = useState('kirana');
  const [ownerName, setOwnerName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await login(loginEmail, loginPassword);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Email or password is incorrect.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!storeName || !ownerName || !registerEmail || !registerPassword) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    try {
      await register({
        storeName,
        businessType,
        ownerName,
        email: registerEmail,
        password: registerPassword,
        phone,
      });
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Registration failed. Please try again.');
    }
  };

  const handleDemoClick = async () => {
    setErrorMsg(null);
    try {
      await demoLogin();
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to open demo store.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-blue-600 selection:text-white">
      {/* Back to marketing link */}
      <div className="absolute top-6 left-6">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to LeadgerX</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-12 h-12 rounded-2xl bg-blue-600 items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20 mb-3">
          LX
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {isLogin ? 'Sign in to LeadgerX' : 'Create your store workspace'}
        </h2>
        <p className="mt-1.5 text-xs text-slate-500">
          {isLogin
            ? 'Access your daily business records and customer udhaar'
            : 'Get started in under 30 seconds. No credit card required.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80">
          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {isLogin ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="owner@yourstore.com"
                required
                icon={<Mail className="w-4 h-4" />}
              />

              <Input
                label="Password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                required
                icon={<Lock className="w-4 h-4" />}
              />

              <Button type="submit" loading={loading} className="w-full mt-2">
                Sign In
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-slate-400 font-medium">or test instantly</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDemoClick}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Launch Interactive Demo Store</span>
              </button>

              <div className="pt-4 text-center">
                <p className="text-xs text-slate-500">
                  Don't have a LeadgerX account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(false);
                      setErrorMsg(null);
                    }}
                    className="font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    Sign up now
                  </button>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <Input
                label="Store / Business Name *"
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. Sharma General & Kirana"
                required
                icon={<Store className="w-4 h-4" />}
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Business Type
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full bg-white text-slate-900 text-sm rounded-xl border border-slate-200 py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                >
                  <option value="kirana">Kirana / Grocery Store</option>
                  <option value="retail">Retail Counter / Shop</option>
                  <option value="wholesale">Wholesale & Distribution</option>
                  <option value="general">General Merchant</option>
                  <option value="other">Other Business</option>
                </select>
              </div>

              <Input
                label="Owner / Manager Name *"
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Your full name"
                required
                icon={<User className="w-4 h-4" />}
              />

              <Input
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                icon={<Phone className="w-4 h-4" />}
              />

              <Input
                label="Email Address *"
                type="email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                placeholder="owner@yourstore.com"
                required
                icon={<Mail className="w-4 h-4" />}
              />

              <Input
                label="Password *"
                type="password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                icon={<Lock className="w-4 h-4" />}
              />

              <Button type="submit" loading={loading} className="w-full mt-2">
                Create Store Workspace
              </Button>

              <div className="pt-4 text-center">
                <p className="text-xs text-slate-500">
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(true);
                      setErrorMsg(null);
                    }}
                    className="font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
