"use client";

import React, { useRef, useEffect, useState, ReactElement, cloneElement, forwardRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { EffectComposer, Bloom, Noise, Vignette } from "@react-three/postprocessing"; 
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useVelocity, useMotionTemplate, useMotionValueEvent } from "framer-motion";
import Lenis from "@studio-freight/lenis";
import { Inter, Manrope, JetBrains_Mono } from "next/font/google";
import * as THREE from "three";
import { format } from "date-fns";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Matter from "matter-js"; 
import { RoughNotation, RoughNotationGroup } from "react-rough-notation";
import confetti from "canvas-confetti";
import Tilt from "react-parallax-tilt";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const inter = Inter({ subsets: ["latin"] });
const manrope = Manrope({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"] });

// --- UTILS ---
const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(" ");

const THEMES = {
  morning: { name: "Sunrise", accent: "bg-orange-500", text: "text-orange-500", hover: "hover:bg-orange-400", border: "hover:border-orange-500", rough: "#f97316" },
  afternoon: { name: "Industrial", accent: "bg-lime-400", text: "text-lime-600", hover: "hover:bg-lime-400", border: "hover:border-lime-400", rough: "#a3e635" },
  night: { name: "Cyber", accent: "bg-violet-500", text: "text-violet-500", hover: "hover:bg-violet-500", border: "hover:border-violet-500", rough: "#8b5cf6" }
};

const PROJECTS = [
  { id: "01", title: "CryptoPlace", category: "Fintech", desc: "A digital space for tracking and exploring cryptocurrencies trends and insights.", link: "https://crypto-place-brown.vercel.app/", color: "bg-blue-600", img: "/crypto-preview.png", tags: ["React", "Vite.js", "Tailwind", "Chart.js"] },
  { id: "02", title: "Truth", category: "Art", desc: "A thought-provoking concept exploring perspectives where perception can matter more than objective truth.", link: "https://truthis-optional.vercel.app/", color: "bg-purple-600", img: "/truth.png", tags: ["Three.js", "OpenAI", "Next.js"] },
  { id: "03", title: "Arguely", category: "Social", desc: "An AI-powered platform that helps structure, analyze, and strengthen arguments with logical clarity.", link: "https://debate-again.vercel.app/", color: "bg-emerald-600", img: "/Arguely.png", tags: ["OpenAI", "Next.js", "Tailwind", "Framer"] },
  { id: "04", title: "FocusBits", category: "Productivity", desc: "A focus-driven productivity system that breaks goals into small, actionable bits.", link: "https://timer-rho-khaki.vercel.app/", color: "bg-orange-600", img: "/timer.png", tags: ["Web Audio", "API"] },
  { id: "05", title: "Framwork", category: "System", desc: "A structured foundation that simplifies building, scaling, and maintaining applications.", link: "https://framework-seven-steel.vercel.app/", color: "bg-zinc-800", img: "/framework.png", tags: ["Storybook","GroqSDK"] },
  { id: "06", title: "MindScribe", category: "AI", desc: "An intelligent writing companion that turns thoughts into clear, expressive content.", link: "https://notes-chi-olive.vercel.app", color: "bg-indigo-600", img: "/notes.png", tags: ["OpenAI","Notes","API"] }
];

const TECH_ITEMS = ["Next.js", "React", "TypeScript", "Tailwind", "Framer", "Three.js", "Node.js", "Postgres", "Redis", "Docker", "AWS", "Figma", "Blender", "GSAP"];

// --- 1. FIXED COMPONENTS ---

// HyperText
const HyperText = ({ text, className }: { text: string, className?: string }) => {
  const [displayText, setDisplayText] = useState(text);
  
  const triggerAnimation = () => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(text.split("").map((letter, index) => {
        if (index < iteration) return text[index];
        return "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)];
      }).join(""));
      if (iteration >= text.length) clearInterval(interval);
      iteration += 1 / 3;
    }, 30);
  };

  return (
    <span className={cn("inline-block cursor-pointer", className)} onMouseEnter={triggerAnimation}>
      {displayText}
    </span>
  );
};

// Shimmer Button
const ShimmerButton = forwardRef<HTMLButtonElement, any>(({ children, onClick, className }, ref) => {
  return (
    <button 
      ref={ref} 
      onClick={onClick} 
      className={cn("group relative inline-flex h-12 overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50", className)}
    >
      <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
      <span className={`inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-8 py-1 text-sm font-bold text-white backdrop-blur-3xl transition-colors hover:bg-slate-950/90 uppercase tracking-widest`}>
        {children}
      </span>
    </button>
  );
});
ShimmerButton.displayName = "ShimmerButton";

// Sparkles
const SparklesCore = ({ background = "transparent", minSize = 0.4, maxSize = 1, particleDensity = 100, className, particleColor = "#FFFFFF" }: any) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const particles: any[] = [];
    
    for (let i = 0; i < particleDensity; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * (maxSize - minSize) + minSize,
        speedX: Math.random() * 0.5 - 0.25,
        speedY: Math.random() * 0.5 - 0.25,
      });
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.x += p.speedX; p.y += p.speedY;
        if (p.x < 0) p.x = width; if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height; if (p.y > height) p.y = 0;
        ctx.fillStyle = particleColor;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      });
      requestAnimationFrame(animate);
    };
    animate();
    
    const resize = () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [maxSize, minSize, particleColor, particleDensity]);
  
  return (
    <canvas ref={canvasRef} className={cn("pointer-events-none absolute inset-0 z-0 h-full w-full opacity-60", className)} style={{ background }} />
  );
};

