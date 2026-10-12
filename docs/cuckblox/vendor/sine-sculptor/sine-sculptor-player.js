//#region src/engine/allocator.ts
var e = class {
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
function t() {
	let e = -1, t = -Infinity;
	return {
		next(n) {
			return Math.abs(n - t) < .04 || (e++, t = n), e;
		},
		reset() {
			e = -1, t = -Infinity;
		}
	};
}
//#endregion
//#region src/engine/glider.ts
var n = [
	"a",
	"e",
	"i",
	"o",
	"u"
], r = {
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
}, i = {
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
}, a = {
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
	eh: {
		c: null,
		a: "e",
		b: "e"
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
}, o = {
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
	cotillion: {
		label: "Cotillion: ah eh oh ee ooh",
		syllables: [
			"ah",
			"eh",
			"oh",
			"ee",
			"ooh"
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
function s(e) {
	let t = e >>> 0;
	return () => {
		t = t + 1831565813 >>> 0;
		let e = t;
		return e = Math.imul(e ^ e >>> 15, e | 1), e ^= e + Math.imul(e ^ e >>> 7, e | 61), ((e ^ e >>> 14) >>> 0) / 4294967296;
	};
}
function c(e) {
	return e ^= e >>> 16, e = Math.imul(e, 2246822507), e ^= e >>> 13, e = Math.imul(e, 3266489909), (e ^ e >>> 16) >>> 0;
}
function l(e, t, n) {
	let r = c(Math.floor(e) ^ 2654435769), i = c(Math.floor(t) + 1663821227 | 0), a = c(Math.imul(Math.floor(n) + 1, 668265263));
	return s(c(r ^ i ^ a));
}
var u = (e) => n.includes(e);
function d(e, t, n, r) {
	let i = n(), s = n();
	if (r !== void 0 && Object.hasOwn(a, r)) return {
		syllable: a[r],
		manual: !1
	};
	if (e.mode === "vowel") return {
		syllable: {
			c: null,
			a: u(e.vowelA) ? e.vowelA : "o",
			b: u(e.vowelB) ? e.vowelB : "u"
		},
		manual: !0
	};
	let c = (Object.hasOwn(o, e.set) ? o[e.set] : o.kk).syllables, l = () => c[Math.min(c.length - 1, Math.floor(i * c.length))], d;
	return d = e.mode === "cycle" ? c[(Math.floor(t) % c.length + c.length) % c.length] : e.mode === "random" || s < e.randomness * .6 ? l() : e.mode, {
		syllable: a[d] ?? a.nah,
		manual: !1
	};
}
function f(e, t) {
	return t === "on" && e.attack !== void 0 ? e.attack : e.index;
}
var p = (e) => 10 ** (e / 20), m = (e, t, n) => e + (t - e) * n;
function h(e, t, n) {
	return r.bass[e].map((i, a) => {
		let o = r.tenor[e][a];
		return [
			m(i[0], o[0], t) * n,
			p(m(i[1], o[1], t)),
			m(i[2], o[2], t)
		];
	});
}
//#endregion
//#region src/engine/params.ts
var g = [
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
function _(e) {
	return typeof e == "string" && g.includes(e);
}
function v(e, t, n, r, i, a) {
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
function y(e, t, n, r, i, a, o) {
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
var b = [
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
], x = {
	value: "pulse",
	label: "Pulse"
}, S = [
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
], C = S.map((e) => e.value);
function w(e, t, n, r, i) {
	let a = `${e}oscillator.type`, o = [
		...b,
		...i.pulse ? [x] : [],
		...i.fat ? S : []
	], s = [y(a, `${n}Wave`, t, o, r, "The basic waveform the voice starts from, before any envelope or filter shapes it.", "Sine is pure and round, triangle is soft and hollow like an ocarina, sawtooth is bright and buzzy like brass, and square and pulse are the reedy tones of old game consoles.")];
	if (i.pulse && (s.push(v(`${e}oscillator.width`, `${n}Pulse width`, t, {
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
		let r = v(`${e}oscillator.spread`, `${n}Spread`, t, {
			min: 0,
			max: 100,
			default: 20,
			curve: "linear",
			step: 1,
			unit: "cents"
		}, "How far apart, in cents, the stacked copies of a fat wave are detuned from each other.", "A little spread gives a gentle chorus shimmer; a lot sounds like a detuned string section or a supersaw."), i = v(`${e}oscillator.count`, `${n}Copies`, t, {
			min: 2,
			max: 8,
			default: 3,
			curve: "linear",
			step: 1,
			unit: "voices"
		}, "How many detuned copies of the wave a fat oscillator stacks together.", "More copies make the sound thicker and smoother, at the cost of more processing per note.");
		r.visibleWhen = {
			path: a,
			equals: C
		}, i.visibleWhen = {
			path: a,
			equals: C
		}, s.push(r, i);
	}
	return s;
}
var T = {
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
function E(e, t, n, r, i) {
	let a = T[r], o = (e, t) => ({
		min: .001,
		max: e,
		default: t,
		curve: "log",
		unit: "s"
	}), s = [v(`${e}.attack`, `${n}Attack`, t, o(4, i.attack), ...a.attack), v(`${e}.decay`, `${n}Decay`, t, o(4, i.decay), ...a.decay)];
	if (i.sustain !== void 0 && s.push(v(`${e}.sustain`, `${n}Sustain`, t, {
		min: 0,
		max: 1,
		default: i.sustain,
		curve: "linear",
		step: .01,
		unit: ""
	}, ...a.sustain)), s.push(v(`${e}.release`, `${n}Release`, t, o(8, i.release), ...a.release)), r !== "amp" && n) for (let e of s) e.short = e.label.slice(n.length);
	return s;
}
var D = "envelope.attackCurve";
function O(e, t) {
	let n = y(D, "PUNCH UP", e, [{
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
var k = {
	MonoSynth: ["envelope", "filterEnvelope"],
	DuoSynth: [
		"voice0.envelope",
		"voice0.filterEnvelope",
		"voice1.envelope",
		"voice1.filterEnvelope"
	]
};
function A(e, t, n, r) {
	let i = n.path;
	if (!n.perNote) {
		if (i !== "envelope.attackCurve") {
			_e(e, i, r);
			return;
		}
		for (let n of k[t] ?? ["envelope"]) _e(e, `${n}.attackCurve`, r);
	}
}
var j = () => v("detune", "Detune", "Pitch", {
	min: -1200,
	max: 1200,
	default: 0,
	curve: "linear",
	step: 1,
	unit: "cents"
}, "Shifts the pitch of the whole voice in cents; 100 cents is one semitone and 1200 is an octave.", "Small amounts against another layer thicken the sound with a slow beating; 1200 or -1200 moves the layer a full octave."), M = () => ({
	...v("transpose", "Transpose", "Pitch", {
		min: -48,
		max: 48,
		default: 0,
		curve: "linear",
		step: 1,
		unit: "st"
	}, "Moves the whole layer up or down in semitones, up to four octaves either way; 12 is one octave.", "Stack a layer 12, 19, or 24 semitones up for the bright overtones of bells, glockenspiels, and organ stops."),
	perNote: !0
}), N = () => v("portamento", "Glide", "Pitch", {
	min: 0,
	max: 1,
	default: 0,
	curve: "linear",
	step: .005,
	unit: "s"
}, "How long the pitch slides from one note to the next. It only applies when a voice moves to a new note, so it is clearest with Voices set to 1.", "At 0 notes jump cleanly; small values add a vocal slur between notes, and longer ones give the swoop of a slide guitar or a 303 bass line."), P = 16;
function F(e) {
	let t = [v("harmonicity", "Mod ratio", "Modulation", {
		min: .25,
		max: e ? P : 8,
		default: 3,
		curve: "log",
		step: .01,
		unit: "×"
	}, "The pitch ratio between the hidden modulating oscillator and the one you hear; 2 puts the modulator an octave above.", e ? "Whole numbers like 1, 2, and 3 give clean, musical tones; in-between values like 1.41 or 3.5 sound clangorous and bell-like." : "Whole numbers add clean, organ-like overtones; uneven values add a ring-modulated, robotic shimmer.")];
	return e && t.push(v("modulationIndex", "Mod depth", "Modulation", {
		min: .1,
		max: 100,
		default: 10,
		curve: "log",
		step: .1,
		unit: ""
	}, "How strongly the modulating oscillator bends the pitch of the one you hear, which sets how many overtones are added.", "Low values are soft and flute-like; high values turn bright and brassy, then harsh and metallic.")), t.push(y("modulation.type", "Mod wave", "Modulation", b, "square", "The waveform of the hidden modulating oscillator.", "Sine modulation is smooth and bell-like; square and sawtooth add buzzier, grittier overtones."), ...E("modulationEnvelope", "Modulation envelope", "Mod ", "mod", {
		attack: .5,
		decay: .01,
		sustain: 1,
		release: .5
	})), t;
}
function I() {
	return [
		...w("", "Oscillator", "", "triangle", {
			pulse: !0,
			fat: !0
		}),
		...E("envelope", "Envelope", "", "amp", {
			attack: .005,
			decay: .1,
			sustain: .3,
			release: 1
		}),
		O("Envelope", "linear"),
		M(),
		j(),
		N()
	];
}
function L(e) {
	return [
		...w("", "Oscillator", "", "sine", {
			pulse: !0,
			fat: !0
		}),
		...E("envelope", "Envelope", "", "amp", {
			attack: .01,
			decay: .01,
			sustain: 1,
			release: .5
		}),
		O("Envelope", "linear"),
		...F(e),
		M(),
		j(),
		N()
	];
}
function R(e) {
	return [{
		...v("keyTrack", "Key tracking", e, {
			min: 0,
			max: 1,
			default: 0,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How far the cutoff follows the note you play: at 1 it moves an octave for every octave, measured from middle C.", "Keeps guitars, harpsichords, and brass equally bright from the bottom of the keyboard to the top; at 0 high notes sound duller than low ones."),
		perNote: !0
	}, {
		...v("velocityToFilter", "Velocity to filter", e, {
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
var z = "The resting cutoff frequency of the filter, the brightness the note settles back to when the filter envelope closes.", B = "Lower values make the voice darker and more muffled; higher values let more buzz and sparkle through.";
function ee() {
	return [
		...w("", "Oscillator", "", "sawtooth", {
			pulse: !0,
			fat: !0
		}),
		y("filter.type", "Filter type", "Filter", [
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
		v("filterEnvelope.baseFrequency", "Cutoff", "Filter", {
			min: 20,
			max: 2e4,
			default: 200,
			curve: "log",
			unit: "Hz"
		}, z, B),
		v("filter.Q", "Resonance", "Filter", {
			min: .1,
			max: 20,
			default: 1,
			curve: "log",
			step: .1,
			unit: ""
		}, "How much the filter emphasizes the frequencies right at its cutoff point.", "Higher values add a whistling, vocal peak that sings as the filter sweeps; very high values squeal."),
		v("filterEnvelope.octaves", "Envelope amount", "Filter", {
			min: 0,
			max: 8,
			default: 3,
			curve: "linear",
			step: .1,
			unit: "oct"
		}, "How far, in octaves, the filter envelope opens the cutoff above its resting frequency.", "At 0 the tone stays static; 2–4 octaves give the classic sweep at the start of each note."),
		...R("Filter"),
		...E("filterEnvelope", "Filter envelope", "Filter ", "filter", {
			attack: .6,
			decay: .2,
			sustain: .5,
			release: 2
		}),
		...E("envelope", "Envelope", "", "amp", {
			attack: .005,
			decay: .1,
			sustain: .9,
			release: 1
		}),
		O("Envelope", "linear"),
		M(),
		j(),
		N()
	];
}
function te(e) {
	let t = `voice${e}.`, n = `Voice ${e + 1}`, r = `V${e + 1} `;
	return [
		...w(t, n, r, "sawtooth", {
			pulse: !0,
			fat: !1
		}),
		v(`${t}filterEnvelope.baseFrequency`, `${r}Cutoff`, n, {
			min: 20,
			max: 2e4,
			default: 200,
			curve: "log",
			unit: "Hz"
		}, z, B),
		...E(`${t}envelope`, n, r, "amp", {
			attack: .01,
			decay: .01,
			sustain: 1,
			release: .5
		})
	];
}
function ne() {
	return [
		v("harmonicity", "Interval", "Voices", {
			min: .25,
			max: 8,
			default: 1.5,
			curve: "log",
			step: .01,
			unit: "×"
		}, "The pitch ratio of the second voice to the first; 1.5 puts voice 2 a perfect fifth above voice 1.", "At 1 the voices double in unison, 2 adds an octave, and 1.5 gives a hollow power-chord fifth."),
		O("Voices", "linear"),
		v("vibratoAmount", "Vibrato depth", "Vibrato", {
			min: 0,
			max: 1,
			default: .5,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How deep the built-in pitch wobble is.", "Small amounts add a gentle, singer-like waver; large amounts sound seasick."),
		v("vibratoRate", "Vibrato rate", "Vibrato", {
			min: .1,
			max: 20,
			default: 5,
			curve: "log",
			step: .1,
			unit: "Hz"
		}, "How fast the built-in pitch wobble cycles, in wobbles per second.", "Around 5–6 Hz feels like a singer or violinist; slower rates drift and faster ones flutter."),
		...te(0),
		...te(1),
		...R("Filter"),
		M(),
		j(),
		N()
	];
}
function re() {
	return [
		...w("", "Oscillator", "", "sine", {
			pulse: !1,
			fat: !1
		}),
		v("pitchDecay", "Pitch drop", "Pitch", {
			min: .001,
			max: .5,
			default: .05,
			curve: "log",
			unit: "s"
		}, "How long the pitch takes to fall from its high starting point down to the played note.", "Very short values give a tight, clicky kick; longer ones give the falling boom of a tom or a zappy laser."),
		v("octaves", "Drop range", "Pitch", {
			min: 1,
			max: 16,
			default: 10,
			curve: "linear",
			step: .1,
			unit: "×"
		}, "How many times higher than the played note the pitch starts before it drops: 2× is one octave up, 8× is three.", "Small values give a soft, round thump; large values add a sharp, punchy click to the front of each hit."),
		...E("envelope", "Envelope", "", "amp", {
			attack: .001,
			decay: .4,
			sustain: .01,
			release: 1.4
		}),
		O("Envelope", "exponential"),
		M(),
		j(),
		{
			...N(),
			tip: "How long a still-sounding skin slides to the next pitch. It only slides while the skin rings, so it is clearest with Voices set to 1; a same-pitch stroke always strikes fresh.",
			listenFor: "At 0 every note strikes with its pitch drop; above 0 a sounding skin slides to the next pitch with no fresh drop, like a hand pressing a frame drum's skin."
		}
	];
}
function ie() {
	return [
		v("harmonicity", "Pitch ratio", "Tone", {
			min: .5,
			max: 20,
			default: 5.1,
			curve: "log",
			step: .01,
			unit: "×"
		}, "The ratio between the pitches of the stacked oscillators that build the metallic tone.", "Changing it moves the hit between cymbal, cowbell, and gong colors; 5.1 is a classic hi-hat."),
		v("modulationIndex", "Density", "Tone", {
			min: 1,
			max: 100,
			default: 32,
			curve: "log",
			step: .1,
			unit: ""
		}, "How much the stacked oscillators bend each other, which sets how dense the overtones are.", "Low values sound like a tuned bell or cowbell; high values dissolve into a dense, hissy cymbal wash."),
		v("resonance", "Brightness", "Tone", {
			min: 200,
			max: 7e3,
			default: 4e3,
			curve: "log",
			unit: "Hz"
		}, "The lowest frequency the built-in high-pass filter lets through, which sets the floor of the hit.", "Low values add body and clang; high values leave only the thin sizzle at the top of a hi-hat."),
		v("octaves", "Filter sweep", "Tone", {
			min: 0,
			max: 4,
			default: 1.5,
			curve: "linear",
			step: .1,
			unit: "oct"
		}, "How far, in octaves, the filter opens above the brightness setting during each hit.", "Higher values make each hit sweep brighter and splashier; with brightness already high, a big sweep thins the hit to almost nothing."),
		...E("envelope", "Envelope", "", "amp", {
			attack: .001,
			decay: 1.4,
			sustain: 0,
			release: .2
		}),
		O("Envelope", "linear"),
		M(),
		j()
	];
}
function ae() {
	let e = v("resonance", "Sustain", "String", {
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
	let t = v("ringTime", "Ring time", "String", {
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
	let n = y("stringDecay", "String decay", "String", [{
		value: "sustain",
		label: "Sustain (fixed loop)"
	}, {
		value: "ring",
		label: "Ring time"
	}], "sustain", "How the string's ring is set: Sustain keeps the same loop strength on every note, so high notes die faster; Ring time sets one length in seconds for all of them.", "Sustain lets high notes fade sooner, as they do on a real string; Ring time lets them sing as long as low ones.");
	n.perNote = !0;
	let r = y("tuning", "IN TUNE", "Pitch", [{
		value: "classic",
		label: "Off"
	}, {
		value: "exact",
		label: "On"
	}], "classic", "Tunes the virtual string to the nearest pitch it can reach. Off, it always runs a little flat, more on higher notes.", "Clearest against other layers or instruments: high plucks stop sounding sour beside them.");
	r.toggle = {
		on: "exact",
		off: "classic"
	}, r.perNote = !0;
	let i = v("velocity", "Velocity", "String", {
		min: 0,
		max: 1,
		default: 0,
		curve: "linear",
		step: .01,
		unit: ""
	}, "How much harder playing makes the pluck louder; at 0 every note plays at full level.", "Raise it for fingerpicked parts with soft and loud notes; leave it at 0 for an even, machine-like strum.");
	i.perNote = !0;
	let a = {
		...j(),
		perNote: !0
	}, o = M();
	return [
		v("attackNoise", "Pick noise", "String", {
			min: .1,
			max: 20,
			default: 1,
			curve: "log",
			step: .1,
			unit: "cycles"
		}, "How long the burst of noise that sets the virtual string moving lasts, measured in cycles of the played note.", "Low values give a soft, rounded fingertip pluck; high values add a scratchy pick attack, like a harpsichord quill."),
		v("dampening", "Damping", "String", {
			min: 200,
			max: 7e3,
			default: 4e3,
			curve: "log",
			unit: "Hz"
		}, "The cutoff of the filter inside the virtual string, which sets how quickly its high overtones die away.", "Low values sound like a muted or nylon-string pluck; high values ring like bright steel strings."),
		n,
		e,
		t,
		v("release", "Release", "String", {
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
function oe() {
	return [
		y("noise.type", "Noise color", "Noise", [
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
		...E("envelope", "Envelope", "", "amp", {
			attack: .005,
			decay: .1,
			sustain: 0,
			release: .3
		}),
		O("Envelope", "linear")
	];
}
var V = [
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
function se() {
	let e = y("vowelA", "Vowel", "Syllable", V, "o", "The vowel each note sings in plain vowel mode, and where its glide starts.", "Ah and oh sound open and warm, ee and oo sound closed and small; eh sits in between."), t = y("vowelB", "Glide-to vowel", "Syllable", V, "u", "The vowel a held note drifts toward in plain vowel mode.", "Oh gliding to oo gives a rounded \"ohw\"; ah gliding to ee gives a bright \"eye\".");
	e.visibleWhen = {
		path: "syllableMode",
		equals: ["vowel"]
	}, t.visibleWhen = {
		path: "syllableMode",
		equals: ["vowel"]
	};
	let n = y("chordSyllables", "Chords share a syllable", "Syllable", [{
		value: "off",
		label: "Off"
	}, {
		value: "on",
		label: "On"
	}], "off", "Every note of a chord sings the same syllable, and the set moves on once per chord instead of once per note.", "Clearest on block chords: on, the whole chord sings one vowel together like a choir; off, its notes scatter across the set.");
	n.toggle = {
		on: "on",
		off: "off"
	}, n.visibleWhen = {
		path: "syllableMode",
		equals: ["cycle"]
	};
	let r = Object.entries(o).map(([e, t]) => ({
		value: e,
		label: t.label
	}));
	return [
		y("syllableMode", "Syllables", "Syllable", [
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
			...Object.keys(a).map((e) => ({
				value: e,
				label: `Always "${e}"`
			}))
		], "cycle", "Which bit of gibberish each note sings: the set in order, a seeded pick from the set, a plain vowel, or one fixed syllable.", "Cycle gives the steady nah-me-oh-now-queh patter; Random sounds more like real chatter, and a fixed syllable is the most robotic."),
		y("syllableSet", "Syllable set", "Syllable", r, "kk", "The pool of sounds that Cycle and Random draw from, so a cat can meow and a choir can sing \"ah\".", "Each set changes the consonants and vowels at once; try Babble for villager chatter or Choir for soft open vowels."),
		n,
		v("seed", "Lyric seed", "Syllable", {
			min: 1,
			max: 999,
			default: 7,
			curve: "linear",
			step: 1,
			unit: ""
		}, "Picks the made-up lyrics Random mode and Randomness choose. The same seed sings the same words on the same notes every time.", "Step through seeds on a phrase until the gibberish lands; the game sings it the same way. Live notes follow the order you play them."),
		e,
		t,
		v("morph", "Vowel glide", "Syllable", {
			min: 0,
			max: 1,
			default: .6,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How far each held note slides from its first vowel toward its second, the slur that turns \"nah\" into \"now\".", "At 0 every vowel holds still and sounds sung; near 1 notes bend into diphthongs that sound more like words."),
		v("morphTime", "Glide time", "Syllable", {
			min: .05,
			max: 1.5,
			default: .35,
			curve: "log",
			unit: "s"
		}, "How long that vowel slide takes once the note has landed.", "Short glides sound chatty and quick; long ones give a lazy, drawn-out croon."),
		v("consonant", "Consonants", "Syllable", {
			min: 0,
			max: 1,
			default: .7,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How strongly the n, m, k, s, and other sounds at the start of each syllable come through.", "Low values blur the syllables into humming vowels; high values make every note pop like a spoken word."),
		v("randomness", "Randomness", "Syllable", {
			min: 0,
			max: 1,
			default: .35,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How much each note wanders: a fixed syllable sometimes swaps, and pitch and vowel color shift a little per note.", "A touch keeps a phrase from sounding like a machine; a lot sounds tipsy and off-key."),
		v("voiceMix", "Bass to tenor", "Voice", {
			min: 0,
			max: 1,
			default: .35,
			curve: "linear",
			step: .01,
			unit: ""
		}, "Blends between a bass singer's vowel shapes and a tenor's.", "Toward bass the vowels turn low and woolly; toward tenor they get lighter and clearer."),
		v("formantShift", "Voice size", "Voice", {
			min: .7,
			max: 1.5,
			default: 1,
			curve: "log",
			step: .01,
			unit: "×"
		}, "Scales the size of the throat the voice comes from without changing the note: under 1 is a bigger body, over 1 a smaller one.", "Push it up for chipmunk Animalese and tiny villagers; pull it down for giants, frogs, and whales."),
		v("bandwidth", "Vowel sharpness", "Voice", {
			min: .5,
			max: 3,
			default: 1.2,
			curve: "log",
			step: .01,
			unit: "×"
		}, "How wide each vowel resonance is: low values are narrow and focused, high values broad and blurred.", "Low settings sound crisp and robotic; high ones sound soft and mumbly, as if singing through a smile."),
		y("source", "Source wave", "Voice", [{
			value: "glottal",
			label: "Glottal (soft)"
		}, {
			value: "saw",
			label: "Sawtooth (buzzy)"
		}], "glottal", "The raw buzz the vowels are carved from, before any shaping.", "Glottal is round and gentle like a real throat; sawtooth is buzzier and cuts through a busy mix."),
		v("brightness", "Brightness", "Voice", {
			min: 600,
			max: 9e3,
			default: 3200,
			curve: "log",
			unit: "Hz"
		}, "A low-pass on the raw buzz that opens or darkens it before the vowels shape it.", "Low values sound hooded and far away, like an owl; high values add a forward, nasal edge."),
		v("breath", "Breathiness", "Voice", {
			min: 0,
			max: 1,
			default: .18,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How much airy hiss is mixed in through the vowels, with the buzz backing off as it rises.", "A little makes the voice intimate; near 1 it turns into a whisper with only a ghost of pitch."),
		v("roughness", "Roughness", "Voice", {
			min: 0,
			max: 1,
			default: 0,
			curve: "linear",
			step: .01,
			unit: ""
		}, "Chops the voice in fast pulses, the way a creaky or growling throat does.", "Low values give a sleepy vocal fry; high values become a growl, a bark, or a frog's croak. At 0 it costs nothing."),
		M(),
		j(),
		v("portamento", "Glide", "Pitch", {
			min: 0,
			max: .4,
			default: .06,
			curve: "linear",
			step: .005,
			unit: "s"
		}, "How long the pitch slides from the previous note when Scoop is off; it also sets how fast a scoop swoops.", "Small values add a vocal slur between notes; longer ones sound like a lazy, sliding crooner."),
		v("scoop", "Scoop", "Pitch", {
			min: 0,
			max: 300,
			default: 40,
			curve: "linear",
			step: 1,
			unit: "cents"
		}, "Starts every note this far flat and swoops up to pitch; 100 cents is one semitone.", "A little is the crooner's signature; a lot sounds like a meow, a yodel flip, or a whale."),
		v("pitchDrop", "Fall on release", "Pitch", {
			min: 0,
			max: 1200,
			default: 0,
			curve: "linear",
			step: 1,
			unit: "cents"
		}, "How far the pitch sags while a note fades out after you let go.", "Pair it with a longer release to hear it: a few hundred cents gives a meow's droop or the end of a bark."),
		v("vibDepth", "Vibrato depth", "Vibrato", {
			min: 0,
			max: 100,
			default: 28,
			curve: "linear",
			step: 1,
			unit: "cents"
		}, "How wide the singer's pitch wobble is, in cents.", "Around 20–40 sounds like a natural singer; wider sounds operatic, then shaky like a goat."),
		v("vibRate", "Vibrato rate", "Vibrato", {
			min: 2,
			max: 9,
			default: 5.2,
			curve: "linear",
			step: .1,
			unit: "Hz"
		}, "How many times per second the pitch wobbles.", "About 5–6 sounds like a singer; slower drifts dreamily, faster flutters like a bird."),
		v("vibDelay", "Vibrato delay", "Vibrato", {
			min: 0,
			max: 1.2,
			default: .3,
			curve: "linear",
			step: .01,
			unit: "s"
		}, "How long a held note stays straight before the wobble fades in.", "Short notes stay clean while long ones bloom, the way trained singers do; at 0 every note wobbles at once."),
		v("envelope.attack", "Attack", "Envelope", {
			min: .002,
			max: 2,
			default: .03,
			curve: "log",
			unit: "s"
		}, "How long the voice takes to swell in on each syllable: after the burst of a k, t, or s, and through the hum of an n or m.", "Short attacks spit syllables out like chatter; long ones make a soft, swelling choir."),
		v("envelope.release", "Release", "Envelope", {
			min: .01,
			max: 4,
			default: .25,
			curve: "log",
			unit: "s"
		}, "How long the voice takes to fade after you let go, and how long any fall on release lasts.", "Short releases clip words off neatly; long ones let each note sigh away.")
	];
}
var H = {
	Synth: I(),
	AMSynth: L(!1),
	FMSynth: L(!0),
	MonoSynth: ee(),
	DuoSynth: ne(),
	MembraneSynth: re(),
	MetalSynth: ie(),
	PluckSynth: ae(),
	NoiseSynth: oe(),
	FormantVoice: se()
}, ce = {
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
for (let e of g) for (let t of H[e]) Object.hasOwn(ce[e], t.path) && (t.modulatable = !0);
function le(e, t) {
	return Object.hasOwn(ce[e], t) ? ce[e][t] : void 0;
}
function ue(e, t) {
	let { min: n, max: r } = e;
	if (!(r > n)) return 0;
	let i = Math.min(r, Math.max(n, t)), a = e.curve === "log" && n > 0 ? Math.log(i / n) / Math.log(r / n) : (i - n) / (r - n);
	return Number.isFinite(a) ? a : 0;
}
function U(e, t) {
	let { min: n, max: r } = e, i = Math.min(1, Math.max(0, Number.isFinite(t) ? t : 0));
	return e.curve === "log" && n > 0 ? n * (r / n) ** i : n + (r - n) * i;
}
function de(e, t) {
	return H[e].find((e) => e.path === t);
}
function fe(e) {
	let t = {};
	for (let n of H[e]) t[n.path] = n.default;
	return t;
}
function pe(e, t) {
	if (e.kind === "choice") return typeof t == "string" && e.choices.some((e) => e.value === t) ? t : void 0;
	if (typeof t != "number" || !Number.isFinite(t)) return;
	let n = Math.min(e.max, Math.max(e.min, t));
	return e.step === 1 && (n = Math.round(n)), n;
}
function me(e, t) {
	return W(H[e], t);
}
function W(e, t) {
	let n = typeof t == "object" && t ? t : {}, r = {};
	for (let t of e) {
		let e = Object.prototype.hasOwnProperty.call(n, t.path);
		r[t.path] = (e ? pe(t, n[t.path]) : void 0) ?? t.default;
	}
	return r;
}
function he(e, t, n) {
	let r = e.visibleWhen;
	if (!r) return !0;
	let i = t[r.path] ?? de(n, r.path)?.default;
	return typeof i == "string" && r.equals.includes(i);
}
var ge = /* @__PURE__ */ new Set([
	"__proto__",
	"prototype",
	"constructor"
]);
function _e(e, t, n) {
	let r = t.split(".");
	if (r.some((e) => e === "" || ge.has(e))) throw Error(`Invalid param path "${t}"`);
	let i = e;
	for (let e = 0; e < r.length - 1; e++) {
		let t = i[r[e]];
		(typeof t != "object" || !t) && (i[r[e]] = {}), i = i[r[e]];
	}
	i[r[r.length - 1]] = n;
}
function ve(e, t) {
	let n = {};
	for (let r of H[e]) he(r, t, e) && A(n, e, r, t[r.path] ?? r.default);
	return n;
}
function ye(e, t, n) {
	let r = {};
	for (let i of H[e]) i.path !== n && i.visibleWhen?.path !== n || !he(i, t, e) || A(r, e, i, t[i.path] ?? i.default);
	return r;
}
var be = [
	"filter",
	"distortion",
	"bitcrusher",
	"chorus",
	"phaser",
	"tremolo",
	"eq",
	"compressor"
];
function xe(e) {
	return typeof e == "string" && be.includes(e);
}
var Se = [
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
], Ce = Se.map(({ value: e, label: t }) => ({
	value: e,
	label: t
}));
function we(e) {
	return Se.find((t) => t.value === e)?.quarters ?? null;
}
function Te(e, t) {
	let n = we(e) ?? 1;
	return 60 / (Number.isFinite(t) && t > 0 ? t : 120) * n;
}
var Ee = () => {
	let e = v("wet", "Mix", "Mix", {
		min: 0,
		max: 1,
		default: 1,
		curve: "linear",
		step: .01,
		unit: ""
	}, "How much of the effected sound is heard against the dry sound going in.", "At 1 you hear only the pedal; lower values blend the untouched sound back in.");
	return e.modulatable = !0, e;
}, G = (e) => (e.modulatable = !0, e), De = (e) => (e.rebuild = !0, e), Oe = [
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
function ke() {
	return [
		y("type", "Type", "Filter", [
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
		G(v("frequency", "Cutoff", "Filter", {
			min: 20,
			max: 2e4,
			default: 1200,
			curve: "log",
			unit: "Hz"
		}, "Where the filter starts to act on the whole instrument, after every layer is mixed.", "Sweep it slowly for the classic filter rise; an LFO on it gives a wah or a slow throb.")),
		G(v("Q", "Resonance", "Filter", {
			min: .1,
			max: 20,
			default: 1,
			curve: "log",
			step: .1,
			unit: ""
		}, "How much the filter emphasizes the frequencies right at the cutoff.", "Higher values add a vocal, whistling peak that sings as the cutoff moves; very high values squeal."))
	];
}
function Ae() {
	return [
		v("distortion", "Drive", "Distortion", {
			min: 0,
			max: 1,
			default: .4,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How hard the sound is pushed into the waveshaper that clips its peaks.", "Low values add a warm, gritty edge like a tube amp; high values turn into a buzzy fuzz pedal."),
		y("oversample", "Quality", "Distortion", [
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
		Ee()
	];
}
function je() {
	return [v("bits", "Bits", "Bitcrusher", {
		min: 1,
		max: 16,
		default: 4,
		curve: "linear",
		step: 1,
		unit: "bits"
	}, "How many volume steps the sound is rounded to; each bit doubles the number of steps.", "Around 8 bits sounds like an old console sample; 3 or 4 bits turn into a fizzy, broken-speaker crunch."), Ee()];
}
function Me() {
	return [
		G(v("frequency", "Rate", "Chorus", {
			min: .1,
			max: 20,
			default: 1.5,
			curve: "log",
			step: .01,
			unit: "Hz"
		}, "How fast the chorus sweeps its delayed copies, in sweeps per second.", "Slow rates shimmer gently like a twelve-string; fast ones wobble toward vibrato.")),
		v("delayTime", "Delay time", "Chorus", {
			min: 2,
			max: 20,
			default: 3.5,
			curve: "log",
			step: .1,
			unit: "ms"
		}, "How far behind the original the delayed copies sit before they sweep.", "Short delays give a tight shimmer; longer ones spread into a doubled, slightly detuned ensemble."),
		v("depth", "Depth", "Chorus", {
			min: 0,
			max: 1,
			default: .7,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How far the delayed copies sweep back and forth.", "Deeper settings make the pitch wobble more noticeably, from lush to seasick."),
		v("feedback", "Feedback", "Chorus", {
			min: 0,
			max: .9,
			default: 0,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How much of the chorus output is fed back into itself.", "A little adds a metallic, flanger-like edge; more makes it ring."),
		v("spread", "Width", "Chorus", {
			min: 0,
			max: 180,
			default: 180,
			curve: "linear",
			step: 1,
			unit: "°"
		}, "How far apart the left and right sweeps run, in degrees of their cycle.", "At 180 the two sides move opposite each other for a wide stereo image; at 0 the chorus sits in the middle."),
		Ee()
	];
}
function Ne() {
	return [
		G(v("frequency", "Rate", "Phaser", {
			min: .05,
			max: 20,
			default: .5,
			curve: "log",
			step: .01,
			unit: "Hz"
		}, "How fast the phaser sweeps its notches up and down, in sweeps per second.", "Slow rates give the swooshing jet sound; fast ones turn into a bubbly warble.")),
		v("octaves", "Range", "Phaser", {
			min: 0,
			max: 6,
			default: 3,
			curve: "linear",
			step: .1,
			unit: "oct"
		}, "How many octaves the notches sweep above their starting frequency.", "Small ranges are subtle and throaty; wide ranges sweep dramatically from dark to bright."),
		v("baseFrequency", "Base frequency", "Phaser", {
			min: 50,
			max: 2e3,
			default: 350,
			curve: "log",
			unit: "Hz"
		}, "The lowest point of the sweep.", "Low values make the sweep growl through the body of the sound; high values keep it up in the sizzle."),
		G(v("Q", "Resonance", "Phaser", {
			min: .1,
			max: 20,
			default: 10,
			curve: "log",
			step: .1,
			unit: ""
		}, "How sharp and pronounced the sweeping notches are.", "Higher values make the sweep whistle and stand out; lower values keep it soft.")),
		De(v("stages", "Stages", "Phaser", {
			min: 1,
			max: 12,
			default: 10,
			curve: "linear",
			step: 1,
			unit: ""
		}, "How many filter stages build the effect; more stages carve more notches.", "Few stages sound gentle and vintage; many sound deep and dramatic, and cost more processing.")),
		Ee()
	];
}
function Pe() {
	return [
		G(v("frequency", "Rate", "Tremolo", {
			min: .1,
			max: 40,
			default: 6,
			curve: "log",
			step: .01,
			unit: "Hz"
		}, "How fast the volume pulses, in pulses per second.", "Around 4–8 Hz is the classic surf-amp shimmer; faster rates flutter like a helicopter.")),
		G(v("depth", "Depth", "Tremolo", {
			min: 0,
			max: 1,
			default: .5,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How far the volume dips on each pulse.", "Low values add a gentle pulse; at 1 the sound chops all the way to silence.")),
		y("type", "Shape", "Tremolo", Oe, "sine", "The shape of each volume pulse.", "Sine is smooth and gentle; square chops hard like a gate, and sawtooth gives a pumping swell."),
		v("spread", "Width", "Tremolo", {
			min: 0,
			max: 180,
			default: 0,
			curve: "linear",
			step: 1,
			unit: "°"
		}, "How far apart the left and right pulses run, in degrees of their cycle.", "At 180 the sound bounces between the speakers like an auto-panner; at 0 both sides pulse together."),
		Ee()
	];
}
var Fe = (e, t, n, r) => G(v(e, t, "EQ", {
	min: -24,
	max: 12,
	default: 0,
	curve: "linear",
	step: .1,
	unit: "dB"
}, n, r));
function Ie() {
	return [
		Fe("low", "Low gain", "Boosts or cuts everything below the low split.", "Cut it to stop a lead muddying the bass; boost it for a fatter bottom end."),
		Fe("mid", "Mid gain", "Boosts or cuts the band between the two splits, where most of a sound's body lives.", "Cutting scoops the sound out like a metal guitar tone; boosting pushes it forward like a telephone."),
		Fe("high", "High gain", "Boosts or cuts everything above the high split.", "Boost for air and sparkle; cut to tame a harsh, fizzy top."),
		v("lowFrequency", "Low split", "EQ", {
			min: 40,
			max: 1e3,
			default: 400,
			curve: "log",
			unit: "Hz"
		}, "Where the low band ends and the mid band begins.", "Lower settings let the low knob touch only the deep bass; higher ones reach into the warmth."),
		v("highFrequency", "High split", "EQ", {
			min: 1e3,
			max: 1e4,
			default: 2500,
			curve: "log",
			unit: "Hz"
		}, "Where the mid band ends and the high band begins.", "Lower settings let the high knob shape the bite of the sound; higher ones touch only the sheen.")
	];
}
function Le() {
	return [
		G(v("threshold", "Threshold", "Compressor", {
			min: -60,
			max: 0,
			default: -24,
			curve: "linear",
			step: .5,
			unit: "dB"
		}, "The level above which the compressor starts turning the sound down.", "Lower thresholds squash more of the sound, evening out loud and quiet notes.")),
		v("ratio", "Ratio", "Compressor", {
			min: 1,
			max: 20,
			default: 4,
			curve: "log",
			step: .1,
			unit: ":1"
		}, "How strongly sound above the threshold is turned down: at 4:1, every 4 dB over comes out as 1 dB over.", "Low ratios are gentle glue; high ratios flatten peaks like a limiter."),
		v("attack", "Attack", "Compressor", {
			min: .001,
			max: .5,
			default: .003,
			curve: "log",
			unit: "s"
		}, "How quickly the compressor clamps down once the sound crosses the threshold.", "Slower attacks let the click at the start of each note through, which makes plucks and drums punchier."),
		v("release", "Release", "Compressor", {
			min: .01,
			max: 1,
			default: .25,
			curve: "log",
			unit: "s"
		}, "How quickly the compressor lets go once the sound falls back under the threshold.", "Short releases pump and breathe audibly; long ones hold the level smooth."),
		v("knee", "Knee", "Compressor", {
			min: 0,
			max: 40,
			default: 30,
			curve: "linear",
			step: 1,
			unit: "dB"
		}, "How gradually compression fades in around the threshold.", "A hard knee (low) grabs abruptly; a soft knee (high) eases in and sounds more natural.")
	];
}
var Re = {
	filter: ke(),
	distortion: Ae(),
	bitcrusher: je(),
	chorus: Me(),
	phaser: Ne(),
	tremolo: Pe(),
	eq: Ie(),
	compressor: Le()
};
function ze(e) {
	return Re[e];
}
function Be(e, t) {
	return Re[e].find((e) => e.path === t);
}
var Ve = [
	"reverb",
	"delay",
	"chorus"
], He = {
	reverb: "Reverb",
	delay: "Delay",
	chorus: "Chorus"
};
function Ue(e) {
	return typeof e == "string" && Ve.includes(e);
}
var We = {
	reverb: [v("decay", "Decay", "Reverb", {
		min: .2,
		max: 12,
		default: 2.5,
		curve: "log",
		step: .01,
		unit: "s"
	}, "How long the room keeps ringing after a sound stops. Changing it rebuilds the room, so expect a brief glitch.", "Short decays sound like a small room; long ones like a hall or a cave."), v("preDelay", "Pre-delay", "Reverb", {
		min: 0,
		max: .25,
		default: .02,
		curve: "linear",
		step: .001,
		unit: "s"
	}, "A short gap before the reverb starts, as if the walls were farther away.", "A little pre-delay keeps notes crisp in front of the reverb instead of smearing into it.")],
	delay: [y("division", "Time", "Delay", Ce, "8n.", "The gap between echoes, locked to the song's tempo.", "A dotted eighth gives the galloping echo of countless lead lines; a quarter note sounds like a canyon answering back."), v("feedback", "Feedback", "Delay", {
		min: 0,
		max: .9,
		default: .35,
		curve: "linear",
		step: .01,
		unit: ""
	}, "How much of each echo is fed back to make the next one.", "Low values give one or two repeats; high values keep echoing for a long time.")],
	chorus: [
		v("frequency", "Rate", "Chorus", {
			min: .1,
			max: 20,
			default: 1.5,
			curve: "log",
			step: .01,
			unit: "Hz"
		}, "How fast the chorus sweeps its delayed copies, in sweeps per second.", "Slow rates shimmer gently; fast ones wobble toward vibrato."),
		v("delayTime", "Delay time", "Chorus", {
			min: 2,
			max: 20,
			default: 3.5,
			curve: "log",
			step: .1,
			unit: "ms"
		}, "How far behind the original the delayed copies sit.", "Short delays give a tight shimmer; longer ones spread into a doubled ensemble."),
		v("depth", "Depth", "Chorus", {
			min: 0,
			max: 1,
			default: .7,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How far the delayed copies sweep back and forth.", "Deeper settings wobble the pitch more, from lush to seasick."),
		v("spread", "Width", "Chorus", {
			min: 0,
			max: 180,
			default: 180,
			curve: "linear",
			step: 1,
			unit: "°"
		}, "How far apart the left and right sweeps run.", "At 180 the chorus is as wide as it gets; at 0 it sits in the middle.")
	]
};
function Ge(e) {
	return We[e];
}
function Ke(e) {
	return W(We[e], {});
}
function qe(e, t) {
	return W(We[e], t);
}
var Je = [
	"sine",
	"triangle",
	"square",
	"sawtooth"
], K = {
	shape: y("shape", "Shape", "LFO", Oe, "sine", "The shape of the slow wave that turns the knobs it is connected to.", "Sine and triangle sweep smoothly back and forth; square flips between two settings, and sawtooth ramps up and snaps back."),
	division: y("division", "Rate", "LFO", Ce, "1m", "One full sweep, as a note length at the song's tempo.", "Longer divisions give slow evolving movement; short ones give rhythmic pulsing that stays in time with the song."),
	hz: v("hz", "Rate", "LFO", {
		min: .02,
		max: 20,
		default: 1,
		curve: "log",
		step: .01,
		unit: "Hz"
	}, "Sweeps per second, independent of the tempo.", "Below 1 Hz the movement drifts slowly; around 5 Hz it becomes vibrato or tremolo territory."),
	depth: v("depth", "Depth", "LFO", {
		min: 0,
		max: 1,
		default: .5,
		curve: "linear",
		step: .01,
		unit: ""
	}, "How far the LFO swings each connected knob, centered on its current setting.", "Small depths add subtle life; large ones swing the knob across most of its range."),
	delay: v("delay", "Delay", "LFO", {
		min: 0,
		max: 10,
		default: 0,
		curve: "linear",
		step: .01,
		unit: "s"
	}, "How long each note holds its pitch still before this LFO's wobble starts. The wobble's timing stays shared by every note; only when it reaches each one changes. Knobs other than pitch ignore it.", "A held note that sings straight, then blooms into vibrato, like a trumpet or a singer."),
	fade: v("fade", "Fade", "LFO", {
		min: 0,
		max: 10,
		default: 0,
		curve: "linear",
		step: .01,
		unit: "s"
	}, "How long each note's wobble takes to grow from nothing to full depth once Delay is over. Knobs other than pitch ignore it.", "Zero snaps the vibrato in at full depth; a second or so lets it swell in gently."),
	connectionDepth: v("depth", "Amount", "LFO", {
		min: -1,
		max: 1,
		default: 1,
		curve: "linear",
		step: .01,
		unit: ""
	}, "How much of this LFO's swing reaches this one knob, on top of the LFO's overall Depth. Negative values invert it.", "Run two knobs at opposite amounts and one rises while the other falls.")
};
function Ye(e, t) {
	return e.sync ? 1 / Te(e.division, t) : Number.isFinite(e.hz) ? Math.min(K.hz.max, Math.max(K.hz.min, e.hz)) : K.hz.default;
}
var Xe = {
	division: y("division", "Rate", "Repeat", Ce, "16n", "How often a held note strikes again, as a note length on the song's grid. The first strike is the key press; the rest land on the beat.", "A 1/16 roll locks in with the drums; 1/32 at a fast tempo blurs into a buzz."),
	hz: v("hz", "Rate", "Repeat", {
		min: .5,
		max: 40,
		default: 8,
		curve: "log",
		step: .1,
		unit: "Hz"
	}, "Strikes per second while a note is held, counted from the moment each key goes down, like the old organs' Repeat tab.", "Around 8 Hz a banjo goes plink, plink, plink; past 25 Hz the strikes run together into a mechanical, pitched buzz.")
};
function Ze(e, t) {
	return e.sync ? 1 / Te(e.division, t) : Number.isFinite(e.hz) ? Math.min(Xe.hz.max, Math.max(Xe.hz.min, e.hz)) : Xe.hz.default;
}
function Qe(e) {
	if (typeof e != "object" || !e || Array.isArray(e)) return null;
	let t = e, n = q(t, "division");
	return {
		on: q(t, "on") === !0,
		sync: q(t, "sync") === !0,
		division: typeof n == "string" && we(n) !== null ? n : Xe.division.default,
		hz: ct(q(t, "hz"), Xe.hz.min, Xe.hz.max, Xe.hz.default)
	};
}
var $e = {
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
function et(e, t) {
	return `layer:${e}:${t}`;
}
function tt(e) {
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
function nt(e, t) {
	let n = tt(t);
	if (!n) return null;
	if (n.kind === "layer") {
		let t = e.layers[n.layer];
		if (!t) return null;
		if (n.path === "volume") return $e;
		let r = de(t.voiceType, n.path);
		return r?.kind === "number" && le(t.voiceType, n.path) ? r : null;
	}
	let r = e.effects?.find((e) => e.id === n.effectId), i = r ? Be(r.type, n.path) : void 0;
	return i?.kind === "number" && i.modulatable ? i : null;
}
function rt(e, t) {
	let n = nt(e, t), r = tt(t);
	if (!n || !r) return null;
	let i;
	if (r.kind === "layer") {
		let t = e.layers[r.layer];
		i = r.path === "volume" ? t.volume : t.params[r.path];
	} else i = e.effects.find((e) => e.id === r.effectId).params[r.path];
	return typeof i == "number" && Number.isFinite(i) ? i : n.default;
}
function it(e, t) {
	let n = nt(e, t);
	return n && tt(t)?.kind === "layer" && n.unit === "cents" && n.curve === "linear" ? (n.max - n.min) / 2 : null;
}
function at(e) {
	return (e.delay ?? 0) > 0 || (e.fade ?? 0) > 0;
}
function ot(e, t, n) {
	let r = ue(e, t), i = Math.min(1, Math.abs(Number.isFinite(n) ? n : 0)) / 2, a = U(e, r - i), o = U(e, r + i);
	return n < 0 ? [o, a] : [a, o];
}
var q = (e, t) => Object.hasOwn(e, t) ? e[t] : void 0;
function st(e) {
	if (typeof e != "string") return null;
	let t = e.trim();
	return t.length > 0 && t.length <= 64 && !t.includes(":") && ![
		"__proto__",
		"prototype",
		"constructor"
	].includes(t) ? t : null;
}
var ct = (e, t, n, r) => typeof e == "number" && Number.isFinite(e) ? Math.min(n, Math.max(t, e)) : r;
function lt(e) {
	if (typeof e != "object" || !e || Array.isArray(e)) return null;
	let t = e, n = st(q(t, "id")), r = q(t, "type");
	return n === null || !xe(r) ? null : {
		id: n,
		type: r,
		bypass: q(t, "bypass") === !0,
		params: W(Re[r], q(t, "params"))
	};
}
function ut(e, t) {
	if (typeof e != "object" || !e || Array.isArray(e)) return null;
	let n = e, r = st(q(n, "id"));
	if (r === null) return null;
	let i = q(n, "shape"), a = q(n, "division"), o = [], s = q(n, "connections");
	if (Array.isArray(s)) for (let e of s.slice(0, 64)) {
		if (o.length >= 16) break;
		if (typeof e != "object" || !e) continue;
		let n = q(e, "target");
		typeof n == "string" && t(n) && !o.some((e) => e.target === n) && o.push({
			target: n,
			depth: ct(q(e, "depth"), -1, 1, 1)
		});
	}
	let c = ct(q(n, "delay"), 0, 10, 0), l = ct(q(n, "fade"), 0, 10, 0);
	return {
		id: r,
		shape: Je.includes(i) ? i : "sine",
		sync: q(n, "sync") !== !1,
		division: typeof a == "string" && we(a) !== null ? a : K.division.default,
		hz: ct(q(n, "hz"), K.hz.min, K.hz.max, K.hz.default),
		depth: ct(q(n, "depth"), 0, 1, K.depth.default),
		...c > 0 ? { delay: c } : {},
		...l > 0 ? { fade: l } : {},
		connections: o
	};
}
function dt(e) {
	let t = [];
	if (!Array.isArray(e)) return t;
	for (let n of e.slice(0, 24)) {
		if (t.length >= 6) break;
		let e = lt(n);
		e && !t.some((t) => t.id === e.id) && t.push(e);
	}
	return t;
}
function ft(e, t) {
	let n = [];
	if (!Array.isArray(e)) return n;
	let r = /* @__PURE__ */ new Set(), i = (e) => !r.has(e) && nt(t, e) !== null;
	for (let t of e.slice(0, 12)) {
		if (n.length >= 3) break;
		let e = ut(t, i);
		if (e && !n.some((t) => t.id === e.id)) {
			for (let t of e.connections) r.add(t.target);
			n.push(e);
		}
	}
	return n;
}
//#endregion
//#region src/engine/formant-voice.ts
function pt() {
	let { "envelope.attack": e, "envelope.release": t, ...n } = fe("FormantVoice");
	return mt({
		...n,
		attack: e,
		release: t
	}, {});
}
function mt(e, t) {
	let n = { ...e }, r = n;
	for (let [e, i] of Object.entries(t)) if (e === "envelope" && typeof i == "object" && i) {
		let e = i;
		typeof e.attack == "number" && (n.attack = e.attack), typeof e.release == "number" && (n.release = e.release);
	} else Object.hasOwn(r, e) && typeof i == typeof r[e] && (r[e] = i);
	return n;
}
var ht = .35, gt = .47, _t = 1.6, vt = .12, yt = 6e3, bt = .006, xt = .05, St = Array.from({ length: 40 }, (e, t) => 1 / (t + 1) ** 1.6);
function Ct(e) {
	return 1200 * Math.log2(Math.min(2, Math.max(.5, e * 2)));
}
var wt = class {
	osc;
	tilt;
	breathSig;
	shiftSig;
	vibLfo;
	Tone;
	p;
	nodes = [];
	srcGain;
	puff;
	formants;
	amp;
	env;
	cFilter;
	cGain;
	vibDepth;
	noise;
	rough = null;
	running = !1;
	sleepTimer = null;
	source = "";
	lastHz = 0;
	curHz = 0;
	constructor(e, t) {
		this.Tone = e, this.p = mt(pt(), t);
		let n = this.p, r = (e) => (this.nodes.push(e), e);
		this.osc = r(new e.Oscillator({
			type: "sawtooth",
			frequency: 220,
			detune: n.detune
		})), this.tilt = r(new e.BiquadFilter({
			type: "lowpass",
			frequency: n.brightness,
			Q: .7
		})), this.srcGain = r(new e.Gain(1));
		let i = r(new e.Gain(1));
		this.osc.connect(this.tilt), this.tilt.connect(this.srcGain), this.srcGain.connect(i);
		let a = r(new e.Noise("white"));
		this.breathSig = r(new e.Signal(n.breath));
		let o = r(new e.Gain(0));
		this.puff = r(new e.Gain(ht)), this.breathSig.connect(o.gain), a.connect(o), o.connect(this.puff), this.puff.connect(i);
		let s = r(new e.Gain(-.5));
		this.breathSig.connect(s), s.connect(this.srcGain.gain), this.amp = r(new e.Gain(0)), this.env = r(new e.Gain(0)), this.shiftSig = r(new e.Signal(n.formantShift));
		let c = r(new e.Gain(.5)), l = r(new e.WaveShaper(Ct, 1024));
		this.shiftSig.connect(c), c.connect(l), this.formants = [
			0,
			1,
			2,
			3
		].map(() => {
			let t = r(new e.BiquadFilter({
				type: "bandpass",
				frequency: 500,
				Q: 8
			})), n = r(new e.Gain(0));
			return i.connect(t), t.connect(n), n.connect(this.amp), l.connect(t.detune), {
				filter: t,
				gain: n
			};
		}), this.amp.connect(this.env), this.cFilter = r(new e.BiquadFilter({
			type: "bandpass",
			frequency: 3e3,
			Q: 2.5
		})), this.cGain = r(new e.Gain(0)), a.connect(this.cFilter), this.cFilter.connect(this.cGain), this.cGain.connect(this.env), this.vibLfo = r(new e.LFO({
			frequency: n.vibRate,
			min: -1,
			max: 1
		})), this.vibDepth = r(new e.Gain(0)), this.vibLfo.connect(this.vibDepth), this.vibDepth.connect(this.osc.detune), this.noise = a, this.applySource(), this.applyRoughness();
	}
	wake(e) {
		this.cancelSleep(), !this.running && (this.running = !0, this.osc.start(e), this.noise.start(e), this.vibLfo.start(e), this.rough?.lfo.start(e));
	}
	sleepAfter(e) {
		this.cancelSleep();
		let t = this.Tone.getContext();
		typeof t.setTimeout == "function" && (this.sleepTimer = t.setTimeout(() => {
			if (this.sleepTimer = null, !this.running) return;
			let e = this.Tone.immediate();
			this.running = !1, this.osc.stop(e), this.noise.stop(e), this.vibLfo.stop(e), this.rough?.lfo.stop(e);
		}, Math.max(0, e - this.Tone.immediate())));
	}
	cancelSleep() {
		this.sleepTimer !== null && (this.Tone.getContext().clearTimeout(this.sleepTimer), this.sleepTimer = null);
	}
	get awake() {
		return this.running;
	}
	connect(e) {
		return this.env.connect(e), this;
	}
	set(e) {
		let t = mt(this.p, e), n = this.p;
		return this.p = t, t.brightness !== n.brightness && this.tilt.frequency.rampTo(t.brightness, .05), t.breath !== n.breath && this.breathSig.rampTo(t.breath, .05), t.formantShift !== n.formantShift && this.shiftSig.rampTo(t.formantShift, .05), t.vibRate !== n.vibRate && this.vibLfo.frequency.rampTo(t.vibRate, .05), t.detune !== n.detune && this.osc.detune.rampTo(t.detune, .05), this.applySource(), this.applyRoughness(), this;
	}
	applySource() {
		let e = this.p.source === "saw" ? "saw" : "glottal";
		e !== this.source && (this.source = e, e === "saw" ? this.osc.type = "sawtooth" : this.osc.partials = St);
	}
	applyRoughness() {
		let e = Math.min(1, Math.max(0, this.p.roughness)), t = 30 + 30 * e;
		if (e <= 0) {
			if (!this.rough) return;
			this.amp.disconnect(this.rough.gain), this.amp.connect(this.env), this.rough.lfo.dispose(), this.rough.gain.dispose(), this.rough = null;
			return;
		}
		if (this.rough) {
			if (this.rough.amount === e) return;
			this.rough.amount = e, this.rough.lfo.min = 1 - e, this.rough.lfo.frequency.rampTo(t, .05);
			return;
		}
		let n = new this.Tone.Gain(1), r = new this.Tone.LFO({
			frequency: t,
			type: "square",
			min: 1 - e,
			max: 1
		});
		r.connect(n.gain), this.amp.disconnect(this.env), this.amp.connect(n), n.connect(this.env), this.running && r.start(this.Tone.immediate()), this.rough = {
			gain: n,
			lfo: r,
			amount: e
		};
	}
	sing(e, t, n, r) {
		this.wake(t);
		let a = this.p, o = l(a.seed, r.key ?? r.index, r.midi), { syllable: s, manual: c } = d({
			mode: a.syllableMode,
			set: a.syllableSet,
			vowelA: a.vowelA,
			vowelB: a.vowelB,
			randomness: a.randomness
		}, f(r, a.chordSyllables), o, r.syllable), u = e * 2 ** ((o() - .5) * 2 * a.randomness * 25 / 1200), m = 1 + (o() - .5) * .1 * a.randomness, g = a.formantShift * m, _ = h(s.a, a.voiceMix, m), v = h(s.b, a.voiceMix, m), y = _.map((e, t) => e.map((e, n) => e + (v[t][n] - e) * a.morph)), b = a.consonant, x = !c && b > .02 && s.c ? i[s.c] ?? null : null, S = null, C = null;
		if (x?.vowel) {
			let e = h(x.vowel, a.voiceMix, m);
			S = e.map((e) => e[0]), C = e.map((e) => e[1]);
		} else x?.locus && (S = x.locus.map((e) => e * m), C = x.lg ? x.lg.map(p) : _.map((e) => e[1]));
		let w = x ? Math.max(.015, x.trans * (.4 + .6 * b)) : 0, T = x?.vot ?? 0, E = t + .004 + T, D = E + w, O = D + .1, k = O + a.morphTime, A = this.osc.frequency;
		A.cancelAndHoldAtTime(t);
		let j = A.getValueAtTime(t), M = typeof j == "number" && Number.isFinite(j) ? j : 0, N = u;
		a.scoop > 0 ? N = u * 2 ** (-a.scoop / 1200) : a.portamento > 0 && this.lastHz > 0 && (N = M > 0 ? M : this.lastHz), A.setValueAtTime(N, t), N !== u && A.exponentialRampToValueAtTime(u, t + Math.max(.02, a.portamento)), this.lastHz = u, this.curHz = u;
		let P = this.vibDepth.gain;
		P.cancelAndHoldAtTime(t), P.setValueAtTime(0, t), P.setValueAtTime(0, t + a.vibDelay), P.linearRampToValueAtTime(a.vibDepth, t + a.vibDelay + .3), this.formants.forEach((e, n) => {
			let [r, i, o] = _[n], s = Math.max(1, r * a.formantShift / (o * a.bandwidth)), c = e.filter.frequency, l = e.gain.gain;
			e.filter.Q.cancelAndHoldAtTime(t), e.filter.Q.setValueAtTime(s, t), c.cancelAndHoldAtTime(t), l.cancelAndHoldAtTime(t), c.setValueAtTime(S ? S[n] : r, t), l.setValueAtTime((C ? C[n] : i) * _t, t), c.linearRampToValueAtTime(r, D), l.linearRampToValueAtTime(i * _t, D), a.morph > .01 && (c.setValueAtTime(r, O), c.linearRampToValueAtTime(y[n][0], k), l.setValueAtTime(i * _t, O), l.linearRampToValueAtTime(y[n][1] * _t, k));
		});
		let F = this.amp.gain;
		if (F.cancelAndHoldAtTime(t), F.linearRampToValueAtTime(0, t + .004), x?.kind === "nasal") {
			let e = t + .004 + Math.max(.016, a.attack);
			F.linearRampToValueAtTime(1 - .65 * b, e), F.linearRampToValueAtTime(1, Math.max(D, e + .01));
		} else F.setValueAtTime(0, E), F.linearRampToValueAtTime(1, E + Math.max(.004, a.attack));
		let I = this.env.gain;
		I.cancelAndHoldAtTime(t), I.linearRampToValueAtTime(.5 + .5 * n, t + .005);
		let L = this.puff.gain;
		L.cancelAndHoldAtTime(t), L.setValueAtTime(gt, t), L.linearRampToValueAtTime(ht, t + .15);
		let R = this.cGain.gain;
		if (R.cancelAndHoldAtTime(t), R.linearRampToValueAtTime(0, t + bt), x?.burst) {
			let [e, n, r] = x.burst, i = t + r + T, a = Math.min(yt, e * Math.sqrt(g));
			this.cFilter.frequency.cancelAndHoldAtTime(t), this.cFilter.Q.cancelAndHoldAtTime(t), this.cFilter.frequency.linearRampToValueAtTime(a, t + bt), this.cFilter.Q.linearRampToValueAtTime(n, t + bt), R.linearRampToValueAtTime(vt * b, t + bt * 2), R.exponentialRampToValueAtTime(1e-4, Math.max(i, t + bt * 3)), R.linearRampToValueAtTime(0, Math.max(i, t + bt * 3) + bt);
		}
	}
	release(e) {
		let t = this.p, n = this.env.gain;
		if (n.cancelAndHoldAtTime(e), n.linearRampToValueAtTime(0, e + t.release), t.pitchDrop > 0 && this.curHz > 0) {
			let n = this.osc.frequency;
			n.cancelAndHoldAtTime(e), n.exponentialRampToValueAtTime(this.curHz * 2 ** (-t.pitchDrop / 1200), e + t.release);
		}
		let r = this.cGain.gain;
		r.cancelAndHoldAtTime(e), r.linearRampToValueAtTime(0, e + bt), this.sleepAfter(e + Math.max(t.release, bt) + xt);
	}
	cut(e) {
		let t = [
			this.osc.frequency,
			this.vibDepth.gain,
			this.amp.gain,
			this.env.gain,
			this.puff.gain,
			this.cGain.gain,
			this.cFilter.frequency,
			this.cFilter.Q
		];
		for (let e of this.formants) t.push(e.filter.frequency, e.filter.Q, e.gain.gain);
		for (let n of t) n.cancelAndHoldAtTime(e);
	}
	dispose() {
		this.cancelSleep(), this.rough &&= (this.rough.lfo.dispose(), this.rough.gain.dispose(), null);
		for (let e of this.nodes) e.dispose();
		this.nodes.length = 0;
	}
};
function Tt(e) {
	return !!e?.kit && Array.isArray(e.kit.pads);
}
function Et(e) {
	return e.layers.slice(0, Tt(e) ? 96 : 3);
}
function Dt(e, t) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(127, Math.max(0, Math.round(e))) : t;
}
function Ot(e, t, n = () => !0) {
	let r = typeof e == "object" && e && !Array.isArray(e) ? e : {}, i = Dt(Object.hasOwn(r, "note") ? r.note : void 0, t), a = Object.hasOwn(r, "name") ? r.name : void 0, o = typeof a == "string" && a.replace(/[\u0000-\u001f\u007f]/g, " ").trim() ? a.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 24) : It(i), s = Object.hasOwn(r, "layers") ? r.layers : void 0, c = Array.isArray(s) ? [...new Set(s.filter((e) => typeof e == "number" && Number.isInteger(e) && e >= 0 && n(e)))].slice(0, 3) : [], l = {
		name: o,
		note: i,
		pitch: Dt(Object.hasOwn(r, "pitch") ? r.pitch : void 0, i),
		layers: c
	}, u = Object.hasOwn(r, "choke") ? r.choke : void 0;
	return typeof u == "number" && Number.isInteger(u) && u >= 1 && u <= 8 && (l.choke = u), l;
}
function kt(e, t) {
	if (!Array.isArray(e)) return null;
	let n = Math.min(t.length, 96), r = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set(), a = [];
	for (let t = 0; t < Math.min(e.length, 32); t++) {
		let o = Ot(e[t], 36 + t, (e) => e < n && !r.has(e));
		if (o.layers.length !== 0) {
			for (let e of o.layers) r.add(e);
			i.has(o.note) && (o.note = jt(o.note, i)), i.add(o.note), a.push(o);
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
function At(e, t) {
	let n = e.map((e) => e.layers.filter((e) => Number.isInteger(e) && e >= 0 && e < t)), r = /* @__PURE__ */ new Map(), i = Array.from({ length: t }, () => !1);
	e.forEach((e, t) => {
		if (n[t].length > 0 && !r.has(e.note) && r.set(e.note, t), e.choke) for (let e of n[t]) i[e] = !0;
	});
	let a = e.flatMap((e, t) => n[t].length > 0 ? [{
		pad: e,
		i: t
	}] : []), o = a.map((e) => e.pad);
	for (let e = 0; e < 128; e++) {
		if (r.has(e)) continue;
		let t = Lt(o, e);
		t !== null && r.set(e, a[t].i);
	}
	return {
		padByNote: r,
		padLayers: n,
		chokes: e.map((t, n) => t.choke ? e.flatMap((e, r) => r !== n && e.choke === t.choke ? [r] : []) : []),
		chokeable: i
	};
}
function jt(e, t) {
	for (let n = 0; n < 128; n++) {
		if (e + n <= 127 && !t.has(e + n)) return e + n;
		if (e - n >= 0 && !t.has(e - n)) return e - n;
	}
	return e;
}
var Mt = {
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
}, Nt = 39;
function Pt(e) {
	return Mt[e] ?? "perc";
}
var Ft = {
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
function It(e) {
	return Ft[e] ?? `Pad ${e}`;
}
function Lt(e, t) {
	if (e.length === 0) return null;
	let n = e.findIndex((e) => e.note === t);
	if (n >= 0) return n;
	let r = Pt(t), i = (e) => e === Nt ? "clap" : Pt(e), a = (n) => {
		let r = null;
		return e.forEach((i, a) => {
			n(i) && (r === null || Math.abs(i.note - t) < Math.abs(e[r].note - t)) && (r = a);
		}), r;
	};
	return a((e) => i(e.note) === i(t)) ?? a((e) => Pt(e.note) === r) ?? a(() => !0);
}
//#endregion
//#region src/engine/note-math.ts
var Rt = 440 * 2 ** (-9 / 12);
function zt(e, t, n) {
	let r = e[t];
	return typeof r == "number" && Number.isFinite(r) ? r : n;
}
function Bt(e, t, n, r) {
	return e > 0 && n > 0 && n !== r && t() > .05;
}
function Vt(e) {
	return 2 ** (Math.round(zt(e, "transpose", 0)) / 12);
}
var Ht = {
	track: 1,
	amount: 1
};
function Ut(e, t, n) {
	let r = zt(e, "keyTrack", 0), i = zt(e, "velocityToFilter", 0);
	return {
		track: r === 0 || !(t > 0) ? 1 : (t / Rt) ** r,
		amount: 1 - i + i * n
	};
}
function Wt(e, t, n, r) {
	let i = t * 2 ** (zt(e, "detune", 0) / 1200);
	e.tuning === "exact" && r > 0 && i > 0 && (i = r / (Math.max(1, Math.round(r / i)) - .5));
	let a = zt(e, "ringTime", 0), o = zt(e, "velocity", 0);
	return {
		hz: i,
		feedback: e.stringDecay === "ring" && a > 0 && i > 0 ? 10 ** (-3 / (i * a)) : null,
		level: 1 - o + o * n
	};
}
//#endregion
//#region src/engine/repeat.ts
var Gt = .25, Kt = 1e-9, qt = (e) => e !== void 0 && [
	e.time,
	e.beat,
	e.bpm
].every(Number.isFinite) && e.bpm > 0;
function Jt(e, t) {
	let n = 0, r = [e], i = () => {
		let e = r.at(-1), n = t(e);
		r.push(n > e ? n : Infinity);
	};
	return {
		at(e) {
			if (e < n) return -Infinity;
			for (; r.length <= e - n && Number.isFinite(r.at(-1));) i();
			return r[e - n] ?? Infinity;
		},
		indexAt(e) {
			for (; r.at(-1) < e - Kt;) i();
			let t = r.findIndex((t) => t >= e - Kt);
			return t > 1024 ? (r.splice(0, t - 1), n += t - 1, n + 1) : n + t;
		}
	};
}
function Yt(e, t, n, r, i) {
	if (!e.sync || !qt(i)) {
		let t = 1 / Ze(e, r);
		return {
			from: n + t,
			period: t
		};
	}
	let a = 1 / Ze(e, i.bpm), o = we(e.division) ?? 1, s = Math.max(t, n) + a * Gt;
	if (i.next) {
		let e = (e) => i.next(e, o), n = e(t);
		for (Number.isNaN(n) && (n = Infinity); n < s;) {
			let t = e(n);
			n = t > n ? t : Infinity;
		}
		return {
			from: n,
			period: a,
			lines: Jt(n, e)
		};
	}
	let c = 60 / i.bpm, l = i.beat + (t - i.time) / c, u = t + ((Math.floor(l / o + 1e-9) + 1) * o - l) * c;
	return u < s && (u += Math.ceil((s - u) / a) * a), {
		from: u,
		period: a
	};
}
function Xt(e, t) {
	return e.lines ? e.lines.indexAt(t) : t <= e.from ? 0 : Math.ceil((t - e.from) / e.period - 1e-9);
}
var Zt = (e, t) => e.lines ? e.lines.at(t) : e.from + t * e.period, Qt = 1e-4, $t = 256, en = 4096, tn = .004, nn = 1e-6;
function rn() {
	let e = [];
	return {
		clear(t) {
			let n = t;
			for (; e.some((e) => Math.abs(e - n) < nn);) n += tn;
			return n;
		},
		add(t) {
			e.push(t);
		},
		prune(t) {
			e.length > 0 && (e = e.filter((e) => e >= t));
		}
	};
}
function an(e, t, n, r, i) {
	let a = Yt(t, n, n, r, i), o = 0, s = Infinity, c = [], l = -Infinity, u = (t) => {
		l = t - Qt, e.cut(l);
	}, d = (e, t = Infinity) => {
		let n = c.findIndex((t) => t >= e);
		n < 0 || (u(Math.min(c[n], t)), c.length = n);
	}, f = (t, n = $t) => {
		e.now && (o = Math.max(o, Xt(a, e.now())));
		for (let r = 0; r < n; r++) {
			let n = Zt(a, o);
			if (n > t || n >= s) break;
			let r = e.clear ? e.clear(n) : n;
			if (r >= s) break;
			e.strike(r), c.push(r), o++;
		}
	};
	return {
		grid: i,
		write: f,
		takeBack(e, t = Infinity) {
			d(e, t), l > t - Qt && u(t);
		},
		reclock(e, t, r, l) {
			if (s !== Infinity) return;
			let u = Yt(e, n, c.filter((e) => e < r).at(-1) ?? n, t, i), p = Xt(u, r);
			d(r, Zt(u, p)), a = u, o = p, f(l);
		},
		prune(e) {
			let t = 0;
			for (; t + 1 < c.length && c[t + 1] < e;) t++;
			t > 0 && c.splice(0, t);
		},
		pendingAfter: (e) => c.some((t) => t > e),
		end(e) {
			s === Infinity && (d(e - Kt), s = e - Kt, f(Infinity, en));
		},
		ended: (e) => s <= e && l <= e
	};
}
function on(e) {
	return 440 * 2 ** ((e - 69) / 12);
}
function sn(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(16, Math.max(1, Math.round(e))) : 1;
}
function cn(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(6, Math.max(-60, e)) : 0;
}
var ln = (e) => typeof e == "object" && !!e && typeof e.setValueAtTime == "function";
function un(e) {
	let t = e?._scale, n = t?._add?.addend, r = t?._mult?.factor;
	return ln(n) && ln(r) ? [n, r] : null;
}
var dn = {
	MonoSynth: [{
		path: "filterEnvelope",
		base: "filterEnvelope.baseFrequency",
		octaves: "filterEnvelope.octaves"
	}],
	DuoSynth: [{
		path: "voice0.filterEnvelope",
		base: "voice0.filterEnvelope.baseFrequency",
		octaves: 3
	}, {
		path: "voice1.filterEnvelope",
		base: "voice1.filterEnvelope.baseFrequency",
		octaves: 3
	}]
}, fn = (e, t, n) => {
	let r = e[t];
	return typeof r == "number" && Number.isFinite(r) ? r : n;
};
function pn(e, t) {
	try {
		e.set(t);
	} catch (t) {
		throw e.dispose(), t;
	}
}
var mn = [
	"envelope._sig",
	"filterEnvelope._sig",
	"modulationEnvelope._sig",
	"voice0.envelope._sig",
	"voice0.filterEnvelope._sig",
	"voice1.envelope._sig",
	"voice1.filterEnvelope._sig",
	"frequency"
];
function hn(e, t, n = mn) {
	for (let r of n) {
		let n = kn(e, r);
		typeof n?.cancelAndHoldAtTime == "function" && n.cancelAndHoldAtTime(t);
	}
}
var gn = [
	"oscillator",
	"_carrier.oscillator",
	"_modulator.oscillator",
	"voice0.oscillator",
	"voice1.oscillator",
	"_oscillators"
];
function _n(e, t) {
	for (let n of gn) {
		let r = kn(e, n);
		for (let e of Array.isArray(r) ? r : [r]) {
			let n = e?._state;
			if (typeof e?.start != "function" || !n || n.getValueAtTime(t) !== "started") continue;
			let r = n.getNextState("stopped", t);
			r && r.time - t > 1e-5 && e.start((t + r.time) / 2);
		}
	}
}
function vn(e) {
	if (typeof e.setNote != "function") return;
	let t = e.setNote.bind(e), n = 0;
	e.setNote = (r, i) => {
		let a = n;
		return n = r, Bt(e.portamento, () => e.getLevelAtTime(e.toSeconds(i)), a, r) ? (e.frequency.exponentialRampTo(r, e.portamento, e.toSeconds(i)), e) : t(r, i);
	};
}
var yn = tn, bn = .25, xn = .1, Sn = 30;
function Cn(e, t, n, r) {
	let i = -Infinity, a = (t) => (i = Math.max(t ?? e.immediate(), i + yn), i), o = (t) => Math.max(t ?? e.immediate(), i);
	if (t === "FormantVoice") {
		let t = new wt(e, n);
		return {
			attack: (e, n, r, i) => t.sing(e, a(n), r, i),
			restrike: (e, n, r, i) => t.sing(e, n, r, i),
			cut: (e) => t.cut(e),
			release: (e) => t.release(o(e)),
			startsAfter: (e) => i > e,
			attackedAt: () => i,
			node: t
		};
	}
	if (t === "NoiseSynth") {
		let t = new e.NoiseSynth();
		return pn(t, n), {
			attack(e, n, r, i, o) {
				if (!o) return void t.triggerAttack(a(n), r);
				let s = a(n);
				t.envelope.triggerAttack(s, r), t.noise.start(s);
			},
			restrike: (e, n, r) => void t.envelope.triggerAttack(n, r),
			cut: (e) => hn(t, e),
			release: (e) => void t.triggerRelease(o(e)),
			startsAfter: (e) => i > e,
			attackedAt: () => i,
			node: t
		};
	}
	let s = e[t], c = new s();
	pn(c, n), t === "MembraneSynth" && vn(c);
	let l = {
		attackTime: a,
		releaseTime: o,
		lastAttack: () => i,
		immediate: () => e.immediate()
	};
	if (t === "PluckSynth") return Tn(c, l, r);
	let u = dn[t];
	return u ? En(c, u, l, r) : {
		attack: (e, t, n) => void c.triggerAttack(e, a(t), n),
		restrike(e, t, n) {
			c.triggerAttack(e, t, n), _n(c, t);
		},
		cut: (e) => hn(c, e),
		release: (e) => void c.triggerRelease(o(e)),
		startsAfter: (e) => i > e,
		attackedAt: () => i,
		node: c
	};
}
var wn = [
	"_lfcf.delayTime",
	"_lfcf.resonance",
	"volume"
];
function Tn(e, t, n) {
	let r = e, i = !1, a = [], o = null, s = kn(e, "_noise");
	if (typeof s?.start == "function") {
		let e = s.start.bind(s);
		s.start = (t) => {
			let n = e(t);
			return o = s._source ?? null, n;
		};
	}
	let c = (s, c, l) => {
		let u = n(), d = Wt(u, s, l, r.context?.sampleRate ?? 0);
		if (r.resonance = d.feedback ?? fn(u, "resonance", .7), (d.level !== 1 || i) && ln(r.volume) && (r.volume.setValueAtTime(20 * Math.log10(d.level), c), i = d.level !== 1), o = null, e.triggerAttack(d.hz, c, l), !o) return;
		let f = t.immediate();
		for (let e = a.length - 1; e >= 0; e--) a[e].end <= f && a.splice(e, 1);
		a.push({
			source: o,
			end: c + (r.attackNoise ?? 1) / d.hz
		});
	};
	return {
		attack: (e, n, r) => c(e, t.attackTime(n), r),
		restrike: (e, t, n) => c(e, t, n),
		cut(t) {
			hn(e, t, wn);
			for (let e of a) e.end > t && e.source.stop(t);
			a.length = 0;
		},
		release: (n) => void e.triggerRelease(t.releaseTime(n)),
		startsAfter: (e) => t.lastAttack() > e,
		attackedAt: t.lastAttack,
		node: e
	};
}
function En(e, t, n, r) {
	let i = Ht, a = !1, o = (n) => {
		let a = r();
		for (let r of t) {
			let t = un(kn(e, r.path));
			if (!t) continue;
			let o = fn(a, r.base, 200) * i.track, s = (typeof r.octaves == "number" ? r.octaves : fn(a, r.octaves, 3)) * i.amount;
			t[0].setValueAtTime(o, n), t[1].setValueAtTime(o * 2 ** s - o, n);
		}
	};
	return {
		attack(t, s, c) {
			let l = n.attackTime(s);
			i = Ut(r(), t, c);
			let u = i.track === 1 && i.amount === 1;
			(!u || a) && o(l), a = !u, e.triggerAttack(t, l, c);
		},
		restrike(t, n, r) {
			e.triggerAttack(t, n, r), _n(e, n);
		},
		cut: (t) => hn(e, t),
		release: (t) => void e.triggerRelease(n.releaseTime(t)),
		startsAfter: (e) => n.lastAttack() > e,
		attackedAt: n.lastAttack,
		reshapeFilter() {
			a && o(Math.max(n.immediate(), n.lastAttack()));
		},
		node: e
	};
}
var Dn = {
	filter: "Filter",
	distortion: "Distortion",
	bitcrusher: "BitCrusher",
	chorus: "Chorus",
	phaser: "Phaser",
	tremolo: "Tremolo",
	eq: "EQ3",
	compressor: "Compressor"
};
function On(e, t, n) {
	let r = e[Dn[t]], i = new r({ ...n });
	return (t === "chorus" || t === "tremolo") && i.start?.(), i;
}
function kn(e, t) {
	let n = e;
	for (let e of t.split(".")) {
		if (n === null || typeof n != "object" && typeof n != "function" || !(e in n)) return;
		n = n[e];
	}
	return n;
}
function An(e) {
	return typeof e == "object" && !!e && typeof e.setValueAtTime == "function" && typeof e.cancelScheduledValues == "function";
}
var jn = .005;
function Mn(n, r, i, a = {}) {
	let o = new n.Gain(1), s = i ?? n.getDestination();
	o.connect(s);
	let c = !1, l = a.bpm !== void 0 && Number.isFinite(a.bpm) && a.bpm > 0 ? a.bpm : 120, u = 0, d = [], f = /* @__PURE__ */ new Map(), p = (e) => {
		let t = ve(e.voiceType, e.params);
		e.voices = [];
		for (let r = 0; r < e.polyphony; r++) {
			let r = Cn(n, e.voiceType, t, () => e.params);
			r.node.connect(e.choke ?? e.volume), e.voices.push(r);
		}
		e.trains = e.voices.map(() => null), e.alloc.reset(e.polyphony), h(e);
	}, m = (e, t) => {
		let n = le(e.voiceType, "detune"), r = n ? kn(t.node, n) : void 0;
		return An(r) ? r : null;
	}, h = (e) => {
		let t = e.bus;
		if (t) {
			t.disconnect();
			for (let n of e.voices) {
				let r = m(e, n);
				r && t.connect(r);
			}
		}
	}, g = (e) => {
		if (e.bus) return e.bus;
		e.bus = new n.Gain(1), h(e);
		for (let t of _.values()) t.connect(e.bus);
		return e.bus;
	}, _ = /* @__PURE__ */ new Map(), v = (e) => {
		for (let t of e.voices) t.node.dispose();
		e.voices = [];
	}, y = Tt(r) ? r.kit.pads : null, b = Et(r), x = y ? At(y, b.length) : null, S = b.map((t, r) => {
		let i = sn(t.polyphony), a = cn(t.volume), s = {
			voiceType: t.voiceType,
			params: me(t.voiceType, t.params),
			polyphony: i,
			db: a,
			volume: new n.Volume(a),
			choke: x?.chokeable[r] ? new n.Gain(1) : null,
			voices: [],
			trains: [],
			alloc: new e(i),
			notes: 0,
			bus: null,
			staged: null
		};
		return s.choke?.connect(s.volume), s.volume.connect(o), y || p(s), s;
	}), C = Qe(r.repeat), w = null, T = () => n.getContext(), E = () => typeof T().setTimeout == "function", D = (e) => Math.max(e, n.immediate()) + (E() ? bn : Sn), O = () => {
		if (w = null, c) return;
		let e = n.immediate(), t = !1;
		for (let n of S) n.trains.forEach((r, i) => {
			if (r) {
				if (r.ended(e)) {
					n.trains[i] = null;
					return;
				}
				t = !0, r.prune(e), r.write(D(e));
			}
		});
		t && k();
	}, k = () => {
		w === null && E() && (w = T().setTimeout(O, xn));
	}, A = () => {
		w !== null && T().clearTimeout?.(w), w = null;
	}, j = (e, t, n, r = Infinity) => {
		let i = e.trains[t];
		i && (e.trains[t] = null, i.takeBack(n, r));
	}, M = /* @__PURE__ */ new WeakMap(), N = (e) => {
		let t = M.get(e);
		return t || M.set(e, t = rn()), t;
	}, P = (e, t, r, i, a, o) => {
		let s = e.voices[t];
		if (!C?.on || !s) return;
		let c = s.attackedAt();
		_n(s.node, c);
		let u = N(s), d = an({
			now: () => n.immediate(),
			clear: (e) => u.clear(e),
			strike: (e) => {
				u.add(e), s.restrike(r, e, i, a);
			},
			cut: (e) => s.cut(e)
		}, C, c, l, o);
		e.trains[t] = d, d.write(D(c)), k();
	}, F = (e, t, r, i, a, o, s) => {
		let c = e.voices[t];
		if (!c) return;
		let l = N(c), u = n.immediate();
		l.prune(u);
		let d = l.clear(Math.max(i ?? u, c.attackedAt() + yn));
		l.add(d), j(e, t, d, d), c.attack(r, d, a, o, C?.on === !0), ne(e, t), P(e, t, r, a, o, s);
	}, I = (e, t, r) => {
		let i = e.voices[t];
		i && (e.trains[t]?.end(Math.max(r ?? n.immediate(), i.attackedAt())), i.release(r));
	}, L = (e) => {
		let t = n.immediate();
		for (let n of S) for (let r of n.trains) r && e(r) && (C?.on ? r.reclock(C, l, t, D(t)) : r.end(t));
	}, R = (e, t) => {
		for (let n of e.alloc.releaseAll()) I(e, n, t);
		let n = e.choke?.gain;
		n && (n.cancelScheduledValues(t), n.setTargetAtTime(0, t, jn));
	}, z = (e) => typeof e == "number" && Number.isFinite(e) ? e : void 0, B = (e, t, n, r) => {
		let i = e.notes++;
		return {
			midi: t,
			index: z(n?.ordinal) ?? i,
			attack: r,
			key: z(n?.key),
			syllable: typeof n?.syllable == "string" ? n.syllable : void 0
		};
	}, ee = t(), te = (e, t) => z(e?.attackOrdinal) ?? ee.next(t), ne = (e, t) => {
		let n = e.staged?.gates[t]?.gain, r = e.voices[t]?.attackedAt();
		if (!n || r === void 0 || !Number.isFinite(r)) return;
		let { delay: i = 0, fade: a = 0 } = e.staged.live.patch;
		n.cancelAndHoldAtTime(r), n.setValueAtTime(0, r), a > 0 ? (n.setValueAtTime(0, r + i), n.linearRampToValueAtTime(1, r + i + a)) : n.setValueAtTime(1, r + i);
	}, re = (e) => {
		let t = S[e];
		if (!t.voices.length) {
			if (he(`layer:${e}:`), p(t), ge(`layer:${e}:`), t.bus) for (let e of _.values()) e.connect(t.bus);
			else _.size && t.voices.some((e) => m(t, e)) && g(t);
		}
	}, ie = (e, t, r, i, a) => {
		let { padLayers: o, chokes: s } = x, c = y[e].pitch, l = i ?? n.immediate();
		for (let t of s[e]) for (let e of o[t]) R(S[e], l);
		let u = te(a, l), d = !1;
		for (let n of o[e]) {
			re(n);
			let e = S[n];
			e.choke && (e.choke.gain.cancelScheduledValues(l), e.choke.gain.setValueAtTime(1, l));
			let { voice: o, stolen: s } = e.alloc.noteOn(t);
			s !== null && (d = !0), F(e, o, on(c) * Vt(e.params), i, r, B(e, c, a, u), a?.grid);
		}
		return d;
	}, ae = () => ({
		layers: S.map((e) => ({
			voiceType: e.voiceType,
			polyphony: e.polyphony,
			volume: e.db,
			params: e.params
		})),
		effects: d.map((e) => ({
			id: e.id,
			type: e.type,
			bypass: e.bypass,
			params: e.params
		}))
	}), oe = (e) => {
		let t = tt(e);
		if (!t) return [];
		if (t.kind === "layer") {
			let e = S[t.layer];
			if (!e) return [];
			if (t.path === "volume") return An(e.volume.volume) ? [e.volume.volume] : [];
			let n = le(e.voiceType, t.path);
			return n ? e.voices.map((e) => kn(e.node, n)).filter(An) : [];
		}
		let n = d.find((e) => e.id === t.effectId);
		if (!n?.node || !Be(n.type, t.path)?.modulatable) return [];
		let r = kn(n.node, t.path);
		return An(r) ? [r] : [];
	}, V = (e, t, n = ae()) => {
		if (e.pitch !== null) {
			let n = t.patch.depth * e.depth * e.pitch;
			e.lfo.min = -n, e.lfo.max = n;
			return;
		}
		let r = nt(n, e.target), i = rt(n, e.target);
		if (!r || i === null) return;
		let [a, o] = ot(r, i, t.patch.depth * e.depth);
		e.lfo.min = a, e.lfo.max = o;
	}, se = (e, t) => {
		if (e.pitch !== null) {
			H(e, t), V(e, t);
			return;
		}
		for (let t of oe(e.target)) try {
			e.lfo.connect(t), t.overridden = !0, t.cancelScheduledValues(0), t.setValueAtTime(0, 0), e.params.push(t);
		} catch {}
		V(e, t);
	}, H = (e, t) => {
		let n = tt(e.target), r = n?.kind === "layer" ? S[n.layer] : void 0;
		if (r) try {
			if (!at(t.patch)) {
				let t = g(r);
				e.lfo.connect(t), e.sums.push(t);
				return;
			}
			r.staged = {
				link: e,
				live: t,
				gates: r.voices.map((t) => ce(e, r, t))
			};
		} catch {}
	}, ce = (e, t, r) => {
		let i = new n.Gain(0), a = m(t, r);
		return a && i.connect(a), e.lfo.connect(i), e.sums.push(i), i;
	}, ue = (e, t) => {
		let n = e.staged, r = e.voices[t];
		if (!n || !r) return;
		let { link: i, gates: a } = n, o = a[t];
		if (o) {
			i.sums = i.sums.filter((e) => e !== o);
			try {
				i.lfo.disconnect(o);
			} catch {}
			o.dispose();
		}
		try {
			a[t] = ce(i, e, r);
		} catch {}
	}, U = (e) => {
		for (let t of e.params) try {
			e.lfo.disconnect(t);
		} catch {}
		e.params = [];
		for (let t of e.sums) try {
			e.lfo.disconnect(t);
		} catch {}
		e.sums = [];
		for (let t of S) if (t.staged?.link === e) {
			for (let e of t.staged.gates) e.dispose();
			t.staged = null;
		}
	}, fe = (e) => {
		let t = e.params;
		U(e);
		let r = rt(ae(), e.target), i = n.immediate();
		for (let e of t) try {
			e.overridden = !1, e.cancelScheduledValues(i), r !== null && e.setValueAtTime(r, i);
		} catch {}
	}, W = (e) => {
		let t = [];
		for (let n of f.values()) for (let r of n.links) r.target.startsWith(e) && t.push([r, n]);
		return t;
	}, he = (e) => {
		for (let [t] of W(e)) U(t);
	}, ge = (e) => {
		for (let [t, n] of W(e)) t.params.length === 0 && t.sums.length === 0 && se(t, n);
	}, _e = (e) => {
		let t = null;
		for (let n of f.values()) for (let r of n.links) r.target === e && (t ??= ae(), V(r, n, t));
	}, be = (e) => {
		let t = S[e];
		(!y || t.voices.length) && (he(`layer:${e}:`), v(t), p(t), ge(`layer:${e}:`));
	}, xe = () => {
		o.disconnect();
		for (let e of d) e.node?.disconnect();
		let e = o;
		for (let t of d) t.node && !t.bypass && (e.connect(t.node), e = t.node);
		e.connect(s);
	}, Se = (e) => {
		try {
			e.node = On(n, e.type, e.params);
		} catch {
			e.node = null;
		}
	}, Ce = (e) => {
		he(`fx:${e.id}:`);
		try {
			e.node?.disconnect(), e.node?.dispose();
		} catch {}
		e.node = null;
	}, we = (e, t) => {
		let n = {}, r = !1;
		for (let i of ze(e.type)) {
			let a = pe(i, t[i.path]) ?? i.default;
			a !== e.params[i.path] && (e.params[i.path] = a, n[i.path] = a, i.rebuild && (r = !0));
		}
		let i = Object.keys(n);
		if (i.length === 0) return !1;
		if (!r && e.node) try {
			e.node.set(n);
		} catch {
			r = !0;
		}
		if (r || !e.node) return Ce(e), Se(e), ge(`fx:${e.id}:`), !0;
		for (let t of i) _e(`fx:${e.id}:${t}`);
		return !1;
	}, Te = (e) => {
		for (let t of f.values()) if (t.links.some((t) => t.target.startsWith(e))) {
			for (let n of t.links) if (n.target.startsWith(e)) {
				U(n);
				try {
					n.lfo.dispose();
				} catch {}
			}
			t.links = t.links.filter((t) => !t.target.startsWith(e)), t.patch = {
				...t.patch,
				connections: t.patch.connections.filter((t) => !t.target.startsWith(e))
			};
		}
	}, Ee = (e) => {
		let t = new Map(d.map((e) => [e.id, e])), n = [], r = [], i = !1;
		for (let a of e.slice(0, 24)) {
			if (n.length >= 6) break;
			let e = t.get(a?.id);
			if (e && e.type === a.type) {
				t.delete(e.id), e.bypass !== (a.bypass === !0) && (e.bypass = a.bypass === !0, i = !0), a.params && we(e, a.params) && (i = !0), n.push(e);
				continue;
			}
			let o = lt(a);
			if (!o || n.some((e) => e.id === o.id)) continue;
			let s = {
				...o,
				params: { ...o.params },
				node: null
			};
			Se(s), n.push(s), r.push(s), i = !0;
		}
		for (let e of t.values()) Ce(e), Te(`fx:${e.id}:`), i = !0;
		!i && n.some((e, t) => d[t] !== e) && (i = !0), d = n, i && xe();
		for (let e of r) ge(`fx:${e.id}:`);
	}, G = (e, t) => {
		for (let n of e.links) {
			t(n.target) ? fe(n) : U(n);
			try {
				n.lfo.dispose();
			} catch {}
		}
		e.links = [];
	}, De = (e) => {
		let t = n.immediate(), r = Ye(e.patch, l);
		for (let i of e.patch.connections) {
			let a;
			try {
				a = new n.LFO({
					frequency: r,
					type: e.patch.shape,
					min: 0,
					max: 0
				});
			} catch {
				continue;
			}
			let o = {
				target: i.target,
				depth: i.depth,
				lfo: a,
				params: [],
				pitch: it(ae(), i.target),
				sums: []
			};
			e.links.push(o), se(o, e), a.start(t);
		}
	}, Oe = (e, t, n) => (at(t) === at(n) || !e.links.some((e) => e.pitch !== null)) && t.connections.length === n.connections.length && t.connections.every((e, t) => e.target === n.connections[t].target), ke = (e) => {
		let t = ft(e, ae()), n = new Set(t.map((e) => e.id));
		for (let [e, t] of f) n.has(e) || (G(t, () => !0), f.delete(e));
		let r = [], i = [];
		for (let e of t) {
			let t = e.connections, n = f.get(e.id);
			if (!n) {
				let t = {
					patch: e,
					links: []
				};
				f.set(e.id, t), r.push(t);
				continue;
			}
			let a = n.patch;
			if (n.patch = e, !Oe(n, a, e) || n.links.length !== t.length) {
				let e = new Set(t.map((e) => e.target));
				G(n, (t) => !e.has(t)), r.push(n);
				continue;
			}
			i.push([n, a]);
		}
		for (let e of r) De(e);
		for (let [e, t] of i) {
			let n = e.patch, r = n.connections, i = Ye(n, l), a = Ye(t, l) !== i;
			for (let o of e.links) t.shape !== n.shape && (o.lfo.type = n.shape), a && (o.lfo.frequency.value = i), o.depth = r.find((e) => e.target === o.target)?.depth ?? o.depth;
			if (t.depth !== n.depth || t.connections !== r) {
				let t = ae();
				for (let n of e.links) V(n, e, t);
			}
		}
	};
	r.effects?.length && Ee(r.effects), r.lfos?.length && ke(r.lfos);
	let Ae = (e) => {
		c || e();
	};
	return {
		noteOn(e, t = 1, r, i) {
			if (c || !Number.isFinite(e)) return;
			let a = Number.isFinite(t) ? Math.min(1, Math.max(0, t)) : 1;
			if (x) {
				let t = x.padByNote.get(e);
				t !== void 0 && ie(t, e, a, r, i) && u++;
				return;
			}
			let o = on(e), s = te(i, r ?? n.immediate()), l = !1;
			for (let t of S) {
				let { voice: n, stolen: c } = t.alloc.noteOn(e);
				c !== null && (l = !0), F(t, n, o * Vt(t.params), r, a, B(t, e, i, s), i?.grid);
			}
			l && u++;
		},
		noteOff(e, t) {
			if (!c) for (let n of S) {
				let r = n.alloc.noteOff(e);
				r !== null && I(n, r, t);
			}
		},
		releaseAll() {
			if (c) return;
			let e = n.immediate();
			ee.reset(), A(), S.forEach((t, r) => {
				t.alloc.releaseAll(), t.notes = 0;
				let i = null, a = !1, o = t.staged?.link, s = t.trains.map((t) => t?.pendingAfter(e) === !0), c = t.trains.slice();
				t.trains.fill(null), t.voices.forEach((l, u) => {
					if (!l.startsAfter(e) && !s[u]) return c[u]?.takeBack(e, e), l.release(void 0);
					try {
						i ??= ve(t.voiceType, t.params);
						let e = Cn(n, t.voiceType, i, () => t.params);
						if (e.node.connect(t.choke ?? t.volume), !a) for (let [e] of W(`layer:${r}:`)) e !== o && U(e);
						a = !0, l.node.dispose(), t.voices[u] = e, ue(t, u);
					} catch {
						l.release(void 0);
					}
				}), a && (h(t), ge(`layer:${r}:`));
			});
		},
		setParam(e, t, n) {
			let r = S[e];
			if (c || !r) return;
			let i = de(r.voiceType, t), a = i ? pe(i, n) : void 0;
			if (!i || a === void 0) return;
			if (r.params[t] = a, i.rebuild) {
				be(e);
				return;
			}
			let o = ye(r.voiceType, r.params, t);
			if (Object.keys(o).length > 0) try {
				for (let e of r.voices) e.node.set(o), e.reshapeFilter?.();
			} catch {
				be(e);
			}
			_e(`layer:${e}:${t}`);
		},
		setLayerVolume(e, t) {
			let n = S[e];
			!c && n && Number.isFinite(t) && (n.db = cn(t), n.volume.volume.value = n.db, _e(`layer:${e}:volume`));
		},
		setEffects: (e) => Ae(() => Ee(Array.isArray(e) ? e : [])),
		setLfos: (e) => Ae(() => ke(Array.isArray(e) ? e : [])),
		setTempo(e) {
			if (!(c || !Number.isFinite(e) || e <= 0 || e === l)) {
				l = e;
				for (let e of f.values()) {
					if (!e.patch.sync) continue;
					let t = Ye(e.patch, l);
					for (let n of e.links) n.lfo.frequency.value = t;
				}
				C?.on && C.sync && L((e) => !e.grid);
			}
		},
		setRepeat(e) {
			c || (C = Qe(e), L(() => !0));
		},
		bendPitch(e, t, r, i = "game", a) {
			if (c || e.length === 0 || !Number.isFinite(r)) return;
			let o = Number.isFinite(t) ? Math.max(0, t) : 0, s = a !== void 0 && Number.isFinite(a) ? a : null, l = _.get(i);
			try {
				if (!l) {
					let e = S.filter((e) => e.voices.some((t) => m(e, t))).map(g);
					l = new n.Signal(0), _.set(i, l);
					for (let t of e) l.connect(t);
				}
				l.cancelAndHoldAtTime(r), l.setValueAtTime(o > 0 ? s ?? 0 : e[e.length - 1], r), o > 0 && e.forEach((t, n) => l.linearRampToValueAtTime(t, r + o * (n + 1) / e.length));
			} catch {}
		},
		voiceStats() {
			let e = 0;
			for (let t of S) e += t.alloc.heldCount;
			return {
				active: e,
				steals: u
			};
		},
		dispose() {
			if (!c) {
				c = !0, A();
				for (let e of f.values()) G(e, () => !1);
				f.clear();
				for (let e of _.values()) e.dispose();
				_.clear();
				for (let e of S) e.bus?.dispose(), v(e), e.choke?.dispose(), e.volume.dispose();
				for (let e of d) Ce(e);
				d = [], o.dispose();
			}
		}
	};
}
//#endregion
//#region src/song/game.ts
var Nn = ["master:filter.frequency", "master:filter.Q"];
function Pn(e) {
	return Nn.includes(e);
}
var Fn = {
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
function In() {
	return {
		frequency: Fn.frequency.default,
		Q: Fn.Q.default
	};
}
function Ln(e) {
	return e.frequency >= Fn.frequency.max && Math.abs(e.Q - Fn.Q.default) < 1e-6;
}
function Rn(e) {
	return e.masterFilter ?? In();
}
var zn = [
	"jump",
	"stop",
	"fadeOut",
	"tapeStop"
], Bn = [
	"now",
	"beat",
	"bar"
], Vn = [
	"freeze",
	"muffled",
	"stop"
], Hn = {
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
}, Un = 2e4, Wn = .75, Gn = "game-over";
function Kn() {
	return {
		mode: "freeze",
		muffleHz: 400,
		fadeSeconds: .4
	};
}
function qn() {
	return [{
		id: Gn,
		name: "Game over",
		action: "tapeStop",
		landing: "now",
		seconds: Wn
	}];
}
function Jn() {
	return {
		links: [],
		layers: [],
		swaps: []
	};
}
function Yn(e) {
	return e.cues ?? qn();
}
function Xn(e) {
	return e.pause ?? Kn();
}
function Zn(e) {
	return e.rules ?? Jn();
}
function Qn(e) {
	return e.sections ?? [];
}
function $n(e, t) {
	let n = Math.min(e.max, Math.max(e.min, t));
	return e.step === "whole" ? Math.min(e.max, Math.max(e.min, Math.round(n))) : n;
}
function er(e, t) {
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
function tr(e, t, n, r) {
	return r === null ? e >= t : r ? e >= t - Math.max(0, n) : e >= t;
}
function nr(e, t, n, r) {
	if (t === n) return n;
	let i = n > t ? e.riseSeconds : e.fallSeconds;
	if (!(i > 0)) return n;
	let a = Math.min(1, Math.max(0, r) / i);
	return a >= 1 ? n : t + (n - t) * a;
}
var rr = [
	"vox",
	"melody",
	"harmony",
	"bass",
	"kit",
	"perc"
];
function ir(e) {
	return rr.includes(e);
}
function ar() {
	return [{
		id: "reverb",
		name: "Reverb",
		type: "reverb",
		params: Ke("reverb"),
		returnDb: 0,
		mute: !1
	}, {
		id: "delay",
		name: "Delay",
		type: "delay",
		params: Ke("delay"),
		returnDb: 0,
		mute: !1
	}];
}
function or(e) {
	return e.buses ?? ar();
}
function sr(e) {
	return 3840 / e.unit;
}
function cr(e) {
	return sr(e) * e.beats;
}
function lr(e) {
	return e.startTick + e.lengthTicks;
}
function ur(e) {
	let t = 0;
	for (let n of e.tracks) for (let e of n.clips) t = Math.max(t, lr(e));
	return t;
}
function dr(e) {
	return e.some((e) => e.solo);
}
function fr(e, t) {
	return e.mute ? !1 : !t || e.solo;
}
function pr(e) {
	return e === -Infinity ? 0 : Number.isFinite(e) ? 10 ** (Math.min(e, 12) / 20) : 1;
}
var mr = -.3, hr = -1.5, gr = .001, _r = .1, vr = 10 ** (mr / 20), yr = 10 ** (hr / 20), br = vr - yr;
function xr(e) {
	let t = Math.abs(e);
	return t <= yr ? e : Math.sign(e) * (yr + br * Math.tanh((t - yr) / br));
}
var Sr = 10 ** (1.14 / 20), Cr = 1;
function wr(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(1, Math.max(-1, e)) : 0;
}
function Tr(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(Cr, Math.max(0, e)) : 0;
}
function Er(e) {
	let t = dr(e), n = /* @__PURE__ */ new Map();
	for (let r of e) n.set(r.id, fr(r, t) ? pr(r.volume) : 0);
	return n;
}
function Dr(e) {
	return e.mute ? 0 : pr(Number.isFinite(e.returnDb) ? Math.min(6, Math.max(-60, e.returnDb)) : 0);
}
function Or(e, t) {
	let n = typeof e.division == "string" ? e.division : "8n.";
	return Math.min(8, Te(n, t));
}
function kr(e, t, n) {
	if (e === "delay") return {
		delayTime: Or(t, n),
		feedback: t.feedback,
		wet: 1
	};
	let r = { wet: 1 };
	for (let n of Ge(e)) r[n.path] = t[n.path];
	return r;
}
function Ar(e, t, n, r) {
	let i = kr(t, n, r);
	if (t === "reverb") return new e.Reverb(i);
	if (t === "delay") return new e.FeedbackDelay({
		...i,
		maxDelay: 8
	});
	let a = new e.Chorus(i);
	return a.start?.(), a;
}
var jr = .02;
function Mr(e, t, n, r, i) {
	let a = new e.Gain(1), o = new e.Gain(Dr(t));
	o.connect(n);
	let s = t.type, c = qe(s, t.params), l = r, u = null, d = Dr(t), f = t.name, p = 0, m = !1, h = null, g = !1, _ = () => {
		try {
			a.disconnect(), u?.dispose();
		} catch {}
		u = null;
	}, v = (e) => {
		if (_(), !m) {
			m = !0;
			try {
				i?.(`The ${He[s]} bus "${f}" could not be built, so its send is silent.`, e);
			} catch {}
		}
	}, y = () => {
		let t = ++p;
		try {
			let n = Ar(e, s, c, l);
			u = n, a.connect(n), n.connect(o);
			let r = n.ready;
			s === "reverb" && r && r.catch((e) => {
				t === p && !g && v(e);
			});
		} catch (e) {
			v(e);
		}
	}, b = () => {
		h !== null && clearTimeout(h), h = null;
	}, x = () => {
		b(), h = setTimeout(() => {
			h = null, !(g || s !== "reverb") && (_(), y());
		}, 250);
	};
	return y(), {
		id: t.id,
		input: a,
		output: o,
		update(t) {
			f = t.name;
			let n = qe(t.type, t.params);
			if (t.type !== s) b(), s = t.type, c = n, _(), y();
			else {
				let e = {};
				for (let t of Ge(s)) n[t.path] !== c[t.path] && (e[t.path] = n[t.path]);
				if (c = n, Object.keys(e).length > 0 && s === "reverb") x();
				else if (Object.keys(e).length > 0 && u) try {
					u.set(s === "delay" ? {
						delayTime: Or(c, l),
						feedback: c.feedback
					} : e);
				} catch {
					_(), y();
				}
			}
			let r = Dr(t);
			r !== d && (d = r, o.gain.rampTo(r, jr, e.immediate()));
		},
		setTempo(e) {
			if (!(!Number.isFinite(e) || e <= 0 || e === l) && (l = e, s === "delay" && u)) try {
				u.set({ delayTime: Or(c, l) });
			} catch {}
		},
		dispose() {
			g = !0, b(), _(), a.dispose(), o.dispose();
		}
	};
}
//#endregion
//#region src/playback/transport/tone-ticks.ts
function Nr(e, t, n) {
	return e / (60 / t * 1) * n;
}
function Pr(e, t, n) {
	return e * (60 / t * 1) / n;
}
function Fr(e, t) {
	return e + t * Math.max(Math.abs(e) * 2 ** -52, Number.MIN_VALUE);
}
function Ir(e, t, n) {
	let r = Pr(e, t, n);
	for (let i = 0; i < 64 && Math.floor(Nr(r, t, n)) < e; i++) r = Fr(r, 1);
	return r;
}
function Lr(e, t, n) {
	let r = Pr(e, t, n);
	for (let i = 0; i < 64 && Nr(r, t, n) > e; i++) r = Fr(r, -1);
	return r;
}
//#endregion
//#region src/playback/transport/tone.ts
var Rr = 1e-6;
function zr(e) {
	let t = e.getTransport(), n = e.getContext();
	t.PPQ !== 960 && (t.PPQ = 960), t.swing = 0, t.loop = !1, t.loopStart = 0, t.loopEnd = Lr(3840, t.bpm.value, 960);
	let r = 0, i = 0, a = Infinity, o = 0, s = 0, c = 0, l = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Set(), f = /* @__PURE__ */ new Set(), p = /* @__PURE__ */ new Set(), m = !1, h = (e) => Math.max(e, m ? t.immediate() : t.now()), g = (e) => {
		let t = m;
		m = !0;
		try {
			e();
		} finally {
			m = t;
		}
	}, _ = (e) => e >= r - Rr && e < a - Rr, v = (e, t) => {
		!_(t) || t >= s - Rr && t < c || g(() => e(t));
	}, y = (e) => {
		_(e) && g(() => {
			for (let t of [...d]) t(e);
		});
	};
	return t.on("loop", y), {
		ppq: 960,
		immediate: () => t.immediate(),
		now: () => t.now(),
		isRunning: () => t.state === "started",
		start(e, n) {
			o++, t.start(e, `${n}i`), r = e, i = n, a = Infinity;
		},
		stop(e) {
			o++, t.stop(e), a = Math.min(a, e);
		},
		relocate(e, n) {
			t.stop(e), t.start(e, `${n}i`), r = e, i = n, a = Infinity;
			let l = ++o, d = t.now(), f = 60 / (t.bpm.getValueAtTime(e) * 960), p = Math.max(0, Math.ceil((d - e) / f - 1e-9));
			s = e, c = e + p * f - Rr;
			for (let t = n; t < n + p; t++) {
				let r = u.get(t);
				if (r) {
					for (let [i, a] of [...r]) if (u.get(t)?.has(i) && (g(() => a(e + (t - n) * f)), l !== o)) return;
				}
			}
		},
		ticksAt(e) {
			return e < r ? i : Math.max(0, t.getTicksAtTime(e));
		},
		tempo: () => t.bpm.value,
		setTempo(e) {
			t.bpm.value = e;
		},
		setTempoAt(e, n) {
			if (!Number.isFinite(e) || e <= 0) return;
			let r = h(n);
			t.bpm.cancelAndHoldAtTime(r), t.bpm.setValueAtTime(e, r);
		},
		rampTempo(e, n, r, i = "exponential") {
			i === "linear" ? t.bpm.linearRampTo(e, n, h(r)) : t.bpm.rampTo(e, n, h(r));
		},
		cancelTempo(e) {
			t.bpm.cancelScheduledValues(e);
		},
		setTimeSignature(e, n) {
			t.timeSignature = [e, n];
		},
		setLoop(e) {
			if (e) {
				let n = t.bpm.value;
				t.loopStart = Ir(e.startTick, n, 960), t.loopEnd = Lr(e.endTick, n, 960);
			}
			t.loop = e !== null;
		},
		onLoop(e) {
			return d.add(e), () => void d.delete(e);
		},
		scheduleTick(e, n) {
			let r = t.schedule((e) => v(n, e), Ir(e, t.bpm.value, 960));
			l.set(r, e);
			let i = u.get(e);
			return i || u.set(e, i = /* @__PURE__ */ new Map()), i.set(r, n), r;
		},
		clearTick(e) {
			let n = l.get(e);
			if (n === void 0) return;
			l.delete(e);
			let r = u.get(n);
			r?.delete(e), r?.size === 0 && u.delete(n), t.clear(e);
		},
		setTimeout(e, t) {
			let r = n.setTimeout(() => {
				f.delete(r), e();
			}, t);
			return f.add(r), r;
		},
		clearTimeout(e) {
			f.delete(e), n.clearTimeout(e);
		},
		setInterval(e, t) {
			let r = n.setInterval(e, t);
			return p.add(r), r;
		},
		clearInterval(e) {
			p.delete(e), n.clearInterval(e);
		},
		dispose() {
			for (let e of l.keys()) t.clear(e);
			l.clear(), u.clear(), d.clear(), t.off("loop", y);
			for (let e of f) n.clearTimeout(e);
			f.clear();
			for (let e of p) n.clearInterval(e);
			p.clear();
		}
	};
}
//#endregion
//#region src/playback/engine/tone.ts
function Br(e) {
	return e;
}
var Vr = (e) => e;
function Hr(e) {
	return {
		rampTo: (t, n, r) => void e.rampTo(t, n, r),
		setAt: (t, n) => void e.setValueAtTime(t, n),
		linearTo: (t, n) => void e.linearRampToValueAtTime(t, n),
		cancelFrom: (t) => void e.cancelScheduledValues(t),
		holdAt: (t) => void e.cancelAndHoldAtTime(t)
	};
}
var Ur = Fn.frequency.max, Wr = Fn.Q.default, Gr = .005;
function Kr(e) {
	return (t, n) => {
		try {
			e ? e(t, n) : console.error(t, n);
		} catch {}
	};
}
function qr(e, t = {}) {
	let n = /* @__PURE__ */ new WeakMap(), r = (e, n) => {
		if (!t.meter) return null;
		try {
			return t.meter(e);
		} catch (e) {
			return n("A level meter could not be attached.", e), null;
		}
	};
	return {
		destination: Br(e.getDestination()),
		createTransport: () => zr(e),
		createTrack(t, i, a) {
			let o = Kr(a), s = new e.Gain(i.gain), c = new e.Panner({
				pan: i.pan,
				channelCount: 2
			});
			s.connect(c), c.connect(Vr(t));
			let l = r(c, o), u = /* @__PURE__ */ new Map(), d = (e) => {
				try {
					c.disconnect(e.gain);
				} catch {}
				e.gain.disconnect(), e.gain.dispose();
			};
			return {
				input: Br(s),
				gain: Hr(s.gain),
				pan: Hr(c.pan),
				setSend(t, r, i, a) {
					let o = u.get(t);
					if (o) {
						if (o.level === r) return;
						o.level = r, o.gain.gain.rampTo(r, i, a);
						return;
					}
					let s = n.get(t);
					if (r <= 0 || !s) return;
					let l = new e.Gain(r);
					c.connect(l), l.connect(s), u.set(t, {
						gain: l,
						level: r
					});
				},
				dropSend(e) {
					let t = u.get(e);
					t && (d(t), u.delete(e));
				},
				readPeak: () => l ? l.read() : null,
				dispose() {
					for (let e of u.values()) d(e);
					u.clear(), l?.dispose(), c.dispose(), s.dispose();
				}
			};
		},
		createBus(t, i, a, o) {
			let s = Kr(o), c = Mr(e, t, Vr(i), a, s), l = r(c.output, s), u = {
				id: t.id,
				update: (e) => c.update(e),
				setTempo: (e) => c.setTempo(e),
				readPeak: () => l ? l.read() : null,
				dispose() {
					l?.dispose(), c.dispose();
				}
			};
			return n.set(u, c.input), u;
		},
		createInstrument: (t, n, r) => Mn(e, n, Vr(t), r),
		createMusicChain(t, n) {
			let r = Kr(n), i = e.getContext(), a = !1, o = new e.Gain(1), s = new e.Gain(1), c = new e.Gain(1), l = new e.Gain(1), u = new e.Gain(1), d = new e.Gain(1);
			c.connect(l), l.connect(u), u.connect(Vr(t));
			let f = (t, n, r) => {
				t.rampTo(n, Math.max(Gr, r), e.immediate());
			}, p = (t, n) => {
				let o = null, s = null;
				t.connect(n);
				let c = () => {
					s !== null && i.clearTimeout(s), s = null;
				}, l = () => {
					o && (t.disconnect(o), o.disconnect(), o.dispose(), o = null, t.connect(n));
				};
				return {
					set(u, d, p) {
						if (a) return;
						let m = u >= Ur && Math.abs(d - Wr) < 1e-6;
						(!m || o && s === null) && (m || c(), o || (o = new e.Filter({
							type: "lowpass",
							frequency: Ur,
							Q: Wr
						}), o.connect(n), t.disconnect(n), t.connect(o)), f(o.frequency, Math.min(Ur, u), p), f(o.Q, d, p), m && (s = i.setTimeout(() => {
							s = null;
							try {
								l();
							} catch (e) {
								r("The music filter could not step aside.", e);
							}
						}, Math.max(Gr, p) + .05)));
					},
					dispose() {
						c(), o?.dispose(), o = null;
					}
				};
			}, m = {
				master: p(o, s),
				muffle: p(s, d),
				host: p(d, c)
			};
			return {
				input: Br(o),
				setLowpass: (e, t, n, r) => m[e].set(t, n, r),
				cue: Hr(c.gain),
				pause: Hr(l.gain),
				hidden: Hr(u.gain),
				dispose() {
					if (!a) {
						a = !0;
						for (let e of Object.values(m)) e.dispose();
						for (let e of [
							o,
							s,
							d,
							c,
							l,
							u
						]) e.dispose();
					}
				}
			};
		}
	};
}
var Jr = 16385;
function Yr(e) {
	let t = new e.Compressor({
		threshold: -2,
		ratio: 20,
		knee: 0,
		attack: gr,
		release: _r
	}), n = new e.Gain(1 / (Sr * 4)), r = new e.WaveShaper((e) => xr(e * 4), Jr);
	return t.connect(n), n.connect(r), {
		input: t,
		output: r,
		get reduction() {
			let e = t.reduction;
			return Number.isFinite(e) ? Math.min(0, e) : 0;
		},
		dispose() {
			t.dispose(), n.dispose(), r.dispose();
		}
	};
}
//#endregion
//#region src/song/tempo.ts
function Xr(e) {
	return e.glideTo === void 0 ? 0 : (e.glideTo - e.bpm) * 960 / (e.endTick - e.tick);
}
function Zr(e, t) {
	let n = t / 960, r = Xr(e);
	return r === 0 ? 60 * n / e.bpm : 60 * Math.log1p(r * n / e.bpm) / r;
}
function Qr(e, t) {
	let n = Xr(e);
	return (n === 0 ? t * e.bpm / 60 : e.bpm * Math.expm1(n * t / 60) / n) * 960;
}
function $r(e, t, n) {
	let r = 0, i = e.length - 1;
	for (; r < i;) {
		let a = r + i + 1 >> 1;
		n(e[a]) <= t ? r = a : i = a - 1;
	}
	return r;
}
function ei(e, t) {
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
		t.glide && o && (s.glideTo = o.bpm), r.push(s), a = Math.max(a, t.bpm), o && (i += Zr(s, o.tick - t.tick));
	}
	let o = (e) => r[$r(r, e, (e) => e.tick)], s = (e) => {
		let t = o(e);
		return t.seconds + Zr(t, e - t.tick);
	};
	return {
		segments: r,
		fastestBpm: a,
		bpmAt(e) {
			let t = o(e);
			return t.glideTo === void 0 || e <= t.tick ? t.bpm : t.bpm + Xr(t) * (e - t.tick) / 960;
		},
		secondsAt: s,
		secondsBetween: (e, t) => s(t) - s(e),
		tickAtSeconds(e) {
			let t = r[$r(r, e, (e) => e.seconds)], n = t.tick + Qr(t, e - t.seconds);
			return Math.min(n, t.endTick);
		},
		changeAt: o
	};
}
var ti = /* @__PURE__ */ new WeakMap(), ni = null;
function ri(e) {
	let t = e.tempoChanges;
	if (!t || t.length === 0) return ni?.segments[0].bpm !== e.bpm && (ni = ei(e.bpm, [])), ni;
	let n = ti.get(t);
	return n?.segments[0].bpm !== e.bpm && (n = ei(e.bpm, t), ti.set(t, n)), n;
}
//#endregion
//#region src/song/meter.ts
function ii(e, t, n) {
	let r = 0, i = e.length - 1;
	for (; r < i;) {
		let a = r + i + 1 >> 1;
		n(e[a]) <= t ? r = a : i = a - 1;
	}
	return r;
}
function ai(e, t) {
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
		let { tick: t, meter: a } = n[e], o = n[e + 1]?.tick ?? Infinity, s = cr(a);
		r.push({
			tick: t,
			meter: a,
			barTicks: s,
			beatTicks: sr(a),
			bar: i,
			endTick: o
		}), o !== Infinity && (i += Math.ceil((o - t) / s));
	}
	let a = (e) => r[ii(r, e, (e) => e.tick)], o = (e, t) => {
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
			let t = Math.max(1, Math.floor(e)), n = r[ii(r, t, (e) => e.bar)];
			return n.tick + (t - n.bar) * n.barTicks;
		},
		barLineAtOrAfter: s,
		beatLineAtOrAfter: (e) => o(e, (e) => e.beatTicks),
		barLines(e, t) {
			let n = [];
			if (!Number.isFinite(e) || !Number.isFinite(t)) return n;
			let i = s(e), a = ii(r, i, (e) => e.tick), o = r[a], c = o.bar + Math.round((i - o.tick) / o.barTicks);
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
var oi = /* @__PURE__ */ new WeakMap(), si = null, ci = (e, t) => e.beats === t.beats && e.unit === t.unit;
function li(e) {
	let t = e.meterChanges;
	if (!t || t.length === 0) return (!si || !ci(si.segments[0].meter, e.timeSignature)) && (si = ai(e.timeSignature, [])), si;
	let n = oi.get(t);
	return (!n || !ci(n.segments[0].meter, e.timeSignature)) && (n = ai(e.timeSignature, t), oi.set(t, n)), n;
}
//#endregion
//#region src/song/glide.ts
var ui = .18, di = 1200, fi = .01, pi = 1024;
function mi(e, t) {
	return !e.ignoresGlide && !t?.kit;
}
function hi(e, t, n) {
	let r;
	for (let n of e ?? []) n.tick < t && (!r || n.tick >= r.tick) && (r = n);
	if (!r) return null;
	let i = Math.max(0, n(r.tick));
	return r.rise - i >= .01 ? {
		tick: t,
		depth: r.depth * (1 - i / r.rise),
		rise: r.rise - i
	} : null;
}
var gi = {
	hz: K.hz,
	depth: K.depth,
	delay: K.delay,
	fade: K.fade
}, _i = 64, vi = 256;
function yi(e) {
	if (typeof e != "string") return null;
	if (e === "repeat:hz") return {
		kind: "repeat",
		path: "hz"
	};
	if (e.startsWith("lfo:")) {
		let t = e.indexOf(":", 4), n = e.slice(4, t), r = e.slice(t + 1);
		return t > 4 && Object.hasOwn(gi, r) ? {
			kind: "lfo",
			lfoId: n,
			path: r
		} : null;
	}
	return tt(e);
}
function bi(e, t) {
	return t.kind === "layer" ? e.layers[t.layer] : void 0;
}
function xi(e, t) {
	return t.kind === "fx" ? e.effects?.find((e) => e.id === t.effectId) : void 0;
}
function Si(e, t) {
	return t.kind === "lfo" ? e.lfos?.find((e) => e.id === t.lfoId) : void 0;
}
function Ci(e, t) {
	let n = yi(t);
	if (!n) return null;
	if (n.kind === "layer") {
		let t = bi(e, n);
		return t ? n.path === "volume" ? $e : de(t.voiceType, n.path) ?? null : null;
	}
	if (n.kind === "fx") {
		let t = xi(e, n);
		return t ? Be(t.type, n.path) ?? null : null;
	}
	return n.kind === "repeat" ? e.repeat ? Xe.hz : null : Si(e, n) ? gi[n.path] : null;
}
function wi(e, t) {
	let n = Ci(e, t), r = yi(t);
	if (n) {
		if (r.kind === "layer") {
			let t = bi(e, r);
			return (r.path === "volume" ? t.volume : t.params[r.path]) ?? n.default;
		}
		return r.kind === "fx" ? xi(e, r).params[r.path] ?? n.default : r.kind === "repeat" ? e.repeat.hz : Si(e, r)[r.path] ?? n.default;
	}
}
function Ti(e, t, n) {
	let r = Ci(e, t);
	return r ? pe(r, n) : void 0;
}
function Ei(e, t, n) {
	let r = Ti(e, t, n);
	if (r === void 0 || wi(e, t) === r) return e;
	let i = yi(t);
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
	if (i.kind === "repeat") return {
		...e,
		repeat: {
			...e.repeat,
			hz: r
		}
	};
	let a = (e) => {
		let t = {
			...e,
			[i.path]: r
		};
		return (i.path === "delay" || i.path === "fade") && r === 0 && delete t[i.path], t;
	};
	return {
		...e,
		lfos: e.lfos.map((e) => e.id === i.lfoId ? a(e) : e)
	};
}
function Di(e, t) {
	if (!t) return e;
	let n = e;
	for (let [e, r] of Object.entries(t)) n = Ei(n, e, r);
	return n;
}
function Oi(e, t) {
	return Di(e, t?.overrides?.[e.id]);
}
function ki(e, t) {
	let n = new Set(e.tracks.map((e) => e.instrumentId)), r = t.filter((e) => n.has(e.id)).map((t) => Oi(t, e));
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
function Ai(e) {
	return typeof e == "string" || typeof e == "boolean" || typeof e == "number" && Number.isFinite(e);
}
function ji(e, t, n, r) {
	if (e === void 0) return null;
	if (typeof e != "object" || !e || Array.isArray(e)) return n(`${r} had unreadable instrument overrides, so they were dropped.`), null;
	let i = {}, a = 0;
	for (let n of Object.keys(e).slice(0, 256)) {
		let r = e[n];
		if (!t.has(n) || typeof r != "object" || !r || Array.isArray(r)) {
			a++;
			continue;
		}
		if (Object.keys(i).length >= _i) break;
		let o = {}, s = 0;
		for (let e of Object.keys(r).slice(0, vi * 4)) {
			if (s >= vi) break;
			let t = r[e];
			if (!yi(e) || !Ai(t)) {
				a++;
				continue;
			}
			o[e] = t, s++;
		}
		s > 0 && (i[n] = o);
	}
	return a > 0 && n(`${r}: dropped overrides for instruments or knobs that don't exist.`), Object.keys(i).length > 0 ? i : null;
}
//#endregion
//#region src/song/swing.ts
var Mi = [{
	step: "1/16",
	ticks: 240,
	label: "16ths"
}, {
	step: "1/8",
	ticks: 480,
	label: "8ths"
}], Ni = "1/16";
function Pi(e) {
	return Mi.some((t) => t.step === e);
}
function Fi(e) {
	return Mi.find((t) => t.step === e)?.ticks ?? 240;
}
function Ii(e, t, n) {
	let r = n * 2, i = Math.floor(e / r), a = e - i * r, o = n + t * n / 2;
	return i * r + (a <= n ? a * o / n : o + (a - n) * (r - o) / n);
}
var Li = /* @__PURE__ */ new WeakMap();
function Ri(e, t) {
	let n = t.swing;
	if (!n || !(n.amount > 0) || e.length === 0) return e;
	let r = t.startTick ?? 0, i = Fi(n.step), a = `${r}:${t.lengthTicks}:${n.amount}:${i}`, o = Li.get(t);
	if (o && o.notes === e && o.key === a) return o.out;
	let s = e.map((e) => {
		if (!(e.tick >= 0 && e.tick < t.lengthTicks)) return e;
		let a = Math.round(Ii(r + e.tick, n.amount, i)) - r, o = Math.round(Ii(r + e.tick + e.durationTicks, n.amount, i)) - r, s = Math.min(a, t.lengthTicks - 1);
		return {
			...e,
			tick: s,
			durationTicks: Math.max(1, o - s)
		};
	});
	return Li.set(t, {
		notes: e,
		key: a,
		out: s
	}), s;
}
function zi(e) {
	return e.tracks.some((e) => e.clips.some((e) => e.swing)) ? {
		...e,
		tracks: e.tracks.map((e) => e.clips.some((e) => e.swing) ? {
			...e,
			clips: e.clips.map((e) => {
				if (!e.swing) return e;
				let { swing: t, poolId: n, ...r } = e;
				return {
					...r,
					notes: Ri(e.notes, e)
				};
			})
		} : e)
	} : e;
}
function Bi(e) {
	if (typeof e != "object" || !e) return null;
	let t = e, n = Object.hasOwn(t, "amount") ? t.amount : void 0, r = typeof n == "number" && Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0, i = Object.hasOwn(t, "step") && Pi(t.step) ? t.step : Ni;
	return r === 0 && i === "1/16" ? null : {
		amount: r,
		step: i
	};
}
//#endregion
//#region src/song/patterns.ts
var Vi = [
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
function Hi(e) {
	return Vi.some((t) => t.size === e);
}
function Ui(e) {
	return Vi.find((t) => t.size === e)?.ticks ?? 240;
}
function Wi(e) {
	return e.length * Ui(e.stepSize);
}
function Gi(e, t) {
	let n = Ui(e.stepSize), r = t % 2 == 1 ? Math.round(e.swing * n / 2) : 0;
	return t * n + r;
}
function Ki(e) {
	return typeof e.patternId == "string";
}
function qi(e, t) {
	return t === void 0 ? null : e.patterns?.find((e) => e.id === t) ?? null;
}
var Ji = /* @__PURE__ */ new WeakMap();
function Yi(e, t) {
	let n = Ji.get(e);
	n || (n = /* @__PURE__ */ new Map(), Ji.set(e, n));
	let r = n.get(t);
	if (r) return n.delete(t), n.set(t, r), r;
	let i = Wi(e), a = [];
	if (i > 0 && t > 0) for (let n = 0; n < t; n += i) for (let r of e.rows) for (let o = 0; o < e.length; o++) {
		let s = r.steps[o] ?? 0;
		if (!(s > 0)) continue;
		let c = Gi(e, o), l = n + c;
		if (l >= t) continue;
		let u = o + 1 < e.length ? Gi(e, o + 1) : i, d = Math.max(1, Math.min(u - c, t - l));
		a.push({
			tick: l,
			durationTicks: d,
			midi: r.note,
			velocity: Math.min(1, s)
		});
	}
	return a.sort((e, t) => e.tick - t.tick || e.midi - t.midi), n.set(t, a), n.size > 8 && n.delete(n.keys().next().value), a;
}
var Xi = [];
function Zi(e, t) {
	if (!Ki(t)) return Ri(t.notes, t);
	let n = qi(e, t.patternId);
	return n ? Yi(n, t.lengthTicks) : Xi;
}
//#endregion
//#region src/playback/events.ts
function Qi(e) {
	return Number.isFinite(e) ? Math.min(1, Math.max(0, e)) : 1;
}
function $i(e, t) {
	let n = [];
	for (let r of e.clips) {
		if (!Number.isFinite(r.startTick) || !(r.lengthTicks > 0)) continue;
		let e = Math.round(r.startTick + r.lengthTicks);
		for (let i of Zi(t, r)) {
			if (!Number.isFinite(i.midi) || !(i.durationTicks > 0) || !(i.tick >= 0 && i.tick < r.lengthTicks)) continue;
			let t = Math.round(r.startTick + i.tick), a = Math.min(Math.round(r.startTick + i.tick + i.durationTicks), e);
			t < 0 || a <= t || n.push({
				start: t,
				end: a,
				midi: i.midi,
				velocity: Qi(i.velocity)
			});
		}
	}
	return n;
}
function ea(e) {
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
function ta(e, t = {}) {
	let n = [];
	for (let r of ea($i(e, t))) n.push({
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
function na(e) {
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
function ra(e) {
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
var ia = 60;
function aa(e) {
	let t = /* @__PURE__ */ new Map(), n = -1, r = -Infinity;
	for (let i of [...e.keys()].sort((e, t) => e - t)) e.get(i).ons.length !== 0 && (i - r >= ia && (n++, r = i), t.set(i, n));
	return t;
}
//#endregion
//#region src/playback/conductor.ts
function oa(e, t) {
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
			return n = e, t ? (r = e && Number.isFinite(e.bpm) && e.bpm > 0 ? ri(e) : null, i = r ? r.segments.slice(1).map((e) => e.tick) : [], a = new Set(i), o = null, l = null, !0) : !1;
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
function sa(e, t) {
	if (e.kit === t.kit) return !0;
	let n = e.kit?.pads, r = t.kit?.pads;
	return !n || !r || n.length !== r.length ? !1 : n.every((e, t) => {
		let n = r[t];
		return e.note === n.note && e.pitch === n.pitch && e.choke === n.choke && e.layers.length === n.layers.length && e.layers.every((e, t) => e === n.layers[t]);
	});
}
function ca(e, t) {
	return e.id === t.id && sa(e, t) && e.layers.length === t.layers.length && e.layers.every((e, n) => {
		let r = t.layers[n];
		return e.voiceType === r.voiceType && e.polyphony === r.polyphony;
	});
}
function la(e, t, n) {
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
			}), t.effects !== n.effects && e.handle.setEffects(t.effects ?? []), t.lfos !== n.lfos && e.handle.setLfos(t.lfos ?? []), t.repeat !== n.repeat && e.handle.setRepeat?.(t.repeat);
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
				if (r && ca(r.patch, n)) {
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
var ua = .5, da = 1, fa = 4, pa = 4, ma = .25, ha = 10, ga = .25, _a = 4, va = .05, ya = .05, ba = /* @__PURE__ */ new WeakMap();
function xa(e) {
	let t = ba.get(e);
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
	return ba.set(e, a), a;
}
function Sa(e, t) {
	let n = 0, r = e.length;
	for (; n < r;) {
		let i = n + r >> 1;
		e[i] < t ? n = i + 1 : r = i;
	}
	return n;
}
var Ca = (e, t) => e.t0 + (t - e.k0) / (e.k1 - e.k0) * (e.t1 - e.t0), wa = /* @__PURE__ */ new WeakMap();
function Ta(e, t, n) {
	let r = wa.get(e);
	return r || (r = {
		notes: ra(e),
		attacks: aa(e)
	}, wa.set(e, r)), {
		ordinal: r.notes.get(t)?.get(n),
		attackOrdinal: r.attacks.get(t)
	};
}
var Ea = 1e-6;
function Da(e, t, n, r, i) {
	let a = li(e), o = ri(e), s = o.secondsAt(t), c = Number.isFinite(i) && i > 0 ? i : 1;
	return {
		time: n,
		beat: (t - a.barStart(a.barAt(t).bar)) / 960,
		bpm: r,
		next(e, t) {
			let r = o.tickAtSeconds(s + (e - n) * c) + Ea, i = a.barAt(r).bar, l = a.barStart(i), u = t * 960, d = Math.min(l + (Math.floor((r - l) / u) + 1) * u, a.barStart(i + 1));
			return n + (o.secondsAt(d) - s) / c;
		}
	};
}
var Oa = .02, ka = .1;
function Aa(e, t) {
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
function ja(e) {
	if (!e.enabled) return null;
	let t = Math.max(0, Math.round(e.startTick)), n = Math.round(e.endTick);
	return Number.isFinite(t) && Number.isFinite(n) && n > t ? {
		start: t,
		end: n
	} : null;
}
function Ma(e, t) {
	return e.enabled === t.enabled && e.startTick === t.startTick && e.endTick === t.endTick;
}
function Na(e) {
	return Number.isFinite(e) ? Math.max(0, Math.round(e)) : 0;
}
function Pa(e, t = {}) {
	let n = t.transport === void 0, r = t.transport ?? e.createTransport(), i = t.destination ?? e.destination, a = (e, n) => {
		try {
			t.onError ? t.onError(e, n) : console.error(e, n);
		} catch {}
	}, o = null, s = null, c = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map(), u = 0, d = /* @__PURE__ */ new Map(), f = /* @__PURE__ */ new Map(), p = 0, m = "stopped", h = 0, g = 0, _ = !1, v = !1, y = !1, b = 0, x = /* @__PURE__ */ new Set(), S = /* @__PURE__ */ new Map(), C = 0, w = /* @__PURE__ */ new Map(), T = 0, E = () => {
		for (let e of [...x]) try {
			e(m);
		} catch (e) {
			a("A playback listener failed.", e);
		}
	}, D = (e) => {
		m !== e && (m = e, E());
	}, O = (e) => {
		v || (v = !0, a("An instrument failed while playing. Some notes may be missing.", e));
	}, k = !1, A = (e) => {
		k || (k = !0, a("A game rule could not be applied.", e));
	}, j = (e, t, n) => {
		let i = r.immediate();
		n !== null && (e.fadeEnd = n > 0 ? i + n : 0), e.gainTarget = t, e.channel.gain.rampTo(t, Math.max(Oa, n ?? e.fadeEnd - i), i);
	}, M = () => {
		let e = r.tempo();
		if (!(e === u || !Number.isFinite(e) || e <= 0)) {
			u = e;
			for (let t of c.values()) t.instrument.setTempo(e);
			for (let { channel: t } of l.values()) t.setTempo(e);
		}
	}, N = oa(r, () => M()), P = (e) => {
		b++, e.held.clear();
		try {
			e.instrument.handle()?.releaseAll();
		} catch (e) {
			O(e);
		}
	}, F = (e, t, n) => {
		let r = e.instrument.handle(), i = [...e.held.values()];
		e.held.clear();
		for (let e of i) try {
			r?.noteOff(e, t);
		} catch (e) {
			if (O(e), b !== n) return !1;
		}
		return !0;
	}, I = () => {
		for (let e of c.values()) P(e);
	}, L = (e) => mi(e.track, e.source), R = !1, z = (e, t, n, r, i, a) => {
		i !== "game" && (R = !0);
		try {
			e.instrument.handle()?.bendPitch?.(t, n, r, i, a);
		} catch (e) {
			O(e);
		}
	}, B = {
		glide: [],
		wheel: []
	}, ee = (e, t, n, i, a) => {
		if (Number.isFinite(i) && t.length > 0) {
			let o = r.immediate(), s = B[e].filter((e) => e.time < i), c = 0;
			for (let e = 0; e < s.length; e++) s[e].time <= o && (c = e);
			B[e] = [...s.slice(c), {
				cents: t,
				seconds: n,
				time: i,
				from: a
			}];
		}
		for (let r of c.values()) L(r) && z(r, t, n, i, e, a);
	}, te = (e, t) => {
		for (let n of ["glide", "wheel"]) {
			let r = B[n];
			for (let i = 0; i < r.length; i++) {
				let a = r[i];
				if (a.time > t) {
					z(e, a.cents, a.seconds, a.time, n, a.from);
					continue;
				}
				if ((r[i + 1]?.time ?? Infinity) <= t) continue;
				let o = Number.isFinite(a.seconds) ? Math.max(0, a.seconds) : 0, s = a.cents[a.cents.length - 1] ?? 0;
				if (o === 0 || t >= a.time + o) {
					s !== 0 && z(e, [s], 0, t, n);
					continue;
				}
				let c = o / a.cents.length, l = Math.min(a.cents.length - 1, Math.floor((t - a.time) / c)), u = a.time + l * c, d = l === 0 ? a.from !== void 0 && Number.isFinite(a.from) ? a.from : 0 : a.cents[l - 1], f = a.cents[l];
				z(e, [f], u + c - t, t, n, d + (f - d) * (t - u) / c), l < a.cents.length - 1 && z(e, a.cents.slice(l + 1), c * (a.cents.length - 1 - l), u + c, n, f);
			}
		}
	}, ne = (e, t) => {
		R && (z(e, [0], 0, t, "glide"), z(e, [0], 0, t, "wheel"));
	}, re = (e) => {
		if (B.glide = [], B.wheel = [], R) {
			for (let t of c.values()) ne(t, e);
			R = !1;
		}
	}, ie = (e, t, n = !0) => {
		if (!o?.glides?.length) return;
		let r = ri(o), i = N.rate(), a = hi(o.glides, e, (t) => r.secondsBetween(t, e) / i);
		a ? ee("glide", [0], a.rise, t, a.depth) : n && R && ee("glide", [0], 0, t);
	}, ae = () => {
		r.isRunning() && r.stop(r.now());
	}, oe = -Infinity, V = -1, se = -Infinity, H = -Infinity, ce = (e) => {
		oe = Math.min(oe, e);
	}, le = (e) => {
		let t = o ? ja(o.loop) : null;
		_ = t !== null && e < t.end, r.setLoop(t && _ ? {
			startTick: t.start,
			endTick: t.end
		} : null), ce(r.now());
	}, ue = (e, t) => {
		let n = o && _ ? ja(o.loop) : null, i = [], a = e, s = r.ticksAt(e);
		for (; a < t;) {
			let e = Math.min(t, a + ya), o = r.ticksAt(e);
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
	}, U = (e, t, n, r, i = !1) => {
		let a = o && _ ? ja(o.loop) : null, s = t.at(-1)?.t1 ?? n, c = /* @__PURE__ */ new Map(), l = (e, n) => {
			let r = a && e.start < a.end ? Math.min(e.end, a.end) : e.end;
			for (let i = n; i < t.length; i++) {
				let a = t[i];
				if (i > n && a.k0 <= e.start) break;
				if (r >= a.k0 && r <= a.k1) return Ca(a, r);
			}
			return s;
		};
		for (let a of e) {
			let { spans: e, starts: o, longest: s } = xa(a.table), u = a.pitched ? C : 0, d = [], f = t[0];
			if (i && f) for (let t = Sa(o, f.k0 - s); t < e.length && e[t].start < f.k0; t++) {
				let n = e[t], r = n.midi + u;
				n.end > f.k0 && r >= 0 && r <= 127 && d.push({
					midi: r,
					at: f.t0 - va,
					end: l(n, 0)
				});
			}
			t.forEach((t, i) => {
				for (let a = Sa(o, Math.ceil(t.k0)); a < e.length && e[a].start < t.k1; a++) {
					let o = e[a], s = Ca(t, o.start);
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
	}, de = () => {
		if (m !== "playing" || !o) return;
		let e = [...c.values()].filter((e) => e.instrument.handle()?.prepare);
		if (e.length === 0) return;
		let t = r.immediate(), n = r.now();
		N.revision !== V && (V = N.revision, ce(n));
		for (let t of e) {
			let e = t.instrument.handle();
			(t.plannedFor?.handle !== e || t.plannedFor.table !== t.table) && (t.plannedFor = {
				handle: e,
				table: t.table
			}, ce(n));
		}
		let i = Math.max(n - va, oe), a = t + ua, s = a + ga * 3, l = U(e, ue(t, s + ma), i, !0), u = Math.min(Infinity, ...[...l.values()].map((e) => Math.min(...e.map((e) => e.at)))), d = null, f = () => d ??= U(e, ue(t, Math.max(a, u) + fa), t, !1, !0), p = s + ma;
		if (t - se >= pa && (u === Infinity || fe(f(), u, p, { dryRun: !0 }) === 0) && (se = t, u !== Infinity && fe(f(), u, p, { hold: !0 }), e[0].instrument.handle().prepare([], t, { sleep: !0 })), u > s) return;
		if (u > a) {
			pe(f(), u);
			return;
		}
		if (t - H < ga && H + ga < u - (n - t) - va) return;
		let h = [...f().values()].flatMap((e) => e.map((e) => e.at)).sort((e, t) => e - t), g = i;
		for (let e of h) if (!(e < g)) {
			if (e > a) break;
			g = e + da;
		}
		oe = g;
		let _ = g - da + fa, v = 0;
		for (let [e, t] of f()) {
			let n = t.filter((e) => e.at < _);
			n.length > 0 && (v += e.instrument.handle().prepare(n, g));
		}
		v > 0 && (se = H = t);
	}, fe = (e, t, n, r = {}) => {
		let i = 0;
		for (let [a, o] of e) {
			let e = o.filter((e) => e.at < t + fa);
			e.length > 0 && (i += a.instrument.handle().prepare(e, n, r));
		}
		return i;
	}, pe = (e, t) => {
		let n = r.immediate();
		if (n - H < ga) return;
		let i = t + da, a = [...e].map(([e, n]) => {
			let r = n.filter((e) => e.at < t + fa);
			return {
				handle: e.instrument.handle(),
				kept: r,
				voices: e.instrument.handle().prepare(r, i, { dryRun: !0 })
			};
		}), o = a.reduce((e, t) => e + t.voices, 0), s = Math.min(_a, Math.ceil(o / ha));
		if (s <= 1 || n < t - ua - ga * (s - 1) - va) return;
		let c = ha, l = 0;
		for (let e of a) e.voices === 0 || l > 0 && e.voices > c || (l += e.handle.prepare(e.kept, i), c -= e.voices);
		l > 0 && (se = H = n);
	}, me = r.setInterval(() => {
		try {
			de();
		} catch (e) {
			O(e);
		}
	}, va), W = () => r.ticksAt(r.now()), he = null, ge = () => he ?? (m === "playing" ? W() : m === "paused" ? g : h), _e = (e, t) => {
		let n = w.get(e);
		if (!n) return !0;
		w.delete(e);
		let r = T;
		for (let { action: e } of n) {
			try {
				e(t);
			} catch (e) {
				A(e);
			}
			if (r !== T || m !== "playing") return !1;
		}
		return !0;
	}, ve = (e, t) => {
		if (m !== "playing") return;
		N.reach(e, t), M();
		let n = he;
		he = e;
		let i;
		try {
			i = _e(e, t);
		} finally {
			he = n;
		}
		if (!i) return;
		let a = b, s = t < r.immediate() - ka, l = s ? void 0 : f.get(e);
		l && ee("glide", [0], l.rise, t, l.depth);
		let d;
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
						if (O(e), b !== a) return;
					}
				}
			}
			let c = n.pitched ? C : 0;
			for (let { midi: l, velocity: f } of r.ons) try {
				let r = n.held.get(l);
				if (r !== void 0 && (n.held.delete(l), i.noteOff(r, t)), s) continue;
				let a = l + c;
				if (a < 0 || a > 127) continue;
				n.held.set(l, a), d ??= o ? Da(o, e, t, u, N.rate()) : void 0, i.noteOn(a, f, t, {
					key: e,
					...Ta(n.table, e, l),
					...d ? { grid: d } : {}
				});
			} catch (e) {
				if (O(e), b !== a) return;
			}
		}
		e === p && !_ && be(t);
	}, ye = (e) => {
		if (w.size === 0) return;
		let t = [...w.values()].flat();
		w.clear();
		for (let { action: n, drop: r, onDrop: i } of t) {
			if (r) {
				try {
					i?.();
				} catch (e) {
					A(e);
				}
				continue;
			}
			try {
				n(e);
			} catch (e) {
				A(e);
			}
		}
	}, be = (e) => {
		m = "stopped", T++;
		let t = ++b;
		for (let n of [...c.values()]) if (!F(n, e, t)) return;
		re(e);
		try {
			r.stop(e);
		} catch (e) {
			a("The Transport could not be stopped.", e);
		}
		ye(e), E();
	}, xe = r.onLoop((e) => {
		if (m !== "playing") return;
		let t = o && _ ? ja(o.loop) : null;
		t && N.relocate(t.start, e);
		let n = b;
		for (let t of [...c.values()]) if (!F(t, e, n)) return;
		t && ie(t.start, e, !1);
	}), Se = (e) => {
		let t = o ? ja(o.loop) : null;
		if (!o || (!t || e >= t.end) && e >= p) return !1;
		m === "playing" && I(), b++, T++, ye(r.immediate()), le(e);
		let n = r.now();
		return r.isRunning() && r.stop(n), ie(e, n), r.start(n, e), N.relocate(e, n), oe = -Infinity, v = !1, !0;
	}, Ce = () => {
		let e = /* @__PURE__ */ new Set();
		for (let t of c.values()) for (let n of t.table.keys()) e.add(n);
		p > 0 && e.add(p);
		for (let t of w.keys()) e.add(t);
		for (let t of N.ticks) e.add(t);
		for (let t of f.keys()) e.add(t);
		for (let [t, n] of d) e.has(t) || (r.clearTick(n), d.delete(t));
		for (let t of e) d.has(t) || d.set(t, r.scheduleTick(t, (e) => ve(t, e)));
	}, we = (e) => e === null ? null : s?.find((t) => t.id === e) ?? null, Te = (e) => {
		let t = S.get(e.id)?.instrumentId;
		return t !== void 0 && we(t) ? t : e.instrumentId;
	}, Ee = (e) => {
		let t = we(Te(e.track)), n = e.track.voiceLimit, i = S.get(e.track.id)?.knobs;
		if (t === e.source && n === e.limit && i === e.knobs) return;
		e.source = t, e.limit = n, e.knobs = i, e.pitched = t !== null && !t.kit;
		let a = t ? Aa(t, n) : null;
		if (a && i) for (let [e, t] of Object.entries(i)) a = Ei(a, e, t);
		let o = e.instrument.handle();
		e.instrument.update(a), e.instrument.handle() !== o && (e.held.clear(), L(e) && te(e, r.immediate()));
	}, G = (e) => {
		let t = S.get(e.id);
		if (!t || t.volumeDb === void 0 && t.pan === void 0 && !t.sends) return e;
		let n = { ...e };
		return t.volumeDb !== void 0 && Number.isFinite(t.volumeDb) && (n.volume = t.volumeDb), t.pan !== void 0 && (n.pan = t.pan), t.sends && (n.sends = {
			...e.sends,
			...t.sends
		}), n;
	}, De = (e) => {
		let t = S.get(e)?.gainScale;
		return t === void 0 || !Number.isFinite(t) ? 1 : Math.min(1, Math.max(0, t));
	}, Oe = (e) => {
		let t = Er(e.map(G));
		for (let [e, n] of t) t.set(e, n * De(e));
		return t;
	}, ke = (e) => {
		let t = S.get(e.id)?.patternId;
		return t !== void 0 && o?.patterns?.some((e) => e.id === t) ? t : void 0;
	}, Ae = (e) => {
		let t = ke(e);
		return {
			table: na(ta(t === void 0 ? e : {
				...e,
				clips: e.clips.map((e) => e.patternId === void 0 ? e : {
					...e,
					patternId: t
				})
			}, o ?? {})),
			swap: t
		};
	}, je = (t, n) => {
		let o = wr(G(t).pan), s = e.createTrack(i, {
			gain: n,
			pan: o
		}, a), c = la(e, s.input, a);
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
		return {table: l.table, swap: l.patternSwap} = Ae(t), Ee(l), l;
	}, Me = (e) => {
		P(e), e.instrument.dispose(), e.channel.dispose();
	}, Ne = (e) => {
		for (let t of c.values()) t.channel.dropSend(e.channel);
		e.channel.dispose();
	}, Pe = () => {
		for (let e of c.values()) Me(e);
		c.clear();
		for (let e of l.values()) Ne(e);
		l.clear();
		for (let e of d.values()) r.clearTick(e);
		d.clear(), p = 0;
	}, Fe = (t) => {
		let n = or(t), o = new Set(n.map((e) => e.id));
		for (let [e, t] of l) o.has(e) || (Ne(t), l.delete(e));
		for (let o of n) {
			let n = l.get(o.id);
			if (n) {
				n.bus !== o && n.channel.update(o), n.bus = o;
				continue;
			}
			t.tracks.some((e) => Tr(G(e).sends?.[o.id]) > 0) && l.set(o.id, {
				bus: o,
				channel: e.createBus(o, i, r.tempo(), a)
			});
		}
	}, Ie = (e, t) => {
		let n = wr(t.pan);
		n !== e.panTarget && (e.panTarget = n, e.channel.pan.rampTo(n, Oa, r.immediate()));
		for (let [n, i] of l) e.channel.setSend(i.channel, Tr(t.sends?.[n]), Oa, r.immediate());
	}, Le = () => {
		m = "stopped", b++, T++, I(), re(r.immediate()), ae(), ye(r.immediate()), E();
	}, Re = (e) => {
		if (m !== "playing" || e.held.size === 0) {
			P(e);
			return;
		}
		let t = W(), n = /* @__PURE__ */ new Set();
		for (let [r, i] of e.table) if (r >= t || _) for (let e of i.offs) n.add(e);
		let i = r.immediate(), a = e.instrument.handle();
		for (let [t, r] of [...e.held]) if (!n.has(t)) {
			e.held.delete(t);
			try {
				a?.noteOff(r, i);
			} catch (e) {
				O(e);
			}
		}
	}, ze = (e, t) => {
		let n = o, i = t !== s;
		if (s = t, (!e || !n || e.id !== n.id) && (m !== "stopped" && Le(), ye(r.immediate()), Pe(), k = !1, h = 0, g = 0), o = e, !e) return;
		let a = N.ticks;
		if (N.load(e) && N.assert(ge(), r.immediate()), !n || n.timeSignature !== e.timeSignature) {
			let { beats: t, unit: n } = e.timeSignature;
			t > 0 && n > 0 && r.setTimeSignature(t, n);
		}
		let l = Oe(e.tracks), u = !1, d = /* @__PURE__ */ new Set();
		for (let t of e.tracks) {
			if (d.has(t.id)) continue;
			d.add(t.id);
			let a = c.get(t.id);
			if (!a) {
				c.set(t.id, je(t, l.get(t.id) ?? 0)), u = !0;
				continue;
			}
			let o = n !== null && n.patterns !== e.patterns && t.clips.some(Ki), s = t.clips !== a.track.clips || o, f = i || t.instrumentId !== a.track.instrumentId || t.voiceLimit !== a.track.voiceLimit, p = L(a);
			a.track = t, s && ({table: a.table, swap: a.patternSwap} = Ae(t), Re(a), u = !0), f && Ee(a), p && !L(a) && ne(a, r.immediate());
		}
		for (let [e, t] of c) d.has(e) || (Me(t), c.delete(e), u = !0);
		Fe(e);
		for (let [e, t] of c) {
			Ie(t, G(t.track));
			let n = l.get(e) ?? 0;
			n !== t.gainTarget && j(t, n, null);
		}
		M(), (!n || n.glides !== e.glides) && (f = new Map((e.glides ?? []).map((e) => [e.tick, e])), u = !0);
		let v = Na(ur(e));
		v !== p && (p = v, u = !0), N.ticks !== a && (u = !0), u && Ce(), m === "playing" && (n && !Ma(n.loop, e.loop) && le(W()), !_ && W() >= p && Le());
	}, Be = () => r.ticksAt(r.immediate());
	return {
		setSong(e, t) {
			if (!(y || e === o && t === s)) try {
				ze(e, t);
			} catch (e) {
				a("The song could not be loaded for playback.", e);
			}
		},
		play() {
			if (!(y || m === "playing") && (M(), Se(m === "paused" ? g : h))) {
				D("playing");
				try {
					de();
				} catch (e) {
					O(e);
				}
			}
		},
		pause() {
			y || m !== "playing" || (g = Na(Be()), m = "paused", b++, T++, I(), re(r.immediate()), ae(), ye(r.immediate()), E());
		},
		stop() {
			y || m === "stopped" || Le();
		},
		seek(e) {
			y || (h = Na(e), g = h, m === "playing" && (Se(h) || Le()));
		},
		getCursorTick: () => h,
		getPositionTicks() {
			return m === "playing" ? Be() : m === "paused" ? g : h;
		},
		getState: () => m,
		liveGrid() {
			if (m !== "playing" || !o) return null;
			let e = r.immediate();
			return Da(o, r.ticksAt(e), e, r.tempo(), N.rate());
		},
		voiceStats() {
			let e = {};
			for (let [t, n] of c) e[t] = n.instrument.handle()?.voiceStats() ?? {
				active: 0,
				steals: 0
			};
			return e;
		},
		refreshTempo() {
			y || M();
		},
		setTempoRule(e, t = {}) {
			y || N.setRule(e, ge(), t.time ?? r.immediate(), t.glideSeconds ?? 0);
		},
		tempoRate: () => N.rate(),
		slumpTempo(e, t, n) {
			y || N.slump(e, t, n);
		},
		releaseTempo() {
			y || N.release(ge(), r.immediate());
		},
		setTrackControl(e, t) {
			if (y) return;
			let n = S.get(e);
			t ? S.set(e, t) : S.delete(e);
			let i = c.get(e);
			if (i && o) try {
				if (n?.instrumentId !== t?.instrumentId || n?.knobs !== t?.knobs) {
					let e = L(i);
					Ee(i), e && !L(i) && ne(i, r.immediate());
				}
				ke(i.track) !== i.patternSwap && ({table: i.table, swap: i.patternSwap} = Ae(i.track), Re(i), Ce()), (n?.pan !== t?.pan || n?.sends !== t?.sends || n?.volumeDb !== t?.volumeDb) && (Fe(o), Ie(i, G(i.track)));
				let a = Oe(o.tracks).get(e) ?? 0;
				if (a !== i.gainTarget) {
					let e = (n?.gainScale ?? 1) !== (t?.gainScale ?? 1), r = t?.gainSeconds ?? n?.gainSeconds ?? 0;
					j(i, a, e ? Number.isFinite(r) ? r : 0 : null);
				}
			} catch (e) {
				A(e);
			}
		},
		setTranspose(e) {
			Number.isFinite(e) && (C = Math.max(-48, Math.min(48, Math.round(e))));
		},
		atBoundary(e, t, n = {}) {
			let i = {
				tick: null,
				cancel: () => {}
			};
			if (y) return i;
			if (m !== "playing" || e === "now" || !o) return t(m === "playing" ? r.now() : r.immediate()), i;
			let a = li(o), s = e === "beat" ? a.beatLineAtOrAfter : a.barLineAtOrAfter, c = s(Math.floor(Math.max(0, W())) + 1), l = ja(o.loop);
			if (_ && l && c >= l.end) {
				let e = s(l.start);
				c = e < l.end ? e : l.start;
			}
			let u = {
				action: t,
				drop: n.drop === !0,
				onDrop: n.onDrop
			};
			return w.set(c, [...w.get(c) ?? [], u]), Ce(), {
				tick: c,
				cancel: () => {
					let e = w.get(c);
					if (!e?.includes(u)) return;
					let t = e.filter((e) => e !== u);
					t.length > 0 ? w.set(c, t) : w.delete(c);
				}
			};
		},
		jumpAt(e, t) {
			if (y) return;
			let n = Na(e);
			if (m !== "playing" || !o) {
				h = n, g = n;
				return;
			}
			let i = ja(o.loop);
			if ((!i || n >= i.end) && n >= p) {
				be(t);
				return;
			}
			T++;
			let a = ++b;
			for (let e of [...c.values()]) if (!F(e, t, a)) return;
			le(n), ie(n, t), N.relocate(n, t), r.relocate(t, n), ce(t);
		},
		stopAt(e) {
			!y && m === "playing" && be(e);
		},
		bendPitch(e, t, n, r = "game", i) {
			if (!y) {
				if (r !== "game") ee(r, e, t, n, i);
				else for (let a of c.values()) z(a, e, t, n, r, i);
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
			return x.add(e), () => void x.delete(e);
		},
		dispose() {
			y || (m !== "stopped" && Le(), y = !0, Pe(), xe(), r.clearInterval(me), r.setLoop(null), n && r.dispose(), x.clear(), o = null, s = null);
		}
	};
}
//#endregion
//#region src/playback/game-runtime.ts
var Fa = 20, Ia = 400, La = -60, Ra = 1 / 30, za = Fn.frequency.max, Ba = Fn.Q.default, Va = .1, Ha = .05, Ua = .005, Wa = .02, Ga = .7, Ka = 1e-4, qa = "A game rule could not be applied.";
function Ja() {
	let e = globalThis.document;
	return e && typeof e.addEventListener == "function" && typeof e.removeEventListener == "function" ? e : null;
}
function Ya(e, t) {
	return e === void 0 || t === void 0 ? e === t : Math.abs(e - t) <= Ka * Math.max(1, Math.abs(e), Math.abs(t));
}
function Xa(e, t) {
	if (!e || !t) return e === t;
	let n = Object.keys(e);
	return n.length === Object.keys(t).length && n.every((n) => Object.hasOwn(t, n) && Ya(e[n], t[n]));
}
function Za(e, t) {
	return !e || !t ? e === t : Ya(e.gainScale, t.gainScale) && Ya(e.volumeDb, t.volumeDb) && Ya(e.pan, t.pan) && Xa(e.sends, t.sends) && Xa(e.knobs, t.knobs) && e.instrumentId === t.instrumentId && e.patternId === t.patternId;
}
function Qa(e, t, n, r) {
	let i = Math.min(1, Math.max(0, t));
	if (e === "track:volume") return La + i * 72;
	if (e === "track:pan") return wr(i * 2 - 1);
	if (e.startsWith("track:send:")) return r.has(e.slice(11)) ? Tr(i) : null;
	let a = n ? nt(n, e) : null;
	return a && !a.rebuild ? U(a, i) : null;
}
function $a() {
	return Array.from({ length: 12 }, (e, t) => 1200 * Math.log2(1 - .98 * ((t + 1) / 12)));
}
function eo(e, t = {}) {
	let n = t.transport === void 0, r = t.transport ?? e.createTransport(), i = (e, n) => {
		try {
			t.onError ? t.onError(e, n) : console.error(e, n);
		} catch {}
	}, a = e.createMusicChain(t.destination ?? e.destination, i), { cue: o, pause: s, hidden: c } = a, l = !1, u = (e) => {
		l || (l = !0, i(qa, e));
	}, d = Pa(e, {
		onError: (e, t) => e === qa ? u(t) : i(e, t),
		destination: a.input,
		transport: r
	}), f = null, p = [], m = Zn({}), h = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ new Map(), _ = /* @__PURE__ */ new Map(), v = !1, y = null, b = 0, x = null, S = 0, C = null, w = /* @__PURE__ */ new Map(), T = /* @__PURE__ */ new Map(), E = /* @__PURE__ */ new Map(), D = /* @__PURE__ */ new Map(), O = /* @__PURE__ */ new Map(), k = null, A = !1, j = null, M = null, N = null, P = !1, F = (e) => g.get(e) ?? h.get(e), I = (e) => e.tick === null ? null : e, L = () => r.immediate(), R = (e, t, n, r = L()) => {
		e.rampTo(t, Math.max(Ua, n), r);
	}, z = (e) => {
		e !== null && r.clearTimeout(e);
	}, B = () => d.getState() === "playing", ee = (e) => h.get(e)?.value ?? null, te = () => {
		let e = m.tempo, t = e ? ee(e.dialId) : null, n = e && t !== null ? er(e.points, t) : null;
		if (!e || n === null) {
			x?.cancel(), x = null, y !== null && f && Number.isFinite(f.bpm) && d.setTempoRule(null), y = null;
			return;
		}
		let i = Math.min(Ia, Math.max(Fa, n));
		if (b = i, y === null || !Ya(y, i) || x) {
			if (e.landing === "now" || !B()) {
				x?.cancel(), x = null, y = i, d.setTempoRule(i);
				return;
			}
			x || y !== null && Ya(y, i) || (y = i, x = I(d.atBoundary("bar", (e) => {
				x = null;
				let t = b;
				y = t;
				let n = m.tempo ? m.tempo.glideBeats * 60 / Math.max(Fa, r.tempo()) : 0;
				d.setTempoRule(t, {
					time: e,
					glideSeconds: Math.max(Ua, n)
				});
			})));
		}
	}, ne = () => {
		let e = m.transpose, t = e ? ee(e.dialId) : null, n = e && t !== null ? er(e.points, t) : null, r = n === null ? 0 : Math.max(-24, Math.min(24, Math.round(n)));
		r !== S && (S = r, C?.cancel(), C = I(d.atBoundary("bar", () => {
			C = null, d.setTranspose(S);
		})));
	}, re = (e) => e ? p.find((t) => t.id === e) ?? null : null, ie = (e) => {
		let t = {};
		for (let n of m.swaps) n.trackId === e && T.get(n.id) === !0 && (n.kind === "instrument" ? t.instrumentId = n.to : t.patternId = n.to);
		return t;
	}, ae = () => {
		if (f) {
			for (let e of m.swaps) {
				let t = h.get(e.dialId);
				t && T.set(e.id, tr(t.value, e.threshold, t.dial.cushion, T.get(e.id) ?? null));
			}
			for (let e of f.tracks) {
				let t = ie(e.id), n = E.get(e.id) ?? {};
				if (t.instrumentId === n.instrumentId && t.patternId === n.patternId) {
					D.get(e.id)?.cancel(), D.delete(e.id);
					continue;
				}
				if (D.has(e.id)) continue;
				let r = e.id, i = I(d.atBoundary("bar", () => {
					D.delete(r), E.set(r, ie(r)), oe();
				}));
				i && D.set(r, i);
			}
		}
	}, oe = (e) => {
		if (!f) return;
		let t = new Set(or(f).map((e) => e.id)), n = /* @__PURE__ */ new Map(), r = (e) => {
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
			let o = w.get(t.id) ?? null, s = tr(a.value, t.threshold, a.dial.cushion, o);
			w.set(t.id, s);
			let c = r(n);
			c.gainScale = (c.gainScale ?? 1) * +!!s, c.gainSeconds = Math.max(c.gainSeconds ?? 0, e ?? t.fadeSeconds);
		}
		let o = { ...Rn(f) };
		for (let e of m.links) {
			let n = ee(e.dialId), a = n === null ? null : er(e.points, n);
			if (a === null) continue;
			if (Pn(e.target)) {
				let t = e.target === "master:filter.Q" ? "Q" : "frequency";
				o[t] = U(Fn[t], a);
				continue;
			}
			let s = e.trackId === void 0 ? void 0 : i.get(e.trackId);
			if (!s) continue;
			let c = re(E.get(s.id)?.instrumentId ?? s.instrumentId), l = Qa(e.target, a, c, t);
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
		for (let [e, t] of n) Za(O.get(e), t) || (O.set(e, t), d.setTrackControl(e, t));
		for (let e of [...O.keys()]) n.has(e) || (O.delete(e), d.setTrackControl(e, null));
		v || (!k || !Ya(k.frequency, o.frequency) || !Ya(k.Q, o.Q)) && (k = o, a.setLowpass("master", o.frequency, o.Q, e === 0 ? Ua : Va));
	}, V = (e) => {
		if (f) try {
			te(), ne(), ae(), oe(e);
		} catch (e) {
			u(e);
		}
	}, se = () => {
		if (v) return;
		let e = L();
		for (let t of h.values()) t.value = nr(t.dial, t.from, t.target, e - t.since);
		V();
	}, H = r.setInterval(se, Ra), ce = () => {
		x?.cancel(), x = null, y = null, C?.cancel(), C = null;
		for (let e of D.values()) e.cancel();
		D.clear(), w.clear(), T.clear();
	}, le = () => {
		M?.cancel(), M = null, N = null, de();
	}, ue = () => {
		let e = L();
		o.holdAt(e), R(o, 1, Ua, e);
	}, de = () => {
		P && (P = !1, ue());
	}, fe = () => j !== null || N !== null && N.action !== "jump", pe = () => {
		le(), z(j), j = null, f && Number.isFinite(f.bpm) && d.releaseTempo(), y = null;
	}, me = () => {
		R(o, 1, Ua), d.bendPitch([0], 0, L());
	}, W = (e) => {
		A = !1, a.setLowpass("muffle", za, Ba, e), R(s, 1, e);
	}, he = (e) => {
		if (!f) return 0;
		let t = d.getPositionTicks(), { loop: n } = f, i = e < t && n.enabled;
		if (!f.tempoChanges?.length) {
			let a = e - t + (i ? n.endTick - n.startTick : 0);
			return Math.max(0, a) * (60 / (Math.max(Fa, r.tempo()) * 960));
		}
		let a = ri(f), o = i ? a.secondsBetween(t, n.endTick) + a.secondsBetween(n.startTick, e) : a.secondsBetween(t, e);
		return Math.max(0, o) / d.tempoRate();
	}, ge = (e) => {
		z(j), j = r.setTimeout(() => {
			j = null;
			try {
				d.stop(), d.seek(0), pe(), V();
			} catch (e) {
				i("A cue could not finish.", e);
			}
		}, Math.max(0, e));
	}, _e = (e, t) => {
		let n = e.seconds;
		if (e.action === "jump") {
			let r = Qn(f ?? {}).find((t) => t.id === e.sectionId);
			if (!r) return;
			d.jumpAt(r.startTick, t), n > 0 && (o.cancelFrom(t), o.setAt(0, t), o.linearTo(1, t + n / 2));
			return;
		}
		if (e.action === "stop") {
			d.stopAt(t), d.seek(0);
			return;
		}
		if (e.action === "fadeOut") {
			let e = Math.max(Ua, n);
			o.cancelFrom(t), o.setAt(1, t), o.linearTo(0, t + e), ge(t + e - L());
			return;
		}
		let i = n > 0 ? n : Wn, a = Math.max(Fa, r.tempo());
		d.slumpTempo(Math.max(1, a * Wa), i, t), d.bendPitch($a(), i, t), o.cancelFrom(t), o.setAt(1, t + i * Ga), o.linearTo(0, t + i), ge(t + i - L());
	}, ve = t.visibility === void 0 ? Ja() : t.visibility, ye = () => {
		!v && ve && R(c, +!ve.hidden, Ha);
	};
	return ve?.addEventListener("visibilitychange", ye), ve?.hidden && c.setAt(0, L()), {
		player: d,
		setGame(e, t, n) {
			if (v) return;
			let r = e?.id !== f?.id, i = e?.bpm !== f?.bpm || e?.tempoChanges !== f?.tempoChanges;
			if (r) {
				for (let e of O.keys()) d.setTrackControl(e, null);
				O.clear(), A && W(Ua), pe();
			}
			d.setSong(e, t), f = e, p = t, m = Zn(e ?? {}), (r || i) && (y = null), r && (l = !1, ce(), E.clear(), d.setTranspose(0), S = 0);
			let a = /* @__PURE__ */ new Set();
			g.clear();
			for (let e of n) {
				if (a.has(e.id) || g.has(e.name)) continue;
				a.add(e.id);
				let t = h.get(e.id), n = $n(e, _.get(e.name) ?? _.get(e.id) ?? t?.target ?? e.defaultValue), r;
				if (!t) r = {
					dial: e,
					target: n,
					value: n,
					from: n,
					since: L()
				};
				else {
					let i = $n({
						...e,
						step: "continuous"
					}, t.value);
					r = n !== t.target || i !== t.value ? {
						dial: e,
						target: n,
						value: i,
						from: i,
						since: L()
					} : {
						...t,
						dial: e
					};
				}
				h.set(e.id, r), g.set(e.name, r);
			}
			for (let e of [...h.keys()]) a.has(e) || h.delete(e);
			V();
		},
		setDial(e, t, n = {}) {
			if (v || typeof e != "string" || !Number.isFinite(t)) return;
			_.set(e, t);
			let r = F(e);
			if (!r) return;
			let i = $n(r.dial, t);
			i !== r.target && (r.from = r.value, r.since = L(), r.target = i), n.jump && (r.value = r.from = r.target), se();
		},
		dialValue: (e) => F(e)?.value ?? null,
		cue(e) {
			if (v || !f) return !1;
			let t = Yn(f), n = t.find((t) => t.name === e) ?? t.find((t) => t.id === e);
			if (!n) return !1;
			let r = n.action === "jump" ? Qn(f).find((e) => e.id === n.sectionId) : void 0;
			if (n.action === "jump" && !r) return !1;
			if (!B()) return r ? d.seek(r.startTick) : d.stop(), !0;
			if (j !== null && (pe(), me()), le(), M = I(d.atBoundary(n.landing, (e) => {
				M = null, N = null, P = !1;
				try {
					_e(n, e);
				} catch (e) {
					ue(), i("A cue could not be played.", e);
				}
			}, {
				drop: !0,
				onDrop: le
			})), M && (N = n), n.action === "jump" && n.seconds > 0 && M && M.tick !== null) {
				let e = L() + he(M.tick), t = Math.max(L(), e - n.seconds / 2);
				o.cancelFrom(t), o.setAt(1, t), o.linearTo(0, Math.max(t + Ua, e)), P = !0;
			}
			return !0;
		},
		play() {
			v || (A && W(Xn(f ?? {}).fadeSeconds), B() && fe() && (pe(), d.stop(), d.seek(0)), !B() && (pe(), me(), V(), d.play()));
		},
		pause() {
			if (v || A || !B()) return;
			let e = Xn(f ?? {});
			if (A = !0, le(), e.mode === "stop") {
				d.stop(), d.seek(0);
				return;
			}
			a.setLowpass("muffle", e.muffleHz, Ba, e.fadeSeconds), e.mode === "freeze" && (d.pause(), e.fadeSeconds > 0 && R(s, 0, e.fadeSeconds));
		},
		stop() {
			v || (A && W(Ua), d.stop(), pe(), V());
		},
		isPaused: () => A,
		settle: () => {
			for (let e of h.values()) e.value = e.from = e.target;
			w.clear(), T.clear(), V(0);
		},
		setMuffle(e, t) {
			if (v || !Number.isFinite(e)) return;
			let n = Math.min(za, Math.max(Fn.frequency.min, e));
			a.setLowpass("host", n, Ba, Math.max(Ua, Number.isFinite(t) ? t : 0));
		},
		dispose() {
			v || (v = !0, r.clearInterval(H), z(j), ve?.removeEventListener("visibilitychange", ye), d.dispose(), n && r.dispose(), a.dispose(), h.clear(), g.clear(), _.clear());
		}
	};
}
//#endregion
//#region src/engine/patch-io.ts
function to(e, t) {
	return typeof e == "string" ? e : t;
}
function no(e, t) {
	return Array.isArray(e) ? e.map((e) => {
		if (typeof e != "object" || !e || !Array.isArray(e.connections)) return e;
		let n = e.connections.flatMap((e) => {
			let n = typeof e == "object" && e ? tt(e.target) : null;
			if (n?.kind !== "layer") return [e];
			let r = t.get(n.layer);
			return r === void 0 ? [] : [{
				...e,
				target: et(r, n.path)
			}];
		});
		return {
			...e,
			connections: n
		};
	}) : e;
}
function ro(e) {
	let t = e;
	if (typeof e == "string") try {
		t = JSON.parse(e);
	} catch {
		return {
			ok: !1,
			error: "This file is not valid JSON, so it can't be an instrument patch."
		};
	}
	if (typeof t != "object" || !t || Array.isArray(t)) return {
		ok: !1,
		error: "An instrument patch must be a JSON object."
	};
	let n = t, r = n.id;
	if (typeof r != "string" || r.trim() === "") return {
		ok: !1,
		error: "The patch has no id."
	};
	if (!Array.isArray(n.layers) || n.layers.length === 0) return {
		ok: !1,
		error: "The patch has no layers, so there is nothing to play."
	};
	let i = n.kit !== null && typeof n.kit == "object" && !Array.isArray(n.kit) ? n.kit : null, a = i && Object.hasOwn(i, "pads") ? i.pads : void 0, o = Array.isArray(a) ? 96 : 3, s = [];
	for (let [e, t] of n.layers.slice(0, o).entries()) {
		if (typeof t != "object" || !t) return {
			ok: !1,
			error: `Layer ${e + 1} is not an object.`
		};
		let n = t;
		if (!_(n.voiceType)) return {
			ok: !1,
			error: `Layer ${e + 1} uses an unknown voice type: ${JSON.stringify(n.voiceType)}.`
		};
		s.push({
			voiceType: n.voiceType,
			polyphony: sn(n.polyphony),
			volume: cn(n.volume),
			params: me(n.voiceType, n.params)
		});
	}
	let c, l = n.lfos;
	if (Array.isArray(a)) {
		let e = kt(a, s);
		if (!e) return {
			ok: !1,
			error: "The drum kit has no pads, so there is nothing to play."
		};
		c = e.kit, s = e.layers, l = no(l, e.moved);
	}
	let u = {
		id: r,
		name: to(n.name, "Untitled"),
		category: to(n.category, "Uncategorized"),
		description: to(n.description, ""),
		layers: s
	};
	c && (u.kit = c);
	let d = dt(n.effects);
	d.length > 0 && (u.effects = d);
	let f = ft(l, u);
	f.length > 0 && (u.lfos = f);
	let p = Qe(n.repeat);
	return p && (u.repeat = p), {
		ok: !0,
		patch: u
	};
}
//#endregion
//#region src/song/key.ts
var io = [
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
function ao(e) {
	return io.includes(e);
}
function oo(e) {
	return (Math.round(e) % 12 + 12) % 12;
}
function so(e) {
	if (typeof e != "object" || !e || Array.isArray(e)) return null;
	let t = Object.hasOwn(e, "root") ? e.root : void 0, n = Object.hasOwn(e, "scale") ? e.scale : void 0;
	return typeof t != "number" || !Number.isFinite(t) || !ao(n) ? null : {
		root: oo(t),
		scale: n
	};
}
var co = [
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
function lo(e) {
	return co.includes(e);
}
//#endregion
//#region src/song/chords.ts
var uo = 1024;
Object.freeze({
	root: 0,
	scale: "major"
});
function fo(e) {
	return e.startTick + e.lengthTicks;
}
//#endregion
//#region src/state/immutable.ts
var po = /* @__PURE__ */ new Set([
	"__proto__",
	"prototype",
	"constructor"
]);
function mo(e) {
	return po.has(e);
}
function ho(e) {
	let t = 0;
	for (let n of po) Object.hasOwn(e, n) && t++;
	return t;
}
//#endregion
//#region src/state/mix-normalize.ts
var go = 40, _o = 16, vo = _o * 4, yo = 16, bo = (e, t) => Object.hasOwn(e, t) ? e[t] : void 0;
function xo(e) {
	if (typeof e != "string") return null;
	let t = e.trim();
	return t.length > 0 && t.length <= 64 && !mo(t) ? t : null;
}
function So(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(16, Math.max(1, Math.round(e))) : null;
}
function Co(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(6, Math.max(-60, e)) : null;
}
function wo(e, t) {
	return typeof e == "string" && e.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, go).trim() || t;
}
function To(e) {
	if (typeof e != "object" || !e || Array.isArray(e)) return null;
	let t = {}, n = 0, r = 0;
	for (let i in e) {
		if (n >= _o || r++ >= vo) break;
		if (!Object.hasOwn(e, i)) continue;
		let a = xo(i), o = Tr(bo(e, i));
		a === null || a !== i || o <= 0 || (t[a] = o, n++);
	}
	return n > 0 ? t : null;
}
function Eo(e, t) {
	let n = wr(bo(t, "pan"));
	n !== 0 && (e.pan = n);
	let r = To(bo(t, "sends"));
	r && (e.sends = r);
	let i = So(bo(t, "voiceLimit"));
	i !== null && (e.voiceLimit = i);
}
function Do(e) {
	if (typeof e != "object" || !e || Array.isArray(e)) return null;
	let t = e, n = xo(bo(t, "id")), r = bo(t, "type");
	return n === null || !Ue(r) ? null : {
		id: n,
		name: wo(bo(t, "name"), He[r]),
		type: r,
		params: qe(r, bo(t, "params")),
		returnDb: Co(bo(t, "returnDb")) ?? 0,
		mute: bo(t, "mute") === !0
	};
}
function Oo(e, t, n) {
	if (e === void 0) return null;
	if (!Array.isArray(e)) return t(`${n} had an unreadable list of send buses, so it got the default Reverb and Delay.`), null;
	let r = [], i = Math.max(0, e.length - yo);
	for (let t of e.slice(0, yo)) {
		let e = Do(t);
		!e || r.length >= 4 || r.some((t) => t.id === e.id) ? i++ : r.push(e);
	}
	return i > 0 && t(`${n}: dropped ${i === 1 ? "a send bus" : `${i} send buses`} that couldn't be read or didn't fit.`), r;
}
function ko(e, t) {
	if (!e.sends) return e;
	let n = Object.entries(e.sends).filter(([e]) => t.has(e));
	if (n.length === Object.keys(e.sends).length) return e;
	let r = { ...e };
	return n.length > 0 ? r.sends = Object.fromEntries(n) : delete r.sends, r;
}
//#endregion
//#region src/state/pattern-normalize.ts
var Ao = 128, jo = 40, Mo = (e, t) => Object.hasOwn(e, t) ? e[t] : void 0;
function No(e) {
	return typeof e == "object" && e && !Array.isArray(e) ? e : null;
}
function Po(e) {
	if (typeof e != "string") return null;
	let t = e.trim();
	return t.length > 0 && t.length <= Ao ? t : null;
}
function Fo(e, t) {
	if (typeof e != "string") return t;
	let n = e.slice(0, 160).replace(/[\u0000-\u001f\u007f]/g, " ").trim();
	return Array.from(n).slice(0, jo).join("").trim() || t;
}
function Io(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(64, Math.max(1, Math.round(e))) : null;
}
function Lo(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(1, Math.max(0, e)) : null;
}
function Ro(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(1, Math.max(0, e)) : 0;
}
function zo(e, t) {
	let n = Array(t).fill(0);
	for (let r = 0; r < Math.min(t, e.length); r++) n[r] = Ro(e[r]);
	return n;
}
function Bo(e, t) {
	let n = No(e);
	if (!n) return null;
	let r = Mo(n, "note"), i = Mo(n, "steps");
	if (typeof r != "number" || !Number.isFinite(r) || !Array.isArray(i)) return null;
	let a = Math.round(r);
	return a < 0 || a > 127 ? null : {
		note: a,
		steps: zo(i.slice(0, 64), t)
	};
}
function Vo(e) {
	let t = No(e);
	if (!t) return null;
	let n = Po(Mo(t, "id"));
	if (n === null) return null;
	let r = Io(Mo(t, "length")) ?? 16, i = Mo(t, "stepSize"), a = Mo(t, "rows"), o = [], s = /* @__PURE__ */ new Set();
	if (Array.isArray(a)) for (let e of a.slice(0, 64)) {
		let t = Bo(e, r);
		if (t && !s.has(t.note) && (s.add(t.note), o.push(t), o.length >= 16)) break;
	}
	return {
		id: n,
		name: Fo(Mo(t, "name"), "Pattern"),
		length: r,
		stepSize: Hi(i) ? i : "1/16",
		swing: Lo(Mo(t, "swing")) ?? 0,
		rows: o
	};
}
function Ho(e, t, n) {
	if (e === void 0) return null;
	if (!Array.isArray(e)) return t(`${n} had an unreadable pattern list, so its pattern clips are now empty.`), null;
	let r = [], i = /* @__PURE__ */ new Set(), a = 0;
	for (let t of e.slice(0, 128)) {
		let e = Vo(t);
		if (!e || i.has(e.id)) {
			a++;
			continue;
		}
		i.add(e.id), r.push(e);
	}
	return a += Math.max(0, e.length - 128), a > 0 && t(`${n}: dropped ${a} unreadable or repeated ${a === 1 ? "pattern" : "patterns"}.`), r.length > 0 ? r : null;
}
function Uo(e, t, n, r) {
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
var Wo = [...rr, "none"];
function Go(e) {
	return e === "none" || ir(e);
}
function Ko(e) {
	return e.role ?? "none";
}
function qo(e) {
	return Wo.indexOf(e);
}
function Jo(e) {
	let t = !0;
	for (let n = 1; n < e.length && t; n++) qo(Ko(e[n - 1])) > qo(Ko(e[n])) && (t = !1);
	return t ? e : e.map((e, t) => ({
		track: e,
		i: t,
		g: qo(Ko(e))
	})).sort((e, t) => e.g - t.g || e.i - t.i).map((e) => e.track);
}
function Yo(e) {
	if (!Array.isArray(e)) return [];
	let t = new Set(e.filter(Go));
	return Wo.filter((e) => t.has(e));
}
function Xo(e) {
	return Number.isFinite(e) ? Math.min(40, Math.max(3, Math.round(e * 16) / 16)) : 6;
}
function Zo(e) {
	return typeof e == "number" && Number.isFinite(e) ? Xo(e) : null;
}
//#endregion
//#region src/song/track-colors.ts
var Qo = /^#[0-9a-f]{6}$/;
function $o(e) {
	if (typeof e != "string") return null;
	let t = e.trim().toLowerCase();
	return Qo.test(t) ? t : null;
}
//#endregion
//#region src/state/document.ts
function es(e, t) {
	let n = $o(J(t, "color"));
	n && (e.color = n, J(t, "colorPicked") === !0 && (e.colorPicked = !0));
	let r = Zo(J(t, "height"));
	r !== null && (e.height = r);
}
var ts = "Untitled Song", ns = "Track", rs = 120, is = -60, as = 12, os = [
	2,
	4,
	8,
	16
], ss = 32767, cs = 384e5, ls = 128, us = {
	rack: 1024,
	songs: 64,
	tracksPerSong: 128,
	clipsPerTrack: 512,
	notesPerClip: 2e4,
	totalNotes: 1e5
}, ds = 1024, fs = 50, ps = (e, t, n) => Math.min(n, Math.max(t, e));
function ms(e) {
	return typeof e == "number" && Number.isFinite(e);
}
function J(e, t) {
	return Object.hasOwn(e, t) ? e[t] : void 0;
}
function Y(e, t, n = `${t}s`) {
	return `${e.toLocaleString("en-US")} ${e === 1 ? t : n}`;
}
function hs(e) {
	return ms(e) ? ps(e, 20, 400) : null;
}
function gs(e) {
	return ms(e) ? ps(e, is, as) : null;
}
function _s(e) {
	return ms(e) ? ps(Math.round(e), 0, cs) : null;
}
function vs(e) {
	return ms(e) ? ps(Math.round(e), 1, cs) : null;
}
function ys(e) {
	if (typeof e != "object" || !e) return null;
	let t = J(e, "beats"), n = J(e, "unit");
	return typeof t != "number" || !Number.isInteger(t) || t < 1 || t > 32 || typeof n != "number" || !os.includes(n) ? null : {
		beats: t,
		unit: n
	};
}
function bs(e) {
	if (typeof e != "object" || !e) return null;
	let t = _s(J(e, "startTick")), n = _s(J(e, "endTick"));
	return t === null || n === null ? null : {
		enabled: J(e, "enabled") === !0,
		startTick: t,
		endTick: Math.max(t, n)
	};
}
var xs = /[\u0000-\u001f\u007f]/g;
function Ss(e, t) {
	if (typeof e != "string") return t;
	let n = e.slice(0, 400).replace(xs, " ").trim();
	return n.length > 100 && (n = Array.from(n).slice(0, 100).join("").trim()), n || t;
}
function Cs(e) {
	if (typeof e != "string") return null;
	let t = e.trim();
	return t.length > 0 && t.length <= ls ? t : null;
}
function ws() {
	return {
		beats: 4,
		unit: 4
	};
}
function Ts() {
	return {
		enabled: !1,
		startTick: 0,
		endTick: 0
	};
}
function Es(e, t = us.totalNotes, n = {}) {
	let r = [], i = 0, a = 0, o = 0;
	return {
		rackIds: new Set(e),
		notesLeft: Math.max(0, t),
		...n.clipReader ? { clipReader: n.clipReader } : {},
		warn(e) {
			r.length < fs ? r.push(e) : i++;
		},
		overBudget(e) {
			o += e;
		},
		record(e) {
			return typeof e != "object" || !e || Array.isArray(e) ? null : (a += ho(e), e);
		},
		warnings() {
			let e = [...r];
			return o > 0 && e.push(`The project held more notes than the ${Y(us.totalNotes, "note")} limit, so ${Y(o, "note")} were dropped.`), a > 0 && e.push(`Ignored ${Y(a, "unsafe key")} (such as "__proto__") in the file.`), i > 0 && e.push(`…and ${Y(i, "more problem")}.`), e;
		}
	};
}
function Ds(e, t) {
	let n = t.record(e);
	if (!n) return null;
	let r = _s(J(n, "tick")), i = vs(J(n, "durationTicks")), a = J(n, "midi"), o = J(n, "velocity");
	if (r === null || i === null || !ms(a) || !ms(o)) return null;
	let s = Math.round(a);
	return s < 0 || s > 127 ? null : {
		tick: r,
		durationTicks: i,
		midi: s,
		velocity: ps(o, 0, 1)
	};
}
var Os = (e, t) => e.tick - t.tick || e.midi - t.midi;
function ks(e, t, n) {
	return e ? `${t} "${e}"` : `${t} ${n}`;
}
function As(e) {
	return typeof e == "object" && e && !Array.isArray(e) ? Cs(J(e, "id")) : null;
}
function js(e, t, n, r, i, a) {
	if (!Array.isArray(e)) return e !== void 0 && n.warn(`${r} had an unreadable ${i} list, so it is now empty.`), [];
	let o = Math.min(e.length, t);
	e.length > o && n.warn(`${r} held more than ${Y(o, i)}; the extra ${Y(e.length - o, i)} were dropped.`);
	let s = [], c = /* @__PURE__ */ new Set(), l = 0, u = 0;
	for (let t = 0; t < o; t++) {
		let n = As(e[t]);
		if (n !== null && c.has(n)) {
			u++;
			continue;
		}
		let r = a(e[t]);
		r ? (c.add(r.id), s.push(r)) : l++;
	}
	return l > 0 && n.warn(`${r}: dropped ${Y(l, `unreadable ${i}`)}.`), u > 0 && n.warn(`${r}: dropped ${Y(u, i)} that repeated an earlier ${i}'s id.`), s;
}
function Ms(e, t, n = "A track") {
	let r = t.record(e);
	if (!r) return null;
	let i = Cs(J(r, "id")), a = _s(J(r, "startTick")), o = vs(J(r, "lengthTicks")), s = J(r, "notes");
	if (i === null || a === null || o === null || !Array.isArray(s)) return null;
	let c = Ss(J(r, "name"), ""), l = `${n}, ${ks(c, "clip", i)}`, u = Po(J(r, "patternId"));
	if (u !== null) return {
		id: i,
		name: c,
		startTick: a,
		lengthTicks: o,
		notes: [],
		patternId: u
	};
	let d = Math.min(s.length, us.notesPerClip);
	s.length > d && t.warn(`${l} held more than ${Y(d, "note")}; the extra ${Y(s.length - d, "note")} were dropped.`);
	let f = [], p = 0;
	for (let e = 0; e < d; e++) {
		let n = Ds(s[e], t);
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
	p > 0 && t.warn(`${l}: dropped ${Y(p, "invalid note")}.`), f.sort(Os);
	let m = {
		id: i,
		name: c,
		startTick: a,
		lengthTicks: o,
		notes: f
	}, h = Cs(J(r, "poolId"));
	h !== null && (m.poolId = h);
	let g = Bi(J(r, "swing"));
	return g && (m.swing = g), t.clipReader?.(r, m, t, l), m;
}
function Ns(e, t, n = "A song") {
	let r = t.record(e);
	if (!r) return null;
	let i = Cs(J(r, "id"));
	if (i === null) return null;
	let a = Ss(J(r, "name"), ns), o = `${n}, ${ks(a, "track", i)}`, s = J(r, "instrumentId"), c = null;
	typeof s == "string" && t.rackIds.has(s) ? c = s : s != null && t.warn(`${o} used an instrument that isn't in the rack, so it is now silent.`);
	let l = J(r, "volume"), u = gs(l);
	u === null && (l !== void 0 && t.warn(`${o} had an unreadable volume, so it was reset to 0 dB.`), u = 0);
	let d = js(J(r, "clips"), us.clipsPerTrack, t, o, "clip", (e) => Ms(e, t, o)), f = {
		id: i,
		name: a,
		instrumentId: c,
		volume: u,
		mute: J(r, "mute") === !0,
		solo: J(r, "solo") === !0,
		clips: d
	}, p = J(r, "role");
	return ir(p) && (f.role = p), J(r, "ignoresGlide") === !0 && (f.ignoresGlide = !0), Eo(f, r), es(f, r), f;
}
function Ps(e, t) {
	let n = t.record(e);
	if (!n) return null;
	let r = Cs(J(n, "id"));
	if (r === null) return null;
	let i = Ss(J(n, "name"), ts), a = `Song "${i}"`, o = hs(J(n, "bpm"));
	o === null && (t.warn(`${a} had an unreadable tempo, so it was set to ${rs} BPM.`), o = rs);
	let s = ys(t.record(J(n, "timeSignature")));
	s ||= (t.warn(`${a} had an unreadable time signature, so it was set to 4/4.`), ws());
	let c = zs(J(n, "tempoChanges"), o, t, a), l = Bs(J(n, "meterChanges"), s, t, a);
	o = c.bpm, s = l.timeSignature;
	let u = bs(t.record(J(n, "loop")));
	u ||= (J(n, "loop") !== void 0 && t.warn(`${a} had an unreadable loop region, so looping was turned off.`), Ts());
	let d = J(n, "sourcePpq"), f = typeof d == "number" && Number.isInteger(d) && d >= 1 && d <= ss ? d : null, p = Oo(J(n, "buses"), t.warn, a), m = new Set(or({ buses: p ?? void 0 }).map((e) => e.id)), h = Ho(J(n, "patterns"), t.warn, a), g = new Set((h ?? []).map((e) => e.id)), _ = js(J(n, "tracks"), us.tracksPerSong, t, a, "track", (e) => {
		let n = Ns(e, t, a);
		return n && Uo(ko(n, m), g, t.warn, a);
	}), v = {
		id: r,
		name: i,
		bpm: o,
		timeSignature: s,
		...c.changes.length ? { tempoChanges: c.changes } : {},
		...l.changes.length ? { meterChanges: l.changes } : {},
		loop: u,
		sourcePpq: f,
		tracks: Jo(_)
	};
	p && (v.buses = p), h && (v.patterns = h);
	let y = Yo(J(n, "folded"));
	y.length && (v.folded = y);
	let b = ji(J(n, "overrides"), t.rackIds, t.warn, a);
	b && (v.overrides = b), hc(v, n, {
		trackIds: new Set(_.map((e) => e.id)),
		busIds: m,
		patternIds: g,
		rackIds: t.rackIds
	}, (e) => t.warn(`${a}: ${e}`));
	let x = Vs(J(n, "glides"), t, a);
	return x.length && (v.glides = x), v;
}
function Fs(e) {
	if (!ms(e)) return null;
	let t = Math.round(e);
	return t >= 0 && t <= cs ? t : null;
}
function Is(e, t, n, r, i, a) {
	if (e === void 0) return [];
	if (!Array.isArray(e)) return i(` had an unreadable ${a} list, so it is now empty.`), [];
	let o = Math.min(e.length, t * 4), s = [], c = 0;
	for (let t = 0; t < o; t++) {
		let i = r(e[t]), a = i && n(i);
		a ? s.push(a) : c++;
	}
	c > 0 && i(`: dropped ${Y(c, `unreadable ${a}`)}.`), s.sort((e, t) => e.tick - t.tick);
	let l = [];
	for (let e of s) l.length > 0 && l[l.length - 1].tick === e.tick ? l[l.length - 1] = e : l.push(e);
	return l;
}
function Ls(e, t, n, r, i) {
	if (e.length <= n && t <= n * 4) return e;
	let a = e.slice(0, n);
	return r(` held more than ${Y(n, i)}; the ones past that were dropped.`), a;
}
var Rs = (e) => (t) => e ? e.record(t) : typeof t == "object" && t && !Array.isArray(t) ? t : null;
function zs(e, t, n, r = "A song") {
	let i = (e) => n?.warn(`${r}${e}`), a = Is(e, ds, (e) => {
		let t = Fs(J(e, "tick")), n = J(e, "bpm");
		if (t === null || !ms(n)) return null;
		let r = {
			tick: t,
			bpm: Math.round(ps(n, 20, 400) * 1e3) / 1e3
		};
		return J(e, "glide") === !0 && (r.glide = !0), r;
	}, Rs(n), i, "tempo change");
	return {
		bpm: a[0]?.tick === 0 ? a.shift().bpm : t,
		changes: Ls(a, Array.isArray(e) ? e.length : 0, ds, i, "tempo change")
	};
}
function Bs(e, t, n, r = "A song") {
	let i = (e) => n?.warn(`${r}${e}`), a = Is(e, 256, (e) => {
		let t = Fs(J(e, "tick")), n = ys(e);
		return t === null || !n ? null : {
			tick: t,
			beats: n.beats,
			unit: n.unit
		};
	}, Rs(n), i, "meter change"), o = a[0]?.tick === 0 ? a.shift() : null, s = o ? {
		beats: o.beats,
		unit: o.unit
	} : t, c = [], l = s, u = 0;
	for (let e of a) (e.beats !== l.beats || e.unit !== l.unit || (e.tick - u) % cr(l) !== 0) && (c.push(e), l = e, u = e.tick);
	return {
		timeSignature: s,
		changes: Ls(c, Array.isArray(e) ? e.length : 0, 256, i, "meter change")
	};
}
function Vs(e, t, n = "A song") {
	let r = (e) => t?.warn(`${n}${e}`);
	return Ls(Is(e, pi, (e) => {
		let t = Fs(J(e, "tick")), n = J(e, "depth") === void 0 ? -50 : J(e, "depth"), r = J(e, "rise") === void 0 ? ui : J(e, "rise");
		return t === null || !ms(n) || !ms(r) ? null : {
			tick: t,
			depth: Math.round(ps(n, -di, di) * 10) / 10,
			rise: Math.round(ps(r, fi, 5) * 1e3) / 1e3
		};
	}, Rs(t), r, "glide mark"), Array.isArray(e) ? e.length : 0, pi, r, "glide mark");
}
//#endregion
//#region src/state/game-normalize.ts
var Hs = 128, Us = 40, Ws = 1e6, X = (e, t) => Object.hasOwn(e, t) ? e[t] : void 0;
function Z(e) {
	return typeof e == "object" && e && !Array.isArray(e) ? e : null;
}
function Q(e) {
	return typeof e == "number" && Number.isFinite(e);
}
var $ = (e, t, n) => Math.min(n, Math.max(t, e));
function Gs(e) {
	if (typeof e != "string") return null;
	let t = e.trim();
	return t.length > 0 && t.length <= Hs && !t.includes(":") && !mo(t) ? t : null;
}
function Ks(e) {
	if (typeof e != "string") return null;
	let t = e.slice(0, 160).replace(/[\u0000-\u001f\u007f]/g, " ").trim(), n = Array.from(t).slice(0, Us).join("").trim();
	return n && !mo(n) ? n : null;
}
function qs(e, t) {
	return Q(e) ? $(e, 0, t) : null;
}
function Js(e, t, n, r, i) {
	if (!Array.isArray(e)) return [];
	let a = [], o = /* @__PURE__ */ new Set(), s = Math.max(0, e.length - t);
	for (let n of e.slice(0, t)) {
		let e = Z(n), t = e ? i(e) : null;
		if (!t || o.has(t.id)) {
			s++;
			continue;
		}
		o.add(t.id), a.push(t);
	}
	return s > 0 && n(`Dropped ${s} unreadable or extra ${r}${s === 1 ? "" : "s"}.`), a;
}
function Ys(e) {
	let t = Z(e);
	if (!t) return null;
	let n = Gs(X(t, "id")), r = Ks(X(t, "name")), i = X(t, "min"), a = X(t, "max");
	if (!n || !r || !Q(i) || !Q(a)) return null;
	let o = $(i, -1e6, Ws), s = $(a, -1e6, Ws);
	if (!(s > o)) return null;
	let c = X(t, "step") === "whole" ? "whole" : "continuous", l = X(t, "defaultValue"), u = Q(l) ? $(l, o, s) : o;
	return c === "whole" && (u = $(Math.round(u), o, s)), {
		id: n,
		name: r,
		min: o,
		max: s,
		step: c,
		defaultValue: u,
		riseSeconds: qs(X(t, "riseSeconds"), 60) ?? 0,
		fallSeconds: qs(X(t, "fallSeconds"), 60) ?? 0,
		cushion: Q(X(t, "cushion")) ? $(X(t, "cushion"), 0, s - o) : 0
	};
}
function Xs(e, t, n) {
	if (!Array.isArray(e)) return null;
	let r = [];
	for (let i of e.slice(0, Hn.curvePoints)) {
		let e = Z(i), a = e ? X(e, "x") : void 0, o = e ? X(e, "y") : void 0;
		Q(a) && Q(o) && r.push({
			x: $(a, -1e6, Ws),
			y: $(o, t, n)
		});
	}
	return r.sort((e, t) => e.x - t.x), r.length > 0 ? r : null;
}
function Zs(e) {
	let t = Z(e), n = t ? Gs(X(t, "dialId")) : null, r = t ? Xs(X(t, "points"), 20, 400) : null;
	if (!t || !n || !r) return null;
	let i = {
		dialId: n,
		points: r,
		glideBeats: qs(X(t, "glideBeats"), 64) ?? 0
	};
	return X(t, "landing") === "now" && (i.landing = "now"), i;
}
function Qs(e) {
	let t = Z(e), n = t ? Gs(X(t, "dialId")) : null, r = t ? Xs(X(t, "points"), -24, 24) : null;
	return t && n && r ? {
		dialId: n,
		points: r
	} : null;
}
function $s(e, t) {
	return typeof e != "string" || e.length > 256 ? !1 : e === "track:volume" || e === "track:pan" || Pn(e) ? !0 : e.startsWith("track:send:") ? t.has(e.slice(11)) : tt(e) !== null;
}
function ec(e, t) {
	let n = Gs(X(e, "id")), r = Gs(X(e, "dialId")), i = X(e, "trackId");
	return !n || !r || typeof i != "string" || !t.trackIds.has(i) ? null : {
		id: n,
		dialId: r,
		trackId: i
	};
}
function tc(e, t) {
	let n = Z(e), r = n ? X(n, "target") : void 0, i = n ? Xs(X(n, "points"), 0, 1) : null;
	if (!n || !$s(r, t.busIds) || !i) return null;
	if (Pn(r)) {
		let e = Gs(X(n, "id")), t = Gs(X(n, "dialId"));
		return e && t ? {
			id: e,
			dialId: t,
			target: r,
			points: i
		} : null;
	}
	let a = ec(n, t);
	return a ? {
		...a,
		target: r,
		points: i
	} : null;
}
function nc(e) {
	let t = Z(e);
	if (!t) return null;
	let { frequency: n, Q: r } = Fn, i = X(t, "frequency"), a = X(t, "Q");
	return {
		frequency: Q(i) ? $(i, n.min, n.max) : n.default,
		Q: Q(a) ? $(a, r.min, r.max) : r.default
	};
}
function rc(e, t) {
	let n = Z(e), r = n && ec(n, t), i = n ? X(n, "threshold") : void 0;
	return !r || !Q(i) ? null : {
		...r,
		threshold: $(i, -1e6, Ws),
		fadeSeconds: qs(X(n, "fadeSeconds"), 30) ?? 0
	};
}
function ic(e, t) {
	let n = Z(e), r = n && ec(n, t), i = n ? X(n, "threshold") : void 0, a = n ? X(n, "kind") : void 0, o = n ? X(n, "to") : void 0;
	return !r || !Q(i) || typeof o != "string" || (a === "instrument" ? !t.rackIds.has(o) : a !== "pattern" || !t.patternIds.has(o)) ? null : {
		...r,
		threshold: $(i, -1e6, Ws),
		kind: a,
		to: o
	};
}
function ac(e, t, n) {
	let r = Z(e);
	if (!r) return null;
	let i = {
		links: Js(X(r, "links"), Hn.links, n, "dial link", (e) => tc(e, t)),
		layers: Js(X(r, "layers"), Hn.layers, n, "layer rule", (e) => rc(e, t)),
		swaps: Js(X(r, "swaps"), Hn.swaps, n, "swap rule", (e) => ic(e, t))
	}, a = Zs(X(r, "tempo"));
	a && (i.tempo = a);
	let o = Qs(X(r, "transpose"));
	return o && (i.transpose = o), i;
}
function oc(e) {
	return !e.tempo && !e.transpose && e.links.length === 0 && e.layers.length === 0 && e.swaps.length === 0;
}
function sc(e) {
	return Q(e) ? $(Math.round(e), 0, cs) : null;
}
function cc(e) {
	let t = Z(e);
	if (!t) return null;
	let n = Gs(X(t, "id")), r = Ks(X(t, "name")), i = sc(X(t, "startTick")), a = sc(X(t, "endTick"));
	if (!n || !r || i === null || a === null) return null;
	let o = {
		id: n,
		name: r,
		startTick: i,
		endTick: Math.max(i, a)
	}, s = so(X(t, "key"));
	return s && (o.key = s), o;
}
function lc(e, t) {
	return Array.isArray(e) ? Js(e, Hn.sections, t, "section", cc) : null;
}
function uc(e, t) {
	let n = Z(e);
	if (!n) return null;
	let r = Gs(X(n, "id")), i = Ks(X(n, "name")), a = X(n, "action"), o = X(n, "landing");
	if (!r || !i || !zn.includes(a)) return null;
	let s = {
		id: r,
		name: i,
		action: a,
		landing: Bn.includes(o) ? o : "bar",
		seconds: qs(X(n, "seconds"), 30) ?? 0
	}, c = X(n, "sectionId");
	return typeof c == "string" && t.has(c) && (s.sectionId = c), s;
}
function dc(e, t, n) {
	if (!Array.isArray(e)) return null;
	let r = /* @__PURE__ */ new Set();
	return Js(e, Hn.cues, n, "cue", (e) => {
		let n = uc(e, t);
		return !n || r.has(n.name) ? null : (r.add(n.name), n);
	});
}
function fc(e) {
	let t = Z(e);
	if (!t) return null;
	let n = Kn(), r = X(t, "mode"), i = X(t, "muffleHz");
	return {
		mode: Vn.includes(r) ? r : n.mode,
		muffleHz: Q(i) ? $(i, 50, Un) : n.muffleHz,
		fadeSeconds: qs(X(t, "fadeSeconds"), 30) ?? n.fadeSeconds
	};
}
function pc(e) {
	let t = Z(e);
	if (!t) return null;
	let n = Gs(X(t, "id")), r = sc(X(t, "startTick")), i = X(t, "lengthTicks"), a = X(t, "root"), o = X(t, "quality");
	if (!n || r === null || r >= cs || !Q(i) || !Q(a) || !lo(o)) return null;
	let s = {
		id: n,
		startTick: r,
		lengthTicks: $(Math.round(i), 1, cs - r),
		root: oo(a),
		quality: o
	}, c = X(t, "bass");
	Q(c) && oo(c) !== s.root && (s.bass = oo(c));
	let l = X(t, "confidence");
	return Q(l) && (s.confidence = $(l, 0, 1)), s;
}
function mc(e, t) {
	if (!Array.isArray(e)) return null;
	let n = Js(e, uo, t, "chord", pc).sort((e, t) => e.startTick - t.startTick), r = [];
	for (let e of n) {
		let t = r.at(-1);
		t && fo(t) > e.startTick && (t.startTick === e.startTick ? r.pop() : r[r.length - 1] = {
			...t,
			lengthTicks: e.startTick - t.startTick
		}), r.push(e);
	}
	return r;
}
function hc(e, t, n, r) {
	let i = ac(X(t, "rules"), n, r);
	i && !oc(i) && (e.rules = i);
	let a = lc(X(t, "sections"), r);
	a?.length && (e.sections = a);
	let o = dc(X(t, "cues"), new Set((a ?? []).map((e) => e.id)), r);
	o && (e.cues = o);
	let s = fc(X(t, "pause"));
	s && (e.pause = s);
	let c = nc(X(t, "masterFilter"));
	c && !Ln(c) && (e.masterFilter = c);
	let l = so(X(t, "key"));
	l && (e.key = l);
	let u = mc(X(t, "chords"), r);
	u?.length && (e.chords = u);
}
//#endregion
//#region src/player/bundle.ts
var gc = "sine-sculptor-song", _c = 6, vc = Hn.dials;
function yc(e) {
	let t = {};
	for (let { name: n, ...r } of e) !mo(n) && !Object.hasOwn(t, n) && (t[n] = r);
	return t;
}
function bc(e) {
	return Object.entries(e).map(([e, t]) => ({
		...t,
		name: e
	}));
}
function xc() {
	return { limiterDb: -1 };
}
function Sc(e, t, n = {}) {
	let { song: r, instruments: i } = ki(Cc(zi(e)), t), { chords: a, ...o } = r, s = new Set(i.map((e) => e.id));
	for (let n of e.rules?.swaps ?? []) {
		let r = n.kind === "instrument" && !s.has(n.to) ? t.find((e) => e.id === n.to) : void 0;
		r && (s.add(r.id), i.push(Oi(r, e)));
	}
	return {
		format: gc,
		version: 6,
		name: o.name,
		song: o,
		instruments: i,
		dials: Ec(n.dials ?? {}, []),
		mix: wc(n.mix)
	};
}
function Cc(e) {
	return e.tracks.some((e) => e.clips.some((e) => "groove" in e)) ? {
		...e,
		tracks: e.tracks.map((e) => e.clips.some((e) => "groove" in e) ? {
			...e,
			clips: e.clips.map((e) => {
				if (!("groove" in e)) return e;
				let { groove: t, ...n } = e;
				return n;
			})
		} : e)
	} : e;
}
function wc(e) {
	let t = xc();
	if (typeof e != "object" || !e || Array.isArray(e)) return t;
	let n = J(e, "limiterDb");
	return Tc(n) && (t.limiterDb = Math.min(0, Math.max(-24, n))), t;
}
function Tc(e) {
	return typeof e == "number" && Number.isFinite(e);
}
function Ec(e, t) {
	let n = {};
	if (typeof e != "object" || !e || Array.isArray(e)) return n;
	let r = /* @__PURE__ */ new Set();
	for (let i of Object.keys(e).slice(0, vc)) {
		if (mo(i)) continue;
		let a = J(e, i), o = typeof a == "object" && a && !Array.isArray(a) ? a : {}, s = Ys({
			id: J(o, "id") ?? i,
			...o,
			name: i
		});
		if (s && s.name === i && !r.has(s.id)) {
			r.add(s.id);
			let { name: e, ...t } = s;
			n[i] = t;
		} else t.push(`The dial "${i}" had an unreadable range, so it was ignored.`);
	}
	return n;
}
function Dc(e) {
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
	if (J(n, "format") !== "sine-sculptor-song") return {
		ok: !1,
		error: "This file is not a Sine Sculptor song bundle."
	};
	let r = J(n, "version");
	if (!Tc(r)) return {
		ok: !1,
		error: "The song bundle has no format version."
	};
	if (r > 6) return {
		ok: !1,
		error: `This bundle needs a newer player (bundle format ${r}).`
	};
	if (r !== 6) return {
		ok: !1,
		error: "This file is not a Sine Sculptor song bundle."
	};
	let i = [], a = [], o = J(n, "instruments");
	if (Array.isArray(o)) {
		let e = /* @__PURE__ */ new Set();
		for (let t of o.slice(0, us.rack)) {
			let n = ro(t);
			n.ok ? e.has(n.patch.id) || (e.add(n.patch.id), a.push(n.patch)) : i.push(`An instrument was dropped: ${n.error}`);
		}
	}
	let s = Es(a.map((e) => e.id)), c = Ps(J(n, "song"), s);
	return c ? (i.push(...s.warnings()), {
		ok: !0,
		bundle: {
			format: gc,
			version: 6,
			name: Ss(J(n, "name"), c.name),
			song: c,
			instruments: a,
			dials: Ec(J(n, "dials"), i),
			mix: wc(J(n, "mix"))
		},
		warnings: i
	}) : {
		ok: !1,
		error: "The song bundle holds no readable song."
	};
}
//#endregion
//#region src/player/core.ts
var Oc = .05, kc = .005;
function Ac(e) {
	let t = ur(e);
	return t <= 0 ? e : {
		...e,
		loop: {
			enabled: !0,
			startTick: 0,
			endTick: li(e).barLineAtOrAfter(t)
		}
	};
}
function jc(e) {
	return e.mode === "freeze" && e.muffleHz >= 2e4 && e.fadeSeconds === 0;
}
function Mc(e, t, n = {}) {
	let r = eo(e, {
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
				n = Dc(e);
			} catch {
				return {
					ok: !1,
					error: "The song bundle could not be read."
				};
			}
			if (!n.ok) return n;
			let i = n.bundle, l = a ? Ac(i.song) : i.song;
			c = jc(Xn(l)) ? null : Xn(l), r.setGame(null, [], []), t.setLimiter(i.mix.limiterDb);
			let u = bc(i.dials);
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
		setVolume(e, n = Oc) {
			o || t.setVolume(e, Math.max(kc, n));
		},
		setMuffle(e, t = Oc) {
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
//#region src/player/player.ts
function Nc(e, t = {}) {
	let n = new e.Gain(pr(t.volumeDb ?? 0)), r = new e.Limiter(-1), i = Yr(e);
	n.connect(r), r.connect(i.input), i.output.connect(t.destination ?? e.getDestination());
	let a = Mc(qr(e), {
		destination: Br(n),
		setVolume: (t, r) => n.gain.rampTo(pr(t), r, e.immediate()),
		setLimiter: (e) => void (r.threshold.value = e)
	}, t);
	return {
		...a,
		output: n,
		dispose() {
			a.dispose(), n.dispose(), r.dispose(), i.dispose();
		}
	};
}
//#endregion
export { gc as BUNDLE_FORMAT, _c as BUNDLE_VERSION, Sc as buildBundle, yc as bundleDials, Nc as createPlayer, xc as defaultMix, bc as dialList, Dc as parseBundle };
