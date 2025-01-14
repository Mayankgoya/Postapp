package com.postapp.springboot.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.postapp.springboot.dao.UserDao;
import com.postapp.springboot.entity.User;

@Service
public class UserServies {
	
	@Autowired
	private UserDao userDao;
	
	public List<User> getUsers() {
		
		List<User> alluser = (List) userDao.findAll();
		for(User c: alluser)
			System.out.println(c);
		
		return alluser;
		
	}
	
	public User getUserById(int id) {
		
		User user = userDao.findById(id).get();
		System.out.println(user);
		return user;
	}
	
	
	
	public ArrayList<User> userAgeAboveEighteen() {
		List<User> alluser = (List) userDao.findAll();
		ArrayList<User> aboveEighteen = new ArrayList<User>();
		
		for(User c: alluser) {
			if(c.getAge() >= 18) {
				aboveEighteen.add(c);
			}
		}
		
		
		return aboveEighteen;
	}
	
	public User validateUser(String email , String password){
		
		User user = userDao.findByEmailAndPassword(email, password);
		
		return user;
	}
	
	public List<User> userByNameAndAge(String name , int age){
			
			List<User> user = userDao.findByNameAndAge(name, age);
		
			return user;
	}
	
	public List<User> findByname(String name){
	
		List<User> user = userDao.findByName(name);
	
		return user;
	}
	
	public void insertUser(User user) {
		
		userDao.save(user);
		
	}
	
	public String deleteUserById(int id) {
		
		
		try {
			User user = userDao.findById(id).get();
			
			userDao.deleteById(id);
			return "User Deleted Successfully";
			
		} catch (Exception e)
		{
			return "user not found";
		}
	}
	
	public String UpdateUserById(int id , User userdata) {
			
		try {
			User user = userDao.findById(id).get();
			
			if(user != null) {
				user.setAge(userdata.getAge());
				user.setEmail(userdata.getEmail());
				user.setPassword(userdata.getPassword());
				user.setName(userdata.getName());
				userDao.save(user);
				return "Data updated Successfully";
			}
			
			else {
				return "User Not Found";
			}
			
		} 
		catch (Exception e) 
		{
			return "User Not Found";
		}
	}
	
}
