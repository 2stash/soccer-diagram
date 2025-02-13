class Player {
  constructor({ position = { x: 0, y: 0 }, number = 0 }) {
    this.position = position;
    this.width = 64;
    this.height = 64;
    this.color = 'rgba(255,255,255, .1)';
    this.number = number;
  }

  draw() {
    c.fillStyle = 'black';
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}
