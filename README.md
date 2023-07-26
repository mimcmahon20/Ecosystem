# Bunny and Wolf Ecosystem Simulation

This project is a 3D simulation that models the interactions between bunnies and wolves. The simulation takes place in a virtual world where bunnies can roam, eat, and mate, while wolves can hunt for food and find potential mates. When mating, the parents pass along their genes through crossover and they are mutated for variation.

## Project Overview

The simulation is built using the p5.js library and runs in a 3D environment. The main entities in the simulation are bunnies and wolves. Additionally, there are food piles scattered throughout the world that bunnies can eat to survive. This project is meant to simulate a natural ecosystem with predators and prey, and the ability for one of the two groups to evolve, overpopulate, and go extinct. 

## Entities

### Bunnies

- There are `numBunniesGlobal` bunnies in the simulation at the start, represented as 3D models of rabbits.
- Each bunny has attributes such as `pos` (position), `hunger` (level of hunger), and `willMate` (indicating if the bunny is ready to mate).
- Bunnies can roam around randomly, seek food piles to eat when hungry, and seek potential mates when they are in the mating state.
- Bunnies can also flee from wolves if they get too close.
- If two bunnies successfully collide and are both active and willing to mate, they create a new genetic copy bunny.
- Bunnies can go inactive and eventually die if their hunger reaches a certain level.

### Wolves

- There are `numWolvesGlobal` wolves in the simulation at the start, represented as 3D models of wolves.
- Each wolf has attributes such as `pos` (position), `hunger` (level of hunger), and `willMate` (indicating if the wolf is ready to mate).
- Wolves can seek for food (bunnies) when hungry and will actively hunt down the closest bunny within their perception range.
- If a hungry wolf catches a bunny, it will eat it, removing the bunny from the simulation.
- Wolves can also seek potential mates if they are in the mating state.
- Similar to bunnies, wolves can go inactive and eventually die if their hunger reaches a certain level.

### Food Piles

- There are a total of 100 food piles at the start of the simulation, with food piles being added 6 times / second.
- Food piles are scattered throughout the world and can be eaten by bunnies to sustain themselves.
- If a bunny consumes a food pile, it becomes inactive for a certain period of time known as `eatingTime`.

## User Interaction

- Users can control the camera view using arrow keys (LEFT, RIGHT, UP, DOWN) and mouse movements.
- The LEFT and RIGHT keys coorespond to viewing angle and UP and DOWN coorespond to "zoom" or Z coordinate of camera.
- There is an option to enable/disable "Debug Mode" for the bunnies, which displays additional information about their state and characteristics.

## Simulation Updates

- The simulation runs at a frame rate of 60 frames per second (`frameRate(60)`).
- The simulation keeps track of the current generation of simulation, starting from generation 1.
- When wolves or bunnies falls to an extinction level, the simulation is reset and next generations are spawned immediately.
- The number of alive bunnies, alive wolves, and the current generation are displayed on the screen.

## Conclusion

This 3D simulation showcases the interactions between bunnies and wolves in a virtual world. Users can observe how bunnies move, eat, and mate while wolves hunt for food and potential mates. The simulation offers an interesting perspective on the dynamics of a virtual ecosystem.
