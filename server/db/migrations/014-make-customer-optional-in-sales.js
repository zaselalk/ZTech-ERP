"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Make CustomerId nullable
        await queryInterface.changeColumn("Sales", "CustomerId", {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: "Customers",
                key: "id",
            },
        });

        // Add Credit to payment_method enum
        // For MySQL, we need to modify the enum
        await queryInterface.changeColumn("Sales", "payment_method", {
            type: Sequelize.ENUM(
                "Cash",
                "Card",
                "Consignment",
                "Paid",
                "Cash On Delivery",
                "Credit"
            ),
            allowNull: false,
        });
    },

    async down(queryInterface, Sequelize) {
        // Revert CustomerId to not nullable
        await queryInterface.changeColumn("Sales", "CustomerId", {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: "Customers",
                key: "id",
            },
        });

        // Revert payment_method enum
        await queryInterface.changeColumn("Sales", "payment_method", {
            type: Sequelize.ENUM(
                "Cash",
                "Card",
                "Consignment",
                "Paid",
                "Cash On Delivery"
            ),
            allowNull: false,
        });
    },
};
