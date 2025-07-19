const User = require('../models/User');
const Product = require('../models/Product');
const PendingProduct = require('../models/PendingProduct');
const RejectedProduct = require('../models/RejectedProduct');

exports.getDashboard = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        const pendingProducts = await PendingProduct.find();
        const products = await Product.find();
        const rejectedProducts = await RejectedProduct.find();
        const productCategorySummary = await Product.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]);
        const productCompanySummary = await Product.aggregate([{ $group: { _id: "$company", count: { $sum: 1 } } }]);
        const productFuelTypeSummary = await Product.aggregate([{ $group: { _id: "$fuelType", count: { $sum: 1 } } }]);
        const productTransmissionSummary = await Product.aggregate([{ $group: { _id: "$transmission", count: { $sum: 1 } } }]);

        res.json({
            userCount: users.length,
            users,
            pendingProductCount: pendingProducts.length,
            productCount: products.length,
            rejectedProductCount: rejectedProducts.length,
            productCategorySummary,
            productCompanySummary,
            productFuelTypeSummary,
            productTransmissionSummary,
        });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
