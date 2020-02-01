"use strict";

// задаём размеры игрового поля
let screenWidth = 1080;
let screenHeight = 720;
let dWings1=0,dWingsMulti1=1,dWings2=0,dWingsMulti2=1;// Для дракона
let towerCubes=[],towerCubeWidths=[],towerCubeHeights=[],towerCubeLengths=[],towerCones=[],towerCylinders=[],walls=[],wallsWidth=[],wallsHeight=[],wallsLength=[];// Массивы данных башен и стен
let towerCounter=0,wallCounter=0,merlons=[[],[]],merlonCounter=0;// Счётчики

/* Функция для анимации дракона */
function dragonAnimation(dragon){
    let children = dragon.children;// Массив всех объектов группы dragon
    /* Анимация левого крыла */
    children[3].rotation.z+=-0.1*dWingsMulti1;
    children[4].rotation.z+=0.1*dWingsMulti1;
    children[3].position.x+=1*dWingsMulti1;
    children[4].position.x+=-1*dWingsMulti1;
    dWings1+=0.1;
    if(dWings1>1){dWings1=0;dWingsMulti1*=-1;}
    /* Анимация правого крыла */
    children[5].rotation.z+=0.1*dWingsMulti2;
    children[6].rotation.z+=-0.1*dWingsMulti2;
    children[5].position.x+=2*dWingsMulti2;
    children[6].position.x+=-2*dWingsMulti2;
    dWings2+=0.1;
    if(dWings2>1){dWings2=0;dWingsMulti2*=-1;}
    /* Анимация подъема всего дракона */
    dragon.position.y+=1*dWingsMulti1;
}

/* Функция для приблизительного сравнивания чисел с плавающей точкой */
function fequal(a,b){
    let e=0.01;
    if(a<b+e&&a>b-e)return true;
    else return false;
}

/* Функция для создания холма */
function createHill(scene, radius, x, y, z, color, detail) {
    const verticesOfCube = [
        -1, -1, -1,    1, -1, -1,    1,  1, -1,    -1,  1, -1,
        -1, -1,  1,    1, -1,  1,    1,  1,  1,    -1,  1,  1,
    ];
    const indicesOfFaces = [
        2, 1, 0,    0, 3, 2,
        0, 4, 7,    7, 3, 0,
        0, 1, 5,    5, 4, 0,
        1, 2, 6,    6, 5, 1,
        2, 3, 7,    7, 6, 2,
        4, 5, 6,    6, 7, 4,
    ];
    const geometry = new THREE.PolyhedronBufferGeometry(verticesOfCube, indicesOfFaces, radius, detail);
    let material = new THREE.MeshLambertMaterial({color: color});
    let hill = new THREE.Mesh(geometry,material);
    hill.position.x=x;
    hill.position.y=y;
    hill.position.z=z;
    scene.add(hill);
} 

/* Функция для создания и возвращения конуса */
function createCone(scene, radius, height, color, sideNumber) {
    if(height>40)height=40;
    let cone_geometry = new THREE.ConeBufferGeometry(radius, height, sideNumber);
    let cone_material = new THREE.MeshLambertMaterial({color: color});
    let cone = new THREE.Mesh(cone_geometry,cone_material);
    scene.add(cone);
    return cone;
} 

/* Функция для создания и возвращения сферы */
function createSphere(scene, radius, color, segments) {
    let sphereGeometry = new THREE.SphereGeometry(radius, segments, segments);
    let sphereMaterial = new THREE.MeshLambertMaterial({color: color});
    let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);
    return sphere;
}

/* Функция для создания и возвращения цилиндра */
function createCylinder(scene, radius, height, color, segments) {
    let cylinderGeometry = new THREE.CylinderGeometry(radius, radius, height, segments);
    let sphereMaterial = new THREE.MeshLambertMaterial({color: color});
    let cylinderMaterial = new THREE.MeshLambertMaterial({color: color});
    let cylinder = new THREE.Mesh(cylinderGeometry, sphereMaterial);
    scene.add(cylinder);
    return cylinder;
}