// Marquee
function InfiniteMarquee() {
  const firstText = useRef<HTMLDivElement>(null);
  const secondText = useRef<HTMLDivElement>(null);
  const slider = useRef<HTMLDivElement>(null);
  let xPercent = 0;
  let direction = -1;

  useEffect(() => {
    let requestID: number;
    const animate = () => {
      if (xPercent <= -100) xPercent = 0;
      if (xPercent > 0) xPercent = -100;
      
      if (firstText.current && secondText.current) {
        gsap.set(firstText.current, { xPercent: xPercent });
        gsap.set(secondText.current, { xPercent: xPercent });
      }
      xPercent += 0.05 * direction;
      requestID = requestAnimationFrame(animate);
    };
    
    const handleScroll = () => { xPercent += 0.1 * direction; };
    window.addEventListener("scroll", handleScroll);
    requestID = requestAnimationFrame(animate);
    
    return () => {
        window.removeEventListener("scroll", handleScroll);
        cancelAnimationFrame(requestID);
    }
  }, []);

  return (
    <div className="relative flex overflow-hidden py-16 bg-black text-white border-t border-b border-zinc-800 z-20">
      <div ref={slider} className="relative whitespace-nowrap flex">
        <div ref={firstText} className={`text-[8vw] font-bold uppercase tracking-tighter leading-none pr-12 ${manrope.className}`}>
          Available for Freelance • Full Stack Engineer • 
        </div>
        <div ref={secondText} className={`absolute left-full top-0 text-[8vw] font-bold uppercase tracking-tighter leading-none pr-12 ${manrope.className}`}>
          Available for Freelance • Full Stack Engineer • 
        </div>
      </div>
    </div>
  );
}

// --- 2. CORE COMPONENTS ---

const GrainOverlay = () => (
  <div className="fixed inset-0 z-[9999] pointer-events-none opacity-[0.05] mix-blend-overlay">
    <svg className="w-full h-full">
      <filter id="noiseFilter">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noiseFilter)" />
    </svg>
  </div>
);

