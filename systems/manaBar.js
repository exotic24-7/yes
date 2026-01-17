
function calculateManaCost(wave, type, waveTime){
    // !!!!!!
    //IF EDITED, MAKE SURE TO COPY IN BOTH CLIENT & SERVER! SAME FUNCTION NAME

    //WaveTime is in terms of proportions of total wave time
    //0 = beginning of wave, 1 = end of wave, 4 = next wave
    let waveUsed = wave;
    if (waveUsed < 240){
        waveUsed = 240;
    }
    if (type == "grace"){
        let baseCost = (1.014 ** (waveUsed - 240)) * 500;
        let costMultiplier = (waveTime - 1) / 3 * 0.7 + 0.3;
        return baseCost * costMultiplier;
    }
    if (type == "time"){
        let baseCost = (1.014 ** (waveUsed - 240)) * 400;
        let costMultiplier = Math.max(0.5, (1 - waveTime / 2))
        return baseCost * costMultiplier;
    }
	if (type == "divergence"){
        return (1.014 ** (waveUsed - 240)) * 250;
    }
}

class ManaBar {
	constructor(type) {
		this.maxMana = 0;
		this.mana = 0;
		this.type = type;
		this.calculateDimensions(type);

		this.hasInit = false;

		this.render = {
			xp: this.xp,
			level: this.level,
			initAnimation: 0
		};
	}
	calculateDimensions(type) {
		this.dimensions = {
			x: canvas.w * (.80 + .05),
			y: canvas.h * .85,
			w: canvas.w * (.17 + .04 / 2 - .05),
			h: canvas.h * .03,
			roundness: canvas.w, // more than enough to trigger max roundness
			innerPadding: 4
		}
		if (type == "grace"){
			this.dimensions.y = canvas.h * 0.81;
		}
		if (type == "time"){
			this.dimensions.y = canvas.h * 0.77;
		}
	}
	init(maxMana, mana) {
		this.mana = mana;
		this.maxMana = maxMana;
		this.hasInit = true;
		this.render.mana = this.mana;
	}
	updateMana(mana) {
		this.mana = mana;
	}
	draw(wave, waveTime) {
		let couldBeUsed = false;

		if (this.hasInit === true) {
			this.render.initAnimation = interpolate(this.render.initAnimation, 1, 0.04);
		}
		if (this.render.initAnimation < 0.999) {
			ctx.translate(0, (1 - this.render.initAnimation) * canvas.h * .18);
		}

		this.render.mana = interpolate(this.render.mana, this.mana, 0.04);

		if (this.dimensions.w < this.dimensions.h) return;

		ctx.beginPath();
		ctx.fillStyle = '#333333';
		ctx.beginPath();
		ctx.roundRect(this.dimensions.x, this.dimensions.y, this.dimensions.w, this.dimensions.h, this.dimensions.roundness);
		ctx.fill();
		ctx.closePath();

		if (this.mana / this.maxMana < 0.05) {
			ctx.globalAlpha = Math.max(0, (this.mana / this.maxMana) * 19 + 0.05);
		}

		ctx.fillStyle = Colors.mana[this.type];
		ctx.beginPath();
		ctx.roundRect(this.dimensions.x + this.dimensions.innerPadding, this.dimensions.y + this.dimensions.innerPadding, this.dimensions.h + (this.dimensions.w - this.dimensions.h) * (this.mana / this.maxMana) - this.dimensions.innerPadding * 2, this.dimensions.h - this.dimensions.innerPadding * 2, this.dimensions.roundness);
		ctx.fill();
		ctx.closePath();

		let manaAfterUse;
		if (this.type == "grace" && waveTime > 1 && (!(bosses.length > 0))){
			couldBeUsed = true;
		}
		if (this.type == "time" && !room.globalWebActive){
			couldBeUsed = true;
		}
		if (this.type == "divergence" && waveTime > 1 && (!(bosses.length > 0))){
			couldBeUsed = true;
		}
		if (couldBeUsed){
			manaAfterUse = this.mana - calculateManaCost(wave, this.type, waveTime);
			if (manaAfterUse < 0){
				manaAfterUse = 0;
			}
			else{
				ctx.globalAlpha = 0.2;
				ctx.fillStyle = "#000000";
				ctx.beginPath();
				ctx.roundRect(this.dimensions.x + this.dimensions.innerPadding * 1.1, this.dimensions.y + this.dimensions.innerPadding * 1.1, this.dimensions.h + (this.dimensions.w - this.dimensions.h) * (manaAfterUse / this.maxMana) - this.dimensions.innerPadding * 2.2, this.dimensions.h - this.dimensions.innerPadding * 2.2, this.dimensions.roundness);
				ctx.fill();
				ctx.closePath();
				ctx.globalAlpha = 1;
			}
		}


		ctx.globalAlpha = 1;

		if (mouse.canvasX > this.dimensions.x && mouse.canvasY > this.dimensions.y && mouse.canvasX < this.dimensions.x + this.dimensions.w && mouse.canvasY < this.dimensions.y + this.dimensions.h) {

			ctx.fillStyle = '#f0f0f0';
			ctx.strokeStyle = 'black';
			ctx.lineWidth = 2.25;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.font = `900 ${Math.round(canvas.w * 0.0088)}px Ubuntu`;
			let extraText = ``
			if (couldBeUsed){
				ctx.font = `900 ${Math.round(canvas.w * 0.006)}px Ubuntu`;
				extraText = `; ${formatAmountHighPrecision(manaAfterUse)} if used`;
			}
			let manaText = `${formatAmountHighPrecision(this.mana)}/${formatAmountHighPrecision(this.maxMana)} mana${extraText}`;
			ctx.strokeText(manaText, this.dimensions.x + (this.dimensions.w) / 2, this.dimensions.y + this.dimensions.h / 2);
			ctx.fillText(manaText, this.dimensions.x + (this.dimensions.w) / 2, this.dimensions.y + this.dimensions.h / 2);
		}
		if (this.render.initAnimation < 0.999) {
			ctx.translate(0, -(1 - this.render.initAnimation) * canvas.h * .18);
		}
	}
}
let GraceBar = new ManaBar("grace");
let TimeBar = new ManaBar("time");
let DivergenceBar = new ManaBar("divergence");