const changeloglist = [
    {text:`Game beta release!! credits to exotic, solo dev`, date: `January 17, 2026`},
    {text:`Game beta only supports single player, until rest of multiplayer is implemented. game workks still`, date: `January 17, 2026`}
]


class Changelog {

    constructor(){
        this.entries = [];



        this.x = 110;
        this.y = 20;
        this.w = 500;
        this.h = 50 * 10 + 7;

        this.offset = -this.h - 40;
        this.targetOffset = -this.h - 40;
        this.active = false;


        this.scroll = 5;
        this.render = {scroll: this.scroll};

        this.menuHeights = {beginning: 0, end: this.h};
        this.scrollbar = {top: 0, bottom: 0, renderTop: 0, renderBottom: 0, length: 150};


        // this.scrollbar.bottom = (canvas.h - this.h - 20) + 60 - this.scrollbar.length * 7/8
        // this.scrollbar.top = this.scrollbar.bottom + this.scrollbar.length / 2
        const scrollBarProjections = {
            top: (20) + this.scrollbar.length*.5 + 60,
            bottom: (this.h + 20) - this.scrollbar.length*.5 + 30
        }
        this.scrollbar.top = this.scrollbar.bottom = scrollBarProjections.top + this.scrollbar.length;
        this.scrollbar.renderBottom = this.scrollbar.bottom;
        this.scrollbar.renderTop = this.scrollbar.top;

        this.draggingScrollBar = false;

        this.hoveringOverScrollbar = false;
        this.scrollBarActive = true;
        this.hoveringOverX = false;
    }
    toggle(){
        this.active = !this.active;
        if(this.active){
            this.generateEntries();
            // open
            this.targetOffset = 0;
        } else {
            // close
            this.targetOffset = -this.h - 40;
        }
    }
    resizeScroll(){
        if(this.resizeFlag !== undefined) {
            return;
        }
        const scrollBarProjections = {
            top: (20) + this.scrollbar.length*.5 + 60,
            bottom: (this.h + 20) - this.scrollbar.length*.5 + 30
        }
        this.scrollbar.top = this.scrollbar.bottom = scrollBarProjections.top + this.scrollbar.length;

        this.resizeFlag = true;
    }
    mouseDown({mouseX, mouseY}){
      
        if(
            mouseX < this.w - 16 + 12 + 110 &&
            mouseX > this.w - 16 - 12 + 110 &&
            mouseY > (this.scrollbar.bottom) &&
            mouseY < (this.scrollbar.top)
        ){
            this.draggingScrollBar = true;
        }
    }
    mouseUp({mouseX, mouseY}){
        this.draggingScrollBar = false;
        // delete this.scrollbarMouseOffset;
    }
    updateScroll(/*delta*/{x,y}, {mouseX, mouseY}){
        if(this.active !== true){
            return;
        }
        
        if(mouseX < 110 || mouseY < 20 || mouseX > 110 + this.w || mouseY > this.h + 20){
            return;
        }

        this.scroll -= y;
        if(this.scroll > 0) this.scroll = 0;
        else if(this.scroll < this.totalPetalHeight) this.scroll = this.totalPetalHeight;
    }
    mouseMove({mouseX, mouseY}){
        //console.log(mouseX, mouseY);
        if(
            mouseX < this.w - 16 + 12 + 110 &&
            mouseX > this.w - 16 - 12 + 110 &&
            mouseY > (this.scrollbar.bottom) &&
            mouseY < (this.scrollbar.top)
        ){
            this.hoveringOverScrollbar = true;
            //console.log("TRUE");
            // setCursor('pointer');
            // this.scrollbarMouseOffset = 0//(this.scrollbar.top) * ((this.h - 82 - 16) / this.h) + 82 + (canvas.h - this.h - 20) - mouseY;
        } else {
            this.hoveringOverScrollbar = false;
        }
        
        if(this.draggingScrollBar !== true){
            
            return;
        }
        
        const scrollBarProjections = {
            top: (20) + this.scrollbar.length*.5 + 60,
            bottom: (this.h + 20) - this.scrollbar.length*.5 + 30
        }

        const mouseProjections = {
            top: scrollBarProjections.top - this.scrollbar.length * .25,
            bottom: scrollBarProjections.bottom + this.scrollbar.length * .33
        }

        let ratio = (mouseY - mouseProjections.top) / (mouseProjections.bottom - mouseProjections.top);
        if(ratio < 0){
            ratio = 0;
        } else if(ratio > 1){
            ratio = 1;
        }
        //console.log(ratio);

        // console.log(mouseY - scrollBarProjections.top);

        
        this.scroll = ratio * (this.totalPetalHeight) //* ((this.h - 82 - 16 * 2) / this.h);
       
    }
    draw(){
        //if(!this.active){return};
        ctx.textBaseline = 'middle';
        ctx.fontKerning = "none";
        ctx.letterSpacing = "-.1px";
        this.offset = interpolate(this.offset, this.targetOffset, 0.3);
        

        this.currentHeight = 5;

        ctx.translate(this.x, this.y + this.offset);
        ctx.fillStyle = '#9bb56b';
        ctx.strokeStyle = '#7f9458';
        ctx.lineWidth = 8;

        ctx.beginPath();
        ctx.roundRect(0, 0, this.w, this.h, 3);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        this.render.scroll = interpolate(this.render.scroll, this.scroll, 0.0070 * dt);

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(0, 80, this.w, this.h - 80, 3);
        ctx.clip();
        let entrypadding = 10;

        let yoff = 100 + entrypadding;
        for(let i = 0; i < this.entries.length; i++){
            yoff +=this.entries[i].h/2
            this.renderEntry(this.entries[i], yoff);
            yoff += this.entries[i].h/2 + entrypadding;
        }
        ctx.restore();

        ctx.beginPath();
        ctx.roundRect(0, 0, this.w, this.h, 3);
        ctx.stroke();
        ctx.closePath();

        ctx.font = `900 30px 'Ubuntu'`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4;
        ctx.strokeText("Changelog", this.w/2, 40);
        ctx.fillText("Changelog", this.w/2, 40);

        

        this.menuHeights = {
            beginning: 100 + entrypadding, //- petalContainerSize * 1/2,
            end:   yoff - this.h + 70 + 80//+ petalContainerSize * 4
        }

       
            
        let padding = 100;
     
        const scrollBarProjections = {
            top: (20) + this.scrollbar.length*.5 + 60,
            bottom: (this.h + 20) - this.scrollbar.length*.5 + 30
        }
        

        this.totalPetalHeight = (this.menuHeights.beginning - this.menuHeights.end);

       
        if(this.scroll > 0) this.scroll = 0;
        else if(this.scroll < this.totalPetalHeight) this.scroll = this.totalPetalHeight;

        const ratio = this.scroll / this.totalPetalHeight;
         //console.log(ratio);

        this.scrollbar.bottom = interpolate(scrollBarProjections.top, scrollBarProjections.bottom, ratio) - this.scrollbar.length / 2//this.scroll / (this.totalPetalHeight) * (scrollBarProjections.bottom - scrollBarProjections.top) + scrollBarProjections.top + this.scrollbar.length / 2 - (canvas.h - this.h - 20);
        // this.scrollbar.bottom = this.scroll / (this.totalPetalHeight + this.scrollbar.length) * (scrollBarProjections.bottom - scrollBarProjections.top) + scrollBarProjections.top - this.scrollbar.length/2;
        this.scrollbar.top = this.scrollbar.bottom + this.scrollbar.length / 2//this.scrollbar.bottom - this.scrollbar.length / 2;
    
        this.scrollbar.renderTop = interpolate(this.scrollbar.renderTop, this.scrollbar.top, this.draggingScrollBar ? 0.28 : 0.08);
        this.scrollbar.renderBottom = interpolate(this.scrollbar.renderBottom, this.scrollbar.bottom, this.draggingScrollBar ? 0.28 : 0.08);

        // console.log(this.scrollBarActive);
        if(this.scrollBarActive !== false){
            ctx.translate(0, -(20));
            ctx.strokeStyle = '#7f9458';
            ctx.lineWidth = 8;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(this.w - 16, (this.scrollbar.renderTop) /** ((this.h - 82 - 16) / this.h) + 82*/);
            ctx.lineTo(this.w - 16, (this.scrollbar.renderBottom) /** ((this.h - 82 - 16) / this.h) + 82*/);
            ctx.stroke();
            ctx.closePath();
            ctx.translate(0, (20));
        }

        if(this.active === true){
            if(mouse.canvasX > this.x + this.w - 7.5 - 30 - 3 && mouse.canvasY > this.y + 7.5 + 3 && mouse.canvasX < this.x + this.w - 7.5 - 3 && mouse.canvasY < this.y + 7.5 + 30 + 3){
                ctx.fillStyle = "#c16666";
                setCursor('pointer');
                this.hoveringOverX = true;
            } else {
                // if(this.hoveringOverButton === false){
                //     document.body.style.cursor = 'auto';
                // }
                this.hoveringOverX = false;
                ctx.fillStyle = '#c1565e';
            }
        } else {
            ctx.fillStyle = '#c1565e';
            this.hoveringOverX = false;
        }

        ctx.translate(-3, 3);
        ctx.strokeStyle = '#90464b';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.roundRect(this.w - 7.5 - 30, 7.5, 30, 30, 6);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        ctx.lineWidth = 4.75;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#cccccc';
        ctx.beginPath();
        ctx.moveTo(this.w - 30, 30);
        ctx.lineTo(this.w - 7.5 * 2, 7.5 + 7.5);
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.moveTo(this.w - 7.5 * 2, 30);
        ctx.lineTo(this.w - 30, 7.5 + 7.5);
        ctx.stroke();
        ctx.closePath();
        ctx.translate(3, -3);

        ctx.translate(-this.x, -this.y - this.offset);
    }

