class Part2 {
  constructor() {
    // OR training data has two distinct data sets
    this.TRAINING_DATA_OR = [
      ["dog", 1, -1],
      ["dog", 0.9, -0.4],
      ["dog", 0.5, -0.7],
      ["dog", 0.8, -0.8],
      ["dog", 0.8, -0.3],
      ["dog", 0.7, -0.3],
      ["dog", 1, -0.9],
      ["dog", 0.1, -0.6],

      ["elephant", -1, 1],
      ["elephant", -0.9, 1],
      ["elephant", -0.9, 0.7],
      ["elephant", -0.7, 1],
      ["elephant", -0.8, 0.8],
      ["elephant", -0.9, 0.6],
      ["elephant", -0.8, 0.6],
      ["elephant", -1, 0.9],
    ];

    // XOR training data has two similar data sets
    this.TRAINING_DATA_XOR = [
      ["dog", 1, -1],
      ["dog", 0.9, -0.4],
      ["dog", 0.5, -0.7],
      ["dog", 0.8, -0.8],
      ["dog", 0.8, -0.3],
      ["dog", 0.7, -0.3],
      ["dog", 1, -0.9],
      ["dog", 0.1, -0.6],

      ["cat", 1, -1],
      ["cat", 0.7, -0.4],
      ["cat", 0.6, -0.7],
      ["cat", 0.3, -0.8],
      ["cat", 0.5, -0.5],
      ["cat", 0.8, -0.4],
      ["cat", 0.9, -0.9],
      ["cat", 0.3, -0.7],
    ];

    // Combine the OR training data with random data for after training
    this.testsOR = this.TRAINING_DATA_OR.slice(0, 4).concat(
      // Half dog array, half elephant like elements
      Array.from({ length: 4 }, () => [
        "elephant-like",
        Math.random() * -0.8 + 0.2, // random number between -0.2 and -1
        Math.random() * 0.8 + 0.2, // random number between 0.2 and 1
      ])
    );

    this.testsXOR = this.TRAINING_DATA_OR.slice(0, 4).concat(
      // Half dog array, half cat like elements
      Array.from({ length: 4 }, () => [
        "cat-like",
        Math.random() * 0.8 + 0.2, // random number between 0.2 and 1
        Math.random() * -0.8 + 0.2, // random number between -0.2 and -1
      ])
    );

    this.INPUT_SIZE = 3;
    this.OUTPUT_SIZE = 1;

    this.LEARNING_RATE = 0.1;
    this.EPOCHS = 100;

    this.STARTING_WEIGHTS = new Array(this.INPUT_SIZE)
      .fill(0)
      .map(() => this.round(Math.random() * 0.5));
  }

  main = async (outputToHTML = false) => {
    let current_weights = [],
      current_bias = 0;
    this.output_text = "";

    [current_weights, current_bias] = this.train(this.TRAINING_DATA_OR);
    this.output_text = "<b>Prediction for test problems</b>";
    this.output_text += this.buildOutput(
      this.testsOR,
      "OR - Half dog, half elephant",
      current_weights,
      current_bias
    );

    [current_weights, current_bias] = this.train(this.TRAINING_DATA_XOR);
    this.output_text += "<br><b>Prediction for test problems</b>";
    this.output_text += this.buildOutput(
      this.testsXOR,
      "XOR - Half dog, half cat",
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
    console.log(current_weights, current_bias);
    let output = `<br>${label} test<br>`;
    for (const test of tests) {
      const prediction = this.predict(test.slice(1), current_weights);
      output += `${test[0]}, prediction: ${this.round(prediction)} (${
        this.step(prediction, current_bias) == 1 ? "dog" : "not a dog"
      })<br>`;
    }
    return output;
  };

  train = (input_data) => {
    let bias = 0;
    let weights = this.STARTING_WEIGHTS;

    for (let _ = 0; _ < this.EPOCHS; _++) {
      for (const data of input_data) {
        const [label, ...inputs] = data;
        const target = label == "dog" ? 1 : -1;

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
      sum += data[i] * weights[i];
    }

    return sum;
  };

  step = (x) => {
    return x >= 0 ? 1 : -1;
  };
}
