import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { api } from '../services/api';
import { Ride, RideStatus } from '../types';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';

export const RideHistoryPage: React.FC = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Rating Modal
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);

  const fetchRides = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await api.get('/rides', { params });
      if (res.data.success) {
        setRides(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch rides:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRides();
  };

  const handleOpenRating = (ride: Ride) => {
    setSelectedRide(ride);
    setRatingValue(5);
    setReviewText('');
    setRatingError(null);
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRide) return;

    setIsSubmittingRating(true);
    setRatingError(null);
    try {
      const res = await api.post(`/rides/${selectedRide.id}/rating`, {
        rating: ratingValue,
        review: reviewText,
      });

      if (res.data.success) {
        setSelectedRide(null);
        fetchRides();
      }
    } catch (err: any) {
      setRatingError(err.response?.data?.message || 'Failed to submit rating.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fadeIn">
      {/* Title */}
      <div>
        <span className="text-xs font-black tracking-widest uppercase text-cyan-400">
          TRAVEL ARCHIVE
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
          Ride History
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          View all past and active journeys, audit route details, and review driver safety performance
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by pickup, destination, or driver name..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
          />
          <Search className="h-4 w-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="REQUESTED">Requested</option>
            <option value="DRIVER_ASSIGNED">Driver Assigned</option>
            <option value="STARTED">Started</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Rides List */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
        </div>
      ) : rides.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400">
          <Car className="h-10 w-10 mx-auto text-slate-600 mb-2" />
          <p className="text-sm font-bold text-white">No rides found</p>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or book a new ride.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rides.map((ride) => {
            const hasRating = ride.ratings && ride.ratings.length > 0;
            const ratingObj = hasRating ? ride.ratings![0] : null;

            return (
              <div
                key={ride.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 hover:border-slate-700 transition space-y-4 shadow-lg"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <Badge status={ride.status} size="sm" />
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(ride.createdAt).toLocaleDateString()} at {new Date(ride.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">{ride.distanceKm} km</span>
                    <span className="text-base font-extrabold text-cyan-400 font-mono">
                      ₹{ride.fareEstimate}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                  {/* Locations */}
                  <div className="md:col-span-6 space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Pickup</span>
                        <span className="text-slate-200">{ride.pickup}</span>
                        {ride.landmark && (
                          <span className="text-[10px] text-amber-400/90 block mt-0.5">
                            Landmark: {ride.landmark}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Destination</span>
                        <span className="text-slate-200">{ride.destination}</span>
                      </div>
                    </div>
                  </div>

                  {/* Driver and Vehicle */}
                  <div className="md:col-span-6 flex flex-col justify-between sm:border-l sm:border-slate-800/80 sm:pl-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned Driver</span>
                      <p className="font-bold text-white text-sm mt-0.5">{ride.driver?.name || 'Driver'}</p>
                      {ride.driver?.vehicle && (
                        <p className="text-[11px] text-slate-400">
                          {ride.driver.vehicle.model} ({ride.driver.vehicle.color}) •{' '}
                          <span className="font-mono text-cyan-400">{ride.driver.vehicle.vehicleNumber}</span>
                        </p>
                      )}
                    </div>

                    {/* Actions and Ratings */}
                    <div className="mt-3 flex items-center justify-between">
                      {ride.status === 'COMPLETED' ? (
                        hasRating ? (
                          <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                            <Star className="h-3.5 w-3.5 fill-amber-400" />
                            <span>Rated {ratingObj?.rating} / 5</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenRating(ride)}
                            className="rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 px-3 py-1.5 text-xs font-bold transition flex items-center gap-1"
                          >
                            <Star className="h-3.5 w-3.5" />
                            <span>Leave Rating</span>
                          </button>
                        )
                      ) : (
                        <Link
                          to={`/active-ride/${ride.id}`}
                          className="text-xs text-cyan-400 hover:underline font-bold"
                        >
                          View Active Ride →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {ratingObj?.review && (
                  <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950/40 p-2.5 text-xs text-slate-300 flex items-start gap-2">
                    <MessageSquare className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="italic">"{ratingObj.review}"</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* RATING MODAL */}
      <Modal
        isOpen={!!selectedRide}
        onClose={() => setSelectedRide(null)}
        title="Rate Your Ride Experience"
      >
        <form onSubmit={handleSubmitRating} className="space-y-4 text-xs">
          <p className="text-slate-300">
            How was your trip with driver <strong>{selectedRide?.driver?.name}</strong>?
          </p>

          {/* Star selector */}
          <div className="flex items-center justify-center gap-2 py-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRatingValue(star)}
                className="p-1 transition hover:scale-125 focus:outline-none"
              >
                <Star
                  className={`h-7 w-7 ${
                    star <= ratingValue
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-600'
                  }`}
                />
              </button>
            ))}
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold uppercase text-[10px]">
              Optional Review & Feedback
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="e.g. Great driver, vehicle matched description, arrived punctually."
              rows={3}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {ratingError && <p className="text-red-400 text-xs">{ratingError}</p>}

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setSelectedRide(null)}
              className="rounded-xl bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingRating}
              className="rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 px-5 py-2 font-extrabold shadow-lg shadow-amber-400/20"
            >
              {isSubmittingRating ? 'Saving...' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
