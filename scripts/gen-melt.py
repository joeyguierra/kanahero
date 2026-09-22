#!/usr/bin/env python3
"""
prompt.melt, synthesized — the card being made (SPEC-v5d-sound.md §2c).

WHY THIS IS NOT A GENERATION

  The cue is an abstraction, not an object: an image arriving, not a thing being
  placed. Text-to-sound kept answering it with a whoosh or a chime, and a chime
  is disqualifying — the app's hierarchy is noise for the hand, pitch for reward
  and character, and a pitched melt steals from flip.shiny and the Joker at once,
  9-21 times a run.

  Synthesized, the constraint is enforced rather than hoped for: there is no
  oscillator in this file, so it CANNOT come out pitched.

THE DESIGN, read literally off the prompt

  "fine particles drawing inward and settling into place"

  Two layers, and the second is the idea:

  A · BLOOM   filtered noise under a slow swell. No transient at t=0 — the card
              fades in over 900ms, so a click at the start would be a lie.
              The cutoff opens 300 -> 1400Hz and closes back to ~450Hz.

  B · GRAINS  ~60 tiny windowed noise bursts. Two things converge across the
              cue, which is what "drawing inward" actually means in sound:
                - DENSITY rises to a peak around 45% and stops before the end,
                  so the particles settle rather than fade out.
                - BANDWIDTH narrows: early grains are spread 400-2000Hz, late
                  ones collapse toward ~850Hz. They come together.

  Everything is capped under 2kHz. The ear canal resonates at 2.5-3kHz and is
  10-15dB more sensitive there; that band is what made the recorded brush grind,
  and it is the one place this cue must never live.

Output: 48k mono WAV in sfx-src/, ready for `npm run sfx`. Three seeds, so the
round-robin gets siblings rather than three different ideas.
"""

import numpy as np
import struct
import sys

SR = 48_000
DUR = 0.70          # the §2c cap
FADE_TAIL = 0.06    # hard silence by the end, so the bake's own fade has nothing to do

# ---- layer A: the bloom -----------------------------------------------------
BLOOM_OPEN_HZ = 1400    # the top of the sweep — never near 2k
BLOOM_REST_HZ = 460
BLOOM_CLOSE_HZ = 620
BLOOM_PEAK_AT = 0.42    # where the swell tops out, as a fraction of DUR

# ---- layer B: the grains ----------------------------------------------------
GRAINS = 60
GRAIN_MS = (2.5, 7.0)
GRAIN_DENSITY_PEAK = 0.45   # particles settle before the cue ends
GRAIN_SETTLE = 0.80         # nothing after this fraction — they have landed
BAND_EARLY = (600, 1850)    # spread
BAND_LATE = (900, 1200)     # converged
GRAIN_LEVEL = 1.0           # set by MIX_GRAIN once both layers are normalised

MIX_BLOOM = 0.62
MIX_GRAIN = 0.38


