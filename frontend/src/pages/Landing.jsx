import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, FileText, Bot, Shield, UploadCloud, BrainCircuit, Activity, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Hero3D from '../components/Hero3D';
import { useRef } from 'react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const Landing = () => {
  const scrollRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: scrollRef, offset: ["start start", "end end"] });
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <div className="w-full flex md:block flex-col overflow-x-hidden bg-[#faf0e6] relative" ref={scrollRef}>
      
      {/* Universal Ambient Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#77DD77]/15 rounded-full blur-[150px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[#77DD77]/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

      {/* 1. Elite Startup Hero Section */}
      <section className="relative min-h-[95vh] flex items-center justify-center pt-24 md:pt-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center w-full relative z-10">
          
          {/* Left Text Structure */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="order-2 md:order-1 relative z-20"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/40 backdrop-blur-xl text-medGreen-700 font-bold mb-8 text-sm shadow-[0_8px_32px_-4px_rgba(119,221,119,0.2)]">
              <Sparkles size={16} className="text-medGreen-500 animate-pulse" /> Introducing MedTwin AI 2.0
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-6xl md:text-[5.5rem] font-black leading-[1.05] mb-8 text-slate-800 tracking-tighter">
              Unlock the <br/> Intelligence of <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-medGreen-400 to-medGreen-600 drop-shadow-sm">Your Data.</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-xl text-slate-500 mb-10 leading-relaxed max-w-lg font-medium mix-blend-multiply">
              Translate infinite rows of complex medical logs into an easily understandable, highly interactive AI model bridging the gap between numbers and care.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex gap-4 items-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/dashboard" className="group flex items-center gap-3 bg-medGreen-500 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-medGreen-600 transition-all shadow-[0_15px_40px_-10px_rgba(119,221,119,0.6)]">
                  Initialize <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Visual Structure */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="relative order-1 md:order-2 h-[450px] md:h-[650px] w-full"
          >
            {/* The Huge Procedural 3D Heart */}
            <div className="absolute inset-0 pointer-events-auto drop-shadow-2xl">
               <Hero3D />
            </div>

            {/* Glowing Glass Floating Panel */}
            <motion.div 
              animate={{ y: [0, -15, 0], rotate: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 0.5 }}
              className="absolute bottom-12 right-6 md:right-16 lg:right-24 bg-white/40 backdrop-blur-2xl p-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/50 flex flex-col gap-3 z-30"
            >
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-[#77DD77]/20 text-[#77DD77] flex items-center justify-center shadow-inner">
                    <Shield size={24} />
                 </div>
                 <div>
                    <p className="text-slate-800 font-bold text-lg leading-tight">Vitals Encrypted</p>
                    <p className="text-[#77DD77] text-sm font-bold mt-0.5 tracking-wide">100% HIPAA Assured</p>
                 </div>
               </div>
               <div className="w-full h-1.5 bg-[#77DD77]/20 rounded-full overflow-hidden mt-1">
                  <motion.div 
                     animate={{ x: ["-100%", "100%"] }} 
                     transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                     className="w-1/2 h-full bg-[#77DD77] rounded-full"
                  />
               </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. Interactive Glass Bento Grid */}
      <section className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants} className="text-center mb-20"
          >
            <motion.h2 variants={itemVariants} className="text-4xl md:text-6xl font-black text-slate-800 mb-6 tracking-tight">An Ecosystem of Care.</motion.h2>
            <motion.p variants={itemVariants} className="text-slate-500 max-w-2xl mx-auto text-xl font-medium">Interact with your entire medical history in one beautifully secure, borderless environment.</motion.p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: UploadCloud, title: "Vault Sync", desc: "Drop colossal clinical PDFs directly into our isolated encryption vault." },
              { icon: BrainCircuit, title: "Neural Map", desc: "Complex terminology is translated into instantly understood insights." },
              { icon: Bot, title: "AI Avatar", desc: "Interactively chat with an intelligence identical to your biomarkers." },
              { icon: Activity, title: "Vital Timeline", desc: "Chronological graphing of your complete biological history." }
            ].map((f, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: "easeOut" }}
                className="bg-white/40 backdrop-blur-3xl p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_30px_60px_rgb(119,221,119,0.15)] group hover:-translate-y-4 transition-all duration-500 cursor-default relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#77DD77]/20 rounded-full blur-[50px] -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10 w-16 h-16 bg-white shadow-sm flex items-center justify-center rounded-[1.5rem] mb-8 text-[#77DD77] group-hover:scale-110 group-hover:bg-[#77DD77] group-hover:text-white transition-all duration-500">
                  <f.icon size={30} strokeWidth={2.5} />
                </div>
                <h3 className="relative z-10 text-2xl font-bold text-slate-800 mb-4 tracking-tight">{f.title}</h3>
                <p className="relative z-10 text-slate-500/90 leading-relaxed font-medium">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Deep Interactive Terminal */}
      <section className="py-32 relative overflow-hidden z-10">
        <div className="max-w-6xl mx-auto px-6">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95, rotateX: 10 }}
             whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
             viewport={{ once: true, margin: "-100px" }}
             transition={{ duration: 1, ease: "easeOut" }}
             className="bg-[#1e1e1e]/90 backdrop-blur-3xl rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.15)] p-4 md:p-6 relative transform perspective-1000"
           >
              {/* macOS style dots */}
              <div className="flex gap-2.5 mb-6 px-4 pt-2 items-center">
                <div className="w-3.5 h-3.5 rounded-full bg-red-500/80 shadow-md"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/80 shadow-md"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-medGreen-500/80 shadow-md"></div>
                <span className="ml-4 font-mono text-[#77DD77]/40 text-xs tracking-[0.2em]">MEDTWIN_OS_V2.0</span>
              </div>
              
              <div className="w-full bg-[#111111] rounded-[2.5rem] h-[55vh] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden pb-10">
                 {/* Intense ambient terminal glow */}
                 <div className="absolute bottom-0 w-full h-[50%] bg-gradient-to-t from-medGreen-500/20 to-transparent blur-[40px] pointer-events-none"></div>
                 
                 <motion.div 
                   animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
                   transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                   className="relative z-10 w-28 h-28 mb-8 rounded-[2rem] bg-black/50 border border-medGreen-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(119,221,119,0.2)] backdrop-blur-md"
                 >
                    <BrainCircuit size={48} className="text-medGreen-500" />
                 </motion.div>
                 
                 <h1 className="text-4xl md:text-6xl text-white font-black tracking-tighter mb-6 relative z-10 drop-shadow-lg">Awaken Your Data.</h1>
                 <p className="text-zinc-400 max-w-lg relative z-10 mb-10 text-xl font-medium">Access the secure AI terminal to process, index, and converse with your health logs instantly.</p>
                 
                 <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                   <Link to="/dashboard" className="relative z-10 bg-medGreen-500/10 border border-medGreen-500 hover:bg-medGreen-500 text-white font-bold flex items-center gap-3 px-10 py-5 rounded-full transition-all duration-300 shadow-[0_0_30px_rgba(119,221,119,0.3)]">
                     Launch Dashboard <Bot size={20} />
                   </Link>
                 </motion.div>
              </div>
           </motion.div>
        </div>
      </section>

      {/* Footer Minimalist Air */}
      <footer className="py-16 text-center text-slate-500 bg-transparent relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="font-bold text-2xl text-slate-800 flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-medGreen-100 flex items-center justify-center">
               <Activity className="text-medGreen-600" size={20} />
             </div>
             MedTwin AI
           </div>
           <p className="text-sm font-semibold tracking-wide">© 2026 MedTwin Systems.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
