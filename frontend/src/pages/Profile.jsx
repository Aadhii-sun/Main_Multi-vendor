import React, { useEffect, useState } from 'react';
import { Avatar, Box, Button, Container, Grid, Paper, TextField, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../services/api';

const Profile = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (currentUser) {
      setForm({ name: currentUser.name || '', email: currentUser.email || '', password: '' });
    }
  }, [currentUser]);

  const onSave = async () => {
    if (!currentUser?._id) return;
    try {
      setSaving(true);
      setMsg('');
      const payload = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;
      const { data } = await api.put(`/users/${currentUser._id}`, payload);
      setCurrentUser?.((prev) => ({ ...prev, ...data }));
      setMsg('Profile updated');
      setForm((f) => ({ ...f, password: '' }));
    } catch (e) {
      setMsg(e.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>

      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 96, height: 96, bgcolor: 'primary.main', fontSize: 32 }}>
                {currentUser?.name?.[0]?.toUpperCase() || 'U'}
              </Avatar>
              <Typography variant="h6">{currentUser?.name || 'Your Name'}</Typography>
              <Typography color="text.secondary">{currentUser?.email}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField label="Full Name" fullWidth value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})}/>
              </Grid>
              <Grid item xs={12}>
                <TextField label="Email" fullWidth value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})}/>
              </Grid>
              <Grid item xs={12}>
                <TextField label="Role" fullWidth value={currentUser?.role || 'user'} disabled/>
              </Grid>
              <Grid item xs={12}>
                <TextField label="New Password" type="password" fullWidth value={form.password} onChange={(e)=>setForm({...form, password:e.target.value})}/>
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Typography color="success.main">{msg}</Typography>
              <Button variant="contained" color="primary" disabled={saving} onClick={onSave}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Profile;

