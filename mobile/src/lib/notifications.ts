// src/lib/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from './supabase';

// Notification types (matching database)
export type NotificationType = 
  | 'ride_update' 
  | 'request' 
  | 'approval' 
  | 'rejection' 
  | 'new_ride';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  } as Notifications.NotificationBehavior),
});

/**
 * Register for push notifications and save token to Supabase
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B35',
    });

    // Create notification channels for different types
    await createNotificationChannels();
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    
    try {
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })).data;
      
      // Save token to Supabase
      await saveTokenToDatabase(token);
    } catch (error) {
      console.log('Error getting push token:', error);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

/**
 * Create Android notification channels
 */
async function createNotificationChannels() {
  if (Platform.OS === 'android') {
    // Critical ride updates
    await Notifications.setNotificationChannelAsync('ride_updates', {
      name: 'Ride Updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B35',
      sound: 'default',
      description: 'Changes to time, location or ride cancellations',
    });

    // Requests and approvals
    await Notifications.setNotificationChannelAsync('requests_approvals', {
      name: 'Requests & Approvals',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4CAF50',
      sound: 'default',
      description: 'Join requests and approvals',
    });

    // Chat messages
    await Notifications.setNotificationChannelAsync('ride_chat', {
      name: 'Ride Chat',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250],
      lightColor: '#2196F3',
      description: 'New messages in ride chat',
    });

    // New rides discovery
    await Notifications.setNotificationChannelAsync('new_rides', {
      name: 'New Rides',
      importance: Notifications.AndroidImportance.LOW,
      vibrationPattern: [0, 250],
      description: 'New rides in your area',
    });
  }
}

/**
 * Save push token to user's profile
 */
async function saveTokenToDatabase(token: string): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) return;

  const { error } = await supabase
    .from('profiles')
    .update({ expo_push_token: token })
    .eq('user_id', userId);

  if (error) {
    console.log('Error saving push token:', error);
  }
}

/**
 * Get notification channel based on type
 */
export function getChannelForType(type: NotificationType): string {
  switch (type) {
    case 'ride_update':
      return 'ride_updates';
    case 'request':
    case 'approval':
    case 'rejection':
      return 'requests_approvals';
    case 'new_ride':
      return 'new_rides';
    default:
      return 'default';
  }
}

/**
 * Schedule a local notification (for testing)
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: any
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: null, // Show immediately
  });
}