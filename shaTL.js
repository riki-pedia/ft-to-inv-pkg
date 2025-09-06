import fs from 'fs';
import path from 'path';

const pkgPath = path.resolve('./marketplace.json');
console.log(pkgPath)
const json = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

// ==== CHANGE PER OBJECT ====
if (typeof json.example.sha256 === "string") {
  json.example.sha256 = json.example.sha256.toLowerCase();
} else {
  console.error("❌ sha256 field is not a string:", json.example.sha256);
}

fs.writeFileSync(pkgPath, JSON.stringify(json, null, 2));
console.log("✅ Updated sha256 to lowercase");
