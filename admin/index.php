<?php
require_once '../config/db.php';

$countdownDate = getSetting($pdo, 'countdown_date');
$videoPath = getSetting($pdo, 'video_path');

// Format date for datetime-local input
$formattedDate = date('Y-m-d\TH:i', strtotime($countdownDate));

// Check for success/error messages
$success = isset($_GET['success']) ? $_GET['success'] : null;
$error = isset($_GET['error']) ? urldecode($_GET['error']) : null;
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - Birthday Countdown</title>
    <link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>
    <div class="admin-container">
        <a href="../" class="back-link">
            <svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
            Kembali ke Homepage
        </a>

        <div class="admin-header">
            <h1>⚙️ Admin Panel</h1>
            <p>Kelola pengaturan website ulang tahun</p>
        </div>

        <?php if ($success): ?>
            <div class="alert alert-success">
                ✅ <?php echo $success === 'countdown' ? 'Waktu countdown berhasil diperbarui!' : 'Video background berhasil diperbarui!'; ?>
            </div>
        <?php endif; ?>

        <?php if ($error): ?>
            <div class="alert alert-error">
                ❌ <?php echo htmlspecialchars($error); ?>
            </div>
        <?php endif; ?>

        <!-- Countdown Settings -->
        <div class="admin-card">
            <h2>
                <svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                Pengaturan Countdown
            </h2>
            <form action="save_settings.php" method="POST">
                <div class="form-group">
                    <label for="countdown_date">Tanggal & Waktu Ulang Tahun</label>
                    <input type="datetime-local" id="countdown_date" name="countdown_date" value="<?php echo $formattedDate; ?>" required>
                </div>
                <button type="submit" class="btn">
                    <svg viewBox="0 0 24 24"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>
                    Simpan Pengaturan
                </button>
            </form>
        </div>

        <!-- Video Settings -->
        <div class="admin-card">
            <h2>
                <svg viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                Video Background
            </h2>
            <form action="upload_video.php" method="POST" enctype="multipart/form-data">
                <div class="form-group">
                    <label for="video">Upload Video Baru (MP4, max 50MB)</label>
                    <input type="file" id="video" name="video" accept="video/mp4" required>
                </div>
                <button type="submit" class="btn">
                    <svg viewBox="0 0 24 24"><path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/></svg>
                    Upload Video
                </button>
            </form>

            <?php if ($videoPath && file_exists('../' . $videoPath)): ?>
            <div class="current-video">
                <p>Video saat ini:</p>
                <video controls muted>
                    <source src="../<?php echo htmlspecialchars($videoPath); ?>" type="video/mp4">
                </video>
            </div>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>
