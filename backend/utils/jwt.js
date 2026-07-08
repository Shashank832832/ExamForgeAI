import jwt from 'jsonwebtoken';

export const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'examforge_secret_jwt_key_2026',
    { expiresIn: '30d' }
  );
};
