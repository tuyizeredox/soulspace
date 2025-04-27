const Hospital = require('../models/Hospital');

// Get nearby hospitals based on user location
exports.getNearbyHospitals = async (req, res) => {
    try {
        // In a real implementation, this would use geospatial queries
        // For now, we'll just return all active hospitals
        const hospitals = await Hospital.find({ status: 'active' })
            .limit(10)
            .lean();

        const formattedHospitals = hospitals.map(hospital => ({
            id: hospital._id,
            name: hospital.name,
            location: hospital.location,
            address: hospital.address,
            city: hospital.city,
            state: hospital.state,
            distance: `${(Math.random() * 10).toFixed(1)} miles`, // Mock distance
            rating: (3.5 + Math.random() * 1.5).toFixed(1), // Mock rating between 3.5-5.0
            type: hospital.type || 'general'
        }));

        res.json(formattedHospitals);
    } catch (error) {
        console.error('Error fetching nearby hospitals:', error);
        res.status(500).json({ message: 'Error fetching nearby hospitals', error: error.message });
    }
};
