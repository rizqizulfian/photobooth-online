
const fontList = [
  "Poppins",
  "Lobster",
  "Pacifico",
  "Dancing Script",
  "Satisfy",
  "Amatic SC",
  "Indie Flower",
  "Caveat",
  "Shadows Into Light",
  "Gloria Hallelujah",
  "Chewy",
  "Comic Neue",
  "Baloo 2",
  "Fredoka",
  "Handlee",
  "Patrick Hand",
  "Comfortaa",
  "Bree Serif",
  "Yellowtail",
  "Great Vibes"
];

const stripPreviewCanvas = new fabric.Canvas('stripPreviewCanvas');
stripPreviewCanvas.on('object:added', updateDownloadLink);
stripPreviewCanvas.on('object:modified', updateDownloadLink);

function updateDownloadLink() {
  downloadBtn.href = stripPreviewCanvas.toDataURL({
    format: 'png',
    quality: 1.0
  });
}

let latestStripDataURL = "";
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const countdown = document.getElementById('countdown');
const startBtn = document.getElementById('startBtn');
const photoContainer = document.getElementById('photoContainer');
const frameColorPicker = document.getElementById('frameColor');
const stripPreview = document.getElementById('stripPreview');
const downloadBtn = document.getElementById('downloadBtn');
const editUlangBtn = document.getElementById('editUlangBtn');
const editCanvasSticker = document.getElementById('editCanvasSticker');
const nextBtn = document.getElementById('nextBtn');
const fase1 = document.getElementById('fase-1');
const fase2 = document.getElementById('fase-2');

const photos = [null, null, null, null];

function initCamera() {
  navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: 1280 }, height: { ideal: 960 } }
  }).then(stream => {
    video.srcObject = stream;
  }).catch(err => {
    alert("Gagal mengakses kamera: " + err);
  });
}

function showCountdown(callback) {
  let count = 3;
  countdown.style.display = 'block';
  countdown.textContent = count;

  const interval = setInterval(() => {
    count--;
    if (count > 0) {
      countdown.textContent = count;
    } else {
      clearInterval(interval);
      countdown.style.display = 'none';
      callback();
    }
  }, 1000);
}

function takePhoto(index) {
  document.getElementById('shutterSound')?.play().catch(() => { });
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  photos[index] = canvas.toDataURL('image/png');
  showFlash();
  updatePreview();
}

function showFlash() {
  const flash = document.getElementById('flashEffect');
  flash.style.opacity = 1;
  setTimeout(() => {
    flash.style.opacity = 0;
  }, 100);
}

function updatePreview() {
  photoContainer.innerHTML = '';
  photos.forEach((src, index) => {
    if (!src) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'photo-item';

    const img = document.createElement('img');
    img.src = src;

    const overlay = document.createElement('div');
    overlay.className = 'photo-overlay';
    overlay.innerHTML = '📷';

    wrapper.appendChild(img);
    wrapper.appendChild(overlay);

    wrapper.addEventListener('click', () => {
      showCountdown(() => takePhoto(index));
    });

    photoContainer.appendChild(wrapper);
  });

  const allTaken = photos.every(p => p !== null);
  nextBtn.style.display = allTaken ? 'inline-block' : 'none';
}


function takePhotosSequence(index = 0) {
  if (index >= 4) return;
  showCountdown(() => {
    takePhoto(index);
    setTimeout(() => takePhotosSequence(index + 1), 500);
  });
}

