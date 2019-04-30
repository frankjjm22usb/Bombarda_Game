class Control {
    //myControl = new Control("w","d","s","a");
    constructor(up, right, down, left, jump, placeBomb) {
        this.initControls();
        this.up = up || "w";
        this.right = right || "d";
        this.down = down || "s";
        this.left = left || "a";
        this.velocity = 10;
        this.jump = jump || " ";
        this.placeBomb = placeBomb || "e";
        this.capacityBombs = 1;
        this.isInAir = false;
        this.isFalling = false;
        this.isJumping = false;
        this.availableBomb = true;
        this.element = null;

        this.initListeners();
    }

    set up(key) {
        this._up.key = key;
    }

    get up() {
        return this._up.key;
    }

    set right(key) {
        this._right.key = key;
    }

    get right() {
        return this._right.key;
    }

    set down(key) {
        this._down.key = key;
    }

    get down() {
        return this._down.key;
    }

    set left(key) {
        this._left.key = key;
    }

    get left() {
        return this._left.key;
    }

    set jump(key) {
        this._jump.key = key;
    }

    get jump() {
        return this._jump.key;
    }
    set placeBomb(key) {
        this._placeBomb.key = key;
    }

    get placeBomb() {
        return this._placeBomb.key;
    }

    initControls() {
        this._up = { key: "", isPressed: false };
        this._right = { key: "", isPressed: false };
        this._down = { key: "", isPressed: false };
        this._left = { key: "", isPressed: false };
        this._jump = { key: "", isPressed: false };
        this._placeBomb = { key: "", isPressed: false };
    }

    initListeners() {


    }



    update(vx, vy, m, jf) {
        this.velocity = vx;
        this.vy = vy;
        this.m = m;
        this.jumpForce = jf;

        if (this._up.isPressed) {
            this.element.position.z -= this.velocity;
        }
        if (this._right.isPressed) {
            this.element.position.x += this.velocity;
        }
        if (this._down.isPressed) {
            this.element.position.z += this.velocity;
        }
        if (this._left.isPressed) {
            this.element.position.x -= this.velocity;
        }
        if (this._placeBomb.isPressed && !this.isInAir) {

            let sumarBombas = () => this.capacityBombs += 1;
            let activarBombas = () => this.availableBomb = true;
            let boom = () => {
                var pos = collidableList.indexOf(group);
                collidableList.splice(pos, 1);
                scene.remove(group);
            }

            if (this.capacityBombs > 0 && this.availableBomb) {
                let geometry = new THREE.SphereGeometry(25, 32, 32);
                let material = new THREE.MeshPhongMaterial({
                    color: 0x000000,
                    wireframe: false,
                    transparent: false
                });
                var bomb = new THREE.Mesh(geometry, material);
                bomb.castShadow = true;
                bomb.receiveShadow = true;

                bomb.position.x = this.element.position.x;
                bomb.position.y = this.element.position.y;
                bomb.position.z = this.element.position.z;

                var boxBombMTL = new THREE.MeshPhongMaterial({ transparent: true, opacity: 0 });
                var boxBombGEO = new THREE.BoxGeometry(50, 50, 50);
                var boxBomb = new THREE.Mesh(boxBombGEO, boxBombMTL);

                boxBomb.position.x = this.element.position.x;
                boxBomb.position.y = this.element.position.y;
                boxBomb.position.z = this.element.position.z;
                var group = new THREE.Group();
                group.add(bomb);
                group.add(boxBomb);

                scene.add(group);
                collidableList.push(boxBomb);
                // console.log(collidableList);
                // scene.add(boxBomb);
                // scene.add(bomb);
                console.log('Me llamaron?')
                console.log(this.capacityBombs);
                this.capacityBombs -= 1;
                this.availableBomb = false;
                console.log(this.capacityBombs);
                // this.availableBomb = false;
                setTimeout(sumarBombas, 4000);
                setTimeout(boom, 4000);
                setTimeout(activarBombas, 500);
                // var collidableBoom = new CollidableBox();
            }



        }
        if (this._jump.isPressed) {
            console.log(`is Jumping: ${this.isJumping} and is In Air: ${this.isInAir}`)
            if (!this.isJumping && !this.isInAir) {
                this.isJumping = true;
                this.element.position.y += this.jumpForce;
            }
        }
    }

    pressUp() {
        this._up.isPressed = true;
    }
    pressRight() {
        this._right.isPressed = true;
    }
    pressDown() {
        this._down.isPressed = true;
    }
    pressLeft() {
        this._left.isPressed = true;
    }
    pressJump() {
        this._jump.isPressed = true;
    }
    pressBomb() {
        this._placeBomb.isPressed = true;
    }

    releaseUp() {
        this._up.isPressed = false;
    }
    releaseRight() {
        this._right.isPressed = false;
    }
    releaseDown() {
        this._down.isPressed = false;
    }
    releaseLeft() {
        this._left.isPressed = false;
    }
    releaseJump() {
        this._jump.isPressed = false;
    }
    releasePlaceBomb() {
        this._placeBomb.isPressed = false;
    }

}

