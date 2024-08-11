const express = require('express')
const cors = require('cors')
const multer = require('multer')
const Razorpay = require('razorpay')
const bodyParser = require('body-parser')
const User = require('./db/User')
const Product = require('./db/Product')
const PendingProduct = require('./db/PendingProduct')
const RejectedProduct = require('./db/RejectedProduct')
const Testimonial = require('./db/Testimonial')
const app = express()
require('./db/config')

app.use(express.json())
app.use(cors())
app.use(bodyParser.json())

// --------------------------------------Token Verification--------------------------------------

const Jwt = require('jsonwebtoken')
const jwtkey = 'vehisale'

function verifyToken(req, res, next) {
    let token = req.headers['authorization']
    if (token) {
        token = token.split(' ')[1]
        Jwt.verify(token, jwtkey, (err, valid) => {
            if (err) {
                res.status(401).send({ result: "Please provide valid token" })
            }
            else {
                req.valid = valid
                next();
            }
        })
    }
    else {
        res.status(403).send({ result: "Please add token with header" })
    }
}



// --------------------------------------POST SignUp--------------------------------------

app.post("/register", async (req, res) => {
    try {
        // Create a new user instance with the request body
        const user = new User(req.body);

        // Save the user to the database
        const savedUser = await user.save();

        // Remove sensitive information (password) from the saved user object
        const userData = savedUser.toObject();
        delete userData.password;

        // Send back the user data in the response
        res.send({ user: userData});
    } catch (error) {
        console.error('Error during user registration:', error);
        res.status(500).send({ result: "Something went wrong, Please try after some time" });
    }
});



// --------------------------------------POST Login--------------------------------------

app.post('/login', async (req, res) => {
    if (req.body.password && req.body.email) {
        let user = await User.findOne(req.body).select("-password")
        if (user) {
            Jwt.sign({ user }, jwtkey, { expiresIn: "1y" }, (err, token) => {
                if (err) {
                    res.send({ result: "Something went wrong , Please try after some time" })
                }
                res.send({ user, auth: token })
            })
        }
        else {
            res.send({ result: 'No User Found' })
        }
    }
    else {
        res.send({ result: "No User Found" })
    }
});



// --------------------------------------Middleware to check Admin or not--------------------------------------

const checkAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(403).send('Access denied. No token provided.');
        }

        const decodedToken = jwt.verify(token, 'vehisale'); 
        const user = await User.findById(decodedToken.userId);

        if (user && user.isAdmin) {
            req.user = user; 
            next();
        } else {
            res.status(403).send('Access denied. Only admins can access this route.');
        }
    } catch (error) {
        res.status(403).send('Access denied.');
    }
};

app.get('/admindashboard', checkAdmin, (req, res) => {
    res.send('Welcome to the admin dashboard');
});



// --------------------------------------POST New Product--------------------------------------

// Define storage for uploaded images
const storage = multer.memoryStorage();

// Define multer upload settings
const upload = multer({ storage: storage });

// POST route for adding new product
app.post('/add-product', verifyToken, upload.single('image'), async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Extract data from the request body
        const { name, price, category, company, year, mileage, color, transmission, fuelType } = req.body;

        // Extract image data (base64 encoded)
        const image = req.file.buffer.toString('base64');

        // Extract user ID from the token
        const userId = req.valid.user._id;

        // Create a new product instance with all fields including user ID
        const product = new PendingProduct({
            name,
            price,
            category,
            company,
            year,
            mileage,
            color,
            transmission,
            fuelType,
            image,
            userId
        });

        // Save the product to the database
        const result = await product.save();

        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});



// --------------------------------------GET all pending products--------------------------------------

