import { useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { queryKeys } from "@/lib/queryKeys";
import getAiReport, { AiReportResponse } from "@/services/ai";

export const useAiReport = () => {
  return useQuery<AiReportResponse, Error>({
    queryKey: queryKeys.aiReport,
    queryFn: getAiReport,
    onError: (error: Error) => {
      toast({
        title: "Ø®Ø·Ø£",
        description: error.message || "Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø¬Ù„Ø¨ Ø§Ù„ØªÙ‚Ø±ÙŠØ±",
        variant: "destructive",
      });
    },
  });
};
