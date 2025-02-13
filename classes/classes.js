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
