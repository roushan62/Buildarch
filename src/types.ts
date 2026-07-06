/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'user' | 'assistant';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: string;
  artifactId?: string;
  isThinking?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}

export type ArtifactType = 'estimator' | 'boq' | 'invoice' | 'dpr' | 'kanban' | 'design';

export interface EstimatorData {
  length: number;
  width: number;
  height: number;
  type: 'residential' | 'commercial' | 'interior-fitout';
  floors: number;
  // Results
  cementBags: number;
  bricksCount: number;
  sandCft: number;
  aggregateCft: number;
  steelKg: number;
  paintLiters: number;
  tileSqFt: number;
  totalCostEstimate: number;
}

export interface BOQItem {
  id: string;
  itemNo: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
  category: 'Civil' | 'Interior' | 'Electrical' | 'Plumbing' | 'Finishes';
}

export interface BOQData {
  projectName: string;
  clientName: string;
  items: BOQItem[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  hsnCode: string;
  qty: number;
  rate: number;
  taxableValue: number;
  cgstRate: number; // e.g. 9 for 9%
  sgstRate: number;
  igstRate: number;
  total: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  clientName: string;
  clientGSTIN: string;
  vendorName: string;
  vendorGSTIN: string;
  items: InvoiceItem[];
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  grandTotal: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
}

export interface DPRTask {
  id: string;
  description: string;
  assignedTo: string;
  progress: number; // 0 to 100
  status: 'Pending' | 'In Progress' | 'Completed';
}

export interface DPRMaterialLog {
  id: string;
  material: string;
  quantity: number;
  unit: string;
  supplier: string;
  status: 'Received' | 'Delayed' | 'Damaged';
}

export interface DPRData {
  date: string;
  weather: string;
  supervisor: string;
  workforceCount: number;
  tasks: DPRTask[];
  materials: DPRMaterialLog[];
  safetyNotes: string;
  audioRecordingUrl?: string;
  audioTranscript?: string;
}

export interface KanbanItem {
  id: string;
  title: string;
  description: string;
  category: 'supply' | 'payroll' | 'inspection';
  status: 'todo' | 'inprogress' | 'completed';
  assignedTo: string;
  priority: 'Low' | 'Medium' | 'High';
  date: string;
}

export interface SupplyInventory {
  id: string;
  name: string;
  category: string;
  stockLevel: number;
  minLevel: number;
  unit: string;
  unitPrice: number;
}

export interface LaborPayroll {
  id: string;
  name: string;
  role: string;
  dailyRate: number;
  daysWorked: number;
  allowance: number;
  totalPay: number;
  status: 'Paid' | 'Pending';
}

export interface KanbanData {
  tasks: KanbanItem[];
  inventory: SupplyInventory[];
  payroll: LaborPayroll[];
}

export interface DesignData {
  prompt: string;
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:3';
  imageUrl: string;
  materials: string[];
  colorPalette: string[];
  viewType: 'Living Room' | 'Kitchen' | 'Exterior Elevation' | 'Office Space' | 'Bedroom' | 'Bathroom';
  style: 'Modern Minimalist' | 'Japandi' | 'Industrial' | 'Biophilic' | 'Classic Luxury' | 'Mid-Century Modern';
  isGenerating?: boolean;
}

export interface Artifact {
  id: string;
  type: ArtifactType;
  title: string;
  data: EstimatorData | BOQData | InvoiceData | DPRData | KanbanData | DesignData;
  version: number;
}
