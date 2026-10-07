import { prisma } from '../config/db';
import { config } from '../config';

export class AiService {
  static async handleChat(userId: string, userMessage: string, sessionId?: string) {
    // 1. Get or create session
    let session;
    if (sessionId) {
      session = await prisma.chatSession.findFirst({
        where: { id: sessionId, userId },
      });
    }

    if (!session) {
      const title = userMessage.length > 30 ? `${userMessage.substring(0, 30)}...` : userMessage;
      session = await prisma.chatSession.create({
        data: {
          userId,
          title,
        },
      });
    }

    // 2. Save user message
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: 'USER',
        content: userMessage,
      },
    });

    // 3. Generate assistant response
    let assistantReply = '';

    // Check if an external LLM API key is available
    if (config.aiApiKey) {
      try {
        // Attempt external call via fetch
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.aiApiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content:
                  'You are RideSafe AI Assistant. Help passengers with smart cab booking, pickup assistance, vehicle verification, 4-digit Ride PINs, safety features, emergency protocols, and trip project management. Do NOT pretend to be police, medical services, or real emergency dispatchers. Remind users that this is a prototype and they should dial 112 in real danger.',
              },
              { role: 'user', content: userMessage },
            ],
            max_tokens: 400,
          }),
        });

        if (response.ok) {
          const data: any = await response.json();
          assistantReply = data.choices?.[0]?.message?.content || '';
        }
      } catch (err) {
        console.warn('External LLM call skipped or failed, falling back to built-in knowledge base:', err);
      }
    }

    // 4. Built-in contextual knowledge engine fallback
    if (!assistantReply) {
      assistantReply = this.generateKnowledgeResponse(userMessage);
    }

    // 5. Save assistant reply
    const savedReply = await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: 'ASSISTANT',
        content: assistantReply,
      },
    });

    return {
      sessionId: session.id,
      reply: savedReply.content,
      createdAt: savedReply.createdAt,
    };
  }

  static generateKnowledgeResponse(query: string): string {
    const q = query.toLowerCase();

    if (q.includes("can't find") || q.includes('cannot find') || q.includes('pickup') || q.includes('landmark')) {
      return (
        '📍 **Pickup Assistance Tip:**\n\n' +
        'You can use **Visual Pickup Assistance** to upload a quick photo of your exact surroundings and specify a clear landmark (e.g. "Standing by SRM Gate 2 near the ATM"). ' +
        'Your assigned driver will instantly receive both your coordinates and landmark description to locate you seamlessly.'
      );
    }

    if (q.includes('safe') || q.includes('danger') || q.includes('emergency') || q.includes('sos')) {
      return (
        '🛡️ **Passenger Safety Guidance:**\n\n' +
        'If you feel uncomfortable or unsafe at any moment:\n' +
        '1. Tap the prominent **"I Don\'t Feel Safe"** button on your Active Ride screen.\n' +
        '2. Open the **Safety Center** to trigger the prototype **SOS** button or immediately share your live trip with your trusted contacts.\n' +
        '3. **Important Notice:** In a real-world emergency, dial **112** (India) or your local police immediately.'
      );
    }

    if (q.includes('pin') || q.includes('start ride') || q.includes('otp') || q.includes('verify')) {
      return (
        '🔢 **Ride PIN Verification:**\n\n' +
        'Every ride generates a secure 4-digit Ride PIN. When your driver arrives, first verify that their license plate and vehicle model match what is shown on your screen. ' +
        'Then give the 4-digit PIN to the driver. The ride cannot start until this PIN is authenticated!'
      );
    }

    if (q.includes('fare') || q.includes('price') || q.includes('rate') || q.includes('cost') || q.includes('estimate')) {
      return (
        '💳 **Estimated Fare Structure:**\n\n' +
        'RideSafe AI calculates transparent fares using:\n' +
        '• **Base Fare:** ₹80\n' +
        '• **Distance:** ₹15 per km\n' +
        '• **Duration:** ₹2.50 per min\n' +
        '• Vehicle multipliers: Mini (1.0x), Sedan (1.25x), SUV (1.6x).\n' +
        'Note: Fares shown are non-monetary estimates for demonstration purposes.'
      );
    }

    if (q.includes('project') || q.includes('task') || q.includes('plan')) {
      return (
        '📋 **Transportation Project Management:**\n\n' +
        'You can organize trips as Projects (e.g., "Chennai Airport Trip") and track checklist tasks like "Book Cab", "Verify Driver", "Send Pickup Photo", and "Reach Destination". ' +
        'Changes made here synchronize immediately across both Web and Android platforms!'
      );
    }

    if (q.includes('smartmatch') || q.includes('driver') || q.includes('match')) {
      return (
        '⚡ **SmartMatch Driver Intelligence:**\n\n' +
        'SmartMatch ranks nearby available drivers using an algorithmic scoring system:\n' +
        '• Proximity & Distance (30%)\n' +
        '• Estimated Arrival Time (25%)\n' +
        '• Historical Driver Rating (20%)\n' +
        '• Current Availability Status (15%)\n' +
        '• Vehicle Class Match (10%)\n' +
        'This ensures you get the safest, highest-rated driver closest to your pickup point.'
      );
    }

    if (q.includes('route') || q.includes('deviation')) {
      return (
        '🗺️ **Route Deviation Monitor:**\n\n' +
        'RideSafe AI actively monitors your ride progress against the expected arterial route. If simulated GPS data detects a deviation exceeding 150 meters, ' +
        'you will be alerted immediately with options to inspect your route, notify emergency contacts, or trigger the Safety Center.'
      );
    }

    return (
      '👋 Hello! I am your **RideSafe AI Assistant**.\n\n' +
      'I can help you with:\n' +
      '• Booking rides & SmartMatch driver selection\n' +
      '• Visual Pickup Assistance & landmark navigation\n' +
      '• Safety protocols, trusted contacts & SOS\n' +
      '• 4-Digit Ride PIN verification & vehicle checks\n' +
      '• Managing trip projects and checklist tasks\n\n' +
      'How may I assist your journey today?'
    );
  }

  static async getChatHistory(userId: string, sessionId: string) {
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) {
      const error: any = new Error('Chat session not found.');
      error.statusCode = 404;
      error.code = 'SESSION_NOT_FOUND';
      throw error;
    }

    return session;
  }
}
