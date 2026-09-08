package com.rottennoble.backend.controller;

import com.rottennoble.backend.dto.ApiResponse;
import com.rottennoble.backend.dto.StudyDocDetail;
import com.rottennoble.backend.dto.StudyDocSummary;
import com.rottennoble.backend.service.StudyDocService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/study")
public class StudyController {

    private final StudyDocService studyDocService;

    public StudyController(StudyDocService studyDocService) {
        this.studyDocService = studyDocService;
    }

    @GetMapping
    public ApiResponse<List<StudyDocSummary>> list() {
        return ApiResponse.ok(studyDocService.listAll());
    }

    @GetMapping("/{category}/{slug}")
    public ApiResponse<StudyDocDetail> getOne(@PathVariable String category, @PathVariable String slug) {
        return ApiResponse.ok(studyDocService.getOne(category, slug));
    }
}
