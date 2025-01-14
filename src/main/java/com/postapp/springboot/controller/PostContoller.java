package com.postapp.springboot.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.postapp.springboot.entity.Post;
import com.postapp.springboot.service.PostService;

@RestController
@RequestMapping("/api/v1/postapp")
public class PostContoller {
	@Autowired
	private PostService postService;
	
	
	@PostMapping("/post/add")
	public String AddPost(@RequestBody Post post) {
		
		String res = postService.addPost(post);
		
		return res;
	}
	
	@GetMapping("post/get/{id}")
	public Post getPostById(@PathVariable int id) {
		Post post = postService.getPostById(id);
		return post;
		
	}
	
	@DeleteMapping("post/delete/{id}")
	public String deletePostById(@PathVariable int id) {
		String res = postService.deletePostById(id);
		return res;
	}
	
	@PatchMapping("post/update")
	public String updatePost(@RequestBody Post post) {
		
		String res = postService.updatePostById(post.getpost_id(), post);
		return res;
	}
	
	
	@PatchMapping("post/update/likes/{id}")
	public String updatePostLike(@PathVariable int id) {
		
		String res = postService.updatePostLikes(id);
		return res;
	}
	
	@PatchMapping("post/update/dislikes/{id}")
	public String updatePostdis(@PathVariable int id) {
		
		String res = postService.updatePostDislikes(id);
		return res;
	}
	
}
