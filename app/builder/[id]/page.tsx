"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useFormStore } from '@/store/formStore';
import { FormRenderer } from '@/components/form/FormRenderer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Share2, Eye, BarChart3, FileEdit, Download, Pencil, Check, X } from 'lucide-react';
import Link from 'next/link';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { cn } from '@/lib/utils';
import { Sidebar } from '@/components/Sidebar';
import { FormSchema, Submission, FormField } from '@/types';

export default function BuilderPage() {
  const params = useParams();
  const id = params?.id as string;
  const getForm = useFormStore((state) => state.getForm);
  const [form, setForm] = useState<FormSchema | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'builder' | 'submissions'>('builder');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [showHighlight, setShowHighlight] = useState(false);

  useEffect(() => {
    // Avoid synchronous state update during render
    const timer = setTimeout(() => {
      setMounted(true);
      setShowHighlight(true);
      // Remove highlight after 5 seconds
      setTimeout(() => setShowHighlight(false), 5000);
      
      if (id) {
        const foundForm = getForm(id);
        if (foundForm) {
          setForm(foundForm);
          setTitleInput(foundForm.title);
        } else {
          fetch(`/api/forms/${id}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
              if (data) {
                setForm(data);
                setTitleInput(data.title);
              }
            });
        }
        
        fetch(`/api/forms/${id}/submissions`)
          .then(res => res.json())
          .then(data => setSubmissions(data))
          .catch(console.error);
      }
    }, 0);
    
    return () => clearTimeout(timer);
  }, [id, getForm]);

  const saveTitle = async () => {
    if (!titleInput.trim() || titleInput === form.title) {
      setIsEditingTitle(false);
      setTitleInput(form.title);
      return;
    }

    const updatedForm = { ...form, title: titleInput };
    setForm(updatedForm);
    setIsEditingTitle(false);

    try {
      await fetch(`/api/forms/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: titleInput }),
      });
      useFormStore.getState().addForm(updatedForm);
    } catch (error) {
      console.error('Failed to update title:', error);
      setForm(form);
      setTitleInput(form.title);
    }
  };

  if (!mounted) return null;

  if (!form) {
    return (
      <div className="flex h-screen bg-[#09090b] text-zinc-100">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold">Form not found</h1>
          <p className="text-zinc-500">This form does not exist or was not saved locally.</p>
          <Link href="/">
            <Button variant="link" className="mt-4 text-zinc-400">Go Home</Button>
          </Link>
        </div>
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
    const columns = [
      { header: 'Submitted At', key: 'submittedAt', width: 25 },
      ...form.fields.map((field: FormField) => ({ header: field.label, key: field.id, width: 20 }))
    ];
    worksheet.columns = columns;
    submissions.forEach(sub => {
      const row: Record<string, string | number> = { submittedAt: new Date(sub.submittedAt).toLocaleString() };
      form.fields.forEach((field: FormField) => {
        let value = sub.data[field.id];
        if (Array.isArray(value)) value = value.join(', ');
        row[field.id] = (value as string | number) || '';
      });
      worksheet.addRow(row);
    });
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
    <div className="h-screen flex bg-[#09090b] text-zinc-100 overflow-hidden font-sans">
      <Sidebar className="hidden md:flex" />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="bg-zinc-950/50 backdrop-blur-md border-b border-zinc-900/50 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-4 max-w-[30%]">
            {isEditingTitle ? (
              <div className="flex items-center gap-2 w-full">
                <Input
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="h-8 min-w-[150px] w-full bg-zinc-900 border-zinc-800 text-sm"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveTitle();
                    if (e.key === 'Escape') {
                      setIsEditingTitle(false);
                      setTitleInput(form.title);
                    }
                  }}
                />
                <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500 hover:bg-green-500/10 shrink-0" onClick={saveTitle}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-500/10 shrink-0" onClick={() => {
                  setIsEditingTitle(false);
                  setTitleInput(form.title);
                }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group overflow-hidden">
                <h1 className="text-sm font-bold truncate cursor-pointer hover:text-white transition-colors" onClick={() => setIsEditingTitle(true)}>
                  {form.title}
                </h1>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-zinc-500"
                  onClick={() => setIsEditingTitle(true)}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          
          {/* Tab Switcher - Premium Style */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex bg-zinc-900/50 border border-zinc-900/50 p-1 rounded-xl shadow-2xl">
            <button
              onClick={() => setActiveTab('builder')}
              className={cn(
                "px-5 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all flex items-center gap-2",
                activeTab === 'builder' 
                  ? "bg-zinc-100 text-black shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <FileEdit className="w-3 h-3" />
              Builder
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={cn(
                "px-5 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all flex items-center gap-2",
                activeTab === 'submissions' 
                  ? "bg-zinc-100 text-black shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <BarChart3 className="w-3 h-3" />
              Submissions
              {submissions.length > 0 && (
                <span className="bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded-full text-[9px]">
                  {submissions.length}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-3 relative">
            {/* Floating Guide Tip - Below the buttons, tail pointing up */}
            {showHighlight && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce z-50">
                {/* Tail (Triangle) at the TOP */}
                <div className="w-2 h-2 bg-white rotate-45 -mb-1 shadow-sm z-10"></div>
                {/* Content Box */}
                <div className="bg-white text-black text-[10px] font-bold px-3 py-1.5 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center gap-1.5 whitespace-nowrap">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                  Ready to Publish
                </div>
              </div>
            )}

            <div className={cn(
              "flex items-center gap-3 p-1 rounded-xl transition-all duration-1000 relative",
              showHighlight ? "ring-2 ring-white bg-white/10 shadow-[0_0_30px_rgba(255,255,255,0.15)] scale-105" : "scale-100"
            )}>
               <Link href={`/view/${form.id}`} target="_blank">
                <Button variant="ghost" size="sm" className="text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 text-xs">
                  <Eye className="mr-2 h-3.5 w-3.5" />
                  Preview
                </Button>
              </Link>
              <Button 
                size="sm"
                className="bg-white text-black hover:bg-zinc-200 font-bold px-4 rounded-lg transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)] text-xs"
                onClick={copyLink}
              >
                <Share2 className="mr-2 h-3.5 w-3.5" />
                {copied ? 'Copied!' : 'Share'}
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
          <div className="max-w-4xl mx-auto w-full">
            {activeTab === 'builder' ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
                <div className="bg-zinc-950 border border-zinc-900/50 rounded-[2.5rem] p-1 shadow-2xl shadow-black/50">
                  <FormRenderer schema={form} isPreview={true} />
                </div>
                
                <Card className="bg-zinc-900/10 border-zinc-900 border-dashed rounded-[2rem] overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold text-zinc-200">Public Access Link</CardTitle>
                    <CardDescription className="text-zinc-600 text-xs">
                      Share this unique URL to collect responses from anyone.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex gap-3 pb-6">
                    <Input 
                      value={publicUrl} 
                      readOnly 
                      className="bg-zinc-950 border-zinc-900 text-zinc-500 focus-visible:ring-0 font-mono text-[11px] rounded-xl"
                    />
                    <Button onClick={copyLink} variant="secondary" className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800 rounded-xl px-6 text-xs font-bold">
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="bg-zinc-950 border-zinc-900/50 rounded-[2.5rem] overflow-hidden shadow-2xl">
                  <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-900/50 pb-6 p-8">
                    <div>
                      <CardTitle className="text-xl font-bold text-white">Submissions</CardTitle>
                      <CardDescription className="text-zinc-600 text-xs uppercase tracking-widest font-bold mt-1">Data Insights</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300 text-[10px] font-bold uppercase tracking-widest" onClick={() => exportData('csv')}>
                        <Download className="mr-2 h-3 w-3" />
                        CSV
                      </Button>
                      <Button variant="ghost" size="sm" className="text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300 text-[10px] font-bold uppercase tracking-widest" onClick={() => exportData('xlsx')}>
                        <Download className="mr-2 h-3 w-3" />
                        Excel
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {submissions.length === 0 ? (
                      <div className="text-center py-32 text-zinc-700 italic font-medium text-sm">
                        Waiting for first response...
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-zinc-900/30 text-zinc-600 font-bold uppercase tracking-[0.2em] text-[9px] border-b border-zinc-900/50">
                            <tr>
                              <th className="px-8 py-5">Time</th>
                              {form.fields.slice(0, 3).map((field: FormField) => (
                                <th key={field.id} className="px-8 py-5 truncate max-w-[150px]">
                                  {field.label}
                                </th>
                              ))}
                              <th className="px-8 py-5 text-right">Details</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-900/30">
                            {submissions.map((sub) => (
                              <tr key={sub.id} className="hover:bg-zinc-900/20 transition-colors group">
                                <td className="px-8 py-6 text-zinc-500 whitespace-nowrap">
                                  {new Date(sub.submittedAt).toLocaleDateString()}
                                </td>
                                {form.fields.slice(0, 3).map((field: FormField) => (
                                  <td key={field.id} className="px-8 py-6 truncate max-w-[200px] text-zinc-300">
                                    {typeof sub.data[field.id] === 'object' 
                                      ? JSON.stringify(sub.data[field.id]) 
                                      : sub.data[field.id]?.toString() || '-'}
                                  </td>
                                ))}
                                <td className="px-8 py-6 text-right">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-zinc-600 hover:text-zinc-100 hover:bg-zinc-900 rounded-lg h-8 text-[10px] font-bold uppercase"
                                    onClick={() => alert(JSON.stringify(sub.data, null, 2))}
                                  >
                                    View
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
          </div>
        </main>
      </div>

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