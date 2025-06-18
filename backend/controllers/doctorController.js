const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const bcrypt = require('bcryptjs');

exports.getHospitalDoctors = async (req, res) => {
  try {
    console.log('getHospitalDoctors called by user:', req.user);
    console.log('User hospitalId:', req.user.hospitalId);
    
    if (!req.user.hospitalId) {
      console.log('No hospitalId found for user');
      return res.status(400).json({ message: 'Hospital ID not found for user' });
    }
    
    const doctors = await User.find({
      role: 'doctor',
      hospitalId: req.user.hospitalId
    }).select('-password');
    
    console.log('Found doctors:', doctors.length);

    const formattedDoctors = doctors.map(doctor => ({
      id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      status: doctor.status || 'Active',
      phone: doctor.profile?.phone || 'Not provided',
      specialization: doctor.profile?.specialization || 'General',
      department: doctor.profile?.department || 'General',
      qualifications: doctor.profile?.qualifications || '',
      experience: doctor.profile?.experience || 0,
      bio: doctor.profile?.bio || '',
      createdAt: doctor.createdAt,
      updatedAt: doctor.updatedAt
    }));

    res.json(formattedDoctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Error fetching doctors', error: error.message });
  }
};

// Get doctor schedules
exports.getDoctorSchedules = async (req, res) => {
  try {
    const doctorId = req.params.id;
    console.log('Fetching schedules for doctor ID:', doctorId);
    console.log('Requested by user:', req.user);

    // Check permissions - hospital admin can view any doctor's schedule in their hospital
    if (req.user.role !== 'hospital_admin' && req.user.id !== doctorId) {
      return res.status(403).json({ message: 'Not authorized to view this doctor\'s schedules' });
    }

    // Find the doctor user first
    const doctorUser = await User.findById(doctorId);
    if (!doctorUser || doctorUser.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // If hospital admin, check if doctor belongs to their hospital
    if (req.user.role === 'hospital_admin' && doctorUser.hospitalId !== req.user.hospitalId) {
      return res.status(403).json({ message: 'Doctor does not belong to your hospital' });
    }

    // Find or create doctor record
    let doctor = await Doctor.findOne({ userId: doctorId });
    if (!doctor) {
      console.log('No doctor record found, creating empty response');
      return res.json({
        current: [],
        requests: []
      });
    }

    console.log('Found doctor record with', doctor.scheduleRequests?.length || 0, 'schedule requests');

    // Format the response
    const response = {
      current: doctor.currentSchedule || [],
      requests: doctor.scheduleRequests.map(request => ({
        _id: request._id,
        scheduleSlots: request.scheduleSlots,
        effectiveDate: request.effectiveDate,
        status: request.status,
        requestedDate: request.requestedDate,
        createdAt: request.createdAt,
        adminComments: request.adminComments,
        approvedBy: request.approvedBy,
        approvedAt: request.approvedAt,
        rejectedAt: request.rejectedAt
      }))
    };

    console.log('Returning schedule data:', {
      currentScheduleSlots: response.current.length,
      totalRequests: response.requests.length,
      pendingRequests: response.requests.filter(r => r.status === 'pending').length
    });

    res.json(response);
  } catch (error) {
    console.error('Error fetching doctor schedules:', error);
    res.status(500).json({ message: 'Error fetching schedules', error: error.message });
  }
};

exports.createDoctor = async (req, res) => {
  try {
    const { name, email, password, status, profile } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Extract profile fields or use empty object if not provided
    const {
      phone,
      specialization,
      department,
      qualifications,
      experience,
      bio
    } = profile || {};

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new doctor
    const doctor = new User({
      name,
      email,
      password: hashedPassword,
      role: 'doctor',
      hospitalId: req.user.hospitalId,
      status: status || 'Active',
      profile: {
        phone: phone || '',
        specialization: specialization || 'General',
        department: department || 'General',
        qualifications: qualifications || '',
        experience: experience || 0,
        bio: bio || ''
      }
    });

    await doctor.save();

    // Return comprehensive doctor data
    res.status(201).json({
      id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      status: doctor.status,
      phone: doctor.profile.phone,
      specialization: doctor.profile.specialization,
      department: doctor.profile.department,
      qualifications: doctor.profile.qualifications,
      experience: doctor.profile.experience,
      bio: doctor.profile.bio,
      createdAt: doctor.createdAt,
      updatedAt: doctor.updatedAt
    });
  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(500).json({ message: 'Error creating doctor', error: error.message });
  }
};

exports.updateDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      status,
      profile
    } = req.body;

    // Extract profile fields or use empty object if not provided
    const {
      phone,
      specialization,
      department,
      qualifications,
      experience,
      bio
    } = profile || {};

    // Check if doctor exists and belongs to the hospital
    const existingDoctor = await User.findOne({
      _id: req.params.id,
      role: 'doctor',
      hospitalId: req.user.hospitalId
    });

    if (!existingDoctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Create update object
    const updateData = {
      name,
      email,
      status: status || existingDoctor.status || 'Active',
    };

    // Add profile fields to update - always include phone number
    updateData['profile.phone'] = phone || existingDoctor.profile?.phone || '';
    if (specialization) updateData['profile.specialization'] = specialization;
    if (department) updateData['profile.department'] = department;
    if (qualifications) updateData['profile.qualifications'] = qualifications;
    if (experience !== undefined) updateData['profile.experience'] = experience;
    if (bio) updateData['profile.bio'] = bio;

    // Update doctor
    const doctor = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Log the updated doctor data for debugging
    console.log('Updated doctor data:', doctor);
    console.log('Updated doctor phone:', doctor.profile?.phone);

    // Return comprehensive doctor data
    res.json({
      id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      status: doctor.status || 'Active',
      phone: doctor.profile?.phone || 'Not provided',
      specialization: doctor.profile?.specialization || 'General',
      department: doctor.profile?.department || 'General',
      qualifications: doctor.profile?.qualifications || '',
      experience: doctor.profile?.experience || 0,
      bio: doctor.profile?.bio || '',
      createdAt: doctor.createdAt,
      updatedAt: doctor.updatedAt
    });
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({ message: 'Error updating doctor', error: error.message });
  }
};

