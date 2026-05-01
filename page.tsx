'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'motion/react';
import { 
  Bike, 
  ChevronRight, 
  Info, 
  Wind, 
  Zap, 
  Shield, 
  Sun, 
  Moon,
  Sparkles,
  ArrowRight,
  Maximize,
  Minimize,
  ChevronDown,
  Move
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';

// --- Types & Data ---

type BikeModel = {
  id: string;
  name: string;
  tagline: string;
  price: string;
  weight: string;
  imageUrl: string;
  category: 'Road' | 'Gravel' | 'Electric';
  color: string;
};

const BIKES: BikeModel[] = [
  {
    id: 'aero-v1',
    name: 'Aero Vanguard',
    tagline: 'Defy the wind with precision engineering.',
    price: '$8,400',
    weight: '6.8kg',
    imageUrl: 'https://images.pexels.com/photos/25016477/pexels-photo-25016477.jpeg?auto=compress&cs=tinysrgb&w=1200',
    category: 'Road',
    color: 'Matte Obsidian'
  },
  {
    id: 'gravel-x',
    name: 'Terra X-Trail',
    tagline: 'Born for the dust, built for the soul.',
    price: '$5,200',
    weight: '8.2kg',
    imageUrl: 'https://images.pexels.com/photos/5545636/pexels-photo-5545636.jpeg?auto=compress&cs=tinysrgb&w=1200',
    category: 'Gravel',
    color: 'Sage Green'
  },
  {
    id: 'e-volt',
    name: 'Volt S-Prime',
    tagline: 'Silent power for the urban nomad.',
    price: '$6,900',
    weight: '14.5kg',
    imageUrl: 'https://images.pexels.com/photos/19431262/pexels-photo-19431262.jpeg?auto=compress&cs=tinysrgb&w=1200',
    category: 'Electric',
    color: 'Titanium Silver'
  },
  {
    id: 'carbon-peak',
    name: 'Peak Summit',
    tagline: 'Weightless climbing on every ridge.',
    price: '$9,100',
    weight: '6.2kg',
    imageUrl: 'https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?auto=format&fit=crop&q=80&w=1200',
    category: 'Road',
    color: 'Deep Crimson'
  }
];

const TECH_SPECS: Record<string, { label: string, value: string }[]> = {
  'aero-v1': [
    { label: 'Frame', value: 'VC-Advanced Modulus Carbon' },
    { label: 'Groupset', value: 'Sram Force eTap AXS 12sp' },
    { label: 'Wheels', value: 'Velo Core 50mm Carbon Tubeless' },
    { label: 'Tires', value: 'Continental GP5000 S TR' },
    { label: 'Brakes', value: 'Sram Force Hydraulic Disc' },
    { label: 'Saddle', value: 'Fizik Vento Argo R3' },
  ],
  'gravel-x': [
    { label: 'Frame', value: 'Terra G-Series Carbon' },
    { label: 'Groupset', value: 'Shimano GRX 810 1x11' },
    { label: 'Wheels', value: 'Terra Adventure Alloy 650b' },
    { label: 'Tires', value: 'Panaracer GravelKing SK 43mm' },
    { label: 'Handlebar', value: 'Terra Flare Carbon' },
    { label: 'Brakes', value: 'Shimano GRX 810 Hydraulic' },
  ],
  'e-volt': [
    { label: 'Motor', value: 'Ebikemotion X35+ 250W' },
    { label: 'Battery', value: 'Internal 250Wh + Range Extender' },
    { label: 'Frame', value: 'Volt SL-Integrated Alloy' },
    { label: 'Groupset', value: 'Shimano 105 11sp' },
    { label: 'Range', value: 'Up to 100km' },
    { label: 'Charging', value: 'Fast Charge 2.5h' },
  ],
  'carbon-peak': [
    { label: 'Frame', value: 'Peak Ultralight HM Carbon' },
    { label: 'Groupset', value: 'Shimano Dura-Ace Di2' },
    { label: 'Wheels', value: 'Enve SES 2.3 Carbon' },
    { label: 'Tires', value: 'Vittoria Corsa Speed' },
    { label: 'Stem', value: 'Peak Integrated Carbon' },
    { label: 'Weight', value: '6.2kg complete' },
  ],
};

// --- Components ---

const Navbar = ({ theme, toggleTheme, cartCount }: { theme: string, toggleTheme: () => void, cartCount: number }) => (
  <nav className="fixed top-0 left-0 w-full z-50 px-12 py-8 flex justify-between items-center bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
    <div className="text-2xl font-bold tracking-tighter flex items-center gap-2">
      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
        <div className="w-4 h-4 bg-black rounded-sm rotate-45"></div>
      </div>
      <span className="font-display font-bold">VELO CORE</span>
    </div>
    
    <div className="flex items-center gap-10">
      <div className="hidden md:flex gap-10 text-sm font-medium text-white/60 tracking-tight">
        <a href="#" className="text-white border-b border-[#FF4D00]/40 transition-colors">COLLECTION</a>
        <a href="#" className="hover:text-white transition-colors">TECHNOLOGY</a>
        <a href="#" className="hover:text-white transition-colors">ABOUT US</a>
      </div>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleTheme}
          className="p-2 hover:bg-white/5 rounded-full transition-colors"
        >
          {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
        <button className="px-6 py-2 bg-white text-black text-xs font-bold rounded-full tracking-widest uppercase transition-all active:scale-95">CART [{cartCount}]</button>
      </div>
    </div>
  </nav>
);

const Bike360Viewer = ({ imageUrl, name, isFullScreen = false }: { imageUrl: string, name: string, isFullScreen?: boolean }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // Transform mouse/drag coordinates into 3D rotation
  const rotateX = useTransform(mouseY, [-300, 300], [25, -25]);
  const rotateY = useTransform(mouseX, [-300, 300], [-45, 45]);
  const brightness = useTransform(mouseX, [-300, 300], [0.8, 1.2]);

  const handleReset = () => {
    setIsDragging(false);
    animate(mouseX, 0, { type: 'spring', stiffness: 150, damping: 20 });
    animate(mouseY, 0, { type: 'spring', stiffness: 150, damping: 20 });
  };

  return (
    <div className="relative group cursor-grab active:cursor-grabbing w-full h-full flex items-center justify-center">
      <motion.div 
        style={{ rotateX, rotateY, perspective: 1000 }}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.1}
        onDragStart={() => setIsDragging(true)}
        onDrag={(e, info) => {
          mouseX.set(info.offset.x);
          mouseY.set(info.offset.y);
        }}
        onDragEnd={handleReset}
        animate={{ 
          maxWidth: isFullScreen ? '1000px' : '512px',
        }}
        className="relative z-10 w-full aspect-square bg-[#0a0a0a]/50 rounded-full border border-white/5 flex items-center justify-center p-8 overflow-hidden shadow-2xl backdrop-blur-sm"
      >
        <motion.div 
          style={{ opacity: useTransform(mouseX, [-300, 300], [0.1, 0.3]) }}
          className="absolute inset-0 bg-[#FF4D00] blur-[100px]"
        />
        
        <motion.img 
          src={imageUrl} 
          alt={name}
          style={{ filter: useTransform(brightness, b => `brightness(${b}) grayscale(0.5)`) }}
          className="w-full h-auto rounded-lg shadow-[0_30px_60px_rgba(0,0,0,0.8)] scale-[1.25] pointer-events-none select-none transition-filter duration-300 group-hover:grayscale-0"
          referrerPolicy="no-referrer"
        />

        {/* Visual Cue: Pulsing Move Icon */}
        <AnimatePresence>
          {!isDragging && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="bg-black/40 backdrop-blur-md rounded-full p-6 border border-white/10 shadow-2xl animate-pulse">
                <Move className="w-8 h-8 text-[#FF4D00]/60" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Shadow */}
        <motion.div 
          style={{ 
            x: useTransform(mouseX, [-300, 300], [40, -40]),
            opacity: useTransform(mouseY, [-300, 300], [0.2, 0.5])
          }}
          className="absolute bottom-20 w-3/4 h-8 bg-black/80 blur-2xl rounded-full -z-10"
        />
      </motion.div>

      {/* Interaction Prompt */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute -bottom-8 flex items-center gap-3 text-[#FF4D00] text-[10px] font-bold tracking-[0.4em] uppercase"
      >
        <Sparkles className="w-3 h-3 animate-pulse" />
        DRAG TO EXPLORE 360°
      </motion.div>
    </div>
  );
};

export default function VelosmithApp() {
  const [theme, setTheme] = useState('dark');
  const [selectedBike, setSelectedBike] = useState<BikeModel | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showSpecs, setShowSpecs] = useState(false);
  const [story, setStory] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  const addToCart = () => {
    setCartCount(prev => prev + 1);
  };

  const generateStory = async (bike: BikeModel) => {
    setSelectedBike(bike);
    setIsFullScreen(false); // Reset full screen mode
    setShowSpecs(false); // Reset specs view
    setIsGenerating(true);
    setStory(null);

    const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a cinematic storyteller for a high-end bicycle brand. Write an evocative, short 2-sentence narrative about the "soul" of this bicycle. Focus on the feeling of riding it and its elemental nature.
        Bike: ${bike.name}
        Category: ${bike.category}
        Weight: ${bike.weight}
        Tagline: ${bike.tagline}`,
      });
      setStory(response.text || "The wind whispers its name, but only the road knows its true path.");
    } catch (error) {
      console.error(error);
      setStory("Created in the silence of our lab, it waits for the first light of dawn to prove its lineage.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-[#FF4D00] selection:text-white overflow-hidden">
      <Navbar theme={theme} toggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} cartCount={cartCount} />

      {/* Hero Split Section */}
      <section className="flex flex-col md:flex-row min-h-screen border-b border-white/5">
        {/* Left: Narrative */}
        <div className="w-full md:w-5/12 p-12 md:p-24 flex flex-col justify-center border-r border-white/5 bg-[#080808] pt-32 md:pt-12">
          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[#FF4D00] text-xs font-bold tracking-[0.3em] mb-4 uppercase"
          >
            CHAPTER 01: THE GENESIS
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-5xl md:text-7xl font-light leading-[1.1] mb-8 tracking-tight"
          >
            Redefining the <br/><span className="italic font-serif opacity-90">Human Machine</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/40 text-lg leading-relaxed mb-10 max-w-md"
          >
            Born in the wind tunnels, our frames aren&apos;t just manufactured; they are sculpted. We combine aerospace-grade carbon fiber with artisanal geometric precision.
          </motion.p>
          <div className="flex items-center gap-4 opacity-30">
            <div className="w-12 h-[1px] bg-white"></div>
            <span className="text-[10px] tracking-widest uppercase">SCROLL FOR NARRATIVE</span>
          </div>
        </div>

        {/* Right: Product Display */}
        <div className="w-full md:w-7/12 relative flex items-center justify-center p-12 overflow-hidden bg-[#050505]">
          {/* Background Ambient Effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FF4D00]/5 blur-[120px] rounded-full"></div>
          
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none">
            <span className="text-[200px] md:text-[300px] font-black tracking-tighter">CORE-X</span>
          </div>

          <motion.div 
            initial={{ scale: 0.8, opacity: 0, rotate: 5 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative z-10 w-full max-w-xl aspect-video rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 backdrop-blur-3xl overflow-hidden group shadow-2xl"
          >
            <img 
              src="https://images.pexels.com/photos/21588830/pexels-photo-21588830.jpeg?auto=compress&cs=tinysrgb&w=1200&grayscale=true" 
              alt="Hero Display"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 border border-white/20 px-6 py-2 rounded-lg backdrop-blur-md">
              <span className="text-[10px] tracking-[0.2em] font-bold text-[#FF4D00]">6.8 KG ULTRA-LIGHT</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="px-6 md:px-24 py-32 max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
          <div className="max-w-xl">
            <h2 className="font-display text-5xl font-light tracking-tight mb-4 uppercase">The Collection</h2>
            <p className="text-white/40 leading-relaxed italic font-serif text-xl border-l border-[#FF4D00] pl-6">
              &quot;To ride is to witness the conversation between gravity and intent.&quot;
            </p>
          </div>
          
          <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
            <button className="px-8 py-3 bg-white text-black rounded-full text-xs font-bold tracking-widest transition-all shadow-xl shadow-white/5 uppercase">PERFORMANCE</button>
            <button className="px-8 py-3 text-white/40 hover:text-white rounded-full text-xs font-bold tracking-widest transition-all uppercase">ENDURANCE</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {BIKES.map((bike, idx) => (
            <motion.div 
              key={bike.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group cursor-pointer"
              onClick={() => generateStory(bike)}
            >
              <div className="relative aspect-[16/10] bg-[#0c0c0c] border border-white/5 rounded-2xl overflow-hidden mb-8 transition-all group-hover:border-white/20">
                <img 
                  src={bike.imageUrl} 
                  alt={bike.name}
                  className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-6 right-6">
                  <div className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Sparkles className="w-4 h-4 text-[#FF4D00]" />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-start border-b border-white/5 pb-6">
                <div>
                  <span className="text-[10px] font-bold text-[#FF4D00] tracking-[0.3em] uppercase mb-2 block">{bike.category}</span>
                  <h3 className="text-3xl font-light tracking-tight">{bike.name}</h3>
                </div>
                <div className="text-right">
                  <div className="text-xl font-mono opacity-80 mb-1">{bike.price}</div>
                  <div className="text-[10px] tracking-widest opacity-30 uppercase">Inquire Now</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Storytelling Modal Overlay */}
      <AnimatePresence>
        {selectedBike && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#050505] border border-white/10 max-w-6xl w-full h-[85vh] rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-[0_0_100px_rgba(255,77,0,0.1)] relative"
            >
              {/* Common Controls Layer */}
              <div className="absolute top-8 left-8 z-50 flex items-center gap-6">
                <button 
                  onClick={() => setSelectedBike(null)}
                  className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 hover:text-white transition-all flex items-center gap-3 group"
                >
                  <div className="w-8 h-[1px] bg-white/20 group-hover:w-12 transition-all"></div>
                  EXIT THE LAB
                </button>
                <button 
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#FF4D00] hover:text-[#FF4D00]/80 transition-all flex items-center gap-2 group"
                >
                  {isFullScreen ? (
                    <>
                      <Minimize className="w-3 h-3" />
                      MINIMIZE VIEWER
                    </>
                  ) : (
                    <>
                      <Maximize className="w-3 h-3" />
                      FULL SCREEN
                    </>
                  )}
                </button>
              </div>

              {/* Left Column: Narrative */}
              <motion.div 
                animate={{ 
                  width: isFullScreen ? '0%' : '100%',
                  opacity: isFullScreen ? 0 : 1,
                  x: isFullScreen ? -100 : 0
                }}
                className={`w-full md:w-5/12 p-12 md:p-20 md:pr-12 flex flex-col justify-between border-r border-white/5 bg-[#080808] transition-all duration-500 pt-32 ${isFullScreen ? 'pointer-events-none invisible' : ''}`}
              >
                <div>
                  <div className="h-16 mb-12"></div> {/* Spacer for fixed buttons */}
                  
                  <span className="text-[#FF4D00] text-xs font-bold tracking-[0.3em] mb-4 block uppercase leading-none">CHAPTER 02: THE SOUL</span>
                  <h2 className="font-display text-4xl md:text-5xl font-light mb-8 leading-tight tracking-tight uppercase">
                    {selectedBike.name}
                  </h2>
                  
                  <div className="min-h-[220px] flex items-center relative">
                    {isGenerating ? (
                      <div className="flex items-center gap-4 text-[#FF4D00]/50 italic text-xl font-serif">
                        <Sparkles className="animate-spin w-5 h-5" />
                        <span>Chiselng the story...</span>
                      </div>
                    ) : (
                      <div className="prose prose-invert border-l border-[#FF4D00]/40 pl-8">
                         <div className="text-2xl italic font-serif leading-relaxed text-white/90">
                           <ReactMarkdown>
                             {story || ""}
                           </ReactMarkdown>
                         </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 border-y border-white/5 py-10 mb-10">
                  <div className="group">
                    <span className="block text-[10px] uppercase text-white/30 tracking-widest font-bold mb-2">Weight Integrity</span>
                    <span className="text-xl font-medium italic group-hover:text-[#FF4D00] transition-colors">{selectedBike.weight}</span>
                  </div>
                   <div className="group">
                    <span className="block text-[10px] uppercase text-white/30 tracking-widest font-bold mb-2">Build Standard</span>
                    <span className="text-xl font-medium italic group-hover:text-[#FF4D00] transition-colors">T1100K Elite</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <button 
                    onClick={addToCart}
                    className="flex-1 bg-[#FF4D00] hover:bg-[#FF4D00]/90 text-white font-bold py-4 rounded-xl text-xs tracking-[0.3em] uppercase transition-all shadow-lg shadow-[#FF4D00]/20 active:scale-95 flex items-center justify-center gap-3"
                  >
                    ADD TO CART
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button className="w-14 h-14 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/5 transition-all group">
                    <Zap className="w-4 h-4 text-white/40 group-hover:text-[#FF4D00] transition-colors" />
                  </button>
                </div>

                <div className="mt-8">
                  <button 
                    onClick={() => setShowSpecs(!showSpecs)}
                    className="w-full py-4 border border-white/5 hover:border-white/10 rounded-xl text-[10px] tracking-[0.3em] font-bold uppercase text-white/30 hover:text-white transition-all flex items-center justify-center gap-3 group"
                  >
                    {showSpecs ? 'HIDE SPECIFICATIONS' : 'VIEW FULL SPECIFICATIONS'}
                    <ChevronDown className={`w-3 h-3 transition-transform duration-500 ${showSpecs ? 'rotate-180 text-[#FF4D00]' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showSpecs && selectedBike && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-8 grid grid-cols-1 gap-4">
                          {TECH_SPECS[selectedBike.id]?.map((spec, sidx) => (
                            <motion.div 
                              key={sidx}
                              initial={{ x: -10, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: sidx * 0.05 }}
                              className="flex justify-between items-center py-3 border-b border-white/5"
                            >
                              <span className="text-[10px] uppercase font-bold text-white/20 tracking-widest">{spec.label}</span>
                              <span className="text-sm font-medium text-white/80">{spec.value}</span>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Right Column: Visual */}
              <motion.div 
                animate={{ 
                  width: isFullScreen ? '100%' : '100%',
                  flex: isFullScreen ? 1 : 'none'
                }}
                className={`w-full ${isFullScreen ? '' : 'md:w-7/12'} relative bg-[#050505] p-12 flex flex-col justify-center items-center overflow-hidden transition-all duration-500`}
              >
                {/* Product Ambient Background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.02] flex items-center justify-center select-none pointer-events-none">
                   <div className="text-[400px] font-black uppercase tracking-tighter -rotate-12">BIKE</div>
                </div>
                
                <Bike360Viewer imageUrl={selectedBike.imageUrl} name={selectedBike.name} isFullScreen={isFullScreen} />
                
                <div className="absolute bottom-12 right-12 text-right">
                   <div className="text-[10px] tracking-[0.3em] text-white/20 uppercase font-black mb-1">Authentic Precision</div>
                   <div className="text-xs font-mono text-[#FF4D00] tracking-widest">STB-SERIES // 2026</div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Modern Footer */}
      <footer className="mt-48 h-auto md:h-16 px-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between py-8 md:py-0 gap-6 text-[10px] tracking-[0.2em] text-white/30 bg-[#080808]/50 uppercase font-bold">
        <div>EST. 2024 / BERLIN LABS</div>
        <div className="flex gap-12">
          <span className="hover:text-[#FF4D00] transition-colors cursor-pointer">GLOBAL SHIPPING</span>
          <span>●</span>
          <span className="text-white/60">LIMITED RUN: 04 / 50</span>
        </div>
        <div className="flex items-center gap-4 text-white hover:text-[#FF4D00] transition-all cursor-pointer group">
          EXPLORE SPECS 
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </div>
      </footer>
    </main>
  );
}
