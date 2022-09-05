/** @type {HTMLCanvasElement} */
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

/** Creating and loading images for the background, player, enemy*/

const spaceBackground = new Image();
spaceBackground.src = 'assets/background/bg4a.png';

const rocks = new Image();
rocks.src = 'assets/background/bg4b.png';

const playerImg = new Image();
playerImg.src = 'assets/players/player_6.png';

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
    constructor(x, y, image, spriteWidth, spriteHeight){
        this.x = x;
        this.y = y;
        this.image = image;
        this.spriteWidth = spriteWidth; 
        this.spriteHeight = spriteHeight;
        this.width = spriteWidth * 0.2;
        this.height = spriteHeight * 0.2;
    }

    update(){

    }

    draw(){
        ctx.drawImage(this.image, 0, 0, this.spriteWidth, this. spriteHeight, this.x - this.width / 2 , this.y - this.height / 2, this.width,  this.height);
    }
}



/** This will happen once the page is loading */

window.addEventListener('load', function() {
    
    /** Initialize objects */

    /**backgounds */
    const playerImgWidh = 894;
    const playerImgHeight = 930;
    const stars = new Layer(spaceBackground, 0.5)
    const asteroits = new Layer(rocks, 1); 
    const background = [stars, asteroits];
    const player = new Player( 200, CANVAS_HEIGHT - playerImgHeight - 50 , playerImg, playerImgWidh, playerImgHeight);

    this.window.addEventListener('keydown', function(e) {

        if(e.key === 'w') player.y -= movementSpeed;
        if(e.key === 's') player.y += movementSpeed;
        if(e.key === 'a') player.x -= movementSpeed;
        if(e.key === 'd') player.x += movementSpeed;
    }, false);
    
    this.window.addEventListener('mousemove', function(e){
        let positionX = e.x - canvasPosition.x;
        let positionY = e.y - canvasPosition.y;
        player.x = positionX;
        player.y = positionY; 
        gameSpeed = e.clientY % 10;
        console.log(e);
    })
    
    /** Main game loop function */
    function animate(){
        
        /** Background animation */
        ctx.clearRect(0,0,CANVAS_WIDTH, CANVAS_HEIGHT);
        background.forEach(element => {
            element.update(); 
            element.draw();
        });
        player.draw();
        

        gameFrame++;
        requestAnimationFrame(animate);
    }
    animate();
});
