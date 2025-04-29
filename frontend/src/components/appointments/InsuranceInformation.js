import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  Checkbox,
  FormControlLabel,
  Button,
  Divider,
  Collapse,
  Link,
  Tooltip,
  IconButton,
  Alert,
  Badge,
  Chip
} from '@mui/material';
import {
  HealthAndSafety,
  Info,
  Help,
  CreditCard,
  LocalHospital,
  Payments,
  Chat,
  ExpandMore,
  ExpandLess,
  CheckCircleOutline,
  MonetizationOn,
  LocalAtm,
  Discount
} from '@mui/icons-material';

const InsuranceInformation = ({
  insuranceInfo,
  onInsuranceChange,
  required = false,
  error = null
}) => {
  const [selfPay, setSelfPay] = useState(insuranceInfo?.selfPay || false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [showChatHelp, setShowChatHelp] = useState(false);

  const handleSelfPayChange = (event) => {
    const checked = event.target.checked;
    setSelfPay(checked);

    // If self-pay is checked, auto-fill insurance fields with N/A
    if (checked) {
      onInsuranceChange({
        ...insuranceInfo,
        selfPay: true,
        provider: 'Self-Pay',
        policyNumber: 'N/A',
        additionalInfo: insuranceInfo.additionalInfo || 'Patient will pay directly'
      });
    } else {
      // Clear fields if unchecking self-pay
      onInsuranceChange({
        ...insuranceInfo,
        selfPay: false,
        provider: '',
        policyNumber: '',
        additionalInfo: ''
      });
    }
  };

  const handleChange = (field, value) => {
    onInsuranceChange({
      ...insuranceInfo,
      [field]: value
    });
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <HealthAndSafety color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6">
          Insurance Information
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={3}
        sx={{
          mb: 3,
          p: 2,
          bgcolor: 'primary.light',
          borderRadius: 2,
          color: 'primary.contrastText',
          border: '1px solid',
          borderColor: 'primary.main'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <Info fontSize="medium" sx={{ mr: 1, mt: 0.5 }} />
          <Box>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Don't have insurance? No worries!
            </Typography>
            <Typography variant="body1">
              You can still continue your booking. We'll offer flexible payment options and discounts where available.
              Simply select "Self-Pay" below.
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Paper
        elevation={selfPay ? 3 : 1}
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 2,
          border: selfPay ? '2px solid' : '1px solid',
          borderColor: selfPay ? 'success.main' : 'divider',
          bgcolor: selfPay ? 'success.light' : 'background.paper',
          transition: 'all 0.3s ease'
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={selfPay}
              onChange={handleSelfPayChange}
              icon={<CreditCard color="action" fontSize="large" />}
              checkedIcon={<CreditCard color="success" fontSize="large" />}
              sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
            />
          }
          label={
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" fontWeight={600} color={selfPay ? 'success.main' : 'text.primary'}>
                Self-Pay Option 💳
              </Typography>
              <Typography variant="body2" color={selfPay ? 'success.dark' : 'text.secondary'}>
                I don't have insurance. I will pay for my appointment directly.
              </Typography>
              {selfPay && (
                <Typography variant="body2" color="success.dark" sx={{ mt: 1, fontWeight: 500 }}>
                  ✓ Self-pay selected! Insurance fields have been automatically filled.
                </Typography>
              )}
            </Box>
          }
          sx={{
            m: 0,
            alignItems: 'flex-start',
            '& .MuiFormControlLabel-label': { mt: 0.5 }
          }}
        />
      </Paper>

      {selfPay ? (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            bgcolor: 'success.light',
            border: '1px dashed',
            borderColor: 'success.main'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircleOutline color="success" sx={{ mr: 1.5, fontSize: 28 }} />
            <Box>
              <Typography variant="subtitle1" fontWeight={600} color="success.dark">
                Self-Pay Option Selected
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You've chosen to pay directly for your appointment. Insurance information has been automatically filled as "Self-Pay".
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Provider:</Typography>
                <Typography variant="body1" fontWeight={500}>Self-Pay</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Policy Number:</Typography>
                <Typography variant="body1" fontWeight={500}>N/A</Typography>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Insurance Provider"
              placeholder="e.g., Blue Cross, Aetna, etc."
              value={insuranceInfo.provider || ''}
              onChange={(e) => handleChange('provider', e.target.value)}
              required={required && !selfPay}
              disabled={selfPay}
              InputProps={{
                startAdornment: (
                  <LocalHospital color="primary" sx={{ mr: 1 }} />
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Policy Number"
              placeholder="Your insurance policy number"
              value={insuranceInfo.policyNumber || ''}
              onChange={(e) => handleChange('policyNumber', e.target.value)}
              required={required && !selfPay}
              disabled={selfPay}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Additional Insurance Information"
              multiline
              rows={2}
              placeholder="Any additional details about your coverage"
              value={insuranceInfo.additionalInfo || ''}
              onChange={(e) => handleChange('additionalInfo', e.target.value)}
              disabled={selfPay}
            />
          </Grid>
        </Grid>
      )}

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Badge
          badgeContent="New"
          color="error"
          sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem', fontWeight: 'bold' } }}
        >
          <Button
            startIcon={showPaymentOptions ? <ExpandLess /> : <ExpandMore />}
            variant="contained"
            color="secondary"
            size="medium"
            onClick={() => setShowPaymentOptions(!showPaymentOptions)}
            endIcon={<MonetizationOn />}
          >
            Payment Assistance Options
          </Button>
        </Badge>

        <Button
          startIcon={<Chat />}
          variant="outlined"
          color="primary"
          size="medium"
          onClick={() => setShowChatHelp(true)}
        >
          Need Help?
        </Button>
      </Box>

      <Collapse in={showPaymentOptions}>
        <Paper
          elevation={3}
          sx={{
            mt: 2,
            p: 3,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'secondary.main',
            bgcolor: 'rgba(156, 39, 176, 0.05)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <MonetizationOn color="secondary" sx={{ mr: 1.5, fontSize: 28 }} />
            <Typography variant="h6" color="secondary.main" fontWeight={600}>
              Payment Assistance Options
            </Typography>
          </Box>

          <Typography variant="body1" paragraph>
            We offer several options to make healthcare affordable for everyone, regardless of insurance status:
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  height: '100%',
                  borderTop: '4px solid',
                  borderColor: 'primary.main',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <LocalAtm color="primary" sx={{ mr: 1.5, fontSize: 28 }} />
                  <Typography variant="h6" fontWeight={600}>Cash Discounts</Typography>
                </Box>
                <Typography variant="body1" paragraph>
                  Save up to 20% when paying in cash at the time of service
                </Typography>
                <Box sx={{ mt: 'auto', pt: 1 }}>
                  <Chip
                    label="Save 20%"
                    color="primary"
                    size="small"
                    icon={<Discount />}
                  />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  height: '100%',
                  borderTop: '4px solid',
                  borderColor: 'secondary.main',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <CreditCard color="secondary" sx={{ mr: 1.5, fontSize: 28 }} />
                  <Typography variant="h6" fontWeight={600}>Payment Plans</Typography>
                </Box>
                <Typography variant="body1" paragraph>
                  Spread your payments over 3-12 months with no interest
                </Typography>
                <Box sx={{ mt: 'auto', pt: 1 }}>
                  <Chip
                    label="0% Interest"
                    color="secondary"
                    size="small"
                  />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  height: '100%',
                  borderTop: '4px solid',
                  borderColor: 'success.main',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <HealthAndSafety color="success" sx={{ mr: 1.5, fontSize: 28 }} />
                  <Typography variant="h6" fontWeight={600}>Financial Aid</Typography>
                </Box>
                <Typography variant="body1" paragraph>
                  Income-based assistance for qualifying patients
                </Typography>
                <Box sx={{ mt: 'auto', pt: 1 }}>
                  <Chip
                    label="Income-Based"
                    color="success"
                    size="small"
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="outlined"
              color="secondary"
              component={Link}
              href="/financial-assistance"
              target="_blank"
              startIcon={<Info />}
            >
              Learn more about our financial assistance programs
            </Button>
          </Box>
        </Paper>
      </Collapse>

      {showChatHelp && (
        <Alert
          severity="info"
          sx={{ mt: 2 }}
          onClose={() => setShowChatHelp(false)}
          action={
            <Button color="inherit" size="small" href="/support-chat" target="_blank">
              Start Chat
            </Button>
          }
        >
          Our support team is available to help with insurance and payment questions. Click "Start Chat" to connect with a representative.
        </Alert>
      )}
    </Paper>
  );
};

export default InsuranceInformation;
