/**
 * Created by DrTone on 04/12/2014.
 */
//Visualisation framework

var NUM_ROWS = 3;
var NUM_COLS = 3;
var WIDTH = 0;
var HEIGHT = 1;
var RED=0, BLUE=1, GREEN=2;

//Init this app from base
function Test() {
    BaseApp.call(this);
}

Test.prototype = new BaseApp();

Test.prototype.init = function(container) {
    BaseApp.prototype.init.call(this, container);
    //GUI
    this.guiControls = null;
    this.gui = null;
};

Test.prototype.createScene = function() {
    //Create scene
    BaseApp.prototype.createScene.call(this);

    //Load example object
    var sphereGeom = new THREE.SphereBufferGeometry(10, 24, 24);
    var sphereMat = new THREE.MeshPhongMaterial( {color: 0xff0000} );
    var sphere = new THREE.Mesh(sphereGeom, sphereMat);
    this.scene.add(sphere);
};

Test.prototype.createGUI = function() {
    //GUI - using dat.GUI
    var _this = this;
    this.guiControls = new function() {
        this.Background = '#5c5f64';
    };

    var gui = new dat.GUI();

    //Add some folders
    this.guiAppear = gui.addFolder("Appearance");
    this.guiAppear.addColor(this.guiControls, 'Background').onChange(function(value) {
        _this.renderer.setClearColor(value, 1.0);
    });

    //this.guiData = gui.addFolder("Data");
    this.gui = gui;
};

Test.prototype.update = function() {
    //Perform any updates
    BaseApp.prototype.update.call(this);
};

$(document).ready(function() {
    //Initialise app
    var container = document.getElementById("WebGL-output");
    var app = new Test();
    app.init(container);
    app.createScene();
    app.createGUI();

    //GUI callbacks

    app.run();
});