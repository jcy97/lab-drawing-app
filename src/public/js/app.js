const canvas = document.querySelector("canvas"),
  toolBtns = document.querySelectorAll(".tool"),
  fillColor = document.querySelector("#fill-color"),
  sizeSlider = document.querySelector("#size-slider"),
  colorBtns = document.querySelectorAll(".colors .option"),
  colorPicker = document.querySelector("#color-picker"),
  clearCanvas = document.querySelector(".clear-canvas"),
  saveImg = document.querySelector(".save-image"),
  ctx = canvas.getContext("2d");
let prevMouseX,
  prevMouseY,
  snapShot,
  isDrawing = false,
  selectedTool = "brush",
  selectedColor = "#fff",
  brushWidth = 5;

window.addEventListener("load", () => {
  const scaleFactor = 2;
  canvas.width = canvas.offsetWidth * scaleFactor;
  canvas.height = canvas.offsetHeight * scaleFactor;
  ctx.scale(scaleFactor, scaleFactor);
});

const drawRect = (e) => {
  if (!fillColor.checked) {
    return ctx.strokeRect(
      e.offsetX,
      e.offsetY,
      prevMouseX - e.offsetX,
      prevMouseY - e.offsetY
    );
  }
  ctx.fillRect(
    e.offsetX,
    e.offsetY,
    prevMouseX - e.offsetX,
    prevMouseY - e.offsetY
  );
};

const drawCircle = (e) => {
  ctx.beginPath();
  let radius = Math.sqrt(
    Math.pow(prevMouseX - e.offsetX, 2) + Math.pow(prevMouseY - e.offsetY, 2)
  );
  ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
  fillColor.checked ? ctx.fill() : ctx.stroke();
};

const drawTriangle = (e) => {
  ctx.beginPath();
  ctx.moveTo(prevMouseX, prevMouseY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);
  ctx.closePath();
  fillColor.checked ? ctx.fill() : ctx.stroke();
};
const startDraw = (e) => {
  isDrawing = true;
  const rect = canvas.getBoundingClientRect();
  prevMouseX = e.clientX - rect.left;
  prevMouseY = e.clientY - rect.top;
  ctx.beginPath();
  ctx.lineWidth = brushWidth;
  ctx.strokeStyle = selectedColor;
  ctx.fillStyle = selectedColor;
  snapShot = ctx.getImageData(0, 0, canvas.width, canvas.height);
};
const drawing = (e) => {
  if (!isDrawing) return;
  const rect = canvas.getBoundingClientRect();
  ctx.putImageData(snapShot, 0, 0);
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  if (selectedTool === "brush" || selectedTool === "eraser") {
    ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
    ctx.lineTo(mouseX, mouseY);
    ctx.stroke();
  } else if (selectedTool === "rectangle") {
    drawRect({ offsetX: mouseX, offsetY: mouseY });
  } else if (selectedTool === "circle") {
    drawCircle({ offsetX: mouseX, offsetY: mouseY });
  } else {
    drawTriangle({ offsetX: mouseX, offsetY: mouseY });
  }
};
toolBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(".options .active").classList.remove("active");
    btn.classList.add("active");
    selectedTool = btn.id;
  });
});
sizeSlider.addEventListener("change", () => (brushWidth = sizeSlider.value));
colorBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(".options .selected").classList.remove("selected");
    btn.classList.add("selected");
    selectedColor = window
      .getComputedStyle(btn)
      .getPropertyValue("background-color");
  });
});

colorPicker.addEventListener("change", () => {
  colorPicker.parentElement.style.background = colorPicker.value;
  colorPicker.parentElement.click();
});
clearCanvas.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

saveImg.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = `${Date.now()}.jpg`;
  link.href = canvas.toDataURL();
  link.click();
});
canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", () => (isDrawing = false));
