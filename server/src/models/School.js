'use strict';

module.exports = (sequelize, DataTypes) => {
  const School = sequelize.define('School', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
    },
    state: {
      type: DataTypes.STRING,
    },
    zipCode: {
      type: DataTypes.STRING,
    },
    phone: {
      type: DataTypes.STRING,
    },
    website: {
      type: DataTypes.STRING,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    subscription: {
      type: DataTypes.ENUM('free', 'starter', 'pro', 'enterprise'),
      defaultValue: 'free',
    },
    subscriptionStart: {
      type: DataTypes.DATE,
    },
    subscriptionEnd: {
      type: DataTypes.DATE,
    },
    maxStudents: {
      type: DataTypes.INTEGER,
      defaultValue: 100, // Free tier limit
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
  }, {
    timestamps: true,
  });

  // Associations
  School.associate = function(models) {
    School.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
    
    School.hasMany(models.GradeLevel, {
      foreignKey: 'schoolId',
      as: 'gradeLevels',
    });
    
    School.hasMany(models.Teacher, {
      foreignKey: 'schoolId',
      as: 'teachers',
    });
    
    School.hasMany(models.Student, {
      foreignKey: 'schoolId',
      as: 'students',
    });
    
    School.hasMany(models.ClassList, {
      foreignKey: 'schoolId',
      as: 'classLists',
    });
  };

  return School;
}; 