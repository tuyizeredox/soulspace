import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Paper,
  TextField,
  useTheme,
  alpha,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Delete as DeleteIcon,
  ShoppingCart as CartIcon,
  CreditCard as CreditCardIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ShoppingCartPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // State variables
  const [cartItems, setCartItems] = useState([
    {
      id: 'soulwatch-pro',
      name: 'SoulWatch Pro',
      price: 299.99,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=1000'
    }
  ]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = 9.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;
  
  // Remove item from cart
  const handleRemoveItem = (itemId) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
    setSnackbar({
      open: true,
      message: 'Item removed from cart',
      severity: 'info'
    });
  };
  
  // Update quantity
  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(cartItems.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
  };
  
  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  // Checkout
  const handleCheckout = () => {
    setSnackbar({
      open: true,
      message: 'Processing your order...',
      severity: 'info'
    });
    
    // Simulate checkout process
    setTimeout(() => {
      setSnackbar({
        open: true,
        message: 'Order placed successfully!',
        severity: 'success'
      });
      
      // Clear cart and redirect after successful checkout
      setTimeout(() => {
        setCartItems([]);
        navigate('/patient/dashboard');
      }, 2000);
    }, 2000);
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
          Your Shopping Cart
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Review your items and proceed to checkout
        </Typography>
      </Box>
      
      {cartItems.length === 0 ? (
        <Paper
          elevation={0}
          sx={{ 
            p: 4, 
            borderRadius: 3, 
            textAlign: 'center',
            bgcolor: alpha(theme.palette.background.paper, 0.7),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }}
        >
          <CartIcon sx={{ fontSize: 60, color: alpha(theme.palette.text.secondary, 0.5), mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Looks like you haven't added any items to your cart yet.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/shop/wearables')}
            sx={{ 
              mt: 2,
              borderRadius: 2, 
              textTransform: 'none'
            }}
          >
            Browse Wearable Devices
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={4}>
          {/* Cart Items */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{ 
                borderRadius: 3, 
                overflow: 'hidden',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
              }}
            >
              <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <Typography variant="h6" fontWeight={600}>
                  Cart Items ({cartItems.length})
                </Typography>
              </Box>
              <Divider />
              <List disablePadding>
                {cartItems.map((item) => (
                  <React.Fragment key={item.id}>
                    <ListItem sx={{ py: 2, px: 3 }}>
                      <ListItemAvatar>
                        <Avatar
                          src={item.image}
                          alt={item.name}
                          variant="rounded"
                          sx={{ width: 80, height: 80, mr: 2, borderRadius: 2 }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" fontWeight={600}>
                            {item.name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Unit Price: ${item.price.toFixed(2)}
                          </Typography>
                        }
                        sx={{ mr: 2 }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value))}
                          InputProps={{ inputProps: { min: 1 } }}
                          size="small"
                          sx={{ width: 60, mr: 2 }}
                        />
                        <Typography variant="subtitle1" fontWeight={600} sx={{ minWidth: 80, textAlign: 'right' }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </Typography>
                        <IconButton 
                          color="error" 
                          onClick={() => handleRemoveItem(item.id)}
                          sx={{ ml: 1 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate('/shop/wearables')}
                  sx={{ 
                    borderRadius: 2, 
                    textTransform: 'none'
                  }}
                >
                  Continue Shopping
                </Button>
                <Button
                  variant="text"
                  color="error"
                  onClick={() => setCartItems([])}
                  sx={{ 
                    borderRadius: 2, 
                    textTransform: 'none'
                  }}
                >
                  Clear Cart
                </Button>
              </Box>
            </Paper>
          </Grid>
          
          {/* Order Summary */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
              }}
            >
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Order Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Subtotal</Typography>
                  <Typography variant="body1">${subtotal.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Shipping</Typography>
                  <Typography variant="body1">${shipping.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Tax</Typography>
                  <Typography variant="body1">${tax.toFixed(2)}</Typography>
                </Box>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>Total</Typography>
                <Typography variant="h6" fontWeight={600} color="primary.main">
                  ${total.toFixed(2)}
                </Typography>
              </Box>
              
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                startIcon={<CreditCardIcon />}
                onClick={handleCheckout}
                sx={{ 
                  borderRadius: 2, 
                  textTransform: 'none',
                  py: 1.5
                }}
              >
                Proceed to Checkout
              </Button>
              
              <Box sx={{ mt: 3, p: 2, bgcolor: alpha(theme.palette.success.light, 0.1), borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ShippingIcon color="success" sx={{ mr: 1, fontSize: '1.2rem' }} />
                  <Typography variant="body2" fontWeight={600}>
                    Free shipping on orders over $200
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon color="success" sx={{ mr: 1, fontSize: '1.2rem' }} />
                  <Typography variant="body2" fontWeight={600}>
                    2-year warranty included
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ShoppingCartPage;
