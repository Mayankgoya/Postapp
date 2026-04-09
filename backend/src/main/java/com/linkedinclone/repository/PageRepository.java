package com.linkedinclone.repository;

import com.linkedinclone.entity.ProfessionalPage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PageRepository extends JpaRepository<ProfessionalPage, Long> {
}
