var c = document.getElementById("grid");
var ctx = c.getContext("2d");
var zoom = 20;
var height = 680;
var width = 1580;


//verticle lines
ctx.strokeStyle = "black";
for (i = 0;i < width / zoom;i++){
	ctx.moveTo(i * zoom, 0);
	ctx.lineTo(i * zoom, height);
}
for (i = 0;i < height / zoom;i++){
	ctx.moveTo(0, i * zoom);
	ctx.lineTo(width, i * zoom);
}

ctx.stroke();
//ctx.moveTo(0, 0);
//ctx.lineTo(200, 100);
var mouseup = true;
function setmouseup(){mouseup = true;}
function setmouseup(){mouseup = false;}
function clickcanvas(event){
	if (!mouseup){
		var actual_mouseX = event.clientX;
		var actual_mouseY = event.clientY - 100;
		
		tool = document.getElementById("tool");
		var colour;
		if (tool.value == "wall"){colour = "black";} else
		if (tool.value == "start"){colour = "blue";} else
		if (tool.value == "finnish"){colour = "red";} else
		if (tool.value == "eraser"){colour = "white";}
		
		ctx.beginPath();
		ctx.fillStyle = colour;
		ctx.fillRect(Math.round(actual_mouseX / zoom) * zoom, Math.round(actual_mouseY / zoom) * zoom, zoom, zoom);
		ctx.stroke();
	}
}