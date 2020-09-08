function generateForest(number) {
    BABYLON.SceneLoader.ImportMesh("", modelsPath, "pine.gltf", scene, function (pineMeshes) {
        let mergedPineMesh = mergeMesh(pineMeshes[0].getChildren()[0]);
        mergedPineMesh.position.y = -10;
        dontCollide.push(mergedPineMesh);

        mergedPineMesh.doNotSyncBoundingInfo = true;
        mergedPineMesh.alwaysSelectAsActiveMesh = true;

        let colorsArr = [];
        mergedPineMesh.thinInstanceRegisterAttribute("color", 4);

        let coords = generatePatch(30, 30, 4, 7);
        coords.push(...generatePatch(-60, 50, 3, 6));
        coords.push(...generatePatch(-40, -40, 4, 7));
        coords.push(...generatePatch(150, 150, number / 5, 100));
        coords.push(...generatePatch(-30, -150, number / 5, 100));
        coords.push(...generatePatch(-150, -30, number / 5, 100));

        for (let i = 0; i < coords.length; i++) {
            coords[i].y = 10 + GROUND_LEVEL;
            const obj = createThinInst(mergedPineMesh, coords[i], i == (coords.length - 1));
            colorsArr.push(...[obj.quaternion, 0.3 + obj.quaternion, 1, 1]);
            bTree.insert(coords[i]);
        }

        mergedPineMesh.thinInstanceSetAttributeAt("color", 0, colorsArr);
        pineMeshes[0].dispose();
    });

    BABYLON.SceneLoader.ImportMesh("", modelsPath, "tree.gltf", scene, function (treeMeshes) {
        let mergedTreeMesh = mergeMesh(treeMeshes[0].getChildren()[0]);
        mergedTreeMesh.position.y = -10;
        dontCollide.push(mergedTreeMesh);

        mergedTreeMesh.doNotSyncBoundingInfo = true;
        mergedTreeMesh.alwaysSelectAsActiveMesh = true;

        let colorsArr = [];
        mergedTreeMesh.thinInstanceRegisterAttribute("color", 4);

        let coords = generatePatch(-30, 150, number / 5, 100);
        coords.push(...generatePatch(150, -30, number / 5, 100));
        coords.push(...generatePatch(-20, -20, 3, 5));

        for (let i = 0; i < coords.length; i++) {
            coords[i].y = 10 + GROUND_LEVEL;
            const obj = createThinInst(mergedTreeMesh, coords[i], i == (coords.length - 1));
            colorsArr.push(...[0.5 + obj.quaternion, 1 + obj.quaternion, obj.quaternion, 1]);
            bTree.insert(coords[i]);
        }

        mergedTreeMesh.thinInstanceSetAttributeAt("color", 0, colorsArr);
        treeMeshes[0].dispose();
    });
}

function createThinInst(mesh, pos, doRefresh) {
    let rndScale = getRndFloat(0.7, 1.3);
    let rndQuaternion = getRndInteger(0, 7) / 10.0;
    let matrix = BABYLON.Matrix.Compose(
        new BABYLON.Vector3(1, rndScale, 1),
        new BABYLON.Quaternion(0, rndQuaternion, 0),
        pos
    );
    let idx = mesh.thinInstanceAdd(matrix, doRefresh);

    return { id: idx, scale: rndScale, quaternion: rndQuaternion };
}

function generateGold(number, rockMesh, rockCluster) {
    rockMesh.metadata = "gold";

    let coords = generatePatch(60, -122, number / 4, 4);
    coords.push(...generatePatch(63, 99, number / 4, 4));
    coords.push(...generatePatch(-22, 43, number / 8, 4));

    let goldenColor = new BABYLON.Color4(1.953, 1.553, 0.061, 1);
    for (let i = 0; i < coords.length; i++) createNatureInst(rockMesh, coords[i], goldenColor).parent = rockCluster;
}

function generateBushes(number) {
    let bushes = new BABYLON.TransformNode("Bushes", scene);
    setMetadata(bushes, "bushes");

    BABYLON.SceneLoader.ImportMesh("", modelsPath, "bush.gltf", scene, function (bushMeshes) {
        let bushMesh = mergeMesh(bushMeshes[0].getChildren()[0]);

        bushMesh.metadata = "bush";
        bushMesh.isVisible = false;

        let coords = generatePatch(20, -20, number / 6, 7);
        coords.push(...generatePatch(0, 60, number / 6, 7));
        coords.push(...generatePatch(75, -140, number / 6, 7));
        coords.push(...generatePatch(-150, -150, number / 6, 6));
        coords.push(...generatePatch(-150, 75, number / 6, 6));
        coords.push(...generatePatch(-70, 30, number / 6, 6));

        for (let i = 0; i < coords.length; i++) createNatureInst(bushMesh, coords[i], null).parent = bushes;

        bushMesh.position.y = -10;
        bushMeshes[0].dispose();
    });
}

