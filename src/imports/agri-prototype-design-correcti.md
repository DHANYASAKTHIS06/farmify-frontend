Design corrections for AGRI agriculture marketplace prototype.
All interactions must simulate real backend logic using component variants and prototype connections.

No dead buttons. No static screens.

1️⃣ FIX: RENEW PRODUCT FLOW (Farmer Side)

Current issue: Renew button does nothing.

Required Functional Flow:

When farmer clicks “Renew Product”:

Step 1 → Open Bottom Sheet

Show current product details

Editable Expiry Date field

Auto-calculate new expiry

Show renewal fee (if applicable)

Confirm button (disabled until date selected)

Step 2 → On Confirm Click:
Show loading state:

Button changes to spinner

“Processing renewal…”

Step 3 → Success State:

Toast: “Product renewed successfully”

Expiry badge updates

Product moves from Inactive → Active tab

Red expired badge removed

Warning badge removed

Step 4 → Notification Trigger:
Add notification:
“Your product Tomatoes has been renewed”

Edge Cases:

• If network fails → Show Retry
• If expiry date selected is past date → Show validation error
• If payment fails → Show failure modal

Simulate backend state change using component variants:
Active | Expired | Renewed

2️⃣ FIX: SPEAKER ICON (TEXT-TO-SPEECH + VOICE RESPONSE FLOW)

Current issue: Speaker does nothing.

You must create a dual-phase voice system:

PHASE 1: Text-to-Speech (App Reads First)

When user taps Speaker icon:

Show “Preparing audio…” loader

Play animation (Sound wave around speaker icon)

Display subtitle:
“Reading content…”

Simulate reading for 3 seconds using delay interaction.

After reading completes:

Automatically transition to Phase 2.

PHASE 2: Voice Input Mode

UI Changes:

• Speaker icon becomes Mic icon
• Screen shows: “Now you can ask your question”
• Animated pulse around mic
• Stop button visible

User taps mic → Listening state
User stops → “Converting speech to text…”
Show transcribed text in input field
Show AI Thinking animation
Display structured answer cards

Add Error States:

• Microphone permission denied → Show permission modal
• No voice detected → Show “No input detected”
• Network error → Show retry
• Stop speaking early → allow restart

Prototype logic must follow this sequence:

Speaker → Reading → Auto switch → Listening → Processing → AI Response

No skipping steps.

3️⃣ FIX: PICK YOUR OWN FLOW (Customer Side)

Current issue: Button not connected.

Required working flow:

Customer taps “Pick Your Own” →

Step 1:
Show Map with eligible farms (Only farms with Pick Enabled toggle ON)

Step 2:
User taps farm →
Open Bottom Sheet:

Available visiting slots

Farm rules

Price per entry (if applicable)

Step 3:
Click “Book Visit”

Open booking screen:

Select date

Select time slot

Number of visitors

Confirm button (disabled until all filled)

Step 4:
On Confirm →
Loading state →
Success screen:
“Visit booked successfully”

Add:

• Calendar validation (no past dates)
• Fully booked slot → disabled
• Notification trigger:
“Your farm visit is confirmed”

4️⃣ FIX: HOME DELIVERY FLOW (Customer Side)

Current issue: No order logic.

When user taps “Home Delivery”:

Step 1:
Show Delivery Product List
Filter:

In-stock only

Not expired

Delivery enabled farms

Step 2:
Add to Cart button must:

Update cart badge count

Show “Added to cart” toast

Step 3:
Cart Screen:

Show:

Product list

Quantity selector (+/-)

Remove item option

Total price auto-calculated

Disable checkout if cart empty.

Step 4:
Checkout Screen:

Fields:

Delivery address

Phone number

Payment method

Validation required.

Step 5:
Place Order →

Show loading →
Order success screen →
Generate Order ID →
Add to Order History →
Trigger Notification:
“Your order has been placed”

Edge Cases:

• Out of stock → Disable Add to Cart
• Network error → Retry
• Payment failure → Show retry

5️⃣ GLOBAL FIX REQUIREMENTS

For all above features:

✔ Add loading shimmer
✔ Add error states
✔ Add empty states
✔ Add success toast
✔ Add disabled button states
✔ Add proper back navigation
✔ Use Smart Animate
✔ No broken links

🎯 FINAL PROTOTYPE MUST SHOW

✔ Renew product actually updates status
✔ Speaker reads first, then listens, then answers
✔ Pick Your Own fully books visit
✔ Home Delivery completes checkout
✔ Notifications triggered
✔ Data state visually changes