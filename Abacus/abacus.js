var canvas = document.getElementById('canvas'), 
	context = canvas.getContext('2d'),
	mode = 'normal', 
	frameColor = 'black',
	beadColor = 'ivory',
	beadSound = document.getElementById('beadSound'),
	activeColor = 'sienna',
	numberOfRodsElement = document.getElementById('numberOfRods'), 
	resetButton = document.getElementById('reset'),
	goButton = document.getElementById('go'),
	repeatButton = document.getElementById('repeat'),
	clockMode = false,
	hths = 0,
	secs = 0,
	mins = 0,
	hours = 0,
	startChrono = 0,
	msPassed = 0,
	stoppedAt = 0,
	numberToPut,
	DISTANCE_RODS = 60, 
	TOP_MARGIN = 60,
	NUMBER_HEIGHT = 20,
	top_frame,
	LEFT_MARGIN = 10,
	FRAME_LINE_WIDTH = 10, 
	ROD_STROKE_STYLE = 'rgba(212,85,0,0.5)', 
	ROD_LINE_WIDTH = 6, 
	DOT_STROKE_STYLE = 'rgba(0, 0, 0, 1)', 
	DOT_FILL_STYLE = 'rgba(255, 255, 255, 1)', 
	DOT_SIZE = 3, 
	BEAD_WIDTH = 56, 
	BEAD_HEIGHT = 30, 
	BEAD_STROKE = 'black',
	HEAVEN = BEAD_HEIGHT * 2 + FRAME_LINE_WIDTH, 
	EARTH = BEAD_HEIGHT * 5, 
	HEIGHT = HEAVEN + EARTH + FRAME_LINE_WIDTH,
	abacus = null,
	intervalId=null,
	chronoTime=0,
	messageOkButton=document.getElementById('messageOkButton');
	messageNoMoreCheckbox=document.getElementById('messageNoMoreCheckbox');
	


// Constructors
var Abacus = function(numberOfRods, mode, frameColor, showNumbers, clockMode) {
	var rods = [];
	for (var i = 0; i < numberOfRods; i++) {
		var beads = [];
		var rod = new Rod(i+1, beads, 0, false);
		for (var j = 0; j < 5; j++) {
			var bead;
			if (j == 0) { 
				bead = new Bead(rod, true, j, false);
			} else {
				bead = new Bead(rod, false, j, false);
			}
			beads.push(bead);
		}
		rods.push(rod);
	}
	this.numberOfRods = numberOfRods;
	this.rods = rods;
	this.mode = mode;
	this.frameColor = frameColor;
	this.showNumbers = showNumbers;
	this.middleRod = Math.floor(numberOfRods / 2) + 1;
	this.width = DISTANCE_RODS * (numberOfRods + 1 );
	if (clockMode) {
		this.hideClockUselessRods();
	} 
}

var Rod = function(position, beads, value) {
	this.position = position;
	this.beads = beads;
	this.value = 0;
	this.disabled = false;
	this.invisible = false;
	
}

var Bead = function(rod, heaven, order, active) {
	this.rod = rod;
	this.heaven = heaven;
	this.order = order;
	this.active = active;
};

var Point = function(x, y) {
	this.x = x;
	this.y = y;
};

