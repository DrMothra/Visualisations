/**
 * Created by atg on 14/05/2014.
 */
$(document).keydown(function(ev) {
    console.log("Key ", ev.which, " pressed");
    if(ev.which =='P'.charCodeAt(0)) {
        console.log("Camera =", camera.position, "Rot =", camera.rotation);
    }
});

//Init this app from base
function VisApp() {
    BaseApp.call(this);
}

VisApp.prototype = new BaseApp();

VisApp.prototype.init = function(container) {
    BaseApp.prototype.init.call(this, container);
    this.data = null;
    this.nodesRendered = 0;
    this.spritesRendered = 0;
    this.guiControls = null;
};

VisApp.prototype.update = function() {
    //Perform any updates
    BaseApp.prototype.update.call(this);
};

VisApp.prototype.createScene = function() {
    //Init base createsScene
    BaseApp.prototype.createScene.call(this);
    addAxes(this.scene);
};

VisApp.prototype.reDraw = function() {
    //Remove all nodes and labels
    while(this.nodesRendered--) {
        var node = this.scene.getObjectByName("Node"+this.nodesRendered);
        if(node) {
            this.scene.remove(node);
        }
    }

    while(this.spritesRendered--) {
        var label = this.scene.getObjectByName("Sprite"+this.spritesRendered);
        if(label) {
            this.scene.remove(label);
        }
    }
    this.generateData();
};

VisApp.prototype.createGUI = function() {
    //Create GUI - use dat.GUI for now
    var main = this;
    this.guiControls = new function() {
        this.font = 'Arial';
        this.fontSize = 18;
        this.scaleX = 10;
        this.scaleY = 5;
        this.filename = '';
        this.loadfile = function() {
            //Attempt to load given json file
            if(this.filename.length != 0) {
                console.log("Loading file", this.filename);
                var fileRequest = new XMLHttpRequest();
                fileRequest.onreadystatechange = function() {
                    main.parseFile(fileRequest);
                };
                fileRequest.open("GET", this.filename, true);
                fileRequest.send(null);
            }
        };
        this.reDraw = function() {
            main.reDraw();
        };
        this.year = 2014;
    };

    var gui = new dat.GUI();
    gui.add(this.guiControls, 'filename');
    gui.add(this.guiControls, 'loadfile');
    gui.add(this.guiControls, 'font');
    gui.add(this.guiControls, 'fontSize', 10, 36);
    gui.add(this.guiControls, 'scaleX', 1, 50);
    gui.add(this.guiControls, 'scaleY', 1, 50);
    gui.add(this.guiControls, 'year', 1900, 2014);
    gui.add(this.guiControls, 'reDraw');
    this.gui = gui;
};

VisApp.prototype.generateData = function() {
    //Create node geometry
    var sphereGeometry = new THREE.SphereGeometry(1,20,20);
    var material = new THREE.MeshPhongMaterial({color: 0x7777ff});

    var nodes = [];
    for(var i=0; i<this.data.length; ++i) {
        //Only render nodes with valid embed and recip
        var item = this.data[i];
        if(item["Bodily Embeddedness"] >= 0 && item["Bodily Reciprocity"] >= 0) {

            //Do any other checks
            if(item["Year"] <= this.guiControls.year) {
                var node = new THREE.Mesh(sphereGeometry, material);
                node.position.x = item["Bodily Embeddedness"] * 1.5 - 75;
                node.position.y = item["Bodily Reciprocity"] - 50;
                node.position.z = 0;
                //Give node a name
                node.name = "Node" + this.nodesRendered++;
                nodes.push(node);
                this.scene.add(node);
                this.generateLabel(item["Project name"], node.position);
            }
        }
    }
};

