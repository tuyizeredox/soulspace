const Medication = require('../models/Medication');

/**
 * Get all medications
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getAllMedications = async (req, res) => {
  try {
    const medications = await Medication.find({ active: true })
      .sort('name')
      .select('name category commonDosages description');
    
    res.json(medications);
  } catch (error) {
    console.error('Error fetching medications:', error);
    res.status(500).json({ message: 'Error fetching medications', error: error.message });
  }
};

/**
 * Get medication by ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getMedicationById = async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }
    
    res.json(medication);
  } catch (error) {
    console.error('Error fetching medication:', error);
    res.status(500).json({ message: 'Error fetching medication', error: error.message });
  }
};

/**
 * Create a new medication
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.createMedication = async (req, res) => {
  try {
    // Check if user is authorized to create medications
    if (!['admin', 'doctor', 'pharmacist', 'hospital_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to create medications' });
    }
    
    const {
      name,
      category,
      description,
      commonDosages,
      sideEffects,
      contraindications,
      interactions,
      requiresPrescription
    } = req.body;
    
    // Check if medication already exists
    const existingMedication = await Medication.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      category: { $regex: new RegExp(`^${category}$`, 'i') }
    });
    
    if (existingMedication) {
      return res.status(400).json({ message: 'Medication already exists' });
    }
    
    const medication = new Medication({
      name,
      category,
      description,
      commonDosages,
      sideEffects,
      contraindications,
      interactions,
      requiresPrescription,
      createdBy: req.user._id,
      hospital: req.user.hospitalId
    });
    
    await medication.save();
    
    res.status(201).json(medication);
  } catch (error) {
    console.error('Error creating medication:', error);
    res.status(500).json({ message: 'Error creating medication', error: error.message });
  }
};

/**
 * Update a medication
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.updateMedication = async (req, res) => {
  try {
    // Check if user is authorized to update medications
    if (!['admin', 'doctor', 'pharmacist', 'hospital_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to update medications' });
    }
    
    const {
      name,
      category,
      description,
      commonDosages,
      sideEffects,
      contraindications,
      interactions,
      requiresPrescription,
      active
    } = req.body;
    
    const medication = await Medication.findById(req.params.id);
    
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }
    
    // Only allow updates by the creator, hospital admin, or system admin
    if (
      req.user.role !== 'admin' &&
      medication.createdBy.toString() !== req.user._id.toString() &&
      (req.user.role !== 'hospital_admin' || medication.hospital.toString() !== req.user.hospitalId.toString())
    ) {
      return res.status(403).json({ message: 'Not authorized to update this medication' });
    }
    
    // Update fields
    if (name) medication.name = name;
    if (category) medication.category = category;
    if (description !== undefined) medication.description = description;
    if (commonDosages) medication.commonDosages = commonDosages;
    if (sideEffects) medication.sideEffects = sideEffects;
    if (contraindications) medication.contraindications = contraindications;
    if (interactions) medication.interactions = interactions;
    if (requiresPrescription !== undefined) medication.requiresPrescription = requiresPrescription;
    if (active !== undefined) medication.active = active;
    
    await medication.save();
    
    res.json(medication);
  } catch (error) {
    console.error('Error updating medication:', error);
    res.status(500).json({ message: 'Error updating medication', error: error.message });
  }
};

/**
 * Delete a medication (soft delete by setting active to false)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.deleteMedication = async (req, res) => {
  try {
    // Check if user is authorized to delete medications
    if (!['admin', 'hospital_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to delete medications' });
    }
    
    const medication = await Medication.findById(req.params.id);
    
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }
    
    // Only allow deletion by hospital admin of the same hospital or system admin
    if (
      req.user.role !== 'admin' &&
      (req.user.role !== 'hospital_admin' || medication.hospital.toString() !== req.user.hospitalId.toString())
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this medication' });
    }
    
    // Soft delete
    medication.active = false;
    await medication.save();
    
    res.json({ message: 'Medication deleted successfully' });
  } catch (error) {
    console.error('Error deleting medication:', error);
    res.status(500).json({ message: 'Error deleting medication', error: error.message });
  }
};

/**
 * Search medications
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.searchMedications = async (req, res) => {
  try {
    const { query, category } = req.query;
    
    const searchQuery = { active: true };
    
    if (query) {
      searchQuery.name = { $regex: query, $options: 'i' };
    }
    
    if (category) {
      searchQuery.category = { $regex: category, $options: 'i' };
    }
    
    const medications = await Medication.find(searchQuery)
      .sort('name')
      .select('name category commonDosages description');
    
    res.json(medications);
  } catch (error) {
    console.error('Error searching medications:', error);
    res.status(500).json({ message: 'Error searching medications', error: error.message });
  }
};