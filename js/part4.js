/*
This code can be executed by copying it into a browser console
and running >
await (new Part4()).main()
It can also be found at
https://yakasov.github.io/js-ai-coursework/
*/

class Part4 {
  constructor() {
    this.INPUT_SIZE = 3;
    this.HIDDEN_SIZE = [3, 3];
    this.OUTPUT_SIZE = 1;
    this.LAYERS = [this.INPUT_SIZE]
      .concat(this.HIDDEN_SIZE)
      .concat(this.OUTPUT_SIZE);
    this.TRAIN_SIZE = 100; // Training set size

    this.LEARNING_RATE = 0.1;
    this.EPOCHS = 250; // Keep TRAIN_SIZE * EPOCHS = ~ 1e5

    this.INPUTS = new Array(this.TRAIN_SIZE)
      .fill(0)
      .map(() => [Math.random(), Math.random(), Math.random()]);
    this.TARGETS = this.INPUTS.map((i) => i.reduce((a, b) => a * b, 1));
    this.OUTPUTS = new Array(this.TRAIN_SIZE + 1).fill(0);
    this.WEIGHTS = this.LAYERS.map((size) =>
      new Array(size).fill(0).map(() => this.round(Math.random() * 0.5))
    );
    this.DERIVATIVES = this.LAYERS.map((size) => new Array(size).fill(0));

    this.TEST_INPUT = [0.3, 0.2, 0.5];
    this.TEST_TARGET = this.TEST_INPUT.reduce((a, b) => a * b, 1);
  }

  main = (outputToHTML = false) => {
    this.train();

    const output = this.forwards_pass(this.TEST_INPUT, true);
    const outputText = `Input: [${this.TEST_INPUT.toString().replaceAll(
      ",",
      ", "
    )}]<br>Expected ${this.TEST_TARGET}, got ${
      output[0] > 0.005 ? this.round(output[0]) : output[0]
    }`;

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

    /*
    Generate a prediction for each layer
    This is done by multiplying our inputs by our weights,
    then applying the relu function
    */
    for (let i = 0; i < this.WEIGHTS.length; i++) {
      const output_next = this.fixedDot(output, this.WEIGHTS[i]);
      output = this.relu(output_next);
      this.OUTPUTS[i + 1] = output;
    }

    return output;
  };

  backwards_pass = (error) => {
    /*
    Here, we generate the derivatives and update our error
    After generating our derivatives using relu_d,
    we can then update our weights using the gradient descent method
    */
    for (let i = this.DERIVATIVES.length - 1; i > 0; i--) {
      const output_previous = this.OUTPUTS[i + 1];

      // Our derivative for the previous output is our error
      // multiplied by x * (1 / x) our previous output
      const derivative = error * this.relu_d(output_previous);

      const output = this.OUTPUTS[i];

      // Our current derivative is our current output multiplied
      // by the previously calculated derivative
      this.DERIVATIVES[i] = this.fixedDot(output, [~~derivative]);
      // Update our error based on our derivative
      error = this.fixedDot([~~derivative], this.WEIGHTS[i]);
    }
  };

  gradient_descent = () => {
    // Find a local minimum for relu_d
    // Then we can adjust our weights
    for (let i = 0; i < this.WEIGHTS.length; i++) {
      const weightUpdate = math.dotMultiply(
        this.DERIVATIVES[i],
        this.LEARNING_RATE
      );
      this.WEIGHTS[i] = this.WEIGHTS[i].map(
        (v, i) =>
          v + (Array.isArray(weightUpdate) ? weightUpdate[i] : weightUpdate)
      );
    }
  };

  /*
  Normal relu function
  with some JS nonsense to convert it to an array so it behaves properly
  in the case it isn't (for example, like on the output layer)
  */
  relu = (x) => (Array.isArray(x) ? x : [x]).map((e) => Math.max(0, e));

  relu_d = (x) => (x >= 0 ? 1 : 0);

  round = (x) => Math.round(x * 100) / 100;

  /*
  math.js dot isn't as elegant as numpy.dot
  and has two functions that work similarly but have different requirements
  so this helps us switch between them for calculating
  */
  fixedDot = (a, b) =>
    a.length == b.length ? math.dot(a, b) : math.dotMultiply(a, b);
}
