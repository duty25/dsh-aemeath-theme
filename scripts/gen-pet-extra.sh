#!/bin/sh
# Builds assets/pet-extra.webp (8 cols x 4 rows, cell 96x104) from the original 200x200 GIFs,
# using the same scale/offset as pet-half.webp so animations line up when switching sheets.
set -e
SRC=${SRC:-/path/to/dsh-aemeath-pet/assets/sources}
OUT=${1:-assets/pet-extra.webp}
F=${TMPDIR:-/tmp}/pet-extra-frames; mkdir -p $F
SCALE=${SCALE:-94}; OX=${OX:-1}; OY=${OY:-14}
rm -f $F/*.png
for p in 1a05d5b6 216d4f2d 24a4bbf1 53a58a26 d86375e8; do convert $SRC/$p*.gif -coalesce $F/$p-%02d.png; done
row() { # name prefix frames...
  name=$1; p=$2; shift 2; list=""
  for i in "$@"; do
    convert $F/$p-$(printf %02d $i).png -filter Triangle -resize ${SCALE}x${SCALE} -background none -gravity northwest -extent 96x104-$OX-$OY $F/c-$name-$i.png
    list="$list $F/c-$name-$i.png"
  done
  convert $list -background none +append -gravity west -extent 768x104 $F/row-$name.png
}
row giggle 1a05d5b6 0 1 2 3 4 5 6
row doze 216d4f2d 0 3 6 9 12 15 18 21
row shy 24a4bbf1 0 1 2 3 4 5 6 7
row cheer 53a58a26 0 1 2 3 4 5 6 7
row idlechk d86375e8 0
convert $F/row-giggle.png $F/row-doze.png $F/row-shy.png $F/row-cheer.png -background none -append $F/extra.png
convert $F/extra.png -define webp:alpha-quality=100 -quality 92 "$OUT"
