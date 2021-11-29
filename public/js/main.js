//value
const CANVAS_W = 816, CANVAS_H = 750;
const SYMBOL_CNT = 4; 
const SYMBOL_MASS_W = 96;
const slotTileStartPosX=235, slotTileStartPosY=-278
const BettingBtns = {
	posX : [230,360,490],
	coinV: [10,50,100]
}

const slotSpeed = 20;//spd=20 & span=spd*0.9 ||| spd=18 & span=spd*1.2 ||| spd=15 & span=spd*1.7||| spd=12 & span=spd*2.6||| spd=7 & span=spd*7.8 ||| spd=6 & span=spd*5.9
const span = slotSpeed * 0.9;

const stopSlotDelaySpan = 50;
const posYOverDownValue = 16*4;

let isPullHandle = false;
let isSlotStop1 = false, slotResult1 = null;
let isSlotStop2 = false, slotResult2 = null;
let isSlotStop3 = false, slotResult3 = null;
let isFinish = false;
let time = 0.0;
let stopDelayTime = 0.0;

//Control Status value
let bettingAmount = 10;
let coin = 1000;

//Obj value
const AnimEnum = Object.freeze({handle : {idle : 0, pull : 1}});
const SymbolIdx = Object.freeze({bar : -96, seven : 0, cherry : 96, bell : 192});

//#canvas
const app = new PIXI.Application({width: CANVAS_W, height: CANVAS_H});
document.body.appendChild(app.view);

//#resource
const UI_BETTING_AMOUNT_TXT_STYLE = {fontFamily : '\"Lucida Console\", Monaco, monospace', fontWeight: "bold", fontSize: 20, fill: ["#e3fdf4","#feffc2"]};
const UI_COIN_TXT_STYLE = {fontFamily : '\"Lucida Console\", Monaco, monospace', fontWeight: "bold", fontSize: 40, fill: ["#e3fdf4","#feffc2"]};

const UI = {
	bettingTxt : new PIXI.Text(`ベッティング金額：${bettingAmount}`,UI_BETTING_AMOUNT_TXT_STYLE),
	coinTxt : new PIXI.Text(`💰コイン：${coin}`,UI_COIN_TXT_STYLE),
	slotSymbolsImg: PIXI.Sprite.from('../img/slot-symbolsWithScore.png'),
}
const spr = {
	// meme : PIXI.Sprite.from('../img/meme_mini.png'),
	slotSymbolTileSet : [PIXI.Sprite.from('../img/slot-symbols.png'), PIXI.Sprite.from('../img/slot-symbols.png'), PIXI.Sprite.from('../img/slot-symbols.png')],
	slotMachine : PIXI.Sprite.from('../img/slot-machine4_2.png'),
	slotHandle: {
		obj : PIXI.Sprite.from('../img/slot-machineHandle_Idle.png'),
		anim: [PIXI.Texture.from('../img/slot-machineHandle_Idle.png'), PIXI.Texture.from('../img/slot-machineHandle_Pull.png')]
	},
	bettingBtnsTileSet: new PIXI.Texture.from('../img/button_TileSet.png').baseTexture.setSize(215,223),
};

const btn = [
	{ 
		obj: setrscFromTileSet("sprite",0,0,107,73, spr.bettingBtnsTileSet),
		idle: setrscFromTileSet("texture",0,0,107,73, spr.bettingBtnsTileSet),
		pushed: setrscFromTileSet("texture",107,0,107,73, spr.bettingBtnsTileSet)
	},
	{ 
		obj: setrscFromTileSet("sprite",0,74,107,73, spr.bettingBtnsTileSet),
		idle: setrscFromTileSet("texture",0,74,107,73, spr.bettingBtnsTileSet),
		pushed: setrscFromTileSet("texture",107,74,107,73, spr.bettingBtnsTileSet)
	},
	{ 
		obj: setrscFromTileSet("sprite",0,148,107,73, spr.bettingBtnsTileSet),
		idle: setrscFromTileSet("texture",0,148,107,73, spr.bettingBtnsTileSet),
		pushed: setrscFromTileSet("texture",107,148,107,73, spr.bettingBtnsTileSet)
	},
]

function setrscFromTileSet(type,x,y,w,h,tileset){
	const texture = new PIXI.Texture(tileset);
	switch(type){
		case "sprite":
			texture.frame = new PIXI.Rectangle(x,y,w,h);
			return new PIXI.Sprite(texture);
		case "texture":
			texture.frame = new PIXI.Rectangle(x,y,w,h);
			return texture;
	}
}

//#Render
//--Sprite--
//symbolTileSet
for(let i=0;i<3;i++){
	app.stage.addChild(spr.slotSymbolTileSet[i]);
	spr.slotSymbolTileSet[i].position.set(slotTileStartPosX + (i * 130), slotTileStartPosY); // 1st slot pos(235,250)
}
//machine body
app.stage.addChild(spr.slotMachine);
//machine handle
spr.slotHandle.obj.position.set(670,300);
app.stage.addChild(spr.slotHandle.obj);
//btn1
btn[0].obj.position.set(230,495);
// btn.first.obj.texture = btn.first.pushed
app.stage.addChild(btn[0].obj);
//btn2
btn[1].obj.position.set(360,495);
app.stage.addChild(btn[1].obj);
//btn3
btn[2].obj.position.set(490,495);
app.stage.addChild(btn[2].obj);


