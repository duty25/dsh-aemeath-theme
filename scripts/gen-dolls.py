import numpy as np, subprocess
def hexc(h): h=h.lstrip('#'); return [int(h[i:i+2],16) for i in (0,2,4)]+[255]
def build(half, pal, overrides=(), W=32):
    rows=[]
    for r in half:
        r=(r+'.'*16)[:16]
        rows.append(r+r[::-1])
    g=[list(r) for r in rows]
    for (y,x,s) in overrides:
        for i,ch in enumerate(s):
            if ch!=' ' and 0<=x+i<W: g[y][x+i]=ch
    return g
def render(g,pal,name):
    H=len(g);W=len(g[0]);a=np.zeros((H,W,4),np.uint8)
    for y in range(H):
        for x in range(W):
            c=g[y][x]
            if c!='.': a[y,x]=hexc(pal[c])
    open(name+'.rgba','wb').write(a.tobytes())
    return a
CAT=[
"................",
"...KK...........",
"...KDK..........",
"...KDDK.........",
"...KDLDK........",
"...KDLLDK.......",
"...KDLLDDKKKKKKK",
"..KDDLLDDDDDDDDD",
"..KDDLDDDDDDDDDD",
"..KDDDDDDDDDDDDD",
".KDDDDDDDDDDDDDD",
".KDDDDDDDDDDDDDD",
".KDDDYOODDDDDDDD",
".KDDDOKODDDDDDDD",
".KDDDOOODDDDDDDD",
".KDDDDDDDDDDMMMP",
".KDDDDDDDDDDMMKM",
"..KDDDDDDDDDDMMK",
"...KKDDDDDDDDDDD",
"....KDDDDDDDDDDD",
"...KDDDDDDDLLLLL",
"..KDDDDDDDLLLLLL",
"..KDMMKDDDLLLLLL",
"..KMMMMKDDLLLLLL",
"..KMWMMKDDLLLLLL",
"...KMMKDDDLLLLLL",
"...KDDDDDDDLLLLL",
"..KDDDDDDDDDDDDD",
".KDDDMMMDKKDDDDD",
".KDDMMMMMDKDDDDD",
".KDDDMMMDDKKKKKK",
"..KKKKKKKK......",
]
CATP={'K':'#120f1c','D':'#34303f','M':'#5a5566','L':'#a19dae','W':'#d9d5e4','O':'#ff9a2e','Y':'#ffe9a8','P':'#ff8fb8'}
DOLL=[
"................",
"..........KKKKKK",
"........KKHHHHHH",
"......KKHHHHHHHH",
".....KHHHHHHHHHH",
"....KHHHHHHHHHHH",
"...KHHHHHHHHHHHH",
"...KHHHhHHHHhHHH",
"..KHHHhSHHHhSSHH",
"..KHHhSSSHhSSSSh",
"..KHHhSSSSSSSSSS",
".KHHHSKKKSSSSSSS",
".KHHHSYEESSSSSSS",
".KHHHSEeESSSSSSS",
".KHHHSEEESSSSSSS",
".KHHHCCSSSSSSSSS",
".KHHHSSSSSSSSSSK",
".KHHhKSSSSSSSSSS",
".KHHhhKKSSSSSSSS",
"..KHhhKKWWWGGWWW",
"..KHhKRRWWWWWGBW",
"...KKRRRWWWWWWGW",
"...KRRRWWWWWWWBW",
"...KRRSSWWWWWWGW",
"..KRRRSSWWWWWWWW",
"..KRRRKWWwWWWWWW",
"..KRRrKwWWWwWWWW",
"..KRrrKwWWWWwBBB",
"..KRrrKwwWWWBBBB",
"..KrrrKBBBBBBBBB",
"...KKKKKKKKKKKKK",
"................",
]
DOLLP={'K':'#2a1630','H':'#ff8fc8','h':'#d9609f','S':'#ffe8de','C':'#ff9fb0','E':'#ff9d3c','e':'#9a3f17','Y':'#fff3b0','W':'#fbf7ff','w':'#cbc4e4','R':'#d0344f','r':'#801a35','G':'#f6c75a','B':'#7fb3ff'}
# wing hairclip (viewer's right side) + cyan star
DOLLO=[(3,21," KWWK"),(4,21,"KWWWWK"),(5,22,"KWWwK"),(6,23,"KwK"),(2,4,"  "),(5,9,"     ")]
cat=build(CAT,CATP); doll=build(DOLL,DOLLP,DOLLO)
def blink(g,rows,fill,line):
    g2=[r[:] for r in g]
    for y in rows:
        for x in range(32):
            if g2[y][x] in 'OKYEe' and not (y==rows[1] and g2[y][x]=='K' and False):
                pass
    return g2
import copy
def close_eyes(g,eyerows,eyecols,fill):
    g2=copy.deepcopy(g)
    for y in eyerows:
        for x in eyecols: g2[y][x]=fill
    for x in eyecols: g2[eyerows[1]][x]='K'
    return g2
cc=list(range(5,8))+list(range(24,27))
cat2=close_eyes(cat,[12,13,14],cc,'D')
dc=list(range(6,9))+list(range(23,26))
doll2=close_eyes(doll,[12,13,14],dc,'S')
for nm,g,p in [('cat1',cat,CATP),('cat2',cat2,CATP),('doll1',doll,DOLLP),('doll2',doll2,DOLLP)]:
    render(g,p,nm)
print('ok')
