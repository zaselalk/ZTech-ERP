
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db/models'); // Import the db object

const app = express();
app.use(cors());
app.use(express.json());

const passport = require('./auth/passport');
app.use(passport.initialize());

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const bookshopRoutes = require('./routes/bookshops');
app.use('/api/bookshops', passport.authenticate('jwt', { session: false }), bookshopRoutes);

const bookRoutes = require('./routes/books');
app.use('/api/books', passport.authenticate('jwt', { session: false }), bookRoutes);

const salesRoutes = require('./routes/sales');
app.use('/api/sales', passport.authenticate('jwt', { session: false }), salesRoutes);

const reportsRoutes = require('./routes/reports');
app.use('/api/reports', passport.authenticate('jwt', { session: false }), reportsRoutes);

const dashboardRoutes = require('./routes/dashboard');
app.use('/api/dashboard', passport.authenticate('jwt', { session: false }), dashboardRoutes);

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
