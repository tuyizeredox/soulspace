import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  useTheme,
  alpha
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  LocalHospital as HospitalIcon,
  Psychology as PsychologyIcon,
  MonitorHeart as HeartIcon,
  Healing as HealingIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const PrescriptionTemplates = ({ onUseTemplate, isActive = false }) => {
  const theme = useTheme();
  const [templates, setTemplates] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    category: '',
    description: '',
    diagnosis: '',
    medications: [],
    notes: '',
    isFavorite: false
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Mock templates data
  const mockTemplates = [
    {
      id: 1,
      name: 'Hypertension Standard',
      category: 'Cardiovascular',
      description: 'Standard treatment for mild to moderate hypertension',
      diagnosis: 'Essential Hypertension',
      medications: [
        {
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          duration: '30 days',
          instructions: 'Take with or without food',
          quantity: '30 tablets'
        },
        {
          name: 'Hydrochlorothiazide',
          dosage: '25mg',
          frequency: 'Once daily',
          duration: '30 days',
          instructions: 'Take in the morning',
          quantity: '30 tablets'
        }
      ],
      notes: 'Monitor blood pressure weekly. Follow up in 4 weeks.',
      isFavorite: true,
      usageCount: 15,
      createdDate: new Date('2024-01-01')
    },
    {
      id: 2,
      name: 'Type 2 Diabetes Initial',
      category: 'Endocrine',
      description: 'Initial treatment for newly diagnosed Type 2 diabetes',
      diagnosis: 'Type 2 Diabetes Mellitus',
      medications: [
        {
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: '90 days',
          instructions: 'Take with meals to reduce GI upset',
          quantity: '180 tablets'
        }
      ],
      notes: 'Check HbA1c in 3 months. Dietary counseling recommended.',
      isFavorite: true,
      usageCount: 12,
      createdDate: new Date('2024-01-05')
    },
    {
      id: 3,
      name: 'Upper Respiratory Infection',
      category: 'Respiratory',
      description: 'Treatment for bacterial upper respiratory infections',
      diagnosis: 'Acute Upper Respiratory Infection',
      medications: [
        {
          name: 'Amoxicillin',
          dosage: '500mg',
          frequency: 'Three times daily',
          duration: '7 days',
          instructions: 'Complete full course even if feeling better',
          quantity: '21 capsules'
        },
        {
          name: 'Ibuprofen',
          dosage: '400mg',
          frequency: 'Every 6 hours as needed',
          duration: '7 days',
          instructions: 'Take with food',
          quantity: '28 tablets'
        }
      ],
      notes: 'Return if symptoms worsen or persist after 3 days.',
      isFavorite: false,
      usageCount: 8,
      createdDate: new Date('2024-01-10')
    },
    {
      id: 4,
      name: 'Anxiety Disorder',
      category: 'Mental Health',
      description: 'Initial treatment for generalized anxiety disorder',
      diagnosis: 'Generalized Anxiety Disorder',
      medications: [
        {
          name: 'Sertraline',
          dosage: '25mg',
          frequency: 'Once daily',
          duration: '30 days',
          instructions: 'Take in the morning with food',
          quantity: '30 tablets'
        }
      ],
      notes: 'Start with low dose. Follow up in 2 weeks to assess tolerance.',
      isFavorite: false,
      usageCount: 6,
      createdDate: new Date('2024-01-12')
    },
    {
      id: 5,
      name: 'Acute Pain Management',
      category: 'Pain Management',
      description: 'Short-term pain management for acute conditions',
      diagnosis: 'Acute Pain',
      medications: [
        {
          name: 'Ibuprofen',
          dosage: '600mg',
          frequency: 'Every 8 hours',
          duration: '5 days',
          instructions: 'Take with food to prevent stomach upset',
          quantity: '15 tablets'
        },
        {
          name: 'Acetaminophen',
          dosage: '500mg',
          frequency: 'Every 6 hours as needed',
          duration: '5 days',
          instructions: 'Do not exceed 3000mg per day',
          quantity: '20 tablets'
        }
      ],
      notes: 'Alternate medications for better pain control. Avoid alcohol.',
      isFavorite: true,
      usageCount: 10,
      createdDate: new Date('2024-01-08')
    }
  ];

  useEffect(() => {
    setTemplates(mockTemplates);
  }, []);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Cardiovascular': return <HeartIcon />;
      case 'Endocrine': return <HospitalIcon />;
      case 'Respiratory': return <HealingIcon />;
      case 'Mental Health': return <PsychologyIcon />;
      case 'Pain Management': return <HealingIcon />;
      default: return <HospitalIcon />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Cardiovascular': return theme.palette.error.main;
      case 'Endocrine': return theme.palette.warning.main;
      case 'Respiratory': return theme.palette.info.main;
      case 'Mental Health': return theme.palette.secondary.main;
      case 'Pain Management': return theme.palette.success.main;
      default: return theme.palette.primary.main;
    }
  };

  const handleUseTemplate = (template) => {
    if (onUseTemplate) {
      onUseTemplate(template);
      setSnackbar({
        open: true,
        message: 'Template applied successfully',
        severity: 'success'
      });
    }
  };

  const handleToggleFavorite = (templateId) => {
    setTemplates(prev => prev.map(template => 
      template.id === templateId 
        ? { ...template, isFavorite: !template.isFavorite }
        : template
    ));
  };

  const handleDeleteTemplate = (templateId) => {
    setTemplates(prev => prev.filter(template => template.id !== templateId));
    setSnackbar({
      open: true,
      message: 'Template deleted successfully',
      severity: 'success'
    });
  };

  const openDialog = (template = null) => {
    if (template) {
      setSelectedTemplate(template);
      setTemplateForm({
        name: template.name,
        category: template.category,
        description: template.description,
        diagnosis: template.diagnosis,
        medications: template.medications,
        notes: template.notes,
        isFavorite: template.isFavorite
      });
    } else {
      setSelectedTemplate(null);
      setTemplateForm({
        name: '',
        category: '',
        description: '',
        diagnosis: '',
        medications: [],
        notes: '',
        isFavorite: false
      });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedTemplate(null);
  };

  const handleSaveTemplate = () => {
    if (selectedTemplate) {
      // Update existing template
      setTemplates(prev => prev.map(template => 
        template.id === selectedTemplate.id 
          ? { ...template, ...templateForm }
          : template
      ));
      setSnackbar({
        open: true,
        message: 'Template updated successfully',
        severity: 'success'
      });
    } else {
      // Create new template
      const newTemplate = {
        id: templates.length + 1,
        ...templateForm,
        usageCount: 0,
        createdDate: new Date()
      };
      setTemplates(prev => [newTemplate, ...prev]);
      setSnackbar({
        open: true,
        message: 'Template created successfully',
        severity: 'success'
      });
    }
    closeDialog();
  };

  const favoriteTemplates = templates.filter(t => t.isFavorite);
  const recentTemplates = templates.sort((a, b) => b.createdDate - a.createdDate).slice(0, 3);
  const popularTemplates = templates.sort((a, b) => b.usageCount - a.usageCount).slice(0, 3);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Prescription Templates
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openDialog()}
        >
          Create Template
        </Button>
      </Box>

      {/* Quick Access Sections */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Favorites */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FavoriteIcon sx={{ color: theme.palette.error.main, mr: 1 }} />
                <Typography variant="h6" fontWeight={600}>
                  Favorites
                </Typography>
              </Box>
              <List dense>
                {favoriteTemplates.slice(0, 3).map((template) => (
                  <ListItem key={template.id} sx={{ px: 0 }}>
                    <ListItemText
                      primary={template.name}
                      secondary={template.category}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                    <ListItemSecondaryAction>
                      <Button
                        size="small"
                        onClick={() => handleUseTemplate(template)}
                      >
                        Use
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Recently Created
                </Typography>
              </Box>
              <List dense>
                {recentTemplates.map((template) => (
                  <ListItem key={template.id} sx={{ px: 0 }}>
                    <ListItemText
                      primary={template.name}
                      secondary={template.category}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                    <ListItemSecondaryAction>
                      <Button
                        size="small"
                        onClick={() => handleUseTemplate(template)}
                      >
                        Use
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Popular */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Most Used
                </Typography>
              </Box>
              <List dense>
                {popularTemplates.map((template) => (
                  <ListItem key={template.id} sx={{ px: 0 }}>
                    <ListItemText
                      primary={template.name}
                      secondary={`Used ${template.usageCount} times`}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                    <ListItemSecondaryAction>
                      <Button
                        size="small"
                        onClick={() => handleUseTemplate(template)}
                      >
                        Use
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* All Templates */}
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        All Templates
      </Typography>
      <Grid container spacing={3}>
        {templates.map((template) => (
          <Grid item xs={12} md={6} lg={4} key={template.id}>
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <Card sx={{ height: '100%', borderRadius: 3, position: 'relative' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(getCategoryColor(template.category), 0.1),
                          color: getCategoryColor(template.category),
                          width: 40,
                          height: 40
                        }}
                      >
                        {getCategoryIcon(template.category)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1rem' }}>
                          {template.name}
                        </Typography>
                        <Chip
                          label={template.category}
                          size="small"
                          sx={{
                            bgcolor: alpha(getCategoryColor(template.category), 0.1),
                            color: getCategoryColor(template.category),
                            fontSize: '0.75rem'
                          }}
                        />
                      </Box>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleToggleFavorite(template.id)}
                      sx={{ color: template.isFavorite ? theme.palette.error.main : 'text.secondary' }}
                    >
                      {template.isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </IconButton>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {template.description}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Diagnosis: {template.diagnosis}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {template.medications.length} medication{template.medications.length !== 1 ? 's' : ''}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Used {template.usageCount} times
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => openDialog(template)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleUseTemplate(template)}
                      >
                        Use
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Template Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              {selectedTemplate ? 'Edit Template' : 'Create New Template'}
            </Typography>
            <IconButton onClick={closeDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Template Name"
                value={templateForm.name}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={templateForm.category}
                  label="Category"
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, category: e.target.value }))}
                >
                  <MenuItem value="Cardiovascular">Cardiovascular</MenuItem>
                  <MenuItem value="Endocrine">Endocrine</MenuItem>
                  <MenuItem value="Respiratory">Respiratory</MenuItem>
                  <MenuItem value="Mental Health">Mental Health</MenuItem>
                  <MenuItem value="Pain Management">Pain Management</MenuItem>
                  <MenuItem value="Dermatology">Dermatology</MenuItem>
                  <MenuItem value="Gastroenterology">Gastroenterology</MenuItem>
                  <MenuItem value="Neurology">Neurology</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={templateForm.description}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Diagnosis"
                value={templateForm.diagnosis}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                value={templateForm.notes}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, notes: e.target.value }))}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveTemplate}
            startIcon={<SaveIcon />}
          >
            {selectedTemplate ? 'Update Template' : 'Create Template'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PrescriptionTemplates;