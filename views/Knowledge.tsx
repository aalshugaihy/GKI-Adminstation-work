
import React from 'react';
import { useApp } from '../App';

export default function Knowledge() {
  const { t, lang } = useApp();
  const isRtl = lang === 'ar';

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{isRtl ? 'استوديو إنتاج المعرفة' : 'Knowledge Production Studio'}</h1>
          <p className="text-slate-500 text-sm">{isRtl ? 'إدارة محتوى البحوث والتقارير والبيانات' : 'Manage research content, reports, and geospatial assets'}</p>
        </div>
        <button className="px-4 py-2 bg-[#102f36] text-white rounded-lg text-sm font-medium shadow-sm hover:bg-[#1a4d58]">
          {isRtl ? 'إنشاء مسودة جديدة' : 'Create New Brief'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Reports', value: '12', trend: '+2 this week' },
          { label: 'Infographics', value: '45', trend: '+5 this week' },
          { label: 'Research Papers', value: '8', trend: 'Stable' },
          { label: 'Datasets', value: '156', trend: '+12 this month' },
        ].map(stat => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            <p className="text-[10px] text-green-500 font-bold mt-2">{stat.trend}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800">{isRtl ? 'مسار إنتاج المحتوى' : 'Content Production Workflow'}</h2>
          <div className="flex gap-2">
             <button className="px-3 py-1 bg-slate-100 rounded-md text-[10px] font-bold text-slate-500">Filter: All Topics</button>
             <button className="px-3 py-1 bg-slate-100 rounded-md text-[10px] font-bold text-slate-500">Sort: Latest</button>
          </div>
        </div>
        <div className="p-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['Briefing', 'Review', 'Approved'].map(stage => (
                <div key={stage} className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">{stage}</span>
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] flex items-center justify-center font-bold">
                      {stage === 'Briefing' ? '4' : stage === 'Review' ? '2' : '1'}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {[1, 2].map(i => (
                      <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-center gap-2 mb-2">
                           <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-600 font-bold uppercase">Report</span>
                           <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-500 font-bold uppercase">v1.2</span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-700 leading-snug">Geospatial Trends Analysis 2024 - Saudi Vision 2030 Impact</h5>
                        <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                           <div className="flex -space-x-2">
                              <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-300"></div>
                              <div className="w-6 h-6 rounded-full border-2 border-white bg-[#54aac5]"></div>
                           </div>
                           <span className="text-[10px] text-slate-400">Due in 3d</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
