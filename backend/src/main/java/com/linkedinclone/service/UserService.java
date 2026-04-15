package com.linkedinclone.service;

import com.linkedinclone.dto.UserDto;
import com.linkedinclone.entity.User;
import com.linkedinclone.repository.UserRepository;
import com.linkedinclone.repository.PostRepository;
import com.linkedinclone.repository.ConnectionRepository;
import com.linkedinclone.repository.GroupRepository;
import com.linkedinclone.repository.EventRepository;
import com.linkedinclone.repository.PageRepository;
import com.linkedinclone.repository.NewsletterRepository;
import com.linkedinclone.repository.HashtagRepository;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.PageRequest;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final ConnectionRepository connectionRepository;
    private final PostRepository postRepository;
    private final GroupRepository groupRepository;
    private final EventRepository eventRepository;
    private final PageRepository pageRepository;
    private final NewsletterRepository newsletterRepository;
    private final HashtagRepository hashtagRepository;

    public UserService(UserRepository userRepository, 
                       ConnectionRepository connectionRepository, 
                       PostRepository postRepository,
                       GroupRepository groupRepository,
                       EventRepository eventRepository,
                       PageRepository pageRepository,
                       NewsletterRepository newsletterRepository,
                       HashtagRepository hashtagRepository) {
        this.userRepository = userRepository;
        this.connectionRepository = connectionRepository;
        this.postRepository = postRepository;
        this.groupRepository = groupRepository;
        this.eventRepository = eventRepository;
        this.pageRepository = pageRepository;
        this.newsletterRepository = newsletterRepository;
        this.hashtagRepository = hashtagRepository;
    }

    public int getMutualConnectionCount(Long userId1, Long userId2) {
        User u1 = userRepository.findById(userId1).orElse(null);
        User u2 = userRepository.findById(userId2).orElse(null);
        if (u1 == null || u2 == null) return 0;

        Set<Long> connections1 = connectionRepository.findAcceptedConnections(u1)
            .stream()
            .map(c -> c.getSender().getId().equals(userId1) ? c.getReceiver().getId() : c.getSender().getId())
            .collect(Collectors.toSet());

        Set<Long> connections2 = connectionRepository.findAcceptedConnections(u2)
            .stream()
            .map(c -> c.getSender().getId().equals(userId2) ? c.getReceiver().getId() : c.getSender().getId())
            .collect(Collectors.toSet());

        connections1.retainAll(connections2);
        return connections1.size();
    }

    private UserDto convertToDto(User user) {
        UserDto dto = new UserDto(user);
        dto.setConnectionCount(connectionRepository.findAcceptedConnections(user).size());
        dto.setPostCount(postRepository.findByUserOrderByCreatedAtDesc(user).size());
        
        // Populate new sidebar counts
        dto.setGroupCount(user.getGroups() != null ? user.getGroups().size() : 0);
        dto.setEventCount(user.getEvents() != null ? user.getEvents().size() : 0);
        dto.setPageCount(user.getPages() != null ? user.getPages().size() : 0);
        dto.setNewsletterCount(user.getNewsletters() != null ? user.getNewsletters().size() : 0);
        dto.setHashtagCount(user.getFollowedHashtags() != null ? user.getFollowedHashtags().size() : 0);
        dto.setContactCount(0); // Placeholder for future sync
        
        return dto;
    }

    public UserDto getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToDto(user);
    }

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToDto(user);
    }

    public UserDto updateProfile(String email, UserDto userDto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setName(userDto.getName());
        if (userDto.getBio() != null) user.setBio(userDto.getBio());
        if (userDto.getSkills() != null) user.setSkills(userDto.getSkills());
        if (userDto.getProfilePicture() != null) user.setProfilePicture(userDto.getProfilePicture());
        if (userDto.getCoverPicture() != null) user.setCoverPicture(userDto.getCoverPicture());
        if (userDto.getLocation() != null) user.setLocation(userDto.getLocation());
        
        return convertToDto(userRepository.save(user));
    }

    public List<UserDto> searchUsers(String query) {
        List<User> users = userRepository.findByNameContainingIgnoreCase(query);
        // Increment search count for trending calculation
        users.forEach(u -> {
            u.setSearchCount(u.getSearchCount() + 1);
            userRepository.save(u);
        });
        return users.stream()
                .map(this::convertToDto).collect(Collectors.toList());
    }

    public List<UserDto> getTrendingUsers() {
        return userRepository.findTrendingUsers(PageRequest.of(0, 5)).stream()
                .map(this::convertToDto).collect(Collectors.toList());
    }
    
    public List<UserDto> getSuggestedUsers(String email) {
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return userRepository.findAll().stream()
                .filter(u -> !u.getId().equals(currentUser.getId())) // Exclude self
                .map(u -> {
                    UserDto dto = convertToDto(u);
                    dto.setMutualConnectionCount(getMutualConnectionCount(currentUser.getId(), u.getId()));
                    return dto;
                })
                .sorted((a, b) -> Integer.compare(b.getMutualConnectionCount(), a.getMutualConnectionCount())) // Sort by mutual connections
                .collect(Collectors.toList());
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDto).collect(Collectors.toList());
    }
}
