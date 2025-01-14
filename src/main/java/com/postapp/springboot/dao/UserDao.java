package com.postapp.springboot.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.postapp.springboot.entity.User;

@Repository
public interface UserDao extends JpaRepository<User, Integer>{
	  
		public User findByEmailAndPassword(String email,String pass);
		
	    public List<User> findByNameAndAge(String name , int age);
	    
	    public List<User> findByName(String name);
}
