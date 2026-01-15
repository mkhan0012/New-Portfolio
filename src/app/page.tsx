"use client";

import { useRef, useEffect, useState, ReactElement, cloneElement } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import Lenis from "@studio-freight/lenis";
import { Inter, Manrope } from "next/font/google";
import * as THREE from "three";
import emailjs from '@emailjs/browser';
import { format } from "date-fns";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// --- REGISTER PLUGINS ---
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// --- FONTS ---
const inter = Inter({ subsets: ["latin"] });
const manrope = Manrope({ subsets: ["latin"] });

// --- DATA ---
const PROJECTS = [
  { 
    id: "01", title: "CryptoPlace", category: "Fintech Dashboard", 
    desc: "Real-time decentralized asset tracking with sub-second latency.", 
    link: "https://crypto-place-brown.vercel.app/",
    color: "bg-blue-600",
    img: "/crypto-preview.png",
    tags: ["Next.js", "WebSockets", "Tailwind"]
  },
  { 
    id: "02", title: "TruthIs", category: "Interactive Art", 
    desc: "A WebGL-powered philosophical journey into subjective reality.", 
    link: "https://truthis-optional.vercel.app/",
    color: "bg-purple-600",
    img: "/truth.png",
    tags: ["Three.js", "GLSL", "React"]
  },
  { 
    id: "03", title: "Arguely", category: "Social Platform", 
    desc: "Structured debate engine using graph theory for consensus.", 
    link: "https://debate-again.vercel.app/",
    color: "bg-emerald-600",
    img: "/Arguely.png",
    tags: ["Neo4j", "Next.js", "Graph"]
  },
  { 
    id: "04", title: "FocusBits", category: "Productivity Tool", 
    desc: "Binaural beat generator with flow-state pomodoro timers.", 
    link: "https://timer-rho-khaki.vercel.app/",
    color: "bg-orange-600",
    img: "/timer.png",
    tags: ["Web Audio API", "PWA"]
  },
  { 
    id: "05", title: "FW-Seven", category: "System", 
    desc: "Industrial aesthetics component library for Next.js.", 
    link: "https://framework-seven-steel.vercel.app/",
    color: "bg-zinc-800",
    img: "/framework.png",
    tags: ["Storybook", "CSS Modules"]
  },
  { 
    id: "06", title: "MindScribe AI", category: "AI Productivity", 
    desc: "Intelligent note-taking application with AI-powered auto-completion.", 
    link: "https://notes-chi-olive.vercel.app",
    color: "bg-indigo-600",
    img: "/notes.png",
    tags: ["Next.js", "OpenAI", "Tailwind"]
  }
];

const TECH_CATEGORIES = [
  { name: "Frontend", tools: ["Next.js", "React", "TypeScript", "Tailwind", "Framer Motion"] },
  { name: "Backend", tools: ["Node.js", "PostgreSQL", "Supabase", "Prisma", "Redis"] },
  { name: "Design & 3D", tools: ["Figma", "Spline", "Three.js", "Blender", "After Effects"] }
];

// --- 1. NEW: INFINITE MARQUEE ---
function InfiniteMarquee() {
  const firstText = useRef<HTMLParagraphElement>(null);
  const secondText = useRef<HTMLParagraphElement>(null);
  const slider = useRef<HTMLDivElement>(null);
  let xPercent = 0;
  let direction = -1;

  useEffect(() => {
    requestAnimationFrame(animate);
  }, []);

  const animate = () => {
    if (xPercent <= -100) xPercent = 0;
    if (xPercent > 0) xPercent = -100;
    
    gsap.set(firstText.current, { xPercent: xPercent });
    gsap.set(secondText.current, { xPercent: xPercent });
    xPercent += 0.05 * direction; // Speed of scroll
    requestAnimationFrame(animate);
  }

  return (
    <div className="relative flex overflow-hidden py-16 bg-black text-white border-t border-b border-zinc-800 z-20">
      <div ref={slider} className="relative whitespace-nowrap flex">
        <p ref={firstText} className={`text-[8vw] font-bold uppercase tracking-tighter leading-none pr-12 ${manrope.className}`}>
          Available for Freelance • Full Stack Engineer • 
        </p>
        <p ref={secondText} className={`absolute left-full top-0 text-[8vw] font-bold uppercase tracking-tighter leading-none pr-12 ${manrope.className}`}>
          Available for Freelance • Full Stack Engineer • 
        </p>
      </div>
    </div>
  )
}

