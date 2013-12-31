/**
 * fiche!
 * by me now for you
 **/

var fiche = function (e) {

	this.state = {
		top: 0,
		left: 0
	};

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

	var vw = this.$viewport.width(),
		vh = this.$viewport.height(),
		ew = this.items[id].$e.width(),
		eh = this.items[id].$e.height();

	this.$surface.animate({
		top: ((this.items[id].top * -1) + (vh / 2) - (eh / 2)) + 'px',
		left: ((this.items[id].left * -1) + (vw / 2) - (ew / 2)) + 'px'
	});

	return this;

};

fiche.prototype.update = function (id) {

	this.items[id].top = this.set(this.items[id].$e, this.items[id].o.top);
	this.items[id].left = this.set(this.items[id].$e, this.items[id].o.left);

	this.move(id);

};

fiche.prototype.move = function (id) {
	this.items[id].$e.animate({
		top: this.items[id].top,
		left: this.items[id].left
	});
};

fiche.prototype.add = function (e, top, left) {

	var element = $(e);

	if (element.length > 1) {
		return this.addMany(e, top, left);
	}

	if (element.length < 1) {
		return null;
	}

	var item = {
		$e: element,
		top: this.set(e, top),
		left: this.set(e, left),
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


