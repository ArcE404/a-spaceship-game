/** @type {HTMLCanvasElement} */

/**TODO --This list is either here because I do not have time or my mental abilities--
 * - Object pool (must work for any array object), need some reviews and some refactoring
 * - I really need to refactor a lot of things. The variables are a mess, like, the objects need to grab the "shared" variables from the Game class, not from outside.
 * - I dont know what is happening with the explotion animation, but it needs to be fix. How it is now really bugs me. 
 */

const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext('2d');

/** Resolution of the game */

const  CANVAS_WIDTH = canvas.width = 400;
const  CANVAS_HEIGHT = canvas.height = 900;
let canvasPosition = canvas.getBoundingClientRect();

/** Frames and velocity */

let gameFrame = 0;
let staggerFrames = 2;
let gameSpeed = 7 ;
let movementSpeed = 50;
let lastTime = 1;

/** Creating and loading images for the background, player, enemy*/

const spaceBackground = new Image();
spaceBackground.src = 'assets/background/bg4a.png';

const rocks = new Image();
rocks.src = 'assets/background/bg4b.png';

const playerImg = new Image();
playerImg.src = 'assets/players/player_6.png';

const enemy1Img = new Image(); 
enemy1Img.src = 'assets/enemies/en_19.png';

const playerNormalProjectileImg = new Image();
playerNormalProjectileImg.src = 'assets/shoots/shoot_5.png';



/** test space */

/** end test space */



class Game {
    constructor(ctx, width, height, gameFrame, staggerFrames){
        this.ctx = ctx;
        this.width = width; 
        this.height = height;
        this.enemies = [];
        this.enemyInterval = 1000;
        this.enemyTimer = 0;
        this.gameFrame = gameFrame;
        this.staggerFrames = staggerFrames;
    }
    
    update(object){
        if(object.length){
            object.forEach(object => object.update());
        }else{
            object.update();
        }
    }
    
    timeCounterEnemies(deltatime, enemyPool){
        if(this.enemyTimer > this.enemyInterval){
            this.#addNewEnemy(enemyPool);
            this.enemyTimer = 0;
        }else{
            this.enemyTimer += deltatime;
        }
    }
    
    draw(object){
        if(object.length){
            object.forEach(object => object.draw());
        }else{
            object.draw();
        }
    }


    detectCollition(player, enemies, projectiles, explotions){
        var playerHitbox = {x : player.x - player.width / 4, y : player.y - player.height / 4, width : player.width / 2, height : player.height / 2};
        enemies.forEach((enemy) => {
            var enemeyHitbox = {x : enemy.x - enemy.width / 4, y : enemy.y - enemy.height / 4, width : enemy.width / 2, height : enemy.height / 2};

            this.analiseCollition(playerHitbox, enemeyHitbox);

            projectiles.forEach((projectile) => {
                var projectileHitbox = {x : projectile.x - projectile.width / 4, y : projectile.y - projectile.height / 4, width : projectile.width / 2, height : projectile.height / 2};
                if(this.analiseCollition(enemeyHitbox, projectileHitbox)){
                    var explotion = explotions.getDeletedElement();
                    explotion.x = enemy.x;
                    explotion.y = enemy.y;
                    explotions.releaseElement(explotion);
                    enemy.alive = false;
                    projectile.alive = false;
                }
            });

        })
    }

    
    setGameframe(gameFrame){
        this.gameFrame = gameFrame;
    }
    
    #addNewEnemy(enemyPool){
        var enemy = enemyPool.getDeletedElement();
        if (enemy){
            enemyPool.releaseElement(enemy);
        }
    }

    analiseCollition(hitbox1, hitbox2){
        if(hitbox1.x < hitbox2.x  + hitbox2.width  && 
            hitbox1.x + hitbox1.width > hitbox2.x   &&
            hitbox1.y < hitbox2.y  + hitbox2.height &&
            hitbox1.y + hitbox1.height > hitbox2.y
         ){
            return true;
         }
         return false;
    }
}

/** Layer class for the parallax efect.
 * @image the image that the layer will render
 * @timeModifier how fast the layer will move
 */

class Layer {
constructor(image, timeModifier){
    this.x = 0;
    this.y = 0;
    this.height = CANVAS_HEIGHT;
    this.width = CANVAS_WIDTH;
    this.image = image;
        this.timeModifier = timeModifier;
        this.speed =  gameSpeed * this.timeModifier;
    }

