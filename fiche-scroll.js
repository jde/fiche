var ficheScroll = function (e, f, args) {

	// cache the fiche
	this.f = f;

	// cache the jquery element
	this.$e = $(e);
	this.$e.css({
		position: 'relative',
		overflow: 'hidden'
	});

	this.$viewable = $('<div></div>');
	this.$viewable.addClass('fiche-scroll-viewable');

	this.$viewable.css({
		position: 'absolute'
	});

	this.$e.append(this.$viewable);

	// presets that existed before the element was a fiche-scroll
	//  this allows the dev to set a height or width and have the ratio
	//  work off of that
	this.presets = {
		height: this.$e.innerHeight(),
		width: this.$e.innerWidth()
	};

	this.conform();

	$(this.f).on('surfaceUpdate', {'this': this}, this.conform);

};

// make the scroll element conform to the fiche
ficheScroll.prototype.conform = function (e) {

	var self = this;
	if (e && typeof e.data !== 'undefined') {
		self = e.data.this;
	}

	// if width preset, go off that for the size
	if (self.presets.width) {
		self.width = self.$e.innerWidth();
		self.height = self.width / self.f.surfaceSize().aspect;
	}

	// if width preset, go off that for the size
	if (self.presets.height) {
		self.height = self.$e.innerHeight();
		self.height = self.height * self.f.surfaceSize().aspect;
	}

	self.$e.css({
		width: self.width,
		height: self.height
	});

	self.drawViewable(self);

};

// draw the viewable area box in the scroller
ficheScroll.prototype.drawViewable = function (self) {

	var surfaceSize = this.f.surfaceSize(),
		viewportSize = this.f.viewportSize(),
		ratio = this.height / surfaceSize.height,
		viewableHeight = this.height * ratio,
		viewableWidth = this.width * ratio,
		viewableTop = this.f.surface.top * ratio * -1,
		viewableLeft = this.f.surface.left * ratio * -1;

	this.$viewable.height = viewableHeight;
	this.$viewable.width = viewableWidth;

	this.$viewable.css({
		height: viewableHeight,
		width: viewableWidth,
		top: viewableTop,
		left: viewableLeft
	});



};

ficheScroll.prototype.getRatio = function () {

};