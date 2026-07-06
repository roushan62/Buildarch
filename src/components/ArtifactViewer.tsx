/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Sparkles, 
  Printer, 
  Plus, 
  Trash2, 
  FileSpreadsheet, 
  Calculator, 
  FileText, 
  Mic, 
  Layers, 
  Paintbrush, 
  Check, 
  RefreshCw,
  Mail,
  Share2,
  ChevronDown
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { 
  Artifact, 
  EstimatorData, 
  BOQData, 
  InvoiceData, 
  DPRData, 
  KanbanData, 
  DesignData,
  BOQItem,
  InvoiceItem,
  KanbanItem,
  DPRTask,
  DPRMaterialLog,
  LaborPayroll
} from '../types';

interface ArtifactViewerProps {
  artifact: Artifact | null;
  onClose: () => void;
  onUpdateArtifact: (updatedData: any) => void;
  onTriggerGenerateImage?: (prompt: string, style: string, view: string) => Promise<string>;
}

export default function ArtifactViewer({
  artifact,
  onClose,
  onUpdateArtifact,
  onTriggerGenerateImage
}: ArtifactViewerProps) {
  const [activeTab, setActiveTab] = useState<'visual' | 'code' | 'export'>('visual');
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  if (!artifact) return null;

  const handleFieldChange = (module: string, field: string, value: any) => {
    const updatedData = { ...artifact.data };
    (updatedData as any)[field] = value;

    // Trigger auto-calculations based on the updated field
    if (artifact.type === 'estimator') {
      recalculateEstimates(updatedData as EstimatorData);
    }

    onUpdateArtifact(updatedData);
  };

  // 1. Recalculate Material Estimator Formulas
  const recalculateEstimates = (data: EstimatorData) => {
    const footprint = data.length * data.width;
    const totalArea = footprint * data.floors;
    
    // Standard Material Consumption Coefficients
    // Cement: 0.4 bags per sqft of built up area
    // Bricks: 12 bricks per sqft of built up area per floor
    // Sand: 1.2 cubic ft per sqft
    // Aggregate: 1.35 cubic ft per sqft
    // Steel: 3.5 kg per sqft of structural slab
    // Paint: 0.15 liters per sqft
    // Tiles: 1.1 sqft per sqft of floor area (including wastage)
    
    let multiplier = 1.0;
    if (data.type === 'commercial') multiplier = 1.25;
    if (data.type === 'interior-fitout') multiplier = 0.4; // Interior only

    data.cementBags = Math.round(totalArea * 0.42 * multiplier);
    data.bricksCount = Math.round(totalArea * 11.5 * multiplier);
    data.sandCft = Math.round(totalArea * 1.25 * multiplier);
    data.aggregateCft = Math.round(totalArea * 1.4 * multiplier);
    data.steelKg = Math.round(totalArea * 3.8 * multiplier);
    data.paintLiters = Math.round(totalArea * 0.18 * multiplier);
    data.tileSqFt = Math.round(totalArea * 1.05);
    
    // Dynamic cost multiplier
    const ratePerSqft = data.type === 'commercial' ? 1800 : data.type === 'interior-fitout' ? 950 : 1500;
    data.totalCostEstimate = totalArea * ratePerSqft;
  };

  // 2. BOQ Spreadsheet Grid Recalculation
  const handleBOQCellChange = (itemId: string, field: 'quantity' | 'rate' | 'description' | 'unit', value: any) => {
    const updatedData = { ...artifact.data } as BOQData;
    updatedData.items = updatedData.items.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          const qty = parseFloat(field === 'quantity' ? value : item.quantity) || 0;
          const rate = parseFloat(field === 'rate' ? value : item.rate) || 0;
          updatedItem.amount = Number((qty * rate).toFixed(2));
        }
        return updatedItem;
      }
      return item;
    });
    onUpdateArtifact(updatedData);
  };

  const addBOQRow = () => {
    const updatedData = { ...artifact.data } as BOQData;
    const newNo = (updatedData.items.length + 1).toString();
    const newItem: BOQItem = {
      id: Math.random().toString(),
      itemNo: newNo,
      description: 'New Material/Civil works item',
      unit: 'SqFt',
      quantity: 1,
      rate: 100,
      amount: 100,
      category: 'Civil'
    };
    updatedData.items = [...updatedData.items, newItem];
    onUpdateArtifact(updatedData);
  };

  const deleteBOQRow = (id: string) => {
    const updatedData = { ...artifact.data } as BOQData;
    updatedData.items = updatedData.items.filter(item => item.id !== id);
    onUpdateArtifact(updatedData);
  };

  // 3. Invoice / GST Calculations with double-precision monetary floats
  const handleInvoiceCellChange = (itemId: string, field: 'qty' | 'rate' | 'description' | 'hsnCode', value: any) => {
    const updatedData = { ...artifact.data } as InvoiceData;
    updatedData.items = updatedData.items.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        
        const qty = parseFloat(field === 'qty' ? value : item.qty) || 0;
        const rate = parseFloat(field === 'rate' ? value : item.rate) || 0;
        
        updatedItem.taxableValue = Number((qty * rate).toFixed(2));
        
        // Dynamic SGST/CGST calculations
        const cgstAmount = (updatedItem.taxableValue * (updatedItem.cgstRate / 100));
        const sgstAmount = (updatedItem.taxableValue * (updatedItem.sgstRate / 100));
        const igstAmount = (updatedItem.taxableValue * (updatedItem.igstRate / 100));
        
        updatedItem.total = Number((updatedItem.taxableValue + cgstAmount + sgstAmount + igstAmount).toFixed(2));
        return updatedItem;
      }
      return item;
    });

    // Recalculate totals
    let subtotal = 0;
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    updatedData.items.forEach(item => {
      subtotal += item.taxableValue;
      cgstAmount += item.taxableValue * (item.cgstRate / 100);
      sgstAmount += item.taxableValue * (item.sgstRate / 100);
      igstAmount += item.taxableValue * (item.igstRate / 100);
    });

    updatedData.subtotal = Number(subtotal.toFixed(2));
    updatedData.cgstAmount = Number(cgstAmount.toFixed(2));
    updatedData.sgstAmount = Number(sgstAmount.toFixed(2));
    updatedData.igstAmount = Number(igstAmount.toFixed(2));
    updatedData.grandTotal = Number((subtotal + cgstAmount + sgstAmount + igstAmount).toFixed(2));

    onUpdateArtifact(updatedData);
  };

  const addInvoiceRow = () => {
    const updatedData = { ...artifact.data } as InvoiceData;
    const newItem: InvoiceItem = {
      id: Math.random().toString(),
      description: 'Consultancy Service Fee',
      hsnCode: '998311',
      qty: 1,
      rate: 15000,
      taxableValue: 15000,
      cgstRate: 9,
      sgstRate: 9,
      igstRate: 0,
      total: 17700
    };
    updatedData.items = [...updatedData.items, newItem];
    
    // Force totals recalculation
    handleInvoiceCellChange(newItem.id, 'qty', 1);
  };

  const deleteInvoiceRow = (id: string) => {
    const updatedData = { ...artifact.data } as InvoiceData;
    updatedData.items = updatedData.items.filter(item => item.id !== id);
    onUpdateArtifact(updatedData);
    if (updatedData.items.length > 0) {
      handleInvoiceCellChange(updatedData.items[0].id, 'qty', updatedData.items[0].qty);
    } else {
      updatedData.subtotal = 0;
      updatedData.cgstAmount = 0;
      updatedData.sgstAmount = 0;
      updatedData.igstAmount = 0;
      updatedData.grandTotal = 0;
      onUpdateArtifact(updatedData);
    }
  };

  // 4. DPR / Site Logs Handlers
  const toggleDPRTask = (id: string) => {
    const updatedData = { ...artifact.data } as DPRData;
    updatedData.tasks = updatedData.tasks.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'Completed' ? 'Pending' : t.status === 'In Progress' ? 'Completed' : 'In Progress';
        return { 
          ...t, 
          status: nextStatus,
          progress: nextStatus === 'Completed' ? 100 : nextStatus === 'In Progress' ? 50 : 0
        };
      }
      return t;
    });
    onUpdateArtifact(updatedData);
  };

  const addDPRMaterialRow = () => {
    const updatedData = { ...artifact.data } as DPRData;
    const newLog: DPRMaterialLog = {
      id: Math.random().toString(),
      material: 'Plywood Sheets (19mm)',
      quantity: 75,
      unit: 'Nos',
      supplier: 'National Timber Corp',
      status: 'Received'
    };
    updatedData.materials = [...updatedData.materials, newLog];
    onUpdateArtifact(updatedData);
  };

  // 5. Kanban / Inventory / Payroll Board Handlers
  const moveKanbanTask = (id: string, nextStatus: 'todo' | 'inprogress' | 'completed') => {
    const updatedData = { ...artifact.data } as KanbanData;
    updatedData.tasks = updatedData.tasks.map(t => t.id === id ? { ...t, status: nextStatus } : t);
    onUpdateArtifact(updatedData);
  };

  const updatePayrollDays = (id: string, days: number) => {
    const updatedData = { ...artifact.data } as KanbanData;
    updatedData.payroll = updatedData.payroll.map(p => {
      if (p.id === id) {
        const total = (p.dailyRate * days) + p.allowance;
        return { ...p, daysWorked: days, totalPay: total };
      }
      return p;
    });
    onUpdateArtifact(updatedData);
  };

  // 6. AI FLUX Design Generation Call
  const handleGenerateDesign = async () => {
    if (!onTriggerGenerateImage) return;
    const data = artifact.data as DesignData;
    setIsGeneratingImg(true);
    try {
      const generatedUrl = await onTriggerGenerateImage(data.prompt, data.style, data.viewType);
      const updatedData = { ...data, imageUrl: generatedUrl };
      onUpdateArtifact(updatedData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingImg(false);
    }
  };

  const handleSendEmail = () => {
    setEmailStatus('sending');
    setTimeout(() => {
      setEmailStatus('success');
      setTimeout(() => setEmailStatus(null), 3000);
    }, 1500);
  };

  // Color mappings for recharts
  const COLORS = ['#10B981', '#3B82F6', '#6366F1', '#EC4899', '#F59E0B', '#14B8A6'];

  return (
    <section className="w-[500px] xl:w-[650px] shrink-0 h-full border-l border-gray-900 bg-[#0C1017] flex flex-col relative z-20 shadow-2xl">
      
      {/* Header Panel */}
      <div className="h-16 border-b border-gray-900 px-5 flex items-center justify-between bg-[#0B0E14]/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gray-900 border border-gray-800">
            {artifact.type === 'estimator' && <Calculator className="w-5 h-5 text-emerald-400" />}
            {artifact.type === 'boq' && <FileSpreadsheet className="w-5 h-5 text-blue-400" />}
            {artifact.type === 'invoice' && <FileText className="w-5 h-5 text-indigo-400" />}
            {artifact.type === 'dpr' && <Mic className="w-5 h-5 text-red-400" />}
            {artifact.type === 'kanban' && <Layers className="w-5 h-5 text-amber-400" />}
            {artifact.type === 'design' && <Paintbrush className="w-5 h-5 text-purple-400" />}
          </div>
          <div>
            <h2 className="text-xs font-semibold text-gray-500 font-mono tracking-widest uppercase">Workspace Artifact</h2>
            <p className="text-sm font-semibold text-white truncate max-w-[280px] xl:max-w-[360px]">{artifact.title}</p>
          </div>
        </div>

        {/* Navigation Tabs & Actions */}
        <div className="flex items-center gap-2">
          <div className="bg-gray-900/80 p-0.5 rounded-lg border border-gray-800 flex text-[11px]">
            <button 
              onClick={() => setActiveTab('visual')}
              className={`px-2.5 py-1 rounded-md transition-all font-mono cursor-pointer ${activeTab === 'visual' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              PREVIEW
            </button>
            <button 
              onClick={() => setActiveTab('code')}
              className={`px-2.5 py-1 rounded-md transition-all font-mono cursor-pointer ${activeTab === 'code' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              JSON
            </button>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Primary Content Scroll Wrapper */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {activeTab === 'code' ? (
          /* JSON Schema Debug representation */
          <div className="bg-[#080B10] border border-gray-900 rounded-xl p-4 font-mono text-[11px] text-gray-400 overflow-x-auto h-full">
            <div className="flex items-center justify-between border-b border-gray-900 pb-2.5 mb-3">
              <span className="text-emerald-400">ARTIFACT_RAW_DATA</span>
              <span className="text-gray-600">v{artifact.version}.0</span>
            </div>
            <pre className="text-indigo-300 leading-relaxed whitespace-pre-wrap">
              {JSON.stringify(artifact, null, 2)}
            </pre>
          </div>
        ) : (
          /* High Fidelity Visual Interfaces */
          <>
            {/* 1. ESTIMATOR VIEW */}
            {artifact.type === 'estimator' && (
              <div className="space-y-6">
                <div className="bg-gray-950/40 border border-gray-900 rounded-2xl p-5 space-y-4">
                  <h3 className="text-xs font-semibold text-gray-400 font-mono tracking-wider uppercase border-b border-gray-900 pb-2">Parametric Project Bounds</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] text-gray-500 font-mono mb-1">PLINTH LENGTH (FT)</label>
                      <input 
                        type="number" 
                        value={(artifact.data as EstimatorData).length}
                        onChange={(e) => handleFieldChange('estimator', 'length', parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#121620] border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/55"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-500 font-mono mb-1">PLINTH WIDTH (FT)</label>
                      <input 
                        type="number" 
                        value={(artifact.data as EstimatorData).width}
                        onChange={(e) => handleFieldChange('estimator', 'width', parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#121620] border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/55"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-500 font-mono mb-1">HEIGHT PER FLOOR (FT)</label>
                      <input 
                        type="number" 
                        value={(artifact.data as EstimatorData).height}
                        onChange={(e) => handleFieldChange('estimator', 'height', parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#121620] border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/55"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-500 font-mono mb-1">NUMBER OF FLOORS</label>
                      <input 
                        type="number" 
                        value={(artifact.data as EstimatorData).floors}
                        onChange={(e) => handleFieldChange('estimator', 'floors', parseInt(e.target.value) || 1)}
                        className="w-full bg-[#121620] border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/55"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[11px] text-gray-500 font-mono mb-1">PROJECT SPECS TEMPLATE</label>
                      <select 
                        value={(artifact.data as EstimatorData).type}
                        onChange={(e) => handleFieldChange('estimator', 'type', e.target.value)}
                        className="w-full bg-[#121620] border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/55"
                      >
                        <option value="residential">Residential Standard Villa</option>
                        <option value="commercial">Commercial Multi-Storey</option>
                        <option value="interior-fitout">Premium Corporate Interior Fitout</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Estimate Formulas Output */}
                <div className="bg-[#0C121A] border border-emerald-500/10 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-900 pb-2">
                    <h3 className="text-xs font-semibold text-emerald-400 font-mono tracking-wider uppercase">Calculated Material Allocations</h3>
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-[#111823] border border-gray-900 rounded-xl">
                      <span className="text-[10px] text-gray-500 font-mono block">CEMENT SACKS</span>
                      <span className="text-lg font-semibold text-white font-mono">{(artifact.data as EstimatorData).cementBags} <span className="text-xs text-gray-400">Bags</span></span>
                    </div>
                    <div className="p-3 bg-[#111823] border border-gray-900 rounded-xl">
                      <span className="text-[10px] text-gray-500 font-mono block">STEEL WEIGHT</span>
                      <span className="text-lg font-semibold text-white font-mono">{(artifact.data as EstimatorData).steelKg.toLocaleString()} <span className="text-xs text-gray-400">Kg</span></span>
                    </div>
                    <div className="p-3 bg-[#111823] border border-gray-900 rounded-xl">
                      <span className="text-[10px] text-gray-500 font-mono block">RED BRICKS</span>
                      <span className="text-lg font-semibold text-white font-mono">{(artifact.data as EstimatorData).bricksCount.toLocaleString()} <span className="text-xs text-gray-400">Nos</span></span>
                    </div>
                    <div className="p-3 bg-[#111823] border border-gray-900 rounded-xl">
                      <span className="text-[10px] text-gray-500 font-mono block">AGGREGATE SAND</span>
                      <span className="text-lg font-semibold text-white font-mono">{(artifact.data as EstimatorData).sandCft.toLocaleString()} <span className="text-xs text-gray-400">Cft</span></span>
                    </div>
                    <div className="p-3 bg-[#111823] border border-gray-900 rounded-xl">
                      <span className="text-[10px] text-gray-500 font-mono block">GLOSS PAINT</span>
                      <span className="text-lg font-semibold text-white font-mono">{(artifact.data as EstimatorData).paintLiters} <span className="text-xs text-gray-400">Liters</span></span>
                    </div>
                    <div className="p-3 bg-[#111823] border border-gray-900 rounded-xl">
                      <span className="text-[10px] text-gray-500 font-mono block">CERAMIC TILES</span>
                      <span className="text-lg font-semibold text-white font-mono">{(artifact.data as EstimatorData).tileSqFt.toLocaleString()} <span className="text-xs text-gray-400">SqFt</span></span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-300 font-light">Gross Estimator Valuation (Standard Market Index)</span>
                    <span className="text-xl font-bold text-emerald-400 font-mono">${(artifact.data as EstimatorData).totalCostEstimate.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. BOQ SPREADSHEET VIEW */}
            {artifact.type === 'boq' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-gray-950/40 border border-gray-900 rounded-xl px-4 py-2 text-xs">
                  <span className="text-gray-400 font-mono uppercase">Interactive Civil Spreadsheet</span>
                  <button 
                    onClick={addBOQRow}
                    className="px-2.5 py-1.5 bg-emerald-500 text-black text-xs font-semibold rounded-lg flex items-center gap-1 hover:bg-emerald-400 cursor-pointer transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Row
                  </button>
                </div>

                {/* Spreadsheet grid */}
                <div className="border border-gray-900 rounded-2xl overflow-hidden bg-gray-950/20">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#11151E] border-b border-gray-900 text-gray-400 font-mono text-[10px]">
                        <th className="py-2.5 px-3 w-10">NO</th>
                        <th className="py-2.5 px-3">DESCRIPTION</th>
                        <th className="py-2.5 px-3 w-16">UNIT</th>
                        <th className="py-2.5 px-3 w-16 text-right">QTY</th>
                        <th className="py-2.5 px-3 w-20 text-right">RATE</th>
                        <th className="py-2.5 px-3 w-24 text-right">AMOUNT</th>
                        <th className="py-2.5 px-2 w-10 text-center">DEL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-900">
                      {(artifact.data as BOQData).items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-900/40 transition-colors">
                          <td className="py-2 px-3 font-mono text-gray-500">{item.itemNo}</td>
                          <td className="py-2 px-3">
                            <input 
                              type="text" 
                              value={item.description}
                              onChange={(e) => handleBOQCellChange(item.id, 'description', e.target.value)}
                              className="w-full bg-transparent border-0 focus:ring-1 focus:ring-emerald-500/20 text-white rounded p-1"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input 
                              type="text" 
                              value={item.unit}
                              onChange={(e) => handleBOQCellChange(item.id, 'unit', e.target.value)}
                              className="w-full bg-transparent border-0 text-center text-gray-300 rounded p-1"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input 
                              type="number" 
                              value={item.quantity}
                              onChange={(e) => handleBOQCellChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                              className="w-full bg-transparent border-0 text-right font-mono text-white rounded p-1"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input 
                              type="number" 
                              value={item.rate}
                              onChange={(e) => handleBOQCellChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
                              className="w-full bg-transparent border-0 text-right font-mono text-white rounded p-1"
                            />
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-emerald-400 font-semibold pr-4">
                            ${item.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button 
                              onClick={() => deleteBOQRow(item.id)}
                              className="p-1 rounded text-red-500/60 hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Total Grid calculation */}
                <div className="bg-gray-950/60 p-4 border border-gray-900 rounded-2xl flex justify-between items-center">
                  <span className="text-xs text-gray-400 font-mono uppercase">BOQ Net Budget Valuation</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    ${(artifact.data as BOQData).items.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </span>
                </div>
              </div>
            )}

            {/* 3. INVOICE VIEW */}
            {artifact.type === 'invoice' && (
              <div className="space-y-4">
                {/* Invoice Form Card */}
                <div className="p-6 bg-[#0E131E] border border-gray-800 rounded-3xl space-y-6">
                  {/* Title & Metadata */}
                  <div className="flex justify-between items-start border-b border-gray-800 pb-4">
                    <div>
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded px-2.5 py-1 uppercase tracking-wider">
                        GST compliant billing
                      </span>
                      <h4 className="text-lg font-bold text-white mt-2">{(artifact.data as InvoiceData).invoiceNumber}</h4>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">Date: {(artifact.data as InvoiceData).date} | Due: {(artifact.data as InvoiceData).dueDate}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-gray-400 font-mono">GRAND TOTAL</span>
                      <p className="text-2xl font-bold text-emerald-400 font-mono">${(artifact.data as InvoiceData).grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                    </div>
                  </div>

                  {/* Vendor & Client Details */}
                  <div className="grid grid-cols-2 gap-4 text-xs font-light text-gray-400">
                    <div className="space-y-1 p-3 bg-gray-950/40 rounded-xl border border-gray-900">
                      <span className="text-[10px] font-mono text-gray-500 block uppercase">Vendor/Supplier</span>
                      <p className="text-white font-medium">{(artifact.data as InvoiceData).vendorName}</p>
                      <p>GSTIN: <span className="font-mono text-emerald-400">{(artifact.data as InvoiceData).vendorGSTIN}</span></p>
                    </div>
                    <div className="space-y-1 p-3 bg-gray-950/40 rounded-xl border border-gray-900">
                      <span className="text-[10px] font-mono text-gray-500 block uppercase">Client Bill To</span>
                      <p className="text-white font-medium">{(artifact.data as InvoiceData).clientName}</p>
                      <p>GSTIN: <span className="font-mono text-emerald-400">{(artifact.data as InvoiceData).clientGSTIN}</span></p>
                    </div>
                  </div>

                  {/* Editable Invoice Grid */}
                  <div className="border border-gray-900 rounded-2xl overflow-hidden bg-gray-950/20">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-[#11151E] border-b border-gray-900 text-gray-400 font-mono text-[10px]">
                          <th className="py-2.5 px-3">LINE ITEM DESCRIPTION</th>
                          <th className="py-2.5 px-2 w-14 text-right">QTY</th>
                          <th className="py-2.5 px-2 w-20 text-right">RATE</th>
                          <th className="py-2.5 px-2 w-20 text-right">GST %</th>
                          <th className="py-2.5 px-3 w-24 text-right font-semibold">TOTAL</th>
                          <th className="py-2.5 px-2 w-8 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-900">
                        {(artifact.data as InvoiceData).items.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-900/40 transition-colors">
                            <td className="py-2 px-3">
                              <input 
                                type="text" 
                                value={item.description}
                                onChange={(e) => handleInvoiceCellChange(item.id, 'description', e.target.value)}
                                className="w-full bg-transparent border-0 focus:ring-1 focus:ring-emerald-500/20 text-white rounded p-1"
                              />
                            </td>
                            <td className="py-2 px-2 text-right">
                              <input 
                                type="number" 
                                value={item.qty}
                                onChange={(e) => handleInvoiceCellChange(item.id, 'qty', parseFloat(e.target.value) || 0)}
                                className="w-full bg-transparent border-0 text-right font-mono text-white rounded p-1"
                              />
                            </td>
                            <td className="py-2 px-2 text-right">
                              <input 
                                type="number" 
                                value={item.rate}
                                onChange={(e) => handleInvoiceCellChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
                                className="w-full bg-transparent border-0 text-right font-mono text-white rounded p-1"
                              />
                            </td>
                            <td className="py-2 px-2 text-center text-gray-400 font-mono">
                              {item.cgstRate + item.sgstRate + item.igstRate}%
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-white">
                              ${item.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </td>
                            <td className="py-2 px-2 text-center">
                              <button 
                                onClick={() => deleteInvoiceRow(item.id)}
                                className="text-red-500/60 hover:text-red-500 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Actions for rows */}
                  <div className="flex gap-2.5">
                    <button 
                      onClick={addInvoiceRow}
                      className="px-3 py-1.5 border border-dashed border-gray-800 hover:border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Bill Line
                    </button>
                  </div>

                  {/* Taxation Breakdowns */}
                  <div className="border-t border-gray-800 pt-4 flex flex-col items-end text-xs font-light space-y-2 text-gray-400">
                    <div className="flex justify-between w-64 border-b border-gray-900 pb-1">
                      <span>Subtotal (Taxable Value):</span>
                      <span className="font-mono text-white">${(artifact.data as InvoiceData).subtotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between w-64 border-b border-gray-900 pb-1">
                      <span>CGST (9.0% Central tax):</span>
                      <span className="font-mono text-white">${(artifact.data as InvoiceData).cgstAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between w-64 border-b border-gray-900 pb-1">
                      <span>SGST (9.0% State tax):</span>
                      <span className="font-mono text-white">${(artifact.data as InvoiceData).sgstAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between w-64 pt-1 font-bold text-sm text-emerald-400">
                      <span>Invoice Total (INR):</span>
                      <span className="font-mono">${(artifact.data as InvoiceData).grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                  </div>
                </div>

                {/* Export & Email Hooks */}
                <div className="flex gap-3 justify-end">
                  <button 
                    onClick={handleSendEmail}
                    className="px-4 py-2 bg-gray-900 border border-gray-800 hover:border-emerald-500/20 text-xs font-semibold rounded-xl text-gray-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Mail className="w-4 h-4 text-emerald-400" /> 
                    {emailStatus === 'sending' ? 'Sending...' : emailStatus === 'success' ? 'Email sent ✓' : 'Email to Client'}
                  </button>
                  <button 
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-xs font-bold text-[#0D1117] rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
                  >
                    <Printer className="w-4 h-4" /> Export compliant PDF
                  </button>
                </div>
              </div>
            )}

            {/* 4. DPR SITE PROGRESS VIEW */}
            {artifact.type === 'dpr' && (
              <div className="space-y-6">
                {/* Supervisor & Stats */}
                <div className="grid grid-cols-3 gap-4 bg-gray-950/50 p-4 border border-gray-900 rounded-2xl text-xs font-light">
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-500 font-mono block">DPR DATE</span>
                    <span className="text-white font-medium">{(artifact.data as DPRData).date}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-500 font-mono block">WEATHER CONDITIONS</span>
                    <span className="text-white font-medium text-amber-400">{(artifact.data as DPRData).weather}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-500 font-mono block">SUPERVISOR ON DUTY</span>
                    <span className="text-white font-medium">{(artifact.data as DPRData).supervisor}</span>
                  </div>
                </div>

                {/* Task Checklist progress */}
                <div className="bg-gray-950/20 border border-gray-900 rounded-2xl p-5 space-y-4">
                  <h4 className="text-xs font-semibold text-gray-400 font-mono uppercase tracking-wider border-b border-gray-900 pb-2">Active Site Checklists</h4>
                  <div className="space-y-2.5">
                    {(artifact.data as DPRData).tasks.map((t) => (
                      <div 
                        key={t.id}
                        onClick={() => toggleDPRTask(t.id)}
                        className="flex items-center justify-between p-3 rounded-xl bg-gray-900/30 border border-gray-900 hover:border-emerald-500/20 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4.5 h-4.5 rounded border flex items-center justify-center transition-colors ${
                            t.status === 'Completed' ? 'bg-emerald-500 border-emerald-500 text-[#090C11]' : 'border-gray-700 group-hover:border-emerald-500/30'
                          }`}>
                            {t.status === 'Completed' && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                          </div>
                          <div>
                            <p className={`text-xs ${t.status === 'Completed' ? 'line-through text-gray-500' : 'text-gray-200'}`}>{t.description}</p>
                            <span className="text-[9px] font-mono text-gray-500">{t.assignedTo}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          t.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : t.status === 'In Progress' ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-800 text-gray-500'
                        }`}>
                          {t.status} ({t.progress}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Material Delivery board log */}
                <div className="bg-gray-950/20 border border-gray-900 rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-900 pb-2">
                    <h4 className="text-xs font-semibold text-gray-400 font-mono uppercase tracking-wider">Materials Delivery Receipt Log</h4>
                    <button 
                      onClick={addDPRMaterialRow}
                      className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Log Material
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(artifact.data as DPRData).materials.map((m) => (
                      <div key={m.id} className="flex justify-between items-center p-2.5 bg-[#0F1420] rounded-xl border border-gray-900">
                        <div>
                          <p className="text-xs font-medium text-white">{m.material}</p>
                          <span className="text-[10px] text-gray-500 font-mono">Supplier: {m.supplier}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold font-mono text-white">{m.quantity} {m.unit}</p>
                          <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">
                            {m.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Speech to text transcript wrapper */}
                {((artifact.data as DPRData).audioTranscript) && (
                  <div className="bg-[#12100E] border border-orange-500/10 rounded-2xl p-5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-amber-500 font-mono flex items-center gap-1.5">
                        <Mic className="w-4 h-4 text-amber-500 animate-pulse" /> Whisper Audio Log Transcript
                      </span>
                    </div>
                    <textarea 
                      value={(artifact.data as DPRData).audioTranscript}
                      onChange={(e) => handleFieldChange('dpr', 'audioTranscript', e.target.value)}
                      className="w-full bg-black/40 border border-gray-900 rounded-xl p-3 text-xs text-gray-300 font-light font-mono focus:outline-none focus:border-amber-500/45 leading-relaxed"
                      rows={4}
                      placeholder="Whisper audio progressive transcript loads here..."
                    />
                  </div>
                )}
              </div>
            )}

            {/* 5. KANBAN / INVENTORY VIEW */}
            {artifact.type === 'kanban' && (
              <div className="space-y-6">
                {/* Raw supply stock levels analytics via Recharts */}
                <div className="bg-gray-950/40 p-5 border border-gray-900 rounded-2xl space-y-4">
                  <h4 className="text-xs font-semibold text-gray-400 font-mono uppercase tracking-wider border-b border-gray-900 pb-2">Supply Stock Level Analytics</h4>
                  
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={(artifact.data as KanbanData).inventory}>
                        <XAxis dataKey="name" stroke="#6B7280" fontSize={10} tickLine={false} />
                        <YAxis stroke="#6B7280" fontSize={10} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#090D11', borderColor: '#1F2937', color: '#F3F4F6' }} />
                        <Bar dataKey="stockLevel" fill="#10B981" radius={[4, 4, 0, 0]}>
                          {
                            (artifact.data as KanbanData).inventory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.stockLevel < entry.minLevel ? '#EF4444' : '#10B981'} />
                            ))
                          }
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-4 text-[10px] font-mono">
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Healthy Inventory Stock
                    </div>
                    <div className="flex items-center gap-1.5 text-red-400">
                      <span className="w-2.5 h-2.5 rounded bg-red-500" /> Re-order threshold alert
                    </div>
                  </div>
                </div>

                {/* Worker Payroll records */}
                <div className="bg-gray-950/20 border border-gray-900 rounded-2xl p-5 space-y-3.5">
                  <h4 className="text-xs font-semibold text-gray-400 font-mono uppercase tracking-wider border-b border-gray-900 pb-2">Active Labor Rosters & Payroll Tracker</h4>
                  <div className="divide-y divide-gray-900">
                    {(artifact.data as KanbanData).payroll.map((p) => (
                      <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-white">{p.name}</p>
                          <span className="text-[10px] text-gray-500 font-mono">{p.role} | Daily rate: ${p.dailyRate}</span>
                        </div>
                        <div className="flex items-center gap-4 text-right">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-gray-500 font-mono">Days:</span>
                            <input 
                              type="number" 
                              value={p.daysWorked} 
                              onChange={(e) => updatePayrollDays(p.id, parseInt(e.target.value) || 0)}
                              className="w-10 bg-[#121620] border border-gray-800 rounded px-1.5 py-0.5 text-center text-white font-mono text-xs"
                            />
                          </div>
                          <div>
                            <p className="font-mono font-semibold text-white">${p.totalPay.toLocaleString()}</p>
                            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                              {p.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Simple Kanban columns */}
                <div className="bg-gray-950/20 border border-gray-900 rounded-2xl p-5 space-y-4">
                  <h4 className="text-xs font-semibold text-gray-400 font-mono uppercase tracking-wider border-b border-gray-900 pb-2">Site Management Tasks</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {/* Columns: Todo, In Progress, Completed */}
                    {(['todo', 'inprogress', 'completed'] as const).map((col) => (
                      <div key={col} className="p-2.5 bg-[#090D14] rounded-xl border border-gray-900 flex flex-col gap-2 min-h-[160px]">
                        <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-gray-500 text-center pb-1 border-b border-gray-950">
                          {col === 'todo' ? 'TO DO' : col === 'inprogress' ? 'IN PROG' : 'DONE'}
                        </span>
                        
                        {(artifact.data as KanbanData).tasks
                          .filter((t) => t.status === col)
                          .map((task) => (
                            <div 
                              key={task.id} 
                              className="p-2 bg-[#121620] border border-gray-800 rounded-lg space-y-1 cursor-grab active:cursor-grabbing hover:border-gray-700 transition-colors"
                            >
                              <p className="text-[11px] font-semibold text-white leading-tight">{task.title}</p>
                              <div className="flex justify-between items-center text-[9px] text-gray-500 font-mono">
                                <span>{task.priority}</span>
                                <span className="text-emerald-400">{task.assignedTo}</span>
                              </div>
                              <div className="pt-1.5 flex justify-end gap-1 border-t border-gray-950">
                                {col !== 'todo' && (
                                  <button 
                                    onClick={() => moveKanbanTask(task.id, col === 'completed' ? 'inprogress' : 'todo')}
                                    className="text-[8px] bg-gray-900 text-gray-400 px-1 py-0.5 rounded hover:text-white"
                                  >
                                    ◀
                                  </button>
                                )}
                                {col !== 'completed' && (
                                  <button 
                                    onClick={() => moveKanbanTask(task.id, col === 'todo' ? 'inprogress' : 'completed')}
                                    className="text-[8px] bg-gray-900 text-emerald-400 px-1 py-0.5 rounded hover:bg-emerald-500 hover:text-black"
                                  >
                                    ▶
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 6. AI INTERIOR DESIGN FLUX CANVAS VIEW */}
            {artifact.type === 'design' && (
              <div className="space-y-6">
                
                {/* Live Render Canvas Frame */}
                <div className="relative rounded-2xl overflow-hidden border border-gray-900 aspect-video bg-gray-950 flex flex-col items-center justify-center shadow-inner group">
                  {(artifact.data as DesignData).imageUrl ? (
                    <>
                      <img 
                        src={(artifact.data as DesignData).imageUrl} 
                        alt="AI Interior Render" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur border border-gray-950 text-[10px] font-mono text-emerald-400 px-2.5 py-1 rounded-md">
                        Rendered with @google/genai Model Image API
                      </div>
                    </>
                  ) : (
                    <div className="p-6 text-center space-y-3">
                      <Paintbrush className="w-10 h-10 text-purple-500 mx-auto animate-pulse" />
                      <p className="text-sm font-semibold text-white">Interior Design Canvas Sandbox</p>
                      <p className="text-xs text-gray-500 max-w-sm mx-auto font-light leading-relaxed">Customize your design constraints below and click generate to render a beautiful high-fidelity photographic perspective.</p>
                    </div>
                  )}

                  {isGeneratingImg && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-3">
                      <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                      <p className="text-xs font-mono text-emerald-400 animate-pulse uppercase tracking-widest">Generating High-Quality AI Design Rendering...</p>
                      <p className="text-[10px] text-gray-500 font-mono">Calling gemini-3.1-flash-lite-image server side</p>
                    </div>
                  )}
                </div>

                {/* Image parameters and Prompt customizer */}
                <div className="bg-gray-950/20 border border-gray-900 rounded-2xl p-5 space-y-4">
                  <h4 className="text-xs font-semibold text-gray-400 font-mono uppercase tracking-wider border-b border-gray-900 pb-2">Rendering Directives & Constraints</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-gray-500 font-mono mb-1">AI IMAGE PROMPT DESCRIPTION</label>
                      <textarea 
                        value={(artifact.data as DesignData).prompt}
                        onChange={(e) => handleFieldChange('design', 'prompt', e.target.value)}
                        className="w-full bg-[#121620] border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500/55 font-light"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-gray-500 font-mono mb-1">VIEWPORT TYPE</label>
                        <select 
                          value={(artifact.data as DesignData).viewType}
                          onChange={(e) => handleFieldChange('design', 'viewType', e.target.value)}
                          className="w-full bg-[#121620] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                        >
                          <option value="Living Room">Living Room</option>
                          <option value="Kitchen">Kitchen</option>
                          <option value="Bathroom">Bathroom</option>
                          <option value="Bedroom">Bedroom</option>
                          <option value="Exterior Elevation">Exterior Elevation</option>
                          <option value="Office Space">Office Space</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 font-mono mb-1">STYLE THEME</label>
                        <select 
                          value={(artifact.data as DesignData).style}
                          onChange={(e) => handleFieldChange('design', 'style', e.target.value)}
                          className="w-full bg-[#121620] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                        >
                          <option value="Modern Minimalist">Modern Minimalist</option>
                          <option value="Japandi">Japandi</option>
                          <option value="Industrial">Industrial</option>
                          <option value="Biophilic">Biophilic</option>
                          <option value="Classic Luxury">Classic Luxury</option>
                          <option value="Mid-Century Modern">Mid-Century Modern</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Materials selection tags */}
                  <div className="space-y-2">
                    <span className="block text-[10px] text-gray-500 font-mono">SPECIFIED INTERIOR FINISHES</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(artifact.data as DesignData).materials.map((m, i) => (
                        <span key={i} className="text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-full">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Color Palette visualization */}
                  <div className="space-y-2">
                    <span className="block text-[10px] text-gray-500 font-mono">GENERATED MOODBOARD PALETTE</span>
                    <div className="flex gap-2">
                      {(artifact.data as DesignData).colorPalette.map((color, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                          <div className="w-8 h-8 rounded-lg shadow border border-gray-950" style={{ backgroundColor: color }} />
                          <span className="text-[8px] font-mono text-gray-500">{color}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={handleGenerateDesign}
                    disabled={isGeneratingImg}
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 text-white hover:text-black font-semibold rounded-xl text-xs transition-all duration-200 flex items-center justify-center gap-2 group shadow-lg shadow-purple-500/10 cursor-pointer"
                  >
                    <Sparkles className="w-4.5 h-4.5 group-hover:animate-spin" /> 
                    {isGeneratingImg ? 'Synthesizing Room Layout...' : 'Generate Photorealistic AI Rendering'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