    update(){
        this.speed = gameSpeed * this.timeModifier;
        if(this.y >= this.height){
            this.y = 0;
        }
        this.y = Math.floor(this.y + this.speed);
        //this.y = gameFrame * this.speed % this.height 
    }
    draw(){
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height); 
        ctx.drawImage(this.image, this.x, this.y - this.height, this.width, this.height); 
    }
}


/** Player class
 * @x the initial x position
 * @y the initial y position
 * @image the image (spaceship) of the player
 * @spriteWidth the width of the image
 * @spriteHeight the width of the image
 * @game the class of the game
 */

class Player {
    constructor(x, y, image, spriteWidth, spriteHeight, game){
        this.game = game;
        this.x = x;
        this.y = y;
        this.image = image;
        this.spriteWidth = spriteWidth; 
        this.spriteHeight = spriteHeight;
        this.width = spriteWidth * 0.15;
        this.height = spriteHeight * 0.15;
    }

    update(x, y){
        this.x = x;
        this.y =  y;
    }

    draw(){
        this.game.ctx.drawImage(this.image, 0, 0, this.spriteWidth, this.spriteHeight, this.x - this.width / 2 , this.y - this.height / 2, this.width,  this.height);
        this.game.ctx.strokeRect(this.x - this.width / 4 , this.y - this.height / 4, this.width / 2 , this.height / 2);
    }
}

class Enemy {
    constructor(image, spriteWidth, spriteHeight, game){
        this.game = game;
        this.x = this.game.width; 
        this.y = Math.random() * this.game.height;
        this.alive = false;
        this.image = image;
        this.spriteWidth = spriteWidth; 
        this.spriteHeight = spriteHeight;
        this.width = spriteWidth * 0.15;
        this.height = spriteHeight * 0.15;
    }

    update(){
        if(-this.game.width  > this.x){
            this.alive = false;
        }else{
            this.x -= 2;
        }
    }

    draw(){
        this.game.ctx.drawImage(this.image, 0, 0, this.spriteWidth, this. spriteHeight, this.x - this.width / 2 , this.y - this.height / 2, this.width,  this.height);
        this.game.ctx.strokeRect(this.x - this.width / 4 , this.y - this.height / 4, this.width / 2 , this.height / 2);
    }
}

class Projectile {
    constructor(image, spriteWidth, spriteHeight, game, x = 50, y = 500, shootSpeed = 10) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.alive = false;
        this.image = image;
        this.spriteWidth = spriteWidth; 
        this.spriteHeight = spriteHeight;
        this.width = spriteWidth * 0.10;
        this.height = spriteHeight * 0.10;
        this.shootSpeed = shootSpeed;
    }

    update(){
        if(this.y < 0){
            this.alive = false;
        }else{
            this.y -= this.shootSpeed;
        }
    }

    draw(){
        this.game.ctx.drawImage(this.image, 0, 0, this.spriteWidth, this. spriteHeight, this.x - this.width / 2 , this.y - this.height / 2, this.width,  this.height);
        this.game.ctx.strokeRect(this.x - this.width / 4 , this.y - this.height / 4, this.width / 2 , this.height / 2);
    }
}


class ObjectPool {
    #poolArray
    resetFunction = () => {}
    constructorFunction = () => {}
    constructor(
      constructorFunction,
      resetFunction = (obj) => obj,
      initialSize = 1000,
      game
    ) {
      this.resetFunction = resetFunction;
      this.constructorFunction = constructorFunction;
      this.#poolArray = new Array(initialSize)
        .fill(0)
        .map(() => this.createElement());
        this.game = game;
      this.aliveElements = new Array(initialSize).fill(0);  
    }

    createElement() {
      const data = this.resetFunction(this.constructorFunction())
      return data;
    }

