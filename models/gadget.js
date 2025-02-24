'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Gadget extends Model {
    static associate(models) {
      // Define associations here (if any in the future)
    }
  }
  Gadget.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    status: {
      type: DataTypes.ENUM('Available', 'Deployed', 'Destroyed', 'Decommissioned'),
      allowNull: false,
      defaultValue: 'Available'
    },
    decommissionedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Gadget',
    hooks: {
      beforeUpdate: (gadget) => {
        if (gadget.status === 'Decommissioned' && !gadget.decommissionedAt) {
          gadget.decommissionedAt = new Date();
        } else if (gadget.status !== 'Decommissioned') {
          gadget.decommissionedAt = null;
        }
      }
    }
  });
  return Gadget;
};