// Prototypes
Abacus.prototype = {
	drawFrame: function() {
		context.save();
		context.strokeStyle = frameColor;
		context.lineWidth = FRAME_LINE_WIDTH;
		context.shadowColor = 'rgba(0,0,0,0.5)';
		context.shadowOffsetX = 3;
		context.shadowOffsetY = 3;
		context.shadowBlur = 8;
		context.beginPath();
		context.rect(LEFT_MARGIN, top_frame, this.width, HEIGHT);
		context.moveTo(LEFT_MARGIN + FRAME_LINE_WIDTH / 2, top_frame + HEAVEN);
		context.lineTo(LEFT_MARGIN + this.width - FRAME_LINE_WIDTH / 2, top_frame + HEAVEN);
		context.stroke();
		var middle = Math.floor(this.numberOfRods/ 2);
		context.lineWidth = 1;
		context.strokeStyle = DOT_STROKE_STYLE;
		context.fillStyle = DOT_FILL_STYLE;
		for (var i = 0, x = LEFT_MARGIN + DISTANCE_RODS; i < this.numberOfRods; ++i, x += DISTANCE_RODS) {
			// Dot in this and this +- 3
			if ((i - middle) % 3 === 0) {
				context.beginPath();
				context.arc(x, top_frame + HEAVEN, DOT_SIZE, 0, Math.PI * 2, false);
				context.fill();
				context.stroke();
			}
		}
		context.restore();
	},
	
	drawRods : function() {
		context.save();
		context.strokeStyle = ROD_STROKE_STYLE;
		context.lineWidth = ROD_LINE_WIDTH;
		for (var i = 0, x = LEFT_MARGIN + DISTANCE_RODS; i < this.numberOfRods; ++i, x += DISTANCE_RODS) {
			var rod = this.rods[i];
			rod.draw();
		}
		context.restore();
	},
	
	draw: function() {
		context.save();
		top_frame = TOP_MARGIN + NUMBER_HEIGHT;	
		canvas.height = top_frame + HEIGHT + 10;
		context.clearRect(0,0,canvas.width, canvas.height);
		this.drawRods();
		this.drawFrame();
		context.restore();
	},
	
	reset: function() {
		for (var i = 0; i < this.numberOfRods; i++) {
			var rod = this.rods[i];
			rod.reset();
		}
		abacus.showNumbers = true;
		
	},
	
	hideClockUselessRods: function() {
		this.rods[this.numberOfRods -3].invisible = true;
		this.rods[this.numberOfRods -6].invisible = true;
		this.rods[this.numberOfRods -9].invisible = true;
	},
	
	showClockUselessRods: function() {
		this.rods[this.numberOfRods -3].invisible = false;
		this.rods[this.numberOfRods -6].invisible = false;
		this.rods[this.numberOfRods -9].invisible = false;
	},
	
	disableAllRods: function() {
		for (var i = 0; i < this.numberOfRods; i++) {
			var rod = this.rods[i];
			rod.disabled = true;
		}
	}
	
}

Rod.prototype = {
	drawBeads : function() {
		for (var i = 0; i < this.beads.length; i++){
			this.beads[i].draw(context);
		}
	},
	
	drawRod : function() {
		context.save();
		context.strokeStyle = ROD_STROKE_STYLE;
		context.lineWidth = ROD_LINE_WIDTH;
		if (this.invisible) {
			context.globalAlpha = 0;
		} else if (this.disabled) {
			context.globalAlpha = 0.1;
		} else {
			context.globalAlpha = 1;
		}
		context.shadowColor = 'rgba(0,0,0,0.5)';
		context.shadowOffsetX = 3;
		context.shadowOffsetY = 3;
		context.shadowBlur = 8;
		context.beginPath();
		context.moveTo(this.evalXPos(), top_frame);
		context.lineTo(this.evalXPos(), top_frame + HEIGHT);
		context.stroke();
		context.restore();	
	},
	
	draw : function() {
		this.drawRod();
		this.drawBeads();
		if (abacus.showNumbers) {
			this.writeValue();
		}
	},
	
	evalXPos : function() {
		return LEFT_MARGIN + this.position * DISTANCE_RODS;
	},
	
	
	reset :  function() {
		for (var i = 0; i < this.beads.length; i++){
			this.beads[i].reset();
		}
		this.value = 0;
		
	},
	
	writeValue: function() {
		if (this.invisible) {
			context.globalAlpha = 0;
		} else if (this.disabled) {
			context.globalAlpha = 0.1;
		} else {
			context.globalAlpha = 1;
		}
		context.font="bold 40px Courier New, Courier, monospace";
		context.textAlign="center";
		context.lineWidth=1;
		context.shadowColor = 'rgba(0,0,0,0.2)';
		context.shadowOffsetX = 3;
		context.shadowOffsetY = 3;
		context.shadowBlur = 8;
		//context.fillStyle='rgba(153,76,0,1)';
		context.fillStyle='rgba(92,1,32,1)';
		context.strokeStyle='rgba(92,1,32,1)';
		context.fillText(this.value,this.evalXPos(),TOP_MARGIN);
		context.strokeText(this.value,this.evalXPos(),TOP_MARGIN);
	}
}

