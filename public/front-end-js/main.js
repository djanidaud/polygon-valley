let sceneJSON = JSON.parse('{"house": [{"posX":"35.516265793020644","posZ":"10.31072403335115","rotY":"0"},{"posX":"30.40661107597988","posZ":"3.8771264103476315","rotY":"0"},{"posX":"11.713099743121468","posZ":"24.350965124171417","rotY":"0"},{"posX":"11.76971082740188","posZ":"30.154097682812594","rotY":"0"},{"posX":"5.780242991710846","posZ":"24.265350313990695","rotY":"0"},{"posX":"5.84625965642957","posZ":"29.690972088903916","rotY":"0"},{"posX":"29.755375572852653","posZ":"10.221500459582417","rotY":"0"},{"posX":"35.953447269914086","posZ":"16.02030174100093","rotY":"0"},{"posX":"29.902796036156122","posZ":"15.720616418082836","rotY":"0"}],"mill": [{"posX":"-12.440976476226837","posZ":"0.3177851585990368","rotY":"0"}],"farm": [{"posX":"-8.085836962057577","posZ":"12.033888263493417","rotY":"0"},{"posX":"-3.9993282143245388","posZ":"8.007634394223558","rotY":"0"},{"posX":"0.020191194345482444","posZ":"-3.987189477192885","rotY":"0"},{"posX":"-4.027752677895235","posZ":"11.999122400042898","rotY":"0"},{"posX":"-8.018323202119673","posZ":"8.036965405476776","rotY":"0"},{"posX":"-0.09353465250952553","posZ":"-8.009944000193343","rotY":"0"},{"posX":"0.02702304148645851","posZ":"8.063129829918774","rotY":"0"},{"posX":"-3.9484453584964934","posZ":"4.006200138282123","rotY":"0"},{"posX":"-3.9969153354721842","posZ":"-0.0019416586776470623","rotY":"0"},{"posX":"0","posZ":"0","rotY":"0"},{"posX":"-8.175717596018881","posZ":"-12.063877664891917","rotY":"0"},{"posX":"-8.09181176234835","posZ":"-8.081243936261956","rotY":"0"},{"posX":"-12.126546505467395","posZ":"-8.092882925912589","rotY":"0"},{"posX":"4.003103361242537","posZ":"0.05969935547086891","rotY":"0"},{"posX":"-4.00411459898084","posZ":"-4.0373087617326995","rotY":"0"},{"posX":"-4.082845496947025","posZ":"-12.008564554250636","rotY":"0"},{"posX":"-12.091268109834358","posZ":"8.117756436742493","rotY":"0"},{"posX":"-4.10192500625374","posZ":"-7.999631914490815","rotY":"0"},{"posX":"0.03931000756378733","posZ":"4.071758751788424","rotY":"0"}],"hall": [{"posX":"14.786870065969769","posZ":"0.8316655612946029","rotY":"0"}],"armyCamp": [{"posX":"-0.5093903843970438","posZ":"-30.92381506347388","rotY":"0"}],"tower": [{"posX":"5.974278452414829","posZ":"-41.43154737217394","rotY":"0"},{"posX":"38.43442160656419","posZ":"-22.41397384817087","rotY":"0"},{"posX":"37.48736727210711","posZ":"49.533209084962","rotY":"0"}],"male": [{"posX":"17.311227798461914","posZ":"7.886293888092041","rotY":"0"},{"posX":"21.024412155151367","posZ":"-16.721866607666016","rotY":"0"},{"posX":"18.709796905517578","posZ":"17.505756378173828","rotY":"0"},{"posX":"9.735464096069336","posZ":"-7.100289344787598","rotY":"0"}],"female": [{"posX":"28.908756256103516","posZ":"-13.273785591125488","rotY":"0"},{"posX":"16.209239959716797","posZ":"-12.251982688903809","rotY":"0"},{"posX":"12.410673141479492","posZ":"14.895891189575195","rotY":"0"},{"posX":"9.620071411132812","posZ":"-20.552152633666992","rotY":"0"},{"posX":"22.933650970458984","posZ":"6.0204877853393555","rotY":"0"}]}');
let matdebug;


