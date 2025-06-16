const User = require('../models/User');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Get all staff for a hospital
exports.getHospitalStaff = async (req, res) => {
  try {
    console.log('getHospitalStaff called by user:', req.user);
    console.log('User hospitalId:', req.user.hospitalId);
    
    if (!req.user.hospitalId) {
      console.log('No hospitalId found for user');
      return res.status(400).json({ message: 'Hospital ID not found for user' });
    }
    
    // Get query parameters for filtering
    const { role, department, search, status } = req.query;

    // Build query
    const query = {
      hospitalId: req.user.hospitalId,
      role: { 
        $in: [
          'doctor', 'nurse', 'pharmacist', 'receptionist', 'technician', 
          'administrator', 'security', 'maintenance', 'cleaner', 'accountant', 
          'hr_manager', 'it_support', 'lab_technician', 'staff'
        ] 
      }
    };

    // Add filters if provided
    if (role && role !== 'all') {
      query.role = role;
    }

    if (department) {
      query['profile.department'] = department;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    // Fetch staff with populated references
    const staff = await User.find(query)
      .select('-password')
      .sort({ name: 1 });

    // If search parameter is provided, filter results in memory
    let filteredStaff = staff;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredStaff = staff.filter(member =>
        (member.name && member.name.toLowerCase().includes(searchLower)) ||
        (member.email && member.email.toLowerCase().includes(searchLower)) ||
        (member.profile?.department && member.profile.department.toLowerCase().includes(searchLower)) ||
        (member.profile?.specialization && member.profile.specialization.toLowerCase().includes(searchLower))
      );
    }

    // Transform data for frontend
    const formattedStaff = filteredStaff.map(member => ({
      id: member._id,
      _id: member._id,
      name: member.name,
      email: member.email,
      role: member.role,
      department: member.profile?.department || 'General',
      specialization: member.profile?.specialization,
      phone: member.profile?.phone,
      licenseNumber: member.profile?.licenseNumber,
      status: member.status || 'active',
      joinDate: member.createdAt,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
      avatar: member.profile?.avatar,
      position: member.profile?.position,
      shift: member.profile?.shift,
      salary: member.profile?.salary,
      hireDate: member.profile?.hireDate,
      emergencyContact: member.profile?.emergencyContact,
      address: member.profile?.address,
      skills: member.profile?.skills,
      certifications: member.profile?.certifications,
      experience: member.profile?.experience,
      assignedDoctors: member.profile?.assignedDoctors || [],
      assignedPatients: member.profile?.assignedPatients || [],
      appointments: member.profile?.appointments || 0
    }));

    console.log('Found staff:', formattedStaff.length);
    res.json(formattedStaff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ message: 'Error fetching staff', error: error.message });
  }
};

// Get staff by ID
exports.getStaffById = async (req, res) => {
  try {
    const staffId = req.params.id;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(staffId)) {
      return res.status(400).json({ message: 'Invalid staff ID format' });
    }

    const staff = await User.findOne({
      _id: staffId,
      hospitalId: req.user.hospitalId
    }).select('-password');

    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Format response
    const formattedStaff = {
      id: staff._id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      department: staff.profile?.department || 'General',
      specialization: staff.profile?.specialization,
      phone: staff.profile?.phone,
      licenseNumber: staff.profile?.licenseNumber,
      status: staff.status || 'active',
      joinDate: staff.createdAt,
      avatar: staff.profile?.avatar,
      assignedDoctors: staff.profile?.assignedDoctors || [],
      assignedPatients: staff.profile?.assignedPatients || [],
      appointments: staff.profile?.appointments || 0,
      address: staff.profile?.address,
      emergencyContact: staff.profile?.emergencyContact,
      education: staff.profile?.education,
      experience: staff.profile?.experience,
      certifications: staff.profile?.certifications,
      schedule: staff.profile?.schedule
    };

    res.json(formattedStaff);
  } catch (error) {
    console.error('Error fetching staff member:', error);
    res.status(500).json({ message: 'Error fetching staff member', error: error.message });
  }
};

