"""Costruisce la sequenza di frame dell'hero per il MOBILE (9:16).

Perche' esiste, invece di stare dentro scripts/extract-hero-frames.mjs:
il video 9:16 e' un reframe generato dall'AI, e le zone di cielo e di erba
aggiunte sopra e sotto l'inquadratura originale hanno un movimento proprio.
Misurando i frame estratti si vedono due difetti:

  1. un GRADINO: a circa 3,4s lo sfondo cambia stato di colpo (differenza
     media 9,1 contro lo 0,4 dei frame vicini) e ci resta. Non e' un frame
     sbagliato isolato: confrontando il frame prima con quello DOPO il
     successivo la differenza resta 9,1;
  2. l'erba generata in basso "bolle" per tutta la durata (differenza media
     ~5 contro il ~1,4 del video originale 16:9).

Tagliare la coda non basta: al momento del gradino lo stemma non ha ancora
finito di comporsi. Quindi si congela lo SFONDO dal gradino in poi, tenendo
viva solo la fascia centrale dove lo stemma si assesta.

I frame vengono estratti in PNG, composti e compressi in WebP una sola volta:
nessuna doppia compressione, nessuna perdita di qualita' aggiuntiva.

Uso: python scripts/build-mobile-hero.py   (lanciato da `npm run frames`)
"""

import json
import os
import shutil
import subprocess
import sys
import tempfile

from PIL import Image, ImageChops, ImageFilter

SRC = "assets/hero-video-mobile-9x16.mp4"
OUT = "public/hero-frames/mobile"
MANIFEST = "public/hero-frames/manifest.json"

FRAMES = 40
LARGHEZZA = 900
# Stessa finestra usata per il desktop: dopo, il cielo del sorgente riparte.
USE_SECONDS = 4.08
QUALITA_WEBP = 72
BUDGET_KB = 2800

# Fascia verticale (in frazione dell'altezza) da NON congelare: contiene lo
# stemma che continua a comporsi. Misurata sui frame: lo stemma sta fra il 33%
# e il 66%, il margine porta la fascia protetta al 26-74%.
BANDA = (0.26, 0.74)
SFUMATURA_PX = 46

# Un frame e' considerato "gradino" se la differenza di sfondo supera questa
# soglia moltiplicata per la mediana delle differenze.
SOGLIA = 6.0


def diff_cielo(a, b, banda_px):
    """Differenza media nel solo cielo, sopra la fascia dello stemma.

    Il gradino si cerca qui e non su tutto lo sfondo: l'erba generata in basso
    ribolle di continuo (differenza ~5) e alzerebbe la mediana al punto da
    nascondere il gradino del cielo, che vale 9 su un fondo di 0,4.
    """
    y0 = banda_px[0]
    d = ImageChops.difference(a.crop((0, 0, a.width, y0)), b.crop((0, 0, b.width, y0)))
    px = list(d.resize((140, 50)).getdata())
    return sum(px) / len(px)


def main():
    if not os.path.exists(SRC):
        sys.exit(f"sorgente mancante: {SRC}")

    tmp = tempfile.mkdtemp(prefix="hero-mobile-")
    try:
        fps = FRAMES / USE_SECONDS
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-t", str(USE_SECONDS), "-i", SRC,
             "-vf", f"fps={fps:.4f},scale={LARGHEZZA}:-2", "-frames:v", str(FRAMES),
             "-start_number", "0", os.path.join(tmp, "f-%03d.png")],
            check=True,
        )
        nomi = sorted(f for f in os.listdir(tmp) if f.endswith(".png"))
        if len(nomi) != FRAMES:
            sys.exit(f"attesi {FRAMES} frame, estratti {len(nomi)}")

        frames = [Image.open(os.path.join(tmp, n)).convert("RGB") for n in nomi]
        W, H = frames[0].size
        banda_px = (int(H * BANDA[0]), int(H * BANDA[1]))

        # 1. trova il gradino nello sfondo
        grigi = [f.convert("L") for f in frames]
        diffs = [diff_cielo(grigi[i - 1], grigi[i], banda_px) for i in range(1, len(grigi))]
        ordinata = sorted(diffs)
        mediana = ordinata[len(ordinata) // 2]
        gradino = None
        for i, d in enumerate(diffs, start=1):
            if d > mediana * SOGLIA:
                gradino = i
                break

        if gradino is None:
            print(f"nessun gradino trovato (mediana {mediana:.2f}): nessun congelamento")
        else:
            print(f"gradino al frame {gradino} (differenza {diffs[gradino - 1]:.2f} contro mediana {mediana:.2f})")

            # 2. maschera: bianco dove tenere il frame originale (la fascia
            #    dello stemma), nero dove usare lo sfondo congelato.
            maschera = Image.new("L", (W, H), 0)
            maschera.paste(255, (0, banda_px[0], W, banda_px[1]))
            maschera = maschera.filter(ImageFilter.GaussianBlur(SFUMATURA_PX / 2))

            sfondo = frames[gradino - 1]
            for i in range(gradino, len(frames)):
                frames[i] = Image.composite(frames[i], sfondo, maschera)

        # 3. compressione WebP, una sola volta
        if os.path.isdir(OUT):
            shutil.rmtree(OUT)
        os.makedirs(OUT, exist_ok=True)
        for i, im in enumerate(frames):
            im.save(os.path.join(OUT, f"f-{i:03d}.webp"), "WEBP", quality=QUALITA_WEBP, method=6)

        kb = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT)) // 1024
        print(f"mobile: {len(frames)} frame, {W}x{H}, qualita={QUALITA_WEBP}, {kb} KB (budget {BUDGET_KB} KB)")
        if kb > BUDGET_KB:
            print(f"ATTENZIONE: sopra budget di {kb - BUDGET_KB} KB")

        # 4. aggiorna il manifest lasciando intatta la parte desktop
        dati = {}
        if os.path.exists(MANIFEST):
            dati = json.load(open(MANIFEST, encoding="utf-8"))
        dati["mobile"] = {"count": len(frames), "width": W, "height": H, "kb": kb}
        with open(MANIFEST, "w", encoding="utf-8") as f:
            json.dump(dati, f, indent=2)
        print("manifest aggiornato")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()
