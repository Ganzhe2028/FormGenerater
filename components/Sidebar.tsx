"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, Settings, Trash2, MessageSquare, Plus } from "lucide-react";
import { FormSchema } from "@/types";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [history, setHistory] = useState<FormSchema[]>([]);
  const router = useRouter();
  const params = useParams();
  const activeId = params?.id as string;

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/forms");
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHistory();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchHistory]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this form history?")) return;

    try {
      const res = await fetch(`/api/forms/${id}`, { method: "DELETE" });
      if (res.ok) {
        setHistory((prev) => prev.filter((f) => f.id !== id));
        if (activeId === id) router.push("/");
      }
    } catch (error) {
      console.error("Failed to delete form:", error);
    }
  };

  const groupHistory = (items: FormSchema[]) => {
    const now = new Date();
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();
    const yesterday = today - 86400000;
    const lastWeek = today - 86400000 * 7;

    return [
      { label: "Today", items: items.filter((f) => f.createdAt >= today) },
      {
        label: "Yesterday",
        items: items.filter(
          (f) => f.createdAt >= yesterday && f.createdAt < today
        ),
      },
      {
        label: "Previous 7 Days",
        items: items.filter(
          (f) => f.createdAt >= lastWeek && f.createdAt < yesterday
        ),
      },
      { label: "Older", items: items.filter((f) => f.createdAt < lastWeek) },
    ].filter((group) => group.items.length > 0);
  };

  const groupedHistory = groupHistory(history);

  return (
    <aside
      className={cn(
        "w-72 border-r border-zinc-900/50 flex flex-col bg-[#09090b] h-full",
        className
      )}
    >
      {/* Header / New Form */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 bg-white rounded flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-black" />
            </div>
            <h2 className="font-bold text-sm tracking-tight text-zinc-200">
              Formaker
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-md hover:bg-zinc-900 text-zinc-500 hover:text-zinc-200"
            onClick={() => router.push("/")}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="secondary"
          className="w-full justify-start gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-none rounded-md py-5 font-semibold text-xs"
          onClick={() => router.push("/")}
        >
          <Plus className="h-3.5 w-3.5" />
          New Form
        </Button>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto px-4 space-y-6 custom-scrollbar pb-4">
        {history.length === 0 ? (
          <div className="px-3 py-10 text-center">
            <MessageSquare className="h-6 w-6 text-zinc-800 mx-auto mb-2" />
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
              Empty
            </p>
          </div>
        ) : (
          groupedHistory.map((group) => (
            <div key={group.label} className="space-y-1">
              <div className="px-3 py-2 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.items.map((form) => (
                  <div
                    key={form.id}
                    className={cn(
                      "group relative flex items-center justify-between p-2.5 rounded-md transition-all cursor-pointer border border-transparent",
                      activeId === form.id
                        ? "bg-zinc-900 text-white"
                        : "text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200"
                    )}
                    onClick={() => router.push(`/builder/${form.id}`)}
                  >
                    <span className="text-xs font-medium truncate pr-6">
                      {form.title}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 text-zinc-600 hover:text-red-400 hover:bg-transparent"
                      onClick={(e) => handleDelete(e, form.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Actions */}
      <div className="p-4 mt-auto border-t border-zinc-900/50">
        <Link href="/settings">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 rounded-md py-6 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 group transition-all"
          >
            <div className="h-8 w-8 rounded-md bg-zinc-900 flex items-center justify-center group-hover:bg-zinc-800 transition-colors border border-zinc-800/50">
              <Settings className="h-4 w-4" />
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="text-[11px] font-bold">Settings</span>
              <span className="text-[9px] text-zinc-600 uppercase tracking-tighter">
                Configurations
              </span>
            </div>
          </Button>
        </Link>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #18181b;
          border-radius: 10px;
        }
      `}</style>
    </aside>
  );
}
