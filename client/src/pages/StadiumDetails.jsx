import React, { useEffect, useState, useRef, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useApiState from '../hooks/useApiState';
import { getStadium } from '../services/stadium.service';
import { getAllEvents } from '../services/event.service';
import { getUserTickets } from '../services/ticket.service';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ChatWidget from '../components/common/ChatWidget';
import { resolveStadiumImage, getStadiumFallback, DEFAULT_STADIUM_FALLBACK } from '../utils/imageResolver';

// ----------------------------------------------------
// Graph nodes for SVG Interactive navigation pathfinder
// ----------------------------------------------------
const NODES = {
  parking_1: { label: '🅿️ Parking Zone 1 (West)', x: 50, y: 350, isAccessible: true },
  parking_2: { label: '🅿️ Parking Zone 2 (East)', x: 350, y: 350, isAccessible: true },
  gate_a: { label: '🚪 Gate A (West Entry)', x: 80, y: 220, isAccessible: true },
  gate_b: { label: '🚪 Gate B (North Entry)', x: 200, y: 50, isAccessible: true },
  gate_c: { label: '🚪 Gate C (East Entry)', x: 320, y: 220, isAccessible: true },
  gate_d: { label: '🚪 Gate D (South Entry)', x: 200, y: 350, isAccessible: true },
  sec_100: { label: '🎟️ Section 100 (East Stand)', x: 270, y: 110, isAccessible: true },
  sec_200: { label: '🎟️ Section 200 (West Stand - Stairs Only)', x: 130, y: 110, isAccessible: false },
  sec_300: { label: '🎟️ Section 300 (South-West Stand)', x: 130, y: 290, isAccessible: true },
  sec_400: { label: '🎟️ Section 400 (South-East Stand)', x: 270, y: 290, isAccessible: true },
  restroom_w: { label: '🚽 Restroom West (Concourse)', x: 130, y: 180, isAccessible: true },
  restroom_e: { label: '🚽 Restroom East (Concourse)', x: 270, y: 180, isAccessible: true },
  food_court: { label: '🍔 Concourse Food Court', x: 200, y: 200, isAccessible: true },
  medical_center: { label: '🏥 First Aid Medical Center', x: 140, y: 230, isAccessible: true },
  info_desk: { label: 'ℹ️ Information Desk', x: 260, y: 230, isAccessible: true }
};

const EDGES = [
  { from: 'parking_1', to: 'gate_a', isAccessible: true },
  { from: 'parking_1', to: 'gate_d', isAccessible: true },
  { from: 'parking_2', to: 'gate_c', isAccessible: true },
  { from: 'parking_2', to: 'gate_d', isAccessible: true },
  { from: 'gate_a', to: 'medical_center', isAccessible: true },
  { from: 'gate_a', to: 'sec_200', isAccessible: false },
  { from: 'gate_b', to: 'sec_200', isAccessible: false },
  { from: 'gate_b', to: 'sec_100', isAccessible: true },
  { from: 'gate_b', to: 'restroom_w', isAccessible: true },
  { from: 'gate_b', to: 'restroom_e', isAccessible: true },
  { from: 'gate_c', to: 'info_desk', isAccessible: true },
  { from: 'gate_c', to: 'sec_100', isAccessible: true },
  { from: 'gate_d', to: 'food_court', isAccessible: true },
  { from: 'gate_d', to: 'sec_300', isAccessible: true },
  { from: 'gate_d', to: 'sec_400', isAccessible: true },
  { from: 'medical_center', to: 'restroom_w', isAccessible: true },
  { from: 'medical_center', to: 'sec_300', isAccessible: true },
  { from: 'info_desk', to: 'restroom_e', isAccessible: true },
  { from: 'info_desk', to: 'sec_400', isAccessible: true },
  { from: 'restroom_w', to: 'food_court', isAccessible: true },
  { from: 'restroom_e', to: 'food_court', isAccessible: true },
  { from: 'sec_100', to: 'restroom_e', isAccessible: true },
  { from: 'sec_200', to: 'restroom_w', isAccessible: true },
  { from: 'sec_300', to: 'food_court', isAccessible: true },
  { from: 'sec_400', to: 'food_court', isAccessible: true }
];

// BFS shortest path search
function findShortestPath(startNode, endNode, accessibleOnly = false) {
  if (!startNode || !endNode) return null;
  if (startNode === endNode) return [startNode];
  if (accessibleOnly && (!NODES[startNode]?.isAccessible || !NODES[endNode]?.isAccessible)) return null;

  const queue = [[startNode]];
  const visited = new Set();

  while (queue.length > 0) {
    const path = queue.shift();
    const curr = path[path.length - 1];

    if (curr === endNode) return path;

    if (!visited.has(curr)) {
      visited.add(curr);
      // Find neighbors
      const neighbors = EDGES.filter(edge => {
        if (accessibleOnly && !edge.isAccessible) return false;
        return edge.from === curr || edge.to === curr;
      }).map(edge => edge.from === curr ? edge.to : edge.from);

      for (const neighbor of neighbors) {
        if (accessibleOnly && !NODES[neighbor]?.isAccessible) continue;
        if (!visited.has(neighbor)) {
          queue.push([...path, neighbor]);
        }
      }
    }
  }
  return null;
}

export default function StadiumDetails() {
  const { id } = useParams();
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const stadiumState = useApiState(null);
  const eventsState = useApiState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Pathfinder state
  const [navFrom, setNavFrom] = useState('parking_1');
  const [navTo, setNavTo] = useState('sec_100');
  const [accessibleOnly, setAccessibleOnly] = useState(false);
  const [computedPath, setComputedPath] = useState(null);

  // Sidebar toggle - default open on desktop, closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState('');

  // Derive stadium from state — used by the image effect below (must be before all effects)
  const stadium = stadiumState.data?.data?.stadium ?? null;

  // Image resolution effect — MUST stay here (before any early returns) to satisfy Rules of Hooks
  useEffect(() => {
    if (stadium) {
      setImgSrc(resolveStadiumImage(stadium));
    }
  }, [stadium]);

  useEffect(() => {
    let mounted = true;
    async function fetchStadiumData() {
      stadiumState.setLoading(true);
      try {
        const res = await getStadium(id);
        if (!mounted) return;
        stadiumState.setData(res.data);
      } catch (err) {
        if (!mounted) return;
        stadiumState.setError(err);
      } finally {
        if (!mounted) return;
        stadiumState.setLoading(false);
      }
    }
    fetchStadiumData();
    return () => { mounted = false; };
  }, [id]);

  useEffect(() => {
    let mounted = true;
    async function fetchEvents() {
      eventsState.setLoading(true);
      try {
        const res = await getAllEvents({ stadiumId: id, limit: 10 });
        if (!mounted) return;
        eventsState.setData(res.data);
      } catch (err) {
        if (!mounted) return;
        eventsState.setError(err);
      } finally {
        if (!mounted) return;
        eventsState.setLoading(false);
      }
    }
    fetchEvents();
    return () => { mounted = false; };
  }, [id]);

  // Load user tickets for ticket-aware navigation
  useEffect(() => {
    let mounted = true;
    async function fetchTickets() {
      if (!isAuthenticated) return;
      try {
        const res = await getUserTickets();
        if (!mounted) return;
        const list = res?.data?.data || [];
        // Filter by current stadium (supporting both populated _id object or string match)
        const matched = list.filter(t => {
          const sId = t.stadiumId || t.stadium?.id || t.stadium?._id;
          return String(sId) === String(id);
        });
        setMyTickets(matched);
      } catch (err) {
        console.warn('Failed to load tickets in Stadium Hub context:', err);
      }
    }
    fetchTickets();
    return () => { mounted = false; };
  }, [id, isAuthenticated]);

  // Solve route whenever inputs or toggles change
  useEffect(() => {
    const path = findShortestPath(navFrom, navTo, accessibleOnly);
    setComputedPath(path);
  }, [navFrom, navTo, accessibleOnly]);

  if (stadiumState.loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-slate-500 font-semibold animate-pulse">Entering Stadium Hub...</p>
      </div>
    );
  }

  if (stadiumState.error) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-red-50 border border-red-200 text-red-700 rounded-3xl text-center">
        <p className="font-extrabold text-lg">Error loading Stadium Hub</p>
        <p className="text-xs text-red-500 mt-1 font-semibold">Please check connection parameters and try again.</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-5 py-2 bg-red-650 text-white rounded-xl text-xs font-black shadow-sm uppercase">
          Retry
        </button>
      </div>
    );
  }

  if (!stadium) {
    return (
      <div className="max-w-md mx-auto my-12">
        <EmptyState title="Stadium profile not found" description="The venue index reference could not be fetched from database." />
      </div>
    );
  }

  const events = eventsState.data?.data || [];

  const handleImgError = () => {
    if (!stadium) return;
    const fallback = getStadiumFallback(stadium);
    if (imgSrc !== fallback) {
      setImgSrc(fallback);
    } else if (imgSrc !== DEFAULT_STADIUM_FALLBACK) {
      setImgSrc(DEFAULT_STADIUM_FALLBACK);
    }
  };

  // Find user's active ticket for seating guidance
  const activeTicket = myTickets.find(t => t.ticketStatus === 'active');
  const userSection = activeTicket ? 'sec_300' : null; // Simulated assignment
  const userGate = activeTicket ? 'gate_b' : null; // North gate assignment

  const handleFacilityNavigate = (targetNode) => {
    setNavFrom(activeTicket ? userSection || 'gate_a' : 'gate_a');
    setNavTo(targetNode);
    setActiveTab('map');
  };

  const handleSeatNavigate = () => {
    if (userSection && userGate) {
      setNavFrom(userGate);
      setNavTo(userSection);
      setActiveTab('map');
    }
  };

  const handleGateNavigate = () => {
    if (userGate) {
      setNavFrom('parking_1');
      setNavTo(userGate);
      setActiveTab('map');
    }
  };

  // Define tabs with labels and icons
  const TABS = [
    { id: 'overview', label: 'Overview', icon: '🏟️' },
    { id: 'events', label: 'Upcoming Matches', icon: '📅' },
    { id: 'ticket', label: 'My Ticket', icon: '🎟️' },
    { id: 'map', label: 'Navigation Map', icon: '🗺️' },
    { id: 'crowd', label: 'Crowd & Gates', icon: '📊' },
    { id: 'facilities', label: 'Facilities', icon: '🚽' },
    { id: 'accessibility', label: 'Accessibility', icon: '♿' },
    { id: 'transport', label: 'Transport', icon: '🚇' },
    { id: 'ai', label: 'AI Assistant', icon: '💬' }
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[580px] pb-12 relative">
      {/* Mobile Drawer Toggle Header */}
      <div className="lg:hidden bg-slate-900 text-white p-4 rounded-2xl flex justify-between items-center shadow-sm">
        <div>
          <h2 className="text-sm font-black truncate">{stadium.name}</h2>
          <p className="text-[10px] text-slate-400">Stadium Hub Navigation</p>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          aria-label={mobileSidebarOpen ? 'Close stadium hub menu' : 'Open stadium hub menu'}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 text-xs font-bold rounded-lg border border-slate-700 uppercase"
        >
          {mobileSidebarOpen ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Close
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Menu
            </>
          )}
        </button>
      </div>

      {/* Desktop: collapsed sidebar = small icon column; expanded = full sidebar */}
      {/* Desktop Collapse Trigger (shown when sidebar is collapsed) */}
      {!sidebarOpen && (
        <div className="hidden lg:flex flex-col items-center gap-2 w-12 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Expand stadium hub menu"
            title="Open Stadium Hub Menu"
            className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-blue-50 hover:border-blue-300 transition-all"
          >
            <svg className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {/* Tab icon shortcuts when collapsed */}
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSidebarOpen(true); }}
              title={tab.label}
              className={`w-9 h-9 flex items-center justify-center rounded-xl text-base transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-100 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {tab.icon}
            </button>
          ))}
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`${
          mobileSidebarOpen ? 'block' : 'hidden'
        } lg:${sidebarOpen ? 'block' : 'hidden'} w-full lg:w-64 shrink-0 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-5 lg:sticky lg:top-24 h-fit z-30`}
      >
        {/* Sidebar header with collapse button on desktop */}
        <div className="flex items-start justify-between border-b border-slate-50 pb-3">
          <div className="min-w-0">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug truncate">{stadium.name}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">📍 {stadium.city}, {stadium.country}</p>
          </div>
          {/* Desktop collapse button */}
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Collapse stadium hub sidebar"
            title="Collapse sidebar"
            className="hidden lg:flex shrink-0 ml-2 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M21 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <nav className="space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-extrabold text-left transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                  : 'text-slate-655 hover:bg-slate-50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.id === 'ticket' && myTickets.length > 0 && (
                <span className="ml-auto px-1.5 py-0.5 rounded-full bg-orange-500 text-[8px] font-black text-white uppercase animate-pulse">
                  {myTickets.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Tab Panel Content */}
      <main className="flex-1 min-w-0 bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="relative h-48 md:h-72 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-50 shadow-sm">
              <img
                src={imgSrc || DEFAULT_STADIUM_FALLBACK}
                alt={stadium.name}
                className="w-full h-full object-cover"
                onError={handleImgError}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <span className="px-2 py-0.5 rounded bg-blue-600 text-[9px] font-black uppercase tracking-wider">
                  Arena Venue
                </span>
                <h3 className="text-xl md:text-2xl font-black mt-1">{stadium.name}</h3>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-50 pb-2">Venue Overview</h3>
              <p className="text-slate-600 text-xs font-semibold leading-relaxed">
                {stadium.description || 'Welcome to the home arena, hosting premium sporting championships and live events. Outfitted with state-of-the-art turf fields, concessions stands, and check-in gate counters.'}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border text-center">
                <span className="block text-[9px] text-slate-400 font-extrabold uppercase">Capacity</span>
                <span className="text-base font-extrabold text-slate-800">{stadium.capacity?.toLocaleString() || 'N/A'}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border text-center">
                <span className="block text-[9px] text-slate-400 font-extrabold uppercase">Address</span>
                <span className="text-xs font-extrabold text-slate-700 truncate block mt-0.5">{stadium.address || 'Concourse Gate'}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border text-center">
                <span className="block text-[9px] text-slate-400 font-extrabold uppercase">System Rating</span>
                <span className="text-base font-extrabold text-slate-800">⭐ {stadium.rating || '4.8'}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border text-center">
                <span className="block text-[9px] text-slate-400 font-extrabold uppercase">Sports Played</span>
                <span className="text-xs font-extrabold text-slate-700 block mt-0.5">{stadium.sportsSupported?.join(', ') || 'Multi-Sport'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Events */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-50 pb-2">Scheduled Matches</h3>
              <p className="text-xs text-slate-500 mt-1">Directly book passes for upcoming events scheduled inside this stadium.</p>
            </div>

            {events.length === 0 ? (
              <div className="p-12 text-center border border-dashed rounded-2xl text-slate-400 text-xs font-bold bg-slate-50/50">
                No upcoming events scheduled at this stadium.
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <div key={event.id || event._id} className="p-4 border rounded-2xl bg-white hover:bg-slate-50/40 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[8px] font-black uppercase">
                        {event.sport}
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-sm mt-1">{event.title}</h4>
                      <p className="text-[10px] text-slate-500 font-semibold">
                        📅 {new Date(event.startDateTime).toLocaleDateString(undefined, { dateStyle: 'medium' })} • 🕒 {new Date(event.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-2 md:pt-0">
                      <div className="text-left md:text-right">
                        <p className="text-[9px] text-slate-400 font-bold uppercase">Simulated Price</p>
                        <p className="text-base font-extrabold text-slate-950">₹{event.price.toLocaleString('en-IN')}</p>
                      </div>
                      <Link
                        to={`/events/${event.id || event._id}`}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all"
                      >
                        Book Ticket
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: My Ticket (Ticket-Aware UI) */}
        {activeTab === 'ticket' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-50 pb-2">My Venue Passes</h3>
              <p className="text-xs text-slate-500 mt-1">Review active seating allocations and recommended gates for scheduled matches.</p>
            </div>

            {!isAuthenticated ? (
              <div className="p-8 text-center border rounded-2xl bg-slate-50 space-y-3">
                <p className="text-xs text-slate-500 font-bold">Sign in to check-in and verify your tickets inside the Stadium Hub.</p>
                <Link to="/login" className="inline-block px-4 py-2 bg-blue-600 text-white text-xs font-black rounded-lg uppercase">Sign In</Link>
              </div>
            ) : myTickets.length === 0 ? (
              <div className="p-12 text-center border border-dashed rounded-2xl text-slate-400 text-xs font-bold bg-slate-50/50">
                You do not have any active booking tickets for this venue.
              </div>
            ) : (
              <div className="space-y-4">
                {myTickets.map((t) => {
                  const isPending = t.booking?.paymentStatus === 'pending';
                  const isCancelled = t.ticketStatus === 'cancelled';
                  const isUsed = t.ticketStatus === 'used';

                  return (
                    <div key={t.id} className="border rounded-2xl overflow-hidden bg-white shadow-sm flex flex-col md:flex-row">
                      {/* Ticket graphics left */}
                      <div className="bg-slate-900 text-white p-5 md:w-56 flex flex-col justify-between border-r border-dashed border-slate-700 relative">
                        <div className="space-y-2">
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[8px] font-black uppercase tracking-wider">
                            Match Ticket
                          </span>
                          <h4 className="font-extrabold text-xs leading-tight truncate">{t.event?.title || 'Stadium Event'}</h4>
                        </div>

                        <div className="mt-8 space-y-1">
                          <p className="text-[8px] text-slate-400 font-bold uppercase">Seat Stands Allocation</p>
                          <p className="text-xs font-black text-white uppercase">Section 300 • Row G • Seat 42</p>
                        </div>

                        {/* Ticket punch dots */}
                        <div className="absolute top-1/2 -right-2.5 h-5 w-5 bg-white rounded-full hidden md:block" />
                        <div className="absolute top-1/2 -left-2.5 h-5 w-5 bg-white rounded-full hidden md:block" />
                      </div>

                      {/* Ticket details right */}
                      <div className="p-5 flex-1 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">Pass Reference</p>
                            <p className="text-xs font-black text-slate-800 font-mono mt-0.5">{t.ticketNumber}</p>
                          </div>
                          <div>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                              isCancelled ? 'bg-red-100 text-red-700' :
                              isUsed ? 'bg-gray-100 text-gray-700' :
                              isPending ? 'bg-orange-100 text-orange-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {isCancelled ? 'Cancelled' : isUsed ? 'Admitted' : isPending ? 'Payment Pending' : 'Active'}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs border-t border-slate-50 pt-3">
                          <div>
                            <p className="text-[8px] text-slate-400 font-bold uppercase">Gate Assigned</p>
                            <p className="font-extrabold text-slate-700">Gate B (North Entry)</p>
                          </div>
                          <div>
                            <p className="text-[8px] text-slate-400 font-bold uppercase">Status Check</p>
                            <p className="font-extrabold text-slate-700">
                              {isCancelled ? '❌ Access Locked' : isPending ? '⚠️ Unpaid - Pay at gate' : '✅ Ready to admit'}
                            </p>
                          </div>
                        </div>

                        {/* Interactive map actions for active ticket */}
                        {!isCancelled && (
                          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-50">
                            <button
                              onClick={handleSeatNavigate}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-extrabold rounded-lg uppercase tracking-wider"
                            >
                              📍 Navigate to My Seat
                            </button>
                            <button
                              onClick={handleGateNavigate}
                              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-extrabold rounded-lg uppercase tracking-wider"
                            >
                              🚪 Route to Gate B
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Map & Navigation (Pathfinder) */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-50 pb-2">Indoor Pathfinder Navigation</h3>
              <p className="text-xs text-slate-500 mt-1">Select your start point and destination. Highlights are computed in real-time on our demo vector map.</p>
            </div>

            {/* Selector Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border">
              <div>
                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Starting Point</label>
                <select
                  value={navFrom}
                  onChange={(e) => setNavFrom(e.target.value)}
                  className="w-full bg-white border rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                >
                  {Object.entries(NODES).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] text-slate-400 font-bold uppercase mb-1">Destination Node</label>
                <select
                  value={navTo}
                  onChange={(e) => setNavTo(e.target.value)}
                  className="w-full bg-white border rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                >
                  {Object.entries(NODES).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center md:pt-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={accessibleOnly}
                    onChange={(e) => setAccessibleOnly(e.target.checked)}
                    className="accent-blue-600 h-4 w-4"
                  />
                  ♿ Accessible Route Only
                </label>
              </div>
            </div>

            {/* SVG Visual Map Panel */}
            <div className="relative border rounded-2xl bg-slate-900 p-4 shadow-inner overflow-hidden flex items-center justify-center min-h-[350px]">
              <div className="absolute top-4 left-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/80">
                Vector Arena Map
              </div>

              {/* Map SVG Grid */}
              <svg width="100%" height="350px" viewBox="0 0 400 400" className="max-w-[400px]">
                {/* Outermost wall circle */}
                <circle cx="200" cy="200" r="170" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="5,5" />
                <circle cx="200" cy="200" r="140" fill="none" stroke="#475569" strokeWidth="1.5" />

                {/* Sports field pitch base */}
                {stadium.sportsSupported?.includes('Cricket') ? (
                  <ellipse cx="200" cy="200" rx="60" ry="50" fill="#15803d" stroke="#16a34a" strokeWidth="2" opacity="0.6" />
                ) : stadium.sportsSupported?.includes('Basketball') ? (
                  <rect x="150" y="160" width="100" height="80" rx="3" fill="#b45309" stroke="#d97706" strokeWidth="2" opacity="0.6" />
                ) : (
                  // Default Football
                  <rect x="140" y="150" width="120" height="100" rx="6" fill="#166534" stroke="#15803d" strokeWidth="2" opacity="0.6" />
                )}

                {/* Draw all edges */}
                {EDGES.map((edge, idx) => {
                  const nFrom = NODES[edge.from];
                  const nTo = NODES[edge.to];
                  if (!nFrom || !nTo) return null;
                  return (
                    <line
                      key={idx}
                      x1={nFrom.x}
                      y1={nFrom.y}
                      x2={nTo.x}
                      y2={nTo.y}
                      stroke={edge.isAccessible ? '#334155' : '#7f1d1d'}
                      strokeWidth="2"
                      opacity="0.35"
                    />
                  );
                })}

                {/* Draw computed active neon-blue path */}
                {computedPath && computedPath.length > 1 && (
                  <path
                    d={`M ${computedPath.map(k => `${NODES[k].x} ${NODES[k].y}`).join(' L ')}`}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-pulse"
                  />
                )}

                {/* Draw Node Markers */}
                {Object.entries(NODES).map(([key, node]) => {
                  const isSelected = key === navFrom || key === navTo;
                  const isInPath = computedPath && computedPath.includes(key);

                  return (
                    <g key={key} className="cursor-pointer">
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={isSelected ? '9' : isInPath ? '7' : '5'}
                        fill={
                          isSelected ? '#ef4444' :
                          isInPath ? '#3b82f6' :
                          node.isAccessible ? '#475569' : '#b91c1c'
                        }
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                      {/* Short codes above elements */}
                      <text
                        x={node.x}
                        y={node.y - 10}
                        textAnchor="middle"
                        fill="#94a3b8"
                        fontSize="8px"
                        fontWeight="bold"
                        className="pointer-events-none select-none bg-slate-950"
                      >
                        {key.toUpperCase().replace('_', ' ')}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Path description block */}
            <div className="bg-slate-50 p-4 rounded-xl border space-y-2">
              <h4 className="text-xs font-bold text-slate-800">Suggested Route Details:</h4>
              {computedPath ? (
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-600">
                  {computedPath.map((key, i) => (
                    <React.Fragment key={key}>
                      <span className={`px-2 py-1 rounded border bg-white ${key === navFrom || key === navTo ? 'border-red-300 text-slate-900 ring-1 ring-red-300' : ''}`}>
                        {NODES[key]?.label.split('(')[0]}
                      </span>
                      {i < computedPath.length - 1 && <span>&rarr;</span>}
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-red-500 font-bold">
                  ⚠️ {accessibleOnly ? 'No fully accessible route could be mapped. Section 200 stands require stairs. Try disabling Accessible Route Only or contact field assistance.' : 'No mapping connection found between selected areas.'}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Crowd & Gate Status */}
        {activeTab === 'crowd' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-50 pb-2">Gate Wait times & Crowd Status</h3>
              <p className="text-xs text-slate-500 mt-1">Review live entry point status. Estimates are simulated for event day coordination.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Gate A (West)', status: 'Open', crowd: 'Low', wait: '1 min', color: 'text-green-600' },
                { name: 'Gate B (North)', status: 'Open', crowd: 'Moderate', wait: '5 mins', color: 'text-yellow-600' },
                { name: 'Gate C (East)', status: 'Open', crowd: 'Busy', wait: '15 mins', color: 'text-orange-600' },
                { name: 'Gate D (South)', status: 'Open', crowd: 'Very Busy', wait: '28 mins', color: 'text-red-650' }
              ].map((gate) => (
                <div key={gate.name} className="p-4 border rounded-2xl bg-white shadow-sm flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">{gate.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Estimated Wait: {gate.wait}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded bg-green-50 border text-[8px] font-black text-green-700 uppercase">
                      {gate.status}
                    </span>
                    <p className={`text-xs font-black uppercase mt-1.5 ${gate.color}`}>{gate.crowd}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-blue-50 border border-blue-100 text-blue-700 rounded-2xl flex gap-3 items-start text-xs font-semibold">
              <span>ℹ️</span>
              <p>
                <strong>Recommended entry gate:</strong> Gate A has the least congestion and wait time. Gate B is recommended for Section 100/200 stand pass holders.
              </p>
            </div>
          </div>
        )}

        {/* Tab 6: Facilities */}
        {activeTab === 'facilities' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-50 pb-2">Concourse Facilities</h3>
              <p className="text-xs text-slate-500 mt-1">Locate restrooms, food courts, and medical centers inside the concourse corridor.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Restroom West', type: 'restroom_w', desc: 'Concourse West, family-friendly, diaper changing stations', icon: '🚽' },
                { label: 'Restroom East', type: 'restroom_e', desc: 'Concourse East, fully accessible, tactile directions', icon: '🚽' },
                { label: 'Food Court', type: 'food_court', desc: 'Main dining arena, gluten-free options, quick soft drinks', icon: '🍔' },
                { label: 'First Aid Medical Center', type: 'medical_center', desc: 'Emergency response, oxygen setups, paramedic bays', icon: '🏥' },
                { label: 'Information Desk', type: 'info_desk', desc: 'Lost and found, stroller checks, headphones, general queries', icon: 'ℹ️' }
              ].map((fac) => (
                <div key={fac.type} className="p-4 border rounded-2xl bg-white shadow-sm flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xl">{fac.icon}</span>
                    <h4 className="font-extrabold text-slate-800 text-sm">{fac.label}</h4>
                    <p className="text-[10px] text-slate-400 font-semibold">{fac.desc}</p>
                  </div>
                  <button
                    onClick={() => handleFacilityNavigate(fac.type)}
                    className="px-3.5 py-2 bg-slate-905 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase shrink-0 transition"
                  >
                    Route
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 7: Accessibility */}
        {activeTab === 'accessibility' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-50 pb-2">Accessibility Services</h3>
              <p className="text-xs text-slate-500 mt-1">Review specialized support services and accessible routing details.</p>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-650 leading-relaxed">
              <div className="p-4 bg-slate-50 border rounded-xl space-y-2">
                <h4 className="font-extrabold text-slate-800">♿ Assisted entrances & wheelchair lifts:</h4>
                <p>Gates A, B, and C are equipped with ramp approaches and automated wide check-in turnstiles. Companion lift service is available in Section 100 and 400 corridors.</p>
              </div>

              <div className="p-4 bg-slate-50 border rounded-xl space-y-2">
                <h4 className="font-extrabold text-slate-800">🦻 Sensory & Audio assistance:</h4>
                <p>Equipped with assisted hearing loop systems in seating blocks. Sensory packs (noise-canceling headphones, fidgets) can be checked out at the main Information Desk.</p>
              </div>

              <button
                onClick={() => {
                  setAccessibleOnly(true);
                  setActiveTab('map');
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl uppercase tracking-wider text-xs shadow-sm transition"
              >
                Launch Accessible pathfinder Navigation
              </button>
            </div>
          </div>
        )}

        {/* Tab 8: Transport */}
        {activeTab === 'transport' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-50 pb-2">Transportation Options</h3>
              <p className="text-xs text-slate-500 mt-1">Directions, drop-off points, and shuttle operations around the arena.</p>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-600 leading-relaxed">
              <div className="p-4 border rounded-xl flex gap-3 items-start bg-slate-50">
                <span className="text-lg">🚇</span>
                <div>
                  <h4 className="font-bold text-slate-800">Metro Train station:</h4>
                  <p className="text-slate-500 mt-0.5">Line 1 Arena Metro Stop is a 5-min walk from Gate B. Trains run every 4 minutes on event days.</p>
                </div>
              </div>

              <div className="p-4 border rounded-xl flex gap-3 items-start bg-slate-50">
                <span className="text-lg">🚌</span>
                <div>
                  <h4 className="font-bold text-slate-800">Public Bus Lines:</h4>
                  <p className="text-slate-500 mt-0.5">Route 104, 212, and Shuttle express buses stop directly outside Parking Zone 1 exit.</p>
                </div>
              </div>

              <div className="p-4 border rounded-xl flex gap-3 items-start bg-slate-50">
                <span className="text-lg">🚗</span>
                <div>
                  <h4 className="font-bold text-slate-800">Taxi & Rideshare drop-off:</h4>
                  <p className="text-slate-500 mt-0.5">Dedicated app pickup stands are located at Gate D outer perimeter. Parking Zone 1 and 2 require parking stickers.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 9: Contextual AI Assistant */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-50 pb-2">Stadium Companion Assistant</h3>
              <p className="text-xs text-slate-500 mt-1">Ask questions about parking, recommended gates, seat stand numbers, or transport routes.</p>
            </div>

            <div className="border rounded-2xl overflow-hidden h-[420px] bg-slate-50 relative flex flex-col">
              <ChatWidget inlineMode={true} stadiumId={id} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