function generateRocks(number) {
    let rockCluster = new BABYLON.TransformNode("RockCluster", scene);
    setMetadata(rockCluster, "rockCluster");

    BABYLON.SceneLoader.ImportMesh("", modelsPath, "rock.gltf", scene, function (rockMeshes) {
        let rockMesh = rockMeshes[0].getChildren()[0];

        rockMesh.registerInstancedBuffer("color", 4);
        rockMesh.instancedBuffers.color = new BABYLON.Color4(1, 1, 1, 1);

        rockMesh.metadata = "rock";
        rockMesh.isVisible = false;

        let coords = generatePatch(70, 30, number / 3, 7);
        coords.push(...generatePatch(-30, -50, number / 3, 7));
        coords.push(...generatePatch(-150, 170, number / 3, 7));

        for (let i = 0; i < coords.length; i++) createNatureInst(rockMesh, coords[i], null).parent = rockCluster;

        generateGold(24, rockMesh, rockCluster);

        rockMesh.position.y = -10;
    });
}
//for rocks, gold and bushes
function createNatureInst(mesh, pos, instancedColor) {
    let inst = mesh.createInstance(mesh.metadata + "Inst");
    inst.position = pos;

    if (instancedColor) inst.instancedBuffers.color = instancedColor;

    inst._rotationQuaternion = null;
    inst.rotation.y = Math.PI / 2 + getRndInteger(1, 180);

    randomScale(inst);
    setMetadata(inst, mesh.metadata);

    setMovable(inst, false);
    inst.freezeWorldMatrix();

    inst.isInstance = true;
    return inst;
}

function generatePatch(X, Z, br, radius) {
    let coordsArray = [];
    for (let i = 0; i < br; i++) {

        let x, z;
        do {
            x = getRndInteger(-175, 175);
            z = getRndInteger(-175, 175);
        } while ((x - X) * (x - X) + (z - Z) * (z - Z) > radius * radius);

        coordsArray.push(new BABYLON.Vector3(x, GROUND_LEVEL, z));
    }
    return coordsArray
}

function loadCross() {
    BABYLON.SceneLoader.ImportMesh("", modelsPath, "cross.gltf", scene, function (meshes) {
        cross = meshes[0].getChildren()[0];

        cross.unfreezeWorldMatrix();
        cross.metadata = "cross";
        cross.position.y = -10;
        cross.setEnabled(false);
        cross.freezeWorldMatrix();
    });
}

function createGround() {
    var ground = BABYLON.MeshBuilder.CreateGround("ground", {
        height: 350,
        width: 350,
        subdivisions: 2
    }, scene);
    setMetadata(ground, "ground");

    var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
    groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    //groundMaterial.diffuseColor = new BABYLON.Color3(0.145, 0.239, 0.055);
    //groundMaterial.diffuseColor = new BABYLON.Color3(0.247, 0.494, 0.424);
    groundMaterial.diffuseColor = new BABYLON.Color3(0.494, 0.659, 0.439);

    groundMaterial.diffuseTexture = new BABYLON.Texture("/images/diffuseGround.png", scene);
    ground.material = groundMaterial;
    ground.receiveShadows = true;
    ground.checkCollisions = true;
    ground.isInstance = false;
    dontCollide.push(ground);

    return ground;
}

function generateGrassField(number) {
    /*
    var grassField = new BABYLON.TransformNode("GrassField", scene);
    BABYLON.SceneLoader.ImportMesh("", modelsPath, "grass.gltf", scene, function (grassMeshes) {
        var grassMesh = grassMeshes[0].getChildren()[0];
        grassMesh.isVisible = false;

        for (var i = 0; i < number; i++) {
            var instGrass = grassMesh.createInstance("grassInst");
            setMetadata(instGrass, "grass");

            var x = getRndInteger(-100, 100);
            var z = getRndInteger(-100, 100);

            instGrass.position.x = x;
            instGrass.position.z = z;
            instGrass.rotation.y = Math.PI / 2 + getRndInteger(1, 180);
            instGrass.scaling = new BABYLON.Vector3(3, 3, 3);
            instGrass.freezeWorldMatrix();
            instGrass.parent = grassField;
        }
        grassMesh.position.y = -10;
    });
    */
    // Create a sprite manager to optimize GPU ressources 
    // Parameters : name, imgUrl, capacity, cellSize, scene
    let spriteManagerTrees = new BABYLON.SpriteManager("grassManager", "/images/grass.png", number, 100, scene);
    //spriteManagerTrees.disableDepthWrite = true;

    //We create 2000 trees at random positions
    for (let i = 0; i < number; i++) {
        let grass = new BABYLON.Sprite("grassSprite", spriteManagerTrees);
        grass.position.x = getRndInteger(-175, 175);
        grass.position.z = getRndInteger(-175, 175);
        grass.position.y = GROUND_LEVEL;

        let rndSize = 1.1; //getRndFloat(0.4, 1);
        grass.width = rndSize;
        grass.height = rndSize;
    }
}

