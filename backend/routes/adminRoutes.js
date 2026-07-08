import express from 'express';
import { getAdminStats } from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';

const router = express.Router();

router.get('/admin/stats', protect, admin, getAdminStats);

export default router;
