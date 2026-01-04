/**
 * PHOTOBOOTH WEB APPLICATION - JavaScript (No Database Version)
 * 
 * Fitur:
 * - Camera popup modal dengan auto-capture timer
 * - Upload foto dari galeri
 * - Canvas rendering untuk photo strip
 * - Reorder foto (move up/down)
 * - Background template
 * - Scale slider
 * - Export PDF A4 (300 DPI, no compression)
 * - Export PNG/JPG
 */

// ===== KONSTANTA =====
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const DPI = 300;
const MM_TO_PX = DPI / 25.4;
const A4_WIDTH_PX = Math.round(A4_WIDTH_MM * MM_TO_PX);
const A4_HEIGHT_PX = Math.round(A4_HEIGHT_MM * MM_TO_PX);

// Ukuran strip dengan gap untuk logo
const STRIP_WIDTH_PX = 600;
const STRIP_HEIGHT_PX = 1800;
const PHOTO_PADDING_X = 40;
const PHOTO_PADDING_Y = 80; // Atas-bawah lebih lebar untuk logo

// Timer dan foto
const COUNTDOWN_SECONDS = 5;
const TOTAL_PHOTOS = 3;

// ===== STATE =====
let photos = [null, null, null];
let backgroundImage = null;
let scale = 1.0;
let cameraStream = null;
let currentPhotoIndex = 0;
let countdownInterval = null;
let isCapturing = false;

// ===== DOM ELEMENTS =====
const elements = {};

function initElements() {
    // Camera modal
    elements.cameraModal = document.getElementById('cameraModal');
    elements.modalVideo = document.getElementById('modalVideo');
    elements.modalCanvas = document.getElementById('modalCanvas');
    elements.countdownDisplay = document.getElementById('countdownDisplay');
    elements.captureStatus = document.getElementById('captureStatus');
    elements.btnRetry = document.getElementById('btnRetry');
    elements.btnContinue = document.getElementById('btnContinue');
    elements.btnCloseModal = document.getElementById('btnCloseModal');
    elements.capturedPreview = document.getElementById('capturedPreview');
    elements.actionButtons = document.getElementById('actionButtons');

    // Main controls
    elements.btnStartSession = document.getElementById('btnStartSession');
    elements.photoUpload = document.getElementById('photoUpload');
    elements.btnUploadPhoto = document.getElementById('btnUploadPhoto');
    elements.backgroundUpload = document.getElementById('backgroundUpload');
    elements.btnUploadBackground = document.getElementById('btnUploadBackground');
    elements.btnRemoveBackground = document.getElementById('btnRemoveBackground');
    elements.backgroundPreview = document.getElementById('backgroundPreview');

    // Strip
    elements.stripCanvas = document.getElementById('stripCanvas');
    elements.a4Canvas = document.getElementById('a4Canvas');
    elements.photoSlots = document.getElementById('photoSlots');

    // Controls
    elements.scaleSlider = document.getElementById('scaleSlider');
    elements.scaleValue = document.getElementById('scaleValue');
    elements.btnResetAll = document.getElementById('btnResetAll');

    // Export
    elements.btnDownloadPDF = document.getElementById('btnDownloadPDF');
    elements.btnDownloadPNG = document.getElementById('btnDownloadPNG');
    elements.btnDownloadJPG = document.getElementById('btnDownloadJPG');
}

// ===== INITIALIZATION =====
function init() {
    initElements();
    setupCameraEvents();
    setupUploadEvents();
    setupControlEvents();
    setupExportEvents();
    setupSlotEvents();
    renderStrip();
    renderA4Preview();
}

// ===== CAMERA MODAL FUNCTIONS =====
function setupCameraEvents() {
    elements.btnStartSession.addEventListener('click', startPhotoSession);
    elements.btnRetry.addEventListener('click', retryPhoto);
    elements.btnContinue.addEventListener('click', continueToNext);
    elements.btnCloseModal.addEventListener('click', closeModal);
}

