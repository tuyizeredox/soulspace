const Document = require('../models/Document');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

// Encryption utilities
const ENCRYPTION_KEY = process.env.DOCUMENT_ENCRYPTION_KEY || crypto.randomBytes(32);
const IV_LENGTH = 16;

const encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

const decrypt = (text) => {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = textParts.join(':');
  const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

// Create document
exports.createDocument = async (req, res) => {
  try {
    const {
      title,
      type,
      content,
      patientId,
      signature,
      metadata,
      fileData
    } = req.body;

    // Verify doctor authorization
    const doctorId = req.user.id;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(403).json({ message: 'Access denied. Doctor not found.' });
    }

    // Verify patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Get hospital ID from doctor
    const hospitalId = doctor.hospitalId;

    // Create file from base64 data
    const fileName = `${type}_${patientId}_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '../uploads/documents', fileName);
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    
    // Decode and save file
    const fileBuffer = Buffer.from(fileData, 'base64');
    await fs.writeFile(filePath, fileBuffer);

    // Encrypt sensitive content
    const encryptedContent = encrypt(JSON.stringify(content));

    // Create document
    const document = new Document({
      title,
      type,
      content: encryptedContent,
      patientId,
      doctorId,
      hospitalId,
      fileUrl: `/uploads/documents/${fileName}`,
      fileName,
      fileSize: fileBuffer.length,
      isEncrypted: true,
      signature: {
        ...signature,
        signedAt: new Date()
      },
      metadata,
      status: 'sent',
      sentAt: new Date()
    });

    await document.save();

    // Populate related data
    await document.populate(['patient', 'doctor', 'hospital']);

    res.status(201).json({
      message: 'Document created successfully',
      document
    });
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get documents for doctor
exports.getDoctorDocuments = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { page = 1, limit = 10, type, status, patientId } = req.query;

    const query = { doctorId, isActive: true };
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (patientId) query.patientId = patientId;

    const documents = await Document.find(query)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Document.countDocuments(query);

    res.json({
      documents,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching doctor documents:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get documents for patient
exports.getPatientDocuments = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { page = 1, limit = 10, type, status } = req.query;

    const query = { patientId, isActive: true, status: { $ne: 'draft' } };
    
    if (type) query.type = type;
    if (status) query.status = status;

    const documents = await Document.find(query)
      .populate('doctor', 'name specialization')
      .populate('hospital', 'name address')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Document.countDocuments(query);

    // Group documents by type for folder structure
    const documentsByType = documents.reduce((acc, doc) => {
      if (!acc[doc.type]) {
        acc[doc.type] = [];
      }
      acc[doc.type].push(doc);
      return acc;
    }, {});

    res.json({
      documents,
      documentsByType,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching patient documents:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single document
exports.getDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const document = await Document.findById(id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization')
      .populate('hospital', 'name address');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check authorization
    const isAuthorized = 
      (userRole === 'doctor' && document.doctorId.toString() === userId) ||
      (userRole === 'patient' && document.patientId.toString() === userId) ||
      userRole === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Decrypt content if needed
    let decryptedContent = document.content;
    if (document.isEncrypted) {
      try {
        decryptedContent = JSON.parse(decrypt(document.content));
      } catch (error) {
        console.error('Error decrypting document content:', error);
      }
    }

    // Update view status for patients
    if (userRole === 'patient' && document.status === 'sent') {
      document.status = 'viewed';
      document.viewedAt = new Date();
      await document.save();
    }

    res.json({
      ...document.toObject(),
      content: decryptedContent
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Download document
exports.downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check authorization
    const isAuthorized = 
      (userRole === 'doctor' && document.doctorId.toString() === userId) ||
      (userRole === 'patient' && document.patientId.toString() === userId) ||
      userRole === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update download status
    if (userRole === 'patient') {
      document.status = 'downloaded';
      document.downloadedAt = new Date();
      await document.save();
    }

    const filePath = path.join(__dirname, '..', document.fileUrl);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.download(filePath, document.fileName);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update document
exports.updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user.id;
    const updates = req.body;

    const document = await Document.findOne({ _id: id, doctorId });

    if (!document) {
      return res.status(404).json({ message: 'Document not found or access denied' });
    }

    // Only allow updates to draft documents
    if (document.status !== 'draft') {
      return res.status(400).json({ message: 'Cannot update sent documents' });
    }

    // Encrypt content if provided
    if (updates.content) {
      updates.content = encrypt(JSON.stringify(updates.content));
    }

    Object.assign(document, updates);
    await document.save();

    await document.populate(['patient', 'doctor', 'hospital']);

    res.json({
      message: 'Document updated successfully',
      document
    });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete document
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user.id;

    const document = await Document.findOne({ _id: id, doctorId });

    if (!document) {
      return res.status(404).json({ message: 'Document not found or access denied' });
    }

    // Soft delete
    document.isActive = false;
    await document.save();

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get document templates
exports.getDocumentTemplates = async (req, res) => {
  try {
    const templates = {
      prescription: {
        title: 'Prescription',
        fields: [
          { name: 'medications', type: 'array', required: true },
          { name: 'instructions', type: 'text', required: true },
          { name: 'duration', type: 'text', required: true },
          { name: 'refills', type: 'number', required: false }
        ]
      },
      medical_report: {
        title: 'Medical Report',
        fields: [
          { name: 'diagnosis', type: 'text', required: true },
          { name: 'symptoms', type: 'text', required: true },
          { name: 'examination', type: 'text', required: true },
          { name: 'recommendations', type: 'text', required: true }
        ]
      },
      lab_orders: {
        title: 'Laboratory Orders',
        fields: [
          { name: 'tests', type: 'array', required: true },
          { name: 'urgency', type: 'select', options: ['routine', 'urgent', 'stat'], required: true },
          { name: 'instructions', type: 'text', required: false }
        ]
      },
      test_results: {
        title: 'Test Results',
        fields: [
          { name: 'testName', type: 'text', required: true },
          { name: 'results', type: 'text', required: true },
          { name: 'normalRange', type: 'text', required: false },
          { name: 'interpretation', type: 'text', required: true }
        ]
      },
      follow_up_instructions: {
        title: 'Follow-up Instructions',
        fields: [
          { name: 'instructions', type: 'text', required: true },
          { name: 'nextAppointment', type: 'date', required: false },
          { name: 'warnings', type: 'text', required: false }
        ]
      },
      medication_plan: {
        title: 'Medication Plan',
        fields: [
          { name: 'medications', type: 'array', required: true },
          { name: 'schedule', type: 'text', required: true },
          { name: 'duration', type: 'text', required: true },
          { name: 'sideEffects', type: 'text', required: false }
        ]
      },
      sick_note: {
        title: 'Sick Note',
        fields: [
          { name: 'diagnosis', type: 'text', required: true },
          { name: 'startDate', type: 'date', required: true },
          { name: 'endDate', type: 'date', required: true },
          { name: 'restrictions', type: 'text', required: false }
        ]
      },
      visit_summary: {
        title: 'Visit Summary',
        fields: [
          { name: 'chiefComplaint', type: 'text', required: true },
          { name: 'assessment', type: 'text', required: true },
          { name: 'plan', type: 'text', required: true },
          { name: 'followUp', type: 'text', required: false }
        ]
      }
    };

    res.json({ templates });
  } catch (error) {
    console.error('Error fetching document templates:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Generate AI summary
exports.generateAISummary = async (req, res) => {
  try {
    const { content, type } = req.body;

    // Mock AI summary generation (replace with actual AI service)
    const generateSummary = (content, type) => {
      const summaries = {
        prescription: `Prescription for ${content.medications?.length || 0} medication(s) with specific dosage instructions.`,
        medical_report: `Medical report documenting ${content.diagnosis || 'condition'} with examination findings and recommendations.`,
        lab_orders: `Laboratory orders for ${content.tests?.length || 0} test(s) with ${content.urgency || 'routine'} priority.`,
        test_results: `Test results for ${content.testName || 'laboratory test'} showing ${content.interpretation || 'findings'}.`,
        follow_up_instructions: `Follow-up care instructions with specific guidance for patient recovery.`,
        medication_plan: `Comprehensive medication plan with ${content.medications?.length || 0} prescribed medications.`,
        sick_note: `Medical certificate documenting illness from ${content.startDate || 'start date'} to ${content.endDate || 'end date'}.`,
        visit_summary: `Visit summary documenting ${content.chiefComplaint || 'patient concerns'} and treatment plan.`
      };

      return summaries[type] || 'Document summary generated by AI assistant.';
    };

    const summary = generateSummary(content, type);

    res.json({ summary });
  } catch (error) {
    console.error('Error generating AI summary:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get document statistics
exports.getDocumentStats = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const stats = await Document.aggregate([
      { $match: { doctorId: mongoose.Types.ObjectId(doctorId), isActive: true } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          recent: { $max: '$createdAt' }
        }
      }
    ]);

    const totalDocuments = await Document.countDocuments({ doctorId, isActive: true });
    const sentToday = await Document.countDocuments({
      doctorId,
      isActive: true,
      sentAt: { $gte: new Date().setHours(0, 0, 0, 0) }
    });

    res.json({
      totalDocuments,
      sentToday,
      byType: stats
    });
  } catch (error) {
    console.error('Error fetching document stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};