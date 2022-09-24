/** @type {HTMLCanvasElement} */

/**TODO --This list is either here because I do not have time or my mental abilities--
 * - Object pool (must work for any array object), need some reviews and some refactoring
 */

const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext('2d');

/** Resolution of the game */

const  CANVAS_WIDTH = canvas.width = 400;
const  CANVAS_HEIGHT = canvas.height = 900;
let canvasPosition = canvas.getBoundingClientRect();

/** Frames and velocity */

let gameFrame = 0;
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
 * @
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

    update(){
    }

    draw(){
        this.game.ctx.drawImage(this.image, 0, 0, this.spriteWidth, this. spriteHeight, this.x - this.width / 2 , this.y - this.height / 2, this.width,  this.height);
    }
}


class Game {
    constructor(ctx, width, height){
        this.ctx = ctx;
        this.width = width; 
        this.height = height;
        this.enemies = [];
        this.enemyInterval = 1000;
        this.enemyTimer = 0;
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

    #addNewEnemy(enemyPool){
        var enemy = enemyPool.getDeletedElement();
        if (enemy){
            enemyPool.releaseElement(enemy);
        }
    }
}

class Enemy {
    constructor(image, spriteWidth, spriteHeight, game){
        this.game = game;
        this.x = this.game.width; 
        this.y = Math.random() * this.game.height;
        this.alive = true;
        this.image = image;
        this.spriteWidth = spriteWidth; 
        this.spriteHeight = spriteHeight;
        this.width = spriteWidth * 0.15;
        this.height = spriteHeight * 0.15;
    }

    update(){
        this.x -= 2;
        if(-this.game.width  > this.x){
            this.alive = false;
            this.x = this.game.width
        }
    }

    draw(){
        this.game.ctx.drawImage(this.image, 0, 0, this.spriteWidth, this. spriteHeight, this.x - this.width / 2 , this.y - this.height / 2, this.width,  this.height);
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
    ) {
      this.resetFunction = resetFunction;
      this.constructorFunction = constructorFunction;
      this.#poolArray = new Array(initialSize)
        .fill(0)
        .map(() => this.createElement());
    }

    createElement() {
      const data = this.resetFunction(this.constructorFunction())
      return data;
    }

    getElement(game) {
      for (let i = 0; i < this.#poolArray.length; i++) {
        if (this.#poolArray[i].alive === true) {
            game.update(this.#poolArray[i]);
            game.draw(this.#poolArray[i]);
        }
      }
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



/** This will happen once the page is loading */

window.addEventListener('load', function() {
    
    /** Initialize objects */

    /**backgounds */
    const game = new Game(ctx, canvas.width, canvas.height);
    const playerImgWidh = 894;
    const playerImgHeight = 930;
    const enemyImgWidh = 651;
    const enemyImgHeight = 612;
    const stars = new Layer(spaceBackground, 0.5)
    const asteroits = new Layer(rocks, 1); 
    const background = [stars, asteroits];
    const player = new Player( 200, game.height - playerImgHeight - 50 , playerImg, playerImgWidh, playerImgHeight, game);

    const createEnemyFunc = () => new Enemy(enemy1Img,enemyImgWidh, enemyImgHeight, game);
    const resetEnemyFunc = (enemy) => {return enemy};
    const enemyPool = new ObjectPool(createEnemyFunc, resetEnemyFunc, 20);

    this.window.addEventListener('mousemove', function(e){
        let positionX = e.x - canvasPosition.x;
        let positionY = e.y - canvasPosition.y;
        player.x = positionX;
        player.y = positionY; 
    })
    
    /** Main game loop function */
    function animate(timeStamp){
        /** Background animation */
        ctx.clearRect(0,0,CANVAS_WIDTH, CANVAS_HEIGHT);
        const deltatime = timeStamp - lastTime;
        lastTime = timeStamp;
        
        game.update(background, deltatime);
        game.draw(background);
        game.draw(player);
        enemyPool.getElement(game);
        game.timeCounterEnemies(deltatime, enemyPool)
        gameFrame++;
        requestAnimationFrame(animate);
    }
    animate(0);
});