// --- 2. PRELOADER ---
function Preloader({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(0);
  const curtainRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 20);

    if (count === 100) {
      gsap.to(curtainRef.current, {
        y: "-100%",
        duration: 1.2,
        ease: "power4.inOut",
        delay: 0.5,
        onComplete: onComplete
      });
    }
    return () => clearInterval(interval);
  }, [count, onComplete]);

  return (
    <div ref={curtainRef} className="fixed inset-0 bg-black z-[10000] flex items-end justify-start p-10 md:p-20 text-[#a3e635]">
      <div className="flex flex-col">
        <span className={`text-[15vw] leading-[0.8] font-black tracking-tighter ${manrope.className}`}>
          {count}%
        </span>
        <span className="text-xs uppercase tracking-widest mt-4 opacity-50">System Initializing...</span>
      </div>
    </div>
  );
}

// --- 3. INTERACTIVE GRID ---
function InteractiveGrid() {
  const mask = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const moveMask = (e: MouseEvent) => {
      if (!mask.current) return;
      gsap.to(mask.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.5,
        ease: "power2.out" 
      });
    };
    window.addEventListener("mousemove", moveMask);
    return () => window.removeEventListener("mousemove", moveMask);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div ref={mask} className="absolute w-[600px] h-[600px] rounded-full bg-[#a3e635] blur-[100px] opacity-10 -translate-x-1/2 -translate-y-1/2 will-change-transform mix-blend-multiply" />
    </div>
  );
}

// --- 4. CUSTOM CURSOR ---
function CustomCursor() {
  const cursor = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const move = (e: MouseEvent) => { 
      if(cursor.current) {
        gsap.to(cursor.current, { x: e.clientX, y: e.clientY, duration: 0.1, ease: "power2.out" });
      }
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);
  return <div ref={cursor} className="fixed top-0 left-0 w-6 h-6 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 bg-white mix-blend-difference hidden md:block" />;
}

// --- 5. MAGNETIC BUTTON ---
function Magnetic({ children }: { children: ReactElement }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const xTo = gsap.quickTo(element, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
    const yTo = gsap.quickTo(element, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { height, width, left, top } = element.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);
      xTo(x * 0.35); yTo(y * 0.35);
    };
    const handleMouseLeave = () => { xTo(0); yTo(0); };
    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);
  return cloneElement(children as React.ReactElement<any>, { ref });
}

// --- 6. 3D COMPONENT ---
function GeometricCore() {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.getElapsedTime() * 0.15;
      mesh.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
  });
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={mesh} scale={2.2}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color="#a3e635" wireframe wireframeLinewidth={2} />
      </mesh>
    </Float>
  );
}

