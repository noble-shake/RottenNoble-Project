package com.rottennoble.backend.service;

import com.rottennoble.backend.dto.PostRequest;
import com.rottennoble.backend.dto.PostResponse;
import com.rottennoble.backend.entity.Post;
import com.rottennoble.backend.exception.BadRequestException;
import com.rottennoble.backend.exception.NotFoundException;
import com.rottennoble.backend.repository.PostRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PostService {

    private final PostRepository repository;

    public PostService(PostRepository repository) {
        this.repository = repository;
    }

    public List<PostResponse> getAll() {
        return repository.findAllByOrderByCreatedAtDesc().stream().map(PostResponse::from).toList();
    }

    public PostResponse getById(int id) {
        return repository.findById(id).map(PostResponse::from)
                .orElseThrow(() -> new NotFoundException("게시글을 찾을 수 없습니다."));
    }

    public PostResponse create(PostRequest request) {
        String title = validateTitle(request.title());
        String content = validateContent(request.content());

        Post post = new Post();
        post.setTitle(title);
        post.setContent(content);
        return PostResponse.from(repository.save(post));
    }

    public PostResponse update(int id, PostRequest request) {
        String title = validateTitle(request.title());
        String content = validateContent(request.content());

        Post post = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("게시글을 찾을 수 없습니다."));
        post.setTitle(title);
        post.setContent(content);
        return PostResponse.from(repository.save(post));
    }

    public void delete(int id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("게시글을 찾을 수 없습니다.");
        }
        repository.deleteById(id);
    }

    private String validateTitle(String rawTitle) {
        String title = rawTitle == null ? "" : rawTitle.trim();
        if (title.isEmpty() || title.length() > 255) {
            throw new BadRequestException("제목은 1~255자여야 합니다.");
        }
        return title;
    }

    private String validateContent(String rawContent) {
        String content = rawContent == null ? "" : rawContent.trim();
        if (content.isEmpty()) {
            throw new BadRequestException("내용을 입력하세요.");
        }
        return content;
    }
}
