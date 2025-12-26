import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Avatar,
  Rating,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  Store as StoreIcon,
  Verified as VerifiedIcon,
  ShoppingBag as ProductsIcon,
} from '@mui/icons-material';

const Vendors = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = () => {
    try {
      setLoading(true);
      // Get all products to extract unique vendors
      const sellerProducts = JSON.parse(localStorage.getItem('seller_products') || '[]');
      const adminProducts = JSON.parse(localStorage.getItem('admin_products') || '[]');
      const allProducts = [...sellerProducts, ...adminProducts];

      // Extract unique vendors
      const vendorMap = new Map();
      allProducts.forEach((product) => {
        const vendorId = product.seller || product.sellerId || product.sellerName || 'admin';
        const vendorName = product.sellerName || product.shopName || 'Admin Store';
        
        if (!vendorMap.has(vendorId)) {
          const vendorProducts = allProducts.filter(p => 
            (p.seller === vendorId || p.sellerId === vendorId || p.sellerName === vendorName)
          );
          
          vendorMap.set(vendorId, {
            id: vendorId,
            name: vendorName,
            shopName: product.shopName || vendorName,
            description: product.sellerDescription || 'Quality products from our store',
            logo: product.sellerLogo,
            rating: 4.5,
            totalReviews: Math.floor(Math.random() * 200) + 50,
            totalProducts: vendorProducts.length,
            verified: true,
            image: vendorProducts[0]?.image || vendorProducts[0]?.images?.[0],
          });
        }
      });

      setVendors(Array.from(vendorMap.values()));
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter((v) =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.shopName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Browse Vendors
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Discover amazing stores and shop from verified vendors
      </Typography>

      <TextField
        fullWidth
        placeholder="Search vendors..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 4 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {filteredVendors.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography color="text.secondary">No vendors found.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredVendors.map((vendor) => (
            <Grid item xs={12} sm={6} md={4} key={vendor.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
                onClick={() => navigate(`/vendor/${vendor.id}`)}
              >
                {vendor.image && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={vendor.image}
                    alt={vendor.shopName}
                    sx={{ objectFit: 'cover' }}
                  />
                )}
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        bgcolor: 'primary.main',
                      }}
                    >
                      <StoreIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography variant="h6" fontWeight={600}>
                          {vendor.shopName}
                        </Typography>
                        {vendor.verified && (
                          <VerifiedIcon color="success" sx={{ fontSize: 20 }} />
                        )}
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {vendor.description}
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Rating value={vendor.rating} readOnly precision={0.1} size="small" />
                      <Typography variant="body2" color="text.secondary">
                        ({vendor.totalReviews})
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <ProductsIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {vendor.totalProducts} products
                      </Typography>
                    </Stack>
                  </Stack>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/vendor/${vendor.id}`);
                    }}
                  >
                    Visit Store
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Vendors;




