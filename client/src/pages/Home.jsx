import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllEvents } from '../services/event.service';
import { getAllStadiums } from '../services/stadium.service';
import EventCard from '../components/event/EventCard';
import StadiumCard from '../components/stadium/StadiumCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { AuthContext } from '../context/AuthContext';

const SPORTS_CATEGORIES = [
  { id: 'Football', label: 'Football / Soccer', icon: '⚽', desc: 'Leagues & tournaments' },
  { id: 'Cricket', label: 'Cricket', icon: '🏏', desc: 'T20 & Test matches' },
  { id: 'Basketball', label: 'Basketball', icon: '🏀', desc: 'Court clashes & finals' },
  { id: 'Tennis', label: 'Tennis', icon: '🎾', desc: 'Grand Slam opens' },
  { id: 'Hockey', label: 'Hockey', icon: '🏑', desc: 'National turf tournaments' },
  { id: 'Badminton', label: 'Badminton', icon: '🏸', desc: 'Fast racket championships' }
];

export default function Home() {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [stadiums, setStadiums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [eventsRes, stadiumsRes] = await Promise.all([
          getAllEvents({ limit: 4, upcoming: true, sportsOnly: true }),
          getAllStadiums({ limit: 4 })
        ]);
        setEvents(eventsRes?.data?.data || eventsRes?.data || []);
        setStadiums(stadiumsRes?.data?.data || stadiumsRes?.data || []);
      } catch (err) {
        console.error('Error fetching landing page data:', err);
        setError('Failed to load featured content. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSportClick = (sportId) => {
    navigate(`/events?sport=${sportId}`);
  };

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white py-14 md:py-16 px-8 md:px-16 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_60%)]" />
        <div className="relative max-w-3xl space-y-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            ⚡ Simulated Demo Platform
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            Discover. Book. <br />
            Experience the Stadium.
          </h1>
          <div className="flex flex-wrap gap-4 pt-1">
            <Link
              to="/events"
              className="px-6 py-3.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all transform hover:-translate-y-0.5 shadow-lg shadow-blue-500/20"
            >
              Browse Events
            </Link>
            <Link
              to="/stadiums"
              className="px-6 py-3.5 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-all transform hover:-translate-y-0.5"
            >
              Explore Stadiums
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Sports Discovery */}
      <section className="space-y-5">
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Explore by Sport</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">Click any sport to instantly filter and browse its events.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {SPORTS_CATEGORIES.map((sport) => (
            <button
              key={sport.id}
              onClick={() => handleSportClick(sport.id)}
              aria-label={`Browse ${sport.label} events`}
              className="group relative p-5 bg-white border-2 border-slate-100 rounded-2xl hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:shadow-sm active:border-blue-700 transition-all duration-200 cursor-pointer text-center flex flex-col items-center justify-center space-y-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span className="text-3xl group-hover:scale-125 transition-transform duration-200 drop-shadow-sm">{sport.icon}</span>
              <div>
                <p className="font-extrabold text-slate-800 text-sm group-hover:text-blue-700 transition-colors">{sport.label}</p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5 truncate">{sport.desc}</p>
              </div>
              <span className="absolute bottom-2 right-2 text-[8px] font-black text-slate-300 group-hover:text-blue-400 transition-colors uppercase tracking-wide">Browse →</span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Featured Upcoming Events */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-slate-500 font-semibold animate-pulse">Loading scheduling databases...</p>
        </div>
      ) : error ? (
        <div className="max-w-md mx-auto p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center">
          {error}
        </div>
      ) : (
        <>
          <section className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Featured Sports Events</h2>
                <p className="text-sm text-slate-500 mt-1">Book your demo passes and seats for highly anticipated match-ups.</p>
              </div>
              <Link to="/events" className="text-sm font-bold text-blue-600 hover:text-blue-500 flex items-center gap-1">
                View all events &rarr;
              </Link>
            </div>
            {events.length === 0 ? (
              <div className="p-12 bg-slate-50 rounded-3xl border border-dashed text-center text-slate-500">
                No active events available at this time.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {events.map((event) => (
                  <EventCard key={event.id || event._id} event={event} />
                ))}
              </div>
            )}
          </section>

          {/* 4. Popular Arenas */}
          <section className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Featured Arenas & Stadiums</h2>
                <p className="text-sm text-slate-500 mt-1">Explore stadiums outfitted with accessibility routes, concessions, and navigation maps.</p>
              </div>
              <Link to="/stadiums" className="text-sm font-bold text-blue-600 hover:text-blue-500 flex items-center gap-1">
                View all stadiums &rarr;
              </Link>
            </div>
            {stadiums.length === 0 ? (
              <div className="p-12 bg-slate-50 rounded-3xl border border-dashed text-center text-slate-500">
                No active stadiums found in database.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {stadiums.map((stadium) => (
                  <StadiumCard key={stadium.id || stadium._id} stadium={stadium} />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* 5. Why StadiumGenie Overview */}
      <section className="bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-sm space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">The Complete Fan Journey</h2>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">From match discovery to gate entrance and indoor routing — StadiumGenie guides you every step.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
          {[
            { icon: '🗺️', title: 'Interactive Stadium Hubs', desc: 'Unlock detailed stadium navigation maps to trace seating sections, food counters, restrooms, and parking gates.' },
            { icon: '🎟️', title: 'Digital QR Tickets', desc: 'Secure, contactless gate passes generated on booking confirmation. Gate checks scan and update status instantly.' },
            { icon: '♿', title: 'Accessible Ramping Routes', desc: 'Prefer elevator and ramp indicators to map barrier-free routes through concessions and seating stands.' },
            { icon: '📊', title: 'Live Gate wait times', desc: 'Avoid queues by reviewing simulated gate crowds (Low, Moderate, Busy) and gate checkers estimated wait times.' },
            { icon: '💬', title: 'Gemini AI Assistant', desc: 'Multilingual assistant helps answer queries about rules, seats, gates, and transportation options.' },
            { icon: '💳', title: 'Simulated Payments', desc: 'Risk-free simulated payment simulation with standard demo methods for Credit Card, UPI, and Cash at Venue.' }
          ].map((item, index) => (
            <div key={index} className="flex gap-4 items-start">
              <span className="text-3xl bg-slate-50 p-3 rounded-2xl border border-slate-100 shrink-0">{item.icon}</span>
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-800 text-base">{item.title}</h4>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Unauthenticated banner (Redesigned) */}
      {!isAuthenticated && (
        <section className="bg-slate-950 text-white rounded-3xl p-8 md:p-12 shadow-lg flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="space-y-2 relative z-10">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Ready for your next game?</h2>
            <p className="text-slate-400 text-sm max-w-md font-semibold">Create an account to browse schedules, unlock simulated checkouts, and view entry passes.</p>
          </div>
          <div className="flex gap-4 shrink-0 relative z-10">
            <Link
              to="/register"
              className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-950 font-bold rounded-xl transition-all shadow-md"
            >
              Sign Up Free
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 font-bold rounded-xl transition-all"
            >
              Sign In
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
