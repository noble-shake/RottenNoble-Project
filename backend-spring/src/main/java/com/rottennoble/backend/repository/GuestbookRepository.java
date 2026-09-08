package com.rottennoble.backend.repository;

import com.rottennoble.backend.entity.GuestbookEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GuestbookRepository extends JpaRepository<GuestbookEntry, Integer> {
    List<GuestbookEntry> findAllByOrderByCreatedAtDesc();
}
