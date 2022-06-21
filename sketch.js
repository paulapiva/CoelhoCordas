const Engine = Matter.Engine;
const Render = Matter.Render;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Constraint = Matter.Constraint;
const Body = Matter.Body;
const Composites = Matter.Composites;
const Composite = Matter.Composite;

let engine;
let world;
var fruit, ground;
var rope, rope2, rope3;
var fruit_con, fruit_con2, fruit_con3;

//variáveis de imagens
var bg_img;
var food;
var rabbit;

//botoes
var button,button2,button3;
var mute_btn;

//sprites
var bunny;
var blink, eat, sad;

var fr;

//variaveis sons
var bk_song;
var cut_sound;
var sad_sound;
var eating_sound;
var air;

//Variáveis tela
var canW, canH, isMobile;

function preload() {
  bg_img = loadImage("img/background.png");
  food = loadImage("img/melon.png");
  rabbit = loadImage("img/Rabbit-01.png");

  //animações
  blink = loadAnimation("img/blink_1.png", "img/blink_2.png", "img/blink_3.png");
  eat = loadAnimation("img/eat_0.png","img/eat_1.png","img/eat_2.png","img/eat_3.png","img/eat_4.png");
  sad = loadAnimation("img/sad_1.png", "img/sad_2.png", "img/sad_3.png");

  //reprodução das animações
  blink.playing = true;
  eat.playing = true;
  sad.playing = true;
  
  //retirada loop
  sad.looping = false;
  eat.looping = false;

  //sons
  bk_song = loadSound("sons/sound1.mp3");
  sad_sound = loadSound("sons/sad.wav");
  cut_sound = loadSound("sons/rope_cut.mp3");
  eating_sound = loadSound("sons/eating_sound.mp3");
  //air = loadSound("sons/air.wav");
}

function setup() {
  //verificar se jogo está rodando em mobile ou PC
  //navigator.userAgent não é mto confiável, pois é string modificável pelo usuário
  //depende da versão do navegador
  var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    //tamanho da tela
    canW = displayWidth;
    canH = displayHeight;
    //add 80 para caber na largura da tela
    createCanvas(displayWidth + 80, displayHeight);
  } else {
    //tamanho da janela interna navegador
    canW = windowWidth;
    canH = windowHeight;
    createCanvas(windowWidth, windowHeight);
  }
  frameRate(80);

  engine = Engine.create();
  world = engine.world;

  bk_song.play();
  bk_song.setVolume(0.5);
  
  //criação corpo fruta
  var optF={
    density:.001,
  }
  fruit = Bodies.circle(width/2-30, height/2+50, 20, optF);
  
  ground = new Ground(width/2, canH-2, width, 5);

  //criação cordas
  rope = new Rope(8, { x: width/2-180, y: 60 });//elos, pointA
  rope2 = new Rope(7, { x: width/2+60, y: 40 });
  rope3 = new Rope(4, { x: width/2+160, y: 210 });
  Matter.Composite.add(rope.body, fruit); //nome composite, corpo
  //criação ligação
  fruit_con = new Link(rope, fruit);
  fruit_con2 = new Link(rope2, fruit);
  fruit_con3 = new Link(rope3, fruit);

  //criação Botões
  button = createImg("img/cut_btn.png");
  button.position(width/2-200, 60);
  button.size(50, 50);
  button.mouseClicked(drop);
  button2 = createImg("img/cut_btn.png");
  button2.position(width/2+30, 35);
  button2.size(50, 50);
  button2.mouseClicked(drop2);
  button3 = createImg("img/cut_btn.png");
  button3.position(width/2+120, 185);
  button3.size(50, 50);
  button3.mouseClicked(drop3);
  //button3.touchStarted(drop3)
  /*
  baloon = createImg("img/balloon.png");
  baloon.position(10, 250);
  baloon.size(150, 100);
  baloon.mouseClicked(airblow);*/

  mute_btn = createImg("img/mute.png");
  mute_btn.position(20, 20);
  mute_btn.size(50, 50);
  mute_btn.mouseClicked(mute);

  //atraso na velocidade de reprodução
  blink.frameDelay = 20;
  eat.frameDelay = 20;

  //criação sprite coelho
  bunny = createSprite(width/2, canH-90, 100, 100);//pos.x modificada
  bunny.scale = 0.2;
  //animações do coelho
  bunny.addAnimation("blinking", blink);
  bunny.addAnimation("eating", eat);
  bunny.addAnimation("crying", sad);
  //bunny.changeAnimation("blinking");

  rectMode(CENTER);
  ellipseMode(RADIUS);
  imageMode(CENTER);
}

function draw() {
  background(51);
  image(bg_img, width/2, height/2, canW+80, canH);
  //image(bg_img, 0, 0, 490, 690);

   //imagem fruta
  push();
  imageMode(CENTER);
  if (fruit != null) {//para verificar q a forma existe antes de ser desenhada
    image(food, fruit.position.x, fruit.position.y, 70, 70);
  }
  pop();

  //exibição elementos
  rope.display();
  rope2.display();
  rope3.display();
  ground.display();
  drawSprites();

//usando o retorno da função para decidir qual animação usar
  //FRUTA colidiu com o COELHO = coelho comendo
  if (collide(fruit, bunny) == true) {
    bunny.changeAnimation("eating");
    eating_sound.play();
  }
  //FRUTA colidiu com o CHÃO = coelho chorando
  //Fruta estiver na tela em y<650 tocará sons
  //fará o som tocar somente uma vez
  if (fruit != null && fruit.position.y >= 650) {
    bunny.changeAnimation("crying");
    bk_song.stop();
    sad_sound.play();
    fruit = null;
  }

  
  
  //atualização
  Engine.update(engine);
}

//função quebra das cordas
function drop() {
  cut_sound.play();
  rope.break();
  fruit_con.detach();
  fruit_con = null;
}
function drop2() {
  cut_sound.play();
  rope2.break();
  fruit_con2.detach();
  fruit_con2 = null;
}
function drop3() {
  cut_sound.play();
  rope3.break();
  fruit_con3.detach();
  fruit_con3 = null;
}
function keyPressed() {
  if (keyCode == LEFT_ARROW) {
    airblow();
  }
}

//função de colisão
function collide(body, sprite) { //fruta,coelho
  if (body != null) {//verifica se há fruta pendurada
    //comando dist verifica a distancia entre os dois corpos nas posições x e y
    var d = dist(
      body.position.x, body.position.y,
      sprite.position.x, sprite.position.y
    );

    //dist sendo menor que 80 remover a fruta da cena
    if (d <= 80) {
      World.remove(engine.world, fruit);
      fruit = null;
      //retorno de função, usado para passar essa informação para fora      
      return true;
    } else {
      return false;
    }
  }
}

//aplicar força ao soprador ar
function airblow() {
  Matter.Body.applyForce(fruit, { x: 0, y: 0 }, { x: 0.01, y: 0 });
  air.play();
}

function mute() {
  //testar se o som já está tocando
  if (bk_song.isPlaying()) {
    bk_song.stop();
  } else {
    bk_song.play();
    setVolume(0.5)
  }
}
