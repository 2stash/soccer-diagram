class Player {
  constructor({ position = { x: 0, y: 0 }, number = 0 }) {
    this.position = position;
    this.width = 64;
    this.height = 64;
    this.color = 'red';
    this.number = number;
  }

  draw() {
    context.fillStyle = this.color;
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}
