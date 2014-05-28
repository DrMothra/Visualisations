/**
 * Created by atg on 14/05/2014.
 */

/*
function eliminateDuplicates(arr) {
    var i,
        len=arr.length,
        out=[],
        obj={};

    for (i=0;i<len;i++) {
        obj[arr[i]]=0;
    }
    for (i in obj) {
        out.push(i);
    }
    return out;
}
*/

function getDuplicates(arr) {
    //Get frequency of required members
    var dupes = [];
    for(var i=0; i<arr.length; ++i) {
        var item = arr[i];
        for(var j=0; j<arr.length; ++j) {
            if(i == j) continue;

            var currentItem = arr[j];
            if(item["Bodily Embeddedness"] == currentItem["Bodily Embeddedness"] &&
                    item["Bodily Reciprocity"] == currentItem["Bodily Reciprocity"]) {
                dupes.push(item["Bodily Embeddedness"]);
                dupes.push(item["Bodily Reciprocity"]);
            }
        }
    }

    if(dupes.length == 0) return null;

    //Convert array to object
    var frequency = {};
    for(var i=0; i<dupes.length; i+=2) {
        var key1 = dupes[i];
        var key2 = dupes[i+1];
        if(!(key1 in frequency)) {
            frequency[key1] = {};
            frequency[key1][key2] = 1;
        }
        else {
            ++(frequency[key1][key2]);
        }
    }

    return frequency;

    /*
    for(var i=0; i<freqs.length; ++i) {
        dupes.splice(i+2, 1, freqs[i]);
    }

    return dupes;
    */
    /*
    var counts = {};
    arr.forEach(function(element) {
        counts[element] = (counts[element] || 0) + 1;
    });

    //Construct array with duplicate + frequency
    var dupes = [];
    for(var key in counts) {
        if(counts[key] > 1) {
            dupes.push(parseInt(key));
            dupes.push(counts[key]);
        }
    }

    return dupes;
    */
}

function eliminateDuplicates(arr) {
    var r = new Array();
    start: for(var i = 0; i < arr.length; ++i) {
        for(var x = 0; x < r.length; ++x) {
            if(r[x]==arr[i]) {
                continue start;
            }
        }
        r[r.length] = arr[i];
    }
    return r;
}

function eliminateInvalidCells(arr) {
    //Assume invalid to be empty or undefined values
    //Assume there are NO duplicates!!!
    var out=[];

    for(var index=0; index<arr.length; ++index) {
        if(arr[index] && arr[index] != undefined) {
            out.push(arr[index]);
        }
    }

    return out;
}
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
    //Always have appearance and data folders to gui
    this.guiAppear = null;
    this.guiData = null;
};

VisApp.prototype.update = function() {
    //Perform any updates
    BaseApp.prototype.update.call(this);
};

VisApp.prototype.createScene = function() {
    //Init base createsScene
    BaseApp.prototype.createScene.call(this);
    addAxes(this.scene);
    addGroundPlane(this.scene);
};

VisApp.prototype.reDraw = function() {
    //Remove all nodes and labels
    while(this.nodesRendered--) {
        var node = this.scene.getObjectByName("Node"+this.nodesRendered);
        if(node) {
            this.scene.remove(node);
        }
    }
    this.nodesRendered = 0;

    while(this.spritesRendered--) {
        var label = this.scene.getObjectByName("Sprite"+this.spritesRendered);
        if(label) {
            this.scene.remove(label);
        }
    }
    this.spritesRendered = 0;

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
        this.LoadFile = function() {
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
        this.ReDraw = function() {
            main.reDraw();
        };
    };

    var gui = new dat.GUI();
    //Folders
    gui.add(this.guiControls, 'filename');
    gui.add(this.guiControls, 'LoadFile');
    this.guiAppear = gui.addFolder("Appearance");
    this.guiAppear.add(this.guiControls, 'font');
    this.guiAppear.add(this.guiControls, 'fontSize', 10, 36);
    this.guiAppear.add(this.guiControls, 'scaleX', 1, 50);
    this.guiAppear.add(this.guiControls, 'scaleY', 1, 50);
    this.guiData = gui.addFolder("Data");
    gui.add(this.guiControls, 'ReDraw');
    this.gui = gui;
};

function guiChanged(value) {
    console.log("Gui changed");
}

function guiChangeFinished(value) {
    console.log("Gui finished");
}

VisApp.prototype.analyseItem = function(item, updatedData) {
    //Analyse this item and adjust appearance accordingly
    var update = null;
    //See if item in updated data
    var key = item["Bodily Embeddedness"];
    if(key in updatedData) {
        var freq = updatedData[key][item["Bodily Reciprocity"]];
        if (freq != undefined) {
            update = { material: new THREE.MeshPhongMaterial({color: 0xff0000}),
                position: -freq * 10};
        }
    }
    return update;
};

VisApp.prototype.analyseData = function() {
    //Analyse data and configure accordingly
    var dupes = getDuplicates(this.data);

    return dupes;
};

