class Food {
  constructor() {
    let randx = floor(random(-width/2 + 25, width/2 - 25));
    let randy = floor(random(-height/2 + 25,height/2 - 25));
    this.pos = createVector(randx,randy);
    this.beingEaten = false;
    this.inactiveCount = 0;
    this.eatingTime = 100;
  }
  
  draw() {
    push();
    //2D draw
    stroke(0,0,0);
    strokeWeight(10);
    if(this.beingEaten){
      stroke(255,0,255);
    }
    point(this.pos.x, this.pos.y);
    
  //3D draw
    // ambientMaterial(0,255,0);
    // ambientLight(255,255,255);
    // translate(this.pos.x, this.pos.y, 0);
    // sphere(5);
    pop();
  }


}