//value
const CANVAS_W = 816, CANVAS_H = 750;
const SYMBOL_CNT = 10; 
const SYMBOL_WIDTH = 96;
const slotTileStartPosX=235, slotTileStartPosY=-758 + 16
const BettingBtns = {
	posX : [230,360,490], coinV: [10,50,100]
}
/*
spd=20 & span=spd*0.23
spd=18 & span=spd*0.29
spd=15 & span=spd*0.425
spd=12 & span=spd*0.65
spd=7 & span=spd*1.95
spd=6 & span=spd*1.475 * SYMBOL_CNT
*/
const slotSpd = 18;
const span = slotSpd * (0.29 * SYMBOL_CNT);

const stopSlotDelaySpan = 50;
const posYOverDown = 16*5;

//Status
let isPullHandle = false;
let isFinish = false;
let isWin = false;

let isSlotStopList = [false,false,false];
let slotResultList = [null,null,null]
let time = 0.0;
let stopDelayTime = 0.0;

//Control Status value
let bettingAmount = 10;
let coin = 1000;
let award = 0;

//Gold Effect value
let effplayTime = 0;
let effTimes = [0,0,0];
let distances = [0,0,0];
const goldEFObjCnt = 30;
let goldEF = {
	list : [],
	randPosX : [],
	randPosY : [],
}

//Context
const animEnum = Object.freeze({handle : {idle : 0, pull : 1}});
const symbol = Object.freeze({
	seven : { n: SYMBOL_WIDTH * 2, award : 7},
	cherry : { n: SYMBOL_WIDTH * 1,  award : 3},
	bell : { n: SYMBOL_WIDTH * 0, award : 20},
	bar : { n: SYMBOL_WIDTH * -1,  award : 100},
	grape : { n: SYMBOL_WIDTH * -2, award : 10},
	heart : { n: SYMBOL_WIDTH * -3, award : 30},
	earth : { n: SYMBOL_WIDTH * -4,  award : 50},
	emerald : { n: SYMBOL_WIDTH * -5,  award : 77},
	diamond : { n: SYMBOL_WIDTH * -6 , award : 777},
	animal : { n: SYMBOL_WIDTH * -7, award : 33}
});

//#canvas
const app = new PIXI.Application({width: CANVAS_W, height: CANVAS_H});
document.body.appendChild(app.view);

//UI Style
const UI_BETTING_AMOUNT_TXT_STYLE = {fontFamily : '\"Lucida Console\", Monaco, monospace', fontWeight: "bold", fontSize: 20, fill: ["#e3fdf4","#feffc2"], lineHeight: 24,};
const UI_COIN_TXT_STYLE = {fontFamily : '\"Lucida Console\", Monaco, monospace', fontWeight: "bold", fontSize: 40, fill: ["#e3fdf4","#feffc2"]};
const UI_WIN_TXT_STYLE = {fontFamily : '\"Lucida Console\", Monaco, monospace', fontWeight: "bold", fontSize: 60, fill: ["#fff700","#ff1900"],stroke: "black", strokeThickness: 6};
const UI_WIN_GETCOIN_TXT_STYLE = {dropShadow: true, fill: ["#fff370","#fd0"],fillGradientStops: [0],fontSize: 29,fontStyle: "italic",fontWeight: "bold",strokeThickness: 5};


const UI = {
	symbolsTileSetImg: new PIXI.Sprite.from('../img/slot-symbols2.png'),
	symbolsScoreTxt: new PIXI.Text(`x7\n\nx3\n\nx20\n\nx100\n\nx10\n\nx30\n\nx50\n\nx77\n\nx777\n\nx33\n\nx2\n\nx5`, UI_BETTING_AMOUNT_TXT_STYLE),
	bettingTxt : new PIXI.Text(`ベッティング金額：${bettingAmount}`,UI_BETTING_AMOUNT_TXT_STYLE),
	coinTxt : new PIXI.Text(`💰コイン：${coin}`,UI_COIN_TXT_STYLE),
	winTxt : new PIXI.Text(`💱当たりました！💸`, UI_WIN_TXT_STYLE),
	getCoinTxt : new PIXI.Text(`9999コイン 習得`, UI_WIN_GETCOIN_TXT_STYLE),
}
const spr = {
	//single
	me: PIXI.Sprite.from('../img/meme_mini.png'),
	goldEF : PIXI.Sprite.from('../img/coin.png'),
	slotSymbolTileSet : [PIXI.Sprite.from('../img/slot-rollingSymbols.png')
						,PIXI.Sprite.from('../img/slot-rollingSymbols.png')
						,PIXI.Sprite.from('../img/slot-rollingSymbols.png')
	],
	slotMachine : PIXI.Sprite.from('../img/slot-machineBody.png'),
	slotHandle: {
		obj : PIXI.Sprite.from('../img/slot-machineHandle_Idle.png'),
		anim: [PIXI.Texture.from('../img/slot-machineHandle_Idle.png'), PIXI.Texture.from('../img/slot-machineHandle_Pull.png')]
	},
	//multy
	bettingBtnsSheet: new PIXI.Texture.from('../img/button_TileSet.png').baseTexture.setSize(215,223),
	foxSheet: new PIXI.Texture.from('../img/foxSheet64x64.png').baseTexture.setSize(896,448),
};

