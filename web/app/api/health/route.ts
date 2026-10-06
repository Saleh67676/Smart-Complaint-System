import { env } from "cloudflare:workers";
import { json, database } from "../../../lib/server";
export async function GET() {
  try { await database().prepare("SELECT 1 FROM sessions LIMIT 1").first(); return json({status:"ok",aiConfigured:!!env.GROQ_API_KEY,provider:"Groq",model:env.LLM_MODEL_CONVERSATION || "openai/gpt-oss-120b"}); }
  catch { return json({status:"unavailable"},503); }
}