// GLITCH TEXT
const GlitchText = ({ children, theme }: { children: string, theme: any }) => {
  return (
    <div className="relative inline-block group">
      <span className="relative z-10">{children}</span>
      <span className="absolute top-0 left-0 -ml-[2px] text-red-500 opacity-0 group-hover:opacity-70 animate-pulse mix-blend-screen z-0">{children}</span>
      <span className="absolute top-0 left-0 ml-[2px] text-cyan-500 opacity-0 group-hover:opacity-70 animate-pulse delay-75 mix-blend-screen z-0">{children}</span>
      <motion.span className={`absolute inset-0 ${theme.accent} opacity-0 group-hover:opacity-20 z-20`} animate={{ clipPath: ["inset(0 0 100% 0)", "inset(100% 0 0 0)"] }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
    </div>
  );
};

const Blueprint = ({ children, type, color, show }: any) => (
  <RoughNotation type={type} color={color} show={show} animationDuration={1500} strokeWidth={2} padding={5}>{children}</RoughNotation>
);

function Cable() {
  const path = useRef<SVGPathElement>(null);
  useEffect(() => {
    let progress = 0; let x = 0.5; let time = Math.PI / 2; let reqId: number;
    const setPath = (value: number) => { const width = window.innerWidth; path.current?.setAttributeNS(null, "d", `M0 250 Q${width * x} ${250 + value} ${width} 250`); };
    const animate = () => { progress *= 0.975; time += 0.2; setPath(progress * Math.sin(time)); if (Math.abs(progress) > 0.5) reqId = requestAnimationFrame(animate); };
    const manageMouseMove = (e: MouseEvent) => { const pathBound = path.current?.getBoundingClientRect(); if (pathBound && e.clientY > pathBound.top - 50 && e.clientY < pathBound.bottom + 50) { x = e.clientX / window.innerWidth; progress += e.movementY * 2; animate(); } };
    window.addEventListener("mousemove", manageMouseMove); return () => { window.removeEventListener("mousemove", manageMouseMove); cancelAnimationFrame(reqId); }
  }, []);
  return <div className="absolute top-0 w-full h-[500px] pointer-events-none z-0 opacity-20"><svg className="w-full h-full"><path ref={path} stroke="currentColor" strokeWidth="2" fill="none" className="text-zinc-400" /></svg></div>;
}

function DynamicIsland({ message, visible }: { message: string, visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div initial={{ y: -100, scale: 0.8, opacity: 0 }} animate={{ y: 20, scale: 1, opacity: 1 }} exit={{ y: -100, scale: 0.8, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="fixed top-0 left-1/2 -translate-x-1/2 z-[200] bg-black text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl min-w-[200px] justify-center">
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
          <span className={`text-sm font-bold tracking-tight ${manrope.className}`}>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// TACTICAL HUD
const CyberHUD = ({ theme }: { theme: any }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrolling, setScrolling] = useState(false);
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => { setMousePos({ x: e.clientX, y: e.clientY }); };
    window.addEventListener("mousemove", handleMouseMove); return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => { setScrolling(true); const timeout = setTimeout(() => setScrolling(false), 200); return () => clearTimeout(timeout); });
  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden h-screen w-full select-none mix-blend-difference text-white/50 hidden md:block">
      <div className="absolute top-8 left-8 w-12 h-12 border-l-2 border-t-2 border-white/40" />
      <div className="absolute top-8 left-24 text-[10px] uppercase tracking-[0.2em] font-mono opacity-60">SYS.01 // READY</div>
      <div className="absolute top-8 right-8 w-12 h-12 border-r-2 border-t-2 border-white/40" />
      <div className="absolute top-8 right-24 text-right"><div className="text-[10px] uppercase tracking-[0.2em] font-mono opacity-60">SECURE CONNECTION</div><div className={`text-[10px] font-bold ${theme.text} animate-pulse`}>ENCRYPTED</div></div>
      <div className="absolute bottom-8 left-8 w-12 h-12 border-l-2 border-b-2 border-white/40" />
      <div className="absolute bottom-8 left-24 text-[10px] font-mono opacity-60 flex flex-col gap-1"><span>COORDS: {mousePos.x}X / {mousePos.y}Y</span><span>VELOCITY: {scrolling ? "ACTIVE" : "IDLE"}</span></div>
      <div className="absolute bottom-8 right-8 w-12 h-12 border-r-2 border-b-2 border-white/40" />
      <motion.div className="absolute top-0 left-0" animate={{ x: mousePos.x, y: mousePos.y }} transition={{ type: "tween", ease: "linear", duration: 0.1 }}><div className="absolute top-0 left-[-20px] w-[40px] h-[1px] bg-white/20" /><div className="absolute top-[-20px] left-0 w-[1px] h-[40px] bg-white/20" /></motion.div>
      <motion.div className={`absolute top-0 left-0 w-full h-[2px] ${theme.accent} opacity-20 shadow-[0_0_20px_rgba(255,255,255,0.5)]`} animate={{ top: ["0%", "100%"] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-2 items-end opacity-20">{[...Array(20)].map((_, i) => (<div key={i} className="flex items-center gap-2"><span className="text-[8px] font-mono">{i * 50}</span><div className={`h-[1px] bg-white ${i % 5 === 0 ? 'w-4' : 'w-2'}`} /></div>))}</div>
    </div>
  );
};

const HackerMode = () => {
  const [active, setActive] = useState(false);
  const [input, setInput] = useState("");
  const [logs, setLogs] = useState<string[]>(["MOSHIN.OS v2.0", "Type 'help'...", ""]);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    let keys: string[] = [];
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") setActive(false); keys.push(e.key); if (keys.length > 3) keys.shift(); if (keys.join("") === "cmd") { setActive(true); setTimeout(() => inputRef.current?.focus(), 100); } };
    window.addEventListener("keydown", handleKeyDown); return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  const handleCommand = (e: any) => { if (e.key === 'Enter') { const cmd = input.trim().toLowerCase(); const newLogs = [...logs, `> ${input}`]; if(cmd === 'exit') setActive(false); else if(cmd === 'help') newLogs.push("ls, whoami, contact, clear, exit"); else if(cmd === 'ls') PROJECTS.forEach(p => newLogs.push(`- ${p.title}`)); else if(cmd === 'contact') newLogs.push("moshink0786@gmail.com"); else if(cmd === 'clear') setLogs([]); else newLogs.push("Command not found."); setLogs(newLogs); setInput(""); } };
  if (!active) return null;
  return (<div className={`fixed inset-0 z-[9999] bg-black/95 text-green-500 p-8 ${mono.className} overflow-hidden`}><div className="max-w-2xl mx-auto h-full flex flex-col"><div className="flex-1 overflow-y-auto space-y-1">{logs.map((l, i) => <div key={i}>{l}</div>)}<div className="flex"><span>{">"}</span><input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleCommand} className="bg-transparent outline-none flex-1 ml-2" autoFocus/></div></div></div></div>);
};

const GravityArsenal = ({ theme }: { theme: any }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    if (!containerRef.current) return;
    const { Engine, World, Bodies, Mouse, MouseConstraint, Runner } = Matter;
    const engine = Engine.create();
    const width = containerRef.current.clientWidth; const height = 600; 
    World.add(engine.world, [Bodies.rectangle(width/2, height+50, width, 100, {isStatic:true}), Bodies.rectangle(-50, height/2, 100, height, {isStatic:true}), Bodies.rectangle(width+50, height/2, 100, height, {isStatic:true})]);
    const techBodies = TECH_ITEMS.map((_, i) => { const el = elementsRef.current[i]; if(!el) return null; return Bodies.rectangle(Math.random()*(width-100)+50, -Math.random()*500-100, el.offsetWidth, el.offsetHeight, {chamfer:{radius:20}, restitution:0.6}); }).filter(Boolean) as Matter.Body[];
    World.add(engine.world, techBodies);
    const mouseConstraint = MouseConstraint.create(engine, { mouse: Mouse.create(containerRef.current), constraint: { stiffness: 0.2, render: { visible: false } } });
    World.add(engine.world, mouseConstraint);
    Runner.run(Runner.create(), engine);
    const update = () => { techBodies.forEach((body, i) => { const el = elementsRef.current[i]; if(el) el.style.transform = `translate(${body.position.x - el.offsetWidth/2}px, ${body.position.y - el.offsetHeight/2}px) rotate(${body.angle}rad)`; }); requestAnimationFrame(update); };
    update();
    return () => { World.clear(engine.world, false); Engine.clear(engine); };
  }, []);
  return (<div ref={containerRef} className="relative w-full h-[600px] bg-zinc-50 border-y border-zinc-200 overflow-hidden cursor-grab active:cursor-grabbing"><div className="absolute inset-0 flex items-center justify-center pointer-events-none"><h3 className={`text-[10vw] font-black text-zinc-100 ${manrope.className} uppercase tracking-tighter`}>Playground</h3></div>{TECH_ITEMS.map((item, i) => (<div key={i} ref={(el) => { elementsRef.current[i] = el }} className={`absolute top-0 left-0 px-6 py-3 bg-white border-2 border-black rounded-full text-sm font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] select-none ${theme.hover}`}>{item}</div>))}</div>);
};

function Preloader({ onComplete, theme }: { onComplete: () => void, theme: any }) {
  const [count, setCount] = useState(0);
  const curtainRef = useRef(null);
  useEffect(() => { const interval = setInterval(() => setCount(p => p < 100 ? p + 1 : 100), 20); if (count === 100) gsap.to(curtainRef.current, { y: "-100%", duration: 1.2, ease: "power4.inOut", delay: 0.5, onComplete }); return () => clearInterval(interval); }, [count, onComplete]);
  return (<div ref={curtainRef} className={`fixed inset-0 bg-black z-[10000] flex items-end justify-start p-10 md:p-20 ${theme.text}`}><div className="flex flex-col"><span className={`text-[15vw] leading-[0.8] font-black tracking-tighter ${manrope.className}`}>{count}%</span><span className="text-xs uppercase tracking-widest mt-4 opacity-50">System Initializing...</span></div></div>);
}

function InteractiveGrid({ theme }: { theme: any }) {
  const mask = useRef<HTMLDivElement>(null);
  useEffect(() => { 
    const move = (e: MouseEvent) => { 
      if (!mask.current) return; 
      gsap.to(mask.current, { x: e.clientX, y: e.clientY, duration: 0.5, ease: "power2.out" }); 
    }; 
    window.addEventListener("mousemove", move); 
    return () => window.removeEventListener("mousemove", move); 
  }, []);
  return (<div className="fixed inset-0 z-0 pointer-events-none"><div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:40px_40px]" /><div ref={mask} className={`absolute w-[600px] h-[600px] rounded-full ${theme.accent} blur-[100px] opacity-10 -translate-x-1/2 -translate-y-1/2 mix-blend-multiply`} /></div>);
}

function CustomCursor() {
  const cursor = useRef<HTMLDivElement>(null);
  useEffect(() => { const move = (e: MouseEvent) => cursor.current && gsap.to(cursor.current, { x: e.clientX, y: e.clientY, duration: 0.1 }); window.addEventListener("mousemove", move); return () => window.removeEventListener("mousemove", move); }, []);
  return <div ref={cursor} className="fixed top-0 left-0 w-6 h-6 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 bg-white mix-blend-difference hidden md:block" />;
}

function Magnetic({ children }: { children: ReactElement }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const xTo = gsap.quickTo(el, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
    const yTo = gsap.quickTo(el, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });
    const move = (e: MouseEvent) => { const { left, top, width, height } = el.getBoundingClientRect(); xTo((e.clientX - (left + width/2)) * 0.35); yTo((e.clientY - (top + height/2)) * 0.35); };
    el.addEventListener("mousemove", move); el.addEventListener("mouseleave", () => { xTo(0); yTo(0); });
    return () => { el.removeEventListener("mousemove", move); };
  }, []);
  return cloneElement(children, { ref } as any);
}

