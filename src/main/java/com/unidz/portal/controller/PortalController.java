package com.unidz.portal.controller;

import com.unidz.portal.model.*;
import com.unidz.portal.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.MessageDigest;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@RestController
@RequestMapping("/api/portal")
@CrossOrigin(origins = "*")
public class PortalController {

    private final LoginRepository loginRepo;
    private final StudentRepository studentRepo;
    private final ResultRepository resultRepo;
    private final Semester1Repository sem1Repo;
    private final Semester2Repository sem2Repo;
    private final Semester3Repository sem3Repo;

    public PortalController(LoginRepository loginRepo, StudentRepository studentRepo, ResultRepository resultRepo,
                            Semester1Repository sem1Repo, Semester2Repository sem2Repo, Semester3Repository sem3Repo) {
        this.loginRepo = loginRepo;
        this.studentRepo = studentRepo;
        this.resultRepo = resultRepo;
        this.sem1Repo = sem1Repo;
        this.sem2Repo = sem2Repo;
        this.sem3Repo = sem3Repo;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String inputPassword = payload.get("password");

        Optional<Login> loginOpt = loginRepo.findByUsername(username);
        if (loginOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Access Denied. Identification mismatch."));
        }

        Login user = loginOpt.get();
        String hashedInput = hashSha256(inputPassword);
        if (!user.getPassword().equalsIgnoreCase(hashedInput)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Security Reject: Signature key mismatch."));
        }

        Student student = studentRepo.findById(user.getId()).orElse(null);
        Result metrics = resultRepo.findById(user.getId()).orElse(null);

        Map<String, Object> sessionResponse = new HashMap<>();
        sessionResponse.put("student", student);
        sessionResponse.put("metrics", metrics);

        return ResponseEntity.ok(sessionResponse);
    }

    @GetMapping("/semester/{semNum}")
    public ResponseEntity<?> getSemesterGrades(@PathVariable int semNum, @RequestParam int studentId) {
        switch (semNum) {
            case 1: return ResponseEntity.of(sem1Repo.findById(studentId));
            case 2: return ResponseEntity.of(sem2Repo.findById(studentId));
            case 3: return ResponseEntity.of(sem3Repo.findById(studentId));
            default: return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Target semester data unreleased."));
        }
    }

    private String hashSha256(String base) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(base.getBytes("UTF-8"));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception ex) {
            return "";
        }
    }
}