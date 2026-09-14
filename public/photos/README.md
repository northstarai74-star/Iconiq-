# Drop the salon's photography here

Any `.jpg`, `.jpeg`, `.png`, `.webp` or `.avif` file in this folder is used by
the gallery, ahead of Unsplash and Wikimedia Commons. No configuration needed.

```
public/photos/
  01-interior.jpg
  02-colour-work.jpg
  03-wash-room.jpg
```

- **Order** follows the filename, so number them.
- **Alt text** is derived from the filename (`02-colour-work.jpg` → "Colour work").
  For better descriptions, add `captions.json` in this folder:

  ```json
  { "02-colour-work.jpg": "Hand-painted balayage on mid-lengths" }
  ```

- **Sizing**: export around 1600px on the long edge. Tiles are cropped to 4:3.

Stock photography of other people's salons is the one thing clients notice.
These files are what should end up in the gallery.
