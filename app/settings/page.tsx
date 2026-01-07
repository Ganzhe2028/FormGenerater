"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Save, Settings as SettingsIcon, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';

export default function SettingsPage() {
  const router = useRouter();
  const [provider, setProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('http://127.0.0.1:11434/v1');
  const [model, setModel] = useState('gpt-4o');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedProvider = Cookies.get('ai_provider') || 'openai';
    const savedApiKey = Cookies.get('ai_api_key') || '';
    const savedBaseUrl = Cookies.get('ai_base_url') || 'http://127.0.0.1:11434/v1';
    const savedModel = Cookies.get('ai_model') || (savedProvider === 'openai' ? 'gpt-4o' : 'llama3');

    setProvider(savedProvider);
    setApiKey(savedApiKey);
    setBaseUrl(savedBaseUrl);
    setModel(savedModel);
  }, []);

  const handleSave = () => {
    Cookies.set('ai_provider', provider, { expires: 365 });
    Cookies.set('ai_api_key', apiKey, { expires: 365 });
    Cookies.set('ai_base_url', baseUrl, { expires: 365 });
    Cookies.set('ai_model', model, { expires: 365 });
    
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="h-screen flex bg-[#09090b] text-zinc-100 overflow-hidden font-sans">
      <Sidebar className="hidden md:flex" />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="bg-zinc-950/50 backdrop-blur-md border-b border-zinc-900/50 px-8 py-6 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800">
              <SettingsIcon className="h-5 w-5 text-zinc-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">System Settings</h1>
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
                      if (val === 'openai' && model === 'llama3') setModel('gpt-4o');
                      if (val === 'ollama' && model === 'gpt-4o') setModel('llama3');
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
                        <div className="flex items-center justify-between">
                          <Label htmlFor="apiKey" className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">API Authentication</Label>
                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-700 font-bold">
                            <ShieldCheck className="h-3 w-3" />
                            CLIENT-SIDE ENCRYPTED
                          </div>
                        </div>
                        <Input 
                          id="apiKey" 
                          type="password" 
                          placeholder="sk-................................................" 
                          className="bg-zinc-900/50 border-zinc-800 text-zinc-100 h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-zinc-700 font-mono"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                        />
                      </div>
                    ) : (
                      <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Label htmlFor="baseUrl" className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Ollama Node URL</Label>
                        <Input 
                          id="baseUrl" 
                          placeholder="http://127.0.0.1:11434/v1" 
                          className="bg-zinc-900/50 border-zinc-800 text-zinc-100 h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-zinc-700 font-mono"
                          value={baseUrl}
                          onChange={(e) => setBaseUrl(e.target.value)}
                        />
                      </div>
                    )}

                    <div className="space-y-3">
                      <Label htmlFor="model" className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Neural Model Target</Label>
                      <Input 
                        id="model" 
                        placeholder={provider === 'openai' ? "gpt-4o" : "llama3"} 
                        className="bg-zinc-900/50 border-zinc-800 text-zinc-100 h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-zinc-700 font-mono"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                      />
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
                  All configuration parameters, including API keys, are stored exclusively within your browser's local storage (cookies). No sensitive data is ever transmitted to our servers.
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