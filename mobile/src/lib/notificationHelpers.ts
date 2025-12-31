// src/lib/notificationHelpers.ts
import { supabase } from './supabase';
import heTranslations from '../i18n/he.json';
import enTranslations from '../i18n/en.json';

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

// Get translations for user's language
function getTranslations(lang: string) {
  const allTranslations = lang === 'he' ? heTranslations : enTranslations;
  return allTranslations.notifications; // Return ONLY the notifications part
}

// Replace placeholders in string
function replacePlaceholders(text: string, params: Record<string, string>): string {
  let result = text;
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`{{${key}}}`, value);
  });
  return result;
}

async function sendTranslatedNotification(
  userId: string,
  notificationKey: string,
  params: Record<string, string>,
  type: NotificationType,
  data?: Record<string, any>
): Promise<void> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('language')
    .eq('id', userId)
    .single();

  const userLang = profile?.language || 'he';
  const translations = getTranslations(userLang);
  
  const title = replacePlaceholders(
  translations[notificationKey]?.title || notificationKey,  // Remove .notifications
  params
);
  
const body = replacePlaceholders(
  translations[notificationKey]?.body || notificationKey,  // Remove .notifications
  params
);

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
      { ride: rideTitle },
      'ride_update',
      { rideId }
    )
  );

  await Promise.all(promises);
}