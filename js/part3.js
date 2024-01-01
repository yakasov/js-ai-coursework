class Part3 {
  constructor() {
    this.INPUT_SIZE = 3;
    this.OUTPUT_SIZE = 1;
    this.TRAIN_SIZE = 100; // Training set size

    this.LEARNING_RATE = 0.1;
    this.EPOCHS = 1000; // Keep TRAIN_SIZE * EPOCHS = ~ 1e5
    // See line 111 for the reasoning

    this.INPUTS = new Array(this.TRAIN_SIZE)
      .fill(0)
      .map(() => [Math.random(), Math.random(), Math.random()]);
    this.TARGETS = this.INPUTS.map((i) => i.reduce((a, b) => a * b, 1));
    this.OUTPUTS = new Array(this.TRAIN_SIZE + 1).fill(0);
    this.WEIGHTS = [
      new Array(this.INPUT_SIZE)
        .fill(0)
        .map(() => this.round(Math.random() * 0.5)),
      new Array(this.OUTPUT_SIZE)
        .fill(0)
        .map(() => this.round(Math.random() * 0.5)),
    ];
    this.DERIVATIVES = [
      new Array(this.INPUT_SIZE).fill(0),
      new Array(this.OUTPUT_SIZE).fill(0),
    ];

    this.TEST_INPUT = [0.3, 0.2, 0.5];
    this.TEST_TARGET = this.TEST_INPUT.reduce((a, b) => a * b, 1);
  }

  main = (outputToHTML = false) => {
    this.train();

    const output = this.forwards_pass(this.TEST_INPUT);
    const outputText = `Input: [${this.TEST_INPUT.toString().replaceAll(
      ",",
      ", "
    )}]<br>Expected ${this.TEST_TARGET}, got ${this.round(output[0])}`;

    if (outputToHTML) {
      const el = document.getElementById("outputEl");
      el.innerHTML = outputText;
    }
    console.log(outputText.replace("<br>", "\n"));
  };

  train = () => {
    for (let _ = 0; _ < this.EPOCHS; _++) {
      for (let i = 0; i < this.INPUTS.length; i++) {
        const inputs = this.INPUTS[i];
        const target = this.TARGETS[i];

        // Our output is the prediction from our forwards pass
        const output = this.forwards_pass(inputs);

        const error = target - output;

        // Run the backwards pass with the error to compute the gradient of the loss function
        this.backwards_pass(error);

        // Update our weights using gradient descent
        this.gradient_descent();
      }
    }
  };

  forwards_pass = (inputs) => {
    let output = inputs;
    this.OUTPUTS[0] = inputs;

    // Generate a prediction for each layer
    // This is done by multiplying our inputs by our weights,
    // then applying the sigmoid function
    for (let i = 0; i < this.WEIGHTS.length; i++) {
      const output_next = math.dot(output, this.WEIGHTS[i]);
      output = this.sigmoid(output_next);
      this.OUTPUTS[i + 1] = output;
    }

    return output;
  };

  backwards_pass = (error) => {
    // Here, we generate the derivatives and update our error
    // After generating our derivatives using sigmoid_d,
    // we can then update our weights using the gradient descent method
    for (let i = this.DERIVATIVES.length - 1; i > 0; i--) {
      const output_previous = this.OUTPUTS[i + 1];

      // Our derivative for the previous output is our error
      // multiplied by x * (1 / x) our previous output
      const derivative = error * this.sigmoid_d(output_previous);

      const output = this.OUTPUTS[i];

      // Our current derivative is our current output multiplied
      // by the previously calculated derivative
      this.DERIVATIVES[i] = math.dotMultiply(output, derivative);

      // Update our error based on our derivative
      error = math.dot([derivative], this.WEIGHTS[i]);
    }
  };

  gradient_descent = () => {
    // Find a local minimum for sigmoid_d
    // Then we can adjust our weights
    for (let i = 0; i < this.WEIGHTS.length; i++) {
      // This math.dotMultiply call is responsible for ~66% of the delay
      // when pressing the run button!!
      // Because of this, this.EPOCHS is set to 1000
      // A variable learning rate could possibly improve convergence speeds?
      const weightUpdate = math.dotMultiply(
        this.DERIVATIVES[i],
        this.LEARNING_RATE
      );
      this.WEIGHTS[i] = this.WEIGHTS[i].map((v, i) => v + weightUpdate[i]);
    }
  };

  sigmoid = (x) => {
    // Normal sigmoid function
    // with some JS nonsense to convert it to an array so it behaves properly
    // in the case it isn't (for example, like on the output layer)
    return (Array.isArray(x) ? x : [x]).map((e) => 1 / (1 + Math.exp(-e)));
  };

  sigmoid_d = (x) => {
    return x * (1 - x);
  };

  round = (x) => {
    return Math.round(x * 100) / 100;
  };
}
