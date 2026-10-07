import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  MapPin,
  Navigation,
  Landmark,
  Sparkles,
  ArrowRight,
  Info,
  Clock,
  Gauge,
  Check,
} from 'lucide-react';
import { api } from '../services/api';
import { VehicleType, SmartMatchResult } from '../types';

export const BookRidePage: React.FC = () => {
  const navigate = useNavigate();

  const [pickup, setPickup] = useState('SRM Main Gate');
  const [destination, setDestination] = useState('Chennai Airport');
  const [landmark, setLandmark] = useState('Gate 2, near blue building');
  const [rideType, setRideType] = useState<VehicleType>('SEDAN');

  const [isCalculating, setIsCalculating] = useState(false);
  const [matchResult, setMatchResult] = useState<SmartMatchResult | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick preset destinations
  const presetRoutes = [
    { from: 'SRM Main Gate', to: 'Chennai Airport', landmark: 'Gate 2, near blue building' },
    { from: 'SRM Tech Park', to: 'Tambaram Railway Station', landmark: 'Near Bus Shelter' },
    { from: 'SRM Campus Arch', to: 'Chennai Central', landmark: 'Opposite Main Library' },
  ];

  const handleSmartMatch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pickup.trim() || !destination.trim()) {
      setError('Please provide both pickup and destination locations.');
      return;
    }

    setIsCalculating(true);
    setError(null);
    try {
      const res = await api.post('/drivers/smartmatch', {
        pickup,
        destination,
        rideType,
      });

      if (res.data.success) {
        setMatchResult(res.data.data);
        setSelectedDriverId(res.data.data.recommendedDriver.driver.id);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to compute SmartMatch.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!matchResult) return;
    setIsBooking(true);
    setError(null);

    try {
      const res = await api.post('/rides', {
        pickup,
        destination,
        landmark,
        rideType,
        driverId: selectedDriverId,
      });

      if (res.data.success) {
        const ride = res.data.data;
        // Navigate straight to active ride tracking page
        navigate(`/active-ride/${ride.id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to confirm ride booking.');
      setIsBooking(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fadeIn">
      {/* Title */}
      <div>
        <span className="text-xs font-black tracking-widest uppercase text-cyan-400">
          SMART BOOKING & DISPATCH
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
          Book a Safe Ride
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Add visual landmarks, get transparent estimated fares, and match high-safety drivers via SmartMatch
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Preset Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400 font-semibold mr-1">Suggested Routes:</span>
        {presetRoutes.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setPickup(preset.from);
              setDestination(preset.to);
              setLandmark(preset.landmark);
            }}
            className="rounded-full border border-slate-800 bg-slate-900/60 hover:border-cyan-500/40 hover:text-cyan-400 px-3 py-1 text-xs text-slate-300 transition"
          >
            {preset.from} → {preset.to}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-6 space-y-6">
          <form
            onSubmit={handleSmartMatch}
            className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-5 shadow-xl"
          >
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Navigation className="h-4 w-4 text-cyan-400" />
              <span>Trip Coordinates</span>
            </h3>

            {/* Pickup */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Pickup Location
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  placeholder="e.g. SRM Main Gate"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
                  required
                />
                <MapPin className="h-4 w-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Destination */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Destination
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Chennai Airport Terminal 2"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
                  required
                />
                <Navigation className="h-4 w-4 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Optional Landmark */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Pickup Landmark (Optional)
                </label>
                <span className="text-[10px] text-cyan-400 font-semibold">Assists Driver</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Gate 2, near blue building"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
                />
                <Landmark className="h-4 w-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Vehicle Class Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                Vehicle Class
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { type: 'MINI', label: 'Mini', rate: '1.0x', desc: 'Compact City' },
                  { type: 'SEDAN', label: 'Sedan', rate: '1.25x', desc: 'Comfort & Safety' },
                  { type: 'SUV', label: 'SUV', rate: '1.6x', desc: 'Spacious & Luggage' },
                ].map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setRideType(item.type as VehicleType)}
                    className={`rounded-xl border p-3 text-left transition ${
                      rideType === item.type
                        ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 ring-2 ring-cyan-500/30'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{item.label}</span>
                      <span className="text-[10px] font-bold text-cyan-400">{item.rate}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isCalculating}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 py-3.5 px-4 text-sm font-extrabold text-slate-950 shadow-lg shadow-cyan-400/20 transition disabled:opacity-50"
            >
              {isCalculating ? (
                <span>Computing SmartMatch...</span>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Find My Ride with SmartMatch</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-6 space-y-6">
          {matchResult ? (
            <div className="space-y-6 animate-fadeIn">
              {/* Transparent Estimated Fare Box */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-cyan-400" />
                    <span>Transparent Fare Breakdown</span>
                  </h3>
                  <span className="text-[11px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    Estimated Fare
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Base Fare</span>
                    <span className="text-white font-mono">₹{matchResult.fareDetails.baseFare}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Distance ({matchResult.fareDetails.distanceKm} km @ ₹15/km)</span>
                    <span className="text-white font-mono">₹{matchResult.fareDetails.distanceFare}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Time ({matchResult.fareDetails.durationMin} min @ ₹2.5/min)</span>
                    <span className="text-white font-mono">₹{matchResult.fareDetails.timeFare}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Vehicle Class Multiplier ({rideType})</span>
                    <span className="text-white font-mono">{matchResult.fareDetails.multiplier}x</span>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-white">Estimated Fare</span>
                    <span className="text-2xl font-black text-cyan-400 font-mono">
                      ₹{matchResult.fareDetails.estimatedFare}
                    </span>
                  </div>
                </div>

                <p className="mt-3 text-[10px] text-slate-400 italic">
                  * Prototype notice: Non-monetary simulated fare for project demonstration.
                </p>
              </div>

              {/* Recommended Driver Card */}
              <div className="rounded-2xl border-2 border-cyan-500/60 bg-gradient-to-br from-cyan-950/30 to-slate-900 p-5 shadow-xl shadow-cyan-500/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 px-3 py-1 text-[11px] font-extrabold text-cyan-300">
                    <Sparkles className="h-3 w-3" />
                    Recommended by SmartMatch
                  </span>
                  <div className="text-right">
                    <span className="text-lg font-black text-cyan-400">
                      {matchResult.recommendedDriver.smartMatchScore}%
                    </span>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Match Score</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 mt-4">
                  <img
                    src={
                      matchResult.recommendedDriver.driver.photoUrl ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
                    }
                    alt={matchResult.recommendedDriver.driver.name}
                    className="h-16 w-16 rounded-2xl object-cover border-2 border-cyan-500/40"
                  />
                  <div className="flex-1">
                    <h4 className="text-base font-bold text-white">
                      {matchResult.recommendedDriver.driver.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-300">
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        ★ {matchResult.recommendedDriver.rating}
                      </span>
                      <span>•</span>
                      <span>{matchResult.recommendedDriver.distanceKm} km away</span>
                      <span>•</span>
                      <span className="text-cyan-400 font-semibold">
                        ETA: {matchResult.recommendedDriver.etaMin} min
                      </span>
                    </div>

                    {matchResult.recommendedDriver.vehicle && (
                      <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/60 p-2.5 text-xs flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white">
                            {matchResult.recommendedDriver.vehicle.model} ({matchResult.recommendedDriver.vehicle.color})
                          </p>
                          <p className="text-[11px] font-mono text-cyan-400">
                            {matchResult.recommendedDriver.vehicle.vehicleNumber}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                          {matchResult.recommendedDriver.vehicle.type}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Score breakdown pills */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-4 gap-2 text-center text-[10px]">
                  <div className="rounded-lg bg-slate-950/40 p-1.5">
                    <span className="text-slate-400 block">Distance</span>
                    <span className="font-bold text-slate-200">
                      {matchResult.recommendedDriver.scoreBreakdown.distanceScore}%
                    </span>
                  </div>
                  <div className="rounded-lg bg-slate-950/40 p-1.5">
                    <span className="text-slate-400 block">ETA</span>
                    <span className="font-bold text-slate-200">
                      {matchResult.recommendedDriver.scoreBreakdown.etaScore}%
                    </span>
                  </div>
                  <div className="rounded-lg bg-slate-950/40 p-1.5">
                    <span className="text-slate-400 block">Rating</span>
                    <span className="font-bold text-slate-200">
                      {matchResult.recommendedDriver.scoreBreakdown.ratingScore}%
                    </span>
                  </div>
                  <div className="rounded-lg bg-slate-950/40 p-1.5">
                    <span className="text-slate-400 block">Status</span>
                    <span className="font-bold text-slate-200">
                      {matchResult.recommendedDriver.scoreBreakdown.availabilityScore}%
                    </span>
                  </div>
                </div>

                {/* Confirm Booking CTA */}
                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  disabled={isBooking}
                  className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 py-3.5 px-4 text-sm font-extrabold text-slate-950 shadow-xl shadow-cyan-500/20 transition disabled:opacity-50"
                >
                  {isBooking ? (
                    <span>Confirming & Generating Ride PIN...</span>
                  ) : (
                    <>
                      <span>Confirm Ride with {matchResult.recommendedDriver.driver.name}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Other Candidates List */}
              {matchResult.candidates.length > 1 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Other Available Drivers
                  </h4>
                  <div className="space-y-2">
                    {matchResult.candidates.slice(1).map((c) => (
                      <div
                        key={c.driver.id}
                        onClick={() => setSelectedDriverId(c.driver.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                          selectedDriverId === c.driver.id
                            ? 'border-cyan-500 bg-cyan-950/30'
                            : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-xs text-white">
                            {c.driver.name[0]}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">{c.driver.name}</p>
                            <p className="text-[10px] text-slate-400">
                              {c.vehicle?.model} • ★ {c.rating} • {c.distanceKm} km
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-300">
                            {c.smartMatchScore}%
                          </span>
                          {selectedDriverId === c.driver.id && (
                            <Check className="h-4 w-4 text-cyan-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center flex flex-col items-center justify-center h-full">
              <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
                <Car className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-white">Enter your trip details</h3>
              <p className="mt-2 text-xs text-slate-400 max-w-sm leading-relaxed">
                Click <strong>"Find My Ride with SmartMatch"</strong> to view transparent estimated fares and algorithmic driver matching scores.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
