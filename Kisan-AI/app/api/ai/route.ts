/// <reference types="node" />
/**
 * app/api/ai/route.ts
 * ============================================================
 * Central AI API Route � Google Gemini
 * Model: gemini-flash-latest (fallback chain)
 * ============================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { GeminiRequestBody, GeminiResponseBody } from "@/models";
import { safeJsonParse } from "@/utils/utils";

// --- Model --------------------------------------------------------------------

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const MODEL_CANDIDATES = [
  "gemini-flash-latest",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
];

async function generateWithFallback(input: string | Array<string | { inlineData: { data: string; mimeType: string } }>) {
  let lastError: unknown;

  for (const candidate of MODEL_CANDIDATES) {
    try {
      const candidateModel = genAI.getGenerativeModel({ model: candidate });
      return await candidateModel.generateContent(input);
    } catch (err) {
      lastError = err;
      const msg = err instanceof Error ? err.message.toLowerCase() : "";
      const isModelMissing = msg.includes("404") || msg.includes("not found") || msg.includes("is not found");
      const isTransientBusy = msg.includes("503") || msg.includes("high demand") || msg.includes("service unavailable");
      const isQuotaExceeded = msg.includes("429") || msg.includes("quota exceeded") || msg.includes("rate limit");
      if (!isModelMissing && !isTransientBusy && !isQuotaExceeded) break;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("No compatible Gemini model available for this API key.");
}

// --- System Prompts -----------------------------------------------------------

function buildChatSystemPrompt(language = "en", contextData?: string): string {
  const langMap: Record<string, string> = {
    en: "Respond in clear, simple English.",
    hi: "हिंदी में जवाब दें। सरल और स्पष्ट भाषा का उपयोग करें।",
    pa: "ਪੰਜਾਬੀ ਵਿੱਚ ਜਵਾਬ ਦਿਓ। ਸਾਦੀ ਭਾਸ਼ਾ ਵਰਤੋ।",
    mr: "मराठीत उत्तर द्या. साधी भाषा वापरा.",
    te: "తెలుగులో సమాధానం ఇవ్వండి.",
    ta: "தமிழில் பதில் அளிக்கவும்.",
  };

  return `You are Kisan AI, an expert agricultural advisor for Indian farmers.

Your expertise covers:
- Crop cultivation: wheat, rice, maize, cotton, pulses, oilseeds, vegetables
- Soil health, fertilisation, and irrigation best practices
- Integrated Pest Management (IPM) and organic farming
- Indian agricultural seasons: Kharif, Rabi, and Zaid
- Government schemes: PM-KISAN, PMFBY, KCC, Soil Health Card
- Market prices and Minimum Support Prices (MSP) for major crops
- Climate-smart agriculture for Indian agro-climatic zones

${contextData ? `REAL-TIME FARM CONTEXT (use this to give personalised advice):
${contextData}

Use this context to make responses specific and relevant:
- High humidity → mention fungal disease risk
- Low soil moisture → recommend irrigation
- Price below MSP → mention procurement options
- Rain forecast → advise on spray timing` : ""}

LANGUAGE: ${langMap[language] ?? langMap["en"]}

RESPONSE GUIDELINES:
- Be concise, practical, and actionable
- Use Indian units: acres, quintals, bags (50kg). Currency in INR (₹)
- Use bullet points for steps, keep paragraphs short
- Always suggest consulting a local agronomist for critical decisions`;
}

const PEST_SYSTEM = `You are an expert plant pathologist for Indian crops.
Analyse the crop image and return VALID JSON ONLY � no text outside JSON.

{
  "diseaseName": "string",
  "scientificName": "string",
  "confidencePercent": number,
  "severity": "Low" | "Moderate" | "High" | "Critical",
  "affectedArea": "string",
  "symptoms": ["string"],
  "treatment": {
    "immediate": ["string"],
    "preventive": ["string"],
    "recommendedPesticides": ["string"]
  },
  "disclaimer": "Consult a local agronomist before applying treatments."
}`;

const CROP_ADVISOR_SYSTEM = `You are an expert agronomist for Indian farm economics.
Return VALID JSON ONLY � no text outside JSON.

{
  "recommendations": [{
    "cropName": "string",
    "localName": "string",
    "suitabilityScore": number,
    "expectedYield": "string",
    "estimatedROI": {
      "investmentPerAcre": number,
      "expectedRevenuePerAcre": number,
      "profitPerAcre": number,
      "paybackMonths": number
    },
    "growingPeriodDays": number,
    "waterRequirement": "Low" | "Medium" | "High",
    "soilCompatibility": "string",
    "reasonsForRecommendation": ["string"],
    "risks": ["string"]
  }],
  "generalAdvice": "string",
  "bestCrop": "string"
}`;

// --- Route Handler ------------------------------------------------------------

export async function POST(req: NextRequest): Promise<NextResponse<GeminiResponseBody>> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "GEMINI_API_KEY not set in .env.local" },
        { status: 503 }
      );
    }

    let body: GeminiRequestBody;
    try { body = await req.json(); }
    catch { return NextResponse.json({ success: false, error: "Invalid JSON." }, { status: 400 }); }

    const { prompt, mode, language = "en", imageBase64, imageMimeType, context } = body;

    if (!prompt?.trim()) {
      return NextResponse.json({ success: false, error: "Prompt required." }, { status: 400 });
    }

    if (mode === "chat") {
      return await handleChat(prompt, language, context);
    }
    if (mode === "pest_diagnosis") {
      if (!imageBase64 || !imageMimeType) {
        return NextResponse.json(
          { success: false, error: "Image required for pest diagnosis." },
          { status: 400 }
        );
      }
      return await handlePestDiagnosis(prompt, imageBase64, imageMimeType);
    }
    if (mode === "crop_advisor") {
      return await handleCropAdvisor(prompt, context);
    }

    return NextResponse.json({ success: false, error: `Invalid mode: ${mode}` }, { status: 400 });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    console.error("[Gemini API] Unhandled error:", err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// --- Handler: Chat ------------------------------------------------------------

async function handleChat(
  prompt: string,
  language: string,
  context?: string
): Promise<NextResponse<GeminiResponseBody>> {
  const fullPrompt = `${buildChatSystemPrompt(language, context)}\n\nUser question:\n${prompt}`;
  const generation = await generateWithFallback(fullPrompt);
  const text = generation.response.text() ?? "";
  return NextResponse.json({ success: true, text });
}

// --- Handler: Pest Diagnosis (Vision) ----------------------------------------

async function handlePestDiagnosis(
  prompt: string,
  imageBase64: string,
  imageMimeType: string
): Promise<NextResponse<GeminiResponseBody>> {
  const parts = [
    PEST_SYSTEM,
    {
      inlineData: {
        data: imageBase64,
        mimeType: imageMimeType,
      },
    },
    prompt || "Diagnose any disease or pest visible in this crop image.",
  ];

  const generation = await generateWithFallback(parts);
  const rawText = generation.response.text() ?? "";
  const structured = safeJsonParse<Record<string, unknown>>(rawText);

  if (!structured) {
    console.error("[Pest Diagnosis] Failed to parse JSON:", rawText);
    return NextResponse.json(
      { success: false, error: "AI returned unparseable response. Try again.", text: rawText },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, structured });
}

// --- Handler: Crop Advisor ----------------------------------------------------

async function handleCropAdvisor(
  prompt: string,
  context?: string
): Promise<NextResponse<GeminiResponseBody>> {
  const fullPrompt = context
    ? `Farmer Profile:\n${context}\n\nRequest:\n${prompt}`
    : prompt;

  const generation = await generateWithFallback(`${CROP_ADVISOR_SYSTEM}\n\n${fullPrompt}`);
  const rawText = generation.response.text() ?? "";
  const structured = safeJsonParse<Record<string, unknown>>(rawText);

  if (!structured) {
    return NextResponse.json(
      { success: false, error: "AI returned unparseable response.", text: rawText },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, structured });
}

// --- CORS preflight -----------------------------------------------------------

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin":  "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}