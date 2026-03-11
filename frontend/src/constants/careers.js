import { 
  MonitorDot, Server, LineChart, GitBranch, Layers, Cpu, 
  BarChart2, Briefcase, Shield, Cloud, Smartphone, Palette, 
  Database, Gamepad2 
} from 'lucide-react';

export const CAREER_DOMAINS = [
  { id: "Frontend Developer", label: "Frontend Developer", icon: MonitorDot, color: "#38bdf8", emoji: "🎨", desc: "React, CSS, UI/UX" },
  { id: "Backend Developer", label: "Backend Developer", icon: Server, color: "#a78bfa", emoji: "⚙️", desc: "API, Database, System Design" },
  { id: "Data Scientist", label: "Data Scientist", icon: LineChart, color: "#34d399", emoji: "📊", desc: "Python, ML, Analytics" },
  { id: "DevOps Engineer", label: "DevOps Engineer", icon: GitBranch, color: "#fb923c", emoji: "♾️", desc: "CI/CD, Docker, Kubernetes" },
  { id: "Full Stack Developer", label: "Full Stack Developer", icon: Layers, color: "#60a5fa", emoji: "🥞", desc: "End-to-end Web Apps" },
  { id: "AI/ML Engineer", label: "AI/ML Engineer", icon: Cpu, color: "#f472b6", emoji: "🤖", desc: "Neural Networks, NLP" },
  { id: "Data Analyst", label: "Data Analyst", icon: BarChart2, color: "#facc15", emoji: "📈", desc: "SQL, Tableau, Excel" },
  { id: "Business Analyst", label: "Business Analyst", icon: Briefcase, color: "#4ade80", emoji: "💼", desc: "Requirements, Agile" },
  { id: "Cybersecurity Engineer", label: "Cybersecurity Engineer", icon: Shield, color: "#f87171", emoji: "🔒", desc: "Security, Pentesting" },
  { id: "Cloud Engineer", label: "Cloud Engineer", icon: Cloud, color: "#67e8f9", emoji: "☁️", desc: "AWS, Azure, Cloud Infra" },
  { id: "Mobile Developer", label: "Mobile Developer", icon: Smartphone, color: "#c084fc", emoji: "📱", desc: "iOS, Android, React Native" },
  { id: "UI/UX Designer", label: "UI/UX Designer", icon: Palette, color: "#fd8a8a", emoji: "💎", desc: "Figma, Prototyping" },
  { id: "Database Administrator", label: "Database Administrator", icon: Database, color: "#6ee7b7", emoji: "🗄️", desc: "DB Tuning, Admin" },
  { id: "Game Developer", label: "Game Developer", icon: Gamepad2, color: "#fbbf24", emoji: "🎮", desc: "Unity, Unreal, 3D" },
];
