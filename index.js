// GLOBAL VARIABLES
let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');

canvas.width = 640;
canvas.height = 800;
canvas.style.border = '5px solid red';
let canvas_width = canvas.width;
let canvas_height = canvas.height;
let isAddingShape = false;
let isMovingNewShape = false;
let shapeToAdd = null;

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
let current_shape_index = null;
let is_draggin = false;
let startX;
let startY;
shapes.push(new Player({ position: { x: 0, y: 0 }, number: 0 }));

// ADD SHAPE
document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    isAddingShape = false;
  }
});

let add_shape = function (event) {
  isAddingShape = true;
  // let mouseX = parseInt(event.clientX - offset_x);
  // let mouseY = parseInt(event.clientY - offset_y);
  // shapes.push(
  //   new Player({ position: { x: mouseX, y: mouseY }, number: shapes.length })
  // );
  // draw_shapes();
};

let allow_move = function (event) {
  isAddingShape = false;
};

// MOUSE EVENTS
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

let mouse_down = function (event) {
  if (isAddingShape) {
    return;
  }

  if (isMovingNewShape) {
    isMovingNewShape = false;
    shapes.push(shapeToAdd);
    shapeToAdd = null;
    return;
  }

  startX = parseInt(event.clientX - offset_x);
  startY = parseInt(event.clientY - offset_y);
  let index = 0;
  for (let shape of shapes) {
    if (is_mouse_in_shape(startX, startY, shape)) {
      current_shape_index = index;
      is_draggin = true;
      return;
    }

    index++;
  }
};

let mouse_up = function (event) {
  if (!is_draggin) {
    return;
  }
  event.preventDefault();
  is_draggin = false;
};

let mouse_out = function (event) {
  if (!is_draggin) {
    return;
  }
  event.preventDefault();
  is_draggin = false;
};

let mouse_move = function (event) {
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
  } else if (isAddingShape) {
    event.preventDefault();
    let mouseXx = parseInt(event.clientX - offset_x);
    let mouseYx = parseInt(event.clientY - offset_y);
    if (shapeToAdd === null) {
      shapeToAdd = new Player({
        position: { x: mouseXx, y: mouseYx },
        number: 0,
      });
      console.log(mouseXx, mouseYx);
      console.log(shapeToAdd.position.x, shapeToAdd.position.y);
      console.log(shapeToAdd);
      draw_shapes();
      isMovingNewShape = true;
      isAddingShape = false;
    }
  } else if (isMovingNewShape) {
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
};

canvas.onmousedown = mouse_down;
canvas.onmouseup = mouse_up;
canvas.onmouseout = mouse_out;
canvas.onmousemove = mouse_move;

// MAIN DRAWING FUNCTION
let draw_shapes = function () {
  context.clearRect(0, 0, canvas_width, canvas_height);

  for (let shape of shapes) {
    shape.draw();
  }
  if (shapeToAdd) {
    shapeToAdd.draw();
  }
};

draw_shapes();
