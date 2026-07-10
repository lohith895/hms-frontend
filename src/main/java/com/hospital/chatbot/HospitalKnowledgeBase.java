package com.hospital.chatbot;

import org.springframework.stereotype.Component;
import java.util.*;

@Component
public class HospitalKnowledgeBase {

    private final Map<String, String> faqs = new HashMap<>();
    private final Map<String, String> navigation = new HashMap<>();
    private final Map<String, String> medications = new HashMap<>();

    public HospitalKnowledgeBase() {
        // Initialize FAQs
        faqs.put("visiting hours", "Our general visiting hours are from 10:00 AM - 1:00 PM and 4:00 PM - 7:00 PM daily. Intensive Care Unit (ICU) visits are strictly limited to immediate family members between 5:00 PM - 6:00 PM.");
        faqs.put("parking", "Complimentary multi-level visitor parking is available in Building C. Valet parking is located at the main Emergency Entrance.");
        faqs.put("refunds", "Refund requests for cancelled consultations or tests can be initiated at the Billing desk on the Ground Floor. Processing takes 3-5 business days.");
        faqs.put("insurance", "We support cashless payments and tie-ups with all major health insurance providers. Please present your insurance card at the TPA desk in the main lobby.");

        // Initialize Navigation
        navigation.put("pharmacy", "The Pharmacy is on the Ground Floor, immediately to the right of the main Reception desk.");
        navigation.put("icu", "The Intensive Care Unit (ICU) is located on the 2nd Floor of Wing B. Take the elevators near the cardiology department.");
        navigation.put("laboratory", "The Diagnostic Laboratory is on the 1st Floor of Wing A. Follow the blue signs from the main lobby elevator.");
        navigation.put("emergency", "The Emergency Department is on the Ground Floor with a dedicated entrance on the west side of the campus.");
        navigation.put("cafeteria", "The Cafeteria is on the Lower Ground (Basement) Floor, offering fresh meals, beverages, and snacks 24/7.");

        // Initialize Medications
        medications.put("paracetamol", "Paracetamol is used to treat mild-to-moderate pain and fever. Take 1 tablet every 4-6 hours as needed. Do not exceed 4000mg (8 tablets) in 24 hours to avoid liver damage.");
        medications.put("amoxicillin", "Amoxicillin is a penicillin-type antibiotic used to treat bacterial infections. Finish the entire prescribed course even if you feel better. Take with food to reduce stomach upset.");
        medications.put("ibuprofen", "Ibuprofen is a nonsteroidal anti-inflammatory drug (NSAID) used to reduce pain, swelling, and fever. Always take it with food or milk to prevent stomach irritation.");
        medications.put("atorvastatin", "Atorvastatin is a statin medication used to lower cholesterol. It is usually taken once daily in the evening, with or without food. Avoid excessive grapefruit juice during treatment.");
    }

    public Map<String, String> getFaqs() {
        return faqs;
    }

    public Map<String, String> getNavigation() {
        return navigation;
    }

    public Map<String, String> getMedications() {
        return medications;
    }
}
