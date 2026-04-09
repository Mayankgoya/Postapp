package com.linkedinclone.controller;

import com.linkedinclone.dto.PostDto;
import com.linkedinclone.dto.PostCreateRequest;
import com.linkedinclone.service.PostService;
import com.linkedinclone.service.FileStorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;
    private final FileStorageService fileStorageService;

    public PostController(PostService postService, FileStorageService fileStorageService) {
        this.postService = postService;
        this.fileStorageService = fileStorageService;
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<PostDto> createPost(
            @RequestParam("content") String content,
            @RequestParam(value = "image", required = false) org.springframework.web.multipart.MultipartFile imageFile,
            Authentication authentication) {
        
        String imageUrl = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            imageUrl = fileStorageService.storeFile(imageFile);
        }
        
        return ResponseEntity.ok(postService.createPost(authentication.getName(), content, imageUrl));
    }

    @PostMapping
    public ResponseEntity<PostDto> createPostFromJson(@RequestBody PostCreateRequest postRequest, Authentication authentication) {
        return ResponseEntity.ok(postService.createPost(authentication.getName(), postRequest.getContent(), postRequest.getImageUrl()));
    }

    @GetMapping
    public ResponseEntity<List<PostDto>> getAllPosts() {
        return ResponseEntity.ok(postService.getAllPosts());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PostDto>> getUserPosts(@PathVariable Long userId) {
        return ResponseEntity.ok(postService.getUserPosts(userId));
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<PostDto> likePost(@PathVariable Long postId, Authentication authentication) {
        return ResponseEntity.ok(postService.likePost(authentication.getName(), postId));
    }

    @PostMapping("/{postId}/comment")
    public ResponseEntity<PostDto> commentOnPost(@PathVariable Long postId, @RequestBody String content, Authentication authentication) {
        return ResponseEntity.ok(postService.commentOnPost(authentication.getName(), postId, content));
    }
}
