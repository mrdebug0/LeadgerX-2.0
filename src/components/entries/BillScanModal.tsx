import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Edit2,
  Trash2,
  Plus,
  FileText,
  UserCheck,
  Video,
  X,
  UserPlus,
  Search,
  Check,
  ArrowRight,
  Receipt,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Customer, BillExtractionResult, TransactionType } from '../../types';
import { api } from '../../api/client';
import { AddEntryDraftData } from './AddEntryModal';

interface BillScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (customerId?: string) => void;
  customers: Customer[];
  initialMode?: 'camera' | 'upload';
  preselectedCustomerId?: string;
  onFallbackToManual?: (partialData?: AddEntryDraftData) => void;
}

type ScanStep = 'capture' | 'camera_live' | 'image_preview' | 'processing' | 'review' | 'error';

export const BillScanModal: React.FC<BillScanModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  customers,
  initialMode = 'camera',
  preselectedCustomerId,
  onFallbackToManual,
}) => {
  const [step, setStep] = useState<ScanStep>('capture');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<BillExtractionResult | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(preselectedCustomerId || '');
  const [entryType, setEntryType] = useState<TransactionType>('purchase');
  const [paymentChoice, setPaymentChoice] = useState<'full' | 'udhaar'>('full');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [processingStage, setProcessingStage] = useState(1);

  // Video and stream refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // SVG Mock Bill for instant one-click testing
  const sampleBillData = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500" fill="%23FFFFFF"><rect width="400" height="500" fill="%23F8FAFC"/><text x="200" y="50" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="%230F172A">GUPTA WHOLESALE TRADERS</text><text x="200" y="70" font-family="sans-serif" font-size="11" text-anchor="middle" fill="%2364748B">Main Wholesale Mandi, Delhi · GSTIN: 07AAAP1004P1Z5</text><line x1="30" y1="90" x2="370" y2="90" stroke="%23CBD5E1" stroke-dasharray="4"/><text x="30" y="115" font-family="sans-serif" font-size="12" fill="%23334155">Bill No: #INV-4471</text><text x="370" y="115" font-family="sans-serif" font-size="12" text-anchor="end" fill="%23334155">Date: 14-Nov-2025</text><line x1="30" y1="130" x2="370" y2="130" stroke="%23CBD5E1"/><text x="30" y="160" font-family="sans-serif" font-size="12" font-weight="bold" fill="%230F172A">Basmati Rice Special (5kg) x2</text><text x="370" y="160" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="end" fill="%230F172A">960.00</text><text x="30" y="195" font-family="sans-serif" font-size="12" font-weight="bold" fill="%230F172A">Toor Dal Premium (1kg) x3</text><text x="370" y="195" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="end" fill="%230F172A">480.00</text><text x="30" y="230" font-family="sans-serif" font-size="12" font-weight="bold" fill="%230F172A">Fortune Sunlite Oil (1L) x4</text><text x="370" y="230" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="end" fill="%230F172A">580.00</text><text x="30" y="265" font-family="sans-serif" font-size="12" font-weight="bold" fill="%230F172A">Tata Salt (1kg) x5</text><text x="370" y="265" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="end" fill="%230F172A">150.00</text><line x1="30" y1="290" x2="370" y2="290" stroke="%230F172A" stroke-width="2"/><text x="30" y="325" font-family="sans-serif" font-size="16" font-weight="bold" fill="%230F172A">TOTAL AMOUNT</text><text x="370" y="325" font-family="sans-serif" font-size="18" font-weight="bold" text-anchor="end" fill="%232563EB">INR 2,170.00</text><text x="200" y="440" font-family="sans-serif" font-size="11" text-anchor="middle" fill="%2394A3B8">Thank you for your business!</text></svg>`;

  useEffect(() => {
    if (isOpen) {
      setStep('capture');
      setPreviewImage(null);
      setExtractedData(null);
      setErrorMessage(null);
      setSelectedCustomerId(preselectedCustomerId || '');
      setEntryType('purchase');
      setPaymentChoice('full');
      setProcessingStage(1);
    } else {
      stopCameraStream();
    }
  }, [isOpen, preselectedCustomerId]);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    setErrorMessage(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        fileInputRef.current?.click();
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      setStep('camera_live');
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 50);
    } catch (err: any) {
      console.warn('Webcam stream unavailable, falling back to file capture:', err?.message);
      fileInputRef.current?.click();
    }
  };

  const captureCameraSnapshot = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        stopCameraStream();
        setPreviewImage(dataUrl);
        setStep('image_preview');
      }
    } catch (e) {
      console.error('Snapshot failed:', e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setPreviewImage(b64);
      setStep('image_preview');
    };
    reader.readAsDataURL(file);
  };

  const handleUseSampleBill = () => {
    setPreviewImage(sampleBillData);
    startOcrProcess(sampleBillData, 'image/svg+xml');
  };

  // Linear guided OCR process with clear step-by-step stages
  const startOcrProcess = async (base64Img: string, mime: string) => {
    setStep('processing');
    setErrorMessage(null);
    setProcessingStage(1);

    const timer1 = setTimeout(() => setProcessingStage(2), 400);
    const timer2 = setTimeout(() => setProcessingStage(3), 1000);
    const timer3 = setTimeout(() => setProcessingStage(4), 1800);

    try {
      const response = await api.scanBill(base64Img, mime);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      if (response && response.data) {
        setExtractedData(response.data);
        setStep('review');
      } else {
        throw new Error('Could not parse bill data');
      }
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setErrorMessage("Couldn't read this bill automatically.");
      setStep('error');
    }
  };

  const handleItemFieldChange = (index: number, field: string, val: any) => {
    if (!extractedData) return;
    const items = [...extractedData.items];
    const current = items[index];

    if (field === 'quantity') {
      const q = Math.max(1, Number(val) || 1);
      items[index] = { ...current, quantity: q, total: q * current.unitPrice };
    } else if (field === 'unitPrice') {
      const p = Math.max(0, Number(val) || 0);
      items[index] = { ...current, unitPrice: p, total: current.quantity * p };
    } else if (field === 'name') {
      items[index] = { ...current, name: val };
    }

    const newSubtotal = items.reduce((sum, it) => sum + (it.total || 0), 0);
    const newTotal = newSubtotal + (extractedData.tax || 0);

    setExtractedData({
      ...extractedData,
      items,
      subtotal: newSubtotal,
      totalAmount: newTotal,
    });
  };

  const handleRemoveItem = (index: number) => {
    if (!extractedData || extractedData.items.length <= 1) return;
    const items = extractedData.items.filter((_, i) => i !== index);
    const newSubtotal = items.reduce((sum, it) => sum + (it.total || 0), 0);
    const newTotal = newSubtotal + (extractedData.tax || 0);
    setExtractedData({
      ...extractedData,
      items,
      subtotal: newSubtotal,
      totalAmount: newTotal,
    });
  };

  const handleAddBlankItem = () => {
    if (!extractedData) return;
    const items = [...extractedData.items, { name: '', quantity: 1, unitPrice: 0, total: 0 }];
    setExtractedData({
      ...extractedData,
      items,
    });
  };

  const handleSaveVerifiedBill = async () => {
    if (!extractedData) return;
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const activeCustomerId = selectedCustomerId || preselectedCustomerId || undefined;
      const selectedCust = customers.find((c) => c.id === activeCustomerId);
      const customerName = selectedCust
        ? selectedCust.name
        : extractedData.supplier || 'Vendor Wholesale';

      const totalAmt = extractedData.totalAmount || 0;
      const isUdhaar = paymentChoice === 'udhaar';
      const paidAmt = isUdhaar ? 0 : totalAmt;
      const udhaarAmt = isUdhaar ? totalAmt : 0;

      await api.createTransaction({
        customerId: activeCustomerId,
        customerName: customerName,
        type: entryType,
        items: extractedData.items.map((it, idx) => ({
          id: `extracted_${idx}`,
          name: it.name,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          total: it.total,
        })),
        totalAmount: totalAmt,
        paidAmount: paidAmt,
        udhaarAmount: udhaarAmt,
        paymentMode: isUdhaar ? 'credit' : 'bank_transfer',
        billNumber: extractedData.billNumber || `BILL-${Math.floor(1000 + Math.random() * 9000)}`,
        notes: `AI Bill Scan from ${extractedData.supplier || 'Vendor'}`,
        date: extractedData.date ? new Date(extractedData.date).toISOString() : new Date().toISOString(),
      });

      onSuccess(activeCustomerId);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unable to save bill transaction');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFallback = () => {
    stopCameraStream();
    onClose();
    if (onFallbackToManual) {
      const activeCustomerId = selectedCustomerId || preselectedCustomerId;
      const partialDraft: AddEntryDraftData = {
        customerId: activeCustomerId,
        type: entryType,
        items: extractedData?.items.map((it) => ({
          name: it.name,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          total: it.total,
        })),
        totalAmount: extractedData?.totalAmount,
        notes: extractedData ? `Bill from ${extractedData.supplier || 'supplier'}` : 'Scanned bill entry',
        billNumber: extractedData?.billNumber,
      };
      onFallbackToManual(partialDraft);
    }
  };

  const activeCustomer = customers.find(
    (c) => c.id === (selectedCustomerId || preselectedCustomerId)
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        stopCameraStream();
        onClose();
      }}
      title="Scan / Upload Bill (AI OCR)"
      subtitle="Extract supplier items, prices, and totals from invoices in seconds"
      maxWidth="lg"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Progress Path Indicator */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        <span className={step === 'capture' || step === 'camera_live' || step === 'image_preview' ? 'text-blue-600 font-extrabold' : ''}>
          1. Capture Bill
        </span>
        <span>→</span>
        <span className={step === 'processing' ? 'text-blue-600 font-extrabold' : ''}>
          2. OCR Processing
        </span>
        <span>→</span>
        <span className={step === 'review' ? 'text-blue-600 font-extrabold' : ''}>
          3. Review & Save
        </span>
      </div>

      {/* Context Banner: Customer Context preserved */}
      {activeCustomer && (
        <div className="p-2.5 mb-4 bg-blue-50/80 border border-blue-200/80 rounded-xl flex items-center justify-between text-xs text-blue-900 font-medium">
          <span>
            Recording bill for: <strong className="font-bold">{activeCustomer.name}</strong>
          </span>
          <span className="text-[11px] text-blue-700">({activeCustomer.phone})</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. STEP: CAPTURE / UPLOAD */}
      {/* ------------------------------------------------------------- */}
      {step === 'capture' && (
        <div className="space-y-6 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={startCamera}
              className="p-6 rounded-3xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 border border-blue-500 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 group active:scale-95"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <p className="text-base font-bold">Open Camera</p>
                <p className="text-xs text-blue-100 mt-0.5">Take photo of paper receipt</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-6 rounded-3xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-200/90 shadow-2xs text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 group active:scale-95"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-base font-bold">Upload Bill</p>
                <p className="text-xs text-slate-500 mt-0.5">Select image or invoice PDF</p>
              </div>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 text-center">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleUseSampleBill}
              icon={<FileText className="w-4 h-4" />}
            >
              Use Sample Wholesale Bill
            </Button>
          </div>
        </div>
      )}

      {/* CAMERA LIVE VIEWFINDER */}
      {step === 'camera_live' && (
        <div className="space-y-4">
          <div className="relative w-full aspect-4/3 max-h-[360px] bg-black rounded-2xl overflow-hidden flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute inset-5 border-2 border-dashed border-white/70 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
              <p className="text-[11px] text-white font-bold bg-black/60 px-3 py-1 rounded-full text-center mx-auto backdrop-blur-sm">
                Center bill within the framing box
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                stopCameraStream();
                setStep('capture');
              }}
            >
              Cancel
            </Button>
            <Button type="button" onClick={captureCameraSnapshot} icon={<Camera className="w-4 h-4" />}>
              Capture Photo
            </Button>
          </div>
        </div>
      )}

      {/* CAPTURED IMAGE PREVIEW */}
      {step === 'image_preview' && previewImage && (
        <div className="space-y-4">
          <div className="relative max-h-72 w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
            <img src={previewImage} alt="Bill Preview" className="max-h-72 w-auto object-contain" />
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setPreviewImage(null);
                setStep('capture');
              }}
            >
              Retake Photo
            </Button>
            <Button
              type="button"
              onClick={() => startOcrProcess(previewImage, 'image/jpeg')}
              icon={<Sparkles className="w-4 h-4" />}
            >
              Process with AI OCR
            </Button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. STEP: PROCESSING STATE (SPECIFIC CHECKLIST, NO GENERIC SPINNER) */}
      {/* ------------------------------------------------------------- */}
      {step === 'processing' && (
        <div className="py-6 text-center space-y-5">
          <div className="relative w-36 h-48 mx-auto rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-md">
            {previewImage && (
              <img src={previewImage} alt="Scanning" className="w-full h-full object-cover opacity-80" />
            )}
            <div className="absolute inset-x-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-500 animate-[scan_2s_ease-in-out_infinite]" />
          </div>

          <div>
            <h4 className="text-base font-bold text-slate-900">
              Extracting Bill Details with AI
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Analyzing items, quantities, and authoritative totals
            </p>
          </div>

          {/* Specific processing stage indicators */}
          <div className="max-w-xs mx-auto space-y-2 text-left bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs font-semibold">
            <div className={`flex items-center gap-2.5 ${processingStage >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>
              <span className={`w-2 h-2 rounded-full ${processingStage >= 1 ? 'bg-blue-600 animate-pulse' : 'bg-slate-300'}`} />
              <span>1. Scanning document layout & vendor</span>
            </div>
            <div className={`flex items-center gap-2.5 ${processingStage >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>
              <span className={`w-2 h-2 rounded-full ${processingStage >= 2 ? 'bg-blue-600 animate-pulse' : 'bg-slate-300'}`} />
              <span>2. Detecting items & product names</span>
            </div>
            <div className={`flex items-center gap-2.5 ${processingStage >= 3 ? 'text-blue-600' : 'text-slate-400'}`}>
              <span className={`w-2 h-2 rounded-full ${processingStage >= 3 ? 'bg-blue-600 animate-pulse' : 'bg-slate-300'}`} />
              <span>3. Extracting quantities & unit prices</span>
            </div>
            <div className={`flex items-center gap-2.5 ${processingStage >= 4 ? 'text-blue-600' : 'text-slate-400'}`}>
              <span className={`w-2 h-2 rounded-full ${processingStage >= 4 ? 'bg-blue-600 animate-pulse' : 'bg-slate-300'}`} />
              <span>4. Calculating totals & reconciling taxes</span>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. STEP: EDITABLE REVIEW FORM (HUMAN VERIFICATION) */}
      {/* ------------------------------------------------------------- */}
      {step === 'review' && extractedData && (
        <div className="space-y-4 pt-1">
          <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold text-emerald-800">
                Extracted with {Math.round(extractedData.confidence * 100)}% Confidence
              </span>
            </div>
            <button
              onClick={() => setStep('capture')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake</span>
            </button>
          </div>

          {/* Supplier & Bill Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Supplier / Vendor
              </label>
              <input
                type="text"
                value={extractedData.supplier || ''}
                onChange={(e) => setExtractedData({ ...extractedData, supplier: e.target.value })}
                className="w-full p-2 bg-white rounded-lg border border-slate-200 font-semibold"
                placeholder="Vendor Name"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Bill / Invoice Number
              </label>
              <input
                type="text"
                value={extractedData.billNumber || ''}
                onChange={(e) => setExtractedData({ ...extractedData, billNumber: e.target.value })}
                className="w-full p-2 bg-white rounded-lg border border-slate-200 font-semibold"
                placeholder="Bill #INV-XXXX"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Extracted Line Items ({extractedData.items.length})
              </span>
              <button
                type="button"
                onClick={handleAddBlankItem}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Row</span>
              </button>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1.5 border border-slate-200 rounded-2xl p-2 bg-white">
              {extractedData.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl text-xs">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleItemFieldChange(idx, 'name', e.target.value)}
                    className="grow p-1.5 bg-white rounded-lg border border-slate-200 font-medium"
                    placeholder="Item description"
                  />
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemFieldChange(idx, 'quantity', e.target.value)}
                    className="w-14 p-1.5 bg-white rounded-lg border border-slate-200 text-center font-semibold"
                    title="Quantity"
                  />
                  <input
                    type="number"
                    min="0"
                    value={item.unitPrice}
                    onChange={(e) => handleItemFieldChange(idx, 'unitPrice', e.target.value)}
                    className="w-20 p-1.5 bg-white rounded-lg border border-slate-200 text-right font-bold tabular-nums"
                    title="Unit Price"
                  />
                  <span className="min-w-[60px] text-right font-bold text-slate-900 tabular-nums">
                    ₹{item.total.toLocaleString('en-IN')}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Option & Authoritative Totals */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600">Payment:</span>
              <button
                type="button"
                onClick={() => setPaymentChoice('full')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  paymentChoice === 'full' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                Paid
              </button>
              <button
                type="button"
                onClick={() => setPaymentChoice('udhaar')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  paymentChoice === 'udhaar' ? 'bg-rose-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                Udhaar
              </button>
            </div>

            <div className="text-right">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Total Amount</span>
              <span className="text-lg font-bold text-slate-900 tabular-nums">
                ₹{extractedData.totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <Button type="button" variant="secondary" size="sm" onClick={handleFallback}>
              Enter Manually
            </Button>
            <Button
              type="button"
              loading={isSaving}
              onClick={handleSaveVerifiedBill}
              icon={<Check className="w-4 h-4" />}
            >
              Confirm & Save Bill
            </Button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. ERROR & GRACEFUL FALLBACK */}
      {/* ------------------------------------------------------------- */}
      {step === 'error' && (
        <div className="py-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">
              Couldn't read this bill automatically.
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {errorMessage || 'The lighting, blur, or receipt format made automatic extraction uncertain.'}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Button variant="secondary" onClick={() => setStep('capture')}>
              Try Again
            </Button>
            <Button onClick={handleFallback} icon={<FileText className="w-4 h-4" />}>
              Enter Manually
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
