const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  roomId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Rooms',
      key: 'id'
    }
  },
  hotelId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Hotels',
      key: 'id'
    }
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: true,
      isAfter: new Date().toISOString().split('T')[0]
    }
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: true,
      isAfterStartDate(value) {
        if (this.startDate && value <= this.startDate) {
          throw new Error('End date must be after start date');
        }
      }
    }
  },
  status: {
    type: DataTypes.ENUM('confirmed', 'cancelled', 'completed'),
    defaultValue: 'confirmed'
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'Total price cannot be negative'
      }
    }
  },
  guests: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: 'Number of guests must be at least 1'
      }
    }
  },
  specialRequests: {
    type: DataTypes.STRING(500),
    validate: {
      len: {
        args: [0, 500],
        msg: 'Special requests cannot exceed 500 characters'
      }
    }
  },
  bookingReference: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: (booking) => {
      if (!booking.bookingReference) {
        booking.bookingReference = 'BK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
      }
    }
  },
  indexes: [
    {
      fields: ['userId', 'status']
    },
    {
      fields: ['roomId', 'startDate', 'endDate']
    },
    {
      fields: ['hotelId', 'status']
    }
  ]
});

module.exports = Booking;