function createMill(x, z) {
    /*
    BABYLON.SceneLoader.ImportMesh("", modelsPath, "millAni.gltf", scene, function (meshes) {
        
        let mill = meshes[0].getChildren()[0].getChildren()[0];
        let thingy = meshes[0].getChildren()[0].getChildren()[1];
        
        renderShadow(mill);
        var pivot = new BABYLON.TransformNode("pivot", scene);
        thingy.parent = pivot;

        mill.position.x = x;
        mill.position.z = z;
        mill.position.y = GROUND_LEVEL;

        pivot.parent = mill.getChildren()[0];
        pivot.rotation.y += 0.42;

        dontCollide.push(pivot);
        dontCollide.push(thingy.getChildren()[0]);
        dontCollide.push(thingy.getChildren()[1]);

        setMetadata(mill, "mill");
        setMetadata(thingy, "mill");
        setMetadata(pivot, "mill");

        thingy.isInstance = false;
        mill.isInstance = false;
        pivot.isInstance = false;
        //obstacles.push(attachObsticleBox(mill));

        setMovable(mill, false);
        configMeshes.push(mill);
        createNavMesh();
    });
    */
    BABYLON.SceneLoader.ImportMesh("", modelsPath, "millNoAni.gltf", scene, function (meshes) {

        let mill = meshes[0].getChildren()[0];
        renderShadow(mill);

        mill.position.x = x;
        mill.position.z = z;
        mill.position.y = GROUND_LEVEL;

        setMetadata(mill, "mill");
        mill.isInstance = false;

        //obstacles.push(attachObsticleBox(mill));

        setMovable(mill, false);
        configMeshes.push(mill);
        createNavMesh();
    });

}

function generateSkybox() {
    var skyMaterial = new BABYLON.StandardMaterial("skybox", scene);
    skyMaterial.backFaceCulling = false;
    skyMaterial.reflectionTexture = new BABYLON.CubeTexture("images/skybox/skybox", scene);
    skyMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skyMaterial.disableLighting = true;
    var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {
        size: 1000.0
    }, scene);
    skybox.material = skyMaterial;
    skybox.checkCollisions = true;
    dontCollide.push(skybox);
    setMetadata(skybox, "skybox");
}

function createHall(x, z) {
    BABYLON.SceneLoader.ImportMesh("", modelsPath, "hall.gltf", scene, function (meshes) {
        let hall = mergeMesh(meshes[0].getChildren()[0]);
        meshes[0].dispose();

        hall.position.x = x;
        hall.position.z = z;
        hall.position.y = GROUND_LEVEL;
        camera.target = deepCloneVector3(hall.position);

        //obstacles.push(attachObsticleBox(hall));
        hall.isInstance = false;
        hall._rotationQuaternion = null;

        renderShadow(hall);
        setMetadata(hall, "hall");

        setMovable(hall, false);
        hall.freezeWorldMatrix();

        configMeshes.push(hall);
        createNavMesh();


    });
}


function createNavMesh() {
    //We fill the obstacles arr with all houses, mills and the town hall, and the ground
    obstacles = [];
    for (var i = 0; i < configMeshes.length; i++) {
        var metadata = configMeshes[i].metadata;
        if (metadata != "farm" && isBuilding(configMeshes[i])) {
            var boxInst = attachObsticleBox(configMeshes[i]);
            obstacles.push(boxInst);

        }
    }
    obstacles.push(ground);

    const totalObstacles = sceneJSON["house"].length + sceneJSON["tower"].length + sceneJSON["mill"].length + sceneJSON["armyCamp"].length + 2;
    //if everything has been loaded to the scene
    if (obstacles.length == totalObstacles) {

        let url = URL.createObjectURL(new Blob([inlineWorker]))
        let worker = new Worker(url)

        worker.onmessage = function (e) {
            navigationPlugin.buildFromNavmeshData(e.data);
            navigationPlugin.isBuild = true;
            if (navmeshdebug) navmeshdebug.dispose();
            navmeshdebug = navigationPlugin.createDebugNavMesh(scene);
            navmeshdebug.position.y += 0.1;
            navmeshdebug.material = matdebug;
            dontCollide.push(navmeshdebug);
        }


        var serializedMesh = BABYLON.SceneSerializer.SerializeMesh(obstacles, true, true);
        var json = JSON.stringify(serializedMesh);
        worker.postMessage({
            cmd: 1,
            json: json
        });
    }

    ///finally, we dispose all obstacle boxes
    for (var i = 0; i < obstacles.length; i++)
        if (obstacles[i].name == "obstacleBoxInst") obstacles[i].dispose();
}

