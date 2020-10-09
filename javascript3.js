var c = document.getElementById("grid");
var ctx = c.getContext("2d");
var zoom = 20;
var height = 680;
var width = 1580;

//verticle lines
for (i = 0;i < width / zoom;i++){
	ctx.moveTo(i * zoom, 0);
	ctx.lineTo(i * zoom, height);
}
for (i = 0;i < height / zoom;i++){
	ctx.moveTo(0, i * zoom);
	ctx.lineTo(width, i * zoom);
}
//ctx.moveTo(0, 0);
//ctx.lineTo(200, 100);
ctx.stroke();

var mousedown = false;
var x1, y1;
function clickcanvas(event){
	if (mousedown) {
		mousedown=false;
		ctx.beginPath();
		ctx.arc(x1, y1, Math.sqrt(Math.pow(event.clientX - x1, 2)+ Math.pow(event.clientY - y1 - 100, 2)), 0, 2 * Math.PI);//+ Math.pow(event.clientY - y1 - 100, 2)
		ctx.stroke();

	}else{
		mousedown=true;}
		x1 = event.clientX;
		y1 = event.clientY - 100;
	//ctx.moveTo(event.clientX, event.clientY - 100);
	//ctx.lineTo(200, 100); 
	//ctx.stroke();
}