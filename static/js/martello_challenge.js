var g = document.getElementById("g");
var tracker = {};
var colours = ["#800000","#e6194b","#f58231","#008080","#000075","#4363d8","#911eb4","#f032e6","#e6beff","#000000","808080","808000"];
var nameColours = {};
var sliderVal = 0;
allEpochs = [];
epochIndex = 0;
mutex = 0;

const circlePadding = 40;
const textPadding = 20;

//testing
// updatePerson("Veronica","0");
// updatePerson("Jimmy","199");
// updatePerson("Jake","234");
// setTimeout(function(){updatePerson("Veronica","110");}, 2000);
// setTimeout(function(){updatePerson("Jimmy","244");}, 4000);
// setTimeout(function(){updatePerson("Jimmy","130");}, 6000);

function onStart() {
	// getting all epochs
	var http = new XMLHttpRequest();
	http.onreadystatechange = function() {//Call a function when the state changes.
		if(http.readyState == 4 && http.status == 200) {
			allEpochs = JSON.parse(this.responseText);
			console.log(allEpochs)
			getEpoch(sliderVal)
		}
	}
	http.open('GET', "/allepochs", true);
	http.send();	
	console.log("sent ting");

}

function getEpoch(index) {
	epoch = allEpochs[index]
	epochIndex = index

	updateView(parseInt(epoch))
}

function updateView(time){
	
	console.log(nameColours)
	
	sliderVal = epochIndex;
	document.getElementById("timeSlider").value = sliderVal;

	var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
	console.log(time)
	d.setSeconds(time);
	console.log(d)

	d = d.toString().split(" ")[4];
	document.getElementById("sliderValLabel").innerHTML = "Time: " + d;

	//update people
	// console.log(time.toString())
    // if (! allEpochs.includes(time.toString())) {
	// 	// if there is no actual epoch for it dont call the thing
	// 	console.log("Doesnt contains")
	// 	return
	// } 

	if(mutex == 0){
		console.log("creating request")
		var http = new XMLHttpRequest();
		http.onreadystatechange = function() {//Call a function when the state changes.
			if(http.readyState == 4 && http.status == 200) {
				updates = JSON.parse(this.responseText);
				console.log(updates)

				clearAll();
				for(person of Object.keys(updates)){
					redraw(person,updates[person].location);
				}
				mutex = 0;
			}
			else{
				mutex = 1;
			}
		}
		http.open('GET', "/time/"+time, true);
		http.send();

		// console.log("sent ting " + test);
	}
	
}

function clearAll(){
	tracker = {};
	for(name of Object.keys(nameColours)){
		if(document.getElementById(name)){
			document.getElementById(name).outerHTML = "";
			document.getElementById(name+"_text").outerHTML = "";
		}
	}
}

function redraw(name,room){
	//parse the room if not ice
	if(room == "0"){
		x = -1000;
		y = -1000;
	}
	else if(room[0] == "a"){
		var roomObj = document.getElementById(room);
		var d = roomObj.getAttribute("d");
		d = d.split("[aA]")[0].split(",");
		
		x = parseFloat(d[0].slice(1));
		y = parseFloat(d[1]);	
	}
	else if(room == "150" || room == "250" || room == "220"){
		var roomObj = document.getElementById(room);
		var d = roomObj.getAttribute("d");
		d = d.split("[h]")[0].split(",");

		x = parseFloat(d[0].slice(1)) -70;
		y = parseFloat(d[1]) - 100;	
	}
	else if(room != "234"){
		var roomObj = document.getElementById(room);
		var d = roomObj.getAttribute("d");
		d = d.split("H")[1].split(/V/i);

		x = parseFloat(d[0]);
		y = parseFloat(d[1].split("H")[0]);	

		
	}
	
	//otherwise its ice
	else{
		x = 480;
		y = 1100;
	}

	//delete old elements if they exist
	if(document.getElementById(name)){
		// document.getElementById(name).outerHTML = "";
		// document.getElementById(name+"_text").outerHTML = "";

		//take that person out of their old room
		// for(key of Object.keys(tracker)) {
		// 	if(tracker[key].indexOf(name) != -1){
		// 		tracker[key].splice(tracker[key].indexOf(name), 1);
		// 	}
		// }
	}
	//check if they don't have a colour name
	
	if(!nameColours[name]){
		nameColours[name] = colours[Object.keys(nameColours).length];
	}

	//add that person to the room
	if(!tracker[room]){
		//initialize
		tracker[room] = [];
	}
	tracker[room].push(name);

	//how many people in that room rn?
	n = tracker[room].length -1
	let personSpacing = circlePadding + textPadding + 10;

	//adjust for room type

	//elevator
	if(room == "199"){
		x += personSpacing * n;
	}
	//Access Point
	else if(room[0] == "a"){
		if(room.charAt(room.length - 1) == "2"){
			x += (personSpacing+30) * n - 140;
			y -= 25;
		}
		else{
			y += personSpacing * (n%2) - 80;

			//if first floor, add custom spacing technique
			if(room[2] == "1"){
				x += Math.floor(n/2) * personSpacing - 120 ;
			}
			else{
				x -= personSpacing;
			}
	
		}
	}
	//otherwise regular room
	else{
		//check if exceeds max to overlap
		if(n >= 4){
			n -= 4;
			x += personSpacing + 30;
		}

		y += personSpacing * n;
	}

	//create new svg elements
	g.appendChild(makeCircle(name,x,y));
	g.appendChild(makeText(name,x,y));

}

function makeCircle(name,x,y){
	// create a circle
	let cir = document.createElementNS("http://www.w3.org/2000/svg", "circle");
	cir.setAttribute("id",name);
    cir.setAttribute("cx", x+circlePadding);
    cir.setAttribute("cy", y+circlePadding);
    cir.setAttribute("r", "15");
    cir.setAttribute("fill", nameColours[name]);

	return cir;
}

function makeText(name,x,y){
	//create text
	let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
	text.setAttribute("id",name+"_text");
    text.setAttribute("x", x+textPadding);
	text.setAttribute("y", y+textPadding);
	text.setAttribute("font-family","Verdana");
	text.setAttribute("font-size",25);
	text.setAttribute("fill",nameColours[name]);
	text.textContent = name;

	return text;
}

//button onclicks to increment

document.getElementById("button-left").addEventListener('click',function(){
	var t;
	var btn_left = document.getElementById("button-left");

    var repeat = function () {
        if(sliderVal > 0){
			epochIndex -= 1;
			sliderVal = allEpochs[epochIndex] // gets the next epoch above
			updateView(parseInt(sliderVal));
		}
        t = setTimeout(repeat, 100);
        //start = start / speedup;
    }

    btn_left.onmousedown = function() {
		repeat();
    }

    btn_left.onmouseup = function () {
        clearTimeout(t);
    }
});

var btn_right = document.getElementById("button-right");
btn_right.addEventListener('click',function(){
	console.log("hi");
	var t;

    var repeat = function () {
        if(sliderVal < 441){
			epochIndex += 1;
			sliderVal = allEpochs[epochIndex] // gets the next epoch above
			updateView(parseInt(sliderVal));
		}
        t = setTimeout(repeat, 100);
        //start = start / speedup;
    }

    btn_right.onmousedown = function() {
        repeat();
    }

    btn_right.onmouseup = function () {
        clearTimeout(t);
    }
});

onStart();
// updateView(sliderVal);