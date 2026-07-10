package com.hospital.chatbot;

import com.hospital.patients.entity.Patient;
import com.hospital.patients.repository.PatientRepository;
import com.hospital.doctors.entity.Doctor;
import com.hospital.doctors.repository.DoctorRepository;
import com.hospital.prescriptions.entity.Prescription;
import com.hospital.prescriptions.entity.PrescriptionItem;
import com.hospital.prescriptions.repository.PrescriptionRepository;
import com.hospital.prescriptions.repository.PrescriptionItemRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class MockLlmServiceImpl implements MockLlmService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final HospitalKnowledgeBase knowledgeBase;
    private final AiPromptBuilder promptBuilder;

    public MockLlmServiceImpl(PatientRepository patientRepository,
                              DoctorRepository doctorRepository,
                              PrescriptionRepository prescriptionRepository,
                              PrescriptionItemRepository prescriptionItemRepository,
                              HospitalKnowledgeBase knowledgeBase,
                              AiPromptBuilder promptBuilder) {
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.prescriptionItemRepository = prescriptionItemRepository;
        this.knowledgeBase = knowledgeBase;
        this.promptBuilder = promptBuilder;
    }

    @Override
    public String processChat(String username, String userMessage) {
        String msg = userMessage.toLowerCase().trim();

        // 1. Fetch patient profile context
        Optional<Patient> patientOpt = patientRepository.findByUserUsername(username);
        Patient patient = patientOpt.orElse(null);
        List<PrescriptionItem> activeItems = new ArrayList<>();

        if (patient != null) {
            List<Prescription> prescriptions = prescriptionRepository.findByPatientIdOrderByPrescribedDateDesc(patient.getId());
            for (Prescription p : prescriptions) {
                activeItems.addAll(prescriptionItemRepository.findByPrescriptionId(p.getId()));
            }
        }

        // Build prompt (just to verify layout runs fine in log)
        String prompt = promptBuilder.buildPrompt(patient, activeItems, userMessage);
        System.out.println("AI Prompt: " + prompt);

        // Try calling Python RAG AI Service
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            String pythonServiceUrl = "http://localhost:8000/api/ai/chat";

            List<Map<String, Object>> activeMedicines = new ArrayList<>();
            for (PrescriptionItem item : activeItems) {
                Map<String, Object> med = new HashMap<>();
                med.put("name", item.getMedicine().getName());
                med.put("dosage", item.getDosage());
                med.put("frequency", item.getFrequency());
                med.put("durationDays", item.getDurationDays());
                activeMedicines.add(med);
            }

            Map<String, Object> requestPayload = new HashMap<>();
            requestPayload.put("message", userMessage);

            if (patient != null) {
                Map<String, Object> profile = new HashMap<>();
                profile.put("firstName", patient.getUser().getFirstName());
                profile.put("lastName", patient.getUser().getLastName());
                profile.put("allergies", null);
                profile.put("activeMedicines", activeMedicines);
                requestPayload.put("patientProfile", profile);
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> responseMap = restTemplate.postForObject(pythonServiceUrl, requestPayload, Map.class);
            if (responseMap != null && responseMap.containsKey("response")) {
                return (String) responseMap.get("response");
            }
        } catch (Exception e) {
            System.err.println("Failed to connect to Python AI RAG service: " + e.getMessage() + ". Falling back to local offline matcher.");
        }

        // 2. Intent Routing (Fallback)

        // A. Explain Prescriptions / Medications
        if (msg.contains("medication") || msg.contains("medicine") || msg.contains("prescription") || msg.contains("drug") || msg.contains("pill")) {
            // Explain paracetamol, amoxicillin, ibuprofen, atorvastatin specifically
            for (Map.Entry<String, String> entry : knowledgeBase.getMedications().entrySet()) {
                if (msg.contains(entry.getKey())) {
                    return "### 💊 Medication Details: " + entry.getKey().substring(0, 1).toUpperCase() + entry.getKey().substring(1) + "\n\n" + entry.getValue();
                }
            }

            // Or return their active prescriptions explained
            if (!activeItems.isEmpty()) {
                StringBuilder reply = new StringBuilder("### 📋 Your Current Prescriptions:\n\n");
                for (PrescriptionItem item : activeItems) {
                    String medNameLower = item.getMedicine().getName().toLowerCase();
                    reply.append("- **").append(item.getMedicine().getName()).append("**\n")
                         .append("  * **Dosage**: ").append(item.getDosage()).append("\n")
                         .append("  * **Frequency**: ").append(item.getFrequency()).append("\n")
                         .append("  * **Duration**: ").append(item.getDurationDays()).append(" days\n");
                    
                    // Lookup guidance
                    for (Map.Entry<String, String> entry : knowledgeBase.getMedications().entrySet()) {
                        if (medNameLower.contains(entry.getKey())) {
                            reply.append("  * **Guidance**: ").append(entry.getValue()).append("\n");
                        }
                    }
                }
                return reply.toString();
            } else {
                return "You do not have any active prescriptions logged in our system. If you want to know about general medicines like **Paracetamol**, **Amoxicillin**, or **Ibuprofen**, just ask me! (e.g. *'What is Paracetamol used for?'*)";
            }
        }

        // B. Finding Doctors
        if (msg.contains("doctor") || msg.contains("physician") || msg.contains("cardiologist") || msg.contains("pediatrician") || msg.contains("surgeon") || msg.contains("specialist")) {
            List<Doctor> doctors = doctorRepository.findAll();
            if (doctors.isEmpty()) {
                return "We currently do not have any doctors registered in the system database.";
            }

            // Check if specific specialty requested
            String specialty = null;
            if (msg.contains("cardio")) specialty = "Cardiology";
            else if (msg.contains("pediatr")) specialty = "Pediatrics";
            else if (msg.contains("ortho")) specialty = "Orthopedics";
            else if (msg.contains("general")) specialty = "General Medicine";

            final String filterSpecialty = specialty;
            List<Doctor> filtered = doctors.stream()
                    .filter(d -> filterSpecialty == null || d.getSpecialization().equalsIgnoreCase(filterSpecialty) || d.getDepartment().getName().equalsIgnoreCase(filterSpecialty))
                    .collect(Collectors.toList());

            if (filtered.isEmpty()) {
                return "We do not have any active specialists listed for **" + filterSpecialty + "** right now. Here is a list of all our available doctors:\n\n" +
                        doctors.stream().map(d -> "- **Dr. " + d.getUser().getFirstName() + " " + d.getUser().getLastName() + "** (" + d.getSpecialization() + " - " + d.getDepartment().getName() + ")").collect(Collectors.joining("\n"));
            }

            StringBuilder reply = new StringBuilder("### 🩺 Available Specialists " + (filterSpecialty != null ? "in " + filterSpecialty : "") + ":\n\n");
            for (Doctor d : filtered) {
                reply.append("- **Dr. ").append(d.getUser().getFirstName()).append(" ").append(d.getUser().getLastName()).append("**\n")
                     .append("  * **Specialty**: ").append(d.getSpecialization()).append("\n")
                     .append("  * **Department**: ").append(d.getDepartment().getName()).append("\n")
                     .append("  * **Experience**: ").append(d.getExperienceYears()).append(" years\n");
            }
            return reply.toString();
        }

        // C. Booking Appointments
        if (msg.contains("book") || msg.contains("schedule") || msg.contains("appointment") || msg.contains("consultation")) {
            return "### 📅 Booking an Appointment\n\nTo schedule a consultation with one of our specialists:\n1. Click on the **'Consultations'** tab in the left sidebar menu.\n2. Click the blue **'Schedule Consultation'** button at the top-right of your schedule card.\n3. Select your physician, choose a date & time, specify your consultation reason, and click submit.\n\nLet me know if you would like me to find a specific doctor for you first!";
        }

        // D. Hospital Navigation
        if (msg.contains("where") || msg.contains("navigate") || msg.contains("direction") || msg.contains("location") || msg.contains("floor") || msg.contains("room") || msg.contains("find")) {
            for (Map.Entry<String, String> entry : knowledgeBase.getNavigation().entrySet()) {
                if (msg.contains(entry.getKey())) {
                    return "### 🗺️ Hospital Navigation: " + entry.getKey().substring(0, 1).toUpperCase() + entry.getKey().substring(1) + "\n\n" + entry.getValue();
                }
            }
            return "### 🗺️ Hospital Navigation Guide\n\nI can help you navigate our facilities. Here are common locations:\n- **Pharmacy**: Ground Floor, next to main Reception.\n- **ICU**: 2nd Floor, Wing B.\n- **Laboratory**: 1st Floor, Wing A.\n- **Emergency Dept**: Ground Floor, West Entrance.\n- **Cafeteria**: Basement Floor.\n\n*Specify which facility you are looking for (e.g. 'Where is the ICU?').*";
        }

        // E. FAQs
        for (Map.Entry<String, String> entry : knowledgeBase.getFaqs().entrySet()) {
            if (msg.contains(entry.getKey())) {
                return "### ❓ FAQ - " + entry.getKey().substring(0, 1).toUpperCase() + entry.getKey().substring(1) + "\n\n" + entry.getValue();
            }
        }

        // F. General Health Education (non-diagnostic)
        if (msg.contains("health") || msg.contains("diet") || msg.contains("exercise") || msg.contains("fever") || msg.contains("cough") || msg.contains("cold") || msg.contains("headache") || msg.contains("tips")) {
            return "### 🍏 Health & Wellness Guidelines (Non-Diagnostic)\n\n" +
                    "- **Hydration**: Drink 8-10 glasses of water daily to maintain electrolyte balance.\n" +
                    "- **Colds & Flu**: Rest and warm fluids are key. If you have a mild fever, Paracetamol can help, but see a doctor if symptoms persist past 3 days.\n" +
                    "- **Cardio Health**: 30 minutes of moderate exercise like walking 5 times a week strengthens the heart.\n" +
                    "- **Medication safety**: Always stick to prescribed dosages and do not self-prescribe antibiotics like Amoxicillin.\n\n" +
                    "*⚠️ Warning: I am an AI assistant, not a doctor. If you are experiencing severe symptoms or have a medical emergency, please visit our Ground Floor Emergency department or call emergency services.*";
        }

        // default assistant welcome response
        return "### Hello! I am your Antigravity AI assistant. 🤖\n\n" +
                "I am here to help patients navigate hospital services. You can ask me to:\n" +
                "- 💊 **Explain prescriptions** or medications (e.g., *'Explain my medicine'*)\n" +
                "- 🩺 **Find doctors** and specialists (e.g., *'Find a Cardiologist'*)\n" +
                "- 📅 **Book appointments** instructions (*'How do I book?'*)\n" +
                "- 🗺️ **Find rooms or departments** (*'Where is the ICU?'*)\n" +
                "- ❓ **Answer FAQs** (*'What are the visiting hours?'*)\n" +
                "- 🍏 Provide general health education and wellness tips.\n\n" +
                "How can I assist you today?";
    }
}
