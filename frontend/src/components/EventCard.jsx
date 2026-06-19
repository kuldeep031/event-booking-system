import { Link } from 'react-router-dom';
import { formatDateTime, formatPrice } from '../lib/format.js';
import { CalendarIcon, MapPinIcon, UsersIcon } from './icons.jsx';

export default function EventCard({ event }) {
  const soldOut = event.availableSeats === 0;
  const pctLeft = event.totalSeats ? (event.availableSeats / event.totalSeats) * 100 : 0;
  const lowStock = !soldOut && pctLeft <= 15;

  return (
    <Link
      to={`/events/${event._id}`}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
    >
      {/* Soft raised cover with a ghosted initial */}
      <div className="relative flex h-32 items-center justify-center bg-mist">
        <span className="font-display text-6xl font-extrabold text-ink/10">{event.name?.[0] || 'E'}</span>
        <span className="absolute right-3 top-3 badge bg-ink text-white">{formatPrice(event.price)}</span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-base font-bold text-ink">{event.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-muted">{event.description}</p>

        <dl className="mt-4 space-y-2 text-sm text-muted">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 shrink-0 text-ink/40" />
            <dd>{formatDateTime(event.dateTime)}</dd>
          </div>
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4 shrink-0 text-ink/40" />
            <dd className="truncate">{event.venue}</dd>
          </div>
        </dl>

        <div className="mt-4 flex items-center justify-between border-t border-ink/5 pt-3">
          <span className="flex items-center gap-1.5 text-sm text-muted">
            <UsersIcon className="h-4 w-4 text-ink/40" />
            {event.availableSeats}/{event.totalSeats}
          </span>
          {soldOut ? (
            <span className="badge bg-rose-50 text-rose-600">Sold out</span>
          ) : lowStock ? (
            <span className="badge bg-amber-50 text-amber-700">Few left</span>
          ) : (
            <span className="badge bg-emerald-50 text-emerald-700">Available</span>
          )}
        </div>
      </div>
    </Link>
  );
}
