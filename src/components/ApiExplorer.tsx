import React, { useState } from 'react';
import { Terminal, Send, Play, CheckCircle, AlertTriangle, RefreshCw, Code2, Database } from 'lucide-react';
import { apiService, ApiResponse } from '../services/apiService';
import { User, Movie, Showtime } from '../types';

interface ApiExplorerProps {
  currentUser: User | null;
  movies: Movie[];
  showtimes: Showtime[];
  onRefreshData: () => Promise<void>;
}

interface EndpointDef {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  category: 'Auth' | 'Movies' | 'Showtimes' | 'Reservations' | 'Admin';
  description: string;
  requiresAdmin?: boolean;
  samplePayload?: any;
}

export const ApiExplorer: React.FC<ApiExplorerProps> = ({
  currentUser,
  movies,
  showtimes,
  onRefreshData,
}) => {
  const sampleMovie = movies[0];
  const sampleShowtime = showtimes[0];

  const endpoints: EndpointDef[] = [
    {
      id: 'get_movies',
      name: 'List Movies',
      method: 'GET',
      path: '/api/movies?genre=Sci-Fi',
      category: 'Movies',
      description: 'Fetch active movie catalog with optional genre and keyword search filters.',
    },
    {
      id: 'get_showtimes',
      name: 'List Showtimes by Date',
      method: 'GET',
      path: `/api/showtimes?date=2026-10-28`,
      category: 'Showtimes',
      description: 'Get schedule for a specific date with screen formats (IMAX, Dolby Cinema).',
    },
    {
      id: 'get_seats',
      name: 'Seat Availability & Map',
      method: 'GET',
      path: `/api/showtimes/${sampleShowtime?.id || 'sht_1'}/seats`,
      category: 'Showtimes',
      description: 'Retrieve real-time seat matrix for a screen and IDs of already booked seats.',
    },
    {
      id: 'post_reservation_atomic',
      name: 'Reserve Seats (Atomic Overbooking Check)',
      method: 'POST',
      path: '/api/reservations',
      category: 'Reservations',
      description: 'Atomically verifies seat availability before booking. Returns HTTP 409 Conflict if any seat is taken.',
      samplePayload: {
        showtimeId: sampleShowtime?.id || 'sht_1',
        seatIds: ['E6', 'E7'],
        concessions: [{ itemId: 'cnc_popcorn_truffle', quantity: 1 }],
      },
    },
    {
      id: 'get_my_reservations',
      name: 'Get User Reservations',
      method: 'GET',
      path: '/api/reservations/my',
      category: 'Reservations',
      description: 'Fetch authenticated user’s active and previous bookings.',
    },
    {
      id: 'post_showtime_conflict',
      name: 'Schedule Showtime (Conflict Detection)',
      method: 'POST',
      path: '/api/showtimes',
      category: 'Admin',
      requiresAdmin: true,
      description: 'Schedules a screening in an auditorium. Rejects conflicting screenings within 2 hours.',
      samplePayload: {
        movieId: sampleMovie?.id || 'mov_interstellar_odyssey',
        screenId: 'scr_imax_1',
        date: '2026-10-28',
        time: '18:00', // Close to 17:45 to test conflict!
        format: 'IMAX 3D',
        basePrice: 20.0,
      },
    },
    {
      id: 'get_admin_reports',
      name: 'Executive Business Reports',
      method: 'GET',
      path: '/api/admin/reports',
      category: 'Admin',
      requiresAdmin: true,
      description: 'Calculates gross ticket revenue, overall occupancy percentage, and movie breakdowns.',
    },
    {
      id: 'post_movie_review',
      name: 'Submit Rating & Review (Verified Gate)',
      method: 'POST',
      path: '/api/reviews',
      category: 'Reservations',
      description: 'Allows verified guests with a reservation in their history to rate 1-5 stars and write a review. Blocks unverified non-ticket holders with HTTP 403.',
      samplePayload: {
        movieId: sampleMovie?.id || 'mov_interstellar_odyssey',
        rating: 5,
        comment: 'Astounding IMAX visual and sound experience. Marcus Cole gave an unforgettable performance!',
      },
    },
    {
      id: 'get_movie_reviews',
      name: 'Get Verified Movie Reviews',
      method: 'GET',
      path: `/api/reviews?movieId=${sampleMovie?.id || 'mov_interstellar_odyssey'}`,
      category: 'Movies',
      description: 'Fetches verified audience ratings and reviews for a specific title.',
    },
    {
      id: 'post_login_demo',
      name: 'User Sign In',
      method: 'POST',
      path: '/api/auth/login',
      category: 'Auth',
      description: 'Authenticates user credentials and creates session token.',
      samplePayload: {
        email: 'alex@cineverse.com',
        password: 'user123',
      },
    },
  ];

  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDef>(endpoints[3]); // default to Atomic reservation
  const [customPayload, setCustomPayload] = useState<string>(
    JSON.stringify(endpoints[3].samplePayload, null, 2)
  );
  const [response, setResponse] = useState<ApiResponse<any> | null>(null);
  const [running, setRunning] = useState(false);

  const handleSelectEndpoint = (ep: EndpointDef) => {
    setSelectedEndpoint(ep);
    setResponse(null);
    if (ep.samplePayload) {
      setCustomPayload(JSON.stringify(ep.samplePayload, null, 2));
    } else {
      setCustomPayload('');
    }
  };

  const handleExecuteRequest = async () => {
    setRunning(true);
    let res: ApiResponse<any>;

    try {
      if (selectedEndpoint.id === 'get_movies') {
        res = await apiService.getMovies('Sci-Fi');
      } else if (selectedEndpoint.id === 'get_showtimes') {
        res = await apiService.getShowtimes('2026-10-28');
      } else if (selectedEndpoint.id === 'get_seats') {
        res = await apiService.getSeatAvailability(sampleShowtime?.id || 'sht_1');
      } else if (selectedEndpoint.id === 'post_reservation_atomic') {
        let payload = selectedEndpoint.samplePayload;
        try {
          if (customPayload.trim()) payload = JSON.parse(customPayload);
        } catch (e) {
          // ignore invalid json
        }
        res = await apiService.createReservation(payload);
        await onRefreshData();
      } else if (selectedEndpoint.id === 'get_my_reservations') {
        res = await apiService.getUserReservations();
      } else if (selectedEndpoint.id === 'post_showtime_conflict') {
        let payload = selectedEndpoint.samplePayload;
        try {
          if (customPayload.trim()) payload = JSON.parse(customPayload);
        } catch (e) {}
        res = await apiService.createShowtime(payload);
        await onRefreshData();
      } else if (selectedEndpoint.id === 'get_admin_reports') {
        res = await apiService.getAdminReports();
      } else if (selectedEndpoint.id === 'post_movie_review') {
        let payload = selectedEndpoint.samplePayload;
        try {
          if (customPayload.trim()) payload = JSON.parse(customPayload);
        } catch (e) {}
        res = await apiService.createOrUpdateReview(payload);
        await onRefreshData();
      } else if (selectedEndpoint.id === 'get_movie_reviews') {
        res = await apiService.getReviews(sampleMovie?.id || 'mov_interstellar_odyssey');
      } else if (selectedEndpoint.id === 'post_login_demo') {
        let payload = { email: 'alex@cineverse.com', password: 'user123' };
        try {
          if (customPayload.trim()) payload = JSON.parse(customPayload);
        } catch (e) {}
        res = await apiService.login(payload.email, payload.password);
        await onRefreshData();
      } else {
        res = {
          status: 200,
          endpoint: selectedEndpoint.path,
          method: selectedEndpoint.method,
          data: { status: 'Endpoint executed' },
          timestamp: new Date().toISOString(),
          durationMs: 14,
        };
      }
    } catch (err: any) {
      res = {
        status: 500,
        endpoint: selectedEndpoint.path,
        method: selectedEndpoint.method,
        error: err?.message || 'Server Internal Error',
        timestamp: new Date().toISOString(),
        durationMs: 18,
      };
    }

    setResponse(res);
    setRunning(false);
  };

  const getMethodColor = (m: string) => {
    switch (m) {
      case 'GET': return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
      case 'POST': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'PUT': return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'DELETE': return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'PATCH': return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      default: return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
              Developer Backend Console
            </span>
            <span className="text-xs text-slate-400">
              Active User: <strong className="text-white">{currentUser?.name || 'Guest'}</strong> ({currentUser?.role || 'None'})
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-white mt-1">
            REST API & Complex Logic Inspector
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Test backend endpoints in real-time, inspect HTTP status codes, check seat collision prevention, and observe JSON payloads.
          </p>
        </div>

        <button
          onClick={async () => {
            if (window.confirm('Reset database to clean seed state?')) {
              apiService.resetToDefault();
              await onRefreshData();
              setResponse(null);
            }
          }}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors flex items-center gap-1.5 self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Demo Database</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
        {/* Endpoint Selector Menu (Left 4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-400" />
            <span>Available REST Endpoints</span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {endpoints.map(ep => {
              const isSelected = ep.id === selectedEndpoint.id;
              return (
                <button
                  key={ep.id}
                  onClick={() => handleSelectEndpoint(ep)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-amber-400 shadow-lg shadow-amber-400/5'
                      : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${getMethodColor(ep.method)}`}>
                      {ep.method}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-500">
                      {ep.category}
                    </span>
                  </div>
                  <div className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                    {ep.name}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 truncate mt-1">
                    {ep.path}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Execution & Response Window (Right 8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Active Endpoint Info Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className={`text-xs font-mono font-bold px-2 py-1 rounded border ${getMethodColor(selectedEndpoint.method)}`}>
                  {selectedEndpoint.method}
                </span>
                <span className="text-xs font-mono font-bold text-white">
                  {selectedEndpoint.path}
                </span>
              </div>

              <button
                onClick={handleExecuteRequest}
                disabled={running}
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md shadow-amber-400/20 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 shrink-0"
              >
                {running ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Executing...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Send Request</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              {selectedEndpoint.description}
            </p>

            {selectedEndpoint.requiresAdmin && currentUser?.role !== 'admin' && (
              <div className="mt-3 p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-300 text-[11px] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Notice: Current role is 'user'. Executing this will demonstrate the 403 Forbidden RBAC response! Switch role in navbar to test 200/201 success.</span>
              </div>
            )}

            {/* Request Payload Editor */}
            {selectedEndpoint.samplePayload && (
              <div className="mt-4 pt-3 border-t border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Request Body (JSON Payload):</span>
                  <span className="text-slate-500 text-[10px] normal-case">Editable</span>
                </div>
                <textarea
                  rows={4}
                  value={customPayload}
                  onChange={(e) => setCustomPayload(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 focus:outline-none focus:border-amber-400"
                />
              </div>
            )}
          </div>

          {/* Response Box */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-amber-400" />
                <span>Response Console</span>
              </span>

              {response && (
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                    response.status < 300
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : response.status === 409
                      ? 'bg-purple-950 text-purple-300 border-purple-800'
                      : 'bg-rose-950 text-rose-400 border-rose-800'
                  }`}>
                    HTTP {response.status}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {response.durationMs}ms
                  </span>
                </div>
              )}
            </div>

            <div className="mt-3">
              {response ? (
                <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 text-xs font-mono text-slate-200 overflow-x-auto max-h-[380px] leading-relaxed">
                  {JSON.stringify(response, null, 2)}
                </pre>
              ) : (
                <div className="py-14 text-center text-slate-500 text-xs">
                  <Terminal className="w-8 h-8 text-slate-700 mx-auto mb-2 opacity-60" />
                  <span>Click "Send Request" to trigger this backend endpoint.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
