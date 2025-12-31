package com.rei.examenbackend.repository;

import com.rei.examenbackend.model.User;
import com.rei.examenbackend.model.UserSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserSettingsRepository extends JpaRepository<UserSettings, Long> {
    Optional<UserSettings> findByUser(User user);
}
