import React, { useState } from 'react';
import { Container, Typography, Grid, Paper, Stack, TextField, Button, Box } from '@mui/material';
import { readAddresses, writeAddresses } from '../utils/addressBook';
import { saveAddress } from '../utils/localOrders';

const Addresses = () => {
  const [items, setItems] = useState(readAddresses());
  const [form, setForm] = useState({ id: '', name: '', line1: '', city: '', country: '' });

  const reset = () => setForm({ id: '', name: '', line1: '', city: '', country: '' });

  const submit = (e) => {
    e.preventDefault();
    const id = form.id || `ADDR-${Date.now()}`;
    const next = form.id ? items.map((a) => (a.id === form.id ? { ...form, id } : a)) : [{ ...form, id }, ...items];
    setItems(next);
    writeAddresses(next);
    reset();
  };

  const edit = (a) => setForm(a);
  const remove = (id) => {
    const next = items.filter((a) => a.id !== id);
    setItems(next);
    writeAddresses(next);
    if (form.id === id) reset();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
      <Typography variant="h4" gutterBottom>Address Book</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3 }} component="form" onSubmit={submit}>
            <Stack spacing={2}>
              <TextField label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <TextField label="Address Line 1" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} required />
              <TextField label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
              <TextField label="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required />
              <Stack direction="row" spacing={2}>
                <Button type="submit" variant="contained">{form.id ? 'Update' : 'Add'}</Button>
                {form.id && <Button onClick={reset}>Cancel</Button>}
              </Stack>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            {items.map((a) => (
              <Grid item xs={12} sm={6} key={a.id}>
                <Paper sx={{ p: 2, borderRadius: 3 }}>
                  <Typography fontWeight={600}>{a.name}</Typography>
                  <Typography color="text.secondary">{a.line1}, {a.city}, {a.country}</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Button size="small" onClick={() => edit(a)}>Edit</Button>
                    <Button size="small" color="error" onClick={() => remove(a.id)}>Delete</Button>
                    <Button size="small" variant="outlined" onClick={() => saveAddress(a)}>Use at checkout</Button>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Addresses;


