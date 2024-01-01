class Part2 {
  constructor() {
    // OR training data has two distinct data sets
    this.TRAINING_DATA_OR = [
      ["apple", 1, -1],
      ["apple", 0.9, -0.4],
      ["apple", 0.5, -0.7],
      ["apple", 0.8, -0.8],
      ["apple", 0.8, -0.3],
      ["apple", 0.7, -0.3],
      ["apple", 1, -0.9],
      ["apple", 0.1, -0.6],

      ["banana", -1, 1],
      ["banana", -0.9, 1],
      ["banana", -0.9, 0.7],
      ["banana", -0.7, 1],
      ["banana", -0.8, 0.8],
      ["banana", -0.9, 0.6],
      ["banana", -0.8, 0.6],
      ["banana", -1, 0.9],
    ];

    // XOR training data has two similar data sets
    this.TRAINING_DATA_XOR = [
      ["apple", 1, -1],
      ["apple", 0.9, -0.4],
      ["apple", 0.5, -0.7],
      ["apple", 0.8, -0.8],
      ["apple", 0.8, -0.3],
      ["apple", 0.7, -0.3],
      ["apple", 1, -0.9],
      ["apple", 0.1, -0.6],

      ["pear", 1, -1],
      ["pear", 0.7, -0.4],
      ["pear", 0.6, -0.7],
      ["pear", 0.3, -0.8],
      ["pear", 0.5, -0.5],
      ["pear", 0.8, -0.4],
      ["pear", 0.9, -0.9],
      ["pear", 0.3, -0.7],
    ];

    // Combine the OR training data with random data for after training
    this.testsOR = this.TRAINING_DATA_OR.slice(0, 4).concat(
      // Half apple array, half banana like elements
      Array.from({ length: 4 }, () => [
        "banana-like",
        Math.random() * -0.8 + 0.2, // random number between -0.2 and -1
        Math.random() * 0.8 + 0.2, // random number between 0.2 and 1
      ])
    );

    this.testsXOR = this.TRAINING_DATA_OR.slice(0, 4).concat(
      // Half apple array, half pear like elements
      Array.from({ length: 4 }, () => [
        "pear-like",
        Math.random() * 0.8 + 0.2, // random number between 0.2 and 1
        Math.random() * -0.8 + 0.2, // random number between -0.2 and -1
      ])
    );

    this.INPUT_SIZE = 3;
    this.OUTPUT_SIZE = 1;

    this.LEARNING_RATE = 0.2;
    this.EPOCHS = 1000;

    this.STARTING_WEIGHTS = new Array(this.INPUT_SIZE)
      .fill(0)
      .map(() => this.round(Math.random() * 0.5));
  }

  main = async (outputToHTML = false) => {
    let current_weights = [],
      current_bias = 0;
    this.output_text = "";

    // Train the network twice, once with each original data set
    [current_weights, current_bias] = this.train(this.TRAINING_DATA_OR);
    this.output_text = "<b>Prediction for test problems</b>";
    this.output_text += this.buildOutput(
      this.testsOR,
      "OR - Half apple, half banana",
      current_weights,
      current_bias
    );

    [current_weights, current_bias] = this.train(this.TRAINING_DATA_XOR);
    this.output_text += "<br><b>Prediction for test problems</b>";
    this.output_text += this.buildOutput(
      this.testsXOR,
      "XOR - Half apple, half pear",
      current_weights,
      current_bias
    );

    if (outputToHTML) {
      let el = document.getElementById("outputEl");
      el.innerHTML = this.output_text;
    }
    console.log(this.output_text.replaceAll("<br>", "\n"));
  };

  buildOutput = (tests, label, current_weights, current_bias) => {
    // Function just for building a nice looking output
    let output = `<br>${label} test<br>`;
    for (const test of tests) {
      const prediction = this.predict(test.slice(1), current_weights);
      output += `${test[0]}, prediction: ${this.round(prediction)} (${
        this.step(prediction, current_bias) == 1 ? "apple" : "not an apple"
      })<br>`;
    }
    return output;
  };

  train = (input_data) => {
    // Our bias and weights should start at 0 and random
    // Both sets start with the same weights initially
    let bias = 0;
    let weights = this.STARTING_WEIGHTS;

    for (let _ = 0; _ < this.EPOCHS; _++) {
      for (const data of input_data) {
        const [label, ...inputs] = data;
        const target = label == "apple" ? 1 : -1;

        // Our output is the result of our prediction
        // If our prediction is above 0, then it is positive (1), otherwise it is negative (-1)
        const output = this.step(this.predict(inputs, weights) + bias);

        // Our error is the difference between our prediction and the target
        const error = target - output;
        for (let i = 0; i < inputs.length; i++) {
          // Update each weight
          weights[i] += this.LEARNING_RATE * error * inputs[i];
        }
        // Update bias
        bias += this.LEARNING_RATE * error;
      }
    }

    return [weights, bias];
  };

  round = (x) => {
    return Math.round(x * 100) / 100;
  };

  predict = (data, weights) => {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      // Our prediction is simply our input multiplied by the corresponding weight
      sum += data[i] * weights[i];
    }

    return sum;
  };

  step = (x) => {
    // Step function to allow easy categorization of results
    return x >= 0 ? 1 : -1;
  };
}
