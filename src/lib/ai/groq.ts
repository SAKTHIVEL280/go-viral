import Groq from "groq-sdk";

export const GROQ_MODEL = "llama-3.1-70b-versatile";

// Lazy initialization — avoids throwing at build time when env var is absent
let _groqClient: Groq | null = null;

export function getGroqClient(): Groq {
  if (!_groqClient) {
    _groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY ?? "placeholder",
    });
  }
  return _groqClient;
}