VisApp.prototype.generateLabel = function(name, position) {
    var fontface = "Arial";
    var spacing = 10;

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var metrics = context.measureText( name );
    var textWidth = metrics.width;

    canvas.width = textWidth + (spacing * 2);
    canvas.width *= 2;
    canvas.height = this.guiControls.fontSize;
    context.textAlign = "center";
    context.textBaseline = "middle";

    context.fillStyle = "rgba(255, 255, 255, 0.0)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'White';
    context.font = this.guiControls.fontSize + "px " + fontface;

    context.fillText(name, canvas.width/2, canvas.height/2);

    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas);
    //var texture = new THREE.ImageUtils.loadTexture("images/label.png");
    texture.needsUpdate = true;

    //texture.needsUpdate = true;
    var spriteMaterial = new THREE.SpriteMaterial({
            //color: 0xffffff,
            //transparent: false,
            useScreenCoordinates: false,
            alignment: THREE.SpriteAlignment.bottomCenter,
            map: texture}
    );

    var sprite = new THREE.Sprite(spriteMaterial);
    var scaleX = this.guiControls.scaleX;
    var scaleY = this.guiControls.scaleY;

    sprite.scale.set(scaleX, scaleY, 1);
    sprite.position.set(position.x, position.y, 0);

    //Give sprite a name
    sprite.name = "Sprite" + this.spritesRendered++;

    this.scene.add(sprite);
};

VisApp.prototype.parseFile = function(fileRequest) {
    //Attempt to load and parse given json file
    if(fileRequest.readyState == 4) {
        console.log("Received request");
        if(fileRequest.status == 200 || fileRequest.status == 0) {
            console.log("Request = ", fileRequest.responseText);
            try {
                this.data = JSON.parse(fileRequest.responseText);
                var item = this.data[0];
                this.generateData();
            }
            catch (err) {
                console.log('error parsing JSON file', err);
                alert('Sorry, there was a problem reading that file');
            }
        }
    }
};

function addAxes(scene) {
    //Create axes;
    //Set up common material
    var material = new THREE.MeshPhongMaterial({color: 0x7777ff});

    //Add graph axes
    var axisYHeight = 100;
    var axisXHeight = 150;
    var axisWidth = 1;
    var cylinderY = new THREE.CylinderGeometry(axisWidth/2, axisWidth/2, axisYHeight, 8, 8, false);
    var cylinderX = new THREE.CylinderGeometry(axisWidth/2, axisWidth/2, axisXHeight, 8, 8, false);

    var axisX = new THREE.Mesh(cylinderX, material);
    var axisY = new THREE.Mesh(cylinderY, material);

    //Orientate axes
    axisX.rotation.z = -Math.PI/2;
    axisX.position.set(0, -axisYHeight/2, 0);
    axisY.position.set(-axisXHeight/2, 0, 0);

    scene.add(axisX);
    scene.add(axisY);
}

function readDataFile() {
    //Ensure we have file selected
    if(!dataFilename) return;

    console.log("Reading file...");

    var reader = new FileReader();
    reader.onload = function(evt) {
        //File loaded - parse it
        console.log('file read: '+evt.target.result);
        var data = null;

    };

    // Read in the file
    reader.readAsText(dataFilename);
}

var dataFilename = null;
function onSelectFile(evt) {
    //User selected file
    //See if we support filereader API's
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        //File APIs are supported.

        var files = evt.target.files; // FileList object
        if (files.length==0) {
            console.log('no file specified');
            dataFilename = null;
            return;
        }
        dataFilename = files[0];
    }
    else
        alert('sorry, file apis not supported');
}

//Only executed our code once the DOM is ready.
$(document).ready(function() {

    //GUI callbacks
    //$("#selectFile").on("change", onSelectFile);


    //Initialise app
    var container = document.getElementById("WebGL-output");
    var app = new VisApp();
    app.init(container);
    app.createScene();
    app.createGUI();
    app.run();

    //Init stats of required
    //var stats = initStats();

    //Set up data
    var data = [
        { projectName: "WABI", embed: 98, recip: 98},
        { projectName: "Naked House", embed: 50, recip: 5},
        { projectName: "Polymorphic", embed: 95, recip: 50}
    ];
});
