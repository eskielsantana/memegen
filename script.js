const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

const topText = document.getElementById('topText');
const bottomText = document.getElementById('bottomText');

let multX;
let multY;

let dragging = false;
let resizing = false;
let mouseOver = false;
let startX, startY;
let selectedRect = null;
let resizeHandleType = null;

const textMinSize = 20;

let axisList = [];

const resizeHandleSize = 5;

let image;
let selected = memesList[0];

function drawText() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  canvas.style.width = `${selected.sizeX}px`;
  canvas.style.height = `${selected.sizeY}px`;
  canvas.width = selected.sizeX;
  canvas.height = selected.sizeY;

  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  selected.fields.forEach(function(field) { write(ctx, field.text, field.x + field.width / 2, field.y + field.height / 2, field.style, false); });

  if(mouseOver) {
    axisList = [];
    selected.fields.forEach(function(field) { drawRectangle(field); });
  }
}

function write(canvasCtx, text, x, y, style, big) {
    canvasCtx.font = `${style.italic ? 'italic' : ''} ${style.bold ? 'bold' : ''} ${style.size * (big ? multX : 1)}px ${style.name}`;
    canvasCtx.fillStyle = style.color;
    canvasCtx.textAlign = 'center';
    canvasCtx.textBaseline = 'middle';
    canvasCtx.fillText(text, x, y);

    if(style.stroke) {
      canvasCtx.strokeStyle = style.strokeColor;
      canvasCtx.lineWidth = 2 * (big ? multX : 1);
      canvasCtx.strokeText(text, x, y);
    }
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
  ctx.roundRect(rectX, rectY, resizeHandleSize * 2, resizeHandleSize * 2, 2);
  ctx.stroke();

  ctx.strokeStyle = "black";
  ctx.fillStyle = "rgba(255, 255, 255, .7)";
  ctx.beginPath();
  ctx.roundRect(rectX, rectY, resizeHandleSize * 2, resizeHandleSize * 2, 2);
  ctx.stroke();
  ctx.fill();
}

function updateCanvas(event, index) {
  selected.fields[index].text = event.target.value;

  drawText();
}

function generateBigImage() {
    const offCanvas = document.createElement('canvas');
    const offCtx = offCanvas.getContext('2d');

    offCanvas.width = selected.sizeX * multX;
    offCanvas.height = selected.sizeY * multY;

    offCtx.clearRect(0, 0, offCanvas.width, offCanvas.height);
    offCtx.drawImage(image, 0, 0, offCanvas.width, offCanvas.height);

    selected.fields.forEach(function(field) {
      write(offCtx, field.text, (field.x + field.width / 2) * multX, (field.y + field.height / 2)  * multY, field.style, true);
    });

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

  for(let i = 0; i < selected.fields.length; i++) {
      if(isPointInsideRect(mouseX, mouseY, selected.fields[i])) {
        dragging = true;
        startX = mouseX - selected.fields[i].x;
        startY = mouseY - selected.fields[i].y;
        selectedRect = selected.fields[i];

        break;
      }
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

  if(axis != undefined) { canvas.style.cursor = axis.cursor;
  } else if(isInsideAnyRect(mouseX, mouseY)) { 
    canvas.style.cursor = 'move';
  } else { canvas.style.cursor = 'default'; }
}

function isInsideAnyRect(mouseX, mouseY) {
    for(let i = 0; i < selected.fields.length; i++) {
        if(isPointInsideRect(mouseX, mouseY, selected.fields[i])) { return true; }
    }
    return false;
}

canvas.addEventListener('mousedown',    handleMouseDown);
canvas.addEventListener('mousemove',    handleMouseMove);
canvas.addEventListener('mouseup',      handleMouseUp);
canvas.addEventListener('mouseenter',   handleMouseEnter);
canvas.addEventListener('mouseleave',   handleMouseLeft);

function loadMeme() {
  image = new Image();
  image.crossOrigin = 'Anonymous';

  image.src = `memes/${selected.image}`;

  image.onload = function() {
    multX = image.width / selected.sizeX;
    multY = image.height / selected.sizeY;

    drawText();
    fillEditors();
  };
}

function fillEditors() {
  const listDiv = document.getElementById('fieldsContainer');

  listDiv.innerHTML = "";

  let range;
  selected.fields.forEach(function(field, i) {
    range = document.createRange();
    listDiv.appendChild(range.createContextualFragment(editorField(field.text, i)));
  });
}

function editorField(value, index) {
  return `<div class="textRegion">
            <textarea class="textField" oninput="updateCanvas(event, ${index})">${value}</textarea>
            <div class="textConfigs">
              <input class="fontColorPicker" type="color" id="upPrimaryColorPicker" name="primaryColor" value="#FFFFFF">
              <input class="fontColorPicker" type="color" id="upStrokeColorPicker" name="strokeColor" value="#000000">
              <button id="openModalButton"/>
            </div>
          </div>`;
}

function abrirModal() {
  document.getElementById('modalOverlay').style.display = 'flex';
}

function fecharModal() {
  document.getElementById('modalOverlay').style.display = 'none';
}

document.getElementById('modalOverlay').addEventListener('click', function(event) {
  if (event.target === this) { fecharModal(); }
});

const AxisType = {
  UP_LEFT: 'Up Left', UP: 'Up',
  UP_RIGHT: 'Up Right', RIGHT: 'Right',
  DOWN_RIGHT: 'Down Right', DOWN: 'Down',
  DOWN_LEFT: 'Down Left', LEFT: 'Left',
};

loadMeme();

function fillMemesList() {
  const listDiv = document.getElementById('memesList');

  let range;

  memesList.forEach(function(meme, i) {
    range = document.createRange();
    listDiv.appendChild(range.createContextualFragment(`<img src="memes/${meme.image}" class="thumb" onclick="memeSelected(${i})">`));
  });
}

fillMemesList();

function memeSelected(index) {
  selected = memesList[index];
  loadMeme();
}