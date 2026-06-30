import { User } from '../models/User.js';
import { sendAuthCookie, clearAuthCookie } from '../utils/token.js';

// POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: 'An account with that email already exists' });
    }

    const user = new User({ name, email });
    await user.setPassword(password);
    await user.save();

    sendAuthCookie(res, user.id);
    res.status(201).json({ user });
  } catch (err) {
    next(err); // unexpected errors → central error handler
  }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // passwordHash has select:false, so request it explicitly for comparison.
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    sendAuthCookie(res, user.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
export const logout = (_req, res) => {
  clearAuthCookie(res);
  res.json({ message: 'Logged out successfully' });
};

// GET /api/auth/me
export const me = (req, res) => {
  res.json({ user: req.user });
};
