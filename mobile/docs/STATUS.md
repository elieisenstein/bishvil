# Chavrutrail – Project Status

**Last Updated:** December 27, 2024

---

## Environment
- **OS:** Windows
- **Dev Tool:** VS Code
- **Mobile:** Local Android builds (30 sec) + Production APK builds via EAS
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **Auth:** Twilio Phone OTP (verified numbers for testing)

---

## Current Status: M1 Complete & Production Ready! 🎉

### Phase: M1 – Core MVP ✅

**Completion:** 100%

All core functionality implemented, tested, and production-ready. App successfully deployed and tested on physical Android device with real Twilio OTP.

---

## M1 Completed Features

### ✅ Authentication & User Management
- Phone OTP via Twilio (verified numbers for unlimited testing)
- Supabase Auth integration with AsyncStorage session persistence
- Profile auto-creation on signup
- **Session persists across app restarts** (no re-login required)
- DEV auth bypass for testing (email/password via .env)
- Multi-user testing validated (Eli, Alice, Bob)

### ✅ Core Ride Management
**Create Ride Wizard:**
- **When:** Native DateTime picker (blocks past dates/times, Israel timezone-aware, auto-resets to current time)
- **Where:** Text-based meeting point + optional route description (no map/GPS complexity)
- **Details:** Ride type, skill level, pace, distance, elevation
- **Group:** Express (instant join) vs Approval (owner approves), max participants (1-6)
- **Review:** Complete summary before publishing

**Ride Features:**
- Published rides appear in Feed
- Ride Details screen with full info
- Participants list with owner badges
- Real-time participant counts
- Owner cancel functionality (removes ride from feed)
- Leave ride (participants only)

### ✅ Join & Approval System
**Express Mode:**
- One-tap instant join
- Real-time participant updates

**Approval Mode:**
- "Ask to join" button for participants
- Pending requests section (owner only)
- Approve/reject buttons with loading states
- Approved users move to participants list
- Rejected users removed (can re-request)

**Leave/Cancel:**
- Non-owners can leave rides anytime
- Owners must cancel entire ride (prevents orphaned rides)
- Cancelled rides automatically hidden from feed

### ✅ Feed & Filtering
**Feed Display:**
- Lists upcoming published rides
- Shows: type, skill, when, where, **route description** (if provided), group size
- Tap card → Ride Details
- Empty state: bike icon + "Adjust Filters" button

**Smart Filters:**
- Ride types (XC, Trail, Enduro, Gravel) - multi-select
- Skill level (Beginner, Intermediate, Advanced) - single-select
- Time range (Today, 3 days, 7 days, 2 weeks, 30 days) - single-select
- Filter summary bar: "Filters: Trail • Intermediate • 7 days [Edit]"
- Bottom sheet modal with checkboxes
- One-tap reset to defaults
- Feed auto-updates on Apply

### ✅ User Profiles
**Profile Fields:**
- Display name (required)
- Ride types (multi-select chips: XC, Trail, Enduro, Gravel)
- Skill level (single-select: Beginner, Intermediate, Advanced)
- Pace preference (Slow, Moderate, Fast)
- Birth year (optional)
- Gender (Male, Female, Skip - optional)

**Profile Features:**
- Robust null-safe loading
- Upsert pattern (creates profile if missing)
- Settings access (theme, language)
- Sign out button

### ✅ Internationalization (i18n)
- **Hebrew and English** full support
- **RTL (right-to-left)** for Hebrew with proper text alignment
- **LTR (left-to-right)** for English
- **Device language detection** on first install
- Language switcher in Settings
- **Bilingual restart alert** when switching languages
- **Language preference persists** via AsyncStorage
- **Navigation tabs maintain consistent positions** (Feed left, Create middle, Profile right)
- **Manual app restart required** for RTL changes (standard mobile app behavior)

