import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Edit2,
  Trash2,
  Volume2,
  ArrowRight,
  Clock,
  Square,
  Check,
  FileText,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Customer, VoiceParseResult } from '../../types';
import { api } from '../../api/client';
import { AddEntryDraftData } from './AddEntryModal';

interface VoiceEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (customerId?: string) => void;
  customers: Customer[];
  preselectedCustomerId?: string;
  onFallbackToManual: (partialData?: AddEntryDraftData) => void;
}

// Strict state machine: Recording → Transcript → Structured Draft (Human Review) → Save
type VoiceStep = 'idle' | 'recording' | 'transcript' | 'processing' | 'draft' | 'saving' | 'error';

export const VoiceEntryModal: React.FC<VoiceEntryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  customers,
  preselectedCustomerId,
  onFallbackToManual,
}) => {
  const [step, setStep] = useState<VoiceStep>('idle');
  const [transcript, setTranscript] = useState('');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [parsedDraft, setParsedDraft] = useState<VoiceParseResult | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState<number[]>([20, 45, 70, 30, 80, 50, 65, 35, 90, 40]);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('idle');
      setTranscript('');
      setRecordingSeconds(0);
      setParsedDraft(null);
      setIsEditing(false);
      setErrorMessage(null);
    } else {
      stopListening();
    }
  }, [isOpen]);

  // Audio waveform animation and recording timer
  useEffect(() => {
    let animInterval: any;
    if (step === 'recording') {
      animInterval = setInterval(() => {
        setAudioLevel(Array.from({ length: 12 }, () => Math.floor(15 + Math.random() * 80)));
      }, 100);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      clearInterval(animInterval);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  const startListening = () => {
    setErrorMessage(null);
    setRecordingSeconds(0);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage("Voice entry isn't supported in this browser. Please use Manual Entry.");
      setStep('error');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'hi-IN'; // Indian English / Hindi mix

      recognition.onstart = () => {
        setStep('recording');
        setTranscript('');
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setErrorMessage('Microphone access was denied. Please allow microphone permissions or switch to Manual Entry.');
        } else {
          setErrorMessage('Could not capture audio clearly. Please try speaking again or switch to Manual Entry.');
        }
        setStep('error');
      };

      recognition.onend = () => {
        setTranscript((latest) => {
          if (latest && latest.trim().length > 3) {
            // Strict state machine: transitions from Recording -> Transcript
            setStep('transcript');
          } else if (step === 'recording') {
            setStep('idle');
          }
          return latest;
        });
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Recognition launch failed:', err?.message);
      setErrorMessage('Microphone access is blocked. Allow microphone access or switch to Manual Entry.');
      setStep('error');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // ignore
      }
    }
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Step 2 -> Step 3: Process Transcript into Structured Draft
  const handleProcessTranscript = async (textToProcess: string) => {
    if (!textToProcess.trim()) return;
    setStep('processing');
    setErrorMessage(null);

    try {
      const response = await api.parseVoice(textToProcess);
      if (response && response.data) {
        setParsedDraft(response.data);
        // Strict state machine: transitions from Processing -> Structured Draft
        setStep('draft');
      } else {
        throw new Error('Could not parse transaction from voice transcript');
      }
    } catch (err: any) {
      // Preserve transcript and transition to error
      setErrorMessage(err?.message || 'Unable to parse speech into structured draft.');
      setStep('error');
    }
  };

  // Quick preset voice triggers for zero-friction testing
  const handleSimulateVoice = (samplePhrase: string) => {
    setTranscript(samplePhrase);
    setStep('transcript');
  };

  // Step 3 -> Step 4: Confirm and Save Structured Draft
  const handleConfirmAndSave = async () => {
    if (!parsedDraft) return;
    setStep('saving');
    setErrorMessage(null);

    try {
      // Find or match customer
      let customerId: string | undefined = preselectedCustomerId || undefined;
      if (parsedDraft.customerName) {
        const found = customers.find(
          (c) => c.name.toLowerCase() === parsedDraft.customerName?.toLowerCase()
        );
        if (found) {
          customerId = found.id;
        } else {
          // Create new customer profile inline
          const created = await api.createCustomer({
            name: parsedDraft.customerName,
            phone: '+91 98000 00000',
            notes: 'Created via voice transaction',
          });
          customerId = created.id;
        }
      }

      await api.createTransaction({
        customerId: customerId,
        customerName: parsedDraft.customerName || 'Voice Entry Customer',
        type: parsedDraft.type,
        items: parsedDraft.items.map((it, idx) => ({
          id: `voice_${idx}`,
          name: it.name,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          total: it.total,
        })),
        totalAmount: parsedDraft.totalAmount,
        paidAmount: parsedDraft.paidAmount,
        udhaarAmount: parsedDraft.udhaarAmount,
        paymentMode: parsedDraft.udhaarAmount > 0 ? 'credit' : 'cash',
        billNumber: `BILL-${Math.floor(1000 + Math.random() * 9000)}`,
        notes: `Voice transaction: "${parsedDraft.rawTranscript}"`,
        date: new Date().toISOString(),
      });

      onSuccess(customerId || preselectedCustomerId);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save voice entry.');
      setStep('draft');
    }
  };

  // Seamless Fallback: Switch to Manual Entry with pre-populated fields
  const handleSwitchToManual = () => {
    stopListening();
    onClose();
    const partialData: AddEntryDraftData = {
      customerId: preselectedCustomerId,
      customerName: parsedDraft?.customerName,
      type: parsedDraft?.type || 'sale',
      items: parsedDraft?.items?.map((it) => ({
        name: it.name,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        total: it.total,
      })),
      totalAmount: parsedDraft?.totalAmount,
      paidAmount: parsedDraft?.paidAmount,
      udhaarAmount: parsedDraft?.udhaarAmount,
      notes: transcript ? `Voice note: "${transcript}"` : undefined,
    };
    onFallbackToManual(partialData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        stopListening();
        onClose();
      }}
      title="Voice Transaction Entry"
      subtitle="Speak naturally in Hindi or English to record bills and udhaar"
      maxWidth="md"
    >
      {/* State Progress Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        <span className={step === 'idle' || step === 'recording' ? 'text-blue-600 font-extrabold' : ''}>
          1. Record
        </span>
        <span>→</span>
        <span className={step === 'transcript' || step === 'processing' ? 'text-blue-600 font-extrabold' : ''}>
          2. Transcript
        </span>
        <span>→</span>
        <span className={step === 'draft' || step === 'saving' ? 'text-blue-600 font-extrabold' : ''}>
          3. Human Review
        </span>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. STATE: RECORDING (IDLE / LISTENING) */}
      {/* ------------------------------------------------------------- */}
      {(step === 'idle' || step === 'recording') && (
        <div className="py-6 text-center space-y-6">
          <div className="relative inline-block">
            {step === 'recording' && (
              <div className="absolute -inset-4 rounded-full bg-blue-500/20 animate-ping pointer-events-none" />
            )}
            <button
              type="button"
              onClick={step === 'recording' ? stopListening : startListening}
              className={`w-28 h-28 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xl active:scale-95 mx-auto ${
                step === 'recording'
                  ? 'bg-rose-600 text-white shadow-rose-500/40 ring-4 ring-rose-200 animate-pulse'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30 hover:scale-105'
              }`}
            >
              {step === 'recording' ? (
                <Square className="w-10 h-10 fill-white" />
              ) : (
                <Mic className="w-12 h-12" />
              )}
            </button>
          </div>

          <div>
            <h4 className="text-lg font-bold text-slate-900">
              {step === 'recording' ? 'Listening...' : 'Tap To Speak'}
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              {step === 'recording'
                ? `Recording in progress · ${String(Math.floor(recordingSeconds / 60)).padStart(2, '0')}:${String(recordingSeconds % 60).padStart(2, '0')}`
                : 'Example: "Sold 3 Tata Salt to Rahul for ₹90"'}
            </p>
          </div>

          {step === 'recording' && (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-1.5 h-10 py-1">
                {audioLevel.map((lvl, idx) => (
                  <div
                    key={idx}
                    className="w-1.5 bg-blue-600 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(6, lvl)}%` }}
                  />
                ))}
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={stopListening}
                className="text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                Done Speaking
              </Button>
            </div>
          )}

          {transcript && (
            <div className="p-3 bg-slate-100 rounded-2xl text-xs font-medium text-slate-800 italic max-w-sm mx-auto border border-slate-200">
              "{transcript}"
            </div>
          )}

          {step === 'idle' && (
            <div className="pt-4 border-t border-slate-100">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Quick Sample Phrases:
              </p>
              <div className="flex flex-col gap-2 max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={() => handleSimulateVoice('Sold 3 Tata Salt to Rahul for 90 rupees')}
                  className="text-left text-xs p-2.5 rounded-xl bg-blue-50/70 hover:bg-blue-100/80 text-blue-900 border border-blue-200/60 transition-colors font-medium cursor-pointer"
                >
                  "Sold 3 Tata Salt to Rahul for 90 rupees"
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateVoice('Amit Kumar ne 1450 rupaye jama kiye')}
                  className="text-left text-xs p-2.5 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-900 border border-emerald-200/60 transition-colors font-medium cursor-pointer"
                >
                  "Amit Kumar ne 1450 rupaye jama kiye" (Payment)
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateVoice('Ramesh gave 500 rupees udhaar payment')}
                  className="text-left text-xs p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/60 transition-colors font-medium cursor-pointer"
                >
                  "Ramesh gave 500 rupees udhaar payment"
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. STATE: TRANSCRIPT (INTERMEDIATE RECOGNITION REVIEW) */}
      {/* ------------------------------------------------------------- */}
      {step === 'transcript' && (
        <div className="space-y-5 py-4">
          <div className="text-center">
            <h4 className="text-base font-bold text-slate-900">Transcript Captured</h4>
            <p className="text-xs text-slate-500 mt-0.5">Review the recognized speech before structuring</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Recognized Audio Text
            </label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={3}
              className="w-full text-xs sm:text-sm p-3 bg-white rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Captured transcript..."
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setTranscript('');
                setStep('idle');
              }}
            >
              Re-record
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleSwitchToManual}
                icon={<FileText className="w-3.5 h-3.5" />}
              >
                Switch to Manual
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={() => handleProcessTranscript(transcript)}
                icon={<Sparkles className="w-3.5 h-3.5" />}
              >
                Structure with AI
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* PROCESSING STATE */}
      {/* ------------------------------------------------------------- */}
      {step === 'processing' && (
        <div className="py-14 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto animate-spin">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">Structuring Voice Entry...</h4>
            <p className="text-xs text-slate-500 mt-0.5">Detecting customer, items, prices, and payment mode</p>
          </div>
          {transcript && (
            <p className="text-xs text-blue-700 font-semibold italic max-w-xs mx-auto">
              "{transcript}"
            </p>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. STATE: STRUCTURED DRAFT (HUMAN REVIEW & EDIT) */}
      {/* ------------------------------------------------------------- */}
      {(step === 'draft' || step === 'saving') && parsedDraft && (
        <div className="space-y-4 pt-1">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold text-emerald-800">
                Structured Draft Ready ({Math.round(parsedDraft.confidence * 100)}% Confidence)
              </span>
            </div>
            <button
              onClick={() => setStep('transcript')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>

          {/* Structured Draft Fields */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="grow mr-4">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Customer</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={parsedDraft.customerName || ''}
                    onChange={(e) => setParsedDraft({ ...parsedDraft, customerName: e.target.value })}
                    className="text-xs p-1.5 border border-slate-200 rounded-lg w-full mt-1 font-semibold"
                    placeholder="Customer Name"
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-900">{parsedDraft.customerName || 'Customer'}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Type</p>
                <span className="inline-block text-xs font-bold uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {parsedDraft.type}
                </span>
              </div>
            </div>

            {/* Line Items */}
            {parsedDraft.items && parsedDraft.items.length > 0 && (
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Line Items</p>
                <div className="space-y-1.5">
                  {parsedDraft.items.map((it, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between text-xs p-2.5 bg-slate-50 rounded-xl gap-2">
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            value={it.name}
                            onChange={(e) => {
                              const newItems = [...parsedDraft.items];
                              newItems[idx].name = e.target.value;
                              setParsedDraft({ ...parsedDraft, items: newItems });
                            }}
                            className="p-1.5 border border-slate-200 rounded-lg text-xs w-full sm:grow font-medium"
                            placeholder="Product name"
                          />
                          <div className="flex items-center gap-2 justify-end">
                            <input
                              type="number"
                              min="1"
                              value={it.quantity}
                              onChange={(e) => {
                                const newItems = [...parsedDraft.items];
                                const q = Math.max(1, Number(e.target.value) || 1);
                                newItems[idx].quantity = q;
                                newItems[idx].total = q * newItems[idx].unitPrice;
                                const newTot = newItems.reduce((s, i) => s + i.total, 0);
                                setParsedDraft({ ...parsedDraft, items: newItems, totalAmount: newTot });
                              }}
                              className="p-1.5 border border-slate-200 rounded-lg text-xs w-16 text-center font-semibold"
                              title="Quantity"
                            />
                            <input
                              type="number"
                              min="0"
                              value={it.unitPrice}
                              onChange={(e) => {
                                const newItems = [...parsedDraft.items];
                                const p = Math.max(0, Number(e.target.value) || 0);
                                newItems[idx].unitPrice = p;
                                newItems[idx].total = newItems[idx].quantity * p;
                                const newTot = newItems.reduce((s, i) => s + i.total, 0);
                                setParsedDraft({ ...parsedDraft, items: newItems, totalAmount: newTot });
                              }}
                              className="p-1.5 border border-slate-200 rounded-lg text-xs w-20 text-right font-bold tabular-nums"
                              title="Unit Price"
                            />
                            <span className="font-bold text-slate-900 min-w-[50px] text-right tabular-nums">
                              ₹{it.total}
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="font-semibold text-slate-800">{it.name}</span>
                          <span className="text-slate-500">Qty: {it.quantity} × ₹{it.unitPrice}</span>
                          <span className="font-bold text-slate-900 tabular-nums">₹{it.total}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Financials Breakdown */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Total Amount</p>
                <p className="text-xl font-bold text-slate-900 tabular-nums">
                  ₹{parsedDraft.totalAmount.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="text-right">
                {parsedDraft.udhaarAmount > 0 ? (
                  <div>
                    <p className="text-xs text-rose-600 font-semibold">Recorded as Udhaar</p>
                    <p className="text-lg font-bold text-rose-600 tabular-nums">
                      ₹{parsedDraft.udhaarAmount.toLocaleString('en-IN')}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-emerald-600 font-semibold">Paid in Full</p>
                    <p className="text-lg font-bold text-emerald-600 tabular-nums">
                      ₹{parsedDraft.paidAmount.toLocaleString('en-IN')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleSwitchToManual}
              icon={<FileText className="w-3.5 h-3.5" />}
            >
              Switch to Manual
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Done Editing' : 'Edit Fields'}
              </Button>

              <Button
                type="button"
                loading={step === 'saving'}
                onClick={handleConfirmAndSave}
                icon={<Check className="w-4 h-4" />}
              >
                Save Record
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. STATE: ERROR & SEAMLESS FALLBACK TO MANUAL */}
      {/* ------------------------------------------------------------- */}
      {step === 'error' && (
        <div className="py-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">
              Could not parse voice into structured entry
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {errorMessage || 'Background noise or complex phrasing prevented automatic parsing.'}
            </p>
          </div>

          {/* Preserved speech transcript */}
          {transcript && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 text-left max-w-md mx-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Preserved Audio Transcript:
              </span>
              <p className="italic font-medium">"{transcript}"</p>
            </div>
          )}

          <div className="flex items-center justify-center gap-3 pt-2">
            <Button variant="secondary" onClick={() => setStep('idle')}>
              Try Again
            </Button>
            {/* Seamless switch to manual with pre-populated transcript */}
            <Button onClick={handleSwitchToManual} icon={<FileText className="w-4 h-4" />}>
              Switch to Manual
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
