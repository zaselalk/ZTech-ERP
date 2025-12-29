"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // First, ensure all users have permissions set (use admin permissions as default)
        const adminPermissions = {
            dashboard: { view: true, create: true, edit: true, delete: true },
            sales: { view: true, create: true, edit: true, delete: true },
            inventory: { view: true, create: true, edit: true, delete: true },
            customers: { view: true, create: true, edit: true, delete: true },
            reports: { view: true, create: true, edit: true, delete: true },
            credit: { view: true, create: true, edit: true, delete: true },
            backups: { view: true, create: true, edit: true, delete: true },
            issues: { view: true, create: true, edit: true, delete: true },
            users: { view: true, create: true, edit: true, delete: true },
            settings: { view: true, create: true, edit: true, delete: true },
            pos: { view: true, create: true, edit: true, delete: true },
        };

        const staffPermissions = {
            dashboard: { view: false, create: false, edit: false, delete: false },
            sales: { view: false, create: false, edit: false, delete: false },
            inventory: { view: false, create: false, edit: false, delete: false },
            customers: { view: false, create: false, edit: false, delete: false },
            reports: { view: false, create: false, edit: false, delete: false },
            credit: { view: false, create: false, edit: false, delete: false },
            backups: { view: false, create: false, edit: false, delete: false },
            issues: { view: false, create: false, edit: false, delete: false },
            users: { view: false, create: false, edit: false, delete: false },
            settings: { view: false, create: false, edit: false, delete: false },
            pos: { view: true, create: true, edit: false, delete: false },
        };

        // Get all users and migrate their role-based permissions to explicit permissions
        const users = await queryInterface.sequelize.query(
            'SELECT id, role, permissions FROM Users',
            { type: Sequelize.QueryTypes.SELECT }
        );

        for (const user of users) {
            if (!user.permissions) {
                // User has no custom permissions, migrate from role
                const permissions = user.role === 'admin' ? adminPermissions : staffPermissions;
                await queryInterface.sequelize.query(
                    'UPDATE Users SET permissions = ? WHERE id = ?',
                    {
                        replacements: [JSON.stringify(permissions), user.id],
                        type: Sequelize.QueryTypes.UPDATE
                    }
                );
            }
        }

        // Make permissions column NOT NULL
        // Note: SQLite doesn't support ALTER COLUMN, so we need to recreate the table
        // For MySQL/PostgreSQL, you would use:
        // await queryInterface.changeColumn('Users', 'permissions', {
        //   type: Sequelize.JSON,
        //   allowNull: false,
        // });

        // Remove the role column
        await queryInterface.removeColumn('Users', 'role');
    },

    down: async (queryInterface, Sequelize) => {
        // Re-add the role column
        await queryInterface.addColumn('Users', 'role', {
            type: Sequelize.ENUM('admin', 'staff'),
            allowNull: false,
            defaultValue: 'staff',
        });
    }
};