const btns = [{ 
		obj: setrscFromTileSet("sprite",107,0,107,73, spr.bettingBtnsSheet),//default
		idle: setrscFromTileSet("texture",0,0,107,73, spr.bettingBtnsSheet),
		pushed: setrscFromTileSet("texture",107,0,107,73, spr.bettingBtnsSheet)
	},{ 
		obj: setrscFromTileSet("sprite",0,74,107,73, spr.bettingBtnsSheet),
		idle: setrscFromTileSet("texture",0,74,107,73, spr.bettingBtnsSheet),
		pushed: setrscFromTileSet("texture",107,74,107,73, spr.bettingBtnsSheet)
	},{ 
		obj: setrscFromTileSet("sprite",0,148,107,73, spr.bettingBtnsSheet),
		idle: setrscFromTileSet("texture",0,148,107,73, spr.bettingBtnsSheet),
		pushed: setrscFromTileSet("texture",107,148,107,73, spr.bettingBtnsSheet)
	},
]

const foxW = 64;
const fox = {
	obj : setrscFromTileSet("sprite",0,0,foxW,foxW, spr.foxSheet),//default,
	idle: [
		setrscFromTileSet("texture",0,0,foxW,foxW, spr.foxSheet),
		setrscFromTileSet("texture",foxW*1,0,foxW,foxW, spr.foxSheet),
		setrscFromTileSet("texture",foxW*2,0,foxW,foxW, spr.foxSheet),
		setrscFromTileSet("texture",foxW*3,0,foxW,foxW, spr.foxSheet),
		setrscFromTileSet("texture",foxW*4,0,foxW,foxW, spr.foxSheet),
	],
	run: [
		setrscFromTileSet("texture",0,foxW*2,foxW,foxW, spr.foxSheet),
		setrscFromTileSet("texture",foxW*1,foxW*2,foxW,foxW, spr.foxSheet),
		setrscFromTileSet("texture",foxW*2,foxW*2,foxW,foxW, spr.foxSheet),
		setrscFromTileSet("texture",foxW*3,foxW*2,foxW,foxW, spr.foxSheet),
		setrscFromTileSet("texture",foxW*4,foxW*2,foxW,foxW, spr.foxSheet),
		setrscFromTileSet("texture",foxW*5,foxW*2,foxW,foxW, spr.foxSheet),
		setrscFromTileSet("texture",foxW*6,foxW*2,foxW,foxW, spr.foxSheet),
		setrscFromTileSet("texture",foxW*7,foxW*2,foxW,foxW, spr.foxSheet),
	]
}

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


//##Render
//--Sprite--
//非同期
PIXI.loader//BettingButtons
	.add('../img/button_TileSet.png')
	.load(()=>{
	//betting btns
	for(let i=0; i<btns.length;i++){
		btns[i].obj.position.set(BettingBtns.posX[i],495);
		app.stage.addChild(btns[i].obj);	
	}

	//fox Anim
	fox.obj = new PIXI.AnimatedSprite(fox.run);
	fox.obj.position.set(150,0);
	fox.obj.animationSpeed = 0.2;
	app.stage.addChild(fox.obj);
	fox.obj.play();
});



//symbolsTileSet
for(let i=0;i<3;i++){
	app.stage.addChild(spr.slotSymbolTileSet[i]);
	spr.slotSymbolTileSet[i].position.set(slotTileStartPosX + (i * 130), slotTileStartPosY); // 1st slot pos(235,250)
}

//me blurEffect
app.stage.addChild(spr.me);
spr.me.position.set(CANVAS_H - 30,0);
const blurFilter = new PIXI.filters.BlurFilter()
blurFilter.blur = 10;
spr.me.filters = [blurFilter];
console.log(spr.me);

//machine body
app.stage.addChild(spr.slotMachine);

//machine handle
spr.slotHandle.obj.position.set(670,300);
app.stage.addChild(spr.slotHandle.obj);



//--UI--
//Symbol Score Table
UI.symbolsTileSetImg.position.set(15,15);//img
UI.symbolsTileSetImg.scale.set(0.5, 0.5);
app.stage.addChild(UI.symbolsTileSetImg);
UI.symbolsScoreTxt.position.set(75,30);//scoreTxt
app.stage.addChild(UI.symbolsScoreTxt);