Bead.prototype = {
	getPoints : function() {
		var points = [], center = this.evalPosition();
		points.push(new Point(center.x - BEAD_WIDTH / 2, center.y));
		// .

		points.push(new Point(center.x + BEAD_WIDTH / 2, center.y));
		// ____

		points.push(new Point(center.x + BEAD_WIDTH / 6, center.y - BEAD_HEIGHT / 2));
		// ____\

		//  __
		points.push(new Point(center.x - BEAD_WIDTH / 6, center.y - BEAD_HEIGHT / 2));
		// ____\

		//   __
		points.push(new Point(center.x - BEAD_WIDTH / 2, center.y));
		// /____\

		//   __
		points.push(new Point(center.x - BEAD_WIDTH / 6, center.y + BEAD_HEIGHT / 2));
		// /____\
		// \

		//   __
		points.push(new Point(center.x + BEAD_WIDTH / 6, center.y + BEAD_HEIGHT / 2));
		// /____\
		// \ __

		//   __
		points.push(new Point(center.x + BEAD_WIDTH / 2, center.y));
		// /____\
		// \ __ /

		return points;
	},

	evalPosition : function() {// returns the central point of the bead;
		var x = LEFT_MARGIN + this.rod.position * DISTANCE_RODS, y = undefined;

		if (this.heaven) {
			if (this.active) {
				y = top_frame + HEAVEN - BEAD_HEIGHT / 2 - FRAME_LINE_WIDTH / 2;
			} else {
				y = top_frame + BEAD_HEIGHT / 2 + FRAME_LINE_WIDTH / 2;
			}
		} else {//earth
			if (this.active) {
				y = top_frame + HEAVEN + (this.order - 1) * BEAD_HEIGHT + BEAD_HEIGHT / 2 + FRAME_LINE_WIDTH / 2;
			} else {
				y = top_frame + HEAVEN + this.order * BEAD_HEIGHT + BEAD_HEIGHT / 2 + FRAME_LINE_WIDTH / 2;
			}

		}

		return new Point(x, y);
	},

	createPath : function(context) {
		var points = this.getPoints();
		context.beginPath();
		context.moveTo(points[0].x, points[0].y);
		for (var i = 1; i < points.length; ++i) {
			context.lineTo(points[i].x, points[i].y);
		}
	},

	draw : function(context) {
		context.save();
		context.shadowColor = 'rgba(0,0,0,0.5)';
		context.shadowOffsetX = 3;
		context.shadowOffsetY = 3;
		context.shadowBlur = 8;
		if (this.active) {
			context.fillStyle = activeColor;
		} else {
			context.fillStyle = beadColor;
		}
		if (this.rod.invisible) {
			context.globalAlpha = 0;
		} else if (this.rod.disabled) {
			context.globalAlpha = 0.1;
		} else {
			context.globalAlpha = 1;
		}
		context.strokeStyle = BEAD_STROKE;
		context.lineWidth = 1;
		this.createPath(context);
		context.fill();
		context.stroke();
		context.restore();
	},
	
	erase: function(context) {
		context.save();
		context.lineWidth = 0;
		context.fillStyle = "rgba(255,255,255,0)";
		this.createPath(context);
		context.fill();
		context.stroke();
		context.restore();
	},
	
	reset: function() {
		this.active = false;
	}
};

// Functions..............................................
function windowToCanvas(x, y) {
	var bbox = canvas.getBoundingClientRect();
	return { x: x - bbox.left * (canvas.width / bbox.width),
			 y: y - bbox.top * (canvas.height / bbox.height)
	};
}

function saveDrawingSurface() {
	drawingSurfaceImageData = context.getImageData(0, 0, canvas.width, canvas.height);
}

function restoreDrawingSurface() {
	context.putImageData(drawingSurfaceImageData, 0, 0);
}


function resetAbacus() {
	abacus = new Abacus(abacus.numberOfRods, abacus.mode, abacus.frameColor, isNumbersActive, clockMode);
}

function getBead(rod, heaven, order) {
	for (var i = 0; i < rod.beads.length; i++) {
		if (rod.beads[i].heaven === heaven 
		 && rod.beads[i].order === order) {
		 	return rod.beads[i];
		 }	
	}
}


// Event handlers.................................................................

