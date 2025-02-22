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

// Middleware function to verify JWT token
function verifyToken(req, res, next) {
    let token = req.headers['authorization'];
    if (token) {
        token = token.split(' ')[1]; // Extract token from the "Bearer" format
        Jwt.verify(token, jwtkey, (err, valid) => {
            if (err) {
                res.status(401).send({ result: "Please provide valid token" }); // Invalid token
            } else {
                req.valid = valid; // Store validated token payload in request
                next(); // Proceed to the next middleware or route handler
            }
        });
    } else {
        res.status(403).send({ result: "Please add token with header" }); // Token not provided
    }
}







// --------------------------------------POST SignUp--------------------------------------
// Route to handle user registration
app.post("/register", async (req, res) => {
    try {
        const user = new User(req.body); // Create a new user instance with request data
        const savedUser = await user.save(); // Save the user to the database
        const userData = savedUser.toObject(); // Convert saved user to a plain object
        delete userData.password; // Exclude password from response for security
        Jwt.sign({ user: userData }, jwtkey, { expiresIn: "1y" }, (err, token) => {
            if (err) {
                console.error('Error during token generation:', err);
                return res.status(500).send({ result: "Something went wrong, Please try after some time" });
            }

            // Send back user data along with the generated token
            res.send({ user: userData, auth: token });
        });
    } catch (error) {
        console.error('Error during user registration:', error);
        res.status(500).send({ result: "Something went wrong, Please try after some time" }); // Handle any errors
    }
});







// --------------------------------------POST Login--------------------------------------
// Route to handle user login
app.post('/login', async (req, res) => {
    if (req.body.password && req.body.email) { // Ensure email and password are provided
        let user = await User.findOne(req.body).select("-password"); // Find user by email and password, excluding password from the result
        if (user) {
            Jwt.sign({ user }, jwtkey, { expiresIn: "1y" }, (err, token) => { // Generate JWT token
                if (err) {
                    res.send({ result: "Something went wrong, Please try after some time" }); // Handle token generation errors
                }
                res.send({ user, auth: token }); // Send user data and token to client
            });
        } else {
            res.send({ result: 'No User Found' }); // Handle case where no user is found
        }
    } else {
        res.send({ result: "No User Found" }); // Handle case where credentials are missing
    }
});







// --------------------------------------Middleware to Check Admin Access--------------------------------------
// Middleware function to check if the user has admin privileges
const checkAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.valid.user._id);
        console.log("Fetched user:", user); // Log fetched user
        if (user && user.isAdmin) {
            req.user = user;
            next();
        } else {
            res.status(403).send('Access denied. Only admins can access this route.');
        }
    } catch (error) {
        console.error('Error in checkAdmin:', error); // Log error
        res.status(403).send('Access denied.');
    }
};







// --------------------------------------Admin Dashboard Route--------------------------------------
// Route to handle admin dashboard access, protected by checkAdmin middleware
app.get('/admindashboard', verifyToken, checkAdmin, async (req, res) => {
    try {
        // Get counts and data
        const users = await User.find().select('-password'); // Exclude password for security
        const userCount = users.length;

        const pendingProducts = await PendingProduct.find();
        const pendingProductCount = pendingProducts.length;

        const products = await Product.find();
        const productCount = products.length;

        const rejectedProducts = await RejectedProduct.find();
        const rejectedProductCount = rejectedProducts.length;

        const testimonials = await Testimonial.find();
        const testimonialCount = testimonials.length;

        // Aggregate data for trends and summaries
        const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5); // Last 5 registered users
        const recentPendingProducts = await PendingProduct.find().sort({ createdAt: -1 }).limit(5); // Last 5 pending products
        const recentApprovedProducts = await Product.find().sort({ createdAt: -1 }).limit(5); // Last 5 approved products
        const recentRejectedProducts = await RejectedProduct.find().sort({ createdAt: -1 }).limit(5); // Last 5 rejected products
        const recentTestimonials = await Testimonial.find().sort({ createdAt: -1 }).limit(5); // Last 5 testimonials

        // Summarize product distribution by category
        const productCategorySummary = await Product.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        // Summarize product distribution by company
        const productCompanySummary = await Product.aggregate([
            { $group: { _id: "$company", count: { $sum: 1 } } }
        ]);

        // Summarize product distribution by fuel type
        const productFuelTypeSummary = await Product.aggregate([
            { $group: { _id: "$fuelType", count: { $sum: 1 } } }
        ]);

        // Summarize product distribution by transmission
        const productTransmissionSummary = await Product.aggregate([
            { $group: { _id: "$transmission", count: { $sum: 1 } } }
        ]);

        const dashboardData = {
            userCount,
            users,
            pendingProductCount,
            pendingProducts,
            productCount,
            products,
            rejectedProductCount,
            rejectedProducts,
            testimonialCount,
            testimonials,
            recentUsers,
            recentPendingProducts,
            recentApprovedProducts,
            recentRejectedProducts,
            recentTestimonials,
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
// Route to handle adding a new product, saving it to the PendingProduct collection for admin approval
const storage = multer.memoryStorage(); // Configure multer to store files in memory
const upload = multer({ storage: storage }); // Set up multer for handling file uploads

app.post('/add-product', verifyToken, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' }); // Return an error if no file is uploaded
        }
        // Destructure product details from the request body
        const { name, price, category, company, year, mileage, kmsDriven, color, transmission, fuelType } = req.body;
        const image = req.file.buffer.toString('base64'); // Convert image buffer to base64 format
        const userId = req.valid.user._id; // Get the user ID from the verified token
        // Create a new PendingProduct instance
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
        const result = await product.save(); // Save the pending product to the database
        res.status(201).json(result); // Send the saved product as a response
    } catch (error) {
        console.error(error); // Log any errors that occur
        res.status(500).send('Internal Server Error'); // Send an error response if something goes wrong
    }
});







