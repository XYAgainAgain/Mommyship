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
	return i.sustain !== void 0 && s.push(g(`${e}.sustain`, `${n}Sustain`, t, {
		min: 0,
		max: 1,
		default: i.sustain,
		curve: "linear",
		step: .01,
		unit: ""
	}, ...a.sustain)), s.push(g(`${e}.release`, `${n}Release`, t, o(8, i.release), ...a.release)), s;
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
	if (n !== "envelope.attackCurve") {
		he(e, n, r);
		return;
	}
	for (let n of D[t] ?? ["envelope"]) he(e, `${n}.attackCurve`, r);
}
var k = () => g("detune", "Detune", "Pitch", {
	min: -1200,
	max: 1200,
	default: 0,
	curve: "linear",
	step: 1,
	unit: "cents"
}, "Shifts the pitch of the whole voice in cents; 100 cents is one semitone and 1200 is an octave.", "Small amounts against another layer thicken the sound with a slow beating; 1200 or -1200 moves the layer a full octave."), A = () => g("portamento", "Glide", "Pitch", {
	min: 0,
	max: 1,
	default: 0,
	curve: "linear",
	step: .005,
	unit: "s"
}, "How long the pitch slides from one note to the next. It only applies when a voice moves to a new note, so it is clearest with Voices set to 1.", "At 0 notes jump cleanly; small values add a vocal slur between notes, and longer ones give the swoop of a slide guitar or a 303 bass line.");
function j(e) {
	let t = [g("harmonicity", "Mod ratio", "Modulation", {
		min: .25,
		max: 8,
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
function M() {
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
		k(),
		A()
	];
}
function N(e) {
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
		...j(e),
		k(),
		A()
	];
}
var P = "The resting cutoff frequency of the filter, the brightness the note settles back to when the filter envelope closes.", F = "Lower values make the voice darker and more muffled; higher values let more buzz and sparkle through.";
function I() {
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
		}, P, F),
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
		k(),
		A()
	];
}
function L(e) {
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
		}, P, F),
		...w(`${t}envelope`, n, r, "amp", {
			attack: .01,
			decay: .01,
			sustain: 1,
			release: .5
		})
	];
}
function R() {
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
		...L(0),
		...L(1),
		k(),
		A()
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
		k()
	];
}
function z() {
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
		k()
	];
}
function te() {
	let e = g("resonance", "Sustain", "String", {
		min: .1,
		max: .99,
		default: .7,
		curve: "linear",
		step: .01,
		unit: ""
	}, "How much energy the virtual string keeps on each pass, which sets how long the note rings.", "Low values give a short, dead thunk like pizzicato; values near the top ring out like a harp.");
	return e.rebuild = !0, [
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
		e,
		g("release", "Release", "String", {
			min: .01,
			max: 4,
			default: 1,
			curve: "log",
			unit: "s"
		}, "How long the string takes to stop ringing after you let go of the key.", "Short values mute the string like a palm resting on it; long ones let it ring naturally.")
	];
}
function ne() {
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
var re = [
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
function ie() {
	let e = _("vowelA", "Vowel", "Syllable", re, "o", "The vowel each note sings in plain vowel mode, and where its glide starts.", "Ah and oh sound open and warm, ee and oo sound closed and small; eh sits in between."), t = _("vowelB", "Glide-to vowel", "Syllable", re, "u", "The vowel a held note drifts toward in plain vowel mode.", "Oh gliding to oo gives a rounded “ohw”; ah gliding to ee gives a bright “eye”.");
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
var B = {
	Synth: M(),
	AMSynth: N(!1),
	FMSynth: N(!0),
	MonoSynth: I(),
	DuoSynth: R(),
	MembraneSynth: ee(),
	MetalSynth: z(),
	PluckSynth: te(),
	NoiseSynth: ne(),
	FormantVoice: ie()
}, ae = {
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
for (let e of m) for (let t of B[e]) Object.hasOwn(ae[e], t.path) && (t.modulatable = !0);
function oe(e, t) {
	return Object.hasOwn(ae[e], t) ? ae[e][t] : void 0;
}
function V(e, t) {
	let { min: n, max: r } = e;
	if (!(r > n)) return 0;
	let i = Math.min(r, Math.max(n, t)), a = e.curve === "log" && n > 0 ? Math.log(i / n) / Math.log(r / n) : (i - n) / (r - n);
	return Number.isFinite(a) ? a : 0;
}
function se(e, t) {
	let { min: n, max: r } = e, i = Math.min(1, Math.max(0, Number.isFinite(t) ? t : 0));
	return e.curve === "log" && n > 0 ? n * (r / n) ** i : n + (r - n) * i;
}
function ce(e, t) {
	return B[e].find((e) => e.path === t);
}
function le(e) {
	let t = {};
	for (let n of B[e]) t[n.path] = n.default;
	return t;
}
function ue(e, t) {
	if (e.kind === "choice") return typeof t == "string" && e.choices.some((e) => e.value === t) ? t : void 0;
	if (typeof t != "number" || !Number.isFinite(t)) return;
	let n = Math.min(e.max, Math.max(e.min, t));
	return e.step === 1 && (n = Math.round(n)), n;
}
function de(e, t) {
	return fe(B[e], t);
}
function fe(e, t) {
	let n = typeof t == "object" && t ? t : {}, r = {};
	for (let t of e) {
		let e = Object.prototype.hasOwnProperty.call(n, t.path);
		r[t.path] = (e ? ue(t, n[t.path]) : void 0) ?? t.default;
	}
	return r;
}
function pe(e, t, n) {
	let r = e.visibleWhen;
	if (!r) return !0;
	let i = t[r.path] ?? ce(n, r.path)?.default;
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
	for (let r of B[e]) pe(r, t, e) && O(n, e, r.path, t[r.path] ?? r.default);
	return n;
}
function _e(e, t, n) {
	let r = {};
	for (let i of B[e]) i.path !== n && i.visibleWhen?.path !== n || !pe(i, t, e) || O(r, e, i.path, t[i.path] ?? i.default);
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
}, Te = (e) => (e.modulatable = !0, e), Ee = (e) => (e.rebuild = !0, e), De = [
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
function Oe() {
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
		Te(g("frequency", "Cutoff", "Filter", {
			min: 20,
			max: 2e4,
			default: 1200,
			curve: "log",
			unit: "Hz"
		}, "Where the filter starts to act on the whole instrument, after every layer is mixed.", "Sweep it slowly for the classic filter rise; an LFO on it gives a wah or a slow throb.")),
		Te(g("Q", "Resonance", "Filter", {
			min: .1,
			max: 20,
			default: 1,
			curve: "log",
			step: .1,
			unit: ""
		}, "How much the filter emphasizes the frequencies right at the cutoff.", "Higher values add a vocal, whistling peak that sings as the cutoff moves; very high values squeal."))
	];
}
function ke() {
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
function Ae() {
	return [g("bits", "Bits", "Bitcrusher", {
		min: 1,
		max: 16,
		default: 4,
		curve: "linear",
		step: 1,
		unit: "bits"
	}, "How many volume steps the sound is rounded to; each bit doubles the number of steps.", "Around 8 bits sounds like an old console sample; 3 or 4 bits turn into a fizzy, broken-speaker crunch."), we()];
}
function je() {
	return [
		Te(g("frequency", "Rate", "Chorus", {
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
function Me() {
	return [
		Te(g("frequency", "Rate", "Phaser", {
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
		Te(g("Q", "Resonance", "Phaser", {
			min: .1,
			max: 20,
			default: 10,
			curve: "log",
			step: .1,
			unit: ""
		}, "How sharp and pronounced the sweeping notches are.", "Higher values make the sweep whistle and stand out; lower values keep it soft.")),
		Ee(g("stages", "Stages", "Phaser", {
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
function Ne() {
	return [
		Te(g("frequency", "Rate", "Tremolo", {
			min: .1,
			max: 40,
			default: 6,
			curve: "log",
			step: .01,
			unit: "Hz"
		}, "How fast the volume pulses, in pulses per second.", "Around 4–8 Hz is the classic surf-amp shimmer; faster rates flutter like a helicopter.")),
		Te(g("depth", "Depth", "Tremolo", {
			min: 0,
			max: 1,
			default: .5,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How far the volume dips on each pulse.", "Low values add a gentle pulse; at 1 the sound chops all the way to silence.")),
		_("type", "Shape", "Tremolo", De, "sine", "The shape of each volume pulse.", "Sine is smooth and gentle; square chops hard like a gate, and sawtooth gives a pumping swell."),
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
var Pe = (e, t, n, r) => Te(g(e, t, "EQ", {
	min: -24,
	max: 12,
	default: 0,
	curve: "linear",
	step: .1,
	unit: "dB"
}, n, r));
function Fe() {
	return [
		Pe("low", "Low gain", "Boosts or cuts everything below the low split.", "Cut it to stop a lead muddying the bass; boost it for a fatter bottom end."),
		Pe("mid", "Mid gain", "Boosts or cuts the band between the two splits, where most of a sound’s body lives.", "Cutting scoops the sound out like a metal guitar tone; boosting pushes it forward like a telephone."),
		Pe("high", "High gain", "Boosts or cuts everything above the high split.", "Boost for air and sparkle; cut to tame a harsh, fizzy top."),
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
function Ie() {
	return [
		Te(g("threshold", "Threshold", "Compressor", {
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
var Le = {
	filter: Oe(),
	distortion: ke(),
	bitcrusher: Ae(),
	chorus: je(),
	phaser: Me(),
	tremolo: Ne(),
	eq: Fe(),
	compressor: Ie()
};
function Re(e) {
	return Le[e];
}
function ze(e, t) {
	return Le[e].find((e) => e.path === t);
}
var Be = [
	"reverb",
	"delay",
	"chorus"
], Ve = {
	reverb: "Reverb",
	delay: "Delay",
	chorus: "Chorus"
};
function He(e) {
	return typeof e == "string" && Be.includes(e);
}
var Ue = {
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
function We(e) {
	return Ue[e];
}
function Ge(e) {
	return fe(Ue[e], {});
}
function Ke(e, t) {
	return fe(Ue[e], t);
}
var qe = [
	"sine",
	"triangle",
	"square",
	"sawtooth"
], H = {
	shape: _("shape", "Shape", "LFO", De, "sine", "The shape of the slow wave that turns the knobs it is connected to.", "Sine and triangle sweep smoothly back and forth; square flips between two settings, and sawtooth ramps up and snaps back."),
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
function Je(e, t) {
	return e.sync ? 1 / Ce(e.division, t) : Number.isFinite(e.hz) ? Math.min(H.hz.max, Math.max(H.hz.min, e.hz)) : H.hz.default;
}
var Ye = {
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
function Xe(e, t) {
	return `layer:${e}:${t}`;
}
function Ze(e) {
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
function Qe(e, t) {
	let n = Ze(t);
	if (!n) return null;
	if (n.kind === "layer") {
		let t = e.layers[n.layer];
		if (!t) return null;
		if (n.path === "volume") return Ye;
		let r = ce(t.voiceType, n.path);
		return r?.kind === "number" && oe(t.voiceType, n.path) ? r : null;
	}
	let r = e.effects?.find((e) => e.id === n.effectId), i = r ? ze(r.type, n.path) : void 0;
	return i?.kind === "number" && i.modulatable ? i : null;
}
function $e(e, t) {
	let n = Qe(e, t), r = Ze(t);
	if (!n || !r) return null;
	let i;
	if (r.kind === "layer") {
		let t = e.layers[r.layer];
		i = r.path === "volume" ? t.volume : t.params[r.path];
	} else i = e.effects.find((e) => e.id === r.effectId).params[r.path];
	return typeof i == "number" && Number.isFinite(i) ? i : n.default;
}
function et(e, t, n) {
	let r = V(e, t), i = Math.min(1, Math.abs(Number.isFinite(n) ? n : 0)) / 2, a = se(e, r - i), o = se(e, r + i);
	return n < 0 ? [o, a] : [a, o];
}
var U = (e, t) => Object.hasOwn(e, t) ? e[t] : void 0;
function tt(e) {
	if (typeof e != "string") return null;
	let t = e.trim();
	return t.length > 0 && t.length <= 64 && !t.includes(":") && ![
		"__proto__",
		"prototype",
		"constructor"
	].includes(t) ? t : null;
}
var nt = (e, t, n, r) => typeof e == "number" && Number.isFinite(e) ? Math.min(n, Math.max(t, e)) : r;
function rt(e) {
	if (typeof e != "object" || !e || Array.isArray(e)) return null;
	let t = e, n = tt(U(t, "id")), r = U(t, "type");
	return n === null || !ye(r) ? null : {
		id: n,
		type: r,
		bypass: U(t, "bypass") === !0,
		params: fe(Le[r], U(t, "params"))
	};
}
function it(e, t) {
	if (typeof e != "object" || !e || Array.isArray(e)) return null;
	let n = e, r = tt(U(n, "id"));
	if (r === null) return null;
	let i = U(n, "shape"), a = U(n, "division"), o = [], s = U(n, "connections");
	if (Array.isArray(s)) for (let e of s.slice(0, 64)) {
		if (o.length >= 16) break;
		if (typeof e != "object" || !e) continue;
		let n = U(e, "target");
		typeof n == "string" && t(n) && !o.some((e) => e.target === n) && o.push({
			target: n,
			depth: nt(U(e, "depth"), -1, 1, 1)
		});
	}
	return {
		id: r,
		shape: qe.includes(i) ? i : "sine",
		sync: U(n, "sync") !== !1,
		division: typeof a == "string" && Se(a) !== null ? a : H.division.default,
		hz: nt(U(n, "hz"), H.hz.min, H.hz.max, H.hz.default),
		depth: nt(U(n, "depth"), 0, 1, H.depth.default),
		connections: o
	};
}
function at(e) {
	let t = [];
	if (!Array.isArray(e)) return t;
	for (let n of e.slice(0, 24)) {
		if (t.length >= 6) break;
		let e = rt(n);
		e && !t.some((t) => t.id === e.id) && t.push(e);
	}
	return t;
}
function ot(e, t) {
	let n = [];
	if (!Array.isArray(e)) return n;
	let r = /* @__PURE__ */ new Set(), i = (e) => !r.has(e) && Qe(t, e) !== null;
	for (let t of e.slice(0, 12)) {
		if (n.length >= 3) break;
		let e = it(t, i);
		if (e && !n.some((t) => t.id === e.id)) {
			for (let t of e.connections) r.add(t.target);
			n.push(e);
		}
	}
	return n;
}
//#endregion
//#region src/engine/formant-voice.ts
function st() {
	let { "envelope.attack": e, "envelope.release": t, ...n } = le("FormantVoice");
	return ct({
		...n,
		attack: e,
		release: t
	}, {});
}
function ct(e, t) {
	let n = { ...e }, r = n;
	for (let [e, i] of Object.entries(t)) if (e === "envelope" && typeof i == "object" && i) {
		let e = i;
		typeof e.attack == "number" && (n.attack = e.attack), typeof e.release == "number" && (n.release = e.release);
	} else Object.hasOwn(r, e) && typeof i == typeof r[e] && (r[e] = i);
	return n;
}
var lt = .35, ut = .47, dt = 1.6, ft = .12, pt = 6e3, W = .006, mt = .05, ht = Array.from({ length: 40 }, (e, t) => 1 / (t + 1) ** 1.6);
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
		this.Tone = e, this.p = ct(st(), t);
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
		this.puff = r(new e.Gain(lt)), this.breathSig.connect(o.gain), a.connect(o), o.connect(this.puff), this.puff.connect(i);
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
		let t = ct(this.p, e), n = this.p;
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
			e.filter.Q.cancelAndHoldAtTime(t), e.filter.Q.setValueAtTime(s, t), c.cancelAndHoldAtTime(t), l.cancelAndHoldAtTime(t), c.setValueAtTime(x ? x[n] : r, t), l.setValueAtTime((S ? S[n] : i) * dt, t), c.linearRampToValueAtTime(r, E), l.linearRampToValueAtTime(i * dt, E), a.morph > .01 && (c.setValueAtTime(r, D), c.linearRampToValueAtTime(v[n][0], O), l.setValueAtTime(i * dt, D), l.linearRampToValueAtTime(v[n][1] * dt, O));
		});
		let P = this.amp.gain;
		if (P.cancelAndHoldAtTime(t), P.linearRampToValueAtTime(0, t + .004), b?.kind === "nasal") {
			let e = t + .004 + Math.max(.016, a.attack);
			P.linearRampToValueAtTime(1 - .65 * y, e), P.linearRampToValueAtTime(1, Math.max(E, e + .01));
		} else P.setValueAtTime(0, T), P.linearRampToValueAtTime(1, T + Math.max(.004, a.attack));
		let F = this.env.gain;
		F.cancelAndHoldAtTime(t), F.linearRampToValueAtTime(.5 + .5 * n, t + .005);
		let I = this.puff.gain;
		I.cancelAndHoldAtTime(t), I.setValueAtTime(ut, t), I.linearRampToValueAtTime(lt, t + .15);
		let L = this.cGain.gain;
		if (L.cancelAndHoldAtTime(t), L.linearRampToValueAtTime(0, t + W), b?.burst) {
			let [e, n, r] = b.burst, i = t + r + w, a = Math.min(pt, e * Math.sqrt(h));
			this.cFilter.frequency.cancelAndHoldAtTime(t), this.cFilter.Q.cancelAndHoldAtTime(t), this.cFilter.frequency.linearRampToValueAtTime(a, t + W), this.cFilter.Q.linearRampToValueAtTime(n, t + W), L.linearRampToValueAtTime(ft * y, t + W * 2), L.exponentialRampToValueAtTime(1e-4, Math.max(i, t + W * 3)), L.linearRampToValueAtTime(0, Math.max(i, t + W * 3) + W);
		}
	}
	release(e) {
		let t = this.p, n = this.env.gain;
		if (n.cancelAndHoldAtTime(e), n.linearRampToValueAtTime(0, e + t.release), t.pitchDrop > 0 && this.curHz > 0) {
			let n = this.osc.frequency;
			n.cancelAndHoldAtTime(e), n.exponentialRampToValueAtTime(this.curHz * 2 ** (-t.pitchDrop / 1200), e + t.release);
		}
		let r = this.cGain.gain;
		r.cancelAndHoldAtTime(e), r.linearRampToValueAtTime(0, e + W), this.sleepAfter(e + Math.max(t.release, W) + mt);
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
	59: "Ride 2"
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
function jt(e) {
	return 440 * 2 ** ((e - 69) / 12);
}
function Mt(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(16, Math.max(1, Math.round(e))) : 1;
}
function Nt(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(6, Math.max(-60, e)) : 0;
}
function Pt(e, t) {
	try {
		e.set(t);
	} catch (t) {
		throw e.dispose(), t;
	}
}
var Ft = .004;
function It(e, t, n) {
	let r = -Infinity, i = (t) => (r = Math.max(t ?? e.immediate(), r + Ft), r), a = (t) => Math.max(t ?? e.immediate(), r);
	if (t === "FormantVoice") {
		let t = new _t(e, n);
		return {
			attack: (e, n, r, a) => t.sing(e, i(n), r, a),
			release: (e) => t.release(a(e)),
			startsAfter: (e) => r > e,
			node: t
		};
	}
	if (t === "NoiseSynth") {
		let t = new e.NoiseSynth();
		return Pt(t, n), {
			attack: (e, n, r) => void t.triggerAttack(i(n), r),
			release: (e) => void t.triggerRelease(a(e)),
			startsAfter: (e) => r > e,
			node: t
		};
	}
	let o = e[t], s = new o();
	return Pt(s, n), {
		attack: (e, t, n) => void s.triggerAttack(e, i(t), n),
		release: (e) => void s.triggerRelease(a(e)),
		startsAfter: (e) => r > e,
		node: s
	};
}
var Lt = {
	filter: "Filter",
	distortion: "Distortion",
	bitcrusher: "BitCrusher",
	chorus: "Chorus",
	phaser: "Phaser",
	tremolo: "Tremolo",
	eq: "EQ3",
	compressor: "Compressor"
};
function Rt(e, t, n) {
	let r = e[Lt[t]], i = new r({ ...n });
	return (t === "chorus" || t === "tremolo") && i.start?.(), i;
}
function zt(e, t) {
	let n = e;
	for (let e of t.split(".")) {
		if (n === null || typeof n != "object" && typeof n != "function" || !(e in n)) return;
		n = n[e];
	}
	return n;
}
function Bt(e) {
	return typeof e == "object" && !!e && typeof e.setValueAtTime == "function" && typeof e.cancelScheduledValues == "function";
}
var Vt = .005;
function Ht(t, n, r, i = {}) {
	let a = new t.Gain(1), o = r ?? t.getDestination();
	a.connect(o);
	let s = !1, c = i.bpm !== void 0 && Number.isFinite(i.bpm) && i.bpm > 0 ? i.bpm : 120, l = 0, u = [], d = /* @__PURE__ */ new Map(), f = (e) => {
		let n = ge(e.voiceType, e.params);
		e.voices = [];
		for (let r = 0; r < e.polyphony; r++) {
			let r = It(t, e.voiceType, n);
			r.node.connect(e.choke ?? e.volume), e.voices.push(r);
		}
		e.alloc.reset(e.polyphony);
	}, p = (e) => {
		for (let t of e.voices) t.node.dispose();
		e.voices = [];
	}, m = vt(n) ? n.kit.pads : null, h = yt(n), g = m ? Ct(m, h.length) : null, _ = h.map((n, r) => {
		let i = Mt(n.polyphony), o = Nt(n.volume), s = {
			voiceType: n.voiceType,
			params: de(n.voiceType, n.params),
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
		n && (n.cancelScheduledValues(t), n.setTargetAtTime(0, t, Vt));
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
			s !== null && (u = !0), e.voices[o]?.attack(jt(c), i, r, b(e, c, a));
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
		let t = Ze(e);
		if (!t) return [];
		if (t.kind === "layer") {
			let e = _[t.layer];
			if (!e) return [];
			if (t.path === "volume") return Bt(e.volume.volume) ? [e.volume.volume] : [];
			let n = oe(e.voiceType, t.path);
			return n ? e.voices.map((e) => zt(e.node, n)).filter(Bt) : [];
		}
		let n = u.find((e) => e.id === t.effectId);
		if (!n?.node || !ze(n.type, t.path)?.modulatable) return [];
		let r = zt(n.node, t.path);
		return Bt(r) ? [r] : [];
	}, w = (e, t, n = S()) => {
		let r = Qe(n, e.target), i = $e(n, e.target);
		if (!r || i === null) return;
		let [a, o] = et(r, i, t.patch.depth * e.depth);
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
		let r = $e(S(), e.target), i = t.immediate();
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
			e.node = Rt(t, e.type, e.params);
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
		for (let i of Re(e.type)) {
			let a = ue(i, t[i.path]) ?? i.default;
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
			let o = rt(a);
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
	}, ee = (e, t) => {
		for (let n of e.links) {
			t(n.target) ? D(n) : E(n);
			try {
				n.lfo.dispose();
			} catch {}
		}
		e.links = [];
	}, z = (e) => {
		let n = t.immediate(), r = Je(e.patch, c);
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
	}, te = (e, t) => e.connections.length === t.connections.length && e.connections.every((e, n) => e.target === t.connections[n].target), ne = (e) => {
		let t = ot(e, S()), n = new Set(t.map((e) => e.id));
		for (let [e, t] of d) n.has(e) || (ee(t, () => !0), d.delete(e));
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
			if (n.patch = e, !te(a, e) || n.links.length !== t.length) {
				let e = new Set(t.map((e) => e.target));
				ee(n, (t) => !e.has(t)), r.push(n);
				continue;
			}
			i.push([n, a]);
		}
		for (let e of r) z(e);
		for (let [e, t] of i) {
			let n = e.patch, r = n.connections, i = Je(n, c), a = Je(t, c) !== i;
			for (let o of e.links) t.shape !== n.shape && (o.lfo.type = n.shape), a && (o.lfo.frequency.value = i), o.depth = r.find((e) => e.target === o.target)?.depth ?? o.depth;
			if (t.depth !== n.depth || t.connections !== r) {
				let t = S();
				for (let n of e.links) w(n, e, t);
			}
		}
	};
	n.effects?.length && R(n.effects), n.lfos?.length && ne(n.lfos);
	let re = (e) => {
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
			let a = jt(e), o = !1;
			for (let t of _) {
				let { voice: s, stolen: c } = t.alloc.noteOn(e);
				c !== null && (o = !0), t.voices[s]?.attack(a, n, i, b(t, e, r));
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
						let e = It(t, n.voiceType, i);
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
			let i = ce(r.voiceType, t), a = i ? ue(i, n) : void 0;
			if (!i || a === void 0) return;
			if (r.params[t] = a, i.rebuild) {
				M(e);
				return;
			}
			let o = _e(r.voiceType, r.params, t);
			if (Object.keys(o).length > 0) try {
				for (let e of r.voices) e.node.set(o);
			} catch {
				M(e);
			}
			j(`layer:${e}:${t}`);
		},
		setLayerVolume(e, t) {
			let n = _[e];
			!s && n && Number.isFinite(t) && (n.db = Nt(t), n.volume.volume.value = n.db, j(`layer:${e}:volume`));
		},
		setEffects: (e) => re(() => R(Array.isArray(e) ? e : [])),
		setLfos: (e) => re(() => ne(Array.isArray(e) ? e : [])),
		setTempo(e) {
			if (!(s || !Number.isFinite(e) || e <= 0 || e === c)) {
				c = e;
				for (let e of d.values()) {
					if (!e.patch.sync) continue;
					let t = Je(e.patch, c);
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
					let t = zt(i.node, "detune");
					if (!Bt(t) || t.overridden) continue;
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
				for (let e of d.values()) ee(e, () => !1);
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
var Ut = ["master:filter.frequency", "master:filter.Q"];
function Wt(e) {
	return Ut.includes(e);
}
var G = {
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
function Gt() {
	return {
		frequency: G.frequency.default,
		Q: G.Q.default
	};
}
function Kt(e) {
	return e.frequency >= G.frequency.max && Math.abs(e.Q - G.Q.default) < 1e-6;
}
function qt(e) {
	return e.masterFilter ?? Gt();
}
var Jt = [
	"jump",
	"stop",
	"fadeOut",
	"tapeStop"
], Yt = [
	"now",
	"beat",
	"bar"
], Xt = [
	"freeze",
	"muffled",
	"stop"
], Zt = {
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
}, Qt = 2e4, $t = .75, en = "game-over";
function tn() {
	return {
		mode: "freeze",
		muffleHz: 400,
		fadeSeconds: .4
	};
}
function nn() {
	return [{
		id: en,
		name: "Game over",
		action: "tapeStop",
		landing: "now",
		seconds: $t
	}];
}
function rn() {
	return {
		links: [],
		layers: [],
		swaps: []
	};
}
function an(e) {
	return e.cues ?? nn();
}
function on(e) {
	return e.pause ?? tn();
}
function sn(e) {
	return e.rules ?? rn();
}
function cn(e) {
	return e.sections ?? [];
}
function ln(e, t) {
	let n = Math.min(e.max, Math.max(e.min, t));
	return e.step === "whole" ? Math.min(e.max, Math.max(e.min, Math.round(n))) : n;
}
function un(e, t) {
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
function dn(e, t, n, r) {
	return r === null ? e >= t : r ? e >= t - Math.max(0, n) : e >= t;
}
function fn(e, t, n, r) {
	if (t === n) return n;
	let i = n > t ? e.riseSeconds : e.fallSeconds;
	if (!(i > 0)) return n;
	let a = Math.min(1, Math.max(0, r) / i);
	return a >= 1 ? n : t + (n - t) * a;
}
var pn = [
	"vox",
	"melody",
	"harmony",
	"bass",
	"kit",
	"perc"
];
function mn(e) {
	return pn.includes(e);
}
function hn() {
	return [{
		id: "reverb",
		name: "Reverb",
		type: "reverb",
		params: Ge("reverb"),
		returnDb: 0,
		mute: !1
	}, {
		id: "delay",
		name: "Delay",
		type: "delay",
		params: Ge("delay"),
		returnDb: 0,
		mute: !1
	}];
}
function gn(e) {
	return e.buses ?? hn();
}
function _n(e) {
	return 3840 / e.unit;
}
function vn(e) {
	return _n(e) * e.beats;
}
function yn(e) {
	return e.startTick + e.lengthTicks;
}
function bn(e) {
	let t = 0;
	for (let n of e.tracks) for (let e of n.clips) t = Math.max(t, yn(e));
	return t;
}
function xn(e) {
	return e.some((e) => e.solo);
}
function Sn(e, t) {
	return e.mute ? !1 : !t || e.solo;
}
function Cn(e) {
	return e === -Infinity ? 0 : Number.isFinite(e) ? 10 ** (Math.min(e, 12) / 20) : 1;
}
var wn = -.3, Tn = -1.5, En = .001, Dn = .1, On = 10 ** (wn / 20), kn = 10 ** (Tn / 20), An = On - kn;
function jn(e) {
	let t = Math.abs(e);
	return t <= kn ? e : Math.sign(e) * (kn + An * Math.tanh((t - kn) / An));
}
var Mn = 10 ** (1.14 / 20);
function Nn(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(1, Math.max(-1, e)) : 0;
}
function Pn(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(1, Math.max(0, e)) : 0;
}
function Fn(e) {
	let t = xn(e), n = /* @__PURE__ */ new Map();
	for (let r of e) n.set(r.id, Sn(r, t) ? Cn(r.volume) : 0);
	return n;
}
function In(e) {
	return e.mute ? 0 : Cn(Number.isFinite(e.returnDb) ? Math.min(6, Math.max(-60, e.returnDb)) : 0);
}
function Ln(e, t) {
	let n = typeof e.division == "string" ? e.division : "8n.";
	return Math.min(8, Ce(n, t));
}
function Rn(e, t, n) {
	if (e === "delay") return {
		delayTime: Ln(t, n),
		feedback: t.feedback,
		wet: 1
	};
	let r = { wet: 1 };
	for (let n of We(e)) r[n.path] = t[n.path];
	return r;
}
function zn(e, t, n, r) {
	let i = Rn(t, n, r);
	if (t === "reverb") return new e.Reverb(i);
	if (t === "delay") return new e.FeedbackDelay({
		...i,
		maxDelay: 8
	});
	let a = new e.Chorus(i);
	return a.start?.(), a;
}
var Bn = .02;
function Vn(e, t, n, r, i) {
	let a = new e.Gain(1), o = new e.Gain(In(t));
	o.connect(n);
	let s = t.type, c = Ke(s, t.params), l = r, u = null, d = In(t), f = t.name, p = 0, m = !1, h = null, g = !1, _ = () => {
		try {
			a.disconnect(), u?.dispose();
		} catch {}
		u = null;
	}, v = (e) => {
		if (_(), !m) {
			m = !0;
			try {
				i?.(`The ${Ve[s]} bus “${f}” could not be built, so its send is silent.`, e);
			} catch {}
		}
	}, y = () => {
		let t = ++p;
		try {
			let n = zn(e, s, c, l);
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
			let n = Ke(t.type, t.params);
			if (t.type !== s) b(), s = t.type, c = n, _(), y();
			else {
				let e = {};
				for (let t of We(s)) n[t.path] !== c[t.path] && (e[t.path] = n[t.path]);
				if (c = n, Object.keys(e).length > 0 && s === "reverb") x();
				else if (Object.keys(e).length > 0 && u) try {
					u.set(s === "delay" ? {
						delayTime: Ln(c, l),
						feedback: c.feedback
					} : e);
				} catch {
					_(), y();
				}
			}
			let r = In(t);
			r !== d && (d = r, o.gain.rampTo(r, Bn, e.immediate()));
		},
		setTempo(e) {
			if (!(!Number.isFinite(e) || e <= 0 || e === l) && (l = e, s === "delay" && u)) try {
				u.set({ delayTime: Ln(c, l) });
			} catch {}
		},
		dispose() {
			g = !0, b(), _(), a.dispose(), o.dispose();
		}
	};
}
//#endregion
//#region src/playback/transport/tone-ticks.ts
function Hn(e, t, n) {
	return e / (60 / t * 1) * n;
}
function Un(e, t, n) {
	return e * (60 / t * 1) / n;
}
function Wn(e, t) {
	return e + t * Math.max(Math.abs(e) * 2 ** -52, Number.MIN_VALUE);
}
function Gn(e, t, n) {
	let r = Un(e, t, n);
	for (let i = 0; i < 64 && Math.floor(Hn(r, t, n)) < e; i++) r = Wn(r, 1);
	return r;
}
function Kn(e, t, n) {
	let r = Un(e, t, n);
	for (let i = 0; i < 64 && Hn(r, t, n) > e; i++) r = Wn(r, -1);
	return r;
}
//#endregion
//#region src/playback/transport/tone.ts
var qn = 1e-6;
function Jn(e) {
	let t = e.getTransport(), n = e.getContext();
	t.PPQ !== 960 && (t.PPQ = 960), t.swing = 0, t.loop = !1, t.loopStart = 0, t.loopEnd = Kn(3840, t.bpm.value, 960);
	let r = 0, i = 0, a = Infinity, o = 0, s = 0, c = 0, l = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ new Set(), f = /* @__PURE__ */ new Set(), p = /* @__PURE__ */ new Set(), m = (e) => e >= r - qn && e < a - qn, h = (e, t) => {
		!m(t) || t >= s - qn && t < c || e(t);
	}, g = (e) => {
		if (m(e)) for (let t of [...d]) t(e);
	};
	return t.on("loop", g), {
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
			let l = ++o, d = t.now(), f = 60 / (t.bpm.value * 960), p = Math.max(0, Math.ceil((d - e) / f - 1e-9));
			s = e, c = e + p * f - qn;
			for (let t = n; t < n + p; t++) {
				let r = u.get(t);
				if (r) {
					for (let [i, a] of [...r]) if (u.get(t)?.has(i) && (a(e + (t - n) * f), l !== o)) return;
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
		rampTempo(e, n, r, i = "exponential") {
			i === "linear" ? t.bpm.linearRampTo(e, n, r) : t.bpm.rampTo(e, n, r);
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
				t.loopStart = Gn(e.startTick, n, 960), t.loopEnd = Kn(e.endTick, n, 960);
			}
			t.loop = e !== null;
		},
		onLoop(e) {
			return d.add(e), () => void d.delete(e);
		},
		scheduleTick(e, n) {
			let r = t.schedule((e) => h(n, e), Gn(e, t.bpm.value, 960));
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
			l.clear(), u.clear(), d.clear(), t.off("loop", g);
			for (let e of f) n.clearTimeout(e);
			f.clear();
			for (let e of p) n.clearInterval(e);
			p.clear();
		}
	};
}
//#endregion
//#region src/playback/engine/tone.ts
function Yn(e) {
	return e;
}
var Xn = (e) => e;
function Zn(e) {
	return {
		rampTo: (t, n, r) => void e.rampTo(t, n, r),
		setAt: (t, n) => void e.setValueAtTime(t, n),
		linearTo: (t, n) => void e.linearRampToValueAtTime(t, n),
		cancelFrom: (t) => void e.cancelScheduledValues(t),
		holdAt: (t) => void e.cancelAndHoldAtTime(t)
	};
}
var Qn = G.frequency.max, $n = G.Q.default, er = .005;
function tr(e) {
	return (t, n) => {
		try {
			e ? e(t, n) : console.error(t, n);
		} catch {}
	};
}
function nr(e, t = {}) {
	let n = /* @__PURE__ */ new WeakMap(), r = (e, n) => {
		if (!t.meter) return null;
		try {
			return t.meter(e);
		} catch (e) {
			return n("A level meter could not be attached.", e), null;
		}
	};
	return {
		destination: Yn(e.getDestination()),
		createTransport: () => Jn(e),
		createTrack(t, i, a) {
			let o = tr(a), s = new e.Gain(i.gain), c = new e.Panner({
				pan: i.pan,
				channelCount: 2
			});
			s.connect(c), c.connect(Xn(t));
			let l = r(c, o), u = /* @__PURE__ */ new Map(), d = (e) => {
				try {
					c.disconnect(e.gain);
				} catch {}
				e.gain.disconnect(), e.gain.dispose();
			};
			return {
				input: Yn(s),
				gain: Zn(s.gain),
				pan: Zn(c.pan),
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
			let s = tr(o), c = Vn(e, t, Xn(i), a, s), l = r(c.output, s), u = {
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
		createInstrument: (t, n, r) => Ht(e, n, Xn(t), r),
		createMusicChain(t, n) {
			let r = tr(n), i = e.getContext(), a = !1, o = new e.Gain(1), s = new e.Gain(1), c = new e.Gain(1), l = new e.Gain(1), u = new e.Gain(1), d = new e.Gain(1);
			c.connect(l), l.connect(u), u.connect(Xn(t));
			let f = (t, n, r) => {
				t.rampTo(n, Math.max(er, r), e.immediate());
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
						let m = u >= Qn && Math.abs(d - $n) < 1e-6;
						(!m || o && s === null) && (m || c(), o || (o = new e.Filter({
							type: "lowpass",
							frequency: Qn,
							Q: $n
						}), o.connect(n), t.disconnect(n), t.connect(o)), f(o.frequency, Math.min(Qn, u), p), f(o.Q, d, p), m && (s = i.setTimeout(() => {
							s = null;
							try {
								l();
							} catch (e) {
								r("The music filter could not step aside.", e);
							}
						}, Math.max(er, p) + .05)));
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
				input: Yn(o),
				setLowpass: (e, t, n, r) => m[e].set(t, n, r),
				cue: Zn(c.gain),
				pause: Zn(l.gain),
				hidden: Zn(u.gain),
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
var rr = 16385;
function ir(e) {
	let t = new e.Compressor({
		threshold: -2,
		ratio: 20,
		knee: 0,
		attack: En,
		release: Dn
	}), n = new e.Gain(1 / (Mn * 4)), r = new e.WaveShaper((e) => jn(e * 4), rr);
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
//#region src/song/overrides.ts
var ar = {
	hz: H.hz,
	depth: H.depth
};
function or(e) {
	if (typeof e != "string") return null;
	if (e.startsWith("lfo:")) {
		let t = e.indexOf(":", 4), n = e.slice(4, t), r = e.slice(t + 1);
		return t > 4 && (r === "hz" || r === "depth") ? {
			kind: "lfo",
			lfoId: n,
			path: r
		} : null;
	}
	return Ze(e);
}
function sr(e, t) {
	return t.kind === "layer" ? e.layers[t.layer] : void 0;
}
function cr(e, t) {
	return t.kind === "fx" ? e.effects?.find((e) => e.id === t.effectId) : void 0;
}
function lr(e, t) {
	return t.kind === "lfo" ? e.lfos?.find((e) => e.id === t.lfoId) : void 0;
}
function ur(e, t) {
	let n = or(t);
	if (!n) return null;
	if (n.kind === "layer") {
		let t = sr(e, n);
		return t ? n.path === "volume" ? Ye : ce(t.voiceType, n.path) ?? null : null;
	}
	if (n.kind === "fx") {
		let t = cr(e, n);
		return t ? ze(t.type, n.path) ?? null : null;
	}
	return lr(e, n) ? ar[n.path] : null;
}
function dr(e, t) {
	let n = ur(e, t), r = or(t);
	if (n) {
		if (r.kind === "layer") {
			let t = sr(e, r);
			return (r.path === "volume" ? t.volume : t.params[r.path]) ?? n.default;
		}
		return r.kind === "fx" ? cr(e, r).params[r.path] ?? n.default : lr(e, r)[r.path];
	}
}
function fr(e, t, n) {
	let r = ur(e, t);
	return r ? ue(r, n) : void 0;
}
function pr(e, t, n) {
	let r = fr(e, t, n);
	if (r === void 0 || dr(e, t) === r) return e;
	let i = or(t);
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
function mr(e, t) {
	if (!t) return e;
	let n = e;
	for (let [e, r] of Object.entries(t)) n = pr(n, e, r);
	return n;
}
function hr(e, t) {
	return mr(e, t?.overrides?.[e.id]);
}
function gr(e, t) {
	let n = new Set(e.tracks.map((e) => e.instrumentId)), r = t.filter((e) => n.has(e.id)).map((t) => hr(t, e));
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
function _r(e) {
	return typeof e == "string" || typeof e == "boolean" || typeof e == "number" && Number.isFinite(e);
}
function vr(e, t, n, r) {
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
			if (!or(e) || !_r(t)) {
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
//#region src/song/patterns.ts
var yr = [
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
function br(e) {
	return yr.some((t) => t.size === e);
}
function xr(e) {
	return yr.find((t) => t.size === e)?.ticks ?? 240;
}
function Sr(e) {
	return e.length * xr(e.stepSize);
}
function Cr(e, t) {
	let n = xr(e.stepSize), r = t % 2 == 1 ? Math.round(e.swing * n / 2) : 0;
	return t * n + r;
}
function wr(e) {
	return typeof e.patternId == "string";
}
function Tr(e, t) {
	return t === void 0 ? null : e.patterns?.find((e) => e.id === t) ?? null;
}
var Er = /* @__PURE__ */ new WeakMap();
function Dr(e, t) {
	let n = Er.get(e);
	n || (n = /* @__PURE__ */ new Map(), Er.set(e, n));
	let r = n.get(t);
	if (r) return n.delete(t), n.set(t, r), r;
	let i = Sr(e), a = [];
	if (i > 0 && t > 0) for (let n = 0; n < t; n += i) for (let r of e.rows) for (let o = 0; o < e.length; o++) {
		let s = r.steps[o] ?? 0;
		if (!(s > 0)) continue;
		let c = Cr(e, o), l = n + c;
		if (l >= t) continue;
		let u = o + 1 < e.length ? Cr(e, o + 1) : i, d = Math.max(1, Math.min(u - c, t - l));
		a.push({
			tick: l,
			durationTicks: d,
			midi: r.note,
			velocity: Math.min(1, s)
		});
	}
	return a.sort((e, t) => e.tick - t.tick || e.midi - t.midi), n.set(t, a), n.size > 8 && n.delete(n.keys().next().value), a;
}
var Or = [];
function kr(e, t) {
	if (!wr(t)) return t.notes;
	let n = Tr(e, t.patternId);
	return n ? Dr(n, t.lengthTicks) : Or;
}
//#endregion
//#region src/playback/events.ts
function Ar(e) {
	return Number.isFinite(e) ? Math.min(1, Math.max(0, e)) : 1;
}
function jr(e, t) {
	let n = [];
	for (let r of e.clips) {
		if (!Number.isFinite(r.startTick) || !(r.lengthTicks > 0)) continue;
		let e = Math.round(r.startTick + r.lengthTicks);
		for (let i of kr(t, r)) {
			if (!Number.isFinite(i.midi) || !(i.durationTicks > 0) || !(i.tick >= 0 && i.tick < r.lengthTicks)) continue;
			let t = Math.round(r.startTick + i.tick), a = Math.min(Math.round(r.startTick + i.tick + i.durationTicks), e);
			t < 0 || a <= t || n.push({
				start: t,
				end: a,
				midi: i.midi,
				velocity: Ar(i.velocity)
			});
		}
	}
	return n;
}
function Mr(e) {
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
function Nr(e, t = {}) {
	let n = [];
	for (let r of Mr(jr(e, t))) n.push({
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
function Pr(e) {
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
function Fr(e) {
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
//#region src/playback/patch-sync.ts
function Ir(e, t) {
	if (e.kit === t.kit) return !0;
	let n = e.kit?.pads, r = t.kit?.pads;
	return !n || !r || n.length !== r.length ? !1 : n.every((e, t) => {
		let n = r[t];
		return e.note === n.note && e.pitch === n.pitch && e.choke === n.choke && e.layers.length === n.layers.length && e.layers.every((e, t) => e === n.layers[t]);
	});
}
function Lr(e, t) {
	return e.id === t.id && Ir(e, t) && e.layers.length === t.layers.length && e.layers.every((e, n) => {
		let r = t.layers[n];
		return e.voiceType === r.voiceType && e.polyphony === r.polyphony;
	});
}
function Rr(e, t, n) {
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
				if (r && Lr(r.patch, n)) {
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
var zr = /* @__PURE__ */ new WeakMap();
function Br(e, t, n) {
	let r = zr.get(e);
	return r || (r = Fr(e), zr.set(e, r)), r.get(t)?.get(n);
}
var Vr = .02;
function Hr(e, t) {
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
function Ur(e) {
	if (!e.enabled) return null;
	let t = Math.max(0, Math.round(e.startTick)), n = Math.round(e.endTick);
	return Number.isFinite(t) && Number.isFinite(n) && n > t ? {
		start: t,
		end: n
	} : null;
}
function Wr(e, t) {
	return e.enabled === t.enabled && e.startTick === t.startTick && e.endTick === t.endTick;
}
function Gr(e) {
	return Number.isFinite(e) ? Math.max(0, Math.round(e)) : 0;
}
function Kr(e, t = {}) {
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
		n !== null && (e.fadeEnd = n > 0 ? i + n : 0), e.gainTarget = t, e.channel.gain.rampTo(t, Math.max(Vr, n ?? e.fadeEnd - i), i);
	}, j = () => {
		let e = r.tempo();
		if (!(e === u || !Number.isFinite(e) || e <= 0)) {
			u = e;
			for (let t of c.values()) t.instrument.setTempo(e);
			for (let { channel: t } of l.values()) t.setTempo(e);
		}
	}, M = (e) => {
		y++, e.held.clear();
		try {
			e.instrument.handle()?.releaseAll();
		} catch (e) {
			D(e);
		}
	}, N = (e, t, n) => {
		let r = e.instrument.handle(), i = [...e.held.values()];
		e.held.clear();
		for (let e of i) try {
			r?.noteOff(e, t);
		} catch (e) {
			if (D(e), y !== n) return !1;
		}
		return !0;
	}, P = () => {
		for (let e of c.values()) M(e);
	}, F = () => {
		r.isRunning() && r.stop(r.now());
	}, I = (e) => {
		let t = o ? Ur(o.loop) : null;
		g = t !== null && e < t.end, r.setLoop(t && g ? {
			startTick: t.start,
			endTick: t.end
		} : null);
	}, L = () => r.ticksAt(r.now()), R = (e, t) => {
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
	}, ee = (e, t) => {
		if (p !== "playing" || (j(), !R(e, t))) return;
		let n = y;
		for (let r of [...c.values()]) {
			let i = r.table.get(e), a = i && r.instrument.handle();
			if (!i || !a) continue;
			for (let e of i.offs) {
				let i = r.held.get(e);
				if (i !== void 0) {
					r.held.delete(e);
					try {
						a.noteOff(i, t);
					} catch (e) {
						if (D(e), y !== n) return;
					}
				}
			}
			let o = r.pitched ? S : 0;
			for (let { midi: s, velocity: c } of i.ons) try {
				let n = r.held.get(s);
				n !== void 0 && (r.held.delete(s), a.noteOff(n, t));
				let i = s + o;
				if (i < 0 || i > 127) continue;
				r.held.set(s, i), a.noteOn(i, c, t, {
					key: e,
					ordinal: Br(r.table, e, s)
				});
			} catch (e) {
				if (D(e), y !== n) return;
			}
		}
		e === f && !g && te(t);
	}, z = (e) => {
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
	}, te = (e) => {
		p = "stopped", w++;
		let t = ++y;
		for (let n of [...c.values()]) if (!N(n, e, t)) return;
		try {
			r.stop(e);
		} catch (e) {
			a("The Transport could not be stopped.", e);
		}
		z(e), T();
	}, ne = r.onLoop((e) => {
		if (p !== "playing") return;
		let t = y;
		for (let n of [...c.values()]) if (!N(n, e, t)) return;
	}), re = (e) => {
		let t = o ? Ur(o.loop) : null;
		if (!o || (!t || e >= t.end) && e >= f) return !1;
		p === "playing" && P(), y++, w++, z(r.immediate()), I(e);
		let n = r.now();
		return r.isRunning() && r.stop(n), r.start(n, e), _ = !1, !0;
	}, ie = () => {
		let e = /* @__PURE__ */ new Set();
		for (let t of c.values()) for (let n of t.table.keys()) e.add(n);
		f > 0 && e.add(f);
		for (let t of C.keys()) e.add(t);
		for (let [t, n] of d) e.has(t) || (r.clearTick(n), d.delete(t));
		for (let t of e) d.has(t) || d.set(t, r.scheduleTick(t, (e) => ee(t, e)));
	}, B = (e) => e === null ? null : s?.find((t) => t.id === e) ?? null, ae = (e) => {
		let t = x.get(e.id)?.instrumentId;
		return t !== void 0 && B(t) ? t : e.instrumentId;
	}, oe = (e) => {
		let t = B(ae(e.track)), n = e.track.voiceLimit, r = x.get(e.track.id)?.knobs;
		if (t === e.source && n === e.limit && r === e.knobs) return;
		e.source = t, e.limit = n, e.knobs = r, e.pitched = t !== null && !t.kit;
		let i = t ? Hr(t, n) : null;
		if (i && r) for (let [e, t] of Object.entries(r)) i = pr(i, e, t);
		let a = e.instrument.handle();
		e.instrument.update(i), e.instrument.handle() !== a && e.held.clear();
	}, V = (e) => {
		let t = x.get(e.id);
		if (!t || t.volumeDb === void 0 && t.pan === void 0 && !t.sends) return e;
		let n = { ...e };
		return t.volumeDb !== void 0 && Number.isFinite(t.volumeDb) && (n.volume = t.volumeDb), t.pan !== void 0 && (n.pan = t.pan), t.sends && (n.sends = {
			...e.sends,
			...t.sends
		}), n;
	}, se = (e) => {
		let t = x.get(e)?.gainScale;
		return t === void 0 || !Number.isFinite(t) ? 1 : Math.min(1, Math.max(0, t));
	}, ce = (e) => {
		let t = Fn(e.map(V));
		for (let [e, n] of t) t.set(e, n * se(e));
		return t;
	}, le = (e) => {
		let t = x.get(e.id)?.patternId;
		return t !== void 0 && o?.patterns?.some((e) => e.id === t) ? t : void 0;
	}, ue = (e) => {
		let t = le(e);
		return {
			table: Pr(Nr(t === void 0 ? e : {
				...e,
				clips: e.clips.map((e) => e.patternId === void 0 ? e : {
					...e,
					patternId: t
				})
			}, o ?? {})),
			swap: t
		};
	}, de = (t, n) => {
		let o = Nn(V(t).pan), s = e.createTrack(i, {
			gain: n,
			pan: o
		}, a), c = Rr(e, s.input, a);
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
			patternSwap: void 0
		};
		return {table: l.table, swap: l.patternSwap} = ue(t), oe(l), l;
	}, fe = (e) => {
		M(e), e.instrument.dispose(), e.channel.dispose();
	}, pe = (e) => {
		for (let t of c.values()) t.channel.dropSend(e.channel);
		e.channel.dispose();
	}, me = () => {
		for (let e of c.values()) fe(e);
		c.clear();
		for (let e of l.values()) pe(e);
		l.clear();
		for (let e of d.values()) r.clearTick(e);
		d.clear(), f = 0;
	}, he = (t) => {
		let n = gn(t), o = new Set(n.map((e) => e.id));
		for (let [e, t] of l) o.has(e) || (pe(t), l.delete(e));
		for (let o of n) {
			let n = l.get(o.id);
			if (n) {
				n.bus !== o && n.channel.update(o), n.bus = o;
				continue;
			}
			t.tracks.some((e) => Pn(V(e).sends?.[o.id]) > 0) && l.set(o.id, {
				bus: o,
				channel: e.createBus(o, i, r.tempo(), a)
			});
		}
	}, ge = (e, t) => {
		let n = Nn(t.pan);
		n !== e.panTarget && (e.panTarget = n, e.channel.pan.rampTo(n, Vr, r.immediate()));
		for (let [n, i] of l) e.channel.setSend(i.channel, Pn(t.sends?.[n]), Vr, r.immediate());
	}, _e = () => {
		p = "stopped", y++, w++, P(), F(), z(r.immediate()), T();
	}, ve = (e) => {
		if (p !== "playing" || e.held.size === 0) {
			M(e);
			return;
		}
		let t = L(), n = /* @__PURE__ */ new Set();
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
	}, ye = (e, t) => {
		let n = o, i = t !== s;
		if (s = t, (!e || !n || e.id !== n.id) && (p !== "stopped" && _e(), z(r.immediate()), me(), O = !1, m = 0, h = 0), o = e, !e) return;
		if ((!n || n.bpm !== e.bpm) && Number.isFinite(e.bpm) && e.bpm > 0 && r.setTempo(e.bpm), !n || n.timeSignature !== e.timeSignature) {
			let { beats: t, unit: n } = e.timeSignature;
			t > 0 && n > 0 && r.setTimeSignature(t, n);
		}
		let a = ce(e.tracks), l = !1, u = /* @__PURE__ */ new Set();
		for (let t of e.tracks) {
			if (u.has(t.id)) continue;
			u.add(t.id);
			let r = c.get(t.id);
			if (!r) {
				c.set(t.id, de(t, a.get(t.id) ?? 0)), l = !0;
				continue;
			}
			let o = n !== null && n.patterns !== e.patterns && t.clips.some(wr), s = t.clips !== r.track.clips || o, d = i || t.instrumentId !== r.track.instrumentId || t.voiceLimit !== r.track.voiceLimit;
			r.track = t, s && ({table: r.table, swap: r.patternSwap} = ue(t), ve(r), l = !0), d && oe(r);
		}
		for (let [e, t] of c) u.has(e) || (fe(t), c.delete(e), l = !0);
		he(e);
		for (let [e, t] of c) {
			ge(t, V(t.track));
			let n = a.get(e) ?? 0;
			n !== t.gainTarget && A(t, n, null);
		}
		j();
		let d = Gr(bn(e));
		d !== f && (f = d, l = !0), l && ie(), p === "playing" && (n && !Wr(n.loop, e.loop) && I(L()), !g && L() >= f && _e());
	}, be = () => r.ticksAt(r.immediate());
	return {
		setSong(e, t) {
			if (!(v || e === o && t === s)) try {
				ye(e, t);
			} catch (e) {
				a("The song could not be loaded for playback.", e);
			}
		},
		play() {
			v || p === "playing" || (j(), re(p === "paused" ? h : m) && E("playing"));
		},
		pause() {
			v || p !== "playing" || (h = Gr(be()), p = "paused", y++, w++, P(), F(), z(r.immediate()), T());
		},
		stop() {
			v || p === "stopped" || _e();
		},
		seek(e) {
			v || (m = Gr(e), h = m, p === "playing" && (re(m) || _e()));
		},
		getCursorTick: () => m,
		getPositionTicks() {
			return p === "playing" ? be() : p === "paused" ? h : m;
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
		setTrackControl(e, t) {
			if (v) return;
			let n = x.get(e);
			t ? x.set(e, t) : x.delete(e);
			let r = c.get(e);
			if (r && o) try {
				(n?.instrumentId !== t?.instrumentId || n?.knobs !== t?.knobs) && oe(r), le(r.track) !== r.patternSwap && ({table: r.table, swap: r.patternSwap} = ue(r.track), ve(r), ie()), (n?.pan !== t?.pan || n?.sends !== t?.sends || n?.volumeDb !== t?.volumeDb) && (he(o), ge(r, V(r.track)));
				let i = ce(o.tracks).get(e) ?? 0;
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
			let a = e === "beat" ? _n(o.timeSignature) : vn(o.timeSignature), s = (Math.floor(Math.max(0, L()) / a) + 1) * a, c = Ur(o.loop);
			if (g && c && s >= c.end) {
				let e = Math.ceil(c.start / a) * a;
				s = e < c.end ? e : c.start;
			}
			let l = {
				action: t,
				drop: n.drop === !0,
				onDrop: n.onDrop
			};
			return C.set(s, [...C.get(s) ?? [], l]), ie(), {
				tick: s,
				cancel: () => {
					let e = C.get(s);
					if (!e?.includes(l)) return;
					let t = e.filter((e) => e !== l);
					t.length > 0 ? C.set(s, t) : C.delete(s);
				}
			};
		},
		jumpAt(e, t) {
			if (v) return;
			let n = Gr(e);
			if (p !== "playing" || !o) {
				m = n, h = n;
				return;
			}
			let i = Ur(o.loop);
			if ((!i || n >= i.end) && n >= f) {
				te(t);
				return;
			}
			w++;
			let a = ++y;
			for (let e of [...c.values()]) if (!N(e, t, a)) return;
			I(n), r.relocate(t, n);
		},
		stopAt(e) {
			!v && p === "playing" && te(e);
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
			v || (p !== "stopped" && _e(), v = !0, me(), ne(), r.setLoop(null), n && r.dispose(), b.clear(), o = null, s = null);
		}
	};
}
//#endregion
//#region src/playback/game-runtime.ts
var qr = 20, Jr = 400, Yr = -60, Xr = 1 / 30, Zr = G.frequency.max, Qr = G.Q.default, $r = .1, ei = .05, K = .005, ti = .02, ni = .7, ri = 1e-4, ii = "A game rule could not be applied.";
function ai() {
	let e = globalThis.document;
	return e && typeof e.addEventListener == "function" && typeof e.removeEventListener == "function" ? e : null;
}
function oi(e, t) {
	return e === void 0 || t === void 0 ? e === t : Math.abs(e - t) <= ri * Math.max(1, Math.abs(e), Math.abs(t));
}
function si(e, t) {
	if (!e || !t) return e === t;
	let n = Object.keys(e);
	return n.length === Object.keys(t).length && n.every((n) => Object.hasOwn(t, n) && oi(e[n], t[n]));
}
function ci(e, t) {
	return !e || !t ? e === t : oi(e.gainScale, t.gainScale) && oi(e.volumeDb, t.volumeDb) && oi(e.pan, t.pan) && si(e.sends, t.sends) && si(e.knobs, t.knobs) && e.instrumentId === t.instrumentId && e.patternId === t.patternId;
}
function li(e, t, n, r) {
	let i = Math.min(1, Math.max(0, t));
	if (e === "track:volume") return Yr + i * 72;
	if (e === "track:pan") return Nn(i * 2 - 1);
	if (e.startsWith("track:send:")) return r.has(e.slice(11)) ? Pn(i) : null;
	let a = n ? Qe(n, e) : null;
	return a && !a.rebuild ? se(a, i) : null;
}
function ui(e = 12) {
	return Array.from({ length: e }, (t, n) => 1200 * Math.log2(1 - .98 * ((n + 1) / e)));
}
function di(e, t = {}) {
	let n = t.transport === void 0, r = t.transport ?? e.createTransport(), i = (e, n) => {
		try {
			t.onError ? t.onError(e, n) : console.error(e, n);
		} catch {}
	}, a = e.createMusicChain(t.destination ?? e.destination, i), { cue: o, pause: s, hidden: c } = a, l = !1, u = (e) => {
		l || (l = !0, i(ii, e));
	}, d = Kr(e, {
		onError: (e, t) => e === ii ? u(t) : i(e, t),
		destination: a.input,
		transport: r
	}), f = null, p = [], m = sn({}), h = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ new Map(), _ = /* @__PURE__ */ new Map(), v = !1, y = null, b = 0, x = null, S = 0, C = null, w = /* @__PURE__ */ new Map(), T = /* @__PURE__ */ new Map(), E = /* @__PURE__ */ new Map(), D = /* @__PURE__ */ new Map(), O = /* @__PURE__ */ new Map(), k = null, A = !1, j = null, M = null, N = null, P = !1, F = (e) => g.get(e) ?? h.get(e), I = (e) => e.tick === null ? null : e, L = () => r.immediate(), R = (e, t, n, r = L()) => {
		e.rampTo(t, Math.max(K, n), r);
	}, ee = (e) => {
		e !== null && r.clearTimeout(e);
	}, z = () => d.getState() === "playing", te = (e) => h.get(e)?.value ?? null, ne = () => {
		let e = m.tempo, t = e ? te(e.dialId) : null, n = e && t !== null ? un(e.points, t) : null;
		if (!e || n === null) {
			x?.cancel(), x = null, y !== null && f && Number.isFinite(f.bpm) && (r.setTempo(f.bpm), d.refreshTempo()), y = null;
			return;
		}
		let i = Math.min(Jr, Math.max(qr, n));
		if (b = i, y === null || !oi(y, i) || x) {
			if (e.landing === "now" || !z()) {
				x?.cancel(), x = null, y = i, r.tempo() !== i && r.setTempo(i), d.refreshTempo();
				return;
			}
			x || y !== null && oi(y, i) || (y = i, x = I(d.atBoundary("bar", (e) => {
				x = null;
				let t = b;
				y = t;
				let n = m.tempo ? m.tempo.glideBeats * 60 / Math.max(qr, r.tempo()) : 0;
				r.rampTempo(t, Math.max(K, n), e), d.refreshTempo();
			})));
		}
	}, re = () => {
		let e = m.transpose, t = e ? te(e.dialId) : null, n = e && t !== null ? un(e.points, t) : null, r = n === null ? 0 : Math.max(-24, Math.min(24, Math.round(n)));
		r !== S && (S = r, C?.cancel(), C = I(d.atBoundary("bar", () => {
			C = null, d.setTranspose(S);
		})));
	}, ie = (e) => e ? p.find((t) => t.id === e) ?? null : null, B = (e) => {
		let t = {};
		for (let n of m.swaps) n.trackId === e && T.get(n.id) === !0 && (n.kind === "instrument" ? t.instrumentId = n.to : t.patternId = n.to);
		return t;
	}, ae = () => {
		if (f) {
			for (let e of m.swaps) {
				let t = h.get(e.dialId);
				t && T.set(e.id, dn(t.value, e.threshold, t.dial.cushion, T.get(e.id) ?? null));
			}
			for (let e of f.tracks) {
				let t = B(e.id), n = E.get(e.id) ?? {};
				if (t.instrumentId === n.instrumentId && t.patternId === n.patternId) {
					D.get(e.id)?.cancel(), D.delete(e.id);
					continue;
				}
				if (D.has(e.id)) continue;
				let r = e.id, i = I(d.atBoundary("bar", () => {
					D.delete(r), E.set(r, B(r)), oe();
				}));
				i && D.set(r, i);
			}
		}
	}, oe = (e) => {
		if (!f) return;
		let t = new Set(gn(f).map((e) => e.id)), n = /* @__PURE__ */ new Map(), r = (e) => {
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
			let o = w.get(t.id) ?? null, s = dn(a.value, t.threshold, a.dial.cushion, o);
			w.set(t.id, s);
			let c = r(n);
			c.gainScale = (c.gainScale ?? 1) * +!!s, c.gainSeconds = Math.max(c.gainSeconds ?? 0, e ?? t.fadeSeconds);
		}
		let o = { ...qt(f) };
		for (let e of m.links) {
			let n = te(e.dialId), a = n === null ? null : un(e.points, n);
			if (a === null) continue;
			if (Wt(e.target)) {
				let t = e.target === "master:filter.Q" ? "Q" : "frequency";
				o[t] = se(G[t], a);
				continue;
			}
			let s = e.trackId === void 0 ? void 0 : i.get(e.trackId);
			if (!s) continue;
			let c = ie(E.get(s.id)?.instrumentId ?? s.instrumentId), l = li(e.target, a, c, t);
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
		for (let [e, t] of n) ci(O.get(e), t) || (O.set(e, t), d.setTrackControl(e, t));
		for (let e of [...O.keys()]) n.has(e) || (O.delete(e), d.setTrackControl(e, null));
		v || (!k || !oi(k.frequency, o.frequency) || !oi(k.Q, o.Q)) && (k = o, a.setLowpass("master", o.frequency, o.Q, e === 0 ? K : $r));
	}, V = (e) => {
		if (f) try {
			ne(), re(), ae(), oe(e);
		} catch (e) {
			u(e);
		}
	}, ce = () => {
		if (v) return;
		let e = L();
		for (let t of h.values()) t.value = fn(t.dial, t.from, t.target, e - t.since);
		V();
	}, le = r.setInterval(ce, Xr), ue = () => {
		x?.cancel(), x = null, y = null, C?.cancel(), C = null;
		for (let e of D.values()) e.cancel();
		D.clear(), w.clear(), T.clear();
	}, de = () => {
		M?.cancel(), M = null, N = null, pe();
	}, fe = () => {
		let e = L();
		o.holdAt(e), R(o, 1, K, e);
	}, pe = () => {
		P && (P = !1, fe());
	}, me = () => j !== null || N !== null && N.action !== "jump", he = () => {
		de(), ee(j), j = null, f && Number.isFinite(f.bpm) && (r.cancelTempo(L()), r.tempo() !== f.bpm && (r.setTempo(f.bpm), d.refreshTempo())), y = null;
	}, ge = () => {
		R(o, 1, K), d.bendPitch([0], 0, L());
	}, _e = (e) => {
		A = !1, a.setLowpass("muffle", Zr, Qr, e), R(s, 1, e);
	}, ve = (e) => {
		if (!f) return 0;
		let t = e - d.getPositionTicks();
		return t < 0 && f.loop.enabled && (t += f.loop.endTick - f.loop.startTick), Math.max(0, t) * (60 / (Math.max(qr, r.tempo()) * 960));
	}, ye = (e) => {
		ee(j), j = r.setTimeout(() => {
			j = null;
			try {
				d.stop(), d.seek(0), he(), V();
			} catch (e) {
				i("A cue could not finish.", e);
			}
		}, Math.max(0, e));
	}, be = (e, t) => {
		let n = e.seconds;
		if (e.action === "jump") {
			let r = cn(f ?? {}).find((t) => t.id === e.sectionId);
			if (!r) return;
			d.jumpAt(r.startTick, t), n > 0 && (o.cancelFrom(t), o.setAt(0, t), o.linearTo(1, t + n / 2));
			return;
		}
		if (e.action === "stop") {
			d.stopAt(t), d.seek(0);
			return;
		}
		if (e.action === "fadeOut") {
			let e = Math.max(K, n);
			o.cancelFrom(t), o.setAt(1, t), o.linearTo(0, t + e), ye(t + e - L());
			return;
		}
		let i = n > 0 ? n : $t, a = Math.max(qr, r.tempo());
		r.rampTempo(Math.max(1, a * ti), i, t, "linear"), d.bendPitch(ui(), i, t), o.cancelFrom(t), o.setAt(1, t + i * ni), o.linearTo(0, t + i), ye(t + i - L());
	}, xe = t.visibility === void 0 ? ai() : t.visibility, Se = () => {
		!v && xe && R(c, +!xe.hidden, ei);
	};
	return xe?.addEventListener("visibilitychange", Se), xe?.hidden && c.setAt(0, L()), {
		player: d,
		setGame(e, t, n) {
			if (v) return;
			let r = e?.id !== f?.id, i = e?.bpm !== f?.bpm;
			if (r) {
				for (let e of O.keys()) d.setTrackControl(e, null);
				O.clear(), A && _e(K);
			}
			d.setSong(e, t), f = e, p = t, m = sn(e ?? {}), (r || i) && (y = null), r && (l = !1, ue(), E.clear(), d.setTranspose(0), S = 0);
			let a = /* @__PURE__ */ new Set();
			g.clear();
			for (let e of n) {
				if (a.has(e.id) || g.has(e.name)) continue;
				a.add(e.id);
				let t = h.get(e.id), n = ln(e, _.get(e.name) ?? _.get(e.id) ?? t?.target ?? e.defaultValue), r;
				if (!t) r = {
					dial: e,
					target: n,
					value: n,
					from: n,
					since: L()
				};
				else {
					let i = ln({
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
			let i = ln(r.dial, t);
			i !== r.target && (r.from = r.value, r.since = L(), r.target = i), n.jump && (r.value = r.from = r.target), ce();
		},
		dialValue: (e) => F(e)?.value ?? null,
		cue(e) {
			if (v || !f) return !1;
			let t = an(f), n = t.find((t) => t.name === e) ?? t.find((t) => t.id === e);
			if (!n) return !1;
			let r = n.action === "jump" ? cn(f).find((e) => e.id === n.sectionId) : void 0;
			if (n.action === "jump" && !r) return !1;
			if (!z()) return r ? d.seek(r.startTick) : d.stop(), !0;
			if (j !== null && (he(), ge()), de(), M = I(d.atBoundary(n.landing, (e) => {
				M = null, N = null, P = !1;
				try {
					be(n, e);
				} catch (e) {
					fe(), i("A cue could not be played.", e);
				}
			}, {
				drop: !0,
				onDrop: de
			})), M && (N = n), n.action === "jump" && n.seconds > 0 && M && M.tick !== null) {
				let e = L() + ve(M.tick), t = Math.max(L(), e - n.seconds / 2);
				o.cancelFrom(t), o.setAt(1, t), o.linearTo(0, Math.max(t + K, e)), P = !0;
			}
			return !0;
		},
		play() {
			v || (A && _e(on(f ?? {}).fadeSeconds), z() && me() && (he(), d.stop(), d.seek(0)), !z() && (he(), ge(), V(), d.play()));
		},
		pause() {
			if (v || A || !z()) return;
			let e = on(f ?? {});
			if (A = !0, de(), e.mode === "stop") {
				d.stop(), d.seek(0);
				return;
			}
			a.setLowpass("muffle", e.muffleHz, Qr, e.fadeSeconds), e.mode === "freeze" && (d.pause(), e.fadeSeconds > 0 && R(s, 0, e.fadeSeconds));
		},
		stop() {
			v || (A && _e(K), d.stop(), he(), V());
		},
		isPaused: () => A,
		settle: () => {
			for (let e of h.values()) e.value = e.from = e.target;
			w.clear(), T.clear(), V(0);
		},
		setMuffle(e, t) {
			if (v || !Number.isFinite(e)) return;
			let n = Math.min(Zr, Math.max(G.frequency.min, e));
			a.setLowpass("host", n, Qr, Math.max(K, Number.isFinite(t) ? t : 0));
		},
		dispose() {
			v || (v = !0, r.clearInterval(le), ee(j), xe?.removeEventListener("visibilitychange", Se), d.dispose(), n && r.dispose(), a.dispose(), h.clear(), g.clear(), _.clear());
		}
	};
}
var fi = 3;
function pi(e, t) {
	return typeof e == "string" ? e : t;
}
function mi(e, t) {
	return Array.isArray(e) ? e.map((e) => {
		if (typeof e != "object" || !e || !Array.isArray(e.connections)) return e;
		let n = e.connections.flatMap((e) => {
			let n = typeof e == "object" && e ? Ze(e.target) : null;
			if (n?.kind !== "layer") return [e];
			let r = t.get(n.layer);
			return r === void 0 ? [] : [{
				...e,
				target: Xe(r, n.path)
			}];
		});
		return {
			...e,
			connections: n
		};
	}) : e;
}
function hi(e) {
	let t = e;
	if (typeof e == "string") try {
		t = JSON.parse(e);
	} catch {
		return {
			ok: !1,
			error: "This file is not valid JSON, so it can’t be an instrument patch."
		};
	}
	if (typeof t != "object" || !t || Array.isArray(t)) return {
		ok: !1,
		error: "An instrument patch must be a JSON object."
	};
	let n = t;
	if (typeof n.version == "number" && n.version > 1) return {
		ok: !1,
		error: `This patch was saved by a newer version of Sine Sculptor (format ${n.version}).`
	};
	let r = n.id;
	if (typeof r != "string" || r.trim() === "") return {
		ok: !1,
		error: "The patch has no id."
	};
	if (!Array.isArray(n.layers) || n.layers.length === 0) return {
		ok: !1,
		error: "The patch has no layers, so there is nothing to play."
	};
	let i = n.kit !== null && typeof n.kit == "object" && !Array.isArray(n.kit) ? n.kit : null, a = i && Object.hasOwn(i, "pads") ? i.pads : void 0, o = Array.isArray(a) ? 48 : fi, s = [];
	for (let [e, t] of n.layers.slice(0, o).entries()) {
		if (typeof t != "object" || !t) return {
			ok: !1,
			error: `Layer ${e + 1} is not an object.`
		};
		let n = t;
		if (!h(n.voiceType)) return {
			ok: !1,
			error: `Layer ${e + 1} uses an unknown voice type: ${JSON.stringify(n.voiceType)}.`
		};
		s.push({
			voiceType: n.voiceType,
			polyphony: Mt(n.polyphony),
			volume: Nt(n.volume),
			params: de(n.voiceType, n.params)
		});
	}
	let c, l = n.lfos;
	if (Array.isArray(a)) {
		let e = St(a, s);
		if (!e) return {
			ok: !1,
			error: "The drum kit has no pads, so there is nothing to play."
		};
		c = e.kit, s = e.layers, l = mi(l, e.moved);
	}
	let u = {
		id: r,
		name: pi(n.name, "Untitled"),
		category: pi(n.category, "Uncategorized"),
		description: pi(n.description, ""),
		layers: s
	};
	c && (u.kit = c);
	let d = at(n.effects);
	d.length > 0 && (u.effects = d);
	let f = ot(l, u);
	return f.length > 0 && (u.lfos = f), {
		ok: !0,
		patch: u
	};
}
//#endregion
//#region src/state/immutable.ts
var gi = /* @__PURE__ */ new Set([
	"__proto__",
	"prototype",
	"constructor"
]);
function _i(e) {
	return gi.has(e);
}
function vi(e) {
	let t = 0;
	for (let n of gi) Object.hasOwn(e, n) && t++;
	return t;
}
var yi = 16, bi = yi * 4, xi = 16, q = (e, t) => Object.hasOwn(e, t) ? e[t] : void 0;
function Si(e) {
	if (typeof e != "string") return null;
	let t = e.trim();
	return t.length > 0 && t.length <= 64 && !_i(t) ? t : null;
}
function Ci(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(16, Math.max(1, Math.round(e))) : null;
}
function wi(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(6, Math.max(-60, e)) : null;
}
function Ti(e, t) {
	return typeof e == "string" && e.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 40).trim() || t;
}
function Ei(e) {
	if (typeof e != "object" || !e || Array.isArray(e)) return null;
	let t = {}, n = 0, r = 0;
	for (let i in e) {
		if (n >= yi || r++ >= bi) break;
		if (!Object.hasOwn(e, i)) continue;
		let a = Si(i), o = Pn(q(e, i));
		a === null || a !== i || o <= 0 || (t[a] = o, n++);
	}
	return n > 0 ? t : null;
}
function Di(e, t) {
	let n = Nn(q(t, "pan"));
	n !== 0 && (e.pan = n);
	let r = Ei(q(t, "sends"));
	r && (e.sends = r);
	let i = Ci(q(t, "voiceLimit"));
	i !== null && (e.voiceLimit = i);
}
function Oi(e) {
	if (typeof e != "object" || !e || Array.isArray(e)) return null;
	let t = e, n = Si(q(t, "id")), r = q(t, "type");
	return n === null || !He(r) ? null : {
		id: n,
		name: Ti(q(t, "name"), Ve[r]),
		type: r,
		params: Ke(r, q(t, "params")),
		returnDb: wi(q(t, "returnDb")) ?? 0,
		mute: q(t, "mute") === !0
	};
}
function ki(e, t, n) {
	if (e === void 0) return null;
	if (!Array.isArray(e)) return t(`${n} had an unreadable list of send buses, so it got the default Reverb and Delay.`), null;
	let r = [], i = Math.max(0, e.length - xi);
	for (let t of e.slice(0, xi)) {
		let e = Oi(t);
		!e || r.length >= 4 || r.some((t) => t.id === e.id) ? i++ : r.push(e);
	}
	return i > 0 && t(`${n}: dropped ${i === 1 ? "a send bus" : `${i} send buses`} that couldn’t be read or didn’t fit.`), r;
}
function Ai(e, t) {
	if (!e.sends) return e;
	let n = Object.entries(e.sends).filter(([e]) => t.has(e));
	if (n.length === Object.keys(e.sends).length) return e;
	let r = { ...e };
	return n.length > 0 ? r.sends = Object.fromEntries(n) : delete r.sends, r;
}
//#endregion
//#region src/state/pattern-normalize.ts
var ji = 128, Mi = 40, Ni = (e, t) => Object.hasOwn(e, t) ? e[t] : void 0;
function Pi(e) {
	return typeof e == "object" && e && !Array.isArray(e) ? e : null;
}
function Fi(e) {
	if (typeof e != "string") return null;
	let t = e.trim();
	return t.length > 0 && t.length <= ji ? t : null;
}
function Ii(e, t) {
	if (typeof e != "string") return t;
	let n = e.slice(0, 160).replace(/[\u0000-\u001f\u007f]/g, " ").trim();
	return Array.from(n).slice(0, Mi).join("").trim() || t;
}
function Li(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(64, Math.max(1, Math.round(e))) : null;
}
function Ri(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(1, Math.max(0, e)) : null;
}
function zi(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(1, Math.max(0, e)) : 0;
}
function Bi(e, t) {
	let n = Array(t).fill(0);
	for (let r = 0; r < Math.min(t, e.length); r++) n[r] = zi(e[r]);
	return n;
}
function Vi(e, t) {
	let n = Pi(e);
	if (!n) return null;
	let r = Ni(n, "note"), i = Ni(n, "steps");
	if (typeof r != "number" || !Number.isFinite(r) || !Array.isArray(i)) return null;
	let a = Math.round(r);
	return a < 0 || a > 127 ? null : {
		note: a,
		steps: Bi(i.slice(0, 64), t)
	};
}
function Hi(e) {
	let t = Pi(e);
	if (!t) return null;
	let n = Fi(Ni(t, "id"));
	if (n === null) return null;
	let r = Li(Ni(t, "length")) ?? 16, i = Ni(t, "stepSize"), a = Ni(t, "rows"), o = [], s = /* @__PURE__ */ new Set();
	if (Array.isArray(a)) for (let e of a.slice(0, 64)) {
		let t = Vi(e, r);
		if (t && !s.has(t.note) && (s.add(t.note), o.push(t), o.length >= 16)) break;
	}
	return {
		id: n,
		name: Ii(Ni(t, "name"), "Pattern"),
		length: r,
		stepSize: br(i) ? i : "1/16",
		swing: Ri(Ni(t, "swing")) ?? 0,
		rows: o
	};
}
function Ui(e, t, n) {
	if (e === void 0) return null;
	if (!Array.isArray(e)) return t(`${n} had an unreadable pattern list, so its pattern clips are now empty.`), null;
	let r = [], i = /* @__PURE__ */ new Set(), a = 0;
	for (let t of e.slice(0, 128)) {
		let e = Hi(t);
		if (!e || i.has(e.id)) {
			a++;
			continue;
		}
		i.add(e.id), r.push(e);
	}
	return a += Math.max(0, e.length - 128), a > 0 && t(`${n}: dropped ${a} unreadable or repeated ${a === 1 ? "pattern" : "patterns"}.`), r.length > 0 ? r : null;
}
function Wi(e, t, n, r) {
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
var Gi = [...pn, "none"];
function Ki(e) {
	return e === "none" || mn(e);
}
function qi(e) {
	return e.role ?? "none";
}
function Ji(e) {
	return Gi.indexOf(e);
}
function Yi(e) {
	let t = !0;
	for (let n = 1; n < e.length && t; n++) Ji(qi(e[n - 1])) > Ji(qi(e[n])) && (t = !1);
	return t ? e : e.map((e, t) => ({
		track: e,
		i: t,
		g: Ji(qi(e))
	})).sort((e, t) => e.g - t.g || e.i - t.i).map((e) => e.track);
}
function Xi(e) {
	if (!Array.isArray(e)) return [];
	let t = new Set(e.filter(Ki));
	return Gi.filter((e) => t.has(e));
}
function Zi(e) {
	return Number.isFinite(e) ? Math.min(40, Math.max(3, Math.round(e * 16) / 16)) : 6;
}
function Qi(e) {
	return typeof e == "number" && Number.isFinite(e) ? Zi(e) : null;
}
//#endregion
//#region src/song/track-colors.ts
var $i = /^#[0-9a-f]{6}$/;
function ea(e) {
	if (typeof e != "string") return null;
	let t = e.trim().toLowerCase();
	return $i.test(t) ? t : null;
}
//#endregion
//#region src/state/document.ts
function ta(e, t) {
	let n = ea(J(t, "color"));
	n && (e.color = n, J(t, "colorPicked") === !0 && (e.colorPicked = !0));
	let r = Qi(J(t, "height"));
	r !== null && (e.height = r);
}
var na = "Untitled Song", ra = "Track", ia = [
	2,
	4,
	8,
	16
], aa = 384e5, oa = {
	rack: 256,
	songs: 64,
	tracksPerSong: 128,
	clipsPerTrack: 512,
	notesPerClip: 2e4,
	totalNotes: 1e5
}, sa = 50, ca = (e, t, n) => Math.min(n, Math.max(t, e));
function la(e) {
	return typeof e == "number" && Number.isFinite(e);
}
function J(e, t) {
	return Object.hasOwn(e, t) ? e[t] : void 0;
}
function Y(e, t, n = `${t}s`) {
	return `${e.toLocaleString("en-US")} ${e === 1 ? t : n}`;
}
function ua(e) {
	return la(e) ? ca(e, 20, 400) : null;
}
function da(e) {
	return la(e) ? ca(e, -60, 12) : null;
}
function fa(e) {
	return la(e) ? ca(Math.round(e), 0, aa) : null;
}
function pa(e) {
	return la(e) ? ca(Math.round(e), 1, aa) : null;
}
function ma(e) {
	if (typeof e != "object" || !e) return null;
	let t = J(e, "beats"), n = J(e, "unit");
	return typeof t != "number" || !Number.isInteger(t) || t < 1 || t > 32 || typeof n != "number" || !ia.includes(n) ? null : {
		beats: t,
		unit: n
	};
}
function ha(e) {
	if (typeof e != "object" || !e) return null;
	let t = fa(J(e, "startTick")), n = fa(J(e, "endTick"));
	return t === null || n === null ? null : {
		enabled: J(e, "enabled") === !0,
		startTick: t,
		endTick: Math.max(t, n)
	};
}
var ga = /[\u0000-\u001f\u007f]/g;
function _a(e, t) {
	if (typeof e != "string") return t;
	let n = e.slice(0, 400).replace(ga, " ").trim();
	return n.length > 100 && (n = Array.from(n).slice(0, 100).join("").trim()), n || t;
}
function va(e) {
	if (typeof e != "string") return null;
	let t = e.trim();
	return t.length > 0 && t.length <= 128 ? t : null;
}
function ya() {
	return {
		beats: 4,
		unit: 4
	};
}
function ba() {
	return {
		enabled: !1,
		startTick: 0,
		endTick: 0
	};
}
function xa(e, t = oa.totalNotes) {
	let n = [], r = 0, i = 0, a = 0;
	return {
		rackIds: new Set(e),
		notesLeft: Math.max(0, t),
		warn(e) {
			n.length < sa ? n.push(e) : r++;
		},
		overBudget(e) {
			a += e;
		},
		record(e) {
			return typeof e != "object" || !e || Array.isArray(e) ? null : (i += vi(e), e);
		},
		warnings() {
			let e = [...n];
			return a > 0 && e.push(`The project held more notes than the ${Y(oa.totalNotes, "note")} limit, so ${Y(a, "note")} were dropped.`), i > 0 && e.push(`Ignored ${Y(i, "unsafe key")} (such as “__proto__”) in the file.`), r > 0 && e.push(`…and ${Y(r, "more problem")}.`), e;
		}
	};
}
function Sa(e, t) {
	let n = t.record(e);
	if (!n) return null;
	let r = fa(J(n, "tick")), i = pa(J(n, "durationTicks")), a = J(n, "midi"), o = J(n, "velocity");
	if (r === null || i === null || !la(a) || !la(o)) return null;
	let s = Math.round(a);
	return s < 0 || s > 127 ? null : {
		tick: r,
		durationTicks: i,
		midi: s,
		velocity: ca(o, 0, 1)
	};
}
var Ca = (e, t) => e.tick - t.tick || e.midi - t.midi;
function wa(e, t, n) {
	return e ? `${t} “${e}”` : `${t} ${n}`;
}
function Ta(e) {
	return typeof e == "object" && e && !Array.isArray(e) ? va(J(e, "id")) : null;
}
function Ea(e, t, n, r, i, a) {
	if (!Array.isArray(e)) return e !== void 0 && n.warn(`${r} had an unreadable ${i} list, so it is now empty.`), [];
	let o = Math.min(e.length, t);
	e.length > o && n.warn(`${r} held more than ${Y(o, i)}; the extra ${Y(e.length - o, i)} were dropped.`);
	let s = [], c = /* @__PURE__ */ new Set(), l = 0, u = 0;
	for (let t = 0; t < o; t++) {
		let n = Ta(e[t]);
		if (n !== null && c.has(n)) {
			u++;
			continue;
		}
		let r = a(e[t]);
		r ? (c.add(r.id), s.push(r)) : l++;
	}
	return l > 0 && n.warn(`${r}: dropped ${Y(l, `unreadable ${i}`)}.`), u > 0 && n.warn(`${r}: dropped ${Y(u, i)} that repeated an earlier ${i}’s id.`), s;
}
function Da(e, t, n = "A track") {
	let r = t.record(e);
	if (!r) return null;
	let i = va(J(r, "id")), a = fa(J(r, "startTick")), o = pa(J(r, "lengthTicks")), s = J(r, "notes");
	if (i === null || a === null || o === null || !Array.isArray(s)) return null;
	let c = _a(J(r, "name"), ""), l = `${n}, ${wa(c, "clip", i)}`, u = Fi(J(r, "patternId"));
	if (u !== null) return {
		id: i,
		name: c,
		startTick: a,
		lengthTicks: o,
		notes: [],
		patternId: u
	};
	let d = Math.min(s.length, oa.notesPerClip);
	s.length > d && t.warn(`${l} held more than ${Y(d, "note")}; the extra ${Y(s.length - d, "note")} were dropped.`);
	let f = [], p = 0;
	for (let e = 0; e < d; e++) {
		let n = Sa(s[e], t);
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
	p > 0 && t.warn(`${l}: dropped ${Y(p, "invalid note")}.`), f.sort(Ca);
	let m = va(J(r, "poolId"));
	return m === null ? {
		id: i,
		name: c,
		startTick: a,
		lengthTicks: o,
		notes: f
	} : {
		id: i,
		name: c,
		startTick: a,
		lengthTicks: o,
		notes: f,
		poolId: m
	};
}
function Oa(e, t, n = "A song") {
	let r = t.record(e);
	if (!r) return null;
	let i = va(J(r, "id"));
	if (i === null) return null;
	let a = _a(J(r, "name"), ra), o = `${n}, ${wa(a, "track", i)}`, s = J(r, "instrumentId"), c = null;
	typeof s == "string" && t.rackIds.has(s) ? c = s : s != null && t.warn(`${o} used an instrument that isn’t in the rack, so it is now silent.`);
	let l = J(r, "volume"), u = da(l);
	u === null && (l !== void 0 && t.warn(`${o} had an unreadable volume, so it was reset to 0 dB.`), u = 0);
	let d = Ea(J(r, "clips"), oa.clipsPerTrack, t, o, "clip", (e) => Da(e, t, o)), f = {
		id: i,
		name: a,
		instrumentId: c,
		volume: u,
		mute: J(r, "mute") === !0,
		solo: J(r, "solo") === !0,
		clips: d
	}, p = J(r, "role");
	return mn(p) && (f.role = p), Di(f, r), ta(f, r), f;
}
function ka(e, t) {
	let n = t.record(e);
	if (!n) return null;
	let r = va(J(n, "id"));
	if (r === null) return null;
	let i = _a(J(n, "name"), na), a = `Song “${i}”`, o = ua(J(n, "bpm"));
	o === null && (t.warn(`${a} had an unreadable tempo, so it was set to 120 BPM.`), o = 120);
	let s = ma(t.record(J(n, "timeSignature")));
	s ||= (t.warn(`${a} had an unreadable time signature, so it was set to 4/4.`), ya());
	let c = ha(t.record(J(n, "loop")));
	c ||= (J(n, "loop") !== void 0 && t.warn(`${a} had an unreadable loop region, so looping was turned off.`), ba());
	let l = J(n, "sourcePpq"), u = typeof l == "number" && Number.isInteger(l) && l >= 1 && l <= 32767 ? l : null, d = ki(J(n, "buses"), t.warn, a), f = new Set(gn({ buses: d ?? void 0 }).map((e) => e.id)), p = Ui(J(n, "patterns"), t.warn, a), m = new Set((p ?? []).map((e) => e.id)), h = Ea(J(n, "tracks"), oa.tracksPerSong, t, a, "track", (e) => {
		let n = Oa(e, t, a);
		return n && Wi(Ai(n, f), m, t.warn, a);
	}), g = {
		id: r,
		name: i,
		bpm: o,
		timeSignature: s,
		loop: c,
		sourcePpq: u,
		tracks: Yi(h)
	};
	d && (g.buses = d), p && (g.patterns = p);
	let _ = Xi(J(n, "folded"));
	_.length && (g.folded = _);
	let v = vr(J(n, "overrides"), t.rackIds, t.warn, a);
	return v && (g.overrides = v), to(g, n, {
		trackIds: new Set(h.map((e) => e.id)),
		busIds: f,
		patternIds: m,
		rackIds: t.rackIds
	}, (e) => t.warn(`${a}: ${e}`)), g;
}
//#endregion
//#region src/state/game-normalize.ts
var Aa = 128, ja = 40, Ma = 1e6, X = (e, t) => Object.hasOwn(e, t) ? e[t] : void 0;
function Z(e) {
	return typeof e == "object" && e && !Array.isArray(e) ? e : null;
}
function Q(e) {
	return typeof e == "number" && Number.isFinite(e);
}
var $ = (e, t, n) => Math.min(n, Math.max(t, e));
function Na(e) {
	if (typeof e != "string") return null;
	let t = e.trim();
	return t.length > 0 && t.length <= Aa && !t.includes(":") && !_i(t) ? t : null;
}
function Pa(e) {
	if (typeof e != "string") return null;
	let t = e.slice(0, 160).replace(/[\u0000-\u001f\u007f]/g, " ").trim(), n = Array.from(t).slice(0, ja).join("").trim();
	return n && !_i(n) ? n : null;
}
function Fa(e, t) {
	return Q(e) ? $(e, 0, t) : null;
}
function Ia(e, t, n, r, i) {
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
function La(e) {
	let t = Z(e);
	if (!t) return null;
	let n = Na(X(t, "id")), r = Pa(X(t, "name")), i = X(t, "min"), a = X(t, "max");
	if (!n || !r || !Q(i) || !Q(a)) return null;
	let o = $(i, -1e6, Ma), s = $(a, -1e6, Ma);
	if (!(s > o)) return null;
	let c = X(t, "step") === "whole" ? "whole" : "continuous", l = X(t, "defaultValue"), u = Q(l) ? $(l, o, s) : o;
	return c === "whole" && (u = $(Math.round(u), o, s)), {
		id: n,
		name: r,
		min: o,
		max: s,
		step: c,
		defaultValue: u,
		riseSeconds: Fa(X(t, "riseSeconds"), 60) ?? 0,
		fallSeconds: Fa(X(t, "fallSeconds"), 60) ?? 0,
		cushion: Q(X(t, "cushion")) ? $(X(t, "cushion"), 0, s - o) : 0
	};
}
function Ra(e, t, n) {
	if (!Array.isArray(e)) return null;
	let r = [];
	for (let i of e.slice(0, Zt.curvePoints)) {
		let e = Z(i), a = e ? X(e, "x") : void 0, o = e ? X(e, "y") : void 0;
		Q(a) && Q(o) && r.push({
			x: $(a, -1e6, Ma),
			y: $(o, t, n)
		});
	}
	return r.sort((e, t) => e.x - t.x), r.length > 0 ? r : null;
}
function za(e) {
	let t = Z(e), n = t ? Na(X(t, "dialId")) : null, r = t ? Ra(X(t, "points"), 20, 400) : null;
	if (!t || !n || !r) return null;
	let i = {
		dialId: n,
		points: r,
		glideBeats: Fa(X(t, "glideBeats"), 64) ?? 0
	};
	return X(t, "landing") === "now" && (i.landing = "now"), i;
}
function Ba(e) {
	let t = Z(e), n = t ? Na(X(t, "dialId")) : null, r = t ? Ra(X(t, "points"), -24, 24) : null;
	return t && n && r ? {
		dialId: n,
		points: r
	} : null;
}
function Va(e, t) {
	return typeof e != "string" || e.length > 256 ? !1 : e === "track:volume" || e === "track:pan" || Wt(e) ? !0 : e.startsWith("track:send:") ? t.has(e.slice(11)) : Ze(e) !== null;
}
function Ha(e, t) {
	let n = Na(X(e, "id")), r = Na(X(e, "dialId")), i = X(e, "trackId");
	return !n || !r || typeof i != "string" || !t.trackIds.has(i) ? null : {
		id: n,
		dialId: r,
		trackId: i
	};
}
function Ua(e, t) {
	let n = Z(e), r = n ? X(n, "target") : void 0, i = n ? Ra(X(n, "points"), 0, 1) : null;
	if (!n || !Va(r, t.busIds) || !i) return null;
	if (Wt(r)) {
		let e = Na(X(n, "id")), t = Na(X(n, "dialId"));
		return e && t ? {
			id: e,
			dialId: t,
			target: r,
			points: i
		} : null;
	}
	let a = Ha(n, t);
	return a ? {
		...a,
		target: r,
		points: i
	} : null;
}
function Wa(e) {
	let t = Z(e);
	if (!t) return null;
	let { frequency: n, Q: r } = G, i = X(t, "frequency"), a = X(t, "Q");
	return {
		frequency: Q(i) ? $(i, n.min, n.max) : n.default,
		Q: Q(a) ? $(a, r.min, r.max) : r.default
	};
}
function Ga(e, t) {
	let n = Z(e), r = n && Ha(n, t), i = n ? X(n, "threshold") : void 0;
	return !r || !Q(i) ? null : {
		...r,
		threshold: $(i, -1e6, Ma),
		fadeSeconds: Fa(X(n, "fadeSeconds"), 30) ?? 0
	};
}
function Ka(e, t) {
	let n = Z(e), r = n && Ha(n, t), i = n ? X(n, "threshold") : void 0, a = n ? X(n, "kind") : void 0, o = n ? X(n, "to") : void 0;
	return !r || !Q(i) || typeof o != "string" || (a === "instrument" ? !t.rackIds.has(o) : a !== "pattern" || !t.patternIds.has(o)) ? null : {
		...r,
		threshold: $(i, -1e6, Ma),
		kind: a,
		to: o
	};
}
function qa(e, t, n) {
	let r = Z(e);
	if (!r) return null;
	let i = {
		links: Ia(X(r, "links"), Zt.links, n, "dial link", (e) => Ua(e, t)),
		layers: Ia(X(r, "layers"), Zt.layers, n, "layer rule", (e) => Ga(e, t)),
		swaps: Ia(X(r, "swaps"), Zt.swaps, n, "swap rule", (e) => Ka(e, t))
	}, a = za(X(r, "tempo"));
	a && (i.tempo = a);
	let o = Ba(X(r, "transpose"));
	return o && (i.transpose = o), i;
}
function Ja(e) {
	return !e.tempo && !e.transpose && e.links.length === 0 && e.layers.length === 0 && e.swaps.length === 0;
}
function Ya(e) {
	return Q(e) ? $(Math.round(e), 0, aa) : null;
}
function Xa(e) {
	let t = Z(e);
	if (!t) return null;
	let n = Na(X(t, "id")), r = Pa(X(t, "name")), i = Ya(X(t, "startTick")), a = Ya(X(t, "endTick"));
	return !n || !r || i === null || a === null ? null : {
		id: n,
		name: r,
		startTick: i,
		endTick: Math.max(i, a)
	};
}
function Za(e, t) {
	return Array.isArray(e) ? Ia(e, Zt.sections, t, "section", Xa) : null;
}
function Qa(e, t) {
	let n = Z(e);
	if (!n) return null;
	let r = Na(X(n, "id")), i = Pa(X(n, "name")), a = X(n, "action"), o = X(n, "landing");
	if (!r || !i || !Jt.includes(a)) return null;
	let s = {
		id: r,
		name: i,
		action: a,
		landing: Yt.includes(o) ? o : "bar",
		seconds: Fa(X(n, "seconds"), 30) ?? 0
	}, c = X(n, "sectionId");
	return typeof c == "string" && t.has(c) && (s.sectionId = c), s;
}
function $a(e, t, n) {
	if (!Array.isArray(e)) return null;
	let r = /* @__PURE__ */ new Set();
	return Ia(e, Zt.cues, n, "cue", (e) => {
		let n = Qa(e, t);
		return !n || r.has(n.name) ? null : (r.add(n.name), n);
	});
}
function eo(e) {
	let t = Z(e);
	if (!t) return null;
	let n = tn(), r = X(t, "mode"), i = X(t, "muffleHz");
	return {
		mode: Xt.includes(r) ? r : n.mode,
		muffleHz: Q(i) ? $(i, 50, Qt) : n.muffleHz,
		fadeSeconds: Fa(X(t, "fadeSeconds"), 30) ?? n.fadeSeconds
	};
}
function to(e, t, n, r) {
	let i = qa(X(t, "rules"), n, r);
	i && !Ja(i) && (e.rules = i);
	let a = Za(X(t, "sections"), r);
	a?.length && (e.sections = a);
	let o = $a(X(t, "cues"), new Set((a ?? []).map((e) => e.id)), r);
	o && (e.cues = o);
	let s = eo(X(t, "pause"));
	s && (e.pause = s);
	let c = Wa(X(t, "masterFilter"));
	c && !Kt(c) && (e.masterFilter = c);
}
//#endregion
//#region src/player/bundle.ts
var no = "sine-sculptor-song", ro = 3, io = Zt.dials;
function ao(e) {
	let t = {};
	for (let { name: n, ...r } of e) !_i(n) && !Object.hasOwn(t, n) && (t[n] = r);
	return t;
}
function oo(e) {
	return Object.entries(e).map(([e, t]) => ({
		...t,
		name: e
	}));
}
function so() {
	return { limiterDb: -1 };
}
function co(e, t, n = {}) {
	let { song: r, instruments: i } = gr(e, t), a = new Set(i.map((e) => e.id));
	for (let n of e.rules?.swaps ?? []) {
		let r = n.kind === "instrument" && !a.has(n.to) ? t.find((e) => e.id === n.to) : void 0;
		r && (a.add(r.id), i.push(hr(r, e)));
	}
	return {
		format: no,
		version: i.some(lo) ? 3 : 2,
		name: r.name,
		song: r,
		instruments: i,
		dials: po(n.dials ?? {}, []),
		tempo: n.tempo ?? null,
		mix: uo(n.mix)
	};
}
function lo(e) {
	let t = e.kit?.pads;
	return !!t && (e.layers.length !== t.length || t.some((e, t) => e.layers.length !== 1 || e.layers[0] !== t));
}
function uo(e) {
	let t = so();
	if (typeof e != "object" || !e || Array.isArray(e)) return t;
	let n = J(e, "limiterDb");
	return fo(n) && (t.limiterDb = Math.min(0, Math.max(-24, n))), t;
}
function fo(e) {
	return typeof e == "number" && Number.isFinite(e);
}
function po(e, t) {
	let n = {};
	if (typeof e != "object" || !e || Array.isArray(e)) return n;
	let r = /* @__PURE__ */ new Set();
	for (let i of Object.keys(e).slice(0, io)) {
		if (_i(i)) continue;
		let a = J(e, i), o = typeof a == "object" && a && !Array.isArray(a) ? a : {}, s = La({
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
function mo(e, t, n) {
	if (typeof e != "object" || !e || Array.isArray(e)) return null;
	let r = e, i = J(r, "dial"), a = ua(J(r, "bpmAtMin")), o = ua(J(r, "bpmAtMax"));
	return typeof i != "string" || !Object.hasOwn(t, i) || a === null || o === null ? (n.push("The tempo rule was unreadable, so the song keeps one tempo."), null) : {
		dial: i,
		bpmAtMin: a,
		bpmAtMax: o
	};
}
function ho(e) {
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
	if (!fo(r) || r < 1) return {
		ok: !1,
		error: "The song bundle has no format version."
	};
	if (r > 3) return {
		ok: !1,
		error: `This bundle needs a newer player (bundle format ${r}).`
	};
	let i = [], a = [], o = J(n, "instruments");
	if (Array.isArray(o)) {
		let e = /* @__PURE__ */ new Set();
		for (let t of o.slice(0, oa.rack)) {
			let n = hi(t);
			n.ok ? e.has(n.patch.id) || (e.add(n.patch.id), a.push(n.patch)) : i.push(`An instrument was dropped: ${n.error}`);
		}
	}
	let s = xa(a.map((e) => e.id)), c = ka(J(n, "song"), s);
	if (!c) return {
		ok: !1,
		error: "The song bundle holds no readable song."
	};
	i.push(...s.warnings());
	let l = po(J(n, "dials"), i);
	return {
		ok: !0,
		bundle: {
			format: no,
			version: r < 2 ? 1 : r < 3 ? 2 : 3,
			name: _a(J(n, "name"), c.name),
			song: c,
			instruments: a,
			dials: l,
			tempo: mo(J(n, "tempo"), l, i),
			mix: uo(J(n, "mix"))
		},
		warnings: i
	};
}
//#endregion
//#region src/player/core.ts
var go = .05, _o = .005;
function vo(e) {
	let t = bn(e), n = vn(e.timeSignature);
	return t <= 0 || n <= 0 ? e : {
		...e,
		loop: {
			enabled: !0,
			startTick: 0,
			endTick: Math.ceil(t / n) * n
		}
	};
}
var yo = {
	mode: "freeze",
	muffleHz: Qt,
	fadeSeconds: 0
};
function bo(e) {
	return e.mode === "freeze" && e.muffleHz >= 2e4 && e.fadeSeconds === 0;
}
function xo(e, t) {
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
			...sn(e),
			tempo: {
				dialId: r.id,
				points: i,
				glideBeats: 0,
				landing: "now"
			}
		}
	};
}
function So(e, t, n = {}) {
	let r = di(e, {
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
				n = ho(e);
			} catch {
				return {
					ok: !1,
					error: "The song bundle could not be read."
				};
			}
			if (!n.ok) return n;
			let i = n.bundle, l = xo(a ? vo(i.song) : i.song, i);
			i.version === 1 && !l.pause && (l = {
				...l,
				pause: yo
			}), c = bo(on(l)) ? null : on(l), r.setGame(null, [], []), t.setLimiter(i.mix.limiterDb);
			let u = oo(i.dials);
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
		setVolume(e, n = go) {
			o || t.setVolume(e, Math.max(_o, n));
		},
		setMuffle(e, t = go) {
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
function Co(e, t = {}) {
	let n = new e.Gain(Cn(t.volumeDb ?? 0)), r = new e.Limiter(-1), i = ir(e);
	n.connect(r), r.connect(i.input), i.output.connect(t.destination ?? e.getDestination());
	let a = So(nr(e), {
		destination: Yn(n),
		setVolume: (t, r) => n.gain.rampTo(Cn(t), r, e.immediate()),
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
export { no as BUNDLE_FORMAT, ro as BUNDLE_VERSION, co as buildBundle, ao as bundleDials, Co as createPlayer, so as defaultMix, oo as dialList, ho as parseBundle };
