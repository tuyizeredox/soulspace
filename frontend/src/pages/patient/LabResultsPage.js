import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  useTheme,
  alpha,
  Grid,
  Card,
  CardContent,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import {
  Science as ScienceIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  Close as CloseIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  CheckCircle as NormalIcon,
  Warning as AbnormalIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import axios from 'axios';

const LabResultsPage = () => {
  const theme = useTheme();
  const { user, token } = useSelector((state) => state.auth);
  
  // State variables
  const [loading, setLoading] = useState(true);
  const [labResults, setLabResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'desc'
  });
  
  // Fetch lab results
  useEffect(() => {
    const fetchLabResults = async () => {
      try {
        setLoading(true);
        
        // In a real app, this would be an API call
        // const response = await axios.get('/api/patients/lab-results', {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // setLabResults(response.data);
        
        // Mock data for lab results
        setTimeout(() => {
          const mockResults = [
            {
              id: 'lab-001',
              testName: 'Complete Blood Count (CBC)',
              date: '2023-11-15',
              doctor: 'Dr. Sarah Johnson',
              status: 'completed',
              category: 'hematology',
              results: [
                { name: 'White Blood Cell (WBC)', value: '7.5', unit: '10^3/µL', range: '4.5-11.0', status: 'normal' },
                { name: 'Red Blood Cell (RBC)', value: '5.2', unit: '10^6/µL', range: '4.5-5.9', status: 'normal' },
                { name: 'Hemoglobin (Hgb)', value: '14.2', unit: 'g/dL', range: '13.5-17.5', status: 'normal' },
                { name: 'Hematocrit (Hct)', value: '42', unit: '%', range: '41-50', status: 'normal' },
                { name: 'Platelet Count', value: '250', unit: '10^3/µL', range: '150-450', status: 'normal' }
              ]
            },
            {
              id: 'lab-002',
              testName: 'Comprehensive Metabolic Panel (CMP)',
              date: '2023-11-15',
              doctor: 'Dr. Sarah Johnson',
              status: 'completed',
              category: 'chemistry',
              results: [
                { name: 'Glucose', value: '95', unit: 'mg/dL', range: '70-99', status: 'normal' },
                { name: 'Calcium', value: '9.5', unit: 'mg/dL', range: '8.5-10.5', status: 'normal' },
                { name: 'Sodium', value: '140', unit: 'mmol/L', range: '135-145', status: 'normal' },
                { name: 'Potassium', value: '4.0', unit: 'mmol/L', range: '3.5-5.0', status: 'normal' },
                { name: 'Carbon Dioxide', value: '24', unit: 'mmol/L', range: '23-29', status: 'normal' },
                { name: 'Chloride', value: '102', unit: 'mmol/L', range: '96-106', status: 'normal' },
                { name: 'Blood Urea Nitrogen', value: '15', unit: 'mg/dL', range: '7-20', status: 'normal' },
                { name: 'Creatinine', value: '0.9', unit: 'mg/dL', range: '0.6-1.2', status: 'normal' },
                { name: 'Albumin', value: '4.0', unit: 'g/dL', range: '3.5-5.0', status: 'normal' },
                { name: 'Total Protein', value: '7.0', unit: 'g/dL', range: '6.0-8.0', status: 'normal' },
                { name: 'Alkaline Phosphatase', value: '70', unit: 'U/L', range: '40-129', status: 'normal' },
                { name: 'Alanine Aminotransferase (ALT)', value: '25', unit: 'U/L', range: '7-55', status: 'normal' },
                { name: 'Aspartate Aminotransferase (AST)', value: '20', unit: 'U/L', range: '8-48', status: 'normal' },
                { name: 'Bilirubin, Total', value: '0.8', unit: 'mg/dL', range: '0.1-1.2', status: 'normal' }
              ]
            },
            {
              id: 'lab-003',
              testName: 'Lipid Panel',
              date: '2023-10-20',
              doctor: 'Dr. Michael Chen',
              status: 'completed',
              category: 'chemistry',
              results: [
                { name: 'Total Cholesterol', value: '210', unit: 'mg/dL', range: '<200', status: 'abnormal' },
                { name: 'Triglycerides', value: '150', unit: 'mg/dL', range: '<150', status: 'normal' },
                { name: 'HDL Cholesterol', value: '45', unit: 'mg/dL', range: '>40', status: 'normal' },
                { name: 'LDL Cholesterol', value: '135', unit: 'mg/dL', range: '<100', status: 'abnormal' },
                { name: 'Total Cholesterol/HDL Ratio', value: '4.7', unit: '', range: '<5.0', status: 'normal' }
              ]
            },
            {
              id: 'lab-004',
              testName: 'Thyroid Function Tests',
              date: '2023-09-05',
              doctor: 'Dr. Emily Rodriguez',
              status: 'completed',
              category: 'endocrinology',
              results: [
                { name: 'Thyroid Stimulating Hormone (TSH)', value: '2.5', unit: 'mIU/L', range: '0.4-4.0', status: 'normal' },
                { name: 'Free T4', value: '1.2', unit: 'ng/dL', range: '0.8-1.8', status: 'normal' },
                { name: 'Free T3', value: '3.1', unit: 'pg/mL', range: '2.3-4.2', status: 'normal' }
              ]
            },
            {
              id: 'lab-005',
              testName: 'Urinalysis',
              date: '2023-08-12',
              doctor: 'Dr. Sarah Johnson',
              status: 'completed',
              category: 'urinalysis',
              results: [
                { name: 'Color', value: 'Yellow', unit: '', range: 'Yellow', status: 'normal' },
                { name: 'Clarity', value: 'Clear', unit: '', range: 'Clear', status: 'normal' },
                { name: 'Specific Gravity', value: '1.020', unit: '', range: '1.005-1.030', status: 'normal' },
                { name: 'pH', value: '6.0', unit: '', range: '5.0-8.0', status: 'normal' },
                { name: 'Protein', value: 'Negative', unit: '', range: 'Negative', status: 'normal' },
                { name: 'Glucose', value: 'Negative', unit: '', range: 'Negative', status: 'normal' },
                { name: 'Ketones', value: 'Negative', unit: '', range: 'Negative', status: 'normal' },
                { name: 'Blood', value: 'Negative', unit: '', range: 'Negative', status: 'normal' },
                { name: 'Nitrite', value: 'Negative', unit: '', range: 'Negative', status: 'normal' },
                { name: 'Leukocyte Esterase', value: 'Negative', unit: '', range: 'Negative', status: 'normal' }
              ]
            }
          ];
          
          setLabResults(mockResults);
          setLoading(false);
        }, 1500);
        
      } catch (error) {
        console.error('Error fetching lab results:', error);
        setLoading(false);
      }
    };
    
    fetchLabResults();
  }, [token]);
  
  // Handle sort
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Sort lab results
  const sortedResults = [...labResults].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
  
  // Filter lab results by category
  const filteredResults = activeTab === 0
    ? sortedResults
    : sortedResults.filter(result => {
        if (activeTab === 1) return result.category === 'hematology';
        if (activeTab === 2) return result.category === 'chemistry';
        if (activeTab === 3) return result.category === 'endocrinology';
        if (activeTab === 4) return result.category === 'urinalysis';
        return true;
      });
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle view result
  const handleViewResult = (result) => {
    setSelectedResult(result);
    setOpenDialog(true);
  };
  
  // Handle close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
          Lab Results
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          View and manage your laboratory test results
        </Typography>
      </Box>
      
      {/* Lab Results Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              bgcolor: alpha(theme.palette.primary.main, 0.05)
            }}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <ScienceIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" fontWeight={700}>
                {labResults.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Lab Tests
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
              bgcolor: alpha(theme.palette.success.main, 0.05)
            }}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <NormalIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" fontWeight={700}>
                {labResults.filter(result => 
                  !result.results.some(item => item.status === 'abnormal')
                ).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Normal Results
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
              bgcolor: alpha(theme.palette.warning.main, 0.05)
            }}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <AbnormalIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" fontWeight={700}>
                {labResults.filter(result => 
                  result.results.some(item => item.status === 'abnormal')
                ).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Abnormal Results
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
              bgcolor: alpha(theme.palette.info.main, 0.05)
            }}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <InfoIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" fontWeight={700}>
                {labResults.filter(result => 
                  new Date(result.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                ).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Recent (30 days)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Category Tabs */}
      <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              minWidth: 100,
            }
          }}
        >
          <Tab label="All Tests" />
          <Tab label="Hematology" />
          <Tab label="Chemistry" />
          <Tab label="Endocrinology" />
          <Tab label="Urinalysis" />
        </Tabs>
      </Box>
      
      {/* Lab Results Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }}
        >
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableRow>
                  <TableCell 
                    onClick={() => handleSort('testName')}
                    sx={{ 
                      fontWeight: 600,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      Test Name
                      {sortConfig.key === 'testName' && (
                        sortConfig.direction === 'asc' ? 
                          <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5 }} /> : 
                          <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5 }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell 
                    onClick={() => handleSort('date')}
                    sx={{ 
                      fontWeight: 600,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      Date
                      {sortConfig.key === 'date' && (
                        sortConfig.direction === 'asc' ? 
                          <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5 }} /> : 
                          <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5 }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Doctor</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Results</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No lab results found in this category
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResults.map((result) => {
                    const hasAbnormal = result.results.some(item => item.status === 'abnormal');
                    
                    return (
                      <TableRow 
                        key={result.id}
                        hover
                        sx={{ 
                          '&:hover': { 
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            cursor: 'pointer'
                          }
                        }}
                        onClick={() => handleViewResult(result)}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {result.testName}
                          </Typography>
                        </TableCell>
                        <TableCell>{formatDate(result.date)}</TableCell>
                        <TableCell>{result.doctor}</TableCell>
                        <TableCell>
                          <Chip
                            label={result.status === 'completed' ? 'Completed' : 'Pending'}
                            color={result.status === 'completed' ? 'success' : 'warning'}
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={result.category.charAt(0).toUpperCase() + result.category.slice(1)}
                            variant="outlined"
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>
                          {hasAbnormal ? (
                            <Chip
                              label="Abnormal"
                              color="warning"
                              size="small"
                              icon={<AbnormalIcon />}
                              sx={{ fontWeight: 500 }}
                            />
                          ) : (
                            <Chip
                              label="Normal"
                              color="success"
                              size="small"
                              icon={<NormalIcon />}
                              sx={{ fontWeight: 500 }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewResult(result);
                            }}
                            sx={{ 
                              borderRadius: 2,
                              textTransform: 'none'
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      
      {/* Result Detail Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), py: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              {selectedResult?.testName}
            </Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedResult && (
            <>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Test Date
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {formatDate(selectedResult.date)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Ordering Physician
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {selectedResult.doctor}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Category
                  </Typography>
                  <Chip
                    label={selectedResult.category.charAt(0).toUpperCase() + selectedResult.category.slice(1)}
                    variant="outlined"
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                </Grid>
              </Grid>
              
              <Divider sx={{ mb: 3 }} />
              
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Test Results
              </Typography>
              
              <TableContainer component={Paper} elevation={0} sx={{ mb: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Test</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Result</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Units</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Reference Range</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedResult.results.map((item, index) => (
                      <TableRow 
                        key={index}
                        sx={{ 
                          bgcolor: item.status === 'abnormal' ? alpha(theme.palette.warning.main, 0.05) : 'inherit'
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {item.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            fontWeight={600}
                            color={item.status === 'abnormal' ? 'warning.main' : 'text.primary'}
                          >
                            {item.value}
                          </Typography>
                        </TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>{item.range}</TableCell>
                        <TableCell>
                          {item.status === 'normal' ? (
                            <Chip
                              label="Normal"
                              color="success"
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 500, height: 24 }}
                            />
                          ) : (
                            <Chip
                              label="Abnormal"
                              color="warning"
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 500, height: 24 }}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                <strong>Note:</strong> Reference ranges may vary based on age, gender, and other factors. 
                Please consult with your healthcare provider to interpret these results.
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              mr: 1
            }}
          >
            Print
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              mr: 1
            }}
          >
            Download PDF
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCloseDialog}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none'
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LabResultsPage;
