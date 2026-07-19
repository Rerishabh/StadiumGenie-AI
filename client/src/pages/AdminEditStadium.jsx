import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { getStadium, updateStadium } from '../services/stadium.service';
import StadiumForm from '../components/stadium/StadiumForm';
import LoadingSpinner from '../components/common/LoadingSpinner';

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

export default function AdminEditStadium() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stadium, setStadium] = useState(null);
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
        const res = await getStadium(id);
        if (!mounted) return;
        const s = res?.data?.data?.stadium;
        setStadium(s);
      } catch (err) {
        if (!mounted) return;
        setFetchError(err?.response?.data?.message || 'Failed to load stadium.');
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
      await updateStadium(id, payload);
      setSuccess(true);
      setTimeout(() => navigate('/admin/stadiums'), 1500);
    } catch (err) {
      const backendErrors = err?.response?.data?.errors;
      if (backendErrors?.length) {
        setSubmitError(backendErrors.map((e) => e.message).join(' • '));
      } else {
        setSubmitError(err?.response?.data?.message || err.message || 'Failed to update stadium.');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="p-6 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (fetchError || !stadium) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {fetchError || 'Stadium not found.'}
        </div>
        <Link to="/admin/stadiums" className="mt-4 inline-flex items-center gap-2 text-sm text-blue-600 hover:underline">
          <FiArrowLeft size={14} /> Back to Stadiums
        </Link>
      </div>
    );
  }

  // Pre-populate form with existing stadium data
  const defaultValues = {
    name: stadium.name || '',
    city: stadium.city || '',
    state: stadium.state || '',
    country: stadium.country || '',
    address: stadium.address || '',
    description: stadium.description || '',
    capacity: stadium.capacity || '',
    imageUrl: stadium.imageUrl || '',
    facilitiesRaw: (stadium.facilities || []).join(', '),
    latitude: stadium.latitude ?? '',
    longitude: stadium.longitude ?? '',
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/stadiums" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition">
          <FiArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Stadium</h1>
          <p className="text-sm text-gray-500 mt-0.5">Update details for <span className="font-medium text-gray-700">{stadium.name}</span></p>
        </div>
      </div>

      {/* Success Banner */}
      {success && (
        <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">
          ✅ Stadium updated successfully! Redirecting…
        </div>
      )}

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <StadiumForm
          key={stadium.id}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          loading={submitLoading}
          error={submitError}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}
