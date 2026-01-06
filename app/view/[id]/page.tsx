"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useFormStore } from '@/store/formStore';
import { FormRenderer } from '@/components/form/FormRenderer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ViewPage() {
  const params = useParams();
  const id = params?.id as string;
  const getForm = useFormStore((state) => state.getForm);
  const [form, setForm] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (id) {
      const foundForm = getForm(id);
      setForm(foundForm);
    }
  }, [id, getForm]);

  if (!mounted) return null;

  if (!form) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md p-6 text-center">
           <h1 className="text-xl font-bold mb-2">Form not found</h1>
           <p className="text-muted-foreground mb-4">
             This form might have been deleted or does not exist on this device.
           </p>
           <Link href="/">
            <Button>Create your own form</Button>
           </Link>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (data: any) => {
    // Log to console as per MVP
    console.log('Form Submission:', { formId: form.id, data });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md text-center p-8">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl mb-2">Thank You!</CardTitle>
          <p className="text-muted-foreground mb-6">
            Your submission has been received.
          </p>
          <Button onClick={() => window.location.reload()}>
            Submit another response
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="w-full max-w-2xl">
        <FormRenderer schema={form} onSubmit={handleSubmit} />
        <div className="mt-8 text-center text-sm text-muted-foreground">
          Powered by <Link href="/" className="underline hover:text-primary">AI Form Generator</Link>
        </div>
      </div>
    </div>
  );
}
