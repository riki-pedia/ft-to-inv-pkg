import fs from "fs";
import path from "path";

export async function register() {
  return {
    name: "report-md",
    version: "1.0.0",
    description: "Generates Markdown reports of ft-to-inv sync (diff + final state + errors)",
    author: "riki-pedia",
  };
}

function writeReport(fileName, content) {
  const reportsDir = path.resolve("reports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  const filePath = path.join(reportsDir, fileName);
  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`📝 [report-md] Markdown report written to ${filePath}`);
}

// Diff-based report
export async function duringSync({ data }) {
  const { newHistory = [], newSubs = [], newPlaylists = [] } = data;

  let md = `# 📊 ft-to-inv Sync Diff Report\n\n`;
  md += `Generated: ${new Date().toISOString()}\n\n`;

  md += `## ▶️ New History (${newHistory.length})\n`;
  md += newHistory.length
    ? newHistory.map(v => `- [${v.title || v.videoId}](https://youtube.com/watch?v=${v.videoId})`).join("\n")
    : "- No new history this run";
  md += `\n\n`;

  md += `## 📺 New Subscriptions (${newSubs.length})\n`;
  md += newSubs.length
    ? newSubs.map(s => `- ${s.name || s.channelId}`).join("\n")
    : "- No new subscriptions this run";
  md += `\n\n`;

  md += `## 📂 New Playlists (${newPlaylists.length})\n`;
  md += newPlaylists.length
    ? newPlaylists.map(p => `- ${p.title || p.playlistId}`).join("\n")
    : "- No new playlists this run";

  const fileName = `sync-diff-${new Date().toISOString().replace(/[:.]/g, "-")}.md`;
  writeReport(fileName, md);
}

// Final snapshot report
export async function afterSync({ data }) {
  const history = data.watch_history || [];
  const subs = data.subscriptions || [];
  const playlists = data.playlists || [];

  let md = `# ✅ ft-to-inv Final State Report\n\n`;
  md += `Generated: ${new Date().toISOString()}\n\n`;

  md += `- Total history: ${history.length}\n`;
  md += `- Total subscriptions: ${subs.length}\n`;
  md += `- Total playlists: ${playlists.length}\n`;

  const fileName = `sync-final-${new Date().toISOString().replace(/[:.]/g, "-")}.md`;
  writeReport(fileName, md);
}

// Failure path
export async function onError({ error }) {
  let md = `# ⚠️ ft-to-inv Sync Failed\n\n`;
  md += `Generated: ${new Date().toISOString()}\n\n`;
  md += `Error: \`${error?.message || error}\``;

  const fileName = `sync-error-${new Date().toISOString().replace(/[:.]/g, "-")}.md`;
  writeReport(fileName, md);
}

