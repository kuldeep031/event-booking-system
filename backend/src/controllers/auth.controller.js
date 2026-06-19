import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendAuthCookie, clearAuthCookie } from '../utils/token.js';

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    throw new ApiError(409, 'An account with that email already exists');
  }

  const user = new User({ name, email });
  await user.setPassword(password);
  await user.save();

  sendAuthCookie(res, user.id);
  res.status(201).json({ user });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // passwordHash has select:false, so explicitly request it for comparison.
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  sendAuthCookie(res, user.id);
  res.json({ user });
});

// POST /api/auth/logout
export const logout = asyncHandler(async (_req, res) => {
  clearAuthCookie(res);
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me
export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
