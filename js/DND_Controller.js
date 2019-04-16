/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 * Customized by https://github.com/taredding
 */
const SCALE = 10;
 
var keys = [];
const MAX_KEY_CODE = 222;
for (var i = 0; i < MAX_KEY_CODE; i++) {
  keys.push(true);
}
var rightMouseDown = false;
var leftMouseDown = false;
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
 
THREE.PointerLockControls = function ( camera, domElement ) {

  const TURN_SPEED = 0.02;
	var scope = this;

	this.domElement = domElement || document.body;
	this.isLocked = false;

	camera.rotation.set( 0, 0, 0 );

	var pitchObject = new THREE.Object3D();
	pitchObject.add( camera );

	var yawObject = new THREE.Object3D();
	yawObject.position.y = 10;
	yawObject.add( pitchObject );

	var PI_2 = Math.PI / 2;


	function onMouseMove( event ) {
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    
		if ( rightMouseDown ) {

      var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
      var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

      yawObject.rotation.y -= movementX * TURN_SPEED;
      pitchObject.rotation.x -= movementY * TURN_SPEED;

      pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );
    }
	}

	this.connect = function () {

		document.addEventListener( 'mousemove', onMouseMove, false );

	};

	this.getObject = function () {

		return yawObject;

	};

	this.getDirection = function () {

		// assumes the camera itself is not rotated

		var direction = new THREE.Vector3( 0, 0, - 1 );
		var rotation = new THREE.Euler( 0, 0, 0, 'YXZ' );

		return function ( v ) {

			rotation.set( pitchObject.rotation.x, yawObject.rotation.y, 0 );

			v.copy( direction ).applyEuler( rotation );

			return v;

		};

	}();

	this.connect();

};

THREE.PointerLockControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.PointerLockControls.prototype.constructor = THREE.PointerLockControls;

var camera, scene, renderer, controls;

var objects = [];

var raycaster;

var moveForward = 87; // w
var moveBackward = 83; // s
var moveLeft = 65; // a
var moveRight = 68; // d
var ascend = 69; // e
var descend = 81; // q

var moveModelForward = 73; // i
var moveModelBackward = 75; // k
var moveModelLeft = 74; // j
var moveModelRight = 76; // l
var moveModelUp = 79; // o
var moveModelDown = 85; // u

var shift = 16;
var space = 32;

var prevTime = performance.now();
var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();
var vertex = new THREE.Vector3();
var color = new THREE.Color();


var stats;
function init() {
  stats = new Stats();
  stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild( stats.dom );
  window.oncontextmenu = function ()
  {
      return false;     // cancel default menu
  }
  
  var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );


  
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xffffff );
  scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

  var light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
  light.position.set( 0.5, 1, 0.75 );
  scene.add( light );

  controls = new THREE.PointerLockControls( camera );


  scene.add( controls.getObject() );

  var onKeyDown = function ( event ) {
    //console.log(event.keyCode);
    keys[event.keyCode] = false;

  };

  var onKeyUp = function ( event ) {

    keys[event.keyCode] = true;
  
  };

  document.addEventListener( 'keydown', onKeyDown, false );
  document.addEventListener( 'keyup', onKeyUp, false );
  
  document.body.onmouseup = function (e) {
    if (e.button == 2) {
      rightMouseDown = false;
    }
    if (e.button == 0) {
      leftMouseDown = false;
    }
  }
  document.body.onmousedown = function (e) {
    if (e.button == 2) {
      rightMouseDown = true;
    }
    if (e.button == 0) {
      leftMouseDown = true;
    }
  } 


  // floor

  var floorGeometry = new THREE.PlaneBufferGeometry( 2000, 2000, 100, 100 );
  floorGeometry.rotateX( - Math.PI / 2 );

  // vertex displacement

  var position = floorGeometry.attributes.position;

  for ( var i = 0, l = position.count; i < l; i ++ ) {

    vertex.fromBufferAttribute( position, i );

    vertex.x += Math.random() * 20 - 10;
    vertex.y += Math.random() * 2;
    vertex.z += Math.random() * 20 - 10;

    position.setXYZ( i, vertex.x, vertex.y, vertex.z );

  }

  floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices

  position = floorGeometry.attributes.position;
  var colors = [];

  for ( var i = 0, l = position.count; i < l; i ++ ) {

    color.setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
    colors.push( color.r, color.g, color.b );

  }

  floorGeometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

  var floorMaterial = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } );

  var floor = new THREE.Mesh( floorGeometry, floorMaterial );
  scene.add( floor );
  
