class Wolf {
  constructor(ind) {
    this.active = true;
    this.inactiveCount = 0;
    this.maxSpeed = 2;
    this.maxForce = 0.35;
    this.hungerRate = 0.0008;
    this.active = true;
    this.index = ind;
    let randx = floor(random(-width/2 + 25, width/2 - 25));
    let randy = floor(random(-height/2 + 25,height/2 - 25));
    this.pos = createVector(randx,randy);
    this.vel = new createVector(
      random(-1, 1) * this.maxSpeed,
      random(-1, 1) * this.maxSpeed
    );
    this.acc = new createVector(0, 0);
    this.r = 10;
    this.perception = 100;
    
    //hunger
    this.hunger = 0.5;
    this.hungry = false;
    this.isEating = false;
    this.eatingTime = 100;

    //mating logic
    this.willMate = false;
    this.isMating = false;
    this.matingTime = 100;
    this.matingRate = 0; //0 to 1, > matingWeight
    this.haveBaby = false;

    //DNA
    this.DNA = new DNA();
    this.DNA.populate(6);

    //DNA structure
    //0 to 1 for all genes, scale to actual values based on gene
    //DNA[0] == maxSpeed
    this.maxSpeed = this.DNA.genes[0] * 1.5 + 2;
    //DNA[1] == maxForce
    this.maxForce = this.DNA.genes[1] * 0.175 + .2;
    //DNA[2] == perception
    this.perception = this.DNA.genes[2] * 50 + 100;
    //DNA[3] == hungerRate
    this.hungerRate = this.DNA.genes[3] * 0.01;
    //DNA[4] = eatingTime 
    this.eatingTime = this.DNA.genes[4] * 50;
    //DNA[5] = matingTime
    this.matingTime = this.DNA.genes[5] * 250;
  }

  update() {
    if(this.willMate) {
        console.log("mate?");
    }
    if (this.active) {
      this.avoidBoundaries();
      this.hunger += this.hungerRate;
      this.matingRate += this.hungerRate * .1;
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
    this.maxSpeed = this.DNA.genes[0] * 1.5 + 2;
    //DNA[1] == maxForce
    this.maxForce = this.DNA.genes[1] * 0.175 + .2;
    //DNA[2] == perception
    this.perception = this.DNA.genes[2] * 50 + 100;
    //DNA[3] == hungerRate
    this.hungerRate = this.DNA.genes[3] * 0.01;
    //DNA[4] = eatingTime 
    this.eatingTime = this.DNA.genes[4] * 50;
    //DNA[5] = matingTime
    this.matingTime = this.DNA.genes[5] * 250;
  }

  roam() {
    this.vel.mag = this.maxSpeed;
  }

  findClosest(targets) {
    let minDist = Infinity;
    let closest;
    targets.forEach((target) => {
      let d = dist(this.pos.x, this.pos.y, target.pos.x, target.pos.y);
      if (d < minDist && d < this.perception && !target.beingEaten && target.hungry < 1) {
        minDist = d;
        closest = target;
      }
    });
    return closest;
  }

  findMate(targets) {
    let minDist = Infinity;
    let closest;
    targets.forEach((target) => {
      let d = dist(this.pos.x, this.pos.y, target.pos.x, target.pos.y);
      if (d < minDist && d < this.perception && target.willMate) {
        minDist = d;
        closest = target;
      }
    });
    return closest;
  }

  checkCollision(pos) {
    let d = dist(this.pos.x, this.pos.y, pos.x, pos.y);
    if (d < this.r) {
      return true;
    }
    return false;
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

  draw() {
    push();
    translate(this.pos.x, this.pos.y);
    rotateX(PI / 2);
    rotateY(this.vel.heading());
    noStroke();
    fill(255,0,0,10);
    noFill();


    ambientMaterial(255,255,255);
    scale(0.15);
    model(wolfModel);
    //ambientMaterial(255,0,0,155);
    // ellipse(0,0,this.perception * 2);
    // fill(225,255,185,185);
    // beginShape();
    // vertex(0, -this.r * 2);
    // vertex(-this.r, this.r * 2);
    // vertex(this.r, this.r * 2);
    // endShape(CLOSE);
    pop();
  }
}
