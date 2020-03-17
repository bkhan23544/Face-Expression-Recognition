import * as faceapi from "face-api.js";
import Jimp from "jimp";
import * as tf from "@tensorflow/tfjs"



export const loadModels = () => {
  const MODEL_URL = `${process.env.PUBLIC_URL}/models`;

  return Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
  ]).then(()=>{
    console.log("loaded")
  });
};

export const detectFaces = async image => {
  if (!image) {
    return;
  }

  const imgSize = image.getBoundingClientRect();
  const displaySize = {width: imgSize.width, height: imgSize.height};
  if (displaySize.height === 0) {
    return;
  }

  const faces = await faceapi
    .detectAllFaces(
      image,
      new faceapi.TinyFaceDetectorOptions({inputSize: 320})
    )

  return faceapi.resizeResults(faces, displaySize);
};

var result;

export const drawResults = async (image, canvas, results, type,tocrop,facecanvas,model) => {
  if (image && canvas && results) {
    // console.log(image,"image")
    const imgSize = image.getBoundingClientRect();
    const displaySize = {width: imgSize.width, height: imgSize.height};
    faceapi.matchDimensions(canvas, displaySize);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    var resizedDetections;
    if(displaySize.width!==0){
    resizedDetections = faceapi.resizeResults(results, displaySize);
  
    // console.log(resizedDetections,"detection")
    
    if(resizedDetections[0]){
    const box =resizedDetections[0].box
    // see DrawBoxOptions below
    const drawOptions = {
      lineWidth: 2
    }
    const drawBox = new faceapi.draw.DrawBox(box, drawOptions)
    drawBox.draw(canvas)
    
        // faceapi.draw.drawDetections(canvas, resizedDetections);
   
    
        
        
        Jimp.read(tocrop)
  .then(image => {
    image.crop( resizedDetections[0].box.x, resizedDetections[0].box.y, resizedDetections[0].box.width,resizedDetections[0].box.height ); 
    // image.greyscale()
    // image.resize(48,48)
    
    
    // var grayScale = convert(image.bitmap.data)
    
    // function convert(bitmapData) {
    //   var grayScaleArray = [];
    //   for (var i = 0; i < bitmapData.length; i += 4) {
    //     var g = bitmapData[i];
    //     var b = bitmapData[i + 1];
    //     var r = bitmapData[i + 2];
    //     var a = bitmapData[i + 3];
    //     var gray = (r + b + g + a) / 4;
    
    //     grayScaleArray.push(gray);
    //     grayScaleArray.push(gray);
    //     grayScaleArray.push(gray);
    //     grayScaleArray.push(gray);

    
    //   };
    //   // console.log(grayScaleArray,"image")
    //   return grayScaleArray;
    // };

    // image.bitmap.data=grayScale
    image.greyscale()
    image.resize(48,48)
    // console.log(image.bitmap.data,"image")
   
  //   var img = new Image(image.bitmap.width, image.bitmap.height);
  //   img.onload = () => {
  //     facecanvas.current.getContext("2d").drawImage(img, 0, 0)
  //   }
  //   image.getBase64(Jimp.AUTO, (err, src) => {
  //     img.src = src
  //  })

var input = new Int32Array(image.bitmap.data)
input = tf.tensor(input)
input = input.reshape([48,48,4])
input = input.mean(2)
input = input.expandDims(2)
input = input.reshape([-1,48,48,1])
// tf.browser.toPixels(input,facecanvas.current)

var output = model.predict(input)
output = output.dataSync()
result = output

 
  })
}
  return result 
      }
    
  }
  
};
