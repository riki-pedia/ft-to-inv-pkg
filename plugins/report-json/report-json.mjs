// == NEW ==
/*
this is the new plugin logger introduced in ft-to-inv 2.1.0 (i think, i havent actually released it yet)
usage below. This is a wrapper around the main logger that prefixes all logs with your plugin name, making it easier to identify which plugin is producing which logs in the console output.
this is an attempt to better control stdout for an upcoming project
*/
import fs from 'fs'
import path from 'path'
import { pluginLog } from '../../src/logs.js' // note: import using the package name and not a relative path, since the plugin will be running in a different context than the main tool and the relative path may not work. this is to test functionality of code not in the latest release of ft-to-inv (but on master branch)
import { getGlobalVars } from '../../src/args.js'
import { getVideoNameAndAuthor, getChannelName } from '../../src/utils.js'
const name = 'report-json'
/* 
intended json structure (schema):
{
  "version": "ft-to-inv version",
  "syncTimestamp": "ISO timestamp",
  "instance": "a url",
  "mode": "silent|quiet|dry-run|normal|verbose|very-verbose",
  "added": {
    "history": {
       videoId: {
         "title": "Video Title",
         "author": "Video Author",
         },
         ... 
    },
    "subs": {
       channelId: {
         "channelName": "Channel Name",
         },
         ...
    },
    "playlists": {
       "Playlist Name": {
          "videoIds": [videoId1, videoId2, ...],
       },
        ...
    },
    "removed": {
      // mirror of added structure
    }
    "summary": {
    // counts of items added/removed
        "added": {
            "history": X,
            "subs": Y,
            "playlists": Z
        },
        "removed": {
            "history": A,
            "subs": B,
            "playlists": C
        }
    },
    "success": true | false,
    "logFile": "path/to/logfile.log"
}    

*/
function log(message, options = {}) {
  pluginLog(message, { ...options, name })
}
export function register() {
  return {
    name: 'report-json',
    version: '1.0.0',
    description:
      'Generates JSON reports of ft-to-inv sync results, including diffs and final state.',
    author: 'riki-pedia',
    // the tool doesnt actually fact-check this but you should export it
    hooks: ['beforeMain'],
  }
}
let ftToInvVersion
export async function beforeMain(config) {
  ftToInvVersion = config.version
}
async function buildHistory(historyArray) {
  const history = {}
  for (const videoId of historyArray) {
    const { title, author } = await getVideoNameAndAuthor(videoId)
    history[videoId] = { title, author }
  }
  return history
}
async function buildSubs(subsArray) {
  const subs = {}
  for (const channelId of subsArray) {
    const channelName = await getChannelName(channelId)
    subs[channelId] = { channelName }
  }
  return subs
}
async function buildPlaylists(playlistsArray) {
  const result = {}
  for (const playlist of playlistsArray) {
    const videosById = {}
    const videoOrder = []
    for (const videoId of playlist.videos ?? []) {
      const { title, author } = await getVideoNameAndAuthor(videoId)
      videosById[videoId] = { title, author }
      videoOrder.push(videoId)
    }
    result[playlist.title] = {
      description: playlist.description ?? '',
      privacy: playlist.privacy ?? 'Private',
      videos: videosById,
      videoOrder,
    }
  }
  return result
}

async function makeJsonReport(diffs) {
  const gv = getGlobalVars()
  const report = {
    version: ftToInvVersion,
    syncTimestamp: new Date().toISOString(),
    instance: gv.instance || 'unknown',
    mode: `${gv.dry_run ? 'dry-run' : gv.quiet ? 'quiet' : gv.silent ? 'silent' : gv.verbose ? 'verbose' : gv.veryVerbose ? 'very-verbose' : 'normal'}`,
    added: {
      history: await buildHistory(diffs.added.history || []),
      subs: await buildSubs(diffs.added.subs || []),
      playlists: await buildPlaylists(diffs.added.playlists || []),
    },
    removed: {
      history: await buildHistory(diffs.removed.history || []),
      subs: await buildSubs(diffs.removed.subs || []),
      playlists: await buildPlaylists(diffs.removed.playlists || []),
    },
    summary: {
      added: {
        history: Object.keys(diffs.added.history || {}).length,
        subs: Object.keys(diffs.added.subs || {}).length,
        playlists: Object.keys(diffs.added.playlists || {}).length,
      },
      removed: {
        history: Object.keys(diffs.removed.history || {}).length,
        subs: Object.keys(diffs.removed.subs || {}).length,
        playlists: Object.keys(diffs.removed.playlists || {}).length,
      },
    },
    success: gv.dry_run ? null : gv.no_sync ? null : diffs.success, // if dry-run or no-sync, the only "success" there is is whether the diffs were generated successfully (which they should be unless something really weird happened)
    logFile: null, // tbd
  }
  return report
}
export async function afterSync(context) {
  const diffs = context.data
  const config = context.conf
  const report = await makeJsonReport(diffs)
  const folderName = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`
  const filename = `ft-to-inv-${config.success ? 'success' : 'failure'}-report-${new Date().getHours()}-${new Date().getMinutes()}-${new Date().getSeconds()}.json`
  const reportDir = path.join(process.cwd(), 'reports')
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir)
  }
  const fullPath = path.join(reportDir, folderName)
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath)
  }
  const filePath = path.join(fullPath, filename)
  fs.writeFileSync(filePath, JSON.stringify(report, null, 2))
  log(`Generated JSON report at ${filePath}`)
}
