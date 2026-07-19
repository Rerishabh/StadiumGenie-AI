import React from 'react';
import { useForm } from 'react-hook-form';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Shared stadium form used by AdminAddStadium and AdminEditStadium.
 * Accepts `defaultValues` to pre-populate fields for edit mode.
 * Calls `onSubmit(data)` on valid submission.
 */
export default function StadiumForm({ defaultValues = {}, onSubmit, loading, error, submitLabel = 'Save' }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  const field = (label, key, type = 'text', rules = {}, placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder || label}
        {...register(key, rules)}
        className={`w-full px-3 py-2.5 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 transition ${
          errors[key]
            ? 'border-red-400 focus:ring-red-300'
            : 'border-gray-200 focus:ring-blue-300 focus:border-blue-400'
        }`}
      />
      {errors[key] && (
        <p className="mt-1 text-xs text-red-600">{errors[key].message}</p>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {field('Stadium Name *', 'name', 'text', { required: 'Name is required', minLength: { value: 2, message: 'At least 2 characters' } })}
        {field('City *', 'city', 'text', { required: 'City is required' })}
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {field('State', 'state')}
        {field('Country', 'country')}
        {field('Capacity *', 'capacity', 'number', {
          required: 'Capacity is required',
          min: { value: 1, message: 'Capacity must be at least 1' },
          valueAsNumber: true,
        }, 'e.g. 50000')}
      </div>

      {/* Row 3 */}
      {field('Address', 'address', 'text', {}, 'Full address')}

      {/* Row 4 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          rows={3}
          placeholder="Stadium description..."
          {...register('description')}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition resize-none"
        />
      </div>

      {/* Row 5 */}
      {field('Image URL', 'imageUrl', 'url', {
        pattern: { value: /^https?:\/\/.+/, message: 'Must be a valid URL (http/https)' },
      }, 'https://example.com/stadium.jpg')}

      {/* Row 6 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Facilities <span className="text-gray-400 font-normal">(comma-separated)</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Parking, Wi-Fi, Food Court"
          {...register('facilitiesRaw')}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
        />
        <p className="mt-1 text-xs text-gray-400">Separate each facility with a comma</p>
      </div>

      {/* Row 7 — Coordinates */}
      <div className="grid grid-cols-2 gap-4">
        {field('Latitude', 'latitude', 'number', {
          min: { value: -90, message: 'Must be ≥ -90' },
          max: { value: 90, message: 'Must be ≤ 90' },
          valueAsNumber: true,
        }, '28.6139')}
        {field('Longitude', 'longitude', 'number', {
          min: { value: -180, message: 'Must be ≥ -180' },
          max: { value: 180, message: 'Must be ≤ 180' },
          valueAsNumber: true,
        }, '77.2090')}
      </div>

      {/* Global error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium px-6 py-2.5 rounded-xl transition text-sm shadow-sm"
        >
          {loading && <LoadingSpinner size="sm" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