/* Функция для создания и возвращения куба */
function createCube(scene, width, height, length, color,x,y,z,rotationY,rotationX,rotationZ) {
    let cubeGeometry = new THREE.CubeGeometry(width, height, length);
    let cubeMaterial = new THREE.MeshLambertMaterial({color: color});
    let cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    if(x!==undefined){
    cube.position.x=x;
    cube.position.y=y;
    cube.position.z=z;}
    if(rotationY!==undefined)cube.rotation.y=rotationY;
    if(rotationX!==undefined)cube.rotation.x=rotationX;
    if(rotationZ!==undefined)cube.rotation.z=rotationZ;
    scene.add(cube);
    return cube;
}

/* Функция для создания и возвращения точечного источника света */
function createLight(scene, color, force) {
    let pointLight = new THREE.PointLight(color, force);
    scene.add(pointLight);
    return pointLight;
}

/* Класс дерева */
class Tree {
    constructor(scene,radius,height,x,y,z){
        this.radius = radius;
        this.height = height;
        this.x = x;
        this.y = y;
        this.z = z;
        /* Создание ствола дерева */
        let cylinder = createCylinder(scene,radius,height,"#300000",10);
        cylinder.position.x = x;
        cylinder.position.y = height/2;
        cylinder.position.z = z;
        /* Создание 1 части кроны дерева */
        let cone1 = createCone(scene,radius*2,height/1.5,"#003300",10)
        cone1.position.x = x;
        cone1.position.y = height/2+height/2;
        cone1.position.z = z;
        /* Создание 2 части кроны дерева */
        let cone2 = createCone(scene,radius*2,height/1.5,"#003300",10)
        cone2.position.x = x;
        cone2.position.y = height+height/1.5/2;
        cone2.position.z = z;
    }
}

/* Класс дома */
class House {
    constructor(scene,width,height,length,x,y,z,color){
        this.width = width;
        this.height = height;
        this.length = length;
        this.x = x;
        this.y = y;
        this.z = z;
        /* Угол между положительной осью ординат и центром дома с учётом квадранта (Чтобы дверь дома была направлена на центральную башню) */
        this.rotationY = Math.atan2(x,z) + Math.PI;
        /* Создание куба дома */
        createCube(scene,width,height,length,color,x,y,z,this.rotationY,0,0);
        createCube(scene,width/2,height*0.75,1,"#300000",x+(width+1)/2*Math.sin(this.rotationY),y-height*0.05/2,z+(width+1)/2*Math.cos(this.rotationY),this.rotationY,0,0);
        createCube(scene,width/1.5,height*0.1,3,"#222222",x+(width+3)/2*Math.sin(this.rotationY),y-height*0.9/2,z+(width+3)/2*Math.cos(this.rotationY),this.rotationY,0,0);
        /* Создание крыши дома */
        let cone = createCone(scene, width*Math.sqrt(2)/2*1.5, height, color, 4);// радиус описанной окружности равен width*Math.sqrt(2)/2*1.5 т.к. необходимо создать радиус окружности, описанной вокруг основания пирамиды, равный радиусу окружности, вписанной в грань куба
        cone.position.x=x;
        cone.position.y=y+10;
        cone.position.z=z;
        cone.rotation.y = this.rotationY + Math.PI/4;// + Math.PI/4 из-за особенностей созданного конуса с четырьмя сегментами
    }
}

/* Функция для создания башни замка */
function createTower(scene,width,height,length,x,y,z,rotation,color,segments){
    /* Создание куба башни */
    towerCubes[towerCounter]=createCube(scene,width,height,length,color);
    /* Создание максимально широкой надстройки башни */
    if(length<=width){
        towerCylinders[towerCounter]=createCylinder(scene,length/2-2,height/4,color,segments);
        towerCones[towerCounter]=createCone(scene,length/2-2,height,color,segments);
    }else{
        towerCylinders[towerCounter]=createCylinder(scene,width/2-2,height/4,color,segments);
        towerCones[towerCounter]=createCone(scene,width/2-2,height,color,segments);
    }
    /* Добавление данных о кубе башни в массивы */
    towerCubes[towerCounter].position.x=x;
    towerCubes[towerCounter].position.y=y+height/2;
    towerCubes[towerCounter].position.z=z;
    towerCubes[towerCounter].rotation.y=rotation;
    towerCubeWidths[towerCounter]=width;
    towerCubeHeights[towerCounter]=height;
    towerCubeLengths[towerCounter]=length;
    /* Добавление данных о цилиндре башни в массив */
    towerCylinders[towerCounter].position.x=x;
    towerCylinders[towerCounter].position.y=y+height+height/8;
    towerCylinders[towerCounter].position.z=z;
    /* Добавление данных о конусе башни в массив */
    towerCones[towerCounter].position.x=x;
    towerCones[towerCounter].position.z=z;
    /* Проверка, чтобы купол башни не был слишком высоким */
    if(height>40)
        towerCones[towerCounter].position.y=y+height*1.25+40*0.5;
    else
        towerCones[towerCounter].position.y=y+height*1.75;

    towerCounter++;// Увеличение счётчика башен
}

