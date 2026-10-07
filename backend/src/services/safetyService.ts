import crypto from 'crypto';
import { SafetyEventType, ContactRelationship, Prisma } from '@prisma/client';
import { prisma } from '../config/db';

export class SafetyService {
  static async getSafetyOverview(userId: string, rideId?: string) {
    const trustedContacts = await prisma.trustedContact.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    let currentRide = null;
    let safetyEvents: any[] = [];

    if (rideId) {
      currentRide = await prisma.ride.findFirst({
        where: { id: rideId, userId },
        include: {
          driver: { include: { vehicle: true } },
          tripShares: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      });

      safetyEvents = await prisma.safetyEvent.findMany({
        where: { rideId, userId },
        orderBy: { createdAt: 'desc' },
      });
    }

    return {
      currentRide,
      trustedContacts,
      safetyEvents,
      safetyGuidance: [
        'Always check the vehicle registration plate and car color before opening doors.',
        'Never board if the driver refuses to verify your 4-digit Ride PIN.',
        'Share your live trip with a family member or trusted friend before starting.',
        'If you feel uncomfortable or unsafe at any moment, use the prominent "I Don\'t Feel Safe" button.',
        'Prototype Notice: This platform demonstrates safety workflows. In real danger, always dial 112 or local emergency dispatchers immediately.',
      ],
    };
  }

  static async triggerSOS(userId: string, rideId?: string, details?: string | null) {
    // 1. Record SOS SafetyEvent
    const event = await prisma.safetyEvent.create({
      data: {
        userId,
        rideId: rideId || null,
        type: SafetyEventType.SOS,
        severity: 'CRITICAL',
        details: details || 'Emergency SOS triggered by passenger from Safety Center.',
        status: 'ACTIVE',
      },
      include: {
        ride: {
          include: {
            driver: { include: { vehicle: true } },
          },
        },
      },
    });

    // 2. Fetch user's trusted contacts
    const contacts = await prisma.trustedContact.findMany({
      where: { userId },
    });

    return {
      event,
      contactsNotifiedCount: contacts.length,
      trustedContacts: contacts,
      guidance: {
        title: 'Emergency SOS Protocol Activated',
        disclaimer: 'Prototype Safety Feature — This student demonstration does not directly contact municipal police or ambulance dispatchers.',
        recommendedActions: [
          'Call Local Police Emergency: Dial 112 (India) or 911 immediately',
          'Notify your emergency contacts listed below',
          'Request driver to stop at the nearest illuminated public place or police checkpoint',
          'Keep your phone screen unlocked with live trip sharing enabled',
        ],
      },
    };
  }

  static async reportUnsafe(userId: string, rideId: string, details?: string | null) {
    const event = await prisma.safetyEvent.create({
      data: {
        userId,
        rideId,
        type: SafetyEventType.USER_UNSAFE,
        severity: 'HIGH',
        details: details || 'Passenger clicked "I Don\'t Feel Safe" during an active ride.',
        status: 'ACTIVE',
      },
    });

    const contacts = await prisma.trustedContact.findMany({
      where: { userId },
    });

    return {
      event,
      trustedContacts: contacts,
      options: [
        { action: 'SHARE_TRIP', label: 'Share Live Trip with Contacts' },
        { action: 'CALL_TRUSTED', label: 'Quick Call Trusted Contact' },
        { action: 'TRIGGER_SOS', label: 'Trigger Emergency SOS' },
        { action: 'REPORT_DRIVER', label: 'Report Driver Behavior' },
      ],
    };
  }

  static async checkRouteDeviation(userId: string, rideId: string, simulatedDeviationMeters = 180) {
    const ride = await prisma.ride.findFirst({
      where: { id: rideId, userId },
      include: { driver: { include: { vehicle: true } } },
    });

    if (!ride) {
      const error: any = new Error('Ride not found or unauthorized.');
      error.statusCode = 404;
      error.code = 'RIDE_NOT_FOUND';
      throw error;
    }

    const isDeviated = simulatedDeviationMeters >= 150;

    let deviationEvent = null;
    if (isDeviated) {
      deviationEvent = await prisma.routeDeviationEvent.create({
        data: {
          rideId,
          expectedRoute: `${ride.pickup} via NH45 Main Arterial to ${ride.destination}`,
          simulatedRoute: `Off-corridor bypass near outer service lane (+${simulatedDeviationMeters}m)`,
          deviationMeters: simulatedDeviationMeters,
          status: 'ALERTED',
        },
      });

      // Also register a SafetyEvent
      await prisma.safetyEvent.create({
        data: {
          userId,
          rideId,
          type: SafetyEventType.ROUTE_DEVIATION,
          severity: 'HIGH',
          details: `Potential Route Deviation Detected: Vehicle moved ${simulatedDeviationMeters}m off the expected corridor.`,
          status: 'ACTIVE',
        },
      });
    }

    return {
      isDeviated,
      deviationMeters: simulatedDeviationMeters,
      thresholdMeters: 150,
      alertMessage: isDeviated
        ? 'Potential Route Deviation Detected — Vehicle has veered off the standard route corridor.'
        : 'Vehicle is within standard route parameters.',
      disclaimer: 'Prototype route-deviation detection with simulated location data.',
      deviationEvent,
      suggestedActions: isDeviated
        ? ['Check Trip Route', 'Open Safety Center', 'Share Trip with Family', 'Contact Driver']
        : [],
    };
  }

  // Trusted Contacts Management
  static async listContacts(userId: string) {
    return prisma.trustedContact.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createContact(
    userId: string,
    data: { name: string; phoneNumber: string; relationship?: ContactRelationship }
  ) {
    return prisma.trustedContact.create({
      data: {
        userId,
        name: data.name.trim(),
        phoneNumber: data.phoneNumber.trim(),
        relationship: data.relationship || ContactRelationship.OTHER,
      },
    });
  }

  static async updateContact(
    userId: string,
    contactId: string,
    data: { name?: string; phoneNumber?: string; relationship?: ContactRelationship }
  ) {
    const existing = await prisma.trustedContact.findFirst({
      where: { id: contactId, userId },
    });

    if (!existing) {
      const error: any = new Error('Trusted contact not found or unauthorized.');
      error.statusCode = 404;
      error.code = 'CONTACT_NOT_FOUND';
      throw error;
    }

    return prisma.trustedContact.update({
      where: { id: contactId },
      data: {
        name: data.name !== undefined ? data.name.trim() : undefined,
        phoneNumber: data.phoneNumber !== undefined ? data.phoneNumber.trim() : undefined,
        relationship: data.relationship !== undefined ? data.relationship : undefined,
      },
    });
  }

  static async deleteContact(userId: string, contactId: string) {
    const existing = await prisma.trustedContact.findFirst({
      where: { id: contactId, userId },
    });

    if (!existing) {
      const error: any = new Error('Trusted contact not found or unauthorized.');
      error.statusCode = 404;
      error.code = 'CONTACT_NOT_FOUND';
      throw error;
    }

    await prisma.trustedContact.delete({
      where: { id: contactId },
    });

    return { id: contactId, deleted: true };
  }

  // Trip Sharing Management
  static async generateTripShare(userId: string, rideId: string) {
    const ride = await prisma.ride.findFirst({
      where: { id: rideId, userId },
    });

    if (!ride) {
      const error: any = new Error('Ride not found or unauthorized.');
      error.statusCode = 404;
      error.code = 'RIDE_NOT_FOUND';
      throw error;
    }

    const shareToken = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    const tripShare = await prisma.tripShare.create({
      data: {
        rideId,
        userId,
        shareToken,
        expiresAt,
      },
    });

    return {
      shareToken: tripShare.shareToken,
      expiresAt: tripShare.expiresAt,
      shareableUrl: `/shared-trip/${tripShare.shareToken}`,
    };
  }

  static async getSharedTrip(shareToken: string) {
    const tripShare = await prisma.tripShare.findUnique({
      where: { shareToken },
      include: {
        ride: {
          select: {
            id: true,
            pickup: true,
            destination: true,
            landmark: true,
            rideType: true,
            status: true,
            durationMin: true,
            distanceKm: true,
            startedAt: true,
            completedAt: true,
            createdAt: true,
            driver: {
              select: {
                name: true,
                rating: true,
                photoUrl: true,
                vehicle: {
                  select: {
                    model: true,
                    vehicleNumber: true,
                    color: true,
                    type: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!tripShare || new Date() > tripShare.expiresAt) {
      const error: any = new Error('Shared trip link is invalid or has expired.');
      error.statusCode = 404;
      error.code = 'SHARED_LINK_EXPIRED';
      throw error;
    }

    return {
      ride: tripShare.ride,
      validUntil: tripShare.expiresAt,
    };
  }
}
