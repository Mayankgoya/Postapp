package com.linkedinclone.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "professional_newsletters")
@Data
@NoArgsConstructor
public class ProfessionalNewsletter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private String author;

    @ManyToMany(mappedBy = "newsletters")
    private Set<User> subscribers = new HashSet<>();
}
