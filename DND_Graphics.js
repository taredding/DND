/* GLOBAL CONSTANTS AND VARIABLES */
const TIME_PER_UPDATE = Math.floor(1000.0 / 60);
/* assignment specific globals */
const GRID_WIDTH = 20;
const GRID_HEIGHT = 20;
var INPUT_TRIANGLES_URL = "http://127.0.0.1/DND/models.json"; // triangles file loc
var BASE_URL = "http://127.0.0.1/DND/";

//INPUT_TRIANGLES_URL = "https://taredding.github.io/Snake3D/models.json"; // triangles file loc
//BASE_URL = "https://taredding.github.io/Snake3D/";

var defaultEye = vec3.fromValues(0.5,0.5,-0.5); // default eye position in world space
var defaultCenter = vec3.fromValues(0.5,0.5,0.0); // default view direction in world space
var defaultUp = vec3.fromValues(0,1,0); // default view up vector
var lightAmbient = vec3.fromValues(0.75,0.75,0.75); // default light ambient emission
var lightDiffuse = vec3.fromValues(0.5,0.5,0.5); // default light diffuse emission
var lightSpecular = vec3.fromValues(0.5,0.5,0.5); // default light specular emission
var lightPosition = vec3.fromValues(0.5,0.9,-.9); // default light position
var rotateTheta = Math.PI/50; // how much to rotate models by with each key press
var Blinn_Phong = true;
/* webgl and geometry data */
var gl = null; // the all powerful gl object. It's all here folks!
var inputTriangles = []; // the triangle data as loaded from input files
var numTriangleSets = 0; // how many triangle sets in input scene
var inputEllipsoids = []; // the ellipsoid data as loaded from input files
var numEllipsoids = 0; // how many ellipsoids in the input scene
var vertexBuffers = []; // this contains vertex coordinate lists by set, in triples
var normalBuffers = []; // this contains normal component lists by set, in triples
var triSetSizes = []; // this contains the size of each triangle set
var triangleBuffers = []; // lists of indices into vertexBuffers by set, in triples
var viewDelta = -.05; // how much to displace view with each key press

/* shader parameter locations */
var vPosAttribLoc; // where to put position for vertex shader
var mMatrixULoc; // where to put model matrix for vertex shader
var pvmMatrixULoc; // where to put project model view matrix for vertex shader
var ambientULoc; // where to put ambient reflecivity for fragment shader
var diffuseULoc; // where to put diffuse reflecivity for fragment shader
var specularULoc; // where to put specular reflecivity for fragment shader
var shininessULoc; // where to put specular exponent for fragment shader
var Blinn_PhongULoc;
var muted = true;
var uvAttrib;

/* interaction variables */
var Eye = vec3.clone(defaultEye); // eye position in world space
var Center = vec3.clone(defaultCenter); // view direction in world space
var Up = vec3.clone(defaultUp); // view up vector in world space

var textures = [];
var uvBuffers = [];
var texToggleUniform;
var texToggle = false;

var alphaUniform;

var modelInstances = [];

var now,delta,then = Date.now();
var interval = 1000/30;
var counter = 0;

var lightPositionULoc;

var speedSlider = document.getElementById("speed");
var fpsIndicator = document.getElementById("fps");
var fpsIndicatorSmooth = document.getElementById("fpsSmooth");

var gameUpdateIndicator = document.getElementById("gameLogicTime");
var renderUpdateIndicator = document.getElementById("renderTime");


// set up needed view params
var lookAt = vec3.create(), viewRight = vec3.create(), temp = vec3.create(); // lookat, right & temp vectors
lookAt = vec3.normalize(lookAt,vec3.subtract(temp,Center,Eye)); // get lookat vector
viewRight = vec3.normalize(viewRight,vec3.cross(temp,lookAt,Up)); // get view right vector

// ASSIGNMENT HELPER FUNCTIONS

// get the JSON file from the passed URL
function getJSONFile(url,descr) {
    try {
        if ((typeof(url) !== "string") || (typeof(descr) !== "string"))
            throw "getJSONFile: parameter not a string";
        else {
            var httpReq = new XMLHttpRequest(); // a new http request
            httpReq.open("GET",url,false); // init the request
            httpReq.send(null); // send the request
            var startTime = Date.now();
            while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
                if ((Date.now()-startTime) > 3000)
                    break;
            } // until its loaded or we time out after three seconds
            if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE))
                throw "Unable to open "+descr+" file!";
            else
                return JSON.parse(httpReq.response); 
        } // end if good params
    } // end try    
    
    catch(e) {
        console.log(e);
        return(String.null);
    }
} // end get input json file


