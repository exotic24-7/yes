class Shop {
    constructor() {
        this.offers = []

        this.tokens = 0

        this.menu = {
            color: "#8e6bb5", // c14d6a
            border: "#735793", // 9e3f56
            y: {val: canvas.h + 10, target: canvas.h + 10},
            active: false,
            icon: new Image(),
            flower: new Flower(-1)
        }
        this.menu.icon.src = './gfx/coin.png'

        this.hoveringOverButton = false;
    }
    draw() {
        this.menu.y.val = interpolate(this.menu.y.val, this.menu.y.target, 0.03 * dt);

        if (this.menu.active === true) {
            this.menu.y.target = canvas.h - 20 - 500
        } else {
            this.menu.y.target = canvas.h + 10
        }

        if (this.menu.y.val < canvas.h + 10) {
            ctx.fillStyle = this.menu.color;
            ctx.strokeStyle = this.menu.border;

            ctx.lineWidth = 8;

            ctx.beginPath();
            ctx.roundRect(130, this.menu.y.val, 600, 500, 3)
            ctx.fill();
            ctx.stroke();
            ctx.closePath();

            if(mouse.canvasX > 130 + 600 - 50 && mouse.canvasY > this.menu.y.val + 17.5 && mouse.canvasX < 130 + 600 - 50 + 30 && mouse.canvasY < this.menu.y.val + 17.5 + 30){
                ctx.fillStyle = "#c16666";
                setCursor('pointer');
                this.hoveringOverX = true;
            } else {
                this.hoveringOverX = false;
                ctx.fillStyle = '#c1565e';
            }

            ctx.strokeStyle = '#90464b';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.roundRect(130 + 600 - 50, this.menu.y.val + 17.5, 30, 30, 6);
            ctx.fill();
            ctx.stroke();
            ctx.closePath();

            ctx.lineWidth = 4.75;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#cccccc';
            ctx.beginPath();
            ctx.moveTo(130 + 600 - 50 + 7.5, this.menu.y.val + 17.5 + 7.5);
            ctx.lineTo(130 + 600 - 50 + 22.5, this.menu.y.val + 17.5 + 22.5);
            ctx.stroke();
            ctx.closePath();

            ctx.beginPath();
            ctx.moveTo(130 + 600 - 50 + 22.5, this.menu.y.val + 17.5 + 7.5);
            ctx.lineTo(130 + 600 - 50 + 7.5, this.menu.y.val + 17.5 + 22.5);
            ctx.stroke();
            ctx.closePath();

            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'

            ctx.font = `900 30px 'Ubuntu'`;
            ctx.lineWidth = 4;

            ctx.fillStyle = "#ffffff"
            ctx.strokeStyle = "#000000"

            ctx.strokeText("Shop", 130 + 300, this.menu.y.val + 32.5)
            ctx.fillText("Shop", 130 + 300, this.menu.y.val + 32.5)

            ctx.fillStyle = "#000000"
            ctx.globalAlpha *= 0.25

            ctx.translate(130 + 20, this.menu.y.val + 15)
            ctx.beginPath();
            ctx.roundRect(0, 0, 111.25, 35, 3)
            ctx.roundRect(0, 50, 111.25, 415, 3)
            ctx.roundRect(126.25, 50, 432.5, 415, 3)
            ctx.fill();
            ctx.closePath();

            ctx.globalAlpha /= 0.25

            ctx.translate(17.5, 17.75)

            petalRenderMap.Token({
                radius: 10,
                angle: 0,
                lastTicksSinceLastDamaged: 1000,
                ticksSinceLastDamaged: 1000,
                rarity: 0
            })

            ctx.font = `900 15px 'Ubuntu'`;
            ctx.textAlign = 'left'
            ctx.textBaseline = 'middle'
            ctx.lineWidth = 3;

            ctx.fillStyle = this.tokens >= 0 ? "#ffffff" : "#ff0000"
            ctx.strokeStyle = "#000000"

            ctx.strokeText(formatAmountHighPrecision(this.tokens), 17.5, 0);
            ctx.fillText(formatAmountHighPrecision(this.tokens), 17.5, 0);

            if (this.offers[0]) this.drawOffers();

            ctx.translate(-17.5, -17.75);

            ctx.translate(-(130 + 20), -(this.menu.y.val + 15));

            this.menu.flower.drawFlower(130 + 20 + 337.5, this.menu.y.val + 15 + 30 + 432.5/2, 75);
            this.menu.flower.render.angle = Math.atan2(mouse.canvasY - (this.menu.y.val + 15 + 30 + 432.5/2), mouse.canvasX - (130 + 20 + 337.5));
        }

        ctx.lineWidth = 500
    }
    drawOffers() {

        let offset = {
            x: 130 + 20,
            y: this.menu.y.val + 15
        }

        let mouseRelative = {
            x: mouse.canvasX - offset.x,
            y: mouse.canvasY - offset.y
        }

        let x = 10, y = 60;

        for (let i = 0; i < this.offers.length; i++) {
            ctx.translate(x, y);
            if (
                mouseRelative.x > x &&
                mouseRelative.x < x + 40.625 &&
                mouseRelative.y > y &&
                mouseRelative.y < y + 40.625
            ) {
                this.offers[i].pc.isHovered = true;
            }

            this.offers[i].pc.draw()

            this.offers[i].pc.render.x += -x + 300 - (40.625)
            this.offers[i].pc.render.y += -y - (40.625) + 15
            this.offers[i].pc.drawStatsBox()
            this.offers[i].pc.render.x += x - 300 + (40.625)
            this.offers[i].pc.render.y += y + (40.625) - 15

            ctx.translate(-x, -y)
            y += 40.625 + 10.5
            if (i == 7) {x += 55.625; y = 60}
        }
    }
    drawIcon() {
        ctx.fillStyle = this.menu.color;
        ctx.strokeStyle = this.menu.border;

        if(mouse.canvasX + 6 > 20 && mouse.canvasY + 6 > canvas.h - 400 && mouse.canvasX - 6 < 100 && mouse.canvasY - 6 < canvas.h - 320){
            ctx.fillStyle = '#9979bc'; // cc6d84
            setCursor('pointer');
            this.hoveringOverButton = true;
        } else {
            this.hoveringOverButton = false;
        }

        ctx.lineWidth = 6;

        ctx.beginPath();
        ctx.roundRect(20, canvas.h - 400, 80, 80, 3)
        ctx.fill();
        ctx.stroke();
        ctx.drawImage(this.menu.icon, 35, canvas.h - 390, 50, 50);

        ctx.fillStyle = '#f0f0f0';// this is gonna be pain lol
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2.25;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `900 14px Ubuntu`;
        const lastLetterSpacing = ctx.letterSpacing;
        ctx.letterSpacing = '0px';
        ctx.strokeText("[Z]", 82.5, canvas.h - 385);
        ctx.fillText("[Z]", 82.5, canvas.h - 385);
        ctx.letterSpacing = lastLetterSpacing;
    }
    toggle() {
        if(globalInventory.menuActive === true) globalInventory.toggleMenu();
        if(typeof window.craftingMenu !== 'undefined' && window.craftingMenu && window.craftingMenu.menuActive === true) {
            if (typeof window.craftingMenu.toggleMenu === 'function') window.craftingMenu.toggleMenu();
        }
        if(mobGallery.menuActive === true) mobGallery.toggleMenu();
        this.menu.active = !this.menu.active
    }
}

const shop = new Shop();