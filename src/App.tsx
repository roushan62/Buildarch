/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import LandingPage from './components/LandingPage';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import ArtifactViewer from './components/ArtifactViewer';
import { 
  ChatSession, 
  Artifact, 
  ArtifactType, 
  Message,
  EstimatorData,
  BOQData,
  InvoiceData,
  DPRData,
  KanbanData,
  DesignData
} from './types';

// ==========================================
// PRE-SEEDED ENTERPRISE MOCK DATA
// ==========================================

const defaultEstimator: EstimatorData = {
  length: 50,
  width: 30,
  height: 10,
  type: 'residential',
  floors: 2,
  cementBags: 1260,
  bricksCount: 34500,
  sandCft: 3750,
  aggregateCft: 4200,
  steelKg: 11400,
  paintLiters: 540,
  tileSqFt: 3150,
  totalCostEstimate: 4500000.00
};

const defaultBOQ: BOQData = {
  projectName: 'Kumar Luxury Villa Plinth & Finishes',
  clientName: 'Ramesh Kumar',
  items: [
    {
      id: 'boq-1',
      itemNo: '1.1',
      description: 'Excavation of soil and footings for columns up to depths of 2.5 meters in gravel mortar',
      unit: 'CFT',
      quantity: 480,
      rate: 45.00,
      amount: 21600.00,
      category: 'Civil'
    },
    {
      id: 'boq-2',
      itemNo: '1.2',
      description: 'Reinforced concrete casting M25 grade in columns, beams, and slabs including structural steel fabrication',
      unit: 'CFT',
      quantity: 2200,
      rate: 340.00,
      amount: 748000.00,
      category: 'Civil'
    },
    {
      id: 'boq-3',
      itemNo: '2.1',
      description: 'False Ceiling Gypsum board assemblies with moisture protection and perimeter LED channel grooves',
      unit: 'SqFt',
      quantity: 1250,
      rate: 110.00,
      amount: 137500.00,
      category: 'Interior'
    },
    {
      id: 'boq-4',
      itemNo: '3.1',
      description: 'Teak wood door frame assemblies with brass hardware, lock cylinders, and premium matte finish coat',
      unit: 'Nos',
      quantity: 12,
      rate: 18500.00,
      amount: 222000.00,
      category: 'Interior'
    },
    {
      id: 'boq-5',
      itemNo: '4.1',
      description: 'Premium Italian Glazed Vitrified Tiles for ground level lobby and guest lounge cladding',
      unit: 'SqFt',
      quantity: 1800,
      rate: 165.00,
      amount: 297000.00,
      category: 'Finishes'
    }
  ]
};

const defaultInvoice: InvoiceData = {
  invoiceNumber: 'INV-2026-0042',
  date: '2026-07-06',
  dueDate: '2026-08-06',
  clientName: 'Ramesh Kumar',
  clientGSTIN: '27AABCB1234F1Z8',
  vendorName: 'BuildArch Materials & Tech Ltd',
  vendorGSTIN: '27AACEG5678H2Z5',
  items: [
    {
      id: 'inv-item-1',
      description: 'Structural Reinforced TMT Steel Rebars (Fe550 grade) - 12mm and 16mm bundles',
      hsnCode: '7214',
      qty: 5.5,
      rate: 82000.00,
      taxableValue: 451000.00,
      cgstRate: 9,
      sgstRate: 9,
      igstRate: 0,
      total: 532180.00
    },
    {
      id: 'inv-item-2',
      description: 'Ordinary Portland Cement (OPC 53 Grade) - Premium setting dry mix sacks',
      hsnCode: '2523',
      qty: 150,
      rate: 440.00,
      taxableValue: 66000.00,
      cgstRate: 9,
      sgstRate: 9,
      igstRate: 0,
      total: 77880.00
    }
  ],
  subtotal: 517000.00,
  cgstAmount: 46530.00,
  sgstAmount: 46530.00,
  igstAmount: 0.00,
  grandTotal: 610060.00,
  status: 'Sent'
};

