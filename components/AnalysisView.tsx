import React, { useState, useEffect } from 'react';
import { PackageData, ShippingOption } from '../types';
import { Truck, DollarSign, Calendar, CheckCircle2, ArrowLeft, PenLine, Share2, Scale } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AnalysisViewProps {
  data: PackageData;
  capturedImage: string;
  onReset: () => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ data, capturedImage, onReset }) => {
  const [description, setDescription] = useState(data.description);
  
  // Format data for chart
  const chartData = data.shippingOptions.map(opt => ({
    name: opt.carrier,
    cost: opt.price,
    days: opt.days
  }));

  useEffect(() => {
    setDescription(data.description);
  }, [data.description]);

  const handleShare = async () => {
    const bestOption = data.shippingOptions[0];
    const volWeight = ((data.length * data.width * data.height) / 5000).toFixed(2);
    
    const shareText = `📦 SmartSend Logistics Analysis\n\n📝 ${description}\n📏 Dims: ${data.length} x ${data.width} x ${data.height} cm\n⚖️ Phys. Weight: ${data.weight} kg\n🧊 Vol. Weight: ${volWeight} kg\n\n🚚 Best Rate: ${bestOption.carrier} ($${bestOption.price} - ${bestOption.days} days)\n\nMeasured with SmartSend AI`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SmartSend Analysis',
          text: shareText,
          url: window.location.href // Note: This URL won't show the specific result unless we persist state, but good for app entry
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        alert("Analysis report copied to clipboard!");
      } catch (err) {
        console.error('Failed to copy');
      }
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 p-2 border border-slate-700 rounded shadow-lg text-xs">
          <p className="font-bold text-white">{label}</p>
          <p className="text-cyan-400">Cost: ${payload[0].value}</p>
          <p className="text-gray-400">Time: {payload[0].payload.days} days</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-900 overflow-y-auto pb-10">
      
      {/* Header Image with AR Visualization */}
      <div className="relative w-full h-[60vh] min-h-[500px] shrink-0 bg-black overflow-hidden group border-b border-slate-800 flex items-center justify-center">
        
        {/* Layer 0: Captured Image - Centered & Fully Visible */}
        <div className="absolute inset-0 flex items-center justify-center z-0 p-4">
            {capturedImage ? (
                <img 
                src={capturedImage} 
                alt="Analyzed Package" 
                className="w-full h-full object-contain" 
                />
            ) : (
                <div className="text-slate-500 flex flex-col items-center">
                    <span className="text-sm">Image not available</span>
                </div>
            )}
        </div>
        
        {/* Layer 1: Gradient Overlays (Top and Bottom only) - Center is CLEAR */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-10"></div>
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent pointer-events-none z-10"></div>

        {/* Layer 2: AR Dimension Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            {/* The Analysis Bounding Box (simulating object boundaries) */}
            <div className="relative w-[75%] h-[65%] border-2 border-dashed border-cyan-400/30 rounded-lg shadow-[0_0_50px_rgba(34,211,238,0.05)]">
                
                {/* Corner Brackets */}
                <div className="absolute -top-px -left-px w-6 h-6 border-t-4 border-l-4 border-cyan-400 rounded-tl-sm shadow-sm"></div>
                <div className="absolute -top-px -right-px w-6 h-6 border-t-4 border-r-4 border-cyan-400 rounded-tr-sm shadow-sm"></div>
                <div className="absolute -bottom-px -left-px w-6 h-6 border-b-4 border-l-4 border-cyan-400 rounded-bl-sm shadow-sm"></div>
                <div className="absolute -bottom-px -right-px w-6 h-6 border-b-4 border-r-4 border-cyan-400 rounded-br-sm shadow-sm"></div>

                {/* SVG Layer for Arrows */}
                <svg className="absolute -inset-20 w-[calc(100%+160px)] h-[calc(100%+160px)] overflow-visible">
                    <defs>
                        <marker id="arrow-end" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
                            <path d="M0,0 L0,6 L9,3 z" fill="#22d3ee" />
                        </marker>
                        <marker id="arrow-start" markerWidth="10" markerHeight="10" refX="1" refY="3" orient="auto">
                            <path d="M9,0 L9,6 L0,3 z" fill="#22d3ee" />
                        </marker>
                    </defs>
                    
                    {/* Horizontal Width Line (Bottom) */}
                    <line 
                        x1="80" y1="calc(100% - 70px)" 
                        x2="calc(100% - 80px)" y2="calc(100% - 70px)" 
                        stroke="#22d3ee" strokeWidth="2" 
                        markerStart="url(#arrow-start)" markerEnd="url(#arrow-end)" 
                        className="drop-shadow-md"
                    />

                    {/* Vertical Height Line (Left) */}
                    <line 
                        x1="70" y1="80" 
                        x2="70" y2="calc(100% - 80px)" 
                        stroke="#22d3ee" strokeWidth="2" 
                        markerStart="url(#arrow-start)" markerEnd="url(#arrow-end)" 
                        className="drop-shadow-md"
                    />

                    {/* Diagonal Length Line (Top Right simulating depth) */}
                    <line 
                        x1="calc(100% - 80px)" y1="80" 
                        x2="calc(100% - 40px)" y2="40" 
                        stroke="#22d3ee" strokeWidth="2" strokeDasharray="4 2"
                        markerEnd="url(#arrow-end)" 
                        className="drop-shadow-md"
                    />
                </svg>

                {/* DIMENSION LABELS */}

                {/* Width Label */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-cyan-500/50 px-3 py-1 rounded-full flex items-center gap-2 shadow-lg z-20 backdrop-blur-sm">
                   <span className="text-[10px] text-cyan-400 font-bold tracking-wider">WIDTH</span>
                   <span className="text-sm text-white font-bold font-mono">{data.width} cm</span>
                </div>

                {/* Height Label */}
                <div className="absolute top-1/2 -left-12 -translate-y-1/2 -rotate-90 bg-slate-900/90 border border-cyan-500/50 px-3 py-1 rounded-full flex items-center gap-2 shadow-lg z-20 backdrop-blur-sm">
                   <span className="text-[10px] text-cyan-400 font-bold tracking-wider">HEIGHT</span>
                   <span className="text-sm text-white font-bold font-mono">{data.height} cm</span>
                </div>

                {/* Length Label */}
                <div className="absolute -top-12 -right-8 bg-slate-900/90 border border-cyan-500/50 px-3 py-1 rounded-full flex items-center gap-2 shadow-lg z-20 backdrop-blur-sm">
                   <span className="text-[10px] text-cyan-400 font-bold tracking-wider">LENGTH</span>
                   <span className="text-sm text-white font-bold font-mono">{data.length} cm</span>
                </div>
                
                 {/* Weight Label (Floating) */}
                 <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-800/90 px-4 py-2 rounded-lg backdrop-blur-md border border-white/20 shadow-xl z-20">
                    <Scale size={18} className="text-yellow-400" />
                    <span className="text-xs text-slate-300 uppercase font-bold">Est. Weight</span>
                    <span className="text-lg font-mono font-bold text-white">{data.weight} kg</span>
                 </div>

            </div>
        </div>
        
        {/* Layer 3: Controls & Inputs */}
        
        {/* Navigation Buttons */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-30">
            <button 
            onClick={onReset}
            className="flex items-center gap-2 bg-black/40 hover:bg-black/60 text-white px-4 py-2 rounded-full text-sm backdrop-blur-md transition border border-white/10 hover:border-white/30"
            >
            <ArrowLeft size={18} /> 
            <span className="font-medium">New Scan</span>
            </button>
            
            <button 
              onClick={handleShare}
              className="p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition border border-white/10 hover:border-white/30 active:scale-95"
            >
                <Share2 size={20} />
            </button>
        </div>

        {/* Bottom Description Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-30 pt-4">
          <div className="flex items-center gap-2 text-cyan-400 mb-2">
            <CheckCircle2 size={16} />
            <span className="text-xs font-bold tracking-widest uppercase shadow-black drop-shadow-md">Analysis Complete</span>
          </div>
          <div className="flex items-center gap-3 group relative max-w-xl">
            <input 
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-transparent text-2xl sm:text-3xl font-bold text-white leading-tight border-b-2 border-transparent hover:border-white/20 focus:border-cyan-400 focus:outline-none transition-all placeholder-slate-500 pb-2 drop-shadow-lg"
            />
            <PenLine size={20} className="text-slate-400 opacity-50 group-hover:opacity-100 transition-opacity absolute right-0 top-2 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="px-6 space-y-8 mt-6 relative z-10">
        
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
             <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/50 shadow-lg flex flex-col items-center justify-center text-center">
                <span className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Volume</span>
                <span className="text-xl font-bold text-white font-mono">
                  {((data.length * data.width * data.height) / 1000).toFixed(2)} L
                </span>
             </div>
             <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/50 shadow-lg flex flex-col items-center justify-center text-center">
                <span className="text-xs text-gray-400 uppercase tracking-wide mb-1">Volumetric Weight</span>
                <span className="text-xl font-bold text-white font-mono">
                  {((data.length * data.width * data.height) / 5000).toFixed(2)} kg
                </span>
             </div>
        </div>

        {/* Shipping Options */}
        <div className="bg-slate-800 rounded-xl p-5 shadow-lg border border-slate-700/50">
          <div className="flex items-center gap-2 mb-4 text-gray-300">
            <Truck size={20} className="text-cyan-400" />
            <h3 className="font-semibold">Shipping Rates</h3>
          </div>

          <div className="space-y-3">
            {data.shippingOptions.map((option, idx) => (
              <div key={idx} className="flex items-center justify-between bg-slate-700/30 p-3 rounded-lg hover:bg-slate-700/50 transition border border-transparent hover:border-cyan-500/30 cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ${idx === 0 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                    {option.carrier.substring(0, 1)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{option.carrier} <span className="text-gray-400 font-normal">- {option.name}</span></p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <Calendar size={12} /> {option.days} Days Delivery
                    </p>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-lg font-bold text-cyan-400 flex items-center">
                     <DollarSign size={16} />{option.price}
                   </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Comparison Chart */}
        <div className="bg-slate-800 rounded-xl p-5 shadow-lg border border-slate-700/50 h-64">
          <div className="flex items-center gap-2 mb-4 text-gray-300">
            <DollarSign size={20} className="text-cyan-400" />
            <h3 className="font-semibold">Cost Comparison</h3>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#94a3b8', fontSize: 10 }} 
                axisLine={false} 
                tickLine={false}
              />
              <YAxis 
                hide 
              />
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
              <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#22d3ee' : '#334155'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};