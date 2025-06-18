import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Medication as MedicationIcon,
  History as HistoryIcon,
  Assignment as TemplateIcon,
  Security as InteractionIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

import PrescriptionManagement from './PrescriptionManagement';
import PrescriptionHistory from './PrescriptionHistory';
import PrescriptionTemplates from './PrescriptionTemplates';
import DrugInteractionChecker from './DrugInteractionChecker';

const PrescriptionDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      label: 'Prescriptions',
      icon: <MedicationIcon />,
      component: (isActive) => <PrescriptionManagement isActive={isActive} />
    },
    {
      label: 'History',
      icon: <HistoryIcon />,
      component: (isActive) => <PrescriptionHistory isActive={isActive} />
    },
    {
      label: 'Templates',
      icon: <TemplateIcon />,
      component: (isActive) => <PrescriptionTemplates isActive={isActive} />
    },
    {
      label: 'Drug Interactions',
      icon: <InteractionIcon />,
      component: (isActive) => <DrugInteractionChecker isActive={isActive} />
    }
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <Paper 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: 0
        }}
      >
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant={isMobile ? "fullWidth" : "standard"}
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': {
                minHeight: isMobile ? 48 : 64,
                textTransform: 'none',
                fontSize: isMobile ? '0.875rem' : '1rem',
                fontWeight: 500,
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                  fontWeight: 600
                }
              }
            }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                label={
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    flexDirection: isMobile ? 'column' : 'row'
                  }}>
                    {tab.icon}
                    <span style={{ fontSize: isMobile ? '0.75rem' : 'inherit' }}>
                      {tab.label}
                    </span>
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ 
          flexGrow: 1, 
          overflow: 'auto',
          position: 'relative'
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              style={{ 
                height: '100%',
                overflow: 'auto'
              }}
            >
              {tabs[activeTab]?.component(true)}
            </motion.div>
          </AnimatePresence>
        </Box>
      </Paper>
    </Box>
  );
};

export default PrescriptionDashboard;