async function startPhotoSession() {
    // Reset state
    currentPhotoIndex = 0;
    photos = [null, null, null];
    updateSlotUI();
    renderStrip();

    // Open modal
    elements.cameraModal.classList.add('active');

    try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Browser API tidak support. Pastikan menggunakan HTTPS atau Localhost.');
        }

        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: 'user' },
            audio: false
        });
        elements.modalVideo.srcObject = cameraStream;

        // Start first countdown
        startCountdown();
    } catch (error) {
        console.error('Camera error:', error);

        let msg = 'Tidak dapat mengakses kamera.';

        // Cek jika issue karena HTTP (bukan HTTPS) di mobile
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            msg += '\n\nPENTING: Akses kamera di HP WAJIB menggunakan HTTPS. Browser memblokir kamera di HTTP biasa demi keamanan.\n\nSolusi:\n1. Gunakan localhost di laptop\n2. Gunakan ngrok untuk forward ke HTTPS\n3. Setting flag browser (tidak disarankan)';
        } else {
            msg += '\n\nDetail: ' + error.message;
        }

        alert(msg);
        closeModal();
    }
}

function startCountdown() {
    let seconds = COUNTDOWN_SECONDS;
    isCapturing = true;

    // Hide action buttons, show video
    elements.actionButtons.style.display = 'none';
    elements.capturedPreview.style.display = 'none';
    elements.modalVideo.style.display = 'block';
    elements.countdownDisplay.style.display = 'flex';

    elements.captureStatus.textContent = `Foto ${currentPhotoIndex + 1} dari ${TOTAL_PHOTOS}`;
    elements.countdownDisplay.textContent = seconds;

    countdownInterval = setInterval(() => {
        seconds--;
        if (seconds > 0) {
            elements.countdownDisplay.textContent = seconds;
        } else {
            clearInterval(countdownInterval);
            capturePhoto();
        }
    }, 1000);
}

function capturePhoto() {
    const video = elements.modalVideo;
    const canvas = elements.modalCanvas;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Show captured image
    const dataURL = canvas.toDataURL('image/png');
    elements.capturedPreview.innerHTML = `<img src="${dataURL}" alt="Captured">`;
    elements.capturedPreview.style.display = 'block';
    elements.modalVideo.style.display = 'none';
    elements.countdownDisplay.style.display = 'none';

    // Save to temp
    const img = new Image();
    img.onload = () => {
        photos[currentPhotoIndex] = img;
        updateSlotUI();
        renderStrip();
        renderA4Preview();
    };
    img.src = dataURL;

    // Show action buttons
    elements.actionButtons.style.display = 'flex';
    elements.captureStatus.textContent = `Foto ${currentPhotoIndex + 1} diambil!`;

    // Update button text
    if (currentPhotoIndex >= TOTAL_PHOTOS - 1) {
        elements.btnContinue.innerHTML = '<i class="fas fa-check"></i> Selesai';
    } else {
        elements.btnContinue.innerHTML = '<i class="fas fa-arrow-right"></i> Lanjut';
    }

    isCapturing = false;
}

function retryPhoto() {
    // Clear current photo
    photos[currentPhotoIndex] = null;
    updateSlotUI();
    renderStrip();

    // Restart countdown
    startCountdown();
}

function continueToNext() {
    currentPhotoIndex++;

    if (currentPhotoIndex >= TOTAL_PHOTOS) {
        // All photos taken
        closeModal();
        renderStrip();
        renderA4Preview();
    } else {
        // Next photo
        startCountdown();
    }
}

function closeModal() {
    // Stop camera
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }

    // Clear interval
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    // Hide modal
    elements.cameraModal.classList.remove('active');
    elements.modalVideo.srcObject = null;

    // Final render
    updateSlotUI();
    renderStrip();
    renderA4Preview();
}

// ===== UPLOAD FUNCTIONS =====
function setupUploadEvents() {
    elements.btnUploadPhoto.addEventListener('click', () => elements.photoUpload.click());
    elements.photoUpload.addEventListener('change', handlePhotoUpload);
    elements.btnUploadBackground.addEventListener('click', () => elements.backgroundUpload.click());
    elements.backgroundUpload.addEventListener('change', handleBackgroundUpload);
    elements.btnRemoveBackground.addEventListener('click', removeBackground);
}

