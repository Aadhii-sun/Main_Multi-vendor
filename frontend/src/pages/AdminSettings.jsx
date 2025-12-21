import React from 'react';
import {
  Box,
  Container,
  FormControlLabel,
  Paper,
  Switch,
  TextField,
  Typography,
} from '@mui/material';

const AdminSettings = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Platform Settings
      </Typography>

      <Paper sx={{ p: 4, borderRadius: 3, display: 'grid', gap: 3 }}>
        <TextField
          label="Support Email"
          value="support@example.com"
          helperText="Emails from the assistant will use this address."
          disabled
        />

        <FormControlLabel
          control={<Switch checked disabled />}
          label="Enable chatbot quick suggestions"
        />

        <FormControlLabel
          control={<Switch checked disabled />}
          label="Require OTP for logins"
        />

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Stripe publishable key
          </Typography>
          <TextField
            value="pk_live_****************"
            fullWidth
            disabled
            helperText="Update in environment configuration to change."
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminSettings;

