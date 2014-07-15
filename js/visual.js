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
    var r = [];
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

function populatePanel(data) {
    //Fill in node panel details and display
    var element = $('#nodePanel');
    element.show();
    element.css('top', '150px');
    var left = (window.innerWidth/2) - 100;
    element.css('left', left + 'px');

    for(var key in data) {
        var item = document.getElementById(key);
        if (item) {
            item.innerHTML = data[key];
        }
    }

    //Set up links
    var video = $('#Video');
    if(video) {
        var link = video[0].innerHTML;
        if(link) {
            video[0].innerHTML = '<a href="'+link+'"'+'target="_blank"'+'>Click for video</a>';
        }
    }

    var source = $('#Source');
    if(source) {
        var link = source[0].innerHTML;
        if(link) {
            source[0].innerHTML = '<a href="'+link+'"'+'target="_blank"'+'>Click for source</a>';
        }
    }
}

//Init this app from base
function VisApp() {
    BaseApp.call(this);
}

VisApp.prototype = new BaseApp();

//Render states and styles
var RENDER_NORMAL= 0, RENDER_STYLE=1;
var RENDER_CULL= 0, RENDER_COLOUR= 1, RENDER_TRANSPARENT=2;

VisApp.prototype.init = function(container) {
    BaseApp.prototype.init.call(this, container);
    this.data = null;
    this.updateRequired = false;
    this.nodesRendered = 0;
    this.spritesRendered = 0;
    this.nodesInSlider = 0;
    this.guiControls = null;
    this.dataFile = null;
    this.filename = "";
    //Always have appearance and data folders to gui
    this.guiAppear = null;
    this.guiData = null;
    //Time slider
    this.sliderPos = 0;
    //Rendering style
    this.renderStyle = RENDER_CULL;
    this.outlineNodeName = null;
    //Camera recording
    this.camPos = [];
    this.currentCamPos = -1;
};

VisApp.prototype.update = function() {
    //Perform any updates
    var clicked = this.mouse.clicked;

    BaseApp.prototype.update.call(this);

    //Update time slider
    var slider = this.scene.getObjectByName('groupSlider');
    if(slider)
    {
        if(this.data) {
            if (this.updateRequired) {
                //Set slider position
                if(this.sliderEnabled) {
                    var pos = (this.guiControls.Year - this.yearMin) / (this.yearMax - this.yearMin) * this.GROUND_DEPTH - this.GROUND_DEPTH / 2;
                    slider.position.z = pos;
                    //Alter slider width accordingly
                    var box = this.scene.getObjectByName('timeSlider', true);
                    if(box) {
                        box.scale.z = this.GROUND_DEPTH/(this.yearMax-this.yearMin) * this.guiControls.Selection;
                    }
                } else {
                    slider.position.z = 0;
                }
                //Update GUI
                this.reDraw();
                this.updateInfoPanel(this.guiControls.Year, this.guiControls.Selection, this.nodesInSlider);
                this.updateRequired = false;
            }
        }
    }

    //Object selection


    if(this.pickedObjects.length > 0) {
        //DEBUG
        //console.log("Picked ", this.pickedObjects.length, "objects");
        //Show node info if selected
        var showingNode = false;
        for(var hit=0; hit<this.pickedObjects.length; ++hit) {
            var node = this.pickedObjects[hit].object.name;
            if(node.indexOf('Node') >= 0) {
                //Remove 'node'
                var name = node.substr(5, node.length-5);
                var data = this.getDataItem(name);
                if(data) {
                    populatePanel(data);
                    showingNode = true;
                    //Draw outline around node
                    this.outlineNode(node);
                    break;
                }
            }
        }
        if(!showingNode) {
            $("#nodePanel").hide();
            this.outlineNode(false);
        }
        this.pickedObjects.length = 0;
    } else {
        if(clicked) {
            $("#nodePanel").hide();
            this.outlineNode(false);
        }
    }
};

