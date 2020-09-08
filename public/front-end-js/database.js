const imgPath = "/images/frames/";
const text = `{
    "house": [{
        "name": "Villager House",
        "img": "` + imgPath + `houseFrame.png",
        "damage": 0,
        "health": 200,
        "speed": 0,
        "population": 3
    }],
    "mill": [{
        "name": "Windmill",
        "img": "` + imgPath + `millFrame.png",
        "damage": 0,
        "health": 350,
        "speed": 0,
        "population": 0
    }],
    "farm": [{
        "name": "Farmland",
        "img": "` + imgPath + `farmFrame.png",
        "damage": 0,
        "health": 20,
        "speed": 0,
        "population": 0
    }],
    "hall": [{
        "name": "Town Hall",
        "img": "` + imgPath + `hallFrame.png",
        "damage": 10,
        "health": 500,
        "speed": 0,
        "population": 5
    }],
    "female": [{
        "name": "Peasant",
        "img": "` + imgPath + `femaleFrame.png",
        "damage": 3,
        "health": 50,
        "speed": 5,
        "population": 0
    }],
    "male": [{
        "name": "Peasant",
        "img": "` + imgPath + `maleFrame.png",
        "damage": 4,
        "health": 60,
        "speed": 4,
        "population": 0
    }],
    "tower": [{
        "name": "Tower",
        "img": "` + imgPath + `towerFrame.png",
        "damage": 10,
        "health": 300,
        "speed": 0,
        "population": 0
    }],
    "armyCamp": [{
        "name": "Army Camp",
        "img": "` + imgPath + `armyCampFrame.png",
        "damage": 0,
        "health": 400,
        "speed": 0,
        "population": 0
    }]
}`

const modelsJSON = JSON.parse(text);
