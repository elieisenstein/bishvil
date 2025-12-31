// supabase/functions/send-notification/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const EXPO_ACCESS_TOKEN = Deno.env.get('EXPO_ACCESS_TOKEN')

interface NotificationRequest {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  type: 'ride_update' | 'request' | 'approval' | 'rejection' | 'new_ride';
}

Deno.serve(async (req) => {
  try {
    // Parse request
    const { userId, title, body, data, type }: NotificationRequest = await req.json()

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user's push token and preferences
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('expo_push_token, notification_preferences')
      .eq('id', userId)
      .single()

    if (profileError || !profile?.expo_push_token) {
      return new Response(
        JSON.stringify({ error: 'No push token found for user' }),
        { status: 404 }
      )
    }

    // Check if user has this notification type enabled
    const prefs = profile.notification_preferences || {}
    const typeKey = type === 'ride_update' ? 'ride_updates' 
                  : type === 'request' || type === 'approval' || type === 'rejection' ? 'requests_approvals'
                  : type === 'new_ride' ? 'new_rides'
                  : 'ride_updates'

    if (prefs[typeKey] === false) {
      return new Response(
        JSON.stringify({ message: 'User has disabled this notification type' }),
        { status: 200 }
      )
    }

    // Get channel based on type
    const channelId = type === 'ride_update' ? 'ride_updates'
                    : type === 'request' || type === 'approval' || type === 'rejection' ? 'requests_approvals'
                    : type === 'new_ride' ? 'new_rides'
                    : 'default'

    // Send push notification via Expo
    const message = {
      to: profile.expo_push_token,
      sound: 'default',
      title,
      body,
      data: data || {},
      channelId, // Android channel
    }

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${EXPO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(message),
    })

    const result = await response.json()

    // Save notification to database
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        body,
        data,
        read: false,
      })

    return new Response(
      JSON.stringify({ success: true, result }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    )
  }
})