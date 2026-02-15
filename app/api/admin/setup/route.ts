import { createUser, getUserByUsername } from "@/lib/db-json"
import { hashPassword } from "@/lib/password"

export async function POST() {
  try {
    console.log("[v0] ========== SETUP STARTED ==========")
    const username = "moatsem"
    const password = "716moatsem"
    
    console.log("[v0] Hashing password...")
    const hashedPassword = await hashPassword(password)
    console.log("[v0] Password hashed successfully")

    console.log("[v0] Checking for existing admin user...")
    const existingAdmin = await getUserByUsername(username)

    if (!existingAdmin) {
      console.log("[v0] Creating new admin user...")
      await createUser(username, hashedPassword, "admin")
      console.log("[v0] New admin user created successfully")
    } else {
      console.log("[v0] Admin user already exists")
    }

    console.log("[v0] ========== SETUP COMPLETED SUCCESSFULLY ==========")

    return Response.json({
      message: "تم إنشاء قاعدة البيانات والمستخدم المدير بنجاح! يمكنك الآن تسجيل الدخول باستخدام: moatsem / 716moatsem",
    })
  } catch (error) {
    console.error("[v0] ========== SETUP ERROR ==========")
    console.error("[v0] Admin setup error:", error)
    console.error("[v0] Error type:", error instanceof Error ? error.constructor.name : typeof error)
    if (error instanceof Error) {
      console.error("[v0] Error message:", error.message)
      console.error("[v0] Error stack:", error.stack)
    }
    const errorMessage = error instanceof Error ? error.message : "فشل في إنشاء المستخدم المدير"
    return Response.json(
      {
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}
