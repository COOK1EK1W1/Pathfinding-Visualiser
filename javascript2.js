const c = document.getElementById("grid");
const ctx = c.getContext("2d");
const zoom = 20;
const height = 680;
const width = 1580;
const tool = document.getElementById("tool");
var start_coords = [-1, -1];
var end_coords = [-1, -1];

class Node{
	constructor(x, y){
		this.x = x;
		this.y = y;
		this.type = "empty";
    }
    update_square(type){
		var colour;
		this.type = type;
		if (this.type == "empty"){colour = "white";}
		if (this.type == "wall"){colour = "black";}
		if (this.type == "start"){colour = "blue";}
		if (this.type == "end")	{colour = "red";}

		ctx.beginPath();
		ctx.fillStyle = colour;
		ctx.fillRect(this.x * zoom, this.y * zoom, zoom, zoom);
		ctx.rect(this.x * zoom, this.y * zoom, zoom, zoom);
		ctx.stroke();
    }
}



var nodes = [];
// startup draw grid

function setup(){
	for (var y = 0; y < height / zoom; y++){
		var node_row = [];
		for (var x = 0; x < width / zoom; x++){
			node_row.push(new Node(x, y));
		}
		nodes.push(node_row);
	}
	for (var y = 0; y < height / zoom; y++){
		for (var x = 0; x < width / zoom; x++){
			nodes[y][x].update_square("empty");
		}
	}
}


setup();

var mouseup = true;
function setmouseup(){mouseup = true;}
function setmousedown(){mouseup = false;}
function clickcanvas(event){
	if (!mouseup){
		var actual_mouseX = event.clientX - 9; //local coordinated of the canvas
		var actual_mouseY = event.clientY - 110;

		var gridx = Math.round(actual_mouseX / zoom); //local coordinates of the scaled grid
		var gridy = Math.round(actual_mouseY / zoom);

		
		var tile_type;
		if (tool.value == "wall")	{tile_type = "wall";} else

		if (tool.value == "start")	{tile_type = "start";
			if (start_coords[0] != -1){nodes[start_coords[1]][start_coords[0]].update_square("empty");} //revert the old start to empty
			start_coords = [gridx, gridy];} else //update start with new coords

		if (tool.value == "finnish"){tile_type = "end";
			if (end_coords[0] != -1){nodes[end_coords[1]][end_coords[0]].update_square("empty");} //revert the old start to empty
			end_coords = [gridx, gridy];} else //update start with new coords

		if (tool.value == "eraser")	{tile_type = "empty";
			if ([gridx, gridy] == start_coords)	{start_coords = [-1, -1];} //check if erase start then update coords
			if ([gridx, gridy] == end_coords)	{end_coords = [-1, -1];}}

		nodes[gridy][gridx].update_square(tile_type);
	}
}