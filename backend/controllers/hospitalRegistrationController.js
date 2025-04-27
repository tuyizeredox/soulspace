const HospitalRegistration = require('../models/HospitalRegistration');
const Hospital = require('../models/Hospital');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Make sure this function is properly exported
exports.registerHospital = async (req, res) => {
    try {
        // Validate required fields
        const { hospital, admin } = req.body;
        if (!hospital || !admin) {
            return res.status(400).json({ message: 'Hospital and admin details are required' });
        }

        const registration = new HospitalRegistration({
            hospital: {
                name: hospital.name,
                location: hospital.location,
                email: hospital.email,
                phone: hospital.phone,
                license: hospital.license,
                facilities: hospital.facilities || [],
                departments: hospital.departments || []
            },
            admin: {
                name: admin.name,
                email: admin.email,
                phone: admin.phone,
                qualifications: admin.qualifications,
                experience: admin.experience
            }
        });

        await registration.save();
        res.status(201).json(registration);
    } catch (error) {
        console.error('Hospital registration error:', error);
        res.status(400).json({ message: error.message });
    }
};

exports.approveHospital = async (req, res) => {
    try {
        const registration = await HospitalRegistration.findById(req.params.id);
        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        // Create hospital admin user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('tempPassword123', salt);
        
        const admin = new User({
            name: registration.admin.name,
            email: registration.admin.email,
            password: hashedPassword,
            role: 'hospital_admin',
            profile: {
                phone: registration.admin.phone
            }
        });
        await admin.save();

        // Create hospital
        const hospital = new Hospital({
            name: registration.hospital.name,
            location: registration.hospital.location,
            email: registration.hospital.email,
            phone: registration.hospital.phone,
            adminId: admin._id
        });
        await hospital.save();

        // Update registration status
        registration.hospital.status = 'approved';
        await registration.save();

        res.json({ registration, hospital, admin });
    } catch (error) {
        console.error('Hospital approval error:', error);
        res.status(400).json({ message: error.message });
    }
};


