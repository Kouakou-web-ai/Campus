import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white text-xs rounded-xl p-3 shadow-xl border border-slate-700">
      <p className="font-semibold mb-2 text-slate-300">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="font-bold">{p.value.toLocaleString('fr-FR')} FCFA</span>
        </div>
      ))}
    </div>
  );
};

export default function DashboardChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="recettesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis 
          tick={{ fontSize: 11, fill: '#94a3b8' }} 
          axisLine={false} 
          tickLine={false} 
          tickFormatter={v => `${(v/1000).toLocaleString('fr-FR')} k`} 
        />
        <Tooltip content={<CustomTooltip />} />
        <Area 
          type="monotone" 
          dataKey="recettes" 
          name="Recettes" 
          stroke="#6366f1" 
          strokeWidth={2.5} 
          fill="url(#recettesGrad)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
