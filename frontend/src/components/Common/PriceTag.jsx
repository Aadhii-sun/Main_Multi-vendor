import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Animated price tag that supports an optional discount price.
 * - If `discount` is provided and lower than `price`, animates from old -> new.
 * - Usage: <PriceTag price={199.99} discount={149.99} />
 */
const PriceTag = ({ price, discount, size = 'md' }) => {
  const [animate, setAnimate] = useState(false);
  const isDiscount = typeof discount === 'number' && discount > 0 && discount < price;

  useEffect(() => {
    if (isDiscount) {
      // trigger one-shot pulse animation when discount available
      setAnimate(true);
      const t = setTimeout(() => setAnimate(false), 700);
      return () => clearTimeout(t);
    }
  }, [isDiscount, price, discount]);

  const fontSize = size === 'lg' ? 28 : size === 'sm' ? 16 : 20;
  const oldFont = size === 'lg' ? 16 : 14;

  return (
    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
      {isDiscount ? (
        <>
          <Typography
            component="span"
            sx={{
              color: 'text.secondary',
              textDecoration: 'line-through',
              fontSize: oldFont,
              opacity: 0.8,
            }}
          >
            ${Number(price).toFixed(2)}
          </Typography>
          <Typography
            component="span"
            sx={{
              fontWeight: 700,
              fontSize,
              color: 'primary.main',
              ...(animate && {
                animation: 'pricePulse 0.7s ease',
              }),
              '@keyframes pricePulse': {
                '0%': { transform: 'scale(0.9)', opacity: 0.6 },
                '60%': { transform: 'scale(1.06)', opacity: 1 },
                '100%': { transform: 'scale(1)', opacity: 1 },
              },
            }}
          >
            ${Number(discount).toFixed(2)}
          </Typography>
        </>
      ) : (
        <Typography component="span" sx={{ fontWeight: 700, fontSize }}>
          ${Number(price).toFixed(2)}
        </Typography>
      )}
    </Box>
  );
};

export default PriceTag;











