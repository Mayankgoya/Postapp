package com.linkedinclone.dto;

import com.linkedinclone.entity.User;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String bio;
    private String skills;
    private String profilePicture;
    private String coverPicture;
    private int searchCount;
    private int postCount;
    private int connectionCount;
    private int groupCount;
    private int eventCount;
    private int pageCount;
    private int newsletterCount;
    private int hashtagCount;
    private int contactCount;
    private int mutualConnectionCount; // New field for discovery grid

    public UserDto(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.bio = user.getBio();
        this.skills = user.getSkills();
        this.profilePicture = user.getProfilePicture();
        this.coverPicture = user.getCoverPicture();
        this.searchCount = user.getSearchCount();
    }
}
