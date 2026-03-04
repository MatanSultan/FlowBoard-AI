import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

const RequestSchema = z.object({
  prompt: z.string().min(1).max(1000),
  projectName: z.string().min(1).max(200),
})

const TaskSchema = z.object({
  tasks: z.array(
    z.object({
      title: z.string().min(1),
      description: z.string().nullable(),
      priority: z.enum(["low", "medium", "high"]),
      tags: z.array(z.string()),
    }),
  ),
})

// Extract JSON object from a text response (handles cases where model adds extra text)
function extractJsonObject(text: string) {
  const firstBrace = text.indexOf("{")
  const lastBrace = text.lastIndexOf("}")
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null
  const candidate = text.slice(firstBrace, lastBrace + 1)
  try {
    return JSON.parse(candidate)
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  // Auth guard
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  // Env guard
  if (!process.env.GROQ_API_KEY) {
    return Response.json(
      { error: "AI is not configured. Please set GROQ_API_KEY in .env.local" },
      { status: 503 },
    )
  }

  // Parse + validate body
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 422 },
    )
  }

  const { prompt, projectName } = parsed.data

  try {
    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      temperature: 0.4,
      system:
        "You are a project management AI. Return ONLY valid JSON. No markdown, no extra text.",
      prompt: `Return JSON exactly in this format:
{
  "tasks": [
    { "title": "string", "description": "string or null", "priority": "low|medium|high", "tags": ["tag1","tag2"] }
  ]
}

Rules:
- Return 3–6 tasks
- title < 60 characters
- description 1–2 sentences (or null)
- tags: 1–2 lowercase tags

Project: "${projectName}"
User request: "${prompt}"
`,
    })

    const obj = extractJsonObject(text)
    if (!obj) {
      console.error("[generate-tasks] Could not parse JSON from model output:", text)
      return Response.json(
        { error: "AI returned invalid JSON. Please try again." },
        { status: 502 },
      )
    }

    const validated = TaskSchema.safeParse(obj)
    if (!validated.success) {
      console.error("[generate-tasks] JSON failed schema validation:", validated.error.flatten(), obj)
      return Response.json(
        { error: "AI returned unexpected format. Please try again." },
        { status: 502 },
      )
    }

    return Response.json(validated.data)
  } catch (err: unknown) {
    console.error("[generate-tasks] FULL ERROR:", err)
    const message = err instanceof Error ? err.message : "Unknown error"

    if (message.includes("429") || message.toLowerCase().includes("rate limit")) {
      return Response.json(
        { error: "Too many requests. Please try again in a minute." },
        { status: 429 },
      )
    }

    return Response.json({ error: `AI request failed: ${message}` }, { status: 500 })
  }
}