let bTree = new BinarySearchTree();
let cross;
const agentParams = {
    radius: 0.1,
    height: 0.2,
    maxAcceleration: 40.0,
    maxSpeed: 4.0,
    collisionQueryRange: 1.5,
    pathOptimizationRange: 0.0,
    separationWeight: 1.0
};

const GROUND_LEVEL = 0.01;
const modelsPath = "/3d-models/";
const natureMetadata = ["grass", "rock", "rockCluster", "gold", "goldCluster", "bush", "bushes"];
const buildingMetadata = ["house", "mill", "farm", "hall", "armyCamp", "tower"];
const utilitiesMetadata = ["ground", "skybox", "hlPlane", "cross", "hlCircle"];
const humansMetadata = ["female", "male"];

//Audio files
const placeAudio = new Audio('sounds/place.mp3');
const leavesAudio = new Audio('sounds/leaves.mp3');
const buildingAudio = new Audio('sounds/building.mp3');

let dontCollide = []; //meshes that should not trigger collision
let configMeshes = []; //stores meshes to load to the db
let obstacles = [];
let troops = [];

let lastSelected;
let oldPosition;

let ground;
let dirLight;
let Light;
let shadowGenerator;
let canvas;
let engine;
let hlPlane;
let hlCircle;
let scene;
let parameters;
let navigationPlugin;
let navmeshdebug;
let camera;
let currentMesh;

let walkingFemale;
let idleFemale;
let idleMale;
let humans = [];
let walkingHumans = [];

window.addEventListener('DOMContentLoaded', function () {
    loadAudio();
    canvas = document.getElementById('canvas');
    engine = new BABYLON.Engine(canvas, true, {
        preserveDrawingBuffer: true,
        stencil: true,
        enableOfflineSupport: false,
    });

    BABYLON.DefaultLoadingScreen.prototype.displayLoadingUI = function () {
        if (document.getElementById("customLoadingScreenDiv")) {
            document.getElementById("customLoadingScreenDiv").style.display = "initial";
            return;
        }

        this._loadingDiv = document.createElement("div");
        this._loadingDiv.id = "customLoadingScreenDiv";
        this._loadingDiv.innerHTML = "<img src='https://media0.giphy.com/media/l31p1SkNXGz3l1nwwu/giphy.gif?cid=ecf05e47nh2mc6cds6yn43e33pzu736fqv7qvkqv35b8voyz&rid=giphy.gif' />";
        this._resizeLoadingUI();
        window.addEventListener("resize", this._resizeLoadingUI);
        document.body.appendChild(this._loadingDiv);
    };
    BABYLON.DefaultLoadingScreen.prototype.hideLoadingUI = () => document.getElementById("customLoadingScreenDiv").style.display = "none";

    scene = createScene();
    scene.debugLayer.show();

    engine.resize();
    engine.runRenderLoop(() => scene.render());

    window.addEventListener("resize", () => {
        engine.resize();
        onResize();
    });

});

