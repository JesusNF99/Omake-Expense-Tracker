import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, ArrowLeft, ArrowDownCircle, ArrowUpCircle, Calendar, Tag, FileText, Euro } from 'lucide-react';
import Logo from '../components/Logo';

const NewTransaction = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: '',
    type: 'EXPENSE',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const payload = {
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category,
        description: formData.description,
        transaction_date: formData.date
      };

      await axios.post(`${import.meta.env.VITE_API_URL}/transactions`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Redirect back to dashboard upon success
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create transaction. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-cyan-500/30 overflow-x-hidden p-6 relative">
      {/* Background ambient light */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-900/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="max-w-xl mx-auto relative z-10 w-full">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-zinc-400 hover:text-cyan-400 transition-colors p-2 -ml-2 rounded-lg hover:bg-cyan-500/10"
          >
            <ArrowLeft size={20} />
            <span className="font-medium text-sm">Dashboard</span>
          </button>
          <Logo />
        </header>

        {/* glassmorphic card */}
        <div className="bg-zinc-900/40 backdrop-blur-xl rounded-3xl border-t border-l border-white/10 p-8 shadow-[0_20px_40px_rgba(6,182,212,0.05)] relative overflow-hidden group">
          {/* subtle inside glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none group-hover:bg-cyan-500/15 transition-all duration-500"></div>

          <h1 className="text-2xl font-light text-white mb-2 tracking-wide">New Transaction</h1>
          <p className="text-zinc-400 text-sm mb-8">Record your expenses or income to stay on top of your finances.</p>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl flex items-center text-red-400 text-sm shadow-[0_0_15px_rgba(239,68,68,0.1)]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Type Toggle */}
            <div className="grid grid-cols-2 gap-4">
              <label 
                className={`relative flex items-center justify-center gap-2 p-4 rounded-2xl border cursor-pointer transition-all duration-300 overflow-hidden ${
                  formData.type === 'EXPENSE' 
                    ? 'bg-rose-500/10 border-rose-500/50 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.15)]' 
                    : 'bg-zinc-800/30 border-white/5 text-zinc-400 hover:bg-zinc-800/50'
                }`}
              >
                <input 
                  type="radio" 
                  name="type" 
                  value="EXPENSE" 
                  checked={formData.type === 'EXPENSE'} 
                  onChange={handleChange} 
                  className="sr-only" 
                />
                <ArrowDownCircle size={20} />
                <span className="font-medium tracking-wide">EXPENSE</span>
              </label>

              <label 
                className={`relative flex items-center justify-center gap-2 p-4 rounded-2xl border cursor-pointer transition-all duration-300 overflow-hidden ${
                  formData.type === 'INCOME' 
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
                    : 'bg-zinc-800/30 border-white/5 text-zinc-400 hover:bg-zinc-800/50'
                }`}
              >
                <input 
                  type="radio" 
                  name="type" 
                  value="INCOME" 
                  checked={formData.type === 'INCOME'} 
                  onChange={handleChange} 
                  className="sr-only" 
                />
                <ArrowUpCircle size={20} />
                <span className="font-medium tracking-wide">INCOME</span>
              </label>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 tracking-wider mb-2 uppercase">Amount</label>
              <div className="relative group/input flex items-center">
                <div className="absolute left-4 text-zinc-500 group-focus-within/input:text-cyan-400 transition-colors">
                  <Euro size={20} />
                </div>
                <input 
                  type="number" 
                  name="amount"
                  step="0.01"
                  min="0.01"
                  required
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full bg-zinc-950/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-lg placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 hover:border-white/20 transition-all font-mono"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 tracking-wider mb-2 uppercase">Category</label>
              <div className="relative group/input flex items-center">
                <div className="absolute left-4 text-zinc-500 group-focus-within/input:text-cyan-400 transition-colors">
                  <Tag size={20} />
                </div>
                <input 
                  type="text" 
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g., Food, Transport, Salary"
                  className="w-full bg-zinc-950/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 hover:border-white/20 transition-all"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 tracking-wider mb-2 uppercase">Description</label>
              <div className="relative group/input flex items-center">
                <div className="absolute left-4 text-zinc-500 group-focus-within/input:text-cyan-400 transition-colors">
                  <FileText size={20} />
                </div>
                <input 
                  type="text" 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Additional details (optional)"
                  className="w-full bg-zinc-950/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 hover:border-white/20 transition-all"
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 tracking-wider mb-2 uppercase">Date</label>
              <div className="relative group/input flex items-center">
                <div className="absolute left-4 text-zinc-500 group-focus-within/input:text-cyan-400 transition-colors pointer-events-none">
                  <Calendar size={20} />
                </div>
                <input 
                  type="date" 
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full bg-zinc-950/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 hover:border-white/20 transition-all [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] flex justify-center items-center gap-2 group/btn disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-zinc-950"></div>
                ) : (
                  <>
                    <Plus size={20} className="group-hover/btn:scale-110 transition-transform" />
                    <span>Create Transaction</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewTransaction;
