import { PrismaClient, VehicleType, DriverStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DRIVERS = [
  {
    name: 'Rajesh Kumar',
    phoneNumber: '+91-98765-43210',
    rating: 4.8,
    totalRides: 1247,
    status: DriverStatus.AVAILABLE,
    vehicle: {
      type: VehicleType.SEDAN,
      model: 'Honda City (2022)',
      vehicleNumber: 'DL 4C AB 1234',
      color: 'Pearl White',
    },
  },
  {
    name: 'Priya Sharma',
    phoneNumber: '+91-87654-32109',
    rating: 4.9,
    totalRides: 892,
    status: DriverStatus.AVAILABLE,
    vehicle: {
      type: VehicleType.MINI,
      model: 'Maruti Swift (2023)',
      vehicleNumber: 'MH 12 BC 5678',
      color: 'Silver',
    },
  },
  {
    name: 'Arjun Singh',
    phoneNumber: '+91-76543-21098',
    rating: 4.6,
    totalRides: 2100,
    status: DriverStatus.ON_RIDE,
    vehicle: {
      type: VehicleType.SUV,
      model: 'Toyota Innova Crysta (2021)',
      vehicleNumber: 'UP 32 CD 9012',
      color: 'Pearl White',
    },
  },
  {
    name: 'Meena Devi',
    phoneNumber: '+91-65432-10987',
    rating: 4.7,
    totalRides: 543,
    status: DriverStatus.AVAILABLE,
    vehicle: {
      type: VehicleType.SEDAN,
      model: 'Hyundai Verna (2022)',
      vehicleNumber: 'KA 01 EF 3456',
      color: 'Midnight Black',
    },
  },
  {
    name: 'Vikram Patel',
    phoneNumber: '+91-54321-09876',
    rating: 4.5,
    totalRides: 3201,
    status: DriverStatus.AVAILABLE,
    vehicle: {
      type: VehicleType.SEDAN,
      model: 'BMW 3 Series (2023)',
      vehicleNumber: 'GJ 05 GH 7890',
      color: 'Sapphire Blue',
    },
  },
  {
    name: 'Sunita Rao',
    phoneNumber: '+91-43210-98765',
    rating: 4.8,
    totalRides: 1560,
    status: DriverStatus.AVAILABLE,
    vehicle: {
      type: VehicleType.MINI,
      model: 'Tata Altroz (2023)',
      vehicleNumber: 'TS 09 IJ 2345',
      color: 'Avenue White',
    },
  },
  {
    name: 'Anil Mehta',
    phoneNumber: '+91-32109-87654',
    rating: 4.3,
    totalRides: 780,
    status: DriverStatus.OFFLINE,
    vehicle: {
      type: VehicleType.SUV,
      model: 'Mahindra Scorpio N (2022)',
      vehicleNumber: 'RJ 14 KL 6789',
      color: 'Napoli Black',
    },
  },
  {
    name: 'Deepa Nair',
    phoneNumber: '+91-21098-76543',
    rating: 4.9,
    totalRides: 320,
    status: DriverStatus.AVAILABLE,
    vehicle: {
      type: VehicleType.SUV,
      model: 'Kia Seltos (2023)',
      vehicleNumber: 'KL 07 MN 0123',
      color: 'Glacier White',
    },
  },
];

async function main() {
  console.log('🌱 Starting RideSafe AI database seed...');

  // Clean existing data in correct order
  await prisma.chatMessage.deleteMany({});
  await prisma.chatSession.deleteMany({});
  await prisma.routeDeviationEvent.deleteMany({});
  await prisma.rideRating.deleteMany({});
  await prisma.safetyEvent.deleteMany({});
  await prisma.tripShare.deleteMany({});
  await prisma.pickupPhoto.deleteMany({});
  await prisma.ride.deleteMany({});
  await prisma.vehicle.deleteMany({});
  await prisma.driver.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.trustedContact.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🗑️  Cleared existing data');

  // Seed drivers with vehicles
  for (const driverData of DRIVERS) {
    const { vehicle, ...driverFields } = driverData;

    const driver = await prisma.driver.create({
      data: {
        ...driverFields,
        photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${driverFields.name.replace(/ /g, '')}`,
        vehicle: {
          create: vehicle,
        },
      },
    });

    console.log(`✅ Created driver: ${driver.name}`);
  }

  // Seed demo passenger user
  const passwordHash = await bcrypt.hash('Demo@1234', 12);
  const demoUser = await prisma.user.create({
    data: {
      name: 'Demo Passenger',
      email: 'demo@ridesafe.ai',
      passwordHash,
      phoneNumber: '+91-99999-00000',
      role: 'PASSENGER',
    },
  });
  console.log(`✅ Created demo user: ${demoUser.email} (password: Demo@1234)`);

  // Seed projects and tasks
  const project1 = await prisma.project.create({
    data: {
      userId: demoUser.id,
      name: 'RideSafe Q4 Platform Launch',
      description: 'Plan and execute Q4 product launch with safety certifications and new feature rollouts.',
      status: 'IN_PROGRESS',
      endDate: new Date('2026-12-31'),
      tasks: {
        create: [
          {
            userId: demoUser.id,
            name: 'Finalize safety audit report',
            description: 'Complete security and safety audit for the ride verification system.',
            status: 'IN_PROGRESS',
            priority: 'HIGH',
            dueDate: new Date('2026-10-20'),
          },
          {
            userId: demoUser.id,
            name: 'Onboard 50 new verified drivers',
            description: 'Run background checks and onboard 50 new drivers in Delhi-NCR.',
            status: 'PENDING',
            priority: 'HIGH',
            dueDate: new Date('2026-10-25'),
          },
          {
            userId: demoUser.id,
            name: 'Deploy mobile app v2.0',
            description: 'Release new mobile app with SOS and biometric features to Play Store.',
            status: 'PENDING',
            priority: 'MEDIUM',
            dueDate: new Date('2026-11-01'),
          },
          {
            userId: demoUser.id,
            name: 'Marketing campaign preparation',
            description: 'Prepare launch materials, social media assets, and press release.',
            status: 'COMPLETED',
            priority: 'MEDIUM',
            dueDate: new Date('2026-10-15'),
          },
        ],
      },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      userId: demoUser.id,
      name: 'Driver Training Program',
      description: 'Comprehensive safety training program for all registered RideSafe drivers.',
      status: 'NOT_STARTED',
      endDate: new Date('2027-01-31'),
      tasks: {
        create: [
          {
            userId: demoUser.id,
            name: 'Create training curriculum',
            description: 'Develop comprehensive training modules for driver safety protocols.',
            status: 'PENDING',
            priority: 'HIGH',
            dueDate: new Date('2026-11-15'),
          },
          {
            userId: demoUser.id,
            name: 'Set up training portal',
            description: 'Build online portal for drivers to complete training modules.',
            status: 'PENDING',
            priority: 'MEDIUM',
            dueDate: new Date('2026-11-30'),
          },
        ],
      },
    },
  });

  console.log(`✅ Created projects: ${project1.name}, ${project2.name}`);

  // Seed trusted contacts
  await prisma.trustedContact.createMany({
    data: [
      {
        userId: demoUser.id,
        name: 'Mom',
        phoneNumber: '+91-98888-11111',
        relationship: 'PARENT',
      },
      {
        userId: demoUser.id,
        name: 'Best Friend Kavya',
        phoneNumber: '+91-97777-22222',
        relationship: 'FRIEND',
      },
      {
        userId: demoUser.id,
        name: 'Brother Rohit',
        phoneNumber: '+91-96666-33333',
        relationship: 'SIBLING',
      },
    ],
  });
  console.log(`✅ Created trusted contacts for demo user`);

  console.log('\n🎉 Database seed completed successfully!');
  console.log('📌 Demo Login: demo@ridesafe.ai / Demo@1234');
  console.log('📌 Backend API: http://localhost:5000/api/health');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
