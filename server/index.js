
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db/models'); // Import the db object

const app = express();
app.use(cors());
app.use(express.json());

const bookshopRoutes = require('./routes/bookshops');
app.use('/api/bookshops', bookshopRoutes);

const bookRoutes = require('./routes/books');
app.use('/api/books', bookRoutes);

const salesRoutes = require('./routes/sales');
app.use('/api/sales', salesRoutes);

const reportsRoutes = require('./routes/reports');
app.use('/api/reports', reportsRoutes);

const dashboardRoutes = require('./routes/dashboard');
app.use('/api/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 5001;

app.get('/', (req, res) => {
  res.send('Bookshop API is running...');
});

// Test the database connection
db.sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });
