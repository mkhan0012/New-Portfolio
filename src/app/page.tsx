"use client";

import { useRef, useEffect, useState, ReactElement, cloneElement, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
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

// --- FONTS ---
const inter = Inter({ subsets: ["latin"] });
const manrope = Manrope({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets: ["latin"] });

// --- DATA ---
const THEMES = {
  morning: { name: "Sunrise", accent: "bg-orange-500", text: "text-orange-500", hover: "hover:bg-orange-400", border: "hover:border-orange-500", rough: "#f97316" },
  afternoon: { name: "Industrial", accent: "bg-lime-400", text: "text-lime-600", hover: "hover:bg-lime-400", border: "hover:border-lime-400", rough: "#a3e635" },
  night: { name: "Cyber", accent: "bg-violet-500", text: "text-violet-500", hover: "hover:bg-violet-500", border: "hover:border-violet-500", rough: "#8b5cf6" },
  hazard: { name: "Safety", accent: "bg-yellow-400", text: "text-yellow-600", hover: "hover:bg-yellow-400", border: "hover:border-yellow-400", rough: "#fbbf24" }
};

const PROJECTS = [
  { id: "01", title: "CryptoPlace", category: "Fintech", desc: "A digital space for tracking and exploring cryptocurrencies trends and insights.", link: "https://crypto-place-brown.vercel.app/", color: "bg-blue-600", img: "/crypto-preview.png", tags: ["React", "Vite.js", "Tailwind", "Chart.js"] },
  { id: "02", title: "Truth", category: "Art", desc: "A thought-provoking concept exploring perspectives where perception can matter more than objective truth.", link: "https://truthis-optional.vercel.app/", color: "bg-purple-600", img: "/truth.png", tags: ["Three.js", "OpenAI", "Next.js"] },
  { id: "03", title: "Arguely", category: "Social", desc: "An AI-powered platform that helps structure, analyze, and strengthen arguments with logical clarity.", link: "https://debate-again.vercel.app/", color: "bg-emerald-600", img: "/Arguely.png", tags: ["OpenAI", "Next.js", "Tailwind", "Framer"] },
  { id: "04", title: "FocusBits", category: "Productivity", desc: "A focus-driven productivity system that breaks goals into small, actionable bits.", link: "https://timer-rho-khaki.vercel.app/", color: "bg-orange-600", img: "/timer.png", tags: ["Web Audio", "API"] },
  { id: "05", title: "Framework", category: "System", desc: "A structured foundation that simplifies building, scaling, and maintaining applications.", link: "https://framework-seven-steel.vercel.app/", color: "bg-zinc-800", img: "/framework.png", tags: ["Storybook", "GroqSDK"] },
  { id: "06", title: "MindScribe", category: "AI", desc: "An intelligent writing companion that turns thoughts into clear, expressive content.", link: "https://notes-chi-olive.vercel.app", color: "bg-indigo-600", img: "/notes.png", tags: ["OpenAI", "Notes", "API"] }
];

const TECH_ITEMS = [
  "Next.js 15", "React.js", "Tailwind v4", "TypeScript", "JavaScript (ES6+)",
  "Redux Toolkit", "Framer Motion", "Node.js", "Prisma ORM", "PostgreSQL",
  "Firebase", "Server Actions", "Git", "Vercel", "Zod",
  "C++", "SQL", "HTML5", "CSS3",
  "AI Integration", "AES Encryption", "REST APIs", "UI/UX Design"
];

// --- STYLES ---
const GlobalStyles = () => (
  <style jsx global>{`
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: black; }
    ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
    ::-webkit-scrollbar-thumb:hover { background: #555; }
    ::selection { background: #a3e635; color: black; }
    body { cursor: auto; }
    @media (min-width: 768px) { body { cursor: none; } }
    * { -webkit-tap-highlight-color: transparent; }
    
    html.lenis, html.lenis body { height: auto; }
    .lenis.lenis-smooth { scroll-behavior: auto !important; }
    .lenis.lenis-smooth [data-lenis-prevent] { overscroll-behavior: contain; }
    .lenis.lenis-stopped { overflow: hidden; }
    .lenis.lenis-scrolling iframe { pointer-events: none; }
  `}</style>
);

const GrainOverlay = () => (
  <div className="hidden md:block fixed inset-0 z-[9999] pointer-events-none mix-blend-overlay">
    <div className="absolute inset-0 opacity-[0.05]">
      <svg className="w-full h-full"><filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" /></filter><rect width="100%" height="100%" filter="url(#noiseFilter)" /></svg>
    </div>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)]" />
  </div>
);

