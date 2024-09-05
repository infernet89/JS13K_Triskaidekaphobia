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

//TODO DEBUG
level=1;
//TODO DEBUG

//setup
canvas = document.getElementById("g");
ctx = canvas.getContext("2d");
canvasW=canvas.width  = window.innerWidth;
canvasH=canvas.height = window.innerHeight;

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
        var tmp=new Object();
        tmp.type="rectangle";
        tmp.x=canvasW/2-100;
        tmp.y=canvasH/4*3;
        tmp.width=200;
        tmp.height=100;
        tmp.clickable=true;
        tmp.caption="Bet";
        tmp.fontSize=100;
        tmp.click=function(e) { startTimer(); this.clickable=false; this.opacity=0.2;};
        drawable.push(tmp);          
    }
    //yin-yang
    else if(level==1)
    {
        slowMoFactor=-0.5;
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
        var tmp=new Object();
        tmp.type="timer";
        tmp.x=canvasW/2-50;
        tmp.y=canvasH/10*9;
        tmp.seconds=0;
        tmp.limit=13;
        tmp.fontSize=50;
        tmp.expired=function(e) { };
        drawable.push(tmp);
    }
}
function startTimer()
{
    var tmp=new Object();
    tmp.type="timer";
    tmp.x=canvasW/2-50;
    tmp.y=canvasH/10*9;
    tmp.seconds=0;
    tmp.limit=13;
    tmp.fontSize=50;
    tmp.expired=function(e) { level++; setup(); };
    drawable.push(tmp);
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
        ctx.fillStyle=fg;
        ctx.fillRect(obj.x,obj.y,obj.width,obj.height);
        if(obj.caption)
        {
            ctx.fillStyle=bg;
            ctx.font = obj.fontSize+"px Georgia, serif";
            ctx.textAlign="center";
            ctx.fillText(obj.caption,obj.x+obj.width/2,obj.y+obj.height-obj.fontSize/6);
        }
    }
    else if(obj.type=="timer")
    {
        ctx.fillStyle=fg;
        ctx.font = obj.fontSize+"px Georgia, serif";
        ctx.textAlign="left";
        ctx.fillText(Math.round(obj.seconds*100)/100,obj.x,obj.y);
    }
    ctx.restore();
}
function move(obj)
{
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
        canvas.style.cursor="default";
    }
    drawable.forEach(el => { move(el); draw(el); } );
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
                    //TODO calcola meglio la direction
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