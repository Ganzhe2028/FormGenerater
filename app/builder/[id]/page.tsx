"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useFormStore } from '@/store/formStore';
import { FormRenderer } from '@/components/form/FormRenderer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Share2, Eye, BarChart3, FileEdit, Download, Pencil, Check, X } from 'lucide-react';
import Link from 'next/link';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export default function BuilderPage() {
  const params = useParams();
  const id = params?.id as string;
  const getForm = useFormStore((state) => state.getForm);
  const [form, setForm] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'builder' | 'submissions'>('builder');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');

  useEffect(() => {
    setMounted(true);
    if (id) {
      // Try local store first for instant load
      const foundForm = getForm(id);
      if (foundForm) {
        setForm(foundForm);
        setTitleInput(foundForm.title);
      } else {
        // Fallback to API
        fetch(`/api/forms/${id}`)
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data) {
              setForm(data);
              setTitleInput(data.title);
            }
          });
      }
      
      // Fetch submissions
      fetch(`/api/forms/${id}/submissions`)
        .then(res => res.json())
        .then(data => setSubmissions(data))
        .catch(console.error);
    }
  }, [id, getForm]);

  const saveTitle = async () => {
    if (!titleInput.trim() || titleInput === form.title) {
      setIsEditingTitle(false);
      setTitleInput(form.title);
      return;
    }

    const updatedForm = { ...form, title: titleInput };
    setForm(updatedForm); // Optimistic update
    setIsEditingTitle(false);

    try {
      await fetch(`/api/forms/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: titleInput }),
      });
      // Also update global store if needed
      useFormStore.getState().addForm(updatedForm);
    } catch (error) {
      console.error('Failed to update title:', error);
      // Revert on error
      setForm(form);
      setTitleInput(form.title);
    }
  };

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

  const exportData = async (type: 'csv' | 'xlsx') => {
    if (!submissions.length) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Submissions');

    // Define columns
    const columns = [
      { header: 'Submitted At', key: 'submittedAt', width: 25 },
      ...form.fields.map((field: any) => ({
        header: field.label,
        key: field.id,
        width: 20
      }))
    ];
    worksheet.columns = columns;

    // Add rows
    submissions.forEach(sub => {
      const row: any = {
        submittedAt: new Date(sub.submittedAt).toLocaleString(),
      };
      form.fields.forEach((field: any) => {
        let value = sub.data[field.id];
        if (Array.isArray(value)) value = value.join(', ');
        row[field.id] = value || '';
      });
      worksheet.addRow(row);
    });

    // Generate file and trigger download
    const fileName = `${form.title.replace(/\s+/g, '_')}_submissions_${new Date().toISOString().split('T')[0]}`;

    if (type === 'xlsx') {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `${fileName}.xlsx`);
    } else {
      const buffer = await workbook.csv.writeBuffer();
      const blob = new Blob([buffer], { type: 'text/csv;charset=utf-8' });
      saveAs(blob, `${fileName}.csv`);
    }
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
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                className="h-8 w-[200px] sm:w-[300px]"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveTitle();
                  if (e.key === 'Escape') {
                    setIsEditingTitle(false);
                    setTitleInput(form.title);
                  }
                }}
              />
              <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={saveTitle}>
                <Check className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => {
                setIsEditingTitle(false);
                setTitleInput(form.title);
              }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h1 className="text-xl font-semibold truncate max-w-[200px] sm:max-w-md cursor-pointer hover:underline decoration-dashed underline-offset-4" onClick={() => setIsEditingTitle(true)}>
                {form.title}
              </h1>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setIsEditingTitle(true)}
              >
                <Pencil className="h-3 w-3 text-gray-500" />
              </Button>
            </div>
          )}
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