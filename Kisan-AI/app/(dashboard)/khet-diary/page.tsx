"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { Loader2, Mic, MicOff, Trash2 } from "lucide-react";
import { useAuth } from "@/core/firebase/auth-context";
import { db } from "@/core/firebase/client";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
  type DocumentData,
} from "firebase/firestore";

type ActivityKey = "paani" | "khad" | "dawai" | "buwai" | "niraai" | "kaati";

type DiaryEntry = {
  id: string;
  userId: string;
  activityKey: ActivityKey;
  activityName: string;
  emoji: string;
  date: string;
  notes: string;
  cost: number;
  createdAt?: unknown;
};

type EntryModalState = {
  open: boolean;
  activityKey: ActivityKey;
  activityName: string;
  emoji: string;
};

const ACTIVITIES: Array<{
  key: ActivityKey;
  label: string;
  emoji: string;
  color: string;
}> = [
  { key: "paani", label: "Paani Diya", emoji: "💧", color: "bg-blue-600/80 border-blue-400/40" },
  { key: "khad", label: "Khad Dali", emoji: "🌱", color: "bg-green-600/80 border-green-400/40" },
  { key: "dawai", label: "Dawai Chidki", emoji: "🐛", color: "bg-rose-600/80 border-rose-400/40" },
  { key: "buwai", label: "Buwai Ki", emoji: "🌾", color: "bg-yellow-600/80 border-yellow-400/40" },
  { key: "niraai", label: "Niraai Ki", emoji: "✂️", color: "bg-purple-600/80 border-purple-400/40" },
  { key: "kaati", label: "Kaati", emoji: "🚜", color: "bg-orange-600/80 border-orange-400/40" },
];

