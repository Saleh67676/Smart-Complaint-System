declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    GROQ_API_KEY?: string;
    OWNER_EMAIL?: string;
    LLM_MODEL_CONVERSATION?: string;
    BUCKET?: R2Bucket;
  }
}
