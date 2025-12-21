import React from 'react';
import {
  Box,
  Button,
  Container,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';

const sampleCategories = ['Audio', 'Smart Home', 'Accessories'];

const AdminCategories = () => {
  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Categories</Typography>
        <Button variant="contained" disabled>
          Add Category
        </Button>
      </Box>

      <Paper>
        <List>
          {sampleCategories.map((category) => (
            <ListItem key={category} divider>
              <ListItemText primary={category} secondary="Products: coming soon" />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
};

export default AdminCategories;

