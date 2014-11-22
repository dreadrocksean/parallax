$(function() {
	// Parallax.setOptions({fps:200});
	var section1WayStates = {
		0:{'left': '37.5%', 'top': '25%', 'opacity': 1},
		10:{},
		20:{'top': '50%'},
		30:{},
		40:{'top': '25%'},
		45:{},
		100:{'left': '100%', 'top': '-30%', 'opacity': 0}
	};
	Parallax.subscribe({wayStates: section1WayStates, id:'js-section1', ease:'easeInOutQuart'});

	var section2WayPoints = {
		0:{'left': '37.5%', 'top': '25%', 'opacity': 1},
		10:{},
		20:{'top': '0%'},
		30:{},
		40:{'top': '25%'},
		45:{},
		100:{'top': '-30%', 'opacity': 0}
	};
	Parallax.subscribe({wayStates: section2WayPoints, id:'js-section2', ease:'easeInOutQuart'});

	var section3WayPoints = {
		0:{'left': '-50%', 'top': '25%', 'opacity': 1},
		10:{},
		20:{'left': '37.5%'},
		45:{},
		100:{'left': '-25%', 'top': '-30%', 'opacity': 0}
	};
	Parallax.subscribe({wayStates: section3WayPoints, id:'js-section3', ease:'easeInOutQuart'});

	var section4WayPoints = {
		0:{'left': '37.5px', 'top': '500px', 'opacity': 1},
		15:{},
		35:{'top': '30px'},
		39:{},
		53:{'top': '300px'},
		61:{'width': '25%', 'height': '200px'},
		100:{'left': '1000px', 'opacity': 0, 'width': '100%', 'height': '800px'}
	};
	Parallax.subscribe({wayStates: section4WayPoints, id:'js-section4', ease:'bounce'});

	Parallax.subscribe({rate:.5, id:'p1'});
	Parallax.subscribe({rate:1.5, id:'p2'});
	Parallax.subscribe({rate:3, id:'p3'});

	Parallax.updateScroll();
});