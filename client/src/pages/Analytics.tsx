import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { Button } from '../components/UI/Button';
import { Card } from '../components/UI/Card';
import { Skeleton } from '../components/UI/Skeleton';
import { Badge } from '../components/UI/Badge';
import {
  ChartBarIcon,
  SparklesIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

interface AnalyticsData {
  totalTasks: number;
  completedTasks: number;
  totalFeedback: number;
  positiveFeedback: number;
  negativeFeedback: number;
  neutralFeedback: number;
}

const COLORS = {
  positive: '#10B981',
  neutral: '#64748B',
  negative: '#F43F5E'
};

const Analytics: React.FC = () => {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(
    localStorage.getItem('activeProjectId')
  );
  const [activeProjectName, setActiveProjectName] = useState<string | null>(
    localStorage.getItem('activeProjectName')
  );
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AnalyticsData>({
    totalTasks: 0,
    completedTasks: 0,
    totalFeedback: 0,
    positiveFeedback: 0,
    negativeFeedback: 0,
    neutralFeedback: 0
  });

  const loadAnalyticsData = useCallback(async () => {
    if (!activeProjectId) return;
    setLoading(true);
    try {
      const [feedbackRes, tasksRes]: any[] = await Promise.all([
        api.get(`/feedback/project/${activeProjectId}`),
        api.get(`/tasks/project/${activeProjectId}`)
      ]);

      let fbItems = [];
      if (feedbackRes.success && feedbackRes.data) {
        fbItems = feedbackRes.data;
      }

      let taskItems = [];
      if (tasksRes.success && tasksRes.data) {
        taskItems = tasksRes.data;
      }

      const totalFeedback = fbItems.length;
      const positiveFeedback = fbItems.filter((f: any) => f.sentiment === 'positive').length;
      const negativeFeedback = fbItems.filter((f: any) => f.sentiment === 'negative').length;
      const neutralFeedback = fbItems.filter((f: any) => f.sentiment === 'neutral').length;

      const totalTasks = taskItems.length;
      const completedTasks = taskItems.filter((t: any) => t.status === 'done').length;

      setData({
        totalTasks,
        completedTasks,
        totalFeedback,
        positiveFeedback,
        negativeFeedback,
        neutralFeedback
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [activeProjectId]);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  // Monitor active project changes
  useEffect(() => {
    const handleStorageChange = () => {
      setActiveProjectId(localStorage.getItem('activeProjectId'));
      setActiveProjectName(localStorage.getItem('activeProjectName'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const completionRate = data.totalTasks > 0 ? Math.round((data.completedTasks / data.totalTasks) * 100) : 0;
  
  const sentimentDistribution = [
    { name: 'Positive', value: data.positiveFeedback, fill: COLORS.positive },
    { name: 'Neutral', value: data.neutralFeedback, fill: COLORS.neutral },
    { name: 'Negative', value: data.negativeFeedback, fill: COLORS.negative }
  ].filter(item => item.value > 0);

  const taskStats = [
    { name: 'Horizon Tasks', value: data.totalTasks },
    { name: 'Completed Tasks', value: data.completedTasks },
    { name: 'Backlog Tasks', value: data.totalTasks - data.completedTasks }
  ];

  if (!activeProjectId) {
    return (
      <div className="text-center py-16 bg-slate-900/40 border border-white/5 rounded-2xl p-8 shadow-sm max-w-md mx-auto">
        <h3 className="text-lg font-bold text-slate-200">No active workspace selected</h3>
        <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
          Please select or create a Pulse Hub workspace on the Dashboard to view the Analytics Console.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Analytics Console</h1>
          <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
            Real-time analytics monitor for <span className="text-indigo-400 font-bold">{activeProjectName}</span> metrics.
          </p>
        </div>
        <button
          onClick={loadAnalyticsData}
          className="p-2 border border-white/5 rounded-xl hover:bg-white/5 text-slate-400 transition"
        >
          <ArrowPathIcon className={`h-4.5 w-4.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton count={3} className="h-28" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton count={2} className="h-72" />
          </div>
        </div>
      ) : (
        <>
          {/* Numerical Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card hoverGlow className="p-6 space-y-2">
              <span className="text-3xs font-extrabold text-slate-500 uppercase tracking-widest">Horizon Execution Rate</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-extrabold text-white">{completionRate}%</span>
                <span className="text-3xs font-extrabold text-slate-500 uppercase">Completed</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-4">
                <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${completionRate}%` }} />
              </div>
            </Card>

            <Card hoverGlow className="p-6 space-y-2">
              <span className="text-3xs font-extrabold text-slate-500 uppercase tracking-widest">Total User Signals</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-extrabold text-white">{data.totalFeedback}</span>
                <span className="text-3xs font-extrabold text-slate-500 uppercase">Documents Analyzed</span>
              </div>
              <p className="text-3xs text-slate-500 font-bold uppercase tracking-wider mt-4">
                Positive: <span className="text-emerald-400">{data.positiveFeedback}</span> | 
                Neutral: <span className="text-slate-400">{data.neutralFeedback}</span> | 
                Negative: <span className="text-rose-400">{data.negativeFeedback}</span>
              </p>
            </Card>

            <Card hoverGlow className="p-6 space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-3xs font-extrabold text-slate-500 uppercase tracking-widest">AI Inferences Engine</span>
                <div className="flex items-baseline space-x-2 mt-2">
                  <span className="text-xl font-bold text-emerald-450 uppercase tracking-wider">Aura Sync Active</span>
                </div>
              </div>
              <div className="text-3xs text-slate-500 font-extrabold uppercase tracking-widest flex items-center space-x-1.5">
                <SparklesIcon className="h-4 w-4 text-indigo-400" />
                <span>Vertex / Gemini API Loop Connected</span>
              </div>
            </Card>
          </div>

          {/* Visual Graphs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Stats */}
            <Card hoverGlow={false} className="p-6">
              <div className="flex items-center space-x-2.5 mb-5 border-b border-white/5 pb-3">
                <ChartBarIcon className="h-5 w-5 text-indigo-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Workspace Task Status</h3>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={taskStats} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={8} fontWeight={700} />
                    <YAxis stroke="#64748B" fontSize={8} fontWeight={700} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#6366F1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Sentiment breakdown */}
            <Card hoverGlow={false} className="p-6">
              <div className="flex items-center space-x-2.5 mb-5 border-b border-white/5 pb-3">
                <SparklesIcon className="h-5 w-5 text-indigo-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">User Signals Sentiment</h3>
              </div>
              <div className="h-72">
                {sentimentDistribution.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-500 text-xs font-semibold">
                    No signals found. Ingest feedback to track sentiment insights.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sentimentDistribution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                      <XAxis dataKey="name" stroke="#64748B" fontSize={8} fontWeight={700} />
                      <YAxis stroke="#64748B" fontSize={8} fontWeight={700} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]}>
                        {sentimentDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