VisApp.prototype.generateData = function() {
    //Analyse data first
    var updates = this.analyseData();

    var extraData = this.guiControls.extra;
    var filterValue = null, filterKey = null;
    for(var key in extraData) {
        if(extraData[key] != "") {
            filterValue = extraData[key];
            filterKey = key;
            break;
        }
    }

    //Create node geometry
    var sphereGeometry = new THREE.SphereGeometry(1,20,20);
    var material = new THREE.MeshPhongMaterial({color: 0x7777ff});

    var nodes = [];
    //Keep track of which nodes have been visited
    var visited = {};
    var updateRequired;
    for(var i=0; i<this.data.length; ++i) {
        //Only render nodes with valid embed and recip
        var item = this.data[i];
        var embed = item["Bodily Embeddedness"];
        var recip = item["Bodily Reciprocity"];
        if(embed >= 0 && recip >= 0) {
            //Examine data and adjust accordingly
            updateRequired = this.analyseItem(item, updates);
            if(updateRequired) {
                if(!(embed in visited)) {
                    visited[embed] = {};
                    visited[embed][recip] = 0;
                }
                else {
                    ++(visited[embed][recip]);
                }
            }
            //Check any filtering
            if( (filterKey && item[filterKey] == filterValue) || !filterKey ) {
                //Debug
                console.log("key =", filterKey, " value =", filterValue);

                var node = new THREE.Mesh(sphereGeometry, updateRequired ? updateRequired.material : material);
                node.position.x = item["Bodily Embeddedness"] * 1.5 - 75;
                node.position.y = item["Bodily Reciprocity"] - 50;
                node.position.z = updateRequired ? visited[embed][recip] * -10 : 0;
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
    sprite.position.set(position.x, position.y, position.z);

    //Give sprite a name
    sprite.name = "Sprite" + this.spritesRendered++;

    this.scene.add(sprite);
};

VisApp.prototype.generateGUIControls = function() {
    //Generate a gui control from each property of the input file
    var ignoreList = ["Project name", "Series Label", "Bodily Embeddedness", "Bodily Reciprocity"];

    //Get UI controls to add
    var guiLabels = Object.keys(this.data[0]);
    for(var i=0; i<ignoreList.length; ++i) {
        var index = guiLabels.indexOf(ignoreList[i]);
        if (index >= 0) {
            guiLabels.splice(index, 1);
        }
    }

    var extraGui = {};
    for(var i=0; i<guiLabels.length; ++i) {
        extraGui[guiLabels[i]] = "";
    }

    //Create master and sub arrays
    var master = new Array();
    for(var lists=0; lists<guiLabels.length; ++lists) {
        var sub = new Array();
        master.push(sub);
    }

    //Populate arrays with relevant values
    var x=0, i=0;
    var index;
    var elements = this.data.length;
    while(elements--) {
        var item = this.data[i];
        for(var key in item) {
            index = ignoreList.indexOf(key);
            if(index >=0) {
                continue;
            }
            master[x++][i] = item[key];
        }
        x=0;
        ++i;
    }
    //Eliminate duplicates
    for(var arr=0; arr<master.length; ++arr) {
        master[arr] = eliminateDuplicates(master[arr]);
        master[arr] = eliminateInvalidCells(master[arr]);
    }

    this.guiControls.extra = extraGui;
    for(var label=0; label<guiLabels.length; ++label) {
        if(typeof(master[label][0]) === 'number') {
            master[label].sort();
            this.guiData.add(this.guiControls.extra, guiLabels[label].toString(), master[label][0], master[label][master[label].length-1]);
        }
        else {
            //Add empty value for default
            master[label].splice(0, 0, "");
            this.guiData.add(this.guiControls.extra, guiLabels[label].toString(), master[label]);
        }
    }
};

VisApp.prototype.parseFile = function(fileRequest) {
    //Attempt to load and parse given json file
    if(fileRequest.readyState == 4) {
        console.log("Received request");
        if(fileRequest.status == 200 || fileRequest.status == 0) {
            console.log("Request = ", fileRequest.responseText);
            try {
                this.data = JSON.parse(fileRequest.responseText);
            }
            catch (err) {
                console.log('error parsing JSON file', err);
                alert('Sorry, there was a problem reading that file');
                return;
            }
            //File parsed OK - generate GUI controls and data
            this.generateData();
            this.generateGUIControls();
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

    //Labelling
    var options = {
        size: 2,
        height: 1,
        weight: "normal",
        font: "helvetiker",
        bevelThickness: 0.2,
        bevelSize: 0.1,
        bevelSegments: 2,
        bevelEnabled: false,
        curveSegments: 12,
        steps: 1
    };

    var textGeom = new THREE.TextGeometry("Embed", options);
    var xAxisText = new THREE.Mesh(textGeom, material);
    xAxisText.position.x = 80;
    xAxisText.position.y = -50;
    xAxisText.position.z = 0;
    scene.add(xAxisText);
    textGeom = new THREE.TextGeometry("Recip", options);
    xAxisText = new THREE.Mesh(textGeom, material);
    xAxisText.position.x = -77.5;
    xAxisText.position.y = 52.5;
    xAxisText.position.z = 0;
    scene.add(xAxisText);
}

function addGroundPlane(scene) {
    // create the ground plane
    var planeGeometry = new THREE.PlaneGeometry(180,120,1,1);
    var planeMaterial = new THREE.MeshLambertMaterial({color: 0xeaeaea});
    var plane = new THREE.Mesh(planeGeometry,planeMaterial);
    //plane.receiveShadow  = true;

    // rotate and position the plane
    plane.rotation.x=-0.5*Math.PI;
    plane.position.x=0;
    plane.position.y=-60;
    plane.position.z=0;

    // add the plane to the scene
    scene.add(plane);
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

});