const WEEK_DAYS = ["Ravivar", "Somvar", "Mangalvar", "Budhvar", "Guruvar", "Shukravar", "Shanivar"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatDiaryDate(input: string): string {
  const date = new Date(`${input}T12:00:00`);
  if (Number.isNaN(date.getTime())) return input;
  const day = date.getDate();
  const month = MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();
  const weekDay = WEEK_DAYS[date.getDay()];
  return `${day} ${month} ${year}, ${weekDay}`;
}

function toDateInputValue(date: Date): string {
  return date.toISOString().split("T")[0];
}

export default function KhetDiaryPage() {
  const { user } = useAuth();

  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modal, setModal] = useState<EntryModalState>({
    open: false,
    activityKey: "paani",
    activityName: "Paani Diya",
    emoji: "💧",
  });

  const [date, setDate] = useState<string>(toDateInputValue(new Date()));
  const [notes, setNotes] = useState<string>("");
  const [cost, setCost] = useState<string>("");
  const [isListening, setIsListening] = useState(false);

  const loadEntries = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "farmActivities"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const rows = snap.docs.map((d) => {
        const data = d.data() as DocumentData;

        // Keep compatibility with older farmActivities schema if present.
        const oldType = String(data.type ?? "").toLowerCase();
        const mappedActivity = ACTIVITIES.find((a) => a.key === oldType || a.label.toLowerCase() === String(data.action ?? "").toLowerCase());

        const fallback = mappedActivity ?? ACTIVITIES[0];
        return {
          id: d.id,
          userId: String(data.userId ?? ""),
          activityKey: (String(data.activityKey ?? fallback.key) as ActivityKey),
          activityName: String(data.activityName ?? data.action ?? fallback.label),
          emoji: String(data.emoji ?? fallback.emoji),
          date: String(data.date ?? toDateInputValue(new Date())),
          notes: String(data.notes ?? ""),
          cost: Number(data.cost ?? data.costINR ?? 0),
          createdAt: data.createdAt,
        } as DiaryEntry;
      });

      setEntries(rows);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const openModal = (activityKey: ActivityKey) => {
    const activity = ACTIVITIES.find((a) => a.key === activityKey) ?? ACTIVITIES[0];
    setModal({
      open: true,
      activityKey: activity.key,
      activityName: activity.label,
      emoji: activity.emoji,
    });
    setDate(toDateInputValue(new Date()));
    setNotes("");
    setCost("");
    setIsListening(false);
  };

  const closeModal = () => {
    setModal((prev) => ({ ...prev, open: false }));
    setIsListening(false);
  };

  const onVoiceNotes = () => {
    if (typeof window === "undefined") return;

    const w = window as unknown as {
      SpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        onstart: (() => void) | null;
        onend: (() => void) | null;
        onerror: (() => void) | null;
        onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
        start: () => void;
      };
      webkitSpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        onstart: (() => void) | null;
        onend: (() => void) | null;
        onerror: (() => void) | null;
        onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
        start: () => void;
      };
    };

    const SpeechRecognitionCtor = w.SpeechRecognition ?? w.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      alert("Voice typing is not supported on this browser.");
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "hi-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      if (transcript) {
        setNotes((prev) => (prev ? `${prev} ${transcript}` : transcript));
      }
    };

    recognition.start();
  };

  const saveEntry = async () => {
    if (!user?.uid) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "farmActivities"), {
        userId: user.uid,
        activityKey: modal.activityKey,
        activityName: modal.activityName,
        emoji: modal.emoji,
        date,
        notes: notes.trim(),
        cost: Number(cost || 0),
        createdAt: serverTimestamp(),
      });

      await loadEntries();
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  const deleteEntry = async (id: string) => {
    if (!window.confirm("Yeh entry delete karni hai?")) return;
    await deleteDoc(doc(db, "farmActivities", id));
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const monthly = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthRows = entries.filter((e) => {
      const d = new Date(`${e.date}T12:00:00`);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const total = monthRows.reduce((sum, row) => sum + (row.cost || 0), 0);
    const byCategory = ACTIVITIES.map((a) => {
      const catTotal = monthRows
        .filter((r) => r.activityKey === a.key)
        .reduce((sum, r) => sum + (r.cost || 0), 0);
      return {
        ...a,
        total: catTotal,
        width: total > 0 ? Math.max(6, Math.round((catTotal / total) * 100)) : 0,
      };
    });

    return {
      monthLabel: `${MONTH_NAMES[currentMonth]} ${currentYear}`,
      total,
      byCategory,
    };
  }, [entries]);

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Khet Diary 📓</h1>
          <p className="text-[#B8A99A] mt-1">Aaj khet mein kya kiya?</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {ACTIVITIES.map((activity) => (
            <button
              key={activity.key}
              onClick={() => openModal(activity.key)}
              className={`rounded-2xl border ${activity.color} min-h-[150px] p-4 flex flex-col items-center justify-center text-white active:scale-[0.98] transition-transform`}
            >
              <span className="text-6xl leading-none">{activity.emoji}</span>
              <span className="mt-3 text-base font-semibold text-center">{activity.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Aapki entries</h2>

          {loading ? (
            <div className="rounded-xl bg-white/5 border border-white/10 p-10 flex items-center justify-center gap-2 text-[#B8A99A]">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading diary...
            </div>
          ) : entries.length === 0 ? (
            <div className="rounded-xl bg-white/5 border border-white/10 p-8 text-center text-[#B8A99A]">
              Abhi koi entry nahi hai.
            </div>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="rounded-xl bg-white/5 border border-white/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="text-4xl leading-none">{entry.emoji}</span>
                    <div>
                      <p className="text-white font-semibold">{entry.activityName}</p>
                      <p className="text-xs text-[#B8A99A] mt-0.5">{formatDiaryDate(entry.date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {entry.cost > 0 && <p className="text-[#F4C430] font-semibold">₹{entry.cost.toLocaleString("en-IN")}</p>}
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="text-rose-400 hover:text-rose-300"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {entry.notes && <p className="text-sm text-[#B8A99A] mt-3">{entry.notes}</p>}
              </div>
            ))
          )}
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-5 space-y-4">
          <h3 className="text-lg font-semibold text-white">{monthly.monthLabel} ka kharcha</h3>
          <p className="text-xl text-[#F4C430] font-bold">Kul kharcha: ₹{monthly.total.toLocaleString("en-IN")}</p>

          <div className="space-y-3">
            {monthly.byCategory.map((cat) => (
              <div key={cat.key}>
                <div className="flex items-center justify-between text-xs text-[#B8A99A] mb-1">
                  <span>{cat.emoji} {cat.label}</span>
                  <span>₹{cat.total.toLocaleString("en-IN")}</span>
                </div>
                <div className="h-2 rounded-full bg-[#2B241F] overflow-hidden">
                  <div className="h-full bg-[#E86B2E]" style={{ width: `${cat.width}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modal.open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#1A1A1A] border border-[#3B322A] p-5 space-y-4">
            <h2 className="text-lg font-bold text-white">{modal.activityName} ki entry</h2>

            <div>
              <label className="text-xs text-[#B8A99A]">Kab? (default: aaj)</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full bg-[#0F0F0F] border border-[#3B322A] rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="text-xs text-[#B8A99A]">Kuch likhna ho to likhein</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Jaise: aaj subah paani diya, mitti nam thi, fasal achchi lag rahi hai"
                className="mt-1 w-full bg-[#0F0F0F] border border-[#3B322A] rounded-lg px-3 py-2 text-sm text-white resize-none"
              />
            </div>

            <div>
              <label className="text-xs text-[#B8A99A]">Kitna kharcha hua? ₹</label>
              <input
                type="number"
                min={0}
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="mt-1 w-full bg-[#0F0F0F] border border-[#3B322A] rounded-lg px-3 py-2 text-sm text-white"
                placeholder="0"
              />
            </div>

            <button
              onClick={onVoiceNotes}
              className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-[#2B241F] border border-[#3B322A] text-[#F5F0E8]"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />} 🎤 Bol ke likhein
            </button>

            <button
              onClick={saveEntry}
              disabled={saving}
              className="w-full py-3 rounded-lg bg-[#E86B2E] hover:bg-[#d45f25] text-white font-semibold disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Karo ✓
            </button>

            <button
              onClick={closeModal}
              className="w-full text-sm text-[#B8A99A] hover:text-white"
            >
              Baad mein
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