const defaultDPR: DPRData = {
  date: '2026-07-06',
  weather: 'Overcast, 28°C with light breeze',
  supervisor: 'Anil Sharma (Site Lead)',
  workforceCount: 18,
  tasks: [
    {
      id: 'dpr-task-1',
      description: 'Slab reinforcement steel binding and conduit laying on second floor floor plate',
      assignedTo: 'Structural Steel Crew A',
      progress: 100,
      status: 'Completed'
    },
    {
      id: 'dpr-task-2',
      description: 'Ground floor brick partition masonry layout and structural column plastering works',
      assignedTo: 'Civil Masonry Team B',
      progress: 60,
      status: 'In Progress'
    },
    {
      id: 'dpr-task-3',
      description: 'Sump tank electrical booster plumbing line assembly and pressure testing log',
      assignedTo: 'Plumbing Unit',
      progress: 10,
      status: 'Pending'
    }
  ],
  materials: [
    {
      id: 'dpr-mat-1',
      material: 'Structural Steel (TMT 16mm)',
      quantity: 4.5,
      unit: 'Tons',
      supplier: 'National Rebars Corp',
      status: 'Received'
    },
    {
      id: 'dpr-mat-2',
      material: 'OPC Portland Cement',
      quantity: 120,
      unit: 'Bags',
      supplier: 'UltraTech Agency',
      status: 'Received'
    }
  ],
  safetyNotes: 'All workers equipped with class-A safety harnesses and hardhats. No minor or major safety incidents recorded today.',
  audioTranscript: 'Today we successfully completed the entire layout slab binding for second floor concrete pouring scheduled for tomorrow morning. We logged about 18 active crew members today. Materials delivered are forty bags of fine grain masonry sand and six tons of premium aggregates.'
};

const defaultKanban: KanbanData = {
  tasks: [
    {
      id: 'kt-1',
      title: 'Cement stock clearance report',
      description: 'Audit the dry storage warehouse for moisture seepages before monsoon starts.',
      category: 'supply',
      status: 'inprogress',
      assignedTo: 'Sunil G.',
      priority: 'High',
      date: '2026-07-06'
    },
    {
      id: 'kt-2',
      title: 'Glass panel dimensional inspection',
      description: 'Measure and confirm thickness clearance of tempered sheets delivered for lobby partitions.',
      category: 'inspection',
      status: 'todo',
      assignedTo: 'Anita R.',
      priority: 'Medium',
      date: '2026-07-07'
    },
    {
      id: 'kt-3',
      title: 'Clear masonry labor payroll logs',
      description: 'Review timesheets of structural masons for week 2 in preparation of Friday cash disbursements.',
      category: 'payroll',
      status: 'completed',
      assignedTo: 'Priya M.',
      priority: 'High',
      date: '2026-07-05'
    }
  ],
  inventory: [
    {
      id: 'inv-1',
      name: 'OPC Portland Cement',
      category: 'Masonry',
      stockLevel: 45,
      minLevel: 80,
      unit: 'Bags',
      unitPrice: 440
    },
    {
      id: 'inv-2',
      name: 'TMT Structural Rebars 12mm',
      category: 'Steel',
      stockLevel: 6.8,
      minLevel: 4.0,
      unit: 'Tons',
      unitPrice: 82000
    },
    {
      id: 'inv-3',
      name: 'Commercial Plywood 19mm',
      category: 'Carpentry',
      stockLevel: 145,
      minLevel: 50,
      unit: 'Nos',
      unitPrice: 1850
    }
  ],
  payroll: [
    {
      id: 'pay-1',
      name: 'Sunil Gupta',
      role: 'Head Civil Mason',
      dailyRate: 45,
      daysWorked: 12,
      allowance: 50,
      totalPay: 590,
      status: 'Paid'
    },
    {
      id: 'pay-2',
      name: 'Anita Roy',
      role: 'Lead Supervisor',
      dailyRate: 70,
      daysWorked: 10,
      allowance: 120,
      totalPay: 820,
      status: 'Pending'
    },
    {
      id: 'pay-3',
      name: 'Prakash Kumar',
      role: 'Steel Binder Assistant',
      dailyRate: 35,
      daysWorked: 14,
      allowance: 40,
      totalPay: 530,
      status: 'Paid'
    }
  ]
};

const defaultDesign: DesignData = {
  prompt: 'High fidelity warm Japandi living room interior elevation. Cozy beige linen sofa, wooden slat wall divider panel, slate flooring, and hanging plants.',
  aspectRatio: '16:9',
  imageUrl: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=1200&q=80',
  materials: ['White Oak Slats', 'Polished Cement Tiles', 'Linen Upholstery', 'Brass Light Fixtures'],
  colorPalette: ['#EBE6DD', '#D2C9B9', '#867F73', '#494239', '#191715'],
  viewType: 'Living Room',
  style: 'Japandi'
};

