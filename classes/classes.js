class Player {
  constructor({
    position = { x: 0, y: 0 },
    number = 0,
    color = 'rgba(255,0,0,1)',
    isMoving = false,
  }) {
    this.position = position;
    this.width = 64;
    this.height = 64;
    this.color = color;
    this.number = number;
    this.isMoving = isMoving;
  }

  draw() {
    if (this.isMoving) {
      context.fillStyle = 'pink';
      context.fillRect(
        this.position.x,
        this.position.y,
        this.width + 15,
        this.height + 15
      );
    }
    context.fillStyle = this.color;
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

class Arrow {
  constructor({
    position = { startX, startY, endX, endY },
    radius = 10,
    color = 'green',
    lineWidth = 5, // will be shown in the saved version but is not connected to the preview width of the arrow
  }) {
    this.position = position;
    this.radius = radius;
    this.color = color;
    this.lineWidth = lineWidth;
  }

  draw() {
    let x_center = this.position.endX;
    let y_center = this.position.endY;

    let angle;
    let x;
    let y;
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
