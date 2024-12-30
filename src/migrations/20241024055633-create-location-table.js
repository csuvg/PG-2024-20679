'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('location', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'user'
          },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      name: {
        type: Sequelize.STRING
      },
      area_id: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'area'
          },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      has_waste_collection: {
        type: Sequelize.ENUM('Yes', 'No', 'Not sure'),
        allowNull: false,
        defaultValue: 'Not sure'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_location_has_waste_collection";');
    await queryInterface.dropTable('location');
  }
};
