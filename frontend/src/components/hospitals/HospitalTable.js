import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Avatar,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Rating,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  LocationOn as LocationOnIcon,
  LocalHospital as LocalHospitalIcon,
  MedicalServices as MedicalServicesIcon,
  People as PeopleIcon,
  Star as StarIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import HospitalDetailsDialog from './HospitalDetailsDialog';

const HospitalTable = ({ hospitals, onEdit, onDelete, onViewDetails, onChangeStatus }) => {
  const theme = useTheme();
  const [pageSize, setPageSize] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Animation variants
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

  const handleMenuOpen = (event, hospital) => {
    setAnchorEl(event.currentTarget);
    setSelectedHospital(hospital);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    onEdit(selectedHospital);
    handleMenuClose();
  };

  const handleViewDetails = (hospital = null) => {
    const targetHospital = hospital || selectedHospital;
    setSelectedHospital(targetHospital);
    setDetailsDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = () => {
    onDelete(selectedHospital.id);
    setOpenDeleteDialog(false);
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
  };

  const handleChangeStatus = (status) => {
    onChangeStatus(selectedHospital.id, status);
    handleMenuClose();
  };

  // Get type color
  const getTypeColor = (type) => {
    switch (type) {
      case 'general':
        return theme.palette.primary.main;
      case 'specialty':
        return theme.palette.secondary.main;
      case 'teaching':
        return theme.palette.info.main;
      case 'clinic':
        return theme.palette.success.main;
      case 'rehabilitation':
        return theme.palette.warning.main;
      case 'psychiatric':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'pending':
        return 'warning';
      case 'maintenance':
        return 'error';
      default:
        return 'default';
    }
  };

  // Format type for display
  const formatType = (type) => {
    return type.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Hospital',
      flex: 1.5,
      minWidth: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar
            src={params.row.logo}
            alt={params.value}
            variant="rounded"
            sx={{
              bgcolor: !params.row.logo ? alpha(getTypeColor(params.row.type), 0.2) : undefined,
              color: !params.row.logo ? getTypeColor(params.row.type) : undefined,
              width: 40,
              height: 40,
              borderRadius: 2,
            }}
          >
            {!params.row.logo && <LocalHospitalIcon />}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {params.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {params.row.id.substring(0, 8)}...
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'location',
      headerName: 'Location',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LocationOnIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: 'type',
      headerName: 'Type',
      flex: 0.8,
      minWidth: 150,
      renderCell: (params) => (
        <Chip
          label={formatType(params.value)}
          size="small"
          sx={{
            backgroundColor: alpha(getTypeColor(params.value), 0.1),
            color: getTypeColor(params.value),
            fontWeight: 600,
            borderRadius: 1,
          }}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.6,
      minWidth: 120,
      renderCell: (params) => (
        <Chip
          label={params.value.charAt(0).toUpperCase() + params.value.slice(1)}
          size="small"
          color={getStatusColor(params.value)}
          sx={{ fontWeight: 600, borderRadius: 1 }}
        />
      ),
    },
    {
      field: 'beds',
      headerName: 'Capacity',
      flex: 0.6,
      minWidth: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PeopleIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
          <Typography variant="body2">{params.value} beds</Typography>
        </Box>
      ),
    },
    {
      field: 'doctors',
      headerName: 'Doctors',
      flex: 0.6,
      minWidth: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <MedicalServicesIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: 'rating',
      headerName: 'Rating',
      flex: 0.8,
      minWidth: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Rating
            value={params.value}
            readOnly
            precision={0.5}
            size="small"
            icon={<StarIcon fontSize="inherit" />}
            emptyIcon={<StarIcon fontSize="inherit" />}
          />
          <Typography variant="body2" sx={{ ml: 1 }}>
            ({params.value})
          </Typography>
        </Box>
      ),
    },
    {
      field: 'adminName',
      headerName: 'Admin',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PersonIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
          <Typography variant="body2">{params.value || 'No admin assigned'}</Typography>
        </Box>
      ),
    },
    {
      field: 'adminEmail',
      headerName: 'Admin Email',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <EmailIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
          <Typography variant="body2">
            {params.value ? (
              <a href={`mailto:${params.value}`} style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>
                {params.value}
              </a>
            ) : (
              'N/A'
            )}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'adminPhone',
      headerName: 'Admin Phone',
      flex: 0.8,
      minWidth: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PhoneIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
          <Typography variant="body2">
            {params.value ? (
              <a href={`tel:${params.value}`} style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>
                {params.value}
              </a>
            ) : (
              'N/A'
            )}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.5,
      minWidth: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="More Actions">
            <IconButton onClick={(e) => handleMenuOpen(e, params.row)}>
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Responsive column configuration
  const getColumns = useCallback(() => {
    // Get current viewport width
    const isSmallScreen = window.innerWidth < 960;
    const isMediumScreen = window.innerWidth >= 960 && window.innerWidth < 1280;

    // Base columns that always show
    const baseColumns = [
      {
        field: 'name',
        headerName: 'Hospital',
        flex: 1.5,
        minWidth: 200,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              src={params.row.logo}
              alt={params.value}
              variant="rounded"
              sx={{
                bgcolor: !params.row.logo ? alpha(getTypeColor(params.row.type), 0.2) : undefined,
                color: !params.row.logo ? getTypeColor(params.row.type) : undefined,
                width: 40,
                height: 40,
                borderRadius: 2,
              }}
            >
              {!params.row.logo && <LocalHospitalIcon />}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {params.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ID: {params.row.id.substring(0, 8)}...
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        field: 'status',
        headerName: 'Status',
        flex: 0.6,
        minWidth: 100,
        renderCell: (params) => (
          <Chip
            label={params.value.charAt(0).toUpperCase() + params.value.slice(1)}
            size="small"
            color={getStatusColor(params.value)}
            sx={{ fontWeight: 600, borderRadius: 1 }}
          />
        ),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        flex: 0.8,
        minWidth: 120,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="View Details">
              <IconButton
                onClick={() => handleViewDetails(params.row)}
                size="small"
                sx={{
                  color: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                  }
                }}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="More Actions">
              <IconButton
                onClick={(e) => handleMenuOpen(e, params.row)}
                size="small"
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ];

    // Medium screen columns
    const mediumScreenColumns = [
      ...baseColumns,
      {
        field: 'location',
        headerName: 'Location',
        flex: 1,
        minWidth: 150,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationOnIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
            <Typography variant="body2">{params.value}</Typography>
          </Box>
        ),
      },
      {
        field: 'type',
        headerName: 'Type',
        flex: 0.8,
        minWidth: 120,
        renderCell: (params) => (
          <Chip
            label={formatType(params.value)}
            size="small"
            sx={{
              backgroundColor: alpha(getTypeColor(params.value), 0.1),
              color: getTypeColor(params.value),
              fontWeight: 600,
              borderRadius: 1,
            }}
          />
        ),
      },
    ];

    // Large screen columns
    const largeScreenColumns = [
      ...mediumScreenColumns,
      {
        field: 'beds',
        headerName: 'Capacity',
        flex: 0.6,
        minWidth: 100,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PeopleIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
            <Typography variant="body2">{params.value} beds</Typography>
          </Box>
        ),
      },
      {
        field: 'adminName',
        headerName: 'Admin',
        flex: 1,
        minWidth: 150,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
            <Typography variant="body2">{params.value || 'No admin assigned'}</Typography>
          </Box>
        ),
      },
    ];

    // Return appropriate columns based on screen size
    if (isSmallScreen) {
      return baseColumns;
    } else if (isMediumScreen) {
      return mediumScreenColumns;
    } else {
      return largeScreenColumns;
    }
  }, [theme, formatType, getTypeColor, getStatusColor, handleMenuOpen, onViewDetails, handleViewDetails]);

  // State to track window size
  const [windowSize, setWindowSize] = useState(window.innerWidth);
  const [responsiveColumns, setResponsiveColumns] = useState(getColumns());

  // Update columns when window size changes
  useEffect(() => {
    const handleResize = () => {
      setWindowSize(window.innerWidth);
      setResponsiveColumns(getColumns());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [windowSize, getColumns]);

  return (
    <motion.div variants={itemVariants}>
      <Paper
        elevation={0}
        sx={{
          height: { xs: 500, sm: 600, md: 650 },
          width: '100%',
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          overflow: 'hidden',
        }}
      >
        <DataGrid
          rows={hospitals}
          columns={responsiveColumns}
          pageSize={pageSize}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          rowsPerPageOptions={[5, 10, 20, 50]}
          checkboxSelection
          disableSelectionOnClick
          components={{
            Toolbar: GridToolbar,
          }}
          componentsProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
              sx: {
                p: { xs: 1, sm: 2 },
                flexDirection: { xs: 'column', sm: 'row' },
                '& .MuiButton-root': {
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  my: { xs: 0.5, sm: 0 },
                },
                '& .MuiFormControl-root': {
                  width: { xs: '100%', sm: 'auto' },
                  my: { xs: 0.5, sm: 0 },
                },
              },
            },
          }}
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
              borderRadius: '12px 12px 0 0',
            },
            '& .MuiDataGrid-cell': {
              py: 1.5,
              px: { xs: 1, sm: 2 },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
            },
            '& .MuiDataGrid-row.Mui-selected, & .MuiDataGrid-row.Mui-selected:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
            },
            '& .MuiDataGrid-columnSeparator': {
              display: 'none',
            },
            '& .MuiDataGrid-footerContainer': {
              px: { xs: 1, sm: 2 },
            },
            '& .MuiTablePagination-root': {
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
            },
          }}
        />
      </Paper>

      {/* Hospital Details Dialog */}
      <HospitalDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        hospital={selectedHospital}
        onEdit={onEdit}
      />

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 2,
            minWidth: 200,
            overflow: 'visible',
            mt: 1.5,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleViewDetails}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Hospital</ListItemText>
        </MenuItem>
        {selectedHospital?.status === 'active' ? (
          <MenuItem onClick={() => handleChangeStatus('inactive')}>
            <ListItemIcon>
              <BlockIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Deactivate</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem onClick={() => handleChangeStatus('active')}>
            <ListItemIcon>
              <CheckCircleIcon fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText>Activate</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={handleDeleteClick} sx={{ color: theme.palette.error.main }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Hospital</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
          },
        }}
      >
        <DialogTitle>Confirm Hospital Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the hospital "{selectedHospital?.name}"? This action cannot be undone and will affect all associated doctors, patients, and appointments.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            sx={{
              borderRadius: 2,
              background: `linear-gradient(90deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default HospitalTable;