VisApp.prototype.createScene = function() {
    //Init base createsScene
    BaseApp.prototype.createScene.call(this);
    this.axesGroup = new THREE.Object3D();
    this.axesGroup.name = "groupSlider";
    addAxes(this.axesGroup);
    this.GROUND_DEPTH = 240;
    this.GROUND_WIDTH = 180;
    addGroundPlane(this.scene, this.GROUND_WIDTH, this.GROUND_DEPTH);
    this.SLIDER_WIDTH = 150;
    this.SLIDER_HEIGHT = 120;
    this.SLIDER_DEPTH = 10;
    addTimeSlider(this.axesGroup, this.SLIDER_WIDTH, this.SLIDER_HEIGHT, this.SLIDER_DEPTH);
    this.scene.add(this.axesGroup);
    this.sliderEnabled = true;
};

VisApp.prototype.removeNodes = function() {
    //Remove all nodes and labels
    while(this.nodesRendered--) {
        var name;
        for(var child=0; child<this.scene.children.length; ++child) {
            name = this.scene.children[child].name;
            if(name.indexOf('Node') >= 0) {
                this.scene.remove(this.scene.children[child]);
                break;
            }
        }
    }
    this.nodesRendered = 0;

    while(this.spritesRendered--) {
        var name;
        for(var child=0; child<this.scene.children.length; ++child) {
            name = this.scene.children[child].name;
            if(name.indexOf('Sprite') >= 0) {
                this.scene.remove(this.scene.children[child]);
                break;
            }
        }
    }
    this.spritesRendered = 0;
};

VisApp.prototype.outlineNode = function(name) {
    //Generate or remove highlight around given node

    //Ensure we aren't clicking same node twice
    if(this.outlineNodeName == name +'outline') return;

    //Remove any existing highlighting
    var node;
    if(this.outlineNodeName) {
        node = this.scene.getObjectByName(this.outlineNodeName);
        if(node) {
            this.scene.remove(node);
            this.outlineNodeName = null;
        }
    }

    if(name) {
        node = this.scene.getObjectByName(name);
        if (node) {
            var outlineMat = new THREE.MeshBasicMaterial({color: 0xff0000, side: THREE.BackSide});
            var outlineMesh;
            var outlineGeom;
            switch (this.guiControls.NodeStyle) {
                case 'Sphere':
                    outlineGeom = new THREE.SphereGeometry(1, 20, 20);
                    outlineMesh = new THREE.Mesh(outlineGeom, outlineMat);
                    outlineMesh.name = name + 'outline';
                    this.outlineNodeName = outlineMesh.name;
                    break;
            }
            outlineMesh.position = node.position;
            outlineMesh.scale.multiplyScalar(1.2);
            this.scene.add(outlineMesh);
        }
    }
};

VisApp.prototype.reDraw = function() {
    //Remove nodes
    this.removeNodes();

    this.generateData();
};

VisApp.prototype.createGUI = function() {
    //Create GUI - use dat.GUI for now
    this.guiControls = new function() {
        this.font = 'Arial';
        this.fontSize = 18;
        this.scaleX = 10;
        this.scaleY = 5;
        this.filename = '';
        this.ShowLabels = true;
        this.LabelTop = 'Project name';
        this.LabelBottom = '';

        //Colours
        this.Text = [255, 255, 255];
        this.Node = "#7777ff";
        this.Slider = "#5f7c9d";
        this.Ground = '#16283c';
        this.Background = '#5c5f64';
        //Render styles
        this.RenderStyle = 'Cull';
        //Node shapes
        this.NodeStyle = 'Sphere';
    };

    var gui = new dat.GUI();

    //Folders
    var main = this;
    gui.add(this.guiControls, 'filename', this.filename).listen();
    this.guiAppear = gui.addFolder("Appearance");
    var font = this.guiAppear.add(this.guiControls, 'font');
    font.onChange(function(value) {
        main.guiChanged();
    });

    var fontSize = this.guiAppear.add(this.guiControls, 'fontSize', 10, 36);
    fontSize.onChange(function(value) {
        main.guiChanged();
    });

    var scaleX = this.guiAppear.add(this.guiControls, 'scaleX', 1, 50);
    scaleX.onChange(function(value) {
        main.guiChanged();
    });

    var scaleY = this.guiAppear.add(this.guiControls, 'scaleY', 1, 50);
    scaleY.onChange(function(value) {
        main.guiChanged();
    });

    var renderStyle = this.guiAppear.add(this.guiControls, 'RenderStyle', ['Cull', 'Colour', 'Transparent']).onChange(function(value) {
        main.styleChanged(value);
    });
    renderStyle.listen();

    this.guiAppear.add(this.guiControls, 'NodeStyle', ['Sphere', 'Cube', 'Diamond']).onChange(function(value) {
        main.updateRequired = true;
    });

    this.guiAppear.addColor(this.guiControls, 'Text').onChange(function(value) {
        main.textColourChanged(value);
    });
    this.guiAppear.addColor(this.guiControls, 'Node').onChange(function(value) {
        main.nodeColourChanged(value);
    });
    this.guiAppear.addColor(this.guiControls, 'Slider').onChange(function(value) {
        main.sliderColourChanged(value);
    });
    this.guiAppear.addColor(this.guiControls, 'Ground').onChange(function(value) {
        main.groundColourChanged(value);
    });
    this.guiAppear.addColor(this.guiControls, 'Background').onChange(function(value) {
        main.backgroundColourChanged(value);
    });
    this.guiAppear.add(this.guiControls, 'ShowLabels').onChange(function(value) {
        main.labelChanged(value);
    });
    this.guiData = gui.addFolder("Data");
    this.gui = gui;
};

