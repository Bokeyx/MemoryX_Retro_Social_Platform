package com.project.backend.service.users;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.project.backend.dto.users.JwtResponseDTO;
import com.project.backend.dto.users.UsersListDetailDto;
import com.project.backend.dto.users.UsersSignupDTO;
import com.project.backend.dto.users.UsersUpdateDto;
import com.project.backend.exceptions.ResourceNotFoundException;
import com.project.backend.jwt.JwtUtil;
import com.project.backend.model.Users;
import com.project.backend.repository.UsersRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UsersService {
    private final UsersRepository usersRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public Users registerUser(UsersSignupDTO dto) {
        if (usersRepository.existsByUserId(dto.getUserId())) {
            throw new IllegalStateException("이미 존재하는 아이디입니다.");
        }

        if (dto.getName() != null && dto.getName().length() > 50) {
            throw new IllegalArgumentException("이름은 50자를 초과할 수 없습니다.");
        }

        if (dto.getEmail() != null && dto.getEmail().length() > 50) {
            throw new IllegalArgumentException("이메일은 50자를 초과할 수 없습니다.");
        }
        Users user = Users.builder()
                .userId(dto.getUserId())
                .password(passwordEncoder.encode(dto.getPassword()))
                .name(dto.getName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .sex(dto.getSex())
                .birth(dto.getBirth())
                .bloodType(dto.getBloodType())
                .introduction(dto.getIntroduction())
                .profileImage(dto.getProfileImage())
                .authProvider(dto.getAuthProvider())
                .visited(0)
                .reportCnt(0)
                .userStatus("ACTIVE")
                .createdAt(LocalDateTime.now())
                .mysong(null)
                .build();
        return usersRepository.save(user);
    }

    public boolean checkUserIdExists(String userId) {
        return usersRepository.existsByUserId(userId);
    }

    // 🔵 [신규] 로그인 + JWT 토큰 발급
    public JwtResponseDTO loginUserAndGetToken(String userId, String rawPassword) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("아이디가 존재하지 않습니다."));
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }
        String token = jwtUtil.generateToken(userId);
        return new JwtResponseDTO(
                token,
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getProfileImage(),
                user.getAuthProvider(),
                user.getSex(),
                user.getPhone(),
                user.getBloodType(),
                user.getIntroduction(),
                user.getBirth(),
                user.getVisited(),
                user.getReportCnt(),
                user.getUserStatus(),
                user.getCreatedAt(),
                false // 로그인 시에는 isNew를 false로 설정
        );
    }

    public UsersListDetailDto getUsersListDetail(String userId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return UsersListDetailDto.builder()
                .userId(user.getUserId())
                .name(user.getName())
                .sex(user.getSex())
                .profileImage(user.getProfileImage())
                .birth(user.getBirth())
                .bloodType(user.getBloodType())
                .email(user.getEmail())
                .phone(user.getPhone())
                .introduction(user.getIntroduction())
                .authProvider(user.getAuthProvider())
                .build();
    }

    @Transactional
    public void updateProfileImage(String userId, String profileImageUrl) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        user.setProfileImage(profileImageUrl);
        usersRepository.save(user);
    }

    @Transactional
    public void updateUser(String userId, UsersUpdateDto updateDto) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        if (updateDto.getName() != null) {
            user.setName(updateDto.getName());
        }
        if (updateDto.getEmail() != null) {
            user.setEmail(updateDto.getEmail());
        }
        if (updateDto.getPhone() != null) {
            user.setPhone(updateDto.getPhone());
        }
        if (updateDto.getSex() != null) {
            user.setSex(updateDto.getSex());
        }
        if (updateDto.getIntroduction() != null) {
            user.setIntroduction(updateDto.getIntroduction());
        }
        if (updateDto.getPassword() != null && !updateDto.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(updateDto.getPassword()));
        }
        if (updateDto.getProfileImage() != null) {
            user.setProfileImage(updateDto.getProfileImage());
        }
        usersRepository.save(user);
    }

    @Transactional
    public void deleteUser(String userId) {
        if (!usersRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with ID: " + userId);
        }
        usersRepository.deleteById(userId);
    }

    @Transactional
    private void checkCreateTodayNews(){
        LocalDate today = LocalDate.now();
    }
}