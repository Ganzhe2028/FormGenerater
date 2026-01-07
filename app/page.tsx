"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useFormStore } from "@/store/formStore";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Sparkles,
  Settings,
  Terminal,
  Mail,
  Calendar,
  Square,
} from "lucide-react";
import Link from "next/link";
import Cookies from "js-cookie";
import { Sidebar } from "@/components/Sidebar";
import { cn } from "@/lib/utils";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [streamContent, setStreamContent] = useState("");
  const logContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const router = useRouter();
  const addForm = useFormStore((state) => state.addForm);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, streamContent]);

  const addLog = (msg: string) => {
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString().split(" ")[0]}] ${msg}`,
    ]);
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      addLog("Generation terminated by user.");
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setLogs([]);
    setStreamContent("");

    abortControllerRef.current = new AbortController();

    const provider = Cookies.get("ai_provider") || "openai";
    const model =
      Cookies.get("ai_model") || (provider === "openai" ? "gpt-4o" : "llama3");

    addLog(`Initializing ${model}...`);
    addLog(`Connecting...`);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok || !response.body) throw new Error("Failed to connect");

      addLog(`Stream started.`);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setStreamContent((prev) => prev + chunk);
      }

      addLog(`Success. Parsing...`);

      let formData;
      try {
        const cleanText = fullText
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        formData = JSON.parse(cleanText);
      } catch {
        throw new Error("Invalid JSON");
      }

      const saveResponse = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!saveResponse.ok) throw new Error("Save failed");

      addForm(formData);
      setTimeout(() => {
        router.push(`/builder/${formData.id}`);
      }, 500);
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Fetch aborted");
      } else {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        addLog(`ERROR: ${message}`);
        alert("Failed: " + message);
        setIsLoading(false);
      }
    } finally {
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="h-screen flex bg-[#09090b] text-zinc-100 overflow-hidden font-sans">
      <Sidebar className="hidden md:flex" />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[#09090b]">
        {/* Mobile Header */}
        <header className="md:hidden p-6 flex justify-between items-center border-b border-zinc-800/50">
          <h2 className="font-bold text-xl tracking-tight text-white">
            Formaker
          </h2>
          <Link href="/settings">
            <Settings className="h-6 w-6 text-zinc-400" />
          </Link>
        </header>

        {/* Center Prompt Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="w-full space-y-12 relative z-10">
            {!isLoading && (
              <div className="text-center space-y-4">
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent">
                  What should we build?
                </h1>
                <p className="text-lg md:text-xl text-zinc-500 font-medium max-w-xl mx-auto">
                  Transform your ideas into functional forms with the power of
                  neural generation.
                </p>
              </div>
            )}

            {isLoading ? (
              <div className="w-full space-y-8 animate-in fade-in duration-500">
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 h-[450px] overflow-hidden flex flex-col shadow-2xl shadow-white/[0.02]">
                  <div className="flex items-center gap-3 text-zinc-500 text-[10px] uppercase tracking-[0.3em] font-bold mb-6 border-b border-zinc-800/50 pb-4">
                    <Terminal className="h-3.5 w-3.5 text-zinc-400" />
                    Neural Logic Console
                  </div>

                  <div
                    className="flex-1 overflow-y-auto font-mono text-sm custom-scrollbar"
                    ref={logContainerRef}
                  >
                    {logs.map((log, i) => (
                      <div
                        key={i}
                        className="flex gap-4 text-zinc-400 mb-2 animate-in fade-in slide-in-from-left-2 duration-300"
                      >
                        <span className="text-zinc-700 shrink-0">›</span>
                        <span className="leading-relaxed">{log}</span>
                      </div>
                    ))}
                    {streamContent && (
                      <div className="mt-8 pt-6 border-t border-zinc-800/30">
                        <div className="text-[10px] text-zinc-600 font-bold mb-4 uppercase tracking-widest">
                          Live Stream Data
                        </div>
                        <div className="text-zinc-500 text-xs leading-5 break-all opacity-70 font-mono">
                          {streamContent}
                          <span className="inline-block w-2 h-4 bg-zinc-500 animate-pulse ml-1 align-middle" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-center gap-6">
                  <div className="flex items-center gap-4">
                    <Loader2 className="h-8 w-8 text-zinc-700 animate-spin" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleStop}
                      className="bg-transparent border-zinc-800 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-all rounded-full px-4 h-9"
                    >
                      <Square className="h-3 w-3 mr-2 fill-current" />
                      Stop Generation
                    </Button>
                  </div>
                  <p className="text-xs font-mono text-zinc-600 animate-pulse uppercase tracking-widest">
                    Synthesizing Schema...
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-3xl mx-auto space-y-10 relative">
                <div className="relative group">
                  {/* Soft Radial Glow (Static Cloud) */}
                  <div className="absolute -inset-16 bg-gradient-to-tr from-cyan-500/10 via-fuchsia-500/10 to-violet-500/10 rounded-full blur-[120px] opacity-100 pointer-events-none"></div>

                  <div className="relative bg-zinc-950/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden focus-within:border-white/20 transition-all duration-300 z-10">
                    <Textarea
                      placeholder="E.g. A high-end restaurant feedback form with rating and dietary logic..."
                      className="w-full min-h-[140px] max-h-[300px] p-6 text-xl bg-transparent border-none focus-visible:ring-0 resize-none placeholder:text-zinc-800 text-zinc-100 overflow-y-auto custom-scrollbar"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleGenerate();
                        }
                      }}
                    />
                    <div className="p-4 bg-white/5 border-t border-white/5 flex justify-between items-center">
                      <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest pl-2">
                        Press{" "}
                        <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 font-sans">
                          Enter
                        </kbd>{" "}
                        to generate
                      </span>
                      <Button
                        className="rounded-xl px-8 h-12 bg-white text-black hover:bg-zinc-200 transition-all font-semibold shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 disabled:bg-zinc-800 disabled:text-zinc-600"
                        onClick={handleGenerate}
                        disabled={!prompt.trim()}
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                  {[
                    {
                      title: "Contact Form",
                      desc: "Basic name, email, and message.",
                      prompt: "A simple contact form for my portfolio website.",
                      icon: Mail,
                      color: "text-blue-400",
                      bg: "bg-blue-400/10",
                    },
                    {
                      title: "Event RSVP",
                      desc: "Collect guest details and preferences.",
                      prompt:
                        "An event RSVP form with dietary choices and number of guests.",
                      icon: Calendar,
                      color: "text-pink-400",
                      bg: "bg-pink-400/10",
                    },
                  ].map((card, i) => (
                    <button
                      key={i}
                      onClick={() => setPrompt(card.prompt)}
                      className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md hover:bg-zinc-800 hover:border-zinc-600 text-left transition-all duration-300 group hover:-translate-y-1 flex items-start gap-4 shadow-lg hover:shadow-zinc-950"
                    >
                      <div
                        className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border border-zinc-800/50 group-hover:border-zinc-700 transition-colors",
                          card.bg,
                          card.color
                        )}
                      >
                        <card.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold mb-1 text-zinc-200 group-hover:text-white transition-colors">
                          {card.title}
                        </p>
                        <p className="text-xs text-zinc-600 group-hover:text-zinc-400 transition-colors">
                          {card.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
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
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #27272a;
        }
      `}</style>
    </div>
  );
}
