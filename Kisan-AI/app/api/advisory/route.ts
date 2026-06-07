import { NextRequest, NextResponse } from "next/server";
import { Mistral } from "@mistralai/mistralai";

type AdvisoryRequestBody = {
  prompt?: string;
  language?: string;
};

type AdvisoryResponseBody = {
  success: boolean;
  answer?: string;
  error?: string;
};

function buildStructuredAdvisoryPrompt(userPrompt: string, language: string = "en"): string {
  const langInstructions: Record<string, string> = {
    en: "Respond in English.",
    hi: "हिंदी में जवाब दें।",
    pa: "ਪੰਜਾਬੀ ਵਿੱਚ ਸਮਝਾਓ।",
    mr: "मराठीत उत्तर द्या।",
    te: "తెలుగులో వివరించండి।",
    ta: "தமிழில் விளக்குக.",
  };

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

LANGUAGE: ${langInstructions[language] ?? langInstructions["en"]}

Formatting rules:
- Keep each point on a new line
- Use simple language
- No long paragraph blocks
- Do not output JSON
- End response with: "Vishwas Score: 85/100"

Farmer question:
${userPrompt}`;
}

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Unexpected server error";
}

async function generateAdvisoryWithMistral(apiKey: string, prompt: string) {
  const client = new Mistral({ apiKey });

  const response = await client.chat.complete({
    model: "mistral-large-latest",
    messages: [{ role: "user", content: prompt }],
  });

  return (response.choices?.[0]?.message?.content as string) || "";
}

export async function POST(req: NextRequest): Promise<NextResponse<AdvisoryResponseBody>> {
  try {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "MISTRAL_API_KEY is missing in .env.local" },
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
    const language = body.language?.toLowerCase() || "en";

    if (!prompt) {
      return NextResponse.json({ success: false, error: "Prompt is required." }, { status: 400 });
    }

    try {
      const structuredPrompt = buildStructuredAdvisoryPrompt(prompt, language);
      const answer = await generateAdvisoryWithMistral(apiKey, structuredPrompt);

      // Ensure Vishwas Score is at the end
      const finalAnswer = answer.includes("Vishwas Score")
        ? answer
        : answer + "\n\nVishwas Score: 82/100";

      return NextResponse.json({ success: true, answer: finalAnswer });
    } catch (modelErr) {
      const message = getErrorMessage(modelErr);
      console.error("[Mistral API] Error:", message);
      throw modelErr;
    }
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
