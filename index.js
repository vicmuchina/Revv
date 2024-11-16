/**
 * Main server file for the REEV application
 * This file sets up the Express server, MongoDB connection, and defines API endpoints
 */

// Load environment variables from .env file into process.env
// This allows us to keep sensitive data (like database credentials) separate from our code
require('dotenv').config();

// Import required packages
const express = require('express');     // Web application framework for Node.js
const mongoose = require('mongoose');    // MongoDB object modeling tool
const multer = require('multer');       // Middleware for handling multipart/form-data (file uploads)
const path = require('path');           // Node.js module for handling file paths
const { v4: uuidv4 } = require('uuid'); // Package for generating unique identifiers

// Initialize Express application
const app = express();
// Set port number from environment variables or default to 3000
const PORT = process.env.PORT || 3000;

// Middleware Setup
// Middleware are functions that have access to the request and response objects
// They can process the request before it reaches the route handler

// Parse JSON bodies (as sent by API clients)
app.use(express.json());
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
// This allows clients to access files in the public directory directly
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
// Connect to MongoDB Atlas using the connection string from environment variables
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    // Connection successful
    console.log("Mongoose connected to MongoDB Atlas");
  })
  .catch((error) => {
    // Connection failed
    console.error("Mongoose connection error:", error);
  });

// Define Product Schema
// Schema defines the structure of documents in MongoDB collection
const productSchema = new mongoose.Schema({
  company: { type: String, required: true },      // Company name
  productName: { type: String, required: true },  // Product name
  category: { type: String, required: true },     // Product category
  description: { type: String },                  // Product description (optional)
  price: { type: Number, required: true },        // Product price
  qrId: { type: String, required: true },        // Unique QR code identifier
  imageUrl: { type: String, required: true }      // URL to product image
});

// Create Product model from schema
// Models are used to create and read documents from the MongoDB database
const Product = mongoose.model('Product', productSchema);

// Multer Configuration for File Uploads
// Configure how uploaded files should be stored
const storage = multer.diskStorage({
  // Set destination folder for uploaded files
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/'); // Files will be stored in public/uploads/
  },
  // Set filename for uploaded files
  filename: function (req, file, cb) {
    // Generate unique filename using timestamp
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Create multer instance with our storage configuration
const upload = multer({ storage: storage });

// Helper Functions
/**
 * Generate a unique QR code identifier using UUID v4
 * UUID (Universally Unique Identifier) ensures each QR code is unique
 * @returns {string} Unique identifier
 */
function generateQRCodeId() {
  return uuidv4();
}

// API Endpoints (Routes)

/**
 * POST /api/products
 * Handle product registration
 * Uses multer middleware to handle file upload
 */
app.post('/api/products', upload.single('image'), async (req, res) => {
  try {
    // Extract data from request body using destructuring
    const { company, productName, category, description, price } = req.body;

    // Validate required fields
    if (!company || !productName || !category || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create product data object
    const productData = {
      company,
      productName,
      category,
      description,
      price,
      qrId: generateQRCodeId(),
      // Set image URL, use placeholder if no image uploaded
      imageUrl: req.file ? `/uploads/${req.file.filename}` : '/placeholder.jpg'
    };

    // Create new Product instance
    const newProduct = new Product(productData);

    // Save product to database
    const savedProduct = await newProduct.save();

    // Send success response
    res.status(201).json({ product: savedProduct });
  } catch (error) {
    // Handle errors
    console.error('Error saving product:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/products
 * Fetch all products from database
 */
app.get('/api/products', async (req, res) => {
  try {
    // Retrieve all products from database
    const products = await Product.find();
    // Send products as response
    res.status(200).json({ products });
  } catch (error) {
    // Handle errors
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/products/:qrId
 * Fetch a single product by its QR code ID
 */
app.get('/api/products/:qrId', async (req, res) => {
  try {
    // Extract qrId from request parameters
    const { qrId } = req.params;
    // Find product in database
    const product = await Product.findOne({ qrId });

    // If product not found, send 404 error
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Send product as response
    res.status(200).json({ product });
  } catch (error) {
    // Handle errors
    console.error('Error fetching product:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/products/:id
 * Delete a product by its ID
 */
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    
    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful Shutdown Handler
// Handle application termination gracefully
process.on('SIGINT', async () => {
  try {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
    process.exit(1);
  }
}); 