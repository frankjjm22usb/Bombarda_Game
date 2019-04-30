class CollidableBox {
    constructor(mesh, boundingRadius) {
        this.mesh = mesh;
        this.collidableRadius = boundingRadius;
        this.isFalling = { state: false, acc: 0 };
        // this.initBoundingMesh(this.mesh);
    }

    initBoundingMesh(mesh) {
        console.log(mesh);
        this.collidableRadius = mesh.geometry.boundingSphere.radius;
    }

    collide(normal, callback, verticalColliding = false, player) {
        let collidableRay = new THREE.Raycaster();
        collidableRay.ray.direction.set(normal.x, normal.y, normal.z);

        let origin = this.mesh.position.clone();
        collidableRay.ray.origin.copy(origin);

        let intersections = collidableRay.intersectObjects(collidableList);
        // let intersectPowerUps = collidableRay.intersectObjects(powerUpList);

        if (verticalColliding) {
            if (intersections.length > 0) {
                callback(intersections);
            } else {
                this.isFalling.state = true;
                this.isFalling.acc += 1;
                this.mesh.position.y -= 1 * this.isFalling.acc;
            }
        } else {
            if (intersections.length > 0) {
                let distance = intersections[0].distance;
                if (distance < this.collidableRadius) {
                    switch (intersections[0].object.name) {
                        case "Velocity2X":
                            // console.log(collidableList);
                            var pos = collidableList.indexOf(intersections[0].object);
                            // console.log(pos);
                            collidableList.splice(pos, 1);
                            scene.remove(intersections[0].object);
                            // console.log("removido")
                            // console.log(collidableList);
                            player.vx += 5;
                            break;
                        case "Bomb+":
                            var pos = collidableList.indexOf(intersections[0].object);
                            collidableList.splice(pos, 1);
                            scene.remove(intersections[0].object);
                            player.control.capacityBombs += 1;
                            console.log(player.control.capacityBombs);
                            break;
                        case "thanos":
                            this.mesh.material.color = new THREE.Color("0xffffff")
                            break;
                        default:
                            callback();
                            break;
                    }
                }
            }
        }

    }
    collideLeft(player) {
        let callback = () => {
            this.mesh.position.x -= player.control.velocity;
        }
        this.collide({ x: 1, y: 0, z: 0 }, callback, false, player);
    }

    collideRight(player) {
        let callback = () => {
            this.mesh.position.x += player.control.velocity;
        }
        this.collide({ x: -1, y: 0, z: 0 }, callback, false, player);
    }
    collideFront(player) {
        let callback = () => {
            this.mesh.position.z -= player.control.velocity;
        }
        this.collide({ x: 0, y: 0, z: 1 }, callback, false, player);
    }

    collideBack(player) {
        let callback = () => {
            this.mesh.position.z += player.control.velocity;
        }
        this.collide({ x: 0, y: 0, z: -1 }, callback, false, player);
    }

    collideBottom(player) {

        let callback = (intersections) => {
            let distance = intersections[0].distance;
            //console.log(`distance: ${distance} CR: ${this.collidableRadius}`)
            if (distance > this.collidableRadius) { //inAir
                this.isFalling.state = true;
                this.isFalling.acc += 0.2;
                this.mesh.position.y -= 1 * this.isFalling.acc;
                //console.log("in air")

                player.control.isInAir = true;

            }
            if (distance <= this.collidableRadius + 1) { //over the floor
                //console.log("over the floor")
                player.control.isJumping = false;
                player.control.isInAir = false;
                this.isFalling.state = false;
                this.isFalling.acc = 0;
                if (distance < this.collidableRadius) {
                    this.mesh.position.y += 1 / 2;
                }
                switch (intersections[0].object.name) {
                    case "plataforma":
                        powerup2.isInUse = true;
                        powerup2.position.y += 1;
                        break;
                    case "thanos":
                        this.mesh.material.color = new THREE.Color("0xffffff")
                        break;
                }
            }


        }
        this.collide({ x: 0, y: -1, z: 0 }, callback, true);
    }

    update(player) {
        this.collideLeft(player);
        this.collideRight(player);
        this.collideFront(player);
        this.collideBack(player);
        this.collideBottom(player);
    }
}