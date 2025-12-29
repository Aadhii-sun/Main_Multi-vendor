// src/components/Auth/Login.jsx
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


const Login = () => {
  const [step, setStep] = useState('email'); // 'email' or 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState('user');
  const [retrying, setRetrying] = useState(false);
  const navigate = useNavigate();
  const { loginWithOtp, verifyOtp, login } = useAuth();

  const handleSendOTP = async (values, retry = false) => {
    let result;
    try {
      setLoading(true);
      setError('');
      
      // If retrying, previously woke up backend here. Now just set retrying state for UI feedback.
      if (retry) {
        setRetrying(true);
        setError('Retrying... Please wait.');
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRetrying(false);
      }
      
      // For admin, use 'admin' as type, otherwise use the userType
      const loginType = values.userType === 'admin' ? 'admin' : values.userType;
      result = await loginWithOtp(values.email, loginType);
      if (!result.success) {
        const errorMsg = result.error || 'Failed to send OTP';
        // Show the actual error message from the backend or a helpful message
        if (errorMsg.includes('not found') && errorMsg.includes('User')) {
          setError('User not found. Please register first.');
        } else if (errorMsg.includes('restricted') || errorMsg.includes('authorized')) {
          setError('Admin access is restricted. Only authorized administrators can login.');
        } else {
          // Show the actual error message (which now includes helpful context)
          setError(errorMsg);
        }
        return;
      }
      setEmail(values.email);
      setUserType(values.userType);
      setStep('otp');
    } catch (err) {
      const errorMsg = err.message || err.response?.data?.message || 'Failed to send OTP.';
      setError(errorMsg);
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };
  
  const handleRetry = () => {
    if (emailForm.values.email) {
      handleSendOTP(emailForm.values, true);
    }
  };

  const handleAdminLogin = async (values) => {
    try {
      setLoading(true);
      setError('');
      // Check if email matches the allowed admin email
      const ALLOWED_ADMIN_EMAIL = 'adithyananimon9@gmail.com';
      if (values.email.toLowerCase() !== ALLOWED_ADMIN_EMAIL.toLowerCase()) {
        setError('Admin access is restricted. Only authorized administrators can login.');
        return;
      }
      
      const result = await login(values.email, values.password);
      if (result.success) {
        const role = result.user?.role;
        console.log('Admin login - user role:', role);
        
        if (role === 'admin') {
          console.log('✅ Redirecting to ADMIN dashboard');
          navigate('/admin/dashboard', { replace: true });
        } else if (role === 'seller') {
          console.log('✅ Redirecting to SELLER dashboard');
          navigate('/seller/dashboard', { replace: true });
        } else {
          console.log('✅ Redirecting to USER dashboard');
          navigate('/user/dashboard', { replace: true });
        }
      } else {
        const errorMsg = result.error || 'Login failed. Please try again.';
        if (errorMsg.includes('restricted') || errorMsg.includes('authorized')) {
          setError('Admin access is restricted. Only authorized administrators can login.');
        } else {
          setError(errorMsg);
        }
      }
    } catch (err) {
      let errorMsg = err.message || err.response?.data?.message || 'Login failed. Please try again.';
      
      // Better error messages for common issues
      if (err.response?.status === 404) {
        errorMsg = 'Backend server not found. Please make sure the backend is running on http://localhost:5000';
      } else if (err.isNetworkError || errorMsg.includes('Network Error') || errorMsg.includes('ERR_FAILED')) {
        errorMsg = 'Cannot connect to server. Please start the backend server with: npm start (in backend folder)';
      } else if (errorMsg.includes('timeout')) {
        errorMsg = 'Request timeout. Please check if the backend server is running.';
      } else if (errorMsg.includes('restricted') || errorMsg.includes('authorized')) {
        errorMsg = 'Admin access is restricted. Only authorized administrators can login.';
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (values) => {
    try {
      setLoading(true);
      setError('');
      // For admin, use 'admin' as type, otherwise use the userType
      const loginType = userType === 'admin' ? 'admin' : userType;
      const result = await verifyOtp(email, values.otp, loginType);
      if (!result.success) {
        const errorMsg = result.error || 'Invalid OTP';
        if (errorMsg.includes('restricted') || errorMsg.includes('authorized')) {
          setError('Admin access is restricted. Only authorized administrators can login.');
        } else {
          setError(errorMsg);
        }
        return;
      }

      // Get role from the API response
      const role = result.user?.role;
      
      // Debug logging
      console.log('=== OTP VERIFY DEBUG ===');
      console.log('Result.user:', result.user);
      console.log('User role from API:', role);
      console.log('========================');
      
      // Ensure we have a valid role
      if (!role) {
        setError('Unable to determine user role. Please try again.');
        return;
      }
      
      // Normalize the role (case-insensitive)
      const normalizedRole = String(role).toLowerCase().trim();
      
      console.log('Normalized role:', normalizedRole);
      
      // Route based on role - use navigate instead of window.location.href
      // This ensures AuthContext state is properly updated before navigation
      if (normalizedRole === 'admin') {
        console.log('✅ Redirecting to ADMIN dashboard');
        navigate('/admin/dashboard', { replace: true });
      } else if (normalizedRole === 'seller') {
        console.log('✅ Redirecting to SELLER dashboard');
        navigate('/seller/dashboard', { replace: true });
      } else if (normalizedRole === 'user') {
        console.log('✅ Redirecting to USER dashboard');
        navigate('/user/dashboard', { replace: true });
      } else {
        console.log('❓ Unknown role:', normalizedRole);
        navigate('/user/dashboard', { replace: true });
      }
    } catch (err) {
      const errorMsg = err.message || err.response?.data?.message || 'Invalid OTP';
      if (errorMsg.includes('restricted') || errorMsg.includes('authorized')) {
        setError('Admin access is restricted. Only authorized administrators can login.');
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const emailForm = useFormik({
    initialValues: {
      email: '',
      userType: 'user',
      password: '', // For admin password login
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email').required('Required'),
      userType: Yup.string().oneOf(['user', 'seller', 'admin'], 'Invalid user type'),
      password: Yup.string().when('userType', {
        is: 'admin',
        then: (schema) => schema.notRequired(), // Admin can use either OTP or password
        otherwise: (schema) => schema.notRequired(),
      }),
    }),
    onSubmit: (values) => {
      // If admin and password is provided, use password login
      // Otherwise, use OTP login (works for admin too)
      if (values.userType === 'admin' && values.password) {
        handleAdminLogin(values);
      } else {
        handleSendOTP(values);
      }
    },
  });

  const otpForm = useFormik({
    initialValues: {
      otp: '',
    },
    validationSchema: Yup.object({
      otp: Yup.string().length(6, 'Must be 6 digits').required('Required'),
    }),
    onSubmit: handleVerifyOTP,
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
            {step === 'email' 
              ? (emailForm.values.userType === 'admin' ? 'Admin Login' : 'Login')
              : 'Verify OTP'
            }
          </Typography>

        {error && (
          <Alert 
            severity="error" 
            action={
              (error.includes('waking up') || error.includes('Backend is')) && step === 'email' ? (
                <Button
                  color="inherit"
                  size="small"
                  onClick={handleRetry}
                  disabled={loading || retrying}
                  sx={{ 
                    color: '#fff',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                >
                  {retrying ? 'Waking up...' : 'Retry'}
                </Button>
              ) : null
            }
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
              {retrying ? '⏳ Waking up backend...' : `❌ ${error}`}
            </Typography>
          </Alert>
        )}

        {step === 'email' ? (
          <form onSubmit={emailForm.handleSubmit} autoComplete="on">
            <FormControl fullWidth margin="normal" variant="filled">
              <InputLabel id="user-type-label" htmlFor="userType">Login As</InputLabel>
              <Select
                labelId="user-type-label"
                id="userType"
                name="userType"
                value={emailForm.values.userType}
                label="Login As"
                inputProps={{
                  'aria-label': 'Select user type',
                }}
                onChange={(e) => {
                  emailForm.handleChange(e);
                  setStep('email'); // Reset to email step when changing user type
                }}
                error={emailForm.touched.userType && Boolean(emailForm.errors.userType)}
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
              {emailForm.touched.userType && emailForm.errors.userType && (
                <FormHelperText error>{emailForm.errors.userType}</FormHelperText>
              )}
            </FormControl>

            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email"
              type="email"
              autoComplete="email"
              margin="normal"
              variant="filled"
              value={emailForm.values.email}
              onChange={emailForm.handleChange}
              onBlur={emailForm.handleBlur}
              error={emailForm.touched.email && Boolean(emailForm.errors.email)}
              helperText={emailForm.touched.email && emailForm.errors.email}
              inputProps={{
                'aria-label': 'Email address',
              }}
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

            {emailForm.values.userType === 'admin' && (
              <>
                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  label="Password (Optional - Leave empty for OTP login)"
                  type="password"
                  autoComplete="current-password"
                  margin="normal"
                  variant="filled"
                  value={emailForm.values.password}
                  onChange={emailForm.handleChange}
                  onBlur={emailForm.handleBlur}
                  error={emailForm.touched.password && Boolean(emailForm.errors.password)}
                  helperText={emailForm.touched.password ? emailForm.errors.password : 'Leave empty to use OTP login'}
                  inputProps={{
                    'aria-label': 'Password',
                  }}
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
                      color: '#666',
                    },
                  }}
                />
                <Typography variant="body2" sx={{ mb: 1, color: 'rgba(255,255,255,0.7)', mt: 1 }}>
                  💡 Or leave password empty and click "Send OTP" to login with OTP
                </Typography>
              </>
            )}

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
              {loading 
                ? (emailForm.values.userType === 'admin' && emailForm.values.password ? '⏳ Logging in...' : '⏳ Sending OTP...') 
                : (emailForm.values.userType === 'admin' && emailForm.values.password ? '🔓 Login' : '📧 Send OTP')
              }
            </Button>

            <Box textAlign="center" mt={2} sx={{ color: 'rgba(255,255,255,0.75)' }}>
              <Box mt={1}>
                <span>Don't have an account? </span>
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/register');
                  }}
                  sx={{ 
                    color: 'rgba(255,255,255,0.9)',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  Register
                </Link>
              </Box>
            </Box>
          </form>
        ) : (
          <form onSubmit={otpForm.handleSubmit} autoComplete="on">
            <Alert 
              severity="info" 
              sx={{ 
                mb: 3,
                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                border: '1px solid #1976d2',
                color: '#1976d2',
                '& .MuiAlert-icon': {
                  color: '#1976d2',
                },
              }}
            >
              📬 We've sent a 6-digit OTP to <strong>{email}</strong>
            </Alert>

            <TextField
              fullWidth
              id="otp"
              name="otp"
              label="Enter 6-digit OTP"
              type="text"
              autoComplete="one-time-code"
              margin="normal"
              variant="filled"
              value={otpForm.values.otp}
              onChange={otpForm.handleChange}
              onBlur={otpForm.handleBlur}
              error={otpForm.touched.otp && Boolean(otpForm.errors.otp)}
              helperText={otpForm.touched.otp && otpForm.errors.otp}
              inputProps={{ 
                maxLength: 6,
                'aria-label': 'One-time password code',
                inputMode: 'numeric',
                pattern: '[0-9]*'
              }}
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
              {loading ? '⏳ Verifying...' : '✅ Verify OTP'}
            </Button>

            <Box textAlign="center">
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setStep('email');
                  setError(''); // Clear error when going back
                }}
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  textDecoration: 'none',
                  '&:hover': { 
                    textDecoration: 'underline',
                  },
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                ← Back to Login
              </Link>
            </Box>
          </form>
        )}
        </Box>
      </Box>
    </Box>
  );
};

export default Login;