function createCrowd() {
    let selectedCrowd = navigationPlugin.createCrowd(humans.length, 0.1, scene);
    selectedCrowd.passedHumans = 0;

    const agents = selectedCrowd.getAgents();

    for (let i = 0; i < humans.length; i++) {
        let human = humans[i];
        let transform = human.parent == null ? new BABYLON.TransformNode("Agent") : human.parent;
        let agentPosition = deepCloneVector3(human._absolutePosition);


        transform.position = agentPosition;
        human.position = new BABYLON.Vector3(0, 0, 0);
        human.rotation.y = 0;
        human.parent = transform;

        human.crowd = selectedCrowd;


        const agentIndex = selectedCrowd.addAgent(agentPosition, agentParams, transform);
    }
    return selectedCrowd;
}

function moveCrowd() {

    let crowd = createCrowd();
    let startingPoint = getGroundPosition();

    if (startingPoint) {
        let agents = crowd.getAgents();
        let pathPoints = navigationPlugin.computePath(crowd.getAgentPosition(agents[0]), navigationPlugin.getClosestPoint(startingPoint));

        for (let i = 0; i < humans.length; i++) {
            let human = humans[i];
            human.parent.lookAt(pathPoints[1]);
            human.passedPoints = 0;
            human.pathPoints = pathPoints;

            crowd.agentGoto(agents[i], navigationPlugin.getClosestPoint(startingPoint));
            human.isWalking = true;
            if (!walkingHumans.includes(human)) walkingHumans.push(human);
            //idle_walkSwitch(human);

        }

        cross.unfreezeWorldMatrix();
        cross.setEnabled(true);
        cross.position = startingPoint;
        cross.position.y = GROUND_LEVEL;
        cross.freezeWorldMatrix();
        setMovable(cross, false);
    }
}

function loadFarms() {
    BABYLON.SceneLoader.ImportMesh("", modelsPath, "farm.gltf", scene, function (meshes) {
        let farm = mergeMesh(meshes[0].getChildren()[0]);
        farm.registerInstancedBuffer("color", 4);
        farm.instancedBuffers.color = new BABYLON.Color4(1, 1, 1, 1);
        farm.isVisible = false;

        for (var i = 0; i < sceneJSON["farm"].length; i++) {
            let x = parseFloat(sceneJSON["farm"][i].posX);
            let z = parseFloat(sceneJSON["farm"][i].posZ);

            let farmInst = farm.createInstance("farmInst" + i);
            farmInst.position.x = x;
            farmInst.position.z = z;
            farmInst.position.y = GROUND_LEVEL;
            farmInst.isInstance = true;

            farmInst._rotationQuaternion = null;

            setMovable(farmInst, false);
            farmInst.freezeWorldMatrix();

            setMetadata(farmInst, "farm");
            configMeshes.push(farmInst);
        }
        farm.position.y = -10;
        meshes[0].dispose();
    });
}

function loadStaticMills() {
    BABYLON.SceneLoader.ImportMesh("", modelsPath, "millNoAni.gltf", scene, function (meshes) {
        let mill = mergeMesh(meshes[0].getChildren()[0]);
        mill.isVisible = false;

        mill.registerInstancedBuffer("color", 4);
        mill.instancedBuffers.color = new BABYLON.Color4(1, 1, 1, 1);


        for (var i = 0; i < sceneJSON["mill"].length; i++) {
            let x = parseFloat(sceneJSON["mill"][i].posX);
            let z = parseFloat(sceneJSON["mill"][i].posZ);

            let millInst = mill.createInstance("millInst" + i);
            millInst.position.x = x;
            millInst.position.z = z;
            millInst.position.y = GROUND_LEVEL;
            millInst.isInstance = true;

            millInst._rotationQuaternion = null;
            millInst.freezeWorldMatrix();

            renderShadow(millInst);
            setMetadata(millInst, "mill");
            setMovable(millInst, false);
            configMeshes.push(millInst);

        }
        mill.position.y = -10;
        createNavMesh();
        meshes[0].dispose();
    });
}

function loadHouses() {
    BABYLON.SceneLoader.ImportMesh("", modelsPath, "house.gltf", scene, function (meshes) {
        let house = mergeMesh(meshes[0].getChildren()[0]);
        house.isVisible = false;
        house.registerInstancedBuffer("color", 4);
        house.instancedBuffers.color = new BABYLON.Color4(1, 1, 1, 1);

        for (let i = 0; i < sceneJSON["house"].length; i++) {
            let x = parseFloat(sceneJSON["house"][i].posX);
            let z = parseFloat(sceneJSON["house"][i].posZ);

            let houseInst = house.createInstance("houseInst" + i);
            houseInst.position.x = x;
            houseInst.position.z = z;
            houseInst.position.y = GROUND_LEVEL;
            houseInst.isInstance = true;

            houseInst._rotationQuaternion = null;
            houseInst.freezeWorldMatrix();

            renderShadow(houseInst);
            setMetadata(houseInst, "house");
            setMovable(houseInst, false);
            configMeshes.push(houseInst);

        }
        house.position.y = -10;
        createNavMesh();
        meshes[0].dispose();
    });
}

