package com.project.backend.controller.users;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.project.backend.dto.users.UsersListDetailDto;
import com.project.backend.dto.users.ProfileImageUpdateDto;
import com.project.backend.dto.users.UsersUpdateDto;
import com.project.backend.service.users.UsersService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UsersController {
    private final UsersService usersService;

    @GetMapping("/listdetail/{userId}")
    public ResponseEntity<UsersListDetailDto> getUsersListByUserId(@PathVariable String userId){
        UsersListDetailDto usersListDetail = usersService.getUsersListDetail(userId);

        return ResponseEntity.ok(usersListDetail);
    }

    @PutMapping("/{userId}/profile-image")

    public ResponseEntity<Void> updateProfileImage(
            @PathVariable String userId,
            @RequestBody ProfileImageUpdateDto profileImageUpdateDto) {
        usersService.updateProfileImage(userId, profileImageUpdateDto.getProfileImageUrl());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/test")
    public String userHello() {
        return "Hello!";
    }

    @PutMapping("/{userId}")
    public ResponseEntity<Void> updateUser(@PathVariable String userId, @RequestBody UsersUpdateDto updateDto) {
        usersService.updateUser(userId, updateDto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable String userId) {
        usersService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }
}
