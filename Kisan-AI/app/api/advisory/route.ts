import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

type AdvisoryRequestBody = {
  prompt?: string;
};

type AdvisoryResponseBody = {
  success: boolean;
  answer?: string;
  error?: string;
};

function buildStructuredAdvisoryPrompt(userPrompt: string): string {
  return `You are Kisan AI, an agricultural expert for Indian farmers.

Answer in a detailed but easy-to-read NOTES format.
Follow this exact structure:

Title: <short title>

1. Problem Summary
- 2 to 3 bullet points

2. Main Causes
- Bullet points with short explanation

3. What To Do Now (Immediate Steps)
- Numbered actionable steps

4. Preventive Care
- Bullet points

5. Local Practical Advice (India-specific)
- Include KVK/local agri officer suggestion when relevant

Formatting rules:
- Keep each point on a new line
- Use simple language
- No long paragraph blocks
- Do not output JSON
- Keep response in the user's query language

Farmer question:
${userPrompt}`;
}

const ADVISORY_MODEL_CANDIDATES = [
  "gemini-flash-latest",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
];

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Unexpected server error";
}

function isModelUnavailableError(message: string): boolean {
  const msg = message.toLowerCase();
  return msg.includes("404") || msg.includes("not found") || msg.includes("is not found");
}

function isTransientBusyError(message: string): boolean {
  const msg = message.toLowerCase();
  return msg.includes("503") || msg.includes("high demand") || msg.includes("service unavailable");
}

function isQuotaExceededError(message: string): boolean {
  const msg = message.toLowerCase();
  return msg.includes("429") || msg.includes("quota exceeded") || msg.includes("rate limit");
}

function buildQuotaFallbackAdvice(prompt: string): string {
  return [
    "Gemini quota is temporarily exhausted, so here is safe offline guidance while AI service recovers:",
    "",
    `Your query: \"${prompt}\"`,
    "",
    "1. Check current crop stage and recent weather before taking action.",
    "2. Prefer low-risk steps first: irrigation scheduling, field scouting, and sanitation.",
    "3. For fertilizer or pesticide use, follow label dose and consult your local Krishi Vigyan Kendra.",
    "4. Re-check mandi prices and MSP before deciding harvest sale timing.",
    "",
    "Retry in about 1 minute. If this continues, switch to a Gemini key/project with available quota.",
  ].join("\n");
}

async function generateAdvisoryWithFallback(apiKey: string, prompt: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError: unknown;

  for (const candidate of ADVISORY_MODEL_CANDIDATES) {
    try {
      const model = genAI.getGenerativeModel({ model: candidate });
      return await model.generateContent(prompt);
    } catch (err) {
      lastError = err;
      const message = getErrorMessage(err);
      if (isModelUnavailableError(message) || isTransientBusyError(message) || isQuotaExceededError(message)) {
        continue;
      }
      throw err;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("No compatible Gemini model available.");
}

export async function POST(req: NextRequest): Promise<NextResponse<AdvisoryResponseBody>> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "GEMINI_API_KEY is missing in .env.local" },
        { status: 503 }
      );
    }

    let body: AdvisoryRequestBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON body." }, { status: 400 });
    }

    const prompt = body.prompt?.trim();
    if (!prompt) {
      return NextResponse.json({ success: false, error: "Prompt is required." }, { status: 400 });
    }

    try {
      const structuredPrompt = buildStructuredAdvisoryPrompt(prompt);
      const result = await generateAdvisoryWithFallback(apiKey, structuredPrompt);
      const answer = result.response.text();
      return NextResponse.json({ success: true, answer });
    } catch (modelErr) {
      const message = getErrorMessage(modelErr);
      if (isQuotaExceededError(message)) {
        return NextResponse.json({ success: true, answer: buildQuotaFallbackAdvice(prompt) });
      }
      if (isTransientBusyError(message)) {
        return NextResponse.json({
          success: true,
          answer: "Gemini service is under high demand right now. Please retry in 30-60 seconds. In the meantime: monitor soil moisture, avoid preventive spraying before rain, and inspect crop canopy for early pest signs.",
        });
      }
      throw modelErr;
    }
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
