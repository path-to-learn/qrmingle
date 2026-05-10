// Patches ios/App/App/capacitor.config.json after `cap copy ios`.
// Capacitor auto-generates packageClassList from installed npm plugins and
// doesn't know about IAPPlugin (a custom native Swift plugin), so it gets
// dropped every time. This script adds it back.
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = resolve(__dirname, "../ios/App/App/capacitor.config.json");

const config = JSON.parse(readFileSync(configPath, "utf8"));

const required = ["AppPlugin", "CAPCameraPlugin", "HapticsPlugin", "StatusBarPlugin", "IAPPlugin"];
const current = config.packageClassList ?? [];
const merged = [...new Set([...current, ...required])];

config.packageClassList = merged;
// Remove the duplicate that cap copy puts inside the ios object
if (config.ios?.packageClassList) delete config.ios.packageClassList;

writeFileSync(configPath, JSON.stringify(config, null, "\t"));
console.log("✔ Patched capacitor.config.json — packageClassList:", merged);
