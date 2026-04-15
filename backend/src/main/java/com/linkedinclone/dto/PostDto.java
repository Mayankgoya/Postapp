package com.linkedinclone.dto;

import com.linkedinclone.entity.Post;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
public class PostDto {
    private Long id;
    private String content;
    private String imageUrl;
    private UserDto user;
    private LocalDateTime createdAt;
    private int likesCount;
    private boolean likedByCurrentUser;
    private List<CommentDto> comments;

    public PostDto(Post post) {
        this.id = post.getId();
        this.content = post.getContent();
        this.imageUrl = post.getImageUrl();
        this.user = new UserDto(post.getUser());
        this.createdAt = post.getCreatedAt();
        this.likesCount = post.getLikes() != null ? post.getLikes().size() : 0;
        this.comments = post.getComments() != null ? 
                post.getComments().stream().map(CommentDto::new).collect(Collectors.toList()) : List.of();
    }

    public PostDto(Post post, boolean likedByCurrentUser) {
        this(post);
        this.likedByCurrentUser = likedByCurrentUser;
    }
}

