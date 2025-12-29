'use strict';

// Helper function to get a random integer between min and max (inclusive)
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper function to get a random element from an array
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper function to get a random date between start and end
const getRandomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// Helper function to format date for MySQL
const formatDate = (date) => date.toISOString().slice(0, 19).replace('T', ' ');

const customerNames = [
    "John Doe", "Jane Smith", "Acme Corp", "Global Tech", "Local Shop",
    "Alice Johnson", "Bob Brown", "Charlie Davis", "Delta Group", "Echo Systems",
    "Frank Miller", "Grace Wilson", "Henry Moore", "Ivy Taylor", "Jack Anderson",
    "Kevin Thomas", "Laura Jackson", "Mike White", "Nina Harris", "Oscar Martin"
];

const productNames = [
    "Laptop", "Mouse", "Keyboard", "Monitor", "Printer",
    "USB Cable", "HDMI Cable", "Power Bank", "Headphones", "Speakers",
    "Webcam", "Microphone", "Router", "Switch", "Hard Drive",
    "SSD", "Flash Drive", "Memory Card", "Graphics Card", "Processor",
    "Motherboard", "RAM", "Power Supply", "Case", "Cooling Fan",
    "Tablet", "Smartphone", "Smart Watch", "Fitness Tracker", "Earbuds",
    "Charger", "Adapter", "Battery", "Screen Protector", "Case Cover",
    "Stylus", "Docking Station", "Hub", "Card Reader", "Stand",
    "Mount", "Sleeve", "Bag", "Backpack", "Cleaning Kit",
    "Software", "Antivirus", "Office Suite", "Game", "Gift Card"
];

const brands = ["Dell", "HP", "Lenovo", "Asus", "Acer", "Apple", "Samsung", "Logitech", "Canon", "Epson"];
const categories = ["Electronics", "Accessories", "Computers", "Peripherals", "Storage", "Components"];
const suppliers = ["TechDistributors Inc.", "Global Supplies Ltd.", "Local Electronics", "MegaCorp Distribution"];

