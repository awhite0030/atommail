"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Terminal, Shield, Zap, Key, ChevronRight } from "lucide-react";

const FADE_DOWN = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" },
};

const STAGGER = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-zinc-800 selection:text-white overflow-hidden relative">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
              <div className="w-3 h-3 bg-black rounded-sm" />
            </div>
            <span className="font-semibold tracking-tight text-sm">Atommail</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
            <a href="#products" className="hover:text-white transition-colors">Products</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#api" className="hover:text-white transition-colors">API</a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="text-sm text-zinc-400 hover:text-white transition-colors">
              Log in
            </button>
            <button className="text-sm bg-white text-black px-4 py-2 rounded-md font-medium hover:scale-105 active:scale-95 transition-all duration-300">
              Sign up
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24 relative z-10">
        <motion.div
          variants={STAGGER}
          initial="initial"
          animate="animate"
          className="max-w-3xl mx-auto text-center"
        >
          <motion.div variants={FADE_DOWN} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-zinc-300 mb-8 backdrop-blur-sm">
            <Zap className="w-3 h-3 text-purple-400" />
            <span>Now with instant automated delivery</span>
          </motion.div>
          <motion.h1 variants={FADE_DOWN} className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
            Premium AI Access, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-300 to-zinc-600">
              Instantly Delivered.
            </span>
          </motion.h1>
          <motion.p variants={FADE_DOWN} className="text-lg text-zinc-400 mb-10 max-w-xl mx-auto leading-relaxed">
            The high-end digital storefront for automated AI software accounts. Get instant access to Cursor Pro, ChatGPT Business, Claude Max, and Gemini.
          </motion.p>
          <motion.div variants={FADE_DOWN} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded-md font-medium hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all duration-300">
              Explore Products
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-md font-medium border border-white/10 bg-transparent text-white hover:bg-white/5 hover:border-white/20 hover:scale-105 active:scale-95 transition-all duration-300">
              <Terminal className="w-4 h-4" />
              API Documentation
            </button>
          </motion.div>
        </motion.div>

        {/* Bento Box Features */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6" id="features">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-2 group relative p-8 rounded-2xl bg-zinc-950 border border-white/5 hover:border-white/20 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Zap className="w-6 h-6 text-zinc-400 mb-6 group-hover:text-white transition-colors" />
            <h3 className="text-xl font-semibold tracking-tight mb-2">Automated Instant Delivery</h3>
            <p className="text-zinc-400 leading-relaxed max-w-md">
              No manual verification required. As soon as your payment clears, our system provisions and delivers your premium account credentials securely via encrypted channels.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group relative p-8 rounded-2xl bg-zinc-950 border border-white/5 hover:border-white/20 transition-all duration-500 overflow-hidden"
          >
            <Shield className="w-6 h-6 text-zinc-400 mb-6 group-hover:text-white transition-colors" />
            <h3 className="text-xl font-semibold tracking-tight mb-2">Enterprise Security</h3>
            <p className="text-zinc-400 leading-relaxed">
              All credentials are end-to-end encrypted. We never store raw passwords after delivery.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="group relative p-8 rounded-2xl bg-zinc-950 border border-white/5 hover:border-white/20 transition-all duration-500 overflow-hidden"
          >
            <Key className="w-6 h-6 text-zinc-400 mb-6 group-hover:text-white transition-colors" />
            <h3 className="text-xl font-semibold tracking-tight mb-2">API First</h3>
            <p className="text-zinc-400 leading-relaxed">
              Integrate our provisioning engine directly into your own infrastructure with our REST API.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="md:col-span-2 group relative p-8 rounded-2xl bg-zinc-950 border border-white/5 hover:border-white/20 transition-all duration-500 overflow-hidden flex flex-col justify-end min-h-[240px]"
          >
            <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent border-l border-white/5 hidden md:block" />
            <div className="relative z-10 max-w-md">
              <h3 className="text-xl font-semibold tracking-tight mb-2">24/7 SLA Guarantee</h3>
              <p className="text-zinc-400 leading-relaxed">
                Our infrastructure is built for reliability. Expect flawless uptime and instant support through our developer command center.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Product Preview */}
        <div className="mt-32" id="products">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Premium Integrations</h2>
              <p className="text-zinc-400">Select an account tier for instant provisioning.</p>
            </div>
            <a href="#" className="hidden sm:flex items-center gap-1 text-sm font-medium hover:text-zinc-300 transition-colors">
              View all products <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Cursor Pro", price: "$20", desc: "Advanced AI code editor features." },
              { name: "ChatGPT Biz", price: "$60", desc: "Enterprise-grade conversational AI." },
              { name: "Claude Max", price: "$40", desc: "Extended context windows & rate limits." },
              { name: "Gemini Adv", price: "$25", desc: "Google's most capable AI model." }
            ].map((product, i) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group p-6 rounded-xl bg-zinc-950 border border-white/5 hover:border-white/20 transition-all duration-300 cursor-pointer flex flex-col"
              >
                <div className="flex justify-between items-start mb-12">
                  <h4 className="font-medium">{product.name}</h4>
                  <span className="text-sm text-zinc-500">{product.price}/mo</span>
                </div>
                <p className="text-sm text-zinc-400 mt-auto mb-6">{product.desc}</p>
                <div className="w-full h-[1px] bg-white/10 group-hover:bg-white/20 transition-colors mb-4" />
                <span className="text-xs font-medium flex items-center justify-between text-zinc-400 group-hover:text-white transition-colors">
                  Provision Now <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-32 bg-black">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-zinc-800 rounded-sm flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-black rounded-sm" />
            </div>
            <span className="font-medium tracking-tight text-sm text-zinc-400">Atommail Inc.</span>
          </div>
          <div className="flex gap-6 text-sm text-zinc-500">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">System Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