    updateAndDrawAliveElements() {  
        this.aliveElements = [];
      for (let i = 0; i < this.#poolArray.length; i++) {
        if (this.#poolArray[i].alive === true) {
            this.game.update(this.#poolArray[i]);
            this.game.draw(this.#poolArray[i]);
            this.aliveElements.push(this.#poolArray[i]);
        }
      }
    }

    getAliveElements(){
        return this.aliveElements;
    }

    getDeletedElement(){
        for (let i = 0; i < this.#poolArray.length; i++) {
            if (!this.#poolArray[i].alive) {
                return this.#poolArray[i];
            }
          }
    }
    releaseElement(element) {
        element.alive = true;
        this.resetFunction(element)
    }
  }



  class Explotion{
    constructor(spriteWidth, spriteHeight, game, x = 50, y = 50, image = new Image()) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.alive = false;
        this.image = image;
        this.image.src = 'assets/explosion/exb_000.png';
        this.spriteWidth = spriteWidth; 
        this.spriteHeight = spriteHeight;
        this.width = spriteWidth * 0.20;
        this.height = spriteHeight * 0.20;
        this.imageNumber = 0;
    }

    update(){
        if(this.imageNumber < 10 ){
            this.image.src = `assets/explosion/exb_00${this.imageNumber}.png`;
        }else if(this.imageNumber <= 42){
            this.image.src = `assets/explosion/exb_0${this.imageNumber}.png`;
        }else {
            this.alive = false;
        }
        this.imageNumber++;
        this.y += 10;
    }

    draw(){
        this.game.ctx.drawImage(this.image, 0, 0, this.spriteWidth, this. spriteHeight, this.x - this.width / 2 , this.y - this.height / 2, this.width,  this.height);
    }
  }



/** This will happen once the page is loading */

window.addEventListener('load', function() {
    
    /** Initialize objects */

    
    /** image sizes*/
    const playerImgWidh = 894;
    const playerImgHeight = 930;
    const enemyImgWidh = 651;
    const enemyImgHeight = 612;
    const nomalProjectileWidh = 194;
    const normalProjectileHeight = 888;
    const explosionImgWidh = 697;
    const explosionImgHeight = 620;
    
    /**objects*/

    const stars = new Layer(spaceBackground, 0.5);
    const asteroits = new Layer(rocks, 1); 
    const background = [stars, asteroits];
    const game = new Game(ctx, canvas.width, canvas.height, gameFrame, staggerFrames);
    const player = new Player( 200, game.height - playerImgHeight - 50 , playerImg, playerImgWidh, playerImgHeight, game);
    const playerNomalShot = new Projectile(playerNormalProjectileImg,nomalProjectileWidh,normalProjectileHeight,game,-50, -50);
    const explotion = new Explotion(explosionImgWidh, explosionImgHeight, game);

    /**Object pools */
    
    const createEnemyFunc = () => new Enemy(enemy1Img,enemyImgWidh, enemyImgHeight, game);
    const resetEnemyFunc = (enemy) => {
        enemy.y = Math.random() * game.height;
        enemy.x = game.width; 
        return enemy
    };
    const enemyPool = new ObjectPool(createEnemyFunc, resetEnemyFunc, 20, game);

    const createNormalProjectileFunc = () => new Projectile(playerNormalProjectileImg, nomalProjectileWidh, normalProjectileHeight, game);
    const resetNormalProjectileFunc = (shoot) => {
        shoot.x = player.x;
        shoot.y = player.y;
        return shoot;
    };

    const normalProjectilePool = new ObjectPool(createNormalProjectileFunc, resetNormalProjectileFunc, 10, game);


    const createExplotionFunc = () => new Explotion(explosionImgWidh, explosionImgHeight, game);
    const resetExplotionFunc = (explotion) => {
        explotion.imageNumber = 0;
        explotion.image.src = `assets/explosion/exb_000.png`;
        return explotion;
    };

    const explotionsPool = new ObjectPool(createExplotionFunc, resetExplotionFunc, 20, game);


    /* Events listeners */

    /**space ship movement */
    this.window.addEventListener('mousemove', function(e){
        let positionX = e.x - canvasPosition.x;
        let positionY = e.y - canvasPosition.y;
        player.update(positionX, positionY);
    });

    /** shoot event */
    this.window.addEventListener('click', function(e){
        var shoot = normalProjectilePool.getDeletedElement();
        normalProjectilePool.releaseElement(shoot);
    });


    
    /** Main game loop function */
    function animate(timeStamp){
        /** Background animation */

        ctx.clearRect(0,0,CANVAS_WIDTH, CANVAS_HEIGHT);
        const deltatime = timeStamp - lastTime;
        lastTime = timeStamp;

        game.update(background);
        game.draw(background);

        
        explotionsPool.updateAndDrawAliveElements();

        normalProjectilePool.updateAndDrawAliveElements();


        game.draw(player);

        enemyPool.updateAndDrawAliveElements();
        game.timeCounterEnemies(deltatime, enemyPool);

        game.detectCollition(player, enemyPool.getAliveElements(), normalProjectilePool.getAliveElements(), explotionsPool);

        game.setGameframe(gameFrame++);
        requestAnimationFrame(animate);
    }
    animate(0);
});