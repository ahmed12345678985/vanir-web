import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { getFirebaseApp } from "./firebase-api";
import { uploadToCloudinary } from "./siteSettingsApi";

const GEMINI_MODEL = "gemini-2.5-flash";

function getGeminiModel(systemInstruction?: string) {
  const app = getFirebaseApp();
  if (!app) {
    throw new Error("Firebase App is not initialized.");
  }
  const ai = getAI(app, { backend: new GoogleAIBackend() });
  return getGenerativeModel(ai, {
    model: GEMINI_MODEL,
    ...(systemInstruction ? { systemInstruction } : {}),
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
  });
}

export async function generateBlogArticleWithGemini(
  title: string,
  seedText: string,
  category: string,
  lang: "ar" | "en"
): Promise<{ content: string; excerpt: string; imageQuery: string }> {
  const prompt =
    lang === "ar"
      ? `أنت كاتب محتوى سياحي محترف وخبير SEO في وكالة السفر الفاخر VANIR GROUP.
اكتب مقالة شاملة ومفيدة وحقيقية باللغة العربية حول الموضوع التالي:
العنوان: "${title}"
النص المرجعي/السياق: "${seedText || title}"
التصنيف: "${category}"

الشروط الإلزامية:
1. اكتب محتوى حقيقياً ومعلومات فعلية تجيب عن العنوان بدقة (اذكر أسماء مدن، وجهات، معالم، نصائح ميزانية، أو خطوات عملية حسب الموضوع — ولا تكتب كلاماً إنشائياً مكرراً عن الطيران الخاص إلا إذا كان العنوان نفسه عن الطيران الخاص).
2. نسّق المقالة بصيغة Markdown احترافية تشمل:
   - عنوان رئيسي (# ${title})
   - مقدمة جذابة
   - 3 إلى 4 أقسام فرعية (##) مع نقاط أو قوائم مرقمة واضحة
   - قسم الأسئلة الشائعة (## الأسئلة الشائعة (FAQ)) بسؤالين وإجابتين مفيدتين (###)
   - خاتمة قصيرة أنيقة تدعو للتواصل مع VANIR GROUP عند الحاجة.
3. أضف حقل imageQuery يحتوي على 2 إلى 4 كلمات إنجليزية دقيقة تصف أفضل صورة فوتوغرافية سياحية تعبّر عن موضوع المقالة (مثال: "Almaty Kazakhstan mountains" أو "tropical beach resort winter").
4. أعد النتيجة بصيغة JSON صالحة فقط بدون أي نص خارج JSON:
{"excerpt": "ملخص جذاب من 140 إلى 200 حرف", "imageQuery": "2-4 english photo keywords", "content": "نص المقالة الكامل بصيغة Markdown"}`
      : `You are an expert luxury travel writer and SEO specialist at VANIR GROUP.
Write a comprehensive, genuinely informative travel article in English for:
Title: "${title}"
Context: "${seedText || title}"
Category: "${category}"

Requirements:
1. Provide real, concrete destinations, landmarks, tips, budgets, and practical advice matching the exact topic (do NOT write generic private jet boilerplate unless the title is specifically about private jets).
2. Format cleanly in Markdown with:
   - Main H1 (# ${title})
   - Engaging intro
   - 3–4 structured H2 sections with bullet/numbered lists
   - ## Frequently Asked Questions (FAQ) with 2 helpful Q&As (###)
   - Brief closing CTA mentioning VANIR GROUP.
3. Include an "imageQuery" field with 2–4 concise English photography search keywords matching this article's visual scene.
4. Return ONLY valid JSON with no extra text:
{"excerpt": "140-200 character SEO summary", "imageQuery": "2-4 english photo keywords", "content": "full Markdown article"}`;

  const model = getGeminiModel();
  const result = await model.generateContent(prompt);
  const rawText = result.response.text().trim();

  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed?.content && typeof parsed.content === "string") {
        return {
          content: parsed.content.trim().slice(0, 95000),
          excerpt: String(parsed.excerpt || parsed.content.replace(/[#*_>`-]/g, "").slice(0, 180))
            .trim()
            .slice(0, 280),
          imageQuery: String(parsed.imageQuery || "luxury travel destination").trim().slice(0, 80),
        };
      }
    } catch {
      // Fall through to raw markdown return
    }
  }

  return {
    content: rawText.slice(0, 95000),
    excerpt: rawText.replace(/[#*_>`-]/g, "").slice(0, 180).trim(),
    imageQuery: "luxury travel destination",
  };
}

export function buildImageSearchQuery(title: string): string {
  const t = title.toLowerCase();
  if (/أقصر|luxor/.test(t)) return "Luxor temple Egypt Nile";
  if (/أسوان|aswan/.test(t)) return "Aswan Nile River felucca Egypt";
  if (/دهب|dahab/.test(t)) return "Dahab Red Sea Egypt beach";
  if (/شرم|sharm/.test(t)) return "Sharm El Sheikh Red Sea resort";
  if (/سيوة|siwa/.test(t)) return "Siwa Oasis desert Egypt";
  if (/قاهرة|أهرام|cairo|pyramids/.test(t)) return "Pyramids of Giza Cairo Egypt";
  if (/إسكندرية|اسكندرية|alexandria/.test(t)) return "Alexandria Mediterranean coast Egypt";
  if (/ألماتي|كازاخستان|almaty|kazakhstan/.test(t)) return "Almaty Kazakhstan snowy mountains lake";
  if (/دبي|dubai/.test(t)) return "Dubai Marina skyline luxury";
  if (/صحة|نفسية|استجمام|wellness|spa/.test(t)) return "luxury spa wellness nature retreat";
  if (/شتاء|دافئة|winter|warm/.test(t)) return "warm tropical beach sunset resort";
  if (/سرية|مخفية|غير تقليدية|hidden|secret/.test(t)) return "hidden paradise coastal cliff village";
  if (/ليلية|noctourism|نجوم|night/.test(t)) return "starry night sky desert camp";
  if (/بطيئة|slow travel/.test(t)) return "scenic European lake village morning";
  if (/ذكاء|اصطناعي|تخطيط|ai|smart/.test(t)) return "traveler planning trip map laptop";
  if (/طيران|تذاكر|flight|jet/.test(t)) return "private jet luxury cabin window clouds";
  if (/فنادق|فندق|hotel|resort/.test(t)) return "5 star luxury hotel infinity pool";
  if (/يخت|بحر|yacht|cruise/.test(t)) return "luxury superyacht Mediterranean sea";
  if (/باريس|paris/.test(t)) return "Paris Eiffel Tower sunset";
  if (/لندن|london/.test(t)) return "London Thames River skyline";
  if (/إسطنبول|اسطنبول|istanbul/.test(t)) return "Istanbul Bosphorus mosque sunset";
  if (/روما|إيطاليا|rome|italy/.test(t)) return "Rome Colosseum Italy sunset";
  if (/سانتوريني|santorini/.test(t)) return "Santorini white domes sea sunset";
  if (/مالديف|maldives/.test(t)) return "Maldives overwater bungalow turquoise";
  return "scenic luxury travel destination landscape";
}

export async function findAndSaveTopicImage(
  query: string,
  fallbackUrl: string,
  usedUrls?: Set<string>
): Promise<string> {
  try {
    const cleanQuery = (query || "luxury travel destination").trim();
    const apiUrl = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(cleanQuery)}&aspect_ratio=wide&category=photograph&size=large,medium&page_size=12`;
    const res = await fetch(apiUrl);
    if (!res.ok) return fallbackUrl;
    const json = await res.json();
    const results: Array<{ url?: string; width?: number; height?: number }> = Array.isArray(json?.results) ? json.results : [];

    for (const item of results) {
      const candidate = item?.url;
      if (!candidate || !candidate.startsWith("https://")) continue;
      if (/\.(svg|gif)(\?|$)/i.test(candidate)) continue;
      if (usedUrls && usedUrls.has(candidate)) continue;

      try {
        const cloudUrl = await Promise.race([
          uploadToCloudinary(candidate, "blog_covers"),
          new Promise<string>((_, reject) => setTimeout(() => reject(new Error("timeout")), 8000)),
        ]);
        usedUrls?.add(candidate);
        usedUrls?.add(cloudUrl);
        return cloudUrl;
      } catch {
        // If Cloudinary cannot fetch this external host, still use the fresh Openverse HTTPS photo!
        usedUrls?.add(candidate);
        return candidate;
      }
    }
  } catch (err) {
    console.warn("[geminiAi] Openverse topic image fetch failed, using fallback:", err);
  }
  return fallbackUrl;
}

export async function askGeminiConcierge(
  message: string,
  history?: Array<{ role: string; content: string }>
): Promise<string> {
  const model = getGeminiModel(
    "You are the VANIR GROUP AI Concierge — a refined, knowledgeable luxury travel advisor for Egypt and global destinations (Cairo, Luxor, Aswan, Sharm El Sheikh, Dubai, Paris, London, Maldives, Almaty, and bespoke VIP experiences). Reply concisely, warmly, and helpfully in the same language the user writes in (Arabic, English, or German)."
  );

  const validHistory = (history || [])
    .filter((m) => m && m.content && (m.role === "user" || m.role === "assistant" || m.role === "model"))
    .slice(-8)
    .map((m) => ({
      role: m.role === "assistant" ? ("model" as const) : ("user" as const),
      parts: [{ text: String(m.content).slice(0, 2000) }],
    }));

  if (validHistory.length > 0 && validHistory[0].role === "user") {
    const chat = model.startChat({ history: validHistory });
    const res = await chat.sendMessage(message);
    return res.response.text();
  }

  const res = await model.generateContent(message);
  return res.response.text();
}

export async function generateStructuredJsonWithGemini<T>(
  prompt: string,
  systemInstruction?: string
): Promise<T> {
  const model = getGeminiModel(
    systemInstruction ||
      "You are the VANIR GROUP AI Content Architect. Return ONLY valid raw JSON matching the requested schema, with no markdown code fences or extra commentary."
  );
  const res = await model.generateContent(prompt);
  const raw = res.response.text().trim();
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const jsonMatch = cleaned.match(/[\{\[][\s\S]*[\}\]]/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : cleaned) as T;
}

export async function askVanirAIAssistant(
  prompt: string,
  taskType?: string,
  history?: Array<{ role: string; content: string }>
): Promise<string> {
  const roleContext = taskType ? `Active task mode: ${taskType}.` : "";
  const model = getGeminiModel(
    `You are the Vanir AI Assistant — the executive AI operations & content copilot for VANIR GROUP Luxury Travel & Concierge (Egypt & Global). ${roleContext} Provide actionable, well-structured, high-value responses in the same language as the user's request (Arabic, English, or German).`
  );

  const validHistory = (history || [])
    .filter((m) => m && m.content && (m.role === "user" || m.role === "assistant" || m.role === "model"))
    .slice(-10)
    .map((m) => ({
      role: m.role === "assistant" ? ("model" as const) : ("user" as const),
      parts: [{ text: String(m.content).slice(0, 3000) }],
    }));

  if (validHistory.length > 0 && validHistory[0].role === "user") {
    const chat = model.startChat({ history: validHistory });
    const res = await chat.sendMessage(prompt);
    return res.response.text();
  }

  const res = await model.generateContent(prompt);
  return res.response.text();
}
