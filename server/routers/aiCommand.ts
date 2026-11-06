/**
 * AI Command Center Router
 * Advanced AI assistant for admin tasks using LLM
 * Supports multimodal input (text + images + files)
 */
import { z } from "zod";
import { router, adminProcedure, publicProcedure } from "../_core/trpc";
import { invokeLLM, getActiveAiConfig, updateActiveAiConfig, testAiConnection } from "../_core/llm";
import type { Message } from "../_core/llm";
import { getSettingValue, setSettingValue } from "../_core/firestore-db";
import { storagePut } from "../storage";
import { nanoid } from "nanoid";

/* ═══════════════════════════════════════════════════════════════
   System Prompts for Different Task Types
   ═══════════════════════════════════════════════════════════════ */

const VANIR_SYSTEM_PROMPT = `You are the AI Command Center assistant for Vanir Travel Group — a luxury travel company specializing in Egyptian heritage and premium travel experiences. You combine ancient Egyptian elegance with modern luxury.

Brand voice: Sophisticated, knowledgeable, warm yet professional. Use rich descriptive language that evokes luxury and wonder.

Company details:
- Name: Vanir Travel Group (Vanir Group)
- Specialty: Luxury travel, Egyptian heritage tours, premium experiences
- Style: Art Deco, Black & Gold aesthetic
- Target audience: High-net-worth travelers, culture enthusiasts, luxury seekers

You are fluent in both Arabic and English. Respond in the same language the user writes in.
Always provide actionable, specific, and professional responses.`;

const TASK_PROMPTS: Record<string, string> = {
  content_writer: `${VANIR_SYSTEM_PROMPT}

You are a premium content writer for Vanir Travel Group. Your task is to create compelling, luxury-oriented travel content.

Guidelines:
- Write in an elegant, evocative style that captures the magic of travel
- Highlight unique experiences, cultural richness, and luxury amenities
- Use sensory language that transports the reader
- Include relevant keywords naturally for SEO
- Maintain the brand's sophisticated tone
- Format output in clean Markdown with headers, paragraphs, and lists where appropriate`,

  seo_analyst: `${VANIR_SYSTEM_PROMPT}

You are an expert SEO analyst for Vanir Travel Group. Analyze and optimize content for search engines.

Your capabilities:
- Audit page titles, meta descriptions, and keywords
- Suggest improvements for search rankings
- Analyze keyword density and relevance
- Recommend internal/external linking strategies
- Provide structured SEO reports with scores
- Suggest schema markup improvements
- Analyze competitor keywords in the luxury travel space

Format your analysis with clear sections, scores (1-100), and actionable recommendations.`,

  offer_generator: `${VANIR_SYSTEM_PROMPT}

You are a luxury travel offer creator for Vanir Travel Group. Design irresistible travel packages.

When creating offers:
- Include a compelling title and tagline
- Detail the itinerary day by day
- List included amenities and experiences
- Set pricing tiers (Standard, Premium, Royal)
- Add urgency elements (limited availability, seasonal)
- Highlight unique selling points
- Include terms and conditions summary

Format as a structured offer document in Markdown.`,

  data_analyst: `${VANIR_SYSTEM_PROMPT}

You are a data analyst for Vanir Travel Group. Analyze business metrics and provide insights.

Your capabilities:
- Analyze booking trends and patterns
- Revenue analysis and forecasting
- Customer segmentation insights
- Seasonal demand analysis
- Performance benchmarking
- ROI calculations for marketing campaigns
- Conversion funnel analysis

Provide data-driven insights with specific numbers, percentages, and actionable recommendations.
Use tables and structured formats for clarity.`,

  customer_support: `${VANIR_SYSTEM_PROMPT}

You are a premium customer support specialist for Vanir Travel Group. Handle customer inquiries with grace and professionalism.

Guidelines:
- Respond with warmth and empathy
- Provide detailed, helpful solutions
- Maintain the luxury brand experience in every interaction
- Offer alternatives when the requested option isn't available
- Use professional yet friendly language
- Include relevant policies when needed
- Escalate appropriately when necessary

Draft professional email responses that maintain the Vanir luxury standard.`,

  translator: `${VANIR_SYSTEM_PROMPT}

You are a professional translator for Vanir Travel Group. Translate content between Arabic and English while maintaining the luxury brand voice.

Guidelines:
- Preserve the tone and style of the original text
- Adapt cultural references appropriately
- Maintain marketing appeal in translations
- Keep technical terms accurate
- Preserve formatting and structure
- Add cultural context notes when helpful`,

  social_media: `${VANIR_SYSTEM_PROMPT}

You are a social media strategist for Vanir Travel Group. Create engaging social media content.

Capabilities:
- Write posts for Instagram, Facebook, Twitter/X, LinkedIn
- Create hashtag strategies
- Design content calendars
- Write engaging captions with CTAs
- Create story/reel scripts
- Suggest visual content ideas
- Plan influencer collaboration briefs

Adapt tone for each platform while maintaining brand consistency.`,

  itinerary_planner: `${VANIR_SYSTEM_PROMPT}

You are an expert luxury itinerary planner for Vanir Travel Group. Design detailed, day-by-day travel itineraries.

When creating itineraries:
- Structure each day with morning, afternoon, and evening activities
- Include luxury hotel recommendations with room categories
- Add restaurant suggestions with cuisine types
- Include private transportation arrangements
- Suggest optional VIP experiences and upgrades
- Add practical tips (best time to visit, dress code, local customs)
- Include estimated timing for each activity
- Factor in rest periods and leisure time for luxury travelers

Format as a beautifully structured day-by-day itinerary in Markdown.`,

  review_responder: `${VANIR_SYSTEM_PROMPT}

You are a guest relations specialist for Vanir Travel Group. Craft thoughtful, personalized responses to guest reviews.

Guidelines:
- Always thank the guest by name when available
- Address specific points mentioned in their review
- For positive reviews: express genuine gratitude, highlight what made their experience special
- For negative reviews: apologize sincerely, acknowledge the issue, explain corrective actions, offer resolution
- Maintain professional warmth without being defensive
- Invite them to return and mention upcoming experiences
- Keep responses concise but heartfelt (150-250 words)

Provide responses ready to post on TripAdvisor, Google, and Booking.com.`,

  pricing_advisor: `${VANIR_SYSTEM_PROMPT}

You are a revenue management and pricing strategist for Vanir Travel Group.

Your capabilities:
- Analyze competitive pricing in the luxury travel market
- Suggest dynamic pricing strategies based on seasonality
- Calculate profit margins and break-even points
- Design tiered pricing structures (Standard, Premium, Royal, Ultra-Luxury)
- Recommend upselling and cross-selling strategies
- Analyze price elasticity for different market segments
- Create promotional pricing calendars

Provide specific numbers, percentages, and comparison tables in your analysis.`,

  brand_voice: `${VANIR_SYSTEM_PROMPT}

You are a brand strategist and copywriter for Vanir Travel Group. Ensure all content aligns with the brand identity.

Your capabilities:
- Review and refine content to match brand voice
- Create brand-consistent taglines and slogans
- Develop brand messaging frameworks
- Write brand guidelines and style notes
- Adapt content for different audiences while maintaining brand identity
- Create brand stories that connect Egyptian heritage with modern luxury
- Design email signatures, bio texts, and boilerplate copy

Always maintain the Art Deco, Black & Gold aesthetic in your writing suggestions.`,

  competitor_analysis: `${VANIR_SYSTEM_PROMPT}

You are a competitive intelligence analyst for Vanir Travel Group.

Your capabilities:
- Analyze competitor offerings, pricing, and positioning
- Identify market gaps and opportunities
- Compare service features and unique selling points
- Assess competitor marketing strategies
- Provide SWOT analysis for competitive positioning
- Suggest differentiation strategies
- Monitor industry trends and emerging competitors

Provide structured analysis with comparison tables and actionable recommendations.`,

  report_generator: `${VANIR_SYSTEM_PROMPT}

You are a professional report writer for Vanir Travel Group. Create comprehensive business reports.

Report types you can generate:
- Monthly/quarterly performance reports
- Marketing campaign analysis reports
- Customer satisfaction summaries
- Destination performance reports
- Financial overview reports
- Market research summaries
- Operational efficiency reports

Format reports with executive summary, key findings, detailed analysis, charts descriptions, and recommendations.
Use professional formatting with headers, tables, and bullet points.`,

  email_composer: `${VANIR_SYSTEM_PROMPT}

You are an email communication specialist for Vanir Travel Group. Craft professional emails for various purposes.

Email types:
- Welcome emails for new clients
- Booking confirmations with luxury touches
- Pre-trip preparation guides
- Post-trip thank you and feedback requests
- Partnership and B2B proposals
- Newsletter content
- VIP client communications
- Event invitations
- Seasonal promotions

Maintain the luxury brand voice while being warm and personal. Include subject lines.`,

  general: VANIR_SYSTEM_PROMPT,
};