VisApp.prototype.guiChanged = function() {
    this.updateRequired = true;
};

VisApp.prototype.styleChanged = function(value) {
    switch (value) {
        case 'Cull':
            this.renderStyle = RENDER_CULL;
            break;
        case 'Colour':
            this.renderStyle = RENDER_COLOUR;
            break;
        case 'Transparent':
            this.renderStyle = RENDER_TRANSPARENT;
            break;
    }
    this.updateRequired = true;
};

VisApp.prototype.textColourChanged = function(value) {
    this.updateRequired = true;
};
VisApp.prototype.nodeColourChanged = function(value) {
    this.updateRequired = true;
};
VisApp.prototype.sliderColourChanged = function(value) {
    var slider = this.scene.getObjectByName('timeSlider', true);
    if(slider) {
        slider.material.color.setStyle(value);
    }
};
VisApp.prototype.groundColourChanged = function(value) {
    var ground = this.scene.getObjectByName('ground');
    if(ground) {
        ground.material.color.setStyle(value);
    }
};
VisApp.prototype.backgroundColourChanged = function(value) {
    this.renderer.setClearColor(value, 1.0);
};

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

    //Create node geometry
    var nodeGeometry;
    switch(this.guiControls.NodeStyle) {
        case 'Sphere':
            nodeGeometry = new THREE.SphereGeometry(1,20,20);
            break;

        case 'Cube':
            nodeGeometry = new THREE.CubeGeometry(2, 2, 2);
            break;

        case 'Diamond':
            nodeGeometry = new THREE.OctahedronGeometry(2);
            break;
    }

    var defaultMaterial = new THREE.MeshPhongMaterial({color: 0x7777ff});
    defaultMaterial.color.setStyle(this.guiControls.Node);
    var colourMaterial = new THREE.MeshPhongMaterial({color: 0x141414});
    var transparentMaterial = new THREE.MeshPhongMaterial({color: 0x7777ff, transparent: true, opacity: 0.1});

    var nodes = [];
    //Keep track of which nodes have been visited
    var visited = {};
    var updateRequired;
    this.nodesInSlider = 0;
    for(var i=0; i<this.data.length; ++i) {
        //Only render nodes with valid embed and recip
        var item = this.data[i];
        var embed = item["Bodily Embeddedness"];
        var recip = item["Bodily Reciprocity"];
        var year = item["Year"];
        var diff = this.guiControls.Selection/2;
        var minYear = this.guiControls.Year - diff;
        var maxYear = this.guiControls.Year + diff;
        var renderState = RENDER_NORMAL;
        var renderStyle = this.renderStyle; //RENDER_TRANSPARENT;
        //DEBUG
        //console.log("Max=", maxYear, " min=", minYear);
        if(embed >= 0 && recip >= 0) {
            //Determine how we render this node
            if(year < minYear || year > maxYear) {
                renderState = RENDER_STYLE;
            } else {
                ++this.nodesInSlider;
            }
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
            for(var key in extraData) {
                if(extraData[key] != "" && extraData[key] != item[key]) {
                    renderState = RENDER_STYLE;
                    break;
                }
            }
            if(renderState != RENDER_NORMAL && renderStyle == RENDER_CULL) continue;

            var nodeMaterial = renderState == RENDER_NORMAL ? defaultMaterial : renderStyle == RENDER_COLOUR ? colourMaterial : transparentMaterial;
            //var node = new THREE.Mesh(sphereGeometry, updateRequired ? updateRequired.material : material);
            var node = new THREE.Mesh(nodeGeometry, nodeMaterial);
            node.position.x = item["Bodily Embeddedness"] * 1.5 - 75;
            node.position.y = item["Bodily Reciprocity"] - 50;
            node.position.z = this.sliderEnabled ? (item["Year"]-this.yearMin)/(this.yearMax - this.yearMin) * this.GROUND_DEPTH - this.GROUND_DEPTH/2 : 0;
            var labelPos = new THREE.Vector3();
            labelPos.x = node.position.x;
            labelPos.y = node.position.y;
            labelPos.z = this.sliderEnabled ? node.position.z : updateRequired ? visited[embed][recip] * -5 : 0;
            //Give node a name
            node.name = 'Node ' + item["Project name"];
            ++this.nodesRendered;
            nodes.push(node);
            this.scene.add(node);
            if(this.guiControls.ShowLabels) {
                var top = this.guiControls.LabelTop == '' ? null : this.guiControls.LabelTop;
                var bottom = this.guiControls.LabelBottom == '' ? null : this.guiControls.LabelBottom;
                var colour = this.guiControls.Text;
                if(renderState != RENDER_NORMAL && renderStyle == RENDER_COLOUR) {
                    colour = [20, 20, 20];
                }
                this.generateLabels(item[top], item[bottom], labelPos, colour, nodeMaterial.opacity ? nodeMaterial.opacity : 1);
            }
        }
    }
};

