/**
 * GLOBAL VARS
 */
lastTime = Date.now();
//Ahora cameras es un objeto, y cada una de las cámaras es otro objeto que tiene cam y el isCurrent
//cam es donde irá asignada la cámara creada desde Three.js
cameras = {
    default: { cam: null, isCurrent: false },
    camera2: { cam: null, isCurrent: false },
    camera3: { cam: null, isCurrent: false },
    camera4: { cam: null, isCurrent: false },
    camera5: { cam: null, isCurrent: false },
    current: { cam: null, isCurrent: false }
};
canvas = {
    element: null,
    container: null
}
labels = {}
cameraControl = null;
scene = null;
renderer = null
spotLight = null;
players = {
    p1: null,
    p2: null,
    p3: null,
    p4: null
}



collidableList = [];
powerUpList = [];
/**
 * Function to start program running a
 * WebGL Application trouhg ThreeJS
 */
let webGLStart = () => {
    initScene();
    window.onresize = onWindowResize;
    lastTime = Date.now();
    animateScene();
};

/**
 * Here we can setup all our scene noobsters
 */
function initScene() {
    //Selecting DOM Elements, the canvas and the parent element.
    canvas.container = document.querySelector("#app");
    canvas.element = canvas.container.querySelector("#appCanvas");

    /**
     * SETTING UP CORE THREEJS APP ELEMENTS (Scene, Cameras, Renderer)
     * */
    scene = new THREE.Scene();


    renderer = new THREE.WebGLRenderer({ canvas: canvas.element });
    renderer.setSize(canvas.container.clientWidth, canvas.container.clientHeight);
    renderer.setClearColor(0x20273a, 1);
    renderer.shadowMapEnabled = true;
    renderer.shadowMapType = THREE.PCFSoftShadowMap;
    canvas.container.appendChild(renderer.domElement);

    //Init player with controls
    players.p1 = new Player("P1", null, new Control(), 25, { label: true });
    players.p1.play(scene);
    players.p2 = new Player("P2", null, new Control("t", "h", "g", "f", "b", "y"), 25, { label: true });
    players.p2.play(scene);
    players.p3 = new Player("P3", null, new Control("i", "l", "k", "j", "m", "o"), 25, { label: true });
    players.p3.play(scene);
    players.p4 = new Player("P4", null, new Control("8", "6", "5", "4", "2", "9"), 25, { label: true });
    players.p4.play(scene);

    //positioning cameras
    cameras.default.cam = new THREE.PerspectiveCamera(45, canvas.container.clientWidth / canvas.container.clientHeight, 0.1, 10000);
    cameras.default.cam.position.set(0, 1550, 2800);
    cameras.default.cam.lookAt(new THREE.Vector3(0, 0, 0));

    //camera2
    cameras.camera2.cam = new THREE.PerspectiveCamera(45, canvas.container.clientWidth / canvas.container.clientHeight, 0.1, 1000);
    cameras.camera2.cam.position.set(0, 20, 100);
    cameras.camera2.cam.lookAt(players.p1.element.position);

    //Camera3
    cameras.camera3.cam = new THREE.PerspectiveCamera(45, canvas.container.clientWidth / canvas.container.clientHeight, 0.1, 1000);
    cameras.camera3.cam.position.set(new THREE.Vector3(0, 0, 0));
    cameras.camera3.cam.lookAt(players.p1.element.position);

    //Camera4
    cameras.camera4.cam = new THREE.PerspectiveCamera(45, canvas.container.clientWidth / canvas.container.clientHeight, 0.1, 1000);
    cameras.camera4.cam.position.set(0, 100, 50);
    cameras.camera4.cam.lookAt(new THREE.Vector3(0, 0, 0));

    //Camera5
    cameras.camera5.cam = new THREE.PerspectiveCamera(45, canvas.container.clientWidth / canvas.container.clientHeight, 0.1, 1000);
    cameras.camera5.cam.position.set(100, 00, 100);
    cameras.camera5.cam.lookAt(new THREE.Vector3(0, 0, 0));

    //Setting up current default camera as current camera
    cameras.current.cam = cameras.default.cam;
    cameras.default.isCurrent = true;

    //Camera control Plugin
    cameraControl = new THREE.OrbitControls(cameras.current.cam, renderer.domElement);

    lAmbiente = new THREE.AmbientLight(0xffffff);
    scene.add(lAmbiente);


    // Light following player
    spotLight = new THREE.SpotLight(0xffffff, 3, 2000, 0.8, 1, 1);
    spotLight.position.set(0, 1500, 0);
    // spotLight.lookAt(players.p1.element.position);

    // var targetObject = players.p1.element;
    // scene.add(targetObject);

    // spotLight.target = targetObject;
    spotLight.castShadow = true;

    spotLight.shadow.mapSize.width = 3000;
    spotLight.shadow.mapSize.height = 3000;

    spotLight.shadow.camera.near = 500;
    spotLight.shadow.camera.far = 4000;
    spotLight.shadow.camera.fov = 30;
    scene.add(spotLight);

    // scene.add(spotLight.target);
    // scene.add(new THREE.SpotLightHelper(spotLight, 1));

    //Piso
    //Materiales
    var material = new THREE.MeshPhongMaterial({ color: 0x8A0000, wireframe: false, map: THREE.ImageUtils.loadTexture('assets/textures/Base.jpg') });
    // material.map.wrapS = THREE.MirroredRepeatWrapping;
    // material.map.wrapT = THREE.MirroredRepeatWrapping;
    // material.map.repeat.set(3, 3);

    var geometria = new THREE.BoxGeometry(3000, 400, 3000);
    var UV = {
        bricks: [
            new THREE.Vector2(0.0,1.0),
            new THREE.Vector2(0.0,0.0),
            new THREE.Vector2(1.0,0.0),
            new THREE.Vector2(1.0,1.0)

        ],
       
    }

    //Mapeo de las texturas sobre las caras
	geometria.faceVertexUvs[0] = [];
	geometria.faceVertexUvs[0][0] = [
		UV.bricks[0],
		UV.bricks[1],
		UV.bricks[3]
	];
	geometria.faceVertexUvs[0][1] = [
		UV.bricks[1],
		UV.bricks[2],
		UV.bricks[3]
	];

    plane = new THREE.Mesh(geometria, material);
    plane.position.y = -200;
    plane.receiveShadow = true;
    scene.add(plane);
    collidableList.push(plane);

    // borde izquierdo
    var mtlBordes = new THREE.MeshPhongMaterial({ color: 0XDAA520 })
    var geoBordes = new THREE.BoxGeometry(50, 50, 3000);
    var bordes = new THREE.Mesh(geoBordes, mtlBordes);
    bordes.position.x = -1475;
    bordes.position.y = 25;
    collidableList.push(bordes);
    scene.add(bordes);

    //borde derecho
    var bordeDer = bordes.clone();
    bordeDer.position.x = 1475;
    collidableList.push(bordeDer);
    scene.add(bordeDer);

    // borde front
    var mtlBordesFB = new THREE.MeshPhongMaterial({ color: 0XDAA520 })
    var geoBordesFB = new THREE.BoxGeometry(2900, 50, 50);
    var bordesFB = new THREE.Mesh(geoBordesFB, mtlBordesFB);
    bordesFB.position.z = 1475;
    bordesFB.position.y = 25;
    collidableList.push(bordesFB);
    scene.add(bordesFB);

    //borde back
    var bordeBack = bordesFB.clone();
    bordeBack.position.z = -1475;
    collidableList.push(bordeBack);
    scene.add(bordeBack);


    var bloques = [
        [0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0],
        [0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1],
        [0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0]
    ]

    console.log(bloques);
    var inicioX = -1425;
    var inicioZ = -1425;
    for (var i = 0; i < bloques.length; i++) {
        for (var j = 0; j < bloques[i].length; j++) {
            switch (bloques[i][j]) {
                case 1:
                    var block = new THREE.Mesh(
                        new THREE.BoxGeometry(50, 50, 50),
                        new THREE.MeshPhongMaterial({ color: 0xfffce8, wireframe: false})
                    );
                    block.castShadow = true;
                    block.receiveShadow = true;
                    block.position.set(inicioX, 25, inicioZ);
                    scene.add(block);
                    collidableList.push(block);
                    inicioX += 50;
                    break;
                case 0:
                    inicioX += 50;
                    break;
                default:
                    break;
            }
        }
        inicioX = -1425;
        inicioZ += 50;
    }



    //Plataforma central
   var matPlatform = new THREE.MeshPhongMaterial({ color: 0xffeaa7, wireframe: false, });
    // Aldea.map.wrapS = THREE.MirroredRepeatWrapping;
    // Aldea.map.wrapT = THREE.MirroredRepeatWrapping;
    // Aldea.map.repeat.set(3, 3);

    var geometriaPlatform = new THREE.BoxGeometry(1500, 200, 1500, 10, 10);

    platform = new THREE.Mesh(geometriaPlatform, matPlatform);
    platform.position.z = 0;
    platform.position.y = 25;
    platform.castShadow = true;
    platform.receiveShadow = true;
    scene.add(platform);
    collidableList.push(platform);



    var powerup = new THREE.Mesh(
        new THREE.BoxGeometry(50, 50, 50),
        new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: false })
    );
    powerup.position.set(50, 25, 1000);
    powerup.name = "Velocity2X";
    scene.add(powerup);
    collidableList.push(powerup);

    var powerup2 = new THREE.Mesh(
        new THREE.BoxGeometry(50, 50, 50),
        new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: false })
    );
    powerup2.position.set(150, 25, 1000);
    powerup2.name = "Bomb+";
    scene.add(powerup2);
    collidableList.push(powerup2);
    // Big
    // Texturas
    // var textAldea2 = new THREE.TextureLoader().load('assets/textures/tablon.jpg');
    // Materiales
    // var paredes = new THREE.MeshBasicMaterial({ map: textAldea2, wireframe: false, });
    // paredes.map.wrapS = THREE.MirroredRepeatWrapping;
    // paredes.map.wrapT = THREE.MirroredRepeatWrapping;
    // paredes.map.repeat.set(2, 15);

    // var geometria2 = new THREE.BoxGeometry(1000, 9500, 1000);

    // plane2 = new THREE.Mesh(geometria2, paredes);
    // plane2.position.z = -8500;
    // plane2.position.x = -12000;
    // plane2.position.y = 0;
    // plane2.castShadow = true;
    // scene.add(plane2);

    // Big2

    // var geometria3 = new THREE.BoxGeometry(1000, 9500, 1000);

    // plane3 = new THREE.Mesh(geometria3, paredes);
    // plane3.position.z = 10500;
    // plane3.position.x = 12000;
    // plane3.position.y = 0;
    // plane3.castShadow = true;
    // scene.add(plane3);

    //paredes
    //Texturas
    // var textAldea3 = new THREE.TextureLoader().load('assets/textures/rocks.jpg');
    // Materiales
    // var pared = new THREE.MeshPhongMaterial({ map: textAldea3, wireframe: false, });
    // pared.map.wrapS = THREE.MirroredRepeatWrapping;
    // pared.map.wrapT = THREE.MirroredRepeatWrapping;
    // pared.map.repeat.set(5, 4);

    // var geometria4 = new THREE.BoxGeometry(1, 50, 100);

    // plane4 = new THREE.Mesh(geometria4, pared);
    // plane4.position.z = -50;
    // plane4.position.x = -100;
    // plane4.position.y = (geometria4.parameters.height / 2) - 4;
    // plane4.receiveShadow = true;
    // plane4.castShadow = true;
    // scene.add(plane4);

    // Pared 2
    // var geometria5 = new THREE.BoxGeometry(100, 50, 1);

    // plane5 = new THREE.Mesh(geometria5, pared);
    // plane5.position.z = -100;
    // plane5.position.x = -50 + 1;
    // plane5.position.y = (geometria4.parameters.height / 2) - 4;
    // plane5.castShadow = true;
    // scene.add(plane5);

    // pared 3
    // var geometria6 = new THREE.BoxGeometry(1, 50, 100);

    // plane6 = new THREE.Mesh(geometria6, pared);
    // plane6.position.z = 50;
    // plane6.position.x = 100;
    // plane6.position.y = (geometria6.parameters.height / 2) - 4;
    // plane6.receiveShadow = true;
    // plane6.castShadow = true;
    // scene.add(plane6);

    // Pared 4
    // var geometria7 = new THREE.BoxGeometry(100, 50, 1);

    // plane7 = new THREE.Mesh(geometria5, pared);
    // plane7.position.z = 100;
    // plane7.position.x = 50 + 1;
    // plane7.position.y = (geometria7.parameters.height / 2) - 4;
    // plane7.castShadow = true;
    // scene.add(plane7);


    // collidableList.push(plane4);
    // collidableList.push(plane5);
    // collidableList.push(plane6);
    // collidableList.push(plane7);
    //FPS monitor
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = stats.domElement.style.left = '10px';
    stats.domElement.style.zIndex = '100';
    document.body.appendChild(stats.domElement);




    // initObjects();
}

