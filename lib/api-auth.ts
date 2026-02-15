import { type NextRequest, NextResponse } from "next/server"
import { getUserByApiKey } from "./db-json"

export async function validateApiKey(
  request: NextRequest
): Promise<{ valid: true; apiKey: string; user: Record<string, unknown> } | { valid: false; response: NextResponse }> {
  const apiKey = request.headers.get("x-api-key") || ""

  if (!apiKey) {
    return {
      valid: false,
      response: NextResponse.json(
        { success: false, error: "Missing API key. Include x-api-key header." },
        { status: 401 }
      ),
    }
  }

  const user = await getUserByApiKey(apiKey)
  if (!user) {
    return {
      valid: false,
      response: NextResponse.json(
        { success: false, error: "Invalid API key." },
        { status: 403 }
      ),
    }
  }

  return { valid: true, apiKey, user }
}

export async function validateAdminKey(
  request: NextRequest
): Promise<{ valid: true; apiKey: string; user: Record<string, unknown> } | { valid: false; response: NextResponse }> {
  const result = await validateApiKey(request)
  if (!result.valid) return result
  if (result.user.role !== "admin") {
    return {
      valid: false,
      response: NextResponse.json({ success: false, error: "Admin access required." }, { status: 403 }),
    }
  }
  return result
}
