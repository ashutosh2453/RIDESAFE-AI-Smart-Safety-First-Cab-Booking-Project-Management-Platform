import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ShieldAlert,
  Shield,
  PhoneCall,
  Share2,
  AlertTriangle,
  Info,
  CheckCircle2,
  Phone,
  UserCheck,
  AlertOctagon,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api';
import { TrustedContact, Ride } from '../types';
import { Modal } from '../components/Modal';

export const SafetyCenterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const rideId = searchParams.get('rideId');

  const [ride, setRide] = useState<Ride | null>(null);
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [safetyEvents, setSafetyEvents] = useState<any[]>([]);
  const [guidance, setGuidance] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // SOS modal state
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [sosResult, setSosResult] = useState<any | null>(null);

  // Share modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  const fetchSafetyOverview = async () => {
    try {
      const res = await api.get(`/rides/${rideId || 'overview'}/safety${rideId ? `?rideId=${rideId}` : ''}`);
      if (res.data.success) {
        setRide(res.data.data.currentRide);
        setContacts(res.data.data.trustedContacts || []);
        setSafetyEvents(res.data.data.safetyEvents || []);
        setGuidance(res.data.data.safetyGuidance || []);
      }
    } catch {
      // Fallback: fetch trusted contacts directly
      const contactsRes = await api.get('/trusted-contacts').catch(() => ({ data: { data: [] } }));
      setContacts(contactsRes.data.data || []);
      setGuidance([
        'Always check the vehicle registration plate and car color before opening doors.',
        'Never board if the driver refuses to verify your 4-digit Ride PIN.',
        'Share your live trip with a family member or trusted friend before starting.',
        'If you feel uncomfortable or unsafe at any moment, use the prominent "I Don\'t Feel Safe" button.',
        'Prototype Notice: This platform demonstrates safety workflows. In real danger, always dial 112 directly.',
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSafetyOverview();
  }, [rideId]);

  const handleTriggerSos = async () => {
    try {
      const res = await api.post(`/rides/${rideId || 'emergency'}/sos`, {
        details: 'SOS button triggered by passenger from Safety Center console.',
      });
      if (res.data.success) {
        setSosResult(res.data.data);
        setSosActive(true);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to trigger SOS protocol.');
    }
  };

  const handleGenerateShare = async () => {
    if (!rideId) {
      alert('Trip sharing requires an active ride. Please book or select an active ride.');
      return;
    }
    try {
      const res = await api.post(`/rides/${rideId}/share`);
      if (res.data.success) {
        setShareUrl(`${window.location.origin}${res.data.data.shareableUrl}`);
        setIsShareModalOpen(true);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Could not generate share link.');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fadeIn">
      {/* Title */}
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-black tracking-widest uppercase text-red-400 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4" />
          PASSENGER PROTECTION COMMAND
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
          Safety Center
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          High-priority emergency tools, trusted contact network, vehicle checks, and live trip sharing
        </p>
      </div>

      {/* Prototype Disclaimer Banner */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-300 flex items-start gap-3">
        <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Prototype Safety Feature Notice</p>
          <p className="mt-0.5 text-slate-400">
            This student demonstration does not directly contact municipal police, ambulance dispatchers, or emergency responders.
            In any actual life-threatening emergency, dial <strong>112 (India)</strong> or your local emergency dispatch immediately.
          </p>
        </div>
      </div>

      {/* GIANT SOS EMERGENCY ACTION CARD */}
      <div className="rounded-3xl border-2 border-red-500/50 bg-gradient-to-b from-red-950/40 via-slate-900 to-red-950/20 p-6 sm:p-8 text-center shadow-2xl shadow-red-500/15">
        <div className="max-w-md mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 border border-red-500/40 px-3 py-1 text-xs font-extrabold text-red-300 uppercase tracking-wider">
            Critical Emergency Action
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Need Immediate Help?
          </h2>
          <p className="text-xs text-slate-400">
            Press the emergency SOS button to trigger safety incident logging, notify registered trusted contacts, and launch emergency protocols.
          </p>

          <button
            onClick={() => setIsSosModalOpen(true)}
            className="w-full max-w-xs mx-auto py-5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black text-lg tracking-wider shadow-2xl shadow-red-600/40 transition hover:scale-105 active:scale-95 flex items-center justify-center gap-3 animate-pulse"
          >
            <ShieldAlert className="h-7 w-7" />
            <span>TRIGGER SOS</span>
          </button>
        </div>
      </div>

      {/* Safety Actions Quick Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Share Trip */}
        <button
          onClick={handleGenerateShare}
          className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-left hover:border-cyan-500/40 hover:bg-slate-850 transition group"
        >
          <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <Share2 className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Share Live Trip</h3>
          <p className="text-xs text-slate-400 mt-1">Generate view-only link for friends and parents</p>
        </button>

        {/* 2. Trusted Contacts */}
        <Link
          to="/trusted-contacts"
          className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-left hover:border-emerald-500/40 hover:bg-slate-850 transition group"
        >
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <PhoneCall className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Trusted Contacts</h3>
          <p className="text-xs text-slate-400 mt-1">{contacts.length} emergency contacts registered</p>
        </Link>

        {/* 3. Vehicle Verification */}
        {rideId ? (
          <Link
            to={`/active-ride/${rideId}`}
            className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-left hover:border-blue-500/40 hover:bg-slate-850 transition group"
          >
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Vehicle Check</h3>
            <p className="text-xs text-slate-400 mt-1">Verify license plate and 4-digit Ride PIN</p>
          </Link>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 text-left opacity-60">
            <div className="h-10 w-10 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-300">Vehicle Check</h3>
            <p className="text-xs text-slate-500 mt-1">Available during active cab rides</p>
          </div>
        )}

        {/* 4. AI Assistant */}
        <Link
          to="/ai-assistant"
          className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-left hover:border-purple-500/40 hover:bg-slate-850 transition group"
        >
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <AlertOctagon className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Safety AI Assistant</h3>
          <p className="text-xs text-slate-400 mt-1">Ask questions regarding emergency protocols</p>
        </Link>
      </div>

      {/* Two columns: Trusted Contacts Quick Dial + Safety Guidance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Trusted Contacts (6 cols) */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <PhoneCall className="h-4 w-4 text-emerald-400" />
              <span>Your Trusted Emergency Network</span>
            </h3>
            <Link to="/trusted-contacts" className="text-xs text-cyan-400 hover:underline">
              Manage ({contacts.length})
            </Link>
          </div>

          <div className="space-y-3">
            {contacts.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                No trusted contacts added yet. Add family or friends for quick access.
              </div>
            ) : (
              contacts.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/60"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      {c.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{c.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{c.phoneNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                      {c.relationship}
                    </span>
                    <a
                      href={`tel:${c.phoneNumber}`}
                      className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition"
                      title="Direct Call"
                    >
                      <Phone className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Safety Guidance (6 cols) */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
            <Shield className="h-4 w-4 text-cyan-400" />
            <span>Passenger Safety Protocol</span>
          </h3>

          <ul className="space-y-3 text-xs text-slate-300">
            {guidance.map((rule, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* SOS CONFIRMATION MODAL */}
      <Modal
        isOpen={isSosModalOpen}
        onClose={() => {
          setIsSosModalOpen(false);
          setSosActive(false);
        }}
        title="Confirm Emergency SOS Trigger"
      >
        <div className="space-y-4 text-xs">
          {!sosActive ? (
            <>
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
                <p className="font-bold text-sm">Are you sure you want to trigger SOS?</p>
                <p className="mt-1">
                  This will register an immediate Critical SafetyEvent in the database, notify your {contacts.length} emergency contacts, and initiate security logging.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsSosModalOpen(false)}
                  className="rounded-xl bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleTriggerSos}
                  className="rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold px-5 py-2 shadow-lg shadow-red-600/30"
                >
                  CONFIRM SOS TRIGGER
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-red-500/40 bg-red-950/40 p-4 text-white">
                <p className="font-black text-sm text-red-400">🚨 SOS PROTOCOL ACTIVATED</p>
                <p className="mt-1 text-slate-300">
                  {sosResult?.guidance?.title || 'Emergency action in progress.'}
                </p>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-slate-300">Recommended Steps:</p>
                {sosResult?.guidance?.recommendedActions?.map((step: string, i: number) => (
                  <p key={i} className="text-slate-400 pl-2 border-l-2 border-red-500">
                    {step}
                  </p>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsSosModalOpen(false)}
                  className="rounded-xl bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* SHARE TRIP MODAL */}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setCopiedShare(false);
        }}
        title="Share Live Trip"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-300">
            Share this link with family or friends to track live driver & vehicle status:
          </p>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl || ''}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs font-mono text-cyan-400 select-all"
            />
            <button
              type="button"
              onClick={() => {
                if (shareUrl) {
                  navigator.clipboard.writeText(shareUrl);
                  setCopiedShare(true);
                }
              }}
              className="rounded-xl bg-cyan-400 text-slate-950 font-bold px-4 py-2.5 shrink-0"
            >
              {copiedShare ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
