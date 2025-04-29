const Hospital = require('../models/Hospital');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

exports.getHospitals = async (req, res) => {
    try {
        const hospitals = await Hospital.find()
            .populate('adminId', 'name email profile.phone')
            .populate('admins', 'name email profile.phone')
            .lean();

        const formattedHospitals = await Promise.all(hospitals.map(async hospital => {
            // Get additional admins (excluding primary admin)
            const additionalAdmins = hospital.admins
                ? hospital.admins
                    .filter(admin => admin && admin._id && hospital.adminId && admin._id.toString() !== hospital.adminId._id.toString())
                    .map(admin => ({
                        id: admin._id,
                        name: admin.name,
                        email: admin.email,
                        phone: admin.profile?.phone || ''
                    }))
                : [];

            return {
                id: hospital._id,
                name: hospital.name,
                location: hospital.location,
                address: hospital.address,
                city: hospital.city,
                state: hospital.state,
                zipCode: hospital.zipCode,
                email: hospital.email,
                phone: hospital.phone,
                website: hospital.website,
                type: hospital.type,
                beds: hospital.beds,
                status: hospital.status,
                adminName: hospital.adminId?.name || 'No admin assigned',
                adminEmail: hospital.adminId?.email,
                adminPhone: hospital.adminId?.profile?.phone || '',
                additionalAdmins: additionalAdmins,
                createdAt: hospital.createdAt
            };
        }));

        res.json(formattedHospitals);
    } catch (error) {
        console.error('Error fetching hospitals:', error);
        res.status(500).json({ message: 'Error fetching hospitals', error: error.message });
    }
};

exports.getHospitalById = async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id)
            .populate('adminId', 'name email profile.phone')
            .populate('admins', 'name email profile.phone');

        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }

        // Get additional admins (excluding primary admin)
        const additionalAdmins = hospital.admins
            ? hospital.admins
                .filter(admin => admin && admin._id && hospital.adminId && admin._id.toString() !== hospital.adminId._id.toString())
                .map(admin => ({
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    phone: admin.profile?.phone || ''
                }))
            : [];

        // Format the response
        const formattedHospital = {
            id: hospital._id,
            name: hospital.name,
            location: hospital.location,
            address: hospital.address,
            city: hospital.city,
            state: hospital.state,
            zipCode: hospital.zipCode,
            email: hospital.email,
            phone: hospital.phone,
            website: hospital.website,
            type: hospital.type,
            beds: hospital.beds,
            status: hospital.status,
            adminName: hospital.adminId?.name || 'No admin assigned',
            adminEmail: hospital.adminId?.email,
            adminPhone: hospital.adminId?.profile?.phone || '',
            additionalAdmins: additionalAdmins,
            createdAt: hospital.createdAt
        };

        res.json(formattedHospital);
    } catch (error) {
        console.error('Error fetching hospital:', error);
        res.status(500).json({ message: 'Error fetching hospital', error: error.message });
    }
};