/**
 * Function to add all objects, lights (except for the ambienlight) and stuff to scene
 */
function initObjects() {
    mySound3D = new Sound(["./assets/songs/hp.mp3"], 15, scene, {
        debug: true,
        position: { x: 50, y: 0, z: 0 }
    });
    mySound3D2 = new Sound(["./assets/songs/1.mp3"], 15, scene, {
        debug: true,
        position: { x: -50, y: 0, z: 0 }
    });
    mySound3D3 = new Sound(["./assets/songs/1.mp3"], 15, scene, {
        debug: true,
        position: { x: 0, y: 0, z: 50 }
    });
    mySound3D4 = new Sound(["./assets/songs/1.mp3"], 15, scene, {
        debug: true,
        position: { x: 0, y: 0, z: -50 }
    });
}

/**
 * Function to render application over
 * and over.
 */
function animateScene() {
    requestAnimationFrame(animateScene);
    renderer.render(scene, cameras.current.cam);
    updateScene();
}

/**
 * Function to evaluate logic over and
 * over again.
 */
function updateScene() {
    lastTime = Date.now();

    //Updating camera view by control inputs
    cameraControl.update();
    //Updating FPS monitor
    stats.update();
    //Sound Update
    // mySound3D.update(players.p1.element);
    // mySound3D2.update(players.p1.element);
    // mySound3D3.update(players.p1.element);
    // mySound3D4.update(players.p1.element);

    //Player controls
    for (const player of Object.keys(players)) {
        if (players[player] != null) {
            players[player].updateControls();
            players[player].collidableBox.update(players[player]);
        }
    }




    for (const label of Object.keys(labels)) {
        labels[label].lookAt(cameras.current.cam.position);
        if (label == "p1") {
            labels[label].position.copy(players.p1.element.position);
        }
        if (label == "p2") {
            labels[label].position.copy(players.p2.element.position);
        }
    }

    // spotLight.lookAt(players.p1.element.position);

    //Acá irán las cosas que se deben ir actualizando como el lookAt de la cam o el position.

    //Si camera2.isCurrent == true, entonces el lookAt debe seguir la posición del elemento.
    if (cameras.camera2.isCurrent) {
        cameras.current.cam.lookAt(players.p1.element.position);
    }
    if (cameras.camera4.isCurrent) {
        cameras.current.cam.lookAt(players.p1.element.position);
    }


}

function onWindowResize() {
    cameras.current.cam.aspect = window.innerWidth / window.innerHeight;
    cameras.current.cam.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}