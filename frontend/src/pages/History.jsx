import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, ArrowDownRight, ArrowUpRight, Search, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

const History = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        const res = await axios.get(`${import.meta.env.VITE_API_URL}/transactions`, config);
        const txData = res.data.content ? res.data.content : (Array.isArray(res.data) ? res.data : []);
        setTransactions(txData);
        setError(null);
      } catch (err) {
        console.error("Error fetching history data", err);
        setError("Failed to load transactions.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  };

  const formatGroupDate = (dateString) => {
    if (dateString === 'Unknown Date') return dateString;
    const date = new Date(dateString + 'T00:00:00'); // Ensure local format string
    return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
  };

  const groupedTransactions = transactions.reduce((acc, tx) => {
    const rawDate = tx.transaction_date || tx.date;
    const dateKey = rawDate ? String(rawDate).split('T')[0] : 'Unknown Date';
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(tx);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => {
    if (a === 'Unknown Date') return 1;
    if (b === 'Unknown Date') return -1;
    return new Date(b) - new Date(a);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-cyan-400">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mb-4 shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
        <p className="tracking-widest uppercase text-sm font-medium">Loading History...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      {/* Background ambient light */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-6 py-8 relative z-10">
        
        {/* Floating Header */}
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-zinc-400 hover:text-cyan-400 transition-colors p-2 -ml-2 rounded-lg hover:bg-cyan-500/10"
            >
              <ArrowLeft size={20} />
              <span className="font-medium text-sm">Dashboard</span>
            </button>
          </div>
          <Logo />
        </header>

        {/* History List */}
        <div className="bg-zinc-900/40 backdrop-blur-xl rounded-3xl border-t border-l border-white/10 p-8 shadow-[0_20px_40px_rgba(6,182,212,0.05)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 text-white gap-4">
            <h1 className="text-2xl font-light tracking-wide">Transaction History</h1>
            <div className="bg-white/5 border border-white/10 rounded-full px-4 py-2 flex items-center gap-2 text-zinc-400 w-full sm:w-auto">
               <Search size={16} />
               <input type="text" placeholder="Search..." className="bg-transparent focus:outline-none text-sm w-full sm:w-32 placeholder:text-zinc-600 transition-all focus:w-48" />
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl flex items-center text-red-400 text-sm shadow-[0_0_15px_rgba(239,68,68,0.1)]">
              {error}
            </div>
          )}

          {transactions.length === 0 && !error ? (
            <div className="text-zinc-500 py-16 text-center bg-white/5 rounded-3xl border border-white/5">
              No transactions recorded yet.
            </div>
          ) : (
            <div className="space-y-6">
              {sortedDates.map(dateKey => {
                const dayTransactions = groupedTransactions[dateKey];
                const dailyTotal = dayTransactions.reduce((sum, tx) => {
                  return tx.type === 'INCOME' ? sum + tx.amount : sum - tx.amount;
                }, 0);

                return (
                  <details key={dateKey} className="group rounded-3xl bg-white/5 border border-white/10 overflow-hidden open:bg-zinc-900/60 transition-all duration-300" open>
                    <summary className="flex items-center justify-between p-6 cursor-pointer select-none outline-none group-open:border-b group-open:border-white/10 transition-colors hover:bg-white/5">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-zinc-800 rounded-full text-zinc-400 group-open:rotate-180 transition-transform duration-300">
                          <ChevronDown size={20} />
                        </div>
                        <h2 className="text-xl font-medium tracking-wide text-zinc-100">{formatGroupDate(dateKey)}</h2>
                      </div>
                      <div className={`font-semibold text-lg drop-shadow-sm ${dailyTotal >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {dailyTotal >= 0 ? '+' : ''}{formatCurrency(dailyTotal)}
                      </div>
                    </summary>
                    <div className="p-6 space-y-4">
                      {dayTransactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-transparent hover:border-white/10 transition-colors group/card">
                          <div className="flex items-center gap-5">
                            <div className={`p-4 rounded-full bg-zinc-800/80 text-zinc-400 group-hover/card:bg-cyan-500/10 group-hover/card:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all ${tx.type === 'INCOME' ? 'group-hover/card:text-emerald-400' : 'group-hover/card:text-rose-400'}`}>
                              {tx.type === 'INCOME' ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
                            </div>
                            <div>
                              <p className="text-zinc-100 font-medium text-lg leading-tight mb-1">{tx.description}</p>
                              <div className="flex items-center gap-2 text-zinc-500 text-sm">
                                <span className="bg-white/5 px-2 py-0.5 rounded-md text-xs tracking-wider uppercase border border-white/5">{tx.category}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium text-xl drop-shadow-sm ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
