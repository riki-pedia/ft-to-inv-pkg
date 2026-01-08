import fs from 'fs'
import path from 'path'
// == NEW ==
/*
this is the new plugin logger introduced in ft-to-inv 2.1.0 (i think, i havent actually released it yet)
usage below. This is a wrapper around the main logger that prefixes all logs with your plugin name, making it easier to identify which plugin is producing which logs in the console output.
this is an attempt to better control stdout for an upcoming project
*/
import { pluginLog } from 'ft-to-inv/src/logs.js'
const name = 'report-json'
export function register() {
    return {
        name: 'report-json',
        version: '1.0.0',
        description: 'Generates JSON reports of ft-to-inv sync results, including diffs and final state.',
        author: 'riki-pedia',
        // the tool doesnt actually fact-check this but you should export it
        hooks: ['afterMain', 'beforeSync', 'duringSync', 'afterSync']
    }
}
// ft-to-inv's version:
let ver
export async function beforeMain(v = version) {
    ver = v
}
// this file is in development on the ft-to-inv repo, and this is extremely incomplete.