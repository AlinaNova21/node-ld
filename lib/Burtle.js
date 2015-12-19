function Burtle(){
	this.x = { a:0, b:0, c:0, d:0 };
}

Burtle.prototype.init = function(seed) {
    var i;
    x = this.x
    x.a = 0xf1ea5eed;
    x.b = x.c = x.d = seed;
    for (i=0; i<42; ++i)
        this.rand(x);
}

Burtle.prototype.rand = function() {
	var x = this.x
	var rot = (a,b)=>((a<<b)|(a>>>(32-b))) >>> 0
    var e = x.a - rot(x.b, 21) >>> 0;
    x.a = (x.b ^ rot(x.c, 19)) >>> 0;
    x.b = (x.c + rot(x.d, 6)) >>> 0;
    x.c = (x.d + e) >>> 0;
    x.d = (e + x.a) >>> 0;
    return x.d
}

module.exports = Burtle