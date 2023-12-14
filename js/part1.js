// This code can be executed by copying it into a browser console
// and running >
// await main()
//
// It can also be found at
// https://yakasov.github.io/pages/projects/js-ai-coursework/

class Part1 {
  constructor() {
    this.goal = [
      "11",
      "11",
      "11",
      "11",
      "11",
      "11",
      "11",
      "11",
      "11",
      "11",
      "11",
      "11",
      "11",
      "11",
      "11",
      "11",
    ];
    this.goalSum = 64;

    this.generations = [];

    this.MAX_GENERATIONS = 1000;
    this.POPULATION_SIZE = 64;
    this.CHROMOSOME_LENGTH = 32; // locked at 32 for Part 1
    this.MUTATION_COUNT = 1; // must be at least 1
  }

  async main(outputToHTML = false) {
    let current_generation = 0;
    this.generations.push(
      this.generate_population(this.POPULATION_SIZE, this.CHROMOSOME_LENGTH)
    );
    // Generate an initial population that is completely random

    while (current_generation < this.MAX_GENERATIONS) {
      this.generations[current_generation].sort(this.sortChromosomes);
      if (this.innerSum(this.generations[current_generation][0]) == 64) {
        break;
      }
      // Sort the current generation by greatest gene sum
      // Our goal is a set of 32 "11" genes, which has a sum of 64
      // So those chromosomes with the highest sum are best
      // If we have a chromosome of sum 64, we have met our goal

      let new_population = [];
      for (let i = 0; i < this.POPULATION_SIZE / 2; i++) {
        // Only crossover the top 50% of the current generation
        if (i % 2 == 0) {
          new_population = new_population.concat(
            this.crossover(
              this.generations[current_generation][i],
              this.generations[current_generation][i + 1]
            )
          );
        }
      }

      if (current_generation < this.MAX_GENERATIONS - 1) {
        new_population = new_population.map(this.mutate);
        // Mutate MUTATION_COUNT genes per chromosome
        // Don't mutate on the last population
      }
      this.generations.push(new_population);
      current_generation++;

      if (outputToHTML) {
        let el = document.getElementById("outputEl");
        el.innerHTML = `Current generation: ${current_generation}<br>Best match: ${this.innerSum(
          this.generations[current_generation][0]
        )}`;
        await new Promise((r) => setTimeout(r, 1));
      }
    }

    const output = `Best match: ${this.innerSum(
      this.generations.at(-1)[0]
    )} =<br>${this.generations.at(-1)[0].toString().replaceAll(",", "<br>")}`;
    if (outputToHTML) {
      let el = document.getElementById("outputEl");
      el.innerHTML = output;
    }
    console.log(output.replaceAll("<br>", ", "));
  }

  innerSum(c) {
    return c.reduce((a, b) => a + parseInt(b[0]) + parseInt(b[1]), 0);
    // JS sorting nonsense
    // takes each inner array (eg ["11", "01", "01", ...])
    // and sums the numbers using parseInt to make 2 + 1 + 1 ...
  }

  sortChromosomes = (ca, cb) => {
    return this.innerSum(cb) - this.innerSum(ca);
    // A bit more JS sorting nonsense
    // Sorts from greatest sum first using arrayB - arrayA
    // Uses innerSum to get the chromosome gene sum
  };

  generate_population(p, c) {
    let temp_pop = [];
    for (let _ = 0; _ < p; _++) {
      let new_p = [];

      for (let _ = 0; _ < c; _++) {
        const new_c = `${Math.round(Math.random())}${Math.round(
          Math.random()
        )}`;
        new_p.push(new_c);
        // Create a random gene of 0 or 1
        // Create enough to fill a whole chromosome
      }

      temp_pop.push(new_p);
    }

    return temp_pop;
  }

  crossover(cs1, cs2) {
    let return_array = [];
    for (let _ = 0; _ < 4; _++) {
      const r = Math.round(Math.random * (this.CHROMOSOME_LENGTH - 1));
      return_array.push(
        cs1.slice(0, r).concat(cs2.slice(r, this.CHROMOSOME_LENGTH))
      );
      // Take a random amount of genes from chromosome 1
      // and combine them with the proportional amount from chromosome 2
      // thereby crossing over at a random point each time.
      // This is done 4 times from 2 chromosomes to make a full
      // 64 strong population (since we originally took the top half only)
    }

    return return_array;
  }

  mutate = (cs) => {
    let previous_mutations = [];
    for (let _ = 0; _ < this.MUTATION_COUNT; _++) {
      if (previous_mutations.length == this.CHROMOSOME_LENGTH) break;

      let r = Math.round(Math.random() * (this.CHROMOSOME_LENGTH - 1));
      // Randomly generate a gene index to mutate
      while (previous_mutations.includes(r)) {
        r = Math.round(Math.random() * (this.CHROMOSOME_LENGTH - 1));
      }
      previous_mutations.push(r);
      // We keep track of the previous mutations
      // to avoid mutating the same gene twice

      cs[r] = `${Math.round(Math.random())}${Math.round(Math.random())}`;
      // Set the gene to something random
    }

    return cs;
  };
}
