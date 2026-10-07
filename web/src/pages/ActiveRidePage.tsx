import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Car,
  Shield,
  ShieldAlert,
  Camera,
  Share2,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  XCircle,
  Clock,
  MapPin,
  Landmark,
  Phone,
  AlertOctagon,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api';
import { Ride, RideStatus } from '../types';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';

export const ActiveRidePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [ride, setRide] = useState<Ride | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [inputPin, setInputPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  const [isUnsafeModalOpen, setIsUnsafeModalOpen] = useState(false);
  const [unsafeDetails, setUnsafeDetails] = useState('');
  const [unsafeResult, setUnsafeResult] = useState<any | null>(null);

  const [isDeviationModalOpen, setIsDeviationModalOpen] = useState(false);
  const [deviationResult, setDeviationResult] = useState<any | null>(null);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  const fetchRide = async () => {
    if (!id) return;
    try {
      const res = await api.get(`/rides/${id}`);
      if (res.data.success) {
        setRide(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch ride information.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRide();
    const interval = setInterval(fetchRide, 5000);
    return () => clearInterval(interval);
  }, [id]);

  // Vehicle verification
  const handleVerifyVehicle = async (matches: boolean) => {
    if (!ride) return;
    try {
      const res = await api.post(`/rides/${ride.id}/verify-vehicle`, {
        matches,
        notes: matches ? 'Passenger confirmed vehicle plate and model.' : 'Passenger reported mismatch in car plate/color.',
      });
      if (res.data.success) {
        setRide(res.data.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Vehicle verification failed.');
    }
  };

  // Verify PIN (transitions to STARTED)
  const handleVerifyPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ride) return;
    setPinError(null);
    try {
      const res = await api.post(`/rides/${ride.id}/verify-pin`, { pin: inputPin });
      if (res.data.success) {
        setRide(res.data.data);
        setIsPinModalOpen(false);
        setInputPin('');
      }
    } catch (err: any) {
      setPinError(err.response?.data?.message || 'Invalid PIN. Ride could not start.');
    }
  };

  // Advance state for prototype demonstration
  const handleAdvanceStatus = async (newStatus: RideStatus) => {
    if (!ride) return;
    try {
      const res = await api.post(`/rides/${ride.id}/status`, { status: newStatus });
      if (res.data.success) {
        setRide(res.data.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Could not update status.');
    }
  };

  // Complete ride
  const handleCompleteRide = async () => {
    if (!ride) return;
    try {
      const res = await api.post(`/rides/${ride.id}/complete`);
      if (res.data.success) {
        setRide(res.data.data);
        navigate(`/ride-history`);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to complete ride.');
    }
  };

  // Cancel ride
  const handleCancelRide = async () => {
    if (!ride) return;
    if (!window.confirm('Are you sure you want to cancel this ride?')) return;
    try {
      const res = await api.post(`/rides/${ride.id}/cancel`, { reason: 'User requested cancellation' });
      if (res.data.success) {
        setRide(res.data.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel ride.');
    }
  };

  // "I Don't Feel Safe"
  const handleUnsafeSubmit = async () => {
    if (!ride) return;
    try {
      const res = await api.post(`/rides/${ride.id}/unsafe`, { details: unsafeDetails });
      if (res.data.success) {
        setUnsafeResult(res.data.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit report.');
    }
  };

  // Route Deviation Check simulation
  const handleCheckRouteDeviation = async () => {
    if (!ride) return;
    try {
      const res = await api.post(`/rides/${ride.id}/route-check`, {
        simulatedDeviationMeters: 240, // Trigger simulated deviation > 150m
      });
      if (res.data.success) {
        setDeviationResult(res.data.data);
        setIsDeviationModalOpen(true);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Route check failed.');
    }
  };

  // Trip Sharing
  const handleGenerateShare = async () => {
    if (!ride) return;
    try {
      const res = await api.post(`/rides/${ride.id}/share`);
      if (res.data.success) {
        const fullUrl = `${window.location.origin}${res.data.data.shareableUrl}`;
        setShareUrl(fullUrl);
        setIsShareModalOpen(true);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Could not generate share link.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
          <p className="text-sm text-cyan-400 font-medium">Tracking live ride telemetry...</p>
        </div>
      </div>
    );
  }

  if (error || !ride) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center max-w-lg mx-auto">
        <AlertTriangle className="h-10 w-10 text-red-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white">Ride Not Found</h3>
        <p className="text-xs text-slate-400 mt-1">{error || 'This ride does not exist or belongs to another user.'}</p>
        <Link
          to="/dashboard"
          className="mt-5 inline-block rounded-xl bg-cyan-500 text-slate-950 font-bold px-4 py-2 text-xs"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const isCompletedOrCancelled = ride.status === 'COMPLETED' || ride.status === 'CANCELLED';

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fadeIn">
      {/* Top Banner with Ride Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black tracking-widest uppercase text-cyan-400">
              ACTIVE RIDE TRACKER
            </span>
            <Badge status={ride.status} size="md" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
            Trip to {ride.destination}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Live telemetry & passenger safety verification console
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchRide}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 text-xs text-slate-300 hover:bg-slate-800 transition"
            title="Refresh ride"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <Link
            to={`/safety?rideId=${ride.id}`}
            className="flex items-center gap-2 rounded-xl bg-red-600/90 hover:bg-red-500 border border-red-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-red-500/25 transition"
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Safety Center</span>
          </Link>
        </div>
      </div>

      {/* High-Visibility "I DON'T FEEL SAFE" Floating/Top Action */}
      {!isCompletedOrCancelled && (
        <div className="rounded-2xl border-2 border-red-500/40 bg-gradient-to-r from-red-950/40 via-slate-900 to-red-950/40 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-red-500/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <AlertOctagon className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-white">Passenger Discomfort or Concern?</h4>
              <p className="text-xs text-slate-400">
                Instantly trigger safety protocols, emergency contacts, or route verification.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setUnsafeResult(null);
              setIsUnsafeModalOpen(true);
            }}
            className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold px-6 py-2.5 text-xs shadow-lg shadow-red-600/30 transition hover:scale-105"
          >
            <AlertOctagon className="h-4 w-4" />
            <span>I DON'T FEEL SAFE</span>
          </button>
        </div>
      )}

      {/* Main Grid: Left Ride Info & Pin, Right Verification & Safety */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Driver & Vehicle Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-5">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-4">
                <img
                  src={
                    ride.driver?.photoUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
                  }
                  alt={ride.driver?.name || 'Driver'}
                  className="h-16 w-16 rounded-2xl object-cover border-2 border-cyan-500/40"
                />
                <div>
                  <h3 className="text-lg font-bold text-white">{ride.driver?.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                    <span className="text-amber-400 font-bold">★ {ride.driver?.rating}</span>
                    <span>•</span>
                    <span className="text-slate-400">{ride.driver?.totalRides} trips completed</span>
                  </div>
                  <p className="text-xs text-cyan-400 mt-1 font-mono">{ride.driver?.phoneNumber}</p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-800 border border-slate-700 text-slate-300 uppercase">
                {ride.rideType}
              </span>
            </div>

            {/* Vehicle Details */}
            {ride.driver?.vehicle && (
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 grid grid-cols-3 gap-3 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Model</span>
                  <span className="text-xs font-bold text-white">{ride.driver.vehicle.model}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Color</span>
                  <span className="text-xs font-bold text-white">{ride.driver.vehicle.color}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Number Plate</span>
                  <span className="text-xs font-bold font-mono text-cyan-400">
                    {ride.driver.vehicle.vehicleNumber}
                  </span>
                </div>
              </div>
            )}

            {/* Route & Landmark */}
            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Pickup</span>
                  <span className="text-white font-medium">{ride.pickup}</span>
                </div>
              </div>

              {ride.landmark && (
                <div className="flex items-start gap-3">
                  <Landmark className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">
                      Landmark Provided
                    </span>
                    <span className="text-amber-300 font-medium">{ride.landmark}</span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Destination</span>
                  <span className="text-white font-medium">{ride.destination}</span>
                </div>
              </div>
            </div>

            {/* Estimated Fare summary */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Estimated Fare
                </span>
                <span className="text-xl font-black text-cyan-400 font-mono">₹{ride.fareEstimate}</span>
              </div>
              <div className="text-right text-xs text-slate-400">
                <span>{ride.distanceKm} km</span> • <span>~{ride.durationMin} mins</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              to={`/pickup-assistance/${ride.id}`}
              className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-cyan-500/40 hover:bg-slate-800 transition text-center group"
            >
              <Camera className="h-5 w-5 text-cyan-400 mb-1.5 group-hover:scale-110 transition" />
              <span className="text-xs font-bold text-white">Pickup Photo</span>
              <span className="text-[10px] text-slate-400">Visual landmark</span>
            </Link>

            <button
              onClick={handleGenerateShare}
              className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-blue-500/40 hover:bg-slate-800 transition text-center group"
            >
              <Share2 className="h-5 w-5 text-blue-400 mb-1.5 group-hover:scale-110 transition" />
              <span className="text-xs font-bold text-white">Share Trip</span>
              <span className="text-[10px] text-slate-400">Family tracking</span>
            </button>

            <button
              onClick={handleCheckRouteDeviation}
              className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-amber-500/40 hover:bg-slate-800 transition text-center group"
            >
              <AlertTriangle className="h-5 w-5 text-amber-400 mb-1.5 group-hover:scale-110 transition" />
              <span className="text-xs font-bold text-white">Route Check</span>
              <span className="text-[10px] text-slate-400">Simulate deviation</span>
            </button>

            {!isCompletedOrCancelled ? (
              <button
                onClick={handleCancelRide}
                className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-rose-500/40 hover:bg-slate-800 transition text-center group"
              >
                <XCircle className="h-5 w-5 text-rose-400 mb-1.5 group-hover:scale-110 transition" />
                <span className="text-xs font-bold text-white">Cancel</span>
                <span className="text-[10px] text-slate-400">Abort trip</span>
              </button>
            ) : (
              <div className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-800 bg-slate-900/20 text-center opacity-50">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mb-1.5" />
                <span className="text-xs font-bold text-white">Closed</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* 4-Digit Ride PIN Card */}
          <div className="rounded-2xl border-2 border-cyan-500/40 bg-gradient-to-br from-cyan-950/20 to-slate-900 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="h-4 w-4 text-cyan-400" />
                <span>Your 4-Digit Ride PIN</span>
              </span>
              <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                CONFIDENTIAL
              </span>
            </div>

            <div className="text-center py-4 bg-slate-950/80 rounded-2xl border border-slate-800">
              <p className="text-4xl sm:text-5xl font-black tracking-widest text-white font-mono">
                {ride.pin}
              </p>
              <p className="mt-2 text-[11px] text-slate-400">
                Share this PIN with driver <strong>{ride.driver?.name}</strong> to begin your ride.
              </p>
            </div>

            {/* Simulation controls to verify PIN or advance status */}
            {!isCompletedOrCancelled && (
              <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Driver Simulation Actions
                </p>
                {ride.status === 'DRIVER_ASSIGNED' && (
                  <button
                    onClick={() => handleAdvanceStatus('DRIVER_ARRIVING')}
                    className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 py-2 transition"
                  >
                    Simulate Driver Status: Arriving
                  </button>
                )}
                {ride.status === 'DRIVER_ARRIVING' && (
                  <button
                    onClick={() => handleAdvanceStatus('DRIVER_ARRIVED')}
                    className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 py-2 transition"
                  >
                    Simulate Driver Status: Arrived at Pickup
                  </button>
                )}
                {ride.status !== 'STARTED' && (
                  <button
                    onClick={() => setIsPinModalOpen(true)}
                    className="w-full rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 text-xs font-bold py-2.5 transition flex items-center justify-center gap-2"
                  >
                    <KeyRound className="h-4 w-4" />
                    <span>Enter PIN to Start Ride (Driver View)</span>
                  </button>
                )}
                {ride.status === 'STARTED' && (
                  <button
                    onClick={handleCompleteRide}
                    className="w-full rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs font-bold py-2.5 transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Complete Ride & Leave Rating</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Vehicle Verification Card (Part 17) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-400" />
                <span>Vehicle Verification</span>
              </h3>
              {ride.vehicleMatches === true && (
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Verified Matches ✓
                </span>
              )}
              {ride.vehicleMatches === false && (
                <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                  Mismatch Reported ⚠
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Before boarding, verify that the vehicle plate and color match what is displayed.
            </p>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Driver:</span>
                <span className="font-bold text-white">{ride.driver?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vehicle:</span>
                <span className="font-bold text-white">{ride.driver?.vehicle?.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Color:</span>
                <span className="font-bold text-white">{ride.driver?.vehicle?.color}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Plate Number:</span>
                <span className="font-bold font-mono text-cyan-400">
                  {ride.driver?.vehicle?.vehicleNumber}
                </span>
              </div>
            </div>

            {ride.vehicleMatches === null && !isCompletedOrCancelled && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleVerifyVehicle(true)}
                  className="rounded-xl bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500/30 text-emerald-300 py-2.5 px-3 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Vehicle Matches</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleVerifyVehicle(false)}
                  className="rounded-xl bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 text-red-300 py-2.5 px-3 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span>Report Mismatch</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: Driver Enter PIN */}
      <Modal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        title="Driver PIN Authentication"
      >
        <form onSubmit={handleVerifyPinSubmit} className="space-y-4">
          <p className="text-xs text-slate-300">
            Enter the 4-digit Ride PIN provided by passenger <strong>Ashutosh</strong> to transition the ride status to <strong>STARTED</strong>:
          </p>

          <input
            type="text"
            maxLength={4}
            value={inputPin}
            onChange={(e) => setInputPin(e.target.value)}
            placeholder="e.g. 4827"
            className="w-full text-center tracking-widest text-2xl font-mono py-3 rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            required
          />

          {pinError && <p className="text-xs text-red-400 text-center">{pinError}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsPinModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-cyan-400 hover:bg-cyan-300 px-5 py-2 text-xs font-bold text-slate-950"
            >
              Authenticate PIN
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: "I DON'T FEEL SAFE" */}
      <Modal
        isOpen={isUnsafeModalOpen}
        onClose={() => setIsUnsafeModalOpen(false)}
        title="I Don't Feel Safe — Rapid Assistance"
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300">
            <p className="font-bold">Your safety is our top priority.</p>
            <p className="mt-1">
              Select an action below or submit details. For life-threatening emergencies, dial 112 directly.
            </p>
          </div>

          {!unsafeResult ? (
            <div className="space-y-3">
              <textarea
                value={unsafeDetails}
                onChange={(e) => setUnsafeDetails(e.target.value)}
                placeholder="Optional: describe reason (e.g. driver is taking unfamiliar turns, speeding, etc.)"
                rows={3}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleUnsafeSubmit}
                  className="rounded-xl bg-red-600 hover:bg-red-500 text-white py-2.5 px-3 text-xs font-bold transition"
                >
                  Log Unsafe Condition
                </button>
                <Link
                  to={`/safety?rideId=${ride.id}`}
                  className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white py-2.5 px-3 text-xs font-bold text-center transition"
                >
                  Open Full Safety Center
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-emerald-400 font-bold">
                ✓ Unsafe condition logged in Safety Center telemetry.
              </p>
              <div className="space-y-2">
                <button
                  onClick={handleGenerateShare}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-xs text-slate-200 flex items-center justify-between"
                >
                  <span>Share Live Trip with Contacts</span>
                  <ArrowRight className="h-4 w-4 text-cyan-400" />
                </button>
                <Link
                  to="/trusted-contacts"
                  className="w-full text-left p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-xs text-slate-200 flex items-center justify-between"
                >
                  <span>Quick Contact Emergency People</span>
                  <ArrowRight className="h-4 w-4 text-cyan-400" />
                </Link>
                <Link
                  to={`/safety?rideId=${ride.id}`}
                  className="w-full text-left p-2.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-xs text-red-300 font-bold flex items-center justify-between"
                >
                  <span>Trigger Emergency SOS</span>
                  <ShieldAlert className="h-4 w-4 text-red-400" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* MODAL: Route Deviation Simulation Result */}
      <Modal
        isOpen={isDeviationModalOpen}
        onClose={() => setIsDeviationModalOpen(false)}
        title="Route Deviation Monitor"
      >
        <div className="space-y-4 text-xs">
          {deviationResult && (
            <>
              <div
                className={`rounded-xl border p-3.5 ${
                  deviationResult.isDeviated
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                    : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                }`}
              >
                <p className="font-bold text-sm">{deviationResult.alertMessage}</p>
                <p className="mt-1 text-[11px] text-slate-400">{deviationResult.disclaimer}</p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Deviation Distance:</span>
                  <span className="font-bold text-amber-400">{deviationResult.deviationMeters} meters</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Threshold:</span>
                  <span className="font-mono text-slate-300">{deviationResult.thresholdMeters} meters</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeviationModalOpen(false)}
                  className="rounded-xl bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 font-bold"
                >
                  Dismiss Alert
                </button>
                <Link
                  to={`/safety?rideId=${ride.id}`}
                  className="rounded-xl bg-red-600 hover:bg-red-500 text-white px-4 py-2 font-bold"
                >
                  Open Safety Center
                </Link>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* MODAL: Trip Share Link */}
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
            Share this link with trusted contacts. They can view live vehicle and driver details without needing an account:
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
              {copiedShare ? 'Copied!' : 'Copy Link'}
            </button>
          </div>

          <p className="text-[11px] text-slate-500">
            * Link expires automatically in 48 hours. No private passwords or JWT tokens are shared.
          </p>
        </div>
      </Modal>
    </div>
  );
};
