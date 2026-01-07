"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useFormStore } from '@/store/formStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Settings, Terminal, ChevronRight, History, Trash2, ExternalLink } from 'lucide-react';
import { FormSchema } from '@/types';
import Link from 'next/link';
import Cookies from 'js-cookie';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [streamContent, setStreamContent] = useState('');
  const [history, setHistory] = useState<FormSchema[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const addForm = useFormStore((state) => state.addForm);

  // Fetch history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/forms');
      if (res.ok) {
        const data = await res.json();
        // Newest on top is already handled by db.ts but we ensure it here
        setHistory(data);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this form history?')) return;

    try {
      const res = await fetch(`/api/forms/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHistory(prev => prev.filter(f => f.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete form:', error);
    }
  };

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, streamContent]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString().split(' ')[0]}] ${msg}`]);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setLogs([]);
    setStreamContent('');
    
    const provider = Cookies.get('ai_provider') || 'openai';
    const model = Cookies.get('ai_model') || (provider === 'openai' ? 'gpt-4o' : 'llama3');
    
    addLog(`Initializing ${model}...`);
    addLog(`Connecting...`);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok || !response.body) throw new Error('Failed to connect');

      addLog(`Stream started.`);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setStreamContent(prev => prev + chunk);
      }

      addLog(`Success. Parsing...`);

      let formData;
      try {
        const cleanText = fullText.replace(/```json/g, '').replace(/```/g, '').trim();
        formData = JSON.parse(cleanText);
      } catch (e) {
        throw new Error("Invalid JSON");
      }

      const saveResponse = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!saveResponse.ok) throw new Error('Save failed');

      addForm(formData);
      fetchHistory();
      setTimeout(() => {
        router.push(`/builder/${formData.id}`);
      }, 500);

    } catch (error: any) {
      addLog(`ERROR: ${error.message}`);
      alert('Failed: ' + error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 overflow-hidden font-sans">
      {/* Sidebar - Grok Style */}
      <aside className="w-72 border-r border-zinc-200 dark:border-zinc-800 flex flex-col hidden md:flex">
        <div className="p-5 flex items-center gap-3">
          <div className="h-8 w-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white dark:text-black" />
          </div>
          <h2 className="font-bold text-xl tracking-tight">Monk Form</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
          <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">History</div>
          {history.length === 0 ? (
            <div className="px-3 py-4 text-sm text-zinc-400 italic">No history yet</div>
          ) : (
            history.map((form) => (
              <div 
                key={form.id} 
                className="group relative flex items-center justify-between p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all cursor-pointer border border-transparent"
                onClick={() => router.push(`/builder/${form.id}`)}
              >
                <div className="flex flex-col overflow-hidden pr-6">
                  <span className="text-sm font-medium truncate">{form.title}</span>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                    <span>{new Date(form.createdAt).toLocaleDateString()}</span>
                    <span className="opacity-50">•</span>
                    <span>{new Date(form.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                  onClick={(e) => handleDelete(e, form.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 mt-auto">
          <Button variant="secondary" className="w-full justify-start gap-2 rounded-xl" onClick={() => setPrompt('')}>
            <Sparkles className="h-4 w-4" />
            New Form
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-zinc-50/50 dark:bg-black/20">
        {/* Top Header / Settings */}
        <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
          <div className="md:hidden flex items-center gap-2">
             <h2 className="font-bold text-xl tracking-tight">Monk Form</h2>
          </div>
          <div className="ml-auto">
            <Link href="/settings">
              <Button variant="ghost" className="h-12 w-12 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all">
                <Settings className="h-7 w-7 text-zinc-600 dark:text-zinc-400" />
              </Button>
            </Link>
          </div>
        </header>

        {/* Center Prompt Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-3xl mx-auto w-full">
          <div className="w-full space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {!isLoading && (
              <div className="text-center space-y-4 mb-4">
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                  What should we build?
                </h1>
                <p className="text-xl text-zinc-500 dark:text-zinc-400 font-medium max-w-lg mx-auto">
                  Explain your form ideas in natural language.
                </p>
              </div>
            )}

            {isLoading && (
              <div className="w-full space-y-6">
                <div className="bg-zinc-900 dark:bg-zinc-900/50 rounded-2xl p-6 h-[400px] overflow-hidden flex flex-col border border-zinc-800 shadow-2xl relative">
                  <div className="flex items-center gap-2 text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-bold mb-4 border-b border-zinc-800 pb-3">
                    <Terminal className="h-3 w-3" />
                    Neural Generation Engine
                  </div>
                  
                  <div className="flex-1 overflow-y-auto font-mono text-sm custom-scrollbar" ref={logContainerRef}>
                    {logs.map((log, i) => (
                      <div key={i} className="flex gap-3 text-zinc-400 mb-1 animate-in fade-in duration-300">
                        <span className="text-zinc-600 shrink-0">›</span>
                        <span className="leading-relaxed">{log}</span>
                      </div>
                    ))}
                    {streamContent && (
                      <div className="mt-6 pt-4 border-t border-zinc-800/50">
                        <div className="text-[10px] text-zinc-600 font-bold mb-3 uppercase tracking-widest">Stream Output</div>
                        <div className="text-zinc-500 text-xs leading-4 break-all opacity-80 italic">
                          {streamContent}
                          <span className="inline-block w-1.5 h-4 bg-zinc-400 animate-pulse ml-1 align-middle" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-zinc-900 to-transparent pointer-events-none" />
                </div>
                <div className="flex justify-center">
                  <Loader2 className="h-8 w-8 text-zinc-500 animate-spin" />
                </div>
              </div>
            )}

            {!isLoading && (
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
                  <Textarea
                    placeholder="E.g. A customer feedback form for a high-end restaurant..."
                    className="w-full min-h-[160px] p-6 text-xl bg-transparent border-none focus-visible:ring-0 resize-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleGenerate();
                      }
                    }}
                  />
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex justify-end items-center gap-3">
                    <span className="text-xs text-zinc-400 font-medium mr-auto pl-2">
                      Press <kbd className="px-1.5 py-0.5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[10px]">Enter</kbd> to generate
                    </span>
                    <Button 
                      className="rounded-xl px-6 h-11 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black hover:scale-105 transition-transform font-bold"
                      onClick={handleGenerate}
                      disabled={!prompt.trim()}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {!isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                <button 
                  onClick={() => setPrompt("A simple contact form for my portfolio website.")}
                  className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900/50 text-left transition-all"
                >
                  <p className="text-sm font-semibold mb-1 text-zinc-900 dark:text-zinc-100">Contact Form</p>
                  <p className="text-xs text-zinc-500">Basic name, email, and message.</p>
                </button>
                <button 
                  onClick={() => setPrompt("An event RSVP form with dietary choices and number of guests.")}
                  className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900/50 text-left transition-all"
                >
                  <p className="text-sm font-semibold mb-1 text-zinc-900 dark:text-zinc-100">Event RSVP</p>
                  <p className="text-xs text-zinc-500">Collect guest details and preferences.</p>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3f3f46;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #52525b;
        }
      `}</style>
    </div>
  );
}