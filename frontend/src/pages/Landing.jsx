import { motion } from 'framer-motion';
import { ArrowRight, FileText, Bot, Shield, UploadCloud, BrainCircuit, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import Hero3D from '../components/Hero3D';

const Landing = () => {
  return (
    <div className="w-full flex md:block flex-col overflow-x-hidden">
      
      {/* 1. Elite Startup Hero Section */}
      <section className="relative min-h-[95vh] flex items-center justify-center pt-24 md:pt-12 px-6 overflow-hidden">
        {/* Sweeping Startup Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-medGreen-50/50 -z-20"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-medGreen-400/10 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/4 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-medGreen-300/10 rounded-full blur-[100px] -z-10 -translate-x-1/4 translate-y-1/4 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center w-full relative z-10">
          
          {/* Left Text Structure */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} 
            className="order-2 md:order-1"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="inline-block px-5 py-2 rounded-full bg-[#faf0e6]/80 backdrop-blur-md text-medGreen-600 font-semibold mb-8 text-sm border border-medGreen-100 shadow-[0_4px_20px_-4px_rgba(119,221,119,0.2)]"
            >
              ✨ Introducing MedTwin AI 2.0
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] mb-6 text-slate-800 tracking-tighter">
              Unlock the <br/> Intelligence of <br/>
              <span className="text-medGreen-500 drop-shadow-sm">Your Health Data.</span>
            </h1>
            
            <p className="text-xl text-slate-500 mb-10 leading-relaxed max-w-lg font-light">
              We translate infinite rows of complex medical logs into an easily understandable, highly interactive AI model bridging the gap between numbers and care.
            </p>
            
            <motion.div 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-block"
            >
              <Link to="/dashboard" className="flex items-center gap-3 bg-medGreen-500 text-white px-10 py-4 rounded-xl font-semibold hover:bg-medGreen-600 transition-colors shadow-[0_10px_30px_-10px_rgba(119,221,119,0.5)]">
                Get Started <ArrowRight size={20} />
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Visual Structure (Glassmorphism AI Preview smartly positioned around 3D Cloud) */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative order-1 md:order-2 h-[450px] md:h-[600px] w-full"
          >
            {/* The Huge Procedural 3D Heart shifted down to prevent overlap */}
            <div className="absolute inset-0 md:mt-24 pointer-events-auto">
               <Hero3D />
            </div>

            {/* Floating Glassmorphism AI Preview Card - compactly sized and shifted to Top Left */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute top-0 md:top-6 -left-4 md:-left-12 w-full max-w-sm bg-[#faf0e6]/80 backdrop-blur-xl border border-white p-5 rounded-3xl shadow-[0_20px_40px_-20px_rgba(0,0,0,0.12)] z-20 pointer-events-none"
            >
               <div className="flex gap-4 items-start mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#77DD77] flex items-center justify-center text-white shrink-0 shadow-md">
                    <Bot size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-[15px] mb-1">MedTwin Analysis</h4>
                    <p className="text-slate-600 text-xs leading-relaxed">"Based on your PDF chart, your glucose levels have stabilized perfectly within the historical 90mg/dL threshold."</p>
                  </div>
               </div>
               {/* Faux Loading Bar showing active intelligence processing */}
               <div className="w-full bg-slate-200/50 rounded-full h-1.5 overflow-hidden">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                    className="h-full bg-[#77DD77]"
                  />
               </div>
            </motion.div>

            {/* Secondary Floating Glass Element - Shifted to Bottom Right */}
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-10 right-4 md:-right-8 bg-[#faf0e6]/90 backdrop-blur-lg border border-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-4 z-20 pointer-events-none"
            >
               <div className="w-10 h-10 rounded-full bg-[#77DD77]/20 text-[#77DD77] flex items-center justify-center shrink-0">
                  <Activity size={20} />
               </div>
               <div>
                  <p className="text-slate-800 font-bold text-sm leading-tight">Vitals Encrypted</p>
                  <p className="text-[#77DD77] text-xs font-bold mt-0.5">100% HIPAA Assured</p>
               </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. Features Section (Grid) */}
      <section className="py-24 bg-[#faf0e6]/50 border-t border-[#d0bfae]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4 tracking-tight">A Complete Clinical Ecosystem</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Everything you need to effortlessly interact with your entire medical history in one beautifully secure environment.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: UploadCloud, title: "Upload Report", desc: "Seamlessly drop your massive clinical PDFs and lab results into our highly secure local vault." },
              { icon: BrainCircuit, title: "AI Explanation", desc: "Complex medical terminology is instantly simplified into perfectly accurate native insights." },
              { icon: Bot, title: "Chat System", desc: "Interactively ask your AI twin follow-up questions tailored perfectly to your specific biomarkers." },
              { icon: Activity, title: "Health Memory", desc: "A permanent visual timeline chronologically mapping your vital history across all historical data." }
            ].map((f, i) => (
              <div key={i} className="bg-[#faf0e6] p-8 rounded-[2rem] shadow-sm border border-[#d0bfae] group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 ease-out cursor-default relative overflow-hidden">
                {/* Subtle hover gradient bloom mapped to medGreen */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#77DD77]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                
                <div className="relative z-10 w-14 h-14 bg-white/50 backdrop-blur-sm shadow-sm flex items-center justify-center rounded-2xl mb-6 text-[#77DD77] border border-[#d0bfae]/50 group-hover:scale-110 group-hover:bg-[#77DD77] group-hover:text-white transition-all duration-500">
                  <f.icon size={26} strokeWidth={2.5} />
                </div>
                <h3 className="relative z-10 text-xl font-bold text-slate-800 mb-3 tracking-tight">{f.title}</h3>
                <p className="relative z-10 text-slate-500 leading-relaxed text-sm font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. How It Works */}
      <section className="py-24 bg-[#faf0e6]">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-16">Three Steps to Clarity</h2>
          <div className="grid md:grid-cols-3 gap-12 relative">
             <div className="hidden md:block absolute top-[25%] left-[15%] right-[15%] h-0.5 bg-medGreen-100 -z-10"></div>
             {[
               { icon: UploadCloud, title: "1. Upload Documents", desc: "Securely drop your medical PDFs or raw data logs into the dashboard." },
               { icon: BrainCircuit, title: "2. Neuro-Processing", desc: "The AI engine extracts complex jargon mapping it natively to an NLP structure." },
               { icon: Activity, title: "3. Interactive Diagnosis", desc: "Chat instantly with your AI twin about your vitals, histories, and markers." }
             ].map((s, i) => (
               <div key={i} className="flex flex-col items-center">
                 <div className="w-20 h-20 bg-[#faf0e6] rounded-full shadow-lg border-2 border-medGreen-500 flex items-center justify-center text-medGreen-500 mb-6 relative">
                   <s.icon size={32} />
                 </div>
                 <h4 className="font-bold text-lg text-slate-800 mb-2">{s.title}</h4>
                 <p className="text-slate-500 text-sm max-w-xs">{s.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* 4. Demo Preview Placeholder Section */}
      <section className="py-24 bg-[#faf0e6]/50 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
           <div className="bg-[#2f2a26] rounded-[2.5rem] shadow-2xl p-4 md:p-8 relative">
              {/* Fake UI Header */}
              <div className="flex gap-2 mb-4 px-2 items-center font-mono text-[#77DD77]/30 text-xs">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-medGreen-400"></div>
                <span className="ml-4 tracking-widest text-[#77DD77]/50">system@medtwin ~ launch</span>
              </div>
              
              <div className="w-full bg-[#403933] rounded-[2rem] h-[50vh] flex flex-col items-center justify-center text-center px-4 border border-[#544b43]/50 relative overflow-hidden pb-10">
                 <div className="absolute inset-0 bg-gradient-to-t from-medGreen-500/10 to-transparent"></div>
                 <div className="relative z-10 w-24 h-24 mb-6 rounded-full bg-[#2f2a26] border border-medGreen-500/30 flex items-center justify-center glow-animate">
                    <Activity size={40} className="text-medGreen-500 animate-pulse" />
                 </div>
                 <h1 className="text-3xl md:text-5xl text-[#faf0e6] font-bold tracking-tight mb-4 relative z-10">Ready to visualize your health?</h1>
                 <p className="text-[#c2b6ac] max-w-md relative z-10 mb-8 text-lg">Access the secure AI terminal to process and index health logs instantly.</p>
                 <Link to="/dashboard" className="relative z-10 bg-medGreen-500 hover:opacity-90 text-white font-semibold flex items-center gap-2 px-8 py-4 rounded-full transition-all shadow-xl hover:scale-105">
                   Initialize Connection <ArrowRight size={18} />
                 </Link>
              </div>
           </div>
        </div>
      </section>

      {/* 5. Minimal Footer */}
      <footer className="py-12 border-t border-[#d0bfae] text-center text-slate-500 bg-[#faf0e6]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="font-bold text-xl text-slate-800 flex items-center gap-2">
             <Activity className="text-medGreen-500" />
             MedTwin AI
           </div>
           <p className="text-sm font-medium">© 2026 MedTwin AI Systems. All rights reserved.</p>
           <div className="flex gap-6 text-sm font-medium">
             <a href="#" className="hover:text-medGreen-500 transition-colors">Privacy Database</a>
             <a href="#" className="hover:text-medGreen-500 transition-colors">Compliance</a>
             <a href="#" className="hover:text-medGreen-500 transition-colors">Security</a>
           </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
