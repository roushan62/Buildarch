/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  Building2, 
  Paintbrush, 
  FileSpreadsheet, 
  Calculator, 
  Mic, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  ArrowUpRight 
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: (initialPrompt?: string) => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [teaserPrompt, setTeaserPrompt] = useState('Modern Japandi living room with wooden slats and biophilic elements');

  const handleSubmitTeaser = (e: React.FormEvent) => {
    e.preventDefault();
    onGetStarted(teaserPrompt);
  };

  const bentoItems = [
    {
      icon: <Calculator className="w-6 h-6 text-emerald-400" />,
      title: "Intelligent Material Estimator",
      description: "Instantly translate building heights, areas, and wall dimensions into exact counts of cement, brick, sand, steel, and paints with zero wastage.",
      badge: "Smart Engine"
    },
    {
      icon: <FileSpreadsheet className="w-6 h-6 text-blue-400" />,
      title: "BOQ & Spreadsheet Engine",
      description: "An interactive, Excel-style grid designed directly into the workspace. Edit quantities, override rates, and dynamically compute GST and overall budgets.",
      badge: "Real-time Grid"
    },
    {
      icon: <Paintbrush className="w-6 h-6 text-purple-400" />,
      title: "AI Interior & Exterior Renders",
      description: "Describe material finishes, style templates, and layout goals to generate ultra-realistic high-resolution interior concepts and architectural elevations.",
      badge: "FLUX Visualizer"
    },
    {
      icon: <Mic className="w-6 h-6 text-red-400" />,
      title: "Hands-Free Voice DPR",
      description: "Record daily site updates or labor counts verbally. Speech-to-text turns spoken progress reports directly into structured, actionable DPR logs.",
      badge: "Whisper STT"
    },
    {
      icon: <Layers className="w-6 h-6 text-amber-400" />,
      title: "Inventory & Payroll Kanban",
      description: "Track raw supplies, alert stock re-order thresholds, and manage worker payroll schedules in a unified Kanban and itemized spreadsheet switcher.",
      badge: "Enterprise ERP"
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-teal-400" />,
      title: "Audit-Ready GST & Invoices",
      description: "Generate professional GST compliant invoices and purchase orders using strict double-precision monetary float parsing to eliminate rounding errors.",
      badge: "Financial Shield"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0D14] text-gray-100 overflow-x-hidden selection:bg-emerald-500/30 selection:text-emerald-300 font-sans">
      {/* Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden">
        <div className="absolute top-[-200px] left-[10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-[-100px] right-[10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Navigation Header */}
      <header className="border-b border-gray-800/40 backdrop-blur-md sticky top-0 z-50 bg-[#0A0D14]/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Building2 className="w-5 h-5 text-[#0A0D14]" />
            </div>
            <span className="text-xl font-semibold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              BuildArch Platform
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm text-gray-400 hover:text-white cursor-pointer hidden md:inline transition-colors">Documentation</span>
            <span className="text-sm text-gray-400 hover:text-white cursor-pointer hidden md:inline transition-colors">Enterprise Security</span>
            <button 
              onClick={() => onGetStarted()}
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 rounded-xl transition-all flex items-center gap-2 group cursor-pointer"
            >
              Sign In
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-16 pb-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6 uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen AI Workspace for Contractors & Designers
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-tight md:leading-none"
          >
            Architecting Excellence.<br/>
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              Automating Execution.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-gray-400 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto font-light"
          >
            A high-fidelity full-stack operations engine. Translate chat prompts directly into precise estimates, live spreadsheet BOQs, automated GST billing, and photorealistic AI room elevations.
          </motion.p>

          {/* Interactive Prompter Teaser */}
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            onSubmit={handleSubmitTeaser}
            className="p-1.5 rounded-2xl bg-gray-900/50 border border-gray-800/80 backdrop-blur shadow-2xl flex flex-col sm:flex-row items-stretch gap-2.5 max-w-2xl mx-auto"
          >
            <div className="flex-1 flex items-center gap-3 px-3">
              <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
              <input 
                type="text" 
                value={teaserPrompt}
                onChange={(e) => setTeaserPrompt(e.target.value)}
                placeholder="Ask to estimate materials, render rooms, draft invoices..."
                className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-gray-500"
              />
            </div>
            <button 
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-[#07090E] font-semibold rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 group shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 cursor-pointer shrink-0"
            >
              Get Started Free
              <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.form>
        </div>

        {/* Feature Grid / Bento Concept */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {bentoItems.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="relative p-6 rounded-2xl bg-gray-900/20 border border-gray-800/40 hover:border-emerald-500/30 hover:bg-gray-900/40 transition-all duration-300 group overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gray-950/80 border border-gray-800 group-hover:border-emerald-500/20 transition-colors shadow-inner">
                  {item.icon}
                </div>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 tracking-wider uppercase">
                  {item.badge}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-2 tracking-tight group-hover:text-emerald-300 transition-colors">
                {item.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed font-light">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Big Preview Area */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative rounded-3xl bg-gradient-to-b from-gray-900/40 to-gray-950/80 border border-gray-800/60 p-6 md:p-12 overflow-hidden shadow-2xl"
        >
          {/* Subtle decoration */}
          <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <span className="text-xs font-semibold text-indigo-400 tracking-wider uppercase bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20 mb-4 inline-block">
                Architectural Showcase
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight leading-tight">
                One Conversational Interface.<br/>
                Infinite Operations.
              </h2>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-6 font-light">
                No more jumping between scattered Excel files, estimating calculators, and interior rendering tools. BuildArch acts as your single enterprise portal. Upload blueprint PDFs, chat about site progress, and let AI maintain your dynamic spreadsheets and high-res models automatically.
              </p>
              <ul className="space-y-3.5 mb-8 text-sm">
                <li className="flex items-center gap-3 text-gray-300 font-light">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">✓</div>
                  Automated BOQ extraction from engineering text
                </li>
                <li className="flex items-center gap-3 text-gray-300 font-light">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">✓</div>
                  Interactive real-time cell computations with precise floating parsing
                </li>
                <li className="flex items-center gap-3 text-gray-300 font-light">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">✓</div>
                  State-of-the-art FLUX imaging for fast interior previews
                </li>
              </ul>
              <button 
                onClick={() => onGetStarted()}
                className="px-6 py-3.5 bg-gray-900 border border-gray-800 hover:border-emerald-500/30 text-white hover:text-emerald-400 font-medium rounded-xl text-sm transition-all duration-200 flex items-center gap-2 cursor-pointer group"
              >
                Launch Claude-Style Workspace
                <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Interactive Mock Workspace Preview */}
            <div className="lg:col-span-7 bg-gray-950 rounded-2xl border border-gray-800/80 p-4 shadow-3xl overflow-hidden relative group">
              <div className="flex items-center justify-between border-b border-gray-800/60 pb-3 mb-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/40" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/40" />
                  <div className="w-3 h-3 rounded-full bg-green-500/40" />
                </div>
                <span className="text-xs text-gray-500 font-mono tracking-wider">WORKSPACE_STAGE_PREVIEW</span>
                <span className="w-4" />
              </div>

              {/* Grid Mock of Claude Dashboard */}
              <div className="grid grid-cols-12 gap-3 min-h-[300px]">
                {/* Left Mini Sidebar */}
                <div className="col-span-3 border-r border-gray-900 pr-2 flex flex-col gap-2">
                  <div className="h-6 w-full bg-gray-900/60 rounded-md" />
                  <div className="h-6 w-2/3 bg-gray-900/30 rounded-md" />
                  <div className="mt-auto space-y-2">
                    <div className="h-5 w-full bg-gray-900/20 rounded-md" />
                    <div className="h-5 w-full bg-gray-900/20 rounded-md" />
                  </div>
                </div>

                {/* Center Mini Chat */}
                <div className="col-span-5 flex flex-col gap-3 justify-end px-1">
                  <div className="p-2 rounded-xl bg-gray-900/40 border border-gray-800/50 text-[11px] text-gray-400">
                    "Please create an interior design preview for a luxury Japandi master bed, and draft the preliminary bill of quantities with GST."
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
                    "I've generated a stunning Japandi rendering in your design panel and loaded the editable BOQ table with active tax rates."
                  </div>
                  <div className="h-8 w-full bg-gray-900 border border-gray-800 rounded-lg" />
                </div>

                {/* Right Mini Artifact */}
                <div className="col-span-4 bg-gray-900/40 border border-gray-800/60 rounded-xl p-2.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                    <span className="text-[10px] font-semibold text-emerald-400 font-mono">BOQ_SHEET_V1</span>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  </div>
                  <div className="space-y-1.5 py-2">
                    <div className="flex justify-between text-[9px] text-gray-500 border-b border-gray-950 pb-1">
                      <span>Cement (Sacks)</span>
                      <span className="font-semibold text-white">450 qty</span>
                    </div>
                    <div className="flex justify-between text-[9px] text-gray-500 border-b border-gray-950 pb-1">
                      <span>Teak Panels</span>
                      <span className="font-semibold text-white">120 sqf</span>
                    </div>
                    <div className="flex justify-between text-[9px] text-gray-500 border-b border-gray-950 pb-1">
                      <span>Glass partitions</span>
                      <span className="font-semibold text-white">15 qty</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-800 flex justify-between text-[10px]">
                    <span className="text-gray-400 font-medium">Est. Cost</span>
                    <span className="text-emerald-400 font-bold font-mono">$18,450.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-900 bg-gray-950/40 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="font-semibold text-gray-300">BuildArch Platform</span>
          </div>
          <p>© 2026 BuildArch Enterprise. Standard Lovable & Claude Layout Architecture. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
