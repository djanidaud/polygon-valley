// $(".control").innerWidth($(".control").innerHeight());

function onResize() { 
   
}

const infoPanelMultiple = document.getElementById("infoPanelMultiple");
const infoPanel = document.getElementById("infoPanel");

const main = document.getElementById('main');
const select = document.getElementById('selectBox');

let mouseDown = false;

main.addEventListener('pointermove', e => {
    if (mouseDown) {
        select.style.width = parseFloat(e.offsetX) - parseFloat(select.style.left);
        select.style.height = parseFloat(e.offsetY) - parseFloat(select.style.top);
    } 
});

main.addEventListener('pointerdown', e => {
    if (camera && canvas) {
        if (e.shiftKey) {
            select.style.width = 0;
            select.style.height = 0;
            select.style.top = parseFloat(e.offsetY);
            select.style.left = parseFloat(e.offsetX);
            camera.detachControl(canvas);

            mouseDown = true;
        }
    }
});
main.addEventListener('pointerup', e => {
    if (camera && canvas) {
        if (mouseDown) {
            // console.log("point1: "+ select.style.left,select.style.top);
            //console.log("point2: "+ parseFloat(select.style.left) + parseFloat(select.style.width),select.style.top);
            //console.log("point3: "+ parseFloat(select.style.left) ,parseFloat(select.style.top) + parseFloat(select.style.height));
            //console.log("point4: "+ (parseFloat(select.style.left) + parseFloat(select.style.width)) , (parseFloat(select.style.top) + parseFloat(select.style.height)));

            const posX = parseFloat(select.style.left);
            const posY = parseFloat(select.style.top);
            const width = parseFloat(select.style.width);
            const height = parseFloat(select.style.height);

            if (width != 0 && height != 0) {
                const tl = scene.pick(posX, posY).pickedPoint;
                const tr = scene.pick(posX + width, posY).pickedPoint;
                const bl = scene.pick(posX, posY + height).pickedPoint;
                const br = scene.pick(posX + width, posY + height).pickedPoint;

                onSelectionBox(tl, tr, bl, br);
            }

            select.style.width = 0;
            select.style.height = 0;
            select.style.top = 0;
            select.style.left = 0;

            updateCameraAttachment();
            mouseDown = false;
        }
    }
});

function setUpStatsField(field) {
    const metadata = currentMesh.metadata;

    const stats = document.getElementById(field+"Stats");
    const statsValue = document.getElementById(field+"StatsValue");

    const value = modelsJSON[metadata][0][field];
    stats.style.display = value == 0 ? "none" : "block";

    statsValue.innerHTML = value;
}

function setUpInfoPanel() {
    const metadata = currentMesh.metadata;

    setUpStatsField("damage");
    setUpStatsField("health");
    setUpStatsField("speed");
    setUpStatsField("population");

    setUpCustomButtons();

    if(isHuman(currentMesh)) {
        $("#unitStats").addClass("col-10");
        $("#unitStats").removeClass("col-6");
    } else {
        $("#unitStats").removeClass("col-10");
        $("#unitStats").addClass("col-6");
    }

    $("#infoPanelName").html(modelsJSON[metadata][0].name);
    $("#infoImg").attr("src", modelsJSON[metadata][0].img);
    $(".control").off("click");

    $("#moveButton").click(() => {
        if (!isMovable(currentMesh)) {
            setOpacity(currentMesh, 0.8);
            setMovable(currentMesh, true);
        } else {
            setOpacity(currentMesh, 1);
            setMovable(currentMesh, false);
        }
    });
    $("#rotateButton").click(() => rotate(currentMesh));

    $("#infoPanelImg").click(() =>  {
        camera.target = deepCloneVector3(currentMesh.position);
        camera.radius = 5;
    });
    infoPanel.style.visibility = "visible";
}

function setUpInfoPanelMultiple() {
    $("#infoPanelMultiple").empty();

    for(let i = 0; i < humans.length; i++){
        const metadata = humans[i].metadata;

        $("#infoPanelMultiple").html($("#infoPanelMultiple").html() + 
        `<div style="display:inline-block;width:70;height:70;"> 
            <img src=` + modelsJSON[metadata][0].img + ` class="w-100 h-100">
        </div>`);
    }

    infoPanelMultiple.style.visibility = "visible";
}

function getTotalPopulation() {
    let population = 0;
    for(let i=0;  i< sceneJSON["house"].length ; i++){
        if(true) population += 3;
    }
    return population;
}
 
function getCurrentPopulation() {
    let population = sceneJSON["male"].length + sceneJSON["female"].length;
    return population;
}
 
function setUpPopulationTab(currentPopulation = getCurrentPopulation(), totalPopulation = getTotalPopulation()) {
    $("#totalPopulation").html(currentPopulation + "/" + totalPopulation);
}

function setUpCustomButtons() {
    $("#customButtons").empty();
    $("#customButtons").parent().css('display', 'none');

    const metadata = currentMesh.metadata;
    if(metadata == "hall") {
        $("#customButtons").html("<button id='trainVillagers' class='my-auto' onclick='spawnPeasant()'> </button>");
        $("#customButtons").parent().css('display', 'flex');
    }
}