function loadTowers() {
    BABYLON.SceneLoader.ImportMesh("", modelsPath, "tower.gltf", scene, function (meshes) {
        let tower = mergeMesh(meshes[0].getChildren()[0]);
        tower.isVisible = false;
        tower.registerInstancedBuffer("color", 4);
        tower.instancedBuffers.color = new BABYLON.Color4(1, 1, 1, 1);

        for (let i = 0; i < sceneJSON["tower"].length; i++) {
            let x = parseFloat(sceneJSON["tower"][i].posX);
            let z = parseFloat(sceneJSON["tower"][i].posZ);

            let towerInst = tower.createInstance("towerInst" + i);
            towerInst.position.x = x;
            towerInst.position.z = z;
            towerInst.position.y = GROUND_LEVEL;
            towerInst.isInstance = true;

            towerInst._rotationQuaternion = null;
            towerInst.freezeWorldMatrix();

            setMetadata(towerInst, "tower");
            setMovable(towerInst, false);
            configMeshes.push(towerInst);

        }
        tower.position.y = -10;
        createNavMesh();
        meshes[0].dispose();
    });
}


function loadArmyCamps() {
    BABYLON.SceneLoader.ImportMesh("", modelsPath, "armyCamp.gltf", scene, function (meshes) {
        let armyCamp = mergeMesh(meshes[0].getChildren()[0]);
        armyCamp.isVisible = false;
        armyCamp.registerInstancedBuffer("color", 4);
        armyCamp.instancedBuffers.color = new BABYLON.Color4(1, 1, 1, 1);

        for (let i = 0; i < sceneJSON["armyCamp"].length; i++) {
            let x = parseFloat(sceneJSON["armyCamp"][i].posX);
            let z = parseFloat(sceneJSON["armyCamp"][i].posZ);

            let armyCampInst = armyCamp.createInstance("armyCampInst" + i);
            armyCampInst.position.x = x;
            armyCampInst.position.z = z;
            armyCampInst.position.y = GROUND_LEVEL;
            armyCampInst.isInstance = true;

            armyCampInst._rotationQuaternion = null;
            armyCampInst.freezeWorldMatrix();

            renderShadow(armyCampInst);
            setMetadata(armyCampInst, "armyCamp");
            setMovable(armyCampInst, false);
            configMeshes.push(armyCampInst);

        }
        armyCamp.position.y = -10;
        createNavMesh();
        meshes[0].dispose();
    });
}

function loadMen() {
    BABYLON.SceneLoader.ImportMesh("", modelsPath, "maleIdle.gltf", scene, function (meshes, particleSystems, skeletons, animationGroups) {
        idleMale = meshes[0];
        idleMale.name = "IdleMaleRoot";
        setMetadata(idleMale, "male");
        idleMale._rotationQuaternion = null;
      
        for (let i = 0; i < sceneJSON["male"].length; i++) {
            let x = parseFloat(sceneJSON["male"][i].posX);
            let z = parseFloat(sceneJSON["male"][i].posZ);
            let idleInst = createIdleInst(idleMale, x, z);

            configMeshes.push(idleInst);
            troops.push(idleInst);

        }

        idleMale.position.y = -10;
        idleMale.setEnabled(false);
    });

}

function loadWomen() {
    BABYLON.SceneLoader.ImportMesh("", modelsPath, "femaleWalking.gltf", scene, function (meshes, particleSystems, skeletons, animationGroups) {
        walkingFemale = meshes[0];
        walkingFemale.name = "WalkingFemaleRoot";
        animationGroups[0].start(true);
        animationGroups[1].start(true);
        animationGroups[2].start(true);
        animationGroups[3].start(true);
        setMetadata(walkingFemale, "female");
        mergeMesh(walkingFemale.getChildren()[0]).parent = walkingFemale.getChildren()[0];
        walkingFemale.position.y = -10;
        BABYLON.SceneLoader.ImportMesh("", modelsPath, "femaleIdle.gltf", scene, function (meshes, particleSystems, skeletons, animationGroups) {
            idleFemale = meshes[0];
            idleFemale.name = "IdleFemaleRoot";
            setMetadata(idleFemale, "female");
            idleFemale._rotationQuaternion = null;
            //mergeMesh(idleFemale.getChildren()[0]).parent = idleFemale.getChildren()[0];


            for (let i = 0; i < sceneJSON["female"].length; i++) {
                let x = parseFloat(sceneJSON["female"][i].posX);
                let z = parseFloat(sceneJSON["female"][i].posZ);
                let idleInst = createIdleInst(idleFemale, x, z);

                configMeshes.push(idleInst);
                troops.push(idleInst);

                //humans.push(idleInst);
            }
            /*var female = meshes[0].getChildren()[0].getChildren()[0];
            

            //female.parent.parent.position.x = 10;
            //female.parent.parent.position.z = 10;
            female.parent.parent.position.y = 10 * GROUND_LEVEL;

            
            female.animationGroups = animationGroups;
            
            setMetadata(female, "female");
            //humans.push(female);
            female.walkAnimationCount = 0;*/

            idleFemale.position.y = -10;
            idleFemale.setEnabled(false);
        });
        walkingFemale.position.y = -10;
        walkingFemale.isVisible = false;

        //temp
        walkingFemale.dispose();
    });
}