var geometry = new THREE.BoxBufferGeometry( 20, 20, 20 );

for ( var i = 0; i < 2000; i ++ ) {

var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );

object.position.x = Math.random() * 800 - 400;
     object.position.y = Math.random() * 800 - 400;
     object.position.z = Math.random() * 800 - 400;

object.rotation.x = Math.random() * 2 * Math.PI;
     object.rotation.y = Math.random() * 2 * Math.PI;
     object.rotation.z = Math.random() * 2 * Math.PI;

object.scale.x = Math.random() + 0.5;
     object.scale.y = Math.random() + 0.5;
     object.scale.z = Math.random() + 0.5;

//scene.add( object );


}
  
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  //

  window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {
  stats.begin();
  requestAnimationFrame( animate );
camera.updateMatrixWorld();
    
    if (leftMouseDown) {
      raycaster.setFromCamera( mouse, camera );
      var intersects = raycaster.intersectObjects( meshes );
      console.log("Intersections: " + intersects.length);
      if (intersects.length > 0) {
        console.log("Parent: " + intersects[0].object.parent);
        for (var i = 0; i < intersects.length; i++) {
          var object = intersects[0].object.parent;
          // ignore invisible objects
          if (object.visible) {
            highlightModel(object);
            break;
          }
        }
      }
    }
    
    var time = performance.now();
    var delta = ( time - prevTime ) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;
    velocity.y = 0;
    if (!document.hasFocus()) {
      for (var i = 0; i < keys.length; i++) {
        keys[i] = false;
      }
    }
    //velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    direction.z = Number( isKeyDown(moveBackward) ) - Number( isKeyDown(moveForward) );
    direction.x = Number( isKeyDown(moveRight)) - Number( isKeyDown(moveLeft) ) ;
    
    direction.normalize(); // this ensures consistent movements in all directions
    direction.y = Number( isKeyDown(ascend)) - Number( isKeyDown(descend) ) ;
    
    if ( isKeyDown(moveForward) || isKeyDown(moveBackward) ) velocity.z -= direction.z * 1000.0 * delta;
    if ( isKeyDown(moveLeft) || isKeyDown(moveRight) ) velocity.x -= direction.x * 1000.0 * delta;
    if ( isKeyDown(ascend) || isKeyDown(descend) ) velocity.y -= direction.y * 10000.0 * delta;
    //console.log(moveModelForward && highlightedModel != null);
    
    if (highlightedModel) {
      var zDir = Number( isKeyDown(moveModelBackward) ) - Number( isKeyDown(moveModelForward) );
      var xDir = Number( isKeyDown(moveModelRight)) - Number( isKeyDown(moveModelLeft) ) ;
      var yDir = Number( isKeyDown(moveModelDown)) - Number( isKeyDown(moveModelUp) ) ;
      
      
      highlightedModel.position.z += zDir * delta * 100.0;
      highlightedModel.position.x += xDir * delta * 100.0;
      highlightedModel.position.y += yDir * delta * 100.0;
    }

    
    if (!isKeyDown(space)) { deselectModel(); }
    

    controls.getObject().translateX( velocity.x * delta );
    controls.getObject().translateY( velocity.y * delta );
    controls.getObject().translateZ( velocity.z * delta );

    prevTime = time;

    stats.end();
  renderer.render( scene, camera );

}

function isKeyDown(code) {
  return keys[code];
}
      