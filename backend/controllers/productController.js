const Product = require('../models/Product');

// Get products with search, filter, sort, and pagination
exports.getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      subcategory,
      brand,
      seller,
      vendor,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      featured,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 12
    } = req.query;

    // Build search query
    let query = {};

    // No approval required - all products are visible
    // Removed admin approval requirement

    // Text search across name, description, tags, brand, category
    if (search) {
      query.$text = { $search: search };
    }

    // Category filters
    if (category) {
      query.category = category;
    }

    if (subcategory) {
      query.subcategory = subcategory;
    }

    if (brand) {
      query.brand = brand;
    }

    // Vendor/Seller filter
    if (seller || vendor) {
      query.seller = seller || vendor;
    }

    // Price range filters
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Rating filter
    if (minRating) {
      query.averageRating = { $gte: parseFloat(minRating) };
    }

    // Stock availability
    if (inStock === 'true') {
      query.countInStock = { $gt: 0 };
      query.status = 'active';
    }

    // Featured products only
    if (featured === 'true') {
      query.featured = true;
    }

    // Active products only (default) - but allow admin to see all products
    // If user is admin and wants all statuses, allow it via allStatus query param
    const isAdmin = req.user && req.user.role === 'admin';
    const showAllStatuses = req.query.allStatus === 'true' || req.query.allStatus === true;
    
    if (!query.status) {
      // If admin requests all statuses, don't filter by status
      if (isAdmin && showAllStatuses) {
        // Don't set status filter - will return all products
      } else {
        query.status = 'active';
      }
    }

    // Build sort options
    let sortOptions = {};
    const validSortFields = [
      'name', 'price', 'averageRating', 'reviewCount',
      'salesCount', 'viewsCount', 'createdAt', 'updatedAt'
    ];

    if (validSortFields.includes(sortBy)) {
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortOptions.createdAt = -1; // Default sort
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Execute query with population
    const products = await Product.find(query)
      .populate('seller', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limitNum);

    // Get available categories and brands for filters
    const categories = await Product.distinct('category', { status: 'active' });
    const brands = await Product.distinct('brand', { status: 'active' });

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      },
      filters: {
        categories,
        brands,
        priceRange: {
          min: 0,
          max: 10000 // You can calculate actual min/max from products
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};

// Get product by ID with full details
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name email role')
      .populate('reviews.user', 'name email');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Increment views count
    await Product.findByIdAndUpdate(req.params.id, {
      $inc: { viewsCount: 1 }
    });

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Failed to fetch product', error: error.message });
  }
};

