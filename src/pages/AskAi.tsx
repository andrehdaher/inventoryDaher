import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import apiClient from "@/lib/axios";
import {
  AlertCircle,
  BrainCircuit,
  Clipboard,
  Loader2,
  MessageSquareText,
  RotateCcw,
  Send,
  Sparkles,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";

interface ChatMessage {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
}

const suggestedQuestions = [
  "ما هي المنتجات التي قاربت على النفاد؟",
  "ما إجمالي المبيعات لهذا الشهر؟",
  "من هم العملاء أصحاب أعلى مديونية؟",
  "ما أكثر مستودع يحتوي قيمة بضاعة؟",
  "اعطني ملخصاً عن الأرباح والمصاريف",
];

const getAnswerFromResponse = (data: any) => {
  if (typeof data === "string") return data;
  return data?.answer || data?.data?.answer || data?.message || "";
};

const formatDateTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("ar-SY", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AskAi() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const lastAnswer = messages[0]?.answer || "";

  const canSubmit = useMemo(
    () => question.trim().length > 0 && !loading,
    [loading, question],
  );

  const askAI = async () => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || loading) return;

    try {
      setLoading(true);
      setError("");

      const res = await apiClient.post("/api/ai/ask", {
        question: trimmedQuestion,
      });
      const answer = getAnswerFromResponse(res.data);

      if (!answer) {
        throw new Error("لم يرجع الذكاء الاصطناعي إجابة واضحة.");
      }

      setMessages((current) => [
        {
          id: `${Date.now()}`,
          question: trimmedQuestion,
          answer,
          createdAt: new Date().toISOString(),
        },
        ...current,
      ]);
      setQuestion("");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "حدث خطأ أثناء الاتصال بخدمة الذكاء الاصطناعي.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const copyAnswer = async (answer: string) => {
    if (!answer) return;

    try {
      await navigator.clipboard.writeText(answer);
      toast({
        title: "تم النسخ",
        description: "تم نسخ الإجابة إلى الحافظة.",
      });
    } catch {
      toast({
        title: "تعذر النسخ",
        description: "لم يتمكن المتصفح من نسخ الإجابة.",
        variant: "destructive",
      });
    }
  };

  const applySuggestion = (value: string) => {
    setQuestion(value);
    textareaRef.current?.focus();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-7 w-7 text-primary" />
              <h1 className="text-3xl font-bold">اسأل الذكاء الاصطناعي</h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              اطرح سؤالاً عن بيانات النظام واحصل على إجابة مباشرة.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="gap-1">
              <MessageSquareText className="h-3.5 w-3.5" />
              {messages.length} محادثات
            </Badge>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                setMessages([]);
                setError("");
              }}
              disabled={messages.length === 0 && !error}
            >
              <RotateCcw className="h-4 w-4" />
              مسح
            </Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_1.7fr]">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>السؤال</CardTitle>
              <CardDescription>اكتب السؤال أو اختر أحد الاقتراحات.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                ref={textareaRef}
                className="min-h-40 resize-y leading-7"
                placeholder="مثال: ما المنتجات التي تحقق أعلى ربح؟"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                    event.preventDefault();
                    askAI();
                  }
                }}
              />

              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((item) => (
                  <Button
                    key={item}
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => applySuggestion(item)}
                  >
                    {item}
                  </Button>
                ))}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  className="gap-2"
                  onClick={askAI}
                  disabled={!canSubmit}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {loading ? "جاري الإجابة" : "إرسال السؤال"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setQuestion("")}
                  disabled={!question || loading}
                >
                  تفريغ السؤال
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>تعذر إرسال السؤال</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            {loading && (
              <Card className="border-primary/30">
                <CardContent className="flex items-center gap-3 py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">
                    يتم تجهيز الإجابة الآن...
                  </span>
                </CardContent>
              </Card>
            )}

            {messages.length === 0 && !loading ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <CardTitle>لا توجد محادثات بعد</CardTitle>
                  </div>
                  <CardDescription>
                    ستظهر الإجابات هنا بعد إرسال السؤال الأول.
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              messages.map((message, index) => (
                <Card
                  key={message.id}
                  className={index === 0 ? "border-primary/30" : ""}
                >
                  <CardHeader className="space-y-3">
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {message.question}
                        </CardTitle>
                        <CardDescription>
                          {formatDateTime(message.createdAt)}
                        </CardDescription>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => copyAnswer(message.answer)}
                      >
                        <Clipboard className="h-4 w-4" />
                        نسخ
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap rounded-md border bg-muted/20 p-4 text-sm leading-7">
                      {message.answer}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {lastAnswer && (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() => copyAnswer(lastAnswer)}
                >
                  <Clipboard className="h-4 w-4" />
                  نسخ آخر إجابة
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
