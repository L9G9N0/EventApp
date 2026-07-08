# Page 1

Technical Assignment: Event Registration Mini
App
Overview
Build a small full-stack Event Registration application.
This task is designed to assess your ability to build a working frontend, backend API, MongoDB
integration, basic form flow, filtering logic, and simple analytics-style event tracking.
The assignment should be completed within 72 hours.
Objective
Create a mini application where users can:
View a list of upcoming events.
Search and filter events.
Open an event details view.
Register for an event using a form.
Store registrations in MongoDB.
Track basic user actions in the app.
Tech Stack
Please use:
Frontend
React.js or Next.js
Backend
Node.js
Express.js
Database
MongoDB
You may use JavaScript or TypeScript.
1. 
2. 
3. 
4. 
5. 
6. 
• 
• 
• 
• 
1

# Page 2

Functional Requirements
1. Event Listing Page
Create a page that displays a list of events.
Each event should have:
Event name
Date
Category
Example: Workshop, Seminar , Hackathon, Webinar
Location or mode
Example: Noida, Online, Hybrid
Short description
Available seats
The page should support:
Search by event name
Filter by category
Filter by location/mode
2. Client-Side and Server-Side Filtering
Implement both approaches:
A. Client-Side Filtering
Fetch all events once and filter them on the frontend using React state.
B. Server-Side Filtering
Create an API that supports filters through query parameters.
Example:
GET /api/events?category=Workshop&search=react&mode=Online
In the UI, provide a simple toggle or two buttons:
Client-side filter
API-side filter
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
2

# Page 3

This is important because it tests both frontend state handling and backend query handling.
3. Event Details Page or Modal
When a user clicks an event, show more details.
This can be either:
A separate page, or
A modal
Show:
Event name
Full description
Date
Category
Location/mode
Available seats
Register button
4. Registration Form
Create a registration form for an event.
The form should collect:
Name
Email
Phone number
College/company
Source
Example: LinkedIn, WhatsApp, Instagram, Email, Direct
Validation rules:
Name is required.
Email should be valid.
Phone number should be valid.
The same email should not be able to register twice for the same event.
Registration should not be allowed if seats are full.
After successful registration:
Save the registration in MongoDB.
Reduce available seats or update registration count.
Show a success message.
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
3

# Page 4

5. Backend APIs
Create the following APIs:
GET /api/events
GET /api/events/:id
POST /api/events
POST /api/events/:id/register
GET /api/events/:id/registrations
The backend should include:
MongoDB models
Proper API response structure
Basic validation
Error handling
CORS setup
Environment variable usage
6. Basic Analytics Tracking
Implement a simple analytics tracking utility.
You can either use GA4/GTM or create a mock function like:
trackEvent("event_card_clicked", {
eventId,
eventName,
category
});
Track at least these actions:
event_list_viewed
event_search_performed
event_filter_applied
event_card_clicked
registration_submitted
registration_success
registration_failed
You may log these events in the browser console. Bonus points if you store them in MongoDB.
• 
• 
• 
• 
• 
• 
4

# Page 5

In the README, briefly explain:
Which events you tracked
Where they are triggered
What payload you send
7. Simple Dashboard
Create a basic dashboard section or page showing:
Total events
Total registrations
Registrations per event
Recent registrations
This can be a simple table/card layout. Charts are optional.
8. Seed Data
Add sample data for at least:
8 events
3 categories
10 sample registrations
You may provide either:
A seed script, or
Clear instructions in the README to insert sample data
9. Deployment
Deployment is preferred but not mandatory.
If deployed, share:
Frontend URL
Backend URL
If not deployed, the app should run locally with clear instructions.
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
5

# Page 6

Submission Deliverables
Please submit:
GitHub repository link
README.md with setup instructions
Screenshots or short demo video
Any deployed links, if available
Notes on any errors/issues faced and how you debugged them
Evaluation Criteria
1. Full-Stack Integration — 30%
Frontend communicates correctly with backend
Data is fetched from MongoDB
Registration flow works end-to-end
API errors are handled properly
2. Frontend Quality — 20%
React components are structured cleanly
State is handled correctly
Search/filter UI works properly
Form validation is clear
UI is responsive and understandable
3. Backend Quality — 20%
APIs are well structured
MongoDB schemas are sensible
Server-side filtering works
Duplicate registration and full-seat cases are handled
Code is readable and modular
4. Analytics and Product Thinking — 15%
Important user actions are tracked
Event payloads are meaningful
Candidate explains how tracking can help improve the product
5. Documentation and Debugging — 15%
README is clear
Setup steps work
Known issues are documented
Candidate explains debugging steps if something fails
1. 
2. 
3. 
4. 
5. 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
6

# Page 7

Bonus Points
Bonus points for:
TypeScript
Next.js
Deployment
Debounced search
Basic authentication for dashboard
CSV export of registrations
GA4 or GTM integration
Clean Git commits
Good mobile responsiveness
Use of AI coding assistants with a short note explaining what was AI-assisted
Timeline
You have 72 hours from the time of receiving this assignment.
Please focus on a clean, working implementation rather than adding too many unfinished features.
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
7