var wDown = false;
var aDown = false;
var sDown = false;
var dDown = false;
var shiftDown = false;
// does stuff when keys are pressed
function handleKeyDown(event) {
  if (event.getModifierState("Shift")) {
    shiftDown = true;
  }
    switch (event.code) {
        // view change
        case "KeyA": // translate view left, rotate left with shift
          aDown = true;
          break;
        case "KeyD": // translate view right, rotate right with shift
          dDown = true;
          break;
        case "KeyS": // translate view backward, rotate up with shift
          sDown = true;
          break;
        case "KeyW": // translate view forward, rotate down with shift
          wDown = true;
          break;
        
        case "KeyQ": // translate view up, rotate counterclockwise with shift
            if (event.getModifierState("Shift"))
                Up = vec3.normalize(Up,vec3.add(Up,Up,vec3.scale(temp,viewRight,-viewDelta)));
            else {
                Eye = vec3.add(Eye,Eye,vec3.scale(temp,Up,1.0));
                Center = vec3.add(Center,Center,vec3.scale(temp,Up,1.0));
            } // end if shift not pressed
            break;
        case "KeyE": // translate view down, rotate clockwise with shift
            if (event.getModifierState("Shift"))
                Up = vec3.normalize(Up,vec3.add(Up,Up,vec3.scale(temp,viewRight,1.0)));
            else {
                Eye = vec3.add(Eye,Eye,vec3.scale(temp,Up,-1.0));
                Center = vec3.add(Center,Center,vec3.scale(temp,Up,-1.0));
            } // end if shift not pressed
            break;
    } // end switch
} // end handleKeyDown

function handleKeyUp(event) {
  if (event.getModifierState("Shift")) {
    shiftDown = false;
  }
    switch (event.code) {
            
        // view change
        case "KeyA": // translate view left, rotate left with shift
          aDown = false;
          break;
        case "KeyD": // translate view right, rotate right with shift
          dDown = false;
          break;
        case "KeyS": // translate view backward, rotate up with shift
          sDown = false;
          break;
        case "KeyW": // translate view forward, rotate down with shift
          wDown = false;
          break;
    } // end switch
} // end handleKeyDown
var lastRenderTime = 0;
var lastGameUpdateTime = 0;
updaterNum = 0;
function updateTimers(gameTime, renderTime) {
  lastGameUpdateTime = 0.9 * lastGameUpdateTime + 0.1 * gameTime;
  lastRenderTime = 0.9 * lastGameUpdateTime + 0.1 * renderTime;
  updaterNum++;
  if (updaterNum % 30 == 0) {
    updaterNum = 0;
    gameUpdateIndicator.innerHTML = lastGameUpdateTime.toFixed(5);
    renderUpdateIndicator.innerHTML = lastRenderTime.toFixed(5);
  }
}
// set up the webGL environment
function setupWebGL() {
    
    // Set up keys
    document.onkeydown = handleKeyDown; // call this when key pressed
    document.onkeyup = handleKeyUp;
     // create a webgl canvas and set it up
     var webGLCanvas = document.getElementById("myWebGLCanvas"); // create a webgl canvas
     gl = webGLCanvas.getContext("webgl"); // get a webgl object from it
     try {
       if (gl == null) {
         throw "unable to create gl context -- is your browser gl ready?";
       } else {
         //gl.clearColor(0.0, 0.0, 0.0, 1.0); // use black when we clear the frame buffer
         gl.clearDepth(1.0); // use max when we clear the depth buffer
         gl.enable(gl.DEPTH_TEST); // use hidden surface removal (with zbuffering)
       }
     } // end try
     
    
    catch(e) {
      console.log(e);
    } // end catch
 
} // end setupWebGL

