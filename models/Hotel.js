const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Hotel = sequelize.define('Hotel', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Hotel name is required'
      },
      len: {
        args: [1, 100],
        msg: 'Hotel name cannot exceed 100 characters'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Hotel description is required'
      },
      len: {
        args: [1, 1000],
        msg: 'Description cannot exceed 1000 characters'
      }
    }
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Hotel location is required'
      },
      len: {
        args: [1, 100],
        msg: 'Location cannot exceed 100 characters'
      }
    }
  },
  starRating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: 'Star rating must be at least 1'
      },
      max: {
        args: [5],
        msg: 'Star rating cannot exceed 5'
      }
    }
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  amenities: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  address: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Hotel address is required'
      },
      len: {
        args: [1, 200],
        msg: 'Address cannot exceed 200 characters'
      }
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      is: {
        args: /^\+?[\d\s\-\(\)]+$/,
        msg: 'Please enter a valid phone number'
      }
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: {
        msg: 'Please enter a valid email'
      }
    },
    set(value) {
      this.setDataValue('email', value.toLowerCase());
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['location', 'starRating']
    },
    {
      fields: ['name']
    },
    {
      fields: ['location']
    }
  ]
});

module.exports = Hotel;
