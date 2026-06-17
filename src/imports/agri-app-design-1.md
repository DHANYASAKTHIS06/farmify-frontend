Design a fully functional, production-ready mobile app UI/UX for an agriculture marketplace platform called “AGRI” that connects organic farmers and customers.

⚠️ Important:
All features must be logically connected with proper user flows, validation states, backend logic indicators, empty states, error states, and success confirmations. Avoid placeholder-only designs. Show real interaction logic.

🎯 Core Objective

Create a complete working UX system where:

Farmers can register and upload products correctly

Customers can search, book, call, and order

Government certificate verification works logically

AI assistant provides real usable outputs

Expiry system automatically hides products

Notifications trigger properly

Ratings & reports function correctly

🎨 Design Style

Clean, minimal, modern

Agriculture-inspired (greens, earth tones)

Rounded cards, soft shadows

Clear hierarchy

Large readable typography

Accessibility friendly

Multi-language support (Tamil / English / Hindi toggle)

👤 USER FLOWS (Must Be Complete & Functional)
1️⃣ Onboarding & Language Selection

Splash screen

Select language (Tamil / English / Hindi)

Save selection to user settings

Continue as:

Farmer

Customer

Show:

Loading states

Language switch working across all screens

2️⃣ Farmer Registration (Fully Validated)

Fields:

Farmer Name (required validation)

Phone Number (OTP verification flow)

Location (Map picker with GPS permission)

Address (required)

Voice input button (converts speech to text)

Show:

Error states (invalid number, empty fields)

OTP success state

Registration success confirmation

3️⃣ Government Certificate Verification System

Farmer uploads:

Certificate photo

Certificate ID number

System shows:

“Verification in Progress”

“Verified” badge (green)

“Rejected” with reason

Include:

Fake certificate detection status indicator

Admin review placeholder state

Badge appears on farm profile only after approval

4️⃣ Product Upload System (Fully Functional Logic)

Fields:

Product photo (required)

Product name

Quantity

Organic toggle (Yes/No)

Breed (optional)

Expiry date (required)

System Logic:

Products auto-hide after expiry date

24-hour expiry reminder notification

Expired products move to “Inactive” tab

Farmer can renew product

Show:

Success message

Edit product option

Delete confirmation modal

5️⃣ Customer Home Screen (Connected Features)

Sections:

Nearby Organic Farms (Map + List toggle)

Search by Fruit / Vegetable

AI Recommendations (based on search history)

Delivery items (Egg, Milk, etc.)

Pick Your Own Farm option

Visit Booking

Call Farmer

Navigation button

Include:

Empty states

Loading states

No results found state

6️⃣ Farm Profile Screen

Display:

Farm images

Verified badge

Certificate status

Available products

Ratings (average score)

Reviews list

Report Farm button

Call button

Book Visit button

Navigate to farm

Show:

Booking confirmation flow

Report confirmation message

Rating submission success state

7️⃣ AI Assistant (Working Logic UI)

Chat interface with:

Mic button

Text input

Functional examples:

Farmer types problem → AI shows matching government schemes

School enters requirement → AI matches farmers with stock

User asks about organic certification → AI explains

Show:

Thinking/loading animation

Structured result cards

Action buttons (Apply / Contact / Learn More)

8️⃣ Ratings & Reporting System

Customer can:

Rate farm (1–5 stars)

Write review

Submit report

System shows:

Thank you message

Report status (Under Review)

Blocked content if necessary

9️⃣ Notification System

Include:

Product expiry reminder

Booking confirmation

AI suggestion alerts

Certificate approval status

New nearby farm alert

Show:

Notification list screen

Read/Unread state

Clear all option

🔟 Profile & History

Show:

Orders history

Visit history

AI chat history

Saved farms

Language change option

Logout

Include:

Data persistence logic

Empty history state

⚙️ Functional States Required Everywhere

Design must include:

Loading states

Error states

Empty states

Success confirmations

Permission requests

Network error state

Disabled buttons when form incomplete

📱 Deliverables

Create:

Complete clickable prototype

Clear navigation flow

Consistent component system

Reusable buttons, cards, badges

Design system with color, typography, spacing

🚀 Goal

This should look like a real, deployable app ready for development handoff — not just a concept UI.