// read models in, load them into webgl buffers
function loadModel(model) {

    
    

    try {
        var whichSetVert; // index of vertex in current triangle set
        var whichSetTri; // index of triangle in current triangle set
        var vtxToAdd; // vtx coords to add to the coord array
        var normToAdd; // vtx normal to add to the coord array
        var triToAdd; // tri indices to add to the index array
        var maxCorner = vec3.fromValues(Number.MIN_VALUE,Number.MIN_VALUE,Number.MIN_VALUE); // bbox corner
        var minCorner = vec3.fromValues(Number.MAX_VALUE,Number.MAX_VALUE,Number.MAX_VALUE); // other corner
        var whichSet = inputTriangles.length;
        inputTriangles.push(model);
        inputTriangles[whichSet].textureNumber = whichSet;
        inputTriangles[whichSet].realTextureNumber = whichSet;
        inputTriangles[whichSet].instanceNumber = whichSet;
        
        // set up hilighting, modeling translation and rotation
        inputTriangles[whichSet].center = vec3.fromValues(0,0,0);  // center point of tri set
        inputTriangles[whichSet].on = false; // not highlighted
        inputTriangles[whichSet].translation = vec3.fromValues(0,0,0); // no translation
        inputTriangles[whichSet].xAxis = vec3.fromValues(1,0,0); // model X axis
        inputTriangles[whichSet].yAxis = vec3.fromValues(0,1,0); // model Y axis 

        // set up the vertex and normal arrays, define model center and axes
        inputTriangles[whichSet].glVertices = []; // flat coord list for webgl
        inputTriangles[whichSet].glNormals = []; // flat normal list for webgl
        
        inputTriangles[whichSet].gluvs = [];
        
        var numVerts = inputTriangles[whichSet].vertices.length; // num vertices in tri set
        for (whichSetVert=0; whichSetVert<numVerts; whichSetVert++) { // verts in set
            vtxToAdd = inputTriangles[whichSet].vertices[whichSetVert]; // get vertex to add
            normToAdd = inputTriangles[whichSet].normals[whichSetVert]; // get normal to add
            
            uvsToAdd = inputTriangles[whichSet].uvs[whichSetVert];
            
            inputTriangles[whichSet].glVertices.push(vtxToAdd[0],vtxToAdd[1],vtxToAdd[2]); // put coords in set coord list
            inputTriangles[whichSet].glNormals.push(normToAdd[0],normToAdd[1],normToAdd[2]); // put normal in set coord list
            
            inputTriangles[whichSet].gluvs.push(uvsToAdd[0], uvsToAdd[1]);
            
            vec3.max(maxCorner,maxCorner,vtxToAdd); // update world bounding box corner maxima
            vec3.min(minCorner,minCorner,vtxToAdd); // update world bounding box corner minima
            vec3.add(inputTriangles[whichSet].center,inputTriangles[whichSet].center,vtxToAdd); // add to ctr sum
        } // end for vertices in set
        vec3.scale(inputTriangles[whichSet].center,inputTriangles[whichSet].center,1/numVerts); // avg ctr sum

        // send the vertex coords and normals to webGL
        vertexBuffers[whichSet] = gl.createBuffer(); // init empty webgl set vertex coord buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[whichSet]); // activate that buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(inputTriangles[whichSet].glVertices),gl.STATIC_DRAW); // data in
        normalBuffers[whichSet] = gl.createBuffer(); // init empty webgl set normal component buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffers[whichSet]); // activate that buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(inputTriangles[whichSet].glNormals),gl.STATIC_DRAW); // data in
        
        uvBuffers.push(gl.createBuffer());
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffers[whichSet]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(inputTriangles[whichSet].gluvs), gl.STATIC_DRAW);
        
        // set up the triangle index array, adjusting indices across sets
        inputTriangles[whichSet].glTriangles = []; // flat index list for webgl
        triSetSizes[whichSet] = inputTriangles[whichSet].triangles.length; // number of tris in this set
        for (whichSetTri=0; whichSetTri<triSetSizes[whichSet]; whichSetTri++) {
            triToAdd = inputTriangles[whichSet].triangles[whichSetTri]; // get tri to add
            inputTriangles[whichSet].glTriangles.push(triToAdd[0],triToAdd[1],triToAdd[2]); // put indices in set list
        } // end for triangles in set

        // send the triangle indices to webGL
        triangleBuffers.push(gl.createBuffer()); // init empty triangle index buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffers[whichSet]); // activate that buffer
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(inputTriangles[whichSet].glTriangles),gl.STATIC_DRAW); // data in
    } // end try 
    
    catch(e) {
        console.log(e);
    } // end catch
} // end load models
function createModelInstance(name, loc) {
  if (!loc) {
    loc = vec3.fromValues(0.0, 0.0, 0.0);
  }
  var oldSet = getModelByName(name);
  var set = Object.assign({}, oldSet);
  var nextLen = modelInstances.length;
  set.instanceNumber = nextLen;
  set.translation = loc;
  set.material = Object.assign({}, oldSet.material);
  set.material.ambient = oldSet.material.ambient.slice();
  set.material.diffuse = oldSet.material.diffuse.slice();
  set.material.specular = oldSet.material.specular.slice();
  set.yAxis = vec3.fromValues(0, 1, 0);
  set.xAxis = vec3.fromValues(1, 0, 0);
  set.scaling = vec3.clone(set.scaling);
  modelInstances.push(set);
  numTriangleSets = modelInstances.length;
  return set;
}

