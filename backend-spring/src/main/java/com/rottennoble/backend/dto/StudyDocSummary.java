package com.rottennoble.backend.dto;

// repo는 StudyProject 문서 메타의 "관련 레포지토리" 필드 값(없으면 null) — StudyProject의
// VIEWER가 얻은 "기술 스택별/프로젝트별" 보기 토글과 같은 그룹핑 키를 프런트에 그대로 넘긴다.
public record StudyDocSummary(String category, String slug, String title, String repo) {
}
