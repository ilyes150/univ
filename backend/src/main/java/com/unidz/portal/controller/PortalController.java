package com.unidz.portal.controller;

import com.unidz.portal.model.Student;
import com.unidz.portal.model.Result;
import com.unidz.portal.service.PortalService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@RestController
@RequestMapping("/api/portal")
@CrossOrigin(origins = "*") // Controls CORS restrictions for frontend client integration
public class PortalController {

    private final PortalService portalService;

    public PortalController(PortalService portalService) {
        this.portalService = portalService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> executionLogin(@RequestBody Map<String, String> payload) {
        String user = payload.get("username");
        String pass = payload.get("password");

        Optional<Student> studentOpt = portalService.authenticateAndFetchProfile(user, pass);
        if (studentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Access Denied. Invalid matricule or key signature credentials."));
        }

        Student student = studentOpt.get();
        Optional<Result> resultOpt = portalService.getPerformanceMetrics(student.getId());

        Map<String, Object> responsePayload = new HashMap<>();
        responsePayload.put("student", student);
        responsePayload.put("metrics", resultOpt.orElse(null));

        return ResponseEntity.ok(responsePayload);
    }
}