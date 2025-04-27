import React from 'react';
import { Box, ToggleButtonGroup, ToggleButton, useTheme, alpha } from '@mui/material';

const TimeRangeSelector = ({ timeRange, onTimeRangeChange }) => {
  const theme = useTheme();

  const handleChange = (event, newTimeRange) => {
    if (newTimeRange !== null) {
      onTimeRangeChange(newTimeRange);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
      <ToggleButtonGroup
        value={timeRange}
        exclusive
        onChange={handleChange}
        aria-label="time range"
        size="small"
        sx={{
          '& .MuiToggleButton-root': {
            textTransform: 'none',
            fontWeight: 500,
            px: 2,
            borderRadius: '4px',
            borderColor: alpha(theme.palette.primary.main, 0.2),
            '&.Mui-selected': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
              }
            },
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
            }
          }
        }}
      >
        <ToggleButton value="day" aria-label="day">
          Day
        </ToggleButton>
        <ToggleButton value="week" aria-label="week">
          Week
        </ToggleButton>
        <ToggleButton value="month" aria-label="month">
          Month
        </ToggleButton>
        <ToggleButton value="quarter" aria-label="quarter">
          Quarter
        </ToggleButton>
        <ToggleButton value="year" aria-label="year">
          Year
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default TimeRangeSelector;