function createIdleInst(mesh, x, z) {
    let metadata = mesh.metadata;

    let inst = mesh.getChildren()[0].createInstance(metadata + "IdleInst");
    inst.position.x = x;
    inst.position.z = z;
    inst.position.y = 10 * GROUND_LEVEL;
    inst._rotationQuaternion = null;

    renderShadow(inst);
    setMetadata(inst, metadata);
    return inst;
}

function createWalkInst(mesh, x, z) {
    let metadata = mesh.metadata;
    let instRoot = new BABYLON.TransformNode(metadata + "WalkingInstRoot", scene);
    for (let i = 0; i < mesh.getChildren().length; i++) {
        let bodyPart = new BABYLON.TransformNode("bodyPart", scene);
        bodyPart.parent = instRoot;
        bodyPart.position = mesh.getChildren()[i].position;

        for (let j = 0; j < mesh.getChildren()[i].getChildren().length; j++) {
            let bodyPartInst = mesh.getChildren()[i].getChildren()[j].createInstance("bodyPartInst");
            if (i > 0) bodyPart.animations.push(mesh.getChildren()[i].animations[j]);

            bodyPartInst.parent = bodyPart;
            renderShadow(bodyPartInst);
            setMetadata(bodyPartInst, metadata);
        }
        if (i > 0) scene.beginAnimation(bodyPart, 0, 30, true, 2.5);
    }
    setMetadata(instRoot, metadata);
    instRoot.position.x = x;
    instRoot.position.z = z;
    instRoot.position.y = 10 * GROUND_LEVEL;
    return instRoot;
}

function loadScene() {

    loadWomen();
    loadMen();
    loadHouses();
    loadFarms();
    loadStaticMills();
    loadTowers();
    loadArmyCamps();

    let x = parseFloat(sceneJSON["hall"][0].posX);
    let z = parseFloat(sceneJSON["hall"][0].posZ);
    createHall(x, z);
    //createHall(30, 20);


}

function createDirLight() {
    let light = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-10, -20, 10), scene);
    light.intensity = 2;
    return light;
}

function createHemLight() {
    let light = new BABYLON.HemisphericLight("hemLight", new BABYLON.Vector3(
        0, 0, 10), scene);
    light.intensity = 0.8;
    light.intensity = 0.8;
    light.parent = camera;
    return light;
}

function createCamera() {
    /*
        let myCamera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(50, 30, -50), scene);
        myCamera.setTarget(BABYLON.Vector3.Zero());
        myCamera.attachControl(canvas, true);
        myCamera.keysUp.push(87);
        myCamera.keysDown.push(83);
        myCamera.keysLeft.push(65);
        myCamera.keysRight.push(68);
        myCamera.checkCollisions = true;
    
        return myCamera;
    */

    let myCamera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 0, 0, 10, new BABYLON.Vector3(0, 0, 0), scene);

    //myCamera.setPosition(new BABYLON.Vector3(50, 30, -50));
    myCamera.setPosition(new BABYLON.Vector3(65, 26, -41));
    myCamera.attachControl(canvas, true, true, 0);

    myCamera.panningSensibility = 50;
    myCamera.panningAxis = new BABYLON.Vector3(1, 0, -1);

    myCamera.lowerBetaLimit = 0.1;
    myCamera.upperBetaLimit = (Math.PI / 2) * 0.9;
    myCamera.lowerRadiusLimit = 30;
    myCamera.upperRadiusLimit = 150;

    return myCamera;
}

function setUpScene() {
    let myScene = new BABYLON.Scene(engine);
    myScene.clearColor = new BABYLON.Color3(0.73, 0.9, 0.9);
    myScene.useRightHandedSystem = true;
    myScene.collisionsEnabled = true;
    myScene.fogMode = BABYLON.Scene.FOGMODE_EXP;
    myScene.fogDensity = 0.0008;
    //myScene.fogDensity = 0.0011;
    myScene.fogColor = new BABYLON.Color3(0.796, 0.945, 1);
    myScene.useGeometryIdsMap = true;
    myScene.useMaterialMeshMap = true;
    myScene.useClonedMeshMap = true;
    return myScene;
}

function createShadowGenerator(dirLight) {
    let myShadowGenerator = new BABYLON.ShadowGenerator(1024, dirLight);
    myShadowGenerator.setDarkness(0.5);
    return myShadowGenerator;
}

