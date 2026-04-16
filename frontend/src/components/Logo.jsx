import React from 'react';
import { ChartCandlestick } from 'lucide-react';

const Logo = ({ as: Component = 'h1', className = '' }) => {
  return (
    <Component className={`flex items-center justify-center gap-3 ${className}`}>
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full blur-sm opacity-25"></div>
        <ChartCandlestick className="relative w-8 h-8 text-cyan-400" />
      </div>
      <span className="font-space-grotesk font-black text-4xl tracking-tighter bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
        Omake
      </span>
    </Component>
  );
};

export default Logo;
