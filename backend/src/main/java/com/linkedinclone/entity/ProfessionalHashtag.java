package com.linkedinclone.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "professional_hashtags")
@Data
@NoArgsConstructor
public class ProfessionalHashtag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String name;

    @ManyToMany(mappedBy = "followedHashtags")
    private Set<User> followers = new HashSet<>();
}
