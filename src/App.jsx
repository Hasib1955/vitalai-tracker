import React, { useState, useEffect, useRef } from "react";
import {
  Footprints,
  Moon,
  Droplet,
  HeartPulse,
  Dumbbell,
  Plus,
  LogOut,
} from "lucide-react";
import { supabase } from "./supabaseClient";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  ResponsiveContainer,
  YAxis,
} from "recharts";

// ---- Design tokens ----------------------------------------------------
const C = {
  bg: "#0B1220",
  panel: "#111A2C",
  panelAlt: "#0E1626",
  border: "rgba(94,234,212,0.14)",
  borderSoft: "rgba(148,163,184,0.10)",
  grid: "rgba(94,234,212,0.055)",
  cyan: "#5EEAD4",
  rose: "#FB7185",
  amber: "#FBBF24",
  text: "#EDF1F7",
  muted: "#6B7A99",
  mutedDim: "#4A5670",
};

const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "TODAY"];

const DEFAULT_DATA = {
  steps: { current: 6200, goal: 10000, history: [3000, 4500, 5200, 6100, 7000, 6800, 6200] },
  sleep: { hours: 7.2, goal: 8, history: [6.5, 7.0, 6.8, 7.5, 8.0, 6.9, 7.2] },
  water: { glasses: 5, goal: 8, history: [4, 6, 5, 7, 8, 6, 5] },
  heartRate: { bpm: 68, history: [70, 72, 68, 66, 69, 71, 68] },
  workouts: { count: 3, goal: 5, history: [0, 1, 0, 1, 1, 0, 1] },
  mood: { value: 4, history: [3, 4, 3, 5, 4, 4, 4] },
};

const STORAGE_KEY = "vitalai:data";

function toSeries(arr) {
  return arr.map((v, i) => ({ i, v }));
}

function delta(history) {
  const n = history.length;
  return +(history[n - 1] - history[n - 2]).toFixed(1);
}

// ---- Small building blocks --------------------------------------------

function Eyebrow({ children, color = C.muted }) {
  return (
    <div
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 11,
        letterSpacing: "0.14em",
        color,
        textTransform: "uppercase",
        fontWeight: 500,
      }}
    >
      {children}
    </div>
  );
}

function Sparkline({ data, color, height = 40 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={toSeries(data)} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={2}
          fill={`url(#grad-${color.replace("#", "")})`}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function VitalCard({ icon, label, value, unit, deltaVal, deltaUnit, history, color, footer }) {
  const up = deltaVal > 0;
  const flat = deltaVal === 0;
  return (
    <div
      style={{
        background: C.panel,
        border: `1px solid ${C.borderSoft}`,
        borderRadius: 6,
        padding: "18px 18px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span style={{ color }}>{icon}</span>
          <Eyebrow>{label}</Eyebrow>
        </div>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            color: flat ? C.mutedDim : up ? C.cyan : C.rose,
          }}
        >
          {flat ? "—" : `${up ? "▲" : "▼"} ${Math.abs(deltaVal)}${deltaUnit}`}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 32,
            fontWeight: 600,
            color: C.text,
            lineHeight: 1,
          }}
        >
          {value}
        </span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: C.muted }}>
          {unit}
        </span>
      </div>

      <Sparkline data={history} color={color} />

      {footer}
    </div>
  );
}

