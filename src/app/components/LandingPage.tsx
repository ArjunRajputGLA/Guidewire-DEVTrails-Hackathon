"use client";

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import CountUp from 'react-countup';
import burgerImg from './burger.png';
import pizzaImg from './pizza.png';
import dumplingsImg from './dumplings.png';
import groceryBagImg from './grocery_bag.png';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const primaryColor = "#ff4d5a";
  const secondaryColor = "#ff7a18";

  const { scrollYProgress } = useScroll();
  const groceryY = useTransform(scrollYProgress, [0, 1], [0, 900]);
  const groceryRot = useTransform(scrollYProgress, [0, 1], [-12, 100]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };


  return (
    <div className="min-h-screen bg-[#fafaf8] font-sans selection:bg-rose-500 selection:text-white scroll-smooth overflow-x-hidden">
      
      {/* Falling Grocery Bag Parallax Element */}
      <motion.div 
        className="fixed top-[10%] lg:top-[15%] left-[8%] lg:left-[5%] w-24 h-24 sm:w-28 sm:h-28 z-[100] pointer-events-none"
        style={{ y: groceryY, rotate: groceryRot }}
      >
        <img src={groceryBagImg.src} alt="Grocery Bag" className="w-full h-full object-contain drop-shadow-[0_16px_24px_rgba(0,0,0,0.15)] animate-float" />
      </motion.div>

      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&display=swap');

        * { font-family: 'DM Sans', sans-serif; }
        .font-display { font-family: 'Instrument Serif', serif; }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-18px) rotate(2deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(-3deg); }
        }
        @keyframes rotate-slight {
          0%, 100% { transform: rotate(0deg) translateY(0); }
          50% { transform: rotate(6deg) translateY(-10px); }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          40% { transform: translateY(-22px); }
          60% { transform: translateY(-11px); }
          80% { transform: translateY(-16px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(32px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes grain {
          0%, 100% { transform: translate(0,0); }
          10% { transform: translate(-2%,-2%); }
          30% { transform: translate(2%,1%); }
          50% { transform: translate(-1%,2%); }
          70% { transform: translate(1%,-1%); }
          90% { transform: translate(-1%,1%); }
        }
        @keyframes badge-pop {
          0% { transform: scale(0.8) translateY(10px); opacity: 0; }
          70% { transform: scale(1.05) translateY(-2px); }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 7.5s ease-in-out infinite; }
        .animate-rotate-slight { animation: rotate-slight 8s ease-in-out infinite; }
        .animate-bounce-subtle { animation: bounce-subtle 5.5s ease-in-out infinite; }
        .animate-float-delayed-1 { animation: float 5.5s ease-in-out infinite 1s; }
        .animate-float-delayed-2 { animation: float 7s ease-in-out infinite 2s; }
        .animate-fade-in-up { animation: fadeInUp 0.9s cubic-bezier(0.16,1,0.3,1) forwards; opacity: 0; }
        .animate-slide-in-right { animation: slideInRight 0.9s cubic-bezier(0.16,1,0.3,1) forwards; opacity: 0; }
        .animate-scale-in { animation: scaleIn 0.7s cubic-bezier(0.16,1,0.3,1) forwards; opacity: 0; }
        .animate-badge-pop { animation: badge-pop 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards 0.8s; opacity: 0; }

        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
        .delay-500 { animation-delay: 500ms; }
        .delay-600 { animation-delay: 600ms; }

        .text-gradient {
          background: linear-gradient(135deg, #ff4d5a 0%, #ff7a18 60%, #ffb347 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .text-gradient-shimmer {
          background: linear-gradient(90deg, #ff4d5a 0%, #ff7a18 40%, #ffd700 50%, #ff7a18 60%, #ff4d5a 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .noise-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
        }
        .card-glow {
          transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
        }
        .card-glow:hover {
          box-shadow: 0 0 0 1px rgba(255,77,90,0.15), 0 24px 48px -12px rgba(255,77,90,0.18);
        }
        .btn-primary {
          background: linear-gradient(135deg, #ff4d5a 0%, #ff6b35 100%);
          box-shadow: 0 4px 20px -4px rgba(255,77,90,0.45), inset 0 1px 0 rgba(255,255,255,0.15);
          transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
        }
        .btn-primary:hover {
          background: linear-gradient(135deg, #ff3344 0%, #ff5a20 100%);
          box-shadow: 0 8px 28px -6px rgba(255,77,90,0.55), inset 0 1px 0 rgba(255,255,255,0.2);
          transform: translateY(-2px);
        }
        .btn-secondary {
          background: white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(0,0,0,0.08);
          transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
        }
        .btn-secondary:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }
        .feature-card {
          background: white;
          border: 1px solid rgba(0,0,0,0.06);
          transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
        }
        .feature-card:hover {
          transform: translateY(-6px);
          border-color: rgba(255,77,90,0.15);
          box-shadow: 0 20px 40px -12px rgba(255,77,90,0.14), 0 0 0 1px rgba(255,77,90,0.08);
        }
        .step-connector {
          background: linear-gradient(90deg, rgba(255,77,90,0.3) 0%, rgba(255,122,24,0.3) 50%, rgba(34,197,94,0.3) 100%);
        }
        .hero-image-wrap {
          box-shadow: 0 32px 64px -20px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.6);
        }
        .nav-pill {
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.6);
          box-shadow: 0 8px 32px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.9) inset;
        }
        .trust-pill {
          background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,248,248,0.95));
          border: 1px solid rgba(255,77,90,0.12);
          box-shadow: 0 2px 12px rgba(255,77,90,0.08);
        }
        .stats-card {
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.06);
          border: 1px solid rgba(0,0,0,0.05);
        }
        .orb-1 {
          background: radial-gradient(circle, rgba(255,77,90,0.25) 0%, rgba(255,77,90,0) 70%);
        }
        .orb-2 {
          background: radial-gradient(circle, rgba(255,122,24,0.2) 0%, rgba(255,122,24,0) 70%);
        }
        .section-label {
          letter-spacing: 0.12em;
          font-size: 0.7rem;
          text-transform: uppercase;
          font-weight: 700;
        }
        .pulse-dot::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid #ff4d5a;
          animation: pulse-ring 1.5s ease-out infinite;
        }
        .cta-section {
          background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 40%, #1f1410 100%);
        }
        .divider-line {
          background: linear-gradient(90deg, transparent, rgba(0,0,0,0.08), transparent);
          height: 1px;
        }
      `}} />

      {/* Navigation */}
      <nav className="fixed top-3 md:top-5 inset-x-0 mx-auto max-w-6xl px-4 z-50">
        <div className="nav-pill rounded-2xl md:rounded-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-[60px]">
            {/* Logo */}
            <div className="flex items-center gap-2.5 cursor-pointer group">
              <div className="w-10 h-10 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300 rounded-lg overflow-hidden bg-white">
                <img src="/favicon.ico" alt="GigShield Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-900">GigShield</span>
            </div>

            {/* Center nav */}
            <div className="hidden lg:flex items-center gap-1 p-1 bg-slate-100/70 rounded-full">
              <a href="#how-it-works" onClick={(e) => scrollToSection(e, 'how-it-works')} className="px-4 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-white rounded-full font-medium transition-all hover:shadow-sm">How it Works</a>
              <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="px-4 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-white rounded-full font-medium transition-all hover:shadow-sm">Features</a>
              <a href="#stats" onClick={(e) => scrollToSection(e, 'stats')} className="px-4 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-white rounded-full font-medium transition-all hover:shadow-sm">Coverage</a>
            </div>

            {/* Right CTAs */}
            <div className="flex items-center gap-2 md:gap-3">
              {user ? (
                <Link href={user.role === 'admin' ? "/admin/dashboard" : "/worker/dashboard"}
                  className="btn-primary text-white px-5 py-2 rounded-full text-sm font-semibold">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="hidden sm:inline-flex px-4 py-2 text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors">
                    Log in
                  </Link>
                  <Link href="/signup" className="btn-primary text-white px-5 py-2 rounded-full text-sm font-semibold">
                    Join Now
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-36 pb-16 lg:pt-52 lg:pb-28">
        {/* Background orbs */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="orb-1 absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full animate-scale-in delay-200"></div>
          <div className="orb-2 absolute top-56 -left-24 w-[500px] h-[500px] rounded-full animate-scale-in delay-400"></div>
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.025]" style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
            backgroundSize: '48px 48px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">

            {/* Left Content */}
            <div className="lg:col-span-6 text-center lg:text-left z-10">
              {/* Trust pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full trust-pill text-[#ff4d5a] font-semibold text-xs mb-7 animate-fade-in-up">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff4d5a] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#ff4d5a]"></span>
                </span>
                <span className="section-label text-[#ff4d5a]">Insurance for the Modern Gig Economy</span>
              </div>

              {/* Headline */}
              <h1 className="font-display text-5xl sm:text-6xl lg:text-[68px] text-slate-900 tracking-tight leading-[1.08] mb-6 animate-fade-in-up delay-100">
                Protecting{' '}
                <span className="text-gradient">Delivery</span>
                <br className="hidden sm:block" /> Partners with
                <br className="hidden lg:block" />{' '}
                <em className="not-italic text-gradient-shimmer">Smart Insurance</em>
              </h1>

              <p className="text-base sm:text-lg text-slate-500 mb-9 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light animate-fade-in-up delay-200">
                AI-powered insurance that actually works for you. Automated fraud detection, weather validation, and instant payouts right when you need them.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start animate-fade-in-up delay-300">
                <Link href="/signup"
                  className="btn-primary text-white px-7 py-3.5 rounded-full font-semibold text-base flex items-center justify-center gap-2">
                  Get Started Free
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </Link>
                <a href="#how-it-works"
                  onClick={(e) => scrollToSection(e, 'how-it-works')}
                  className="btn-secondary text-slate-800 px-7 py-3.5 rounded-full font-semibold text-base flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  See How It Works
                </a>
              </div>

              {/* Social proof */}
              <div className="mt-9 flex items-center justify-center lg:justify-start gap-4 animate-fade-in-up delay-400">
                <div className="flex -space-x-2.5">
                  {[1,2,3,4].map(i => (
                    <img key={i} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" src={`https://i.pravatar.cc/100?img=${i}`} alt="User" />
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shadow-sm">+10k</div>
                </div>
                <div className="divider-line w-px h-6 bg-slate-200"></div>
                <div>
                  <div className="flex items-center gap-0.5 mb-0.5">
                    {[...Array(5)].map((_,i) => (
                      <svg key={i} className="w-3 h-3 text-amber-400 fill-amber-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    ))}
                  </div>
                  <p className="text-xs font-medium text-slate-500">Trusted by riders daily</p>
                </div>
              </div>
            </div>

            {/* Right visual */}
            <div className="lg:col-span-6 relative mt-16 lg:mt-0 h-[380px] sm:h-[480px] lg:h-[580px] w-full max-w-full animate-slide-in-right delay-300">
              {/* Main image */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 w-[260px] sm:w-[320px] lg:w-[400px]">
                <div className="relative rounded-[2rem] overflow-hidden hero-image-wrap p-2.5 bg-white/70 backdrop-blur-xl border border-white/60 animate-float">
                  <img
                    src="https://images.unsplash.com/photo-1526367790999-0150786686a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Delivery worker"
                    className="rounded-[1.5rem] w-full h-[280px] lg:h-[360px] object-cover"
                  />
                  {/* Claim badge */}
                  <div className="absolute bottom-7 -left-8 bg-white rounded-2xl px-4 py-3 shadow-2xl border border-slate-100/80 flex items-center gap-3 animate-badge-pop">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-green-500 flex-shrink-0"
                      style={{background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)'}}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Claim Approved</p>
                      <p className="text-sm font-bold text-slate-900">$250 Instant Payout</p>
                    </div>
                  </div>
                  {/* Processing badge */}
                  <div className="absolute -top-4 -right-6 bg-white rounded-xl px-3 py-2 shadow-xl border border-slate-100 flex items-center gap-2 animate-float-delayed-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 relative">
                      <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-60"></span>
                    </div>
                    <span className="text-xs font-semibold text-slate-700">AI Processing</span>
                  </div>
                </div>
              </div>

              {/* Floating food items (Bouncing strictly in place) */}
              <div className="absolute top-[8%] right-[4%] sm:right-[8%] w-24 h-24 sm:w-28 sm:h-28 z-30 pointer-events-none animate-float-slow">
                <img src={burgerImg.src} alt="Burger" className="w-full h-full object-contain drop-shadow-[0_16px_24px_rgba(0,0,0,0.18)]" />
              </div>

              <div className="absolute bottom-[12%] right-[-3%] w-28 h-28 lg:w-36 lg:h-36 z-30 pointer-events-none animate-rotate-slight">
                <img src={pizzaImg.src} alt="Pizza" className="w-full h-full object-contain drop-shadow-[0_16px_24px_rgba(0,0,0,0.18)]" />
              </div>

              <div className="absolute top-[28%] left-[2%] sm:left-[-2%] w-28 h-28 lg:w-32 lg:h-32 z-30 pointer-events-none animate-bounce-subtle">
                <img src={dumplingsImg.src} alt="Dumplings" className="w-full h-full object-contain drop-shadow-[0_12px_18px_rgba(0,0,0,0.12)]" />
              </div>

              {/* Background blob */}
              <svg className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] -z-10 opacity-40" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path fill="rgba(255,77,90,0.06)" d="M47.7,-60.7C62.9,-54.2,77.2,-44.6,85.2,-31.2C93.3,-17.8,95,-0.6,89.5,13.7C84,28,71.2,39.3,58.3,49.2C45.3,59.1,32.3,67.6,17.2,73.1C2.1,78.6,-15.1,81.1,-30.4,76C-45.7,70.9,-59,58.3,-68.2,43.6C-77.4,28.9,-82.5,12.1,-80.4,-3.6C-78.3,-19.2,-69,-33.7,-57.4,-45.1C-45.8,-56.4,-31.8,-64.7,-17.4,-67.2C-2.9,-69.8,12,-66.6,26.4,-63C33.5,-61.2,40.6,-59.4,47.7,-60.7Z" transform="translate(100 100)"></path>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Coverage Details Section */}
      <section id="stats" className="py-8 relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-[-24px]">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16,1,0.3,1] }}
          className="stats-card rounded-3xl p-6 sm:p-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {[
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>,
                color: "#3b82f6", bg: "bg-blue-50 group-hover:bg-blue-500",
                title: "Parametric Triggers", desc: "Auto-payouts based on exact 50mm+ rainfall, 45°C+ heat indexes, and platform downtime."
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>,
                color: "#22c55e", bg: "bg-green-50 group-hover:bg-green-500",
                title: "Instant UPI Payouts", desc: "Approved claims are credited directly to your connected UPI ID within 5 minutes."
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>,
                color: "#ff7a18", bg: "bg-orange-50 group-hover:bg-[#ff7a18]",
                title: "Affordable & Fast", desc: "Start protecting your income loop securely from just ₹29/week with a 5-step secure KYC."
              }
            ].map((detail, i) => (
              <div key={i} className="flex flex-col items-center text-center pt-6 md:pt-0 md:px-8 hover:scale-105 transition-transform duration-500 ease-out group cursor-default">
                <div className={`w-12 h-12 ${detail.bg} rounded-2xl flex items-center justify-center mb-4 transition-colors duration-300`}>
                  <svg className={`w-6 h-6 text-[${detail.color}] group-hover:text-white transition-colors duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {detail.icon}
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">
                  {detail.title}
                </h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{detail.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-28 bg-[#fafaf8] relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="section-label text-[#ff4d5a] mb-3">Why Choose Us</p>
            <h3 className="font-display text-4xl md:text-5xl text-slate-900 mb-5 leading-tight">
              Smarter insurance for<br/>a <em className="not-italic text-gradient">faster world</em>
            </h3>
            <p className="text-base text-slate-500 leading-relaxed">We leverage AI and real-time data to make claims processing instantaneous, transparent, and hassle-free.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { emoji: "⚡", title: "Instant Claims", desc: "Submit your claim via our app and get approved in seconds, not days. We eliminated the paperwork.", delay: 0.1 },
              { emoji: "🤖", title: "AI Verification", desc: "Advanced computer vision automatically verifies incident photos to prevent fraud instantly.", delay: 0.2 },
              { emoji: "🌦️", title: "Weather Validation", desc: "Real-time API integrations validate severe weather conditions automatically for climate-related claims.", delay: 0.3 },
              { emoji: "💰", title: "Automated Payouts", desc: "Once approved, your payout is automatically routed to your connected bank account instantly.", delay: 0.4 },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: f.delay, ease: [0.16,1,0.3,1] }}
                className="feature-card rounded-3xl p-7 cursor-default group"
              >
                <div className="w-14 h-14 bg-slate-50 group-hover:bg-white rounded-2xl flex items-center justify-center mb-6 text-2xl shadow-sm group-hover:shadow-md group-hover:-rotate-3 group-hover:scale-110 transition-all duration-500">
                  {f.emoji}
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-2.5">{f.title}</h4>
                <p className="text-slate-500 leading-relaxed text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="section-label text-[#ff4d5a] mb-3">Simple Process</p>
            <h3 className="font-display text-4xl md:text-5xl text-slate-900 leading-tight">
              Three steps to<br/><em className="not-italic text-gradient">peace of mind</em>
            </h3>
          </div>

          <div className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-[52px] left-[20%] right-[20%] h-px step-connector -z-0 rounded-full opacity-70"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center relative z-10">
              {[
                { n: "1", color: "#ff4d5a", border: "border-[#ff4d5a]/20 hover:border-[#ff4d5a]/50", title: "Submit Claim", desc: "Easily log your incident in our app with a few taps. Upload photos directly from your phone.", delay: 0.1 },
                { n: "2", color: "#ff7a18", border: "border-[#ff7a18]/20 hover:border-[#ff7a18]/50", title: "AI Validates Data", desc: "Our algorithms cross-check images, location, and weather data instantly for fast approval.", delay: 0.2 },
                { n: "3", color: "#22c55e", border: "border-green-200 hover:border-green-400", title: "Instant Payout", desc: "Funds are released automatically to your account so you can get back to what matters.", delay: 0.3 },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: s.delay, ease: [0.16,1,0.3,1] }}
                  className="flex flex-col items-center group cursor-default"
                >
                  <div className={`w-[52px] h-[52px] bg-white border-2 ${s.border} rounded-full flex items-center justify-center font-bold text-lg shadow-md mb-7 group-hover:scale-110 transition-all duration-500`}
                    style={{color: s.color}}>
                    {s.n}
                  </div>
                  <div className="bg-slate-50 group-hover:bg-white rounded-2xl p-6 w-full border border-slate-100 group-hover:border-slate-200 group-hover:shadow-lg transition-all duration-400">
                    <h4 className="text-base font-bold text-slate-900 mb-2">{s.title}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16,1,0.3,1] }}
            className="cta-section rounded-[2rem] p-10 sm:p-16 text-center relative overflow-hidden"
          >
            {/* Glow orbs */}
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-[100px] opacity-25 transform translate-x-1/2 -translate-y-1/2"
              style={{background: 'radial-gradient(circle, #ff4d5a, transparent)'}}></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full blur-[100px] opacity-25 transform -translate-x-1/2 translate-y-1/2"
              style={{background: 'radial-gradient(circle, #ff7a18, transparent)'}}></div>
            {/* Subtle grid */}
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}></div>

            <div className="relative z-10">
              <p className="section-label text-rose-400 mb-4">Start Today</p>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-white mb-5 leading-tight">
                Ready to secure<br/>your deliveries?
              </h2>
              <p className="text-slate-400 text-base mb-10 max-w-xl mx-auto leading-relaxed">
                Join thousands of gig workers already using our platform to protect their income and livelihood.
              </p>
              <Link href="/signup"
                className="inline-flex items-center gap-2 btn-primary text-white px-9 py-4 rounded-full font-semibold text-base">
                Get Started for Free
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                  style={{background: 'linear-gradient(135deg, #ff4d5a, #ff7a18)'}}>
                  G
                </div>
                <span className="font-bold text-lg tracking-tight text-slate-900">GigShield</span>
              </div>
              <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
                Smarter, faster, AI-driven insurance designed specifically for the gig economy workforce.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4 text-sm">Product</h4>
              <ul className="space-y-3">
                {["Features","Pricing","How it works"].map(item => (
                  <li key={item}><a href="#" className="text-sm text-slate-400 hover:text-rose-500 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4 text-sm">Company</h4>
              <ul className="space-y-3">
                {["About","Contact","GitHub"].map(item => (
                  <li key={item}><a href="#" className="text-sm text-slate-400 hover:text-rose-500 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="divider-line mb-6"></div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">&copy; {new Date().getFullYear()} GigShield. All rights reserved.</p>
            <div className="flex gap-5 text-sm text-slate-400">
              <a href="#" className="hover:text-slate-800 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-800 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 