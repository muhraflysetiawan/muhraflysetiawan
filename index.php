<?php
require_once 'config/db.php';

$countdownDate = getSetting($pdo, 'countdown_date');
$videoPath = getSetting($pdo, 'video_path');

// Default values if not set
if (!$countdownDate) $countdownDate = '2025-12-31 00:00:00';
if (!$videoPath) $videoPath = 'assets/videos/default.mp4';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Syntia Aulia Sari</title>
    <meta name="description" content="Spesial Ulang Tahun">
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    <!-- Video Background -->
    <div class="video-background">
        <video id="bgVideo" autoplay muted loop playsinline>
            <source src="<?php echo htmlspecialchars($videoPath); ?>" type="video/mp4">
        </video>
    </div>

    <!-- Mute Button -->
    <button class="mute-btn" id="muteBtn" title="Toggle Sound">
        <svg id="muteIcon" viewBox="0 0 24 24">
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
        </svg>
        <svg id="unmuteIcon" style="display:none" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        </svg>
    </button>

    <!-- Main Content -->
    <div class="main-container">
        <h1 class="title">BIRTHDAY COUNTDOWN</h1>
        <p class="subtitle">25 MARET 2026</p>

        <!-- Countdown -->
        <div class="countdown-container" id="countdown">
            <div class="countdown-item">
                <div class="countdown-number" id="days">00</div>
                <div class="countdown-label">Hari</div>
            </div>
            <div class="countdown-item">
                <div class="countdown-number" id="hours">00</div>
                <div class="countdown-label">Jam</div>
            </div>
            <div class="countdown-item">
                <div class="countdown-number" id="minutes">00</div>
                <div class="countdown-label">Menit</div>
            </div>
            <div class="countdown-item">
                <div class="countdown-number" id="seconds">00</div>
                <div class="countdown-label">Detik</div>
            </div>
        </div>

        <!-- Birthday Message (shown when countdown ends) -->
        <div class="birthday-message" id="birthdayMessage">
            <h1>Selamat Ulang Tahun!</h1>
            <p>Semoga semua harapan dan impianmu terwujud!</p>
        </div>
    </div>

    <script>
        // Countdown Target Date from PHP
        const targetDate = new Date('<?php echo $countdownDate; ?>').getTime();

        function updateCountdown() {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                // Countdown finished
                document.getElementById('countdown').style.display = 'none';
                document.getElementById('birthdayMessage').classList.add('show');
                document.querySelector('.subtitle').style.display = 'none';
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            document.getElementById('days').textContent = String(days).padStart(2, '0');
            document.getElementById('hours').textContent = String(hours).padStart(2, '0');
            document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
            document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
        }

        // Update countdown every second
        updateCountdown();
        setInterval(updateCountdown, 1000);

        // Mute/Unmute functionality
        const video = document.getElementById('bgVideo');
        const muteBtn = document.getElementById('muteBtn');
        const muteIcon = document.getElementById('muteIcon');
        const unmuteIcon = document.getElementById('unmuteIcon');

        muteBtn.addEventListener('click', function() {
            if (video.muted) {
                video.muted = false;
                muteIcon.style.display = 'none';
                unmuteIcon.style.display = 'block';
            } else {
                video.muted = true;
                muteIcon.style.display = 'block';
                unmuteIcon.style.display = 'none';
            }
        });
    </script>
</body>
</html>
