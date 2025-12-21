import { createTheme } from '@mui/material/styles';

const brandColors = {
  // Dark base inspired by the reference hero
  blush: '#020617', // page background (slate-950)
  petal: '#020617', // main surface
  plum: '#6366F1', // indigo accent
  magenta: '#22C55E', // neon green primary accent
  lavender: '#0EA5E9', // cyan/teal accent
  midnight: '#F9FAFB', // primary text (near white)
  charcoal: '#9CA3AF', // secondary text
};

const sellerColors = {
  clay: '#111827', // deep slate card background
  sand: '#020617', // dark page background
  teal: '#0EA5E9', // cyan for seller charts
  amber: '#FBBF24', // warm highlight
  slate: '#E5E7EB', // light text on dark
};

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: brandColors.magenta,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: brandColors.plum,
      contrastText: '#FFFFFF',
    },
    background: {
      default: brandColors.blush,
      paper: sellerColors.clay,
    },
    text: {
      primary: brandColors.midnight,
      secondary: brandColors.charcoal,
    },
    info: {
      main: sellerColors.teal,
    },
    success: {
      main: '#65B891',
    },
    error: {
      main: '#F06292',
    },
    warning: {
      main: '#FFB74D',
    },
    brand: {
      ...brandColors,
    },
    seller: {
      ...sellerColors,
      gradient: 'radial-gradient(circle at 0% 0%, #22C55E11 0, transparent 55%), radial-gradient(circle at 80% 0%, #0EA5E922 0, transparent 60%), linear-gradient(135deg, #020617 0%, #020617 60%, #020617 100%)',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Inter", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Baloo 2", "Poppins", sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: '"Baloo 2", "Poppins", sans-serif',
      fontWeight: 700,
    },
    h3: {
      fontFamily: '"Baloo 2", "Poppins", sans-serif',
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 20,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage:
            'radial-gradient(circle at top left, rgba(56,189,248,0.18), transparent 55%), radial-gradient(circle at 80% 0%, rgba(129,140,248,0.25), transparent 60%), linear-gradient(135deg, #020617 0%, #020617 60%, #020617 100%)',
          minHeight: '100vh',
        },
        '*, *::before, *::after': {
          boxSizing: 'border-box',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: 24,
          paddingBlock: 10,
        },
        containedSecondary: {
          boxShadow: '0 10px 20px rgba(100, 32, 170, 0.2)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(15, 23, 42, 0.96)',
          boxShadow: '0 18px 45px rgba(15,23,42,0.9)',
          color: brandColors.midnight,
          backdropFilter: 'blur(12px)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 24,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 28,
        },
      },
    },
  },
});

export default theme;