// Create a new staff member
exports.createStaff = async (req, res) => {
  try {
    const {
      name,
      email,
      role,
      department,
      specialization,
      phone,
      licenseNumber,
      address,
      emergencyContact,
      education,
      experience,
      certifications,
      password
    } = req.body;

    // Validate required fields
    if (!name || !email || !role || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new staff member
    const staff = new User({
      name,
      email,
      password: hashedPassword,
      role,
      hospitalId: req.user.hospitalId,
      status: 'active',
      profile: {
        department,
        specialization,
        phone,
        licenseNumber,
        address,
        emergencyContact,
        education,
        experience,
        certifications
      }
    });

    await staff.save();

    // Format response
    const formattedStaff = {
      id: staff._id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      department: staff.profile?.department || 'General',
      specialization: staff.profile?.specialization,
      phone: staff.profile?.phone,
      licenseNumber: staff.profile?.licenseNumber,
      status: staff.status || 'active',
      joinDate: staff.createdAt
    };

    res.status(201).json(formattedStaff);
  } catch (error) {
    console.error('Error creating staff member:', error);
    res.status(500).json({ message: 'Error creating staff member', error: error.message });
  }
};

// Update a staff member
exports.updateStaff = async (req, res) => {
  try {
    const staffId = req.params.id;
    const {
      name,
      email,
      role,
      department,
      specialization,
      phone,
      licenseNumber,
      status,
      address,
      emergencyContact,
      education,
      experience,
      certifications,
      schedule
    } = req.body;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(staffId)) {
      return res.status(400).json({ message: 'Invalid staff ID format' });
    }

    // Check if staff exists and belongs to the hospital
    const staff = await User.findOne({
      _id: staffId,
      hospitalId: req.user.hospitalId
    });

    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Update fields
    const updateData = {
      name: name || staff.name,
      email: email || staff.email,
      role: role || staff.role,
      status: status || staff.status,
      'profile.department': department || staff.profile?.department,
      'profile.specialization': specialization || staff.profile?.specialization,
      'profile.phone': phone || staff.profile?.phone,
      'profile.licenseNumber': licenseNumber || staff.profile?.licenseNumber,
      'profile.address': address || staff.profile?.address,
      'profile.emergencyContact': emergencyContact || staff.profile?.emergencyContact,
      'profile.education': education || staff.profile?.education,
      'profile.experience': experience || staff.profile?.experience,
      'profile.certifications': certifications || staff.profile?.certifications,
      'profile.schedule': schedule || staff.profile?.schedule
    };

    const updatedStaff = await User.findByIdAndUpdate(
      staffId,
      updateData,
      { new: true }
    ).select('-password');

    // Format response
    const formattedStaff = {
      id: updatedStaff._id,
      name: updatedStaff.name,
      email: updatedStaff.email,
      role: updatedStaff.role,
      department: updatedStaff.profile?.department || 'General',
      specialization: updatedStaff.profile?.specialization,
      phone: updatedStaff.profile?.phone,
      licenseNumber: updatedStaff.profile?.licenseNumber,
      status: updatedStaff.status || 'active',
      joinDate: updatedStaff.createdAt,
      address: updatedStaff.profile?.address,
      emergencyContact: updatedStaff.profile?.emergencyContact,
      education: updatedStaff.profile?.education,
      experience: updatedStaff.profile?.experience,
      certifications: updatedStaff.profile?.certifications,
      schedule: updatedStaff.profile?.schedule
    };

    res.json(formattedStaff);
  } catch (error) {
    console.error('Error updating staff member:', error);
    res.status(500).json({ message: 'Error updating staff member', error: error.message });
  }
};

// Delete a staff member
exports.deleteStaff = async (req, res) => {
  try {
    const staffId = req.params.id;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(staffId)) {
      return res.status(400).json({ message: 'Invalid staff ID format' });
    }

    // Check if staff exists and belongs to the hospital
    const staff = await User.findOne({
      _id: staffId,
      hospitalId: req.user.hospitalId
    });

    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Delete staff member
    await User.findByIdAndDelete(staffId);

    res.json({ message: 'Staff member deleted successfully' });
  } catch (error) {
    console.error('Error deleting staff member:', error);
    res.status(500).json({ message: 'Error deleting staff member', error: error.message });
  }
};

