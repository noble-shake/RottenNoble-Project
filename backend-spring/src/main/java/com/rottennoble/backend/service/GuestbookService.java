package com.rottennoble.backend.service;

import com.rottennoble.backend.dto.GuestbookRequest;
import com.rottennoble.backend.dto.GuestbookResponse;
import com.rottennoble.backend.entity.GuestbookEntry;
import com.rottennoble.backend.exception.BadRequestException;
import com.rottennoble.backend.repository.GuestbookRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GuestbookService {

    private final GuestbookRepository repository;

    public GuestbookService(GuestbookRepository repository) {
        this.repository = repository;
    }

    public List<GuestbookResponse> getAll() {
        return repository.findAllByOrderByCreatedAtDesc().stream().map(GuestbookResponse::from).toList();
    }

    public GuestbookResponse create(GuestbookRequest request) {
        String name = request.name() == null ? "" : request.name().trim();
        String message = request.message() == null ? "" : request.message().trim();

        if (name.isEmpty() || name.length() > 50) {
            throw new BadRequestException("이름은 1~50자여야 합니다.");
        }
        if (message.isEmpty() || message.length() > 500) {
            throw new BadRequestException("메시지는 1~500자여야 합니다.");
        }

        GuestbookEntry entry = new GuestbookEntry();
        entry.setName(name);
        entry.setMessage(message);
        return GuestbookResponse.from(repository.save(entry));
    }
}
