"use client";

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Save, Settings as SettingsIcon, ShieldCheck, RefreshCw, AlertCircle, Edit3, List } from 'lucide-react';
import Cookies from 'js-cookie';
import { Sidebar } from '@/components/Sidebar';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [provider, setProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('http://127.0.0.1:11434/v1');
  const [model, setModel] = useState('gpt-4o');
  const [saved, setSaved] = useState(false);
  
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isManualMode, setIsManualMode] = useState(false);

  const fetchOllamaModels = useCallback(async (url: string) => {
    setIsFetchingModels(true);
    setFetchError(null);
    try {
      // Use server-side proxy to avoid CORS issues with local Ollama
      const response = await fetch(`/api/ollama/models?baseUrl=${encodeURIComponent(url)}`);
      
      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({ error: 'Failed to fetch models' }))) as { error: string };
        throw new Error(errorData.error || 'Failed to fetch models');
      }
      
      const data = await response.json();
      const modelNames = data.data.map((m: { id: string }) => m.id);
      setOllamaModels(modelNames);
      setFetchError(null);
      // If we got models, we can stay in select mode unless user forced manual
    } catch (err: unknown) {
      console.error("Error fetching Ollama models:", err);
      const message = err instanceof Error ? err.message : "Ollama connection failed. Switch to manual mode if needed.";
      setFetchError(message);
      setOllamaModels([]);
      setIsManualMode(true); // Auto fallback to manual if connection fails
    } finally {
      setIsFetchingModels(false);
    }
  }, []);

  useEffect(() => {
    const savedProvider = Cookies.get('ai_provider') || 'openai';
    const savedApiKey = Cookies.get('ai_api_key') || '';
    const savedBaseUrl = Cookies.get('ai_base_url') || 'http://127.0.0.1:11434/v1';
    const savedModel = Cookies.get('ai_model') || (savedProvider === 'openai' ? 'gpt-4o' : 'llama3');

    setProvider(savedProvider);
    setApiKey(savedApiKey);
    setBaseUrl(savedBaseUrl);
    setModel(savedModel);

    if (savedProvider === 'ollama') {
      fetchOllamaModels(savedBaseUrl);
    }
  }, [fetchOllamaModels]);

  const handleSave = () => {
    Cookies.set('ai_provider', provider, { expires: 365 });
    Cookies.set('ai_api_key', apiKey, { expires: 365 });
    Cookies.set('ai_base_url', baseUrl, { expires: 365 });
    Cookies.set('ai_model', model, { expires: 365 });
    
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const openAiModels = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];

  return (
    <div className="h-screen flex bg-[#09090b] text-zinc-100 overflow-hidden font-sans">
      <Sidebar className="hidden md:flex" />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="bg-zinc-950/50 backdrop-blur-md border-b border-zinc-900/50 px-8 py-6 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800">
              <SettingsIcon className="h-5 w-5 text-zinc-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">System Settings</h1>
              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5">Configuration Panel</p>
            </div>
          </div>
          
          <Button 
            onClick={handleSave} 
            className="bg-white text-black hover:bg-zinc-200 font-bold px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)]"
          >
            <Save className="mr-2 h-4 w-4" />
            {saved ? 'Changes Saved' : 'Save Configuration'}
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
          <div className="max-w-2xl mx-auto w-full space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 bg-white rounded-full" />
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">Intelligence Provider</h2>
              </div>
              
              <Card className="bg-zinc-950 border-zinc-800/50 rounded-[2rem] overflow-hidden shadow-2xl">
                <CardContent className="p-8 space-y-8">
                  <RadioGroup 
                    value={provider} 
                    onValueChange={(val) => {
                      setProvider(val);
                      if (val === 'openai') {
                        setModel('gpt-4o');
                        setIsManualMode(false);
                      } else {
                        fetchOllamaModels(baseUrl);
                      }
                    }}
                    className="grid grid-cols-2 gap-4"
                  >
                    {[
                      { id: 'openai', label: 'OpenAI Cloud', desc: 'GPT-4o / GPT-3.5' },
                      { id: 'ollama', label: 'Ollama Local', desc: 'Llama3 / Mistral' }
                    ].map((item) => (
                      <div key={item.id} className="relative">
                        <RadioGroupItem value={item.id} id={item.id} className="peer sr-only" />
                        <Label 
                          htmlFor={item.id}
                          className="flex flex-col gap-1 p-6 rounded-2xl border border-zinc-900 bg-zinc-900/20 hover:bg-zinc-900/40 cursor-pointer transition-all peer-data-[state=checked]:border-white peer-data-[state=checked]:bg-zinc-900/60 group"
                        >
                          <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">{item.label}</span>
                          <span className="text-[10px] text-zinc-600 font-medium">{item.desc}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  <div className="space-y-6 pt-4 border-t border-zinc-900/50">
                    {provider === 'openai' ? (
                      <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Label htmlFor="apiKey" className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">API Authentication</Label>
                        <Input 
                          id="apiKey" 
                          type="password" 
                          placeholder="sk-................................................" 
                          className="bg-zinc-900/50 border-zinc-800 text-zinc-100 h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-zinc-700 font-mono placeholder:text-zinc-800"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                        />
                      </div>
                    ) : (
                      <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="baseUrl" className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Ollama Node URL</Label>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-zinc-500 hover:text-white"
                            onClick={() => fetchOllamaModels(baseUrl)}
                            disabled={isFetchingModels}
                          >
                            <RefreshCw className={cn("h-3 w-3", isFetchingModels && "animate-spin")} />
                          </Button>
                        </div>
                        <Input 
                          id="baseUrl" 
                          placeholder="http://127.0.0.1:11434/v1" 
                          className="bg-zinc-900/50 border-zinc-800 text-zinc-100 h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-zinc-700 font-mono"
                          value={baseUrl}
                          onChange={(e) => setBaseUrl(e.target.value)}
                        />
                        {fetchError && (
                          <div className="flex items-center gap-2 text-amber-500/80 text-[10px] font-bold pl-1 uppercase tracking-tight">
                            <AlertCircle className="h-3 w-3" />
                            {fetchError}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="model" className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Neural Model Target</Label>
                        {provider === 'ollama' && ollamaModels.length > 0 && (
                          <button 
                            onClick={() => setIsManualMode(!isManualMode)}
                            className="text-[10px] font-bold text-zinc-600 hover:text-zinc-400 flex items-center gap-1.5 transition-colors uppercase tracking-widest"
                          >
                            {isManualMode ? <List className="h-3 w-3" /> : <Edit3 className="h-3 w-3" />}
                            {isManualMode ? "Switch to List" : "Manual Type"}
                          </button>
                        )}
                      </div>
                      
                      {provider === 'ollama' && !isManualMode && ollamaModels.length > 0 ? (
                        <Select value={model} onValueChange={setModel}>
                          <SelectTrigger className="bg-zinc-900/50 border-zinc-800 text-zinc-100 h-12 rounded-xl focus:ring-1 focus:ring-zinc-700 font-mono">
                            <SelectValue placeholder="Select a model" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                            {ollamaModels.map((m) => (
                              <SelectItem key={m} value={m} className="focus:bg-zinc-800 focus:text-white font-mono text-xs">
                                {m}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : provider === 'openai' ? (
                        <Select value={model} onValueChange={setModel}>
                          <SelectTrigger className="bg-zinc-900/50 border-zinc-800 text-zinc-100 h-12 rounded-xl focus:ring-1 focus:ring-zinc-700 font-mono">
                            <SelectValue placeholder="Select OpenAI model" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                            {openAiModels.map((m) => (
                              <SelectItem key={m} value={m} className="focus:bg-zinc-800 focus:text-white font-mono text-xs">
                                {m}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input 
                          id="model" 
                          placeholder="e.g. llama3" 
                          className="bg-zinc-900/50 border-zinc-800 text-zinc-100 h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-zinc-700 font-mono"
                          value={model}
                          onChange={(e) => setModel(e.target.value)}
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
            
            <div className="p-8 rounded-[2rem] border border-zinc-900 bg-zinc-950/30 flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-zinc-900 flex items-center justify-center shrink-0 border border-zinc-800">
                 <ShieldCheck className="h-5 w-5 text-zinc-500" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-zinc-300">Data Privacy Note</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  All configuration parameters, including API keys, are stored exclusively within your browser&apos;s local storage (cookies). No sensitive data is ever transmitted to our servers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #18181b;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}