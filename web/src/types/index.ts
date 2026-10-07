export type Role = 'PASSENGER' | 'DRIVER' | 'ADMIN';
export type ProjectStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type DriverStatus = 'AVAILABLE' | 'ON_RIDE' | 'OFFLINE';
export type VehicleType = 'MINI' | 'SEDAN' | 'SUV';
export type RideStatus =
  | 'REQUESTED'
  | 'DRIVER_ASSIGNED'
  | 'DRIVER_ARRIVING'
  | 'DRIVER_ARRIVED'
  | 'STARTED'
  | 'COMPLETED'
  | 'CANCELLED';
export type ContactRelationship = 'PARENT' | 'FRIEND' | 'SIBLING' | 'OTHER';
export type SafetyEventType = 'SOS' | 'VEHICLE_MISMATCH' | 'ROUTE_DEVIATION' | 'USER_UNSAFE' | 'REPORT_ISSUE';

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string | null;
  role: Role;
  createdAt?: string;
}

export interface Vehicle {
  id: string;
  driverId: string;
  model: string;
  vehicleNumber: string;
  color: string;
  type: VehicleType;
}

export interface Driver {
  id: string;
  name: string;
  photoUrl?: string | null;
  rating: number;
  totalRides: number;
  status: DriverStatus;
  phoneNumber: string;
  vehicle?: Vehicle | null;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
  totalTasks?: number;
  completedTasks?: number;
  progressPercent?: number;
  tasks?: Task[];
}

export interface Task {
  id: string;
  projectId: string;
  userId: string;
  name: string;
  description?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    name: string;
    status: ProjectStatus;
  };
}

export interface PickupPhoto {
  id: string;
  rideId: string;
  userId: string;
  imageUrl: string;
  description?: string | null;
  createdAt: string;
}

export interface SafetyEvent {
  id: string;
  rideId?: string | null;
  userId: string;
  type: SafetyEventType;
  severity: string;
  details?: string | null;
  status: string;
  createdAt: string;
}

export interface RideRating {
  id: string;
  rideId: string;
  userId: string;
  driverId: string;
  rating: number;
  review?: string | null;
  createdAt: string;
}

export interface Ride {
  id: string;
  userId: string;
  driverId?: string | null;
  pickup: string;
  destination: string;
  landmark?: string | null;
  rideType: VehicleType;
  status: RideStatus;
  pin: string;
  fareEstimate: number;
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  distanceKm: number;
  durationMin: number;
  vehicleMatches?: boolean | null;
  startedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  driver?: Driver | null;
  pickupPhotos?: PickupPhoto[];
  safetyEvents?: SafetyEvent[];
  ratings?: RideRating[];
}

export interface TrustedContact {
  id: string;
  userId: string;
  name: string;
  phoneNumber: string;
  relationship: ContactRelationship;
  createdAt: string;
}

export interface DashboardData {
  overview: {
    totalProjects: number;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    projectsInProgress: number;
    projectsCompleted: number;
    projectsNotStarted: number;
    totalRides: number;
    completedRides: number;
    activeRides: number;
    cancelledRides: number;
    averageDriverRating: number;
    safetyEvents: number;
  };
  recentProjects: Array<{
    id: string;
    name: string;
    description?: string;
    status: ProjectStatus;
    totalTasks: number;
    completedTasks: number;
    progressPercent: number;
    updatedAt: string;
  }>;
  recentRides: Ride[];
  upcomingTasks: Task[];
}

export interface SmartMatchResult {
  fareDetails: {
    baseFare: number;
    distanceFare: number;
    timeFare: number;
    subtotal: number;
    multiplier: number;
    estimatedFare: number;
    distanceKm: number;
    durationMin: number;
  };
  recommendedDriver: {
    driver: Driver;
    distanceKm: number;
    etaMin: number;
    rating: number;
    vehicle: Vehicle;
    smartMatchScore: number;
    isRecommended: boolean;
    scoreBreakdown: {
      distanceScore: number;
      etaScore: number;
      ratingScore: number;
      availabilityScore: number;
      vehicleScore: number;
    };
  };
  candidates: Array<{
    driver: Driver;
    distanceKm: number;
    etaMin: number;
    rating: number;
    vehicle: Vehicle;
    smartMatchScore: number;
    isRecommended: boolean;
  }>;
}
