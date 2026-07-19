import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { getEvent, updateEvent } from '../services/event.service';
import EventForm from '../components/event/EventForm';
import LoadingSpinner from '../components/common/LoadingSpinner';

function buildPayload(data) {
  return {
    title: data.title?.trim(),
    sport: data.sport,
    organizer: data.organizer?.trim() || undefined,
    description: data.description?.trim() || undefined,
    startDateTime: new Date(data.startDateTime).toISOString(),
    endDateTime: new Date(data.endDateTime).toISOString(),
    totalSeats: Number(data.totalSeats),
    price: Number(data.price),
    status: data.status,
    bannerImage: data.bannerImageUrl?.trim()
      ? { url: data.bannerImageUrl.trim(), alt: data.title?.trim() || 'Event Banner' }
      : null,
  };
}

// Convert ISO string date to local string suitable for input type datetime-local
function toLocalDateTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const tzoffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
  const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 16);
  return localISOTime;
}

export default function AdminEditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setFetchLoading(true);
      try {
        const res = await getEvent(id);
        if (!mounted) return;
        const ev = res?.data?.data?.event || res?.data?.data;
        setEvent(ev);
      } catch (err) {
        if (!mounted) return;
        setFetchError(err?.response?.data?.message || 'Failed to load event details.');
      } finally {
        if (!mounted) return;
        setFetchLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [id]);

  const onSubmit = async (data) => {
    setSubmitLoading(true);
    setSubmitError(null);
    try {
      const payload = buildPayload(data);
      await updateEvent(id, payload);
      setSuccess(true);
      setTimeout(() => navigate('/admin/events'), 1500);
    } catch (err) {
      const backendErrors = err?.response?.data?.errors;
      if (backendErrors?.length) {
        setSubmitError(backendErrors.map((e) => e.message).join(' • '));
      } else {
        setSubmitError(err?.response?.data?.message || err.message || 'Failed to update event.');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="p-6 flex justify-center py-16">
        <LoadingSpinner />
      </div>
    );
  }

  if (fetchError || !event) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-bold">
          ⚠️ {fetchError || 'Event details not accessible.'}
        </div>
        <Link to="/admin/events" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline">
          <FiArrowLeft size={14} /> Back to Events
        </Link>
      </div>
    );
  }

  const defaultValues = {
    title: event.title || '',
    sport: event.sport || '',
    stadiumId: event.stadiumId || '',
    organizer: event.organizer || '',
    startDateTime: toLocalDateTime(event.startDateTime),
    endDateTime: toLocalDateTime(event.endDateTime),
    totalSeats: event.totalSeats || '',
    price: event.price || 0,
    status: event.status || 'scheduled',
    description: event.description || '',
    bannerImageUrl: event.bannerImage?.url || '',
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Back Header */}
      <div className="flex items-center gap-3">
        <Link to="/admin/events" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition">
          <FiArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Event</h1>
          <p className="text-sm text-gray-500 mt-0.5">Update details and status for <span className="font-semibold text-gray-700">{event.title}</span></p>
        </div>
      </div>

      {/* Success Notification */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">
          ✅ Event details updated successfully! Redirecting…
        </div>
      )}

      {/* Form Container Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <EventForm
          key={event.id || event._id}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          loading={submitLoading}
          error={submitError}
          submitLabel="Save Changes"
          isEdit={true}
        />
      </div>
    </div>
  );
}
