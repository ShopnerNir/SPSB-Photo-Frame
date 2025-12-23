const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let userImage = new Image();
let frameImage = new Image();

let imgX = canvas.width / 2;
let imgY = canvas.height / 2;
let scale = 1;
let rotation = 0;

let dragging = false;
let lastX = 0, lastY = 0;
let lastDistance = null;

// ---------- Upload ----------
upload.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;

  const r = new FileReader();
  r.onload = () => userImage.src = r.result;
  r.readAsDataURL(file);
};

userImage.onload = resetImage;

// ---------- Frame ----------
frameImage.src = frameSelect.value;
frameSelect.onchange = () => {
  frameImage.src = frameSelect.value;
};

frameImage.onload = draw;

// ---------- Draw ----------
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  if (userImage.src) {
    ctx.save();
    ctx.translate(imgX, imgY);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);
    ctx.drawImage(userImage, -userImage.width/2, -userImage.height/2);
    ctx.restore();
  }

  if (frameImage.src) {
    ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
  }
}

// ---------- Drag ----------
canvas.onmousedown = e => {
  dragging = true;
  lastX = e.offsetX;
  lastY = e.offsetY;
};

canvas.onmousemove = e => {
  if (!dragging) return;
  imgX += e.offsetX - lastX;
  imgY += e.offsetY - lastY;
  lastX = e.offsetX;
  lastY = e.offsetY;
  draw();
};

canvas.onmouseup = () => dragging = false;
canvas.onmouseleave = () => dragging = false;

// ---------- Touch (drag + pinch zoom) ----------
canvas.ontouchstart = e => {
  if (e.touches.length === 1) {
    dragging = true;
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
  }
  if (e.touches.length === 2) {
    lastDistance = getDistance(e.touches);
  }
};

canvas.ontouchmove = e => {
  e.preventDefault();

  if (e.touches.length === 1 && dragging) {
    imgX += e.touches[0].clientX - lastX;
    imgY += e.touches[0].clientY - lastY;
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
    draw();
  }

  if (e.touches.length === 2) {
    const dist = getDistance(e.touches);
    scale += (dist - lastDistance) * 0.005;
    scale = Math.max(0.2, Math.min(3, scale));
    zoomSlider.value = scale;
    lastDistance = dist;
    draw();
  }
};

canvas.ontouchend = () => {
  dragging = false;
  lastDistance = null;
};

function getDistance(t) {
  return Math.hypot(
    t[0].clientX - t[1].clientX,
    t[0].clientY - t[1].clientY
  );
}

// ---------- Controls ----------
zoomSlider.oninput = () => {
  scale = parseFloat(zoomSlider.value);
  draw();
};

rotateSlider.oninput = () => {
  rotation = rotateSlider.value * Math.PI / 180;
  draw();
};

reset.onclick = resetImage;

function resetImage() {
  imgX = canvas.width / 2;
  imgY = canvas.height / 2;
  scale = 1;
  rotation = 0;
  zoomSlider.value = 1;
  rotateSlider.value = 0;
  draw();
}

// ---------- Download ----------
download.onclick = () => {
  const a = document.createElement("a");
  a.download = "framed-image.png";
  a.href = canvas.toDataURL("image/png");
  a.click();
};