VisApp.prototype.getDataItem = function(name) {
    //Get data given name
    for(var i=0; i<this.data.length; ++i) {
        var item = this.data[i];
        if(item["Project name"] === name) {
            return item;
        }
    }

    return null;
};

VisApp.prototype.generateLabels = function(topName, bottomName, position, colour, opacity) {

    var fontSize = this.guiControls.fontSize;
    var scale = new THREE.Vector3(this.guiControls.scaleX, this.guiControls.scaleY, 1);
    position.top = true;

    if(topName) {
        var labelTop = createLabel(topName, position, scale, colour, fontSize, opacity);
        //Give sprite a name
        labelTop.name = "Sprite" + this.spritesRendered++;
        this.scene.add(labelTop);
    }

    position.top = false;
    if(bottomName) {
        var labelBottom = createLabel(bottomName, position, scale, colour, fontSize, opacity);
        //Give sprite a name
        labelBottom.name = "Sprite" + this.spritesRendered++;
        this.scene.add(labelBottom);
    }
};

function createLabel(name, position, scale, colour, fontSize, opacity) {

    var fontface = "Arial";
    var spacing = 10;

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var metrics = context.measureText( name );
    var textWidth = metrics.width;

    canvas.width = textWidth + (spacing * 2);
    canvas.width *= 2;
    canvas.height = fontSize;
    context.textAlign = "center";
    context.textBaseline = "middle";

    context.fillStyle = "rgba(255, 255, 255, 0.0)";
    context.fillRect(0, 0, canvas.width, canvas.height);

    var red = Math.round(colour[0]);
    var green = Math.round(colour[1]);
    var blue = Math.round(colour[2]);

    context.fillStyle = "rgba(" + red + "," + green + "," + blue + "," + "1.0)";
    context.font = fontSize + "px " + fontface;

    context.fillText(name, canvas.width/2, canvas.height/2);

    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    //texture.needsUpdate = true;
    var align = position.top ? THREE.SpriteAlignment.bottomCenter : THREE.SpriteAlignment.topCenter;
    var spriteMaterial = new THREE.SpriteMaterial({
            //color: color,
            transparent: false,
            opacity: opacity,
            useScreenCoordinates: false,
            alignment: align,
            blending: THREE.AdditiveBlending,
            map: texture}
    );

    var sprite = new THREE.Sprite(spriteMaterial);

    sprite.scale.set(scale.x, scale.y, 1);
    sprite.position.set(position.x, position.y, position.z);

    return sprite;
}

