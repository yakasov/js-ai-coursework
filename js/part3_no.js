class Part3 {
  constructor() {
    this.INPUT_SIZE = 3;
    this.OUTPUT_SIZE = 1;

    this.INPUTS = Array.from(1000)
      .fill(0)
      .map(() => [Math.random(), Math.random(), Math.random()]);
    this.TARGETS = Array.from(1000)
      .fill(0)
      .map(() => this.round(Math.random()));

    this.LEARNING_RATE = 0.01;
    this.EPOCHS = 10000;

    this.STARTING_WEIGHTS = new Array(this.INPUT_SIZE)
      .fill(0)
      .map(() => this.round(Math.random() * 0.5));
    this.STARTING_BIASES = new Array(this.OUTPUT_SIZE).fill(0);
  }

  main = (outputToHTML = false) => {
    const testInputs = [[0.2, 0.3, 0.5]];
    const originalOutput = this.testNetwork(
      testInputs,
      this.STARTING_WEIGHTS,
      this.STARTING_BIASES
    );

    const [trainedWeights, trainedBiases] = this.train(this.INPUTS);
    console.warn(trainedWeights);

    const trainedOutput = this.testNetwork(
      testInputs,
      trainedWeights,
      trainedBiases
    );

    if (outputToHTML) {
      let el = document.getElementById("outputEl");
      el.innerHTML = `Input: ${testInputs
        .toString()
        .replaceAll(
          ",",
          ", "
        )}<br>Original Output: ${originalOutput}<br>Trained Output: ${trainedOutput}`;
    }
    console.log(trainedOutput);
  };

  train = (input_data) => {
    let weights = this.STARTING_WEIGHTS;
    let biases = this.STARTING_BIASES;

    for (let epoch = 0; epoch < this.EPOCHS; epoch++) {
      // Forwards pass with sigmoid
      const layerInput = input_data.map(
        (input) =>
          input.reduce((acc, val, i) => acc + val * weights[i], 0) + biases
      );
      const layerOutput = layerInput.map(this.sigmoid);

      // Error is difference in target
      const error = this.TARGETS.map((target, i) => target - layerOutput[i]);

      // Backwards pass with sigmoid derivative
      const outputDelta = error.map((e, i) => e * this.sigmoid(layerOutput[i]));

      // Update weights and biases
      for (let i = 0; i < this.INPUT_SIZE; i++) {
        weights[i] +=
          this.LEARNING_RATE *
          input_data.reduce(
            (acc, input, j) => acc + input[i] * outputDelta[j],
            0
          );
      }

      biases = biases.map(
        (bias, _) =>
          bias +
          this.LEARNING_RATE *
            outputDelta.reduce((acc, delta) => acc + delta, 0)
      );
    }

    return [weights, biases];
  };

  testNetwork = (input_data, weights, biases) => {
    const layerInput = input_data.map(
      (input) =>
        input.reduce((acc, val, i) => acc + val * weights[i], 0) + biases
    );
    const layerOutput = layerInput.map(this.sigmoid);
    return layerOutput;
  };

  round = (x) => {
    return Math.round(x * 100) / 100;
  };

  sigmoid = (x) => {
    return 1 / (1 + Math.exp(-x));
  };

  sigmoid_d = (x) => {
    return x * (1 - x);
  };
}
