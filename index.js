// GLOBAL VARIABLES
let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');

canvas.width = 640;
canvas.height = 800;
canvas.style.border = '5px solid green';
let canvas_width = canvas.width;
let canvas_height = canvas.height;

// ADD SHAPE variables
let isAddingShape = false; // are we in the state of adding a shape
let isMovingNewShape = false; // are we in the state of moving a new shape
let shapeToAdd = null; // object to store temp shape to be added

// SHAPES
let shapes = [];
let current_shape_index = null; // used to find current shape in shapes array
let is_draggin = false; // is the current shape being dragged
let startX;
let startY;

// TODO: Optimize data class, do we need an array for each type of object?
// Make a class for each type of object? and a super class?
// Arrows
let arrowsArray = [];
let current_arrow_index = null;

let isAddingArrow = false;
let isMovingNewArrow = false;
let arrowToAdd = null;
let isArrowDragging = false;

// Calculate offset of canvas from browser window
let offset_x;
let offset_y;
let get_offset = function () {
  let canvas_offsets = canvas.getBoundingClientRect();
  offset_x = canvas_offsets.left;
  offset_y = canvas_offsets.top;
};

get_offset();
window.onscroll = function () {
  get_offset();
};

window.onresize = function () {
  get_offset();
};

canvas.onresize = function () {
  get_offset();
};

let add_arrow = function () {
  isAddingArrow = true;
};

// STORAGE
let data = {
  shapes: [new Player({ position: { x: 0, y: 0 }, number: 0 })],
  arrowsArray: [],
};

let reset_local_storage = function () {
  localStorage.removeItem('data');
  shapes = [];
  arrowsArray = [];
  draw_shapes();
};
let initialize_local_storage = function () {
  if (localStorage.getItem('data')) {
    data = JSON.parse(localStorage.getItem('data'));
    for (let shape of data.shapes) {
      shapes.push(new Player(shape));
    }
    for (let arrow of data.arrowsArray) {
      arrowsArray.push(new Arrow(arrow));
    }
  } else {
    localStorage.setItem('data', JSON.stringify(data));
  }
};
initialize_local_storage();

let saveData = function () {
  data = { shapes, arrowsArray };
  localStorage.setItem('data', JSON.stringify(data));
};

// Keyboard events
document.addEventListener('keydown', function (event) {
  // Escape key should act like normal, unselects shape, etc.
  if (event.key === 'Escape') {
    isAddingShape = false;
    isMovingNewShape = false;
    shapeToAdd = null;
    isAddingArrow = false;
    isMovingNewArrow = false;
    arrowToAdd = null;
    isArrowDragging = false;
    resetShapes();
    draw_shapes();
  } else if (event.key === 'Delete') {
    if (current_shape_index !== null) {
      shapes.splice(current_shape_index, 1);
      current_shape_index = null;
    } else if (current_arrow_index !== null) {
      arrowsArray.splice(current_arrow_index, 1);
      current_arrow_index = null;
    }
    resetShapes();
    saveData();
    draw_shapes();
  }
});

// State is set to adding a shape
let add_shape = function (event) {
  isAddingShape = true;
};

// State is set to normal dragging mode
let allow_move = function (event) {
  isAddingShape = false;
  isMovingNewShape = false;
  shapeToAdd = null;
  isAddingArrow = false;
  isArrowDragging = false;
  isMovingNewArrow = false;
  resetShapes();
  draw_shapes();
};

// MOUSE EVENTS
// Check if mouse is in shape so it can be dragged
let is_mouse_in_shape = function (x, y, shape) {
  let shape_left = shape.position.x;
  let shape_right = shape.position.x + shape.width;
  let shape_top = shape.position.y;
  let shape_bottom = shape.position.y + shape.height;
  if (x > shape_left && x < shape_right && y > shape_top && y < shape_bottom) {
    return true;
  }

  return false;
};

let is_mouse_in_arrow = function (x, y, arrow) {
  // arrow starting and ending points can be on either side, so need to find which is farthest left and right, and farthest top and bottom

  let shape_left =
    arrow.position.startX < arrow.position.endX
      ? arrow.position.startX
      : arrow.position.endX;
  let shape_right =
    arrow.position.startX > arrow.position.endX
      ? arrow.position.startX + 10 // +10 is to make the hitbox bigger
      : arrow.position.endX + 10; //  +10 is to make the hitbox bigger
  let shape_top =
    arrow.position.startY < arrow.position.endY
      ? arrow.position.startY + 10 // +10 is to make the hitbox bigger
      : arrow.position.endY + 10; //  +10 is to make the hitbox bigger
  let shape_bottom =
    arrow.position.startY > arrow.position.endY
      ? arrow.position.startY
      : arrow.position.endY;

  if (x > shape_left && x < shape_right && y > shape_top && y < shape_bottom) {
    return true;
  }
  return false;
};

