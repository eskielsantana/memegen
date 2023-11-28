const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

const topText = document.getElementById('topText');
const bottomText = document.getElementById('bottomText');

const finalWidth = 735;
const finalHeight = 500;
const baseWidth = 500;
const baseHeight = 300;

canvas.style.width = `${baseWidth}px`;
canvas.style.height = `${baseHeight}px`;

let multX = finalWidth / baseWidth;
let multY = finalHeight / baseHeight;

let dragging = false;
let resizing = false;
let mouseOver = false;
let startX, startY;
let selectedText = null;
let selectedRect = null;
let resizeHandleType = null;

const textMinSize = 20;

const perSizeX = canvas.width/100;
const perSizeY = canvas.height/100;

const topTextRect = {
  x: perSizeX,
  y: perSizeY,
  width: perSizeX * 98,
  height: perSizeY * 25,
};

const bottomTextRect = {
  x: perSizeX,
  y: perSizeY * 70,
  width: perSizeX * 98,
  height: perSizeY * 25,
};

let axisList = [];

const resizeHandleSize = 8;
const fontSize = 50;

let textStyles;
let bigTextStyles

function drawText() {
  // Draws background image
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  // Set text styles
  applyTexStyle(ctx, textStyles);

  write(ctx, topText.value, topTextRect.x + topTextRect.width / 2, topTextRect.y + 30); // First line text
  write(ctx, bottomText.value, bottomTextRect.x + bottomTextRect.width / 2, bottomTextRect.y + bottomTextRect.height - 20); // Second line text

  if(mouseOver) {
    axisList = []; // Clean axis list

    drawRectangle(topTextRect); // Draws retangle around upper line text
    drawRectangle(bottomTextRect); // Draws retangle around bottommest text
  }
}

function applyTexStyle(canvasCtx, stl) {
    canvasCtx.font = stl.font;
    canvasCtx.fillStyle = stl.fillStyle;
    canvasCtx.textAlign = stl.textAlign;
    canvasCtx.lineWidth = stl.lineWidth;
    canvasCtx.strokeStyle = 'black';
    canvasCtx.textBaseline = 'middle';
}

function write(canvasCtx, text, x, y) {
    canvasCtx.fillText(text, x, y);
    canvasCtx.strokeText(text, x, y);
}

function drawRectangle(rect) {
  ctx.lineWidth = 1;

  ctx.strokeStyle = 'white';
  ctx.strokeRect(fix(rect.x), fix(rect.y), rect.width, rect.height);

  ctx.setLineDash([5, 5]);

  ctx.strokeStyle = 'black';
  ctx.strokeRect(fix(rect.x), fix(rect.y), rect.width, rect.height);

  ctx.setLineDash([]);

  drawResizeHandles(rect);
}

function drawResizeHandles(rect) {
  ctx.fillStyle = 'gray';

  // Top-left
  createAxis(rect.x - resizeHandleSize                  , rect.y - resizeHandleSize,                    'top-left',     AxisType.UP_LEFT,     'nwse-resize', rect);

  // Top
  createAxis(rect.x + rect.width / 2 - resizeHandleSize , rect.y - resizeHandleSize,                    'top',          AxisType.UP,          'ns-resize', rect);
  
  // Top-right
  createAxis(rect.x + rect.width - resizeHandleSize     , rect.y - resizeHandleSize,                    'top-right',    AxisType.UP_RIGHT,    'nesw-resize', rect);

  // Right
  createAxis(rect.x + rect.width - resizeHandleSize     , rect.y + rect.height / 2 - resizeHandleSize,  'right',        AxisType.RIGHT,       'ew-resize', rect);

  // Bottom-left
  createAxis(rect.x - resizeHandleSize                  , rect.y + rect.height - resizeHandleSize,      'bottom-left',  AxisType.DOWN_LEFT,   'nesw-resize', rect);

  // Bottom
  createAxis(rect.x + rect.width / 2 - resizeHandleSize , rect.y + rect.height - resizeHandleSize,      'bottom',       AxisType.DOWN,        'ns-resize', rect);

  // Bottom-right
  createAxis(rect.x + rect.width - resizeHandleSize     , rect.y + rect.height - resizeHandleSize,      'bottom-right', AxisType.DOWN_RIGHT,  'nwse-resize', rect);

  // Left
  createAxis(rect.x - resizeHandleSize                  , rect.y + rect.height / 2 - resizeHandleSize,  'left',         AxisType.LEFT,        'ew-resize', rect);
}

