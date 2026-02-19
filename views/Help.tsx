
import React, { useState } from 'react';
import { useApp } from '../App';

export default function Help() {
  const { lang, t } = useApp();
  const isRtl = lang === 'ar';
  const [activeDoc, setActiveDoc] = useState<'user' | 'admin' | 'model' | 'release'>('user');

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">{t.helpCenter}</h1>
        <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed">
          {isRtl 
            ? 'دليل شامل لاستخدام المنصة التشغيلية، فهم نموذج البيانات، وإدارة صلاحيات الوصول المتقدمة.' 
            : 'Comprehensive guide to mastering the operational platform, understanding the data model, and managing advanced access controls.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { id: 'user', label: t.guideUser, color: 'text-blue-600', bg: 'bg-blue-50', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
          { id: 'admin', label: t.guideAdmin, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
          { id: 'model', label: t.dataModel, color: 'text-amber-600', bg: 'bg-amber-50', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4' },
          { id: 'release', label: t.releaseNotes, color: 'text-purple-600', bg: 'bg-purple-50', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
        ].map(item => (
          <button 
            key={item.id} 
            onClick={() => setActiveDoc(item.id as any)}
            className={`bg-white p-6 rounded-2xl border transition-all text-left group ${
              activeDoc === item.id ? 'border-[#54aac5] shadow-lg scale-105 z-10' : 'border-slate-100 shadow-sm opacity-60 grayscale hover:opacity-100 hover:grayscale-0'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl ${item.bg} ${item.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
            </div>
            <h3 className="font-bold text-slate-800 text-sm">{item.label}</h3>
          </button>
        ))}
      </div>

      <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-xl min-h-[500px] animate-fade-in">
         {activeDoc === 'user' && (
           <div className="space-y-8">
              <h2 className="text-2xl font-bold text-slate-800 border-b border-slate-100 pb-4">{t.guideUser}</h2>
              <div className="prose prose-slate max-w-none space-y-4">
                 <p className="text-slate-600 leading-relaxed">
                   {isRtl ? 'أهلاً بك في المنصة الموحدة. تم تصميم هذا النظام ليكون نقطة الاتصال المركزية لكافة التطبيقات التشغيلية.' : 'Welcome to the Unified Platform. This system is designed as the central hub for all operational applications.'}
                 </p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                       <h4 className="font-bold text-[#102f36] mb-2">{isRtl ? 'لوحة القيادة' : 'Dashboard Navigation'}</h4>
                       <p className="text-xs text-slate-500">{isRtl ? 'توفر لوحة القيادة نظرة شاملة على مؤشرات الأداء وصحة المحفظة.' : 'Dashboards provide a macro-view of KPIs and portfolio health.'}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                       <h4 className="font-bold text-[#102f36] mb-2">{isRtl ? 'إدارة المهام' : 'Task Management'}</h4>
                       <p className="text-xs text-slate-500">{isRtl ? 'تتبع التقدم في المشاريع وتعيين المهام في وحدة المشاريع.' : 'Track progress and assign tasks in the Projects module.'}</p>
                    </div>
                 </div>
              </div>
           </div>
         )}
         {activeDoc === 'admin' && (
           <div className="space-y-8">
              <h2 className="text-2xl font-bold text-slate-800 border-b border-slate-100 pb-4">{t.guideAdmin}</h2>
              <div className="space-y-6">
                 <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100">
                    <h4 className="font-bold text-emerald-800 mb-2">{isRtl ? 'إعداد مصفوفة الصلاحيات (RBAC)' : 'RBAC Setup (RBAC)'}</h4>
                    <p className="text-sm text-emerald-700 leading-relaxed">
                       {isRtl 
                         ? 'يتم منح الوصول بناءً على الدور المعين للمستخدم. في مركز الإدارة، يمكنك تحديد الصلاحيات لكل وحدة برمجية.' 
                         : 'Access is granted based on the user\'s role. In the Admin Center, you can define permissions for each software module.'}
                    </p>
                 </div>
                 <ul className="list-disc list-inside space-y-4 text-slate-600">
                    <li>{isRtl ? 'الموافقات: يجب الموافقة على المستخدمين الجدد قبل تمكين الوصول.' : 'Approvals: New users must be approved before access is enabled.'}</li>
                    <li>{isRtl ? 'سجلات المراجعة: تتبع كافة التغييرات الأمنية والحساسة.' : 'Audit Logs: Track all security and sensitive data changes.'}</li>
                 </ul>
              </div>
           </div>
         )}
         {activeDoc === 'model' && (
           <div className="space-y-8">
              <h2 className="text-2xl font-bold text-slate-800 border-b border-slate-100 pb-4">{t.dataModel}</h2>
              <div className="p-8 rounded-2xl bg-[#102f36] text-white">
                 <div className="flex items-center gap-6 overflow-x-auto whitespace-nowrap pb-4">
                    <div className="p-4 rounded-xl bg-white/10 border border-white/20 text-center min-w-[120px]">Strategy</div>
                    <div className="text-slate-500">&rarr;</div>
                    <div className="p-4 rounded-xl bg-white/10 border border-white/20 text-center min-w-[120px]">Objective</div>
                    <div className="text-slate-500">&rarr;</div>
                    <div className="p-4 rounded-xl bg-white/10 border border-white/20 text-center min-w-[120px]">Project</div>
                    <div className="text-slate-500">&rarr;</div>
                    <div className="p-4 rounded-xl bg-white/10 border border-white/20 text-center min-w-[120px]">Knowledge</div>
                 </div>
              </div>
           </div>
         )}
         {activeDoc === 'release' && (
           <div className="space-y-8">
              <h2 className="text-2xl font-bold text-slate-800 border-b border-slate-100 pb-4">{t.releaseNotes}</h2>
              <div className="space-y-6">
                 <div className="flex gap-4">
                    <span className="w-24 shrink-0 font-bold text-[#54aac5]">v2.5.0</span>
                    <div>
                       <h4 className="font-bold text-slate-800">{isRtl ? 'إطلاق نظام الحوكمة المتقدم' : 'Advanced Governance Launch'}</h4>
                       <p className="text-xs text-slate-500 mt-1 italic">Released May 15, 2024</p>
                       <ul className="mt-4 space-y-2 text-sm text-slate-600">
                          <li>- {isRtl ? 'إضافة ميزة استبقاء البيانات والسياسات.' : 'Added data retention feature and policies.'}</li>
                          <li>- {isRtl ? 'تحسين نظام الموافقة على المستخدمين.' : 'Improved user approval workflow.'}</li>
                          <li>- {isRtl ? 'إضافة ميزة إعادة تعيين كلمة المرور.' : 'Added password reset functionality.'}</li>
                       </ul>
                    </div>
                 </div>
              </div>
           </div>
         )}
      </div>
    </div>
  );
}