// Handle all mouse down events
let mouse_down = function (event) {
  resetShapes();
  if (isAddingShape) {
    // isAddingShape is only true at the very start of adding a new shape, and goes to false once we are moving that shape
    // this check is so the code for checking if mouse_down is in a shape does not run
    return;
  }

  // if we are moving a new shape, then we need to add it to the shapes array
  else if (isMovingNewShape) {
    shapeToAdd.color = 'rgba(255,0,0,1)';
    shapes.push(shapeToAdd);
    shapeToAdd = null;
    isMovingNewShape = false;
    isAddingShape = true; // this is so we can add another shape
    saveData();
    return;
  }
  // initial mousedown to start beginning of arrow
  else if (isAddingArrow) {
    startX = parseInt(event.clientX - offset_x);
    startY = parseInt(event.clientY - offset_y);
    isAddingArrow = false;
    isMovingNewArrow = true;
    arrowToAdd = new Arrow({ position: { startX, startY, startX, startY } });
    return;
  }

  // starting point of arrow has been selected and we are moving the mouse to select the end point
  else if (isMovingNewArrow) {
    arrowsArray.push(arrowToAdd);
    arrowToAdd = null;
    isMovingNewArrow = false;
    isAddingArrow = true; // this is so we can add another arrow
    saveData();
    return;
  }

  // Calculate mouse position and allow dragging if mouse is over a shape
  startX = parseInt(event.clientX - offset_x);
  startY = parseInt(event.clientY - offset_y);
  let index = 0;
  resetShapes();
  for (let shape of shapes) {
    if (is_mouse_in_shape(startX, startY, shape)) {
      current_shape_index = index;
      shapes[current_shape_index].isMoving = true;
      is_draggin = true;
      draw_shapes();
      return;
    }
    index++;
  }

  index = 0;
  for (let arrow of arrowsArray) {
    if (is_mouse_in_arrow(startX, startY, arrow)) {
      current_arrow_index = index;
      // TODO add isMoving to arrow class
      // arrowsArray[current_arrow_index].isMoving = true;
      isArrowDragging = true;
      draw_shapes();
      return;
    }
    index++;
  }
};

// Handle all mouse up events
let mouse_up = function (event) {
  if (is_draggin) {
    event.preventDefault();
    is_draggin = false;
    draw_shapes();
    saveData();
  } else if (isArrowDragging) {
    event.preventDefault();
    isArrowDragging = false;
    draw_shapes();
    saveData();
  }
};

// Handle all mouse out events
let mouse_out = function (event) {
  is_draggin = false;
  isArrowDragging = false;
};

// Handle all mouse move events
let mouse_move = function (event) {
  // draging existing shape
  let mouseX = parseInt(event.clientX - offset_x);
  let mouseY = parseInt(event.clientY - offset_y);
  let dx = mouseX - startX;
  let dy = mouseY - startY;

  console.log(mouseX, mouseY);
  if (is_draggin) {
    event.preventDefault();

    let current_shape = shapes[current_shape_index];

    current_shape.position.x += dx;
    current_shape.position.y += dy;

    draw_shapes();
    startX = mouseX;
    startY = mouseY;
  }
  // initial check to add a new shape before changing state to isMovingNewShape = true
  else if (isAddingShape) {
    event.preventDefault();

    if (shapeToAdd === null) {
      shapeToAdd = new Player({
        position: { x: mouseX, y: mouseY },
        number: 0,
        color: 'rgba(255,0,0,.25',
      });
      draw_shapes();
      isMovingNewShape = true;
      isAddingShape = false;
    }
  }
  // moving new shape that has not been placed yet
  else if (isMovingNewShape) {
    shapeToAdd.position.x = mouseX;
    shapeToAdd.position.y = mouseY;

    draw_shapes();
    startX = mouseX;
    startY = mouseY;
  }
  // moving end of new arrow that has not been placed yet
  else if (isMovingNewArrow) {
    arrowToAdd.position.endX = mouseX;
    arrowToAdd.position.endY = mouseY;

    draw_shapes();
  } else if (isArrowDragging) {
    let currentArrow = arrowsArray[current_arrow_index];

    currentArrow.position.startX += dx;
    currentArrow.position.startY += dy;
    currentArrow.position.endX += dx;
    currentArrow.position.endY += dy;

    draw_shapes();
    startX = mouseX;
    startY = mouseY;
  }
};

// EVENT LISTENERS
canvas.onmousedown = mouse_down;
canvas.onmouseup = mouse_up;
canvas.onmouseout = mouse_out;
canvas.onmousemove = mouse_move;

// RESET SHAPES to default values
let resetShapes = function () {
  for (let shape of shapes) {
    shape.isMoving = false;
    current_arrow_index = null;
    current_shape_index = null;
  }
};

// MAIN DRAWING FUNCTION
let draw_shapes = function () {
  context.clearRect(0, 0, canvas_width, canvas_height);

  for (let shape of shapes) {
    shape.draw();
  }
  if (shapeToAdd) {
    shapeToAdd.draw();
  }

  for (let arrow of arrowsArray) {
    arrow.draw();
  }

  if (arrowToAdd) {
    arrowToAdd.draw();
  }
};

draw_shapes();