function createAxis(rectX, rectY, axisId, axisType, axisCursor, rect) {
  drawGrabber(fix(rectX), fix(rectY));

  axisList.push({
    x: rectX, y: rectY,
    width: resizeHandleSize * 2,
    height: resizeHandleSize * 2,
    id: axisId,
    type: axisType,
    cursor: axisCursor,
    textRect: rect,
    isInside: function(mX, mY) { return (mX >= this.x && mX <= this.x + this.width && mY >= this.y && mY <= this.y + this.height); },
  });
}

function drawGrabber(rectX, rectY) {
  ctx.lineWidth = 0.5;
  ctx.roundRect(rectX, rectY, resizeHandleSize * 2, resizeHandleSize * 2, 4);
  ctx.stroke();

  ctx.strokeStyle = "black";
  ctx.fillStyle = "rgba(255, 255, 255, .5)";
  ctx.beginPath();
  ctx.roundRect(rectX, rectY, resizeHandleSize * 2, resizeHandleSize * 2, 4);
  ctx.stroke();
  ctx.fill();
}

function updateCanvas(textType) {
  if (textType === 'topText' || textType === 'bottomText') { drawText(); }
}

function generateBigImage() {
    const offCanvas = document.createElement('canvas');
    const offCtx = offCanvas.getContext('2d');

    offCanvas.width = baseWidth * multX;
    offCanvas.height = baseHeight * multY;

    offCtx.clearRect(0, 0, offCanvas.width, offCanvas.height);
    offCtx.drawImage(image, 0, 0, offCanvas.width, offCanvas.height);

    applyTexStyle(offCtx, bigTextStyles);

    write(offCtx, topText.value, (topTextRect.x + topTextRect.width / 2) * multX, (topTextRect.y + 30) * multY); // First line text
    write(offCtx, bottomText.value, (bottomTextRect.x + bottomTextRect.width / 2) * multX, (bottomTextRect.y + bottomTextRect.height - 20) * multY); // Second line text

    const dataURL = offCanvas.toDataURL('image/jpeg'); // ou 'image/png'

    // Exibir imagem em uma popup
    const popup = window.open('', '_blank');
    popup.document.write('<img src="' + dataURL + '"/>');
}

function fix(value) { return value + 0.5; }

function isPointInsideRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
}

function handleMouseDown(e) {
  const mouseX = e.clientX - canvas.getBoundingClientRect().left;
  const mouseY = e.clientY - canvas.getBoundingClientRect().top;

  let ret = checkInside(mouseX, mouseY);

  if(ret != undefined) {
    resizing = true;
    startX = mouseX;
    startY = mouseY;
    resizeHandleType = ret.type;
    selectedRect = ret.textRect;
    return;
  }

  if (isPointInsideRect(mouseX, mouseY, topTextRect)) {
    dragging = true;
    startX = mouseX - topTextRect.x;
    startY = mouseY - topTextRect.y;
    selectedText = 'topText';
    selectedRect = topTextRect;
  } else if (isPointInsideRect(mouseX, mouseY, bottomTextRect)) {
    dragging = true;
    startX = mouseX - bottomTextRect.x;
    startY = mouseY - bottomTextRect.y;
    selectedText = 'bottomText';
    selectedRect = bottomTextRect;
  }
}

function checkInside(mouseX, mouseY) {
  for (const axis of axisList) {
    if (axis.isInside(mouseX, mouseY)) { return axis; }
  }
  return undefined;
}

