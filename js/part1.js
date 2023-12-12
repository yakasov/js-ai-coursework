const goal = [
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
const goalSum = 64;

var generations = [];

const MAX_GENERATIONS = 1000;
const POPULATION_SIZE = 64;
const CHROMOSOME_LENGTH = 32; // locked at 32 for Part 1
const MUTATION_COUNT = 1; // must be at least 1

async function part1Main() {
  await main(true);
}

async function main(outputToHTML = false) {
  let current_generation = 0;
  generations.push(generate_population(POPULATION_SIZE, CHROMOSOME_LENGTH));
  // Generate an initial population that is completely random

  while (current_generation < MAX_GENERATIONS) {
    generations[current_generation].sort(sortChromosomes);
    if (innerSum(generations[current_generation][0]) == 64) {
      break;
    }
    // Sort the current generation by greatest gene sum
    // Our goal is a set of 32 "11" genes, which has a sum of 64
    // So those chromosomes with the highest sum are best
    // If we have a chromosome of sum 64, we have met our goal

    let new_population = [];
    for (let i = 0; i < POPULATION_SIZE / 2; i++) {
      // Only crossover the top 50% of the current generation
      if (i % 2 == 0) {
        new_population = new_population.concat(
          crossover(
            generations[current_generation][i],
            generations[current_generation][i + 1]
          )
        );
      }
    }

    if (current_generation < MAX_GENERATIONS - 1) {
      new_population = new_population.map(mutate);
      // Mutate MUTATION_COUNT genes per chromosome
      // Don't mutate on the last population
    }
    generations.push(new_population);
    current_generation++;

    if (outputToHTML) {
      let el1 = document.getElementById("part1output");
      el1.innerHTML = `Current generation: ${current_generation}<br>Best match: ${innerSum(
        generations[current_generation][0]
      )}`;
      await new Promise((r) => setTimeout(r, 1));
    }
  }

  const output = `Best match = ${innerSum(
    generations.at(-1)[0]
  )}<br>${generations.at(-1)[0].toString().replaceAll(",", "<br>")}`;
  if (outputToHTML) {
    let el1 = document.getElementById("part1output");
    el1.innerHTML = output;
  }
  console.log(output.replaceAll("<br>", ", "));
}

function innerSum(c) {
  return c.reduce((a, b) => a + parseInt(b[0]) + parseInt(b[1]), 0);
  // JS sorting nonsense
  // takes each inner array (eg ["11", "01", "01", ...])
  // and sums the numbers using parseInt to make 2 + 1 + 1 ...
}

function sortChromosomes(ca, cb) {
  return innerSum(cb) - innerSum(ca);
  // A bit more JS sorting nonsense
  // Sorts from greatest sum first using arrayB - arrayA
  // Uses innerSum to get the chromosome gene sum
}

function generate_population(p, c) {
  let temp_pop = [];
  for (let _ = 0; _ < p; _++) {
    let new_p = [];

    for (let _ = 0; _ < c; _++) {
      const new_c = `${Math.round(Math.random())}${Math.round(Math.random())}`;
      new_p.push(new_c);
      // Create a random gene of 0 or 1
      // Create enough to fill a whole chromosome
    }

    temp_pop.push(new_p);
  }

  return temp_pop;
}

function crossover(cs1, cs2) {
  let return_array = [];
  for (let _ = 0; _ < 4; _++) {
    const r = Math.round(Math.random * (CHROMOSOME_LENGTH - 1));
    return_array.push(cs1.slice(0, r).concat(cs2.slice(r, CHROMOSOME_LENGTH)));
    // Take a random amount of genes from chromosome 1
    // and combine them with the proportional amount from chromosome 2
    // thereby crossing over at a random point each time.
    // This is done 4 times from 2 chromosomes to make a full
    // 64 strong population (since we originally took the top half only)
  }

  return return_array;
}

function mutate(cs) {
  let previous_mutations = [];
  for (let _ = 0; _ < MUTATION_COUNT; _++) {
    if (previous_mutations.length == CHROMOSOME_LENGTH) break;

    let r = Math.round(Math.random() * (CHROMOSOME_LENGTH - 1));
    // Randomly generate a gene index to mutate
    while (previous_mutations.includes(r)) {
      r = Math.round(Math.random() * (CHROMOSOME_LENGTH - 1));
    }
    previous_mutations.push(r);
    // We keep track of the previous mutations
    // to avoid mutating the same gene twice

    cs[r] = `${Math.round(Math.random())}${Math.round(Math.random())}`;
    // Set the gene to something random
  }

  return cs;
}
