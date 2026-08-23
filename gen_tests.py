from PIL import Image, ImageDraw, ImageFilter
import random, math
random.seed(42)

# ====== 云图 ======
W, H = 800, 600
img = Image.new('RGB', (W, H))
px = img.load()
for y in range(H):
    t = y / H
    r = int(135 + (200-135)*t*0.3)
    g = int(180 + (230-180)*t*0.3)
    b = int(220 + (245-220)*t*0.3)
    for x in range(W):
        noise = random.randint(-8, 8)
        px[x, y] = (max(0,min(255,r+noise)), max(0,min(255,g+noise)), max(0,min(255,b+noise)))
dr = ImageDraw.Draw(img)
def cloud(cx, cy, sc, color):
    pts = [(-60,0,-35,35), (-30,-40,10,10), (10,-35,50,15), (40,-10,80,35),
           (20,20,60,55), (-20,15,30,55), (-70,5,-30,40), (-45,-25,-10,15)]
    for (x1,y1,x2,y2) in pts:
        dr.ellipse([cx+x1*sc, cy+y1*sc, cx+x2*sc, cy+y2*sc], fill=color)
cloud(250, 260, 1.3, (255,255,255))
cloud(600, 440, 1.5, (252,252,252))
# 高瘦云：使用正确边界
for i in range(5):
    x0 = 140 + i*6
    y0 = 70 + i*18
    x1 = x0 + 50 - i*3
    y1 = y0 + 45 - i*3
    if y1 > y0 and x1 > x0:
        dr.ellipse([x0, y0, x1, y1], fill=(255,255,255))
dr.ellipse([500, 120, 760, 200], fill=(255,255,255))
img = img.filter(ImageFilter.GaussianBlur(radius=2))
img.save('/workspace/test_clouds.png')
print('test_clouds.png:', img.size)

# ====== 旅行照：日落山脉+湖 ======
W2, H2 = 1200, 800
img2 = Image.new('RGB', (W2, H2))
px2 = img2.load()
random.seed(7)
for y in range(H2//2):
    t = y / (H2/2)
    r = int(255 - (255-120)*t)
    g = int(170 - (170-80)*t)
    b = int(100 + (160-100)*t)
    for x in range(W2):
        n = random.randint(-10,10)
        px2[x,y] = (max(0,min(255,r+n)), max(0,min(255,g+n)), max(0,min(255,b+n)))
dr2 = ImageDraw.Draw(img2)
dr2.ellipse([850, 180, 1010, 340], fill=(255, 200, 80))
# 山脉
for x in range(W2):
    base = H2//2 - 20
    m1 = abs(int(60 * math.sin(x*0.008))) + abs(int(30*math.sin(x*0.023 + 1.5)))
    m2 = abs(int(40 * math.sin(x*0.004 + 0.8)))
    h1 = base - m1 - m2
    for y in range(h1, H2//2):
        t2 = (y-h1) / max(1, (H2//2 - h1))
        r2 = int(40+(80-40)*t2); g2=int(30+(60-30)*t2); b2=int(50+(90-50)*t2)
        if 0<=x<W2 and 0<=y<H2:
            px2[x,y]=(r2,g2,b2)
# 湖
for y in range(H2//2, H2):
    t = (y - H2/2)/(H2/2)
    r = int(130 - 80*t)
    g = int(140 - 70*t)
    b = int(190 - 70*t)
    for x in range(W2):
        n = random.randint(-15,15)
        px2[x,y] = (max(0,min(255,r+n)), max(0,min(255,g+n)), max(0,min(255,b+n)))
img2 = img2.filter(ImageFilter.GaussianBlur(radius=1.5))
img2.save('/workspace/test_travel.jpg', quality=92)
print('test_travel.jpg:', img2.size)
