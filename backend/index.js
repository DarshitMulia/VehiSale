const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bodyParser = require('body-parser');
const User = require('./db/User');
const Product = require('./db/Product');
const PendingProduct = require('./db/PendingProduct');
const RejectedProduct = require('./db/RejectedProduct');
const Testimonial = require('./db/Testimonial');
const app = express();
require('./db/config');

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// --------------------------------------Token and Authentication Setup--------------------------------------
const Jwt = require('jsonwebtoken');
const jwtkey = 'vehisale';

function verifyToken(req, res, next) {
    let token = req.headers['authorization'];
    if (token) {
        token = token.split(' ')[1];
        Jwt.verify(token, jwtkey, (err, valid) => {
            if (err) {
                res.status(401).send({ result: "Please provide valid token" });
            } else {
                req.valid = valid;
                next();
            }
        });
    } else {
        res.status(403).send({ result: "Please add token with header" });
    }
}

// --------------------------------------POST SignUp--------------------------------------
app.post("/register", async (req, res) => {
    try {
        const user = new User(req.body);
        const savedUser = await user.save();
        const userData = savedUser.toObject();
        delete userData.password;
        Jwt.sign({ user: userData }, jwtkey, { expiresIn: "1y" }, (err, token) => {
            if (err) {
                console.error('Error during token generation:', err);
                return res.status(500).send({ result: "Something went wrong, Please try after some time" });
            }
            res.send({ user: userData, auth: token });
        });
    } catch (error) {
        console.error('Error during user registration:', error);
        res.status(500).send({ result: "Something went wrong, Please try after some time" });
    }
});

// --------------------------------------POST Login--------------------------------------
app.post('/login', async (req, res) => {
    if (req.body.password && req.body.email) {
        let user = await User.findOne(req.body).select("-password");
        if (user) {
            Jwt.sign({ user }, jwtkey, { expiresIn: "1y" }, (err, token) => {
                if (err) {
                    res.send({ result: "Something went wrong, Please try after some time" });
                }
                res.send({ user, auth: token });
            });
        } else {
            res.send({ result: 'No User Found' });
        }
    } else {
        res.send({ result: "No User Found" });
    }
});

// --------------------------------------Middleware to Check Admin Access--------------------------------------
const checkAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.valid.user._id);
        console.log("Fetched user:", user);
        if (user && user.isAdmin) {
            req.user = user;
            next();
        } else {
            res.status(403).send('Access denied. Only admins can access this route.');
        }
    } catch (error) {
        console.error('Error in checkAdmin:', error);
        res.status(403).send('Access denied.');
    }
};

// --------------------------------------Admin Dashboard Route--------------------------------------
app.get('/admindashboard', verifyToken, checkAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        const userCount = users.length;
        const pendingProducts = await PendingProduct.find();
        const pendingProductCount = pendingProducts.length;
        const products = await Product.find();
        const productCount = products.length;
        const rejectedProducts = await RejectedProduct.find();
        const rejectedProductCount = rejectedProducts.length;
        const productCategorySummary = await Product.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);
        const productCompanySummary = await Product.aggregate([
            { $group: { _id: "$company", count: { $sum: 1 } } }
        ]);
        const productFuelTypeSummary = await Product.aggregate([
            { $group: { _id: "$fuelType", count: { $sum: 1 } } }
        ]);
        const productTransmissionSummary = await Product.aggregate([
            { $group: { _id: "$transmission", count: { $sum: 1 } } }
        ]);
        const dashboardData = {
            userCount,
            users,
            pendingProductCount,
            productCount,
            rejectedProductCount,
            productCategorySummary,
            productCompanySummary,
            productFuelTypeSummary,
            productTransmissionSummary,
        };
        res.status(200).json(dashboardData);
    } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --------------------------------------POST New Product--------------------------------------
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/add-product', verifyToken, upload.single('image'), async (req, res) => {
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
});