exports.updateHospital = async (req, res) => {
    try {
        const {
            name,
            location,
            address,
            city,
            state,
            zipCode,
            phone,
            email,
            website,
            type,
            beds,
            status,
            additionalAdmins,
            adminsToRemove,
            primaryAdminUpdate,
            updatePrimaryAdminPassword,
            primaryAdminPassword
        } = req.body;

        // Find the hospital first
        const hospital = await Hospital.findById(req.params.id).populate('adminId', 'name email');

        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }

        // Update hospital details
        hospital.name = name || hospital.name;
        hospital.location = location || hospital.location;
        hospital.address = address || hospital.address;
        hospital.city = city || hospital.city;
        hospital.state = state || hospital.state;
        hospital.zipCode = zipCode || hospital.zipCode;
        hospital.phone = phone || hospital.phone;
        hospital.email = email || hospital.email;
        hospital.website = website || hospital.website;
        hospital.type = type || hospital.type;

        // Handle beds field carefully to avoid NaN
        if (beds !== undefined) {
            const parsedBeds = parseInt(beds);
            if (!isNaN(parsedBeds)) {
                hospital.beds = parsedBeds;
            }
            // If parsing results in NaN, keep the existing value
        }

        hospital.status = status || hospital.status;

        const updatedHospital = await hospital.save();

        // Update primary admin if changes are provided
        let updatedPrimaryAdmin = null;
        try {
            if (primaryAdminUpdate && Object.keys(primaryAdminUpdate).length > 0) {
                console.log('Updating primary admin with data:', primaryAdminUpdate);

                const primaryAdmin = await User.findById(hospital.adminId);

                if (primaryAdmin) {
                    // Update admin details if provided
                    if (primaryAdminUpdate.name) {
                        primaryAdmin.name = primaryAdminUpdate.name;
                    }

                    if (primaryAdminUpdate.email) {
                        primaryAdmin.email = primaryAdminUpdate.email;
                    }

                    if (primaryAdminUpdate.phone) {
                        primaryAdmin.profile = primaryAdmin.profile || {};
                        primaryAdmin.profile.phone = primaryAdminUpdate.phone;
                    }

                    // Update password if requested
                    if (updatePrimaryAdminPassword && primaryAdminPassword) {
                        const hashedPassword = await bcrypt.hash(primaryAdminPassword, 10);
                        primaryAdmin.password = hashedPassword;
                    }

                    await primaryAdmin.save();

                    updatedPrimaryAdmin = {
                        id: primaryAdmin._id,
                        name: primaryAdmin.name,
                        email: primaryAdmin.email,
                        phone: primaryAdmin.profile?.phone || ''
                    };
                } else {
                    console.log('Primary admin not found with ID:', hospital.adminId);
                }
            } else {
                console.log('No primary admin updates provided or empty update object');
            }
        } catch (adminError) {
            console.error('Error updating primary admin:', adminError);
            // Continue with the rest of the updates even if primary admin update fails
        }

        // Handle admin removals if provided
        const removedAdmins = [];
        try {
            if (adminsToRemove && adminsToRemove.length > 0) {
                console.log('Processing admins to remove:', adminsToRemove);

                for (const adminId of adminsToRemove) {
                    // Make sure we're not removing the primary admin
                    if (adminId !== hospital.adminId.toString()) {
                        try {
                            // Find the admin and check if they're associated with this hospital
                            const adminToRemove = await User.findById(adminId);
                            if (adminToRemove && adminToRemove.role === 'hospital_admin') {
                                // You might want to add additional checks here to ensure the admin is associated with this hospital

                                // Option 1: Delete the admin user completely
                                // await User.findByIdAndDelete(adminId);

                                // Option 2: Change their role to something else or mark them as inactive
                                adminToRemove.role = 'inactive_admin'; // Or another appropriate role
                                adminToRemove.hospitalId = null; // Remove hospital association
                                await adminToRemove.save();

                                // Remove from hospital's admins array
                                if (hospital.admins && hospital.admins.length > 0) {
                                    hospital.admins = hospital.admins.filter(id => id.toString() !== adminId);
                                    await hospital.save();
                                }

                                removedAdmins.push({
                                    id: adminToRemove._id,
                                    name: adminToRemove.name,
                                    email: adminToRemove.email
                                });

                                console.log(`Admin ${adminId} marked as inactive`);
                            } else {
                                console.log(`Admin ${adminId} not found or not a hospital admin`);
                            }
                        } catch (adminError) {
                            console.error(`Error processing admin removal for ID ${adminId}:`, adminError);
                            // Continue with other admins even if one fails
                        }
                    } else {
                        console.log(`Skipping removal of primary admin ${adminId}`);
                    }
                }
            } else {
                console.log('No admins to remove or empty array');
            }
        } catch (removeError) {
            console.error('Error in admin removal process:', removeError);
            // Continue with the rest of the updates even if admin removal fails
        }

        // Create additional admin users if provided
        const additionalAdminUsers = [];
        try {
            if (additionalAdmins && additionalAdmins.length > 0) {
                console.log('Processing additional admins:', additionalAdmins);

                for (const admin of additionalAdmins) {
                    try {
                        // Check if this is a new admin (temporary IDs from frontend are numbers, MongoDB IDs are strings)
                        const isNewAdmin = (!admin.id || typeof admin.id === 'number' || admin.id.toString().length < 24);

                        // Process new admins with required fields
                        if (isNewAdmin && admin.firstName && admin.lastName && admin.email) {
                            console.log(`Creating new admin: ${admin.firstName} ${admin.lastName}`);

                            // Validate required fields
                            if (!admin.firstName.trim()) {
                                throw new Error(`Admin first name is required`);
                            }
                            if (!admin.lastName.trim()) {
                                throw new Error(`Admin last name is required`);
                            }
                            if (!admin.email.trim()) {
                                throw new Error(`Admin email is required`);
                            }
                            if (!/\S+@\S+\.\S+/.test(admin.email)) {
                                throw new Error(`Invalid email format for admin: ${admin.email}`);
                            }

                            // Use provided password or generate a random one
                            const adminPassword = admin.password || Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
                            const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

                            // Check if this admin already exists in the system
                            let existingUser = null;
                            if (admin.email) {
                                existingUser = await User.findOne({ email: admin.email });
                            }

                            let savedAdditionalAdmin = null;

                            if (existingUser) {
                                // If user exists, update their role and hospital association
                                console.log(`User with email ${admin.email} already exists. Updating role and hospital association.`);
                                existingUser.role = 'hospital_admin';
                                existingUser.hospitalId = hospital._id;

                                // Update profile if needed
                                existingUser.profile = existingUser.profile || {};
                                if (admin.phone) {
                                    existingUser.profile.phone = admin.phone;
                                }

                                // Update name if needed
                                if (admin.firstName && admin.lastName) {
                                    existingUser.name = `${admin.firstName} ${admin.lastName}`;
                                }

                                // Update password if provided
                                if (admin.password) {
                                    existingUser.password = hashedAdminPassword;
                                }

                                savedAdditionalAdmin = await existingUser.save();
                                console.log(`Updated existing user ${savedAdditionalAdmin._id} as hospital admin`);
                            } else {
                                // Create a new user
                                const additionalAdmin = new User({
                                    name: `${admin.firstName} ${admin.lastName}`,
                                    email: admin.email,
                                    password: hashedAdminPassword,
                                    role: 'hospital_admin',
                                    profile: {
                                        phone: admin.phone || ''
                                    },
                                    hospitalId: hospital._id // Associate with the hospital
                                });

                                try {
                                    savedAdditionalAdmin = await additionalAdmin.save();
                                    console.log(`Created new hospital admin with ID: ${savedAdditionalAdmin._id}`);
                                } catch (saveError) {
                                    console.error(`Error saving new admin:`, saveError);
                                    if (saveError.code === 11000) {
                                        // Duplicate key error (likely email)
                                        throw new Error(`Email ${admin.email} is already in use by another user`);
                                    } else {
                                        throw saveError;
                                    }
                                }
                            }

                            // Add this admin to the hospital's admins array if not already there
                            hospital.admins = hospital.admins || [];

                            // Check if admin is already in the admins array
                            const adminExists = hospital.admins.some(
                                adminId => adminId && savedAdditionalAdmin &&
                                adminId.toString() === savedAdditionalAdmin._id.toString()
                            );

                            if (!adminExists) {
                                hospital.admins.push(savedAdditionalAdmin._id);
                                try {
                                    await hospital.save();
                                    console.log(`Added admin ${savedAdditionalAdmin._id} to hospital ${hospital._id}`);
                                } catch (saveError) {
                                    console.error(`Error updating hospital with new admin:`, saveError);
                                    throw new Error(`Failed to associate admin with hospital: ${saveError.message}`);
                                }
                            } else {
                                console.log(`Admin ${savedAdditionalAdmin._id} already associated with hospital ${hospital._id}`);
                            }

                            additionalAdminUsers.push({
                                id: savedAdditionalAdmin._id,
                                name: savedAdditionalAdmin.name,
                                email: savedAdditionalAdmin.email,
                                phone: savedAdditionalAdmin.profile?.phone || '',
                                password: adminPassword, // Include plain password for email notification
                                sendCredentials: admin.sendCredentials || true
                            });

                            console.log(`Admin created/updated successfully with ID: ${savedAdditionalAdmin._id}`);
                        } else {
                            // Check if this is a valid MongoDB ID (24 characters)
                            const isValidMongoId = admin.id && typeof admin.id === 'string' && admin.id.length === 24;

                            if (isValidMongoId) {
                                console.log(`Admin with valid MongoDB ID ${admin.id} already exists, skipping creation`);
                            } else if (admin.id && typeof admin.id === 'number') {
                                // This is a temporary ID from frontend, we should try to process it
                                console.log(`Admin has temporary ID ${admin.id}, attempting to process as new admin`);

                                // Check if it has all required fields
                                if (admin.firstName && admin.lastName && admin.email) {
                                    // Process this admin even though it has a temporary ID
                                    console.log(`Processing admin with temporary ID as new admin: ${admin.firstName} ${admin.lastName}`);

                                    try {
                                        // Validate required fields
                                        if (!admin.firstName.trim()) {
                                            throw new Error(`Admin first name is required`);
                                        }
                                        if (!admin.lastName.trim()) {
                                            throw new Error(`Admin last name is required`);
                                        }
                                        if (!admin.email.trim()) {
                                            throw new Error(`Admin email is required`);
                                        }
                                        if (!/\S+@\S+\.\S+/.test(admin.email)) {
                                            throw new Error(`Invalid email format for admin: ${admin.email}`);
                                        }

                                        // Use provided password or generate a random one
                                        const adminPassword = admin.password || Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
                                        const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

                                        // Check if this admin already exists in the system
                                        let existingUser = null;
                                        if (admin.email) {
                                            existingUser = await User.findOne({ email: admin.email });
                                        }

                                        let savedAdditionalAdmin = null;

                                        if (existingUser) {
                                            // If user exists, update their role and hospital association
                                            console.log(`User with email ${admin.email} already exists. Updating role and hospital association.`);
                                            existingUser.role = 'hospital_admin';
                                            existingUser.hospitalId = hospital._id;

                                            // Update profile if needed
                                            existingUser.profile = existingUser.profile || {};
                                            if (admin.phone) {
                                                existingUser.profile.phone = admin.phone;
                                            }

                                            // Update name if needed
                                            if (admin.firstName && admin.lastName) {
                                                existingUser.name = `${admin.firstName} ${admin.lastName}`;
                                            }

                                            // Update password if provided
                                            if (admin.password) {
                                                existingUser.password = hashedAdminPassword;
                                            }

                                            savedAdditionalAdmin = await existingUser.save();
                                            console.log(`Updated existing user ${savedAdditionalAdmin._id} as hospital admin`);
                                        } else {
                                            // Create a new user
                                            const additionalAdmin = new User({
                                                name: `${admin.firstName} ${admin.lastName}`,
                                                email: admin.email,
                                                password: hashedAdminPassword,
                                                role: 'hospital_admin',
                                                profile: {
                                                    phone: admin.phone || ''
                                                },
                                                hospitalId: hospital._id // Associate with the hospital
                                            });

                                            try {
                                                savedAdditionalAdmin = await additionalAdmin.save();
                                                console.log(`Created new hospital admin with ID: ${savedAdditionalAdmin._id}`);
                                            } catch (saveError) {
                                                console.error(`Error saving new admin:`, saveError);
                                                if (saveError.code === 11000) {
                                                    // Duplicate key error (likely email)
                                                    throw new Error(`Email ${admin.email} is already in use by another user`);
                                                } else {
                                                    throw saveError;
                                                }
                                            }
                                        }

                                        // Add this admin to the hospital's admins array if not already there
                                        hospital.admins = hospital.admins || [];

                                        // Check if admin is already in the admins array
                                        const adminExists = hospital.admins.some(
                                            adminId => adminId && savedAdditionalAdmin &&
                                            adminId.toString() === savedAdditionalAdmin._id.toString()
                                        );

                                        if (!adminExists) {
                                            hospital.admins.push(savedAdditionalAdmin._id);
                                            try {
                                                await hospital.save();
                                                console.log(`Added admin ${savedAdditionalAdmin._id} to hospital ${hospital._id}`);
                                            } catch (saveError) {
                                                console.error(`Error updating hospital with new admin:`, saveError);
                                                throw new Error(`Failed to associate admin with hospital: ${saveError.message}`);
                                            }
                                        } else {
                                            console.log(`Admin ${savedAdditionalAdmin._id} already associated with hospital ${hospital._id}`);
                                        }

                                        additionalAdminUsers.push({
                                            id: savedAdditionalAdmin._id,
                                            name: savedAdditionalAdmin.name,
                                            email: savedAdditionalAdmin.email,
                                            phone: savedAdditionalAdmin.profile?.phone || '',
                                            password: adminPassword, // Include plain password for email notification
                                            sendCredentials: admin.sendCredentials || true
                                        });

                                        console.log(`Admin created/updated successfully with ID: ${savedAdditionalAdmin._id}`);
                                    } catch (innerError) {
                                        console.error('Error processing admin with temporary ID:', innerError);
                                        additionalAdminUsers.push({
                                            error: true,
                                            name: admin.firstName && admin.lastName ? `${admin.firstName} ${admin.lastName}` : 'Unknown',
                                            email: admin.email || 'Unknown',
                                            message: innerError.message || 'Unknown error occurred'
                                        });
                                    }
                                } else {
                                    console.log(`Missing required fields for admin with temporary ID: firstName=${!!admin.firstName}, lastName=${!!admin.lastName}, email=${!!admin.email}`);
                                }
                            } else {
                                console.log(`Missing required fields for admin: firstName=${!!admin.firstName}, lastName=${!!admin.lastName}, email=${!!admin.email}`);
                            }
                        }
                    } catch (adminError) {
                        console.error('Error creating additional admin:', adminError);
                        // Add the error to the response
                        additionalAdminUsers.push({
                            error: true,
                            name: admin.firstName && admin.lastName ? `${admin.firstName} ${admin.lastName}` : 'Unknown',
                            email: admin.email || 'Unknown',
                            message: adminError.message || 'Unknown error occurred'
                        });
                        // Continue with other admins even if one fails
                    }
                }
            } else {
                console.log('No additional admins to create or empty array');
            }
        } catch (addError) {
            console.error('Error in additional admin creation process:', addError);
            // Continue with the response even if admin creation fails
        }

        // Format the response
        const formattedHospital = {
            id: updatedHospital._id,
            name: updatedHospital.name,
            location: updatedHospital.location,
            address: updatedHospital.address,
            city: updatedHospital.city,
            state: updatedHospital.state,
            zipCode: updatedHospital.zipCode,
            email: updatedHospital.email,
            phone: updatedHospital.phone,
            website: updatedHospital.website,
            type: updatedHospital.type,
            beds: updatedHospital.beds,
            status: updatedHospital.status,
            adminName: updatedPrimaryAdmin?.name || hospital.adminId?.name || 'No admin assigned',
            adminEmail: updatedPrimaryAdmin?.email || hospital.adminId?.email,
            createdAt: updatedHospital.createdAt
        };

        // Count successful and failed admin additions
        const successfulAdmins = additionalAdminUsers.filter(admin => !admin.error);
        const failedAdmins = additionalAdminUsers.filter(admin => admin.error);

        res.json({
            hospital: formattedHospital,
            primaryAdmin: updatedPrimaryAdmin,
            addedAdmins: additionalAdminUsers,
            addedAdminsCount: {
                total: additionalAdminUsers.length,
                successful: successfulAdmins.length,
                failed: failedAdmins.length
            },
            removedAdmins: removedAdmins
        });
    } catch (error) {
        console.error('Error updating hospital:', error);
        res.status(500).json({
            message: 'Error updating hospital',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

exports.deleteHospital = async (req, res) => {
    try {
        const hospital = await Hospital.findByIdAndDelete(req.params.id);
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting hospital', error: error.message });
    }
};

// This function has been moved to the end of the file

exports.createHospital = async (req, res) => {
    try {
        const {
            name,
            location,
            address,
            city,
            state,
            zipCode,
            phone,
            email,
            website,
            type,
            beds,
            status,
            adminFirstName,
            adminLastName,
            adminEmail,
            adminPhone,
            adminPassword,
            additionalAdmins
        } = req.body;

        // Create the primary admin user (without hospitalId yet)
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const adminUser = new User({
            name: `${adminFirstName} ${adminLastName}`,
            email: adminEmail,
            password: hashedPassword,
            role: 'hospital_admin',
            profile: {
                phone: adminPhone
            }
            // hospitalId will be set after hospital creation
        });

        const savedAdmin = await adminUser.save();

        // Create the hospital
        const hospital = new Hospital({
            name,
            location,
            address,
            city,
            state,
            zipCode,
            phone,
            email,
            website,
            type,
            beds: beds ? (!isNaN(parseInt(beds)) ? parseInt(beds) : 0) : 0,
            status: status || 'active',
            adminId: savedAdmin._id,
            admins: [savedAdmin._id] // Initialize admins array with primary admin
        });

        const savedHospital = await hospital.save();

        // Update the admin with the hospital reference
        savedAdmin.hospitalId = savedHospital._id;
        await savedAdmin.save();

        // Create additional admin users if provided
        const additionalAdminUsers = [];
        if (additionalAdmins && additionalAdmins.length > 0) {
            for (const admin of additionalAdmins) {
                if (admin.firstName && admin.lastName && admin.email) {
                    // Use provided password or generate a random one
                    const adminPassword = admin.password || Math.random().toString(36).slice(-8);
                    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

                    // Check if this admin already exists in the system
                    let existingUser = null;
                    if (admin.email) {
                        existingUser = await User.findOne({ email: admin.email });
                    }

                    let savedAdditionalAdmin = null;

                    if (existingUser) {
                        // If user exists, update their role and hospital association
                        console.log(`User with email ${admin.email} already exists. Updating role and hospital association.`);
                        existingUser.role = 'hospital_admin';
                        existingUser.hospitalId = savedHospital._id;

                        // Update profile if needed
                        existingUser.profile = existingUser.profile || {};
                        if (admin.phone) {
                            existingUser.profile.phone = admin.phone;
                        }

                        // Update name if needed
                        if (admin.firstName && admin.lastName) {
                            existingUser.name = `${admin.firstName} ${admin.lastName}`;
                        }

                        // Update password if provided
                        if (admin.password) {
                            existingUser.password = hashedAdminPassword;
                        }

                        savedAdditionalAdmin = await existingUser.save();
                        console.log(`Updated existing user ${savedAdditionalAdmin._id} as hospital admin`);
                    } else {
                        // Create a new user
                        const additionalAdmin = new User({
                            name: `${admin.firstName} ${admin.lastName}`,
                            email: admin.email,
                            password: hashedAdminPassword,
                            role: 'hospital_admin',
                            profile: {
                                phone: admin.phone || ''
                            },
                            hospitalId: savedHospital._id // Associate with the hospital
                        });

                        savedAdditionalAdmin = await additionalAdmin.save();
                        console.log(`Created new hospital admin with ID: ${savedAdditionalAdmin._id}`);
                    }

                    // Add this admin to the hospital's admins array
                    savedHospital.admins.push(savedAdditionalAdmin._id);
                    await savedHospital.save();
                    console.log(`Added admin ${savedAdditionalAdmin._id} to hospital ${savedHospital._id}`);
                    additionalAdminUsers.push({
                        id: savedAdditionalAdmin._id,
                        name: savedAdditionalAdmin.name,
                        email: savedAdditionalAdmin.email,
                        password: adminPassword, // Include plain password for email notification
                        sendCredentials: admin.sendCredentials || true
                    });
                }
            }
        }

        // Format the response
        const formattedHospital = {
            id: savedHospital._id,
            name: savedHospital.name,
            location: savedHospital.location,
            email: savedHospital.email,
            phone: savedHospital.phone,
            status: savedHospital.status,
            adminName: savedAdmin.name,
            adminEmail: savedAdmin.email,
            createdAt: savedHospital.createdAt
        };

        res.status(201).json({
            hospital: formattedHospital,
            admin: {
                id: savedAdmin._id,
                name: savedAdmin.name,
                email: savedAdmin.email
            },
            additionalAdmins: additionalAdminUsers
        });
    } catch (error) {
        // If there's an error, we should clean up any created resources
        res.status(500).json({ message: 'Error creating hospital', error: error.message });
    }
};

// Get all admins for a specific hospital
exports.getHospitalAdmins = async (req, res) => {
    try {
        const hospitalId = req.params.id;

        // Find the hospital
        const hospital = await Hospital.findById(hospitalId)
            .populate('adminId', 'name email profile.phone')
            .populate('admins', 'name email profile.phone');

        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }

        // Get the primary admin
        const primaryAdmin = hospital.adminId ? {
            id: hospital.adminId._id,
            name: hospital.adminId.name,
            email: hospital.adminId.email,
            phone: hospital.adminId.profile?.phone || '',
            isPrimary: true
        } : null;

        // Get additional admins (excluding primary admin)
        const additionalAdmins = hospital.admins
            ? hospital.admins
                .filter(admin => admin && admin._id && hospital.adminId && admin._id.toString() !== hospital.adminId._id.toString())
                .map(admin => ({
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    phone: admin.profile?.phone || '',
                    isPrimary: false
                }))
            : [];

        // Combine all admins
        const allAdmins = primaryAdmin ? [primaryAdmin, ...additionalAdmins] : additionalAdmins;

        console.log(`Returning ${allAdmins.length} admins for hospital ${hospitalId}`);
        res.json(allAdmins);
    } catch (error) {
        console.error('Error fetching hospital admins:', error);
        res.status(500).json({ message: 'Error fetching hospital admins', error: error.message });
    }
};

// Get all doctors for a specific hospital
exports.getDoctorsByHospital = async (req, res) => {
    try {
        const hospitalId = req.params.id;

        // Validate hospital ID
        if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
            return res.status(400).json({ message: 'Invalid hospital ID format' });
        }

        // Find the hospital to verify it exists
        const hospital = await Hospital.findById(hospitalId);
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }

        // Find all doctors associated with this hospital
        const doctors = await User.find({
            role: 'doctor',
            hospitalId: hospitalId,
            status: { $ne: 'inactive' } // Exclude inactive doctors
        }).select('-password');

        // Format the response
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

        console.log(`Returning ${formattedDoctors.length} doctors for hospital ${hospitalId}`);
        res.json(formattedDoctors);
    } catch (error) {
        console.error('Error fetching hospital doctors:', error);
        res.status(500).json({ message: 'Error fetching hospital doctors', error: error.message });
    }
};