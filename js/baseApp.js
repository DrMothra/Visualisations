/**
 * Created by atg on 14/05/2014.
 */
//Common baseline for visualisation app

function BaseApp() {
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.controls = null;
    this.container = null;
    this.projector = null;
    this.objectList = [];
    this.root = null;
    this.mouse = { x:0, y:0, clicked:false};
    this.pickedObjects = [];
    this.startTime = 0;
    this.elapsedTime = 0;
    this.clock = new THREE.Clock();
}

BaseApp.prototype.init = function(container) {
    this.container = container;
    console.log("BaseApp container =", container);
    this.createRenderer();
    console.log("BaseApp renderer =", this.renderer);
    this.createCamera();
    this.createControls();
    this.projector = new THREE.Projector();
};

BaseApp.prototype.createRenderer = function() {
    this.renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true, antialias: true});
    this.renderer.setClearColor(0x5c5f64, 1.0);
    this.renderer.shadowMapEnabled = true;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.appendChild( this.renderer.domElement );
    var _this = this;

    this.container.addEventListener('mousedown', function(event) {
        _this.mouseClicked(event);
    }, false);
    window.addEventListener('resize', function(event) {
        _this.windowResize(event);
    }, false);
};

BaseApp.prototype.mouseClicked = function(event) {
    //Update mouse state
    this.mouse.x = event.clientX;
    this.mouse.y = event.clientY;
    this.mouse.clicked = true;

    var vector = new THREE.Vector3(( event.clientX / window.innerWidth ) * 2 - 1, -( event.clientY / window.innerHeight ) * 2 + 1, 0.5);
    this.projector.unprojectVector(vector, this.camera);

    var raycaster = new THREE.Raycaster(this.camera.position, vector.sub(this.camera.position).normalize());

    this.pickedObjects.length = 0;
    this.pickedObjects = raycaster.intersectObjects(this.scene.children, true);
};

BaseApp.prototype.windowResize = function(event) {
    //Handle window resize
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( window.innerWidth , window.innerHeight );
    //console.log('Size =', )
};

BaseApp.prototype.createScene = function() {
    this.scene = new THREE.Scene();

    var ambientLight = new THREE.AmbientLight(0x383838);
    this.scene.add(ambientLight);

    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(300, 300, 300);
    spotLight.intensity = 1;
    this.scene.add(spotLight);
};

BaseApp.prototype.createCamera = function() {

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000 );
    this.camera.position.set( 0, 0, 150 );

    console.log('dom =', this.renderer.domElement);
};

BaseApp.prototype.createControls = function() {
    this.controls = new THREE.TrackballControls(this.camera, this.container);
    this.controls.rotateSpeed = 1.0;
    this.controls.zoomSpeed = 1.0;
    this.controls.panSpeed = 1.0;

    this.controls.noZoom = false;
    this.controls.noPan = false;

    this.controls.staticMoving = true;
    this.controls.dynamicDampingFactor = 0.3;

    this.controls.keys = [ 65, 83, 68 ];
};

BaseApp.prototype.update = function() {
    //Do any updates
    this.controls.update();
    this.mouse.clicked = false;
};

BaseApp.prototype.run = function() {
    this.renderer.render( this.scene, this.camera );
    var _this = this;
    this.update();
    requestAnimationFrame(function() { _this.run(); });
};