function createScene() {
    let scene = setUpScene();
    camera = createCamera();

    engine.displayLoadingUI();
    setTimeout(() => {
        let dirLight = createDirLight();
        let hemLight = createHemLight();


        shadowGenerator = createShadowGenerator(dirLight);
        hlPlane = createHlPlane();
        hlCircle = createHlCircle();
        ground = createGround();
        loadCross();
        loadScene();

        setUpPopulationTab();

        navigationPlugin = new BABYLON.RecastJSPlugin();
        navigationPlugin.isBuild = false;
        matdebug = new BABYLON.StandardMaterial('matdebug', scene);
        matdebug.diffuseColor = new BABYLON.Color3(0.1, 0.2, 1);
        matdebug.alpha = 0.1;

        generateSkybox();
        generateForest(1000);
        generateBushes(30);
        generateGrassField(2000);
        generateRocks(30);
        //createShop();

        let startingPoint;
        let onPointerDown = function (evt) {
            if (evt.button !== 0) return;

            let pickInfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) {
                return mesh !== ground;
            });
            if (pickInfo.hit) {
                currentMesh = pickInfo.pickedMesh.parent ? pickInfo.pickedMesh.parent : pickInfo.pickedMesh;
                if (currentMesh.name == "Agent") currentMesh = currentMesh.getChildren()[0];

                onMeshSelect();

                if (isMovable(currentMesh)) {
                    startingPoint = getGroundPosition(evt);

                    if (startingPoint) setTimeout(function () {
                        camera.detachControl(canvas);
                    }, 0);
                }
                if (currentMesh) oldPosition = deepCloneVector3(currentMesh.position);
            }
            updateCameraAttachment();
        }

        let onPointerUp = function () {
            if (currentMesh) {

                if (collidesStructure(currentMesh)) {
                    currentMesh.position = oldPosition;
                    hlPlane.position = currentMesh.position;
                    doHlRed(false);
                }

                if (wasMoved(currentMesh.position, oldPosition)) {
                    updateConfig();
                    const metadata = currentMesh.metadata;
                    if (metadata != "farm" && isBuilding(currentMesh)) createNavMesh();
                }
            }
            if (startingPoint) {
                camera.attachControl(canvas, true);
                updateCameraAttachment();
                startingPoint = null;
                return;
            }
        }

        let onPointerMove = function (evt) {
            if (currentMesh)
                if (isNature(currentMesh)) return;
            if (!startingPoint) return;
            let current = getGroundPosition(evt);

            if (!current) return;
            if (collidesStructure(currentMesh)) {
                doHlRed(true);
            } else {
                doHlRed(false);
            }


            let diff = current.subtract(startingPoint);
            currentMesh.position.addInPlace(diff);
            startingPoint = current;
            updateCameraAttachment();
        }
        canvas.addEventListener("pointerdown", onPointerDown, false);
        canvas.addEventListener("pointerup", onPointerUp, false);
        canvas.addEventListener("pointermove", onPointerMove, false);


        document.oncontextmenu = function () {
            if (currentMesh)
                if (isHuman(currentMesh))
                    if (navigationPlugin.isBuild) moveCrowd();

            updateCameraAttachment();
        };

        scene.actionManager = new BABYLON.ActionManager(scene);
        scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnEveryFrameTrigger,
                function () {
                    for (let j = 0; j < walkingHumans.length; j++) {
                        let human = walkingHumans[j];
                        let agent = human.parent;
                        let crowd = human.crowd;
                        let pathPoints = human.pathPoints;
                        let agents = crowd.getAgents();

                        if (human.doesApply) {
                            human.passedPoints++;

                            if (human.passedPoints >= pathPoints.length) {
                                crowd.passedHumans++;

                                if (crowd.passedHumans == agents.length) {

                                    crowd.passedHumans--;
                                    human.isWalking = false;
                                    disposeAgent(human);
                                    removeElement(walkingHumans, human);
                                    //human.isVisible = true;
                                    updateConfig();
                                }
                            } else {
                                agent.lookAt(pathPoints[human.passedPoints]);
                            }
                        }
                    }
                },
                new BABYLON.PredicateCondition(
                    scene.actionManager,
                    function () {
                        for (let i = 0; i < walkingHumans.length; i++) {
                            let human = walkingHumans[i];
                            let agent = human.parent;

                            let pathPoints = human.pathPoints;

                            if (agent) {
                                if (areVeryNear(agent._absolutePosition, pathPoints[pathPoints.length - 1]))
                                    human.passedPoints = pathPoints.length - 1;
                                human.doesApply = isVeryNearToPoints(agent._absolutePosition, pathPoints, human.passedPoints);
                                return isVeryNearToPoints(agent._absolutePosition, pathPoints, human.passedPoints)
                            } else {
                                human.passedPoints = pathPoints.length - 1;
                                human.doesApply = true;
                                return true;
                            }
                        }
                    }
                )

            )
        );
        engine.hideLoadingUI();

    }, 3000);

    //optimizations

    for (let i = 0; i < scene.materials.length; i++) scene.materials[i].freeze();
    let options = new BABYLON.SceneOptimizerOptions();
    options.addOptimization(new BABYLON.HardwareScalingOptimization(0, 1));
    let optimizer = new BABYLON.SceneOptimizer(scene, options);
    optimizer.trackerDuration = 3000;
    optimizer.start();


    return scene;
}

