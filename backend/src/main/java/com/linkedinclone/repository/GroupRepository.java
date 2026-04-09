package com.linkedinclone.repository;

import com.linkedinclone.entity.ProfessionalGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GroupRepository extends JpaRepository<ProfessionalGroup, Long> {
}