function scaleModel(model, x, y, z) {
  vec3.set(model.scaling, x * model.scaling[0], y * model.scaling[1], z * model.scaling [2]);
}
function scaleUniform(model, val) {
  scaleModel(model, val, val, val);
}
function rotateY (model, amount) {
  var rotato = mat4.create();
  mat4.fromRotation(rotato, amount, vec3.fromValues(0, 0, 1));
  vec3.transformMat4(model.yAxis, model.yAxis, rotato);
  vec3.transformMat4(model.xAxis,model.xAxis, rotato);
}
// get the file from the passed URL
function getFile(url,descr) {
    try {
        if ((typeof(url) !== "string") || (typeof(descr) !== "string"))
            throw "getJSONFile: parameter not a string";
        else {
            var httpReq = new XMLHttpRequest(); // a new http request
            httpReq.open("GET",url,false); // init the request
            httpReq.send(null); // send the request
            var startTime = Date.now();
            while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
                if ((Date.now()-startTime) > 3000)
                    break;
            } // until its loaded or we time out after three seconds
            if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE))
                throw "Unable to open "+descr+" file!";
            else
                return httpReq.response; 
        } // end if good params
    } // end try    
    
    catch(e) {
        console.log(e);
        return(String.null);
    }
} // end get input json file

function getModelByName(name) {
  for (var i = 0; i < inputTriangles.length; i++) {
    if (name === inputTriangles[i].name) {
      return inputTriangles[i];
    }
  }
  throw new Error("Couldn't find model with name: " + name);
}


function handleImageLoad(texture, myImage) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  myImage.addEventListener('load', function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                  gl.RGBA, gl.UNSIGNED_BYTE, myImage);
    if (isPow2(myImage.width) && isPow2(myImage.height)) {
       gl.generateMipmap(gl.TEXTURE_2D);
    } else {
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  });
}

