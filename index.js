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

let add_arrow = function () {
  isAddingArrow = true;
  console.log('add_arrow');
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
    resetShapes();
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

// Handle all mouse down events
let mouse_down = function (event) {
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
    isAddingShape = true;
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
    isAddingArrow = true;
    saveData();
    console.log('mouse down arrow added');
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
};

// Handle all mouse up events
let mouse_up = function (event) {
  if (is_draggin) {
    event.preventDefault();
    is_draggin = false;
    draw_shapes();
    saveData();
  }
};

// Handle all mouse out events
let mouse_out = function (event) {
  if (is_draggin) {
    event.preventDefault();
    is_draggin = false;
  }
};

// Handle all mouse move events
let mouse_move = function (event) {
  // draging existing shape
  if (is_draggin) {
    event.preventDefault();
    let mouseX = parseInt(event.clientX - offset_x);
    let mouseY = parseInt(event.clientY - offset_y);

    let dx = mouseX - startX;
    let dy = mouseY - startY;

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
    let mouseXx = parseInt(event.clientX - offset_x);
    let mouseYx = parseInt(event.clientY - offset_y);
    if (shapeToAdd === null) {
      shapeToAdd = new Player({
        position: { x: mouseXx, y: mouseYx },
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
    let mouseX = parseInt(event.clientX - offset_x);
    let mouseY = parseInt(event.clientY - offset_y);

    let dx = mouseX - startX;
    let dy = mouseY - startY;

    shapeToAdd.position.x = mouseX;
    shapeToAdd.position.y = mouseY;

    draw_shapes();
    startX = mouseX;
    startY = mouseY;
  }
  // moving end of new arrow that has not been placed yet
  else if (isMovingNewArrow) {
    let mouseX = parseInt(event.clientX - offset_x);
    let mouseY = parseInt(event.clientY - offset_y);

    arrowToAdd.position.endX = mouseX;
    arrowToAdd.position.endY = mouseY;

    draw_shapes();
    console.log('moving new arrow');
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
    console.log('drawing arrow');
    arrowToAdd.draw();
  }
};

draw_shapes();
