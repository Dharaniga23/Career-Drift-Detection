import React, { useState } from 'react';
import { roadmapData } from './roadmapData';
import { CAREER_DOMAINS } from '../constants/careers';
import {
  Briefcase, ChevronRight, Code2, Database, Shield, Cloud, Cpu,
  BarChart2, Layers, Smartphone, Palette, Server, Gamepad2, LineChart,
  MonitorDot, GitBranch
} from 'lucide-react';

const domainMeta = CAREER_DOMAINS.reduce((acc, domain) => {
  acc[domain.id] = { 
    icon: domain.icon, 
    color: domain.color,
    // Add default gradients since they weren't in the shared constants but were used in UI
    gradient: `from-blue-500 to-indigo-600` 
  };
  return acc;
}, {});


// Phase step accent colors — cycles through a palette
const stepAccents = [
  { dot: "#38bdf8", badge: "rgba(56,189,248,0.12)", badgeBorder: "rgba(56,189,248,0.3)", badgeText: "#7dd3fc" },
  { dot: "#a78bfa", badge: "rgba(167,139,250,0.12)", badgeBorder: "rgba(167,139,250,0.3)", badgeText: "#c4b5fd" },
  { dot: "#34d399", badge: "rgba(52,211,153,0.12)", badgeBorder: "rgba(52,211,153,0.3)", badgeText: "#6ee7b7" },
  { dot: "#fb923c", badge: "rgba(251,146,60,0.12)", badgeBorder: "rgba(251,146,60,0.3)", badgeText: "#fdba74" },
  { dot: "#f472b6", badge: "rgba(244,114,182,0.12)", badgeBorder: "rgba(244,114,182,0.3)", badgeText: "#f9a8d4" },
  { dot: "#facc15", badge: "rgba(250,204,21,0.12)", badgeBorder: "rgba(250,204,21,0.3)", badgeText: "#fde047" },
];