const HyperText = ({ text, className }: { text: string, className?: string }) => {
  const [displayText, setDisplayText] = useState(text);
  const scramble = () => {
    let pos = 0; const chars = "!@#$%^&*()";
    const interval = setInterval(() => {
      setDisplayText(text.split("").map((c, i) => pos / 2 > i ? c : chars[Math.floor(Math.random() * chars.length)]).join(""));
      pos++; if (pos >= text.length * 2) clearInterval(interval);
    }, 50);
  };
  return <span onMouseEnter={scramble} className={className}>{displayText}</span>;
};

// --- COMPONENTS ---

function CreativeProjectHeader({ theme }: { theme: any }) {
  return (
    <div className="relative flex flex-col items-center justify-center mb-20 md:mb-32">
      <div className="relative overflow-hidden w-full px-4">
        <h2 className={`text-4xl md:text-8xl font-black tracking-tighter text-center text-outline-bold opacity-30 select-none ${manrope.className}`}>SELECTED PROJECTS</h2>
        <motion.div initial={{ height: "0%" }} whileInView={{ height: "100%" }} transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1] }} className="absolute top-0 left-0 w-full overflow-hidden">
          <h2 className={`text-4xl md:text-8xl font-black tracking-tighter text-center text-black ${manrope.className}`}>SELECTED PROJECTS</h2>
        </motion.div>
      </div>
      <div className="flex items-center gap-4 mt-6">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className={`w-6 h-6 flex items-center justify-center ${theme.text}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </motion.div>
        <span className={`text-xs font-bold tracking-[0.3em] ${theme.text} uppercase opacity-80`}>Featured Works</span>
      </div>
    </div>
  );
}

const Blueprint = ({ children, type, color, show }: { children: React.ReactNode, type: "underline" | "box" | "circle" | "highlight" | "strike-through" | "crossed-off" | "bracket", color: string, show: boolean }) => (
  <RoughNotation type={type} color={color} show={show} animationDuration={1500} strokeWidth={2} padding={type === 'circle' ? [8, 10] : [2, 2]} iterations={2} multiline={true}>
    <span className={type === 'circle' ? "inline-block whitespace-nowrap" : "relative z-10"}>{children}</span>
  </RoughNotation>
)

const HeroSection = ({ theme, setCursorVariant, isMobile }: { theme: any, setCursorVariant: any, isMobile: boolean }) => {
  return (
    <section className="relative h-screen w-full flex flex-col justify-center items-center px-4 overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 5] }} dpr={isMobile ? [1, 1] : [1, 1.5]} gl={{ antialias: false, powerPreference: "high-performance" }}>
          <GeometricCore theme={theme} isMobile={isMobile} />
        </Canvas>
      </div>

      <div className="relative z-10 text-center w-full max-w-[90vw]">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[500px] h-[300px] bg-gradient-to-r from-orange-200/40 via-lime-200/40 to-violet-200/40 blur-[80px] md:blur-[120px] -z-10" />

        <div className="hero-fade"><h2 className="text-[10px] md:text-sm font-bold tracking-[0.4em] text-zinc-400 uppercase mb-4 md:mb-6">Portfolio · 2025</h2></div>

        <div className="overflow-hidden leading-[0.9] md:leading-[0.85]">
          <h1 className={`text-[13vw] md:text-[9rem] font-black tracking-tighter text-black ${manrope.className}`}>
            <div className="hero-glitch-text flex justify-center overflow-hidden"><span className="glitch-wrapper" data-text="MD MOSHIN">MD MOSHIN</span></div>
            <div className="hero-glitch-text flex justify-center overflow-hidden"><span className="glitch-wrapper" data-text="KHAN">KHAN</span></div>
          </h1>
        </div>

        <div className="hero-fade mt-8 md:mt-10 flex flex-col items-center justify-center">
          <p className="text-zinc-500 max-w-[90%] md:max-w-md text-xs md:text-base leading-relaxed font-medium">
            An engineering-focused <Blueprint type="highlight" color={theme.rough + "33"} show={true}>creative developer</Blueprint> building <Blueprint type="underline" color={theme.rough} show={true}>high-performance</Blueprint> digital architecture.
          </p>
          <div className="flex flex-col md:flex-row gap-4 mt-8 items-center w-full md:w-auto px-6 md:px-0">
            <Magnetic>
              <button
                onMouseEnter={() => setCursorVariant('hover')}
                onMouseLeave={() => setCursorVariant('default')}
                onClick={() => document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' })}
                className={`w-full md:w-auto px-8 py-4 bg-black text-white rounded-full font-bold text-xs uppercase tracking-widest ${theme.hover} hover:text-black transition-all active:scale-95`}
              >
                Explore Works
              </button>
            </Magnetic>
            <Magnetic>
              <a href="/resume.pdf" download="Md_Moshin_Khan_Resume" onMouseEnter={() => setCursorVariant('hover')} onMouseLeave={() => setCursorVariant('default')} className="w-full md:w-auto flex justify-center relative overflow-hidden px-8 py-4 border border-zinc-200 rounded-full font-bold text-xs uppercase tracking-widest text-zinc-500 hover:text-black hover:border-black transition-all bg-white group active:scale-95">
                <span className="relative z-10">Download CV</span>
                <div className="animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </a>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
};

function GeometricCore({ theme, isMobile }: { theme: any, isMobile: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  const colorMap: any = { "bg-orange-500": "#f97316", "bg-lime-400": "#a3e635", "bg-violet-500": "#8b5cf6", "bg-yellow-400": "#fbbf24" };

  useFrame((state) => { if (mesh.current) { mesh.current.rotation.x = state.clock.getElapsedTime() * 0.15; mesh.current.rotation.y = state.clock.getElapsedTime() * 0.2; } });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={mesh} scale={isMobile ? 1.5 : 2.2} position={[0, -0.2, 0]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color={colorMap[theme.accent] || "#a3e635"} wireframe wireframeLinewidth={isMobile ? 1 : 2} />
      </mesh>
      <Stars radius={100} depth={50} count={isMobile ? 500 : 5000} factor={4} saturation={0} fade speed={1} />
      <fog attach="fog" args={['#ffffff', 5, 25]} />
    </Float>
  );
}

function DynamicIsland({ message, visible }: { message: string, visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div initial={{ y: -100, scale: 0.8, opacity: 0 }} animate={{ y: 20, scale: 1, opacity: 1 }} exit={{ y: -100, scale: 0.8, opacity: 0 }} className="fixed top-0 left-1/2 -translate-x-1/2 z-[200] bg-black text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl min-w-[200px] justify-center mt-safe">
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
          <span className={`text-sm font-bold tracking-tight ${manrope.className}`}>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

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
  const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { const cmd = input.trim().toLowerCase(); const newLogs = [...logs, `> ${input}`]; if (cmd === 'exit') setActive(false); else if (cmd === 'help') newLogs.push("ls, whoami, contact, clear, exit"); else if (cmd === 'ls') PROJECTS.forEach(p => newLogs.push(`- ${p.title}`)); else newLogs.push("Command not found."); setLogs(newLogs); setInput(""); } };
  if (!active) return null;
  return (<div className={`fixed inset-0 z-[9999] bg-black/95 text-green-500 p-8 ${mono.className} overflow-hidden`}><div className="max-w-2xl mx-auto h-full flex flex-col"><div className="flex-1 overflow-y-auto space-y-1">{logs.map((l, i) => <div key={i}>{l}</div>)}<div className="flex"><span className="mr-2"></span><input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleCommand} className="bg-transparent outline-none flex-1" autoFocus /></div></div></div></div>);
};

const GravityArsenal = ({ theme }: { theme: any }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) return;
    if (!containerRef.current) return;
    const Engine = Matter.Engine, World = Matter.World, Bodies = Matter.Bodies, Mouse = Matter.Mouse, MouseConstraint = Matter.MouseConstraint, Runner = Matter.Runner;
    const engine = Engine.create(); const world = engine.world;
    const width = containerRef.current.clientWidth; const height = 600;
    const walls = [Bodies.rectangle(width / 2, height + 50, width, 100, { isStatic: true }), Bodies.rectangle(-50, height / 2, 100, height, { isStatic: true }), Bodies.rectangle(width + 50, height / 2, 100, height, { isStatic: true })];
    World.add(world, walls);
    const techBodies = TECH_ITEMS.map((_, i) => { const el = elementsRef.current[i]; if (!el) return null; return Bodies.rectangle(Math.random() * (width - 100) + 50, -Math.random() * 500 - 100, el.offsetWidth, el.offsetHeight, { chamfer: { radius: 20 }, restitution: 0.6 }); }).filter(b => b !== null) as Matter.Body[];
    World.add(world, techBodies);
    const mouse = Mouse.create(containerRef.current); mouse.element.removeEventListener("mousewheel", (mouse as any).mousewheel); mouse.element.removeEventListener("DOMMouseScroll", (mouse as any).mousewheel);
    const mouseConstraint = MouseConstraint.create(engine, { mouse: mouse, constraint: { stiffness: 0.2, render: { visible: false } } }); World.add(world, mouseConstraint);
    const runner = Runner.create(); Runner.run(runner, engine);
    const updateLoop = () => { techBodies.forEach((body, i) => { const el = elementsRef.current[i]; if (el) el.style.transform = `translate(${body.position.x - el.offsetWidth / 2}px, ${body.position.y - el.offsetHeight / 2}px) rotate(${body.angle}rad)`; }); requestAnimationFrame(updateLoop); }; updateLoop();
    return () => { Runner.stop(runner); Engine.clear(engine); World.clear(world, false); };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full min-h-[400px] md:h-[600px] bg-zinc-50 border-y border-zinc-200 overflow-hidden cursor-grab active:cursor-grabbing flex flex-wrap items-center justify-center gap-3 p-6 md:block touch-pan-y">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><h3 className={`text-[12vw] md:text-[10vw] font-black text-zinc-100 ${manrope.className} uppercase tracking-tighter opacity-60 md:opacity-100`}>Playground</h3></div>
      {TECH_ITEMS.map((item, i) => (
        <div key={i} ref={(el) => { elementsRef.current[i] = el }} className={`relative md:absolute md:top-0 md:left-0 px-4 py-2 md:px-6 md:py-3 bg-white border md:border-2 border-black rounded-full text-xs md:text-sm font-bold uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] select-none neon-chip ${theme.hover} transition-transform active:scale-95 md:active:scale-100`}>
          {item}
        </div>
      ))}
    </div>
  );
};

function InfiniteMarquee() {
  const firstText = useRef<HTMLParagraphElement>(null);
  const secondText = useRef<HTMLParagraphElement>(null);
  let xPercent = 0;
  useEffect(() => {
    const animate = () => { if (xPercent <= -100) xPercent = 0; gsap.set(firstText.current, { xPercent }); gsap.set(secondText.current, { xPercent }); xPercent -= 0.05; requestAnimationFrame(animate); };
    requestAnimationFrame(animate);
  }, []);
  return (<div className="relative flex overflow-hidden py-8 md:py-16 bg-black text-white border-t border-b border-zinc-800 z-20"><div className="relative whitespace-nowrap flex"><p ref={firstText} className={`text-[12vw] md:text-[8vw] font-bold uppercase tracking-tighter leading-none pr-12 ${manrope.className}`}>Available for Freelance • Full Stack Engineer • </p><p ref={secondText} className={`absolute left-full top-0 text-[12vw] md:text-[8vw] font-bold uppercase tracking-tighter leading-none pr-12 ${manrope.className}`}>Available for Freelance • Full Stack Engineer • </p></div></div>)
}

function Preloader({ onComplete, theme }: { onComplete: () => void, theme: any }) {
  const [count, setCount] = useState(0);
  const curtainRef = useRef(null);
  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev >= 100) { clearInterval(interval); return 100; }
        return prev + 1;
      });
    }, 15);

    if (count === 100) gsap.to(curtainRef.current, { y: "-100%", duration: 1.2, ease: "power4.inOut", delay: 0.2, onComplete: onComplete });
    return () => clearInterval(interval);
  }, [count, onComplete]);

  return (<div ref={curtainRef} className={`fixed inset-0 bg-black z-[10000] flex items-end justify-start p-6 md:p-20 ${theme.text}`}><div className="flex flex-col"><span className={`text-[20vw] md:text-[15vw] leading-[0.8] font-black tracking-tighter ${manrope.className}`}>{count}%</span><span className="text-xs uppercase tracking-widest mt-4 opacity-50">System Initializing...</span></div></div>);
}

function InteractiveGrid({ theme }: { theme: any }) {
  const mask = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.innerWidth < 768) return;
    if (!mask.current) return;
    const xTo = gsap.quickTo(mask.current, "x", { duration: 0.5, ease: "power2.out" });
    const yTo = gsap.quickTo(mask.current, "y", { duration: 0.5, ease: "power2.out" });
    const moveMask = (e: MouseEvent) => { xTo(e.clientX); yTo(e.clientY); };
    window.addEventListener("mousemove", moveMask); return () => window.removeEventListener("mousemove", moveMask);
  }, []);
  return (<div className="hidden md:block fixed inset-0 z-0 pointer-events-none"><div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:40px_40px]" /><div ref={mask} className={`absolute w-[600px] h-[600px] rounded-full ${theme.accent} blur-[100px] opacity-10 -translate-x-1/2 -translate-y-1/2 will-change-transform mix-blend-multiply`} /></div>);
}

// --- CURSOR ---
function CustomCursor({ variant }: { variant: string }) {
  const cursor = useRef<HTMLDivElement>(null);
  const follower = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.innerWidth < 768) return;
    if (!cursor.current || !follower.current) return;
    const xTo = gsap.quickTo(cursor.current, "x", { duration: 0.1, ease: "power3.out" });
    const yTo = gsap.quickTo(cursor.current, "y", { duration: 0.1, ease: "power3.out" });
    const xToFollow = gsap.quickTo(follower.current, "x", { duration: 0.6, ease: "power3.out" });
    const yToFollow = gsap.quickTo(follower.current, "y", { duration: 0.6, ease: "power3.out" });
    const move = (e: MouseEvent) => {
      xTo(e.clientX); yTo(e.clientY);
      xToFollow(e.clientX); yToFollow(e.clientY);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 768) return;
    if (!follower.current) return;
    if (variant === 'view') {
      gsap.to(follower.current, { scale: 5, backgroundColor: "#ffffff", opacity: 1, borderWidth: 0, mixBlendMode: 'difference', duration: 0.3 });
    } else if (variant === 'hover') {
      gsap.to(follower.current, { scale: 2, backgroundColor: "transparent", opacity: 0.5, borderWidth: 1, mixBlendMode: 'difference', duration: 0.3 });
    } else {
      gsap.to(follower.current, { scale: 1, backgroundColor: "transparent", opacity: 1, borderWidth: 2, mixBlendMode: 'difference', duration: 0.3 });
    }
  }, [variant]);

  return (
    <>
      <div ref={cursor} className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 mix-blend-difference hidden md:block" />
      <div ref={follower} className="fixed top-0 left-0 w-8 h-8 border-2 border-white rounded-full pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 mix-blend-difference hidden md:block transition-all ease-out flex items-center justify-center">
        <AnimatePresence>
          {variant === 'view' && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[3px] font-black text-black">VIEW</motion.span>}
        </AnimatePresence>
      </div>
    </>
  );
}

// --- CLICK RIPPLE ---
function ClickRipple() {
  useEffect(() => {
    if (window.innerWidth < 768) return;
    const handleClick = (e: MouseEvent) => {
      const ripple = document.createElement("div");
      ripple.className = "fixed rounded-full border border-black/20 z-[9997] pointer-events-none animate-ripple";
      ripple.style.left = `${e.clientX}px`;
      ripple.style.top = `${e.clientY}px`;
      ripple.style.width = "10px";
      ripple.style.height = "10px";
      ripple.style.transform = "translate(-50%, -50%)";
      document.body.appendChild(ripple);
      gsap.to(ripple, { width: 300, height: 300, opacity: 0, duration: 0.8, ease: "power2.out", onComplete: () => ripple.remove() });
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);
  return null;
}

function Magnetic({ children }: { children: ReactElement }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.innerWidth < 768) return;
    const element = ref.current; if (!element) return;
    const xTo = gsap.quickTo(element, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
    const yTo = gsap.quickTo(element, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });
    const handleMouseMove = (e: MouseEvent) => { const { height, width, left, top } = element.getBoundingClientRect(); xTo((e.clientX - (left + width / 2)) * 0.35); yTo((e.clientY - (top + height / 2)) * 0.35); };
    const handleMouseLeave = () => { xTo(0); yTo(0); };
    element.addEventListener("mousemove", handleMouseMove); element.addEventListener("mouseleave", handleMouseLeave);
    return () => { element.removeEventListener("mousemove", handleMouseMove); element.removeEventListener("mouseleave", handleMouseLeave); };
  }, []);
  return cloneElement(children as React.ReactElement<any>, { ref });
}

// --- INTELLIGENT ACTION LOGGER ---
function ActionLogger({ log }: { log: string }) {
  return (
    <div className="fixed bottom-6 left-6 z-50 hidden md:flex items-center gap-3 mix-blend-difference pointer-events-none">
      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
      <span className={`text-[10px] font-mono font-bold uppercase tracking-widest text-white ${mono.className}`}>{log}</span>
    </div>
  )
}

function StackingCard({ project, index, range, targetScale, progress, setIndex, onExpand, theme, isMobile, setCursorVariant, setLog }: any) {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({ target: container, offset: ['start end', 'start start'] });
  const scale = useTransform(progress, range, [1, targetScale]);
  const blur = useTransform(progress, range, [0, 4]);
  const y = useTransform(scrollYProgress, [0, 1], isMobile ? [-20, 20] : [-50, 50]);

  const cardRef = useRef<HTMLDivElement>(null);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  return (
    <div ref={container} className="h-screen flex items-center justify-center sticky top-0">
      <motion.div
        ref={cardRef} onMouseMove={handleMouseMove} style={{ scale, top: `calc(-5vh + ${index * 25}px)`, filter: `blur(${blur}px)` }}
        className="relative flex flex-col md:flex-row h-[70vh] md:h-[500px] w-full max-w-6xl rounded-2xl md:rounded-3xl p-6 md:p-12 border border-black/10 bg-white shadow-2xl origin-top overflow-hidden group/card"
        onMouseEnter={() => { setIndex(index); setLog(`>> DETECTED: ${project.title.toUpperCase()}`); }}
        onMouseLeave={() => setLog(">> SYSTEM: IDLE")}
      >
        <div className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover/card:opacity-100 hidden md:block" style={{ background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(0,0,0,0.06), transparent 40%)` }} />

        <div className="flex flex-col md:flex-row h-full gap-6 md:gap-10 w-full relative z-10">
          <div className="w-full md:w-[40%] flex flex-col justify-between z-10 order-2 md:order-1">
            <div>
              <div className="flex items-center gap-4 mb-4 md:mb-8">
                <span className={`text-sm font-bold ${theme.text} ${inter.className}`}>0{index + 1}</span>
                <span className="px-3 py-1 border border-zinc-200 rounded-full text-[10px] font-bold uppercase tracking-widest text-zinc-400"><HyperText text={project.category} /></span>
              </div>
              <h2 className={`text-3xl md:text-5xl font-bold leading-tight mb-4 md:mb-6 ${manrope.className}`}>{project.title}</h2>
              <p className="text-zinc-500 text-sm leading-relaxed line-clamp-3 md:line-clamp-none">{project.desc}</p>
            </div>
            <div className="flex flex-col gap-6 mt-6 md:mt-0">
              <div className="flex gap-2 flex-wrap">{project.tags.map((tag: string) => (<span key={tag} className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full">{tag}</span>))}</div>
              <Magnetic><a href={project.link} target="_blank" onMouseEnter={() => setCursorVariant('hover')} onMouseLeave={() => setCursorVariant('default')} className={`inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest ${theme.text} transition-colors cursor-pointer w-fit hover:opacity-70 px-4 py-2 md:px-0 md:py-0 bg-zinc-50 md:bg-transparent rounded-lg md:rounded-none`}>Live Site <span className="text-lg">↗</span></a></Magnetic>
            </div>
          </div>
          <div
            className="relative w-full md:w-[60%] h-[200px] md:h-full rounded-xl md:rounded-2xl overflow-hidden bg-zinc-100 group cursor-none order-1 md:order-2"
            onClick={() => onExpand(project)}
            onMouseEnter={() => setCursorVariant('view')}
            onMouseLeave={() => setCursorVariant('default')}
          >
            <Tilt glareEnable={!isMobile} tiltEnable={!isMobile} glareMaxOpacity={0.4} scale={1.02} perspective={800} transitionSpeed={1500} tiltMaxAngleX={5} tiltMaxAngleY={5} className="w-full h-full">
              <motion.div layoutId={`image-${project.id}`} style={{ y }} className="w-full h-[120%] relative -top-[10%]">
                <div className="w-full h-full group-hover:scale-105 transition-transform duration-700">
                  <img src={project.img} alt={project.title} className="object-cover w-full h-full" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <div className={`absolute inset-0 ${project.color} -z-10`} />
                </div>
              </motion.div>
            </Tilt>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function CommandCenter({ theme }: { theme: any }) {
  const [sessionID, setSessionID] = useState("INIT");
  const [ping, setPing] = useState(0);
  const [battery, setBattery] = useState<{ level: number, charging: boolean } | null>(null);
  const [connection, setConnection] = useState<string>("4G");

  useEffect(() => {
    setSessionID(Math.random().toString(36).substring(2, 8).toUpperCase());
    const interval = setInterval(() => { setPing(Math.floor(Math.random() * 15) + 20); }, 2000);

    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((batt: any) => {
        const updateBatt = () => { setBattery({ level: Math.round(batt.level * 100), charging: batt.charging }); };
        updateBatt();
        batt.addEventListener('levelchange', updateBatt);
        batt.addEventListener('chargingchange', updateBatt);
      });
    }
    if (typeof navigator !== 'undefined' && (navigator as any).connection) {
      setConnection((navigator as any).connection.effectiveType?.toUpperCase() || "WIFI");
    }
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-3 p-4 border border-white/10 backdrop-blur-md rounded-xl w-full md:w-[300px] bg-black/40 hover:bg-black/60 transition-all group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${theme.accent} animate-pulse`} />
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400">SYS.Telemetry</span>
        </div>
        <span className={`text-[10px] font-mono ${theme.text} flex items-center gap-2`}>
          {battery ? (<><span>{battery.level}%</span>{battery.charging && <span className="animate-pulse">⚡</span>}</>) : (<span>EXT.PWR</span>)}
        </span>
      </div>

      <div className="flex items-end justify-between h-8 gap-1">
        {Array.from({ length: 24 }).map((_, i) => (
          <motion.div key={i} animate={{ height: [Math.random() * 40 + 20 + "%", Math.random() * 90 + 10 + "%"] }} transition={{ duration: 0.4, repeat: Infinity, repeatType: "mirror", delay: i * 0.03 }} className={`w-1 rounded-sm ${theme.accent} opacity-40`} />
        ))}
      </div>

      <div className="flex justify-between items-center text-[9px] text-zinc-600 font-mono border-t border-white/5 pt-2 mt-1">
        <span className="uppercase">NET: {connection} / {ping}ms</span>
        <span>ID: <span className="text-zinc-400 group-hover:text-white transition-colors">{sessionID}</span></span>
      </div>
    </div>
  )
}

function Footer({ theme, onCopy }: { theme: any, onCopy: () => void }) {
  return (
    <div className="fixed bottom-0 h-[85vh] md:h-[80vh] w-full bg-black text-white z-0 flex flex-col justify-between p-6 md:p-24 pb-20 md:pb-safe" style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}>
      <div className="flex flex-col md:flex-row justify-between items-start w-full mt-10 md:mt-0">
        <h2 className={`text-[20vw] md:text-[12vw] leading-[0.8] font-black tracking-tighter ${manrope.className}`}>LET'S<br /><span className={theme.text}>TALK</span></h2>
        <div className="flex md:flex-col gap-6 md:gap-4 text-left md:text-right mt-8 md:mt-0 w-full md:w-auto">
          <a href="https://www.linkedin.com/in/md-moshin-khan-65510a24b" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white uppercase tracking-widest text-sm transition-colors border border-white/10 p-4 md:border-0 md:p-0 rounded-lg text-center md:text-right w-full md:w-auto">LinkedIn ↗</a>
          <a href="https://github.com/mkhan0012" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white uppercase tracking-widest text-sm transition-colors border border-white/10 p-4 md:border-0 md:p-0 rounded-lg text-center md:text-right w-full md:w-auto">GitHub ↗</a>
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-end gap-10 w-full mt-10 md:mt-0">
        <div className="flex flex-col gap-6 w-full md:w-auto">
          <div>
            <p className="text-zinc-500 uppercase tracking-widest text-xs mb-2">Got a project?</p>
            <Magnetic><button onClick={onCopy} className={`text-xl md:text-4xl font-bold ${theme.text} transition-colors border-b border-zinc-800 pb-2 break-all md:break-normal active:opacity-60`}>moshink0786@gmail.com</button></Magnetic>
          </div>
          <CommandCenter theme={theme} />
        </div>
        <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest w-full md:w-auto text-center md:text-right pb-4 md:pb-0">© 2025 Md Moshin Khan</p>
      </div>
    </div>
  )
}

function Header({ theme }: { theme: any }) {
  const [time, setTime] = useState("");
  useEffect(() => { const timer = setInterval(() => setTime(format(new Date(), "HH:mm:ss 'IST'")), 1000); return () => clearInterval(timer); }, []);
  return (
    <header className="fixed top-0 left-0 w-full p-4 md:p-10 flex justify-between items-start z-50 pointer-events-none text-black bg-white/80 backdrop-blur-lg border-b border-white/20 transition-all duration-300">
      <div className="flex flex-col items-start pointer-events-auto">
        <h1 className={`text-lg md:text-xl font-bold tracking-tight ${manrope.className} text-black`}>MOSHIN.DEV</h1>
        <span className="text-[10px] md:text-xs text-zinc-500 font-medium tracking-widest mt-1"><HyperText text="FULL STACK ENGINEER" /></span>
      </div>

      <div className="flex flex-col items-end text-xs font-medium tracking-widest text-zinc-500 uppercase pointer-events-auto">
        <div className="flex items-center gap-4 mb-2 text-zinc-400">
          <a href="https://github.com/mkhan0012" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors hidden md:block">GitHub</a>
          <a href="https://www.linkedin.com/in/md-moshin-khan-65510a24b" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors hidden md:block">LinkedIn</a>
        </div>
        <div className="hidden md:flex flex-col items-end">
          <span className="flex items-center gap-2">
            <span className={`relative w-2 h-2 ${theme.accent} rounded-full sonar-effect`} />
            Available for Work
          </span>
          <span className="mt-1">{time}</span><span>India</span>
        </div>
        <div className="md:hidden flex items-center gap-2">
          <span className={`relative w-2 h-2 ${theme.accent} rounded-full sonar-effect`} />
        </div>
      </div>
    </header>
  );
}

const SplitText = ({ children, className }: { children: string, className?: string }) => {
  return <div className={className}><span className="sr-only">{children}</span><span aria-hidden="true">{children.split("").map((char, index) => (<span key={index} className="inline-block overflow-hidden align-top"><motion.span className="inline-block" initial={{ y: "100%" }} whileInView={{ y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.03, ease: [0.33, 1, 0.68, 1] }}>{char === " " ? "\u00A0" : char}</motion.span></span>))}</span></div>;
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
  const [isMobile, setIsMobile] = useState(false);

  const [cursorVariant, setCursorVariant] = useState("default");
  const [log, setLog] = useState(">> SYSTEM: IDLE");

  const { scrollYProgress, scrollY } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) setTheme(THEMES.morning);
    else if (hour >= 12 && hour < 18) setTheme(THEMES.afternoon);
    else if (hour >= 18 && hour < 22) setTheme(THEMES.night);
    else setTheme(THEMES.hazard);
  }, []);

  // --- SMOOTH SCROLL (LENIS) OPTIMIZATION ---
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,           // Increased from 0.08 for "snappier" feeling (less floaty/laggy)
      duration: 1.5,       // Smooth glide duration
      // smoothTouch: true is DEPRECATED and removed.
      touchMultiplier: 2,  // Faster response on mobile touch
      wheelMultiplier: 1,  // Standard speed on mouse wheel
    });

    function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf); return () => lenis.destroy();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const ctx = gsap.context(() => {
        gsap.from(".hero-glitch-text", { y: 100, opacity: 0, duration: 1.5, stagger: 0.2, ease: "power4.out", delay: 0.2 });
        gsap.from(".hero-fade", { y: 20, opacity: 0, duration: 1, ease: "power2.out", delay: 1 });
      }, container);
      setTimeout(() => setShowBlueprints(true), 2000);
      return () => ctx.revert();
    }
  }, [isLoading]);

  const handleCopy = () => {
    navigator.clipboard.writeText("moshink0786@gmail.com"); setShowNotification(true);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.9 }, colors: ['#a3e635', '#f97316', '#8b5cf6'] }); setTimeout(() => setShowNotification(false), 2500);
  };

  return (
    <main ref={container} className={`bg-white text-black min-h-screen selection:${theme.accent} selection:text-black ${inter.className} relative transition-colors duration-1000 cursor-auto md:cursor-none`}>
      <GlobalStyles />
      <ClickRipple />
      <ActionLogger log={log} />

      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-lime-400 to-violet-500 origin-left z-[100]" style={{ scaleX }} />
      <Preloader onComplete={() => setIsLoading(false)} theme={theme} />

      <CustomCursor variant={cursorVariant} />

      <Header theme={theme} />
      <HackerMode />
      <DynamicIsland message="Email Copied!" visible={showNotification} />
      <InteractiveGrid theme={theme} />
      <GrainOverlay />

      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProject(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" />
            <motion.div layoutId={`image-${selectedProject.id}`} className="relative w-full max-w-4xl h-[70vh] md:h-[80vh] bg-white rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col">
              <div className="relative h-2/3 md:h-full">
                <img src={selectedProject.img} alt={selectedProject.title} className="object-cover w-full h-full" />
                <div className={`absolute inset-0 ${selectedProject.color} mix-blend-multiply opacity-20`} />
              </div>
              <button onClick={() => setSelectedProject(null)} className={`absolute top-4 right-4 bg-white text-black rounded-full px-4 py-2 font-bold uppercase tracking-widest text-xs ${theme.hover}`}>Close</button>
              <div className="h-1/3 md:absolute md:bottom-0 md:left-0 w-full p-6 md:p-8 bg-white md:bg-gradient-to-t md:from-black/80 md:to-transparent text-black md:text-white flex flex-col justify-center">
                <h2 className={`text-2xl md:text-4xl font-bold ${manrope.className}`}>{selectedProject.title}</h2>
                <p className="mt-2 text-zinc-500 md:text-zinc-300 text-sm md:text-base">{selectedProject.desc}</p>
                <div className="mt-4 flex gap-2">
                  {selectedProject.tags.slice(0, 3).map((t: string) => <span key={t} className="text-[10px] border border-current px-2 py-1 rounded-full opacity-60">{t}</span>)}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="relative z-10 bg-white mb-[85vh] md:mb-[80vh] shadow-[0px_50px_100px_rgba(0,0,0,0.5)]">
        <HeroSection theme={theme} setCursorVariant={setCursorVariant} isMobile={isMobile} />

        <InfiniteMarquee />
        <section id="work" className="relative pt-20 md:pt-32 pb-32 md:pb-64 bg-zinc-50/50">
          <div className="max-w-7xl mx-auto px-4 md:px-12 mb-16 md:mb-24"><CreativeProjectHeader theme={theme} /></div>
          <div className="flex flex-col gap-0 md:gap-0">
            {PROJECTS.map((project, i) => { const targetScale = 1 - ((PROJECTS.length - i) * 0.05); return <StackingCard key={i} project={project} index={i} range={[i * 0.25, 1]} targetScale={targetScale} progress={scrollYProgress} setIndex={setActiveProjectIndex} onExpand={setSelectedProject} theme={theme} isMobile={isMobile} setCursorVariant={setCursorVariant} setLog={setLog} /> })}
          </div>
        </section>
        <section className="relative bg-white py-20 md:py-32 border-t border-zinc-100 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 md:px-12 mb-10 md:mb-16"><RoughNotationGroup show={true}><SplitText className={`text-3xl md:text-4xl font-bold tracking-tight mb-6 text-black ${manrope.className}`}>Technical Arsenal</SplitText><p className="text-xs md:text-sm text-zinc-500 uppercase tracking-widest font-bold">Core Competencies ({isMobile ? "Scroll to view" : <Blueprint type="circle" color={theme.rough} show={true}>Drag to throw</Blueprint>})</p></RoughNotationGroup></div>
          <GravityArsenal theme={theme} />
        </section>
      </div>
      <Footer theme={theme} onCopy={handleCopy} />
    </main>
  );
}