package com.linkedinclone.service;

import com.linkedinclone.dto.PostDto;
import com.linkedinclone.entity.Comment;
import com.linkedinclone.entity.Like;
import com.linkedinclone.entity.Post;
import com.linkedinclone.entity.User;
import com.linkedinclone.exception.BadRequestException;
import com.linkedinclone.exception.ResourceNotFoundException;
import com.linkedinclone.repository.CommentRepository;
import com.linkedinclone.repository.LikeRepository;
import com.linkedinclone.repository.PostRepository;
import com.linkedinclone.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;

    public PostService(PostRepository postRepository, UserRepository userRepository,
                       CommentRepository commentRepository, LikeRepository likeRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
        this.likeRepository = likeRepository;
    }

    @Transactional
    public PostDto createPost(String email, String content, String imageUrl) {
        if (content == null || content.trim().isEmpty()) {
            throw new BadRequestException("Post content cannot be empty");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        Post post = new Post();
        post.setContent(content);
        post.setImageUrl(imageUrl);
        post.setUser(user);
        Post savedPost = postRepository.save(post);
        return new PostDto(savedPost, false);
    }

    public List<PostDto> getAllPosts(String currentUserEmail) {
        User currentUser = currentUserEmail != null ? 
                userRepository.findByEmail(currentUserEmail).orElse(null) : null;
        
        return postRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(post -> new PostDto(post, isLikedByUser(currentUser, post)))
                .collect(Collectors.toList());
    }

    public List<PostDto> getUserPosts(Long userId, String currentUserEmail) {
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        User currentUser = currentUserEmail != null ? 
                userRepository.findByEmail(currentUserEmail).orElse(null) : null;

        return postRepository.findByUserOrderByCreatedAtDesc(targetUser)
                .stream()
                .map(post -> new PostDto(post, isLikedByUser(currentUser, post)))
                .collect(Collectors.toList());
    }

    @Transactional
    public PostDto likePost(String email, Long postId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));

        boolean nowLiked = false;
        if (likeRepository.existsByUserAndPost(user, post)) {
            Like like = likeRepository.findByUserAndPost(user, post).orElseThrow();
            likeRepository.delete(like); // Unlike
        } else {
            Like like = new Like();
            like.setUser(user);
            like.setPost(post);
            likeRepository.save(like);
            nowLiked = true;
        }
        
        Post updatedPost = postRepository.findById(postId).orElseThrow();
        return new PostDto(updatedPost, nowLiked);
    }

    @Transactional
    public PostDto commentOnPost(String email, Long postId, String content) {
        if (content == null || content.trim().isEmpty()) {
            throw new BadRequestException("Comment content cannot be empty");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));

        Comment comment = new Comment();
        comment.setUser(user);
        comment.setPost(post);
        comment.setContent(content.trim());
        commentRepository.save(comment);

        Post updatedPost = postRepository.findById(postId).orElseThrow();
        return new PostDto(updatedPost, isLikedByUser(user, updatedPost));
    }

    @Transactional
    public PostDto updatePost(String email, Long postId, String content) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        
        validateOwnership(email, post.getUser().getEmail());

        if (content == null || content.trim().isEmpty()) {
            throw new BadRequestException("Post content cannot be empty");
        }
        
        post.setContent(content.trim());
        Post savedPost = postRepository.save(post);
        User user = userRepository.findByEmail(email).orElseThrow();
        return new PostDto(savedPost, isLikedByUser(user, savedPost));
    }

    @Transactional
    public void deletePost(String email, Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        
        validateOwnership(email, post.getUser().getEmail());
        postRepository.delete(post);
    }

    @Transactional
    public PostDto deleteComment(String email, Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));
        
        // Ownership: Either the comment author OR the post owner can delete
        boolean isCommentAuthor = comment.getUser().getEmail().equals(email);
        boolean isPostOwner = comment.getPost().getUser().getEmail().equals(email);
        
        if (!isCommentAuthor && !isPostOwner) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized to delete this comment");
        }

        Post post = comment.getPost();
        commentRepository.delete(comment);
        
        User user = userRepository.findByEmail(email).orElseThrow();
        return new PostDto(post, isLikedByUser(user, post));
    }

    private void validateOwnership(String requesterEmail, String ownerEmail) {
        if (!requesterEmail.equals(ownerEmail)) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized to modify this resource");
        }
    }

    private boolean isLikedByUser(User user, Post post) {
        if (user == null || post == null) return false;
        return likeRepository.existsByUserAndPost(user, post);
    }
}

