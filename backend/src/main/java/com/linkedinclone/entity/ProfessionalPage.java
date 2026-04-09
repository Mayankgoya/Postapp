package com.linkedinclone.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "professional_pages")
@Data
@NoArgsConstructor
public class ProfessionalPage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private String category;

    @ManyToMany(mappedBy = "pages")
    private Set<User> followers = new HashSet<>();
}
