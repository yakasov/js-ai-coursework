class Part5 {
  constructor() {
    this.decoder = new TextDecoder("utf-8");
    this.encoder = new TextEncoder("utf-8");
    this.imageCount = 2500; // How many images (out of 10000) to load
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

    this.DATASET = [];
  }

  main = async (outputToHtml = false) => {
    await this.loadDataset();

    if (outputToHtml) {
      const displayDict =
        this.DATASET[Math.round(Math.random() * this.imageCount)];
      const el = document.getElementById("outputEl");
      el.innerText = displayDict.label;

      this.displayImg(displayDict);
    }
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
      let dict = {
        label: this.labels[this.decEnc(buffer.slice(0, 1))],
        red: buffer.slice(1, 1025),
        green: buffer.slice(1025, 2049),
        blue: buffer.slice(2049, 3073),
      };
      dict["combined"] = this.combineChannels(dict);
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
      combinedArrayBuffer[i] = new Uint8Array(dict["red"])[i / 4];
      combinedArrayBuffer[i + 1] = new Uint8Array(dict["green"])[i / 4];
      combinedArrayBuffer[i + 2] = new Uint8Array(dict["blue"])[i / 4];
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

    const imageData = new ImageData(dict.combined, canvas.width, canvas.height);

    ctx.putImageData(imageData, 0, 0);
    document.getElementById("outputDiv").appendChild(canvas);
  };

  round = (x) => Math.round(x * 100) / 100;
}
