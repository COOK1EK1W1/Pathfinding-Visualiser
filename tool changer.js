function change_tool(){
	var element = document.getElementById("tool");
	var value = element.value;
	if (value == "wall"){
		element.innerHTML = "Start";
		element.value = "start"}
	else if (value == "start"){
		element.innerHTML = "Finnish";
		element.value = "finnish"}
	else if (value == "finnish"){
		element.innerHTML = "Eraser";
		element.value = "eraser"}
	else if (value == "eraser"){
		element.innerHTML = "Wall";
		element.value = "wall"}
}