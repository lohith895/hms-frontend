package com.hospital.chatbot;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:3000")
public class AiChatController {

    private final MockLlmService aiChatService;

    public AiChatController(MockLlmService aiChatService) {
        this.aiChatService = aiChatService;
    }

    @PostMapping("/chat")
    @PreAuthorize("hasAnyRole('PATIENT','ADMIN','DOCTOR','NURSE','PHARMACIST')")
    public ResponseEntity<AiChatResponse> chat(
            @Valid @RequestBody AiChatRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        String responseText = aiChatService.processChat(userDetails.getUsername(), request.getMessage());
        return ResponseEntity.ok(new AiChatResponse(responseText));
    }
}
