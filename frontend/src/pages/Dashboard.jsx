import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Logo from '../components/Logo';
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { LogOut, Wallet, ArrowDownRight, ArrowUpRight, Activity, Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getColorForCategory } from '../utils/helpers';

const Dashboard = () => {
  const { logout } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [isIncomeMonthly, setIsIncomeMonthly] = useState(false);
  const [isExpenseMonthly, setIsExpenseMonthly] = useState(false);
  const [isChartMonthly, setIsChartMonthly] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        const [txRes, summaryRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/transactions`, config),
          axios.get(`${import.meta.env.VITE_API_URL}/transactions/summary`, config)
        ]);

        const txData = txRes.data.content ? txRes.data.content : (Array.isArray(txRes.data) ? txRes.data : []);
        setTransactions(txData);
        setSummary(summaryRes.data.byCategory || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-cyan-400">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mb-4 shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
        <p className="tracking-widest uppercase text-sm font-medium">Syncing Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-red-500 px-4">
        <div className="bg-red-500/10 border border-red-500/20 px-8 py-8 rounded-2xl backdrop-blur-md shadow-[0_0_30px_rgba(239,68,68,0.2)] text-center max-w-sm w-full">
          <AlertTriangle className="mx-auto mb-4 w-12 h-12 text-red-500 opacity-80" />
          <p className="text-xl font-semibold mb-2 text-zinc-100">Connection Error</p>
          <p className="text-red-400 mb-8">{error}</p>
          
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/30 transition-all duration-300 shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] font-medium"
          >
            <LogOut size={18} />
            <span>Log Out & Retry</span>
          </button>
        </div>
      </div>
    );
  }

  // Derived calculations
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const isCurrentMonth = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  };

  const allIncomeTransactions = transactions.filter(tx => tx.type === 'INCOME');
  const allExpenseTransactions = transactions.filter(tx => tx.type === 'EXPENSE');

  const incomeTransactions = isIncomeMonthly 
    ? allIncomeTransactions.filter(tx => isCurrentMonth(tx.transaction_date))
    : allIncomeTransactions;

  const expenseTransactions = isExpenseMonthly 
    ? allExpenseTransactions.filter(tx => isCurrentMonth(tx.transaction_date))
    : allExpenseTransactions;

  const chartTransactions = isChartMonthly
    ? allExpenseTransactions.filter(tx => isCurrentMonth(tx.transaction_date))
    : allExpenseTransactions;

  const totalIncome = incomeTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const totalExpense = expenseTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const netBalance = allIncomeTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0) - allExpenseTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);

  const expenseSummary = Object.entries(
    chartTransactions.reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {})
  ).map(([category, total]) => ({ category, total })).sort((a, b) => b.total - a.total);

  // Formatting utilities
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/transactions/${transactionToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Updating UI optimistically
      setTransactions(prev => prev.filter(t => t.id !== transactionToDelete.id));
      
      // Refetch summary since it's easier to keep data consistent
      const summaryRes = await axios.get(`${import.meta.env.VITE_API_URL}/transactions/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSummary(summaryRes.data.byCategory || []);
    } catch (err) {
      console.error("Error deleting transaction", err);
    } finally {
      setIsModalOpen(false);
      setTransactionToDelete(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      {/* Background ambient light */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        
        {/* Floating Header */}
        <header className="flex justify-between items-center mb-12">
          <Logo />
          <div className="flex items-center gap-4">
            <Link 
              to="/transactions/new"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all duration-300 text-sm font-medium cursor-pointer hover:scale-105"
            >
              <Plus size={16} />
              <span>Add Transaction</span>
            </Link>
            <button 
              onClick={logout} 
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-400/50 hover:text-cyan-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300 text-sm font-medium cursor-pointer hover:scale-105"
            >
              <LogOut size={16} /> 
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Column (8 col) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Balance Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Net Balance */}
              <div className="relative bg-zinc-900/40 backdrop-blur-xl rounded-3xl border-t border-l border-white/10 p-6 shadow-[0_20px_40px_rgba(6,182,212,0.05)] overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/3 group-hover:bg-cyan-500/20 transition-all duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Wallet size={16} className="text-cyan-400" />
                      <h2 className="text-xs font-medium tracking-wide uppercase">Net Balance</h2>
                    </div>
                    <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-full px-2 py-0.5 flex items-center gap-1 text-cyan-400 text-[10px] font-medium uppercase tracking-wider">
                      <Activity size={10} />
                      <span>Live</span>
                    </div>
                  </div>
                  <div className="text-3xl font-light text-white tracking-tight">
                    {formatCurrency(netBalance)}
                  </div>
                </div>
              </div>

              {/* Total Income */}
              <div 
                onClick={() => setIsIncomeMonthly(!isIncomeMonthly)}
                className="relative bg-zinc-900/40 backdrop-blur-xl rounded-3xl border-t border-l border-white/10 p-6 shadow-[0_20px_40px_rgba(16,185,129,0.05)] overflow-hidden group cursor-pointer hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/3 group-hover:bg-emerald-500/20 transition-all duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-zinc-400 mb-2">
                    <ArrowUpRight size={16} className="text-emerald-400" />
                    <h2 className="text-xs font-medium tracking-wide uppercase transition-all duration-300">
                      {isIncomeMonthly ? 'Monthly Income' : 'Total Income'}
                    </h2>
                  </div>
                  <div className="text-3xl font-light text-emerald-400 tracking-tight drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-300">
                    +{formatCurrency(totalIncome)}
                  </div>
                </div>
              </div>

              {/* Total Expense */}
              <div 
                onClick={() => setIsExpenseMonthly(!isExpenseMonthly)}
                className="relative bg-zinc-900/40 backdrop-blur-xl rounded-3xl border-t border-l border-white/10 p-6 shadow-[0_20px_40px_rgba(244,63,94,0.05)] overflow-hidden group cursor-pointer hover:border-rose-500/30 hover:shadow-[0_0_20px_rgba(244,63,94,0.15)] transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/3 group-hover:bg-rose-500/20 transition-all duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-zinc-400 mb-2">
                    <ArrowDownRight size={16} className="text-rose-400" />
                    <h2 className="text-xs font-medium tracking-wide uppercase transition-all duration-300">
                      {isExpenseMonthly ? 'Monthly Expense' : 'Total Expense'}
                    </h2>
                  </div>
                  <div className="text-3xl font-light text-rose-400 tracking-tight drop-shadow-[0_0_15px_rgba(244,63,94,0.5)] transition-all duration-300">
                    -{formatCurrency(totalExpense)}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions Card */}
            <div className="bg-zinc-900/40 backdrop-blur-xl rounded-3xl border-t border-l border-white/10 p-8 shadow-[0_20px_40px_rgba(192,132,252,0.05)] flex-grow">
              <h2 className="text-lg font-medium text-white mb-6 tracking-wide">Recent Transactions</h2>
              
              {transactions.length === 0 ? (
                <div className="text-zinc-500 py-8 text-center bg-white/5 rounded-2xl border border-white/5">
                  No transactions found.
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-transparent hover:border-white/10 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full bg-zinc-800/80 text-zinc-400 group-hover:bg-cyan-500/10 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all ${tx.type === 'INCOME' ? 'group-hover:text-emerald-400' : 'group-hover:text-rose-400'}`}>
                          {tx.type === 'INCOME' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                        </div>
                        <div>
                          <p className="text-zinc-200 font-medium">{tx.description}</p>
                          <p className="text-zinc-500 text-sm">{tx.category} &bull; {formatDate(tx.transaction_date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <p className="text-white font-medium">{tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}</p>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Link 
                            to={`/transactions/edit/${tx.id}`}
                            className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)] transition-all"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </Link>
                          <button 
                            onClick={() => {
                              setTransactionToDelete(tx);
                              setIsModalOpen(true);
                            }}
                            className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)] transition-all"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 mt-2 border-t border-white/5 flex justify-center">
                    <Link 
                      to="/history"
                      className="text-cyan-400 hover:text-cyan-300 text-sm font-medium tracking-wide hover:drop-shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all flex items-center gap-2"
                    >
                      View All History &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Side Column (4 col) */}
          <div className="lg:col-span-4 flex flex-col h-full">
            
            {/* Pie Chart Card */}
            <div className="bg-zinc-900/40 backdrop-blur-xl rounded-3xl border-t border-l border-white/10 p-8 shadow-[0_20px_40px_rgba(6,182,212,0.08)] flex-grow flex flex-col items-center">
              <div className="flex items-center justify-between w-full mb-8">
                <h2 className="text-lg font-medium text-white tracking-wide">Expense Distribution</h2>
                <button 
                  onClick={() => setIsChartMonthly(!isChartMonthly)}
                  className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 border cursor-pointer hover:scale-105 ${
                    isChartMonthly 
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:bg-cyan-500/30'
                      : 'bg-purple-500/20 text-purple-300 border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:bg-purple-500/30'
                  }`}
                >
                  {isChartMonthly ? 'Monthly' : 'Total'}
                </button>
              </div>
              
              {expenseSummary && expenseSummary.length > 0 ? (
                <div className="w-full h-64 relative">
                  {/* Subtle glow behind chart */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-500/20 rounded-full blur-[50px] pointer-events-none"></div>
                  
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseSummary}
                        dataKey="total"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        stroke="none"
                        paddingAngle={5}
                      >
                        {expenseSummary.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getColorForCategory(entry.category)} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(24, 24, 27, 0.9)', 
                          borderRadius: '12px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#fff',
                          backdropFilter: 'blur(10px)',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                        }}
                        itemStyle={{ color: '#fff' }}
                        cursor={false}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex-grow flex items-center justify-center text-zinc-500 py-12">
                  <div className="bg-white/5 px-6 py-4 rounded-xl border border-white/5">
                    Insufficient data for chart
                  </div>
                </div>
              )}

              {/* Legend styling */}
              {expenseSummary && expenseSummary.length > 0 && (
                <div className="w-full mt-8 space-y-4">
                  {expenseSummary.map((item, index) => {
                    const color = getColorForCategory(item.category);
                    return (
                      <div key={item.category} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}80` }}></div>
                          <span className="text-zinc-400 capitalize font-medium">{item.category}</span>
                        </div>
                        <span className="text-zinc-200 font-medium">{formatCurrency(item.total)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900/90 border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-[0_0_40px_rgba(244,63,94,0.15)] relative overflow-hidden text-center">
            {/* Modal Internal Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-[60px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="mx-auto w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
              <AlertTriangle size={32} />
            </div>
            
            <h3 className="text-xl font-medium text-white mb-2 tracking-wide">Delete Transaction</h3>
            <p className="text-zinc-400 text-sm mb-8">
              Are you sure you want to delete this transaction for 
              <span className="text-white font-medium mx-1">
                {transactionToDelete ? formatCurrency(transactionToDelete.amount) : ''}
              </span>?
              This action cannot be undone.
            </p>
            
            <div className="flex gap-4 w-full relative z-10">
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setTransactionToDelete(null);
                }}
                className="flex-1 bg-white/5 hover:bg-white/10 text-zinc-300 font-medium py-3 rounded-xl transition-colors border border-white/10"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteConfirm}
                className="flex-1 bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-zinc-950 font-bold py-3 rounded-xl transition-all duration-300 border border-rose-500/50 hover:border-transparent shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:shadow-[0_0_30px_rgba(244,63,94,0.5)]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
