import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Camera, Upload, ArrowLeft, Image as ImageIcon, CheckCircle2, AlertCircle, Clock, MapPin } from 'lucide-react';
import { api } from '../services/api';
import { PickupPhoto, Ride } from '../types';

export const PickupAssistancePage: React.FC = () => {
  const { rideId } = useParams<{ rideId: string }>();

  const [ride, setRide] = useState<Ride | null>(null);
  const [photos, setPhotos] = useState<PickupPhoto[]>([]);
  const [description, setDescription] = useState('Standing near Gate 2 beside the blue building');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchRideAndPhotos = async () => {
    if (!rideId) return;
    try {
      const [rideRes, photosRes] = await Promise.all([
        api.get(`/rides/${rideId}`),
        api.get(`/rides/${rideId}/pickup-photo`),
      ]);

      if (rideRes.data.success) setRide(rideRes.data.data);
      if (photosRes.data.success) setPhotos(photosRes.data.data);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to load pickup photos.');
    }
  };

  useEffect(() => {
    fetchRideAndPhotos();
  }, [rideId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setErrorMessage('Only JPG, PNG, and WebP images are supported.');
        return;
      }
      // Validate size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Image size must be less than 5MB.');
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMessage(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !rideId) {
      setErrorMessage('Please select a photo to upload.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append('photo', selectedFile);
    if (description) formData.append('description', description);

    try {
      const res = await api.post(`/rides/${rideId}/pickup-photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setUploadSuccess(true);
        setSelectedFile(null);
        setPreviewUrl(null);
        setDescription('');
        fetchRideAndPhotos();
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to upload photo.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fadeIn">
      {/* Back button & Header */}
      <div>
        <Link
          to={rideId ? `/active-ride/${rideId}` : '/dashboard'}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Active Ride</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs font-black tracking-widest uppercase text-cyan-400">
            VISUAL PICKUP ASSISTANCE
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
          Landmark & Surroundings Photo
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Help your driver identify your exact waiting location without confusion or phone calls.
        </p>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {uploadSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>Pickup photo sent to driver successfully!</span>
        </div>
      )}

      {/* Upload Box */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
        <form onSubmit={handleUpload} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
              Take or Choose Photo
            </label>

            <div className="relative border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-2xl p-6 text-center transition bg-slate-950/40">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              {previewUrl ? (
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-48 w-auto rounded-xl object-cover border border-slate-700 shadow-md"
                  />
                  <p className="text-xs text-cyan-400 font-medium">Click to select a different photo</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
                    <Camera className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-bold text-white">Click or drag photo here</p>
                  <p className="text-xs text-slate-400 mt-1">JPEG, PNG, or WebP up to 5MB</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Landmark Description / Note
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Standing near Gate 2 beside the blue building wearing a backpack"
              className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
            />
          </div>

          <button
            type="submit"
            disabled={!selectedFile || isUploading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 py-3.5 px-4 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="h-4 w-4" />
            <span>{isUploading ? 'Uploading Photo...' : 'Send Visual Pickup Photo to Driver'}</span>
          </button>
        </form>
      </div>

      {/* List of Sent Photos for this Ride */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-cyan-400" />
          <span>Photos Sent For This Ride ({photos.length})</span>
        </h3>

        {photos.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center text-xs text-slate-500">
            No visual pickup photos uploaded yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {photos.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg"
              >
                <div className="h-48 w-full bg-slate-950 flex items-center justify-center overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt="Pickup Landmark"
                    className="h-full w-full object-cover"
                    onError={(e: any) => {
                      // Fallback placeholder if image fails
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                <div className="p-4 space-y-1">
                  <p className="text-xs font-bold text-white">{item.description || 'Pickup surroundings'}</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(item.createdAt).toLocaleTimeString()}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
