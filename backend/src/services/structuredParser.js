const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const env = require("../config/env");

const validator = z.object({
  basics: z.object({
    name: z.string().default(""),
    title: z.string().default(""),
    location: z.string().default(""),
    email: z.string().default(""),
    phone: z.string().default(""),
    links: z
      .array(z.object({ label: z.string(), url: z.string() }))
      .default([]),
  }),
  summary: z.string().default(""),
  experience: z
    .array(
      z.object({
        company: z.string().default(""),
        role: z.string().default(""),
        location: z.string().default(""),
        period: z.string().default(""),
        bullets: z.array(z.string()).default([]),
      }),
    )
    .default([]),
  education: z
    .array(
      z.object({
        degree: z.string().default(""),
        school: z.string().default(""),
        location: z.string().default(""),
        period: z.string().default(""),
        details: z.string().default(""),
      }),
    )
    .default([]),
  skills: z.array(z.string()).default([]),
  projects: z
    .array(
      z.object({
        name: z.string().default(""),
        description: z.string().default(""),
        tech: z.array(z.string()).default([]),
        links: z
          .array(z.object({ label: z.string(), url: z.string() }))
          .default([]),
      }),
    )
    .default([]),
  certifications: z
    .array(
      z.object({
        name: z.string().default(""),
        issuer: z.string().default(""),
        year: z.string().default(""),
      }),
    )
    .default([]),
  languages: z.array(z.string()).default([]),
  interests: z.array(z.string()).default([]),
});

function buildPrompt(rawText) {
  return `You are an expert resume parser. Extract structured information from the provided resume text and return ONLY a valid JSON object matching this exact structure:
{
  "basics": {
    "name": "string",
    "title": "string",
    "location": "string",
    "email": "string",
    "phone": "string",
    "links": [{"label": "string", "url": "string"}]
  },
  "summary": "string",
  "experience": [
    {
      "company": "string",
      "role": "string",
      "location": "string",
      "period": "string",
      "bullets": ["string"]
    }
  ],
  "education": [
    {
      "degree": "string",
      "school": "string",
      "location": "string",
      "period": "string",
      "details": "string"
    }
  ],
  "skills": ["string"],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "tech": ["string"],
      "links": [{"label": "string", "url": "string"}]
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "year": "string"
    }
  ],
  "languages": ["string"],
  "interests": ["string"]
}

Rules:
- Fill as much accurate data as possible from the resume text.
- If a field is missing, use empty string "" or empty array [].
- Return ONLY valid JSON, no markdown formatting.

RESUME TEXT:
-----------
${rawText}
-----------`;
}

const EMPTY = {
  basics: {
    name: "",
    title: "",
    location: "",
    email: "",
    phone: "",
    links: [],
  },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  interests: [],
};

async function parseResume(rawText) {
  const apiKey = env.geminiApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey || !rawText?.trim()) return EMPTY;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = buildPrompt(rawText);

    // Using the exact model mandated by Google's API for this key
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    let text = response.text;
    if (typeof text === "function") text = text();
    if (!text && response.candidates?.[0]?.content?.parts?.[0]?.text) {
      text = response.candidates[0].content.parts[0].text;
    }

    if (!text) throw new Error("Empty response from Gemini");

    const cleanJson = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleanJson);

    // Merge with EMPTY to guarantee all root keys exist before Zod validation
    const merged = { ...EMPTY, ...parsed };
    return validator.parse(merged);
  } catch (err) {
    console.error("🚨 PARSER ERROR:", err.message || err);
    return EMPTY;
  }
}

module.exports = { parseResume };
