import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Trash2, Edit3, FolderPlus, X, ArrowUpDown,
  BarChart3, Archive, RotateCcw, Calendar, LayoutGrid, List,
  ChevronDown, ChevronUp, Eye, EyeOff, Pin, Pencil, Check,
  CalendarRange, Loader2, Sparkles, Send,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";


interface DataEntry {
  id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  created_at: string;
  archived: boolean;
}

interface Category {
  id: string;
  name: string;
  color: string;
}




const COLORS = ["hsl(199 95% 60%)", "hsl(234 85% 70%)", "hsl(168 76% 50%)", "hsl(0 84% 60%)", "hsl(45 93% 58%)", "hsl(280 70% 60%)", "hsl(320 70% 55%)"];

type DateFilter = "all" | "today" | "week" | "month" | "custom";

/* ─── Skeleton primitives ─── */
const Skeleton = ({ className = "" }: { className?: string }) => (
  <div
    className={`animate-pulse rounded-md bg-muted/50 ${className}`}
    style={{ animationDuration: "1.4s" }}
  />
);

const StatsSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="glass-card rounded-xl p-4 space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-12" />
      </div>
    ))}
  </div>
);

const CategorySidebarSkeleton = () => (
  <div className="hidden md:block w-56 shrink-0">
    <div className="glass-card rounded-xl p-4 sticky top-24 space-y-2">
      <Skeleton className="h-3 w-20 mb-4" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 px-3 py-2">
          <Skeleton className="w-2.5 h-2.5 rounded-full shrink-0" />
          <Skeleton className="h-3 flex-1" />
          <Skeleton className="h-3 w-4" />
        </div>
      ))}
      <Skeleton className="h-8 w-full mt-3 rounded-lg" />
    </div>
  </div>
);

const EntryCardSkeleton = ({ viewMode }: { viewMode: "grid" | "list" }) => (
  <div
    className={`glass-card rounded-xl p-5 ${viewMode === "list" ? "flex items-center gap-4" : ""
      }`}
  >
    <div className="flex-1 min-w-0 space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="w-2.5 h-2.5 rounded-full shrink-0" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      {viewMode === "grid" && (
        <>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </>
      )}
      <Skeleton className="h-3 w-16 mt-1" />
    </div>
  </div>
);

const EntriesGridSkeleton = ({ viewMode }: { viewMode: "grid" | "list" }) => (
  <div
    className={
      viewMode === "grid"
        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        : "space-y-3"
    }
  >
    {Array.from({ length: 6 }).map((_, i) => (
      <EntryCardSkeleton key={i} viewMode={viewMode} />
    ))}
  </div>
);

/* ─── Quota Error Modal ─── */
const QuotaErrorModal = ({ onClose }: { onClose: () => void }) => (
  <motion.div
    className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm px-4"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    onClick={onClose}
  >
    <motion.div
      className="glass-card rounded-2xl p-8 w-full max-w-sm border border-border text-center"
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
        <Sparkles size={28} className="text-primary" />
      </div>
      <h3 className="font-heading text-xl font-bold mb-2">AI Feature Limit Reached</h3>
      <p className="text-muted-foreground text-sm leading-relaxed mb-2">
        This AI feature is currently available for the first{" "}
        <span className="text-primary font-semibold">100 users only</span> — it runs on a free API key provided by the owner.
      </p>
      <p className="text-muted-foreground text-sm leading-relaxed mb-6">
        To continue using AI-powered entries, please purchase your own API key and configure it.
      </p>
      <button
        onClick={onClose}
        className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
      >
        Got it
      </button>
    </motion.div>
  </motion.div>
);

