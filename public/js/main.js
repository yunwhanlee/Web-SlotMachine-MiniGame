//value
const CANVAS_W = 512, CANVAS_H = 512;

//#canvas
const app = new PIXI.Application({width: CANVAS_W, height: CANVAS_H});
document.body.appendChild(app.view);

//#sprites Enroll
const spr = {
	meme : PIXI.Sprite.from('../img/meme_mini.png')
};

//Add Sprites
app.stage.addChild(spr.meme);

//Set Sprites Property
spr.meme.position.set(CANVAS_W/2, CANVAS_H/2);
// spr.meme.rotation = Math.PI / 2;
spr.meme.width = 96;spr.meme.height = 96;
spr.meme.anchor.set(0.5, 0.5);

//Update
 let time = 0.0;
 app.ticker.add((cnt) => {
   time += cnt;
   const span = 50.0;
   const distance = 100.0;
   spr.meme.x = CANVAS_W/2 + Math.cos(time/span) * distance;
   spr.meme.y = CANVAS_H/2 + Math.sin(time/span) * distance;
   spr.meme.rotation = Math.PI * time/span;
 });