const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { verifyToken } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Doctor routes
router.post('/', documentController.createDocument);
router.get('/doctor', documentController.getDoctorDocuments);
router.get('/templates', documentController.getDocumentTemplates);
router.post('/ai-summary', documentController.generateAISummary);
router.get('/stats', documentController.getDocumentStats);

// Patient routes
router.get('/patient', documentController.getPatientDocuments);

// Shared routes
router.get('/:id', documentController.getDocument);
router.get('/:id/download', documentController.downloadDocument);
router.put('/:id', documentController.updateDocument);
router.delete('/:id', documentController.deleteDocument);

module.exports = router;