function createHlPlane() {
    let myHlPlane = BABYLON.MeshBuilder.CreatePlane("myHlPlane", {
        width: 1,
        height: 1,
        updatable: true,
        sideOrientation: 2
    }, scene);
    myHlPlane.rotation.x = Math.PI / 2;
    myHlPlane.position.y = -10;
    myHlPlane.visibility = 0.5;
    myHlPlane.setEnabled(false);
    myHlPlane.metadata = "hlPlane";

    dontCollide.push(myHlPlane);

    let hlMat = new BABYLON.StandardMaterial("hlPlaneMat", scene);
    hlMat.diffuseColor = BABYLON.Color3.Yellow();
    myHlPlane.material = hlMat;

    return myHlPlane;
}

function createHlCircle() {
    let myHlCircle = BABYLON.MeshBuilder.CreateDisc("myHlCircle", {
        tessellation: 10
    }, scene);

    myHlCircle.rotation.x = Math.PI / 2;
    myHlCircle.position.y = -10;
    myHlCircle.visibility = 0.5;
    myHlCircle.setEnabled(false);
    myHlCircle.metadata = "hlCircle";

    dontCollide.push(myHlCircle);

    let hlMat = new BABYLON.StandardMaterial("hlCircleMat", scene);
    hlMat.diffuseColor = BABYLON.Color3.Yellow();
    myHlCircle.material = hlMat;

    return myHlCircle;
}


function spawnPeasant() {
    //test if the user has enough resourses
    if(true) {
        let random  = Math.round(Math.random());
        let idleInst
    
        let x = 0;
        let z = 0;
        idleInst = random == 0 ? createIdleInst(idleFemale, x, z) : createIdleInst(idleMale, x, z);
        

        //configMeshes.push(idleInst);
        troops.push(idleInst);
        updateConfig();
    }
}












