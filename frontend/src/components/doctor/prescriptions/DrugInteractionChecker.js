import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Autocomplete,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Collapse,
  LinearProgress,
  useTheme,
  alpha
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const DrugInteractionChecker = ({ medications = [], onMedicationsChange, isActive = false }) => {
  const theme = useTheme();
  const [selectedMedications, setSelectedMedications] = useState(medications);
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedInteraction, setExpandedInteraction] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState({ open: false, interaction: null });

  // Mock drug database
  const drugDatabase = [
    { name: 'Lisinopril', category: 'ACE Inhibitor', genericName: 'Lisinopril' },
    { name: 'Metformin', category: 'Antidiabetic', genericName: 'Metformin' },
    { name: 'Amoxicillin', category: 'Antibiotic', genericName: 'Amoxicillin' },
    { name: 'Hydrochlorothiazide', category: 'Diuretic', genericName: 'Hydrochlorothiazide' },
    { name: 'Atorvastatin', category: 'Statin', genericName: 'Atorvastatin' },
    { name: 'Warfarin', category: 'Anticoagulant', genericName: 'Warfarin' },
    { name: 'Aspirin', category: 'NSAID', genericName: 'Acetylsalicylic Acid' },
    { name: 'Ibuprofen', category: 'NSAID', genericName: 'Ibuprofen' },
    { name: 'Sertraline', category: 'SSRI', genericName: 'Sertraline' },
    { name: 'Omeprazole', category: 'PPI', genericName: 'Omeprazole' },
    { name: 'Digoxin', category: 'Cardiac Glycoside', genericName: 'Digoxin' },
    { name: 'Furosemide', category: 'Loop Diuretic', genericName: 'Furosemide' }
  ];

  // Mock interaction database
  const interactionDatabase = [
    {
      drug1: 'Warfarin',
      drug2: 'Aspirin',
      severity: 'major',
      description: 'Increased risk of bleeding',
      mechanism: 'Both drugs affect blood clotting mechanisms',
      clinicalEffects: 'Increased bleeding risk, bruising, prolonged bleeding time',
      management: 'Monitor INR closely, consider alternative pain management',
      references: ['Drug Interaction Facts 2024', 'Clinical Pharmacology Database']
    },
    {
      drug1: 'Lisinopril',
      drug2: 'Hydrochlorothiazide',
      severity: 'minor',
      description: 'Synergistic blood pressure lowering effect',
      mechanism: 'Complementary mechanisms of action',
      clinicalEffects: 'Enhanced antihypertensive effect',
      management: 'Monitor blood pressure, may be beneficial combination',
      references: ['Hypertension Guidelines 2024']
    },
    {
      drug1: 'Digoxin',
      drug2: 'Furosemide',
      severity: 'moderate',
      description: 'Increased digoxin toxicity risk',
      mechanism: 'Furosemide-induced hypokalemia increases digoxin sensitivity',
      clinicalEffects: 'Nausea, vomiting, arrhythmias, visual disturbances',
      management: 'Monitor digoxin levels and electrolytes, especially potassium',
      references: ['Cardiac Drug Interactions Manual']
    },
    {
      drug1: 'Sertraline',
      drug2: 'Warfarin',
      severity: 'moderate',
      description: 'Increased bleeding risk',
      mechanism: 'Sertraline inhibits platelet aggregation',
      clinicalEffects: 'Increased bleeding tendency',
      management: 'Monitor INR more frequently, watch for bleeding signs',
      references: ['Psychiatric Drug Interactions']
    },
    {
      drug1: 'Omeprazole',
      drug2: 'Warfarin',
      severity: 'moderate',
      description: 'Increased warfarin effect',
      mechanism: 'Omeprazole inhibits CYP2C19, reducing warfarin metabolism',
      clinicalEffects: 'Prolonged anticoagulation effect',
      management: 'Monitor INR closely when starting or stopping omeprazole',
      references: ['CYP450 Drug Interactions Database']
    }
  ];

  // Check for interactions when medications change
  useEffect(() => {
    checkInteractions();
  }, [selectedMedications]);

  const checkInteractions = async () => {
    if (selectedMedications.length < 2) {
      setInteractions([]);
      return;
    }

    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const foundInteractions = [];
    
    for (let i = 0; i < selectedMedications.length; i++) {
      for (let j = i + 1; j < selectedMedications.length; j++) {
        const drug1 = selectedMedications[i];
        const drug2 = selectedMedications[j];
        
        const interaction = interactionDatabase.find(
          int => (int.drug1 === drug1 && int.drug2 === drug2) ||
                 (int.drug1 === drug2 && int.drug2 === drug1)
        );
        
        if (interaction) {
          foundInteractions.push({
            ...interaction,
            id: `${drug1}-${drug2}`,
            drugs: [drug1, drug2]
          });
        }
      }
    }
    
    setInteractions(foundInteractions);
    setLoading(false);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'major': return theme.palette.error.main;
      case 'moderate': return theme.palette.warning.main;
      case 'minor': return theme.palette.info.main;
      default: return theme.palette.grey[500];
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'major': return <ErrorIcon />;
      case 'moderate': return <WarningIcon />;
      case 'minor': return <InfoIcon />;
      default: return <InfoIcon />;
    }
  };

  const handleAddMedication = (medication) => {
    if (medication && !selectedMedications.includes(medication.name)) {
      const newMedications = [...selectedMedications, medication.name];
      setSelectedMedications(newMedications);
      if (onMedicationsChange) {
        onMedicationsChange(newMedications);
      }
    }
  };

  const handleRemoveMedication = (medicationToRemove) => {
    const newMedications = selectedMedications.filter(med => med !== medicationToRemove);
    setSelectedMedications(newMedications);
    if (onMedicationsChange) {
      onMedicationsChange(newMedications);
    }
  };

  const openDetailsDialog = (interaction) => {
    setDetailsDialog({ open: true, interaction });
  };

  const closeDetailsDialog = () => {
    setDetailsDialog({ open: false, interaction: null });
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Drug Interaction Checker
      </Typography>
      
      {/* Medication Selection */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Select Medications to Check
          </Typography>
          
          <Autocomplete
            options={drugDatabase}
            getOptionLabel={(option) => option.name}
            onChange={(event, newValue) => handleAddMedication(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Search and add medications..."
                InputProps={{
                  ...params.InputProps,
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Box>
                  <Typography variant="body2">{option.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.category} • {option.genericName}
                  </Typography>
                </Box>
              </Box>
            )}
            sx={{ mb: 2 }}
          />
          
          {/* Selected Medications */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectedMedications.map((medication) => (
              <Chip
                key={medication}
                label={medication}
                onDelete={() => handleRemoveMedication(medication)}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && (
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2">Checking for interactions...</Typography>
              <LinearProgress sx={{ flexGrow: 1 }} />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {!loading && selectedMedications.length >= 2 && (
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Interaction Results
            </Typography>
            
            {interactions.length === 0 ? (
              <Alert severity="success" sx={{ borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon />
                  <Typography variant="body2">
                    No known interactions found between the selected medications.
                  </Typography>
                </Box>
              </Alert>
            ) : (
              <Box>
                <Alert 
                  severity="warning" 
                  sx={{ mb: 2, borderRadius: 2 }}
                >
                  <Typography variant="body2">
                    {interactions.length} potential interaction{interactions.length !== 1 ? 's' : ''} found. 
                    Please review carefully.
                  </Typography>
                </Alert>
                
                <List>
                  {interactions.map((interaction, index) => (
                    <motion.div
                      key={interaction.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ListItem
                        sx={{
                          border: `1px solid ${alpha(getSeverityColor(interaction.severity), 0.3)}`,
                          borderRadius: 2,
                          mb: 1,
                          bgcolor: alpha(getSeverityColor(interaction.severity), 0.05)
                        }}
                      >
                        <ListItemIcon>
                          <Box sx={{ color: getSeverityColor(interaction.severity) }}>
                            {getSeverityIcon(interaction.severity)}
                          </Box>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <Typography variant="body1" fontWeight={600}>
                                {interaction.drugs.join(' + ')}
                              </Typography>
                              <Chip
                                label={interaction.severity}
                                size="small"
                                sx={{
                                  bgcolor: getSeverityColor(interaction.severity),
                                  color: 'white',
                                  textTransform: 'capitalize'
                                }}
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" sx={{ mt: 0.5 }}>
                                {interaction.description}
                              </Typography>
                              <Button
                                size="small"
                                onClick={() => openDetailsDialog(interaction)}
                                sx={{ mt: 1, p: 0, minWidth: 'auto' }}
                              >
                                View Details
                              </Button>
                            </Box>
                          }
                        />
                      </ListItem>
                    </motion.div>
                  ))}
                </List>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* No medications selected */}
      {selectedMedications.length < 2 && !loading && (
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="body2">
                Select at least 2 medications to check for interactions.
              </Typography>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Interaction Details Dialog */}
      <Dialog
        open={detailsDialog.open}
        onClose={closeDetailsDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ color: getSeverityColor(detailsDialog.interaction?.severity) }}>
                {getSeverityIcon(detailsDialog.interaction?.severity)}
              </Box>
              <Typography variant="h6" fontWeight={600}>
                Drug Interaction Details
              </Typography>
            </Box>
            <IconButton onClick={closeDetailsDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {detailsDialog.interaction && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {detailsDialog.interaction.drugs.join(' + ')}
                </Typography>
                <Chip
                  label={detailsDialog.interaction.severity}
                  sx={{
                    bgcolor: getSeverityColor(detailsDialog.interaction.severity),
                    color: 'white',
                    textTransform: 'capitalize'
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Description
                </Typography>
                <Typography variant="body2">
                  {detailsDialog.interaction.description}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Mechanism of Interaction
                </Typography>
                <Typography variant="body2">
                  {detailsDialog.interaction.mechanism}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Clinical Effects
                </Typography>
                <Typography variant="body2">
                  {detailsDialog.interaction.clinicalEffects}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Management Recommendations
                </Typography>
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  <Typography variant="body2">
                    {detailsDialog.interaction.management}
                  </Typography>
                </Alert>
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  References
                </Typography>
                <List dense>
                  {detailsDialog.interaction.references.map((reference, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemText
                        primary={reference}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDetailsDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DrugInteractionChecker;