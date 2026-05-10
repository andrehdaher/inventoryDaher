import apiClient from "@/lib/axios";

export interface JournalEntryLine {
  id?: string;
  accountId: string;
  accountName?: string;
  debit: number;
  credit: number;
  note?: string;
}

export interface JournalEntry {
  id?: string;
  date: string;
  description: string;
  referenceType?: string;
  referenceId?: string;
  createdBy?: string;
  lines: JournalEntryLine[];
}

export async function getJournalEntries() {
  try {
    const response = await apiClient.get("/api/journal-entries");
    return response.data;
  } catch (err) {
    console.error("خطأ أثناء جلب القيود اليومية:", err);
    throw new Error("خطأ أثناء جلب القيود اليومية");
  }
}

export async function createJournalEntry(entry: JournalEntry) {
  try {
    const response = await apiClient.post("/api/journal-entries/create", {
      journalEntry: entry,
    });
    return response.data;
  } catch (err) {
    console.error("خطأ أثناء إنشاء القيد اليومي:", err);
    throw new Error("خطأ أثناء إنشاء القيد اليومي");
  }
}
