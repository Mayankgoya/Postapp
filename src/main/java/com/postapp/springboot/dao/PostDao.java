package com.postapp.springboot.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.postapp.springboot.entity.Post;

@Repository
public interface PostDao extends JpaRepository<Post , Integer> {

}
