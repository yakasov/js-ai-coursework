class Part3 {
  constructor() {
    this.INPUT_SIZE = 3;
    this.OUTPUT_SIZE = 1;
    this.TRAIN_SIZE = 100;

    this.LEARNING_RATE = 0.1;
    this.EPOCHS = 1000;

    this.INPUTS = new Array(this.TRAIN_SIZE)
      .fill(0)
      .map(() => [Math.random(), Math.random(), Math.random()]);
    this.OUTPUTS = new Array(this.TRAIN_SIZE + 1).fill(0);
    this.TARGETS = new Array(this.TRAIN_SIZE)
      .fill(0)
      .map(() => this.round(Math.random()));
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
    console.warn(`Expected ${this.TEST_TARGET}, got ${this.round(output[0])}`);
  };

  train = () => {
    for (let epoch = 0; epoch < this.EPOCHS; epoch++) {
      for (let i = 0; i < this.INPUTS.length; i++) {
        const inputs = this.INPUTS[i];
        const target = this.TARGETS[i];

        // Our output is the result of our prediction
        const output = this.forwards_pass(inputs);

        // Our error is the difference between our prediction and the target
        const error = target - output;
        this.backwards_pass(error);
        this.gradient_descent();
      }
    }
  };

  forwards_pass = (inputs) => {
    let output = inputs;
    this.OUTPUTS[0] = inputs;

    for (let i = 0; i < this.WEIGHTS.length; i++) {
      const output_next = math.dot(output, this.WEIGHTS[i]);
      output = this.sigmoid(output_next);
      this.OUTPUTS[i + 1] = output;
    }

    return output;
  };

  backwards_pass = (error) => {
    for (let i = this.DERIVATIVES.length - 1; i > 0; i--) {
      const output_previous = this.OUTPUTS[i + 1];
      const derivative = error * this.sigmoid_d(output_previous);

      const output = this.OUTPUTS[i];
      this.DERIVATIVES[i] = math.dotMultiply(output, derivative);

      error = math.dot(Array(1).fill(derivative), this.WEIGHTS[i]);
    }
  };

  gradient_descent = () => {
    for (let i = 0; i < this.WEIGHTS.length; i++) {
      //   console.log(this.DERIVATIVES[i]);
      for (let j = 0; j < this.WEIGHTS[i].length; j++) {
        // console.log(this.WEIGHTS[i][j], this.DERIVATIVES[i][0]);
        this.WEIGHTS[i] = math.add(
          this.WEIGHTS[i],
          math.dotMultiply(this.DERIVATIVES[i], this.LEARNING_RATE)
        );
        // this.WEIGHTS[i][j] += this.DERIVATIVES[i][0] * this.LEARNING_RATE;
      }
    }
  };

  sigmoid = (x) => {
    return (Array.isArray(x) ? x : [x]).map((e) => 1 / (1 + Math.exp(-e)));
  };

  sigmoid_d = (x) => {
    return x * (1 - x);
  };

  round = (x) => {
    return Math.round(x * 100) / 100;
  };
}