def onepole_lp(x, fc):
    """One-pole lowpass with a per-sample cutoff. Gentle, 6 dB/oct — cascade for
    more. Time-varying by construction, which a static ffmpeg filter is not."""
    a = 1.0 - np.exp(-2.0 * np.pi * np.clip(fc, 20, SR / 2.2) / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(x.size):
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y


def lp(x, fc, poles=3):
    for _ in range(poles):
        x = onepole_lp(x, fc)
    return x


def hp(x, fc):
    """complement of a one-pole lowpass — enough to take the mud out"""
    return x - onepole_lp(x, fc)


def brown(n, rng):
    """integrated white: already tilted away from the harsh band before any filter"""
    w = rng.standard_normal(n)
    out = np.empty(n)
    acc = 0.0
    for i in range(n):
        acc = (acc + 0.02 * w[i]) / 1.02
        out[i] = acc
    return out * 3.5


def hann(n):
    return 0.5 - 0.5 * np.cos(2 * np.pi * np.arange(n) / max(1, n - 1))


def build(seed):
    rng = np.random.default_rng(seed)
    n = int(SR * DUR)
    t = np.arange(n) / SR
    frac = t / DUR

    # --- the swell. Smoothstep up, exponential down. No transient at zero. ---
    up = np.clip(frac / BLOOM_PEAK_AT, 0, 1)
    up = up * up * (3 - 2 * up)                       # smoothstep
    down = np.exp(-4.0 * np.clip((frac - BLOOM_PEAK_AT) / (1 - BLOOM_PEAK_AT), 0, 1))
    env = up * np.where(frac < BLOOM_PEAK_AT, 1.0, down)

    # --- A: bloom ---
    sweep = np.where(
        frac < BLOOM_PEAK_AT,
        BLOOM_REST_HZ + (BLOOM_OPEN_HZ - BLOOM_REST_HZ) * (frac / BLOOM_PEAK_AT),
        BLOOM_OPEN_HZ + (BLOOM_CLOSE_HZ - BLOOM_OPEN_HZ)
        * ((frac - BLOOM_PEAK_AT) / (1 - BLOOM_PEAK_AT)),
    )
    bloom = lp(brown(n, rng), sweep, poles=3) * env

    # --- B: grains, converging in time and in band ---
    grains = np.zeros(n)
    # density: rises to the peak, gone by GRAIN_SETTLE. Sample positions from it.
    pos = np.linspace(0, GRAIN_SETTLE, 4096)
    weight = np.exp(-((pos - GRAIN_DENSITY_PEAK) ** 2) / (2 * 0.16 ** 2))
    weight /= weight.sum()
    starts = rng.choice(pos, size=GRAINS, p=weight)

    for s in np.sort(starts):
        ms = rng.uniform(*GRAIN_MS)
        gn = int(SR * ms / 1000)
        i0 = int(s * n)
        if i0 + gn >= n:
            continue
        # how far through the settling this grain is → how converged its band is
        k = np.clip(s / GRAIN_SETTLE, 0, 1)
        lo = BAND_EARLY[0] + (BAND_LATE[0] - BAND_EARLY[0]) * k
        hi = BAND_EARLY[1] + (BAND_LATE[1] - BAND_EARLY[1]) * k
        centre = rng.uniform(lo, hi)

        g = rng.standard_normal(gn)
        fc = np.full(gn, centre)
        g = lp(g, fc, poles=2)
        g = hp(g, np.full(gn, centre * 0.55))
        g *= hann(gn)
        # later grains are quieter: they are settling, not arriving
        grains[i0:i0 + gn] += g * (1.0 - 0.45 * k)

    if np.max(np.abs(grains)) > 0:
        grains /= np.max(np.abs(grains))
    grains *= env * GRAIN_LEVEL

    # Normalise each layer BEFORE mixing. Brown noise through a 3-pole lowpass is
    # enormous in the low end; mixed raw it buries the grains entirely and the
    # cue collapses into a soft whump with no particles in it at all. Measured:
    # only 1.8% of energy above 1kHz before this was fixed.
    def unit(v):
        m = np.max(np.abs(v))
        return v / m if m > 0 else v

    mix = MIX_BLOOM * unit(bloom) + MIX_GRAIN * unit(grains)

    # everything above 2k is a mistake in this cue — one more pole to be sure
    mix = lp(mix, np.full(n, 1900.0), poles=1)

    # And everything below ~280Hz is wasted: a phone speaker is a few millimetres
    # across and barely moves air down there. Measured before this: 85% of the
    # energy sat under 400Hz, which is a cue that sounds right on headphones and
    # is inaudible on the device the app actually ships to. Taking it out also
    # lets the normalisation spend its headroom on the part you can hear.
    mix = hp(mix, np.full(n, 280.0))
    mix = hp(mix, np.full(n, 200.0))

    # land on true silence so the bake's fade has nothing left to do
    tail = int(SR * FADE_TAIL)
    mix[-tail:] *= np.linspace(1, 0, tail) ** 2
    mix[0] = 0.0

    peak = np.max(np.abs(mix))
    return mix / peak * 0.9 if peak > 0 else mix


def write_wav(path, x):
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2").tobytes()
    with open(path, "wb") as f:
        f.write(b"RIFF" + struct.pack("<I", 36 + len(pcm)) + b"WAVE")
        f.write(b"fmt " + struct.pack("<IHHIIHH", 16, 1, 1, SR, SR * 2, 2, 16))
        f.write(b"data" + struct.pack("<I", len(pcm)) + pcm)


if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "."
    for i, seed in enumerate((7, 23, 41), start=1):
        x = build(seed)
        write_wav(f"{out}/prompt-melt.{i}.wav", x)
        print(f"  prompt-melt.{i}.wav  seed={seed}  {x.size / SR * 1000:.0f} ms")