VisApp.prototype.generateGUIControls = function() {
    //Add filename to gui
    this.guiControls.filename = this.filename;

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

    var main = this;
    this.guiControls.extra = extraGui;
    for(var label=0; label<guiLabels.length; ++label) {
        if(typeof(master[label][0]) === 'number') {
            master[label].sort();
            //Assume this is time-based data
            var max = master[label][master[label].length-1];
            var min = master[label][0];
            this.yearMax = max;
            this.yearMin =  min;
            this.guiControls.Year = (max-min)/2 + min;
            var yearChange = this.guiData.add(this.guiControls, guiLabels[label].toString(), min, max).step(1);
            yearChange.listen();
            yearChange.onChange(function(value) {
                main.updateRequired = true;
            });
            //Add slider depth info
            this.guiControls.Selection = 10;
            this.guiControls.ShowSlider = true;
            var selection = this.guiData.add(this.guiControls, 'Selection', 0, (max-min)*2).step(2);
            selection.listen();
            selection.onChange(function(value) {
                main.updateRequired = true;
            });
            var timeSlider = this.guiData.add(this.guiControls, 'ShowSlider').listen();
            timeSlider.onChange(function(value) {
                main.toggleSlider(value);
            });
        }
        else {
            //Add empty value for default
            master[label].splice(0, 0, "");
            var control = this.guiData.add(this.guiControls.extra, guiLabels[label].toString(), master[label]);
            control.onChange(function(value) {
                main.updateRequired = true;
            });
        }
    }
    //Labelling
    var displayLabels = guiLabels;
    displayLabels.splice(0, 0, '', 'Project name');
    this.guiAppear.add(this.guiControls, 'LabelTop', displayLabels).onChange(function(value) {
        main.updateRequired = true;
    });

    this.guiAppear.add(this.guiControls, 'LabelBottom', displayLabels).onChange(function(value) {
        main.updateRequired = true;
    });
};

VisApp.prototype.toggleSlider = function(slider) {
    //Toggle slider visibility
    var box = this.scene.getObjectByName("timeSlider", true);
    if(box) {
        box.visible = slider;
        this.sliderEnabled = slider;
    }
    this.updateRequired = true;
};

VisApp.prototype.parseFile = function() {
    //Attempt to load and parse given json file
    if(!this.filename) return;

    console.log("Reading file...");

    var reader = new FileReader();
    var self = this;
    reader.onload = function(evt) {
        //File loaded - parse it
        console.log('file read: '+evt.target.result);
        try {
            self.data = JSON.parse(evt.target.result);
        }
        catch (err) {
            console.log('error parsing JSON file', err);
            alert('Sorry, there was a problem reading that file');
            return;
        }
        //File parsed OK - generate GUI controls and data
        self.generateGUIControls();
        self.generateData();
        self.updateRequired = true;
    };

    // Read in the file
    reader.readAsText(this.dataFile, 'ISO-8859-1');
};

VisApp.prototype.onSelectFile = function(evt) {
    //User selected file
    //See if we support filereader API's
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        //File APIs are supported.
        var files = evt.target.files; // FileList object
        if (files.length==0) {
            console.log('no file specified');
            this.filename = "";
            return;
        }
        //Clear old data first
        if(this.dataFile) {
            this.reset();
        }
        this.dataFile = files[0];
        this.filename = this.dataFile.name;
        console.log("File chosen", this.filename);

        //Try and read this file
        this.parseFile();
    }
    else
        alert('sorry, file apis not supported');
}

