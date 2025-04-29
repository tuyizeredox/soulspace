import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
  alpha,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
  LocalHospital as LocalHospitalIcon,
  MedicalServices as MedicalServicesIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Psychology as PsychologyIcon,
  Healing as HealingIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

const StaffList = ({ staff, onView, onEdit, onDelete }) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);

  // Handle menu open
  const handleMenuOpen = (event, staff) => {
    setAnchorEl(event.currentTarget);
    setSelectedStaff(staff);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedStaff(null);
  };

  // Handle view action
  const handleView = () => {
    handleMenuClose();
    onView(selectedStaff);
  };

  // Handle edit action
  const handleEdit = () => {
    handleMenuClose();
    onEdit(selectedStaff);
  };

  // Handle delete action
  const handleDelete = () => {
    handleMenuClose();
    onDelete(selectedStaff);
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get role icon
  const getRoleIcon = (role) => {
    switch (role) {
      case 'doctor':
        return <LocalHospitalIcon fontSize="small" />;
      case 'nurse':
        return <MedicalServicesIcon fontSize="small" />;
      case 'pharmacist':
        return <LocalPharmacyIcon fontSize="small" />;
      case 'receptionist':
        return <PersonIcon fontSize="small" />;
      case 'lab_technician':
        return <HealingIcon fontSize="small" />;
      default:
        return <AssignmentIcon fontSize="small" />;
    }
  };

  // Get role color
  const getRoleColor = (role) => {
    switch (role) {
      case 'doctor':
        return theme.palette.primary.main;
      case 'nurse':
        return theme.palette.info.main;
      case 'pharmacist':
        return theme.palette.success.main;
      case 'receptionist':
        return theme.palette.warning.main;
      case 'lab_technician':
        return theme.palette.secondary.main;
      default:
        return theme.palette.grey[700];
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon fontSize="small" />;
      case 'inactive':
        return <CancelIcon fontSize="small" />;
      case 'on_leave':
        return <AccessTimeIcon fontSize="small" />;
      case 'suspended':
        return <CancelIcon fontSize="small" />;
      default:
        return <CheckCircleIcon fontSize="small" />;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return theme.palette.success.main;
      case 'inactive':
        return theme.palette.error.main;
      case 'on_leave':
        return theme.palette.warning.main;
      case 'suspended':
        return theme.palette.error.main;
      default:
        return theme.palette.success.main;
    }
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Calculate displayed rows
  const displayedRows = staff.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Staff Member</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Join Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedRows.map((member) => (
              <TableRow
                key={member.id}
                sx={{
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  },
                  cursor: 'pointer',
                }}
                onClick={() => onView(member)}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      src={member.avatar}
                      sx={{
                        bgcolor: alpha(getRoleColor(member.role), 0.1),
                        color: getRoleColor(member.role),
                        mr: 2
                      }}
                    >
                      {getInitials(member.name)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {member.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {member.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={getRoleIcon(member.role)}
                    label={member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    size="small"
                    sx={{
                      bgcolor: alpha(getRoleColor(member.role), 0.1),
                      color: getRoleColor(member.role),
                      fontWeight: 500,
                      '& .MuiChip-icon': {
                        color: getRoleColor(member.role),
                      }
                    }}
                  />
                </TableCell>
                <TableCell>{member.department || 'N/A'}</TableCell>
                <TableCell>
                  <Typography variant="body2">{member.phone || 'N/A'}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={getStatusIcon(member.status)}
                    label={member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    size="small"
                    sx={{
                      bgcolor: alpha(getStatusColor(member.status), 0.1),
                      color: getStatusColor(member.status),
                      fontWeight: 500,
                      '& .MuiChip-icon': {
                        color: getStatusColor(member.status),
                      }
                    }}
                  />
                </TableCell>
                <TableCell>{formatDate(member.joinDate)}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuOpen(e, member);
                    }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={staff.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            borderRadius: 2,
            minWidth: 180
          }
        }}
      >
        <MenuItem onClick={handleView}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: theme.palette.error.main }}>
          <ListItemIcon sx={{ color: theme.palette.error.main }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default StaffList;
