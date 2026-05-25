import { useEffect } from "react";
import { useQuery , useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { queryKeys } from "@/lib/queryKeys";
import getAiReport, { AiReportResponse, refreshAiReport } from "@/services/ai";

export const useAiReport = () => {
  const query = useQuery<AiReportResponse, Error>({
    queryKey: queryKeys.aiReport,
    queryFn: getAiReport,
  });

  useEffect(() => {
    if (!query.error) return;

    toast({
      title: "خطأ",
      description: query.error.message || "حدث خطأ أثناء جلب التقرير",
      variant: "destructive",
    });
  }, [query.error]);

  return query;
};


export const useAiRefresh = () => {
  const mutation = useMutation<AiReportResponse, Error>({
    mutationFn: refreshAiReport,
  });

  return mutation;
  
}
