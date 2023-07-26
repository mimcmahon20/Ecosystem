let width, height;
let bunnies = [];
let aliveBunnies = [];
let foodPiles = [];
let tempBunnies = [];
let newBunnies = [];
let wolves = [];
let tempWolves = [];
let newWolves = [];
let generationBunnies = 1;
let numAlive = 0;
let numAliveP;
let debugMode = false;
let checkboxDebug;
let numBunniesGlobal = 50;
let numWolvesGlobal = 10;

let xOffset = 0;
let zOffset = 0;

function preload() {
  rabbitModel = loadModel('rabbit.obj');
  wolfModel = loadModel('wolf.obj');
}

function setup() {
  height = 1500;
  width = 1500;
  createCanvas(width, height, WEBGL);
  for (let numBunnies = 0; numBunnies < numBunniesGlobal; numBunnies++) {
    aliveBunnies.push(new Boid(numBunnies));
    bunnies.push(new Boid(numBunnies));
    numAlive++;
  }
  for (let numFoodPiles = 0; numFoodPiles < 100; numFoodPiles++) {
    foodPiles.push(new Food());
  }
  for (let numWolves = 0; numWolves < numWolvesGlobal; numWolves++) {
    wolves.push(new Wolf(numWolves));
  }

  frameRate(60);
  numAliveP = createP("numalive");
  checkboxDebug = createCheckbox(
    "Debug Mode Bunnies <br/>Pink border: canMate<br/>Color: Hunger<br/>LeftColumn: maxSpeed <br/>RightColumn: maxForce",
    false
  );
}

