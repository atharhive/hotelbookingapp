const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Room = sequelize.define('Room', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  hotelId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Hotels',
      key: 'id'
    }
  },
  roomType: {
    type: DataTypes.ENUM('single', 'double', 'deluxe', 'suite', 'family'),
    allowNull: false
  },
  roomNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Room number is required'
      }
    }
  },
  pricePerNight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'Price cannot be negative'
      }
    }
  },
  amenities: {
    type: DataTypes.ARRAY(DataTypes.ENUM('WiFi', 'AC', 'TV', 'Minibar', 'Balcony', 'Room Service', 'Bathtub', 'Safe', 'Coffee Maker', 'Gym Access')),
    defaultValue: []
  },
  maxGuests: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: 'Maximum guests must be at least 1'
      },
      max: {
        args: [10],
        msg: 'Maximum guests cannot exceed 10'
      }
    }
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  description: {
    type: DataTypes.STRING(500),
    validate: {
      len: {
        args: [0, 500],
        msg: 'Description cannot exceed 500 characters'
      }
    }
  },
  bedType: {
    type: DataTypes.ENUM('single', 'double', 'queen', 'king'),
    allowNull: false
  },
  size: {
    type: DataTypes.INTEGER,
    validate: {
      min: {
        args: [10],
        msg: 'Room size must be at least 10 square meters'
      }
    }
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['hotelId', 'roomNumber']
    },
    {
      fields: ['hotelId', 'roomType', 'pricePerNight']
    },
    {
      fields: ['amenities']
    }
  ]
});

module.exports = Room;
