import bcrypt from 'bcryptjs';
import { prisma } from './client.js';
import { CHENNAI_LOCATIONS } from '../services/graph.service.js';

async function main() {
  console.log('[SEED] Starting WayGo database seed...');

  // 1. Seed Chennai Locations
  console.log(`[SEED] Seeding ${CHENNAI_LOCATIONS.length} Chennai transit locations...`);
  for (const loc of CHENNAI_LOCATIONS) {
    await prisma.location.upsert({
      where: { name: loc.name },
      update: {
        latitude: loc.latitude,
        longitude: loc.longitude,
        areaType: loc.areaType,
        active: true,
      },
      create: {
        name: loc.name,
        latitude: loc.latitude,
        longitude: loc.longitude,
        areaType: loc.areaType,
        active: true,
      },
    });
  }
  console.log('[SEED] Locations seeded successfully.');

  // 2. Seed Demo User
  // Email: demo@waygo.app
  // Password: WayGo123!
  const demoEmail = 'demo@waygo.app';
  const demoPhone = '+919876543210';
  const demoPasswordHash = await bcrypt.hash('WayGo123!', 10);

  const demoUser = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {
      name: 'WayGo Explorer',
      phoneNumber: demoPhone,
      passwordHash: demoPasswordHash,
      emailVerified: true,
      phoneVerified: true,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    create: {
      name: 'WayGo Explorer',
      email: demoEmail,
      phoneNumber: demoPhone,
      passwordHash: demoPasswordHash,
      emailVerified: true,
      phoneVerified: true,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  console.log(`[SEED] Seeded Demo User: ${demoUser.email} (ID: ${demoUser.id})`);

  // 3. Seed Sample Favorites and History for Demo User
  const central = await prisma.location.findUnique({ where: { name: 'Chennai Central' } });
  const annaNagar = await prisma.location.findUnique({ where: { name: 'Anna Nagar' } });
  const velachery = await prisma.location.findUnique({ where: { name: 'Velachery' } });
  const sholinganallur = await prisma.location.findUnique({ where: { name: 'Sholinganallur' } });
  const tambaram = await prisma.location.findUnique({ where: { name: 'Tambaram' } });
  const airport = await prisma.location.findUnique({ where: { name: 'Chennai Airport' } });

  if (central && annaNagar && velachery && sholinganallur && tambaram && airport) {
    // Favorite 1: Central to Anna Nagar
    await prisma.favoriteRoute.upsert({
      where: {
        userId_sourceLocationId_destinationLocationId: {
          userId: demoUser.id,
          sourceLocationId: central.id,
          destinationLocationId: annaNagar.id,
        },
      },
      update: { preferredMode: 'METRO' },
      create: {
        userId: demoUser.id,
        sourceLocationId: central.id,
        destinationLocationId: annaNagar.id,
        preferredMode: 'METRO',
      },
    });

    // Favorite 2: Velachery to Sholinganallur
    await prisma.favoriteRoute.upsert({
      where: {
        userId_sourceLocationId_destinationLocationId: {
          userId: demoUser.id,
          sourceLocationId: velachery.id,
          destinationLocationId: sholinganallur.id,
        },
      },
      update: { preferredMode: 'BUS' },
      create: {
        userId: demoUser.id,
        sourceLocationId: velachery.id,
        destinationLocationId: sholinganallur.id,
        preferredMode: 'BUS',
      },
    });

    // History items
    const existingHistory = await prisma.routeHistory.count({ where: { userId: demoUser.id } });
    if (existingHistory === 0) {
      await prisma.routeHistory.createMany({
        data: [
          {
            userId: demoUser.id,
            sourceLocationId: central.id,
            destinationLocationId: annaNagar.id,
            selectedMode: 'METRO',
            selectedPreference: 'FASTEST',
            searchedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          },
          {
            userId: demoUser.id,
            sourceLocationId: velachery.id,
            destinationLocationId: sholinganallur.id,
            selectedMode: 'BUS',
            selectedPreference: 'CHEAPEST',
            searchedAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
          },
          {
            userId: demoUser.id,
            sourceLocationId: tambaram.id,
            destinationLocationId: airport.id,
            selectedMode: 'TRAIN',
            selectedPreference: 'FASTEST',
            searchedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          },
        ],
      });
    }
  }

  console.log('[SEED] Database seeding complete! Ready for local development.');
}

main()
  .catch((e) => {
    console.error('[SEED] Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
