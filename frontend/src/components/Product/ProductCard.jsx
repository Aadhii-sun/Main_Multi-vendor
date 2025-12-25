import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  Stack,
  Rating,
  IconButton,
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PriceTag from '../Common/PriceTag';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';

const ProductCard = ({ product, onNavigate }) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { items: wish, toggle } = useWishlist();

  const productId = product.id || product._id;
  const productImage = product.image || product.images?.[0] || 'https://via.placeholder.com/300';
  const productName = product.name || product.title || 'Product';
  const productPrice = product.price || 0;
  const productCategory = product.category || 'Uncategorized';
  const productStock = product.stock || product.countInStock || 0;
  const productRating = product.rating || product.averageRating || 0;
  const isInWishlist = wish.some((w) => (w.id || w._id) === productId);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addItem({
      id: productId,
      name: productName,
      price: product.discountPrice || product.originalPrice || productPrice,
      image: productImage,
      countInStock: productStock
    });
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    toggle({
      id: productId,
      name: productName,
      price: productPrice,
      image: productImage
    });
  };

  const handleCardClick = () => {
    if (onNavigate) {
      onNavigate(`/products/${productId}`);
    } else {
      navigate(`/products/${productId}`);
    }
  };

  return (
    <Card
      onClick={handleCardClick}
      sx={{
        width: 220,
        border: '1px solid #e2e2e2',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          transform: 'translateY(-4px)',
          borderColor: '#6366f1'
        }
      }}
    >
      {/* Image Section */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: 180,
          overflow: 'hidden',
          backgroundColor: '#f5f5f5'
        }}
      >
        <CardMedia
          component="img"
          image={productImage}
          alt={productName}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)'
            }
          }}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
          }}
        />
        
        {/* Wishlist Button */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 2
          }}
        >
          <IconButton
            size="small"
            onClick={handleWishlistToggle}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 1)',
                transform: 'scale(1.1)'
              }
            }}
          >
            {isInWishlist ? (
              <FavoriteIcon sx={{ color: 'error.main', fontSize: '1.2rem' }} />
            ) : (
              <FavoriteBorderIcon sx={{ fontSize: '1.2rem' }} />
            )}
          </IconButton>
        </Box>

        {/* Stock Badge */}
        {productStock > 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              zIndex: 2
            }}
          >
            <Chip
              label={`${productStock} In Stock`}
              size="small"
              sx={{
                bgcolor: 'rgba(34, 197, 94, 0.9)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.7rem',
                height: 20
              }}
            />
          </Box>
        )}
      </Box>

      {/* Content Section */}
      <CardContent
        sx={{
          padding: '10px',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Category */}
        <Typography
          variant="caption"
          sx={{
            fontSize: 12,
            color: '#555',
            textTransform: 'uppercase',
            fontWeight: 500,
            letterSpacing: '0.5px',
            mb: 0.5
          }}
        >
          {productCategory}
        </Typography>

        {/* Title */}
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontSize: 14,
            margin: '4px 0 8px',
            fontWeight: 600,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.4,
            minHeight: '2.8em',
            color: '#1a1a1a'
          }}
        >
          {productName}
        </Typography>

        {/* Rating */}
        {productRating > 0 && (
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1 }}>
            <Rating
              value={productRating}
              precision={0.1}
              readOnly
              size="small"
              sx={{ fontSize: '0.875rem' }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              ({productRating.toFixed(1)})
            </Typography>
          </Stack>
        )}

        {/* Price */}
        <Box sx={{ mt: 'auto', mb: 1 }}>
          <PriceTag
            price={productPrice}
            discount={product.discountPrice || product.originalPrice}
            size="sm"
          />
        </Box>
      </CardContent>

      {/* Actions Section */}
      <CardActions
        sx={{
          padding: '10px',
          paddingTop: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        <Button
          fullWidth
          onClick={handleAddToCart}
          disabled={productStock <= 0}
          startIcon={<ShoppingCartIcon />}
          sx={{
            width: '100%',
            padding: '6px 0',
            background: productStock > 0 ? '#ffd814' : '#e2e2e2',
            border: productStock > 0 ? '1px solid #fcd200' : '1px solid #d0d0d0',
            borderRadius: 1,
            color: productStock > 0 ? '#1a1a1a' : '#999',
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '0.875rem',
            cursor: productStock > 0 ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            '&:hover': {
              background: productStock > 0 ? '#fcd200' : '#e2e2e2',
              transform: productStock > 0 ? 'translateY(-1px)' : 'none',
              boxShadow: productStock > 0 ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
            },
            '&:disabled': {
              background: '#e2e2e2',
              color: '#999',
              borderColor: '#d0d0d0'
            }
          }}
        >
          {productStock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;

