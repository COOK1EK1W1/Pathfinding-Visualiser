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

	calc_heuristics(){
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