// setup the webGL shaders
function setupShaders() {
    
    // define vertex shader in essl using es6 template strings
    var vShaderCode = `
        attribute vec3 aVertexPosition; // vertex position
        attribute vec3 aVertexNormal; // vertex normal
        attribute vec2 a_uv;
        
        
        uniform mat4 umMatrix; // the model matrix
        uniform mat4 upvmMatrix; // the project view model matrix
        
        varying vec3 vWorldPos; // interpolated world position of vertex
        varying vec3 vVertexNormal; // interpolated normal for frag shader
        
        varying vec2 uv;

        void main(void) {
            
            // vertex position
            vec4 vWorldPos4 = umMatrix * vec4(aVertexPosition, 1.0);
            vWorldPos = vec3(vWorldPos4.x,vWorldPos4.y,vWorldPos4.z);
            gl_Position = upvmMatrix * vec4(aVertexPosition, 1.0);

            // vertex normal (assume no non-uniform scale)
            vec4 vWorldNormal4 = umMatrix * vec4(aVertexNormal, 0.0);
            vVertexNormal = normalize(vec3(vWorldNormal4.x,vWorldNormal4.y,vWorldNormal4.z)); 
            uv = a_uv;
        }
    `;
    
    // define fragment shader in essl using es6 template strings
    var fShaderCode = `
        precision mediump float; // set float to medium precision

        // eye location
        uniform vec3 uEyePosition; // the eye's position in world
        
        // light properties
        uniform vec3 uLightAmbient; // the light's ambient color
        uniform vec3 uLightDiffuse; // the light's diffuse color
        uniform vec3 uLightSpecular; // the light's specular color
        uniform vec3 uLightPosition; // the light's position
        uniform bool texToggle;
        uniform float alpha;
        
        // material properties
        uniform vec3 uAmbient; // the ambient reflectivity
        uniform vec3 uDiffuse; // the diffuse reflectivity
        uniform vec3 uSpecular; // the specular reflectivity
        uniform float uShininess; // the specular exponent
        uniform bool Blinn_Phong;  // Blinn_Phong x Phong toggle
        // geometry properties
        varying vec3 vWorldPos; // world xyz of fragment
        varying vec3 vVertexNormal; // normal of fragment
        uniform sampler2D u_texture;
        varying vec2 uv;
        
        
        void main(void) {
        
            // ambient term
            vec3 ambient = uAmbient*uLightAmbient; 
            
            // diffuse term
            vec3 normal = normalize(vVertexNormal); 
            vec3 light = normalize(uLightPosition - vWorldPos);
            float lambert = max(0.0,dot(normal,light));
            vec3 diffuse = uDiffuse*uLightDiffuse*lambert; // diffuse term
            
            // specular term
            vec3 eye = normalize(uEyePosition - vWorldPos);
            vec3 halfVec = normalize(light+eye);
            float ndotLight = 2.0*dot(normal, light);
            vec3 reflectVec = normalize(ndotLight*normal - light);
            float highlight = 0.0;
            if(Blinn_Phong)
           	 	highlight = pow(max(0.0,dot(normal,halfVec)),uShininess);
           	else 
           		highlight = pow(max(0.0,dot(normal,reflectVec)),uShininess);

            vec3 specular = uSpecular*uLightSpecular*highlight; // specular term
            
            // combine to output color
            vec3 colorOut = vec3(ambient + diffuse + specular);
            vec4 texColor = texture2D(u_texture, uv);
            
            //gl_FragColor = vec4(texColor.rgb * colorOut, texColor.a * alpha);
            gl_FragColor = vec4(texColor.rgb, texColor.a * alpha);
            
        }
    `;
    
    try {
        var fShader = gl.createShader(gl.FRAGMENT_SHADER); // create frag shader
        gl.shaderSource(fShader,fShaderCode); // attach code to shader
        gl.compileShader(fShader); // compile the code for gpu execution

        var vShader = gl.createShader(gl.VERTEX_SHADER); // create vertex shader
        gl.shaderSource(vShader,vShaderCode); // attach code to shader
        gl.compileShader(vShader); // compile the code for gpu execution
            
        if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) { // bad frag shader compile
            throw "error during fragment shader compile: " + gl.getShaderInfoLog(fShader);  
            gl.deleteShader(fShader);
        } else if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) { // bad vertex shader compile
            throw "error during vertex shader compile: " + gl.getShaderInfoLog(vShader);  
            gl.deleteShader(vShader);
        } else { // no compile errors
            var shaderProgram = gl.createProgram(); // create the single shader program
            gl.attachShader(shaderProgram, fShader); // put frag shader in program
            gl.attachShader(shaderProgram, vShader); // put vertex shader in program
            gl.linkProgram(shaderProgram); // link program into gl context

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) { // bad program link
                throw "error during shader program linking: " + gl.getProgramInfoLog(shaderProgram);
            } else { // no shader program link errors
                gl.useProgram(shaderProgram); // activate shader program (frag and vert)
                
                // locate and enable vertex attributes
                vPosAttribLoc = gl.getAttribLocation(shaderProgram, "aVertexPosition"); // ptr to vertex pos attrib
                gl.enableVertexAttribArray(vPosAttribLoc); // connect attrib to array
                vNormAttribLoc = gl.getAttribLocation(shaderProgram, "aVertexNormal"); // ptr to vertex normal attrib
                gl.enableVertexAttribArray(vNormAttribLoc); // connect attrib to array
                
                uvAttrib = gl.getAttribLocation(shaderProgram, "a_uv");
                gl.enableVertexAttribArray(uvAttrib);
                
                // locate vertex uniforms
                mMatrixULoc = gl.getUniformLocation(shaderProgram, "umMatrix"); // ptr to mmat
                pvmMatrixULoc = gl.getUniformLocation(shaderProgram, "upvmMatrix"); // ptr to pvmmat
                
                // locate fragment uniforms
                var eyePositionULoc = gl.getUniformLocation(shaderProgram, "uEyePosition"); // ptr to eye position
                var lightAmbientULoc = gl.getUniformLocation(shaderProgram, "uLightAmbient"); // ptr to light ambient
                var lightDiffuseULoc = gl.getUniformLocation(shaderProgram, "uLightDiffuse"); // ptr to light diffuse
                var lightSpecularULoc = gl.getUniformLocation(shaderProgram, "uLightSpecular"); // ptr to light specular
                lightPositionULoc = gl.getUniformLocation(shaderProgram, "uLightPosition"); // ptr to light position
                ambientULoc = gl.getUniformLocation(shaderProgram, "uAmbient"); // ptr to ambient
                diffuseULoc = gl.getUniformLocation(shaderProgram, "uDiffuse"); // ptr to diffuse
                specularULoc = gl.getUniformLocation(shaderProgram, "uSpecular"); // ptr to specular
                shininessULoc = gl.getUniformLocation(shaderProgram, "uShininess"); // ptr to shininess
                Blinn_PhongULoc = gl.getUniformLocation(shaderProgram, "Blinn_Phong");
                
                texToggleUniform = gl.getUniformLocation(shaderProgram, "texToggle");
                
                alphaUniform = gl.getUniformLocation(shaderProgram, "alpha");
                
                // pass global constants into fragment uniforms
                gl.uniform3fv(eyePositionULoc,Eye); // pass in the eye's position
                gl.uniform3fv(lightAmbientULoc,lightAmbient); // pass in the light's ambient emission
                gl.uniform3fv(lightDiffuseULoc,lightDiffuse); // pass in the light's diffuse emission
                gl.uniform3fv(lightSpecularULoc,lightSpecular); // pass in the light's specular emission
                gl.uniform3fv(lightPositionULoc,lightPosition); // pass in the light's position
            } // end if no shader program link errors
        } // end if no compile errors
    } // end try 
    
    catch(e) {
        console.log(e);
    } // end catch
} // end setup shaders


