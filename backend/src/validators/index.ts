import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phoneNumber: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional().nullable(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']).optional().default('NOT_STARTED'),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1, 'Project name cannot be empty').optional(),
  description: z.string().optional().nullable(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']).optional(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

export const createTaskSchema = z.object({
  projectId: z.string().uuid('Valid project ID required'),
  name: z.string().min(1, 'Task name is required'),
  description: z.string().optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional().default('MEDIUM'),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional().default('PENDING'),
  dueDate: z.string().optional().nullable(),
});

export const updateTaskSchema = z.object({
  name: z.string().min(1, 'Task name cannot be empty').optional(),
  description: z.string().optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  dueDate: z.string().optional().nullable(),
});

export const bookRideSchema = z.object({
  pickup: z.string().min(2, 'Pickup location is required'),
  destination: z.string().min(2, 'Destination location is required'),
  landmark: z.string().optional().nullable(),
  rideType: z.enum(['MINI', 'SEDAN', 'SUV']).optional().default('SEDAN'),
  driverId: z.string().uuid().optional().nullable(),
});

export const smartMatchQuerySchema = z.object({
  pickup: z.string().min(2, 'Pickup location is required'),
  destination: z.string().min(2, 'Destination location is required'),
  rideType: z.enum(['MINI', 'SEDAN', 'SUV']).optional().default('SEDAN'),
});

export const verifyPinSchema = z.object({
  pin: z.string().regex(/^\d{4}$/, 'Ride PIN must be exactly 4 digits'),
});

export const verifyVehicleSchema = z.object({
  matches: z.boolean(),
  notes: z.string().optional().nullable(),
});

export const createRideRatingSchema = z.object({
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5 stars'),
  review: z.string().max(500, 'Review cannot exceed 500 characters').optional().nullable(),
});

export const createTrustedContactSchema = z.object({
  name: z.string().min(2, 'Contact name is required'),
  phoneNumber: z.string().min(7, 'Valid phone number is required'),
  relationship: z.enum(['PARENT', 'FRIEND', 'SIBLING', 'OTHER']).optional().default('OTHER'),
});

export const updateTrustedContactSchema = z.object({
  name: z.string().min(2).optional(),
  phoneNumber: z.string().min(7).optional(),
  relationship: z.enum(['PARENT', 'FRIEND', 'SIBLING', 'OTHER']).optional(),
});

export const createSafetyEventSchema = z.object({
  type: z.enum(['SOS', 'VEHICLE_MISMATCH', 'ROUTE_DEVIATION', 'USER_UNSAFE', 'REPORT_ISSUE']),
  details: z.string().optional().nullable(),
  severity: z.string().optional().default('HIGH'),
});

export const routeCheckSchema = z.object({
  simulatedDeviationMeters: z.number().min(0).optional().default(180),
});

export const aiChatSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  sessionId: z.string().uuid().optional(),
});
