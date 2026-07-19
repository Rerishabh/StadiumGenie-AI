import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserTickets } from '../services/ticket.service';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Filter tabs: 'active' | 'used' | 'pending' | 'cancelled_expired'
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    async function fetchTickets() {
      try {
        setLoading(true);
        const res = await getUserTickets();
        setTickets(res?.data?.data || []);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError('Failed to retrieve your tickets. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    fetchTickets();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-slate-500 font-medium animate-pulse">Loading your entry tickets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-red-50 border border-red-200 text-red-700 rounded-3xl text-center space-y-4">
        <p className="font-semibold">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  // Helper properties per ticket
  const now = new Date();
  const processedTickets = tickets.map(ticket => {
    const matchTime = ticket.event?.startDateTime ? new Date(ticket.event.startDateTime) : null;
    const isExpired = matchTime && matchTime < now;
    const isCancelled = ticket.ticketStatus === 'cancelled';
    const isUsed = ticket.ticketStatus === 'used';
    const isCashPending = ticket.booking?.paymentStatus === 'pending' && !isCancelled;
    
    // Genuinely eligible for active entry
    const isActive = ticket.ticketStatus === 'active' && !isExpired && !isCashPending;

    return {
      ...ticket,
      isExpired,
      isCancelled,
      isUsed,
      isCashPending,
      isActive
    };
  });

  const activePasses = processedTickets.filter(t => t.isActive);
  const usedPasses = processedTickets.filter(t => t.isUsed);
  const pendingPasses = processedTickets.filter(t => t.isCashPending);
  const inactivePasses = processedTickets.filter(t => t.isCancelled || t.isExpired);

  const getFilteredList = () => {
    if (activeTab === 'active') return activePasses;
    if (activeTab === 'used') return usedPasses;
    if (activeTab === 'pending') return pendingPasses;
    return inactivePasses;
  };

  const filteredList = getFilteredList();

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight">My Entry Tickets</h1>
          <p className="text-sm text-slate-500 mt-1">Present your QR code at the stadium gate check-in point for contactless entry.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 shrink-0">
          {[
            { id: 'active', label: `Active (${activePasses.length})` },
            { id: 'used', label: `Used (${usedPasses.length})` },
            { id: 'pending', label: `Pending Payment (${pendingPasses.length})` },
            { id: 'cancelled_expired', label: `Inactive (${inactivePasses.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                activeTab === tab.id
                  ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-slate-50 rounded-3xl border border-dashed space-y-5 text-center">
          <div className="text-5xl">🎟️</div>
          <div className="space-y-2">
            <p className="text-xl font-extrabold text-slate-800">No tickets yet</p>
            <p className="text-sm text-slate-500 max-w-xs">
              You haven't purchased any tickets. Browse upcoming events and secure your spot!
            </p>
          </div>
          <Link
            to="/events"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 text-sm"
          >
            Browse Matches
          </Link>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="p-16 bg-slate-50/50 rounded-3xl text-center border border-slate-150 space-y-3">
          <span className="text-3xl block">🎟️</span>
          <p className="text-slate-550 font-bold text-sm">No passes found in this section.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredList.map((ticket) => {
            const tId = ticket.id || ticket._id;
            
            let statusColor = 'bg-slate-50 text-slate-500 border-slate-200';
            let topAccent = 'bg-slate-300';
            
            if (ticket.isActive) {
              statusColor = 'bg-green-50 text-green-700 border-green-200';
              topAccent = 'bg-gradient-to-r from-blue-600 to-indigo-600';
            } else if (ticket.isUsed) {
              statusColor = 'bg-blue-550/10 text-blue-600 border-blue-200/50';
              topAccent = 'bg-slate-400';
            } else if (ticket.isCashPending) {
              statusColor = 'bg-orange-50 text-orange-700 border-orange-200';
              topAccent = 'bg-orange-400';
            } else if (ticket.isCancelled) {
              statusColor = 'bg-red-50 text-red-600 border-red-200';
              topAccent = 'bg-red-400';
            } else if (ticket.isExpired) {
              statusColor = 'bg-slate-100 text-slate-500 border-slate-250';
              topAccent = 'bg-slate-350';
            }

            return (
              <div
                key={tId}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col justify-between h-full"
              >
                <div>
                  {/* Top accent bar */}
                  <div className={`h-1.5 w-full ${topAccent}`} />
                  
                  <div className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5 min-w-0">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                          Entry Pass
                        </span>
                        <h3 className="text-lg font-extrabold text-slate-900 truncate mt-1">
                          {ticket.event?.title || 'Unknown Event'}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium truncate">
                          🏟️ {ticket.stadium?.name ? `${ticket.stadium.name}, ${ticket.stadium.city}` : 'Stadium Arena'}
                        </p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wider shrink-0 ${statusColor}`}>
                        {ticket.isCashPending ? 'Payment Pending' : ticket.isExpired ? 'Expired' : ticket.ticketStatus}
                      </span>
                    </div>

                    {/* Match Date/Time */}
                    {ticket.event?.startDateTime && (
                      <div className="text-xs text-slate-650 font-bold bg-slate-50 rounded-xl p-3 border border-slate-100/80">
                        📅 {new Date(ticket.event.startDateTime).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}

                    {/* Issued date */}
                    {ticket.issuedAt && (
                      <p className="text-[10px] text-slate-400 font-bold">
                        ISSUED: {new Date(ticket.issuedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}

                    {/* Perforation line */}
                    <div className="border-t-2 border-dashed border-slate-105" />

                    {/* QR Code and Reference info */}
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-slate-50 rounded-2xl border border-slate-150 flex items-center justify-center shrink-0 shadow-inner overflow-hidden relative">
                        {/* Only display QR if booking is paid and ticket is active/used */}
                        {(ticket.isActive || ticket.isUsed) ? (
                          <img
                            src={ticket.qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(ticket.ticketNumber)}`}
                            alt={`QR for ${ticket.ticketNumber}`}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center p-2">
                            <span className="text-lg">🔒</span>
                            <span className="text-[8px] font-bold text-slate-405 leading-tight uppercase tracking-tight">QR Locked</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Ticket Number</p>
                        <p className="font-mono text-xs font-bold text-slate-800 truncate">{ticket.ticketNumber}</p>
                        <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider mt-1">Booking Ref</p>
                        <p className="font-mono text-xs font-bold text-slate-800 truncate">{ticket.bookingId ? String(ticket.bookingId) : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom interactive actions */}
                <div className="p-6 pt-0">
                  {ticket.isActive ? (
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="w-full py-3 bg-slate-950 hover:bg-slate-850 text-white font-bold rounded-xl text-xs transition-all uppercase tracking-wider shadow-sm shadow-slate-950/15"
                    >
                      🔍 View Full QR Code
                    </button>
                  ) : ticket.isCashPending ? (
                    <div className="space-y-2">
                      <div className="p-2.5 bg-orange-50 border border-orange-100 rounded-xl text-center text-[11px] font-bold text-orange-850">
                        ⚠️ Cash payment pending. Pay ₹{ticket.event?.price} at the venue gate to unlock entry.
                      </div>
                      <Link
                        to={`/payment?bookingId=${ticket.bookingId}`}
                        className="block w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-center font-bold rounded-xl text-xs transition-all uppercase tracking-wider shadow-sm"
                      >
                        💳 Pay Now / Checkout
                      </Link>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center text-xs font-bold text-slate-400 uppercase tracking-wide">
                      {ticket.isUsed ? '🔒 Ticket Check-in Completed' : '❌ Ticket Inactive / Cancelled'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Modal */}
      {selectedTicket && (
        <div
          className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full border border-slate-100 shadow-2xl relative space-y-6 text-center transform scale-100 transition-transform"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-2xl font-bold leading-none select-none"
            >
              ×
            </button>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-0.5 rounded">Stadium Entry Pass</span>
              <h3 className="text-lg font-extrabold text-slate-950 leading-snug mt-2">{selectedTicket.event?.title || 'Unknown Event'}</h3>
              <p className="text-xs text-slate-500 font-semibold">{selectedTicket.stadium?.name ? `${selectedTicket.stadium.name}, ${selectedTicket.stadium.city}` : 'Stadium Arena'}</p>
            </div>

            {/* Large QR Code */}
            <div className="mx-auto w-56 h-56 bg-slate-50 rounded-3xl border border-slate-200 flex items-center justify-center p-3 shadow-inner">
              <img
                src={selectedTicket.qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(selectedTicket.ticketNumber)}`}
                alt="Entry QR Code"
                className="w-full h-full object-contain p-1"
              />
            </div>

            {/* Ticket Info Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border text-left space-y-2.5 text-xs text-slate-600 font-semibold">
              <div className="flex justify-between">
                <span>Pass Number:</span>
                <span className="font-mono text-slate-900 font-bold">{selectedTicket.ticketNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Gate Entry Status:</span>
                <span className="font-bold text-green-700 uppercase tracking-wider">{selectedTicket.ticketStatus}</span>
              </div>
              {selectedTicket.event?.startDateTime && (
                <div className="flex justify-between">
                  <span>Match Time:</span>
                  <span className="text-slate-900 font-bold">
                    {new Date(selectedTicket.event.startDateTime).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedTicket(null)}
              className="w-full py-3.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl transition-all text-xs uppercase tracking-wider"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}