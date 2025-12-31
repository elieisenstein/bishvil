// src/lib/notificationHelpers.ts
import { supabase } from './supabase';

type NotificationType = 'ride_update' | 'request' | 'approval' | 'rejection' | 'new_ride';

interface SendNotificationParams {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  type: NotificationType;
}

export async function sendPushNotification(params: SendNotificationParams): Promise<void> {
  try {
    const { data, error } = await supabase.functions.invoke('send-notification', {
      body: params,
    });

    if (error) {
      console.error('Failed to send notification:', error);
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

// Helper that gets user's language and sends translated notification
async function sendTranslatedNotification(
  userId: string,
  titleKey: string,
  bodyKey: string,
  titleParams: Record<string, string>,
  bodyParams: Record<string, string>,
  type: NotificationType,
  data?: Record<string, any>
): Promise<void> {
  // Get user's language preference from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('language')
    .eq('user_id', userId)
    .single();

  const userLang = profile?.language || 'he'; // Default to Hebrew
  
  // Import translations dynamically based on language
  const translations = userLang === 'he' 
    ? await import('../../i18n/he.json')
    : await import('../../i18n/en.json');

  // Get translated strings and replace params
  let title = translations.notifications[titleKey]?.title || titleKey;
  let body = translations.notifications[bodyKey]?.body || bodyKey;

  // Replace {{placeholders}}
  Object.entries(titleParams).forEach(([key, value]) => {
    title = title.replace(`{{${key}}}`, value);
  });
  
  Object.entries(bodyParams).forEach(([key, value]) => {
    body = body.replace(`{{${key}}}`, value);
  });

  await sendPushNotification({ userId, title, body, data, type });
}

export async function notifyOwnerOfJoinRequest(
  ownerId: string,
  requesterName: string,
  rideId: string,
  rideTitle: string
): Promise<void> {
  await sendTranslatedNotification(
    ownerId,
    'joinRequest',
    'joinRequest',
    { name: requesterName, ride: rideTitle },
    { name: requesterName, ride: rideTitle },
    'request',
    { rideId }
  );
}

export async function notifyUserOfApproval(
  userId: string,
  rideTitle: string,
  rideId: string
): Promise<void> {
  await sendTranslatedNotification(
    userId,
    'approved',
    'approved',
    { ride: rideTitle },
    { ride: rideTitle },
    'approval',
    { rideId }
  );
}

export async function notifyUserOfRejection(
  userId: string,
  rideTitle: string,
  rideId: string
): Promise<void> {
  await sendTranslatedNotification(
    userId,
    'rejected',
    'rejected',
    { ride: rideTitle },
    { ride: rideTitle },
    'rejection',
    { rideId }
  );
}

export async function notifyParticipantsOfRideUpdate(
  participantIds: string[],
  rideTitle: string,
  rideId: string,
  changeDescription: string
): Promise<void> {
  const promises = participantIds.map(userId =>
    sendTranslatedNotification(
      userId,
      'rideUpdated',
      'rideUpdated',
      { ride: rideTitle },
      { ride: rideTitle, change: changeDescription },
      'ride_update',
      { rideId }
    )
  );

  await Promise.all(promises);
}

export async function notifyParticipantsOfCancellation(
  participantIds: string[],
  rideTitle: string,
  rideId: string
): Promise<void> {
  const promises = participantIds.map(userId =>
    sendTranslatedNotification(
      userId,
      'rideCancelled',
      'rideCancelled',
      { ride: rideTitle },
      { ride: rideTitle },
      'ride_update',
      { rideId }
    )
  );

  await Promise.all(promises);
}