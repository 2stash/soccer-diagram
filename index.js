// GLOBAL VARIABLES
let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');
let playerNumber = document.getElementById('position');
const formForPosition = document.getElementById('form-for-position');

// STATE
let xxxmouseIsOverCanvas = false; // TODO use:
let xxxdraggingExistingShape = false;

let xxxshapeAddingToolButtonHasBeenClicked = false;
let xxxmovingPotentialNewShape = false;
let xxxtypeOfShapeToAdd = null;
let xxxshapeToAdd = null;
let xxxshapesToDrawOnCanvas = [];

let startX;
let startY;

let xxx_is_draggin = false; // is the current shape being dragged
let xxx_current_shape_index = null; // used to find current shape in shapes array
let xxxtypeOfShapeMoving;

let shapes = [];
let current_shape_index = null; // used to find current shape in shapes array

playerNumber.addEventListener('input', (event) => {
  if (current_shape_index != null) {
    shapes[current_shape_index].number = playerNumber.value;
    draw_shapes();
  }
});

canvas.width = 736;
canvas.height = 1104;

let canvas_width = canvas.width;
let canvas_height = canvas.height;

// TODO: Optimize data class, do we need an array for each type of object?
// Make a class for each type of object? and a super class?
// Arrows

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

// STORAGE
let data = {
  shapes: [new Player({ position: { x: 0, y: 0 }, number: 0 })],
};

let reset_local_storage = function () {
  localStorage.removeItem('data');
  shapes = [];
  draw_shapes();
};
let initialize_local_storage = function () {
  if (localStorage.getItem('data')) {
    data = JSON.parse(localStorage.getItem('data'));
    for (let shape of data.shapes) {
      if (shape.shape === 'circle' || shape.shape === 'triangle') {
        shapes.push(new Player(shape));
      } else if (shape.shape === 'arrow') {
        shapes.push(new Arrow(shape));
      }
    }
  } else {
    localStorage.setItem('data', JSON.stringify(data));
  }
};
initialize_local_storage();

let saveData = function () {
  data = { shapes };
  localStorage.setItem('data', JSON.stringify(data));
};

// Keyboard events
document.addEventListener('keydown', function (event) {
  // Escape key should act like normal, unselects shape, etc.
  if (event.key === 'Escape') {
    resetStateToDefault();
    draw_shapes();
  } else if (event.key === 'Delete') {
    if (current_shape_index !== null) {
      shapes.splice(current_shape_index, 1);
      current_shape_index = null;
    }
    resetStateToDefault();
    saveData();
    draw_shapes();
  }
});

let add_shape = function (value) {
  if (value === 'focus-player') {
    xxxtypeOfShapeToAdd = new FocusPlayer();
  } else if (value === 'opposition-player') {
    xxxtypeOfShapeToAdd = new OppositionPlayer();
  } else if (value === 'arrow') {
    console.log('add_player arrow');
    xxxtypeOfShapeToAdd = new ArrowStarter();
  }
  xxxshapeAddingToolButtonHasBeenClicked = true;
};

// State is set to normal dragging mode
// TODO fix allow_move
let allow_move = function (event) {
  xxxshapeAddingToolButtonHasBeenClicked = false;
  xxxmovingPotentialNewShape = false;
  xxxtypeOfShapeToAdd = null;
  xxxshapeToAdd = null;

  draw_shapes();
};

// MOUSE EVENTS
// Check if mouse is in shape so it can be dragged
// let is_mouse_in_shape = function (x, y, shape) {
//   let shape_left = shape.position.x;
//   let shape_right = shape.position.x + shape.width;
//   let shape_top = shape.position.y;
//   let shape_bottom = shape.position.y + shape.height;
//   if (x > shape_left && x < shape_right && y > shape_top && y < shape_bottom) {
//     return true;
//   }

//   return false;
// };

let is_mouse_in_circle = function (x, y, shape) {
  let shape_left = shape.position.x - shape.radius;
  let shape_right = shape.position.x + shape.radius;
  let shape_top = shape.position.y - shape.radius;
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
  if (xxxshapeAddingToolButtonHasBeenClicked) {
    // initial mousedown to start beginning of arrow
    if (xxxtypeOfShapeToAdd.shape === 'arrow') {
      startX = parseInt(event.clientX - offset_x);
      startY = parseInt(event.clientY - offset_y);

      xxxshapeAddingToolButtonHasBeenClicked = false;
      xxxmovingPotentialNewShape = true;
      xxxshapeToAdd = new Arrow({
        position: { startX, startY, startX, startY },
      });
      return;
    }
    return;
  }

  // if we are moving a new shape, then we need to add it to the shapes array
  else if (xxxmovingPotentialNewShape) {
    console.log('xxxmovingPotentialNewShape ', xxxmovingPotentialNewShape);
    if (
      xxxtypeOfShapeToAdd.shape === 'circle' ||
      xxxtypeOfShapeToAdd.shape === 'triangle'
    ) {
      shapes.push(xxxshapeToAdd);
      xxxshapeToAdd = null;
      xxxmovingPotentialNewShape = false;
      xxxshapeAddingToolButtonHasBeenClicked = true; // this is so we can add another shape
      saveData();
      return;
    } else if (xxxtypeOfShapeToAdd.shape === 'arrow') {
      shapes.push(xxxshapeToAdd);
      xxxshapeToAdd = null;
      xxxmovingPotentialNewShape = false;
      xxxshapeAddingToolButtonHasBeenClicked = true; // this is so we can add another shape
      saveData();
      return;
    }
  }

  // Calculate mouse position and allow dragging if mouse is over a shape
  startX = parseInt(event.clientX - offset_x);
  startY = parseInt(event.clientY - offset_y);
  let index = 0;
  for (let shape of shapes) {
    if (shape.shape === 'triangle' || shape.shape == 'circle') {
      if (is_mouse_in_circle(startX, startY, shape)) {
        current_shape_index = index;
        shapes[current_shape_index].isMoving = true;
        xxx_is_draggin = true;
        xxxtypeOfShapeMoving = shapes[current_shape_index].shape;
        populateInfoArea();
        draw_shapes();
        return;
      }
    } else if (shape.shape === 'arrow') {
      if (is_mouse_in_arrow(startX, startY, shape)) {
        current_shape_index = index;
        shapes[current_shape_index].isMoving = true;
        xxx_is_draggin = true;
        xxxtypeOfShapeMoving = 'arrow';
        draw_shapes();
        return;
      }
    }
    index++;
  }
};

