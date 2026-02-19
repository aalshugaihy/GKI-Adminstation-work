
import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Language, User, Role, Permission, ModuleName } from './types';
import { NAVIGATION, TRANSLATIONS, COLORS, DEMO_ROLES, DEMO_USERS, DEMO_PROJECTS } from './constants';
import Home from './views/Home';
import Strategy from './views/Strategy';
import Knowledge from './views/Knowledge';
import Projects from './views/Projects';
import Meetings from './views/Meetings';
import Reports from './views/Reports';
import Admin from './views/Admin';
import Help from './views/Help';

// --- Contexts ---
interface AppContextType {
  lang: Language;
  setLang: (l: Language) => void;
  user: User | null;
  setUser: (u: User | null) => void;
  t: any;
  hasPermission: (perm: Permission, module?: ModuleName) => boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

// --- RBAC Wrapper ---
const ProtectedRoute: React.FC<{ children: React.ReactNode, module?: ModuleName, permission?: Permission }> = ({ children, module, permission }) => {
  const { hasPermission, t } = useApp();
  
  if (module && !hasPermission(permission || Permission.VIEW, module)) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-12 animate-fade-in">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0-6V9m0 12a9 9 0 110-18 9 9 0 010 18z" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">{t.accessDenied}</h2>
        <p className="text-slate-500 max-w-md">{t.accessDeniedDesc}</p>
      </div>
    );
  }
  return <>{children}</>;
};

