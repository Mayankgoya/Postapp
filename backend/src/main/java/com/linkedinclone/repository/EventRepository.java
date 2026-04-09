package com.linkedinclone.repository;

import com.linkedinclone.entity.ProfessionalEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventRepository extends JpaRepository<ProfessionalEvent, Long> {
}
