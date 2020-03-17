import React, { useRef, useState, useEffect } from 'react';
import './App.css';
import { loadModels, detectFaces, drawResults } from "./Face API/faceApi";
import * as tf from '@tensorflow/tfjs';
import loading from './Assets/loading.gif'
import Camera from "./Camera/Camera"






loadModels();
function App() {

  const MODEL_PATH = './jsmodel/model.json';

  const INDEXEDDB_DB = 'tensorflowjs';
  const INDEXEDDB_STORE = 'model_info_store';
  const INDEXEDDB_KEY = 'web-model';

  const photoMode = false
  useEffect(() => {
    loadmodel().then(() => {
      setisDownloadingModel(false)
      getResults()
    })
  }, []);




  const clearOverlay = canvas => {
    canvas.current
      .getContext("2d")
      .clearRect(0, 0, canvas.width, canvas.height);
  };


  const getResults = () => {
    if (!photoMode && camera !== null) {
      const ticking = setInterval(async () => {
        await getFaces();
      }, 200);
      return () => {
        clearOverlay(cameraCanvas);
        clearInterval(ticking);
      };
    } else {
      return clearOverlay(cameraCanvas);
    }
  }


  const getFaces = async () => {
    if (camera.current !== null) {
      const faces = await detectFaces(camera.current.video);
      var src = camera.current.getScreenshot();
      var results = await drawResults(
        camera.current.video,
        cameraCanvas.current,
        faces,
        "boxLandmarks",
        src,
        facecanvas,
        model
      )
      // console.log(results,"resulst")
      if (results !== undefined) {

        if (results[0] == 1) {
          setoutput("angry")
        }
        else if (results[1] == 1) {
          setoutput("disgusted")
        }
        else if (results[2] == 1) {
          setoutput("afraid")
        }
        else if (results[3] == 1) {
          setoutput("happy")
        }
        else if (results[4] == 1) {
          setoutput("sad")
        }
        else if (results[5] == 1) {
          setoutput("surprised")
        }
        else if (results[6] == 1) {
          setoutput("neutral")
        }
      }

      // setInput(inputs)

      setResult(faces);
      // console.log(faces,"faces")
    }
  };
  var model = null
  var modelLastUpdated = null;
  const aspectRatio=window.innerWidth/window.innerHeight

const getExpression=()=>{
  setexpression(output)
  if(camera){
  var src = camera.current.getScreenshot();
}
  setvideo(false)
  setcurrent(src)


}

const reCapture=()=>{
  setvideo(true)
}



  const loadmodel = async () => {
    console.log(window.innerWidth,"innnnnnnner")
    if ('indexedDB' in window) {
      try {
        model = await tf.loadLayersModel('indexeddb://' + INDEXEDDB_KEY);

      }
      catch(e){
        console.log(e)
        model = await tf.loadLayersModel(MODEL_PATH);
         model.save('indexeddb://' + INDEXEDDB_KEY)
      
      }
    }
    // If no IndexedDB, then just download like normal.
    else {
    console.warn('IndexedDB not supported.');
    model = await tf.loadLayersModel(MODEL_PATH);
    }
setmodelLoaded(true)
console.log("model loaded")
 }



  const camera = useRef();
  const cameraCanvas = useRef();
  const facecanvas = useRef()
  const [result, setResult] = useState([]);
  const [isDownloadingModel, setisDownloadingModel] = useState(true)
  const [modelLoaded, setmodelLoaded] = useState(false)
  const [output, setoutput] = useState("")
  const [expression,setexpression] = useState("")
  const [current,setcurrent] = useState(null)
  const [video,setvideo]=useState(true)


  return (


    <div>
      {isDownloadingModel && <div style={{ textAlign: "center", marginTop: "30vh" }}>
        <img src={loading} />
        <h2 style={{ color: "#007c6c" }}>Downloading Model</h2>

      </div>}

      {!isDownloadingModel && <div className="body">

        <div className="titleDiv">
        
<div style={{marginLeft:"10px",marginTop:"1vh"}}>
            <h4 style={{fontSize:"4vh"}}>Facial Emotion Detector</h4>

    
         <div style={{display:"flex",flexDirection:"row"}}>
              <a className="nostyle" href="https://cs230.stanford.edu/">Deep learning model</a> 
        <p className="nostyle"> &nbsp;by&nbsp; </p>
            <a className="nostyle" href="https://github.com/amilkh/cs230-fer">Stanford University</a>
          
            </div>

            <div style={{display:"flex",flexDirection:"row"}}>
              <a className="nostyle" href="#">Web app</a> 
              <p className="nostyle"> &nbsp;by&nbsp; </p>
            <a className="nostyle" href="https://se.neduet.edu.pk/">NED University</a>
            </div>
            </div>
          
            
          

        

        </div>
        <canvas style={{ position: "absolute", top: 0, right: 0 }} ref={facecanvas}></canvas>


        <div className="camera" align="center">
          <div id="cam_input">
            <div style={{display:video ? "block" :"none"}}>
            <Camera camera={camera} cameraCanvas={cameraCanvas} />
            </div>
            {!video && <img className="camera" src={current}/>}
          </div>
          {video && <button style={{width:aspectRatio>1 ? "80%" : "33vh"}} className="detect" onClick={()=>getExpression()}>Detect My Emotion</button>}
          {!video && <button style={{width:aspectRatio>1 ? "80%" : "33vh"}} className="detect" onClick={()=>reCapture()}>Capture Again</button>}
        </div>




        <div className="footer">
          {expression !== "" && <h3>I think you look {expression}.</h3>}

        </div>
        {/* <h1>Bilal Khan</h1> */}


      </div>}
    </div>

  );

}

export default App;
