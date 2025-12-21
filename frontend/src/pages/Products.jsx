import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Button, Card, CardActions, CardContent, CardMedia, Chip,
  Container, Grid, Rating, Stack, Typography, Select, MenuItem, Alert, Paper, IconButton,
  TextField, FormControl, InputLabel
} from '@mui/material';
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material';
import { useCart } from '../contexts/CartContext.jsx';
import { useWishlist } from '../contexts/WishlistContext.jsx';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PriceTag from '../components/Common/PriceTag.jsx';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import StorefrontIcon from '@mui/icons-material/Storefront';

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
  const [searchTerm, setSearchTerm] = React.useState('');
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
  const filtered = catalog.filter((p) => {
    const matchesQ =
      !q || (p.name && p.name.toLowerCase().includes(q)) || (p.category && p.category.toLowerCase().includes(q));
    const matchesCategory = !category || (p.category && p.category.toLowerCase().includes(category));
    const matchesVendor = !vendor || 
      (p.sellerName && p.sellerName.toLowerCase().includes(vendor)) ||
      (p.seller && p.seller.toLowerCase().includes(vendor)) ||
      (p.shopName && p.shopName.toLowerCase().includes(vendor));
    return matchesQ && matchesCategory && matchesVendor;
  });

  const [sort, setSort] = React.useState('relevance');
  const [page, setPage] = React.useState(1);
  const pageSize = 12;

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'price-asc') return a.price - b.price;
    if (sort === 'price-desc') return b.price - a.price;
    if (sort === 'rating-desc') return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

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
              <Card
                key={p.id || p._id}
                onClick={() => navigate(`/products/${p.id || p._id}`)}
                sx={{
                  minWidth: { xs: 220, sm: 240, md: 280 },
                  width: { xs: 220, sm: 240, md: 280 },
                  flex: { xs: '0 0 220px', sm: '0 0 240px', md: '0 0 280px' },
                  borderRadius: 3,
                  cursor: 'pointer',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                  }
                }}
              >
                <Box sx={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                  <CardMedia
                    component="img"
                    image={p.image || p.images?.[0] || 'https://via.placeholder.com/300'}
                    alt={p.name}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      bgcolor: 'rgba(99, 102, 241, 0.9)',
                      color: 'white',
                      px: 1.5,
                      py: 0.75,
                      borderBottomLeftRadius: 1,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {p.category}
                  </Box>
                </Box>
                <CardContent sx={{ pb: 1 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      mb: 1,
                    }}
                  >
                    {p.name}
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1 }}>
                    <Rating
                      name="read-only"
                      value={p.rating || p.averageRating || 0}
                      precision={0.1}
                      readOnly
                      size="small"
                    />
                    <Typography variant="caption" color="text.secondary">
                      ({p.rating || 0})
                    </Typography>
                  </Stack>
                  <PriceTag price={p.price} discount={p.discountPrice || p.originalPrice} />
                </CardContent>
              </Card>
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
        <TextField
          placeholder="Search products..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1, minWidth: { xs: '100%', sm: 200 } }}
          fullWidth={{ xs: true, sm: false }}
        />
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
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {groupedByCategory[categoryName].slice(0, 8).map((p) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={p.id || p._id} sx={{ display: 'flex' }}>
                    <Card sx={{ 
                      borderRadius: 3, 
                      width: '100%',
                      display: 'flex', 
                      flexDirection: 'column', 
                      position: 'relative',
                      overflow: 'hidden',
                      boxSizing: 'border-box',
                      m: 0,
                      background: '#ffffff',
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                        transform: 'translateY(-4px)',
                        border: '1px solid rgba(99, 102, 241, 0.2)'
                      }
                    }}>
                      <Box sx={{ 
                        height: '240px', 
                        width: '100%', 
                        overflow: 'hidden', 
                        position: 'relative',
                        flexShrink: 0,
                        flexGrow: 0,
                        background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)'
                      }}>
                        <CardMedia
                          component="img"
                          image={p.image || p.images?.[0] || 'https://via.placeholder.com/300'}
                          alt={p.name}
                          sx={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease',
                            '&:hover': { transform: 'scale(1.05)' }
                          }}
                        />
                        {/* Wishlist Button */}
                        <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
                          <Button 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggle(p);
                            }} 
                            sx={{ 
                              minWidth: 0, 
                              p: 1,
                              bgcolor: 'rgba(255, 255, 255, 0.95)',
                              backdropFilter: 'blur(8px)',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 1)',
                                transform: 'scale(1.1)'
                              }
                            }}>
                            {wish.some((w) => (w.id || w._id) === (p.id || p._id)) ? <FavoriteIcon color="error" sx={{ fontSize: '1.3rem' }} /> : <FavoriteBorderIcon sx={{ fontSize: '1.3rem' }} />}
                          </Button>
                        </Box>
                        {/* Stock Badge */}
                        <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 2 }}>
                          <Chip 
                            label={p.stock > 0 ? `${p.stock} In Stock` : 'Out of Stock'}
                            size="small"
                            sx={{
                              bgcolor: p.stock > 0 ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              backdropFilter: 'blur(8px)'
                            }}
                          />
                        </Box>
                      </Box>

                      {/* Content */}
                      <CardContent sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        p: 2,
                        flexShrink: 0,
                        boxSizing: 'border-box',
                        flex: 1
                      }}>
                        <Stack spacing={1.2} sx={{ width: '100%', height: '100%' }}>
                          {/* Product Name */}
                          <Typography 
                            variant="subtitle1" 
                            fontWeight={700} 
                            title={p.name} 
                            sx={{ 
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              lineHeight: 1.3,
                              color: '#1a1a1a',
                              flexShrink: 0
                            }}
                          >
                            {p.name}
                          </Typography>
                          {/* Category Chip */}
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            <Chip 
                              label={p.category} 
                              size="small" 
                              sx={{ 
                                height: '22px',
                                fontSize: '0.7rem',
                                bgcolor: 'rgba(99, 102, 241, 0.1)',
                                color: '#6366f1',
                                fontWeight: 600,
                                flexShrink: 0
                              }} 
                            />
                          </Box>
                          {/* Rating */}
                          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ flexShrink: 0 }}>
                            <Rating name="read-only" value={p.rating || p.averageRating || 0} precision={0.1} readOnly size="small" />
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>({p.rating || p.averageRating || 0})</Typography>
                          </Stack>
                          {/* Seller Info */}
                          {p.sellerName && (
                            <Typography 
                              variant="caption" 
                              color="primary" 
                              sx={{ 
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                color: '#6366f1',
                                fontWeight: 500,
                                transition: 'color 0.2s ease',
                                '&:hover': { color: '#4f46e5' },
                                flexShrink: 0,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/vendor/${p.seller || p.sellerId || p.sellerName}`);
                              }}
                              title={`By ${p.sellerName}`}
                            >
                              👤 {p.sellerName}
                            </Typography>
                          )}
                          {/* Price Section */}
                          <Box sx={{ flexShrink: 0, mt: 'auto', pt: 0.5 }}>
                            <PriceTag price={p.price} discount={p.discountPrice || p.originalPrice} />
                          </Box>
                        </Stack>
                      </CardContent>

                      {/* Actions */}
                      <CardActions sx={{ 
                        p: 2, 
                        pt: 0,
                        gap: 1,
                        flexDirection: 'column',
                        borderTop: '1px solid rgba(0, 0, 0, 0.05)',
                        flexShrink: 0,
                        boxSizing: 'border-box',
                        m: 0
                      }}>
                        <Button
                          fullWidth
                          variant="contained"
                          size="small"
                          onClick={() => addItem({ id: p.id || p._id, name: p.name, price: p.discountPrice || p.originalPrice || p.price, image: p.image || p.images?.[0] })}
                          disabled={p.stock <= 0}
                          sx={{
                            bgcolor: p.stock > 0 ? '#6366f1' : '#cbd5e1',
                            color: 'white',
                            fontWeight: 600,
                            textTransform: 'none',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: p.stock > 0 ? '#4f46e5' : '#cbd5e1',
                              transform: p.stock > 0 ? 'translateY(-2px)' : 'none'
                            }
                          }}
                        >
                          🛒 {p.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </Button>
                        <Button
                          fullWidth
                          variant="outlined"
                          size="small"
                          onClick={() => navigate(`/product/${p.id || p._id}`)}
                          sx={{
                            color: '#6366f1',
                            borderColor: '#6366f1',
                            textTransform: 'none',
                            fontWeight: 600,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: 'rgba(99, 102, 241, 0.05)',
                              borderColor: '#4f46e5',
                              color: '#4f46e5'
                            }
                          }}
                        >
                          View Details
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default Products;
