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
	this.$surface = $('<div></div>');
	this.$surface.attr('id', 'fiche_surface');
	this.$surface.css({
		padding: 0,
		margin: 0,
		border: '0px solid #000',
		position: 'relative',
		top: 0,
		left: 0
	});

	// inject it
	this.$viewport.append(this.$surface);

	// prep item container
	this.items = [];


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

	if (typeof this.args.lockTop !== "undefined") {
		top = this.args.lockTop;
	} else {
		top = ((this.items[id].top * -1) + (vh / 2) - (eh / 2));
	}

	if (typeof this.args.lockLeft !== "undefined") {
		left = this.args.lockLeft;
	} else {
		left = ((this.items[id].left * -1) + (vw / 2) - (ew / 2));
	}

	this.$surface.animate({
		top: top + 'px',
		left: left + 'px'
	});

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


