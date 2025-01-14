
package com.postapp.springboot.entity;

import java.io.Serializable;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class Post implements Serializable
{
	private static final long serialVersionUID = 1L;
	@Id
	private Integer post_id ;
	private String description;
	private Integer likes;
	private Integer dislike;
	private String comment;
	
	
	
	public Integer getpost_id() {
		return post_id;
	}
	public void setpost_id(Integer post_id) {
		this.post_id = post_id;
	}
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	public Integer getLikes() {
		return likes;
	}
	public void setLikes(Integer likes) {
		this.likes = likes;
	}
	public Integer getDislike() {
		return dislike;
	}
	public void setDislike(Integer dislike) {
		this.dislike = dislike;
	}
	public String getComment() {
		return comment;
	}
	public void setComment(String comment) {
		this.comment = comment;
	}
	@Override
	public String toString() {
		return "Post [post_id=" + post_id + ", description=" + description + ", likes=" + likes + ", dislike=" + dislike
				+ ", comment=" + comment + "]";
	}
	public Post(Integer post_id, String description, Integer likes, Integer dislike, String comment) {
		super();
		this.post_id = post_id;
		this.description = description;
		this.likes = likes;
		this.dislike = dislike;
		this.comment = comment;
	}
	public Post() {
		super();
		// TODO Auto-generated constructor stub
	}
	
	
}