//Esta función es la magia, pone false al isCurrent de todas las cámaras
function resetIsCurrent(object) {
    for (const key in object) {
        object[key].isCurrent = false;
        console.log(object[key].isCurrent)
    }
}


document.onkeydown = (e) => {
    // mySound3D.play();
    // mySound3D2.play();
    // mySound3D3.play();
    // mySound3D4.play();

    //cámara default
    if (e.key == "1") {
        console.log('Camera default puesta');
        console.log(cameras.default.cam.position);
        resetIsCurrent(cameras);//Aquí todas las cámaras tiene isCurren = false;
        cameras.default.isCurrent = true;//Aquí la default isCurrent
        cameras.current.cam = cameras.default.cam;
        cameraControl = new THREE.OrbitControls(cameras.current.cam, renderer.domElement);
    }
    // if (e.key == "2") {
    //     console.log('Camera camera2 puesta');
    //     cameras.current.cam = cameras.camera2.cam;//Aquí todas las cámaras tiene isCurren = false;
    //     resetIsCurrent(cameras);//Aquí la cámara 2 es la incurrent
    //     cameras.camera2.isCurrent = true;
    //     cameraControl = new THREE.OrbitControls(cameras.current.cam, renderer.domElement);
    // }
    // if (e.key == "3") {
    //     console.log('Camera camera3 puesta');
    //     cameras.current.cam = cameras.camera3.cam;//Aquí todas las cámaras tiene isCurren = false;
    //     resetIsCurrent(cameras);//Aquí la cámara 3 es la incurrent
    //     cameras.camera3.isCurrent = true;
    //     cameraControl = new THREE.OrbitControls(cameras.current.cam, renderer.domElement);
    // }
    // if (e.key == "4") {
    //     console.log('Camera camera4 puesta');
    //     cameras.current.cam = cameras.camera4.cam;//Aquí todas las cámaras tiene isCurren = false;
    //     resetIsCurrent(cameras);//Aquí la cámara 3 es la incurrent
    //     cameras.camera4.isCurrent = true;
    //     cameraControl = new THREE.OrbitControls(cameras.current.cam, renderer.domElement);
    // }
    // if (e.key == "5") {
    //     console.log('Camera camera5 puesta');
    //     cameras.current.cam = cameras.camera5.cam;//Aquí todas las cámaras tiene isCurren = false;
    //     resetIsCurrent(cameras);//Aquí la cámara 3 es la incurrent
    //     cameras.camera5.isCurrent = true;
    //     cameraControl = new THREE.OrbitControls(cameras.current.cam, renderer.domElement);
    // }

    for (let i = 0; i < Object.keys(players).length; i++) {
        let key = Object.keys(players)[i];
        if (players[key] == null) { return false; }
        let elControl = players[key]["control"];
        //console.log(`Tecla presionada: ${e.key} Tecla up de este jugador ${elControl.up}`)
        switch (e.key) {
            case elControl.up:
                elControl.pressUp();
                break;
            case elControl.right:
                elControl.pressRight();
                break;
            case elControl.down:
                elControl.pressDown();
                break;
            case elControl.left:
                elControl.pressLeft();
                break;
            case elControl.jump:
                elControl.pressJump();
                break;
            case elControl.placeBomb:
                elControl.pressBomb();
                break;
        }

    }



}

document.onkeyup = (e) => {
    //console.log(Object.keys(players));
    for (let i = 0; i < Object.keys(players).length; i++) {

        let key = Object.keys(players)[i];
        if (players[key] == null) { return false; }
        let elControl = players[key]["control"];

        switch (e.key) {
            case elControl.up:
                elControl.releaseUp();
                break;
            case elControl.right:
                elControl.releaseRight();
                break;
            case elControl.down:
                elControl.releaseDown();
                break;
            case elControl.left:
                elControl.releaseLeft();
                break;
            case elControl.jump:
                elControl.releaseJump();
                break;
            case elControl.placeBomb:
                elControl.releasePlaceBomb();
                break;
        }
    }


}

// function bombToCollidableList(bomb){
//     this.collidableList.push(bomb);
//     console.log('añadida')
// }
