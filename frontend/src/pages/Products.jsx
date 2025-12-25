import React, { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Button, Container, Stack, Typography, Select, MenuItem, Paper, IconButton,
  TextField, FormControl, InputLabel
} from '@mui/material';
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ProductCard from '../components/Product/ProductCard.jsx';

const Products = () => {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const q = (params.get('search') || '').toLowerCase();
  const category = (params.get('category') || '').toLowerCase();
  const vendor = (params.get('vendor') || '').toLowerCase();
  const { items: wish, toggle } = useWishlist();
  const sliderRef = React.useRef(null);
  const [sliderIndex, setSliderIndex] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState(q || '');
  const [selectedCategory, setSelectedCategory] = React.useState(category || 'All');
  const [sortBy, setSortBy] = React.useState('default');

  const sellerProducts = (() => {
    try {
      const raw = localStorage.getItem('seller_products');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })();
  const adminProducts = (() => {
    try {
      const raw = localStorage.getItem('admin_products');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })();
  // Only show products created by sellers/admins; exclude demo seeding
  const catalog = [...sellerProducts, ...adminProducts];

  // Get unique categories, plus "All"
  const allCategories = useMemo(() => {
    const categories = new Set(catalog.map(p => p.category).filter(Boolean));
    return ['All', ...Array.from(categories).sort()];
  }, [catalog]);

  // Filter products based on search and category
  const filtered = useMemo(() => {
    return catalog.filter((p) => {
      // Category filter
      const matchCategory = selectedCategory === 'All' || 
        (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());
      
      // Search filter
      const matchSearch = !searchTerm || 
        (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Vendor filter (from URL params)
      const matchesVendor = !vendor || 
        (p.sellerName && p.sellerName.toLowerCase().includes(vendor)) ||
        (p.seller && p.seller.toLowerCase().includes(vendor)) ||
        (p.shopName && p.shopName.toLowerCase().includes(vendor));
      
      return matchCategory && matchSearch && matchesVendor;
    });
  }, [catalog, selectedCategory, searchTerm, vendor]);

  const [sort, setSort] = React.useState('relevance');
  const [page, setPage] = React.useState(1);
  const pageSize = 12;

  // Apply sorting to filtered products
  const sorted = useMemo(() => {
    const sortedArray = [...filtered];
    
    // Apply sortBy filter first (from the filter bar)
    if (sortBy === 'price-low') {
      sortedArray.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price-high') {
      sortedArray.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === 'newest') {
      sortedArray.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      });
    }
    
    // Then apply the secondary sort (from the sort dropdown)
    if (sort === 'price-asc') {
      sortedArray.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sort === 'price-desc') {
      sortedArray.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sort === 'rating-desc') {
      sortedArray.sort((a, b) => (b.rating || b.averageRating || 0) - (a.rating || a.averageRating || 0));
    }
    
    return sortedArray;
  }, [filtered, sortBy, sort]);

  // Group products by category
  const groupedByCategory = React.useMemo(() => {
    const groups = {};
    sorted.forEach((product) => {
      const cat = product.category || 'Uncategorized';
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(product);
    });
    return groups;
  }, [sorted]);

  const categories = Object.keys(groupedByCategory).sort();
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  const sliderProducts = sorted.slice(0, 8);
  const scrollSlider = (direction) => {
    if (!sliderRef.current) return;
    const delta = direction === 'left' ? -1 : 1;
    const newIndex = Math.max(0, Math.min(sliderProducts.length - 1, sliderIndex + delta * 3));
    setSliderIndex(newIndex);
    const scrollAmount = newIndex * (300 + 16);
    sliderRef.current.scrollTo({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 2, md: 4 }, mb: 6, px: { xs: 1.5, sm: 3 } }}>
      {/* Featured Slider Section */}
      {sliderProducts.length > 0 && (
        <Box sx={{ mb: { xs: 4, md: 6 } }}>
          <Stack 
            direction="row" 
            justifyContent="space-between" 
            alignItems="center" 
            sx={{ mb: 2, gap: 1 }}
          >
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700, 
                fontSize: { xs: '1.25rem', md: '1.75rem' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              ✨ Featured
            </Typography>
            <Stack direction="row" spacing={0.5}>
              <IconButton 
                size="small" 
                onClick={() => scrollSlider('left')}
                sx={{ 
                  bgcolor: 'rgba(99, 102, 241, 0.1)',
                  '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.2)' }
                }}
              >
                <ChevronLeftIcon sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={() => scrollSlider('right')}
                sx={{ 
                  bgcolor: 'rgba(99, 102, 241, 0.1)',
                  '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.2)' }
                }}
              >
                <ChevronRightIcon sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
              </IconButton>
            </Stack>
          </Stack>
          
          <Box
            ref={sliderRef}
            sx={{
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              scrollBehavior: 'smooth',
              pb: 1,
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
            }}
          >
            {sliderProducts.map((p) => (
              <Box
                key={p.id || p._id}
                sx={{
                  minWidth: 220,
                  width: 220,
                  flex: '0 0 220px',
                }}
              >
                <ProductCard
                  product={p}
                  onNavigate={(path) => navigate(path)}
                />
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Divider */}
      <Box sx={{ height: 1, bgcolor: 'divider', my: { xs: 2, md: 4 } }} />

      {/* Main Section Title */}
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', sm: 'center' }} 
        sx={{ mb: 3, gap: 2 }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', md: '2rem' } }}>
          📦 All Products
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/cart')}
          sx={{ whiteSpace: 'nowrap' }}
        >
          🛒 Go to Cart
        </Button>
      </Stack>

      {/* Filters and Sorting Bar */}
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        gap={{ xs: 1.5, sm: 2 }} 
        sx={{ 
          mb: 3, 
          p: { xs: 1.5, sm: 2 }, 
          bgcolor: 'rgba(99, 102, 241, 0.05)',
          borderRadius: 2,
          border: '1px solid rgba(99, 102, 241, 0.1)'
        }}
      >
        {/* Search Box */}
        <TextField
          placeholder="Search products..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1, minWidth: { xs: '100%', sm: 200 } }}
          fullWidth={{ xs: true, sm: false }}
        />
        
        {/* Category Dropdown */}
        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 180 } }} fullWidth={{ xs: true, sm: false }}>
          <InputLabel>Category</InputLabel>
          <Select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)} 
            label="Category"
          >
            {allCategories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Sort By */}
        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 } }} fullWidth={{ xs: true, sm: false }}>
          <InputLabel>Sort By</InputLabel>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} label="Sort By">
            <MenuItem value="default">Default</MenuItem>
            <MenuItem value="price-low">Price: Low to High</MenuItem>
            <MenuItem value="price-high">Price: High to Low</MenuItem>
            <MenuItem value="newest">Newest First</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', sm: 'center' }} 
        sx={{ mb: 3, gap: { xs: 1, sm: 2 } }}
      >
        <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
          📊 {sorted.length} results found
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>Sort:</Typography>
          <Select 
            size="small" 
            value={sort} 
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            sx={{ minWidth: { xs: '100%', sm: 150 } }}
            fullWidth={{ xs: true, sm: false }}
          >
            <MenuItem value="relevance">Relevance</MenuItem>
            <MenuItem value="price-asc">Price: Low to High</MenuItem>
            <MenuItem value="price-desc">Price: High to Low</MenuItem>
            <MenuItem value="rating-desc">Top Rated</MenuItem>
          </Select>
        </Stack>
      </Stack>

      {sorted.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'rgba(99, 102, 241, 0.05)', borderRadius: 3 }}>
          <ShoppingBagIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2, opacity: 0.7 }} />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
            {sorted.length === 0 ? '📭 No Products Available Yet' : '🔍 No Results Found'}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3, maxWidth: '400px', mx: 'auto' }}>
            {sorted.length === 0
              ? 'Products will appear here as sellers add items. Ready to become a seller?'
              : 'Try adjusting your search or filters to find what you\'re looking for.'}
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
            {sorted.length === 0 && (
              <Button
                variant="contained"
                startIcon={<StorefrontIcon />}
                onClick={() => navigate('/seller-center')}
              >
                Become a Seller
              </Button>
            )}
            <Button variant="outlined" onClick={() => navigate('/products')}>
              {sorted.length === 0 ? 'Browse All' : 'Clear Filters'}
            </Button>
          </Stack>
        </Paper>
      ) : (
        <Box>
          {categories.map((categoryName) => (
            <Box key={categoryName} sx={{ mb: 6 }}>
              {/* Category Header */}
              <Stack 
                direction="row" 
                justifyContent="space-between" 
                alignItems="center" 
                sx={{ 
                  mb: 3, 
                  pb: 2, 
                  borderBottom: '2px solid rgba(102, 126, 234, 0.2)',
                  '&:hover': { borderBottom: '2px solid rgba(102, 126, 234, 0.5)' },
                  transition: 'all 0.3s ease'
                }}
              >
                <Box>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontSize: { xs: '1.25rem', md: '1.5rem' }
                    }}
                  >
                    📂 {categoryName}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ fontSize: '0.85rem', fontWeight: 500 }}
                  >
                    {groupedByCategory[categoryName].length} products
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={() => navigate(`/products?category=${categoryName}`)}
                  sx={{
                    color: '#667eea',
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                    '&:hover': { 
                      background: 'rgba(102, 126, 234, 0.1)',
                      transform: 'translateX(4px)'
                    }
                  }}
                >
                  View all →
                </Button>
              </Stack>

              {/* Products Grid for Category */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  flexWrap: 'wrap',
                  justifyContent: { xs: 'center', sm: 'flex-start' }
                }}
              >
                {groupedByCategory[categoryName].slice(0, 8).map((p) => (
                  <ProductCard
                    key={p.id || p._id}
                    product={p}
                    onNavigate={(path) => navigate(path)}
                  />
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default Products;
