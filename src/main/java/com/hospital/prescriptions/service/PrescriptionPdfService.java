package com.hospital.prescriptions.service;

import com.hospital.prescriptions.entity.Prescription;
import com.hospital.prescriptions.entity.PrescriptionItem;
import com.hospital.prescriptions.repository.PrescriptionItemRepository;
import com.hospital.prescriptions.repository.PrescriptionRepository;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.*;
import com.lowagie.text.pdf.draw.LineSeparator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class PrescriptionPdfService {

    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;

    public PrescriptionPdfService(PrescriptionRepository prescriptionRepository,
                                   PrescriptionItemRepository prescriptionItemRepository) {
        this.prescriptionRepository = prescriptionRepository;
        this.prescriptionItemRepository = prescriptionItemRepository;
    }

    @Transactional(readOnly = true)
    public byte[] generatePrescriptionPdf(Long prescriptionId) {
        Prescription rx = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new RuntimeException("Prescription not found: " + prescriptionId));
        List<PrescriptionItem> items = prescriptionItemRepository.findByPrescriptionId(prescriptionId);

        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document doc = new Document(PageSize.A4, 50, 50, 60, 60);
            PdfWriter writer = PdfWriter.getInstance(doc, out);
            doc.open();

            // ── Fonts ──
            Font titleFont    = new Font(Font.HELVETICA, 22, Font.BOLD,   new Color(30, 58, 138));
            Font subtitleFont = new Font(Font.HELVETICA, 10, Font.NORMAL, new Color(100, 116, 139));
            Font labelFont    = new Font(Font.HELVETICA,  9, Font.BOLD,   new Color(71, 85, 105));
            Font valueFont    = new Font(Font.HELVETICA,  9, Font.NORMAL, new Color(15, 23, 42));
            Font sectionFont  = new Font(Font.HELVETICA, 10, Font.BOLD,   new Color(255, 255, 255));
            Font medNameFont  = new Font(Font.HELVETICA, 10, Font.BOLD,   new Color(15, 23, 42));
            Font medInfoFont  = new Font(Font.HELVETICA,  9, Font.NORMAL, new Color(71, 85, 105));

            PdfContentByte cb = writer.getDirectContent();

            // ── Header Banner ──
            cb.setColorFill(new Color(30, 58, 138));
            cb.rectangle(50, PageSize.A4.getHeight() - 110, PageSize.A4.getWidth() - 100, 55);
            cb.fill();

            // Hospital name in header
            Paragraph hospitalName = new Paragraph("MEDICARE HOSPITAL", new Font(Font.HELVETICA, 18, Font.BOLD, Color.WHITE));
            hospitalName.setAlignment(Element.ALIGN_CENTER);
            hospitalName.setSpacingBefore(8);
            doc.add(hospitalName);

            Paragraph hospitalTagline = new Paragraph("Caring for Life | Quality Healthcare Services", new Font(Font.HELVETICA, 9, Font.NORMAL, new Color(148, 163, 184)));
            hospitalTagline.setAlignment(Element.ALIGN_CENTER);
            doc.add(hospitalTagline);

            doc.add(new Paragraph(" "));

            // ── Title ──
            Paragraph rxTitle = new Paragraph("DIGITAL PRESCRIPTION", titleFont);
            rxTitle.setAlignment(Element.ALIGN_CENTER);
            doc.add(rxTitle);

            Paragraph rxId = new Paragraph("Prescription ID: RX-" + rx.getId() + "   |   Date: " + rx.getPrescribedDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm")), subtitleFont);
            rxId.setAlignment(Element.ALIGN_CENTER);
            rxId.setSpacingAfter(12);
            doc.add(rxId);

            // ── Divider ──
            LineSeparator separator = new LineSeparator();
            separator.setLineColor(new Color(226, 232, 240));
            doc.add(new Chunk(separator));
            doc.add(new Paragraph(" "));

            // ── Patient & Doctor Info Cards ──
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingAfter(16);

            // Patient info cell
            String patientName = "Unknown";
            String patientAge = "—";
            if (rx.getPatient().getUser() != null) {
                patientName = rx.getPatient().getUser().getFirstName() + " " + rx.getPatient().getUser().getLastName();
            }
            if (rx.getPatient().getDateOfBirth() != null) {
                patientAge = String.valueOf(java.time.Period.between(rx.getPatient().getDateOfBirth(), java.time.LocalDate.now()).getYears());
            }
            PdfPCell patientCell = buildInfoCell("PATIENT INFORMATION",
                    new String[][]{
                            {"Name:", patientName},
                            {"Age:", patientAge},
                            {"Patient ID:", "P-" + rx.getPatient().getId()},
                    }, labelFont, valueFont, sectionFont);
            infoTable.addCell(patientCell);

            // Doctor info cell
            String doctorName = "Dr. Unknown";
            if (rx.getDoctor().getUser() != null) {
                doctorName = "Dr. " + rx.getDoctor().getUser().getFirstName() + " " + rx.getDoctor().getUser().getLastName();
            }
            PdfPCell doctorCell = buildInfoCell("PRESCRIBING DOCTOR",
                    new String[][]{
                            {"Name:", doctorName},
                            {"Specialization:", rx.getDoctor().getSpecialization() != null ? rx.getDoctor().getSpecialization() : "General"},
                            {"Registration No:", "REG-" + rx.getDoctor().getId()},
                    }, labelFont, valueFont, sectionFont);
            infoTable.addCell(doctorCell);

            doc.add(infoTable);

            // ── Prescribed Medicines Section ──
            PdfPTable medicinesHeader = new PdfPTable(1);
            medicinesHeader.setWidthPercentage(100);
            medicinesHeader.setSpacingAfter(8);
            PdfPCell headerCell = new PdfPCell(new Phrase("PRESCRIBED MEDICINES", sectionFont));
            headerCell.setBackgroundColor(new Color(30, 58, 138));
            headerCell.setPadding(10);
            headerCell.setBorder(Rectangle.NO_BORDER);
            medicinesHeader.addCell(headerCell);
            doc.add(medicinesHeader);

            // Medicines table
            PdfPTable medTable = new PdfPTable(new float[]{30, 15, 20, 15, 20});
            medTable.setWidthPercentage(100);
            medTable.setSpacingAfter(20);

            String[] headers = {"Medicine Name", "Dosage", "Frequency", "Duration", "Qty"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, labelFont));
                cell.setBackgroundColor(new Color(241, 245, 249));
                cell.setPadding(8);
                cell.setBorderColor(new Color(226, 232, 240));
                medTable.addCell(cell);
            }

            for (int i = 0; i < items.size(); i++) {
                PrescriptionItem item = items.get(i);
                Color rowColor = (i % 2 == 0) ? Color.WHITE : new Color(248, 250, 252);

                addMedCell(medTable, item.getMedicine().getName(), medNameFont, rowColor);
                addMedCell(medTable, item.getDosage(), medInfoFont, rowColor);
                addMedCell(medTable, item.getFrequency(), medInfoFont, rowColor);
                addMedCell(medTable, item.getDurationDays() + " days", medInfoFont, rowColor);
                addMedCell(medTable, String.valueOf(item.getQuantity()), medInfoFont, rowColor);
            }

            doc.add(medTable);

            // ── Diagnosis from medical record ──
            if (rx.getMedicalRecord() != null && rx.getMedicalRecord().getDiagnosis() != null) {
                doc.add(new Paragraph("Diagnosis", new Font(Font.HELVETICA, 10, Font.BOLD, new Color(30, 58, 138))));
                Paragraph diagnosis = new Paragraph(rx.getMedicalRecord().getDiagnosis(), valueFont);
                diagnosis.setSpacingAfter(12);
                doc.add(diagnosis);
            }

            // ── Status Badge ──
            doc.add(new Paragraph(" "));
            Paragraph statusPara = new Paragraph("Status: " + rx.getStatus().name(), new Font(Font.HELVETICA, 10, Font.BOLD,
                    rx.getStatus().name().equals("DISPENSED") ? new Color(5, 150, 105) : new Color(245, 158, 11)));
            statusPara.setAlignment(Element.ALIGN_RIGHT);
            doc.add(statusPara);

            // ── Footer ──
            doc.add(new Paragraph(" "));
            doc.add(new Chunk(separator));
            doc.add(new Paragraph(" "));
            Paragraph footer = new Paragraph(
                    "This is a digitally generated prescription. For verification or queries, contact the hospital.\n" +
                    "Generated: " + java.time.LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm")),
                    new Font(Font.HELVETICA, 8, Font.ITALIC, new Color(148, 163, 184)));
            footer.setAlignment(Element.ALIGN_CENTER);
            doc.add(footer);

            doc.close();
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate prescription PDF: " + e.getMessage(), e);
        }
    }

    private PdfPCell buildInfoCell(String title, String[][] rows, Font labelFont, Font valueFont, Font titleFont) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.BOX);
        cell.setBorderColor(new Color(226, 232, 240));
        cell.setPadding(0);

        PdfPTable inner = new PdfPTable(1);
        inner.setWidthPercentage(100);

        PdfPCell titleCell = new PdfPCell(new Phrase(title, titleFont));
        titleCell.setBackgroundColor(new Color(71, 85, 105));
        titleCell.setPadding(8);
        titleCell.setBorder(Rectangle.NO_BORDER);
        inner.addCell(titleCell);

        PdfPTable rowTable = new PdfPTable(2);
        for (String[] row : rows) {
            PdfPCell lbl = new PdfPCell(new Phrase(row[0], labelFont));
            lbl.setBorder(Rectangle.NO_BORDER);
            lbl.setPadding(5);
            lbl.setPaddingLeft(10);
            rowTable.addCell(lbl);
            PdfPCell val = new PdfPCell(new Phrase(row[1], valueFont));
            val.setBorder(Rectangle.NO_BORDER);
            val.setPadding(5);
            rowTable.addCell(val);
        }

        PdfPCell rowsWrapper = new PdfPCell(rowTable);
        rowsWrapper.setBorder(Rectangle.NO_BORDER);
        rowsWrapper.setPaddingBottom(8);
        inner.addCell(rowsWrapper);

        cell.addElement(inner);
        return cell;
    }

    private void addMedCell(PdfPTable table, String text, Font font, Color bgColor) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bgColor);
        cell.setPadding(8);
        cell.setBorderColor(new Color(226, 232, 240));
        table.addCell(cell);
    }
}
