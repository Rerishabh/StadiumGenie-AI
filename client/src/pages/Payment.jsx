import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { getBooking } from '../services/booking.service';
import { createPayment } from '../services/payment.service';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Payment() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchBookingDetails() {
      if (!bookingId) {
        setError('No active booking reference found.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await getBooking(bookingId);
        setBooking(res?.data?.data?.booking || res?.data?.data);
      } catch (err) {
        console.error('Error fetching booking details for payment:', err);
        setError('Failed to retrieve booking details. Please verify your order ID.');
      } finally {
        setLoading(false);
      }
    }
    fetchBookingDetails();
  }, [bookingId]);

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!bookingId || paying) return;
    setPaying(true);
    setPayError(null);
    try {
      await createPayment({
        bookingId,
        paymentMethod
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/profile'); // Redirect to user profile where they view tickets
      }, 3000);
    } catch (err) {
      console.error('Payment processing error:', err);
      setPayError(err?.response?.data?.message || 'Payment transaction failed. Please choose another method.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-slate-500 font-medium">Securing connection to checkout gateway...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-red-50 border border-red-200 text-red-700 rounded-3xl text-center space-y-4">
        <p className="font-semibold">{error || 'Booking summary is not accessible.'}</p>
        <Link to="/events" className="inline-block px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm">
          Browse Events
        </Link>
      </div>
    );
  }

  const isAlreadyPaid = booking.paymentStatus === 'paid';
  const isCancelled = booking.bookingStatus === 'cancelled';

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8 px-4">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight">Complete Your Payment</h1>
        <p className="text-sm text-slate-500 mt-1">Select your preferred payment method and finalize ticket reservation securely.</p>
      </div>

      {success ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg text-center space-y-6 max-w-lg mx-auto animate-fade-in">
          <div className={`h-16 w-16 ${paymentMethod === 'cash' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'} rounded-full flex items-center justify-center text-3xl mx-auto`}>
            {paymentMethod === 'cash' ? '📝' : '✓'}
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900">
              {paymentMethod === 'cash' ? 'Booking Reserved' : 'Payment Successful!'}
            </h2>
            <p className="text-slate-550 font-bold text-sm">
              {paymentMethod === 'cash' ? 'Payment Pending' : 'Your seats are confirmed.'}
            </p>
            <p className="text-slate-500 text-sm leading-relaxed">
              {paymentMethod === 'cash'
                ? `Pay ₹${booking.totalAmount.toLocaleString('en-IN')} at the venue/ticket counter before entry. We are generating your digital QR gate tickets. Redirecting to your ticket profile...`
                : 'We are generating your digital QR gate tickets. Redirecting to your ticket profile...'}
            </p>
          </div>
          <div className="flex justify-center">
            <LoadingSpinner size="sm" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
          {/* Booking Summary Column */}
          <div className="md:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h2 className="text-lg font-extrabold text-slate-900">Payment Summary</h2>
                <span className="font-mono text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded border">
                  {booking.bookingNumber || 'BK-ID'}
                </span>
              </div>
              
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">Event Match</span>
                <h3 className="font-extrabold text-slate-800 text-lg leading-snug mt-1">{booking.event?.title || 'Sports Event'}</h3>
                <p className="text-slate-555 text-xs font-semibold">Stadium Arena: {booking.event?.stadium?.name || booking.event?.stadiumName || 'Arena Venue'}</p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-50 text-sm font-semibold text-slate-600">
                <div className="flex justify-between">
                  <span>Tickets count:</span>
                  <span className="text-slate-900">{booking.quantity} Ticket(s)</span>
                </div>
                <div className="flex justify-between items-end border-t border-slate-100 pt-3">
                  <span className="text-sm font-bold text-slate-800">Grand Total:</span>
                  <span className="text-2xl font-extrabold text-slate-900">₹{booking.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {isAlreadyPaid && (
              <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl text-center text-sm font-bold animate-pulse">
                This booking has already been paid for. Check your profile to view your entry tickets.
              </div>
            )}
            
            {isCancelled && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-center text-sm font-bold">
                This booking has been cancelled and cannot be paid for.
              </div>
            )}
          </div>

          {/* Payment Method Column */}
          {!isAlreadyPaid && !isCancelled && (
            <div className="md:col-span-2">
              <form onSubmit={handleProcessPayment} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg space-y-6 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />
                
                <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                  <h2 className="text-base font-extrabold text-slate-950">Payment Method</h2>
                  <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-105 text-[9px] font-black text-blue-700 uppercase tracking-wider scale-95">
                    Demo Mode
                  </span>
                </div>
                
                <div className="space-y-3">
                  {[
                    { id: 'card', label: 'Credit / Debit Card (Simulated)', desc: 'Instant demo credit card processing' },
                    { id: 'upi', label: 'UPI (GPay / PhonePe - Simulated)', desc: 'Instant mobile payment simulation' },
                    { id: 'netbanking', label: 'Net Banking (Simulated)', desc: 'Direct bank debit transfer simulation' },
                    { id: 'wallet', label: 'Digital Wallet (Simulated)', desc: 'Paytm, Amazon Pay, etc.' },
                    { id: 'cash', label: 'Cash Payment at Venue (Simulated)', desc: 'Pay on ticket pick-up counter at gate' }
                  ].map((method) => (
                    <label
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        paymentMethod === method.id
                          ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                          : 'border-slate-205 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={() => {}}
                        className="mt-1 accent-blue-600"
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-800 leading-none">{method.label}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{method.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {payError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 font-medium text-xs rounded-xl text-center">
                    {payError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={paying}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md shadow-blue-500/25 hover:shadow-lg transition-all transform hover:-translate-y-0.5 text-center flex items-center justify-center uppercase tracking-wider text-xs"
                >
                  {paying ? (
                    <LoadingSpinner size="sm" />
                  ) : paymentMethod === 'cash' ? (
                    `RESERVE TICKETS • PAY ₹${booking.totalAmount.toLocaleString('en-IN')} AT VENUE`
                  ) : (
                    `CONFIRM DEMO PAYMENT • ₹${booking.totalAmount.toLocaleString('en-IN')}`
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}