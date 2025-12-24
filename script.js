// ==== SELECTORS ====
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const uploadInput = document.getElementById("upload");
const frameSelect = document.getElementById("frameSelect");
const zoomSlider = document.getElementById("zoomSlider");
const rotateSlider = document.getElementById("rotateSlider");
const resetBtn = document.getElementById("resetBtn");
const downloadBtn = document.getElementById("downloadBtn");

// ==== IMAGES ====
let userImage = new Image();
let frameImage = new Image();

// ==== TRANSFORM VALUES ====
let imgX = canvas.width / 2;
let imgY = canvas.height / 2;
let scale = 1;
let rotation = 0;

// ==== DRAGGING ====
let dragging = false;
let lastX = 0, lastY = 0;
let lastDistance = null;

// ==== UPLOAD IMAGE ====
uploadInput.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    userImage.src = reader.result;
  };
  reader.readAsDataURL(file);
};

userImage.onload = resetImage;

// ==== FRAME SELECTION ====
frameImage.src = frameSelect.value;
frameSelect.onchange = () => {
  frameImage.src = frameSelect.value;
};
frameImage.onload = draw;

// ==== DRAW FUNCTION ====
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Draw user image
  if(userImage.src) {
    ctx.save();
    ctx.translate(imgX, imgY);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);
    ctx.drawImage(userImage, -userImage.width/2, -userImage.height/2);
    ctx.restore();
  }

  // Draw frame overlay
  if(frameImage.src) {
    ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
  }
}

// ==== DRAG EVENTS ====
canvas.onmousedown = e => {
  dragging = true;
  lastX = e.offsetX;
  lastY = e.offsetY;
};
canvas.onmousemove = e => {
  if(!dragging) return;
  imgX += e.offsetX - lastX;
  imgY += e.offsetY - lastY;
  lastX = e.offsetX;
  lastY = e.offsetY;
  draw();
};
canvas.onmouseup = canvas.onmouseleave = () => dragging = false;

// ==== TOUCH EVENTS (DRAG + PINCH) ====
canvas.ontouchstart = e => {
  e.preventDefault();
  if(e.touches.length === 1) {
    dragging = true;
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
  }
  if(e.touches.length === 2) {
    lastDistance = getDistance(e.touches);
  }
};

canvas.ontouchmove = e => {
  e.preventDefault();
  if(e.touches.length === 1 && dragging) {
    imgX += e.touches[0].clientX - lastX;
    imgY += e.touches[0].clientY - lastY;
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
    draw();
  }
  if(e.touches.length === 2) {
    const dist = getDistance(e.touches);
    scale += (dist - lastDistance) * 0.005;
    scale = Math.max(0.05, scale); // allow very small
    zoomSlider.value = scale;
    lastDistance = dist;
    draw();
  }
};

canvas.ontouchend = () => {
  dragging = false;
  lastDistance = null;
};

function getDistance(touches) {
  return Math.hypot(
    touches[0].clientX - touches[1].clientX,
    touches[0].clientY - touches[1].clientY
  );
}

// ==== CONTROLS ====
zoomSlider.oninput = () => {
  scale = parseFloat(zoomSlider.value);
  draw();
};

rotateSlider.oninput = () => {
  rotation = rotateSlider.value * Math.PI / 180;
  draw();
};

// ==== RESET ====
function resetImage() {
  imgX = canvas.width / 2;
  imgY = canvas.height / 2;

  // Fit inside canvas while keeping original ratio
  if(userImage.width && userImage.height) {
    const scaleX = canvas.width / userImage.width;
    const scaleY = canvas.height / userImage.height;
    scale = Math.min(scaleX, scaleY);
  }

  rotation = 0;
  zoomSlider.value = scale;
  rotateSlider.value = 0;
  draw();
}
resetBtn.onclick = resetImage;

// ==== DOWNLOAD ====
downloadBtn.onclick = () => {
  const a = document.createElement("a");
  a.download = "spsb-image.png";
  a.href = canvas.toDataURL("image/png");
  a.click();
};
