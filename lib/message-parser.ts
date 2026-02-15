/**
 * Parses Telegram transfer messages from Yemeni banking apps.
 * 
 * Example message format:
 * -> com.motorola.messaging:٠٤-٠٢-٢٠٢٦ ١٢:٣٦:٤٨ - Jaib - اضيف 100ر.ي ... من مهند الرزامي-711973018
 */

// Map Arabic-Indic numerals to Western Arabic
const arabicNumeralMap: Record<string, string> = {
  "\u0660": "0", // ٠
  "\u0661": "1", // ١
  "\u0662": "2", // ٢
  "\u0663": "3", // ٣
  "\u0664": "4", // ٤
  "\u0665": "5", // ٥
  "\u0666": "6", // ٦
  "\u0667": "7", // ٧
  "\u0668": "8", // ٨
  "\u0669": "9", // ٩
}

function convertArabicNumerals(str: string): string {
  return str.replace(/[\u0660-\u0669]/g, (match) => arabicNumeralMap[match] || match)
}

export interface ParsedMessage {
  sender_name: string
  amount: number
  app_name: string
  date: string // YYYY-MM-DD
  time: string // HH:MM:SS
  raw_message: string
}

export function parseTransferMessage(raw: string): ParsedMessage | null {
  try {
    const normalized = convertArabicNumerals(raw)

    // Extract date: DD-MM-YYYY pattern
    const dateMatch = normalized.match(/(\d{2})-(\d{2})-(\d{4})/)
    if (!dateMatch) return null

    const day = dateMatch[1]
    const month = dateMatch[2]
    const year = dateMatch[3]
    const date = `${year}-${month}-${day}`

    // Extract time: HH:MM:SS pattern
    const timeMatch = normalized.match(/(\d{2}):(\d{2}):(\d{2})/)
    if (!timeMatch) return null

    const time = `${timeMatch[1]}:${timeMatch[2]}:${timeMatch[3]}`

    // Extract app name: between " - " markers after date/time
    const appMatch = normalized.match(/\d{2}:\d{2}:\d{2}\s*-\s*(\w+)\s*-/)
    if (!appMatch) return null
    const app_name = appMatch[1]

    // Extract amount: number before ر.ي
    const amountMatch = normalized.match(/([\d,]+(?:\.\d+)?)\s*ر\.ي/)
    if (!amountMatch) return null
    const amount = parseFloat(amountMatch[1].replace(/,/g, ""))

    // Extract sender name: after "من" (from) keyword
    const senderMatch = raw.match(/من\s+(.+)$/)
    if (!senderMatch) return null
    const sender_name = senderMatch[1].trim()

    return {
      sender_name,
      amount,
      app_name,
      date,
      time,
      raw_message: raw,
    }
  } catch {
    return null
  }
}

/**
 * Parses multiple messages (one per line)
 */
export function parseMultipleMessages(text: string): ParsedMessage[] {
  const lines = text.split("\n").filter((l) => l.trim().length > 0)
  const results: ParsedMessage[] = []

  for (const line of lines) {
    const parsed = parseTransferMessage(line.trim())
    if (parsed) {
      results.push(parsed)
    }
  }

  return results
}
