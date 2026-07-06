/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Paperclip, 
  Mic, 
  MicOff, 
  Sparkles, 
  Building2, 
  Calculator, 
  FileSpreadsheet, 
  Paintbrush, 
  Check, 
  User, 
  ArrowUpRight 
} from 'lucide-react';
import { Message, ArtifactType } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string, attachment?: { name: string; type: string; base64: string }) => void;
  onLaunchArtifact: (type: ArtifactType) => void;
}

export default function ChatInterface({
  messages,
  isLoading,
  onSendMessage,
  onLaunchArtifact
}: ChatInterfaceProps) {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [attachedFile, setAttachedFile] = useState<{ name: string; type: string; base64: string } | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const recordingTimerRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle Speech recognition (OpenAI Whisper simulation using Web Speech API)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInputText((prev) => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + finalTranscript);
        }
      };

      rec.onerror = (err: any) => {
        console.error('Speech recognition error:', err);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  const handleToggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported on your current browser. Please use Chrome or Safari.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
      setRecordingTime(0);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        setRecordingTime(0);
        recordingTimerRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setAttachedFile({
        name: file.name,
        type: file.type,
        base64: base64
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = () => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !attachedFile) return;

    onSendMessage(inputText, attachedFile || undefined);
    setInputText('');
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (isRecording) {
      handleToggleRecording();
    }
  };

  const suggestions = [
    {
      type: 'estimator' as ArtifactType,
      icon: <Calculator className="w-4 h-4 text-emerald-400" />,
      text: "Estimate materials for residential house footprint 45x35 ft",
      prompt: "Please estimate material requirements and total cost for a 2-floor residential building with footprint 45x35 ft and height 10 ft per floor."
    },
    {
      type: 'boq' as ArtifactType,
      icon: <FileSpreadsheet className="w-4 h-4 text-blue-400" />,
      text: "Draft interior works BOQ for commercial office cabin",
      prompt: "Create a Bill of Quantities (BOQ) with standard rates for the interior styling and civil partition of a premium office space cabin (1200 sqft)."
    },
    {
      type: 'design' as ArtifactType,
      icon: <Paintbrush className="w-4 h-4 text-purple-400" />,
      text: "Generate interior design render of Modern Minimalist kitchen",
      prompt: "Render a photorealistic Modern Minimalist kitchen with wooden cabinets, gray marble countertop, and biophilic warm hanging lights. Set aspect ratio to 16:9."
    },
    {
      type: 'invoice' as ArtifactType,
      icon: <Check className="w-4 h-4 text-indigo-400" />,
      text: "Create a standard GST Bill for civil steel supply",
      prompt: "Create a GST-compliant invoice for supplying 5.5 tons of reinforced structural TMT Steel at standard market rates for BuildArch client Ramesh Kumar."
    }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0D1117] text-gray-100 relative">
      
      {/* Top Title Bar */}
      <div className="h-16 border-b border-gray-900 px-6 flex items-center justify-between bg-[#0C0F14]/70 backdrop-blur">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-gray-400 tracking-widest uppercase">Intelligent Chat Engine</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-gray-400 font-mono">Gemini-3.5 Active</span>
        </div>
      </div>

      {/* Messages Display Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
        {messages.length === 0 ? (
          /* Empty State Landing Cards */
          <div className="max-w-2xl mx-auto pt-8 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-indigo-600 flex items-center justify-center shadow-lg mb-4">
              <Building2 className="w-6 h-6 text-[#0D1117]" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white mb-2 text-center">
              Welcome to BuildArch Agent
            </h2>
            <p className="text-gray-400 text-sm font-light text-center mb-8 max-w-md">
              Ask any construction query, compute concrete estimates, build editable spreadsheet BOQs, or design breathtaking spaces.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInputText(s.prompt);
                    onLaunchArtifact(s.type);
                  }}
                  className="p-4 rounded-xl bg-[#141A24]/60 border border-gray-800 hover:border-emerald-500/30 hover:bg-[#141A24] transition-all text-left flex flex-col justify-between group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-1.5 rounded-lg bg-gray-950 border border-gray-800">
                      {s.icon}
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                  <span className="text-xs text-gray-300 font-light leading-snug group-hover:text-white transition-colors">
                    {s.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Conversation Thread */
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message) => {
              const isUser = message.role === 'user';
              return (
                <div 
                  key={message.id} 
                  className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Avatar */}
                  {!isUser && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/10 to-indigo-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-sm">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                    </div>
                  )}

                  {/* Bubble Container */}
                  <div className={`flex flex-col max-w-[82%] ${isUser ? 'items-end' : 'items-start'}`}>
                    <div 
                      className={`p-4 rounded-2xl border text-sm font-light leading-relaxed shadow-sm ${
                        isUser 
                          ? 'bg-[#1D2433] border-[#2C384D] text-white rounded-tr-none' 
                          : 'bg-[#151921] border-[#202733] text-gray-200 rounded-tl-none'
                      }`}
                    >
                      {/* Message Content */}
                      <div className="whitespace-pre-line prose prose-invert max-w-none prose-sm">
                        {message.content}
                      </div>

                      {/* Attached Label (if any) */}
                      {message.artifactId && (
                        <div className="mt-3 pt-2.5 border-t border-gray-800/60 flex items-center justify-between text-xs text-emerald-400">
                          <span className="font-mono flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-400" /> Generated Artifact: {message.artifactId}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1.5 font-mono">
                      {message.timestamp}
                    </span>
                  </div>

                  {/* User Avatar */}
                  {isUser && (
                    <div className="w-8 h-8 rounded-lg bg-[#222B3B] border border-gray-700 flex items-center justify-center shrink-0 shadow-sm">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Thinking state bubble */}
            {isLoading && (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                </div>
                <div className="bg-[#151921] border border-[#202733] p-4 rounded-2xl rounded-tl-none max-w-[80%] shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-xs text-gray-400 font-mono ml-2">Assembling material reports and updating visual renderings...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating Chat Input Container */}
      <div className="p-4 md:p-6 border-t border-gray-900 bg-[#0C0F14]/90 backdrop-blur">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto flex flex-col gap-2 bg-[#121620] border border-gray-800 rounded-2xl p-2 focus-within:border-emerald-500/40 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all shadow-xl relative">
          
          {/* File attachment preview */}
          {attachedFile && (
            <div className="px-3 py-2 flex items-center justify-between bg-[#191F2D] border border-gray-800 rounded-xl mb-1 text-xs">
              <span className="text-emerald-400 truncate max-w-md font-mono flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Attachment loaded: {attachedFile.name} ({Math.round(attachedFile.base64.length/1024)} KB)
              </span>
              <button 
                type="button" 
                onClick={handleRemoveAttachment} 
                className="text-gray-500 hover:text-white font-bold ml-4 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Text Area Input */}
          <div className="flex items-start gap-2 min-h-[44px]">
            {/* Native Input File Hidden */}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="application/pdf,image/*,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
            />
            
            {/* Attachment Button Trigger */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl text-gray-500 hover:text-white hover:bg-gray-800/40 transition-colors cursor-pointer shrink-0 mt-0.5"
              title="Attach PDF, site bill image, or blueprints"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Input Form */}
            <textarea
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="Record progressive site logs, input estimator bounds, or customize material sheets..."
              className="flex-1 bg-transparent text-sm text-white border-0 focus:outline-none placeholder-gray-500 resize-none font-light py-2"
            />

            {/* Audio STT Voice Rec Trigger */}
            <button
              type="button"
              onClick={handleToggleRecording}
              className={`p-2.5 rounded-xl transition-all cursor-pointer shrink-0 mt-0.5 relative group ${
                isRecording 
                  ? 'bg-red-500/10 text-red-500 border border-red-500/20 shadow shadow-red-500/15' 
                  : 'text-gray-500 hover:text-white hover:bg-gray-800/40'
              }`}
              title={isRecording ? 'Recording active... click to save' : 'Hands-free Voice DPR via Whisper STT'}
            >
              {isRecording ? <MicOff className="w-5 h-5 animate-pulse" /> : <Mic className="w-5 h-5" />}
              {isRecording && (
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 text-[10px] font-mono text-red-400 bg-black border border-red-500/20 rounded-md whitespace-nowrap">
                  Live STT ({recordingTime}s)
                </span>
              )}
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={(!inputText.trim() && !attachedFile) || isLoading}
              className={`p-2.5 rounded-xl shrink-0 mt-0.5 transition-all cursor-pointer ${
                (inputText.trim() || attachedFile) && !isLoading
                  ? 'bg-emerald-500 text-[#0D1117] hover:bg-emerald-400 shadow shadow-emerald-500/20 hover:scale-105'
                  : 'text-gray-600 bg-gray-900/40 border border-gray-800/20'
              }`}
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </div>
        </form>
        <p className="text-center text-[10px] text-gray-500 font-mono tracking-wide mt-3 max-w-md mx-auto">
          Upload site bill photos for OCR. Speech-to-text turns spoken progress reports directly into structural DPR logs.
        </p>
      </div>
    </div>
  );
}
