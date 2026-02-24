require('dotenv').config();
// Restart trigger (Type Fix)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/game-history')
//     .then(() => console.log('✅ MongoDB Connected'))
//     .catch(err => console.error('❌ MongoDB Connection Error:', err));
console.log('⚠️ Running in Local JSON Mode (No MongoDB)');

// Routes
app.get('/', (req, res) => {
    res.send('Game History API is running...');
});

// Import Routes (will be created later)
const transactionRoutes = require('./routes/transactions');
app.use('/api/transactions', transactionRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
