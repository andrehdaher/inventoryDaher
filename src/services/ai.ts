import apiClient from "@/lib/axios";

export interface AiReportSection {
  title?: string;
  content?: string;
  items?: string[];
  order?: number;
}

export interface AiReportEntry {
  title?: string;
  summary?: string;
  rawText?: string;
  sections?: AiReportSection[];
  createdAt?: string;
  updatedAt?: string;
  entryId?: string | null;
}

export interface AiReportResponse {
  data?: AiReportEntry;
}

export default async function getAiReport(): Promise<AiReportResponse> {
  try {
    const res = await apiClient.get("/api/ai/latest");
    return res.data;
  } catch (err) {
    console.error("Ø®Ø·Ø£ ÙÙŠ Ø¬Ù„Ø¨ Ø§Ù„ØªÙ‚Ø±ÙŠØ±:", err);
    throw new Error("Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø¬Ù„Ø¨ Ø§Ù„ØªÙ‚Ø±ÙŠØ±");
  }
}
