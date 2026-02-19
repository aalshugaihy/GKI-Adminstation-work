
import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { Role, Permission, ModuleName, AuditLog, RoleDefinition, User, RetentionPolicy } from '../types';
import { DEMO_ROLES, DEMO_USERS, DEMO_AUDIT_LOGS, DEMO_RETENTION_POLICIES } from '../constants';

const MODULES: ModuleName[] = ['STRATEGY', 'KNOWLEDGE', 'PROJECTS', 'MEETINGS', 'REPORTS', 'ADMIN'];

export default function Admin() {
  const { lang, t } = useApp();
  const isRtl = lang === 'ar';
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'rbac' | 'audit' | 'governance'>('rbac');
  
  // User Invite State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState(Role.CONTRIBUTOR);

  // Audit Filter State
  const [auditFilterType, setAuditFilterType] = useState<string>('ALL');
  const [auditFilterUser, setAuditFilterUser] = useState<string>('ALL');
  const [auditFilterModule, setAuditFilterModule] = useState<string>('ALL');

  const roles = DEMO_ROLES;
  const perms = Object.values(Permission);

  const filteredLogs = useMemo(() => {
    return DEMO_AUDIT_LOGS.filter(log => {
      const typeMatch = auditFilterType === 'ALL' || log.type === auditFilterType;
      const userMatch = auditFilterUser === 'ALL' || log.userId === auditFilterUser;
      const moduleMatch = auditFilterModule === 'ALL' || log.module === auditFilterModule;
      return typeMatch && userMatch && moduleMatch;
    });
  }, [auditFilterType, auditFilterUser, auditFilterModule]);

  const exportLogs = (format: 'CSV' | 'PDF') => {
    alert(`Generating ${format} export for ${filteredLogs.length} logs...`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{isRtl ? 'مركز الإدارة والحوكمة' : 'Admin & Governance Center'}</h1>
          <p className="text-slate-500 text-sm">{isRtl ? 'إدارة المستخدمين والأدوار وسجلات الأمان' : 'Manage users, role definitions, and security logs'}</p>
        </div>
      </div>

      <div className="flex border-b border-slate-200 overflow-x-auto whitespace-nowrap scrollbar-hide">
        {[
          { id: 'users', label: t.users },
          { id: 'roles', label: t.roles },
          { id: 'rbac', label: t.rbacMatrix },
          { id: 'audit', label: t.auditLogs },
          { id: 'governance', label: t.governance },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === tab.id ? 'border-[#54aac5] text-[#54aac5]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'users' && (
        <div className="space-y-8">
          {/* Pending Approvals Section */}
          <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-amber-50 bg-amber-50/20 flex items-center justify-between">
              <h3 className="font-bold text-amber-800 flex items-center gap-2">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 {t.pendingUsers}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <tbody className="divide-y divide-slate-100">
                  {DEMO_USERS.filter(u => u.status === 'pending').map(user => (
                    <tr key={user.id} className="text-sm">
                      <td className="p-4 font-bold text-slate-700">{user.name}</td>
                      <td className="p-4 text-slate-500">{user.email}</td>
                      <td className="p-4 text-slate-400 italic">{user.role}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <button className="px-4 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-emerald-600 transition-all">{t.approve}</button>
                           <button className="px-4 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-bold hover:bg-red-100 transition-all">{t.reject}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">{t.users}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr className="text-[10px] font-bold text-slate-400 uppercase">
                      <th className="p-4">{isRtl ? 'الاسم' : 'Name'}</th>
                      <th className="p-4">{isRtl ? 'البريد الإلكتروني' : 'Email'}</th>
                      <th className="p-4">{isRtl ? 'الدور' : 'Role'}</th>
                      <th className="p-4">{isRtl ? 'الحالة' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {DEMO_USERS.filter(u => u.status !== 'pending').map(user => (
                      <tr key={user.id} className="text-sm hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-bold text-slate-700">{user.name}</td>
                        <td className="p-4 text-slate-500">{user.email}</td>
                        <td className="p-4 text-slate-600 font-medium italic">{user.role}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                          }`}>{user.status.toUpperCase()}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit space-y-4">
              <h3 className="font-bold text-slate-800">{t.inviteUser}</h3>
              <div className="space-y-4">
                <input 
                  type="email" 
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder={t.invitePlaceholder}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#54aac5] outline-none" 
                />
                <select 
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as Role)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#54aac5] outline-none"
                >
                  {Object.values(Role).map(r => (
                    <option key={r} value={r}>{r.replace('_', ' ')}</option>
                  ))}
                </select>
                <button className="w-full bg-[#102f36] text-white font-bold text-sm py-3 rounded-xl hover:bg-[#1a4d58] transition-all shadow-md">
                  {t.sendInvitation}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800">{t.roles}</h3>
            <button className="px-4 py-2 bg-[#54aac5] text-white rounded-lg text-xs font-bold shadow-md hover:bg-[#4399b4] transition-all">+ Create Custom Role</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map(role => (
              <div key={role.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col hover:border-[#54aac5] transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-slate-800">{isRtl ? role.nameAr : role.nameEn}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{role.id}</p>
                  </div>
                  <button className="text-slate-300 hover:text-[#54aac5] opacity-0 group-hover:opacity-100 transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>Global Access:</span>
                    <span className="text-[#54aac5]">{role.globalPermissions.length} perms</span>
                  </div>
                  <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                    <div className="h-full bg-[#54aac5] w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'rbac' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 mb-2">{t.rbacMatrix}</h3>
              <p className="text-xs text-slate-400">Manage granular permissions across modules.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50">
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100 sticky left-0 bg-slate-50 z-20">Module / Permission</th>
                  {roles.map(role => (
                    <th key={role.id} className="p-4 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100 text-center">{role.id.replace('_', ' ')}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODULES.map(module => (
                  <React.Fragment key={module}>
                    <tr className="bg-slate-50/50">
                      <td colSpan={roles.length + 1} className="p-4 text-xs font-bold text-[#54aac5] bg-[#54aac5]/5 uppercase tracking-widest">{module}</td>
                    </tr>
                    {perms.map(perm => (
                      <tr key={`${module}-${perm}`} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 border-b border-slate-50 text-[10px] font-bold text-slate-600 sticky left-0 bg-white z-10 pl-8">{perm}</td>
                        {roles.map(role => {
                          const has = role.modulePermissions[module]?.includes(perm);
                          return (
                            <td key={`${role.id}-${module}-${perm}`} className="p-4 border-b border-slate-50 text-center">
                              <input 
                                type="checkbox" 
                                defaultChecked={has}
                                className="w-4 h-4 rounded text-[#54aac5] border-slate-300 focus:ring-[#54aac5]" 
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">{t.filterBy} {t.actionType}</label>
              <select 
                value={auditFilterType}
                onChange={e => setAuditFilterType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-[#54aac5]"
              >
                <option value="ALL">All Actions</option>
                <option value="RBAC_CHANGE">RBAC Change</option>
                <option value="DATA_ACCESS">Data Access</option>
                <option value="USER_MANAGEMENT">User Management</option>
                <option value="LOGIN">Login</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">{t.filterBy} Module</label>
              <select 
                value={auditFilterModule}
                onChange={e => setAuditFilterModule(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-[#54aac5]"
              >
                <option value="ALL">All Modules</option>
                {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
                <option value="SYSTEM">SYSTEM</option>
              </select>
            </div>
            <div className="flex gap-2 self-end">
              <button onClick={() => exportLogs('CSV')} className="px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-200">CSV</button>
              <button onClick={() => exportLogs('PDF')} className="px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-200">PDF</button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr className="text-[10px] font-bold text-slate-400 uppercase">
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">User</th>
                    <th className="p-4">Action</th>
                    <th className="p-4">Module</th>
                    <th className="p-4 text-center">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map(log => (
                    <tr key={log.id} className="text-xs hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="p-4 font-bold text-slate-700">{log.userName}</td>
                      <td className="p-4 text-slate-600">{log.action}</td>
                      <td className="p-4"><span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded font-bold">{log.module}</span></td>
                      <td className="p-4 text-center text-slate-400 font-mono">{log.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'governance' && (
        <div className="space-y-8">
           <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">{t.retention}</h3>
                <button className="px-4 py-2 bg-[#102f36] text-white rounded-lg text-xs font-bold shadow-md hover:bg-[#1a4d58] transition-all">+ New Policy</button>
             </div>
             <div className="p-6 space-y-4">
                {DEMO_RETENTION_POLICIES.map(policy => (
                  <div key={policy.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-[#54aac5]/30 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#54aac5]/10 flex items-center justify-center text-[#54aac5]">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{isRtl ? policy.dataTypeAr : policy.dataTypeEn}</p>
                        <p className="text-xs text-slate-400">Retention: {policy.periodMonths} Months • Action: {policy.action}</p>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
