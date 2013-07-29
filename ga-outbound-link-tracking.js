var GaqHelper = function () {

};

GaqHelper.prototype.inArray = function (obj, item) {
    if (obj && obj.length) {
        for (var i = 0; i < obj.length; i++) {
            if (obj[i] === item) {
                return true;
            }
        }
    }
    return false;
};

GaqHelper.prototype._addEventListener = function (obj, evt, ofnc, bubble) {
    var fnc = function (event) {
        if (!event || !event.target) {
            event = window.event;
            event.target = event.srcElement;
        }
        return ofnc.call(obj, event);
    };
    // W3C model
    if (obj.addEventListener) {
        obj.addEventListener(evt, fnc, !!bubble);
        return true;
    }
    // M$ft model
    else if (obj.attachEvent) {
        return obj.attachEvent('on' + evt, fnc);
    }
    // Browser doesn't support W3C or M$ft model. Time to go old school
    else {
        evt = 'on' + evt;
        if (typeof obj[evt] === 'function') {
            // Object already has a function on traditional
            // Let's wrap it with our own function inside another function
            fnc = (function (f1, f2) {
                return function () {
                    f1.apply(this, arguments);
                    f2.apply(this, arguments);
                };
            }(obj[evt], fnc));
        }
        obj[evt] = fnc;
        return true;
    }
};

GaqHelper.prototype._liveEvent = function (tag, evt, ofunc) {
    var gh = this;
    tag = tag.toUpperCase();
    tag = tag.split(',');

    gh._addEventListener(document, evt, function (me) {
        for (var el = me.target; el.nodeName !== 'HTML';
            el = el.parentNode)
        {
            if (gh.inArray(tag, el.nodeName) || el.parentNode === null) {
                break;
            }
        }
        if (el && gh.inArray(tag, el.nodeName)) {
            ofunc.call(el, me);
        }

    }, true);
};

sindexOf = String.prototype.indexOf;
var gh = GaqHelper.prototype;
subdomainTracking = true;

gh._liveEvent('a', 'mousedown', function (e) {
	var l = this;
	pageHostname = document.location.hostname;

	if(subdomainTracking == true){
		var t = pageHostname.match(/\./g);
		if (!(t && t.length < 2)) {
			var start = pageHostname.indexOf('.') + 1;
			pageHostname =  pageHostname.substring(start);
		}
	}
	
	if (
		(l.protocol === 'http:' || l.protocol === 'https:') &&
		sindexOf.call(l.hostname, pageHostname) === -1)
	{
		var path = (l.pathname + l.search + ''),
			utm = sindexOf.call(path, '__utm');
		if (utm !== -1) {
			path = path.substring(0, utm);
		}
		_gaq.push(['_trackEvent',
			'Outbound Links',
			l.hostname,
			path
		]);
	}
});
