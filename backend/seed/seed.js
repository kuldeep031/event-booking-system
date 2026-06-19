import 'dotenv/config';
import mongoose from 'mongoose';

import { connectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Event } from '../src/models/Event.js';
import { Booking } from '../src/models/Booking.js';

const daysFromNow = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

const sampleEvents = [
  {
    name: 'React Summit 2026',
    description:
      'A full-day conference covering the latest in the React ecosystem — Server Components, Suspense, and performance patterns. Talks from core contributors.',
    dateTime: daysFromNow(14),
    venue: 'Bangalore International Exhibition Centre',
    totalSeats: 300,
    price: 1499,
  },
  {
    name: 'Indie Music Night',
    description: 'An intimate evening of live indie and acoustic performances from emerging artists.',
    dateTime: daysFromNow(7),
    venue: 'The Piano Man, New Delhi',
    totalSeats: 120,
    price: 799,
  },
  {
    name: 'Startup Founders Meetup',
    description: 'Network with founders, angel investors, and operators. Lightning pitches and open mic Q&A.',
    dateTime: daysFromNow(21),
    venue: 'WeWork, Mumbai',
    totalSeats: 80,
    price: 0,
  },
  {
    name: 'AI & The Future of Work',
    description: 'Panel discussion on how AI is reshaping software engineering and product teams.',
    dateTime: daysFromNow(30),
    venue: 'T-Hub, Hyderabad',
    totalSeats: 200,
    price: 499,
  },
  {
    name: 'Weekend Food Carnival',
    description: 'Street food, live cooking stations, and regional cuisines from across India.',
    dateTime: daysFromNow(3),
    venue: 'Jawaharlal Nehru Stadium, Chennai',
    totalSeats: 500,
    price: 299,
  },
];

const run = async () => {
  await connectDB(process.env.MONGO_URI);

  await Promise.all([User.deleteMany({}), Event.deleteMany({}), Booking.deleteMany({})]);
  console.log('Cleared existing data.');

  const admin = new User({ name: 'Admin', email: 'admin@example.com', role: 'admin' });
  await admin.setPassword('admin123');

  const demo = new User({ name: 'Demo User', email: 'demo@example.com' });
  await demo.setPassword('demo123');

  await User.create([admin, demo]);
  console.log('Created users: admin@example.com / admin123  and  demo@example.com / demo123');

  await Event.create(
    sampleEvents.map((e) => ({ ...e, availableSeats: e.totalSeats, createdBy: admin.id }))
  );
  console.log(`Inserted ${sampleEvents.length} events.`);

  await mongoose.disconnect();
  console.log('Seed complete.');
  process.exit(0);
};

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
