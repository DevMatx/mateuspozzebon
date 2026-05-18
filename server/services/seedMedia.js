require('dotenv').config();

const mongoose = require('mongoose');
const path = require('path');
const Media = require('../models/Media');
const { connectDatabase } = require('../config/database');
const { cloudinary, configureCloudinary } = require('../config/cloudinary');

const initialMedia = [
  {
    title: 'FJJ 2° edição',
    alt: 'Mateus Pozzebon em competição',
    url: '/assets/carrossel 1.jpeg',
    filePath: 'assets/carrossel 1.jpeg',
    resourceType: 'image',
    discipline: 'jiu-jitsu',
    category: 'campeonatos',
    placement: ['hero-carousel', 'gallery'],
    sortOrder: 1
  },
  {
    title: 'FJJ 3° edição',
    alt: 'Mateus Pozzebon',
    url: '/assets/carrossel 2.jpeg',
    filePath: 'assets/carrossel 2.jpeg',
    resourceType: 'image',
    discipline: 'jiu-jitsu',
    category: 'campeonatos',
    placement: ['hero-carousel', 'gallery'],
    sortOrder: 2
  },
  {
    title: 'FJJ 3° edição',
    alt: 'Mateus Pozzebon',
    url: '/assets/carrossel 3.jpeg',
    filePath: 'assets/carrossel 3.jpeg',
    resourceType: 'image',
    discipline: 'jiu-jitsu',
    category: 'campeonatos',
    placement: ['hero-carousel', 'gallery'],
    sortOrder: 3
  },
  {
    title: 'FJJ 3° edição',
    alt: 'Mateus Pozzebon',
    url: '/assets/carrossel 4.jpeg',
    filePath: 'assets/carrossel 4.jpeg',
    resourceType: 'image',
    discipline: 'jiu-jitsu',
    category: 'campeonatos',
    placement: ['hero-carousel', 'gallery'],
    sortOrder: 4
  },
  {
    title: 'Kimono Art',
    alt: 'Jiu-Jitsu',
    url: '/assets/kimono-art.png',
    filePath: 'assets/kimono-art.png',
    resourceType: 'image',
    discipline: 'jiu-jitsu',
    category: 'perfil',
    placement: ['about'],
    sortOrder: 5
  },
  {
    title: 'Threads Icon',
    alt: 'Threads',
    url: '/assets/threadsicon.png',
    filePath: 'assets/threadsicon.png',
    resourceType: 'image',
    discipline: 'all',
    category: 'social',
    placement: ['social'],
    sortOrder: 6
  },
  {
    title: 'Videos',
    alt: 'Vídeo de jiu-jitsu em campeonato',
    url: '/assets/videos/mata leão fjj2.mp4',
    filePath: 'assets/videos/mata leão fjj2.mp4',
    resourceType: 'video',
    discipline: 'jiu-jitsu',
    category: 'campeonatos',
    placement: ['gallery'],
    sortOrder: 7
  }
];

async function seedInitialMedia() {
  const existing = await Media.countDocuments();
  if (existing > 0) return;

  const useCloudinary = configureCloudinary();
  const docs = [];

  for (const item of initialMedia) {
    const { filePath, ...media } = item;

    if (!useCloudinary) {
      docs.push({ ...media, source: 'local-seed' });
      continue;
    }

    const upload = await cloudinary.uploader.upload(path.join(process.cwd(), filePath), {
      folder: 'mateus-pozzebon/seed',
      resource_type: media.resourceType
    });

    docs.push({
      ...media,
      url: upload.secure_url,
      publicId: upload.public_id,
      source: 'cloudinary'
    });
  }

  await Media.insertMany(docs);
  console.log('Mídias iniciais cadastradas no MongoDB');
}

if (require.main === module) {
  connectDatabase()
    .then(seedInitialMedia)
    .then(() => mongoose.disconnect())
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { seedInitialMedia, initialMedia };