var lastFPS = 0;
var updateNum = 0;
function updateFPS(elapsedTime) {
  elapsedTime = elapsedTime / 1000;
  updateNum++;
  if (updateNum % 60 == 0) {
    updateNum = 0;
    var temp = 1.0 / lastFPS;
    fpsIndicatorSmooth.innerHTML = temp.toFixed(1);
  }
  var temp = 1.0/elapsedTime;
  fpsIndicator.innerHTML = temp.toFixed(1);
  lastFPS = lastFPS * 0.9 + 0.1 * elapsedTime
  
}




// render the loaded model
var startTime = Date.now();
var endTime = Date.now();
var lastUpdateTime = Date.now();
timeSinceLastUpdate = 0;
function renderModels() {
    var gUpdateTime = Date.now();
    
    timeSinceLastUpdate += Date.now() - lastUpdateTime;
    var numUpdates = timeSinceLastUpdate / TIME_PER_UPDATE;
    for (var i = 0; i < numUpdates; i++) {
      updateGame();
    }
    timeSinceLastUpdate = timeSinceLastUpdate % TIME_PER_UPDATE;
    
    lastUpdateTime = Date.now();
    gUpdateTime = Date.now() - gUpdateTime;
    var renderUpdateTime = Date.now();
    gl.uniform3fv(lightPositionULoc,lightPosition);
      // construct the model transform matrix, based on model state
      function makeModelTransform(currModel) {
          var zAxis = vec3.create(), sumRotation = mat4.create(), temp = mat4.create(), negCtr = vec3.create();

          // move the model to the origin
          mat4.fromTranslation(mMatrix,vec3.negate(negCtr,currModel.center)); 
          
          // scale
          mat4.multiply(mMatrix,mat4.fromScaling(temp,currModel.scaling),mMatrix); // S(1.2) * T(-ctr)
          
          // rotate the model to current interactive orientation
          vec3.normalize(zAxis,vec3.cross(zAxis,currModel.xAxis,currModel.yAxis)); // get the new model z axis
          mat4.set(sumRotation, // get the composite rotation
              currModel.xAxis[0], currModel.yAxis[0], zAxis[0], 0,
              currModel.xAxis[1], currModel.yAxis[1], zAxis[1], 0,
              currModel.xAxis[2], currModel.yAxis[2], zAxis[2], 0,
              0, 0,  0, 1);
          mat4.multiply(mMatrix,sumRotation,mMatrix); // R(ax) * S(1.2) * T(-ctr)
          
          // translate back to model center
          mat4.multiply(mMatrix,mat4.fromTranslation(temp,currModel.center),mMatrix); // T(ctr) * R(ax) * S(1.2) * T(-ctr)

          // translate model to current interactive orientation
          mat4.multiply(mMatrix,mat4.fromTranslation(temp,currModel.translation),mMatrix); // T(pos)*T(ctr)*R(ax)*S(1.2)*T(-ctr)
          
      } // end make model transform
      
      function renderTriangles() {
        
        // render each triangle set
        var currSet; // the tri set and its material properties
        for (var whichTriSet=0; whichTriSet<modelInstances.length; whichTriSet++) {
            var textureNumber = modelInstances[whichTriSet].textureNumber;
            var instanceNumber = whichTriSet;
            
            var thisInstance = modelInstances[whichTriSet];
            currSet = modelInstances[instanceNumber];
            if (true) {
              // make model transform, add to view project
              makeModelTransform(thisInstance);
              mat4.multiply(pvmMatrix,pvMatrix,mMatrix); // project * view * model
              gl.uniformMatrix4fv(mMatrixULoc, false, mMatrix); // pass in the m matrix
              gl.uniformMatrix4fv(pvmMatrixULoc, false, pvmMatrix); // pass in the hpvm matrix
              
              
              
              // reflectivity: feed to the fragment shader
              gl.uniform3fv(ambientULoc,currSet.material.ambient); // pass in the ambient reflectivity
              gl.uniform3fv(diffuseULoc,currSet.material.diffuse); // pass in the diffuse reflectivity
              gl.uniform3fv(specularULoc,currSet.material.specular); // pass in the specular reflectivity
              gl.uniform1f(shininessULoc,currSet.material.n); // pass in the specular exponent
              gl.uniform1i(Blinn_PhongULoc, Blinn_Phong);
              // vertex buffer: activate and feed into vertex shader
              gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[textureNumber]); // activate
              gl.vertexAttribPointer(vPosAttribLoc,3,gl.FLOAT,false,0,0); // feed
              gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffers[textureNumber]); // activate
              gl.vertexAttribPointer(vNormAttribLoc,3,gl.FLOAT,false,0,0); // feed
              
              gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffers[textureNumber]);
              gl.vertexAttribPointer(uvAttrib, 2, gl.FLOAT, false, 0, 0);
              
              gl.uniform1f(alphaUniform, currSet.material.alpha);
              
              gl.activeTexture(gl.TEXTURE0);
              gl.bindTexture(gl.TEXTURE_2D, textures[thisInstance.realTextureNumber]);
              
              gl.uniform1i(texToggleUniform, texToggle);
              // triangle buffer: activate and render
              gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,triangleBuffers[textureNumber]); // activate
              gl.drawElements(gl.TRIANGLES,3*triSetSizes[textureNumber],gl.UNSIGNED_SHORT,0); // render
            
            }

            
        } // end for each triangle set
        
      }
      
      // var hMatrix = mat4.create(); // handedness matrix
      var pMatrix = mat4.create(); // projection matrix
      var vMatrix = mat4.create(); // view matrix
      var mMatrix = mat4.create(); // model matrix
      var pvMatrix = mat4.create(); // hand * proj * view matrices
      var pvmMatrix = mat4.create(); // hand * proj * view * model matrices
      

      
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers
      
      // set up projection and view
      // mat4.fromScaling(hMatrix,vec3.fromValues(-1,1,1)); // create handedness matrix
      mat4.perspective(pMatrix,0.5*Math.PI,1,0.1,10); // create projection matrix
      mat4.lookAt(vMatrix,Eye,Center,Up); // create view matrix
      mat4.multiply(pvMatrix,pvMatrix,pMatrix); // projection
      mat4.multiply(pvMatrix,pvMatrix,vMatrix); // projection * view
      renderTriangles();
      //renderTriangles(false, true);
      //renderTriangles(true, false);
      renderUpdateTime = Date.now() - renderUpdateTime;
      endTime = Date.now();
      updateFPS((endTime - startTime));
      updateTimers(gUpdateTime, renderUpdateTime);
      startTime = endTime;
      window.requestAnimationFrame(renderModels); // set up frame render callback
    
} // end render model

