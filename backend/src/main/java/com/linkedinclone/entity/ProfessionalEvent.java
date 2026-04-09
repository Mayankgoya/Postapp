package com.linkedinclone.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "professional_events")
@Data
@NoArgsConstructor
public class ProfessionalEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    @Column(columnDefinition = "DATETIME")
    private LocalDateTime eventDate;

    @ManyToMany(mappedBy = "events")
    private Set<User> attendees = new HashSet<>();
}
