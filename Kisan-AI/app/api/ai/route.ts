/// <reference types="node" />
/**
 * app/api/ai/route.ts
 * ============================================================
 * Central AI API Route – Mistral AI
 * Model: mistral-large-latest (for chat/text)
 * Model: pixtral-12b-2409 (for vision/pest diagnosis)
 * ============================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { Mistral } from "@mistralai/mistralai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GeminiRequestBody, GeminiResponseBody } from "@/models";
import { safeJsonParse } from "@/utils/utils";

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
- Always end with: "Vishwas Score: 85/100"
- Always suggest consulting a local agronomist for critical decisions`;
}

const PEST_SYSTEM = `You are an expert plant pathologist for Indian crops.
Analyse the crop image and return VALID JSON ONLY – no text outside JSON.

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
  "disclaimer": "Consult a local agronomist before applying treatments.",
  "vishwasScore": number
}`;

const CROP_ADVISOR_SYSTEM = `You are an expert agronomist for Indian farm economics.
Return VALID JSON ONLY – no text outside JSON.

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
  "bestCrop": "string",
  "vishwasScore": number
}`;

// --- Route Handler ------------------------------------------------------------

export async function POST(req: NextRequest): Promise<NextResponse<GeminiResponseBody>> {
  try {
    if (!process.env.MISTRAL_API_KEY) {
      return NextResponse.json(
        { success: false, error: "MISTRAL_API_KEY not set in .env.local" },
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
    console.error("[Mistral API] Unhandled error:", err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// --- Handler: Chat ------------------------------------------------------------

async function handleChat(
  prompt: string,
  language: string,
  context?: string
): Promise<NextResponse<GeminiResponseBody>> {
  const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY! });
  const systemPrompt = buildChatSystemPrompt(language, context);
  const fullPrompt = `${systemPrompt}\n\nUser question:\n${prompt}`;

  const response = await client.chat.complete({
    model: "mistral-large-latest",
    messages: [
      { role: "user", content: fullPrompt },
    ],
  });

  let text = (response.choices?.[0]?.message?.content as string) || "";
  // Ensure Vishwas Score is present
  if (!text.includes("Vishwas Score")) {
    text += "\n\nVishwas Score: 85/100";
  }

  return NextResponse.json({ success: true, text });
}

// --- Handler: Pest Diagnosis (Vision) ----------------------------------------

async function handlePestDiagnosis(
  prompt: string,
  imageBase64: string,
  imageMimeType: string
): Promise<NextResponse<GeminiResponseBody>> {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { success: false, error: "GEMINI_API_KEY not set in .env.local" },
      { status: 503 }
    );
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const fullPrompt = `${PEST_SYSTEM}

${prompt || "Diagnose any disease or pest visible in this crop image."}`;

  const imagePart = {
    inlineData: {
      data: imageBase64,
      mimeType: imageMimeType,
    },
  };

  try {
    const result = await model.generateContent([fullPrompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON if wrapped in markdown block
    let jsonText = text;
    if (jsonText.includes("```json")) {
      jsonText = jsonText.split("```json")[1].split("```")[0].trim();
    } else if (jsonText.includes("```")) {
      jsonText = jsonText.split("```")[1].split("```")[0].trim();
    }

    const structured = safeJsonParse<Record<string, unknown>>(jsonText);

    if (!structured) {
      console.error("[Pest Diagnosis] Failed to parse JSON:", jsonText);
      return NextResponse.json(
        { success: false, error: "AI returned unparseable response. Try again.", text: jsonText },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, structured });
  } catch (error) {
    console.error("[Pest Diagnosis] Error mapping to Gemini:", error);
    return NextResponse.json(
      { success: false, error: "AI processing failed." },
      { status: 500 }
    );
  }
}

// --- Handler: Crop Advisor ----------------------------------------------------

async function handleCropAdvisor(
  prompt: string,
  context?: string
): Promise<NextResponse<GeminiResponseBody>> {
  const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY! });

  const fullPrompt = context
    ? `Farmer Profile:\n${context}\n\nRequest:\n${prompt}`
    : prompt;

  const response = await client.chat.complete({
    model: "mistral-large-latest",
    messages: [
      {
        role: "user",
        content: `${CROP_ADVISOR_SYSTEM}\n\n${fullPrompt}`,
      },
    ],
  });

  const rawText = (response.choices?.[0]?.message?.content as string) || "";
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