// This code can be executed by copying it into a browser console
// and running >
// await (new Part5()).main()
//
// It can also be found at
// https://yakasov.github.io/js-ai-coursework/

class Part5 {
  constructor() {
    this.decoder = new TextDecoder("utf-8");
    this.encoder = new TextEncoder("utf-8");
    this.imageCount = 1000; // How many images (out of 10000) to load
    this.labels = [
      "airplane",
      "automobile",
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
    this.WEIGHTS = new Array(this.FILTERS).fill(0).map(() => {
      return {
        red: new Array(3)
          .fill(0)
          .map(() =>
            new Array(3).fill(0).map(() => this.round(Math.random() * 0.5))
          ),
        green: new Array(3)
          .fill(0)
          .map(() =>
            new Array(3).fill(0).map(() => this.round(Math.random() * 0.5))
          ),
        blue: new Array(3)
          .fill(0)
          .map(() =>
            new Array(3).fill(0).map(() => this.round(Math.random() * 0.5))
          ),
      };
    });
    this.BIASES = [0, 0, 0];
  }

  main = async (outputToHtml = false) => {
    if (outputToHtml) {
      const el = document.getElementById("outputEl");
      el.innerHTML = `Building output maps...<br>Processing ${this.imageCount} images over ${this.FILTERS} filters<br><br>You can see progress in the console!`;
    }

    if (!this.DATASET.length) {
      await this.loadDataset();
    }

    this.train();

    if (outputToHtml) {
      const el = document.getElementById("outputEl");
      el.innerHTML = `DONE`;
    }

    if (outputToHtml && false) {
      const displayDict =
        this.DATASET[Math.round(Math.random() * this.imageCount)];
      const el = document.getElementById("outputEl");
      el.innerText = displayDict.label;

      this.displayImg(displayDict);
    }
  };

  train = () => {
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
          outputs[this.colours[j]] = this.buildOutputMap(
            outputs[this.colours[j]].length
              ? outputs[this.colours[j]]
              : img[this.colours[j]],
            i,
            j
          );
        }
      }
      console.log(`${index}/${this.imageCount}`);
    }
  };

  buildOutputMap = (dimArray, filterNo, colourNo) => {
    // the input is 32 x 32
    // we need to apply a filter over the top
    // the result will be 28x28
    //
    // for each, we also need the specific filter weights
    // for the specific colour
    // ... grumble
    //
    // the weights matrix is
    // this.WEIGHTS[filterNo][colourNo] => [3 x [3]]

    let outputMap = new Array(dimArray.length - 2)
      .fill(0)
      .map(() => new Array(dimArray.length - 2));

    for (let y = 0; y < dimArray.length - 2; y++) {
      // length - 2 to avoid spilling over the edges !
      for (let x = 0; x < dimArray.length - 2; x++) {
        // this is the top left of the pattern
        const pattern = [
          dimArray[y].slice(x, x + 3),
          dimArray[y + 1].slice(x, x + 3),
          dimArray[y + 2].slice(x, x + 3),
        ];

        const output = math.dotMultiply(
          pattern,
          this.WEIGHTS[filterNo][this.colours[colourNo]]
        );

        const outputSum = output
          .reduce(function (a, b) {
            return a.concat(b);
          })
          .reduce(function (a, b) {
            return a + b;
          });
        outputMap[y][x] = outputSum;
      }
    }

    return outputMap;
  };

  loadDataset = async () => {
    await fetch("./dataset/data_batch_1.bin")
      .then((response) => {
        return response.arrayBuffer();
      })
      .then((buffer) => {
        for (let i = 0; i < this.imageCount; i++) {
          let slicedData = buffer.slice(3073 * i, 3073 * (i + 1));
          this.DATASET.push(slicedData);
        }
      });

    this.DATASET = this.DATASET.map((buffer) => {
      // 1 byte label, then 3072 R/G/B bytes
      // colourDim represents a 32x32 matrix of the colour
      let dict = {
        label: this.decEnc(buffer.slice(0, 1)),
        redRaw: buffer.slice(1, 1025),
        red: [],
        greenRaw: buffer.slice(1025, 2049),
        green: [],
        blueRaw: buffer.slice(2049, 3073),
        blue: [],
      };

      for (let i = 0; i < 1024; i += 32) {
        dict.red.push(Array.from(new Uint8Array(dict.redRaw.slice(i, i + 32))));
        dict.green.push(
          Array.from(new Uint8Array(dict.greenRaw.slice(i, i + 32)))
        );
        dict.blue.push(
          Array.from(new Uint8Array(dict.blueRaw.slice(i, i + 32)))
        );
      }
      return dict;
    });
  };

  decEnc = (buffer) => {
    // Decode the ArrayBuffer into bytes then re-encode to utf-8
    return this.encoder.encode(this.decoder.decode(buffer));
  };

  combineChannels = (dict) => {
    // Combine RGB channels (and Alpha) to make displayable image
    // Not necessary for Part 5, but nice to see
    let combinedArrayBuffer = new Uint8ClampedArray(4096);
    for (let i = 0; i < combinedArrayBuffer.length; i += 4) {
      combinedArrayBuffer[i] = new Uint8Array(dict.redRaw)[i / 4];
      combinedArrayBuffer[i + 1] = new Uint8Array(dict.greenRaw)[i / 4];
      combinedArrayBuffer[i + 2] = new Uint8Array(dict.blueRaw)[i / 4];
      combinedArrayBuffer[i + 3] = 255;
    }
    return combinedArrayBuffer;
  };

  displayImg = (dict) => {
    // Create a canvas and display an image from the combined RGBA ArrayBuffer
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 32;
    canvas.height = 32;

    const imageData = new ImageData(
      this.combineChannels(dict),
      canvas.width,
      canvas.height
    );

    ctx.putImageData(imageData, 0, 0);
    document.getElementById("outputDiv").appendChild(canvas);
  };

  round = (x) => Math.round(x * 100) / 100;
}
