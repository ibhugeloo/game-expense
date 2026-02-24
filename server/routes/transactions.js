const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_FILE = path.join(__dirname, '../data.json');

// Helper methods
const readData = () => {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(DATA_FILE, '[]');
            return [];
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading data:', err);
        return [];
    }
};

const writeData = (data) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error writing data:', err);
    }
};

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Public
router.get('/', (req, res) => {
    const transactions = readData();
    // Sort by date desc
    transactions.sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));

    return res.status(200).json({
        success: true,
        count: transactions.length,
        data: transactions
    });
});

// @desc    Add a transaction
// @route   POST /api/transactions
// @access  Public
router.post('/', (req, res) => {
    const transactions = readData();
    const newTransaction = {
        _id: uuidv4(), // Simulate Mongo ID
        ...req.body,
        price: parseFloat(req.body.price),
        purchaseDate: req.body.purchaseDate || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    transactions.push(newTransaction);
    writeData(transactions);

    return res.status(201).json({
        success: true,
        data: newTransaction
    });
});

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Public
router.delete('/:id', (req, res) => {
    let transactions = readData();
    const exists = transactions.find(t => t._id === req.params.id);

    if (!exists) {
        return res.status(404).json({
            success: false,
            error: 'No transaction found'
        });
    }

    transactions = transactions.filter(t => t._id !== req.params.id);
    writeData(transactions);

    return res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Public
router.put('/:id', (req, res) => {
    let transactions = readData();
    let transactionIndex = transactions.findIndex(t => t._id === req.params.id);

    if (transactionIndex === -1) {
        return res.status(404).json({
            success: false,
            error: 'No transaction found'
        });
    }

    transactions[transactionIndex] = {
        ...transactions[transactionIndex],
        ...req.body,
        updatedAt: new Date().toISOString()
    };

    writeData(transactions);

    return res.status(200).json({
        success: true,
        data: transactions[transactionIndex]
    });
});

module.exports = router;
