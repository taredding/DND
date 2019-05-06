var loader = new THREE.OBJLoader();
var materialLoader = new THREE.MTLLoader();
var textureLoader = new THREE.TextureLoader();
//materialLoader.setBaseURL("http://127.0.0.1/DND/");
var modelInstances = [];
var textures = [];
var modelPromises = [];
var meshes = [];

var cursorModel = null;

function loadModel(modelName, textureName) {
  var prom = new Promise(function(resolve, reject) {
    
    
    loader.load( './models/' + modelName, function ( object ) {
      object.scale.set(SCALE, SCALE, SCALE);
      
      if (textureName) {
        applyTexturePermanent(object, textureName);
      }
      
      
      object.name = modelName;
      object.modelName = modelName;
      scene.remove(object);
      resolve(object);
    },
    function(stat){},
    function (error){
      console.log("Error loading model " + modelName + ": " + error);
      reject(error);
    });
  });
  modelPromises.push({name: modelName, promise: prom});
  return prom;
}

function applyTexture(model, textureName) {
  var map = addTexture(textureName);
  var material = new THREE.MeshPhongMaterial({map: map});
  
  scene.remove(model);
  
  // For any meshes in the model, add our material.
  model.traverse( function ( node ) {

    if ( node.isMesh ) node.material = material;

  } );
  
  scene.add(model);
}
function applyTexturePermanent(model, textureName) {
  applyTexture(model, textureName);
  model.textureName = textureName;
}

// Adds texture if not there, or simply returns it if it is
function addTexture(textureName) {
  for (var i = 0; i < textures.length; i++) {
    if (textures[i].name == textureName) {
      return textures[i];
    }
  }
  
  var t = textureLoader.load('./textures/' + textureName);
  t.name = textureName;
  textures.push(t);
  return t;
}

function createModelInstance(modelName, textureName) {
  var prom = new Promise(function(resolve, reject) {
    var found = false;
    for (var i = 0; i < modelPromises.length; i++) {
      if (modelPromises[i].name === modelName) {
        found = true;
        modelPromises[i].promise.then(function (object) {
          var inst = object.clone();
          inst.modelName = object.modelName;
          inst.textureName = object.textureName;
          inst.name = object.name;
          modelInstances.push(inst);
          scene.add(inst);
          addMesh(inst);
          resolve(inst);
        }, function (error){
          reject(error);
        });
        break;
      }
    }
    if (!found) {
      loadModel(modelName, textureName).then(function (object) {
          var inst = object.clone();
          
          inst.modelName = modelName;
          inst.textureName = textureName;
          
          modelInstances.push(inst);
          
          addMesh(inst);
          
          scene.add(inst);
          
          
          resolve(inst);
        }, function (error){
          reject(error);
        });;
    }
  });
  return prom;
}

var highlightedModel = null;

function addMesh(model) {
  for (var i = 0; i < model.children.length; i++) {
    meshes.push(model.children[i]);
  }
}

function highlightModel(model) {
  // restore model texture
  deselectModel();
  
  highlightedModel = model;
  applyTexture(model, "highlight.png");
  
}

function deselectModel() {
  if (highlightedModel != null) {
    applyTexture(highlightedModel, highlightedModel.textureName);
  }
  highlightedModel = null;
}

function deleteObject(object) {
  //console.log("delete object called: " + object);
  if (object) {
    //console.log("delete object");
    for (var i = 0; i < meshes.length; i++) {
      if (meshes[i].parent && meshes[i].parent.uuid == object.uuid) {
        meshes.splice(i,1);
        //console.log("Mesh deleted");
        i--;
      }
    }
    for (var i = 0; i < modelInstances.length; i++) {
      if (object == modelInstances[i]) {
        modelInstances.splice(i,1);
        //console.log("model instance removed");
        break;
      }
    }
    scene.remove(object);
    if (object.cell && object.cell.room) {
      object.cell.room.remove(object.uuid);
    }

  }
}

function createCursorModel() {
  createModelInstance(PANEL_MODEL_NAME, "placeholder.png").then(function(object) {
    applyTexturePermanent(object, "blue.png");
    cursorModel = object;
    console.log("cursor model created");
  });
}

function turnOffCursorModel() {
  scene.remove(cursorModel);
}

function turnOnCursorModel() {
  scene.add(cursorModel);
}

