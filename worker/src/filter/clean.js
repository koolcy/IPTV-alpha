import { CONFIG } from "../config.js";

export function isSpam(text = "") {
  return CONFIG.BLACKLIST.some(k => text.includes(k));
}
