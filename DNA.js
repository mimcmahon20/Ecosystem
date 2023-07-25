class DNA {
  constructor(oldgenes) {
    this.genes;
    if (oldgenes) {
      this.genes = oldgenes;
    } else {
      this.genes = [];
    }
  }

  populate(numGenes) {
    for (let i = 0; i < numGenes; i++) {
      this.genes.push(random(0.1,1));
    }
  }

  // Crossover - combine two DNAs to create a new DNA
  crossover(partner) {
    let newgenes = [];
    let mid = floor(random(this.genes.length));
    for (let i = 0; i < this.genes.length; i++) {
      if (i > mid) {
        newgenes.push(this.genes[i]);
      } else {
        newgenes.push(partner.genes[i]);
      }
    }
    let newDNA = new DNA(newgenes);
    newDNA.mutate(0.01);
    return newDNA;
  }

  // Mutation - mutate the DNA by randomly changing one of the genes by a small amount. The number of genes mutated is controlled by the mutation rate
  mutate(mutationRate) {
    for (let i = 0; i < this.genes.length; i++) {
      if (random(1) < mutationRate) {
        this.genes[i] = random(0,1);
      }
    }
  }
}