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

    @PostMapping(consumes = {"multipart/form-data", "application/json"})
    public ResponseEntity<PostDto> createPost(
            @RequestParam(value = "content", required = false) String content,
            @RequestParam(value = "imageUrl", required = false) String imageUrl,
            @RequestParam(value = "image", required = false) org.springframework.web.multipart.MultipartFile imageFile,
            @RequestBody(required = false) PostCreateRequest jsonRequest,
            Authentication authentication) {
        
        String finalContent = content;
        String finalImageUrl = imageUrl;
        
        if (jsonRequest != null) {
            finalContent = jsonRequest.getContent();
            finalImageUrl = jsonRequest.getImageUrl();
        }
        
        if (imageFile != null && !imageFile.isEmpty()) {
            finalImageUrl = fileStorageService.storeFile(imageFile);
        }
        
        return ResponseEntity.ok(postService.createPost(authentication.getName(), finalContent, finalImageUrl));
    }

    @GetMapping
    public ResponseEntity<List<PostDto>> getAllPosts(Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(postService.getAllPosts(email));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PostDto>> getUserPosts(@PathVariable Long userId, Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(postService.getUserPosts(userId, email));
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<PostDto> likePost(@PathVariable Long postId, Authentication authentication) {
        return ResponseEntity.ok(postService.likePost(authentication.getName(), postId));
    }

    @PostMapping("/{postId}/comment")
    public ResponseEntity<PostDto> commentOnPost(
            @PathVariable Long postId, 
            @RequestBody java.util.Map<String, String> payload, 
            Authentication authentication) {
        String content = payload.get("content");
        return ResponseEntity.ok(postService.commentOnPost(authentication.getName(), postId, content));
    }

    @PutMapping("/{postId}")
    public ResponseEntity<PostDto> updatePost(
            @PathVariable Long postId,
            @RequestBody java.util.Map<String, String> payload,
            Authentication authentication) {
        String content = payload.get("content");
        return ResponseEntity.ok(postService.updatePost(authentication.getName(), postId, content));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable Long postId, Authentication authentication) {
        postService.deletePost(authentication.getName(), postId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<PostDto> deleteComment(@PathVariable Long commentId, Authentication authentication) {
        return ResponseEntity.ok(postService.deleteComment(authentication.getName(), commentId));
    }
}