//BettingAmount
UI.bettingTxt.x = 220; UI.bettingTxt.y = 620;
app.stage.addChild(UI.bettingTxt);

//Coin
UI.coinTxt.x = 270; UI.coinTxt.y = 670;
app.stage.addChild(UI.coinTxt);

//Win
UI.winTxt.x = CANVAS_W/2; UI.winTxt.y = CANVAS_H/4;
UI.winTxt.anchor.x = 0.5;
UI.winTxt.anchor.y = 0.5;
UI.winTxt.visible = false;
app.stage.addChild(UI.winTxt);

UI.getCoinTxt.x = CANVAS_W/2; UI.getCoinTxt.y = CANVAS_H/3;
UI.getCoinTxt.anchor.x = 0.5;
UI.getCoinTxt.anchor.y = 0.5;
UI.getCoinTxt.visible = false;
app.stage.addChild(UI.getCoinTxt);

//focusBoxOutline
const graphics = new PIXI.Graphics();
graphics.lineStyle(3, 0xFEEB77, 1);
graphics.beginFill(0x650A5A, 0);
graphics.drawRect(228, 310, 372, 100);
graphics.endFill();
app.stage.addChild(graphics);

//##Event
//Pull Handle
spr.slotHandle.obj.interactive = true;
spr.slotHandle.obj.buttonMode = true;
spr.slotHandle.obj.on("click", ()=> {
	if(!isPullHandle){
		if(coin < bettingAmount) {
			alert("💰お金がないですね。さよなら"); 
			return;
		}
		coin -= bettingAmount;
		UI.coinTxt.text = `💰コイン：${coin}`;
		isPullHandle = true;
		spr.slotHandle.obj.texture = spr.slotHandle.anim[animEnum.handle.pull];
	}
	else{
		//スロットが全部止める前には、ハンドルコントロール禁止(BUG)
		if(stopDelayTime <= stopSlotDelaySpan * 3) return;
		//当たったら、日程時間(エフェクト再生)ハンドルコントール停止。
		if(isWin) return;

		isPullHandle = false;
		spr.slotHandle.obj.texture = spr.slotHandle.anim[animEnum.handle.idle];
		init();
	}
});

