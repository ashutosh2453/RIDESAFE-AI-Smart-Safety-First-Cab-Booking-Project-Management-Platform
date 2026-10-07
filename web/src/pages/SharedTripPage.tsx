import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, Car, MapPin, Landmark, Clock, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { Badge } from '../components/Badge';

export const SharedTripPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();

  const [tripData, setTripData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedTrip = async () => {
      try {
        const res = await api.get(`/shared-trip/${token}`);
        if (res.data.success) {
          setTripData(res.data.data.ride);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'This trip link is expired or invalid.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSharedTrip();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#0B132B] flex flex-col items-center justify-center p-4 selection:bg-cyan-400 selection:text-black">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white">
              <Shield className="h-5 w-5" />
            </div>
            <span className="text-lg font-black text-white">
              RIDESAFE <span className="text-cyan-400 text-xs px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800">AI</span>
            </span>
          </div>
          <h2 className="text-base font-bold text-white">Live Passenger Trip Tracking</h2>
          <p className="text-xs text-slate-400">Secure view-only tracking provided for emergency contacts</p>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
          </div>
        ) : error || !tripData ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center text-slate-300">
            <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-white">Trip Link Expired</p>
            <p className="text-xs text-slate-400 mt-1">{error || 'This live link has ended or reached its 48h limit.'}</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-400 uppercase">Trip Status</span>
              <Badge status={tripData.status} size="sm" />
            </div>

            {/* Driver and Vehicle */}
            <div className="flex items-start gap-4">
              <img
                src={
                  tripData.driver?.photoUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
                }
                alt={tripData.driver?.name || 'Driver'}
                className="h-14 w-14 rounded-2xl object-cover border border-slate-700"
              />
              <div>
                <h3 className="text-base font-bold text-white">{tripData.driver?.name}</h3>
                <p className="text-xs text-amber-400 font-bold">★ {tripData.driver?.rating} Rating</p>
                {tripData.driver?.vehicle && (
                  <p className="text-xs text-slate-400 mt-1">
                    {tripData.driver.vehicle.model} ({tripData.driver.vehicle.color})
                  </p>
                )}
              </div>
            </div>

            {/* Vehicle Number highlight */}
            {tripData.driver?.vehicle && (
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Vehicle Number Plate</span>
                <span className="text-base font-mono font-black text-cyan-400 tracking-wider">
                  {tripData.driver.vehicle.vehicleNumber}
                </span>
              </div>
            )}

            {/* Route */}
            <div className="space-y-2.5 text-xs pt-1">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Pickup</span>
                  <span className="text-slate-200">{tripData.pickup}</span>
                  {tripData.landmark && (
                    <span className="text-[10px] text-amber-400 block mt-0.5">
                      Landmark: {tripData.landmark}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Destination</span>
                  <span className="text-slate-200">{tripData.destination}</span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 text-center italic border-t border-slate-800 pt-3">
              * Privacy-protected live link. No passwords or passenger credentials are exposed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
