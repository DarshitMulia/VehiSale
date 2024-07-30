const mongoose = require('mongoose');

const pendingProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    company: { type: String, required: true },
    image: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    year: { type: Number, required: true },
    mileage: { type: Number, required: true },
    color: { type: String, required: true },
    transmission: { type: String, required: true },
    fuelType: { type: String, required: true },
});

module.exports = mongoose.model('PendingProduct', pendingProductSchema);