// Create new product
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      category,
      subcategory,
      brand,
      images,
      countInStock,
      sku,
      weight,
      dimensions,
      tags,
      featured,
      metadata
    } = req.body;

    // Generate SKU if not provided
    const productSku = sku || `PRD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const product = new Product({
      seller: req.user._id,
      name,
      description,
      price,
      originalPrice,
      category,
      subcategory,
      brand,
      images: images || [],
      countInStock,
      sku: productSku,
      weight,
      dimensions,
      tags: tags || [],
      featured: featured || false,
      metadata,
      isApproved: true // Auto-approve seller products - no admin approval needed
    });

    const createdProduct = await product.save();

    // Populate the response
    await createdProduct.populate('seller', 'name email');

    res.status(201).json({
      message: 'Product created successfully',
      product: createdProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'SKU already exists. Please use a different SKU.' });
    } else {
      res.status(500).json({ message: 'Failed to create product', error: error.message });
    }
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check authorization
    if (req.user.role === 'seller' && product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    const {
      name,
      description,
      price,
      originalPrice,
      category,
      subcategory,
      brand,
      images,
      countInStock,
      weight,
      dimensions,
      tags,
      featured,
      status,
      metadata
    } = req.body;

    // Update fields if provided
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (originalPrice) product.originalPrice = originalPrice;
    if (category) product.category = category;
    if (subcategory) product.subcategory = subcategory;
    if (brand) product.brand = brand;
    if (images) product.images = images;
    if (countInStock !== undefined) product.countInStock = countInStock;
    if (weight) product.weight = weight;
    if (dimensions) product.dimensions = dimensions;
    if (tags) product.tags = tags;
    if (featured !== undefined) product.featured = featured;
    if (status) product.status = status;
    if (metadata) product.metadata = metadata;

    const updatedProduct = await product.save();

    // Populate the response
    await updatedProduct.populate('seller', 'name email');

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check authorization
    if (req.user.role === 'seller' && product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Product deleted successfully',
      deletedProductId: req.params.id
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
};

// Get featured products
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({
      featured: true,
      status: 'active',
      countInStock: { $gt: 0 }
    })
    .populate('seller', 'name email')
    .sort({ createdAt: -1 })
    .limit(20);

    res.json(products);
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ message: 'Failed to fetch featured products', error: error.message });
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const {
      subcategory,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 12
    } = req.query;

    let query = {
      category: category,
      status: 'active'
    };

    if (subcategory) {
      query.subcategory = subcategory;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const products = await Product.find(query)
      .populate('seller', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / parseInt(limit));

    res.json({
      products,
      category,
      subcategory,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts
      }
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({ message: 'Failed to fetch products by category', error: error.message });
  }
};

// Add product review
exports.addProductReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating and comment are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const alreadyReviewed = product.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Product already reviewed by this user' });
    }

    // Add new review
    const review = {
      user: req.user._id,
      rating: Number(rating),
      comment,
      isVerified: false // Reviews need admin verification
    };

    product.reviews.push(review);
    product.reviewCount = product.reviews.length;

    // Calculate new average rating
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    product.averageRating = totalRating / product.reviews.length;

    await product.save();

    res.status(201).json({
      message: 'Review added successfully',
      review: product.reviews[product.reviews.length - 1]
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Failed to add review', error: error.message });
  }
};

// Update product review
exports.updateProductReview = async (req, res) => {
  try {
    const { productId, reviewId } = req.params;
    const { rating, comment } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const review = product.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    // Update review
    if (rating) review.rating = Number(rating);
    if (comment) review.comment = comment;

    // Recalculate average rating
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    product.averageRating = totalRating / product.reviews.length;

    await product.save();

    res.json({
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Failed to update review', error: error.message });
  }
};

// Delete product review
exports.deleteProductReview = async (req, res) => {
  try {
    const { productId, reviewId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const review = product.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review or is admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    // Remove review
    product.reviews.pull(reviewId);
    product.reviewCount = product.reviews.length;

    // Recalculate average rating
    if (product.reviews.length > 0) {
      const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
      product.averageRating = totalRating / product.reviews.length;
    } else {
      product.averageRating = 0;
    }

    await product.save();

    res.json({
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Failed to delete review', error: error.message });
  }
};

// Get product reviews
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const product = await Product.findById(productId)
      .populate('reviews.user', 'name email')
      .select('reviews averageRating reviewCount');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let reviews = product.reviews;

    // Simple sorting
    if (sortBy === 'createdAt') {
      reviews = reviews.sort((a, b) =>
        sortOrder === 'asc' ?
          new Date(a.createdAt) - new Date(b.createdAt) :
          new Date(b.createdAt) - new Date(a.createdAt)
      );
    } else if (sortBy === 'rating') {
      reviews = reviews.sort((a, b) =>
        sortOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating
      );
    }

    // Paginate reviews
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedReviews = reviews.slice(startIndex, endIndex);

    res.json({
      reviews: paginatedReviews,
      averageRating: product.averageRating,
      totalReviews: product.reviewCount,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(product.reviewCount / parseInt(limit)),
        hasNext: endIndex < product.reviewCount,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
  }
};

// Admin: Verify review
exports.verifyReview = async (req, res) => {
  try {
    const { productId, reviewId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const review = product.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.isVerified = true;
    await product.save();

    res.json({
      message: 'Review verified successfully',
      review
    });
  } catch (error) {
    console.error('Verify review error:', error);
    res.status(500).json({ message: 'Failed to verify review', error: error.message });
  }
};

// Search products
exports.searchProducts = async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 12 } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Build search query
    const searchQuery = {
      $text: { $search: q },
      status: 'active'
    };

    // No approval required - all products are visible
    // Removed admin approval requirement

    // Add additional filters
    if (category) {
      searchQuery.category = category;
    }

    if (minPrice || maxPrice) {
      searchQuery.price = {};
      if (minPrice) searchQuery.price.$gte = parseFloat(minPrice);
      if (maxPrice) searchQuery.price.$lte = parseFloat(maxPrice);
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(searchQuery)
      .populate('seller', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalResults = await Product.countDocuments(searchQuery);

    res.json({
      query: q,
      products,
      totalResults,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalResults / parseInt(limit)),
      hasNext: parseInt(page) < Math.ceil(totalResults / parseInt(limit)),
      hasPrev: parseInt(page) > 1
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ message: 'Failed to search products', error: error.message });
  }
};

// Approve product (Admin only)
exports.approveProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.isApproved = true;
    product.approvedAt = new Date();
    product.approvedBy = req.user._id;
    
    await product.save();
    await product.populate('seller', 'name email');
    await product.populate('approvedBy', 'name email');

    res.json({
      message: 'Product approved successfully',
      product
    });
  } catch (error) {
    console.error('Approve product error:', error);
    res.status(500).json({ message: 'Failed to approve product', error: error.message });
  }
};

// Reject product (Admin only)
exports.rejectProduct = async (req, res) => {
  try {
    const { reason } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.isApproved = false;
    product.status = 'inactive';
    
    // Store rejection reason in metadata
    if (!product.metadata) {
      product.metadata = {};
    }
    product.metadata.rejectionReason = reason;
    product.metadata.rejectedAt = new Date();
    product.metadata.rejectedBy = req.user._id;
    
    await product.save();
    await product.populate('seller', 'name email');

    res.json({
      message: 'Product rejected successfully',
      product
    });
  } catch (error) {
    console.error('Reject product error:', error);
    res.status(500).json({ message: 'Failed to reject product', error: error.message });
  }
};

// Get pending products (Admin only)
exports.getPendingProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { isApproved: false };
    
    const products = await Product.find(query)
      .populate('seller', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({
      products,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get pending products error:', error);
    res.status(500).json({ message: 'Failed to fetch pending products', error: error.message });
  }
};