// Handle all mouse up events
let mouse_up = function (event) {
  if (xxx_is_draggin) {
    event.preventDefault();
    xxx_is_draggin = false;
    xxxtypeOfShapeMoving = '';
    draw_shapes();
    saveData();
  }
};

// Handle all mouse out events
// TODO redo mouse_out logic
let mouse_out = function (event) {
  // reset selected shape to null when scorlling off the screen
  // can change later to some other functionality
  shapeToAdd = null;
  isMovingNewShape = false;

  draw_shapes();
};

// Handle all mouse move events
let mouse_move = function (event) {
  // draging existing shape
  let mouseX = parseInt(event.clientX - offset_x);
  let mouseY = parseInt(event.clientY - offset_y);
  let dx = mouseX - startX;
  let dy = mouseY - startY;

  if (xxx_is_draggin) {
    console.log('is dragging ', xxxtypeOfShapeMoving);
    if (
      xxxtypeOfShapeMoving === 'circle' ||
      xxxtypeOfShapeMoving === 'triangle'
    ) {
      event.preventDefault();

      let current_shape = shapes[current_shape_index];

      current_shape.position.x += dx;
      current_shape.position.y += dy;

      draw_shapes();
      startX = mouseX;
      startY = mouseY;
    } else if (xxxtypeOfShapeMoving === 'arrow') {
      let current_shape = shapes[current_shape_index];

      current_shape.position.startX += dx;
      current_shape.position.startY += dy;
      current_shape.position.endX += dx;
      current_shape.position.endY += dy;

      draw_shapes();
      startX = mouseX;
      startY = mouseY;
    }
  }
  // initial check to add a new shape before changing state to isMovingNewShape = true
  else if (
    xxxshapeAddingToolButtonHasBeenClicked &&
    xxxtypeOfShapeToAdd.shape !== 'arrow'
  ) {
    if (xxxshapeToAdd === null) {
      xxxshapeToAdd = new Player({
        position: { x: mouseX, y: mouseY },
        number: 0,
        color: xxxtypeOfShapeToAdd.color,
        shape: xxxtypeOfShapeToAdd.shape,
      });
    }
    draw_shapes();
    xxxmovingPotentialNewShape = true;
    xxxshapeAddingToolButtonHasBeenClicked = false;
  }
  // moving new shape that has not been placed yet
  else if (
    xxxmovingPotentialNewShape &&
    xxxtypeOfShapeToAdd.shape !== 'arrow'
  ) {
    if (
      xxxtypeOfShapeToAdd.shape === 'circle' ||
      xxxtypeOfShapeToAdd.shape === 'triangle'
    ) {
      xxxshapeToAdd.position.x = mouseX;
      xxxshapeToAdd.position.y = mouseY;

      draw_shapes();
      startX = mouseX;
      startY = mouseY;
    }
  }
  // moving end of new arrow that has not been placed yet
  else if (
    xxxmovingPotentialNewShape &&
    xxxtypeOfShapeToAdd.shape === 'arrow'
  ) {
    xxxshapeToAdd.position.endX = mouseX;
    xxxshapeToAdd.position.endY = mouseY;

    draw_shapes();
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
    // shape.isMoving = false;
    // current_shape_index = null;
  }
};

let resetStateToDefault = function () {
  xxxshapeAddingToolButtonHasBeenClicked = false;
  xxxmovingPotentialNewShape = false;
  xxxtypeOfShapeToAdd = null;
  xxxshapeToAdd = null;

  for (let shape of shapes) {
    shape.isMoving = false;
    current_shape_index = null;
  }
  formForPosition.classList.add('hidden');
};

let populateInfoArea = function () {
  formForPosition.classList.remove('hidden');
  let currentPlayerNumber = shapes[current_shape_index].number;
  playerNumber.value = currentPlayerNumber;
};

// MAIN DRAWING FUNCTION
let draw_shapes = function () {
  context.clearRect(0, 0, canvas_width, canvas_height);

  for (let shape of shapes) {
    shape.draw();
  }
  if (xxxshapeToAdd) {
    xxxshapeToAdd.draw();
  }
};

draw_shapes();