app.get('/pending-products', verifyToken, async (req, res) => {
    try {
        const pendingProducts = await PendingProduct.find();

        res.json(pendingProducts);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});



// --------------------------------------PUT route for approving or rejecting pending products--------------------------------------

app.put('/pending-products/approve-reject/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { action, reason } = req.body; // Added reason field

        let product;
        let rejectedProduct;

        if (action === 'approve') {
            // Get pending product details
            const pendingProduct = await PendingProduct.findById(id);
            if (!pendingProduct) {
                return res.status(404).json({ error: 'Pending product not found' });
            }

            // Create a new product instance using pending product details
            product = new Product({
                name: pendingProduct.name,
                price: pendingProduct.price,
                category: pendingProduct.category,
                company: pendingProduct.company,
                image: pendingProduct.image,
                year: pendingProduct.year,
                mileage: pendingProduct.mileage,
                color: pendingProduct.color,
                transmission: pendingProduct.transmission,
                fuelType: pendingProduct.fuelType,
                userId: pendingProduct.userId
            });

            // Save the new product to the products collection
            await product.save();

            // Delete the pending product from the pending products collection
            await PendingProduct.findByIdAndDelete(id);

            res.status(200).json({ message: 'Product approved successfully' });
        } else if (action === 'reject') {
            // Get pending product details
            const pendingProduct = await PendingProduct.findById(id);
            if (!pendingProduct) {
                return res.status(404).json({ error: 'Pending product not found' });
            }

            // Create a new rejected product instance using pending product details
            rejectedProduct = new RejectedProduct({
                name: pendingProduct.name,
                price: pendingProduct.price,
                category: pendingProduct.category,
                company: pendingProduct.company,
                image: pendingProduct.image,
                year: pendingProduct.year,
                mileage: pendingProduct.mileage,
                color: pendingProduct.color,
                transmission: pendingProduct.transmission,
                fuelType: pendingProduct.fuelType,
                userId: pendingProduct.userId,
                reason: reason // Save the rejection reason
            });

            // Save the new rejected product to the rejected products collection
            await rejectedProduct.save();

            // Delete the pending product from the pending products collection
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



// --------------------------------------GET all rejected products--------------------------------------

app.get('/rejected-products', verifyToken, async (req, res) => {
    try {
        const rejectedProducts = await RejectedProduct.find();
        res.json(rejectedProducts);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});



// --------------------------------------GET all approved cars added by the particular user--------------------------------------

app.get('/user-cars', verifyToken, async (req, res) => {
    try {
        // Extract user ID from the token
        const userId = req.valid.user._id;

        // Find cars added by the current user from the Product collection
        const userCars = await Product.find({ userId });

        // Respond with the user's cars
        res.status(200).json(userCars);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});



// --------------------------------------GET all rejected cars added by the particular user--------------------------------------

app.get('/user-rejected-cars', verifyToken, async (req, res) => {
    try {
        // Extract user ID from the token
        const userId = req.valid.user._id;

        // Find cars added by the current user from the RejectedProduct collection
        const userRejectedCars = await RejectedProduct.find({ userId });

        // Respond with the user's rejected cars
        res.status(200).json(userRejectedCars);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});



// --------------------------------------GET all pending cars added by the particular user--------------------------------------

app.get('/user-pending-cars', verifyToken, async (req, res) => {
    try {
        // Extract user ID from the token
        const userId = req.valid.user._id;

        // Find cars added by the current user from the Product collection
        const userPendingCars = await PendingProduct.find({ userId });

        // Respond with the user's cars
        res.status(200).json(userPendingCars);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});



// --------------------------------------GET all products--------------------------------------

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



// --------------------------------------GET all products by their ID--------------------------------------

app.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product ) {
            return res.status(404).send('Product not found');
        }
        res.json(product);
    } catch (error) {
        res.status(500).send('Server error');
    }
});



// --------------------------------------DELETE Product--------------------------------------

app.delete('/product/:id', verifyToken, async (req, res) => {
    const result = await Product.deleteOne({ _id: req.params.id })
    res.send(result)
});



// --------------------------------------UPDATE Product--------------------------------------

app.put('/product/:id', verifyToken, async (req, res) => {
    let result = await Product.updateOne(
        { _id: req.params.id },
        {
            $set: req.body
        }
    )
    res.send(result)
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
        res.send(result);
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



// --------------------------------------GET all Testimonials--------------------------------------

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



// --------------------------------------POST Payment Integration--------------------------------------

// app.post('/orders', (req,res) => {
//     const razorpay = new Razorpay({
//         key_id: "",
//         key_secret: ""
//     })
// })



app.listen(5000);