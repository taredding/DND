

function setUpBoard() {
  createModelInstance("floorPanel");
}

function main() {
  setupWebGL(); // set up the webGL environment
  //loadModels(); // load in the models from tri file
  
  loadResources();
  
  setupShaders(); // setup the webGL shaders
  setUpBoard();
  renderModels(); // draw the triangles using webGL
} // end main