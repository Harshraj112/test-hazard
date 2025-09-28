import express from 'express';
import {
    getHazards,
    getHazardById,
    createHazard,
    updateHazard,
    deleteHazard
} from '../controllers/hazardController.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getHazards);
router.get('/:id', getHazardById);
router.post('/', upload.single('file'), createHazard);
router.put('/:id', upload.single('file'), updateHazard);
router.delete('/:id', deleteHazard);

export default router;