function IconButton({ onClick, children, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="focus:outline-none"
      style={{
        background: "rgba(94,234,212,0.08)",
        border: `1px solid ${C.border}`,
        color: C.cyan,
        borderRadius: 4,
        width: 26,
        height: 26,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
      onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 2px ${C.cyan}`)}
      onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      {children}
    </button>
  );
}

// ---- Hero pulse trace ---------------------------------------------------

function PulseHero({ bpm, statusText }) {
  const [liveBpm, setLiveBpm] = useState(bpm);
  useEffect(() => {
    setLiveBpm(bpm);
  }, [bpm]);
  useEffect(() => {
    const id = setInterval(() => {
      setLiveBpm(bpm + Math.round((Math.random() - 0.5) * 3));
    }, 1800);
    return () => clearInterval(id);
  }, [bpm]);

  return (
    <div
      style={{
        position: "relative",
        background: `repeating-linear-gradient(0deg, ${C.grid} 0, ${C.grid} 1px, transparent 1px, transparent 24px),
                     repeating-linear-gradient(90deg, ${C.grid} 0, ${C.grid} 1px, transparent 1px, transparent 24px)`,
        backgroundColor: C.panelAlt,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        overflow: "hidden",
        padding: "28px 26px 0",
      }}
    >
      <div className="flex items-end justify-between flex-wrap gap-4" style={{ paddingBottom: 18 }}>
        <div>
          <Eyebrow color={C.cyan}>VitalAI · live monitor</Eyebrow>
          <div
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: 22,
              fontWeight: 700,
              color: C.text,
              marginTop: 6,
            }}
          >
            {statusText}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <Eyebrow>Heart rate</Eyebrow>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 40,
              fontWeight: 600,
              color: C.cyan,
              lineHeight: 1,
            }}
          >
            {liveBpm}
            <span style={{ fontSize: 15, color: C.muted, marginLeft: 6 }}>bpm</span>
          </div>
        </div>
      </div>

      <svg viewBox="0 0 600 90" width="100%" height="90" preserveAspectRatio="none" style={{ display: "block" }}>
        <path
          d="M0,45 L140,45 L158,10 L176,80 L194,45 L600,45"
          fill="none"
          stroke={C.cyan}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="vitalai-pulse-path"
        />
      </svg>

      <style>{`
        .vitalai-pulse-path {
          stroke-dasharray: 900;
          stroke-dashoffset: 900;
          animation: vitalai-sweep 2.6s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .vitalai-pulse-path { animation: none; stroke-dashoffset: 0; }
        }
        @keyframes vitalai-sweep {
          0% { stroke-dashoffset: 900; }
          60% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -60; }
        }
      `}</style>
    </div>
  );
}

// ---- Main App -----------------------------------------------------------

export default function VitalAI({ session }) {
  const userId = session?.user?.id;
  const [data, setData] = useState(DEFAULT_DATA);
  const [loaded, setLoaded] = useState(false);
  const [sleepInput, setSleepInput] = useState("");
  const [workoutType, setWorkoutType] = useState("");
  const saveTimer = useRef(null);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const { data: rows, error } = await supabase
          .from("vitals")
          .select("data")
          .eq("user_id", userId)
          .maybeSingle();
        if (error) throw error;
        if (rows && rows.data) setData(rows.data);
      } catch (e) {
        console.error("VitalAI: failed to load from Supabase", e);
      } finally {
        setLoaded(true);
      }
    })();
  }, [userId]);

  useEffect(() => {
    if (!loaded || !userId) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from("vitals")
          .upsert({ user_id: userId, data, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
        if (error) throw error;
      } catch (e) {
        console.error("VitalAI: failed to save to Supabase", e);
      }
    }, 500);
  }, [data, loaded, userId]);

  function bumpHistory(history, newLast) {
    const copy = [...history];
    copy[copy.length - 1] = newLast;
    return copy;
  }

  function addSteps(n) {
    setData((d) => {
      const current = d.steps.current + n;
      return { ...d, steps: { ...d.steps, current, history: bumpHistory(d.steps.history, current) } };
    });
  }

  function addWater() {
    setData((d) => {
      const glasses = d.water.glasses + 1;
      return { ...d, water: { ...d.water, glasses, history: bumpHistory(d.water.history, glasses) } };
    });
  }

  function logSleep() {
    const hrs = parseFloat(sleepInput);
    if (!hrs || hrs <= 0 || hrs > 14) return;
    setData((d) => ({
      ...d,
      sleep: { ...d.sleep, hours: hrs, history: bumpHistory(d.sleep.history, hrs) },
    }));
    setSleepInput("");
  }

  function logWorkout() {
    setData((d) => {
      const count = d.workouts.count + 1;
      const lastDay = d.workouts.history[d.workouts.history.length - 1] + 1;
      return { ...d, workouts: { ...d.workouts, count, history: bumpHistory(d.workouts.history, lastDay) } };
    });
    setWorkoutType("");
  }

  function setMood(v) {
    setData((d) => ({ ...d, mood: { ...d.mood, value: v, history: bumpHistory(d.mood.history, v) } }));
  }

  const stepsPct = Math.min(100, Math.round((data.steps.current / data.steps.goal) * 100));
  const statusText =
    stepsPct >= 100
      ? "All vitals nominal — step goal cleared today."
      : `${data.steps.goal - data.steps.current} steps left to hit today's goal.`;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: "'Manrope', sans-serif",
        padding: "32px 20px 60px",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>

      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: 22 }}>
          <div className="flex items-center gap-2">
            <HeartPulse size={20} color={C.cyan} />
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 16, letterSpacing: "0.02em" }}>
              VitalAI
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Eyebrow>
              {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
            </Eyebrow>
            <button
              onClick={() => supabase.auth.signOut()}
              title="Sign out"
              className="focus:outline-none"
              style={{
                background: "transparent",
                border: `1px solid ${C.borderSoft}`,
                color: C.muted,
                borderRadius: 4,
                width: 26,
                height: 26,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>

        {/* Hero */}
        <PulseHero bpm={data.heartRate.bpm} statusText={statusText} />

        {/* Cards grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          style={{ gap: 16, marginTop: 20 }}
        >
          <VitalCard
            icon={<Footprints size={16} />}
            label="Steps"
            value={data.steps.current.toLocaleString()}
            unit={`/ ${data.steps.goal.toLocaleString()}`}
            deltaVal={delta(data.steps.history)}
            deltaUnit=""
            history={data.steps.history}
            color={C.cyan}
            footer={
              <div className="flex gap-2" style={{ marginTop: 2 }}>
                <IconButton title="Add 500 steps" onClick={() => addSteps(500)}>
                  <Plus size={14} />
                </IconButton>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: C.muted, alignSelf: "center" }}>
                  +500
                </span>
              </div>
            }
          />

          <VitalCard
            icon={<Moon size={16} />}
            label="Sleep"
            value={data.sleep.hours}
            unit="hrs"
            deltaVal={delta(data.sleep.history)}
            deltaUnit="h"
            history={data.sleep.history}
            color={C.amber}
            footer={
              <div className="flex items-center gap-2" style={{ marginTop: 2 }}>
                <input
                  value={sleepInput}
                  onChange={(e) => setSleepInput(e.target.value)}
                  placeholder="hrs last night"
                  inputMode="decimal"
                  style={{
                    background: "transparent",
                    border: `1px solid ${C.borderSoft}`,
                    borderRadius: 4,
                    color: C.text,
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 12,
                    padding: "4px 6px",
                    width: 92,
                  }}
                />
                <IconButton title="Log sleep" onClick={logSleep}>
                  <Plus size={14} />
                </IconButton>
              </div>
            }
          />

          <VitalCard
            icon={<Droplet size={16} />}
            label="Hydration"
            value={data.water.glasses}
            unit={`/ ${data.water.goal} glasses`}
            deltaVal={delta(data.water.history)}
            deltaUnit=""
            history={data.water.history}
            color={C.cyan}
            footer={
              <div className="flex gap-2" style={{ marginTop: 2 }}>
                <IconButton title="Add a glass" onClick={addWater}>
                  <Plus size={14} />
                </IconButton>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: C.muted, alignSelf: "center" }}>
                  +1 glass
                </span>
              </div>
            }
          />

          <VitalCard
            icon={<Dumbbell size={16} />}
            label="Workouts"
            value={data.workouts.count}
            unit={`/ ${data.workouts.goal} this wk`}
            deltaVal={delta(data.workouts.history)}
            deltaUnit=""
            history={data.workouts.history}
            color={C.rose}
            footer={
              <div className="flex items-center gap-2" style={{ marginTop: 2 }}>
                <input
                  value={workoutType}
                  onChange={(e) => setWorkoutType(e.target.value)}
                  placeholder="type (optional)"
                  style={{
                    background: "transparent",
                    border: `1px solid ${C.borderSoft}`,
                    borderRadius: 4,
                    color: C.text,
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 12,
                    padding: "4px 6px",
                    width: 108,
                  }}
                />
                <IconButton title="Log workout" onClick={logWorkout}>
                  <Plus size={14} />
                </IconButton>
              </div>
            }
          />

          <VitalCard
            icon={<HeartPulse size={16} />}
            label="Resting HR"
            value={data.heartRate.bpm}
            unit="bpm"
            deltaVal={delta(data.heartRate.history)}
            deltaUnit=""
            history={data.heartRate.history}
            color={C.cyan}
            footer={<div style={{ height: 26 }} />}
          />

          <div
            style={{
              background: C.panel,
              border: `1px solid ${C.borderSoft}`,
              borderRadius: 6,
              padding: "18px 18px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <Eyebrow>Mood check-in</Eyebrow>
            <div className="flex items-center gap-2" style={{ marginTop: 4 }}>
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  onClick={() => setMood(v)}
                  className="focus:outline-none"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 4,
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 13,
                    border: `1px solid ${data.mood.value === v ? C.cyan : C.borderSoft}`,
                    background: data.mood.value === v ? "rgba(94,234,212,0.14)" : "transparent",
                    color: data.mood.value === v ? C.cyan : C.muted,
                    cursor: "pointer",
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
            <Sparkline data={data.mood.history} color={C.amber} height={36} />
          </div>
        </div>

        {/* Weekly trend */}
        <div
          style={{
            background: C.panel,
            border: `1px solid ${C.borderSoft}`,
            borderRadius: 6,
            padding: "18px 20px",
            marginTop: 16,
          }}
        >
          <Eyebrow>Steps · last 7 days</Eyebrow>
          <div style={{ marginTop: 8 }}>
            <ResponsiveContainer width="100%" height={110}>
              <LineChart data={data.steps.history.map((v, i) => ({ day: DAY_LABELS[i], v }))}>
                <Line type="monotone" dataKey="v" stroke={C.cyan} strokeWidth={2.5} dot={{ r: 3, fill: C.cyan }} isAnimationActive={false} />
                <YAxis hide domain={["dataMin - 500", "dataMax + 500"]} />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex justify-between" style={{ marginTop: 2 }}>
              {DAY_LABELS.map((d) => (
                <span key={d} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: C.mutedDim }}>
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
