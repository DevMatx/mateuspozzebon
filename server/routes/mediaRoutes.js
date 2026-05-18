const express = require('express');
const multer = require('multer');
const { Readable } = require('stream');
const Media = require('../models/Media');
const { requireAuth } = require('../middleware/auth');
const { cloudinary, configureCloudinary } = require('../config/cloudinary');

const router = express.Router();
const asyncHandler = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }
});

function normalizePlacement(value) {
  if (Array.isArray(value)) return value;
  if (!value) return ['gallery'];
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function uploadToCloudinary(file) {
  if (!configureCloudinary()) {
    const error = new Error('Configure as credenciais do Cloudinary no .env');
    error.status = 400;
    throw error;
  }

  const resourceType = file.mimetype.startsWith('video/') ? 'video' : 'image';

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'mateus-pozzebon/media',
        resource_type: resourceType
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve({ result, resourceType });
      }
    );

    Readable.from(file.buffer).pipe(stream);
  });
}

router.get('/', asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.active !== 'false') filter.isActive = true;
  if (req.query.placement) filter.placement = req.query.placement;
  if (req.query.discipline && req.query.discipline !== 'all') filter.discipline = req.query.discipline;
  if (req.query.category && req.query.category !== 'all') filter.category = req.query.category;
  if (req.query.resourceType) filter.resourceType = req.query.resourceType;

  const media = await Media.find(filter).sort({ sortOrder: 1, createdAt: 1 });
  res.json(media);
}));

router.get('/admin', requireAuth, asyncHandler(async (_req, res) => {
  const media = await Media.find({}).sort({ sortOrder: 1, createdAt: 1 });
  res.json(media);
}));

router.post('/', requireAuth, upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Envie um arquivo de imagem ou vídeo' });
  }

  const { result, resourceType } = await uploadToCloudinary(req.file);
  const media = await Media.create({
    title: req.body.title || req.file.originalname,
    alt: req.body.alt || req.body.title || req.file.originalname,
    url: result.secure_url,
    publicId: result.public_id,
    resourceType,
    discipline: req.body.discipline || 'jiu-jitsu',
    category: req.body.category || 'campeonatos',
    placement: normalizePlacement(req.body.placement),
    sortOrder: Number(req.body.sortOrder || 0),
    isActive: req.body.isActive !== 'false',
    source: 'cloudinary'
  });

  res.status(201).json(media);
}));

router.put('/:id', requireAuth, asyncHandler(async (req, res) => {
  const updates = {
    title: req.body.title,
    alt: req.body.alt,
    discipline: req.body.discipline,
    category: req.body.category,
    placement: normalizePlacement(req.body.placement),
    sortOrder: Number(req.body.sortOrder || 0),
    isActive: req.body.isActive !== false && req.body.isActive !== 'false'
  };

  Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

  const media = await Media.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true
  });

  if (!media) return res.status(404).json({ message: 'Mídia não encontrada' });
  return res.json(media);
}));

router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const media = await Media.findByIdAndDelete(req.params.id);

  if (!media) return res.status(404).json({ message: 'Mídia não encontrada' });

  if (media.publicId) {
    configureCloudinary();
    await cloudinary.uploader.destroy(media.publicId, { resource_type: media.resourceType }).catch(() => null);
  }

  res.json({ message: 'Mídia removida' });
}));

module.exports = router;
