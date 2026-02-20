from PIL import Image
import numpy as np

img = Image.open('public/character.png').convert('RGB')
arr = np.array(img)

# Find pixels that are NOT close to white
# White is around 255. Let's say < 240 is non-white
non_white_mask = (arr[:, :, 0] < 245) | (arr[:, :, 1] < 245) | (arr[:, :, 2] < 245)

coords = np.argwhere(non_white_mask)
if len(coords) > 0:
    y0, x0 = coords.min(axis=0)
    y1, x1 = coords.max(axis=0)
    
    # Add a little padding
    pad = 10
    y0 = max(0, y0 - pad)
    x0 = max(0, x0 - pad)
    y1 = min(arr.shape[0], y1 + pad)
    x1 = min(arr.shape[1], x1 + pad)
    
    cropped = img.crop((x0, y0, x1, y1))
    
    # Instead of making transparent, just save the cropped image
    cropped.save('public/character-cropped.png')
    print("Saved public/character-cropped.png", cropped.size)
