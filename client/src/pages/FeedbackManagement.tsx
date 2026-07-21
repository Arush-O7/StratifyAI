import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { Button } from '../components/UI/Button';
import { Card } from '../components/UI/Card';
import { Skeleton } from '../components/UI/Skeleton';
import { Badge } from '../components/UI/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DocumentArrowUpIcon,
  PlusIcon,
  TrashIcon,
  ArrowPathIcon,
  SparklesIcon,
  EyeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

interface FeedbackItem {
  _id: string;
  content: string;
  source: string;
  category: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  priority: 'critical' | 'high' | 'medium' | 'low';
  isIgnored: boolean;
  createdAt: string;
  extractedKeywords?: string[];
  aiAnalysis?: {
    summary: string;
    actionableItems: string[];
    relatedFeatures: string[];
    urgencyScore: number;
  };
}

const COLORS = {
  positive: '#10B981',
  negative: '#F43F5E',
  neutral: '#64748B',
  critical: '#EF4444',
  high: '#F97316',
  medium: '#F59E0B',
  low: '#0EA5E9'
};

const FeedbackManagement: React.FC = () => {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(
    localStorage.getItem('activeProjectId')
  );
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null);

  // Filters
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const loadFeedback = useCallback(async () => {
    if (!activeProjectId) return;
    setLoading(true);
    try {
      const response: any = await api.get(`/feedback/project/${activeProjectId}`);
      if (response.success && response.data) {
        setFeedbackList(response.data);
      }
    } catch (error) {
      console.error('Error loading feedback:', error);
    } finally {
      setLoading(false);
    }
  }, [activeProjectId]);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  // Monitor active project changes
  useEffect(() => {
    const handleStorageChange = () => {
      setActiveProjectId(localStorage.getItem('activeProjectId'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeProjectId) return;

    setLoading(true);
    try {
      const response: any = await api.post('/feedback', {
        projectId: activeProjectId,
        content: inputText,
        source: 'manual'
      });
      if (response.success) {
        setInputText('');
        loadFeedback();
      }
    } catch (error) {
      console.error('Error adding feedback:', error);
      alert('Failed to analyze feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !activeProjectId) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('projectId', activeProjectId);
    formData.append('document', selectedFile);

    try {
      const response: any = await api.post('/feedback/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.success) {
        setSelectedFile(null);
        loadFeedback();
      }
    } catch (error) {
      console.error('Error uploading feedback document:', error);
      alert('Failed to parse and upload feedback document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this user signal?')) return;
    try {
      await api.delete(`/feedback/${id}`);
      setFeedbackList(feedbackList.filter(item => item._id !== id));
      if (selectedItem?._id === id) setSelectedItem(null);
    } catch (error) {
      console.error('Error deleting feedback:', error);
    }
  };

  // Filtered List
  const filteredFeedback = feedbackList.filter(item => {
    const matchSentiment = sentimentFilter === 'all' || item.sentiment === sentimentFilter;
    const matchCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchSentiment && matchCategory;
  });

  const getSentimentChartData = () => {
    const counts = { positive: 0, negative: 0, neutral: 0 };
    feedbackList.forEach(item => {
      if (counts[item.sentiment] !== undefined) {
        counts[item.sentiment]++;
      }
    });
    return Object.keys(counts).map(key => ({
      name: key.toUpperCase(),
      value: counts[key as keyof typeof counts],
      color: COLORS[key as keyof typeof counts]
    })).filter(d => d.value > 0);
  };

  const getCategoryChartData = () => {
    const counts: { [key: string]: number } = {};
    feedbackList.forEach(item => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({
      name: key.replace('-', ' ').toUpperCase(),
      value: counts[key]
    }));
  };

  const sentimentData = getSentimentChartData();
  const categoryData = getCategoryChartData();

  if (!activeProjectId) {
    return (
      <div className="text-center py-16 bg-slate-900/40 border border-white/5 rounded-2xl p-8 shadow-sm max-w-md mx-auto">
        <h3 className="text-lg font-bold text-slate-200">No active workspace selected</h3>
        <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
          Please select or create a Pulse Hub workspace on the Dashboard to access the Signal Engine.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Signal Engine</h1>
          <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
            Ingest user reviews, tickets, or support surveys and automatically extract AI-analyzed priority clusters.
          </p>
        </div>
        <button
          onClick={loadFeedback}
          className="p-2 border border-white/5 rounded-xl hover:bg-white/5 text-slate-400 transition"
        >
          <ArrowPathIcon className={`h-4.5 w-4.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Ingestion section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manual Input */}
        <Card hoverGlow={false} className="p-6 space-y-4">
          <div className="flex items-center space-x-2.5">
            <PlusIcon className="h-5 w-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Log Raw User Signal</h3>
          </div>
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <textarea
              required
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste user comment, email message, or chat excerpt..."
              className="w-full px-4 py-3 bg-slate-950/60 border border-white/5 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
            <Button type="submit" loading={loading} className="w-full py-2.5">
              <SparklesIcon className="h-4.5 w-4.5 mr-2" />
              Ingest & Analyze
            </Button>
          </form>
        </Card>

        {/* Document Ingestion */}
        <Card hoverGlow={false} className="p-6 space-y-4 flex flex-col justify-between">
          <div className="flex items-center space-x-2.5">
            <DocumentArrowUpIcon className="h-5 w-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Ingest Signal Document</h3>
          </div>
          <form onSubmit={handleFileUpload} className="space-y-4 flex flex-col justify-between flex-1">
            <label className="border border-dashed border-white/10 hover:border-indigo-500/40 rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer bg-slate-950/20 hover:bg-slate-950/40 transition flex-1">
              <DocumentArrowUpIcon className="h-8 w-8 text-slate-500" />
              <span className="text-2xs font-semibold text-slate-400 mt-2">
                {selectedFile ? selectedFile.name : 'Ingest PDF, DOCX, or TXT specifications'}
              </span>
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
            <Button
              type="submit"
              variant="secondary"
              loading={uploading}
              disabled={!selectedFile}
              className="w-full py-2.5"
            >
              Parse Signals Document
            </Button>
          </form>
        </Card>
      </div>

      {/* Recharts Analytics Panel */}
      {feedbackList.length > 0 && (
        <Card hoverGlow={false} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/10">
          <div className="h-64 flex flex-col items-center justify-between">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sentiment Proportions</h4>
            <div className="w-full h-[80%]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={6}
                    dataKey="value"
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex space-x-4 text-3xs font-extrabold mt-2 uppercase tracking-wider">
              {sentimentData.map(d => (
                <span key={d.name} style={{ color: d.color }}>● {d.name} ({d.value})</span>
              ))}
            </div>
          </div>

          <div className="h-64 flex flex-col items-center justify-between">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Workspace Signals Categorization</h4>
            <div className="w-full h-[90%]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748B" fontSize={8} fontWeight={700} />
                  <YAxis stroke="#64748B" fontSize={8} fontWeight={700} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366F1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      )}

      {/* Signal Log Table */}
      <Card hoverGlow={false} className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white/2">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">User Signals Log ({filteredFeedback.length})</h3>
          
          <div className="flex items-center space-x-3">
            {/* Filter Sentiment */}
            <select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value)}
              className="bg-slate-950/80 border border-white/5 hover:border-indigo-500/30 rounded-xl px-3 py-1.5 text-2xs font-bold text-slate-300 focus:outline-none"
            >
              <option value="all">All Sentiments</option>
              <option value="positive">Positive</option>
              <option value="negative">Negative</option>
              <option value="neutral">Neutral</option>
            </select>

            {/* Filter Category */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-950/80 border border-white/5 hover:border-indigo-500/30 rounded-xl px-3 py-1.5 text-2xs font-bold text-slate-300 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="bug-report">Bug Reports</option>
              <option value="feature-request">Feature Requests</option>
              <option value="improvement">Improvements</option>
              <option value="question">Questions</option>
            </select>
          </div>
        </div>

        {filteredFeedback.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-xs font-semibold">
            No signals match the selection filters.
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-3xs font-extrabold text-slate-500 uppercase tracking-widest bg-white/2">
                  <th className="p-4 pl-6">Signal Summary</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Sentiment</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4 pr-6 text-right">Options</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                {filteredFeedback.map((item) => (
                  <tr key={item._id} className="hover:bg-white/2 transition-colors">
                    <td className="p-4 pl-6 max-w-sm">
                      <p className="truncate font-semibold text-slate-200">{item.content}</p>
                      <span className="text-3xs text-slate-500 uppercase tracking-wide">Origin: {item.source}</span>
                    </td>
                    <td className="p-4 capitalize text-2xs font-bold">{item.category?.replace('-', ' ')}</td>
                    <td className="p-4">
                      <Badge variant={item.sentiment}>{item.sentiment}</Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant={item.priority}>{item.priority}</Badge>
                    </td>
                    <td className="p-4 pr-6 text-right space-x-2">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="p-1 hover:bg-indigo-500/10 rounded-lg text-slate-450 hover:text-indigo-400 transition"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-1 hover:bg-rose-500/10 rounded-lg text-slate-450 hover:text-rose-400 transition"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fadeIn">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setSelectedItem(null)} />
            <div className="bg-slate-900 border border-white/5 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden z-10">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/2">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Aura Signal Insights</h3>
                <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-white">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-5 max-h-[500px] overflow-y-auto custom-scrollbar">
                <div>
                  <h4 className="text-3xs font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Raw User Input</h4>
                  <p className="text-xs bg-slate-950/40 p-4 border border-white/5 rounded-xl text-slate-300 leading-relaxed font-semibold">
                    {selectedItem.content}
                  </p>
                </div>

                {selectedItem.aiAnalysis && (
                  <>
                    <div>
                      <h4 className="text-3xs font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Aura Summary</h4>
                      <p className="text-xs text-slate-200 font-semibold leading-relaxed">
                        {selectedItem.aiAnalysis.summary}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-3xs font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Actionable Horizons Suggestions</h4>
                      <ul className="list-disc pl-5 text-xs text-slate-400 space-y-1.5 mt-1.5 leading-relaxed font-medium">
                        {selectedItem.aiAnalysis.actionableItems.map((action, i) => (
                          <li key={i}>{action}</li>
                        ))}
                      </ul>
                    </div>

                    {selectedItem.extractedKeywords && selectedItem.extractedKeywords.length > 0 && (
                      <div>
                        <h4 className="text-3xs font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Signal Tags</h4>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {selectedItem.extractedKeywords.map((kw, i) => (
                            <span key={i} className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-indigo-400 text-3xs font-bold uppercase tracking-wider">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="border-t border-white/5 pt-4 flex items-center justify-between text-3xs font-extrabold uppercase tracking-widest">
                      <span className="text-slate-500">Urgency Level:</span>
                      <span className="text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-xl">
                        {selectedItem.aiAnalysis.urgencyScore} / 10
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedbackManagement;
