SafeGuard SOS - updated GTU exhibition demo

Files:
- index.html: main SOS dashboard
- script.js: SOS, GPS, contacts and emergency history logic
- style.css: shared responsive styling
- medical-response.html: doctor contacts, patient medical history and SOS pickup point page

Run:
1. Keep all four files in the same folder.
2. Open with a local server (recommended for browser geolocation), e.g. VS Code Live Server.
3. Fill profile/contact details and activate SOS.
4. On the SOS ACTIVE panel, click DOCTOR & AMBULANCE DETAILS.

Important limitations:
- Data is stored in browser localStorage on the same browser/device only.
- Ambulance display uses the SOS pickup coordinates; it does not show a real ambulance's live GPS location. A real dispatch/live-tracking system requires a backend and an authorized ambulance GPS/API integration.
- This is a college project demo, not a replacement for emergency services. Doctor contacts must be verified before use.
