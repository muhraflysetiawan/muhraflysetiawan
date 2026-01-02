<?php
require_once '../config/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['video']) && $_FILES['video']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['video'];
        $fileName = $file['name'];
        $fileTmp = $file['tmp_name'];
        $fileSize = $file['size'];
        $fileType = $file['type'];
        
        // Validate file type
        $allowedTypes = ['video/mp4'];
        if (!in_array($fileType, $allowedTypes)) {
            header('Location: index.php?error=' . urlencode('Hanya file MP4 yang diperbolehkan'));
            exit;
        }
        
        // Validate file size (max 50MB)
        $maxSize = 50 * 1024 * 1024; // 50MB
        if ($fileSize > $maxSize) {
            header('Location: index.php?error=' . urlencode('Ukuran file maksimal 50MB'));
            exit;
        }
        
        // Create videos directory if not exists
        $uploadDir = '../assets/videos/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        // Generate unique filename
        $newFileName = 'background_' . time() . '.mp4';
        $uploadPath = $uploadDir . $newFileName;
        $dbPath = 'assets/videos/' . $newFileName;
        
        // Move uploaded file
        if (move_uploaded_file($fileTmp, $uploadPath)) {
            // Delete old video (optional - keep for now)
            $oldVideo = getSetting($pdo, 'video_path');
            if ($oldVideo && $oldVideo !== 'assets/videos/default.mp4' && file_exists('../' . $oldVideo)) {
                unlink('../' . $oldVideo);
            }
            
            // Update database
            if (updateSetting($pdo, 'video_path', $dbPath)) {
                header('Location: index.php?success=video');
                exit;
            } else {
                header('Location: index.php?error=' . urlencode('Gagal menyimpan ke database'));
                exit;
            }
        } else {
            header('Location: index.php?error=' . urlencode('Gagal mengupload file'));
            exit;
        }
    } else {
        $errorMessages = [
            UPLOAD_ERR_INI_SIZE => 'File terlalu besar (melebihi batas server)',
            UPLOAD_ERR_FORM_SIZE => 'File terlalu besar',
            UPLOAD_ERR_PARTIAL => 'File hanya terupload sebagian',
            UPLOAD_ERR_NO_FILE => 'Tidak ada file yang dipilih',
            UPLOAD_ERR_NO_TMP_DIR => 'Folder temporary tidak ditemukan',
            UPLOAD_ERR_CANT_WRITE => 'Gagal menulis file',
        ];
        
        $errorCode = $_FILES['video']['error'] ?? UPLOAD_ERR_NO_FILE;
        $errorMsg = $errorMessages[$errorCode] ?? 'Terjadi kesalahan saat upload';
        
        header('Location: index.php?error=' . urlencode($errorMsg));
        exit;
    }
}

header('Location: index.php');
exit;
?>