function handlePhotoUpload(event) {
    const files = Array.from(event.target.files);
    files.forEach(file => {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => addPhotoToSlot(img);
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
    event.target.value = '';
}

function handleBackgroundUpload(event) {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            backgroundImage = img;
            elements.backgroundPreview.innerHTML = `<img src="${e.target.result}" alt="Background">`;

            // Show delete button, shrink upload button
            elements.btnRemoveBackground.style.display = 'inline-flex';
            elements.btnUploadBackground.classList.remove('btn-full');

            renderStrip();
            renderA4Preview();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
    event.target.value = '';
}

function removeBackground() {
    backgroundImage = null;
    elements.backgroundPreview.innerHTML = '';

    // Hide delete button, expand upload button
    elements.btnRemoveBackground.style.display = 'none';
    elements.btnUploadBackground.classList.add('btn-full');

    renderStrip();
    renderA4Preview();
}

// ===== PHOTO SLOT MANAGEMENT =====
function addPhotoToSlot(img) {
    const emptyIndex = photos.findIndex(p => p === null);
    if (emptyIndex === -1) {
        alert('Semua slot foto sudah terisi!');
        return;
    }
    photos[emptyIndex] = img;
    updateSlotUI();
    renderStrip();
    renderA4Preview();
}

function updateSlotUI() {
    const slots = elements.photoSlots.querySelectorAll('.photo-slot');
    slots.forEach((slot, index) => {
        const placeholder = slot.querySelector('.slot-placeholder');
        const hasPhoto = photos[index] !== null;
        slot.classList.toggle('has-photo', hasPhoto);

        if (hasPhoto) {
            const thumbCanvas = document.createElement('canvas');
            thumbCanvas.width = 60;
            thumbCanvas.height = 45;
            const ctx = thumbCanvas.getContext('2d');
            const img = photos[index];
            const aspectRatio = img.width / img.height;
            let drawWidth, drawHeight, offsetX = 0, offsetY = 0;

            if (aspectRatio > 60 / 45) {
                drawHeight = 45;
                drawWidth = drawHeight * aspectRatio;
                offsetX = -(drawWidth - 60) / 2;
            } else {
                drawWidth = 60;
                drawHeight = drawWidth / aspectRatio;
                offsetY = -(drawHeight - 45) / 2;
            }
            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
            placeholder.innerHTML = `<img src="${thumbCanvas.toDataURL()}" class="slot-thumbnail" alt="Photo ${index + 1}">`;
        } else {
            placeholder.textContent = `Photo ${index + 1}`;
        }
    });
}

function setupSlotEvents() {
    elements.photoSlots.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-icon');
        if (!btn) return;
        const slot = btn.closest('.photo-slot');
        const slotIndex = parseInt(slot.dataset.slot);

        if (btn.classList.contains('btn-up')) movePhoto(slotIndex, slotIndex - 1);
        else if (btn.classList.contains('btn-down')) movePhoto(slotIndex, slotIndex + 1);
        else if (btn.classList.contains('btn-remove')) removePhoto(slotIndex);
    });
}

function movePhoto(fromIndex, toIndex) {
    if (toIndex < 0 || toIndex > 2) return;
    const temp = photos[fromIndex];
    photos[fromIndex] = photos[toIndex];
    photos[toIndex] = temp;
    updateSlotUI();
    renderStrip();
    renderA4Preview();
}

function removePhoto(index) {
    photos[index] = null;
    updateSlotUI();
    renderStrip();
    renderA4Preview();
}

// ===== CONTROL EVENTS =====
function setupControlEvents() {
    elements.scaleSlider.addEventListener('input', (e) => {
        scale = e.target.value / 100;
        elements.scaleValue.textContent = `${e.target.value}%`;
        renderA4Preview();
    });

    elements.btnResetAll.addEventListener('click', () => {
        if (confirm('Hapus semua foto?')) {
            photos = [null, null, null];
            updateSlotUI();
            renderStrip();
            renderA4Preview();
        }
    });
}

