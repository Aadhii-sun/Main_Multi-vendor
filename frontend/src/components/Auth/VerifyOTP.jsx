import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext.jsx';

const VerifyOTP = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const { verifyOtp, loginWithOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email from location state or query params
  const searchParams = new URLSearchParams(location.search);
  const email = location.state?.email || searchParams.get('email') || '';
  const userType = location.state?.userType || searchParams.get('type') || 'user';

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  useEffect(() => {
    let timer;
    if (resendDisabled && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [countdown, resendDisabled]);

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      setError('');
      await loginWithOtp(email, userType);
      setResendDisabled(true);
      setCountdown(30);
    } catch (err) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      otp: '',
    },
    validationSchema: Yup.object({
      otp: Yup.string()
        .length(6, 'OTP must be 6 digits')
        .matches(/^\d+$/, 'OTP must contain only numbers')
        .required('OTP is required'),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError('');
        const result = await verifyOtp(email, values.otp, userType);
        if (result?.success) {
          const role = result.user?.role || JSON.parse(localStorage.getItem('user') || '{}')?.role;
          if (role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/dashboard');
          }
        }
      } catch (err) {
        setError(err.message || 'Invalid OTP. Please try again.');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: '#f5f5f5',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" component="h1" align="center" gutterBottom>
          Verify OTP
        </Typography>
        <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
          We've sent a verification code to {email}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            id="otp"
            name="otp"
            label="Enter OTP"
            type="text"
            inputProps={{ maxLength: 6, inputMode: 'numeric' }}
            value={formik.values.otp}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.otp && Boolean(formik.errors.otp)}
            helperText={formik.touched.otp && formik.errors.otp}
            margin="normal"
            variant="outlined"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ mt: 2, mb: 2, py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Didn't receive the code?{' '}
              <Link
                component="button"
                type="button"
                onClick={handleResendOTP}
                disabled={resendDisabled || loading}
                underline="none"
                sx={{ cursor: resendDisabled ? 'not-allowed' : 'pointer' }}
              >
                {resendDisabled ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default VerifyOTP;