function renderStrip() {
  const filledPhotos = photos.filter(p => p);
  if (filledPhotos.length === 0) return;

  const photoWidth = 640;
  const photoHeight = 480;
  const paddingY = 50;
  const marginX = 40;
  const marginTop = 30;
  const marginBottom = 200;

  const totalHeight = marginTop + filledPhotos.length * photoHeight + (filledPhotos.length - 1) * paddingY + marginBottom;
  const totalWidth = photoWidth + 2 * marginX;

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = totalWidth;
  tempCanvas.height = totalHeight;
  const ctxStrip = tempCanvas.getContext('2d');

  ctxStrip.fillStyle = frameColorPicker.value;
  ctxStrip.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

  let loadedCount = 0;
  filledPhotos.forEach((src, index) => {
    const img = new Image();
    img.onload = () => {
      const x = marginX;
      const y = marginTop + index * (photoHeight + paddingY);
      ctxStrip.drawImage(img, x, y, photoWidth, photoHeight);

      loadedCount++;
      if (loadedCount === filledPhotos.length) {
        const dataURL = tempCanvas.toDataURL('image/png');
        latestStripDataURL = dataURL;
        stripPreviewCanvas.renderAll();
        // Set sebagai backgroundImage ke Fabric Canvas
        fabric.Image.fromURL(dataURL, function (img) {
          const targetWidth = 200;
          const scaleFactor = targetWidth / img.width;
          const targetHeight = img.height * scaleFactor;

          stripPreviewCanvas.setWidth(targetWidth);
          stripPreviewCanvas.setHeight(targetHeight);

          img.scaleToWidth(stripPreviewCanvas.width);
          img.scaleToHeight(stripPreviewCanvas.height);

          stripPreviewCanvas.setBackgroundImage(img, () => {
            stripPreviewCanvas.renderAll();

            // set href ke sini, setelah renderAll selesai
            downloadBtn.href = stripPreviewCanvas.toDataURL({
              format: 'png',
              quality: 1.0
            });
          });
        });
      }
    };
    img.src = src;
  });
}

function showCountdown(callback) {
  let count = 3;

  function animateCount() {
    countdown.textContent = count;
    countdown.style.display = 'block';

    // Trigger ulang animasi
    countdown.style.animation = 'none';
    void countdown.offsetWidth; // force reflow
    countdown.style.animation = 'countdownZoomFade 1s ease-in-out';

    count--;
    if (count >= 0) {
      setTimeout(animateCount, 100);
    } else {
      countdown.style.display = 'none';
      callback();
    }
  }

  animateCount();
}


frameColorPicker.addEventListener('input', renderStrip);

startBtn.addEventListener('click', () => {
  photos.fill(null);
  updatePreview();
  takePhotosSequence();
});

nextBtn.addEventListener('click', () => {
  renderStrip();
  fase1.style.display = 'none';
  fase2.style.display = 'flex';
});

editUlangBtn.addEventListener('click', () => {
  fase1.style.display = 'block';
  fase2.style.display = 'none';
});

initCamera();
const presetColors = [
  '#ffffff', '#000000', '#4fc3f7',
  '#4caf50', '#ff7043', '#8e24aa', '#00bcd4', '#cddc39',
  'rgb(118, 18, 19)', 'rgb(0, 105, 42)', 'rgb(183, 162, 255)',
];

const presetContainer = document.getElementById('presetColors');

function renderPresetColors() {
  presetContainer.innerHTML = '';
  presetColors.forEach(color => {
    const btn = document.createElement('div');
    btn.className = 'color-circle';

    if (color.startsWith('linear-gradient')) {
      btn.style.background = color;
    } else {
      btn.style.backgroundColor = color;
    }

    btn.addEventListener('click', () => {
      frameColorPicker.value = rgbToHex(btn.style.backgroundColor);
      renderStrip();
      updateSelectedColor(btn.style.backgroundColor);
    });

    presetContainer.appendChild(btn);
  });
}

function updateSelectedColor(color) {
  document.querySelectorAll('.color-circle').forEach(el => {
    el.classList.remove('selected');
    if (el.style.backgroundColor.toLowerCase() === color.toLowerCase()) {
      el.classList.add('selected');
    }
  });
}

function rgbToHex(rgb) {
  const result = rgb.match(/\d+/g);
  if (!result) return '#ffffff';
  return '#' + result.slice(0, 3).map(x => (+x).toString(16).padStart(2, '0')).join('');
}

frameColorPicker.addEventListener('input', () => {
  renderStrip();
  updateSelectedColor(frameColorPicker.value);
});

renderPresetColors();
updateSelectedColor(frameColorPicker.value);