function isPow2(value) {
    return (value & (value - 1)) == 0;
}

var frameNum = 0;
var slowDown = false;
function updateGame() {
  frameNum++;
  const moveSpeed = 0.05;
  const turnSpeed = 0.01;

  if (wDown) {
    var dir = vec3.create();
    vec3.subtract(dir, Eye, Center);
    dir[1] = 0.0;
    vec3.normalize(dir, dir);
    vec3.scale(dir, dir, -1.0 * moveSpeed);
    if (!shiftDown) {
      vec3.add(Eye, Eye, dir);
      vec3.add(Center, Center, dir);
    }
    else {
      vec3.add(Center, Center, vec3.fromValues(0.0, turnSpeed, 0.0));
    }
  }
  if (sDown) {
    var dir = vec3.create();
    vec3.subtract(dir, Eye, Center);
    dir[1] = 0.0;
    vec3.normalize(dir, dir);
    vec3.scale(dir, dir, moveSpeed);
    if (!shiftDown) {
      vec3.add(Eye, Eye, dir);
      vec3.add(Center, Center, dir);
    }
    else {
      vec3.subtract(Center, Center, vec3.fromValues(0.0, moveSpeed, 0.0));
    }
  }
  if (dDown) {
    var dir = vec3.create();
    vec3.subtract(dir, Eye, Center);
    
    vec3.cross(dir, dir, Up);
    dir[1] = 0.0;
    vec3.normalize(dir, dir);
    vec3.scale(dir, dir, -1.0 * moveSpeed);
    if (!shiftDown) {
      vec3.add(Eye, Eye, dir);
    }
    vec3.add(Center, Center, dir);
  }
  if (aDown) {
    var dir = vec3.create();
    vec3.subtract(dir, Eye, Center);
    
    vec3.cross(dir, dir, Up);
        dir[1] = 0.0;
    vec3.normalize(dir, dir);
    vec3.scale(dir, dir, moveSpeed);
    if (!shiftDown) {
      vec3.add(Eye, Eye, dir);
    }
    vec3.add(Center, Center, dir);
  }
  
}
 
