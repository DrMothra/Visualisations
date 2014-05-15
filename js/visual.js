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

function addAxes(scene) {
    //Create axes
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

function generateLabel(name, position) {
    var fontface = "Arial";
    var fontSize = 18;
    var spacing = 10;

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var metrics = context.measureText( name );
    var textWidth = metrics.width;

    //DEBUG
    console.log("Width=", textWidth);

    canvas.width = textWidth + (spacing * 2);
    canvas.width *= 2;
    canvas.height = fontSize + (spacing * 2);
    context.textAlign = "center";
    context.textBaseline = "middle";

    //DEBUG
    console.log("Canvas=", canvas.width, canvas.height);

    context.fillStyle = "rgba(255, 255, 255, 0.0)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'White';
    context.font = fontSize + "px " + fontface;

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
    var scaleX = 20;
    var scaleY = 15;
    sprite.scale.set(scaleX, scaleY, 1);
    sprite.position.set(position.x, position.y, 0);

    return sprite;
}

function generateData(data) {
    //Create node geometry
    var sphereGeometry = new THREE.SphereGeometry(1,20,20);
    var material = new THREE.MeshPhongMaterial({color: 0x7777ff});

    var nodes = [];
    for(var i=0; i<data.length; ++i) {
        nodes.push(new THREE.Mesh(sphereGeometry,material));
        nodes[i].position.x = data[i].embed - 75;
        nodes[i].position.y = data[i].recip - 50;
        nodes[i].position.z = 0;
        scene.add(nodes[i]);
        generateLabel(data[i].projectName, nodes[i].position);
    }
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
        try {
            data = JSON.parse(evt.target.result);
            generateData(data);
        }
        catch (err) {
            console.log('error parsing JSON state: '+(err.message ? err.message : err));
            alert('Sorry, there was a problem reading that file');
        }
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

function alertContents(request) {
    if(request.readyState == 4) {
        console.log("Received request");
        if(request.status == 200 || request.status == 0) {
            console.log("Request = ", request.responseText);
        }
    }
}
//Only executed our code once the DOM is ready.
$(document).ready(function() {

    //GUI callbacks
    //$("#selectFile").on("change", onSelectFile);
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        alertContents(request);
    };
    request.open("GET", "test.json", true);
    request.send(null);

    var controls = new function() {
        this.loadfile = function() {
            console.log("Pressed loadfile");
            console.log("Pressed loadfile");
        };
        this.filename = 'enter file';
    };

    var gui = new dat.GUI();
    gui.add(controls, 'filename');
    gui.add(controls, 'loadfile');

    //Initialise app
    var container = document.getElementById("WebGL-output");
    var app = new VisApp();
    app.init(container);
    app.createScene();
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
