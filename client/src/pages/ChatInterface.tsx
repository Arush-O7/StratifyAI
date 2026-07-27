import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '../components/UI/Button';
import { Card } from '../components/UI/Card';
import { Badge } from '../components/UI/Badge';
import { useToast } from '../context/ToastContext';
import {
  PaperAirplaneIcon,
  SparklesIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

const ChatInterface: React.FC = () => {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(
    localStorage.getItem('activeProjectId')
  );
  const [activeProjectName, setActiveProjectName] = useState<string | null>(
    localStorage.getItem('activeProjectName')
  );
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const toast = useToast();
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [enhancing, setEnhancing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Monitor active project changes
  useEffect(() => {
    const handleStorageChange = () => {
      setActiveProjectId(localStorage.getItem('activeProjectId'));
      setActiveProjectName(localStorage.getItem('activeProjectName'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Initialize or fetch Chat Session for the project
  useEffect(() => {
    const initializeChat = async () => {
      if (!activeProjectId) return;
      try {
        setLoading(true);
        const response: any = await api.get(`/chat/project/${activeProjectId}/sessions`);
        if (response.success && response.data && response.data.length > 0) {
          const latestSession = response.data[0];
          setSessionId(latestSession.sessionId);
          const fullSession: any = await api.get(`/chat/sessions/${latestSession.sessionId}`);
          if (fullSession.success) {
            setMessages(fullSession.data.messages || []);
          }
        } else {
          const newSessionRes: any = await api.post('/chat/sessions', {
            projectId: activeProjectId,
            title: `Chat Session - ${activeProjectName || 'Project'}`
          });
          if (newSessionRes.success && newSessionRes.data) {
            setSessionId(newSessionRes.data.sessionId);
            setMessages([]);
          }
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeChat();
  }, [activeProjectId, activeProjectName]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !sessionId) return;

    const userMsg = inputText.trim();
    setInputText('');
    
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const response: any = await api.post(`/chat/sessions/${sessionId}/messages`, {
        content: userMsg,
        agent: 'general'
      });
      
      if (response.success && response.data) {
        const sessionMessages = response.data.messages;
        if (sessionMessages && sessionMessages.length > 0) {
          const assistantReply = sessionMessages[sessionMessages.length - 1];
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: assistantReply.content
          }]);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I encountered an error processing your query. Please make sure your Gemini credentials are configured.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleEnhanceTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskDesc.trim() || !activeProjectId) return;

    setEnhancing(true);
    try {
      const response: any = await api.post('/tasks/enhance', {
        title: taskTitle,
        description: taskDesc,
        projectId: activeProjectId
      });

      if (response.success && response.data) {
        const enhancedResult = response.data.enhancedDescription;
        
        setMessages(prev => [
          ...prev,
          { role: 'user', content: `Aura Enhancement:\nTitle: ${taskTitle}\nDescription: ${taskDesc}` },
          { role: 'assistant', content: enhancedResult }
        ]);
        
        setTaskTitle('');
        setTaskDesc('');
        toast.success('Task enhanced with acceptance criteria!');
      }
    } catch (error) {
      console.error('Error enhancing task:', error);
      toast.error('AI task enhancement failed.');
    } finally {
      setEnhancing(false);
    }
  };

  const starterPrompts = [
    { title: 'Assess Customer Pain Points', prompt: 'Analyze recent user signals and identify the top 3 customer pain points.' },
    { title: 'Prioritize Roadmap Backlog', prompt: 'Based on strategic project objectives, suggest features that should go into the "Now" phase.' },
    { title: 'Competitor MVP Requirements', prompt: 'List standard MVP requirements for a modern B2B SaaS authorization system.' }
  ];

  if (!activeProjectId) {
    return (
      <div className="text-center py-16 bg-slate-900/40 border border-white/5 rounded-2xl p-8 shadow-sm max-w-md mx-auto">
        <h3 className="text-lg font-bold text-slate-200">No active workspace selected</h3>
        <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
          Please select or create a Pulse Hub workspace on the Dashboard to chat with Aura Copilot.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-10rem)] max-h-[800px] animate-fadeIn">
      {/* Sidebar Tool: Task Enhancer */}
      <Card hoverGlow={false} className="p-6 flex flex-col justify-between h-full order-last lg:order-first">
        <div className="space-y-4">
          <div className="flex items-center space-x-2.5 border-b border-white/5 pb-3">
            <ClipboardDocumentCheckIcon className="h-5 w-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Aura Task Enhancer</h3>
          </div>
          <p className="text-slate-500 text-3xs font-semibold leading-relaxed uppercase tracking-wider">
            Input a basic task title and description. Aura Copilot will format it with Acceptance Criteria and technical suggestions.
          </p>

          <form onSubmit={handleEnhanceTask} className="space-y-3.5 pt-2">
            <div>
              <label className="block text-3xs font-extrabold text-slate-500 uppercase tracking-widest mb-1">
                Task Title
              </label>
              <input
                type="text"
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950/60 border border-white/5 rounded-xl text-white text-xs placeholder-slate-550 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="e.g. Implement OAuth login"
              />
            </div>

            <div>
              <label className="block text-3xs font-extrabold text-slate-500 uppercase tracking-widest mb-1">
                Description
              </label>
              <textarea
                required
                rows={4}
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950/60 border border-white/5 rounded-xl text-white text-xs placeholder-slate-550 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                placeholder="e.g. We need to let users sign in with Google or GitHub."
              />
            </div>

            <Button type="submit" loading={enhancing} className="w-full py-2 text-xs">
              Enhance task card
            </Button>
          </form>
        </div>

        <div className="text-3xs font-extrabold tracking-widest text-slate-500 text-center uppercase">
          Powered by Gemini 2.0 Flash
        </div>
      </Card>

      {/* Main Chat Assistant */}
      <Card hoverGlow={false} className="lg:col-span-2 p-0 flex flex-col h-full overflow-hidden">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/2">
          <div className="flex items-center space-x-2">
            <SparklesIcon className="h-5 w-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Aura Copilot — <span className="text-indigo-400">{activeProjectName}</span>
            </h3>
          </div>
          <Badge variant="indigo">active</Badge>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-950/20">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center space-y-6 max-w-sm mx-auto">
              <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 font-bold text-lg">
                A
              </div>
              <div>
                <h4 className="font-bold text-slate-250 uppercase text-xs tracking-wider">Aura Workspace PM Copilot</h4>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed font-medium">
                  Ask strategy questions, request horizon allocations, or select a quick starter prompt to initialize.
                </p>
              </div>

              <div className="w-full space-y-2">
                {starterPrompts.map((starter, i) => (
                  <button
                    key={i}
                    onClick={() => setInputText(starter.prompt)}
                    className="w-full text-left px-4 py-3 bg-slate-900 border border-white/5 hover:border-indigo-500/30 rounded-xl text-2xs font-bold text-slate-400 hover:text-slate-200 transition flex items-center justify-between cursor-pointer"
                  >
                    <span>{starter.title}</span>
                    <ChevronRightIcon className="h-3.5 w-3.5 text-slate-500" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                return (
                  <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                        isUser
                          ? 'bg-indigo-600 text-white rounded-tr-none border border-indigo-600/30 shadow-md shadow-indigo-600/10'
                          : 'bg-slate-900/60 border border-white/5 text-slate-200 rounded-tl-none shadow-sm'
                      }`}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                );
              })}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-900/40 border border-white/5 text-slate-400 rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm flex items-center space-x-2 text-2xs font-bold">
                    <ArrowPathIcon className="h-4 w-4 animate-spin text-indigo-400" />
                    <span>Aura Copilot is computing...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 flex items-center space-x-3 bg-slate-900/30">
          <input
            type="text"
            required
            disabled={loading}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type project strategic query..."
            className="flex-1 px-4 py-2.5 bg-slate-950/60 border border-white/5 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition cursor-pointer"
          >
            <PaperAirplaneIcon className="h-4.5 w-4.5" />
          </button>
        </form>
      </Card>
    </div>
  );
};

export default ChatInterface;
