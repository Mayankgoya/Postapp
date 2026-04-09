package com.linkedinclone.repository;

import com.linkedinclone.entity.Post;
import com.linkedinclone.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findAllByOrderByCreatedAtDesc();
    List<Post> findByUserOrderByCreatedAtDesc(User user);
}
