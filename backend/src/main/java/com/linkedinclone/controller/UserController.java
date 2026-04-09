package com.linkedinclone.controller;

import com.linkedinclone.dto.UserDto;
import com.linkedinclone.service.UserService;
import com.linkedinclone.service.FileStorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final FileStorageService fileStorageService;

    public UserController(UserService userService, FileStorageService fileStorageService) {
        this.userService = userService;
        this.fileStorageService = fileStorageService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(userService.getProfile(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping(value = "/me", consumes = {"multipart/form-data"})
    public ResponseEntity<UserDto> updateProfileMultipart(
            @RequestParam("name") String name,
            @RequestParam(value = "bio", required = false) String bio,
            @RequestParam(value = "skills", required = false) String skills,
            @RequestParam(value = "image", required = false) org.springframework.web.multipart.MultipartFile imageFile,
            @RequestParam(value = "cover", required = false) org.springframework.web.multipart.MultipartFile coverFile,
            Authentication authentication) {
        
        UserDto userDto = new UserDto();
        userDto.setName(name);
        userDto.setBio(bio);
        userDto.setSkills(skills);
        
        if (imageFile != null && !imageFile.isEmpty()) {
            String imageUrl = fileStorageService.storeFile(imageFile);
            userDto.setProfilePicture(imageUrl);
        }
        
        if (coverFile != null && !coverFile.isEmpty()) {
            String coverUrl = fileStorageService.storeFile(coverFile);
            userDto.setCoverPicture(coverUrl);
        }
        
        return ResponseEntity.ok(userService.updateProfile(authentication.getName(), userDto));
    }

    @GetMapping("/trending")
    public ResponseEntity<List<UserDto>> getTrendingUsers() {
        return ResponseEntity.ok(userService.getTrendingUsers());
    }

    @PutMapping("/me")
    public ResponseEntity<UserDto> updateProfile(@RequestBody UserDto userDto, Authentication authentication) {
        return ResponseEntity.ok(userService.updateProfile(authentication.getName(), userDto));
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserDto>> searchUsers(@RequestParam String query) {
        return ResponseEntity.ok(userService.searchUsers(query));
    }
    
    @GetMapping("/suggested")
    public ResponseEntity<List<UserDto>> getSuggestedUsers(Authentication authentication) {
        return ResponseEntity.ok(userService.getSuggestedUsers(authentication.getName()));
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
}
