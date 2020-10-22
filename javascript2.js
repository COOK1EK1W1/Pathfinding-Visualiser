const c = document.getElementById("grid"); //get elements
const tool = document.getElementById("tool");
const parent_arrow_checkbox = document.getElementById("parent_arrow_checkbox");
const ctx = c.getContext("2d");

const zoom = 20; //setup constants
const height = 680;
const width = 1580;
const neighbours = [[-1, 1], [ 0, 1], [ 1, 1], [ 1, 0], [ 1,-1], [0,-1], [-1,-1], [-1, 0]];

const colours = {"empty" : "white" , "wall" : "black", "start" : "blue", "end" : "red",
				"closed" : "orange", "path" : "green", "open"  : "pink"} //define colours

var start_coords = [-1, -1]; //setup initial coords for start and end
var end_coords = [-1, -1];

var open_nodes = []; //setup initial lists for nodes
var closed_nodes = [];
var nodes = [];

var algo_loop; //setup varialbes for the loops
var draw_loop;

class Node{ 
	//G cost = distance from starting node
	//H cost = distance from end node
	//F cost = Gcost + Hcost
	constructor(x, y){
		this.x = x; 
		this.y = y;
		this.type = "empty";
		this.parent = null;
		this.closed = false;
		this.G_cost = 0;
		this.F_cost = 0;
		this.H_cost = 0
	}

	init(){
		if (this.parent == null){this.G_cost = 0;}else{ //G cost calculation
			var horiz = Math.abs(this.parent.x - this.x);
			var vert = Math.abs(this.parent.y - this.y);
			if (horiz == vert){this.G_cost = this.parent.G_cost + 14;}
			else{this.G_cost = this.parent.G_cost + 10;}
		}
		horiz = Math.abs(end_coords[0] - this.x); //H cost calculation
		vert = Math.abs(end_coords[1] - this.y);
		if (horiz == vert){this.H_cost = horiz * 14;}else
		if (horiz < vert){
			this.H_cost = horiz * 14 + (vert - horiz) * 10;
		}else{
			this.H_cost = vert * 14 + (horiz - vert) * 10;
		}
		this.F_cost = this.H_cost + this.G_cost; //F cost calculation
	}

    update_square(type){
		var colour;
		if (type != "same"){this.type = type;} //update to new type
		colour = colours[this.type];

		ctx.beginPath(); //drawing the square
		ctx.fillStyle = colour;
		ctx.strokeStyle = "black";
		ctx.fillRect(this.x * zoom, this.y * zoom, zoom, zoom);		//inner fill
		ctx.rect(this.x * zoom, this.y * zoom, zoom, zoom);			//outer fill
		ctx.closePath();
		ctx.stroke();
		
		//draw the arrow pointint the parent node
		if (parent_arrow_checkbox.checked == true && this.parent != null){ 
			ctx.strokeStyle = "#FF0000";
			ctx.moveTo(this.x * zoom + zoom / 2, this.y * zoom + zoom / 2);
			ctx.lineTo(((this.parent.x - this.x) * 0.4 + this.x) * zoom + zoom / 2, ((this.parent.y - this.y) * 0.4 + this.y) * zoom + zoom / 2);
			ctx.stroke();
		}
		
	}

	tracepath(){ //recursive function which traces the shortest path
		this.update_square("path");
		if (this.parent != null){
			this.parent.tracepath();}
	}
}

function setup(){
	nodes = []
	clearInterval(algo_loop);
	for (var y = 0; y < height / zoom; y++){//set up the 2d array of nodes 
		var node_row = [];
		for (var x = 0; x < width / zoom; x++){
			node_row.push(new Node(x, y));
		}
		nodes.push(node_row);
	}
	for (var y = 0; y < height / zoom; y++){ //update all the nodes
		for (var x = 0; x < width / zoom; x++){
			nodes[y][x].update_square("empty");
		}
	}
	start_coords = [-1, -1]; //reset the start and end coords
	end_coords = [-1, -1];
}

function redraw(){
	for (var y = 0; y < height / zoom; y++){ //update all the nodes
		for (var x = 0; x < width / zoom; x++){
			nodes[y][x].update_square("same");
		}
	}
}



setup();


	/*##############################A* Algotrithm##################################*/

function start_loop(){
	algo_loop = setInterval(step, 0);}

function step(){
	if (start_coords[0] == -1 || end_coords[0] == -1){
		alert("Please ensure you have a start and finnish");
		clearInterval(algo_loop);
		return;
	}
	if (open_nodes.length == 0){ //check if there is no path
		alert("no path");
		clearInterval(algo_loop);
		return;
	}

	var lowest_node = open_nodes[0];
	for (var i = 0; i < open_nodes.length; i++){
		if (open_nodes[i].F_cost < lowest_node.F_cost || (open_nodes[i].F_cost == lowest_node.F_cost && open_nodes[i].H_cost < lowest_node.H_cost)){
			lowest_node = open_nodes[i];
		}
	}
	var Current = lowest_node;
	for( var i = 0; i < open_nodes.length; i++){ 
		if ( open_nodes[i] === Current) { 
			open_nodes.splice(i, 1); 
		}
	}
	closed_nodes.push(Current);
	Current.update_square("closed");

	if (Current.x == end_coords[0] && Current.y == end_coords[1]){
		//probably stopt he loop idk how to do that yet
		
		Current.tracepath();
		open_nodes = [];
		closed_nodes = [];
		clearInterval(algo_loop);
		alert("Path Found");
	}else{
		for (var neighbour = 0;neighbour < neighbours.length;neighbour++){
			var neighbourcoords = [Current.x + neighbours[neighbour][0], Current.y + neighbours[neighbour][1]];
			var in_closed = false;
			for (var node = 0; node < closed_nodes.length;node++){
				if (closed_nodes[node].x == neighbourcoords[0] && closed_nodes[node].y == neighbourcoords[1]){in_closed = true;}
			}

			if (!(neighbourcoords[0] < 0 ||
				neighbourcoords[0] > (width / zoom) - 1 ||
				neighbourcoords[1] < 0 ||
				neighbourcoords[1] > (height / zoom) - 1)){
				var closed_corner = false;
				if (nodes[Current.y + neighbours[neighbour][1]][Current.x].type == "wall" && neighbour % 2 == 0 &&
					nodes[Current.y][Current.x + neighbours[neighbour][0]].type == "wall"){closed_corner = true;}	
				if(!(
				nodes[neighbourcoords[1]][neighbourcoords[0]].type == "wall" ||
				closed_corner ||
				in_closed)){
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
}
	/*##############################A* Algotrithm##################################*/

var mouseup = true;
function setmousedown(event){mouseup = false;mouse_draw(event);}	//check if mouse is down
function setmouseup(){mouseup = true;}								//check if mouse is up
function mouse_move(event){mouse_draw(event);}						//check if mouse has moved

function mouse_draw(event){
	if (!mouseup){
		var actual_mouseX = event.clientX - 9; //local coordinated of the canvas
		var actual_mouseY = event.clientY - 110;

		var gridx = Math.round(actual_mouseX / zoom); //local coordinates of the scaled grid
		var gridy = Math.round(actual_mouseY / zoom);

		
		var tile_type;

		if (gridx == start_coords[0] && gridy == start_coords[1] && tool.value != "start"){start_coords = [-1, -1];} //check if the start or end has been erased
		if (gridx == end_coords[0] && gridy == end_coords[1] && tool.value != "end"){end_coords = [-1, -1];}

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

		if (tool.value == "eraser")	{tile_type = "empty";}

		nodes[gridy][gridx].update_square(tile_type);
	}
}