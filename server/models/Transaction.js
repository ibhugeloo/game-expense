const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a game title'],
        trim: true
    },
    platform: {
        type: String,
        required: [true, 'Please add a platform'],
        enum: ['PC', 'Steam', 'PS5', 'PS4', 'Switch', 'Xbox Series', 'Xbox One', 'Mobile', 'Other'],
        default: 'PC'
    },
    price: {
        type: Number,
        required: [true, 'Please add a price']
    },
    currency: {
        type: String,
        required: true,
        default: 'EUR',
        enum: ['EUR', 'USD', 'GBP', 'JPY', 'CAD', 'AUD']
    },
    store: {
        type: String,
        trim: true,
        default: 'Steam'
    },
    purchaseDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Backlog', 'Playing', 'Completed', 'Wishlist', 'Abandoned', 'DLC'],
        default: 'Backlog'
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Transaction', TransactionSchema);
