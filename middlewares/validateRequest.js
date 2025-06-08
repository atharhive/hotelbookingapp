// Basic validation middleware without external dependencies
const validateEmail = (email) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validatePhoneNumber = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone);
};

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push('Name is required');
  } else if (name.length > 50) {
    errors.push('Name cannot exceed 50 characters');
  }

  if (!email) {
    errors.push('Email is required');
  } else if (!validateEmail(email)) {
    errors.push('Please enter a valid email');
  }

  if (!password) {
    errors.push('Password is required');
  } else if (!validatePassword(password)) {
    errors.push('Password must be at least 6 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) {
    errors.push('Email is required');
  } else if (!validateEmail(email)) {
    errors.push('Please enter a valid email');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

const validateHotel = (req, res, next) => {
  const { name, description, location, starRating, address, phone, email } = req.body;
  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push('Hotel name is required');
  } else if (name.length > 100) {
    errors.push('Hotel name cannot exceed 100 characters');
  }

  if (!description || description.trim().length === 0) {
    errors.push('Hotel description is required');
  } else if (description.length > 1000) {
    errors.push('Description cannot exceed 1000 characters');
  }

  if (!location || location.trim().length === 0) {
    errors.push('Hotel location is required');
  } else if (location.length > 100) {
    errors.push('Location cannot exceed 100 characters');
  }

  if (!starRating) {
    errors.push('Star rating is required');
  } else if (starRating < 1 || starRating > 5) {
    errors.push('Star rating must be between 1 and 5');
  }

  if (!address || address.trim().length === 0) {
    errors.push('Hotel address is required');
  } else if (address.length > 200) {
    errors.push('Address cannot exceed 200 characters');
  }

  if (!phone) {
    errors.push('Phone number is required');
  } else if (!validatePhoneNumber(phone)) {
    errors.push('Please enter a valid phone number');
  }

  if (!email) {
    errors.push('Hotel email is required');
  } else if (!validateEmail(email)) {
    errors.push('Please enter a valid email');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

const validateRoom = (req, res, next) => {
  const { hotelId, roomType, roomNumber, pricePerNight, maxGuests, bedType } = req.body;
  const errors = [];
  const validRoomTypes = ['single', 'double', 'deluxe', 'suite', 'family'];
  const validBedTypes = ['single', 'double', 'queen', 'king'];

  if (!hotelId) {
    errors.push('Hotel ID is required');
  }

  if (!roomType) {
    errors.push('Room type is required');
  } else if (!validRoomTypes.includes(roomType)) {
    errors.push('Invalid room type');
  }

  if (!roomNumber || roomNumber.trim().length === 0) {
    errors.push('Room number is required');
  }

  if (!pricePerNight) {
    errors.push('Price per night is required');
  } else if (pricePerNight < 0) {
    errors.push('Price cannot be negative');
  }

  if (!maxGuests) {
    errors.push('Maximum guests is required');
  } else if (maxGuests < 1 || maxGuests > 10) {
    errors.push('Maximum guests must be between 1 and 10');
  }

  if (!bedType) {
    errors.push('Bed type is required');
  } else if (!validBedTypes.includes(bedType)) {
    errors.push('Invalid bed type');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

const validateBooking = (req, res, next) => {
  const { roomId, startDate, endDate, guests } = req.body;
  const errors = [];

  if (!roomId) {
    errors.push('Room ID is required');
  }

  if (!startDate) {
    errors.push('Start date is required');
  } else {
    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      errors.push('Invalid start date format');
    } else if (start < new Date()) {
      errors.push('Start date cannot be in the past');
    }
  }

  if (!endDate) {
    errors.push('End date is required');
  } else {
    const end = new Date(endDate);
    if (isNaN(end.getTime())) {
      errors.push('Invalid end date format');
    } else if (startDate && end <= new Date(startDate)) {
      errors.push('End date must be after start date');
    }
  }

  if (!guests) {
    errors.push('Number of guests is required');
  } else if (guests < 1) {
    errors.push('Number of guests must be at least 1');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateHotel,
  validateRoom,
  validateBooking
};
