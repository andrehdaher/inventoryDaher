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
  data?: AiReportEntry | null;
  entryId?: string | null;
  updatedAt?: string;
}

interface AiReportEnvelope {
  data?: AiReportEntry | null;
  entryId?: string | null;
  updatedAt?: string;
}

type AiReportApiResponse = AiReportEntry | AiReportEnvelope | null | undefined;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const normalizeAiReport = (
  payload: AiReportApiResponse,
): AiReportEntry | null => {
  if (!isObject(payload)) return null;

  const envelope = payload as AiReportEnvelope;
  const nestedReport = isObject(envelope.data) ? envelope.data : null;
  const report = nestedReport || (payload as AiReportEntry);

  return {
    ...report,
    entryId: report.entryId ?? envelope.entryId ?? null,
    updatedAt: report.updatedAt ?? envelope.updatedAt,
  };
};

export default async function getAiReport(): Promise<AiReportResponse> {
  try {
    const res = await apiClient.get<AiReportApiResponse>("/api/ai/latest");
    console.log("Response from AI report API:", res.data);
    const report = normalizeAiReport(res.data);

    return {
      data: report,
      entryId: report?.entryId ?? null,
      updatedAt: report?.updatedAt,
    };
  } catch (err) {
    console.error("خطأ في جلب التقرير:", err);
    throw new Error("خطأ أثناء جلب التقرير");
  }
}