// --- Login View ---
const Login: React.FC = () => {
  const { t, setUser } = useApp();
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setUser(DEMO_USERS[0]); // Hardcoded for demo
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Reset link sent to ${email}`);
    setView('login');
  };

  return (
    <div className="min-h-screen geospatial-bg flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-8 space-y-8 animate-fade-in">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#54aac5]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#54aac5]/20">
             <svg className="w-8 h-8 text-[#54aac5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
          </div>
          <h1 className="text-xl font-bold text-slate-800">{view === 'login' ? t.login : t.resetPassTitle}</h1>
          <p className="text-sm text-slate-500 mt-2">{view === 'forgot' ? t.resetPassDesc : ''}</p>
        </div>

        <form onSubmit={view === 'login' ? handleLogin : handleForgot} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">{t.email}</label>
            <input 
              required
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#54aac5] outline-none transition-all" 
              placeholder="user@sector.gov.sa"
            />
          </div>

          {view === 'login' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">{t.password}</label>
              <input 
                required
                type="password" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#54aac5] outline-none transition-all" 
                placeholder="••••••••"
              />
            </div>
          )}

          <button className="w-full py-4 bg-[#102f36] text-white rounded-xl font-bold text-sm shadow-xl hover:bg-[#1a4d58] transition-all">
            {view === 'login' ? t.login : t.save}
          </button>

          <div className="text-center">
            <button 
              type="button"
              onClick={() => setView(view === 'login' ? 'forgot' : 'login')}
              className="text-xs font-bold text-[#54aac5] hover:underline"
            >
              {view === 'login' ? t.forgotPassword : t.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main Layout ---
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { lang, setLang, t, user, setUser, hasPermission, searchQuery, setSearchQuery } = useApp();
  const location = useLocation();
  const isRtl = lang === 'ar';

  const toggleLang = () => setLang(lang === 'en' ? 'ar' : 'en');

  const visibleNav = useMemo(() => {
    return NAVIGATION.filter(item => {
      if (!item.requiredModule) return true;
      return hasPermission(item.requiredPermission || Permission.VIEW, item.requiredModule);
    });
  }, [hasPermission]);

  // Global search implementation: searching across projects and potentially more
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    
    // Search projects
    const projects = DEMO_PROJECTS.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.owner.toLowerCase().includes(q)
    ).map(p => ({ ...p, type: 'Project' }));

    // Mock search for Knowledge/Strategy for demo completeness
    const extras = [
      { id: 'ext1', name: 'Strategic Alignment Report 2024', type: 'Knowledge', health: 'on-track' },
      { id: 'ext2', name: 'Geospatial Sector KPIs v3.1', type: 'Strategy', health: 'on-track' }
    ].filter(e => e.name.toLowerCase().includes(q));

    return [...projects, ...extras];
  }, [searchQuery]);

  if (!user) return <Login />;

  return (
    <div className={`min-h-screen flex ${isRtl ? 'rtl text-right' : 'text-left'} bg-slate-50`}>
      <aside className="w-64 geospatial-bg text-white flex-shrink-0 transition-all duration-300 hidden md:flex flex-col border-r border-slate-700/50 sticky top-0 h-screen overflow-y-auto z-30 shadow-2xl">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
              <svg className="w-6 h-6 text-[#54aac5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
            </div>
            <div>
              <h1 className="text-xs font-bold leading-tight opacity-90">{t.title}</h1>
              <p className="text-[10px] opacity-60 mt-0.5">{t.subtitle}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {visibleNav.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              const label = isRtl ? item.labelAr : item.labelEn;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  title={label} // Browser-native tooltip
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group/nav ${
                    isActive 
                      ? 'bg-white/10 text-white shadow-lg border border-white/10' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={item.icon} /></svg>
                  <span className="text-sm font-medium transition-opacity duration-300">{label}</span>
                  
                  {/* Floating Custom Tooltip (Aesthetic alternative to native title) */}
                  <div className={`absolute ${isRtl ? 'right-full mr-3' : 'left-full ml-3'} top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 pointer-events-none group-hover/nav:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-xl border border-white/10`}>
                    {label}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-white/5">
          <button 
            onClick={() => setUser(null)}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-red-900/20 transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-full bg-[#74b68c] flex items-center justify-center text-white text-xs font-bold shadow-inner group-hover:bg-red-500">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-medium truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate tracking-wide">{t.logout}</p>
            </div>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20 flex-shrink-0 shadow-sm relative">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-slate-800 font-bold text-lg hidden lg:block">
              {NAVIGATION.find(n => n.path === location.pathname)?.[isRtl ? 'labelAr' : 'labelEn'] || t.operatingCockpit}
            </h2>
            
            {/* Functional Global Search implementation */}
            <div className="max-w-md w-full ml-4 relative">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
               </div>
               <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.search}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#54aac5] transition-all"
               />
               
               {/* Search Results Dropdown */}
               {searchQuery.trim() && (
                 <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-fade-in max-h-[400px] overflow-y-auto">
                    <div className="p-3 bg-slate-50/50 border-b border-slate-100">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.searchResults || 'Search Results'}</p>
                    </div>
                    {searchResults.length > 0 ? (
                      <div className="divide-y divide-slate-50">
                        {searchResults.map((res: any) => (
                           <Link 
                             to={res.type === 'Project' ? '/projects' : '/'} 
                             key={res.id} 
                             onClick={() => setSearchQuery('')}
                             className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
                           >
                              <div className="flex items-center gap-3">
                                 <div className={`w-2 h-2 rounded-full ${res.health === 'on-track' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                 <div>
                                    <p className="text-sm font-bold text-slate-700 group-hover:text-[#54aac5]">{res.name}</p>
                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">{res.type}</p>
                                 </div>
                              </div>
                              <svg className="w-4 h-4 text-slate-300 group-hover:text-[#54aac5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                           </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                         <p className="text-sm text-slate-400 italic">No matches for "{searchQuery}"</p>
                      </div>
                    )}
                 </div>
               )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleLang}
              className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold hover:bg-slate-100 transition-all flex items-center gap-2 text-slate-700 shadow-sm"
            >
              <svg className="w-4 h-4 text-[#54aac5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
              {t.languageName}
            </button>

            <button className="p-2.5 text-slate-400 hover:text-[#54aac5] rounded-xl hover:bg-slate-50 relative border border-transparent hover:border-slate-100 transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-[#54aac5] rounded-full border-2 border-white"></span>
            </button>

            <div className="h-8 w-[1px] bg-slate-200 mx-1"></div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 shadow-inner">
                <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/50 relative">
          {children}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('lang') as Language) || 'en');
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const hasPermission = (perm: Permission, module?: ModuleName): boolean => {
    if (!user) return false;
    const roleDef = DEMO_ROLES.find(r => r.id === user.role);
    if (!roleDef) return false;
    if (user.role === Role.SUPER_ADMIN) return true;
    
    if (module) {
      return roleDef.modulePermissions[module]?.includes(perm) || false;
    }
    return roleDef.globalPermissions.includes(perm);
  };

  const t = useMemo(() => TRANSLATIONS[lang], [lang]);

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, user, setUser, t, hasPermission, searchQuery, setSearchQuery }), [lang, user, t, hasPermission, searchQuery]);

  return (
    <AppContext.Provider value={value}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/strategy" element={<ProtectedRoute module="STRATEGY"><Strategy /></ProtectedRoute>} />
            <Route path="/knowledge" element={<ProtectedRoute module="KNOWLEDGE"><Knowledge /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute module="PROJECTS"><Projects /></ProtectedRoute>} />
            <Route path="/meetings" element={<ProtectedRoute module="MEETINGS"><Meetings /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute module="REPORTS"><Reports /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute module="ADMIN"><Admin /></ProtectedRoute>} />
            <Route path="/help" element={<Help />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </Router>
    </AppContext.Provider>
  );
}
