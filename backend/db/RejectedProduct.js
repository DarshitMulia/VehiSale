const mongoose = require('mongoose');

const rejectedProductSchema = new mongoose.Schema({
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
    reason: { type: String, required: true }, 
    addedAt: { type: String }
});

// Pre-save middleware to format the date and time
rejectedProductSchema.pre('save', function(next) {
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); 
    const year = currentDate.getFullYear();
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');

    this.addedAt = `${day}/${month}/${year} ${hours}:${minutes}`;
    next();
});

module.exports = mongoose.model('RejectedProduct', rejectedProductSchema);
