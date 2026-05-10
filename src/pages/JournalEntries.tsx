import { DataTable } from "@/components/dashboard/DataTable";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loading from "@/components/ui/custom/Loading";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { JournalEntry } from "@/services/journalEntries";
import { BookText, Scale, Wallet } from "lucide-react";
import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const entryColumns = [
  { key: "id", label: "المعرف", hidden: true },
  { key: "date", label: "التاريخ", sortable: true },
  { key: "description", label: "الوصف", sortable: true },
  { key: "referenceType", label: "نوع المرجع", sortable: true },
  { key: "referenceId", label: "المرجع", sortable: true },
  { key: "linesCount", label: "عدد الأسطر", sortable: true },
  { key: "totalDebit", label: "إجمالي المدين", sortable: true },
  { key: "totalCredit", label: "إجمالي الدائن", sortable: true },
];

const lineColumns = [
  { key: "entryDate", label: "التاريخ", sortable: true },
  { key: "entryDescription", label: "الوصف", sortable: true },
  { key: "accountName", label: "الحساب", sortable: true },
  { key: "debit", label: "مدين", sortable: true },
  { key: "credit", label: "دائن", sortable: true },
  { key: "note", label: "ملاحظات", sortable: true },
];

const normalizeEntries = (data: any): JournalEntry[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.entries)) return data.entries;
  if (Array.isArray(data?.journalEntries)) return data.journalEntries;
  return [];
};

export default function JournalEntries() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data, isLoading } = useJournalEntries();
  const entries = normalizeEntries(data);
  const focusEntryId = location.state?.focusEntryId;
  const focusReferenceId = location.state?.focusReferenceId;
  const focusDate = location.state?.focusDate;

  const summarizedEntries = useMemo(
    () =>
      entries.map((entry) => {
        const totalDebit = entry.lines?.reduce(
          (sum, line) => sum + Number(line.debit || 0),
          0,
        );
        const totalCredit = entry.lines?.reduce(
          (sum, line) => sum + Number(line.credit || 0),
          0,
        );

        return {
          ...entry,
          linesCount: entry.lines?.length || 0,
          totalDebit,
          totalCredit,
        };
      }),
    [entries],
  );

  const isFocusedEntry = (entry: any) => {
    if (focusEntryId && String(entry.id) === String(focusEntryId)) {
      return true;
    }

    if (
      focusReferenceId &&
      String(entry.referenceId) === String(focusReferenceId) &&
      String(entry.date) === String(focusDate)
    ) {
      return true;
    }

    return false;
  };

  const prioritizedEntries = useMemo(() => {
    if (!focusEntryId && !focusReferenceId) {
      return summarizedEntries;
    }

    const focusedEntries = summarizedEntries.filter((entry) =>
      isFocusedEntry(entry),
    );
    const otherEntries = summarizedEntries.filter(
      (entry) => !isFocusedEntry(entry),
    );

    return [...focusedEntries, ...otherEntries];
  }, [focusEntryId, focusReferenceId, summarizedEntries]);

  const flattenedLines = useMemo(
    () =>
      entries.flatMap((entry) =>
        (entry.lines || []).map((line) => ({
          entryId: entry.id,
          referenceId: entry.referenceId,
          entryDate: entry.date,
          entryDescription: entry.description,
          accountName: line.accountName || line.accountId,
          debit: line.debit,
          credit: line.credit,
          note: line.note || "-",
        })),
      ),
    [entries],
  );

  const totalDebit = summarizedEntries.reduce(
    (sum, entry) => sum + Number(entry.totalDebit || 0),
    0,
  );
  const totalCredit = summarizedEntries.reduce(
    (sum, entry) => sum + Number(entry.totalCredit || 0),
    0,
  );
  const balancedEntries = summarizedEntries.filter(
    (entry) => Number(entry.totalDebit || 0) === Number(entry.totalCredit || 0),
  ).length;

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <div>
          <h1 className="text-3xl font-bold">القيود اليومية</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            مركز موحد لمراجعة القيود المحاسبية والخطوط المدينة والدائنة.
          </p>
        </div>

        {(focusEntryId || focusReferenceId) && (
          <Card className="border-primary/30">
            <CardContent className="flex flex-col gap-3 pt-6 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-muted-foreground">
                تم فتح هذه الصفحة من دفتر الأستاذ، وتم إبراز القيد المرتبط في
                الأعلى.
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  navigate("/journal-entries", { replace: true, state: null })
                }
              >
                إلغاء التحديد
              </Button>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <Loading />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <StatsCard
                title="عدد القيود"
                value={summarizedEntries.length}
                icon={BookText}
              />
              <StatsCard
                title="إجمالي المدين"
                value={totalDebit.toLocaleString("en-US")}
                icon={Wallet}
              />
              <StatsCard
                title="القيود المتوازنة"
                value={balancedEntries}
                icon={Scale}
                description={`من أصل ${summarizedEntries.length}`}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>سجل القيود</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  title=""
                  columns={entryColumns}
                  data={prioritizedEntries}
                  getRowClassName={(row) =>
                    isFocusedEntry(row) ? "bg-primary/5" : ""
                  }
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>سطور القيود</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  title=""
                  columns={lineColumns}
                  data={flattenedLines}
                  getRowClassName={(row) =>
                    (focusEntryId &&
                      String(row.entryId) === String(focusEntryId)) ||
                    (focusReferenceId &&
                      String(row.referenceId) === String(focusReferenceId) &&
                      String(row.entryDate) === String(focusDate))
                      ? "bg-primary/5"
                      : ""
                  }
                />
              </CardContent>
            </Card>

            {summarizedEntries.length > 0 && totalDebit !== totalCredit && (
              <Card>
                <CardContent className="pt-6 text-sm text-destructive">
                  يوجد عدم توازن في مجموع القيود: المدين{" "}
                  {totalDebit.toLocaleString("en-US")} مقابل الدائن{" "}
                  {totalCredit.toLocaleString("en-US")}.
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
