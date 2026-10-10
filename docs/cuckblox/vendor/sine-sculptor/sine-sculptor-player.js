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
}, t = [
	"a",
	"e",
	"i",
	"o",
	"u"
], n = {
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
}, r = {
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
}, i = {
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
}, a = {
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
function o(e) {
	let t = e >>> 0;
	return () => {
		t = t + 1831565813 >>> 0;
		let e = t;
		return e = Math.imul(e ^ e >>> 15, e | 1), e ^= e + Math.imul(e ^ e >>> 7, e | 61), ((e ^ e >>> 14) >>> 0) / 4294967296;
	};
}
function s(e) {
	return e ^= e >>> 16, e = Math.imul(e, 2246822507), e ^= e >>> 13, e = Math.imul(e, 3266489909), (e ^ e >>> 16) >>> 0;
}
function c(e, t, n) {
	let r = s(Math.floor(e) ^ 2654435769), i = s(Math.floor(t) + 1663821227 | 0), a = s(Math.imul(Math.floor(n) + 1, 668265263));
	return o(s(r ^ i ^ a));
}
var l = (e) => t.includes(e);
function u(e, t, n, r) {
	let o = n(), s = n();
	if (r !== void 0 && Object.hasOwn(i, r)) return {
		syllable: i[r],
		manual: !1
	};
	if (e.mode === "vowel") return {
		syllable: {
			c: null,
			a: l(e.vowelA) ? e.vowelA : "o",
			b: l(e.vowelB) ? e.vowelB : "u"
		},
		manual: !0
	};
	let c = (Object.hasOwn(a, e.set) ? a[e.set] : a.kk).syllables, u = () => c[Math.min(c.length - 1, Math.floor(o * c.length))], d;
	return d = e.mode === "cycle" ? c[(Math.floor(t) % c.length + c.length) % c.length] : e.mode === "random" || s < e.randomness * .6 ? u() : e.mode, {
		syllable: i[d] ?? i.nah,
		manual: !1
	};
}
var d = (e) => 10 ** (e / 20), f = (e, t, n) => e + (t - e) * n;
function p(e, t, r) {
	return n.bass[e].map((i, a) => {
		let o = n.tenor[e][a];
		return [
			f(i[0], o[0], t) * r,
			d(f(i[1], o[1], t)),
			f(i[2], o[2], t)
		];
	});
}
//#endregion
//#region src/engine/params.ts
var m = [
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
function h(e) {
	return typeof e == "string" && m.includes(e);
}
function g(e, t, n, r, i, a) {
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
function _(e, t, n, r, i, a, o) {
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
var v = [
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
], y = {
	value: "pulse",
	label: "Pulse"
}, b = [
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
], x = b.map((e) => e.value);
function S(e, t, n, r, i) {
	let a = `${e}oscillator.type`, o = [
		...v,
		...i.pulse ? [y] : [],
		...i.fat ? b : []
	], s = [_(a, `${n}Wave`, t, o, r, "The basic waveform the voice starts from, before any envelope or filter shapes it.", "Sine is pure and round, triangle is soft and hollow like an ocarina, sawtooth is bright and buzzy like brass, and square and pulse are the reedy tones of old game consoles.")];
	if (i.pulse && (s.push(g(`${e}oscillator.width`, `${n}Pulse width`, t, {
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
		let r = g(`${e}oscillator.spread`, `${n}Spread`, t, {
			min: 0,
			max: 100,
			default: 20,
			curve: "linear",
			step: 1,
			unit: "cents"
		}, "How far apart, in cents, the stacked copies of a fat wave are detuned from each other.", "A little spread gives a gentle chorus shimmer; a lot sounds like a detuned string section or a supersaw."), i = g(`${e}oscillator.count`, `${n}Copies`, t, {
			min: 2,
			max: 8,
			default: 3,
			curve: "linear",
			step: 1,
			unit: "voices"
		}, "How many detuned copies of the wave a fat oscillator stacks together.", "More copies make the sound thicker and smoother, at the cost of more processing per note.");
		r.visibleWhen = {
			path: a,
			equals: x
		}, i.visibleWhen = {
			path: a,
			equals: x
		}, s.push(r, i);
	}
	return s;
}
var C = {
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
function w(e, t, n, r, i) {
	let a = C[r], o = (e, t) => ({
		min: .001,
		max: e,
		default: t,
		curve: "log",
		unit: "s"
	}), s = [g(`${e}.attack`, `${n}Attack`, t, o(4, i.attack), ...a.attack), g(`${e}.decay`, `${n}Decay`, t, o(4, i.decay), ...a.decay)];
	if (i.sustain !== void 0 && s.push(g(`${e}.sustain`, `${n}Sustain`, t, {
		min: 0,
		max: 1,
		default: i.sustain,
		curve: "linear",
		step: .01,
		unit: ""
	}, ...a.sustain)), s.push(g(`${e}.release`, `${n}Release`, t, o(8, i.release), ...a.release)), r !== "amp" && n) for (let e of s) e.short = e.label.slice(n.length);
	return s;
}
var T = "envelope.attackCurve";
function E(e, t) {
	let n = _(T, "PUNCH UP", e, [{
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
var D = {
	MonoSynth: ["envelope", "filterEnvelope"],
	DuoSynth: [
		"voice0.envelope",
		"voice0.filterEnvelope",
		"voice1.envelope",
		"voice1.filterEnvelope"
	]
};
function O(e, t, n, r) {
	let i = n.path;
	if (!n.perNote) {
		if (i !== "envelope.attackCurve") {
			he(e, i, r);
			return;
		}
		for (let n of D[t] ?? ["envelope"]) he(e, `${n}.attackCurve`, r);
	}
}
var k = () => g("detune", "Detune", "Pitch", {
	min: -1200,
	max: 1200,
	default: 0,
	curve: "linear",
	step: 1,
	unit: "cents"
}, "Shifts the pitch of the whole voice in cents; 100 cents is one semitone and 1200 is an octave.", "Small amounts against another layer thicken the sound with a slow beating; 1200 or -1200 moves the layer a full octave."), A = () => ({
	...g("transpose", "Transpose", "Pitch", {
		min: -48,
		max: 48,
		default: 0,
		curve: "linear",
		step: 1,
		unit: "st"
	}, "Moves the whole layer up or down in semitones, up to four octaves either way; 12 is one octave.", "Stack a layer 12, 19, or 24 semitones up for the bright overtones of bells, glockenspiels, and organ stops."),
	perNote: !0
}), j = () => g("portamento", "Glide", "Pitch", {
	min: 0,
	max: 1,
	default: 0,
	curve: "linear",
	step: .005,
	unit: "s"
}, "How long the pitch slides from one note to the next. It only applies when a voice moves to a new note, so it is clearest with Voices set to 1.", "At 0 notes jump cleanly; small values add a vocal slur between notes, and longer ones give the swoop of a slide guitar or a 303 bass line.");
function M(e) {
	let t = [g("harmonicity", "Mod ratio", "Modulation", {
		min: .25,
		max: e ? 16 : 8,
		default: 3,
		curve: "log",
		step: .01,
		unit: "×"
	}, "The pitch ratio between the hidden modulating oscillator and the one you hear; 2 puts the modulator an octave above.", e ? "Whole numbers like 1, 2, and 3 give clean, musical tones; in-between values like 1.41 or 3.5 sound clangorous and bell-like." : "Whole numbers add clean, organ-like overtones; uneven values add a ring-modulated, robotic shimmer.")];
	return e && t.push(g("modulationIndex", "Mod depth", "Modulation", {
		min: .1,
		max: 100,
		default: 10,
		curve: "log",
		step: .1,
		unit: ""
	}, "How strongly the modulating oscillator bends the pitch of the one you hear, which sets how many overtones are added.", "Low values are soft and flute-like; high values turn bright and brassy, then harsh and metallic.")), t.push(_("modulation.type", "Mod wave", "Modulation", v, "square", "The waveform of the hidden modulating oscillator.", "Sine modulation is smooth and bell-like; square and sawtooth add buzzier, grittier overtones."), ...w("modulationEnvelope", "Modulation envelope", "Mod ", "mod", {
		attack: .5,
		decay: .01,
		sustain: 1,
		release: .5
	})), t;
}
function N() {
	return [
		...S("", "Oscillator", "", "triangle", {
			pulse: !0,
			fat: !0
		}),
		...w("envelope", "Envelope", "", "amp", {
			attack: .005,
			decay: .1,
			sustain: .3,
			release: 1
		}),
		E("Envelope", "linear"),
		A(),
		k(),
		j()
	];
}
function P(e) {
	return [
		...S("", "Oscillator", "", "sine", {
			pulse: !0,
			fat: !0
		}),
		...w("envelope", "Envelope", "", "amp", {
			attack: .01,
			decay: .01,
			sustain: 1,
			release: .5
		}),
		E("Envelope", "linear"),
		...M(e),
		A(),
		k(),
		j()
	];
}
function F(e) {
	return [{
		...g("keyTrack", "Key tracking", e, {
			min: 0,
			max: 1,
			default: 0,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How far the cutoff follows the note you play: at 1 it moves an octave for every octave, measured from middle C.", "Keeps guitars, harpsichords, and brass equally bright from the bottom of the keyboard to the top; at 0 high notes sound duller than low ones."),
		perNote: !0
	}, {
		...g("velocityToFilter", "Velocity to filter", e, {
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
var I = "The resting cutoff frequency of the filter, the brightness the note settles back to when the filter envelope closes.", L = "Lower values make the voice darker and more muffled; higher values let more buzz and sparkle through.";
function R() {
	return [
		...S("", "Oscillator", "", "sawtooth", {
			pulse: !0,
			fat: !0
		}),
		_("filter.type", "Filter type", "Filter", [
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
		g("filterEnvelope.baseFrequency", "Cutoff", "Filter", {
			min: 20,
			max: 2e4,
			default: 200,
			curve: "log",
			unit: "Hz"
		}, I, L),
		g("filter.Q", "Resonance", "Filter", {
			min: .1,
			max: 20,
			default: 1,
			curve: "log",
			step: .1,
			unit: ""
		}, "How much the filter emphasizes the frequencies right at its cutoff point.", "Higher values add a whistling, vocal peak that sings as the filter sweeps; very high values squeal."),
		g("filterEnvelope.octaves", "Envelope amount", "Filter", {
			min: 0,
			max: 8,
			default: 3,
			curve: "linear",
			step: .1,
			unit: "oct"
		}, "How far, in octaves, the filter envelope opens the cutoff above its resting frequency.", "At 0 the tone stays static; 2–4 octaves give the classic sweep at the start of each note."),
		...F("Filter"),
		...w("filterEnvelope", "Filter envelope", "Filter ", "filter", {
			attack: .6,
			decay: .2,
			sustain: .5,
			release: 2
		}),
		...w("envelope", "Envelope", "", "amp", {
			attack: .005,
			decay: .1,
			sustain: .9,
			release: 1
		}),
		E("Envelope", "linear"),
		A(),
		k(),
		j()
	];
}
function z(e) {
	let t = `voice${e}.`, n = `Voice ${e + 1}`, r = `V${e + 1} `;
	return [
		...S(t, n, r, "sawtooth", {
			pulse: !0,
			fat: !1
		}),
		g(`${t}filterEnvelope.baseFrequency`, `${r}Cutoff`, n, {
			min: 20,
			max: 2e4,
			default: 200,
			curve: "log",
			unit: "Hz"
		}, I, L),
		...w(`${t}envelope`, n, r, "amp", {
			attack: .01,
			decay: .01,
			sustain: 1,
			release: .5
		})
	];
}
function B() {
	return [
		g("harmonicity", "Interval", "Voices", {
			min: .25,
			max: 8,
			default: 1.5,
			curve: "log",
			step: .01,
			unit: "×"
		}, "The pitch ratio of the second voice to the first; 1.5 puts voice 2 a perfect fifth above voice 1.", "At 1 the voices double in unison, 2 adds an octave, and 1.5 gives a hollow power-chord fifth."),
		E("Voices", "linear"),
		g("vibratoAmount", "Vibrato depth", "Vibrato", {
			min: 0,
			max: 1,
			default: .5,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How deep the built-in pitch wobble is.", "Small amounts add a gentle, singer-like waver; large amounts sound seasick."),
		g("vibratoRate", "Vibrato rate", "Vibrato", {
			min: .1,
			max: 20,
			default: 5,
			curve: "log",
			step: .1,
			unit: "Hz"
		}, "How fast the built-in pitch wobble cycles, in wobbles per second.", "Around 5–6 Hz feels like a singer or violinist; slower rates drift and faster ones flutter."),
		...z(0),
		...z(1),
		...F("Filter"),
		A(),
		k(),
		j()
	];
}
function ee() {
	return [
		...S("", "Oscillator", "", "sine", {
			pulse: !1,
			fat: !1
		}),
		g("pitchDecay", "Pitch drop", "Pitch", {
			min: .001,
			max: .5,
			default: .05,
			curve: "log",
			unit: "s"
		}, "How long the pitch takes to fall from its high starting point down to the played note.", "Very short values give a tight, clicky kick; longer ones give the falling boom of a tom or a zappy laser."),
		g("octaves", "Drop range", "Pitch", {
			min: 1,
			max: 16,
			default: 10,
			curve: "linear",
			step: .1,
			unit: "×"
		}, "How many times higher than the played note the pitch starts before it drops: 2× is one octave up, 8× is three.", "Small values give a soft, round thump; large values add a sharp, punchy click to the front of each hit."),
		...w("envelope", "Envelope", "", "amp", {
			attack: .001,
			decay: .4,
			sustain: .01,
			release: 1.4
		}),
		E("Envelope", "exponential"),
		A(),
		k()
	];
}
function te() {
	return [
		g("harmonicity", "Pitch ratio", "Tone", {
			min: .5,
			max: 20,
			default: 5.1,
			curve: "log",
			step: .01,
			unit: "×"
		}, "The ratio between the pitches of the stacked oscillators that build the metallic tone.", "Changing it moves the hit between cymbal, cowbell, and gong colors; 5.1 is a classic hi-hat."),
		g("modulationIndex", "Density", "Tone", {
			min: 1,
			max: 100,
			default: 32,
			curve: "log",
			step: .1,
			unit: ""
		}, "How much the stacked oscillators bend each other, which sets how dense the overtones are.", "Low values sound like a tuned bell or cowbell; high values dissolve into a dense, hissy cymbal wash."),
		g("resonance", "Brightness", "Tone", {
			min: 200,
			max: 7e3,
			default: 4e3,
			curve: "log",
			unit: "Hz"
		}, "The lowest frequency the built-in high-pass filter lets through, which sets the floor of the hit.", "Low values add body and clang; high values leave only the thin sizzle at the top of a hi-hat."),
		g("octaves", "Filter sweep", "Tone", {
			min: 0,
			max: 4,
			default: 1.5,
			curve: "linear",
			step: .1,
			unit: "oct"
		}, "How far, in octaves, the filter opens above the brightness setting during each hit.", "Higher values make each hit sweep brighter and splashier; with brightness already high, a big sweep thins the hit to almost nothing."),
		...w("envelope", "Envelope", "", "amp", {
			attack: .001,
			decay: 1.4,
			sustain: 0,
			release: .2
		}),
		E("Envelope", "linear"),
		A(),
		k()
	];
}
function ne() {
	let e = g("resonance", "Sustain", "String", {
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
	let t = g("ringTime", "Ring time", "String", {
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
	let n = _("stringDecay", "String decay", "String", [{
		value: "sustain",
		label: "Sustain (fixed loop)"
	}, {
		value: "ring",
		label: "Ring time"
	}], "sustain", "How the string’s ring is set: Sustain keeps the same loop strength on every note, so high notes die faster; Ring time sets one length in seconds for all of them.", "Sustain is the classic sound of older patches; Ring time lets high notes sing as long as low ones.");
	n.perNote = !0;
	let r = _("tuning", "IN TUNE", "Pitch", [{
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
	let i = g("velocity", "Velocity", "String", {
		min: 0,
		max: 1,
		default: 0,
		curve: "linear",
		step: .01,
		unit: ""
	}, "How much harder playing makes the pluck louder; at 0 every note plays at full level.", "Raise it for fingerpicked parts with soft and loud notes; leave it at 0 for an even, machine-like strum.");
	i.perNote = !0;
	let a = {
		...k(),
		perNote: !0
	}, o = A();
	return [
		g("attackNoise", "Pick noise", "String", {
			min: .1,
			max: 20,
			default: 1,
			curve: "log",
			step: .1,
			unit: "cycles"
		}, "How long the burst of noise that sets the virtual string moving lasts, measured in cycles of the played note.", "Low values give a soft, rounded fingertip pluck; high values add a scratchy pick attack, like a harpsichord quill."),
		g("dampening", "Damping", "String", {
			min: 200,
			max: 7e3,
			default: 4e3,
			curve: "log",
			unit: "Hz"
		}, "The cutoff of the filter inside the virtual string, which sets how quickly its high overtones die away.", "Low values sound like a muted or nylon-string pluck; high values ring like bright steel strings."),
		n,
		e,
		t,
		g("release", "Release", "String", {
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
function re() {
	return [
		_("noise.type", "Noise color", "Noise", [
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
		...w("envelope", "Envelope", "", "amp", {
			attack: .005,
			decay: .1,
			sustain: 0,
			release: .3
		}),
		E("Envelope", "linear")
	];
}
var ie = [
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
function ae() {
	let e = _("vowelA", "Vowel", "Syllable", ie, "o", "The vowel each note sings in plain vowel mode, and where its glide starts.", "Ah and oh sound open and warm, ee and oo sound closed and small; eh sits in between."), t = _("vowelB", "Glide-to vowel", "Syllable", ie, "u", "The vowel a held note drifts toward in plain vowel mode.", "Oh gliding to oo gives a rounded “ohw”; ah gliding to ee gives a bright “eye”.");
	e.visibleWhen = {
		path: "syllableMode",
		equals: ["vowel"]
	}, t.visibleWhen = {
		path: "syllableMode",
		equals: ["vowel"]
	};
	let n = Object.entries(a).map(([e, t]) => ({
		value: e,
		label: t.label
	}));
	return [
		_("syllableMode", "Syllables", "Syllable", [
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
			...Object.keys(i).map((e) => ({
				value: e,
				label: `Always "${e}"`
			}))
		], "cycle", "Which bit of gibberish each note sings: the set in order, a seeded pick from the set, a plain vowel, or one fixed syllable.", "Cycle gives the steady nah-me-oh-now-queh patter; Random sounds more like real chatter, and a fixed syllable is the most robotic."),
		_("syllableSet", "Syllable set", "Syllable", n, "kk", "The pool of sounds that Cycle and Random draw from, so a cat can meow and a choir can sing “ah”.", "Each set changes the consonants and vowels at once; try Babble for villager chatter or Choir for soft open vowels."),
		g("seed", "Lyric seed", "Syllable", {
			min: 1,
			max: 999,
			default: 7,
			curve: "linear",
			step: 1,
			unit: ""
		}, "Picks the made-up lyrics Random mode and Randomness choose. The same seed sings the same words on the same notes every time.", "Step through seeds on a phrase until the gibberish lands; the game sings it the same way. Live notes follow the order you play them."),
		e,
		t,
		g("morph", "Vowel glide", "Syllable", {
			min: 0,
			max: 1,
			default: .6,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How far each held note slides from its first vowel toward its second, the slur that turns “nah” into “now”.", "At 0 every vowel holds still and sounds sung; near 1 notes bend into diphthongs that sound more like words."),
		g("morphTime", "Glide time", "Syllable", {
			min: .05,
			max: 1.5,
			default: .35,
			curve: "log",
			unit: "s"
		}, "How long that vowel slide takes once the note has landed.", "Short glides sound chatty and quick; long ones give a lazy, drawn-out croon."),
		g("consonant", "Consonants", "Syllable", {
			min: 0,
			max: 1,
			default: .7,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How strongly the n, m, k, s, and other sounds at the start of each syllable come through.", "Low values blur the syllables into humming vowels; high values make every note pop like a spoken word."),
		g("randomness", "Randomness", "Syllable", {
			min: 0,
			max: 1,
			default: .35,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How much each note wanders: a fixed syllable sometimes swaps, and pitch and vowel color shift a little per note.", "A touch keeps a phrase from sounding like a machine; a lot sounds tipsy and off-key."),
		g("voiceMix", "Bass to tenor", "Voice", {
			min: 0,
			max: 1,
			default: .35,
			curve: "linear",
			step: .01,
			unit: ""
		}, "Blends between a bass singer’s vowel shapes and a tenor’s.", "Toward bass the vowels turn low and woolly; toward tenor they get lighter and clearer."),
		g("formantShift", "Voice size", "Voice", {
			min: .7,
			max: 1.5,
			default: 1,
			curve: "log",
			step: .01,
			unit: "×"
		}, "Scales the size of the throat the voice comes from without changing the note: under 1 is a bigger body, over 1 a smaller one.", "Push it up for chipmunk Animalese and tiny villagers; pull it down for giants, frogs, and whales."),
		g("bandwidth", "Vowel sharpness", "Voice", {
			min: .5,
			max: 3,
			default: 1.2,
			curve: "log",
			step: .01,
			unit: "×"
		}, "How wide each vowel resonance is: low values are narrow and focused, high values broad and blurred.", "Low settings sound crisp and robotic; high ones sound soft and mumbly, as if singing through a smile."),
		_("source", "Source wave", "Voice", [{
			value: "glottal",
			label: "Glottal (soft)"
		}, {
			value: "saw",
			label: "Sawtooth (buzzy)"
		}], "glottal", "The raw buzz the vowels are carved from, before any shaping.", "Glottal is round and gentle like a real throat; sawtooth is buzzier and cuts through a busy mix."),
		g("brightness", "Brightness", "Voice", {
			min: 600,
			max: 9e3,
			default: 3200,
			curve: "log",
			unit: "Hz"
		}, "A low-pass on the raw buzz that opens or darkens it before the vowels shape it.", "Low values sound hooded and far away, like an owl; high values add a forward, nasal edge."),
		g("breath", "Breathiness", "Voice", {
			min: 0,
			max: 1,
			default: .18,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How much airy hiss is mixed in through the vowels, with the buzz backing off as it rises.", "A little makes the voice intimate; near 1 it turns into a whisper with only a ghost of pitch."),
		g("roughness", "Roughness", "Voice", {
			min: 0,
			max: 1,
			default: 0,
			curve: "linear",
			step: .01,
			unit: ""
		}, "Chops the voice in fast pulses, the way a creaky or growling throat does.", "Low values give a sleepy vocal fry; high values become a growl, a bark, or a frog’s croak. At 0 it costs nothing."),
		A(),
		k(),
		g("portamento", "Glide", "Pitch", {
			min: 0,
			max: .4,
			default: .06,
			curve: "linear",
			step: .005,
			unit: "s"
		}, "How long the pitch slides from the previous note when Scoop is off; it also sets how fast a scoop swoops.", "Small values add a vocal slur between notes; longer ones sound like a lazy, sliding crooner."),
		g("scoop", "Scoop", "Pitch", {
			min: 0,
			max: 300,
			default: 40,
			curve: "linear",
			step: 1,
			unit: "cents"
		}, "Starts every note this far flat and swoops up to pitch; 100 cents is one semitone.", "A little is the crooner’s signature; a lot sounds like a meow, a yodel flip, or a whale."),
		g("pitchDrop", "Fall on release", "Pitch", {
			min: 0,
			max: 1200,
			default: 0,
			curve: "linear",
			step: 1,
			unit: "cents"
		}, "How far the pitch sags while a note fades out after you let go.", "Pair it with a longer release to hear it: a few hundred cents gives a meow’s droop or the end of a bark."),
		g("vibDepth", "Vibrato depth", "Vibrato", {
			min: 0,
			max: 100,
			default: 28,
			curve: "linear",
			step: 1,
			unit: "cents"
		}, "How wide the singer’s pitch wobble is, in cents.", "Around 20–40 sounds like a natural singer; wider sounds operatic, then shaky like a goat."),
		g("vibRate", "Vibrato rate", "Vibrato", {
			min: 2,
			max: 9,
			default: 5.2,
			curve: "linear",
			step: .1,
			unit: "Hz"
		}, "How many times per second the pitch wobbles.", "About 5–6 sounds like a singer; slower drifts dreamily, faster flutters like a bird."),
		g("vibDelay", "Vibrato delay", "Vibrato", {
			min: 0,
			max: 1.2,
			default: .3,
			curve: "linear",
			step: .01,
			unit: "s"
		}, "How long a held note stays straight before the wobble fades in.", "Short notes stay clean while long ones bloom, the way trained singers do; at 0 every note wobbles at once."),
		g("envelope.attack", "Attack", "Envelope", {
			min: .002,
			max: 2,
			default: .03,
			curve: "log",
			unit: "s"
		}, "How long the voice takes to swell in on each syllable: after the burst of a k, t, or s, and through the hum of an n or m.", "Short attacks spit syllables out like chatter; long ones make a soft, swelling choir."),
		g("envelope.release", "Release", "Envelope", {
			min: .01,
			max: 4,
			default: .25,
			curve: "log",
			unit: "s"
		}, "How long the voice takes to fade after you let go, and how long any fall on release lasts.", "Short releases clip words off neatly; long ones let each note sigh away.")
	];
}
var oe = {
	Synth: N(),
	AMSynth: P(!1),
	FMSynth: P(!0),
	MonoSynth: R(),
	DuoSynth: B(),
	MembraneSynth: ee(),
	MetalSynth: te(),
	PluckSynth: ne(),
	NoiseSynth: re(),
	FormantVoice: ae()
}, V = {
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
for (let e of m) for (let t of oe[e]) Object.hasOwn(V[e], t.path) && (t.modulatable = !0);
function se(e, t) {
	return Object.hasOwn(V[e], t) ? V[e][t] : void 0;
}
function ce(e, t) {
	let { min: n, max: r } = e;
	if (!(r > n)) return 0;
	let i = Math.min(r, Math.max(n, t)), a = e.curve === "log" && n > 0 ? Math.log(i / n) / Math.log(r / n) : (i - n) / (r - n);
	return Number.isFinite(a) ? a : 0;
}
function le(e, t) {
	let { min: n, max: r } = e, i = Math.min(1, Math.max(0, Number.isFinite(t) ? t : 0));
	return e.curve === "log" && n > 0 ? n * (r / n) ** i : n + (r - n) * i;
}
function ue(e, t) {
	return oe[e].find((e) => e.path === t);
}
function de(e) {
	let t = {};
	for (let n of oe[e]) t[n.path] = n.default;
	return t;
}
function H(e, t) {
	if (e.kind === "choice") return typeof t == "string" && e.choices.some((e) => e.value === t) ? t : void 0;
	if (typeof t != "number" || !Number.isFinite(t)) return;
	let n = Math.min(e.max, Math.max(e.min, t));
	return e.step === 1 && (n = Math.round(n)), n;
}
function fe(e, t) {
	return pe(oe[e], t);
}
function pe(e, t) {
	let n = typeof t == "object" && t ? t : {}, r = {};
	for (let t of e) {
		let e = Object.prototype.hasOwnProperty.call(n, t.path);
		r[t.path] = (e ? H(t, n[t.path]) : void 0) ?? t.default;
	}
	return r;
}
function U(e, t, n) {
	let r = e.visibleWhen;
	if (!r) return !0;
	let i = t[r.path] ?? ue(n, r.path)?.default;
	return typeof i == "string" && r.equals.includes(i);
}
var me = /* @__PURE__ */ new Set([
	"__proto__",
	"prototype",
	"constructor"
]);
function he(e, t, n) {
	let r = t.split(".");
	if (r.some((e) => e === "" || me.has(e))) throw Error(`Invalid param path "${t}"`);
	let i = e;
	for (let e = 0; e < r.length - 1; e++) {
		let t = i[r[e]];
		(typeof t != "object" || !t) && (i[r[e]] = {}), i = i[r[e]];
	}
	i[r[r.length - 1]] = n;
}
function ge(e, t) {
	let n = {};
	for (let r of oe[e]) U(r, t, e) && O(n, e, r, t[r.path] ?? r.default);
	return n;
}
function _e(e, t, n) {
	let r = {};
	for (let i of oe[e]) i.path !== n && i.visibleWhen?.path !== n || !U(i, t, e) || O(r, e, i, t[i.path] ?? i.default);
	return r;
}
var ve = [
	"filter",
	"distortion",
	"bitcrusher",
	"chorus",
	"phaser",
	"tremolo",
	"eq",
	"compressor"
];
function ye(e) {
	return typeof e == "string" && ve.includes(e);
}
var be = [
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
], xe = be.map(({ value: e, label: t }) => ({
	value: e,
	label: t
}));
function Se(e) {
	return be.find((t) => t.value === e)?.quarters ?? null;
}
function Ce(e, t) {
	let n = Se(e) ?? 1;
	return 60 / (Number.isFinite(t) && t > 0 ? t : 120) * n;
}
var we = () => {
	let e = g("wet", "Mix", "Mix", {
		min: 0,
		max: 1,
		default: 1,
		curve: "linear",
		step: .01,
		unit: ""
	}, "How much of the effected sound is heard against the dry sound going in.", "At 1 you hear only the pedal; lower values blend the untouched sound back in.");
	return e.modulatable = !0, e;
}, W = (e) => (e.modulatable = !0, e), Te = (e) => (e.rebuild = !0, e), Ee = [
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
function De() {
	return [
		_("type", "Type", "Filter", [
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
		W(g("frequency", "Cutoff", "Filter", {
			min: 20,
			max: 2e4,
			default: 1200,
			curve: "log",
			unit: "Hz"
		}, "Where the filter starts to act on the whole instrument, after every layer is mixed.", "Sweep it slowly for the classic filter rise; an LFO on it gives a wah or a slow throb.")),
		W(g("Q", "Resonance", "Filter", {
			min: .1,
			max: 20,
			default: 1,
			curve: "log",
			step: .1,
			unit: ""
		}, "How much the filter emphasizes the frequencies right at the cutoff.", "Higher values add a vocal, whistling peak that sings as the cutoff moves; very high values squeal."))
	];
}
function Oe() {
	return [
		g("distortion", "Drive", "Distortion", {
			min: 0,
			max: 1,
			default: .4,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How hard the sound is pushed into the waveshaper that clips its peaks.", "Low values add a warm, gritty edge like a tube amp; high values turn into a buzzy fuzz pedal."),
		_("oversample", "Quality", "Distortion", [
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
		we()
	];
}
function ke() {
	return [g("bits", "Bits", "Bitcrusher", {
		min: 1,
		max: 16,
		default: 4,
		curve: "linear",
		step: 1,
		unit: "bits"
	}, "How many volume steps the sound is rounded to; each bit doubles the number of steps.", "Around 8 bits sounds like an old console sample; 3 or 4 bits turn into a fizzy, broken-speaker crunch."), we()];
}
function Ae() {
	return [
		W(g("frequency", "Rate", "Chorus", {
			min: .1,
			max: 20,
			default: 1.5,
			curve: "log",
			step: .01,
			unit: "Hz"
		}, "How fast the chorus sweeps its delayed copies, in sweeps per second.", "Slow rates shimmer gently like a twelve-string; fast ones wobble toward vibrato.")),
		g("delayTime", "Delay time", "Chorus", {
			min: 2,
			max: 20,
			default: 3.5,
			curve: "log",
			step: .1,
			unit: "ms"
		}, "How far behind the original the delayed copies sit before they sweep.", "Short delays give a tight shimmer; longer ones spread into a doubled, slightly detuned ensemble."),
		g("depth", "Depth", "Chorus", {
			min: 0,
			max: 1,
			default: .7,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How far the delayed copies sweep back and forth.", "Deeper settings make the pitch wobble more noticeably, from lush to seasick."),
		g("feedback", "Feedback", "Chorus", {
			min: 0,
			max: .9,
			default: 0,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How much of the chorus output is fed back into itself.", "A little adds a metallic, flanger-like edge; more makes it ring."),
		g("spread", "Width", "Chorus", {
			min: 0,
			max: 180,
			default: 180,
			curve: "linear",
			step: 1,
			unit: "°"
		}, "How far apart the left and right sweeps run, in degrees of their cycle.", "At 180 the two sides move opposite each other for a wide stereo image; at 0 the chorus sits in the middle."),
		we()
	];
}
function je() {
	return [
		W(g("frequency", "Rate", "Phaser", {
			min: .05,
			max: 20,
			default: .5,
			curve: "log",
			step: .01,
			unit: "Hz"
		}, "How fast the phaser sweeps its notches up and down, in sweeps per second.", "Slow rates give the swooshing jet sound; fast ones turn into a bubbly warble.")),
		g("octaves", "Range", "Phaser", {
			min: 0,
			max: 6,
			default: 3,
			curve: "linear",
			step: .1,
			unit: "oct"
		}, "How many octaves the notches sweep above their starting frequency.", "Small ranges are subtle and throaty; wide ranges sweep dramatically from dark to bright."),
		g("baseFrequency", "Base frequency", "Phaser", {
			min: 50,
			max: 2e3,
			default: 350,
			curve: "log",
			unit: "Hz"
		}, "The lowest point of the sweep.", "Low values make the sweep growl through the body of the sound; high values keep it up in the sizzle."),
		W(g("Q", "Resonance", "Phaser", {
			min: .1,
			max: 20,
			default: 10,
			curve: "log",
			step: .1,
			unit: ""
		}, "How sharp and pronounced the sweeping notches are.", "Higher values make the sweep whistle and stand out; lower values keep it soft.")),
		Te(g("stages", "Stages", "Phaser", {
			min: 1,
			max: 12,
			default: 10,
			curve: "linear",
			step: 1,
			unit: ""
		}, "How many filter stages build the effect; more stages carve more notches.", "Few stages sound gentle and vintage; many sound deep and dramatic, and cost more processing.")),
		we()
	];
}
function Me() {
	return [
		W(g("frequency", "Rate", "Tremolo", {
			min: .1,
			max: 40,
			default: 6,
			curve: "log",
			step: .01,
			unit: "Hz"
		}, "How fast the volume pulses, in pulses per second.", "Around 4–8 Hz is the classic surf-amp shimmer; faster rates flutter like a helicopter.")),
		W(g("depth", "Depth", "Tremolo", {
			min: 0,
			max: 1,
			default: .5,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How far the volume dips on each pulse.", "Low values add a gentle pulse; at 1 the sound chops all the way to silence.")),
		_("type", "Shape", "Tremolo", Ee, "sine", "The shape of each volume pulse.", "Sine is smooth and gentle; square chops hard like a gate, and sawtooth gives a pumping swell."),
		g("spread", "Width", "Tremolo", {
			min: 0,
			max: 180,
			default: 0,
			curve: "linear",
			step: 1,
			unit: "°"
		}, "How far apart the left and right pulses run, in degrees of their cycle.", "At 180 the sound bounces between the speakers like an auto-panner; at 0 both sides pulse together."),
		we()
	];
}
var Ne = (e, t, n, r) => W(g(e, t, "EQ", {
	min: -24,
	max: 12,
	default: 0,
	curve: "linear",
	step: .1,
	unit: "dB"
}, n, r));
function Pe() {
	return [
		Ne("low", "Low gain", "Boosts or cuts everything below the low split.", "Cut it to stop a lead muddying the bass; boost it for a fatter bottom end."),
		Ne("mid", "Mid gain", "Boosts or cuts the band between the two splits, where most of a sound’s body lives.", "Cutting scoops the sound out like a metal guitar tone; boosting pushes it forward like a telephone."),
		Ne("high", "High gain", "Boosts or cuts everything above the high split.", "Boost for air and sparkle; cut to tame a harsh, fizzy top."),
		g("lowFrequency", "Low split", "EQ", {
			min: 40,
			max: 1e3,
			default: 400,
			curve: "log",
			unit: "Hz"
		}, "Where the low band ends and the mid band begins.", "Lower settings let the low knob touch only the deep bass; higher ones reach into the warmth."),
		g("highFrequency", "High split", "EQ", {
			min: 1e3,
			max: 1e4,
			default: 2500,
			curve: "log",
			unit: "Hz"
		}, "Where the mid band ends and the high band begins.", "Lower settings let the high knob shape the bite of the sound; higher ones touch only the sheen.")
	];
}
function Fe() {
	return [
		W(g("threshold", "Threshold", "Compressor", {
			min: -60,
			max: 0,
			default: -24,
			curve: "linear",
			step: .5,
			unit: "dB"
		}, "The level above which the compressor starts turning the sound down.", "Lower thresholds squash more of the sound, evening out loud and quiet notes.")),
		g("ratio", "Ratio", "Compressor", {
			min: 1,
			max: 20,
			default: 4,
			curve: "log",
			step: .1,
			unit: ":1"
		}, "How strongly sound above the threshold is turned down: at 4:1, every 4 dB over comes out as 1 dB over.", "Low ratios are gentle glue; high ratios flatten peaks like a limiter."),
		g("attack", "Attack", "Compressor", {
			min: .001,
			max: .5,
			default: .003,
			curve: "log",
			unit: "s"
		}, "How quickly the compressor clamps down once the sound crosses the threshold.", "Slower attacks let the click at the start of each note through, which makes plucks and drums punchier."),
		g("release", "Release", "Compressor", {
			min: .01,
			max: 1,
			default: .25,
			curve: "log",
			unit: "s"
		}, "How quickly the compressor lets go once the sound falls back under the threshold.", "Short releases pump and breathe audibly; long ones hold the level smooth."),
		g("knee", "Knee", "Compressor", {
			min: 0,
			max: 40,
			default: 30,
			curve: "linear",
			step: 1,
			unit: "dB"
		}, "How gradually compression fades in around the threshold.", "A hard knee (low) grabs abruptly; a soft knee (high) eases in and sounds more natural.")
	];
}
var Ie = {
	filter: De(),
	distortion: Oe(),
	bitcrusher: ke(),
	chorus: Ae(),
	phaser: je(),
	tremolo: Me(),
	eq: Pe(),
	compressor: Fe()
};
function Le(e) {
	return Ie[e];
}
function Re(e, t) {
	return Ie[e].find((e) => e.path === t);
}
var ze = [
	"reverb",
	"delay",
	"chorus"
], Be = {
	reverb: "Reverb",
	delay: "Delay",
	chorus: "Chorus"
};
function Ve(e) {
	return typeof e == "string" && ze.includes(e);
}
var He = {
	reverb: [g("decay", "Decay", "Reverb", {
		min: .2,
		max: 12,
		default: 2.5,
		curve: "log",
		step: .01,
		unit: "s"
	}, "How long the room keeps ringing after a sound stops. Changing it rebuilds the room, so expect a brief glitch.", "Short decays sound like a small room; long ones like a hall or a cave."), g("preDelay", "Pre-delay", "Reverb", {
		min: 0,
		max: .25,
		default: .02,
		curve: "linear",
		step: .001,
		unit: "s"
	}, "A short gap before the reverb starts, as if the walls were farther away.", "A little pre-delay keeps notes crisp in front of the reverb instead of smearing into it.")],
	delay: [_("division", "Time", "Delay", xe, "8n.", "The gap between echoes, locked to the song’s tempo.", "A dotted eighth gives the galloping echo of countless lead lines; a quarter note sounds like a canyon answering back."), g("feedback", "Feedback", "Delay", {
		min: 0,
		max: .9,
		default: .35,
		curve: "linear",
		step: .01,
		unit: ""
	}, "How much of each echo is fed back to make the next one.", "Low values give one or two repeats; high values keep echoing for a long time.")],
	chorus: [
		g("frequency", "Rate", "Chorus", {
			min: .1,
			max: 20,
			default: 1.5,
			curve: "log",
			step: .01,
			unit: "Hz"
		}, "How fast the chorus sweeps its delayed copies, in sweeps per second.", "Slow rates shimmer gently; fast ones wobble toward vibrato."),
		g("delayTime", "Delay time", "Chorus", {
			min: 2,
			max: 20,
			default: 3.5,
			curve: "log",
			step: .1,
			unit: "ms"
		}, "How far behind the original the delayed copies sit.", "Short delays give a tight shimmer; longer ones spread into a doubled ensemble."),
		g("depth", "Depth", "Chorus", {
			min: 0,
			max: 1,
			default: .7,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How far the delayed copies sweep back and forth.", "Deeper settings wobble the pitch more, from lush to seasick."),
		g("spread", "Width", "Chorus", {
			min: 0,
			max: 180,
			default: 180,
			curve: "linear",
			step: 1,
			unit: "°"
		}, "How far apart the left and right sweeps run.", "At 180 the chorus is as wide as it gets; at 0 it sits in the middle.")
	]
};
function Ue(e) {
	return He[e];
}
function We(e) {
	return pe(He[e], {});
}
function Ge(e, t) {
	return pe(He[e], t);
}
var Ke = [
	"sine",
	"triangle",
	"square",
	"sawtooth"
], G = {
	shape: _("shape", "Shape", "LFO", Ee, "sine", "The shape of the slow wave that turns the knobs it is connected to.", "Sine and triangle sweep smoothly back and forth; square flips between two settings, and sawtooth ramps up and snaps back."),
	division: _("division", "Rate", "LFO", xe, "1m", "One full sweep, as a note length at the song’s tempo.", "Longer divisions give slow evolving movement; short ones give rhythmic pulsing that stays in time with the song."),
	hz: g("hz", "Rate", "LFO", {
		min: .02,
		max: 20,
		default: 1,
		curve: "log",
		step: .01,
		unit: "Hz"
	}, "Sweeps per second, independent of the tempo.", "Below 1 Hz the movement drifts slowly; around 5 Hz it becomes vibrato or tremolo territory."),
	depth: g("depth", "Depth", "LFO", {
		min: 0,
		max: 1,
		default: .5,
		curve: "linear",
		step: .01,
		unit: ""
	}, "How far the LFO swings each connected knob, centered on its current setting.", "Small depths add subtle life; large ones swing the knob across most of its range."),
	connectionDepth: g("depth", "Amount", "LFO", {
		min: -1,
		max: 1,
		default: 1,
		curve: "linear",
		step: .01,
		unit: ""
	}, "How much of this LFO’s swing reaches this one knob, on top of the LFO’s overall Depth. Negative values invert it.", "Run two knobs at opposite amounts and one rises while the other falls.")
};
function qe(e, t) {
	return e.sync ? 1 / Ce(e.division, t) : Number.isFinite(e.hz) ? Math.min(G.hz.max, Math.max(G.hz.min, e.hz)) : G.hz.default;
}
var Je = {
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
function Ye(e, t) {
	return `layer:${e}:${t}`;
}
function Xe(e) {
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
function Ze(e, t) {
	let n = Xe(t);
	if (!n) return null;
	if (n.kind === "layer") {
		let t = e.layers[n.layer];
		if (!t) return null;
		if (n.path === "volume") return Je;
		let r = ue(t.voiceType, n.path);
		return r?.kind === "number" && se(t.voiceType, n.path) ? r : null;
	}
	let r = e.effects?.find((e) => e.id === n.effectId), i = r ? Re(r.type, n.path) : void 0;
	return i?.kind === "number" && i.modulatable ? i : null;
}
function Qe(e, t) {
	let n = Ze(e, t), r = Xe(t);
	if (!n || !r) return null;
	let i;
	if (r.kind === "layer") {
		let t = e.layers[r.layer];
		i = r.path === "volume" ? t.volume : t.params[r.path];
	} else i = e.effects.find((e) => e.id === r.effectId).params[r.path];
	return typeof i == "number" && Number.isFinite(i) ? i : n.default;
}
function $e(e, t, n) {
	let r = ce(e, t), i = Math.min(1, Math.abs(Number.isFinite(n) ? n : 0)) / 2, a = le(e, r - i), o = le(e, r + i);
	return n < 0 ? [o, a] : [a, o];
}
var K = (e, t) => Object.hasOwn(e, t) ? e[t] : void 0;
function et(e) {
	if (typeof e != "string") return null;
	let t = e.trim();
	return t.length > 0 && t.length <= 64 && !t.includes(":") && ![
		"__proto__",
		"prototype",
		"constructor"
	].includes(t) ? t : null;
}
var tt = (e, t, n, r) => typeof e == "number" && Number.isFinite(e) ? Math.min(n, Math.max(t, e)) : r;
function nt(e) {
	if (typeof e != "object" || !e || Array.isArray(e)) return null;
	let t = e, n = et(K(t, "id")), r = K(t, "type");
	return n === null || !ye(r) ? null : {
		id: n,
		type: r,
		bypass: K(t, "bypass") === !0,
		params: pe(Ie[r], K(t, "params"))
	};
}
function rt(e, t) {
	if (typeof e != "object" || !e || Array.isArray(e)) return null;
	let n = e, r = et(K(n, "id"));
	if (r === null) return null;
	let i = K(n, "shape"), a = K(n, "division"), o = [], s = K(n, "connections");
	if (Array.isArray(s)) for (let e of s.slice(0, 64)) {
		if (o.length >= 16) break;
		if (typeof e != "object" || !e) continue;
		let n = K(e, "target");
		typeof n == "string" && t(n) && !o.some((e) => e.target === n) && o.push({
			target: n,
			depth: tt(K(e, "depth"), -1, 1, 1)
		});
	}
	return {
		id: r,
		shape: Ke.includes(i) ? i : "sine",
		sync: K(n, "sync") !== !1,
		division: typeof a == "string" && Se(a) !== null ? a : G.division.default,
		hz: tt(K(n, "hz"), G.hz.min, G.hz.max, G.hz.default),
		depth: tt(K(n, "depth"), 0, 1, G.depth.default),
		connections: o
	};
}
function it(e) {
	let t = [];
	if (!Array.isArray(e)) return t;
	for (let n of e.slice(0, 24)) {
		if (t.length >= 6) break;
		let e = nt(n);
		e && !t.some((t) => t.id === e.id) && t.push(e);
	}
	return t;
}
function at(e, t) {
	let n = [];
	if (!Array.isArray(e)) return n;
	let r = /* @__PURE__ */ new Set(), i = (e) => !r.has(e) && Ze(t, e) !== null;
	for (let t of e.slice(0, 12)) {
		if (n.length >= 3) break;
		let e = rt(t, i);
		if (e && !n.some((t) => t.id === e.id)) {
			for (let t of e.connections) r.add(t.target);
			n.push(e);
		}
	}
	return n;
}
//#endregion
//#region src/engine/formant-voice.ts
function ot() {
	let { "envelope.attack": e, "envelope.release": t, ...n } = de("FormantVoice");
	return st({
		...n,
		attack: e,
		release: t
	}, {});
}
function st(e, t) {
	let n = { ...e }, r = n;
	for (let [e, i] of Object.entries(t)) if (e === "envelope" && typeof i == "object" && i) {
		let e = i;
		typeof e.attack == "number" && (n.attack = e.attack), typeof e.release == "number" && (n.release = e.release);
	} else Object.hasOwn(r, e) && typeof i == typeof r[e] && (r[e] = i);
	return n;
}
var ct = .35, lt = .47, ut = 1.6, dt = .12, ft = 6e3, pt = .006, mt = .05, ht = Array.from({ length: 40 }, (e, t) => 1 / (t + 1) ** 1.6);
function gt(e) {
	return 1200 * Math.log2(Math.min(2, Math.max(.5, e * 2)));
}
var _t = class {
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
		this.Tone = e, this.p = st(ot(), t);
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
		this.puff = r(new e.Gain(ct)), this.breathSig.connect(o.gain), a.connect(o), o.connect(this.puff), this.puff.connect(i);
		let s = r(new e.Gain(-.5));
		this.breathSig.connect(s), s.connect(this.srcGain.gain), this.amp = r(new e.Gain(0)), this.env = r(new e.Gain(0)), this.shiftSig = r(new e.Signal(n.formantShift));
		let c = r(new e.Gain(.5)), l = r(new e.WaveShaper(gt, 1024));
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
		let t = st(this.p, e), n = this.p;
		return this.p = t, t.brightness !== n.brightness && this.tilt.frequency.rampTo(t.brightness, .05), t.breath !== n.breath && this.breathSig.rampTo(t.breath, .05), t.formantShift !== n.formantShift && this.shiftSig.rampTo(t.formantShift, .05), t.vibRate !== n.vibRate && this.vibLfo.frequency.rampTo(t.vibRate, .05), t.detune !== n.detune && this.osc.detune.rampTo(t.detune, .05), this.applySource(), this.applyRoughness(), this;
	}
	applySource() {
		let e = this.p.source === "saw" ? "saw" : "glottal";
		e !== this.source && (this.source = e, e === "saw" ? this.osc.type = "sawtooth" : this.osc.partials = ht);
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
	sing(e, t, n, i) {
		this.wake(t);
		let a = this.p, o = c(a.seed, i.key ?? i.index, i.midi), { syllable: s, manual: l } = u({
			mode: a.syllableMode,
			set: a.syllableSet,
			vowelA: a.vowelA,
			vowelB: a.vowelB,
			randomness: a.randomness
		}, i.index, o, i.syllable), f = e * 2 ** ((o() - .5) * 2 * a.randomness * 25 / 1200), m = 1 + (o() - .5) * .1 * a.randomness, h = a.formantShift * m, g = p(s.a, a.voiceMix, m), _ = p(s.b, a.voiceMix, m), v = g.map((e, t) => e.map((e, n) => e + (_[t][n] - e) * a.morph)), y = a.consonant, b = !l && y > .02 && s.c ? r[s.c] ?? null : null, x = null, S = null;
		if (b?.vowel) {
			let e = p(b.vowel, a.voiceMix, m);
			x = e.map((e) => e[0]), S = e.map((e) => e[1]);
		} else b?.locus && (x = b.locus.map((e) => e * m), S = b.lg ? b.lg.map(d) : g.map((e) => e[1]));
		let C = b ? Math.max(.015, b.trans * (.4 + .6 * y)) : 0, w = b?.vot ?? 0, T = t + .004 + w, E = T + C, D = E + .1, O = D + a.morphTime, k = this.osc.frequency;
		k.cancelAndHoldAtTime(t);
		let A = k.getValueAtTime(t), j = typeof A == "number" && Number.isFinite(A) ? A : 0, M = f;
		a.scoop > 0 ? M = f * 2 ** (-a.scoop / 1200) : a.portamento > 0 && this.lastHz > 0 && (M = j > 0 ? j : this.lastHz), k.setValueAtTime(M, t), M !== f && k.exponentialRampToValueAtTime(f, t + Math.max(.02, a.portamento)), this.lastHz = f, this.curHz = f;
		let N = this.vibDepth.gain;
		N.cancelAndHoldAtTime(t), N.setValueAtTime(0, t), N.setValueAtTime(0, t + a.vibDelay), N.linearRampToValueAtTime(a.vibDepth, t + a.vibDelay + .3), this.formants.forEach((e, n) => {
			let [r, i, o] = g[n], s = Math.max(1, r * a.formantShift / (o * a.bandwidth)), c = e.filter.frequency, l = e.gain.gain;
			e.filter.Q.cancelAndHoldAtTime(t), e.filter.Q.setValueAtTime(s, t), c.cancelAndHoldAtTime(t), l.cancelAndHoldAtTime(t), c.setValueAtTime(x ? x[n] : r, t), l.setValueAtTime((S ? S[n] : i) * ut, t), c.linearRampToValueAtTime(r, E), l.linearRampToValueAtTime(i * ut, E), a.morph > .01 && (c.setValueAtTime(r, D), c.linearRampToValueAtTime(v[n][0], O), l.setValueAtTime(i * ut, D), l.linearRampToValueAtTime(v[n][1] * ut, O));
		});
		let P = this.amp.gain;
		if (P.cancelAndHoldAtTime(t), P.linearRampToValueAtTime(0, t + .004), b?.kind === "nasal") {
			let e = t + .004 + Math.max(.016, a.attack);
			P.linearRampToValueAtTime(1 - .65 * y, e), P.linearRampToValueAtTime(1, Math.max(E, e + .01));
		} else P.setValueAtTime(0, T), P.linearRampToValueAtTime(1, T + Math.max(.004, a.attack));
		let F = this.env.gain;
		F.cancelAndHoldAtTime(t), F.linearRampToValueAtTime(.5 + .5 * n, t + .005);
		let I = this.puff.gain;
		I.cancelAndHoldAtTime(t), I.setValueAtTime(lt, t), I.linearRampToValueAtTime(ct, t + .15);
		let L = this.cGain.gain;
		if (L.cancelAndHoldAtTime(t), L.linearRampToValueAtTime(0, t + pt), b?.burst) {
			let [e, n, r] = b.burst, i = t + r + w, a = Math.min(ft, e * Math.sqrt(h));
			this.cFilter.frequency.cancelAndHoldAtTime(t), this.cFilter.Q.cancelAndHoldAtTime(t), this.cFilter.frequency.linearRampToValueAtTime(a, t + pt), this.cFilter.Q.linearRampToValueAtTime(n, t + pt), L.linearRampToValueAtTime(dt * y, t + pt * 2), L.exponentialRampToValueAtTime(1e-4, Math.max(i, t + pt * 3)), L.linearRampToValueAtTime(0, Math.max(i, t + pt * 3) + pt);
		}
	}
	release(e) {
		let t = this.p, n = this.env.gain;
		if (n.cancelAndHoldAtTime(e), n.linearRampToValueAtTime(0, e + t.release), t.pitchDrop > 0 && this.curHz > 0) {
			let n = this.osc.frequency;
			n.cancelAndHoldAtTime(e), n.exponentialRampToValueAtTime(this.curHz * 2 ** (-t.pitchDrop / 1200), e + t.release);
		}
		let r = this.cGain.gain;
		r.cancelAndHoldAtTime(e), r.linearRampToValueAtTime(0, e + pt), this.sleepAfter(e + Math.max(t.release, pt) + mt);
	}
	dispose() {
		this.cancelSleep(), this.rough &&= (this.rough.lfo.dispose(), this.rough.gain.dispose(), null);
		for (let e of this.nodes) e.dispose();
		this.nodes.length = 0;
	}
};
function vt(e) {
	return !!e?.kit && Array.isArray(e.kit.pads);
}
function yt(e) {
	return e.layers.slice(0, vt(e) ? 48 : 3);
}
function bt(e, t) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(127, Math.max(0, Math.round(e))) : t;
}
function xt(e, t, n, r = () => !0) {
	let i = typeof e == "object" && e && !Array.isArray(e) ? e : {}, a = bt(Object.hasOwn(i, "note") ? i.note : void 0, t), o = Object.hasOwn(i, "name") ? i.name : void 0, s = typeof o == "string" && o.replace(/[\u0000-\u001f\u007f]/g, " ").trim() ? o.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 24) : kt(a), c = Object.hasOwn(i, "layers") ? i.layers : void 0, l = Array.isArray(c) ? [...new Set(c.filter((e) => typeof e == "number" && Number.isInteger(e) && e >= 0 && r(e)))].slice(0, 3) : [n].filter(r), u = {
		name: s,
		note: a,
		pitch: bt(Object.hasOwn(i, "pitch") ? i.pitch : void 0, a),
		layers: l
	}, d = Object.hasOwn(i, "choke") ? i.choke : void 0;
	return typeof d == "number" && Number.isInteger(d) && d >= 1 && d <= 8 && (u.choke = d), u;
}
function St(e, t) {
	if (!Array.isArray(e)) return null;
	let n = Math.min(t.length, 48), r = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set(), a = [];
	for (let t = 0; t < Math.min(e.length, 16); t++) {
		let o = xt(e[t], 36 + t, t, (e) => e < n && !r.has(e));
		if (o.layers.length !== 0) {
			for (let e of o.layers) r.add(e);
			i.has(o.note) && (o.note = wt(o.note, i)), i.add(o.note), a.push(o);
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
function Ct(e, t) {
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
		let t = At(o, e);
		t !== null && r.set(e, a[t].i);
	}
	return {
		padByNote: r,
		padLayers: n,
		chokes: e.map((t, n) => t.choke ? e.flatMap((e, r) => r !== n && e.choke === t.choke ? [r] : []) : []),
		chokeable: i
	};
}
function wt(e, t) {
	for (let n = 0; n < 128; n++) {
		if (e + n <= 127 && !t.has(e + n)) return e + n;
		if (e - n >= 0 && !t.has(e - n)) return e - n;
	}
	return e;
}
var Tt = {
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
}, Et = 39;
function Dt(e) {
	return Tt[e] ?? "perc";
}
var Ot = {
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
function kt(e) {
	return Ot[e] ?? `Pad ${e}`;
}
function At(e, t) {
	if (e.length === 0) return null;
	let n = e.findIndex((e) => e.note === t);
	if (n >= 0) return n;
	let r = Dt(t), i = (e) => e === Et ? "clap" : Dt(e), a = (n) => {
		let r = null;
		return e.forEach((i, a) => {
			n(i) && (r === null || Math.abs(i.note - t) < Math.abs(e[r].note - t)) && (r = a);
		}), r;
	};
	return a((e) => i(e.note) === i(t)) ?? a((e) => Dt(e.note) === r) ?? a(() => !0);
}
//#endregion
//#region src/engine/note-math.ts
var jt = 440 * 2 ** (-9 / 12);
function Mt(e, t, n) {
	let r = e[t];
	return typeof r == "number" && Number.isFinite(r) ? r : n;
}
function Nt(e) {
	return 2 ** (Math.round(Mt(e, "transpose", 0)) / 12);
}
var Pt = {
	track: 1,
	amount: 1
};
function Ft(e, t, n) {
	let r = Mt(e, "keyTrack", 0), i = Mt(e, "velocityToFilter", 0);
	return {
		track: r === 0 || !(t > 0) ? 1 : (t / jt) ** r,
		amount: 1 - i + i * n
	};
}
function It(e, t, n, r) {
	let i = t * 2 ** (Mt(e, "detune", 0) / 1200);
	e.tuning === "exact" && r > 0 && i > 0 && (i = r / (Math.max(1, Math.round(r / i)) - .5));
	let a = Mt(e, "ringTime", 0), o = Mt(e, "velocity", 0);
	return {
		hz: i,
		feedback: e.stringDecay === "ring" && a > 0 && i > 0 ? 10 ** (-3 / (i * a)) : null,
		level: 1 - o + o * n
	};
}
function Lt(e) {
	return 440 * 2 ** ((e - 69) / 12);
}
function Rt(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(16, Math.max(1, Math.round(e))) : 1;
}
function zt(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(6, Math.max(-60, e)) : 0;
}
var Bt = (e) => typeof e == "object" && !!e && typeof e.setValueAtTime == "function";
function Vt(e) {
	let t = e?._scale, n = t?._add?.addend, r = t?._mult?.factor;
	return Bt(n) && Bt(r) ? [n, r] : null;
}
var Ht = {
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
}, Ut = (e, t, n) => {
	let r = e[t];
	return typeof r == "number" && Number.isFinite(r) ? r : n;
};
function Wt(e, t) {
	try {
		e.set(t);
	} catch (t) {
		throw e.dispose(), t;
	}
}
var Gt = .004;
function Kt(e, t, n, r) {
	let i = -Infinity, a = (t) => (i = Math.max(t ?? e.immediate(), i + Gt), i), o = (t) => Math.max(t ?? e.immediate(), i);
	if (t === "FormantVoice") {
		let t = new _t(e, n);
		return {
			attack: (e, n, r, i) => t.sing(e, a(n), r, i),
			release: (e) => t.release(o(e)),
			startsAfter: (e) => i > e,
			node: t
		};
	}
	if (t === "NoiseSynth") {
		let t = new e.NoiseSynth();
		return Wt(t, n), {
			attack: (e, n, r) => void t.triggerAttack(a(n), r),
			release: (e) => void t.triggerRelease(o(e)),
			startsAfter: (e) => i > e,
			node: t
		};
	}
	let s = e[t], c = new s();
	Wt(c, n);
	let l = {
		attackTime: a,
		releaseTime: o,
		lastAttack: () => i,
		immediate: () => e.immediate()
	};
	if (t === "PluckSynth") return qt(c, l, r);
	let u = Ht[t];
	return u ? Jt(c, u, l, r) : {
		attack: (e, t, n) => void c.triggerAttack(e, a(t), n),
		release: (e) => void c.triggerRelease(o(e)),
		startsAfter: (e) => i > e,
		node: c
	};
}
function qt(e, t, n) {
	let r = e, i = !1;
	return {
		attack(a, o, s) {
			let c = t.attackTime(o), l = n(), u = It(l, a, s, r.context?.sampleRate ?? 0);
			r.resonance = u.feedback ?? Ut(l, "resonance", .7), (u.level !== 1 || i) && Bt(r.volume) && (r.volume.setValueAtTime(20 * Math.log10(u.level), c), i = u.level !== 1), e.triggerAttack(u.hz, c, s);
		},
		release: (n) => void e.triggerRelease(t.releaseTime(n)),
		startsAfter: (e) => t.lastAttack() > e,
		node: e
	};
}
function Jt(e, t, n, r) {
	let i = Pt, a = !1, o = (n) => {
		let a = r();
		for (let r of t) {
			let t = Vt(Zt(e, r.path));
			if (!t) continue;
			let o = Ut(a, r.base, 200) * i.track, s = (typeof r.octaves == "number" ? r.octaves : Ut(a, r.octaves, 3)) * i.amount;
			t[0].setValueAtTime(o, n), t[1].setValueAtTime(o * 2 ** s - o, n);
		}
	};
	return {
		attack(t, s, c) {
			let l = n.attackTime(s);
			i = Ft(r(), t, c);
			let u = i.track === 1 && i.amount === 1;
			(!u || a) && o(l), a = !u, e.triggerAttack(t, l, c);
		},
		release: (t) => void e.triggerRelease(n.releaseTime(t)),
		startsAfter: (e) => n.lastAttack() > e,
		reshapeFilter() {
			a && o(Math.max(n.immediate(), n.lastAttack()));
		},
		node: e
	};
}
var Yt = {
	filter: "Filter",
	distortion: "Distortion",
	bitcrusher: "BitCrusher",
	chorus: "Chorus",
	phaser: "Phaser",
	tremolo: "Tremolo",
	eq: "EQ3",
	compressor: "Compressor"
};
function Xt(e, t, n) {
	let r = e[Yt[t]], i = new r({ ...n });
	return (t === "chorus" || t === "tremolo") && i.start?.(), i;
}
function Zt(e, t) {
	let n = e;
	for (let e of t.split(".")) {
		if (n === null || typeof n != "object" && typeof n != "function" || !(e in n)) return;
		n = n[e];
	}
	return n;
}
function Qt(e) {
	return typeof e == "object" && !!e && typeof e.setValueAtTime == "function" && typeof e.cancelScheduledValues == "function";
}
var $t = .005;
function en(t, n, r, i = {}) {
	let a = new t.Gain(1), o = r ?? t.getDestination();
	a.connect(o);
	let s = !1, c = i.bpm !== void 0 && Number.isFinite(i.bpm) && i.bpm > 0 ? i.bpm : 120, l = 0, u = [], d = /* @__PURE__ */ new Map(), f = (e) => {
		let n = ge(e.voiceType, e.params);
		e.voices = [];
		for (let r = 0; r < e.polyphony; r++) {
			let r = Kt(t, e.voiceType, n, () => e.params);
			r.node.connect(e.choke ?? e.volume), e.voices.push(r);
		}
		e.alloc.reset(e.polyphony);
	}, p = (e) => {
		for (let t of e.voices) t.node.dispose();
		e.voices = [];
	}, m = vt(n) ? n.kit.pads : null, h = yt(n), g = m ? Ct(m, h.length) : null, _ = h.map((n, r) => {
		let i = Rt(n.polyphony), o = zt(n.volume), s = {
			voiceType: n.voiceType,
			params: fe(n.voiceType, n.params),
			polyphony: i,
			db: o,
			volume: new t.Volume(o),
			choke: g?.chokeable[r] ? new t.Gain(1) : null,
			voices: [],
			alloc: new e(i),
			notes: 0
		};
		return s.choke?.connect(s.volume), s.volume.connect(a), f(s), s;
	}), v = (e, t) => {
		for (let n of e.alloc.releaseAll()) e.voices[n]?.release(t);
		let n = e.choke?.gain;
		n && (n.cancelScheduledValues(t), n.setTargetAtTime(0, t, $t));
	}, y = (e) => typeof e == "number" && Number.isFinite(e) ? e : void 0, b = (e, t, n) => {
		let r = e.notes++;
		return {
			midi: t,
			index: y(n?.ordinal) ?? r,
			key: y(n?.key),
			syllable: typeof n?.syllable == "string" ? n.syllable : void 0
		};
	}, x = (e, n, r, i, a) => {
		let { padLayers: o, chokes: s } = g, c = m[e].pitch, l = i ?? t.immediate();
		for (let t of s[e]) for (let e of o[t]) v(_[e], l);
		let u = !1;
		for (let t of o[e]) {
			let e = _[t];
			e.choke && (e.choke.gain.cancelScheduledValues(l), e.choke.gain.setValueAtTime(1, l));
			let { voice: o, stolen: s } = e.alloc.noteOn(n);
			s !== null && (u = !0), e.voices[o]?.attack(Lt(c) * Nt(e.params), i, r, b(e, c, a));
		}
		return u;
	}, S = () => ({
		layers: _.map((e) => ({
			voiceType: e.voiceType,
			polyphony: e.polyphony,
			volume: e.db,
			params: e.params
		})),
		effects: u.map((e) => ({
			id: e.id,
			type: e.type,
			bypass: e.bypass,
			params: e.params
		}))
	}), C = (e) => {
		let t = Xe(e);
		if (!t) return [];
		if (t.kind === "layer") {
			let e = _[t.layer];
			if (!e) return [];
			if (t.path === "volume") return Qt(e.volume.volume) ? [e.volume.volume] : [];
			let n = se(e.voiceType, t.path);
			return n ? e.voices.map((e) => Zt(e.node, n)).filter(Qt) : [];
		}
		let n = u.find((e) => e.id === t.effectId);
		if (!n?.node || !Re(n.type, t.path)?.modulatable) return [];
		let r = Zt(n.node, t.path);
		return Qt(r) ? [r] : [];
	}, w = (e, t, n = S()) => {
		let r = Ze(n, e.target), i = Qe(n, e.target);
		if (!r || i === null) return;
		let [a, o] = $e(r, i, t.patch.depth * e.depth);
		e.lfo.min = a, e.lfo.max = o;
	}, T = (e, t) => {
		for (let t of C(e.target)) try {
			e.lfo.connect(t), t.overridden = !0, t.cancelScheduledValues(0), t.setValueAtTime(0, 0), e.params.push(t);
		} catch {}
		w(e, t);
	}, E = (e) => {
		for (let t of e.params) try {
			e.lfo.disconnect(t);
		} catch {}
		e.params = [];
	}, D = (e) => {
		let n = e.params;
		E(e);
		let r = Qe(S(), e.target), i = t.immediate();
		for (let e of n) try {
			e.overridden = !1, e.cancelScheduledValues(i), r !== null && e.setValueAtTime(r, i);
		} catch {}
	}, O = (e) => {
		let t = [];
		for (let n of d.values()) for (let r of n.links) r.target.startsWith(e) && t.push([r, n]);
		return t;
	}, k = (e) => {
		for (let [t] of O(e)) E(t);
	}, A = (e) => {
		for (let [t, n] of O(e)) t.params.length === 0 && T(t, n);
	}, j = (e) => {
		let t = null;
		for (let n of d.values()) for (let r of n.links) r.target === e && (t ??= S(), w(r, n, t));
	}, M = (e) => {
		let t = _[e];
		k(`layer:${e}:`), p(t), f(t), A(`layer:${e}:`);
	}, N = () => {
		a.disconnect();
		for (let e of u) e.node?.disconnect();
		let e = a;
		for (let t of u) t.node && !t.bypass && (e.connect(t.node), e = t.node);
		e.connect(o);
	}, P = (e) => {
		try {
			e.node = Xt(t, e.type, e.params);
		} catch {
			e.node = null;
		}
	}, F = (e) => {
		k(`fx:${e.id}:`);
		try {
			e.node?.disconnect(), e.node?.dispose();
		} catch {}
		e.node = null;
	}, I = (e, t) => {
		let n = {}, r = !1;
		for (let i of Le(e.type)) {
			let a = H(i, t[i.path]) ?? i.default;
			a !== e.params[i.path] && (e.params[i.path] = a, n[i.path] = a, i.rebuild && (r = !0));
		}
		let i = Object.keys(n);
		if (i.length === 0) return !1;
		if (!r && e.node) try {
			e.node.set(n);
		} catch {
			r = !0;
		}
		if (r || !e.node) return F(e), P(e), A(`fx:${e.id}:`), !0;
		for (let t of i) j(`fx:${e.id}:${t}`);
		return !1;
	}, L = (e) => {
		for (let t of d.values()) if (t.links.some((t) => t.target.startsWith(e))) {
			for (let n of t.links) if (n.target.startsWith(e)) {
				E(n);
				try {
					n.lfo.dispose();
				} catch {}
			}
			t.links = t.links.filter((t) => !t.target.startsWith(e)), t.patch = {
				...t.patch,
				connections: t.patch.connections.filter((t) => !t.target.startsWith(e))
			};
		}
	}, R = (e) => {
		let t = new Map(u.map((e) => [e.id, e])), n = [], r = [], i = !1;
		for (let a of e.slice(0, 24)) {
			if (n.length >= 6) break;
			let e = t.get(a?.id);
			if (e && e.type === a.type) {
				t.delete(e.id), e.bypass !== (a.bypass === !0) && (e.bypass = a.bypass === !0, i = !0), a.params && I(e, a.params) && (i = !0), n.push(e);
				continue;
			}
			let o = nt(a);
			if (!o || n.some((e) => e.id === o.id)) continue;
			let s = {
				...o,
				params: { ...o.params },
				node: null
			};
			P(s), n.push(s), r.push(s), i = !0;
		}
		for (let e of t.values()) F(e), L(`fx:${e.id}:`), i = !0;
		!i && n.some((e, t) => u[t] !== e) && (i = !0), u = n, i && N();
		for (let e of r) A(`fx:${e.id}:`);
	}, z = (e, t) => {
		for (let n of e.links) {
			t(n.target) ? D(n) : E(n);
			try {
				n.lfo.dispose();
			} catch {}
		}
		e.links = [];
	}, B = (e) => {
		let n = t.immediate(), r = qe(e.patch, c);
		for (let i of e.patch.connections) {
			let a;
			try {
				a = new t.LFO({
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
				params: []
			};
			e.links.push(o), T(o, e), a.start(n);
		}
	}, ee = (e, t) => e.connections.length === t.connections.length && e.connections.every((e, n) => e.target === t.connections[n].target), te = (e) => {
		let t = at(e, S()), n = new Set(t.map((e) => e.id));
		for (let [e, t] of d) n.has(e) || (z(t, () => !0), d.delete(e));
		let r = [], i = [];
		for (let e of t) {
			let t = e.connections, n = d.get(e.id);
			if (!n) {
				let t = {
					patch: e,
					links: []
				};
				d.set(e.id, t), r.push(t);
				continue;
			}
			let a = n.patch;
			if (n.patch = e, !ee(a, e) || n.links.length !== t.length) {
				let e = new Set(t.map((e) => e.target));
				z(n, (t) => !e.has(t)), r.push(n);
				continue;
			}
			i.push([n, a]);
		}
		for (let e of r) B(e);
		for (let [e, t] of i) {
			let n = e.patch, r = n.connections, i = qe(n, c), a = qe(t, c) !== i;
			for (let o of e.links) t.shape !== n.shape && (o.lfo.type = n.shape), a && (o.lfo.frequency.value = i), o.depth = r.find((e) => e.target === o.target)?.depth ?? o.depth;
			if (t.depth !== n.depth || t.connections !== r) {
				let t = S();
				for (let n of e.links) w(n, e, t);
			}
		}
	};
	n.effects?.length && R(n.effects), n.lfos?.length && te(n.lfos);
	let ne = (e) => {
		s || e();
	};
	return {
		noteOn(e, t = 1, n, r) {
			if (s || !Number.isFinite(e)) return;
			let i = Number.isFinite(t) ? Math.min(1, Math.max(0, t)) : 1;
			if (g) {
				let t = g.padByNote.get(e);
				t !== void 0 && x(t, e, i, n, r) && l++;
				return;
			}
			let a = Lt(e), o = !1;
			for (let t of _) {
				let { voice: s, stolen: c } = t.alloc.noteOn(e);
				c !== null && (o = !0), t.voices[s]?.attack(a * Nt(t.params), n, i, b(t, e, r));
			}
			o && l++;
		},
		noteOff(e, t) {
			if (!s) for (let n of _) {
				let r = n.alloc.noteOff(e);
				r !== null && n.voices[r]?.release(t);
			}
		},
		releaseAll() {
			if (s) return;
			let e = t.immediate();
			_.forEach((n, r) => {
				n.alloc.releaseAll(), n.notes = 0;
				let i = null, a = !1;
				n.voices.forEach((o, s) => {
					if (!o.startsAfter(e)) return o.release(void 0);
					try {
						i ??= ge(n.voiceType, n.params);
						let e = Kt(t, n.voiceType, i, () => n.params);
						e.node.connect(n.choke ?? n.volume), a || k(`layer:${r}:`), a = !0, o.node.dispose(), n.voices[s] = e;
					} catch {
						o.release(void 0);
					}
				}), a && A(`layer:${r}:`);
			});
		},
		setParam(e, t, n) {
			let r = _[e];
			if (s || !r) return;
			let i = ue(r.voiceType, t), a = i ? H(i, n) : void 0;
			if (!i || a === void 0) return;
			if (r.params[t] = a, i.rebuild) {
				M(e);
				return;
			}
			let o = _e(r.voiceType, r.params, t);
			if (Object.keys(o).length > 0) try {
				for (let e of r.voices) e.node.set(o), e.reshapeFilter?.();
			} catch {
				M(e);
			}
			j(`layer:${e}:${t}`);
		},
		setLayerVolume(e, t) {
			let n = _[e];
			!s && n && Number.isFinite(t) && (n.db = zt(t), n.volume.volume.value = n.db, j(`layer:${e}:volume`));
		},
		setEffects: (e) => ne(() => R(Array.isArray(e) ? e : [])),
		setLfos: (e) => ne(() => te(Array.isArray(e) ? e : [])),
		setTempo(e) {
			if (!(s || !Number.isFinite(e) || e <= 0 || e === c)) {
				c = e;
				for (let e of d.values()) {
					if (!e.patch.sync) continue;
					let t = qe(e.patch, c);
					for (let n of e.links) n.lfo.frequency.value = t;
				}
			}
		},
		bendPitch(e, t, n) {
			if (s || e.length === 0 || !Number.isFinite(n)) return;
			let r = Number.isFinite(t) ? Math.max(0, t) : 0;
			for (let t of _) {
				let i = t.params.detune, a = typeof i == "number" && Number.isFinite(i) ? i : 0;
				for (let i of t.voices) {
					let t = Zt(i.node, "detune");
					if (!Qt(t) || t.overridden) continue;
					let o = t.linearRampToValueAtTime;
					try {
						t.cancelScheduledValues(n), t.setValueAtTime(a + (r > 0 && o ? 0 : e[e.length - 1]), n), r > 0 && o && e.forEach((i, s) => o.call(t, a + i, n + r * (s + 1) / e.length));
					} catch {}
				}
			}
		},
		voiceStats() {
			let e = 0;
			for (let t of _) e += t.alloc.heldCount;
			return {
				active: e,
				steals: l
			};
		},
		dispose() {
			if (!s) {
				s = !0;
				for (let e of d.values()) z(e, () => !1);
				d.clear();
				for (let e of _) p(e), e.choke?.dispose(), e.volume.dispose();
				for (let e of u) F(e);
				u = [], a.dispose();
			}
		}
	};
}
//#endregion
//#region src/song/game.ts
var tn = ["master:filter.frequency", "master:filter.Q"];
function nn(e) {
	return tn.includes(e);
}
var q = {
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
function rn() {
	return {
		frequency: q.frequency.default,
		Q: q.Q.default
	};
}
function an(e) {
	return e.frequency >= q.frequency.max && Math.abs(e.Q - q.Q.default) < 1e-6;
}
function on(e) {
	return e.masterFilter ?? rn();
}
var sn = [
	"jump",
	"stop",
	"fadeOut",
	"tapeStop"
], cn = [
	"now",
	"beat",
	"bar"
], ln = [
	"freeze",
	"muffled",
	"stop"
], un = {
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
}, dn = 2e4, fn = .75, pn = "game-over";
function mn() {
	return {
		mode: "freeze",
		muffleHz: 400,
		fadeSeconds: .4
	};
}
function hn() {
	return [{
		id: pn,
		name: "Game over",
		action: "tapeStop",
		landing: "now",
		seconds: fn
	}];
}
function gn() {
	return {
		links: [],
		layers: [],
		swaps: []
	};
}
function _n(e) {
	return e.cues ?? hn();
}
function vn(e) {
	return e.pause ?? mn();
}
function yn(e) {
	return e.rules ?? gn();
}
function bn(e) {
	return e.sections ?? [];
}
function xn(e, t) {
	let n = Math.min(e.max, Math.max(e.min, t));
	return e.step === "whole" ? Math.min(e.max, Math.max(e.min, Math.round(n))) : n;
}
function Sn(e, t) {
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
function Cn(e, t, n, r) {
	return r === null ? e >= t : r ? e >= t - Math.max(0, n) : e >= t;
}
function wn(e, t, n, r) {
	if (t === n) return n;
	let i = n > t ? e.riseSeconds : e.fallSeconds;
	if (!(i > 0)) return n;
	let a = Math.min(1, Math.max(0, r) / i);
	return a >= 1 ? n : t + (n - t) * a;
}
var Tn = [
	"vox",
	"melody",
	"harmony",
	"bass",
	"kit",
	"perc"
];
function En(e) {
	return Tn.includes(e);
}
function Dn() {
	return [{
		id: "reverb",
		name: "Reverb",
		type: "reverb",
		params: We("reverb"),
		returnDb: 0,
		mute: !1
	}, {
		id: "delay",
		name: "Delay",
		type: "delay",
		params: We("delay"),
		returnDb: 0,
		mute: !1
	}];
}
function On(e) {
	return e.buses ?? Dn();
}
function kn(e) {
	return 3840 / e.unit;
}
function An(e) {
	return kn(e) * e.beats;
}
function jn(e) {
	return e.startTick + e.lengthTicks;
}
function Mn(e) {
	let t = 0;
	for (let n of e.tracks) for (let e of n.clips) t = Math.max(t, jn(e));
	return t;
}
function Nn(e) {
	return e.some((e) => e.solo);
}
function Pn(e, t) {
	return e.mute ? !1 : !t || e.solo;
}
function Fn(e) {
	return e === -Infinity ? 0 : Number.isFinite(e) ? 10 ** (Math.min(e, 12) / 20) : 1;
}
var In = -.3, Ln = -1.5, Rn = .001, zn = .1, Bn = 10 ** (In / 20), Vn = 10 ** (Ln / 20), Hn = Bn - Vn;
function Un(e) {
	let t = Math.abs(e);
	return t <= Vn ? e : Math.sign(e) * (Vn + Hn * Math.tanh((t - Vn) / Hn));
}
var Wn = 10 ** (1.14 / 20);
function Gn(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(1, Math.max(-1, e)) : 0;
}
function Kn(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(1, Math.max(0, e)) : 0;
}
function qn(e) {
	let t = Nn(e), n = /* @__PURE__ */ new Map();
	for (let r of e) n.set(r.id, Pn(r, t) ? Fn(r.volume) : 0);
	return n;
}
function Jn(e) {
	return e.mute ? 0 : Fn(Number.isFinite(e.returnDb) ? Math.min(6, Math.max(-60, e.returnDb)) : 0);
}
function Yn(e, t) {
	let n = typeof e.division == "string" ? e.division : "8n.";
	return Math.min(8, Ce(n, t));
}
function Xn(e, t, n) {
	if (e === "delay") return {
		delayTime: Yn(t, n),
		feedback: t.feedback,
		wet: 1
	};
	let r = { wet: 1 };
	for (let n of Ue(e)) r[n.path] = t[n.path];
	return r;
}
function Zn(e, t, n, r) {
	let i = Xn(t, n, r);
	if (t === "reverb") return new e.Reverb(i);
	if (t === "delay") return new e.FeedbackDelay({
		...i,
		maxDelay: 8
	});
	let a = new e.Chorus(i);
	return a.start?.(), a;
}
var Qn = .02;
function $n(e, t, n, r, i) {
	let a = new e.Gain(1), o = new e.Gain(Jn(t));
	o.connect(n);
	let s = t.type, c = Ge(s, t.params), l = r, u = null, d = Jn(t), f = t.name, p = 0, m = !1, h = null, g = !1, _ = () => {
		try {
			a.disconnect(), u?.dispose();
		} catch {}
		u = null;
	}, v = (e) => {
		if (_(), !m) {
			m = !0;
			try {
				i?.(`The ${Be[s]} bus “${f}” could not be built, so its send is silent.`, e);
			} catch {}
		}
	}, y = () => {
		let t = ++p;
		try {
			let n = Zn(e, s, c, l);
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
			let n = Ge(t.type, t.params);
			if (t.type !== s) b(), s = t.type, c = n, _(), y();
			else {
				let e = {};
				for (let t of Ue(s)) n[t.path] !== c[t.path] && (e[t.path] = n[t.path]);
				if (c = n, Object.keys(e).length > 0 && s === "reverb") x();
				else if (Object.keys(e).length > 0 && u) try {
					u.set(s === "delay" ? {
						delayTime: Yn(c, l),
						feedback: c.feedback
					} : e);
				} catch {
					_(), y();
				}
			}
			let r = Jn(t);
			r !== d && (d = r, o.gain.rampTo(r, Qn, e.immediate()));
		},
		setTempo(e) {
			if (!(!Number.isFinite(e) || e <= 0 || e === l) && (l = e, s === "delay" && u)) try {
				u.set({ delayTime: Yn(c, l) });
			} catch {}
		},
		dispose() {
			g = !0, b(), _(), a.dispose(), o.dispose();
		}
	};
}
//#endregion
//#region src/playback/transport/tone-ticks.ts
function er(e, t, n) {
	return e / (60 / t * 1) * n;
}
function tr(e, t, n) {
	return e * (60 / t * 1) / n;
}
function nr(e, t) {
	return e + t * Math.max(Math.abs(e) * 2 ** -52, Number.MIN_VALUE);
}
function rr(e, t, n) {
	let r = tr(e, t, n);
	for (let i = 0; i < 64 && Math.floor(er(r, t, n)) < e; i++) r = nr(r, 1);
	return r;
}
function ir(e, t, n) {
	let r = tr(e, t, n);
	for (let i = 0; i < 64 && er(r, t, n) > e; i++) r = nr(r, -1);
	return r;
}
//#endregion
//#region src/playback/transport/tone.ts
var ar = 1e-6;
function or(e) {
	let t = e.getTransport(), n = e.getContext();
	t.PPQ !== 960 && (t.PPQ = 960), t.swing = 0, t.loop = !1, t.loopStart = 0, t.loopEnd = ir(3840, t.bpm.value, 960);
	let r = 0, i = 0, a = Infinity, o = 0, s = 0, c = 0, l = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Set(), f = /* @__PURE__ */ new Set(), p = /* @__PURE__ */ new Set(), m = !1, h = (e) => Math.max(e, m ? t.immediate() : t.now()), g = (e) => {
		let t = m;
		m = !0;
		try {
			e();
		} finally {
			m = t;
		}
	}, _ = (e) => e >= r - ar && e < a - ar, v = (e, t) => {
		!_(t) || t >= s - ar && t < c || g(() => e(t));
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
			s = e, c = e + p * f - ar;
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
				t.loopStart = rr(e.startTick, n, 960), t.loopEnd = ir(e.endTick, n, 960);
			}
			t.loop = e !== null;
		},
		onLoop(e) {
			return d.add(e), () => void d.delete(e);
		},
		scheduleTick(e, n) {
			let r = t.schedule((e) => v(n, e), rr(e, t.bpm.value, 960));
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
function sr(e) {
	return e;
}
var cr = (e) => e;
function lr(e) {
	return {
		rampTo: (t, n, r) => void e.rampTo(t, n, r),
		setAt: (t, n) => void e.setValueAtTime(t, n),
		linearTo: (t, n) => void e.linearRampToValueAtTime(t, n),
		cancelFrom: (t) => void e.cancelScheduledValues(t),
		holdAt: (t) => void e.cancelAndHoldAtTime(t)
	};
}
var ur = q.frequency.max, dr = q.Q.default, fr = .005;
function pr(e) {
	return (t, n) => {
		try {
			e ? e(t, n) : console.error(t, n);
		} catch {}
	};
}
function mr(e, t = {}) {
	let n = /* @__PURE__ */ new WeakMap(), r = (e, n) => {
		if (!t.meter) return null;
		try {
			return t.meter(e);
		} catch (e) {
			return n("A level meter could not be attached.", e), null;
		}
	};
	return {
		destination: sr(e.getDestination()),
		createTransport: () => or(e),
		createTrack(t, i, a) {
			let o = pr(a), s = new e.Gain(i.gain), c = new e.Panner({
				pan: i.pan,
				channelCount: 2
			});
			s.connect(c), c.connect(cr(t));
			let l = r(c, o), u = /* @__PURE__ */ new Map(), d = (e) => {
				try {
					c.disconnect(e.gain);
				} catch {}
				e.gain.disconnect(), e.gain.dispose();
			};
			return {
				input: sr(s),
				gain: lr(s.gain),
				pan: lr(c.pan),
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
			let s = pr(o), c = $n(e, t, cr(i), a, s), l = r(c.output, s), u = {
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
		createInstrument: (t, n, r) => en(e, n, cr(t), r),
		createMusicChain(t, n) {
			let r = pr(n), i = e.getContext(), a = !1, o = new e.Gain(1), s = new e.Gain(1), c = new e.Gain(1), l = new e.Gain(1), u = new e.Gain(1), d = new e.Gain(1);
			c.connect(l), l.connect(u), u.connect(cr(t));
			let f = (t, n, r) => {
				t.rampTo(n, Math.max(fr, r), e.immediate());
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
						let m = u >= ur && Math.abs(d - dr) < 1e-6;
						(!m || o && s === null) && (m || c(), o || (o = new e.Filter({
							type: "lowpass",
							frequency: ur,
							Q: dr
						}), o.connect(n), t.disconnect(n), t.connect(o)), f(o.frequency, Math.min(ur, u), p), f(o.Q, d, p), m && (s = i.setTimeout(() => {
							s = null;
							try {
								l();
							} catch (e) {
								r("The music filter could not step aside.", e);
							}
						}, Math.max(fr, p) + .05)));
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
				input: sr(o),
				setLowpass: (e, t, n, r) => m[e].set(t, n, r),
				cue: lr(c.gain),
				pause: lr(l.gain),
				hidden: lr(u.gain),
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
var hr = 16385;
function gr(e) {
	let t = new e.Compressor({
		threshold: -2,
		ratio: 20,
		knee: 0,
		attack: Rn,
		release: zn
	}), n = new e.Gain(1 / (Wn * 4)), r = new e.WaveShaper((e) => Un(e * 4), hr);
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
function _r(e) {
	return e.glideTo === void 0 ? 0 : (e.glideTo - e.bpm) * 960 / (e.endTick - e.tick);
}
function vr(e, t) {
	let n = t / 960, r = _r(e);
	return r === 0 ? 60 * n / e.bpm : 60 * Math.log1p(r * n / e.bpm) / r;
}
function yr(e, t) {
	let n = _r(e);
	return (n === 0 ? t * e.bpm / 60 : e.bpm * Math.expm1(n * t / 60) / n) * 960;
}
function br(e, t, n) {
	let r = 0, i = e.length - 1;
	for (; r < i;) {
		let a = r + i + 1 >> 1;
		n(e[a]) <= t ? r = a : i = a - 1;
	}
	return r;
}
function xr(e, t) {
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
		t.glide && o && (s.glideTo = o.bpm), r.push(s), a = Math.max(a, t.bpm), o && (i += vr(s, o.tick - t.tick));
	}
	let o = (e) => r[br(r, e, (e) => e.tick)], s = (e) => {
		let t = o(e);
		return t.seconds + vr(t, e - t.tick);
	};
	return {
		segments: r,
		fastestBpm: a,
		bpmAt(e) {
			let t = o(e);
			return t.glideTo === void 0 || e <= t.tick ? t.bpm : t.bpm + _r(t) * (e - t.tick) / 960;
		},
		secondsAt: s,
		secondsBetween: (e, t) => s(t) - s(e),
		tickAtSeconds(e) {
			let t = r[br(r, e, (e) => e.seconds)], n = t.tick + yr(t, e - t.seconds);
			return Math.min(n, t.endTick);
		},
		changeAt: o
	};
}
var Sr = /* @__PURE__ */ new WeakMap(), Cr = null;
function wr(e) {
	let t = e.tempoChanges;
	if (!t || t.length === 0) return Cr?.segments[0].bpm !== e.bpm && (Cr = xr(e.bpm, [])), Cr;
	let n = Sr.get(t);
	return n?.segments[0].bpm !== e.bpm && (n = xr(e.bpm, t), Sr.set(t, n)), n;
}
//#endregion
//#region src/song/meter.ts
function Tr(e, t, n) {
	let r = 0, i = e.length - 1;
	for (; r < i;) {
		let a = r + i + 1 >> 1;
		n(e[a]) <= t ? r = a : i = a - 1;
	}
	return r;
}
function Er(e, t) {
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
		let { tick: t, meter: a } = n[e], o = n[e + 1]?.tick ?? Infinity, s = An(a);
		r.push({
			tick: t,
			meter: a,
			barTicks: s,
			beatTicks: kn(a),
			bar: i,
			endTick: o
		}), o !== Infinity && (i += Math.ceil((o - t) / s));
	}
	let a = (e) => r[Tr(r, e, (e) => e.tick)], o = (e, t) => {
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
			let t = Math.max(1, Math.floor(e)), n = r[Tr(r, t, (e) => e.bar)];
			return n.tick + (t - n.bar) * n.barTicks;
		},
		barLineAtOrAfter: s,
		beatLineAtOrAfter: (e) => o(e, (e) => e.beatTicks),
		barLines(e, t) {
			let n = [];
			if (!Number.isFinite(e) || !Number.isFinite(t)) return n;
			let i = s(e), a = Tr(r, i, (e) => e.tick), o = r[a], c = o.bar + Math.round((i - o.tick) / o.barTicks);
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
var Dr = /* @__PURE__ */ new WeakMap(), Or = null, kr = (e, t) => e.beats === t.beats && e.unit === t.unit;
function Ar(e) {
	let t = e.meterChanges;
	if (!t || t.length === 0) return (!Or || !kr(Or.segments[0].meter, e.timeSignature)) && (Or = Er(e.timeSignature, [])), Or;
	let n = Dr.get(t);
	return (!n || !kr(n.segments[0].meter, e.timeSignature)) && (n = Er(e.timeSignature, t), Dr.set(t, n)), n;
}
//#endregion
//#region src/song/overrides.ts
var jr = {
	hz: G.hz,
	depth: G.depth
};
function Mr(e) {
	if (typeof e != "string") return null;
	if (e.startsWith("lfo:")) {
		let t = e.indexOf(":", 4), n = e.slice(4, t), r = e.slice(t + 1);
		return t > 4 && (r === "hz" || r === "depth") ? {
			kind: "lfo",
			lfoId: n,
			path: r
		} : null;
	}
	return Xe(e);
}
function Nr(e, t) {
	return t.kind === "layer" ? e.layers[t.layer] : void 0;
}
function Pr(e, t) {
	return t.kind === "fx" ? e.effects?.find((e) => e.id === t.effectId) : void 0;
}
function Fr(e, t) {
	return t.kind === "lfo" ? e.lfos?.find((e) => e.id === t.lfoId) : void 0;
}
function Ir(e, t) {
	let n = Mr(t);
	if (!n) return null;
	if (n.kind === "layer") {
		let t = Nr(e, n);
		return t ? n.path === "volume" ? Je : ue(t.voiceType, n.path) ?? null : null;
	}
	if (n.kind === "fx") {
		let t = Pr(e, n);
		return t ? Re(t.type, n.path) ?? null : null;
	}
	return Fr(e, n) ? jr[n.path] : null;
}
function Lr(e, t) {
	let n = Ir(e, t), r = Mr(t);
	if (n) {
		if (r.kind === "layer") {
			let t = Nr(e, r);
			return (r.path === "volume" ? t.volume : t.params[r.path]) ?? n.default;
		}
		return r.kind === "fx" ? Pr(e, r).params[r.path] ?? n.default : Fr(e, r)[r.path];
	}
}
function Rr(e, t, n) {
	let r = Ir(e, t);
	return r ? H(r, n) : void 0;
}
function zr(e, t, n) {
	let r = Rr(e, t, n);
	if (r === void 0 || Lr(e, t) === r) return e;
	let i = Mr(t);
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
function Br(e, t) {
	if (!t) return e;
	let n = e;
	for (let [e, r] of Object.entries(t)) n = zr(n, e, r);
	return n;
}
function Vr(e, t) {
	return Br(e, t?.overrides?.[e.id]);
}
function Hr(e, t) {
	let n = new Set(e.tracks.map((e) => e.instrumentId)), r = t.filter((e) => n.has(e.id)).map((t) => Vr(t, e));
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
function Ur(e) {
	return typeof e == "string" || typeof e == "boolean" || typeof e == "number" && Number.isFinite(e);
}
function Wr(e, t, n, r) {
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
			if (!Mr(e) || !Ur(t)) {
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
var Gr = [{
	step: "1/16",
	ticks: 240,
	label: "16ths"
}, {
	step: "1/8",
	ticks: 480,
	label: "8ths"
}], Kr = "1/16";
function qr(e) {
	return Gr.some((t) => t.step === e);
}
function Jr(e) {
	return Gr.find((t) => t.step === e)?.ticks ?? 240;
}
function Yr(e, t, n) {
	let r = n * 2, i = Math.floor(e / r), a = e - i * r, o = n + t * n / 2;
	return i * r + (a <= n ? a * o / n : o + (a - n) * (r - o) / n);
}
var Xr = /* @__PURE__ */ new WeakMap();
function Zr(e, t) {
	let n = t.swing;
	if (!n || !(n.amount > 0) || e.length === 0) return e;
	let r = t.startTick ?? 0, i = Jr(n.step), a = `${r}:${t.lengthTicks}:${n.amount}:${i}`, o = Xr.get(t);
	if (o && o.notes === e && o.key === a) return o.out;
	let s = e.map((e) => {
		if (!(e.tick >= 0 && e.tick < t.lengthTicks)) return e;
		let a = Math.round(Yr(r + e.tick, n.amount, i)) - r, o = Math.round(Yr(r + e.tick + e.durationTicks, n.amount, i)) - r, s = Math.min(a, t.lengthTicks - 1);
		return {
			...e,
			tick: s,
			durationTicks: Math.max(1, o - s)
		};
	});
	return Xr.set(t, {
		notes: e,
		key: a,
		out: s
	}), s;
}
function Qr(e) {
	return e.tracks.some((e) => e.clips.some((e) => e.swing)) ? {
		...e,
		tracks: e.tracks.map((e) => e.clips.some((e) => e.swing) ? {
			...e,
			clips: e.clips.map((e) => {
				if (!e.swing) return e;
				let { swing: t, poolId: n, ...r } = e;
				return {
					...r,
					notes: Zr(e.notes, e)
				};
			})
		} : e)
	} : e;
}
function $r(e) {
	if (typeof e != "object" || !e) return null;
	let t = e, n = Object.hasOwn(t, "amount") ? t.amount : void 0, r = typeof n == "number" && Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0, i = Object.hasOwn(t, "step") && qr(t.step) ? t.step : Kr;
	return r === 0 && i === "1/16" ? null : {
		amount: r,
		step: i
	};
}
//#endregion
//#region src/song/patterns.ts
var ei = [
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
function ti(e) {
	return ei.some((t) => t.size === e);
}
function ni(e) {
	return ei.find((t) => t.size === e)?.ticks ?? 240;
}
function ri(e) {
	return e.length * ni(e.stepSize);
}
function ii(e, t) {
	let n = ni(e.stepSize), r = t % 2 == 1 ? Math.round(e.swing * n / 2) : 0;
	return t * n + r;
}
function ai(e) {
	return typeof e.patternId == "string";
}
function oi(e, t) {
	return t === void 0 ? null : e.patterns?.find((e) => e.id === t) ?? null;
}
var si = /* @__PURE__ */ new WeakMap();
function ci(e, t) {
	let n = si.get(e);
	n || (n = /* @__PURE__ */ new Map(), si.set(e, n));
	let r = n.get(t);
	if (r) return n.delete(t), n.set(t, r), r;
	let i = ri(e), a = [];
	if (i > 0 && t > 0) for (let n = 0; n < t; n += i) for (let r of e.rows) for (let o = 0; o < e.length; o++) {
		let s = r.steps[o] ?? 0;
		if (!(s > 0)) continue;
		let c = ii(e, o), l = n + c;
		if (l >= t) continue;
		let u = o + 1 < e.length ? ii(e, o + 1) : i, d = Math.max(1, Math.min(u - c, t - l));
		a.push({
			tick: l,
			durationTicks: d,
			midi: r.note,
			velocity: Math.min(1, s)
		});
	}
	return a.sort((e, t) => e.tick - t.tick || e.midi - t.midi), n.set(t, a), n.size > 8 && n.delete(n.keys().next().value), a;
}
var li = [];
function ui(e, t) {
	if (!ai(t)) return Zr(t.notes, t);
	let n = oi(e, t.patternId);
	return n ? ci(n, t.lengthTicks) : li;
}
//#endregion
//#region src/playback/events.ts
function di(e) {
	return Number.isFinite(e) ? Math.min(1, Math.max(0, e)) : 1;
}
function fi(e, t) {
	let n = [];
	for (let r of e.clips) {
		if (!Number.isFinite(r.startTick) || !(r.lengthTicks > 0)) continue;
		let e = Math.round(r.startTick + r.lengthTicks);
		for (let i of ui(t, r)) {
			if (!Number.isFinite(i.midi) || !(i.durationTicks > 0) || !(i.tick >= 0 && i.tick < r.lengthTicks)) continue;
			let t = Math.round(r.startTick + i.tick), a = Math.min(Math.round(r.startTick + i.tick + i.durationTicks), e);
			t < 0 || a <= t || n.push({
				start: t,
				end: a,
				midi: i.midi,
				velocity: di(i.velocity)
			});
		}
	}
	return n;
}
function pi(e) {
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
function mi(e, t = {}) {
	let n = [];
	for (let r of pi(fi(e, t))) n.push({
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
function hi(e) {
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
function gi(e) {
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
function _i(e, t) {
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
			return n = e, t ? (r = e && Number.isFinite(e.bpm) && e.bpm > 0 ? wr(e) : null, i = r ? r.segments.slice(1).map((e) => e.tick) : [], a = new Set(i), o = null, l = null, !0) : !1;
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
function vi(e, t) {
	if (e.kit === t.kit) return !0;
	let n = e.kit?.pads, r = t.kit?.pads;
	return !n || !r || n.length !== r.length ? !1 : n.every((e, t) => {
		let n = r[t];
		return e.note === n.note && e.pitch === n.pitch && e.choke === n.choke && e.layers.length === n.layers.length && e.layers.every((e, t) => e === n.layers[t]);
	});
}
function yi(e, t) {
	return e.id === t.id && vi(e, t) && e.layers.length === t.layers.length && e.layers.every((e, n) => {
		let r = t.layers[n];
		return e.voiceType === r.voiceType && e.polyphony === r.polyphony;
	});
}
function bi(e, t, n) {
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
				if (r && yi(r.patch, n)) {
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
var xi = .5, Si = 1, Ci = 4, wi = 4, Ti = .25, Ei = 10, Di = .25, Oi = 4, ki = .05, Ai = .05, ji = /* @__PURE__ */ new WeakMap();
function Mi(e) {
	let t = ji.get(e);
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
	return ji.set(e, a), a;
}
function Ni(e, t) {
	let n = 0, r = e.length;
	for (; n < r;) {
		let i = n + r >> 1;
		e[i] < t ? n = i + 1 : r = i;
	}
	return n;
}
var Pi = (e, t) => e.t0 + (t - e.k0) / (e.k1 - e.k0) * (e.t1 - e.t0), Fi = /* @__PURE__ */ new WeakMap();
function Ii(e, t, n) {
	let r = Fi.get(e);
	return r || (r = gi(e), Fi.set(e, r)), r.get(t)?.get(n);
}
var Li = .02, Ri = .1;
function zi(e, t) {
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
function Bi(e) {
	if (!e.enabled) return null;
	let t = Math.max(0, Math.round(e.startTick)), n = Math.round(e.endTick);
	return Number.isFinite(t) && Number.isFinite(n) && n > t ? {
		start: t,
		end: n
	} : null;
}
function Vi(e, t) {
	return e.enabled === t.enabled && e.startTick === t.startTick && e.endTick === t.endTick;
}
function Hi(e) {
	return Number.isFinite(e) ? Math.max(0, Math.round(e)) : 0;
}
function Ui(e, t = {}) {
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
		n !== null && (e.fadeEnd = n > 0 ? i + n : 0), e.gainTarget = t, e.channel.gain.rampTo(t, Math.max(Li, n ?? e.fadeEnd - i), i);
	}, j = () => {
		let e = r.tempo();
		if (!(e === u || !Number.isFinite(e) || e <= 0)) {
			u = e;
			for (let t of c.values()) t.instrument.setTempo(e);
			for (let { channel: t } of l.values()) t.setTempo(e);
		}
	}, M = _i(r, () => j()), N = (e) => {
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
	}, F = () => {
		for (let e of c.values()) N(e);
	}, I = () => {
		r.isRunning() && r.stop(r.now());
	}, L = -Infinity, R = -1, z = -Infinity, B = -Infinity, ee = (e) => {
		L = Math.min(L, e);
	}, te = (e) => {
		let t = o ? Bi(o.loop) : null;
		g = t !== null && e < t.end, r.setLoop(t && g ? {
			startTick: t.start,
			endTick: t.end
		} : null), ee(r.now());
	}, ne = (e, t) => {
		let n = o && g ? Bi(o.loop) : null, i = [], a = e, s = r.ticksAt(e);
		for (; a < t;) {
			let e = Math.min(t, a + Ai), o = r.ticksAt(e);
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
	}, re = (e, t, n, r, i = !1) => {
		let a = o && g ? Bi(o.loop) : null, s = t.at(-1)?.t1 ?? n, c = /* @__PURE__ */ new Map(), l = (e, n) => {
			let r = a && e.start < a.end ? Math.min(e.end, a.end) : e.end;
			for (let i = n; i < t.length; i++) {
				let a = t[i];
				if (i > n && a.k0 <= e.start) break;
				if (r >= a.k0 && r <= a.k1) return Pi(a, r);
			}
			return s;
		};
		for (let a of e) {
			let { spans: e, starts: o, longest: s } = Mi(a.table), u = a.pitched ? S : 0, d = [], f = t[0];
			if (i && f) for (let t = Ni(o, f.k0 - s); t < e.length && e[t].start < f.k0; t++) {
				let n = e[t], r = n.midi + u;
				n.end > f.k0 && r >= 0 && r <= 127 && d.push({
					midi: r,
					at: f.t0 - ki,
					end: l(n, 0)
				});
			}
			t.forEach((t, i) => {
				for (let a = Ni(o, Math.ceil(t.k0)); a < e.length && e[a].start < t.k1; a++) {
					let o = e[a], s = Pi(t, o.start);
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
	}, ie = () => {
		if (p !== "playing" || !o) return;
		let e = [...c.values()].filter((e) => e.instrument.handle()?.prepare);
		if (e.length === 0) return;
		let t = r.immediate(), n = r.now();
		M.revision !== R && (R = M.revision, ee(n));
		for (let t of e) {
			let e = t.instrument.handle();
			(t.plannedFor?.handle !== e || t.plannedFor.table !== t.table) && (t.plannedFor = {
				handle: e,
				table: t.table
			}, ee(n));
		}
		let i = Math.max(n - ki, L), a = t + xi, s = a + Di * 3, l = re(e, ne(t, s + Ti), i, !0), u = Math.min(Infinity, ...[...l.values()].map((e) => Math.min(...e.map((e) => e.at)))), d = null, f = () => d ??= re(e, ne(t, Math.max(a, u) + Ci), t, !1, !0), m = s + Ti;
		if (t - z >= wi && (u === Infinity || ae(f(), u, m, { dryRun: !0 }) === 0) && (z = t, u !== Infinity && ae(f(), u, m, { hold: !0 }), e[0].instrument.handle().prepare([], t, { sleep: !0 })), u > s) return;
		if (u > a) {
			oe(f(), u);
			return;
		}
		if (t - B < Di && B + Di < u - (n - t) - ki) return;
		let h = [...f().values()].flatMap((e) => e.map((e) => e.at)).sort((e, t) => e - t), g = i;
		for (let e of h) if (!(e < g)) {
			if (e > a) break;
			g = e + Si;
		}
		L = g;
		let _ = g - Si + Ci, v = 0;
		for (let [e, t] of f()) {
			let n = t.filter((e) => e.at < _);
			n.length > 0 && (v += e.instrument.handle().prepare(n, g));
		}
		v > 0 && (z = B = t);
	}, ae = (e, t, n, r = {}) => {
		let i = 0;
		for (let [a, o] of e) {
			let e = o.filter((e) => e.at < t + Ci);
			e.length > 0 && (i += a.instrument.handle().prepare(e, n, r));
		}
		return i;
	}, oe = (e, t) => {
		let n = r.immediate();
		if (n - B < Di) return;
		let i = t + Si, a = [...e].map(([e, n]) => {
			let r = n.filter((e) => e.at < t + Ci);
			return {
				handle: e.instrument.handle(),
				kept: r,
				voices: e.instrument.handle().prepare(r, i, { dryRun: !0 })
			};
		}), o = a.reduce((e, t) => e + t.voices, 0), s = Math.min(Oi, Math.ceil(o / Ei));
		if (s <= 1 || n < t - xi - Di * (s - 1) - ki) return;
		let c = Ei, l = 0;
		for (let e of a) e.voices === 0 || l > 0 && e.voices > c || (l += e.handle.prepare(e.kept, i), c -= e.voices);
		l > 0 && (z = B = n);
	}, V = r.setInterval(() => {
		try {
			ie();
		} catch (e) {
			D(e);
		}
	}, ki), se = () => r.ticksAt(r.now()), ce = null, le = () => ce ?? (p === "playing" ? se() : p === "paused" ? h : m), ue = (e, t) => {
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
	}, de = (e, t) => {
		if (p !== "playing") return;
		M.reach(e, t), j();
		let n = ce;
		ce = e;
		let i;
		try {
			i = ue(e, t);
		} finally {
			ce = n;
		}
		if (!i) return;
		let a = y, o = t < r.immediate() - Ri;
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
					ordinal: Ii(n.table, e, c)
				});
			} catch (e) {
				if (D(e), y !== a) return;
			}
		}
		e === f && !g && fe(t);
	}, H = (e) => {
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
	}, fe = (e) => {
		p = "stopped", w++;
		let t = ++y;
		for (let n of [...c.values()]) if (!P(n, e, t)) return;
		try {
			r.stop(e);
		} catch (e) {
			a("The Transport could not be stopped.", e);
		}
		H(e), T();
	}, pe = r.onLoop((e) => {
		if (p !== "playing") return;
		let t = o && g ? Bi(o.loop) : null;
		t && M.relocate(t.start, e);
		let n = y;
		for (let t of [...c.values()]) if (!P(t, e, n)) return;
	}), U = (e) => {
		let t = o ? Bi(o.loop) : null;
		if (!o || (!t || e >= t.end) && e >= f) return !1;
		p === "playing" && F(), y++, w++, H(r.immediate()), te(e);
		let n = r.now();
		return r.isRunning() && r.stop(n), r.start(n, e), M.relocate(e, n), L = -Infinity, _ = !1, !0;
	}, me = () => {
		let e = /* @__PURE__ */ new Set();
		for (let t of c.values()) for (let n of t.table.keys()) e.add(n);
		f > 0 && e.add(f);
		for (let t of C.keys()) e.add(t);
		for (let t of M.ticks) e.add(t);
		for (let [t, n] of d) e.has(t) || (r.clearTick(n), d.delete(t));
		for (let t of e) d.has(t) || d.set(t, r.scheduleTick(t, (e) => de(t, e)));
	}, he = (e) => e === null ? null : s?.find((t) => t.id === e) ?? null, ge = (e) => {
		let t = x.get(e.id)?.instrumentId;
		return t !== void 0 && he(t) ? t : e.instrumentId;
	}, _e = (e) => {
		let t = he(ge(e.track)), n = e.track.voiceLimit, r = x.get(e.track.id)?.knobs;
		if (t === e.source && n === e.limit && r === e.knobs) return;
		e.source = t, e.limit = n, e.knobs = r, e.pitched = t !== null && !t.kit;
		let i = t ? zi(t, n) : null;
		if (i && r) for (let [e, t] of Object.entries(r)) i = zr(i, e, t);
		let a = e.instrument.handle();
		e.instrument.update(i), e.instrument.handle() !== a && e.held.clear();
	}, ve = (e) => {
		let t = x.get(e.id);
		if (!t || t.volumeDb === void 0 && t.pan === void 0 && !t.sends) return e;
		let n = { ...e };
		return t.volumeDb !== void 0 && Number.isFinite(t.volumeDb) && (n.volume = t.volumeDb), t.pan !== void 0 && (n.pan = t.pan), t.sends && (n.sends = {
			...e.sends,
			...t.sends
		}), n;
	}, ye = (e) => {
		let t = x.get(e)?.gainScale;
		return t === void 0 || !Number.isFinite(t) ? 1 : Math.min(1, Math.max(0, t));
	}, be = (e) => {
		let t = qn(e.map(ve));
		for (let [e, n] of t) t.set(e, n * ye(e));
		return t;
	}, xe = (e) => {
		let t = x.get(e.id)?.patternId;
		return t !== void 0 && o?.patterns?.some((e) => e.id === t) ? t : void 0;
	}, Se = (e) => {
		let t = xe(e);
		return {
			table: hi(mi(t === void 0 ? e : {
				...e,
				clips: e.clips.map((e) => e.patternId === void 0 ? e : {
					...e,
					patternId: t
				})
			}, o ?? {})),
			swap: t
		};
	}, Ce = (t, n) => {
		let o = Gn(ve(t).pan), s = e.createTrack(i, {
			gain: n,
			pan: o
		}, a), c = bi(e, s.input, a);
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
		return {table: l.table, swap: l.patternSwap} = Se(t), _e(l), l;
	}, we = (e) => {
		N(e), e.instrument.dispose(), e.channel.dispose();
	}, W = (e) => {
		for (let t of c.values()) t.channel.dropSend(e.channel);
		e.channel.dispose();
	}, Te = () => {
		for (let e of c.values()) we(e);
		c.clear();
		for (let e of l.values()) W(e);
		l.clear();
		for (let e of d.values()) r.clearTick(e);
		d.clear(), f = 0;
	}, Ee = (t) => {
		let n = On(t), o = new Set(n.map((e) => e.id));
		for (let [e, t] of l) o.has(e) || (W(t), l.delete(e));
		for (let o of n) {
			let n = l.get(o.id);
			if (n) {
				n.bus !== o && n.channel.update(o), n.bus = o;
				continue;
			}
			t.tracks.some((e) => Kn(ve(e).sends?.[o.id]) > 0) && l.set(o.id, {
				bus: o,
				channel: e.createBus(o, i, r.tempo(), a)
			});
		}
	}, De = (e, t) => {
		let n = Gn(t.pan);
		n !== e.panTarget && (e.panTarget = n, e.channel.pan.rampTo(n, Li, r.immediate()));
		for (let [n, i] of l) e.channel.setSend(i.channel, Kn(t.sends?.[n]), Li, r.immediate());
	}, Oe = () => {
		p = "stopped", y++, w++, F(), I(), H(r.immediate()), T();
	}, ke = (e) => {
		if (p !== "playing" || e.held.size === 0) {
			N(e);
			return;
		}
		let t = se(), n = /* @__PURE__ */ new Set();
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
	}, Ae = (e, t) => {
		let n = o, i = t !== s;
		if (s = t, (!e || !n || e.id !== n.id) && (p !== "stopped" && Oe(), H(r.immediate()), Te(), O = !1, m = 0, h = 0), o = e, !e) return;
		let a = M.ticks;
		if (M.load(e) && M.assert(le(), r.immediate()), !n || n.timeSignature !== e.timeSignature) {
			let { beats: t, unit: n } = e.timeSignature;
			t > 0 && n > 0 && r.setTimeSignature(t, n);
		}
		let l = be(e.tracks), u = !1, d = /* @__PURE__ */ new Set();
		for (let t of e.tracks) {
			if (d.has(t.id)) continue;
			d.add(t.id);
			let r = c.get(t.id);
			if (!r) {
				c.set(t.id, Ce(t, l.get(t.id) ?? 0)), u = !0;
				continue;
			}
			let a = n !== null && n.patterns !== e.patterns && t.clips.some(ai), o = t.clips !== r.track.clips || a, s = i || t.instrumentId !== r.track.instrumentId || t.voiceLimit !== r.track.voiceLimit;
			r.track = t, o && ({table: r.table, swap: r.patternSwap} = Se(t), ke(r), u = !0), s && _e(r);
		}
		for (let [e, t] of c) d.has(e) || (we(t), c.delete(e), u = !0);
		Ee(e);
		for (let [e, t] of c) {
			De(t, ve(t.track));
			let n = l.get(e) ?? 0;
			n !== t.gainTarget && A(t, n, null);
		}
		j();
		let _ = Hi(Mn(e));
		_ !== f && (f = _, u = !0), M.ticks !== a && (u = !0), u && me(), p === "playing" && (n && !Vi(n.loop, e.loop) && te(se()), !g && se() >= f && Oe());
	}, je = () => r.ticksAt(r.immediate());
	return {
		setSong(e, t) {
			if (!(v || e === o && t === s)) try {
				Ae(e, t);
			} catch (e) {
				a("The song could not be loaded for playback.", e);
			}
		},
		play() {
			if (!(v || p === "playing") && (j(), U(p === "paused" ? h : m))) {
				E("playing");
				try {
					ie();
				} catch (e) {
					D(e);
				}
			}
		},
		pause() {
			v || p !== "playing" || (h = Hi(je()), p = "paused", y++, w++, F(), I(), H(r.immediate()), T());
		},
		stop() {
			v || p === "stopped" || Oe();
		},
		seek(e) {
			v || (m = Hi(e), h = m, p === "playing" && (U(m) || Oe()));
		},
		getCursorTick: () => m,
		getPositionTicks() {
			return p === "playing" ? je() : p === "paused" ? h : m;
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
			v || M.setRule(e, le(), t.time ?? r.immediate(), t.glideSeconds ?? 0);
		},
		tempoRate: () => M.rate(),
		slumpTempo(e, t, n) {
			v || M.slump(e, t, n);
		},
		releaseTempo() {
			v || M.release(le(), r.immediate());
		},
		setTrackControl(e, t) {
			if (v) return;
			let n = x.get(e);
			t ? x.set(e, t) : x.delete(e);
			let r = c.get(e);
			if (r && o) try {
				(n?.instrumentId !== t?.instrumentId || n?.knobs !== t?.knobs) && _e(r), xe(r.track) !== r.patternSwap && ({table: r.table, swap: r.patternSwap} = Se(r.track), ke(r), me()), (n?.pan !== t?.pan || n?.sends !== t?.sends || n?.volumeDb !== t?.volumeDb) && (Ee(o), De(r, ve(r.track)));
				let i = be(o.tracks).get(e) ?? 0;
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
			let a = Ar(o), s = e === "beat" ? a.beatLineAtOrAfter : a.barLineAtOrAfter, c = s(Math.floor(Math.max(0, se())) + 1), l = Bi(o.loop);
			if (g && l && c >= l.end) {
				let e = s(l.start);
				c = e < l.end ? e : l.start;
			}
			let u = {
				action: t,
				drop: n.drop === !0,
				onDrop: n.onDrop
			};
			return C.set(c, [...C.get(c) ?? [], u]), me(), {
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
			let n = Hi(e);
			if (p !== "playing" || !o) {
				m = n, h = n;
				return;
			}
			let i = Bi(o.loop);
			if ((!i || n >= i.end) && n >= f) {
				fe(t);
				return;
			}
			w++;
			let a = ++y;
			for (let e of [...c.values()]) if (!P(e, t, a)) return;
			te(n), M.relocate(n, t), r.relocate(t, n), ee(t);
		},
		stopAt(e) {
			!v && p === "playing" && fe(e);
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
			v || (p !== "stopped" && Oe(), v = !0, Te(), pe(), r.clearInterval(V), r.setLoop(null), n && r.dispose(), b.clear(), o = null, s = null);
		}
	};
}
//#endregion
//#region src/playback/game-runtime.ts
var Wi = 20, Gi = 400, Ki = -60, qi = 1 / 30, Ji = q.frequency.max, Yi = q.Q.default, Xi = .1, Zi = .05, Qi = .005, $i = .02, ea = .7, ta = 1e-4, na = "A game rule could not be applied.";
function ra() {
	let e = globalThis.document;
	return e && typeof e.addEventListener == "function" && typeof e.removeEventListener == "function" ? e : null;
}
function ia(e, t) {
	return e === void 0 || t === void 0 ? e === t : Math.abs(e - t) <= ta * Math.max(1, Math.abs(e), Math.abs(t));
}
function aa(e, t) {
	if (!e || !t) return e === t;
	let n = Object.keys(e);
	return n.length === Object.keys(t).length && n.every((n) => Object.hasOwn(t, n) && ia(e[n], t[n]));
}
function oa(e, t) {
	return !e || !t ? e === t : ia(e.gainScale, t.gainScale) && ia(e.volumeDb, t.volumeDb) && ia(e.pan, t.pan) && aa(e.sends, t.sends) && aa(e.knobs, t.knobs) && e.instrumentId === t.instrumentId && e.patternId === t.patternId;
}
function sa(e, t, n, r) {
	let i = Math.min(1, Math.max(0, t));
	if (e === "track:volume") return Ki + i * 72;
	if (e === "track:pan") return Gn(i * 2 - 1);
	if (e.startsWith("track:send:")) return r.has(e.slice(11)) ? Kn(i) : null;
	let a = n ? Ze(n, e) : null;
	return a && !a.rebuild ? le(a, i) : null;
}
function ca(e = 12) {
	return Array.from({ length: e }, (t, n) => 1200 * Math.log2(1 - .98 * ((n + 1) / e)));
}
function la(e, t = {}) {
	let n = t.transport === void 0, r = t.transport ?? e.createTransport(), i = (e, n) => {
		try {
			t.onError ? t.onError(e, n) : console.error(e, n);
		} catch {}
	}, a = e.createMusicChain(t.destination ?? e.destination, i), { cue: o, pause: s, hidden: c } = a, l = !1, u = (e) => {
		l || (l = !0, i(na, e));
	}, d = Ui(e, {
		onError: (e, t) => e === na ? u(t) : i(e, t),
		destination: a.input,
		transport: r
	}), f = null, p = [], m = yn({}), h = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ new Map(), _ = /* @__PURE__ */ new Map(), v = !1, y = null, b = 0, x = null, S = 0, C = null, w = /* @__PURE__ */ new Map(), T = /* @__PURE__ */ new Map(), E = /* @__PURE__ */ new Map(), D = /* @__PURE__ */ new Map(), O = /* @__PURE__ */ new Map(), k = null, A = !1, j = null, M = null, N = null, P = !1, F = (e) => g.get(e) ?? h.get(e), I = (e) => e.tick === null ? null : e, L = () => r.immediate(), R = (e, t, n, r = L()) => {
		e.rampTo(t, Math.max(Qi, n), r);
	}, z = (e) => {
		e !== null && r.clearTimeout(e);
	}, B = () => d.getState() === "playing", ee = (e) => h.get(e)?.value ?? null, te = () => {
		let e = m.tempo, t = e ? ee(e.dialId) : null, n = e && t !== null ? Sn(e.points, t) : null;
		if (!e || n === null) {
			x?.cancel(), x = null, y !== null && f && Number.isFinite(f.bpm) && d.setTempoRule(null), y = null;
			return;
		}
		let i = Math.min(Gi, Math.max(Wi, n));
		if (b = i, y === null || !ia(y, i) || x) {
			if (e.landing === "now" || !B()) {
				x?.cancel(), x = null, y = i, d.setTempoRule(i);
				return;
			}
			x || y !== null && ia(y, i) || (y = i, x = I(d.atBoundary("bar", (e) => {
				x = null;
				let t = b;
				y = t;
				let n = m.tempo ? m.tempo.glideBeats * 60 / Math.max(Wi, r.tempo()) : 0;
				d.setTempoRule(t, {
					time: e,
					glideSeconds: Math.max(Qi, n)
				});
			})));
		}
	}, ne = () => {
		let e = m.transpose, t = e ? ee(e.dialId) : null, n = e && t !== null ? Sn(e.points, t) : null, r = n === null ? 0 : Math.max(-24, Math.min(24, Math.round(n)));
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
				t && T.set(e.id, Cn(t.value, e.threshold, t.dial.cushion, T.get(e.id) ?? null));
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
		let t = new Set(On(f).map((e) => e.id)), n = /* @__PURE__ */ new Map(), r = (e) => {
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
			let o = w.get(t.id) ?? null, s = Cn(a.value, t.threshold, a.dial.cushion, o);
			w.set(t.id, s);
			let c = r(n);
			c.gainScale = (c.gainScale ?? 1) * +!!s, c.gainSeconds = Math.max(c.gainSeconds ?? 0, e ?? t.fadeSeconds);
		}
		let o = { ...on(f) };
		for (let e of m.links) {
			let n = ee(e.dialId), a = n === null ? null : Sn(e.points, n);
			if (a === null) continue;
			if (nn(e.target)) {
				let t = e.target === "master:filter.Q" ? "Q" : "frequency";
				o[t] = le(q[t], a);
				continue;
			}
			let s = e.trackId === void 0 ? void 0 : i.get(e.trackId);
			if (!s) continue;
			let c = re(E.get(s.id)?.instrumentId ?? s.instrumentId), l = sa(e.target, a, c, t);
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
		for (let [e, t] of n) oa(O.get(e), t) || (O.set(e, t), d.setTrackControl(e, t));
		for (let e of [...O.keys()]) n.has(e) || (O.delete(e), d.setTrackControl(e, null));
		v || (!k || !ia(k.frequency, o.frequency) || !ia(k.Q, o.Q)) && (k = o, a.setLowpass("master", o.frequency, o.Q, e === 0 ? Qi : Xi));
	}, V = (e) => {
		if (f) try {
			te(), ne(), ae(), oe(e);
		} catch (e) {
			u(e);
		}
	}, se = () => {
		if (v) return;
		let e = L();
		for (let t of h.values()) t.value = wn(t.dial, t.from, t.target, e - t.since);
		V();
	}, ce = r.setInterval(se, qi), ue = () => {
		x?.cancel(), x = null, y = null, C?.cancel(), C = null;
		for (let e of D.values()) e.cancel();
		D.clear(), w.clear(), T.clear();
	}, de = () => {
		M?.cancel(), M = null, N = null, fe();
	}, H = () => {
		let e = L();
		o.holdAt(e), R(o, 1, Qi, e);
	}, fe = () => {
		P && (P = !1, H());
	}, pe = () => j !== null || N !== null && N.action !== "jump", U = () => {
		de(), z(j), j = null, f && Number.isFinite(f.bpm) && d.releaseTempo(), y = null;
	}, me = () => {
		R(o, 1, Qi), d.bendPitch([0], 0, L());
	}, he = (e) => {
		A = !1, a.setLowpass("muffle", Ji, Yi, e), R(s, 1, e);
	}, ge = (e) => {
		if (!f) return 0;
		let t = d.getPositionTicks(), { loop: n } = f, i = e < t && n.enabled;
		if (!f.tempoChanges?.length) {
			let a = e - t + (i ? n.endTick - n.startTick : 0);
			return Math.max(0, a) * (60 / (Math.max(Wi, r.tempo()) * 960));
		}
		let a = wr(f), o = i ? a.secondsBetween(t, n.endTick) + a.secondsBetween(n.startTick, e) : a.secondsBetween(t, e);
		return Math.max(0, o) / d.tempoRate();
	}, _e = (e) => {
		z(j), j = r.setTimeout(() => {
			j = null;
			try {
				d.stop(), d.seek(0), U(), V();
			} catch (e) {
				i("A cue could not finish.", e);
			}
		}, Math.max(0, e));
	}, ve = (e, t) => {
		let n = e.seconds;
		if (e.action === "jump") {
			let r = bn(f ?? {}).find((t) => t.id === e.sectionId);
			if (!r) return;
			d.jumpAt(r.startTick, t), n > 0 && (o.cancelFrom(t), o.setAt(0, t), o.linearTo(1, t + n / 2));
			return;
		}
		if (e.action === "stop") {
			d.stopAt(t), d.seek(0);
			return;
		}
		if (e.action === "fadeOut") {
			let e = Math.max(Qi, n);
			o.cancelFrom(t), o.setAt(1, t), o.linearTo(0, t + e), _e(t + e - L());
			return;
		}
		let i = n > 0 ? n : fn, a = Math.max(Wi, r.tempo());
		d.slumpTempo(Math.max(1, a * $i), i, t), d.bendPitch(ca(), i, t), o.cancelFrom(t), o.setAt(1, t + i * ea), o.linearTo(0, t + i), _e(t + i - L());
	}, ye = t.visibility === void 0 ? ra() : t.visibility, be = () => {
		!v && ye && R(c, +!ye.hidden, Zi);
	};
	return ye?.addEventListener("visibilitychange", be), ye?.hidden && c.setAt(0, L()), {
		player: d,
		setGame(e, t, n) {
			if (v) return;
			let r = e?.id !== f?.id, i = e?.bpm !== f?.bpm || e?.tempoChanges !== f?.tempoChanges;
			if (r) {
				for (let e of O.keys()) d.setTrackControl(e, null);
				O.clear(), A && he(Qi), U();
			}
			d.setSong(e, t), f = e, p = t, m = yn(e ?? {}), (r || i) && (y = null), r && (l = !1, ue(), E.clear(), d.setTranspose(0), S = 0);
			let a = /* @__PURE__ */ new Set();
			g.clear();
			for (let e of n) {
				if (a.has(e.id) || g.has(e.name)) continue;
				a.add(e.id);
				let t = h.get(e.id), n = xn(e, _.get(e.name) ?? _.get(e.id) ?? t?.target ?? e.defaultValue), r;
				if (!t) r = {
					dial: e,
					target: n,
					value: n,
					from: n,
					since: L()
				};
				else {
					let i = xn({
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
			let i = xn(r.dial, t);
			i !== r.target && (r.from = r.value, r.since = L(), r.target = i), n.jump && (r.value = r.from = r.target), se();
		},
		dialValue: (e) => F(e)?.value ?? null,
		cue(e) {
			if (v || !f) return !1;
			let t = _n(f), n = t.find((t) => t.name === e) ?? t.find((t) => t.id === e);
			if (!n) return !1;
			let r = n.action === "jump" ? bn(f).find((e) => e.id === n.sectionId) : void 0;
			if (n.action === "jump" && !r) return !1;
			if (!B()) return r ? d.seek(r.startTick) : d.stop(), !0;
			if (j !== null && (U(), me()), de(), M = I(d.atBoundary(n.landing, (e) => {
				M = null, N = null, P = !1;
				try {
					ve(n, e);
				} catch (e) {
					H(), i("A cue could not be played.", e);
				}
			}, {
				drop: !0,
				onDrop: de
			})), M && (N = n), n.action === "jump" && n.seconds > 0 && M && M.tick !== null) {
				let e = L() + ge(M.tick), t = Math.max(L(), e - n.seconds / 2);
				o.cancelFrom(t), o.setAt(1, t), o.linearTo(0, Math.max(t + Qi, e)), P = !0;
			}
			return !0;
		},
		play() {
			v || (A && he(vn(f ?? {}).fadeSeconds), B() && pe() && (U(), d.stop(), d.seek(0)), !B() && (U(), me(), V(), d.play()));
		},
		pause() {
			if (v || A || !B()) return;
			let e = vn(f ?? {});
			if (A = !0, de(), e.mode === "stop") {
				d.stop(), d.seek(0);
				return;
			}
			a.setLowpass("muffle", e.muffleHz, Yi, e.fadeSeconds), e.mode === "freeze" && (d.pause(), e.fadeSeconds > 0 && R(s, 0, e.fadeSeconds));
		},
		stop() {
			v || (A && he(Qi), d.stop(), U(), V());
		},
		isPaused: () => A,
		settle: () => {
			for (let e of h.values()) e.value = e.from = e.target;
			w.clear(), T.clear(), V(0);
		},
		setMuffle(e, t) {
			if (v || !Number.isFinite(e)) return;
			let n = Math.min(Ji, Math.max(q.frequency.min, e));
			a.setLowpass("host", n, Yi, Math.max(Qi, Number.isFinite(t) ? t : 0));
		},
		dispose() {
			v || (v = !0, r.clearInterval(ce), z(j), ye?.removeEventListener("visibilitychange", be), d.dispose(), n && r.dispose(), a.dispose(), h.clear(), g.clear(), _.clear());
		}
	};
}
var ua = 3, da = (() => {
	let e = ue("FMSynth", "harmonicity");
	return e.kind === "number" ? Math.log(8 / e.min) / Math.log(16 / e.min) : 1;
})();
function fa(e) {
	return Math.round(e * da * 1e6) / 1e6;
}
function pa(e, t) {
	return Array.isArray(e) ? e.map((e) => {
		if (typeof e != "object" || !e || !Array.isArray(e.connections)) return e;
		let n = e.connections.map((e) => {
			let n = typeof e == "object" && e ? Xe(e.target) : null, r = n ? e.depth : void 0;
			return n?.kind !== "layer" || n.path !== "harmonicity" || t[n.layer]?.voiceType !== "FMSynth" ? e : typeof r == "number" && Number.isFinite(r) ? {
				...e,
				depth: fa(r)
			} : e;
		});
		return {
			...e,
			connections: n
		};
	}) : e;
}
var ma = {
	transpose: 0,
	keyTrack: 0,
	velocityToFilter: 0,
	stringDecay: "sustain",
	velocity: 0,
	tuning: "classic"
};
function ha(e) {
	let t = (t) => e.layers[t]?.voiceType === "FMSynth";
	for (let t of e.layers) {
		let e = t.params;
		if (Object.entries(ma).some(([t, n]) => t in e && e[t] !== n) || t.voiceType === "PluckSynth" && typeof e.detune == "number" && e.detune !== 0 || t.voiceType === "FMSynth" && typeof e.harmonicity == "number" && e.harmonicity > 8) return !0;
	}
	return (e.lfos ?? []).some((e) => e.connections.some((e) => {
		let n = Xe(e.target);
		return n?.kind === "layer" && n.path === "harmonicity" && t(n.layer);
	}));
}
function ga(e, t) {
	return typeof e == "string" ? e : t;
}
function _a(e, t) {
	return Array.isArray(e) ? e.map((e) => {
		if (typeof e != "object" || !e || !Array.isArray(e.connections)) return e;
		let n = e.connections.flatMap((e) => {
			let n = typeof e == "object" && e ? Xe(e.target) : null;
			if (n?.kind !== "layer") return [e];
			let r = t.get(n.layer);
			return r === void 0 ? [] : [{
				...e,
				target: Ye(r, n.path)
			}];
		});
		return {
			...e,
			connections: n
		};
	}) : e;
}
function va(e, t = {}) {
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
	let a = r.kit !== null && typeof r.kit == "object" && !Array.isArray(r.kit) ? r.kit : null, o = a && Object.hasOwn(a, "pads") ? a.pads : void 0, s = Array.isArray(o) ? 48 : ua, c = [];
	for (let [e, t] of r.layers.slice(0, s).entries()) {
		if (typeof t != "object" || !t) return {
			ok: !1,
			error: `Layer ${e + 1} is not an object.`
		};
		let n = t;
		if (!h(n.voiceType)) return {
			ok: !1,
			error: `Layer ${e + 1} uses an unknown voice type: ${JSON.stringify(n.voiceType)}.`
		};
		c.push({
			voiceType: n.voiceType,
			polyphony: Rt(n.polyphony),
			volume: zt(n.volume),
			params: fe(n.voiceType, n.params)
		});
	}
	let l, u = r.lfos;
	if (Array.isArray(o)) {
		let e = St(o, c);
		if (!e) return {
			ok: !1,
			error: "The drum kit has no pads, so there is nothing to play."
		};
		l = e.kit, c = e.layers, u = _a(u, e.moved);
	}
	(t.legacy ?? (typeof r.version == "number" && r.version < 2)) && (u = pa(u, c));
	let d = {
		id: i,
		name: ga(r.name, "Untitled"),
		category: ga(r.category, "Uncategorized"),
		description: ga(r.description, ""),
		layers: c
	};
	l && (d.kit = l);
	let f = it(r.effects);
	f.length > 0 && (d.effects = f);
	let p = at(u, d);
	return p.length > 0 && (d.lfos = p), {
		ok: !0,
		patch: d
	};
}
//#endregion
//#region src/song/key.ts
var ya = [
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
function ba(e) {
	return ya.includes(e);
}
function xa(e) {
	return (Math.round(e) % 12 + 12) % 12;
}
function Sa(e) {
	if (typeof e != "object" || !e || Array.isArray(e)) return null;
	let t = Object.hasOwn(e, "root") ? e.root : void 0, n = Object.hasOwn(e, "scale") ? e.scale : void 0;
	return typeof t != "number" || !Number.isFinite(t) || !ba(n) ? null : {
		root: xa(t),
		scale: n
	};
}
var Ca = [
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
function wa(e) {
	return Ca.includes(e);
}
//#endregion
//#region src/song/chords.ts
var Ta = 1024;
Object.freeze({
	root: 0,
	scale: "major"
});
function Ea(e) {
	return e.startTick + e.lengthTicks;
}
//#endregion
//#region src/state/immutable.ts
var Da = /* @__PURE__ */ new Set([
	"__proto__",
	"prototype",
	"constructor"
]);
function Oa(e) {
	return Da.has(e);
}
function ka(e) {
	let t = 0;
	for (let n of Da) Object.hasOwn(e, n) && t++;
	return t;
}
var Aa = 16, ja = Aa * 4, Ma = 16, Na = (e, t) => Object.hasOwn(e, t) ? e[t] : void 0;
function Pa(e) {
	if (typeof e != "string") return null;
	let t = e.trim();
	return t.length > 0 && t.length <= 64 && !Oa(t) ? t : null;
}
function Fa(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(16, Math.max(1, Math.round(e))) : null;
}
function Ia(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(6, Math.max(-60, e)) : null;
}
function La(e, t) {
	return typeof e == "string" && e.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 40).trim() || t;
}
function Ra(e) {
	if (typeof e != "object" || !e || Array.isArray(e)) return null;
	let t = {}, n = 0, r = 0;
	for (let i in e) {
		if (n >= Aa || r++ >= ja) break;
		if (!Object.hasOwn(e, i)) continue;
		let a = Pa(i), o = Kn(Na(e, i));
		a === null || a !== i || o <= 0 || (t[a] = o, n++);
	}
	return n > 0 ? t : null;
}
function za(e, t) {
	let n = Gn(Na(t, "pan"));
	n !== 0 && (e.pan = n);
	let r = Ra(Na(t, "sends"));
	r && (e.sends = r);
	let i = Fa(Na(t, "voiceLimit"));
	i !== null && (e.voiceLimit = i);
}
function Ba(e) {
	if (typeof e != "object" || !e || Array.isArray(e)) return null;
	let t = e, n = Pa(Na(t, "id")), r = Na(t, "type");
	return n === null || !Ve(r) ? null : {
		id: n,
		name: La(Na(t, "name"), Be[r]),
		type: r,
		params: Ge(r, Na(t, "params")),
		returnDb: Ia(Na(t, "returnDb")) ?? 0,
		mute: Na(t, "mute") === !0
	};
}
function Va(e, t, n) {
	if (e === void 0) return null;
	if (!Array.isArray(e)) return t(`${n} had an unreadable list of send buses, so it got the default Reverb and Delay.`), null;
	let r = [], i = Math.max(0, e.length - Ma);
	for (let t of e.slice(0, Ma)) {
		let e = Ba(t);
		!e || r.length >= 4 || r.some((t) => t.id === e.id) ? i++ : r.push(e);
	}
	return i > 0 && t(`${n}: dropped ${i === 1 ? "a send bus" : `${i} send buses`} that couldn’t be read or didn’t fit.`), r;
}
function Ha(e, t) {
	if (!e.sends) return e;
	let n = Object.entries(e.sends).filter(([e]) => t.has(e));
	if (n.length === Object.keys(e.sends).length) return e;
	let r = { ...e };
	return n.length > 0 ? r.sends = Object.fromEntries(n) : delete r.sends, r;
}
//#endregion
//#region src/state/pattern-normalize.ts
var Ua = 128, Wa = 40, Ga = (e, t) => Object.hasOwn(e, t) ? e[t] : void 0;
function Ka(e) {
	return typeof e == "object" && e && !Array.isArray(e) ? e : null;
}
function qa(e) {
	if (typeof e != "string") return null;
	let t = e.trim();
	return t.length > 0 && t.length <= Ua ? t : null;
}
function Ja(e, t) {
	if (typeof e != "string") return t;
	let n = e.slice(0, 160).replace(/[\u0000-\u001f\u007f]/g, " ").trim();
	return Array.from(n).slice(0, Wa).join("").trim() || t;
}
function Ya(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(64, Math.max(1, Math.round(e))) : null;
}
function Xa(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(1, Math.max(0, e)) : null;
}
function Za(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(1, Math.max(0, e)) : 0;
}
function Qa(e, t) {
	let n = Array(t).fill(0);
	for (let r = 0; r < Math.min(t, e.length); r++) n[r] = Za(e[r]);
	return n;
}
function $a(e, t) {
	let n = Ka(e);
	if (!n) return null;
	let r = Ga(n, "note"), i = Ga(n, "steps");
	if (typeof r != "number" || !Number.isFinite(r) || !Array.isArray(i)) return null;
	let a = Math.round(r);
	return a < 0 || a > 127 ? null : {
		note: a,
		steps: Qa(i.slice(0, 64), t)
	};
}
function eo(e) {
	let t = Ka(e);
	if (!t) return null;
	let n = qa(Ga(t, "id"));
	if (n === null) return null;
	let r = Ya(Ga(t, "length")) ?? 16, i = Ga(t, "stepSize"), a = Ga(t, "rows"), o = [], s = /* @__PURE__ */ new Set();
	if (Array.isArray(a)) for (let e of a.slice(0, 64)) {
		let t = $a(e, r);
		if (t && !s.has(t.note) && (s.add(t.note), o.push(t), o.length >= 16)) break;
	}
	return {
		id: n,
		name: Ja(Ga(t, "name"), "Pattern"),
		length: r,
		stepSize: ti(i) ? i : "1/16",
		swing: Xa(Ga(t, "swing")) ?? 0,
		rows: o
	};
}
function to(e, t, n) {
	if (e === void 0) return null;
	if (!Array.isArray(e)) return t(`${n} had an unreadable pattern list, so its pattern clips are now empty.`), null;
	let r = [], i = /* @__PURE__ */ new Set(), a = 0;
	for (let t of e.slice(0, 128)) {
		let e = eo(t);
		if (!e || i.has(e.id)) {
			a++;
			continue;
		}
		i.add(e.id), r.push(e);
	}
	return a += Math.max(0, e.length - 128), a > 0 && t(`${n}: dropped ${a} unreadable or repeated ${a === 1 ? "pattern" : "patterns"}.`), r.length > 0 ? r : null;
}
function no(e, t, n, r) {
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
var ro = [...Tn, "none"];
function io(e) {
	return e === "none" || En(e);
}
function ao(e) {
	return e.role ?? "none";
}
function oo(e) {
	return ro.indexOf(e);
}
function so(e) {
	let t = !0;
	for (let n = 1; n < e.length && t; n++) oo(ao(e[n - 1])) > oo(ao(e[n])) && (t = !1);
	return t ? e : e.map((e, t) => ({
		track: e,
		i: t,
		g: oo(ao(e))
	})).sort((e, t) => e.g - t.g || e.i - t.i).map((e) => e.track);
}
function co(e) {
	if (!Array.isArray(e)) return [];
	let t = new Set(e.filter(io));
	return ro.filter((e) => t.has(e));
}
function lo(e) {
	return Number.isFinite(e) ? Math.min(40, Math.max(3, Math.round(e * 16) / 16)) : 6;
}
function uo(e) {
	return typeof e == "number" && Number.isFinite(e) ? lo(e) : null;
}
//#endregion
//#region src/song/track-colors.ts
var fo = /^#[0-9a-f]{6}$/;
function po(e) {
	if (typeof e != "string") return null;
	let t = e.trim().toLowerCase();
	return fo.test(t) ? t : null;
}
//#endregion
//#region src/state/document.ts
function mo(e, t) {
	let n = po(J(t, "color"));
	n && (e.color = n, J(t, "colorPicked") === !0 && (e.colorPicked = !0));
	let r = uo(J(t, "height"));
	r !== null && (e.height = r);
}
var ho = "Untitled Song", go = "Track", _o = [
	2,
	4,
	8,
	16
], vo = 384e5, yo = {
	rack: 1024,
	songs: 64,
	tracksPerSong: 128,
	clipsPerTrack: 512,
	notesPerClip: 2e4,
	totalNotes: 1e5
}, bo = 1024, xo = 50, So = (e, t, n) => Math.min(n, Math.max(t, e));
function Co(e) {
	return typeof e == "number" && Number.isFinite(e);
}
function J(e, t) {
	return Object.hasOwn(e, t) ? e[t] : void 0;
}
function Y(e, t, n = `${t}s`) {
	return `${e.toLocaleString("en-US")} ${e === 1 ? t : n}`;
}
function wo(e) {
	return Co(e) ? So(e, 20, 400) : null;
}
function To(e) {
	return Co(e) ? So(e, -60, 12) : null;
}
function Eo(e) {
	return Co(e) ? So(Math.round(e), 0, vo) : null;
}
function Do(e) {
	return Co(e) ? So(Math.round(e), 1, vo) : null;
}
function Oo(e) {
	if (typeof e != "object" || !e) return null;
	let t = J(e, "beats"), n = J(e, "unit");
	return typeof t != "number" || !Number.isInteger(t) || t < 1 || t > 32 || typeof n != "number" || !_o.includes(n) ? null : {
		beats: t,
		unit: n
	};
}
function ko(e) {
	if (typeof e != "object" || !e) return null;
	let t = Eo(J(e, "startTick")), n = Eo(J(e, "endTick"));
	return t === null || n === null ? null : {
		enabled: J(e, "enabled") === !0,
		startTick: t,
		endTick: Math.max(t, n)
	};
}
var Ao = /[\u0000-\u001f\u007f]/g;
function jo(e, t) {
	if (typeof e != "string") return t;
	let n = e.slice(0, 400).replace(Ao, " ").trim();
	return n.length > 100 && (n = Array.from(n).slice(0, 100).join("").trim()), n || t;
}
function Mo(e) {
	if (typeof e != "string") return null;
	let t = e.trim();
	return t.length > 0 && t.length <= 128 ? t : null;
}
function No() {
	return {
		beats: 4,
		unit: 4
	};
}
function Po() {
	return {
		enabled: !1,
		startTick: 0,
		endTick: 0
	};
}
function Fo(e, t = yo.totalNotes) {
	let n = [], r = 0, i = 0, a = 0;
	return {
		rackIds: new Set(e),
		notesLeft: Math.max(0, t),
		warn(e) {
			n.length < xo ? n.push(e) : r++;
		},
		overBudget(e) {
			a += e;
		},
		record(e) {
			return typeof e != "object" || !e || Array.isArray(e) ? null : (i += ka(e), e);
		},
		warnings() {
			let e = [...n];
			return a > 0 && e.push(`The project held more notes than the ${Y(yo.totalNotes, "note")} limit, so ${Y(a, "note")} were dropped.`), i > 0 && e.push(`Ignored ${Y(i, "unsafe key")} (such as “__proto__”) in the file.`), r > 0 && e.push(`…and ${Y(r, "more problem")}.`), e;
		}
	};
}
function Io(e, t) {
	let n = t.record(e);
	if (!n) return null;
	let r = Eo(J(n, "tick")), i = Do(J(n, "durationTicks")), a = J(n, "midi"), o = J(n, "velocity");
	if (r === null || i === null || !Co(a) || !Co(o)) return null;
	let s = Math.round(a);
	return s < 0 || s > 127 ? null : {
		tick: r,
		durationTicks: i,
		midi: s,
		velocity: So(o, 0, 1)
	};
}
var Lo = (e, t) => e.tick - t.tick || e.midi - t.midi;
function Ro(e, t, n) {
	return e ? `${t} “${e}”` : `${t} ${n}`;
}
function zo(e) {
	return typeof e == "object" && e && !Array.isArray(e) ? Mo(J(e, "id")) : null;
}
function Bo(e, t, n, r, i, a) {
	if (!Array.isArray(e)) return e !== void 0 && n.warn(`${r} had an unreadable ${i} list, so it is now empty.`), [];
	let o = Math.min(e.length, t);
	e.length > o && n.warn(`${r} held more than ${Y(o, i)}; the extra ${Y(e.length - o, i)} were dropped.`);
	let s = [], c = /* @__PURE__ */ new Set(), l = 0, u = 0;
	for (let t = 0; t < o; t++) {
		let n = zo(e[t]);
		if (n !== null && c.has(n)) {
			u++;
			continue;
		}
		let r = a(e[t]);
		r ? (c.add(r.id), s.push(r)) : l++;
	}
	return l > 0 && n.warn(`${r}: dropped ${Y(l, `unreadable ${i}`)}.`), u > 0 && n.warn(`${r}: dropped ${Y(u, i)} that repeated an earlier ${i}’s id.`), s;
}
function Vo(e, t, n = "A track") {
	let r = t.record(e);
	if (!r) return null;
	let i = Mo(J(r, "id")), a = Eo(J(r, "startTick")), o = Do(J(r, "lengthTicks")), s = J(r, "notes");
	if (i === null || a === null || o === null || !Array.isArray(s)) return null;
	let c = jo(J(r, "name"), ""), l = `${n}, ${Ro(c, "clip", i)}`, u = qa(J(r, "patternId"));
	if (u !== null) return {
		id: i,
		name: c,
		startTick: a,
		lengthTicks: o,
		notes: [],
		patternId: u
	};
	let d = Math.min(s.length, yo.notesPerClip);
	s.length > d && t.warn(`${l} held more than ${Y(d, "note")}; the extra ${Y(s.length - d, "note")} were dropped.`);
	let f = [], p = 0;
	for (let e = 0; e < d; e++) {
		let n = Io(s[e], t);
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
	p > 0 && t.warn(`${l}: dropped ${Y(p, "invalid note")}.`), f.sort(Lo);
	let m = {
		id: i,
		name: c,
		startTick: a,
		lengthTicks: o,
		notes: f
	}, h = Mo(J(r, "poolId"));
	h !== null && (m.poolId = h);
	let g = $r(J(r, "swing"));
	return g && (m.swing = g), m;
}
function Ho(e, t, n = "A song") {
	let r = t.record(e);
	if (!r) return null;
	let i = Mo(J(r, "id"));
	if (i === null) return null;
	let a = jo(J(r, "name"), go), o = `${n}, ${Ro(a, "track", i)}`, s = J(r, "instrumentId"), c = null;
	typeof s == "string" && t.rackIds.has(s) ? c = s : s != null && t.warn(`${o} used an instrument that isn’t in the rack, so it is now silent.`);
	let l = J(r, "volume"), u = To(l);
	u === null && (l !== void 0 && t.warn(`${o} had an unreadable volume, so it was reset to 0 dB.`), u = 0);
	let d = Bo(J(r, "clips"), yo.clipsPerTrack, t, o, "clip", (e) => Vo(e, t, o)), f = {
		id: i,
		name: a,
		instrumentId: c,
		volume: u,
		mute: J(r, "mute") === !0,
		solo: J(r, "solo") === !0,
		clips: d
	}, p = J(r, "role");
	return En(p) && (f.role = p), za(f, r), mo(f, r), f;
}
function Uo(e, t) {
	let n = t.record(e);
	if (!n) return null;
	let r = Mo(J(n, "id"));
	if (r === null) return null;
	let i = jo(J(n, "name"), ho), a = `Song “${i}”`, o = wo(J(n, "bpm"));
	o === null && (t.warn(`${a} had an unreadable tempo, so it was set to 120 BPM.`), o = 120);
	let s = Oo(t.record(J(n, "timeSignature")));
	s ||= (t.warn(`${a} had an unreadable time signature, so it was set to 4/4.`), No());
	let c = Jo(J(n, "tempoChanges"), o, t, a), l = Yo(J(n, "meterChanges"), s, t, a);
	o = c.bpm, s = l.timeSignature;
	let u = ko(t.record(J(n, "loop")));
	u ||= (J(n, "loop") !== void 0 && t.warn(`${a} had an unreadable loop region, so looping was turned off.`), Po());
	let d = J(n, "sourcePpq"), f = typeof d == "number" && Number.isInteger(d) && d >= 1 && d <= 32767 ? d : null, p = Va(J(n, "buses"), t.warn, a), m = new Set(On({ buses: p ?? void 0 }).map((e) => e.id)), h = to(J(n, "patterns"), t.warn, a), g = new Set((h ?? []).map((e) => e.id)), _ = Bo(J(n, "tracks"), yo.tracksPerSong, t, a, "track", (e) => {
		let n = Ho(e, t, a);
		return n && no(Ha(n, m), g, t.warn, a);
	}), v = {
		id: r,
		name: i,
		bpm: o,
		timeSignature: s,
		...c.changes.length ? { tempoChanges: c.changes } : {},
		...l.changes.length ? { meterChanges: l.changes } : {},
		loop: u,
		sourcePpq: f,
		tracks: so(_)
	};
	p && (v.buses = p), h && (v.patterns = h);
	let y = co(J(n, "folded"));
	y.length && (v.folded = y);
	let b = Wr(J(n, "overrides"), t.rackIds, t.warn, a);
	return b && (v.overrides = b), Cs(v, n, {
		trackIds: new Set(_.map((e) => e.id)),
		busIds: m,
		patternIds: g,
		rackIds: t.rackIds
	}, (e) => t.warn(`${a}: ${e}`)), v;
}
function Wo(e) {
	if (!Co(e)) return null;
	let t = Math.round(e);
	return t >= 0 && t <= vo ? t : null;
}
function Go(e, t, n, r, i, a) {
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
function Ko(e, t, n, r, i) {
	if (e.length <= n && t <= n * 4) return e;
	let a = e.slice(0, n);
	return r(` held more than ${Y(n, i)}; the ones past that were dropped.`), a;
}
var qo = (e) => (t) => e ? e.record(t) : typeof t == "object" && t && !Array.isArray(t) ? t : null;
function Jo(e, t, n, r = "A song") {
	let i = (e) => n?.warn(`${r}${e}`), a = Go(e, bo, (e) => {
		let t = Wo(J(e, "tick")), n = J(e, "bpm");
		if (t === null || !Co(n)) return null;
		let r = {
			tick: t,
			bpm: Math.round(So(n, 20, 400) * 1e3) / 1e3
		};
		return J(e, "glide") === !0 && (r.glide = !0), r;
	}, qo(n), i, "tempo change");
	return {
		bpm: a[0]?.tick === 0 ? a.shift().bpm : t,
		changes: Ko(a, Array.isArray(e) ? e.length : 0, bo, i, "tempo change")
	};
}
function Yo(e, t, n, r = "A song") {
	let i = (e) => n?.warn(`${r}${e}`), a = Go(e, 256, (e) => {
		let t = Wo(J(e, "tick")), n = Oo(e);
		return t === null || !n ? null : {
			tick: t,
			beats: n.beats,
			unit: n.unit
		};
	}, qo(n), i, "meter change"), o = a[0]?.tick === 0 ? a.shift() : null, s = o ? {
		beats: o.beats,
		unit: o.unit
	} : t, c = [], l = s, u = 0;
	for (let e of a) (e.beats !== l.beats || e.unit !== l.unit || (e.tick - u) % An(l) !== 0) && (c.push(e), l = e, u = e.tick);
	return {
		timeSignature: s,
		changes: Ko(c, Array.isArray(e) ? e.length : 0, 256, i, "meter change")
	};
}
//#endregion
//#region src/state/game-normalize.ts
var Xo = 128, Zo = 40, Qo = 1e6, X = (e, t) => Object.hasOwn(e, t) ? e[t] : void 0;
function Z(e) {
	return typeof e == "object" && e && !Array.isArray(e) ? e : null;
}
function Q(e) {
	return typeof e == "number" && Number.isFinite(e);
}
var $ = (e, t, n) => Math.min(n, Math.max(t, e));
function $o(e) {
	if (typeof e != "string") return null;
	let t = e.trim();
	return t.length > 0 && t.length <= Xo && !t.includes(":") && !Oa(t) ? t : null;
}
function es(e) {
	if (typeof e != "string") return null;
	let t = e.slice(0, 160).replace(/[\u0000-\u001f\u007f]/g, " ").trim(), n = Array.from(t).slice(0, Zo).join("").trim();
	return n && !Oa(n) ? n : null;
}
function ts(e, t) {
	return Q(e) ? $(e, 0, t) : null;
}
function ns(e, t, n, r, i) {
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
function rs(e) {
	let t = Z(e);
	if (!t) return null;
	let n = $o(X(t, "id")), r = es(X(t, "name")), i = X(t, "min"), a = X(t, "max");
	if (!n || !r || !Q(i) || !Q(a)) return null;
	let o = $(i, -1e6, Qo), s = $(a, -1e6, Qo);
	if (!(s > o)) return null;
	let c = X(t, "step") === "whole" ? "whole" : "continuous", l = X(t, "defaultValue"), u = Q(l) ? $(l, o, s) : o;
	return c === "whole" && (u = $(Math.round(u), o, s)), {
		id: n,
		name: r,
		min: o,
		max: s,
		step: c,
		defaultValue: u,
		riseSeconds: ts(X(t, "riseSeconds"), 60) ?? 0,
		fallSeconds: ts(X(t, "fallSeconds"), 60) ?? 0,
		cushion: Q(X(t, "cushion")) ? $(X(t, "cushion"), 0, s - o) : 0
	};
}
function is(e, t, n) {
	if (!Array.isArray(e)) return null;
	let r = [];
	for (let i of e.slice(0, un.curvePoints)) {
		let e = Z(i), a = e ? X(e, "x") : void 0, o = e ? X(e, "y") : void 0;
		Q(a) && Q(o) && r.push({
			x: $(a, -1e6, Qo),
			y: $(o, t, n)
		});
	}
	return r.sort((e, t) => e.x - t.x), r.length > 0 ? r : null;
}
function as(e) {
	let t = Z(e), n = t ? $o(X(t, "dialId")) : null, r = t ? is(X(t, "points"), 20, 400) : null;
	if (!t || !n || !r) return null;
	let i = {
		dialId: n,
		points: r,
		glideBeats: ts(X(t, "glideBeats"), 64) ?? 0
	};
	return X(t, "landing") === "now" && (i.landing = "now"), i;
}
function os(e) {
	let t = Z(e), n = t ? $o(X(t, "dialId")) : null, r = t ? is(X(t, "points"), -24, 24) : null;
	return t && n && r ? {
		dialId: n,
		points: r
	} : null;
}
function ss(e, t) {
	return typeof e != "string" || e.length > 256 ? !1 : e === "track:volume" || e === "track:pan" || nn(e) ? !0 : e.startsWith("track:send:") ? t.has(e.slice(11)) : Xe(e) !== null;
}
function cs(e, t) {
	let n = $o(X(e, "id")), r = $o(X(e, "dialId")), i = X(e, "trackId");
	return !n || !r || typeof i != "string" || !t.trackIds.has(i) ? null : {
		id: n,
		dialId: r,
		trackId: i
	};
}
function ls(e, t) {
	let n = Z(e), r = n ? X(n, "target") : void 0, i = n ? is(X(n, "points"), 0, 1) : null;
	if (!n || !ss(r, t.busIds) || !i) return null;
	if (nn(r)) {
		let e = $o(X(n, "id")), t = $o(X(n, "dialId"));
		return e && t ? {
			id: e,
			dialId: t,
			target: r,
			points: i
		} : null;
	}
	let a = cs(n, t);
	return a ? {
		...a,
		target: r,
		points: i
	} : null;
}
function us(e) {
	let t = Z(e);
	if (!t) return null;
	let { frequency: n, Q: r } = q, i = X(t, "frequency"), a = X(t, "Q");
	return {
		frequency: Q(i) ? $(i, n.min, n.max) : n.default,
		Q: Q(a) ? $(a, r.min, r.max) : r.default
	};
}
function ds(e, t) {
	let n = Z(e), r = n && cs(n, t), i = n ? X(n, "threshold") : void 0;
	return !r || !Q(i) ? null : {
		...r,
		threshold: $(i, -1e6, Qo),
		fadeSeconds: ts(X(n, "fadeSeconds"), 30) ?? 0
	};
}
function fs(e, t) {
	let n = Z(e), r = n && cs(n, t), i = n ? X(n, "threshold") : void 0, a = n ? X(n, "kind") : void 0, o = n ? X(n, "to") : void 0;
	return !r || !Q(i) || typeof o != "string" || (a === "instrument" ? !t.rackIds.has(o) : a !== "pattern" || !t.patternIds.has(o)) ? null : {
		...r,
		threshold: $(i, -1e6, Qo),
		kind: a,
		to: o
	};
}
function ps(e, t, n) {
	let r = Z(e);
	if (!r) return null;
	let i = {
		links: ns(X(r, "links"), un.links, n, "dial link", (e) => ls(e, t)),
		layers: ns(X(r, "layers"), un.layers, n, "layer rule", (e) => ds(e, t)),
		swaps: ns(X(r, "swaps"), un.swaps, n, "swap rule", (e) => fs(e, t))
	}, a = as(X(r, "tempo"));
	a && (i.tempo = a);
	let o = os(X(r, "transpose"));
	return o && (i.transpose = o), i;
}
function ms(e) {
	return !e.tempo && !e.transpose && e.links.length === 0 && e.layers.length === 0 && e.swaps.length === 0;
}
function hs(e) {
	return Q(e) ? $(Math.round(e), 0, vo) : null;
}
function gs(e) {
	let t = Z(e);
	if (!t) return null;
	let n = $o(X(t, "id")), r = es(X(t, "name")), i = hs(X(t, "startTick")), a = hs(X(t, "endTick"));
	if (!n || !r || i === null || a === null) return null;
	let o = {
		id: n,
		name: r,
		startTick: i,
		endTick: Math.max(i, a)
	}, s = Sa(X(t, "key"));
	return s && (o.key = s), o;
}
function _s(e, t) {
	return Array.isArray(e) ? ns(e, un.sections, t, "section", gs) : null;
}
function vs(e, t) {
	let n = Z(e);
	if (!n) return null;
	let r = $o(X(n, "id")), i = es(X(n, "name")), a = X(n, "action"), o = X(n, "landing");
	if (!r || !i || !sn.includes(a)) return null;
	let s = {
		id: r,
		name: i,
		action: a,
		landing: cn.includes(o) ? o : "bar",
		seconds: ts(X(n, "seconds"), 30) ?? 0
	}, c = X(n, "sectionId");
	return typeof c == "string" && t.has(c) && (s.sectionId = c), s;
}
function ys(e, t, n) {
	if (!Array.isArray(e)) return null;
	let r = /* @__PURE__ */ new Set();
	return ns(e, un.cues, n, "cue", (e) => {
		let n = vs(e, t);
		return !n || r.has(n.name) ? null : (r.add(n.name), n);
	});
}
function bs(e) {
	let t = Z(e);
	if (!t) return null;
	let n = mn(), r = X(t, "mode"), i = X(t, "muffleHz");
	return {
		mode: ln.includes(r) ? r : n.mode,
		muffleHz: Q(i) ? $(i, 50, dn) : n.muffleHz,
		fadeSeconds: ts(X(t, "fadeSeconds"), 30) ?? n.fadeSeconds
	};
}
function xs(e) {
	let t = Z(e);
	if (!t) return null;
	let n = $o(X(t, "id")), r = hs(X(t, "startTick")), i = X(t, "lengthTicks"), a = X(t, "root"), o = X(t, "quality");
	if (!n || r === null || r >= vo || !Q(i) || !Q(a) || !wa(o)) return null;
	let s = {
		id: n,
		startTick: r,
		lengthTicks: $(Math.round(i), 1, vo - r),
		root: xa(a),
		quality: o
	}, c = X(t, "bass");
	Q(c) && xa(c) !== s.root && (s.bass = xa(c));
	let l = X(t, "confidence");
	return Q(l) && (s.confidence = $(l, 0, 1)), s;
}
function Ss(e, t) {
	if (!Array.isArray(e)) return null;
	let n = ns(e, Ta, t, "chord", xs).sort((e, t) => e.startTick - t.startTick), r = [];
	for (let e of n) {
		let t = r.at(-1);
		t && Ea(t) > e.startTick && (t.startTick === e.startTick ? r.pop() : r[r.length - 1] = {
			...t,
			lengthTicks: e.startTick - t.startTick
		}), r.push(e);
	}
	return r;
}
function Cs(e, t, n, r) {
	let i = ps(X(t, "rules"), n, r);
	i && !ms(i) && (e.rules = i);
	let a = _s(X(t, "sections"), r);
	a?.length && (e.sections = a);
	let o = ys(X(t, "cues"), new Set((a ?? []).map((e) => e.id)), r);
	o && (e.cues = o);
	let s = bs(X(t, "pause"));
	s && (e.pause = s);
	let c = us(X(t, "masterFilter"));
	c && !an(c) && (e.masterFilter = c);
	let l = Sa(X(t, "key"));
	l && (e.key = l);
	let u = Ss(X(t, "chords"), r);
	u?.length && (e.chords = u);
}
//#endregion
//#region src/player/bundle.ts
var ws = "sine-sculptor-song", Ts = 5, Es = un.dials;
function Ds(e) {
	let t = {};
	for (let { name: n, ...r } of e) !Oa(n) && !Object.hasOwn(t, n) && (t[n] = r);
	return t;
}
function Os(e) {
	return Object.entries(e).map(([e, t]) => ({
		...t,
		name: e
	}));
}
function ks() {
	return { limiterDb: -1 };
}
function As(e, t, n = {}) {
	let { song: r, instruments: i } = Hr(Qr(e), t), { chords: a, ...o } = r, s = new Set(i.map((e) => e.id));
	for (let n of e.rules?.swaps ?? []) {
		let r = n.kind === "instrument" && !s.has(n.to) ? t.find((e) => e.id === n.to) : void 0;
		r && (s.add(r.id), i.push(Vr(r, e)));
	}
	return {
		format: ws,
		version: o.tempoChanges?.length || o.meterChanges?.length ? 5 : i.some(ha) ? 4 : i.some(js) ? 3 : 2,
		name: o.name,
		song: o,
		instruments: i,
		dials: Ps(n.dials ?? {}, []),
		tempo: n.tempo ?? null,
		mix: Ms(n.mix)
	};
}
function js(e) {
	let t = e.kit?.pads;
	return !!t && (e.layers.length !== t.length || t.some((e, t) => e.layers.length !== 1 || e.layers[0] !== t));
}
function Ms(e) {
	let t = ks();
	if (typeof e != "object" || !e || Array.isArray(e)) return t;
	let n = J(e, "limiterDb");
	return Ns(n) && (t.limiterDb = Math.min(0, Math.max(-24, n))), t;
}
function Ns(e) {
	return typeof e == "number" && Number.isFinite(e);
}
function Ps(e, t) {
	let n = {};
	if (typeof e != "object" || !e || Array.isArray(e)) return n;
	let r = /* @__PURE__ */ new Set();
	for (let i of Object.keys(e).slice(0, Es)) {
		if (Oa(i)) continue;
		let a = J(e, i), o = typeof a == "object" && a && !Array.isArray(a) ? a : {}, s = rs({
			id: J(o, "id") ?? i,
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
function Fs(e, t, n) {
	if (typeof e != "object" || !e || Array.isArray(e)) return null;
	let r = e, i = J(r, "dial"), a = wo(J(r, "bpmAtMin")), o = wo(J(r, "bpmAtMax"));
	return typeof i != "string" || !Object.hasOwn(t, i) || a === null || o === null ? (n.push("The tempo rule was unreadable, so the song keeps one tempo."), null) : {
		dial: i,
		bpmAtMin: a,
		bpmAtMax: o
	};
}
function Is(e) {
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
	if (!Ns(r) || r < 1) return {
		ok: !1,
		error: "The song bundle has no format version."
	};
	if (r > 5) return {
		ok: !1,
		error: `This bundle needs a newer player (bundle format ${r}).`
	};
	let i = [], a = [], o = J(n, "instruments");
	if (Array.isArray(o)) {
		let e = /* @__PURE__ */ new Set();
		for (let t of o.slice(0, yo.rack)) {
			let n = va(t, { legacy: r < 4 });
			n.ok ? e.has(n.patch.id) || (e.add(n.patch.id), a.push(n.patch)) : i.push(`An instrument was dropped: ${n.error}`);
		}
	}
	let s = Fo(a.map((e) => e.id)), c = Uo(J(n, "song"), s);
	if (!c) return {
		ok: !1,
		error: "The song bundle holds no readable song."
	};
	i.push(...s.warnings());
	let l = Ps(J(n, "dials"), i);
	return {
		ok: !0,
		bundle: {
			format: ws,
			version: r < 2 ? 1 : r < 3 ? 2 : r < 4 ? 3 : r < 5 ? 4 : 5,
			name: jo(J(n, "name"), c.name),
			song: c,
			instruments: a,
			dials: l,
			tempo: Fs(J(n, "tempo"), l, i),
			mix: Ms(J(n, "mix"))
		},
		warnings: i
	};
}
//#endregion
//#region src/player/core.ts
var Ls = .05, Rs = .005;
function zs(e) {
	let t = Mn(e);
	return t <= 0 ? e : {
		...e,
		loop: {
			enabled: !0,
			startTick: 0,
			endTick: Ar(e).barLineAtOrAfter(t)
		}
	};
}
var Bs = {
	mode: "freeze",
	muffleHz: dn,
	fadeSeconds: 0
};
function Vs(e) {
	return e.mode === "freeze" && e.muffleHz >= 2e4 && e.fadeSeconds === 0;
}
function Hs(e, t) {
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
			...yn(e),
			tempo: {
				dialId: r.id,
				points: i,
				glideBeats: 0,
				landing: "now"
			}
		}
	};
}
function Us(e, t, n = {}) {
	let r = la(e, {
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
				n = Is(e);
			} catch {
				return {
					ok: !1,
					error: "The song bundle could not be read."
				};
			}
			if (!n.ok) return n;
			let i = n.bundle, l = Hs(a ? zs(i.song) : i.song, i);
			i.version === 1 && !l.pause && (l = {
				...l,
				pause: Bs
			}), c = Vs(vn(l)) ? null : vn(l), r.setGame(null, [], []), t.setLimiter(i.mix.limiterDb);
			let u = Os(i.dials);
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
		setVolume(e, n = Ls) {
			o || t.setVolume(e, Math.max(Rs, n));
		},
		setMuffle(e, t = Ls) {
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
function Ws(e, t = {}) {
	let n = new e.Gain(Fn(t.volumeDb ?? 0)), r = new e.Limiter(-1), i = gr(e);
	n.connect(r), r.connect(i.input), i.output.connect(t.destination ?? e.getDestination());
	let a = Us(mr(e), {
		destination: sr(n),
		setVolume: (t, r) => n.gain.rampTo(Fn(t), r, e.immediate()),
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
export { ws as BUNDLE_FORMAT, Ts as BUNDLE_VERSION, As as buildBundle, Ds as bundleDials, Ws as createPlayer, ks as defaultMix, Os as dialList, Is as parseBundle };
