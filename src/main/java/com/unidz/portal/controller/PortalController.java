package com.unidz.portal.controller;

import com.unidz.portal.model.*;
import com.unidz.portal.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/portal")
public class PortalController {

    @Autowired private LoginRepository loginRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private ResultRepository resultRepository;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateStudent(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String inputPassword = payload.get("password");

        Optional<Login> loginCreds = loginRepository.findByUsername(username);
        if (loginCreds.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid matricule entry credentials."));
        }

        // Replicate custom salt/concatenation signature match from SQL: science + substring(student_code from 5)
        String derivedSaltText = "science" + username.substring(4);
        String calculatedHash = computeSHA256(derivedSaltText);

        if (!calculatedHash.equals(loginCreds.get().getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Security Access Key signature invalid."));
        }

        Student student = studentRepository.findById(loginCreds.get().getId()).orElseThrow();
        Result metrics = resultRepository.findById(student.getId()).orElse(null);

        return ResponseEntity.ok(Map.of("student", student, "metrics", metrics));
    }

    private String computeSHA256(String baseText) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(baseText.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception ex) {
            throw new RuntimeException("Crypto Hash Execution Failure", ex);
        }
    }
}