var Parallax = (function(Parallax) {

	var elements = []
		,options = {}
		,blockEvents = false,iMap,ease
		,requestAnimationFrame
		,scrollHeight,windowHeight,scrollWidth,windowWidth
		,t,origBodyHeight,parallaxEls;

	var _get_window_height = function() {
	    return window.innerHeight || 
	           document.documentElement.clientHeight ||
	           document.body.clientHeight || 0;
	};
	var _get_window_Yscroll = function() {
	    return window.pageYOffset || 
	           document.body.scrollTop ||
	           document.documentElement.scrollTop || 0;
	};
	var _get_doc_height = function() {
	    return Math.max(
	        document.body.scrollHeight || 0, 
	        document.documentElement.scrollHeight || 0,
	        document.body.offsetHeight || 0, 
	        document.documentElement.offsetHeight || 0,
	        document.body.clientHeight || 0, 
	        document.documentElement.clientHeight || 0
	    );
	};
	var _get_scroll_percentage = function() {
	    return _get_window_Yscroll() / (_get_doc_height() - _get_window_height()) * 100;
	};

	var getOption = function(option) {
		return options[option];
	};

	var calcInterpolation = function(nextVal, prevVal, stageRatio, ease) {
		if (typeof Easing !== 'undefined' && Easing[ease]) {
			stageRatio = Easing[ease](stageRatio);
		}
		return (nextVal - prevVal) * stageRatio + prevVal;
	};

	var getInterState = function(prevState, nextState, stageRatio, ease) {
		var interState = {};
		_.each(prevState, function(val, prop) {
			var unit = '';
			if (typeof val === 'string') {
				if (val.indexOf('px') !== -1) {
					unit = 'px';
				} else if (val.indexOf('%') !== -1) {
					unit = '%';
				}
				val = parseFloat(val);
			}
			nextState[prop] = (nextState[prop] || nextState[prop] === 0)? nextState[prop]: prevState[prop];
			interState[prop] = 	"" + calcInterpolation(parseFloat(nextState[prop]), val, stageRatio, ease) + unit;
		});
		return interState;
	};

	var updateParallax = function(element, scrollPosY) {
		if (!element.wayStates || _.isEmpty(element.wayStates)) {
			var delta = element.rate? _get_window_Yscroll() * element.rate: 0;
			element.el.style.top = element.el.origY - delta + 'px';
		} else {
			_.each(element.wayStates[scrollPosY], function(val, prop) {
				element.el.style[prop] = val;
			});
		}
	};

	var interpolate = function(currPercent, keys, tempStates, states, ease) {
		currKey = currPercent / iMap;
		var prevKey, nextKey, prevPoint, nextPoint, i=-1;
		nextKey = _.find(keys, function(k) {
			i++;
			return parseInt(k, 10) > currKey;
		});
		if (!nextKey) {
			return tempStates[tempStates.length - 1];
		}
		nextKey = nextKey || keys[i];
		prevKey = keys[i-1]? keys[i-1]: 0;

		prevState = prevKey? states[prevKey]: tempStates[0];
		nextState = states[nextKey];
		var stageRatio = (currKey - prevKey) / (nextKey - prevKey);

		return getInterState(prevState, nextState, stageRatio, ease);
	};

	var requestAnimationFrame = function(f) {
		var fps = getOption('fps');
		if (blockEvents) {return;}
		t = setTimeout(f, 1000/fps);
		blockEvents = true;
	};

	var setOptions = function(opts) {
		_.extend(options, opts);
	};

	var initStyles = function() {
		for (var i=0,el; el=elements[i]; i++) {
			if (el.el.flow) {continue;}
			el.el.style.position = 'fixed';
		}
		for (var i=0,el; el=elements[i]; i++) {
			if (!el.el.flow) {continue;}
			el.el.origY = el.el.offsetTop;
			el.el.style.top = el.el.origY+'px';
			el.el.origL = el.el.offsetLeft;
			el.el.style.left = el.el.origL+'px';
			el.el.origW = el.el.offsetWidth;
			el.el.style.width = el.el.origW+'px';
		}
		for (var i=0,el; el=elements[i]; i++) {
			el.el.style.position = 'fixed';
		}
	};

	var getBodyHeight = function() {
		var removeHeight = 0;
		for (var i=0,el; el=elements[i]; i++) {
			if (!el.el.flow) {
				removeHeight += parseFloat(getComputedStyle(el.el, null).getPropertyValue('height'));
			}
		}
		return origBodyHeight - removeHeight;
	};

	var checkLast = function() {
		if (elements.length < parallaxEls.length) {return;}
		document.body.style.height = getBodyHeight() + 'px';
		initStyles();
	};

	var init = function(options) {
		setOptions(options? {fps:options.fps || 60}: {fps: 60});
		setOptions(options? {resolution:Math.max(100, options.resolution) || 1000}: {resolution:1000});
		iMap = getOption('resolution') / 100;
		origBodyHeight = document.body.offsetHeight;
		parallaxEls = document.getElementsByClassName('parallax');

		window.addEventListener('scroll', function() { // on page scroll
			requestAnimationFrame(Parallax.updateScroll);
		}, false);
		 
		window.addEventListener('resize', function() {
			requestAnimationFrame(Parallax.updateScroll);
			document.body.height = getBodyHeight() + 'px';
		}, false);
	};

	/*======================= Public Functions  =======================*/
	Parallax.updateScroll = function() {
		blockEvents = false;
		var scrollPercentY = parseFloat(_get_scroll_percentage()).toFixed(2);
		for (var i=0,el; el = elements[i]; i++) {
			updateParallax(el, Math.round(scrollPercentY * iMap));
		}
	};

	Parallax.setOptions = function(options) {
		Parallax.init(options);
	};

	Parallax.subscribe = function (options) {
		var wayStates = options.wayStates;
		var id = options.id;
		var ease = options.ease || 'linear';
		var rate = wayStates? null: (options.rate === 0? 0: options.rate || 1);
		var dom = document.getElementById(id);
		elements.push({el:dom, wayStates:wayStates, rate:rate});
		if (!wayStates || _.isEmpty(wayStates)) {
			dom.flow = true; // used to calculate body height
			checkLast();
			return;
		}
		var tempStates = [];
		var percentKeys = _.map(_.keys(wayStates), function(prop) {
			return parseInt(prop, 10);
		});
		for (var i=0; i<getOption('resolution'); i++) {
			var p = null;
			if (i % iMap === 0) {
				p = wayStates[i / iMap];
			}
			
			if(!p) {
				p = interpolate(i, percentKeys, tempStates, wayStates, ease);
			}
			tempStates.push(p);
		}
		wayStates.length = 0;
		Array.prototype.push.apply(wayStates, tempStates);
		checkLast();
	};

	init();
	return Parallax;
})(Parallax || {});

/*===================== EXAMPLE =====================*/
/*
<!DOCTYPE html>
<html>
	<body>
		<section id="js-section1">Blah blah blah</section>

		<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
		<script src="//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.7.0/underscore-min.js"></script>
		<script src="/assets/js/easing.js"></script>
		<script src="/assets/js/parallax.js"></script>
		<script src="/assets/js/main.js"></script>
		<script>
			$(function() {

				var section1WayPoints = {
					0:{'left': '37.5%', 'top': '25%', 'opacity': 1},
					10:{},
					20:{'top': '50%'},
					30:{},
					40:{'top': '25%'},
					45:{},
					99:{'left': '100%', 'top': '-30%', 'opacity': 0}
				};
				Parallax.subscribe({wayStates: section1WayPoints, id:'js-section1', ease:'easeInOutQuart'});

				Parallax.updateScroll();
			});
		</script>
	</body>
</html>
*/

/*===================================================*/