VisApp.prototype.changeView = function(view) {
    //Alter cam view
    this.controls.reset();
    switch (view) {
        case FRONT:
            this.camera.position.set(0, 0, 150);
            break;
        case RIGHT:
            this.camera.position.set(200, 0, 0);
            break;
        case LEFT:
            this.camera.position.set(-200, 0, 0);
            break;
        case TOP:
            this.camera.position.set(0, 200, 0);
            break;
    }
    this.camera.lookAt(0, 0, 0);
};

VisApp.prototype.savePreset = function() {
    //Save visualisation details
    if(!this.data) return;

    var tempCamPos = new THREE.Vector3().copy(this.camera.position);
    var tempCamRot = new THREE.Quaternion().copy(this.camera.quaternion);
    var tempLookat = new THREE.Vector3().copy(this.controls.getLookAt());

    //Save slider details
    var showSlider = this.guiControls.ShowSlider;
    var sliderPos = this.guiControls.Year;
    var sliderWidth = this.guiControls.Selection;
    var renderStyle = this.guiControls.RenderStyle;

    var presetDetails = {pos : tempCamPos, rot : tempCamRot, look : tempLookat,
                         showSlider : showSlider, sliderPos : sliderPos, sliderWidth : sliderWidth, renderStyle : renderStyle};

    this.camPos.push(presetDetails);

    //Update preset value
    updatePresets(this.currentCamPos+1, this.camPos.length);
};

VisApp.prototype.gotoNextPreset = function() {
    //Go to next cam pos in list if possible
    if(this.camPos.length < 0) return;

    if(this.currentCamPos >= this.camPos.length-1) return;

    ++this.currentCamPos;
    var presetDetails = this.camPos[this.currentCamPos];

    //Camera details
    this.controls.reset();
    this.controls.setCameraRotation(presetDetails.rot);
    this.camera.position.set(presetDetails.pos.x, presetDetails.pos.y, presetDetails.pos.z);
    this.controls.setLookAt(presetDetails.look);

    //Slider details
    this.guiControls.ShowSlider = presetDetails.showSlider;
    this.toggleSlider(presetDetails.showSlider);
    this.guiControls.Year = presetDetails.sliderPos;
    this.guiControls.Selection = presetDetails.sliderWidth;
    this.guiControls.RenderStyle = presetDetails.renderStyle;
    this.styleChanged(presetDetails.renderStyle);
    this.updateRequired = true;

    //Update preset value
    updatePresets(this.currentCamPos+1, this.camPos.length);
};

VisApp.prototype.gotoPreviousPreset = function() {
    //Go to previous cam pos if possible
    if(this.camPos.length < 0) return;

    if(this.currentCamPos <= 0) {
        if(this.currentCamPos == 0 && this.camPos.length == 1) {
            this.currentCamPos = 1;
        } else {
            return;
        }
    }

    --this.currentCamPos;
    var presetDetails = this.camPos[this.currentCamPos];

    //Camera details
    this.controls.reset();
    this.controls.setCameraRotation(presetDetails.rot);
    this.camera.position.set(presetDetails.pos.x, presetDetails.pos.y, presetDetails.pos.z);
    this.controls.setLookAt(presetDetails.look);

    //Slider details
    this.guiControls.ShowSlider = presetDetails.showSlider;
    this.toggleSlider(presetDetails.showSlider);
    this.guiControls.Year = presetDetails.sliderPos;
    this.guiControls.Selection = presetDetails.sliderWidth;
    this.guiControls.RenderStyle = presetDetails.renderStyle;
    this.styleChanged(presetDetails.renderStyle);
    this.updateRequired = true;

    //Update preset value
    updatePresets(this.currentCamPos+1, this.camPos.length);
};

function updatePresets(preset, total) {
    if(preset < 1) preset = '*';
    document.getElementById('presetNum').innerHTML = 'Preset :  ' + preset + '/' + total;
}

VisApp.prototype.updateInfoPanel = function(year, duration, objects) {
    //Update info GUI
    document.getElementById('currentYear').innerHTML = year;
    document.getElementById('startYear').innerHTML = year - duration/2;
    document.getElementById('endYear').innerHTML = year + duration/2;
    document.getElementById('rendered').innerHTML = objects;
};