// ===== CANVAS RENDERING =====
function renderStrip() {
    const canvas = elements.stripCanvas;
    const ctx = canvas.getContext('2d');

    canvas.width = STRIP_WIDTH_PX;
    canvas.height = STRIP_HEIGHT_PX;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    if (backgroundImage) {
        drawImageCover(ctx, backgroundImage, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Hitung ukuran foto dengan gap berbeda atas-bawah vs kiri-kanan
    const totalPhotoHeight = canvas.height - (PHOTO_PADDING_Y * 2) - (PHOTO_PADDING_X * 2);
    const photoHeight = totalPhotoHeight / 3;
    const photoWidth = canvas.width - (PHOTO_PADDING_X * 2);

    // Draw 3 foto
    photos.forEach((photo, index) => {
        const y = PHOTO_PADDING_Y + (index * (photoHeight + PHOTO_PADDING_X));
        const x = PHOTO_PADDING_X;

        if (photo) {
            drawImageCover(ctx, photo, x, y, photoWidth, photoHeight);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, photoWidth, photoHeight);
        } else {
            ctx.fillStyle = '#e0e0e0';
            ctx.fillRect(x, y, photoWidth, photoHeight);
            ctx.fillStyle = '#999';
            ctx.font = '24px Poppins, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`Photo ${index + 1}`, x + photoWidth / 2, y + photoHeight / 2);
        }
    });
}

function renderA4Preview() {
    const canvas = elements.a4Canvas;
    const ctx = canvas.getContext('2d');

    const previewScale = 0.15;
    canvas.width = Math.round(A4_WIDTH_PX * previewScale);
    canvas.height = Math.round(A4_HEIGHT_PX * previewScale);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const stripWidth = STRIP_WIDTH_PX * scale * previewScale;
    const stripHeight = STRIP_HEIGHT_PX * scale * previewScale;
    const x = (canvas.width - stripWidth) / 2;
    const y = (canvas.height - stripHeight) / 2;

    ctx.drawImage(elements.stripCanvas, x, y, stripWidth, stripHeight);
}

function drawImageCover(ctx, img, x, y, width, height) {
    const imgRatio = img.width / img.height;
    const targetRatio = width / height;
    let srcX = 0, srcY = 0, srcWidth = img.width, srcHeight = img.height;

    if (imgRatio > targetRatio) {
        srcWidth = img.height * targetRatio;
        srcX = (img.width - srcWidth) / 2;
    } else {
        srcHeight = img.width / targetRatio;
        srcY = (img.height - srcHeight) / 2;
    }
    ctx.drawImage(img, srcX, srcY, srcWidth, srcHeight, x, y, width, height);
}

// ===== EXPORT FUNCTIONS =====
function setupExportEvents() {
    elements.btnDownloadPDF.addEventListener('click', downloadPDF);
    elements.btnDownloadPNG.addEventListener('click', () => downloadStrip('png'));
    elements.btnDownloadJPG.addEventListener('click', () => downloadStrip('jpeg'));
}

async function downloadPDF() {
    if (typeof window.jspdf === 'undefined') {
        alert('jsPDF library tidak tersedia.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const a4FullCanvas = document.createElement('canvas');
    a4FullCanvas.width = A4_WIDTH_PX;
    a4FullCanvas.height = A4_HEIGHT_PX;
    const ctx = a4FullCanvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, a4FullCanvas.width, a4FullCanvas.height);

    const stripWidth = STRIP_WIDTH_PX * scale;
    const stripHeight = STRIP_HEIGHT_PX * scale;
    const x = (a4FullCanvas.width - stripWidth) / 2;
    const y = (a4FullCanvas.height - stripHeight) / 2;

    ctx.drawImage(elements.stripCanvas, x, y, stripWidth, stripHeight);

    const imgData = a4FullCanvas.toDataURL('image/png');
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: false
    });

    pdf.addImage(imgData, 'PNG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM, undefined, 'NONE');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    pdf.save(`photostrip_${timestamp}.pdf`);
}

function downloadStrip(format) {
    const canvas = elements.stripCanvas;
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const dataURL = canvas.toDataURL(mimeType, 1.0);
    const link = document.createElement('a');
    link.download = `photostrip_${Date.now()}.${format === 'jpeg' ? 'jpg' : 'png'}`;
    link.href = dataURL;
    link.click();
}

// ===== START APP =====
document.addEventListener('DOMContentLoaded', init);
