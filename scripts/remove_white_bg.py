"""One-off helper: remove a white/near-white background from a photo,
keeping only the background region that connects to the image border
(so white fur/highlights inside the subject are not touched), and
feather the edge for a soft anti-aliased cutout.
"""

import sys

import numpy as np
from PIL import Image
from scipy import ndimage


def remove_white_bg(path_in: str, path_out: str, threshold: int = 235, feather: int = 30) -> None:
    im = Image.open(path_in).convert("RGB")
    arr = np.array(im).astype(np.int16)
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    minc = np.minimum(np.minimum(r, g), b)
    maxc = np.maximum(np.maximum(r, g), b)

    is_white_ish = (minc > threshold - feather) & ((maxc - minc) < 20)

    labeled, _ = ndimage.label(is_white_ish)
    border_labels = set()
    border_labels.update(labeled[0, :].tolist())
    border_labels.update(labeled[-1, :].tolist())
    border_labels.update(labeled[:, 0].tolist())
    border_labels.update(labeled[:, -1].tolist())
    border_labels.discard(0)

    bg_mask = np.isin(labeled, list(border_labels))

    h, w = labeled.shape
    alpha = np.full((h, w), 255, dtype=np.uint8)
    white_depth = np.clip((minc - (threshold - feather)) / feather, 0, 1)
    bg_alpha = np.clip(255 * (1 - white_depth), 0, 255).astype(np.uint8)
    alpha[bg_mask] = bg_alpha[bg_mask]

    rgba = np.dstack([arr.astype(np.uint8), alpha])
    Image.fromarray(rgba, mode="RGBA").save(path_out)


if __name__ == "__main__":
    src, dst = sys.argv[1], sys.argv[2]
    remove_white_bg(src, dst)
    print(f"wrote {dst}")
