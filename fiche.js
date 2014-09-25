/**
 * fiche!
 * by me now for you
 **/

var fiche = function(e, args) {

    this.state = {
        top: 0,
        left: 0
    };

    this.args = args || {};

    this.layout = args.layout;

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

    // register the dispatcher
    this.dispatch = args.dispatch;

    // item focued on
    this.focus = null;

};

fiche.prototype.getId = function (item) {

    if (typeof item === "number" || typeof item === "string") {
        return item;
    }

    for (var i = 0; i < this.items.length; i++) {
        var thisItem = this.items[i];
        if (thisItem.$e === item || thisItem.view === item || thisItem.view.model === item) {
            return i;
        }
    }

    return null;

};

fiche.prototype.inject = function(item) {


    item.$e.css({
        position: 'absolute',
        top: item.top,
        left: item.left
    });

    this.$surface.append(item.$e);

};

// returns a val, evaluates a function
fiche.prototype.set = function(e, val) {

    if (typeof val === "function") {
        return val(e, this);
    }

    return val;

};

fiche.prototype.trigger = function(e, data) {

    if (typeof this.dispatch.trigger === "function") {
        this.dispatch.trigger(e, data);
    }

};

// goto proxies panto with a duration of 0
fiche.prototype.goto = function (item) {

    this.panto(item, 0);

};

fiche.prototype.bringToFront = function(id) {

    // send all items to back
    this.$viewport.find('fiche-item').animate({
        'z-index': 100
    });

    // bring selected item to front
    this.items[id].$e.animate({
        'z-index': 200
    });

};

fiche.prototype.panto = function(item, duration) {

    var id = this.getId(item);

    if (typeof id === "undefined" || id === null) {
        return null;
    }

    var view = this.items[id].view;

    var top, left,
        vw = this.$viewport.width(),
        vh = this.$viewport.height(),
        ew = this.items[id].$e.width(),
        eh = this.items[id].$e.height();

    this.focus = view;

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

    this.$surface.stop().animate({
        top: top + 'px',
        left: left + 'px'
    }, duration);

    this.bringToFront(id);

    return this;

};

// take any recognizable item and update it
fiche.prototype.update = function(it, top, left) {

    // 
    var item = this.get(it);

    if (typeof top === "undefined" && typeof left === "undefined") {
        top = item.o.top;
        left = item.o.left;
    }

    item.top = this.set(item.$e, top);
    item.left = this.set(item.$e, left);

    this.move(item);

    return this;

};

fiche.prototype.move = function(item) {
    item.$e.animate({
        top: item.top,
        left: item.left
    });
};

fiche.prototype.layoutElements = function () {

    var that = this;

    // to be abstracted into a plugin, perhaps?
    if (this.layout && this.layout.type === 'horizontal') {
        var horizontalSeparation = 40,
            aspect = 16 / 9,
            viewWidth = this.$viewport.width() - (2 * horizontalSeparation) - 200,
            viewHeight = this.$viewport.height() - 80,
            top = 0,
            left = 0;

        _.each(this.items, function (item) {

            var eHeight = item.$e.find('img').height(),
                eWidth = item.$e.find('img').width(),
                eRatio = eWidth / eHeight,
                thisTop = top;

            // constrain by height?
            if (eHeight / viewHeight > eWidth / viewWidth) {
                eHeight = viewHeight;
                eWidth = viewHeight * eRatio;
            } else { // constrain by width?
                eWidth = viewWidth;
                eHeight = viewHeight / eRatio;
            }

//            thisTop += (viewHeight - eHeight) / 4;

            item.top = thisTop;
            item.left = left;
            item.width = eHeight;
            item.height = eWidth;

            item.$e.css({
                height: eHeight,
                width: eWidth,
                top: thisTop,
                left: left
            });

            left += eWidth + (horizontalSeparation * 2);

        });

    }

    // move the viewport to maintain focus
    if (this.focus !== null) {
        //this.goto(this.focus);
    }

};

fiche.prototype.add = function(view, top, left) {

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
    item.$e.addClass('fiche-item');

    item.$e.click($.proxy(function(event) {

        event.preventDefault();

//        this.panto($(event.currentTarget).attr('data-fiche-id'));

        var id = $(event.currentTarget).attr('data-fiche-id');
        this.trigger("fiche:setfocus", this.items[id].view.model);

    }, this));

    this.inject(item);

    if (this.layout) {
        this.layoutElements();
    }

    return this;

};

fiche.prototype.addMany = function(es, top, left) {

    var that = this;

    $(es).each(function(i, e) {
        that.add(e, top, left);
    });

    return this;

};

// get by any recognizable aspect of the item
fiche.prototype.get = function(item) {

    if (typeof item === "undefined") {
        return this.items;
    }

    for (var i = 0, l = this.items.length; i < l; i++) {

        // is it the view itself?
        if (this.items[i] && item === this.items[i].view) {
            return this.items[i];
        }

        // is it the element?
        if (this.items[i] && item === this.items[i].$e) {
            return this.items[i];
        }

        // is it the id of the model?  (todo, type check model?)
        if (this.items[i]  && this.items[i].view && this.items[i].view.model && item === this.items[i].view.model.get('id')) {
            return this.items[i];
        }
        if (this.items[i] && this.items[i].view && item === this.items[i].view.model) {
            return this.items[i];
        }

        // is it an idex in the array?  (this comes last as it is the most janky)
        if (this.items[i] && item === i) {
            return this.items[i];
        }

    }

    return null;

};

// deprecated
fiche.prototype.getBy = function(attr, value) {

    for (var i = 0, l = this.items.length; i < l; i++) {

        if (this.items[i].view.model && typeof this.items[i].view.model.get === "function") {
            if (this.items[i].view.model.get(attr) == value) {
                return this.items[i];
            }
        }
    }

    return null;

};

// deprecated
fiche.prototype.updateBy = function(attr, value, top, left) {

    var item = this.getBy(attr, value);

    if (item === null) {
        return null;
    }

    return this.update(item.id, top, left);

};

fiche.prototype.gotoBy = function(attr, value) {

    var item = this.getBy(attr, value);

    if (item === null) {
        return null;
    }

    return this.goto(item.id);

};

