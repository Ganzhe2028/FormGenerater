"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFormStore } from '@/store/formStore';
import { FormRenderer } from '@/components/form/FormRenderer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Share2, Eye } from 'lucide-react';
import Link from 'next/link';

export default function BuilderPage() {
  const params = useParams();
  const id = params?.id as string;
  const getForm = useFormStore((state) => state.getForm);
  const [form, setForm] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (id) {
      const foundForm = getForm(id);
      setForm(foundForm);
    }
  }, [id, getForm]);

  if (!mounted) return null; // Hydration fix

  if (!form) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold">Form not found</h1>
        <p className="text-muted-foreground">This form does not exist or was not saved locally.</p>
        <Link href="/">
          <Button variant="link" className="mt-4">Go Home</Button>
        </Link>
      </div>
    );
  }

  const publicUrl = `${window.location.origin}/view/${form.id}`;

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold truncate max-w-[200px] sm:max-w-md">
            {form.title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
           <Link href={`/view/${form.id}`} target="_blank">
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
          </Link>
          <Button onClick={copyLink}>
            <Share2 className="mr-2 h-4 w-4" />
            {copied ? 'Copied!' : 'Share'}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-6 md:p-12 flex justify-center">
        <div className="w-full max-w-3xl">
          <FormRenderer schema={form} isPreview={true} />
          
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Share your form</CardTitle>
              <CardDescription>
                Share this link with others to start collecting responses.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Input value={publicUrl} readOnly />
              <Button onClick={copyLink} variant="secondary">
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