VisApp.prototype.reset = function() {
    //Reset rendering and data
    this.removeNodes();

    //Clear data
    this.data = null;
    this.dataFile = null;
    this.filename = "";

    //Clear gui controls
    this.guiControls.filename = null;
    this.guiControls = null;
    this.guiAppear = null;
    this.guiData = null;
    this.gui.destroy();
    this.renderStyle = RENDER_CULL;
    this.createGUI();
};

function addAxes(group) {
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

    group.add(axisX);
    group.add(axisY);

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
    group.add(xAxisText);
    textGeom = new THREE.TextGeometry("Recip", options);
    xAxisText = new THREE.Mesh(textGeom, material);
    xAxisText.position.x = -77.5;
    xAxisText.position.y = 52.5;
    xAxisText.position.z = 0;
    group.add(xAxisText);
}

function addGroundPlane(scene, width, height) {
    // create the ground plane
    var planeGeometry = new THREE.PlaneGeometry(width,height,1,1);
    var texture = THREE.ImageUtils.loadTexture("images/grid.png");
    var planeMaterial = new THREE.MeshLambertMaterial({map: texture, transparent: true, opacity: 0.5});
    var plane = new THREE.Mesh(planeGeometry,planeMaterial);

    //plane.receiveShadow  = true;

    // rotate and position the plane
    plane.rotation.x=-0.5*Math.PI;
    plane.position.x=0;
    plane.position.y=-60;
    plane.position.z=0;

    scene.add(plane);

    //Second plane
    planeGeometry = new THREE.PlaneGeometry(width, height, 1, 1);
    planeMaterial = new THREE.MeshLambertMaterial({color: 0x16283c});
    plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x=-0.5*Math.PI;
    plane.position.x=0;
    plane.position.y=-61;
    plane.position.z=0;
    //Give it a name
    plane.name = 'ground';

    // add the plane to the scene
    scene.add(plane);
}

function addTimeSlider(group, width, height, depth) {
    //Create time slider box
    //DEBUG - DEPTH NEEDS REWORKING
    var boxGeometry = new THREE.CubeGeometry(width, height, 1, 4, 4, 4);
    var boxMaterial = new THREE.MeshPhongMaterial({color: 0x5f7c9d, transparent: true, opacity: 0.4, depthTest: false});
    var box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.name = 'timeSlider';
    box.position.x = 0;
    box.position.y = 0;
    box.position.z = 0;

    group.add(box);
}

function readDataFile(dataFilename) {
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
        }
        catch (err) {
            console.log('error parsing JSON file', err);
            alert('Sorry, there was a problem reading that file');
            return;
        }
    };

    // Read in the file
    reader.readAsText(dataFilename);
}

//Only executed our code once the DOM is ready.
var FRONT= 0, RIGHT= 1, LEFT= 2, TOP=3;
$(document).ready(function() {
    //Initialise app
    var container = document.getElementById("WebGL-output");
    var app = new VisApp();
    app.init(container);
    app.createScene();
    app.createGUI();

    //GUI callbacks
    //document.addEventListener('mousedown', app.onMouseDown, false);

    $("#chooseFile").on("change", function(evt) {
        app.onSelectFile(evt);
    });

    $("#camFront").on("click", function(evt) {
        app.changeView(FRONT);
    });
    $("#camRight").on("click", function(evt) {
        app.changeView(RIGHT);
    });
    $("#camLeft").on("click", function(evt) {
        app.changeView(LEFT);
    });
    $("#camTop").on("click", function(evt) {
        app.changeView(TOP);
    });

    $("#presetSave").on("click", function(evt) {
        app.savePreset();
    });
    $("#presetForward").on("click", function(evt) {
        app.gotoNextPreset();
    });
    $("#presetBackward").on("click", function(evt) {
        app.gotoPreviousPreset();
    });

    $('#screen').on("click", function(event) {
        event.preventDefault();
        var can = app.renderer.domElement;
        if (can) {
            try {
                can.toBlob(function(blob) {
                    saveAs(blob, "screenShot.png");
                }, "image/png");
            } catch(e) {
                alert("Couldn't save screenshot");
            }
        }
    });

    app.run();

    //Init stats of required
    //var stats = initStats();

});
