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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  Switch,
  FormControlLabel,
  Menu,
  Autocomplete,
  Avatar,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Description as DocumentIcon,
  Send as SendIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  Medication as MedicationIcon,
  Science as LabIcon,
  Assignment as ReportIcon,
  Receipt as PrescriptionIcon,
  EventNote as FollowUpIcon,
  Sick as SickNoteIcon,
  Summarize as SummaryIcon,
  Image as ImageIcon,
  Signature as SignatureIcon,
  SmartToy as AIIcon,
  History as HistoryIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Upload as UploadIcon,
  AttachFile as AttachFileIcon,
  QrCode as QrCodeIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Folder as FolderIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationIcon,
  Star as StarIcon,
  BookmarkBorder as BookmarkIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  CloudUpload as CloudUploadIcon,
  PhotoCamera as CameraIcon,
  MedicalInformation as MedicalInfoIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import SignatureCanvas from 'react-signature-canvas';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import axios from '../../../utils/axiosConfig';

const DoctorDocumentCenter = ({ onSuccess, onError }) => {
  const theme = useTheme();
  const { user } = useSelector((state) => state.userAuth || state.auth);
  
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Document templates
  const documentTemplates = [
    { id: 'prescription', name: 'Prescription', icon: <PrescriptionIcon />, color: 'primary' },
    { id: 'medical_report', name: 'Medical Report', icon: <ReportIcon />, color: 'secondary' },
    { id: 'lab_order', name: 'Lab Order', icon: <LabIcon />, color: 'info' },
    { id: 'test_results', name: 'Test Results', icon: <MedicalInfoIcon />, color: 'success' },
    { id: 'follow_up', name: 'Follow-up Instructions', icon: <FollowUpIcon />, color: 'warning' },
    { id: 'medication_plan', name: 'Medication Plan', icon: <MedicationIcon />, color: 'error' },
    { id: 'sick_note', name: 'Sick Note', icon: <SickNoteIcon />, color: 'default' },
    { id: 'visit_summary', name: 'Visit Summary', icon: <SummaryIcon />, color: 'primary' }
  ];

  // Fetch documents
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/documents/doctor');
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
          title: 'Prescription for John Doe',
          type: 'prescription',
          patientName: 'John Doe',
          createdAt: new Date().toISOString(),
          status: 'sent'
        },
        {
          _id: '2',
          title: 'Medical Report for Jane Smith',
          type: 'medical_report',
          patientName: 'Jane Smith',
          createdAt: new Date().toISOString(),
          status: 'draft'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = () => {
    setCreateDialogOpen(true);
  };

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
    // Here you would open the specific document editor
    console.log('Selected template:', templateId);
    setCreateDialogOpen(false);
  };

  const handleViewDocument = (document) => {
    setSelectedDocument(document);
    setViewDialogOpen(true);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Document Center
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create, manage, and send medical documents to patients
        </Typography>
      </Box>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Document Templates
            </Typography>
            <Grid container spacing={2}>
              {documentTemplates.map((template) => (
                <Grid item xs={6} sm={4} md={3} key={template.id}>
                  <Card
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4
                      }
                    }}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <Box sx={{ color: `${template.color}.main`, mb: 1 }}>
                        {template.icon}
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: 500 }}>
                        {template.name}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Quick Stats
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Documents Created</Typography>
                <Chip label="24" size="small" color="primary" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Sent This Week</Typography>
                <Chip label="8" size="small" color="success" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Pending Review</Typography>
                <Chip label="3" size="small" color="warning" />
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Documents */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Recent Documents</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateDocument}
            >
              Create Document
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {(documents || []).map((document, index) => (
                <React.Fragment key={document._id}>
                  <ListItem>
                    <ListItemIcon>
                      <DocumentIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={document.title}
                      secondary={`Patient: ${document.patientName} • ${format(new Date(document.createdAt), 'MMM dd, yyyy')}`}
                    />
                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={1}>
                        <Chip
                          label={document.status}
                          size="small"
                          color={document.status === 'sent' ? 'success' : 'default'}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleViewDocument(document)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < documents.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Create Document Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Select Document Template</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {documentTemplates.map((template) => (
              <Grid item xs={6} sm={4} key={template.id}>
                <Card
                  sx={{
                    p: 3,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4
                    }
                  }}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ color: `${template.color}.main`, mb: 2, fontSize: 40 }}>
                      {template.icon}
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {template.name}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

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
              <Typography variant="body1">
                Document preview would appear here...
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Patient: {selectedDocument.patientName}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Created: {format(new Date(selectedDocument.createdAt), 'PPP')}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Status: {selectedDocument.status}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<DownloadIcon />}>
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DoctorDocumentCenter;