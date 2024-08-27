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
        var size=30;
        var yin=new Object();
        yin.type="circle";
        yin.color="#FFF";
        yin.x=canvasW/2;
        yin.y=canvasH/2-Math.min(canvasH,canvasW)*0.2;
        yin.radius=size;
        var yang=new Object();
        yang.type="circle";
        yang.color="#000";
        yang.x=canvasW/2;
        yang.y=canvasH/2+Math.min(canvasH,canvasW)*0.2;
        yang.radius=size;
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
        
        drawable.push(yin);
        drawable.push(yang);
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
        ctx.fillRect(obj.x,obj.y,obj.size,obj.size);
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
    dt=(Date.now()-currentt)/1000;
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