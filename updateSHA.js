import fs from "fs";
import crypto from "crypto"
import https from "https";
/**
 * Download a plugin, verify its SHA-256, and save to disk
 * @param {string} url - URL of the plugin file
 * @param {string} expectedSha - SHA-256 from marketplace.json
 * @param {string} dest - Where to save the plugin
 * @returns {Promise<void>}
 */
export async function downloadAndVerify(url, expectedSha, dest) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const file = fs.createWriteStream(dest);

    https.get(url, res => {
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} downloading ${url}`));
      }
      res.on("data", chunk => {
        hash.update(chunk);
        file.write(chunk);
      });
      res.on("end", () => {
        file.end();
        const actualSha = hash.digest("hex");
        if (expectedSha && actualSha !== expectedSha) {
          return reject(
            new Error(
              `❌ SHA mismatch for ${url}!\nExpected ${expectedSha}\nGot      ${actualSha}`
            )
          );
        }
        console.log(`✅ Verified ${url} (${actualSha})`);
        resolve();
      });
    }).on("error", reject);
  });
}

async function computeSha(url) {
  // Passing `null` skips the verification check
  // this writes to /dev/null to signify that there shouldnt be a path, and besides the write bit doesn't even work
  await downloadAndVerify(url, null, "/dev/null");
}

// Example: recompute SHA for example.js
computeSha("https://raw.githubusercontent.com/riki-pedia/ft-to-inv-pkg/refs/heads/main/plugins/report-md/report-md.js").catch(err => {
  console.error(err);
  process.exit(1);
});
