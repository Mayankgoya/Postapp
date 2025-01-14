package com.postapp.springboot.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.postapp.springboot.dao.PostDao;
import com.postapp.springboot.entity.Post;

@Service
public class PostService {
	@Autowired
	private PostDao postDao;

	public String addPost(Post post) {

		postDao.save(post);
		return "Post save successfully";

	}

	public Post getPostById(int id) {

		Post post = postDao.findById(id).get();

		return post;
	}

	public String deletePostById(int id) {

		try {
			Post post = postDao.findById(id).get();

			if (post != null) {
				postDao.deleteById(id);
				return "Post deleted Successfully";
			}

			return "Post not Found";
		} catch (Exception e) {
			return "Post not Found";
		}

	}

	public String updatePostById(int id, Post updatedPost) {

		try {
			Post post = postDao.findById(id).get();

			if (post != null) {
				post.setComment(updatedPost.getComment());
				post.setDescription(updatedPost.getDescription());
				post.setDislike(updatedPost.getDislike());
				post.setLikes(updatedPost.getLikes());
				postDao.save(updatedPost);

				return "Post updated Successfully";
			}

			return "Post not Found";
		} catch (Exception e) {
			return "Post not Found";
		}
	}

	public String updatePostLikes(int id) {

		try {
			Post post = postDao.findById(id).get();
			if (post != null) {
				int like = post.getLikes();
				like++;
				post.setLikes(like);
				postDao.save(post);
				return "Like Added";
			}
			return "post not found";
		} catch (Exception e) {
			return "post not found";
		}

	}
	
	public String updatePostDislikes(int id) {

		try {
			Post post = postDao.findById(id).get();
			if (post != null) {
				int like = post.getDislike();
				like++;
				post.setDislike(like);
				postDao.save(post);
				return "Dislike Added";
			}
			return "post not found";
		} catch (Exception e) {
			return "post not found";
		}
		
		

	}
}
