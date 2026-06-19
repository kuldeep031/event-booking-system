import jwt from 'jsonwebtoken';

const COOKIE_NAME = 'token';

export const signToken = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

export const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

// Sets the JWT as an httpOnly cookie (not readable by JS -> safe from XSS theft).
export const sendAuthCookie = (res, userId) => {
  const token = signToken(userId);
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: process.env.COOKIE_SECURE === 'true' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  return token;
};

export const clearAuthCookie = (res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: process.env.COOKIE_SECURE === 'true' ? 'none' : 'lax',
  });
};

export { COOKIE_NAME };