function onMeshSelect() {
    if (lastSelected) {
        if (currentMesh != lastSelected) {
            setOpacity(lastSelected, 1);
            setMovable(lastSelected, false);
            doHlRed(false);
            if (!isHuman(currentMesh)) deselectAllHumans();
        }
    }

    if (!currentMesh.metadata) return;
    displayHl();

    if (isUtility(currentMesh)) {
        infoPanel.style.visibility = "hidden";
        infoPanelMultiple.style.visibility = "hidden";
        return;
    }
    if (isNature(currentMesh)) {
        infoPanel.style.visibility = "hidden";
        infoPanelMultiple.style.visibility = "hidden";
        $("#controls").hide();
        leavesAudio.play();
        return;
    }

    if (isBuilding(currentMesh)) {
        $("#controls").show();
        buildingAudio.play();
    } else if (isHuman(currentMesh)) {
        selectHuman(currentMesh);
        $("#controls").hide();
    }

    lastSelected = currentMesh;

    if (humans.length > 1) {
        setUpInfoPanelMultiple()
        infoPanel.style.visibility = "hidden";
    }
    else {
        setUpInfoPanel();
        infoPanelMultiple.style.visibility = "hidden";
    }
}

//topLeft, topRight, bottomLeft, bottomRight
function onSelectionBox(tl, tr, bl, br) {
    const surface1 = getTriangleSurfaceOnPoints(tl, tr, bl);
    const surface2 = getTriangleSurfaceOnPoints(bl, br, tr);
    const totalSurface = Math.round(surface1 + surface2);

    for (let i = 0; i < troops.length; i++) {
        let troopPos = troops[i].position;

        let unitSurface = getTriangleSurfaceOnPoints(troopPos, tl, tr);
        unitSurface += getTriangleSurfaceOnPoints(troopPos, tr, br);
        unitSurface += getTriangleSurfaceOnPoints(troopPos, bl, br);
        unitSurface += getTriangleSurfaceOnPoints(troopPos, tl, bl);

        if (Math.round(unitSurface) == totalSurface) {
            currentMesh = troops[i];
            onMeshSelect();
        }
    }
}

//s = 1/2( a + b + c ), where s is the semi-perimeter
//Area = sqrt( s ( s-a ) ( s-b ) ( s-c ) )
function getTriangleSurfaceOnPoints(a, b, c) {
    const semiPerimeter = getTrianglePerimeterOnPoints(a, b, c) / 2;

    const firstSide = calcDistance(a, b);
    const secondSide = calcDistance(b, c);
    const thirdSide = calcDistance(a, c);

    const area = Math.sqrt(semiPerimeter * (semiPerimeter - firstSide) * (semiPerimeter - secondSide) * (semiPerimeter - thirdSide));

    return area;
}

function getTrianglePerimeterOnPoints(a, b, c) {
    return calcDistance(a, b) + calcDistance(b, c) + calcDistance(a, c);
}

function selectHuman(obj) {
    if (isHuman(obj) && !humans.includes(obj)) {
        humans.push(obj);
    }
}