//Betting Buttons
let isPushed = false;
btns.forEach((ele, idx, b) => {
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

//##Update
//Slot Animation
app.ticker.add(cnt=>{
	time += cnt;
	// console.log("time : ", time);
	// console.log("stopDelayTime : ", stopDelayTime);
	spr.slotSymbolTileSet.forEach((slot, idx) => {
		//rolling Slots
		if(time < span){
			slot.y = slotTileStartPosY + time * slotSpd;
		}else{
			slot.y = slotTileStartPosY;
			if(idx === spr.slotSymbolTileSet.length-1) time = 0;
		}

		//Pull Handle
		if(isPullHandle){
			//止める
			if(stopDelayTime < stopSlotDelaySpan * 3) stopDelayTime += cnt;
			const stopValue = 0.85;
			spr.slotSymbolTileSet.forEach((slot, i) => {
				//Entry slot結果を初期化
				if(!isSlotStopList[i]) {isSlotStopList[i]=true; slotResultList[i] = getRandomSymbol()}
				//Animation 止めるslotの位置を↓にちょっとずれる
				if(stopDelayTime > stopSlotDelaySpan * stopValue * (i+1)) {
					slot.y = slotResultList[i] + posYOverDown;
					if(i == spr.slotSymbolTileSet.length-1) result();
				}
				//Animation ずれたslotの位置を戻す
				if(slot.y > slotResultList[i]) {slot.y -= stopDelayTime; }//console.log(slot.y , slotResultList[i]); 
				
			});
		}
	});
});

//EFFECT当たった！
app.ticker.add((cnt) => {
	const randPosMin = -200, randPosMax = +200;
	const speed = 6;
	const span = 5;
	const playTimeSpan = 90;
	if(effplayTime < playTimeSpan && isWin){
		// console.log("effplayTime:", effplayTime);
		goldEF.list.forEach(ele => ele.visible = true);
		UI.winTxt.visible = true;
		UI.getCoinTxt.visible = true;
		effplayTime += cnt / span;
		//set random
		let rx = getRandomInt(randPosMin, randPosMax);
		let ry = getRandomInt(randPosMin, randPosMax);

		for(let i=0; i<goldEFObjCnt;i++){
			if(goldEF.list.length < goldEFObjCnt){
				goldEF.list.push(PIXI.Sprite.from('../img/coin.png'));
				//set Status
				goldEF.list[i].width = 96; goldEF.list[i].height = 96;
				goldEF.list[i].anchor.set(0.5, 0.5);
				//randomPos
				goldEF.randPosX.push(rx);
				goldEF.randPosY.push(ry);
				//add Stage
				app.stage.addChild(goldEF.list[i]);
			}
		}
		//move
		effTimes[0] += cnt / speed;
		distances[0] += effTimes[0];
		if(effTimes[0] < span * 3){
			goldEF.list.forEach((ele, i) => {
				ele.x = CANVAS_W/2 + goldEF.randPosX[i] +  Math.cos(effTimes[0] + (i * 30)) * distances[0];
				ele.y = CANVAS_H/2 + goldEF.randPosY[i] +  Math.sin(effTimes[0] + (i * 30)) * distances[0];
			});
		}
		else{
			//reset
			effTimes[0]=0;
			distances[0]=0;
			rx = getRandomInt(randPosMin, randPosMax);
			ry = getRandomInt(randPosMin, randPosMax);
			console.log("rx :",rx, "ry : ",ry);
			goldEF.list.forEach((ele, i) => {
				ele.position.set(CANVAS_W/2, CANVAS_H/2);
				goldEF.randPosX[i] = rx;
				goldEF.randPosY[i] = ry;
			});
		}
	}
	else{
		isWin = false;
		goldEF.list.forEach(ele => ele.visible = false);
		UI.winTxt.visible = false;
		UI.getCoinTxt.visible = false;
	}
});

//FUNCTION------------------------------------------------------------------------------------------
function init(){
	time = 0;
	stopDelayTime = 0;
	isPullHandle = false;
	isSlotStopList[0] = false, slotResultList[0] = null;
	isSlotStopList[1] = false, slotResultList[1] = null;
	isSlotStopList[2] = false, slotResultList[2] = null;
	isFinish = false;
	UI.winTxt.visible = false;
	UI.getCoinTxt.visible = false;
};
function result(){
	if(!isFinish){
		console.log("RESULT");
		isFinish = true;
		console.log("result : ", slotResultList[0], slotResultList[1], slotResultList[2]);
		//当たりました！
		//1.ONELINE SAME
		if(slotResultList[0] == slotResultList[1]
				&& slotResultList[1] == slotResultList[2]
				&& slotResultList[2] == slotResultList[0] && !isWin
			){
			isWin = true;	effplayTime = 0;
			//add coin
			switch(slotResultList[0]){
				case symbol.seven.n:	award =	symbol.seven.award;		coin += bettingAmount * award;	break;
				case symbol.cherry.n:	award = symbol.cherry.award;	coin += bettingAmount * award;	break;
				case symbol.bell.n:		award = symbol.bell.award;		coin += bettingAmount * award;	break;
				case symbol.bar.n:		award = symbol.bar.award;		coin += bettingAmount * award;	break;
				case symbol.grape.n:	award = symbol.grape.award;		coin += bettingAmount * award;	break;
				case symbol.heart.n:	award = symbol.heart.award;		coin += bettingAmount * award;	break;
				case symbol.earth.n:	award = symbol.earth.award;		coin += bettingAmount * award;	break;
				case symbol.emerald.n:	award = symbol.emerald.award;	coin += bettingAmount * award;	break;
				case symbol.diamond.n:	award = symbol.diamond.award;	coin += bettingAmount * award;	break;
				case symbol.animal.n:	award = symbol.animal.award;	coin += bettingAmount * award;	break;
			}
		}
		//2.ANY, CHERRY, CHERRY
		else if(slotResultList[0]==symbol.cherry.n && slotResultList[1]==symbol.cherry.n
				|| slotResultList[0]==symbol.cherry.n && slotResultList[2]==symbol.cherry.n 
				|| slotResultList[1]==symbol.cherry.n && slotResultList[2]==symbol.cherry.n 
			){
			isWin = true;	effplayTime = 0;
			award = 2;
			coin += bettingAmount * award;
		}
		//3.SAME, SAME, CHERRY
		else if(slotResultList[0]==symbol.cherry.n && slotResultList[1]==slotResultList[2]
				|| slotResultList[1]==symbol.cherry.n && slotResultList[0]==slotResultList[2]
				|| slotResultList[2]==symbol.cherry.n && slotResultList[0]==slotResultList[1]
			){
			isWin = true;	effplayTime = 0;
			award = 5;
			coin += bettingAmount * award;
		}
		//UI結果表示
		UI.coinTxt.text = `💰コイン：${coin}`;
		UI.getCoinTxt.text = `${bettingAmount * award}円 習得 (X${award}倍)`;
	}
}

function getRandomSymbol(){ //start 2「SEVEN」 , end -7「ANIMAL」
	return (getRandomInt(-7, 2) * SYMBOL_WIDTH);
}

//calc------------------------------------------------------------------------------------------
function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}

