class Boid {
  constructor(ind) {
    //DNA Objects
    this.DNA = new DNA();
    this.DNA.populate(6);

    //DNA structure
    //0 to 1 for all genes, scale to actual values based on gene
    //DNA[0] == maxSpeed
    this.maxSpeed = this.DNA.genes[0] * 4;
    //DNA[1] == maxForce
    this.maxForce = this.DNA.genes[1] * 0.4;
    //DNA[2] == perception
    this.perception = this.DNA.genes[2] * 100;
    //DNA[3] == hungerRate
    this.hungerRate = this.DNA.genes[3] * 0.0025;
    //DNA[4] = eatingTime 
    this.eatingTime = this.DNA.genes[4] * 100;
    //DNA[5] = matingTime
    this.matingTime = this.DNA.genes[5] * 100;
  

    this.debugMode = debugMode;
    this.active = true;
    this.inactiveCount = 0;

    //kinematics / speed of obj
    this.index = ind;
    let randx = floor(random(-width/2 + 25, width/2 - 25));
    let randy = floor(random(-height/2 + 25,height/2 - 25));
    this.pos = createVector(randx,randy);
    this.vel = new createVector(
      random(-1, 1) * this.maxSpeed,
      random(-1, 1) * this.maxSpeed
    );
    this.acc = new createVector(0, 0);
    this.r = 4;
    //adds perception view
    this.debug = true;

    //hunger
    this.hunger = 0.5;
    this.hungry = false;
    this.isEating = false;
    //this.eatingTime = 100;

    //mating logic
    this.willMate = false;
    this.isMating = false;
    //this.matingTime = 100;
    this.matingRate = 0; //0 to 1, > matingWeight
    this.haveBaby = false;

    //prey mechanic 
    this.beingEaten = false;
    this.fleeing = false;
  }

  //runs for every bunny, first checks if active to apply movement, if not active then it increments the inactiveCount
  update() {
    if (this.active) {
      this.avoidBoundaries();
      this.hunger += this.hungerRate;
      this.matingRate += this.hungerRate * 1.5;
      if (this.hunger >= 0.5) {
        this.hungry = true;
        this.willMate = false;
      } else if (this.matingRate > 0.5 && this.matingRate > this.hunger) {
        this.willMate = true;
      }
      this.acc.limit(this.maxForce);
      this.vel.add(this.acc);
      this.vel.limit(this.maxSpeed);
      this.pos.add(this.vel);
      this.acc.mult(0);
    } else {
      this.inactiveCount++;
      if (this.inactiveCount >= this.eatingTime && this.isEating) {
        this.active = true;
        this.isEating = false;
        this.inactiveCount = 0;
      } else if (this.inactiveCount >= this.matingTime && this.isMating) {
        this.active = true;
        this.isMating = false;
        this.haveBaby = true;
        this.willMate = false;
        this.matingRate = 0;
        this.inactiveCount = 0;
      }
    }
  }

  applyForce(force) {
    this.acc.add(force);
  }

  seek(target) {
    if (this.active) {
      let desiredVelocity = p5.Vector.sub(target, this.pos);
      desiredVelocity.setMag(this.maxSpeed);

      let steer = p5.Vector.sub(desiredVelocity, this.vel);
      steer.limit(this.maxForce);

      this.applyForce(steer);
    }
  }

  eat() {
    this.active = false;
    this.isEating = true;
    this.hunger = 0;
    this.hungry = false;
  }

  updateDNA() {
    //DNA structure
    //0 to 1 for all genes, scale to actual values based on gene
    //DNA[0] == maxSpeed
    this.maxSpeed = this.DNA.genes[0] * 4;
    //DNA[1] == maxForce
    this.maxForce = this.DNA.genes[1] * 0.2;
    //DNA[2] == perception
    this.perception = this.DNA.genes[2] * 100;
    //DNA[3] == hungerRate
    this.hungerRate = this.DNA.genes[3] * 0.0035;
    //DNA[4] = eatingTime
    this.eatingTime = this.DNA.genes[4] * 100;
    //DNA[5] = matingTime
    this.matingTime = this.DNA.genes[5] * 100;
  }

