class Part5 {
  constructor() {
    this.decoder = new TextDecoder("utf-8");
    this.encoder = new TextEncoder("utf-8");

    this.DATASET = [];
  }

  main = async (outputToHtml = false) => {
    await this.loadDataset();

    if (outputToHtml) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 32;
      canvas.height = 32;

      console.log(this.DATASET[0].combined.length);

      const imageData = new ImageData(
        this.DATASET[10].combined,
        canvas.width,
        canvas.height
      );

      ctx.putImageData(imageData, 0, 0);
      document.body.appendChild(canvas);
    }
  };

  loadDataset = async () => {
    let rawData = await fetch("./dataset/data_batch_1.bin")
      .then((response) => {
        return response.arrayBuffer();
      })
      .then((buffer) => {
        for (let i = 0; i < 10000; i++) {
          let slicedData = buffer.slice(3073 * i, 3073 * (i + 1));
          this.DATASET.push(slicedData);
        }
      });
    this.DATASET = this.DATASET.map((buffer) => {
      let dict = {
        label: this.decEnc(buffer.slice(0, 1)),
        red: buffer.slice(1, 1025),
        green: buffer.slice(1025, 2049),
        blue: buffer.slice(2049, 3073),
      };
      dict["combined"] = this.combineChannels(dict);
      return dict;
    });
  };

  decEnc = (buffer) => {
    return this.encoder.encode(this.decoder.decode(buffer));
  };

  decb64 = (buffer) => {
    return btoa(this.decEnc(buffer));
  };

  combineChannels = (dict) => {
    let combinedArrayBuffer = new Uint8ClampedArray(4096);
    for (let i = 0; i < combinedArrayBuffer.length; i += 4) {
      combinedArrayBuffer[i] = new Uint8Array(dict["red"])[i / 4]; // R
      combinedArrayBuffer[i + 1] = new Uint8Array(dict["green"])[i / 4]; // G
      combinedArrayBuffer[i + 2] = new Uint8Array(dict["blue"])[i / 4]; // B
      combinedArrayBuffer[i + 3] = 255;
    }
    return combinedArrayBuffer;
  };
}
