import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../api/client.js';
import EventCard from '../components/EventCard.jsx';
import Loader from '../components/Loader.jsx';
import { SearchIcon, SparklesIcon } from '../components/icons.jsx';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    api
      .get('/events', { params: { search: query, page, limit: 9, upcoming: true } })
      .then((res) => {
        if (!active) return;
        setEvents(res.data.events);
        setPagination(res.data.pagination);
      })
      .catch((err) => active && setError(getErrorMessage(err)))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [query, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setQuery(search.trim());
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative mb-10 overflow-hidden rounded-[2rem] bg-ink px-6 py-12 text-white sm:px-12 sm:py-16">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-white/5" />
        <div className="relative max-w-2xl">
          <span className="badge mb-5 bg-white/10 text-white">
            <SparklesIcon className="h-3.5 w-3.5" />
            Discover what's happening
          </span>
          <h1 className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl">
            Find events you'll love.
            <br />
            Book your seats in seconds.
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/70">
            Concerts, conferences, meetups and more — all in one place.
          </p>

          <form onSubmit={handleSearch} className="mt-7 flex max-w-lg gap-2">
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/40" />
              <input
                className="input rounded-pill pl-11"
                placeholder="Search by name or venue"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search events"
              />
            </div>
            <button type="submit" className="btn bg-white px-6 font-semibold text-ink hover:bg-white/90">
              Search
            </button>
          </form>
        </div>
      </section>

      <div className="mb-5 flex items-end justify-between">
        <h2 className="font-display text-xl font-bold text-ink">
          {query ? `Results for "${query}"` : 'Upcoming events'}
        </h2>
        {!loading && (
          <span className="text-sm text-muted">
            {pagination.total} event{pagination.total === 1 ? '' : 's'}
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      {loading ? (
        <Loader label="Loading events..." />
      ) : events.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 p-14 text-center">
          <SearchIcon className="h-8 w-8 text-ink/20" />
          <p className="font-semibold text-ink">No events found</p>
          <p className="text-sm text-muted">Try a different search term.</p>
        </div>
      ) : (
        <>
          <div className="grid animate-fade-up gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              <button className="btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </button>
              <span className="text-sm text-muted">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                className="btn-secondary"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
