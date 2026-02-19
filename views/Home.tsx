
import React, { useMemo } from 'react';
import { useApp } from '../App';
import { DEMO_KPIs, DEMO_PROJECTS } from '../constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 900 },
];

const healthTrendData = [
  { month: 'Dec', onTrack: 10, atRisk: 4, offTrack: 2 },
  { month: 'Jan', onTrack: 12, atRisk: 3, offTrack: 2 },
  { month: 'Feb', onTrack: 11, atRisk: 5, offTrack: 1 },
  { month: 'Mar', onTrack: 14, atRisk: 2, offTrack: 1 },
  { month: 'Apr', onTrack: 13, atRisk: 4, offTrack: 2 },
  { month: 'May', onTrack: 12, atRisk: 5, offTrack: 2 },
];

export default function Home() {
  const { t, lang } = useApp();
  const isRtl = lang === 'ar';

  // Notification Engine Logic: Identify overdue tasks across portfolio
  const overdueAlerts = useMemo(() => {
    const alerts: any[] = [];
    DEMO_PROJECTS.forEach(p => {
      const overdueTasks = p.tasks.filter(task => {
        if (task.status === 'done' || !task.dueDate) return false;
        return new Date(task.dueDate) < new Date();
      });
      if (overdueTasks.length > 0) {
        alerts.push({
          projectName: p.name,
          count: overdueTasks.length,
          id: p.id
        });
      }
    });
    return alerts;
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome & Global Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t.operatingCockpit}</h1>
          <p className="text-slate-500 text-sm">{isRtl ? 'نظرة عامة على الأداء التشغيلي للقطاع' : 'Overview of the sector\'s operational performance'}</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#54aac5]">
            <option>Q1 2024</option>
            <option>Q2 2024</option>
            <option>Q3 2024</option>
            <option>Q4 2024</option>
          </select>
          <button className="px-4 py-2 bg-[#102f36] text-white rounded-lg text-sm font-medium shadow-sm hover:bg-[#1a4d58] transition-colors">
            {t.export}
          </button>
        </div>
      </div>

      {/* Notification Engine Panel */}
      {overdueAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-100 p-6 rounded-[2rem] flex items-center justify-between gap-6 animate-pulse">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500 text-white flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <div>
                 <h3 className="font-bold text-red-800 text-sm">{isRtl ? 'تنبيه مهام متأخرة' : 'Overdue Task Alert'}</h3>
                 <p className="text-xs text-red-600">{isRtl ? `هناك مهام متأخرة في ${overdueAlerts.length} مشروعاً تتطلب تدخلاً فورياً.` : `There are overdue tasks in ${overdueAlerts.length} projects requiring immediate intervention.`}</p>
              </div>
           </div>
           <div className="flex gap-2">
              {overdueAlerts.slice(0, 2).map(alert => (
                <div key={alert.id} className="hidden lg:flex px-4 py-2 bg-white/50 border border-red-200 rounded-xl text-[10px] font-bold text-red-700 whitespace-nowrap">
                  {alert.projectName}: {alert.count}
                </div>
              ))}
           </div>
        </div>
      )}

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {DEMO_KPIs.map((kpi) => (
          <div key={kpi.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{kpi.name}</h3>
              <div className={`p-1.5 rounded-lg ${
                kpi.status === 'on-track' ? 'bg-green-50 text-green-600' : 
                kpi.status === 'at-risk' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
              }`}>
                {kpi.trend === 'up' ? (
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                ) : (
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" /></svg>
                )}
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-slate-800">{kpi.actual}{kpi.unit}</span>
              <span className="text-xs text-slate-400 mb-1.5">/ {kpi.target}{kpi.unit} Target</span>
            </div>
            <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  kpi.status === 'on-track' ? 'bg-green-500' : 
                  kpi.status === 'at-risk' ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min((kpi.actual / kpi.target) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-bold text-slate-800">{t.kpiHealth}</h2>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#54aac5]"></span> Actual</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-200"></span> Forecast</div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#54aac5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#54aac5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="value" stroke="#54aac5" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h2 className="font-bold text-slate-800 mb-6">{t.portfolioHealth}</h2>
          <div className="space-y-6 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{t.onTrack}</p>
                  <p className="text-xs text-slate-400">12 Projects</p>
                </div>
              </div>
              <span className="text-lg font-bold text-slate-800">65%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{t.atRisk}</p>
                  <p className="text-xs text-slate-400">5 Projects</p>
                </div>
              </div>
              <span className="text-lg font-bold text-slate-800">25%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{t.offTrack}</p>
                  <p className="text-xs text-slate-400">2 Projects</p>
                </div>
              </div>
              <span className="text-lg font-bold text-slate-800">10%</span>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">{isRtl ? 'المشروعات العاجلة' : 'Critical Portfolio Overdue'}</h3>
              <div className="space-y-4">
                {DEMO_PROJECTS.filter(p => p.health !== 'on-track').map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 cursor-pointer">
                    <span className="text-xs font-bold text-slate-700 truncate w-32">{p.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-black uppercase tracking-tighter">Action Required</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
