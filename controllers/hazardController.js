import Hazard from '../models/hazardModel.js';
import fs from 'fs';
import path from 'path';
import { calculateCredibility } from '../utils/calculateCredibility.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GET all hazards
export const getHazards = async (req, res) => {
    try {
        const { severity, hazardType, limit = 50, page = 1, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        const filter = {};
        if (severity) filter.severity = severity;
        if (hazardType) filter.hazardType = hazardType;

        const skip = (page - 1) * parseInt(limit);
        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        const hazards = await Hazard.find(filter).sort(sort).limit(parseInt(limit)).skip(skip);
        const total = await Hazard.countDocuments(filter);

        res.json({
            hazards,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch hazards', details: error.message });
    }
};

// GET hazard by ID
export const getHazardById = async (req, res) => {
    try {
        const hazard = await Hazard.findById(req.params.id);
        if (!hazard) return res.status(404).json({ error: 'Hazard not found' });
        res.json(hazard);
    } catch (error) {
        res.status(400).json({ error: 'Invalid hazard ID' });
    }
};

// CREATE hazard
export const createHazard = async (req, res) => {
    try {
        const { hazardType, severity, description, location, tags } = req.body;

        let parsedTags = [];
        if (tags) {
            try { parsedTags = JSON.parse(tags); } 
            catch { parsedTags = Array.isArray(tags) ? tags : [tags]; }
        }

        const hazardData = { hazardType, severity, description, location, tags: parsedTags };

        if (req.file) {
            const fileUrl = `/uploads/${req.file.filename}`;
            if (req.file.mimetype.startsWith('image/')) hazardData.images = [fileUrl];
            if (req.file.mimetype.startsWith('video/')) hazardData.videos = [fileUrl];
        }

        hazardData.credibilityScore = calculateCredibility(severity);

        const hazard = new Hazard(hazardData);
        const savedHazard = await hazard.save();

        res.status(201).json({ message: 'Hazard created', hazard: savedHazard });
    } catch (error) {
        if (req.file) fs.unlink(req.file.path, () => {});
        res.status(400).json({ error: 'Failed to create hazard', details: error.message });
    }
};

// UPDATE hazard
export const updateHazard = async (req, res) => {
    try {
        const { hazardType, severity, description, location, tags, verified } = req.body;
        const updateData = {};
        if (hazardType) updateData.hazardType = hazardType;
        if (severity) updateData.severity = severity;
        if (description) updateData.description = description;
        if (location) updateData.location = location;
        if (verified !== undefined) updateData.verified = verified === 'true';
        if (tags) {
            try { updateData.tags = JSON.parse(tags); } 
            catch { updateData.tags = Array.isArray(tags) ? tags : [tags]; }
        }

        if (req.file) {
            const fileUrl = `/uploads/${req.file.filename}`;
            updateData.$push = req.file.mimetype.startsWith('image/') ? { images: fileUrl } : { videos: fileUrl };
        }

        const hazard = await Hazard.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        if (!hazard) return res.status(404).json({ error: 'Hazard not found' });

        res.json({ message: 'Hazard updated', hazard });
    } catch (error) {
        if (req.file) fs.unlink(req.file.path, () => {});
        res.status(400).json({ error: 'Failed to update hazard', details: error.message });
    }
};

// DELETE hazard
export const deleteHazard = async (req, res) => {
    try {
        const hazard = await Hazard.findById(req.params.id);
        if (!hazard) return res.status(404).json({ error: 'Hazard not found' });

        const filesToDelete = [...(hazard.images || []), ...(hazard.videos || [])];
        filesToDelete.forEach(f => fs.unlink(path.join(__dirname, '../', f), () => {}));

        await Hazard.findByIdAndDelete(req.params.id);
        res.json({ message: 'Hazard deleted' });
    } catch (error) {
        res.status(400).json({ error: 'Failed to delete hazard', details: error.message });
    }
};