document.getElementById('uploadSticker').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (f) {
    fabric.Image.fromURL(f.target.result, function (img) {
      // Resize kalau terlalu besar
      const maxSize = 150;
      const scaleFactor = Math.min(maxSize / img.width, maxSize / img.height, 1);
      img.scale(scaleFactor);

      img.set({
        left: stripPreviewCanvas.getWidth() / 2 - (img.getScaledWidth() / 2),
        top: stripPreviewCanvas.getHeight() / 2 - (img.getScaledHeight() / 2),
        hasControls: true,
        hasBorders: true,
        selectable: true,
      });

      stripPreviewCanvas.add(img);
      stripPreviewCanvas.setActiveObject(img);
      stripPreviewCanvas.renderAll(); // pastikan canvas selesai render
      downloadBtn.href = stripPreviewCanvas.toDataURL({
        format: 'png',
        quality: 1.0
      });
    });
  };
  reader.readAsDataURL(file);
  stripPreviewCanvas.renderAll();
  // Reset file input supaya bisa upload stiker yang sama lagi
  e.target.value = '';
});

document.getElementById('addTextBtn').addEventListener('click', function () {
  const textValue = document.getElementById('textInput').value.trim();
  if (!textValue) return;

  const text = new fabric.Textbox(textValue, {
    left: stripPreviewCanvas.getWidth() / 2,
    top: stripPreviewCanvas.getHeight() / 2,
    fontSize: 20,
    fill: '#000',
    fontFamily: 'Arial',
    editable: true,
    textAlign: 'center',
    originX: 'center',
    originY: 'center',
  });

  stripPreviewCanvas.add(text);
  stripPreviewCanvas.setActiveObject(text);
  stripPreviewCanvas.renderAll();

  // Kosongkan input setelah menambahkan teks
  document.getElementById('textInput').value = '';
});

