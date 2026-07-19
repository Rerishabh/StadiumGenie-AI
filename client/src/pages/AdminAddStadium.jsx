import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { createStadium } from '../services/stadium.service';
import StadiumForm from '../components/stadium/StadiumForm';

function buildPayload(data) {
  const parseCoord = (val) => {
    if (val === undefined || val === null || val === '') return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  };

  return {
    name: data.name?.trim(),
    city: data.city?.trim(),
    state: data.state?.trim() || undefined,
    country: data.country?.trim() || undefined,
    address: data.address?.trim() || undefined,
    description: data.description?.trim() || undefined,
    capacity: Number(data.capacity),
    imageUrl: data.imageUrl?.trim() || undefined,
    facilities: data.facilitiesRaw
      ? data.facilitiesRaw.split(',').map((f) => f.trim()).filter(Boolean)
      : [],
    latitude: parseCoord(data.latitude),
    longitude: parseCoord(data.longitude),
  };
}

export default function AdminAddStadium() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const payload = buildPayload(data);
      await createStadium(payload);
      setSuccess(true);
      setTimeout(() => navigate('/admin/stadiums'), 1500);
    } catch (err) {
      const backendErrors = err?.response?.data?.errors;
      if (backendErrors?.length) {
        setError(backendErrors.map((e) => e.message).join(' • '));
      } else {
        setError(err?.response?.data?.message || err.message || 'Failed to create stadium.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/stadiums" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition">
          <FiArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Stadium</h1>
          <p className="text-sm text-gray-500 mt-0.5">Fill in the details to create a new stadium</p>
        </div>
      </div>

      {/* Success Banner */}
      {success && (
        <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">
          ✅ Stadium created successfully! Redirecting…
        </div>
      )}

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <StadiumForm
          onSubmit={onSubmit}
          loading={loading}
          error={error}
          submitLabel="Create Stadium"
        />
      </div>
    </div>
  );
}
