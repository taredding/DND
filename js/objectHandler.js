var loader = new THREE.OBJLoader();
var materialLoader = new THREE.MTLLoader();
var textureLoader = new THREE.TextureLoader();
//materialLoader.setBaseURL("http://127.0.0.1/DND/");
var modelInstances = [];
var textures = [];
var modelPromises = [];


function loadModel(modelName, name, textureName) {
  var prom = new Promise(function(resolve, reject) {
    var map = null;
    for (var i = 0; i < textures.length; i++) {
      if (textures[i].name == "placeholder.png") {
        map = textures[i];
        break;
      }
    }
    if (map == null) {
      map = textureLoader.load('./textures/placeholder.png');
      map.name = "placeholder.png";
      textures.push(map);
    }
    var material = new THREE.MeshPhongMaterial({map: map});
    loader.load( './models/panel2.obj', function ( object ) {
      object.scale.set(SCALE, SCALE, SCALE);
      // For any meshes in the model, add our material.
      object.traverse( function ( node ) {

        if ( node.isMesh ) node.material = material;

      } );
      object.name = "panel2";
      resolve(object);
    },
    function(stat){},
    function (error){
      console.log(error);
      reject(error);
    }
    );
  });
  modelPromises.push({name: "panel2", promise: prom});
  return prom;
}

function createModelInstance(modelName, name) {
  var prom = new Promise(function(resolve, reject) {
    var found = false;
    for (var i = 0; i < modelPromises.length; i++) {
      if (modelPromises[i].name == "panel2") {
        found = true;
        modelPromises[i].promise.then(function (object) {
          var inst = object.clone();
          modelInstances.push(inst);
          scene.add(inst);
          resolve(inst);
        }, function (error){
          reject(error);
        });
        break;
      }
    }
    if (!found) {
      loadModel(modelName, name).then(function (object) {
          var inst = object.clone();
          modelInstances.push(inst);
          scene.add(inst);
          resolve(inst);
        }, function (error){
          reject(error);
        });;
    }
  });
  return prom;
}
