import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { verifyTicketPublic, admitTicketPublic } from '../services/ticket.service';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function VerifyTicket() {
  const { ticketNumber } = useParams();
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [error, setError] = useState(null);
  const [admitSuccess, setAdmitSuccess] = useState(false);

  async function fetchVerification() {
    try {
      setLoading(true);
      setError(null);
      const res = await verifyTicketPublic(ticketNumber);
      setTicketData(res?.data?.data || res?.data);
    } catch (err) {
      console.error('Error verifying ticket:', err);
      setError(err?.response?.data?.message || 'Invalid or unregistered ticket scan.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (ticketNumber) {
      fetchVerification();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketNumber]);

  const handleAdmit = async () => {
    if (verifying) return;
    setVerifying(true);
    setError(null);
    try {
      await admitTicketPublic(ticketNumber);
      setAdmitSuccess(true);
      // reload verification details to reflect new state
      const res = await verifyTicketPublic(ticketNumber);
      setTicketData(res?.data?.data || res?.data);
    } catch (err) {
      console.error('Gate check-in error:', err);
      setError(err?.response?.data?.message || 'Check-in failed. Please retry.');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-slate-550 font-bold animate-pulse">Running secure cryptographic check-in verification...</p>
      </div>
    );
  }

  const status = ticketData?.status || 'INVALID';
  const attendee = ticketData?.attendeeName || 'Unknown Attendee';
  const eventTitle = ticketData?.eventTitle || 'Sports Event';
  const stadiumName = ticketData?.stadiumName || 'Stadium Arena';
  const city = ticketData?.city || '';
  const price = ticketData?.price;
  const matchTimeStr = ticketData?.startDateTime
    ? new Date(ticketData.startDateTime).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Date TBD';

  // Define visual elements depending on verification status
  let statusCardBg = 'bg-red-50 border-red-200 text-red-700';
  let statusBadge = '❌ INVALID';
  let statusDesc = 'This ticket does not exist, has an incorrect reference, or is forged.';

  if (status === 'VALID') {
    statusCardBg = 'bg-green-50 border-green-200 text-green-800';
    statusBadge = '🟢 VALID ENTRY';
    statusDesc = 'This ticket is valid. You may proceed with attendee check-in admission.';
  } else if (status === 'USED') {
    statusCardBg = 'bg-blue-50 border-blue-200 text-blue-800';
    statusBadge = '🔵 ALREADY USED';
    statusDesc = 'This ticket was already scanned and checked in. Direct entry is denied.';
  } else if (status === 'CANCELLED') {
    statusCardBg = 'bg-red-50 border-red-200 text-red-800';
    statusBadge = '🔴 CANCELLED';
    statusDesc = 'This ticket has been cancelled by the holder or refunded. Entry denied.';
  } else if (status === 'EXPIRED') {
    statusCardBg = 'bg-slate-100 border-slate-300 text-slate-700';
    statusBadge = '⚫ EXPIRED';
    statusDesc = 'The event for this ticket has already finished. Entry denied.';
  } else if (status === 'PAYMENT PENDING') {
    statusCardBg = 'bg-orange-50 border-orange-200 text-orange-800';
    statusBadge = '🟠 PAYMENT PENDING';
    statusDesc = 'Cash reservation is pending. Collect ₹' + (price || 0) + ' at ticket counter before entry check-in.';
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <div className="bg-white border border-slate-100 rounded-3xl shadow-xl overflow-hidden">
        {/* Header decoration */}
        <div className="bg-slate-950 text-white p-6 text-center space-y-1">
          <span className="text-sm font-bold tracking-widest text-slate-400 uppercase">StadiumGenie Gate Check</span>
          <h1 className="text-xl font-extrabold">QR Pass Verification</h1>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {/* Status Display Card */}
          <div className={`p-5 rounded-2xl border text-center space-y-2 ${statusCardBg}`}>
            <h2 className="text-lg font-black tracking-wider uppercase">{statusBadge}</h2>
            <p className="text-xs font-semibold leading-relaxed">{statusDesc}</p>
          </div>

          {/* Ticket/Attendee details */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-150 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Pass Details</h3>
            
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs font-semibold text-slate-500">
              <div>
                <span className="block text-[10px] text-slate-400 font-extrabold uppercase">Ticket Holder</span>
                <span className="text-slate-900 font-bold text-sm">{attendee}</span>
              </div>
              
              <div>
                <span className="block text-[10px] text-slate-400 font-extrabold uppercase">Ticket ID</span>
                <span className="font-mono text-slate-950 font-bold text-sm">{ticketNumber}</span>
              </div>

              <div className="col-span-2">
                <span className="block text-[10px] text-slate-400 font-extrabold uppercase">Event Match</span>
                <span className="text-slate-900 font-extrabold text-sm">{eventTitle}</span>
              </div>

              <div>
                <span className="block text-[10px] text-slate-400 font-extrabold uppercase">Arena Stadium</span>
                <span className="text-slate-900 text-xs">{stadiumName} {city ? `(${city})` : ''}</span>
              </div>

              <div>
                <span className="block text-[10px] text-slate-400 font-extrabold uppercase">Event Date</span>
                <span className="text-slate-950 text-xs font-bold">{matchTimeStr}</span>
              </div>
            </div>
          </div>

          {/* Check-in Admission Action */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-750 font-bold text-xs rounded-xl text-center">
              ⚠️ {error}
            </div>
          )}

          {admitSuccess && (
            <div className="p-3.5 bg-green-50 border border-green-200 text-green-700 text-xs font-bold rounded-xl text-center animate-bounce">
              🎉 Attendee Admitted Successfully! Gate Pass updated to USED.
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex gap-3">
            {/* Gate check action buttons */}
            {status === 'VALID' && (
              <button
                onClick={handleAdmit}
                disabled={verifying}
                className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-extrabold rounded-xl transition-all shadow-md shadow-green-550/20 text-xs uppercase tracking-wider text-center"
              >
                {verifying ? <LoadingSpinner size="sm" /> : '✓ Admit Attendee'}
              </button>
            )}

            {status === 'PAYMENT PENDING' && (
              <button
                onClick={handleAdmit}
                disabled={verifying}
                className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-extrabold rounded-xl transition-all shadow-md shadow-orange-550/20 text-xs uppercase tracking-wider text-center"
              >
                {verifying ? <LoadingSpinner size="sm" /> : '💳 Confirm Cash & Admit'}
              </button>
            )}

            {(status === 'USED' || status === 'CANCELLED' || status === 'EXPIRED') && (
              <div className="w-full py-3.5 bg-slate-100 text-slate-405 font-bold rounded-xl text-xs uppercase tracking-wider text-center border">
                ⛔ Admission Check-in Prohibited
              </div>
            )}
          </div>

          <div className="text-center pt-2">
            <Link to="/" className="text-xs font-bold text-blue-600 hover:underline">
              &larr; Back to Home Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