function disposeAgent(obj) {
    let agent = obj.parent;
    obj.setParent(null);
    obj.position = deepCloneVector3(agent._absolutePosition);

    obj.rotation.y = agent.rotation.y;
    agent.dispose();
}

function deselectAllHumans() {
    for (let i = 0; i < humans.length; i++) {
        const human = humans[i];
        const agent = human.parent;

        if (agent && !human.isWalking) disposeAgent(human);

        human.hlCircle.dispose();
        human.hlCircle = null;
    }

    humans = [];
    if (cross) {
        cross.unfreezeWorldMatrix();
        cross.setEnabled(false);
        cross.position.y = -10;
        cross.freezeWorldMatrix();
    }
    infoPanel.style.visibility = "hidden";
    infoPanelMultiple.style.visibility = "hidden";
}

function deselectHuman(obj) {
    if (isHuman(obj)) {
        humans = removeElement(humans, obj);
    }
}
function isUtility(obj) {
    return utilitiesMetadata.includes(obj.metadata);
}

function idle_walkSwitch(idleMesh) {
    let ogMesh;

    switch (idleMesh.metadata) {
        case "female":
            ogMesh = walkingFemale;
            break;
        default:
            ogMesh = null;
    }

    if (ogMesh) {
        let walkingInst = createWalkInst(ogMesh, idleMesh.position.x, idleMesh.position.z);
        walkingInst.parent = idleMesh.parent;
        idleMesh.isVisible = false;
    }

}

function removeElement(array, el) {
    const index = array.indexOf(el);
    if (index > -1) {
        array.splice(index, 1);
    }
    return array;
}

function updateCameraAttachment() {
    camera.attachControl(canvas, true, true, 0);
}

function calcFramePerSec(distance) {
    const speed = 3;
    return (speed * 100) / distance;
}

function calcDistance(absPos1, absPos2) {
    if (absPos1 && absPos2) {
        const diff = absPos1.subtract(absPos2);
        return diff.length();
    }
    return 0;
}

function deepCloneVector3(pos) {
    return new BABYLON.Vector3(pos.x, pos.y, pos.z);
}

function getGroundPosition() {
    let pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) {
        return mesh == ground;
    });
    if (pickinfo.hit) return pickinfo.pickedPoint;
    return null;
}

function stopAnimations(animationGroup) {
    for (let i = 0; i < animationGroup.length; i++) {
        animationGroup[i].reset();
        animationGroup[i].stop();
    }
}

function attachObsticleBox(obj) {
    const metadata = obj.metadata;
    const scale =
        metadata == "hall" ? 7.5 :
            metadata == "armycamp" ? 8 :
                metadata == "house" ? 4 :
                    metadata == "mill" ? 5 :
                        metadata == "tower" ? 2 :
                            5

    const obstacleBox = BABYLON.MeshBuilder.CreateBox("obstacleBoxInst", { size: scale, height: 40 }, scene)

    obstacleBox.position = deepCloneVector3(obj.position);
    obstacleBox.position.y = -5;

    dontCollide.push(obstacleBox);
    return obstacleBox;
}

function getPointsInRadius(X, Z, radius) {
    let arr = [];
    for (let x = -radius + X; x < radius + X; x++)
        for (let z = -radius + Z; z < radius + Z; z++)
            arr.push(new BABYLON.Vector3(x, GROUND_LEVEL + 10, z));
    return arr;
}

function getTrees(x, z, radius) {
    return getBTreeMatches(getPointsInRadius(Math.round(x), Math.round(z), radius));
}

function getBTreeMatches(arr) {
    let matches = [];
    for (let i = 0; i < arr.length; i++)
        if (bTree.search(bTree.root, arr[i])) matches.push(arr[i]);

    return matches;
}

