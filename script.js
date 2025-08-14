const uploadArea = document.getElementById("uploadArea");
const uploadBtn = document.querySelector(".upload-btn");
const downloadBtn = document.querySelector(".download-btn");

const previewBoxes = document.querySelectorAll(".preview-box");
const originalPreview = previewBoxes[0];
const pixelPreview = previewBoxes[1];

let pixelatedCanvas = null;


function createImageElement(file, callback) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            callback(img);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Pixelate function
function pixelateImage(img, pixelSize = 8) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const w = img.width;
    const h = img.height;
    canvas.width = w;
    canvas.height = h;

    // Step 1: Resize kecil
    ctx.drawImage(img, 0, 0, w / pixelSize, h / pixelSize);

    // Step 2: Resize balik ke ukuran semula
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
        canvas,
        0,
        0,
        w / pixelSize,
        h / pixelSize,
        0,
        0,
        w,
        h
    );

    return canvas;
}

// Preview Original & Pixelated
function showPreviews(img) {
    const boxSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--preview-size'));

    // Preview original
    originalPreview.innerHTML = "";
    const origCanvas = document.createElement("canvas");
    origCanvas.width = boxSize;
    origCanvas.height = boxSize;
    const origCtx = origCanvas.getContext("2d");

    let scale = Math.min(boxSize / img.width, boxSize / img.height);
    let x = (boxSize - img.width * scale) / 2;
    let y = (boxSize - img.height * scale) / 2;
    origCtx.drawImage(img, x, y, img.width * scale, img.height * scale);
    originalPreview.appendChild(origCanvas);

    // Preview pixelated
    pixelPreview.innerHTML = "";
    const pixCanvas = document.createElement("canvas");
    pixCanvas.width = boxSize;
    pixCanvas.height = boxSize;
    const pixCtx = pixCanvas.getContext("2d");

    // Bikin pixelated dulu
    const tmpCanvas = pixelateImage(img, 10);
    scale = Math.min(boxSize / tmpCanvas.width, boxSize / tmpCanvas.height);
    x = (boxSize - tmpCanvas.width * scale) / 2;
    y = (boxSize - tmpCanvas.height * scale) / 2;
    pixCtx.drawImage(tmpCanvas, x, y, tmpCanvas.width * scale, tmpCanvas.height * scale);
    pixelPreview.appendChild(pixCanvas);

    pixelatedCanvas = tmpCanvas; // untuk download versi full
}


function handleFile(file) {
    if (!file.type.startsWith("image/")) {
        alert("Please upload an image file");
        return;
    }
    createImageElement(file, (img) => {
        showPreviews(img);
    });
}


uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = "#6aa5ff";
});

uploadArea.addEventListener("dragleave", () => {
    uploadArea.style.borderColor = "#ccc";
});

uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = "#ccc";
    const file = e.dataTransfer.files[0];
    handleFile(file);
});


uploadBtn.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
        const file = e.target.files[0];
        handleFile(file);
    };
    input.click();
});


downloadBtn.addEventListener("click", () => {
    if (!pixelatedCanvas) {
        alert("No pixelated image to download");
        return;
    }
    const link = document.createElement("a");
    link.download = "pixelmood.png";
    link.href = pixelatedCanvas.toDataURL();
    link.click();
});
