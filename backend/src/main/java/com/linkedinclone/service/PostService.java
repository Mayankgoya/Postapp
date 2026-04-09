package com.linkedinclone.service;

import com.linkedinclone.dto.PostDto;
import com.linkedinclone.entity.Comment;
import com.linkedinclone.entity.Like;
import com.linkedinclone.entity.Post;
import com.linkedinclone.entity.User;
import com.linkedinclone.repository.CommentRepository;
import com.linkedinclone.repository.LikeRepository;
import com.linkedinclone.repository.PostRepository;
import com.linkedinclone.repository.UserRepository;
import org.springframework.stereotype.Service;

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

    public PostDto createPost(String email, String content, String imageUrl) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Post post = new Post();
        post.setContent(content);
        post.setImageUrl(imageUrl);
        post.setUser(user);
        return new PostDto(postRepository.save(post));
    }

    public List<PostDto> getAllPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(PostDto::new).collect(Collectors.toList());
    }

    public List<PostDto> getUserPosts(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return postRepository.findByUserOrderByCreatedAtDesc(user)
                .stream().map(PostDto::new).collect(Collectors.toList());
    }

    public PostDto likePost(String email, Long postId) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Post post = postRepository.findById(postId).orElseThrow();

        if (likeRepository.existsByUserAndPost(user, post)) {
            Like like = likeRepository.findByUserAndPost(user, post).orElseThrow();
            likeRepository.delete(like); // Unlike
        } else {
            Like like = new Like();
            like.setUser(user);
            like.setPost(post);
            likeRepository.save(like);
        }
        return new PostDto(postRepository.findById(postId).orElseThrow());
    }

    public PostDto commentOnPost(String email, Long postId, String content) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Post post = postRepository.findById(postId).orElseThrow();

        Comment comment = new Comment();
        comment.setUser(user);
        comment.setPost(post);
        comment.setContent(content);
        commentRepository.save(comment);

        return new PostDto(postRepository.findById(postId).orElseThrow());
    }
}
