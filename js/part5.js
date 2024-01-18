/*
This code can be executed by copying it into a browser console
and running >
await (new Part5()).main()
It can also be found at
https://yakasov.github.io/js-ai-coursework/
*/

class Part5 {
  constructor() {
    this.decoder = new TextDecoder("utf-8");
    this.encoder = new TextEncoder("utf-8");
    this.labels = [
      "airplane",
      "car",
      "bird",
      "cat",
      "deer",
      "dog",
      "frog",
      "horse",
      "ship",
      "truck",
    ];
    this.colours = ["red", "green", "blue"];

    this.DATASET = [];
    this.FILTERS = 2;
    this.IMAGECOUNT = 10000; // How many images (out of 10000) to load
    this.WEIGHTS = {};

    this.LEARNING_RATE = 0.1;
  }

  main = async (
    outputToHtml = false,
    customImageCount = 0,
    customFilterCount = 0
  ) => {
    if (customImageCount) this.IMAGECOUNT = customImageCount;
    if (customFilterCount) this.FILTERS = customFilterCount;
    for (let l = 0; l < this.labels.length; l++) {
      this.WEIGHTS[l] = new Array(3072 / 4 ** this.FILTERS)
        .fill(0)
        .map(() => this.round(Math.random()));
    }

    const eta = `Estimated time: ${
      Math.round(
        (this.IMAGECOUNT *
          ((this.FILTERS ** 2 + 747 * this.FILTERS - 418) /
            (100 * this.FILTERS ** 2))) /
          10
      ) / 100
    } seconds`;

    console.warn(eta);
    if (outputToHtml) {
      const el = document.getElementById("outputEl");
      el.innerHTML = `Building output maps...<br>Processing ${this.IMAGECOUNT} images over ${this.FILTERS} filters<br><br>You can see progress in the console!<br>${eta}`;
      document.getElementById("outputDiv").innerHTML = "";
    }

    if (!this.DATASET.length) {
      await this.loadDataset();
    }

    this.processImages();

    for (const [_, finalImg] of this.DATASET.slice(
      this.IMAGECOUNT - 5,
      this.IMAGECOUNT
    ).entries()) {
      this.finalPrediction(finalImg, outputToHtml);
    }

    if (outputToHtml) {
      const el = document.getElementById("outputEl");
      el.innerHTML = `Generated 5 predictions from ${this.IMAGECOUNT} images over ${this.FILTERS} filters!<br>(please refresh to generate again)`;

      const button = document.getElementById("p5button");
      button.disabled = true;
    }

    console.log("weights", this.WEIGHTS);
    console.log("dataset", this.DATASET[this.IMAGECOUNT - 1]);
  };

  finalPrediction = (img, outputToHtml) => {
    // This takes the final 5 images of the dataset (that haven't been used for training)
    // and generates then outputs their predictions
    let outputs = {
      red: [],
      green: [],
      blue: [],
    };

    for (let i = 0; i < this.FILTERS; i++) {
      for (let j = 0; j < 3; j++) {
        // Forward pass for each separate colour channel
        outputs[this.colours[j]] = this.forwardPass(
          outputs[this.colours[j]].length
            ? outputs[this.colours[j]]
            : img[this.colours[j]]
        );
      }

      // Combine all three 8x8 colour matrices into one 192 length vector
      img["processedChannels"] = outputs;
      img["combinedVector"] = []
        .concat(
          ...img["processedChannels"]["red"],
          ...img["processedChannels"]["green"],
          img["processedChannels"]["blue"]
        )
        .flat();
    }

    const predictions = this.generatePredictions(img);
    const prediction =
      this.labels[predictions.indexOf(Math.max(...predictions))];
    console.log(
      `I guessed ${prediction}, and the actual answer was ${
        this.labels[img["label"]]
      }.`
    );

    if (outputToHtml) {
      let id = this.displayImg(img, prediction);
      this.displayImg(img, prediction, true, id);
    }
  };