// Get staff statistics
exports.getStaffStats = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;

    // Count staff by role
    const roleStats = await User.aggregate([
      {
        $match: {
          hospitalId: hospitalId,
          role: { $in: ['doctor', 'nurse', 'pharmacist', 'staff', 'receptionist', 'lab_technician'] }
        }
      },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Count staff by department
    const departmentStats = await User.aggregate([
      {
        $match: {
          hospitalId: hospitalId,
          role: { $in: ['doctor', 'nurse', 'pharmacist', 'staff', 'receptionist', 'lab_technician'] },
          'profile.department': { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$profile.department',
          count: { $sum: 1 }
        }
      }
    ]);

    // Count staff by status
    const statusStats = await User.aggregate([
      {
        $match: {
          hospitalId: hospitalId,
          role: { $in: ['doctor', 'nurse', 'pharmacist', 'staff', 'receptionist', 'lab_technician'] }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format response
    const stats = {
      byRole: roleStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      byDepartment: departmentStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      byStatus: statusStats.reduce((acc, stat) => {
        acc[stat._id || 'active'] = stat.count;
        return acc;
      }, {}),
      total: await User.countDocuments({
        hospitalId,
        role: { $in: ['doctor', 'nurse', 'pharmacist', 'staff', 'receptionist', 'lab_technician'] }
      })
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching staff statistics:', error);
    res.status(500).json({ message: 'Error fetching staff statistics', error: error.message });
  }
};

// Assign staff to departments
exports.assignDepartment = async (req, res) => {
  try {
    const { staffIds, department } = req.body;

    // Validate required fields
    if (!staffIds || !Array.isArray(staffIds) || !department) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Update staff members
    const updatePromises = staffIds.map(staffId =>
      User.findOneAndUpdate(
        { _id: staffId, hospitalId: req.user.hospitalId },
        { 'profile.department': department },
        { new: true }
      ).select('-password')
    );

    const updatedStaff = await Promise.all(updatePromises);

    // Filter out null results (staff not found)
    const validUpdates = updatedStaff.filter(staff => staff !== null);

    if (validUpdates.length === 0) {
      return res.status(404).json({ message: 'No staff members found' });
    }

    // Format response
    const formattedStaff = validUpdates.map(staff => ({
      id: staff._id,
      name: staff.name,
      role: staff.role,
      department: staff.profile?.department || 'General'
    }));

    res.json(formattedStaff);
  } catch (error) {
    console.error('Error assigning department:', error);
    res.status(500).json({ message: 'Error assigning department', error: error.message });
  }
};

// Update staff status (active, inactive, on_leave)
exports.updateStaffStatus = async (req, res) => {
  try {
    const { staffIds, status } = req.body;

    // Validate required fields
    if (!staffIds || !Array.isArray(staffIds) || !status) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate status
    const validStatuses = ['active', 'inactive', 'on_leave', 'suspended'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Update staff members
    const updatePromises = staffIds.map(staffId =>
      User.findOneAndUpdate(
        { _id: staffId, hospitalId: req.user.hospitalId },
        { status },
        { new: true }
      ).select('-password')
    );

    const updatedStaff = await Promise.all(updatePromises);

    // Filter out null results (staff not found)
    const validUpdates = updatedStaff.filter(staff => staff !== null);

    if (validUpdates.length === 0) {
      return res.status(404).json({ message: 'No staff members found' });
    }

    // Format response
    const formattedStaff = validUpdates.map(staff => ({
      id: staff._id,
      name: staff.name,
      role: staff.role,
      status: staff.status
    }));

    res.json(formattedStaff);
  } catch (error) {
    console.error('Error updating staff status:', error);
    res.status(500).json({ message: 'Error updating staff status', error: error.message });
  }
};
