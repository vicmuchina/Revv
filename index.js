// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Create schema and model
const productSchema = new mongoose.Schema({
    company: { type: String, required: true },
    productName: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    qrId: { type: String, required: true },
    imageUrl: { type: String, required: true }
});

const Product = mongoose.model('Product', productSchema);

// Updated MongoDB connection with longer timeout
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
    .then(() => {
        console.log("Mongoose connected to MongoDB Atlas");
    })
    .catch((error) => {
        console.error("Mongoose connection error:", error);
    });

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Middleware
app.use(express.static('public'));
app.use(express.json());

// API Routes
app.post('/api/products', upload.single('image'), async (req, res) => {
    try {
        // Extract product details from the request body
        const { company, productName, category, description, price } = req.body;

        // Define 'productData' with the extracted fields
        const productData = {
            company,
            productName,
            category,
            description,
            price,
            qrId: generateQRCodeId(), // Assuming you have a function to generate QR IDs
            imageUrl: req.file ? `/uploads/${req.file.filename}` : '/placeholder.jpg' // Handle image upload
        };

        // Create a new Product instance with 'productData'
        const newProduct = new Product(productData);

        // Save the product to the database
        const savedProduct = await newProduct.save();

        // Respond with the saved product
        res.status(201).json({ product: savedProduct });
    } catch (error) {
        console.error('Error saving product:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json({ products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
        process.exit(0);
    } catch (err) {
        console.error('Error closing MongoDB connection:', err);
        process.exit(1);
    }
});

function generateQRCodeId() {
    return uuidv4();
} 