
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useApp } from '../App';
import { DEMO_PROJECTS } from '../constants';
import { Project, Task, ProjectRisk, ProjectBaseline } from '../types';

export default function Projects() {
  const { t, lang } = useApp();
  const isRtl = lang === 'ar';
  
  // View Control State
  const [viewMode, setViewMode] = useState<'list' | 'gantt'>('gantt');
  const [zoomScale, setZoomScale] = useState<'week' | 'month' | 'year'>('month');
  const [zoomLevel, setZoomLevel] = useState(1); 
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [collapsedProjects, setCollapsedProjects] = useState<Set<string>>(new Set());
  
  // Global Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterHealth, setFilterHealth] = useState<'ALL' | 'on-track' | 'at-risk' | 'off-track'>('ALL');
  
  // Task Specific Controls for Details Modal
  const [taskFilters, setTaskFilters] = useState({
    assignee: 'ALL',
    status: 'ALL',
    sortBy: 'dueDate',
    sortDir: 'asc' as 'asc' | 'desc'
  });

  // Local interactive state
  const [localProjects, setLocalProjects] = useState<Project[]>(() => 
    DEMO_PROJECTS.map(p => ({
      ...p,
      baseline: p.baseline || { 
        startDate: p.startDate, 
        endDate: p.endDate, 
        budgetEn: p.budgetEn, 
        budgetAr: p.budgetAr, 
        progress: 0,
        timestamp: new Date().toISOString()
      },
      tasks: p.tasks.map(task => ({
        ...task,
        startDate: task.startDate || p.startDate,
        dueDate: task.dueDate || p.endDate,
        dependencies: task.dependencies || []
      }))
    }))
  );

  // --- REFINED Automated Health Engine (Auditable Logic) ---
  const calculateHealth = useCallback((project: Project): 'on-track' | 'at-risk' | 'off-track' => {
    const today = new Date();
    const tasks = project.tasks;
    
    // 1. Overdue Tasks Percentage
    const overdueCount = tasks.filter(t => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < today).length;
    const overduePercent = tasks.length > 0 ? (overdueCount / tasks.length) * 100 : 0;
    
    // 2. Schedule Slippage against Baseline
    const currentEnd = new Date(project.endDate);
    const baselineEnd = new Date(project.baseline?.endDate || project.endDate);
    const slippageDays = (currentEnd.getTime() - baselineEnd.getTime()) / (1000 * 3600 * 24);

    // 3. Progress Deviation
    const start = new Date(project.startDate);
    const totalDuration = currentEnd.getTime() - start.getTime();
    const elapsed = today.getTime() - start.getTime();
    const expectedProgress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
    const progressDeviation = expectedProgress - project.progress;

    // Logic Tree (Auditable Thresholds)
    if (overduePercent > 20 || slippageDays > 14 || progressDeviation > 25) {
      return 'off-track';
    }
    if (overduePercent > 5 || slippageDays > 3 || progressDeviation > 10) {
      return 'at-risk';
    }
    return 'on-track';
  }, []);

  // Sync health on mount or when projects change
  useEffect(() => {
    setLocalProjects(prev => prev.map(p => {
      const h = calculateHealth(p);
      return p.health !== h ? { ...p, health: h } : p;
    }));
  }, [calculateHealth]);

  // --- Gantt Visualization Logic ---
  const getGanttStyle = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timelineStart = new Date('2024-01-01');
    const timelineEnd = new Date('2024-12-31');
    
    const totalDays = (timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 3600 * 24);
    const startOffset = (start.getTime() - timelineStart.getTime()) / (1000 * 3600 * 24);
    const duration = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);

    let left = (startOffset / totalDays) * 100;
    let width = (duration / totalDays) * 100;

    let multiplier = 1;
    if (zoomScale === 'week') multiplier = 4;
    if (zoomScale === 'year') multiplier = 0.4;

    return {
      left: `${Math.max(0, left * multiplier * zoomLevel)}%`,
      width: `${Math.max(0.5, width * multiplier * zoomLevel)}%`
    };
  };

  // Drag & Drop Rescheduling Implementation
  const handleDragStart = (e: React.DragEvent, taskId: string, projectId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.setData('projectId', projectId);
  };

  const handleDrop = (e: React.DragEvent, targetProjectId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const sourceProjectId = e.dataTransfer.getData('projectId');

    if (sourceProjectId !== targetProjectId) return;

    // Simplified rescheduling logic: Shift task 7 days forward on drop for demo
    setLocalProjects(prev => prev.map(p => {
      if (p.id === targetProjectId) {
        return {
          ...p,
          tasks: p.tasks.map(t => {
            if (t.id === taskId) {
              const newStart = new Date(t.startDate || p.startDate);
              const newDue = new Date(t.dueDate || p.endDate);
              newStart.setDate(newStart.getDate() + 7);
              newDue.setDate(newDue.getDate() + 7);
              return { 
                ...t, 
                startDate: newStart.toISOString().split('T')[0],
                dueDate: newDue.toISOString().split('T')[0]
              };
            }
            return t;
          })
        };
      }
      return p;
    }));
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'on-track': return 'bg-emerald-500';
      case 'at-risk': return 'bg-amber-500';
      case 'off-track': return 'bg-red-500';
      default: return 'bg-slate-300';
    }
  };

  const filteredProjects = useMemo(() => {
    return localProjects
      .filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesHealth = filterHealth === 'ALL' || p.health === filterHealth;
        return matchesSearch && matchesHealth;
      });
  }, [localProjects, searchQuery, filterHealth]);

  // Task filtering for the detailed modal
  const getFilteredTasks = (project: Project) => {
    let list = [...project.tasks].filter(t => {
      const matchStatus = taskFilters.status === 'ALL' || t.status === taskFilters.status;
      const matchAssignee = taskFilters.assignee === 'ALL' || t.assignee === taskFilters.assignee;
      return matchStatus && matchAssignee;
    });

    return list.sort((a, b) => {
      let comparison = 0;
      if (taskFilters.sortBy === 'dueDate') {
        comparison = (a.dueDate || '').localeCompare(b.dueDate || '');
      } else {
        comparison = a.status.localeCompare(b.status);
      }
      return taskFilters.sortDir === 'asc' ? comparison : -comparison;
    });
  };

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-full relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{isRtl ? 'محرك إدارة المشاريع المتكامل' : 'Unified Projects Engine'}</h1>
          <p className="text-slate-500 text-sm">{isRtl ? 'تحليل التباين، أتمتة الصحة، والتبعيات المتقدمة' : 'Variance analysis, health automation, and advanced dependencies'}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
             <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow text-[#54aac5]' : 'text-slate-400'}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg></button>
             <button onClick={() => setViewMode('gantt')} className={`p-2 rounded-lg transition-all ${viewMode === 'gantt' ? 'bg-white shadow text-[#54aac5]' : 'text-slate-400'}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></button>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="px-5 py-2.5 bg-[#102f36] text-white rounded-xl text-sm font-bold shadow-lg flex items-center gap-2 hover:bg-[#1a4d58] transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            {t.addNewProject}
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap items-center gap-6">
        <div className="relative min-w-[280px] flex-1">
           <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></span>
           <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t.search} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-[#54aac5]/20" />
        </div>
        <div className="flex items-center gap-4">
           <select value={filterHealth} onChange={e => setFilterHealth(e.target.value as any)} className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none">
             <option value="ALL">All Health Status</option>
             <option value="on-track">On Track</option>
             <option value="at-risk">At Risk</option>
             <option value="off-track">Off Track</option>
           </select>
           {viewMode === 'gantt' && (
             <div className="flex bg-slate-50 rounded-xl p-1">
               {(['week', 'month', 'year'] as const).map(s => (
                 <button key={s} onClick={() => setZoomScale(s)} className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${zoomScale === s ? 'bg-white shadow text-[#54aac5]' : 'text-slate-400'}`}>{t[s]}</button>
               ))}
             </div>
           )}
        </div>
      </div>

      {/* View Container */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto h-full">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky left-0 bg-slate-50 z-20 w-[450px]">{isRtl ? 'المشروع والمهام الهرمية' : 'Project & Hierarchy'}</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t.status}</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t.health}</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest w-48">{t.progress}</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Gantt Visualizer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProjects.map((project) => {
                const isCollapsed = collapsedProjects.has(project.id);
                const ganttStyle = getGanttStyle(project.startDate, project.endDate);
                
                return (
                  <React.Fragment key={project.id}>
                    <tr className="group hover:bg-slate-50/80 transition-all cursor-pointer" onClick={() => setSelectedProject(project)}>
                      <td className="p-6 sticky left-0 bg-white group-hover:bg-slate-50 z-20 border-r border-slate-50">
                         <div className="flex items-center gap-4">
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setCollapsedProjects(prev => {
                                  const n = new Set(prev);
                                  n.has(project.id) ? n.delete(project.id) : n.add(project.id);
                                  return n;
                                });
                              }}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-transform"
                            >
                               <svg className={`w-4 h-4 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            <div className={`w-3.5 h-3.5 rounded-full shrink-0 ${getHealthColor(project.health)} shadow-lg`}></div>
                            <div>
                               <p className="text-sm font-bold text-slate-800 group-hover:text-[#54aac5] transition-colors">{project.name}</p>
                               <p className="text-[10px] text-slate-400 font-bold uppercase">{project.owner}</p>
                            </div>
                         </div>
                      </td>
                      <td className="p-6 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">{project.status}</td>
                      <td className="p-6 text-center">
                        <span className={`text-[9px] font-black px-3 py-1 rounded-full border shadow-sm ${getHealthColor(project.health)} bg-opacity-10 text-slate-700`}>{project.health.toUpperCase()}</span>
                      </td>
                      <td className="p-6">
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex items-center gap-3 relative shadow-inner">
                          <div className="h-full bg-[#54aac5] transition-all duration-1000" style={{ width: `${project.progress}%` }}></div>
                          <span className="text-[10px] font-bold text-slate-700 absolute right-2 bg-white/50 px-1 rounded shadow-sm">{project.progress}%</span>
                        </div>
                      </td>
                      <td 
                        className="p-6 relative group/timeline" 
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, project.id)}
                      >
                         {viewMode === 'gantt' && (
                           <div className="h-10 bg-slate-50/50 rounded-xl relative overflow-hidden border border-slate-100">
                              <div className={`absolute top-2 bottom-2 rounded-lg ${getHealthColor(project.health)} opacity-30 border border-white/20 transition-all`} style={ganttStyle}></div>
                           </div>
                         )}
                      </td>
                    </tr>
                    
                    {!isCollapsed && project.tasks.map(task => {
                      const taskStyle = getGanttStyle(task.startDate || project.startDate, task.dueDate || project.endDate);
                      return (
                        <tr key={task.id} className="bg-slate-50/20 text-xs border-b border-slate-50/50 group/task">
                           <td className="pl-24 p-4 sticky left-0 bg-white/50 backdrop-blur-sm border-r border-slate-50">
                              <div className="flex items-center gap-3">
                                 <div className={`w-2 h-2 rounded-full ${task.status === 'done' ? 'bg-emerald-500' : 'bg-[#54aac5]'}`}></div>
                                 <div className="flex-1">
                                    <p className="font-bold text-slate-700">{isRtl ? task.titleAr : task.titleEn}</p>
                                    <p className="text-[9px] text-slate-400 uppercase font-black">{task.assignee} • {task.dueDate}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="p-4 text-center">
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{task.status}</span>
                           </td>
                           <td className="p-4"></td>
                           <td className="p-4"></td>
                           <td className="p-4 relative h-12">
                              {viewMode === 'gantt' && (
                                <div className="h-full relative overflow-visible">
                                   <div 
                                     draggable 
                                     onDragStart={(e) => handleDragStart(e, task.id, project.id)}
                                     className={`absolute h-6 top-1/2 -translate-y-1/2 rounded border transition-all cursor-move flex items-center px-2 shadow-sm ${
                                       task.status === 'done' ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-[#54aac5]/20 border-[#54aac5]/40'
                                     } group-hover/task:opacity-100 opacity-60 z-10 hover:ring-2 ring-white`}
                                     style={taskStyle}
                                   >
                                      <span className="text-[7px] font-black text-slate-600 truncate pointer-events-none">{isRtl ? task.titleAr : task.titleEn}</span>
                                   </div>
                                </div>
                              )}
                           </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* PROJECT DETAILS MODAL - Variance Dashboard, Task Filtering, & Dependencies */}
      {selectedProject && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-xl animate-fade-in overflow-y-auto">
          <div className="bg-white w-full max-w-6xl rounded-[4rem] shadow-2xl overflow-hidden flex flex-col my-8">
            <div className="p-12 geospatial-bg text-white shrink-0 relative overflow-hidden">
               <div className="flex justify-between items-start relative z-10">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-4 h-4 rounded-full ${getHealthColor(selectedProject.health)} ring-4 ring-white/10 shadow-lg`}></div>
                      <span className="text-xs font-black uppercase tracking-[0.3em] text-[#a5f3fc] drop-shadow-sm">{selectedProject.status}</span>
                    </div>
                    <h2 className="text-4xl font-bold tracking-tight">{selectedProject.name}</h2>
                    <div className="flex items-center gap-10 mt-8">
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase opacity-60 tracking-widest">Schedule Slippage</span>
                          <span className={`text-xl font-bold ${new Date(selectedProject.endDate) > new Date(selectedProject.baseline?.endDate || selectedProject.endDate) ? 'text-red-400' : 'text-emerald-400'}`}>
                             {(() => {
                               const end = new Date(selectedProject.endDate);
                               const baseEnd = new Date(selectedProject.baseline?.endDate || selectedProject.endDate);
                               const diff = Math.floor((end.getTime() - baseEnd.getTime()) / (1000 * 3600 * 24));
                               return diff > 0 ? `+${diff} Days Delayed` : diff < 0 ? `${Math.abs(diff)} Days Early` : 'On Baseline';
                             })()}
                          </span>
                       </div>
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase opacity-60 tracking-widest">Budget Variance</span>
                          <span className="text-xl font-bold text-[#a5f3fc]">On Budget</span>
                       </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                       Snapshot Baseline
                    </button>
                    <button onClick={() => setSelectedProject(null)} className="p-4 bg-white/10 hover:bg-white/20 rounded-3xl transition-all border border-white/10 group">
                      <svg className="w-7 h-7 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
               </div>
            </div>

            <div className="p-12 space-y-12 bg-slate-50/30 overflow-y-auto flex-1 custom-scrollbar">
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  {/* Enhanced Tasks with Filters & Sorting */}
                  <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                     <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                        <h3 className="font-bold text-slate-800 text-xl flex items-center gap-3">
                           <svg className="w-6 h-6 text-[#54aac5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                           {t.tasks}
                        </h3>
                        <div className="flex gap-2">
                           <select 
                             value={taskFilters.status} 
                             onChange={e => setTaskFilters(prev => ({ ...prev, status: e.target.value }))}
                             className="text-[10px] font-black bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none uppercase tracking-widest cursor-pointer"
                           >
                              <option value="ALL">Status: All</option>
                              <option value="todo">To Do</option>
                              <option value="in-progress">In Progress</option>
                              <option value="done">Done</option>
                           </select>
                           <select 
                             value={taskFilters.sortBy} 
                             onChange={e => setTaskFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                             className="text-[10px] font-black bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none uppercase tracking-widest cursor-pointer"
                           >
                              <option value="dueDate">Sort: Deadline</option>
                              <option value="status">Sort: Workflow</option>
                           </select>
                           <button onClick={() => setTaskFilters(p => ({ ...p, sortDir: p.sortDir === 'asc' ? 'desc' : 'asc' }))} className="p-1.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700">
                             <svg className={`w-3.5 h-3.5 transition-transform ${taskFilters.sortDir === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>
                           </button>
                        </div>
                     </div>
                     <div className="space-y-4">
                        {getFilteredTasks(selectedProject).map(task => (
                          <div key={task.id} className="flex flex-col gap-4 p-6 rounded-3xl bg-slate-50 border border-transparent hover:border-slate-200 transition-all group/taskitem">
                             <div className="flex items-center gap-6">
                               <div className={`w-3 h-3 rounded-full ${task.status === 'done' ? 'bg-emerald-500' : 'bg-[#54aac5]'}`}></div>
                               <div className="flex-1">
                                  <p className="text-sm font-bold text-slate-700">{isRtl ? task.titleAr : task.titleEn}</p>
                                  <p className="text-[10px] font-black text-slate-400 uppercase mt-1 tracking-tighter">{task.assignee} • Due: {task.dueDate}</p>
                               </div>
                               <div className="flex gap-2">
                                 <button title="Edit Task" className="p-2 text-slate-300 hover:text-[#54aac5] transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                               </div>
                             </div>
                             {/* Task Dependency Picker */}
                             <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Link Pre-requisite (Dependency):</span>
                                <select className="text-[9px] bg-white border border-slate-100 px-2 py-1 rounded font-bold text-slate-600 outline-none hover:border-[#54aac5] cursor-pointer">
                                   <option value="">No Dependency Linked</option>
                                   {selectedProject.tasks.filter(t => t.id !== task.id).map(t => (
                                     <option key={t.id} value={t.id} selected={task.dependencies?.includes(t.id)}>{isRtl ? t.titleAr : t.titleEn}</option>
                                   ))}
                                </select>
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>

                  {/* Sidebar with Baseline Variance & Health Audit */}
                  <div className="space-y-8">
                     <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 relative overflow-hidden group">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-[#54aac5]/10 flex items-center justify-center text-[#54aac5]">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                           </div>
                           <h3 className="font-bold text-slate-800 text-xl">{isRtl ? 'تحليل تباين خط الأساس' : 'Baseline Variance'}</h3>
                        </div>
                        
                        <div className="space-y-6">
                           <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                 <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Baseline Start</p>
                                 <p className="text-xs font-bold text-slate-700">{selectedProject.baseline?.startDate}</p>
                              </div>
                              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                 <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Baseline End</p>
                                 <p className="text-xs font-bold text-slate-700">{selectedProject.baseline?.endDate}</p>
                              </div>
                           </div>
                           
                           <div className="p-5 rounded-2xl bg-[#102f36] text-white">
                              <div className="flex justify-between items-center mb-1">
                                 <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Schedule Variance (Days)</span>
                                 <span className={`text-lg font-black ${new Date(selectedProject.endDate) > new Date(selectedProject.baseline?.endDate || selectedProject.endDate) ? 'text-red-400' : 'text-[#a5f3fc]'}`}>
                                    {Math.floor((new Date(selectedProject.endDate).getTime() - new Date(selectedProject.baseline?.endDate || selectedProject.endDate).getTime()) / (1000 * 3600 * 24))}
                                 </span>
                              </div>
                              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                 <div className="h-full bg-[#a5f3fc]" style={{ width: '85%' }}></div>
                              </div>
                           </div>

                           <div className="flex flex-col p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                              <span className="text-[9px] font-black text-emerald-400 uppercase mb-1">Baseline Budget</span>
                              <p className="text-sm font-black text-emerald-800">{selectedProject.baseline?.budgetEn}</p>
                           </div>
                        </div>
                     </div>

                     <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                           <h3 className="font-bold text-slate-800 text-xl">{t.risks}</h3>
                           <button className="text-[10px] font-black text-[#54aac5] uppercase tracking-widest hover:underline">+ Add Risk</button>
                        </div>
                        <div className="space-y-4">
                           {selectedProject.risks.map(risk => (
                             <div key={risk.id} className="p-6 bg-red-50/30 rounded-3xl border border-red-100 flex gap-4 group cursor-pointer hover:bg-red-50/50 transition-all">
                                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${risk.severity === 'high' ? 'bg-red-500 shadow-sm' : 'bg-amber-500 shadow-sm'}`}></div>
                                <div className="flex-1 space-y-2">
                                   <p className="text-sm font-bold text-slate-700 leading-snug">{isRtl ? risk.descriptionAr : risk.descriptionEn}</p>
                                   <div className="flex items-center gap-2">
                                     <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${risk.severity === 'high' ? 'bg-red-100 text-red-600 border-red-200' : 'bg-amber-100 text-amber-600 border-amber-200'}`}>{risk.severity} severity</span>
                                     <button title="Edit Risk" className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-[#54aac5]"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                                   </div>
                                </div>
                                <button title="Delete Risk" className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in">
           <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-12 space-y-8 my-10 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <h2 className="text-3xl font-bold text-slate-800">{t.addNewProject}</h2>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-2xl transition-all">
                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-8">
                 <div className="col-span-2 space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-1">Project Name</label><input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-[#54aac5] transition-all" placeholder="Strategic Expansion..." /></div>
                 <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-1">Start Date</label><input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm outline-none" /></div>
                 <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-1">End Date</label><input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm outline-none" /></div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="w-full py-5 bg-[#102f36] text-white rounded-[1.5rem] font-bold shadow-xl transition-all hover:bg-[#1a4d58] hover:scale-[1.01]">Initiate Portfolio Item</button>
           </div>
        </div>
      )}
    </div>
  );
}
