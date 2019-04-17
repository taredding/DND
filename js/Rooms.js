var worldGrid;
var rooms = [];
const PANEL_MODEL_NAME = "panel2.obj";

function initWorldGrid() {
  worldGrid = [];
  for (var i = 0; i < 100; i++) {
    worldGrid.push([]);
    for (var j = 0; j < 10; j++) {
      worldGrid[i].push([]);
      for (var k = 0; k < 100; k++) {
        worldGrid[i][j].push(new Cell(i, j, k));
      }
    }
  }
}

function Cell(x, y, z) {
  this.position = {};
  this.position.x = x * SCALE * 2;
  this.position.y = y * SCALE * 2;
  this.position.z = z * SCALE * 2;
  this.room = null;
  this.x = x;
  this.y = y;
  this.z = z;
  
  this.models = [];
  this.hide = function() {
    for (var i = 0; i < models.length; i++) {
      models[i].visible = false;
    }
  }
  this.show = function() {
    for (var i = 0; i < models.length; i++) {
      models[i].visible = true;
    }
  }
  this.addFloor = function() {
    var _this = this;
    createModelInstance(PANEL_MODEL_NAME, "placeholder.png").then(function (model) {
      _this.models.push(model);
      _this.floor = model;
      model.position.set(_this.position.x, _this.position.y, _this.position.z);
      this.addCellParentToModel(_this, model, "floor");
    });
  }
  
  this.addLeftWall = function() {
    var _this = this;
    createModelInstance(PANEL_MODEL_NAME, "placeholder.png").then(function (model) {
      _this.models.push(model);
      
      model.position.set(_this.position.x, _this.position.y, _this.position.z);
      model.rotation.z = Math.PI / 2;
      model.rotation.x = 3.0 * Math.PI / 2;
      model.position.x -= 1.15 * SCALE;
      model.position.y += 1.16 * SCALE;
      
      this.addCellParentToModel(_this, model, "wall");
      
      createModelInstance(PANEL_MODEL_NAME, "placeholder.png").then(function (model2) {
        _this.models.push(model2);
        
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
      
      this.addCellParentToModel(_this, model, "wall");
      
      createModelInstance(PANEL_MODEL_NAME, "placeholder.png").then(function (model2) {
        _this.models.push(model2);
        
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
      
      
      model.position.z -= 1.15  * SCALE;
      model.position.y += 1.16 * SCALE;
      
      this.addCellParentToModel(_this, model, "wall");
      
      createModelInstance(PANEL_MODEL_NAME, "placeholder.png").then(function (model2) {
        _this.models.push(model2);

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
      
      model.position.set(_this.position.x, _this.position.y, _this.position.z);
      
      model.rotation.x =  0.5 * Math.PI;
      model.rotation.y =  1.0 * Math.PI;
      
      model.position.z += 1.15  * SCALE;
      model.position.y += 1.16 * SCALE;
      
      this.addCellParentToModel(_this, model, "wall");
      
      createModelInstance(PANEL_MODEL_NAME, "placeholder.png").then(function (model2) {
        _this.models.push(model2);

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

function Room(xMin, zMin, level, width, length, name) {
  this.xMin = xMin;
  this.zMin = zMin;
  this.level = level;
  this.width = width;
  this.length = length;
  this.name = name;
  this.cells = [];
  
  for (var i = xMin; i < xMin + width; i++) {
    for (var j = zMin; j < zMin + length; j++) {
      var cell = worldGrid[i][level][j];
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
  
}

function addRoom(xMin, zMin, level, width, length, name) {
  if (!name) {
    name = "Room " + rooms.length;
  }
  rooms.push(new Room(xMin, zMin, level, width, length, name));
}

function main() {

  init();
  animate();
  initWorldGrid();
  
  addRoom(0, 0, 2, 5, 5, "Test room");
}
