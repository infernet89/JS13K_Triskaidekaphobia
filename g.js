// < >
//constant
const fg="#F9F9F9"; //it stands for foreground color
const bg="#070707"; //it stands for background color
//global variables
var canvas;
var canvasW;
var canvasH;
var ctx;
var dragging=false;
var mousex=-100;
var mousey=-100;
var level=0;
var drawable=[];
var dt;
var currentt=Date.now();
var slowMoFactor=1;
var fontSize=50;
var paused=false;
var betbutton=new Object();

//TODO DEBUG
level=1;
//TODO DEBUG

//setup
canvas = document.getElementById("g");
ctx = canvas.getContext("2d");
canvasW=canvas.width  = window.innerWidth;
canvasH=canvas.height = window.innerHeight;
ctx.textBaseline = "middle";
betbutton.type="betbutton";
betbutton.clickable=true;
betbutton.x=canvasW/2-100;
betbutton.y=canvasH/20*18;
betbutton.width=200;
betbutton.height=100;

//controls
canvas.addEventListener("mousemove",mossoMouse);
canvas.addEventListener("mousedown",cliccatoMouse);
canvas.addEventListener("mouseup",rilasciatoMouse);

setup();
run(); //at the end of run(), we call itself again. Then calculate the timing for object movements.

//setup all the objects
function setup()
{
    drawable=[];
    if(level==0)
    {
        betbutton.clickable=true;
        betbutton.members=null;
        betbutton.opacity=1;
        betbutton.click=function(e) { startTimer(); this.clickable=false; this.opacity=0.2;};
        drawable.push(betbutton);   
        paused=false;       
    }
    //yin-yang
    else if(level==1)
    {
        paused=true;
        var force=500;
        var size=Math.min(canvasH,canvasW)*0.02;
        var yin=new Object();
        yin.x=canvasW/2;
        yin.y=canvasH/2-Math.min(canvasH,canvasW)*0.2;
        var yang=new Object();
        yang.x=canvasW/2;
        yang.y=canvasH/2+Math.min(canvasH,canvasW)*0.2;

        for(var x=0;x<canvasW;x+=size)
            for(var y=0;y<canvasH;y+=size)
                if(distanceFrom(x,y,canvasW/2,canvasH/2)<Math.min(canvasH,canvasW)*0.4)
                {
                    var tmp=new Object();
                    tmp.type="square";
                    if(y<canvasH/2 && (x<canvasW/2 || distanceFrom(x,y,yin.x,yin.y)<Math.min(canvasH,canvasW)*0.2))
                        tmp.color="#000";
                    else if(x<canvasW/2 && distanceFrom(x,y,yang.x,yang.y)>Math.min(canvasH,canvasW)*0.2)
                        tmp.color="#000";
                    else
                        tmp.color="#FFF";
                    tmp.x=x;
                    tmp.y=y;
                    tmp.size=size;
                    drawable.push(tmp);
                }
        for(i=0;i<5;i++)
        {
            if(i!=0)
            {
                offsetX=size*(i%2)-size/2;
                offsetY=size*Math.floor(i%4/2)-size/2;
            }
            else
            {
                offsetX=0;
                offsetY=0;
            }
            var tmp=new Object();
            tmp.x=yin.x+offsetX;
            tmp.y=yin.y+offsetY;
            tmp.type="circle";
            tmp.color="#FFF";
            tmp.radius=size/2;
            tmp.force=force;
            tmp.direction=Math.random()*Math.PI*2;
            tmp.dx=tmp.force*Math.sin(tmp.direction);
            tmp.dy=tmp.force*Math.cos(tmp.direction);
            drawable.push(tmp);
            var tmp=new Object();
            tmp.x=yang.x+offsetX;
            tmp.y=yang.y+offsetY;
            tmp.type="circle";
            tmp.color="#000";
            tmp.radius=size/2;
            tmp.force=force;
            tmp.direction=Math.random()*Math.PI*2;
            tmp.dx=tmp.force*Math.sin(tmp.direction);
            tmp.dy=tmp.force*Math.cos(tmp.direction);
            drawable.push(tmp);
        }
        betbutton.clickable=true; 
        betbutton.opacity=1;
        betbutton.members=[];
        var tmp=new Object();
        tmp.color="#EEE";
        tmp.caption="White";
        tmp.count=0;
        tmp.selected=false;
        tmp.chosen=false;
        tmp.clickable=true;
        drawable.push(tmp);
        betbutton.members['white']=tmp;
        var tmp2=new Object();
        tmp2.color="#333";
        tmp2.caption="Black";
        tmp2.count=0;
        tmp2.selected=false;
        tmp2.chosen=false;
        tmp2.clickable=true;
        drawable.push(tmp2);     
        betbutton.members['black']=tmp2;

        tmp.click=function(e) { tmp.chosen=true; tmp2.chosen=false; betbutton.clickable=true; betbutton.opacity=1; };
        tmp2.click=function(e) { tmp2.chosen=true; tmp.chosen=false; betbutton.clickable=true; betbutton.opacity=1; };
        betbutton.click=function(e) { paused=false; slowMoFactor=-0.3; this.clickable=false; this.opacity=0.2; tmp.clickable=false; tmp2.clickable=false; };
        betbutton.clickable=false; 
        betbutton.opacity=0.2;
        drawable.push(betbutton); 

        var timer=new Object();
        timer.type="timer";
        timer.x=canvasW/2-50;
        timer.y=canvasH/20*18+50;
        timer.seconds=0;
        timer.limit=13;
        timer.fontSize=fontSize;
        timer.expired=function(e) { paused=true; checkWinner(); };
        drawable.push(timer);
    }
}
function startTimer()
{
    var tmp=new Object();
    tmp.type="timer";
    tmp.x=canvasW/2-50;
    tmp.y=canvasH/20*18+50;
    tmp.seconds=0;
    tmp.limit=13;
    tmp.fontSize=50;
    tmp.expired=function(e) { level++; setup(); };
    drawable.push(tmp);
}
function drawPieChart(ctx, raggio, x, y, valori, colori) {
  const totale = valori.reduce((a, b) => a + b, 0);
  let angoloInizio = 0;

  valori.forEach((valore, i) => {
    const angolo = (valore / totale) * 2 * Math.PI;
    ctx.fillStyle = colori[i];
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, raggio, angoloInizio, angoloInizio + angolo);
    ctx.closePath();
    ctx.fill();

    // Calcola la percentuale e la dimensione del testo
    const percentuale = ((valore / totale) * 100).toFixed(1) + '%';
    const dimensioneTesto = Math.max(10, (angolo / (2 * Math.PI)) * raggio / 2); 
    ctx.font = `${dimensioneTesto}px Georgia, serif`;
    ctx.fillStyle = "#000";
    
    // Posiziona il testo al centro della fetta
    const angoloTesto = angoloInizio + angolo / 2;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(percentuale, x + Math.cos(angoloTesto) * raggio / 2, y + Math.sin(angoloTesto) * raggio / 2);
    
    angoloInizio += angolo;
  });
}
//draw a single object
function draw(obj)
{
    ctx.save();
    if(obj.opacity)
        ctx.globalAlpha=obj.opacity;
    if(obj.type=="circle")
    {
        ctx.fillStyle=obj.color;
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.radius, 0, 2 * Math.PI);
        ctx.fill(); 
    }
    else if(obj.type=="square")
    {
        ctx.fillStyle=obj.color;
        ctx.fillRect(obj.x-obj.size/2,obj.y-obj.size/2,obj.size,obj.size);
    }
    else if(obj.type=="rectangle")
    {
        if(obj.caption)
        {
            ctx.fillStyle="#000";
            ctx.globalAlpha=0.5;
            ctx.fillRect(obj.x-5,obj.y-5,obj.width+10,obj.height+10);
            ctx.globalAlpha=1;
        }
        ctx.fillStyle=fg;
        ctx.fillRect(obj.x,obj.y,obj.width,obj.height);
        if(obj.caption)
        {
            ctx.fillStyle=obj.color;
            ctx.font = obj.fontSize+"px Georgia, serif";
            ctx.textAlign="center";
            ctx.fillText(obj.caption,obj.x+obj.width/2,obj.y+obj.height-obj.fontSize/2);
        }
    }
    else if(obj.type=="timer")
    {
        if(!obj.seconds) return;
        ctx.fillStyle=fg;
        if(obj.limit && obj.limit-obj.seconds<1)
            ctx.fillStyle="#F00";
        ctx.font = obj.fontSize+"px Georgia, serif";
        ctx.textAlign="left";
        ctx.fillText(Math.round(obj.seconds*100)/100,obj.x,obj.y);
    }
    else if(obj.type=="betbutton")
    {
        ctx.fillStyle=fg;
        ctx.fillRect(canvasW/2-100,canvasH/20*18,200,100);
        ctx.fillStyle=bg;
        ctx.font = fontSize*2+"px Georgia, serif";
        ctx.textAlign="center";
        ctx.fillText("Bet",canvasW/2,canvasH/20*18+100-fontSize);
        if(obj.members)
        {
            ctx.fillStyle=fg;
            ctx.font = fontSize/2+"px Georgia, serif";
            ctx.fillText("on",canvasW/2+125,canvasH/20*18+100-fontSize);
            ctx.globalAlpha=1;
            ctx.textAlign="left";
            var nMembers=Reflect.ownKeys(obj.members).length-1;
            var memberCount=1;
            Reflect.ownKeys(obj.members).forEach(el => {
                if(el=="length") return;
                ctx.fillStyle=obj.members[el].color;
                ctx.font = fontSize/2+"px Georgia, serif";
                ctx.fillText(obj.members[el].caption+": "+obj.members[el].count,canvasW/2+150,canvasH/20*18 + (memberCount*100/nMembers)-50/nMembers );
                if(obj.members[el].selected)
                    ctx.fillText("____",canvasW/2+150,canvasH/20*18 + (memberCount*100/nMembers)-50/nMembers );
                if(obj.members[el].chosen)
                    ctx.fillText("➼",canvasW/2+130,canvasH/20*18 + (memberCount*100/nMembers)-50/nMembers );
                obj.members[el].x=canvasW/2+150;
                obj.members[el].y=canvasH/20*18 + (memberCount*100/nMembers)-50/nMembers-10;
                obj.members[el].width=70;
                obj.members[el].height=20;
                memberCount++;
            });
        }
    }
    else if(obj.type=="text")
    {
        ctx.textAlign = "center";
        let fontSize = 9999;
        ctx.font = fontSize + "px Georgia, serif";
        let textWidth = ctx.measureText(obj.caption).width;
        while (textWidth > canvasW) {
            fontSize--;  // Diminuisci la dimensione del font
            ctx.font = fontSize + "px Georgia, serif";
            textWidth = ctx.measureText(obj.caption).width;
        }
        ctx.fillStyle = "#000";
        ctx.globalAlpha=0.8;
        ctx.fillRect(0,canvasH/2-fontSize/2,canvasW,fontSize);

        ctx.globalAlpha=1;
        ctx.fillStyle = obj.color;
        ctx.fillText(obj.caption, canvasW / 2, canvasH / 2);
    }
    ctx.restore();
}
function move(obj)
{
    if(paused) return;
    if(obj.type=="timer")
    {
        obj.seconds+=dt;
        if(obj.seconds>obj.limit)
        {
            obj.expired();
        }
    }

    if(obj.dx==null || obj.dy==null) return;
    obj.x+=obj.dx*dt;
    obj.y+=obj.dy*dt;
}
function checkWinner()
{
    var maxValue=-1;
    var winner=null;
    Reflect.ownKeys(betbutton.members).forEach(el => {
        if(el=="length") return;
        if(maxValue<betbutton.members[el].count)
        {
            maxValue=betbutton.members[el].count;
            winner=el;
        }
    });
    if(betbutton.members[winner].chosen)
    {
        var tmp=new Object();
        tmp.type="text";
        tmp.color="#7F7";
        tmp.caption="You won!";
        drawable.push(tmp);
    }
    else
    {
        var tmp=new Object();
        tmp.type="text";
        tmp.color="#F77";
        tmp.caption="FAILED!";
        drawable.push(tmp);
    }
    var backbutton=new Object();
    backbutton.type="rectangle";
    backbutton.color="#222";
    backbutton.fontSize=80;
    backbutton.caption="Back";
    backbutton.clickable=true;
    backbutton.x=canvasW/2-100;
    backbutton.y=canvasH/20*15;
    backbutton.width=200;
    backbutton.height=100;
    backbutton.click=function(e) { level=0; setup();};
    drawable.push(backbutton);
}
//main loop that draw the screen and perform the game logic
function run()
{
    //how much is passed since last time?
    dt=(Date.now()-currentt)/1000 * slowMoFactor;
    currentt=Date.now();

    //draw stuff
    ctx.clearRect(0, 0, canvasW, canvasH);
    ctx.fillStyle=bg;
    ctx.fillRect(0,0,canvasW,canvasH);
    if(level==0)
    {
        ctx.fillStyle=fg;
        ctx.font = "150px Georgia, serif";
        ctx.textAlign="center";
        ctx.fillText("How long?",canvasW/2,canvasH/4);
    }
    drawable.forEach(el => { move(el); draw(el); } );

    canvas.style.cursor="default";
    drawable.forEach(el => { 
        el.selected=isSelected(el);
        if(el.clickable && el.selected) 
        { 
            canvas.style.cursor="pointer"; 
            if(dragging)
            {
                el.click();
            }
        } 
    });

    if(level==1)
    {
        //slowly disable slowmotion
        if(slowMoFactor<1)
            slowMoFactor+=0.01;
        //bounce
        drawable.filter(el => el.type === "circle").forEach(el => {
            //borders
            if(distanceFrom(el.x,el.y,canvasW/2,canvasH/2)>Math.min(canvasH,canvasW)*0.4-el.radius)
            {
                el.direction = Math.atan2((canvasH / 2) - el.y, (canvasW / 2) - el.x);
                el.direction+=rand(-1,1)/2;
                el.dx=el.force*Math.cos(el.direction);
                el.dy=el.force*Math.sin(el.direction);
            }
            //hit squares
            drawable.filter(el => el.type === "square").forEach(block => {
                if(el.color==block.color && distanceFrom(el.x,el.y,block.x,block.y)<el.radius+block.size/2)
                {
                    el.direction=Math.atan2(block.y - el.y, block.x - el.x);
                    if(Math.abs(el.x-block.x)<Math.abs(el.y-block.y))
                        el.direction+=Math.PI;
                    else if(Math.abs(el.x-block.x)>Math.abs(el.y-block.y))
                        el.direction-=Math.PI;
                    el.dx=el.force*Math.cos(el.direction);
                    el.dy=el.force*Math.sin(el.direction);
                    if(block.color=="#000")
                        block.color="#FFF";
                    else if(block.color=="#FFF")
                        block.color="#000";
                }
            });
        });
        //count black and whites
        nBlack=0;
        nWhite=0;
        drawable.filter(el => el.type === "square").forEach(block => { if(block.color=="#FFF") nWhite++; else if(block.color=="#000") nBlack++; });
        drawPieChart(ctx, Math.min(canvasH,canvasW)/10, canvasW/20*17, canvasH/20*17, [nBlack,nWhite], ["#333","#EEE"]);
        betbutton.members['black'].count=nBlack;
        betbutton.members['white'].count=nWhite;
    }

    //border
    ctx.fillStyle=fg;
    ctx.fillRect(0,0,canvasW,1);
    ctx.fillRect(0,canvasH-1,canvasW,1);
    ctx.fillRect(0,0,1,canvasH);
    ctx.fillRect(canvasW-1,0,1,canvasH);

    setTimeout(run);
}

