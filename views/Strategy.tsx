
import React from 'react';
import { useApp } from '../App';
import { DEMO_KPIs } from '../constants';

export default function Strategy() {
  const { t, lang } = useApp();
  const isRtl = lang === 'ar';

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{isRtl ? 'الاستراتيجية والتنفيذ' : 'Strategy & Execution'}</h1>
          <p className="text-slate-500 text-sm">{isRtl ? 'تتبع المحاور والأهداف الاستراتيجية' : 'Track strategic themes and objectives alignment'}</p>
        </div>
        <button className="px-4 py-2 bg-[#102f36] text-white rounded-lg text-sm font-medium shadow-sm hover:bg-[#1a4d58]">
          {isRtl ? 'تحديث المستهدفات' : 'Update Targets'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
             <h2 className="font-bold text-slate-800 mb-6">{isRtl ? 'الأهداف الاستراتيجية' : 'Strategic Objectives'}</h2>
             <div className="space-y-6">
                {[
                  { titleEn: 'Digital Geospatial Transformation', titleAr: 'التحول الجيومكاني الرقمي', progress: 78, color: 'bg-blue-500' },
                  { titleEn: 'Enhancing Spatial Innovation', titleAr: 'تعزيز الابتكار المكاني', progress: 45, color: 'bg-[#74b68c]' },
                  { titleEn: 'Operational Excellence', titleAr: 'التميز التشغيلي', progress: 92, color: 'bg-emerald-500' },
                ].map(obj => (
                  <div key={obj.titleEn} className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors bg-slate-50/30">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{isRtl ? obj.titleAr : obj.titleEn}</h4>
                        <p className="text-[10px] text-slate-400 mt-1">Goal: Q4 2024 • Owner: Sector Governance</p>
                      </div>
                      <span className="text-xs font-bold text-[#102f36] bg-[#54aac5]/10 px-2 py-1 rounded">{obj.progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${obj.color} rounded-full`} style={{ width: `${obj.progress}%` }}></div>
                    </div>
                    <div className="mt-4 flex gap-4 text-[10px] font-bold text-slate-400 uppercase">
                      <span>4 Initiatives</span>
                      <span>12 KPIs</span>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
             <h2 className="font-bold text-slate-800 mb-6">{isRtl ? 'المخاطر الرئيسية' : 'Key Strategic Risks'}</h2>
             <div className="space-y-4">
                {[
                  { level: 'High', msg: 'Data acquisition delays from external partners', color: 'text-red-600 bg-red-50' },
                  { level: 'Medium', msg: 'Technical resource gap in AI modeling', color: 'text-amber-600 bg-amber-50' },
                  { level: 'Low', msg: 'Budget reallocation for Phase 3', color: 'text-blue-600 bg-blue-50' },
                ].map((risk, i) => (
                  <div key={i} className="flex gap-3">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold h-fit ${risk.color}`}>{risk.level}</span>
                    <p className="text-xs text-slate-600 leading-relaxed">{risk.msg}</p>
                  </div>
                ))}
             </div>
           </div>

           <div className="bg-[#102f36] p-6 rounded-2xl shadow-xl text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2">{isRtl ? 'التقرير الشهري' : 'Monthly Performance Report'}</h3>
                <p className="text-xs opacity-70 mb-6">Generated on May 12, 2024</p>
                <button className="w-full py-2 bg-[#54aac5] text-white rounded-lg text-sm font-bold hover:bg-[#4399b4] transition-colors">
                  Download Executive Pack
                </button>
              </div>
              {/* Geospatial Motif Overlay */}
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
