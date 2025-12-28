'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // 1. Migrate Bookshops to Customers
            // Check if Bookshops table exists
            const [tables] = await queryInterface.sequelize.query("SHOW TABLES LIKE 'Bookshops';");

            if (tables.length > 0) {
                const [bookshops] = await queryInterface.sequelize.query("SELECT * FROM Bookshops", { transaction });

                if (bookshops.length > 0) {
                    const customers = bookshops.map(bs => ({
                        id: bs.id,
                        name: bs.name,
                        credit_balance: bs.consignment || 0,
                        address: bs.location,
                        phone: bs.contact,
                        createdAt: bs.createdAt,
                        updatedAt: bs.updatedAt
                    }));

                    // Insert into Customers
                    await queryInterface.bulkInsert('Customers', customers, { transaction });
                }

                // 2. Add CustomerId to Sales
                await queryInterface.addColumn('Sales', 'CustomerId', {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    references: {
                        model: 'Customers',
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE'
                }, { transaction });

                // 3. Update Sales.CustomerId based on Sales.BookshopId
                await queryInterface.sequelize.query(`
          UPDATE Sales 
          SET CustomerId = BookshopId 
          WHERE BookshopId IS NOT NULL
        `, { transaction });

                // 4. Remove BookshopId from Sales
                // Check if BookshopId exists in Sales
                const [columns] = await queryInterface.sequelize.query("SHOW COLUMNS FROM Sales LIKE 'BookshopId';", { transaction });
                if (columns.length > 0) {
                    await queryInterface.removeColumn('Sales', 'BookshopId', { transaction });
                }

                // 5. Rename Bookshops table to backup
                await queryInterface.renameTable('Bookshops', 'Bookshops_Backup', { transaction });
            } else {
                // If Bookshops table doesn't exist, just ensure CustomerId exists in Sales
                const [columns] = await queryInterface.sequelize.query("SHOW COLUMNS FROM Sales LIKE 'CustomerId';", { transaction });
                if (columns.length === 0) {
                    await queryInterface.addColumn('Sales', 'CustomerId', {
                        type: Sequelize.INTEGER,
                        allowNull: true, // Set to true initially
                        references: {
                            model: 'Customers',
                            key: 'id'
                        },
                        onUpdate: 'CASCADE',
                        onDelete: 'CASCADE'
                    }, { transaction });
                }
            }

            // Finally ensure CustomerId is not null if possible, or leave it nullable if there are rows with nulls
            // For now, we leave it nullable or we can enforce it if we are sure.
            // The model says allowNull: false, so we should try to enforce it.
            // But if there are sales without customers, it will fail.
            // Let's check if there are any null CustomerId
            const [nullSales] = await queryInterface.sequelize.query("SELECT count(*) as count FROM Sales WHERE CustomerId IS NULL", { transaction });
            if (nullSales[0].count == 0) {
                await queryInterface.changeColumn('Sales', 'CustomerId', {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'Customers',
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE'
                }, { transaction });
            }

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // Revert changes
            const [tables] = await queryInterface.sequelize.query("SHOW TABLES LIKE 'Bookshops_Backup';", { transaction });
            if (tables.length > 0) {
                await queryInterface.renameTable('Bookshops_Backup', 'Bookshops', { transaction });

                await queryInterface.addColumn('Sales', 'BookshopId', {
                    type: Sequelize.INTEGER,
                    allowNull: true
                }, { transaction });

                await queryInterface.sequelize.query(`
            UPDATE Sales 
            SET BookshopId = CustomerId 
          `, { transaction });

                await queryInterface.removeColumn('Sales', 'CustomerId', { transaction });

                // We don't delete customers because we might have added new ones.
                // But strictly speaking, down migration should revert state.
                // For now, let's just revert the schema changes.
            }
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
};
