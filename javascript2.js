const c = document.getElementById("grid");
const ctx = c.getContext("2d");
const zoom = 20;
const height = 680;
const width = 1580;
const tool = document.getElementById("tool");

var start_coords = [-1, -1];
var end_coords = [-1, -1];

const neighbours = [[-1, 1], [ 0, 1], [ 1, 1], [ 1, 0], [ 1,-1], [0,-1], [-1,-1], [-1, 0]];
var open_nodes = [];
var closed_nodes = [];

var nodes = [];
var loop;

class Node{ 
	//G cost = distance from starting node
	//H cost = distance from end node
	//F cost = Gcost + Hcost
	constructor(x, y, parent=null){
		this.x = x;
		this.y = y;
		this.type = "empty";
		this.parent = parent;
		this.closed = false;
		this.G_cost = 0;
		this.F_cost = 0;
		this.H_cost = 0
	}

	init(){
		if (this.parent == null){this.G_cost = 0;}else{
			var horiz = Math.abs(this.parent.x - this.x);
			var vert = Math.abs(this.parent.y - this.y);
			if (horiz == vert){this.G_cost = this.parent.G_cost + 14;}else{this.G_cost = this.parent.G_cost + 10;}
		}
		horiz = Math.abs(end_coords[0] - this.x);
		vert = Math.abs(end_coords[1] - this.y);
		if (horiz == vert){this.H_cost = horiz * 14;}else
		if (horiz < vert){
			this.H_cost = horiz * 14 + (vert - horiz) * 10;
		}else{
			this.H_cost = vert * 14 + (horiz - vert) * 10;
		}
		this.F_cost = this.H_cost + this.G_cost;
	}

    update_square(type){
		var colour;
		this.type = type;
		if (this.type == "empty"){colour = "white";}
		if (this.type == "wall"){colour = "black";}
		if (this.type == "start"){colour = "blue";}
		if (this.type == "end")	{colour = "red";}
		if (this.type == "closed")	{colour = "orange";}
		if (this.type == "path")	{colour = "green";}
		if (this.type == "open")	{colour = "pink";}

		ctx.beginPath();
		ctx.fillStyle = colour;
		ctx.fillRect(this.x * zoom, this.y * zoom, zoom, zoom);
		ctx.rect(this.x * zoom, this.y * zoom, zoom, zoom);
		ctx.stroke();
	}

	tracepath(){
		this.update_square("path");
		if (this.parent != null){
			this.parent.tracepath();}
	}
}




// startup draw grid

function setup(){
	clearInterval(loop);
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


	/*##############################epic algotrithm##################################*/

function start_loop(){
	loop = setInterval(step, 1);}

function step(){
	if (open_nodes.length == 0){alert("no path");return;}
	var lowest_node = open_nodes[0];
	for (var i = 0; i < open_nodes.length; i++){
		if (open_nodes[i].F_cost < lowest_node.F_cost || (open_nodes[i].F_cost == lowest_node.F_cost && open_nodes[i].H_cost < lowest_node.H_cost)){
			lowest_node = open_nodes[i];
		}
	}
	var Current = lowest_node;
	for( var i = 0; i < open_nodes.length; i++){ 
		if ( open_nodes[i] === Current) { 
			open_nodes.splice(i, 1); }}
	closed_nodes.push(Current);
	Current.update_square("closed");

	if (Current.x == end_coords[0] && Current.y == end_coords[1]){
		//probably stopt he loop idk how to do that yet
		
		Current.tracepath();
		open_nodes = [];
		closed_nodes = [];
		clearInterval(loop);
		alert("yo path foind");
	}else{
		for (var neighbour = 0;neighbour < 8;neighbour++){
			var neighbourcoords = [Current.x + neighbours[neighbour][0], Current.y + neighbours[neighbour][1]];
			var in_closed = false;
			for (var node = 0; node < closed_nodes.length;node++){
				if (closed_nodes[node].x == neighbourcoords[0] && closed_nodes[node].y == neighbourcoords[1]){in_closed = true;}
			}

			var closed_corner = false;
			//corner cutting logic goes here lol help

			if (neighbourcoords[0] < 0 ||
				neighbourcoords[0] > (width / zoom) ||
				neighbourcoords[1] < 0 ||
				neighbourcoords[1] > (height / zoom) ||
				nodes[neighbourcoords[1]][neighbourcoords[0]].type == "wall" ||
				closed_corner ||
				in_closed){}else{
					var testing_node = nodes[neighbourcoords[1]][neighbourcoords[0]];
					if (testing_node.type != "open"){
						testing_node.parent = Current;
						testing_node.init();
						open_nodes.push(testing_node);
						testing_node.update_square("open");
						
						
					}else{
						for(var node = 0; node < open_nodes.length; node++){
							var newGcost = Current.G_cost;
							if (neighbour % 2 == 0){newGcost+=14;}else{newGcost+=10;}
							if (open_nodes[node].x == neighbourcoords[0] && open_nodes[node].y == neighbourcoords[1] && open_nodes[node].G_cost > newGcost){
								open_nodes[node].G_cost = newGcost;
								open_nodes[node].F_cost = open_nodes[node].G_cost + open_nodes[node].H_cost;
								open_nodes[node].parent = Current;
								open_nodes[node].update_square("open");
							}
						}
					}
				}

		}
	}
}
	/*##############################epic algotrithm##################################*/

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
			start_coords = [gridx, gridy];//update start with new coords
			open_nodes = [nodes[gridy][gridx]]; 
		} else

		if (tool.value == "finnish"){tile_type = "end";
			if (end_coords[0] != -1){nodes[end_coords[1]][end_coords[0]].update_square("empty");} //revert the old start to empty
			end_coords = [gridx, gridy];//update start with new coords
		} else 

		if (tool.value == "eraser")	{tile_type = "empty";
			if ([gridx, gridy] == start_coords)	{start_coords = [-1, -1];} //check if erase start then update coords
			if ([gridx, gridy] == end_coords)	{end_coords = [-1, -1];}}

		nodes[gridy][gridx].update_square(tile_type);
	}
}