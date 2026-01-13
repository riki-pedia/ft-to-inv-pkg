import notifier from 'node-notifier';
import path from 'path';
import { fileURLToPath } from 'url';
export function register() {
    return {
        name: "desktop-notify",
        version: "1.0.0",
        description: "Notifies user of ft-to-inv sync results with desktop notifications",
        author: "riki-pedia",
    };
}
const dirname = path.dirname(fileURLToPath(import.meta.url));
const assets = path.join(dirname, '..', '..', 'assets');
const icon = path.join(assets, 'trash-logo.png');
const iconPath = path.resolve(icon);
// note: these names are like this to avoid conflict with the names i set in the main tool
// "why dont you change the names?"
// im lazy
let his, subs, pls;
export async function duringSync({ data }) {
    const history = data.history || [];
    const subscriptions = data.subs || [];
    const playlists = data.playlists || [];
    his = history;
    pls = playlists;
    subs = subscriptions;
    if (his.length === 0 && subs.length === 0 && pls.length === 0) {
        notifier.notify({
            title: "ft-to-inv sync",
            message: "No data to sync",
            wait: false,
            // one second is short, but (at least on windows) it "ignores" this value so good luck macos
            timeout: 1,
            actions: ['OK'],
            icon: iconPath
        });
    }
}
export async function afterSync() {
    notifier.notify({
        title: "ft-to-inv Sync Complete",
        message: `Sync completed, diffs:\n ${his.length === 1 ? '1 video' : `${his.length} videos`}\n ${subs.length === 1 ? '1 subscription' : `${subs.length} subscriptions`}\n ${pls.length === 1 ? '1 playlist' : `${pls.length} playlists`}`,
        wait: false,
        timeout: 1,
        actions: ['OK'],
        icon: iconPath
    });
}

export async function onError({ error }) {
    notifier.notify({
        title: "ft-to-inv Sync Failed",
        message: `The sync process failed: ${error.message || error}`,
        wait: false,
        timeout: 2,
        actions: ['OK'],
        icon: iconPath
    });
}