var worldGrid;


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
  for (var i = 0; i < 100; i++) {
    worldGrid[i][2][2].addFloor();
  }
}

function Cell(x, y, z) {
  this.position = {};
  this.position.x = x * SCALE * 2;
  this.position.y = y * SCALE * 2;
  this.position.z = z * SCALE * 2;

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
    createModelInstance("panel2.obj", "panel2").then(function (model) {
    _this.models.push(model);
    model.position.set(_this.position.x, _this.position.y, _this.position.z);
  });
  }
  //this.addFloor();
}


function main() {

  init();
  animate();
  initWorldGrid();
}
