"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormStore } from '@/store/formStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Settings } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Generating...');
  const router = useRouter();
  const addForm = useFormStore((state) => state.addForm);

  const loadingMessages = [
    "Interpreting request...",
    "Consulting the AI architect...",
    "Drafting form schema...",
    "Polishing the UI...",
    "Finalizing form..."
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setLoadingText(loadingMessages[0]);
    
    let messageIndex = 0;
    const intervalId = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      setLoadingText(loadingMessages[messageIndex]);
    }, 2000);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate form');
      }

      const data = await response.json();
      addForm(data);
      router.push(`/builder/${data.id}`);
    } catch (error) {
      console.error(error);
      alert('Something went wrong. Please try again.');
    } finally {
      clearInterval(intervalId);
      setIsLoading(false);
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
            <Textarea
              placeholder="Describe your form..."
              className="min-h-[120px] resize-none text-lg"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <Button
              className="w-full text-lg h-12"
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {loadingText}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Form
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}