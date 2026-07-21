import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { Button } from '../components/UI/Button';
import { Card } from '../components/UI/Card';
import { Skeleton } from '../components/UI/Skeleton';
import { Badge } from '../components/UI/Badge';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  ArrowPathIcon,
  BriefcaseIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface RoadmapItem {
  _id: string;
  title: string;
  description: string;
  phase: 'now' | 'next' | 'later';
  priority: 'high' | 'medium' | 'low';
  category: string;
  effort: string;
  benefits: string;
}

interface Roadmap {
  _id: string;
  projectId: string;
  strategy: string;
  items: RoadmapItem[];
}

const RoadmapView: React.FC = () => {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(
    localStorage.getItem('activeProjectId')
  );
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [strategy, setStrategy] = useState('balanced');
  const [customStrategic, setCustomStrategic] = useState(40);
  const [customCustomer, setCustomCustomer] = useState(40);
  const [customMaintenance, setCustomMaintenance] = useState(20);

  const loadRoadmap = useCallback(async () => {
    if (!activeProjectId) return;
    setLoading(true);
    try {
      const response: any = await api.get(`/roadmap/project/${activeProjectId}`);
      if (response.success && response.data && response.data.length > 0) {
        setRoadmap(response.data[0]);
      } else {
        setRoadmap(null);
      }
    } catch (error) {
      console.error('Error fetching roadmap:', error);
    } finally {
      setLoading(false);
    }
  }, [activeProjectId]);

  useEffect(() => {
    loadRoadmap();
  }, [loadRoadmap]);

  // Monitor active project changes
  useEffect(() => {
    const handleStorageChange = () => {
      setActiveProjectId(localStorage.getItem('activeProjectId'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleGenerateRoadmap = async () => {
    if (!activeProjectId) return;
    setGenerating(true);
    try {
      const payload: any = {
        projectId: activeProjectId,
        strategy,
      };

      if (strategy === 'custom') {
        payload.customAllocation = {
          strategic: customStrategic,
          customer: customCustomer,
          maintenance: customMaintenance,
        };
      }

      const response: any = await api.post('/roadmap/generate', payload);
      if (response.success && response.data) {
        setRoadmap(response.data);
      }
    } catch (error: any) {
      console.error('Error generating roadmap:', error);
      alert(error.message || 'AI Roadmap generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleConvertToTasks = async () => {
    if (!roadmap) return;
    setLoading(true);
    try {
      const response: any = await api.post(`/roadmap/${roadmap._id}/convert-to-tasks`);
      if (response.success) {
        alert('Horizon release items converted to task backlog successfully!');
      }
    } catch (error: any) {
      console.error('Error converting to tasks:', error);
      alert('Conversion failed');
    } finally {
      setLoading(false);
    }
  };

  const getItemsByPhase = (phase: 'now' | 'next' | 'later') => {
    if (!roadmap) return [];
    return roadmap.items.filter(item => {
      const p = item.phase?.toLowerCase();
      if (phase === 'now') return p === 'now' || !p;
      return p === phase;
    });
  };

  if (!activeProjectId) {
    return (
      <div className="text-center py-16 bg-slate-900/40 border border-white/5 rounded-2xl p-8 shadow-sm max-w-md mx-auto">
        <h3 className="text-lg font-bold text-slate-200">No active workspace selected</h3>
        <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
          Please select or create a Pulse Hub workspace on the Dashboard to access Release Horizons.
        </p>
      </div>
    );
  }

  const phases: { id: 'now' | 'next' | 'later'; title: string; color: string; desc: string }[] = [
    { id: 'now', title: 'Horizon 1 (Now)', color: 'bg-emerald-500', desc: 'Active execution' },
    { id: 'next', title: 'Horizon 2 (Next)', color: 'bg-indigo-500', desc: 'Detailed planning' },
    { id: 'later', title: 'Horizon 3 (Later)', color: 'bg-slate-500', desc: 'Future discovery' }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Release Horizons</h1>
          <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
            Generate prioritized feature horizons using AI matching strategic project goals with customer signals.
          </p>
        </div>
        
        {roadmap && (
          <Button onClick={handleConvertToTasks} variant="secondary" className="self-start">
            <BriefcaseIcon className="h-4 w-4 mr-2" />
            Sync Release Tasks
          </Button>
        )}
      </div>

      {/* Control Card */}
      <Card hoverGlow={false} className="p-6 space-y-6">
        <div className="flex items-center space-x-2.5 border-b border-white/5 pb-3">
          <SparklesIcon className="h-5 w-5 text-indigo-455" />
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Configure Horizon Focus</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Strategy Select */}
          <div className="space-y-1">
            <label className="text-3xs font-extrabold text-slate-500 uppercase tracking-widest">Allocation Strategy</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/80 border border-white/5 rounded-xl text-xs font-bold text-slate-300 focus:outline-none"
            >
              <option value="balanced">Balanced (60/30/10)</option>
              <option value="strategic">Strategic Focus (70/20/10)</option>
              <option value="customer-driven">Customer-Driven (20/70/10)</option>
              <option value="custom">Custom Parameters</option>
            </select>
          </div>

          {strategy === 'custom' ? (
            <>
              <div className="space-y-1">
                <label className="text-3xs font-extrabold text-slate-500 uppercase tracking-widest">Strategic %</label>
                <input
                  type="number"
                  value={customStrategic}
                  onChange={(e) => setCustomStrategic(parseInt(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-3xs font-extrabold text-slate-500 uppercase tracking-widest">Customer Signals %</label>
                <input
                  type="number"
                  value={customCustomer}
                  onChange={(e) => setCustomCustomer(parseInt(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-3xs font-extrabold text-slate-500 uppercase tracking-widest">Refactoring %</label>
                <input
                  type="number"
                  value={customMaintenance}
                  onChange={(e) => setCustomMaintenance(parseInt(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>
            </>
          ) : (
            <div className="col-span-3 flex items-center text-3xs text-slate-500 font-extrabold uppercase tracking-widest pt-5">
              {strategy === 'balanced' && '60% Strategic direction, 30% User signals, 10% Maintenance.'}
              {strategy === 'strategic' && '70% Strategic direction, 20% User signals, 10% Maintenance.'}
              {strategy === 'customer-driven' && '20% Strategic direction, 70% User signals, 10% Maintenance.'}
            </div>
          )}
        </div>

        <Button
          onClick={handleGenerateRoadmap}
          loading={generating}
          disabled={loading}
          className="w-full py-3"
        >
          {!generating && <SparklesIcon className="h-4.5 w-4.5 mr-2" />}
          Formulate AI Horizons Roadmap
        </Button>
      </Card>

      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton count={3} className="h-64" />
        </div>
      )}

      {/* Board */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {phases.map((col) => {
            const items = getItemsByPhase(col.id);
            return (
              <div key={col.id} className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex flex-col min-h-[450px]">
                {/* Column header */}
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center space-x-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                    <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">{col.title}</h3>
                  </div>
                  <Badge variant="indigo">{items.length}</Badge>
                </div>
                
                {/* Column cards container */}
                <div className="space-y-3 overflow-y-auto max-h-[500px] custom-scrollbar flex-1">
                  {items.length === 0 ? (
                    <div className="text-center py-16 text-slate-500 text-xs font-semibold bg-slate-950/20 border border-dashed border-white/5 rounded-xl">
                      Horizon Empty
                    </div>
                  ) : (
                    items.map((item) => (
                      <motion.div
                        key={item._id}
                        whileHover={{ y: -3 }}
                        className="bg-slate-950/60 p-4 border border-white/5 rounded-xl hover:border-indigo-500/20 transition-all shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="font-bold text-slate-200 text-xs leading-snug">{item.title}</h4>
                          <Badge variant={item.priority}>{item.priority}</Badge>
                        </div>
                        <p className="text-3xs text-slate-400 mt-2 leading-relaxed font-medium">{item.description}</p>
                        
                        <div className="border-t border-white/5 mt-3 pt-3 flex items-center justify-between text-3xs font-extrabold text-slate-500 uppercase tracking-widest">
                          <span className="flex items-center">
                            <ClockIcon className="h-3.5 w-3.5 mr-1 text-slate-500" />
                            Effort: {item.effort || 'Medium'}
                          </span>
                          <span className="text-indigo-400">{item.category || 'Strategic'}</span>
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

export default RoadmapView;
