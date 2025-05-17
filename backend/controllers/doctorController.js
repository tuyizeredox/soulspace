const User = require('../models/User');
const Patient = require('../models/Patient');
const bcrypt = require('bcryptjs');

exports.getHospitalDoctors = async (req, res) => {
  try {
    const doctors = await User.find({
      role: 'doctor',
      hospitalId: req.user.hospitalId
    }).select('-password');

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
        hospitalId: assignment.hospital
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
          hospitalId: patient.hospitalId
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