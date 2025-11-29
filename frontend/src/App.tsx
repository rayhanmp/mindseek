import { useState, useEffect, useRef } from 'react';
import {
  motion,
  useTransform,
  useMotionValue,
  useSpring,
  useMotionTemplate,
  AnimatePresence,
  useInView
} from 'framer-motion';
import {
  Brain, Network, ShieldCheck, Activity, ChevronRight,
  Share2, Globe, Fingerprint, Command, Server, Quote
} from 'lucide-react';

// --- 1. VISUAL UTILITIES ---

// Text Decryption Effect
const DecryptText = ({ text, className = "", speed = 30 }: { text: string; className?: string; speed?: number }) => {
  const [displayText, setDisplayText] = useState(text);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";

  const scramble = () => {
    let iterations = 0;
    const interval = setInterval(() => {
      setDisplayText(text
        .split("")
        .map((_letter, index) => {
          if (index < iterations) return text[index];
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("")
      );
      if (iterations >= text.length) clearInterval(interval);
      iterations += 1 / 3;
    }, speed);
  };

  return (
    <span onMouseEnter={scramble} className={`cursor-default inline-block ${className}`}>
      {displayText}
    </span>
  );
};

// Magnetic Button
const MagneticButton = ({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xSpring = useSpring(x, { stiffness: 150, damping: 15 });
  const ySpring = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    x.set((e.clientX - (left + width / 2)) * 0.35);
    y.set((e.clientY - (top + height / 2)) * 0.35);
  };

  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.button
      ref={ref}
      style={{ x: xSpring, y: ySpring }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.button>
  );
};

// 3D Tilt Container for Hero
const TiltCard = ({ children }: { children: React.ReactNode }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);

  function handleMouse(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left - rect.width / 2);
    y.set(event.clientY - rect.top - rect.height / 2);
  }

  return (
    <motion.div
      style={{ perspective: 1000 }}
      onMouseMove={handleMouse}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      className="w-full h-full flex items-center justify-center"
    >
      <motion.div
        style={{ rotateX, rotateY }}
        className="w-full h-full relative transform-gpu transition-all duration-200 ease-out"
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

// Spotlight Card (Bento Grid Items)
const SpotlightCard = ({ children, className = "", spotlightColor = "rgba(16, 185, 129, 0.15)" }: { children: React.ReactNode; className?: string; spotlightColor?: string }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent<HTMLDivElement>) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={`group relative border border-white/5 bg-[#0A0A0A] overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              500px circle at ${mouseX}px ${mouseY}px,
              ${spotlightColor},
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full z-10">{children}</div>
    </div>
  );
};

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const AnimatedCounter = ({ value, suffix = "", decimals = 0 }: { value: number; suffix?: string; decimals?: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { damping: 30, stiffness: 100 });
  const displayText = useTransform(springValue, (latest) => `${latest.toFixed(decimals)}${suffix}`);

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  return <motion.span ref={ref}>{displayText}</motion.span>;
};

// --- 2. COMPLEX ANIMATIONS ---

// Isometric Data Stack
const IsometricStack = () => {
  return (
    <div className="relative w-full h-60 flex items-center justify-center scale-75 md:scale-100" style={{ perspective: '1200px' }}>
       <div
          className="relative w-48 h-48 group cursor-pointer"
          style={{ transform: 'rotateX(55deg) rotateZ(-45deg)', transformStyle: 'preserve-3d' }}
       >
          {/* Layer 1: Ingestion (Bottom) */}
          <motion.div
            className="absolute inset-0 bg-[#0f0f0f] border border-white/10 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden"
            style={{ transform: 'translateZ(0px)' }}
            whileHover={{ translateZ: -40 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
             <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,#10b981_1px,transparent_1px),linear-gradient(-45deg,#10b981_1px,transparent_1px)] bg-[size:10px_10px]"></div>
             <div className="p-4 font-mono text-[8px] text-gray-500 leading-tight">
                MSH|^~\&|MINDSEEK<br/>
                PID|1|49201|DOE^J<br/>
                OBX|1|TX|NOTES||<br/>
                PT STATES ANXIETY
             </div>
          </motion.div>

          {/* Layer 2: Graph Processing (Middle) */}
          <motion.div
            className="absolute inset-0 bg-emerald-900/20 border border-emerald-500/30 rounded-lg backdrop-blur-sm flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            style={{ transform: 'translateZ(40px)' }}
            whileHover={{ translateZ: 40 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
             {/* Graph Nodes */}
             <div className="relative w-full h-full">
                <div className="absolute top-1/3 left-1/3 w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
                <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-white rounded-full opacity-50" />

                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                   <line x1="33%" y1="33%" x2="66%" y2="66%" stroke="rgba(16,185,129,0.4)" strokeWidth="1" />
                   <line x1="33%" y1="33%" x2="75%" y2="50%" stroke="rgba(16,185,129,0.2)" strokeWidth="1" />
                </svg>
             </div>
          </motion.div>

          {/* Layer 3: Output (Top) */}
          <motion.div
            className="absolute inset-0 bg-[#050505] border border-white/20 rounded-lg flex flex-col items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.8)]"
            style={{ transform: 'translateZ(80px)' }}
            whileHover={{ translateZ: 120 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
             <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2 border border-emerald-500/40">
                <ShieldCheck size={14} className="text-emerald-400" />
             </div>
             <div className="text-[10px] font-mono text-gray-300 uppercase tracking-widest">Verified</div>
             <div className="text-[8px] text-emerald-500 mt-1">Confidence: 99.2%</div>
          </motion.div>

          {/* Hover Hint */}
          <div className="absolute -bottom-12 left-0 right-0 text-center transition-opacity duration-300 opacity-0 group-hover:opacity-100 pointer-events-none">
             <div className="text-[10px] font-mono text-emerald-500/70 tracking-widest transform -rotate-z-45 translate-x-8">EXPAND_STACK</div>
          </div>
       </div>
    </div>
  );
};

// Background Particle Graph
const GraphCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Mouse tracking for interactive connections
    let mouse = { x: null as number | null, y: null as number | null };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.x;
      mouse.y = e.y;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    let nodes = Array.from({ length: 50 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 1.5 + 0.5,
      pulse: Math.random() * Math.PI * 2 // For pulsing animation
    }));

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      time += 0.01;
      ctx.clearRect(0, 0, width, height);

      // Draw connections first (behind nodes)
      nodes.forEach((node, i) => {
        nodes.forEach((other, j) => {
          if (i >= j) return; // Avoid drawing twice

          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx*dx + dy*dy);

          if (dist < 150) {
            // Subtle pulsing opacity based on distance and time
            const baseOpacity = 0.18 - dist/150 * 0.18;
            const pulseOpacity = baseOpacity + Math.sin(time * 2 + dist * 0.1) * 0.05;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(16, 185, 129, ${Math.max(0, pulseOpacity)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });

        // Connect to mouse if nearby
        if (mouse.x !== null && mouse.y !== null) {
          const dx = node.x - mouse.x;
          const dy = node.y - mouse.y;
          const dist = Math.sqrt(dx*dx + dy*dy);

          if (dist < 200) {
            const opacity = (0.25 - dist/200 * 0.25) * (0.7 + Math.sin(time * 3) * 0.3);
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(16, 185, 129, ${opacity})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }
      });

      // Draw nodes with pulsing effect
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;
        node.pulse += 0.05;

        // Pulsing size and opacity
        const pulseSize = node.size + Math.sin(node.pulse) * 0.4;
        const pulseOpacity = 0.6 + Math.sin(node.pulse * 1.5) * 0.15;

        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${pulseOpacity})`;
        ctx.fill();

        // Enhanced glow effect
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseSize * 2, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, pulseSize * 2);
        gradient.addColorStop(0, `rgba(16, 185, 129, ${pulseOpacity * 0.5})`);
        gradient.addColorStop(0.5, `rgba(16, 185, 129, ${pulseOpacity * 0.2})`);
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseleave', handleMouseLeave);
        cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 opacity-80 pointer-events-none" />;
};

// Live Terminal Simulation
const LiveSimulation = () => {
  const [step, setStep] = useState(0);
  // Steps: 0=Ingest HL7, 1=Process Graph, 2=Output Diagnosis, 3=Code SNOMED

  useEffect(() => {
      const timer = setInterval(() => {
          setStep((prev) => (prev + 1) % 4);
      }, 3500);
      return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-full flex flex-col font-mono text-xs p-6 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
            <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500/50" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                <div className="w-2 h-2 rounded-full bg-emerald-500/50 animate-pulse" />
            </div>
            <div className="text-[10px] text-gray-600">mindseek_core_daemon</div>
        </div>

        {/* Dynamic Content */}
        <div className="space-y-4 flex-1 relative z-10">
            {/* Step 0: Ingestion */}
            <div className={`transition-opacity duration-500 ${step === 0 ? 'opacity-100' : 'opacity-30'}`}>
                <div className="text-emerald-500 mb-1 flex items-center gap-2">
                    <Server size={12} /> INGEST_STREAM [HL7v2]
                </div>
                <div className="pl-4 border-l border-white/10 text-[10px] text-gray-500">
                    MSH|^~\&|EPIC|ADT|MINDSEEK|... <br/>
                    PID|1||94302^^^MRN||DOE^J... <br/>
                    <span className="text-blue-400">OBX|1|TX|HISTORY||INSOMNIA...</span>
                </div>
            </div>

            {/* Step 1: GraphRAG */}
            <div className={`transition-opacity duration-500 ${step === 1 ? 'opacity-100' : 'opacity-30'}`}>
                <div className="text-emerald-500 mb-1 flex items-center gap-2">
                    <Network size={12} /> GRAPH_REASONING
                </div>
                {step === 1 && (
                    <motion.div
                        initial={{ width: 0 }} animate={{ width: "100%" }}
                        className="h-1 bg-emerald-500/50 rounded mb-2"
                    />
                )}
                <div className="pl-4 text-[10px] text-gray-400">
                    Retrieving nodes: <span className="text-white">Node(Insomnia)</span> {'->'} <span className="text-white">Node(Mania)</span> <br/>
                    Validating against DSM-5 Criteria A-D...
                </div>
            </div>

            {/* Step 2: Diagnosis */}
            <div className={`transition-opacity duration-500 ${step === 2 ? 'opacity-100' : 'opacity-30'}`}>
                <div className="text-emerald-500 mb-1 flex items-center gap-2">
                    <Brain size={12} /> INFERENCE_RESULT
                </div>
                <div className="bg-emerald-900/10 border border-emerald-500/20 p-2 rounded text-emerald-100">
                    Probable Bipolar I Disorder (296.41)
                </div>
            </div>

            {/* Step 3: SNOMED */}
            <div className={`transition-opacity duration-500 ${step === 3 ? 'opacity-100' : 'opacity-30'}`}>
                <div className="text-emerald-500 mb-1 flex items-center gap-2">
                    <Globe size={12} /> INTEROP_CODING
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="bg-white/5 p-1 px-2 rounded text-gray-400">SNOMED: 15639000</div>
                    <div className="bg-white/5 p-1 px-2 rounded text-gray-400">LOINC: 72166-2</div>
                </div>
            </div>
        </div>

        {/* Scanline overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20"></div>
    </div>
  );
};

// --- 3. MAIN LAYOUT ---

const FloatingHUD = () => {
  const [hovered, setHovered] = useState<number | null>(null);
  const items = [
    { icon: Brain, label: "GraphRAG" },
    { icon: Activity, label: "Analysis" },
    { icon: ShieldCheck, label: "Security" },
    { icon: Globe, label: "Interop" },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3">
      <div className="flex items-center gap-3 px-5 py-3 bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-full shadow-[0_0_50px_rgba(0,0,0,0.8)] ring-1 ring-white/5">
        {items.map((item, idx) => (
          <motion.button
            key={idx}
            onHoverStart={() => setHovered(idx)}
            onHoverEnd={() => setHovered(null)}
            whileHover={{ scale: 1.1, y: -2 }}
            className="relative group p-2.5 rounded-full bg-white/5 hover:bg-emerald-500/20 border border-transparent hover:border-emerald-500/50 transition-all duration-200"
          >
            <item.icon className="w-5 h-5 text-gray-400 group-hover:text-emerald-400" />
            <AnimatePresence>
              {hovered === idx && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: -10 }} exit={{ opacity: 0, y: 5 }}
                  className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-black border border-emerald-500/30 rounded text-[10px] font-mono text-emerald-400 uppercase tracking-wider whitespace-nowrap shadow-xl"
                >
                  {item.label}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
        <div className="w-[1px] h-6 bg-white/10 mx-1" />
        <MagneticButton
          onClick={() => {}}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-bold rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
        >
          <Command size={12} /> <span>CMD+K</span>
        </MagneticButton>
      </div>
      <div className="text-[10px] font-mono text-gray-600 tracking-[0.2em] uppercase opacity-70">
          Mindseek OS v2.4
      </div>
    </div>
  );
};

export default function MindSeekLanding() {
  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-sans selection:bg-emerald-500/30 pb-40 overflow-x-hidden">
      {/* --- BACKGROUND LAYERS --- */}
      <div className="fixed inset-0 z-[1] opacity-[0.04] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      <GraphCanvas />
      {/* God Ray / Side Spotlight */}
      <div className="fixed top-0 left-0 w-[400px] h-[100vh] bg-gradient-to-r from-emerald-900/20 via-emerald-900/5 to-transparent blur-[120px] pointer-events-none z-0 mix-blend-screen" />

      <FloatingHUD />

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex items-center px-6 z-10 pt-20 overflow-hidden" style={{ perspective: '1000px' }}>
        {/* Volumetric Theatre Spotlight - Coming from the left */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
          {/* Main volumetric beam - Reduced brightness */}
          <div
            className="absolute top-0 left-[-400px] w-[1600px] h-full"
            style={{
              background: 'radial-gradient(ellipse 800px 600px at 10% 50%, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.12) 15%, rgba(16, 185, 129, 0.06) 30%, rgba(16, 185, 129, 0.02) 50%, transparent 70%)',
              clipPath: 'polygon(0% 0%, 100% 0%, 90% 100%, 0% 100%)',
              filter: 'blur(60px)',
              transform: 'rotate(-3deg)',
              transformOrigin: 'left center'
            }}
          />

          {/* Volumetric light rays/beams - More prominent */}
          <div className="absolute inset-0">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-0 left-0 w-full h-full"
                style={{
                  background: `linear-gradient(${-3 + i * 0.5}deg, transparent ${20 + i * 3}%, rgba(16, 185, 129, ${0.15 - i * 0.01}) ${25 + i * 3}%, transparent ${30 + i * 3}%)`,
                  filter: 'blur(15px)',
                  transformOrigin: 'left center'
                }}
                animate={{
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{
                  duration: 3 + i * 0.3,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          {/* Hot spot / core of the beam - Reduced brightness */}
          <div
            className="absolute top-1/2 left-[2%] w-[700px] h-[500px] -translate-y-1/2"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.3) 0%, rgba(16, 185, 129, 0.15) 30%, transparent 60%)',
              filter: 'blur(50px)',
              transform: 'rotate(-3deg)',
              transformOrigin: 'left center'
            }}
          />

          {/* Edge of the beam for definition */}
          <div
            className="absolute top-0 left-[-400px] w-[1600px] h-full"
            style={{
              background: 'linear-gradient(87deg, transparent 0%, rgba(16, 185, 129, 0.08) 88%, transparent 92%)',
              clipPath: 'polygon(0% 0%, 100% 0%, 90% 100%, 0% 100%)',
              filter: 'blur(30px)',
              transform: 'rotate(-3deg)',
              transformOrigin: 'left center'
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          {/* Hero Text */}
          <div className="order-2 lg:order-1">
            <motion.div
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
               className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-md mb-8"
            >
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]" />
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
                <DecryptText text="Neural Interface Active" className="" />
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white mb-6 leading-[0.9]">
              Diagnostic <br />
              <motion.span
                whileHover={{ scale: 1.02, filter: "brightness(1.1)" }}
                className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-600 cursor-default"
              >
                Clarity.
              </motion.span>
            </h1>

            <p className="text-lg text-gray-400 max-w-xl mb-10 leading-relaxed border-l-2 border-emerald-500/20 pl-6">
              The "Clinic OS" for modern psychiatry. Built on <span className="text-white font-medium">GraphRAG</span> technology for hallucination-free reasoning.
              Fully interoperable with HL7 v2 & FHIR.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <MagneticButton
                onClick={() => {}}
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-[#020202] font-bold rounded transition-all shadow-[0_0_30px_rgba(16,185,129,0.25)] hover:shadow-[0_0_50px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2"
              >
                Deploy Workspace <ChevronRight size={16} />
              </MagneticButton>
              <MagneticButton
                onClick={() => {}}
                className="px-8 py-4 border border-white/10 bg-white/5 hover:bg-white/10 text-white rounded font-mono text-sm transition-all"
              >
                Live Demo
              </MagneticButton>
            </div>
          </div>

          {/* Hero Visual (3D Tilt) */}
          <div className="order-1 lg:order-2 h-[400px] lg:h-[500px] relative">
             {/* Decorative Background elements for the graphic */}
             <div className="absolute top-10 right-10 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full" />
             <TiltCard>
                <LiveSimulation />
             </TiltCard>
          </div>
        </div>
      </section>

      {/* --- CLINIC OS / FEATURES --- */}
      <section className="py-20 px-6 max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-white/10 pb-8">
          <div>
            <h2 className="text-sm font-mono text-emerald-500 mb-4 uppercase tracking-widest">Clinic OS Architecture</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-white max-w-2xl">
              Interoperability first. <br/>
              <span className="text-gray-500">Stop fighting your EHR.</span>
            </h3>
          </div>
          <div className="text-right hidden md:block font-mono text-xs text-gray-600">
             COMPLIANCE: HIPAA / SOC2 / GDPR
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* 1. Interoperability (HL7/FHIR) */}
          <div className="md:col-span-7">
          <FadeIn delay={0.1}>
          <SpotlightCard className="h-full rounded-xl p-8 flex flex-col justify-between min-h-[350px] bg-[#080808]">
            <div>
              <div className="w-10 h-10 rounded bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20">
                <Share2 className="text-blue-400" size={20} />
              </div>
              <h4 className="text-2xl font-bold text-white mb-3">Bridging Legacy & Modern</h4>
              <p className="text-gray-400 max-w-md">
                Whether your hospital runs on HL7 v2 pipes or modern FHIR APIs, MindSeek adapts.
                We normalize data ingestion to build a unified patient timeline.
              </p>
            </div>

            {/* Code Comparison Visual */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-[10px]">
               <div className="p-3 rounded bg-black border border-white/10 opacity-60">
                  <div className="text-gray-500 mb-2 border-b border-white/10 pb-1">Legacy (HL7 v2)</div>
                  <div className="text-emerald-700">MSH|^~\&|EPIC|...</div>
                  <div className="text-emerald-700">PID|1||9901...</div>
                  <div className="text-emerald-700">OBX|1|TX|NOTE...</div>
               </div>
               <div className="p-3 rounded bg-black border border-white/10">
                  <div className="text-blue-400 mb-2 border-b border-white/10 pb-1">Modern (FHIR R4)</div>
                  <div className="text-gray-500">{"{"}</div>
                  <div className="pl-2 text-blue-300">"resourceType": "Observation",</div>
                  <div className="pl-2 text-blue-300">"code": "LOINC:340-2",</div>
                  <div className="text-gray-500">{"}"}</div>
               </div>
            </div>
          </SpotlightCard>
          </FadeIn>
          </div>

          {/* 2. SNOMED CT Coding */}
          <div className="md:col-span-5">
          <FadeIn delay={0.2}>
          <SpotlightCard className="h-full rounded-xl p-8 bg-[#080808]">
            <div className="w-10 h-10 rounded bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20">
                <Globe className="text-purple-400" size={20} />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Universal Coding</h4>
            <p className="text-gray-400 text-sm mb-6">
              Automatic mapping between <span className="text-white">DSM-5</span> criteria and <span className="text-white">SNOMED CT</span>.
              Automate billing without losing clinical nuance.
            </p>
            <div className="space-y-2">
              {[
                { label: "Major Depression", code: "370143000" },
                { label: "Generalized Anxiety", code: "21897009" },
                { label: "Adjustment Disorder", code: "47505003" }
              ].map((item, i) => (
                 <div key={i} className="flex justify-between items-center p-2 bg-white/5 rounded border border-white/5">
                    <span className="text-xs text-gray-300">{item.label}</span>
                    <span className="text-[10px] font-mono text-purple-400">{item.code}</span>
                 </div>
              ))}
            </div>
          </SpotlightCard>
          </FadeIn>
          </div>

          {/* 3. GraphRAG (The Core) */}
          <div className="md:col-span-8">
          <FadeIn delay={0.3}>
          <SpotlightCard className="h-full rounded-xl p-8 relative overflow-hidden">
             <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4 text-emerald-400">
                        <Network size={16} />
                        <span className="text-xs font-mono uppercase">GraphRAG Engine</span>
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-3">Hallucination-Free Reasoning</h4>
                    <p className="text-gray-400 text-sm max-w-lg">
                        LLMs are creative, which is bad for medicine. MindSeek anchors every output in a verified Knowledge Graph of psychiatric literature.
                        If the node doesn't exist in the graph, the AI won't invent it.
                    </p>
                </div>

                {/* Animated Graph Visualization */}
                <div className="w-full md:w-64 h-48 md:h-full relative flex items-center justify-center">
                   <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 blur-2xl rounded-full opacity-40" />
                   <IsometricStack />
                </div>
             </div>
          </SpotlightCard>
          </FadeIn>
          </div>

          {/* 4. Security Vault */}
          <div className="md:col-span-4">
          <FadeIn delay={0.4}>
          <SpotlightCard className="h-full rounded-xl p-8 bg-[#080808]">
            <div className="w-10 h-10 rounded bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
                <Fingerprint className="text-red-400" size={20} />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Zero-Knowledge</h4>
            <p className="text-gray-400 text-sm mb-4">
               E2E Encrypted. We process data in your local VPC. We never train on patient PII.
            </p>
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-black border border-white/10 p-2 text-[10px] text-center rounded text-gray-500">AES-256</div>
                <div className="bg-black border border-white/10 p-2 text-[10px] text-center rounded text-gray-500">Audit Logs</div>
            </div>
          </SpotlightCard>
          </FadeIn>
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS / REVIEWS --- */}
      <section className="py-20 px-6 max-w-7xl mx-auto relative z-10">
        <div className="mb-16 text-center">
          <h2 className="text-sm font-mono text-emerald-500 mb-4 uppercase tracking-widest">Clinical Validation</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-white max-w-2xl mx-auto">
            Trusted by leading psychiatric institutions
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Testimonial 1 */}
          <SpotlightCard className="rounded-xl p-8 bg-[#080808] flex flex-col justify-between min-h-[280px]" spotlightColor="rgba(16, 185, 129, 0.12)">
            <div>
              <div className="w-10 h-10 rounded bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20">
                <Quote className="text-emerald-400" size={20} />
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-6 italic">
                "MindSeek eliminated the guesswork in our diagnostic workflow. The GraphRAG engine caught a bipolar misdiagnosis that would have led to inappropriate SSRI treatment. This is exactly what clinical decision support should be."
              </p>
            </div>
            <div className="border-t border-white/10 pt-4">
              <div className="font-bold text-white text-sm">Dr. Sarah Chen</div>
              <div className="text-xs text-gray-500 font-mono">Chief of Psychiatry</div>
              <div className="text-[10px] text-emerald-500/80 mt-1">Massachusetts General Hospital</div>
            </div>
          </SpotlightCard>

          {/* Testimonial 2 */}
          <SpotlightCard className="rounded-xl p-8 bg-[#080808] flex flex-col justify-between min-h-[280px]" spotlightColor="rgba(59, 130, 246, 0.12)">
            <div>
              <div className="w-10 h-10 rounded bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20">
                <Quote className="text-blue-400" size={20} />
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-6 italic">
                "The HL7 v2 integration was seamless. We didn't have to change our existing infrastructure. MindSeek normalized 15 years of legacy data in under 48 hours. The SNOMED CT mapping alone saved us 20 hours per week on billing."
              </p>
            </div>
            <div className="border-t border-white/10 pt-4">
              <div className="font-bold text-white text-sm">Dr. Marcus Rodriguez</div>
              <div className="text-xs text-gray-500 font-mono">Medical Director</div>
              <div className="text-[10px] text-blue-500/80 mt-1">Cleveland Clinic Behavioral Health</div>
            </div>
          </SpotlightCard>

          {/* Testimonial 3 */}
          <SpotlightCard className="rounded-xl p-8 bg-[#080808] flex flex-col justify-between min-h-[280px]" spotlightColor="rgba(168, 85, 247, 0.12)">
            <div>
              <div className="w-10 h-10 rounded bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20">
                <Quote className="text-purple-400" size={20} />
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-6 italic">
                "The zero-knowledge architecture gave our compliance team confidence. Patient data never leaves our VPC. We're processing 500+ patient sessions daily with full HIPAA compliance. The audit logs are comprehensive."
              </p>
            </div>
            <div className="border-t border-white/10 pt-4">
              <div className="font-bold text-white text-sm">Dr. Emily Watson</div>
              <div className="text-xs text-gray-500 font-mono">VP of Clinical Informatics</div>
              <div className="text-[10px] text-purple-500/80 mt-1">Johns Hopkins Psychiatry</div>
            </div>
          </SpotlightCard>
        </div>

        {/* Stats Row */}
        <FadeIn delay={0.6} className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-[#0A0A0A] border border-white/5 rounded-xl">
            <div className="text-3xl font-bold text-emerald-400 mb-2"><AnimatedCounter value={500} suffix="+" /></div>
            <div className="text-xs text-gray-500 font-mono uppercase tracking-wider">Daily Sessions</div>
          </div>
          <div className="text-center p-6 bg-[#0A0A0A] border border-white/5 rounded-xl">
            <div className="text-3xl font-bold text-emerald-400 mb-2"><AnimatedCounter value={99.7} suffix="%" decimals={1} /></div>
            <div className="text-xs text-gray-500 font-mono uppercase tracking-wider">Accuracy Rate</div>
          </div>
          <div className="text-center p-6 bg-[#0A0A0A] border border-white/5 rounded-xl">
            <div className="text-3xl font-bold text-emerald-400 mb-2"><AnimatedCounter value={12} suffix="ms" /></div>
            <div className="text-xs text-gray-500 font-mono uppercase tracking-wider">Avg Latency</div>
          </div>
          <div className="text-center p-6 bg-[#0A0A0A] border border-white/5 rounded-xl">
            <div className="text-3xl font-bold text-emerald-400 mb-2"><AnimatedCounter value={0} /></div>
            <div className="text-xs text-gray-500 font-mono uppercase tracking-wider">Hallucinations</div>
          </div>
        </FadeIn>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-white/5 bg-black relative overflow-hidden">
         <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-emerald-600 rounded-sm" />
                <span className="text-2xl font-bold text-white tracking-widest">MINDSEEK</span>
            </div>
            <div className="flex gap-8 text-sm text-gray-500 font-mono">
                <a href="#" className="hover:text-emerald-400 transition-colors">System Status</a>
                <a href="#" className="hover:text-emerald-400 transition-colors">Documentation</a>
                <a href="#" className="hover:text-emerald-400 transition-colors">Security</a>
            </div>
         </div>
         <div className="text-center py-4 bg-[#020202] text-[10px] text-gray-700 font-mono border-t border-white/5">
            SYSTEM_ID: 8492-A • ENCRYPTED CONNECTION • © 2025 MINDSEEK INC.
         </div>
      </footer>
    </div>
  );
}