function handleMouseMove(e) {
  const mouseX = e.clientX - canvas.getBoundingClientRect().left;
  const mouseY = e.clientY - canvas.getBoundingClientRect().top;

  checkMouseCursor(mouseX, mouseY);

  if (dragging || resizing) {
    if (dragging) {
      selectedRect.x = Math.max(0, Math.min(mouseX - startX, canvas.width - selectedRect.width));
      selectedRect.y = Math.max(0, Math.min(mouseY - startY, canvas.height - selectedRect.height));
    } else if (resizing) {
      
      const deltaX = mouseX - startX;
      const deltaY = mouseY - startY;

      switch (resizeHandleType) {
          case AxisType.UP_LEFT:
              if(isItSafe(selectedRect.height - deltaY)) {
                selectedRect.height -= deltaY;
                selectedRect.y += deltaY;
              }
              if(isItSafe(selectedRect.width - deltaX)){
                selectedRect.width -= deltaX;
                selectedRect.x += deltaX;
              }
            break;
          case AxisType.UP:
              if(isItSafe(selectedRect.height - deltaY)) {
                selectedRect.height -= deltaY;
                selectedRect.y += deltaY;
              }
              break;
          case AxisType.UP_RIGHT:
              if(isItSafe(selectedRect.height - deltaY)) {
                selectedRect.height -= deltaY;
                selectedRect.y += deltaY;
              }
              if(isItSafe(selectedRect.width + deltaX)){
                selectedRect.width += deltaX;
              }
            break;
          case AxisType.RIGHT: 
              if(isItSafe(selectedRect.width + deltaX)){
                selectedRect.width += deltaX;
              }
            break;
          case AxisType.DOWN_RIGHT:
              if(isItSafe(selectedRect.height + deltaY)) {
                selectedRect.height += deltaY;
              }
              if(isItSafe(selectedRect.width + deltaX)){
                selectedRect.width += deltaX;
              }
            break;
          case AxisType.DOWN: 
              if(isItSafe(selectedRect.height + deltaY)) {
                selectedRect.height += deltaY;
              }
              break;
          case AxisType.DOWN_LEFT:
              if(isItSafe(selectedRect.height + deltaY)) {
                selectedRect.height += deltaY;
              }
              if(isItSafe(selectedRect.width - deltaX)){
                selectedRect.width -= deltaX;
                selectedRect.x += deltaX;
              }
            break;
          case AxisType.LEFT:
              if(isItSafe(selectedRect.width - deltaX)){
                selectedRect.width -= deltaX;
                selectedRect.x += deltaX;
              }
              break;
          default: console.log(`Invalid Axis Type: ${resizeHandleSize}`);
      }
      startX = mouseX;
      startY = mouseY;
    }
    drawText();
  }
}

function isItSafe(value) { return value >= textMinSize; }

function safeMoveX(value) { return Math.max(textMinSize, Math.min(value, canvas.width)); }

function safeMoveY(value) { return Math.max(textMinSize, Math.min(value, canvas.height)); }

function handleMouseUp() {
  dragging = false;
  resizing = false;
  resizeHandleType = null;
}

function handleMouseEnter() {
  mouseOver = true;
  drawText();
}

function handleMouseLeft() {
  mouseOver = false;
  handleMouseUp();
  drawText();
}

function checkMouseCursor(mouseX, mouseY) {
  let axis = checkInside(mouseX, mouseY);

  if(axis != undefined) {
    canvas.style.cursor = axis.cursor;
  } else if(isPointInsideRect(mouseX, mouseY, topTextRect) || isPointInsideRect(mouseX, mouseY, bottomTextRect)) {
    canvas.style.cursor = 'move';
  } else {
    canvas.style.cursor = 'default';
  }
}

canvas.addEventListener('mousedown',    handleMouseDown);
canvas.addEventListener('mousemove',    handleMouseMove);
canvas.addEventListener('mouseup',      handleMouseUp);
canvas.addEventListener('mouseenter',   handleMouseEnter);
canvas.addEventListener('mouseleave',   handleMouseLeft);

const image = new Image();
image.crossOrigin = 'Anonymous';
image.src = 'memes/buzz.jpg';
image.onload = function() { 
    multX = image.width / baseWidth;
    multY = image.height / baseHeight;

    textStyles = {
        font: `${fontSize}px Impact`,
        fillStyle: 'white',
        textAlign: 'center',
        lineWidth: 2,
    };
      
    bigTextStyles = {
        font: `${fontSize * multX}px Impact`,
        fillStyle: 'white',
        textAlign: 'center',
        lineWidth: 2 * multX
    };

    drawText(); 
};

  function abrirModal() {
    document.getElementById('modalOverlay').style.display = 'flex';
  }

  function fecharModal() {
    document.getElementById('modalOverlay').style.display = 'none';
  }

  document.getElementById('modalOverlay').addEventListener('click', function(event) {
    if (event.target === this) { fecharModal(); }
  });

  document.getElementById('openModalButton').addEventListener('click', abrirModal);

  const AxisType = {
    UP_LEFT: 'Up Left', UP: 'Up',
    UP_RIGHT: 'Up Right', RIGHT: 'Right',
    DOWN_RIGHT: 'Down Right', DOWN: 'Down',
    DOWN_LEFT: 'Down Left', LEFT: 'Left',
  };