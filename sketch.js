let width, height;
let bunnies = [];
let foodPiles = [];
let tempBunnies = [];
let newBunnies = [];
let generationBunnies = 1;
let numAlive = 0;
let numAliveP;
let debugMode = false;
let checkboxDebug;

function setup() {
  height = 500;
  width = 500;
  createCanvas(width, height);
  for (let numBunnies = 0; numBunnies < 15; numBunnies++) {
    bunnies.push(new Boid(numBunnies));
  
    numAlive++;
  }
  for (let numFoodPiles = 0; numFoodPiles < 15; numFoodPiles++) {
    foodPiles.push(new Food());
  }
  frameRate(60);
  numAliveP = createP('numalive');
  checkboxDebug = createCheckbox('Debug Mode', false);
}

function draw() {
  push();
  translate(width / 2, height / 2);
  background(220);

  bunnies.forEach((bunny, index) => {
    if(checkboxDebug.checked()) {
      bunny.debugMode = true;
    } else {
      bunny.debugMode = false;
    }
    //check collision for each piece of food

    //if bunny hungry find closest food not being eaten or "roam"
    if (bunny.hungry && bunny.active) {
      let closestFood = bunny.findClosest(foodPiles);
      if (closestFood) {
        bunny.seek(closestFood.pos);
      } else {
        //bunny.roam();
      }
      //if not hungry && willMate find closest who also willMate
    }

    if (bunny.willMate && bunny.active) {
      //shallow copy the bunnies array so we can remove the current bunny and find mate
      tempBunnies = bunnies;
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
          newBunnies.push(new Boid(bunnies.length));
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
        bunny.active = false;
        bunny.hunger = 0;
        bunny.hungry = false;
        bunny.isEating = true;
      } else if (foodPile.beingEaten) {
        foodPile.inactiveCount++;
      }
    });

    bunnies.push(...newBunnies);
    newBunnies = [];
  }); //end of forEach bunny

  bunnies.forEach((bunny) => {
    if (bunny.hunger < 1) {
      bunny.update();
      bunny.draw();
    }
  });

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
  numAlive = 0;
  let allDead = true;
  bunnies.forEach(bunny => {
    if(bunny.hunger < 1){
      allDead = false;
      numAlive++;
    }
  });
  numAliveP.html("numAlive: " + numAlive);
  if(allDead) {
    bunnies.push(new Boid(bunnies.length));
    bunnies.push(new Boid(bunnies.length));
    bunnies.push(new Boid(bunnies.length));
    bunnies.push(new Boid(bunnies.length));
    console.log("generation: " + generationBunnies);
    generationBunnies++;
  }
  if(frameCount % 30 == 0) {
    foodPiles.push(new Food());
  }
}