// --------------------------------------GET All Pending Products--------------------------------------
// Route to fetch all products that are pending admin approval
app.get('/pending-products', verifyToken, async (req, res) => {
    try {
        const pendingProducts = await PendingProduct.find(); // Retrieve all pending products from the database
        res.json(pendingProducts); // Send the pending products as a JSON response
    } catch (error) {
        console.error(error); // Log any errors that occur
        res.status(500).send('Internal Server Error'); // Send an error response if something goes wrong
    }
});







// --------------------------------------PUT Route for Approving or Rejecting Pending Products--------------------------------------
app.put('/pending-products/approve-reject/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params; // Get the product ID from the route parameters
        const { action, reason } = req.body; // Destructure action (approve/reject) and reason (if rejected) from the request body
        let product;
        let rejectedProduct;
        if (action === 'approve') { // Handle product approval
            const pendingProduct = await PendingProduct.findById(id); // Find the product by ID
            if (!pendingProduct) {
                return res.status(404).json({ error: 'Pending product not found' });
            }
            // Create a new Product instance using the pending product's data
            product = new Product({
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
            await product.save(); // Save the approved product to the Product collection
            await PendingProduct.findByIdAndDelete(id); // Remove the product from the PendingProduct collection
            res.status(200).json({ message: 'Product approved successfully' });

        } else if (action === 'reject') { // Handle product rejection
            const pendingProduct = await PendingProduct.findById(id); // Find the product by ID
            if (!pendingProduct) {
                return res.status(404).json({ error: 'Pending product not found' });
            }
            // Create a new RejectedProduct instance using the pending product's data and rejection reason
            rejectedProduct = new RejectedProduct({
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
            await rejectedProduct.save(); // Save the rejected product to the RejectedProduct collection
            await PendingProduct.findByIdAndDelete(id); // Remove the product from the PendingProduct collection
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
// Route to fetch all products that have been rejected
app.get('/rejected-products', verifyToken, async (req, res) => {
    try {
        const rejectedProducts = await RejectedProduct.find(); // Retrieve all rejected products from the database
        res.json(rejectedProducts); // Send the rejected products as a JSON response
    } catch (error) {
        console.error(error); // Log any errors that occur
        res.status(500).send('Internal Server Error'); // Send an error response if something goes wrong
    }
});







// --------------------------------------GET All Approved Cars Added by a Particular User--------------------------------------
// Route to fetch all approved products (cars) added by the currently authenticated user
app.get('/user-cars', verifyToken, async (req, res) => {
    try {
        const userId = req.valid.user._id; // Extract user ID from the verified token
        const userCars = await Product.find({ userId }); // Find all approved products by user ID
        res.status(200).json(userCars); // Send the user's cars as a JSON response
    } catch (error) {
        console.error(error); // Log any errors that occur
        res.status(500).send('Internal Server Error'); // Send an error response if something goes wrong
    }
});







// --------------------------------------GET All Rejected Cars Added by a Particular User--------------------------------------
// Route to fetch all rejected products (cars) added by the currently authenticated user
app.get('/user-rejected-cars', verifyToken, async (req, res) => {
    try {
        const userId = req.valid.user._id; // Extract user ID from the verified token
        const userRejectedCars = await RejectedProduct.find({ userId }); // Find all rejected products by user ID
        res.status(200).json(userRejectedCars); // Send the user's rejected cars as a JSON response
    } catch (error) {
        console.error(error); // Log any errors that occur
        res.status(500).send('Internal Server Error'); // Send an error response if something goes wrong
    }
});







// --------------------------------------GET All Pending Cars Added by a Particular User--------------------------------------
// Route to fetch all pending products (cars) added by the currently authenticated user
app.get('/user-pending-cars', verifyToken, async (req, res) => {
    try {
        const userId = req.valid.user._id; // Extract user ID from the verified token
        const userPendingCars = await PendingProduct.find({ userId }); // Find all pending products by user ID
        res.status(200).json(userPendingCars); // Send the user's pending cars as a JSON response
    } catch (error) {
        console.error(error); // Log any errors that occur
        res.status(500).send('Internal Server Error'); // Send an error response if something goes wrong
    }
});







// --------------------------------------GET All Products with Optional Filters--------------------------------------
// Route to fetch all products with optional filtering based on query parameters
app.get('/products', verifyToken, async (req, res) => {
    try {
        const filters = {}; // Initialize an empty filter object
        // Apply filters based on query parameters
        if (req.query.category) filters.category = req.query.category;
        if (req.query.priceRange) {
            // Parse price range and convert to integer values
            const [minPrice, maxPrice] = req.query.priceRange.split('-').map(price => parseInt(price.replace(/,/g, '')));
            filters.price = { $gte: minPrice, $lte: maxPrice }; // Set price range filter
        }
        if (req.query.colors) filters.color = { $in: req.query.colors.split(',') }; // Filter by colors
        if (req.query.company) filters.company = req.query.company; // Filter by company
        if (req.query.transmission) filters.transmission = req.query.transmission; // Filter by transmission
        if (req.query.fuelType) filters.fuelType = req.query.fuelType; // Filter by fuel type

        const products = await Product.find(filters); // Find products matching the filters
        res.status(200).json(products); // Send the filtered products as a JSON response
    } catch (error) {
        console.error(error); // Log any errors that occur
        res.status(500).send('Internal Server Error'); // Send an error response if something goes wrong
    }
});







// --------------------------------------GET Product by ID--------------------------------------
// Route to fetch a specific product by its ID
app.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id); // Find the product by ID
        if (!product) {
            return res.status(404).send('Product not found'); // Handle case where product is not found
        }
        res.json(product); // Send the product details as a JSON response
    } catch (error) {
        console.error(error); // Log any errors that occur
        res.status(500).send('Server error'); // Send an error response if something goes wrong
    }
});







// --------------------------------------DELETE Product--------------------------------------
// Route to delete a product by its ID
app.delete('/product/:id', verifyToken, async (req, res) => {
    try {
        // Delete the product from the Product collection
        const result = await Product.deleteOne({ _id: req.params.id });
        res.status(200).json(result); // Send the result of the deletion operation
    } catch (error) {
        console.error('Error deleting product:', error); // Log any errors that occur
        res.status(500).send('Internal Server Error'); // Send an error response if something goes wrong
    }
});







// --------------------------------------UPDATE Product--------------------------------------
// Route to update a product by its ID
app.put('/product/:id', verifyToken, async (req, res) => {
    try {
        // Update the product in the Product collection
        let result = await Product.updateOne(
            { _id: req.params.id },
            { $set: req.body } // Set the new values for the product fields
        );
        res.status(200).json(result); // Send the result of the update operation
    } catch (error) {
        console.error('Error updating product:', error); // Log any errors that occur
        res.status(500).send('Internal Server Error'); // Send an error response if something goes wrong
    }
});







// --------------------------------------GET Method for Searching--------------------------------------
// Route to search for products by name or company using a search key
app.get('/search/:key', verifyToken, async (req, res) => {
    const searchKey = req.params.key;
    try {
        // Search for products that match the search key in name or company fields
        let result = await Product.find({
            $or: [
                { name: { $regex: searchKey, $options: 'i' } }, // Case-insensitive search by name
                { company: { $regex: searchKey, $options: 'i' } } // Case-insensitive search by company
            ]
        });
        res.status(200).json(result); // Send the search results as a JSON response
    } catch (error) {
        console.error('Error searching for products:', error); // Log any errors that occur
        res.status(500).json({ error: 'Internal server error' }); // Send an error response if something goes wrong
    }
});







// --------------------------------------POST a Testimonial--------------------------------------
// Route to create a new testimonial
app.post('/testimonials', verifyToken, async (req, res) => {
    try {
        const { name, text } = req.body;

        // Validate that both name and text are provided
        if (!name || !text) {
            return res.status(400).json({ error: 'Name and text are required' });
        }

        // Create and save a new testimonial
        const newTestimonial = new Testimonial({ name, text });
        await newTestimonial.save();
        res.status(201).json(newTestimonial); // Send the newly created testimonial as a response
    } catch (error) {
        console.error('Error creating testimonial:', error); // Log any errors that occur
        res.status(500).json({ error: 'Internal Server Error' }); // Send an error response if something goes wrong
    }
});







// --------------------------------------GET All Testimonials--------------------------------------
// Route to fetch all testimonials
app.get('/testimonials', verifyToken, async (req, res) => {
    try {
        const testimonials = await Testimonial.find();

        // Handle case where no testimonials are found
        if (!testimonials || testimonials.length === 0) {
            return res.status(404).json({ error: 'No testimonials found' });
        }
        res.status(200).json(testimonials); // Send the list of testimonials as a JSON response
    } catch (error) {
        console.error('Error fetching testimonials:', error); // Log any errors that occur
        res.status(500).json({ error: 'Internal Server Error' }); // Send an error response if something goes wrong
    }
});

app.listen(5000, () => {
    console.log("Good to go, my friend!");
});