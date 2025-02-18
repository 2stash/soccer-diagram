class Player {
  constructor({
    position = { x: 0, y: 0 },
    number = 0,
    color = 'rgba(255,0,0,1)',
    isMoving = false,
    shape = 'circle',
  }) {
    this.position = position;
    this.width = 64;
    this.height = 64;
    this.radius = 25;
    this.color = color;
    this.number = number;
    this.isMoving = isMoving;
    this.shape = shape;
  }

  draw() {
    if (this.shape === 'circle') {
      if (this.isMoving) {
        this._highlightShapeForMoving();
      }

      context.beginPath();
      context.arc(
        this.position.x,
        this.position.y,
        this.radius,
        0,
        2 * Math.PI
      );
      context.fillStyle = this.color;
      context.fill();

      context.font = '30px Arial';
      context.fillStyle = 'white';
      context.fillText(this.number, this.position.x - 10, this.position.y + 10);
    } else if (this.shape === 'triangle') {
      if (this.isMoving) {
        this._highlightShapeForMoving();
      }

      context.beginPath();
      context.moveTo(this.position.x, this.position.y - 25);
      context.lineTo(this.position.x - 25, this.position.y + 25);
      context.lineTo(this.position.x + 25, this.position.y + 25);
      context.closePath();
      context.fillStyle = this.color;
      context.fill();

      context.font = '30px Arial';
      context.fillStyle = 'white';
      context.fillText(this.number, this.position.x - 8, this.position.y + 18);
    }
  }
  _highlightShapeForMoving() {
    context.beginPath();
    context.strokeStyle = 'rgba(0,221,245,.5)';

    context.rect(
      this.position.x - this.radius - 5,
      this.position.y - this.radius - 5,
      60,
      60
    );
    context.stroke();
  }
}

class Arrow {
  constructor({
    position = { startX, startY, endX, endY },
    radius = 10,
    color = 'black',
    lineWidth = 5, // will be shown in the saved version but is not connected to the preview width of the arrow
    isMoving = false,
  }) {
    this.position = position;
    this.radius = radius;
    this.color = color;
    this.lineWidth = lineWidth;
    this.shape = 'arrow';
    this.isMoving = isMoving;
  }

  draw() {
    let x_center = this.position.endX;
    let y_center = this.position.endY;

    let angle;
    let x;
    let y;

    if (this.isMoving) {
      let xLength = Math.abs(this.position.startX - this.position.endX);
      let yLength = Math.abs(this.position.startY - this.position.endY);
      context.beginPath();
      context.strokeStyle = 'rgba(0,221,245,.5)';

      context.rect(
        (this.position.startX + this.position.endX) / 2 - (30 + xLength) / 2,
        (this.position.startY + this.position.endY) / 2 - (30 + yLength) / 2,
        xLength + 30,
        yLength + 30
      );
      context.stroke();
    }
    context.strokeStyle = 'rgba(0,0,0,1)'; // set Line color
    context.fillStyle = this.color; // set arrow head color
    context.lineWidth = this.lineWidth;
    context.beginPath();
    context.moveTo(this.position.startX, this.position.startY);

    context.lineTo(this.position.endX, this.position.endY);
    context.stroke();
    context.closePath();

    context.beginPath();

    angle = Math.atan2(
      this.position.endY - this.position.startY,
      this.position.endX - this.position.startX
    );
    x = this.radius * Math.cos(angle) + x_center;
    y = this.radius * Math.sin(angle) + y_center;

    context.moveTo(x, y);

    angle += (1.0 / 3.0) * (2 * Math.PI);
    x = this.radius * Math.cos(angle) + x_center;
    y = this.radius * Math.sin(angle) + y_center;

    context.lineTo(x, y);

    angle += (1.0 / 3.0) * (2 * Math.PI);
    x = this.radius * Math.cos(angle) + x_center;
    y = this.radius * Math.sin(angle) + y_center;

    context.lineTo(x, y);

    context.closePath();

    context.fill();
  }
}

class FocusPlayer {
  constructor() {
    this.color = 'rgba(0,0,255,1)';
    this.shape = 'triangle';
  }
}

class OppositionPlayer {
  constructor() {
    this.color = 'rgba(255,0,0,1)';
    this.shape = 'circle';
  }
}

class ArrowStarter {
  constructor() {
    this.color = 'black';
    this.shape = 'arrow';
  }
}
