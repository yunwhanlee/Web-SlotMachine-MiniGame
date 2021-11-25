//value
const CANVAS_W = 816, CANVAS_H = 624;
const SYMBOL_CNT = 4; 
const SYMBOL_MASS_W = 96;
const slotTileStartPosX=235, slotTileStartPosY=-278
const slotSpeed = 15;//spd=15 & span=spd*1.7||| spd=12 & span=spd*2.6||| spd=7 & span=spd*7.8 ||| spd=6 & span=spd*5.9
const span = slotSpeed * 1.7;
const stopSlotDelaySpan = 50;
let isPullHandle = false;
let isSlotStop1 = false, slotResult1 = null;
let isSlotStop2 = false, slotResult2 = null;
let isSlotStop3 = false, slotResult3 = null;
let isFinish = false;

let bettingAmount = 10;
let coin = 1000;

const AnimEnum = Object.freeze({handle : {idle : 0, pull : 1}});
const Symbol = Object.freeze({bell : -96, cherry : 0, seven : 96, bar : 192});

//#canvas
const app = new PIXI.Application({width: CANVAS_W, height: CANVAS_H});
document.body.appendChild(app.view);

//#sprites Enroll
const UI = {
	coinTxt : new PIXI.Text(`コイン：${coin}`,{fontFamily : 'Arial', fontSize: 24, fill : 0xffffff, align : 'center'}),
	slotSymbolsImg: PIXI.Sprite.from('../img/slot-symbolsWithScore.png'),
}

const spr = {
	// meme : PIXI.Sprite.from('../img/meme_mini.png'),
	
	slotSymbolTileset : [PIXI.Sprite.from('../img/slot-symbolsBG.png'), PIXI.Sprite.from('../img/slot-symbolsBG.png'), PIXI.Sprite.from('../img/slot-symbolsBG.png')],
	slotMachine : PIXI.Sprite.from('../img/slot-machine4.png'),
	slotHandle: {
		obj : PIXI.Sprite.from('../img/slot-machineHandle_Idle.png'),
		anim: [PIXI.Texture.from('../img/slot-machineHandle_Idle.png'), PIXI.Texture.from('../img/slot-machineHandle_Pull.png')]
	}
};

//#Render
//--Sprite--
//symbolTileSet
for(let i=0;i<3;i++){
	app.stage.addChild(spr.slotSymbolTileset[i]);
	spr.slotSymbolTileset[i].position.set(slotTileStartPosX + (i * 130), slotTileStartPosY); // 1st slot pos(235,250)
}
//machine body
app.stage.addChild(spr.slotMachine);
//machine handle
app.stage.addChild(spr.slotHandle.obj);

//--UI--
//Symbol Score info
app.stage.addChild(UI.slotSymbolsImg);
UI.slotSymbolsImg.position.set(15,200);
UI.slotSymbolsImg.scale.set(0.5, 0.5);

//CoinTxt
app.stage.addChild(UI.coinTxt);
UI.coinTxt.x = 10; UI.coinTxt.y = 10;

// app.stage.addChild(spr.meme);

// //Set Sprites Property
// spr.meme.position.set(CANVAS_W/2, CANVAS_H/2);
// // spr.meme.rotation = Math.PI / 2;
// spr.meme.width = 96;spr.meme.height = 96;
// spr.meme.anchor.set(0.5, 0.5);

//init
function init(){
	time = 0;
	stopDelayTime = 0;
	isPullHandle = false;
	isSlotStop1 = false, slotResult1 = null;
	isSlotStop2 = false, slotResult2 = null;
	isSlotStop3 = false, slotResult3 = null;
	isFinish = false;
}

//#Event
spr.slotMachine.interactive = true;
spr.slotMachine.buttonMode = true;

spr.slotMachine.on('click', ()=> {
	if(!isPullHandle){
		coin -= bettingAmount;
		UI.coinTxt.text = `コイン：${coin}`;
		isPullHandle = true;
		spr.slotHandle.obj.texture = spr.slotHandle.anim[AnimEnum.handle.pull];
	}
	else{
		if(stopDelayTime <= stopSlotDelaySpan * 3) return;//途中で止めるエラー防止
		isPullHandle = false;
		spr.slotHandle.obj.texture = spr.slotHandle.anim[AnimEnum.handle.idle];
		init();
	}
});

//#Update
let time = 0.0;
let stopDelayTime = 0.0;
app.ticker.add(cnt=>{
	time += cnt;
	spr.slotSymbolTileset.forEach((slot, idx) => {
		//moving Slots
		if(time < span ){
			slot.y = slotTileStartPosY + time * slotSpeed;
		}
		else{
			slot.y = slotTileStartPosY;
			if(idx === spr.slotSymbolTileset.length-1) time = 0;
		}

		//Pull Stop
		if(isPullHandle){
			if(stopDelayTime < stopSlotDelaySpan * 3)
				stopDelayTime += cnt;
			spr.slotSymbolTileset.forEach((slot, idx) => {
				switch(idx){
					case 0:
						if(!isSlotStop1) {isSlotStop1=true; slotResult1 = calcSlotResult(); }
						if(stopDelayTime > stopSlotDelaySpan) slot.y = slotResult1 + 16;
						break;
					case 1:
						if(!isSlotStop2) {isSlotStop2=true; slotResult2 = calcSlotResult(); }
						if(stopDelayTime > stopSlotDelaySpan * 2) slot.y = slotResult2 + 16;
						break;
					case 2:
						if(!isSlotStop3) {isSlotStop3=true; slotResult3 = calcSlotResult(); }
						if(stopDelayTime > stopSlotDelaySpan * 3) {
							slot.y = slotResult3 + 16; 
							result();
						}
						break;
				}
			})
		}
	});
});

//  let time = 0.0;
//  app.ticker.add((cnt) => {
//    time += cnt;
//    const span = 50.0;
//    const distance = 100.0;
//    spr.meme.x = CANVAS_W/2 + Math.cos(time/span) * distance;
//    spr.meme.y = CANVAS_H/2 + Math.sin(time/span) * distance;
//    spr.meme.rotation = Math.PI * time/span;
//  });

//FUNCTION------------------------------------------------------------------------------------------
function result(){
	if(!isFinish){
		isFinish = true;
		let resTxt = "";
		console.log("result : ", slotResult1, slotResult2, slotResult3);
		if(slotResult1 === slotResult2 && slotResult2 === slotResult3 && slotResult1 === slotResult3){
			const befCoin = coin;
			switch(slotResult1){
				case Symbol.cherry:
					coin += bettingAmount * 3;
					break;
				case Symbol.seven:
					coin += bettingAmount * 7;
					break;
				case Symbol.bell:
					coin += bettingAmount * 20;
					break;
				case Symbol.bar:
					coin += bettingAmount * 100;
					break;
			}
			UI.coinTxt.text = `コイン：${coin}`;
			alert(`🍎🍎🍌🍌★★★★★★おめでとうございます！！★★★★★★🍓🍓🍉\n当たりました！！！！\n${coin - befCoin}を得ることができました！！！`);
		}
		else{
			console.log("OMG....");
		}
	}
}

function calcSlotResult(){
	return getRandomInt(0,SYMBOL_CNT) * SYMBOL_MASS_W - SYMBOL_MASS_W;;
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
}

