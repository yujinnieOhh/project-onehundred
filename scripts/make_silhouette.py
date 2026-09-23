"""Bake a flat solid-color silhouette PNG from a transparent PNG's alpha
channel (used instead of a CSS mask, to sidestep mask-mode browser support
gaps and guarantee a texture-free result everywhere).
"""

import sys

import numpy as np
from PIL import Image


def make_silhouette(path_in: str, path_out: str, hex_color: str) -> None:
    im = Image.open(path_in).convert("RGBA")
    arr = np.array(im)
    alpha = arr[..., 3]

    hex_color = hex_color.lstrip("#")
    r = int(hex_color[0:2], 16)
    g = int(hex_color[2:4], 16)
    b = int(hex_color[4:6], 16)

    out = np.zeros_like(arr)
    out[..., 0] = r
    out[..., 1] = g
    out[..., 2] = b
    out[..., 3] = alpha

    Image.fromarray(out, mode="RGBA").save(path_out)


if __name__ == "__main__":
    src, dst, color = sys.argv[1], sys.argv[2], sys.argv[3]
    make_silhouette(src, dst, color)
    print(f"wrote {dst}")