  processImages = () => {
    for (const [index, img] of this.DATASET.entries()) {
      // Each image ...
      let outputs = {
        red: [],
        green: [],
        blue: [],
      };

      for (let i = 0; i < this.FILTERS; i++) {
        // through each filter ...
        for (let j = 0; j < 3; j++) {
          // for each colour
          outputs[this.colours[j]] = this.forwardPass(
            outputs[this.colours[j]].length
              ? outputs[this.colours[j]]
              : img[this.colours[j]]
          );
        }

        // Combine all three 8x8 colour matrices into one 192 length vector
        this.DATASET[index]["processedChannels"] = outputs;
        this.DATASET[index]["combinedVector"] = []
          .concat(
            ...this.DATASET[index]["processedChannels"]["red"],
            ...this.DATASET[index]["processedChannels"]["green"],
            this.DATASET[index]["processedChannels"]["blue"]
          )
          .flat();
      }

      this.train(img);
    }

    if (index % Math.round(this.IMAGECOUNT / 100) == 0) {
      console.log(`${Math.round((index / this.IMAGECOUNT) * 100) + 1}%`);
    }
  };

  forwardPass = (dimArray) => {
    /*
    the input is 32 x 32
    we need to apply a filter over the top
    the result will be 30x30, so
    use a padded matrix to keep the sizes consistent
    */

    let paddedArray = dimArray.map((row) => [~~0].concat(row).concat([~~0]));
    paddedArray = [new Array(dimArray.length + 2).fill(0)]
      .concat(paddedArray)
      .concat([new Array(dimArray.length + 2).fill(0)]);

    let outputMap = new Array(paddedArray.length - 2)
      .fill(0)
      .map(() => new Array(paddedArray.length - 2).fill(0));

    for (let y = 0; y < paddedArray.length - 2; y++) {
      // length - 2 to avoid spilling over the edges !
      for (let x = 0; x < paddedArray.length - 2; x++) {
        // this is the top left of the filter
        const filter = [
          paddedArray[y].slice(x, x + 3),
          paddedArray[y + 1].slice(x, x + 3),
          paddedArray[y + 2].slice(x, x + 3),
        ];

        const outputSum = filter
          .reduce(function (a, b) {
            return a.concat(b);
          })
          .reduce(function (a, b) {
            return a + b;
          });
        outputMap[y][x] = this.relu(outputSum);
      }
    }

    return this.maxPool(outputMap);
  };

  maxPool = (outputMap) => {
    // Apply another filter over our outputMap and take the max
    // inside that filter. Stride is 2 -> no overlaps
    let pooledMap = new Array(outputMap.length / 2)
      .fill(0)
      .map(() => new Array(outputMap.length / 2).fill(0));

    for (let y = 0; y < outputMap.length - 1; y += 2) {
      for (let x = 0; x < outputMap.length - 1; x += 2) {
        pooledMap[y / 2][x / 2] = Math.max(
          ...outputMap[y]
            .slice(x, x + 2)
            .concat(outputMap[y + 1].slice(x, x + 2))
        );
      }
    }

    return pooledMap;
  };

  loadDataset = async () => {
    console.warn(
      "Loading dataset - this can take a few seconds if not already loaded!"
    );
    await fetch("./dataset/data_batch_1.bin")
      .then((response) => {
        return response.arrayBuffer();
      })
      .then((buffer) => {
        for (let i = 0; i < this.IMAGECOUNT; i++) {
          // Divide the buffer into 3073 byte parts (label + channels)
          let slicedData = buffer.slice(3073 * i, 3073 * (i + 1));
          this.DATASET.push(slicedData);
        }
      });
    console.warn("Dataset loaded - beginning processing...");

    this.DATASET = this.DATASET.map((buffer) => {
      // 1 byte label, then 3072 R/G/B bytes
      let dict = {
        label: parseInt(this.decEnc(buffer.slice(0, 1))),
        redRaw: buffer.slice(1, 1025),
        red: [],
        greenRaw: buffer.slice(1025, 2049),
        green: [],
        blueRaw: buffer.slice(2049, 3073),
        blue: [],
      };

      for (let i = 0; i < 1024; i += 32) {
        // Here, we separate each long ArrayBuffer into 32 bytes each
        // to make a 32x32 matrix
        dict["red"].push(
          Array.from(new Uint8Array(dict["redRaw"].slice(i, i + 32)))
        );
        dict["green"].push(
          Array.from(new Uint8Array(dict["greenRaw"].slice(i, i + 32)))
        );
        dict["blue"].push(
          Array.from(new Uint8Array(dict["blueRaw"].slice(i, i + 32)))
        );
      }
      return dict;
    });
  };