const initialArtifacts: { [key in ArtifactType]: Artifact } = {
  estimator: { id: 'art-estimator', type: 'estimator', title: 'Kumar Villa Material Estimate bounds', data: defaultEstimator, version: 1 },
  boq: { id: 'art-boq', type: 'boq', title: 'Civil Partition bill of quantities', data: defaultBOQ, version: 1 },
  invoice: { id: 'art-invoice', type: 'invoice', title: 'Invoice INV-2026-0042 bill statement', data: defaultInvoice, version: 1 },
  dpr: { id: 'art-dpr', type: 'dpr', title: 'Daily Site Progress log 2026-07-06', data: defaultDPR, version: 1 },
  kanban: { id: 'art-kanban', type: 'kanban', title: 'BuildArch Materials Inventory & labor payroll', data: defaultKanban, version: 1 },
  design: { id: 'art-design', type: 'design', title: 'Luxury Japandi master living room render', data: defaultDesign, version: 1 }
};

export default function App() {
  const [view, setView] = useState<'landing' | 'workspace'>('landing');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeArtifact, setActiveArtifact] = useState<Artifact | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize a default chat session on entering workspace
  const handleEnterWorkspace = (initialPrompt?: string) => {
    setView('workspace');
    
    const firstSessionId = Math.random().toString();
    const newSession: ChatSession = {
      id: firstSessionId,
      title: initialPrompt ? 'Initial Project spec prompt' : 'BuildArch Welcome Sandbox',
      messages: [
        {
          id: 'welcome',
          role: 'assistant',
          content: 'Hello! I am your BuildArch AI assistant. I have compiled standard material estimators, editable BOQs, and inventory structures in your right-hand Workspace panel. How can I assist you with your construction or interior project today?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ],
      createdAt: new Date().toISOString()
    };

    setSessions([newSession]);
    setActiveSessionId(firstSessionId);
    
    // Default to displaying the Estimator artifact on start to feel immediately active
    setActiveArtifact(initialArtifacts.estimator);

    // If they specified a prompt on the landing page, send it automatically!
    if (initialPrompt) {
      setTimeout(() => {
        handleSendMessage(initialPrompt);
      }, 500);
    }
  };

  const handleCreateSession = () => {
    const newId = Math.random().toString();
    const newSession: ChatSession = {
      id: newId,
      title: 'New Operations session',
      messages: [
        {
          id: Math.random().toString(),
          role: 'assistant',
          content: 'I have opened a new clean session. Ask me to parse architectural documents, write a material estimate, or draft invoices.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ],
      createdAt: new Date().toISOString()
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
  };

  // Launch direct operational panels from Sidebar
  const handleLaunchArtifact = (type: ArtifactType) => {
    setActiveArtifact(initialArtifacts[type]);
  };

  const handleUpdateArtifactData = (updatedData: any) => {
    if (!activeArtifact) return;
    setActiveArtifact({
      ...activeArtifact,
      data: updatedData,
      version: activeArtifact.version + 1
    });
  };

  // Handle direct message sending to API
  const handleSendMessage = async (
    text: string, 
    attachment?: { name: string; type: string; base64: string }
  ) => {
    if (!activeSessionId) return;

    // 1. Setup local messages list
    const currentSession = sessions.find((s) => s.id === activeSessionId);
    if (!currentSession) return;

    const userMsgId = Math.random().toString();
    const userMessage: Message = {
      id: userMsgId,
      role: 'user',
      content: attachment 
        ? `${text}\n\n[Attached File: ${attachment.name}]`
        : text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...currentSession.messages, userMessage];
    
    // Update active session name if it was a default placeholder
    const shouldRename = currentSession.title === 'New Operations session' || currentSession.title === 'BuildArch Welcome Sandbox';
    const updatedTitle = shouldRename ? (text.length > 30 ? text.substring(0, 30) + '...' : text) : currentSession.title;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, title: updatedTitle, messages: updatedMessages }
          : s
      )
    );

    setIsLoading(true);

    try {
      if (attachment) {
        // Document Intelligence / OCR Pathway
        const response = await fetch('/api/parse-doc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: attachment.name,
            fileType: attachment.type,
            base64Data: attachment.base64,
            prompt: text
          })
        });

        if (!response.ok) {
          throw new Error('Server returned an error parsing document.');
        }

        const data = await response.json();

        const assistantMsg: Message = {
          id: Math.random().toString(),
          role: 'assistant',
          content: data.chatResponse || 'I analyzed the uploaded document. Relevant parameters have been mapped into your active workspace.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          artifactId: data.artifact?.type
        };

        if (data.artifact) {
          // Instantly deploy structural artifact returned by the file analysis
          const mergedArtifact: Artifact = {
            id: 'art-' + data.artifact.type,
            type: data.artifact.type as ArtifactType,
            title: data.artifact.title || 'Extracted Document Artifact',
            data: data.artifact.data,
            version: 1
          };
          setActiveArtifact(mergedArtifact);
          initialArtifacts[data.artifact.type as ArtifactType] = mergedArtifact;
        }

        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? { ...s, messages: [...updatedMessages, assistantMsg] }
              : s
          )
        );

      } else {
        // General AI Chat reasoning and automatic operational synchronization
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: text,
            history: updatedMessages,
            activeArtifactType: activeArtifact?.type || 'estimator'
          })
        });

        if (!response.ok) {
          throw new Error('Server returned an error answering message.');
        }

        const data = await response.json();

        const assistantMsg: Message = {
          id: Math.random().toString(),
          role: 'assistant',
          content: data.chatResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          artifactId: data.artifact?.type
        };

        if (data.artifact) {
          // Automatic alignment of estimator, BOQ, invoices etc. with server payloads
          const mergedArtifact: Artifact = {
            id: 'art-' + data.artifact.type,
            type: data.artifact.type as ArtifactType,
            title: data.artifact.title || activeArtifact?.title || 'Operational Artifact',
            data: data.artifact.data,
            version: 1
          };
          setActiveArtifact(mergedArtifact);
          initialArtifacts[data.artifact.type as ArtifactType] = mergedArtifact;
        }

        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? { ...s, messages: [...updatedMessages, assistantMsg] }
              : s
          )
        );
      }

    } catch (err: any) {
      console.error(err);
      const errMsg: Message = {
        id: Math.random().toString(),
        role: 'assistant',
        content: `Error connecting to BuildArch Service: ${err.message || 'An unexpected failure occurred. Please check that your Gemini API key is active in Settings.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...updatedMessages, errMsg] }
            : s
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger design generation (called inside ArtifactViewer design visualizer)
  const handleTriggerGenerateImage = async (prompt: string, style: string, viewType: string): Promise<string> => {
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style, viewType })
      });
      if (!response.ok) {
        throw new Error('Model failed to generate interior elevation rendering.');
      }
      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error('Image generation client error:', error);
      throw error;
    }
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  return (
    <div className="w-full h-screen bg-[#0A0D14] flex flex-col overflow-hidden text-gray-100">
      
      {/* Dynamic Render Switcher */}
      <AnimatePresence mode="wait">
        {view === 'landing' ? (
          <motion.div 
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full overflow-y-auto"
          >
            <LandingPage onGetStarted={handleEnterWorkspace} />
          </motion.div>
        ) : (
          <motion.div 
            key="workspace"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full flex overflow-hidden"
          >
            {/* Claude.ai Navigation Sidebar */}
            <Sidebar 
              sessions={sessions}
              activeSessionId={activeSessionId}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              onSelectSession={handleSelectSession}
              onCreateSession={handleCreateSession}
              onLaunchArtifact={handleLaunchArtifact}
              onSignOut={() => setView('landing')}
            />

            {/* Central Chat Panel focus */}
            <ChatInterface 
              messages={activeSession ? activeSession.messages : []}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
              onLaunchArtifact={handleLaunchArtifact}
            />

            {/* Right side Dynamic Artifact spreadsheet, calculator, render panel */}
            <AnimatePresence>
              {activeArtifact && (
                <motion.div
                  initial={{ x: 200, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 200, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ArtifactViewer 
                    artifact={activeArtifact}
                    onClose={() => setActiveArtifact(null)}
                    onUpdateArtifact={handleUpdateArtifactData}
                    onTriggerGenerateImage={handleTriggerGenerateImage}
                  />
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
