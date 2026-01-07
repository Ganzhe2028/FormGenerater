"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [provider, setProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('http://127.0.0.1:11434/v1');
  const [model, setModel] = useState('gpt-4o');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load settings from cookies on mount
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
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold">Settings</h1>
      </header>

      <main className="flex-1 container mx-auto p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>AI Configuration</CardTitle>
            <CardDescription>
              Configure which AI model and provider to use for form generation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="space-y-3">
              <Label>AI Provider</Label>
              <RadioGroup 
                value={provider} 
                onValueChange={(val) => {
                  setProvider(val);
                  // Set default models when switching
                  if (val === 'openai' && model === 'llama3') setModel('gpt-4o');
                  if (val === 'ollama' && model === 'gpt-4o') setModel('llama3');
                }}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="openai" id="openai" />
                  <Label htmlFor="openai">OpenAI (Cloud)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ollama" id="ollama" />
                  <Label htmlFor="ollama">Ollama (Local)</Label>
                </div>
              </RadioGroup>
            </div>

            {provider === 'openai' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <Label htmlFor="apiKey">OpenAI API Key</Label>
                <Input 
                  id="apiKey" 
                  type="password" 
                  placeholder="sk-..." 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Your key is stored locally in your browser cookies.
                </p>
              </div>
            )}

            {provider === 'ollama' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <Label htmlFor="baseUrl">Base URL</Label>
                <Input 
                  id="baseUrl" 
                  placeholder="http://127.0.0.1:11434/v1" 
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Point this to your local Ollama instance (OpenAI compatible endpoint).
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="model">Model Name</Label>
              <Input 
                id="model" 
                placeholder={provider === 'openai' ? "gpt-4o" : "llama3"} 
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Examples: {provider === 'openai' ? 'gpt-4o, gpt-3.5-turbo' : 'llama3, mistral, deepseek-coder'}
              </p>
            </div>

            <Button onClick={handleSave} className="w-full">
              {saved ? 'Settings Saved!' : 'Save Settings'}
            </Button>

          </CardContent>
        </Card>
      </main>
    </div>
  );
}