/* ─── Dashboard ─── */
const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<DataEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "name" | "category">("date");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showTrash, setShowTrash] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DataEntry | null>(null);
  const [entryForm, setEntryForm] = useState({ title: "", description: "", category: "" });
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showChart, setShowChart] = useState(false);
  const [viewingEntry, setViewingEntry] = useState<DataEntry | null>(null);
  const [renamingCategory, setRenamingCategory] = useState<string | null>(null);
  const [renameCategoryValue, setRenameCategoryValue] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [aiCollapsed, setAiCollapsed] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/account", { replace: true });
  }, [authLoading, user, navigate]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [catRes, entRes] = await Promise.all([
      supabase.from("categories").select("*").eq("user_id", user.id),
      supabase.from("entries").select("*").eq("user_id", user.id),
    ]);
    if (catRes.data) setCategories(catRes.data);
    if (entRes.data) setEntries(entRes.data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      const countA = entries.filter((e) => e.category_id === a.id && !e.archived).length;
      const countB = entries.filter((e) => e.category_id === b.id && !e.archived).length;
      return countB - countA;
    });
  }, [categories, entries]);

  const filteredEntries = useMemo(() => {
    let list = entries.filter((e) => e.archived === showTrash);
    if (search) list = list.filter((e) => e.title.toLowerCase().includes(search.toLowerCase()) || (e.description || "").toLowerCase().includes(search.toLowerCase()));
    if (selectedCategory !== "all") list = list.filter((e) => e.category_id === selectedCategory);

    const now = new Date();
    if (dateFilter === "today") {
      list = list.filter((e) => new Date(e.created_at).toDateString() === now.toDateString());
    } else if (dateFilter === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 86400000);
      list = list.filter((e) => new Date(e.created_at) >= weekAgo);
    } else if (dateFilter === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 86400000);
      list = list.filter((e) => new Date(e.created_at) >= monthAgo);
    } else if (dateFilter === "custom" && customDateFrom && customDateTo) {
      const from = new Date(customDateFrom);
      const to = new Date(customDateTo);
      to.setHours(23, 59, 59);
      list = list.filter((e) => { const d = new Date(e.created_at); return d >= from && d <= to; });
    }

    list.sort((a, b) => {
      if (sortBy === "date") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "name") return a.title.localeCompare(b.title);
      return (a.category_id || "").localeCompare(b.category_id || "");
    });
    return list;
  }, [entries, search, selectedCategory, sortBy, showTrash, dateFilter, customDateFrom, customDateTo]);

  const chartData = useMemo(() => {
    return categories.map((c) => ({
      name: c.name,
      entries: entries.filter((e) => e.category_id === c.id && !e.archived).length,
      color: c.color,
    }));
  }, [entries, categories]);

  const stats = useMemo(() => ({
    total: entries.filter((e) => !e.archived).length,
    archived: entries.filter((e) => e.archived).length,
    categories: categories.length,
  }), [entries, categories]);

  const openNewEntry = () => {
    setEditingEntry(null);
    setEntryForm({ title: "", description: "", category: categories[0]?.id || "" });
    setShowEntryModal(true);
  };

  const openEditEntry = (entry: DataEntry) => {
    setEditingEntry(entry);
    setEntryForm({ title: entry.title, description: entry.description || "", category: entry.category_id || "" });
    setShowEntryModal(true);
  };

  const saveEntry = async () => {
    if (!entryForm.title.trim() || !user) return;
    setSaving(true);
    try {
      if (editingEntry) {
        const { error } = await supabase.from("entries").update({
          title: entryForm.title,
          description: entryForm.description,
          category_id: entryForm.category || null,
        }).eq("id", editingEntry.id);
        if (error) throw error;
        setEntries((prev) => prev.map((e) => e.id === editingEntry.id ? { ...e, title: entryForm.title, description: entryForm.description, category_id: entryForm.category || null } : e));
        toast.success("Entry updated");
      } else {
        const { data, error } = await supabase.from("entries").insert({
          title: entryForm.title,
          description: entryForm.description,
          category_id: entryForm.category || null,
          user_id: user.id,
        }).select().single();
        if (error) throw error;
        setEntries((prev) => [data, ...prev]);
        toast.success("Entry created");
      }
      setShowEntryModal(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  /* ─── Smart category matching ─── */
  // Returns a matched existing category ID or null (if needs to be created)
  const findBestCategory = useCallback((aiCategoryName: string, existingCategories: Category[]): Category | null => {
    if (!aiCategoryName || existingCategories.length === 0) return null;

    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    const aiNorm = normalize(aiCategoryName);

    // 1. Exact match
    const exactMatch = existingCategories.find(
      (c) => normalize(c.name) === aiNorm
    );
    if (exactMatch) return exactMatch;

    // 2. One contains the other (e.g. "Meeting" vs "Meetings", "Meeting Notes")
    const containsMatch = existingCategories.find(
      (c) => normalize(c.name).includes(aiNorm) || aiNorm.includes(normalize(c.name))
    );
    if (containsMatch) return containsMatch;

    // 3. Semantic synonyms map — common groupings
    const synonymGroups: string[][] = [
      ["meeting", "meetings", "meetingnotes", "callnotes", "call", "calls", "standup", "sync"],
      ["work", "professional", "office", "job", "career", "workplace"],
      ["personal", "private", "life", "diary"],
      ["idea", "ideas", "brainstorm", "brainstorming", "thought", "thoughts", "concept"],
      ["task", "tasks", "todo", "todos", "action", "actions", "actionitem"],
      ["note", "notes", "reminder", "reminders", "memo", "memos"],
      ["finance", "financial", "money", "budget", "expense", "expenses", "payment"],
      ["health", "fitness", "exercise", "workout", "medical", "wellness"],
      ["project", "projects", "initiative", "initiatives"],
      ["research", "study", "learning", "education"],
      ["shopping", "shop", "buy", "purchase", "wishlist"],
      ["travel", "trip", "vacation", "holiday"],
    ];

    const aiGroup = synonymGroups.find((group) => group.includes(aiNorm));
    if (aiGroup) {
      const synonymMatch = existingCategories.find((c) =>
        aiGroup.includes(normalize(c.name))
      );
      if (synonymMatch) return synonymMatch;
    }

    return null;
  }, []);

  const buildPrompt = (input: string, existingCategoryNames: string[]) => `
Convert user input into a JSON entry. 

Existing categories: ${existingCategoryNames.length > 0 ? existingCategoryNames.join(", ") : "none"}

Rules:
- If the content fits an existing category, use that EXACT category name.
- Only suggest a NEW category name if none of the existing ones fit.
- Keep title short and clear.
- Keep description concise.

Return ONLY valid JSON (no markdown, no extra text):
{
  "title": "short title",
  "description": "brief description",
  "category": "category name"
}

User input: ${input}
`;

  const handleAICreate = async () => {
    if (!aiInput.trim() || !user) return;
    setAiLoading(true);

    try {
      const existingCategoryNames = categories.map((c) => c.name);
      const prompt = buildPrompt(aiInput, existingCategoryNames);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      // ── Quota / rate limit handling ──
      if (response.status === 429 || response.status === 403) {
        setShowQuotaModal(true);
        return;
      }

      const result = await response.json();

      // Check for quota error inside the response body
      const errorCode = result?.error?.code;
      const errorStatus = result?.error?.status;
      if (
        errorCode === 429 ||
        errorCode === 403 ||
        errorStatus === "RESOURCE_EXHAUSTED" ||
        errorStatus === "PERMISSION_DENIED"
      ) {
        setShowQuotaModal(true);
        return;
      }

      const aiText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!aiText) {
        toast.error("AI is busy. Try again in a few seconds.");
        return;
      }

      // Clean JSON
      let cleanText = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
      const jsonStart = cleanText.indexOf("{");
      const jsonEnd = cleanText.lastIndexOf("}");
      if (jsonStart === -1 || jsonEnd === -1) throw new Error("Invalid JSON from AI");
      cleanText = cleanText.substring(jsonStart, jsonEnd + 1);

      const aiData = JSON.parse(cleanText);

      // ── Smart category resolution ──
      let categoryId: string | null = null;

      if (aiData.category) {
        // First try smart matching against existing categories
        const matched = findBestCategory(aiData.category, categories);

        if (matched) {
          categoryId = matched.id;
        } else {
          // No match found — create a new category
          const { data: newCat, error: catError } = await supabase
            .from("categories")
            .insert({
              name: aiData.category,
              color: COLORS[categories.length % COLORS.length],
              user_id: user.id,
            })
            .select()
            .single();

          if (catError) throw catError;
          categoryId = newCat.id;
          setCategories((prev) => [...prev, newCat]);
        }
      }

      // Save entry
      const { data: newEntry, error } = await supabase
        .from("entries")
        .insert({
          title: aiData.title,
          description: aiData.description,
          category_id: categoryId,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setEntries((prev) => [newEntry, ...prev]);
      toast.success("AI Entry Created ✨");
      setAiInput("");
    } catch (error: any) {
      console.error("AI Error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const deleteEntry = async (id: string) => {
    const { error } = await supabase.from("entries").update({ archived: true }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, archived: true } : e));
    toast.success("Moved to trash");
  };

  const restoreEntry = async (id: string) => {
    const { error } = await supabase.from("entries").update({ archived: false }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, archived: false } : e));
    toast.success("Restored");
  };

  const permanentDelete = async (id: string) => {
    const { error } = await supabase.from("entries").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setEntries((prev) => prev.filter((e) => e.id !== id));
    toast.success("Permanently deleted");
  };

  const addCategory = async () => {
    if (!newCategoryName.trim() || !user) return;
    setSaving(true);
    try {
      const { data, error } = await supabase.from("categories").insert({
        name: newCategoryName,
        color: COLORS[categories.length % COLORS.length],
        user_id: user.id,
      }).select().single();
      if (error) throw error;
      setCategories((prev) => [...prev, data]);
      setNewCategoryName("");
      setShowCategoryModal(false);
      toast.success("Category created");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setEntries((prev) => prev.map((e) => e.category_id === id ? { ...e, category_id: null } : e));
    toast.success("Category deleted");
  };

  const renameCategory = async (id: string) => {
    if (!renameCategoryValue.trim()) return;
    const { error } = await supabase.from("categories").update({ name: renameCategoryValue }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setCategories((prev) => prev.map((c) => c.id === id ? { ...c, name: renameCategoryValue } : c));
    setRenamingCategory(null);
  };

  const getCategoryName = (id: string | null) => categories.find((c) => c.id === id)?.name || "Uncategorized";
  const getCategoryColor = (id: string | null) => categories.find((c) => c.id === id)?.color || COLORS[0];

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-heading text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground text-sm mt-1">Manage your data entries and categories</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCategoryModal(true)}
                className="flex items-center gap-2 border border-border text-foreground px-4 py-2 rounded-xl text-sm font-medium hover:border-primary transition-colors"
              >
                <FolderPlus size={16} /> New Category
              </button>
              <button
                onClick={openNewEntry}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <Plus size={16} /> New Entry
              </button>
            </div>
          </div>

          {loading ? (
            /* ── SKELETON LAYOUT ── */
            <>
              <StatsSkeleton />
              <div className="mb-8">
                <Skeleton className="h-4 w-32 mb-3" />
              </div>
              <div className="flex gap-6">
                <CategorySidebarSkeleton />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <Skeleton className="h-10 flex-1 rounded-xl" />
                    <div className="flex gap-2">
                      <Skeleton className="h-10 w-24 rounded-xl" />
                      <Skeleton className="h-10 w-20 rounded-xl" />
                      <Skeleton className="h-10 w-10 rounded-xl" />
                      <Skeleton className="h-10 w-20 rounded-xl" />
                    </div>
                  </div>
                  <EntriesGridSkeleton viewMode={viewMode} />
                </div>
              </div>
            </>
          ) : (
            /* ── REAL CONTENT ── */
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total Entries", value: stats.total, icon: LayoutGrid },
                  { label: "Categories", value: stats.categories, icon: FolderPlus },
                  { label: "Archived", value: stats.archived, icon: Archive },
                  { label: "This Week", value: entries.filter((e) => !e.archived && new Date(e.created_at) > new Date(Date.now() - 7 * 86400000)).length, icon: Calendar },
                ].map((s) => (
                  <div key={s.label} className="glass-card rounded-xl p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-2">
                      <s.icon size={14} /> {s.label}
                    </div>
                    <p className="font-heading text-2xl font-bold">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Chart Toggle */}
              <div className="mb-8">
                <button
                  onClick={() => setShowChart(!showChart)}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-3"
                >
                  {showChart ? <EyeOff size={16} /> : <Eye size={16} />}
                  <BarChart3 size={16} className="text-primary" />
                  {showChart ? "Hide Chart" : "Show Chart"}
                  {showChart ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                <AnimatePresence>
                  {showChart && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="glass-card rounded-xl p-6">
                        <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
                          <BarChart3 size={18} className="text-primary" /> Entries per Category
                        </h3>
                        <div className="h-40">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                              <XAxis dataKey="name" stroke="hsl(215 20% 55%)" fontSize={12} />
                              <YAxis stroke="hsl(215 20% 55%)" fontSize={12} allowDecimals={false} />
                              <Tooltip
                                cursor={{ fill: "transparent" }}
                                contentStyle={{
                                  background: "hsl(240 15% 10%)",
                                  border: "1px solid hsl(240 10% 18%)",
                                  borderRadius: "8px"
                                }}
                                labelStyle={{ color: "hsl(210 40% 95%)" }}
                              />
                              <Bar dataKey="entries" radius={[6, 6, 0, 0]}>
                                {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Main Layout */}
              <div className="flex gap-6">
                {/* Category Sidebar */}
                <div className="hidden md:block w-56 shrink-0">
                  <div className="glass-card rounded-xl p-4 sticky top-24">
                    <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Categories</h3>
                    <div className="space-y-1">
                      <button
                        onClick={() => setSelectedCategory("all")}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === "all" ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}
                      >
                        <span>All Items</span>
                        <span className="text-xs opacity-70">{entries.filter((e) => !e.archived).length}</span>
                      </button>
                      {sortedCategories.map((c, idx) => {
                        const count = entries.filter((e) => e.category_id === c.id && !e.archived).length;
                        const isTop = idx === 0 && count > 0;
                        return (
                          <div key={c.id} className="group relative">
                            {renamingCategory === c.id ? (
                              <div className="flex items-center gap-1 px-2 py-1">
                                <input
                                  value={renameCategoryValue}
                                  onChange={(e) => setRenameCategoryValue(e.target.value)}
                                  onKeyDown={(e) => e.key === "Enter" && renameCategory(c.id)}
                                  className="flex-1 bg-muted/50 border border-border rounded px-2 py-1 text-sm text-foreground outline-none focus:border-primary"
                                  autoFocus
                                />
                                <button onClick={() => renameCategory(c.id)} className="p-1 text-primary hover:text-primary/80"><Check size={14} /></button>
                                <button onClick={() => setRenamingCategory(null)} className="p-1 text-muted-foreground hover:text-foreground"><X size={14} /></button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setSelectedCategory(c.id)}
                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === c.id ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}
                              >
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                                <span className="flex-1 text-left truncate">{c.name}</span>
                                {isTop && <Pin size={10} className="text-primary/50 shrink-0" />}
                                <span className="text-xs opacity-70">{count}</span>
                                <div className="hidden group-hover:flex items-center gap-0.5 ml-1">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setRenamingCategory(c.id); setRenameCategoryValue(c.name); }}
                                    className="p-0.5 text-muted-foreground hover:text-primary" title="Rename"
                                  >
                                    <Pencil size={10} />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); deleteCategory(c.id); }}
                                    className="p-0.5 text-muted-foreground hover:text-destructive" title="Delete"
                                  >
                                    <X size={10} />
                                  </button>
                                </div>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setShowCategoryModal(true)}
                      className="w-full mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-primary border border-dashed border-border hover:border-primary rounded-lg py-2 transition-colors"
                    >
                      <Plus size={12} /> Add Category
                    </button>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        placeholder="Search entries..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-muted/50 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                      />
                    </div>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="md:hidden bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary outline-none"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                    </select>
                    <div className="flex gap-2 flex-wrap">
                      <div className="relative">
                        <button
                          onClick={() => setShowDatePicker(!showDatePicker)}
                          className={`flex items-center gap-1 border rounded-xl px-3 py-2.5 text-sm transition-colors ${dateFilter !== "all" ? "border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground hover:border-primary"}`}
                        >
                          <CalendarRange size={14} />
                          {dateFilter === "all" ? "Date" : dateFilter === "custom" ? "Custom" : dateFilter.charAt(0).toUpperCase() + dateFilter.slice(1)}
                        </button>
                        {showDatePicker && (
                          <div className="absolute top-full right-0 mt-2 z-30 glass-card border border-border rounded-xl p-3 w-56 shadow-xl">
                            {(["all", "today", "week", "month", "custom"] as DateFilter[]).map((f) => (
                              <button
                                key={f}
                                onClick={() => { setDateFilter(f); if (f !== "custom") setShowDatePicker(false); }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${dateFilter === f ? "bg-primary/15 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}
                              >
                                {f === "all" ? "All Time" : f === "custom" ? "Custom Range" : f.charAt(0).toUpperCase() + f.slice(1)}
                              </button>
                            ))}
                            {dateFilter === "custom" && (
                              <div className="mt-2 space-y-2 border-t border-border pt-2">
                                <div>
                                  <label className="text-xs text-muted-foreground mb-1 block">From</label>
                                  <input type="date" value={customDateFrom} onChange={(e) => setCustomDateFrom(e.target.value)} className="w-full bg-muted/50 border border-border rounded-lg px-2 py-1.5 text-sm text-foreground focus:border-primary outline-none" />
                                </div>
                                <div>
                                  <label className="text-xs text-muted-foreground mb-1 block">To</label>
                                  <input type="date" value={customDateTo} onChange={(e) => setCustomDateTo(e.target.value)} className="w-full bg-muted/50 border border-border rounded-lg px-2 py-1.5 text-sm text-foreground focus:border-primary outline-none" />
                                </div>
                                <button onClick={() => setShowDatePicker(false)} className="w-full bg-primary text-primary-foreground py-1.5 rounded-lg text-sm font-medium">Apply</button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setSortBy(sortBy === "date" ? "name" : sortBy === "name" ? "category" : "date")}
                        className="flex items-center gap-1 border border-border rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                      >
                        <ArrowUpDown size={14} /> {sortBy}
                      </button>
                      <button
                        onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                        className="border border-border rounded-xl px-3 py-2.5 text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                      >
                        {viewMode === "grid" ? <List size={14} /> : <LayoutGrid size={14} />}
                      </button>
                      <button
                        onClick={() => setShowTrash(!showTrash)}
                        className={`flex items-center gap-1 border rounded-xl px-3 py-2.5 text-sm transition-colors ${showTrash ? "border-destructive text-destructive" : "border-border text-muted-foreground hover:text-foreground hover:border-primary"}`}
                      >
                        <Trash2 size={14} /> Trash
                        {stats.archived > 0 && <span className="ml-1 bg-destructive/20 text-destructive text-xs px-1.5 py-0.5 rounded-full">{stats.archived}</span>}
                      </button>
                    </div>
                  </div>

                  {/* Entries */}
                  <AnimatePresence mode="popLayout">
                    {filteredEntries.length === 0 ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-muted-foreground">
                        <p className="text-lg">{showTrash ? "Trash is empty" : "No entries found"}</p>
                        {!showTrash && <p className="text-sm mt-1">Create your first entry to get started</p>}
                      </motion.div>
                    ) : (
                      <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
                        {filteredEntries.map((entry) => (
                          <motion.div
                            key={entry.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`glass-card rounded-xl p-5 group hover:glow-border transition-all cursor-pointer ${viewMode === "list" ? "flex items-center gap-4" : ""}`}
                            onClick={() => setViewingEntry(entry)}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: getCategoryColor(entry.category_id) }} />
                                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: getCategoryColor(entry.category_id) }}>{getCategoryName(entry.category_id)}</span>
                              </div>
                              <h3 className="font-heading font-semibold text-foreground truncate">{entry.title}</h3>
                              {viewMode === "grid" && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{entry.description}</p>}
                              <p className="text-xs text-muted-foreground mt-2">{new Date(entry.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="flex gap-2 mt-3 sm:mt-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                              {showTrash ? (
                                <>
                                  <button onClick={() => restoreEntry(entry.id)} className="p-2 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors" title="Restore"><RotateCcw size={14} /></button>
                                  <button onClick={() => permanentDelete(entry.id)} className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors" title="Delete permanently"><Trash2 size={14} /></button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => openEditEntry(entry)} className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors" title="Edit"><Edit3 size={14} /></button>
                                  <button onClick={() => deleteEntry(entry.id)} className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors" title="Move to trash"><Trash2 size={14} /></button>
                                </>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── AI Assistant — Fixed Bottom Right ── */}
      <div className="fixed bottom-6 right-6 z-40 w-80 sm:w-96">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="glass-card rounded-2xl border border-border shadow-2xl overflow-hidden"
        >
          {/* Header — always visible, click to collapse */}
          <button
            onClick={() => setAiCollapsed((v) => !v)}
            className="w-full flex items-center gap-2.5 px-4 py-3 border-b border-border bg-primary/5 hover:bg-primary/10 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
              <Sparkles size={14} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-foreground leading-none">AI Assistant</p>
              {!aiCollapsed && (
                <p className="text-xs text-muted-foreground mt-0.5">Describe anything — AI creates your entry</p>
              )}
            </div>
            <motion.div
              animate={{ rotate: aiCollapsed ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0 text-muted-foreground"
            >
              <ChevronDown size={15} />
            </motion.div>
          </button>

          {/* Collapsible input area */}
          <AnimatePresence initial={false}>
            {!aiCollapsed && (
              <motion.div
                key="ai-body"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="p-3">
                  <textarea
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleAICreate();
                      }
                    }}
                    placeholder="e.g. Meeting with Ali about Q3 marketing strategy..."
                    rows={3}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground/60">
                      Press <kbd className="px-1 py-0.5 rounded bg-muted/60 text-[10px] font-mono">Enter</kbd> to generate
                    </p>
                    <button
                      onClick={handleAICreate}
                      disabled={aiLoading || !aiInput.trim()}
                      className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {aiLoading ? (
                        <><Loader2 size={12} className="animate-spin" /> Generating...</>
                      ) : (
                        <><Send size={12} /> Generate</>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Entry Detail View Modal */}
      <AnimatePresence>
        {viewingEntry && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setViewingEntry(null)}
          >
            <motion.div
              className="glass-card rounded-2xl p-0 w-full max-w-lg border border-border overflow-hidden"
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-1.5 w-full" style={{ backgroundColor: getCategoryColor(viewingEntry.category_id) }} />
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getCategoryColor(viewingEntry.category_id) }} />
                    <span className="text-sm font-medium" style={{ color: getCategoryColor(viewingEntry.category_id) }}>{getCategoryName(viewingEntry.category_id)}</span>
                  </div>
                  <button onClick={() => setViewingEntry(null)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"><X size={18} /></button>
                </div>
                <h2 className="font-heading text-2xl font-bold text-foreground mb-4">{viewingEntry.title}</h2>
                <div className="bg-muted/20 rounded-xl p-5 mb-6">
                  <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">{viewingEntry.description || "No description"}</p>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>Created {new Date(viewingEntry.created_at).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
                  </div>
                </div>
                <div className="flex gap-3 mt-6 pt-5 border-t border-border">
                  <button
                    onClick={() => { openEditEntry(viewingEntry); setViewingEntry(null); }}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Edit3 size={16} /> Edit
                  </button>
                  <button
                    onClick={() => { deleteEntry(viewingEntry.id); setViewingEntry(null); }}
                    className="flex items-center justify-center gap-2 border border-destructive/30 text-destructive px-6 py-3 rounded-xl font-semibold hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entry Modal */}
      <AnimatePresence>
        {showEntryModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowEntryModal(false)}
          >
            <motion.div
              className="glass-card rounded-2xl p-8 w-full max-w-md border border-border"
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-heading text-xl font-semibold mb-6">{editingEntry ? "Edit Entry" : "New Entry"}</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Title</label>
                  <input
                    value={entryForm.title}
                    onChange={(e) => setEntryForm({ ...entryForm, title: e.target.value })}
                    placeholder="Entry title..."
                    className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Description</label>
                  <textarea
                    value={entryForm.description}
                    onChange={(e) => setEntryForm({ ...entryForm, description: e.target.value })}
                    placeholder="Add details..."
                    rows={4}
                    className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Category</label>
                  <select
                    value={entryForm.category}
                    onChange={(e) => setEntryForm({ ...entryForm, category: e.target.value })}
                    className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:border-primary outline-none"
                  >
                    <option value="">No Category</option>
                    {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={saveEntry}
                    disabled={saving}
                    className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saving && <Loader2 size={16} className="animate-spin" />}
                    {editingEntry ? "Update" : "Create"}
                  </button>
                  <button onClick={() => setShowEntryModal(false)} className="flex-1 border border-border text-foreground py-3 rounded-xl font-semibold hover:border-primary transition-colors">Cancel</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowCategoryModal(false)}
          >
            <motion.div
              className="glass-card rounded-2xl p-8 w-full max-w-sm border border-border"
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-heading text-xl font-semibold mb-6">New Category</h3>
              <input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name..."
                className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors mb-4"
                onKeyDown={(e) => e.key === "Enter" && addCategory()}
              />
              <div className="flex gap-3">
                <button
                  onClick={addCategory}
                  disabled={saving}
                  className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  Create
                </button>
                <button onClick={() => setShowCategoryModal(false)} className="flex-1 border border-border text-foreground py-3 rounded-xl font-semibold hover:border-primary transition-colors">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quota Error Modal */}
      <AnimatePresence>
        {showQuotaModal && <QuotaErrorModal onClose={() => setShowQuotaModal(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;