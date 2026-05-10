import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import {
  createJournalEntry,
  getJournalEntries,
  JournalEntry,
} from "@/services/journalEntries";
import { useToast } from "@/hooks/use-toast";

export const useJournalEntries = () => {
  return useQuery({
    queryKey: queryKeys.journalEntries,
    queryFn: async () => {
      return getJournalEntries();
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export const useCreateJournalEntry = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (entry: JournalEntry) => {
      return createJournalEntry(entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.journalEntries,
      });

      toast({
        title: "تم بنجاح",
        description: "تم إنشاء القيد اليومي بنجاح",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إنشاء القيد اليومي",
        variant: "destructive",
      });
    },
  });
};