//--UI--
//Symbol Score info
UI.slotSymbolsImg.position.set(15,15);
UI.slotSymbolsImg.scale.set(0.5, 0.5);
app.stage.addChild(UI.slotSymbolsImg);

//CoinTxt
UI.bettingTxt.x = 220; UI.bettingTxt.y = 620;
app.stage.addChild(UI.bettingTxt);
UI.coinTxt.x = 270; UI.coinTxt.y = 670;
app.stage.addChild(UI.coinTxt);

// app.stage.addChild(spr.meme);

// //Set Sprites Property
// spr.meme.position.set(CANVAS_W/2, CANVAS_H/2);
// // spr.meme.rotation = Math.PI / 2;
// spr.meme.width = 96;spr.meme.height = 96;
// spr.meme.anchor.set(0.5, 0.5);

//#Event
//Handle
spr.slotHandle.obj.interactive = true;
spr.slotHandle.obj.buttonMode = true;
spr.slotHandle.obj.on("click", ()=> {
	if(coin < bettingAmount) {
		alert("💰お金がないですね。さよなら"); 
		return;
	}

	if(!isPullHandle){
		coin -= bettingAmount;
		UI.coinTxt.text = `💰コイン：${coin}`;
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
//Betting Buttons
let isPushed = false;
btn.forEach((ele, idx, b) => {
	console.log(ele);
	ele.obj.interactive = true;
	ele.obj.buttonMode = true;
	ele.obj.on("click", (e)=>{
		if(!isPullHandle){
			//名前で区切れないので、位置座標で分けました。
			console.log(e.target.transform.position.x);
			const targetPosX = e.target.transform.position.x;
			const n = BettingBtns.posX.indexOf(targetPosX);
			b.filter((e,i) => {
				if(i == n){
					e.obj.texture =  e.pushed;
					bettingAmount = BettingBtns.coinV[i];
					UI.bettingTxt.text = `ベッティング金額：${bettingAmount}`;
				}else{
					e.obj.texture =  e.idle;
				}
			});
		}
	})
});

//#Update
app.ticker.add(cnt=>{
	time += cnt;
	console.log("stopDelayTime : ", stopDelayTime);
	spr.slotSymbolTileSet.forEach((slot, idx) => {
		//moving Slots
		if(time < span){
			slot.y = slotTileStartPosY + time * slotSpeed;
		}
		else{
			slot.y = slotTileStartPosY;
			if(idx === spr.slotSymbolTileSet.length-1) time = 0;
		}
		//Pull Handle
		if(isPullHandle){
			if(stopDelayTime < stopSlotDelaySpan * 3)
				stopDelayTime += cnt;
			spr.slotSymbolTileSet.forEach((slot, idx) => {
				switch(idx){
					case 0:
						if(!isSlotStop1) {isSlotStop1=true; slotResult1 = getRandomSlot();}
						if(stopDelayTime > stopSlotDelaySpan * 1) slot.y = slotResult1 + posYOverDownValue;
						if(slot.y > slotResult1){// console.log(slot.y , slotResult1); 
							slot.y -= stopDelayTime;
						}//anim
						break;
					case 1:
						if(!isSlotStop2) {isSlotStop2=true; slotResult2 = getRandomSlot(); }
						if(stopDelayTime > stopSlotDelaySpan * 2) slot.y = slotResult2 + posYOverDownValue;
						if(slot.y > slotResult2){// console.log(slot.y , slotResult2); 
							slot.y -= stopDelayTime;
						}//anim
						break;
					case 2:
						if(!isSlotStop3) {isSlotStop3=true; slotResult3 = getRandomSlot(); }
						if(stopDelayTime > stopSlotDelaySpan * 2.5) {slot.y = slotResult3 + posYOverDownValue; result();}
						if(slot.y > slotResult3){// console.log(slot.y , slotResult3); 
							slot.y -= stopDelayTime;
						}//anim
						break;
				}
			});
			
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
function init(){
	time = 0;
	stopDelayTime = 0;
	isPullHandle = false;
	isSlotStop1 = false, slotResult1 = null;
	isSlotStop2 = false, slotResult2 = null;
	isSlotStop3 = false, slotResult3 = null;
	isFinish = false;
};

function result(){
	if(!isFinish){
		isFinish = true;
		let resTxt = "";
		console.log("result : ", slotResult1, slotResult2, slotResult3);
		if(slotResult1 === slotResult2 && slotResult2 === slotResult3 && slotResult3 === slotResult1){
			const befCoin = coin;
			switch(slotResult1){//get coin
				case SymbolIdx.cherry:
					coin += bettingAmount * 3;
					break;
				case SymbolIdx.seven:
					coin += bettingAmount * 7;
					break;
				case SymbolIdx.bell:
					coin += bettingAmount * 20;
					break;
				case SymbolIdx.bar:
					coin += bettingAmount * 100;
					break;
			}
			UI.coinTxt.text = `💰コイン：${coin}`;
			alert(`🍎🍎🍌🍌★★★★★★おめでとうございます！！★★★★★★🍓🍓🍉\n${slotResult1}が当たりました！！！！\n${coin - befCoin}を得ることができました！！！`);
		}
		else{
			console.log("OMG....");
		}
	}
}

function getRandomSlot(){
	return getRandomInt(0,SYMBOL_CNT) * SYMBOL_MASS_W - SYMBOL_MASS_W;
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}

