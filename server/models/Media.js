const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    alt: { type: String, default: '', trim: true },
    url: { type: String, required: true },
    publicId: { type: String, default: null },
    resourceType: { type: String, enum: ['image', 'video'], required: true },
    discipline: {
      type: String,
      enum: ['jiu-jitsu', 'boxing', 'mma', 'muay-thai', 'kickboxing', 'all'],
      default: 'jiu-jitsu'
    },
    category: {
      type: String,
      enum: ['campeonatos', 'treinos', 'preparacao', 'perfil', 'social'],
      default: 'campeonatos'
    },
    placement: {
      type: [String],
      enum: ['hero-carousel', 'gallery', 'about', 'social'],
      default: ['gallery']
    },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    source: { type: String, enum: ['local-seed', 'cloudinary'], default: 'cloudinary' }
  },
  { timestamps: true }
);

mediaSchema.index({ isActive: 1, sortOrder: 1, createdAt: -1 });

module.exports = mongoose.model('Media', mediaSchema);
