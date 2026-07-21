import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { Button } from '../components/UI/Button';
import { Card } from '../components/UI/Card';
import { Skeleton } from '../components/UI/Skeleton';
import { Badge } from '../components/UI/Badge';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
  TrashIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  InboxIcon
} from '@heroicons/react/24/outline';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done' | 'blocked';
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  createdAt: string;
}

const TaskManagement: React.FC = () => {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(
    localStorage.getItem('activeProjectId')
  );
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'critical' | 'high' | 'medium' | 'low'>('medium');
  const [category, setCategory] = useState('feature');
  const [showAddForm, setShowAddForm] = useState(false);

  const loadTasks = useCallback(async () => {
    if (!activeProjectId) return;
    setLoading(true);
    try {
      const response: any = await api.get(`/tasks/project/${activeProjectId}`);
      if (response.success && response.data) {
        setTasks(response.data);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [activeProjectId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Monitor active project changes
  useEffect(() => {
    const handleStorageChange = () => {
      setActiveProjectId(localStorage.getItem('activeProjectId'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !activeProjectId) return;

    setLoading(true);
    try {
      const response: any = await api.post('/tasks', {
        projectId: activeProjectId,
        title,
        description: description || 'No description provided.',
        priority,
        category,
        status: 'todo'
      });

      if (response.success) {
        setTitle('');
        setDescription('');
        setPriority('medium');
        setCategory('feature');
        setShowAddForm(false);
        loadTasks();
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response: any = await api.put(`/tasks/${id}`, { status });
      if (response.success) {
        setTasks(prev => prev.map(t => t._id === id ? { ...t, status: status as any } : t));
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm('Delete this execution task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(t => t._id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const columns: { id: 'todo' | 'in-progress' | 'done' | 'blocked'; title: string; icon: any; color: string }[] = [
    { id: 'todo', title: 'Signals Ingested', icon: InboxIcon, color: 'text-slate-400 bg-slate-500/10' },
    { id: 'in-progress', title: 'Active Dev', icon: ClockIcon, color: 'text-indigo-400 bg-indigo-500/10' },
    { id: 'done', title: 'Completed', icon: CheckCircleIcon, color: 'text-emerald-400 bg-emerald-500/10' },
    { id: 'blocked', title: 'Blocked', icon: ExclamationCircleIcon, color: 'text-rose-455 bg-rose-500/10' }
  ];

  if (!activeProjectId) {
    return (
      <div className="text-center py-16 bg-slate-900/40 border border-white/5 rounded-2xl p-8 shadow-sm max-w-md mx-auto">
        <h3 className="text-lg font-bold text-slate-200">No active workspace selected</h3>
        <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
          Please select or create a Pulse Hub workspace on the Dashboard first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Horizons Tasks</h1>
          <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
            Manage your execution backlog and track release statuses of AI-generated roadmap items.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <PlusIcon className="h-4.5 w-4.5 mr-2" />
            New Task
          </Button>
          <button
            onClick={loadTasks}
            className="p-2 border border-white/5 rounded-xl hover:bg-white/5 text-slate-450 transition"
          >
            <ArrowPathIcon className={`h-4.5 w-4.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <form onSubmit={handleCreateTask} className="bg-slate-900/30 border border-white/5 rounded-2xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 animate-slideDown">
          <div className="md:col-span-2 space-y-3">
            <div>
              <label className="block text-3xs font-extrabold text-slate-500 uppercase tracking-widest mb-1">Task Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/60 border border-white/5 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="e.g. Design Landing Page Login CTA"
              />
            </div>
            <div>
              <label className="block text-3xs font-extrabold text-slate-500 uppercase tracking-widest mb-1">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/60 border border-white/5 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                placeholder="Describe key requirements..."
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-3xs font-extrabold text-slate-500 uppercase tracking-widest mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950/80 border border-white/5 rounded-xl text-xs font-bold text-slate-300 focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-3xs font-extrabold text-slate-500 uppercase tracking-widest mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/80 border border-white/5 rounded-xl text-xs font-bold text-slate-300 focus:outline-none"
              >
                <option value="feature">Feature</option>
                <option value="bug-fix">Bug Fix</option>
                <option value="improvement">Improvement</option>
                <option value="research">Research</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="flex items-end">
            <Button type="submit" loading={loading} className="w-full py-2">
              Add to Backlog
            </Button>
          </div>
        </form>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton count={4} className="h-48" />
        </div>
      )}

      {/* Board Columns */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {columns.map((col) => {
            const colTasks = tasks.filter(t => t.status === col.id);
            return (
              <div key={col.id} className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex flex-col min-h-[400px]">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-1.5 rounded-lg ${col.color}`}>
                      <col.icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">{col.title}</h3>
                  </div>
                  <Badge variant="indigo">{colTasks.length}</Badge>
                </div>

                {/* Tasks List */}
                <div className="space-y-3 overflow-y-auto max-h-[500px] custom-scrollbar flex-1">
                  {colTasks.length === 0 ? (
                    <div className="text-center py-16 text-slate-500 text-xs font-semibold bg-slate-950/20 border border-dashed border-white/5 rounded-xl">
                      Column Empty
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <motion.div
                        key={task._id}
                        whileHover={{ y: -2 }}
                        className="bg-slate-950/60 p-4 border border-white/5 rounded-xl space-y-3 hover:border-indigo-500/20 transition-all shadow-sm"
                      >
                        <div>
                          <h4 className="font-bold text-slate-200 text-xs leading-snug">{task.title}</h4>
                          <p className="text-slate-500 text-3xs mt-1 leading-relaxed truncate">{task.description}</p>
                        </div>

                        <div className="flex items-center justify-between flex-wrap gap-2 pt-2.5 border-t border-white/5">
                          <div className="flex space-x-1.5">
                            <Badge variant={task.priority}>{task.priority}</Badge>
                            <span className="px-1.5 py-0.5 rounded text-3xs font-extrabold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 uppercase tracking-wider">
                              {task.category}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-1.5">
                            <select
                              value={task.status}
                              onChange={(e) => handleStatusChange(task._id, e.target.value)}
                              className="bg-slate-900 border border-white/5 rounded px-1.5 py-0.5 text-3xs font-bold text-slate-400 cursor-pointer focus:outline-none"
                            >
                              <option value="todo">To Do</option>
                              <option value="in-progress">In Dev</option>
                              <option value="done">Completed</option>
                              <option value="blocked">Blocked</option>
                            </select>
                            <button
                              onClick={() => handleDeleteTask(task._id)}
                              className="text-slate-500 hover:text-rose-455 p-0.5 rounded hover:bg-rose-500/10 transition"
                            >
                              <TrashIcon className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TaskManagement;
