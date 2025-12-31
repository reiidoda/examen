package com.rei.examenbackend.service.impl;

import com.rei.examenbackend.dto.settings.UserSettingsRequest;
import com.rei.examenbackend.dto.settings.UserSettingsResponse;
import com.rei.examenbackend.exception.ApiException;
import com.rei.examenbackend.model.User;
import com.rei.examenbackend.model.UserSettings;
import com.rei.examenbackend.repository.UserRepository;
import com.rei.examenbackend.repository.UserSettingsRepository;
import com.rei.examenbackend.service.UserSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalTime;

@Service
@RequiredArgsConstructor
public class UserSettingsServiceImpl implements UserSettingsService {

    private final UserSettingsRepository settingsRepository;
    private final UserRepository userRepository;

    @Override
    public UserSettingsResponse get(User user) {
        User persisted = userRepository.findById(user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        return settingsRepository.findByUser(persisted)
                .map(this::toResponse)
                .orElse(UserSettingsResponse.builder()
                        .timeZone(java.time.ZoneId.systemDefault().getId())
                        .theme("system")
                        .emailReminder(false)
                        .inAppReminder(false)
                        .build());
    }

    @Override
    public UserSettingsResponse update(UserSettingsRequest request, User user) {
        User persisted = userRepository.findById(user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        UserSettings settings = settingsRepository.findByUser(persisted)
                .orElse(UserSettings.builder().user(persisted).build());

        settings.setTimeZone(request.getTimeZone());
        settings.setTheme(request.getTheme());
        settings.setReminderTime(parseTime(request.getReminderTime()));
        settings.setEmailReminder(Boolean.TRUE.equals(request.getEmailReminder()));
        settings.setInAppReminder(Boolean.TRUE.equals(request.getInAppReminder()));

        settingsRepository.save(settings);
        return toResponse(settings);
    }

    private LocalTime parseTime(String time) {
        try {
            return time == null || time.isBlank() ? null : LocalTime.parse(time);
        } catch (Exception e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid reminder time format");
        }
    }

    private UserSettingsResponse toResponse(UserSettings settings) {
        return UserSettingsResponse.builder()
                .timeZone(settings.getTimeZone())
                .reminderTime(settings.getReminderTime() == null ? null : settings.getReminderTime().toString())
                .theme(settings.getTheme())
                .emailReminder(settings.getEmailReminder())
                .inAppReminder(settings.getInAppReminder())
                .build();
    }
}