function draw() {
  push();
  //2D setup
  //translate(width / 2, height / 2, 0);


  //3D setup
  pointLight(0,0,0,255,255,255);
  pointLight(200, 200, 200, -mouseX + width/2, -mouseY+height/2, 500);
    //ambientLight(155, 155, 155);
  //translate(0,0,-mouseY*2+650);

  //rotateX(PI / 3);
  //rotateZ(mouseX / 100);


  if (keyIsDown(LEFT_ARROW)) {
    xOffset+= 10;
  } else if (keyIsDown(RIGHT_ARROW)) {
    xOffset-= 10;
  } else if (keyIsDown(UP_ARROW)) {
    zOffset+= 10;

  } else if (keyIsDown(DOWN_ARROW)) {
    zOffset-= 10;
  }

  rotateX(xOffset * .001);
  translate(-mouseX + width/2,-mouseY + height/2,zOffset);

  background(220, 220, 220, 150);

  fill(0, 0, 0, 255);
  //Loops through all wolves, finds
  //1st target if hungry, closest bunny in perception
  //2nd mate if not hungry and matingRate > hungerRate
  wolves.forEach((wolf, index) => {
    if (wolf.willMate && wolf.active && !wolf.isEating) {
      console.log("willMate");
      //shallow copy the bunnies array so we can remove the current bunny and find mate
      tempWolves = wolves;
      let shallowCopy = [];
      tempWolves.forEach((tempWolf) => {
        shallowCopy.push(tempWolf);
      });
      shallowCopy.splice(index, 1);
      //finds the closest mate
      let mate = wolf.findMate(shallowCopy);

      //if they find a mate and they are colliding and both active, make them "mate" by adding a genetic copy bunny to newBunnies
      if (mate) {
        //fiirst checks collision w mate / active status
        if (wolf.checkCollision(mate.pos) && wolf.active && mate.active) {
          //putting bunnies into "mating" mode
          wolf.mate();
          mate.mate();
          //having a child
          newWolves.push(new Wolf(wolves.length));
          //crossover
          newWolves[newWolves.length - 1].DNA = wolf.DNA.crossover(mate.DNA);
          newWolves[newWolves.length - 1].updateDNA();
          //mutation
          newWolves[newWolves.length - 1].DNA.mutate(0.025);
          newWolves[newWolves.length - 1].pos.x = wolf.pos.x;
          newWolves[newWolves.length - 1].pos.y = wolf.pos.y;
        } else {
          wolf.seek(mate.pos);
        }
      }
    } else if (wolf.hungry && wolf.active) {
      let closestBunny = wolf.findClosest(aliveBunnies);
      if (closestBunny) {
        if (wolf.checkCollision(closestBunny.pos)) {
          wolf.eat();
          aliveBunnies.splice(closestBunny.index, 1);
          for (let i = 0; i < aliveBunnies.length; i++) {
            aliveBunnies[i].index = i;
          }
          if (
            aliveBunnies.length === 1 ||
            closestBunny.index >= aliveBunnies.length
          ) {
            aliveBunnies.pop();
            for (
              let numBunnies = 0;
              numBunnies < numBunniesGlobal;
              numBunnies++
            ) {
              aliveBunnies.push(new Boid(numBunnies));
              bunnies.push(new Boid(numBunnies));
              wolves = [];
              numAlive++;
            }
          } else {
            aliveBunnies[closestBunny.index].active = false;
            aliveBunnies[closestBunny.index].hunger = 10;
          }
        }
        wolf.seek(closestBunny.pos);
      }
    }
    wolves.push(...newWolves);
    newWolves = [];
  });

  //Loops through all alive bunnies
  aliveBunnies.forEach((bunny, index) => {
    if (checkboxDebug.checked()) {
      bunny.debugMode = true;
    } else {
      bunny.debugMode = false;
    }
    //check collision for each piece of food

    //first checks to see if wolf nearby
    let closestWolf = bunny.findClosestWolf(wolves);
    if (closestWolf && bunny.active) {
      bunny.flee(closestWolf.pos);
      bunny.isFleeing = true;
    } else {
      bunny.isFleeing = false;
    }

    //if bunny hungry find closest food not being eaten or "roam"
    if (bunny.hungry && bunny.active && !bunny.isFleeing) {
      let closestFood = bunny.findClosest(foodPiles);
      if (closestFood) {
        bunny.seek(closestFood.pos);
      } else {
        //bunny.roam();
      }
      //if not hungry && willMate find closest who also willMate
    }

    if (bunny.willMate && bunny.active && !bunny.isFleeing) {
      //shallow copy the bunnies array so we can remove the current bunny and find mate
      tempBunnies = aliveBunnies;
      let shallowCopy = [];
      tempBunnies.forEach((tempBunny) => {
        shallowCopy.push(tempBunny);
      });
      shallowCopy.splice(index, 1);
      //finds the closest mate
      let mate = bunny.findMate(shallowCopy);

      //if they find a mate and they are colliding and both active, make them "mate" by adding a genetic copy bunny to newBunnies
      if (mate) {
        //fiirst checks collision w mate / active status
        if (bunny.checkCollision(mate.pos) && bunny.active && mate.active) {
          //putting bunnies into "mating" mode
          bunny.mate();
          mate.mate();
          //having a child
          newBunnies.push(new Boid(aliveBunnies.length));
          //crossover
          newBunnies[newBunnies.length - 1].DNA = bunny.DNA.crossover(mate.DNA);
          newBunnies[newBunnies.length - 1].updateDNA();
          //mutation
          newBunnies[newBunnies.length - 1].DNA.mutate(0.025);
          newBunnies[newBunnies.length - 1].pos.x = bunny.pos.x;
          newBunnies[newBunnies.length - 1].pos.y = bunny.pos.y;
        } else {
          bunny.seek(mate.pos);
        }
      } else {
        bunny.roam();
      }
    }

    foodPiles.forEach((foodPile) => {
      if (!foodPile.beingEaten && bunny.checkCollision(foodPile.pos)) {
        foodPile.beingEaten = true;
        foodPile.eatingTime = bunny.eatingTime;
        bunny.eat();
      } else if (foodPile.beingEaten) {
        foodPile.inactiveCount++;
      }
    });

    //figure out alive from dead inside aliveBunnies
    aliveBunnies.push(...newBunnies);
    for (let i = aliveBunnies.length - 1; i >= 0; i--) {
      if (aliveBunnies[i].hunger >= 1) {
        aliveBunnies.splice(i, 1);
      }
    }

    for (let i = 0; i < aliveBunnies.length - 1; i++) {
      aliveBunnies[i].index = i;
    }

    newBunnies = [];
  }); //end of forEach bunny

  for (let i = wolves.length - 1; i >= 0; i--) {
    if (wolves[i].hunger >= 1) {
      wolves.splice(i, 1);
    }
  }

  for (let i = 0; i < wolves.length - 1; i++) {
    wolves[i].index = i;
  }

  wolves.forEach((wolf) => {
    wolf.update();
    wolf.draw();
  });

  aliveBunnies.forEach((bunny) => {
    bunny.update();
    bunny.draw();
  });

  //loop through foodPiles backwards and draws/destroys them if eaten for long enough
  for (
    let numFoodPiles = foodPiles.length - 1;
    numFoodPiles--;
    numFoodPiles >= 0
  ) {
    if (
      foodPiles[numFoodPiles].inactiveCount >=
      foodPiles[numFoodPiles].eatingTime
    ) {
      foodPiles.splice(numFoodPiles, 1);
    } else {
      foodPiles[numFoodPiles].draw();
    }
    foodPiles[numFoodPiles].draw();
  }
  pop();

  //post draw logic, check if all bunnies are dead, if so, add 4 new bunnies
  //also prints num alive and allows debugging mode to be enabled/disabled
  if (
    aliveBunnies.length == 0 ||
    aliveBunnies.length == 1 ||
    wolves.length == 0 ||
    wolves.length == 1
  ) {
    aliveBunnies = [];
    for (let numBunnies = 0; numBunnies < numBunniesGlobal; numBunnies++) {
      aliveBunnies.push(new Boid(numBunnies));
      bunnies.push(new Boid(numBunnies));
      numAlive++;
    }
    wolves = [];
    for (let numWolves = 0; numWolves < numWolvesGlobal; numWolves++) {
      wolves.push(new Wolf(numWolves));
    }
    console.log("generation: " + generationBunnies);
    generationBunnies++;
  }
  numAliveP.html(
    "Time: " +
      floor(frameCount / 60) +
      "<br/>Number of Bunnies: " +
      aliveBunnies.length +
      "<br/> Number of Wolves: " +
      wolves.length +
      "<br/> Generation: " +
      generationBunnies +
      "<br/>Number of Food Piles: " +
      foodPiles.length +
      "<br/>"
  );
  if (frameCount % 5 == 0) {
    foodPiles.push(new Food());
  }
}
