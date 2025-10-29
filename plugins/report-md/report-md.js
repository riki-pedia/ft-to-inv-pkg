import fs from 'fs'
import path from 'path'
let conf
import { getChannelName, getVideoNameAndAuthor } from 'ft-to-inv/src/utils.js'
export function register() {
  return {
    name: 'report-md',
    version: '1.0.0',
    description: 'Generates Markdown reports of ft-to-inv sync (diff + final state + errors)',
    author: 'riki-pedia',
  }
}
let md = ''
function writeReport(fileName, content) {
  const reportsDir = path.resolve('reports')
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true })
  }
  const filePath = path.join(reportsDir, fileName)
  fs.writeFileSync(filePath, content, 'utf-8')
  console.log(`📝 [report-md] Markdown report written to ${filePath}`)
}
export async function afterMain(config) {
  conf = config
  md = `# 📊 ft-to-inv Sync Report\n\nGenerated: ${new Date().toISOString()}\n\n`
  return conf
}
// Diff-based report
export async function duringSync({ data }) {
  const { history = [], subs = [], playlists = [] } = data
  const instance = conf.instance
  //console.log(instance, conf) -random debug log that accidentally got committed, now immortalized in the codebase
  // History
  md += `## ▶️ New History (${history.length})\n`
  if (history.length) {
    for (const videoId of history) {
      try {
        const { author, title } = await getVideoNameAndAuthor(videoId, instance)
        const prettyTitle = title || 'Unknown Title'
        const prettyAuthor = author || 'Unknown Author'
        md += `- [${prettyTitle}](https://youtube.com/watch?v=${videoId}) by ${prettyAuthor}\n`
      } catch {
        md += `- ${videoId} (failed to resolve)\n`
      }
    }
  } else {
    md += `- No new history this run\n`
  }
  // Subs
  md += `\n## 📺 New Subscriptions (${subs.length})\n`
  if (subs.length) {
    for (const subId of subs) {
      try {
        const name = await getChannelName(subId, instance)
        md += `- ${name} (${subId})\n`
      } catch {
        md += `- ${subId} (failed to resolve)\n`
      }
    }
  } else {
    md += `- No new subscriptions this run\n`
  }
  // Playlists
  md += `\n## 📂 New Playlists (${playlists.length})\n`
  if (playlists.length) {
    playlists.forEach(pl => {
      md += `- ${pl.title || pl.playlistId}\n`
    })
  } else {
    md += `- No new playlists this run\n`
  }
  const fileName = `sync-diff-${new Date().toISOString().replace(/[:.]/g, '-')}.md`
  if (history.length === 0 && subs.length === 0 && playlists.length === 0) {
    writeReport(fileName, md)
  }
}

// Final snapshot report
export async function afterSync({ data }) {
  const history = data.watch_history || []
  const subs = data.subscriptions || []
  const playlists = data.playlists || []

  md += `\n\n## Final Summary\n\n`
  md += `- Total history: ${history.length}\n`
  md += `- Total subscriptions: ${subs.length}\n`
  md += `- Total playlists: ${playlists.length}\n`

  const fileName = `sync-final-${new Date().toISOString().replace(/[:.]/g, '-')}.md`
  writeReport(fileName, md)
}

// Failure path
export async function onError({ error }) {
  md += `# ⚠️ ft-to-inv Sync Failed\n\n`
  md += `Generated: ${new Date().toISOString()}\n\n`
  md += `Error: \`${error?.message || error}\``

  const fileName = `sync-error-${new Date().toISOString().replace(/[:.]/g, '-')}.md`
  writeReport(fileName, md)
}
