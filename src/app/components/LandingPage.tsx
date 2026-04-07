"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import burgerImg from './burger.png';
import pizzaImg from './pizza.png';
import dumplingsImg from './dumplings.png';

export default function Home() {
  const primaryColor = "#ff4d5a";
  const secondaryColor = "#ff7a18";
  return (
    <div className="min-h-screen bg-gray-50/[0.4] font-sans selection:bg-rose-500 selection:text-white scroll-smooth overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-2 md:top-4 inset-x-0 mx-auto max-w-7xl px-4 z-50 transition-all duration-300">
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-lg shadow-slate-200/50 rounded-2xl md:rounded-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 bg-gradient-to-tr from-[#ff4d5a] to-[#ff7a18] rounded-xl md:rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#ff4d5a]/20 group-hover:scale-105 group-hover:rotate-3 group-hover:shadow-[#ff4d5a]/40 transition-all duration-300">
                G
              </div>
              <span className="font-extrabold text-xl md:text-2xl tracking-tight text-slate-900 group-hover:text-[#ff4d5a] transition-colors duration-300">GigShield</span>
            </div>
            
            <div className="hidden lg:flex items-center p-1 bg-slate-100/50 rounded-full border border-slate-200/50">
              <a href="#how-it-works" className="px-5 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-white rounded-full font-semibold transition-all shadow-sm shadow-transparent hover:shadow-slate-200">How it Works</a>
              <a href="#features" className="px-5 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-white rounded-full font-semibold transition-all shadow-sm shadow-transparent hover:shadow-slate-200">Features</a>
              <a href="#stats" className="px-5 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-white rounded-full font-semibold transition-all shadow-sm shadow-transparent hover:shadow-slate-200">Impact</a>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <Link href="/login" className="hidden sm:inline-flex px-4 md:px-5 py-2.5 text-slate-600 hover:text-slate-900 font-semibold text-sm transition-colors">Log in</Link>
              <Link href="/signup" className="bg-slate-900 hover:bg-[#ff4d5a] text-white px-5 md:px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 shadow-md shadow-slate-900/20 hover:shadow-[#ff4d5a]/30 hover:-translate-y-0.5">
                Join Now
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
          @keyframes float-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
          }
          @keyframes rotate-slight {
            0%, 100% { transform: rotate(0deg) translateY(0); }
            50% { transform: rotate(6deg) translateY(-10px); }
          }
          @keyframes bounce-subtle {
            0%, 100% { transform: translateY(0); }
            40% { transform: translateY(-25px); }
            60% { transform: translateY(-12px); }
            80% { transform: translateY(-18px); }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideInRight {
            from { opacity: 0; transform: translateX(50px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          .animate-float-slow {
            animation: float-slow 7s ease-in-out infinite;
          }
          .animate-rotate-slight {
            animation: rotate-slight 8s ease-in-out infinite;
          }
          .animate-bounce-subtle {
            animation: bounce-subtle 5s ease-in-out infinite;
          }
          .animate-float-delayed-1 {
            animation: float 5s ease-in-out infinite;
            animation-delay: 1s;
          }
          .animate-float-delayed-2 {
            animation: float 7s ease-in-out infinite;
            animation-delay: 2s;
          }
          .animate-fade-in-up {
            animation: fadeInUp 0.8s ease-out forwards;
            opacity: 0;
          }
          .animate-slide-in-right {
            animation: slideInRight 0.8s ease-out forwards;
            opacity: 0;
          }
          .animate-scale-in {
            animation: scaleIn 0.6s ease-out forwards;
            opacity: 0;
          }
          .delay-100 { animation-delay: 100ms; }
          .delay-200 { animation-delay: 200ms; }
          .delay-300 { animation-delay: 300ms; }
          .delay-400 { animation-delay: 400ms; }
          .delay-500 { animation-delay: 500ms; }
        `}} />
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-rose-200 rounded-full blur-3xl opacity-50 animate-scale-in delay-200"></div>
          <div className="absolute top-40 -left-20 w-72 h-72 bg-orange-200 rounded-full blur-3xl opacity-50 animate-scale-in delay-400"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ff4d5a]/10 border border-[#ff4d5a]/20 text-[#ff4d5a] font-medium text-sm mb-6 shadow-sm animate-fade-in-up">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff4d5a] py-1 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff4d5a]"></span>
                </span>
                Insurance for the Modern Gig Economy
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6 animate-fade-in-up delay-100">
                Protecting Delivery <br className="hidden sm:block" />
                Partners with <br className="hidden lg:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4d5a] to-[#ff7a18]">Smart Insurance</span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light mt-4 animate-fade-in-up delay-200">
                AI-powered insurance that actually works for you. Automated fraud detection, weather validation, and instant payouts right when you need them.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up delay-300">
                <Link href="/signup" className="bg-gradient-to-r from-[#ff4d5a] to-[#ff7a18] hover:from-[#ff4d5a] hover:to-[#ff7a18] text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 shadow-[0_10px_20px_-10px_rgba(255,77,90,0.5)] hover:shadow-[0_20px_25px_-5px_rgba(255,77,90,0.4)] hover:-translate-y-1 flex items-center justify-center gap-2">
                  Get Started
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </Link>
                <a href="#how-it-works" className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 shadow-sm flex items-center justify-center hover:-translate-y-1 hover:shadow-md">
                  Learn More
                </a>
              </div>
              
              <div className="mt-10 flex items-center justify-center lg:justify-start gap-4 animate-fade-in-up delay-400">
                <div className="flex -space-x-3">
                  <img className="w-10 h-10 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=1" alt="User" />
                  <img className="w-10 h-10 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=2" alt="User" />
                  <img className="w-10 h-10 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=3" alt="User" />
                  <img className="w-10 h-10 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=4" alt="User" />
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">+10k</div>
                </div>
                <div className="text-sm font-medium text-gray-500">
                  Trusted by riders daily
                </div>
              </div>
            </div>

            {/* Right floating items */}
            <div className="lg:col-span-6 relative mt-16 lg:mt-0 h-[400px] sm:h-[500px] lg:h-[600px] perspective-1000 z-10 w-full max-w-full animate-slide-in-right delay-300">
               {/* Main Center Image */}
               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 w-[280px] sm:w-[350px] lg:w-[450px]">
                 <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-rose-900/20 p-2 bg-white/60 backdrop-blur-xl border border-white/50 animate-float transition-all duration-500 hover:shadow-rose-900/30">
                    <img src="https://images.unsplash.com/photo-1526367790999-0150786686a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Delivery worker" className="rounded-[1.2rem] w-full h-[300px] lg:h-[400px] object-cover" />
                    
                    {/* Floating badge */}
                    <div className="absolute bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl shadow-green-900/10 border border-slate-100 flex items-center gap-3 animate-float-delayed-1 transition-all duration-300 hover:scale-105 cursor-default">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Claim Approved</p>
                        <p className="text-sm font-bold text-slate-900">$250 Instant Payout</p>
                      </div>
                    </div>
                 </div>
               </div>

               {/* Floating Food 1 */}
               <div className="absolute top-[10%] right-[5%] sm:right-[10%] w-24 h-24 sm:w-32 sm:h-32 z-30 drop-shadow-[0_20px_20px_rgba(255,77,90,0.3)] animate-float-slow hover:scale-110 transition-transform duration-300 cursor-pointer">
                 <img src={burgerImg.src} alt="Burger" className="w-full h-full object-contain filter drop-shadow-[0_20px_20px_rgba(0,0,0,0.15)]" />
               </div>

               {/* Floating Food 2 */}
               <div className="absolute bottom-[15%] sm:bottom-[20%] right-[-5%] sm:right-[-5%] w-28 h-28 lg:w-40 lg:h-40 z-30 drop-shadow-[0_20px_20px_rgba(255,122,24,0.3)] animate-rotate-slight hover:scale-110 transition-transform duration-300 cursor-pointer">
                 <img src={pizzaImg.src} alt="Pizza" className="w-full h-full object-contain filter drop-shadow-[0_20px_20px_rgba(0,0,0,0.15)]" />
               </div>

               {/* Floating Item 3 */}
               <div className="absolute top-[30%] left-[-5%] sm:left-[-10%] w-20 h-20 lg:w-28 lg:h-28 z-30 drop-shadow-2xl animate-bounce-subtle hover:scale-110 transition-transform duration-300 cursor-pointer">
                 <img src={dumplingsImg.src} alt="Dumplings" className="w-full h-full object-contain filter drop-shadow-[0_15px_15px_rgba(0,0,0,0.1)]" />
               </div>
               
               {/* Abstract curve */}
               <svg className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] -z-10 text-rose-50 opacity-60" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <path fill="currentColor" d="M47.7,-60.7C62.9,-54.2,77.2,-44.6,85.2,-31.2C93.3,-17.8,95,-0.6,89.5,13.7C84,28,71.2,39.3,58.3,49.2C45.3,59.1,32.3,67.6,17.2,73.1C2.1,78.6,-15.1,81.1,-30.4,76C-45.7,70.9,-59,58.3,-68.2,43.6C-77.4,28.9,-82.5,12.1,-80.4,-3.6C-78.3,-19.2,-69,-33.7,-57.4,-45.1C-45.8,-56.4,-31.8,-64.7,-17.4,-67.2C-2.9,-69.8,12,-66.6,26.4,-63C33.5,-61.2,40.6,-59.4,47.7,-60.7Z" transform="translate(100 100) scale(1.1)"></path>
               </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-12 relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-[-40px]">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-white/90 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100 p-8 sm:p-10 backdrop-blur-2xl transition-all duration-500 hover:shadow-[0_20px_50px_-12px_rgba(255,77,90,0.15)]"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="flex flex-col items-center justify-center pt-4 md:pt-0 hover:scale-105 transition-transform duration-500 ease-out group">
              <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mb-4 text-[#ff4d5a] group-hover:bg-[#ff4d5a] group-hover:text-white transition-colors duration-300">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              </div>
              <h3 className="text-4xl font-extrabold text-slate-900 mb-1">
                <CountUp end={300000} duration={2.5} separator="," enableScrollSpy scrollSpyOnce />+
              </h3>
              <p className="text-slate-500 font-medium">Workers Protected</p>
            </div>
            
            <div className="flex flex-col items-center justify-center pt-8 md:pt-0 hover:scale-105 transition-transform duration-500 ease-out group">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-4 text-[#ff7a18] group-hover:bg-[#ff7a18] group-hover:text-white transition-colors duration-300">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>
              <h3 className="text-4xl font-extrabold text-slate-900 mb-1">
                <CountUp end={800} duration={2.5} separator="," enableScrollSpy scrollSpyOnce />+
              </h3>
              <p className="text-slate-500 font-medium">Cities Covered</p>
            </div>
            
            <div className="flex flex-col items-center justify-center pt-8 md:pt-0 hover:scale-105 transition-transform duration-500 ease-out group">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-4 text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors duration-300">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 className="text-4xl font-extrabold text-slate-900 mb-1">
                <CountUp end={1} duration={2} enableScrollSpy scrollSpyOnce />M+
              </h3>
              <p className="text-slate-500 font-medium">Claims Processed</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-[#ff4d5a] font-bold tracking-wide uppercase text-sm mb-3">Why Choose Us</h2>
            <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6">Smarter insurance for a faster world</h3>
            <p className="text-lg text-slate-500">We leverage AI and real-time data to make claims processing instantaneous, transparent, and hassle-free.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-slate-50 rounded-3xl p-8 hover:shadow-[0_20px_40px_-15px_rgba(255,77,90,0.15)] hover:bg-white hover:-translate-y-2 transition-all duration-500 border border-transparent hover:border-rose-100 group cursor-default"
            >
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 text-3xl group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                ⚡
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Instant Claims</h4>
              <p className="text-slate-500 leading-relaxed text-sm">Submit your claim via our app and get approved in seconds, not days. We eliminated the paperwork.</p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-slate-50 rounded-3xl p-8 hover:shadow-[0_20px_40px_-15px_rgba(255,122,24,0.15)] hover:bg-white hover:-translate-y-2 transition-all duration-500 border border-transparent hover:border-orange-100 group cursor-default"
            >
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 text-3xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                🤖
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">AI Verification</h4>
              <p className="text-slate-500 leading-relaxed text-sm">Advanced computer vision automatically verifies incident photos to prevent fraud instantly.</p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-slate-50 rounded-3xl p-8 hover:shadow-[0_20px_40px_-15px_rgba(14,165,233,0.15)] hover:bg-white hover:-translate-y-2 transition-all duration-500 border border-transparent hover:border-sky-100 group cursor-default"
            >
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 text-3xl group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                🌦️
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Weather Validation</h4>
              <p className="text-slate-500 leading-relaxed text-sm">Real-time API integrations validate severe weather conditions automatically for climate-related claims.</p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-slate-50 rounded-3xl p-8 hover:shadow-[0_20px_40px_-15px_rgba(34,197,94,0.15)] hover:bg-white hover:-translate-y-2 transition-all duration-500 border border-transparent hover:border-green-100 group cursor-default"
            >
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 text-3xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                💰
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Automated Payouts</h4>
              <p className="text-slate-500 leading-relaxed text-sm">Once approved, your payout is automatically routed to your connected bank account instantly.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-[#ff4d5a] font-bold tracking-wide uppercase text-sm mb-3">Simple Process</h2>
            <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6">How it works</h3>
          </div>

          <div className="relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-[40%] left-0 w-full h-1 bg-gradient-to-r from-[#ff4d5a]/20 via-[#ff7a18]/20 to-green-200 -z-10 rounded-full opacity-60"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center relative z-10">
              {/* Step 1 */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex flex-col items-center group"
              >
                <div className="w-20 h-20 bg-white border-[4px] border-[#ff4d5a]/20 rounded-full flex items-center justify-center text-[#ff4d5a] font-bold text-2xl shadow-lg mb-6 group-hover:scale-110 group-hover:border-[#ff4d5a]/40 transition-all duration-500">
                  1
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">Submit Claim</h4>
                <p className="text-slate-500 text-sm max-w-xs">Easily log your incident in our app with a few taps. Upload photos directly from your phone.</p>
              </motion.div>

              {/* Step 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col items-center group"
              >
                <div className="w-20 h-20 bg-white border-[4px] border-[#ff7a18]/20 rounded-full flex items-center justify-center text-[#ff7a18] font-bold text-2xl shadow-lg mb-6 group-hover:scale-110 group-hover:border-[#ff7a18]/40 transition-all duration-500">
                  2
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">AI Validates Data</h4>
                <p className="text-slate-500 text-sm max-w-xs">Our algorithms cross-check images, location, and weather data instantly for fast approval.</p>
              </motion.div>

              {/* Step 3 */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col items-center group"
              >
                <div className="w-20 h-20 bg-white border-[4px] border-green-100 rounded-full flex items-center justify-center text-green-500 font-bold text-2xl shadow-lg mb-6 group-hover:scale-110 group-hover:border-green-300 transition-all duration-500">
                  3
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">Instant Payout</h4>
                <p className="text-slate-500 text-sm max-w-xs">Funds are released automatically to your account so you can get back to what matters.</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-[2.5rem] p-10 sm:p-16 text-center shadow-2xl relative overflow-hidden"
          >
            {/* Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff4d5a] rounded-full blur-[80px] opacity-30 transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ff7a18] rounded-full blur-[80px] opacity-30 transform -translate-x-1/2 translate-y-1/2"></div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-6 relative z-10">
              Ready to secure your deliveries?
            </h2>
            <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto relative z-10">
              Join thousands of gig workers already using our platform to protect their income and livelihood.
            </p>
            <Link href="/signup" className="inline-block bg-gradient-to-r from-[#ff4d5a] to-[#ff7a18] hover:from-[#ff4d5a] hover:to-[#ff7a18] text-white px-10 py-5 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-xl hover:shadow-[#ff4d5a]/40 relative z-10">
              Get Started for Free
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-tr from-rose-500 to-rose-400 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  G
                </div>
                <span className="font-bold text-xl tracking-tight text-gray-900">GigGuard</span>
              </div>
              <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                Smater, faster, AI-driven insurance designed specifically for the gig economy workforce.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><a href="#" className="hover:text-rose-500 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-rose-500 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-rose-500 transition-colors">How it works</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><a href="#" className="hover:text-rose-500 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-rose-500 transition-colors">Contact</a></li>
                <li><a href="https://github.com" className="hover:text-rose-500 transition-colors">GitHub</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} GigGuard. All rights reserved.</p>
            <div className="flex gap-4 text-sm text-gray-400">
              <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Float animation definition in style block */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}} />
    </div>
  );
}