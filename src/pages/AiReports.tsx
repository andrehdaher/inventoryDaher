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

const extractLines = (value?: string) =>
  (value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const getSectionTitle = (section: AiReportSection, index: number) => {
  const title = section.title?.trim();

  if (title && title.length <= 80 && !title.includes("\n")) {
    return title;
  }

  return `القسم ${index + 1}`;
};

export default function AiReports() {
  const { data, isLoading, error, refetch, isFetching } = useAiReport();

  const report = data?.data;

  const summaryLines = useMemo(
    () => extractLines(report?.summary || report?.rawText),
    [report?.rawText, report?.summary],
  );

  const sections = useMemo(
    () =>
      [...(report?.sections || [])].sort(
        (a, b) =>
          (a.order ?? Number.MAX_SAFE_INTEGER) -
          (b.order ?? Number.MAX_SAFE_INTEGER),
      ),
    [report?.sections],
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
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-6 w-6 text-primary" />
                <CardTitle>{report.title || "AI Report"}</CardTitle>
              </div>
              <CardDescription>
                تقرير منظم يعتمد على آخر تحليل مولد من النظام.
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
                  <Badge variant="secondary">Entry: {report.entryId}</Badge>
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
                <div className="grid gap-4 md:grid-cols-2">
                  {sections.map((section, index) => {
                    const items = (section.items || []).filter(Boolean);
                    const contentLines = extractLines(section.content);

                    return (
                      <Card key={`${getSectionTitle(section, index)}-${index}`}>
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg">
                            {getSectionTitle(section, index)}
                          </CardTitle>
                          <CardDescription>
                            {items.length} عناصر مستخرجة
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {items.length > 0 && (
                            <ul className="space-y-2 text-sm leading-6">
                              {items.map((item, itemIndex) => (
                                <li
                                  key={`${item}-${itemIndex}`}
                                  className="rounded-md border bg-muted/20 px-3 py-2"
                                >
                                  {item}
                                </li>
                              ))}
                            </ul>
                          )}

                          {contentLines.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground">
                                النص الكامل للقسم
                              </p>
                              <div className="whitespace-pre-wrap rounded-md border bg-background px-3 py-3 text-sm leading-7">
                                {contentLines.join("\n")}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
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
                {report.rawText || "لا يوجد نص خام متاح."}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
