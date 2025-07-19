const Product = require('../models/Product');
const PendingProduct = require('../models/PendingProduct');
const RejectedProduct = require('../models/RejectedProduct');

exports.addProduct = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const { name, price, category, company, year, mileage, kmsDriven, color, transmission, fuelType } = req.body;
        const image = req.file.buffer.toString('base64');
        const userId = req.valid.user._id;

        const product = new PendingProduct({
            name,
            price,
            category,
            company,
            year,
            mileage,
            kmsDriven,
            color,
            transmission,
            fuelType,
            image,
            userId
        });

        const result = await product.save();
        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getAllPending = async (req, res) => {
    try {
        const pendingProducts = await PendingProduct.find();
        res.json(pendingProducts);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

exports.approveOrReject = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, reason } = req.body;

        const pendingProduct = await PendingProduct.findById(id);
        if (!pendingProduct) return res.status(404).json({ error: 'Pending product not found' });

        if (action === 'approve') {
            const product = new Product({
                name: pendingProduct.name,
                price: pendingProduct.price,
                category: pendingProduct.category,
                company: pendingProduct.company,
                image: pendingProduct.image,
                year: pendingProduct.year,
                mileage: pendingProduct.mileage,
                kmsDriven: pendingProduct.kmsDriven,
                color: pendingProduct.color,
                transmission: pendingProduct.transmission,
                fuelType: pendingProduct.fuelType,
                userId: pendingProduct.userId
            });
            await product.save();
            await PendingProduct.findByIdAndDelete(id);
            res.status(200).json({ message: 'Product approved successfully' });

        } else if (action === 'reject') {
            const rejectedProduct = new RejectedProduct({
                name: pendingProduct.name,
                price: pendingProduct.price,
                category: pendingProduct.category,
                company: pendingProduct.company,
                image: pendingProduct.image,
                year: pendingProduct.year,
                mileage: pendingProduct.mileage,
                kmsDriven: pendingProduct.kmsDriven,
                color: pendingProduct.color,
                transmission: pendingProduct.transmission,
                fuelType: pendingProduct.fuelType,
                userId: pendingProduct.userId,
                reason: reason
            });
            await rejectedProduct.save();
            await PendingProduct.findByIdAndDelete(id);
            res.status(200).json({ message: 'Product rejected successfully' });

        } else {
            res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getAllRejected = async (req, res) => {
    try {
        const rejectedProducts = await RejectedProduct.find();
        res.json(rejectedProducts);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getUserApproved = async (req, res) => {
    try {
        const userId = req.valid.user._id;
        const userCars = await Product.find({ userId });
        res.status(200).json(userCars);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getUserRejected = async (req, res) => {
    try {
        const userId = req.valid.user._id;
        const userRejectedCars = await RejectedProduct.find({ userId });
        res.status(200).json(userRejectedCars);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getUserPending = async (req, res) => {
    try {
        const userId = req.valid.user._id;
        const userPendingCars = await PendingProduct.find({ userId });
        res.status(200).json(userPendingCars);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getAll = async (req, res) => {
    try {
        const filters = {};
        if (req.query.category) filters.category = req.query.category;
        if (req.query.priceRange) {
            const [minPrice, maxPrice] = req.query.priceRange.split('-').map(price => parseInt(price.replace(/,/g, '')));
            filters.price = { $gte: minPrice, $lte: maxPrice };
        }
        if (req.query.colors) filters.color = { $in: req.query.colors.split(',') };
        if (req.query.company) filters.company = req.query.company;
        if (req.query.transmission) filters.transmission = req.query.transmission;
        if (req.query.fuelType) filters.fuelType = req.query.fuelType;

        const products = await Product.find(filters);
        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).send('Product not found');
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

exports.delete = async (req, res) => {
    try {
        const result = await Product.deleteOne({ _id: req.params.id });
        res.status(200).json(result);
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.update = async (req, res) => {
    try {
        const result = await Product.updateOne({ _id: req.params.id }, { $set: req.body });
        res.status(200).json(result);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.search = async (req, res) => {
    try {
        const result = await Product.find({
            $or: [
                { name: { $regex: req.params.key, $options: 'i' } },
                { company: { $regex: req.params.key, $options: 'i' } }
            ]
        });
        res.status(200).json(result);
    } catch (error) {
        console.error('Error searching for products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
