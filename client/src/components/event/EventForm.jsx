import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getAllStadiums } from '../../services/stadium.service';
import LoadingSpinner from '../common/LoadingSpinner';

const SPORTS = ['Football', 'Cricket', 'Basketball', 'Tennis', 'Hockey', 'Badminton'];

export default function EventForm({ defaultValues = {}, onSubmit, loading, error, submitLabel = 'Save', isEdit = false }) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues });

  const [stadiums, setStadiums] = useState([]);
  const [loadingStadiums, setLoadingStadiums] = useState(true);
  const [stadiumError, setStadiumError] = useState(null);

  useEffect(() => {
    async function loadStadiums() {
      try {
        setLoadingStadiums(true);
        const res = await getAllStadiums({ limit: 100 });
        setStadiums(res?.data?.data || []);
      } catch (err) {
        console.error('Failed to load stadiums for dropdown:', err);
        setStadiumError('Failed to load stadium list. Please reload the page.');
      } finally {
        setLoadingStadiums(false);
      }
    }
    loadStadiums();
  }, []);

  const field = (label, key, type = 'text', rules = {}, placeholder = '', disabled = false) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder || label}
        disabled={disabled}
        {...register(key, rules)}
        className={`w-full px-3 py-2.5 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 transition ${
          errors[key]
            ? 'border-red-400 focus:ring-red-300'
            : 'border-gray-200 focus:ring-blue-300 focus:border-blue-400'
        } ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
      />
      {errors[key] && (
        <p className="mt-1 text-xs text-red-650 font-bold">{errors[key].message}</p>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Title & Sport */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {field('Event Title *', 'title', 'text', { required: 'Event title is required' })}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sport / Category *</label>
          <select
            {...register('sport', { required: 'Sport is required' })}
            className={`w-full px-3 py-2.5 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 transition ${
              errors.sport ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:ring-blue-300 focus:border-blue-400'
            }`}
          >
            <option value="">Select a sport</option>
            {SPORTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.sport && <p className="mt-1 text-xs text-red-655 font-bold">{errors.sport.message}</p>}
        </div>
      </div>

      {/* Stadium & Organizer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stadium Venue *</label>
          {loadingStadiums ? (
            <div className="flex items-center gap-2 py-2 px-3 border border-gray-250 rounded-xl bg-gray-50">
              <LoadingSpinner size="sm" />
              <span className="text-xs text-gray-500 font-semibold">Loading venue databases...</span>
            </div>
          ) : stadiumError ? (
            <p className="text-xs text-red-500 py-2.5 font-semibold">{stadiumError}</p>
          ) : (
            <select
              disabled={isEdit} // Schema makes stadiumId immutable on update
              {...register('stadiumId', { required: 'Stadium is required' })}
              className={`w-full px-3 py-2.5 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 transition ${
                errors.stadiumId ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:ring-blue-300 focus:border-blue-400'
              } ${isEdit ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
            >
              <option value="">Select a stadium</option>
              {stadiums.map((s) => (
                <option key={s.id || s._id} value={s.id || s._id}>{s.name} ({s.city})</option>
              ))}
            </select>
          )}
          {errors.stadiumId && <p className="mt-1 text-xs text-red-655 font-bold">{errors.stadiumId.message}</p>}
          {isEdit && <p className="text-[10px] text-gray-400 mt-1 font-semibold">Venue is immutable for existing events.</p>}
        </div>

        {field('Organizer', 'organizer')}
      </div>

      {/* Start & End Date Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {field('Match Start Time *', 'startDateTime', 'datetime-local', { required: 'Start time is required' })}
        {field('Match End Time *', 'endDateTime', 'datetime-local', { required: 'End time is required' })}
      </div>

      {/* Ticket Price & Capacity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {field('Total Seats / Capacity *', 'totalSeats', 'number', {
          required: 'Capacity is required',
          min: { value: 1, message: 'Capacity must be at least 1' },
          valueAsNumber: true,
        }, 'e.g. 25000', isEdit /* Disable totalSeats on edit if you want to avoid discrepancies, or allow editing if needed. We allow editing. */)}
        
        {field('Ticket Price (₹) *', 'price', 'number', {
          required: 'Price is required',
          min: { value: 0, message: 'Price cannot be negative' },
          valueAsNumber: true,
        }, 'e.g. 150')}

        {isEdit ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Match Status</label>
            <select
              {...register('status', { required: 'Status is required' })}
              className="w-full px-3 py-2.5 border border-gray-250 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
            >
              <option value="scheduled">Scheduled</option>
              <option value="live">Live</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Match Status</label>
            <div className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-450 font-bold select-none capitalize">
              Scheduled
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          rows={3}
          placeholder="Event description, matchups details..."
          {...register('description')}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition resize-none"
        />
      </div>

      {/* Image URL */}
      {field('Banner Image URL (Unsplash or direct link)', 'bannerImageUrl', 'url', {
        pattern: { value: /^https?:\/\/.+/, message: 'Must be a valid URL (http/https)' },
      }, 'https://images.unsplash.com/...')}

      {/* Global Error Banner */}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold">
          ⚠️ {error}
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-xl transition text-sm shadow-sm cursor-pointer"
        >
          {loading && <LoadingSpinner size="sm" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
