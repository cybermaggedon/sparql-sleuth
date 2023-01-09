
type Point = {
    x : number,
    y : number,
};

export class View {

    cx : number = 0;
    cy : number = 0;

    // Screen pixels per unit
    sppu : number  = 1;

    zoom : number = 1;

    height : number = 0;
    width : number = 0;

    constructor(height : number = 0, width : number = 0) {
	this.cx = 0;
	this.cy = 0;
	this.sppu = 2;
	this.zoom = 1;
	this.height = height;
	this.width = width;
    }

    // Turns a coordinate system delta into a screen pixel delta
    sdx(x : number) {
	let cw = this.width / this.sppu / this.zoom;
	if (cw == 0) return NaN;
	return x * this.width / cw;
    }

    // Turns a coordinate system delta into a screen pixel delta
    sdy(y : number) {
	let ch = this.height / this.sppu / this.zoom;
	if (ch == 0) return NaN;
	return y * this.height / ch;
    }

    // Turns a screen pixel delta into a coordinate system delta
    cdx(x : number) {
	let cw = this.width / this.sppu / this.zoom;
	if (cw == 0) return NaN;
	return x * cw / this.width;
    }

    // Turns a screen pixel delta into a coordinate system delta
    cdy(y : number) {
	let ch = this.height / this.sppu / this.zoom;
	if (ch == 0) return NaN;
	return y * ch / this.height;
    }

    c2s(p : Point) : Point {

	let cw = this.width / this.sppu / this.zoom;
	let ch = this.height / this.sppu / this.zoom;

	// Work out viewport
	let vpx1 = this.cx - cw / 2;
	let vpx2 = this.cx + cw / 2;
	let vpy1 = this.cy - ch / 2;
	let vpy2 = this.cy + ch / 2;

	var sx, sy;
	if (cw == 0 || ch == 0) {
	    sx = 0;
	    sy = 0;
	} else {
	    sx = (p.x - vpx1) * this.width / cw;
	    sy = (p.y - vpy1) * this.height / ch;
	}

	return {
	    x: sx,
	    y: sy,
	};

    }

    s2c(p : Point) : Point {

	let cw = this.width / this.sppu / this.zoom;
	let ch = this.height / this.sppu / this.zoom;

	// Work out viewport
	let vpx1 = this.cx - cw / 2;
	let vpx2 = this.cx + cw / 2;
	let vpy1 = this.cy - ch / 2;
	let vpy2 = this.cy + ch / 2;

	var cx, cy;
	if (cw == 0 || ch == 0) {
	    cx = 0;
	    cy = 0;
	} else {
	    cx = p.x * cw / this.width + vpx1;
	    cy = p.y * ch / this.height + vpy1;
	}

	return {
	    x: cx,
	    y: cy,
	};

    }

    centre(p : Point) {
	this.cx = p.x;
	this.cy = p.y;
    }

    setDimension(w : number, h : number) {
	this.width = w;
	this.height = h;
    }

    setSppu(s : number) {
	this.sppu = s;
    }

    setZoom(z : number) {
	this.zoom = z;
    }
    
};

