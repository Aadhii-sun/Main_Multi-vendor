import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, IconButton, useTheme, CircularProgress } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../../services/products';
import { useNavigate } from 'react-router-dom';

// Default slides if no products are available
const defaultSlides = [
  {
    id: 1,
    title: 'Super Value Days',
    subtitle: '1st-7th Every month',
    mainText: 'Under ₹499',
    category: 'Food & beverages',
    offer: 'Extra up to ₹200 cashback*',
    leftImage: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400',
    rightImage: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400',
    backgroundColor: 'linear-gradient(135deg, #E3F2FD 0%, #C8E6C9 100%)',
  },
  {
    id: 2,
    title: 'Electronics Sale',
    subtitle: 'Limited Time Offer',
    mainText: 'Up to 50% OFF',
    category: 'Electronics & Gadgets',
    offer: 'Free shipping on orders above ₹999',
    leftImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    rightImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    backgroundColor: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
  },
  {
    id: 3,
    title: 'Home & Kitchen',
    subtitle: 'Special Collection',
    mainText: 'Starting ₹299',
    category: 'Home Essentials',
    offer: 'Buy 2 Get 1 Free*',
    leftImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
    rightImage: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400',
    backgroundColor: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)',
  },
];

const PromotionalBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const theme = useTheme();
  const navigate = useNavigate();

  // Fetch products for different categories
  const { data: electronicsProducts } = useQuery({
    queryKey: ['products', 'Electronics', 'featured'],
    queryFn: () => getProducts({ category: 'Electronics', featured: 'true', limit: 2 }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: homeProducts } = useQuery({
    queryKey: ['products', 'Home & Garden', 'featured'],
    queryFn: () => getProducts({ category: 'Home & Garden', featured: 'true', limit: 2 }),
    staleTime: 1000 * 60 * 5,
  });

  const { data: foodProducts } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => getProducts({ featured: 'true', limit: 2 }),
    staleTime: 1000 * 60 * 5,
  });

  // Create slides from real products
  const createSlidesFromProducts = () => {
    const slides = [];

    // Food & Beverages slide
    if (foodProducts?.products?.length >= 2) {
      const products = foodProducts.products.slice(0, 2);
      slides.push({
        id: 'food-1',
        title: 'Super Value Days',
        subtitle: '1st-7th Every month',
        mainText: `Under $${Math.max(...products.map(p => p.price)).toFixed(0)}`,
        category: products[0]?.category || 'Food & beverages',
        offer: 'Extra up to ₹200 cashback*',
        leftImage: products[0]?.images?.[0] || products[0]?.image || defaultSlides[0].leftImage,
        rightImage: products[1]?.images?.[0] || products[1]?.image || defaultSlides[0].rightImage,
        backgroundColor: 'linear-gradient(135deg, #E3F2FD 0%, #C8E6C9 100%)',
        products: products,
      });
    }

    // Electronics slide
    if (electronicsProducts?.products?.length >= 2) {
      const products = electronicsProducts.products.slice(0, 2);
      const maxPrice = Math.max(...products.map(p => p.price));
      const minPrice = Math.min(...products.map(p => p.price));
      const discount = Math.round(((maxPrice - minPrice) / maxPrice) * 100);
      slides.push({
        id: 'electronics-1',
        title: 'Electronics Sale',
        subtitle: 'Limited Time Offer',
        mainText: `Up to ${discount}% OFF`,
        category: 'Electronics & Gadgets',
        offer: 'Free shipping on orders above ₹999',
        leftImage: products[0]?.images?.[0] || products[0]?.image || defaultSlides[1].leftImage,
        rightImage: products[1]?.images?.[0] || products[1]?.image || defaultSlides[1].rightImage,
        backgroundColor: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
        products: products,
      });
    }

    // Home & Kitchen slide
    if (homeProducts?.products?.length >= 2) {
      const products = homeProducts.products.slice(0, 2);
      const minPrice = Math.min(...products.map(p => p.price));
      slides.push({
        id: 'home-1',
        title: 'Home & Kitchen',
        subtitle: 'Special Collection',
        mainText: `Starting $${minPrice.toFixed(0)}`,
        category: 'Home Essentials',
        offer: 'Buy 2 Get 1 Free*',
        leftImage: products[0]?.images?.[0] || products[0]?.image || defaultSlides[2].leftImage,
        rightImage: products[1]?.images?.[0] || products[1]?.image || defaultSlides[2].rightImage,
        backgroundColor: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)',
        products: products,
      });
    }

    // If no products, use default slides
    return slides.length > 0 ? slides : defaultSlides;
  };

  const promotionalSlides = createSlidesFromProducts();

  // Auto-slide functionality
  useEffect(() => {
    if (promotionalSlides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promotionalSlides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [promotionalSlides.length]);

  const handlePrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + promotionalSlides.length) % promotionalSlides.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % promotionalSlides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const handleBannerClick = () => {
    const currentBanner = promotionalSlides[currentSlide];
    if (currentBanner?.products?.length > 0) {
      // Navigate to products page with category filter
      navigate(`/products?category=${currentBanner.category}`);
    }
  };

  if (promotionalSlides.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 360, p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const currentBanner = promotionalSlides[currentSlide];

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: 1200,
        mx: 'auto',
        mt: 2,
        mb: 4,
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        height: { xs: 280, sm: 320, md: 360 },
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      {/* Main Banner */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          background: currentBanner.backgroundColor,
          display: 'flex',
          alignItems: 'center',
          px: { xs: 2, sm: 4, md: 6 },
          py: 4,
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
      >
        {/* Left Content */}
        <Box
          sx={{
            flex: 1,
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Box
              component="span"
              sx={{
                fontSize: '1.5rem',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%, 100%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.1)' }
                }
              }}
            >
              🎉
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#1a1a1a',
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                letterSpacing: '0.5px'
              }}
            >
              {currentBanner.title}
            </Typography>
          </Box>
          <Typography
            variant="body2"
            sx={{
              color: '#667eea',
              fontSize: { xs: '0.75rem', sm: '0.85rem' },
              fontWeight: 600
            }}
          >
            {currentBanner.subtitle}
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              lineHeight: 1.1,
              my: 1,
            }}
          >
            {currentBanner.mainText}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text?.primary || '#374151',
              fontWeight: 500,
              fontSize: { xs: '0.9rem', sm: '1rem' },
              mb: 2,
            }}
          >
            {currentBanner.category}
          </Typography>
          <Button
            variant="contained"
            onClick={handleBannerClick}
            sx={{
              backgroundColor: theme.palette.brand?.magenta || '#22C55E',
              color: '#fff',
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: { xs: '0.85rem', sm: '0.9rem' },
              maxWidth: { xs: '100%', sm: 'fit-content' },
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: theme.palette.brand?.magenta || '#16A34A',
              },
            }}
          >
            {currentBanner.offer}
          </Button>
        </Box>

        {/* Right Images */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Box
            component="img"
            src={currentBanner.leftImage}
            alt={currentBanner.products?.[0]?.name || 'Product'}
            onClick={() => currentBanner.products?.[0] && navigate(`/product/${currentBanner.products[0]._id}`)}
            sx={{
              width: { xs: 100, sm: 140, md: 180 },
              height: { xs: 100, sm: 140, md: 180 },
              objectFit: 'cover',
              borderRadius: 2,
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
              transform: 'rotate(-5deg)',
              cursor: currentBanner.products?.[0] ? 'pointer' : 'default',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: currentBanner.products?.[0] ? 'rotate(-3deg) scale(1.05)' : 'rotate(-5deg)',
              },
            }}
          />
          <Box
            component="img"
            src={currentBanner.rightImage}
            alt={currentBanner.products?.[1]?.name || 'Product'}
            onClick={() => currentBanner.products?.[1] && navigate(`/product/${currentBanner.products[1]._id}`)}
            sx={{
              width: { xs: 100, sm: 140, md: 180 },
              height: { xs: 100, sm: 140, md: 180 },
              objectFit: 'cover',
              borderRadius: 2,
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
              transform: 'rotate(5deg)',
              cursor: currentBanner.products?.[1] ? 'pointer' : 'default',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: currentBanner.products?.[1] ? 'rotate(3deg) scale(1.05)' : 'rotate(5deg)',
              },
            }}
          />
        </Box>

        {/* Navigation Arrows */}
        <IconButton
          onClick={handlePrevious}
          sx={{
            position: 'absolute',
            left: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: theme.palette.brand?.magenta || '#22C55E',
            zIndex: 3,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
            },
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <ArrowBackIos sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }} />
        </IconButton>

        <IconButton
          onClick={handleNext}
          sx={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: theme.palette.brand?.magenta || '#22C55E',
            zIndex: 3,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
            },
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <ArrowForwardIos sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }} />
        </IconButton>
      </Box>

      {/* Slide Indicators */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1,
          zIndex: 3,
        }}
      >
        {promotionalSlides.map((_, index) => (
          <Box
            key={index}
            onClick={() => goToSlide(index)}
            sx={{
              width: currentSlide === index ? 24 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: currentSlide === index
                ? theme.palette.brand?.magenta || '#22C55E'
                : 'rgba(255, 255, 255, 0.5)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: currentSlide === index
                  ? theme.palette.brand?.magenta || '#22C55E'
                  : 'rgba(255, 255, 255, 0.8)',
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default PromotionalBanner;

