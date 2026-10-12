/* ZESR MOVIE HUB frontend.
 * API host and route names match the existing bot configuration.
 * Calls go through same-origin backend proxy routes so the API key stays private.
 * Required backend routes: /api/cinesubz/search, /api/groups, /api/cinesubz/send
 */
const API = {
  search: "/api/cinesubz/search",
  groups: "/api/groups",
  send: "/api/cinesubz/send"
};
const $ = (id) => document.getElementById(id);
const form = $("searchForm"), input = $("searchInput"), searchBtn = $("searchBtn");
const resultsEl = $("results"), statusEl = $("status"), countEl = $("count");
const groupsEl = $("groupSelect"), sendBtn = $("sendBtn"), chosenEl = $("chosen");
let movies = [], selected = null, sending = false;
function status(message, error = false) { statusEl.textContent = message; statusEl.classList.toggle("error", error); }
async function request(url, options = {}) {
  const res = await fetch(url, { ...options, headers: { Accept: "application/json", ...(options.body ? {"Content-Type":"application/json"} : {}), ...options.headers } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false || data.status === false) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}
function listFrom(data) {
  if (Array.isArray(data)) return data;
  const candidates = [data?.data?.results, data?.data?.movies, data?.results, data?.movies, data?.data];
  return candidates.find(Array.isArray) || [];
}
function normalize(item) {
  return { title: item.title || item.name || item.movie_name || "Untitled", link: item.link || item.url || item.movie_url || "", poster: item.poster || item.image || item.thumbnail || item.image_url || "", year: item.year || item.release_year || "", description: item.description || item.quality || "Cinesubz result" };
}
function render() {
  resultsEl.replaceChildren();
  countEl.textContent = `${movies.length} result${movies.length === 1 ? "" : "s"}`;
  if (!movies.length) { status("No matching titles found. Try another search."); return; }
  status("Choose a title below, then select a WhatsApp group.");
  movies.forEach((movie) => {
    const card = document.createElement("article"); card.className = "card";
    if (selected?.link && selected.link === movie.link) card.classList.add("selected");
    let poster;
    if (movie.poster) {
      poster = document.createElement("img"); poster.className = "poster"; poster.alt = `${movie.title} poster`; poster.loading = "lazy"; poster.src = movie.poster; poster.referrerPolicy = "no-referrer";
      poster.onerror = () => { const fallback = document.createElement("div"); fallback.className = "poster"; fallback.textContent = "▶"; poster.replaceWith(fallback); };
    } else { poster = document.createElement("div"); poster.className = "poster"; poster.textContent = "▶"; }
    const info = document.createElement("div"); info.className = "info";
    const title = document.createElement("h3"); title.textContent = movie.title;
    const desc = document.createElement("p"); desc.textContent = [movie.year, movie.description].filter(Boolean).join(" • ");
    const pick = document.createElement("button"); pick.className = "pick"; pick.type = "button"; pick.textContent = selected?.link === movie.link ? "Selected ✓" : "Select movie";
    pick.addEventListener("click", () => {
      if (!movie.link) { status("This API result does not include a movie page URL.", true); return; }
      selected = movie; chosenEl.textContent = movie.title; sendBtn.disabled = !groupsEl.value || sending; render(); status(`Selected: ${movie.title}`);
    });
    info.append(title, desc, pick); card.append(poster, info); resultsEl.append(card);
  });
}
form.addEventListener("submit", async (event) => {
  event.preventDefault(); const query = input.value.trim(); if (!query) return;
  searchBtn.disabled = true; searchBtn.textContent = "Searching…"; selected = null; chosenEl.textContent = "Choose a movie from the results first."; sendBtn.disabled = true; resultsEl.replaceChildren(); countEl.textContent = "Searching…"; status("Searching the configured Cinesubz API…");
  try {
    // Backend proxy should call: https://zara.laksidu.site/cinesubz/search?query=...&api_key=...
    const data = await request(`${API.search}?query=${encodeURIComponent(query)}`);
    movies = listFrom(data).map(normalize); render();
  } catch (err) { movies = []; countEl.textContent = "Search unavailable"; status(`${err.message}. The backend /api/cinesubz/search route must be added to index.js.`, true); }
  finally { searchBtn.disabled = false; searchBtn.textContent = "Search"; }
});
async function loadGroups() {
  groupsEl.replaceChildren(); const opt = document.createElement("option"); opt.value = ""; opt.textContent = "Loading WhatsApp groups…"; groupsEl.append(opt); groupsEl.disabled = true;
  try {
    const data = await request(API.groups); const groups = Array.isArray(data) ? data : (data.data?.groups || data.groups || data.data || []);
    groupsEl.replaceChildren(); const first = document.createElement("option"); first.value = ""; first.textContent = groups.length ? "Choose a WhatsApp group" : "No groups available"; groupsEl.append(first);
    groups.forEach((g) => { const o = document.createElement("option"); o.value = typeof g === "string" ? g : (g.jid || g.id || ""); o.textContent = typeof g === "string" ? g : (g.name || g.subject || g.jid || "WhatsApp group"); if (o.value) groupsEl.append(o); });
    if (!groups.length) status("No groups returned. Check that the existing WhatsApp bot is connected.");
  } catch (err) { groupsEl.replaceChildren(); const o = document.createElement("option"); o.value = ""; o.textContent = "Groups unavailable"; groupsEl.append(o); status("WhatsApp groups need the backend /api/groups route in index.js.", true); }
  finally { groupsEl.disabled = false; sendBtn.disabled = !selected?.link || !groupsEl.value || sending; }
}
groupsEl.addEventListener("change", () => { sendBtn.disabled = !selected?.link || !groupsEl.value || sending; });
sendBtn.addEventListener("click", async () => {
  if (!selected?.link || !groupsEl.value || sending) { status("Choose a movie and destination group first.", true); return; }
  sending = true; sendBtn.disabled = true; sendBtn.textContent = "Sending…"; status("Submitting the selected movie to the connected bot…");
  try {
    // Backend should resolve details/download via existing APIs and send the actual video
    // through the already-connected Baileys socket. Do not open a second session here.
    const data = await request(API.send, { method: "POST", body: JSON.stringify({ movieUrl: selected.link, groupJid: groupsEl.value }) });
    status(data.message || "Request accepted by the backend.");
  } catch (err) { status(`${err.message}. The backend /api/cinesubz/send route must use the existing bot socket.`, true); }
  finally { sending = false; sendBtn.textContent = "Send selected movie"; sendBtn.disabled = !selected?.link || !groupsEl.value; }
});
loadGroups();
