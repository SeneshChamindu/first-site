ZESR MOVIE HUB — STYLED FRONTEND

Files:
- main.html: page structure
- style.css: responsive navy, purple and teal theme
- script.js: phone format check, movie search, movie selection and request call

Backend routes expected:
GET /api/movies/search?q=Avatar
Returns an array, or JSON object with results/movies/data/items array.
POST /api/movies/send
JSON body: { phone, group, movie }

IMPORTANT:
These are frontend files. They do not automatically connect to your WhatsApp bot.
Implement both routes in your existing Node.js/Express server and reuse the already
connected WhatsApp socket/session. Do not create a second WhatsApp session or delete
your existing auth/session files. Serve this folder with express.static(__dirname).
