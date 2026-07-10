package com.hospital.reports.util;

// OpenPDF — explicit imports (no wildcard)
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

// Apache POI — explicit imports (no wildcard)
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import org.springframework.stereotype.Component;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Core export utility for the Reporting module.
 * Generates PDF (OpenPDF), Excel (Apache POI), and CSV byte arrays.
 *
 * NOTE: Font and Color are referred to by their FQN in the PDF section to
 * avoid ambiguity with org.apache.poi.ss.usermodel.Font / Color.
 */
@Component
public class ReportExporterUtil {

    // ─────────────────────────────────────────────
    //  PDF  (uses com.lowagie.text.Font by FQN)
    // ─────────────────────────────────────────────
    public byte[] exportToPdf(String title, String[] headers, List<String[]> rows) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4.rotate());
        PdfWriter.getInstance(document, out);
        document.open();

        // Title
        com.lowagie.text.Font titleFont =
                new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 16,
                        com.lowagie.text.Font.BOLD, Color.decode("#1a237e"));
        Paragraph titleParagraph = new Paragraph(title, titleFont);
        titleParagraph.setAlignment(Element.ALIGN_CENTER);
        titleParagraph.setSpacingAfter(12f);
        document.add(titleParagraph);

        // Timestamp subtitle
        com.lowagie.text.Font subFont =
                new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 9,
                        com.lowagie.text.Font.ITALIC, Color.GRAY);
        Paragraph generatedAt = new Paragraph("Generated: " + LocalDateTime.now(), subFont);
        generatedAt.setAlignment(Element.ALIGN_CENTER);
        generatedAt.setSpacingAfter(16f);
        document.add(generatedAt);

        // Table
        PdfPTable table = new PdfPTable(headers.length);
        table.setWidthPercentage(100f);
        table.setSpacingBefore(8f);

        // Header row
        com.lowagie.text.Font headerFont =
                new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 10,
                        com.lowagie.text.Font.BOLD, Color.WHITE);
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
            cell.setBackgroundColor(Color.decode("#283593"));
            cell.setPadding(8f);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cell);
        }

        // Data rows — alternate shading
        com.lowagie.text.Font dataFont =
                new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 9);
        boolean shade = false;
        for (String[] rowData : rows) {
            Color bg = shade ? Color.decode("#e8eaf6") : Color.WHITE;
            for (String value : rowData) {
                PdfPCell cell = new PdfPCell(new Phrase(value == null ? "" : value, dataFont));
                cell.setBackgroundColor(bg);
                cell.setPadding(6f);
                table.addCell(cell);
            }
            shade = !shade;
        }

        document.add(table);

        // Footer
        com.lowagie.text.Font footerFont =
                new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 8,
                        com.lowagie.text.Font.NORMAL, Color.GRAY);
        Paragraph footer = new Paragraph("Hospital Management System — Confidential Report", footerFont);
        footer.setAlignment(Element.ALIGN_CENTER);
        footer.setSpacingBefore(18f);
        document.add(footer);

        document.close();
        return out.toByteArray();
    }

    // ─────────────────────────────────────────────
    //  EXCEL  (uses org.apache.poi.ss.usermodel.Font by FQN)
    // ─────────────────────────────────────────────
    public byte[] exportToExcel(String sheetName, String[] headers, List<String[]> rows) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet(sheetName);

            // Header style
            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.INDIGO.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            // Header row
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Alternate row style (lavender for even rows)
            CellStyle evenStyle = workbook.createCellStyle();
            evenStyle.setFillForegroundColor(IndexedColors.LAVENDER.getIndex());
            evenStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Data rows
            int rowNum = 1;
            for (String[] rowData : rows) {
                Row row = sheet.createRow(rowNum);
                CellStyle rowStyle = (rowNum % 2 == 0) ? evenStyle : workbook.createCellStyle();
                for (int i = 0; i < rowData.length; i++) {
                    Cell cell = row.createCell(i);
                    cell.setCellValue(rowData[i] == null ? "" : rowData[i]);
                    cell.setCellStyle(rowStyle);
                }
                rowNum++;
            }

            // Auto-size all columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
        }
        return out.toByteArray();
    }

    // ─────────────────────────────────────────────
    //  CSV
    // ─────────────────────────────────────────────
    public byte[] exportToCsv(String[] headers, List<String[]> rows) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.join(",", headers)).append("\n");
        for (String[] row : rows) {
            String[] escaped = new String[row.length];
            for (int i = 0; i < row.length; i++) {
                String val = row[i] == null ? "" : row[i].replace("\"", "\"\"");
                escaped[i] = "\"" + val + "\"";
            }
            sb.append(String.join(",", escaped)).append("\n");
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }
}
