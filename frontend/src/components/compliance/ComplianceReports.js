import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  IconButton,
  Chip,
  Divider,
  useTheme,
  alpha,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Tab,
  Tabs,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CalendarToday as CalendarTodayIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const ComplianceReports = ({ reports, onRefresh }) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (event) => {
    setFilterType(event.target.value);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'compliant':
        return <CheckCircleIcon fontSize="small" sx={{ color: theme.palette.success.main }} />;
      case 'warning':
        return <WarningIcon fontSize="small" sx={{ color: theme.palette.warning.main }} />;
      case 'non-compliant':
        return <ErrorIcon fontSize="small" sx={{ color: theme.palette.error.main }} />;
      default:
        return <InfoIcon fontSize="small" sx={{ color: theme.palette.info.main }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'compliant':
        return theme.palette.success.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'non-compliant':
        return theme.palette.error.main;
      default:
        return theme.palette.info.main;
    }
  };

  // Filter reports based on tab, search term, and filter type
  const filteredReports = reports.filter((report) => {
    const matchesTab = 
      (tabValue === 0) || // All reports
      (tabValue === 1 && report.scheduled) || // Scheduled reports
      (tabValue === 2 && !report.scheduled); // On-demand reports
    
    const matchesSearch = 
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || report.type === filterType;
    
    return matchesTab && matchesSearch && matchesType;
  });

  return (
    <Card
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 8px 25px rgba(0,0,0,0.05)',
        height: '100%',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 12px 30px rgba(0,0,0,0.1)'
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight={600}>
            Compliance Reports
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Generate Report
            </Button>
            <Tooltip title="Refresh Reports">
              <IconButton
                size="small"
                onClick={onRefresh}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                  }
                }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                minWidth: 'auto',
                px: 3
              }
            }}
          >
            <Tab label="All Reports" />
            <Tab label="Scheduled Reports" />
            <Tab label="On-Demand Reports" />
          </Tabs>
        </Box>

        {/* Search and Filter */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search reports..."
            value={searchTerm}
            onChange={handleSearchChange}
            variant="outlined"
            size="small"
            sx={{ flexGrow: 1, minWidth: '200px' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: '150px' }}>
            <InputLabel id="report-type-filter-label">Report Type</InputLabel>
            <Select
              labelId="report-type-filter-label"
              value={filterType}
              onChange={handleFilterChange}
              label="Report Type"
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="hipaa">HIPAA</MenuItem>
              <MenuItem value="security">Security</MenuItem>
              <MenuItem value="access">Access Control</MenuItem>
              <MenuItem value="data">Data Protection</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Reports List */}
        <List sx={{ bgcolor: alpha(theme.palette.background.paper, 0.5), borderRadius: 2 }}>
          {filteredReports.map((report, index) => (
            <React.Fragment key={report.id}>
              {index > 0 && <Divider component="li" />}
              <ListItem
                component={motion.div}
                variants={itemVariants}
                sx={{
                  py: 2,
                  px: 3,
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.05)
                  }
                }}
              >
                <ListItemIcon>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(theme.palette.primary.main, 0.1)
                    }}
                  >
                    <DescriptionIcon sx={{ color: theme.palette.primary.main }} />
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {report.title}
                      </Typography>
                      {report.scheduled && (
                        <Chip
                          icon={<ScheduleIcon fontSize="small" />}
                          label="Scheduled"
                          size="small"
                          sx={{
                            bgcolor: alpha(theme.palette.info.main, 0.1),
                            color: theme.palette.info.main,
                            fontWeight: 500
                          }}
                        />
                      )}
                      <Chip
                        icon={getStatusIcon(report.status)}
                        label={report.status}
                        size="small"
                        sx={{
                          bgcolor: alpha(getStatusColor(report.status), 0.1),
                          color: getStatusColor(report.status),
                          fontWeight: 500,
                          textTransform: 'capitalize'
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        {report.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarTodayIcon fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
                          <Typography variant="caption" color="text.secondary">
                            {report.date}
                          </Typography>
                        </Box>
                        <Chip
                          label={report.type}
                          size="small"
                          sx={{
                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                            color: theme.palette.secondary.main,
                            fontWeight: 500
                          }}
                        />
                      </Box>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="View Report">
                      <IconButton
                        size="small"
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.2),
                          }
                        }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download Report">
                      <IconButton
                        size="small"
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.2),
                          }
                        }}
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            </React.Fragment>
          ))}
          {filteredReports.length === 0 && (
            <ListItem sx={{ py: 4, justifyContent: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No reports found matching your criteria
              </Typography>
            </ListItem>
          )}
        </List>
      </CardContent>
    </Card>
  );
};

export default ComplianceReports;
