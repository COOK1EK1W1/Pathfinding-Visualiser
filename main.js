const c = document.getElementById("grid"); //get elements
const tool = document.getElementById("tool");
const parent_arrow_checkbox = document.getElementById("parent_arrow_checkbox");
const algorithm = document.getElementById("algorithm");
const play_pause_button = document.getElementById("play_pause");
const nav_div = document.getElementById("nav");
var andrew = new Image();
andrew.src = "andrew.jpg";
const ctx = c.getContext("2d");

//nav_dir.width = screen.width;

const zoom = 20; //setup constants
const height = Math.round((window.innerHeight - 100 - zoom) / zoom) * zoom;
const width = Math.round(window.innerWidth / zoom) * zoom;
ctx.canvas.width = width;
ctx.canvas.height = height;
const neighbours = [[-1, 1], [ 0, 1], [ 1, 1], [ 1, 0], [ 1,-1], [0,-1], [-1,-1], [-1, 0]];



const colours = {"empty" : "white" , "wall" : "black", "start" : "blue", "end" : "red",
				"closed" : "orange", "path" : "green", "open"  : "pink"} //define colours

var start_coords = [-1, -1]; //setup initial coords for start and end
var end_coords = [-1, -1];

var open_nodes = []; //setup initial lists for nodes
var closed_nodes = [];
var nodes = [];

var algo_loop; //setup varialbes for the loops

var play = true;

var algo_started = false;
var algo_finished = false;



function setup(){
	nodes = []
	clearInterval(algo_loop);
	play = true;
	play_pause_button.innerHTML = "Run";

	for (var y = 0; y < height / zoom; y++){//set up the 2d array of nodes 
		var node_row = [];
		for (var x = 0; x < width / zoom; x++){
			node_row.push(new Node(x, y));
		}
		nodes.push(node_row);
	}
	for (var y = 0; y < height / zoom; y++){ //update all the nodes
		for (var x = 0; x < width / zoom; x++){
			nodes[y][x].parent = null;
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

function clear_path(){
	for (var y = 0; y < height / zoom; y++){ //update all the nodes
		for (var x = 0; x < width / zoom; x++){
			if (nodes[y][x].type == "closed" || nodes[y][x].type == "open" || nodes[y][x].type == "path"){
				nodes[y][x].parent = null;
				nodes[y][x].update_square("empty");
			}
		}
	}
	nodes[start_coords[1]][start_coords[0]].update_square("start");
	nodes[end_coords[1]][end_coords[0]].update_square("end");
	open_nodes = [];
	closed_nodes = [];
	algo_started = false;
	algo_finished = false;

}

setup();

function start_loop(){
	if (start_coords[0] == -1 || end_coords[0] == -1){
		alert("Please ensure you have a start and finnish");
		clearInterval(algo_loop);
		
		return;}
	if (play){
		play_pause_button.innerHTML = "Pause";
		if (algo_finished){
			clear_path();
		}
		algo_loop = setInterval(step, 0);
		play = false;
	}else{
		play_pause_button.innerHTML = "Run";
		clearInterval(algo_loop);
		play = true;
	}
}

function finnished(){
	clearInterval(algo_loop);
	algo_finished = true;
	play_pause_button.innerHTML = "Run";
	play = true;

}


function is_traversable(x1, y1, x2, y2){
	for (var node = 0; node < closed_nodes.length;node++){ //check if the node is in closed
		if (closed_nodes[node].x == x2 && closed_nodes[node].y == y2){return false;}
	}
	
	if ((x2 < 0 || x2 > (width / zoom) - 1 || //check if out of bounds
		  y2 < 0 || y2 > (height / zoom) - 1)){return false;}

	if (nodes[y2][x1].type == "wall" && 
		nodes[y1][x2].type == "wall" &&
		Math.abs(x2 - x1) == 1 && Math.abs(y2 - y1) == 1){return false;} //check if closed corner

	if((nodes[y2][x2].type == "wall")){return false;} //check if it is a wall
	
	return true; //if it is not not traversable the it is traversable
}


function step(){
	if (algorithm.value == "A_Star"){A_Star();}
	if (algorithm.value == "dijkstra"){dijkstra();}
	if (algorithm.value == "andrew"){andrewa();}
}

/*##################################A* Algotrithm######################################*/
function A_Star(){
	if (algo_started == false){
		open_nodes.push(nodes[start_coords[1]][start_coords[0]]);
		algo_started = true;
	}

	if (open_nodes.length == 0){ //check if there is no path
		alert("no path");
		finnished();
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
		
		Current.tracepath();
		open_nodes = [];
		closed_nodes = [];
		finnished();
		alert("Path Found");
	}else{
		for (var neighbour = 0;neighbour < neighbours.length;neighbour++){
			var neighbourcoords = [Current.x + neighbours[neighbour][0], Current.y + neighbours[neighbour][1]];

			if (is_traversable(Current.x, Current.y, neighbourcoords[0], neighbourcoords[1])){
				var testing_node = nodes[neighbourcoords[1]][neighbourcoords[0]];
				if (testing_node.type != "open"){
					testing_node.parent = Current;
					testing_node.calc_heuristics();
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
/*##################################A* Algotrithm######################################*/

/*##############################Dijkstra's Algotrithm##################################*/
function dijkstra(){
	if (algo_started == false){
		algo_started = true;
		for (var y = 0; y < nodes.length; y++){
			for(var x = 0; x < nodes[y].length; x++){
				nodes[y][x].G_cost = Infinity;
			}
		}
		nodes[start_coords[1]][start_coords[0]].G_cost = 0;
		open_nodes.push(nodes[start_coords[1]][start_coords[0]]);
	}
	var lowest_node = open_nodes[0]
	for (var node = 0; node < open_nodes.length; node++){
		if (open_nodes[node].G_cost < lowest_node.G_cost){
			lowest_node = open_nodes[node];
		}
	}
	var Current = lowest_node;
	closed_nodes.push(Current);
	for( var i = 0; i < open_nodes.length; i++){ 
		if ( open_nodes[i] === Current) { 
			open_nodes.splice(i, 1); 
		}
	}
	Current.update_square("closed");
	if (Current.x == end_coords[0] && Current.y == end_coords[1]){
		Current.tracepath();
		open_nodes = [];
		closed_nodes = [];
		alert("Path Found");
		finnished();
	}

	for (var neighbour = 0; neighbour < neighbours.length; neighbour++){
		var neighbourcoords = [Current.x + neighbours[neighbour][0], Current.y + neighbours[neighbour][1]];
		
		if (is_traversable(Current.x, Current.y, neighbourcoords[0], neighbourcoords[1])){
			var neighbour_node = nodes[neighbourcoords[1]][neighbourcoords[0]];
			var newdist =  Current.G_cost;
			if (neighbour % 2 == 0){newdist += 14}else{newdist += 10;}
			if (newdist < neighbour_node.G_cost){
				if (neighbour_node.G_cost == Infinity){
					open_nodes.push(neighbour_node);
					neighbour_node.type= "open";
				}
				neighbour_node.G_cost = newdist;
				neighbour_node.parent = Current;
				neighbour_node.update_square("same");
			}
		}
	}
}
/*##############################Dijkstra's Algotrithm##################################*/
var x = 1;
var y = 1;
var xv = 1;
var yv = 1;
function andrewa(){
	x += xv
	if (x > width - 200){xv = -1;}
	if (x < 0){xv = 1;}
	if (y > height - 150){yv = -1;}
	if (y < 0){yv = 1;}

	y += yv
	ctx.drawImage(andrew, x, y, 200, 150);
}