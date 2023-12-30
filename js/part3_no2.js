class Part3 {
  constructor() {
    this.INPUT_SIZE = 3;
    this.OUTPUT_SIZE = 1;

    this.LEARNING_RATE = 0.1;
    this.EPOCHS = 50;

    this.INPUTS = new Array(100)
      .fill(0)
      .map(() => [Math.random(), Math.random(), Math.random()]);
    this.TARGETS = new Array(100).fill(0).map(() => this.round(Math.random()));
    this.WEIGHTS = new Array(this.INPUT_SIZE)
      .fill(0)
      .map(() => this.round(Math.random() * 0.5));

    this.TEST_INPUT = [0.3, 0.2];
    this.TEST_TARGET = [0.06];

    this.outputs = new Array(this.INPUT_SIZE + 1).fill(0);
    this.derivatives = new Array(this.INPUT_SIZE).fill(0);
  }

  main = (outputToHTML = false) => {
    this.train(this.INPUTS, this.TARGETS);
    const output = this.forward_pass(this.TEST_INPUT);
    console.log(output);
  };

  train = (input_data, targets) => {
    // console.warn(input_data);
    for (let epoch = 0; epoch < this.EPOCHS; epoch++) {
      for (let i = 0; i < input_data.length; i++) {
        const target = targets[i];
        const output = this.forward_pass(input_data[i]);
        const error = target - output;

        // console.warn(error);
        this.backwards_pass(error);
      }
    }
  };

  forward_pass = (input) => {
    let output = input;
    //console.error("pre-output", output);

    for (let i = 0; i < this.WEIGHTS.length; i++) {
      console.warn(i, output, this.WEIGHTS[i]);
      const input_next = math.dot(output, this.WEIGHTS);
      console.log("input_next", input_next);
      output = this.sigmoid(input_next);
      //   console.log("output", output);
      //   this.outputs[i + 1] = output;
    }

    // console.error("returning this output", output);

    return output;
  };

  backwards_pass = (error) => {
    for (let i = this.derivatives.length - 1; i >= 0; i--) {
      const derivative = error * this.sigmoid_d(this.outputs[i + 1]);

      this.derivatives[i] = this.dot([this.outputs[i]], derivative);
      error = derivative * this.WEIGHTS[i];
    }
  };

  dot = (a, b) => {
    console.log("a", a, "b", b);
    return a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n);
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