// --- 7. STACKING CARD ---
function StackingCard({ project, index, range, targetScale, progress, setIndex }: any) {
  const container = useRef(null);
  const scale = useTransform(progress, range, [1, targetScale]);
  const blur = useTransform(progress, range, [0, 4]);
  
  return (
    <div ref={container} className="h-screen flex items-center justify-center sticky top-0">
      <motion.div 
        style={{ scale, top: `calc(-5vh + ${index * 25}px)`, filter: `blur(${blur}px)` }} 
        className="relative flex flex-col md:flex-row h-[500px] w-full max-w-6xl rounded-3xl p-8 md:p-12 border border-black/10 bg-white shadow-2xl origin-top overflow-hidden"
        onMouseEnter={() => setIndex(index)}
      >
        <div className="flex flex-col md:flex-row h-full gap-10 w-full">
          <div className="w-full md:w-[40%] flex flex-col justify-between z-10">
             <div>
               <div className="flex items-center gap-4 mb-8">
                  <span className={`text-sm font-bold text-lime-600 ${inter.className}`}>0{index + 1}</span>
                  <span className="px-3 py-1 border border-zinc-200 rounded-full text-[10px] font-bold uppercase tracking-widest text-zinc-400">{project.category}</span>
               </div>
               <h2 className={`text-4xl md:text-5xl font-bold leading-tight mb-6 ${manrope.className}`}>{project.title}</h2>
               <p className="text-zinc-500 text-sm leading-relaxed">{project.desc}</p>
             </div>
             <div className="flex flex-col gap-6">
                <div className="flex gap-2 flex-wrap">
                  {project.tags.map((tag: string) => (
                    <span key={tag} className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
                <Magnetic>
                    <a href={project.link} target="_blank" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-lime-600 transition-colors cursor-pointer w-fit">
                    Live Site <span className="text-lg">↗</span>
                    </a>
                </Magnetic>
             </div>
          </div>
          <div className="relative w-full md:w-[60%] h-full rounded-2xl overflow-hidden bg-zinc-100 group">
             <motion.div className="w-full h-full relative">
                <div className="w-full h-full group-hover:scale-105 transition-transform duration-700">
                    <img src={project.img} alt={project.title} className="object-cover w-full h-full" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <div className={`absolute inset-0 ${project.color} -z-10`} />
                </div>
             </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// --- 8. FOOTER ---
function Footer() {
  return (
    <div className="fixed bottom-0 h-[80vh] w-full bg-black text-white z-0 flex flex-col justify-between p-12 md:p-24" style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}>
      <div className="flex justify-between items-start">
        <h2 className={`text-[12vw] leading-[0.8] font-black tracking-tighter ${manrope.className}`}>LET'S<br/><span className="text-lime-400">TALK</span></h2>
        <div className="hidden md:flex flex-col gap-4 text-right">
           <a href="https://www.linkedin.com/in/md-moshin-khan-65510a24b" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white uppercase tracking-widest text-sm transition-colors">LinkedIn ↗</a>
           <a href="https://github.com/mkhan0012" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white uppercase tracking-widest text-sm transition-colors">GitHub ↗</a>
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-end gap-10">
         <div className="flex flex-col gap-4">
            <p className="text-zinc-500 uppercase tracking-widest text-xs">Got a project?</p>
            <Magnetic><a href="mailto:hello@moshin.dev" className="text-2xl md:text-4xl font-bold hover:text-lime-400 transition-colors border-b border-zinc-800 pb-2">hello@moshin.dev</a></Magnetic>
         </div>
         <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">© 2026 Md Moshin Khan</p>
      </div>
    </div>
  )
}

// --- 9. HEADER & UTILS ---
function Header() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const timer = setInterval(() => setTime(format(new Date(), "HH:mm:ss 'IST'")), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <header className="fixed top-0 left-0 w-full p-6 md:p-10 flex justify-between items-start z-50 pointer-events-none text-black mix-blend-difference">
      <div className="flex flex-col items-start pointer-events-auto">
        <h1 className={`text-xl font-bold tracking-tight ${manrope.className} text-white md:text-black md:mix-blend-normal`}>MOSHIN.DEV</h1>
        <span className="text-xs text-zinc-500 font-medium tracking-widest mt-1">FULL STACK ENGINEER</span>
      </div>
      <div className="hidden md:flex flex-col items-end text-xs font-medium tracking-widest text-zinc-500 uppercase">
        <span className="flex items-center gap-2"><span className="w-2 h-2 bg-lime-400 rounded-full animate-pulse"/> Available for Work</span>
        <span className="mt-1">{time}</span><span>Rajgangpur, India</span>
      </div>
    </header>
  );
}

// --- 10. NEW: GLOW CARD FOR TECH STACK ---
function GlowCard({ title, tools }: { title: string, tools: string[] }) {
  return (
    <div className="group relative border border-zinc-200 bg-white p-8 hover:border-lime-400 transition-colors duration-500">
      <h3 className="text-lg font-bold border-b border-black/10 pb-4 mb-6 text-black">{title}</h3>
      <div className="flex flex-wrap gap-x-8 gap-y-4">
        {tools.map((tool) => (
          <div key={tool} className="flex items-center gap-3 group/item cursor-default">
            <div className="w-1.5 h-1.5 bg-zinc-300 rounded-full group-hover/item:bg-lime-400 transition-colors" />
            <span className="text-zinc-600 font-medium group-hover/item:text-black transition-colors">{tool}</span>
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-lime-400/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  )
}

// --- MAIN PAGE ---
export default function Home() {
  const container = useRef<HTMLDivElement>(null);
  const [activeProjectIndex, setActiveProjectIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08 });
    function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end']
  });

  const splitText = (text: string) => text.split("").map((char, i) => (
    <span key={i} className="hero-char inline-block will-change-transform">{char === " " ? "\u00A0" : char}</span>
  ));

  useEffect(() => {
    if (!isLoading) {
      const ctx = gsap.context(() => {
        gsap.from(".hero-char", { y: 150, opacity: 0, duration: 1.5, stagger: 0.05, ease: "power4.out", delay: 0.2 });
        gsap.from(".hero-fade", { y: 20, opacity: 0, duration: 1, ease: "power2.out", delay: 1 });
      }, container);
      return () => ctx.revert();
    }
  }, [isLoading]);

  return (
    <main ref={container} className={`bg-white text-black min-h-screen selection:bg-lime-400 selection:text-black ${inter.className} relative`}>
      <Preloader onComplete={() => setIsLoading(false)} />
      <CustomCursor />
      <Header />
      <InteractiveGrid />
      
      {/* Content Wrapper */}
      <div className="relative z-10 bg-white mb-[80vh] shadow-[0px_50px_100px_rgba(0,0,0,0.5)]">
        
        {/* HERO */}
        <section className="relative h-screen w-full flex flex-col justify-center items-center px-4 overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
            <Canvas camera={{ position: [0, 0, 5] }} dpr={[1, 2]}><GeometricCore /></Canvas>
          </div>
          <div className="relative z-10 text-center">
            <div className="hero-fade"><h2 className="text-xs md:text-sm font-bold tracking-[0.4em] text-zinc-400 uppercase mb-6">Portfolio &middot; 2026</h2></div>
            <div className="overflow-hidden leading-[0.85]"><h1 className={`text-[13vw] md:text-[9rem] font-black tracking-tighter text-black ${manrope.className}`}><div className="flex justify-center overflow-hidden">{splitText("MD MOSHIN")}</div><div className="flex justify-center overflow-hidden">{splitText("KHAN")}</div></h1></div>
            <div className="hero-fade mt-10 flex flex-col items-center justify-center">
              <p className="text-zinc-500 max-w-md text-sm md:text-base leading-relaxed font-medium">An engineering-focused creative developer building high-performance digital architecture.</p>
              <Magnetic>
                <button onClick={() => document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' })} className="mt-8 px-8 py-4 bg-black text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-lime-400 hover:text-black transition-colors">Explore Works</button>
              </Magnetic>
            </div>
          </div>
        </section>

        {/* INFINITE MARQUEE */}
        <InfiniteMarquee />

        {/* STACKING CARDS */}
        <section id="work" className="relative pt-32 pb-64 bg-zinc-50/50">
          <div className="max-w-7xl mx-auto px-6 md:px-12 mb-24">
             <h2 className={`text-5xl md:text-8xl font-black tracking-tighter mb-6 text-black ${manrope.className}`}>Selected<br/>Projects</h2>
             <div className="w-24 h-2 bg-lime-400" />
          </div>
          {PROJECTS.map((project, i) => {
            const targetScale = 1 - ( (PROJECTS.length - i) * 0.05 );
            return (
              <StackingCard key={i} project={project} index={i} range={[i * 0.25, 1]} targetScale={targetScale} progress={scrollYProgress} setIndex={setActiveProjectIndex} />
            )
          })}
        </section>

        {/* TECH STACK */}
        <section className="relative bg-white py-32 border-t border-zinc-100">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="flex flex-col md:flex-row gap-20">
              <div className="md:w-1/3"><h2 className={`text-4xl font-bold tracking-tight mb-6 text-black ${manrope.className}`}>Technical<br/>Arsenal</h2><p className="text-sm text-zinc-500 uppercase tracking-widest font-bold">Core Competencies</p></div>
              <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-0">
                {TECH_CATEGORIES.map((cat, i) => (
                  <GlowCard key={i} title={cat.name} tools={cat.tools} />
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>

      <Footer />
    </main>
  );
}