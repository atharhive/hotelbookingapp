# 🏨 StayEase - Hotel Booking Platform

🔗 **Live Site:** [https://hotelbookingapp-one.vercel.app](https://hotelbookingapp-one.vercel.app)

<div align="center">
  <!-- Replace the src URL below with your favorite hotel-themed or UI demo GIF -->
  <img src="https://i.pinimg.com/originals/ed/23/9d/ed239ddc0e23afd424de14db792c6bf8.gif" alt="StayEase Demo" width="800"/>
</div>

## 📝 Overview

StayEase is a modern, user-friendly hotel booking platform that allows users to search, book, and manage their hotel reservations seamlessly. Built with a focus on user experience and performance, it provides a comprehensive solution for both travelers and hotel administrators.

## ⚠️ Current Status

> **Note:** The application is currently in development. The Supabase database is empty, so hotel listings are not available yet. This is a work in progress, and hotel data will be populated soon.

## 🏗️ Codebase Structure

### Frontend (`/public`)
- `index.html` - Main landing page
- `hotels.html` - Hotel listing and search page
- `hotel-details.html` - Individual hotel details and booking page
- `my-bookings.html` - User's booking management page
- `contacts.html` - Contact information page
- `styles.css` - Global styles and custom CSS

### Backend Structure

#### Server (`server.js`)
- Express.js server setup
- Middleware configuration (CORS, rate limiting, etc.)
- Static file serving
- API route mounting
- Error handling

#### Routes (`/routes`)
- `auth.js` - User authentication routes
- `hotels.js` - Hotel-related operations
- `rooms.js` - Room management
- `bookings.js` - Booking operations

#### Controllers (`/controllers`)
- Handle business logic for each route
- Database operations
- API integrations
- Data validation

#### Database (`/config/db.js`)
- Supabase connection setup
- Database client configuration
- Connection management

#### Utilities (`/utils`)
- Helper functions
- Common utilities
- Data formatting

#### Middlewares (`/middlewares`)
- Authentication middleware
- Error handling
- Request validation
- Rate limiting

## 🔄 Data Flow

1. **User Authentication**
   - Registration and login handled through `/api/auth` routes
   - JWT tokens for session management
   - Secure password hashing with bcrypt

2. **Hotel Management**
   - Hotel data stored in Supabase
   - Integration with Booking.com API for additional data
   - Search and filtering capabilities

3. **Booking Process**
   - Room availability checking
   - Booking creation and management
   - Booking history tracking

## 🔧 Key Components

### Authentication System
```javascript
// JWT-based authentication
const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
```

### Database Schema
```sql
-- Users table
users (
  id uuid primary key,
  email text unique,
  password_hash text,
  created_at timestamp
)

-- Hotels table
hotels (
  id uuid primary key,
  name text,
  location text,
  description text,
  amenities jsonb
)

-- Bookings table
bookings (
  id uuid primary key,
  user_id uuid references users(id),
  hotel_id uuid references hotels(id),
  check_in date,
  check_out date,
  status text
)
```

### API Integration
```javascript
// Booking.com API integration
const bookingApi = axios.create({
    baseURL: 'https://booking-com15.p.rapidapi.com/api/v1',
    headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com'
    }
});
```

## 🛠️ Development Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```env
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
RAPIDAPI_KEY=your_rapidapi_key
JWT_SECRET=your_jwt_secret
```

3. Start development server:
```bash
npm run dev
```

## 📈 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Hotels
- `GET /api/hotels` - List all hotels
- `GET /api/hotels/:id` - Get hotel details
- `GET /api/hotels/search` - Search hotels

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - List user bookings
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 👥 Authors

- Athar - Initial work

## 🙏 Acknowledgments

- Booking.com API for hotel data
- Supabase for database services
- All contributors who have helped shape this project

---

<div align="center">
  Made with ❤️ by Athar
</div>
