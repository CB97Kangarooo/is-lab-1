package ru.itmo.is.lab.service;

import ru.itmo.is.lab.auth.PasswordHasher;
import ru.itmo.is.lab.dto.UserDto;
import ru.itmo.is.lab.entity.AppUser;
import ru.itmo.is.lab.exception.InvalidCredentialsException;
import ru.itmo.is.lab.exception.UsernameTakenException;
import ru.itmo.is.lab.repository.UserRepository;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.transaction.Transactional;

@ApplicationScoped
public class AuthService {

    @Inject
    private UserRepository userRepository;

    @Inject
    private PasswordHasher passwordHasher;

    @Transactional(Transactional.TxType.REQUIRED)
    public UserDto register(String username, String password) {
        String name = username.trim();
        if (userRepository.findByUsername(name) != null) {
            throw new UsernameTakenException();
        }
        userRepository.persist(new AppUser(name, passwordHasher.hash(password)));
        return new UserDto(name);
    }

    @Transactional(Transactional.TxType.REQUIRED)
    public UserDto authenticate(String username, String password) {
        AppUser user = userRepository.findByUsername(username.trim());
        if (user == null || !passwordHasher.matches(password, user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }
        return new UserDto(user.getUsername());
    }
}