function displayHl() {
    const metadata = currentMesh.metadata;
    let scale = 1;

    if (isBuilding(currentMesh)) {
        hlPlane.setEnabled(true);

        if (metadata == "farm") scale = 4.5;
        else if (metadata == "house") scale = 6;
        else if (metadata == "mill") scale = 8;
        else if (metadata == "hall") scale = 10;
        else if (metadata == "tower") scale = 3;
        else if (metadata == "armyCamp") scale = 9;

        hlPlane.scaling.x = scale;
        hlPlane.scaling.y = scale;

        hlPlane.position = currentMesh._absolutePosition;
        hlPlane.position.y = GROUND_LEVEL;

    } else hlPlane.setEnabled(false);

    if (isHuman(currentMesh)) {
        if (currentMesh.hlCircle == null) {
            hlCircle.setEnabled(true);
            let circleInst = hlCircle.createInstance("hlCircleInst");

            circleInst.metadata = "hlCircle";
            circleInst.position = currentMesh._absolutePosition;
            circleInst.position.y = GROUND_LEVEL;

            currentMesh.hlCircle = circleInst;
        }
    } else hlCircle.setEnabled(false);
}

function areVeryNear(v1, v2) {
    return calcDistance(v1, v2) < 1 && calcDistance(v1, v2) >= -1
}

function isHuman(obj) {
    return humansMetadata.includes(obj.metadata);
}

function isVeryNearToPoints(v1, arr, index) {
    return areVeryNear(v1, arr[index]);
}

function getSceneConfig() {
    let config = "'{";

    let houses = [];
    let mills = [];
    let farms = [];
    let halls = [];
    let females = [];
    let males = [];
    let towers = [];
    let armyCamps = [];

    for (let i = 0; i < configMeshes.length; i++) {
        const mesh = configMeshes[i];

        const posX = mesh.position.x;
        const posZ = mesh.position.z;
        const rotY = mesh.rotation.y;
        const metadata = mesh.metadata;

        const obj = {
            posX: posX + "",
            posZ: posZ + "",
            rotY: rotY + ""
        };
        const data = JSON.stringify(obj);

        if (metadata == "house") houses.push(data);
        if (metadata == "mill") mills.push(data);
        if (metadata == "farm") farms.push(data);
        if (metadata == "hall") halls.push(data);
        if (metadata == "female") females.push(data);
        if (metadata == "male") males.push(data);
        if (metadata == "armyCamp") armyCamps.push(data);
        if (metadata == "tower") towers.push(data);
    }

    config += '"house": [' + houses + "],";
    config += '"mill": [' + mills + "],";
    config += '"farm": [' + farms + "],";
    config += '"hall": [' + halls + "],";
    config += '"armyCamp": [' + armyCamps + "],";
    config += '"tower": [' + towers + "],";
    config += '"male": [' + males + "],";
    config += '"female": [' + females + "]";

    config += "}'"
    return config;
}

function updateConfig() {
    let config = getSceneConfig();

    $.ajax({
        method: "POST",
        url: "updatedatabase.php",
        data: {
            content: config
        }
    });
}

function wasMoved(pos0, pos1) {
    return pos0.x != pos1.x || pos0.y != pos1.y || pos0.z != pos1.z;
}

function doHlRed(isRed) {
    if (isRed) hlPlane.material.diffuseColor = new BABYLON.Color3.Red();
    else hlPlane.material.diffuseColor = new BABYLON.Color3.Yellow();
}

function isMultiMat(mat) {
    if (mat == null) return false;
    return mat instanceof BABYLON.MultiMaterial;
}

function applyAlpha(mat, value) {
    if (isMultiMat(mat))
        for (let j = 0; j < mat.getChildren().length; j++) mat.getChildren()[j].alpha = value;
    else
        mat.alpha = value;
}

