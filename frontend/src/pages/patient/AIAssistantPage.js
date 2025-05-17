import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import AiHealthAssistant from '../../components/dashboard/AiHealthAssistant';
import { useNavigate } from 'react-router-dom';

const AIAssistantPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
          AI Health Assistant
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Ask health-related questions and get instant guidance
        </Typography>
      </Box>

      <AiHealthAssistant onBookAppointment={() => navigate('/appointments/book')} />
    </Container>
  );
};

export default AIAssistantPage;
