import React from 'react';
import { Box, Skeleton, Card, CardContent, Stack } from '@mui/material';

// Product Card Skeleton
export const ProductCardSkeleton = () => (
  <Card sx={{ height: '480px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
    <Skeleton variant="rectangular" height={240} />
    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Skeleton variant="text" width="80%" height={24} />
      <Skeleton variant="text" width="60%" height={20} sx={{ mt: 1 }} />
      <Box sx={{ flexGrow: 1 }} />
      <Skeleton variant="rectangular" width="100%" height={36} sx={{ mt: 2, borderRadius: 1 }} />
    </CardContent>
  </Card>
);

// Product Grid Skeleton
export const ProductGridSkeleton = ({ count = 4 }) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </>
);

// Order Card Skeleton
export const OrderCardSkeleton = () => (
  <Card sx={{ p: 2, mb: 2 }}>
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Skeleton variant="text" width={200} height={28} />
        <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 1 }} />
      </Stack>
      <Skeleton variant="text" width="60%" height={20} />
      <Skeleton variant="rectangular" width="100%" height={80} sx={{ borderRadius: 1 }} />
    </Stack>
  </Card>
);

// Review Skeleton
export const ReviewSkeleton = () => (
  <Box sx={{ p: 2, mb: 2 }}>
    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
      <Skeleton variant="circular" width={40} height={40} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="40%" height={20} />
        <Skeleton variant="text" width="30%" height={16} />
      </Box>
    </Stack>
    <Skeleton variant="text" width="100%" height={16} />
    <Skeleton variant="text" width="80%" height={16} />
  </Box>
);

// Table Skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <Stack key={rowIndex} direction="row" spacing={2} sx={{ p: 2 }}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} variant="text" width="100%" height={24} />
        ))}
      </Stack>
    ))}
  </>
);

// Dashboard Stats Skeleton
export const DashboardStatsSkeleton = () => (
  <Stack direction="row" spacing={2}>
    {Array.from({ length: 4 }).map((_, index) => (
      <Card key={index} sx={{ flex: 1, p: 2 }}>
        <Skeleton variant="text" width="60%" height={20} />
        <Skeleton variant="text" width="40%" height={32} sx={{ mt: 1 }} />
      </Card>
    ))}
  </Stack>
);



