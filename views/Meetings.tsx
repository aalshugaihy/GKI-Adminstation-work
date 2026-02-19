
import React, { useState } from 'react';
import { useApp } from '../App';
import { GoogleGenAI } from "@google/genai";

export default function Meetings() {
  const { t, lang } = useApp();
  const isRtl = lang === 'ar';
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  const generateAiSummary = async (meetingTitle: string) => {
    setIsSummarizing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Summarize this meeting for a professional PMO MoM report. Meeting Title: ${meetingTitle}. Include sections for: Discussion Summary, Key Decisions, and Action Items. Return the response in ${lang === 'ar' ? 'Arabic' : 'English'}.`,
        config: { systemInstruction: "You are a senior PMO consultant specializing in geospatial sector management." }
      });
      setAiSummary(response.text);
    } catch (error) {
      console.error("AI Error:", error);
      setAiSummary("Error generating summary. Please ensure the API Key is valid.");
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{isRtl ? 'الاجتماعات ومحاضر الاجتماع' : 'Meetings & Minutes (MoM)'}</h1>
          <p className="text-slate-500 text-sm">{isRtl ? 'إدارة الإيقاع التشغيلي ومتابعة التوصيات' : 'Manage operating rhythm and tracking follow-up actions'}</p>
        </div>
        <button className="px-4 py-2 bg-[#102f36] text-white rounded-lg text-sm font-medium shadow-sm hover:bg-[#1a4d58] transition-all">
          {isRtl ? 'جدولة اجتماع' : 'Schedule Meeting'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">{isRtl ? 'الاجتماعات الأخيرة والقادمة' : 'Recent & Upcoming Meetings'}</h3>
                <div className="flex items-center gap-2">
                   <button className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                   </button>
                   <button className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                   </button>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                 {[
                   { id: 'm1', title: 'Sector Strategy Alignment Workshop', date: 'May 14, 2024', status: 'Upcoming', type: 'Workshop' },
                   { id: 'm2', title: 'PMO Performance Review', date: 'May 12, 2024', status: 'Minutes Draft', type: 'Review' },
                   { id: 'm3', title: 'Tech Committee Sync', date: 'May 10, 2024', status: 'Approved', type: 'Regular' },
                 ].map((meeting) => (
                   <div key={meeting.id} className="p-6 flex flex-col gap-4 hover:bg-slate-50 transition-colors group">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm bg-slate-100 text-slate-400 group-hover:bg-[#54aac5]/10 group-hover:text-[#54aac5] transition-all`}>
                              {meeting.date.split(' ')[1].replace(',', '')}
                            </div>
                            <div>
                               <h4 className="text-sm font-bold text-slate-800">{meeting.title}</h4>
                               <p className="text-xs text-slate-400">{meeting.date} • {meeting.type}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              meeting.status === 'Upcoming' ? 'bg-blue-100 text-blue-600' : 
                              meeting.status === 'Approved' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                            }`}>{meeting.status}</span>
                            <button 
                              onClick={() => generateAiSummary(meeting.title)}
                              className="p-2 bg-[#54aac5]/10 text-[#54aac5] rounded-xl hover:bg-[#54aac5]/20 border border-[#54aac5]/20"
                              title="Generate AI Summary"
                            >
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </button>
                         </div>
                      </div>
                      
                      {isSummarizing && meeting.title === meeting.title && aiSummary === null && (
                         <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 animate-pulse flex items-center justify-center gap-2">
                           <div className="w-3 h-3 bg-[#54aac5] rounded-full"></div>
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isRtl ? 'جاري تحليل محضر الاجتماع...' : 'AI Analysing Minutes...'}</span>
                         </div>
                      )}

                      {aiSummary && meeting.title === meeting.title && (
                        <div className="p-6 bg-[#102f36] text-white rounded-2xl border border-white/10 shadow-xl relative overflow-hidden animate-fade-in">
                           <div className="flex justify-between items-start mb-4 relative z-10">
                              <h5 className="text-[10px] font-black uppercase tracking-widest text-[#a5f3fc]">{isRtl ? 'ملخص الذكاء الاصطناعي' : 'Smart AI Summary'}</h5>
                              <button onClick={() => setAiSummary(null)} className="text-white/40 hover:text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                           </div>
                           <p className="text-xs leading-relaxed text-white/80 whitespace-pre-wrap relative z-10">
                              {aiSummary}
                           </p>
                           <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                              <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                           </div>
                        </div>
                      )}
                   </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-6">{isRtl ? 'متابعة التوصيات' : 'Action Item Tracking'}</h3>
              <div className="space-y-5">
                 <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">Pending Actions</span>
                    <span className="text-xs font-bold text-slate-800">14</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">Overdue Items</span>
                    <span className="text-xs font-bold text-red-500">3</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">Closed (Month)</span>
                    <span className="text-xs font-bold text-green-500">28</span>
                 </div>
                 <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-4">Priority Actions</h4>
                    <div className="space-y-3">
                       {[1, 2].map(i => (
                         <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-[#54aac5]/30 transition-all cursor-pointer">
                           <p className="text-xs font-semibold text-slate-700 leading-snug">Submit GIS quality framework for committee review</p>
                           <div className="mt-2 flex items-center justify-between text-[10px]">
                              <span className="text-red-500 font-bold">Due Tomorrow</span>
                              <span className="text-slate-400">Owner: Sarah A.</span>
                           </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
