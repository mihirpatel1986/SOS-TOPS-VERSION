SafeGuard SOS - updated GTU exhibition demo

Files:
- index.html: home page, dashboard, contacts and emergency history
- people-safety.html: standalone people safety SOS page
- vehicle-emergency.html: standalone vehicle emergency SOS page
- script.js: SOS, GPS, contacts and emergency history logic
- style.css: shared responsive styling

Run:
1. Keep all project files in the same folder.
2. Open with a local server (recommended for browser geolocation), e.g. VS Code Live Server.
3. Add emergency contacts from the home page.
4. Open the People Safety SOS or Vehicle Emergency SOS page to activate the matching alert.

Important limitations:
- Data is stored in browser localStorage on the same browser/device only.
- SOS alerts prepare messages for the user to send; they do not automatically dispatch emergency services.
- This is a college project demo, not a replacement for emergency services.
