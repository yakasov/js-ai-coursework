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
    this.imageCount = 5; // How many images (out of 10000) to load
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

    this.sampleImage();

    if (outputToHtml) {
      const el = document.getElementById("outputEl");
      el.innerHTML = `DONE`;
    }
    console.log(this.DATASET[0]);

    if (outputToHtml && false) {
      const displayDict =
        this.DATASET[Math.round(Math.random() * this.imageCount)];
      const el = document.getElementById("outputEl");
      el.innerText = displayDict.label;

      this.displayImg(displayDict);
    }
  };

  sampleImage = () => {
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
          console.log(outputs[this.colours[j]]);
        }

        this.DATASET[index]["processedChannels"] = outputs;
      }

      // Flatten the 8x8 results into a 1D array
      let finalVector = [];
      Object.keys(this.DATASET[index]["processedChannels"]).forEach(
        (k) =>
          (finalVector = finalVector.concat(
            this.DATASET[index]["processedChannels"][k].flat()
          ))
      );
      this.DATASET[index]["finalVector"] = finalVector;
      console.log(`${index + 1}/${this.imageCount}`);
    }
  };

  buildOutputMap = (dimArray, filterNo, colourNo) => {
    /*
    the input is 32 x 32
    we need to apply a filter over the top
    the result will be 30x30, so
    use a padded matrix to keep the sizes consistent
    
    for each, we also need the specific filter weights
    for the specific colour
    ... grumble
    
    the weights matrix is
    this.WEIGHTS[filterNo][this.colours[colourNo]] => [3 x [3]]
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

        // Multiply the weights against the filter we've applied
        const output = math.dotMultiply(
          filter,
          this.WEIGHTS[filterNo][this.colours[colourNo]]
        );

        const outputSum = output
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
    await fetch("./dataset/data_batch_1.bin")
      .then((response) => {
        return response.arrayBuffer();
      })
      .then((buffer) => {
        for (let i = 0; i < this.imageCount; i++) {
          // Divide the buffer into 3073 byte parts (label + channels)
          let slicedData = buffer.slice(3073 * i, 3073 * (i + 1));
          this.DATASET.push(slicedData);
        }
      });

    this.DATASET = this.DATASET.map((buffer) => {
      // 1 byte label, then 3072 R/G/B bytes
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
        // Here, we separate each long ArrayBuffer into 32 bytes each
        // to make a 32x32 matrix
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

  relu = (x) => Math.max(0, x);

  round = (x) => Math.round(x * 100) / 100;
}
