
import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';

const chartData = [
  { name: 'On Track', value: 12, color: '#10b981', healthKey: 'on-track' },
  { name: 'At Risk', value: 5, color: '#f59e0b', healthKey: 'at-risk' },
  { name: 'Off Track', value: 2, color: '#ef4444', healthKey: 'off-track' },
];

const throughputData = [
  { m: 'Jan', val: 24, completed: 15, pending: 9 },
  { m: 'Feb', val: 18, completed: 10, pending: 8 },
  { m: 'Mar', val: 32, completed: 25, pending: 7 },
  { m: 'Apr', val: 28, completed: 20, pending: 8 },
  { m: 'May', val: 35, completed: 30, pending: 5 },
];

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#102f36" className="font-bold text-lg">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 12}
        fill={fill}
      />
    </g>
  );
};

export default function Reports() {
  const { lang, t } = useApp();
  const isRtl = lang === 'ar';
  const navigate = useNavigate();

  // States
  const [activePieIndex, setActivePieIndex] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  // AI Strategic Analyst Implementation
  const runAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Perform a high-level strategic risk analysis based on the following project distribution: 
        On Track: 12 projects, 
        At Risk: 5 projects, 
        Off Track: 2 projects. 
        Provide 3 key strategic recommendations for the Sector Admin to mitigate portfolio risk. 
        Keep it concise and professional. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { systemInstruction: "You are a world-class strategic portfolio consultant with 20 years of experience in governmental operations." }
      });
      setAiAnalysis(response.text);
    } catch (e) {
      setAiAnalysis("Analysis unavailable. Verify API connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{isRtl ? 'التقارير والتحليلات الاستشارية' : 'Strategic Reports & Analytics'}</h1>
          <p className="text-slate-500 text-sm">{isRtl ? 'بناء تقارير مخصصة وتحليلات مدعومة بالذكاء الاصطناعي' : 'Custom report builder and AI-driven portfolio insights'}</p>
        </div>
        <div className="flex gap-3">
           <button 
             onClick={runAiAnalysis}
             className="px-4 py-2 bg-[#102f36] text-[#a5f3fc] border border-white/10 rounded-xl text-sm font-black uppercase tracking-widest shadow-xl hover:bg-[#1a4d58] transition-all flex items-center gap-2 group"
           >
              <svg className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : 'group-hover:rotate-45 transition-transform'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              {isRtl ? 'تحليل ذكي' : 'AI Strategic Insight'}
           </button>
           <button className="px-4 py-2 bg-white text-slate-800 border border-slate-200 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all">
            {t.export}
           </button>
        </div>
      </div>

      {aiAnalysis && (
        <div className="bg-[#102f36] p-10 rounded-[3rem] text-white border border-white/10 shadow-2xl relative overflow-hidden animate-fade-in group">
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#54aac5] flex items-center justify-center text-white shadow-lg">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h3 className="text-lg font-bold tracking-tight">{isRtl ? 'توصيات المحلل الاستراتيجي الذكي' : 'Smart Strategic Analyst Recommendations'}</h3>
              </div>
              <p className="text-sm leading-relaxed text-white/80 whitespace-pre-wrap">
                {aiAnalysis}
              </p>
           </div>
           <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
              <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <h3 className="font-bold text-slate-800 mb-8">{isRtl ? 'توزيع حالة المشاريع' : 'Project Status Distribution'}</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activePieIndex}
                    activeShape={renderActiveShape}
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    onMouseEnter={(_, idx) => setActivePieIndex(idx)}
                    style={{ cursor: 'pointer' }}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
            <h3 className="font-bold text-slate-800 mb-8">{isRtl ? 'الإنتاجية الشهرية' : 'Monthly Throughput'}</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={throughputData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip cursor={{fill: '#f8fafc', radius: 4}} />
                  <Bar dataKey="val" fill="#54aac5" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
}
