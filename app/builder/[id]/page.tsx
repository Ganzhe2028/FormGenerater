"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useFormStore } from '@/store/formStore';
import { FormRenderer } from '@/components/form/FormRenderer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Share2, Eye, BarChart3, FileEdit, Download } from 'lucide-react';
import Link from 'next/link';
import * as XLSX from 'xlsx';

export default function BuilderPage() {
  const params = useParams();
  const id = params?.id as string;
  const getForm = useFormStore((state) => state.getForm);
  const [form, setForm] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'builder' | 'submissions'>('builder');

  useEffect(() => {
    setMounted(true);
    if (id) {
      // Try local store first for instant load
      const foundForm = getForm(id);
      if (foundForm) {
        setForm(foundForm);
      } else {
        // Fallback to API
        fetch(`/api/forms/${id}`)
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data) setForm(data);
          });
      }
      
      // Fetch submissions
      fetch(`/api/forms/${id}/submissions`)
        .then(res => res.json())
        .then(data => setSubmissions(data))
        .catch(console.error);
    }
  }, [id, getForm]);

  if (!mounted) return null;

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

  const exportData = (type: 'csv' | 'xlsx') => {
    if (!submissions.length) return;

    // Prepare data for export
    const dataToExport = submissions.map(sub => {
      const row: any = {
        'Submitted At': new Date(sub.submittedAt).toLocaleString(),
      };
      form.fields.forEach((field: any) => {
        let value = sub.data[field.id];
        if (Array.isArray(value)) value = value.join(', ');
        row[field.label] = value || '';
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Submissions');

    // Generate file and trigger download
    const fileName = `${form.title.replace(/\s+/g, '_')}_submissions_${new Date().toISOString().split('T')[0]}`;
    XLSX.writeFile(workbook, `${fileName}.${type}`);
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
        
        {/* Tab Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === 'builder' 
                ? 'bg-white shadow-sm text-black' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileEdit className="w-4 h-4" />
              Builder
            </div>
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === 'submissions' 
                ? 'bg-white shadow-sm text-black' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Submissions
              {submissions.length > 0 && (
                <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full text-xs">
                  {submissions.length}
                </span>
              )}
            </div>
          </button>
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
        {activeTab === 'builder' ? (
          <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
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
        ) : (
          <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                <div>
                  <CardTitle>Submissions</CardTitle>
                  <CardDescription>View all responses collected for this form.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => exportData('csv')}>
                    <Download className="mr-2 h-4 w-4" />
                    CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => exportData('xlsx')}>
                    <Download className="mr-2 h-4 w-4" />
                    Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {submissions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No submissions yet. Share your form to get started!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-700 uppercase">
                        <tr>
                          <th className="px-6 py-3">Submitted At</th>
                          {form.fields.slice(0, 3).map((field: any) => (
                            <th key={field.id} className="px-6 py-3 truncate max-w-[150px]">
                              {field.label}
                            </th>
                          ))}
                          <th className="px-6 py-3">View</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissions.map((sub) => (
                          <tr key={sub.id} className="border-b hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              {new Date(sub.submittedAt).toLocaleString()}
                            </td>
                            {form.fields.slice(0, 3).map((field: any) => (
                              <td key={field.id} className="px-6 py-4 truncate max-w-[200px]">
                                {typeof sub.data[field.id] === 'object' 
                                  ? JSON.stringify(sub.data[field.id]) 
                                  : sub.data[field.id]?.toString() || '-'}
                              </td>
                            ))}
                            <td className="px-6 py-4">
                              <Button variant="ghost" size="sm" onClick={() => alert(JSON.stringify(sub.data, null, 2))}>
                                Details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}