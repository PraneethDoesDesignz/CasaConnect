import express from 'express';
import dualAuth from '../utils/dualAuth.js';
import * as leadController from '../controllers/lead.controller.js';

const router = express.Router();

// All routes require dual JWT/Firebase authentication
router.post('/', dualAuth, leadController.createLead);
router.get('/:id', dualAuth, leadController.getLead);
router.put('/:id', dualAuth, leadController.updateLead);

export default router;
