class Part2 {
  constructor() {
    this.TRAINING_DATA = [
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

      ["elephant", -1, 1],
      ["elephant", -0.9, 1],
      ["elephant", -0.9, 0.7],
      ["elephant", -0.7, 1],
      ["elephant", -0.8, 0.8],
      ["elephant", -0.9, 0.6],
      ["elephant", -0.8, 0.6],
      ["elephant", -1, 0.9],
    ];

    this.WEIGHTS = [];
    for (let _ = 0; _ < 9; _++) {
      // 9x3 array - 8 for each training data piece + 1 for weights bias
      let temp_array = [];
      for (let __ = 0; __ < 3; __++) {
        temp_array.push(Math.round(Math.random() * 1e3) / 1e3);
        // Stupid JS for rounding to 3 decimal places (for ease of debugging)
      }
      this.WEIGHTS.push(temp_array);
    }

    this.INPUT_SIZE = 2;
    this.OUTPUT_SIZE = 1;

    this.LEARNING_RATE = 0.1;
    this.EPOCHS = 1000;
  }

  main = async (outputToHTML = false) => {
    for (let _ = 0; _ < this.EPOCHS; _++) {
      for (const data of this.TRAINING_DATA) {
        const [label, ...inputs] = data;
        const target = label == "dog" ? 1 : -1;

        const output = this.predict(inputs);

        const error = target - output;
        for (let i = 0; i < inputs.length; i++) {
          this.WEIGHTS[i] += this.LEARNING_RATE * error * inputs[i];
        }
      }
    }

    let output_text = `Prediction for test inputs ${[0.9, -0.7]}: ${
      this.predict([0.9, -0.7]) == 1 ? "A dog" : "Not a dog"
    }`;
    let el = document.getElementById("outputEl");
    el.innerHTML = output_text;
  };

  predict = (x) => {
    let sum = 0;
    for (let i = 0; i < x.length; i++) {
      sum += x[i] * this.WEIGHTS[i];
    }

    return this.step(sum);
  };

  step = (x) => {
    return x > 0 ? 1 : -1;
  };
}