    renderEntry(entry, yoffset){

        if(this.render.scroll + yoffset < 0 || this.render.scroll + yoffset > this.h + 100) return;

        ctx.font = `900 ${entry.fontSize ?? 19}px 'Ubuntu'`;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";

        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;

        if(entry.type == 'divider'){
            ctx.strokeStyle = '#7f9458';
            ctx.lineWidth = 8;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(20, yoffset + this.render.scroll);
            ctx.lineTo(this.w - 20 - 16, yoffset + this.render.scroll);
            ctx.stroke();
            ctx.closePath();

        }else if(entry.type == 'date'){
            ctx.lineWidth = 3;
            ctx.strokeText(entry.text, 20, yoffset + this.render.scroll);
            ctx.fillText(entry.text, 20, yoffset + this.render.scroll);
        }else {
            ctx.strokeText(entry.text, 28, yoffset + this.render.scroll);
            ctx.fillText(entry.text, 28, yoffset + this.render.scroll);
        }

        
    }

    getLines(ctx, text, maxWidth) {
        //maxWidth *= window.innerWidth/canvas.w;
        
        var words = text.split(" ");
        var lines = [];
        var currentLine = words[0];
    
        for (var i = 1; i < words.length; i++) {
            var word = words[i];
            var width = ctx.measureText(currentLine + " " + word).width;
            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }


    generateEntries(){
        let ret = []
        for(let entry of changeloglist){
            ret.push({
                type: "date",
                text: entry.date,
                fontSize: 22,
                h: 34
            })
            let paragraphs = entry.text.split("\n");
            for(let paragraph of paragraphs){
                ctx.font = `900 16px 'Ubuntu'`;
                let lines = this.getLines(ctx, paragraph, this.w - 54);
                for(let line of lines){
                    ret.push({
                        type: "text",
                        text: line,
                        fontSize: 16,
                        h: 15
                    })
                }
            }
            ret.push({
                type: "divider",
                h: 20
            })
            
            
        }
        this.entries = ret;
    }
    
    
}

const changelog = new Changelog();