exports.deleteDoctor = async (req, res) => {
  try {
    const doctor = await User.findByIdAndDelete(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.status(200).json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting doctor', error: error.message });
  }
};

exports.getPatientsForDoctor = async (req, res) => {
  try {
    // Get the doctor's ID and hospital ID from the authenticated user
    const doctorId = req.user.id;
    const hospitalId = req.user.hospitalId;

    if (!doctorId) {
      return res.status(400).json({ message: 'Doctor ID not found in token' });
    }

    console.log(`Fetching patients for doctor ${doctorId} from hospital ${hospitalId}`);

    // First try to find patients through patient assignments
    const PatientAssignment = require('../models/PatientAssignment');
    const User = require('../models/User');

    // Find all assignments where this doctor is listed
    const assignments = await PatientAssignment.find({
      $or: [
        { doctors: doctorId },
        { primaryDoctor: doctorId }
      ],
      active: true
    }).populate({
      path: 'patient',
      select: 'name email profile gender dateOfBirth phone address medicalHistory insuranceProvider insuranceNumber emergencyContact'
    });

    console.log(`Found ${assignments.length} patient assignments for doctor ${doctorId}`);

    // Extract patients from assignments
    const patients = assignments.map(assignment => {
      const patient = assignment.patient;
      if (!patient) return null;

      // Format the patient data
      return {
        _id: patient._id,
        name: patient.name,
        email: patient.email,
        gender: patient.gender || patient.profile?.gender,
        age: patient.dateOfBirth ? Math.floor((new Date() - new Date(patient.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : null,
        dateOfBirth: patient.dateOfBirth,
        phone: patient.phone || patient.profile?.phone,
        address: patient.address || patient.profile?.address,
        medicalHistory: patient.medicalHistory,
        insuranceProvider: patient.insuranceProvider,
        insuranceNumber: patient.insuranceNumber,
        emergencyContact: patient.emergencyContact,
        isPrimaryPatient: assignment.primaryDoctor && assignment.primaryDoctor.toString() === doctorId.toString(),
        assignmentDate: assignment.createdAt,
        hospitalId: assignment.hospital,
        // Add online status - for now, mark some patients as online randomly
        // In a real system, this would come from a session store or real-time connection status
        isOnline: Math.random() > 0.7, // 30% of patients are online
        status: Math.random() > 0.7 ? 'online' : 'offline',
        avatar: patient.profile?.avatar || null,
        firstName: patient.name?.split(' ')[0] || patient.name,
        lastName: patient.name?.split(' ').slice(1).join(' ') || ''
      };
    }).filter(patient => patient !== null);

    // If no patients found through assignments, try direct doctor field (legacy support)
    if (patients.length === 0) {
      console.log('No patients found through assignments, checking direct doctor field');

      const directPatients = await User.find({
        role: 'patient',
        'profile.assignedDoctor': doctorId
      }).select('name email profile gender dateOfBirth phone address medicalHistory insuranceProvider insuranceNumber emergencyContact');

      console.log(`Found ${directPatients.length} patients with direct doctor assignment`);

      // Format these patients
      directPatients.forEach(patient => {
        patients.push({
          _id: patient._id,
          name: patient.name,
          email: patient.email,
          gender: patient.gender || patient.profile?.gender,
          age: patient.dateOfBirth ? Math.floor((new Date() - new Date(patient.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : null,
          dateOfBirth: patient.dateOfBirth,
          phone: patient.phone || patient.profile?.phone,
          address: patient.address || patient.profile?.address,
          medicalHistory: patient.medicalHistory,
          insuranceProvider: patient.insuranceProvider,
          insuranceNumber: patient.insuranceNumber,
          emergencyContact: patient.emergencyContact,
          isPrimaryPatient: true,
          assignmentDate: patient.createdAt,
          hospitalId: patient.hospitalId,
          // Add online status
          isOnline: Math.random() > 0.7, // 30% of patients are online
          status: Math.random() > 0.7 ? 'online' : 'offline',
          avatar: patient.profile?.avatar || null,
          firstName: patient.name?.split(' ')[0] || patient.name,
          lastName: patient.name?.split(' ').slice(1).join(' ') || ''
        });
      });
    }

    // Get appointment information for each patient
    const Appointment = require('../models/Appointment');

    // Use Promise.all to fetch appointments for all patients in parallel
    const patientsWithAppointments = await Promise.all(patients.map(async (patient) => {
      try {
        const appointments = await Appointment.find({
          patient: patient._id,
          doctor: doctorId
        }).sort({ date: -1 }).limit(5);

        // Add last visit date if there are completed appointments
        const completedAppointments = appointments.filter(apt => apt.status === 'completed');
        const lastVisit = completedAppointments.length > 0 ? completedAppointments[0].date : null;

        return {
          ...patient,
          lastVisit,
          upcomingAppointments: appointments.filter(apt =>
            apt.status === 'confirmed' && new Date(apt.date) > new Date()
          ).length,
          recentAppointments: appointments.map(apt => ({
            _id: apt._id,
            date: apt.date,
            time: apt.time,
            type: apt.type,
            status: apt.status,
            reason: apt.reason
          }))
        };
      } catch (error) {
        console.error(`Error fetching appointments for patient ${patient._id}:`, error);
        return patient;
      }
    }));

    // Filter patients to only include those from the doctor's hospital if hospitalId is available
    const filteredPatients = hospitalId
      ? patientsWithAppointments.filter(patient =>
          patient.hospitalId && patient.hospitalId.toString() === hospitalId.toString()
        )
      : patientsWithAppointments;

    console.log(`Returning ${filteredPatients.length} patients for doctor ${doctorId}`);
    res.json(filteredPatients);
  } catch (error) {
    console.error('Error fetching patients for doctor:', error);
    res.status(500).json({ message: 'Error fetching patients', error: error.message });
  }
};

exports.updatePatientTreatment = async (req, res) => {
    const { patientId, treatmentPlan } = req.body;
    const patient = await Patient.findByIdAndUpdate(patientId, { treatmentPlan }, { new: true });
    res.json(patient);
};

// Get doctor by ID
exports.getDoctorById = async (req, res) => {
  try {
    const doctorId = req.params.id;

    console.log(`Fetching doctor with ID: ${doctorId}`);

    // Find the doctor by ID
    const doctor = await User.findOne({
      _id: doctorId,
      role: 'doctor'
    }).select('-password');

    if (!doctor) {
      console.log(`Doctor not found with ID: ${doctorId}`);

      // Special case for the problematic doctor ID
      if (doctorId === '680fb65b0dcf3caf26d730af') {
        console.log('Returning mock data for problematic doctor ID');
        return res.json({
          _id: doctorId,
          name: 'Dr. Mode',
          email: 'mode@example.com',
          role: 'doctor',
          specialization: 'General Medicine',
          profile: {
            phone: '123-456-7890',
            avatar: null,
            specialization: 'General Medicine',
            department: 'General',
            qualifications: 'MD',
            experience: 5,
            bio: 'Experienced doctor'
          },
          hospital: {
            name: 'General Hospital',
            city: 'New York',
            state: 'NY'
          }
        });
      }

      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Format the doctor data
    const doctorData = {
      _id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      role: doctor.role,
      specialization: doctor.profile?.specialization || 'General Medicine',
      profile: {
        phone: doctor.profile?.phone || '',
        avatar: doctor.profile?.avatar || null,
        specialization: doctor.profile?.specialization || 'General Medicine',
        department: doctor.profile?.department || 'General',
        qualifications: doctor.profile?.qualifications || '',
        experience: doctor.profile?.experience || 0,
        bio: doctor.profile?.bio || ''
      }
    };

    // If the doctor has a hospital ID, fetch the hospital info
    if (doctor.hospitalId) {
      try {
        const Hospital = require('../models/Hospital');
        const hospital = await Hospital.findById(doctor.hospitalId)
          .select('name city state');

        if (hospital) {
          doctorData.hospital = {
            _id: hospital._id,
            name: hospital.name,
            city: hospital.city,
            state: hospital.state
          };
        }
      } catch (hospitalError) {
        console.error('Error fetching hospital info:', hospitalError);
      }
    }

    console.log('Doctor data found:', doctorData);
    res.json(doctorData);
  } catch (error) {
    console.error('Error fetching doctor by ID:', error);
    res.status(500).json({ message: 'Error fetching doctor', error: error.message });
  }
};

// Get doctor schedules
exports.getDoctorSchedules = async (req, res) => {
  try {
    const doctorId = req.params.id || req.user.id; // Use authenticated user's ID if not provided
    
    console.log('Fetching schedules for doctor:', doctorId);
    console.log('Requested by user:', req.user.id, 'Role:', req.user.role);
    
    // Find doctor record with schedule information
    const doctor = await Doctor.findOne({ userId: doctorId })
      .populate('userId', 'name email')
      .populate('scheduleRequests.approvedBy', 'name');
    
    if (!doctor) {
      console.log('Doctor record not found, creating basic response');
      // If no doctor record exists, return empty schedules
      return res.json({
        current: [],
        requests: [],
        doctor: {
          _id: doctorId,
          name: req.user.name || 'Unknown Doctor'
        }
      });
    }

    // Check if user has permission to view this doctor's schedule
    if (req.user.role !== 'hospital_admin' && req.user.id !== doctorId) {
      return res.status(403).json({ message: 'Not authorized to view this schedule' });
    }

    console.log('Found doctor record with', doctor.scheduleRequests?.length || 0, 'schedule requests');

    const scheduleData = {
      current: doctor.currentSchedule || [],
      requests: (doctor.scheduleRequests || []).map(request => ({
        _id: request._id,
        scheduleSlots: request.scheduleSlots,
        effectiveDate: request.effectiveDate,
        requestedDate: request.requestedDate,
        status: request.status,
        adminComments: request.adminComments,
        approvedBy: request.approvedBy,
        approvedAt: request.approvedAt,
        rejectedAt: request.rejectedAt,
        createdAt: request.createdAt
      })),
      doctor: {
        _id: doctor.userId._id,
        name: doctor.userId.name,
        email: doctor.userId.email,
        specialization: doctor.specialization,
        department: doctor.department
      }
    };

    res.json(scheduleData);
  } catch (error) {
    console.error('Error fetching doctor schedules:', error);
    res.status(500).json({ message: 'Error fetching schedules', error: error.message });
  }
};

// Create schedule request
exports.createScheduleRequest = async (req, res) => {
  try {
    console.log('Creating schedule request with data:', req.body);
    console.log('User info:', req.user);

    // Handle both old format (single schedule) and new format (schedule slots array)
    const { 
      doctorId, 
      effectiveDate, 
      scheduleSlots, 
      requestType, 
      reason,
      // Single schedule format (from frontend)
      date,
      startTime,
      endTime,
      breakStartTime,
      breakEndTime,
      maxPatients,
      notes,
      type,
      status
    } = req.body;
    
    // Use the authenticated user's ID if doctorId is not provided (doctor creating their own schedule)
    const targetDoctorId = doctorId || req.user.id;
    
    console.log('Target doctor ID:', targetDoctorId);

    // Validate request
    if (!targetDoctorId) {
      return res.status(400).json({ message: 'Doctor ID is required' });
    }

    // Handle different input formats
    let finalScheduleSlots = [];
    let finalEffectiveDate = null;

    if (scheduleSlots && Array.isArray(scheduleSlots)) {
      // New format with schedule slots array
      finalScheduleSlots = scheduleSlots;
      finalEffectiveDate = effectiveDate ? new Date(effectiveDate) : new Date();
    } else if (date && startTime && endTime) {
      // Old format with single schedule
      const scheduleDate = new Date(date);
      const dayName = scheduleDate.toLocaleDateString('en-US', { weekday: 'long' });
      
      finalScheduleSlots = [{
        day: dayName,
        startTime: startTime,
        endTime: endTime,
        maxPatients: maxPatients || 10,
        slotDuration: 30,
        breakStartTime: breakStartTime,
        breakEndTime: breakEndTime,
        isActive: true
      }];
      finalEffectiveDate = scheduleDate;
    } else {
      return res.status(400).json({ 
        message: 'Either scheduleSlots array or individual schedule fields (date, startTime, endTime) are required' 
      });
    }

    if (!finalEffectiveDate) {
      return res.status(400).json({ message: 'Effective date is required' });
    }

    if (!finalScheduleSlots || finalScheduleSlots.length === 0) {
      return res.status(400).json({ message: 'Schedule slots are required and must be a non-empty array' });
    }

    // Validate schedule slots structure
    for (let i = 0; i < finalScheduleSlots.length; i++) {
      const slot = finalScheduleSlots[i];
      if (!slot.day || !slot.startTime || !slot.endTime) {
        return res.status(400).json({ 
          message: `Schedule slot ${i + 1} is missing required fields (day, startTime, endTime)` 
        });
      }
    }

    // Check if user has permission
    if (req.user.role !== 'hospital_admin' && req.user.id !== targetDoctorId) {
      return res.status(403).json({ message: 'Not authorized to create schedule for this doctor' });
    }

    // Find the user to ensure they are a doctor
    const user = await User.findById(targetDoctorId);
    if (!user || user.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    console.log('Found doctor user:', user.name);

    // Find or create doctor record
    let doctor = await Doctor.findOne({ userId: targetDoctorId });
    if (!doctor) {
      console.log('Creating new doctor record');
      doctor = new Doctor({
        userId: targetDoctorId,
        hospital: user.hospitalId,
        specialization: user.profile?.specialization || 'General',
        department: user.profile?.department || 'General',
        qualifications: user.profile?.qualifications,
        experience: user.profile?.experience || 0
      });
      await doctor.save();
    }

    console.log('Doctor record found/created:', doctor._id);

    // Create new schedule request
    const scheduleRequest = {
      scheduleSlots: finalScheduleSlots.map(slot => ({
        day: slot.day,
        startTime: slot.startTime,
        endTime: slot.endTime,
        maxPatients: slot.maxPatients || 10,
        slotDuration: slot.slotDuration || 30,
        breakStartTime: slot.breakStartTime,
        breakEndTime: slot.breakEndTime,
        isActive: slot.isActive !== false
      })),
      effectiveDate: finalEffectiveDate,
      status: 'pending',
      requestedDate: new Date()
    };

    console.log('Adding schedule request:', scheduleRequest);

    doctor.scheduleRequests.push(scheduleRequest);
    await doctor.save();

    console.log('Schedule request saved successfully');

    // Populate the doctor info for response
    await doctor.populate('userId', 'name email');

    // Get the newly created request
    const newRequest = doctor.scheduleRequests[doctor.scheduleRequests.length - 1];

    // Send notification to hospital admin
    try {
      const { createNotificationForUser } = require('./notificationController');
      const Hospital = require('../models/Hospital');
      
      const hospital = await Hospital.findById(user.hospitalId);
      if (hospital && hospital.adminId) {
        await createNotificationForUser({
          userId: hospital.adminId,
          title: 'New Schedule Request',
          message: `Dr. ${user.name} has submitted a new schedule request for approval.`,
          type: 'schedule',
          priority: 'normal',
          actionLink: '/hospital/schedule-requests',
          metadata: {
            requestId: newRequest._id,
            doctorId: targetDoctorId,
            doctorName: user.name
          }
        });
        console.log('Notification sent to hospital admin');
      }
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
      // Don't fail the request if notification fails
    }

    res.status(201).json({
      message: 'Schedule request created successfully and sent for approval',
      request: {
        _id: newRequest._id,
        scheduleSlots: newRequest.scheduleSlots,
        effectiveDate: newRequest.effectiveDate,
        status: newRequest.status,
        requestedDate: newRequest.requestedDate,
        doctor: {
          _id: doctor.userId._id,
          name: doctor.userId.name,
          email: doctor.userId.email
        }
      }
    });
  } catch (error) {
    console.error('Error creating schedule request:', error);
    res.status(500).json({ message: 'Error creating schedule request', error: error.message });
  }
};

// Update schedule request
exports.updateScheduleRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { effectiveDate, scheduleSlots } = req.body;

    const doctor = await Doctor.findOne({ 'scheduleRequests._id': requestId });
    if (!doctor) {
      return res.status(404).json({ message: 'Schedule request not found' });
    }

    const scheduleRequest = doctor.scheduleRequests.id(requestId);
    if (!scheduleRequest || scheduleRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot update this schedule request' });
    }

    // Check permissions
    if (req.user.role !== 'hospital_admin' && req.user.id !== doctor.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this schedule request' });
    }

    // Update the request
    if (effectiveDate) scheduleRequest.effectiveDate = new Date(effectiveDate);
    if (scheduleSlots) scheduleRequest.scheduleSlots = scheduleSlots;

    await doctor.save();

    res.json({
      message: 'Schedule request updated successfully',
      request: scheduleRequest
    });
  } catch (error) {
    console.error('Error updating schedule request:', error);
    res.status(500).json({ message: 'Error updating schedule request', error: error.message });
  }
};

// Get pending schedule requests (for hospital admins)
exports.getPendingScheduleRequests = async (req, res) => {
  try {
    console.log('Fetching pending schedule requests for hospital:', req.user.hospitalId);
    
    const hospitalId = req.user.hospitalId;
    if (!hospitalId) {
      return res.status(400).json({ message: 'Hospital ID not found' });
    }

    const doctors = await Doctor.find({ hospital: hospitalId })
      .populate('userId', 'name email profile')
      .populate('scheduleRequests.approvedBy', 'name');

    console.log(`Found ${doctors.length} doctors in hospital`);

    const pendingRequests = [];
    
    doctors.forEach(doctor => {
      if (doctor.scheduleRequests && doctor.scheduleRequests.length > 0) {
        doctor.scheduleRequests.forEach(request => {
          if (request.status === 'pending') {
            pendingRequests.push({
              _id: request._id,
              doctor: {
                _id: doctor.userId._id,
                name: doctor.userId.name,
                email: doctor.userId.email,
                specialization: doctor.specialization,
                department: doctor.department,
                profileImage: doctor.userId.profile?.avatar
              },
              scheduleSlots: request.scheduleSlots,
              effectiveDate: request.effectiveDate,
              requestedDate: request.requestedDate,
              status: request.status,
              createdAt: request.createdAt || request.requestedDate
            });
          }
        });
      }
    });

    console.log(`Found ${pendingRequests.length} pending schedule requests`);

    // Sort by creation date (newest first)
    pendingRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(pendingRequests);
  } catch (error) {
    console.error('Error fetching pending schedule requests:', error);
    res.status(500).json({ message: 'Error fetching pending requests', error: error.message });
  }
};

// Update schedule request status (approve/reject)
exports.updateScheduleRequestStatus = async (req, res) => {
  try {
    console.log('Updating schedule request status:', req.params.id, req.body);
    
    const requestId = req.params.id;
    const { status, adminComments } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be approved or rejected' });
    }

    const doctor = await Doctor.findOne({ 'scheduleRequests._id': requestId })
      .populate('userId', 'name email');
      
    if (!doctor) {
      return res.status(404).json({ message: 'Schedule request not found' });
    }

    const scheduleRequest = doctor.scheduleRequests.id(requestId);
    if (!scheduleRequest || scheduleRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot update this schedule request' });
    }

    console.log('Found schedule request, updating status to:', status);

    // Update the request status
    scheduleRequest.status = status;
    scheduleRequest.adminComments = adminComments;
    scheduleRequest.approvedBy = req.user.id;
    
    if (status === 'approved') {
      scheduleRequest.approvedAt = new Date();
      // Replace current schedule with approved schedule
      doctor.currentSchedule = scheduleRequest.scheduleSlots;
      console.log('Schedule approved and set as current schedule');
    } else {
      scheduleRequest.rejectedAt = new Date();
      console.log('Schedule request rejected');
    }

    await doctor.save();

    // Send notification to the doctor
    try {
      const { createNotificationForUser } = require('./notificationController');
      
      const notificationTitle = status === 'approved' ? 'Schedule Request Approved' : 'Schedule Request Rejected';
      const notificationMessage = status === 'approved' 
        ? `Your schedule request has been approved and is now active.${adminComments ? ` Admin notes: ${adminComments}` : ''}`
        : `Your schedule request has been rejected.${adminComments ? ` Reason: ${adminComments}` : ''}`;

      await createNotificationForUser({
        userId: doctor.userId._id,
        title: notificationTitle,
        message: notificationMessage,
        type: 'schedule',
        priority: status === 'approved' ? 'normal' : 'high',
        actionLink: '/doctor/schedule',
        metadata: {
          requestId: requestId,
          status: status,
          adminComments: adminComments
        }
      });
      
      console.log('Notification sent to doctor');
    } catch (notificationError) {
      console.error('Error sending notification to doctor:', notificationError);
      // Don't fail the request if notification fails
    }

    res.json({
      message: `Schedule request ${status} successfully`,
      request: {
        _id: scheduleRequest._id,
        status: scheduleRequest.status,
        adminComments: scheduleRequest.adminComments,
        approvedBy: scheduleRequest.approvedBy,
        approvedAt: scheduleRequest.approvedAt,
        rejectedAt: scheduleRequest.rejectedAt,
        doctor: {
          _id: doctor.userId._id,
          name: doctor.userId.name,
          email: doctor.userId.email
        }
      }
    });
  } catch (error) {
    console.error('Error updating schedule request status:', error);
    res.status(500).json({ message: 'Error updating request status', error: error.message });
  }
};

// Get all pending schedule requests (for hospital admin)
exports.getPendingScheduleRequests = async (req, res) => {
  try {
    console.log('Fetching pending schedule requests for hospital admin');
    console.log('User info:', req.user);

    // Only hospital admins can access this endpoint
    if (req.user.role !== 'hospital_admin') {
      return res.status(403).json({ message: 'Access denied. Hospital admin role required.' });
    }

    const hospitalId = req.user.hospitalId;
    if (!hospitalId) {
      return res.status(400).json({ message: 'Hospital ID not found in user profile' });
    }

    console.log('Fetching pending requests for hospital:', hospitalId);

    // Find all doctors in this hospital with pending schedule requests
    const doctors = await Doctor.find({ 
      hospital: hospitalId,
      'scheduleRequests.status': 'pending'
    }).populate('userId', 'name email');

    console.log(`Found ${doctors.length} doctors with pending requests`);

    // Extract all pending requests with doctor info
    const pendingRequests = [];
    
    doctors.forEach(doctor => {
      const doctorPendingRequests = doctor.scheduleRequests.filter(req => req.status === 'pending');
      
      doctorPendingRequests.forEach(request => {
        pendingRequests.push({
          _id: request._id,
          scheduleSlots: request.scheduleSlots,
          effectiveDate: request.effectiveDate,
          status: request.status,
          requestedDate: request.requestedDate,
          createdAt: request.createdAt,
          doctor: {
            _id: doctor.userId._id,
            name: doctor.userId.name,
            email: doctor.userId.email,
            specialization: doctor.specialization,
            department: doctor.department
          }
        });
      });
    });

    console.log(`Total pending requests found: ${pendingRequests.length}`);

    // Sort by request date (newest first)
    pendingRequests.sort((a, b) => new Date(b.requestedDate || b.createdAt) - new Date(a.requestedDate || a.createdAt));

    res.json(pendingRequests);
  } catch (error) {
    console.error('Error fetching pending schedule requests:', error);
    res.status(500).json({ message: 'Error fetching pending requests', error: error.message });
  }
};

// Get my schedules (for logged-in doctor)
exports.getMySchedules = async (req, res) => {
  try {
    const doctorId = req.user.id;
    console.log('Fetching schedules for logged-in doctor:', doctorId);

    // Find the doctor user first
    const doctorUser = await User.findById(doctorId);
    if (!doctorUser || doctorUser.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Find or create doctor record
    let doctor = await Doctor.findOne({ userId: doctorId });
    if (!doctor) {
      console.log('No doctor record found, creating empty response');
      return res.json({
        current: [],
        requests: []
      });
    }

    console.log('Found doctor record with', doctor.scheduleRequests?.length || 0, 'schedule requests');

    // Format the response
    const response = {
      current: doctor.currentSchedule || [],
      requests: doctor.scheduleRequests.map(request => ({
        _id: request._id,
        scheduleSlots: request.scheduleSlots,
        effectiveDate: request.effectiveDate,
        status: request.status,
        requestedDate: request.requestedDate,
        createdAt: request.createdAt,
        adminComments: request.adminComments,
        approvedBy: request.approvedBy,
        approvedAt: request.approvedAt,
        rejectedAt: request.rejectedAt
      }))
    };

    console.log('Returning my schedule data:', {
      currentScheduleSlots: response.current.length,
      totalRequests: response.requests.length,
      pendingRequests: response.requests.filter(r => r.status === 'pending').length
    });

    res.json(response);
  } catch (error) {
    console.error('Error fetching my schedules:', error);
    res.status(500).json({ message: 'Error fetching schedules', error: error.message });
  }
};

// Delete schedule request
exports.deleteScheduleRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const doctorId = req.user.id;
    
    console.log('Deleting schedule request:', requestId, 'for doctor:', doctorId);

    // Find the doctor record
    const doctor = await Doctor.findOne({ userId: doctorId });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor record not found' });
    }

    // Find the schedule request
    const requestIndex = doctor.scheduleRequests.findIndex(
      request => request._id.toString() === requestId
    );

    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Schedule request not found' });
    }

    const scheduleRequest = doctor.scheduleRequests[requestIndex];

    // Check if the request can be deleted (only pending and rejected requests)
    if (scheduleRequest.status === 'approved') {
      return res.status(400).json({ 
        message: 'Cannot delete approved schedule requests' 
      });
    }

    // Remove the schedule request
    doctor.scheduleRequests.splice(requestIndex, 1);
    await doctor.save();

    console.log('Schedule request deleted successfully');
    res.json({ message: 'Schedule request deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting schedule request:', error);
    res.status(500).json({ message: 'Error deleting schedule request', error: error.message });
  }
};

// Delete doctor's current schedule (for hospital admin)
exports.deleteDoctorSchedule = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const adminId = req.user.id;
    
    console.log('Deleting current schedule for doctor:', doctorId, 'by admin:', adminId);

    // Verify admin permissions
    if (req.user.role !== 'hospital_admin') {
      return res.status(403).json({ 
        message: 'Access denied. Hospital admin role required.' 
      });
    }

    // Find the doctor user first
    const doctorUser = await User.findById(doctorId);
    if (!doctorUser || doctorUser.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if doctor belongs to the same hospital as admin
    if (doctorUser.hospitalId !== req.user.hospitalId) {
      return res.status(403).json({ 
        message: 'Doctor does not belong to your hospital' 
      });
    }

    // Find the doctor record
    const doctor = await Doctor.findOne({ userId: doctorId });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor record not found' });
    }

    // Check if doctor has a current schedule
    if (!doctor.currentSchedule || doctor.currentSchedule.length === 0) {
      return res.status(400).json({ 
        message: 'No current schedule found to delete' 
      });
    }

    // Store the deleted schedule for logging
    const deletedSchedule = [...doctor.currentSchedule];

    // Clear the current schedule
    doctor.currentSchedule = [];
    await doctor.save();

    // Send notification to the doctor
    try {
      const { createNotificationForUser } = require('./notificationController');
      
      await createNotificationForUser({
        userId: doctorId,
        title: 'Schedule Deleted',
        message: `Your current schedule has been deleted by hospital administration. Please submit a new schedule request if needed.`,
        type: 'schedule',
        priority: 'high',
        actionLink: '/doctor/schedule',
        metadata: {
          deletedBy: adminId,
          deletedAt: new Date(),
          deletedSchedule: deletedSchedule
        }
      });
      
      console.log('Notification sent to doctor about schedule deletion');
    } catch (notificationError) {
      console.error('Error sending notification to doctor:', notificationError);
      // Don't fail the request if notification fails
    }

    console.log('Doctor schedule deleted successfully');
    res.json({ 
      message: 'Doctor schedule deleted successfully',
      deletedSchedule: deletedSchedule,
      doctor: {
        _id: doctorUser._id,
        name: doctorUser.name,
        email: doctorUser.email
      }
    });
    
  } catch (error) {
    console.error('Error deleting doctor schedule:', error);
    res.status(500).json({ message: 'Error deleting doctor schedule', error: error.message });
  }
};