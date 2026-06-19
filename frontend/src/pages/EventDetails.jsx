import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, getErrorMessage } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDateTime, formatPrice } from '../lib/format.js';
import Loader from '../components/Loader.jsx';
import {
  ArrowLeftIcon,
  CalendarIcon,
  MapPinIcon,
  TagIcon,
  UsersIcon,
  CheckIcon,
} from '../components/icons.jsx';

export default function EventDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [seats, setSeats] = useState(1);
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [success, setSuccess] = useState('');

  const loadEvent = () => {
    setLoading(true);
    api
      .get(`/events/${id}`)
      .then((res) => setEvent(res.data.event))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(loadEvent, [id]);

  const handleBook = async (e) => {
    e.preventDefault();
    setBookingError('');
    setSuccess('');

    if (!user) {
      navigate('/login', { state: { from: { pathname: `/events/${id}` } } });
      return;
    }

    setBooking(true);
    try {
      const res = await api.post('/bookings', { eventId: id, seats: Number(seats) });
      setSuccess(`Booked ${res.data.booking.seats} seat(s)! Find it under My Bookings.`);
      setEvent((prev) => ({ ...prev, availableSeats: prev.availableSeats - Number(seats) }));
      setSeats(1);
    } catch (err) {
      setBookingError(getErrorMessage(err));
      loadEvent();
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <Loader label="Loading event..." />;
  if (error) {
    return (
      <div className="card flex flex-col items-center gap-4 p-14 text-center">
        <p className="text-muted">{error}</p>
        <Link to="/" className="btn-primary">Back to events</Link>
      </div>
    );
  }

  const soldOut = event.availableSeats === 0;
  const maxBookable = Math.min(event.availableSeats, 10);
  const total = Number(seats) * event.price;

  return (
    <div className="animate-fade-up">
      <Link
        to="/"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to events
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Details */}
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="relative flex h-44 items-end bg-ink p-6 sm:h-52">
              <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/5" />
              <h1 className="relative font-display text-2xl font-extrabold text-white sm:text-3xl">
                {event.name}
              </h1>
            </div>

            <div className="p-6 sm:p-8">
              <dl className="grid gap-5 sm:grid-cols-2">
                <Detail icon={CalendarIcon} label="Date & time" value={formatDateTime(event.dateTime)} />
                <Detail icon={MapPinIcon} label="Venue" value={event.venue} />
                <Detail icon={TagIcon} label="Price" value={formatPrice(event.price)} />
                <Detail
                  icon={UsersIcon}
                  label="Availability"
                  value={soldOut ? 'Sold out' : `${event.availableSeats} of ${event.totalSeats} seats`}
                  valueClass={soldOut ? 'text-rose-600' : 'text-emerald-600'}
                />
              </dl>

              <hr className="my-7 border-ink/10" />

              <h2 className="mb-2 font-display text-lg font-bold text-ink">About this event</h2>
              <p className="whitespace-pre-line leading-relaxed text-muted">{event.description}</p>
            </div>
          </div>
        </div>

        {/* Booking panel (attendees only) */}
        {user?.role !== 'admin' && (
          <div className="lg:col-span-1">
            <div className="card sticky top-24 p-6">
              <div className="mb-4 flex items-baseline justify-between">
                <h2 className="font-display text-lg font-bold text-ink">Book seats</h2>
                <span className="font-display text-xl font-extrabold text-ink">
                  {formatPrice(event.price)}
                </span>
              </div>

              {success && (
                <div className="mb-4 flex items-start gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{success}</span>
                </div>
              )}
              {bookingError && (
                <div className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {bookingError}
                </div>
              )}

              {soldOut ? (
                <div className="rounded-2xl bg-mist px-4 py-3 text-sm text-muted">
                  This event is fully booked.
                </div>
              ) : (
                <form onSubmit={handleBook} className="space-y-4">
                  <div>
                    <label className="label" htmlFor="seats">Number of seats</label>
                    <input
                      id="seats"
                      type="number"
                      min={1}
                      max={maxBookable}
                      className="input"
                      value={seats}
                      onChange={(e) => setSeats(e.target.value)}
                      required
                    />
                    <p className="mt-1.5 text-xs text-muted">Up to {maxBookable} per booking.</p>
                  </div>

                  {event.price > 0 && Number(seats) > 0 && (
                    <div className="flex items-center justify-between rounded-2xl bg-mist px-4 py-3 text-sm">
                      <span className="text-muted">Total</span>
                      <span className="font-bold text-ink">{formatPrice(total)}</span>
                    </div>
                  )}

                  <button type="submit" className="btn-primary w-full" disabled={booking}>
                    {booking ? 'Booking...' : user ? 'Confirm booking' : 'Login to book'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Detail({ icon: Icon, label, value, valueClass }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-mist text-ink">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
        <dd className={`mt-0.5 font-semibold ${valueClass || 'text-ink'}`}>{value}</dd>
      </div>
    </div>
  );
}
