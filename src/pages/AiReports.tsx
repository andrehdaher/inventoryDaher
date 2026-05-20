import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAiReport } from "@/hooks/useAi";
import type { AiReportSection } from "@/services/ai";
import {
  BrainCircuit,
  CalendarClock,
  FileText,
  ListChecks,
  RefreshCw,
} from "lucide-react";
import { useMemo } from "react";

const formatDateTime = (value?: string) => {
  if (!value) return "غير متوفر";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("ar-SY", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizeText = (value?: string | null) => (value || "").trim();

const stripListMarker = (value: string) =>
  value.replace(/^\s*[-•]\s*/, "").trim();

const extractLines = (value?: string | null) =>
  (value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const areSameText = (first?: string | null, second?: string | null) =>
  normalizeText(first).replace(/:$/, "") ===
  normalizeText(second).replace(/:$/, "");

const uniqueLines = (lines: string[]) => {
  const seen = new Set<string>();

  return lines.filter((line) => {
    const normalized = line.replace(/:$/, "");
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
};

const getSectionTitle = (
  section: AiReportSection,
  index: number,
  reportTitle?: string,
) => {
  const title = normalizeText(section.title);

  if (
    title &&
    title.length <= 80 &&
    !title.includes("\n") &&
    !areSameText(title, reportTitle)
  ) {
    return title;
  }

  const firstContentLine = extractLines(section.content)[0];
  const firstItem = section.items?.find(Boolean);
  const generatedTitle = stripListMarker(firstContentLine || firstItem || "");

  if (generatedTitle) return generatedTitle.replace(/:$/, "");

  return `القسم ${index + 1}`;
};

const getSectionItems = (section: AiReportSection, sectionTitle: string) => {
  const sourceItems =
    section.items && section.items.length > 0
      ? section.items
      : extractLines(section.content);

  return uniqueLines(
    sourceItems.map(stripListMarker).filter((item) => item.length > 0),
  ).filter((item) => !areSameText(item, sectionTitle));
};

export default function AiReports() {
  const { data, isLoading, error, refetch, isFetching } = useAiReport();

  const report = data?.data ?? null;

  const summaryLines = useMemo(() => {
    const summary = normalizeText(report?.summary);
    if (summary) return extractLines(summary);

    return extractLines(report?.rawText).slice(0, 1);
  }, [report?.rawText, report?.summary]);

  const sections = useMemo(
    () =>
      [...(report?.sections || [])].sort(
        (a, b) =>
          (a.order ?? Number.MAX_SAFE_INTEGER) -
          (b.order ?? Number.MAX_SAFE_INTEGER),
      ),
    [report?.sections],
  );

  const rawText = useMemo(
    () =>
      normalizeText(report?.rawText) ||
      sections
        .map((section) => normalizeText(section.content))
        .filter(Boolean)
        .join("\n\n"),
    [report?.rawText, sections],
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary border-t-2" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>تعذر تحميل تقرير الذكاء الاصطناعي</CardTitle>
            <CardDescription>{error.message}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => refetch()}>
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (!report) {
    return (
      <DashboardLayout>
        <Card>
          <CardHeader>
            <CardTitle>لا يوجد تقرير متاح حالياً</CardTitle>
            <CardDescription>
              لم يتم العثور على بيانات لعرض تقرير الذكاء الاصطناعي.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => refetch()}>
              تحديث التقرير
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-6 w-6 text-primary" />
                <CardTitle>
                  {report.title || "تقرير الذكاء الاصطناعي"}
                </CardTitle>
              </div>
              <CardDescription>
                {summaryLines[0] ||
                  "تقرير منظم يعتمد على آخر تحليل مولد من النظام."}
              </CardDescription>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="gap-1">
                  <ListChecks className="h-3.5 w-3.5" />
                  {sections.length} أقسام
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <CalendarClock className="h-3.5 w-3.5" />
                  {formatDateTime(report.updatedAt || report.createdAt)}
                </Badge>
                {report.entryId && (
                  <Badge variant="secondary" dir="ltr">
                    Entry: {report.entryId}
                  </Badge>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
              />
              تحديث التقرير
            </Button>
          </CardHeader>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>الملخص التنفيذي</CardTitle>
              <CardDescription>
                أهم النقاط المستخرجة من التقرير بشكل سريع.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {summaryLines.length > 0 ? (
                <ul className="space-y-3 text-sm leading-7">
                  {summaryLines.map((line, index) => (
                    <li
                      key={`${line}-${index}`}
                      className="rounded-md border bg-muted/30 px-3 py-2"
                    >
                      {line}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  لا يوجد ملخص متاح لهذا التقرير.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>الأقسام المنظمة</CardTitle>
              <CardDescription>
                عرض مرتب لمحتوى التقرير بحسب الأقسام والعناصر المستخرجة.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sections.length > 0 ? (
                <div
                  className={
                    sections.length > 1
                      ? "grid gap-4 md:grid-cols-2"
                      : "space-y-4"
                  }
                >
                  {sections.map((section, index) => {
                    const sectionTitle = getSectionTitle(
                      section,
                      index,
                      report.title,
                    );
                    const items = getSectionItems(section, sectionTitle);
                    const contentLines = extractLines(section.content);
                    const shouldShowContent =
                      items.length === 0 && contentLines.length > 0;

                    return (
                      <div
                        key={`${sectionTitle}-${index}`}
                        className="rounded-md border bg-muted/10 p-4"
                      >
                        <div className="mb-4 space-y-1">
                          <h3 className="text-base font-semibold leading-7">
                            {sectionTitle}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {items.length > 0
                              ? `${items.length} عناصر مستخرجة`
                              : "نص القسم متاح بدون بنود منفصلة"}
                          </p>
                        </div>

                        {items.length > 0 && (
                          <ul className="space-y-2 text-sm leading-7">
                            {items.map((item, itemIndex) => (
                              <li
                                key={`${item}-${itemIndex}`}
                                className="rounded-md border bg-background px-3 py-2"
                              >
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}

                        {shouldShowContent && (
                          <div className="whitespace-pre-wrap rounded-md border bg-background px-3 py-3 text-sm leading-7">
                            {contentLines.join("\n")}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  لم يتم العثور على أقسام منظمة داخل التقرير.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>النص الخام</CardTitle>
            </div>
            <CardDescription>
              النسخة الكاملة كما عادت من خدمة الذكاء الاصطناعي.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[420px] overflow-auto rounded-md border bg-muted/20 p-4">
              <pre className="whitespace-pre-wrap break-words text-sm leading-7">
                {rawText || "لا يوجد نص خام متاح."}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
