// This code can be executed by copying it into a browser console
// and running >
// await (new Part1()).main()
//
// It can also be found at
// https://yakasov.github.io/pages/projects/js-ai-coursework/

class Part1 {
  constructor() {
    this.generations = [];

    this.MAX_GENERATIONS = 1000;
    this.POPULATION_SIZE = 64;
    this.CHROMOSOME_LENGTH = 32; // locked at 32 for Part 1
    this.MUTATION_COUNT = 1; // must be at least 1
  }

  main = async (outputToHTML = false) => {
    let current_generation = 0;
    this.generations.push(
      this.generate_population(this.POPULATION_SIZE, this.CHROMOSOME_LENGTH)
    );
    // Generate an initial population that is completely random
    this.generations[current_generation].sort(this.sortChromosomes);
    const initial_sum = this.innerSum(this.generations[0][0]);

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
        if (current_generation % 10 == 0) {
          await new Promise((r) => setTimeout(r, 1));
        }
      }
    }

    const output = `Initial match: ${initial_sum}<br>Best match: ${this.innerSum(
      this.generations.at(-1)[0]
    )}<br>${this.generations.at(-1)[0].toString().replaceAll(",", "<br>")}`;
    if (outputToHTML) {
      let el = document.getElementById("outputEl");
      el.innerHTML = output;
    }
    console.log(output.replaceAll("<br>", ", "));
  };

  generate_population = (p, c) => {
    let temp_pop = [];
    for (let _ = 0; _ < p; _++) {
      let new_p = [];

      for (let _ = 0; _ < c; _++) {
        const new_c = `${this.cryptoRandom()}${this.cryptoRandom()}`;
        new_p.push(new_c);
        // Create a random gene of 0 or 1
        // Create enough to fill a whole chromosome
      }

      temp_pop.push(new_p);
    }

    return temp_pop;
  };

  crossover = (cs1, cs2) => {
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
  };

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

      cs[r] = `${this.cryptoRandom()}${this.cryptoRandom()}`;
      // Set the gene to something random
    }

    return cs;
  };

  innerSum = (c) => c.reduce((a, b) => a + parseInt(b[0]) + parseInt(b[1]), 0);
  // JS sorting nonsense
  // takes each inner array (eg ["11", "01", "01", ...])
  // and sums the numbers using parseInt to make 2 + 1 + 1 ...

  sortChromosomes = (ca, cb) => this.innerSum(cb) - this.innerSum(ca);
  // A bit more JS sorting nonsense
  // Sorts from greatest sum first using arrayB - arrayA
  // Uses innerSum to get the chromosome gene sum

  cryptoRandom = () => self.crypto.getRandomValues(new Uint8Array(1))[0] % 2;
  // Originally I just used Math.round(Math.floor()),
  // but I found the distribution was favouring 1 over 0.
  // So I wrote this for cryptographically secure random numbers...
  // but the distribution only improved slightly.
  // Initial match is still ~ 40 instead of ~ 32.
}
