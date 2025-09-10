import fs from "fs";
import path from "path";
let conf
import { getChannelName, getVideoNameAndAuthor} from '@riki-pedia/ft-to-inv/src/utils.js'
export function register() {
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
export async function afterMain(config) {
  conf = config
  return conf;
}
// Diff-based report
export async function duringSync({ data }) {
  const { newHistory = [], newSubs = [], newPlaylists = [] } = data;
  const config = conf;
  const instance = config.instance;
  const token = config.token;
  let md = `# 📊 ft-to-inv Sync Diff Report\n\n`;
  md += `Generated: ${new Date().toISOString()}\n\n`;
  // History
  md += `## ▶️ New History (${newHistory.length})\n`;
  if (newHistory.length && getVideoNameAndAuthor) {
    for (const v of newHistory) {
      try {
        const { author, title } = await getVideoNameAndAuthor(v, instance, token);
        const prettyTitle = title || "Unknown Title";
        const prettyAuthor = author || "Unknown Author";
        md += `- [${prettyTitle}](https://youtube.com/watch?v=${v.videoId}) by ${prettyAuthor}\n`;
      } catch {
        md += `- ${v.videoId} (failed to resolve)\n`;
      }
    }
    if (newHistory.length > 20) {
      md += `- …and ${newHistory.length - 20} more\n`;
    }
  } else {
    md += `- No new history this run\n`;
  }
  md += `\n`;
  // Subs
  md += `## 📺 New Subscriptions (${newSubs.length})\n`;
  if (newSubs.length && getChannelName) {
    for (const sub of newSubs.slice(0, 20)) {
      try {
        const name = await getChannelName(sub, instance);
        md += `- ${name} (${sub})\n`;
      } catch {
        md += `- ${sub} (failed to resolve)\n`;
      }
    }
    if (newSubs.length > 20) {
      md += `- …and ${newSubs.length - 20} more\n`;
    }
  } else {
    md += `- No new subscriptions this run\n`;
  }
  md += `\n`;
  // Playlists
  md += `## 📂 New Playlists (${newPlaylists.length})\n`;
  if (newPlaylists.length) {
    newPlaylists.slice(0, 20).forEach(pl => {
      md += `- ${pl.title || pl.playlistId}\n`;
    });
    if (newPlaylists.length > 20) {
      md += `- …and ${newPlaylists.length - 20} more\n`;
    }
  } else {
    md += `- No new playlists this run\n`;
  }
  // write to file (same helper as before)
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

