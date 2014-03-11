/**
 * fiche!
 * by me now for you
 **/

var fiche = function (e, args) {

	this.state = {
		top: 0,
		left: 0
	};

	this.args = args || {};

	// get our 
	this.$viewport = $(e);

	// empty the viewport
	this.$viewport.empty();

	// prep it
	this.$viewport.css({
		position: 'relative',
		overflow: 'hidden'
	});

	// create our surface

	this.surface = {
		top: 0,
		left: 0,
		border: '0px solid #000',
		padding: 0,
		margin: 0
	};

	this.$surface = $('<div></div>');
	this.$surface.attr('id', 'fiche_surface');
	this.$surface.addClass('fiche-surface');
	this.$surface.css({
		padding: this.surface.padding,
		margin: this.surface.margin,
		border: this.surface.border,
		position: 'relative',
		top: this.surface.top,
		left: this.surface.left
	});

	// inject it
	this.$viewport.append(this.$surface);

	// prep item container
	this.items = [];

	var that = this;
	this.triggerSurface = function () {
		$(that).trigger('surfaceUpdate');
	};

};

fiche.prototype.inject = function (item) {


	item.$e.css({
		position: 'absolute',
		top: item.top + 'px',
		left: item.left + 'px'
	});

	this.$surface.append(item.$e);

};

// returns a val, evaluates a function
fiche.prototype.set = function (e, val) {

	if (typeof val === "function") {
		return val(e, this);
	}

	return val;

};

fiche.prototype.goto = function (id) {

	var top, left,
		vw = this.$viewport.width(),
		vh = this.$viewport.height(),
		ew = this.items[id].$e.width(),
		eh = this.items[id].$e.height();

	// set new surface top
	if (typeof this.args.lockTop !== "undefined") {
		this.surface.top = this.args.lockTop;
	} else {
		this.surface.top = ((this.items[id].top * -1) + (vh / 2) - (eh / 2));
	}

	// set new surface left
	if (typeof this.args.lockLeft !== "undefined") {
		this.surface.left = this.args.lockLeft;
	} else {
		this.surface.left = ((this.items[id].left * -1) + (vw / 2) - (ew / 2));
	}

	this.$surface.animate({
		top: this.surface.top,
		left: this.surface.left
	}, 200, null, this.triggerSurface);

	return this;

};

fiche.prototype.update = function (id, top, left) {

	if (typeof top === "undefined" && typeof left === "undefined") {
		top = this.items[id].o.top;
		left = this.items[id].o.left;
	}

	this.items[id].top = this.set(this.items[id].$e, top);
	this.items[id].left = this.set(this.items[id].$e, left);

	this.move(id);

	return this;

};

fiche.prototype.move = function (id) {
	this.items[id].$e.animate({
		top: this.items[id].top,
		left: this.items[id].left
	});
};

fiche.prototype.add = function (view, top, left) {

	var element, item;

	if (view.$el) {
		element = view.$el;
	} else {
		element = $(view);
	}

	if (element.length > 1) {
		return this.addMany(element, top, left);
	}

	if (element.length < 1) {
		return null;
	}

	item = {
		$e: element,
		top: this.set(element, top),
		left: this.set(element, left),
		view: view,
		o: {
			top: top,
			left: left
		}
	};

	this.items.push(item);
	item.id = this.items.length - 1;
	item.$e.attr('data-fiche-id', item.id);

	item.$e.click($.proxy(function (event) {
		
		event.preventDefault();
		this.goto($(event.currentTarget).attr('data-fiche-id'));

	}, this));

	this.inject(item);

	this.triggerSurface();

	return this;

};

fiche.prototype.addMany = function (es, top, left) {

	var that = this;

	$(es).each(function (i, e) {
		that.add(e, top, left);
	});

	return this;

};

fiche.prototype.get = function () {
	return this.items;
};

fiche.prototype.getBy = function (attr, value) {

	for (var i = 0, l = this.items.length; i < l; i++) {

		if (this.items[i].view.model && typeof this.items[i].view.model.get === "function") {
			if (this.items[i].view.model.get(attr) == value) {
				return this.items[i];
			}
		}
	}

	return null;

};

// the surface is a concept defined by it's items
//  to find the height and width we need to scan for the top left
//  and bottom right pixels
fiche.prototype.surfaceSize = function () {

	var top = null, left = null,
		bottom = null, right = null,
		itemTop, itemLeft,
		itemBottom, itemRight;

	// loop through each item
	for (var i = 0, l = this.items.length; i < l; i++) {

		itemTop = this.items[i].top;
		itemLeft = this.items[i].left;
		itemBottom = this.items[i].top + this.items[i].$e.outerHeight();
		itemRight = this.items[i].left + this.items[i].$e.outerWidth();

		if(top === null || itemTop < top) {
			top = itemTop;
		}

		if(left === null || itemLeft < left) {
			left = itemLeft;
		}

		if(right === null || itemRight > right) {
			right = itemRight;
		}

		if(bottom === null || itemBottom > bottom) {
			bottom = itemBottom;
		}

	}

	return {
		top: top,
		right: right,
		bottom: bottom,
		left: left,
		height: bottom - top,
		width: right - left,
		aspect: (right - left) / (bottom - top)
	};

};

fiche.prototype.viewportSize = function () {

	var height = this.$viewport.innerHeight(),
		width = this.$viewport.innerWidth(),
		aspect = width / height;

	return {
		height: height,
		width: width,
		aspect: aspect
	};

};

fiche.prototype.updateBy = function (attr, value, top, left) {

	var item = this.getBy(attr, value);

	if (item === null) {
		return null;
	}

	return this.update(item.id, top, left);

};

fiche.prototype.gotoBy = function (attr, value) {

	var item = this.getBy(attr, value);

	if (item === null) {
		return null;
	}

	return this.goto(item.id);

};


