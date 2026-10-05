//#region src/engine/glider.ts
var e = [
	"a",
	"e",
	"i",
	"o",
	"u"
], t = {
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
}, n = {
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
}, r = {
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
}, i = {
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
function a(e) {
	let t = e >>> 0;
	return () => {
		t = t + 1831565813 >>> 0;
		let e = t;
		return e = Math.imul(e ^ e >>> 15, e | 1), e ^= e + Math.imul(e ^ e >>> 7, e | 61), ((e ^ e >>> 14) >>> 0) / 4294967296;
	};
}
function o(e) {
	return e ^= e >>> 16, e = Math.imul(e, 2246822507), e ^= e >>> 13, e = Math.imul(e, 3266489909), (e ^ e >>> 16) >>> 0;
}
function s(e, t, n) {
	let r = o(Math.floor(e) ^ 2654435769), i = o(Math.floor(t) + 1663821227 | 0), s = o(Math.imul(Math.floor(n) + 1, 668265263));
	return a(o(r ^ i ^ s));
}
var c = (t) => e.includes(t);
function l(e, t, n, a) {
	let o = n(), s = n();
	if (a !== void 0 && Object.hasOwn(r, a)) return {
		syllable: r[a],
		manual: !1
	};
	if (e.mode === "vowel") return {
		syllable: {
			c: null,
			a: c(e.vowelA) ? e.vowelA : "o",
			b: c(e.vowelB) ? e.vowelB : "u"
		},
		manual: !0
	};
	let l = (Object.hasOwn(i, e.set) ? i[e.set] : i.kk).syllables, u = () => l[Math.min(l.length - 1, Math.floor(o * l.length))], d;
	return d = e.mode === "cycle" ? l[(Math.floor(t) % l.length + l.length) % l.length] : e.mode === "random" || s < e.randomness * .6 ? u() : e.mode, {
		syllable: r[d] ?? r.nah,
		manual: !1
	};
}
var u = (e) => 10 ** (e / 20), d = (e, t, n) => e + (t - e) * n;
function f(e, n, r) {
	return t.bass[e].map((i, a) => {
		let o = t.tenor[e][a];
		return [
			d(i[0], o[0], n) * r,
			u(d(i[1], o[1], n)),
			d(i[2], o[2], n)
		];
	});
}
//#endregion
//#region src/engine/params.ts
var p = [
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
function m(e) {
	return typeof e == "string" && p.includes(e);
}
function h(e, t, n, r, i, a) {
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
function g(e, t, n, r, i, a, o) {
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
var _ = [
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
], v = {
	value: "pulse",
	label: "Pulse"
}, y = [
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
], b = y.map((e) => e.value);
function x(e, t, n, r, i) {
	let a = `${e}oscillator.type`, o = [
		..._,
		...i.pulse ? [v] : [],
		...i.fat ? y : []
	], s = [g(a, `${n}Wave`, t, o, r, "The basic waveform the voice starts from, before any envelope or filter shapes it.", "Sine is pure and round, triangle is soft and hollow like an ocarina, sawtooth is bright and buzzy like brass, and square and pulse are the reedy tones of old game consoles.")];
	if (i.pulse && (s.push(h(`${e}oscillator.width`, `${n}Pulse width`, t, {
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
		let r = h(`${e}oscillator.spread`, `${n}Spread`, t, {
			min: 0,
			max: 100,
			default: 20,
			curve: "linear",
			step: 1,
			unit: "cents"
		}, "How far apart, in cents, the stacked copies of a fat wave are detuned from each other.", "A little spread gives a gentle chorus shimmer; a lot sounds like a detuned string section or a supersaw."), i = h(`${e}oscillator.count`, `${n}Copies`, t, {
			min: 2,
			max: 8,
			default: 3,
			curve: "linear",
			step: 1,
			unit: "voices"
		}, "How many detuned copies of the wave a fat oscillator stacks together.", "More copies make the sound thicker and smoother, at the cost of more processing per note.");
		r.visibleWhen = {
			path: a,
			equals: b
		}, i.visibleWhen = {
			path: a,
			equals: b
		}, s.push(r, i);
	}
	return s;
}
var S = {
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
function C(e, t, n, r, i) {
	let a = S[r], o = (e, t) => ({
		min: .001,
		max: e,
		default: t,
		curve: "log",
		unit: "s"
	}), s = [h(`${e}.attack`, `${n}Attack`, t, o(4, i.attack), ...a.attack), h(`${e}.decay`, `${n}Decay`, t, o(4, i.decay), ...a.decay)];
	return i.sustain !== void 0 && s.push(h(`${e}.sustain`, `${n}Sustain`, t, {
		min: 0,
		max: 1,
		default: i.sustain,
		curve: "linear",
		step: .01,
		unit: ""
	}, ...a.sustain)), s.push(h(`${e}.release`, `${n}Release`, t, o(8, i.release), ...a.release)), s;
}
var w = () => h("detune", "Detune", "Pitch", {
	min: -1200,
	max: 1200,
	default: 0,
	curve: "linear",
	step: 1,
	unit: "cents"
}, "Shifts the pitch of the whole voice in cents; 100 cents is one semitone and 1200 is an octave.", "Small amounts against another layer thicken the sound with a slow beating; 1200 or -1200 moves the layer a full octave."), T = () => h("portamento", "Glide", "Pitch", {
	min: 0,
	max: 1,
	default: 0,
	curve: "linear",
	step: .005,
	unit: "s"
}, "How long the pitch takes to slide from one note to the next; it only happens when a voice moves to a new note, so it is clearest at a polyphony of 1.", "At 0 notes jump cleanly; small values add a vocal slur between notes, and longer ones give the swoop of a slide guitar or a 303 bass line.");
function E(e) {
	let t = [h("harmonicity", "Harmonicity", "Modulation", {
		min: .25,
		max: 8,
		default: 3,
		curve: "log",
		step: .01,
		unit: "×"
	}, "The pitch ratio between the hidden modulating oscillator and the one you hear; 2 puts the modulator an octave above.", e ? "Whole numbers like 1, 2, and 3 give clean, musical tones; in-between values like 1.41 or 3.5 sound clangorous and bell-like." : "Whole numbers add clean, organ-like overtones; uneven values add a ring-modulated, robotic shimmer.")];
	return e && t.push(h("modulationIndex", "Mod depth", "Modulation", {
		min: .1,
		max: 100,
		default: 10,
		curve: "log",
		step: .1,
		unit: ""
	}, "How strongly the modulating oscillator bends the pitch of the one you hear, which sets how many overtones are added.", "Low values are soft and flute-like; high values turn bright and brassy, then harsh and metallic.")), t.push(g("modulation.type", "Mod wave", "Modulation", _, "square", "The waveform of the hidden modulating oscillator.", "Sine modulation is smooth and bell-like; square and sawtooth add buzzier, grittier overtones."), ...C("modulationEnvelope", "Modulation envelope", "Mod ", "mod", {
		attack: .5,
		decay: .01,
		sustain: 1,
		release: .5
	})), t;
}
function D() {
	return [
		...x("", "Oscillator", "", "triangle", {
			pulse: !0,
			fat: !0
		}),
		...C("envelope", "Envelope", "", "amp", {
			attack: .005,
			decay: .1,
			sustain: .3,
			release: 1
		}),
		w(),
		T()
	];
}
function O(e) {
	return [
		...x("", "Oscillator", "", "sine", {
			pulse: !0,
			fat: !0
		}),
		...C("envelope", "Envelope", "", "amp", {
			attack: .01,
			decay: .01,
			sustain: 1,
			release: .5
		}),
		...E(e),
		w(),
		T()
	];
}
var k = "The resting cutoff frequency of the filter, the brightness the note settles back to when the filter envelope closes.", A = "Lower values make the voice darker and more muffled; higher values let more buzz and sparkle through.";
function j() {
	return [
		...x("", "Oscillator", "", "sawtooth", {
			pulse: !0,
			fat: !0
		}),
		g("filter.type", "Filter type", "Filter", [
			{
				value: "lowpass",
				label: "Lowpass"
			},
			{
				value: "highpass",
				label: "Highpass"
			},
			{
				value: "bandpass",
				label: "Bandpass"
			}
		], "lowpass", "Which part of the sound the filter keeps: lowpass keeps the lows, highpass keeps the highs, and bandpass keeps a band in the middle.", "Lowpass is the classic warm synth bass; highpass thins a sound out; bandpass sounds nasal, like a telephone."),
		h("filterEnvelope.baseFrequency", "Cutoff", "Filter", {
			min: 20,
			max: 2e4,
			default: 200,
			curve: "log",
			unit: "Hz"
		}, k, A),
		h("filter.Q", "Resonance", "Filter", {
			min: .1,
			max: 20,
			default: 1,
			curve: "log",
			step: .1,
			unit: ""
		}, "How much the filter emphasizes the frequencies right at its cutoff point.", "Higher values add a whistling, vocal peak that sings as the filter sweeps; very high values squeal."),
		h("filterEnvelope.octaves", "Env amount", "Filter", {
			min: 0,
			max: 8,
			default: 3,
			curve: "linear",
			step: .1,
			unit: "oct"
		}, "How far, in octaves, the filter envelope opens the cutoff above its resting frequency.", "At 0 the tone stays static; 2–4 octaves give the classic sweep at the start of each note."),
		...C("filterEnvelope", "Filter envelope", "Filter ", "filter", {
			attack: .6,
			decay: .2,
			sustain: .5,
			release: 2
		}),
		...C("envelope", "Envelope", "", "amp", {
			attack: .005,
			decay: .1,
			sustain: .9,
			release: 1
		}),
		w(),
		T()
	];
}
function M(e) {
	let t = `voice${e}.`, n = `Voice ${e + 1}`, r = `V${e + 1} `;
	return [
		...x(t, n, r, "sawtooth", {
			pulse: !0,
			fat: !1
		}),
		h(`${t}filterEnvelope.baseFrequency`, `${r}Cutoff`, n, {
			min: 20,
			max: 2e4,
			default: 200,
			curve: "log",
			unit: "Hz"
		}, k, A),
		...C(`${t}envelope`, n, r, "amp", {
			attack: .01,
			decay: .01,
			sustain: 1,
			release: .5
		})
	];
}
function N() {
	return [
		h("harmonicity", "Interval", "Voices", {
			min: .25,
			max: 8,
			default: 1.5,
			curve: "log",
			step: .01,
			unit: "×"
		}, "The pitch ratio of the second voice to the first; 1.5 puts voice 2 a perfect fifth above voice 1.", "At 1 the voices double in unison, 2 adds an octave, and 1.5 gives a hollow power-chord fifth."),
		h("vibratoAmount", "Vibrato depth", "Vibrato", {
			min: 0,
			max: 1,
			default: .5,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How deep the built-in pitch wobble is.", "Small amounts add a gentle, singer-like waver; large amounts sound seasick."),
		h("vibratoRate", "Vibrato rate", "Vibrato", {
			min: .1,
			max: 20,
			default: 5,
			curve: "log",
			step: .1,
			unit: "Hz"
		}, "How fast the built-in pitch wobble cycles, in wobbles per second.", "Around 5–6 Hz feels like a singer or violinist; slower rates drift and faster ones flutter."),
		...M(0),
		...M(1),
		w(),
		T()
	];
}
function P() {
	return [
		...x("", "Oscillator", "", "sine", {
			pulse: !1,
			fat: !1
		}),
		h("pitchDecay", "Pitch drop", "Pitch", {
			min: .001,
			max: .5,
			default: .05,
			curve: "log",
			unit: "s"
		}, "How long the pitch takes to fall from its high starting point down to the played note.", "Very short values give a tight, clicky kick; longer ones give the falling boom of a tom or a zappy laser."),
		h("octaves", "Drop range", "Pitch", {
			min: 1,
			max: 16,
			default: 10,
			curve: "linear",
			step: .1,
			unit: "×"
		}, "How many times higher than the played note the pitch starts before it drops: 2× is one octave up, 8× is three.", "Small values give a soft, round thump; large values add a sharp, punchy click to the front of each hit."),
		...C("envelope", "Envelope", "", "amp", {
			attack: .001,
			decay: .4,
			sustain: .01,
			release: 1.4
		}),
		w()
	];
}
function F() {
	return [
		h("harmonicity", "Harmonicity", "Tone", {
			min: .5,
			max: 20,
			default: 5.1,
			curve: "log",
			step: .01,
			unit: "×"
		}, "The ratio between the pitches of the stacked oscillators that build the metallic tone.", "Changing it moves the hit between cymbal, cowbell, and gong colors; 5.1 is a classic hi-hat."),
		h("modulationIndex", "Density", "Tone", {
			min: 1,
			max: 100,
			default: 32,
			curve: "log",
			step: .1,
			unit: ""
		}, "How much the stacked oscillators bend each other, which sets how dense the overtones are.", "Low values sound like a tuned bell or cowbell; high values dissolve into a dense, hissy cymbal wash."),
		h("resonance", "Brightness", "Tone", {
			min: 200,
			max: 7e3,
			default: 4e3,
			curve: "log",
			unit: "Hz"
		}, "The lowest frequency the built-in highpass filter lets through, which sets the floor of the hit.", "Low values add body and clang; high values leave only the thin sizzle at the top of a hi-hat."),
		h("octaves", "Sweep", "Tone", {
			min: 0,
			max: 4,
			default: 1.5,
			curve: "linear",
			step: .1,
			unit: "oct"
		}, "How far, in octaves, the filter opens above the brightness setting during each hit.", "Higher values make each hit sweep brighter and splashier; with brightness already high, a big sweep thins the hit to almost nothing."),
		...C("envelope", "Envelope", "", "amp", {
			attack: .001,
			decay: 1.4,
			sustain: 0,
			release: .2
		}),
		w()
	];
}
function I() {
	let e = h("resonance", "Sustain", "String", {
		min: .1,
		max: .99,
		default: .7,
		curve: "linear",
		step: .01,
		unit: ""
	}, "How much energy the virtual string keeps on each pass, which sets how long the note rings.", "Low values give a short, dead thunk like pizzicato; values near the top ring out like a harp.");
	return e.rebuild = !0, [
		h("attackNoise", "Pick noise", "String", {
			min: .1,
			max: 20,
			default: 1,
			curve: "log",
			step: .1,
			unit: "cycles"
		}, "How long the burst of noise that sets the virtual string moving lasts, measured in cycles of the played note.", "Low values give a soft, rounded fingertip pluck; high values add a scratchy pick attack, like a harpsichord quill."),
		h("dampening", "Dampening", "String", {
			min: 200,
			max: 7e3,
			default: 4e3,
			curve: "log",
			unit: "Hz"
		}, "The cutoff of the filter inside the virtual string, which sets how quickly its high overtones die away.", "Low values sound like a muted or nylon-string pluck; high values ring like bright steel strings."),
		e,
		h("release", "Release", "String", {
			min: .01,
			max: 4,
			default: 1,
			curve: "log",
			unit: "s"
		}, "How long the string takes to stop ringing after you let go of the key.", "Short values mute the string like a palm resting on it; long ones let it ring naturally.")
	];
}
function L() {
	return [g("noise.type", "Noise color", "Noise", [
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
	], "white", "The color of the noise: white is even across all frequencies, pink tilts darker, and brown is darkest.", "White hisses like a hi-hat or snare wires, pink sounds like rain or surf, and brown rumbles like wind or distant thunder."), ...C("envelope", "Envelope", "", "amp", {
		attack: .005,
		decay: .1,
		sustain: 0,
		release: .3
	})];
}
var R = [
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
function ee() {
	let e = g("vowelA", "Vowel", "Syllable", R, "o", "The vowel every note sings in plain vowel mode, and where its glide starts.", "Ah and oh sound open and warm, ee and oo sound closed and small; eh sits in between."), t = g("vowelB", "Glide-to vowel", "Syllable", R, "u", "The vowel a held note drifts toward in plain vowel mode.", "Oh gliding to oo gives a rounded \"ohw\"; ah gliding to ee gives a bright \"eye\".");
	e.visibleWhen = {
		path: "syllableMode",
		equals: ["vowel"]
	}, t.visibleWhen = {
		path: "syllableMode",
		equals: ["vowel"]
	};
	let n = Object.entries(i).map(([e, t]) => ({
		value: e,
		label: t.label
	}));
	return [
		g("syllableMode", "Syllables", "Syllable", [
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
			...Object.keys(r).map((e) => ({
				value: e,
				label: `Always "${e}"`
			}))
		], "cycle", "Which bit of gibberish each note sings: the set in order, a seeded pick from the set, a plain vowel, or one fixed syllable.", "Cycle gives the steady nah-me-oh-now-queh patter; Random sounds more like real chatter, and a fixed syllable is the most robotic."),
		g("syllableSet", "Syllable set", "Syllable", n, "kk", "The pool of sounds that Cycle and Random draw from, so a cat can meow and a choir can sing \"ah\".", "Each set changes the consonants and vowels at once; try Babble for villager chatter or Choir for soft open vowels."),
		h("seed", "Lyric seed", "Syllable", {
			min: 1,
			max: 999,
			default: 7,
			curve: "linear",
			step: 1,
			unit: ""
		}, "Picks which made-up lyrics Random mode and Randomness choose; in a song, the same seed sings the same words on the same notes every time.", "Step through a few seeds on a phrase until the gibberish lands nicely; the game sings the song the same way. Notes played live follow the order you play them."),
		e,
		t,
		h("morph", "Vowel glide", "Syllable", {
			min: 0,
			max: 1,
			default: .6,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How far each held note slides from its first vowel toward its second, the slur that turns \"nah\" into \"now\".", "At 0 every vowel holds still and sounds sung; near 1 notes bend into diphthongs that sound more like words."),
		h("morphTime", "Glide time", "Syllable", {
			min: .05,
			max: 1.5,
			default: .35,
			curve: "log",
			unit: "s"
		}, "How long that vowel slide takes once the note has landed.", "Short glides sound chatty and quick; long ones give a lazy, drawn-out croon."),
		h("consonant", "Consonants", "Syllable", {
			min: 0,
			max: 1,
			default: .7,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How strongly the n, m, k, s, and other sounds at the start of each syllable come through.", "Low values blur the syllables into humming vowels; high values make every note pop like a spoken word."),
		h("randomness", "Randomness", "Syllable", {
			min: 0,
			max: 1,
			default: .35,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How much each note wanders: a fixed syllable sometimes swaps, and pitch and vowel color shift a little per note.", "A touch keeps a phrase from sounding like a machine; a lot sounds tipsy and off-key."),
		h("voiceMix", "Bass to tenor", "Voice", {
			min: 0,
			max: 1,
			default: .35,
			curve: "linear",
			step: .01,
			unit: ""
		}, "Blends between a bass singer’s vowel shapes and a tenor’s.", "Toward bass the vowels turn low and woolly; toward tenor they get lighter and clearer."),
		h("formantShift", "Voice size", "Voice", {
			min: .7,
			max: 1.5,
			default: 1,
			curve: "log",
			step: .01,
			unit: "×"
		}, "Scales the size of the throat the voice comes from without changing the note: under 1 is a bigger body, over 1 a smaller one.", "Push it up for chipmunk Animalese and tiny villagers; pull it down for giants, frogs, and whales."),
		h("bandwidth", "Vowel sharpness", "Voice", {
			min: .5,
			max: 3,
			default: 1.2,
			curve: "log",
			step: .01,
			unit: "×"
		}, "How wide each vowel resonance is: low values are narrow and focused, high values broad and blurred.", "Low settings sound crisp and robotic; high ones sound soft and mumbly, as if singing through a smile."),
		g("source", "Source wave", "Voice", [{
			value: "glottal",
			label: "Glottal (soft)"
		}, {
			value: "saw",
			label: "Sawtooth (buzzy)"
		}], "glottal", "The raw buzz the vowels are carved from, before any shaping.", "Glottal is round and gentle like a real throat; sawtooth is buzzier and cuts through a busy mix."),
		h("brightness", "Brightness", "Voice", {
			min: 600,
			max: 9e3,
			default: 3200,
			curve: "log",
			unit: "Hz"
		}, "A lowpass on the raw buzz that opens or darkens it before the vowels shape it.", "Low values sound hooded and far away, like an owl; high values add a forward, nasal edge."),
		h("breath", "Breathiness", "Voice", {
			min: 0,
			max: 1,
			default: .18,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How much airy hiss is mixed in through the vowels, with the buzz backing off as it rises.", "A little makes the voice intimate; near 1 it turns into a whisper with only a ghost of pitch."),
		h("roughness", "Roughness", "Voice", {
			min: 0,
			max: 1,
			default: 0,
			curve: "linear",
			step: .01,
			unit: ""
		}, "Chops the voice in fast pulses, the way a creaky or growling throat does.", "Low values give a sleepy vocal fry; high values become a growl, a bark, or a frog’s croak. At 0 it costs nothing."),
		w(),
		h("portamento", "Glide", "Pitch", {
			min: 0,
			max: .4,
			default: .06,
			curve: "linear",
			step: .005,
			unit: "s"
		}, "How long the pitch slides from the previous note when Scoop is off; it also sets how fast a scoop swoops.", "Small values add a vocal slur between notes; longer ones sound like a lazy, sliding crooner."),
		h("scoop", "Scoop", "Pitch", {
			min: 0,
			max: 300,
			default: 40,
			curve: "linear",
			step: 1,
			unit: "cents"
		}, "Starts every note this far flat and swoops up to pitch; 100 cents is one semitone.", "A little is the crooner’s signature; a lot sounds like a meow, a yodel flip, or a whale."),
		h("pitchDrop", "Fall on release", "Pitch", {
			min: 0,
			max: 1200,
			default: 0,
			curve: "linear",
			step: 1,
			unit: "cents"
		}, "How far the pitch sags while a note fades out after you let go.", "Pair it with a longer release to hear it: a few hundred cents gives a meow’s droop or the end of a bark."),
		h("vibDepth", "Vibrato depth", "Vibrato", {
			min: 0,
			max: 100,
			default: 28,
			curve: "linear",
			step: 1,
			unit: "cents"
		}, "How wide the singer’s pitch wobble is, in cents.", "Around 20–40 sounds like a natural singer; wider sounds operatic, then shaky like a goat."),
		h("vibRate", "Vibrato rate", "Vibrato", {
			min: 2,
			max: 9,
			default: 5.2,
			curve: "linear",
			step: .1,
			unit: "Hz"
		}, "How many times per second the pitch wobbles.", "About 5–6 sounds like a singer; slower drifts dreamily, faster flutters like a bird."),
		h("vibDelay", "Vibrato delay", "Vibrato", {
			min: 0,
			max: 1.2,
			default: .3,
			curve: "linear",
			step: .01,
			unit: "s"
		}, "How long a held note stays straight before the wobble fades in.", "Short notes stay clean while long ones bloom, the way trained singers do; at 0 every note wobbles at once."),
		h("envelope.attack", "Attack", "Envelope", {
			min: .002,
			max: 2,
			default: .03,
			curve: "log",
			unit: "s"
		}, "How long the voice takes to swell in on each syllable: after the burst of a k, t, or s, and through the hum of an n or m.", "Short attacks spit syllables out like chatter; long ones make a soft, swelling choir."),
		h("envelope.release", "Release", "Envelope", {
			min: .01,
			max: 4,
			default: .25,
			curve: "log",
			unit: "s"
		}, "How long the voice takes to fade after you let go, and how long any fall on release lasts.", "Short releases clip words off neatly; long ones let each note sigh away.")
	];
}
var z = {
	Synth: D(),
	AMSynth: O(!1),
	FMSynth: O(!0),
	MonoSynth: j(),
	DuoSynth: N(),
	MembraneSynth: P(),
	MetalSynth: F(),
	PluckSynth: I(),
	NoiseSynth: L(),
	FormantVoice: ee()
}, B = {
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
for (let e of p) for (let t of z[e]) Object.hasOwn(B[e], t.path) && (t.modulatable = !0);
function V(e, t) {
	return Object.hasOwn(B[e], t) ? B[e][t] : void 0;
}
function te(e, t) {
	let { min: n, max: r } = e;
	if (!(r > n)) return 0;
	let i = Math.min(r, Math.max(n, t)), a = e.curve === "log" && n > 0 ? Math.log(i / n) / Math.log(r / n) : (i - n) / (r - n);
	return Number.isFinite(a) ? a : 0;
}
function ne(e, t) {
	let { min: n, max: r } = e, i = Math.min(1, Math.max(0, Number.isFinite(t) ? t : 0));
	return e.curve === "log" && n > 0 ? n * (r / n) ** i : n + (r - n) * i;
}
function H(e, t) {
	return z[e].find((e) => e.path === t);
}
function re(e) {
	let t = {};
	for (let n of z[e]) t[n.path] = n.default;
	return t;
}
function ie(e, t) {
	if (e.kind === "choice") return typeof t == "string" && e.choices.some((e) => e.value === t) ? t : void 0;
	if (typeof t != "number" || !Number.isFinite(t)) return;
	let n = Math.min(e.max, Math.max(e.min, t));
	return e.step === 1 && (n = Math.round(n)), n;
}
function ae(e, t) {
	return oe(z[e], t);
}
function oe(e, t) {
	let n = typeof t == "object" && t ? t : {}, r = {};
	for (let t of e) {
		let e = Object.prototype.hasOwnProperty.call(n, t.path);
		r[t.path] = (e ? ie(t, n[t.path]) : void 0) ?? t.default;
	}
	return r;
}
function se(e, t, n) {
	let r = e.visibleWhen;
	if (!r) return !0;
	let i = t[r.path] ?? H(n, r.path)?.default;
	return typeof i == "string" && r.equals.includes(i);
}
var ce = /* @__PURE__ */ new Set([
	"__proto__",
	"prototype",
	"constructor"
]);
function le(e, t, n) {
	let r = t.split(".");
	if (r.some((e) => e === "" || ce.has(e))) throw Error(`Invalid param path "${t}"`);
	let i = e;
	for (let e = 0; e < r.length - 1; e++) {
		let t = i[r[e]];
		(typeof t != "object" || !t) && (i[r[e]] = {}), i = i[r[e]];
	}
	i[r[r.length - 1]] = n;
}
function U(e, t) {
	let n = {};
	for (let r of z[e]) se(r, t, e) && le(n, r.path, t[r.path] ?? r.default);
	return n;
}
function ue(e, t, n) {
	let r = {};
	for (let i of z[e]) i.path !== n && i.visibleWhen?.path !== n || !se(i, t, e) || le(r, i.path, t[i.path] ?? i.default);
	return r;
}
var de = [
	"filter",
	"distortion",
	"bitcrusher",
	"chorus",
	"phaser",
	"tremolo",
	"eq",
	"compressor"
];
function fe(e) {
	return typeof e == "string" && de.includes(e);
}
var pe = [
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
], me = pe.map(({ value: e, label: t }) => ({
	value: e,
	label: t
}));
function he(e) {
	return pe.find((t) => t.value === e)?.quarters ?? null;
}
function ge(e, t) {
	let n = he(e) ?? 1;
	return 60 / (Number.isFinite(t) && t > 0 ? t : 120) * n;
}
var W = () => {
	let e = h("wet", "Mix", "Mix", {
		min: 0,
		max: 1,
		default: 1,
		curve: "linear",
		step: .01,
		unit: ""
	}, "How much of the effected sound is heard against the dry sound going in.", "At 1 you hear only the pedal; lower values blend the untouched sound back in.");
	return e.modulatable = !0, e;
}, G = (e) => (e.modulatable = !0, e), _e = (e) => (e.rebuild = !0, e), ve = [
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
function ye() {
	return [
		g("type", "Type", "Filter", [
			{
				value: "lowpass",
				label: "Lowpass"
			},
			{
				value: "highpass",
				label: "Highpass"
			},
			{
				value: "bandpass",
				label: "Bandpass"
			},
			{
				value: "notch",
				label: "Notch"
			}
		], "lowpass", "Which part of the sound the filter keeps: lowpass keeps the lows, highpass the highs, bandpass a band in the middle, and notch cuts a band out.", "Lowpass darkens and warms, highpass thins, bandpass sounds like a telephone, and a swept notch gives a hollow, phasey whoosh."),
		G(h("frequency", "Cutoff", "Filter", {
			min: 20,
			max: 2e4,
			default: 1200,
			curve: "log",
			unit: "Hz"
		}, "The frequency where the filter starts to act on the whole instrument, after every layer is mixed.", "Sweep it slowly for the classic filter rise; an LFO on it gives a wah or a slow throb.")),
		G(h("Q", "Resonance", "Filter", {
			min: .1,
			max: 20,
			default: 1,
			curve: "log",
			step: .1,
			unit: ""
		}, "How much the filter emphasizes the frequencies right at the cutoff.", "Higher values add a vocal, whistling peak that sings as the cutoff moves; very high values squeal."))
	];
}
function be() {
	return [
		h("distortion", "Drive", "Distortion", {
			min: 0,
			max: 1,
			default: .4,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How hard the sound is pushed into the waveshaper that clips its peaks.", "Low values add a warm, gritty edge like a tube amp; high values turn into a buzzy fuzz pedal."),
		g("oversample", "Quality", "Distortion", [
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
		W()
	];
}
function xe() {
	return [h("bits", "Bits", "Bitcrusher", {
		min: 1,
		max: 16,
		default: 4,
		curve: "linear",
		step: 1,
		unit: "bits"
	}, "How many volume steps the sound is rounded to; each bit doubles the number of steps.", "Around 8 bits sounds like an old console sample; 3 or 4 bits turn into a fizzy, broken-speaker crunch."), W()];
}
function Se() {
	return [
		G(h("frequency", "Rate", "Chorus", {
			min: .1,
			max: 20,
			default: 1.5,
			curve: "log",
			step: .01,
			unit: "Hz"
		}, "How fast the chorus sweeps its delayed copies, in sweeps per second.", "Slow rates shimmer gently like a twelve-string; fast ones wobble toward vibrato.")),
		h("delayTime", "Delay", "Chorus", {
			min: 2,
			max: 20,
			default: 3.5,
			curve: "log",
			step: .1,
			unit: "ms"
		}, "How far behind the original the delayed copies sit before they sweep.", "Short delays give a tight shimmer; longer ones spread into a doubled, slightly detuned ensemble."),
		h("depth", "Depth", "Chorus", {
			min: 0,
			max: 1,
			default: .7,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How far the delayed copies sweep back and forth.", "Deeper settings make the pitch wobble more noticeably, from lush to seasick."),
		h("feedback", "Feedback", "Chorus", {
			min: 0,
			max: .9,
			default: 0,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How much of the chorus output is fed back into itself.", "A little adds a metallic, flanger-like edge; more makes it ring."),
		h("spread", "Width", "Chorus", {
			min: 0,
			max: 180,
			default: 180,
			curve: "linear",
			step: 1,
			unit: "°"
		}, "How far apart the left and right sweeps run, in degrees of their cycle.", "At 180 the two sides move opposite each other for a wide stereo image; at 0 the chorus sits in the middle."),
		W()
	];
}
function Ce() {
	return [
		G(h("frequency", "Rate", "Phaser", {
			min: .05,
			max: 20,
			default: .5,
			curve: "log",
			step: .01,
			unit: "Hz"
		}, "How fast the phaser sweeps its notches up and down, in sweeps per second.", "Slow rates give the swooshing jet sound; fast ones turn into a bubbly warble.")),
		h("octaves", "Range", "Phaser", {
			min: 0,
			max: 6,
			default: 3,
			curve: "linear",
			step: .1,
			unit: "oct"
		}, "How many octaves the notches sweep above their starting frequency.", "Small ranges are subtle and throaty; wide ranges sweep dramatically from dark to bright."),
		h("baseFrequency", "Base", "Phaser", {
			min: 50,
			max: 2e3,
			default: 350,
			curve: "log",
			unit: "Hz"
		}, "The lowest point of the sweep.", "Low values make the sweep growl through the body of the sound; high values keep it up in the sizzle."),
		G(h("Q", "Resonance", "Phaser", {
			min: .1,
			max: 20,
			default: 10,
			curve: "log",
			step: .1,
			unit: ""
		}, "How sharp and pronounced the sweeping notches are.", "Higher values make the sweep whistle and stand out; lower values keep it soft.")),
		_e(h("stages", "Stages", "Phaser", {
			min: 1,
			max: 12,
			default: 10,
			curve: "linear",
			step: 1,
			unit: ""
		}, "How many filter stages build the effect; more stages carve more notches.", "Few stages sound gentle and vintage; many sound deep and dramatic, and cost more processing.")),
		W()
	];
}
function we() {
	return [
		G(h("frequency", "Rate", "Tremolo", {
			min: .1,
			max: 40,
			default: 6,
			curve: "log",
			step: .01,
			unit: "Hz"
		}, "How fast the volume pulses, in pulses per second.", "Around 4–8 Hz is the classic surf-amp shimmer; faster rates flutter like a helicopter.")),
		G(h("depth", "Depth", "Tremolo", {
			min: 0,
			max: 1,
			default: .5,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How far the volume dips on each pulse.", "Low values add a gentle pulse; at 1 the sound chops all the way to silence.")),
		g("type", "Shape", "Tremolo", ve, "sine", "The shape of each volume pulse.", "Sine is smooth and gentle; square chops hard like a gate, and sawtooth gives a pumping swell."),
		h("spread", "Width", "Tremolo", {
			min: 0,
			max: 180,
			default: 0,
			curve: "linear",
			step: 1,
			unit: "°"
		}, "How far apart the left and right pulses run, in degrees of their cycle.", "At 180 the sound bounces between the speakers like an auto-panner; at 0 both sides pulse together."),
		W()
	];
}
var Te = (e, t, n, r) => G(h(e, t, "EQ", {
	min: -24,
	max: 12,
	default: 0,
	curve: "linear",
	step: .1,
	unit: "dB"
}, n, r));
function Ee() {
	return [
		Te("low", "Low", "Boosts or cuts everything below the low split.", "Cut it to stop a lead muddying the bass; boost it for a fatter bottom end."),
		Te("mid", "Mid", "Boosts or cuts the band between the two splits, where most of a sound’s body lives.", "Cutting scoops the sound out like a metal guitar tone; boosting pushes it forward like a telephone."),
		Te("high", "High", "Boosts or cuts everything above the high split.", "Boost for air and sparkle; cut to tame a harsh, fizzy top."),
		h("lowFrequency", "Low split", "EQ", {
			min: 40,
			max: 1e3,
			default: 400,
			curve: "log",
			unit: "Hz"
		}, "Where the low band ends and the mid band begins.", "Lower settings let the low knob touch only the deep bass; higher ones reach into the warmth."),
		h("highFrequency", "High split", "EQ", {
			min: 1e3,
			max: 1e4,
			default: 2500,
			curve: "log",
			unit: "Hz"
		}, "Where the mid band ends and the high band begins.", "Lower settings let the high knob shape the bite of the sound; higher ones touch only the sheen.")
	];
}
function De() {
	return [
		G(h("threshold", "Threshold", "Compressor", {
			min: -60,
			max: 0,
			default: -24,
			curve: "linear",
			step: .5,
			unit: "dB"
		}, "The level above which the compressor starts turning the sound down.", "Lower thresholds squash more of the sound, evening out loud and quiet notes.")),
		h("ratio", "Ratio", "Compressor", {
			min: 1,
			max: 20,
			default: 4,
			curve: "log",
			step: .1,
			unit: ":1"
		}, "How strongly sound above the threshold is turned down: at 4:1, every 4 dB over comes out as 1 dB over.", "Low ratios are gentle glue; high ratios flatten peaks like a limiter."),
		h("attack", "Attack", "Compressor", {
			min: .001,
			max: .5,
			default: .003,
			curve: "log",
			unit: "s"
		}, "How quickly the compressor clamps down once the sound crosses the threshold.", "Slower attacks let the click at the start of each note through, which makes plucks and drums punchier."),
		h("release", "Release", "Compressor", {
			min: .01,
			max: 1,
			default: .25,
			curve: "log",
			unit: "s"
		}, "How quickly the compressor lets go once the sound falls back under the threshold.", "Short releases pump and breathe audibly; long ones hold the level smooth."),
		h("knee", "Knee", "Compressor", {
			min: 0,
			max: 40,
			default: 30,
			curve: "linear",
			step: 1,
			unit: "dB"
		}, "How gradually compression fades in around the threshold.", "A hard knee (low) grabs abruptly; a soft knee (high) eases in and sounds more natural.")
	];
}
var Oe = {
	filter: ye(),
	distortion: be(),
	bitcrusher: xe(),
	chorus: Se(),
	phaser: Ce(),
	tremolo: we(),
	eq: Ee(),
	compressor: De()
};
function ke(e) {
	return Oe[e];
}
function Ae(e, t) {
	return Oe[e].find((e) => e.path === t);
}
var je = [
	"reverb",
	"delay",
	"chorus"
], Me = {
	reverb: "Reverb",
	delay: "Delay",
	chorus: "Chorus"
};
function Ne(e) {
	return typeof e == "string" && je.includes(e);
}
var Pe = {
	reverb: [h("decay", "Decay", "Reverb", {
		min: .2,
		max: 12,
		default: 2.5,
		curve: "log",
		step: .01,
		unit: "s"
	}, "How long the room keeps ringing after a sound stops.", "Short decays sound like a small room; long ones like a hall or a cave. Changing it rebuilds the room, so expect a brief catch."), h("preDelay", "Pre-delay", "Reverb", {
		min: 0,
		max: .25,
		default: .02,
		curve: "linear",
		step: .001,
		unit: "s"
	}, "A short gap before the reverb starts, as if the walls were farther away.", "A little pre-delay keeps notes crisp in front of the reverb instead of smearing into it.")],
	delay: [g("division", "Time", "Delay", me, "8n.", "The gap between echoes, locked to the song’s tempo.", "A dotted eighth gives the galloping echo of countless lead lines; a quarter note sounds like a canyon answering back."), h("feedback", "Feedback", "Delay", {
		min: 0,
		max: .9,
		default: .35,
		curve: "linear",
		step: .01,
		unit: ""
	}, "How much of each echo is fed back to make the next one.", "Low values give one or two repeats; high values keep echoing for a long time.")],
	chorus: [
		h("frequency", "Rate", "Chorus", {
			min: .1,
			max: 20,
			default: 1.5,
			curve: "log",
			step: .01,
			unit: "Hz"
		}, "How fast the chorus sweeps its delayed copies, in sweeps per second.", "Slow rates shimmer gently; fast ones wobble toward vibrato."),
		h("delayTime", "Delay", "Chorus", {
			min: 2,
			max: 20,
			default: 3.5,
			curve: "log",
			step: .1,
			unit: "ms"
		}, "How far behind the original the delayed copies sit.", "Short delays give a tight shimmer; longer ones spread into a doubled ensemble."),
		h("depth", "Depth", "Chorus", {
			min: 0,
			max: 1,
			default: .7,
			curve: "linear",
			step: .01,
			unit: ""
		}, "How far the delayed copies sweep back and forth.", "Deeper settings wobble the pitch more, from lush to seasick."),
		h("spread", "Width", "Chorus", {
			min: 0,
			max: 180,
			default: 180,
			curve: "linear",
			step: 1,
			unit: "°"
		}, "How far apart the left and right sweeps run.", "At 180 the chorus is as wide as it gets; at 0 it sits in the middle.")
	]
};
function Fe(e) {
	return Pe[e];
}
function Ie(e) {
	return oe(Pe[e], {});
}
function Le(e, t) {
	return oe(Pe[e], t);
}
var Re = [
	"sine",
	"triangle",
	"square",
	"sawtooth"
], K = {
	shape: g("shape", "Shape", "LFO", ve, "sine", "The shape of the slow wave that turns the knobs it is connected to.", "Sine and triangle sweep smoothly back and forth; square flips between two settings, and sawtooth ramps up and snaps back."),
	division: g("division", "Rate", "LFO", me, "1m", "How long one full sweep takes, locked to the song’s tempo.", "Longer divisions give slow evolving movement; short ones give rhythmic pulsing that stays in time with the song."),
	hz: h("hz", "Rate", "LFO", {
		min: .02,
		max: 20,
		default: 1,
		curve: "log",
		step: .01,
		unit: "Hz"
	}, "How many full sweeps the LFO makes each second, free of the tempo.", "Below 1 Hz the movement drifts slowly; around 5 Hz it becomes vibrato or tremolo territory."),
	depth: h("depth", "Depth", "LFO", {
		min: 0,
		max: 1,
		default: .5,
		curve: "linear",
		step: .01,
		unit: ""
	}, "How much of each connected knob’s travel the LFO sweeps, centered on where the knob is set.", "Small depths add subtle life; large ones swing the knob across most of its range."),
	connectionDepth: h("depth", "Amount", "LFO", {
		min: -1,
		max: 1,
		default: 1,
		curve: "linear",
		step: .01,
		unit: ""
	}, "How much of this LFO’s sweep reaches this one knob; negative values run it backward.", "Run two knobs at opposite amounts and one rises while the other falls.")
};
function ze(e, t) {
	return e.sync ? 1 / ge(e.division, t) : Number.isFinite(e.hz) ? Math.min(K.hz.max, Math.max(K.hz.min, e.hz)) : K.hz.default;
}
var Be = {
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
function Ve(e) {
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
function He(e, t) {
	let n = Ve(t);
	if (!n) return null;
	if (n.kind === "layer") {
		let t = e.layers[n.layer];
		if (!t) return null;
		if (n.path === "volume") return Be;
		let r = H(t.voiceType, n.path);
		return r?.kind === "number" && V(t.voiceType, n.path) ? r : null;
	}
	let r = e.effects?.find((e) => e.id === n.effectId), i = r ? Ae(r.type, n.path) : void 0;
	return i?.kind === "number" && i.modulatable ? i : null;
}
function Ue(e, t) {
	let n = He(e, t), r = Ve(t);
	if (!n || !r) return null;
	let i;
	if (r.kind === "layer") {
		let t = e.layers[r.layer];
		i = r.path === "volume" ? t.volume : t.params[r.path];
	} else i = e.effects.find((e) => e.id === r.effectId).params[r.path];
	return typeof i == "number" && Number.isFinite(i) ? i : n.default;
}
function We(e, t, n) {
	let r = te(e, t), i = Math.min(1, Math.abs(Number.isFinite(n) ? n : 0)) / 2, a = ne(e, r - i), o = ne(e, r + i);
	return n < 0 ? [o, a] : [a, o];
}
var q = (e, t) => Object.hasOwn(e, t) ? e[t] : void 0;
function Ge(e) {
	if (typeof e != "string") return null;
	let t = e.trim();
	return t.length > 0 && t.length <= 64 && !t.includes(":") && ![
		"__proto__",
		"prototype",
		"constructor"
	].includes(t) ? t : null;
}
var Ke = (e, t, n, r) => typeof e == "number" && Number.isFinite(e) ? Math.min(n, Math.max(t, e)) : r;
function qe(e) {
	if (typeof e != "object" || !e || Array.isArray(e)) return null;
	let t = e, n = Ge(q(t, "id")), r = q(t, "type");
	return n === null || !fe(r) ? null : {
		id: n,
		type: r,
		bypass: q(t, "bypass") === !0,
		params: oe(Oe[r], q(t, "params"))
	};
}
function Je(e, t) {
	if (typeof e != "object" || !e || Array.isArray(e)) return null;
	let n = e, r = Ge(q(n, "id"));
	if (r === null) return null;
	let i = q(n, "shape"), a = q(n, "division"), o = [], s = q(n, "connections");
	if (Array.isArray(s)) for (let e of s.slice(0, 64)) {
		if (o.length >= 16) break;
		if (typeof e != "object" || !e) continue;
		let n = q(e, "target");
		typeof n == "string" && t(n) && !o.some((e) => e.target === n) && o.push({
			target: n,
			depth: Ke(q(e, "depth"), -1, 1, 1)
		});
	}
	return {
		id: r,
		shape: Re.includes(i) ? i : "sine",
		sync: q(n, "sync") !== !1,
		division: typeof a == "string" && he(a) !== null ? a : K.division.default,
		hz: Ke(q(n, "hz"), K.hz.min, K.hz.max, K.hz.default),
		depth: Ke(q(n, "depth"), 0, 1, K.depth.default),
		connections: o
	};
}
function Ye(e) {
	let t = [];
	if (!Array.isArray(e)) return t;
	for (let n of e.slice(0, 24)) {
		if (t.length >= 6) break;
		let e = qe(n);
		e && !t.some((t) => t.id === e.id) && t.push(e);
	}
	return t;
}
function Xe(e, t) {
	let n = [];
	if (!Array.isArray(e)) return n;
	let r = /* @__PURE__ */ new Set(), i = (e) => !r.has(e) && He(t, e) !== null;
	for (let t of e.slice(0, 12)) {
		if (n.length >= 3) break;
		let e = Je(t, i);
		if (e && !n.some((t) => t.id === e.id)) {
			for (let t of e.connections) r.add(t.target);
			n.push(e);
		}
	}
	return n;
}
//#endregion
//#region src/song/game.ts
var Ze = ["master:filter.frequency", "master:filter.Q"];
function Qe(e) {
	return Ze.includes(e);
}
var $e = {
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
function et() {
	return {
		frequency: $e.frequency.default,
		Q: $e.Q.default
	};
}
function tt(e) {
	return e.frequency >= $e.frequency.max && Math.abs(e.Q - $e.Q.default) < 1e-6;
}
function nt(e) {
	return e.masterFilter ?? et();
}
var rt = [
	"jump",
	"stop",
	"fadeOut",
	"tapeStop"
], it = [
	"now",
	"beat",
	"bar"
], at = [
	"freeze",
	"muffled",
	"stop"
], ot = {
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
}, st = 2e4, ct = .75, lt = "game-over";
function ut() {
	return {
		mode: "freeze",
		muffleHz: 400,
		fadeSeconds: .4
	};
}
function dt() {
	return [{
		id: lt,
		name: "Game over",
		action: "tapeStop",
		landing: "now",
		seconds: ct
	}];
}
function ft() {
	return {
		links: [],
		layers: [],
		swaps: []
	};
}
function pt(e) {
	return e.cues ?? dt();
}
function mt(e) {
	return e.pause ?? ut();
}
function ht(e) {
	return e.rules ?? ft();
}
function gt(e) {
	return e.sections ?? [];
}
function _t(e, t) {
	let n = Math.min(e.max, Math.max(e.min, t));
	return e.step === "whole" ? Math.min(e.max, Math.max(e.min, Math.round(n))) : n;
}
function vt(e, t) {
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
function yt(e, t, n, r) {
	return r === null ? e >= t : r ? e >= t - Math.max(0, n) : e >= t;
}
function bt(e, t, n, r) {
	if (t === n) return n;
	let i = n > t ? e.riseSeconds : e.fallSeconds;
	if (!(i > 0)) return n;
	let a = Math.min(1, Math.max(0, r) / i);
	return a >= 1 ? n : t + (n - t) * a;
}
var xt = [
	"vox",
	"melody",
	"harmony",
	"bass",
	"kit",
	"perc"
];
function St(e) {
	return xt.includes(e);
}
function Ct() {
	return [{
		id: "reverb",
		name: "Reverb",
		type: "reverb",
		params: Ie("reverb"),
		returnDb: 0,
		mute: !1
	}, {
		id: "delay",
		name: "Delay",
		type: "delay",
		params: Ie("delay"),
		returnDb: 0,
		mute: !1
	}];
}
function wt(e) {
	return e.buses ?? Ct();
}
function Tt(e) {
	return 3840 / e.unit;
}
function Et(e) {
	return Tt(e) * e.beats;
}
function Dt(e) {
	return e.startTick + e.lengthTicks;
}
function Ot(e) {
	let t = 0;
	for (let n of e.tracks) for (let e of n.clips) t = Math.max(t, Dt(e));
	return t;
}
function kt(e) {
	return e.some((e) => e.solo);
}
function At(e, t) {
	return e.mute ? !1 : !t || e.solo;
}
function jt(e) {
	return e === -Infinity ? 0 : Number.isFinite(e) ? 10 ** (Math.min(e, 12) / 20) : 1;
}
function Mt(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(1, Math.max(-1, e)) : 0;
}
function Nt(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(1, Math.max(0, e)) : 0;
}
function Pt(e) {
	let t = kt(e), n = /* @__PURE__ */ new Map();
	for (let r of e) n.set(r.id, At(r, t) ? jt(r.volume) : 0);
	return n;
}
//#endregion
//#region src/song/overrides.ts
var Ft = {
	hz: K.hz,
	depth: K.depth
};
function It(e) {
	if (typeof e != "string") return null;
	if (e.startsWith("lfo:")) {
		let t = e.indexOf(":", 4), n = e.slice(4, t), r = e.slice(t + 1);
		return t > 4 && (r === "hz" || r === "depth") ? {
			kind: "lfo",
			lfoId: n,
			path: r
		} : null;
	}
	return Ve(e);
}
function Lt(e, t) {
	return t.kind === "layer" ? e.layers[t.layer] : void 0;
}
function Rt(e, t) {
	return t.kind === "fx" ? e.effects?.find((e) => e.id === t.effectId) : void 0;
}
function zt(e, t) {
	return t.kind === "lfo" ? e.lfos?.find((e) => e.id === t.lfoId) : void 0;
}
function Bt(e, t) {
	let n = It(t);
	if (!n) return null;
	if (n.kind === "layer") {
		let t = Lt(e, n);
		return t ? n.path === "volume" ? Be : H(t.voiceType, n.path) ?? null : null;
	}
	if (n.kind === "fx") {
		let t = Rt(e, n);
		return t ? Ae(t.type, n.path) ?? null : null;
	}
	return zt(e, n) ? Ft[n.path] : null;
}
function Vt(e, t) {
	let n = Bt(e, t), r = It(t);
	if (n) {
		if (r.kind === "layer") {
			let t = Lt(e, r);
			return (r.path === "volume" ? t.volume : t.params[r.path]) ?? n.default;
		}
		return r.kind === "fx" ? Rt(e, r).params[r.path] ?? n.default : zt(e, r)[r.path];
	}
}
function Ht(e, t, n) {
	let r = Bt(e, t);
	return r ? ie(r, n) : void 0;
}
function Ut(e, t, n) {
	let r = Ht(e, t, n);
	if (r === void 0 || Vt(e, t) === r) return e;
	let i = It(t);
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
function Wt(e, t) {
	if (!t) return e;
	let n = e;
	for (let [e, r] of Object.entries(t)) n = Ut(n, e, r);
	return n;
}
function Gt(e, t) {
	return Wt(e, t?.overrides?.[e.id]);
}
function Kt(e, t) {
	let n = new Set(e.tracks.map((e) => e.instrumentId)), r = t.filter((e) => n.has(e.id)).map((t) => Gt(t, e));
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
function qt(e) {
	return typeof e == "string" || typeof e == "boolean" || typeof e == "number" && Number.isFinite(e);
}
function Jt(e, t, n, r) {
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
			if (!It(e) || !qt(t)) {
				a++;
				continue;
			}
			o[e] = t, s++;
		}
		s > 0 && (i[n] = o);
	}
	return a > 0 && n(`${r}: dropped overrides for instruments or knobs it no longer has.`), Object.keys(i).length > 0 ? i : null;
}
function Yt(e) {
	return e.mute ? 0 : jt(Number.isFinite(e.returnDb) ? Math.min(6, Math.max(-60, e.returnDb)) : 0);
}
function Xt(e, t) {
	let n = typeof e.division == "string" ? e.division : "8n.";
	return Math.min(8, ge(n, t));
}
function Zt(e, t, n) {
	if (e === "delay") return {
		delayTime: Xt(t, n),
		feedback: t.feedback,
		wet: 1
	};
	let r = { wet: 1 };
	for (let n of Fe(e)) r[n.path] = t[n.path];
	return r;
}
function Qt(e, t, n, r) {
	let i = Zt(t, n, r);
	if (t === "reverb") return new e.Reverb(i);
	if (t === "delay") return new e.FeedbackDelay({
		...i,
		maxDelay: 8
	});
	let a = new e.Chorus(i);
	return a.start?.(), a;
}
var $t = .02;
function en(e, t, n, r, i) {
	let a = new e.Gain(1), o = new e.Gain(Yt(t));
	o.connect(n);
	let s = t.type, c = Le(s, t.params), l = r, u = null, d = Yt(t), f = t.name, p = 0, m = !1, h = null, g = !1, _ = () => {
		try {
			a.disconnect(), u?.dispose();
		} catch {}
		u = null;
	}, v = (e) => {
		if (_(), !m) {
			m = !0;
			try {
				i?.(`The ${Me[s]} bus “${f}” could not be built, so its send is silent.`, e);
			} catch {}
		}
	}, y = () => {
		let t = ++p;
		try {
			let n = Qt(e, s, c, l);
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
			let n = Le(t.type, t.params);
			if (t.type !== s) b(), s = t.type, c = n, _(), y();
			else {
				let e = {};
				for (let t of Fe(s)) n[t.path] !== c[t.path] && (e[t.path] = n[t.path]);
				if (c = n, Object.keys(e).length > 0 && s === "reverb") x();
				else if (Object.keys(e).length > 0 && u) try {
					u.set(s === "delay" ? {
						delayTime: Xt(c, l),
						feedback: c.feedback
					} : e);
				} catch {
					_(), y();
				}
			}
			let r = Yt(t);
			r !== d && (d = r, o.gain.rampTo(r, $t, e.immediate()));
		},
		setTempo(e) {
			if (!(!Number.isFinite(e) || e <= 0 || e === l) && (l = e, s === "delay" && u)) try {
				u.set({ delayTime: Xt(c, l) });
			} catch {}
		},
		dispose() {
			g = !0, b(), _(), a.dispose(), o.dispose();
		}
	};
}
//#endregion
//#region src/song/patterns.ts
var tn = [
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
function nn(e) {
	return tn.some((t) => t.size === e);
}
function rn(e) {
	return tn.find((t) => t.size === e)?.ticks ?? 240;
}
function an(e) {
	return e.length * rn(e.stepSize);
}
function on(e, t) {
	let n = rn(e.stepSize), r = t % 2 == 1 ? Math.round(e.swing * n / 2) : 0;
	return t * n + r;
}
function sn(e) {
	return typeof e.patternId == "string";
}
function cn(e, t) {
	return t === void 0 ? null : e.patterns?.find((e) => e.id === t) ?? null;
}
var ln = /* @__PURE__ */ new WeakMap();
function un(e, t) {
	let n = ln.get(e);
	n || (n = /* @__PURE__ */ new Map(), ln.set(e, n));
	let r = n.get(t);
	if (r) return n.delete(t), n.set(t, r), r;
	let i = an(e), a = [];
	if (i > 0 && t > 0) for (let n = 0; n < t; n += i) for (let r of e.rows) for (let o = 0; o < e.length; o++) {
		let s = r.steps[o] ?? 0;
		if (!(s > 0)) continue;
		let c = on(e, o), l = n + c;
		if (l >= t) continue;
		let u = o + 1 < e.length ? on(e, o + 1) : i, d = Math.max(1, Math.min(u - c, t - l));
		a.push({
			tick: l,
			durationTicks: d,
			midi: r.note,
			velocity: Math.min(1, s)
		});
	}
	return a.sort((e, t) => e.tick - t.tick || e.midi - t.midi), n.set(t, a), n.size > 8 && n.delete(n.keys().next().value), a;
}
var dn = [];
function fn(e, t) {
	if (!sn(t)) return t.notes;
	let n = cn(e, t.patternId);
	return n ? un(n, t.lengthTicks) : dn;
}
//#endregion
//#region src/playback/events.ts
function pn(e) {
	return Number.isFinite(e) ? Math.min(1, Math.max(0, e)) : 1;
}
function mn(e, t) {
	let n = [];
	for (let r of e.clips) {
		if (!Number.isFinite(r.startTick) || !(r.lengthTicks > 0)) continue;
		let e = Math.round(r.startTick + r.lengthTicks);
		for (let i of fn(t, r)) {
			if (!Number.isFinite(i.midi) || !(i.durationTicks > 0) || !(i.tick >= 0 && i.tick < r.lengthTicks)) continue;
			let t = Math.round(r.startTick + i.tick), a = Math.min(Math.round(r.startTick + i.tick + i.durationTicks), e);
			t < 0 || a <= t || n.push({
				start: t,
				end: a,
				midi: i.midi,
				velocity: pn(i.velocity)
			});
		}
	}
	return n;
}
function hn(e) {
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
function gn(e, t = {}) {
	let n = [];
	for (let r of hn(mn(e, t))) n.push({
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
function _n(e) {
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
function vn(e) {
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
//#region src/engine/allocator.ts
var yn = class {
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
	noteOn(e) {
		let t = ++this.clock, n = this.held.get(e);
		if (n !== void 0) return this.stamp[n] = t, {
			voice: n,
			stolen: null
		};
		let r = -1;
		for (let e = 0; e < this.owner.length; e++) this.owner[e] === null && (r < 0 || this.stamp[e] < this.stamp[r]) && (r = e);
		let i = null;
		if (r < 0) {
			r = 0;
			for (let e = 1; e < this.owner.length; e++) this.stamp[e] < this.stamp[r] && (r = e);
			i = this.owner[r], i !== null && this.held.delete(i);
		}
		return this.owner[r] = e, this.stamp[r] = t, this.held.set(e, r), {
			voice: r,
			stolen: i
		};
	}
	noteOff(e) {
		let t = this.held.get(e);
		return t === void 0 ? null : (this.held.delete(e), this.owner[t] = null, this.stamp[t] = ++this.clock, t);
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
//#endregion
//#region src/engine/formant-voice.ts
function bn() {
	let { "envelope.attack": e, "envelope.release": t, ...n } = re("FormantVoice");
	return xn({
		...n,
		attack: e,
		release: t
	}, {});
}
function xn(e, t) {
	let n = { ...e }, r = n;
	for (let [e, i] of Object.entries(t)) if (e === "envelope" && typeof i == "object" && i) {
		let e = i;
		typeof e.attack == "number" && (n.attack = e.attack), typeof e.release == "number" && (n.release = e.release);
	} else Object.hasOwn(r, e) && typeof i == typeof r[e] && (r[e] = i);
	return n;
}
var Sn = .35, Cn = .47, wn = 1.6, Tn = .12, En = 6e3, Dn = .006, On = .05, kn = Array.from({ length: 40 }, (e, t) => 1 / (t + 1) ** 1.6);
function An(e) {
	return 1200 * Math.log2(Math.min(2, Math.max(.5, e * 2)));
}
var jn = class {
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
		this.Tone = e, this.p = xn(bn(), t);
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
		this.puff = r(new e.Gain(Sn)), this.breathSig.connect(o.gain), a.connect(o), o.connect(this.puff), this.puff.connect(i);
		let s = r(new e.Gain(-.5));
		this.breathSig.connect(s), s.connect(this.srcGain.gain), this.amp = r(new e.Gain(0)), this.env = r(new e.Gain(0)), this.shiftSig = r(new e.Signal(n.formantShift));
		let c = r(new e.Gain(.5)), l = r(new e.WaveShaper(An, 1024));
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
		let t = xn(this.p, e), n = this.p;
		return this.p = t, t.brightness !== n.brightness && this.tilt.frequency.rampTo(t.brightness, .05), t.breath !== n.breath && this.breathSig.rampTo(t.breath, .05), t.formantShift !== n.formantShift && this.shiftSig.rampTo(t.formantShift, .05), t.vibRate !== n.vibRate && this.vibLfo.frequency.rampTo(t.vibRate, .05), t.detune !== n.detune && this.osc.detune.rampTo(t.detune, .05), this.applySource(), this.applyRoughness(), this;
	}
	applySource() {
		let e = this.p.source === "saw" ? "saw" : "glottal";
		e !== this.source && (this.source = e, e === "saw" ? this.osc.type = "sawtooth" : this.osc.partials = kn);
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
	sing(e, t, r, i) {
		this.wake(t);
		let a = this.p, o = s(a.seed, i.key ?? i.index, i.midi), { syllable: c, manual: d } = l({
			mode: a.syllableMode,
			set: a.syllableSet,
			vowelA: a.vowelA,
			vowelB: a.vowelB,
			randomness: a.randomness
		}, i.index, o, i.syllable), p = e * 2 ** ((o() - .5) * 2 * a.randomness * 25 / 1200), m = 1 + (o() - .5) * .1 * a.randomness, h = a.formantShift * m, g = f(c.a, a.voiceMix, m), _ = f(c.b, a.voiceMix, m), v = g.map((e, t) => e.map((e, n) => e + (_[t][n] - e) * a.morph)), y = a.consonant, b = !d && y > .02 && c.c ? n[c.c] ?? null : null, x = null, S = null;
		if (b?.vowel) {
			let e = f(b.vowel, a.voiceMix, m);
			x = e.map((e) => e[0]), S = e.map((e) => e[1]);
		} else b?.locus && (x = b.locus.map((e) => e * m), S = b.lg ? b.lg.map(u) : g.map((e) => e[1]));
		let C = b ? Math.max(.015, b.trans * (.4 + .6 * y)) : 0, w = b?.vot ?? 0, T = t + .004 + w, E = T + C, D = E + .1, O = D + a.morphTime, k = this.osc.frequency;
		k.cancelAndHoldAtTime(t);
		let A = k.getValueAtTime(t), j = typeof A == "number" && Number.isFinite(A) ? A : 0, M = p;
		a.scoop > 0 ? M = p * 2 ** (-a.scoop / 1200) : a.portamento > 0 && this.lastHz > 0 && (M = j > 0 ? j : this.lastHz), k.setValueAtTime(M, t), M !== p && k.exponentialRampToValueAtTime(p, t + Math.max(.02, a.portamento)), this.lastHz = p, this.curHz = p;
		let N = this.vibDepth.gain;
		N.cancelAndHoldAtTime(t), N.setValueAtTime(0, t), N.setValueAtTime(0, t + a.vibDelay), N.linearRampToValueAtTime(a.vibDepth, t + a.vibDelay + .3), this.formants.forEach((e, n) => {
			let [r, i, o] = g[n], s = Math.max(1, r * a.formantShift / (o * a.bandwidth)), c = e.filter.frequency, l = e.gain.gain;
			e.filter.Q.cancelAndHoldAtTime(t), e.filter.Q.setValueAtTime(s, t), c.cancelAndHoldAtTime(t), l.cancelAndHoldAtTime(t), c.setValueAtTime(x ? x[n] : r, t), l.setValueAtTime((S ? S[n] : i) * wn, t), c.linearRampToValueAtTime(r, E), l.linearRampToValueAtTime(i * wn, E), a.morph > .01 && (c.setValueAtTime(r, D), c.linearRampToValueAtTime(v[n][0], O), l.setValueAtTime(i * wn, D), l.linearRampToValueAtTime(v[n][1] * wn, O));
		});
		let P = this.amp.gain;
		if (P.cancelAndHoldAtTime(t), P.linearRampToValueAtTime(0, t + .004), b?.kind === "nasal") {
			let e = t + .004 + Math.max(.016, a.attack);
			P.linearRampToValueAtTime(1 - .65 * y, e), P.linearRampToValueAtTime(1, Math.max(E, e + .01));
		} else P.setValueAtTime(0, T), P.linearRampToValueAtTime(1, T + Math.max(.004, a.attack));
		let F = this.env.gain;
		F.cancelAndHoldAtTime(t), F.linearRampToValueAtTime(.5 + .5 * r, t + .005);
		let I = this.puff.gain;
		I.cancelAndHoldAtTime(t), I.setValueAtTime(Cn, t), I.linearRampToValueAtTime(Sn, t + .15);
		let L = this.cGain.gain;
		if (L.cancelAndHoldAtTime(t), L.linearRampToValueAtTime(0, t + Dn), b?.burst) {
			let [e, n, r] = b.burst, i = t + r + w, a = Math.min(En, e * Math.sqrt(h));
			this.cFilter.frequency.cancelAndHoldAtTime(t), this.cFilter.Q.cancelAndHoldAtTime(t), this.cFilter.frequency.linearRampToValueAtTime(a, t + Dn), this.cFilter.Q.linearRampToValueAtTime(n, t + Dn), L.linearRampToValueAtTime(Tn * y, t + Dn * 2), L.exponentialRampToValueAtTime(1e-4, Math.max(i, t + Dn * 3)), L.linearRampToValueAtTime(0, Math.max(i, t + Dn * 3) + Dn);
		}
	}
	release(e) {
		let t = this.p, n = this.env.gain;
		if (n.cancelAndHoldAtTime(e), n.linearRampToValueAtTime(0, e + t.release), t.pitchDrop > 0 && this.curHz > 0) {
			let n = this.osc.frequency;
			n.cancelAndHoldAtTime(e), n.exponentialRampToValueAtTime(this.curHz * 2 ** (-t.pitchDrop / 1200), e + t.release);
		}
		let r = this.cGain.gain;
		r.cancelAndHoldAtTime(e), r.linearRampToValueAtTime(0, e + Dn), this.sleepAfter(e + Math.max(t.release, Dn) + On);
	}
	dispose() {
		this.cancelSleep(), this.rough &&= (this.rough.lfo.dispose(), this.rough.gain.dispose(), null);
		for (let e of this.nodes) e.dispose();
		this.nodes.length = 0;
	}
};
function Mn(e) {
	return !!e?.kit && Array.isArray(e.kit.pads);
}
function Nn(e) {
	return Mn(e) ? e.layers.slice(0, Math.min(16, e.kit.pads.length)) : e.layers.slice(0, 3);
}
function Pn(e, t) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(127, Math.max(0, Math.round(e))) : t;
}
function Fn(e, t) {
	let n = typeof e == "object" && e && !Array.isArray(e) ? e : {}, r = Pn(Object.hasOwn(n, "note") ? n.note : void 0, t), i = Object.hasOwn(n, "name") ? n.name : void 0, a = {
		name: typeof i == "string" && i.replace(/[\u0000-\u001f\u007f]/g, " ").trim() ? i.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 24) : zn(r),
		note: r,
		pitch: Pn(Object.hasOwn(n, "pitch") ? n.pitch : void 0, r)
	}, o = Object.hasOwn(n, "choke") ? n.choke : void 0;
	return typeof o == "number" && Number.isInteger(o) && o >= 1 && o <= 8 && (a.choke = o), a;
}
function In(e, t) {
	if (!Array.isArray(e)) return null;
	let n = Math.min(e.length, t.length, 16);
	if (n === 0) return null;
	let r = [], i = /* @__PURE__ */ new Set();
	for (let t = 0; t < n; t++) {
		let n = Fn(e[t], 36 + t);
		i.has(n.note) && (n.note = Ln(n.note, i)), i.add(n.note), r.push(n);
	}
	return {
		kit: { pads: r },
		layers: t.slice(0, n)
	};
}
function Ln(e, t) {
	for (let n = 0; n < 128; n++) {
		if (e + n <= 127 && !t.has(e + n)) return e + n;
		if (e - n >= 0 && !t.has(e - n)) return e - n;
	}
	return e;
}
var Rn = {
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
function zn(e) {
	return Rn[e] ?? `Pad ${e}`;
}
function Bn(e) {
	return 440 * 2 ** ((e - 69) / 12);
}
function Vn(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(16, Math.max(1, Math.round(e))) : 1;
}
function Hn(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(6, Math.max(-60, e)) : 0;
}
function Un(e, t) {
	try {
		e.set(t);
	} catch (t) {
		throw e.dispose(), t;
	}
}
var Wn = .004;
function Gn(e, t, n) {
	let r = -Infinity, i = (t) => (r = Math.max(t ?? e.immediate(), r + Wn), r), a = (t) => Math.max(t ?? e.immediate(), r);
	if (t === "FormantVoice") {
		let t = new jn(e, n);
		return {
			attack: (e, n, r, a) => t.sing(e, i(n), r, a),
			release: (e) => t.release(a(e)),
			startsAfter: (e) => r > e,
			node: t
		};
	}
	if (t === "NoiseSynth") {
		let t = new e.NoiseSynth();
		return Un(t, n), {
			attack: (e, n, r) => void t.triggerAttack(i(n), r),
			release: (e) => void t.triggerRelease(a(e)),
			startsAfter: (e) => r > e,
			node: t
		};
	}
	let o = e[t], s = new o();
	return Un(s, n), {
		attack: (e, t, n) => void s.triggerAttack(e, i(t), n),
		release: (e) => void s.triggerRelease(a(e)),
		startsAfter: (e) => r > e,
		node: s
	};
}
var Kn = {
	filter: "Filter",
	distortion: "Distortion",
	bitcrusher: "BitCrusher",
	chorus: "Chorus",
	phaser: "Phaser",
	tremolo: "Tremolo",
	eq: "EQ3",
	compressor: "Compressor"
};
function qn(e, t, n) {
	let r = e[Kn[t]], i = new r({ ...n });
	return (t === "chorus" || t === "tremolo") && i.start?.(), i;
}
function Jn(e, t) {
	let n = e;
	for (let e of t.split(".")) {
		if (n === null || typeof n != "object" && typeof n != "function" || !(e in n)) return;
		n = n[e];
	}
	return n;
}
function Yn(e) {
	return typeof e == "object" && !!e && typeof e.setValueAtTime == "function" && typeof e.cancelScheduledValues == "function";
}
var Xn = .005;
function Zn(e, t, n, r = {}) {
	let i = new e.Gain(1), a = n ?? e.getDestination();
	i.connect(a);
	let o = !1, s = r.bpm !== void 0 && Number.isFinite(r.bpm) && r.bpm > 0 ? r.bpm : 120, c = 0, l = [], u = /* @__PURE__ */ new Map(), d = (t) => {
		let n = U(t.voiceType, t.params);
		t.voices = [];
		for (let r = 0; r < t.polyphony; r++) {
			let r = Gn(e, t.voiceType, n);
			r.node.connect(t.choke ?? t.volume), t.voices.push(r);
		}
		t.alloc.reset(t.polyphony);
	}, f = (e) => {
		for (let t of e.voices) t.node.dispose();
		e.voices = [];
	}, p = Mn(t) ? t.kit.pads : null, m = Nn(t).map((t, n) => {
		let r = Vn(t.polyphony), a = Hn(t.volume), o = {
			voiceType: t.voiceType,
			params: ae(t.voiceType, t.params),
			polyphony: r,
			db: a,
			volume: new e.Volume(a),
			choke: p?.[n]?.choke ? new e.Gain(1) : null,
			voices: [],
			alloc: new yn(r),
			notes: 0
		};
		return o.choke?.connect(o.volume), o.volume.connect(i), d(o), o;
	}), h = /* @__PURE__ */ new Map(), g = m.map(() => []);
	p && m.forEach((e, t) => {
		let n = p[t];
		h.has(n.note) || h.set(n.note, t), n.choke && m.forEach((e, r) => r !== t && p[r].choke === n.choke && g[t].push(r));
	});
	let _ = (e, t) => {
		for (let n of e.alloc.releaseAll()) e.voices[n]?.release(t);
		let n = e.choke?.gain;
		n && (n.cancelScheduledValues(t), n.setTargetAtTime(0, t, Xn));
	}, v = (e) => typeof e == "number" && Number.isFinite(e) ? e : void 0, y = (e, t, n) => {
		let r = e.notes++;
		return {
			midi: t,
			index: v(n?.ordinal) ?? r,
			key: v(n?.key),
			syllable: typeof n?.syllable == "string" ? n.syllable : void 0
		};
	}, b = (t, n, r, i, a) => {
		let o = p[t], s = m[t], c = i ?? e.immediate();
		for (let e of g[t]) _(m[e], c);
		s.choke && (s.choke.gain.cancelScheduledValues(c), s.choke.gain.setValueAtTime(1, c));
		let { voice: l, stolen: u } = s.alloc.noteOn(n);
		return s.voices[l]?.attack(Bn(o.pitch), i, r, y(s, o.pitch, a)), u !== null;
	}, x = () => ({
		layers: m.map((e) => ({
			voiceType: e.voiceType,
			polyphony: e.polyphony,
			volume: e.db,
			params: e.params
		})),
		effects: l.map((e) => ({
			id: e.id,
			type: e.type,
			bypass: e.bypass,
			params: e.params
		}))
	}), S = (e) => {
		let t = Ve(e);
		if (!t) return [];
		if (t.kind === "layer") {
			let e = m[t.layer];
			if (!e) return [];
			if (t.path === "volume") return Yn(e.volume.volume) ? [e.volume.volume] : [];
			let n = V(e.voiceType, t.path);
			return n ? e.voices.map((e) => Jn(e.node, n)).filter(Yn) : [];
		}
		let n = l.find((e) => e.id === t.effectId);
		if (!n?.node || !Ae(n.type, t.path)?.modulatable) return [];
		let r = Jn(n.node, t.path);
		return Yn(r) ? [r] : [];
	}, C = (e, t, n = x()) => {
		let r = He(n, e.target), i = Ue(n, e.target);
		if (!r || i === null) return;
		let [a, o] = We(r, i, t.patch.depth * e.depth);
		e.lfo.min = a, e.lfo.max = o;
	}, w = (e, t) => {
		for (let t of S(e.target)) try {
			e.lfo.connect(t), t.overridden = !0, t.cancelScheduledValues(0), t.setValueAtTime(0, 0), e.params.push(t);
		} catch {}
		C(e, t);
	}, T = (e) => {
		for (let t of e.params) try {
			e.lfo.disconnect(t);
		} catch {}
		e.params = [];
	}, E = (t) => {
		let n = t.params;
		T(t);
		let r = Ue(x(), t.target), i = e.immediate();
		for (let e of n) try {
			e.overridden = !1, e.cancelScheduledValues(i), r !== null && e.setValueAtTime(r, i);
		} catch {}
	}, D = (e) => {
		let t = [];
		for (let n of u.values()) for (let r of n.links) r.target.startsWith(e) && t.push([r, n]);
		return t;
	}, O = (e) => {
		for (let [t] of D(e)) T(t);
	}, k = (e) => {
		for (let [t, n] of D(e)) t.params.length === 0 && w(t, n);
	}, A = (e) => {
		let t = null;
		for (let n of u.values()) for (let r of n.links) r.target === e && (t ??= x(), C(r, n, t));
	}, j = (e) => {
		let t = m[e];
		O(`layer:${e}:`), f(t), d(t), k(`layer:${e}:`);
	}, M = () => {
		i.disconnect();
		for (let e of l) e.node?.disconnect();
		let e = i;
		for (let t of l) t.node && !t.bypass && (e.connect(t.node), e = t.node);
		e.connect(a);
	}, N = (t) => {
		try {
			t.node = qn(e, t.type, t.params);
		} catch {
			t.node = null;
		}
	}, P = (e) => {
		O(`fx:${e.id}:`);
		try {
			e.node?.disconnect(), e.node?.dispose();
		} catch {}
		e.node = null;
	}, F = (e, t) => {
		let n = {}, r = !1;
		for (let i of ke(e.type)) {
			let a = ie(i, t[i.path]) ?? i.default;
			a !== e.params[i.path] && (e.params[i.path] = a, n[i.path] = a, i.rebuild && (r = !0));
		}
		let i = Object.keys(n);
		if (i.length === 0) return !1;
		if (!r && e.node) try {
			e.node.set(n);
		} catch {
			r = !0;
		}
		if (r || !e.node) return P(e), N(e), k(`fx:${e.id}:`), !0;
		for (let t of i) A(`fx:${e.id}:${t}`);
		return !1;
	}, I = (e) => {
		for (let t of u.values()) if (t.links.some((t) => t.target.startsWith(e))) {
			for (let n of t.links) if (n.target.startsWith(e)) {
				T(n);
				try {
					n.lfo.dispose();
				} catch {}
			}
			t.links = t.links.filter((t) => !t.target.startsWith(e)), t.patch = {
				...t.patch,
				connections: t.patch.connections.filter((t) => !t.target.startsWith(e))
			};
		}
	}, L = (e) => {
		let t = new Map(l.map((e) => [e.id, e])), n = [], r = [], i = !1;
		for (let a of e.slice(0, 24)) {
			if (n.length >= 6) break;
			let e = t.get(a?.id);
			if (e && e.type === a.type) {
				t.delete(e.id), e.bypass !== (a.bypass === !0) && (e.bypass = a.bypass === !0, i = !0), a.params && F(e, a.params) && (i = !0), n.push(e);
				continue;
			}
			let o = qe(a);
			if (!o || n.some((e) => e.id === o.id)) continue;
			let s = {
				...o,
				params: { ...o.params },
				node: null
			};
			N(s), n.push(s), r.push(s), i = !0;
		}
		for (let e of t.values()) P(e), I(`fx:${e.id}:`), i = !0;
		!i && n.some((e, t) => l[t] !== e) && (i = !0), l = n, i && M();
		for (let e of r) k(`fx:${e.id}:`);
	}, R = (e, t) => {
		for (let n of e.links) {
			t(n.target) ? E(n) : T(n);
			try {
				n.lfo.dispose();
			} catch {}
		}
		e.links = [];
	}, ee = (t) => {
		let n = e.immediate(), r = ze(t.patch, s);
		for (let i of t.patch.connections) {
			let a;
			try {
				a = new e.LFO({
					frequency: r,
					type: t.patch.shape,
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
			t.links.push(o), w(o, t), a.start(n);
		}
	}, z = (e, t) => e.connections.length === t.connections.length && e.connections.every((e, n) => e.target === t.connections[n].target), B = (e) => {
		let t = Xe(e, x()), n = new Set(t.map((e) => e.id));
		for (let [e, t] of u) n.has(e) || (R(t, () => !0), u.delete(e));
		let r = [], i = [];
		for (let e of t) {
			let t = e.connections, n = u.get(e.id);
			if (!n) {
				let t = {
					patch: e,
					links: []
				};
				u.set(e.id, t), r.push(t);
				continue;
			}
			let a = n.patch;
			if (n.patch = e, !z(a, e) || n.links.length !== t.length) {
				let e = new Set(t.map((e) => e.target));
				R(n, (t) => !e.has(t)), r.push(n);
				continue;
			}
			i.push([n, a]);
		}
		for (let e of r) ee(e);
		for (let [e, t] of i) {
			let n = e.patch, r = n.connections, i = ze(n, s), a = ze(t, s) !== i;
			for (let o of e.links) t.shape !== n.shape && (o.lfo.type = n.shape), a && (o.lfo.frequency.value = i), o.depth = r.find((e) => e.target === o.target)?.depth ?? o.depth;
			if (t.depth !== n.depth || t.connections !== r) {
				let t = x();
				for (let n of e.links) C(n, e, t);
			}
		}
	};
	t.effects?.length && L(t.effects), t.lfos?.length && B(t.lfos);
	let te = (e) => {
		o || e();
	};
	return {
		noteOn(e, t = 1, n, r) {
			if (o || !Number.isFinite(e)) return;
			let i = Number.isFinite(t) ? Math.min(1, Math.max(0, t)) : 1;
			if (p) {
				let t = h.get(e);
				t !== void 0 && b(t, e, i, n, r) && c++;
				return;
			}
			let a = Bn(e), s = !1;
			for (let t of m) {
				let { voice: o, stolen: c } = t.alloc.noteOn(e);
				c !== null && (s = !0), t.voices[o]?.attack(a, n, i, y(t, e, r));
			}
			s && c++;
		},
		noteOff(e, t) {
			if (!o) for (let n of m) {
				let r = n.alloc.noteOff(e);
				r !== null && n.voices[r]?.release(t);
			}
		},
		releaseAll() {
			if (o) return;
			let t = e.immediate();
			m.forEach((n, r) => {
				n.alloc.releaseAll(), n.notes = 0;
				let i = null, a = !1;
				n.voices.forEach((o, s) => {
					if (!o.startsAfter(t)) return o.release(void 0);
					try {
						i ??= U(n.voiceType, n.params);
						let t = Gn(e, n.voiceType, i);
						t.node.connect(n.choke ?? n.volume), a || O(`layer:${r}:`), a = !0, o.node.dispose(), n.voices[s] = t;
					} catch {
						o.release(void 0);
					}
				}), a && k(`layer:${r}:`);
			});
		},
		setParam(e, t, n) {
			let r = m[e];
			if (o || !r) return;
			let i = H(r.voiceType, t), a = i ? ie(i, n) : void 0;
			if (!i || a === void 0) return;
			if (r.params[t] = a, i.rebuild) {
				j(e);
				return;
			}
			let s = ue(r.voiceType, r.params, t);
			if (Object.keys(s).length > 0) try {
				for (let e of r.voices) e.node.set(s);
			} catch {
				j(e);
			}
			A(`layer:${e}:${t}`);
		},
		setLayerVolume(e, t) {
			let n = m[e];
			!o && n && Number.isFinite(t) && (n.db = Hn(t), n.volume.volume.value = n.db, A(`layer:${e}:volume`));
		},
		setEffects: (e) => te(() => L(Array.isArray(e) ? e : [])),
		setLfos: (e) => te(() => B(Array.isArray(e) ? e : [])),
		setTempo(e) {
			if (!(o || !Number.isFinite(e) || e <= 0 || e === s)) {
				s = e;
				for (let e of u.values()) {
					if (!e.patch.sync) continue;
					let t = ze(e.patch, s);
					for (let n of e.links) n.lfo.frequency.value = t;
				}
			}
		},
		bendPitch(e, t, n) {
			if (o || e.length === 0 || !Number.isFinite(n)) return;
			let r = Number.isFinite(t) ? Math.max(0, t) : 0;
			for (let t of m) {
				let i = t.params.detune, a = typeof i == "number" && Number.isFinite(i) ? i : 0;
				for (let i of t.voices) {
					let t = Jn(i.node, "detune");
					if (!Yn(t) || t.overridden) continue;
					let o = t.linearRampToValueAtTime;
					try {
						t.cancelScheduledValues(n), t.setValueAtTime(a + (r > 0 && o ? 0 : e[e.length - 1]), n), r > 0 && o && e.forEach((i, s) => o.call(t, a + i, n + r * (s + 1) / e.length));
					} catch {}
				}
			}
		},
		voiceStats() {
			let e = 0;
			for (let t of m) e += t.alloc.heldCount;
			return {
				active: e,
				steals: c
			};
		},
		dispose() {
			if (!o) {
				o = !0;
				for (let e of u.values()) R(e, () => !1);
				u.clear();
				for (let e of m) f(e), e.choke?.dispose(), e.volume.dispose();
				for (let e of l) P(e);
				l = [], i.dispose();
			}
		}
	};
}
//#endregion
//#region src/playback/patch-sync.ts
function Qn(e, t) {
	if (e.kit === t.kit) return !0;
	let n = e.kit?.pads, r = t.kit?.pads;
	return !n || !r || n.length !== r.length ? !1 : n.every((e, t) => e.note === r[t].note && e.pitch === r[t].pitch && e.choke === r[t].choke);
}
function $n(e, t) {
	return e.id === t.id && Qn(e, t) && e.layers.length === t.layers.length && e.layers.every((e, n) => {
		let r = t.layers[n];
		return e.voiceType === r.voiceType && e.polyphony === r.polyphony;
	});
}
function er(e, t, n) {
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
				if (r && $n(r.patch, n)) {
					r.patch !== n && l(r, n);
					return;
				}
				if (r || n !== i) {
					c();
					try {
						r = {
							patch: n,
							handle: Zn(e, n, t, { bpm: o })
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
//#region src/playback/ticks.ts
function tr(e, t, n) {
	return e / (60 / t * 1) * n;
}
function nr(e, t, n) {
	return e * (60 / t * 1) / n;
}
function rr(e, t) {
	return e + t * Math.max(Math.abs(e) * 2 ** -52, Number.MIN_VALUE);
}
function ir(e, t, n) {
	let r = nr(e, t, n);
	for (let i = 0; i < 64 && Math.floor(tr(r, t, n)) < e; i++) r = rr(r, 1);
	return r;
}
function ar(e, t, n) {
	let r = nr(e, t, n);
	for (let i = 0; i < 64 && tr(r, t, n) > e; i++) r = rr(r, -1);
	return r;
}
//#endregion
//#region src/playback/song-player.ts
var or = /* @__PURE__ */ new WeakMap();
function sr(e, t, n) {
	let r = or.get(e);
	return r || (r = vn(e), or.set(e, r)), r.get(t)?.get(n);
}
var cr = .02, lr = 1e-6;
function ur(e, t) {
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
function dr(e) {
	if (!e.enabled) return null;
	let t = Math.max(0, Math.round(e.startTick)), n = Math.round(e.endTick);
	return Number.isFinite(t) && Number.isFinite(n) && n > t ? {
		start: t,
		end: n
	} : null;
}
function fr(e, t) {
	return e.enabled === t.enabled && e.startTick === t.startTick && e.endTick === t.endTick;
}
function pr(e) {
	return Number.isFinite(e) ? Math.max(0, Math.round(e)) : 0;
}
function mr(e, t = {}) {
	let n = e.getTransport(), r = t.destination ?? e.getDestination(), i = (e, n) => {
		try {
			t.onError ? t.onError(e, n) : console.error(e, n);
		} catch {}
	};
	n.PPQ !== 960 && (n.PPQ = 960), n.swing = 0, n.loop = !1, n.loopStart = 0, n.loopEnd = ar(3840, n.bpm.value, 960);
	let a = null, o = null, s = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map(), l = 0, u = /* @__PURE__ */ new Map(), d = 0, f = "stopped", p = 0, m = 0, h = 0, g = 0, _ = !1, v = !1, y = !1, b = 0, x = /* @__PURE__ */ new Set(), S = /* @__PURE__ */ new Map(), C = 0, w = /* @__PURE__ */ new Map(), T = 0, E = 0, D = 0, O = () => {
		for (let e of [...x]) try {
			e(f);
		} catch (e) {
			i("A playback listener failed.", e);
		}
	}, k = (e) => {
		f !== e && (f = e, O());
	}, A = (e) => {
		v || (v = !0, i("An instrument failed while playing. Some notes may be missing.", e));
	}, j = !1, M = (e) => {
		j || (j = !0, i("A game rule could not be applied.", e));
	}, N = (e, t, r) => {
		let i = n.immediate();
		r !== null && (e.fadeEnd = r > 0 ? i + r : 0), e.gainTarget = t, e.gain.gain.rampTo(t, Math.max(cr, r ?? e.fadeEnd - i), i);
	}, P = (e) => {
		if (!t.meter) return null;
		try {
			return t.meter(e);
		} catch (e) {
			return i("A level meter could not be attached.", e), null;
		}
	}, F = () => {
		let e = n.bpm.value;
		if (!(e === l || !Number.isFinite(e) || e <= 0)) {
			l = e;
			for (let t of s.values()) t.instrument.setTempo(e);
			for (let { live: t } of c.values()) t.setTempo(e);
		}
	}, I = (e) => {
		b++, e.held.clear();
		try {
			e.instrument.handle()?.releaseAll();
		} catch (e) {
			A(e);
		}
	}, L = (e, t, n) => {
		let r = e.instrument.handle(), i = [...e.held.values()];
		e.held.clear();
		for (let e of i) try {
			r?.noteOff(e, t);
		} catch (e) {
			if (A(e), b !== n) return !1;
		}
		return !0;
	}, R = () => {
		for (let e of s.values()) I(e);
	}, ee = () => n.state === "started", z = () => {
		ee() && n.stop(n.now());
	}, B = (e) => {
		let t = a ? dr(a.loop) : null;
		if (_ = t !== null && e < t.end, t && _) {
			let e = n.bpm.value;
			n.loopStart = ir(t.start, e, 960), n.loopEnd = ar(t.end, e, 960);
		}
		n.loop = _;
	}, V = () => n.getTicksAtTime(n.now()), te = (e, t) => {
		let n = w.get(e);
		if (!n) return !0;
		w.delete(e);
		let r = T;
		for (let { action: e } of n) {
			try {
				e(t);
			} catch (e) {
				M(e);
			}
			if (r !== T || f !== "playing") return !1;
		}
		return !0;
	}, ne = (e, t, n = !1) => {
		if (f !== "playing" || t < h - lr || !n && t >= E - lr && t < D || (F(), !te(e, t))) return;
		let r = b;
		for (let n of [...s.values()]) {
			let i = n.table.get(e), a = i && n.instrument.handle();
			if (!i || !a) continue;
			for (let e of i.offs) {
				let i = n.held.get(e);
				if (i !== void 0) {
					n.held.delete(e);
					try {
						a.noteOff(i, t);
					} catch (e) {
						if (A(e), b !== r) return;
					}
				}
			}
			let o = n.pitched ? C : 0;
			for (let { midi: s, velocity: c } of i.ons) try {
				let r = n.held.get(s);
				r !== void 0 && (n.held.delete(s), a.noteOff(r, t));
				let i = s + o;
				if (i < 0 || i > 127) continue;
				n.held.set(s, i), a.noteOn(i, c, t, {
					key: e,
					ordinal: sr(n.table, e, s)
				});
			} catch (e) {
				if (A(e), b !== r) return;
			}
		}
		e === d && !_ && re(t);
	}, H = (e) => {
		if (w.size === 0) return;
		let t = [...w.values()].flat();
		w.clear();
		for (let { action: n, drop: r, onDrop: i } of t) {
			if (r) {
				try {
					i?.();
				} catch (e) {
					M(e);
				}
				continue;
			}
			try {
				n(e);
			} catch (e) {
				M(e);
			}
		}
	}, re = (e) => {
		f = "stopped", T++;
		let t = ++b;
		for (let n of [...s.values()]) if (!L(n, e, t)) return;
		try {
			n.stop(e);
		} catch (e) {
			i("The Transport could not be stopped.", e);
		}
		H(e), O();
	}, ie = (e) => {
		if (f !== "playing" || e < h - lr) return;
		let t = b;
		for (let n of [...s.values()]) if (!L(n, e, t)) return;
	};
	n.on("loop", ie);
	let ae = (e) => {
		let t = a ? dr(a.loop) : null;
		if (!a || (!t || e >= t.end) && e >= d) return !1;
		f === "playing" && R(), b++, T++, H(n.immediate()), B(e);
		let r = n.now();
		return ee() && n.stop(r), n.start(r, `${e}i`), h = r, g = e, v = !1, !0;
	}, oe = () => {
		let e = /* @__PURE__ */ new Set();
		for (let t of s.values()) for (let n of t.table.keys()) e.add(n);
		d > 0 && e.add(d);
		for (let t of w.keys()) e.add(t);
		for (let [t, r] of u) e.has(t) || (n.clear(r), u.delete(t));
		let t = n.bpm.value;
		for (let r of e) u.has(r) || u.set(r, n.schedule((e) => ne(r, e), ir(r, t, 960)));
	}, se = (e) => e === null ? null : o?.find((t) => t.id === e) ?? null, ce = (e) => {
		let t = S.get(e.id)?.instrumentId;
		return t !== void 0 && se(t) ? t : e.instrumentId;
	}, le = (e) => {
		let t = se(ce(e.track)), n = e.track.voiceLimit, r = S.get(e.track.id)?.knobs;
		if (t === e.source && n === e.limit && r === e.knobs) return;
		e.source = t, e.limit = n, e.knobs = r, e.pitched = t !== null && !t.kit;
		let i = t ? ur(t, n) : null;
		if (i && r) for (let [e, t] of Object.entries(r)) i = Ut(i, e, t);
		let a = e.instrument.handle();
		e.instrument.update(i), e.instrument.handle() !== a && e.held.clear();
	}, U = (e) => {
		let t = S.get(e.id);
		if (!t || t.volumeDb === void 0 && t.pan === void 0 && !t.sends) return e;
		let n = { ...e };
		return t.volumeDb !== void 0 && Number.isFinite(t.volumeDb) && (n.volume = t.volumeDb), t.pan !== void 0 && (n.pan = t.pan), t.sends && (n.sends = {
			...e.sends,
			...t.sends
		}), n;
	}, ue = (e) => {
		let t = S.get(e)?.gainScale;
		return t === void 0 || !Number.isFinite(t) ? 1 : Math.min(1, Math.max(0, t));
	}, de = (e) => {
		let t = Pt(e.map(U));
		for (let [e, n] of t) t.set(e, n * ue(e));
		return t;
	}, fe = (e) => {
		let t = S.get(e.id)?.patternId;
		return t !== void 0 && a?.patterns?.some((e) => e.id === t) ? t : void 0;
	}, pe = (e) => {
		let t = fe(e);
		return {
			table: _n(gn(t === void 0 ? e : {
				...e,
				clips: e.clips.map((e) => e.patternId === void 0 ? e : {
					...e,
					patternId: t
				})
			}, a ?? {})),
			swap: t
		};
	}, me = (t, a) => {
		let o = new e.Gain(a), s = er(e, o, i);
		n.bpm.value > 0 && s.setTempo(n.bpm.value);
		let c = {
			track: t,
			gain: o,
			gainTarget: a,
			fadeEnd: 0,
			panner: null,
			panTarget: Mt(U(t).pan),
			sends: /* @__PURE__ */ new Map(),
			instrument: s,
			source: null,
			limit: void 0,
			table: /* @__PURE__ */ new Map(),
			held: /* @__PURE__ */ new Map(),
			tap: null,
			knobs: void 0,
			pitched: !1,
			patternSwap: void 0
		};
		return {table: c.table, swap: c.patternSwap} = pe(t), le(c), c.panner = new e.Panner({
			pan: c.panTarget,
			channelCount: 2
		}), o.connect(c.panner), c.panner.connect(r), c.tap = P(c.panner), c;
	}, he = (e, t) => {
		try {
			e.panner.disconnect(t.gain);
		} catch {}
		t.gain.disconnect(), t.gain.dispose();
	}, ge = (e) => {
		I(e), e.instrument.dispose();
		for (let t of e.sends.values()) he(e, t);
		e.sends.clear(), e.tap?.dispose(), e.panner.dispose(), e.gain.dispose();
	}, W = (e) => {
		for (let t of s.values()) {
			let n = t.sends.get(e.bus.id);
			n && (he(t, n), t.sends.delete(e.bus.id));
		}
		e.tap?.dispose(), e.live.dispose();
	}, G = () => {
		for (let e of s.values()) ge(e);
		s.clear();
		for (let e of c.values()) W(e);
		c.clear();
		for (let e of u.values()) n.clear(e);
		u.clear(), d = 0;
	}, _e = (t) => {
		let a = wt(t), o = new Set(a.map((e) => e.id));
		for (let [e, t] of c) o.has(e) || (W(t), c.delete(e));
		for (let o of a) {
			let a = c.get(o.id);
			if (a) {
				a.bus !== o && a.live.update(o), a.bus = o;
				continue;
			}
			if (!t.tracks.some((e) => Nt(U(e).sends?.[o.id]) > 0)) continue;
			let s = en(e, o, r, n.bpm.value, i);
			c.set(o.id, {
				bus: o,
				live: s,
				tap: P(s.output)
			});
		}
	}, ve = (t, r) => {
		let i = Mt(r.pan);
		i !== t.panTarget && (t.panTarget = i, t.panner.pan.rampTo(i, cr, n.immediate()));
		for (let [i, a] of c) {
			let o = Nt(r.sends?.[i]), s = t.sends.get(i);
			if (s) {
				if (s.level === o) continue;
				s.level = o, s.gain.gain.rampTo(o, cr, n.immediate());
			} else if (o > 0) {
				let n = new e.Gain(o);
				t.panner.connect(n), n.connect(a.live.input), t.sends.set(i, {
					gain: n,
					level: o
				});
			}
		}
	}, ye = () => {
		f = "stopped", b++, T++, R(), z(), H(n.immediate()), O();
	}, be = (e) => {
		if (f !== "playing" || e.held.size === 0) {
			I(e);
			return;
		}
		let t = V(), r = /* @__PURE__ */ new Set();
		for (let [n, i] of e.table) if (n >= t || _) for (let e of i.offs) r.add(e);
		let i = n.immediate(), a = e.instrument.handle();
		for (let [t, n] of [...e.held]) if (!r.has(t)) {
			e.held.delete(t);
			try {
				a?.noteOff(n, i);
			} catch (e) {
				A(e);
			}
		}
	}, xe = (e, t) => {
		let r = a, i = t !== o;
		if (o = t, (!e || !r || e.id !== r.id) && (f !== "stopped" && ye(), H(n.immediate()), G(), j = !1, p = 0, m = 0), a = e, !e) return;
		if ((!r || r.bpm !== e.bpm) && Number.isFinite(e.bpm) && e.bpm > 0 && (n.bpm.value = e.bpm), !r || r.timeSignature !== e.timeSignature) {
			let { beats: t, unit: r } = e.timeSignature;
			t > 0 && r > 0 && (n.timeSignature = [t, r]);
		}
		let c = de(e.tracks), l = !1, u = /* @__PURE__ */ new Set();
		for (let t of e.tracks) {
			if (u.has(t.id)) continue;
			u.add(t.id);
			let n = s.get(t.id);
			if (!n) {
				s.set(t.id, me(t, c.get(t.id) ?? 0)), l = !0;
				continue;
			}
			let a = r !== null && r.patterns !== e.patterns && t.clips.some(sn), o = t.clips !== n.track.clips || a, d = i || t.instrumentId !== n.track.instrumentId || t.voiceLimit !== n.track.voiceLimit;
			n.track = t, o && ({table: n.table, swap: n.patternSwap} = pe(t), be(n), l = !0), d && le(n);
		}
		for (let [e, t] of s) u.has(e) || (ge(t), s.delete(e), l = !0);
		_e(e);
		for (let [e, t] of s) {
			ve(t, U(t.track));
			let n = c.get(e) ?? 0;
			n !== t.gainTarget && N(t, n, null);
		}
		F();
		let h = pr(Ot(e));
		h !== d && (d = h, l = !0), l && oe(), f === "playing" && (r && !fr(r.loop, e.loop) && B(V()), !_ && V() >= d && ye());
	}, Se = () => {
		let e = n.immediate();
		return e < h ? g : Math.max(0, n.getTicksAtTime(e));
	};
	return {
		setSong(e, t) {
			if (!(y || e === a && t === o)) try {
				xe(e, t);
			} catch (e) {
				i("The song could not be loaded for playback.", e);
			}
		},
		play() {
			y || f === "playing" || (F(), ae(f === "paused" ? m : p) && k("playing"));
		},
		pause() {
			y || f !== "playing" || (m = pr(Se()), f = "paused", b++, T++, R(), z(), H(n.immediate()), O());
		},
		stop() {
			y || f === "stopped" || ye();
		},
		seek(e) {
			y || (p = pr(e), m = p, f === "playing" && (ae(p) || ye()));
		},
		getCursorTick: () => p,
		getPositionTicks() {
			return f === "playing" ? Se() : f === "paused" ? m : p;
		},
		getState: () => f,
		voiceStats() {
			let e = {};
			for (let [t, n] of s) e[t] = n.instrument.handle()?.voiceStats() ?? {
				active: 0,
				steals: 0
			};
			return e;
		},
		refreshTempo() {
			y || F();
		},
		setTrackControl(e, t) {
			if (y) return;
			let n = S.get(e);
			t ? S.set(e, t) : S.delete(e);
			let r = s.get(e);
			if (r && a) try {
				(n?.instrumentId !== t?.instrumentId || n?.knobs !== t?.knobs) && le(r), fe(r.track) !== r.patternSwap && ({table: r.table, swap: r.patternSwap} = pe(r.track), be(r), oe()), (n?.pan !== t?.pan || n?.sends !== t?.sends || n?.volumeDb !== t?.volumeDb) && (_e(a), ve(r, U(r.track)));
				let i = de(a.tracks).get(e) ?? 0;
				if (i !== r.gainTarget) {
					let e = (n?.gainScale ?? 1) !== (t?.gainScale ?? 1), a = t?.gainSeconds ?? n?.gainSeconds ?? 0;
					N(r, i, e ? Number.isFinite(a) ? a : 0 : null);
				}
			} catch (e) {
				M(e);
			}
		},
		setTranspose(e) {
			Number.isFinite(e) && (C = Math.max(-48, Math.min(48, Math.round(e))));
		},
		atBoundary(e, t, r = {}) {
			let i = {
				tick: null,
				cancel: () => {}
			};
			if (y) return i;
			if (f !== "playing" || e === "now" || !a) return t(f === "playing" ? n.now() : n.immediate()), i;
			let o = e === "beat" ? Tt(a.timeSignature) : Et(a.timeSignature), s = (Math.floor(Math.max(0, V()) / o) + 1) * o, c = dr(a.loop);
			if (_ && c && s >= c.end) {
				let e = Math.ceil(c.start / o) * o;
				s = e < c.end ? e : c.start;
			}
			let l = {
				action: t,
				drop: r.drop === !0,
				onDrop: r.onDrop
			};
			return w.set(s, [...w.get(s) ?? [], l]), oe(), {
				tick: s,
				cancel: () => {
					let e = w.get(s);
					if (!e?.includes(l)) return;
					let t = e.filter((e) => e !== l);
					t.length > 0 ? w.set(s, t) : w.delete(s);
				}
			};
		},
		jumpAt(e, t) {
			if (y) return;
			let r = pr(e);
			if (f !== "playing" || !a) {
				p = r, m = r;
				return;
			}
			let i = dr(a.loop);
			if ((!i || r >= i.end) && r >= d) {
				re(t);
				return;
			}
			T++;
			let o = ++b;
			for (let e of [...s.values()]) if (!L(e, t, o)) return;
			B(r), n.stop(t), n.start(t, `${r}i`), h = t, g = r;
			let c = n.now(), l = 60 / (n.bpm.value * 960), _ = T, v = Math.max(0, Math.ceil((c - t) / l - 1e-9));
			E = t, D = t + v * l - lr;
			for (let e = r; e < r + v; e++) if (u.has(e) && ne(e, t + (e - r) * l, !0), _ !== T || f !== "playing") return;
		},
		stopAt(e) {
			!y && f === "playing" && re(e);
		},
		bendPitch(e, t, n) {
			if (!y) for (let r of s.values()) try {
				r.instrument.handle()?.bendPitch?.(e, t, n);
			} catch (e) {
				A(e);
			}
		},
		meterPeaks() {
			let e = {
				tracks: {},
				buses: {}
			};
			for (let [t, n] of s) n.tap && (e.tracks[t] = n.tap.read());
			for (let [t, n] of c) n.tap && (e.buses[t] = n.tap.read());
			return e;
		},
		subscribe(e) {
			return x.add(e), () => void x.delete(e);
		},
		dispose() {
			y || (f !== "stopped" && ye(), y = !0, G(), n.off("loop", ie), n.loop = !1, x.clear(), a = null, o = null);
		}
	};
}
//#endregion
//#region src/playback/game-runtime.ts
var hr = 20, gr = 400, _r = -60, vr = 1 / 30, yr = $e.frequency.max, br = $e.Q.default, xr = .1, Sr = .05, Cr = .005, wr = .02, Tr = .7, Er = 1e-4, Dr = "A game rule could not be applied.";
function Or() {
	let e = globalThis.document;
	return e && typeof e.addEventListener == "function" && typeof e.removeEventListener == "function" ? e : null;
}
function kr(e, t) {
	return e === void 0 || t === void 0 ? e === t : Math.abs(e - t) <= Er * Math.max(1, Math.abs(e), Math.abs(t));
}
function Ar(e, t) {
	if (!e || !t) return e === t;
	let n = Object.keys(e);
	return n.length === Object.keys(t).length && n.every((n) => Object.hasOwn(t, n) && kr(e[n], t[n]));
}
function jr(e, t) {
	return !e || !t ? e === t : kr(e.gainScale, t.gainScale) && kr(e.volumeDb, t.volumeDb) && kr(e.pan, t.pan) && Ar(e.sends, t.sends) && Ar(e.knobs, t.knobs) && e.instrumentId === t.instrumentId && e.patternId === t.patternId;
}
function Mr(e, t, n, r) {
	let i = Math.min(1, Math.max(0, t));
	if (e === "track:volume") return _r + i * 72;
	if (e === "track:pan") return Mt(i * 2 - 1);
	if (e.startsWith("track:send:")) return r.has(e.slice(11)) ? Nt(i) : null;
	let a = n ? He(n, e) : null;
	return a && !a.rebuild ? ne(a, i) : null;
}
function Nr(e = 12) {
	return Array.from({ length: e }, (t, n) => 1200 * Math.log2(1 - .98 * ((n + 1) / e)));
}
function Pr(e, t = {}) {
	let n = e.getTransport(), r = e.getContext(), i = (e, n) => {
		try {
			t.onError ? t.onError(e, n) : console.error(e, n);
		} catch {}
	}, a = new e.Gain(1), o = new e.Gain(1), s = new e.Gain(1), c = new e.Gain(1), l = new e.Gain(1);
	s.connect(c), c.connect(l), l.connect(t.destination ?? e.getDestination());
	let u = (t, n) => {
		let a = null, o = null;
		t.connect(n);
		let s = () => {
			a && (t.disconnect(a), a.disconnect(), a.dispose(), a = null, t.connect(n));
		};
		return {
			set(c, l, u) {
				if (S) return;
				let d = c >= yr && Math.abs(l - br) < 1e-6;
				(!d || a && o === null) && (!d && o !== null && (te(o), o = null), a || (a = new e.Filter({
					type: "lowpass",
					frequency: yr,
					Q: br
				}), a.connect(n), t.disconnect(n), t.connect(a)), V(a.frequency, Math.min(yr, c), u), V(a.Q, l, u), d && (o = r.setTimeout(() => {
					o = null;
					try {
						s();
					} catch (e) {
						i("The music filter could not step aside.", e);
					}
				}, Math.max(Cr, u) + .05)));
			},
			dispose() {
				te(o), o = null, a?.dispose(), a = null;
			}
		};
	}, d = u(a, o), f = u(o, s), p = !1, m = (e) => {
		p || (p = !0, i(Dr, e));
	}, h = mr(e, {
		onError: (e, t) => e === Dr ? m(t) : i(e, t),
		meter: t.meter,
		destination: a
	}), g = null, _ = [], v = ht({}), y = /* @__PURE__ */ new Map(), b = /* @__PURE__ */ new Map(), x = /* @__PURE__ */ new Map(), S = !1, C = null, w = 0, T = null, E = 0, D = null, O = /* @__PURE__ */ new Map(), k = /* @__PURE__ */ new Map(), A = /* @__PURE__ */ new Map(), j = /* @__PURE__ */ new Map(), M = /* @__PURE__ */ new Map(), N = null, P = !1, F = null, I = null, L = null, R = !1, ee = (e) => b.get(e) ?? y.get(e), z = (e) => e.tick === null ? null : e, B = () => e.immediate(), V = (e, t, n, r = B()) => {
		e.rampTo(t, Math.max(Cr, n), r);
	}, te = (e) => {
		e !== null && r.clearTimeout(e);
	}, H = () => h.getState() === "playing", re = (e) => y.get(e)?.value ?? null, ie = () => {
		let e = v.tempo, t = e ? re(e.dialId) : null, r = e && t !== null ? vt(e.points, t) : null;
		if (!e || r === null) {
			T?.cancel(), T = null, C !== null && g && Number.isFinite(g.bpm) && (n.bpm.value = g.bpm, h.refreshTempo()), C = null;
			return;
		}
		let i = Math.min(gr, Math.max(hr, r));
		if (w = i, C === null || !kr(C, i) || T) {
			if (e.landing === "now" || !H()) {
				T?.cancel(), T = null, C = i, n.bpm.value !== i && (n.bpm.value = i), h.refreshTempo();
				return;
			}
			T || C !== null && kr(C, i) || (C = i, T = z(h.atBoundary("bar", (e) => {
				T = null;
				let t = w;
				C = t;
				let r = v.tempo ? v.tempo.glideBeats * 60 / Math.max(hr, n.bpm.value) : 0;
				n.bpm.rampTo(t, Math.max(Cr, r), e), h.refreshTempo();
			})));
		}
	}, ae = () => {
		let e = v.transpose, t = e ? re(e.dialId) : null, n = e && t !== null ? vt(e.points, t) : null, r = n === null ? 0 : Math.max(-24, Math.min(24, Math.round(n)));
		r !== E && (E = r, D?.cancel(), D = z(h.atBoundary("bar", () => {
			D = null, h.setTranspose(E);
		})));
	}, oe = (e) => e ? _.find((t) => t.id === e) ?? null : null, se = (e) => {
		let t = {};
		for (let n of v.swaps) n.trackId === e && k.get(n.id) === !0 && (n.kind === "instrument" ? t.instrumentId = n.to : t.patternId = n.to);
		return t;
	}, ce = () => {
		if (g) {
			for (let e of v.swaps) {
				let t = y.get(e.dialId);
				t && k.set(e.id, yt(t.value, e.threshold, t.dial.cushion, k.get(e.id) ?? null));
			}
			for (let e of g.tracks) {
				let t = se(e.id), n = A.get(e.id) ?? {};
				if (t.instrumentId === n.instrumentId && t.patternId === n.patternId) {
					j.get(e.id)?.cancel(), j.delete(e.id);
					continue;
				}
				if (j.has(e.id)) continue;
				let r = e.id, i = z(h.atBoundary("bar", () => {
					j.delete(r), A.set(r, se(r)), le();
				}));
				i && j.set(r, i);
			}
		}
	}, le = (e) => {
		if (!g) return;
		let t = new Set(wt(g).map((e) => e.id)), n = /* @__PURE__ */ new Map(), r = (e) => {
			let t = n.get(e.id);
			return t || n.set(e.id, t = {}), t;
		}, i = new Map(g.tracks.map((e) => [e.id, e]));
		for (let [e, t] of A) {
			let n = i.get(e);
			n && (t.instrumentId !== void 0 && (r(n).instrumentId = t.instrumentId), t.patternId !== void 0 && (r(n).patternId = t.patternId));
		}
		for (let t of v.layers) {
			let n = i.get(t.trackId), a = y.get(t.dialId);
			if (!n || !a) continue;
			let o = O.get(t.id) ?? null, s = yt(a.value, t.threshold, a.dial.cushion, o);
			O.set(t.id, s);
			let c = r(n);
			c.gainScale = (c.gainScale ?? 1) * +!!s, c.gainSeconds = Math.max(c.gainSeconds ?? 0, e ?? t.fadeSeconds);
		}
		let a = { ...nt(g) };
		for (let e of v.links) {
			let n = re(e.dialId), o = n === null ? null : vt(e.points, n);
			if (o === null) continue;
			if (Qe(e.target)) {
				let t = e.target === "master:filter.Q" ? "Q" : "frequency";
				a[t] = ne($e[t], o);
				continue;
			}
			let s = e.trackId === void 0 ? void 0 : i.get(e.trackId);
			if (!s) continue;
			let c = oe(A.get(s.id)?.instrumentId ?? s.instrumentId), l = Mr(e.target, o, c, t);
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
		for (let [e, t] of n) jr(M.get(e), t) || (M.set(e, t), h.setTrackControl(e, t));
		for (let e of [...M.keys()]) n.has(e) || (M.delete(e), h.setTrackControl(e, null));
		(!N || !kr(N.frequency, a.frequency) || !kr(N.Q, a.Q)) && (N = a, d.set(a.frequency, a.Q, e === 0 ? Cr : xr));
	}, U = (e) => {
		if (g) try {
			ie(), ae(), ce(), le(e);
		} catch (e) {
			m(e);
		}
	}, ue = () => {
		if (S) return;
		let e = B();
		for (let t of y.values()) t.value = bt(t.dial, t.from, t.target, e - t.since);
		U();
	}, de = r.setInterval(ue, vr), fe = () => {
		T?.cancel(), T = null, C = null, D?.cancel(), D = null;
		for (let e of j.values()) e.cancel();
		j.clear(), O.clear(), k.clear();
	}, pe = () => {
		I?.cancel(), I = null, L = null, he();
	}, me = () => {
		let e = B();
		s.gain.cancelAndHoldAtTime(e), V(s.gain, 1, Cr, e);
	}, he = () => {
		R && (R = !1, me());
	}, ge = () => F !== null || L !== null && L.action !== "jump", W = () => {
		pe(), te(F), F = null, g && Number.isFinite(g.bpm) && (n.bpm.cancelScheduledValues(B()), n.bpm.value !== g.bpm && (n.bpm.value = g.bpm, h.refreshTempo())), C = null;
	}, G = () => {
		V(s.gain, 1, Cr), h.bendPitch([0], 0, B());
	}, _e = (e) => {
		P = !1, f.set(yr, br, e), V(c.gain, 1, e);
	}, ve = (e) => {
		if (!g) return 0;
		let t = e - h.getPositionTicks();
		return t < 0 && g.loop.enabled && (t += g.loop.endTick - g.loop.startTick), Math.max(0, t) * (60 / (Math.max(hr, n.bpm.value) * 960));
	}, ye = (e) => {
		te(F), F = r.setTimeout(() => {
			F = null;
			try {
				h.stop(), h.seek(0), W(), U();
			} catch (e) {
				i("A cue could not finish.", e);
			}
		}, Math.max(0, e));
	}, be = (e, t) => {
		let r = e.seconds;
		if (e.action === "jump") {
			let n = gt(g ?? {}).find((t) => t.id === e.sectionId);
			if (!n) return;
			h.jumpAt(n.startTick, t), r > 0 && (s.gain.cancelScheduledValues(t), s.gain.setValueAtTime(0, t), s.gain.linearRampToValueAtTime(1, t + r / 2));
			return;
		}
		if (e.action === "stop") {
			h.stopAt(t), h.seek(0);
			return;
		}
		if (e.action === "fadeOut") {
			let e = Math.max(Cr, r);
			s.gain.cancelScheduledValues(t), s.gain.setValueAtTime(1, t), s.gain.linearRampToValueAtTime(0, t + e), ye(t + e - B());
			return;
		}
		let i = r > 0 ? r : ct, a = Math.max(hr, n.bpm.value);
		n.bpm.linearRampTo(Math.max(1, a * wr), i, t), h.bendPitch(Nr(), i, t), s.gain.cancelScheduledValues(t), s.gain.setValueAtTime(1, t + i * Tr), s.gain.linearRampToValueAtTime(0, t + i), ye(t + i - B());
	}, xe = t.visibility === void 0 ? Or() : t.visibility, Se = () => {
		!S && xe && V(l.gain, +!xe.hidden, Sr);
	};
	return xe?.addEventListener("visibilitychange", Se), xe?.hidden && (l.gain.value = 0), {
		player: h,
		setGame(e, t, n) {
			if (S) return;
			let r = e?.id !== g?.id, i = e?.bpm !== g?.bpm;
			if (r) {
				for (let e of M.keys()) h.setTrackControl(e, null);
				M.clear(), P && _e(Cr);
			}
			h.setSong(e, t), g = e, _ = t, v = ht(e ?? {}), (r || i) && (C = null), r && (p = !1, fe(), A.clear(), h.setTranspose(0), E = 0);
			let a = /* @__PURE__ */ new Set();
			b.clear();
			for (let e of n) {
				if (a.has(e.id) || b.has(e.name)) continue;
				a.add(e.id);
				let t = y.get(e.id), n = _t(e, x.get(e.name) ?? x.get(e.id) ?? t?.target ?? e.defaultValue), r;
				if (!t) r = {
					dial: e,
					target: n,
					value: n,
					from: n,
					since: B()
				};
				else {
					let i = _t({
						...e,
						step: "continuous"
					}, t.value);
					r = n !== t.target || i !== t.value ? {
						dial: e,
						target: n,
						value: i,
						from: i,
						since: B()
					} : {
						...t,
						dial: e
					};
				}
				y.set(e.id, r), b.set(e.name, r);
			}
			for (let e of [...y.keys()]) a.has(e) || y.delete(e);
			U();
		},
		setDial(e, t, n = {}) {
			if (S || typeof e != "string" || !Number.isFinite(t)) return;
			x.set(e, t);
			let r = ee(e);
			if (!r) return;
			let i = _t(r.dial, t);
			i !== r.target && (r.from = r.value, r.since = B(), r.target = i), n.jump && (r.value = r.from = r.target), ue();
		},
		dialValue: (e) => ee(e)?.value ?? null,
		cue(e) {
			if (S || !g) return !1;
			let t = pt(g), n = t.find((t) => t.name === e) ?? t.find((t) => t.id === e);
			if (!n) return !1;
			let r = n.action === "jump" ? gt(g).find((e) => e.id === n.sectionId) : void 0;
			if (n.action === "jump" && !r) return !1;
			if (!H()) return r ? h.seek(r.startTick) : h.stop(), !0;
			if (F !== null && (W(), G()), pe(), I = z(h.atBoundary(n.landing, (e) => {
				I = null, L = null, R = !1;
				try {
					be(n, e);
				} catch (e) {
					me(), i("A cue could not be played.", e);
				}
			}, {
				drop: !0,
				onDrop: pe
			})), I && (L = n), n.action === "jump" && n.seconds > 0 && I && I.tick !== null) {
				let e = B() + ve(I.tick), t = Math.max(B(), e - n.seconds / 2);
				s.gain.cancelScheduledValues(t), s.gain.setValueAtTime(1, t), s.gain.linearRampToValueAtTime(0, Math.max(t + Cr, e)), R = !0;
			}
			return !0;
		},
		play() {
			S || (P && _e(mt(g ?? {}).fadeSeconds), H() && ge() && (W(), h.stop(), h.seek(0)), !H() && (W(), G(), U(), h.play()));
		},
		pause() {
			if (S || P || !H()) return;
			let e = mt(g ?? {});
			if (P = !0, pe(), e.mode === "stop") {
				h.stop(), h.seek(0);
				return;
			}
			f.set(e.muffleHz, br, e.fadeSeconds), e.mode === "freeze" && (h.pause(), e.fadeSeconds > 0 && V(c.gain, 0, e.fadeSeconds));
		},
		stop() {
			S || (P && _e(Cr), h.stop(), W(), U());
		},
		isPaused: () => P,
		settle: () => {
			for (let e of y.values()) e.value = e.from = e.target;
			O.clear(), k.clear(), U(0);
		},
		dispose() {
			if (!S) {
				S = !0, r.clearInterval(de), te(F), xe?.removeEventListener("visibilitychange", Se), h.dispose(), d.dispose(), f.dispose();
				for (let e of [
					a,
					o,
					s,
					c,
					l
				]) e.dispose();
				y.clear(), b.clear(), x.clear();
			}
		}
	};
}
var Fr = 3;
function Ir(e, t) {
	return typeof e == "string" ? e : t;
}
function Lr(e) {
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
	let i = n.kit !== null && typeof n.kit == "object" && !Array.isArray(n.kit) ? n.kit : null, a = i && Object.hasOwn(i, "pads") ? i.pads : void 0, o = Array.isArray(a) ? 16 : Fr, s = [];
	for (let [e, t] of n.layers.slice(0, o).entries()) {
		if (typeof t != "object" || !t) return {
			ok: !1,
			error: `Layer ${e + 1} is not an object.`
		};
		let n = t;
		if (!m(n.voiceType)) return {
			ok: !1,
			error: `Layer ${e + 1} uses an unknown voice type: ${JSON.stringify(n.voiceType)}.`
		};
		s.push({
			voiceType: n.voiceType,
			polyphony: Vn(n.polyphony),
			volume: Hn(n.volume),
			params: ae(n.voiceType, n.params)
		});
	}
	let c;
	if (Array.isArray(a)) {
		let e = In(a, s);
		if (!e) return {
			ok: !1,
			error: "The drum kit has no pads, so there is nothing to play."
		};
		c = e.kit, s = e.layers;
	}
	let l = {
		id: r,
		name: Ir(n.name, "Untitled"),
		category: Ir(n.category, "Uncategorized"),
		description: Ir(n.description, ""),
		layers: s
	};
	c && (l.kit = c);
	let u = Ye(n.effects);
	u.length > 0 && (l.effects = u);
	let d = Xe(n.lfos, l);
	return d.length > 0 && (l.lfos = d), {
		ok: !0,
		patch: l
	};
}
//#endregion
//#region src/state/immutable.ts
var Rr = /* @__PURE__ */ new Set([
	"__proto__",
	"prototype",
	"constructor"
]);
function zr(e) {
	return Rr.has(e);
}
function Br(e) {
	let t = 0;
	for (let n of Rr) Object.hasOwn(e, n) && t++;
	return t;
}
var Vr = 16, Hr = Vr * 4, Ur = 16, Wr = (e, t) => Object.hasOwn(e, t) ? e[t] : void 0;
function Gr(e) {
	if (typeof e != "string") return null;
	let t = e.trim();
	return t.length > 0 && t.length <= 64 && !zr(t) ? t : null;
}
function Kr(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(16, Math.max(1, Math.round(e))) : null;
}
function qr(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(6, Math.max(-60, e)) : null;
}
function Jr(e, t) {
	return typeof e == "string" && e.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 40).trim() || t;
}
function Yr(e) {
	if (typeof e != "object" || !e || Array.isArray(e)) return null;
	let t = {}, n = 0, r = 0;
	for (let i in e) {
		if (n >= Vr || r++ >= Hr) break;
		if (!Object.hasOwn(e, i)) continue;
		let a = Gr(i), o = Nt(Wr(e, i));
		a === null || a !== i || o <= 0 || (t[a] = o, n++);
	}
	return n > 0 ? t : null;
}
function Xr(e, t) {
	let n = Mt(Wr(t, "pan"));
	n !== 0 && (e.pan = n);
	let r = Yr(Wr(t, "sends"));
	r && (e.sends = r);
	let i = Kr(Wr(t, "voiceLimit"));
	i !== null && (e.voiceLimit = i);
}
function Zr(e) {
	if (typeof e != "object" || !e || Array.isArray(e)) return null;
	let t = e, n = Gr(Wr(t, "id")), r = Wr(t, "type");
	return n === null || !Ne(r) ? null : {
		id: n,
		name: Jr(Wr(t, "name"), Me[r]),
		type: r,
		params: Le(r, Wr(t, "params")),
		returnDb: qr(Wr(t, "returnDb")) ?? 0,
		mute: Wr(t, "mute") === !0
	};
}
function Qr(e, t, n) {
	if (e === void 0) return null;
	if (!Array.isArray(e)) return t(`${n} had an unreadable list of send buses, so it got the default Reverb and Delay.`), null;
	let r = [], i = Math.max(0, e.length - Ur);
	for (let t of e.slice(0, Ur)) {
		let e = Zr(t);
		!e || r.length >= 4 || r.some((t) => t.id === e.id) ? i++ : r.push(e);
	}
	return i > 0 && t(`${n}: dropped ${i === 1 ? "a send bus" : `${i} send buses`} that couldn’t be read or didn’t fit.`), r;
}
function $r(e, t) {
	if (!e.sends) return e;
	let n = Object.entries(e.sends).filter(([e]) => t.has(e));
	if (n.length === Object.keys(e.sends).length) return e;
	let r = { ...e };
	return n.length > 0 ? r.sends = Object.fromEntries(n) : delete r.sends, r;
}
//#endregion
//#region src/state/pattern-normalize.ts
var ei = 128, ti = 40, ni = (e, t) => Object.hasOwn(e, t) ? e[t] : void 0;
function ri(e) {
	return typeof e == "object" && e && !Array.isArray(e) ? e : null;
}
function ii(e) {
	if (typeof e != "string") return null;
	let t = e.trim();
	return t.length > 0 && t.length <= ei ? t : null;
}
function ai(e, t) {
	if (typeof e != "string") return t;
	let n = e.slice(0, 160).replace(/[\u0000-\u001f\u007f]/g, " ").trim();
	return Array.from(n).slice(0, ti).join("").trim() || t;
}
function oi(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(64, Math.max(1, Math.round(e))) : null;
}
function si(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(1, Math.max(0, e)) : null;
}
function ci(e) {
	return typeof e == "number" && Number.isFinite(e) ? Math.min(1, Math.max(0, e)) : 0;
}
function li(e, t) {
	let n = Array(t).fill(0);
	for (let r = 0; r < Math.min(t, e.length); r++) n[r] = ci(e[r]);
	return n;
}
function ui(e, t) {
	let n = ri(e);
	if (!n) return null;
	let r = ni(n, "note"), i = ni(n, "steps");
	if (typeof r != "number" || !Number.isFinite(r) || !Array.isArray(i)) return null;
	let a = Math.round(r);
	return a < 0 || a > 127 ? null : {
		note: a,
		steps: li(i.slice(0, 64), t)
	};
}
function di(e) {
	let t = ri(e);
	if (!t) return null;
	let n = ii(ni(t, "id"));
	if (n === null) return null;
	let r = oi(ni(t, "length")) ?? 16, i = ni(t, "stepSize"), a = ni(t, "rows"), o = [], s = /* @__PURE__ */ new Set();
	if (Array.isArray(a)) for (let e of a.slice(0, 64)) {
		let t = ui(e, r);
		if (t && !s.has(t.note) && (s.add(t.note), o.push(t), o.length >= 16)) break;
	}
	return {
		id: n,
		name: ai(ni(t, "name"), "Pattern"),
		length: r,
		stepSize: nn(i) ? i : "1/16",
		swing: si(ni(t, "swing")) ?? 0,
		rows: o
	};
}
function fi(e, t, n) {
	if (e === void 0) return null;
	if (!Array.isArray(e)) return t(`${n} had an unreadable pattern list, so its pattern clips are now empty.`), null;
	let r = [], i = /* @__PURE__ */ new Set(), a = 0;
	for (let t of e.slice(0, 128)) {
		let e = di(t);
		if (!e || i.has(e.id)) {
			a++;
			continue;
		}
		i.add(e.id), r.push(e);
	}
	return a += Math.max(0, e.length - 128), a > 0 && t(`${n}: dropped ${a} unreadable or repeated ${a === 1 ? "pattern" : "patterns"}.`), r.length > 0 ? r : null;
}
function pi(e, t, n, r) {
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
var mi = [...xt, "none"];
function hi(e) {
	return e === "none" || St(e);
}
function gi(e) {
	return e.role ?? "none";
}
function _i(e) {
	return mi.indexOf(e);
}
function vi(e) {
	let t = !0;
	for (let n = 1; n < e.length && t; n++) _i(gi(e[n - 1])) > _i(gi(e[n])) && (t = !1);
	return t ? e : e.map((e, t) => ({
		track: e,
		i: t,
		g: _i(gi(e))
	})).sort((e, t) => e.g - t.g || e.i - t.i).map((e) => e.track);
}
function yi(e) {
	if (!Array.isArray(e)) return [];
	let t = new Set(e.filter(hi));
	return mi.filter((e) => t.has(e));
}
function bi(e) {
	return Number.isFinite(e) ? Math.min(40, Math.max(3, Math.round(e * 16) / 16)) : 6;
}
function xi(e) {
	return typeof e == "number" && Number.isFinite(e) ? bi(e) : null;
}
//#endregion
//#region src/song/track-colors.ts
var Si = /^#[0-9a-f]{6}$/;
function Ci(e) {
	if (typeof e != "string") return null;
	let t = e.trim().toLowerCase();
	return Si.test(t) ? t : null;
}
//#endregion
//#region src/state/document.ts
function wi(e, t) {
	let n = Ci(J(t, "color"));
	n && (e.color = n, J(t, "colorPicked") === !0 && (e.colorPicked = !0));
	let r = xi(J(t, "height"));
	r !== null && (e.height = r);
}
var Ti = "Untitled Song", Ei = "Track", Di = [
	2,
	4,
	8,
	16
], Oi = 384e5, ki = {
	rack: 256,
	songs: 64,
	tracksPerSong: 128,
	clipsPerTrack: 512,
	notesPerClip: 2e4,
	totalNotes: 1e5
}, Ai = 50, ji = (e, t, n) => Math.min(n, Math.max(t, e));
function Mi(e) {
	return typeof e == "number" && Number.isFinite(e);
}
function J(e, t) {
	return Object.hasOwn(e, t) ? e[t] : void 0;
}
function Y(e, t, n = `${t}s`) {
	return `${e.toLocaleString("en-US")} ${e === 1 ? t : n}`;
}
function Ni(e) {
	return Mi(e) ? ji(e, 20, 400) : null;
}
function Pi(e) {
	return Mi(e) ? ji(e, -60, 12) : null;
}
function Fi(e) {
	return Mi(e) ? ji(Math.round(e), 0, Oi) : null;
}
function Ii(e) {
	return Mi(e) ? ji(Math.round(e), 1, Oi) : null;
}
function Li(e) {
	if (typeof e != "object" || !e) return null;
	let t = J(e, "beats"), n = J(e, "unit");
	return typeof t != "number" || !Number.isInteger(t) || t < 1 || t > 32 || typeof n != "number" || !Di.includes(n) ? null : {
		beats: t,
		unit: n
	};
}
function Ri(e) {
	if (typeof e != "object" || !e) return null;
	let t = Fi(J(e, "startTick")), n = Fi(J(e, "endTick"));
	return t === null || n === null ? null : {
		enabled: J(e, "enabled") === !0,
		startTick: t,
		endTick: Math.max(t, n)
	};
}
var zi = /[\u0000-\u001f\u007f]/g;
function Bi(e, t) {
	if (typeof e != "string") return t;
	let n = e.slice(0, 400).replace(zi, " ").trim();
	return n.length > 100 && (n = Array.from(n).slice(0, 100).join("").trim()), n || t;
}
function Vi(e) {
	if (typeof e != "string") return null;
	let t = e.trim();
	return t.length > 0 && t.length <= 128 ? t : null;
}
function Hi() {
	return {
		beats: 4,
		unit: 4
	};
}
function Ui() {
	return {
		enabled: !1,
		startTick: 0,
		endTick: 0
	};
}
function Wi(e, t = ki.totalNotes) {
	let n = [], r = 0, i = 0, a = 0;
	return {
		rackIds: new Set(e),
		notesLeft: Math.max(0, t),
		warn(e) {
			n.length < Ai ? n.push(e) : r++;
		},
		overBudget(e) {
			a += e;
		},
		record(e) {
			return typeof e != "object" || !e || Array.isArray(e) ? null : (i += Br(e), e);
		},
		warnings() {
			let e = [...n];
			return a > 0 && e.push(`The project held more notes than the ${Y(ki.totalNotes, "note")} limit, so ${Y(a, "note")} were dropped.`), i > 0 && e.push(`Ignored ${Y(i, "unsafe key")} (such as “__proto__”) in the file.`), r > 0 && e.push(`…and ${Y(r, "more problem")}.`), e;
		}
	};
}
function Gi(e, t) {
	let n = t.record(e);
	if (!n) return null;
	let r = Fi(J(n, "tick")), i = Ii(J(n, "durationTicks")), a = J(n, "midi"), o = J(n, "velocity");
	if (r === null || i === null || !Mi(a) || !Mi(o)) return null;
	let s = Math.round(a);
	return s < 0 || s > 127 ? null : {
		tick: r,
		durationTicks: i,
		midi: s,
		velocity: ji(o, 0, 1)
	};
}
var Ki = (e, t) => e.tick - t.tick || e.midi - t.midi;
function qi(e, t, n) {
	return e ? `${t} “${e}”` : `${t} ${n}`;
}
function Ji(e) {
	return typeof e == "object" && e && !Array.isArray(e) ? Vi(J(e, "id")) : null;
}
function Yi(e, t, n, r, i, a) {
	if (!Array.isArray(e)) return e !== void 0 && n.warn(`${r} had an unreadable ${i} list, so it is now empty.`), [];
	let o = Math.min(e.length, t);
	e.length > o && n.warn(`${r} held more than ${Y(o, i)}; the extra ${Y(e.length - o, i)} were dropped.`);
	let s = [], c = /* @__PURE__ */ new Set(), l = 0, u = 0;
	for (let t = 0; t < o; t++) {
		let n = Ji(e[t]);
		if (n !== null && c.has(n)) {
			u++;
			continue;
		}
		let r = a(e[t]);
		r ? (c.add(r.id), s.push(r)) : l++;
	}
	return l > 0 && n.warn(`${r}: dropped ${Y(l, `unreadable ${i}`)}.`), u > 0 && n.warn(`${r}: dropped ${Y(u, i)} that repeated an earlier ${i}’s id.`), s;
}
function Xi(e, t, n = "A track") {
	let r = t.record(e);
	if (!r) return null;
	let i = Vi(J(r, "id")), a = Fi(J(r, "startTick")), o = Ii(J(r, "lengthTicks")), s = J(r, "notes");
	if (i === null || a === null || o === null || !Array.isArray(s)) return null;
	let c = Bi(J(r, "name"), ""), l = `${n}, ${qi(c, "clip", i)}`, u = ii(J(r, "patternId"));
	if (u !== null) return {
		id: i,
		name: c,
		startTick: a,
		lengthTicks: o,
		notes: [],
		patternId: u
	};
	let d = Math.min(s.length, ki.notesPerClip);
	s.length > d && t.warn(`${l} held more than ${Y(d, "note")}; the extra ${Y(s.length - d, "note")} were dropped.`);
	let f = [], p = 0;
	for (let e = 0; e < d; e++) {
		let n = Gi(s[e], t);
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
	p > 0 && t.warn(`${l}: dropped ${Y(p, "invalid note")}.`), f.sort(Ki);
	let m = Vi(J(r, "poolId"));
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
function Zi(e, t, n = "A song") {
	let r = t.record(e);
	if (!r) return null;
	let i = Vi(J(r, "id"));
	if (i === null) return null;
	let a = Bi(J(r, "name"), Ei), o = `${n}, ${qi(a, "track", i)}`, s = J(r, "instrumentId"), c = null;
	typeof s == "string" && t.rackIds.has(s) ? c = s : s != null && t.warn(`${o} used an instrument that isn’t in the rack, so it is now silent.`);
	let l = J(r, "volume"), u = Pi(l);
	u === null && (l !== void 0 && t.warn(`${o} had an unreadable volume, so it was reset to 0 dB.`), u = 0);
	let d = Yi(J(r, "clips"), ki.clipsPerTrack, t, o, "clip", (e) => Xi(e, t, o)), f = {
		id: i,
		name: a,
		instrumentId: c,
		volume: u,
		mute: J(r, "mute") === !0,
		solo: J(r, "solo") === !0,
		clips: d
	}, p = J(r, "role");
	return St(p) && (f.role = p), Xr(f, r), wi(f, r), f;
}
function Qi(e, t) {
	let n = t.record(e);
	if (!n) return null;
	let r = Vi(J(n, "id"));
	if (r === null) return null;
	let i = Bi(J(n, "name"), Ti), a = `Song “${i}”`, o = Ni(J(n, "bpm"));
	o === null && (t.warn(`${a} had an unreadable tempo, so it was set to 120 BPM.`), o = 120);
	let s = Li(t.record(J(n, "timeSignature")));
	s ||= (t.warn(`${a} had an unreadable time signature, so it was set to 4/4.`), Hi());
	let c = Ri(t.record(J(n, "loop")));
	c ||= (J(n, "loop") !== void 0 && t.warn(`${a} had an unreadable loop region, so looping was turned off.`), Ui());
	let l = J(n, "sourcePpq"), u = typeof l == "number" && Number.isInteger(l) && l >= 1 && l <= 32767 ? l : null, d = Qr(J(n, "buses"), t.warn, a), f = new Set(wt({ buses: d ?? void 0 }).map((e) => e.id)), p = fi(J(n, "patterns"), t.warn, a), m = new Set((p ?? []).map((e) => e.id)), h = Yi(J(n, "tracks"), ki.tracksPerSong, t, a, "track", (e) => {
		let n = Zi(e, t, a);
		return n && pi($r(n, f), m, t.warn, a);
	}), g = {
		id: r,
		name: i,
		bpm: o,
		timeSignature: s,
		loop: c,
		sourcePpq: u,
		tracks: vi(h)
	};
	d && (g.buses = d), p && (g.patterns = p);
	let _ = yi(J(n, "folded"));
	_.length && (g.folded = _);
	let v = Jt(J(n, "overrides"), t.rackIds, t.warn, a);
	return v && (g.overrides = v), wa(g, n, {
		trackIds: new Set(h.map((e) => e.id)),
		busIds: f,
		patternIds: m,
		rackIds: t.rackIds
	}, (e) => t.warn(`${a}: ${e}`)), g;
}
//#endregion
//#region src/state/game-normalize.ts
var $i = 128, ea = 40, ta = 1e6, X = (e, t) => Object.hasOwn(e, t) ? e[t] : void 0;
function Z(e) {
	return typeof e == "object" && e && !Array.isArray(e) ? e : null;
}
function Q(e) {
	return typeof e == "number" && Number.isFinite(e);
}
var $ = (e, t, n) => Math.min(n, Math.max(t, e));
function na(e) {
	if (typeof e != "string") return null;
	let t = e.trim();
	return t.length > 0 && t.length <= $i && !t.includes(":") && !zr(t) ? t : null;
}
function ra(e) {
	if (typeof e != "string") return null;
	let t = e.slice(0, 160).replace(/[\u0000-\u001f\u007f]/g, " ").trim(), n = Array.from(t).slice(0, ea).join("").trim();
	return n && !zr(n) ? n : null;
}
function ia(e, t) {
	return Q(e) ? $(e, 0, t) : null;
}
function aa(e, t, n, r, i) {
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
function oa(e) {
	let t = Z(e);
	if (!t) return null;
	let n = na(X(t, "id")), r = ra(X(t, "name")), i = X(t, "min"), a = X(t, "max");
	if (!n || !r || !Q(i) || !Q(a)) return null;
	let o = $(i, -1e6, ta), s = $(a, -1e6, ta);
	if (!(s > o)) return null;
	let c = X(t, "step") === "whole" ? "whole" : "continuous", l = X(t, "defaultValue"), u = Q(l) ? $(l, o, s) : o;
	return c === "whole" && (u = $(Math.round(u), o, s)), {
		id: n,
		name: r,
		min: o,
		max: s,
		step: c,
		defaultValue: u,
		riseSeconds: ia(X(t, "riseSeconds"), 60) ?? 0,
		fallSeconds: ia(X(t, "fallSeconds"), 60) ?? 0,
		cushion: Q(X(t, "cushion")) ? $(X(t, "cushion"), 0, s - o) : 0
	};
}
function sa(e, t, n) {
	if (!Array.isArray(e)) return null;
	let r = [];
	for (let i of e.slice(0, ot.curvePoints)) {
		let e = Z(i), a = e ? X(e, "x") : void 0, o = e ? X(e, "y") : void 0;
		Q(a) && Q(o) && r.push({
			x: $(a, -1e6, ta),
			y: $(o, t, n)
		});
	}
	return r.sort((e, t) => e.x - t.x), r.length > 0 ? r : null;
}
function ca(e) {
	let t = Z(e), n = t ? na(X(t, "dialId")) : null, r = t ? sa(X(t, "points"), 20, 400) : null;
	if (!t || !n || !r) return null;
	let i = {
		dialId: n,
		points: r,
		glideBeats: ia(X(t, "glideBeats"), 64) ?? 0
	};
	return X(t, "landing") === "now" && (i.landing = "now"), i;
}
function la(e) {
	let t = Z(e), n = t ? na(X(t, "dialId")) : null, r = t ? sa(X(t, "points"), -24, 24) : null;
	return t && n && r ? {
		dialId: n,
		points: r
	} : null;
}
function ua(e, t) {
	return typeof e != "string" || e.length > 256 ? !1 : e === "track:volume" || e === "track:pan" || Qe(e) ? !0 : e.startsWith("track:send:") ? t.has(e.slice(11)) : Ve(e) !== null;
}
function da(e, t) {
	let n = na(X(e, "id")), r = na(X(e, "dialId")), i = X(e, "trackId");
	return !n || !r || typeof i != "string" || !t.trackIds.has(i) ? null : {
		id: n,
		dialId: r,
		trackId: i
	};
}
function fa(e, t) {
	let n = Z(e), r = n ? X(n, "target") : void 0, i = n ? sa(X(n, "points"), 0, 1) : null;
	if (!n || !ua(r, t.busIds) || !i) return null;
	if (Qe(r)) {
		let e = na(X(n, "id")), t = na(X(n, "dialId"));
		return e && t ? {
			id: e,
			dialId: t,
			target: r,
			points: i
		} : null;
	}
	let a = da(n, t);
	return a ? {
		...a,
		target: r,
		points: i
	} : null;
}
function pa(e) {
	let t = Z(e);
	if (!t) return null;
	let { frequency: n, Q: r } = $e, i = X(t, "frequency"), a = X(t, "Q");
	return {
		frequency: Q(i) ? $(i, n.min, n.max) : n.default,
		Q: Q(a) ? $(a, r.min, r.max) : r.default
	};
}
function ma(e, t) {
	let n = Z(e), r = n && da(n, t), i = n ? X(n, "threshold") : void 0;
	return !r || !Q(i) ? null : {
		...r,
		threshold: $(i, -1e6, ta),
		fadeSeconds: ia(X(n, "fadeSeconds"), 30) ?? 0
	};
}
function ha(e, t) {
	let n = Z(e), r = n && da(n, t), i = n ? X(n, "threshold") : void 0, a = n ? X(n, "kind") : void 0, o = n ? X(n, "to") : void 0;
	return !r || !Q(i) || typeof o != "string" || (a === "instrument" ? !t.rackIds.has(o) : a !== "pattern" || !t.patternIds.has(o)) ? null : {
		...r,
		threshold: $(i, -1e6, ta),
		kind: a,
		to: o
	};
}
function ga(e, t, n) {
	let r = Z(e);
	if (!r) return null;
	let i = {
		links: aa(X(r, "links"), ot.links, n, "dial link", (e) => fa(e, t)),
		layers: aa(X(r, "layers"), ot.layers, n, "layer rule", (e) => ma(e, t)),
		swaps: aa(X(r, "swaps"), ot.swaps, n, "swap rule", (e) => ha(e, t))
	}, a = ca(X(r, "tempo"));
	a && (i.tempo = a);
	let o = la(X(r, "transpose"));
	return o && (i.transpose = o), i;
}
function _a(e) {
	return !e.tempo && !e.transpose && e.links.length === 0 && e.layers.length === 0 && e.swaps.length === 0;
}
function va(e) {
	return Q(e) ? $(Math.round(e), 0, Oi) : null;
}
function ya(e) {
	let t = Z(e);
	if (!t) return null;
	let n = na(X(t, "id")), r = ra(X(t, "name")), i = va(X(t, "startTick")), a = va(X(t, "endTick"));
	return !n || !r || i === null || a === null ? null : {
		id: n,
		name: r,
		startTick: i,
		endTick: Math.max(i, a)
	};
}
function ba(e, t) {
	return Array.isArray(e) ? aa(e, ot.sections, t, "section", ya) : null;
}
function xa(e, t) {
	let n = Z(e);
	if (!n) return null;
	let r = na(X(n, "id")), i = ra(X(n, "name")), a = X(n, "action"), o = X(n, "landing");
	if (!r || !i || !rt.includes(a)) return null;
	let s = {
		id: r,
		name: i,
		action: a,
		landing: it.includes(o) ? o : "bar",
		seconds: ia(X(n, "seconds"), 30) ?? 0
	}, c = X(n, "sectionId");
	return typeof c == "string" && t.has(c) && (s.sectionId = c), s;
}
function Sa(e, t, n) {
	if (!Array.isArray(e)) return null;
	let r = /* @__PURE__ */ new Set();
	return aa(e, ot.cues, n, "cue", (e) => {
		let n = xa(e, t);
		return !n || r.has(n.name) ? null : (r.add(n.name), n);
	});
}
function Ca(e) {
	let t = Z(e);
	if (!t) return null;
	let n = ut(), r = X(t, "mode"), i = X(t, "muffleHz");
	return {
		mode: at.includes(r) ? r : n.mode,
		muffleHz: Q(i) ? $(i, 50, st) : n.muffleHz,
		fadeSeconds: ia(X(t, "fadeSeconds"), 30) ?? n.fadeSeconds
	};
}
function wa(e, t, n, r) {
	let i = ga(X(t, "rules"), n, r);
	i && !_a(i) && (e.rules = i);
	let a = ba(X(t, "sections"), r);
	a?.length && (e.sections = a);
	let o = Sa(X(t, "cues"), new Set((a ?? []).map((e) => e.id)), r);
	o && (e.cues = o);
	let s = Ca(X(t, "pause"));
	s && (e.pause = s);
	let c = pa(X(t, "masterFilter"));
	c && !tt(c) && (e.masterFilter = c);
}
//#endregion
//#region src/player/bundle.ts
var Ta = "sine-sculptor-song", Ea = 2, Da = ot.dials;
function Oa(e) {
	let t = {};
	for (let { name: n, ...r } of e) !zr(n) && !Object.hasOwn(t, n) && (t[n] = r);
	return t;
}
function ka(e) {
	return Object.entries(e).map(([e, t]) => ({
		...t,
		name: e
	}));
}
function Aa() {
	return { limiterDb: -1 };
}
function ja(e, t, n = {}) {
	let { song: r, instruments: i } = Kt(e, t), a = new Set(i.map((e) => e.id));
	for (let n of e.rules?.swaps ?? []) {
		let r = n.kind === "instrument" && !a.has(n.to) ? t.find((e) => e.id === n.to) : void 0;
		r && (a.add(r.id), i.push(Gt(r, e)));
	}
	return {
		format: Ta,
		version: 2,
		name: r.name,
		song: r,
		instruments: i,
		dials: Pa(n.dials ?? {}, []),
		tempo: n.tempo ?? null,
		mix: Ma(n.mix)
	};
}
function Ma(e) {
	let t = Aa();
	if (typeof e != "object" || !e || Array.isArray(e)) return t;
	let n = J(e, "limiterDb");
	return Na(n) && (t.limiterDb = Math.min(0, Math.max(-24, n))), t;
}
function Na(e) {
	return typeof e == "number" && Number.isFinite(e);
}
function Pa(e, t) {
	let n = {};
	if (typeof e != "object" || !e || Array.isArray(e)) return n;
	let r = /* @__PURE__ */ new Set();
	for (let i of Object.keys(e).slice(0, Da)) {
		if (zr(i)) continue;
		let a = J(e, i), o = typeof a == "object" && a && !Array.isArray(a) ? a : {}, s = oa({
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
function Fa(e, t, n) {
	if (typeof e != "object" || !e || Array.isArray(e)) return null;
	let r = e, i = J(r, "dial"), a = Ni(J(r, "bpmAtMin")), o = Ni(J(r, "bpmAtMax"));
	return typeof i != "string" || !Object.hasOwn(t, i) || a === null || o === null ? (n.push("The tempo rule was unreadable, so the song keeps one tempo."), null) : {
		dial: i,
		bpmAtMin: a,
		bpmAtMax: o
	};
}
function Ia(e) {
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
	if (!Na(r) || r < 1) return {
		ok: !1,
		error: "The song bundle has no format version."
	};
	if (r > 2) return {
		ok: !1,
		error: `This bundle needs a newer player (bundle format ${r}).`
	};
	let i = [], a = [], o = J(n, "instruments");
	if (Array.isArray(o)) {
		let e = /* @__PURE__ */ new Set();
		for (let t of o.slice(0, ki.rack)) {
			let n = Lr(t);
			n.ok ? e.has(n.patch.id) || (e.add(n.patch.id), a.push(n.patch)) : i.push(`An instrument was dropped: ${n.error}`);
		}
	}
	let s = Wi(a.map((e) => e.id)), c = Qi(J(n, "song"), s);
	if (!c) return {
		ok: !1,
		error: "The song bundle holds no readable song."
	};
	i.push(...s.warnings());
	let l = Pa(J(n, "dials"), i);
	return {
		ok: !0,
		bundle: {
			format: Ta,
			version: r < 2 ? 1 : 2,
			name: Bi(J(n, "name"), c.name),
			song: c,
			instruments: a,
			dials: l,
			tempo: Fa(J(n, "tempo"), l, i),
			mix: Ma(J(n, "mix"))
		},
		warnings: i
	};
}
//#endregion
//#region src/player/player.ts
var La = .05, Ra = .005;
function za(e) {
	let t = Ot(e), n = Et(e.timeSignature);
	return t <= 0 || n <= 0 ? e : {
		...e,
		loop: {
			enabled: !0,
			startTick: 0,
			endTick: Math.ceil(t / n) * n
		}
	};
}
var Ba = {
	mode: "freeze",
	muffleHz: st,
	fadeSeconds: 0
};
function Va(e) {
	return e.mode === "freeze" && e.muffleHz >= 2e4 && e.fadeSeconds === 0;
}
function Ha(e, t) {
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
			...ht(e),
			tempo: {
				dialId: r.id,
				points: i,
				glideBeats: 0,
				landing: "now"
			}
		}
	};
}
function Ua(e, t = {}) {
	let n = new e.Gain(jt(t.volumeDb ?? 0)), r = new e.Limiter(-1);
	n.connect(r), r.connect(t.destination ?? e.getDestination());
	let i = Pr(e, {
		destination: n,
		onError: t.onError,
		visibility: t.visibility
	}), a = i.player, o = t.loop ?? !0, s = !1, c = [], l = null, u = /* @__PURE__ */ new Set(), d = () => i.isPaused() ? "paused" : a.getState(), f = d(), p = () => {
		let e = d();
		if (e !== f) {
			f = e;
			for (let n of [...u]) try {
				n(e);
			} catch (e) {
				t.onError?.("A playback listener failed.", e);
			}
		}
	};
	return a.subscribe(p), {
		load(e) {
			if (s) return {
				ok: !1,
				error: "This player has been disposed."
			};
			let t;
			try {
				t = Ia(e);
			} catch {
				return {
					ok: !1,
					error: "The song bundle could not be read."
				};
			}
			if (!t.ok) return t;
			let n = t.bundle, a = Ha(o ? za(n.song) : n.song, n);
			n.version === 1 && !a.pause && (a = {
				...a,
				pause: Ba
			}), l = Va(mt(a)) ? null : mt(a), i.setGame(null, [], []), r.threshold.value = n.mix.limiterDb;
			let u = ka(n.dials);
			return c = u.map(({ name: e, min: t, max: n, step: r }) => ({
				name: e,
				min: t,
				max: n,
				step: r
			})), i.setGame(a, n.instruments, u), i.settle(), p(), {
				ok: !0,
				warnings: t.warnings
			};
		},
		play() {
			s || (i.play(), p());
		},
		pause() {
			s || (i.pause(), p());
		},
		stop() {
			s || (i.stop(), a.seek(0), p());
		},
		setDial(e, t, n) {
			s || i.setDial(e, t, n);
		},
		getDial: (e) => s ? null : i.dialValue(e),
		dials: () => c.map((e) => ({ ...e })),
		pauseTreatment: () => s || !l ? null : { ...l },
		cue: (e) => !s && i.cue(e),
		setVolume(t, r = La) {
			s || n.gain.rampTo(jt(t), Math.max(Ra, r), e.immediate());
		},
		getState: d,
		getPositionTicks: () => a.getPositionTicks(),
		subscribe(e) {
			return u.add(e), () => void u.delete(e);
		},
		output: n,
		dispose() {
			s || (s = !0, i.dispose(), c = [], l = null, u.clear(), n.dispose(), r.dispose());
		}
	};
}
//#endregion
export { Ta as BUNDLE_FORMAT, Ea as BUNDLE_VERSION, ja as buildBundle, Oa as bundleDials, Ua as createPlayer, Aa as defaultMix, ka as dialList, Ia as parseBundle };
