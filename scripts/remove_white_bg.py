"""One-off helper: remove a white/near-white background from a photo,
keeping only the background region that connects to the image border
(so white fur/highlights inside the subject are not touched).

Erodes the "white-ish" mask before flood-filling from the border, then
dilates the confirmed background region back out (constrained to the
original white-ish mask) so a thin bridge of light fur touching the
edge can't drag the whole background classification deep into the fur.
"""

import sys

import numpy as np
from PIL import Image
from scipy import ndimage


def remove_white_bg(
    path_in: str,
    path_out: str,
    threshold: int = 235,
    erode_iters: int = 4,
    edge_blur_sigma: float = 0.6,
) -> None:
    im = Image.open(path_in).convert("RGB")
    arr = np.array(im).astype(np.int16)
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    minc = np.minimum(np.minimum(r, g), b)
    maxc = np.maximum(np.maximum(r, g), b)

    is_white_ish = (minc > threshold) & ((maxc - minc) < 15)

    eroded = ndimage.binary_erosion(is_white_ish, iterations=erode_iters, border_value=1)
    labeled, _ = ndimage.label(eroded)

    border_labels = set()
    border_labels.update(labeled[0, :].tolist())
    border_labels.update(labeled[-1, :].tolist())
    border_labels.update(labeled[:, 0].tolist())
    border_labels.update(labeled[:, -1].tolist())
    border_labels.discard(0)

    bg_seed = np.isin(labeled, list(border_labels))
    bg_mask = ndimage.binary_dilation(bg_seed, iterations=erode_iters, mask=is_white_ish)

    alpha = np.where(bg_mask, 0, 255).astype(np.float32)
    alpha = ndimage.gaussian_filter(alpha, sigma=edge_blur_sigma)
    alpha = np.clip(alpha, 0, 255).astype(np.uint8)

    rgba = np.dstack([arr.astype(np.uint8), alpha])
    Image.fromarray(rgba, mode="RGBA").save(path_out)


if __name__ == "__main__":
    src, dst = sys.argv[1], sys.argv[2]
    remove_white_bg(src, dst)
    print(f"wrote {dst}")
