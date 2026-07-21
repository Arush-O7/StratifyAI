import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Button } from '../components/UI/Button';
import { Card } from '../components/UI/Card';
import { Skeleton } from '../components/UI/Skeleton';
import { Badge } from '../components/UI/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderIcon,
  MapIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalProjects: number;
  activeRoadmaps: number;
  feedbackItems: number;
  pendingTasks: number;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeRoadmaps: 0,
    feedbackItems: 0,
    pendingTasks: 0,
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(
    localStorage.getItem('activeProjectId')
  );

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjPlan, setNewProjPlan] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Watch for active project changes
  useEffect(() => {
    const handleStorageChange = () => {
      setActiveProjectId(localStorage.getItem('activeProjectId'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [projectsResponse, feedbackResponse, tasksResponse, roadmapResponse]: any[] = await Promise.all([
        api.get('/projects'),
        api.get('/feedback'),
        api.get('/tasks'),
        api.get('/roadmap'),
      ]);

      if (projectsResponse.success && projectsResponse.data) {
        setProjects(projectsResponse.data);
        
        // Auto-select first project if none is selected
        if (projectsResponse.data.length > 0 && !localStorage.getItem('activeProjectId')) {
          selectProject(projectsResponse.data[0]._id, projectsResponse.data[0].name);
        }
      }

      setStats({
        totalProjects: projectsResponse.data?.length || 0,
        feedbackItems: feedbackResponse.data?.length || 0,
        pendingTasks: tasksResponse.data?.length || 0,
        activeRoadmaps: roadmapResponse.data?.length || 0,
      });
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to fetch dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  const selectProject = (id: string, name: string) => {
    localStorage.setItem('activeProjectId', id);
    localStorage.setItem('activeProjectName', name);
    setActiveProjectId(id);
    window.dispatchEvent(new Event('storage'));
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName || !newProjDesc) return;
    
    setCreating(true);
    try {
      let response: any;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('name', newProjName);
        formData.append('description', newProjDesc);
        formData.append('document', selectedFile);

        response = await api.post('/projects/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        response = await api.post('/projects', {
          name: newProjName,
          description: newProjDesc,
          officialPlan: newProjPlan || 'Standard strategic project plan.',
        });
      }

      if (response.success && response.data) {
        const newProj = response.data;
        setProjects([newProj, ...projects]);
        selectProject(newProj._id, newProj.name);
        
        // Reset form
        setNewProjName('');
        setNewProjDesc('');
        setNewProjPlan('');
        setSelectedFile(null);
        setShowModal(false);
        
        loadDashboardData();
      }
    } catch (err: any) {
      console.error('Error creating project:', err);
      alert(err.message || 'Failed to create workspace');
    } finally {
      setCreating(false);
    }
  };

  const statCards = [
    { name: 'Active Pulse Hubs', value: stats.totalProjects, icon: FolderIcon, variant: 'indigo' },
    { name: 'Horizons Formulated', value: stats.activeRoadmaps, icon: MapIcon, variant: 'indigo' },
    { name: 'User Signals Logs', value: stats.feedbackItems, icon: DocumentTextIcon, variant: 'indigo' },
    { name: 'Action Items Backlog', value: stats.pendingTasks, icon: ClipboardDocumentListIcon, variant: 'indigo' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="space-y-8 py-4">
        <div className="h-10 w-48 bg-slate-800 animate-pulse rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton count={4} className="h-28" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Summary */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Pulse Hub Overview</h1>
          <p className="text-slate-400 text-xs mt-1.5">
            Configure collaborative workspaces and synthesize user signals intoリリース plans.
          </p>
        </div>
        <Button onClick={() => setShowModal(true)} className="self-start">
          <PlusIcon className="h-4.5 w-4.5 mr-2" />
          Create Pulse Hub
        </Button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statCards.map((card, idx) => (
          <motion.div key={idx} variants={itemVariants}>
            <Card hoverGlow className="p-5 flex items-center space-x-4 bg-slate-900/20">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <card.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-3xs font-extrabold text-slate-500 uppercase tracking-widest">{card.name}</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">{card.value}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Projects Panel */}
      <Card hoverGlow={false} className="p-0 overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/2">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Pulse Hub Workspaces</h3>
          <Badge variant="indigo">{projects.length} Active</Badge>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-20 px-4">
            <FolderIcon className="mx-auto h-12 w-12 text-slate-700" />
            <h3 className="mt-4 text-sm font-bold text-slate-300">No active pulse hubs</h3>
            <p className="mt-1.5 text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Create a new pulse hub. Upload product specifications or enter core guidelines manually to initialize the AI engine.
            </p>
            <Button onClick={() => setShowModal(true)} className="mt-6">
              <PlusIcon className="h-4 w-4 mr-2" />
              Initialize Pulse Hub
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-white/5 max-h-[480px] overflow-y-auto custom-scrollbar">
            {projects.map((project) => {
              const isActive = project._id === activeProjectId;
              return (
                <div
                  key={project._id}
                  onClick={() => selectProject(project._id, project.name)}
                  className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 transition-all cursor-pointer ${
                    isActive ? 'bg-indigo-500/5 hover:bg-indigo-500/10' : 'hover:bg-white/2'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center space-x-2.5">
                      <h4 className={`text-sm font-bold truncate ${isActive ? 'text-indigo-400' : 'text-slate-200'}`}>
                        {project.name}
                      </h4>
                      {isActive && (
                        <Badge variant="indigo">
                          <CheckIcon className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-1 leading-relaxed">{project.description}</p>
                    <p className="text-3xs text-slate-500 mt-2 font-bold uppercase tracking-wider">
                      Established: {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="mt-4 sm:mt-0 flex items-center space-x-3 self-end sm:self-center">
                    <Link
                      to="/feedback"
                      className="px-3.5 py-1.5 bg-slate-900 border border-white/5 text-slate-300 font-semibold text-2xs rounded-xl hover:text-white transition-colors"
                    >
                      Signals
                    </Link>
                    <Link
                      to="/roadmap"
                      className="px-3.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 font-semibold text-2xs rounded-xl transition-colors"
                    >
                      Horizons
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Creation Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-white/5 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden z-10"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/2">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Initialize Pulse Hub</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="p-6 space-y-4">
                <div>
                  <label className="block text-3xs font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                    Hub Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newProjName}
                    onChange={(e) => setNewProjName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950/60 border border-white/5 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. Mobile User Auth Suite"
                  />
                </div>

                <div>
                  <label className="block text-3xs font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                    Strategic Description
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={newProjDesc}
                    onChange={(e) => setNewProjDesc(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950/60 border border-white/5 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                    placeholder="Summarize the core goals and target of the project..."
                  />
                </div>

                {/* Initialization Method Choice */}
                <div className="border-t border-white/5 pt-4">
                  <span className="block text-3xs font-extrabold text-slate-400 uppercase tracking-widest mb-2.5">
                    Hub Ingest Method
                  </span>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className={`py-2 px-3 border rounded-xl text-2xs font-bold transition cursor-pointer ${
                        !selectedFile ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-white/5 text-slate-500 hover:bg-white/2'
                      }`}
                    >
                      Manual Spec Entry
                    </button>
                    <label
                      className={`py-2 px-3 border rounded-xl text-2xs font-bold text-center cursor-pointer transition flex items-center justify-center space-x-1.5 ${
                        selectedFile ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-white/5 text-slate-500 hover:bg-white/2'
                      }`}
                    >
                      <ArrowUpTrayIcon className="h-4 w-4" />
                      <span>{selectedFile ? 'File Selected' : 'Upload PRD / Doc'}</span>
                      <input
                        type="file"
                        accept=".pdf,.docx,.txt"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            setSelectedFile(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  </div>

                  {selectedFile ? (
                    <div className="bg-white/5 border border-white/5 rounded-xl px-4 py-3 flex items-center justify-between text-slate-300 text-xs font-semibold">
                      <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                      <button type="button" onClick={() => setSelectedFile(null)} className="text-rose-455 font-bold hover:text-rose-400">
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-3xs font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                        Raw Specifications (Optional)
                      </label>
                      <textarea
                        rows={3}
                        value={newProjPlan}
                        onChange={(e) => setNewProjPlan(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-950/60 border border-white/5 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Paste raw strategic directives. Aura PM Copilot will ingest this."
                      />
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  loading={creating}
                  className="w-full py-3 mt-6"
                >
                  Create Pulse Hub Workspace
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
