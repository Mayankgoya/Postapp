package com.linkedinclone.repository;

import com.linkedinclone.entity.ProfessionalNewsletter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NewsletterRepository extends JpaRepository<ProfessionalNewsletter, Long> {
}
