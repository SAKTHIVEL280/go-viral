import { readFileSync } from "fs";
import { resolve } from "path";

const envLines = readFileSync(resolve(process.cwd(), ".env.local"), "utf8").split("\n");
const env = {};
for (const line of envLines) {
  const [k, ...v] = line.split("=");
  if (k && !k.startsWith("#")) env[k.trim()] = v.join("=").trim();
}

const key = env["GEMINI_API_KEY"];
const res = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
);
const data = await res.json();
const models = data.models ?? [];
console.log("Available models that support generateContent:\n");
for (const m of models) {
  if (m.supportedGenerationMethods?.includes("generateContent")) {
    console.log(" -", m.name);
  }
}
