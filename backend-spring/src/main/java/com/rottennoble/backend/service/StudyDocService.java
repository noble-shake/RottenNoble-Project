package com.rottennoble.backend.service;

import com.rottennoble.backend.dto.StudyDocDetail;
import com.rottennoble.backend.dto.StudyDocSummary;
import com.rottennoble.backend.exception.NotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

// StudyProject(별도 저장소, DevelopPrompt/POLICY/STUDY.md "StudyProject 연동" 정책)의
// ComputerScience/**/*.md 학습 문서를 블로그에 노출한다. 저장소 자체가 주제인 개요 문서
// (Architecture/RottenNoble-Project*.md)는 "공부 목적 정보"가 아니라 이 프로젝트 자체에 대한
// 문서라 사용자 요청으로 제외한다.
@Service
public class StudyDocService {

    private static final Logger log = LoggerFactory.getLogger(StudyDocService.class);
    private static final Pattern SAFE_SEGMENT = Pattern.compile("^[A-Za-z0-9_.-]+$");
    // StudyProject/_TEMPLATE.md 메타 블록의 "- **관련 레포지토리**: `X`" 줄에서 저장소명만 뽑는다 —
    // StudyProject/VIEWER/index.html의 extractRepo()와 같은 규칙(첫 백틱 값만 취급, `-`는 무시).
    private static final Pattern REPO_FIELD = Pattern.compile("\\*\\*관련\\s*레포지토리\\*\\*\\s*:\\s*`([^`]+)`");
    private static final Set<String> EXCLUDED_RELATIVE_PATHS = Set.of(
            "Architecture/RottenNoble-Project.md",
            "Architecture/RottenNobleProject-Architecture.md"
    );

    private final Path root;

    public StudyDocService(@Value("${study.project-path}") String projectPath) {
        this.root = Path.of(projectPath, "ComputerScience");
    }

    public List<StudyDocSummary> listAll() {
        if (!Files.isDirectory(root)) {
            log.warn("Study project path not found: {}", root);
            return List.of();
        }
        try (Stream<Path> paths = Files.walk(root)) {
            return paths
                    .filter(Files::isRegularFile)
                    .filter(p -> p.toString().endsWith(".md") && !p.toString().endsWith(".flow.md"))
                    .filter(p -> !EXCLUDED_RELATIVE_PATHS.contains(relativePath(p)))
                    .map(this::toSummary)
                    .sorted(Comparator.comparing(StudyDocSummary::category).thenComparing(StudyDocSummary::title))
                    .toList();
        } catch (IOException e) {
            log.warn("Failed to list study docs", e);
            return List.of();
        }
    }

    public StudyDocDetail getOne(String category, String slug) {
        validateSegment(category);
        validateSegment(slug);

        String relative = category + "/" + slug + ".md";
        if (EXCLUDED_RELATIVE_PATHS.contains(relative)) {
            throw new NotFoundException("문서를 찾을 수 없습니다.");
        }

        Path file = root.resolve(category).resolve(slug + ".md").normalize();
        if (!file.startsWith(root) || !Files.isRegularFile(file)) {
            throw new NotFoundException("문서를 찾을 수 없습니다.");
        }

        String content = readFile(file);
        Path flowFile = root.resolve(category).resolve(slug + ".flow.md").normalize();
        String flowContent = Files.isRegularFile(flowFile) ? readFile(flowFile) : null;

        return new StudyDocDetail(category, slug, extractTitle(content), content, flowContent);
    }

    private void validateSegment(String value) {
        if (value == null || !SAFE_SEGMENT.matcher(value).matches()) {
            throw new NotFoundException("문서를 찾을 수 없습니다.");
        }
    }

    private String readFile(Path file) {
        try {
            return Files.readString(file);
        } catch (IOException e) {
            throw new NotFoundException("문서를 읽을 수 없습니다.");
        }
    }

    private StudyDocSummary toSummary(Path file) {
        String relative = relativePath(file);
        String category = relative.substring(0, relative.indexOf('/'));
        String fileName = file.getFileName().toString();
        String slug = fileName.substring(0, fileName.length() - ".md".length());
        String content = readFile(file);
        String title = extractTitle(content);
        String repo = extractRepo(content);
        return new StudyDocSummary(category, slug, title, repo);
    }

    private String relativePath(Path file) {
        return root.relativize(file).toString().replace('\\', '/');
    }

    private String extractTitle(String content) {
        String firstLine = content.lines().findFirst().orElse("");
        return firstLine.replaceFirst("^#+\\s*", "").trim();
    }

    private String extractRepo(String content) {
        Matcher m = REPO_FIELD.matcher(content);
        if (!m.find()) return null;
        String value = m.group(1).trim();
        return (value.isEmpty() || value.equals("-")) ? null : value;
    }
}
