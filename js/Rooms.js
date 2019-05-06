var worldGrid;
var rooms = [];
const PANEL_MODEL_NAME = "panel2.obj";
var currentLevel = 2;
const WORLD_WIDTH = 100;
const WORLD_DEPTH = 100;
const WORLD_HEIGHT = 10;


function initWorldGrid() {
  worldGrid = [];
  for (var i = 0; i < WORLD_WIDTH; i++) {
    worldGrid.push([]);
    for (var j = 0; j < WORLD_HEIGHT; j++) {
      worldGrid[i].push([]);
      for (var k = 0; k < WORLD_DEPTH; k++) {
        worldGrid[i][j].push(new Cell(i, j, k));
      }
    }
  }
}

function Cell(x, y, z) {
  this.position = {};
  this.floors = [];
  this.walls = [];
  this.position.x = x * SCALE * 2;
  this.position.y = y * SCALE * 2 * 2.2;
  this.position.z = z * SCALE * 2;
  this.room = null;
  this.x = x;
  this.y = y;
  this.z = z;
  
  this.models = [];
  this.hide = function() {
    for (var i = 0; i < this.models.length; i++) {
      this.models[i].visible = false;
    }
  }
  this.show = function() {
    for (var i = 0; i < this.models.length; i++) {
      this.models[i].visible = true;
    }
  }
  this.addFloor = function() {
    var _this = this;
    createModelInstance(PANEL_MODEL_NAME, "placeholder.png").then(function (model) {
      _this.models.push(model);
      _this.floors.push(model);
      model.position.set(_this.position.x, _this.position.y, _this.position.z);
      this.addCellParentToModel(_this, model, "floor");
    });
  }
  
  this.addLeftWall = function() {
    var _this = this;
    createModelInstance(PANEL_MODEL_NAME, "placeholder.png").then(function (model) {
      _this.models.push(model);
      _this.walls.push(model);
      model.position.set(_this.position.x, _this.position.y, _this.position.z);
      model.rotation.z = Math.PI / 2;
      model.rotation.x = 3.0 * Math.PI / 2;
      model.position.x -= 1.15 * SCALE;
      model.position.y += 1.16 * SCALE;
      
      this.addCellParentToModel(_this, model, "wall");
      
      createModelInstance(PANEL_MODEL_NAME, "placeholder.png").then(function (model2) {
        _this.models.push(model2);
        _this.walls.push(model2);
        model2.position.set(_this.position.x, _this.position.y, _this.position.z);
        model2.rotation.z = Math.PI / 2;
        model2.rotation.x = 3.0 * Math.PI / 2;
        model2.position.x -= 1.15 * SCALE;
        model2.position.y += 3.16 * SCALE;
        
        this.addCellParentToModel(_this, model, "floor");
      });
    });
  }
  
  this.addRightWall = function() {
    var _this = this;
    createModelInstance(PANEL_MODEL_NAME, "placeholder.png").then(function (model) {
      _this.models.push(model);
      
      model.position.set(_this.position.x, _this.position.y, _this.position.z);
      model.rotation.z = Math.PI / 2;
      model.rotation.x = 0.5 * Math.PI;
      model.position.x += 1.15 * SCALE;
      model.position.y += 1.16 * SCALE;
      _this.walls.push(model);
      this.addCellParentToModel(_this, model, "wall");
      
      createModelInstance(PANEL_MODEL_NAME, "placeholder.png").then(function (model2) {
        _this.models.push(model2);
        _this.walls.push(model2);
        model2.position.set(_this.position.x, _this.position.y, _this.position.z);
        model2.rotation.z = Math.PI / 2;
        model2.rotation.x = 0.5 * Math.PI;
        model2.position.x += 1.15 * SCALE;
        model2.position.y += 3.16 * SCALE;
        
        this.addCellParentToModel(_this, model2, "floor");
      });
    });
  }
  
  this.addFrontWall = function() {
    var _this = this;
    createModelInstance(PANEL_MODEL_NAME, "placeholder.png").then(function (model) {
      _this.models.push(model);
      
      model.position.set(_this.position.x, _this.position.y, _this.position.z);
      
      model.rotation.x =  .5 * Math.PI;
      
      _this.walls.push(model);
      model.position.z -= 1.15  * SCALE;
      model.position.y += 1.16 * SCALE;
      
      this.addCellParentToModel(_this, model, "wall");
      
      createModelInstance(PANEL_MODEL_NAME, "placeholder.png").then(function (model2) {
        _this.models.push(model2);
        _this.walls.push(model2);
        model2.position.set(_this.position.x, _this.position.y, _this.position.z);

        model2.rotation.x =  .5 * Math.PI;


        model2.position.z -= 1.15  * SCALE;
        model2.position.y += 3.16 * SCALE;
        
        this.addCellParentToModel(_this, model2, "floor");
      });
    });
  }
  
  this.addBackWall = function() {
    var _this = this;
    createModelInstance(PANEL_MODEL_NAME, "placeholder.png").then(function (model) {
      _this.models.push(model);
      _this.walls.push(model);
      model.position.set(_this.position.x, _this.position.y, _this.position.z);
      
      model.rotation.x =  0.5 * Math.PI;
      model.rotation.y =  1.0 * Math.PI;
      
      model.position.z += 1.15  * SCALE;
      model.position.y += 1.16 * SCALE;
      
      this.addCellParentToModel(_this, model, "wall");
      
      createModelInstance(PANEL_MODEL_NAME, "placeholder.png").then(function (model2) {
        _this.models.push(model2);
        _this.walls.push(model2);
        model2.position.set(_this.position.x, _this.position.y, _this.position.z);

        model2.rotation.x =  0.5 * Math.PI;
        model2.rotation.y =  1.0 * Math.PI;

        model2.position.z += 1.15  * SCALE;
        model2.position.y += 3.16 * SCALE;
        
        this.addCellParentToModel(_this, model2, "floor");
      });
    });
  }

  //this.addFloor();
}

