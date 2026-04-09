package com.linkedinclone.dto;

import lombok.Data;

@Data
public class PostCreateRequest {
    private String content;
    private String imageUrl;
}
