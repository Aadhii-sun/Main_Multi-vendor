import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Rating,
  TextField,
  Button,
  Stack,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Chip
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProductReviews, addProductReview, updateProductReview, deleteProductReview } from '../../services/reviews';
import { useAuth } from '../../contexts/AuthContext';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VerifiedIcon from '@mui/icons-material/Verified';

const ProductReviews = ({ productId, averageRating, reviewCount }) => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [editingReview, setEditingReview] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ['reviews', productId, page],
    queryFn: () => getProductReviews(productId, page, 10),
    enabled: !!productId
  });

  const addReviewMutation = useMutation({
    mutationFn: ({ rating, comment }) => addProductReview(productId, rating, comment),
    onSuccess: () => {
      queryClient.invalidateQueries(['reviews', productId]);
      queryClient.invalidateQueries(['product', productId]);
      setReviewForm({ rating: 5, comment: '' });
    }
  });

  const updateReviewMutation = useMutation({
    mutationFn: ({ reviewId, rating, comment }) => updateProductReview(productId, reviewId, rating, comment),
    onSuccess: () => {
      queryClient.invalidateQueries(['reviews', productId]);
      queryClient.invalidateQueries(['product', productId]);
      setEditingReview(null);
      setReviewForm({ rating: 5, comment: '' });
    }
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId) => deleteProductReview(productId, reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries(['reviews', productId]);
      queryClient.invalidateQueries(['product', productId]);
      setAnchorEl(null);
      setSelectedReview(null);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please login to submit a review');
      return;
    }

    if (editingReview) {
      updateReviewMutation.mutate({
        reviewId: editingReview._id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
    } else {
      addReviewMutation.mutate({
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setReviewForm({ rating: review.rating, comment: review.comment });
    setAnchorEl(null);
    setSelectedReview(null);
  };

  const handleDelete = () => {
    if (selectedReview) {
      deleteReviewMutation.mutate(selectedReview._id);
    }
  };

  const handleMenuOpen = (event, review) => {
    setAnchorEl(event.currentTarget);
    setSelectedReview(review);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedReview(null);
  };

  const userReview = reviewsData?.reviews?.find(
    r => r.user?._id === currentUser?._id || r.user === currentUser?._id
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5">Customer Reviews</Typography>
        {averageRating > 0 && (
          <Stack direction="row" spacing={1} alignItems="center">
            <Rating value={averageRating} readOnly precision={0.1} />
            <Typography variant="body2" color="text.secondary">
              {averageRating.toFixed(1)} ({reviewCount || 0} reviews)
            </Typography>
          </Stack>
        )}
      </Stack>

      {/* Review Form */}
      {currentUser && !userReview && !editingReview && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>Write a Review</Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2">Your Rating:</Typography>
                <Rating
                  value={reviewForm.rating}
                  onChange={(_, value) => setReviewForm({ ...reviewForm, rating: value })}
                />
              </Stack>
              <TextField
                label="Your Review"
                multiline
                rows={4}
                fullWidth
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                required
              />
              <Button
                type="submit"
                variant="contained"
                disabled={addReviewMutation.isLoading}
              >
                {addReviewMutation.isLoading ? 'Submitting...' : 'Submit Review'}
              </Button>
            </Stack>
          </Box>
        </Paper>
      )}

      {/* Edit Review Form */}
      {editingReview && (
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'action.hover' }}>
          <Typography variant="h6" gutterBottom>Edit Your Review</Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2">Your Rating:</Typography>
                <Rating
                  value={reviewForm.rating}
                  onChange={(_, value) => setReviewForm({ ...reviewForm, rating: value })}
                />
              </Stack>
              <TextField
                label="Your Review"
                multiline
                rows={4}
                fullWidth
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                required
              />
              <Stack direction="row" spacing={2}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={updateReviewMutation.isLoading}
                >
                  {updateReviewMutation.isLoading ? 'Updating...' : 'Update Review'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setEditingReview(null);
                    setReviewForm({ rating: 5, comment: '' });
                  }}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Paper>
      )}

      {/* Reviews List */}
      {reviewsData?.reviews?.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No reviews yet. Be the first to review this product!
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={3}>
          {reviewsData?.reviews?.map((review) => {
            const isOwner = currentUser && (
              review.user?._id === currentUser._id || review.user === currentUser._id
            );
            
            return (
              <Paper key={review._id} sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {review.user?.name || 'Anonymous'}
                      </Typography>
                      {review.isVerified && (
                        <Chip
                          icon={<VerifiedIcon />}
                          label="Verified Purchase"
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Rating value={review.rating} readOnly size="small" />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </Typography>
                    </Stack>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {review.comment}
                    </Typography>
                  </Box>
                  {isOwner && (
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, review)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  )}
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}

      {/* Menu for Edit/Delete */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleEdit(selectedReview)}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      {/* Pagination */}
      {reviewsData?.pagination && reviewsData.pagination.totalPages > 1 && (
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
          <Button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
            Page {page} of {reviewsData.pagination.totalPages}
          </Typography>
          <Button
            disabled={page >= reviewsData.pagination.totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </Stack>
      )}

      {addReviewMutation.isError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {addReviewMutation.error?.response?.data?.message || 'Failed to submit review'}
        </Alert>
      )}
    </Box>
  );
};

export default ProductReviews;








