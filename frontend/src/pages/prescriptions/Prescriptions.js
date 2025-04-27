import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'patientName', headerName: 'Patient Name', width: 200 },
    { field: 'medication', headerName: 'Medication', width: 200 },
    { field: 'dosage', headerName: 'Dosage', width: 130 },
    { field: 'frequency', headerName: 'Frequency', width: 130 },
    { field: 'startDate', headerName: 'Start Date', width: 130 },
    { field: 'endDate', headerName: 'End Date', width: 130 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 130,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleEdit(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row.id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleEdit = (prescription) => {
    // TODO: Implement edit functionality
    console.log('Edit prescription:', prescription);
  };

  const handleDelete = (id) => {
    // TODO: Implement delete functionality
    console.log('Delete prescription:', id);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Prescriptions
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ mb: 2 }}
          onClick={() => {/* TODO: Implement add new prescription */}}
        >
          Add New Prescription
        </Button>
        <Card>
          <CardContent>
            <DataGrid
              rows={prescriptions}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10]}
              checkboxSelection
              disableSelectionOnClick
              autoHeight
            />
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Prescriptions;
