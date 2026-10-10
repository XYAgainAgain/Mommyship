/*! Sine Sculptor's Elementary player bundles the third-party code below.

Elementary Audio (@elemaudio/core, @elemaudio/web-renderer)

MIT License

Copyright (c) 2023 Nick Thompson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

eventemitter3

The MIT License (MIT)

Copyright (c) 2014 Arnout Kazemier

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

shallowequal

MIT License

Copyright (c) 2017 Alberto Leal <mailforalberto@gmail.com> (github.com/dashed)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

invariant

MIT License

Copyright (c) 2013-present, Facebook, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Ableton’s web-audio-sequencing clock, vendored

Copyright (c) 2025 Ableton AG, Berlin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

FFTConvolver by HiFi-LoFi, inside Elementary’s audio runtime

Copyright (c) 2017 HiFi-LoFi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is furnished
to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Signalsmith Stretch, inside Elementary’s audio runtime

MIT License

Copyright (c) 2022 Geraint Luff / Signalsmith Audio Ltd.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Signalsmith DSP, inside Signalsmith Stretch

MIT License

Copyright (c) 2021 Geraint Luff / Signalsmith Audio Ltd.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
//#region \0rolldown/runtime.js
var e = Object.create, t = Object.defineProperty, n = Object.getOwnPropertyDescriptor, r = Object.getOwnPropertyNames, i = Object.getPrototypeOf, a = Object.prototype.hasOwnProperty, o = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), s = (e, i, o, s) => {
	if (i && typeof i == "object" || typeof i == "function") for (var c = r(i), l = 0, u = c.length, d; l < u; l++) d = c[l], !a.call(e, d) && d !== o && t(e, d, {
		get: ((e) => i[e]).bind(null, d),
		enumerable: !(s = n(i, d)) || s.enumerable
	});
	return e;
}, c = (n, r, o) => (o = n == null ? {} : e(i(n)), s(r || !n || !n.__esModule || !a.call(n, "default") ? t(o, "default", {
	value: n,
	enumerable: !0
}) : o, n)), l = /* @__PURE__ */ o(((e, t) => {
	t.exports = function(e, t, n, r, i, a, o, s) {
		if (!e) {
			var c;
			if (t === void 0) c = /* @__PURE__ */ Error("Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings.");
			else {
				var l = [
					n,
					r,
					i,
					a,
					o,
					s
				], u = 0;
				c = Error(t.replace(/%s/g, function() {
					return l[u++];
				})), c.name = "Invariant Violation";
			}
			throw c.framesToPop = 1, c;
		}
	};
})), u = /* @__PURE__ */ o(((e, t) => {
	t.exports = function(e, t, n, r) {
		var i = n ? n.call(r, e, t) : void 0;
		if (i !== void 0) return !!i;
		if (e === t) return !0;
		if (typeof e != "object" || !e || typeof t != "object" || !t) return !1;
		var a = Object.keys(e), o = Object.keys(t);
		if (a.length !== o.length) return !1;
		for (var s = Object.prototype.hasOwnProperty.bind(t), c = 0; c < a.length; c++) {
			var l = a[c];
			if (!s(l)) return !1;
			var u = e[l], d = t[l];
			if (i = n ? n.call(r, u, d, l) : void 0, i === !1 || i === void 0 && u !== d) return !1;
		}
		return !0;
	};
})), d = /* @__PURE__ */ o(((e, t) => {
	var n = Object.prototype.hasOwnProperty, r = "~";
	function i() {}
	Object.create && (i.prototype = Object.create(null), new i().__proto__ || (r = !1));
	function a(e, t, n) {
		this.fn = e, this.context = t, this.once = n || !1;
	}
	function o(e, t, n, i, o) {
		if (typeof n != "function") throw TypeError("The listener must be a function");
		var s = new a(n, i || e, o), c = r ? r + t : t;
		return e._events[c] ? e._events[c].fn ? e._events[c] = [e._events[c], s] : e._events[c].push(s) : (e._events[c] = s, e._eventsCount++), e;
	}
	function s(e, t) {
		--e._eventsCount === 0 ? e._events = new i() : delete e._events[t];
	}
	function c() {
		this._events = new i(), this._eventsCount = 0;
	}
	c.prototype.eventNames = function() {
		var e = [], t, i;
		if (this._eventsCount === 0) return e;
		for (i in t = this._events) n.call(t, i) && e.push(r ? i.slice(1) : i);
		return Object.getOwnPropertySymbols ? e.concat(Object.getOwnPropertySymbols(t)) : e;
	}, c.prototype.listeners = function(e) {
		var t = r ? r + e : e, n = this._events[t];
		if (!n) return [];
		if (n.fn) return [n.fn];
		for (var i = 0, a = n.length, o = Array(a); i < a; i++) o[i] = n[i].fn;
		return o;
	}, c.prototype.listenerCount = function(e) {
		var t = r ? r + e : e, n = this._events[t];
		return n ? n.fn ? 1 : n.length : 0;
	}, c.prototype.emit = function(e, t, n, i, a, o) {
		var s = r ? r + e : e;
		if (!this._events[s]) return !1;
		var c = this._events[s], l = arguments.length, u, d;
		if (c.fn) {
			switch (c.once && this.removeListener(e, c.fn, void 0, !0), l) {
				case 1: return c.fn.call(c.context), !0;
				case 2: return c.fn.call(c.context, t), !0;
				case 3: return c.fn.call(c.context, t, n), !0;
				case 4: return c.fn.call(c.context, t, n, i), !0;
				case 5: return c.fn.call(c.context, t, n, i, a), !0;
				case 6: return c.fn.call(c.context, t, n, i, a, o), !0;
			}
			for (d = 1, u = Array(l - 1); d < l; d++) u[d - 1] = arguments[d];
			c.fn.apply(c.context, u);
		} else {
			var f = c.length, p;
			for (d = 0; d < f; d++) switch (c[d].once && this.removeListener(e, c[d].fn, void 0, !0), l) {
				case 1:
					c[d].fn.call(c[d].context);
					break;
				case 2:
					c[d].fn.call(c[d].context, t);
					break;
				case 3:
					c[d].fn.call(c[d].context, t, n);
					break;
				case 4:
					c[d].fn.call(c[d].context, t, n, i);
					break;
				default:
					if (!u) for (p = 1, u = Array(l - 1); p < l; p++) u[p - 1] = arguments[p];
					c[d].fn.apply(c[d].context, u);
			}
		}
		return !0;
	}, c.prototype.on = function(e, t, n) {
		return o(this, e, t, n, !1);
	}, c.prototype.once = function(e, t, n) {
		return o(this, e, t, n, !0);
	}, c.prototype.removeListener = function(e, t, n, i) {
		var a = r ? r + e : e;
		if (!this._events[a]) return this;
		if (!t) return s(this, a), this;
		var o = this._events[a];
		if (o.fn) o.fn === t && (!i || o.once) && (!n || o.context === n) && s(this, a);
		else {
			for (var c = 0, l = [], u = o.length; c < u; c++) (o[c].fn !== t || i && !o[c].once || n && o[c].context !== n) && l.push(o[c]);
			l.length ? this._events[a] = l.length === 1 ? l[0] : l : s(this, a);
		}
		return this;
	}, c.prototype.removeAllListeners = function(e) {
		var t;
		return e ? (t = r ? r + e : e, this._events[t] && s(this, t)) : (this._events = new i(), this._eventsCount = 0), this;
	}, c.prototype.off = c.prototype.removeListener, c.prototype.addListener = c.prototype.on, c.prefixed = r, c.EventEmitter = c, t !== void 0 && (t.exports = c);
})), f = /* @__PURE__ */ c(l(), 1), p = /* @__PURE__ */ c(u(), 1), m = (/* @__PURE__ */ c(d(), 1)).default, h = Object.defineProperty, g = Object.defineProperties, _ = Object.getOwnPropertyDescriptors, v = Object.getOwnPropertySymbols, y = Object.prototype.hasOwnProperty, b = Object.prototype.propertyIsEnumerable, x = (e, t, n) => t in e ? h(e, t, {
	enumerable: !0,
	configurable: !0,
	writable: !0,
	value: n
}) : e[t] = n, S = (e, t) => {
	for (var n in t ||= {}) y.call(t, n) && x(e, n, t[n]);
	if (v) for (var n of v(t)) b.call(t, n) && x(e, n, t[n]);
	return e;
}, C = (e, t) => g(e, _(t)), w = (e, t) => {
	var n = {};
	for (var r in e) y.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
	if (e != null && v) for (var r of v(e)) t.indexOf(r) < 0 && b.call(e, r) && (n[r] = e[r]);
	return n;
}, T = (e, t) => {
	for (var n in t) h(e, n, {
		get: t[n],
		enumerable: !0
	});
}, E = {};
T(E, {
	_1: () => k,
	_2: () => j,
	_3: () => N,
	_4: () => ee,
	_5: () => F,
	_6: () => ne,
	_7: () => re,
	_8: () => ae,
	__1: () => A,
	__2: () => M,
	__3: () => P,
	__4: () => te,
	__5: () => I,
	__6: () => L,
	__7: () => ie,
	__8: () => oe,
	app: () => O
});
function D(e, t, n) {
	for (var r = Array(n), i = 0, a = t; i < n;) r[i] = e[a], i = i + 1 | 0, a = a + 1 | 0;
	return r;
}
function O(e, t) {
	for (;;) {
		var n = t, r = e, i = r.length, a = i === 0 ? 1 : i, o = a - n.length | 0;
		if (o === 0) return r.apply(null, n);
		if (o >= 0) return function(e, t) {
			return function(n) {
				return O(e, t.concat([n]));
			};
		}(r, n);
		t = D(n, a, -o | 0), e = r.apply(null, D(n, 0, a));
	}
}
function k(e, t) {
	var n = e.length;
	if (n === 1) return e(t);
	switch (n) {
		case 1: return e(t);
		case 2: return function(n) {
			return e(t, n);
		};
		case 3: return function(n, r) {
			return e(t, n, r);
		};
		case 4: return function(n, r, i) {
			return e(t, n, r, i);
		};
		case 5: return function(n, r, i, a) {
			return e(t, n, r, i, a);
		};
		case 6: return function(n, r, i, a, o) {
			return e(t, n, r, i, a, o);
		};
		case 7: return function(n, r, i, a, o, s) {
			return e(t, n, r, i, a, o, s);
		};
		default: return O(e, [t]);
	}
}
function A(e) {
	return e.length === 1 ? e : function(t) {
		return k(e, t);
	};
}
function j(e, t, n) {
	var r = e.length;
	if (r === 2) return e(t, n);
	switch (r) {
		case 1: return O(e(t), [n]);
		case 2: return e(t, n);
		case 3: return function(r) {
			return e(t, n, r);
		};
		case 4: return function(r, i) {
			return e(t, n, r, i);
		};
		case 5: return function(r, i, a) {
			return e(t, n, r, i, a);
		};
		case 6: return function(r, i, a, o) {
			return e(t, n, r, i, a, o);
		};
		case 7: return function(r, i, a, o, s) {
			return e(t, n, r, i, a, o, s);
		};
		default: return O(e, [t, n]);
	}
}
function M(e) {
	return e.length === 2 ? e : function(t, n) {
		return j(e, t, n);
	};
}
function N(e, t, n, r) {
	var i = e.length;
	if (i === 3) return e(t, n, r);
	switch (i) {
		case 1: return O(e(t), [n, r]);
		case 2: return O(e(t, n), [r]);
		case 3: return e(t, n, r);
		case 4: return function(i) {
			return e(t, n, r, i);
		};
		case 5: return function(i, a) {
			return e(t, n, r, i, a);
		};
		case 6: return function(i, a, o) {
			return e(t, n, r, i, a, o);
		};
		case 7: return function(i, a, o, s) {
			return e(t, n, r, i, a, o, s);
		};
		default: return O(e, [
			t,
			n,
			r
		]);
	}
}
function P(e) {
	return e.length === 3 ? e : function(t, n, r) {
		return N(e, t, n, r);
	};
}
function ee(e, t, n, r, i) {
	var a = e.length;
	if (a === 4) return e(t, n, r, i);
	switch (a) {
		case 1: return O(e(t), [
			n,
			r,
			i
		]);
		case 2: return O(e(t, n), [r, i]);
		case 3: return O(e(t, n, r), [i]);
		case 4: return e(t, n, r, i);
		case 5: return function(a) {
			return e(t, n, r, i, a);
		};
		case 6: return function(a, o) {
			return e(t, n, r, i, a, o);
		};
		case 7: return function(a, o, s) {
			return e(t, n, r, i, a, o, s);
		};
		default: return O(e, [
			t,
			n,
			r,
			i
		]);
	}
}
function te(e) {
	return e.length === 4 ? e : function(t, n, r, i) {
		return ee(e, t, n, r, i);
	};
}
function F(e, t, n, r, i, a) {
	var o = e.length;
	if (o === 5) return e(t, n, r, i, a);
	switch (o) {
		case 1: return O(e(t), [
			n,
			r,
			i,
			a
		]);
		case 2: return O(e(t, n), [
			r,
			i,
			a
		]);
		case 3: return O(e(t, n, r), [i, a]);
		case 4: return O(e(t, n, r, i), [a]);
		case 5: return e(t, n, r, i, a);
		case 6: return function(o) {
			return e(t, n, r, i, a, o);
		};
		case 7: return function(o, s) {
			return e(t, n, r, i, a, o, s);
		};
		default: return O(e, [
			t,
			n,
			r,
			i,
			a
		]);
	}
}
function I(e) {
	return e.length === 5 ? e : function(t, n, r, i, a) {
		return F(e, t, n, r, i, a);
	};
}
function ne(e, t, n, r, i, a, o) {
	var s = e.length;
	if (s === 6) return e(t, n, r, i, a, o);
	switch (s) {
		case 1: return O(e(t), [
			n,
			r,
			i,
			a,
			o
		]);
		case 2: return O(e(t, n), [
			r,
			i,
			a,
			o
		]);
		case 3: return O(e(t, n, r), [
			i,
			a,
			o
		]);
		case 4: return O(e(t, n, r, i), [a, o]);
		case 5: return O(e(t, n, r, i, a), [o]);
		case 6: return e(t, n, r, i, a, o);
		case 7: return function(s) {
			return e(t, n, r, i, a, o, s);
		};
		default: return O(e, [
			t,
			n,
			r,
			i,
			a,
			o
		]);
	}
}
function L(e) {
	return e.length === 6 ? e : function(t, n, r, i, a, o) {
		return ne(e, t, n, r, i, a, o);
	};
}
function re(e, t, n, r, i, a, o, s) {
	var c = e.length;
	if (c === 7) return e(t, n, r, i, a, o, s);
	switch (c) {
		case 1: return O(e(t), [
			n,
			r,
			i,
			a,
			o,
			s
		]);
		case 2: return O(e(t, n), [
			r,
			i,
			a,
			o,
			s
		]);
		case 3: return O(e(t, n, r), [
			i,
			a,
			o,
			s
		]);
		case 4: return O(e(t, n, r, i), [
			a,
			o,
			s
		]);
		case 5: return O(e(t, n, r, i, a), [o, s]);
		case 6: return O(e(t, n, r, i, a, o), [s]);
		case 7: return e(t, n, r, i, a, o, s);
		default: return O(e, [
			t,
			n,
			r,
			i,
			a,
			o,
			s
		]);
	}
}
function ie(e) {
	return e.length === 7 ? e : function(t, n, r, i, a, o, s) {
		return re(e, t, n, r, i, a, o, s);
	};
}
function ae(e, t, n, r, i, a, o, s, c) {
	var l = e.length;
	if (l === 8) return e(t, n, r, i, a, o, s, c);
	switch (l) {
		case 1: return O(e(t), [
			n,
			r,
			i,
			a,
			o,
			s,
			c
		]);
		case 2: return O(e(t, n), [
			r,
			i,
			a,
			o,
			s,
			c
		]);
		case 3: return O(e(t, n, r), [
			i,
			a,
			o,
			s,
			c
		]);
		case 4: return O(e(t, n, r, i), [
			a,
			o,
			s,
			c
		]);
		case 5: return O(e(t, n, r, i, a), [
			o,
			s,
			c
		]);
		case 6: return O(e(t, n, r, i, a, o), [s, c]);
		case 7: return O(e(t, n, r, i, a, o, s), [c]);
		default: return O(e, [
			t,
			n,
			r,
			i,
			a,
			o,
			s,
			c
		]);
	}
}
function oe(e) {
	return e.length === 8 ? e : function(t, n, r, i, a, o, s, c) {
		return ae(e, t, n, r, i, a, o, s, c);
	};
}
var se = {};
T(se, {
	$$Map: () => Be,
	$$Set: () => Ve,
	RenderDelegate: () => He,
	mount: () => Ue,
	renderWithDelegate: () => Ge,
	visit: () => We
});
var ce = {};
T(ce, {
	create: () => Ie,
	isNode: () => Le,
	shallowCopy: () => Re,
	symbol: () => Fe
});
function le(e) {
	var t = typeof e;
	return t === "undefined" ? 3 : e === null ? 2 : t === "number" ? {
		TAG: 0,
		_0: e
	} : t === "bigint" ? {
		TAG: 5,
		_0: e
	} : t === "string" ? {
		TAG: 1,
		_0: e
	} : t === "boolean" ? +(e === !0) : t === "symbol" ? {
		TAG: 4,
		_0: e
	} : t === "function" ? {
		TAG: 2,
		_0: e
	} : {
		TAG: 3,
		_0: e
	};
}
function ue(e, t) {
	switch (t) {
		case 0: return e === void 0;
		case 1: return e === null;
		case 2: return typeof e == "boolean";
		case 3: return typeof e == "number";
		case 4: return typeof e == "string";
		case 5: return typeof e == "function";
		case 6: return typeof e == "object";
		case 7: return typeof e == "symbol";
		case 8: return typeof e == "bigint";
	}
}
function de(e) {
	return e === void 0 ? { BS_PRIVATE_NESTED_SOME_NONE: 0 } : e !== null && e.BS_PRIVATE_NESTED_SOME_NONE !== void 0 ? { BS_PRIVATE_NESTED_SOME_NONE: e.BS_PRIVATE_NESTED_SOME_NONE + 1 | 0 } : e;
}
function fe(e) {
	if (e === null || e.BS_PRIVATE_NESTED_SOME_NONE === void 0) return e;
	var t = e.BS_PRIVATE_NESTED_SOME_NONE;
	if (t !== 0) return { BS_PRIVATE_NESTED_SOME_NONE: t - 1 | 0 };
}
function pe(e, t) {
	for (;;) {
		var n = t, r = e;
		if (!r) return n;
		var i = {
			hd: r.hd,
			tl: 0
		};
		n.tl = i, t = i, e = r.tl;
	}
}
function me(e, t, n) {
	for (;;) {
		var r = t, i = e;
		if (!i) return;
		var a = {
			hd: n(i.hd),
			tl: 0
		};
		r.tl = a, t = a, e = i.tl;
	}
}
function he(e, t, n, r) {
	for (;;) {
		var i = r, a = n, o = t;
		if (!a) return;
		var s = {
			hd: e(o, a.hd),
			tl: 0
		};
		i.tl = s, r = s, n = a.tl, t = o + 1 | 0;
	}
}
function ge(e, t) {
	if (!e) return t;
	var n = {
		hd: e.hd,
		tl: 0
	};
	return pe(e.tl, n).tl = t, n;
}
function _e(e, t) {
	if (!e) return 0;
	var n = {
		hd: t(e.hd),
		tl: 0
	};
	return me(e.tl, n, t), n;
}
function ve(e, t) {
	return _e(e, A(t));
}
function ye(e, t) {
	if (!e) return 0;
	var n = {
		hd: t(0, e.hd),
		tl: 0
	};
	return he(t, 1, e.tl, n), n;
}
function be(e, t) {
	return ye(e, M(t));
}
function xe(e) {
	for (var t = e, n = 0;;) {
		var r = n, i = t;
		if (!i) return r;
		n = r + 1 | 0, t = i.tl;
	}
}
function Se(e, t, n) {
	for (;;) {
		var r = n, i = t;
		if (!r) return;
		e[i] = r.hd, n = r.tl, t = i + 1 | 0;
	}
}
function Ce(e) {
	for (var t = e.length - 1 | 0, n = 0;;) {
		var r = n, i = t;
		if (i < 0) return r;
		n = {
			hd: e[i],
			tl: r
		}, t = i - 1 | 0;
	}
}
function we(e) {
	var t = xe(e), n = Array(t);
	return Se(n, 0, e), n;
}
function Te(e, t) {
	for (;;) {
		var n = e;
		if (!n) return;
		t(n.hd), e = n.tl;
	}
}
function Ee(e, t) {
	Te(e, A(t));
}
function De(e, t, n) {
	for (;;) {
		var r = t, i = e;
		if (!i) return r;
		t = n(r, i.hd), e = i.tl;
	}
}
function Oe(e, t, n, r) {
	for (let i in r) if (r.hasOwnProperty(i)) {
		let a = r[i];
		(!n.hasOwnProperty(i) || !(0, p.default)(n[i], a)) && ((a == null || typeof a == "number" && isNaN(a) || typeof a == "number" && !isFinite(a)) && console.warn(`Warning: applying a potentially erroneous property value. ${i}: ${a}`), e.setProperty(t, i, a), n[i] = a);
	}
}
function ke(e, t) {
	if (t in e) return de(e[t]);
}
function Ae(e) {
	if (e !== void 0) return fe(e);
	throw Error("getExn");
}
function je(e, t, n, r) {
	Oe(e, t, n, r);
}
function Me(e, t) {
	return Math.imul(e ^ t, 16777619);
}
function Ne(e, t) {
	for (var n = e, r = 0, i = t.length; r <= i; ++r) n = Me(n, t.charCodeAt(r) | 0);
	return n;
}
function Pe(e, t, n) {
	var r = Ne(-2128831035, e), i = ke(t, "key");
	return De(n, i !== void 0 && ue(i, 4) ? Ne(r, i) : Ne(r, Ae(JSON.stringify(t))), Me) & 2147483647;
}
var Fe = "__ELEM_NODE__";
function Ie(e, t, n) {
	var r = Ce(n);
	return {
		symbol: Fe,
		hash: Pe(e, t, ve(r, function(e) {
			return Me(e.hash, e.outputChannel);
		})),
		kind: e,
		props: t,
		outputChannel: 0,
		children: r
	};
}
function Le(e) {
	var t = le(e);
	if (typeof t == "number" || t.TAG !== 3) return !1;
	var n = le(e.symbol);
	return typeof n == "number" || n.TAG !== 1 ? !1 : n._0 === Fe;
}
function Re(e) {
	return {
		symbol: e.symbol,
		hash: e.hash,
		kind: e.kind,
		props: Object.assign({}, e.props),
		outputChannel: e.outputChannel,
		generation: { contents: 0 }
	};
}
function ze(e) {
	return Array.from(e.values());
}
var Be = { valuesArray: ze }, Ve = {}, He = {};
function Ue(e, t) {
	var n = e.getNodeMap();
	if (n.has(t.hash)) {
		var r = n.get(t.hash);
		return je(e, r.hash, r.props, t.props);
	}
	e.createNode(t.hash, t.kind), je(e, t.hash, {}, t.props), Ee(t.children, function(n) {
		e.appendChild(t.hash, n.hash, n.outputChannel);
	}), n.set(t.hash, Re(t));
}
function We(e, t, n) {
	for (;;) {
		var r = n, i = function(e) {
			t.add(e.hash);
		};
		if (!r) return;
		var a = r.tl, o = r.hd;
		if (t.has(o.hash)) {
			n = a;
			continue;
		}
		i(o), Ue(e, o), n = ge(o.children, a);
	}
}
function Ge(e, t, n, r) {
	var i = /* @__PURE__ */ new Set(), a = be(Ce(t), function(e, t) {
		return Ie("root", {
			channel: e,
			fadeInMs: n,
			fadeOutMs: r
		}, [t]);
	});
	We(e, i, a), e.activateRoots(we(ve(a, function(e) {
		return e.hash;
	}))), e.commitUpdates();
}
var Ke = E, qe = se, Je = function(e, t, n, r) {
	return Ke._4(qe.renderWithDelegate, e, t, n, r);
}, Ye = E, Xe = ce, Ze = function(e, t, n) {
	return Ye._3(Xe.create, e, t, n);
}, Qe = Xe.isNode;
Xe.shallowCopy;
function R(e) {
	return typeof e == "number" ? Ze("const", { value: e }, []) : ((0, f.default)($e(e), `Whoops, expecting a Node type here! Got: ${typeof e}`), e);
}
function $e(e) {
	return Qe(e);
}
function z(e, t, n) {
	return Ze(e, t, n.map(R));
}
function et(e, t) {
	return Array.from({ length: t }, (t, n) => C(S({}, e), { outputChannel: n }));
}
var tt = {};
T(tt, {
	accum: () => ot,
	biquad: () => Mt,
	capture: () => zt,
	constant: () => nt,
	convolve: () => gt,
	counter: () => at,
	delay: () => Et,
	env: () => wt,
	fft: () => Rt,
	latch: () => lt,
	maxhold: () => ut,
	meter: () => Ft,
	metro: () => pt,
	mm1p: () => kt,
	once: () => dt,
	phasor: () => st,
	pole: () => Ct,
	prewarp: () => Ot,
	rand: () => ft,
	sample: () => mt,
	sampleseq: () => xt,
	sampleseq2: () => St,
	scope: () => Lt,
	sdelay: () => Dt,
	seq: () => _t,
	seq2: () => vt,
	snapshot: () => It,
	sparseq: () => yt,
	sparseq2: () => bt,
	sr: () => rt,
	svf: () => At,
	svfshelf: () => jt,
	syncphasor: () => ct,
	table: () => ht,
	tapIn: () => Nt,
	tapOut: () => Pt,
	time: () => it,
	z: () => Tt
});
function nt(e) {
	return z("const", e, []);
}
function rt() {
	return z("sr", {}, []);
}
function it() {
	return z("time", {}, []);
}
function at(e) {
	return z("counter", {}, [R(e)]);
}
function ot(e, t) {
	return z("accum", {}, [R(e), R(t)]);
}
function st(e) {
	return z("phasor", {}, [R(e)]);
}
function ct(e, t) {
	return z("sphasor", {}, [R(e), R(t)]);
}
function lt(e, t) {
	return z("latch", {}, [R(e), R(t)]);
}
function ut(e, t, n) {
	return z("maxhold", e, [R(t), R(n)]);
}
function dt(e, t) {
	return z("once", e, [R(t)]);
}
function ft(e) {
	return z("rand", e || {}, []);
}
function pt(e) {
	return z("metro", e || {}, []);
}
function mt(e, t, n) {
	return z("sample", e, [R(t), R(n)]);
}
function ht(e, t) {
	return z("table", e, [R(t)]);
}
function gt(e, t) {
	return z("convolve", e, [R(t)]);
}
function _t(e, t, n) {
	return z("seq", e, [R(t), R(n)]);
}
function vt(e, t, n) {
	return z("seq2", e, [R(t), R(n)]);
}
function yt(e, t, n) {
	return z("sparseq", e, [R(t), R(n)]);
}
function bt(e, t) {
	return z("sparseq2", e, [R(t)]);
}
function xt(e, t) {
	return z("sampleseq", e, [R(t)]);
}
function St(e, t) {
	return z("sampleseq2", e, [R(t)]);
}
function Ct(e, t) {
	return z("pole", {}, [R(e), R(t)]);
}
function wt(e, t, n) {
	return z("env", {}, [
		R(e),
		R(t),
		R(n)
	]);
}
function Tt(e) {
	return z("z", {}, [R(e)]);
}
function Et(e, t, n, r) {
	return z("delay", e, [
		R(t),
		R(n),
		R(r)
	]);
}
function Dt(e, t) {
	return z("sdelay", e, [R(t)]);
}
function Ot(e) {
	return z("prewarp", {}, [R(e)]);
}
function kt(e, t, n) {
	return z("mm1p", e, [R(t), R(n)]);
}
function At(e, t, n, r) {
	return z("svf", e, [
		R(t),
		R(n),
		R(r)
	]);
}
function jt(e, t, n, r, i) {
	return z("svfshelf", e, [
		R(t),
		R(n),
		R(r),
		R(i)
	]);
}
function Mt(e, t, n, r, i, a) {
	return z("biquad", {}, [
		R(e),
		R(t),
		R(n),
		R(r),
		R(i),
		R(a)
	]);
}
function Nt(e) {
	return z("tapIn", e, []);
}
function Pt(e, t) {
	return z("tapOut", e, [R(t)]);
}
function Ft(e, t) {
	return z("meter", e, [R(t)]);
}
function It(e, t, n) {
	return z("snapshot", e, [R(t), R(n)]);
}
function Lt(e, ...t) {
	return z("scope", e, t.map(R));
}
function Rt(e, t) {
	return z("fft", e, [R(t)]);
}
function zt(e, t, n) {
	return z("capture", e, [R(t), R(n)]);
}
var Bt = {};
T(Bt, {
	compress: () => En,
	skcompress: () => Dn
});
var Vt = {};
T(Vt, {
	abs: () => nn,
	add: () => fn,
	and: () => un,
	asinh: () => qt,
	ceil: () => Zt,
	cos: () => Wt,
	div: () => hn,
	eq: () => ln,
	exp: () => tn,
	floor: () => Qt,
	ge: () => on,
	geq: () => sn,
	identity: () => Ht,
	le: () => rn,
	leq: () => an,
	ln: () => Jt,
	log: () => Yt,
	log2: () => Xt,
	max: () => vn,
	min: () => _n,
	mod: () => gn,
	mul: () => mn,
	or: () => dn,
	pow: () => cn,
	round: () => $t,
	sin: () => Ut,
	sqrt: () => en,
	sub: () => pn,
	tan: () => Gt,
	tanh: () => Kt
});
function Ht(e, t) {
	return $e(t) ? z("in", e, [t]) : z("in", e, []);
}
function Ut(e) {
	return z("sin", {}, [R(e)]);
}
function Wt(e) {
	return z("cos", {}, [R(e)]);
}
function Gt(e) {
	return z("tan", {}, [R(e)]);
}
function Kt(e) {
	return z("tanh", {}, [R(e)]);
}
function qt(e) {
	return z("asinh", {}, [R(e)]);
}
function Jt(e) {
	return z("ln", {}, [R(e)]);
}
function Yt(e) {
	return z("log", {}, [R(e)]);
}
function Xt(e) {
	return z("log2", {}, [R(e)]);
}
function Zt(e) {
	return z("ceil", {}, [R(e)]);
}
function Qt(e) {
	return z("floor", {}, [R(e)]);
}
function $t(e) {
	return z("round", {}, [R(e)]);
}
function en(e) {
	return z("sqrt", {}, [R(e)]);
}
function tn(e) {
	return z("exp", {}, [R(e)]);
}
function nn(e) {
	return z("abs", {}, [R(e)]);
}
function rn(e, t) {
	return z("le", {}, [R(e), R(t)]);
}
function an(e, t) {
	return z("leq", {}, [R(e), R(t)]);
}
function on(e, t) {
	return z("ge", {}, [R(e), R(t)]);
}
function sn(e, t) {
	return z("geq", {}, [R(e), R(t)]);
}
function cn(e, t) {
	return z("pow", {}, [R(e), R(t)]);
}
function ln(e, t) {
	return z("eq", {}, [R(e), R(t)]);
}
function un(e, t) {
	return z("and", {}, [R(e), R(t)]);
}
function dn(e, t) {
	return z("or", {}, [R(e), R(t)]);
}
function fn(...e) {
	return z("add", {}, e.map(R));
}
function pn(...e) {
	return z("sub", {}, e.map(R));
}
function mn(...e) {
	return z("mul", {}, e.map(R));
}
function hn(...e) {
	return z("div", {}, e.map(R));
}
function gn(...e) {
	return z("mod", {}, e.map(R));
}
function _n(...e) {
	return z("min", {}, e.map(R));
}
function vn(...e) {
	return z("max", {}, e.map(R));
}
var yn = {};
T(yn, {
	db2gain: () => Sn,
	gain2db: () => Cn,
	hann: () => Tn,
	ms2samps: () => bn,
	select: () => wn,
	tau2pole: () => xn
});
var B = S(S({}, tt), Vt);
function bn(e) {
	return B.mul(B.sr(), B.div(e, 1e3));
}
function xn(e) {
	return B.exp(B.div(-1, B.mul(e, B.sr())));
}
function Sn(e) {
	return B.pow(10, B.mul(e, 1 / 20));
}
function Cn(e) {
	return wn(B.ge(e, 0), B.max(-120, B.mul(20, B.log(e))), -120);
}
function wn(e, t, n) {
	return B.add(B.mul(e, t), B.mul(B.sub(1, e), n));
}
function Tn(e) {
	return B.mul(.5, B.sub(1, B.cos(B.mul(2 * Math.PI, e))));
}
var V = S(S(S({}, tt), Vt), yn);
function En(e, t, n, r, i, a) {
	let o = V.env(V.tau2pole(V.mul(.001, e)), V.tau2pole(V.mul(.001, t)), i), s = V.gain2db(o), c = V.sub(1, V.div(1, r)), l = V.mul(c, V.sub(n, s)), u = V.min(0, l), d = V.db2gain(u);
	return V.mul(a, d);
}
function Dn(e, t, n, r, i, a, o) {
	let s = V.env(V.tau2pole(V.mul(.001, e)), V.tau2pole(V.mul(.001, t)), a), c = V.gain2db(s), l = V.sub(n, V.div(i, 2)), u = V.add(n, V.div(i, 2)), d = V.and(V.geq(c, l), V.leq(c, u)), f = V.sub(1, V.div(1, r)), p = V.select(d, V.mul(V.div(f, 2), V.mul(V.div(V.sub(c, l), i), V.sub(l, c))), V.mul(f, V.sub(n, c))), m = V.min(0, p), h = V.db2gain(m);
	return V.mul(o, h);
}
var On = {};
T(On, { adsr: () => Gn });
var kn = {};
T(kn, {
	allpass: () => zn,
	bandpass: () => Ln,
	dcblock: () => Nn,
	df11: () => Pn,
	highpass: () => In,
	highshelf: () => Hn,
	lowpass: () => Fn,
	lowshelf: () => Vn,
	notch: () => Rn,
	peak: () => Bn,
	pink: () => Un,
	sm: () => jn,
	smooth: () => An,
	zero: () => Mn
});
var H = S(S(S({}, tt), Vt), yn);
function An(e, t) {
	return H.pole(e, H.mul(H.sub(1, e), t));
}
function jn(e) {
	return An(H.tau2pole(.02), e);
}
function Mn(e, t, n) {
	return H.sub(H.mul(e, n), H.mul(t, H.z(n)));
}
function Nn(e) {
	return H.pole(.995, Mn(1, 1, e));
}
function Pn(e, t, n, r) {
	return H.pole(n, Mn(e, t, r));
}
function Fn(e, t, n) {
	return H.svf({ mode: "lowpass" }, e, t, n);
}
function In(e, t, n) {
	return H.svf({ mode: "highpass" }, e, t, n);
}
function Ln(e, t, n) {
	return H.svf({ mode: "bandpass" }, e, t, n);
}
function Rn(e, t, n) {
	return H.svf({ mode: "notch" }, e, t, n);
}
function zn(e, t, n) {
	return H.svf({ mode: "allpass" }, e, t, n);
}
function Bn(e, t, n, r) {
	return H.svfshelf({ mode: "peak" }, e, t, n, r);
}
function Vn(e, t, n, r) {
	return H.svfshelf({ mode: "lowshelf" }, e, t, n, r);
}
function Hn(e, t, n, r) {
	return H.svfshelf({ mode: "highshelf" }, e, t, n, r);
}
function Un(e) {
	return ((e, t, n) => H.min(t, H.max(e, n)))(-1, 1, H.mul(H.db2gain(-30), H.add(H.pole(.99765, H.mul(e, .099046)), H.pole(.963, H.mul(e, .2965164)), H.pole(.57, H.mul(e, 1.0526913)), H.mul(.1848, e))));
}
var Wn = S(S(S(S({}, tt), Vt), kn), yn);
function Gn(e, t, n, r, i) {
	let [a, o, s, c, l] = [
		e,
		t,
		n,
		r,
		i
	], u = Wn.mul(a, Wn.sr()), d = Wn.le(Wn.counter(l), u), f = Wn.select(l, Wn.select(d, 1, s), 0), p = Wn.max(1e-4, Wn.select(l, Wn.select(d, a, o), c)), m = Wn.tau2pole(Wn.div(p, 6.91));
	return Wn.smooth(m, f);
}
var Kn = {};
T(Kn, {
	capture: () => Zn,
	sample: () => qn,
	sampleseq: () => Jn,
	sampleseq2: () => Yn,
	table: () => Xn
});
function qn(e, t) {
	let n = e, { channels: r } = n, i = w(n, ["channels"]);
	return (0, f.default)(typeof r == "number" && r > 0, "Must provide a positive number channels prop"), et(z("mc.sample", i, [R(t)]), r);
}
function Jn(e, t) {
	let n = e, { channels: r } = n, i = w(n, ["channels"]);
	return (0, f.default)(typeof r == "number" && r > 0, "Must provide a positive number channels prop"), et(z("mc.sampleseq", i, [R(t)]), r);
}
function Yn(e, t) {
	let n = e, { channels: r } = n, i = w(n, ["channels"]);
	return (0, f.default)(typeof r == "number" && r > 0, "Must provide a positive number channels prop"), et(z("mc.sampleseq2", i, [R(t)]), r);
}
function Xn(e, t) {
	let n = e, { channels: r } = n, i = w(n, ["channels"]);
	return (0, f.default)(typeof r == "number" && r > 0, "Must provide a positive number channels prop"), et(z("mc.table", i, [R(t)]), r);
}
function Zn(e, t, ...n) {
	let r = e, { channels: i } = r, a = w(r, ["channels"]);
	return (0, f.default)(typeof i == "number" && i > 0, "Must provide a positive number channels prop"), et(z("mc.capture", a, [R(t), ...n.map(R)]), i);
}
var Qn = {};
T(Qn, {
	blepsaw: () => ir,
	blepsquare: () => ar,
	bleptriangle: () => or,
	cycle: () => er,
	noise: () => sr,
	pinknoise: () => cr,
	saw: () => tr,
	square: () => nr,
	train: () => $n,
	triangle: () => rr
});
var U = S(S(S({}, tt), Vt), kn);
function $n(e) {
	return U.le(U.phasor(e), .5);
}
function er(e) {
	return U.sin(U.mul(2 * Math.PI, U.phasor(e)));
}
function tr(e) {
	return U.sub(U.mul(2, U.phasor(e)), 1);
}
function nr(e) {
	return U.sub(U.mul(2, $n(e)), 1);
}
function rr(e) {
	return U.mul(2, U.sub(.5, U.abs(tr(e))));
}
function ir(e) {
	return z("blepsaw", {}, [R(e)]);
}
function ar(e) {
	return z("blepsquare", {}, [R(e)]);
}
function or(e) {
	return z("bleptriangle", {}, [R(e)]);
}
function sr(e) {
	return U.sub(U.mul(2, U.rand(e)), 1);
}
function cr(e) {
	return U.pink(sr(e));
}
var lr = class extends m {
	constructor() {
		super();
	}
}, W = C(S(S(S(S(S(S(S({}, tt), Bt), On), kn), Vt), Qn), yn), {
	mc: Kn,
	const: nt,
	in: Ht
}), ur = {
	CREATE_NODE: 0,
	APPEND_CHILD: 2,
	SET_PROPERTY: 3,
	ACTIVATE_ROOTS: 4,
	COMMIT_UPDATES: 5
}, dr = class {
	constructor() {
		this.nodeMap = /* @__PURE__ */ new Map(), this.currentActiveRoots = /* @__PURE__ */ new Set(), this.clear();
	}
	clear() {
		this.nodesAdded = 0, this.nodesRemoved = 0, this.edgesAdded = 0, this.propsWritten = 0, this.batch = {
			createNode: [],
			appendChild: [],
			setProperty: [],
			activateRoots: [],
			commitUpdates: []
		};
	}
	getNodeMap() {
		return this.nodeMap;
	}
	createNode(e, t) {
		this.nodesAdded++, this.batch.createNode.push([
			ur.CREATE_NODE,
			e,
			t
		]);
	}
	appendChild(e, t, n) {
		this.edgesAdded++, this.batch.appendChild.push([
			ur.APPEND_CHILD,
			e,
			t,
			n
		]);
	}
	setProperty(e, t, n) {
		this.propsWritten++, this.batch.setProperty.push([
			ur.SET_PROPERTY,
			e,
			t,
			n
		]);
	}
	activateRoots(e) {
		e.length === this.currentActiveRoots.size && e.every((e) => this.currentActiveRoots.has(e)) || (this.batch.activateRoots.push([ur.ACTIVATE_ROOTS, e]), this.currentActiveRoots = new Set(e));
	}
	commitUpdates() {
		this.batch.commitUpdates.push([ur.COMMIT_UPDATES]);
	}
	getPackedInstructions() {
		return [
			...this.batch.createNode,
			...this.batch.appendChild,
			...this.batch.setProperty,
			...this.batch.activateRoots,
			...this.batch.commitUpdates
		];
	}
};
function fr() {
	return typeof performance > "u" ? Date.now() : performance.now();
}
var pr = class {
	constructor(e) {
		this._delegate = new dr(), this._sendMessage = e, this._nextRefId = 0;
	}
	createRef(e, t, n) {
		let r = `__refKey:${this._nextRefId++}`, i = z(e, Object.assign({ key: r }, t), n);
		return [i, (e) => {
			if (!this._delegate.nodeMap.has(i.hash)) throw Error("Cannot update a ref that has not been mounted; make sure you render your node first");
			let t = this._delegate.nodeMap.get(i.hash);
			this._delegate.clear(), Oe(this._delegate, i.hash, t.props, e), this._delegate.commitUpdates();
			let n = this._delegate.getPackedInstructions();
			return Promise.resolve(this._sendMessage(n));
		}];
	}
	render(...e) {
		return this.renderWithOptions({
			rootFadeInMs: 20,
			rootFadeOutMs: 20
		}, ...e);
	}
	renderWithOptions(e, ...t) {
		let n = fr();
		this._delegate.clear(), Je(this._delegate, t.map(R), e.rootFadeInMs, e.rootFadeOutMs);
		let r = fr(), i = this._delegate.getPackedInstructions();
		return Promise.resolve(this._sendMessage(i)).then((e) => ({
			result: e,
			nodesAdded: this._delegate.nodesAdded,
			edgesAdded: this._delegate.edgesAdded,
			propsWritten: this._delegate.propsWritten,
			elapsedTimeMs: r - n
		}));
	}
	prune(e) {
		e.forEach((e) => {
			this._delegate.nodeMap.delete(e);
		});
	}
}, mr = Object.getOwnPropertySymbols, hr = Object.prototype.hasOwnProperty, gr = Object.prototype.propertyIsEnumerable, _r = (e, t) => {
	var n = {};
	for (var r in e) hr.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
	if (e != null && mr) for (var r of mr(e)) t.indexOf(r) < 0 && gr.call(e, r) && (n[r] = e[r]);
	return n;
}, vr = (e, t, n) => new Promise((r, i) => {
	var a = (e) => {
		try {
			s(n.next(e));
		} catch (e) {
			i(e);
		}
	}, o = (e) => {
		try {
			s(n.throw(e));
		} catch (e) {
			i(e);
		}
	}, s = (e) => e.done ? r(e.value) : Promise.resolve(e.value).then(a, o);
	s((n = n.apply(e, t)).next());
}), yr = "const EventTypes = {\n  CREATE_NODE: 0,\n  APPEND_CHILD: 2,\n  SET_PROPERTY: 3,\n  ACTIVATE_ROOTS: 4,\n  COMMIT_UPDATES: 5,\n  UPDATE_RESOURCE_MAP: 6,\n  RESET: 7,\n};\n\n\n// A recursive function looking for transferable objects per the Web Worker API\n// @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects\n//\n// Right now we're only looking for the ArrayBuffers behind Float32Array instances as that's\n// the only type of transferable object that the native engine delivers, but this could be\n// extended to other types easily.\nfunction findTransferables(val, transferables = []) {\n  if (val instanceof Float32Array) {\n    transferables.push(val.buffer);\n  } else if (typeof val === 'object') {\n    if (Array.isArray(val)) {\n      for (let i = 0; i < val.length; ++i) {\n        findTransferables(val[i], transferables);\n      }\n    } else if (val !== null) {\n      for (let key of Object.keys(val)) {\n        findTransferables(val[key], transferables);\n      }\n    }\n  }\n\n  return transferables;\n}\n\nclass ElementaryAudioWorkletProcessor extends AudioWorkletProcessor {\n  constructor(options) {\n    super(options);\n\n    const numInputChannels = options.numberOfInputs;\n    const numOutputChannels = options.outputChannelCount.reduce((acc, next) => acc + next, 0);\n\n    this._module = Module();\n    this._native = new this._module.ElementaryAudioProcessor(numInputChannels, numOutputChannels);\n\n    // The `sampleRate` variable is a globally defined constant in the AudioWorkletGlobalScope.\n    // We also manually set a block size of 128 samples here, per the Web Audio API spec.\n    //\n    // See: https://webaudio.github.io/web-audio-api/#rendering-loop\n    this._native.prepare(sampleRate, 128);\n\n    const hasProcOpts = options.hasOwnProperty('processorOptions') &&\n      typeof options.processorOptions === 'object' &&\n      options.processorOptions !== null;\n\n    if (hasProcOpts) {\n      const {virtualFileSystem, ...other} = options.processorOptions;\n\n      const validVFS = typeof virtualFileSystem === 'object' &&\n        virtualFileSystem !== null &&\n        Object.keys(virtualFileSystem).length > 0;\n\n      if (validVFS) {\n        for (let [key, val] of Object.entries(virtualFileSystem)) {\n          let result = this._native.addSharedResource(key, val);\n\n          if (!result.success) {\n            this.port.postMessage(['error', result.message]);\n          }\n        }\n      }\n    }\n\n    this.port.onmessage = (e) => {\n      let {requestId, requestType, payload} = e.data;\n\n      switch (requestType) {\n        case 'processQueuedEvents':\n          this._native.processQueuedEvents((evtBatch) => {\n            if (evtBatch.length > 0) {\n              let transferables = findTransferables(evtBatch);\n              this.port.postMessage(['events', evtBatch], transferables);\n            }\n          });\n\n          break;\n        case 'renderInstructions':\n          return this.port.postMessage(['reply', {\n            requestId,\n            result: this._native.postMessageBatch(payload.batch),\n          }]);\n        case 'updateSharedResourceMap':\n          for (let [key, val] of Object.entries(payload.resources)) {\n            let result = this._native.addSharedResource(key, val);\n\n            if (!result.success) {\n              return this.port.postMessage(['reply', {\n                requestId,\n                result,\n              }]);\n            }\n          }\n\n          return this.port.postMessage(['reply', {\n            requestId,\n            result: null,\n          }]);\n        case 'reset':\n          this._native.reset();\n\n          return this.port.postMessage(['reply', {\n            requestId,\n            result: null,\n          }]);\n        case 'gc':\n          let pruned = this._native.gc();\n\n          return this.port.postMessage(['reply', {\n            requestId,\n            result: pruned,\n          }]);\n        case 'pruneVirtualFileSystem':\n          this._native.pruneSharedResources();\n\n          return this.port.postMessage(['reply', {\n            requestId,\n            result: null,\n          }]);\n        case 'listVirtualFileSystem':\n          return this.port.postMessage(['reply', {\n            requestId,\n            result: this._native.listSharedResources(),\n          }]);\n        case 'setCurrentTime':\n          return this.port.postMessage(['reply', {\n            requestId,\n            result: this._native.setCurrentTime(payload.time),\n          }]);\n        case 'setCurrentTimeMs':\n          return this.port.postMessage(['reply', {\n            requestId,\n            result: this._native.setCurrentTimeMs(payload.time),\n          }]);\n        default:\n          break;\n      }\n    };\n\n    this.port.postMessage(['load', {\n      sampleRate,\n      blockSize: 128,\n      numInputChannels,\n      numOutputChannels,\n    }]);\n  }\n\n  process (inputs, outputs, parameters) {\n    if (inputs.length > 0) {\n      let m = 0;\n\n      // For each input\n      for (let i = 0; i < inputs.length; ++i) {\n        // For each channel on this input\n        for (let j = 0; j < inputs[i].length; ++j) {\n          const internalInputData = this._native.getInputBufferData(m++);\n\n          // For each sample on this input channel\n          for (let k = 0; k < inputs[i][j].length; ++k) {\n            internalInputData[k] = inputs[i][j][k];\n          }\n        }\n      }\n    }\n\n    const numSamples = (outputs.length > 0 && outputs[0].length > 0)\n      ? outputs[0][0].length\n      : 0;\n\n    this._native.process(numSamples);\n\n    if (outputs.length > 0) {\n      let m = 0;\n\n      // For each output\n      for (let i = 0; i < outputs.length; ++i) {\n        // For each channel on this output\n        for (let j = 0; j < outputs[i].length; ++j) {\n          const internalOutputData = this._native.getOutputBufferData(m++);\n\n          // For each sample on this input channel\n          for (let k = 0; k < outputs[i][j].length; ++k) {\n            outputs[i][j][k] = internalOutputData[k];\n          }\n        }\n      }\n    }\n\n    // Tells the browser to keep this node alive and continue calling process\n    return true;\n  }\n}\n\nregisterProcessor(`ElementaryAudioWorkletProcessor@${\"4.0.3\"}`, ElementaryAudioWorkletProcessor);\n", br = "\nvar Module = (() => {\n  var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;\n  \n  return (\nfunction(moduleArg = {}) {\n\nvar l=moduleArg,aa,ba;l.ready=new Promise((a,b)=>{aa=a;ba=b});if(\"function\"!==typeof globalThis?.crypto?.getRandomValues){function a(b){for(var c=0;c<b.length;c++)b[c]=256*Math.random()|0}\"object\"===typeof globalThis.crypto?globalThis.crypto.getRandomValues=a:globalThis.crypto={getRandomValues:a}}var ca=Object.assign({},l),da;da=a=>{if(\"function\"==typeof readbuffer)return new Uint8Array(readbuffer(a));a=read(a,\"binary\");\"object\"==typeof a||p();return a};\n\"undefined\"==typeof clearTimeout&&(globalThis.clearTimeout=()=>{});\"undefined\"==typeof setTimeout&&(globalThis.setTimeout=a=>\"function\"==typeof a?a():p());\"undefined\"!=typeof print&&(\"undefined\"==typeof console&&(console={}),console.log=print,console.warn=console.error=\"undefined\"!=typeof printErr?printErr:print);var ea=l.printErr||console.error.bind(console);Object.assign(l,ca);ca=null;var fa;l.wasmBinary&&(fa=l.wasmBinary);\"object\"!=typeof WebAssembly&&p(\"no native wasm support detected\");\n\"undefined\"==typeof atob&&(\"undefined\"!=typeof global&&\"undefined\"==typeof globalThis&&(globalThis=global),globalThis.atob=function(a){var b=\"\",c=0;a=a.replace(/[^A-Za-z0-9\\+\\/=]/g,\"\");do{var d=\"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\".indexOf(a.charAt(c++));var e=\"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\".indexOf(a.charAt(c++));var g=\"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\".indexOf(a.charAt(c++));var f=\"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\".indexOf(a.charAt(c++));\nd=d<<2|e>>4;e=(e&15)<<4|g>>2;var h=(g&3)<<6|f;b+=String.fromCharCode(d);64!==g&&(b+=String.fromCharCode(e));64!==f&&(b+=String.fromCharCode(h))}while(c<a.length);return b});var w,ha=!1,ia,x,y,z,A,B,ja,ka;function la(){var a=w.buffer;l.HEAP8=ia=new Int8Array(a);l.HEAP16=y=new Int16Array(a);l.HEAPU8=x=new Uint8Array(a);l.HEAPU16=z=new Uint16Array(a);l.HEAP32=A=new Int32Array(a);l.HEAPU32=B=new Uint32Array(a);l.HEAPF32=ja=new Float32Array(a);l.HEAPF64=ka=new Float64Array(a)}var ma=[],na=[],oa=[];\nfunction pa(){var a=l.preRun.shift();ma.unshift(a)}var D=0,qa=null,E=null;function p(a){l.onAbort?.(a);a=\"Aborted(\"+a+\")\";ea(a);ha=!0;a=new WebAssembly.RuntimeError(a+\". Build with -sASSERTIONS for more info.\");ba(a);throw a;}var ra=a=>a.startsWith(\"data:application/octet-stream;base64,\"),F;F=\"data:application/octet-stream;base64,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BEAgBSAHNgIEIAcMAgsgByEDA0ACQCALIAEiAigCECACQRBqIAItABsiB8BBAEgiARsiBiACKAIUIAcgARsiCiAJIAkgCksiCBsiBxAnIgFBAEggCSAKSSABG0EBRgRAIAIiAygCACIBDQIMAQsgBiALIAcQJyIBQQBIIAggARtBAUcNACACQQRqIQMgAigCBCIBDQELCyAFIAI2AgQgAwwBCyAFIAM2AgQgBSADNgIAIAULIgcoAgAiAwR/QQAFQcAAECMiA0EQaiEBAkAgBCwAC0EATgRAIAEgBCkDADcDACABIAQoAgg2AggMAQsgASAEKAIAIAQoAgQQMQsgA0H/AToAOCADQSBqIgJBADoAACAELQAoIgFB/wFHBEAgBUEtNgIsIAVBLjYCKCAFQS82AiQgBUEwNgIgIAVBMTYCHCAFQTI2AhggBUEzNgIUIAVBNDYCECAFQTU2AgwgBUELaiACIARBEGogBUEMaiABQQJ0aigCABEDACADIAQtACg6ADgLIAMgBSgCBDYCCCADQgA3AgAgByADNgIAIAMhBCAMKAIAKAIAIgEEQCAMIAE2AgAgBygCACEECyAMKAIEIAQQPiAMIAwoAghBAWo2AghBAQs6AAQgACADNgIAIAVBMGokAAuABAEDfyACQYAETwRAIAAgASACEBogAA8LIAAgAmohAwJAIAAgAXNBA3FFBEACQCAAQQNxRQRAIAAhAgwBCyACRQRAIAAhAgwBCyAAIQIDQCACIAEtAAA6AAAgAUEBaiEBIAJBAWoiAkEDcUUNASACIANJDQALCwJAIANBfHEiBEHAAEkNACACIARBQGoiBUsNAANAIAIgASgCADYCACACIAEoAgQ2AgQgAiABKAIINgIIIAIgASgCDDYCDCACIAEoAhA2AhAgAiABKAIUNgIUIAIgASgCGDYCGCACIAEoAhw2AhwgAiABKAIgNgIgIAIgASgCJDYCJCACIAEoAig2AiggAiABKAIsNgIsIAIgASgCMDYCMCACIAEoAjQ2AjQgAiABKAI4NgI4IAIgASgCPDYCPCABQUBrIQEgAkFAayICIAVNDQALCyACIARPDQEDQCACIAEoAgA2AgAgAUEEaiEBIAJBBGoiAiAESQ0ACwwBCyADQQRJBEAgACECDAELIAAgA0EEayIESwRAIAAhAgwBCyAAIQIDQCAC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AygCVEEBRhtBACADKAJgQQFGGyEADAELIAMoAlBBAUcEQCADKAJgDQEgAygCVEEBRw0BIAMoAlhBAUcNAQsgAygCSCEACyADQfAAaiQAIAALwQECAn8BfCMAQRBrIgEkAAJAIAC9QiCIp0H/////B3EiAkH7w6T/A00EQCACQYCAwPIDSQ0BIABEAAAAAAAAAABBABBZIQAMAQsgAkGAgMD/B08EQCAAIAChIQAMAQsgACABEHchAiABKwMIIQAgASsDACEDAkACQAJAAkAgAkEDcQ4DAAECAwsgAyAAQQEQWSEADAMLIAMgABBaIQAMAgsgAyAAQQEQWZohAAwBCyADIAAQWpohAAsgAUEQaiQAIAALkAQBBH8gASAAIAFGIgM6AAwCQCADDQADQCABKAIIIgMtAAwNAQJAIAMgAygCCCICKAIAIgRGBEACQCACKAIEIgRFDQAgBC0ADA0ADAILAkAgASADKAIARgRAIAMhAQwBCyADIAMoAgQiASgCACIENgIEIAMhACAEBEAgBCADNgIIIAMoAggiAigCACEACyABIAI2AgggAiACQQRqIAAgA0YbIAE2AgAgASADNgIAIAMgATYCCCABKAIIIgIoAgAhAwsgAUEBOgAMIAJBADoADCACIAMoAgQiADYCACAABEAgACACNgIICyADIAIoAggiADYCCCAAIAAoAgAgAkdBAnRqIAM2AgAgAyACNgIEIAIgAzYCCA8LAkAgBEUNACAELQAMDQAMAQsCQCABIAMoAgBHBEAgAyEBDAELIAMgASgCBCIANgIAIAAEQCAAIAM2AgggAygCCCECCyABIAI2AgggAiACQQRqIAIoAgAgA0YbIAE2AgAgASADNgIEIAMgATYCCCABKAIIIQILIAFBAToADCACQQA6AAwgAiACKAIEIgAoAgAiATYCBCABBEAgASACNgIICyAAIAIoAggiATYCCCABIAEoAgAgAkdBAnRqIAA2AgAgACACNgIAIAIgADYCCAwCCyAEQQxqIQUgA0EBOgAMIAIgACACRjoADCAFQQE6AAAgAiIBIABHDQALCwv/AQEHfyABIAAoAggiAiAAKAIEIgNrQQN1TQRAIAAgAQR/IAMgAUEDdCIAECYgAGoFIAMLNgIEDwsCQCADIAAoAgAiBWtBA3UiByABaiIEQYCAgIACSQRAQf////8B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IApCgYCAgICAgHBUIAhCAYYiCEKAgICAgICAcFhxRQRAIAAgAaAhAgwDCyAIQoCAgICAgIDw/wBRDQJEAAAAAAAAAAAgASABoiAJQgBTIAhCgICAgICAgPD/AFRzGyECDAILIAhCAYZCgICAgICAgBB8QoGAgICAgIAQVARAIAAgAKIhAiAIQgBTBEAgApogAiAJEI4BQQFGGyECCyAJQgBZDQIjAEEQayILRAAAAAAAAPA/IAKjOQMIIAsrAwghAgwCCyAIQgBTBEAgCRCOASIMRQRAIAAgAKEiACAAoyECDAMLIAtB/w9xIQsgDEEBRkESdCEMIAC9Qv///////////wCDIQgLIBBB/35NBEBEAAAAAAAA8D8hAiAIQoCAgICAgID4P1ENAiAPQb0HTQRAIAEgAZogCEKAgICAgICA+D9WG0QAAAAAAADwP6AhAgwDCyANQf8PSyAIQoCAgICAgID4P1ZHBEAjAEEQayILRAAAAAAAAABwOQMIIAsrAwhEAAAAAAAAAHCiIQIMAwsjAEEQayILRAAAAAAAAAAQOQMIIAsrAwhEAAAAAAAAABCiIQIMAgsgCw0AIABEAAAAAAAAMEOivUL///////////8Ag0KAgICAgICAoAN9IQgLAnwgCUKAgIBAg78iBSEHIA4gCEKAgICA0Kql8z99IglCNIentyIDQdjPAysDAKIgCUItiKdB/wBxQQV0IgtBsNADaisDAKAgCCAJQoCAgICAgIB4g30iCEKAgICACHxCgICAgHCDvyIAIAtBmNADaisDACIEokQAAAAAAADwv6AiAiAIvyAAoSAEoiIEoCIAIANB0M8DKwMAoiALQajQA2orAwCgIgMgACADoCIDoaCgIAQgAEHgzwMrAwAiBKIiBiACIASiIgSgoqAgAiAEoiICIAMgAyACoCICoaCgIAAgACAGoiIDoiADIAMgAEGQ0AMrAwCiQYjQAysDAKCiIABBgNADKwMAokH4zwMrAwCgoKIgAEHwzwMrAwCiQejPAysDAKCgoqAiACACIAIgAKAiAqGgOQMIIAcgAr1CgICAQIO/IgOiIQAgASAFoSADoiAOKwMIIAIgA6GgIAGioCEBAkAgAL1CNIinQf8PcSILQckHa0E/SQ0AIAtByQdJBEAgAEQAAAAAAADwP6AiAJogACAMGwwCCyALQYkISSER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ASABECILIABBhAFqIgEoAmQiAgRAIAEgAjYCaCACECILIAEoAlgiAgRAIAEgAjYCXCACECILIAEoAkwiAgRAIAEgAjYCUCACECILIAFBQGsoAgAiAgRAIAEgAjYCRCACECILIAEoAjQiAgRAIAEgAjYCOCACECILIAEoAiQiAgRAIAEgAjYCKCACECILIAEoAhgiAgRAIAEgAjYCHCACECILIAEoAgwiAgRAIAEgAjYCECACECILIAEoAgAiAgRAIAEgAjYCBCACECILIAAoAngiAQRAIAAgATYCfCABECILIAAoAmAiAQRAIAAgATYCZCABECILIABBQGsoAgAiAQRAIAAgATYCRCABECILAkACQCAAKAIoIgEgAEEYaiIARgRAQQQhAiAAIQEMAQtBBSECIAFFDQELIAEgASgCACACQQJ0aigCABEAAAsL5AkCCn8BfiMAQSBrIgMkACAAQgA3AzAgAEKAgICAgICA8D83AxAgAEKAgICAgICA+D83AwggAEEBOgAEIABBADYCACAAQQA2AkggAEFAayICQgA3AwAgAEEANgIoIANCADcDECACQQEgA0EQaiICEFYgAEIANwM4IABCgICAgBA3AlQgAEIANwJMIABB3ABqQZgBECYaIABBhAFqQQIQtgEgAEEANgKMAiAAQgA3AoQCIABCADcC/AEgAEIANwL0ASAAQTBqQQBBAUEBELUBIABBADYCqAIgAEGgAmoiAUIANwMAIABCADcDkAIgA0IANwMQIAFBASACEFYgAEIANwOYAiAAQgA3A7gCIABBfzYCtAIgAEIANwKsAiAAQgA3AL0CIABCgICAgICAgPg/NwPIAiAAQQE6AMUCIABB0AJqQeAAECYaIANBEBAjIgE2AhAgA0KMgICAgIKAgIB/NwIUIAFBxA4oAAA2AAggAUG8DikAADcAACABQQA6AAwjAEEQayIGJAAjAEEgayIBJAACfyACLQALQQd2BEAgAigCAAwBCyACCyEEIAECfyACLQALQQd2BEAgAigCBAwBCyACLQALQf8AcQs2AhwgASAENgIYIAFBvA42AhAgAUG8DhBDNgIUIAEgASkCGDcDCCABIAEpAhA3AwAjAEEQayIEJAAgASgCDCABKAIERgRAIAQgASkCACILNwMAIAQgCzcDCCMAQRBrIgUkACAFIAEoAgw2Agwg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AyQAAkAgAkEKTQRAIAAgAC0AC0GAAXEgAkH/AHFyOgALIAAgAC0AC0H/AHE6AAsgASACIAAQTCADQQA6AA8gACACaiADLQAPOgAADAELIABBCiACQQprIAAtAAtB/wBxIgAgACACIAEQiQELIANBEGokAAt2AQJ/IwBBEGsiBCQAAkAgAiAAKAIIQf////8HcSIDSQRAIAAoAgAhAyAAIAI2AgQgASACIAMQTCAEQQA6AA8gAiADaiAELQAPOgAADAELIAAgA0EBayACIANrQQFqIAAoAgQiACAAIAIgARCJAQsgBEEQaiQACxYAIAIQIyEBIAAgAjYCBCAAIAE2AgAL4AIBBX8jAEEQayIHJAAgAiABQX9zQe////8Hak0EQAJ/IAAtAAtBB3YEQCAAKAIADAELIAALIQggB0EEaiIJIAAgAUHn////A0kEfyAHIAFBAXQ2AgwgByABIAJqNgIEIwBBEGsiAiQAIAkoAgAgB0EMaiIKKAIASSELIAJBEGokACAKIAkgCxsoAgAiAkELTwR/IAJBEGpBcHEiAiACQQFrIgIgAkELRhsFQQoLQQFqBUHv////BwsQiAEgBygCBCECIAcoAggaIAUEQCAGIAUgAhBMCyADIARrIQYgAyAERwRAIAQgCGogBiACIAVqEEwLIAFBCkcEQCAIECILIAAgAjYCACAAIAAoAghBgICAgHhxIAcoAghB/////wdxcjYCCCAAIAAoAghBgICAgHhyNgIIIAAgBSAGaiIANgIEIAdBADoADCAAIAJqIActAAw6AAAgB0EQaiQADwsQdAALSwECfyAAQeD7AzYCACAAQdD8AzYCACABEEMiAkENahAjIgNBADYCCCADIAI2AgQgAyACNgIAIAAgA0EMaiABIAJBAWoQLzYCBCAACwUAEA4AC4gBAQR/IwBBEGsiBSQAIAVBADoADiMAQRBrIgMkACABIABrQQJ1IQEDQCABBEAgAyAANgIMIAMgAygCDCABQQF2IgRBAnRqNgIMIAEgBEF/c2ogBCADKAIMIgQoAgAgAigCAEkiBhshASAEQQRqIAAgBhshAAwBCwsgA0EQaiQAIAVBEGokACAAC6QDAwJ8An8BfiAAvSIHQoCAgICA/////wCDQoGAgIDwhOXyP1QiBkUEQEQYLURU+yHpPyAAIACaIAdCAFkiBRuhRAdc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QQBIG0EIRw0AIAEoAgAgASAEQQBIGykAAELp3NGrps7dsOwAUg0AQQUgAi0AGEEDRw0BGkEGIAIrAwAiB0QAAAAAAAAAAGUNARogAAJ+IAdE/Knx0k1iUD+iIAArAyCiIgdEAAAAAAAAAEAgB0QAAAAAAAAAQGQbIgeZRAAAAAAAAOBDYwRAIAewDAELQoCAgICAgICAgH8LNwNACyADQQxqIABBCGogASABIAIQMwJAIAMtABANACADKAIMIgRBGGohACACLQAYIQECQCAELQAwIgVB/wFGBEAgAUH/AUYNAgwBCyABQf8BRw0AIANBGzYCLCADQRw2AiggA0EdNgIkIANBHjYCICADQR82AhwgA0EgNgIYIANBITYCFCADQSI2AhAgA0EjNgIMIANBCGogACADQQxqIAVBAnRqKAIAEQEAIARB/wE6ADAMAQsgAyAANgIIIANBODYCLCADQTk2AiggA0E6NgIkIANBOzYCICADQTw2AhwgA0E9NgIYIANBPjYCFCADQT82AhAgA0HAADYCDCADQQhqIAAgAiADQQxqIAFBAnRqKAIAEQMAC0EACyEGIANBMGokACAGC/8CAQZ/IwBBMGsiAiQAIABB3NICNgIAIAAoAlQiAwRAIAAoAlgiBCADIgFHBEADQCAEQQxrIgEoAgAiBQRAIARBCGsgBTYCACAFECILIAEiBCADRw0ACyAAKAJUIQELIAAgAzYCWCABECILIAAoAjwiAQRAIABBQGsgATYCACABECILIAAoAjAiAQRAIAAgATYCNCABECILIAAoAiwhASAAQQA2AiwgAQRAIAEgASgCACgCBBEAAAsgAEHMIDYCACAAKAIQIgEEQANAIAEoAgAhBiABLQAwIgRB/wFHBEAgAkEbNgIsIAJBHDYCKCACQR02AiQgAkEeNgIgIAJBHzYCHCACQSA2AhggAkEhNgIUIAJBIjYCECACQSM2AgwgAkELaiABQRhqIAJBDGogBEECdGooAgARAQALIAFB/wE6ADAgASwAE0EASARAIAEoAggQIgsgARAiIAYiAQ0ACwsgACgCCCEBIABBADYCCCABBEAgARAiCyACQTBqJAAgAAukAwEGfyMAQTBrIgIkACAAQaDOAjYCACAAKAJcIgEEQCAAIAE2AmAgARAiCyAAKAJQIgEEQCAAIAE2AlQgARAiCwJA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IAJBIjYCECACQSM2AgwgAkELaiABQRhqIAJBDGogBEECdGooAgARAQALIAFB/wE6ADAgASwAE0EASARAIAEoAggQIgsgARAiIAYiAQ0ACwsgACgCCCEBIABBADYCCCABBEAgARAiCyACQTBqJAAgAAuHAgEEfyMAQTBrIgIkACAAQQA2AgggAEIANwMAAkAgASgCBCIFIAEoAgAiA0cEQCAFIANrIgRBAEgNASAAIAQQIyIBNgIEIAAgATYCACAAIAEgBGo2AggDQCABQf8BOgAYIAFBADoAACADLQAYIgRB/wFHBEAgAkEtNgIsIAJBLjYCKCACQS82AiQgAkEwNgIgIAJBMTYCHCACQTI2AhggAkEzNgIUIAJBNDYCECACQTU2AgwgAkELaiABIAMgAkEMaiAEQQJ0aigCABEDACABIAMtABg6ABgLIAFBIGohASADQSBqIgMgBUcNAAsgACABNgIECyAAQQY6ABggAkEwaiQADwsQLAALmgMBBH8jAEEQayIDJAAgAEIANwIEIAAgAjYCACAAQQxqIgVCADcCACAAQQA2AhQgACACQQFrNgIYAkACQCABRQ0AIAJFBEADQCADQQA2AgwgA0IANwIEAkAgACgCECICIAAoAhRPBEAgBSADQQRqEEEgAygCBCICRQ0BIAMgAjYCCCACECIMAQsgAkEANgIIIAJCADcCACACIAMoAgQ2AgAgAiADKAIINgIEIAIgAygCDDYCCCAAIAJBDGo2AhALIARBAWoiBCABRw0ADAILAAsgAkGAgICAAk8NASACQQN0IQQDQCADIAQQIyICNgIEIAMgAiAEajYCDCADIAIgBBAmIARqNgIIAkAgACgCECICIAAoAhRJBEAgAkEANgIIIAJCADcCACACIAMoAgQ2AgAgAiADKAIINgIEIAIgAygCDDYCCCAAIAJBDGo2AhAMAQsgBSADQQRqEEEgAygCBCICRQ0AIAMgAjYCCCACECILIAZBAWoiBiABRw0ACwsgA0EQaiQAIAAPCyADQQA2AgwgA0IANwIEECwAC40EAQd/IwBBMGsiAiQAIABBsJ8CNgIAIAAoAsgBIgQEQCAEIQMgBCAAKALMASIBRwRAA0AgAUEgayIBLQAYIgNB/wFHBEAgAkEbNgIsIAJBHDYCKCACQR02AiQgAkEeNgIgIAJBHzYCHCACQSA2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IgsMAwsQLAALEDQACyACIANPDQAgACAEIAJBOGxqNgKoAwsgCEHQAGokAA8LECwAC/8EAQZ/IAEgACgCCCIEIAAoAgAiA2tBBHVNBEACQCAAKAIEIANrQQR1IgYgASABIAZLGyIFRQ0AAkAgBUEDcSIHRQRAIAUhBAwBCyAFIQQDQCADIAIpAwA3AwAgAyACKQMINwMIIARBAWshBCADQRBqIQMgCEEBaiIIIAdHDQALCyAFQQRJDQADQCADIAIpAwA3AwAgAyACKQMINwMIIAMgAikDCDcDGCADIAIpAwA3AxAgAyACKQMINwMoIAMgAikDADcDICADIAIpAwA3AzAgAyACKQMINwM4IANBQGshAyAEQQRrIgQNAAsLIAEgBksEQCAAKAIEIgMgASAGa0EEdGohAQNAIAMgAikDADcDACADIAIpAwg3AwggA0EQaiIDIAFHDQALIAAgATYCBA8LIAAgACgCACABQQR0ajYCBA8LIAMEQCAAIAM2AgQgAxAiIABBADYCCCAAQgA3AgBBACEECwJAIAFBgICAgAFPDQBB/////wAgBEEDdSIFIAEgASAFSRsgBEHw////B08bIgRBgICAgAFPDQAgACAEQQR0IgQQIyIFNgIEIAAgBTYCACAAIAQgBWo2AgggBSEDIAFBA3EiBgRAQQAhBANAIAMgAikDADcDACADIAIpAwg3AwggA0EQaiEDIARBAWoiBCAGRw0ACwsgAUEEdCAFaiEEIAFBAWtB/////wBxQQNPBEADQCADIAIpAwA3AwAgAyACKQMINwMIIAMgAikDCDcDGCADIAIpAwA3AxAgAyACKQMINwMoIAMgAikDADcDICADIAIpAwA3AzAgAyACKQMINwM4IANBQGsiAyAERw0ACwsgACAENgIEDwsQLAALoQQDB38BfQF8IwBBEGsiBiQAIAAoAlQiB0EEaiIEIQMgBygCBCICBEADQCACIAMgAisDECABZCIFGyEDIAIgAkEEaiAFGygCACICDQALCyAAIAM2AmACQCAHKAIAIANHBEACQCADKAIAIgQEQANAIAQiAigCBCIEDQAMAgsACwNAIAMoAggiAigCACADRiEIIAIhAyAIDQALCyAAIAI2AlwgAEGIAWoiBCAAKAL4ASIDQThsaiIFQQA2AgQgBSAFKgIIiyIJjCAJIAUqAgBDAAAA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CyACECIgBiICDQALCyAAKAIIIQEgAEEANgIIIAEEQCABECILIANBMGokACAACwwAIAEgAi0AADoAAAvlAwEGfyMAQTBrIgMkACAAQcDZATYCAAJAIAAoAlgiAUUNACABIAEoAgQiAkEBazYCBCACDQAgASABKAIAKAIIEQAAIAEQJQsgACgCRCIEBEAgACgCSCICIAQiAUcEQANAAkAgAkEIayICKAIEIgFFDQAgASABKAIEIgVBAWs2AgQgBQ0AIAEgASgCACgCCBEAACABECULIAIgBEcNAAsgACgCRCEBCyAAIAQ2AkggARAiCyAAKAIsIgQEQCAAKAIwIgIgBCIBRwRAA0ACQCACQQhrIgIoAgQiAUUNACABIAEoAgQiBUEBazYCBCAFDQAgASABKAIAKAIIEQAAIAEQJQsgAiAERw0ACyAAKAIsIQELIAAgBDYCMCABECILIABBzCA2AgAgACgCECICBEADQCACKAIAIQYgAi0AMCIEQf8BRwRAIANBGzYCLCADQRw2AiggA0EdNgIkIANBHjYCICADQR82AhwgA0EgNgIYIANBITYCFCADQSI2AhAgA0EjNgIMIANBC2ogAkEYaiADQQxqIARBAnRqKAIAEQEACyACQf8BOgAwIAIsABNBAEgEQCACKAIIECILIAIQIiAGIgINAAsLIAAoAgghASAAQQA2AgggAQRAIAEQIgsgA0EwaiQAIAALDAAgASACKwMAOQMACzwAIAFBADYCCCABQgA3AwAgASACKAIANgIAIAEgAigCBDYCBCABIAIoAgg2AgggAkEANgIIIAJCADcDAAvlAwEGfyMAQTBrIgMkACAAQZy/ATYCAAJAIAAoAlgiAUUNACABIAEoAgQiAkEBazYCBCACDQAgASABKAIAKAIIEQAAIAEQJQsgACgCRCIEBEAgACgCSCICIAQiAUcEQANAAkAgAkEIayICKAIEIgFFDQAgASABKAIEIgVBAWs2AgQgBQ0AIAEgASgCACgCCBEAACABECULIAIgBEcNAAsgACgCRCEBCyAAIAQ2AkggARAiCyAAKAIsIgQEQCAAKAIwIgIgBCIBRwRAA0ACQCACQQhrIgIoAgQiAUUNACABIAEoAgQiBUEBazYCBCAFDQAgASABKAIAKAIIEQAAIAEQJQsgAiAERw0ACyAAKAIsIQELIAAgBDYCMCABECILIABBzCA2AgAgACgCECICBEADQCACKAIAIQYgAi0AMCIEQf8BRwRAIANBGzYCLCADQRw2AiggA0EdNgIkIANBHjYCICADQR82AhwgA0EgNgIYIANBITYCFCADQSI2AhAgA0EjNgIMIANBC2ogAkEYaiADQQxqIARBAnRqKAIAEQEACyACQf8BOgAwIAIsABNBAEgEQCACKAIIECILIAIQIiAGIgINAAsLIAAoAgghASAAQQA2AgggAQRAIAEQIgsgA0EwaiQAIAAL/AMBBn8jAEEwayIDJAAgAEHEugE2AgACQCAAKAJYIgFFDQAgASABKAIEIgJBAWs2AgQgAg0AIAEgASgCACgCCBEAACABECULIAAoAkQiBARAIAAoAkgiAiAEIgFHBEADQCACQQxrIgIiAS0ACCIFQf8BRwRAIANBxAA2AhQgA0HFADYCECADQcYANgIMIANBC2ogAiADQQxqIAVBAnRqKAIAEQEACyABQf8BOgAIIAIgBEcNAAsgACgCRCEBCyAAIAQ2AkggARAiCyAAKAIsIgQEQCAAKAIwIgIgBCIBRwRAA0ACQCACQQhrIgIoAgQiAUUNACABIAEoAgQiBUEBazYCBCAFDQAgASABKAIAKAIIEQAAIAEQJQsgAiAERw0ACyAAKAIsIQELIAAgBDYCMCABECILIABBzCA2AgAgACgCECICBEADQCACKAIAIQYgAi0AMCIEQf8BRwRAIANBGzYCLCADQRw2AiggA0EdNgIkIANBHjYCICADQR82AhwgA0EgNgIYIANBITYCFCADQSI2AhAgA0EjNgIMIANBC2ogAkEYaiADQQxqIARBAnRqKAIAEQEACyACQf8BOgAwIAIsABNBAEgEQCACKAIIECILIAIQIiAGIgINAAsLIAAoAgghASAAQQA2AgggAQRAIAEQIgsgA0EwaiQAIAAL5QMBBn8jAEEwayIDJAAgAEGAtwE2AgACQCAAKAJYIgFFDQAgASABKAIEIgJBAWs2AgQgAg0AIAEgASgCACgCCBEAACABECULIAAoAkQiBARAIAAoAkgiAiAEIgFHBEADQAJAIAJBCGsiAigCBCIBRQ0AIAEgASgCBCIFQQFrNgIEIAUNACABIAEoAgAoAggRAAAgARAlCyACIARHDQALIAAoAkQhAQsgACAENgJIIAEQIgsgACgC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IQELIAAgBDYCSCABECILIAAoAiwiBARAIAAoAjAiAiAEIgFHBEADQAJAIAJBCGsiAigCBCIBRQ0AIAEgASgCBCIFQQFrNgIEIAUNACABIAEoAgAoAggRAAAgARAlCyACIARHDQALIAAoAiwhAQsgACAENgIwIAEQIgsgAEHMIDYCACAAKAIQIgIEQANAIAIoAgAhBiACLQAwIgRB/wFHBEAgA0EbNgIsIANBHDYCKCADQR02AiQgA0EeNgIgIANBHzYCHCADQSA2AhggA0EhNgIUIANBIjYCECADQSM2AgwgA0ELaiACQRhqIANBDGogBEECdGooAgARAQALIAJB/wE6ADAgAiwAE0EASARAIAIoAggQIgsgAhAiIAYiAg0ACwsgACgCCCEBIABBADYCCCABBEAgARAiCyADQTBqJAAgAAuNBgEIfyAAKAKEASICBEADQCACKAIAIQYCQCACKAIYIgNFDQAgAyADKAIEIgRBAWs2AgQgBA0AIAMgAygCACgCCBEAACADECULIAIsABNBAEgEQCACKAIIECILIAIQIiAGIgINAAsLIAAoAnwhASAAQQA2AnwgAQRAIAEQIgsgACgCcCIDBEAgACgCdCICIAMiAUcEQANAAkAgAkEIayICKAIEIgFFDQAgASABKAIEIgRBAWs2AgQgBA0AIAEgASgCACgCCBEAACABECULIAIgA0cNAAsgACgCcCEBCyAAIAM2AnQgARAiCyAAQeQAaiAAKAJoEFcgACgCWCIBBEADQCABIgIoAgAhASACKAIgIgMEQCACIAM2AiQgAxAiCyACKAIUIgMEQCACIAM2AhggAxAiCwJAIAIoAhAiA0UNACADIAMoAgQiBEEBazYCBCAEDQAgAyADKAIAKAIIEQAAIAMQJQsgAhAiIAENAAsLIAAoAlAhASAAQQA2AlAgAQRAIAEQIgsgACgCRCICBEADQCACKAIAIQcCQAJAIAIoAigiASACQRhqIgRGBEBBBCEFIAQhAQwBC0EFIQUgAUUNAQsgASABKAIAIAVBAnRqKAIAEQAACyACLAATQQBIBEAgAigCCBAiCyACECIgByICDQALCyAAKAI8IQEgAEEANgI8IAEEQCABECILIAAoAiwiAwRAIAAoAjAiAiADIgFHBEADQAJAIAJBCGsiAigCBCIBRQ0AIAEgASgCBCIEQQFr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9gMQPCIBBEAgAygCDCEADAELCyAAQZj1A0GY9wMQPCIARQ0AIAAgAygCDBCEASECCyACCyEFDAILIANBmPUDQZj3AxA8IgEEQCAALQAIQQFxRQ0CIAEgBigCDBCEASEFDAILIANBmPUDQcj1AxA8IgFFDQEgBigCDCIARQ0BIABBmPUDQcj1AxA8IgBFDQEgBEEMakE0ECYaIARBATYCOCAEQX82AhQgBCABNgIQIAQgADYCCCAAIARBCGogAigCAEEBIAAoAgAoAhwRBwACQCAEKAIgIgBBAUcNACACKAIARQ0AIAIgBCgCGDYCAAsgAEEBRiEFDAELQQAhBQsgBEFAayQAIAULbgECfyAAIAEoAghBABA4BEAgASACIAMQcg8LIAAoAgwhBCAAQRBqIgUgASACIAMQhQECQCAEQQJIDQAgBSAEQQN0aiEEIABBGGohAANAIAAgASACIAMQhQEgAS0ANg0BIABBCGoiACAESQ0ACwsLMQAgACABKAIIQQAQOARAIAEgAiADEHIPCyAAKAIIIgAgASACIAMgACgCACgCHBEHAAsYACAAIAEoAghBABA4BEAgASACIAMQcgsLnwEBAn8jAEFAaiIDJAACf0EBIAAgAUEAEDgNABpBACABRQ0AGkEAIAFBmPUDQcj1AxA8IgFFDQAaIANBDGpBNBAmGiADQQE2AjggA0F/NgIUIAMgADYCECADIAE2AgggASADQQhqIAIoAgBBASABKAIAKAIcEQcAIAMoAiAiAEEBRgRAIAIgAygCGDYCAAsgAEEBRgshBCADQUBrJAAgBAsKACAAIAFBABA4CwoAQdgZQQAQcwALBQBB6QsLBABBAAsFAEHSDguqAgEDfyMAQTBrIgMkACADQQxqIABBCGogASABIAIQMwJAIAMtABANACADKAIMIgRBGGohACACLQAYIQECQCAELQAwIgVB/wFGBEAgAUH/AUYNAgwBCyABQf8BRw0AIANBGzYCLCADQRw2AiggA0EdNgIkIANBHjYCICADQR82AhwgA0EgNgIYIANBITYCFCADQSI2AhAgA0EjNgIMIANBCGogACADQQxqIAVBAnRqKAIAEQEAIARB/wE6ADAMAQsgAyAANgIIIANBODYCLCADQTk2AiggA0E6NgIkIANBOzYCICADQTw2AhwgA0E9NgIYIANBPjYCFCAD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AwAgACACLQAYOgAoCyAFQTBqJAAgAAwBCxBGAAshACADIANB8ABqIgI2AmwgA0IANwJwIANBnAFqIgEgA0HsAGoiBSACIANBCGoiBiAGEC4gASAFIAIgACAAEC4gA0IANwJ8IAMgA0H4AGpBBHIiBTYCeCACIAMoAmwiAEcEQANAIANBnAFqIANB+ABqIAUgAEEQaiIBIAEQLgJAIAAoAgQiAQRAA0AgASIAKAIAIgENAAwCCwALA0AgACAAKAIIIgAoAgBHDQALCyAAIAJHDQALCyADQQU6AJABAkAgBygCBCIAIAcoAghJBEBB/wEhASAAQf8BOgAYIABBADoAACADLQCQASICQf8BRwRAIANBJDYCvAEgA0ElNgK4ASADQSY2ArQBIANBJzYCsAEgA0EoNgKsASADQSk2AqgBIANBKjYCpAEgA0ErNgKgASADQSw2ApwBIANBmwFqIAAgA0H4AGogA0GcAWogAkECdGooAgARAwAgACADLQCQASIBOgAYCyAHIABBIGo2AgQMAQsgByADQfgAahCAASADLQCQASEBCyABQf8BcSIAQf8BRwRAIANBGzYCvAEgA0EcNgK4ASADQR02ArQBIANBHjYCsAEgA0EfNgKsASADQSA2AqgBIANBITYCpAEgA0EiNgKgASADQSM2ApwBIANBmwFqIANB+ABqIANBnAFqIABBAnRqKAIAEQEACyADQf8BOgCQASADQewAaiADKAJwEDUgAy0AYCIAQf8BRwRAIANBGzYCvAEgA0EcNgK4ASADQR02ArQBIANBHjYCsAEgA0EfNgKsASADQSA2AqgBIANBITYCpAEgA0EiNgKgASADQSM2ApwBIANBmwFqIANByABqIANBnAFqIABBAnRqKAIAEQEACyADQf8BOgBgIAMsAENBAEgEQCADKAI4ECILIAMtADAiAEH/AUcEQCADQRs2ArwBIANBHDYCuAEgA0EdNgK0ASADQR42ArABIANBHzYCrAEgA0EgNgKoASADQSE2AqQBIANBIjYCoAEgA0EjNgKcASADQZsBaiADQRhqIANBnAFqIABBAnRqKAIAEQEACyADQf8BOgAwIAMsABNBAEgEQCADKAIIECILIANBwAFqJAAgBC0AICIAQf8BRwRAIARBGzYCTCAEQRw2AkggBEEdNgJEIARBHjYCQCAEQR82AjwgBEEgNgI4IARBITYCNCAEQSI2AjAgBEEjNgIsIARBK2ogCCAEQSxqIABBAnRqKAIAEQEACyAEQdAAaiQACxUAIAFB9OkCNgIAIAEgACkCBDcCBAsdAQF/QQwQIyIBQfTpAjYCACABIAApAgQ3AgQgAQsUACAAQQxqQQAgASgCBEGY6QJGGwuLAQAjAEEwayIBJAAgACgCACIALQAYIgJBAUcEQCACQf8BRwRAIAFBGzYCLCABQRw2AiggAUEdNgIkIAFBHjYCICABQR82AhwgAUEgNgIYIAFBITYCFCABQSI2AhAgAUEjNgIMIAFBC2ogACABQQxqIAJBAnRqKAIAEQEACyAAQQE6ABgLIAFBMGokAAsZACAAKAIMIgAEQCAAIAAoAgAoAgQRAAALCwYAQejnAgsUACAAQQRqQQAgASgCBEHI5wJGGwueAgEFfwJAIAEoAgQiAEUNACAAKAIEDQAgASgCACICKAIYIgEgAigCFCIARwRAA0AgAUEwaxBeIgEgAEcNAAsLIAIgADYCGCACKAIMRQ0AIAIoAggiAQRAA0AgASgCACEGIAEQIiAGIgENAAsLQQAhASACQQA2AggCQCACKAIEIgBFDQAgAEEETwRAIABBfHEhBANAIAFBAnQiAyACKAIAakEANgIAIAIoAgAgA2pBADYCBCACKAIAIANqQQA2AgggAigCACADakEANgIMIAFBBGohASAFQQRqIgUgBEcNAAsLIABBA3EiA0UNAEEAIQADQCACKAIAIAFBAnRqQQA2AgAgAUEBaiEBIABBAWoiACADRw0ACwsgAkEANgIMCwsLACABQbjlAjYCAAsRAEEIECMiAEG45QI2AgAgAAsGAEGQ5QILFAAgAEEEakEAIAEoAgRBrOMCRhsLcwECfyMAQSBrIgIkACAAKAIgIQMgAiAAKAIUNgIEIAIgACgCKDYCCCACIAAoAgg2AgwgAiAAKAIsNgIQIAIgASgCEDYCFCACIAEoAhQ2AhggAiAALQAEOgAcIAMgAkEEaiADKAIAKAIQEQEAIAJBIGokAAuqAQECfyMAQTBrIgMkAAJAIAAoAgAiAC0AGCIEQf8BRwRAIARBAkYEQCABIAItAAA6AAAMAgsgA0EbNgIsIANBHDYCKCADQR02AiQgA0EeNgIgIANBHzYCHCADQSA2AhggA0EhNgIUIANBIjYCECADQSM2AgwgA0ELaiAAIANBDGogBEECdGooAgARAQALIAItAAAhASAAQQI6ABggACABOgAACyADQTBqJAALYwECfwJAIAAoAiQiAUUNACABIAEoAgQiAkEBazYCBCACDQAgASABKAIAKAIIEQAAIAEQJQsgACgCFCIBBEAgACABNgIYIAEQIgsgACgCCCIBBEAgACABNgIMIAEQIgsgABAiC18BAn8CQCAAKAIkIgFFDQAgASABKAIEIgJBAWs2AgQgAg0AIAEgASgCACgCCBEAACABECULIAAoAhQiAQRAIAAgATYCGCABECILIAAoAggiAQRAIAAgATYCDCABECILCxgAIAFB7OACNgIAIAFBBGogAEEEahCZAQsgAQF/QTAQIyIBQezgAjYCACABQQRqIABBBGoQmQEgAQtsAQJ/IABB7OACNgIAAkAgACgCJCIBRQ0AIAEgASgCBCICQQFrNgIEIAINACABIAEoAgAoAggRAAAgARAlCyAAKAIUIgEEQCAAIAE2AhggARAiCyAAKAIIIgEEQCAAIAE2AgwgARAiCyAAECILagECfyAAQezgAjYCAAJAIAAoAiQiAUUNACABIAEoAgQiAkEBazYCBCACDQAgASABKAIAKAIIEQAAIAEQJQsgACgCFCIBBEAgACABNgIYIAEQIgsgACgCCCIBBEAgACABNgIMIAEQIgsgAAsGAEHc4AILFAAgAEEEakEAIAEoAgRBoN8CRhsLcwECfyMAQSBrIgIkACAAKAIUIQMgAiABKAIANgIEIAIgASgCBDYCCCACIAAoAgg2AgwgAiAAKAIcNgIQIAIgASgCEDYCFCACIAEoAhQ2AhggAiAALQAEOgAcIAMgAkEEaiADKAIAKAIQEQEAIAJBIGokAAusAQICfwF8IwBBMGsiAyQAAkAgACgCACIALQAYIgRB/wFHBEAgBEEDRgRAIAEgAisDADkDAAwCCyADQRs2AiwgA0EcNgIoIANBHTYCJCADQR42AiAgA0EfNgIcIANBIDYCGCADQSE2AhQgA0EiNgIQIANBIzYCDCADQQtqIAAgA0EMaiAEQQJ0aigCABEBAAsgAisDACEFIABBAzoAGCAAIAU5AwALIANBMGokAAtOAQJ/AkAgACgCGCIBRQ0AIAEgASgCBCICQQFrNgIEIAINACABIAEoAgAoAggRAAAgARAlCyAAKAIIIgEEQCAAIAE2AgwgARAiCyAAECILSgECfwJAIAAoAhgiAUUNACABIAEoAgQiAkEBazYCBCACDQAgASABKAIAKAIIEQAAIAEQJQsgACgCCCIBBEAgACABNgIMIAEQIgsLswEBBH8gAUHI3AI2AgAgAC0ABCECIAFBADYCECABQQhqIgNCADcCACABIAI6AAQCQCAAKAIMIgIgACgCCCIERwRAIAIgBGsiAkEASA0BIAEgAhAjIgM2AgwgASADNgIIIAEgAiADaiIFNgIQIAMgBCACEC8aIAEgBTYCDAsgASAAKAIUNgIUIAEgACgCGCICNgIYIAIEQCACIAIoAgRBAWo2AgQLIAEgACgCHDYCHA8LECwAC7IBAQV/QSAQIyICQcjcAjYCACAALQAEIQEgAkEANgIQIAJBCGoiA0IANwIAIAIgAToABAJAIAAoAgwiASAAKAIIIgRHBEAgASAEayIBQQBIDQEgAiABECMiAzYCCCACIAEgA2oiBTYCECADIAQgARAvGiACIAU2AgwLIAIgACgCFDYCFCACIAAoAhgiATYCGCABBEAgASABKAIEQQFqNgIECyACIAAoAhw2AhwgAg8LECwAC1cBAn8gAEHI3AI2AgACQCAAKAIYIgFFDQAgASABKAIEIgJBAWs2AgQgAg0AIAEgASgCACgCCBEAACABECULIAAoAggiAQRAIAAgATYCDCABECILIAAQIgtVAQJ/IABByNwCNgIAAkAgACgCGCIBRQ0AIAEgASgCBCICQQFrNgIEIAINACABIAEoAgAoAggRAAAgARAlCyAAKAIIIgEEQCAAIAE2AgwgARAiCyAAC80CAQJ/IAAoAgAhAyMAQUBqIgAkAAJAIAMtABgiBEEERgRAIAEgAkYNASACLQALIgTAIQMgASwAC0EATgRAIANBAE4EQCABIAIpAgA3AgAgASACKAIINgIIDAMLIAEgAigCACACKAIEEIYBDAILIAEgAigCACACIANBAEgiARsgAigCBCAEIAEbEIcBDAELAkAgAiwAC0EATgRAIAAgAigCCDYCECAAIAIpAgA3AwgMAQsgAEEIaiACKAIAIAIoAgQQMSADLQAYIQQLIARB/wFHBEAgAEEbNgI8IABBHDYCOCAAQR02AjQgAEEeNgIwIABBHzYCLCAAQSA2AiggAEEhNgIkIABBIjYCICAAQSM2AhwgAEEbaiADIABBHGogBEECdGooAgARAQALIAMgACkDCDcCACADIAAoAhA2AgggA0EEOgAYCyAAQUBrJAAL3AEBB34CQCABKAIQIgBFDQAgASgCFCkDACEEIAEoAggoAgAhASAArSIDQgODIQUgAEEETwRAIANC/P///w+DIQgDQCABIAKnQQN0aiACIAR8uTkDACABIAJCAYQiA6dBA3RqIAMgBHy5OQMAIAEgAkIChCIDp0EDdGogAyAEfLk5AwAgASACQgOEIgOnQQN0aiADIAR8uTkDACACQgR8IQIgB0IEfCIHIAhSDQALCyAFUA0AA0AgASACp0EDdGogAiAEfLk5AwAgAkIBfCECIAZCAXwiBiAFUg0ACwsL1QEBBX8jAEEwayIBJAAgAEHMIDYCACAAKAIQIgIEQANAIAIoAgAhBSACLQAwIgRB/wFHBEAgAUEbNgIsIAFBHDYCKCABQR02AiQgAUEeNgIgIAFBHzYCHCABQSA2AhggAUEhNgIUIAFBIjYCECABQSM2AgwgAUELaiACQRhqIAFBDGogBEECdGooAgARAQALIAJB/wE6ADAgAiwAE0EASARAIAIoAggQIgsgAhAiIAUiAg0ACwsgACgCCCECIABBADYCCCACBEAgAhAiCyABQTBqJAAgAAsPACAAQeTYAjYCACAAECILDQAgAEHk2AI2AgAgAAsGAEHU2gILFAAgAEEEakEAIAEoAgRBoNoCRhsLdgEBfCADKwMAIQUgBCgCACEDIAIoAgAhAkHAABAjIgFB5NgCNgIAIAFCADcCBCABQdzZAjYCECABQgA3AxggASACNgIUIAFCADcDICABIAM2AjggASAFOQMwIAFBgICA/AM2AiggACABNgIEIAAgAUEQajYCAAsLACABQaDXAjYCAAuDEAELfyMAQRBrIgkkAAJAIAAoAgAiAC0AGEEFRgRAIAEgAkYNASACKAIAIQMgAkEEaiELQQAhACMAQRBrIgokAAJAIAEiBigCCEUNACABKAIAIQEgBiAGQQRqNgIAIAYoAgRBADYCCCAGQgA3AgQgASgCBCICIAEgAhsiAkUEQCAGIAIQNQwBCwJAIAIoAggiBUUNACACIAUoAgAiAUYEQCAFQQA2AgAgBSIAKAIEIgFFDQEDQCABIgAoAgAiAQ0AIAAoAgQi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NgIgIANBHzYCHCADQSA2AhggA0EhNgIUIANBIjYCECADQSM2AgwgA0EIaiAAIANBDGogB0ECdGooAgARAQAgAEH/AToAGAwBCyADIAA2AgggA0E4NgIsIANBOTYCKCADQTo2AiQgA0E7NgIgIANBPDYCHCADQT02AhggA0E+NgIUIANBPzYCECADQcAANgIMIANBCGogACAEIANBDGogAkECdGooAgARAwALIABBIGohACAEQSBqIgQgBUcNAAsgASgCBCEACyAAIQQgBSAGRwRAA0AgBEH/AToAGCAEQQA6AAAgBS0AGCICQf8BRwRAIANBLTYCLCADQS42AiggA0EvNgIkIANBMDYCICADQTE2AhwgA0EyNgIYIANBMzYCFCADQTQ2AhAgA0E1NgIMIANBCGogBCAFIANBDGogAkECdGooAgARAwAgBCAFLQAYOgAYCyAEQSBqIQQgBUEgaiIFIAZHDQALCyABIAAgBCAAa2o2AgQMAgsgAARAIAEoAgQiBSAAIgJHBEADQCAFQSBrIgUtABgiAkH/AUcEQCADQRs2AiwgA0EcNgIoIANBHTYCJCADQR42AiAgA0EfNgIcIANBIDYCGCADQSE2AhQgA0EiNgIQIANBIzYCDCADQQhqIAUgA0EMaiACQQJ0aigCABEBAAsgBUH/AToAGCAAIAVHDQALIAEoAgAhAgsgASAANgIEIAIQIiABQQA2AgggAUIANwIAQQAhBQsCQCAHQYCAgMAATw0AQf///z8gBUEEdSIAIAcgACAHSxsgBUHg////B08bIgBBgICAwABPDQAgASAAQQV0IgIQIyIANgIEIAEgADYCACABIAAgAmo2AgggBCAGRwRAA0AgAEH/AToAGCAAQQA6AAAgBC0AGCICQf8BRwRAIANBLTYCLCADQS42AiggA0EvNgIkIANBMDYCICADQTE2AhwgA0EyNgIYIANBMzYCFCADQTQ2AhAgA0E1NgIMIANBCGogACAEIANBDGogAkECdGooAgARAwAgACAELQAYOgAYCyAAQSBqIQAgBEEgaiIEIAZHDQALCyABIAA2AgQMAgsQLAALIAQgBkcEQANAIAQtABghAgJAAkAgAC0AGCIFQf8BRgRAIAJB/wFGDQIMAQsgAkH/AUcNACADQRs2AiwgA0EcNgIoIANBHTYCJCADQR42AiAgA0Ef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axA/DAELIAUgBk8NACAAIAcgBUEDdGo2AjQLIAVBAWu3IQkgBCgCACEGQQAhBANAIAYgBEEDdGogBLggCaMiCEQYLURU+yEpQKIQN0S9GMqJdhXCP6IgCEQYLURU+yEZQKIQN0SOrz2zJEDfv6JE9ihcj8L11j+goCAIRNIhM3982TJAohA3RLJjIxCv64e/oqA5AwAgBEEBaiIEIAVHDQALIAEoAgQhBSABLQALIgQhBgsCQCAFIAQgBsAiBEEASBtBBEcNACABKAIAIAEgBEEASBsoAABB7sK1qwZHDQBBBSEEIAItABhBBEcNAQsgA0EMaiAAQQhqIAEgASACEDNBACEEIAMtABANACADKAIMIgVBGGohACACLQAYIQECQCAFLQAwIgZB/wFGBEAgAUH/AUYNAgwBCyABQf8BRw0AIANBGzYCLCADQRw2AiggA0EdNgIkIANBHjYCICADQR82AhwgA0EgNgIYIANBITYCFCADQSI2AhAgA0EjNgIMIANBCGogACADQQxqIAZBAnRqKAIAEQEAIAVB/wE6ADAMAQsgAyAANgIIIANBODYCLCADQTk2AiggA0E6NgIkIANBOzYCICADQTw2AhwgA0E9NgIYIANBPjYCFCADQT82AhAgA0HAADYCDCADQQhqIAAgAiADQQxqIAFBAnRqKAIAEQMACyADQTBqJAAgBAsJACAAEKABECILDwAgAEHs0QI2AgAgABAiCw0AIABB7NECNgIAIAALBgBBzNMCCxQAIABBBGpBACABKAIEQZjTAkYbC68EAQV/AkAgACgCACEDIwBBQGoiACQAAkACQCADLQAYIgVBB0YEQCABIAJGDQEgAigCACEDIAIoAgQhBQJAAkAgBSADa0ECdSIEIAEoAggiBiABKAIAIgJrQQJ1TQRAIAQgASgCBCIHIAJrIgZBAnVLBEAgAiAHRwRAIAIgAyAGEDIgASgCBCECCyAFIAMgBmoiA2shBAwCCyAFIANrIQQMAQsgAgRAIAEgAjYCBCACECIgAUEANgIIIAFCADcCAEEAIQYLAkAgBEGAgICABE8NAEH/////AyAGQQF1IgIgBCACIARLGyAGQfz///8HTxsiAkGAgICABE8NACABIAJBAnQiBBAjIgI2AgQgASACNgIAIAEgAiAEajYCCCAFIANrIQQgAyAFRwRAIAIgAyAE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GAsjAEEQayIFJAACQCABIARBCGoiA0YNACABKAIQIQIgAyADKAIQIgBGBEAgASACRgRAIAMgBSADKAIAKAIMEQEAIAMoAhAiACAAKAIAKAIQEQAAIANBADYCECABKAIQIgAgAyAAKAIAKAIMEQEAIAEoAhAiACAAKAIAKAIQEQAAIAFBADYCECADIAM2AhAgBSABIAUoAgAoAgwRAQAgBSAFKAIAKAIQEQAAIAEgATYCEAwCCyADIAEgAygCACgCDBEBACADKAIQIgAgACgCACgCEBEAACADIAEoAhA2AhAgASABNgIQDAELIAEgAkYEQCABIAMgASgCACgCDBEBACABKAIQIgAgACgCACgCEBEAACABIAMoAhA2AhAgAyADNgIQDAELIAMgAjYCECABIAA2AhALIAVBEGokAAJAIAMgBCgCGCICRgRAQQQhACADIQIMAQtBBSEAIAJFDQILIAIgAigCACAAQQJ0aigCABEAAAwBCyAEIAI2AgwgBCAANgIIIwBBQGoiASQAIAQoAgghAwJAIAQoAgwiAigCECIARQRAIAFBADYCEAwBCyAAIAJGBEAgASABNgIQIAIgASACKAIAKAIMEQEADAELIAEgACAAKAIAKAIIEQIANgIQCyADLQAYIgBB/wFHBEAgAUEbNgI8IAFBHDYCOCABQR02AjQgAUEeNgIwIAFBHzYCLCABQSA2AiggAUEhNgIkIAFBIjYCICABQSM2AhwgAUEbaiADIAFBHGogAEECdGooAgARAQALIANB/wE6ABgCQCABKAIQIgBFBEAgA0EIOgAYIANBADYCEAwBCwJAAkAgACABRgRAIAMgAzYCECABIAMgASgCACgCDBEBACABKAIQIQAgA0EIOgAYIAAgAUcNAUEEIQIgASEADAILIANBCDoAGCADIAA2AhAMAgtBBSECIABFDQELIAAgACgCACACQQJ0aigCABEAAAsgAUFAayQACyAEQSBqJAALDQAgAEGozQI2AgAgAAsGAEGY0AILFAAgAEEEakEAIAEoAgRB6M8CRhsLpwICAXwBfyADKwMAIQUgBCgCACEDIAIoAgAhAkH4ABAjIgFBqM0CNgIAIAFCADcCBCABQaDOAjYCECABQgA3AxggASACNgIUIAFCADcDICABIAM2AjggASAFOQMwIAFBgICA/AM2AiggAUFAa0IA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IAoNAUEAIQIMAgsCfyAAKAI0IgEgACgCMCICSwRAIAEgAmsMAQsgACgCRCAAKAIsIAEgAmtqcQsEQCAAKAI4IAJBA3RqIgEpAgAhFSABQgA3AgAgACgCTCEBIAAgFTcDSAJAIAFFDQAgASABKAIEIgRBAWs2AgQgBA0AIAEgASgCACgCCBEAACABECULIAAgACgCRCACQQFqcTYCMAsgACgCSCECAkAgACgCTCIBBEAgASABKAIEQQJqNgIEIANCADcAGCADQgA3ABAgA0IANwAIIAEgASgCBCIEQQFrNgIEIARFBEAgASABKAIAKAIIEQAAIAEQJQsgASABKAIEQQFqNgIEDAELIANCADcACCADQgA3ABggA0IANwAQCyAAIAI2AlggACgCXCECIAAgATYCXAJAIAJFDQAgAiACKAIEIgRBAWs2AgQgBA0AIAIgAigCACgCCBEAACACECULIABBADoAiAEgACAQOQOAASAAIA85A3ggACAUNwNwIABCADcDaCAAQgA3A2AgACADKQAYNwCgASAAIAMpABE3AJkBIAAgAykACTcAkQEgACADKQABNwCJAQJAIAFFDQAgASABKAIEIgJBAWs2AgQgAg0AIAEgASgCACgCCBEAACABECULIAAoAkghAiAAKAJMIgFFDQMgASABKAIEQQJqNgIEIANCADcAGCADQgA3ABAgA0IANwAIIAEgASgCBCIEQQFrNgIEIARFBEAgASABKAIAKAIIEQAAIAEQJQsgASABKAIEQQFqNgIEDAQLIAAoAvwBIgRBAkYhByAAKAKEArghEiAAKAKAArghEEEAIQFBACECA0AgACsDUCERIAAgDSgCACABQQN0aisDACITOQNQIBMgEaEiEUQAAAAAAAAAAGQiCQRAIAggBiAFIAIgASACayIMIA8QVCALIAYgBSACIAwgDxBUIAggACgC+AFBAXFB0ABsaiICQRBqQgA3AwAgAiACQQhqQSBBGCACKwMIIAIrAxBkG2opAwA3AxggACAAKAL4AUEBaiICNgL4ASAIIAJBAXFB0ABsaiICQRBqQoCAgICAgID4PzcDACACIBA5A0AgAiASOQM4IAIgEDkDSCACIAc6ADAgAiACQQhqQSBBGCACKwMIIAIrAxBkG2opAwA3AxggASECCwJAIARFDQBEAAAAAAAA8D9EAAAAAAAA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ABEDAAtBAAshCCAEQTBqJAAgCAsJACAAEKgBECILDwAgAEGMogI2AgAgABAiCw0AIABBjKICNgIAIAALBgBBgKQCCxQAIABBBGpBACABKAIEQcSjAkYbCxAAQQgQIyIAQcwcNgIAIAALOQEBfyABIAAoAgQiBEEBdWohASAAKAIAIQAgASACIAMgBEEBcQR/IAEoAgAgAGooAgAFIAALEREAC9sDAgF+AXwgAysDACEGIAQoAgAhAyACKAIAIQJBoAIQIyIBQYyiAjYCACABQgA3AgQgAUGAowI2AhAgAUIANwMYIAEgAjYCFCABQgA3AyAgASADNgI4IAEgBjkDMCABQYCAgPwDNgIoIAFBQGtCADcDACABQSA2AjwgAUHIAGoiAkIANwMAIAFCgICAgPADNwNQIAIQOiABQgA3A3ggAUIANwNwIAFBkAFqIgJCADcDACABQgA3A4ABIAFCADcDaCABQgA3A2AgAUIANwNYIAFBiAFqIgNCzouYle+Jzrs/NwMAIAIgAyABKwNwIAErA3hkGyIDKQMAIQUgAkLOi5iV74nOu79/NwMAIAEgBTcDgAEgAykDACEFIAFBADoAmAEgASAFNwOAASABQaABakHIABAmGiABQdgBaiICQs6LmJXvic67PzcDACABQeABaiACIAErA8ABIAErA8gBZBsiAikDACEFIAFCzouYle+Jzru/fzcD4AEgASAFNwPQASABQgA3A/ABIAFBADoA6AEgAUIANwP4ASABQgA3A4ACIAFCADcDiAIgAUIANwOQAiABIAIpAwA3A9ABIAFCgICAgICAgPg/NwOYAiAAIAE2AgQgACABQRBqNgIACwsAIAFBwKACNgIACxEAQQgQIyIAQcCgAjYCACAAC8MYARJ/IwBBoAJrIgIkAAJ/IAAoAiwiAygCCCIFIAMoAgQiBEsEQCAFIARrDAELIAMoAhggAygCACAFIARranELIQ8gAEHIAWohBwJAAkACQAJAIAAoAiwiA0UNACAPQQBMDQAgAEEwaiERA0AgACgCtAEiBCAAKAKwASIFRwRAIAUgBCAFaxAmGgsgAyARIAAoArwBIgUgAygCECADKAIMa0EMbSIDIAMgBUsbIg4gACgCwAEiAyAPIAMgD0gbIgsQXUUNAiACQQc6AJACIAJBADYCgAIgAkIANwP4AQJAIAAoAswB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DZO7oiANu6A5AwAgAEEBaiIAIANHDQALDAELIANFDQAgByADQQN0ECYaCyAEQRBqJAALCQAgABCtARAiCw8AIABB8JoCNgIAIAAQIgsNACAAQfCaAjYCACAACwYAQdicAgsUACAAQQRqQQAgASgCBEGgnAJGGwt1AQR/IAAoAiAiAwRAIAAoAiQiAiADIgFHBEADQCACQTBrEF4iAiADRw0ACyAAKAIgIQELIAAgAzYCJCABECILIAAoAhQiAgRAA0AgAigCACEEIAIQIiAEIgINAAsLIAAoAgwhASAAQQA2AgwgAQRAIAEQIgsLqwEBAXwgAysDACEFIAQoAgAhAyACKAIAIQJB4AAQIyIBQfCaAjYCACABQgA3AgQgAUHgmwI2AhAgAUIANwMYIAEgAjYCFCABQgA3AyAgASADNgI4IAEgBTkDMCABQYCAgPwDNgIoIAFBQGtCADcDACABQSA2AjwgAUHIAGoiAkIANwMAIAFCgICAgPADNwNQIAIQOiABQgA3AlggACABNgIEIAAgAUEQajYCAAsLACABQaiZAjYCAAsRAEEIECMiAEGomQI2AgAgAAvMDAQJfwJ8BX0CfiMAQRBrIgQkACABKAIAIQUgBCABKAIIKAIANgIMIAEoAhAhCCABKAIEIQkgACkDiAIiEr8iCyAAKwOQAmIEQCAAQgA3A4gBIAAgEjcDkAIgAEIANwO4ASAAQgA3A6gBIAAgEjcDoAEgAEIANwPAASAAQgA3A/ABIABCADcD4AEgACASNwPYAQsDQAJ/IAAoAmwiASAAKAJoIgJLBEAgASACawwBCyAAKAJ8IAAoAmQgASACa2pxCwRAAn8gACgCbCIBIAAoAmgiA0sEQCABIANrDAELIAAoAnwgACgCZCABIANranELBEAgACgCcCADQQN0aiIBKQIAIRMgAUIANwIAIAAoAoQBIQEgACATNwOAAQJAIAFFDQAgASABKAIEIgJBAWs2AgQgAg0AIAEgASgCACgCCBEAACABECULIAAgACgCfCADQQFqcTYCaAsgAEIANwOoASAAIBI3A6ABIABCADcDiAEgAEIANwPAASAAQgA3A7gBIABCADcD8AEgAEIANwPgASAAIBI3A9gBDAELCwJ/IABBQGsoAgAiASAAKAI8IgJLBEAgASACawwBCyAAKAJQIAAoAjggASACa2px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A4gBIAJCADcDgAEgAkIANwKUASACQYquj+UDNgKQASACQgA3ApwBIAJCADcCpAEgAkIANwKsASACQgA3ArQBIAJCADcCvAEgAkIANwLMASACQoCAgICg4fXRPDcCxAEgAkIANwLUASACQgA3AtwBIAJCADcC5AEgAkIANwLsASACQgA3AvQBIAJCADcDkAIgAkIANwOIAiACQgA3A4ACIAJBmAJqEGohCSACQQA2AugFIAJCADcD4AUgAkKAgICAgICA+D83A9gFIAJCADcD0AUCfyAKRLgehetRuJ4/oiILmUQAAAAAAADgQWMEQCALqgwBC0GAgICAeAshByAJQQECfyAKRLgehetRuL4/oiIKmUQAAAAAAADgQWMEQCAKqgwBC0GAgICAeAsgBxCxAQJAIARBAnQiBCACKALkBSACKALgBSIHa0EDdSIFSwRAIAJB4AVqIAQgBWsQPwwBCyAEIAVPDQAgAiAHIARBA3RqNgLkBQsgA0EQaiQAIAAgATYCBCAAIAI2AgALCwAgAUHAlQI2AgALEQBBCBAjIgBBwJUCNgIAIAALDAAgAEHQGzYCACAAC/MKBAd/BX0CfgJ8IAEoAhAhBSABKAIEIQQgASgCACEIIAEoAggoAgAhByAAKQOIAiIOvyIQIAArA5ACYgRAIABCADcDiAEgACAONwOQAiAAQgA3A7gBIABCADcDqAEgACAONwOgASAAQgA3A8ABIABCADcD8AEgAEIANwPgASAAIA43A9gBCwNAAn8gACgCbCIBIAAoAmgiAksEQCABIAJrDAELIAAoAnwgACgCZCABIAJranELBEACfyAAKAJsIgEgACgCaCIDSwRAIAEgA2sMAQsgACgCfCAAKAJkIAEgA2tqcQsEQCAAKAJwIANBA3RqIgEpAgAhDyABQgA3AgAgACgChAEhASAAIA83A4ABAkAgAUUNACABIAEoAgQiAkEBazYCBCACDQAgASABKAIAKAIIEQAAIAEQJQsgACAAKAJ8IANBAWpxNgJoCyAAQgA3A6gBIAAgDjcDoAEgAEIANwOIASAAQgA3A8ABIABCADcDuAEgAEIANwPwASAAQgA3A+ABIAAgDjcD2AEMAQsLAn8gAEFAaygCACIBIAAoAjwiAksEQCABIAJrDAELIAAoAlAgACgCOCABIAJranELBEADQAJ/IAAoAkAi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AgAgAiACNgIQIAUoAgRBPGoiBCACQRhqIgMQKEUEQCACQShqIAQgAyADIAIQKwsCQAJAIAIgAigCECIDRgRAQQQhBCACIQMMAQtBBSEEIANFDQELIAMgAygCACAEQQJ0aigCABEAAAsgAiwAI0EASARAIAIoAhgQIgsgAkEAOgAcIAJB7N6dkwM2AhhBBCEEIAJBBDoAIyACQfA+NgIAIAIgAjYCECAFKAIEQTxqIgYgAkEYaiIDEChFBEAgAkEoaiAGIAMgAyACECsLAkACQCACIAIoAhAiA0YEQCACIQMMAQtBBSEEIANFDQELIAMgAygCACAEQQJ0aigCABEAAAsgAiwAI0EASARAIAIoAhgQIgsgAkEAOgAcIAJB48ql4wY2AhhBBCEEIAJBBDoAIyACQYzDADYCACACIAI2AhAgBSgCBEE8aiIGIAJBGGoiAxAoRQRAIAJBKGogBiADIAMgAhArCwJAAkAgAiACKAIQIgNGBEAgAiEDDAELQQUhBCADRQ0BCyADIAMoAgAgBEECdGooAgARAAALIAIsACNBAEgEQCACKAIYECILQQQhBCACQQA6AB0gAkGEDS0AADoAHCACQQU6ACMgAkGADSgAADYCGCACQajHADYCACACIAI2AhAgBSgCBEE8aiIGIAJBGGoiAxAoRQRAIAJBKGogBiADIAMgAhArCwJAAkAgAiACKAIQIgNGBEAgAiEDDAELQQUhBCADRQ0BCyADIAMoAgAgBEECdGooAgARAAALIAIsACNBAEgEQCACKAIYECILQQQhBCACQQA6AB0gAkGrEi0AADoAHCACQQU6ACMgAkGnEigAADYCGCACQcjLADYCACACIAI2AhAgBSgCBEE8aiIGIAJBGGoiAxAoRQRAIAJBKGogBiADIAMgAhArCwJAAkAgAiACKAIQIgNGBEAgAiEDDAELQQUhBCADRQ0BCyADIAMoAgAgBEECdGooAgARAAALIAIsACNBAEgEQCACKAIYECILIAJBADoAHCACQfPiyaMHNgIYQQQhBCACQQQ6ACMgAkHozwA2AgAgAiACNgIQIAUoAgRBPGoiBiACQRhqIgMQKEUEQCACQShqIAYgAyADIAIQKwsCQAJAIAIgAigCECIDRgRAIAIhAwwBC0EFIQQgA0UNAQsgAyADKAIAIARBAnRqKAIAEQAACyACLAAj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KAIEQTxqIgYgAkEYaiIDEChFBEAgAkEoaiAGIAMgAyACECsLAkACQCACIAIoAhAiA0YEQCACIQMMAQtBBSEEIANFDQELIAMgAygCACAEQQJ0aigCABEAAAsgAiwAI0EASARAIAIoAhgQIgsgAkH6ADsBGCACQQE6ACMgAkG03gE2AgAgAiACNgIQIAUoAgRBPGoiBCACQRhqIgMQKEUEQCACQShqIAQgAyADIAIQKwsCQAJAIAIgAigCECIDRgRAQQQhBCACIQMMAQtBBSEEIANFDQELIAMgAygCACAEQQJ0aigCABEAAAsgAiwAI0EASARAIAIoAhgQIgsgAkEAOgAcIAJB8N6xqwY2AhhBBCEEIAJBBDoAIyACQaziATYCACACIAI2AhAgBSgCBEE8aiIGIAJBGGoiAxAoRQRAIAJBKGogBiADIAMgAhArCwJAAkAgAiACKAIQIgNGBEAgAiEDDAELQQUhBCADRQ0BCyADIAMoAgAgBEECdGooAgARAAALIAIsACNBAEgEQCACKAIYECILIAJBAzoAIyACQQA6ABsgAkHFCS8AADsBGCACQccJLQAAOgAaIAJB+OUBNgIAIAIgAjYCECAFKAIEQTxqIgQgAkEYaiIDEChFBEAgAkEoaiAEIAMgAyACECsLAkACQCACIAIoAhAiA0YEQEEEIQQgAiEDDAELQQUhBCADRQ0BCyADIAMoAgAgBEECdGooAgARAAALIAIsACNBAEgEQCACKAIYECILQQQhBCACQQA6AB4gAkHiEy8AADsBHCACQQY6ACMgAkHeEygAADYCGCACQcjpATYCACACIAI2AhAgBSgCBEE8aiIGIAJBGGoiAxAoRQRAIAJBKGogBiADIAMgAhArCwJAAkAgAiACKAIQIgNGBEAgAiEDDAELQQUhBCADRQ0BCyADIAMoAgAgBEECdGooAgARAAALIAIsACNBAEgEQCACKAIYECILIAJBBzoAIyACQQA6AB8gAkHLDSgAADYCGCACQc4NKAAANgAbIAJBqO0BNgIAIAIgAjYCECAFKAIEQTxqIgQgAkEYaiIDEChFBEAgAkEoaiAEIAMgAyACECsLAkACQCACIAIoAhAiA0YEQEEEIQQgAiEDDAELQQUhBCADRQ0BCyADIAMoAgAgBEECdGooAgARAAALIAIsACNBAEgEQCACKAIYECILIAJBADoAHCACQe3axYEHNgIYQQQhBCACQQQ6ACMgAkGQ8QE2AgAgAiACNgIQIAUoAgRBPGoiBiACQRhqIgMQKEUEQCACQShqIAYgAyADIAIQKwsCQAJAIAIgAigCECIDRgRAIAIhAwwBC0EFIQQgA0UNAQsgAyADKAIAIARBAnRqKAIAEQAACyACLAAjQQBIBEAgAigCGBAiCyACQQM6ACMgAkEAOgAbIAJBuRAvAAA7ARggAkG7EC0AADoAGiACQdz0ATYCACACIAI2AhAgBSgCBEE8aiIEIAJBGGoiAxAoRQRAIAJBKGogBCADIAMgAhArCwJAAkAgAiACKAIQIgNGBEBBBCEEIAIhAwwBC0EFIQQgA0UNAQsgAyADKAIAIARBAnRqKAIAEQAACyACLAAjQQBIBEAgAigCGBAiCyACQQA6ACAgAkLz7Jmbh62ZtuYANwMYIAJBCDoAIyACQdj4ATYCACACIAI2AhAgBSgCBEE8aiIEIAJBGGoiAxAoRQRAIAJBKGogBCADIAMgAhArCwJAAkAgAiACKAIQIgNGBEBBBCEEIAIhAwwBC0EFIQQgA0UNAQsgAyADKAIAIARBAnRqKAIAEQAACyACLAAjQQBIBEAgAigCGBAiC0EEIQQgAkEAOgAdIAJBqw4tAAA6ABwgAkEFOgAjIAJBpw4oAAA2AhggAkHo/AE2AgAgAiACNgIQIAUoAgRBPGoiBiACQRhqIgMQKEUEQCACQShqIAYgAyADIAIQKwsCQAJAIAIgAigCECIDRgRAIAIhAwwBC0EFIQQgA0UNAQsgAyADKAIAIARBAnRqKAIAEQAACyACLAAjQQBIBEAgAigCGBAiC0EEIQQgAkEAOgAeIAJB0QkvAAA7ARwgAkEGOgAjIAJBzQkoAAA2AhggAkGQhgI2AgAgAiACNgIQIAUoAgRBPGoiBiACQRhqIgMQKEUEQCACQShqIAYgAyADIAIQKwsCQAJAIAIgAigCECIDRgRAIAIhAwwBC0EFIQQgA0UNAQsgAyADKAIAIARBAnRqKAIAEQAACyACLAAjQQBIBEAgAigCGBAiC0EEIQQgAkEAOgAeIAJBwhEvAAA7ARwgAkEGOgAjIAJBvhEoAAA2AhggAkGQjQI2AgAgAiACNgIQIAUoAgRBPGoiBiACQRhqIgMQKEUEQCACQShqIAYgAyADIAIQKwsCQAJAIAIgAigCECIDRgRAIAIhAwwBC0EFIQQgA0UNAQsgAyADKAIAIARBAnRqKAIAEQAACyACLAAjQQBIBEAgAigCGBAiCyACQQA6ACEgAkG9DS0AADoAICACQQk6ACMgAkG1DSkAADcDGCACQdiRAjYCACACIAI2AhAgBSgCBEE8aiIEIAJBGGoiAxAoRQRAIAJBKGogBCADIAMgAhArCwJAAkAgAiACKAIQIgNGBEBBBCEEIAIhAwwBC0EFIQQgA0UNAQsgAyADKAIAIARBAnRqKAIAEQAACyACLAAjQQBIBEAgAigCGBAiCyACQdUZLwAAOwEgIAJBgBQ7ASIgAkHNGSkAADcDGCACQcCVAjYCACACIAI2AhAgBSgCBEE8aiIEIAJBGGoiAxAoRQRAIAJBKGogBCADIAMgAhArCwJAAkAgAiACKAIQIgNGBEBBBCEEIAIhAwwBC0EFIQQgA0UNAQsgAyADKAIAIARBAnRqKAIAEQAACyACLAAjQQBIBEAgAigCGBAiC0EEIQQgAkEAOgAdIAJB3REtAAA6ABwgAkEFOgAjIAJB2REoAAA2AhggAkGomQI2AgAgAiACNgIQIAUoAgRBPGoiBiACQRhqIgMQKEUEQCACQShqIAYgAyADIAIQKwsCQAJAIAIgAigCECIDRgRAIAIhAwwBC0EFIQQgA0UNAQsgAyADKAIAIARBAnRqKAIAEQAACyACLAAjQQBIBEAgAigCGBAiCyACQfUQLwAAOwEgIAJBgBQ7ASIgAkHtECkAADcDGCACQeicAjYCACACIAI2AhAgBSgCBEE8aiIEIAJBGGoiAxAoRQRAIAJBKGogBCADIAMgAhArCwJAAkAgAiACKAIQIgNGBEBBBCEEIAIhAwwBC0EFIQQgA0UNAQsgAyADKAIAIARBAnRqKAIAEQAACyACLAAjQQBIBEAgAigCGBAiCyACQQA6ACEgAkHDES0AADoAICACQQk6ACMgAkG7ESkAADcDGCACQcCgAjYCACACIAI2AhAgBSgCBEE8aiIEIAJBGGoiAxAoRQRAIAJBKGogBCADIAMgAhArCwJAAkAgAiACKAIQIgNGBEBBBCEEIAIhAwwBC0EFIQQgA0UNAQsgAyADKAIAIARBAnRqKAIAEQAACyACLAAjQQBIBEAgAigCGBAiCyACQRAQIyIDNgIYIAJCjICAgICCgICAfzcCHCADQboNKAAANgAIIANBsg0pAAA3AAAgA0EAOgAMIAJBkKQCNgIAIAIgAjYCECAFKAIEQTxqIgQgAkEYaiIDEChFBEAgAkEoaiAEIAMgAyACECsLAkACQCACIAIoAhAiA0YEQEEEIQQgAiEDDAELQQUhBCADRQ0BCyADIAMoAgAgBEECdGooAgARAAALIAIsACNBAEgEQCACKAIYECILIAJBEBAjIgM2AhggAkKNgICAgIKAgIB/NwIcIANBzxkpAAA3AAUgA0HKGSkAADcAACADQQA6AA0gAkGMqAI2AgAgAiACNgIQIAUoAgRBPGoiBCACQRhqIgMQKEUEQCACQShqIAQgAyADIAIQKwsCQAJAIAIgAigCECIDRgRAQQQhBCACIQMMAQtBBSEEIANFDQELIAMgAygCACAEQQJ0aigCABEAAAsgAiwAI0EASARAIAIoAhgQIgsgAkEAOgAgIAJC7ca5oZfMmLblADcDGCACQQg6ACMgAkGIrAI2AgAgAiACNgIQIAUoAgRBPGoiBCACQRhqIgMQKEUEQCACQShqIAQgAyADIAIQKwsCQAJAIAIgAigCECIDRgRAQQQhBCACIQMMAQtBBSEEIANFDQELIAMgAygCACAEQQJ0aigCABEAAAsgAiwAI0EASARAIAIoAhgQIgsgAkEHOgAjIAJBADoAHyACQb0JKAAANgIYIAJBwAkoAAA2ABsgAkHkrwI2AgAgAiACNgIQIAUoAgRBPGoiBCACQRhqIgMQKEUEQCACQShqIAQgAyADIAIQKwsCQAJAIAIgAigCECIDRgRAQQQhBCACIQMMAQtBBSEEIANFDQELIAMgAygCACAEQQJ0aigCABEAAAsgAiwAI0EASARAIAIoAhgQIgsgAkGAES8AADsBICACQYAUOwEiIAJB+BApAAA3AxggAkGwtAI2AgAgAiACNgIQIAUoAgRBPGoiBCACQRhqIgMQKEUEQCACQShqIAQgAyADIAIQKwsCQAJAIAIgAigCECIDRgRAQQQhBCACIQMMAQtBBSEEIANFDQELIAMgAygCACAEQQJ0aigCABEAAAsgAiwAI0EASARAIAIoAhgQIgsgAkEQECMiAzYCGCACQoyAgICAgoCAgH83AhwgA0HNESgAADYACCADQcURKQAANwAAIANBADoADCACQfy4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hq7YufMAUg0BQQILNgIsCyAEQQBODQAgAygCCBAiCyADQQhqIABBCGogASABIAIQMwJAIAMtAAwNACADKAIIIgRBGGohACACLQAYIQECQCAELQAwIgVB/wFGBEAgAUH/AUYNAgwBCyABQf8BRw0AIANBGzYCKCADQRw2AiQgA0EdNgIgIANBHjYCHCADQR82AhggA0EgNgIUIANBITYCECADQSI2AgwgA0EjNgIIIANBBGogACADQQhqIAVBAnRqKAIAEQEAIARB/wE6ADAMAQsgAyAANgIEIANBODYCKCADQTk2AiQgA0E6NgIgIANBOzYCHCADQTw2AhggA0E9NgIUIANBPjYCECADQT82AgwgA0HAADYCCCADQQRqIAAgAiADQQhqIAFBAnRqKAIAEQMAC0EACyEGIANBMGokACAGCw8AIABB3PIBNgIAIAAQIgsNACAAQdzyATYCACAACwYAQcz0AQsUACAAQQRqQQAgASgCBEGQ9AFGGwuHAQEBfCADKwMAIQUgBCgCACEDIAIoAgAhAkHIABAjIgFB3PIBNgIAIAFCADcCBCABQdDzATYCECABQgA3AxggASACNgIUIAFCADcDICABIAM2AjggASAFOQMwIAFBgICA/AM2AiggAUFAa0IANwMAIAFBADYCPCAAIAE2AgQgACABQRBqNgIACwsAIAFBkPEBNgIACxEAQQgQIyIAQZDxATYCACAAC4ACAQN/IwBBMGsiACQAIAFBADYCCCABQgA3AwACQCACKAIEIgUgAigCACIDRwRAIAUgA2siBEEASA0BIAEgBBAjIgI2AgQgASACNgIAIAEgAiAEajYCCANAIAJB/wE6ABggAkEAOgAAIAMtABgiBEH/AUcEQCAAQS02AiwgAEEuNgIoIABBLzYCJCAAQTA2AiAgAEExNgIcIABBMjYCGCAAQTM2AhQgAEE0NgIQIABBNTYCDCAAQQtqIAIgAyAAQQxqIARBAnRqKAIAEQMAIAIgAy0AGDoAGAsgAkEgaiECIANBIGoiAyAFRw0ACyABIAI2AgQLIABBMGokAA8LECwAC5QBAgN/AXwgASgCECECIAEoAggoAgAhAwJAIAEoAgRFBEAgAkUNASADIAJBA3QQJhoPCyACRQ0ARAAAAAAAAPA/IAArAyCjIQUgASgCACgCACEAQQAhAQNAIAMgAUEDdCIEaiAFIAAgBGorAwBEGC1EVPshGUCiokQAAAAAAADgP6IQYzkDACABQQFqIgEgAkcNAAsLCw8AIABB/O4BNgIAIAAQIgsNACAAQfzuATYCACAACwYAQYDxAQsUACAAQQRqQQAgASgCBEHA8AFGGwt2AQF8IAMrAwAhBSAEKAIAIQMgAigCACECQcAAECMiAUH87gE2AgAgAUIANwIEIAFB+O8BNgIQIAFCADcDGCABIAI2AhQgAUIANwMgIAEgAzYCOCABIAU5AzAgAUGAgID8AzYCKCAAIAE2AgQgACABQRBqNgIACwsAIAFBqO0BNgIACxEAQQgQIyIAQajtATYCACAAC+sBAgl/BXwgASgCECECIAEoAggoAgAhBAJAIAEoAgRBBk8EQCACRQ0BIAEoAgAiASgCFCEFIAEoAhAhBiABKAIMIQcgASgCCCEIIAEoAgQhCSABKAIAIQoDQCAHIANBA3QiAWorAwAhDSABIAlqKwMAIQ4gACsDOCEPIAAgASAIaisDACABIAVqKwMAIguiIAEgCmorAwAgC6IgACsDMKAiDCABIAZqKwMAoqE5AzggACAPIA4gC6IgDCANoqGgOQMwIAEgBGogDDkDACADQQFqIgMgAkcNAAsMAQsgAkUNACAEIAJBA3QQJhoLCw8AIABBmOsBNgIAIAAQIgtlAQJ/IAFBADYCCCABQgA3AwACQCACKAIEIgAgAigCACIDRwRAIAAgA2siAEEASA0BIAEgABAjIgI2AgQgASACNgIAIAEgACACaiIENgIIIAIgAyAAEC8aIAEgBDYCBAsPCxAsAAsNACAAQZjrATYCACAACwYAQZjtAQsUACAAQQRqQQAgASgCBEHY7AFGGwuHAQEBfCADKwMAIQUgBCgCACEDIAIoAgAhAkHQABAjIgFBmOsBNgIAIAFCADcCBCABQZDsATYCECABQgA3AxggASACNgIUIAFCADcDICABIAM2AjggASAFOQMwIAFBgICA/AM2AiggAUFAa0IANwMAIAFCADcDSCAAIAE2AgQgACABQRBqNgIACwsAIAFByOkBNgIACxEAQQgQIyIAQcjpATYCACAAC5wBAgV/AnwgASgCECECIAEoAggoAgAhAwJAIAEoAgRBA08EQCACRQ0BIAEoAgAiBSgCCCEGQQAhAQNAIAAgBSAGIAFBA3QiBGorAwCZIgcgACsDMCIIZEVBAnRqKAIAIARqKwMAIAggB6GiIAegIgc5AzAgAyAEaiAHOQMAIAFBAWoiASACRw0ACwwBCyACRQ0AIAMgAkEDdBAmGgsLDwAgAEHE5wE2AgAgABAiCw0AIABBxOcBNgIAIAALBgBBuOkBC0sAIAIoAhAiAEUEQCABQQA2AhAPCyAAIAJGBEAgASABNgIQIAIoAhAiACABIAAoAgAoAgwRAQAPCyABIAAgACgCACgCCBECADYCEAsUACAAQQRqQQAgASgCBEH86AFGGwuAAQEBfCADKwMAIQUgBCgCACEDIAIoAgAhAkHIABAjIgFBxOcBNgIAIAFCADcCBCABQbjoATYCECABQgA3AxggASACNgIUIAFCADcDICABIAM2AjggASAFOQMwIAFBgICA/AM2AiggAUFAa0IANwMAIAAgATYCBCAAIAFBEGo2AgALCwAgAUH45QE2AgALEQBBCBAjIgBB+OUBNgIAIAALhQICB38BfCABKAIQIQIgASgCCCgCACEEAkAgASgCBEECTwRAIAJFDQEgASgCACIBKAIEIQUgASgCACEGQQAhASACQQFHBEAgAkF+cSEIA0AgACAGIAFBA3QiA2orAwAgACsDMKIgAyAFaisDAKAiCTkDMCADIARqIAk5AwAgACAGIANBCHIiA2orAwAgACsDMKIgAyAFaisDAKAiCTkDMCADIARqIAk5AwAgAUECaiEBIAdBAmoiByAIRw0ACwsgAkEBcUUNASAAIAYgAUEDdCIBaisDACAAKwMwoiABIAVqKwMAoCIJOQMwIAEgBGogCTkDAA8LIAJFDQAgBCACQQN0ECYaCwsPACAAQfjjATYCACAAECILDQAgAEH44wE2AgAgAAsGAEHo5QELFAAgAEEEakEAIAEoAgRBrOUBRhsLgAEBAXwgAysDACEFIAQoAgAhAyACKAIAIQJByAAQIyIBQfjjATYCACABQgA3AgQgAUHs5AE2AhAgAUIANwMYIAEgAjYCFCABQgA3AyAgASADNgI4IAEgBTkDMCABQYCAgPwDNgIoIAFBQGtCADcDACAAIAE2AgQgACABQRBqNgIACwsAIAFBrOIBNgIACxEAQQgQIyIAQaziATYCACAAC8ICAgh/AnwgASgCECECIAEoAggoAgAhAwJAAkACQCABKAIEBEAgAkUN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fnEhBkEAIQFBACEDA0AgBCABQQN0aiIHIAJB/YcNbEHDvZoBaiICQRB2Qf//AXG3RAAAAADA/99AozkDACAHIAJB/YcNbEHDvZoBaiICQRB2Qf//AXG3RAAAAADA/99AozkDCCABQQJqIQEgA0ECaiIDIAZHDQALCyAIBEAgBCABQQN0aiACQf2HDWxBw72aAWoiAkEQdkH//wFxt0QAAAAAwP/fQKM5AwALIAAgAjYCLAsLpgMCBH8BfCMAQTBrIgMkAAJ/AkAgASgCBCABLQALIgQgBMAiBEEASBtBBEcNACABKAIAIAEgBEEASBsoAABB88qVowZHDQBBBSACLQAYQQNHDQEaIAACfyACKwMAIgdEAAAAAAAA8EFjIAdEAAAAAAAAAABmcQRAIAerDAELQQALNgIsCyADQQxqIABBCGogASABIAIQMwJAIAMtABANACADKAIMIgRBGGohACACLQAYIQECQCAELQAwIgVB/wFGBEAgAUH/AUYNAgwBCyABQf8BRw0AIANBGzYCLCADQRw2AiggA0EdNgIkIANBHjYCICADQR82AhwgA0EgNgIYIANBITYCFCADQSI2AhAgA0EjNgIMIANBCGogACADQQxqIAVBAnRqKAIAEQEAIARB/wE6ADAMAQsgAyAANgIIIANBODYCLCADQTk2AiggA0E6NgIkIANBOzYCICADQTw2AhwgA0E9NgIYIANBPjYCFCADQT82AhAgA0HAADYCDCADQQhqIAAgAiADQQxqIAFBAnRqKAIAEQMAC0EACyEGIANBMGokACAGCw8AIABB0NQBNgIAIAAQIgsNACAAQdDUATYCACAACwYAQeDWAQsUACAAQQRqQQAgASgCBEGc1gFGGwuhAQIBfAF+IAMrAwAhBSAEKAIAIQMgAigCACECQcAAECMiAUHQ1AE2AgAgAUIANwIEIAFB0NUBNgIQIAFCADcDGCABIAI2AhQgAUIANwMgIAEgAzYCOCABIAU5AzAgAUGAgID8AzYCKEHw/wNB8P8DKQMAQq3+1eTUhf2o2AB+QgF8IgY3AwAgASAGQiGIPgI8IAAgATYCBCAAIAFBEGo2AgALCwAgAUH40gE2AgALJAAgASACKQMANwMAIAEgAigCCDYCCCACQgA3AwAgAkEANgIICxEAQQgQIyIAQfjSATYCACAAC8sDAgJ8BX8gASgCECEEIAEoAggoAgAhBwJAIAEoAgRFBEAgBEUNASAHIARBA3QQJhoPCyAERQ0AIAEoAgAiCCgCACEFQQAhASAAKQMwQv///////////wCDUARAA0AgACsDQCEDIAAgBSABQQN0IgZqIggrAwAiAjkDQAJ8RAAAAAAAAPA/RAAAAAAAAPC/RAAAAAAAAAAAIAIgA6EiA0QAAAAAAAAAAGMbIANEAAAAAAAAAABkG0QAAAAAAADgv2NFBEAgACsDOAwBCyAAQgA3AzggCCsDACECRAAAAAAAAAAACyEDIAYgB2ogAiADojkDACABQQFqIgEgBEcNAAwCCwALA0AgACsDQCECIAAgBSABQQN0IgZqKwMAIgM5A0BEAAAAAAAA8D9EAAAAAAAA8L9EAAAAAAAAAAAgAyACoSICRAAAAAAAAAAAYxsgAkQAAAAAAAAAAGQiBRshAiAFBEAgAEIANwMwIABCgICAgICAgPg/NwM4CwJ8IAJEAAAAAAAA4L9jRQRAIAArAzgMAQsgAEIANwM4RAAAAAAAAAAACyECIAYgB2ogCCgCACIFIAZqKwMAIAKiOQMAIAFBAWoiASAERw0ACwsLsAMBBH8jAEEwayIDJAACfwJAAkACQAJAIAEoAgQgAS0ACyIEIATAIgRBAEgbQQNHDQAgASgCACABIARBAEgbQbMOQQMQJw0AQQUgAi0AGEECRyIEDQQaIAApAzBC////////////AINCAFINACAEDQEgAEQAAAAAAADwP0QAAAAAAAAAACACLQAAGzkDMAsgA0EMaiAAQQhqIAEgASACEDMgAy0AEA0CIAMoAgwiBEEYaiEAIAItABghASAELQAwIgVB/wFGBEAgAUH/AUYNAwwCCyABQf8BRw0BIANBGzYCLCADQRw2AiggA0EdNgIkIANBHjYCICADQR82AhwgA0EgNgIYIANBITYCFCADQSI2AhAgA0EjNgIMIANBCGogACADQQxqIAVBAnRqKAIAEQEAIARB/wE6ADAMAgsQOwALIAMgADYCCCADQTg2AiwgA0E5NgIoIANBOjYCJCADQTs2AiAgA0E8NgIcIANBPTYCGCADQT42AhQgA0E/NgIQIANBwAA2AgwgA0EIaiAAIAIgA0EMaiABQQJ0aigCABEDAAtBAAshBiADQTBqJAAgBgsPACAAQYTRATYCACAAECILDQAgAEGE0QE2AgAgAAsGAEHo0gELFAAgAEEEakEAIAEoAgRBsNIBRhsLjgEBAXwgAysDACEFIAQoAgAhAyACKAIAIQJB2AAQIyIBQYTRATYCACABQgA3AgQgAUH00QE2AhAgAUIANwMYIAEgAjYCFCABQgA3AyAgASADNgI4IAEgBTkDMCABQYCAgPwDNgIoIAFBQGtCADcDACABQgA3A0ggAUIANwNQIAAgATYCBCAAIAFBEGo2AgALCwAgAUG8zwE2AgALEQBBCBAjIgBBvM8BNgIAIAALUwECfyABIAIoAgA2AgAgASACKAIEIgM2AgQgASACKAIIIgQ2AgggAUEEaiEAIARFBEAgASAANgIADwsgAyAANgIIIAJCADcCBCACIAJBBGo2AgALgQICB38DfCABKAIQIQIgASgCCCgCACEEAkAgASgCBEEBTQRAIAJFDQEgBCACQQN0ECYaDwsgAkUNACAAKAI4IQYgACgCPCEDIAEoAgAiASgCBCEHIAEoAgAhCEEAIQEDQCAIIAFBA3QiBWorAwAhCSAAKwMwIQogACAFIAdqKwMAIgs5AzACQAJ/AkAgCyAKoUQAAAAAAAAAAGRFBEAgACADQQFqIgM2AjwgAyAGSQ0BCyAAQQA2AjwgACAJOQNAQQAMAQsgCSAAKwNAIgpkRQ0BIAAgCTkDQCAAQQA2AjxBAAshAyAJIQoLIAQgBWogCjkDACABQQFqIgEgAkcNAAsLC7YDAgR/AXwjAEEwayIDJAACfwJAIAEoAgQgAS0ACyIEIATAIgRBAEgbQQRHDQAgASgCACABIARBAEgbKAAAQejesaMGRw0AQQUgAi0AGEEDRw0BGiAAAn8gACsDIET8qfHSTWJQP6IgAisDAKIiB0QAAAAAAADwQWMgB0QAAAAAAAAAAGZxBEAgB6sMAQtBAAs2AjgLIANBDGogAEEIaiABIAEgAhAzAkAgAy0AEA0AIAMoAgwiBEEYaiEAIAItABghAQJAIAQtADAiBUH/AUYEQCABQf8BRg0CDAELIAFB/wFHDQAgA0EbNgIsIANBHDYCKCADQR02AiQgA0EeNgIgIANBHzYCHCADQSA2AhggA0EhNgIUIANBIjYCECADQSM2AgwgA0EIaiAAIANBDGogBUECdGooAgARAQAgBEH/AToAMAwBCyADIAA2AgggA0E4NgIsIANBOTYCKCADQTo2AiQgA0E7NgIgIANBPDYCHCADQT02AhggA0E+NgIUIANBPzYCECADQcAANgIMIANBCGogACACIANBDGogAUECdGooAgARAwALQQALIQYgA0EwaiQAIAYLDwAgAEHMzQE2AgAgABAiCw0AIABBzM0BNgIAIAALBgBBrM8BCxQAIABBBGpBACABKAIEQfjOAUYbC5IBAQF8IAMrAwAhBSAEKAIAIQMgAigCACECQdgAECMiAUHMzQE2AgAgAUIANwIEIAFBvM4BNgIQIAFCADcDGCABIAI2AhQgAUIANwMgIAEgAzYCOCABIAU5AzAgAUGAgID8AzYCKCABQgA3A1AgAUL/////DzcCSCABQUBrQgA3AwAgACABNgIEIAAgAUEQajYCAAsLACABQYTMATYCAAsRAEEIECMiAEGEzAE2AgAgAAu3AQIFfwJ8IAEoAhAhAiABKAIIKAIAIQMCQCABKAIEQQJPBEAgAkUNASABKAIAIgUoAgAhBkEAIQEDQAJAIAArAzCZRAAAAAAAALA8ZSAGIAFBA3QiBGorAwAiCEQAAAAAAACwPGRxRQRAIAArAzghBwwBCyAAIAUoAgQgBGorAwAiBzkDOAsgACAIOQMwIAMgBGogBzkDACABQQFqIgEgAkcNAAsMAQsgAkUNACADIAJBA3QQJhoLCw8AIABBjMoBNgIAIAAQIgsNACAAQYzKATYCACAACwYAQfTLAQsUACAAQQRqQQAgASgCBEG8ywFGGwuHAQEBfCADKwMAIQUgBCgCACEDIAIoAgAhAkHQABAjIgFBjMoBNgIAIAFCADcCBCABQfzKATYCECABQgA3AxggASACNgIUIAFCADcDICABIAM2AjggASAFOQMwIAFBgICA/AM2AiggAUFAa0IANwMAIAFCADcDSCAAIAE2AgQgACABQRBqNgIACwsAIAFBxMgBNgIACxEAQQgQIyIAQcTIATYCACAAC7gBAgV/A3wgASgCECECIAEoAggoAgAhAwJAIAEoAgRBAk8EQCACRQ0BIAEoAgAiASgCBCEFIAEoAgAhBkEAIQEDQCAGIAFBA3QiBGorAwAhByAAKwMwIQggACAEIAVqKwMAIgk5AzAgACAHRAAAAAAAAAAAIAArAzggCSAIoUQAAAAAAAAAAGQboCIHOQM4IAMgBGogBzkD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IgNFDQAgACkDMCECIAEoAggoAgAhBEEAIQAgA0EITwRAIANBeHEhBwNAIAQgAEEDdGoiASACNwMAIAEgAjcDCCABIAI3AxAgASACNwMYIAEgAjcDICABIAI3AyggASACNwMwIAEgAjcDOCAAQQhqIQAgBkEIaiIGIAdHDQALCyADQQdxIgFFDQADQCAEIABBA3RqIAI3AwAgAEEBaiEAIAVBAWoiBSABRw0ACwsL+wIBBH8jAEEwayIDJAACfwJAIAEoAgQgAS0ACyIEIATAIgRBAEgbQQVHDQAgASgCACABIARBAEgbQc4QQQUQJw0AQQUgAi0AGEEDRw0BGiAAIAIpAwA3AzALIANBDGogAEEIaiABIAEgAhAzAkAgAy0AEA0AIAMoAgwiBEEYaiEAIAItABghAQJAIAQtADAiBUH/AUYEQCABQf8BRg0CDAELIAFB/wFHDQAgA0EbNgIsIANBHDYCKCADQR02AiQgA0EeNgIgIANBHzYCHCADQSA2AhggA0EhNgIUIANBIjYCECADQSM2AgwgA0EIaiAAIANBDGogBUECdGooAgARAQAgBEH/AToAMAwBCyADIAA2AgggA0E4NgIsIANBOTYCKCADQTo2AiQgA0E7NgIgIANBPDYCHCADQT02AhggA0E+NgIUIANBPzYCECADQcAANgIMIANBCGogACACIANBDGogAUECdGooAgARAwALQQALIQYgA0EwaiQAIAYLDwAgAEGEowE2AgAgABAiCw0AIABBhKMBNgIAIAALBgBB7KQBCxQAIABBBGpBACABKAIEQbSkAUYbC4gBAQF8IAMrAwAhBSAEKAIAIQMgAigCACECQcgAECMiAUGEowE2AgAgAUIANwIEIAFB9KMBNgIQIAFCADcDGCABIAI2AhQgAUIANwMgIAEgAzYCOCABIAU5AzAgAUGAgID8AzYCKCABQUBrQoCAgICAgID4PzcDACAAIAE2AgQgACABQRBqNgIACwsAIAFBvKEBNgIACxEAQQgQIyIAQbyhATYCACAAC44FAgd/A3wgASgCECECIAEoAggoAgAhAwJAIAEoAgRFBEAgAkUNASADIAJBA3QQJhoPCyABKAIAKAIAIQQgACsDMCILIAArAzgiCWEEQCACQQBMDQFBACEBIAJBBE8EQCACQfz///8HcSEGA0AgAyABQQN0IgBqIAAgBGorAwAgCaI5AwAgAyAAQQhyIgdqIAQgB2orAwAgCaI5AwAgAyAAQRByIgdqIAQgB2orAwAgCaI5AwAgAyAAQRhyIgBqIAAgBGorAwAgCaI5AwAgAUEEaiEBIAhBBGoiCCAGRw0ACwsgAkEDcSIARQ0BA0AgAyABQQN0IgJqIAIgBGorAwAgCaI5AwAgAUEBaiEBIAVBAWoiBSAARw0ACwwBCyAAQUBrKwMAIQkCQCACQQBMDQBBACEBIAJBAUcEQCACQf7///8HcSEIA0AgAyABQQN0IgZqIAQgBmorAwBEAAAAAAAAAABEAAAAAAAA8D8gCSABt6IgC6AiCiAKRAAAAAAAAPA/ZBsgCkQAAAAAAAAAAGMbojkDACADIAFBAXIiBkEDdCIHaiAEIAdqKwMARAAAAAAAAAAARAAAAAAAAPA/IAkgBreiIAugIgogCkQAAAAAAADwP2QbIApEAAAAAAAAAABjG6I5AwAgAUECaiEBIAVBAmoiBSAIRw0ACwsgAkEBcUUNACADIAFBA3QiBWogBCAFaisDAEQAAAAAAAAAAEQAAAAAAADwPyAJIAG3oiALoCIKIApEAAAAAAAA8D9kGyAKRAAAAAAAAAAAYxuiOQMACyAARAAAAAAAAAAARAAAAAAAAPA/IAkgAreiIAugIgkgCUQAAAAAAADwP2QbIAlEAAAAAAAAAABjGzkDMAsLiQcCBX8CfCMAQTBrIgMkAAJAAkAgASgCBCABLQALIgQgBMBBAEgiBBtBBkcNACABKAIAIAEgBBtBxxBBBhAnDQBBBSEEIAItABhBAkcNASAAQoCAgICAgID4P0IAIAItAAAbNwM4IABBQGsgAEEwakEgQRggACsDMCAAKwM4ZBtqKQMANwMACwJAAkACQCABKAIEIgYgAS0ACyIEIATAIgVBAEgbQQdHDQAgASgCACABIAVBAEgbQekOQQcQJw0AIAItABhBA0cNASAAAn8gAisDACIImUQAAAAAAADgQWMEQCAIqgwBC0GAgICAeAs2AlggASgCBCEGIAEtAAsiBCEFCwJAIAYgBCAFwEEASCIHG0EIRw0AIAEoAgAgASAHGykAAELmwpGrlsnbpvMAUg0AQQUhBCACLQAYQQNHDQNEAAAAAAAA8D8hCCAAQcgAaiIEIAIrAwAiCUSN7bWg98awPmQEfEQAAAAAAADwPyAJIAArAyCiRAAAAAAAQI9Ao6MFRAAAAAAAAPA/CzkDACAAQUBrIABB0ABqIAQgACsDMCAAKwM4ZBspAwA3AwAgASgCBCEGIAEtAAsiBCEFCwJAIAYgBCAFwCIEQQBIG0EJRw0AIAEoAgAgASAEQQBIG0G9DEEJECcNAEEFIQQgAi0AGEEDRw0DRAAAAAAAAPA/IQggAEHQAGoiBCACKwMAIglEje21oPfGsD5kBHxEAAAAAAAA8D8gCSAAKwMgokQAAAAAAECPQKOjBUQAAAAAAADwPwuaOQMAIABBQGsgBCAAQcgAaiAAKwMwIAArAzhkGykDADcDAAsgA0EMaiAAQQhqIAEgASACEDNBACEEIAMtABANAiADKAIMIgVBGGohACACLQAYIQEgBS0AMCIGQf8BRgRAIAFB/wFGDQMMAgsgAUH/AUcNASADQRs2AiwgA0EcNgIoIANBHTYCJCADQR42AiAgA0EfNgIcIANBIDYCGCADQSE2AhQgA0EiNgIQIANBIzYCDCADQQhqIAAgA0EMaiAGQQJ0aigCABEBACAFQf8BOgAwDAILEDsACyADIAA2AgggA0E4NgIsIANBOTYCKCADQTo2AiQgA0E7NgIgIANBPDYCHCADQT02AhggA0E+NgIUIANBPzYCECADQcAANgIMIANBCGogACACIANBDGogAUECdGooAgARAwALIANBMGokACAECw8AIABByJ8BNgIAIAAQIgsNACAAQcifATYCACAACwYAQayhAQsUACAAQQRqQQAgASgCBEH0oAFGGwvTAQECfCAEKAIAIQQgAigCACECIAMrAwAhBUHwABAjIgFB2ABqRAAAAAAAAPA/IAVEAAAAAAAANECiRAAAAAAAQI9Ao6MiBjkDACABQcifATYCACABQgA3AgQgAUG4oAE2AhAgAUIANwMYIAEgAjYCFCABQgA3AyAgASAENgI4IAEgBTkDMCABQYCAgPwDNgIoIAFCgICAgICAgPg/NwNIIAFBQGtCADcDACABQX82AmggASAGmjkDYCABIAEpA1g3A1AgACABNgIEIAAgAUEQajYCAAsLACABQYCeATYCAAsRAEEIECMiAEGAngE2AgAgAAvbAwIKfwJ8IAEoAhAhACABKAIIKAIAIQMCQCABKAIEIgUEQCAARQ0BIAEoAgAiCygCACEEQQAhASAAQQRPBEAgAEF8cSEJA0AgAyABQQN0IgJqIAIgBGorAwA5AwAgAyACQQhyIghqIAQgCGorAwA5AwAgAyACQRByIghqIAQgCGorAwA5AwAgAyACQRhyIgJqIAIgBGorAwA5AwAgAUEEaiEBIAdBBGoiByAJRw0ACwsgAEEDcSICBEADQCADIAFBA3QiB2ogBCAHaisDADkDACABQQFqIQEgBkEBaiIGIAJHDQALCyAFQQFGDQEgAEUNAUECIAUgBUECTRshByAAQX5xIQkgAEEBcSEIQQEhBANAIAsgBEECdGooAgAhAkEAIQFBACEGIABBAUcEQANAIAMgAUEDdCIFaiIKIAIgBWorAwAiDCAKKwMAIg0gDCANZBs5AwAgAyAFQQhyIgVqIgogAiAFaisDACIMIAorAwAiDSAMIA1kGzkDACABQQJqIQEgBkECaiIGIAlHDQALCyAIBEAgAyABQQN0IgFqIgYgASACaisDACIMIAYrAwAiDSAMIA1kGzkDAAsgBEEBaiIEIAdHDQALDAELIABFDQAgAyAAQQN0ECYaCwsPACAAQcibATYCACAAECILDQAgAEHImwE2AgAgAAsGAEHwnQELFAAgAEEEakEAIAEoAgRBpJ0BRhsLdgEBfCADKwMAIQUgBCgCACEDIAIoAgAhAkHAABAjIgFByJsBNgIAIAFCADcCBCABQdCcATYCECABQgA3AxggASACNgIUIAFCADcDICABIAM2AjggASAFOQMwIAFBgICA/AM2AiggACABNgIEIAAgAUEQajYCAAsLACABQeiZATYCAAsRAEEIECMiAEHomQE2AgAgAAvbAwIKfwJ8IAEoAhAhACABKAIIKAIAIQMCQCABKAIEIgUEQCAARQ0BIAEoAgAiCygCACEEQQAhASAAQQRPBEAgAEF8cSEJA0AgAyABQQN0IgJqIAIgBGorAwA5AwAgAyACQQhyIghqIAQgCGorAwA5AwAgAyACQRByIghqIAQgCGorAwA5AwAgAyACQRhyIgJqIAIgBGorAwA5AwAgAUEEaiEBIAdBBGoiByAJRw0ACwsgAEEDcSICBEADQCADIAFBA3QiB2ogBCAHaisDADkDACABQQFqIQEgBkEBaiIGIAJHDQALCyAFQQFGDQEgAEUNAUECIAUgBUECTRshByAAQX5xIQkgAEEBcSEIQQEh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KwMAIQUgBCgCACEDIAIoAgAhAkHAABAjIgFBrPAANgIAIAFCADcCBCABQbjxADYCECABQgA3AxggASACNgIUIAFCADcDICABIAM2AjggASAFOQMwIAFBgICA/AM2AiggACABNgIEIAAgAUEQajYCAAsLACABQcjuADYCAAsRAEEIECMiAEHI7gA2AgAgAAvCAwEIfyABKAIQIQAgASgCCCgCACEDAkAgASgCBEECTwRAIABFDQEgASgCACIGKAIAIQRBACEBIABBBE8EQCAAQXxxIQkDQCADIAFBA3QiAmogAiAEaisDADkDACADIAJBCHIiCGogBCAIaisDADkDACADIAJBEHIiCGogBCAIaisDADkDACADIAJBGHIiAmogAiAEaisDADkDACABQQRqIQEgBUEEaiIFIAlHDQALCyAAQQNxIgIEQANAIAMgAUEDdCIFaiAEIAVqKwMAOQMAIAFBAWohASAHQQFqIgcgAkcNAAsLIAYoAgQhBEEAIQEgAEEBRwRAIABBfnEhBUEAIQcDQCADIAFBA3QiAmoiBkQAAAAAAADwP0QAAAAAAAAAACAGKwMAIAIgBGorAwBmGzkDACADIAJBCHIiAmoiBkQAAAAAAADwP0QAAAAAAAAAACAGKwMAIAIgBGorAwBmGzkDACABQQJqIQEgB0ECaiIHIAVHDQALCyAAQQFxRQ0BIAMgAUEDdCIAaiIBRAAAAAAAAPA/RAAAAAAAAAAAIAErAwAgACAEaisDAGYbOQMADwsgAEUNACADIABBA3QQJhoLCw8AIABB5OsANgIAIAAQIgtpAQJ/IwBBEGsiAyQAIAEgACgCBCIEQQF1aiEBIAAoAgAhACAEQQFxBEAgASgCACAAaigCACEACyADIAI2AgwgA0Hs/gM2AgggASADQQhqIAARAQAgAygCDCIABEAgABAACyADQRBqJAALDQAgAEHk6wA2AgAgAAsGAEG47gALFAAgAEEEakEAIAEoAgRB3O0ARhsLdgEBfCADKwMAIQUgBCgCACEDIAIoAgAhAkHAABAjIgFB5OsANgIAIAFCADcCBCABQfjsADYCECABQgA3AxggASACNgIUIAFCADcDICABIAM2AjggASAFOQMwIAFBgICA/AM2AiggACABNgIEIAAgAUEQajYCAAsLACABQfjpADYCAAsRAEEIECMiAEH4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GCICRQ0AIAIoAgQNACABKAIAIQYgAEEEaiADIAEQmAEgACgCBCEBIABBADYCBCABBEACQCAALQAMRQ0AAkAgASgCGCICRQ0AIAIgAigCBCIFQQFrNgIEIAUNACACIAIoAgAoAggRAAAgAhAlCyABLAATQQBODQAgASgCCBAiCyABECILIAYMAQsgASgCAAsiAQ0ACwsgAEEQaiQACxQAIABBBGpBACABKAIEQaTTAEYbC3YBAXwgAysDACEFIAQoAgAhAyACKAIAIQJBwAAQIyIBQcjRADYCACABQgA3AgQgAUHQ0gA2AhAgAUIANwMYIAEgAjYCFCABQgA3AyAgASADNgI4IAEgBTkDMCABQYCAgPwDNgIoIAAgATYCBCAAIAFBEGo2AgALCwAgAUHozwA2AgALEQBBCBAjIgBB6M8ANgIAIAAL/AEBB38gASgCECEAIAEoAggoAgAhAwJAIAEoAgQEQCAARQ0BIAEoAgAoAgAhBEEAIQEgAEEETwRAIABBfHEhCANAIAMgAUEDdCICaiACIARqKwMAEE45AwAgAyACQQhyIgVqIAQgBWorAwAQTjkDACADIAJBEHIiBWogBCAFaisDABBOOQMAIAMgAkEYciICaiACIARqKwMAEE45AwAgAUEEaiEBIAdBBGoiByAIRw0ACwsgAEEDcSIARQ0BA0AgAyABQQN0IgJqIAIgBGorAwAQTjkDACABQQFqIQEgBkEBaiIGIABHDQALDAELIABFDQAgAyAAQQN0ECYaCwsPACAAQajNADYCACAAECILDQAgAEGozQA2AgAgAAsGAEHYzwALFAAgAEEEakEAIAEoAgRBiM8ARhsLdgEBfCADKwMAIQUgBCgCACEDIAIoAgAhAkHAABAjIgFBqM0ANgIAIAFCADcCBCABQbDOADYCECABQgA3AxggASACNgIUIAFCADcDICABIAM2AjggASAFOQMwIAFBgICA/AM2AiggACABNgIEIAAgAUEQajYCAAu4AQECfyMAQSBrIgQkACABIAAoAgQiBUEBdWohASAAKAIAIQAgBUEBcQRAIAEoAgAgAGooAgAhAAsgBCACNgIUIARB7P4DNgIQIAQgAzYCDCAEQez+AzYCCCAEQRhqIAEgBEEQaiAEQQhqIAARBwAgBCgCHCIAEAYgBCgCHCIBBEAgARAAIARBADYCHAsgBCgCDCIBBEAgARAAIARBADYCDAsgBCgCFCIBBEAgARAACyAEQSBqJAAgAAsLACABQcjLADYCAAsRAEEIECMiAEHIywA2AgAgAAv3AQEHfyABKAIQIQAgASgCCCgCACEDAkAgASgCBARAIABFDQEgASgCACgCACEEQQAhASAAQQRPBEAgAEF8cSEIA0AgAyABQQN0IgJqIAIgBGorAwCcOQMAIAMgAkEIciIFaiAEIAVqKwMAnDkDACADIAJBEHIiBWogBCAFaisDAJw5AwAgAyACQRhyIgJqIAIgBGorAwCcOQMAIAFBBGohASAHQQRqIgcgCEcNAAsLIABBA3EiAEUNAQNAIAMgAUEDdCICaiACIARqKwMAnDkDACABQQFqIQEgBkEBaiIGIABHDQALDAELIABFDQAgAyAAQQN0ECYaCwsPACAAQYjJADYCACAAECILDQAgAEGIyQA2AgAgAAsGAEG4ywALFAAgAEEEakEAIAEoAgRB6MoARhsLdgEBfCADKwMAIQUgBCgCACEDIAIoAgAhAkHAABAjIgFBiMkANgIAIAFCADcCBCABQZDKADYCECABQgA3AxggASACNgIUIAFCADcDICABIAM2AjggASAFOQMwIAFBgICA/AM2AiggACABNgIEIAAgAUEQajYCAAsLACABQajHADYCAAsRAEEIECMiAEGoxwA2AgAgAAvfLQEJfyMAQaACayIEJAAgBEHQAWogASACEGEgBEGwAWogASADEGECQAJAAkACQCAELQDoAUEERwRAIARBAjoASCAEQQc6ACsgBEHhCygAADYCICAEQeQLKAAANgAjIARBADoAMCAEQQA6ACcgBEHQAGpBixEQbiECIAQgBEGIAWoiBTYChAEgBEIANwKIASAEQfgBaiIDIARBhAFqIgcgBSAEQSBqIgYgBhAuIAMgByAFIAIgAhAuIARCADcClAEgBCAEQZABakEEciIHNgKQASAFIAQoAoQBIgJHBEADQCAEQfgBaiAEQZABaiAHIAJBEGoiAyADEC4CQCACKAIEIgMEQANAIAMiAigCACIDDQAMAgsACwNAIAIgAigCCCICKAIARw0ACwsgAiAFRw0ACwsgBEEFOgCoASAAIAEgBEGQAWoiABBFIAQtAKgBIgFB/wFHBEAgBEEbNgKYAiAEQRw2ApQCIARBHTYCkAIgBEEeNgKMAiAEQR82AogCIARBIDYChAIgBEEhNgKAAiAEQSI2AvwBIARBIzYC+AEgBEEUaiAAIARB+AFqIAFBAnRqKAIAEQEACyAEQf8BOgCoASAEQYQBaiAEKAKIARA1IAQtAHgiAEH/AUcEQCAEQRs2ApgCIARBHDYClAIgBEEdNgKQAiAEQR42AowCIARBHzYCiAIgBEEgNgKEAiAEQSE2AoACIARBIjYC/AEgBEEjNgL4ASAEQRRqIARB4ABqIARB+AFqIABBAnRqKAIAEQEACyAEQf8BOgB4IAQsAFtBAEgEQCAEKAJQECILIAQtAEgiAEH/AUcEQCAEQRs2ApgCIARBHDYClAIgBEEdNgKQAiAEQR42AowCIARBHzYCiAIgBEEgNgKEAiAEQSE2AoACIARBIjYC/AEgBEEjNgL4ASAEQRRqIARBMGogBEH4AWogAEECdGooAgARAQALIARB/wE6AEggBCwAK0EATg0BIAQoAiAQIgwBCwJAAkACQCAELQDIAUEGaw4CAQIACyAEQQI6AEggBEEHOgArIARB4QsoAAA2AiAgBEHkCygAADYAIyAEQQA6ADAgBEEAOgAnIARB0ABqQdkIEG4hAiAEIARBiAFqIgU2AoQBIARCADcCiAEgBEH4AWoiAyAEQYQBaiIHIAUgBEEgaiIGIAYQLiADIAcgBSACIAIQLiAEQgA3ApQBIAQgBEGQAWpBBHIiBzYCkAEgBSAEKAKEASICRwRAA0AgBEH4AWogBEGQAWogByACQRBqIgMgAxAuAkAgAigCBCIDBEADQCADIgIoAgAiAw0ADAILAAsDQCACIAIoAggiAigCAEcNAAsLIAIgBUcNAAsLIARBBToAqAEgACABIARBkAFqIgAQRSAELQCoASIBQf8BRwRAIARBGzYCmAIgBEEcNgKUAiAEQR02ApACIARBHjYCjAIgBEEfNgKIAiAEQSA2AoQCIARBITYCgAIgBEEiNgL8ASAEQSM2AvgBIARBFGogACAEQfgBaiABQQJ0aigCABEBAAsgBEH/AToAqAEgBEGEAWogBCgCiAEQNSAELQB4IgBB/wFHBEAgBEEbNgKYAiAEQRw2ApQCIARBHTYCkAIgBEEeNgKMAiAEQR82AogCIARBIDYChAIgBEEhNgKAAiAEQSI2AvwBIARBIzYC+AEgBEEUaiAEQeAAaiAEQfgBaiAAQQJ0aigCABEBAAsgBEH/AToAeCAELABbQQBIBEAgBCgCUBAiCyAELQBIIgBB/wFHBEAgBEEbNgKYAiAEQRw2ApQCIARBHTYCkAIgBEEeNgKMAiAEQR82AogCIARBIDYChAIgBEEhNgKAAiAEQSI2AvwBIARBIzYC+AEgBEEUaiAEQTBqIARB+AFqIABBAnRqKAIAEQEACyAEQf8BOgBIIAQsACtBAE4NAiAEKAIgECIMAgsgBEEANgKMASAEQgA3AoQBIARBADYCHCAEQgA3AhQgBCgCsAEhA0EAIQICQANAIAMgB0EFdGoiBi0AGEEHRwRAIARBAjoASCAEQQc6ACsgBEHhCygAADYCICAEQeQLKAAANgAjIARBADoAMCAEQQA6ACcgBEHQAGpB2QgQbiECIAQgBEEMaiIFNgIIIARCADcCDCAEQfgBaiIDIARBCGoiByAFIARBIGoiBiAGEC4gAyAHIAUgAiACEC4gBEIANwKUASAEIARBkAFqQQRyIgc2ApABIAUgBCgCCCICRwRAA0AgBEH4AWogBEGQAWogByACQRBqIgMgAxAuAkAgAigCBCIDBEADQCADIgIoAgAiAw0ADAILAAsDQCACIAIoAggiAigCAEcNAAsLIAIgBUcNAAsLIARBBToAqAEgACABIARBkAFqIgAQRSAELQCoASIBQf8BRwRAIARBGzYCmAIgBEEcNgKUAiAEQR02ApACIARBHjYCjAIgBEEfNgKIAiAEQSA2AoQCIARBITYCgAIgBEEiNgL8ASAEQSM2AvgBIARBBGogACAEQfgBaiABQQJ0aigCABEBAAsgBEH/AToAqAEgBEEIaiAEKAIMEDUgBC0AeCIAQf8BRwRAIARBGzYCmAIgBEEcNgKUAiAEQR02ApACIARBHjYCjAIgBEEfNgKIAiAEQSA2AoQCIARBITYCgAIgBEEiNgL8ASAEQSM2AvgBIARBBGogBEHgAGogBEH4AWogAEECdGooAgARAQALIARB/wE6AHggBCwAW0EASARAIAQoAlAQIgsgBC0ASCIAQf8BRwRAIARBGzYCmAIgBEEcNgKUAiAEQR02ApACIARBHjYCjAIgBEEfNgKIAiAEQSA2AoQCIARBITYCgAIgBEEiNgL8ASAEQSM2AvgBIARBBGogBEEwaiAEQfgBaiAAQQJ0aigCABEBAAsgBEH/AToASCAELAArQQBODQIgBCgCIBAiDAILAkAgBCgCiAEiAyAEKAKMAUcEQCADQQA2AgggA0IANwIAIAYoAgQiBSAGKAIAIghHBEAgBSAIayIFQQBIDQkgAyAFECMiBjYCBCADIAY2AgAgAyAFIAZqIgk2AgggBiAIIAUQLxogAyAJNgIECyAEIANBDGo2AogBDAELQQAhAgJAAkACQCAEKAKIASIFIAQoAoQBIghrQQxtIgpBAWoiA0HWqtWqAUkEQEHVqtWqASAEKAKMASAIa0EMbSIJQQF0IgsgAyADIAtJGyAJQarVqtUATxsiCQRAIAlB1qrVqgFPDQIgCUEMbBAjIQILIAIgCkEMbGoiA0EANgIIIANCADcCACAGKAIEIgsgBigCACIKRwRAIAsgCmsiBkEASA0MIAMgBhAjIgs2AgAgAyAGIAtqIgw2AgggCyAKIAYQLxogAyAMNgIECyACIAlBDGxqIQIgA0EMaiEGIAUgCEYNAgNAIANBDGsiA0EANgIIIAMgBUEMayIFKAIANgIAIAMgBSgCBDYCBCADIAUoAgg2AgggBUEANgIIIAVCADcCACAFIAhHDQALIAQgAjYCjAEgBCgCiAEhAiAEIAY2AogBIAQoAoQBIQUgBCADNgKEASACIAVGDQMDQCACQQxrIgMoAgAiBgRAIAJBCGsgBjYCACAGECILIAMiAiAFRw0ACwwDCwwKCxA0AAsgBCACNgKMASAEIAY2AogBIAQgAzYChAELIAUEQCAFECILIAQoAhghAgsgBCgChAEgB0EMbGooAgAhBQJAIAQoAhwiCCACSwRAIAIgBTYCACAEIAJBBGoiAjYCGAwBCyACIAQoAhQiBmtBAnUiCUEBaiIDQYCAgIAETw0HQf////8DIAggBmsiCEEBdSIKIAMgAyAKSRsgCEH8////B08bIggEfyAIQYCAgIAETw0GIAhBAnQQIwVBAAsiCiAJQQJ0aiIDIAU2AgAgA0EEaiEFIAIgBkcEQANAIANBBGsiAyACQQRrIgIoAgA2AgAgAiAGRw0ACyAEKAIUIQILIAQgCiAIQQJ0ajYCHCAEIAU2AhggBCADNgIUIAIEQCACECILIAUhAgsgB0EBaiIHIAQoArQBIAQoArABIgNrQQV1SQ0ACyAEKAIUIQggBCgCGCEGIAQoAoQBIgIoAgAhBSACKAIEIQICf0EQECMhAyACIAVrQQJ1IQVBACEHIwBBEGsiAiQAIANCADcCBCADQQA2AgwgA0HMgwI2AgACQAJAIAYgCGtBAnUiCUUNACADQQRqIQogBUUEQANAIAJBADYCDCACQgA3AgQCQCADKAIIIgUgAygCDE8EQCAKIAJBBGoQQSACKAIEIgVFDQEgAiAFNgIIIAUQIgwBCyAFQQA2AgggBUIANwIAIAUgAigCBDYCACAFIAIoAgg2AgQgBSACKAIMNgIIIAMgBUEMajYCCAsgB0EBaiIHIAlHDQAMAgsACyAFQQBIDQEgBUECdCEGA0AgCCAHQQJ0aigCACELIAIgBhAjIgU2AgggAiAFNgIEIAIgBSAGaiIMNgIMIAUgCyAGEC8aIAIgDDYCCAJAIAMoAggiBSADKAIMSQRAIAVBADYCCCAFQgA3AgAgBSACKAIENgIAIAUgAigCCDYCBCAFIAIoAgw2AgggAyAFQQxqNgIIDAELIAogAkEEahBBIAIoAgQiBUUNACACIAU2AgggBRAiCyAHQQFqIgcgCUcNAAsLIAJBEGokACADDAELIAJBADYCDCACQgA3AgQMBgshAyAELQDoAUEERw0EIAEoAgAhBQJAIAQsANsBQQBOBEAgBCAEKALYATYCKCAEIAQpA9ABNwMgDAELIARBIGogBCgC0AEgBCgC1AEQMQtBEBAjIgIgAzYCDCACQZDoAjYCACACQgA3AgQgBCACNgKUASAEIAM2ApABIARB+AFqIAVB/ABqIARBIGoiAiACIARBkAFqEGsgBC0A/AEhAwJAIAQoApQBIgJFDQAgAiACKAIEIgVBAWs2AgQgBQ0AIAIgAigCACgCCBEAACACECULIAQsACtBAEgEQCAEKAIgECILIARBAjoASCAEQQc6ACsgBEEAOgAnIARB4QsoAAA2AiAgBEHkCygAADYAIyAEIAM6ADAgBEGDD0HnESADGzYCBCAEQdAAaiAEQQRqELsBIQIgBCAEQQxqIgU2AgggBEIANwIMIARB+AFqIgMgBEEIaiIHIAUgBEEgaiIGIAYQLiADIAcgBSACIAIQLiAEQgA3ApQBIAQgBEGQAWpBBHIiBzYCkAEgBSAEKAIIIgJHBEADQCAEQfgBaiAEQZABaiAHIAJBEGoiAyADEC4CQCACKAIEIgMEQANAIAMiAigCACIDDQAMAgsACwNAIAIgAigCCCICKAIARw0ACwsgAiAFRw0ACwsgBEEFOgCoASAAIAEgBEGQAWoiABBFIAQtAKgBIgFB/wFHBEAgBEEbNgKYAiAEQRw2ApQCIARBHTYCkAIgBEEeNgKMAiAEQR82AogCIARBIDYChAIgBEEhNgKAAiAEQSI2AvwBIARBIzYC+AEgBEH3AWogACAEQfgBaiABQQJ0aigCABEBAAsgBEH/AToAqAEgBEEIaiAEKAIMEDUgBC0AeCIAQf8BRwRAIARBGzYCmAIgBEEcNgKUAiAEQR02ApACIARBHjYCjAIgBEEfNgKIAiAEQSA2AoQCIARBITYCgAIgBEEiNgL8ASAEQSM2AvgBIARB9wFqIARB4ABqIARB+AFqIABBAnRqKAIAEQEACyAEQf8BOgB4IAQsAFtBAEgEQCAEKAJQECILIAQtAEgiAEH/AUcEQCAEQRs2ApgCIARBHDYClAIgBEEdNgKQAiAEQR42AowCIARBHzYCiAIgBEEgNgKEAiAEQSE2AoACIARBIjYC/AEgBEEjNgL4ASAEQfcBaiAEQTBqIARB+AFqIABBAnRqKAIAEQEACyAEQf8BOgBIIAQsACtBAE4NACAEKAIgECILIAQoAhQiAARAIAAQIgsgBCgChAEiAEUNASAEKAKIASIDIAAiAkcEQANAIANBDGsiASgCACICBEAgA0EIayACNgIAIAIQIgsgASIDIABHDQALIAQoAoQBIQILIAQgADYCiAEgAhAiDAELIAEoAgAhBgJAIAQsANsBQQBOBEAgBCAEKALYATYCgAIgBCAEKQPQATcD+AEMAQsgBEH4AWogBCgC0AEgBCgC1AEQMQsgBCgCtAEhBSAEKAKwASEDQRAQIyICQgA3AgQgAkHMgwI2AgAgAkEANgIMIARBADYCKCAEQgA3AiAgAyAFRwRAIAUgA2siBUEASA0EIAQgBRAjIgc2AiAgBCAFIAdqIgg2AiggByADIAUQLxogBCAINgIkCyACQQRqIARBIGoQQSAEKAIgIgMEQCAEIAM2AiQgAxAiC0EQECMiAyACNgIMIANBkOgCNgIAIANCADcCBCAEIAM2ApQBIAQgAjYCkAEgBEEgaiAGQfwAaiAEQfgBaiICIAIgBEGQAWoQayAELQAkIQMCQCAEKAKUASICRQ0AIAIgAigCBCIFQQFrNgIEIAUNACACIAIoAgAoAggRAAAgAhAlCyAELACDAkEASARAIAQoAvgBECILIARBAjoASCAEQQc6ACsgBEEAOgAnIARB4QsoAAA2AiAgBEHkCygAADYAIyAEIAM6ADAgBEGDD0HnESADGzYCFCAEQdAAaiAEQRRqELsBIQIgBCAEQYgBaiIFNgKEASAEQgA3AogBIARB+AFqIgMgBEGEAWoiByAFIARBIGoiBiAGEC4gAyAHIAUgAiACEC4gBEIANwKUASAEIARBkAFqQQRyIgc2ApABIAUgBCgChAEiAkcEQANAIARB+AFqIARBkAFqIAcgAkEQaiIDIAMQLgJAIAIoAgQiAwRAA0AgAyICKAIAIgMNAAwCCwALA0AgAiACKAIIIgIoAgBHDQALCyACIAVHDQALCyAEQQU6AKgBIAAgASAEQZABaiIAEEUgBC0AqAEiAUH/AUcEQCAEQRs2ApgCIARBHDYClAIgBEEdNgKQAiAEQR42AowCIARBHzYCiAIgBEEgNgKEAiAEQSE2AoACIARBIjYC/AEgBEEjNgL4ASAEQQhqIAAgBEH4AWogAUECdGooAgARAQALIARB/wE6AKgBIARBhAFqIAQoAogBEDUgBC0AeCIAQf8BRwRAIARBGzYCmAIgBEEcNgKUAiAEQR02ApACIARBHjYCjAIgBEEfNgKIAiAEQSA2AoQCIARBITYCgAIgBEEiNgL8ASAEQSM2AvgBIARBCGogBEHgAGogBEH4AWogAEECdGooAgARAQALIARB/wE6AHggBCwAW0EASARAIAQoAlAQIgsgBC0ASCIAQf8BRwRAIARBGzYCmAIgBEEcNgKUAiAEQR02ApACIARBHjYCjAIgBEEfNgKIAiAEQSA2AoQCIARBITYCgAIgBEEiNgL8ASAEQSM2AvgBIARBCGogBEEwaiAEQfgBaiAAQQJ0aigCABEBAAsgBEH/AToASCAELAArQQBODQAgBCgCIBAiCyAELQDIASIAQf8BRwRAIARBGzYCQCAEQRw2AjwgBEEdNgI4IARBHjYCNCAEQR82AjAgBEEgNgIsIARBITYCKCAEQSI2AiQgBEEjNgIgIARB+AFqIARBsAFqIARBIGogAEECdGooAgARAQALIAQtAOgBIgBB/wFHBEAgBEEbNgJAIARBHDYCPCAEQR02AjggBEEeNgI0IARBHzYCMCAEQSA2AiwgBEEhNgIoIARBIjYCJCAEQSM2AiAgBEH4AWogBEHQAWogBEEgaiAAQQJ0aigCABEBAAsgBEGgAmokAA8LEDQACxA7AAsQLAAL9wEBB38gASgCECEAIAEoAggoAgAhAwJAIAEoAgQEQCAARQ0BIAEoAgAoAgAhBEEAIQEgAEEETwRAIABBfHEhCANAIAMgAUEDdCICaiACIARqKwMAmzkDACADIAJBCHIiBWogBCAFaisDAJs5AwAgAyACQRByIgVqIAQgBWorAwCbOQMAIAMgAkEYciICaiACIARqKwMAmzkDACABQQRqIQEgB0EEaiIHIAhHDQALCyAAQQNxIgBFDQEDQCADIAFBA3QiAmogAiAEaisDAJs5AwAgAUEBaiEBIAZBAWoiBiAARw0ACwwBCyAARQ0AIAMgAEEDdBAmGgsLDwAgAEHsxAA2AgAgABAiCw0AIABB7MQANgIAIAALBgBBmMcACxQAIABBBGpBACABKAIEQcjGAEYbC3YBAXwgAysDACEFIAQoAgAhAyACKAIAIQJBwAAQIyIBQezEADYCACABQgA3AgQgAUH0xQA2AhAgAUIANwMYIAEgAjYCFCABQgA3AyAgASADNgI4IAEgBTkDMCABQYCAgPwDNgIoIAAgATYCBCAAIAFBEGo2AgALCwAgAUGMwwA2AgALEQBBCBAjIgBBjMMANgIAIAAL6gUDCHwDfwJ+IAEoAhAhACABKAIIKAIAIQsCQCABKAIEBEAgAEUNASABKAIAKAIAIQxBACEBA0AgCyABQQN0IgpqAnwgCiAMaisDACICvUIwiKchCiACvSINQoCAgIDwlan3P31C/////5+VhAFYBEBEAAAAAAAAAAAgDUKAgICAgICA+D9RDQEaQbCdAysDACIEIAJEAAAAAAAA8L+gIgK9QoCAgIBwg78iBaIiBiACIAKiIgMgAkH4nQMrAwCiQfCdAysDAKCiIgegIgggAyADoiIJIAkgAyACQbieAysDAKJBsJ4DKwMAoKIgAkGongMrAwCiQaCeAysDAKCgoiADIAJBmJ4DKwMAokGQngMrAwCgoiACQYieAysDAKJBgJ4DKwMAoKCgoiACIAWhIASiIAJBuJ0DKwMAoqAgByAGIAihoKCgoAwBCwJAIApB8P8Ba0GfgH5NBEAgAr1C////////////AINQBEAjAEEQayIKRAAAAAAAAPC/OQMIIAorAwhEAAAAAAAAAACjDAMLIA1CgICAgICAgPj/AFENASAKQfD/AXFB8P8BRyAKQf//AU1xRQRAIAIgAqEiAiACowwDCyACRAAAAAAAADBDor1CgICAgICAgKADfSENCyANQoCAgICAgIDzP30iDkIuiKdBP3FBBHQiCkHIngNqKwMAIA5CNIent6AiBEGwnQMrAwAiBSAKQcCeA2orAwAgDSAOQoCAgICAgIB4g32/IApBwKYDaisDAKEgCkHIpgNqKwMAoaIiAr1CgICAgHCDvyIGoiIHoCIIIAIgAqIiAyADIAOiIAJB6J0DKwMAokHgnQMrAwCgoiADIAJB2J0DKwMAokHQnQMrAwCgoiACQcidAysDAKJBwJ0DKwMAoKCgoiACIAahIAWiQbidAysDACACoqAgByAEIAihoKCgoCECCyACCzkDACABQQFqIgEgAEcNAAsMAQsgAEUNACALIABBA3QQJhoLCw8AIABB0MAANgIAIAAQIgtjAQJ/IwBBEGsiAiQAIAEgACgCBCIDQQF1aiEBIAAoAgAhACACQQhqIAEgA0EBcQR/IAEoAgAgAGooAgAFIAALEQEAIAIoAgwiABAGIAIoAgwiAQRAIAEQAAsgAkEQaiQAIAALDQAgAEHQwAA2AgAgAAsGAEH8wgALFAAgAEEEakEAIAEoAgRBrMIARhsLdgEBfCADKwMAIQUgBCgCACEDIAIoAgAhAkHAABAjIgFB0MAANgIAIAFCADcCBCABQdjBADYCECABQgA3AxggASACNgIUIAFCADcDICABIAM2AjggASAFOQMwIAFBgICA/AM2AiggACABNgIEIAAgAUEQajYCAAsKACABQfA+NgIACxAAQQgQIyIAQfA+NgIAIAALzwQDB3wFfwF+IAEoAhAhACABKAIIKAIAIQsCQCABKAIEBEAgAEUNASABKAIAKAIAIQ1BACEBA0AgCyABQQN0IglqAnwCQAJAAkACQCAJIA1qKwMAIgK9Ig5CAFkEQCAOQiCIpyIJQf//P0sNAQtEAAAAAAAA8L8gAiACoqMgAr1C////////////AINQDQQaIA5CAFkNASACIAKhRAAAAAAAAAAAowwECyAJQf//v/8HSw0CQYCAwP8DIQpBgXghDCAJQYCAwP8DRwRA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IgNFDQAgAyADKAIEIgRBAWs2AgQgBA0AIAMgAygCACgCCBEAACADECULAkAgCigCVCIDRQ0AIAMgAygCBCIEQQFrNgIEIAQNACADIAMoAgAoAggRAAAgAxAlC0EADAILEEQAC0EDCyEDIAosAGNBAE4NACAKKAJYECILIApB8ABqJAAgAyEECyAEDQMLIBVBIGoiFSAYRw0ACwtBACEECyARQUBrJAAgCUFAa0ECOgAAIAlBBzoAIyAJQeELKAAANgIYIAlB5AsoAAA2ABsgCSAERToAKCAJQQA6AB8gCUEMaiECAn8CQAJAAkACQAJAAkACQAJAAkACQCAEDgkAAQIDBAUGBwgJCyACQc/WATsBACACQQI6AAsgAkECagwJCyACQSAQIyIDNgIAIAJCmICAgICEgICAfzcCBCADQZYTKQAANwAQIANBjhMpAAA3AAggA0GGEykAADcAACADQRhqDAgLIAJBEBAjIgM2AgAgAkKOgICAgIKAgIB/NwIEIANB7BIpAAA3AAYgA0HmEikAADcAACADQQ5qDAcLIAJBMBAjIgM2AgAgAkKvgICAgIaAgIB/NwIEIANBvAspAAA3ACcgA0G1CykAADcAICADQa0LKQAANwAYIANBpQspAAA3ABAgA0GdCykAADcACCADQZULKQAANwAAIANBL2oMBgsgAkHAABAjIgM2AgAgAkK0gICAgIiAgIB/NwIEIANBkAsoAAA2ADAgA0GICykAADcAKCADQYALKQAANwAgIANB+AopAAA3ABggA0HwCikAADcAECADQegKKQAANwAIIANB4AopAAA3AAAgA0E0agwFCyACQTAQIyIDNgIAIAJCroCAgICGgICAfzcCBCADQdAIKQAANwAmIANByggpAAA3ACAgA0HCCCkAADcAGCADQboIKQAANwAQIANBsggpAAA3AAggA0GqCCkAADcAACADQS5qDAQLIAJBMBAjIgM2AgAgAkKpgICAgIaAgIB/NwIEIANBqAgtAAA6ACggA0GgCCkAADcAICADQZgIKQAANwAYIANBkAgpAAA3ABAgA0GICCkAADcACCADQYAIKQAANwAAIANBKWoMAwsgAkEgECMiAzYCACACQpOAgICAhICAgH83AgQgA0GADigAADYADyADQfkNKQAANwAIIANB8Q0pAAA3AAAgA0ETagwCCyAC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cGUgZm9yIHRoZSBnaXZlbiBub2RlIHByb3BlcnR5AGJ1ZmZlciBtdXN0IGJlIGFuIEFycmF5PEZsb2F0MzJBcnJheT4gb3IgYSBGbG9hdDMyQXJyYXkAc2RlbGF5AG1heABwb3cAZm9sbG93AF9fbmV4dF9wcmltZSBvdmVyZmxvdwBibGVwc2F3AGVudgBkaXYAdGFwT3V0AGNvbnN0AHVuc2lnbmVkIHNob3J0AHVuc2lnbmVkIGludABldmVudABzaGlmdABmZnQAb2Zmc2V0AHN0YXJ0T2Zmc2V0AHN0b3BPZmZzZXQAcmVzZXQAT2JqZWN0AGZsb2F0AEludmFsaWQgaW5zdHJ1Y3Rpb24gZm9ybWF0AHVpbnQ2NF90AGtleXMAQXR0ZW1wdGluZyB0byBjcmVhdGUgYSBub2RlIHR5cGUgdGhhdCBhbHJlYWR5IGV4aXN0cwBBdHRlbXB0aW5nIHRvIGNyZWF0ZSBhIG5vZGUgdGhhdCBhbHJlYWR5IGV4aXN0cwBwcm9jZXNzUXVldWVkRXZlbnRzAHByb2Nlc3MAc3VjY2VzcwBiYWRfdmFyaWFudF9hY2Nlc3MAbG93cGFzcwBhbGxwYXNzAGNvcwBsaXN0U2hhcmVkUmVzb3VyY2VzAHBydW5lU2hhcmVkUmVzb3VyY2VzAGFicwBmYWRlT3V0TXMAc2V0Q3VycmVudFRpbWVNcwB2ZWN0b3IARWxlbWVudGFyeUF1ZGlvUHJvY2Vzc29yAHNwaGFzb3IAZmxvb3IAY291bnRlcgBtZXRlcgB0cmlnZ2VyAHVuc2lnbmVkIGNoYXIAc3BhcnNlcQBtYy5zYW1wbGVzZXEAbGVxAGdlcQBleHAAcHJld2FycABtZXRybwBzdGQ6OmV4Y2VwdGlvbgBGdW5jdGlvbgBJbnZhcmlhbnQgdmlvbGF0aW9uAHNpbgBtaW4AX2ludGVybmFsOm51bUNoaWxkcmVuAHRhbgB0YXBJbgBhY2N1bQBhcm0AZnJvbQAvZGV2L3VyYW5kb20AbXVsAGJvb2wAc3RkOjpiYWRfZnVuY3Rpb25fY2FsbABjaGFubmVsAHRpY2tJbnRlcnZhbAByZWFsAE9rAGJhZF9hcnJheV9uZXdfbGVuZ3RoAGFzaW5oAG5vdGNoAHN0cmV0Y2gAbGF0Y2gATWFsZm9ybWVkIG1lc3NhZ2UgYmF0Y2gAcG9zdE1lc3NhZ2VCYXRjaABsb2cAdW5zaWduZWQgbG9uZwBzdGQ6OndzdHJpbmcAYmFzaWNfc3RyaW5nAHN0ZDo6c3RyaW5nAHN0ZDo6dTE2c3RyaW5nAHN0ZDo6dTMyc3RyaW5nAGltYWcAc3ZmAGhpZ2hzaGVsZgBhY3RpdmUAdmFsdWUAaW50ZXJwb2xhdGUAcGxheWJhY2tSYXRlAG1jLmNhcHR1cmUAYmxlcHNxdWFyZQBwcmVwYXJlAG5hbWUgbXVzdCBiZSBhIHN0cmluZyB0eXBlAHNjb3BlAHNldEN1cnJlbnRUaW1lAG1jLnNhbXBsZQBibGVwdHJpYW5nbGUAZG91YmxlAHRhYmxlAG1lc3NhZ2UAY2Fubm90IG92ZXJ3cml0ZSBleGlzdGluZyBzaGFyZWQgcmVzb3VyY2UAYWRkU2hhcmVkUmVzb3VyY2UAbW9kAHJvdW5kAHVub3JkZXJlZF9tYXA6OmF0OiBrZXkgbm90IGZvdW5kAG1hcDo6YXQ6ICBrZXkgbm90IGZvdW5kAE5vZGUgbm90IGZvdW5kAGFuZABtYXhob2xkAHZvaWQATm9kZSB0eXBlIG5vdCByZWNvZ25pemVkAFJldHVybiBjb2RlIG5vdCByZWNvZ25pemVkAHJhbmRvbV9kZXZpY2UgZ2V0ZW50cm9weSBmYWlsZWQAYWRkAGJpcXVhZABzdGQ6OmJhZF9hbGxvYwBnYwBzdWIAZGF0YQBnZXRPdXRwdXRCdWZmZXJEYXRhAGdldElucHV0QnVmZmVyRGF0YQBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxzaG9ydD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dW5zaWduZWQgc2hvcnQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGludD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dW5zaWduZWQgaW50PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxmbG9hdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dWludDhfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8aW50OF90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1aW50MTZfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8aW50MTZfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dWludDY0X3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGludDY0X3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVpbnQzMl90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxpbnQzMl90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxjaGFyPgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1bnNpZ25lZCBjaGFyPgBzdGQ6OmJhc2ljX3N0cmluZzx1bnNpZ25lZCBjaGFyPgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxzaWduZWQgY2hhcj4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8bG9uZz4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dW5zaWduZWQgbG9uZz4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8ZG91YmxlPgBtYy5zYW1wbGVzZXEyAFB1cmUgdmlydHVhbCBmdW5jdGlvbiBjYWxsZWQhAHJhbmRvbSBkZXZpY2Ugbm90IHN1cHBvcnRlZCAAMjRFbGVtZW50YXJ5QXVkaW9Qcm9jZXNzb3IAAAC8/AAAEw0AAFAyNEVsZW1lbnRhcnlBdWRpb1Byb2Nlc3NvcgCc/QAAOA0AAAAAAAAwDQAAUEsyNEVsZW1lbnRhcnlBdWRpb1Byb2Nlc3NvcgAAAACc/QAAZA0AAAEAAAAwDQAAaWkAdgB2aQBUDQAAWPwAAFj8AABpaWlpAAAAAPj7AABUDQAArPwAAGT8AAB2aWlkaQAAAAAAAAA4DgAATwAAAFAAAABRAAAAUgAAAFMAAABOU3QzX18yMjBfX3NoYXJlZF9wdHJfZW1wbGFjZUlONGVsZW0xOUdyYXBoUmVuZGVyU2VxdWVuY2VJZEVFTlNfOWFsbG9jYXRvcklTM19FRUVFAADk/AAA5A0AACT6AAAAAAAAWA8AAFQAAABVAAAAVgAAAFcAAABYAAAAWQAAAFoAAABbAAAAXAAAAE5TdDNfXzIxMF9fZnVuY3Rpb242X19mdW5jSU40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOUzJfMTJJZGVudGl0eU5vZGVJZEVFRUVOU185YWxsb2NhdG9ySVM3X0VFRk5TXzEwc2hhcmVkX3B0cklOUzJfOUdyYXBoTm9kZUlkRUVFRWlkaUVFRQBOU3QzX18yMTBfX2Z1bmN0aW9uNl9fYmFzZUlGTlNfMTBzaGFyZWRfcHRySU40ZWxlbTlHcmFwaE5vZGVJZEVFRUVpZGlFRUUAAAAAvPwAAAQPAADk/AAAcA4AAFAPAEHsHguL7QLQDwAAXQAAAF4AAABfAAAAUgAAAGAAAABOU3QzX18yMjBfX3NoYXJlZF9wdHJfZW1wbGFjZUlONGVsZW0xMklkZW50aXR5Tm9kZUlkRUVOU185YWxsb2NhdG9ySVMzX0VFRUUA5PwAAIQPAAAk+gAAAAAAADgQAABhAAAAYgAAAGMAAABkAAAAZQAAAGYAAABnAAAATjRlbGVtMTJJZGVudGl0eU5vZGVJZEVFAE40ZWxlbTlHcmFwaE5vZGVJZEVFAAAAvPwAABkQAADk/AAAABAAADAQAAAAAAAAMBAAAGEAAABoAAAAaQAAAGQAAABqAAAAZgAAAGcAAABONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlNfMTJJZGVudGl0eU5vZGVJZEVFRUUAAAC8/AAAaBAAAAAAAACAEQAAVAAAAGsAAABsAAAAbQAAAG4AAABvAAAAcAAAAHEAAAByAAAATlN0M19fMjEwX19mdW5jdGlvbjZfX2Z1bmNJTjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TMl8xOFVuYXJ5T3BlcmF0aW9uTm9kZUlkWGFkTF9aM3NpbkVFRUVFRU5TXzlhbGxvY2F0b3JJUzdfRUVGTlNfMTBzaGFyZWRfcHRySU5TMl85R3JhcGhOb2RlSWRFRUVFaWRpRUVFAAAA5PwAANgQAABQDwAAAAAAAAgSAABzAAAAdAAAAHUAAABSAAAAdgAAAE5TdDNfXzIyMF9fc2hhcmVkX3B0cl9lbXBsYWNlSU40ZWxlbTE4VW5hcnlPcGVyYXRpb25Ob2RlSWRYYWRMX1ozc2luRUVFRU5TXzlhbGxvY2F0b3JJUzNfRUVFRQAAAOT8AACoEQAAJPoAAAAAAABkEgAAYQAAAHcAAABpAAAAZAAAAHgAAABmAAAAZwAAAE40ZWxlbTE4VW5hcnlPcGVyYXRpb25Ob2RlSWRYYWRMX1ozc2luRUVFRQAA5PwAADgSAAAwEAAATjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TXzE4VW5hcnlPcGVyYXRpb25Ob2RlSWRYYWRMX1ozc2luRUVFRUVFALz8AABwEgAAAAAAAJgTAABUAAAAeQAAAHoAAAB7AAAAfAAAAH0AAAB+AAAAfwAAAIAAAABOU3QzX18yMTBfX2Z1bmN0aW9uNl9fZnVuY0lONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlMyXzE4VW5hcnlPcGVyYXRpb25Ob2RlSWRYYWRMX1ozY29zRUVFRUVFTlNfOWFsbG9jYXRvcklTN19FRUZOU18xMHNoYXJlZF9wdHJJTlMyXzlHcmFwaE5vZGVJZEVFRUVpZGlFRUUAAADk/AAA8BIAAFAPAAAAAAAAIBQAAIEAAACCAAAAgwAAAFIAAACEAAAATlN0M19fMjIwX19zaGFyZWRfcHRyX2VtcGxhY2VJTjRlbGVtMThVbmFyeU9wZXJhdGlvbk5vZGVJZFhhZExfWjNjb3NFRUVFTlNfOWFsbG9jYXRvcklTM19FRUVFAAAA5PwAAMATAAAk+gAAAAAAAHwUAABhAAAAhQAAAGkAAABkAAAAhgAAAGYAAABnAAAATjRlbGVtMThVbmFyeU9wZXJhdGlvbk5vZGVJZFhhZExfWjNjb3NFRUVFAADk/AAAUBQAADAQAABONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlNfMThVbmFyeU9wZXJhdGlvbk5vZGVJZFhhZExfWjNjb3NFRUVFRUUAvPwAAIgUAAAAAAAAsBUAAFQAAACHAAAAiAAAAIkAAACKAAAAiwAAAIwAAACNAAAAjgAAAE5TdDNfXzIxMF9fZnVuY3Rpb242X19mdW5jSU40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOUzJfMThVbmFyeU9wZXJhdGlvbk5vZGVJZFhhZExfWjN0YW5FRUVFRUVOU185YWxsb2NhdG9ySVM3X0VFRk5TXzEwc2hhcmVkX3B0cklOUzJfOUdyYXBoTm9kZUlkRUVFRWlkaUVFRQAAAOT8AAAIFQAAUA8AAAAAAAA4FgAAjwAAAJAAAACRAAAAUgAAAJIAAABOU3QzX18yMjBfX3NoYXJlZF9wdHJfZW1wbGFjZUlONGVsZW0xOFVuYXJ5T3BlcmF0aW9uTm9kZUlkWGFkTF9aM3RhbkVFRUVOU185YWxsb2NhdG9ySVMzX0VFRUUAAADk/AAA2BUAACT6AAAAAAAAlBYAAGEAAACTAAAAaQAAAGQAAACUAAAAZgAAAGcAAABONGVsZW0xOFVuYXJ5T3BlcmF0aW9uTm9kZUlkWGFkTF9aM3RhbkVFRUUAAOT8AABoFgAAMBAAAE40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOU18xOFVuYXJ5T3BlcmF0aW9uTm9kZUlkWGFkTF9aM3RhbkVFRUVFRQC8/AAAoBYAAAAAAADIFwAAVAAAAJUAAACWAAAAlwAAAJgAAACZAAAAmgAAAJsAAACcAAAATlN0M19fMjEwX19mdW5jdGlvbjZfX2Z1bmNJTjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TMl8xOFVuYXJ5T3BlcmF0aW9uTm9kZUlkWGFkTF9aNHRhbmhFRUVFRUVOU185YWxsb2NhdG9ySVM3X0VFRk5TXzEwc2hhcmVkX3B0cklOUzJfOUdyYXBoTm9kZUlkRUVFRWlkaUVFRQAA5PwAACAXAABQDwAAAAAAAFAYAACdAAAAngAAAJ8AAABSAAAAoAAAAE5TdDNfXzIyMF9fc2hhcmVkX3B0cl9lbXBsYWNlSU40ZWxlbTE4VW5hcnlPcGVyYXRpb25Ob2RlSWRYYWRMX1o0dGFuaEVFRUVOU185YWxsb2NhdG9ySVMzX0VFRUUAAOT8AADwFwAAJPoAAAAAAACsGAAAYQAAAKEAAABpAAAAZAAAAKIAAABmAAAAZwAAAE40ZWxlbTE4VW5hcnlPcGVyYXRpb25Ob2RlSWRYYWRMX1o0dGFuaEVFRUUA5PwAAIAYAAAwEAAATjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TXzE4VW5hcnlPcGVyYXRpb25Ob2RlSWRYYWRMX1o0dGFuaEVFRUVFRQAAAAC8/AAAuBgAAAAAAADkGQAAVAAAAKMAAACkAAAApQAAAKYAAACnAAAAqAAAAKkAAACqAAAATlN0M19fMjEwX19mdW5jdGlvbjZfX2Z1bmNJTjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TMl8xOFVuYXJ5T3BlcmF0aW9uTm9kZUlkWGFkTF9aNWFzaW5oRUVFRUVFTlNfOWFsbG9jYXRvcklTN19FRUZOU18xMHNoYXJlZF9wdHJJTlMyXzlHcmFwaE5vZGVJZEVFRUVpZGlFRUUA5PwAADwZAABQDwAAAAAAAGwaAACrAAAArAAAAK0AAABSAAAArgAAAE5TdDNfXzIyMF9fc2hhcmVkX3B0cl9lbXBsYWNlSU40ZWxlbTE4VW5hcnlPcGVyYXRpb25Ob2RlSWRYYWRMX1o1YXNpbmhFRUVFTlNfOWFsbG9jYXRvcklTM19FRUVFAOT8AAAMGgAAJPoAAAAAAADMGgAAYQAAAK8AAABpAAAAZAAAALAAAABmAAAAZwAAAE40ZWxlbTE4VW5hcnlPcGVyYXRpb25Ob2RlSWRYYWRMX1o1YXNpbmhFRUVFAAAAAOT8AACcGgAAMBAAAE40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOU18xOFVuYXJ5T3BlcmF0aW9uTm9kZUlkWGFkTF9aNWFzaW5oRUVFRUVFAAAAvPwAANgaAAAAAAAABBwAAFQAAACxAAAAsgAAALMAAAC0AAAAtQAAALYAAAC3AAAAuAAAAE5TdDNfXzIxMF9fZnVuY3Rpb242X19mdW5jSU40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOUzJfMThVbmFyeU9wZXJhdGlvbk5vZGVJZFhhZExfWjNsb2dFRUVFRUVOU185YWxsb2NhdG9ySVM3X0VFRk5TXzEwc2hhcmVkX3B0cklOUzJfOUdyYXBoTm9kZUlkRUVFRWlkaUVFRQAAAOT8AABcGwAAUA8AAAAAAACMHAAAuQAAALoAAAC7AAAAUgAAALwAAABOU3QzX18yMjBfX3NoYXJlZF9wdHJfZW1wbGFjZUlONGVsZW0xOFVuYXJ5T3BlcmF0aW9uTm9kZUlkWGFkTF9aM2xvZ0VFRUVOU185YWxsb2NhdG9ySVMzX0VFRUUAAADk/AAALBwAACT6AAAAAAAA6BwAAGEAAAC9AAAAaQAAAGQAAAC+AAAAZgAAAGcAAABONGVsZW0xOFVuYXJ5T3BlcmF0aW9uTm9kZUlkWGFkTF9aM2xvZ0VFRUUAAOT8AAC8HAAAMBAAAE40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOU18xOFVuYXJ5T3BlcmF0aW9uTm9kZUlkWGFkTF9aM2xvZ0VFRUVFRQC8/AAA9BwAAAAAAAAcHgAAVAAAAL8AAADAAAAAwQAAAMIAAADDAAAAxAAAAMUAAADGAAAATlN0M19fMjEwX19mdW5jdGlvbjZfX2Z1bmNJTjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TMl8xOFVuYXJ5T3BlcmF0aW9uTm9kZUlkWGFkTF9aNWxvZzEwRUVFRUVFTlNfOWFsbG9jYXRvcklTN19FRUZOU18xMHNoYXJlZF9wdHJJTlMyXzlHcmFwaE5vZGVJZEVFRUVpZGlFRUUA5PwAAHQdAABQDwAAAAAAAKQeAADHAAAAyAAAAMkAAABSAAAAygAAAE5TdDNfXzIyMF9fc2hhcmVkX3B0cl9lbXBsYWNlSU40ZWxlbTE4VW5hcnlPcGVyYXRpb25Ob2RlSWRYYWRMX1o1bG9nMTBFRUVFTlNfOWFsbG9jYXRvcklTM19FRUVFAOT8AABEHgAAJPoAAAAAAAAEHwAAYQAAAMsAAABpAAAAZAAAAMwAAABmAAAAZwAAAE40ZWxlbTE4VW5hcnlPcGVyYXRpb25Ob2RlSWRYYWRMX1o1bG9nMTBFRUVFAAAAAOT8AADUHgAAMBAAAE40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOU18xOFVuYXJ5T3BlcmF0aW9uTm9kZUlkWGFkTF9aNWxvZzEwRUVFRUVFAAAAvPwAABAfAAAAAAAAPCAAAFQAAADNAAAAzgAAAM8AAADQAAAA0QAAANIAAADTAAAA1AAAAE5TdDNfXzIxMF9fZnVuY3Rpb242X19mdW5jSU40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOUzJfMThVbmFyeU9wZXJhdGlvbk5vZGVJZFhhZExfWjRsb2cyRUVFRUVFTlNfOWFsbG9jYXRvcklTN19FRUZOU18xMHNoYXJlZF9wdHJJTlMyXzlHcmFwaE5vZGVJZEVFRUVpZGlFRUUAAOT8AACUHwAAUA8AAAAAAADEIAAA1QAAANYAAADXAAAAUgAAANgAAABOU3QzX18yMjBfX3NoYXJlZF9wdHJfZW1wbGFjZUlONGVsZW0xOFVuYXJ5T3BlcmF0aW9uTm9kZUlkWGFkTF9aNGxvZzJFRUVFTlNfOWFsbG9jYXRvcklTM19FRUVFAADk/AAAZCAAACT6AAAAAAAAICEAAGEAAADZAAAAaQAAAGQAAADaAAAAZgAAAGcAAABONGVsZW0xOFVuYXJ5T3BlcmF0aW9uTm9kZUlkWGFkTF9aNGxvZzJFRUVFAOT8AAD0IAAAMBAAAE40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOU18xOFVuYXJ5T3BlcmF0aW9uTm9kZUlkWGFkTF9aNGxvZzJFRUVFRUUAAAAAvPwAACwhAAAAAAAAWCIAAFQAAADbAAAA3AAAAN0AAADeAAAA3wAAAOAAAADhAAAA4gAAAE5TdDNfXzIxMF9fZnVuY3Rpb242X19mdW5jSU40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOUzJfMThVbmFyeU9wZXJhdGlvbk5vZGVJZFhhZExfWjRjZWlsRUVFRUVFTlNfOWFsbG9jYXRvcklTN19FRUZOU18xMHNoYXJlZF9wdHJJTlMyXzlHcmFwaE5vZGVJZEVFRUVpZGlFRUUAAOT8AACwIQAAUA8AAAAAAADgIgAA4wAAAOQAAADlAAAAUgAAAOYAAABOU3QzX18yMjBfX3NoYXJlZF9wdHJfZW1wbGFjZUlONGVsZW0xOFVuYXJ5T3BlcmF0aW9uTm9kZUlkWGFkTF9aNGNlaWxFRUVFTlNfOWFsbG9jYXRvcklTM19FRUVFAADk/AAAgCIAACT6AAAAAAAAPCMAAGEAAADnAAAAaQAAAGQAAADoAAAAZgAAAGcAAABONGVsZW0xOFVuYXJ5T3BlcmF0aW9uTm9kZUlkWGFkTF9aNGNlaWxFRUVFAOT8AAAQIwAAMBAAAE40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOU18xOFVuYXJ5T3BlcmF0aW9uTm9kZUlkWGFkTF9aNGNlaWxFRUVFRUUAAAAAvPwAAEgjAAAAAAAAdCQAAFQAAADpAAAA6gAAAOsAAADsAAAA7QAAAO4AAADvAAAA8AAAAE5TdDNfXzIxMF9fZnVuY3Rpb242X19mdW5jSU40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOUzJfMThVbmFyeU9wZXJhdGlvbk5vZGVJZFhhZExfWjVmbG9vckVFRUVFRU5TXzlhbGxvY2F0b3JJUzdfRUVGTlNfMTBzaGFyZWRfcHRySU5TMl85R3JhcGhOb2RlSWRFRUVFaWRpRUVFAOT8AADMIwAAUA8AAAAAAAD8JAAA8QAAAPIAAADzAAAAUgAAAPQAAABOU3QzX18yMjBfX3NoYXJlZF9wdHJfZW1wbGFjZUlONGVsZW0xOFVuYXJ5T3BlcmF0aW9uTm9kZUlkWGFkTF9aNWZsb29yRUVFRU5TXzlhbGxvY2F0b3JJUzNfRUVFRQDk/AAAnCQAACT6AAAAAAAAXCUAAGEAAAD1AAAAaQAAAGQAAAD2AAAAZgAAAGcAAABONGVsZW0xOFVuYXJ5T3BlcmF0aW9uTm9kZUlkWGFkTF9aNWZsb29yRUVFRQAAAADk/AAALCUAADAQAABONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlNfMThVbmFyeU9wZXJhdGlvbk5vZGVJZFhhZExfWjVmbG9vckVFRUVFRQAAALz8AABoJQAAAAAAAJQmAABUAAAA9wAAAPgAAAD5AAAA+gAAAPsAAAD8AAAA/QAAAP4AAABOU3QzX18yMTBfX2Z1bmN0aW9uNl9fZnVuY0lONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlMyXzE4VW5hcnlPcGVyYXRpb25Ob2RlSWRYYWRMX1o1cm91bmRFRUVFRUVOU185YWxsb2NhdG9ySVM3X0VFRk5TXzEwc2hhcmVkX3B0cklOUzJfOUdyYXBoTm9kZUlkRUVFRWlkaUVFRQDk/AAA7CUAAFAPAAAAAAAAHCcAAP8AAAAAAQAAAQEAAFIAAAACAQAATlN0M19fMjIwX19zaGFyZWRfcHRyX2VtcGxhY2VJTjRlbGVtMThVbmFyeU9wZXJhdGlvbk5vZGVJZFhhZExfWjVyb3VuZEVFRUVOU185YWxsb2NhdG9ySVMzX0VFRUUA5PwAALwmAAAk+gAAAAAAAHwnAABhAAAAAwEAAGkAAABkAAAABAEAAGYAAABnAAAATjRlbGVtMThVbmFyeU9wZXJhdGlvbk5vZGVJZFhhZExfWjVyb3VuZEVFRUUAAAAA5PwAAEwnAAAwEAAATjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TXzE4VW5hcnlPcGVyYXRpb25Ob2RlSWRYYWRMX1o1cm91bmRFRUVFRUUAAAC8/AAAiCcAAAAAAAC0KAAAVAAAAAUBAAAGAQAABwEAAAgBAAAJAQAACgEAAAsBAAAMAQAATlN0M19fMjEwX19mdW5jdGlvbjZfX2Z1bmNJTjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TMl8xOFVuYXJ5T3BlcmF0aW9uTm9kZUlkWGFkTF9aNHNxcnRFRUVFRUVOU185YWxsb2NhdG9ySVM3X0VFRk5TXzEwc2hhcmVkX3B0cklOUzJfOUdyYXBoTm9kZUlkRUVFRWlkaUVFRQAA5PwAAAwoAABQDwAAAAAAADwpAAANAQAADgEAAA8BAABSAAAAEAEAAE5TdDNfXzIyMF9fc2hhcmVkX3B0cl9lbXBsYWNlSU40ZWxlbTE4VW5hcnlPcGVyYXRpb25Ob2RlSWRYYWRMX1o0c3FydEVFRUVOU185YWxsb2NhdG9ySVMzX0VFRUUAAOT8AADcKAAAJPoAAAAAAACYKQAAYQAAABEBAABpAAAAZAAAABIBAABmAAAAZwAAAE40ZWxlbTE4VW5hcnlPcGVyYXRpb25Ob2RlSWRYYWRMX1o0c3FydEVFRUUA5PwAAGwpAAAwEAAATjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TXzE4VW5hcnlPcGVyYXRpb25Ob2RlSWRYYWRMX1o0c3FydEVFRUVFRQAAAAC8/AAApCkAAAAAAADQKgAAVAAAABMBAAAUAQAAFQEAABYBAAAXAQAAGAEAABkBAAAaAQAATlN0M19fMjEwX19mdW5jdGlvbjZfX2Z1bmNJTjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TMl8xOFVuYXJ5T3BlcmF0aW9uTm9kZUlkWGFkTF9aM2V4cEVFRUVFRU5TXzlhbGxvY2F0b3JJUzdfRUVGTlNfMTBzaGFyZWRfcHRySU5TMl85R3JhcGhOb2RlSWRFRUVFaWRpRUVFAAAA5PwAACgqAABQDwAAAAAAAFgrAAAbAQAAHAEAAB0BAABSAAAAHgEAAE5TdDNfXzIyMF9fc2hhcmVkX3B0cl9lbXBsYWNlSU40ZWxlbTE4VW5hcnlPcGVyYXRpb25Ob2RlSWRYYWRMX1ozZXhwRUVFRU5TXzlhbGxvY2F0b3JJUzNfRUVFRQAAAOT8AAD4KgAAJPoAAAAAAAC0KwAAYQAAAB8BAABpAAAAZAAAACABAABmAAAAZwAAAE40ZWxlbTE4VW5hcnlPcGVyYXRpb25Ob2RlSWRYYWRMX1ozZXhwRUVFRQAA5PwAAIgrAAAwEAAATjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TXzE4VW5hcnlPcGVyYXRpb25Ob2RlSWRYYWRMX1ozZXhwRUVFRUVFALz8AADAKwAAAAAAAPQsAABUAAAAIQEAACIBAAAjAQAAJAEAACUBAAAmAQAAJwEAACgBAABOU3QzX18yMTBfX2Z1bmN0aW9uNl9fZnVuY0lONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlMyXzE4VW5hcnlPcGVyYXRpb25Ob2RlSWRYYWRMX1ozYWJzQjh1ZTE3MDAwNGRFRUVFRUVOU185YWxsb2NhdG9ySVM3X0VFRk5TXzEwc2hhcmVkX3B0cklOUzJfOUdyYXBoTm9kZUlkRUVFRWlkaUVFRQAAAADk/AAAQCwAAFAPAAAAAAAAiC0AACkBAAAqAQAAKwEAAFIAAAAsAQAATlN0M19fMjIwX19zaGFyZWRfcHRyX2VtcGxhY2VJTjRlbGVtMThVbmFyeU9wZXJhdGlvbk5vZGVJZFhhZExfWjNhYnNCOHVlMTcwMDA0ZEVFRUVOU185YWxsb2NhdG9ySVMzX0VFRUUAAAAA5PwAABwtAAAk+gAAAAAAAPAtAABhAAAALQEAAGkAAABkAAAALgEAAGYAAABnAAAATjRlbGVtMThVbmFyeU9wZXJhdGlvbk5vZGVJZFhhZExfWjNhYnNCOHVlMTcwMDA0ZEVFRUUAAADk/AAAuC0AADAQAABONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlNfMThVbmFyeU9wZXJhdGlvbk5vZGVJZFhhZExfWjNhYnNCOHVlMTcwMDA0ZEVFRUVFRQAAvPwAAPwtAAAAAAAAMC8AAFQAAAAvAQAAMAEAADEBAAAyAQAAMwEAADQBAAA1AQAANgEAAE5TdDNfXzIxMF9fZnVuY3Rpb242X19mdW5jSU40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOUzJfMTlCaW5hcnlPcGVyYXRpb25Ob2RlSWROU180bGVzc0lkRUVFRUVFTlNfOWFsbG9jYXRvcklTOV9FRUZOU18xMHNoYXJlZF9wdHJJTlMyXzlHcmFwaE5vZGVJZEVFRUVpZGlFRUUAAOT8AACILgAAUA8AAAAAAAC4LwAANwEAADgBAAA5AQAAUgAAADoBAABOU3QzX18yMjBfX3NoYXJlZF9wdHJfZW1wbGFjZUlONGVsZW0xOUJpbmFyeU9wZXJhdGlvbk5vZGVJZE5TXzRsZXNzSWRFRUVFTlNfOWFsbG9jYXRvcklTNV9FRUVFAADk/AAAWC8AACT6AAAAAAAAGDAAAGEAAAA7AQAAaQAAAGQAAAA8AQAAZgAAAGcAAABONGVsZW0xOUJpbmFyeU9wZXJhdGlvbk5vZGVJZE5TdDNfXzI0bGVzc0lkRUVFRQDk/AAA6C8AADAQAABONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlNfMTlCaW5hcnlPcGVyYXRpb25Ob2RlSWROU3QzX18yNGxlc3NJZEVFRUVFRQAAAAC8/AAAJDAAAAAAAABcMQAAVAAAAD0BAAA+AQAAPwEAAEABAABBAQAAQgEAAEMBAABEAQAATlN0M19fMjEwX19mdW5jdGlvbjZfX2Z1bmNJTjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TMl8xOUJpbmFyeU9wZXJhdGlvbk5vZGVJZE5TXzEwbGVzc19lcXVhbElkRUVFRUVFTlNfOWFsbG9jYXRvcklTOV9FRUZOU18xMHNoYXJlZF9wdHJJTlMyXzlHcmFwaE5vZGVJZEVFRUVpZGlFRUUAAADk/AAArDAAAFAPAAAAAAAA7DEAAEUBAABGAQAARwEAAFIAAABIAQAATlN0M19fMjIwX19zaGFyZWRfcHRyX2VtcGxhY2VJTjRlbGVtMTlCaW5hcnlPcGVyYXRpb25Ob2RlSWROU18xMGxlc3NfZXF1YWxJZEVFRUVOU185YWxsb2NhdG9ySVM1X0VFRUUAAADk/AAAhDEAACT6AAAAAAAAVDIAAGEAAABJAQAAaQAAAGQAAABKAQAAZgAAAGcAAABONGVsZW0xOUJpbmFyeU9wZXJhdGlvbk5vZGVJZE5TdDNfXzIxMGxlc3NfZXF1YWxJZEVFRUUAAOT8AAAcMgAAMBAAAE40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOU18xOUJpbmFyeU9wZXJhdGlvbk5vZGVJZE5TdDNfXzIxMGxlc3NfZXF1YWxJZEVFRUVFRQC8/AAAYDIAAAAAAACYMwAAVAAAAEsBAABMAQAATQEAAE4BAABPAQAAUAEAAFEBAABSAQAATlN0M19fMjEwX19mdW5jdGlvbjZfX2Z1bmNJTjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TMl8xOUJpbmFyeU9wZXJhdGlvbk5vZGVJZE5TXzdncmVhdGVySWRFRUVFRUVOU185YWxsb2NhdG9ySVM5X0VFRk5TXzEwc2hhcmVkX3B0cklOUzJfOUdyYXBoTm9kZUlkRUVFRWlkaUVFRQAAAOT8AADsMgAAUA8AAAAAAAAkNAAAUwEAAFQBAABVAQAAUgAAAFYBAABOU3QzX18yMjBfX3NoYXJlZF9wdHJfZW1wbGFjZUlONGVsZW0xOUJpbmFyeU9wZXJhdGlvbk5vZGVJZE5TXzdncmVhdGVySWRFRUVFTlNfOWFsbG9jYXRvcklTNV9FRUVFAAAA5PwAAMAzAAAk+gAAAAAAAIg0AABhAAAAVwEAAGkAAABkAAAAWAEAAGYAAABnAAAATjRlbGVtMTlCaW5hcnlPcGVyYXRpb25Ob2RlSWROU3QzX18yN2dyZWF0ZXJJZEVFRUUAAOT8AABUNAAAMBAAAE40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOU18xOUJpbmFyeU9wZXJhdGlvbk5vZGVJZE5TdDNfXzI3Z3JlYXRlcklkRUVFRUVFALz8AACUNAAAAAAAANA1AABUAAAAWQEAAFoBAABbAQAAXAEAAF0BAABeAQAAXwEAAGABAABOU3QzX18yMTBfX2Z1bmN0aW9uNl9fZnVuY0lONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlMyXzE5QmluYXJ5T3BlcmF0aW9uTm9kZUlkTlNfMTNncmVhdGVyX2VxdWFsSWRFRUVFRUVOU185YWxsb2NhdG9ySVM5X0VFRk5TXzEwc2hhcmVkX3B0cklOUzJfOUdyYXBoTm9kZUlkRUVFRWlkaUVFRQAAAADk/AAAHDUAAFAPAAAAAAAAZDYAAGEBAABiAQAAYwEAAFIAAABkAQAATlN0M19fMjIwX19zaGFyZWRfcHRyX2VtcGxhY2VJTjRlbGVtMTlCaW5hcnlPcGVyYXRpb25Ob2RlSWROU18xM2dyZWF0ZXJfZXF1YWxJZEVFRUVOU185YWxsb2NhdG9ySVM1X0VFRUUAAAAA5PwAAPg1AAAk+gAAAAAAANA2AABhAAAAZQEAAGkAAABkAAAAZgEAAGYAAABnAAAATjRlbGVtMTlCaW5hcnlPcGVyYXRpb25Ob2RlSWROU3QzX18yMTNncmVhdGVyX2VxdWFsSWRFRUVFAAAA5PwAAJQ2AAAwEAAATjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TXzE5QmluYXJ5T3BlcmF0aW9uTm9kZUlkTlN0M19fMjEzZ3JlYXRlcl9lcXVhbElkRUVFRUVFAAC8/AAA3DYAAAAAAAAYOAAAVAAAAGcBAABoAQAAaQEAAGoBAABrAQAAbAEAAG0BAABuAQAATlN0M19fMjEwX19mdW5jdGlvbjZfX2Z1bmNJTjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TMl8xOUJpbmFyeU9wZXJhdGlvbk5vZGVJZE5TMl83U2FmZVBvd0lkRUVFRUVFTlNfOWFsbG9jYXRvcklTOV9FRUZOU18xMHNoYXJlZF9wdHJJTlMyXzlHcmFwaE5vZGVJZEVFRUVpZGlFRUUAAOT8AABsNwAAUA8AAAAAAACkOAAAbwEAAHABAABxAQAAUgAAAHIBAABOU3QzX18yMjBfX3NoYXJlZF9wdHJfZW1wbGFjZUlONGVsZW0xOUJpbmFyeU9wZXJhdGlvbk5vZGVJZE5TMV83U2FmZVBvd0lkRUVFRU5TXzlhbGxvY2F0b3JJUzVfRUVFRQAA5PwAAEA4AAAk+gAAAAAAAAQ5AABhAAAAcwEAAGkAAABkAAAAdAEAAGYAAABnAAAATjRlbGVtMTlCaW5hcnlPcGVyYXRpb25Ob2RlSWROU183U2FmZVBvd0lkRUVFRQAA5PwAANQ4AAAwEAAATjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TXzE5QmluYXJ5T3BlcmF0aW9uTm9kZUlkTlNfN1NhZmVQb3dJZEVFRUVFRQC8/AAAEDkAAAAAAAA8OgAAVAAAAHUBAAB2AQAAdwEAAHgBAAB5AQAAegEAAHsBAAB8AQAATlN0M19fMjEwX19mdW5jdGlvbjZfX2Z1bmNJTjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TMl8xOUJpbmFyeU9wZXJhdGlvbk5vZGVJZE5TMl8yRXFJZEVFRUVFRU5TXzlhbGxvY2F0b3JJUzlfRUVGTlNfMTBzaGFyZWRfcHRySU5TMl85R3JhcGhOb2RlSWRFRUVFaWRpRUVFAAAA5PwAAJQ5AABQDwAAAAAAAMQ6AAB9AQAAfgEAAH8BAABSAAAAgAEAAE5TdDNfXzIyMF9fc2hhcmVkX3B0cl9lbXBsYWNlSU40ZWxlbTE5QmluYXJ5T3BlcmF0aW9uTm9kZUlkTlMxXzJFcUlkRUVFRU5TXzlhbGxvY2F0b3JJUzVfRUVFRQAAAOT8AABkOgAAJPoAAAAAAAAgOwAAYQAAAIEBAABpAAAAZAAAAIIBAABmAAAAZwAAAE40ZWxlbTE5QmluYXJ5T3BlcmF0aW9uTm9kZUlkTlNfMkVxSWRFRUVFAAAA5PwAAPQ6AAAwEAAATjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TXzE5QmluYXJ5T3BlcmF0aW9uTm9kZUlkTlNfMkVxSWRFRUVFRUUAALz8AAAsOwAAAAAAAFw8AABUAAAAgwEAAIQBAACFAQAAhgEAAIcBAACIAQAAiQEAAIoBAABOU3QzX18yMTBfX2Z1bmN0aW9uNl9fZnVuY0lONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlMyXzE5QmluYXJ5T3BlcmF0aW9uTm9kZUlkTlMyXzlCaW5hcnlBbmRJZEVFRUVFRU5TXzlhbGxvY2F0b3JJUzlfRUVGTlNfMTBzaGFyZWRfcHRySU5TMl85R3JhcGhOb2RlSWRFRUVFaWRpRUVFAAAAAOT8AACsOwAAUA8AAAAAAADsPAAAiwEAAIwBAACNAQAAUgAAAI4BAABOU3QzX18yMjBfX3NoYXJlZF9wdHJfZW1wbGFjZUlONGVsZW0xOUJpbmFyeU9wZXJhdGlvbk5vZGVJZE5TMV85QmluYXJ5QW5kSWRFRUVFTlNfOWFsbG9jYXRvcklTNV9FRUVFAAAAAOT8AACEPAAAJPoAAAAAAABQPQAAYQAAAI8BAABpAAAAZAAAAJABAABmAAAAZwAAAE40ZWxlbTE5QmluYXJ5T3BlcmF0aW9uTm9kZUlkTlNfOUJpbmFyeUFuZElkRUVFRQAAAADk/AAAHD0AADAQAABONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlNfMTlCaW5hcnlPcGVyYXRpb25Ob2RlSWROU185QmluYXJ5QW5kSWRFRUVFRUUAAAC8/AAAXD0AAAAAAACQPgAAVAAAAJEBAACSAQAAkwEAAJQBAACVAQAAlgEAAJcBAACYAQAATlN0M19fMjEwX19mdW5jdGlvbjZfX2Z1bmNJTjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TMl8xOUJpbmFyeU9wZXJhdGlvbk5vZGVJZE5TMl84QmluYXJ5T3JJZEVFRUVFRU5TXzlhbGxvY2F0b3JJUzlfRUVGTlNfMTBzaGFyZWRfcHRySU5TMl85R3JhcGhOb2RlSWRFRUVFaWRpRUVFAOT8AADkPQAAUA8AAAAAAAAcPwAAmQEAAJoBAACbAQAAUgAAAJwBAABOU3QzX18yMjBfX3NoYXJlZF9wdHJfZW1wbGFjZUlONGVsZW0xOUJpbmFyeU9wZXJhdGlvbk5vZGVJZE5TMV84QmluYXJ5T3JJZEVFRUVOU185YWxsb2NhdG9ySVM1X0VFRUUA5PwAALg+AAAk+gAAAAAAAHw/AABhAAAAnQEAAGkAAABkAAAAngEAAGYAAABnAAAATjRlbGVtMTlCaW5hcnlPcGVyYXRpb25Ob2RlSWROU184QmluYXJ5T3JJZEVFRUUA5PwAAEw/AAAwEAAATjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TXzE5QmluYXJ5T3BlcmF0aW9uTm9kZUlkTlNfOEJpbmFyeU9ySWRFRUVFRUUAAAAAvPwAAIg/AAAAAAAAuEAAAFQAAACfAQAAoAEAAKEBAACiAQAAowEAAKQBAAClAQAApgEAAE5TdDNfXzIxMF9fZnVuY3Rpb242X19mdW5jSU40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOUzJfMThCaW5hcnlSZWR1Y2luZ05vZGVJZE5TXzRwbHVzSWRFRUVFRUVOU185YWxsb2NhdG9ySVM5X0VFRk5TXzEwc2hhcmVkX3B0cklOUzJfOUdyYXBoTm9kZUlkRUVFRWlkaUVFRQAAAOT8AAAQQAAAUA8AAAAAAABAQQAApwEAAKgBAACpAQAAUgAAAKoBAABOU3QzX18yMjBfX3NoYXJlZF9wdHJfZW1wbGFjZUlONGVsZW0xOEJpbmFyeVJlZHVjaW5nTm9kZUlkTlNfNHBsdXNJZEVFRUVOU185YWxsb2NhdG9ySVM1X0VFRUUAAADk/AAA4EAAACT6AAAAAAAAoEEAAGEAAACrAQAAaQAAAGQAAACsAQAAZgAAAGcAAABONGVsZW0xOEJpbmFyeVJlZHVjaW5nTm9kZUlkTlN0M19fMjRwbHVzSWRFRUVFAADk/AAAcEEAADAQAABONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlNfMThCaW5hcnlSZWR1Y2luZ05vZGVJZE5TdDNfXzI0cGx1c0lkRUVFRUVFALz8AACsQQAAAAAAANhCAABUAAAArQEAAK4BAACvAQAAsAEAALEBAACyAQAAswEAALQBAABOU3QzX18yMTBfX2Z1bmN0aW9uNl9fZnVuY0lONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlMyXzE4QmluYXJ5UmVkdWNpbmdOb2RlSWROU181bWludXNJZEVFRUVFRU5TXzlhbGxvY2F0b3JJUzlfRUVGTlNfMTBzaGFyZWRfcHRySU5TMl85R3JhcGhOb2RlSWRFRUVFaWRpRUVFAADk/AAAMEIAAFAPAAAAAAAAYEMAALUBAAC2AQAAtwEAAFIAAAC4AQAATlN0M19fMjIwX19zaGFyZWRfcHRyX2VtcGxhY2VJTjRlbGVtMThCaW5hcnlSZWR1Y2luZ05vZGVJZE5TXzVtaW51c0lkRUVFRU5TXzlhbGxvY2F0b3JJUzVfRUVFRQAA5PwAAABDAAAk+gAAAAAAAMBDAABhAAAAuQEAAGkAAABkAAAAugEAAGYAAABnAAAATjRlbGVtMThCaW5hcnlSZWR1Y2luZ05vZGVJZE5TdDNfXzI1bWludXNJZEVFRUUA5PwAAJBDAAAwEAAATjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TXzE4QmluYXJ5UmVkdWNpbmdOb2RlSWROU3QzX18yNW1pbnVzSWRFRUVFRUUAAAAAvPwAAMxDAAAAAAAABEUAAFQAAAC7AQAAvAEAAL0BAAC+AQAAvwEAAMABAADBAQAAwgEAAE5TdDNfXzIxMF9fZnVuY3Rpb242X19mdW5jSU40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOUzJfMThCaW5hcnlSZWR1Y2luZ05vZGVJZE5TXzEwbXVsdGlwbGllc0lkRUVFRUVFTlNfOWFsbG9jYXRvcklTOV9FRUZOU18xMHNoYXJlZF9wdHJJTlMyXzlHcmFwaE5vZGVJZEVFRUVpZGlFRUUAAAAA5PwAAFREAABQDwAAAAAAAJRFAADDAQAAxAEAAMUBAABSAAAAxgEAAE5TdDNfXzIyMF9fc2hhcmVkX3B0cl9lbXBsYWNlSU40ZWxlbTE4QmluYXJ5UmVkdWNpbmdOb2RlSWROU18xMG11bHRpcGxpZXNJZEVFRUVOU185YWxsb2NhdG9ySVM1X0VFRUUAAAAA5PwAACxFAAAk+gAAAAAAAPxFAABhAAAAxwEAAGkAAABkAAAAyAEAAGYAAABnAAAATjRlbGVtMThCaW5hcnlSZWR1Y2luZ05vZGVJZE5TdDNfXzIxMG11bHRpcGxpZXNJZEVFRUUAAADk/AAAxEUAADAQAABONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlNfMThCaW5hcnlSZWR1Y2luZ05vZGVJZE5TdDNfXzIxMG11bHRpcGxpZXNJZEVFRUVFRQAAvPwAAAhGAAAAAAAAREcAAFQAAADJAQAAygEAAMsBAADMAQAAzQEAAM4BAADPAQAA0AEAAE5TdDNfXzIxMF9fZnVuY3Rpb242X19mdW5jSU40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOUzJfMThCaW5hcnlSZWR1Y2luZ05vZGVJZE5TMl8xMVNhZmVEaXZpZGVzSWRFRUVFRUVOU185YWxsb2NhdG9ySVM5X0VFRk5TXzEwc2hhcmVkX3B0cklOUzJfOUdyYXBoTm9kZUlkRUVFRWlkaUVFRQAA5PwAAJRGAABQDwAAAAAAANRHAADRAQAA0gEAANMBAABSAAAA1AEAAE5TdDNfXzIyMF9fc2hhcmVkX3B0cl9lbXBsYWNlSU40ZWxlbTE4QmluYXJ5UmVkdWNpbmdOb2RlSWROUzFfMTFTYWZlRGl2aWRlc0lkRUVFRU5TXzlhbGxvY2F0b3JJUzVfRUVFRQAA5PwAAGxHAAAk+gAAAAAAADhIAABhAAAA1QEAAGkAAABkAAAA1gEAAGYAAABnAAAATjRlbGVtMThCaW5hcnlSZWR1Y2luZ05vZGVJZE5TXzExU2FmZURpdmlkZXNJZEVFRUUAAOT8AAAESAAAMBAAAE40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOU18xOEJpbmFyeVJlZHVjaW5nTm9kZUlkTlNfMTFTYWZlRGl2aWRlc0lkRUVFRUVFALz8AABESAAAAAAAAHhJAABUAAAA1wEAANgBAADZAQAA2gEAANsBAADcAQAA3QEAAN4BAABOU3QzX18yMTBfX2Z1bmN0aW9uNl9fZnVuY0lONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlMyXzE4QmluYXJ5UmVkdWNpbmdOb2RlSWROUzJfN01vZHVsdXNJZEVFRUVFRU5TXzlhbGxvY2F0b3JJUzlfRUVGTlNfMTBzaGFyZWRfcHRySU5TMl85R3JhcGhOb2RlSWRFRUVFaWRpRUVFAAAA5PwAAMxIAABQDwAAAAAAAARKAADfAQAA4AEAAOEBAABSAAAA4gEAAE5TdDNfXzIyMF9fc2hhcmVkX3B0cl9lbXBsYWNlSU40ZWxlbTE4QmluYXJ5UmVkdWNpbmdOb2RlSWROUzFfN01vZHVsdXNJZEVFRUVOU185YWxsb2NhdG9ySVM1X0VFRUUAAADk/AAAoEkAACT6AAAAAAAAZEoAAGEAAADjAQAAaQAAAGQAAADkAQAAZgAAAGcAAABONGVsZW0xOEJpbmFyeVJlZHVjaW5nTm9kZUlkTlNfN01vZHVsdXNJZEVFRUUAAADk/AAANEoAADAQAABONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlNfMThCaW5hcnlSZWR1Y2luZ05vZGVJZE5TXzdNb2R1bHVzSWRFRUVFRUUAALz8AABwSgAAAAAAAJxLAABUAAAA5QEAAOYBAADnAQAA6AEAAOkBAADqAQAA6wEAAOwBAABOU3QzX18yMTBfX2Z1bmN0aW9uNl9fZnVuY0lONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlMyXzE4QmluYXJ5UmVkdWNpbmdOb2RlSWROUzJfM01pbklkRUVFRUVFTlNfOWFsbG9jYXRvcklTOV9FRUZOU18xMHNoYXJlZF9wdHJJTlMyXzlHcmFwaE5vZGVJZEVFRUVpZGlFRUUAAADk/AAA9EoAAFAPAAAAAAAAJEwAAO0BAADuAQAA7wEAAFIAAADwAQAATlN0M19fMjIwX19zaGFyZWRfcHRyX2VtcGxhY2VJTjRlbGVtMThCaW5hcnlSZWR1Y2luZ05vZGVJZE5TMV8zTWluSWRFRUVFTlNfOWFsbG9jYXRvcklTNV9FRUVFAAAA5PwAAMRLAAAk+gAAAAAAAIBMAABhAAAA8QEAAGkAAABkAAAA8gEAAGYAAABnAAAATjRlbGVtMThCaW5hcnlSZWR1Y2luZ05vZGVJZE5TXzNNaW5JZEVFRUUAAADk/AAAVEwAADAQAABONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlNfMThCaW5hcnlSZWR1Y2luZ05vZGVJZE5TXzNNaW5JZEVFRUVFRQAAvPwAAIxMAAAAAAAAtE0AAFQAAADzAQAA9AEAAPUBAAD2AQAA9wEAAPgBAAD5AQAA+gEAAE5TdDNfXzIxMF9fZnVuY3Rpb242X19mdW5jSU40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOUzJfMThCaW5hcnlSZWR1Y2luZ05vZGVJZE5TMl8zTWF4SWRFRUVFRUVOU185YWxsb2NhdG9ySVM5X0VFRk5TXzEwc2hhcmVkX3B0cklOUzJfOUdyYXBoTm9kZUlkRUVFRWlkaUVFRQAAAOT8AAAMTQAAUA8AAAAAAAA8TgAA+wEAAPwBAAD9AQAAUgAAAP4BAABOU3QzX18yMjBfX3NoYXJlZF9wdHJfZW1wbGFjZUlONGVsZW0xOEJpbmFyeVJlZHVjaW5nTm9kZUlkTlMxXzNNYXhJZEVFRUVOU185YWxsb2NhdG9ySVM1X0VFRUUAAADk/AAA3E0AACT6AAAAAAAAmE4AAGEAAAD/AQAAaQAAAGQAAAAAAgAAZgAAAGcAAABONGVsZW0xOEJpbmFyeVJlZHVjaW5nTm9kZUlkTlNfM01heElkRUVFRQAAAOT8AABsTgAAMBAAAE40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOU18xOEJpbmFyeVJlZHVjaW5nTm9kZUlkTlNfM01heElkRUVFRUVFAAC8/AAApE4AAAAAAAC0TwAAVAAAAAECAAACAgAAAwIAAAQCAAAFAgAABgIAAAcCAAAIAgAATlN0M19fMjEwX19mdW5jdGlvbjZfX2Z1bmNJTjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TMl84Um9vdE5vZGVJZEVFRUVOU185YWxsb2NhdG9ySVM3X0VFRk5TXzEwc2hhcmVkX3B0cklOUzJfOUdyYXBoTm9kZUlkRUVFRWlkaUVFRQAA5PwAACRPAABQDwAAAAAAACRQAAAJAgAACgIAAAsCAABSAAAADAIAAE5TdDNfXzIyMF9fc2hhcmVkX3B0cl9lbXBsYWNlSU40ZWxlbThSb290Tm9kZUlkRUVOU185YWxsb2NhdG9ySVMzX0VFRUUAAOT8AADcTwAAJPoAAAAAAABoUAAAYQAAAA0CAAAOAgAAZAAAAA8CAABmAAAAZwAAAE40ZWxlbThSb290Tm9kZUlkRUUA5PwAAFRQAAAwEAAATjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TXzhSb290Tm9kZUlkRUVFRQAAAAC8/AAAdFAAAAAAAABwUQAAVAAAABACAAARAgAAEgIAABMCAAAUAgAAFQIAABYCAAAXAgAATlN0M19fMjEwX19mdW5jdGlvbjZfX2Z1bmNJTjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TMl85Q29uc3ROb2RlSWRFRUVFTlNfOWFsbG9jYXRvcklTN19FRUZOU18xMHNoYXJlZF9wdHJJTlMyXzlHcmFwaE5vZGVJZEVFRUVpZGlFRUUA5PwAAOBQAABQDwAAAAAAAOBRAAAYAgAAGQIAABoCAABSAAAAGwIAAE5TdDNfXzIyMF9fc2hhcmVkX3B0cl9lbXBsYWNlSU40ZWxlbTlDb25zdE5vZGVJZEVFTlNfOWFsbG9jYXRvcklTM19FRUVFAOT8AACYUQAAJPoAAAAAAAAoUgAAYQAAABwCAAAdAgAAZAAAAB4CAABmAAAAZwAAAE40ZWxlbTlDb25zdE5vZGVJZEVFAAAAAOT8AAAQUgAAMBAAAE40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOU185Q29uc3ROb2RlSWRFRUVFAAAAvPwAADRSAAAAAAAAOFMAAFQAAAAfAgAAIAIAACECAAAiAgAAIwIAACQCAAAlAgAAJgIAAE5TdDNfXzIxMF9fZnVuY3Rpb242X19mdW5jSU40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOUzJfMTBQaGFzb3JOb2RlSWRMYjBFRUVFRU5TXzlhbGxvY2F0b3JJUzdfRUVGTlNfMTBzaGFyZWRfcHRySU5TMl85R3JhcGhOb2RlSWRFRUVFaWRpRUVFAAAA5PwAAKBSAABQDwAAAAAAALBTAAAnAgAAKAIAACkCAABSAAAAKgIAAE5TdDNfXzIyMF9fc2hhcmVkX3B0cl9lbXBsYWNlSU40ZWxlbTEwUGhhc29yTm9kZUlkTGIwRUVFTlNfOWFsbG9jYXRvcklTM19FRUVFAAAA5PwAAGBTAAAk+gAAAAAAAPxTAABhAAAAKwIAAGkAAABkAAAALAIAAGYAAABnAAAATjRlbGVtMTBQaGFzb3JOb2RlSWRMYjBFRUUAAOT8AADgUwAAMBAAAE40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOU18xMFBoYXNvck5vZGVJZExiMEVFRUVFALz8AAAIVAAAAAAAABBVAABUAAAALQIAAC4CAAAvAgAAMAIAADECAAAyAgAAMwIAADQCAABOU3QzX18yMTBfX2Z1bmN0aW9uNl9fZnVuY0lONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlMyXzEwUGhhc29yTm9kZUlkTGIxRUVFRUVOU185YWxsb2NhdG9ySVM3X0VFRk5TXzEwc2hhcmVkX3B0cklOUzJfOUdyYXBoTm9kZUlkRUVFRWlkaUVFRQAAAOT8AAB4VAAAUA8AAAAAAACIVQAANQIAADYCAAA3AgAAUgAAADgCAABOU3QzX18yMjBfX3NoYXJlZF9wdHJfZW1wbGFjZUlONGVsZW0xMFBoYXNvck5vZGVJZExiMUVFRU5TXzlhbGxvY2F0b3JJUzNfRUVFRQAAAOT8AAA4VQAAJPoAAAAAAADUVQAAYQAAADkCAABpAAAAZAAAADoCAABmAAAAZwAAAE40ZWxlbTEwUGhhc29yTm9kZUlkTGIxRUVFAADk/AAAuFUAADAQAABONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlNfMTBQaGFzb3JOb2RlSWRMYjFFRUVFRQC8/AAA4FUAAAAAAADoVgAAVAAAADsCAAA8AgAAPQIAAD4CAAA/AgAAQAIAAEECAABCAgAATlN0M19fMjEwX19mdW5jdGlvbjZfX2Z1bmNJTjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TMl8xNFNhbXBsZVJhdGVOb2RlSWRFRUVFTlNfOWFsbG9jYXRvcklTN19FRUZOU18xMHNoYXJlZF9wdHJJTlMyXzlHcmFwaE5vZGVJZEVFRUVpZGlFRUUAAADk/AAAUFYAAFAPAAAAAAAAYFcAAEMCAABEAgAARQIAAFIAAABGAgAATlN0M19fMjIwX19zaGFyZWRfcHRyX2VtcGxhY2VJTjRlbGVtMTRTYW1wbGVSYXRlTm9kZUlkRUVOU185YWxsb2NhdG9ySVMzX0VFRUUAAADk/AAAEFcAACT6AAAAAAAArFcAAGEAAABHAgAAaQAAAGQAAABIAgAAZgAAAGcAAABONGVsZW0xNFNhbXBsZVJhdGVOb2RlSWRFRQAA5PwAAJBXAAAwEAAATjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TXzE0U2FtcGxlUmF0ZU5vZGVJZEVFRUUAvPwAALhXAAAAAAAAvFgAAFQAAABJAgAASgIAAEsCAABMAgAATQIAAE4CAABPAgAAUAIAAE5TdDNfXzIxMF9fZnVuY3Rpb242X19mdW5jSU40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOUzJfMTJTZXF1ZW5jZU5vZGVJZEVFRUVOU185YWxsb2NhdG9ySVM3X0VFRk5TXzEwc2hhcmVkX3B0cklOUzJfOUdyYXBoTm9kZUlkRUVFRWlkaUVFRQDk/AAAKFgAAFAPAAAAAAAAMFkAAFECAABSAgAAUwIAAFIAAABUAgAATlN0M19fMjIwX19zaGFyZWRfcHRyX2VtcGxhY2VJTjRlbGVtMTJTZXF1ZW5jZU5vZGVJZEVFTlNfOWFsbG9jYXRvcklTM19FRUVFAOT8AADkWAAAJPoAAAAAAAB8WQAAVQIAAFYCAABXAgAAZAAAAFgCAABmAAAAZwAAAE40ZWxlbTEyU2VxdWVuY2VOb2RlSWRFRQAAAADk/AAAYFkAADAQAAAAAAAA8FkAAFkCAABaAgAAWwIAAFIAAABcAgAATlN0M19fMjIwX19zaGFyZWRfcHRyX2VtcGxhY2VJTlNfNnZlY3RvcklkTlNfOWFsbG9jYXRvcklkRUVFRU5TMl9JUzRfRUVFRQAAAOT8AACkWQAAJPoAAE40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOU18xMlNlcXVlbmNlTm9kZUlkRUVFRQAAALz8AAD8WQAAAAAAAPxaAABUAAAAXQIAAF4CAABfAgAAYAIAAGECAABiAgAAYwIAAGQCAABOU3QzX18yMTBfX2Z1bmN0aW9uNl9fZnVuY0lONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlMyXzhTZXEyTm9kZUlkRUVFRU5TXzlhbGxvY2F0b3JJUzdfRUVGTlNfMTBzaGFyZWRfcHRySU5TMl85R3JhcGhOb2RlSWRFRUVFaWRpRUVFAADk/AAAbFoAAFAPAAAAAAAAbFsAAGUCAABmAgAAZwIAAFIAAABoAgAATlN0M19fMjIwX19zaGFyZWRfcHRyX2VtcGxhY2VJTjRlbGVtOFNlcTJOb2RlSWRFRU5TXzlhbGxvY2F0b3JJUzNfRUVFRQAA5PwAACRbAAAk+gAAAAAAALBbAABpAgAAagIAAGsCAABkAAAAbAIAAGYAAABnAAAATjRlbGVtOFNlcTJOb2RlSWRFRQDk/AAAnFsAADAQAABONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlNfOFNlcTJOb2RlSWRFRUVFAAAAALz8AAC8WwAAAAAAALxcAABUAAAAbQIAAG4CAABvAgAAcAIAAHECAAByAgAAcwIAAHQCAABOU3QzX18yMTBfX2Z1bmN0aW9uNl9fZnVuY0lONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlMyXzExU3BhclNlcU5vZGVJZEVFRUVOU185YWxsb2NhdG9ySVM3X0VFRk5TXzEwc2hhcmVkX3B0cklOUzJfOUdyYXBoTm9kZUlkRUVFRWlkaUVFRQAA5PwAAChcAABQDwAAAAAAADBdAAB1AgAAdgIAAHcCAABSAAAAeAIAAE5TdDNfXzIyMF9fc2hhcmVkX3B0cl9lbXBsYWNlSU40ZWxlbTExU3BhclNlcU5vZGVJZEVFTlNfOWFsbG9jYXRvcklTM19FRUVFAADk/AAA5FwAACT6AAAAAAAAeF0AAHkCAAB6AgAAewIAAGQAAAB8AgAAZgAAAGcAAABONGVsZW0xMVNwYXJTZXFOb2RlSWRFRQDk/AAAYF0AADAQAAAAAAAABF4AAH0CAAB+AgAAfwIAAFIAAACAAgAATlN0M19fMjIwX19zaGFyZWRfcHRyX2VtcGxhY2VJTlNfM21hcElpZE5TXzRsZXNzSWlFRU5TXzlhbGxvY2F0b3JJTlNfNHBhaXJJS2lkRUVFRUVFTlM0X0lTOV9FRUVFAAAAAOT8AACgXQAAJPoAAE40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOU18xMVNwYXJTZXFOb2RlSWRFRUVFAAAAALz8AAAQXgAAAAAAABRfAABUAAAAgQIAAIICAACDAgAAhAIAAIUCAACGAgAAhwIAAIgCAABOU3QzX18yMTBfX2Z1bmN0aW9uNl9fZnVuY0lONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlMyXzEyU3BhclNlcTJOb2RlSWRFRUVFTlNfOWFsbG9jYXRvcklTN19FRUZOU18xMHNoYXJlZF9wdHJJTlMyXzlHcmFwaE5vZGVJZEVFRUVpZGlFRUUA5PwAAIBeAABQDwAAAAAAAIhfAACJAgAAigIAAIsCAABSAAAAjAIAAE5TdDNfXzIyMF9fc2hhcmVkX3B0cl9lbXBsYWNlSU40ZWxlbTEyU3BhclNlcTJOb2RlSWRFRU5TXzlhbGxvY2F0b3JJUzNfRUVFRQDk/AAAPF8AACT6AAAAAAAA1F8AAI0CAACOAgAAjwIAAGQAAACQAgAAZgAAAGcAAABONGVsZW0xMlNwYXJTZXEyTm9kZUlkRUUAAAAA5PwAALhfAAAwEAAAAAAAAGBgAACRAgAAkgIAAJMCAABSAAAAlAIAAE5TdDNfXzIyMF9fc2hhcmVkX3B0cl9lbXBsYWNlSU5TXzNtYXBJZGROU180bGVzc0lkRUVOU185YWxsb2NhdG9ySU5TXzRwYWlySUtkZEVFRUVFRU5TNF9JUzlfRUVFRQAAAADk/AAA/F8AACT6AABONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlNfMTJTcGFyU2VxMk5vZGVJZEVFRUUAAAC8/AAAbGAAAAAAAABwYQAAVAAAAJUCAACWAgAAlwIAAJgCAACZAgAAmgIAAJsCAACcAgAATlN0M19fMjEwX19mdW5jdGlvbjZfX2Z1bmNJTjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TMl8xMUNvdW50ZXJOb2RlSWRFRUVFTlNfOWFsbG9jYXRvcklTN19FRUZOU18xMHNoYXJlZF9wdHJJTlMyXzlHcmFwaE5vZGVJZEVFRUVpZGlFRUUAAOT8AADcYAAAUA8AAAAAAADkYQAAnQIAAJ4CAACfAgAAUgAAAKACAABOU3QzX18yMjBfX3NoYXJlZF9wdHJfZW1wbGFjZUlONGVsZW0xMUNvdW50ZXJOb2RlSWRFRU5TXzlhbGxvY2F0b3JJUzNfRUVFRQAA5PwAAJhhAAAk+gAAAAAAACxiAABhAAAAoQIAAGkAAABkAAAAogIAAGYAAABnAAAATjRlbGVtMTFDb3VudGVyTm9kZUlkRUUA5PwAABRiAAAwEAAATjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TXzExQ291bnRlck5vZGVJZEVFRUUAAAAAvPwAADhiAAAAAAAAOGMAAFQAAACjAgAApAIAAKUCAACmAgAApwIAAKgCAACpAgAAqgIAAE5TdDNfXzIxMF9fZnVuY3Rpb242X19mdW5jSU40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOUzJfOUFjY3VtTm9kZUlkRUVFRU5TXzlhbGxvY2F0b3JJUzdfRUVGTlNfMTBzaGFyZWRfcHRySU5TMl85R3JhcGhOb2RlSWRFRUVFaWRpRUVFAOT8AACoYgAAUA8AAAAAAACoYwAAqwIAAKwCAACtAgAAUgAAAK4CAABOU3QzX18yMjBfX3NoYXJlZF9wdHJfZW1wbGFjZUlONGVsZW05QWNjdW1Ob2RlSWRFRU5TXzlhbGxvY2F0b3JJUzNfRUVFRQDk/AAAYGMAACT6AAAAAAAA8GMAAGEAAACvAgAAaQAAAGQAAACwAgAAZgAAAGcAAABONGVsZW05QWNjdW1Ob2RlSWRFRQAAAADk/AAA2GMAADAQAABONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlNfOUFjY3VtTm9kZUlkRUVFRQAAALz8AAD8YwAAAAAAAPhkAABUAAAAsQIAALICAACzAgAAtAIAALUCAAC2AgAAtwIAALgCAABOU3QzX18yMTBfX2Z1bmN0aW9uNl9fZnVuY0lONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlMyXzlMYXRjaE5vZGVJZEVFRUVOU185YWxsb2NhdG9ySVM3X0VFRk5TXzEwc2hhcmVkX3B0cklOUzJfOUdyYXBoTm9kZUlkRUVFRWlkaUVFRQDk/AAAaGQAAFAPAAAAAAAAaGUAALkCAAC6AgAAuwIAAFIAAAC8AgAATlN0M19fMjIwX19zaGFyZWRfcHRyX2VtcGxhY2VJTjRlbGVtOUxhdGNoTm9kZUlkRUVOU185YWxsb2NhdG9ySVMzX0VFRUUA5PwAACBlAAAk+gAAAAAAALBlAABhAAAAvQIAAGkAAABkAAAAvgIAAGYAAABnAAAATjRlbGVtOUxhdGNoTm9kZUlkRUUAAAAA5PwAAJhlAAAwEAAATjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TXzlMYXRjaE5vZGVJZEVFRUUAAAC8/AAAvGUAAAAAAAC4ZgAAVAAAAL8CAADAAgAAwQIAAMICAADDAgAAxAIAAMUCAADGAgAATlN0M19fMjEwX19mdW5jdGlvbjZfX2Z1bmNJTjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TMl83TWF4SG9sZElkRUVFRU5TXzlhbGxvY2F0b3JJUzdfRUVGTlNfMTBzaGFyZWRfcHRySU5TMl85R3JhcGhOb2RlSWRFRUVFaWRpRUVFAAAA5PwAAChmAABQDwAAAAAAAChnAADHAgAAyAIAAMkCAABSAAAAygIAAE5TdDNfXzIyMF9fc2hhcmVkX3B0cl9lbXBsYWNlSU40ZWxlbTdNYXhIb2xkSWRFRU5TXzlhbGxvY2F0b3JJUzNfRUVFRQAAAOT8AADgZgAAJPoAAAAAAABsZwAAYQAAAMsCAADMAgAAZAAAAM0CAABmAAAAZwAAAE40ZWxlbTdNYXhIb2xkSWRFRQAA5PwAAFhnAAAwEAAATjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TXzdNYXhIb2xkSWRFRUVFALz8AAB4ZwAAAAAAAHBoAABUAAAAzgIAAM8CAADQAgAA0QIAANICAADTAgAA1AIAANUCAABOU3QzX18yMTBfX2Z1bmN0aW9uNl9fZnVuY0lONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlMyXzhPbmNlTm9kZUlkRUVFRU5TXzlhbGxvY2F0b3JJUzdfRUVGTlNfMTBzaGFyZWRfcHRySU5TMl85R3JhcGhOb2RlSWRFRUVFaWRpRUVFAADk/AAA4GcAAFAPAAAAAAAA4GgAANYCAADXAgAA2AIAAFIAAADZAgAATlN0M19fMjIwX19zaGFyZWRfcHRyX2VtcGxhY2VJTjRlbGVtOE9uY2VOb2RlSWRFRU5TXzlhbGxvY2F0b3JJUzNfRUVFRQAA5PwAAJhoAAAk+gAAAAAAACRpAABhAAAA2gIAANsCAABkAAAA3AIAAGYAAABnAAAATjRlbGVtOE9uY2VOb2RlSWRFRQDk/AAAEGkAADAQAABONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlNfOE9uY2VOb2RlSWRFRUVFAAAAALz8AAAwaQAAAAAAADxqAABUAAAA3QIAAN4CAADfAgAA4AIAAOECAADiAgAA4wIAAOQCAABOU3QzX18yMTBfX2Z1bmN0aW9uNl9fZnVuY0lONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlMyXzIyVW5pZm9ybVJhbmRvbU5vaXNlTm9kZUlkRUVFRU5TXzlhbGxvY2F0b3JJUzdfRUVGTlNfMTBzaGFyZWRfcHRySU5TMl85R3JhcGhOb2RlSWRFRUVFaWRpRUVFAAAA5PwAAJxpAABQDwAAAAAAALxqAADlAgAA5gIAAOcCAABSAAAA6AIAAE5TdDNfXzIyMF9fc2hhcmVkX3B0cl9lbXBsYWNlSU40ZWxlbTIyVW5pZm9ybVJhbmRvbU5vaXNlTm9kZUlkRUVOU185YWxsb2NhdG9ySVMzX0VFRUUAAADk/AAAZGoAACT6AAAAAAAAEGsAAGEAAADpAgAA6gIAAGQAAADrAgAAZgAAAGcAAABONGVsZW0yMlVuaWZvcm1SYW5kb21Ob2lzZU5vZGVJZEVFAADk/AAA7GoAADAQAABONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlNfMjJVbmlmb3JtUmFuZG9tTm9pc2VOb2RlSWRFRUVFALz8AAAcawAAAAAAADBsAABUAAAA7AIAAO0CAADuAgAA7wIAAPACAADxAgAA8gIAAPMCAABOU3QzX18yMTBfX2Z1bmN0aW9uNl9fZnVuY0lONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlMyXzE3VmFyaWFibGVEZWxheU5vZGVJZEVFRUVOU185YWxsb2NhdG9ySVM3X0VFRk5TXzEwc2hhcmVkX3B0cklOUzJfOUdyYXBoTm9kZUlkRUVFRWlkaUVFRQAAAADk/AAAlGsAAFAPAAAAAAAArGwAAPQCAAD1AgAA9gIAAFIAAAD3AgAATlN0M19fMjIwX19zaGFyZWRfcHRyX2VtcGxhY2VJTjRlbGVtMTdWYXJpYWJsZURlbGF5Tm9kZUlkRUVOU185YWxsb2NhdG9ySVMzX0VFRUUAAAAA5PwAAFhsAAAk+gAAAAAAAPxsAAD4AgAA+QIAAPoCAABkAAAA+wIAAGYAAABnAAAATjRlbGVtMTdWYXJpYWJsZURlbGF5Tm9kZUlkRUUAAADk/AAA3GwAADAQAABONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlNfMTdWYXJpYWJsZURlbGF5Tm9kZUlkRUVFRQAAvPwAAAhtAAAAAAAAFG4AAFQAAAD8AgAA/QIAAP4CAAD/AgAAAAMAAAEDAAACAwAAAwMAAE5TdDNfXzIxMF9fZnVuY3Rpb242X19mdW5jSU40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOUzJfMTVTYW1wbGVEZWxheU5vZGVJZEVFRUVOU185YWxsb2NhdG9ySVM3X0VFRk5TXzEwc2hhcmVkX3B0cklOUzJfOUdyYXBoTm9kZUlkRUVFRWlkaUVFRQAA5PwAAHxtAABQDwAAAAAAAIxuAAAEAwAABQMAAAYDAABSAAAABwMAAE5TdDNfXzIyMF9fc2hhcmVkX3B0cl9lbXBsYWNlSU40ZWxlbTE1U2FtcGxlRGVsYXlOb2RlSWRFRU5TXzlhbGxvY2F0b3JJUzNfRUVFRQAA5PwAADxuAAAk+gAAAAAAANhuAAAIAwAACQMAAAoDAABkAAAACwMAAGYAAABnAAAATjRlbGVtMTVTYW1wbGVEZWxheU5vZGVJZEVFAOT8AAC8bgAAMBAAAE40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOU18xNVNhbXBsZURlbGF5Tm9kZUlkRUVFRQAAAAC8/AAA5G4AAAAAAAD4bwAAVAAAAAwDAAANAwAADgMAAA8DAAAQAwAAEQMAABIDAAATAwAATlN0M19fMjEwX19mdW5jdGlvbjZfX2Z1bmNJTjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TMl8yMVNpbmdsZVNhbXBsZURlbGF5Tm9kZUlkRUVFRU5TXzlhbGxvY2F0b3JJUzdfRUVGTlNfMTBzaGFyZWRfcHRySU5TMl85R3JhcGhOb2RlSWRFRUVFaWRpRUVFAAAAAOT8AABYbwAAUA8AAAAAAAB4cAAAFAMAABUDAAAWAwAAUgAAABcDAABOU3QzX18yMjBfX3NoYXJlZF9wdHJfZW1wbGFjZUlONGVsZW0yMVNpbmdsZVNhbXBsZURlbGF5Tm9kZUlkRUVOU185YWxsb2NhdG9ySVMzX0VFRUUAAAAA5PwAACBwAAAk+gAAAAAAAMxwAABhAAAAGAMAAGkAAABkAAAAGQMAAGYAAABnAAAATjRlbGVtMjFTaW5nbGVTYW1wbGVEZWxheU5vZGVJZEVFAAAA5PwAAKhwAAAwEAAATjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TXzIxU2luZ2xlU2FtcGxlRGVsYXlOb2RlSWRFRUVFAAC8/AAA2HAAAAAAAADkcQAAVAAAABoDAAAbAwAAHAMAAB0DAAAeAwAAHwMAACADAAAhAwAATlN0M19fMjEwX19mdW5jdGlvbjZfX2Z1bmNJTjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TMl8xMU9uZVBvbGVOb2RlSWRFRUVFTlNfOWFsbG9jYXRvcklTN19FRUZOU18xMHNoYXJlZF9wdHJJTlMyXzlHcmFwaE5vZGVJZEVFRUVpZGlFRUUAAOT8AABQcQAAUA8AAAAAAABYcgAAIgMAACMDAAAkAwAAUgAAACUDAABOU3QzX18yMjBfX3NoYXJlZF9wdHJfZW1wbGFjZUlONGVsZW0xMU9uZVBvbGVOb2RlSWRFRU5TXzlhbGxvY2F0b3JJUzNfRUVFRQAA5PwAAAxyAAAk+gAAAAAAAKByAABhAAAAJgMAAGkAAABkAAAAJwMAAGYAAABnAAAATjRlbGVtMTFPbmVQb2xlTm9kZUlkRUUA5PwAAIhyAAAwEAAATjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TXzExT25lUG9sZU5vZGVJZEVFRUUAAAAAvPwAAKxyAAAAAAAAsHMAAFQAAAAoAwAAKQMAACoDAAArAwAALAMAAC0DAAAuAwAALwMAAE5TdDNfXzIxMF9fZnVuY3Rpb242X19mdW5jSU40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOUzJfMTJFbnZlbG9wZU5vZGVJZEVFRUVOU185YWxsb2NhdG9ySVM3X0VFRk5TXzEwc2hhcmVkX3B0cklOUzJfOUdyYXBoTm9kZUlkRUVFRWlkaUVFRQDk/AAAHHMAAFAPAAAAAAAAJHQAADADAAAxAwAAMgMAAFIAAAAzAwAATlN0M19fMjIwX19zaGFyZWRfcHRyX2VtcGxhY2VJTjRlbGVtMTJFbnZlbG9wZU5vZGVJZEVFTlNfOWFsbG9jYXRvcklTM19FRUVFAOT8AADYcwAAJPoAAAAAAABwdAAAYQAAADQDAABpAAAAZAAAADUDAABmAAAAZwAAAE40ZWxlbTEyRW52ZWxvcGVOb2RlSWRFRQAAAADk/AAAVHQAADAQAABONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlNfMTJFbnZlbG9wZU5vZGVJZEVFRUUAAAC8/AAAfHQAAAAAAACEdQAAVAAAADYDAAA3AwAAOAMAADkDAAA6AwAAOwMAADwDAAA9AwAATlN0M19fMjEwX19mdW5jdGlvbjZfX2Z1bmNJTjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TMl8xNkJpcXVhZEZpbHRlck5vZGVJZEVFRUVOU185YWxsb2NhdG9ySVM3X0VFRk5TXzEwc2hhcmVkX3B0cklOUzJfOUdyYXBoTm9kZUlkRUVFRWlkaUVFRQDk/AAA7HQAAFAPAAAAAAAA/HUAAD4DAAA/AwAAQAMAAFIAAABBAwAATlN0M19fMjIwX19zaGFyZWRfcHRyX2VtcGxhY2VJTjRlbGVtMTZCaXF1YWRGaWx0ZXJOb2RlSWRFRU5TXzlhbGxvY2F0b3JJUzNfRUVFRQDk/AAArHUAACT6AAAAAAAATHYAAGEAAABCAwAAaQAAAGQAAABDAwAAZgAAAGcAAABONGVsZW0xNkJpcXVhZEZpbHRlck5vZGVJZEVFAAAAAOT8AAAsdgAAMBAAAE40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOU18xNkJpcXVhZEZpbHRlck5vZGVJZEVFRUUAAAC8/AAAWHYAAAAAAABodwAAVAAAAEQDAABFAwAARgMAAEcDAABIAwAASQMAAEoDAABLAwAATlN0M19fMjEwX19mdW5jdGlvbjZfX2Z1bmNJTjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TMl8xN0N1dG9mZlByZXdhcnBOb2RlSWRFRUVFTlNfOWFsbG9jYXRvcklTN19FRUZOU18xMHNoYXJlZF9wdHJJTlMyXzlHcmFwaE5vZGVJZEVFRUVpZGlFRUUAAAAA5PwAAMx2AABQDwAAAAAAAOR3AABMAwAATQMAAE4DAABSAAAATwMAAE5TdDNfXzIyMF9fc2hhcmVkX3B0cl9lbXBsYWNlSU40ZWxlbTE3Q3V0b2ZmUHJld2FycE5vZGVJZEVFTlNfOWFsbG9jYXRvcklTM19FRUVFAAAAAOT8AACQdwAAJPoAAAAAAAA0eAAAYQAAAFADAABpAAAAZAAAAFEDAABmAAAAZwAAAE40ZWxlbTE3Q3V0b2ZmUHJld2FycE5vZGVJZEVFAAAA5PwAABR4AAAwEAAATjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TXzE3Q3V0b2ZmUHJld2FycE5vZGVJZEVFRUUAALz8AABAeAAAAAAAAEh5AABUAAAAUgMAAFMDAABUAwAAVQMAAFYDAABXAwAAWAMAAFkDAABOU3QzX18yMTBfX2Z1bmN0aW9uNl9fZnVuY0lONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlMyXzExTXVsdGlNb2RlMXBJZEVFRUVOU185YWxsb2NhdG9ySVM3X0VFRk5TXzEwc2hhcmVkX3B0cklOUzJfOUdyYXBoTm9kZUlkRUVFRWlkaUVFRQAA5PwAALR4AABQDwAAAAAAALx5AABaAwAAWwMAAFwDAABSAAAAXQMAAE5TdDNfXzIyMF9fc2hhcmVkX3B0cl9lbXBsYWNlSU40ZWxlbTExTXVsdGlNb2RlMXBJZEVFTlNfOWFsbG9jYXRvcklTM19FRUVFAADk/AAAcHkAACT6AAAAAAAABHoAAGEAAABeAwAAXwMAAGQAAABgAwAAZgAAAGcAAABONGVsZW0xMU11bHRpTW9kZTFwSWRFRQDk/AAA7HkAADAQAABONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlNfMTFNdWx0aU1vZGUxcElkRUVFRQAAAAC8/AAAEHoAAAAAAAAgewAAVAAAAGEDAABiAwAAYwMAAGQDAABlAwAAZgMAAGcDAABoAwAATlN0M19fMjEwX19mdW5jdGlvbjZfX2Z1bmNJTjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TMl8yM1N0YXRlVmFyaWFibGVGaWx0ZXJOb2RlSWRFRUVFTlNfOWFsbG9jYXRvcklTN19FRUZOU18xMHNoYXJlZF9wdHJJTlMyXzlHcmFwaE5vZGVJZEVFRUVpZGlFRUUAAOT8AACAegAAUA8AAAAAAACgewAAaQMAAGoDAABrAwAAUgAAAGwDAABOU3QzX18yMjBfX3NoYXJlZF9wdHJfZW1wbGFjZUlONGVsZW0yM1N0YXRlVmFyaWFibGVGaWx0ZXJOb2RlSWRFRU5TXzlhbGxvY2F0b3JJUzNfRUVFRQAA5PwAAEh7AAAk+gAAAAAAAPR7AABhAAAAbQMAAG4DAABkAAAAbwMAAGYAAABnAAAATjRlbGVtMjNTdGF0ZVZhcmlhYmxlRmlsdGVyTm9kZUlkRUUA5PwAANB7AAAwEAAATjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TXzIzU3RhdGVWYXJpYWJsZUZpbHRlck5vZGVJZEVFRUUAAAAAvPwAAAB8AAAAAAAAIH0AAFQAAABwAwAAcQMAAHIDAABzAwAAdAMAAHUDAAB2AwAAdwMAAE5TdDNfXzIxMF9fZnVuY3Rpb242X19mdW5jSU40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOUzJfMjhTdGF0ZVZhcmlhYmxlU2hlbGZGaWx0ZXJOb2RlSWRFRUVFTlNfOWFsbG9jYXRvcklTN19FRUZOU18xMHNoYXJlZF9wdHJJTlMyXzlHcmFwaE5vZGVJZEVFRUVpZGlFRUUA5PwAAHx8AABQDwAAAAAAAKR9AAB4AwAAeQMAAHoDAABSAAAAewMAAE5TdDNfXzIyMF9fc2hhcmVkX3B0cl9lbXBsYWNlSU40ZWxlbTI4U3RhdGVWYXJpYWJsZVNoZWxmRmlsdGVyTm9kZUlkRUVOU185YWxsb2NhdG9ySVMzX0VFRUUA5PwAAEh9AAAk+gAAAAAAAAB+AABhAAAAfAMAAH0DAABkAAAAfgMAAGYAAABnAAAATjRlbGVtMjhTdGF0ZVZhcmlhYmxlU2hlbGZGaWx0ZXJOb2RlSWRFRQAAAADk/AAA1H0AADAQAABONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlNfMjhTdGF0ZVZhcmlhYmxlU2hlbGZGaWx0ZXJOb2RlSWRFRUVFAAAAvPwAAAx+AAAAAAAAHH8AAFQAAAB/AwAAgAMAAIEDAACCAwAAgwMAAIQDAACFAwAAhgMAAE5TdDNfXzIxMF9fZnVuY3Rpb242X19mdW5jSU40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOUzJfOVRhcEluTm9kZUlkRUVFRU5TXzlhbGxvY2F0b3JJUzdfRUVGTlNfMTBzaGFyZWRfcHRySU5TMl85R3JhcGhOb2RlSWRFRUVFaWRpRUVFAOT8AACMfgAAUA8AAAAAAACMfwAAhwMAAIgDAACJAwAAUgAAAIoDAABOU3QzX18yMjBfX3NoYXJlZF9wdHJfZW1wbGFjZUlONGVsZW05VGFwSW5Ob2RlSWRFRU5TXzlhbGxvY2F0b3JJUzNfRUVFRQDk/AAARH8AACT6AAAAAAAA1H8AAIsDAACMAwAAaQAAAI0DAACOAwAAZgAAAGcAAABONGVsZW05VGFwSW5Ob2RlSWRFRQAAAADk/AAAvH8AADAQAAAAAAAAQIEAAI8DAACQAwAAkQMAAJIDAACTAwAAlAMAAJUDAACWAwAAlwMAAE5TdDNfXzIxMF9fZnVuY3Rpb242X19mdW5jSVpONGVsZW05VGFwSW5Ob2RlSWRFMTFzZXRQcm9wZXJ0eUVSS05TXzEyYmFzaWNfc3RyaW5nSWNOU18xMWNoYXJfdHJhaXRzSWNFRU5TXzlhbGxvY2F0b3JJY0VFRUVSS05TMl8yanM1VmFsdWVFUk5TMl8xN1NoYXJlZFJlc291cmNlTWFwRUVVbHZFX05TOF9JU0pfRUVGTlNfMTBzaGFyZWRfcHRySU5TMl8xNFNoYXJlZFJlc291cmNlRUVFdkVFRQBOU3QzX18yMTBfX2Z1bmN0aW9uNl9fYmFzZUlGTlNfMTBzaGFyZWRfcHRySU40ZWxlbTE0U2hhcmVkUmVzb3VyY2VFRUV2RUVFAAAAALz8AADrgAAA5PwAAAyAAAA4gQAAAAAAALiBAACYAwAAmQMAAJoDAABSAAAAmwMAAE5TdDNfXzIyMF9fc2hhcmVkX3B0cl9lbXBsYWNlSU40ZWxlbTE5QXVkaW9CdWZmZXJSZXNvdXJjZUVOU185YWxsb2NhdG9ySVMyX0VFRUUA5PwAAGiBAAAk+gAAAAAAACCCAACcAwAAnQMAAJ4DAACfAwAAoAMAAE40ZWxlbTE5QXVkaW9CdWZmZXJSZXNvdXJjZUUATjRlbGVtMTRTaGFyZWRSZXNvdXJjZUUAAAAAvPwAAP2BAADk/AAA4IEAABiCAABaTjRlbGVtOVRhcEluTm9kZUlkRTExc2V0UHJvcGVydHlFUktOU3QzX18yMTJiYXNpY19zdHJpbmdJY05TMl8xMWNoYXJfdHJhaXRzSWNFRU5TMl85YWxsb2NhdG9ySWNFRUVFUktOU18yanM1VmFsdWVFUk5TXzE3U2hhcmVkUmVzb3VyY2VNYXBFRVVsdkVfAAAAvPwAACyCAABONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlNfOVRhcEluTm9kZUlkRUVFRQAAALz8AADIggAAAAAAAMiDAABUAAAAoQMAAKIDAACjAwAApAMAAKUDAACmAwAApwMAAKgDAABOU3QzX18yMTBfX2Z1bmN0aW9uNl9fZnVuY0lONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlMyXzEwVGFwT3V0Tm9kZUlkRUVFRU5TXzlhbGxvY2F0b3JJUzdfRUVGTlNfMTBzaGFyZWRfcHRySU5TMl85R3JhcGhOb2RlSWRFRUVFaWRpRUVFAAAA5PwAADSDAABQDwAAAAAAADyEAACpAwAAqgMAAKsDAABSAAAArAMAAE5TdDNfXzIyMF9fc2hhcmVkX3B0cl9lbXBsYWNlSU40ZWxlbTEwVGFwT3V0Tm9kZUlkRUVOU185YWxsb2NhdG9ySVMzX0VFRUUAAADk/AAA8IMAACT6AAAAAAAAhIQAAK0DAACuAwAAaQAAAK8DAACwAwAAZgAAAGcAAABONGVsZW0xMFRhcE91dE5vZGVJZEVFAADk/AAAbIQAADAQAAAAAAAAoIUAAI8DAACxAwAAsgMAALMDAAC0AwAAtQMAALYDAAC3AwAAuAMAAE5TdDNfXzIxMF9fZnVuY3Rpb242X19mdW5jSVpONGVsZW0xMFRhcE91dE5vZGVJZEUxMXNldFByb3BlcnR5RVJLTlNfMTJiYXNpY19zdHJpbmdJY05TXzExY2hhcl90cmFpdHNJY0VFTlNfOWFsbG9jYXRvckljRUVFRVJLTlMyXzJqczVWYWx1ZUVSTlMyXzE3U2hhcmVkUmVzb3VyY2VNYXBFRVVsdkVfTlM4X0lTSl9FRUZOU18xMHNoYXJlZF9wdHJJTlMyXzE0U2hhcmVkUmVzb3VyY2VFRUV2RUVFAAAAAOT8AAC8hAAAOIEAAFpONGVsZW0xMFRhcE91dE5vZGVJZEUxMXNldFByb3BlcnR5RVJLTlN0M19fMjEyYmFzaWNfc3RyaW5nSWNOUzJfMTFjaGFyX3RyYWl0c0ljRUVOUzJfOWFsbG9jYXRvckljRUVFRVJLTlNfMmpzNVZhbHVlRVJOU18xN1NoYXJlZFJlc291cmNlTWFwRUVVbHZFXwC8/AAArIUAAE40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOU18xMFRhcE91dE5vZGVJZEVFRUUAvPwAAEiGAAAAAAAAaIcAAFQAAAC5AwAAugMAALsDAAC8AwAAvQMAAL4DAAC/AwAAwAMAAE5TdDNfXzIxMF9fZnVuY3Rpb242X19mdW5jSU40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOUzJfMTBTYW1wbGVOb2RlSWROUzJfMjNWYXJpYWJsZVBpdGNoTGVycFJlYWRlcklmRUVFRUVFTlNfOWFsbG9jYXRvcklTOV9FRUZOU18xMHNoYXJlZF9wdHJJTlMyXzlHcmFwaE5vZGVJZEVFRUVpZGlFRUUAAOT8AAC0hgAAUA8AAAAAAAD8hwAAwQMAAMIDAADDAwAAUgAAAMQDAABOU3QzX18yMjBfX3NoYXJlZF9wdHJfZW1wbGFjZUlONGVsZW0xMFNhbXBsZU5vZGVJZE5TMV8yM1ZhcmlhYmxlUGl0Y2hMZXJwUmVhZGVySWZFRUVFTlNfOWFsbG9jYXRvcklTNV9FRUVFAADk/AAAkIcAACT6AAAAAAAAZIgAAMUDAADGAwAAaQAAAMcDAADIAwAAZgAAAMkDAABONGVsZW0xMFNhbXBsZU5vZGVJZE5TXzIzVmFyaWFibGVQaXRjaExlcnBSZWFkZXJJZkVFRUUAAOT8AAAsiAAAMBAAAE40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOU18xMFNhbXBsZU5vZGVJZE5TXzIzVmFyaWFibGVQaXRjaExlcnBSZWFkZXJJZkVFRUVFRQC8/AAAcIgAAAAAAACYiQAAVAAAAMoDAADLAwAAzAMAAM0DAADOAwAAzwMAANADAADRAwAATlN0M19fMjEwX19mdW5jdGlvbjZfX2Z1bmNJTjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TMl8xM1NhbXBsZVNlcU5vZGVJZExiMEVFRUVFTlNfOWFsbG9jYXRvcklTN19FRUZOU18xMHNoYXJlZF9wdHJJTlMyXzlHcmFwaE5vZGVJZEVFRUVpZGlFRUUAAAAA5PwAAPyIAABQDwAAAAAAABSKAADSAwAA0wMAANQDAABSAAAA1QMAAE5TdDNfXzIyMF9fc2hhcmVkX3B0cl9lbXBsYWNlSU40ZWxlbTEzU2FtcGxlU2VxTm9kZUlkTGIwRUVFTlNfOWFsbG9jYXRvcklTM19FRUVFAAAAAOT8AADAiQAAJPoAAAAAAABkigAA1gMAANcDAABpAAAA2AMAANkDAABmAAAAZwAAAE40ZWxlbTEzU2FtcGxlU2VxTm9kZUlkTGIwRUVFAAAA5PwAAESKAAAwEAAATjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TXzEzU2FtcGxlU2VxTm9kZUlkTGIwRUVFRUUAALz8AABwigAAAAAAAICLAABUAAAA2gMAANsDAADcAwAA3QMAAN4DAADfAwAA4AMAAOEDAABOU3QzX18yMTBfX2Z1bmN0aW9uNl9fZnVuY0lONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlMyXzEzU2FtcGxlU2VxTm9kZUlkTGIxRUVFRUVOU185YWxsb2NhdG9ySVM3X0VFRk5TXzEwc2hhcmVkX3B0cklOUzJfOUdyYXBoTm9kZUlkRUVFRWlkaUVFRQAAAADk/AAA5IoAAFAPAAAAAAAA/IsAAOIDAADjAwAA5AMAAFIAAADlAwAATlN0M19fMjIwX19zaGFyZWRfcHRyX2VtcGxhY2VJTjRlbGVtMTNTYW1wbGVTZXFOb2RlSWRMYjFFRUVOU185YWxsb2NhdG9ySVMzX0VFRUUAAAAA5PwAAKiLAAAk+gAAAAAAAEyMAADmAwAA5wMAAGkAAADoAwAA6QMAAGYAAABnAAAATjRlbGVtMTNTYW1wbGVTZXFOb2RlSWRMYjFFRUUAAADk/AAALIwAADAQAABONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlNfMTNTYW1wbGVTZXFOb2RlSWRMYjFFRUVFRQAAvPwAAFiMAAAAAAAAXI0AAFQAAADqAwAA6wMAAOwDAADtAwAA7gMAAO8DAADwAwAA8QMAAE5TdDNfXzIxMF9fZnVuY3Rpb242X19mdW5jSU40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOUzJfOVRhYmxlTm9kZUlkRUVFRU5TXzlhbGxvY2F0b3JJUzdfRUVGTlNfMTBzaGFyZWRfcHRySU5TMl85R3JhcGhOb2RlSWRFRUVFaWRpRUVFAOT8AADMjAAAUA8AAAAAAADMjQAA8gMAAPMDAAD0AwAAUgAAAPUDAABOU3QzX18yMjBfX3NoYXJlZF9wdHJfZW1wbGFjZUlONGVsZW05VGFibGVOb2RlSWRFRU5TXzlhbGxvY2F0b3JJUzNfRUVFRQDk/AAAhI0AACT6AAAAAAAAFI4AAPYDAAD3AwAAaQAAAPgDAAD5AwAAZgAAAGcAAABONGVsZW05VGFibGVOb2RlSWRFRQAAAADk/AAA/I0AADAQAABONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlNfOVRhYmxlTm9kZUlkRUVFRQAAALz8AAAgjgAAAAAAACSPAABUAAAA+gMAAPsDAAD8AwAA/QMAAP4DAAD/AwAAAAQAAAEEAABOU3QzX18yMTBfX2Z1bmN0aW9uNl9fZnVuY0lONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlMyXzEzTUNDYXB0dXJlTm9kZUlkRUVFRU5TXzlhbGxvY2F0b3JJUzdfRUVGTlNfMTBzaGFyZWRfcHRySU5TMl85R3JhcGhOb2RlSWRFRUVFaWRpRUVFAAAAAOT8AACMjgAAUA8AAAAAAACcjwAAAgQAAAMEAAAEBAAAUgAAAAUEAABOU3QzX18yMjBfX3NoYXJlZF9wdHJfZW1wbGFjZUlONGVsZW0xM01DQ2FwdHVyZU5vZGVJZEVFTlNfOWFsbG9jYXRvcklTM19FRUVFAAAAAOT8AABMjwAAJPoAAAAAAADojwAABgQAAAcEAAAIBAAAZAAAAAkEAAAKBAAAZwAAAE40ZWxlbTEzTUNDYXB0dXJlTm9kZUlkRUUAAADk/AAAzI8AADAQAABONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlNfMTNNQ0NhcHR1cmVOb2RlSWRFRUVFAAC8/AAA9I8AAAAAAAD4kAAAVAAAAAsEAAAMBAAADQQAAA4EAAAPBAAAEAQAABEEAAASBAAATlN0M19fMjEwX19mdW5jdGlvbjZfX2Z1bmNJTjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TMl8xMk1DU2FtcGxlTm9kZUlkRUVFRU5TXzlhbGxvY2F0b3JJUzdfRUVGTlNfMTBzaGFyZWRfcHRySU5TMl85R3JhcGhOb2RlSWRFRUVFaWRpRUVFAOT8AABkkAAAUA8AAAAAAABskQAAEwQAABQEAAAVBAAAUgAAABYEAABOU3QzX18yMjBfX3NoYXJlZF9wdHJfZW1wbGFjZUlONGVsZW0xMk1DU2FtcGxlTm9kZUlkRUVOU185YWxsb2NhdG9ySVMzX0VFRUUA5PwAACCRAAAk+gAAAAAAALiRAAAXBAAAGAQAAGkAAAAZBAAAGgQAAGYAAAAbBAAATjRlbGVtMTJNQ1NhbXBsZU5vZGVJZEVFAAAAAOT8AACckQAAMBAAAE40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOU18xMk1DU2FtcGxlTm9kZUlkRUVFRQAAALz8AADEkQAAAAAAANSSAABUAAAAHAQAAB0EAAAeBAAAHwQAACAEAAAhBAAAIgQAACMEAABOU3QzX18yMTBfX2Z1bmN0aW9uNl9fZnVuY0lONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlMyXzE5U3RlcmVvU2FtcGxlU2VxTm9kZUlkTGIwRUVFRUVOU185YWxsb2NhdG9ySVM3X0VFRk5TXzEwc2hhcmVkX3B0cklOUzJfOUdyYXBoTm9kZUlkRUVFRWlkaUVFRQAA5PwAADSSAABQDwAAAAAAAFSTAAAkBAAAJQQAACYEAABSAAAAJwQAAE5TdDNfXzIyMF9fc2hhcmVkX3B0cl9lbXBsYWNlSU40ZWxlbTE5U3RlcmVvU2FtcGxlU2VxTm9kZUlkTGIwRUVFTlNfOWFsbG9jYXRvcklTM19FRUVFAADk/AAA/JIAACT6AAAAAAAAqJMAACgEAAApBAAAaQAAACoEAAArBAAAZgAAAGcAAABONGVsZW0xOVN0ZXJlb1NhbXBsZVNlcU5vZGVJZExiMEVFRQDk/AAAhJMAADAQAABONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlNfMTlTdGVyZW9TYW1wbGVTZXFOb2RlSWRMYjBFRUVFRQAAAAC8/AAAtJMAAAAAAADQlAAAVAAAACwEAAAtBAAALgQAAC8EAAAwBAAAMQQAADIEAAAzBAAATlN0M19fMjEwX19mdW5jdGlvbjZfX2Z1bmNJTjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TMl8xOVN0ZXJlb1NhbXBsZVNlcU5vZGVJZExiMUVFRUVFTlNfOWFsbG9jYXRvcklTN19FRUZOU18xMHNoYXJlZF9wdHJJTlMyXzlHcmFwaE5vZGVJZEVFRUVpZGlFRUUAAOT8AAAwlAAAUA8AAAAAAABQlQAANAQAADUEAAA2BAAAUgAAADcEAABOU3QzX18yMjBfX3NoYXJlZF9wdHJfZW1wbGFjZUlONGVsZW0xOVN0ZXJlb1NhbXBsZVNlcU5vZGVJZExiMUVFRU5TXzlhbGxvY2F0b3JJUzNfRUVFRQAA5PwAAPiUAAAk+gAAAAAAAKSVAAA4BAAAOQQAAGkAAAA6BAAAOwQAAGYAAABnAAAATjRlbGVtMTlTdGVyZW9TYW1wbGVTZXFOb2RlSWRMYjFFRUUA5PwAAICVAAAwEAAATjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TXzE5U3RlcmVvU2FtcGxlU2VxTm9kZUlkTGIxRUVFRUUAAAAAvPwAALCVAAAAAAAAxJYAAFQAAAA8BAAAPQQAAD4EAAA/BAAAQAQAAEEEAABCBAAAQwQAAE5TdDNfXzIxMF9fZnVuY3Rpb242X19mdW5jSU40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOUzJfMTVTdGVyZW9UYWJsZU5vZGVJZEVFRUVOU185YWxsb2NhdG9ySVM3X0VFRk5TXzEwc2hhcmVkX3B0cklOUzJfOUdyYXBoTm9kZUlkRUVFRWlkaUVFRQAA5PwAACyWAABQDwAAAAAAADyXAABEBAAARQQAAEYEAABSAAAARwQAAE5TdDNfXzIyMF9fc2hhcmVkX3B0cl9lbXBsYWNlSU40ZWxlbTE1U3RlcmVvVGFibGVOb2RlSWRFRU5TXzlhbGxvY2F0b3JJUzNfRUVFRQAA5PwAAOyWAAAk+gAAAAAAAIiXAABIBAAASQQAAGkAAABKBAAASwQAAGYAAABnAAAATjRlbGVtMTVTdGVyZW9UYWJsZU5vZGVJZEVFAOT8AABslwAAMBAAAE40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOU18xNVN0ZXJlb1RhYmxlTm9kZUlkRUVFRQAAAAC8/AAAlJcAAAAAAAC4mAAAVAAAAEwEAABNBAAATgQAAE8EAABQBAAAUQQAAFIEAABTBAAATlN0M19fMjEwX19mdW5jdGlvbjZfX2Z1bmNJTjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TMl8yMlBvbHlCbGVwT3NjaWxsYXRvck5vZGVJZExOUzNfOEJsZXBNb2RlRTBFRUVFRU5TXzlhbGxvY2F0b3JJUzhfRUVGTlNfMTBzaGFyZWRfcHRySU5TMl85R3JhcGhOb2RlSWRFRUVFaWRpRUVFAADk/AAACJgAAFAPAAAAAAAAUJkAAFQEAABVBAAAVgQAAFIAAABXBAAATlN0M19fMjIwX19zaGFyZWRfcHRyX2VtcGxhY2VJTjRlbGVtMjJQb2x5QmxlcE9zY2lsbGF0b3JOb2RlSWRMTlMxXzZkZXRhaWw4QmxlcE1vZGVFMEVFRU5TXzlhbGxvY2F0b3JJUzVfRUVFRQAAAOT8AADgmAAAJPoAAAAAAAC8mQAAYQAAAFgEAABpAAAAZAAAAFkEAABmAAAAZwAAAE40ZWxlbTIyUG9seUJsZXBPc2NpbGxhdG9yTm9kZUlkTE5TXzZkZXRhaWw4QmxlcE1vZGVFMEVFRQAAAOT8AACAmQAAMBAAAE40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOU18yMlBvbHlCbGVwT3NjaWxsYXRvck5vZGVJZExOUzBfOEJsZXBNb2RlRTBFRUVFRQAAAAC8/AAAyJkAAAAAAAAEmwAAVAAAAFoEAABbBAAAXAQAAF0EAABeBAAAXwQAAGAEAABhBAAATlN0M19fMjEwX19mdW5jdGlvbjZfX2Z1bmNJTjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TMl8yMlBvbHlCbGVwT3NjaWxsYXRvck5vZGVJZExOUzNfOEJsZXBNb2RlRTFFRUVFRU5TXzlhbGxvY2F0b3JJUzhfRUVGTlNfMTBzaGFyZWRfcHRySU5TMl85R3JhcGhOb2RlSWRFRUVFaWRpRUVFAADk/AAAVJoAAFAPAAAAAAAAnJsAAGIEAABjBAAAZAQAAFIAAABlBAAATlN0M19fMjIwX19zaGFyZWRfcHRyX2VtcGxhY2VJTjRlbGVtMjJQb2x5QmxlcE9zY2lsbGF0b3JOb2RlSWRMTlMxXzZkZXRhaWw4QmxlcE1vZGVFMUVFRU5TXzlhbGxvY2F0b3JJUzVfRUVFRQAAAOT8AAAsmwAAJPoAAAAAAAAInAAAYQAAAGYEAABpAAAAZAAAAGcEAABmAAAAZwAAAE40ZWxlbTIyUG9seUJsZXBPc2NpbGxhdG9yTm9kZUlkTE5TXzZkZXRhaWw4QmxlcE1vZGVFMUVFRQAAAOT8AADMmwAAMBAAAE40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOU18yMlBvbHlCbGVwT3NjaWxsYXRvck5vZGVJZExOUzBfOEJsZXBNb2RlRTFFRUVFRQAAAAC8/AAAFJwAAAAAAABQnQAAVAAAAGgEAABpBAAAagQAAGsEAABsBAAAbQQAAG4EAABvBAAATlN0M19fMjEwX19mdW5jdGlvbjZfX2Z1bmNJTjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TMl8yMlBvbHlCbGVwT3NjaWxsYXRvck5vZGVJZExOUzNfOEJsZXBNb2RlRTJFRUVFRU5TXzlhbGxvY2F0b3JJUzhfRUVGTlNfMTBzaGFyZWRfcHRySU5TMl85R3JhcGhOb2RlSWRFRUVFaWRpRUVFAADk/AAAoJwAAFAPAAAAAAAA6J0AAHAEAABxBAAAcgQAAFIAAABzBAAATlN0M19fMjIwX19zaGFyZWRfcHRyX2VtcGxhY2VJTjRlbGVtMjJQb2x5QmxlcE9zY2lsbGF0b3JOb2RlSWRMTlMxXzZkZXRhaWw4QmxlcE1vZGVFMkVFRU5TXzlhbGxvY2F0b3JJUzVfRUVFRQAAAOT8AAB4nQAAJPoAAAAAAABUngAAYQAAAHQEAABpAAAAZAAAAHUEAABmAAAAZwAAAE40ZWxlbTIyUG9seUJsZXBPc2NpbGxhdG9yTm9kZUlkTE5TXzZkZXRhaWw4QmxlcE1vZGVFMkVFRQAAAOT8AAAYngAAMBAAAE40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOU18yMlBvbHlCbGVwT3NjaWxsYXRvck5vZGVJZExOUzBfOEJsZXBNb2RlRTJFRUVFRQAAAAC8/AAAYJ4AAAAAAAB8nwAAVAAAAHYEAAB3BAAAeAQAAHkEAAB6BAAAewQAAHwEAAB9BAAATlN0M19fMjEwX19mdW5jdGlvbjZfX2Z1bmNJTjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TMl85TWV0ZXJOb2RlSWRFRUVFTlNfOWFsbG9jYXRvcklTN19FRUZOU18xMHNoYXJlZF9wdHJJTlMyXzlHcmFwaE5vZGVJZEVFRUVpZGlFRUUA5PwAAOyeAABQDwAAAAAAAOyfAAB+BAAAfwQAAIAEAABSAAAAgQQAAE5TdDNfXzIyMF9fc2hhcmVkX3B0cl9lbXBsYWNlSU40ZWxlbTlNZXRlck5vZGVJZEVFTlNfOWFsbG9jYXRvcklTM19FRUVFAOT8AACknwAAJPoAAAAAAAA0oAAAggQAAIMEAABpAAAAZAAAAIQEAACFBAAAZwAAAE40ZWxlbTlNZXRlck5vZGVJZEVFAAAAAOT8AAAcoAAAMBAAAE40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOU185TWV0ZXJOb2RlSWRFRUVFAAAAvPwAAECgAAAAAAAAPKEAAFQAAACGBAAAhwQAAIgEAACJBAAAigQAAIsEAACMBAAAjQQAAE5TdDNfXzIxMF9fZnVuY3Rpb242X19mdW5jSU40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOUzJfOVNjb3BlTm9kZUlkRUVFRU5TXzlhbGxvY2F0b3JJUzdfRUVGTlNfMTBzaGFyZWRfcHRySU5TMl85R3JhcGhOb2RlSWRFRUVFaWRpRUVFAOT8AACsoAAAUA8AAAAAAACsoQAAjgQAAI8EAACQBAAAUgAAAJEEAABOU3QzX18yMjBfX3NoYXJlZF9wdHJfZW1wbGFjZUlONGVsZW05U2NvcGVOb2RlSWRFRU5TXzlhbGxvY2F0b3JJUzNfRUVFRQDk/AAAZKEAACT6AAAAAAAA9KEAAJIEAACTBAAAlAQAAGQAAACVBAAAlgQAAGcAAABONGVsZW05U2NvcGVOb2RlSWRFRQAAAADk/AAA3KEAADAQAABONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlNfOVNjb3BlTm9kZUlkRUVFRQAAALz8AAAAogAAAAAAAACjAABUAAAAlwQAAJgEAACZBAAAmgQAAJsEAACcBAAAnQQAAJ4EAABOU3QzX18yMTBfX2Z1bmN0aW9uNl9fZnVuY0lONGVsZW02ZGV0YWlsMThHZW5lcmljTm9kZUZhY3RvcnlJTlMyXzEyU25hcHNob3ROb2RlSWRFRUVFTlNfOWFsbG9jYXRvcklTN19FRUZOU18xMHNoYXJlZF9wdHJJTlMyXzlHcmFwaE5vZGVJZEVFRUVpZGlFRUUA5PwAAGyiAABQDwAAAAAAAHSjAACfBAAAoAQAAKEEAABSAAAAogQAAE5TdDNfXzIyMF9fc2hhcmVkX3B0cl9lbXBsYWNlSU40ZWxlbTEyU25hcHNob3ROb2RlSWRFRU5TXzlhbGxvY2F0b3JJUzNfRUVFRQDk/AAAKKMAACT6AAAAAAAAwKMAAKMEAACkBAAAaQAAAGQAAAClBAAApgQAAGcAAABONGVsZW0xMlNuYXBzaG90Tm9kZUlkRUUAAAAA5PwAAKSjAAAwEAAATjRlbGVtNmRldGFpbDE4R2VuZXJpY05vZGVGYWN0b3J5SU5TXzEyU25hcHNob3ROb2RlSWRFRUVFAAAAvPwAAMyjAAAAAAAA0KQAAFQAAACnBAAAqAQAAKkEAACqBAAAqwQAAKwEAACtBAAArgQAAE5TdDNfXzIxMF9fZnVuY3Rpb242X19mdW5jSU40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOUzJfMTFDYXB0dXJlTm9kZUlkRUVFRU5TXzlhbGxvY2F0b3JJUzdfRUVGTlNfMTBzaGFyZWRfcHRySU5TMl85R3JhcGhOb2RlSWRFRUVFaWRpRUVFAADk/AAAPKQAAFAPAAAAAAAARKUAAK8EAACwBAAAsQQAAFIAAACyBAAATlN0M19fMjIwX19zaGFyZWRfcHRyX2VtcGxhY2VJTjRlbGVtMTFDYXB0dXJlTm9kZUlkRUVOU185YWxsb2NhdG9ySVMzX0VFRUUAAOT8AAD4pAAAJPoAAAAAAACMpQAAswQAALQEAABpAAAAZAAAALUEAAC2BAAAZwAAAE40ZWxlbTExQ2FwdHVyZU5vZGVJZEVFAOT8AAB0pQAAMBAAAE40ZWxlbTZkZXRhaWwxOEdlbmVyaWNOb2RlRmFjdG9yeUlOU18xMUNhcHR1cmVOb2RlSWRFRUVFAAAAALz8AACYpQAAAAAAAJSmAABUAAAAtwQAALgEAAC5BAAAugQAALsEAAC8BAAAvQQAAL4EAABOU3QzX18yMTBfX2Z1bmN0aW9uNl9fZnVuY0laTjI0RWxlbWVudGFyeUF1ZGlvUHJvY2Vzc29yN3ByZXBhcmVFZGpFVWxpZGlFX05TXzlhbGxvY2F0b3JJUzNfRUVGTlNfMTBzaGFyZWRfcHRySU40ZWxlbTlHcmFwaE5vZGVJZEVFRUVpZGlFRUUAAOT8AAAIpgAAUA8AAAAAAAAMpwAAvwQAAMAEAADBBAAAUgAAAMIEAABOU3QzX18yMjBfX3NoYXJlZF9wdHJfZW1wbGFjZUlONGVsZW0xNUNvbnZvbHV0aW9uTm9kZUlkRUVOU185YWxsb2NhdG9ySVMzX0VFRUUAAOT8AAC8pgAAJPoAAAAAAABYpwAAwwQAAMQEAABpAAAAxQQAAMYEAABmAAAAZwAAAE40ZWxlbTE1Q29udm9sdXRpb25Ob2RlSWRFRQDk/AAAPKcAADAQAAAAAAAA3KcAAMcEAADIBAAAyQQAAFIAAADKBAAATlN0M19fMjIwX19zaGFyZWRfcHRyX2VtcGxhY2VJTjEyZmZ0Y29udm9sdmVyMjBUd29TdGFnZUZGVENvbnZvbHZlckVOU185YWxsb2NhdG9ySVMyX0VFRUUAAADk/AAAgKcAACT6AABaTjI0RWxlbWVudGFyeUF1ZGlvUHJvY2Vzc29yN3ByZXBhcmVFZGpFVWxpZGlFXwC8/AAA6KcAAAAAAADYqAAAVAAAAMsEAADMBAAAzQQAAM4EAADPBAAA0AQAANEEAADSBAAATlN0M19fMjEwX19mdW5jdGlvbjZfX2Z1bmNJWk4yNEVsZW1lbnRhcnlBdWRpb1Byb2Nlc3NvcjdwcmVwYXJlRWRqRVVsaWRpRTBfTlNfOWFsbG9jYXRvcklTM19FRUZOU18xMHNoYXJlZF9wdHJJTjRlbGVtOUdyYXBoTm9kZUlkRUVFRWlkaUVFRQDk/AAATKgAAFAPAAAAAAAASKkAANMEAADUBAAA1QQAAFIAAADWBAAATlN0M19fMjIwX19zaGFyZWRfcHRyX2VtcGxhY2VJTjRlbGVtN0ZGVE5vZGVJZEVFTlNfOWFsbG9jYXRvcklTM19FRUVFAAAA5PwAAACpAAAk+gAAAAAAAIypAADXBAAA2AQAANkEAABkAAAA2gQAANsEAABnAAAATjRlbGVtN0ZGVE5vZGVJZEVFAADk/AAAeKkAADAQAABaTjI0RWxlbWVudGFyeUF1ZGlvUHJvY2Vzc29yN3ByZXBhcmVFZGpFVWxpZGlFMF8AAAAAvPwAAJipAAAAAAAAjKoAAFQAAADcBAAA3QQAAN4EAADfBAAA4AQAAOEEAADiBAAA4wQAAE5TdDNfXzIxMF9fZnVuY3Rpb242X19mdW5jSVpOMjRFbGVtZW50YXJ5QXVkaW9Qcm9jZXNzb3I3cHJlcGFyZUVkakVVbGlkaUUxX05TXzlhbGxvY2F0b3JJUzNfRUVGTlNfMTBzaGFyZWRfcHRySU40ZWxlbTlHcmFwaE5vZGVJZEVFRUVpZGlFRUUA5PwAAACqAABQDwAAAAAAAASrAADkBAAA5QQAAOYEAABSAAAA5wQAAE5TdDNfXzIyMF9fc2hhcmVkX3B0cl9lbXBsYWNlSU40ZWxlbTEzTWV0cm9ub21lTm9kZUlkRUVOU185YWxsb2NhdG9ySVMzX0VFRUUAAAAA5PwAALSqAAAk+gAAAAAAAFCrAABhAAAA6AQAAOkEAABkAAAA6gQAAOsEAABnAAAATjRlbGVtMTNNZXRyb25vbWVOb2RlSWRFRQAAAOT8AAA0qwAAMBAAAFpOMjRFbGVtZW50YXJ5QXVkaW9Qcm9jZXNzb3I3cHJlcGFyZUVkakVVbGlkaUUxXwAAAAC8/AAAXKsAAAAAAABQrAAAVAAAAOwEAADtBAAA7gQAAO8EAADwBAAA8QQAAPIEAADzBAAATlN0M19fMjEwX19mdW5jdGlvbjZfX2Z1bmNJWk4yNEVsZW1lbnRhcnlBdWRpb1Byb2Nlc3NvcjdwcmVwYXJlRWRqRVVsaWRpRTJfTlNfOWFsbG9jYXRvcklTM19FRUZOU18xMHNoYXJlZF9wdHJJTjRlbGVtOUdyYXBoTm9kZUlkRUVFRWlkaUVFRQDk/AAAxKsAAFAPAAAAAAAAyKwAAPQEAAD1BAAA9gQAAFIAAAD3BAAATlN0M19fMjIwX19zaGFyZWRfcHRyX2VtcGxhY2VJTjRlbGVtMTRTYW1wbGVUaW1lTm9kZUlkRUVOU185YWxsb2NhdG9ySVMzX0VFRUUAAADk/AAAeKwAACT6AAAAAAAAFK0AAGEAAAD4BAAAaQAAAGQAAAD5BAAAZgAAAGcAAABONGVsZW0xNFNhbXBsZVRpbWVOb2RlSWRFRQAA5PwAAPisAAAwEAAAWk4yNEVsZW1lbnRhcnlBdWRpb1Byb2Nlc3NvcjdwcmVwYXJlRWRqRVVsaWRpRTJfAAAAALz8AAAgrQAAfK0AAFQNAABY/AAATjEwZW1zY3JpcHRlbjN2YWxFAAC8/AAAaK0AAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWRFRQAAvPwAAIStAAB8rQAAVA0AAHytAABOU3QzX18yMTJiYXNpY19zdHJpbmdJY05TXzExY2hhcl90cmFpdHNJY0VFTlNfOWFsbG9jYXRvckljRUVFRQAAvPwAALitAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lmRUUAALz8AAAArgAA+PsAAHytAAB8rQAAfK0AAHytAAB8rQAAAAAAAJSvAAD6BAAA+wQAAPwEAAD9BAAA/gQAAP8EAAAABQAAAQUAAAIFAABOU3QzX18yMTBfX2Z1bmN0aW9uNl9fZnVuY0laTjRlbGVtMThSb290UmVuZGVyU2VxdWVuY2VJZEU0cHVzaEVSTlMyXzE1QnVmZmVyQWxsb2NhdG9ySWRFRVJOU18xMHNoYXJlZF9wdHJJTlMyXzlHcmFwaE5vZGVJZEVFRUVSS05TXzZ2ZWN0b3JJTlMyXzE2T3V0bGV0Q29ubmVjdGlvbkVOU185YWxsb2NhdG9ySVNFX0VFRUVFVWxSTlMyXzExSG9zdENvbnRleHRJZEVFRV9OU0ZfSVNOX0VFRnZTTV9FRUUATlN0M19fMjEwX19mdW5jdGlvbjZfX2Jhc2VJRnZSTjRlbGVtMTFIb3N0Q29udGV4dElkRUVFRUUAAAC8/AAAUa8AAOT8AABsrgAAjK8AAFpONGVsZW0xOFJvb3RSZW5kZXJTZXF1ZW5jZUlkRTRwdXNoRVJOU18xNUJ1ZmZlckFsbG9jYXRvcklkRUVSTlN0M19fMjEwc2hhcmVkX3B0cklOU185R3JhcGhOb2RlSWRFRUVFUktOUzVfNnZlY3RvcklOU18xNk91dGxldENvbm5lY3Rpb25FTlM1XzlhbGxvY2F0b3JJU0NfRUVFRUVVbFJOU18xMUhvc3RDb250ZXh0SWRFRUVfAAAAvPwAAKCvAAAAAAAAoLEAAAMFAAAEBQAABQUAAAYFAAAHBQAACAUAAAkFAAAKBQAACwUAAE5TdDNfXzIxMF9fZnVuY3Rpb242X19mdW5jSVpONGVsZW0xOFJvb3RSZW5kZXJTZXF1ZW5jZUlkRTRwdXNoRVJOUzJfMTVCdWZmZXJBbGxvY2F0b3JJZEVFUk5TXzEwc2hhcmVkX3B0cklOUzJfOUdyYXBoTm9kZUlkRUVFRVJLTlNfNnZlY3RvcklOUzJfMTVJbmxldENvbm5lY3Rpb25FTlNfOWFsbG9jYXRvcklTRV9FRUVFUktOU0RfSU5TMl8xNk91dGxldENvbm5lY3Rpb25FTlNGX0lTS19FRUVFRVVsUk5TMl8xMUhvc3RDb250ZXh0SWRFRUVfTlNGX0lTU19FRUZ2U1JfRUVFAAAA5PwAAJCwAACMrwAAWk40ZWxlbTE4Um9vdFJlbmRlclNlcXVlbmNlSWRFNHB1c2hFUk5TXzE1QnVmZmVyQWxsb2NhdG9ySWRFRVJOU3QzX18yMTBzaGFyZWRfcHRySU5TXzlHcmFwaE5vZGVJZEVFRUVSS05TNV82dmVjdG9ySU5TXzE1SW5sZXRDb25uZWN0aW9uRU5TNV85YWxsb2NhdG9ySVNDX0VFRUVSS05TQl9JTlNfMTZPdXRsZXRDb25uZWN0aW9uRU5TRF9JU0lfRUVFRUVVbFJOU18xMUhvc3RDb250ZXh0SWRFRUVfAAAAvPwAAKyxAAD4+wAAVA0AAHZpaQB8rQAAVA0AAGlpaQAAAAAAvLMAAAwFAAANBQAADgUAAA8FAAAQBQAAEQUAABIFAAATBQAAFAUAAE5TdDNfXzIxMF9fZnVuY3Rpb242X19mdW5jSVpONGVsZW03UnVudGltZUlkRTJnY0V2RVVsT1RfRV9OU185YWxsb2NhdG9ySVM3X0VFRnZSTlNfMTBzaGFyZWRfcHRySU5TMl8xOUdyYXBoUmVuZGVyU2VxdWVuY2VJZEVFRUVFRUUATlN0M19fMjEwX19mdW5jdGlvbjZfX2Jhc2VJRnZSTlNfMTBzaGFyZWRfcHRySU40ZWxlbTE5R3JhcGhSZW5kZXJTZXF1ZW5jZUlkRUVFRUVFRQAAALz8AABfswAA5PwAANyyAAC0swAAWk40ZWxlbTdSdW50aW1lSWRFMmdjRXZFVWxPVF9FXwC8/AAAyLMAAHytAABUDQAAfK0AAHytAABpaWlpaQAAAAAAAACMtAAAFQUAABYFAAAXBQAAGAUAABkFAABOU3QzX18yMjBfX3NoYXJlZF9wdHJfcG9pbnRlcklQTjRlbGVtMTRTaGFyZWRSZXNvdXJjZUVOU18xNGRlZmF1bHRfZGVsZXRlSVMyX0VFTlNfOWFsbG9jYXRvcklTMl9FRUVFAAAAAOT8AAAktAAAJPoAAE5TdDNfXzIxNGRlZmF1bHRfZGVsZXRlSU40ZWxlbTE0U2hhcmVkUmVzb3VyY2VFRUUAAAD4+wAAVA0AAFj8AAB2aWlpAAAAAPj7AABUDQAAfK0AAAAAAABUtgAAGgUAABsFAAAcBQAAHQUAAB4FAAAfBQAAIAUAACEFAAAiBQAATlN0M19fMjEwX19mdW5jdGlvbjZfX2Z1bmNJWk4yNEVsZW1lbnRhcnlBdWRpb1Byb2Nlc3NvcjE5cHJvY2Vzc1F1ZXVlZEV2ZW50c0VOMTBlbXNjcmlwdGVuM3ZhbEVFVWxSS05TXzEyYmFzaWNfc3RyaW5nSWNOU18xMWNoYXJfdHJhaXRzSWNFRU5TXzlhbGxvY2F0b3JJY0VFRUVONGVsZW0yanM1VmFsdWVFRV9OUzhfSVNHX0VFRnZTQ19TRl9FRUUATlN0M19fMjEwX19mdW5jdGlvbjZfX2Jhc2VJRnZSS05TXzEyYmFzaWNfc3RyaW5nSWNOU18xMWNoYXJfdHJhaXRzSWNFRU5TXzlhbGxvY2F0b3JJY0VFRUVONGVsZW0yanM1VmFsdWVFRUVFAAC8/AAA3rUAAOT8AAAYtQAATLYAAFpOMjRFbGVtZW50YXJ5QXVkaW9Qcm9jZXNzb3IxOXByb2Nlc3NRdWV1ZWRFdmVudHNFTjEwZW1zY3JpcHRlbjN2YWxFRVVsUktOU3QzX18yMTJiYXNpY19zdHJpbmdJY05TMl8xMWNoYXJfdHJhaXRzSWNFRU5TMl85YWxsb2NhdG9ySWNFRUVFTjRlbGVtMmpzNVZhbHVlRUVfALz8AABgtgAAfK0AAHytAAD4+wAAVA0AAKz8AAB2aWlkAAAAAAAAAABgtwAAIwUAACQFAAAlBQAAJgUAAE4xMmZmdGNvbnZvbHZlcjIwVHdvU3RhZ2VGRlRDb252b2x2ZXJFAAC8/AAAOLcAAAAAAACUtwAAJwUAACgFAABOMTJmZnRjb252b2x2ZXI2QnVmZmVySWZFRQAAvPwAAHi3AAAAAAAAzLcAACkFAAAqBQAATjEyZmZ0Y29udm9sdmVyMTJGRlRDb252b2x2ZXJFAAC8/AAArLcAAAAAAAAwuAAAKwUAACwFAAAtBQAALgUAAC8FAABOOGF1ZGlvZmZ0OE9vdXJhRkZURQBOOGF1ZGlvZmZ0NmRldGFpbDEyQXVkaW9GRlRJbXBsRQAAALz8AAAFuAAA5PwAAPC3AAAouAAATlN0M19fMjEyYmFzaWNfc3RyaW5nSWhOU18xMWNoYXJfdHJhaXRzSWhFRU5TXzlhbGxvY2F0b3JJaEVFRUUAALz8AAA8uAAATlN0M19fMjEyYmFzaWNfc3RyaW5nSXdOU18xMWNoYXJfdHJhaXRzSXdFRU5TXzlhbGxvY2F0b3JJd0VFRUUAALz8AACEuAAATlN0M19fMjEyYmFzaWNfc3RyaW5nSURzTlNfMTFjaGFyX3RyYWl0c0lEc0VFTlNfOWFsbG9jYXRvcklEc0VFRUUAAAC8/AAAzLgAAE5TdDNfXzIxMmJhc2ljX3N0cmluZ0lEaU5TXzExY2hhcl90cmFpdHNJRGlFRU5TXzlhbGxvY2F0b3JJRGlFRUVFAAAAvPwAABi5AABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0ljRUUAALz8AABkuQAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJYUVFAAC8/AAAjLkAAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWhFRQAAvPwAALS5AABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lzRUUAALz8AADcuQAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJdEVFAAC8/AAABLoAAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWlFRQAAvPwAACy6AABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lqRUUAALz8AABUugAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJbEVFAAC8/AAAfLoAAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SW1FRQAAvPwAAKS6AABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0l4RUUAALz8AADMugAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3Zp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\";if(!ra(F)){var sa=F;F=l.locateFile?l.locateFile(sa,\"\"):\"\"+sa}\nfunction ta(a){if(F==F&&fa)var b=new Uint8Array(fa);else{b=F;if(ra(b)){b=atob(b.slice(37));for(var c=new Uint8Array(b.length),d=0;d<b.length;++d)c[d]=b.charCodeAt(d);b=c}else b=void 0;if(!b)if(da)b=da(F);else throw\"sync fetching of the wasm failed: you can preload it to Module['wasmBinary'] manually, or emcc.py will do that for you when generating HTML (but not JS)\";}b=new WebAssembly.Module(b);return[new WebAssembly.Instance(b,a),b]}var ua=a=>{for(;0<a.length;)a.shift()(l)};\nclass va{constructor(a){this.R=a-24}}\nvar wa=0,xa=0,za,G=a=>{for(var b=\"\";x[a];)b+=za[x[a++]];return b},H={},I={},Aa={},J,Ba=a=>{throw new J(a);},K,M=(a,b,c)=>{function d(h){h=c(h);if(h.length!==a.length)throw new K(\"Mismatched type converter count\");for(var m=0;m<a.length;++m)L(a[m],h[m])}a.forEach(function(h){Aa[h]=b});var e=Array(b.length),g=[],f=0;b.forEach((h,m)=>{I.hasOwnProperty(h)?e[m]=I[h]:(g.push(h),H.hasOwnProperty(h)||(H[h]=[]),H[h].push(()=>{e[m]=I[h];++f;f===g.length&&d(e)}))});0===g.length&&d(e)};\nfunction Ca(a,b,c={}){var d=b.name;if(!a)throw new J(`type \"${d}\" must have a positive integer typeid pointer`);if(I.hasOwnProperty(a)){if(c.sa)return;throw new J(`Cannot register type '${d}' twice`);}I[a]=b;delete Aa[a];H.hasOwnProperty(a)&&(b=H[a],delete H[a],b.forEach(e=>e()))}function L(a,b,c={}){if(!(\"argPackAdvance\"in b))throw new TypeError(\"registerType registeredInstance requires argPackAdvance\");return Ca(a,b,c)}\nvar Da=a=>{throw new J(a.O.S.P.name+\" instance already deleted\");},Ea=!1,Fa=()=>{},Ga=(a,b,c)=>{if(b===c)return a;if(void 0===c.U)return null;a=Ga(a,b,c.U);return null===a?null:c.pa(a)},Ha={},N=[],Ia=()=>{for(;N.length;){var a=N.pop();a.O.aa=!1;a[\"delete\"]()}},O,P={},Ja=(a,b)=>{if(void 0===b)throw new J(\"ptr should not be undefined\");for(;a.U;)b=a.da(b),a=a.U;return P[b]},Ka=(a,b)=>{if(!b.S||!b.R)throw new K(\"makeClassHandle requires ptr and ptrType\");if(!!b.V!==!!b.T)throw new K(\"Both smartPtrType and smartPtr must be specified\");\nb.count={value:1};return Q(Object.create(a,{O:{value:b,writable:!0}}))},Q=a=>{if(\"undefined\"===typeof FinalizationRegistry)return Q=b=>b,a;Ea=new FinalizationRegistry(b=>{b=b.O;--b.count.value;0===b.count.value&&(b.T?b.V.Z(b.T):b.S.P.Z(b.R))});Q=b=>{var c=b.O;c.T&&Ea.register(b,{O:c},b);return b};Fa=b=>{Ea.unregister(b)};return Q(a)};function La(){}\nvar R=(a,b)=>Object.defineProperty(b,\"name\",{value:a}),Ma=(a,b,c)=>{if(void 0===a[b].Y){var d=a[b];a[b]=function(){if(!a[b].Y.hasOwnProperty(arguments.length))throw new J(`Function '${c}' called with an invalid number of arguments (${arguments.length}) - expects one of (${a[b].Y})!`);return a[b].Y[arguments.length].apply(this,arguments)};a[b].Y=[];a[b].Y[d.ea]=d}},Na=(a,b)=>{if(l.hasOwnProperty(a))throw new J(`Cannot register public name '${a}' twice`);l[a]=b},Oa=a=>{if(void 0===a)return\"_unknown\";\na=a.replace(/[^a-zA-Z0-9_]/g,\"$\");var b=a.charCodeAt(0);return 48<=b&&57>=b?`_${a}`:a};function Pa(a,b,c,d,e,g,f,h){this.name=a;this.constructor=b;this.ba=c;this.Z=d;this.U=e;this.qa=g;this.da=f;this.pa=h;this.va=[]}var Qa=(a,b,c)=>{for(;b!==c;){if(!b.da)throw new J(`Expected null or instance of ${c.name}, got an instance of ${b.name}`);a=b.da(a);b=b.U}return a};\nfunction Ra(a,b){if(null===b){if(this.ha)throw new J(`null is not a valid ${this.name}`);return 0}if(!b.O)throw new J(`Cannot pass \"${Sa(b)}\" as a ${this.name}`);if(!b.O.R)throw new J(`Cannot pass deleted object as a pointer of type ${this.name}`);return Qa(b.O.R,b.O.S.P,this.P)}\nfunction Ta(a,b){if(null===b){if(this.ha)throw new J(`null is not a valid ${this.name}`);if(this.ga){var c=this.wa();null!==a&&a.push(this.Z,c);return c}return 0}if(!b||!b.O)throw new J(`Cannot pass \"${Sa(b)}\" as a ${this.name}`);if(!b.O.R)throw new J(`Cannot pass deleted object as a pointer of type ${this.name}`);if(!this.fa&&b.O.S.fa)throw new J(`Cannot convert argument of type ${b.O.V?b.O.V.name:b.O.S.name} to parameter type ${this.name}`);c=Qa(b.O.R,b.O.S.P,this.P);if(this.ga){if(void 0===b.O.T)throw new J(\"Passing raw pointer to smart pointer is illegal\");\nswitch(this.ya){case 0:if(b.O.V===this)c=b.O.T;else throw new J(`Cannot convert argument of type ${b.O.V?b.O.V.name:b.O.S.name} to parameter type ${this.name}`);break;case 1:c=b.O.T;break;case 2:if(b.O.V===this)c=b.O.T;else{var d=b.clone();c=this.xa(c,S(()=>d[\"delete\"]()));null!==a&&a.push(this.Z,c)}break;default:throw new J(\"Unsupporting sharing policy\");}}return c}\nfunction Ua(a,b){if(null===b){if(this.ha)throw new J(`null is not a valid ${this.name}`);return 0}if(!b.O)throw new J(`Cannot pass \"${Sa(b)}\" as a ${this.name}`);if(!b.O.R)throw new J(`Cannot pass deleted object as a pointer of type ${this.name}`);if(b.O.S.fa)throw new J(`Cannot convert argument of type ${b.O.S.name} to parameter type ${this.name}`);return Qa(b.O.R,b.O.S.P,this.P)}function Va(a){return this.fromWireType(B[a>>2])}\nfunction Wa(a,b,c,d,e,g,f,h,m,k,n){this.name=a;this.P=b;this.ha=c;this.fa=d;this.ga=e;this.ua=g;this.ya=f;this.ma=h;this.wa=m;this.xa=k;this.Z=n;e||void 0!==b.U?this.toWireType=Ta:(this.toWireType=d?Ra:Ua,this.W=null)}\nvar Xa=(a,b)=>{if(!l.hasOwnProperty(a))throw new K(\"Replacing nonexistant public symbol\");l[a]=b;l[a].ea=void 0},Ya=[],Za,$a=a=>{var b=Ya[a];b||(a>=Ya.length&&(Ya.length=a+1),Ya[a]=b=Za.get(a));return b},ab=(a,b)=>{var c=[];return function(){c.length=0;Object.assign(c,arguments);if(a.includes(\"j\")){var d=l[\"dynCall_\"+a];d=c&&c.length?d.apply(null,[b].concat(c)):d.call(null,b)}else d=$a(b).apply(null,c);return d}},T=(a,b)=>{a=G(a);var c=a.includes(\"j\")?ab(a,b):$a(b);if(\"function\"!=typeof c)throw new J(`unknown function pointer with signature ${a}: ${b}`);\nreturn c},bb,db=a=>{a=cb(a);var b=G(a);U(a);return b},eb=(a,b)=>{function c(g){e[g]||I[g]||(Aa[g]?Aa[g].forEach(c):(d.push(g),e[g]=!0))}var d=[],e={};b.forEach(c);throw new bb(`${a}: `+d.map(db).join([\", \"]));},fb=(a,b)=>{for(var c=[],d=0;d<a;d++)c.push(B[b+4*d>>2]);return c},hb=a=>{for(;a.length;){var b=a.pop();a.pop()(b)}};function ib(a){for(var b=1;b<a.length;++b)if(null!==a[b]&&void 0===a[b].W)return!0;return!1}\nfunction jb(a){var b=Function;if(!(b instanceof Function))throw new TypeError(`new_ called with constructor type ${typeof b} which is not a function`);var c=R(b.name||\"unknownFunctionName\",function(){});c.prototype=b.prototype;c=new c;a=b.apply(c,a);return a instanceof Object?a:c}\nfunction kb(a,b,c,d,e,g){var f=b.length;if(2>f)throw new J(\"argTypes array size mismatch! Must at least get return value and 'this' types!\");var h=null!==b[1]&&null!==c,m=ib(b);c=\"void\"!==b[0].name;d=[Ba,d,e,hb,b[0],b[1]];for(e=0;e<f-2;++e)d.push(b[e+2]);if(!m)for(e=h?1:2;e<b.length;++e)null!==b[e].W&&d.push(b[e].W);m=ib(b);e=b.length;var k=\"\",n=\"\";for(f=0;f<e-2;++f)k+=(0!==f?\", \":\"\")+\"arg\"+f,n+=(0!==f?\", \":\"\")+\"arg\"+f+\"Wired\";k=`\\n        return function (${k}) {\\n        if (arguments.length !== ${e-\n2}) {\\n          throwBindingError('function ${a} called with ' + arguments.length + ' arguments, expected ${e-2}');\\n        }`;m&&(k+=\"var destructors = [];\\n\");var r=m?\"destructors\":\"null\",q=\"throwBindingError invoker fn runDestructors retType classParam\".split(\" \");h&&(k+=\"var thisWired = classParam['toWireType'](\"+r+\", this);\\n\");for(f=0;f<e-2;++f)k+=\"var arg\"+f+\"Wired = argType\"+f+\"['toWireType'](\"+r+\", arg\"+f+\"); // \"+b[f+2].name+\"\\n\",q.push(\"argType\"+f);h&&(n=\"thisWired\"+(0<n.length?\", \":\n\"\")+n);k+=(c||g?\"var rv = \":\"\")+\"invoker(fn\"+(0<n.length?\", \":\"\")+n+\");\\n\";if(m)k+=\"runDestructors(destructors);\\n\";else for(f=h?1:2;f<b.length;++f)g=1===f?\"thisWired\":\"arg\"+(f-2)+\"Wired\",null!==b[f].W&&(k+=g+\"_dtor(\"+g+\"); // \"+b[f].name+\"\\n\",q.push(g+\"_dtor\"));c&&(k+=\"var ret = retType['fromWireType'](rv);\\nreturn ret;\\n\");let [t,u]=[q,k+\"}\\n\"];t.push(u);b=jb(t).apply(null,d);return R(a,b)}var lb=a=>{a=a.trim();const b=a.indexOf(\"(\");return-1!==b?a.substr(0,b):a};\nclass mb{constructor(){this.X=[void 0];this.ia=[]}get(a){return this.X[a]}has(a){return void 0!==this.X[a]}}var V=new mb,nb=a=>{a>=V.ja&&0===--V.get(a).na&&(V.X[a]=void 0,V.ia.push(a))},Y=a=>{if(!a)throw new J(\"Cannot use deleted val. handle = \"+a);return V.get(a).value},S=a=>{switch(a){case void 0:return 1;case null:return 2;case !0:return 3;case !1:return 4;default:a={na:1,value:a};var b=V.ia.pop()||V.X.length;V.X[b]=a;return b}};function ob(a){return this.fromWireType(A[a>>2])}\nfor(var pb={name:\"emscripten::val\",fromWireType:a=>{var b=Y(a);nb(a);return b},toWireType:(a,b)=>S(b),argPackAdvance:8,readValueFromPointer:ob,W:null},Sa=a=>{if(null===a)return\"null\";var b=typeof a;return\"object\"===b||\"array\"===b||\"function\"===b?a.toString():\"\"+a},qb=(a,b)=>{switch(b){case 4:return function(c){return this.fromWireType(ja[c>>2])};case 8:return function(c){return this.fromWireType(ka[c>>3])};default:throw new TypeError(`invalid float width (${b}): ${a}`);}},rb=(a,b,c)=>{switch(b){case 1:return c?\nd=>ia[d>>0]:d=>x[d>>0];case 2:return c?d=>y[d>>1]:d=>z[d>>1];case 4:return c?d=>A[d>>2]:d=>B[d>>2];default:throw new TypeError(`invalid integer width (${b}): ${a}`);}},sb=\"undefined\"!=typeof TextDecoder?new TextDecoder(\"utf8\"):void 0,tb=\"undefined\"!=typeof TextDecoder?new TextDecoder(\"utf-16le\"):void 0,ub=(a,b)=>{var c=a>>1;for(var d=c+b/2;!(c>=d)&&z[c];)++c;c<<=1;if(32<c-a&&tb)return tb.decode(x.subarray(a,c));c=\"\";for(d=0;!(d>=b/2);++d){var e=y[a+2*d>>1];if(0==e)break;c+=String.fromCharCode(e)}return c},\nvb=(a,b,c)=>{c??=2147483647;if(2>c)return 0;c-=2;var d=b;c=c<2*a.length?c/2:a.length;for(var e=0;e<c;++e)y[b>>1]=a.charCodeAt(e),b+=2;y[b>>1]=0;return b-d},wb=a=>2*a.length,xb=(a,b)=>{for(var c=0,d=\"\";!(c>=b/4);){var e=A[a+4*c>>2];if(0==e)break;++c;65536<=e?(e-=65536,d+=String.fromCharCode(55296|e>>10,56320|e&1023)):d+=String.fromCharCode(e)}return d},yb=(a,b,c)=>{c??=2147483647;if(4>c)return 0;var d=b;c=d+c-4;for(var e=0;e<a.length;++e){var g=a.charCodeAt(e);if(55296<=g&&57343>=g){var f=a.charCodeAt(++e);\ng=65536+((g&1023)<<10)|f&1023}A[b>>2]=g;b+=4;if(b+4>c)break}A[b>>2]=0;return b-d},zb=a=>{for(var b=0,c=0;c<a.length;++c){var d=a.charCodeAt(c);55296<=d&&57343>=d&&++c;b+=4}return b},Ab=(a,b)=>{var c=I[a];if(void 0===c)throw a=b+\" has unknown type \"+db(a),new J(a);return c},Bb=(a,b,c)=>{var d=[];a=a.toWireType(d,c);d.length&&(B[b>>2]=S(d));return a},Cb=[],Db={},Eb=a=>{var b=Db[a];return void 0===b?G(a):b},Fb=()=>\"object\"==typeof globalThis?globalThis:Function(\"return this\")(),Gb=a=>{var b=Cb.length;\nCb.push(a);return b},Hb=(a,b)=>{for(var c=Array(a),d=0;d<a;++d)c[d]=Ab(B[b+4*d>>2],\"parameter \"+d);return c},Ib=()=>{if(\"object\"==typeof crypto&&\"function\"==typeof crypto.getRandomValues)return a=>crypto.getRandomValues(a);p(\"initRandomDevice\")},Jb=a=>(Jb=Ib())(a),Kb=Array(256),Lb=0;256>Lb;++Lb)Kb[Lb]=String.fromCharCode(Lb);za=Kb;J=l.BindingError=class extends Error{constructor(a){super(a);this.name=\"BindingError\"}};K=l.InternalError=class extends Error{constructor(a){super(a);this.name=\"InternalError\"}};\nObject.assign(La.prototype,{isAliasOf:function(a){if(!(this instanceof La&&a instanceof La))return!1;var b=this.O.S.P,c=this.O.R;a.O=a.O;var d=a.O.S.P;for(a=a.O.R;b.U;)c=b.da(c),b=b.U;for(;d.U;)a=d.da(a),d=d.U;return b===d&&c===a},clone:function(){this.O.R||Da(this);if(this.O.ca)return this.O.count.value+=1,this;var a=Q,b=Object,c=b.create,d=Object.getPrototypeOf(this),e=this.O;a=a(c.call(b,d,{O:{value:{count:e.count,aa:e.aa,ca:e.ca,R:e.R,S:e.S,T:e.T,V:e.V}}}));a.O.count.value+=1;a.O.aa=!1;return a},\n[\"delete\"](){this.O.R||Da(this);if(this.O.aa&&!this.O.ca)throw new J(\"Object already scheduled for deletion\");Fa(this);var a=this.O;--a.count.value;0===a.count.value&&(a.T?a.V.Z(a.T):a.S.P.Z(a.R));this.O.ca||(this.O.T=void 0,this.O.R=void 0)},isDeleted:function(){return!this.O.R},deleteLater:function(){this.O.R||Da(this);if(this.O.aa&&!this.O.ca)throw new J(\"Object already scheduled for deletion\");N.push(this);1===N.length&&O&&O(Ia);this.O.aa=!0;return this}});l.getInheritedInstanceCount=()=>Object.keys(P).length;\nl.getLiveInheritedInstances=()=>{var a=[],b;for(b in P)P.hasOwnProperty(b)&&a.push(P[b]);return a};l.flushPendingDeletes=Ia;l.setDelayFunction=a=>{O=a;N.length&&O&&O(Ia)};\nObject.assign(Wa.prototype,{ra(a){this.ma&&(a=this.ma(a));return a},la(a){this.Z?.(a)},argPackAdvance:8,readValueFromPointer:Va,fromWireType:function(a){function b(){return this.ga?Ka(this.P.ba,{S:this.ua,R:c,V:this,T:a}):Ka(this.P.ba,{S:this,R:a})}var c=this.ra(a);if(!c)return this.la(a),null;var d=Ja(this.P,c);if(void 0!==d){if(0===d.O.count.value)return d.O.R=c,d.O.T=a,d.clone();d=d.clone();this.la(a);return d}d=this.P.qa(c);d=Ha[d];if(!d)return b.call(this);d=this.fa?d.oa:d.pointerType;var e=\nGa(c,this.P,d.P);return null===e?b.call(this):this.ga?Ka(d.P.ba,{S:d,R:e,V:this,T:a}):Ka(d.P.ba,{S:d,R:e})}});bb=l.UnboundTypeError=((a,b)=>{var c=R(b,function(d){this.name=b;this.message=d;d=Error(d).stack;void 0!==d&&(this.stack=this.toString()+\"\\n\"+d.replace(/^Error(:[^\\n]*)?\\n/,\"\"))});c.prototype=Object.create(a.prototype);c.prototype.constructor=c;c.prototype.toString=function(){return void 0===this.message?this.name:`${this.name}: ${this.message}`};return c})(Error,\"UnboundTypeError\");\nV.X.push({value:void 0},{value:null},{value:!0},{value:!1});Object.assign(V,{ja:V.X.length});l.count_emval_handles=()=>{for(var a=0,b=V.ja;b<V.X.length;++b)void 0!==V.X[b]&&++a;return a};\nvar Nb={l:(a,b,c)=>{var d=new va(a);B[d.R+16>>2]=0;B[d.R+4>>2]=b;B[d.R+8>>2]=c;wa=a;xa++;throw wa;},x:()=>{},C:(a,b,c,d)=>{b=G(b);L(a,{name:b,fromWireType:function(e){return!!e},toWireType:function(e,g){return g?c:d},argPackAdvance:8,readValueFromPointer:function(e){return this.fromWireType(x[e])},W:null})},H:(a,b,c,d,e,g,f,h,m,k,n,r,q)=>{n=G(n);g=T(e,g);h&&=T(f,h);k&&=T(m,k);q=T(r,q);var t=Oa(n);Na(t,function(){eb(`Cannot construct ${n} due to unbound types`,[d])});M([a,b,c],d?[d]:[],function(u){u=\nu[0];if(d){var v=u.P;var W=v.ba}else W=La.prototype;u=R(n,function(){if(Object.getPrototypeOf(this)!==ya)throw new J(\"Use 'new' to construct \"+n);if(void 0===C.$)throw new J(n+\" has no accessible constructor\");var gb=C.$[arguments.length];if(void 0===gb)throw new J(`Tried to invoke ctor of ${n} with invalid number of parameters (${arguments.length}) - expected (${Object.keys(C.$).toString()}) parameters instead!`);return gb.apply(this,arguments)});var ya=Object.create(W,{constructor:{value:u}});u.prototype=\nya;var C=new Pa(n,u,ya,q,v,g,h,k);if(C.U){var X;(X=C.U).ka??(X.ka=[]);C.U.ka.push(C)}v=new Wa(n,C,!0,!1,!1);X=new Wa(n+\"*\",C,!1,!1,!1);W=new Wa(n+\" const*\",C,!1,!0,!1);Ha[a]={pointerType:X,oa:W};Xa(t,u);return[v,X,W]})},G:(a,b,c,d,e,g)=>{var f=fb(b,c);e=T(d,e);M([],[a],function(h){h=h[0];var m=`constructor ${h.name}`;void 0===h.P.$&&(h.P.$=[]);if(void 0!==h.P.$[b-1])throw new J(`Cannot register multiple constructors with identical number of parameters (${b-1}) for class '${h.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);\nh.P.$[b-1]=()=>{eb(`Cannot construct ${h.name} due to unbound types`,f)};M([],f,k=>{k.splice(1,0,null);h.P.$[b-1]=kb(m,k,null,e,g);return[]});return[]})},d:(a,b,c,d,e,g,f,h,m)=>{var k=fb(c,d);b=G(b);b=lb(b);g=T(e,g);M([],[a],function(n){function r(){eb(`Cannot call ${q} due to unbound types`,k)}n=n[0];var q=`${n.name}.${b}`;b.startsWith(\"@@\")&&(b=Symbol[b.substring(2)]);h&&n.P.va.push(b);var t=n.P.ba,u=t[b];void 0===u||void 0===u.Y&&u.className!==n.name&&u.ea===c-2?(r.ea=c-2,r.className=n.name,t[b]=\nr):(Ma(t,b,q),t[b].Y[c-2]=r);M([],k,function(v){v=kb(q,v,n,g,f,m);void 0===t[b].Y?(v.ea=c-2,t[b]=v):t[b].Y[c-2]=v;return[]});return[]})},B:a=>L(a,pb),u:(a,b,c)=>{b=G(b);L(a,{name:b,fromWireType:d=>d,toWireType:(d,e)=>e,argPackAdvance:8,readValueFromPointer:qb(b,c),W:null})},f:(a,b,c,d,e)=>{b=G(b);-1===e&&(e=4294967295);e=h=>h;if(0===d){var g=32-8*c;e=h=>h<<g>>>g}var f=b.includes(\"unsigned\")?function(h,m){return m>>>0}:function(h,m){return m};L(a,{name:b,fromWireType:e,toWireType:f,argPackAdvance:8,\nreadValueFromPointer:rb(b,c,0!==d),W:null})},b:(a,b,c)=>{function d(g){return new e(ia.buffer,B[g+4>>2],B[g>>2])}var e=[Int8Array,Uint8Array,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array][b];c=G(c);L(a,{name:c,fromWireType:d,argPackAdvance:8,readValueFromPointer:d},{sa:!0})},t:(a,b)=>{b=G(b);var c=\"std::string\"===b;L(a,{name:b,fromWireType:function(d){var e=B[d>>2],g=d+4;if(c)for(var f=g,h=0;h<=e;++h){var m=g+h;if(h==e||0==x[m]){if(f){var k=f;var n=x,r=k+(m-f);for(f=k;n[f]&&\n!(f>=r);)++f;if(16<f-k&&n.buffer&&sb)k=sb.decode(n.subarray(k,f));else{for(r=\"\";k<f;){var q=n[k++];if(q&128){var t=n[k++]&63;if(192==(q&224))r+=String.fromCharCode((q&31)<<6|t);else{var u=n[k++]&63;q=224==(q&240)?(q&15)<<12|t<<6|u:(q&7)<<18|t<<12|u<<6|n[k++]&63;65536>q?r+=String.fromCharCode(q):(q-=65536,r+=String.fromCharCode(55296|q>>10,56320|q&1023))}}else r+=String.fromCharCode(q)}k=r}}else k=\"\";if(void 0===v)var v=k;else v+=String.fromCharCode(0),v+=k;f=m+1}}else{v=Array(e);for(h=0;h<e;++h)v[h]=\nString.fromCharCode(x[g+h]);v=v.join(\"\")}U(d);return v},toWireType:function(d,e){e instanceof ArrayBuffer&&(e=new Uint8Array(e));var g,f=\"string\"==typeof e;if(!(f||e instanceof Uint8Array||e instanceof Uint8ClampedArray||e instanceof Int8Array))throw new J(\"Cannot pass non-string to std::string\");var h;if(c&&f)for(g=h=0;g<e.length;++g){var m=e.charCodeAt(g);127>=m?h++:2047>=m?h+=2:55296<=m&&57343>=m?(h+=4,++g):h+=3}else h=e.length;g=h;h=Mb(4+g+1);m=h+4;B[h>>2]=g;if(c&&f){if(f=m,m=g+1,g=x,0<m){m=f+\nm-1;for(var k=0;k<e.length;++k){var n=e.charCodeAt(k);if(55296<=n&&57343>=n){var r=e.charCodeAt(++k);n=65536+((n&1023)<<10)|r&1023}if(127>=n){if(f>=m)break;g[f++]=n}else{if(2047>=n){if(f+1>=m)break;g[f++]=192|n>>6}else{if(65535>=n){if(f+2>=m)break;g[f++]=224|n>>12}else{if(f+3>=m)break;g[f++]=240|n>>18;g[f++]=128|n>>12&63}g[f++]=128|n>>6&63}g[f++]=128|n&63}}g[f]=0}}else if(f)for(f=0;f<g;++f){k=e.charCodeAt(f);if(255<k)throw U(m),new J(\"String has UTF-16 code units that do not fit in 8 bits\");x[m+f]=\nk}else for(f=0;f<g;++f)x[m+f]=e[f];null!==d&&d.push(U,h);return h},argPackAdvance:8,readValueFromPointer:Va,W(d){U(d)}})},p:(a,b,c)=>{c=G(c);if(2===b){var d=ub;var e=vb;var g=wb;var f=()=>z;var h=1}else 4===b&&(d=xb,e=yb,g=zb,f=()=>B,h=2);L(a,{name:c,fromWireType:m=>{for(var k=B[m>>2],n=f(),r,q=m+4,t=0;t<=k;++t){var u=m+4+t*b;if(t==k||0==n[u>>h])q=d(q,u-q),void 0===r?r=q:(r+=String.fromCharCode(0),r+=q),q=u+b}U(m);return r},toWireType:(m,k)=>{if(\"string\"!=typeof k)throw new J(`Cannot pass non-string to C++ string type ${c}`);\nvar n=g(k),r=Mb(4+n+b);B[r>>2]=n>>h;e(k,r+4,n+b);null!==m&&m.push(U,r);return r},argPackAdvance:8,readValueFromPointer:ob,W(m){U(m)}})},D:(a,b)=>{b=G(b);L(a,{ta:!0,name:b,argPackAdvance:0,fromWireType:()=>{},toWireType:()=>{}})},j:(a,b,c)=>{a=Y(a);b=Ab(b,\"emval::as\");return Bb(b,c,a)},w:(a,b,c,d)=>{a=Cb[a];b=Y(b);return a(null,b,c,d)},q:(a,b,c,d,e)=>{a=Cb[a];b=Y(b);c=Eb(c);return a(b,b[c],d,e)},a:nb,i:a=>{if(0===a)return S(Fb());a=Eb(a);return S(Fb()[a])},m:(a,b,c)=>{b=Hb(a,b);var d=b.shift();a--;\nvar e=\"return function (obj, func, destructorsRef, args) {\\n\",g=0,f=[];0===c&&f.push(\"obj\");for(var h=[\"retType\"],m=[d],k=0;k<a;++k)f.push(\"arg\"+k),h.push(\"argType\"+k),m.push(b[k]),e+=`  var arg${k} = argType${k}.readValueFromPointer(args${g?\"+\"+g:\"\"});\\n`,g+=b[k].argPackAdvance;e+=`  var rv = ${1===c?\"new func\":\"func.call\"}(${f.join(\", \")});\\n`;d.ta||(h.push(\"emval_returnValue\"),m.push(Bb),e+=\"  return emval_returnValue(retType, destructorsRef, rv);\\n\");h.push(e+\"};\\n\");a=jb(h).apply(null,m);c=`methodCaller<(${b.map(n=>\nn.name).join(\", \")}) => ${d.name}>`;return Gb(R(c,a))},h:(a,b)=>{a=Y(a);b=Y(b);return S(a[b])},g:a=>{4<a&&(V.get(a).na+=1)},n:(a,b)=>{a=Y(a);b=Y(b);return a instanceof b},F:a=>{a=Y(a);return\"number\"==typeof a},E:a=>{a=Y(a);return\"string\"==typeof a},s:()=>S([]),r:a=>S(Eb(a)),v:()=>S({}),e:a=>{var b=Y(a);hb(b);nb(a)},k:(a,b,c)=>{a=Y(a);b=Y(b);c=Y(c);a[b]=c},c:(a,b)=>{a=Ab(a,\"_emval_take_value\");a=a.readValueFromPointer(b);return S(a)},o:()=>{p(\"\")},A:(a,b,c)=>x.copyWithin(a,b,b+c),z:a=>{var b=x.length;\na>>>=0;if(2147483648<a)return!1;for(var c=1;4>=c;c*=2){var d=b*(1+.2/c);d=Math.min(d,a+100663296);var e=Math;d=Math.max(a,d);a:{e=(e.min.call(e,2147483648,d+(65536-d%65536)%65536)-w.buffer.byteLength+65535)/65536;try{w.grow(e);la();var g=1;break a}catch(f){}g=void 0}if(g)return!0}return!1},y:(a,b)=>{Jb(x.subarray(a,a+b));return 0}},Z=function(){function a(c){Z=c.exports;w=Z.I;la();Za=Z.L;na.unshift(Z.J);D--;l.monitorRunDependencies?.(D);0==D&&(null!==qa&&(clearInterval(qa),qa=null),E&&(c=E,E=null,\nc()));return Z}var b={a:Nb};D++;l.monitorRunDependencies?.(D);if(l.instantiateWasm)try{return l.instantiateWasm(b,a)}catch(c){ea(`Module.instantiateWasm callback failed with error: ${c}`),ba(c)}b=ta(b);return a(b[0])}(),Mb=Z.K,cb=Z.M,U=Z.N,Ob;E=function Pb(){Ob||Qb();Ob||(E=Pb)};\nfunction Qb(){function a(){if(!Ob&&(Ob=!0,l.calledRun=!0,!ha)){ua(na);aa(l);if(l.onRuntimeInitialized)l.onRuntimeInitialized();if(l.postRun)for(\"function\"==typeof l.postRun&&(l.postRun=[l.postRun]);l.postRun.length;){var b=l.postRun.shift();oa.unshift(b)}ua(oa)}}if(!(0<D)){if(l.preRun)for(\"function\"==typeof l.preRun&&(l.preRun=[l.preRun]);l.preRun.length;)pa();ua(ma);0<D||(l.setStatus?(l.setStatus(\"Running...\"),setTimeout(function(){setTimeout(function(){l.setStatus(\"\")},1);a()},1)):a())}}\nif(l.preInit)for(\"function\"==typeof l.preInit&&(l.preInit=[l.preInit]);0<l.preInit.length;)l.preInit.pop()();Qb();\n\n\n  return moduleArg\n}\n);\n})();\nif (typeof exports === 'object' && typeof module === 'object')\n  module.exports = Module;\nelse if (typeof define === 'function' && define['amd'])\n  define([], () => Module);\n", xr = "4.0.3", Sr = class extends lr {
	constructor() {
		super(...arguments), this.context = null;
	}
	initialize(e) {
		return vr(this, arguments, function* (e, t = {}, n = 16) {
			(0, f.default)(typeof e == "object" && !!e, "First argument to initialize must be a valid AudioContext instance."), (0, f.default)(typeof t == "object" && !!t, "The optional second argument to initialize must be an object."), this.context = e, typeof e._elemWorkletRegistry != "object" && (e._elemWorkletRegistry = {});
			let r = e._elemWorkletRegistry;
			if (!r.hasOwnProperty(xr)) {
				let t = new Blob([br, yr], { type: "text/javascript" }), n = URL.createObjectURL(t);
				if (!e.audioWorklet) throw Error("BaseAudioContext.audioWorklet is missing; are you running in a secure context (https)?");
				yield e.audioWorklet.addModule(n), r[xr] = !0;
			}
			return this._promiseMap = /* @__PURE__ */ new Map(), this._nextRequestId = 0, this._worklet = new AudioWorkletNode(e, `ElementaryAudioWorkletProcessor@${xr}`, Object.assign({
				numberOfInputs: 0,
				numberOfOutputs: 1,
				outputChannelCount: [2]
			}, t)), yield new Promise((e, t) => {
				this._worklet.port.onmessage = (t) => {
					let [n, r] = t.data;
					if (n === "load") return this._renderer = new pr((e) => vr(this, null, function* () {
						return yield this._sendWorkletRequest("renderInstructions", { batch: e });
					})), e(this._worklet), this.emit(n, r);
					if (n === "events") return r.forEach((e) => {
						this.emit(e.type, e.event);
					});
					if (n === "reply") {
						let { requestId: e, result: t } = r, { resolve: n, reject: i } = this._promiseMap.get(e);
						return this._promiseMap.delete(e), n(t);
					}
				}, this._timer = window.setInterval(() => {
					this._worklet.port.postMessage({ requestType: "processQueuedEvents" });
				}, n);
			});
		});
	}
	_sendWorkletRequest(e, t) {
		(0, f.default)(this._worklet, "Can't send request before worklet is ready. Have you initialized your WebRenderer instance?");
		let n = this._nextRequestId++;
		return this._worklet.port.postMessage({
			requestId: n,
			requestType: e,
			payload: t
		}), new Promise((e, t) => {
			this._promiseMap.set(n, {
				resolve: e,
				reject: t
			});
		});
	}
	createRef(e, t, n) {
		return this._renderer.createRef(e, t, n);
	}
	render(...e) {
		return vr(this, null, function* () {
			let t = yield this._renderer.render(...e), { result: n } = t, r = _r(t, ["result"]);
			return n.success ? Promise.resolve(r) : Promise.reject(n);
		});
	}
	updateVirtualFileSystem(e) {
		return vr(this, null, function* () {
			return (0, f.default)(typeof e == "object" && !!e, "Virtual file system must be an object mapping string type keys to Array<Float32Array> | Float32Array type values"), Object.keys(e).forEach(function(t) {
				let n = typeof e[t] == "object" && (Array.isArray(e[t]) || e[t] instanceof Float32Array);
				(0, f.default)(n, "Virtual file system must be an object mapping string type keys to Array<Float32Array> | Float32Array type values");
			}), yield this._sendWorkletRequest("updateSharedResourceMap", { resources: e });
		});
	}
	pruneVirtualFileSystem() {
		return vr(this, null, function* () {
			return yield this._sendWorkletRequest("pruneVirtualFileSystem", {});
		});
	}
	listVirtualFileSystem() {
		return vr(this, null, function* () {
			return yield this._sendWorkletRequest("listVirtualFileSystem", {});
		});
	}
	reset() {
		return vr(this, null, function* () {
			return yield this._sendWorkletRequest("reset", {});
		});
	}
	gc() {
		return vr(this, null, function* () {
			let e = yield this._sendWorkletRequest("gc", {});
			return this._renderer.prune(e), e;
		});
	}
	setCurrentTime(e) {
		return vr(this, null, function* () {
			return yield this._sendWorkletRequest("setCurrentTime", { time: e });
		});
	}
	setCurrentTimeMs(e) {
		return vr(this, null, function* () {
			return yield this._sendWorkletRequest("setCurrentTimeMs", { time: e });
		});
	}
}, Cr = ["master:filter.frequency", "master:filter.Q"];
function wr(e) {
	return Cr.includes(e);
}
var Tr = {
	frequency: {
		min: 20,
		max: 2e4,
		default: 2e4,
		curve: "log"
	},
	Q: {
		min: .1,
		max: 20,
		default: Math.SQRT1_2,
		curve: "log"
	}
};
function Er() {
	return {
		frequency: Tr.frequency.default,
		Q: Tr.Q.default
	};
}
function Dr(e) {
	return e.frequency >= Tr.frequency.max && Math.abs(e.Q - Tr.Q.default) < 1e-6;
}
function Or(e) {
	return e.masterFilter ?? Er();
}
var kr = [
	"jump",
	"stop",
	"fadeOut",
	"tapeStop"
], Ar = [
	"now",
	"beat",
	"bar"
], jr = [
	"freeze",
	"muffled",
	"stop"
], Mr = {
	dials: 32,
	curvePoints: 32,
	links: 64,
	layers: 64,
	swaps: 64,
	sections: 64,
	cues: 32,
	scenarios: 32,
	samples: 2e4,
	hits: 2e3
}, Nr = 2e4, Pr = .75, Fr = "game-over";
function Ir() {
	return {
		mode: "freeze",
		muffleHz: 400,
		fadeSeconds: .4
	};
}
function Lr() {
	return [{
		id: Fr,
		name: "Game over",
		action: "tapeStop",
		landing: "now",
		seconds: Pr
	}];
}
function Rr() {
	return {
		links: [],
		layers: [],
		swaps: []
	};
}
function zr(e) {
	return e.cues ?? Lr();
}
function Br(e) {
	return e.pause ?? Ir();
}
function Vr(e) {
	return e.rules ?? Rr();
}
function Hr(e) {
	return e.sections ?? [];
}
function Ur(e, t) {
	let n = Math.min(e.max, Math.max(e.min, t));
	return e.step === "whole" ? Math.min(e.max, Math.max(e.min, Math.round(n))) : n;
}
function Wr(e, t) {
	if (e.length === 0 || !Number.isFinite(t)) return null;
	let n = e[0];
	if (t <= n.x) return n.y;
	for (let n = 1; n < e.length; n++) {
		let r = e[n];
		if (t > r.x) continue;
		let i = e[n - 1];
		return r.x === i.x ? r.y : i.y + (t - i.x) / (r.x - i.x) * (r.y - i.y);
	}
	return e[e.length - 1].y;
}
function Gr(e, t, n, r) {
	return r === null ? e >= t : r ? e >= t - Math.max(0, n) : e >= t;
}
function Kr(e, t, n, r) {
	if (t === n) return n;
	let i = n > t ? e.riseSeconds : e.fallSeconds;
	if (!(i > 0)) return n;
	let a = Math.min(1, Math.max(0, r) / i);
	return a >= 1 ? n : t + (n - t) * a;
}
//#endregion
//#region src/engine/glider.ts
var qr = [
	"a",
	"e",
	"i",
	"o",
	"u"
], Jr = {
	bass: {
		a: [
			[
				600,
				0,
				60
			],
			[
				1040,
				-7,
				70
			],
			[
				2250,
				-9,
				110
			],
			[
				2450,
				-9,
				120
			]
		],
		e: [
			[
				400,
				0,
				40
			],
			[
				1620,
				-12,
				80
			],
			[
				2400,
				-9,
				100
			],
			[
				2800,
				-12,
				120
			]
		],
		i: [
			[
				250,
				0,
				60
			],
			[
				1750,
				-30,
				90
			],
			[
				2600,
				-16,
				100
			],
			[
				3050,
				-22,
				120
			]
		],
		o: [
			[
				400,
				0,
				40
			],
			[
				750,
				-11,
				80
			],
			[
				2400,
				-21,
				100
			],
			[
				2600,
				-20,
				120
			]
		],
		u: [
			[
				350,
				0,
				40
			],
			[
				600,
				-20,
				80
			],
			[
				2400,
				-32,
				100
			],
			[
				2675,
				-28,
				120
			]
		]
	},
	tenor: {
		a: [
			[
				650,
				0,
				80
			],
			[
				1080,
				-6,
				90
			],
			[
				2650,
				-7,
				120
			],
			[
				2900,
				-8,
				130
			]
		],
		e: [
			[
				400,
				0,
				70
			],
			[
				1700,
				-14,
				80
			],
			[
				2600,
				-12,
				100
			],
			[
				3200,
				-14,
				120
			]
		],
		i: [
			[
				290,
				0,
				40
			],
			[
				1870,
				-15,
				90
			],
			[
				2800,
				-18,
				100
			],
			[
				3250,
				-20,
				120
			]
		],
		o: [
			[
				400,
				0,
				70
			],
			[
				800,
				-10,
				80
			],
			[
				2600,
				-12,
				100
			],
			[
				2800,
				-12,
				130
			]
		],
		u: [
			[
				350,
				0,
				40
			],
			[
				600,
				-20,
				60
			],
			[
				2700,
				-17,
				100
			],
			[
				2900,
				-14,
				120
			]
		]
	}
}, Yr = {
	n: {
		kind: "nasal",
		locus: [
			250,
			1450,
			2400,
			3300
		],
		lg: [
			0,
			-16,
			-22,
			-26
		],
		trans: .07
	},
	m: {
		kind: "nasal",
		locus: [
			250,
			1100,
			2150,
			3200
		],
		lg: [
			0,
			-16,
			-22,
			-26
		],
		trans: .07
	},
	y: {
		kind: "glide",
		vowel: "i",
		trans: .06
	},
	w: {
		kind: "glide",
		vowel: "u",
		trans: .06
	},
	d: {
		kind: "stop",
		locus: [
			300,
			1700,
			2600,
			3300
		],
		burst: [
			2400,
			2.2,
			.035
		],
		vot: .012,
		trans: .03
	},
	k: {
		kind: "stop",
		locus: [
			300,
			1800,
			2400,
			3300
		],
		burst: [
			1800,
			2.4,
			.06
		],
		vot: .035,
		trans: .04
	},
	kw: {
		kind: "stop",
		vowel: "u",
		burst: [
			1700,
			2.2,
			.06
		],
		vot: .04,
		trans: .07
	},
	s: {
		kind: "fric",
		burst: [
			5e3,
			4,
			.12
		],
		vot: .07,
		trans: .04
	},
	l: {
		kind: "glide",
		locus: [
			350,
			1200,
			2500,
			3300
		],
		lg: [
			0,
			-10,
			-18,
			-24
		],
		trans: .06
	},
	r: {
		kind: "glide",
		locus: [
			400,
			1200,
			1600,
			3300
		],
		lg: [
			0,
			-8,
			-8,
			-20
		],
		trans: .06
	},
	b: {
		kind: "stop",
		locus: [
			300,
			900,
			2200,
			3e3
		],
		burst: [
			800,
			1.5,
			.03
		],
		vot: .01,
		trans: .03
	},
	p: {
		kind: "stop",
		burst: [
			900,
			1.5,
			.04
		],
		vot: .03,
		trans: .03
	},
	t: {
		kind: "stop",
		locus: [
			300,
			1800,
			2600,
			3300
		],
		burst: [
			4200,
			3,
			.04
		],
		vot: .04,
		trans: .03
	},
	g: {
		kind: "stop",
		locus: [
			300,
			1600,
			2e3,
			3e3
		],
		burst: [
			1500,
			2.4,
			.05
		],
		vot: .03,
		trans: .04
	},
	h: {
		kind: "fric",
		burst: [
			1500,
			1.2,
			.1
		],
		vot: .06,
		trans: .04
	}
}, Xr = {
	nah: {
		c: "n",
		a: "a",
		b: "a"
	},
	me: {
		c: "m",
		a: "e",
		b: "i"
	},
	oh: {
		c: null,
		a: "o",
		b: "u"
	},
	now: {
		c: "n",
		a: "a",
		b: "u"
	},
	queh: {
		c: "kw",
		a: "e",
		b: "e"
	},
	yah: {
		c: "y",
		a: "a",
		b: "a"
	},
	dah: {
		c: "d",
		a: "a",
		b: "o"
	},
	sah: {
		c: "s",
		a: "a",
		b: "a"
	},
	wah: {
		c: "w",
		a: "a",
		b: "a"
	},
	la: {
		c: "l",
		a: "a",
		b: "a"
	},
	lo: {
		c: "l",
		a: "o",
		b: "o"
	},
	loo: {
		c: "l",
		a: "u",
		b: "u"
	},
	lay: {
		c: "l",
		a: "e",
		b: "i"
	},
	ay: {
		c: null,
		a: "e",
		b: "i"
	},
	ah: {
		c: null,
		a: "a",
		b: "a"
	},
	ooh: {
		c: null,
		a: "u",
		b: "u"
	},
	ee: {
		c: null,
		a: "i",
		b: "i"
	},
	ky: {
		c: "k",
		a: "i",
		b: "i"
	},
	ri: {
		c: "r",
		a: "i",
		b: "i"
	},
	dee: {
		c: "d",
		a: "i",
		b: "i"
	},
	doo: {
		c: "d",
		a: "u",
		b: "u"
	},
	bah: {
		c: "b",
		a: "a",
		b: "a"
	},
	yo: {
		c: "y",
		a: "o",
		b: "o"
	},
	meow: {
		c: "m",
		a: "i",
		b: "a"
	},
	mew: {
		c: "m",
		a: "e",
		b: "u"
	},
	mrrp: {
		c: "m",
		a: "e",
		b: "e"
	},
	woof: {
		c: "w",
		a: "o",
		b: "a"
	},
	ruff: {
		c: "r",
		a: "a",
		b: "o"
	},
	bow: {
		c: "b",
		a: "a",
		b: "u"
	},
	hoo: {
		c: "h",
		a: "u",
		b: "u"
	},
	ha: {
		c: "h",
		a: "a",
		b: "a"
	},
	hay: {
		c: "h",
		a: "e",
		b: "i"
	},
	grrk: {
		c: "g",
		a: "o",
		b: "o"
	},
	rib: {
		c: "r",
		a: "i",
		b: "i"
	},
	bit: {
		c: "b",
		a: "i",
		b: "i"
	},
	tee: {
		c: "t",
		a: "i",
		b: "i"
	},
	pip: {
		c: "p",
		a: "i",
		b: "i"
	},
	wee: {
		c: "w",
		a: "i",
		b: "i"
	},
	baa: {
		c: "b",
		a: "a",
		b: "e"
	},
	mah: {
		c: "m",
		a: "a",
		b: "a"
	},
	ow: {
		c: null,
		a: "a",
		b: "u"
	}
}, Zr = {
	kk: {
		label: "K.K.: nah me oh now queh",
		syllables: [
			"nah",
			"me",
			"oh",
			"now",
			"queh"
		]
	},
	babble: {
		label: "Babble: nah yah dah wah me",
		syllables: [
			"nah",
			"yah",
			"dah",
			"wah",
			"me"
		]
	},
	la: {
		label: "La: la lo loo lay",
		syllables: [
			"la",
			"lo",
			"loo",
			"lay"
		]
	},
	choir: {
		label: "Choir: ah oh ooh ay",
		syllables: [
			"ah",
			"oh",
			"ooh",
			"ay"
		]
	},
	chant: {
		label: "Chant: ky ri ay lay",
		syllables: [
			"ky",
			"ri",
			"ay",
			"lay"
		]
	},
	scat: {
		label: "Scat: dee bah doo dah sah",
		syllables: [
			"dee",
			"bah",
			"doo",
			"dah",
			"sah"
		]
	},
	yodel: {
		label: "Yodel: yo lay ee ooh",
		syllables: [
			"yo",
			"lay",
			"ee",
			"ooh"
		]
	},
	whisper: {
		label: "Whisper: ha hay hoo",
		syllables: [
			"ha",
			"hay",
			"hoo"
		]
	},
	meow: {
		label: "Cat: meow mew mrrp",
		syllables: [
			"meow",
			"mew",
			"mrrp"
		]
	},
	dog: {
		label: "Dog: woof ruff bow",
		syllables: [
			"woof",
			"ruff",
			"bow"
		]
	},
	owl: {
		label: "Owl: hoo",
		syllables: ["hoo"]
	},
	frog: {
		label: "Frog: grrk rib bit",
		syllables: [
			"grrk",
			"rib",
			"bit"
		]
	},
	bird: {
		label: "Bird: tee pip wee",
		syllables: [
			"tee",
			"pip",
			"wee"
		]
	},
	whale: {
		label: "Whale: ooh ee ah ow",
		syllables: [
			"ooh",
			"ee",
			"ah",
			"ow"
		]
	},
	goat: {
		label: "Goat: baa mah",
		syllables: ["baa", "mah"]
	}
};
function Qr(e) {
	let t = e >>> 0;
	return () => {
		t = t + 1831565813 >>> 0;
		let e = t;
		return e = Math.imul(e ^ e >>> 15, e | 1), e ^= e + Math.imul(e ^ e >>> 7, e | 61), ((e ^ e >>> 14) >>> 0) / 4294967296;
	};
}
function $r(e) {
	return e ^= e >>> 16, e = Math.imul(e, 2246822507), e ^= e >>> 13, e = Math.imul(e, 3266489909), (e ^ e >>> 16) >>> 0;
}
function ei(e, t, n) {
	let r = $r(Math.floor(e) ^ 2654435769), i = $r(Math.floor(t) + 1663821227 | 0), a = $r(Math.imul(Math.floor(n) + 1, 668265263));
	return Qr($r(r ^ i ^ a));
}
var ti = (e) => qr.includes(e);
function ni(e, t, n, r) {
	let i = n(), a = n();
	if (r !== void 0 && Object.hasOwn(Xr, r)) return {
		syllable: Xr[r],
		manual: !1
	};
	if (e.mode === "vowel") return {
		syllable: {
			c: null,
			a: ti(e.vowelA) ? e.vowelA : "o",
			b: ti(e.vowelB) ? e.vowelB : "u"
		},
		manual: !0
	};
	let o = (Object.hasOwn(Zr, e.set) ? Zr[e.set] : Zr.kk).syllables, s = () => o[Math.min(o.length - 1, Math.floor(i * o.length))], c;
	return c = e.mode === "cycle" ? o[(Math.floor(t) % o.length + o.length) % o.length] : e.mode === "random" || a < e.randomness * .6 ? s() : e.mode, {
		syllable: Xr[c] ?? Xr.nah,
		manual: !1
	};
}
var ri = (e) => 10 ** (e / 20), ii = (e, t, n) => e + (t - e) * n;
function ai(e, t, n) {
	return Jr.bass[e].map((r, i) => {
		let a = Jr.tenor[e][i];
		return [
			ii(r[0], a[0], t) * n,
			ri(ii(r[1], a[1], t)),
			ii(r[2], a[2], t)
		];
	});
}
//#endregion
//#region src/engine/params.ts
var oi = [
	"Synth",
	"AMSynth",
	"FMSynth",
	"MonoSynth",
	"DuoSynth",
	"MembraneSynth",
	"MetalSynth",
	"PluckSynth",
	"NoiseSynth",
	"FormantVoice"
];
function si(e) {
	return typeof e == "string" && oi.includes(e);
}
function G(e, t, n, r, i, a) {
	return {
		kind: "number",
		path: e,
		label: t,
		group: n,
		tip: i,
		listenFor: a,
		...r
	};
}
function K(e, t, n, r, i, a, o) {
	return {
		kind: "choice",
		path: e,
		label: t,
		group: n,
		choices: r,
		default: i,
		tip: a,
		listenFor: o
	};
}
var ci = [
	{
		value: "sine",
		label: "Sine"
	},
	{
		value: "triangle",
		label: "Triangle"
	},
	{
		value: "sawtooth",
		label: "Sawtooth"
	},
	{
		value: "square",
		label: "Square"
	}
], li = {
	value: "pulse",
	label: "Pulse"
}, ui = [
	{
		value: "fattriangle",
		label: "Fat triangle"
	},
	{
		value: "fatsawtooth",
		label: "Fat sawtooth"
	},
	{
		value: "fatsquare",
		label: "Fat square"
	}
], di = ui.map((e) => e.value);
function fi(e, t, n, r, i) {
	let a = `${e}oscillator.type`, o = [
		...ci,
		...i.pulse ? [li] : [],
		...i.fat ? ui : []
	], s = [K(a, `${n}Wave`, t, o, r, "The basic waveform the voice starts from, before any envelope or filter shapes it.", "Sine is pure and round, triangle is soft and hollow like an ocarina, sawtooth is bright and buzzy like brass, and square and pulse are the reedy tones of old game consoles.")];
	if (i.pulse && (s.push(G(`${e}oscillator.width`, `${n}Pulse width`, t, {
		min: 0,
		max: .9,
		default: .5,
		curve: "linear",
		step: .01,
		unit: ""
	}, "How lopsided the pulse wave is: 0 is an even square wave, 0.5 sounds like a 25% pulse, and 0.75 like a 12.5% pulse.", "Higher values thin the tone from hollow and woody toward nasal and reedy, the classic NES lead sounds.")), s[s.length - 1].visibleWhen = {
		path: a,
		equals: ["pulse"]
	}), i.fat) {
		let r = G(`${e}oscillator.spread`, `${n}Spread`, t, {
			min: 0,
			max: 100,
			default: 20,
			curve: "linear",
			step: 1,
			unit: "cents"
		}, "How far apart, in cents, the stacked copies of a fat wave are detuned from each other.", "A little spread gives a gentle chorus shimmer; a lot sounds like a detuned string section or a supersaw."), i = G(`${e}oscillator.count`, `${n}Copies`, t, {
			min: 2,
			max: 8,
			default: 3,
			curve: "linear",
			step: 1,
			unit: "voices"
		}, "How many detuned copies of the wave a fat oscillator stacks together.", "More copies make the sound thicker and smoother, at the cost of more processing per note.");
		r.visibleWhen = {
			path: a,
			equals: di
		}, i.visibleWhen = {
			path: a,
			equals: di
		}, s.push(r, i);
	}
	return s;
}
var pi = {
	amp: {
		attack: ["How long a note takes to rise from silence to full volume after you press the key.", "Short values give a hard, percussive start; longer values make notes swell in like a bowed string."],
		decay: ["How long the note takes to fall from its initial peak to the sustain level.", "Short decays give a snappy pluck or blip; longer ones let the opening accent ring before it settles."],
		sustain: ["The level the note holds at while the key stays down, as a fraction of full volume.", "At 1 the note holds steady like an organ; near 0 it fades out on its own like a struck or plucked note."],
		release: ["How long the note takes to fade to silence after you let go of the key.", "Short releases cut off cleanly for staccato lines; long ones leave a tail like a sustain pedal."]
	},
	filter: {
		attack: ["How long the filter takes to open from its resting brightness up to its peak after a key is pressed.", "Short values give a bright bite at the start of each note; long ones make the tone brighten slowly, like a wah pedal rocked forward."],
		decay: ["How long the filter takes to close from its peak back down to the sustain brightness.", "Short decays make a quick, plucky bass bite; longer decays keep the brightness lingering."],
		sustain: ["How open the filter stays while the key is held, as a fraction of the full sweep.", "Low values make held notes go dark and muffled after the initial bite; high values keep them bright."],
		release: ["How long the filter takes to close after you let go of the key.", "Long releases let the tone darken gradually as the note fades instead of all at once."]
	},
	mod: {
		attack: ["How long the hidden modulating oscillator takes to fade in after a key is pressed.", "Longer values make the tone start pure and grow more complex, like a brass note blooming."],
		decay: ["How long the modulation takes to fall from its peak to its sustain amount.", "Short decays give a bright metallic strike that mellows quickly, the classic electric piano and bell attack."],
		sustain: ["How much modulation remains while the key is held, as a fraction of its peak.", "Low values leave a pure tone after the attack; high values keep held notes gritty or bell-like."],
		release: ["How long the modulation takes to fade after you let go of the key.", "Longer values let the extra color linger into the tail of the note."]
	}
};
function mi(e, t, n, r, i) {
	let a = pi[r], o = (e, t) => ({
		min: .001,
		max: e,
		default: t,
		curve: "log",
		unit: "s"
	}), s = [G(`${e}.attack`, `${n}Attack`, t, o(4, i.attack), ...a.attack), G(`${e}.decay`, `${n}Decay`, t, o(4, i.decay), ...a.decay)];
	if (i.sustain !== void 0 && s.push(G(`${e}.sustain`, `${n}Sustain`, t, {
		min: 0,
		max: 1,
		default: i.sustain,
		curve: "linear",
		step: .01,
		unit: ""
	}, ...a.sustain)), s.push(G(`${e}.release`, `${n}Release`, t, o(8, i.release), ...a.release)), r !== "amp" && n) for (let e of s) e.short = e.label.slice(n.length);
	return s;
}
var hi = "envelope.attackCurve";
function gi(e, t) {
	let n = K(hi, "PUNCH UP", e, [{
		value: "linear",
		label: "Off"
	}, {
		value: "exponential",
		label: "On"
	}], t, "A snappier attack: the level leaps up at once and eases into its peak instead of climbing in a straight line.", "Clearest on attacks of 20 ms or longer, where notes bite harder up front; any filter envelope opens sooner too.");
	return n.toggle = {
		on: "exponential",
		off: "linear"
	}, n;
}
var _i = () => G("detune", "Detune", "Pitch", {
	min: -1200,
	max: 1200,
	default: 0,
	curve: "linear",
	step: 1,
	unit: "cents"
}, "Shifts the pitch of the whole voice in cents; 100 cents is one semitone and 1200 is an octave.", "Small amounts against another layer thicken the sound with a slow beating; 1200 or -1200 moves the layer a full octave."), vi = () => ({
	...G("transpose", "Transpose", "Pitch", {
		min: -48,
		max: 48,
		default: 0,
		curve: "linear",
		step: 1,
		unit: "st"
	}, "Moves the whole layer up or down in semitones, up to four octaves either way; 12 is one octave.", "Stack a layer 12, 19, or 24 semitones up for the bright overtones of bells, glockenspiels, and organ stops."),
	perNote: !0
}), yi = () => G("portamento", "Glide", "Pitch", {
	min: 0,
	max: 1,
	default: 0,
	curve: "linear",
	step: .005,
	unit: "s"
}, "How long the pitch slides from one note to the next. It only applies when a voice moves to a new note, so it is clearest with Voices set to 1.", "At 0 notes jump cleanly; small values add a vocal slur between notes, and longer ones give the swoop of a slide guitar or a 303 bass line.");
function bi(e) {
	let t = [G("harmonicity", "Mod ratio", "Modulation", {
		min: .25,
		max: e ? 16 : 8,
		default: 3,
		curve: "log",
		step: .01,
		unit: "×"
	}, "The pitch ratio between the hidden modulating oscillator and the one you hear; 2 puts the modulator an octave above.", e ? "Whole numbers like 1, 2, and 3 give clean, musical tones; in-between values like 1.41 or 3.5 sound clangorous and bell-like." : "Whole numbers add clean, organ-like overtones; uneven values add a ring-modulated, robotic shimmer.")];
	return e && t.push(G("modulationIndex", "Mod depth", "Modulation", {
		min: .1,
		max: 100,
		default: 10,
		curve: "log",
		step: .1,
		unit: ""
	}, "How strongly the modulating oscillator bends the pitch of the one you hear, which sets how many overtones are added.", "Low values are soft and flute-like; high values turn bright and brassy, then harsh and metallic.")), t.push(K("modulation.type", "Mod wave", "Modulation", ci, "square", "The waveform of the hidden modulating oscillator.", "Sine modulation is smooth and bell-like; square and sawtooth add buzzier, grittier overtones."), ...mi("modulationEnvelope", "Modulation envelope", "Mod ", "mod", {
		attack: .5,
		decay: .01,
		sustain: 1,
		release: .5
	})), t;
}
function xi() {
	return [
		...fi("", "Oscillator", "", "triangle", {
			pulse: !0,
			fat: !0
		}),
		...mi("envelope", "Envelope", "", "amp", {
			attack: .005,
			decay: .1,
			sustain: .3,
			release: 1
		}),
		gi("Envelope", "linear"),
		vi(),
		_i(),
		yi()
	];
}
function Si(e) {
	return [
		...fi("", "Oscillator", "", "sine", {
			pulse: !0,
			fat: !0
		}),
		...mi("envelope", "Envelope", "", "amp", {
			attack: .01,
			decay: .01,
			sustain: 1,
			release: .5
		}),
		gi("Envelope", "linear"),
		...bi(e),
		vi(),
		_i(),
		yi()
	];
}
function Ci(e) {
	return [{
		...G("keyTrack", "Key tracking", e, {
			min: 0,
			max: 1,
			default: 0,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How far the cutoff follows the note you play: at 1 it moves an octave for every octave, measured from middle C.", "Keeps guitars, harpsichords, and brass equally bright from the bottom of the keyboard to the top; at 0 high notes sound duller than low ones."),
		perNote: !0
	}, {
		...G("velocityToFilter", "Velocity to filter", e, {
			min: 0,
			max: 1,
			default: 0,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How much playing harder opens the filter envelope further; at 1 the softest notes get no sweep at all.", "The 303 accent, a guitar pick dug in, or brass that brightens when pushed; at 0 every note opens the same way."),
		perNote: !0
	}];
}
var wi = "The resting cutoff frequency of the filter, the brightness the note settles back to when the filter envelope closes.", Ti = "Lower values make the voice darker and more muffled; higher values let more buzz and sparkle through.";
function Ei() {
	return [
		...fi("", "Oscillator", "", "sawtooth", {
			pulse: !0,
			fat: !0
		}),
		K("filter.type", "Filter type", "Filter", [
			{
				value: "lowpass",
				label: "Low-pass"
			},
			{
				value: "highpass",
				label: "High-pass"
			},
			{
				value: "bandpass",
				label: "Band-pass"
			}
		], "lowpass", "Which part of the sound the filter keeps: low-pass keeps the lows, high-pass the highs, and band-pass a band in the middle.", "Low-pass is the classic warm synth bass; high-pass thins a sound out; band-pass sounds nasal, like a telephone."),
		G("filterEnvelope.baseFrequency", "Cutoff", "Filter", {
			min: 20,
			max: 2e4,
			default: 200,
			curve: "log",
			unit: "Hz"
		}, wi, Ti),
		G("filter.Q", "Resonance", "Filter", {
			min: .1,
			max: 20,
			default: 1,
			curve: "log",
			step: .1,
			unit: ""
		}, "How much the filter emphasizes the frequencies right at its cutoff point.", "Higher values add a whistling, vocal peak that sings as the filter sweeps; very high values squeal."),
		G("filterEnvelope.octaves", "Envelope amount", "Filter", {
			min: 0,
			max: 8,
			default: 3,
			curve: "linear",
			step: .1,
			unit: "oct"
		}, "How far, in octaves, the filter envelope opens the cutoff above its resting frequency.", "At 0 the tone stays static; 2–4 octaves give the classic sweep at the start of each note."),
		...Ci("Filter"),
		...mi("filterEnvelope", "Filter envelope", "Filter ", "filter", {
			attack: .6,
			decay: .2,
			sustain: .5,
			release: 2
		}),
		...mi("envelope", "Envelope", "", "amp", {
			attack: .005,
			decay: .1,
			sustain: .9,
			release: 1
		}),
		gi("Envelope", "linear"),
		vi(),
		_i(),
		yi()
	];
}
function Di(e) {
	let t = `voice${e}.`, n = `Voice ${e + 1}`, r = `V${e + 1} `;
	return [
		...fi(t, n, r, "sawtooth", {
			pulse: !0,
			fat: !1
		}),
		G(`${t}filterEnvelope.baseFrequency`, `${r}Cutoff`, n, {
			min: 20,
			max: 2e4,
			default: 200,
			curve: "log",
			unit: "Hz"
		}, wi, Ti),
		...mi(`${t}envelope`, n, r, "amp", {
			attack: .01,
			decay: .01,
			sustain: 1,
			release: .5
		})
	];
}
function Oi() {
	return [
		G("harmonicity", "Interval", "Voices", {
			min: .25,
			max: 8,
			default: 1.5,
			curve: "log",
			step: .01,
			unit: "×"
		}, "The pitch ratio of the second voice to the first; 1.5 puts voice 2 a perfect fifth above voice 1.", "At 1 the voices double in unison, 2 adds an octave, and 1.5 gives a hollow power-chord fifth."),
		gi("Voices", "linear"),
		G("vibratoAmount", "Vibrato depth", "Vibrato", {
			min: 0,
			max: 1,
			default: .5,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How deep the built-in pitch wobble is.", "Small amounts add a gentle, singer-like waver; large amounts sound seasick."),
		G("vibratoRate", "Vibrato rate", "Vibrato", {
			min: .1,
			max: 20,
			default: 5,
			curve: "log",
			step: .1,
			unit: "Hz"
		}, "How fast the built-in pitch wobble cycles, in wobbles per second.", "Around 5–6 Hz feels like a singer or violinist; slower rates drift and faster ones flutter."),
		...Di(0),
		...Di(1),
		...Ci("Filter"),
		vi(),
		_i(),
		yi()
	];
}
function ki() {
	return [
		...fi("", "Oscillator", "", "sine", {
			pulse: !1,
			fat: !1
		}),
		G("pitchDecay", "Pitch drop", "Pitch", {
			min: .001,
			max: .5,
			default: .05,
			curve: "log",
			unit: "s"
		}, "How long the pitch takes to fall from its high starting point down to the played note.", "Very short values give a tight, clicky kick; longer ones give the falling boom of a tom or a zappy laser."),
		G("octaves", "Drop range", "Pitch", {
			min: 1,
			max: 16,
			default: 10,
			curve: "linear",
			step: .1,
			unit: "×"
		}, "How many times higher than the played note the pitch starts before it drops: 2× is one octave up, 8× is three.", "Small values give a soft, round thump; large values add a sharp, punchy click to the front of each hit."),
		...mi("envelope", "Envelope", "", "amp", {
			attack: .001,
			decay: .4,
			sustain: .01,
			release: 1.4
		}),
		gi("Envelope", "exponential"),
		vi(),
		_i()
	];
}
function Ai() {
	return [
		G("harmonicity", "Pitch ratio", "Tone", {
			min: .5,
			max: 20,
			default: 5.1,
			curve: "log",
			step: .01,
			unit: "×"
		}, "The ratio between the pitches of the stacked oscillators that build the metallic tone.", "Changing it moves the hit between cymbal, cowbell, and gong colors; 5.1 is a classic hi-hat."),
		G("modulationIndex", "Density", "Tone", {
			min: 1,
			max: 100,
			default: 32,
			curve: "log",
			step: .1,
			unit: ""
		}, "How much the stacked oscillators bend each other, which sets how dense the overtones are.", "Low values sound like a tuned bell or cowbell; high values dissolve into a dense, hissy cymbal wash."),
		G("resonance", "Brightness", "Tone", {
			min: 200,
			max: 7e3,
			default: 4e3,
			curve: "log",
			unit: "Hz"
		}, "The lowest frequency the built-in high-pass filter lets through, which sets the floor of the hit.", "Low values add body and clang; high values leave only the thin sizzle at the top of a hi-hat."),
		G("octaves", "Filter sweep", "Tone", {
			min: 0,
			max: 4,
			default: 1.5,
			curve: "linear",
			step: .1,
			unit: "oct"
		}, "How far, in octaves, the filter opens above the brightness setting during each hit.", "Higher values make each hit sweep brighter and splashier; with brightness already high, a big sweep thins the hit to almost nothing."),
		...mi("envelope", "Envelope", "", "amp", {
			attack: .001,
			decay: 1.4,
			sustain: 0,
			release: .2
		}),
		gi("Envelope", "linear"),
		vi(),
		_i()
	];
}
function ji() {
	let e = G("resonance", "Sustain", "String", {
		min: .1,
		max: .99,
		default: .7,
		curve: "linear",
		step: .01,
		unit: ""
	}, "How much energy the virtual string keeps on each pass, which sets how long the note rings.", "Low values give a short, dead thunk like pizzicato; values near the top ring out like a harp.");
	e.rebuild = !0, e.visibleWhen = {
		path: "stringDecay",
		equals: ["sustain"]
	};
	let t = G("ringTime", "Ring time", "String", {
		min: .05,
		max: 20,
		default: 1.5,
		curve: "log",
		unit: "s"
	}, "How long a plucked note takes to die away to silence, the same for every note from low to high.", "Short times give a muted, plucky thunk; long ones let a harp or a steel string ring on.");
	t.visibleWhen = {
		path: "stringDecay",
		equals: ["ring"]
	}, t.perNote = !0;
	let n = K("stringDecay", "String decay", "String", [{
		value: "sustain",
		label: "Sustain (fixed loop)"
	}, {
		value: "ring",
		label: "Ring time"
	}], "sustain", "How the string’s ring is set: Sustain keeps the same loop strength on every note, so high notes die faster; Ring time sets one length in seconds for all of them.", "Sustain is the classic sound of older patches; Ring time lets high notes sing as long as low ones.");
	n.perNote = !0;
	let r = K("tuning", "IN TUNE", "Pitch", [{
		value: "classic",
		label: "Off"
	}, {
		value: "exact",
		label: "On"
	}], "classic", "Tunes the virtual string to the nearest pitch it can reach. Off, it always runs a little flat, more on higher notes.", "Clearest against other layers or instruments: high plucks stop sounding sour beside them. Off keeps older patches as they were.");
	r.toggle = {
		on: "exact",
		off: "classic"
	}, r.perNote = !0;
	let i = G("velocity", "Velocity", "String", {
		min: 0,
		max: 1,
		default: 0,
		curve: "linear",
		step: .01,
		unit: ""
	}, "How much harder playing makes the pluck louder; at 0 every note plays at full level.", "Raise it for fingerpicked parts with soft and loud notes; leave it at 0 for an even, machine-like strum.");
	i.perNote = !0;
	let a = {
		..._i(),
		perNote: !0
	}, o = vi();
	return [
		G("attackNoise", "Pick noise", "String", {
			min: .1,
			max: 20,
			default: 1,
			curve: "log",
			step: .1,
			unit: "cycles"
		}, "How long the burst of noise that sets the virtual string moving lasts, measured in cycles of the played note.", "Low values give a soft, rounded fingertip pluck; high values add a scratchy pick attack, like a harpsichord quill."),
		G("dampening", "Damping", "String", {
			min: 200,
			max: 7e3,
			default: 4e3,
			curve: "log",
			unit: "Hz"
		}, "The cutoff of the filter inside the virtual string, which sets how quickly its high overtones die away.", "Low values sound like a muted or nylon-string pluck; high values ring like bright steel strings."),
		n,
		e,
		t,
		G("release", "Release", "String", {
			min: .01,
			max: 4,
			default: 1,
			curve: "log",
			unit: "s"
		}, "How long the string takes to stop ringing after you let go of the key.", "Short values mute the string like a palm resting on it; long ones let it ring naturally."),
		i,
		r,
		o,
		a
	];
}
function Mi() {
	return [
		K("noise.type", "Noise color", "Noise", [
			{
				value: "white",
				label: "White"
			},
			{
				value: "pink",
				label: "Pink"
			},
			{
				value: "brown",
				label: "Brown"
			}
		], "white", "The color of the noise: white is even across all frequencies, pink tilts darker, and brown is darkest.", "White hisses like a hi-hat or snare wires, pink sounds like rain or surf, and brown rumbles like wind or distant thunder."),
		...mi("envelope", "Envelope", "", "amp", {
			attack: .005,
			decay: .1,
			sustain: 0,
			release: .3
		}),
		gi("Envelope", "linear")
	];
}
var Ni = [
	{
		value: "a",
		label: "ah (father)"
	},
	{
		value: "e",
		label: "eh (say)"
	},
	{
		value: "i",
		label: "ee (see)"
	},
	{
		value: "o",
		label: "oh (go)"
	},
	{
		value: "u",
		label: "oo (moon)"
	}
];
function Pi() {
	let e = K("vowelA", "Vowel", "Syllable", Ni, "o", "The vowel each note sings in plain vowel mode, and where its glide starts.", "Ah and oh sound open and warm, ee and oo sound closed and small; eh sits in between."), t = K("vowelB", "Glide-to vowel", "Syllable", Ni, "u", "The vowel a held note drifts toward in plain vowel mode.", "Oh gliding to oo gives a rounded “ohw”; ah gliding to ee gives a bright “eye”.");
	e.visibleWhen = {
		path: "syllableMode",
		equals: ["vowel"]
	}, t.visibleWhen = {
		path: "syllableMode",
		equals: ["vowel"]
	};
	let n = Object.entries(Zr).map(([e, t]) => ({
		value: e,
		label: t.label
	}));
	return [
		K("syllableMode", "Syllables", "Syllable", [
			{
				value: "cycle",
				label: "Cycle the set"
			},
			{
				value: "random",
				label: "Random from the set"
			},
			{
				value: "vowel",
				label: "Plain vowel"
			},
			...Object.keys(Xr).map((e) => ({
				value: e,
				label: `Always "${e}"`
			}))
		], "cycle", "Which bit of gibberish each note sings: the set in order, a seeded pick from the set, a plain vowel, or one fixed syllable.", "Cycle gives the steady nah-me-oh-now-queh patter; Random sounds more like real chatter, and a fixed syllable is the most robotic."),
		K("syllableSet", "Syllable set", "Syllable", n, "kk", "The pool of sounds that Cycle and Random draw from, so a cat can meow and a choir can sing “ah”.", "Each set changes the consonants and vowels at once; try Babble for villager chatter or Choir for soft open vowels."),
		G("seed", "Lyric seed", "Syllable", {
			min: 1,
			max: 999,
			default: 7,
			curve: "linear",
			step: 1,
			unit: ""
		}, "Picks the made-up lyrics Random mode and Randomness choose. The same seed sings the same words on the same notes every time.", "Step through seeds on a phrase until the gibberish lands; the game sings it the same way. Live notes follow the order you play them."),
		e,
		t,
		G("morph", "Vowel glide", "Syllable", {
			min: 0,
			max: 1,
			default: .6,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How far each held note slides from its first vowel toward its second, the slur that turns “nah” into “now”.", "At 0 every vowel holds still and sounds sung; near 1 notes bend into diphthongs that sound more like words."),
		G("morphTime", "Glide time", "Syllable", {
			min: .05,
			max: 1.5,
			default: .35,
			curve: "log",
			unit: "s"
		}, "How long that vowel slide takes once the note has landed.", "Short glides sound chatty and quick; long ones give a lazy, drawn-out croon."),
		G("consonant", "Consonants", "Syllable", {
			min: 0,
			max: 1,
			default: .7,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How strongly the n, m, k, s, and other sounds at the start of each syllable come through.", "Low values blur the syllables into humming vowels; high values make every note pop like a spoken word."),
		G("randomness", "Randomness", "Syllable", {
			min: 0,
			max: 1,
			default: .35,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How much each note wanders: a fixed syllable sometimes swaps, and pitch and vowel color shift a little per note.", "A touch keeps a phrase from sounding like a machine; a lot sounds tipsy and off-key."),
		G("voiceMix", "Bass to tenor", "Voice", {
			min: 0,
			max: 1,
			default: .35,
			curve: "linear",
			step: .01,
			unit: ""
		}, "Blends between a bass singer’s vowel shapes and a tenor’s.", "Toward bass the vowels turn low and woolly; toward tenor they get lighter and clearer."),
		G("formantShift", "Voice size", "Voice", {
			min: .7,
			max: 1.5,
			default: 1,
			curve: "log",
			step: .01,
			unit: "×"
		}, "Scales the size of the throat the voice comes from without changing the note: under 1 is a bigger body, over 1 a smaller one.", "Push it up for chipmunk Animalese and tiny villagers; pull it down for giants, frogs, and whales."),
		G("bandwidth", "Vowel sharpness", "Voice", {
			min: .5,
			max: 3,
			default: 1.2,
			curve: "log",
			step: .01,
			unit: "×"
		}, "How wide each vowel resonance is: low values are narrow and focused, high values broad and blurred.", "Low settings sound crisp and robotic; high ones sound soft and mumbly, as if singing through a smile."),
		K("source", "Source wave", "Voice", [{
			value: "glottal",
			label: "Glottal (soft)"
		}, {
			value: "saw",
			label: "Sawtooth (buzzy)"
		}], "glottal", "The raw buzz the vowels are carved from, before any shaping.", "Glottal is round and gentle like a real throat; sawtooth is buzzier and cuts through a busy mix."),
		G("brightness", "Brightness", "Voice", {
			min: 600,
			max: 9e3,
			default: 3200,
			curve: "log",
			unit: "Hz"
		}, "A low-pass on the raw buzz that opens or darkens it before the vowels shape it.", "Low values sound hooded and far away, like an owl; high values add a forward, nasal edge."),
		G("breath", "Breathiness", "Voice", {
			min: 0,
			max: 1,
			default: .18,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How much airy hiss is mixed in through the vowels, with the buzz backing off as it rises.", "A little makes the voice intimate; near 1 it turns into a whisper with only a ghost of pitch."),
		G("roughness", "Roughness", "Voice", {
			min: 0,
			max: 1,
			default: 0,
			curve: "linear",
			step: .01,
			unit: ""
		}, "Chops the voice in fast pulses, the way a creaky or growling throat does.", "Low values give a sleepy vocal fry; high values become a growl, a bark, or a frog’s croak. At 0 it costs nothing."),
		vi(),
		_i(),
		G("portamento", "Glide", "Pitch", {
			min: 0,
			max: .4,
			default: .06,
			curve: "linear",
			step: .005,
			unit: "s"
		}, "How long the pitch slides from the previous note when Scoop is off; it also sets how fast a scoop swoops.", "Small values add a vocal slur between notes; longer ones sound like a lazy, sliding crooner."),
		G("scoop", "Scoop", "Pitch", {
			min: 0,
			max: 300,
			default: 40,
			curve: "linear",
			step: 1,
			unit: "cents"
		}, "Starts every note this far flat and swoops up to pitch; 100 cents is one semitone.", "A little is the crooner’s signature; a lot sounds like a meow, a yodel flip, or a whale."),
		G("pitchDrop", "Fall on release", "Pitch", {
			min: 0,
			max: 1200,
			default: 0,
			curve: "linear",
			step: 1,
			unit: "cents"
		}, "How far the pitch sags while a note fades out after you let go.", "Pair it with a longer release to hear it: a few hundred cents gives a meow’s droop or the end of a bark."),
		G("vibDepth", "Vibrato depth", "Vibrato", {
			min: 0,
			max: 100,
			default: 28,
			curve: "linear",
			step: 1,
			unit: "cents"
		}, "How wide the singer’s pitch wobble is, in cents.", "Around 20–40 sounds like a natural singer; wider sounds operatic, then shaky like a goat."),
		G("vibRate", "Vibrato rate", "Vibrato", {
			min: 2,
			max: 9,
			default: 5.2,
			curve: "linear",
			step: .1,
			unit: "Hz"
		}, "How many times per second the pitch wobbles.", "About 5–6 sounds like a singer; slower drifts dreamily, faster flutters like a bird."),
		G("vibDelay", "Vibrato delay", "Vibrato", {
			min: 0,
			max: 1.2,
			default: .3,
			curve: "linear",
			step: .01,
			unit: "s"
		}, "How long a held note stays straight before the wobble fades in.", "Short notes stay clean while long ones bloom, the way trained singers do; at 0 every note wobbles at once."),
		G("envelope.attack", "Attack", "Envelope", {
			min: .002,
			max: 2,
			default: .03,
			curve: "log",
			unit: "s"
		}, "How long the voice takes to swell in on each syllable: after the burst of a k, t, or s, and through the hum of an n or m.", "Short attacks spit syllables out like chatter; long ones make a soft, swelling choir."),
		G("envelope.release", "Release", "Envelope", {
			min: .01,
			max: 4,
			default: .25,
			curve: "log",
			unit: "s"
		}, "How long the voice takes to fade after you let go, and how long any fall on release lasts.", "Short releases clip words off neatly; long ones let each note sigh away.")
	];
}
var Fi = {
	Synth: xi(),
	AMSynth: Si(!1),
	FMSynth: Si(!0),
	MonoSynth: Ei(),
	DuoSynth: Oi(),
	MembraneSynth: ki(),
	MetalSynth: Ai(),
	PluckSynth: ji(),
	NoiseSynth: Mi(),
	FormantVoice: Pi()
}, Ii = {
	Synth: { detune: "detune" },
	AMSynth: {
		detune: "detune",
		harmonicity: "harmonicity.factor"
	},
	FMSynth: {
		detune: "detune",
		harmonicity: "harmonicity.factor",
		modulationIndex: "modulationIndex.factor"
	},
	MonoSynth: {
		detune: "detune",
		"filter.Q": "filter.Q"
	},
	DuoSynth: {
		detune: "detune",
		harmonicity: "harmonicity.factor",
		vibratoAmount: "vibratoAmount",
		vibratoRate: "vibratoRate"
	},
	MembraneSynth: { detune: "detune" },
	MetalSynth: { detune: "detune" },
	PluckSynth: {},
	NoiseSynth: {},
	FormantVoice: {
		detune: "osc.detune",
		brightness: "tilt.frequency",
		breath: "breathSig",
		formantShift: "shiftSig",
		vibRate: "vibLfo.frequency"
	}
};
for (let e of oi) for (let t of Fi[e]) Object.hasOwn(Ii[e], t.path) && (t.modulatable = !0);
function Li(e, t) {
	return Object.hasOwn(Ii[e], t) ? Ii[e][t] : void 0;
}
function Ri(e, t) {
	let { min: n, max: r } = e;
	if (!(r > n)) return 0;
	let i = Math.min(r, Math.max(n, t)), a = e.curve === "log" && n > 0 ? Math.log(i / n) / Math.log(r / n) : (i - n) / (r - n);
	return Number.isFinite(a) ? a : 0;
}
function zi(e, t) {
	let { min: n, max: r } = e, i = Math.min(1, Math.max(0, Number.isFinite(t) ? t : 0));
	return e.curve === "log" && n > 0 ? n * (r / n) ** i : n + (r - n) * i;
}
function Bi(e, t) {
	return Fi[e].find((e) => e.path === t);
}
function Vi(e) {
	let t = {};
	for (let n of Fi[e]) t[n.path] = n.default;
	return t;
}
function Hi(e, t) {
	if (e.kind === "choice") return typeof t == "string" && e.choices.some((e) => e.value === t) ? t : void 0;
	if (typeof t != "number" || !Number.isFinite(t)) return;
	let n = Math.min(e.max, Math.max(e.min, t));
	return e.step === 1 && (n = Math.round(n)), n;
}
function Ui(e, t) {
	return Wi(Fi[e], t);
}
function Wi(e, t) {
	let n = typeof t == "object" && t ? t : {}, r = {};
	for (let t of e) {
		let e = Object.prototype.hasOwnProperty.call(n, t.path);
		r[t.path] = (e ? Hi(t, n[t.path]) : void 0) ?? t.default;
	}
	return r;
}
var Gi = [
	"filter",
	"distortion",
	"bitcrusher",
	"chorus",
	"phaser",
	"tremolo",
	"eq",
	"compressor"
];
function Ki(e) {
	return typeof e == "string" && Gi.includes(e);
}
var qi = [
	{
		value: "4m",
		label: "4 bars",
		quarters: 16
	},
	{
		value: "2m",
		label: "2 bars",
		quarters: 8
	},
	{
		value: "1m",
		label: "1 bar",
		quarters: 4
	},
	{
		value: "2n",
		label: "1/2",
		quarters: 2
	},
	{
		value: "2n.",
		label: "1/2 dotted",
		quarters: 3
	},
	{
		value: "2t",
		label: "1/2 triplet",
		quarters: 4 / 3
	},
	{
		value: "4n",
		label: "1/4",
		quarters: 1
	},
	{
		value: "4n.",
		label: "1/4 dotted",
		quarters: 1.5
	},
	{
		value: "4t",
		label: "1/4 triplet",
		quarters: 2 / 3
	},
	{
		value: "8n",
		label: "1/8",
		quarters: .5
	},
	{
		value: "8n.",
		label: "1/8 dotted",
		quarters: .75
	},
	{
		value: "8t",
		label: "1/8 triplet",
		quarters: 1 / 3
	},
	{
		value: "16n",
		label: "1/16",
		quarters: .25
	},
	{
		value: "16t",
		label: "1/16 triplet",
		quarters: 1 / 6
	},
	{
		value: "32n",
		label: "1/32",
		quarters: .125
	}
], Ji = qi.map(({ value: e, label: t }) => ({
	value: e,
	label: t
}));
function Yi(e) {
	return qi.find((t) => t.value === e)?.quarters ?? null;
}
function Xi(e, t) {
	let n = Yi(e) ?? 1;
	return 60 / (Number.isFinite(t) && t > 0 ? t : 120) * n;
}
var Zi = () => {
	let e = G("wet", "Mix", "Mix", {
		min: 0,
		max: 1,
		default: 1,
		curve: "linear",
		step: .01,
		unit: ""
	}, "How much of the effected sound is heard against the dry sound going in.", "At 1 you hear only the pedal; lower values blend the untouched sound back in.");
	return e.modulatable = !0, e;
}, Qi = (e) => (e.modulatable = !0, e), $i = (e) => (e.rebuild = !0, e), ea = [
	{
		value: "sine",
		label: "Sine"
	},
	{
		value: "triangle",
		label: "Triangle"
	},
	{
		value: "square",
		label: "Square"
	},
	{
		value: "sawtooth",
		label: "Sawtooth"
	}
];
function ta() {
	return [
		K("type", "Type", "Filter", [
			{
				value: "lowpass",
				label: "Low-pass"
			},
			{
				value: "highpass",
				label: "High-pass"
			},
			{
				value: "bandpass",
				label: "Band-pass"
			},
			{
				value: "notch",
				label: "Notch"
			}
		], "lowpass", "Which part of the sound the filter keeps: low-pass keeps the lows, high-pass the highs, and band-pass a band in the middle. Notch removes a band.", "Low-pass darkens and warms, high-pass thins, band-pass sounds like a telephone, and a swept notch gives a hollow, phasey whoosh."),
		Qi(G("frequency", "Cutoff", "Filter", {
			min: 20,
			max: 2e4,
			default: 1200,
			curve: "log",
			unit: "Hz"
		}, "Where the filter starts to act on the whole instrument, after every layer is mixed.", "Sweep it slowly for the classic filter rise; an LFO on it gives a wah or a slow throb.")),
		Qi(G("Q", "Resonance", "Filter", {
			min: .1,
			max: 20,
			default: 1,
			curve: "log",
			step: .1,
			unit: ""
		}, "How much the filter emphasizes the frequencies right at the cutoff.", "Higher values add a vocal, whistling peak that sings as the cutoff moves; very high values squeal."))
	];
}
function na() {
	return [
		G("distortion", "Drive", "Distortion", {
			min: 0,
			max: 1,
			default: .4,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How hard the sound is pushed into the waveshaper that clips its peaks.", "Low values add a warm, gritty edge like a tube amp; high values turn into a buzzy fuzz pedal."),
		K("oversample", "Quality", "Distortion", [
			{
				value: "none",
				label: "Raw"
			},
			{
				value: "2x",
				label: "Smooth"
			},
			{
				value: "4x",
				label: "Smoothest"
			}
		], "none", "Runs the distortion at a higher internal sample rate so harsh overtones fold back less.", "Raw has a gritty, aliased crunch that suits chip sounds; smoother settings sound cleaner and cost more processing."),
		Zi()
	];
}
function ra() {
	return [G("bits", "Bits", "Bitcrusher", {
		min: 1,
		max: 16,
		default: 4,
		curve: "linear",
		step: 1,
		unit: "bits"
	}, "How many volume steps the sound is rounded to; each bit doubles the number of steps.", "Around 8 bits sounds like an old console sample; 3 or 4 bits turn into a fizzy, broken-speaker crunch."), Zi()];
}
function ia() {
	return [
		Qi(G("frequency", "Rate", "Chorus", {
			min: .1,
			max: 20,
			default: 1.5,
			curve: "log",
			step: .01,
			unit: "Hz"
		}, "How fast the chorus sweeps its delayed copies, in sweeps per second.", "Slow rates shimmer gently like a twelve-string; fast ones wobble toward vibrato.")),
		G("delayTime", "Delay time", "Chorus", {
			min: 2,
			max: 20,
			default: 3.5,
			curve: "log",
			step: .1,
			unit: "ms"
		}, "How far behind the original the delayed copies sit before they sweep.", "Short delays give a tight shimmer; longer ones spread into a doubled, slightly detuned ensemble."),
		G("depth", "Depth", "Chorus", {
			min: 0,
			max: 1,
			default: .7,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How far the delayed copies sweep back and forth.", "Deeper settings make the pitch wobble more noticeably, from lush to seasick."),
		G("feedback", "Feedback", "Chorus", {
			min: 0,
			max: .9,
			default: 0,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How much of the chorus output is fed back into itself.", "A little adds a metallic, flanger-like edge; more makes it ring."),
		G("spread", "Width", "Chorus", {
			min: 0,
			max: 180,
			default: 180,
			curve: "linear",
			step: 1,
			unit: "°"
		}, "How far apart the left and right sweeps run, in degrees of their cycle.", "At 180 the two sides move opposite each other for a wide stereo image; at 0 the chorus sits in the middle."),
		Zi()
	];
}
function aa() {
	return [
		Qi(G("frequency", "Rate", "Phaser", {
			min: .05,
			max: 20,
			default: .5,
			curve: "log",
			step: .01,
			unit: "Hz"
		}, "How fast the phaser sweeps its notches up and down, in sweeps per second.", "Slow rates give the swooshing jet sound; fast ones turn into a bubbly warble.")),
		G("octaves", "Range", "Phaser", {
			min: 0,
			max: 6,
			default: 3,
			curve: "linear",
			step: .1,
			unit: "oct"
		}, "How many octaves the notches sweep above their starting frequency.", "Small ranges are subtle and throaty; wide ranges sweep dramatically from dark to bright."),
		G("baseFrequency", "Base frequency", "Phaser", {
			min: 50,
			max: 2e3,
			default: 350,
			curve: "log",
			unit: "Hz"
		}, "The lowest point of the sweep.", "Low values make the sweep growl through the body of the sound; high values keep it up in the sizzle."),
		Qi(G("Q", "Resonance", "Phaser", {
			min: .1,
			max: 20,
			default: 10,
			curve: "log",
			step: .1,
			unit: ""
		}, "How sharp and pronounced the sweeping notches are.", "Higher values make the sweep whistle and stand out; lower values keep it soft.")),
		$i(G("stages", "Stages", "Phaser", {
			min: 1,
			max: 12,
			default: 10,
			curve: "linear",
			step: 1,
			unit: ""
		}, "How many filter stages build the effect; more stages carve more notches.", "Few stages sound gentle and vintage; many sound deep and dramatic, and cost more processing.")),
		Zi()
	];
}
function oa() {
	return [
		Qi(G("frequency", "Rate", "Tremolo", {
			min: .1,
			max: 40,
			default: 6,
			curve: "log",
			step: .01,
			unit: "Hz"
		}, "How fast the volume pulses, in pulses per second.", "Around 4–8 Hz is the classic surf-amp shimmer; faster rates flutter like a helicopter.")),
		Qi(G("depth", "Depth", "Tremolo", {
			min: 0,
			max: 1,
			default: .5,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How far the volume dips on each pulse.", "Low values add a gentle pulse; at 1 the sound chops all the way to silence.")),
		K("type", "Shape", "Tremolo", ea, "sine", "The shape of each volume pulse.", "Sine is smooth and gentle; square chops hard like a gate, and sawtooth gives a pumping swell."),
		G("spread", "Width", "Tremolo", {
			min: 0,
			max: 180,
			default: 0,
			curve: "linear",
			step: 1,
			unit: "°"
		}, "How far apart the left and right pulses run, in degrees of their cycle.", "At 180 the sound bounces between the speakers like an auto-panner; at 0 both sides pulse together."),
		Zi()
	];
}
var sa = (e, t, n, r) => Qi(G(e, t, "EQ", {
	min: -24,
	max: 12,
	default: 0,
	curve: "linear",
	step: .1,
	unit: "dB"
}, n, r));
function ca() {
	return [
		sa("low", "Low gain", "Boosts or cuts everything below the low split.", "Cut it to stop a lead muddying the bass; boost it for a fatter bottom end."),
		sa("mid", "Mid gain", "Boosts or cuts the band between the two splits, where most of a sound’s body lives.", "Cutting scoops the sound out like a metal guitar tone; boosting pushes it forward like a telephone."),
		sa("high", "High gain", "Boosts or cuts everything above the high split.", "Boost for air and sparkle; cut to tame a harsh, fizzy top."),
		G("lowFrequency", "Low split", "EQ", {
			min: 40,
			max: 1e3,
			default: 400,
			curve: "log",
			unit: "Hz"
		}, "Where the low band ends and the mid band begins.", "Lower settings let the low knob touch only the deep bass; higher ones reach into the warmth."),
		G("highFrequency", "High split", "EQ", {
			min: 1e3,
			max: 1e4,
			default: 2500,
			curve: "log",
			unit: "Hz"
		}, "Where the mid band ends and the high band begins.", "Lower settings let the high knob shape the bite of the sound; higher ones touch only the sheen.")
	];
}
function la() {
	return [
		Qi(G("threshold", "Threshold", "Compressor", {
			min: -60,
			max: 0,
			default: -24,
			curve: "linear",
			step: .5,
			unit: "dB"
		}, "The level above which the compressor starts turning the sound down.", "Lower thresholds squash more of the sound, evening out loud and quiet notes.")),
		G("ratio", "Ratio", "Compressor", {
			min: 1,
			max: 20,
			default: 4,
			curve: "log",
			step: .1,
			unit: ":1"
		}, "How strongly sound above the threshold is turned down: at 4:1, every 4 dB over comes out as 1 dB over.", "Low ratios are gentle glue; high ratios flatten peaks like a limiter."),
		G("attack", "Attack", "Compressor", {
			min: .001,
			max: .5,
			default: .003,
			curve: "log",
			unit: "s"
		}, "How quickly the compressor clamps down once the sound crosses the threshold.", "Slower attacks let the click at the start of each note through, which makes plucks and drums punchier."),
		G("release", "Release", "Compressor", {
			min: .01,
			max: 1,
			default: .25,
			curve: "log",
			unit: "s"
		}, "How quickly the compressor lets go once the sound falls back under the threshold.", "Short releases pump and breathe audibly; long ones hold the level smooth."),
		G("knee", "Knee", "Compressor", {
			min: 0,
			max: 40,
			default: 30,
			curve: "linear",
			step: 1,
			unit: "dB"
		}, "How gradually compression fades in around the threshold.", "A hard knee (low) grabs abruptly; a soft knee (high) eases in and sounds more natural.")
	];
}
var ua = {
	filter: ta(),
	distortion: na(),
	bitcrusher: ra(),
	chorus: ia(),
	phaser: aa(),
	tremolo: oa(),
	eq: ca(),
	compressor: la()
};
function da(e) {
	return ua[e];
}
function fa(e, t) {
	return ua[e].find((e) => e.path === t);
}
var pa = [
	"reverb",
	"delay",
	"chorus"
], ma = {
	reverb: "Reverb",
	delay: "Delay",
	chorus: "Chorus"
};
function ha(e) {
	return typeof e == "string" && pa.includes(e);
}
var ga = {
	reverb: [G("decay", "Decay", "Reverb", {
		min: .2,
		max: 12,
		default: 2.5,
		curve: "log",
		step: .01,
		unit: "s"
	}, "How long the room keeps ringing after a sound stops. Changing it rebuilds the room, so expect a brief glitch.", "Short decays sound like a small room; long ones like a hall or a cave."), G("preDelay", "Pre-delay", "Reverb", {
		min: 0,
		max: .25,
		default: .02,
		curve: "linear",
		step: .001,
		unit: "s"
	}, "A short gap before the reverb starts, as if the walls were farther away.", "A little pre-delay keeps notes crisp in front of the reverb instead of smearing into it.")],
	delay: [K("division", "Time", "Delay", Ji, "8n.", "The gap between echoes, locked to the song’s tempo.", "A dotted eighth gives the galloping echo of countless lead lines; a quarter note sounds like a canyon answering back."), G("feedback", "Feedback", "Delay", {
		min: 0,
		max: .9,
		default: .35,
		curve: "linear",
		step: .01,
		unit: ""
	}, "How much of each echo is fed back to make the next one.", "Low values give one or two repeats; high values keep echoing for a long time.")],
	chorus: [
		G("frequency", "Rate", "Chorus", {
			min: .1,
			max: 20,
			default: 1.5,
			curve: "log",
			step: .01,
			unit: "Hz"
		}, "How fast the chorus sweeps its delayed copies, in sweeps per second.", "Slow rates shimmer gently; fast ones wobble toward vibrato."),
		G("delayTime", "Delay time", "Chorus", {
			min: 2,
			max: 20,
			default: 3.5,
			curve: "log",
			step: .1,
			unit: "ms"
		}, "How far behind the original the delayed copies sit.", "Short delays give a tight shimmer; longer ones spread into a doubled ensemble."),
		G("depth", "Depth", "Chorus", {
			min: 0,
			max: 1,
			default: .7,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How far the delayed copies sweep back and forth.", "Deeper settings wobble the pitch more, from lush to seasick."),
		G("spread", "Width", "Chorus", {
			min: 0,
			max: 180,
			default: 180,
			curve: "linear",
			step: 1,
			unit: "°"
		}, "How far apart the left and right sweeps run.", "At 180 the chorus is as wide as it gets; at 0 it sits in the middle.")
	]
};
function _a(e) {
	return ga[e];
}
function va(e) {
	return Wi(ga[e], {});
}
function ya(e, t) {
	return Wi(ga[e], t);
}
var ba = [
	"sine",
	"triangle",
	"square",
	"sawtooth"
], xa = {
	shape: K("shape", "Shape", "LFO", ea, "sine", "The shape of the slow wave that turns the knobs it is connected to.", "Sine and triangle sweep smoothly back and forth; square flips between two settings, and sawtooth ramps up and snaps back."),
	division: K("division", "Rate", "LFO", Ji, "1m", "One full sweep, as a note length at the song’s tempo.", "Longer divisions give slow evolving movement; short ones give rhythmic pulsing that stays in time with the song."),
	hz: G("hz", "Rate", "LFO", {
		min: .02,
		max: 20,
		default: 1,
		curve: "log",
		step: .01,
		unit: "Hz"
	}, "Sweeps per second, independent of the tempo.", "Below 1 Hz the movement drifts slowly; around 5 Hz it becomes vibrato or tremolo territory."),
	depth: G("depth", "Depth", "LFO", {
		min: 0,
		max: 1,
		default: .5,
		curve: "linear",
		step: .01,
		unit: ""
	}, "How far the LFO swings each connected knob, centered on its current setting.", "Small depths add subtle life; large ones swing the knob across most of its range."),
	connectionDepth: G("depth", "Amount", "LFO", {
		min: -1,
		max: 1,
		default: 1,
		curve: "linear",
		step: .01,
		unit: ""
	}, "How much of this LFO’s swing reaches this one knob, on top of the LFO’s overall Depth. Negative values invert it.", "Run two knobs at opposite amounts and one rises while the other falls.")
};
function Sa(e, t) {
	return e.sync ? 1 / Xi(e.division, t) : Number.isFinite(e.hz) ? Math.min(xa.hz.max, Math.max(xa.hz.min, e.hz)) : xa.hz.default;
}
var Ca = {
	kind: "number",
	path: "volume",
	label: "Level",
	group: "Layer",
	min: -60,
	max: 6,
	default: 0,
	curve: "linear",
	step: .1,
	unit: "dB",
	modulatable: !0,
	tip: "How loud this layer is against the others.",
	listenFor: "An LFO here makes the layer swell and fade, a slow tremolo on just this part of the sound."
};
function wa(e, t) {
	return `layer:${e}:${t}`;
}
function Ta(e, t) {
	return `fx:${e}:${t}`;
}
function Ea(e) {
	if (typeof e != "string") return null;
	let t = e.indexOf(":"), n = t < 0 ? -1 : e.indexOf(":", t + 1);
	if (n < 0) return null;
	let r = e.slice(0, t), i = e.slice(t + 1, n), a = e.slice(n + 1);
	if (!i || !a) return null;
	if (r === "layer") {
		let e = Number(i);
		return Number.isInteger(e) && e >= 0 && String(e) === i ? {
			kind: r,
			layer: e,
			path: a
		} : null;
	}
	return r === "fx" ? {
		kind: r,
		effectId: i,
		path: a
	} : null;
}
function Da(e, t) {
	let n = Ea(t);
	if (!n) return null;
	if (n.kind === "layer") {
		let t = e.layers[n.layer];
		if (!t) return null;
		if (n.path === "volume") return Ca;
		let r = Bi(t.voiceType, n.path);
		return r?.kind === "number" && Li(t.voiceType, n.path) ? r : null;
	}
	let r = e.effects?.find((e) => e.id === n.effectId), i = r ? fa(r.type, n.path) : void 0;
	return i?.kind === "number" && i.modulatable ? i : null;
}
function Oa(e, t) {
	let n = Da(e, t), r = Ea(t);
	if (!n || !r) return null;
	let i;
	if (r.kind === "layer") {
		let t = e.layers[r.layer];
		i = r.path === "volume" ? t.volume : t.params[r.path];
	} else i = e.effects.find((e) => e.id === r.effectId).params[r.path];
	return typeof i == "number" && Number.isFinite(i) ? i : n.default;
}
function ka(e, t, n) {
	let r = Ri(e, t), i = Math.min(1, Math.abs(Number.isFinite(n) ? n : 0)) / 2, a = zi(e, r - i), o = zi(e, r + i);
	return n < 0 ? [o, a] : [a, o];
}
var Aa = (e, t) => Object.hasOwn(e, t) ? e[t] : void 0;
function ja(e) {
	if (typeof e != "string") return null;
	let t = e.trim();
	return t.length > 0 && t.length <= 64 && !t.includes(":") && ![
		"__proto__",
		"prototype",
		"constructor"
	].includes(t) ? t : null;
}
var Ma = (e, t, n, r) => typeof e == "number" && Number.isFinite(e) ? Math.min(n, Math.max(t, e)) : r;
function Na(e) {
	if (typeof e != "object" || !e || Array.isArray(e)) return null;
	let t = e, n = ja(Aa(t, "id")), r = Aa(t, "type");
	return n === null || !Ki(r) ? null : {
		id: n,
		type: r,
		bypass: Aa(t, "bypass") === !0,
		params: Wi(ua[r], Aa(t, "params"))
	};
}
function Pa(e, t) {
	if (typeof e != "object" || !e || Array.isArray(e)) return null;
	let n = e, r = ja(Aa(n, "id"));
	if (r === null) return null;
	let i = Aa(n, "shape"), a = Aa(n, "division"), o = [], s = Aa(n, "connections");
	if (Array.isArray(s)) for (let e of s.slice(0, 64)) {
		if (o.length >= 16) break;
		if (typeof e != "object" || !e) continue;
		let n = Aa(e, "target");
		typeof n == "string" && t(n) && !o.some((e) => e.target === n) && o.push({
			target: n,
			depth: Ma(Aa(e, "depth"), -1, 1, 1)
		});
	}
	return {
		id: r,
		shape: ba.includes(i) ? i : "sine",
		sync: Aa(n, "sync") !== !1,
		division: typeof a == "string" && Yi(a) !== null ? a : xa.division.default,
		hz: Ma(Aa(n, "hz"), xa.hz.min, xa.hz.max, xa.hz.default),
		depth: Ma(Aa(n, "depth"), 0, 1, xa.depth.default),
		connections: o
	};
}
function Fa(e) {
	let t = [];
	if (!Array.isArray(e)) return t;
	for (let n of e.slice(0, 24)) {
		if (t.length >= 6) break;
		let e = Na(n);
		e && !t.some((t) => t.id === e.id) && t.push(e);
	}
	return t;
}
function Ia(e, t) {
	let n = [];
	if (!Array.isArray(e)) return n;
	let r = /* @__PURE__ */ new Set(), i = (e) => !r.has(e) && Da(t, e) !== null;
	for (let t of e.slice(0, 12)) {
		if (n.length >= 3) break;
		let e = Pa(t, i);
		if (e && !n.some((t) => t.id === e.id)) {
			for (let t of e.connections) r.add(t.target);
			n.push(e);
		}
	}
	return n;
}
var La = [
	"vox",
	"melody",
	"harmony",
	"bass",
	"kit",
	"perc"
];
function Ra(e) {
	return La.includes(e);
}
function za() {
	return [{
		id: "reverb",
		name: "Reverb",
		type: "reverb",
		params: va("reverb"),
		returnDb: 0,
		mute: !1
	}, {
		id: "delay",
		name: "Delay",
		type: "delay",
		params: va("delay"),
		returnDb: 0,
		mute: !1
	}];
}
function Ba(e) {
	return e.buses ?? za();
}
function Va(e) {
	return 3840 / e.unit;
}
function Ha(e) {
	return Va(e) * e.beats;
}
function Ua(e) {
	return e.startTick + e.lengthTicks;
}
function Wa(e) {
	let t = 0;
	for (let n of e.tracks) for (let e of n.clips) t = Math.max(t, Ua(e));
	return t;
}
//#endregion
//#region src/vendor/ableton-web-audio-sequencing/clock.ts
var Ga = 10, Ka = 250, qa = class {
	stableTickWorker = null;
	fallbackTimer = null;
	audioContext;
	lookaheadTimeInSeconds;
	lastObservedAudioCtxTimeInSeconds;
	callbacks = /* @__PURE__ */ new Set();
	workerBlobUrl = null;
	onOvertime;
	constructor(e, t = {}) {
		this.audioContext = e;
		let n = t.tickIntervalMs ?? Ga;
		this.lookaheadTimeInSeconds = (t.lookaheadMs ?? Ka) / 1e3, this.onOvertime = t.onOvertime, console.assert(this.lookaheadTimeInSeconds * 1e3 > n);
		try {
			let e = new Blob([`
            // the initial timeout time
            let timerId;
            let intervalTimeInMs = ${n};
            self.onmessage = function(msg) {
                switch (msg.data.command) {
                    case "start": timerId = this.setInterval(onTick, intervalTimeInMs); break;
                    case "stop": this.clearInterval(timerId); break;
                }
            };
            function onTick() {
                postMessage("tick");
            }`], { type: "text/javascript" });
			this.workerBlobUrl = URL.createObjectURL(e), this.stableTickWorker = new Worker(this.workerBlobUrl), this.stableTickWorker.onmessage = this.onTick.bind(this), this.stableTickWorker.onerror = () => this.fallBack(n), this.stableTickWorker.postMessage({ command: "start" });
		} catch {
			this.fallBack(n);
		}
		this.lastObservedAudioCtxTimeInSeconds = this.audioContext.currentTime;
	}
	fallBack(e) {
		this.fallbackTimer === null && (this.stableTickWorker?.terminate(), this.stableTickWorker = null, this.workerBlobUrl && URL.revokeObjectURL(this.workerBlobUrl), this.workerBlobUrl = null, this.fallbackTimer = setInterval(this.onTick.bind(this), e));
	}
	addListener(e) {
		this.callbacks.add(e);
	}
	removeListener(e) {
		this.callbacks.delete(e);
	}
	onTick() {
		if (this.audioContext.state === "running") {
			let e = this.audioContext.currentTime, t = e - this.lastObservedAudioCtxTimeInSeconds;
			this.lastObservedAudioCtxTimeInSeconds = e, t > this.lookaheadTimeInSeconds && this.onOvertime?.(t - this.lookaheadTimeInSeconds), this.callbacks.forEach((e) => {
				e(this.lookaheadTimeInSeconds);
			});
		}
	}
	cleanup() {
		this.stableTickWorker?.postMessage({ command: "stop" }), this.stableTickWorker?.terminate(), this.fallbackTimer !== null && clearInterval(this.fallbackTimer), this.callbacks.clear(), this.workerBlobUrl && URL.revokeObjectURL(this.workerBlobUrl);
	}
}, Ja = .001;
function Ya(e) {
	let t = [{
		time: -Infinity,
		bpm: Math.max(Ja, e),
		curve: "set"
	}], n = (e) => {
		let n = 0, r = t.length - 1;
		for (; n < r;) {
			let i = n + r + 1 >> 1;
			t[i].time <= e ? n = i : r = i - 1;
		}
		return n;
	}, r = (e) => {
		let n = t[e + 1];
		return n && n.curve !== "set" && n.time > t[e].time ? n : null;
	}, i = (e, n) => {
		let i = t[e], a = r(e);
		if (!a || n <= i.time) return i.bpm;
		if (n >= a.time) return a.bpm;
		let o = (n - i.time) / (a.time - i.time);
		return a.curve === "linear" ? i.bpm + (a.bpm - i.bpm) * o : i.bpm * (a.bpm / i.bpm) ** o;
	}, a = (e, n, i) => {
		if (i <= n) return 0;
		let a = t[e], o = r(e);
		if (!o) return a.bpm * (i - n) / 60;
		let s = o.time - a.time, c = n - a.time, l = i - a.time;
		if (o.curve === "linear") {
			let e = (o.bpm - a.bpm) / s;
			return (a.bpm * (l - c) + e * (l * l - c * c) / 2) / 60;
		}
		let u = Math.log(o.bpm / a.bpm) / s;
		return Math.abs(u * s) < 1e-12 ? a.bpm * (i - n) / 60 : a.bpm * (Math.exp(u * l) - Math.exp(u * c)) / u / 60;
	}, o = (e, n, a) => {
		let o = t[e], s = r(e), c = a * 60, l = i(e, n);
		if (!s) return c / l;
		let u = s.time - o.time;
		if (s.curve === "linear") {
			let e = (s.bpm - o.bpm) / u;
			return 2 * c / (l + Math.sqrt(Math.max(0, l * l + 2 * e * c)));
		}
		let d = Math.log(s.bpm / o.bpm) / u;
		return Math.abs(d * u) < 1e-12 ? c / l : Math.log(Math.max(Number.MIN_VALUE, 1 + d * c / l)) / d;
	}, s = (e) => i(n(e), e), c = (e) => {
		let r = n(e), a = t[r + 1];
		if (!a) return;
		let o = i(r, e);
		t.length = r + 1, a.curve !== "set" && e > t[r].time && t.push({
			time: e,
			bpm: o,
			curve: a.curve
		});
	}, l = (e, n) => {
		c(n), t.push({
			time: n,
			bpm: Math.max(Ja, e),
			curve: "set"
		});
	};
	return {
		valueAt: s,
		holdAt: c,
		set: l,
		ramp(e, n, r, i) {
			if (!(r > 0)) return l(e, n);
			c(n), t.push({
				time: n,
				bpm: s(n),
				curve: "set"
			}), t.push({
				time: n + r,
				bpm: Math.max(Ja, e),
				curve: i
			});
		},
		beatsBetween(e, r) {
			if (!(r > e)) return 0;
			let i = 0, o = e;
			for (let s = n(e); o < r; s++) {
				let e = Math.min(r, t[s + 1]?.time ?? Infinity);
				i += a(s, o, e), o = Math.max(o, e);
			}
			return i;
		},
		timeAfterBeats(e, r) {
			if (!(r > 0)) return e;
			let i = r, s = e;
			for (let r = n(e);; r++) {
				let e = t[r + 1]?.time ?? Infinity;
				if (e > s) {
					let t = e === Infinity ? Infinity : a(r, s, e);
					if (t >= i) return Math.min(e, s + o(r, s, i));
					i -= t, s = e;
				}
			}
		},
		prune(e) {
			let r = n(e);
			r !== 0 && (t.splice(0, r), t[0] = {
				...t[0],
				curve: "set"
			});
		}
	};
}
//#endregion
//#region src/playback/transport/clock-transport.ts
var Xa = .1, Za = 25, Qa = 120, $a = 2, eo = 1e5;
function to(e, t = {}) {
	let n = t.lookahead ?? Xa, r = t.pulse ?? new qa(e, {
		lookaheadMs: n * 1e3,
		tickIntervalMs: t.tickIntervalMs ?? Za,
		onOvertime: t.onOvertime
	}), i = t.pulse === void 0, a = (e, n) => {
		try {
			t.onError ? t.onError(e, n) : console.error(e, n);
		} catch {}
	}, o = Ya(Qa), s = null, c = 0, l = null, u = null, d = 0, f = !1, p = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ new Map(), h = [], g = !1, _ = 1, v = /* @__PURE__ */ new Set(), y = /* @__PURE__ */ new Map(), b = () => e.currentTime, x = () => e.currentTime + n, S = () => u ?? Math.max(b(), d), C = (e) => {
		g &&= (h = [...m.keys()].sort((e, t) => e - t), !1);
		let t = 0, n = h.length;
		for (; t < n;) {
			let r = t + n >> 1;
			h[r] < e ? t = r + 1 : n = r;
		}
		return h[t] ?? Infinity;
	}, w = (e, t) => {
		let n = e.anchors.at(-1);
		return o.timeAfterBeats(n.time, (t - n.tick) / 960);
	}, T = (e) => {
		try {
			e();
		} catch (e) {
			a("A scheduled callback failed.", e);
		}
	}, E = (e, t, n, r) => {
		u = n;
		try {
			for (let [i, a] of e) if (t(i) && (T(() => a(n)), c !== r)) return;
		} finally {
			u = null;
		}
	}, D = (e) => {
		for (let t = 0; s && t < eo; t++) {
			let t = s, n = c, r = Math.min(e, t.stopTime);
			if (t.cursorTime >= r) return;
			let i = C(t.cursorTick), a = l ? Math.max(l.end, t.cursorTick) : Infinity;
			if (l && a <= i) {
				let e = w(t, a);
				if (e >= r) return;
				t.anchors.push({
					time: e,
					tick: l.start
				}), t.cursorTick = l.start, t.cursorTime = e, E([...v].map((e) => [e, e]), (e) => v.has(e), e, n);
				continue;
			}
			if (i === Infinity) return;
			let o = w(t, i);
			if (o >= r) return;
			t.cursorTick = i + 1, t.cursorTime = o;
			let u = m.get(i);
			u && E([...u], (e) => m.get(i)?.has(e) === !0, o, n);
		}
		s && a("The music clock cut a pass short; the rest plays on the next one.", /* @__PURE__ */ Error(`over ${eo} steps`));
	}, O = () => {
		let e = b(), t = [...y].filter(([, t]) => t.due <= e).sort((e, t) => e[1].due - t[1].due);
		for (let [n, r] of t) y.get(n) === r && (r.every === null ? y.delete(n) : r.due = e + r.every, T(r.fn));
	}, k = () => {
		let e = b() - $a;
		if (s) {
			let t = s.anchors.at(-1);
			t.time < e && e < s.cursorTime && e < s.stopTime && s.anchors.push({
				time: e,
				tick: t.tick + o.beatsBetween(t.time, e) * 960
			});
			let n = s.anchors.findLastIndex((t) => t.time <= e);
			n > 0 && s.anchors.splice(0, n);
		}
		o.prune(Math.min(e, s?.anchors[0]?.time ?? e));
	}, A = () => {
		if (f) return;
		O();
		let e = x();
		D(e), d = Math.max(d, e), k();
	};
	r.addListener(A);
	let j = (e, t) => {
		let n = _++;
		p.set(n, {
			tick: e,
			fn: t
		});
		let r = m.get(e);
		return r || (m.set(e, r = /* @__PURE__ */ new Map()), g = !0), r.set(n, t), n;
	}, M = (e, t, n) => {
		let r = _++;
		return y.set(r, {
			due: b() + Math.max(0, t),
			fn: e,
			every: n
		}), r;
	};
	return {
		ppq: 960,
		immediate: b,
		now: x,
		isRunning: () => s !== null && s.startTime <= x() && x() < s.stopTime,
		start(e, t) {
			c++, s = {
				startTime: e,
				startTick: t,
				stopTime: Infinity,
				anchors: [{
					time: e,
					tick: t
				}],
				cursorTick: t,
				cursorTime: e
			};
		},
		stop(e) {
			c++, s && (s.stopTime = Math.min(s.stopTime, e));
		},
		relocate(e, t) {
			if (c++, !s) {
				s = {
					startTime: e,
					startTick: t,
					stopTime: Infinity,
					anchors: [{
						time: e,
						tick: t
					}],
					cursorTick: t,
					cursorTime: e
				};
				return;
			}
			s.anchors = s.anchors.filter((t) => t.time < e), s.anchors.push({
				time: e,
				tick: t
			}), s.cursorTick = t, s.cursorTime = e, s.stopTime = Infinity;
		},
		ticksAt(e) {
			if (!s) return 0;
			if (e < s.startTime) return s.startTick;
			let t = Math.min(e, s.stopTime), n = s.anchors, r = Math.max(0, n.findLastIndex((e) => e.time <= t)), i = n[r], a = i.tick + o.beatsBetween(i.time, t) * 960;
			return l && r === n.length - 1 && i.tick < l.end && a >= l.end && (a = l.start + (a - l.end) % (l.end - l.start)), Math.max(0, a);
		},
		tempo: () => o.valueAt(S()),
		setTempo(e) {
			Number.isFinite(e) && e > 0 && o.set(e, S());
		},
		setTempoAt(e, t) {
			Number.isFinite(e) && e > 0 && o.set(e, Math.max(Number.isFinite(t) ? t : 0, S()));
		},
		rampTempo(e, t, n, r = "exponential") {
			!Number.isFinite(e) || e <= 0 || o.ramp(e, Math.max(n, S()), Number.isFinite(t) ? t : 0, r);
		},
		cancelTempo(e) {
			o.holdAt(Math.max(e, S()));
		},
		setTimeSignature() {},
		setLoop(e) {
			let t = e ? Math.max(0, Math.round(e.startTick)) : 0, n = e ? Math.round(e.endTick) : 0;
			l = e && n > t ? {
				start: t,
				end: n
			} : null;
		},
		onLoop(e) {
			return v.add(e), () => void v.delete(e);
		},
		scheduleTick: j,
		clearTick(e) {
			let t = p.get(e);
			if (!t) return;
			p.delete(e);
			let n = m.get(t.tick);
			n?.delete(e), n?.size === 0 && (m.delete(t.tick), g = !0);
		},
		setTimeout: (e, t) => M(e, t, null),
		clearTimeout: (e) => void y.delete(e),
		setInterval: (e, t) => M(e, t, Math.max(0, t)),
		clearInterval: (e) => void y.delete(e),
		dispose() {
			f || (f = !0, r.removeListener(A), i && r.cleanup(), s = null, p.clear(), m.clear(), h = [], v.clear(), y.clear());
		}
	};
}
function no(e) {
	return e.some((e) => e.solo);
}
function ro(e, t) {
	return e.mute ? !1 : !t || e.solo;
}
function io(e) {
	return e === -Infinity ? 0 : Number.isFinite(e) ? 10 ** (Math.min(e, 12) / 20) : 1;
}
var ao = -.3, oo = -1.5, so = .001, co = .1;
10 ** (ao / 20) - 10 ** (oo / 20);
function lo(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(1, Math.max(-1, e)) : 0;
}
function uo(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(1, Math.max(0, e)) : 0;
}
function fo(e) {
	let t = no(e), n = /* @__PURE__ */ new Map();
	for (let r of e) n.set(r.id, ro(r, t) ? io(r.volume) : 0);
	return n;
}
function po(e) {
	return e.mute ? 0 : io(Number.isFinite(e.returnDb) ? Math.min(6, Math.max(-60, e.returnDb)) : 0);
}
function mo(e, t) {
	let n = typeof e.division == "string" ? e.division : "8n.";
	return Math.min(8, Xi(n, t));
}
//#endregion
//#region src/playback/engine/param-timeline.ts
var ho = 1e-6, go = 1e-7, _o = (e, t) => Math.abs(e - t) < ho;
function vo(e) {
	let t = e.initial, n = [], r = (e) => {
		let t = 0, r = n.length - 1, i = -1;
		for (; t <= r;) {
			let a = t + r >> 1;
			n[a].time <= e || _o(n[a].time, e) ? (i = a, t = a + 1) : r = a - 1;
		}
		return i;
	}, i = (e) => {
		n.splice(r(e.time) + 1, 0, e);
	}, a = (e) => {
		if (n.length > 1) {
			let t = r(e);
			if (t < 0) {
				n = [];
				return;
			}
			if (_o(n[t].time, e)) {
				for (; t > 0 && _o(n[t - 1].time, e);) t--;
				n = n.slice(0, t);
			} else n = n.slice(0, t + 1);
		} else n.length === 1 && n[0].time + ho >= e && (n = []);
	}, o = (e) => {
		let i = Math.max(e, 0), a = r(i), o = a >= 0 ? n[a] : null, s = n[a + 1] ?? null;
		if (!o) return t;
		let c = () => a > 0 ? n[a - 1].value : t;
		if (o.kind === "target" && (s === null || s.kind === "set")) return o.value + (c() - o.value) * Math.exp(-(i - o.time) / o.constant);
		if (s === null) return o.value;
		if (s.kind === "linear" || s.kind === "exponential") {
			let e = o.kind === "target" ? c() : o.value, t = (i - o.time) / (s.time - o.time);
			return s.kind === "linear" ? e + (s.value - e) * t : e * (s.value / e) ** t;
		}
		return o.value;
	}, s = (e, t) => i({
		kind: "set",
		time: t,
		value: e
	}), c = (e, t) => i({
		kind: "linear",
		time: t,
		value: e
	}), l = (e, t) => i({
		kind: "exponential",
		time: t,
		value: _o(e, 0) ? go : e
	}), u = (e) => {
		let t = o(e), i = r(e), u = i >= 0 ? n[i] : null, d = n[i + 1] ?? null;
		u && _o(u.time, e) ? a(d ? d.time : e + ho) : d && (a(d.time), d.kind === "linear" ? c(t, e) : d.kind === "exponential" && l(t, e)), s(t, e);
	}, d = (e) => {
		let t = o(e);
		u(e), t === 0 && (t = go), s(t, e);
	}, f = (e, t, n) => {
		let r = Math.log(n + 1) / Math.log(200);
		i({
			kind: "target",
			time: t,
			value: e,
			constant: r
		}), u(t + n * .9), c(e, t + n);
	}, p = (e, t, n) => {
		d(n), c(e, n + t);
	}, m = (e, t, n) => {
		d(n), l(e, n + t);
	};
	return {
		valueAt: o,
		eventsFrom: (e) => n.slice(Math.max(0, r(e))),
		setAt: s,
		linearTo: c,
		exponentialTo: l,
		targetAt: (e, t, n) => i({
			kind: "target",
			time: t,
			value: e,
			constant: n
		}),
		cancelFrom: a,
		holdAt: u,
		rampPoint: d,
		linearRampTo: p,
		exponentialRampTo: m,
		rampTo: (t, n, r) => e.rampCurve === "exponential" ? m(t, n, r) : p(t, n, r),
		targetRampTo(e, t, n) {
			d(n), f(e, n, t);
		},
		approach: f,
		prune(e) {
			let t = r(e), i = Math.max(0, t - 1);
			i > 0 && (n = n.slice(i));
		}
	};
}
//#endregion
//#region src/playback/engine/elementary/lanes.ts
var yo = .05, bo = 256;
function xo(e, t, n) {
	let r = e[t];
	return r.kind === "target" ? t > 0 ? e[t - 1].value : n : r.value;
}
function So(e, t, n, r) {
	let i = e[t], a = e[t + 1];
	if (i.kind === "target" && (!a || a.kind === "set")) return [{
		start: i.time,
		from: i.value,
		to: i.value,
		end: null,
		pole: Math.exp(-1 / (i.constant * r))
	}];
	if (a?.kind === "linear") return [{
		start: i.time,
		from: xo(e, t, n),
		to: a.value,
		end: a.time,
		pole: 0
	}];
	if (a?.kind === "exponential") {
		let o = xo(e, t, n), s = a.time - i.time, c = Math.abs(Math.log(a.value / o)), l = Number.isFinite(c) ? Math.ceil(c / yo) : 16, u = Math.max(1, Math.min(bo, l, Math.floor(s * r)));
		return Array.from({ length: u }, (e, t) => {
			let n = t / u, r = (t + 1) / u;
			return {
				start: i.time + n * s,
				from: o * (a.value / o) ** n,
				to: o * (a.value / o) ** r,
				end: i.time + r * s,
				pole: 0
			};
		});
	}
	return [{
		start: i.time,
		from: i.value,
		to: i.value,
		end: null,
		pole: 0
	}];
}
function Co(e, t) {
	if (e.end === null || e.end <= e.start) return {
		target: e.from,
		pole: e.pole
	};
	let n = Math.min(1, Math.max(0, (t - e.start) / (e.end - e.start)));
	return {
		target: e.from + (e.to - e.from) * n,
		pole: e.pole
	};
}
function wo(e, t, n) {
	let r = e.at(-1);
	if (r && r.time >= t) {
		r.time === t && (r.value = n);
		return;
	}
	e.push({
		time: t,
		value: n
	});
}
function To(e, t, n, r = 0) {
	let i = e.eventsFrom(t), a = [];
	(i.length === 0 || i[0].time > t) && a.push({
		start: t,
		from: r,
		to: r,
		end: null,
		pole: 0
	});
	for (let e = 0; e < i.length; e++) a.push(...So(i, e, r, n));
	let o = (e) => Math.round(e * n), s = [], c = [], l = a.findLastIndex((e) => e.start <= t), u = Co(a[Math.max(0, l)], t), d = o(t);
	wo(s, d, u.target), wo(c, d, u.pole);
	let f = u;
	for (let e of a.slice(Math.max(0, l))) {
		let n = Math.max(e.start, t), r = Co(e, n), i = o(n);
		if (r.target !== f.target) {
			let e = s.at(-1);
			e.time < i - 1 && wo(s, i - 1, f.target), wo(s, e.time >= i ? e.time + 1 : i, r.target);
		} else e.end !== null && e.end > n && wo(s, i, r.target);
		r.pole !== f.pole && wo(c, i, r.pole), f = r, e.end !== null && e.end > n && (wo(s, o(e.end), e.to), f = {
			target: e.to,
			pole: e.pole
		});
	}
	return {
		target: s,
		pole: c
	};
}
//#endregion
//#region src/playback/engine/elementary/graph.ts
var Eo = [];
function q(e, t) {
	let n = {
		dirty: !0,
		parents: /* @__PURE__ */ new Set(),
		children: /* @__PURE__ */ new Set()
	}, r, i = (e) => {
		if (!e.dirty) {
			e.dirty = !0;
			for (let t of e.parents) i(t);
		}
	};
	return {
		get() {
			let e = Eo.at(-1);
			if (e && (n.parents.add(e), e.children.add(n)), n.dirty || r === void 0) {
				for (let e of n.children) e.parents.delete(n);
				n.children.clear(), Eo.push(n);
				try {
					r = t();
				} finally {
					Eo.pop();
				}
				n.dirty = !1;
			}
			return r;
		},
		invalidate() {
			i(n), e.requestRender();
		}
	};
}
function J(e, t) {
	return W.const({
		key: e,
		value: Number.isFinite(t) ? t : 0
	});
}
function Do(e) {
	return e.length === 0 ? W.const({ value: 0 }) : e.length === 1 ? e[0] : W.add(...e);
}
function Oo(e) {
	return [Do(e.map((e) => e[0])), Do(e.map((e) => e[1]))];
}
var ko = .25, Ao = 2, jo = (e, t, n, r) => W.sparseq2({
	key: e,
	seq: t,
	...r ? { interpolate: 1 } : {}
}, n);
function Y(e, t, n, r, i = "linear") {
	return Mo(e, t, n, vo({
		initial: r,
		rampCurve: i
	}), r);
}
function Mo(e, t, n, r, i) {
	let a = e.lead ? W.add(W.time(), e.lead) : W.time(), o = q(e, () => {
		let o = e.immediate() - ko;
		r.prune(e.immediate() - Ao);
		let s = To(r, o, e.sampleRate, i), c = jo(`${t}:target`, s.target, a, !0);
		return n === "line" ? c : W.smooth(jo(`${t}:pole`, s.pole, a, !1), c);
	});
	return {
		timeline: r,
		get: o.get,
		invalidate: o.invalidate,
		changed: o.invalidate
	};
}
function No([e, t], n) {
	let r = W.max(0, W.mul(-1, n)), i = W.max(0, n), a = Math.PI / 2;
	return [W.add(W.mul(e, W.cos(W.mul(a, i))), W.mul(t, W.sin(W.mul(a, r)))), W.add(W.mul(t, W.cos(W.mul(a, r))), W.mul(e, W.sin(W.mul(a, i))))];
}
function Po([e, t], n, r) {
	if (n === 0) return [e, t];
	let i = Math.PI / 2, a = i * Math.max(0, -1 * n), o = i * Math.max(0, n), s = (e, t) => J(`${r}:${e}`, t);
	return [W.add(W.mul(e, s("ll", Math.cos(o))), W.mul(t, s("rl", Math.sin(a)))), W.add(W.mul(t, s("rr", Math.cos(a))), W.mul(e, s("lr", Math.sin(o))))];
}
function Fo([e, t], n) {
	return [W.mul(e, n), W.mul(t, n)];
}
//#endregion
//#region src/playback/engine/elementary/buses.ts
var Io = .02, Lo = .05, Ro = 128, zo = .00125, Bo = 44100, Vo = 125e-6, Ho = .001, Uo = (e, t) => typeof e == "number" && Number.isFinite(e) ? e : t;
function Wo(e) {
	let t = e >>> 0;
	return () => {
		t = t + 1831565813 >>> 0;
		let e = t;
		return e = Math.imul(e ^ e >>> 15, e | 1), e ^= e + Math.imul(e ^ e >>> 7, e | 61), ((e ^ e >>> 14) >>> 0) / 4294967296;
	};
}
function Go(e, t, n, r = Math.random) {
	let i = Math.max(1, Math.floor((e + t) * n)), a = vo({ initial: 1 });
	a.setAt(0, 0), a.setAt(1, t), a.approach(0, t, e);
	let o = new Float32Array(i), s = new Float32Array(i), c = () => r() * 2 - 1, l = 0, u = 1;
	for (let e = 0; e < i; e++) {
		let t = a.valueAt(e / n);
		t >= Ho && (u = e + 1), o[e] = t * (c() + c()) / 2, s[e] = t * (c() + c()) / 2, l += o[e] * o[e] + s[e] * s[e];
	}
	let d = Math.max(Vo, Math.sqrt(l / (2 * i))), f = Bo / n * zo / d;
	for (let e = 0; e < u; e++) o[e] *= f, s[e] *= f;
	return [o.slice(0, u), s.slice(0, u)];
}
function Ko(e, t, n, r, i, a) {
	let o = e.nextId(), s = e.nextSeed(), c = e.sampleRate, l = t.type, u = ya(l, t.params), d = n, f = t.name, p = po(t), m = 0, h = 0, g = null, _ = !1, v = !1, y = null, b = !1, x = () => [W.const({ value: 0 }), W.const({ value: 0 })], S = (e) => {
		if (_ = !0, !v) {
			v = !0;
			try {
				i(`The ${ma[l]} bus “${f}” could not be built, so its send is silent.`, e);
			} catch {}
		}
	}, C = ([e, t]) => {
		if (!g) return x();
		let n = (e, t) => {
			let n = `${g}:${t}`, r = W.table({
				key: `${n}:hold`,
				path: n
			}, W.const({
				key: `${n}:hold:at`,
				value: 0
			}));
			return W.add(W.convolve({
				key: n,
				path: n
			}, e), W.mul(0, r));
		};
		return [n(e, "l"), n(t, "r")];
	}, w = ([e, t]) => {
		let n = Math.ceil(8 * c) + 2, r = J(`${o}:delay:len`, mo(u, d) * c), i = J(`${o}:delay:fb`, Math.min(1, Math.max(0, Uo(u.feedback, 0))));
		return [W.delay({
			key: `${o}.${m}:delay:l`,
			size: n
		}, r, i, e), W.delay({
			key: `${o}.${m}:delay:r`,
			size: n
		}, r, i, t)];
	}, T = ([e, t]) => {
		let n = Math.ceil(Lo * c) + 2, r = Uo(u.delayTime, 3.5) / 1e3, i = r * Uo(u.depth, .7), a = Math.max(r - i, 0), s = r + i, l = Uo(u.spread, 180), d = J(`${o}:chorus:low`, a * c), f = J(`${o}:chorus:half`, (s - a) * c / 2), p = W.mul(2 * Math.PI, W.phasor(J(`${o}:chorus:hz`, Uo(u.frequency, 1.5)))), h = (e, t, r) => {
			let i = W.add(1, W.sin(W.sub(p, J(`${o}:chorus:phase:${t}`, r * Math.PI / 180))));
			return W.delay({
				key: `${o}.${m}:chorus:${t}`,
				size: n
			}, W.max(Ro, W.add(d, W.mul(f, i))), 0, e);
		};
		return [h(e, "l", 90 - l / 2), h(t, "r", 90 + l / 2)];
	}, E = q(e, () => {
		let e = r.get();
		if (_) return x();
		try {
			return l === "reverb" ? C(e) : l === "delay" ? w(e) : T(e);
		} catch (e) {
			return S(e), x();
		}
	}), D = Y(e, `${o}:return`, "line", p), O = q(e, () => Fo(E.get(), D.get())), k = () => {
		let t = Uo(u.decay, 2.5), n = Uo(u.preDelay, .02), r = `${o}:reverb:${++h}:${t}:${n}:${c}`;
		g = null, _ = !1;
		try {
			let [i, a] = Go(t, n, c, Wo(s * 7919 + h));
			if (!e.loadFiles({
				[`${r}:l`]: i,
				[`${r}:r`]: a
			}, (e) => {
				b || g !== r || (g = null, S(e), E.invalidate());
			})) throw Error("This renderer has no file system for the reverb’s impulse.");
			g = r;
		} catch (e) {
			S(e);
		}
		E.invalidate();
	}, A = () => {
		y?.(), y = null;
	};
	return l === "reverb" && k(), {
		channel: {
			id: t.id,
			update(t) {
				if (b) return;
				f = t.name;
				let n = ya(t.type, t.params);
				t.type === l ? _a(l).some((e) => n[e.path] !== u[e.path]) && (u = n, l === "reverb" ? (A(), y = e.setTimer(() => {
					y = null, !b && l === "reverb" && k();
				}, 250 / 1e3)) : (_ = !1, E.invalidate())) : (A(), l = t.type, u = n, m++, g = null, _ = !1, l === "reverb" ? k() : E.invalidate());
				let r = po(t);
				r !== p && (p = r, D.timeline.rampTo(r, Io, e.immediate()), D.changed());
			},
			setTempo(e) {
				b || !Number.isFinite(e) || e <= 0 || e === d || (d = e, l === "delay" && E.invalidate());
			},
			readPeak: () => null,
			dispose() {
				b || (b = !0, A(), a());
			}
		},
		output: O
	};
}
//#endregion
//#region src/engine/allocator.ts
var qo = class {
	owner = [];
	stamp = [];
	held = /* @__PURE__ */ new Map();
	clock = 0;
	constructor(e) {
		this.reset(e);
	}
	get size() {
		return this.owner.length;
	}
	get heldCount() {
		return this.held.size;
	}
	reset(e = this.owner.length) {
		let t = Math.max(1, Math.floor(e) || 1);
		this.owner = Array(t).fill(null), this.stamp = Array(t).fill(0), this.held.clear(), this.clock = 0;
	}
	noteOn(e, t) {
		let n = ++this.clock, r = this.held.get(e);
		if (r !== void 0) return this.stamp[r] = n, {
			voice: r,
			stolen: null
		};
		let i = -1, a = 0;
		for (let e = 0; e < this.owner.length; e++) {
			if (this.owner[e] !== null) continue;
			let n = t ? t(e) : 0;
			(i < 0 || n < a || n === a && this.stamp[e] < this.stamp[i]) && (i = e, a = n);
		}
		let o = null;
		if (i < 0) {
			i = 0;
			for (let e = 1; e < this.owner.length; e++) this.stamp[e] < this.stamp[i] && (i = e);
			o = this.owner[i], o !== null && this.held.delete(o);
		}
		return this.owner[i] = e, this.stamp[i] = n, this.held.set(e, i), {
			voice: i,
			stolen: o
		};
	}
	noteOff(e) {
		let t = this.held.get(e);
		return t === void 0 ? null : (this.held.delete(e), this.owner[t] = null, this.stamp[t] = ++this.clock, t);
	}
	isFree(e) {
		return this.owner[e] === null;
	}
	voiceOf(e) {
		return this.held.get(e) ?? null;
	}
	heldNotes() {
		return [...this.held.keys()];
	}
	releaseAll() {
		let e = [...this.held.values()];
		for (let e of [...this.held.keys()]) this.noteOff(e);
		return e;
	}
};
Array.from({ length: 40 }, (e, t) => 1 / (t + 1) ** 1.6);
function Jo(e) {
	return !!e?.kit && Array.isArray(e.kit.pads);
}
function Yo(e) {
	return e.layers.slice(0, Jo(e) ? 48 : 3);
}
function Xo(e, t) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(127, Math.max(0, Math.round(e))) : t;
}
function Zo(e, t, n, r = () => !0) {
	let i = typeof e == "object" && e && !Array.isArray(e) ? e : {}, a = Xo(Object.hasOwn(i, "note") ? i.note : void 0, t), o = Object.hasOwn(i, "name") ? i.name : void 0, s = typeof o == "string" && o.replace(/[\u0000-\u001f\u007f]/g, " ").trim() ? o.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 24) : as(a), c = Object.hasOwn(i, "layers") ? i.layers : void 0, l = Array.isArray(c) ? [...new Set(c.filter((e) => typeof e == "number" && Number.isInteger(e) && e >= 0 && r(e)))].slice(0, 3) : [n].filter(r), u = {
		name: s,
		note: a,
		pitch: Xo(Object.hasOwn(i, "pitch") ? i.pitch : void 0, a),
		layers: l
	}, d = Object.hasOwn(i, "choke") ? i.choke : void 0;
	return typeof d == "number" && Number.isInteger(d) && d >= 1 && d <= 8 && (u.choke = d), u;
}
function Qo(e, t) {
	if (!Array.isArray(e)) return null;
	let n = Math.min(t.length, 48), r = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set(), a = [];
	for (let t = 0; t < Math.min(e.length, 16); t++) {
		let o = Zo(e[t], 36 + t, t, (e) => e < n && !r.has(e));
		if (o.layers.length !== 0) {
			for (let e of o.layers) r.add(e);
			i.has(o.note) && (o.note = es(o.note, i)), i.add(o.note), a.push(o);
		}
	}
	if (a.length === 0) return null;
	let o = [...r].sort((e, t) => e - t), s = new Map(o.map((e, t) => [e, t]));
	for (let e of a) e.layers = e.layers.map((e) => s.get(e));
	return {
		kit: { pads: a },
		layers: o.map((e) => t[e]),
		moved: s
	};
}
function $o(e, t) {
	let n = e.map((e, n) => (Array.isArray(e.layers) ? e.layers : [n]).filter((e) => Number.isInteger(e) && e >= 0 && e < t)), r = /* @__PURE__ */ new Map(), i = Array.from({ length: t }, () => !1);
	e.forEach((e, t) => {
		if (n[t].length > 0 && !r.has(e.note) && r.set(e.note, t), e.choke) for (let e of n[t]) i[e] = !0;
	});
	let a = e.flatMap((e, t) => n[t].length > 0 ? [{
		pad: e,
		i: t
	}] : []), o = a.map((e) => e.pad);
	for (let e = 0; e < 128; e++) {
		if (r.has(e)) continue;
		let t = os(o, e);
		t !== null && r.set(e, a[t].i);
	}
	return {
		padByNote: r,
		padLayers: n,
		chokes: e.map((t, n) => t.choke ? e.flatMap((e, r) => r !== n && e.choke === t.choke ? [r] : []) : []),
		chokeable: i
	};
}
function es(e, t) {
	for (let n = 0; n < 128; n++) {
		if (e + n <= 127 && !t.has(e + n)) return e + n;
		if (e - n >= 0 && !t.has(e - n)) return e - n;
	}
	return e;
}
var ts = {
	35: "kick",
	36: "kick",
	37: "snare",
	38: "snare",
	39: "snare",
	40: "snare",
	41: "tom",
	42: "closed-hat",
	43: "tom",
	44: "closed-hat",
	45: "tom",
	46: "open-hat",
	47: "tom",
	48: "tom",
	49: "cymbal",
	50: "tom",
	51: "cymbal",
	52: "cymbal",
	53: "cymbal",
	55: "cymbal",
	57: "cymbal",
	59: "cymbal"
}, ns = 39;
function rs(e) {
	return ts[e] ?? "perc";
}
var is = {
	27: "High Q",
	28: "Slap",
	29: "Scratch Push",
	30: "Scratch Pull",
	31: "Sticks",
	32: "Square Click",
	33: "Metronome Click",
	34: "Metronome Bell",
	35: "Kick 2",
	36: "Kick",
	37: "Side Stick",
	38: "Snare",
	39: "Clap",
	40: "Snare 2",
	41: "Floor Tom",
	42: "Closed Hat",
	43: "Low Tom",
	44: "Pedal Hat",
	45: "Mid Tom",
	46: "Open Hat",
	47: "Low-Mid Tom",
	48: "Hi-Mid Tom",
	49: "Crash",
	50: "High Tom",
	51: "Ride",
	52: "China",
	53: "Ride Bell",
	54: "Tambourine",
	55: "Splash",
	56: "Cowbell",
	57: "Crash 2",
	58: "Vibraslap",
	59: "Ride 2",
	60: "High Bongo",
	61: "Low Bongo",
	62: "Mute High Conga",
	63: "Open High Conga",
	64: "Low Conga",
	65: "High Timbale",
	66: "Low Timbale",
	67: "High Agogo",
	68: "Low Agogo",
	69: "Cabasa",
	70: "Maracas",
	71: "Short Whistle",
	72: "Long Whistle",
	73: "Short Guiro",
	74: "Long Guiro",
	75: "Claves",
	76: "High Wood Block",
	77: "Low Wood Block",
	78: "Mute Cuica",
	79: "Open Cuica",
	80: "Mute Triangle",
	81: "Open Triangle",
	82: "Shaker",
	83: "Jingle Bell",
	84: "Bell Tree",
	85: "Castanets",
	86: "Mute Surdo",
	87: "Open Surdo"
};
function as(e) {
	return is[e] ?? `Pad ${e}`;
}
function os(e, t) {
	if (e.length === 0) return null;
	let n = e.findIndex((e) => e.note === t);
	if (n >= 0) return n;
	let r = rs(t), i = (e) => e === ns ? "clap" : rs(e), a = (n) => {
		let r = null;
		return e.forEach((i, a) => {
			n(i) && (r === null || Math.abs(i.note - t) < Math.abs(e[r].note - t)) && (r = a);
		}), r;
	};
	return a((e) => i(e.note) === i(t)) ?? a((e) => rs(e.note) === r) ?? a(() => !0);
}
//#endregion
//#region src/engine/note-math.ts
var ss = 440 * 2 ** (-9 / 12);
function cs(e, t, n) {
	let r = e[t];
	return typeof r == "number" && Number.isFinite(r) ? r : n;
}
function ls(e) {
	return 2 ** (Math.round(cs(e, "transpose", 0)) / 12);
}
function us(e, t, n) {
	let r = cs(e, "keyTrack", 0), i = cs(e, "velocityToFilter", 0);
	return {
		track: r === 0 || !(t > 0) ? 1 : (t / ss) ** r,
		amount: 1 - i + i * n
	};
}
function ds(e, t, n, r) {
	let i = t * 2 ** (cs(e, "detune", 0) / 1200);
	e.tuning === "exact" && r > 0 && i > 0 && (i = r / (Math.max(1, Math.round(r / i)) - .5));
	let a = cs(e, "ringTime", 0), o = cs(e, "velocity", 0);
	return {
		hz: i,
		feedback: e.stringDecay === "ring" && a > 0 && i > 0 ? 10 ** (-3 / (i * a)) : null,
		level: 1 - o + o * n
	};
}
function fs(e) {
	return 440 * 2 ** ((e - 69) / 12);
}
function ps(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(16, Math.max(1, Math.round(e))) : 1;
}
function ms(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(6, Math.max(-60, e)) : 0;
}
//#endregion
//#region src/playback/engine/elementary/lfos.ts
var hs = .84819, gs = .84854, _s = [
	"sine",
	"triangle",
	"square",
	"sawtooth"
];
function vs(e, t) {
	return e === "sine" ? W.sin(W.mul(2 * Math.PI, t)) : e === "triangle" ? W.sub(1, W.mul(4, W.abs(W.sub(W.mod(W.add(t, .25), 1), .5)))) : e === "square" ? W.sub(hs, W.mul(2 * hs, W.ge(t, .5))) : W.mul(gs, W.sub(W.mul(2, W.mod(W.add(t, .5), 1)), 1));
}
function ys(e, t, n, r = !1) {
	return r ? _s.includes(t) ? vs(t, n) : W.const({ value: 0 }) : Do(_s.map((r) => W.mul(J(`${e}:w:${r}`, +(r === t)), vs(r, n))));
}
function bs(e, t, n) {
	let r = (n / 360 % 1 + 1) % 1;
	return W.mod(W.add(t, J(e, 1 - r)), 1);
}
function xs(e, t) {
	let n = Ea(t);
	return n ? n.kind === "layer" ? n.path === "volume" : e.effects?.find((e) => e.id === n.effectId)?.type === "eq" && (n.path === "low" || n.path === "mid" || n.path === "high") : !1;
}
function Ss(e, t, n, r = 120, i = !1) {
	let a = Number.isFinite(r) && r > 0 ? r : 120, o = 0, s = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map(), l = q(e, () => null), u = () => {
		c.clear();
		for (let e of s.values()) for (let t of e.links) c.set(t.target, t);
		l.invalidate();
	}, d = (t, r, a) => {
		let o = {
			target: r,
			depth: a,
			node: q(e, () => {
				let e = n(), a = Da(e, r), s = Oa(e, r), c = t.patch.depth * o.depth, [l, u] = a && s !== null ? ka(a, s, c) : [0, 0], d = xs(e, r), f = J(`${t.key}:${r}:min`, d ? 10 ** (l / 20) : l);
				if (i && c === 0) return f;
				let p = J(`${t.key}:${r}:max`, d ? 10 ** (u / 20) : u);
				return W.add(f, W.mul(W.sub(p, f), W.mul(.5, W.add(t.wave.get(), 1))));
			})
		};
		return o;
	}, f = (n) => {
		let r = `${t}:lfo:${n.id}.${++o}`, s = {
			patch: n,
			key: r,
			links: [],
			wave: q(e, () => ys(r, s.patch.shape, W.phasor(J(`${r}:hz`, Sa(s.patch, a))), i))
		};
		return s.links = n.connections.map((e) => d(s, e.target, e.depth)), s;
	}, p = (e, t) => e.connections.length === t.connections.length && e.connections.every((e, n) => e.target === t.connections[n].target);
	return {
		set(e) {
			let t = Ia(e, n()), r = new Set(t.map((e) => e.id)), o = !1;
			for (let e of s.keys()) r.has(e) || (s.delete(e), o = !0);
			for (let e of t) {
				let t = s.get(e.id);
				if (!t || !p(t.patch, e)) {
					s.set(e.id, f(e)), o = !0;
					continue;
				}
				let n = t.patch;
				t.patch = e, (n.shape !== e.shape || Sa(n, a) !== Sa(e, a)) && t.wave.invalidate(), t.links.forEach((t, r) => {
					let a = e.connections[r].depth;
					if (a === t.depth && n.depth === e.depth) return;
					let s = n.depth * t.depth === 0 != (e.depth * a === 0);
					t.depth = a, t.node.invalidate(), i && s && (o = !0);
				});
			}
			o && u();
		},
		setTempo(e) {
			if (!(!Number.isFinite(e) || e <= 0 || e === a)) {
				a = e;
				for (let e of s.values()) e.patch.sync && e.wave.invalidate();
			}
		},
		drive(e) {
			return l.get(), c.get(e)?.node.get() ?? null;
		},
		drives: (e) => c.has(e),
		waves() {
			l.get();
			let e = (e) => !i || e.links.some((t) => e.patch.depth * t.depth !== 0);
			return [...s.values()].filter(e).map((e) => e.wave.get());
		},
		refresh(e) {
			c.get(e)?.node.invalidate();
		},
		drop(e) {
			let t = !1;
			for (let n of s.values()) n.links.some((t) => t.target.startsWith(e)) && (n.links = n.links.filter((t) => !t.target.startsWith(e)), n.patch = {
				...n.patch,
				connections: n.patch.connections.filter((t) => !t.target.startsWith(e))
			}, t = !0);
			t && u();
		}
	};
}
//#endregion
//#region src/playback/engine/elementary/effects.ts
var Cs = 128, ws = .05, Ts = .006, Es = .0025, Ds = 10 ** (1 / 20), Os = (e, t) => [t(e[0], "l"), t(e[1], "r")];
function ks(e, t, n) {
	let r = e.driven("wet"), i = r ? W.mul(Math.PI / 2, r) : null, a = e.num("wet", 1), o = i ? W.cos(i) : J(`${e.key}:dry`, Math.cos(a * Math.PI / 2)), s = i ? W.sin(i) : J(`${e.key}:wet`, Math.sin(a * Math.PI / 2));
	return [W.add(W.mul(o, t[0]), W.mul(s, n[0])), W.add(W.mul(o, t[1]), W.mul(s, n[1]))];
}
function As(e, t, n, r) {
	let i = 2 * Math.PI * Math.min(r / 2, Math.max(0, t)) / r, a = Math.sin(i), o = Math.cos(i), s = a / (2 * n), c = 1 + s, l = e === "lowpass" ? [
		(1 - o) / 2,
		1 - o,
		(1 - o) / 2
	] : e === "highpass" ? [
		(1 + o) / 2,
		-(1 + o),
		(1 + o) / 2
	] : e === "bandpass" ? [
		s,
		0,
		-s
	] : e === "notch" ? [
		1,
		-2 * o,
		1
	] : [
		1 - s,
		-2 * o,
		1 + s
	];
	return [
		l[0] / c,
		l[1] / c,
		l[2] / c,
		-2 * o / c,
		(1 - s) / c
	];
}
function js(e, t, n, r) {
	let i = W.mul(2 * Math.PI / r, W.min(r / 2, W.max(0, t))), a = W.sin(i), o = W.cos(i), s = W.div(a, W.mul(2, n)), c = W.add(1, s), l = (e) => W.div(W.add(1, W.mul(e, o)), 2);
	return [
		...e === "lowpass" ? [
			l(-1),
			W.sub(1, o),
			l(-1)
		] : e === "highpass" ? [
			l(1),
			W.mul(-1, W.add(1, o)),
			l(1)
		] : e === "bandpass" ? [
			s,
			W.const({ value: 0 }),
			W.mul(-1, s)
		] : e === "notch" ? [
			W.const({ value: 1 }),
			W.mul(-2, o),
			W.const({ value: 1 })
		] : [
			W.sub(1, s),
			W.mul(-2, o),
			W.add(1, s)
		],
		W.mul(-2, o),
		W.sub(1, s)
	].map((e) => W.div(e, c));
}
var Ms = (e, t) => t.map((t, n) => J(`${e}:c${n}`, t)), Ns = (e, t) => W.biquad(e[0], e[1], e[2], e[3], e[4], t), Ps = (e) => e === "highpass" || e === "bandpass" || e === "notch" || e === "allpass" ? e : "lowpass";
function Fs(e, t) {
	let n = Ps(e.str("type", "lowpass")), r = (e) => n === "lowpass" || n === "highpass" ? 10 ** (e / 20) : e, i = e.driven("frequency"), a = e.driven("Q"), o;
	return o = i || a ? js(n, i ?? J(`${e.key}:hz`, e.num("frequency", 1200)), a ? n === "lowpass" || n === "highpass" ? W.pow(10, W.div(a, 20)) : a : J(`${e.key}:q`, r(e.num("Q", 1))), e.sr) : Ms(e.key, As(n, e.num("frequency", 1200), r(e.num("Q", 1)), e.sr)), Os(t, (e) => Ns(o, e));
}
function Is(e, t) {
	let n = e.num("distortion", .4) * 100, r = .0012210012210012201, i = (3 + n) * r * (Math.PI / 9) / (Math.PI + n * r), a = J(`${e.key}:k`, n), o = J(`${e.key}:scale`, (3 + n) * (Math.PI / 9)), s = J(`${e.key}:ramp`, i / .0004884004884004884);
	return ks(e, t, Os(t, (e) => {
		let t = W.min(1, W.abs(e)), n = W.div(W.mul(o, t), W.add(Math.PI, W.mul(a, t))), i = W.mul(s, W.max(0, W.sub(t, .0007326007326007317))), c = W.select(W.ge(t, r), n, i);
		return W.mul(c, W.sub(W.mul(2, W.ge(e, 0)), 1));
	}));
}
function Ls(e, t) {
	let n = J(`${e.key}:step`, .5 ** (e.num("bits", 4) - 1));
	return ks(e, t, Os(t, (e) => W.mul(n, W.floor(W.add(W.div(e, n), .5)))));
}
function Rs(e, t) {
	let n = Math.ceil(ws * e.sr) + 2, r = e.num("delayTime", 3.5) / 1e3, i = r * e.num("depth", .7), a = Math.max(r - i, 0), o = r + i, s = e.num("spread", 180), c = J(`${e.key}:low`, a * e.sr), l = J(`${e.key}:half`, (o - a) * e.sr / 2), u = J(`${e.key}:fb`, e.num("feedback", 0)), d = W.phasor(e.param("frequency", 1.5));
	return ks(e, t, Os(t, (t, r) => {
		let i = W.add(1, W.sin(W.mul(2 * Math.PI, bs(`${e.key}:phase:${r}`, d, r === "l" ? 90 - s / 2 : 90 + s / 2))));
		return W.delay({
			key: `${e.key}:${r}`,
			size: n
		}, W.max(Cs, W.add(c, W.mul(l, i))), u, t);
	}));
}
function zs(e, t) {
	let n = Math.max(1, Math.round(e.num("stages", 10))), r = e.num("baseFrequency", 350), i = r * 2 ** e.num("octaves", 3), a = J(`${e.key}:low`, r), o = J(`${e.key}:half`, (i - r) / 2), s = e.param("Q", 10), c = W.phasor(e.param("frequency", .5));
	return ks(e, t, Os(t, (t, r) => {
		let i = W.add(1, W.sin(W.mul(2 * Math.PI, r === "l" ? c : bs(`${e.key}:phase`, c, 180)))), l = js("allpass", W.add(a, W.mul(o, i)), s, e.sr), u = t;
		for (let e = 0; e < n; e++) u = Ns(l, u);
		return u;
	}));
}
function Bs(e, t) {
	let n = e.num("spread", 0), r = e.str("type", "sine"), i = e.param("depth", .5), a = W.phasor(e.param("frequency", 6));
	return ks(e, t, Os(t, (t, o) => {
		let s = ys(`${e.key}:${o}`, r, bs(`${e.key}:phase:${o}`, a, o === "l" ? 90 - n / 2 : 90 + n / 2), e.lean);
		return W.mul(t, W.mul(.5, W.sub(1, W.mul(i, s))));
	}));
}
function Vs(e, t) {
	let n = e.num("lowFrequency", 400), r = e.num("highFrequency", 2500), i = (t, n, r) => Ms(`${e.key}:${n}`, As(t, r, Ds, e.sr)), [a, o, s, c] = [
		i("lowpass", "low", n),
		i("highpass", "lowmid", n),
		i("lowpass", "mid", r),
		i("highpass", "high", r)
	], l = (t) => e.driven(t) ?? J(`${e.key}:${t}`, 10 ** (e.num(t, 0) / 20)), [u, d, f] = [
		l("low"),
		l("mid"),
		l("high")
	];
	return Os(t, (e) => Do([
		W.mul(u, Ns(a, e)),
		W.mul(d, Ns(s, Ns(o, e))),
		W.mul(f, Ns(c, e))
	]));
}
function Hs(e, t, n) {
	let r = 10 ** (e / 20), i = (e, t) => e < r ? e : r + (1 - Math.exp(-t * (e - r))) / t, a = (e) => 20 * Math.log10(e), o = (e, t) => {
		if (e < r) return 1;
		let n = e * 1.001;
		return (a(i(n, t)) - a(i(e, t))) / (a(n) - a(e));
	}, s = 10 ** ((e + t) / 20), c = .1, l = 1e4, u = 5;
	for (let e = 0; e < 15; e++) o(s, u) < 1 / n ? l = u : c = u, u = Math.sqrt(c * l);
	let d = a(i(s, u));
	return {
		k: u,
		saturate: (r) => r < s ? i(r, u) : 10 ** ((d + (a(r) - e - t) / n) / 20)
	};
}
var Us = (e) => (1 / e.saturate(1)) ** .6;
function Ws(e, t) {
	let n = e.num("ratio", 4), r = e.num("knee", 30), i = e.num("threshold", -24), a = Hs(i, r, n), o = a.k * 10 ** (i / 20), s = 10 ** (r / 20), c = (e) => e < 1 ? e : 1 + (1 - Math.exp(-o * (e - 1))) / o, l = J(`${e.key}:shape`, o), u = J(`${e.key}:kneeEnd`, s), d = J(`${e.key}:knee`, r), f = J(`${e.key}:atKnee`, 20 * Math.log10(c(s))), p = J(`${e.key}:slope`, 1 / n), m = (e) => {
		let t = W.max(e, 1e-9), n = W.mul(20, W.log(t)), r = W.div(W.add(1, W.div(W.sub(1, W.exp(W.mul(-1, W.mul(l, W.max(0, W.sub(e, 1)))))), l)), t), i = W.db2gain(W.sub(W.add(f, W.mul(p, W.sub(n, d))), n));
		return W.select(W.ge(e, u), i, W.select(W.ge(e, 1), r, 1));
	}, h = e.driven("threshold"), g = h ? W.db2gain(h) : J(`${e.key}:linear`, 10 ** (i / 20)), _ = h ? W.pow(m(W.div(1, g)), -.6) : J(`${e.key}:makeup`, Us(a)), v = (t, n) => J(`${e.key}:${n}`, Math.exp(-1 / (Math.max(t, 1e-6) * e.sr))), y = W.env(0, v(Es, "hold"), W.max(W.abs(t[0]), W.abs(t[1]))), b = W.mul(-20, W.log(m(W.div(y, g)))), x = (e) => e / Math.log(40), S = W.env(v(x(e.num("attack", .003)), "attack"), v(x(e.num("release", .25)), "release"), b), C = W.mul(_, W.db2gain(W.mul(-1, S))), w = Math.round(Ts * e.sr);
	return Os(t, (t, n) => W.mul(C, W.sdelay({
		key: `${e.key}:${n}`,
		size: w
	}, t)));
}
var Gs = {
	filter: Fs,
	distortion: Is,
	bitcrusher: Ls,
	chorus: Rs,
	phaser: zs,
	tremolo: Bs,
	eq: Vs,
	compressor: Ws
};
function Ks(e, t, n, r, i = !1) {
	let a = [], o = 0, s = (n) => {
		let a = `${t}:${n.id}.${n.generation}`, o = (e, t) => {
			let r = n.params[e];
			return typeof r == "number" && Number.isFinite(r) ? r : t;
		}, s = (e) => r.drive(Ta(n.id, e));
		return {
			key: a,
			sr: e.sampleRate,
			num: o,
			str: (e, t) => {
				let r = n.params[e];
				return typeof r == "string" ? r : t;
			},
			param: (e, t) => s(e) ?? J(`${a}:${e}`, o(e, t)),
			driven: s,
			lean: i
		};
	}, c = q(e, () => {
		let e = n.get();
		for (let t of a) {
			let n = s(t), r = Gs[t.type](n, e), i = J(`${n.key}:on`, +!t.bypass), a = W.sub(1, i);
			e = [W.add(W.mul(i, r[0]), W.mul(a, e[0])), W.add(W.mul(i, r[1]), W.mul(a, e[1]))];
		}
		return e;
	}), l = (e, t) => {
		let n = !1;
		for (let i of da(e.type)) {
			let a = Hi(i, t[i.path]) ?? i.default;
			a !== e.params[i.path] && (e.params[i.path] = a, i.rebuild ? n = !0 : r.refresh(Ta(e.id, i.path)));
		}
		return n;
	};
	return {
		output: c,
		set(e) {
			let t = new Map(a.map((e) => [e.id, e])), n = [];
			for (let r of e.slice(0, 24)) {
				if (n.length >= 6) break;
				let e = t.get(r?.id);
				if (e && e.type === r.type) {
					t.delete(e.id), e.bypass = r.bypass === !0, r.params && l(e, r.params) && (e.generation = ++o), n.push(e);
					continue;
				}
				let i = Na(r);
				i && !n.some((e) => e.id === i.id) && n.push({
					...i,
					params: { ...i.params },
					generation: ++o
				});
			}
			return a = n, c.invalidate(), [...t.keys()];
		},
		state: () => a.map((e) => ({
			id: e.id,
			type: e.type,
			bypass: e.bypass,
			params: e.params
		}))
	};
}
//#endregion
//#region src/playback/engine/tone-envelope.ts
function qs(e, t) {
	let n = vo({ initial: 0 }), r = 1 / t, i = e;
	return {
		timeline: n,
		set(e) {
			i = e;
		},
		triggerAttack(e, t) {
			let a = i.attack, o = n.valueAt(e);
			o > 0 && (a = (1 - o) * a), a < r ? (n.cancelFrom(e), n.setAt(t, e)) : i.attackCurve === "exponential" ? n.targetRampTo(t, a, e) : n.linearRampTo(t, a, e), i.decay && i.sustain < 1 && n.approach(t * i.sustain, e + a, i.decay);
		},
		triggerRelease(e) {
			n.valueAt(e) > 0 && (i.release < r ? n.setAt(0, e) : n.targetRampTo(0, i.release, e));
		},
		valueAt: (e) => n.valueAt(e)
	};
}
//#endregion
//#region src/playback/engine/elementary/slot.ts
function X(e, t, n) {
	let r = e[t];
	return typeof r == "number" && Number.isFinite(r) ? r : n;
}
function Js(e, t, n) {
	let r = e[t];
	return typeof r == "string" ? r : n;
}
function Ys(e) {
	return e["envelope.attackCurve"] === "exponential" ? "exponential" : "linear";
}
function Xs(e, t, n) {
	return {
		attack: X(e, `${t}.attack`, .01),
		decay: X(e, `${t}.decay`, .1),
		sustain: X(e, `${t}.sustain`, .5),
		release: X(e, `${t}.release`, 1),
		attackCurve: n
	};
}
function Z(e, t = "") {
	return Xs(e, `${t}envelope`, Ys(e));
}
var Zs = (e) => W.pow(2, W.div(e, 1200));
function Qs(e, t) {
	return e === "triangle" ? W.bleptriangle(t) : e === "sawtooth" ? W.blepsaw(t) : e === "square" ? W.blepsquare(t) : W.cycle(t);
}
function $s(e, t, n, r = Qs) {
	let i = Js(e.params, `${t}oscillator.type`, "sine");
	if (i === "pulse") {
		let r = W.mul(.5, W.add(1, e.param(`${t}oscillator.width`, .5)));
		return W.sub(W.mul(2, W.le(W.phasor(n), r)), 1);
	}
	if (i.startsWith("fat")) {
		let a = i.slice(3), o = Math.max(2, Math.round(X(e.params, `${t}oscillator.count`, 3))), s = e.param(`${t}oscillator.spread`, 20), c = 10 ** ((-6 - 1.1 * o) / 20), l = Array.from({ length: o }, (e, t) => r(a, W.mul(n, Zs(W.mul(s, t / (o - 1) - .5)))));
		return W.mul(c, W.add(...l));
	}
	return r(i, n);
}
function ec(e, t) {
	return e === "triangle" ? W.triangle(t) : e === "sawtooth" ? W.saw(t) : e === "square" ? W.square(t) : W.cycle(t);
}
function tc(e, t) {
	return W.min(e / 2, W.max(-e / 2, t));
}
function nc(e, t, n, r, i) {
	r > 0 && i > .05 ? e.timeline.exponentialRampTo(t, r, n) : e.timeline.setAt(t, n), e.changed();
}
function rc(e, t, n) {
	let r = qs(n, e.host.sampleRate);
	return {
		env: r,
		lane: Mo(e.host, `${e.key}:${t}`, "follower", r.timeline, 0)
	};
}
function ic({ env: e, lane: t }, n) {
	e.timeline.holdAt(n), e.triggerRelease(n), t.changed();
}
function ac(e) {
	let t = e.eventsFrom(Infinity).at(-1);
	return t ? t.value === 0 && t.kind !== "target" ? t.time : Infinity : e.valueAt(0) === 0 ? -Infinity : Infinity;
}
var oc = (...e) => () => Math.max(...e.map((e) => ac(e.env.timeline)));
function sc(e) {
	let t = Y(e.host, `${e.key}:keytrack`, "line", 1), n = Y(e.host, `${e.key}:velfilter`, "line", 1), { layer: r } = e;
	return {
		active: () => X(r.params, "keyTrack", 0) !== 0 || X(r.params, "velocityToFilter", 0) !== 0,
		track: t.get,
		amount: n.get,
		set(e, i, a) {
			let o = us(r.params, e, i);
			t.timeline.setAt(o.track, a), n.timeline.setAt(o.amount, a), t.changed(), n.changed();
		}
	};
}
function cc(e, t) {
	e.timeline.holdAt(t), e.changed();
}
//#endregion
//#region src/playback/engine/elementary/formant.ts
var lc = .35, uc = .47, dc = 1.6, fc = .12, pc = 6e3, mc = .006, hc = .05, gc = Array.from({ length: 40 }, (e, t) => 1 / (t + 1) ** 1.6), _c = 10 ** (.7 / 20), vc = 1e-4, yc = "sine-sculptor:glottal", bc = 4096, xc = 8, Sc = Vi("FormantVoice");
function Cc() {
	let e = new Float64Array(bc);
	for (let t = 0; t < bc; t++) {
		let n = 2 * Math.PI * t / bc, r = 0;
		gc.forEach((e, t) => r += e * Math.sin((t + 1) * n)), e[t] = r;
	}
	let t = 0;
	for (let n of e) t = Math.max(t, Math.abs(n));
	let n = 1 / t, r = /* @__PURE__ */ new Float32Array(4097);
	for (let t = 0; t < bc; t++) r[t] = e[t] * n;
	return r[bc] = r[0], {
		table: r,
		scale: n
	};
}
var wc = null, Tc = () => wc ??= Cc();
function Ec(e) {
	let { host: t, key: n, layer: r } = e, i = (e) => X(r.params, e, Sc[e]), a = (e) => Js(r.params, e, Sc[e]), o = Y(t, `${n}:freq`, "line", 220, "exponential"), s = Y(t, `${n}:vibrato`, "line", 0), c = Y(t, `${n}:amp`, "line", 0), l = Y(t, `${n}:env`, "line", 0), u = Y(t, `${n}:puff`, "line", lc), d = Y(t, `${n}:burst`, "line", 0), f = Y(t, `${n}:burstHz`, "line", 3e3, "exponential"), p = Y(t, `${n}:burstQ`, "line", 2.5), m = Y(t, `${n}:reset`, "line", 0), h = Y(t, `${n}:power`, "line", 0), g = [
		0,
		1,
		2,
		3
	].map((e) => ({
		hz: Y(t, `${n}:f${e}hz`, "line", 500, "exponential"),
		q: Y(t, `${n}:f${e}q`, "line", 8),
		gain: Y(t, `${n}:f${e}gain`, "line", 0)
	})), _ = [
		o,
		s,
		c,
		l,
		u,
		d,
		f,
		p,
		m,
		h,
		...g.flatMap((e) => [
			e.hz,
			e.q,
			e.gain
		])
	], v = !1, y = !1, b = (e, r) => {
		if (a("source") === "saw") return v = !1, W.blepsaw(e);
		let i = t;
		if (!v && !y) {
			let e = () => {
				y = !0, x.invalidate();
			};
			v = i.loadFiles?.({ [yc]: Tc().table }, e) ?? !1, v || (y = !0);
		}
		if (!y) return W.table({
			key: `${n}:glottal`,
			path: yc
		}, r);
		let { scale: o } = Tc(), s = gc.slice(0, xc).map((e, t) => W.mul(e * o, W.sin(W.mul(2 * Math.PI * (t + 1), r))));
		return W.add(...s);
	}, x = q(t, () => {
		let t = m.get(), a = r.param("vibRate", Sc.vibRate), _ = W.mul(s.get(), W.sin(W.mul(2 * Math.PI, W.syncphasor(a, t)))), v = W.mul(o.get(), Zs(W.add(r.detune.get(), _))), y = r.param("brightness", Sc.brightness), x = h.get(), S = W.svf({
			key: `${n}:tilt`,
			mode: "lowpass"
		}, y, _c, W.mul(x, b(v, W.syncphasor(v, t)))), C = r.param("breath", Sc.breath), w = W.mul(S, W.sub(1, W.mul(.5, C))), T = W.mul(C, u.get()), E = W.min(2, W.max(.5, r.param("formantShift", Sc.formantShift))), D = g.map((e) => {
			let t = e.q.get();
			return {
				hz: W.mul(e.hz.get(), E),
				q: t,
				level: W.div(e.gain.get(), t)
			};
		}), O = p.get(), k = f.get(), A = W.div(d.get(), O), j = c.get(), M = i("roughness"), N = null;
		if (M > 0) {
			let e = r.param("roughness", 0), n = W.syncphasor(W.add(30, W.mul(30, e)), t);
			N = W.sub(1, W.mul(e, W.ge(n, .5)));
		}
		let P = l.get(), ee = (e, t) => {
			let r = W.mul(x, W.noise({
				key: `${n}:${e}noise`,
				seed: t
			})), i = W.add(w, W.mul(r, T)), a = W.add(...D.map((t, r) => W.mul(t.level, W.svf({
				key: `${n}:${e}f${r}`,
				mode: "bandpass"
			}, t.hz, t.q, i)))), o = N ? W.mul(j, N, a) : W.mul(j, a), s = W.mul(A, W.svf({
				key: `${n}:${e}burst`,
				mode: "bandpass"
			}, k, O, r));
			return W.mul(P, W.add(o, s));
		};
		return [ee("l", e.seed * 2 + 1), ee("r", e.seed * 2 + 2)];
	}), S = 0, C = 0, w = !1, T = Infinity, E = -Infinity, D = (e) => {
		let n = i("envelope.release");
		l.timeline.holdAt(e), l.timeline.linearTo(0, e + n);
		let r = i("pitchDrop");
		r > 0 && C > 0 && (o.timeline.holdAt(e), o.timeline.exponentialTo(C * 2 ** (-r / 1200), e + n), o.changed()), d.timeline.holdAt(e), d.timeline.linearTo(0, e + mc), l.changed(), d.changed(), !(T <= e) && (T !== Infinity && t.immediate() < T && h.timeline.cancelFrom(T), T = e + Math.max(n, mc) + hc, h.timeline.setAt(0, T), h.changed());
	};
	return {
		output: x,
		lanes: {
			freq: o.timeline,
			vibrato: s.timeline,
			amp: c.timeline,
			env: l.timeline,
			puff: u.timeline,
			burst: d.timeline,
			burstHz: f.timeline,
			burstQ: p.timeline,
			formants: g.map((e) => ({
				hz: e.hz.timeline,
				q: e.q.timeline,
				gain: e.gain.timeline
			}))
		},
		attack(e, t, n, r) {
			!w || t >= T ? (m.timeline.setAt(1, t), m.timeline.setAt(0, t + vc), h.timeline.setAt(1, t)) : T !== Infinity && h.timeline.cancelFrom(T), w = !0, T = Infinity, E = t;
			let v = i("randomness"), y = i("morph"), b = i("voiceMix"), x = i("formantShift"), D = i("envelope.attack"), O = ei(i("seed"), r.key ?? r.index, r.midi), { syllable: k, manual: A } = ni({
				mode: a("syllableMode"),
				set: a("syllableSet"),
				vowelA: a("vowelA"),
				vowelB: a("vowelB"),
				randomness: v
			}, r.index, O, r.syllable), j = e * 2 ** ((O() - .5) * 2 * v * 25 / 1200), M = 1 + (O() - .5) * .1 * v, N = x * M, P = ai(k.a, b, M), ee = ai(k.b, b, M), te = P.map((e, t) => e.map((e, n) => e + (ee[t][n] - e) * y)), F = i("consonant"), I = !A && F > .02 && k.c ? Yr[k.c] ?? null : null, ne = null, L = null;
			if (I?.vowel) {
				let e = ai(I.vowel, b, M);
				ne = e.map((e) => e[0]), L = e.map((e) => e[1]);
			} else I?.locus && (ne = I.locus.map((e) => e * M), L = I.lg ? I.lg.map(ri) : P.map((e) => e[1]));
			let re = I ? Math.max(.015, I.trans * (.4 + .6 * F)) : 0, ie = I?.vot ?? 0, ae = t + .004 + ie, oe = ae + re, se = oe + .1, ce = se + i("morphTime"), le = i("portamento"), ue = i("scoop"), de = o.timeline;
			de.holdAt(t);
			let fe = de.valueAt(t), pe = j;
			ue > 0 ? pe = j * 2 ** (-ue / 1200) : le > 0 && S > 0 && (pe = fe > 0 ? fe : S), de.setAt(pe, t), pe !== j && de.exponentialTo(j, t + Math.max(.02, le)), S = j, C = j;
			let me = i("vibDelay"), he = s.timeline;
			he.holdAt(t), he.setAt(0, t), he.setAt(0, t + me), he.linearTo(i("vibDepth"), t + me + .3);
			let ge = i("bandwidth");
			g.forEach((e, n) => {
				let [r, i, a] = P[n];
				e.q.timeline.holdAt(t), e.q.timeline.setAt(Math.max(1, r * x / (a * ge)), t);
				let o = e.hz.timeline, s = e.gain.timeline;
				o.holdAt(t), s.holdAt(t), o.setAt(ne ? ne[n] : r, t), s.setAt((L ? L[n] : i) * dc, t), o.linearTo(r, oe), s.linearTo(i * dc, oe), y > .01 && (o.setAt(r, se), o.linearTo(te[n][0], ce), s.setAt(i * dc, se), s.linearTo(te[n][1] * dc, ce));
			});
			let _e = c.timeline;
			if (_e.holdAt(t), _e.linearTo(0, t + .004), I?.kind === "nasal") {
				let e = t + .004 + Math.max(.016, D);
				_e.linearTo(1 - .65 * F, e), _e.linearTo(1, Math.max(oe, e + .01));
			} else _e.setAt(0, ae), _e.linearTo(1, ae + Math.max(.004, D));
			l.timeline.holdAt(t), l.timeline.linearTo(.5 + .5 * n, t + .005), u.timeline.holdAt(t), u.timeline.setAt(uc, t), u.timeline.linearTo(lc, t + .15);
			let ve = d.timeline;
			if (ve.holdAt(t), ve.linearTo(0, t + mc), I?.burst) {
				let [e, n, r] = I.burst, i = Math.max(t + r + ie, t + mc * 3);
				f.timeline.holdAt(t), p.timeline.holdAt(t), f.timeline.linearTo(Math.min(pc, e * Math.sqrt(N)), t + mc), p.timeline.linearTo(n, t + mc), ve.linearTo(fc * F, t + mc * 2), ve.exponentialTo(1e-4, i), ve.linearTo(0, i + mc);
			}
			for (let e of _) e.changed();
		},
		release: D,
		silence(e) {
			for (let t of _) t.timeline.holdAt(e);
			m.timeline.cancelFrom(e), m.timeline.setAt(0, e), E > e && (S = 0, C = 0, w = !1), D(e);
			for (let e of _) e.changed();
		},
		refresh: x.invalidate,
		quietAt: () => ac(h.timeline),
		sleep() {
			v = !1, x.invalidate();
		}
	};
}
var Dc = { FormantVoice: Ec }, Oc = (e) => .45 * e.sampleRate;
function kc(e, t, n, r) {
	return W.min(W.mul(t, W.add(1, W.mul(W.sub(W.pow(2, n), 1), r, r))), Oc(e));
}
function Ac(e, t, n, r, i) {
	return e === "bandpass" ? W.div(W.svf({
		key: t,
		mode: "bandpass"
	}, n, r, i), r) : W.svf({
		key: t,
		mode: e === "highpass" ? "highpass" : "lowpass"
	}, n, W.db2gain(r), i);
}
function jc(e) {
	let { host: t, key: n, layer: r } = e, i = Y(t, `${n}:freq`, "line", 440, "exponential"), a = () => Xs(r.params, "filterEnvelope", Ys(r.params)), o = rc(e, "amp", Z(r.params)), s = rc(e, "filter", a()), c = sc(e), l = q(t, () => {
		let e = W.mul(i.get(), Zs(r.detune.get())), a = r.param("filterEnvelope.baseFrequency", 200), l = r.param("filterEnvelope.octaves", 3), u = c.active(), d = kc(t, u ? W.mul(a, c.track()) : a, u ? W.mul(l, c.amount()) : l, s.lane.get()), f = r.param("filter.Q", 1), p = Js(r.params, "filter.type", "lowpass"), m = W.mul(Ac(p, `${n}:svf`, d, f, $s(r, "", e)), o.lane.get());
		return [m, m];
	});
	return {
		output: l,
		attack(e, t, n) {
			o.env.set(Z(r.params)), o.env.triggerAttack(t, n), o.lane.changed(), s.env.set(a()), s.env.triggerAttack(t, 1), s.lane.changed(), c.set(e, n, t), nc(i, e, t, X(r.params, "portamento", 0), o.env.valueAt(t));
		},
		release(e) {
			o.env.set(Z(r.params)), o.env.triggerRelease(e), o.lane.changed(), s.env.set(a()), s.env.triggerRelease(e), s.lane.changed();
		},
		silence(e) {
			ic(o, e), ic(s, e), cc(i, e);
		},
		refresh: l.invalidate,
		quietAt: oc(o)
	};
}
var Mc = 10 ** (-10 / 20);
function Nc(e, t) {
	let { host: n, key: r, layer: i } = e, a = Y(n, `${r}:freq`, "line", 440, "exponential"), o = () => Xs(i.params, "modulationEnvelope", "linear"), s = rc(e, "amp", Z(i.params)), c = rc(e, "mod", o()), l = q(n, () => {
		let e = a.get(), r = Zs(i.detune.get()), o = i.param("harmonicity", 3), l = W.mul(tc(n.sampleRate, W.mul(e, o)), r), u = Qs(Js(i.params, "modulation.type", "square"), l), d = W.mul(Mc, u, c.lane.get()), f;
		if (t) {
			let t = i.param("modulationIndex", 10), a = W.mul(tc(n.sampleRate, W.mul(e, W.add(1, W.mul(t, d)))), r);
			f = W.mul(Mc, $s(i, "", a, ec), s.lane.get());
		} else {
			let t = W.mul(Mc, $s(i, "", W.mul(e, r)), s.lane.get());
			f = W.mul(t, W.add(.5, W.mul(.5, d)));
		}
		return [f, f];
	});
	return {
		output: l,
		attack(e, t, n) {
			s.env.set(Z(i.params)), s.env.triggerAttack(t, n), s.lane.changed(), c.env.set(o()), c.env.triggerAttack(t, n), c.lane.changed(), nc(a, e, t, X(i.params, "portamento", 0), s.env.valueAt(t));
		},
		release(e) {
			s.env.set(Z(i.params)), s.env.triggerRelease(e), s.lane.changed(), c.env.set(o()), c.env.triggerRelease(e), c.lane.changed();
		},
		silence(e) {
			ic(s, e), ic(c, e), cc(a, e);
		},
		refresh: l.invalidate,
		quietAt: oc(s)
	};
}
var Pc = [
	1,
	1.483,
	1.932,
	2.546,
	2.63,
	3.897
];
function Fc(e) {
	let { host: t, key: n, layer: r } = e, i = Y(t, `${n}:freq`, "line", 440, "exponential"), a = rc(e, "amp", Z(r.params)), o = q(t, () => {
		let e = i.get(), o = Zs(r.detune.get()), s = r.param("harmonicity", 5.1), c = r.param("modulationIndex", 32), l = Pc.map((n) => {
			let r = W.mul(n, e), i = W.blepsquare(W.mul(tc(t.sampleRate, W.mul(r, s)), o));
			return W.square(W.mul(tc(t.sampleRate, W.mul(r, W.add(1, W.mul(c, i)))), o));
		}), u = a.lane.get(), d = r.param("resonance", 4e3), f = r.param("octaves", 1.5), p = W.min(W.mul(d, W.add(1, W.mul(W.sub(W.pow(2, f), 1), u))), Oc(t)), m = W.mul(W.svf({
			key: `${n}:highpass`,
			mode: "highpass"
		}, p, 1, W.add(...l)), u);
		return [m, m];
	});
	return {
		output: o,
		attack(e, t, n) {
			a.env.set(Z(r.params)), a.env.triggerAttack(t, n), a.lane.changed(), nc(i, e, t, 0, 0);
		},
		release(e) {
			a.env.set(Z(r.params)), a.env.triggerRelease(e), a.lane.changed();
		},
		silence(e) {
			ic(a, e), cc(i, e);
		},
		refresh: o.invalidate,
		quietAt: oc(a)
	};
}
function Ic(e) {
	let t = (t, n) => W.pole(t, W.mul(n * .11, e));
	return W.add(t(.99886, .0555179), t(.99332, .0750759), t(.969, .153852), t(.8665, .3104856), t(.55, .5329522), t(-.7616, -.016898), W.mul(.058982, e), W.z(W.mul(.01275186, e)));
}
var Lc = 8, Rc = (e) => Math.ceil(e / Lc) + 2;
function zc(e, t) {
	return Math.floor(Math.fround(1 / e) * t) + 1;
}
function Bc(e) {
	let { host: t, key: n, layer: r } = e, i = Rc(t.sampleRate), a = Y(t, `${n}:period`, "line", zc(440, t.sampleRate)), o = Y(t, `${n}:gate`, "line", 0), s = Y(t, `${n}:feedback`, "line", X(r.params, "resonance", .7)), c = Y(t, `${n}:level`, "line", 1), l = q(t, () => {
		let l = W.mul(2 * Math.PI / t.sampleRate, r.param("dampening", 4e3)), u = W.sub(1, l), d = o.get(), f = a.get(), p = s.get(), m = (e, t) => {
			let a = W.mul(d, Ic(W.noise({
				key: `${n}:${e}`,
				seed: t
			}))), o = W.delay({
				key: `${n}:${e}:comb`,
				size: i
			}, f, p, W.pole(u, W.mul(l, a)));
			return X(r.params, "velocity", 0) === 0 ? o : W.mul(o, c.get());
		};
		return [m("l", e.seed * 2 + 1), m("r", e.seed * 2 + 2)];
	}), u = (e) => {
		s.timeline.linearRampTo(0, X(r.params, "release", 1), e), s.changed();
	};
	return {
		output: l,
		attack(e, n, l) {
			let u = ds(r.params, e, l, t.sampleRate);
			a.timeline.setAt(Math.min(i - 1, zc(u.hz, t.sampleRate)), n), a.changed(), o.timeline.cancelFrom(n), o.timeline.setAt(1, n), o.timeline.setAt(0, n + X(r.params, "attackNoise", 1) / u.hz), o.changed(), s.timeline.cancelFrom(n), s.timeline.setAt(u.feedback ?? X(r.params, "resonance", .7), n), s.changed(), c.timeline.setAt(u.level, n), c.changed();
		},
		release: u,
		silence(e) {
			o.timeline.cancelFrom(e), o.timeline.setAt(0, e), o.changed(), s.timeline.holdAt(e), u(e);
		},
		refresh: l.invalidate,
		quietAt: () => {
			let e = ac(o.timeline);
			return e === -Infinity ? -Infinity : Math.max(ac(s.timeline), e) + i / t.sampleRate;
		}
	};
}
var Vc = {
	MonoSynth: jc,
	FMSynth: (e) => Nc(e, !0),
	AMSynth: (e) => Nc(e, !1),
	MetalSynth: Fc,
	PluckSynth: Bc
};
//#endregion
//#region src/playback/engine/elementary/voices.ts
function Hc(e) {
	let { host: t, key: n, layer: r } = e, i = Y(t, `${n}:freq`, "line", 440, "exponential"), a = rc(e, "amp", Z(r.params)), o = q(t, () => {
		let e = W.mul(i.get(), Zs(r.detune.get())), t = W.mul($s(r, "", e), a.lane.get());
		return [t, t];
	});
	return {
		output: o,
		attack(e, t, n) {
			a.env.set(Z(r.params)), a.env.triggerAttack(t, n), a.lane.changed(), nc(i, e, t, X(r.params, "portamento", 0), a.env.valueAt(t));
		},
		release(e) {
			a.env.set(Z(r.params)), a.env.triggerRelease(e), a.lane.changed();
		},
		silence(e) {
			ic(a, e), cc(i, e);
		},
		refresh: o.invalidate,
		quietAt: oc(a)
	};
}
function Uc(e) {
	let { host: t, key: n, layer: r } = e, i = rc(e, "amp", Z(r.params)), a = q(t, () => {
		let t = i.lane.get(), a = Js(r.params, "noise.type", "white"), o = (e, t) => {
			let r = W.noise({
				key: `${n}:${e}`,
				seed: t
			});
			return a === "pink" ? Ic(r) : a === "brown" ? W.mul(3.5, W.pole(1 / 1.02, W.mul(.02 / 1.02, r))) : r;
		};
		return [W.mul(o("l", e.seed * 2 + 1), t), W.mul(o("r", e.seed * 2 + 2), t)];
	});
	return {
		output: a,
		attack(e, t, n) {
			i.env.set(Z(r.params)), i.env.triggerAttack(t, n), i.lane.changed();
		},
		release(e) {
			i.env.set(Z(r.params)), i.env.triggerRelease(e), i.lane.changed();
		},
		silence: (e) => ic(i, e),
		refresh: a.invalidate,
		quietAt: oc(i)
	};
}
var Wc = 1e-4;
function Gc(e) {
	let { host: t, key: n, layer: r } = e, i = Y(t, `${n}:freq`, "line", 440, "exponential"), a = Y(t, `${n}:reset`, "line", 0), o = () => Z(r.params), s = rc(e, "amp", o()), c = q(t, () => {
		let e = tc(t.sampleRate, W.mul(i.get(), Zs(r.detune.get()))), n = Js(r.params, "oscillator.type", "sine") === "sine" ? W.sin(W.mul(2 * Math.PI, W.syncphasor(e, a.get()))) : $s(r, "", e), o = W.mul(n, s.lane.get());
		return [o, o];
	});
	return {
		output: c,
		attack(e, t, n) {
			let c = !(s.env.valueAt(t) > 0);
			s.env.set(o()), s.env.triggerAttack(t, n), s.lane.changed(), i.timeline.setAt(e * X(r.params, "octaves", 10), t), i.timeline.exponentialTo(e, t + X(r.params, "pitchDecay", .05)), i.changed(), c && (a.timeline.setAt(1, t), a.timeline.setAt(0, t + Wc), a.changed());
		},
		release(e) {
			s.env.set(o()), s.env.triggerRelease(e), s.lane.changed();
		},
		silence(e) {
			ic(s, e), cc(i, e), a.timeline.cancelFrom(e), a.timeline.setAt(0, e), a.changed();
		},
		refresh: c.invalidate,
		quietAt: oc(s)
	};
}
var Kc = {
	attack: .01,
	decay: 0,
	sustain: 1,
	release: .5
}, qc = 10 ** (1 / 20);
function Jc(e) {
	let { host: t, key: n, layer: r } = e, i = Y(t, `${n}:freq`, "line", 440, "exponential"), a = () => ({
		...Kc,
		attackCurve: Ys(r.params)
	}), o = [0, 1].map((t) => {
		let n = `voice${t}.`;
		return {
			prefix: n,
			amp: rc(e, `v${t}amp`, Z(r.params, n)),
			filter: rc(e, `v${t}filter`, a())
		};
	}), s = sc(e), c = q(t, () => {
		let e = s.active(), a = e ? W.sub(W.pow(2, W.mul(3, s.amount())), 1) : 7, c = W.mul(50, r.param("vibratoAmount", .5), W.cycle(r.param("vibratoRate", 5, `${n}:vibratoRate`))), l = W.mul(i.get(), Zs(W.add(r.detune.get(), c))), u = W.mul(l, r.param("harmonicity", 1.5)), d = o.map(({ amp: i, filter: o, prefix: c }, d) => {
			let f = `${n}.v${d}`, p = r.param(`${c}filterEnvelope.baseFrequency`, 200), m = e ? W.mul(p, s.track()) : p, h = o.lane.get(), g = W.min(W.mul(m, W.add(1, W.mul(a, h, h))), .45 * t.sampleRate), _ = W.svf({
				key: `${f}:lowpass`,
				mode: "lowpass"
			}, g, qc, $s(r, c, d === 0 ? l : u));
			return W.mul(_, i.lane.get());
		}), f = W.add(d[0], d[1]);
		return [f, f];
	});
	return {
		output: c,
		attack(e, t, n) {
			let c = 0;
			for (let { amp: e, filter: i, prefix: s } of o) e.env.set(Z(r.params, s)), e.env.triggerAttack(t, n), e.lane.changed(), i.env.set(a()), i.env.triggerAttack(t, 1), i.lane.changed(), c += e.env.valueAt(t);
			s.set(e, n, t), nc(i, e, t, X(r.params, "portamento", 0), c);
		},
		release(e) {
			for (let { amp: t, filter: n, prefix: i } of o) t.env.set(Z(r.params, i)), t.env.triggerRelease(e), t.lane.changed(), n.env.set(a()), n.env.triggerRelease(e), n.lane.changed();
		},
		silence(e) {
			for (let { amp: t, filter: n } of o) ic(t, e), ic(n, e);
			cc(i, e);
		},
		refresh: c.invalidate,
		quietAt: oc(...o.map((e) => e.amp))
	};
}
var Yc = {
	Synth: Hc,
	NoiseSynth: Uc,
	MembraneSynth: Gc,
	DuoSynth: Jc,
	...Vc,
	...Dc
};
new Set(Object.keys(Yc));
var Xc = /* @__PURE__ */ new Set([
	"Synth",
	"MonoSynth",
	"DuoSynth",
	"MembraneSynth",
	"FMSynth",
	"AMSynth",
	"MetalSynth"
]);
function Zc(e, t) {
	let n = Yc[e];
	if (!n) throw Error(`${e} doesn't play on the Elementary engine yet.`);
	return n(t);
}
//#endregion
//#region src/playback/engine/elementary/instrument.ts
var Qc = .01, $c = .004, el = .005, tl = 1, nl = /* @__PURE__ */ new WeakMap();
function rl(e) {
	let t = nl.get(e);
	if (t) return t;
	let n = !1, r = {
		sleepers: /* @__PURE__ */ new Set(),
		planned: /* @__PURE__ */ new Set(),
		plannedAt: -Infinity,
		arm() {
			!n && e.setTimer && (n = !0, e.setTimer(() => {
				n = !1;
				let t = e.immediate(), i = r.planned.size > 0 && t - r.plannedAt < 8;
				if (!i) for (let e of r.sleepers) e(t).awake && (i = !0);
				i && r.arm();
			}, tl));
		},
		run(e) {
			for (let t of r.sleepers) t(e);
		}
	};
	return nl.set(e, r), r;
}
function il(e, t, n, r = {}) {
	let i = e.nextId(), a = !1, o = 0, s = e.liveEdits === !1, c = Ss(e, i, () => j(), r.bpm ?? 120, s), l = e.keep !== void 0, u = l && e.sleepingVoices !== !1, d = l ? {
		...e,
		lead: 128
	} : e, f = Qc + (l ? 128 / e.sampleRate : 0), p = rl(e), m = Jo(t) ? t.kit.pads : null, h = Yo(t), g = m ? $o(m, h.length) : null, _ = h.map((t, n) => {
		let r = t.voiceType, a = ps(t.polyphony), o = `${i}.L${n}`, s = Ui(r, t.params), l = Y(d, `${o}:detune`, "line", X(s, "detune", 0)), f = q(d, () => c.drive(wa(n, "detune")) ?? l.get()), p = {
			params: s,
			detune: {
				timeline: l.timeline,
				changed: l.changed,
				get: f.get,
				invalidate: f.invalidate
			},
			param: (e, t, r) => c.drive(wa(n, e)) ?? J(r ?? `${o}:p:${e}`, X(p.params, e, t))
		}, m = Array.from({ length: a }, (t, n) => Zc(r, {
			host: d,
			key: `${o}.v${n}`,
			layer: p,
			seed: e.nextSeed()
		})), h = {
			voiceType: r,
			view: p,
			db: ms(t.volume),
			detune: l,
			choke: g?.chokeable[n] ? Y(d, `${o}:choke`, "follower", 1) : null,
			slots: m,
			awake: m.map(() => !u),
			reserved: m.map(() => -Infinity),
			lastAttack: m.map(() => -Infinity),
			alloc: new qo(a),
			notes: 0,
			output: q(d, () => {
				let [e, t] = Oo(m.filter((e, t) => h.awake[t]).map((e) => e.output.get())), r = c.drive(wa(n, "volume")) ?? J(`${o}:gain`, 10 ** (h.db / 20)), i = h.choke ? W.mul(r, h.choke.get()) : r;
				return [W.mul(e, i), W.mul(t, i)];
			})
		};
		return h;
	}), v = q(d, () => Oo(_.filter((e) => e.awake.includes(!0)).map((e) => e.output.get()))), y = h.every((e) => Xc.has(e.voiceType)), b = y ? {
		l: `tap:${i}:m`,
		r: `tap:${i}:m`
	} : {
		l: `tap:${i}:l`,
		r: `tap:${i}:r`
	}, x = l ? q(e, () => [W.tapIn({ name: b.l }), W.tapIn({ name: b.r })]) : v, S = l ? q(e, () => {
		let [e, t] = v.get();
		return Do([...y ? [W.tapOut({ name: b.l }, e)] : [W.tapOut({ name: b.l }, e), W.tapOut({ name: b.r }, t)], ...c.waves()]);
	}) : null;
	S && e.keep.add(S);
	let C = Ks(e, `${i}.fx`, x, c, s), w = (e) => {
		e.output.invalidate(), v.invalidate();
	}, T = (e, t) => !e.awake[t] && (e.awake[t] = !0, w(e), p.arm(), !0), E = (e) => {
		let t = !1, n = !1;
		if (a || !u) return {
			awake: t,
			slept: n
		};
		for (let r of _) {
			let i = !1;
			r.slots.forEach((n, a) => {
				if (r.awake[a]) {
					if (n.quietAt() + 2 > e || r.reserved[a] > e) {
						t = !0;
						return;
					}
					r.awake[a] = !1, n.sleep?.(), i = !0;
				}
			}), i && (w(r), n = !0);
		}
		return {
			awake: t,
			slept: n
		};
	};
	u && p.sleepers.add(E);
	let D = (e, t) => {
		let n = e.voiceType === "FormantVoice" && X(e.view.params, "portamento", 0) > 0, r = p.planned.has(E) && !n;
		return (n) => e.awake[n] ? e.slots[n].quietAt() <= t ? r ? n / e.slots.length : 0 : 2 : 1;
	}, O = (e) => {
		let t = !1;
		for (let n = 0; n < e.slots.length; n++) if (e.alloc.isFree(n)) {
			if (e.awake[n]) return !1;
			t = !0;
		}
		return t;
	}, k = /* @__PURE__ */ new Map(), A = (t, n) => {
		let r = e.immediate() + f, i = n.some(O) ? Math.max(0, (e.restructureAt?.() ?? -Infinity) + f - r) : 0;
		return i > 0 ? k.set(t, i) : k.delete(t), r + i;
	}, j = () => ({
		layers: _.map((e) => ({
			voiceType: e.voiceType,
			polyphony: e.slots.length,
			volume: e.db,
			params: e.view.params
		})),
		effects: C.state()
	}), M = (e) => typeof e == "number" && Number.isFinite(e) ? e : void 0, N = (e, t, n) => {
		let r = e.notes++;
		return {
			midi: t,
			index: M(n?.ordinal) ?? r,
			key: M(n?.key),
			syllable: typeof n?.syllable == "string" ? n.syllable : void 0
		};
	}, P = (e, t, n, r, i, a) => {
		let o = Math.max(r, e.lastAttack[t] + $c);
		e.lastAttack[t] = o;
		let s = T(e, t);
		return e.slots[t]?.attack(n, o, i, a), s;
	}, ee = (t) => {
		t && p.run(e.immediate());
	}, te = (e) => {
		if (!g) return _;
		let t = g.padByNote.get(e);
		return t === void 0 ? [] : g.padLayers[t].map((e) => _[e]);
	}, F = (t, n, { dryRun: r = !1, hold: i = !1, sleep: o = !1 } = {}) => {
		if (a) return 0;
		let s = e.immediate();
		r || (p.planned.add(E), p.plannedAt = s);
		let c = /* @__PURE__ */ new Map();
		for (let e of t) if (!(!Number.isFinite(e.at) || e.end <= s)) for (let t of te(e.midi)) {
			let n = c.get(t);
			n ? n.push(e) : c.set(t, [e]);
		}
		let l = 0;
		for (let [t, a] of c) {
			let o = t.slots.map((e, n) => t.awake[n] ? t.alloc.isFree(n) ? e.quietAt() : Infinity : null), c = /* @__PURE__ */ new Set();
			a.sort((e, t) => e.at - t.at), i && !r && a[0].at < n && t.awake.forEach((e, r) => {
				e && (t.reserved[r] = Math.max(t.reserved[r], n));
			});
			for (let i of a) {
				let a = Math.max(i.at, i.end), u = t.alloc.voiceOf(i.midi);
				if (u !== null && !c.has(u) && (i.at <= s || Math.abs(t.lastAttack[u] - i.at) < $c)) {
					c.add(u), o[u] = al(t.view.params, t.lastAttack[u], a, e.sampleRate);
					continue;
				}
				if (i.at <= s) continue;
				let d = al(t.view.params, i.at, a, e.sampleRate), f = o.findIndex((e) => e !== null && e <= i.at);
				if (f < 0) {
					if (f = o.indexOf(null), f < 0) continue;
					i.at < n && (r || T(t, f)) && l++;
				}
				c.add(f), o[f] = d, t.awake[f] && !r && (t.reserved[f] = Math.max(t.reserved[f], d));
			}
		}
		return r || ee(l > 0 || o), l;
	}, I = (e, t, n) => e.slots[t]?.release(Math.max(n, e.lastAttack[t])), ne = (e, t) => {
		for (let n of e.alloc.releaseAll()) I(e, n, t);
		e.choke && (e.choke.timeline.cancelFrom(t), e.choke.timeline.targetAt(0, t, el), e.choke.changed());
	}, L = (e, t, n, r, i) => {
		let { padLayers: a, chokes: o } = g, s = a[e].map((e) => _[e]), c = r ?? A(t, s);
		for (let t of o[e]) for (let e of a[t]) ne(_[e], c);
		let l = m[e].pitch, u = !1, d = !1;
		for (let e of s) {
			e.choke && (e.choke.timeline.cancelFrom(c), e.choke.timeline.setAt(1, c), e.choke.changed());
			let { voice: r, stolen: a } = e.alloc.noteOn(t, D(e, c));
			a !== null && (u = !0), P(e, r, fs(l) * ls(e.view.params), c, n, N(e, l, i)) && (d = !0);
		}
		return ee(d), u;
	}, re = {
		noteOn(e, t = 1, n, r) {
			if (a || !Number.isFinite(e)) return;
			let i = Number.isFinite(t) ? Math.min(1, Math.max(0, t)) : 1;
			if (g) {
				let t = g.padByNote.get(e);
				t !== void 0 && L(t, e, i, n, r) && o++;
				return;
			}
			let s = n ?? A(e, _), c = fs(e), l = !1, u = !1;
			for (let t of _) {
				let { voice: n, stolen: a } = t.alloc.noteOn(e, D(t, s));
				a !== null && (l = !0), P(t, n, c * ls(t.view.params), s, i, N(t, e, r)) && (u = !0);
			}
			ee(u), l && o++;
		},
		noteOff(t, n) {
			if (a) return;
			let r = n ?? e.immediate() + f + (k.get(t) ?? 0);
			k.delete(t);
			for (let e of _) {
				let n = e.alloc.noteOff(t);
				n !== null && I(e, n, r);
			}
		},
		releaseAll() {
			if (a) return;
			let t = e.immediate();
			k.clear(), p.planned.delete(E);
			for (let e of _) {
				e.reserved.fill(-Infinity), e.alloc.releaseAll(), e.notes = 0;
				for (let n of e.slots) n.silence(t);
			}
		},
		setParam(t, n, r) {
			let i = _[t];
			if (a || !i) return;
			let o = Bi(i.voiceType, n), s = o ? Hi(o, r) : void 0;
			if (o && s !== void 0) {
				if (i.view.params = {
					...i.view.params,
					[n]: s
				}, c.refresh(wa(t, n)), n === "detune" && typeof s == "number") {
					let t = e.immediate();
					i.detune.timeline.cancelFrom(t), i.detune.timeline.setAt(s, t), i.detune.changed();
					return;
				}
				for (let e of i.slots) e.refresh();
			}
		},
		setLayerVolume(e, t) {
			let n = _[e];
			!a && n && Number.isFinite(t) && (n.db = ms(t), c.refresh(wa(e, "volume")), n.output.invalidate());
		},
		setEffects(e) {
			if (!a) for (let t of C.set(Array.isArray(e) ? e : [])) c.drop(`fx:${t}:`);
		},
		setLfos(e) {
			a || c.set(Array.isArray(e) ? e : []);
		},
		setTempo(e) {
			a || c.setTempo(e);
		},
		bendPitch(e, t, n) {
			if (a || e.length === 0 || !Number.isFinite(n)) return;
			let r = Number.isFinite(t) ? Math.max(0, t) : 0;
			for (let [t, i] of _.entries()) {
				if (c.drives(wa(t, "detune"))) continue;
				let a = X(i.view.params, "detune", 0), o = i.detune.timeline;
				o.cancelFrom(n), o.setAt(a + (r > 0 ? 0 : e[e.length - 1]), n), r > 0 && e.forEach((t, i) => o.linearTo(a + t, n + r * (i + 1) / e.length)), i.detune.changed();
			}
		},
		voiceStats() {
			let e = 0;
			for (let t of _) e += t.alloc.heldCount;
			return {
				active: e,
				steals: o
			};
		},
		dispose() {
			a || (a = !0, p.sleepers.delete(E), p.planned.delete(E), S && e.keep.remove(S), n());
		}
	};
	return u && e.plannedWakes !== !1 && (re.prepare = F), t.effects?.length && re.setEffects(t.effects), t.lfos?.length && re.setLfos(t.lfos), {
		handle: re,
		output: C.output
	};
}
function al(e, t, n, r) {
	let i = [
		"envelope.",
		"voice0.envelope.",
		"voice1.envelope."
	].filter((t) => typeof e[`${t}release`] == "number");
	return i.length === 0 ? n + X(e, "release", 1) + Rc(r) / r : Math.max(...i.map((r) => {
		let i = t + X(e, `${r}attack`, 0) + X(e, `${r}decay`, 0);
		return X(e, `${r}sustain`, 1) === 0 && i <= n ? n : n + X(e, `${r}release`, 1);
	}));
}
//#endregion
//#region src/playback/engine/elementary/safety.ts
var ol = 10 ** (ao / 20), sl = 10 ** (oo / 20), cl = ol - sl;
function ll(e) {
	let t = (e) => W.tanh(W.div(W.max(0, W.sub(e, sl)), cl)), n = W.min(sl, W.max(-sl, e));
	return W.add(n, W.mul(cl, W.sub(t(e), t(W.mul(-1, e)))));
}
function ul([e, t], n, r) {
	let i = (e) => Math.exp(-1 / (e * n)), a = (e) => e / Math.log(40), o = W.env(0, i(Es), W.max(W.abs(e), W.abs(t))), s = W.max(0, W.sub(W.gain2db(o), -2)), c = W.mul(1 - 1 / 20, s), l = W.env(i(a(so)), i(a(co)), c), u = W.db2gain(W.mul(-1, l)), d = Math.round(Ts * n), f = (e, t) => ll(W.mul(u, W.sdelay({
		key: `${r}:${t}`,
		size: d
	}, e)));
	return {
		out: [f(e, "l"), f(t, "r")],
		gain: u
	};
}
//#endregion
//#region src/playback/engine/elementary/engine.ts
var dl = Tr.frequency.max, fl = Tr.Q.default, pl = .005, ml = 10, hl = .05, gl = .04, _l = "out:kept", vl = 25, yl = (e) => e > 0 ? 20 * Math.log10(e) : -Infinity, bl = ([e, t]) => W.max(W.abs(e), W.abs(t));
function xl(e, t, n) {
	let r = (e) => Math.exp(-1 / (.001 * e * n)), i = t + 15, a = i - 15, o = i + 15, s = 1 - 1 / 20, c = W.gain2db(W.env(r(3), r(10), e)), l = W.and(W.geq(c, a), W.leq(c, o)), u = W.mul(s / 2, W.mul(W.div(W.sub(c, a), 30), W.sub(a, c)));
	return W.db2gain(W.min(0, W.select(l, u, W.mul(s, W.sub(i, c)))));
}
function Sl(e, t) {
	let n = (n) => (...r) => {
		n(...r), e.changed(), t?.();
	};
	return {
		rampTo: n((t, n, r) => e.timeline.rampTo(t, n, r)),
		setAt: n((t, n) => e.timeline.setAt(t, n)),
		linearTo: n((t, n) => e.timeline.linearTo(t, n)),
		cancelFrom: n((t) => e.timeline.cancelFrom(t)),
		holdAt: n((t) => e.timeline.holdAt(t))
	};
}
function Cl(e) {
	let { renderer: t, context: n } = e, r = (t, n) => {
		try {
			e.onError ? e.onError(t, n) : console.error(t, n);
		} catch {}
	}, i = e.setTimer ?? ((e, t) => {
		let n = setTimeout(e, t * 1e3);
		return () => clearTimeout(n);
	}), a = !1, o = !1, s = 0, c = 0, l = -1, u = Promise.resolve(), d = null, f = null, p = !1, m = 0, h = 0, g = 0, _ = -Infinity, v = null, y = null, b = -Infinity, x = null, S = /* @__PURE__ */ new Set(), C = /* @__PURE__ */ new Set(), w = {
		sampleRate: n.sampleRate,
		immediate: () => n.currentTime,
		requestRender() {
			o || a || (o = !0, queueMicrotask(() => void re()));
		},
		nextId: () => `e${++s}`,
		nextSeed: () => ++c,
		report: r,
		setTimer: i,
		loadFiles(e, n) {
			return t.updateVirtualFileSystem ? (m++, Promise.resolve(t.updateVirtualFileSystem(e)).catch(n), !0) : !1;
		},
		keep: {
			add(e) {
				S.add(e), T.invalidate();
			},
			remove(e) {
				S.delete(e) && T.invalidate();
			}
		},
		restructureAt: () => b,
		sleepingVoices: e.sleepingVoices !== !1,
		liveEdits: e.liveEdits !== !1,
		plannedWakes: e.plannedWakes !== !1
	}, T = q(w, () => Do([...S].map((e) => e.get()))), E = w, D = w, O = e.meters === !0 && typeof t.on == "function", k = /* @__PURE__ */ new Map(), A = (e) => {
		let t = e.source === void 0 ? void 0 : k.get(e.source);
		t && Number.isFinite(e.max) && (t.latest = e.max, t.peak = Math.max(t.peak, e.max));
	};
	O && t.on("meter", A);
	let j = () => {
		if (!O) return null;
		let e = `${w.nextId()}:meter`, t = {
			peak: 0,
			latest: 0
		};
		return k.set(e, t), {
			tap(t, n = bl(t)) {
				let r = W.maxhold({
					key: `${e}:hold`,
					hold: vl
				}, n, 0);
				return [W.add(t[0], W.mul(0, W.meter({
					key: e,
					name: e
				}, r))), t[1]];
			},
			take() {
				let e = Math.max(t.peak, t.latest);
				return t.peak = 0, e;
			},
			dispose: () => void k.delete(e)
		};
	}, M = () => {
		let e = /* @__PURE__ */ new Set(), t = q(E, () => Oo([...e].map((e) => e.get())));
		return {
			mix: t,
			add(n) {
				e.add(n), t.invalidate();
			},
			remove(n) {
				e.delete(n) && t.invalidate();
			}
		};
	}, N = (e) => e, P = (e) => e, ee = M(), te = Y(E, "out:volume", "line", 1), F = j(), I = j(), ne = q(E, () => {
		let e = Fo(ee.mix.get(), te.get());
		if (l === null) return F ? F.tap(e) : e;
		let t = xl(bl(e), l, n.sampleRate), r = ul(Fo(e, t), n.sampleRate, "out:safety");
		return !F || !I ? r.out : I.tap(F.tap(r.out), W.sub(1, W.mul(t, r.gain)));
	}), L = (e) => S.size > 0 ? W.add(e, W.mul(W.const({
		key: _l,
		value: 0
	}), T.get())) : e, re = () => {
		if (o = !1, a) return u;
		if (p && !f && g === 0 && n.currentTime - _ >= hl && ie(), f) return o = !0, f.then(() => re());
		try {
			let [e, a] = ne.get(), s = L(e), c = v === null || v[0] !== s.hash || v[1] !== a.hash;
			if (c && n.currentTime < b) return x ??= i(() => {
				x = null, w.requestRender();
			}, b - n.currentTime), u;
			if (x?.(), x = null, C.size > 0 && (y === null || y[0] !== e.hash || y[1] !== a.hash)) {
				o = !0;
				let t = !1;
				try {
					for (let e of C) e(n.currentTime) && (t = !0);
				} finally {
					o = !1;
				}
				t && ([e, a] = ne.get(), s = L(e));
			}
			c && (b = n.currentTime + gl), v = [s.hash, a.hash], y = [e.hash, a.hash], h = m, g++, u = Promise.resolve(t.render(s, a)).then(() => void (_ = n.currentTime)).catch((e) => r("The audio graph could not be updated.", e)).finally(() => void g--), ae();
		} catch (e) {
			r("The audio graph could not be built.", e);
		}
		return u;
	}, ie = () => {
		p = !1;
		let e = m === h;
		f = (async () => {
			await t.gc?.(), e && await t.pruneVirtualFileSystem?.();
		})().catch((e) => r("The audio engine could not free memory it no longer needs.", e)).finally(() => {
			f = null;
		});
	}, ae = () => {
		d || a || !t.gc || (d = i(() => {
			d = null, p = !0;
		}, ml));
	};
	Promise.resolve().then(() => t.setCurrentTimeMs(n.currentTime * 1e3)).catch((e) => r("The audio clock could not be set.", e));
	let oe = /* @__PURE__ */ new WeakMap(), se = (e) => {
		let t = Y(E, `${e}:hz`, "line", dl, "exponential"), r = Y(E, `${e}:q`, "line", fl);
		return {
			active: !1,
			removal: null,
			frequency: t,
			q: r,
			apply([i, a]) {
				let o = W.min(n.sampleRate * .45, t.get()), s = W.pow(10, W.div(r.get(), 20));
				return [W.svf({
					key: `${e}:l`,
					mode: "lowpass"
				}, o, s, i), W.svf({
					key: `${e}:r`,
					mode: "lowpass"
				}, o, s, a)];
			}
		};
	};
	return {
		destination: N(ee),
		volume: Sl(te),
		setLimiter(e) {
			l = e === null || !Number.isFinite(e) ? null : e, ne.invalidate();
		},
		flush: re,
		deferredUntil: () => x ? b : null,
		readMaster() {
			let e = yl(F?.take() ?? 0), t = Math.min(1, I?.take() ?? 0);
			return {
				master: e,
				limiterReductionDb: l === null || t <= 0 ? 0 : Math.min(0, yl(1 - t))
			};
		},
		createTransport: () => to(n, {
			lookahead: e.lookahead,
			pulse: e.pulse,
			onError: r
		}),
		createTrack(e, t) {
			let n = w.nextId(), r = P(e), i = M(), a = Y(E, `${n}:gain`, "line", t.gain), o = Y(E, `${n}:pan`, "line", t.pan), s = w.liveEdits ? null : t.pan, c = j(), l = q(E, () => {
				let e = Fo(i.mix.get(), a.get()), t = s === null ? No(e, o.get()) : Po(e, s, `${n}:pan`);
				return c ? c.tap(t) : t;
			}), u = (e) => {
				if (s !== null) return !1;
				let t = o.timeline.eventsFrom(e);
				return t.length > 1 || t.some((t) => t.time > e || t.kind === "target") ? !1 : (s = o.timeline.valueAt(e), l.invalidate(), !0);
			};
			w.liveEdits || C.add(u), r.add(l);
			let d = Sl(o, () => {
				s !== null && (s = null, l.invalidate());
			}), f = /* @__PURE__ */ new Map();
			return {
				input: N(i),
				gain: Sl(a),
				pan: {
					...d,
					rampTo: (e, t, n) => d.rampTo(e, t, s === null ? n : Math.max(n, b))
				},
				setSend(e, t, r, i) {
					let a = f.get(e);
					if (a) {
						if (a.level === t) return;
						a.level = t, a.lane.timeline.rampTo(t, r, i), a.lane.changed();
						return;
					}
					let o = oe.get(e);
					if (t <= 0 || !o) return;
					let s = Y(E, `${n}:send:${e.id}`, "line", t), c = q(E, () => Fo(l.get(), s.get()));
					o.add(c), f.set(e, {
						level: t,
						lane: s,
						part: c
					});
				},
				dropSend(e) {
					let t = f.get(e);
					t && (oe.get(e)?.remove(t.part), f.delete(e));
				},
				readPeak: () => c ? yl(c.take()) : null,
				dispose() {
					c?.dispose(), C.delete(u), r.remove(l);
					for (let [e, t] of f) oe.get(e)?.remove(t.part);
					f.clear();
				}
			};
		},
		createBus(e, t, n, i) {
			let a = P(t), o = M(), s = j(), c = null, l = Ko(D, e, n, o.mix, i ?? r, () => {
				s?.dispose(), c && a.remove(c);
			});
			c = s ? q(E, () => s.tap(l.output.get())) : l.output, a.add(c);
			let u = {
				...l.channel,
				readPeak: () => s ? yl(s.take()) : null
			};
			return oe.set(u, o), u;
		},
		createInstrument(e, t, n) {
			let r = P(e), i = null, a = il(w, t, () => {
				i && r.remove(i);
			}, n);
			return i = a.output, r.add(i), a.handle;
		},
		createMusicChain(e, t) {
			let n = w.nextId(), a = P(e), o = M(), s = {
				master: se(`${n}:master`),
				muffle: se(`${n}:muffle`),
				host: se(`${n}:host`)
			}, c = Y(E, `${n}:cue`, "line", 1), l = Y(E, `${n}:pause`, "line", 1), u = Y(E, `${n}:hidden`, "line", 1), d = !1, f = q(E, () => {
				let e = o.mix.get();
				for (let t of Object.values(s)) t.active && (e = t.apply(e));
				return Fo(e, W.mul(c.get(), l.get(), u.get()));
			});
			a.add(f);
			let p = t ?? r;
			return {
				input: N(o),
				setLowpass(e, t, n, r) {
					if (d) return;
					let a = s[e], o = t >= dl && Math.abs(n - fl) < 1e-6;
					if (o && (!a.active || a.removal !== null)) return;
					!o && a.removal && (a.removal(), a.removal = null);
					let c = w.immediate(), l = Math.max(pl, r);
					if (!a.active) {
						a.active = !0;
						for (let [e, t] of [[a.frequency, dl], [a.q, fl]]) e.timeline.cancelFrom(0), e.timeline.setAt(t, c);
						f.invalidate();
					}
					a.frequency.timeline.rampTo(Math.min(dl, t), l, c), a.q.timeline.rampTo(n, l, c), a.frequency.changed(), a.q.changed(), o && (a.removal = i(() => {
						a.removal = null;
						try {
							a.active = !1, f.invalidate();
						} catch (e) {
							p("The music filter could not step aside.", e);
						}
					}, l + .05));
				},
				cue: Sl(c),
				pause: Sl(l),
				hidden: Sl(u),
				dispose() {
					if (!d) {
						d = !0;
						for (let e of Object.values(s)) e.removal?.();
						a.remove(f);
					}
				}
			};
		},
		dispose() {
			a = !0, O && t.off?.("meter", A), d?.(), d = null, x?.(), x = null;
		}
	};
}
//#endregion
//#region src/song/tempo.ts
function wl(e) {
	return e.glideTo === void 0 ? 0 : (e.glideTo - e.bpm) * 960 / (e.endTick - e.tick);
}
function Tl(e, t) {
	let n = t / 960, r = wl(e);
	return r === 0 ? 60 * n / e.bpm : 60 * Math.log1p(r * n / e.bpm) / r;
}
function El(e, t) {
	let n = wl(e);
	return (n === 0 ? t * e.bpm / 60 : e.bpm * Math.expm1(n * t / 60) / n) * 960;
}
function Dl(e, t, n) {
	let r = 0, i = e.length - 1;
	for (; r < i;) {
		let a = r + i + 1 >> 1;
		n(e[a]) <= t ? r = a : i = a - 1;
	}
	return r;
}
function Ol(e, t) {
	let n = [{
		tick: 0,
		bpm: e,
		glide: !1
	}];
	for (let e of t) {
		let t = n[n.length - 1];
		e.tick === t.tick ? n[n.length - 1] = {
			tick: t.tick,
			bpm: e.bpm,
			glide: e.glide === !0
		} : e.tick > t.tick && n.push({
			tick: e.tick,
			bpm: e.bpm,
			glide: e.glide === !0
		});
	}
	let r = [], i = 0, a = e;
	for (let e = 0; e < n.length; e++) {
		let t = n[e], o = n[e + 1], s = {
			tick: t.tick,
			bpm: t.bpm,
			endTick: o?.tick ?? Infinity,
			seconds: i
		};
		t.glide && o && (s.glideTo = o.bpm), r.push(s), a = Math.max(a, t.bpm), o && (i += Tl(s, o.tick - t.tick));
	}
	let o = (e) => r[Dl(r, e, (e) => e.tick)], s = (e) => {
		let t = o(e);
		return t.seconds + Tl(t, e - t.tick);
	};
	return {
		segments: r,
		fastestBpm: a,
		bpmAt(e) {
			let t = o(e);
			return t.glideTo === void 0 || e <= t.tick ? t.bpm : t.bpm + wl(t) * (e - t.tick) / 960;
		},
		secondsAt: s,
		secondsBetween: (e, t) => s(t) - s(e),
		tickAtSeconds(e) {
			let t = r[Dl(r, e, (e) => e.seconds)], n = t.tick + El(t, e - t.seconds);
			return Math.min(n, t.endTick);
		},
		changeAt: o
	};
}
var kl = /* @__PURE__ */ new WeakMap(), Al = null;
function jl(e) {
	let t = e.tempoChanges;
	if (!t || t.length === 0) return Al?.segments[0].bpm !== e.bpm && (Al = Ol(e.bpm, [])), Al;
	let n = kl.get(t);
	return n?.segments[0].bpm !== e.bpm && (n = Ol(e.bpm, t), kl.set(t, n)), n;
}
//#endregion
//#region src/song/meter.ts
function Ml(e, t, n) {
	let r = 0, i = e.length - 1;
	for (; r < i;) {
		let a = r + i + 1 >> 1;
		n(e[a]) <= t ? r = a : i = a - 1;
	}
	return r;
}
function Nl(e, t) {
	let n = [{
		tick: 0,
		meter: {
			beats: e.beats,
			unit: e.unit
		}
	}];
	for (let e of t) {
		let t = n[n.length - 1], r = {
			beats: e.beats,
			unit: e.unit
		};
		e.tick === t.tick ? n[n.length - 1] = {
			tick: t.tick,
			meter: r
		} : e.tick > t.tick && n.push({
			tick: e.tick,
			meter: r
		});
	}
	let r = [], i = 1;
	for (let e = 0; e < n.length; e++) {
		let { tick: t, meter: a } = n[e], o = n[e + 1]?.tick ?? Infinity, s = Ha(a);
		r.push({
			tick: t,
			meter: a,
			barTicks: s,
			beatTicks: Va(a),
			bar: i,
			endTick: o
		}), o !== Infinity && (i += Math.ceil((o - t) / s));
	}
	let a = (e) => r[Ml(r, e, (e) => e.tick)], o = (e, t) => {
		let n = Math.max(0, e), r = a(n), i = r.tick + Math.ceil((n - r.tick) / t(r)) * t(r);
		return Math.min(i, r.endTick);
	}, s = (e) => o(e, (e) => e.barTicks);
	return {
		segments: r,
		segmentAt: a,
		meterAt: (e) => a(e).meter,
		barAt(e) {
			let t = Math.max(0, Number.isFinite(e) ? e : 0), n = a(t), r = Math.floor((t - n.tick) / n.barTicks), i = t - n.tick - r * n.barTicks, o = Math.min(n.meter.beats - 1, Math.floor(i / n.beatTicks));
			return {
				bar: n.bar + r,
				beat: o + 1,
				fraction: (i - o * n.beatTicks) / n.beatTicks
			};
		},
		barStart(e) {
			let t = Math.max(1, Math.floor(e)), n = r[Ml(r, t, (e) => e.bar)];
			return n.tick + (t - n.bar) * n.barTicks;
		},
		barLineAtOrAfter: s,
		beatLineAtOrAfter: (e) => o(e, (e) => e.beatTicks),
		barLines(e, t) {
			let n = [];
			if (!Number.isFinite(e) || !Number.isFinite(t)) return n;
			let i = s(e), a = Ml(r, i, (e) => e.tick), o = r[a], c = o.bar + Math.round((i - o.tick) / o.barTicks);
			for (; i < t;) {
				n.push({
					tick: i,
					bar: c,
					meter: o.meter
				});
				let e = Math.min(i + o.barTicks, o.endTick);
				if (e <= i) break;
				i = e, c++, i === o.endTick && (o = r[++a]);
			}
			return n;
		},
		beatTicksAt: (e) => a(e).beatTicks,
		barTicksAt: (e) => a(e).barTicks
	};
}
var Pl = /* @__PURE__ */ new WeakMap(), Fl = null, Il = (e, t) => e.beats === t.beats && e.unit === t.unit;
function Ll(e) {
	let t = e.meterChanges;
	if (!t || t.length === 0) return (!Fl || !Il(Fl.segments[0].meter, e.timeSignature)) && (Fl = Nl(e.timeSignature, [])), Fl;
	let n = Pl.get(t);
	return (!n || !Il(n.segments[0].meter, e.timeSignature)) && (n = Nl(e.timeSignature, t), Pl.set(t, n)), n;
}
//#endregion
//#region src/song/overrides.ts
var Rl = {
	hz: xa.hz,
	depth: xa.depth
};
function zl(e) {
	if (typeof e != "string") return null;
	if (e.startsWith("lfo:")) {
		let t = e.indexOf(":", 4), n = e.slice(4, t), r = e.slice(t + 1);
		return t > 4 && (r === "hz" || r === "depth") ? {
			kind: "lfo",
			lfoId: n,
			path: r
		} : null;
	}
	return Ea(e);
}
function Bl(e, t) {
	return t.kind === "layer" ? e.layers[t.layer] : void 0;
}
function Vl(e, t) {
	return t.kind === "fx" ? e.effects?.find((e) => e.id === t.effectId) : void 0;
}
function Hl(e, t) {
	return t.kind === "lfo" ? e.lfos?.find((e) => e.id === t.lfoId) : void 0;
}
function Ul(e, t) {
	let n = zl(t);
	if (!n) return null;
	if (n.kind === "layer") {
		let t = Bl(e, n);
		return t ? n.path === "volume" ? Ca : Bi(t.voiceType, n.path) ?? null : null;
	}
	if (n.kind === "fx") {
		let t = Vl(e, n);
		return t ? fa(t.type, n.path) ?? null : null;
	}
	return Hl(e, n) ? Rl[n.path] : null;
}
function Wl(e, t) {
	let n = Ul(e, t), r = zl(t);
	if (n) {
		if (r.kind === "layer") {
			let t = Bl(e, r);
			return (r.path === "volume" ? t.volume : t.params[r.path]) ?? n.default;
		}
		return r.kind === "fx" ? Vl(e, r).params[r.path] ?? n.default : Hl(e, r)[r.path];
	}
}
function Gl(e, t, n) {
	let r = Ul(e, t);
	return r ? Hi(r, n) : void 0;
}
function Kl(e, t, n) {
	let r = Gl(e, t, n);
	if (r === void 0 || Wl(e, t) === r) return e;
	let i = zl(t);
	if (i.kind === "layer") {
		let t = e.layers.map((e, t) => t === i.layer ? i.path === "volume" ? {
			...e,
			volume: r
		} : {
			...e,
			params: {
				...e.params,
				[i.path]: r
			}
		} : e);
		return {
			...e,
			layers: t
		};
	}
	if (i.kind === "fx") {
		let t = e.effects.map((e) => e.id === i.effectId ? {
			...e,
			params: {
				...e.params,
				[i.path]: r
			}
		} : e);
		return {
			...e,
			effects: t
		};
	}
	return {
		...e,
		lfos: e.lfos.map((e) => e.id === i.lfoId ? {
			...e,
			[i.path]: r
		} : e)
	};
}
function ql(e, t) {
	if (!t) return e;
	let n = e;
	for (let [e, r] of Object.entries(t)) n = Kl(n, e, r);
	return n;
}
function Jl(e, t) {
	return ql(e, t?.overrides?.[e.id]);
}
function Yl(e, t) {
	let n = new Set(e.tracks.map((e) => e.instrumentId)), r = t.filter((e) => n.has(e.id)).map((t) => Jl(t, e));
	if (!e.overrides) return {
		song: e,
		instruments: r
	};
	let { overrides: i, ...a } = e;
	return {
		song: a,
		instruments: r
	};
}
function Xl(e) {
	return typeof e == "string" || typeof e == "boolean" || typeof e == "number" && Number.isFinite(e);
}
function Zl(e, t, n, r) {
	if (e === void 0) return null;
	if (typeof e != "object" || !e || Array.isArray(e)) return n(`${r} had unreadable instrument overrides, so they were dropped.`), null;
	let i = {}, a = 0;
	for (let n of Object.keys(e).slice(0, 256)) {
		let r = e[n];
		if (!t.has(n) || typeof r != "object" || !r || Array.isArray(r)) {
			a++;
			continue;
		}
		if (Object.keys(i).length >= 64) break;
		let o = {}, s = 0;
		for (let e of Object.keys(r).slice(0, 1024)) {
			if (s >= 256) break;
			let t = r[e];
			if (!zl(e) || !Xl(t)) {
				a++;
				continue;
			}
			o[e] = t, s++;
		}
		s > 0 && (i[n] = o);
	}
	return a > 0 && n(`${r}: dropped overrides for instruments or knobs it no longer has.`), Object.keys(i).length > 0 ? i : null;
}
//#endregion
//#region src/song/swing.ts
var Ql = [{
	step: "1/16",
	ticks: 240,
	label: "16ths"
}, {
	step: "1/8",
	ticks: 480,
	label: "8ths"
}], $l = "1/16";
function eu(e) {
	return Ql.some((t) => t.step === e);
}
function tu(e) {
	return Ql.find((t) => t.step === e)?.ticks ?? 240;
}
function nu(e, t, n) {
	let r = n * 2, i = Math.floor(e / r), a = e - i * r, o = n + t * n / 2;
	return i * r + (a <= n ? a * o / n : o + (a - n) * (r - o) / n);
}
var ru = /* @__PURE__ */ new WeakMap();
function iu(e, t) {
	let n = t.swing;
	if (!n || !(n.amount > 0) || e.length === 0) return e;
	let r = t.startTick ?? 0, i = tu(n.step), a = `${r}:${t.lengthTicks}:${n.amount}:${i}`, o = ru.get(t);
	if (o && o.notes === e && o.key === a) return o.out;
	let s = e.map((e) => {
		if (!(e.tick >= 0 && e.tick < t.lengthTicks)) return e;
		let a = Math.round(nu(r + e.tick, n.amount, i)) - r, o = Math.round(nu(r + e.tick + e.durationTicks, n.amount, i)) - r, s = Math.min(a, t.lengthTicks - 1);
		return {
			...e,
			tick: s,
			durationTicks: Math.max(1, o - s)
		};
	});
	return ru.set(t, {
		notes: e,
		key: a,
		out: s
	}), s;
}
function au(e) {
	return e.tracks.some((e) => e.clips.some((e) => e.swing)) ? {
		...e,
		tracks: e.tracks.map((e) => e.clips.some((e) => e.swing) ? {
			...e,
			clips: e.clips.map((e) => {
				if (!e.swing) return e;
				let { swing: t, poolId: n, ...r } = e;
				return {
					...r,
					notes: iu(e.notes, e)
				};
			})
		} : e)
	} : e;
}
function ou(e) {
	if (typeof e != "object" || !e) return null;
	let t = e, n = Object.hasOwn(t, "amount") ? t.amount : void 0, r = typeof n == "number" && Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0, i = Object.hasOwn(t, "step") && eu(t.step) ? t.step : $l;
	return r === 0 && i === "1/16" ? null : {
		amount: r,
		step: i
	};
}
//#endregion
//#region src/song/patterns.ts
var su = [
	{
		size: "1/8",
		ticks: 480,
		label: "Eighths"
	},
	{
		size: "1/16",
		ticks: 240,
		label: "Sixteenths"
	},
	{
		size: "1/32",
		ticks: 120,
		label: "Thirty-seconds"
	},
	{
		size: "1/8t",
		ticks: 320,
		label: "Eighth triplets"
	},
	{
		size: "1/16t",
		ticks: 160,
		label: "Sixteenth triplets"
	}
];
function cu(e) {
	return su.some((t) => t.size === e);
}
function lu(e) {
	return su.find((t) => t.size === e)?.ticks ?? 240;
}
function uu(e) {
	return e.length * lu(e.stepSize);
}
function du(e, t) {
	let n = lu(e.stepSize), r = t % 2 == 1 ? Math.round(e.swing * n / 2) : 0;
	return t * n + r;
}
function fu(e) {
	return typeof e.patternId == "string";
}
function pu(e, t) {
	return t === void 0 ? null : e.patterns?.find((e) => e.id === t) ?? null;
}
var mu = /* @__PURE__ */ new WeakMap();
function hu(e, t) {
	let n = mu.get(e);
	n || (n = /* @__PURE__ */ new Map(), mu.set(e, n));
	let r = n.get(t);
	if (r) return n.delete(t), n.set(t, r), r;
	let i = uu(e), a = [];
	if (i > 0 && t > 0) for (let n = 0; n < t; n += i) for (let r of e.rows) for (let o = 0; o < e.length; o++) {
		let s = r.steps[o] ?? 0;
		if (!(s > 0)) continue;
		let c = du(e, o), l = n + c;
		if (l >= t) continue;
		let u = o + 1 < e.length ? du(e, o + 1) : i, d = Math.max(1, Math.min(u - c, t - l));
		a.push({
			tick: l,
			durationTicks: d,
			midi: r.note,
			velocity: Math.min(1, s)
		});
	}
	return a.sort((e, t) => e.tick - t.tick || e.midi - t.midi), n.set(t, a), n.size > 8 && n.delete(n.keys().next().value), a;
}
var gu = [];
function _u(e, t) {
	if (!fu(t)) return iu(t.notes, t);
	let n = pu(e, t.patternId);
	return n ? hu(n, t.lengthTicks) : gu;
}
//#endregion
//#region src/playback/events.ts
function vu(e) {
	return Number.isFinite(e) ? Math.min(1, Math.max(0, e)) : 1;
}
function yu(e, t) {
	let n = [];
	for (let r of e.clips) {
		if (!Number.isFinite(r.startTick) || !(r.lengthTicks > 0)) continue;
		let e = Math.round(r.startTick + r.lengthTicks);
		for (let i of _u(t, r)) {
			if (!Number.isFinite(i.midi) || !(i.durationTicks > 0) || !(i.tick >= 0 && i.tick < r.lengthTicks)) continue;
			let t = Math.round(r.startTick + i.tick), a = Math.min(Math.round(r.startTick + i.tick + i.durationTicks), e);
			t < 0 || a <= t || n.push({
				start: t,
				end: a,
				midi: i.midi,
				velocity: vu(i.velocity)
			});
		}
	}
	return n;
}
function bu(e) {
	e.sort((e, t) => e.start - t.start || e.midi - t.midi || t.end - e.end);
	let t = /* @__PURE__ */ new Map(), n = [];
	for (let r of e) {
		let e = t.get(r.midi);
		if (e && e.end > r.start) {
			if (e.start === r.start) {
				e.end = Math.max(e.end, r.end), e.velocity = Math.max(e.velocity, r.velocity);
				continue;
			}
			e.end = r.start;
		}
		t.set(r.midi, r), n.push(r);
	}
	return n;
}
function xu(e, t = {}) {
	let n = [];
	for (let r of bu(yu(e, t))) n.push({
		tick: r.start,
		kind: "on",
		midi: r.midi,
		velocity: r.velocity
	}), n.push({
		tick: r.end,
		kind: "off",
		midi: r.midi,
		velocity: 0
	});
	let r = (e) => e.kind === "off" ? 0 : 1;
	return n.sort((e, t) => e.tick - t.tick || r(e) - r(t) || e.midi - t.midi);
}
function Su(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) {
		let e = t.get(n.tick);
		e || (e = {
			offs: [],
			ons: []
		}, t.set(n.tick, e)), n.kind === "off" ? e.offs.push(n.midi) : e.ons.push({
			midi: n.midi,
			velocity: n.velocity
		});
	}
	return t;
}
function Cu(e) {
	let t = /* @__PURE__ */ new Map(), n = 0;
	for (let r of [...e.keys()].sort((e, t) => e - t)) {
		let i = e.get(r).ons;
		if (i.length === 0) continue;
		let a = /* @__PURE__ */ new Map();
		for (let e of [...new Set(i.map((e) => e.midi))].sort((e, t) => e - t)) a.set(e, n++);
		t.set(r, a);
	}
	return t;
}
//#endregion
//#region src/playback/conductor.ts
function wu(e, t) {
	let n = null, r = null, i = [], a = /* @__PURE__ */ new Set(), o = null, s = !1, c = null, l = null, u = 0, d = () => o === null || !n ? 1 : o / n.bpm, f = (e) => o === null || !n ? e : e === n.bpm ? o : e * (o / n.bpm), p = (n, r) => {
		n !== c && (e.setTempoAt(n, r), c = n, u++, t());
	}, m = (n, r, i, a) => {
		e.rampTempo(n, r, i, a), c = null, u++, t();
	}, h = (e, t) => {
		if (s || !r) return;
		l = {
			tick: e,
			time: t
		}, p(f(r.bpmAt(e)), t);
		let n = r.changeAt(e);
		n.glideTo !== void 0 && e < n.endTick && m(f(n.glideTo), r.secondsBetween(e, n.endTick) / d(), t, "exponential");
	};
	return {
		get revision() {
			return u;
		},
		get ticks() {
			return i;
		},
		rate: d,
		load(e) {
			let t = !n || !e || e.id !== n.id || e.bpm !== n.bpm || e.tempoChanges !== n.tempoChanges;
			return n = e, t ? (r = e && Number.isFinite(e.bpm) && e.bpm > 0 ? jl(e) : null, i = r ? r.segments.slice(1).map((e) => e.tick) : [], a = new Set(i), o = null, l = null, !0) : !1;
		},
		reach(e, t) {
			!a.has(e) || l?.tick === e && l.time === t || h(e, t);
		},
		relocate(e, t) {
			i.length > 0 && h(e, t);
		},
		assert: h,
		setRule(t, n, i, a = 0) {
			if (o = t !== null && Number.isFinite(t) && t > 0 ? t : null, s || !r) return;
			if (a <= 0) return h(n, i);
			m(f(r.bpmAt(n)), a, i, "exponential");
			let c = r.changeAt(n);
			if (c.glideTo === void 0) return;
			let l = i + a;
			for (let t = 0; t < 2; t++) m(f(r.bpmAt(e.ticksAt(l))), a, i, "exponential");
			let u = e.ticksAt(l);
			u < c.endTick && m(f(c.glideTo), r.secondsBetween(u, c.endTick) / d(), l, "exponential");
		},
		slump(e, t, n) {
			s = !0, m(e, t, n, "linear");
		},
		release(t, n) {
			s = !1, e.cancelTempo(n), c = null, o = null, h(t, n);
		}
	};
}
//#endregion
//#region src/playback/patch-sync.ts
function Tu(e, t) {
	if (e.kit === t.kit) return !0;
	let n = e.kit?.pads, r = t.kit?.pads;
	return !n || !r || n.length !== r.length ? !1 : n.every((e, t) => {
		let n = r[t];
		return e.note === n.note && e.pitch === n.pitch && e.choke === n.choke && e.layers.length === n.layers.length && e.layers.every((e, t) => e === n.layers[t]);
	});
}
function Eu(e, t) {
	return e.id === t.id && Tu(e, t) && e.layers.length === t.layers.length && e.layers.every((e, n) => {
		let r = t.layers[n];
		return e.voiceType === r.voiceType && e.polyphony === r.polyphony;
	});
}
function Du(e, t, n) {
	let r = null, i = null, a = !1, o, s = (e, t) => {
		n ? n(e, t) : console.error(e, t);
	}, c = () => {
		let e = r;
		r = null;
		try {
			e?.handle.dispose();
		} catch (e) {
			s("An instrument could not be shut down cleanly.", e);
		}
	}, l = (e, t) => {
		let n = e.patch;
		e.patch = t;
		try {
			t.layers.forEach((t, r) => {
				let i = n.layers[r];
				if (t !== i) {
					t.volume !== i.volume && e.handle.setLayerVolume(r, t.volume);
					for (let [n, a] of Object.entries(t.params)) a !== i.params[n] && e.handle.setParam(r, n, a);
				}
			}), t.effects !== n.effects && e.handle.setEffects(t.effects ?? []), t.lfos !== n.lfos && e.handle.setLfos(t.lfos ?? []);
		} catch (e) {
			s(`A change to "${t.name}" could not be applied. Undo it or pick another instrument.`, e);
		}
	};
	return {
		update(n) {
			if (!a) {
				if (!n) {
					i = null, c();
					return;
				}
				if (r && Eu(r.patch, n)) {
					r.patch !== n && l(r, n);
					return;
				}
				if (r || n !== i) {
					c();
					try {
						r = {
							patch: n,
							handle: e.createInstrument(t, n, { bpm: o })
						}, i = null;
					} catch (e) {
						i = n, s(`Could not build "${n.name}". Undo the last change or pick another instrument.`, e);
					}
				}
			}
		},
		handle() {
			return r?.handle ?? null;
		},
		setTempo(e) {
			if (!(a || !Number.isFinite(e) || e <= 0)) {
				o = e;
				try {
					r?.handle.setTempo(e);
				} catch (e) {
					s("An instrument could not follow the tempo.", e);
				}
			}
		},
		dispose() {
			a || (a = !0, i = null, c());
		}
	};
}
//#endregion
//#region src/playback/song-player.ts
var Ou = .5, ku = 1, Au = 4, ju = 4, Mu = .25, Nu = 10, Pu = .25, Fu = 4, Iu = .05, Lu = .05, Ru = /* @__PURE__ */ new WeakMap();
function zu(e) {
	let t = Ru.get(e);
	if (t) return t;
	let n = /* @__PURE__ */ new Map(), r = [];
	for (let t of [...e.keys()].sort((e, t) => e - t)) {
		let { offs: i, ons: a } = e.get(t);
		for (let e of i) {
			let i = n.get(e);
			i !== void 0 && (r.push({
				start: i,
				end: t,
				midi: e
			}), n.delete(e));
		}
		for (let { midi: e } of a) {
			let i = n.get(e);
			i !== void 0 && r.push({
				start: i,
				end: t,
				midi: e
			}), n.set(e, t);
		}
	}
	for (let [e, t] of n) r.push({
		start: t,
		end: Infinity,
		midi: e
	});
	r.sort((e, t) => e.start - t.start);
	let i = Math.max(0, ...r.map((e) => Number.isFinite(e.end) ? e.end - e.start : 0)), a = {
		spans: r,
		starts: r.map((e) => e.start),
		longest: i
	};
	return Ru.set(e, a), a;
}
function Bu(e, t) {
	let n = 0, r = e.length;
	for (; n < r;) {
		let i = n + r >> 1;
		e[i] < t ? n = i + 1 : r = i;
	}
	return n;
}
var Vu = (e, t) => e.t0 + (t - e.k0) / (e.k1 - e.k0) * (e.t1 - e.t0), Hu = /* @__PURE__ */ new WeakMap();
function Uu(e, t, n) {
	let r = Hu.get(e);
	return r || (r = Cu(e), Hu.set(e, r)), r.get(t)?.get(n);
}
var Wu = .02, Gu = .1;
function Ku(e, t) {
	if (t === void 0 || !Number.isFinite(t)) return e;
	let n = Math.max(1, Math.round(t));
	return e.layers.every((e) => e.polyphony <= n) ? e : {
		...e,
		layers: e.layers.map((e) => e.polyphony <= n ? e : {
			...e,
			polyphony: n
		})
	};
}
function qu(e) {
	if (!e.enabled) return null;
	let t = Math.max(0, Math.round(e.startTick)), n = Math.round(e.endTick);
	return Number.isFinite(t) && Number.isFinite(n) && n > t ? {
		start: t,
		end: n
	} : null;
}
function Ju(e, t) {
	return e.enabled === t.enabled && e.startTick === t.startTick && e.endTick === t.endTick;
}
function Yu(e) {
	return Number.isFinite(e) ? Math.max(0, Math.round(e)) : 0;
}
function Xu(e, t = {}) {
	let n = t.transport === void 0, r = t.transport ?? e.createTransport(), i = t.destination ?? e.destination, a = (e, n) => {
		try {
			t.onError ? t.onError(e, n) : console.error(e, n);
		} catch {}
	}, o = null, s = null, c = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map(), u = 0, d = /* @__PURE__ */ new Map(), f = 0, p = "stopped", m = 0, h = 0, g = !1, _ = !1, v = !1, y = 0, b = /* @__PURE__ */ new Set(), x = /* @__PURE__ */ new Map(), S = 0, C = /* @__PURE__ */ new Map(), w = 0, T = () => {
		for (let e of [...b]) try {
			e(p);
		} catch (e) {
			a("A playback listener failed.", e);
		}
	}, E = (e) => {
		p !== e && (p = e, T());
	}, D = (e) => {
		_ || (_ = !0, a("An instrument failed while playing. Some notes may be missing.", e));
	}, O = !1, k = (e) => {
		O || (O = !0, a("A game rule could not be applied.", e));
	}, A = (e, t, n) => {
		let i = r.immediate();
		n !== null && (e.fadeEnd = n > 0 ? i + n : 0), e.gainTarget = t, e.channel.gain.rampTo(t, Math.max(Wu, n ?? e.fadeEnd - i), i);
	}, j = () => {
		let e = r.tempo();
		if (!(e === u || !Number.isFinite(e) || e <= 0)) {
			u = e;
			for (let t of c.values()) t.instrument.setTempo(e);
			for (let { channel: t } of l.values()) t.setTempo(e);
		}
	}, M = wu(r, () => j()), N = (e) => {
		y++, e.held.clear();
		try {
			e.instrument.handle()?.releaseAll();
		} catch (e) {
			D(e);
		}
	}, P = (e, t, n) => {
		let r = e.instrument.handle(), i = [...e.held.values()];
		e.held.clear();
		for (let e of i) try {
			r?.noteOff(e, t);
		} catch (e) {
			if (D(e), y !== n) return !1;
		}
		return !0;
	}, ee = () => {
		for (let e of c.values()) N(e);
	}, te = () => {
		r.isRunning() && r.stop(r.now());
	}, F = -Infinity, I = -1, ne = -Infinity, L = -Infinity, re = (e) => {
		F = Math.min(F, e);
	}, ie = (e) => {
		let t = o ? qu(o.loop) : null;
		g = t !== null && e < t.end, r.setLoop(t && g ? {
			startTick: t.start,
			endTick: t.end
		} : null), re(r.now());
	}, ae = (e, t) => {
		let n = o && g ? qu(o.loop) : null, i = [], a = e, s = r.ticksAt(e);
		for (; a < t;) {
			let e = Math.min(t, a + Lu), o = r.ticksAt(e);
			if (o > s) i.push({
				t0: a,
				t1: e,
				k0: s,
				k1: o
			});
			else if (o < s && n) {
				let t = Math.max(0, n.end - s), r = Math.max(0, o - n.start), c = a + (e - a) * (t + r > 0 ? t / (t + r) : 0);
				n.end > s && i.push({
					t0: a,
					t1: c,
					k0: s,
					k1: n.end
				}), o > n.start && i.push({
					t0: c,
					t1: e,
					k0: n.start,
					k1: o
				});
			}
			a = e, s = o;
		}
		return i;
	}, oe = (e, t, n, r, i = !1) => {
		let a = o && g ? qu(o.loop) : null, s = t.at(-1)?.t1 ?? n, c = /* @__PURE__ */ new Map(), l = (e, n) => {
			let r = a && e.start < a.end ? Math.min(e.end, a.end) : e.end;
			for (let i = n; i < t.length; i++) {
				let a = t[i];
				if (i > n && a.k0 <= e.start) break;
				if (r >= a.k0 && r <= a.k1) return Vu(a, r);
			}
			return s;
		};
		for (let a of e) {
			let { spans: e, starts: o, longest: s } = zu(a.table), u = a.pitched ? S : 0, d = [], f = t[0];
			if (i && f) for (let t = Bu(o, f.k0 - s); t < e.length && e[t].start < f.k0; t++) {
				let n = e[t], r = n.midi + u;
				n.end > f.k0 && r >= 0 && r <= 127 && d.push({
					midi: r,
					at: f.t0 - Iu,
					end: l(n, 0)
				});
			}
			t.forEach((t, i) => {
				for (let a = Bu(o, Math.ceil(t.k0)); a < e.length && e[a].start < t.k1; a++) {
					let o = e[a], s = Vu(t, o.start);
					if (s < n) continue;
					let c = o.midi + u;
					if (!(c < 0 || c > 127) && (d.push({
						midi: c,
						at: s,
						end: l(o, i)
					}), r)) break;
				}
			}), d.length > 0 && c.set(a, d);
		}
		return c;
	}, se = () => {
		if (p !== "playing" || !o) return;
		let e = [...c.values()].filter((e) => e.instrument.handle()?.prepare);
		if (e.length === 0) return;
		let t = r.immediate(), n = r.now();
		M.revision !== I && (I = M.revision, re(n));
		for (let t of e) {
			let e = t.instrument.handle();
			(t.plannedFor?.handle !== e || t.plannedFor.table !== t.table) && (t.plannedFor = {
				handle: e,
				table: t.table
			}, re(n));
		}
		let i = Math.max(n - Iu, F), a = t + Ou, s = a + Pu * 3, l = oe(e, ae(t, s + Mu), i, !0), u = Math.min(Infinity, ...[...l.values()].map((e) => Math.min(...e.map((e) => e.at)))), d = null, f = () => d ??= oe(e, ae(t, Math.max(a, u) + Au), t, !1, !0), m = s + Mu;
		if (t - ne >= ju && (u === Infinity || ce(f(), u, m, { dryRun: !0 }) === 0) && (ne = t, u !== Infinity && ce(f(), u, m, { hold: !0 }), e[0].instrument.handle().prepare([], t, { sleep: !0 })), u > s) return;
		if (u > a) {
			le(f(), u);
			return;
		}
		if (t - L < Pu && L + Pu < u - (n - t) - Iu) return;
		let h = [...f().values()].flatMap((e) => e.map((e) => e.at)).sort((e, t) => e - t), g = i;
		for (let e of h) if (!(e < g)) {
			if (e > a) break;
			g = e + ku;
		}
		F = g;
		let _ = g - ku + Au, v = 0;
		for (let [e, t] of f()) {
			let n = t.filter((e) => e.at < _);
			n.length > 0 && (v += e.instrument.handle().prepare(n, g));
		}
		v > 0 && (ne = L = t);
	}, ce = (e, t, n, r = {}) => {
		let i = 0;
		for (let [a, o] of e) {
			let e = o.filter((e) => e.at < t + Au);
			e.length > 0 && (i += a.instrument.handle().prepare(e, n, r));
		}
		return i;
	}, le = (e, t) => {
		let n = r.immediate();
		if (n - L < Pu) return;
		let i = t + ku, a = [...e].map(([e, n]) => {
			let r = n.filter((e) => e.at < t + Au);
			return {
				handle: e.instrument.handle(),
				kept: r,
				voices: e.instrument.handle().prepare(r, i, { dryRun: !0 })
			};
		}), o = a.reduce((e, t) => e + t.voices, 0), s = Math.min(Fu, Math.ceil(o / Nu));
		if (s <= 1 || n < t - Ou - Pu * (s - 1) - Iu) return;
		let c = Nu, l = 0;
		for (let e of a) e.voices === 0 || l > 0 && e.voices > c || (l += e.handle.prepare(e.kept, i), c -= e.voices);
		l > 0 && (ne = L = n);
	}, ue = r.setInterval(() => {
		try {
			se();
		} catch (e) {
			D(e);
		}
	}, Iu), de = () => r.ticksAt(r.now()), fe = null, pe = () => fe ?? (p === "playing" ? de() : p === "paused" ? h : m), me = (e, t) => {
		let n = C.get(e);
		if (!n) return !0;
		C.delete(e);
		let r = w;
		for (let { action: e } of n) {
			try {
				e(t);
			} catch (e) {
				k(e);
			}
			if (r !== w || p !== "playing") return !1;
		}
		return !0;
	}, he = (e, t) => {
		if (p !== "playing") return;
		M.reach(e, t), j();
		let n = fe;
		fe = e;
		let i;
		try {
			i = me(e, t);
		} finally {
			fe = n;
		}
		if (!i) return;
		let a = y, o = t < r.immediate() - Gu;
		for (let n of [...c.values()]) {
			let r = n.table.get(e), i = r && n.instrument.handle();
			if (!r || !i) continue;
			for (let e of r.offs) {
				let r = n.held.get(e);
				if (r !== void 0) {
					n.held.delete(e);
					try {
						i.noteOff(r, t);
					} catch (e) {
						if (D(e), y !== a) return;
					}
				}
			}
			let s = n.pitched ? S : 0;
			for (let { midi: c, velocity: l } of r.ons) try {
				let r = n.held.get(c);
				if (r !== void 0 && (n.held.delete(c), i.noteOff(r, t)), o) continue;
				let a = c + s;
				if (a < 0 || a > 127) continue;
				n.held.set(c, a), i.noteOn(a, l, t, {
					key: e,
					ordinal: Uu(n.table, e, c)
				});
			} catch (e) {
				if (D(e), y !== a) return;
			}
		}
		e === f && !g && _e(t);
	}, ge = (e) => {
		if (C.size === 0) return;
		let t = [...C.values()].flat();
		C.clear();
		for (let { action: n, drop: r, onDrop: i } of t) {
			if (r) {
				try {
					i?.();
				} catch (e) {
					k(e);
				}
				continue;
			}
			try {
				n(e);
			} catch (e) {
				k(e);
			}
		}
	}, _e = (e) => {
		p = "stopped", w++;
		let t = ++y;
		for (let n of [...c.values()]) if (!P(n, e, t)) return;
		try {
			r.stop(e);
		} catch (e) {
			a("The Transport could not be stopped.", e);
		}
		ge(e), T();
	}, ve = r.onLoop((e) => {
		if (p !== "playing") return;
		let t = o && g ? qu(o.loop) : null;
		t && M.relocate(t.start, e);
		let n = y;
		for (let t of [...c.values()]) if (!P(t, e, n)) return;
	}), ye = (e) => {
		let t = o ? qu(o.loop) : null;
		if (!o || (!t || e >= t.end) && e >= f) return !1;
		p === "playing" && ee(), y++, w++, ge(r.immediate()), ie(e);
		let n = r.now();
		return r.isRunning() && r.stop(n), r.start(n, e), M.relocate(e, n), F = -Infinity, _ = !1, !0;
	}, be = () => {
		let e = /* @__PURE__ */ new Set();
		for (let t of c.values()) for (let n of t.table.keys()) e.add(n);
		f > 0 && e.add(f);
		for (let t of C.keys()) e.add(t);
		for (let t of M.ticks) e.add(t);
		for (let [t, n] of d) e.has(t) || (r.clearTick(n), d.delete(t));
		for (let t of e) d.has(t) || d.set(t, r.scheduleTick(t, (e) => he(t, e)));
	}, xe = (e) => e === null ? null : s?.find((t) => t.id === e) ?? null, Se = (e) => {
		let t = x.get(e.id)?.instrumentId;
		return t !== void 0 && xe(t) ? t : e.instrumentId;
	}, Ce = (e) => {
		let t = xe(Se(e.track)), n = e.track.voiceLimit, r = x.get(e.track.id)?.knobs;
		if (t === e.source && n === e.limit && r === e.knobs) return;
		e.source = t, e.limit = n, e.knobs = r, e.pitched = t !== null && !t.kit;
		let i = t ? Ku(t, n) : null;
		if (i && r) for (let [e, t] of Object.entries(r)) i = Kl(i, e, t);
		let a = e.instrument.handle();
		e.instrument.update(i), e.instrument.handle() !== a && e.held.clear();
	}, we = (e) => {
		let t = x.get(e.id);
		if (!t || t.volumeDb === void 0 && t.pan === void 0 && !t.sends) return e;
		let n = { ...e };
		return t.volumeDb !== void 0 && Number.isFinite(t.volumeDb) && (n.volume = t.volumeDb), t.pan !== void 0 && (n.pan = t.pan), t.sends && (n.sends = {
			...e.sends,
			...t.sends
		}), n;
	}, Te = (e) => {
		let t = x.get(e)?.gainScale;
		return t === void 0 || !Number.isFinite(t) ? 1 : Math.min(1, Math.max(0, t));
	}, Ee = (e) => {
		let t = fo(e.map(we));
		for (let [e, n] of t) t.set(e, n * Te(e));
		return t;
	}, De = (e) => {
		let t = x.get(e.id)?.patternId;
		return t !== void 0 && o?.patterns?.some((e) => e.id === t) ? t : void 0;
	}, Oe = (e) => {
		let t = De(e);
		return {
			table: Su(xu(t === void 0 ? e : {
				...e,
				clips: e.clips.map((e) => e.patternId === void 0 ? e : {
					...e,
					patternId: t
				})
			}, o ?? {})),
			swap: t
		};
	}, ke = (t, n) => {
		let o = lo(we(t).pan), s = e.createTrack(i, {
			gain: n,
			pan: o
		}, a), c = Du(e, s.input, a);
		r.tempo() > 0 && c.setTempo(r.tempo());
		let l = {
			track: t,
			channel: s,
			gainTarget: n,
			fadeEnd: 0,
			panTarget: o,
			instrument: c,
			source: null,
			limit: void 0,
			table: /* @__PURE__ */ new Map(),
			held: /* @__PURE__ */ new Map(),
			knobs: void 0,
			pitched: !1,
			patternSwap: void 0,
			plannedFor: null
		};
		return {table: l.table, swap: l.patternSwap} = Oe(t), Ce(l), l;
	}, Ae = (e) => {
		N(e), e.instrument.dispose(), e.channel.dispose();
	}, je = (e) => {
		for (let t of c.values()) t.channel.dropSend(e.channel);
		e.channel.dispose();
	}, Me = () => {
		for (let e of c.values()) Ae(e);
		c.clear();
		for (let e of l.values()) je(e);
		l.clear();
		for (let e of d.values()) r.clearTick(e);
		d.clear(), f = 0;
	}, Ne = (t) => {
		let n = Ba(t), o = new Set(n.map((e) => e.id));
		for (let [e, t] of l) o.has(e) || (je(t), l.delete(e));
		for (let o of n) {
			let n = l.get(o.id);
			if (n) {
				n.bus !== o && n.channel.update(o), n.bus = o;
				continue;
			}
			t.tracks.some((e) => uo(we(e).sends?.[o.id]) > 0) && l.set(o.id, {
				bus: o,
				channel: e.createBus(o, i, r.tempo(), a)
			});
		}
	}, Pe = (e, t) => {
		let n = lo(t.pan);
		n !== e.panTarget && (e.panTarget = n, e.channel.pan.rampTo(n, Wu, r.immediate()));
		for (let [n, i] of l) e.channel.setSend(i.channel, uo(t.sends?.[n]), Wu, r.immediate());
	}, Fe = () => {
		p = "stopped", y++, w++, ee(), te(), ge(r.immediate()), T();
	}, Ie = (e) => {
		if (p !== "playing" || e.held.size === 0) {
			N(e);
			return;
		}
		let t = de(), n = /* @__PURE__ */ new Set();
		for (let [r, i] of e.table) if (r >= t || g) for (let e of i.offs) n.add(e);
		let i = r.immediate(), a = e.instrument.handle();
		for (let [t, r] of [...e.held]) if (!n.has(t)) {
			e.held.delete(t);
			try {
				a?.noteOff(r, i);
			} catch (e) {
				D(e);
			}
		}
	}, Le = (e, t) => {
		let n = o, i = t !== s;
		if (s = t, (!e || !n || e.id !== n.id) && (p !== "stopped" && Fe(), ge(r.immediate()), Me(), O = !1, m = 0, h = 0), o = e, !e) return;
		let a = M.ticks;
		if (M.load(e) && M.assert(pe(), r.immediate()), !n || n.timeSignature !== e.timeSignature) {
			let { beats: t, unit: n } = e.timeSignature;
			t > 0 && n > 0 && r.setTimeSignature(t, n);
		}
		let l = Ee(e.tracks), u = !1, d = /* @__PURE__ */ new Set();
		for (let t of e.tracks) {
			if (d.has(t.id)) continue;
			d.add(t.id);
			let r = c.get(t.id);
			if (!r) {
				c.set(t.id, ke(t, l.get(t.id) ?? 0)), u = !0;
				continue;
			}
			let a = n !== null && n.patterns !== e.patterns && t.clips.some(fu), o = t.clips !== r.track.clips || a, s = i || t.instrumentId !== r.track.instrumentId || t.voiceLimit !== r.track.voiceLimit;
			r.track = t, o && ({table: r.table, swap: r.patternSwap} = Oe(t), Ie(r), u = !0), s && Ce(r);
		}
		for (let [e, t] of c) d.has(e) || (Ae(t), c.delete(e), u = !0);
		Ne(e);
		for (let [e, t] of c) {
			Pe(t, we(t.track));
			let n = l.get(e) ?? 0;
			n !== t.gainTarget && A(t, n, null);
		}
		j();
		let _ = Yu(Wa(e));
		_ !== f && (f = _, u = !0), M.ticks !== a && (u = !0), u && be(), p === "playing" && (n && !Ju(n.loop, e.loop) && ie(de()), !g && de() >= f && Fe());
	}, Re = () => r.ticksAt(r.immediate());
	return {
		setSong(e, t) {
			if (!(v || e === o && t === s)) try {
				Le(e, t);
			} catch (e) {
				a("The song could not be loaded for playback.", e);
			}
		},
		play() {
			if (!(v || p === "playing") && (j(), ye(p === "paused" ? h : m))) {
				E("playing");
				try {
					se();
				} catch (e) {
					D(e);
				}
			}
		},
		pause() {
			v || p !== "playing" || (h = Yu(Re()), p = "paused", y++, w++, ee(), te(), ge(r.immediate()), T());
		},
		stop() {
			v || p === "stopped" || Fe();
		},
		seek(e) {
			v || (m = Yu(e), h = m, p === "playing" && (ye(m) || Fe()));
		},
		getCursorTick: () => m,
		getPositionTicks() {
			return p === "playing" ? Re() : p === "paused" ? h : m;
		},
		getState: () => p,
		voiceStats() {
			let e = {};
			for (let [t, n] of c) e[t] = n.instrument.handle()?.voiceStats() ?? {
				active: 0,
				steals: 0
			};
			return e;
		},
		refreshTempo() {
			v || j();
		},
		setTempoRule(e, t = {}) {
			v || M.setRule(e, pe(), t.time ?? r.immediate(), t.glideSeconds ?? 0);
		},
		tempoRate: () => M.rate(),
		slumpTempo(e, t, n) {
			v || M.slump(e, t, n);
		},
		releaseTempo() {
			v || M.release(pe(), r.immediate());
		},
		setTrackControl(e, t) {
			if (v) return;
			let n = x.get(e);
			t ? x.set(e, t) : x.delete(e);
			let r = c.get(e);
			if (r && o) try {
				(n?.instrumentId !== t?.instrumentId || n?.knobs !== t?.knobs) && Ce(r), De(r.track) !== r.patternSwap && ({table: r.table, swap: r.patternSwap} = Oe(r.track), Ie(r), be()), (n?.pan !== t?.pan || n?.sends !== t?.sends || n?.volumeDb !== t?.volumeDb) && (Ne(o), Pe(r, we(r.track)));
				let i = Ee(o.tracks).get(e) ?? 0;
				if (i !== r.gainTarget) {
					let e = (n?.gainScale ?? 1) !== (t?.gainScale ?? 1), a = t?.gainSeconds ?? n?.gainSeconds ?? 0;
					A(r, i, e ? Number.isFinite(a) ? a : 0 : null);
				}
			} catch (e) {
				k(e);
			}
		},
		setTranspose(e) {
			Number.isFinite(e) && (S = Math.max(-48, Math.min(48, Math.round(e))));
		},
		atBoundary(e, t, n = {}) {
			let i = {
				tick: null,
				cancel: () => {}
			};
			if (v) return i;
			if (p !== "playing" || e === "now" || !o) return t(p === "playing" ? r.now() : r.immediate()), i;
			let a = Ll(o), s = e === "beat" ? a.beatLineAtOrAfter : a.barLineAtOrAfter, c = s(Math.floor(Math.max(0, de())) + 1), l = qu(o.loop);
			if (g && l && c >= l.end) {
				let e = s(l.start);
				c = e < l.end ? e : l.start;
			}
			let u = {
				action: t,
				drop: n.drop === !0,
				onDrop: n.onDrop
			};
			return C.set(c, [...C.get(c) ?? [], u]), be(), {
				tick: c,
				cancel: () => {
					let e = C.get(c);
					if (!e?.includes(u)) return;
					let t = e.filter((e) => e !== u);
					t.length > 0 ? C.set(c, t) : C.delete(c);
				}
			};
		},
		jumpAt(e, t) {
			if (v) return;
			let n = Yu(e);
			if (p !== "playing" || !o) {
				m = n, h = n;
				return;
			}
			let i = qu(o.loop);
			if ((!i || n >= i.end) && n >= f) {
				_e(t);
				return;
			}
			w++;
			let a = ++y;
			for (let e of [...c.values()]) if (!P(e, t, a)) return;
			ie(n), M.relocate(n, t), r.relocate(t, n), re(t);
		},
		stopAt(e) {
			!v && p === "playing" && _e(e);
		},
		bendPitch(e, t, n) {
			if (!v) for (let r of c.values()) try {
				r.instrument.handle()?.bendPitch?.(e, t, n);
			} catch (e) {
				D(e);
			}
		},
		meterPeaks() {
			let e = {
				tracks: {},
				buses: {}
			};
			for (let [t, n] of c) {
				let r = n.channel.readPeak();
				r !== null && (e.tracks[t] = r);
			}
			for (let [t, n] of l) {
				let r = n.channel.readPeak();
				r !== null && (e.buses[t] = r);
			}
			return e;
		},
		subscribe(e) {
			return b.add(e), () => void b.delete(e);
		},
		dispose() {
			v || (p !== "stopped" && Fe(), v = !0, Me(), ve(), r.clearInterval(ue), r.setLoop(null), n && r.dispose(), b.clear(), o = null, s = null);
		}
	};
}
//#endregion
//#region src/playback/game-runtime.ts
var Zu = 20, Qu = 400, $u = -60, ed = 1 / 30, td = Tr.frequency.max, nd = Tr.Q.default, rd = .1, id = .05, ad = .005, od = .02, sd = .7, cd = 1e-4, ld = "A game rule could not be applied.";
function ud() {
	let e = globalThis.document;
	return e && typeof e.addEventListener == "function" && typeof e.removeEventListener == "function" ? e : null;
}
function dd(e, t) {
	return e === void 0 || t === void 0 ? e === t : Math.abs(e - t) <= cd * Math.max(1, Math.abs(e), Math.abs(t));
}
function fd(e, t) {
	if (!e || !t) return e === t;
	let n = Object.keys(e);
	return n.length === Object.keys(t).length && n.every((n) => Object.hasOwn(t, n) && dd(e[n], t[n]));
}
function pd(e, t) {
	return !e || !t ? e === t : dd(e.gainScale, t.gainScale) && dd(e.volumeDb, t.volumeDb) && dd(e.pan, t.pan) && fd(e.sends, t.sends) && fd(e.knobs, t.knobs) && e.instrumentId === t.instrumentId && e.patternId === t.patternId;
}
function md(e, t, n, r) {
	let i = Math.min(1, Math.max(0, t));
	if (e === "track:volume") return $u + i * 72;
	if (e === "track:pan") return lo(i * 2 - 1);
	if (e.startsWith("track:send:")) return r.has(e.slice(11)) ? uo(i) : null;
	let a = n ? Da(n, e) : null;
	return a && !a.rebuild ? zi(a, i) : null;
}
function hd(e = 12) {
	return Array.from({ length: e }, (t, n) => 1200 * Math.log2(1 - .98 * ((n + 1) / e)));
}
function gd(e, t = {}) {
	let n = t.transport === void 0, r = t.transport ?? e.createTransport(), i = (e, n) => {
		try {
			t.onError ? t.onError(e, n) : console.error(e, n);
		} catch {}
	}, a = e.createMusicChain(t.destination ?? e.destination, i), { cue: o, pause: s, hidden: c } = a, l = !1, u = (e) => {
		l || (l = !0, i(ld, e));
	}, d = Xu(e, {
		onError: (e, t) => e === ld ? u(t) : i(e, t),
		destination: a.input,
		transport: r
	}), f = null, p = [], m = Vr({}), h = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ new Map(), _ = /* @__PURE__ */ new Map(), v = !1, y = null, b = 0, x = null, S = 0, C = null, w = /* @__PURE__ */ new Map(), T = /* @__PURE__ */ new Map(), E = /* @__PURE__ */ new Map(), D = /* @__PURE__ */ new Map(), O = /* @__PURE__ */ new Map(), k = null, A = !1, j = null, M = null, N = null, P = !1, ee = (e) => g.get(e) ?? h.get(e), te = (e) => e.tick === null ? null : e, F = () => r.immediate(), I = (e, t, n, r = F()) => {
		e.rampTo(t, Math.max(ad, n), r);
	}, ne = (e) => {
		e !== null && r.clearTimeout(e);
	}, L = () => d.getState() === "playing", re = (e) => h.get(e)?.value ?? null, ie = () => {
		let e = m.tempo, t = e ? re(e.dialId) : null, n = e && t !== null ? Wr(e.points, t) : null;
		if (!e || n === null) {
			x?.cancel(), x = null, y !== null && f && Number.isFinite(f.bpm) && d.setTempoRule(null), y = null;
			return;
		}
		let i = Math.min(Qu, Math.max(Zu, n));
		if (b = i, y === null || !dd(y, i) || x) {
			if (e.landing === "now" || !L()) {
				x?.cancel(), x = null, y = i, d.setTempoRule(i);
				return;
			}
			x || y !== null && dd(y, i) || (y = i, x = te(d.atBoundary("bar", (e) => {
				x = null;
				let t = b;
				y = t;
				let n = m.tempo ? m.tempo.glideBeats * 60 / Math.max(Zu, r.tempo()) : 0;
				d.setTempoRule(t, {
					time: e,
					glideSeconds: Math.max(ad, n)
				});
			})));
		}
	}, ae = () => {
		let e = m.transpose, t = e ? re(e.dialId) : null, n = e && t !== null ? Wr(e.points, t) : null, r = n === null ? 0 : Math.max(-24, Math.min(24, Math.round(n)));
		r !== S && (S = r, C?.cancel(), C = te(d.atBoundary("bar", () => {
			C = null, d.setTranspose(S);
		})));
	}, oe = (e) => e ? p.find((t) => t.id === e) ?? null : null, se = (e) => {
		let t = {};
		for (let n of m.swaps) n.trackId === e && T.get(n.id) === !0 && (n.kind === "instrument" ? t.instrumentId = n.to : t.patternId = n.to);
		return t;
	}, ce = () => {
		if (f) {
			for (let e of m.swaps) {
				let t = h.get(e.dialId);
				t && T.set(e.id, Gr(t.value, e.threshold, t.dial.cushion, T.get(e.id) ?? null));
			}
			for (let e of f.tracks) {
				let t = se(e.id), n = E.get(e.id) ?? {};
				if (t.instrumentId === n.instrumentId && t.patternId === n.patternId) {
					D.get(e.id)?.cancel(), D.delete(e.id);
					continue;
				}
				if (D.has(e.id)) continue;
				let r = e.id, i = te(d.atBoundary("bar", () => {
					D.delete(r), E.set(r, se(r)), le();
				}));
				i && D.set(r, i);
			}
		}
	}, le = (e) => {
		if (!f) return;
		let t = new Set(Ba(f).map((e) => e.id)), n = /* @__PURE__ */ new Map(), r = (e) => {
			let t = n.get(e.id);
			return t || n.set(e.id, t = {}), t;
		}, i = new Map(f.tracks.map((e) => [e.id, e]));
		for (let [e, t] of E) {
			let n = i.get(e);
			n && (t.instrumentId !== void 0 && (r(n).instrumentId = t.instrumentId), t.patternId !== void 0 && (r(n).patternId = t.patternId));
		}
		for (let t of m.layers) {
			let n = i.get(t.trackId), a = h.get(t.dialId);
			if (!n || !a) continue;
			let o = w.get(t.id) ?? null, s = Gr(a.value, t.threshold, a.dial.cushion, o);
			w.set(t.id, s);
			let c = r(n);
			c.gainScale = (c.gainScale ?? 1) * +!!s, c.gainSeconds = Math.max(c.gainSeconds ?? 0, e ?? t.fadeSeconds);
		}
		let o = { ...Or(f) };
		for (let e of m.links) {
			let n = re(e.dialId), a = n === null ? null : Wr(e.points, n);
			if (a === null) continue;
			if (wr(e.target)) {
				let t = e.target === "master:filter.Q" ? "Q" : "frequency";
				o[t] = zi(Tr[t], a);
				continue;
			}
			let s = e.trackId === void 0 ? void 0 : i.get(e.trackId);
			if (!s) continue;
			let c = oe(E.get(s.id)?.instrumentId ?? s.instrumentId), l = md(e.target, a, c, t);
			if (l === null) continue;
			let u = r(s);
			e.target === "track:volume" ? u.volumeDb = l : e.target === "track:pan" ? u.pan = l : e.target.startsWith("track:send:") ? u.sends = {
				...u.sends,
				[e.target.slice(11)]: l
			} : u.knobs = {
				...u.knobs,
				[e.target]: l
			};
		}
		for (let [e, t] of n) pd(O.get(e), t) || (O.set(e, t), d.setTrackControl(e, t));
		for (let e of [...O.keys()]) n.has(e) || (O.delete(e), d.setTrackControl(e, null));
		v || (!k || !dd(k.frequency, o.frequency) || !dd(k.Q, o.Q)) && (k = o, a.setLowpass("master", o.frequency, o.Q, e === 0 ? ad : rd));
	}, ue = (e) => {
		if (f) try {
			ie(), ae(), ce(), le(e);
		} catch (e) {
			u(e);
		}
	}, de = () => {
		if (v) return;
		let e = F();
		for (let t of h.values()) t.value = Kr(t.dial, t.from, t.target, e - t.since);
		ue();
	}, fe = r.setInterval(de, ed), pe = () => {
		x?.cancel(), x = null, y = null, C?.cancel(), C = null;
		for (let e of D.values()) e.cancel();
		D.clear(), w.clear(), T.clear();
	}, me = () => {
		M?.cancel(), M = null, N = null, ge();
	}, he = () => {
		let e = F();
		o.holdAt(e), I(o, 1, ad, e);
	}, ge = () => {
		P && (P = !1, he());
	}, _e = () => j !== null || N !== null && N.action !== "jump", ve = () => {
		me(), ne(j), j = null, f && Number.isFinite(f.bpm) && d.releaseTempo(), y = null;
	}, ye = () => {
		I(o, 1, ad), d.bendPitch([0], 0, F());
	}, be = (e) => {
		A = !1, a.setLowpass("muffle", td, nd, e), I(s, 1, e);
	}, xe = (e) => {
		if (!f) return 0;
		let t = d.getPositionTicks(), { loop: n } = f, i = e < t && n.enabled;
		if (!f.tempoChanges?.length) {
			let a = e - t + (i ? n.endTick - n.startTick : 0);
			return Math.max(0, a) * (60 / (Math.max(Zu, r.tempo()) * 960));
		}
		let a = jl(f), o = i ? a.secondsBetween(t, n.endTick) + a.secondsBetween(n.startTick, e) : a.secondsBetween(t, e);
		return Math.max(0, o) / d.tempoRate();
	}, Se = (e) => {
		ne(j), j = r.setTimeout(() => {
			j = null;
			try {
				d.stop(), d.seek(0), ve(), ue();
			} catch (e) {
				i("A cue could not finish.", e);
			}
		}, Math.max(0, e));
	}, Ce = (e, t) => {
		let n = e.seconds;
		if (e.action === "jump") {
			let r = Hr(f ?? {}).find((t) => t.id === e.sectionId);
			if (!r) return;
			d.jumpAt(r.startTick, t), n > 0 && (o.cancelFrom(t), o.setAt(0, t), o.linearTo(1, t + n / 2));
			return;
		}
		if (e.action === "stop") {
			d.stopAt(t), d.seek(0);
			return;
		}
		if (e.action === "fadeOut") {
			let e = Math.max(ad, n);
			o.cancelFrom(t), o.setAt(1, t), o.linearTo(0, t + e), Se(t + e - F());
			return;
		}
		let i = n > 0 ? n : Pr, a = Math.max(Zu, r.tempo());
		d.slumpTempo(Math.max(1, a * od), i, t), d.bendPitch(hd(), i, t), o.cancelFrom(t), o.setAt(1, t + i * sd), o.linearTo(0, t + i), Se(t + i - F());
	}, we = t.visibility === void 0 ? ud() : t.visibility, Te = () => {
		!v && we && I(c, +!we.hidden, id);
	};
	return we?.addEventListener("visibilitychange", Te), we?.hidden && c.setAt(0, F()), {
		player: d,
		setGame(e, t, n) {
			if (v) return;
			let r = e?.id !== f?.id, i = e?.bpm !== f?.bpm || e?.tempoChanges !== f?.tempoChanges;
			if (r) {
				for (let e of O.keys()) d.setTrackControl(e, null);
				O.clear(), A && be(ad), ve();
			}
			d.setSong(e, t), f = e, p = t, m = Vr(e ?? {}), (r || i) && (y = null), r && (l = !1, pe(), E.clear(), d.setTranspose(0), S = 0);
			let a = /* @__PURE__ */ new Set();
			g.clear();
			for (let e of n) {
				if (a.has(e.id) || g.has(e.name)) continue;
				a.add(e.id);
				let t = h.get(e.id), n = Ur(e, _.get(e.name) ?? _.get(e.id) ?? t?.target ?? e.defaultValue), r;
				if (!t) r = {
					dial: e,
					target: n,
					value: n,
					from: n,
					since: F()
				};
				else {
					let i = Ur({
						...e,
						step: "continuous"
					}, t.value);
					r = n !== t.target || i !== t.value ? {
						dial: e,
						target: n,
						value: i,
						from: i,
						since: F()
					} : {
						...t,
						dial: e
					};
				}
				h.set(e.id, r), g.set(e.name, r);
			}
			for (let e of [...h.keys()]) a.has(e) || h.delete(e);
			ue();
		},
		setDial(e, t, n = {}) {
			if (v || typeof e != "string" || !Number.isFinite(t)) return;
			_.set(e, t);
			let r = ee(e);
			if (!r) return;
			let i = Ur(r.dial, t);
			i !== r.target && (r.from = r.value, r.since = F(), r.target = i), n.jump && (r.value = r.from = r.target), de();
		},
		dialValue: (e) => ee(e)?.value ?? null,
		cue(e) {
			if (v || !f) return !1;
			let t = zr(f), n = t.find((t) => t.name === e) ?? t.find((t) => t.id === e);
			if (!n) return !1;
			let r = n.action === "jump" ? Hr(f).find((e) => e.id === n.sectionId) : void 0;
			if (n.action === "jump" && !r) return !1;
			if (!L()) return r ? d.seek(r.startTick) : d.stop(), !0;
			if (j !== null && (ve(), ye()), me(), M = te(d.atBoundary(n.landing, (e) => {
				M = null, N = null, P = !1;
				try {
					Ce(n, e);
				} catch (e) {
					he(), i("A cue could not be played.", e);
				}
			}, {
				drop: !0,
				onDrop: me
			})), M && (N = n), n.action === "jump" && n.seconds > 0 && M && M.tick !== null) {
				let e = F() + xe(M.tick), t = Math.max(F(), e - n.seconds / 2);
				o.cancelFrom(t), o.setAt(1, t), o.linearTo(0, Math.max(t + ad, e)), P = !0;
			}
			return !0;
		},
		play() {
			v || (A && be(Br(f ?? {}).fadeSeconds), L() && _e() && (ve(), d.stop(), d.seek(0)), !L() && (ve(), ye(), ue(), d.play()));
		},
		pause() {
			if (v || A || !L()) return;
			let e = Br(f ?? {});
			if (A = !0, me(), e.mode === "stop") {
				d.stop(), d.seek(0);
				return;
			}
			a.setLowpass("muffle", e.muffleHz, nd, e.fadeSeconds), e.mode === "freeze" && (d.pause(), e.fadeSeconds > 0 && I(s, 0, e.fadeSeconds));
		},
		stop() {
			v || (A && be(ad), d.stop(), ve(), ue());
		},
		isPaused: () => A,
		settle: () => {
			for (let e of h.values()) e.value = e.from = e.target;
			w.clear(), T.clear(), ue(0);
		},
		setMuffle(e, t) {
			if (v || !Number.isFinite(e)) return;
			let n = Math.min(td, Math.max(Tr.frequency.min, e));
			a.setLowpass("host", n, nd, Math.max(ad, Number.isFinite(t) ? t : 0));
		},
		dispose() {
			v || (v = !0, r.clearInterval(fe), ne(j), we?.removeEventListener("visibilitychange", Te), d.dispose(), n && r.dispose(), a.dispose(), h.clear(), g.clear(), _.clear());
		}
	};
}
var _d = 3, vd = (() => {
	let e = Bi("FMSynth", "harmonicity");
	return e.kind === "number" ? Math.log(8 / e.min) / Math.log(16 / e.min) : 1;
})();
function yd(e) {
	return Math.round(e * vd * 1e6) / 1e6;
}
function bd(e, t) {
	return Array.isArray(e) ? e.map((e) => {
		if (typeof e != "object" || !e || !Array.isArray(e.connections)) return e;
		let n = e.connections.map((e) => {
			let n = typeof e == "object" && e ? Ea(e.target) : null, r = n ? e.depth : void 0;
			return n?.kind !== "layer" || n.path !== "harmonicity" || t[n.layer]?.voiceType !== "FMSynth" ? e : typeof r == "number" && Number.isFinite(r) ? {
				...e,
				depth: yd(r)
			} : e;
		});
		return {
			...e,
			connections: n
		};
	}) : e;
}
var xd = {
	transpose: 0,
	keyTrack: 0,
	velocityToFilter: 0,
	stringDecay: "sustain",
	velocity: 0,
	tuning: "classic"
};
function Sd(e) {
	let t = (t) => e.layers[t]?.voiceType === "FMSynth";
	for (let t of e.layers) {
		let e = t.params;
		if (Object.entries(xd).some(([t, n]) => t in e && e[t] !== n) || t.voiceType === "PluckSynth" && typeof e.detune == "number" && e.detune !== 0 || t.voiceType === "FMSynth" && typeof e.harmonicity == "number" && e.harmonicity > 8) return !0;
	}
	return (e.lfos ?? []).some((e) => e.connections.some((e) => {
		let n = Ea(e.target);
		return n?.kind === "layer" && n.path === "harmonicity" && t(n.layer);
	}));
}
function Cd(e, t) {
	return typeof e == "string" ? e : t;
}
function wd(e, t) {
	return Array.isArray(e) ? e.map((e) => {
		if (typeof e != "object" || !e || !Array.isArray(e.connections)) return e;
		let n = e.connections.flatMap((e) => {
			let n = typeof e == "object" && e ? Ea(e.target) : null;
			if (n?.kind !== "layer") return [e];
			let r = t.get(n.layer);
			return r === void 0 ? [] : [{
				...e,
				target: wa(r, n.path)
			}];
		});
		return {
			...e,
			connections: n
		};
	}) : e;
}
function Td(e, t = {}) {
	let n = e;
	if (typeof e == "string") try {
		n = JSON.parse(e);
	} catch {
		return {
			ok: !1,
			error: "This file is not valid JSON, so it can’t be an instrument patch."
		};
	}
	if (typeof n != "object" || !n || Array.isArray(n)) return {
		ok: !1,
		error: "An instrument patch must be a JSON object."
	};
	let r = n;
	if (typeof r.version == "number" && r.version > 2) return {
		ok: !1,
		error: `This patch was saved by a newer version of Sine Sculptor (format ${r.version}).`
	};
	let i = r.id;
	if (typeof i != "string" || i.trim() === "") return {
		ok: !1,
		error: "The patch has no id."
	};
	if (!Array.isArray(r.layers) || r.layers.length === 0) return {
		ok: !1,
		error: "The patch has no layers, so there is nothing to play."
	};
	let a = r.kit !== null && typeof r.kit == "object" && !Array.isArray(r.kit) ? r.kit : null, o = a && Object.hasOwn(a, "pads") ? a.pads : void 0, s = Array.isArray(o) ? 48 : _d, c = [];
	for (let [e, t] of r.layers.slice(0, s).entries()) {
		if (typeof t != "object" || !t) return {
			ok: !1,
			error: `Layer ${e + 1} is not an object.`
		};
		let n = t;
		if (!si(n.voiceType)) return {
			ok: !1,
			error: `Layer ${e + 1} uses an unknown voice type: ${JSON.stringify(n.voiceType)}.`
		};
		c.push({
			voiceType: n.voiceType,
			polyphony: ps(n.polyphony),
			volume: ms(n.volume),
			params: Ui(n.voiceType, n.params)
		});
	}
	let l, u = r.lfos;
	if (Array.isArray(o)) {
		let e = Qo(o, c);
		if (!e) return {
			ok: !1,
			error: "The drum kit has no pads, so there is nothing to play."
		};
		l = e.kit, c = e.layers, u = wd(u, e.moved);
	}
	(t.legacy ?? (typeof r.version == "number" && r.version < 2)) && (u = bd(u, c));
	let d = {
		id: i,
		name: Cd(r.name, "Untitled"),
		category: Cd(r.category, "Uncategorized"),
		description: Cd(r.description, ""),
		layers: c
	};
	l && (d.kit = l);
	let f = Fa(r.effects);
	f.length > 0 && (d.effects = f);
	let p = Ia(u, d);
	return p.length > 0 && (d.lfos = p), {
		ok: !0,
		patch: d
	};
}
//#endregion
//#region src/song/key.ts
var Ed = [
	"major",
	"minor",
	"harmonic-minor",
	"melodic-minor",
	"major-pentatonic",
	"minor-pentatonic",
	"blues",
	"dorian",
	"phrygian",
	"lydian",
	"mixolydian"
];
function Dd(e) {
	return Ed.includes(e);
}
function Od(e) {
	return (Math.round(e) % 12 + 12) % 12;
}
function kd(e) {
	if (typeof e != "object" || !e || Array.isArray(e)) return null;
	let t = Object.hasOwn(e, "root") ? e.root : void 0, n = Object.hasOwn(e, "scale") ? e.scale : void 0;
	return typeof t != "number" || !Number.isFinite(t) || !Dd(n) ? null : {
		root: Od(t),
		scale: n
	};
}
var Ad = [
	"maj",
	"min",
	"dim",
	"aug",
	"sus2",
	"sus4",
	"5",
	"6",
	"min6",
	"7",
	"maj7",
	"min7",
	"m7b5",
	"dim7",
	"minmaj7",
	"7sus4",
	"add9",
	"9",
	"maj9",
	"min9",
	"11",
	"min11",
	"13",
	"maj13"
];
function jd(e) {
	return Ad.includes(e);
}
//#endregion
//#region src/song/chords.ts
var Md = 1024;
Object.freeze({
	root: 0,
	scale: "major"
});
function Nd(e) {
	return e.startTick + e.lengthTicks;
}
//#endregion
//#region src/state/immutable.ts
var Pd = /* @__PURE__ */ new Set([
	"__proto__",
	"prototype",
	"constructor"
]);
function Fd(e) {
	return Pd.has(e);
}
function Id(e) {
	let t = 0;
	for (let n of Pd) Object.hasOwn(e, n) && t++;
	return t;
}
var Ld = 16, Rd = Ld * 4, zd = 16, Bd = (e, t) => Object.hasOwn(e, t) ? e[t] : void 0;
function Vd(e) {
	if (typeof e != "string") return null;
	let t = e.trim();
	return t.length > 0 && t.length <= 64 && !Fd(t) ? t : null;
}
function Hd(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(16, Math.max(1, Math.round(e))) : null;
}
function Ud(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(6, Math.max(-60, e)) : null;
}
function Wd(e, t) {
	return typeof e == "string" && e.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 40).trim() || t;
}
function Gd(e) {
	if (typeof e != "object" || !e || Array.isArray(e)) return null;
	let t = {}, n = 0, r = 0;
	for (let i in e) {
		if (n >= Ld || r++ >= Rd) break;
		if (!Object.hasOwn(e, i)) continue;
		let a = Vd(i), o = uo(Bd(e, i));
		a === null || a !== i || o <= 0 || (t[a] = o, n++);
	}
	return n > 0 ? t : null;
}
function Kd(e, t) {
	let n = lo(Bd(t, "pan"));
	n !== 0 && (e.pan = n);
	let r = Gd(Bd(t, "sends"));
	r && (e.sends = r);
	let i = Hd(Bd(t, "voiceLimit"));
	i !== null && (e.voiceLimit = i);
}
function qd(e) {
	if (typeof e != "object" || !e || Array.isArray(e)) return null;
	let t = e, n = Vd(Bd(t, "id")), r = Bd(t, "type");
	return n === null || !ha(r) ? null : {
		id: n,
		name: Wd(Bd(t, "name"), ma[r]),
		type: r,
		params: ya(r, Bd(t, "params")),
		returnDb: Ud(Bd(t, "returnDb")) ?? 0,
		mute: Bd(t, "mute") === !0
	};
}
function Jd(e, t, n) {
	if (e === void 0) return null;
	if (!Array.isArray(e)) return t(`${n} had an unreadable list of send buses, so it got the default Reverb and Delay.`), null;
	let r = [], i = Math.max(0, e.length - zd);
	for (let t of e.slice(0, zd)) {
		let e = qd(t);
		!e || r.length >= 4 || r.some((t) => t.id === e.id) ? i++ : r.push(e);
	}
	return i > 0 && t(`${n}: dropped ${i === 1 ? "a send bus" : `${i} send buses`} that couldn’t be read or didn’t fit.`), r;
}
function Yd(e, t) {
	if (!e.sends) return e;
	let n = Object.entries(e.sends).filter(([e]) => t.has(e));
	if (n.length === Object.keys(e.sends).length) return e;
	let r = { ...e };
	return n.length > 0 ? r.sends = Object.fromEntries(n) : delete r.sends, r;
}
//#endregion
//#region src/state/pattern-normalize.ts
var Xd = 128, Zd = 40, Qd = (e, t) => Object.hasOwn(e, t) ? e[t] : void 0;
function $d(e) {
	return typeof e == "object" && e && !Array.isArray(e) ? e : null;
}
function ef(e) {
	if (typeof e != "string") return null;
	let t = e.trim();
	return t.length > 0 && t.length <= Xd ? t : null;
}
function tf(e, t) {
	if (typeof e != "string") return t;
	let n = e.slice(0, 160).replace(/[\u0000-\u001f\u007f]/g, " ").trim();
	return Array.from(n).slice(0, Zd).join("").trim() || t;
}
function nf(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(64, Math.max(1, Math.round(e))) : null;
}
function rf(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(1, Math.max(0, e)) : null;
}
function af(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(1, Math.max(0, e)) : 0;
}
function of(e, t) {
	let n = Array(t).fill(0);
	for (let r = 0; r < Math.min(t, e.length); r++) n[r] = af(e[r]);
	return n;
}
function sf(e, t) {
	let n = $d(e);
	if (!n) return null;
	let r = Qd(n, "note"), i = Qd(n, "steps");
	if (typeof r != "number" || !Number.isFinite(r) || !Array.isArray(i)) return null;
	let a = Math.round(r);
	return a < 0 || a > 127 ? null : {
		note: a,
		steps: of(i.slice(0, 64), t)
	};
}
function cf(e) {
	let t = $d(e);
	if (!t) return null;
	let n = ef(Qd(t, "id"));
	if (n === null) return null;
	let r = nf(Qd(t, "length")) ?? 16, i = Qd(t, "stepSize"), a = Qd(t, "rows"), o = [], s = /* @__PURE__ */ new Set();
	if (Array.isArray(a)) for (let e of a.slice(0, 64)) {
		let t = sf(e, r);
		if (t && !s.has(t.note) && (s.add(t.note), o.push(t), o.length >= 16)) break;
	}
	return {
		id: n,
		name: tf(Qd(t, "name"), "Pattern"),
		length: r,
		stepSize: cu(i) ? i : "1/16",
		swing: rf(Qd(t, "swing")) ?? 0,
		rows: o
	};
}
function lf(e, t, n) {
	if (e === void 0) return null;
	if (!Array.isArray(e)) return t(`${n} had an unreadable pattern list, so its pattern clips are now empty.`), null;
	let r = [], i = /* @__PURE__ */ new Set(), a = 0;
	for (let t of e.slice(0, 128)) {
		let e = cf(t);
		if (!e || i.has(e.id)) {
			a++;
			continue;
		}
		i.add(e.id), r.push(e);
	}
	return a += Math.max(0, e.length - 128), a > 0 && t(`${n}: dropped ${a} unreadable or repeated ${a === 1 ? "pattern" : "patterns"}.`), r.length > 0 ? r : null;
}
function uf(e, t, n, r) {
	let i = 0, a = e.clips.map((e) => {
		if (e.patternId === void 0 || t.has(e.patternId)) return e;
		i++;
		let { patternId: n, ...r } = e;
		return r;
	});
	return i === 0 ? e : (n(`${r}: ${i} pattern ${i === 1 ? "clip lost its pattern" : "clips lost their patterns"}, so ${i === 1 ? "it is" : "they are"} now empty.`), {
		...e,
		clips: a
	});
}
//#endregion
//#region src/song/arrange.ts
var df = [...La, "none"];
function ff(e) {
	return e === "none" || Ra(e);
}
function pf(e) {
	return e.role ?? "none";
}
function mf(e) {
	return df.indexOf(e);
}
function hf(e) {
	let t = !0;
	for (let n = 1; n < e.length && t; n++) mf(pf(e[n - 1])) > mf(pf(e[n])) && (t = !1);
	return t ? e : e.map((e, t) => ({
		track: e,
		i: t,
		g: mf(pf(e))
	})).sort((e, t) => e.g - t.g || e.i - t.i).map((e) => e.track);
}
function gf(e) {
	if (!Array.isArray(e)) return [];
	let t = new Set(e.filter(ff));
	return df.filter((e) => t.has(e));
}
function _f(e) {
	return Number.isFinite(e) ? Math.min(40, Math.max(3, Math.round(e * 16) / 16)) : 6;
}
function vf(e) {
	return typeof e == "number" && Number.isFinite(e) ? _f(e) : null;
}
//#endregion
//#region src/song/track-colors.ts
var yf = /^#[0-9a-f]{6}$/;
function bf(e) {
	if (typeof e != "string") return null;
	let t = e.trim().toLowerCase();
	return yf.test(t) ? t : null;
}
//#endregion
//#region src/state/document.ts
function xf(e, t) {
	let n = bf(Q(t, "color"));
	n && (e.color = n, Q(t, "colorPicked") === !0 && (e.colorPicked = !0));
	let r = vf(Q(t, "height"));
	r !== null && (e.height = r);
}
var Sf = "Untitled Song", Cf = "Track", wf = [
	2,
	4,
	8,
	16
], Tf = 384e5, Ef = {
	rack: 1024,
	songs: 64,
	tracksPerSong: 128,
	clipsPerTrack: 512,
	notesPerClip: 2e4,
	totalNotes: 1e5
}, Df = 1024, Of = 50, kf = (e, t, n) => Math.min(n, Math.max(t, e));
function Af(e) {
	return typeof e == "number" && Number.isFinite(e);
}
function Q(e, t) {
	return Object.hasOwn(e, t) ? e[t] : void 0;
}
function jf(e, t, n = `${t}s`) {
	return `${e.toLocaleString("en-US")} ${e === 1 ? t : n}`;
}
function Mf(e) {
	return Af(e) ? kf(e, 20, 400) : null;
}
function Nf(e) {
	return Af(e) ? kf(e, -60, 12) : null;
}
function Pf(e) {
	return Af(e) ? kf(Math.round(e), 0, Tf) : null;
}
function Ff(e) {
	return Af(e) ? kf(Math.round(e), 1, Tf) : null;
}
function If(e) {
	if (typeof e != "object" || !e) return null;
	let t = Q(e, "beats"), n = Q(e, "unit");
	return typeof t != "number" || !Number.isInteger(t) || t < 1 || t > 32 || typeof n != "number" || !wf.includes(n) ? null : {
		beats: t,
		unit: n
	};
}
function Lf(e) {
	if (typeof e != "object" || !e) return null;
	let t = Pf(Q(e, "startTick")), n = Pf(Q(e, "endTick"));
	return t === null || n === null ? null : {
		enabled: Q(e, "enabled") === !0,
		startTick: t,
		endTick: Math.max(t, n)
	};
}
var Rf = /[\u0000-\u001f\u007f]/g;
function zf(e, t) {
	if (typeof e != "string") return t;
	let n = e.slice(0, 400).replace(Rf, " ").trim();
	return n.length > 100 && (n = Array.from(n).slice(0, 100).join("").trim()), n || t;
}
function Bf(e) {
	if (typeof e != "string") return null;
	let t = e.trim();
	return t.length > 0 && t.length <= 128 ? t : null;
}
function Vf() {
	return {
		beats: 4,
		unit: 4
	};
}
function Hf() {
	return {
		enabled: !1,
		startTick: 0,
		endTick: 0
	};
}
function Uf(e, t = Ef.totalNotes) {
	let n = [], r = 0, i = 0, a = 0;
	return {
		rackIds: new Set(e),
		notesLeft: Math.max(0, t),
		warn(e) {
			n.length < Of ? n.push(e) : r++;
		},
		overBudget(e) {
			a += e;
		},
		record(e) {
			return typeof e != "object" || !e || Array.isArray(e) ? null : (i += Id(e), e);
		},
		warnings() {
			let e = [...n];
			return a > 0 && e.push(`The project held more notes than the ${jf(Ef.totalNotes, "note")} limit, so ${jf(a, "note")} were dropped.`), i > 0 && e.push(`Ignored ${jf(i, "unsafe key")} (such as “__proto__”) in the file.`), r > 0 && e.push(`…and ${jf(r, "more problem")}.`), e;
		}
	};
}
function Wf(e, t) {
	let n = t.record(e);
	if (!n) return null;
	let r = Pf(Q(n, "tick")), i = Ff(Q(n, "durationTicks")), a = Q(n, "midi"), o = Q(n, "velocity");
	if (r === null || i === null || !Af(a) || !Af(o)) return null;
	let s = Math.round(a);
	return s < 0 || s > 127 ? null : {
		tick: r,
		durationTicks: i,
		midi: s,
		velocity: kf(o, 0, 1)
	};
}
var Gf = (e, t) => e.tick - t.tick || e.midi - t.midi;
function Kf(e, t, n) {
	return e ? `${t} “${e}”` : `${t} ${n}`;
}
function qf(e) {
	return typeof e == "object" && e && !Array.isArray(e) ? Bf(Q(e, "id")) : null;
}
function Jf(e, t, n, r, i, a) {
	if (!Array.isArray(e)) return e !== void 0 && n.warn(`${r} had an unreadable ${i} list, so it is now empty.`), [];
	let o = Math.min(e.length, t);
	e.length > o && n.warn(`${r} held more than ${jf(o, i)}; the extra ${jf(e.length - o, i)} were dropped.`);
	let s = [], c = /* @__PURE__ */ new Set(), l = 0, u = 0;
	for (let t = 0; t < o; t++) {
		let n = qf(e[t]);
		if (n !== null && c.has(n)) {
			u++;
			continue;
		}
		let r = a(e[t]);
		r ? (c.add(r.id), s.push(r)) : l++;
	}
	return l > 0 && n.warn(`${r}: dropped ${jf(l, `unreadable ${i}`)}.`), u > 0 && n.warn(`${r}: dropped ${jf(u, i)} that repeated an earlier ${i}’s id.`), s;
}
function Yf(e, t, n = "A track") {
	let r = t.record(e);
	if (!r) return null;
	let i = Bf(Q(r, "id")), a = Pf(Q(r, "startTick")), o = Ff(Q(r, "lengthTicks")), s = Q(r, "notes");
	if (i === null || a === null || o === null || !Array.isArray(s)) return null;
	let c = zf(Q(r, "name"), ""), l = `${n}, ${Kf(c, "clip", i)}`, u = ef(Q(r, "patternId"));
	if (u !== null) return {
		id: i,
		name: c,
		startTick: a,
		lengthTicks: o,
		notes: [],
		patternId: u
	};
	let d = Math.min(s.length, Ef.notesPerClip);
	s.length > d && t.warn(`${l} held more than ${jf(d, "note")}; the extra ${jf(s.length - d, "note")} were dropped.`);
	let f = [], p = 0;
	for (let e = 0; e < d; e++) {
		let n = Wf(s[e], t);
		if (!n) {
			p++;
			continue;
		}
		if (t.notesLeft <= 0) {
			t.overBudget(d - e);
			break;
		}
		t.notesLeft--, f.push(n);
	}
	p > 0 && t.warn(`${l}: dropped ${jf(p, "invalid note")}.`), f.sort(Gf);
	let m = {
		id: i,
		name: c,
		startTick: a,
		lengthTicks: o,
		notes: f
	}, h = Bf(Q(r, "poolId"));
	h !== null && (m.poolId = h);
	let g = ou(Q(r, "swing"));
	return g && (m.swing = g), m;
}
function Xf(e, t, n = "A song") {
	let r = t.record(e);
	if (!r) return null;
	let i = Bf(Q(r, "id"));
	if (i === null) return null;
	let a = zf(Q(r, "name"), Cf), o = `${n}, ${Kf(a, "track", i)}`, s = Q(r, "instrumentId"), c = null;
	typeof s == "string" && t.rackIds.has(s) ? c = s : s != null && t.warn(`${o} used an instrument that isn’t in the rack, so it is now silent.`);
	let l = Q(r, "volume"), u = Nf(l);
	u === null && (l !== void 0 && t.warn(`${o} had an unreadable volume, so it was reset to 0 dB.`), u = 0);
	let d = Jf(Q(r, "clips"), Ef.clipsPerTrack, t, o, "clip", (e) => Yf(e, t, o)), f = {
		id: i,
		name: a,
		instrumentId: c,
		volume: u,
		mute: Q(r, "mute") === !0,
		solo: Q(r, "solo") === !0,
		clips: d
	}, p = Q(r, "role");
	return Ra(p) && (f.role = p), Kd(f, r), xf(f, r), f;
}
function Zf(e, t) {
	let n = t.record(e);
	if (!n) return null;
	let r = Bf(Q(n, "id"));
	if (r === null) return null;
	let i = zf(Q(n, "name"), Sf), a = `Song “${i}”`, o = Mf(Q(n, "bpm"));
	o === null && (t.warn(`${a} had an unreadable tempo, so it was set to 120 BPM.`), o = 120);
	let s = If(t.record(Q(n, "timeSignature")));
	s ||= (t.warn(`${a} had an unreadable time signature, so it was set to 4/4.`), Vf());
	let c = np(Q(n, "tempoChanges"), o, t, a), l = rp(Q(n, "meterChanges"), s, t, a);
	o = c.bpm, s = l.timeSignature;
	let u = Lf(t.record(Q(n, "loop")));
	u ||= (Q(n, "loop") !== void 0 && t.warn(`${a} had an unreadable loop region, so looping was turned off.`), Hf());
	let d = Q(n, "sourcePpq"), f = typeof d == "number" && Number.isInteger(d) && d >= 1 && d <= 32767 ? d : null, p = Jd(Q(n, "buses"), t.warn, a), m = new Set(Ba({ buses: p ?? void 0 }).map((e) => e.id)), h = lf(Q(n, "patterns"), t.warn, a), g = new Set((h ?? []).map((e) => e.id)), _ = Jf(Q(n, "tracks"), Ef.tracksPerSong, t, a, "track", (e) => {
		let n = Xf(e, t, a);
		return n && uf(Yd(n, m), g, t.warn, a);
	}), v = {
		id: r,
		name: i,
		bpm: o,
		timeSignature: s,
		...c.changes.length ? { tempoChanges: c.changes } : {},
		...l.changes.length ? { meterChanges: l.changes } : {},
		loop: u,
		sourcePpq: f,
		tracks: hf(_)
	};
	p && (v.buses = p), h && (v.patterns = h);
	let y = gf(Q(n, "folded"));
	y.length && (v.folded = y);
	let b = Zl(Q(n, "overrides"), t.rackIds, t.warn, a);
	return b && (v.overrides = b), Pp(v, n, {
		trackIds: new Set(_.map((e) => e.id)),
		busIds: m,
		patternIds: g,
		rackIds: t.rackIds
	}, (e) => t.warn(`${a}: ${e}`)), v;
}
function Qf(e) {
	if (!Af(e)) return null;
	let t = Math.round(e);
	return t >= 0 && t <= Tf ? t : null;
}
function $f(e, t, n, r, i, a) {
	if (e === void 0) return [];
	if (!Array.isArray(e)) return i(` had an unreadable ${a} list, so it is now empty.`), [];
	let o = Math.min(e.length, t * 4), s = [], c = 0;
	for (let t = 0; t < o; t++) {
		let i = r(e[t]), a = i && n(i);
		a ? s.push(a) : c++;
	}
	c > 0 && i(`: dropped ${jf(c, `unreadable ${a}`)}.`), s.sort((e, t) => e.tick - t.tick);
	let l = [];
	for (let e of s) l.length > 0 && l[l.length - 1].tick === e.tick ? l[l.length - 1] = e : l.push(e);
	return l;
}
function ep(e, t, n, r, i) {
	if (e.length <= n && t <= n * 4) return e;
	let a = e.slice(0, n);
	return r(` held more than ${jf(n, i)}; the ones past that were dropped.`), a;
}
var tp = (e) => (t) => e ? e.record(t) : typeof t == "object" && t && !Array.isArray(t) ? t : null;
function np(e, t, n, r = "A song") {
	let i = (e) => n?.warn(`${r}${e}`), a = $f(e, Df, (e) => {
		let t = Qf(Q(e, "tick")), n = Q(e, "bpm");
		if (t === null || !Af(n)) return null;
		let r = {
			tick: t,
			bpm: Math.round(kf(n, 20, 400) * 1e3) / 1e3
		};
		return Q(e, "glide") === !0 && (r.glide = !0), r;
	}, tp(n), i, "tempo change");
	return {
		bpm: a[0]?.tick === 0 ? a.shift().bpm : t,
		changes: ep(a, Array.isArray(e) ? e.length : 0, Df, i, "tempo change")
	};
}
function rp(e, t, n, r = "A song") {
	let i = (e) => n?.warn(`${r}${e}`), a = $f(e, 256, (e) => {
		let t = Qf(Q(e, "tick")), n = If(e);
		return t === null || !n ? null : {
			tick: t,
			beats: n.beats,
			unit: n.unit
		};
	}, tp(n), i, "meter change"), o = a[0]?.tick === 0 ? a.shift() : null, s = o ? {
		beats: o.beats,
		unit: o.unit
	} : t, c = [], l = s, u = 0;
	for (let e of a) (e.beats !== l.beats || e.unit !== l.unit || (e.tick - u) % Ha(l) !== 0) && (c.push(e), l = e, u = e.tick);
	return {
		timeSignature: s,
		changes: ep(c, Array.isArray(e) ? e.length : 0, 256, i, "meter change")
	};
}
//#endregion
//#region src/state/game-normalize.ts
var ip = 128, ap = 40, op = 1e6, $ = (e, t) => Object.hasOwn(e, t) ? e[t] : void 0;
function sp(e) {
	return typeof e == "object" && e && !Array.isArray(e) ? e : null;
}
function cp(e) {
	return typeof e == "number" && Number.isFinite(e);
}
var lp = (e, t, n) => Math.min(n, Math.max(t, e));
function up(e) {
	if (typeof e != "string") return null;
	let t = e.trim();
	return t.length > 0 && t.length <= ip && !t.includes(":") && !Fd(t) ? t : null;
}
function dp(e) {
	if (typeof e != "string") return null;
	let t = e.slice(0, 160).replace(/[\u0000-\u001f\u007f]/g, " ").trim(), n = Array.from(t).slice(0, ap).join("").trim();
	return n && !Fd(n) ? n : null;
}
function fp(e, t) {
	return cp(e) ? lp(e, 0, t) : null;
}
function pp(e, t, n, r, i) {
	if (!Array.isArray(e)) return [];
	let a = [], o = /* @__PURE__ */ new Set(), s = Math.max(0, e.length - t);
	for (let n of e.slice(0, t)) {
		let e = sp(n), t = e ? i(e) : null;
		if (!t || o.has(t.id)) {
			s++;
			continue;
		}
		o.add(t.id), a.push(t);
	}
	return s > 0 && n(`Dropped ${s} unreadable or extra ${r}${s === 1 ? "" : "s"}.`), a;
}
function mp(e) {
	let t = sp(e);
	if (!t) return null;
	let n = up($(t, "id")), r = dp($(t, "name")), i = $(t, "min"), a = $(t, "max");
	if (!n || !r || !cp(i) || !cp(a)) return null;
	let o = lp(i, -1e6, op), s = lp(a, -1e6, op);
	if (!(s > o)) return null;
	let c = $(t, "step") === "whole" ? "whole" : "continuous", l = $(t, "defaultValue"), u = cp(l) ? lp(l, o, s) : o;
	return c === "whole" && (u = lp(Math.round(u), o, s)), {
		id: n,
		name: r,
		min: o,
		max: s,
		step: c,
		defaultValue: u,
		riseSeconds: fp($(t, "riseSeconds"), 60) ?? 0,
		fallSeconds: fp($(t, "fallSeconds"), 60) ?? 0,
		cushion: cp($(t, "cushion")) ? lp($(t, "cushion"), 0, s - o) : 0
	};
}
function hp(e, t, n) {
	if (!Array.isArray(e)) return null;
	let r = [];
	for (let i of e.slice(0, Mr.curvePoints)) {
		let e = sp(i), a = e ? $(e, "x") : void 0, o = e ? $(e, "y") : void 0;
		cp(a) && cp(o) && r.push({
			x: lp(a, -1e6, op),
			y: lp(o, t, n)
		});
	}
	return r.sort((e, t) => e.x - t.x), r.length > 0 ? r : null;
}
function gp(e) {
	let t = sp(e), n = t ? up($(t, "dialId")) : null, r = t ? hp($(t, "points"), 20, 400) : null;
	if (!t || !n || !r) return null;
	let i = {
		dialId: n,
		points: r,
		glideBeats: fp($(t, "glideBeats"), 64) ?? 0
	};
	return $(t, "landing") === "now" && (i.landing = "now"), i;
}
function _p(e) {
	let t = sp(e), n = t ? up($(t, "dialId")) : null, r = t ? hp($(t, "points"), -24, 24) : null;
	return t && n && r ? {
		dialId: n,
		points: r
	} : null;
}
function vp(e, t) {
	return typeof e != "string" || e.length > 256 ? !1 : e === "track:volume" || e === "track:pan" || wr(e) ? !0 : e.startsWith("track:send:") ? t.has(e.slice(11)) : Ea(e) !== null;
}
function yp(e, t) {
	let n = up($(e, "id")), r = up($(e, "dialId")), i = $(e, "trackId");
	return !n || !r || typeof i != "string" || !t.trackIds.has(i) ? null : {
		id: n,
		dialId: r,
		trackId: i
	};
}
function bp(e, t) {
	let n = sp(e), r = n ? $(n, "target") : void 0, i = n ? hp($(n, "points"), 0, 1) : null;
	if (!n || !vp(r, t.busIds) || !i) return null;
	if (wr(r)) {
		let e = up($(n, "id")), t = up($(n, "dialId"));
		return e && t ? {
			id: e,
			dialId: t,
			target: r,
			points: i
		} : null;
	}
	let a = yp(n, t);
	return a ? {
		...a,
		target: r,
		points: i
	} : null;
}
function xp(e) {
	let t = sp(e);
	if (!t) return null;
	let { frequency: n, Q: r } = Tr, i = $(t, "frequency"), a = $(t, "Q");
	return {
		frequency: cp(i) ? lp(i, n.min, n.max) : n.default,
		Q: cp(a) ? lp(a, r.min, r.max) : r.default
	};
}
function Sp(e, t) {
	let n = sp(e), r = n && yp(n, t), i = n ? $(n, "threshold") : void 0;
	return !r || !cp(i) ? null : {
		...r,
		threshold: lp(i, -1e6, op),
		fadeSeconds: fp($(n, "fadeSeconds"), 30) ?? 0
	};
}
function Cp(e, t) {
	let n = sp(e), r = n && yp(n, t), i = n ? $(n, "threshold") : void 0, a = n ? $(n, "kind") : void 0, o = n ? $(n, "to") : void 0;
	return !r || !cp(i) || typeof o != "string" || (a === "instrument" ? !t.rackIds.has(o) : a !== "pattern" || !t.patternIds.has(o)) ? null : {
		...r,
		threshold: lp(i, -1e6, op),
		kind: a,
		to: o
	};
}
function wp(e, t, n) {
	let r = sp(e);
	if (!r) return null;
	let i = {
		links: pp($(r, "links"), Mr.links, n, "dial link", (e) => bp(e, t)),
		layers: pp($(r, "layers"), Mr.layers, n, "layer rule", (e) => Sp(e, t)),
		swaps: pp($(r, "swaps"), Mr.swaps, n, "swap rule", (e) => Cp(e, t))
	}, a = gp($(r, "tempo"));
	a && (i.tempo = a);
	let o = _p($(r, "transpose"));
	return o && (i.transpose = o), i;
}
function Tp(e) {
	return !e.tempo && !e.transpose && e.links.length === 0 && e.layers.length === 0 && e.swaps.length === 0;
}
function Ep(e) {
	return cp(e) ? lp(Math.round(e), 0, Tf) : null;
}
function Dp(e) {
	let t = sp(e);
	if (!t) return null;
	let n = up($(t, "id")), r = dp($(t, "name")), i = Ep($(t, "startTick")), a = Ep($(t, "endTick"));
	if (!n || !r || i === null || a === null) return null;
	let o = {
		id: n,
		name: r,
		startTick: i,
		endTick: Math.max(i, a)
	}, s = kd($(t, "key"));
	return s && (o.key = s), o;
}
function Op(e, t) {
	return Array.isArray(e) ? pp(e, Mr.sections, t, "section", Dp) : null;
}
function kp(e, t) {
	let n = sp(e);
	if (!n) return null;
	let r = up($(n, "id")), i = dp($(n, "name")), a = $(n, "action"), o = $(n, "landing");
	if (!r || !i || !kr.includes(a)) return null;
	let s = {
		id: r,
		name: i,
		action: a,
		landing: Ar.includes(o) ? o : "bar",
		seconds: fp($(n, "seconds"), 30) ?? 0
	}, c = $(n, "sectionId");
	return typeof c == "string" && t.has(c) && (s.sectionId = c), s;
}
function Ap(e, t, n) {
	if (!Array.isArray(e)) return null;
	let r = /* @__PURE__ */ new Set();
	return pp(e, Mr.cues, n, "cue", (e) => {
		let n = kp(e, t);
		return !n || r.has(n.name) ? null : (r.add(n.name), n);
	});
}
function jp(e) {
	let t = sp(e);
	if (!t) return null;
	let n = Ir(), r = $(t, "mode"), i = $(t, "muffleHz");
	return {
		mode: jr.includes(r) ? r : n.mode,
		muffleHz: cp(i) ? lp(i, 50, Nr) : n.muffleHz,
		fadeSeconds: fp($(t, "fadeSeconds"), 30) ?? n.fadeSeconds
	};
}
function Mp(e) {
	let t = sp(e);
	if (!t) return null;
	let n = up($(t, "id")), r = Ep($(t, "startTick")), i = $(t, "lengthTicks"), a = $(t, "root"), o = $(t, "quality");
	if (!n || r === null || r >= Tf || !cp(i) || !cp(a) || !jd(o)) return null;
	let s = {
		id: n,
		startTick: r,
		lengthTicks: lp(Math.round(i), 1, Tf - r),
		root: Od(a),
		quality: o
	}, c = $(t, "bass");
	cp(c) && Od(c) !== s.root && (s.bass = Od(c));
	let l = $(t, "confidence");
	return cp(l) && (s.confidence = lp(l, 0, 1)), s;
}
function Np(e, t) {
	if (!Array.isArray(e)) return null;
	let n = pp(e, Md, t, "chord", Mp).sort((e, t) => e.startTick - t.startTick), r = [];
	for (let e of n) {
		let t = r.at(-1);
		t && Nd(t) > e.startTick && (t.startTick === e.startTick ? r.pop() : r[r.length - 1] = {
			...t,
			lengthTicks: e.startTick - t.startTick
		}), r.push(e);
	}
	return r;
}
function Pp(e, t, n, r) {
	let i = wp($(t, "rules"), n, r);
	i && !Tp(i) && (e.rules = i);
	let a = Op($(t, "sections"), r);
	a?.length && (e.sections = a);
	let o = Ap($(t, "cues"), new Set((a ?? []).map((e) => e.id)), r);
	o && (e.cues = o);
	let s = jp($(t, "pause"));
	s && (e.pause = s);
	let c = xp($(t, "masterFilter"));
	c && !Dr(c) && (e.masterFilter = c);
	let l = kd($(t, "key"));
	l && (e.key = l);
	let u = Np($(t, "chords"), r);
	u?.length && (e.chords = u);
}
//#endregion
//#region src/player/bundle.ts
var Fp = "sine-sculptor-song", Ip = 5, Lp = Mr.dials;
function Rp(e) {
	return Object.entries(e).map(([e, t]) => ({
		...t,
		name: e
	}));
}
function zp() {
	return { limiterDb: -1 };
}
function Bp(e, t, n = {}) {
	let { song: r, instruments: i } = Yl(au(e), t), { chords: a, ...o } = r, s = new Set(i.map((e) => e.id));
	for (let n of e.rules?.swaps ?? []) {
		let r = n.kind === "instrument" && !s.has(n.to) ? t.find((e) => e.id === n.to) : void 0;
		r && (s.add(r.id), i.push(Jl(r, e)));
	}
	return {
		format: Fp,
		version: o.tempoChanges?.length || o.meterChanges?.length ? 5 : i.some(Sd) ? 4 : i.some(Vp) ? 3 : 2,
		name: o.name,
		song: o,
		instruments: i,
		dials: Wp(n.dials ?? {}, []),
		tempo: n.tempo ?? null,
		mix: Hp(n.mix)
	};
}
function Vp(e) {
	let t = e.kit?.pads;
	return !!t && (e.layers.length !== t.length || t.some((e, t) => e.layers.length !== 1 || e.layers[0] !== t));
}
function Hp(e) {
	let t = zp();
	if (typeof e != "object" || !e || Array.isArray(e)) return t;
	let n = Q(e, "limiterDb");
	return Up(n) && (t.limiterDb = Math.min(0, Math.max(-24, n))), t;
}
function Up(e) {
	return typeof e == "number" && Number.isFinite(e);
}
function Wp(e, t) {
	let n = {};
	if (typeof e != "object" || !e || Array.isArray(e)) return n;
	let r = /* @__PURE__ */ new Set();
	for (let i of Object.keys(e).slice(0, Lp)) {
		if (Fd(i)) continue;
		let a = Q(e, i), o = typeof a == "object" && a && !Array.isArray(a) ? a : {}, s = mp({
			id: Q(o, "id") ?? i,
			...o,
			name: i
		});
		if (s && s.name === i && !r.has(s.id)) {
			r.add(s.id);
			let { name: e, ...t } = s;
			n[i] = t;
		} else t.push(`The dial “${i}” had an unreadable range, so it was ignored.`);
	}
	return n;
}
function Gp(e, t, n) {
	if (typeof e != "object" || !e || Array.isArray(e)) return null;
	let r = e, i = Q(r, "dial"), a = Mf(Q(r, "bpmAtMin")), o = Mf(Q(r, "bpmAtMax"));
	return typeof i != "string" || !Object.hasOwn(t, i) || a === null || o === null ? (n.push("The tempo rule was unreadable, so the song keeps one tempo."), null) : {
		dial: i,
		bpmAtMin: a,
		bpmAtMax: o
	};
}
function Kp(e) {
	let t = e;
	if (typeof e == "string") try {
		t = JSON.parse(e);
	} catch {
		return {
			ok: !1,
			error: "The song bundle is not valid JSON."
		};
	}
	if (typeof t != "object" || !t || Array.isArray(t)) return {
		ok: !1,
		error: "A song bundle must be a JSON object."
	};
	let n = t;
	if (Q(n, "format") !== "sine-sculptor-song") return {
		ok: !1,
		error: "This file is not a Sine Sculptor song bundle."
	};
	let r = Q(n, "version");
	if (!Up(r) || r < 1) return {
		ok: !1,
		error: "The song bundle has no format version."
	};
	if (r > 5) return {
		ok: !1,
		error: `This bundle needs a newer player (bundle format ${r}).`
	};
	let i = [], a = [], o = Q(n, "instruments");
	if (Array.isArray(o)) {
		let e = /* @__PURE__ */ new Set();
		for (let t of o.slice(0, Ef.rack)) {
			let n = Td(t, { legacy: r < 4 });
			n.ok ? e.has(n.patch.id) || (e.add(n.patch.id), a.push(n.patch)) : i.push(`An instrument was dropped: ${n.error}`);
		}
	}
	let s = Uf(a.map((e) => e.id)), c = Zf(Q(n, "song"), s);
	if (!c) return {
		ok: !1,
		error: "The song bundle holds no readable song."
	};
	i.push(...s.warnings());
	let l = Wp(Q(n, "dials"), i);
	return {
		ok: !0,
		bundle: {
			format: Fp,
			version: r < 2 ? 1 : r < 3 ? 2 : r < 4 ? 3 : r < 5 ? 4 : 5,
			name: zf(Q(n, "name"), c.name),
			song: c,
			instruments: a,
			dials: l,
			tempo: Gp(Q(n, "tempo"), l, i),
			mix: Hp(Q(n, "mix"))
		},
		warnings: i
	};
}
//#endregion
//#region src/player/core.ts
var qp = .05, Jp = .005;
function Yp(e) {
	let t = Wa(e);
	return t <= 0 ? e : {
		...e,
		loop: {
			enabled: !0,
			startTick: 0,
			endTick: Ll(e).barLineAtOrAfter(t)
		}
	};
}
var Xp = {
	mode: "freeze",
	muffleHz: Nr,
	fadeSeconds: 0
};
function Zp(e) {
	return e.mode === "freeze" && e.muffleHz >= 2e4 && e.fadeSeconds === 0;
}
function Qp(e, t) {
	let n = t.tempo, r = n && Object.hasOwn(t.dials, n.dial) ? t.dials[n.dial] : null;
	if (!n || !r || e.rules?.tempo) return e;
	let i = [{
		x: r.min,
		y: n.bpmAtMin
	}, {
		x: r.max,
		y: n.bpmAtMax
	}];
	return {
		...e,
		rules: {
			...Vr(e),
			tempo: {
				dialId: r.id,
				points: i,
				glideBeats: 0,
				landing: "now"
			}
		}
	};
}
function $p(e, t, n = {}) {
	let r = gd(e, {
		destination: t.destination,
		onError: n.onError,
		visibility: n.visibility
	}), i = r.player, a = n.loop ?? !0, o = !1, s = [], c = null, l = /* @__PURE__ */ new Set(), u = () => r.isPaused() ? "paused" : i.getState(), d = u(), f = () => {
		let e = u();
		if (e !== d) {
			d = e;
			for (let t of [...l]) try {
				t(e);
			} catch (e) {
				n.onError?.("A playback listener failed.", e);
			}
		}
	};
	return i.subscribe(f), {
		load(e) {
			if (o) return {
				ok: !1,
				error: "This player has been disposed."
			};
			let n;
			try {
				n = Kp(e);
			} catch {
				return {
					ok: !1,
					error: "The song bundle could not be read."
				};
			}
			if (!n.ok) return n;
			let i = n.bundle, l = Qp(a ? Yp(i.song) : i.song, i);
			i.version === 1 && !l.pause && (l = {
				...l,
				pause: Xp
			}), c = Zp(Br(l)) ? null : Br(l), r.setGame(null, [], []), t.setLimiter(i.mix.limiterDb);
			let u = Rp(i.dials);
			return s = u.map(({ name: e, min: t, max: n, step: r }) => ({
				name: e,
				min: t,
				max: n,
				step: r
			})), r.setGame(l, i.instruments, u), r.settle(), f(), {
				ok: !0,
				warnings: n.warnings
			};
		},
		play() {
			o || (r.play(), f());
		},
		pause() {
			o || (r.pause(), f());
		},
		stop() {
			o || (r.stop(), i.seek(0), f());
		},
		setDial(e, t, n) {
			o || r.setDial(e, t, n);
		},
		getDial: (e) => o ? null : r.dialValue(e),
		dials: () => s.map((e) => ({ ...e })),
		pauseTreatment: () => o || !c ? null : { ...c },
		cue: (e) => !o && r.cue(e),
		setVolume(e, n = qp) {
			o || t.setVolume(e, Math.max(Jp, n));
		},
		setMuffle(e, t = qp) {
			o || r.setMuffle(e, t);
		},
		getState: u,
		getPositionTicks: () => i.getPositionTicks(),
		subscribe(e) {
			return l.add(e), () => void l.delete(e);
		},
		dispose() {
			o || (o = !0, r.dispose(), s = [], c = null, l.clear());
		}
	};
}
//#endregion
//#region src/player/elementary.ts
async function em(e, t = {}) {
	let n = new Sr(), r = await n.initialize(e, {
		numberOfInputs: 0,
		numberOfOutputs: 1,
		outputChannelCount: [2]
	}), i = () => clearInterval(n._timer), a = t.onError ?? ((e, t) => console.error(e, t)), o;
	try {
		r.connect(t.destination ?? e.destination), n.on("error", (e) => a("The Elementary engine reported a problem.", e)), o = Cl({
			renderer: n,
			context: e,
			lookahead: t.lookahead ?? .2,
			onError: a,
			liveEdits: !1
		}), o.volume.setAt(io(t.volumeDb ?? 0), e.currentTime), o.setLimiter(-1);
	} catch (e) {
		throw r.disconnect(), i(), e;
	}
	let s = $p(o, {
		destination: o.destination,
		setVolume: (t, n) => o.volume.rampTo(io(t), n, e.currentTime),
		setLimiter: (e) => o.setLimiter(e)
	}, t);
	return {
		...s,
		dispose() {
			s.dispose(), o.dispose(), r.disconnect(), i();
		}
	};
}
//#endregion
export { Fp as BUNDLE_FORMAT, Ip as BUNDLE_VERSION, Bp as buildBundle, em as createElementaryPlayer, Kp as parseBundle };