### ✅ UI Polish
**Navigation:**
- Bottom tabs with Material Design icons: 🚴 Feed, ➕ Create, 👤 Profile
- Orange active tab (#ff6b35), gray inactive (#999)
- **Tab order consistent regardless of language** (Feed always left)

**Theme System:**
- Light, Dark, System modes
- Orange primary color throughout
- Consistent button and chip styling

**Empty States:**
- Feed: Centered card with bike icon, message, and "Adjust Filters" button
- Ride participants: "Waiting for others..." (owner) / "Be the first!" (non-owner)

**Error Prevention:**
- Date picker blocks past dates
- Time validation with user-friendly alerts
- Required field validation at each wizard step
- Loading states on all async buttons
- Disabled states for invalid actions

### ✅ Development Setup
**Local Android Builds:**
- Android Studio + SDK configured
- Gradle memory optimized (4GB heap, 512MB metaspace)
- **Build time: ~30 seconds** (after first build)
- Auto-install to connected device via USB
- No EAS wait time for iteration

**Production Builds:**
- EAS build configuration for distribution
- APK sharing via download link or file transfer
- Signed releases for Play Store readiness

---

## Technical Architecture

### Database (Supabase)
**Tables:**
- `profiles` (id, display_name, ride_type, skill, pace, birth_year, gender)
- `rides` (id, owner_id, status, start_at, start_lat, start_lng, start_name, ride_type, skill_level, pace, distance_km, elevation_m, join_mode, max_participants, notes)
- `ride_participants` (ride_id, user_id, role, status)

**RLS Policies:**
- Profiles: Users read all, update only own
- Rides: Users read published rides, create/update/cancel own
- Participants: View participants of published rides, join/leave rides

**Key Design Decisions:**
- **Dummy coordinates (0,0)** stored for rides (text description provides location info)
- **UTC timestamps** in database, **Israel timezone** for display
- **Upsert pattern** for profile saves (handles edge cases across environments)

### React Native App Structure
```
mobile/
├── src/
│   ├── app/
│   │   ├── navigation/   (AuthGate, AppNavigator)
│   │   └── state/        (AppSettingsContext - theme only)
│   ├── screens/
│   │   ├── FeedScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── RideDetailsScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── createRide/   (wizard with 5 steps)
│   ├── lib/
│   │   ├── supabase.ts   (AsyncStorage session persistence)
│   │   ├── rides.ts      (CRUD + filters)
│   │   ├── profile.ts    (CRUD with upsert)
│   │   └── datetime.ts   (Israel timezone handling)
│   └── i18n/
│       ├── index.ts      (language + RTL management)
│       ├── en.json       (English translations)
│       └── he.json       (Hebrew translations)
```

---

## Production Readiness

### ✅ Tested & Working
- **Multi-user flows:** 3 test users, all ride modes, all scenarios
- **Real device testing:** Physical Android phone with production APK
- **Authentication:** Real Twilio phone OTP working
- **Session persistence:** Stay logged in after app restart
- **Language switching:** Hebrew ↔ English with proper RTL/LTR
- **Local builds:** Fast iteration cycle (30 sec builds)
- **Timezone handling:** Israel local time display, UTC storage

### ✅ Critical Bugs Fixed
- AsyncStorage configured for Supabase session persistence
- Timezone display corrected (Israel time, not UTC)
- Past ride creation blocked with validation
- RTL tab bar direction fixed (`direction: 'ltr'`)
- Language preference persistence via AsyncStorage
- Profile upsert handles missing rows gracefully
- Create wizard auto-resets on tab navigation

---

## Known Limitations & Deferred Features

### Post-MVP:
**Location Features:**
- No GPS/map picker (intentional - text is simpler and works)
- No distance-based filtering
- No location permissions needed

**User Experience:**
- No cooldown for rejected join requests
- No push notifications (M2 feature)
- Settings nested in Profile (works fine for MVP)

**Content:**
- Some screens need complete Hebrew translations
- Error messages could be more user-friendly

---

## Development Workflow

### Local Development & Building
```bash
# Start Expo dev server
cd mobile
npx expo start -c

# Build APK locally (30 seconds!)
npx expo run:android --variant release

# Build for distribution (15-20 minutes)
eas build --platform android --profile preview
```

### Testing Users (DEV Mode)
```env
# In mobile/.env
EXPO_PUBLIC_DEV_AUTH_BYPASS=true
EXPO_PUBLIC_DEV_USER=1  # Switch between 1/2/3 (Eli/Alice/Bob)
```

### Database Access
- **Dashboard:** https://supabase.com/dashboard
- **SQL Editor:** Schema changes, RLS policies
- **Auth Users:** User management, sessions
- **Table Editor:** Manual data inspection

---

## Distribution & Deployment

### Sharing APK with Testers
1. **Build APK** (local or EAS)
2. **Share via:**
   - WhatsApp (send APK file directly)
   - Google Drive (upload and share link)
   - Email (may be blocked by some providers)
   - Direct Expo build link

### Installing APK
1. Download APK on Android device
2. Enable "Install unknown apps" from source
3. Tap APK file → Install
4. Open app → Complete phone OTP
5. Ready to use!

---

## M2 Planning: Social & Safety Features

### M2 Goals (Next Phase)
**Timeline:** 2-3 weeks  
**Focus:** Make app safe and engaging for public use

### M2.1: In-App Chat ⭐ (Critical)
- Per-ride chat rooms
- Real-time messaging (Supabase Realtime)
- Owner announcements
- Chat archive after ride ends

### M2.2: Push Notifications ⭐
- Join request notifications
- Ride cancelled alerts
- Chat message notifications
- "Ride starts in 1 hour" reminders

### M2.3: Advanced Filters
- Location/distance filtering
- Profile-based smart defaults
- Saved filter presets
- "My rides" filter

### M2.4: Report & Block
- Report rides/users
- Block functionality
- Admin review dashboard

### M2.5: Ride Lifecycle
- Ride status: draft → published → in-progress → completed
- Ride ratings
- Ride history

---

## M3+ Future Vision

### Social
- User profiles with stats
- Follow/friend system
- Activity feed
- Ride photos

### Discovery
- Ride recommendations
- Recurring rides
- Popular routes

### Safety
- Verified riders
- Live location sharing
- SOS button

### Integrations
- Strava/Komoot sync
- Weather alerts
- Trail conditions

---

## Key Files Reference

**Critical Config:**
- `mobile/.env` - Supabase credentials, dev bypass settings
- `mobile/app.json` - Expo configuration
- `mobile/android/gradle.properties` - Build memory settings

**Core Functionality:**
- `src/lib/supabase.ts` - Client with AsyncStorage persistence
- `src/lib/rides.ts` - Ride CRUD + filtering logic
- `src/i18n/index.ts` - Language + RTL management
- `App.tsx` - i18n initialization with device locale detection

**Key Screens:**
- `src/screens/FeedScreen.tsx` - Feed with filters
- `src/screens/createRide/CreateRideWizard.tsx` - 5-step wizard
- `src/screens/RideDetailsScreen.tsx` - Join/approve/cancel
- `src/screens/SettingsScreen.tsx` - Language/theme switching

---

## Success Metrics (Pilot Goals)

**Week 1-2:**
- [ ] 5-10 testers actively using app
- [ ] 10+ rides created
- [ ] 20+ successful joins
- [ ] Zero critical bugs
- [ ] Average 2+ participants per ride

**Week 3-4:**
- [ ] User feedback survey
- [ ] Iterate on top pain points
- [ ] Add 2-3 most-requested features
- [ ] Prepare M2 rollout

**Success Indicators:**
- Users create rides independently
- Users find and join rides successfully
- Repeat usage (multiple rides per user)
- Positive feedback on core UX
- No major complaints about language switching

---

## Build Commands Quick Reference

```bash
# Local development
npx expo start -c

# Local build (fast - 30 seconds)
npx expo run:android --variant release

# Production build (slow - 15 mins, for distribution)
eas build --platform android --profile preview

# Check connected device
adb devices

# Uninstall app
adb uninstall com.elieisenstein.chavrutrail

# Install APK manually
adb install path/to/app.apk

# View logs
adb logcat | grep -i chavrutrail
```

---

## Contact & Resources

**Developer:** Eli Eisenstein  
**Project:** Chavrutrail MVP  
**Supabase:** chavrutrail project  
**Twilio:** Trial account (verified numbers for testing)

---

## Session Notes (Dec 27, 2024)

**Major Accomplishments:**
- ✅ Removed map/GPS complexity (text-based locations work great)
- ✅ Fixed timezone display (Israel local time working)
- ✅ Set up local Android builds (30-second iteration)
- ✅ Fixed session persistence (AsyncStorage for Supabase)
- ✅ Implemented language switching with RTL support
- ✅ Solved RTL tab bar issue (`direction: 'ltr'` - critical fix!)
- ✅ Device language detection on first install
- ✅ Bilingual restart alerts
- ✅ Complete M1 feature set validated

**Technical Wins:**
- Increased Gradle memory to handle expo-updates
- Proper i18n initialization with async/await
- Language persistence via AsyncStorage (separate from AppSettingsContext)
- Tab bar direction fix after extensive debugging

**Known Minor Issue:**
- None! Everything working as expected.

---

**Status:** 🚀 **PRODUCTION READY FOR PILOT TESTING!**  
**Next Steps:** 
1. Share APK with 5-10 testers
2. Gather feedback
3. Plan M2 based on user needs
4. Consider web build for desktop access/demos

Recommendation: Add M2.1 + M2.2 Before Pilot
Phase 1.5: Make It Actually Useful (1-2 weeks)
Must-Have Features:
1. In-App Chat ⭐⭐⭐ (Critical)
Effort: ~3-4 days
Why: Without this, the app is just a worse version of "WhatsApp group + shared calendar"
Minimum implementation:

Per-ride chat (only joined participants)
Simple text messages
Real-time via Supabase Realtime
No need for: read receipts, typing indicators, media, emojis, reactions
Just basic "send message, see messages" functionality

2. Push Notifications ⭐⭐⭐ (Critical)
Effort: ~2-3 days
Why: App is unusable without knowing when things happen
Minimum notifications:

For ride owner:

"Alice joined your ride" (express mode)
"Bob requested to join your ride" (approval mode)
"New message in your ride"


For participants:

"Your join request was approved/rejected"
"Ride cancelled by owner"
"New message in ride you joined"

Last Plan M2:

M2 Implementation Plan
M2.1: Core Polish Features
Task 2.1.1: Add Ride Duration/End Time

Add duration field to ride creation form
Calculate and display end time based on start time + duration
Update ride card to show duration
Update ride details to show both duration and end time
Database: Add duration_minutes field to rides table

Task 2.1.2: Add Road Biking Discipline

Add "Road" to discipline enum in database
Update discipline picker in ride creation
Update discipline filter in ride search
Update user profile discipline preferences
Add Road biking icon/styling

Task 2.1.3: Enable Multi-Day Rides

Replace single date picker with date range picker
Add start_date and end_date fields to rides table (replace single date)
Update ride card to show date range for multi-day rides
Update filtering logic to handle date ranges
Validation: end_date must be >= start_date

Task 2.1.4: Add Profile Description

Add bio or description field to profiles table (text, 500 chars max)
Add text input to profile creation/edit
Display description on profile view
Add character counter to input

Task 2.1.5: Default 10km Radius Filter

Get user's current location on ride search screen
Add user_latitude and user_longitude to profiles table
Calculate distance between user location and ride location
Apply 10km default filter (with option to expand/disable)
Show distance in ride cards

Task 2.1.6: Auto-Filter by User Profile Preferences

When user opens ride search, pre-filter by their discipline preferences
Add toggle to "Show all disciplines"
Store user discipline preferences in profile
Apply filter by default but allow override

M2.2: In-App Chat
Task 2.2.1: Chat Database Schema

Create conversations table (id, participant1_id, participant2_id, created_at, last_message_at)
Create messages table (id, conversation_id, sender_id, content, created_at, read_at)
Add RLS policies for both tables
Add indexes for performance

Task 2.2.2: Conversation List Screen

Create inbox/conversations list screen
Show conversation partners with avatar and name
Show last message preview and timestamp
Show unread count badge
Real-time subscription to new messages
Pull to refresh

Task 2.2.3: Chat Screen

Create chat screen with message bubbles
Send message functionality
Real-time message updates (Supabase realtime)
Message timestamps
Sender/receiver bubble styling
Keyboard handling and auto-scroll
"Mark as read" functionality

Task 2.2.4: Chat Entry Points

Add "Message" button on ride details (when viewing someone else's ride)
Add "Message" button on user profiles
Create or navigate to existing conversation
Add chat icon in main navigation

M2.3: Push Notifications
Task 2.3.1: Expo Notifications Setup

Install expo-notifications
Configure push notification credentials (APNs & FCM)
Request notification permissions on app start
Store push tokens in profiles table
Handle notification token refresh

Task 2.3.2: Supabase Edge Functions for Notifications

Create Edge Function for sending push notifications
Trigger on new message (database trigger)
Trigger on ride join request
Trigger on ride request accepted/declined
Send notification via Expo Push API

Task 2.3.3: Notification Handling

Handle notification received (foreground)
Handle notification tapped (background/killed)
Navigate to appropriate screen (chat, ride details)
Update badge count
Show in-app notification banners

Task 2.3.4: Notification Preferences

Add notification settings screen
Toggle for message notifications
Toggle for ride notifications
Toggle for system notifications
Save preferences to profile


Suggested Order of Implementation

M2.1 first (Polish features) - Makes app feel complete, ~1 week
M2.2 then (Chat) - Core functionality, ~1 week
M2.3 last (Notifications) - Enhances chat experience, ~3-5 days

