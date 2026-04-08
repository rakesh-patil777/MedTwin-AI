import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Hero3D from '../components/Hero3D';

const Landing = () => {
  return (
    <div className="grid md:grid-cols-2 gap-12 items-center min-h-[80vh]">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="inline-block px-4 py-1.5 rounded-full bg-medGreen-50 text-medGreen-600 font-semibold mb-6 text-sm border border-medGreen-100 shadow-sm">
          Welcome to the Future of Healthcare
        </div>
        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 text-slate-800 tracking-tight">
          Your Intelligent <br/> <span className="text-medGreen-500 drop-shadow-sm">Medical Twin</span>
        </h1>
        <p className="text-lg text-slate-500 mb-10 leading-relaxed max-w-lg">
          Experience real-time health insights powered by AI. Interact with your data seamlessly through our beautiful interface.
        </p>
        <Link to="/dashboard" className="inline-flex items-center gap-2 bg-medGreen-500 text-white px-8 py-3.5 rounded-2xl font-medium hover:bg-medGreen-600 transition-all shadow-lg hover:shadow-medGreen-500/30 hover:-translate-y-1">
          Open Dashboard <ArrowRight size={20} />
        </Link>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-medGreen-100 to-transparent rounded-full filter blur-3xl opacity-60 -z-10"></div>
        <Hero3D />
      </motion.div>
    </div>
  );
};

export default Landing;