function loadModelFromObj(url, desc) {
  var str = getFile(url, desc) + "";
  var file = str.split("\n");
  
  var model = {};
  model.name = desc;
  model.material = {"ambient": [0.5,0.5,0.5], "diffuse": [0.6,0.4,0.4], "specular": [0.3,0.3,0.3], "n": 11, "alpha": 1.0, "texture": "snakeHeadUV.png"}
  model.vertices = [];
  model.normals = [];
  model.uvs = [];
  model.triangles = [];
  model.v = [];
  model.vn = [];
  model.vt = [];
  model.texture = "royal_wall.jpg";
  model.scaling = vec3.fromValues(1.0, 1.0, 1.0);
  for (var i = 0; i < file.length; i++) {
    var nextLine = file[i].split(" ");
    
    if (nextLine[0] === "v") {
      var v = [];
      v.push(parseFloat(nextLine[1]), parseFloat(nextLine[2]), parseFloat(nextLine[3]));
      model.v.push(v);
    }
    else if(nextLine[0] === "vt") {
      var vt = [];
      vt.push(parseFloat(nextLine[1]), parseFloat(nextLine[2]));
      model.vt.push(vt);
    }
    else if(nextLine[0] === "vn") {
      var vn = [];
      vn.push(parseFloat(nextLine[1]), parseFloat(nextLine[2]), parseFloat(nextLine[3]));
      model.vn.push(vn);
    }
    else if(nextLine[0] === "f") {
      var triangles = [];
      for (var j = 1; j < 4; j++) { 
        var vals = nextLine[j].split("/");
        
        var vIndex = parseInt(vals[0]) - 1;
        var uvIndex = parseInt(vals[1]) - 1;
        var nIndex = parseInt(vals[2]) - 1;
        
        if (!vIndex || !uvIndex || !nIndex) {
          console.log("Indices: " + vIndex + " " + uvIndex + " " + nIndex);
        }
        
        if (!model.v[vIndex] || !model.vt[uvIndex] || !model.vn[nIndex]) {
          console.log("Missing something, look here: "  +"Indices: " + vIndex + " " + uvIndex + " " + nIndex + " vals: " + model.v[vIndex] + " " + model.vt[uvIndex] + " " + model.vn[nIndex]);
        }
        
        model.vertices.push(model.v[vIndex]);
        triangles.push(model.vertices.length - 1);
        model.uvs.push(model.vt[uvIndex]);
        model.normals.push(model.vn[nIndex]);
      }
      model.triangles.push(triangles);
    }
  }
  console.log(model);
  loadModel(model);
  scaleUniform(model, 0.1);
  return model;
} 
function addTexture(resourceURL) {
  var whichSet = textures.length;
  textures.push(gl.createTexture());
  gl.bindTexture(gl.TEXTURE_2D, textures[whichSet]);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 200, 0, 255]));
  var myImage = new Image();
  myImage.crossOrigin = "Anonymous";
  myImage.src = resourceURL;
  handleImageLoad(textures[whichSet], myImage);
}
function loadResources() {
  var resources = getJSONFile(BASE_URL + "resources.json", "resources");
  
  var modelInfo = resources;
  
  for (var i = 0; i < modelInfo.length; i++) {
    var nextModelInfo = modelInfo[i];
    var nextPos = inputTriangles.length;
    
    var nextModel = loadModelFromObj(BASE_URL + "models/" + nextModelInfo.model, nextModelInfo.name);
    inputTriangles[nextPos].name = nextModelInfo.name;
    inputTriangles[nextPos].material = nextModelInfo.material;
    vec3.set(inputTriangles[nextPos].center, 0.0, 0.0, 0.0);
    addTexture(BASE_URL + "textures/" + nextModelInfo.material.texture);
  }
}