/* Функция для создания стены замка */
function createWall(scene,i,j,height,length,color){
    // Угол между прямой, проведенной между двумя башнями замка, и осью Z
    let angle = Math.atan( (towerCubes[j].position.z - towerCubes[i].position.z) / (towerCubes[j].position.x - towerCubes[i].position.x) );
    // Расстояние между этими башнями
    let width = Math.sqrt( Math.pow(towerCubes[j].position.z - towerCubes[i].position.z,2) + Math.pow(towerCubes[j].position.x - towerCubes[i].position.x,2) );
    /* Добавление данных о стене в массив */
    walls[wallCounter]=createCube(scene,width,height,length,color);
    walls[wallCounter].position.x=towerCubes[i].position.x+(towerCubes[j].position.x-towerCubes[i].position.x)/2;
    walls[wallCounter].position.y+=height/2;
    walls[wallCounter].position.z=towerCubes[i].position.z+(towerCubes[j].position.z-towerCubes[i].position.z)/2;
    walls[wallCounter].rotation.y=Math.PI-angle;
    wallsHeight[wallCounter]=height;
    wallsWidth[wallCounter]=width;
    wallsLength[wallCounter]=length;
    wallCounter++;// Увеличение счётчика стен
}

/* Функция для создания мерлонов размером 1x1 */
function createMerlon(scene,position,width,height,length,rotation,color){
    // Углы под которыми будет идти линия мерлонов
    let ang=Math.PI-rotation,ang1=Math.PI-rotation+Math.PI/2,ang2=-rotation,ang3=Math.PI/2-rotation;

    let w1,l1,w2;// 3 стороны прямоугольника
    w1=l1=w2=0;
    let number=((length+width)*2-4)/2,merlonWidth=1;// Количество мерлонов, ширина каждого = 1

    /* Координаты X,Y,Z первого мерлона */
    let x=position.x, y=position.y+height/2+merlonWidth/2, z=position.z;
    x+=(length/2)*Math.sin(rotation)+(width/2)*Math.cos(rotation)-Math.sqrt(merlonWidth*merlonWidth*2)/2*Math.sin(rotation+45/180*Math.PI);
    z+=(length/2)*Math.cos(rotation)-(width/2)*Math.sin(rotation)-Math.sqrt(merlonWidth*merlonWidth*2)/2*Math.cos(-rotation-45/180*Math.PI);

    /* Добавление данных о ПЕРВОМ мерлоне в массив */
    merlons[merlonCounter,0]=createCube(scene,merlonWidth,merlonWidth,merlonWidth,color);
    merlons[merlonCounter,0].position.x=x;
    merlons[merlonCounter,0].position.y=y;
    merlons[merlonCounter,0].position.z=z;
    merlons[merlonCounter,0].rotation.y=rotation;

    for(let j=1;j<number*2;j++){
        /* Рассчёт позиции следующего мерлона */
        x+=merlonWidth*Math.cos(ang);
        z+=merlonWidth*Math.sin(ang);


        if(fequal(ang,Math.PI-rotation)){
            if(w1+merlonWidth*2>width){// Проверка на нахождение мерлона в углу
                x-=merlonWidth*Math.cos(ang);// Откатывание на мерлон назад (т.к. нет места, чтобы его поставить)
                z-=merlonWidth*Math.sin(ang);
                x+=(width-merlonWidth-w1)*Math.cos(ang);// Перемещение на край стороны
                z+=(width-merlonWidth-w1)*Math.sin(ang);
                ang=ang1;// Поворот на 90 градусов
                x+=(2*merlonWidth+w1-width)*Math.cos(ang);// Движение по следующей стороне
                z+=(2*merlonWidth+w1-width)*Math.sin(ang);
                l1+=2*merlonWidth+w1-width;// Новая сторона
                w1+=width-merlonWidth-w1;// Предыдущая сторона
                
            }else
            w1+=merlonWidth;// Текущая сторона
        }else
        if(fequal(ang,ang1)){
            if(l1+merlonWidth*2>length){// Проверка на нахождение мерлона в углу
                x-=merlonWidth*Math.cos(ang);// Откатывание на мерлон назад (т.к. нет места, чтобы его поставить)
                z-=merlonWidth*Math.sin(ang);
                x+=(length-merlonWidth-l1)*Math.cos(ang);// Перемещение на край стороны
                z+=(length-merlonWidth-l1)*Math.sin(ang);
                ang=ang2;// Поворот на 90 градусов
                x+=(2*merlonWidth+l1-length)*Math.cos(ang);// Движение по следующей стороне
                z+=(2*merlonWidth+l1-length)*Math.sin(ang);
                w2+=2*merlonWidth+l1-length;// Новая сторона
                l1+=length-merlonWidth-l1;// Предыдущая сторона
                
            }else
            l1+=merlonWidth;// Текущая сторона
        }else
        if(fequal(ang,ang2)){
            if(w2+merlonWidth*2>width){// Проверка на нахождение мерлона в углу
                x-=merlonWidth*Math.cos(ang);// Откатывание на мерлон назад (т.к. нет места, чтобы его поставить)
                z-=merlonWidth*Math.sin(ang);
                x+=(width-merlonWidth-w2)*Math.cos(ang);// Перемещение на край стороны
                z+=(width-merlonWidth-w2)*Math.sin(ang);
                ang=ang3;// Поворот на 90 градусов
                x+=(2*merlonWidth+w2-width)*Math.cos(ang);// Движение по следующей стороне
                z+=(2*merlonWidth+w2-width)*Math.sin(ang);
                w2+=width-merlonWidth-w2;// Предыдущая сторона (нет смысла создавать новую)
                
            }else
            w2+=merlonWidth;// Текущая сторона
        }
        
        if(j%2!==0)continue;// Создание расстояния между мерлонами (иначе будет сплошная линия вокруг стен)
        /* Добавление данных о каждом мерлоне в массив */
        merlons[merlonCounter,j]=createCube(scene,merlonWidth,merlonWidth,merlonWidth,color);
        merlons[merlonCounter,j].position.x=x;
        merlons[merlonCounter,j].position.y=y;
        merlons[merlonCounter,j].position.z=z;
        merlons[merlonCounter,j].rotation.y=rotation;
    }
    merlonCounter++;// Увеличение счётчика мерлонов
}

