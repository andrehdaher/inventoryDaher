import { PDFDownloadLink } from "@react-pdf/renderer";
import PdfDocument from "./PdfDocument";

interface PdfDownloadButtonProps {
  fileName?: string;
  children: React.ReactNode;
  label?: string;
}

export default function PdfDownloadButton({
  fileName = "document.pdf",
  children,
  label = "تحميل PDF",
}: PdfDownloadButtonProps) {
  return (
    <PDFDownloadLink
      document={<PdfDocument>{children}</PdfDocument>}
      fileName={fileName}
    >
      {({ loading }) => (loading ? "جاري إنشاء الملف..." : label)}
    </PDFDownloadLink>
  );
}
