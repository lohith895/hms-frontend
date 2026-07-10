package com.hospital.chatbot;

import com.hospital.patients.entity.Patient;
import com.hospital.prescriptions.entity.PrescriptionItem;
import org.springframework.stereotype.Component;
import java.util.*;

@Component
public class AiPromptBuilder {

    public String buildPrompt(Patient patient, List<PrescriptionItem> activeItems, String userMessage) {
        StringBuilder sb = new StringBuilder();

        // 1. System Identity
        sb.append("System Prompt: You are Antigravity-AI, the virtual medical assistant for Antigravity General Hospital. ");
        sb.append("Your goal is to assist the patient with general health questions, FAQs, room navigation, or explain their active prescriptions. ");
        sb.append("Remember: You are NOT a doctor. You must not diagnose medical conditions. Always provide helpful, non-diagnostic answers, and suggest seeing their consulting physician for diagnostic issues.\n\n");

        // 2. Patient Context
        if (patient != null && patient.getUser() != null) {
            sb.append("Active Patient Profile:\n");
            sb.append("- Name: ").append(patient.getUser().getFirstName()).append(" ").append(patient.getUser().getLastName()).append("\n");
            
            // Collect active medicines
            if (activeItems != null && !activeItems.isEmpty()) {
                sb.append("- Prescribed Medications:\n");
                for (PrescriptionItem item : activeItems) {
                    sb.append("  * ").append(item.getMedicine().getName())
                      .append(" (Dosage: ").append(item.getDosage())
                      .append(", Freq: ").append(item.getFrequency()).append(")\n");
                }
            } else {
                sb.append("- Prescribed Medications: None active currently.\n");
            }
            sb.append("\n");
        }

        // 3. User Message
        sb.append("User Query: \"").append(userMessage).append("\"\n\n");
        sb.append("Response Requirements: Provide a concise, friendly, and structured reply. Use markdown spacing.");

        return sb.toString();
    }
}