function GeometricCore({ theme }: { theme: any }) {
  const mesh = useRef<THREE.Mesh>(null);
  const colors: any = { "bg-orange-500": "#f97316", "bg-lime-400": "#a3e635", "bg-violet-500": "#8b5cf6" };
  useFrame((s) => { if (mesh.current) { mesh.current.rotation.x = s.clock.elapsedTime * 0.15; mesh.current.rotation.y = s.clock.elapsedTime * 0.2; } });
  return (<Float speed={2} rotationIntensity={0.5}><mesh ref={mesh} scale={2.2}><icosahedronGeometry args={[1, 1]} /><meshBasicMaterial color={colors[theme.accent] || "#a3e635"} wireframe /></mesh></Float>);
}

function StackingCard({ project, index, range, targetScale, progress, setIndex, onExpand, theme }: any) {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({ target: container, offset: ['start end', 'start start'] });
  const scale = useTransform(progress, range, [1, targetScale]);
  const blur = useTransform(progress, range, [0, 4]);
  const y = useTransform(scrollYProgress, [0, 1], [-50, 50]); 

  return (
    <div ref={container} className="h-screen flex items-center justify-center sticky top-0">
      <motion.div style={{ scale, top: `calc(-5vh + ${index * 25}px)`, filter: `blur(${blur}px)` }} className="relative flex flex-col md:flex-row h-[500px] w-full max-w-6xl rounded-3xl p-8 md:p-12 border border-black/10 bg-white shadow-2xl origin-top overflow-hidden" onMouseEnter={() => setIndex(index)}>
        <div className="flex flex-col md:flex-row h-full gap-10 w-full">
          <div className="w-full md:w-[40%] flex flex-col justify-between z-10">
             <div>
                <div className="flex items-center gap-4 mb-8">
                  <span className={`text-sm font-bold ${theme.text} ${inter.className}`}>0{index + 1}</span>
                  <span className="px-3 py-1 border border-zinc-200 rounded-full text-[10px] font-bold uppercase tracking-widest text-zinc-400">{project.category}</span>
                </div>
                <div className={`text-4xl md:text-5xl font-bold leading-tight mb-6 ${manrope.className} cursor-pointer`}>
                    <HyperText text={project.title} />
                </div>
                <p className="text-zinc-500 text-sm leading-relaxed">{project.desc}</p>
             </div>
             <div className="flex flex-col gap-6">
                <div className="flex gap-2 flex-wrap">{project.tags.map((tag: string) => (<span key={tag} className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full">{tag}</span>))}</div>
                <Magnetic><a href={project.link} target="_blank" className={`inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest ${theme.text} transition-colors cursor-pointer w-fit hover:opacity-70`}>Live Site <span className="text-lg">↗</span></a></Magnetic>
             </div>
          </div>
          <div className="relative w-full md:w-[60%] h-full rounded-2xl overflow-hidden bg-zinc-100 group cursor-pointer" onClick={() => onExpand(project)}>
             <Tilt glareEnable glareMaxOpacity={0.2} scale={1.02} tiltMaxAngleX={5} tiltMaxAngleY={5} className="w-full h-full">
                <motion.div layoutId={`image-${project.id}`} style={{ y }} className="w-full h-full relative">
                    <div className="w-full h-full group-hover:scale-105 transition-transform duration-700">
                        <img src={project.img} alt={project.title} className="object-cover w-full h-full" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        <div className={`absolute inset-0 ${project.color} -z-10`} />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20"><span className="text-white font-bold uppercase tracking-widest bg-black px-4 py-2 rounded-full">Quick View</span></div>
                    </div>
                </motion.div>
             </Tilt>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function SpotifyStatus({ theme }: { theme: any }) {
  return (
    <div className="flex items-center gap-4 mt-12 md:mt-0 p-4 border border-zinc-100 backdrop-blur-md rounded-2xl w-fit">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme.accent} text-white shadow-lg`}><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.38-1.38 9.841-.72 13.441 1.56.419.24.6.84.3 1.26zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" /></svg></div>
      <div className="flex flex-col"><span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Now Playing</span><div className="flex items-center gap-3"><div className="flex gap-[3px] items-end h-3"><span className={`w-1 rounded-full ${theme.accent} animate-[bounce_1s_infinite]`} style={{ height: '60%' }} /><span className={`w-1 rounded-full ${theme.accent} animate-[bounce_1.5s_infinite]`} style={{ height: '100%' }} /><span className={`w-1 rounded-full ${theme.accent} animate-[bounce_0.8s_infinite]`} style={{ height: '40%' }} /><span className={`w-1 rounded-full ${theme.accent} animate-[bounce_1.2s_infinite]`} style={{ height: '80%' }} /></div><a href="https://open.spotify.com" target="_blank" className={`text-xs font-bold ${theme.text} hover:underline truncate max-w-[150px]`}>Starboy - The Weeknd</a></div></div>
    </div>
  )
}

// IDENTITY BADGE
function IdentityBadge({ theme }: { theme: any }) {
  const [barHeights, setBarHeights] = useState<number[]>([]);
  useEffect(() => { const randomHeights = Array.from({ length: 8 }, () => Math.random() * 24 + 4); setBarHeights(randomHeights); }, []);
  return (
    <Tilt glareEnable={true} glareMaxOpacity={0.45} glareColor="#ffffff" glarePosition="all" scale={1.02} tiltMaxAngleX={10} tiltMaxAngleY={10} className="relative z-10 w-full max-w-sm">
      <div className={`relative h-[220px] w-full rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl flex flex-col justify-between p-6`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <div className="flex justify-between items-start">
           <div className="flex items-center gap-3">
              <div className="relative w-12 h-12">
                 <div className={`absolute inset-0 rounded-full ${theme.accent} blur-md animate-pulse`} />
                 <div className="relative w-full h-full rounded-full bg-zinc-900 border border-white/20 overflow-hidden"><img src="https://github.com/mkhan0012.png" alt="Profile" className="w-full h-full object-cover opacity-80" /></div>
              </div>
              <div className="flex flex-col"><span className={`text-[10px] font-bold uppercase tracking-widest ${theme.text}`}>Operator</span><span className={`text-lg font-bold text-white ${manrope.className}`}>Moshin Khan</span></div>
           </div>
           <div className="flex gap-[2px] h-8 items-center opacity-50">{barHeights.length > 0 ? (barHeights.map((h, i) => (<div key={i} className="w-[3px] bg-white rounded-full" style={{ height: h + 'px' }} />))) : ([...Array(8)].map((_, i) => (<div key={i} className="w-[3px] bg-white rounded-full h-2" />)))}</div>
        </div>
        <div className="relative w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent my-2" />
        <div className="flex justify-between items-end">
           <div className="flex flex-col gap-1">
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest">Access Level</span>
              <div className="flex items-center gap-2"><div className="flex gap-1"><div className={`w-1.5 h-1.5 rounded-full ${theme.accent}`} /><div className={`w-1.5 h-1.5 rounded-full ${theme.accent}`} /><div className={`w-1.5 h-1.5 rounded-full ${theme.accent}`} /><div className={`w-1.5 h-1.5 rounded-full ${theme.accent} opacity-30`} /></div><span className="text-xs font-bold text-white">TIER 1</span></div>
           </div>
           <div className={`border border-white/10 bg-white/5 px-3 py-1 rounded-md text-[10px] font-mono text-zinc-300 backdrop-blur-md`}>ID: MK-2026-DEV</div>
        </div>
        <div className="absolute inset-0 z-[-1] opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
      </div>
    </Tilt>
  );
}

// FOOTER
function Footer({ theme, onCopy }: { theme: any, onCopy: () => void }) {
  return (
    <div className="fixed bottom-0 h-[80vh] w-full bg-black text-white z-0 flex flex-col justify-between p-6 md:p-24" style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}>
      <div className="flex justify-between items-start w-full">
         <h2 className={`text-[12vw] leading-[0.8] font-black tracking-tighter ${manrope.className}`}>LET'S<br/><span className={theme.text}>TALK</span></h2>
         <div className="hidden md:block"><IdentityBadge theme={theme} /></div>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-end gap-10">
         <div className="flex flex-col gap-6 w-full md:w-auto">
            <div><p className="text-zinc-500 uppercase tracking-widest text-xs mb-2">Got a project?</p><Magnetic><button onClick={onCopy} className={`text-2xl md:text-4xl font-bold ${theme.text} transition-colors border-b border-zinc-800 pb-2 text-left`}>moshink0786@gmail.com</button></Magnetic></div>
            <div className="md:hidden w-full"><IdentityBadge theme={theme} /></div>
            <SpotifyStatus theme={theme} />
         </div>
         <div className="flex flex-col items-end gap-2"><div className="flex gap-4 mb-2"><a href="https://linkedin.com" className="text-zinc-500 hover:text-white uppercase text-xs tracking-widest transition-colors">LinkedIn</a><a href="https://github.com" className="text-zinc-500 hover:text-white uppercase text-xs tracking-widest transition-colors">GitHub</a></div><p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">© 2026 Md Moshin Khan</p></div>
      </div>
    </div>
  )
}

function Header({ theme }: { theme: any }) {
  const [time, setTime] = useState("");
  useEffect(() => { const timer = setInterval(() => setTime(format(new Date(), "HH:mm:ss 'IST'")), 1000); return () => clearInterval(timer); }, []);
  return (
    <header className="fixed top-0 left-0 w-full p-6 md:p-10 flex justify-between items-start z-50 pointer-events-none text-black mix-blend-difference">
      <div className="flex flex-col items-start pointer-events-auto"><h1 className={`text-xl font-bold tracking-tight ${manrope.className} text-white md:text-black md:mix-blend-normal`}>MOSHIN.DEV</h1><span className="text-xs text-zinc-500 font-medium tracking-widest mt-1">FULL STACK ENGINEER</span></div>
      <div className="hidden md:flex flex-col items-end text-xs font-medium tracking-widest text-zinc-500 uppercase"><span className="flex items-center gap-2"><span className={`w-2 h-2 ${theme.accent} rounded-full animate-pulse`}/> Available for Work</span><span className="mt-1">{time}</span><span>Rajgangpur, India</span></div>
    </header>
  );
}

// SENTIENT GRID
const SentientItem = ({ title, icon, desc, theme, delay }: any) => {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => { if (!ref.current) return; const rect = ref.current.getBoundingClientRect(); setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top }); };
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: delay, duration: 0.5 }} onMouseMove={handleMouseMove} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className="relative group rounded-xl border border-zinc-200 bg-white overflow-hidden min-h-[250px] flex flex-col justify-between p-8">
      <div className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" style={{ background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0,0,0,0.06), transparent 40%)` }} />
      <div className="absolute inset-0 opacity-[0.03] z-0 bg-[linear-gradient(to_right,#000000_1px,transparent_1px),linear-gradient(to_bottom,#000000_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="relative z-20"><div className={`w-12 h-12 rounded-lg ${theme.accent} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>{icon}</div><h3 className={`text-2xl font-bold ${manrope.className} mb-2`}>{title}</h3><p className="text-zinc-500 text-sm leading-relaxed">{desc}</p></div>
      <div className="relative z-20 mt-4 overflow-hidden"><div className={`h-1 w-full bg-zinc-100 rounded-full overflow-hidden`}><motion.div animate={{ x: hovered ? "0%" : "-100%" }} transition={{ duration: 0.4, ease: "circOut" }} className={`h-full w-full ${theme.accent}`} /></div><div className="flex justify-between mt-2"><span className={`${mono.className} text-[10px] text-zinc-400 uppercase tracking-widest`}>Status</span><span className={`${mono.className} text-[10px] ${theme.text} font-bold uppercase tracking-widest`}>{hovered ? "ONLINE" : "STANDBY"}</span></div></div>
    </motion.div>
  );
};
const SentientGrid = ({ theme }: { theme: any }) => {
  const services = [
    { title: "System Architecture", desc: "Designing scalable, fault-tolerant digital ecosystems using microservices and event-driven patterns.", icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg> },
    { title: "Interactive Experiences", desc: "Merging WebGL, GSAP, and Framer Motion to create immersive, award-winning frontend interfaces.", icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg> },
    { title: "Creative Engineering", desc: "Solving complex algorithmic challenges while maintaining a keen eye for design aesthetics.", icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg> }
  ];
  return (
    <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6"><div><h2 className={`text-4xl md:text-6xl font-black tracking-tighter ${manrope.className} mb-4`}>Capabilities <span className="text-zinc-300">&&</span><br /><span className={theme.text}>Offerings</span></h2></div><p className="max-w-md text-sm text-zinc-500 font-medium leading-relaxed">Deployed strategies for the modern web. Specialized in bridging the gap between heavy backend logic and fluid frontend motion.</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{services.map((s, i) => (<SentientItem key={i} {...s} theme={theme} delay={i * 0.1} />))}</div>
    </section>
  );
};

// --- NEW COMPONENT: WARP SPEED WRAPPER ---
const WarpWrapper = ({ children }: { children: React.ReactNode }) => {
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(velocity, { stiffness: 400, damping: 90 });
  const skew = useTransform(smoothVelocity, [-1000, 1000], [-5, 5]);
  const rX = useTransform(smoothVelocity, [-2000, 2000], [0, 10]);
  const bX = useTransform(smoothVelocity, [-2000, 2000], [0, -10]);
  const filter = useMotionTemplate`drop-shadow(${rX}px 0px 0px rgba(255,0,0,0.5)) drop-shadow(${bX}px 0px 0px rgba(0,255,255,0.5))`;
  return <motion.div style={{ skewY: skew, filter: filter }} className="origin-center will-change-transform">{children}</motion.div>;
};

// --- NEW COMPONENT: SINGULARITY LENS ---
const SingularityLens = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  useEffect(() => { const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY }); window.addEventListener("mousemove", move); return () => window.removeEventListener("mousemove", move); }, []);
  return (
    <>
      <svg className="fixed pointer-events-none w-0 h-0"><filter id="fluid-distortion"><feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="noise" /><feDisplacementMap in="SourceGraphic" in2="noise" scale="30" /></filter></svg>
      <div className="fixed top-0 left-0 w-[300px] h-[300px] rounded-full pointer-events-none z-[80] mix-blend-exclusion opacity-30" style={{ transform: `translate(${pos.x - 150}px, ${pos.y - 150}px)`, backdropFilter: "url(#fluid-distortion) blur(2px)", background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 70%)", }} />
    </>
  );
};