//-----------------------ONLY BULLSHIT DOWNSTAIRS-----------------------------------------//
function createShop() {
    /* 
    $("#shopItem0").click(function() {
        $("#shopModal").modal('hide');

        BABYLON.SceneLoader.ImportMesh("", "", "house.gltf", scene, function(meshes) {
            var house = meshes[0].getChildren()[0];
            setMovable(house, true);
            setOpacity(house, 0.9);
            setMetadata(house, "house");
            renderShadow(house);

            configMeshes.push(house);

            var teleport = function(evt) {
                var pickInfo = scene.pick(scene.pointerX, scene.pointerY, function(mesh) {
                    return mesh !== ground;
                });

                if (pickInfo) {
                    var current = getGroundPosition(evt);
                    if (!current) return;

                    if (collidesStructure(house.getChildren()[0])) {

                        house.placable = false
                    } else {

                        house.placable = true;
                    }
                    house.position = current;
                    house.position.y = GROUND_LEVEL;
                }
            }
            var place = function(evt) {
                setMovable(house, true);
                var pickInfo = scene.pick(scene.pointerX, scene.pointerY, function(mesh) {
                    return mesh !== ground;
                });
                if (pickInfo.hit) {
                    var pickedMesh = pickInfo.pickedMesh.parent;


                    if (pickedMesh != house) return;
                    if (house.placable) {

                        canvas.removeEventListener("pointermove", teleport);
                        canvas.removeEventListener("click", place);
                        setMovable(house, false);
                        setOpacity(house, 1);
                    }
                }
            }
            updateConfig(scene);
            canvas.addEventListener("pointermove", teleport, false);
            canvas.addEventListener("click", place, false);
        });

    });

    $("#shopItem1").click(function() {
        $("#shopModal").modal('hide');

        BABYLON.SceneLoader.ImportMesh("", "", "millAni.gltf", scene, function(meshes) {

            var thingy = meshes[0].getChildren()[0];
            var mill = meshes[0].getChildren()[1];

            renderShadow(mill);
            var pivot = BABYLON.MeshBuilder.CreateSphere("sphere", {}, scene);
            thingy.parent = pivot;

            pivot.parent = mill.getChildren()[0];
            pivot.rotation.y += 0.42;

            dontCollide.push(pivot);
            dontCollide.push(thingy.getChildren()[0]);
            dontCollide.push(thingy.getChildren()[1]);

            setMetadata(mill, "mill");
            setMetadata(thingy, "mill");
            setMetadata(pivot, "mill");
            setMovable(mill, true);
            setOpacity(mill, 0.6);

            configMeshes.push(mill);

            var teleport = function(evt) {
                var pickInfo = scene.pick(scene.pointerX, scene.pointerY, function(mesh) {
                    return mesh !== ground;
                });

                if (pickInfo) {
                    var current = getGroundPosition(evt);
                    if (!current) return;

                    if (collidesStructure(mill.getChildren()[0])) {

                        mill.placable = false
                    } else {

                        mill.placable = true;
                    }
                    mill.position = current;
                    mill.position.y = GROUND_LEVEL;
                }
            }
            var place = function(evt) {
                setMovable(mill, true);
                var pickInfo = scene.pick(scene.pointerX, scene.pointerY, function(mesh) {
                    return mesh !== ground;
                });
                if (pickInfo.hit) {
                    var pickedMesh = pickInfo.pickedMesh.parent;
                    if (pickedMesh != mill) return;
                    if (mill.placable) {

                        canvas.removeEventListener("pointermove", teleport);
                        canvas.removeEventListener("click", place);
                        setMovable(mill, false);
                        setOpacity(mill, 1);
                    }
                }
            }
            updateConfig(scene);
            canvas.addEventListener("pointermove", teleport, false);
            canvas.addEventListener("click", place, false);
        });

    });

    $("#shopItem2").click(function() {
        $("#shopModal").modal('hide');

        BABYLON.SceneLoader.ImportMesh("", "", "farm.gltf", scene, function(meshes) {
            var farm = meshes[0].getChildren()[0];

            setMovable(farm, true);
            setOpacity(farm, 0.6);
            setMetadata(farm, "farm");
            renderShadow(farm);

            configMeshes.push(farm);

            var teleport = function(evt) {
                var pickInfo = scene.pick(scene.pointerX, scene.pointerY, function(mesh) {
                    return mesh !== ground;
                });

                if (pickInfo) {
                    var current = getGroundPosition(evt);
                    if (!current) return;

                    if (collidesStructure(farm.getChildren()[0])) {
                        
                        farm.placable = false
                    } else {

                        farm.placable = true;
                    }
                    farm.position = current;
                    farm.position.y = GROUND_LEVEL;
                }
            }
            var place = function(evt) {
                setMovable(farm, true);
                var pickInfo = scene.pick(scene.pointerX, scene.pointerY, function(mesh) {
                    return mesh !== ground;
                });
                if (pickInfo.hit) {
                    var pickedMesh = pickInfo.pickedMesh.parent;
                    if (pickedMesh != farm) return;
                    if (farm.placable) {

                        canvas.removeEventListener("pointermove", teleport);
                        canvas.removeEventListener("click", place);
                        setMovable(farm, false);
                        setOpacity(farm, 1);
                    }
                }
            }
            updateConfig(scene);
            canvas.addEventListener("pointermove", teleport, false);
            canvas.addEventListener("click", place, false);
        });
    });
    */
}
const inlineWorker = `
                    importScripts("https://preview.babylonjs.com/babylon.js");
                    importScripts("https://preview.babylonjs.com/recast.js");

                    class NavMesh{
                        constructor(scene){
                            this.scene = scene;
                            this.meshes = [];
                            this.navigationPlugin = new BABYLON.RecastJSPlugin();
                            this.parameters = {
                                cs: 2,
                                ch: 0.01,
                                walkableSlopeAngle: 0,
                                walkableHeight: 0.01,
                                walkableClimb: 0,
                                walkableRadius: 0.6,
                                maxEdgeLen: 30,
                                maxSimplificationError: 0,
                                minRegionArea: 10,
                                mergeRegionArea: 0,
                                maxVertsPerPoly: 5,
                                detailSampleDist: 1,
                                detailSampleMaxError: 1
                            };
                        }

                        addMesh(mesh){
                            const index = this.meshes.indexOf(mesh);
                            if(index == -1){
                                this.meshes.push(mesh);
                            }
                        }

                        createMesh(){
                            this.navigationPlugin.createNavMesh(this.meshes, this.parameters);
                            //var navmeshdebug = this.navigationPlugin.createDebugNavMesh(this.scene);
                        }

                        getBinaryData(){
                            return this.navigationPlugin.getNavmeshData();
                        }

                        updateWorldMatrixFromName(name,matrix){
                            this.meshes.forEach(mesh => {
                                if(mesh.name == name){
                                    BABYLON.Matrix.FromArrayToRef(matrix, 0, mesh.getWorldMatrix());
                                    return true;
                                }
                            });
                            return false;
                        }


                        
                    }
                    
                    var engine = new BABYLON.NullEngine();
                    var scene = new BABYLON.Scene(engine);
                    
                    var navMesh = new NavMesh(scene);
                    
                    let bin;
                    self.onmessage = function(e) {
                        let data = e.data
                        if(data.cmd==1) {
                            BABYLON.SceneLoader.ImportMesh("", "", 'data:'+data.json, scene, function (meshes, particleSystems, skeletons) {

                                console.log("Loaded a navmesh with ", meshes.length);
                                meshes.forEach(mesh => {
                                    navMesh.addMesh(mesh);
                                })
                                
                             });

                            navMesh.createMesh();
                            bin = navMesh.getBinaryData();
                            bin = navMesh.getBinaryData();
                            self.postMessage(bin);                          
                        }
                    }
                    
                `