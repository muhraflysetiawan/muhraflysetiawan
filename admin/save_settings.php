<?php
require_once '../config/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $countdownDate = $_POST['countdown_date'] ?? null;
    
    if ($countdownDate) {
        // Convert to MySQL datetime format
        $formattedDate = date('Y-m-d H:i:s', strtotime($countdownDate));
        
        if (updateSetting($pdo, 'countdown_date', $formattedDate)) {
            header('Location: index.php?success=countdown');
            exit;
        } else {
            header('Location: index.php?error=' . urlencode('Gagal menyimpan pengaturan'));
            exit;
        }
    } else {
        header('Location: index.php?error=' . urlencode('Tanggal tidak valid'));
        exit;
    }
}

header('Location: index.php');
exit;
?>