// --- MAIN PAGE ---
export default function Home() {
  const container = useRef<HTMLDivElement>(null);
  const [activeProjectIndex, setActiveProjectIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [theme, setTheme] = useState(THEMES.afternoon); 
  const [showNotification, setShowNotification] = useState(false);
  const [showBlueprints, setShowBlueprints] = useState(false); 
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) setTheme(THEMES.morning);
    else if (hour >= 12 && hour < 18) setTheme(THEMES.afternoon);
    else setTheme(THEMES.night);
  }, []);

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08 });
    function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  const { scrollYProgress } = useScroll({ target: container, offset: ['start start', 'end end'] });

  useEffect(() => {
    if (!isLoading) {
      const ctx = gsap.context(() => { gsap.from(".hero-fade", { y: 20, opacity: 0, duration: 1, ease: "power2.out", delay: 1 }); }, container);
      setTimeout(() => setShowBlueprints(true), 2000); 
      return () => ctx.revert();
    }
  }, [isLoading]);

  const handleCopy = () => { 
    navigator.clipboard.writeText("moshink0786@gmail.com"); 
    setShowNotification(true);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.9 }, colors: ['#a3e635', '#f97316', '#8b5cf6'] });
    setTimeout(() => setShowNotification(false), 2500);
  };

  return (
    <main ref={container} className={`bg-white text-black min-h-screen selection:${theme.accent} selection:text-black ${inter.className} relative transition-colors duration-1000`}>
      <Preloader onComplete={() => setIsLoading(false)} theme={theme} />
      <CustomCursor />
      <Header theme={theme} />
      <HackerMode /> 
      <DynamicIsland message="Email Copied!" visible={showNotification} />
      <SingularityLens />
      <CyberHUD theme={theme} />
      <InteractiveGrid theme={theme} />
      <GrainOverlay />
      
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProject(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" />
            <motion.div layoutId={`image-${selectedProject.id}`} className="relative w-full max-w-4xl h-[80vh] bg-white rounded-3xl overflow-hidden shadow-2xl z-10">
              <img src={selectedProject.img} alt={selectedProject.title} className="object-cover w-full h-full" />
              <button onClick={() => setSelectedProject(null)} className={`absolute top-4 right-4 bg-white text-black rounded-full px-4 py-2 font-bold uppercase tracking-widest text-xs ${theme.hover}`}>Close</button>
              <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/80 to-transparent text-white"><h2 className={`text-4xl font-bold ${manrope.className}`}>{selectedProject.title}</h2><p className="mt-2 text-zinc-300">{selectedProject.desc}</p></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="relative z-10 bg-white mb-[80vh] shadow-[0px_50px_100px_rgba(0,0,0,0.5)]">
        <WarpWrapper>
            <section className="relative h-screen w-full flex flex-col justify-center items-center px-4 overflow-hidden">
              <div className="absolute inset-0 z-0 opacity-30 pointer-events-none"><Canvas camera={{ position: [0, 0, 5] }} dpr={[1, 2]}><GeometricCore theme={theme} /><EffectComposer><Bloom luminanceThreshold={0.2} mipmapBlur intensity={0.5} /><Noise opacity={0.03} /><Vignette eskil={false} offset={0.1} darkness={1.1} /></EffectComposer></Canvas></div>
              <SparklesCore background="transparent" minSize={0.6} maxSize={1.4} particleDensity={100} className="w-full h-full" particleColor={theme.rough} />
              <Cable />
              <div className="relative z-10 text-center">
                <div className="hero-fade"><h2 className="text-xs md:text-sm font-bold tracking-[0.4em] text-zinc-400 uppercase mb-6">Portfolio · 2026</h2></div>
                <div className="overflow-hidden leading-[0.85]"><h1 className={`text-[13vw] md:text-[9rem] font-black tracking-tighter text-black ${manrope.className}`}><div className="flex justify-center overflow-hidden"><GlitchText theme={theme}>MD MOSHIN</GlitchText></div><div className="flex justify-center overflow-hidden"><GlitchText theme={theme}>KHAN</GlitchText></div></h1></div>
                <div className="hero-fade mt-10 flex flex-col items-center justify-center">
                  <p className="text-zinc-500 max-w-md text-sm md:text-base leading-relaxed font-medium">An engineering-focused <Blueprint type="highlight" color={theme.rough + "33"} show={showBlueprints}>creative developer</Blueprint> building <Blueprint type="underline" color={theme.rough} show={showBlueprints}>high-performance</Blueprint> digital architecture.</p>
                  <div className="mt-8"><Magnetic><ShimmerButton onClick={() => document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' })} className={theme.hover}>Explore Works</ShimmerButton></Magnetic></div>
                </div>
              </div>
            </section>

            <InfiniteMarquee />
            <div className="bg-zinc-50/50 border-b border-zinc-200"><SentientGrid theme={theme} /></div>

            <section id="work" className="relative pt-32 pb-64 bg-zinc-50/50">
              <div className="max-w-7xl mx-auto px-6 md:px-12 mb-24"><h2 className={`text-5xl md:text-8xl font-black tracking-tighter mb-6 text-black ${manrope.className}`}>Selected Projects</h2><div className={`w-24 h-2 ${theme.accent}`} /></div>
              {PROJECTS.map((project, i) => {
                const targetScale = 1 - ( (PROJECTS.length - i) * 0.05 );
                return <StackingCard key={i} project={project} index={i} range={[i * 0.25, 1]} targetScale={targetScale} progress={scrollYProgress} setIndex={setActiveProjectIndex} onExpand={setSelectedProject} theme={theme} />
              })}
            </section>

            <section className="relative bg-white py-32 border-t border-zinc-100 overflow-hidden">
              <div className="max-w-7xl mx-auto px-6 md:px-12 mb-16"><RoughNotationGroup show={true}><h2 className={`text-4xl font-bold tracking-tight mb-6 text-black ${manrope.className}`}>Technical Arsenal</h2><p className="text-sm text-zinc-500 uppercase tracking-widest font-bold">Core Competencies (<Blueprint type="circle" color={theme.rough} show={true}>Drag to throw</Blueprint>)</p></RoughNotationGroup></div>
              <GravityArsenal theme={theme} />
            </section>
        </WarpWrapper>
      </div>
      <Footer theme={theme} onCopy={handleCopy} />
    </main>
  );
}