downloadBtn.addEventListener('click', (e) => {
  e.preventDefault(); // biar ga langsung reload

  const json = stripPreviewCanvas.toJSON();

  // Ukuran asli (misalnya 640px lebar strip asli)
  const originalWidth = 640;
  const scaleFactor = originalWidth / stripPreviewCanvas.width;
  const originalHeight = stripPreviewCanvas.height * scaleFactor;

  // Buat canvas Fabric.js baru sementara
  const tempCanvasEl = document.createElement('canvas');
  tempCanvasEl.width = originalWidth;
  tempCanvasEl.height = originalHeight;
  const tempCanvas = new fabric.Canvas(tempCanvasEl);

  // Sesuaikan ukuran semua objek (termasuk backgroundImage)
  tempCanvas.loadFromJSON(json, () => {
    tempCanvas.setWidth(originalWidth);
    tempCanvas.setHeight(originalHeight);

    tempCanvas.getObjects().forEach(obj => {
      obj.scaleX *= scaleFactor;
      obj.scaleY *= scaleFactor;
      obj.left *= scaleFactor;
      obj.top *= scaleFactor;
      obj.setCoords();
    });

    // Scale background image juga
    if (tempCanvas.backgroundImage) {
      tempCanvas.backgroundImage.scaleX *= scaleFactor;
      tempCanvas.backgroundImage.scaleY *= scaleFactor;
      tempCanvas.backgroundImage.left *= scaleFactor;
      tempCanvas.backgroundImage.top *= scaleFactor;
    }

    tempCanvas.renderAll();

    // Buat DataURL dan trigger download
    const dataURL = tempCanvas.toDataURL({
      format: 'png',
      quality: 1.0
    });

    // Trigger download manual
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'photostrip-hd.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Delete' || e.key === 'Backspace') {
    const activeObject = stripPreviewCanvas.getActiveObject();
    if (activeObject) {
      stripPreviewCanvas.remove(activeObject);
      stripPreviewCanvas.discardActiveObject();
      stripPreviewCanvas.renderAll();
    }
  }
});

document.getElementById('deleteObjectBtn').addEventListener('click', function () {
  const activeObject = stripPreviewCanvas.getActiveObject();
  if (activeObject) {
    stripPreviewCanvas.remove(activeObject);
    stripPreviewCanvas.discardActiveObject();
    stripPreviewCanvas.renderAll();
  } else {
    alert("Pilih objek terlebih dahulu.");
  }
});

stripPreviewCanvas.on('selection:created', toggleDeleteButton);
stripPreviewCanvas.on('selection:updated', toggleDeleteButton);
stripPreviewCanvas.on('selection:cleared', toggleDeleteButton);

function toggleDeleteButton() {
  const deleteBtn = document.getElementById('deleteObjectBtn');
  const activeObject = stripPreviewCanvas.getActiveObject();

  if (activeObject) {
    deleteBtn.style.display = 'inline-block';
  } else {
    deleteBtn.style.display = 'none';
  }
}

document.getElementById('addTextBtn').addEventListener('click', function () {
  const textValue = document.getElementById('textInput').value.trim();
  const textColor = document.getElementById('textColorPicker').value;

  if (!textValue) return;

  const text = new fabric.Textbox(textValue, {
    left: stripPreviewCanvas.getWidth() / 2,
    top: stripPreviewCanvas.getHeight() / 2,
    fontSize: 20,
    fill: textColor,
    fontFamily: 'Arial',
    editable: true,
    textAlign: 'center',
    originX: 'center',
    originY: 'center',
  });

  stripPreviewCanvas.add(text);
  stripPreviewCanvas.setActiveObject(text);
  stripPreviewCanvas.renderAll();

  document.getElementById('textInput').value = '';
});

document.getElementById('textColorPicker').addEventListener('input', function () {
  const activeObject = stripPreviewCanvas.getActiveObject();
  if (activeObject && activeObject.type === 'textbox') {
    activeObject.set('fill', this.value);
    stripPreviewCanvas.renderAll();
  }
});

const fontSelector = document.getElementById('fontSelector');

fontList.forEach(font => {
  const option = document.createElement('option');
  option.value = font;
  option.innerText = font;
  option.style.fontFamily = font;
  fontSelector.appendChild(option);
});

fontSelector.addEventListener('change', function () {
  const activeObject = stripPreviewCanvas.getActiveObject();
  if (activeObject && activeObject.type === 'textbox') {
    activeObject.set('fontFamily', this.value);
    stripPreviewCanvas.requestRenderAll();
  }
});

document.getElementById('uploadFont').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    const fontData = event.target.result;
    const fontName = file.name.replace(/\.[^/.]+$/, ""); // remove extension

    const font = new FontFace(fontName, fontData);
    font.load().then(function (loadedFont) {
      document.fonts.add(loadedFont);

      // Tambahkan ke dropdown font
      const fontSelector = document.getElementById('fontSelector');
      const option = document.createElement('option');
      option.value = fontName;
      option.innerText = fontName;
      option.style.fontFamily = fontName;
      fontSelector.appendChild(option);

      // Auto-select font baru
      fontSelector.value = fontName;

      // Ubah font pada object aktif jika ada
      const activeObject = stripPreviewCanvas.getActiveObject();
      if (activeObject && activeObject.type === 'textbox') {
        activeObject.set('fontFamily', fontName);
        stripPreviewCanvas.requestRenderAll();
      }

      alert(`Font "${fontName}" berhasil ditambahkan!`);
    }).catch(function (err) {
      alert("Gagal memuat font: " + err);
    });
  };

  reader.readAsArrayBuffer(file); // <- HARUS ArrayBuffer untuk FontFace API
});

document.querySelectorAll('#presetStickerGrid img').forEach(imgEl => {
  imgEl.addEventListener('click', () => {
    const url = imgEl.src;

    const isExternal = url.startsWith("http");

    const onLoadImage = function (img) {
      const maxSize = 150;
      const scaleFactor = Math.min(maxSize / img.width, maxSize / img.height, 1);
      img.scale(scaleFactor);
      img.set({
        left: stripPreviewCanvas.getWidth() / 2 - (img.getScaledWidth() / 2),
        top: stripPreviewCanvas.getHeight() / 2 - (img.getScaledHeight() / 2),
        hasControls: true,
        hasBorders: true,
        selectable: true,
        evented: true
      });

      stripPreviewCanvas.add(img);
      stripPreviewCanvas.discardActiveObject();
      stripPreviewCanvas.renderAll();

      downloadBtn.href = stripPreviewCanvas.toDataURL({
        format: 'png',
        quality: 1.0
      });
    };

    // Gunakan opsi crossOrigin hanya jika gambar eksternal
    if (isExternal) {
      fabric.Image.fromURL(url, onLoadImage, { crossOrigin: 'anonymous' });
    } else {
      fabric.Image.fromURL(url, onLoadImage);
    }
  });
});
