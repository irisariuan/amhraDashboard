import { readFileSync } from "node:fs";
import path from "node:path";

export const settings = JSON.parse(readFileSync(path.join(process.cwd(), 'settings.json'), 'utf8'))