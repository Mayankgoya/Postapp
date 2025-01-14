package com.postapp.springboot.controller;

import java.util.List;

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

import com.postapp.springboot.entity.User;
import com.postapp.springboot.service.UserServies;

@RestController
@RequestMapping("/api/v1/postapp")
public class UserController 
{
//HTTP methods: POST(want to add new data to DB) , GET(give data), PUT/PATCH (update), DELETE (delete query)

	@Autowired
	private UserServies userServices;
	
	
	// http://localhost:8080/postapp/helloWorld -> endpoint / Rest API
	@GetMapping("/helloWorld")
	private String getUsers() {
		return "Hello";
	}
	
	
	// http://localhost:8080/postapp/hello
	@GetMapping("/hello")
	private String getUser() {
		return "Hello i am nd API";
	}
	
	// crud operation
	
	
	// http://localhost:8080/api/v1/postapp/alluser
	@GetMapping("/allusers")
	private List<User> getAllUser(){
		System.out.println("I am inside method");
		List<User> list = userServices.getUsers();
		return list;
	}
	
	// http://localhost:8080/api/v1/postapp/user/{id}
	@GetMapping("/user/{id}/{id2}")
	private User UserById(@PathVariable int id, @PathVariable int id2){
		User user = userServices.getUserById(id);				
		return user;
	}
	
	
	// http://localhost:8080/api/v1/postapp/user/101?age=23
	@GetMapping("/user/{id}")
	private User UserByAge(@PathVariable int id, @RequestParam int age){
		User user = userServices.getUserById(id);				
		return user;
	}
	
	// http://localhost:8080/api/v1/postapp/user/age/aboveeighteen
	@GetMapping("/user/age/aboveeighteen")
	private List<User> ageAboveEighteen(){
		
		List<User> list = userServices.userAgeAboveEighteen();
		
		return list;
	}
	
	@GetMapping("/user/validate")
	private User ValidateUser(@RequestParam String email , @RequestParam String password){
		
		User list = userServices.validateUser(email , password);
		
		return list;
	}
	
	@GetMapping("/user/name/age")
	private List<User> findByNameAndAge(@RequestParam String name, @RequestParam int age){
		
		List<User> list = userServices.userByNameAndAge(name , age);
		
		return list;
	}
	
	@GetMapping("/user")
	private List<User> findByName(@RequestParam String name){
		
		List<User> list = userServices.findByname(name);
		
		return list;
	}
	
	
	// http://localhost:8080/api/v1/postapp/user/insert
	@PostMapping("/user/insert")
	public String insertData(@RequestBody User user) {
		
		userServices.insertUser(user);
		
		return "Data Inserted";
	}
	
	//http://localhost:8080/api/v1/postapp/user/delete?id=
	@DeleteMapping("/user/delete/{id}")
	public String deleteUserById(@PathVariable int id){
		
		String res = userServices.deleteUserById(id);
		
		return res;
	}
	
	@PatchMapping("user/update")
	public String updateUser(@RequestBody User user){
		
		String res = userServices.UpdateUserById(user.getId(), user);
		
		return res;
	}
	
	
}

//restcontroller, controller , autowired , all mapping , requestmapping , service , repository , component