// --------------------------------------GET All Pending Products--------------------------------------
app.get('/pending-products', verifyToken, async (req, res) => {
    try {
        const pendingProducts = await PendingProduct.find();
        res.json(pendingProducts);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// --------------------------------------PUT Route for Approving or Rejecting Pending Products--------------------------------------
app.put('/pending-products/approve-reject/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { action, reason } = req.body;
        if (action === 'approve') {
            const pendingProduct = await PendingProduct.findById(id);
            if (!pendingProduct) {
                return res.status(404).json({ error: 'Pending product not found' });
            }
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
            const pendingProduct = await PendingProduct.findById(id);
            if (!pendingProduct) {
                return res.status(404).json({ error: 'Pending product not found' });
            }
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
});

// --------------------------------------GET All Rejected Products--------------------------------------
app.get('/rejected-products', verifyToken, async (req, res) => {
    try {
        const rejectedProducts = await RejectedProduct.find();
        res.json(rejectedProducts);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// --------------------------------------GET All Approved Cars Added by a Particular User--------------------------------------
app.get('/user-cars', verifyToken, async (req, res) => {
    try {
        const userId = req.valid.user._id;
        const userCars = await Product.find({ userId });
        res.status(200).json(userCars);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// --------------------------------------GET All Rejected Cars Added by a Particular User--------------------------------------
app.get('/user-rejected-cars', verifyToken, async (req, res) => {
    try {
        const userId = req.valid.user._id;
        const userRejectedCars = await RejectedProduct.find({ userId });
        res.status(200).json(userRejectedCars);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// --------------------------------------GET All Pending Cars Added by a Particular User--------------------------------------
app.get('/user-pending-cars', verifyToken, async (req, res) => {
    try {
        const userId = req.valid.user._id;
        const userPendingCars = await PendingProduct.find({ userId });
        res.status(200).json(userPendingCars);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// --------------------------------------GET All Products with Optional Filters--------------------------------------
app.get('/products', verifyToken, async (req, res) => {
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
});

// --------------------------------------GET Product by ID--------------------------------------
app.get('/products/:id', verifyToken, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// --------------------------------------DELETE Product--------------------------------------
app.delete('/product/:id', verifyToken, async (req, res) => {
    try {
        const result = await Product.deleteOne({ _id: req.params.id });
        res.status(200).json(result);
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).send('Internal Server Error');
    }
});

// --------------------------------------UPDATE Product--------------------------------------
app.put('/product/:id', verifyToken, async (req, res) => {
    try {
        let result = await Product.updateOne(
            { _id: req.params.id },
            { $set: req.body }
        );
        res.status(200).json(result);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).send('Internal Server Error');
    }
});

// --------------------------------------GET Method for Searching--------------------------------------
app.get('/search/:key', verifyToken, async (req, res) => {
    const searchKey = req.params.key;
    try {
        let result = await Product.find({
            $or: [
                { name: { $regex: searchKey, $options: 'i' } },
                { company: { $regex: searchKey, $options: 'i' } }
            ]
        });
        res.status(200).json(result);
    } catch (error) {
        console.error('Error searching for products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --------------------------------------POST a Testimonial--------------------------------------
app.post('/testimonials', verifyToken, async (req, res) => {
    try {
        const { name, text } = req.body;
        if (!name || !text) {
            return res.status(400).json({ error: 'Name and text are required' });
        }
        const newTestimonial = new Testimonial({ name, text });
        await newTestimonial.save();
        res.status(201).json(newTestimonial);
    } catch (error) {
        console.error('Error creating testimonial:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --------------------------------------GET All Testimonials--------------------------------------
app.get('/testimonials', verifyToken, async (req, res) => {
    try {
        const testimonials = await Testimonial.find();
        if (!testimonials || testimonials.length === 0) {
            return res.status(404).json({ error: 'No testimonials found' });
        }
        res.status(200).json(testimonials);
    } catch (error) {
        console.error('Error fetching testimonials:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(5000, () => {
    console.log("Good to go, my friend!");
});
