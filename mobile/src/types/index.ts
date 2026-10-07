export type VehicleType = 'MINI' | 'SEDAN' | 'SUV';

export type RideStatus =
  | 'REQUESTED'
  | 'DRIVER_ASSIGNED'
  | 'DRIVER_ARRIVED'
  | 'STARTED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string | null;
  role: string;
}

export interface Vehicle {
  id: string;
  model: string;
  vehicleNumber: string;
  color: string;
  type: VehicleType;
}

export interface Driver {
  id: string;
  name: string;
  phoneNumber: string;
  rating: number;
  totalRides: number;
  status: 'AVAILABLE' | 'ON_RIDE' | 'OFFLINE';
  vehicle?: Vehicle | null;
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
  distanceKm: number;
  durationMin: number;
  driver?: Driver | null;
  createdAt: string;
  updatedAt: string;
}

export interface TrustedContact {
  id: string;
  name: string;
  phoneNumber: string;
  relationship: 'PARENT' | 'FRIEND' | 'SIBLING' | 'OTHER';
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  tasks?: Task[];
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  description?: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface SmartMatchResult {
  pickup: string;
  destination: string;
  rideType: VehicleType;
  estimatedFare: number;
  distanceKm: number;
  durationMin: number;
  recommendedDriver: {
    driver: Driver;
    matchScore: number;
    estimatedArrivalMin: number;
    distanceAwayKm: number;
  };
  alternativeDrivers: Array<{
    driver: Driver;
    matchScore: number;
    estimatedArrivalMin: number;
    distanceAwayKm: number;
  }>;
}
