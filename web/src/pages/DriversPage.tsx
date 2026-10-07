import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Star, Car, CheckCircle2, Clock, Phone, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { Driver } from '../types';

export const DriversPage: React.FC = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await api.get('/drivers');
        if (res.data.success) {
          setDrivers(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load drivers:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDrivers();
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fadeIn">
      {/* Title */}
      <div>
        <span className="text-xs font-black tracking-widest uppercase text-cyan-400">
          VERIFIED OPERATOR DIRECTORY
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
          Driver Fleet
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Explore fictional verified drivers, historical ratings, and associated vehicle specifications
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drivers.map((driver) => {
            const isAvailable = driver.status === 'AVAILABLE';

            return (
              <div
                key={driver.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 hover:border-slate-700 transition space-y-4 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <img
                      src={
                        driver.photoUrl ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
                      }
                      alt={driver.name}
                      className="h-16 w-16 rounded-2xl object-cover border-2 border-slate-700"
                    />
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        isAvailable
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {driver.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="mt-3">
                    <h3 className="text-base font-bold text-white">{driver.name}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-300">
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="h-3.5 w-3.5 fill-amber-400" />
                        {driver.rating}
                      </span>
                      <span>•</span>
                      <span className="text-slate-400">{driver.totalRides} trips</span>
                    </div>
                  </div>

                  {driver.vehicle && (
                    <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Vehicle:</span>
                        <span className="font-bold text-white">
                          {driver.vehicle.model} ({driver.vehicle.color})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Plate:</span>
                        <span className="font-mono font-bold text-cyan-400">
                          {driver.vehicle.vehicleNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Class:</span>
                        <span className="uppercase text-[10px] font-bold text-slate-300">
                          {driver.vehicle.type}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/book-ride')}
                  className="mt-4 w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 py-2.5 text-xs font-bold text-slate-200 transition"
                >
                  <span>Book with Fleet</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