/* ═══════════════════════════════════════════════════════════════
   All Task Types Metadata
   ═══════════════════════════════════════════════════════════════ */

const ALL_TASK_TYPES = [
  {
    id: "content_writer",
    name: "Content Writer",
    nameAr: "كاتب المحتوى",
    description: "Write compelling travel content, blog posts, and descriptions",
    descriptionAr: "كتابة محتوى سياحي جذاب ومقالات ووصف الرحلات",
    icon: "pen-tool",
    color: "blue",
    category: "content",
    suggestedPrompts: [
      "Write a luxury blog post about Luxor temples",
      "Create a destination description for Sharm El Sheikh",
      "Write an email newsletter about summer offers",
    ],
  },
  {
    id: "seo_analyst",
    name: "SEO Analyst",
    nameAr: "محلل SEO",
    description: "Analyze and optimize content for search engines",
    descriptionAr: "تحليل وتحسين المحتوى لمحركات البحث",
    icon: "search",
    color: "green",
    category: "marketing",
    suggestedPrompts: [
      "Audit the SEO for our Egypt tours page",
      "Suggest keywords for luxury Nile cruise packages",
      "Analyze meta tags for our homepage",
    ],
  },
  {
    id: "offer_generator",
    name: "Offer Generator",
    nameAr: "مولد العروض",
    description: "Design irresistible travel packages and offers",
    descriptionAr: "تصميم عروض وباقات سفر لا تقاوم",
    icon: "gift",
    color: "gold",
    category: "operations",
    suggestedPrompts: [
      "Create a 7-day luxury Egypt tour package",
      "Design a honeymoon package for Red Sea resorts",
      "Generate a group discount offer for Aswan",
    ],
  },
  {
    id: "data_analyst",
    name: "Data Analyst",
    nameAr: "محلل البيانات",
    description: "Analyze business metrics and provide insights",
    descriptionAr: "تحليل مقاييس الأعمال وتقديم رؤى",
    icon: "bar-chart",
    color: "purple",
    category: "analysis",
    suggestedPrompts: [
      "Analyze booking trends for Q1 2026",
      "Suggest strategies to increase conversion rates",
      "Create a revenue forecast for summer season",
    ],
  },
  {
    id: "customer_support",
    name: "Customer Support",
    nameAr: "دعم العملاء",
    description: "Draft professional customer responses",
    descriptionAr: "صياغة ردود احترافية للعملاء",
    icon: "headphones",
    color: "teal",
    category: "operations",
    suggestedPrompts: [
      "Draft a response to a booking cancellation request",
      "Write a follow-up email after a completed trip",
      "Handle a complaint about hotel quality",
    ],
  },
  {
    id: "translator",
    name: "Translator",
    nameAr: "المترجم",
    description: "Translate content between Arabic and English",
    descriptionAr: "ترجمة المحتوى بين العربية والإنجليزية",
    icon: "languages",
    color: "orange",
    category: "content",
    suggestedPrompts: [
      "Translate our about page to Arabic",
      "Translate this offer description to English",
      "Localize marketing copy for Arabic audience",
    ],
  },
  {
    id: "social_media",
    name: "Social Media",
    nameAr: "وسائل التواصل",
    description: "Create engaging social media content",
    descriptionAr: "إنشاء محتوى جذاب لوسائل التواصل الاجتماعي",
    icon: "share-2",
    color: "pink",
    category: "marketing",
    suggestedPrompts: [
      "Write 5 Instagram captions for pyramid photos",
      "Create a weekly content calendar for Facebook",
      "Draft a LinkedIn post about our new luxury service",
    ],
  },
  {
    id: "itinerary_planner",
    name: "Itinerary Planner",
    nameAr: "مخطط الرحلات",
    description: "Design detailed day-by-day luxury travel itineraries",
    descriptionAr: "تصميم جداول رحلات فاخرة مفصلة يوماً بيوم",
    icon: "map-pin",
    color: "emerald",
    category: "operations",
    suggestedPrompts: [
      "Plan a 5-day luxury Cairo & Luxor itinerary",
      "Design a 10-day all-Egypt premium tour",
      "Create a 3-day Red Sea diving & relaxation itinerary",
    ],
  },
  {
    id: "review_responder",
    name: "Review Responder",
    nameAr: "الرد على التقييمات",
    description: "Craft thoughtful responses to guest reviews",
    descriptionAr: "صياغة ردود مدروسة على تقييمات الضيوف",
    icon: "star",
    color: "amber",
    category: "operations",
    suggestedPrompts: [
      "Respond to a 5-star review praising our Nile cruise",
      "Draft a professional response to a negative hotel review",
      "Write a thank-you response to a returning guest",
    ],
  },
  {
    id: "pricing_advisor",
    name: "Pricing Advisor",
    nameAr: "مستشار التسعير",
    description: "Revenue management and pricing strategy analysis",
    descriptionAr: "إدارة الإيرادات وتحليل استراتيجيات التسعير",
    icon: "dollar-sign",
    color: "lime",
    category: "analysis",
    suggestedPrompts: [
      "Suggest pricing for a new premium Aswan package",
      "Analyze our pricing vs competitors for Nile cruises",
      "Create a seasonal pricing calendar for 2026",
    ],
  },
  {
    id: "brand_voice",
    name: "Brand Voice",
    nameAr: "صوت العلامة",
    description: "Ensure content aligns with Vanir brand identity",
    descriptionAr: "ضمان توافق المحتوى مع هوية علامة فانير",
    icon: "crown",
    color: "yellow",
    category: "content",
    suggestedPrompts: [
      "Review and refine this page copy for brand consistency",
      "Create 5 brand-aligned taglines for our summer campaign",
      "Write brand guidelines for social media posts",
    ],
  },
  {
    id: "competitor_analysis",
    name: "Competitor Analysis",
    nameAr: "تحليل المنافسين",
    description: "Competitive intelligence and market positioning",
    descriptionAr: "الاستخبارات التنافسية وتحديد المواقع في السوق",
    icon: "target",
    color: "red",
    category: "analysis",
    suggestedPrompts: [
      "Compare our luxury Egypt tours with top 3 competitors",
      "Identify gaps in the luxury Nile cruise market",
      "SWOT analysis for Vanir Travel Group",
    ],
  },
  {
    id: "report_generator",
    name: "Report Generator",
    nameAr: "مولد التقارير",
    description: "Create comprehensive business and performance reports",
    descriptionAr: "إنشاء تقارير أعمال وأداء شاملة",
    icon: "file-text",
    color: "slate",
    category: "analysis",
    suggestedPrompts: [
      "Generate a monthly performance report template",
      "Create a marketing campaign analysis report",
      "Write a customer satisfaction summary report",
    ],
  },
  {
    id: "email_composer",
    name: "Email Composer",
    nameAr: "محرر الإيميلات",
    description: "Craft professional emails for all occasions",
    descriptionAr: "صياغة إيميلات احترافية لجميع المناسبات",
    icon: "mail",
    color: "cyan",
    category: "content",
    suggestedPrompts: [
      "Write a welcome email for new VIP clients",
      "Draft a partnership proposal email to a luxury hotel",
      "Create a pre-trip preparation guide email",
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════
   Helper: Build multimodal message content
   ═══════════════════════════════════════════════════════════════ */

function buildMessageContent(
  text: string,
  attachments?: { url: string; mimeType: string }[]
): string | Array<{ type: string; [key: string]: any }> {
  if (!attachments || attachments.length === 0) return text;

  const parts: Array<{ type: string; [key: string]: any }> = [];

  // Add text part first
  if (text) {
    parts.push({ type: "text", text });
  }

  // Add file/image parts
  for (const att of attachments) {
    if (att.mimeType.startsWith("image/")) {
      parts.push({
        type: "image_url",
        image_url: { url: att.url, detail: "auto" },
      });
    } else if (
      ["application/pdf", "audio/mpeg", "audio/wav", "audio/mp4", "video/mp4"].includes(att.mimeType)
    ) {
      parts.push({
        type: "file_url",
        file_url: { url: att.url, mime_type: att.mimeType },
      });
    }
    // For unsupported types, mention them in text
    else {
      parts.push({
        type: "text",
        text: `[Attached file: ${att.url} (${att.mimeType})]`,
      });
    }
  }

  return parts.length === 1 && parts[0].type === "text" ? text : parts;
}

/* ═══════════════════════════════════════════════════════════════
   Router
   ═══════════════════════════════════════════════════════════════ */

const allTaskTypeIds = ALL_TASK_TYPES.map((t) => t.id);
const taskTypeEnum = z.enum([
  "general",
  ...allTaskTypeIds,
] as [string, ...string[]]);

const attachmentSchema = z.object({
  url: z.string().url(),
  mimeType: z.string(),
  filename: z.string().optional(),
});

import { list, getById, insert, update, remove, count } from "../_core/firestore-db";

/* ═══════════════════════════════════════════════════════════════
   Autonomous Admin Tool Registry
   Enables AI to control, manage, and execute all administrative tools
   ═══════════════════════════════════════════════════════════════ */

export interface ExecutedAdminAction {
  tool: string;
  action: string;
  status: "success" | "failed";
  summary: string;
  summaryAr: string;
  data?: any;
  link?: string;
}

export const adminToolRegistry = {
  async getDashboardSummary() {
    const [
      totalBookings,
      pendingBookings,
      totalOffers,
      activeOffers,
      totalReviews,
      pendingReviews,
      totalMessages,
      newMessages,
      totalPosts,
      totalDestinations,
    ] = await Promise.all([
      count("bookings").catch(() => 0),
      count("bookings", [["status", "==", "pending"]]).catch(() => 0),
      count("offers").catch(() => 0),
      count("offers", [["isActive", "==", "active"]]).catch(() => 0),
      count("reviews").catch(() => 0),
      count("reviews", [["isApproved", "==", "pending"]]).catch(() => 0),
      count("contactMessages").catch(() => 0),
      count("contactMessages", [["status", "==", "new"]]).catch(() => 0),
      count("blogPosts").catch(() => 0),
      count("destinations").catch(() => 0),
    ]);

    return {
      totalBookings,
      pendingBookings,
      totalOffers,
      activeOffers,
      totalReviews,
      pendingReviews,
      totalMessages,
      newMessages,
      totalPosts,
      totalDestinations,
    };
  },

  async manageBookings(action: string, params: any = {}) {
    if (action === "list") {
      const where: any[] = [];
      if (params.status) where.push(["status", "==", params.status]);
      const items = await list("bookings", {
        where: where.length ? where : undefined,
        orderBy: [["createdAt", "desc"]],
        limit: params.limit || 10,
      });
      return { items, count: items.length };
    }
    if (action === "updateStatus") {
      const id = Number(params.id);
      const updated = await update("bookings", id, { status: params.status });
      return { id, status: params.status, updated };
    }
    if (action === "updatePayment") {
      const id = Number(params.id);
      const updated = await update("bookings", id, { paymentStatus: params.paymentStatus });
      return { id, paymentStatus: params.paymentStatus, updated };
    }
    if (action === "get") {
      const item = await getById("bookings", Number(params.id));
      return { item };
    }
    throw new Error(`Unknown booking action: ${action}`);
  },

  async manageOffers(action: string, params: any = {}) {
    if (action === "list") {
      const items = await list("offers", {
        orderBy: [["createdAt", "desc"]],
        limit: params.limit || 10,
      });
      return { items, count: items.length };
    }
    if (action === "create") {
      const now = Date.now();
      const durationDays = Number(params.durationDays) || 30;
      const record = await insert("offers", {
        title: params.title || "عرض سياحي فاخر",
        description: params.description || "باقة سفر استثنائية من ڤانير جروب تشمل أرقى الخدمات الفاخرة والطيران والإقامة.",
        discountType: params.discountType || "percentage",
        discountValue: String(params.discountValue || "20"),
        promoCode: (params.promoCode || `VANIR${Math.floor(100 + Math.random() * 900)}`).toUpperCase(),
        startDate: params.startDate || now,
        endDate: params.endDate || (now + durationDays * 24 * 60 * 60 * 1000),
        category: params.category || "luxury",
        destination: params.destination || "مصر - القاهرة والأقصر",
        imageUrl: params.imageUrl || "/images/hero-egyptian.jpg",
        totalSpots: Number(params.totalSpots) || 25,
        bookedSpots: 0,
        isActive: "active",
        badgeText: params.badgeText || "عرض حصري",
        badgeColor: params.badgeColor || "#D4A853",
      });
      return { created: record };
    }
    if (action === "toggle") {
      const current = await getById<any>("offers", Number(params.id));
      const nextStatus = current?.isActive === "active" ? "inactive" : "active";
      const updated = await update("offers", Number(params.id), { isActive: nextStatus });
      return { id: params.id, newStatus: nextStatus, updated };
    }
    if (action === "delete") {
      await remove("offers", Number(params.id));
      return { deletedId: params.id };
    }
    throw new Error(`Unknown offer action: ${action}`);
  },

  async manageReviews(action: string, params: any = {}) {
    if (action === "list") {
      const where: any[] = [];
      if (params.status) where.push(["isApproved", "==", params.status]);
      const items = await list("reviews", {
        where: where.length ? where : undefined,
        orderBy: [["createdAt", "desc"]],
        limit: params.limit || 10,
      });
      return { items, count: items.length };
    }
    if (action === "approve") {
      const updated = await update("reviews", Number(params.id), { isApproved: "approved" });
      return { id: params.id, updated };
    }
    if (action === "reject") {
      const updated = await update("reviews", Number(params.id), { isApproved: "rejected" });
      return { id: params.id, updated };
    }
    if (action === "reply") {
      const reply = params.reply || "نشكركم جزيل الشكر على ثقتكم الغالية في ڤانير جروب. نسعد دوماً بتقديم تجربة سفر استثنائية تفوق توقعاتكم.";
      const updated = await update("reviews", Number(params.id), {
        adminReply: reply,
        adminReplyAt: new Date(),
        isApproved: "approved",
      });
      return { id: params.id, reply, updated };
    }
    if (action === "approveAllPending") {
      const pending = await list<any>("reviews", {
        where: [["isApproved", "==", "pending"]],
        limit: 25,
      });
      const defaultReply = "خالص شكر وتقدير فريق ڤانير جروب لاختياركم خدماتنا الفاخرة. نتطلع لاستقبالكم مجدداً في رحلات قادمة.";
      const approvedIds = [];
      for (const r of pending) {
        if (r.id) {
          await update("reviews", r.id, {
            isApproved: "approved",
            adminReply: r.adminReply || defaultReply,
            adminReplyAt: new Date(),
          });
          approvedIds.push(r.id);
        }
      }
      return { approvedCount: approvedIds.length, ids: approvedIds };
    }
    throw new Error(`Unknown review action: ${action}`);
  },

  async manageMessages(action: string, params: any = {}) {
    if (action === "list") {
      const where: any[] = [];
      if (params.status) where.push(["status", "==", params.status]);
      const items = await list("contactMessages", {
        where: where.length ? where : undefined,
        orderBy: [["createdAt", "desc"]],
        limit: params.limit || 10,
      });
      return { items, count: items.length };
    }
    if (action === "markStatus") {
      const updated = await update("contactMessages", Number(params.id), { status: params.status });
      return { id: params.id, status: params.status, updated };
    }
    if (action === "addNote") {
      const updated = await update("contactMessages", Number(params.id), {
        adminNotes: params.notes,
        status: "replied",
      });
      return { id: params.id, notes: params.notes, updated };
    }
    throw new Error(`Unknown message action: ${action}`);
  },

  async manageBlog(action: string, params: any = {}) {
    if (action === "list") {
      const items = await list("blogPosts", {
        orderBy: [["createdAt", "desc"]],
        limit: params.limit || 10,
      });
      return { items, count: items.length };
    }
    if (action === "create") {
      const title = params.title || "دليل السفر الملكي الفاخر مع ڤانير جروب";
      const slugRaw = (params.slug || title.toLowerCase().replace(/[\s\W-]+/g, "-")).slice(0, 80);
      const slug = `${slugRaw}-${Date.now().toString().slice(-4)}`;
      const content = params.content || `# ${title}\n\nتعتبر هذه الرحلة تجربة استثنائية تجمع بين التراث والتنظيم الدقيق والرفاهية المطلقة.\n\n## أهم المحطات والتجارب الفاخرة\n- استقبال كبار الشخصيات من مدرج الطائرة.\n- إقامة في أرقى الأجنحة التاريخية الفاخرة المطلة على النيل والأهرامات.\n- جولات خاصة حصرية بعد ساعات الإغلاق بقيادة كبار علماء الآثار.\n\nاحجز رحلتك القادمة الآن واستمتع بخدمات الكونسيرج الملكية مع ڤانير جروب.`;
      
      const record = await insert("blogPosts", {
        title,
        slug,
        excerpt: params.excerpt || params.metaDescription || "استكشف أسرار الرفاهية والرحلات الملكية الخاصة مع نخبة خبراء السياحة في ڤانير جروب.",
        content,
        category: params.category || "Luxury Travel",
        metaTitle: params.metaTitle || `${title} | Vanir Group`,
        metaDescription: params.metaDescription || "دليل السفر الحصري وتجارب الرفاهية من ڤانير جروب.",
        metaKeywords: params.metaKeywords || "سياحة فاخرة, حجز طيران خاص, رحلات مصر الفاخرة, فنادق 5 نجوم",
        coverImageUrl: params.coverImageUrl || "/images/hero-egyptian.jpg",
        status: params.status || "published",
        authorName: "Vanir Group Executive Desk",
        readingTime: Number(params.readingTime) || 5,
        viewCount: 0,
        publishedAt: new Date(),
      });
      return { created: record };
    }
    if (action === "publish") {
      const updated = await update("blogPosts", Number(params.id), {
        status: "published",
        publishedAt: new Date(),
      });
      return { id: params.id, updated };
    }
    if (action === "delete") {
      await remove("blogPosts", Number(params.id));
      return { deletedId: params.id };
    }
    throw new Error(`Unknown blog action: ${action}`);
  },

  async manageDestinations(action: string, params: any = {}) {
    if (action === "list") {
      const items = await list("destinations", {
        orderBy: [["createdAt", "desc"]],
        limit: params.limit || 15,
      });
      return { items, count: items.length };
    }
    if (action === "create") {
      const record = await insert("destinations", {
        name: params.name || "وجهة فاخرة جديدة",
        description: params.description || "تجربة سفر نخبوية مصممة خصيصاً للمسافرين المميزين.",
        location: params.location || "مصر",
        pricePerPerson: String(params.pricePerPerson || "1800"),
        rating: "5.0",
        imageUrl: params.imageUrl || "/images/destinations/egypt-pyramids.png",
        highlights: params.highlights || "طيران خاص, إقامة 5 نجوم, استقبال VIP",
        isActive: "active",
      });
      return { created: record };
    }
    if (action === "toggle") {
      const current = await getById<any>("destinations", Number(params.id));
      const nextStatus = current?.isActive === "active" ? "inactive" : "active";
      const updated = await update("destinations", Number(params.id), { isActive: nextStatus });
      return { id: params.id, newStatus: nextStatus, updated };
    }
    throw new Error(`Unknown destination action: ${action}`);
  },

  async manageGallery(action: string, params: any = {}) {
    if (action === "list") {
      const items = await list("galleryItems", {
        orderBy: [["createdAt", "desc"]],
        limit: params.limit || 20,
      });
      return { items, count: items.length };
    }
    if (action === "add") {
      const record = await insert("galleryItems", {
        imageUrl: params.imageUrl || "/images/hero-egyptian.jpg",
        title: params.title || "مشهد سياحي فاخر",
        titleAr: params.titleAr || "مشهد سياحي فاخر",
        category: params.category || "Hotels",
        categoryAr: params.categoryAr || "فنادق ومنتجعات",
        location: params.location || "Cairo, Egypt",
        locationAr: params.locationAr || "القاهرة، مصر",
        featured: params.featured || "yes",
        aspect: params.aspect || "landscape",
        isvisible: "visible",
        sortOrder: 0,
      });
      return { created: record };
    }
    if (action === "delete") {
      await remove("galleryItems", Number(params.id));
      return { deletedId: params.id };
    }
    throw new Error(`Unknown gallery action: ${action}`);
  },

  async manageSettings(action: string, params: any = {}) {
    if (action === "list" || action === "get") {
      const items = await list("siteSettings", { limit: 50 });
      return { items };
    }
    if (action === "update") {
      const items = await list<any>("siteSettings", {
        where: [["settingKey", "==", params.settingKey]],
        limit: 1,
      });
      if (items.length > 0 && items[0].id) {
        const updated = await update("siteSettings", items[0].id, {
          settingValue: params.settingValue,
        });
        return { updated };
      } else {
        const created = await insert("siteSettings", {
          category: params.category || "general",
          settingKey: params.settingKey,
          settingValue: params.settingValue,
        });
        return { created };
      }
    }
    throw new Error(`Unknown settings action: ${action}`);
  },
};

/**
 * Intelligent Intent Analyzer for Natural Language Admin Commands
 */
async function analyzeAndExecuteAdminIntent(query: string): Promise<ExecutedAdminAction | null> {
  const q = query.trim().toLowerCase();

  // 1. Dashboard summary / stats
  if (
    q.includes("ملخص") ||
    q.includes("احصائيات") ||
    q.includes("تقرير اليوم") ||
    q.includes("نشاط الموقع") ||
    q.includes("dashboard") ||
    q.includes("stats") ||
    q.includes("overview")
  ) {
    const data = await adminToolRegistry.getDashboardSummary();
    return {
      tool: "dashboard",
      action: "getDashboardSummary",
      status: "success",
      summary: "Live executive dashboard metrics fetched successfully.",
      summaryAr: `تم سحب ملخص الإحصائيات الحي: ${data.totalBookings} حجز (${data.pendingBookings} معلق)، ${data.totalOffers} عروض (${data.activeOffers} نشط)، ${data.totalReviews} تقييم (${data.pendingReviews} معلق)، ${data.newMessages} رسائل جديدة.`,
      data,
      link: "/admin/dashboard",
    };
  }

  // 2. Bookings
  if (q.includes("حجز") || q.includes("حجوزات") || q.includes("booking")) {
    const idMatch = q.match(/(\d+)/);
    const id = idMatch ? Number(idMatch[1]) : undefined;

    if ((q.includes("اكد") || q.includes("تأكيد") || q.includes("وافق") || q.includes("confirm")) && id) {
      const data = await adminToolRegistry.manageBookings("updateStatus", { id, status: "confirmed" });
      return {
        tool: "bookings",
        action: "confirmBooking",
        status: "success",
        summary: `Booking #${id} confirmed.`,
        summaryAr: `تم تأكيد الحجز رقم #${id} بنجاح في قاعدة البيانات.`,
        data,
        link: "/admin/bookings",
      };
    }

    if ((q.includes("الغاء") || q.includes("إلغاء") || q.includes("cancel")) && id) {
      const data = await adminToolRegistry.manageBookings("updateStatus", { id, status: "cancelled" });
      return {
        tool: "bookings",
        action: "cancelBooking",
        status: "success",
        summary: `Booking #${id} cancelled.`,
        summaryAr: `تم إلغاء الحجز رقم #${id} بنجاح.`,
        data,
        link: "/admin/bookings",
      };
    }

    if (q.includes("معلق") || q.includes("معلقة") || q.includes("اعرض") || q.includes("عرض") || q.includes("list")) {
      const data = await adminToolRegistry.manageBookings("list", { status: q.includes("معلق") ? "pending" : undefined, limit: 5 });
      return {
        tool: "bookings",
        action: "listBookings",
        status: "success",
        summary: `Retrieved ${data.count} bookings.`,
        summaryAr: `تم جلب ${data.count} حجز من قاعدة البيانات بنجاح.`,
        data,
        link: "/admin/bookings",
      };
    }
  }

  // 3. Offers
  if (q.includes("عرض") || q.includes("عروض") || q.includes("باقة") || q.includes("باقات") || q.includes("offer")) {
    if (q.includes("انشئ") || q.includes("أنشئ") || q.includes("اعمل") || q.includes("اضف") || q.includes("create") || q.includes("new")) {
      const discountMatch = q.match(/(\d+)%/);
      const discountValue = discountMatch ? discountMatch[1] : "20";
      const codeMatch = q.match(/كود\s+([A-Za-z0-9_-]+)/i) || q.match(/code\s+([A-Za-z0-9_-]+)/i);
      const promoCode = codeMatch ? codeMatch[1].toUpperCase() : `VIP${discountValue}`;

      const data = await adminToolRegistry.manageOffers("create", {
        title: query.length < 80 ? query.replace(/^(انشئ|أنشئ|اعمل|اضف|create)\s+/i, "") : "باقة سياحية ملكية حصرية",
        discountType: "percentage",
        discountValue,
        promoCode,
        category: "luxury",
        destination: "مصر - الأقصر وأسوان",
        badgeText: `خصم ${discountValue}%`,
      });

      return {
        tool: "offers",
        action: "createOffer",
        status: "success",
        summary: `Offer created with ${discountValue}% discount and promo code ${promoCode}.`,
        summaryAr: `تم إنشاء باقة العرض الفاخر بنجاح في قاعدة البيانات بخصم ${discountValue}% وكود (${promoCode}).`,
        data,
        link: "/admin/offers",
      };
    }

    if (q.includes("اعرض") || q.includes("قائمة") || q.includes("list")) {
      const data = await adminToolRegistry.manageOffers("list", { limit: 6 });
      return {
        tool: "offers",
        action: "listOffers",
        status: "success",
        summary: `Retrieved ${data.count} offers.`,
        summaryAr: `تم استعراض ${data.count} عروض نشطة في قاعدة البيانات.`,
        data,
        link: "/admin/offers",
      };
    }
  }

  // 4. Reviews
  if (q.includes("تقييم") || q.includes("تقييمات") || q.includes("review") || q.includes("reviews")) {
    if (q.includes("وافق على كل") || q.includes("اعتمد كل") || q.includes("المعلقة") || q.includes("approve all")) {
      const data = await adminToolRegistry.manageReviews("approveAllPending");
      return {
        tool: "reviews",
        action: "approveAllPending",
        status: "success",
        summary: `Approved ${data.approvedCount} pending reviews with official luxury thank-you response.`,
        summaryAr: `تمت الموافقة على جميع التقييمات المعلقة (${data.approvedCount} تقييم) وكتابة رد رسمي فاخر عليها تلقائياً.`,
        data,
        link: "/admin/reviews",
      };
    }

    const idMatch = q.match(/(\d+)/);
    const id = idMatch ? Number(idMatch[1]) : undefined;
    if ((q.includes("وافق") || q.includes("اعتمد") || q.includes("رد") || q.includes("approve")) && id) {
      const data = await adminToolRegistry.manageReviews("reply", { id });
      return {
        tool: "reviews",
        action: "replyReview",
        status: "success",
        summary: `Review #${id} approved and replied.`,
        summaryAr: `تمت الموافقة على التقييم رقم #${id} وإضافة رد كونسيرج فاخر من الإدارة.`,
        data,
        link: "/admin/reviews",
      };
    }

    if (q.includes("اعرض") || q.includes("المعلقة") || q.includes("list")) {
      const data = await adminToolRegistry.manageReviews("list", { status: "pending", limit: 5 });
      return {
        tool: "reviews",
        action: "listReviews",
        status: "success",
        summary: `Retrieved ${data.count} reviews.`,
        summaryAr: `تم استعراض ${data.count} تقييمات من قاعدة البيانات.`,
        data,
        link: "/admin/reviews",
      };
    }
  }

  // 5. Contact Messages
  if (q.includes("رسالة") || q.includes("رسائل") || q.includes("message") || q.includes("inbox") || q.includes("استفسار")) {
    if (q.includes("اعرض") || q.includes("جديدة") || q.includes("list")) {
      const data = await adminToolRegistry.manageMessages("list", { status: "new", limit: 5 });
      return {
        tool: "messages",
        action: "listMessages",
        status: "success",
        summary: `Retrieved ${data.count} messages.`,
        summaryAr: `تم جلب ${data.count} رسائل واستفسارات واردة من العملاء.`,
        data,
        link: "/admin/messages",
      };
    }
  }

  // 6. Blog post publishing
  if (q.includes("مقال") || q.includes("مدونة") || q.includes("blog") || q.includes("article")) {
    if (q.includes("انشر") || q.includes("اكتب") || q.includes("create") || q.includes("publish")) {
      const cleanTitle = query
        .replace(/^(انشر|اكتب|create|publish|أنشئ)\s+(مقال|مقالة|مقالاً|article|blog)?\s*(عن|حول|about)?\s*/i, "")
        .trim();
      const title = cleanTitle.length > 5 ? cleanTitle : "أسرار الفخامة الملكية والرحلات الخاصة مع ڤانير جروب";
      const data = await adminToolRegistry.manageBlog("create", {
        title,
        status: "published",
        category: "Luxury Travel",
      });

      return {
        tool: "blog",
        action: "publishPost",
        status: "success",
        summary: `Blog post "${title}" drafted and published live.`,
        summaryAr: `تم إنشاء ونشر المقال الفاخر ("${title}") في المدونة مباشرة مع إعدادات الـ SEO الكاملة.`,
        data,
        link: "/admin/blog",
      };
    }
  }

  return null;
}

export const aiCommandRouter = router({
  /**
   * Direct Executive Admin Action Trigger (Programmatic Tool Execution)
   */
  executeAdminAction: adminProcedure
    .input(
      z.object({
        tool: z.enum([
          "dashboard",
          "bookings",
          "offers",
          "reviews",
          "messages",
          "blog",
          "destinations",
          "gallery",
          "settings",
        ]),
        action: z.string(),
        params: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { tool, action, params = {} } = input;
      try {
        let resultData: any;
        let summary = "";
        let summaryAr = "";
        let link = "/admin";

        switch (tool) {
          case "dashboard":
            resultData = await adminToolRegistry.getDashboardSummary();
            summary = "Dashboard summary refreshed.";
            summaryAr = "تم سحب إحصائيات لوحة التحكم بنجاح.";
            link = "/admin/dashboard";
            break;
          case "bookings":
            resultData = await adminToolRegistry.manageBookings(action, params);
            summary = `Bookings action "${action}" executed.`;
            summaryAr = `تم تنفيذ إجراء الحجوزات (${action}) بنجاح.`;
            link = "/admin/bookings";
            break;
          case "offers":
            resultData = await adminToolRegistry.manageOffers(action, params);
            summary = `Offers action "${action}" executed.`;
            summaryAr = `تم تنفيذ إجراء العروض (${action}) بنجاح.`;
            link = "/admin/offers";
            break;
          case "reviews":
            resultData = await adminToolRegistry.manageReviews(action, params);
            summary = `Reviews action "${action}" executed.`;
            summaryAr = `تم تنفيذ إجراء التقييمات (${action}) بنجاح.`;
            link = "/admin/reviews";
            break;
          case "messages":
            resultData = await adminToolRegistry.manageMessages(action, params);
            summary = `Messages action "${action}" executed.`;
            summaryAr = `تم تنفيذ إجراء الرسائل (${action}) بنجاح.`;
            link = "/admin/messages";
            break;
          case "blog":
            resultData = await adminToolRegistry.manageBlog(action, params);
            summary = `Blog action "${action}" executed.`;
            summaryAr = `تم تنفيذ إجراء المدونة (${action}) بنجاح.`;
            link = "/admin/blog";
            break;
          case "destinations":
            resultData = await adminToolRegistry.manageDestinations(action, params);
            summary = `Destinations action "${action}" executed.`;
            summaryAr = `تم تنفيذ إجراء الوجهات (${action}) بنجاح.`;
            link = "/admin/destinations";
            break;
          case "gallery":
            resultData = await adminToolRegistry.manageGallery(action, params);
            summary = `Gallery action "${action}" executed.`;
            summaryAr = `تم تنفيذ إجراء المعرض (${action}) بنجاح.`;
            link = "/admin/gallery";
            break;
          case "settings":
            resultData = await adminToolRegistry.manageSettings(action, params);
            summary = `Settings action "${action}" executed.`;
            summaryAr = `تم تنفيذ إجراء الإعدادات (${action}) بنجاح.`;
            link = "/admin/settings";
            break;
          default:
            throw new Error(`Unsupported admin tool: ${tool}`);
        }

        return {
          success: true,
          tool,
          action,
          summary,
          summaryAr,
          data: resultData,
          link,
          executedAt: new Date().toISOString(),
        };
      } catch (err: any) {
        return {
          success: false,
          tool,
          action,
          summary: `Execution failed: ${err.message}`,
          summaryAr: `فشل التنفيذ: ${err.message}`,
          error: err.message,
          executedAt: new Date().toISOString(),
        };
      }
    }),

  /**
   * Upload a file for AI chat (admin only)
   */
  uploadFile: adminProcedure
    .input(
      z.object({
        fileData: z.string(), // base64
        filename: z.string(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const buffer = Buffer.from(input.fileData, "base64");
      const fileSize = buffer.length;

      // Max 10MB
      if (fileSize > 10 * 1024 * 1024) {
        throw new Error("File size exceeds 10MB limit");
      }

      const ext = input.filename.split(".").pop() || "bin";
      const randomSuffix = nanoid(8);
      const fileKey = `ai-command/${ctx.user.id}/${randomSuffix}.${ext}`;

      const { url } = await storagePut(fileKey, buffer, input.mimeType);

      return {
        url,
        fileKey,
        filename: input.filename,
        mimeType: input.mimeType,
        fileSize,
      };
    }),

  /**
   * Main AI chat - with Autonomous Admin Tool Execution
   */
  chat: adminProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(["system", "user", "assistant"]),
            content: z.string(),
            attachments: z.array(attachmentSchema).optional(),
          })
        ),
        taskType: taskTypeEnum.default("general"),
      })
    )
    .mutation(async ({ input }) => {
      const lastUserMsg = [...input.messages].reverse().find((m) => m.role === "user");
      const userText = lastUserMsg?.content || "";

      // Check if this is an administrative action command
      let executedAction: ExecutedAdminAction | null = null;
      try {
        executedAction = await analyzeAndExecuteAdminIntent(userText);
      } catch (err) {
        console.error("[aiCommand] Intent execution error:", err);
      }

      const systemPrompt = TASK_PROMPTS[input.taskType] || TASK_PROMPTS.general;

      const llmMessages: Message[] = [
        { role: "system", content: systemPrompt },
        ...input.messages.map((m) => ({
          role: m.role as "system" | "user" | "assistant",
          content: buildMessageContent(m.content, m.attachments) as any,
        })),
      ];

      // If an action was executed, inject context into the conversation
      if (executedAction) {
        llmMessages.push({
          role: "system",
          content: `[EXECUTIVE ACTION EXECUTED]: The administrator's request triggered a database action. Tool: ${executedAction.tool}, Action: ${executedAction.action}, Status: ${executedAction.status}, Details: ${executedAction.summaryAr}. Please incorporate this successful execution confirmation gracefully in your luxury response.`,
        });
      }

      const result = await invokeLLM({ messages: llmMessages });

      const content = result.choices?.[0]?.message?.content;
      let responseText =
        typeof content === "string"
          ? content
          : Array.isArray(content)
            ? content
                .filter((c): c is { type: "text"; text: string } => c.type === "text")
                .map((c) => c.text)
                .join("\n")
            : "No response generated.";

      // Ensure confirmation is visible
      if (executedAction && !responseText.includes(executedAction.summaryAr)) {
        responseText = `✅ **[تم تنفيذ الإجراء بنجاح]**: ${executedAction.summaryAr}\n\n${responseText}`;
      }

      return {
        response: responseText,
        usage: result.usage || null,
        model: result.model || "unknown",
        executedAction,
      };
    }),

  /**
   * Quick task execution - one-shot tasks with structured output
   */
  executeTask: adminProcedure
    .input(
      z.object({
        taskType: z.enum(allTaskTypeIds as [string, ...string[]]),
        prompt: z.string().min(1),
        context: z.string().optional(),
        language: z.enum(["ar", "en", "auto"]).default("auto"),
        attachments: z.array(attachmentSchema).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const systemPrompt = TASK_PROMPTS[input.taskType] || TASK_PROMPTS.general || VANIR_SYSTEM_PROMPT;

      let userPrompt = input.prompt;
      if (input.context) {
        userPrompt += `\n\nAdditional context:\n${input.context}`;
      }
      if (input.language !== "auto") {
        userPrompt += `\n\nPlease respond in ${input.language === "ar" ? "Arabic" : "English"}.`;
      }

      const messageContent = buildMessageContent(userPrompt, input.attachments);

      const result = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: messageContent as any },
        ],
      });

      const content = result.choices?.[0]?.message?.content;
      const responseText =
        typeof content === "string"
          ? content
          : Array.isArray(content)
            ? content
                .filter((c): c is { type: "text"; text: string } => c.type === "text")
                .map((c) => c.text)
                .join("\n")
            : "No response generated.";

      return {
        result: responseText,
        taskType: input.taskType,
        usage: result.usage || null,
        model: result.model || "unknown",
        executedAt: new Date().toISOString(),
      };
    }),

  /**
   * Get available task types and their descriptions
   */
  getTaskTypes: adminProcedure.query(() => {
    return ALL_TASK_TYPES;
  }),

  /**
   * Public AI Concierge Chat for Website Visitors
   */
  publicChat: publicProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(["system", "user", "assistant"]),
            content: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const systemPrompt = `${VANIR_SYSTEM_PROMPT}

You are the official 24/7 Luxury Travel Concierge for Vanir Travel Group.
Your primary and default language is ENGLISH. Always respond in elegant, warm, and sophisticated English (unless the user explicitly speaks Arabic).
Your mission is to welcome visitors warmly, provide exquisite recommendations for Egyptian luxury travel, private tours, Nile cruises, VIP airport fast track, private jets, and 5-star hotel accommodations.
Guide them to contact our concierge team at /contact or make a booking at /booking when appropriate.`;

      const llmMessages: Message[] = [
        { role: "system", content: systemPrompt },
        ...input.messages.map((m) => ({
          role: m.role as "system" | "user" | "assistant",
          content: m.content,
        })),
      ];

      const result = await invokeLLM({ messages: llmMessages });

      const content = result.choices?.[0]?.message?.content;
      const responseText =
        typeof content === "string"
          ? content
          : Array.isArray(content)
            ? content
                .filter((c): c is { type: "text"; text: string } => c.type === "text")
                .map((c) => c.text)
                .join("\n")
            : "Welcome to Vanir Travel Group. It is our absolute pleasure to assist you. Please feel free to explore our luxury journeys or contact our VIP concierge directly at /contact.";

      return {
        response: responseText,
        model: result.model || "vanir-ai",
      };
    }),

  /**
   * Get Active AI API Configuration
   */
  getApiConfig: adminProcedure.query(async () => {
    let saved = await getSettingValue("ai", "api_config").catch(() => null);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        updateActiveAiConfig(parsed);
      } catch (e) {}
    }
    const current = getActiveAiConfig();
    const maskedKey = current.apiKey
      ? `${current.apiKey.slice(0, 7)}••••••••••••••••${current.apiKey.slice(-5)}`
      : "Not Configured";

    return {
      apiUrl: current.apiUrl,
      model: current.model,
      provider: current.provider,
      maskedKey,
      hasKey: Boolean(current.apiKey),
    };
  }),

  /**
   * Save Active AI API Configuration
   */
  saveApiConfig: adminProcedure
    .input(
      z.object({
        apiKey: z.string().optional(),
        apiUrl: z.string().optional(),
        model: z.string().optional(),
        provider: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const updates: Record<string, string> = {};
      if (input.apiKey && input.apiKey.trim().length > 0 && !input.apiKey.includes("••••")) {
        updates.apiKey = input.apiKey.trim();
      }
      if (input.apiUrl && input.apiUrl.trim().length > 0) {
        updates.apiUrl = input.apiUrl.trim();
      }
      if (input.model && input.model.trim().length > 0) {
        updates.model = input.model.trim();
      }
      if (input.provider) {
        updates.provider = input.provider.trim();
      }

      const updated = updateActiveAiConfig(updates);
      await setSettingValue("ai", "api_config", JSON.stringify(updated)).catch((e) => {
        console.warn("[aiCommand] Failed to persist api_config in siteSettings:", e);
      });

      return {
        success: true,
        message: "AI API settings saved successfully",
        config: {
          apiUrl: updated.apiUrl,
          model: updated.model,
          provider: updated.provider,
          hasKey: Boolean(updated.apiKey),
        },
      };
    }),

  /**
   * Test AI API Connection
   */
  testApiConnection: adminProcedure
    .input(
      z
        .object({
          apiKey: z.string().optional(),
          apiUrl: z.string().optional(),
          model: z.string().optional(),
          provider: z.string().optional(),
        })
        .optional()
    )
    .mutation(async ({ input }) => {
      const key =
        input?.apiKey && !input.apiKey.includes("••••")
          ? input.apiKey
          : undefined;
      return await testAiConnection(key, input?.apiUrl, input?.model, input?.provider);
    }),
});
