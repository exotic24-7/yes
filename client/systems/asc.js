// yo codeminers can you please not spoil this one? You can spoil it for yourself but not for others pls thx
class AscendUI {
    constructor(){
        this.animation = 0;
        this.yMin = -200;
        this.yMax = 0;
        this.buttonDimensions = {
            x: canvas.w / 2 - 34.2266 * 4 / 2,
            y: 18.5 * 2,
            w: 34.2266 * 4,
            h: 40
        }
        this.hoveringOverButton = false;
        this.lastHoveringOverBtnTime = this.lastNotHoveringOverBtnTime = 0;
    }
    draw(){
        this.animation = interpolate(this.animation, 1, 0.06 * dt / 16.66);

        const y = interpolate(this.yMin, this.yMax, this.animation);
        ctx.translate(0, y);

        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.font = '900 18px Ubuntu';
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';
        ctx.lineWidth = 3;

        const w = ctx.measureText('ascend?').width;
        const afterW = ctx.measureText(' You will lose all of your progress.').width;
        const beforeW = ctx.measureText('Would you like to ').width;
        const totalW = w + afterW + beforeW;

        ctx.strokeText('Would you like to ',                  canvas.w / 2 - (totalW) / 2, 8.45 - this.yMax);

        ctx.strokeText('ascend?',                             canvas.w / 2 - (totalW) / 2 + beforeW, 8.45 - this.yMax);

        ctx.strokeText(' You will lose all of your progress.',canvas.w / 2 - (totalW) / 2 + beforeW + w, 8.45 - this.yMax);

        ctx.fillText('Would you like to ',                  canvas.w / 2 - (totalW) / 2, 8.45 - this.yMax);

        ctx.fillStyle = `hsl(${(Date.now()/12)%360}, 50%, 50%)`;
        ctx.fillText('ascend?',                             canvas.w / 2 - (totalW) / 2 + beforeW, 8.45 - this.yMax);
        ctx.fillStyle = 'white';

        ctx.fillText(' You will lose all of your progress.',canvas.w / 2 - (totalW) / 2 + beforeW + w, 8.45 - this.yMax);
        ctx.textAlign = 'center';
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.globalAlpha = 0.12;
        ctx.roundRect(canvas.w / 2 - 280, -1000, 280*2, 1089, 20);
        ctx.fill();
        ctx.closePath();

        this.buttonDimensions = {
            x: canvas.w / 2 - 34.2266 * 4 / 2,
            y: 18.5 * 2,
            w: 34.2266 * 4,
            h: 40
        }

        const mouseX = mouse.canvasX;
        const mouseY = mouse.canvasY - this.buttonDimensions.h / 2;
        if(mouseX > this.buttonDimensions.x && mouseX < this.buttonDimensions.x + this.buttonDimensions.w && mouseY > this.buttonDimensions.y - 26 && mouseY < this.buttonDimensions.y + this.buttonDimensions.h - 26){
            this.hoveringOverButton = true;
            this.lastHoveringOverBtnTime = time;
            setCursor("pointer");
        } else {
            this.hoveringOverButton = false;
            this.lastNotHoveringOverBtnTime = time;
        }

        // button outline
        ctx.globalAlpha = 1;
        ctx.fillStyle = this.hoveringOverButton ? '#1cd128' : "#10c21a";//"#1dd129";
        ctx.lineWidth = 6;
        ctx.strokeStyle = blendColor(ctx.fillStyle, "#000000", 0.2);
        ctx.beginPath();
        ctx.roundRect(this.buttonDimensions.x, this.buttonDimensions.y, this.buttonDimensions.w, this.buttonDimensions.h, 6);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        ctx.lineWidth = 3;
        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'white';
        ctx.font = '900 24px Ubuntu';
        ctx.textBaseline = 'middle';
        ctx.strokeText("Ascend", this.buttonDimensions.x + this.buttonDimensions.w/2, this.buttonDimensions.y + this.buttonDimensions.h /2);

        if(this.hoveringOverButton === true || time - this.lastHoveringOverBtnTime < 500){
            if(this.hoveringOverButton === true){
                ctx.globalAlpha = (time - this.lastNotHoveringOverBtnTime) / 500;
            } else {
                ctx.globalAlpha = 1 - (time - this.lastHoveringOverBtnTime) / 500;
            }

            // if(ctx.globalAlpha < 1){
                const val = Math.floor(255-ctx.globalAlpha * 255);
                let lastGA = ctx.globalAlpha;
                ctx.globalAlpha = 1;
                ctx.fillStyle = `rgb(${val},${val},${val})`;
                ctx.fillText("Ascend", this.buttonDimensions.x + this.buttonDimensions.w/2, this.buttonDimensions.y + this.buttonDimensions.h /2);
                ctx.globalAlpha = lastGA;
            // }
            ctx.fillStyle = `hsl(${(time/12.1)%360}, 50%, 50%)`;

            ctx.fillText("Ascend", this.buttonDimensions.x + this.buttonDimensions.w/2, this.buttonDimensions.y + this.buttonDimensions.h /2);

            ctx.globalAlpha = 1;
        } else {
            ctx.fillText("Ascend", this.buttonDimensions.x + this.buttonDimensions.w/2, this.buttonDimensions.y + this.buttonDimensions.h /2);
        }

        // ctx.lineWidth = 0.1;
        // ctx.fillStyle = 'black';
        // ctx.strokeText("Ascend", this.buttonDimensions.x + this.buttonDimensions.w/2, this.buttonDimensions.y + this.buttonDimensions.h /2);

        ctx.translate(0, -y);
    }
    onmousedown() {
        if(this.hoveringOverButton !== true) return;
        if(!confirm('Are you sure? You will lose all of your petals permanently. NOTE: Ascended does not often recieve updates. It\'s a very buggy version of the game, so issues will not be easily resolved! Ascend at your own risk. DO NOT LET OTHERS INFLUENCE YOU.')) return;
        if(!confirm(`Are you sure you're sure? You will be unable to squad with un-ascended people. This is your last warning! Ascending is NOT revertable.`)) return;
        if(['42', 'fourty two', 'fourty-two'].includes(prompt('What is the meaning of life, the universe, and everything?')) === false) return;
        if(['flowr.pics'].includes(prompt('What was the main alternate domain name that was considered before deciding on flowr.fun?')) === false) return;
        alert('Prepare to ascend!');
        send({ascend: '!'});
    }
}

if(localStorage.getItem("doNotWishToAscend") != '1'){
    if(localStorage.getItem('canAscend') == '1' || localStorage.getItem('canAscend') == 'true'){
        window.canAscend = true;
        window.ascendUI = new AscendUI();
    }
}
else{
    window.doNotWishToAscend = true;
}
