import { Document, Page, StyleSheet, Font } from "@react-pdf/renderer";
import React from "react";
import Amiri from "@/assets/fonts/Amiri-Regular.ttf";

// ✅ تسجيل الخط
Font.register({
  family: "Amiri",
  src: Amiri,
});

export default function PdfDocument({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {children}
      </Page>
    </Document>
  );
}

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontFamily: "Amiri",
  },
});
