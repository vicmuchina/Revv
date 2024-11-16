// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Create schema and model
const productSchema = new mongoose.Schema({
    companyName: String,
    productName: String,
    category: String,
    description: String,
    manufacturingDate: Date,
    expiryDate: Date,
    batchNumber: String,
    serialNumber: String,
    price: Number,
    imageUrl: String,
    qrId: String
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
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
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
        const productData = req.body;
        if (req.file) {
            productData.imageUrl = '/uploads/' + req.file.filename;
        }
        productData.qrId = 'QR' + Date.now();

        const product = new Product(productData);
        await product.save();
        
        res.json({ 
            success: true, 
            message: 'Product registered successfully',
            qrId: product.qrId 
        });
    } catch (error) {
        console.error('Error saving product:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to register product' 
        });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch products' 
        });
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