  train = (currentImage) => {
    /*
    Originally this was implemented with backpropagation and gradient descent
    But I could never get it working properly - when it did work, it didn't train
    properly. 

    Instead, this is a different attempt - we calculate the loss
    and get the loss delta, then apply that to the weights.
    It's a little similar but not the same.
    */
    const label = currentImage["label"];
    const predictions = this.generatePredictions(currentImage);

    const loss = this.calculateLoss(label, predictions);

    const lossDelta = this.leaky_relu_d(predictions[label]) * loss;
    this.WEIGHTS[label] = this.WEIGHTS[label].map(
      (w) => w - lossDelta * this.LEARNING_RATE
    );
  };

  generatePredictions = (currentImage) => {
    let predictions = [];

    /*
    Here we get the dot product of our combined vector with the weights
    However, I also modulo by 10 to get a much smaller output between 0 and 9
    This seems to help keep the predictions realistic (if not correct)
    and prevents it generating numbers up to 1.8e308
    */
    for (let l = 0; l < this.labels.length; l++) {
      predictions = predictions.concat(
        math.dot(currentImage["combinedVector"], this.WEIGHTS[l])
      );
    }

    return predictions;
  };

  calculateLoss = (label, predictions) => {
    // This is just an implementation of Multiclass SVM Loss
    // actual target - each prediction + 1
    let totalLoss = 0;
    for (let l = 0; l < this.labels.length; l++) {
      totalLoss += Math.max(0, predictions[l] - predictions[label] + 1);
    }
    return totalLoss;
  };

  decEnc = (buffer) => {
    // Decode the ArrayBuffer into bytes then re-encode to utf-8
    return this.encoder.encode(this.decoder.decode(buffer));
  };

  combineChannels = (dict, pooled = false) => {
    // Combine RGB channels (and Alpha) to make displayable image
    // Not necessary for Part 5, but nice to see
    let combinedArrayBuffer = new Uint8ClampedArray(
      pooled ? 4096 / 4 ** this.FILTERS : 4096
    );
    for (let i = 0; i < combinedArrayBuffer.length; i += 4) {
      combinedArrayBuffer[i] =
        new Uint8Array(
          pooled ? dict["processedChannels"]["red"].flat() : dict["redRaw"]
        )[i / 4] % 256;
      combinedArrayBuffer[i + 1] =
        new Uint8Array(
          pooled ? dict["processedChannels"]["green"].flat() : dict["greenRaw"]
        )[i / 4] % 256;
      combinedArrayBuffer[i + 2] =
        new Uint8Array(
          pooled ? dict["processedChannels"]["blue"].flat() : dict["blueRaw"]
        )[i / 4] % 256;
      combinedArrayBuffer[i + 3] = 255;
    }
    return combinedArrayBuffer;
  };

  displayImg = (dict, prediction = "", pooled = false, id = "") => {
    // Create a canvas and display an image from the combined RGBA ArrayBuffer
    if (!id) id = Math.random().toString();
    const span = document.createElement("span");
    span.id = id;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = pooled ? 32 / 2 ** this.FILTERS : 32;
    canvas.height = pooled ? 32 / 2 ** this.FILTERS : 32;

    const imageData = new ImageData(
      this.combineChannels(dict, pooled),
      canvas.width,
      canvas.height
    );

    ctx.putImageData(imageData, 0, 0);
    if (!pooled) document.getElementById("outputDiv").appendChild(span);

    const el = document.getElementById(id);
    el.appendChild(canvas);

    if (prediction.length || pooled) {
      const text = document.createElement("p");
      text.innerText = pooled ? "pooled + filtered" : prediction;
      el.appendChild(text);
    }

    return id;
  };

  relu = (x) => Math.max(0, x);

  leaky_relu_d = (x) => (x >= 0 ? 1 : 0.01);

  round = (x) => Math.round(x * 100) / 100;
}
