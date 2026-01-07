"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useFormStore } from '@/store/formStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Settings, Terminal, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [streamContent, setStreamContent] = useState('');
  const logContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const addForm = useFormStore((state) => state.addForm);

  // Auto-scroll logs
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
    
    // Read Settings for logs
    const provider = Cookies.get('ai_provider') || 'openai';
    const model = Cookies.get('ai_model') || (provider === 'openai' ? 'gpt-4o' : 'llama3');
    
    addLog(`System initialized.`);
    addLog(`Configuration: ${provider.toUpperCase()} / ${model}`);
    addLog(`Prompt: "${prompt.slice(0, 30)}${prompt.length > 30 ? '...' : ''}"`);
    addLog(`Connecting to API...`);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to connect to generation API');
      }

      addLog(`Connection established. Receiving data stream...`);
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let loopCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setStreamContent(prev => prev + chunk);
        
        // Occasionally log a status update to keep it alive
        loopCount++;
        if (loopCount % 20 === 0) {
           // addLog(`Received ${fullText.length} bytes...`);
        }
      }

      addLog(`Stream finished. Total ${fullText.length} bytes.`);
      addLog(`Parsing JSON schema...`);

      let formData;
      try {
        // Handle potential markdown wrapping (e.g. ```json ... ```)
        const cleanText = fullText.replace(/```json/g, '').replace(/```/g, '').trim();
        formData = JSON.parse(cleanText);
      } catch (e) {
        addLog(`ERROR: JSON Parse failed.`);
        console.error("JSON Parse Error:", e);
        throw new Error("Invalid JSON received from AI");
      }

      addLog(`Validating structure... OK.`);
      addLog(`Saving form to database...`);

      // Save the form
      const saveResponse = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!saveResponse.ok) throw new Error('Failed to save form');

      addLog(`Form saved (ID: ${formData.id}). Redirecting...`);

      // Update local store and redirect
      addForm(formData);
      setTimeout(() => {
        router.push(`/builder/${formData.id}`);
      }, 800);

    } catch (error: any) {
      console.error(error);
      addLog(`CRITICAL ERROR: ${error.message}`);
      addLog(`Terminating process.`);
      // Keep loading state true for a moment so user can read error? 
      // Or provide a reset button.
      // For now, we'll alert and reset after 3s
      alert('Generation failed. See logs.');
      setTimeout(() => setIsLoading(false), 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 relative">
      <div className="absolute top-6 right-6">
        <Link href="/settings">
          <Button variant="ghost" className="h-16 w-16 rounded-full">
            <Settings className="h-10 w-10 text-gray-500 hover:text-gray-900" />
          </Button>
        </Link>
      </div>
      <div className="max-w-xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            AI Form Generator
          </h1>
          <p className="text-muted-foreground">
            Describe your form in plain English, and we'll build it for you in seconds.
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>What kind of form do you need?</CardTitle>
            <CardDescription>
              E.g., "A registration form for a hackathon with name, email, dietary restrictions, and team name."
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="bg-black rounded-md p-4 h-[320px] overflow-y-auto font-mono text-xs shadow-inner border border-green-900 flex flex-col gap-4" ref={logContainerRef}>
                {/* System Logs */}
                <div className="text-green-400 space-y-1 shrink-0">
                  <div className="flex items-center gap-2 border-b border-green-900 pb-2 mb-2 text-green-600 opacity-70">
                     <Terminal className="h-3 w-3" />
                     <span className="uppercase tracking-wider">System Events</span>
                  </div>
                  {logs.map((log, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <ChevronRight className="h-3 w-3 mt-[2px] shrink-0 opacity-50" />
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
                
                {/* Raw Stream Content */}
                {streamContent && (
                  <div className="pt-2 border-t border-green-900/50 text-gray-400 animate-in fade-in slide-in-from-bottom-2">
                    <div className="mb-2 text-[10px] uppercase tracking-wider text-green-600 opacity-70">Raw Output Stream</div>
                    <pre className="whitespace-pre-wrap break-all font-mono text-[10px] leading-3 opacity-80 text-gray-300">
                      {streamContent}
                      <span className="animate-pulse inline-block w-1.5 h-3 bg-green-500 ml-0.5 align-middle"></span>
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Textarea
                  placeholder="Describe your form..."
                  className="min-h-[120px] resize-none text-lg"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleGenerate();
                    }
                  }}
                />
                <Button
                  className="w-full text-lg h-12"
                  onClick={handleGenerate}
                  disabled={isLoading || !prompt.trim()}
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Form
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}