function addCellParentToModel(inst, model, type) {
  model.cell = inst;
  model.role = type;
}

function applyRoomWallTexture(room, textureName) {
  for (var j = 0; j < room.cells.length; j++) {
    var cell = room.cells[j];
    for (var i = 0; i < cell.walls.length; i++) {
      applyTexturePermanent(cell.walls[i], textureName);
    }
  }
}
function applyRoomFloorTexture(room, textureName) {
  for (var j = 0; j < room.cells.length; j++) {
    var cell = room.cells[j];
    for (var i = 0; i < cell.floors.length; i++) {
      applyTexturePermanent(cell.floors[i], textureName);
    }
  }
}

function Room(xMin, zMin, width, length, name) {
  this.xMin = xMin;
  this.zMin = zMin;
  this.level = currentLevel;
  this.width = width;
  this.length = length;
  this.name = name;
  this.cells = [];
  // for models not in a specific cell
  this.models = [];
  
  for (var i = xMin; i < xMin + width; i++) {
    for (var j = zMin; j < zMin + length; j++) {
      var cell = worldGrid[i][currentLevel][j];
      if (cell.room != null) {
        alert("Didn't add room, intersected existing room: " + cell.room.name);
        return;
      }
    }
  }
  
  for (var i = xMin; i < xMin + width; i++) {
    for (var j = zMin; j < zMin + length; j++) {
      var cell = worldGrid[i][currentLevel][j];
      if (cell.room == null) {
        cell.room = this;
        cell.addFloor();
        this.cells.push(cell);
        
        if (i == xMin) {
          cell.addLeftWall();
        }
        else if (i == xMin + width - 1) {
          cell.addRightWall();
        }
        
        if (j == zMin) {
          cell.addFrontWall();
        }
        else if (j == zMin + length - 1) {
          cell.addBackWall();
        }
        
      }
    }
  }
  
  this.hide = function(){
    this.toggleDisplay(false);
  }

  this.show = function() {
    this.toggleDisplay(true);
  }

  this.toggleDisplay = function(val) {
    for (var i = 0; i < this.cells.length; i++) {
      if (val) {
        this.cells[i].show();
      }
      else {
        this.cells[i].hide();
      }
    }
    for (var i = 0; i < this.models.length; i++) {
      this.models[i].visible = val;
    }
  }

  this.addModel = function(model) {
    this.models.push(model);
  }
  this.deleteModel = function(modelID) {
    for (var i = 0; i < this.models.length; i++) {
      if (this.models[i].uuid == modelID) {
        this.models[i].splice(i, 1);
        break;
      }
    }
  }

}

function addRoom(xMin, zMin, width, length, name) {
  if (!name) {
    name = "Room " + rooms.length;
  }
  rooms.push(new Room(xMin, zMin, width, length, name));
}

function main() {

  init();
  
  initWorldGrid();
  createCursorModel();
  addRoom(WORLD_WIDTH / 2, WORLD_DEPTH / 2, 5, 5, "Test room");
  console.log("main called");
  animate();
}

function moveLevelUp() {
  if (currentLevel < WORLD_HEIGHT - 1) {
    currentLevel++;
    resetRoomsVisibility();
  }
}
function moveLevelDown() {
  if (currentLevel > 0) {
    currentLevel--;
    resetRoomsVisibility();
  }
}

function resetRoomsVisibility() {
  for (var i = 0; i < rooms.length; i++) {
    if (rooms[i].level == currentLevel) {
      rooms[i].show();
    }
    else {
      rooms[i].hide();
    }
  }
  for (var i = 0; i < modelInstances.length; i++) {
    var m = modelInstances[i];

    if (m.level != undefined) {
      if (m.level == currentLevel) {
        m.visible = true;
      }
      else {
        m.visible = false;
      }
    }
  }
}
