import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { createEvent } from '../services/event.service';
import EventForm from '../components/event/EventForm';

function buildPayload(data) {
  return {
    stadiumId: data.stadiumId,
    title: data.title?.trim(),
    sport: data.sport,
    organizer: data.organizer?.trim() || undefined,
    description: data.description?.trim() || undefined,
    startDateTime: new Date(data.startDateTime).toISOString(),
    endDateTime: new Date(data.endDateTime).toISOString(),
    totalSeats: Number(data.totalSeats),
    price: Number(data.price),
    bannerImage: data.bannerImageUrl?.trim()
      ? { url: data.bannerImageUrl.trim(), alt: data.title?.trim() || 'Event Banner' }
      : undefined,
  };
}

export default function AdminAddEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const payload = buildPayload(data);
      await createEvent(payload);
      setSuccess(true);
      setTimeout(() => navigate('/admin/events'), 1500);
    } catch (err) {
      const backendErrors = err?.response?.data?.errors;
      if (backendErrors?.length) {
        setError(backendErrors.map((e) => e.message).join(' • '));
      } else {
        setError(err?.response?.data?.message || err.message || 'Failed to create event.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Back Header */}
      <div className="flex items-center gap-3">
        <Link to="/admin/events" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition">
          <FiArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Event</h1>
          <p className="text-sm text-gray-500 mt-0.5">Schedule a new sports match event and reserve gate seats capacity</p>
        </div>
      </div>

      {/* Success Notification */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">
          ✅ Event created successfully! Redirecting to dashboard…
        </div>
      )}

      {/* Form Container Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <EventForm
          onSubmit={onSubmit}
          loading={loading}
          error={error}
          submitLabel="Create Event"
        />
      </div>
    </div>
  );
}