function clickOrTouch(e) {
	if (mode == 'normal') {	
		var loc = windowToCanvas(e.clientX, e.clientY);
		var found = false;
		for (var i = 0; i < abacus.numberOfRods && !found; i++) {
			var currentRod = abacus.rods[i];
			for(var j = 0; j < currentRod.beads.length && !found; j++) {
				var currentBead = currentRod.beads[j];
				currentBead.createPath(context);
				if (context.isPointInPath(loc.x, loc.y)) {
					found = true;
					//if (soundActive) {
						beadSound.play();
					//}
					clickedBead(currentBead);	
				}
			}
		}
		context.clearRect(0, 0, canvas.width, canvas.height);
		//drawAbacus();
		abacus.draw();
		//_gaq.push(['_trackEvent', 'Normal', 'Click']);
	}
}

canvas.onclick = clickOrTouch;



numberOfRodsElement.onchange = function(e) {
	abacus.numberOfRods = parseInt(numberOfRodsElement.value);
	abacus.width = DISTANCE_RODS * (abacus.numberOfRods + 1 );
	canvas.width = abacus.width + 2 * LEFT_MARGIN;
	localStorage.setItem("numberOfRods", numberOfRodsElement.selectedIndex);
	resetAbacus();
	abacus.draw();
};


resetButton.onclick = function(e) {
	//answerElement.style.display = 'none';
	//if (modeElement.value == 'game1') {
		//showButton.disabled = true;
		//goButton.disabled = false;
	//}
	stoppedAt = 0;
	resetAbacus();
	abacus.draw();
};



// Calculations...............................................................

function writeNumberInAbacus(number, unitsRod, disabling) {
	// Convert the number to string to make calculations easier
	if (disabling) {
		abacus.disableAllRods();
	}
	var toWrite = number.toString();
	for (var i = 0; i < toWrite.length; i++) {
		var rodPosition = unitsRod - toWrite.length + i;
		if (disabling) {
			abacus.rods[rodPosition].disabled = false;
		}
		putNumberInRod(toWrite.substring(i,i+1), rodPosition);
	}
	
}

function clickedBead(bead) {
	if (bead.heaven) {
		if (bead.active) {
			bead.active = false;
			bead.rod.value -= 5;
		} else {
			bead.active = true;
			bead.rod.value += 5;
		}
	} else {
		if (bead.active) {
			bead.active = false;
			bead.rod.value--;
			for (var i = bead.order + 1; i <= 4; i++) {
				var nextBead = getBead(bead.rod, false, i);
				if (nextBead.active) {
					nextBead.active = false;
					nextBead.rod.value--;
				}
			}
		} else {
			bead.active = true;
			bead.rod.value++;
			for (var i = 1; i < bead.order; i++) {
				var nextBead = getBead(bead.rod, false, i);
				if (!nextBead.active) {
					nextBead.active = true;
					nextBead.rod.value++;
				}
			}
		}
	}
	return;
}

function putNumberInRod(number, rodNumber) {
    abacus.rods[rodNumber].reset();
    if (number > 0) {
        if (number <= 4) {
            clickedBead(abacus.rods[rodNumber].beads[number]);
        } else if (number == 5) {
            clickedBead(abacus.rods[rodNumber].beads[0]);
        } else if (number < 10) {
		clickedBead(abacus.rods[rodNumber].beads[0]);
		clickedBead(abacus.rods[rodNumber].beads[number-5]);
        } else {
		
	}
    }    
    //drawAbacus();
    abacus.draw();
}

// Initialization..................................................................

//resetAbacus();

abacus = new Abacus(numberOfRods, 'normal', frameColor, false, false);

var	
	lastMessageDate=localStorage.getItem("lastMessageDate");
	modeIndex = localStorage.getItem("mode");
	frameColorIndex = localStorage.getItem("frameColor"),
	numberOfRodsIndex = localStorage.getItem("numberOfRods"),
	isChronoActive = localStorage.getItem("chronoActive"),
	isNumbersActive = true,
numberOfRodsElement.selectedIndex = numberOfRodsIndex;
numberOfRodsElement.onchange.apply();
localStorage.removeItem('showStartMessage');


if (lastMessageDate === null || lastMessageDate != '20140216') {
	//glasspane.style.display='inline';
} else {
	//glasspane.style.display='none';
}