/*#############
    Funzioni Utili
##############*/
//check if mouse is inside obj
function isSelected(obj)
{
    tx=mousex;
    ty=mousey;
    //circle-based
    if(obj.radius>0 && distanceFrom(tx,ty,obj.x,obj.y) < obj.radius)
        return true;
    else if(obj.radius>0)
        return false;
    //rectangle-based
    if(tx < obj.x) return false;
    if(tx > obj.x + obj.width) return false;
    if(ty < obj.y) return false;
    if(ty > obj.y + obj.height) return false;
    return true;
}
function rand(da, a)
{
    if(da>a) return rand(a,da);
    a=a+1;
    return Math.floor(Math.random()*(a-da)+da);
}
function distanceFrom(ax,ay,bx,by)
{
    return Math.sqrt((ax-bx)*(ax-bx)+(ay-by)*(ay-by));
}
//uindows
function cliccatoMouse(evt)
{
    dragging=true;
    var rect = canvas.getBoundingClientRect();
    mousex=(evt.clientX-rect.left)/(rect.right-rect.left)*canvasW;
    mousey=(evt.clientY-rect.top)/(rect.bottom-rect.top)*canvasH;
}
function mossoMouse(evt)
{
    var rect = canvas.getBoundingClientRect();
    mousex=(evt.clientX-rect.left)/(rect.right-rect.left)*canvasW;
    mousey=(evt.clientY-rect.top)/(rect.bottom-rect.top)*canvasH;
}
function rilasciatoMouse(evt)
{
    dragging=false;    
}