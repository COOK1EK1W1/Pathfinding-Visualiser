var mouseup = true;
function setmousedown(event){mouseup = false; mouse_draw(event);}	//check if mouse is down
function setmouseup(){mouseup = true;}								//check if mouse is up
function mouse_move(event){mouse_draw(event);}						//check if mouse has moved

function mouse_draw(event){
	if (!mouseup){
		var actual_mouseX = event.clientX - zoom / 2; //local coordinated of the canvas
		var actual_mouseY = event.clientY - 100 - zoom / 2;

		var gridx = Math.round(actual_mouseX / zoom); //local coordinates of the scaled grid
		var gridy = Math.round(actual_mouseY / zoom);

		
		var tile_type;

		if (gridx == start_coords[0] && gridy == start_coords[1] && tool.value != "start"){start_coords = [-1, -1];} //check if the start or end has been erased
		if (gridx == end_coords[0] && gridy == end_coords[1] && tool.value != "end"){end_coords = [-1, -1];}

		if (tool.value == "wall")	{tile_type = "wall";} else

		if (tool.value == "start")	{tile_type = "start";
			if (start_coords[0] != -1){nodes[start_coords[1]][start_coords[0]].update_square("empty");} //revert the old start to empty
			start_coords = [gridx, gridy];//update start with new coords
		} else

		if (tool.value == "finnish"){tile_type = "end";
			if (end_coords[0] != -1){nodes[end_coords[1]][end_coords[0]].update_square("empty");} //revert the old start to empty
			end_coords = [gridx, gridy];//update start with new coords
		} else 

		if (tool.value == "eraser")	{tile_type = "empty";}

		nodes[gridy][gridx].update_square(tile_type);
	}
}