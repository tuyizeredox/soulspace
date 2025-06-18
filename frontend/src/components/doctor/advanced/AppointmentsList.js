import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Skeleton,
  useTheme
} from '@mui/material';
import {
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import AppointmentCard from './AppointmentCard';
import TreatmentCompletion from './TreatmentCompletion';
import PatientQuickView from './PatientQuickView';

const AppointmentsList = ({ 
  appointments = [], 
  loading = false, 
  onAppointmentUpdate,
  showActions = true 
}) => {
  const theme = useTheme();
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showTreatmentDialog, setShowTreatmentDialog] = useState(false);
  const [showPatientDialog, setShowPatientDialog] = useState(false);

  // Handle appointment completion
  const handleCompleteAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowTreatmentDialog(true);
  };

  // Handle patient view
  const handleViewPatient = (patient, appointment) => {
    setSelectedPatient(patient);
    setSelectedAppointment(appointment);
    setShowPatientDialog(true);
  };

  // Handle treatment completion
  const handleTreatmentComplete = (treatmentData) => {
    // Update appointment status
    const updatedAppointment = {
      ...selectedAppointment,
      status: 'completed',
      treatmentNotes: treatmentData
    };

    if (onAppointmentUpdate) {
      onAppointmentUpdate(updatedAppointment);
    }

    setShowTreatmentDialog(false);
    setSelectedAppointment(null);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  if (loading) {
    return (
      <Box>
        {[1, 2, 3].map((item) => (
          <Skeleton 
            key={item} 
            variant="rectangular" 
            height={200} 
            sx={{ mb: 2, borderRadius: 2 }} 
          />
        ))}
      </Box>
    );
  }

  if (appointments.length === 0) {
    return (
      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <ScheduleIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Appointments Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You don't have any appointments scheduled at the moment.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Grid container spacing={2}>
          <AnimatePresence>
            {appointments.map((appointment) => (
              <Grid item xs={12} key={appointment._id || appointment.id}>
                <motion.div
                  variants={itemVariants}
                  layout
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <AppointmentCard
                    appointment={appointment}
                    onUpdate={onAppointmentUpdate}
                    onComplete={handleCompleteAppointment}
                    onViewPatient={(patient) => handleViewPatient(patient, appointment)}
                    showActions={showActions}
                  />
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>
      </motion.div>

      {/* Treatment Completion Dialog */}
      <TreatmentCompletion
        open={showTreatmentDialog}
        onClose={() => {
          setShowTreatmentDialog(false);
          setSelectedAppointment(null);
        }}
        onComplete={handleTreatmentComplete}
        appointment={selectedAppointment}
        loading={false}
      />

      {/* Patient Quick View Dialog */}
      <PatientQuickView
        open={showPatientDialog}
        onClose={() => {
          setShowPatientDialog(false);
          setSelectedPatient(null);
          setSelectedAppointment(null);
        }}
        patient={selectedPatient}
        appointment={selectedAppointment}
      />
    </>
  );
};

export default AppointmentsList;