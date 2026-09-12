package com.ctms.security;

import com.ctms.entity.Participant;
import com.ctms.entity.Users;
import com.ctms.repository.ParticipantRepository;
import com.ctms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;
    private final ParticipantRepository participantRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Users user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseGet(() -> participantRepository.findBySubjectId(username)
                        .map(Participant::getUser)
                        .filter(Objects::nonNull)
                        .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username)));

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPasswordHash(),
                user.isActive(),
                true, true, true,
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}
