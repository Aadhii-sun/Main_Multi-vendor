import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Stack, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from '@mui/icons-material';

// Gallery item model interface
export const GalleriesModel = {
  thumbnail: { url: '', alt: '', format: 'thumbnail' },
  product: { url: '', alt: '', format: 'product' },
  zoom: { url: '', alt: '', format: 'zoom' }
};

const GalleryDetail = ({ galleries = [], thumbsPerView = 3 }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const mainImageRef = useRef(null);
  const thumbnailContainerRef = useRef(null);

  // Ensure selectedIndex is valid
  useEffect(() => {
    if (selectedIndex >= galleries.length) {
      setSelectedIndex(0);
    }
  }, [galleries.length, selectedIndex]);

  const handleThumbnailClick = (index) => {
    setSelectedIndex(index);
    setIsZoomed(false);
  };

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : galleries.length - 1));
    setIsZoomed(false);
  }, [galleries.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev < galleries.length - 1 ? prev + 1 : 0));
    setIsZoomed(false);
  }, [galleries.length]);

  const handleMouseMove = (e) => {
    if (!mainImageRef.current || !isZoomed) return;

    const rect = mainImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    });
  };

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setIsZoomed(false);
    } else if (e.key === 'ArrowLeft') {
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    }
  }, [handlePrev, handleNext]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleImageClick = () => {
    setIsZoomed(!isZoomed);
  };

  if (!galleries || galleries.length === 0) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '500px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f5f5f5',
          borderRadius: 2,
          border: '1px solid #eee'
        }}
      >
        No images available
      </Box>
    );
  }

  const currentGallery = galleries[selectedIndex] || galleries[0];
  const productImage = currentGallery?.product?.url || currentGallery?.zoom?.url || currentGallery?.thumbnail?.url;
  const zoomImage = currentGallery?.zoom?.url || currentGallery?.product?.url || currentGallery?.thumbnail?.url;

  // Calculate thumbnail scroll position
  const thumbnailHeight = 100;
  const visibleThumbnails = thumbsPerView;
  const totalThumbnails = galleries.length;
  const maxScroll = Math.max(0, (totalThumbnails - visibleThumbnails) * thumbnailHeight);

  // Scroll thumbnails to keep selected in view
  useEffect(() => {
    if (thumbnailContainerRef.current) {
      const scrollPosition = Math.min(
        selectedIndex * thumbnailHeight,
        maxScroll
      );
      thumbnailContainerRef.current.scrollTop = scrollPosition;
    }
  }, [selectedIndex, maxScroll]);

  return (
    <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
      {/* Thumbnail Sidebar */}
      {galleries.length > 1 && (
        <Box
          ref={thumbnailContainerRef}
          sx={{
            width: 100,
            maxHeight: 500,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            '&::-webkit-scrollbar': {
              width: '6px'
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '10px'
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '10px',
              '&:hover': {
                background: '#555'
              }
            }
          }}
        >
          {galleries.map((gallery, index) => {
            const thumbnailUrl = gallery?.thumbnail?.url || gallery?.product?.url || gallery?.zoom?.url;
            return (
              <Box
                key={index}
                onClick={() => handleThumbnailClick(index)}
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: 1.5,
                  border: selectedIndex === index ? '3px solid' : '2px solid',
                  borderColor: selectedIndex === index ? 'primary.main' : '#ddd',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  position: 'relative',
                  flexShrink: 0,
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'scale(1.05)'
                  },
                  '& img': {
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }
                }}
              >
                <img
                  src={thumbnailUrl}
                  alt={gallery?.thumbnail?.alt || gallery?.product?.alt || `Thumbnail ${index + 1}`}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/80?text=Image';
                  }}
                />
              </Box>
            );
          })}
        </Box>
      )}

      {/* Main Image Area */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        <Box
          ref={mainImageRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setIsZoomed(false)}
          onClick={handleImageClick}
          sx={{
            width: '100%',
            height: 500,
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 2,
            border: '1px solid #eee',
            bgcolor: '#f5f5f5',
            cursor: isZoomed ? 'zoom-out' : 'zoom-in',
            '& img': {
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              transition: 'transform 0.3s ease'
            }
          }}
        >
          <img
            src={isZoomed ? zoomImage : productImage}
            alt={currentGallery?.product?.alt || currentGallery?.thumbnail?.alt || 'Product image'}
            style={{
              transform: isZoomed
                ? `scale(2) translate(${(50 - zoomPosition.x) * 0.5}%, ${(50 - zoomPosition.y) * 0.5}%)`
                : 'scale(1)',
              transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
            }}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/500?text=Image+Error';
            }}
          />

          {/* Zoom Indicator */}
          {isZoomed && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(0,0,0,0.7)',
                color: 'white',
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                fontSize: '0.875rem'
              }}
            >
              <ZoomOut fontSize="small" />
              Click to zoom out
            </Box>
          )}

          {!isZoomed && galleries.length > 1 && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(0,0,0,0.7)',
                color: 'white',
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                fontSize: '0.875rem'
              }}
            >
              <ZoomIn fontSize="small" />
              Click to zoom
            </Box>
          )}
        </Box>

        {/* Navigation Arrows */}
        {galleries.length > 1 && (
          <>
            <IconButton
              onClick={handlePrev}
              sx={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(255,255,255,0.9)',
                boxShadow: 2,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,1)'
                }
              }}
            >
              <ChevronLeft />
            </IconButton>
            <IconButton
              onClick={handleNext}
              sx={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(255,255,255,0.9)',
                boxShadow: 2,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,1)'
                }
              }}
            >
              <ChevronRight />
            </IconButton>
          </>
        )}

        {/* Image Counter */}
        {galleries.length > 1 && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              left: '50%',
              transform: 'translateX(-50%)',
              bgcolor: 'rgba(0,0,0,0.7)',
              color: 'white',
              px: 2,
              py: 0.5,
              borderRadius: 2,
              fontSize: '0.875rem'
            }}
          >
            {selectedIndex + 1} / {galleries.length}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default GalleryDetail;

