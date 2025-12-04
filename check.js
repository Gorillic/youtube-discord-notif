const fetch = require('node-fetch');
const fs = require('fs');

const CHANNEL_ID = "UCYHSBv2Uc8_89g2Z61uurmQ";
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK;
const API_KEY = process.env.YT_API_KEY;         
const LAST_FILE = "last.txt";

async function run() {
  if (!WEBHOOK_URL || !API_KEY) {
    console.error("DISCORD_WEBHOOK veya YT_API_KEY eksik.");
    process.exit(1);
  }

  const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=1`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.items || data.items.length === 0) return;

  const video = data.items[0];
  const videoId = (video.id && video.id.videoId) ? video.id.videoId : null;
  if (!videoId) return;

  let last = "";
  if (fs.existsSync(LAST_FILE)) last = fs.readFileSync(LAST_FILE, "utf8").trim();

  if (last === videoId) {
    console.log("Yeni video yok.");
    return;
  }

  fs.writeFileSync(LAST_FILE, videoId);

  const payload = {
    username: "GorilHook",
    avatar_url: "https://i.imgur.com/8nP7g6u.png",
    embeds: [
      {
        title: "Yeni video yayında! 🎬",
        url: `https://youtu.be/${videoId}`,
        description: `${data.items[0].snippet.title}`,
        thumbnail: { url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` },
        color: 15258703
      }
    ]
  };

  await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  console.log("Bildirim gönderildi:", videoId);
}

run().catch(err => { console.error(err); process.exit(1); });
