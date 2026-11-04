"""Build immutable responsive carousel artwork from the current catalogue.
Run on the server after importing new artwork: python3 scripts/build_carousel_images.py
Then rebuild the frontend so its manifest includes the new variants.
"""
from pathlib import Path
from PIL import Image, ImageOps
import hashlib, json, sqlite3, re

root=Path('/opt/liquid-music')
output=root/'state/data/uploads/carousel';output.mkdir(parents=True,exist_ok=True)
db=sqlite3.connect(root/'state/data/liquid_music.db')
sources={row[0] for row in db.execute('select image from products')}
sources.update(re.findall(r"image:\s*'([^']+)'",(root/'src/components/CatalogView.tsx').read_text()))
manifest={};original_bytes=0;thumbnail_bytes=0
for src in sorted(sources):
 if not src.startswith('/'):continue
 relative=Path(src.lstrip('/'))
 if '..' in relative.parts:continue
 candidates=[root/'state/data'/relative,root/'state/media'/relative,root/'public'/relative]
 source=next((p for p in candidates if p.is_file()),None)
 if source is None:continue
 try:
  digest=hashlib.sha256(source.read_bytes()).hexdigest()[:20]
  with Image.open(source) as opened:
   image=ImageOps.exif_transpose(opened).convert('RGB');width,height=image.size
   variants=[]
   for bound in sorted({min(width,w) for w in (384,768,1024)}):
    name=f'{digest}-{bound}.webp';target=output/name
    if not target.exists():
     small=image.copy();small.thumbnail((bound,round(height*bound/width)),Image.Resampling.LANCZOS)
     small.save(target,'WEBP',quality=82,method=5)
    variants.append({'width':bound,'src':'/uploads/carousel/'+name})
   manifest[src]={'width':width,'height':height,'variants':variants}
   original_bytes+=source.stat().st_size
   thumbnail_bytes+=(output/Path(variants[-1]['src']).name).stat().st_size
 except (OSError,ValueError):continue
(root/'src/data/carouselImages.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print(json.dumps({'images':len(manifest),'originalBytes':original_bytes,'largestVariantBytes':thumbnail_bytes}))