export default function Roadmaps() {
  const defaultDomain = "Data Scientist";
  const [selectedDomain, setSelectedDomain] = useState(defaultDomain);
  const [hoveredStep, setHoveredStep] = useState(null);

  const domainNames = Object.keys(roadmapData);
  const currentRoadmap = roadmapData[selectedDomain];
  const meta = domainMeta[selectedDomain] || { icon: Code2, color: "#60a5fa", gradient: "from-blue-400 to-indigo-600" };
  const DomainIcon = meta.icon;

  return (
    <div style={styles.wrapper}>
      {/* ── Sidebar ── */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <Briefcase size={16} color="#94a3b8" />
          <span style={styles.sidebarHeaderText}>IT Domains</span>
        </div>

        <div style={styles.domainList}>
          {domainNames.map((domain) => {
            const m = domainMeta[domain] || { icon: Code2, color: "#60a5fa" };
            const Icon = m.icon;
            const isActive = selectedDomain === domain;
            return (
              <button
                key={domain}
                onClick={() => setSelectedDomain(domain)}
                style={{
                  ...styles.domainBtn,
                  ...(isActive ? { ...styles.domainBtnActive, borderColor: m.color + "55", background: m.color + "18" } : {}),
                }}
                onMouseEnter={e => !isActive && (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                onMouseLeave={e => !isActive && (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ ...styles.domainIconWrap, background: isActive ? m.color + "22" : "rgba(255,255,255,0.06)" }}>
                  <Icon size={14} color={isActive ? m.color : "#64748b"} />
                </span>
                <span style={{ ...styles.domainLabel, color: isActive ? "#f1f5f9" : "#94a3b8" }}>
                  {domain}
                </span>
                {isActive && <ChevronRight size={14} color={m.color} style={{ marginLeft: "auto", flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={styles.main}>
        {/* Header card */}
        <div style={{ ...styles.headerCard }}>
          <div style={{ ...styles.headerGradientBar, backgroundImage: `linear-gradient(135deg, ${meta.color}33 0%, transparent 100%)` }} />
          <div style={styles.headerContent}>
            <div style={{ ...styles.headerIconCircle, background: `linear-gradient(135deg, ${meta.color}44, ${meta.color}22)`, boxShadow: `0 0 24px ${meta.color}40` }}>
              <DomainIcon size={28} color={meta.color} />
            </div>
            <div>
              <h1 style={styles.headerTitle}>
                {selectedDomain}
                <span style={{ ...styles.headerTitleGradient, backgroundImage: `linear-gradient(90deg, ${meta.color}, #e2e8f0)` }}>
                  {" "}Roadmap
                </span>
              </h1>
              <p style={styles.headerDesc}>{currentRoadmap.description}</p>
            </div>
          </div>
          <div style={styles.headerStats}>
            <div style={styles.statPill}>
              <span style={styles.statNum}>{currentRoadmap.phases.length}</span>
              <span style={styles.statLabel}>Phases</span>
            </div>
            <div style={styles.statPill}>
              <span style={styles.statNum}>
                {currentRoadmap.phases.reduce((a, p) => a + p.topics.length, 0)}
              </span>
              <span style={styles.statLabel}>Topics</span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div style={styles.timeline}>
          {currentRoadmap.phases.map((phase, index) => {
            const accent = stepAccents[index % stepAccents.length];
            const isHovered = hoveredStep === index;
            return (
              <div
                key={index}
                style={styles.timelineRow}
                onMouseEnter={() => setHoveredStep(index)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                {/* Left: step number + connector */}
                <div style={styles.stepTrack}>
                  <div style={{
                    ...styles.stepDot,
                    background: accent.dot,
                    boxShadow: isHovered ? `0 0 20px ${accent.dot}90` : `0 0 8px ${accent.dot}50`,
                    transform: isHovered ? "scale(1.15)" : "scale(1)",
                  }}>
                    <span style={styles.stepNum}>{index + 1}</span>
                  </div>
                  {index < currentRoadmap.phases.length - 1 && (
                    <div style={{ ...styles.connector, background: `linear-gradient(to bottom, ${accent.dot}60, ${stepAccents[(index + 1) % stepAccents.length].dot}30)` }} />
                  )}
                </div>

                {/* Right: phase card */}
                <div style={{
                  ...styles.phaseCard,
                  borderColor: isHovered ? accent.dot + "55" : "rgba(255,255,255,0.06)",
                  boxShadow: isHovered ? `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px ${accent.dot}30` : "0 2px 12px rgba(0,0,0,0.2)",
                  transform: isHovered ? "translateX(4px)" : "translateX(0)",
                }}>
                  <div style={styles.phaseHeader}>
                    <span style={{ ...styles.phaseIndex, color: accent.dot }}>Phase {String(index + 1).padStart(2, "0")}</span>
                    <h3 style={styles.phaseTitle}>{phase.title}</h3>
                  </div>

                  <div style={styles.topicGrid}>
                    {phase.topics.map((topic, i) => (
                      <span
                        key={i}
                        style={{
                          ...styles.topicBadge,
                          background: accent.badge,
                          borderColor: accent.badgeBorder,
                          color: accent.badgeText,
                        }}
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

/* ─── Inline styles ─── */
const styles = {
  wrapper: {
    display: "flex",
    gap: "24px",
    minHeight: "100%",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },

  /* Sidebar */
  sidebar: {
    width: "220px",
    flexShrink: 0,
    background: "rgba(15,23,42,0.7)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "16px",
    padding: "20px 12px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    alignSelf: "flex-start",
    position: "sticky",
    top: "24px",
    maxHeight: "85vh",
    overflowY: "auto",
  },
  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "0 8px 12px",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    marginBottom: "4px",
  },
  sidebarHeaderText: {
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#64748b",
  },
  domainList: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  domainBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 10px",
    borderRadius: "10px",
    border: "1px solid transparent",
    background: "transparent",
    cursor: "pointer",
    transition: "all 0.18s ease",
    textAlign: "left",
    width: "100%",
  },
  domainBtnActive: {
    background: "rgba(99,102,241,0.1)",
  },
  domainIconWrap: {
    width: "26px",
    height: "26px",
    borderRadius: "7px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 0.18s ease",
  },
  domainLabel: {
    fontSize: "13px",
    fontWeight: 500,
    lineHeight: 1.3,
    transition: "color 0.18s",
  },

  /* Main */
  main: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },

  /* Header card */
  headerCard: {
    position: "relative",
    background: "rgba(15,23,42,0.75)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    padding: "28px 32px",
    overflow: "hidden",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
  },
  headerGradientBar: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    position: "relative",
    zIndex: 1,
  },
  headerIconCircle: {
    width: "60px",
    height: "60px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: "24px",
    fontWeight: 800,
    color: "#f1f5f9",
    margin: 0,
    lineHeight: 1.2,
  },
  headerTitleGradient: {
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  headerDesc: {
    margin: "6px 0 0",
    fontSize: "13.5px",
    color: "#64748b",
    maxWidth: "420px",
    lineHeight: 1.6,
  },
  headerStats: {
    display: "flex",
    gap: "12px",
    position: "relative",
    zIndex: 1,
  },
  statPill: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: "12px",
    padding: "12px 20px",
    textAlign: "center",
    minWidth: "64px",
  },
  statNum: {
    display: "block",
    fontSize: "22px",
    fontWeight: 800,
    color: "#f1f5f9",
    lineHeight: 1,
  },
  statLabel: {
    display: "block",
    fontSize: "11px",
    color: "#64748b",
    marginTop: "4px",
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },

  /* Timeline */
  timeline: {
    display: "flex",
    flexDirection: "column",
    gap: "0",
  },
  timelineRow: {
    display: "flex",
    gap: "20px",
    alignItems: "flex-start",
  },
  stepTrack: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flexShrink: 0,
    width: "40px",
  },
  stepDot: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 0.25s ease",
    zIndex: 1,
  },
  stepNum: {
    fontSize: "13px",
    fontWeight: 800,
    color: "#0f172a",
  },
  connector: {
    width: "2px",
    flex: 1,
    minHeight: "28px",
    marginTop: "4px",
    marginBottom: "4px",
    borderRadius: "2px",
  },
  phaseCard: {
    flex: 1,
    background: "rgba(15,23,42,0.6)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "16px",
    padding: "20px 24px",
    marginBottom: "20px",
    transition: "all 0.25s ease",
    cursor: "default",
  },
  phaseHeader: {
    marginBottom: "14px",
  },
  phaseIndex: {
    fontSize: "10.5px",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    display: "block",
    marginBottom: "4px",
  },
  phaseTitle: {
    fontSize: "17px",
    fontWeight: 700,
    color: "#e2e8f0",
    margin: 0,
    lineHeight: 1.3,
  },
  topicGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  topicBadge: {
    padding: "5px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 500,
    border: "1px solid",
    lineHeight: 1.4,
    transition: "opacity 0.15s",
  },
};
