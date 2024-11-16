// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Mongoose connected to MongoDB Atlas");
  })
  .catch((error) => {
    console.error("Mongoose connection error:", error);
  });

// Define Product Schema
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

// Multer Configuration for Image Uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // e.g., 1731758450963.png
  }
});

const upload = multer({ storage: storage });

// Function to Generate QR Code ID
function generateQRCodeId() {
  return uuidv4();
}

// Handle Product Registration
app.post('/api/products', upload.single('image'), async (req, res) => {
  try {
    // Extract product details from the request body
    const { company, productName, category, description, price } = req.body;

    // Check if all required fields are present
    if (!company || !productName || !category || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Define 'productData' with the extracted fields
    const productData = {
      company,
      productName,
      category,
      description,
      price,
      qrId: generateQRCodeId(),
      imageUrl: req.file ? `/uploads/${req.file.filename}` : '/placeholder.jpg'
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

// Fetch All Products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
});

// Fetch a single product by qrId
app.get('/api/products/:qrId', async (req, res) => {
  try {
    const { qrId } = req.params;
    const product = await Product.findOne({ qrId });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({ product });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: error.message });
  }
});

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