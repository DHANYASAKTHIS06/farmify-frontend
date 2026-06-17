Design and correct the AGRI agriculture marketplace mobile app prototype to make the following systems fully interactive and logically connected. This must behave like a real production-ready app — not static screens.

⚠️ All buttons must have working prototype connections and proper state transitions.

1️⃣ VOICE ASSISTANT FIX (Fully Functional Flow)

The mic button currently does nothing. Fix it with real interaction states:

Create these states:

• Mic Idle
• Listening (animated pulse around mic)
• Converting Speech to Text (loading dots animation)
• Transcribed Text appears in input field
• AI Thinking animation
• Structured AI Response Cards
• Error state (Microphone permission denied)

Add:

• Permission request modal
• Retry button
• Stop listening button
• Auto-send after transcription

Ensure:

Mic toggles ON/OFF

If network fails → show “Network error – Try again”

If silence detected → show “No voice detected”

Prototype connections must show real flow transitions.

2️⃣ LANGUAGE SWITCH FIX (Tamil / English / Hindi)

Language toggle must update entire UI dynamically.

Fix logic:

• Store selected language in global variable
• All text components must use language variants
• Switching language updates ALL screens automatically
• Show 1-second loading shimmer when switching

Add:

• Dropdown language selector in profile
• Confirmation toast: “Language updated successfully”
• If network error during change → revert to previous language

Ensure prototype uses:
Component variants for multilingual text

3️⃣ MAP VIEW FIX (Nearby Farms)

Map toggle currently static. Make it interactive.

Add:

• List View / Map View toggle switch
• Real clickable farm pins
• On tap → Bottom sheet opens with farm preview
• “View Profile” button connects to farm profile

Include states:

• Location permission request
• GPS Loading state
• No farms nearby state
• Map error state
• Offline state

Add:

• Navigation button opens direction confirmation modal
• Distance auto-calculated label

4️⃣ PRODUCT EXPIRY LOGIC (Auto-hide System)

Fix product cards to simulate backend logic:

• If expiry date < today → auto move to Inactive tab
• Show “Expired” red badge
• 24-hour prior → show warning badge
• Send expiry reminder notification

Add:

• Renew Product button
• Renew success confirmation
• Delete confirmation modal

Use component variants to simulate active/inactive states.

5️⃣ FORM VALIDATION (Farmer Registration)

Add real validation states:

• Empty required fields → show red error text
• Invalid phone → show format error
• OTP flow screens
• OTP incorrect → show retry option
• OTP success → green confirmation

Disable submit button until valid.

6️⃣ CERTIFICATE VERIFICATION LOGIC

Add proper status states:

• Uploading state
• Verification in progress
• Verified badge (green)
• Rejected with reason
• Fake detection indicator

Verified badge must appear only after approval state screen.

7️⃣ NOTIFICATION SYSTEM FIX

Create:

• Notification list screen
• Read/Unread state
• Clear all option
• Tap notification → navigate to correct screen

Include:

• Booking confirmation notification
• Expiry reminder
• Certificate approved
• AI suggestion alert

Add empty state and loading state.

8️⃣ ERROR & NETWORK STATES (Global)

Every major screen must include:

• Loading shimmer
• Network failure screen
• Retry button
• Empty state
• Success toast message

9️⃣ PROTOTYPE REQUIREMENTS

• All primary buttons must have click interaction
• Back navigation must work
• Bottom sheets must slide
• Modals must close
• No dead buttons
• No static placeholder screens

Use Smart Animate for transitions.

🎨 Maintain Design System

Keep:

• Agriculture green theme
• Rounded 16px cards
• Soft shadows
• Clear hierarchy
• Accessible font sizes
• 48px minimum tap targets

FINAL GOAL

The prototype must simulate a real working app:

✔ Voice assistant works
✔ Language switch updates entire app
✔ Map interaction works
✔ Expiry logic simulated
✔ Forms validated
✔ Notifications connected
✔ No broken navigation

Deliver a clickable, developer-ready prototype.