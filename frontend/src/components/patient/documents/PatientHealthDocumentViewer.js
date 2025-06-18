import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Paper,
  Stack,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  alpha,
  Fab,
  TextField,
  Switch,
  FormControlLabel,
  Menu,
  MenuItem,
  ListItemButton,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Folder as FolderIcon,
  Description as DocumentIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  QrCode as QrCodeIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationIcon,
  Message as MessageIcon,
  Phone as PhoneIcon,
  Medication as MedicationIcon,
  Science as LabIcon,
  Assignment as ReportIcon,
  Receipt as PrescriptionIcon,
  EventNote as FollowUpIcon,
  Sick as SickNoteIcon,
  Summarize as SummaryIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  Refresh as RefreshIcon,
  Star as StarIcon,
  BookmarkBorder as BookmarkIcon,
  MoreVert as MoreVertIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  CalendarToday as CalendarIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, parseISO } from 'date-fns';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import axios from '../../../utils/axiosConfig';

const PatientHealthDocumentViewer = ({ onSuccess, onError }) => {
  const theme = useTheme();
  const { user } = useSelector((state) => state.userAuth || state.auth);
  
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);

  // Document folders
  const documentFolders = [
    { id: 'all', name: 'All Documents', icon: <FolderIcon />, count: 12, color: 'primary' },
    { id: 'prescriptions', name: 'Prescriptions', icon: <PrescriptionIcon />, count: 5, color: 'success' },
    { id: 'lab_orders', name: 'Lab Orders', icon: <LabIcon />, count: 3, color: 'info' },
    { id: 'results', name: 'Test Results', icon: <ReportIcon />, count: 2, color: 'warning' },
    { id: 'reports', name: 'Medical Reports', icon: <SummaryIcon />, count: 2, color: 'secondary' }
  ];

  // Fetch documents
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/documents/patient');
      const documentsData = response.data;
      
      // Ensure we always set an array
      if (Array.isArray(documentsData)) {
        setDocuments(documentsData);
      } else if (documentsData && Array.isArray(documentsData.documents)) {
        setDocuments(documentsData.documents);
      } else {
        setDocuments([]);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      // Mock data for demo - always ensure it's an array
      setDocuments([
        {
          _id: '1',
          title: 'Prescription - Antibiotics',
          type: 'prescriptions',
          doctorName: 'Dr. Smith',
          hospitalName: 'City Hospital',
          createdAt: new Date().toISOString(),
          status: 'active',
          hasQR: true,
          content: 'Amoxicillin 500mg - Take 3 times daily for 7 days'
        },
        {
          _id: '2',
          title: 'Blood Test Results',
          type: 'results',
          doctorName: 'Dr. Johnson',
          hospitalName: 'Medical Center',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          status: 'reviewed',
          hasQR: false,
          content: 'All values within normal range'
        },
        {
          _id: '3',
          title: 'Lab Order - Cholesterol Check',
          type: 'lab_orders',
          doctorName: 'Dr. Brown',
          hospitalName: 'Health Clinic',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          status: 'pending',
          hasQR: true,
          content: 'Lipid panel and glucose test'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = selectedFolder === 'all' 
    ? (documents || [])
    : (documents || []).filter(doc => doc.type === selectedFolder);

  const handleViewDocument = (document) => {
    setSelectedDocument(document);
    setViewDialogOpen(true);
  };

  const handleShowQR = (document) => {
    setSelectedDocument(document);
    setQrDialogOpen(true);
  };

  const handleSetReminder = (document) => {
    setSelectedDocument(document);
    setReminderDialogOpen(true);
  };

  const handleDownload = (document) => {
    // Mock download functionality
    console.log('Downloading document:', document.title);
    if (onSuccess) {
      onSuccess('Document downloaded successfully');
    }
  };

  const handleRequestClarification = (document) => {
    // Mock chat/call request
    console.log('Requesting clarification for:', document.title);
    if (onSuccess) {
      onSuccess('Clarification request sent to doctor');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'reviewed': return 'info';
      case 'expired': return 'error';
      default: return 'default';
    }
  };

  const getDocumentIcon = (type) => {
    switch (type) {
      case 'prescriptions': return <PrescriptionIcon />;
      case 'lab_orders': return <LabIcon />;
      case 'results': return <ReportIcon />;
      case 'reports': return <SummaryIcon />;
      default: return <DocumentIcon />;
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          My Health Documents
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage your medical documents, prescriptions, and test results
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Sidebar - Document Folders */}
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Document Folders
            </Typography>
            <List>
              {documentFolders.map((folder) => (
                <ListItemButton
                  key={folder.id}
                  selected={selectedFolder === folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    '&.Mui-selected': {
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: `${folder.color}.main` }}>
                    {folder.icon}
                  </ListItemIcon>
                  <ListItemText primary={folder.name} />
                  <Badge badgeContent={folder.count} color={folder.color} />
                </ListItemButton>
              ))}
            </List>
          </Card>
        </Grid>

        {/* Main Content - Documents List */}
        <Grid item xs={12} md={9}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {documentFolders.find(f => f.id === selectedFolder)?.name || 'Documents'}
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchDocuments}
                >
                  Refresh
                </Button>
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : filteredDocuments.length === 0 ? (
                <Box sx={{ textAlign: 'center', p: 4 }}>
                  <FolderIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No documents found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your medical documents will appear here when available
                  </Typography>
                </Box>
              ) : (
                <List>
                  {(filteredDocuments || []).map((document, index) => (
                    <React.Fragment key={document._id}>
                      <ListItem sx={{ py: 2 }}>
                        <ListItemIcon>
                          {getDocumentIcon(document.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                {document.title}
                              </Typography>
                              <Chip
                                label={document.status}
                                size="small"
                                color={getStatusColor(document.status)}
                              />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                From: {document.doctorName} • {document.hospitalName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {format(new Date(document.createdAt), 'PPP')}
                              </Typography>
                              <Typography variant="body2" sx={{ mt: 0.5 }}>
                                {document.content}
                              </Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="View Document">
                              <IconButton
                                size="small"
                                onClick={() => handleViewDocument(document)}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Download">
                              <IconButton
                                size="small"
                                onClick={() => handleDownload(document)}
                              >
                                <DownloadIcon />
                              </IconButton>
                            </Tooltip>
                            {document.hasQR && (
                              <Tooltip title="Show QR Code">
                                <IconButton
                                  size="small"
                                  onClick={() => handleShowQR(document)}
                                >
                                  <QrCodeIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            {document.type === 'prescriptions' && (
                              <Tooltip title="Set Reminder">
                                <IconButton
                                  size="small"
                                  onClick={() => handleSetReminder(document)}
                                >
                                  <NotificationIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Ask Doctor">
                              <IconButton
                                size="small"
                                onClick={() => handleRequestClarification(document)}
                              >
                                <MessageIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < filteredDocuments.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* View Document Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedDocument?.title}
        </DialogTitle>
        <DialogContent>
          {selectedDocument && (
            <Box sx={{ p: 2 }}>
              <Paper sx={{ p: 3, mb: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Document Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Doctor
                    </Typography>
                    <Typography variant="body1">
                      {selectedDocument.doctorName}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Hospital
                    </Typography>
                    <Typography variant="body1">
                      {selectedDocument.hospitalName}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Date
                    </Typography>
                    <Typography variant="body1">
                      {format(new Date(selectedDocument.createdAt), 'PPP')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={selectedDocument.status}
                      size="small"
                      color={getStatusColor(selectedDocument.status)}
                    />
                  </Grid>
                </Grid>
              </Paper>
              
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Content
                </Typography>
                <Typography variant="body1">
                  {selectedDocument.content}
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<DownloadIcon />}>
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog
        open={qrDialogOpen}
        onClose={() => setQrDialogOpen(false)}
        maxWidth="sm"
      >
        <DialogTitle>Prescription QR Code</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Show this QR code to your pharmacy
            </Typography>
            {selectedDocument && (
              <QRCode
                value={`prescription:${selectedDocument._id}`}
                size={200}
                level="M"
              />
            )}
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              {selectedDocument?.title}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialogOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<PrintIcon />}>
            Print
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reminder Dialog */}
      <Dialog
        open={reminderDialogOpen}
        onClose={() => setReminderDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Set Medication Reminder</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Reminder Time"
              type="time"
              defaultValue="08:00"
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Frequency</InputLabel>
              <Select defaultValue="daily" label="Frequency">
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="twice">Twice a day</MenuItem>
                <MenuItem value="three">Three times a day</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Enable notifications"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReminderDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              setReminderDialogOpen(false);
              if (onSuccess) {
                onSuccess('Medication reminder set successfully');
              }
            }}
          >
            Set Reminder
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PatientHealthDocumentViewer;