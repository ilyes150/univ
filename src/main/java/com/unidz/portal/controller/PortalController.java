package com.unidz.portal.controller;

import com.unidz.portal.model.*;
import com.unidz.portal.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*") // Allows communication with independent frontend files
@RestController
@RequestMapping("/api/portal")
public class PortalController {

    @Autowired private LoginRepository loginRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private ResultRepository resultRepository;
    @Autowired private Semester1Repository semester1Repository;
    @Autowired private Semester2Repository semester2Repository;
    @Autowired private Semester3Repository semester3Repository;

    /**
     * Handles secure user authentication using backend SHA-256 validation.
     * Matches the precise hashing logic: sha256('science' + student_code_from_index_5)
     */
    @PostMapping("/login")
    public ResponseEntity<?> authenticateStudent(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String passwordInput = credentials.get("password");

        if (username == null || passwordInput == null || username.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Bad Request: Username and password are required."));
        }

        // 1. Locate credentials in the Login table
        Optional<Login> loginRecord = loginRepository.findByUsername(username.trim());
        if (loginRecord.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication rejected: Invalid Student Code."));
        }

        // 2. Generate custom SHA-256 hash from plain text user input
        // Replicates: concat('science', substring(student_code from 5))
        String rawSaltString = "science" + username.trim().substring(4);
        String hashedInput = computeSHA256(rawSaltString);

        // 3. Verify signature matching against the database
        if (!hashedInput.equalsIgnoreCase(loginRecord.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication rejected: Invalid Security Access Key."));
        }

        // 4. Gather associated personal profiles and high-level ranking stats
        Optional<Student> studentProfile = studentRepository.findById(loginRecord.get().getId());
        if (studentProfile.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Data Integrity Error: Linked profile record not found."));
        }

        Result generalMetrics = resultRepository.findById(studentProfile.get().getId()).orElse(null);

        // Return structured payload to local storage pipeline
        return ResponseEntity.ok(Map.of(
            "student", studentProfile.get(),
            "metrics", generalMetrics != null ? generalMetrics : Map.of("rank", "N/A")
        ));
    }

    /**
     * Dynamically pulls raw rows directly from semester tables to feed the generic JavaScript loop.
     */
    @GetMapping("/semester/{semNum}")
    public ResponseEntity<?> getSemesterGrades(@PathVariable int semNum, @RequestParam Integer studentId) {
        if (studentId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Missing required query parameter: studentId"));
        }

        switch (semNum) {
            case 1:
                Optional<Semester1> s1 = semester1Repository.findById(studentId);
                return s1.isPresent() ? ResponseEntity.ok(s1.get()) : ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "No records found for Semester 1"));
            case 2:
                Optional<Semester2> s2 = semester2Repository.findById(studentId);
                return s2.isPresent() ? ResponseEntity.ok(s2.get()) : ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "No records found for Semester 2"));
            case 3:
                Optional<Semester3> s3 = semester3Repository.findById(studentId);
                return s3.isPresent() ? ResponseEntity.ok(s3.get()) : ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "No records found for Semester 3"));
            default:
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Requested terms are locked or fall out of data scopes."));
        }
    }

    /**
     * Utility method to compute standard SHA-256 values in HEX format.
     */
    private String computeSHA256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedHash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            
            StringBuilder hexString = new StringBuilder();
            for (byte b : encodedHash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception ex) {
            throw new RuntimeException("Core Cryptographic Subsystem Execution Mismatch", ex);
        }
    }
}