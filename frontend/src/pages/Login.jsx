import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import Logo from '../components/Logo';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0e12] flex flex-col items-center justify-center p-4 font-sans">
      <Logo className="mb-8" />
      <div className="w-full max-w-md bg-[#1d2025] rounded-2xl p-8 shadow-[0_20px_40px_rgba(6,182,212,0.15)] border-t border-l border-[#c284ff]/20">
        <div className="text-center mb-8">
          <h2 className="text-2xl text-white font-space-grotesk font-bold tracking-tight">Log in</h2>
        </div>
        
        {error && (
          <div className="mb-6 p-4 rounded-md bg-[#9f0519]/20 border border-[#ff716c]/30 flex items-center text-[#ff716c]">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#9ca3af] block">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9ca3af] group-focus-within:text-[#06b6d4] transition-colors">
                <Mail className="h-5 w-5" />
              </div>
              <input 
                type="email" 
                placeholder="you@example.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="w-full pl-10 pr-4 py-3 bg-[#111318] border border-[#23262c] rounded-lg text-white placeholder-[#53555a] focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] transition-all duration-300 shadow-[inset_0_0_0_rgba(6,182,212,0)] focus:shadow-[inset_0_0_8px_rgba(6,182,212,0.3)]"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#9ca3af] block">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9ca3af] group-focus-within:text-[#06b6d4] transition-colors">
                <Lock className="h-5 w-5" />
              </div>
              <input 
                type="password" 
                placeholder="••••••••"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="w-full pl-10 pr-4 py-3 bg-[#111318] border border-[#23262c] rounded-lg text-white placeholder-[#53555a] focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] transition-all duration-300 shadow-[inset_0_0_0_rgba(6,182,212,0)] focus:shadow-[inset_0_0_8px_rgba(6,182,212,0.3)]"
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className="w-full py-3 px-4 rounded-md font-medium text-white bg-gradient-to-br from-[#a855f7] to-[#06b6d4] hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all duration-300"
          >
            Log in
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-[#9ca3af]">
          Don't have an account? <Link to="/register" className="text-[#06b6d4] hover:text-[#53ddfc] font-medium transition-colors">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