window.onload = function() {
    /* Создание сцены */
    let scene = new THREE.Scene();
    /* Создание камеры */
    let camera = new THREE.PerspectiveCamera(80, screenWidth / screenHeight, 0.1, 1000);
    /* Назначение порядка вращения камеры */
    camera.rotation.order = 'YXZ';
    // Начальные координаты камеры
    camera.position.z=100;
    camera.position.x=200;
    camera.position.y=100;
    /* Создание визуализатора */
    let renderer = new THREE.WebGLRenderer();
    renderer.setClearColor("#0000FF");
    renderer.setSize(screenWidth,screenHeight);
    document.getElementById("gameBox").append(renderer.domElement);

    let w,a,s,d,bsp,sft;// Определение переменных для кнопок
    bsp=sft=w=a=s=d=false;// Инициализация переменных для кнопок

    
    // Создание источника свята рядом с камерой
    let q1 = createLight(scene, "#FFFFFF", 1);
    // Координаты солнца
    q1.position.x = camera.position.x;
    q1.position.y = camera.position.z;
    q1.position.z = camera.position.z;

    // Создание куб (земля)
    let ground = createCube(scene, 700, 1, 700, "#00AA00");
    // Определение значения позиции куба (земли)
    ground.position.x = 0;
    ground.position.y = 0;
    ground.position.z = 0;

    // Создание Солнца
    let sun = createLight(scene, "#FFFFFF", 1.5);
    // Координаты солнца
    sun.position.x = 0;
    sun.position.y = 200;
    sun.position.z = 0;

    /* Создание группы для дракона */
    let dangle = 0;
    let dragon = new THREE.Group();
    dragon.add(createCube(scene,20,10,30,"#660000",0,50,0));
    dragon.add(createCube(scene,20,20,20,"#660000",0,60,-20));
    dragon.add(createCube(scene,16,10,30,"#660000",0,55,-30));
    dragon.add(createCube(scene,30,10,20,"#660000",-25,60,0));
    dragon.add(createCube(scene,30,10,20,"#660000",25,60,0));
    dragon.add(createCube(scene,20,8,20,"#660000",-50,60,0));
    dragon.add(createCube(scene,20,8,20,"#660000",50,60,0));
    scene.add(dragon);
    dragon.position.y=10;

    /* Создание векторов позиций домов */
    let housesPosition = [
        new THREE.Vector3(-70,5,-70),
        new THREE.Vector3(-120,5,-30),
        new THREE.Vector3(-110,5,10),
        new THREE.Vector3(-150,5,20),   
        new THREE.Vector3(-70,5,50),
        new THREE.Vector3(-150,5,70),
        new THREE.Vector3(-100,5,100),
        new THREE.Vector3(-40,5,80),
        new THREE.Vector3(-50,5,120),
        new THREE.Vector3(0,5,100),
        new THREE.Vector3(20,5,150),
        new THREE.Vector3(40,5,120),
        new THREE.Vector3(80,5,60),
        new THREE.Vector3(100,5,20),
        new THREE.Vector3(140,5,40),
        new THREE.Vector3(150,5,-20),
        new THREE.Vector3(100,5,-40),
        new THREE.Vector3(100,5,-100),
        new THREE.Vector3(150,5,-80),
        new THREE.Vector3(150,5,-20),
        new THREE.Vector3(150,5,-130),
        new THREE.Vector3(80,5,-150),
        new THREE.Vector3(60,5,-100),
        new THREE.Vector3(40,5,-140),
        new THREE.Vector3(100,25,100)
    ];
    /* Создание массива домов */
    let houses = [];
    for(let i = 0; i < housesPosition.length; i++)
        houses[i] = new House(scene,10,10,10,housesPosition[i].x,housesPosition[i].y,housesPosition[i].z,"#FF0000");

    /* Создание векторов позиций деревьев */
    let treesPosition = [];
    for(let i=0;i<1000;i++){
        let treeX = Math.random()*700-350;
        let treeZ = Math.random()*700-350;
        if(Math.pow((treeX-1),2)+Math.pow((treeZ-1),2)>300*300){treesPosition.push(new THREE.Vector3(treeX,0,treeZ))}
    }
    /* Создание массива деревьев */
    let trees = [];
    for(let i = 0; i < treesPosition.length; i++)
        trees[i] = new Tree(scene,1,10,treesPosition[i].x,treesPosition[i].y,treesPosition[i].z);

    /* Создание холмов */
    createHill(scene, 150, -200,-100,-200, "#005500", 2);
    createHill(scene, 24, 50,-12,0, "#005500", 1);
    createHill(scene, 24, 100,0,100, "#005500", 1);
    createHill(scene, 30, 0,-6,0, "#005500", 1);
    createHill(scene, 16, 6,-6,18, "#005500", 1);
    createHill(scene, 18, 6,-6,-12, "#005500", 1);
    createHill(scene, 18, -30,-10,30, "#005500", 1);
    createHill(scene, 16, 33,-10,50, "#005500", 1);
    createHill(scene, 16, 30,-10,60, "#005500", 1);
    createHill(scene, 16, 30,-10,70, "#005500", 1);
    createHill(scene, 16, 20,-10,70, "#005500", 1);
    createHill(scene, 16, 10,-10,70, "#005500", 1);
    createHill(scene, 16, 10,-10,60, "#005500", 1);
    createHill(scene, 24, 20,-10,60, "#005500", 1);
    createHill(scene, 16, 30,-10,-50, "#005500", 1);

    /* Создание башен, стен между ними и мерлонов */
    createTower(scene,40,20,60,-50,0,0,0,"#660000",8);
    createMerlon(scene,towerCubes[0].position,towerCubeWidths[0],towerCubeHeights[0],towerCubeLengths[0],towerCubes[0].rotation.y,"#660000");

    createTower(scene,23,20,22,20,0,60,0,"#660000",8);
    createMerlon(scene,towerCubes[1].position,towerCubeWidths[1],towerCubeHeights[1],towerCubeLengths[1],0,"#660000");

    createWall(scene,0,1,15,10,"#660000",8);
    createMerlon(scene,walls[0].position,wallsWidth[0],wallsHeight[0],wallsLength[0],walls[0].rotation.y,"#660000");

    createTower(scene,20,20,20,50,0,0,0,"#660000",8);
    createMerlon(scene,towerCubes[2].position,towerCubeWidths[2],towerCubeHeights[2],towerCubeLengths[2],0,"#660000");

    createWall(scene,1,2,15,10,"#660000",8);
    createMerlon(scene,walls[1].position,wallsWidth[1],wallsHeight[1],wallsLength[1],walls[1].rotation.y,"#660000");

    createTower(scene,20,20,20,60,0,-60,0,"#660000",8);
    createMerlon(scene,towerCubes[3].position,towerCubeWidths[3],towerCubeHeights[3],towerCubeLengths[3],0,"#660000");

    createWall(scene,2,3,15,10,"#660000",8);
    createMerlon(scene,walls[2].position,wallsWidth[2],wallsHeight[2],wallsLength[2],walls[2].rotation.y,"#660000");

    createTower(scene,20,20,20,20,0,-80,0,"#660000",8);// Первая башня ворот

    createWall(scene,3,4,15,10,"#660000",8);
    createMerlon(scene,walls[3].position,wallsWidth[3],wallsHeight[3],wallsLength[3],walls[3].rotation.y,"#660000");

    createTower(scene,20,20,20,-20,0,-60,0,"#660000",8);// Вторая башня ворот

    // Угол между прямой, проведенной между двумя башнями ворот, и осью Z
    let towerGatesAngle = Math.abs( Math.atan( (towerCubes[5].position.z - towerCubes[4].position.z) / (towerCubes[4].position.x - towerCubes[5].position.x) ));
    towerCubes[4].rotation.y=towerGatesAngle;// Поворот первой башни ворот параллельно линии их пересечения
    towerCubes[5].rotation.y=towerGatesAngle;// Поворот второй башни ворот параллельно линии их пересечения
    createMerlon(scene,towerCubes[4].position,towerCubeWidths[4],towerCubeHeights[4],towerCubeLengths[4],towerCubes[4].rotation.y,"#660000");
    createMerlon(scene,towerCubes[5].position,towerCubeWidths[5],towerCubeHeights[5],towerCubeLengths[5],towerCubes[5].rotation.y,"#660000");

    createWall(scene,5,0,15,10,"#660000",8);
    createMerlon(scene,walls[4].position,wallsWidth[4],wallsHeight[4],wallsLength[4],walls[4].rotation.y,"#660000");

    /* Создание центральной башни */
    createCube(scene,30,30,30,"#660000",0,15,0);
    createMerlon(scene,new THREE.Vector3(0,15,0),30,30,30,0,"#660000");
    createTower(scene,20,50,20,0,0,0,0,"#660000",8,1);
    createMerlon(scene,towerCubes[6].position,towerCubeWidths[6],towerCubeHeights[6],towerCubeLengths[6],towerCubes[6].rotation.y,"#660000");

    /* Большая башня на большом холме */
    createTower(scene,40,50,40,-200,30,-200,0,"#1e1b1b",8);
    createMerlon(scene,towerCubes[7].position,towerCubeWidths[7],towerCubeHeights[7],towerCubeLengths[7],0,"#1e1b1b");
    
    // Создание группы для ворот замка
    let gates = new THREE.Group();
    // Создание группы для дверей замка
    let doors = new THREE.Group();

    /* Создание открытой двери ворот */
    doors.position.x-=12;
    doors.add(createCube(scene,12.5,15,3,"#300000",-6.25,-10,0,0,0,0));
    doors.rotation.y=2;
    /* Создание остальных ворот замка */
    gates.add(createCube(scene,25,5,20,"#660000",0,0,0));
    gates.add(createCube(scene,7,5,20,"#660000",-12,-2,0,0,0,(45/180*Math.PI)));
    gates.add(createCube(scene,7,5,20,"#660000",12,-2,0,0,0,(-45/180*Math.PI)));
    gates.add(createCube(scene,12.5,15,3,"#300000",6.25,-10,0,0,0,0));
    gates.position.x=0;
    gates.position.y=17.5;
    gates.position.z=-70;
    gates.rotation.y=towerGatesAngle;
    gates.add(doors);
    scene.add(gates);
    
    /* Функции для опряделения нажатых кнопок */
    window.onkeydown = function(event){
        switch(event.keyCode){
            case 87:{w=true;break;}
            case 65:{a=true;break;}
            case 83:{s=true;break;}
            case 68:{d=true;break;}
            case 32:{bsp=true;break;}
            case 16:{sft=true;break;}
        }
    }
    window.onkeyup = function(event){
        switch(event.keyCode){
            case 87:{w=false;break;}
            case 65:{a=false;break;}
            case 83:{s=false;break;}
            case 68:{d=false;break;} 
            case 32:{bsp=false;break;}
            case 16:{sft=false;break;}
        }
    }

const rect = gameBox.getBoundingClientRect();// Рамка canvas
let mouseX=screenWidth/2, mouseY=screenHeight/2;// Начальные координаты курсора
/* Переназначение координат мыши относительно canvas при движении мыши */
gameBox.addEventListener('mousemove', e => {
    mouseX = Math.min(e.clientX - rect.left, screenWidth);
    mouseY = Math.min(e.clientY - rect.top, screenHeight);
});

let mult=2;// Мультипликатор скорости движения камеры
let sunAngle=0;
/* Анимация мира */
    setInterval(function() {

        camera.rotation.x+=Math.PI/10000*Math.pow((screenHeight/2-mouseY)/120,5);// вращение камеры с помощью мыши относительно внутренней оси X
        camera.rotation.y+=Math.PI/10000*Math.pow((screenWidth/2-mouseX)/120/screenWidth*screenHeight,5);// вращение камеры с помощью мыши относительно внутренней оси Y
        if(camera.rotation.x > Math.PI/2)camera.rotation.x = Math.PI/2;
        if(camera.rotation.x < -Math.PI/2)camera.rotation.x = -Math.PI/2;
        renderer.render(scene, camera);
            
        /* Источник света рядом с камерой */
        q1.position.x = camera.position.x;
        q1.position.y = camera.position.y;
        q1.position.z = camera.position.z;

        /* Движение камеры учитывая вращение камеры относительно внутренней оси Y */
        if(w){
            camera.position.x-=1*mult*Math.sin(camera.rotation.y);
            camera.position.z-=1*mult*Math.cos(camera.rotation.y);
        }
        if(a){
            camera.position.x-=1*mult*Math.cos(camera.rotation.y);
            camera.position.z+=1*mult*Math.sin(camera.rotation.y);
        }
        if(s){
            camera.position.x+=1*mult*Math.sin(camera.rotation.y);
            camera.position.z+=1*mult*Math.cos(camera.rotation.y);
        }
        if(d){
            camera.position.x+=1*mult*Math.cos(camera.rotation.y);
            camera.position.z-=1*mult*Math.sin(camera.rotation.y);
        }
        /* Движение камеры вверх/вниз НЕ учитывая вращение камеры относительно внутренней оси Y*/
        if(bsp)camera.position.y+=1*mult;
        if(sft)camera.position.y-=1*mult;

        /* Движение дракоши*/
        dangle+=0.01;
        dragon.rotation.y=dangle-Math.PI/2;
        dragon.position.x=150*Math.sin(dangle);
        dragon.position.z=150*Math.cos(dangle);
        dragonAnimation(dragon);
            
        sunAngle+=0.001;
        sun.position.x=200*Math.sin(sunAngle);
        sun.position.y=200*Math.cos(sunAngle);
        if(sun.position.y<=0){
            sunAngle+=0.01;
            sun.position.x=200*Math.sin(sunAngle);
            sun.position.y=200*Math.cos(sunAngle);
        }
    }, 30);
}