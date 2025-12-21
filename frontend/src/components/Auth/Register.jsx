// src/components/Auth/Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Link,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext.jsx';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();

  const handleSubmit = async (values) => {
    // Admin registration is not available through this form
    if (values.userType === 'admin') {
      setError('Admin registration is not available. Please contact an administrator or use Admin Login.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      const result = await registerUser(values);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      userType: 'user',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Required'),
      email: Yup.string().email('Invalid email').required('Required'),
      password: Yup.string()
        .min(6, 'Must be at least 6 characters')
        .required('Required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Required'),
      userType: Yup.string()
        .oneOf(['user', 'seller', 'admin'], 'Invalid user type')
        .required('Required'),
    }),
    onSubmit: handleSubmit,
  });

  const heroSrc = '/Black White Minimal Simple Modern Creative Studio Ego Logo.png';

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' } }}>
      <Box
        sx={{
          position: 'relative',
          display: 'block',
          height: { xs: '40vh', md: '100vh' },
          overflow: 'hidden',
          borderRadius: { xs: 0, md: 2 },
        }}
      >
        <Box
          component="img"
          src={heroSrc}
          alt="EGO Store hero"
          sx={{
            position: 'absolute',
            inset: 0,
            maxWidth: '100%',
            maxHeight: '100%',
            margin: 'auto',
            objectFit: 'contain',
            display: 'block',
            background:
              'radial-gradient(circle at top, #111827 0, #020617 45%)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at 20% 20%, rgba(0,0,0,0.20), transparent 55%)',
          }}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: { xs: 'transparent', md: (theme) => theme.palette.seller.slate },
          p: { xs: 0, sm: 2, md: 6 },
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 520,
            bgcolor: 'rgba(17, 24, 39, 0.85)',
            borderRadius: { xs: 2, md: 3 },
            p: { xs: 2, sm: 3, md: 4 },
            boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
            mx: 'auto',
            mt: { xs: 2, md: 0 },
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            align="left"
            sx={{ color: '#fff', mb: { xs: 2, md: 3 }, fontSize: { xs: '1.6rem', sm: '1.8rem', md: '2rem' } }}
          >
            Register
          </Typography>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
              backgroundColor: 'rgba(211, 47, 47, 0.1)',
              border: '1px solid #d32f2f',
              color: '#d32f2f',
              '& .MuiAlert-icon': {
                color: '#d32f2f',
              },
              animation: 'slideDown 0.3s ease-out',
              '@keyframes slideDown': {
                from: {
                  opacity: 0,
                  transform: 'translateY(-10px)',
                },
                to: {
                  opacity: 1,
                  transform: 'translateY(0)',
                },
              },
            }}
          >
            <Typography sx={{ fontWeight: 500, fontSize: '0.95rem' }}>
              ❌ {error}
            </Typography>
          </Alert>
        )}

        {success ? (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 2,
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              border: '1px solid #4caf50',
              color: '#2e7d32',
              '& .MuiAlert-icon': {
                color: '#4caf50',
              },
              animation: 'slideDown 0.3s ease-out',
            }}
          >
            <Typography sx={{ fontWeight: 500, fontSize: '0.95rem' }}>
              ✅ Registration successful! Redirecting to login...
            </Typography>
          </Alert>
        ) : (
          <form onSubmit={formik.handleSubmit}>
            <FormControl fullWidth margin="normal" variant="filled">
              <InputLabel id="user-type-label">Register As</InputLabel>
              <Select
                labelId="user-type-label"
                id="userType"
                name="userType"
                value={formik.values.userType}
                label="Register As"
                onChange={formik.handleChange}
                error={formik.touched.userType && Boolean(formik.errors.userType)}
                sx={{
                  color: '#1a1a1a',
                  backgroundColor: '#ffffff',
                  border: '2px solid #e0e0e0',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },
                  '& .MuiInputBase-input': {
                    color: '#1a1a1a',
                  },
                }}
              >
                <MenuItem value="user">👤 User</MenuItem>
                <MenuItem value="seller">🏪 Seller</MenuItem>
                <MenuItem value="admin">⚙️ Admin</MenuItem>
              </Select>
              {formik.touched.userType && formik.errors.userType && (
                <FormHelperText error>{formik.errors.userType}</FormHelperText>
              )}
            </FormControl>

            <TextField
              fullWidth
              id="name"
              name="name"
              label="Full Name"
              margin="normal"
              variant="filled"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              sx={{
                '& .MuiFilledInput-root': {
                  backgroundColor: '#ffffff',
                  color: '#1a1a1a',
                  border: '2px solid #e0e0e0',
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: '#ffffff',
                    borderColor: '#6366f1',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#ffffff',
                    borderColor: '#4f46e5',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  color: '#1a1a1a',
                },
                '& .MuiInputLabel-root': {
                  color: '#1a1a1a',
                },
                '& .MuiFormHelperText-root': {
                  color: '#d32f2f',
                },
              }}
            />

            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email"
              type="email"
              margin="normal"
              variant="filled"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              sx={{
                '& .MuiFilledInput-root': {
                  backgroundColor: '#ffffff',
                  color: '#1a1a1a',
                  border: '2px solid #e0e0e0',
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: '#ffffff',
                    borderColor: '#6366f1',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#ffffff',
                    borderColor: '#4f46e5',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  color: '#1a1a1a',
                },
                '& .MuiInputLabel-root': {
                  color: '#1a1a1a',
                },
                '& .MuiFormHelperText-root': {
                  color: '#d32f2f',
                },
              }}
            />

            <TextField
              fullWidth
              id="password"
              name="password"
              label="Password (Min. 6 characters)"
              type="password"
              margin="normal"
              variant="filled"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              sx={{
                '& .MuiFilledInput-root': {
                  backgroundColor: '#ffffff',
                  color: '#1a1a1a',
                  border: '2px solid #e0e0e0',
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: '#ffffff',
                    borderColor: '#6366f1',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#ffffff',
                    borderColor: '#4f46e5',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  color: '#1a1a1a',
                },
                '& .MuiInputLabel-root': {
                  color: '#1a1a1a',
                },
                '& .MuiFormHelperText-root': {
                  color: '#d32f2f',
                },
              }}
            />

            <TextField
              fullWidth
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              margin="normal"
              variant="filled"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.confirmPassword &&
                Boolean(formik.errors.confirmPassword)
              }
              helperText={
                formik.touched.confirmPassword && formik.errors.confirmPassword
              }
              sx={{
                '& .MuiFilledInput-root': {
                  backgroundColor: '#ffffff',
                  color: '#1a1a1a',
                  border: '2px solid #e0e0e0',
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: '#ffffff',
                    borderColor: '#6366f1',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#ffffff',
                    borderColor: '#4f46e5',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  color: '#1a1a1a',
                },
                '& .MuiInputLabel-root': {
                  color: '#1a1a1a',
                },
                '& .MuiFormHelperText-root': {
                  color: '#d32f2f',
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ 
                mt: 3, 
                mb: 2,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                transition: 'all 0.3s ease',
                '&:hover:not(:disabled)': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)',
                },
                '&:disabled': {
                  opacity: 0.7,
                },
              }}
            >
              {loading ? '⏳ Creating account...' : '✨ Create Account'}
            </Button>

            <Box textAlign="center" sx={{ color: 'rgba(255,255,255,0.75)' }}>
              {formik.values.userType === 'admin' && (
                <Box mb={2}>
                  <Alert 
                    severity="info" 
                    sx={{ 
                      mb: 2, 
                      bgcolor: 'rgba(33, 150, 243, 0.1)',
                      border: '1px solid #2196f3',
                      color: '#1565c0',
                      '& .MuiAlert-icon': {
                        color: '#2196f3',
                      },
                    }}
                  >
                    <Typography sx={{ fontSize: '0.9rem' }}>
                      ℹ️ Admin accounts are created by administrators. If you're an admin, please use{' '}
                      <Link
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate('/login');
                        }}
                        sx={{ 
                          color: '#1565c0',
                          textDecoration: 'underline',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                        }}
                      >
                        Admin Login
                      </Link>
                      {' '}instead.
                    </Typography>
                  </Alert>
                </Box>
              )}
              <Box mt={1}>
                <span>Already have an account? </span>
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/login');
                  }}
                  sx={{ 
                    color: 'rgba(255,255,255,0.9)',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  Login
                </Link>
              </Box>
            </Box>
          </form>
        )}
        </Box>
      </Box>
    </Box>
  );
};

export default Register;