module.exports = {
    async up(queryInterface, Sequelize) {
        // 1. Customers
        console.log('Seeding Customers...');
        const customers = customerNames.map(name => ({
            name,
            credit_balance: getRandomInt(0, 10000),
            address: `123 ${name} St, Cityville`,
            phone: `555-${getRandomInt(1000, 9999)}`,
            createdAt: new Date(),
            updatedAt: new Date()
        }));
        await queryInterface.bulkInsert('Customers', customers, {});

        const customerRows = await queryInterface.sequelize.query(
            `SELECT id FROM Customers;`,
            { type: queryInterface.sequelize.QueryTypes.SELECT }
        );
        const customerIds = customerRows.map(c => c.id);

        // 2. Products
        console.log('Seeding Products...');
        const products = [];
        for (let i = 0; i < 50; i++) {
            products.push({
                barcode: `PROD-${1000 + i}`,
                name: getRandomElement(productNames) + " " + getRandomInt(1, 100),
                brand: getRandomElement(brands),
                supplier: getRandomElement(suppliers),
                category: getRandomElement(categories),
                quantity: getRandomInt(10, 100),
                price: getRandomInt(100, 5000),
                reorder_threshold: 10,
                discount: 0,
                discount_type: 'Fixed',
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }
        await queryInterface.bulkInsert('Products', products, {});

        const productRows = await queryInterface.sequelize.query(
            `SELECT id, price, name, brand, barcode FROM Products;`,
            { type: queryInterface.sequelize.QueryTypes.SELECT }
        );
        // Map product ID to details for easier access
        const productMap = {};
        productRows.forEach(p => productMap[p.id] = p);
        const productIds = productRows.map(p => p.id);

        // 3. Sales & SaleItems (Last 30 days)
        console.log('Seeding Sales & SaleItems...');
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        for (let i = 0; i < 30; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);

            const dailySalesCount = getRandomInt(1, 5);

            for (let j = 0; j < dailySalesCount; j++) {
                const customerId = getRandomElement(customerIds);
                const saleDate = new Date(date);
                saleDate.setHours(getRandomInt(9, 18), getRandomInt(0, 59));

                // Create Sale Items in memory first to calculate total
                const numItems = getRandomInt(1, 5);
                const currentSaleItems = [];
                let totalAmount = 0;

                for (let k = 0; k < numItems; k++) {
                    const productId = getRandomElement(productIds);
                    const product = productMap[productId];
                    const quantity = getRandomInt(1, 3);
                    const price = parseFloat(product.price);
                    const discount = 0;
                    const itemTotal = (price * quantity) - discount;

                    totalAmount += itemTotal;
                    currentSaleItems.push({
                        ProductId: productId,
                        quantity,
                        price,
                        discount,
                        discount_type: 'Fixed',
                        productName: product.name,
                        productBrand: product.brand,
                        productBarcode: product.barcode,
                        createdAt: saleDate,
                        updatedAt: saleDate
                    });
                }

                // Insert Sale
                const paymentMethod = getRandomElement(['Cash', 'Card', 'Consignment']);
                const [saleId] = await queryInterface.sequelize.query(
                    `INSERT INTO Sales (total_amount, payment_method, CustomerId, discount, createdAt, updatedAt) 
           VALUES (${totalAmount}, '${paymentMethod}', ${customerId}, 0, '${formatDate(saleDate)}', '${formatDate(saleDate)}')`,
                    { type: queryInterface.sequelize.QueryTypes.INSERT }
                );

                // Insert SaleItems
                const saleItemsWithId = currentSaleItems.map(item => ({
                    ...item,
                    SaleId: saleId
                }));

                await queryInterface.bulkInsert('SaleItems', saleItemsWithId, {});
            }
        }

        // 4. Quotations (Similar approach)
        console.log('Seeding Quotations...');
        for (let i = 0; i < 10; i++) {
            const customerId = getRandomElement(customerIds);
            const date = getRandomDate(startDate, new Date());
            const numItems = getRandomInt(1, 5);
            let totalAmount = 0;
            const currentItems = [];

            for (let k = 0; k < numItems; k++) {
                const productId = getRandomElement(productIds);
                const product = productMap[productId];
                const quantity = getRandomInt(1, 3);
                const price = parseFloat(product.price);
                totalAmount += price * quantity;

                currentItems.push({
                    ProductId: productId,
                    quantity,
                    price,
                    discount: 0,
                    discount_type: 'Fixed',
                    createdAt: date,
                    updatedAt: date
                });
            }

            const expiresAt = new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000);
            const [quotationId] = await queryInterface.sequelize.query(
                `INSERT INTO Quotations (total_amount, CustomerId, discount, expiresAt, status, createdAt, updatedAt)
             VALUES (${totalAmount}, ${customerId}, 0, '${formatDate(expiresAt)}', 'Active', '${formatDate(date)}', '${formatDate(date)}')`,
                { type: queryInterface.sequelize.QueryTypes.INSERT }
            );

            const itemsWithId = currentItems.map(item => ({
                ...item,
                QuotationId: quotationId
            }));

            await queryInterface.bulkInsert('QuotationItems', itemsWithId, {});
        }

        // 5. Consignment Payments
        console.log('Seeding Consignment Payments...');
        const payments = [];
        for (let i = 0; i < 20; i++) {
            const paymentDate = getRandomDate(startDate, new Date());
            payments.push({
                customerId: getRandomElement(customerIds),
                amount: getRandomInt(100, 1000),
                paymentDate: paymentDate,
                note: "Payment for invoice",
                createdAt: paymentDate,
                updatedAt: paymentDate
            });
        }
        await queryInterface.bulkInsert('ConsignmentPayments', payments, {});

        console.log('Seeding completed successfully.');
    },

    async down(queryInterface, Sequelize) {
        console.log('Undoing seed...');
        await queryInterface.bulkDelete('ConsignmentPayments', null, {});
        await queryInterface.bulkDelete('QuotationItems', null, {});
        await queryInterface.bulkDelete('Quotations', null, {});
        await queryInterface.bulkDelete('SaleItems', null, {});
        await queryInterface.bulkDelete('Sales', null, {});
        await queryInterface.bulkDelete('Products', null, {});
        await queryInterface.bulkDelete('Customers', null, {});
        console.log('Undo completed.');
    }
};
