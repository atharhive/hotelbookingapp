const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'hotel_booking_secret_key',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d'
    }
  );
};

module.exports = generateToken;
