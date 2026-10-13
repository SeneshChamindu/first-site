ZESR MOVIE HUB — Separate WhatsApp Bot + Admin Panel

SETUP:
1) Node.js 20+ install කරන්න.
2) Terminal: npm install
3) .env.example -> .env ලෙස copy කරන්න.
4) .env එකේ SESSION_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD වෙනස් කරන්න.
5) CINESUBZ_SEARCH_URL එකට භාවිතා කරන අවසර ලත් API endpoint එක දාන්න. API response format වෙනස් නම් server.js හි /api/movies/search adapter එක edit කරන්න.
6) npm start; http://localhost:3000 open කරන්න.
7) Admin login කර new WhatsApp number එක country code සමඟ දී pairing code ගන්න. New number එකේ WhatsApp > Linked devices > Link with phone number තුළ code එක දාන්න. QR පෙන්වුවහොත් scan කරන්න.
8) Bot එක WhatsApp group එකට add කරන්න. Admin request queue එකෙන් group එක තෝරා Send video file කරන්න.

SAFETY:
- මෙය separate project එකක්; auth_info_zesr_bot/ යන අලුත් folder එකක් පමණක් භාවිතා කරයි. Existing bot session files මකන්න/overwrite කරන්න එපා.
- QR/pairing code secret එකක්. Adminට පමණක් ලබා දෙන්න.
- Cinesubz API endpoint එක මෙහි තහවුරු කර නැහැ; configure කළ යුතුයි.
- Actual video යැවීමට direct downloadable video URL එකක් අවශ්‍යයි. Webpage URL එකක් video file එකක් නොවේ. MAX_VIDEO_MB default 60.
- Hosting filesystem ephemeral නම් auth_info_zesr_bot/ සහ data/ persistent disk/database එකකට තබන්න; bot replicas කිහිපයක් එකවර run නොකරන්න.
- අවසර ඇති video files පමණක් බෙදාහරින්න. Production සඳහා HTTPS, strong secrets, persistent storage සහ rate limiting අවශ්‍යයි.
