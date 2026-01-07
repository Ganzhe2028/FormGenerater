"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useFormStore } from "@/store/formStore";
import { FormRenderer } from "@/components/form/FormRenderer";
import { Card, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FormSchema } from "@/types";

export default function ViewPage() {
  const params = useParams();
  const id = params?.id as string;
  const getForm = useFormStore((state) => state.getForm);
  const [form, setForm] = useState<FormSchema | null>(null);
  const [mounted, setMounted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    if (id) {
      fetch(`/api/forms/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Form not found");
          return res.json();
        })
        .then((data) => setForm(data))
        .catch(() => {
          const foundForm = getForm(id);
          if (foundForm) setForm(foundForm);
        });
    }
    return () => clearTimeout(timer);
  }, [id, getForm]);

  if (!mounted) return null;

  if (!form) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#09090b] text-zinc-100 p-6">
        <Card className="w-full max-w-md bg-zinc-950 border-zinc-800 p-8 text-center shadow-2xl rounded-3xl">
          <AlertCircle className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Form not found</h1>
          <p className="text-zinc-500 mb-8 text-sm">
            This form might have been deleted or the link is incorrect.
          </p>
          <Link href="/" className="w-full">
            <Button className="w-full bg-white text-black hover:bg-zinc-200 font-bold rounded-xl">
              Create your own form
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formId: form.id, data }),
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Submission failed", error);
      alert("Failed to submit form. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] p-4 text-zinc-100">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />
        <Card className="w-full max-w-md text-center p-12 bg-zinc-950/50 backdrop-blur-xl border-zinc-800 shadow-2xl rounded-[2.5rem] relative z-10">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 shadow-[0_0_30px_rgba(255,255,255,0.03)]">
              <CheckCircle2 className="h-10 w-10 text-zinc-100" />
            </div>
          </div>
          <CardTitle className="text-3xl font-extrabold mb-3 tracking-tight">
            Thank You
          </CardTitle>
          <p className="text-zinc-500 mb-10 text-base font-medium">
            Your response has been securely transmitted.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => setSubmitted(false)}
              variant="outline"
              className="border-zinc-800 hover:bg-zinc-900 text-zinc-300 rounded-xl h-12 font-bold"
            >
              Submit another response
            </Button>
            <Link
              href="/"
              className="mt-4 flex items-center justify-center gap-2 text-zinc-600 hover:text-zinc-400 transition-colors text-xs font-bold uppercase tracking-widest"
            >
              <Sparkles className="h-3 w-3" />
              Build with Formaker
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] py-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/[0.02] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/[0.02] rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <div className="mb-10 flex flex-col items-center">
          <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-2xl mb-4">
            <Sparkles className="h-6 w-6 text-black" />
          </div>
          <h2 className="text-zinc-500 font-bold text-[10px] uppercase tracking-[0.4em]">
            Formaker Submission
          </h2>
        </div>

        <div className="bg-zinc-950 rounded-[2.5rem] p-1 shadow-2xl overflow-hidden">
          <FormRenderer schema={form} onSubmit={handleSubmit} />
        </div>

        <div className="mt-12 text-center text-[10px] font-bold text-zinc-700 uppercase tracking-[0.2em]">
          End of form • {new Date().getFullYear()} Formaker Engine
        </div>
      </div>
    </div>
  );
}