  checkCollision(targetPos) {
    let d = dist(this.pos.x, this.pos.y, targetPos.x, targetPos.y);
    if (d < this.r * 2) {
      return true;
    }
    return false;
  }

  findClosest(list) {
    let minDist = Infinity;
    let closest;
    list.forEach((item) => {
      let d = dist(this.pos.x, this.pos.y, item.pos.x, item.pos.y);
      if (d < minDist && d < this.perception && !item.beingEaten) {
        minDist = d;
        closest = item;
      }
    });
    return closest;
  }

  findClosestWolf(list) {
    let minDist = Infinity;
    let closest;
    list.forEach((item) => {
      let d = dist(this.pos.x, this.pos.y, item.pos.x, item.pos.y);
      if (d < minDist && d < this.perception) {
        minDist = d;
        closest = item;
      }
    });
    return closest;
  }


  findMate(list) {
    let minDist = Infinity;
    let closest;
    list.forEach((item) => {
      let d = dist(this.pos.x, this.pos.y, item.pos.x, item.pos.y);
      if (d < minDist && d < this.perception && item.willMate) {
        minDist = d;
        closest = item;
      }
    });
    return closest;
  }

  mate() {
    this.active = false;
    this.isMating = true;
    this.willMate = false;
    this.matingRate = 0;
  }

  roam() {
    //this.perception = 50;
    this.vel.mag(this.maxSpeed);
  }

  flee(pos) {
    let desiredVelocity = p5.Vector.sub(this.pos, pos);
    desiredVelocity.setMag(this.maxSpeed);

    let steer = p5.Vector.sub(desiredVelocity, this.vel);
    steer.limit(this.maxForce);

    this.applyForce(-steer);
  }

  draw() {
    const angle = this.vel.heading() + PI / 2;
    push();
    translate(this.pos.x, this.pos.y);

    if(this.debugMode){ 
      let forceHeight = map(this.maxForce, 0, 0.2, 0, -100);
      fill(map(this.maxForce, 0, 0.2, 255,0),map(this.maxForce, 0,0.2,0,255),0,125);
      rect(10,15,5,forceHeight);
      
      let speedHeight = map(this.maxSpeed, 0, 4, 0, -100);
      fill(map(this.maxSpeed, 0, 4, 255, 0),map(this.maxSpeed, 0,4,0,255),0,125);

      rect(-10,15,5,speedHeight);
    }

    rotate(angle);
    if (this.debugMode) {
      noFill();
      stroke(0, 125, 0, 125);
      ellipse(0, 0, floor(this.perception * 2));
    }

    //COLOR/DEBUG MODE: 
    
    if(this.debugMode){
      fill(map(this.hunger, 0, 1, 0, 255),map(this.hunger, 0,1,255,0),0,125);
  
      if(this.willMate) {
        stroke(255,0,255);
      } else {
        stroke(0,0,0);
      }
      strokeWeight(1);
    }

    beginShape();
    vertex(0, -this.r * 2);
    vertex(-this.r, this.r * 2);
    vertex(this.r, this.r * 2);
    endShape(CLOSE);
    pop();
  }

  avoidBoundaries() {
    const d = 30;
    let desired = null;

    if (this.pos.x < -width / 2 + d) {
      desired = createVector(this.maxSpeed, this.vel.y);
    } else if (this.pos.x > width / 2 - d) {
      desired = createVector(-this.maxSpeed, this.vel.y);
    }

    if (this.pos.y < -height / 2 + d) {
      desired = createVector(this.vel.x, this.maxSpeed);
    } else if (this.pos.y > height / 2 - d) {
      desired = createVector(this.vel.x, -this.maxSpeed);
    }

    if (desired !== null) {
      desired.normalize();
      desired.mult(this.maxSpeed);
      const steer = p5.Vector.sub(desired, this.vel);
      steer.limit(this.maxForce * 100);
      this.applyForce(steer);
    }
  }
}