function setOpacity(obj, value) {
    for (let i = 0; i < obj.getChildren().length; i++) {
        let mat = obj.getChildren()[i].material;
        applyAlpha(mat, value);
    }
    if (obj.getChildren().length == 0 && !obj.isInstance) {
        let mat = obj.material;
        applyAlpha(mat, value);
    }
    if (obj.isInstance) {
        if (value != 1) obj.instancedBuffers.color = new BABYLON.Color4(4, 4, 4, 1);
        else obj.instancedBuffers.color = new BABYLON.Color4(1, 1, 1, 1);
    }
}

function rotate(obj) {
    console.log(obj);
    for (let i = 0; i < obj.getChildren().length; i++) {
        let mesh = obj.getChildren()[i];
        mesh.unfreezeWorldMatrix();
        mesh.rotation.y = mesh.rotation.y - Math.PI / 2;

        if (!isMovable(obj))
            mesh.freezeWorldMatrix();
    }
    if (obj.getChildren().length == 0) {
        obj.unfreezeWorldMatrix();
        obj.rotation.y = obj.rotation.y - Math.PI / 2;

        if (!isMovable(obj))
            obj.freezeWorldMatrix();
    }
}

function collidesStructure(picked) {
    let obj = picked.getChildren().length == 0 ? picked : picked.getChildren()[0];
    if (isUtility(obj) || isHuman(obj)) return false;

    let doesCollide = false;
    scene.meshes.forEach(mesh => {
        if (obj.intersectsMesh(mesh, false) && obj != mesh.parent && obj != mesh && (obj.parent != mesh.parent || obj.parent == null && mesh.parent == null) &&
            mesh.metadata != "grass" && canCollide(mesh) && canCollide(obj)) doesCollide = true;
    });
    if (!doesCollide) {
        let radius = obj.metadata == "farm" ? 2 : 4;
        if (getTrees(obj.position.x, obj.position.z, radius).length > 0) doesCollide = true;
    }
    return doesCollide;
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRndFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function canCollide(mesh) {
    return !dontCollide.includes(mesh);
}

function randomScale(mesh) {
    let s = 1 + getRndInteger(-1, 2) / 10.0;
    mesh.scaling = new BABYLON.Vector3(s, s, s);
}

function setMetadata(obj, value) {
    obj.metadata = value;

    for (let i = 0; i < obj.getChildren().length; i++) {
        obj.getChildren()[i].metadata = value;
    }
}

function isNature(obj) {
    return natureMetadata.includes(obj.metadata);
}

function isBuilding(obj) {
    return buildingMetadata.includes(obj.metadata);
}

function setMovable(obj, value) {
    for (let i = 0; i < obj.getChildren().length; i++) {
        let mesh = obj.getChildren()[i];
        mesh.movable = value;
        if (value) mesh.unfreezeWorldMatrix();
        else mesh.freezeWorldMatrix();
    }
    obj.movable = value;
    if (value) obj.unfreezeWorldMatrix();
}

function isMovable(obj) {
    if (obj == null) return false;
    if (isNature(obj)) return false;
    for (let i = 0; i < obj.getChildren().length; i++) {
        let mesh = obj.getChildren()[i];
        if (mesh.movable == false) return false;
    }
    if (obj.getChildren().length == 0)
        return obj.movable;
    return true;
}



function mergeMesh(obj) {
    if (obj.getChildren().length == 0) {
        obj.setParent(null);
        return obj;
    }
    let mergedMesh = BABYLON.Mesh.MergeMeshes(obj.getChildren(), true, true, undefined, false, true);
    return mergedMesh;
}


function renderShadow(obj) {
    /*
    for (let i = 0; i < obj.getChildren().length; i++) {
        let mesh = obj.getChildren()[i];
        shadowGenerator.getShadowMap().renderList.push(mesh);
    }
    if (obj.getChildren().length == 0) shadowGenerator.getShadowMap().renderList.push(obj);
    */
}


function loadAudio() {
    placeAudio.volume = 0.3;
    leavesAudio.volume = 0.3;
    buildingAudio.volume = 0.4;

    placeAudio.load();
    leavesAudio.load();
    buildingAudio.load();
}