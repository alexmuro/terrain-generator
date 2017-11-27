all : overview.png globe.png world.topo.1024.jpg Srtm.1k_norm.jpg

overview.png:
	../planet -w 1024 -h 1024 -p m -m 1 -i -0.044 -S -T 0 25 -s .15465831 -c -c -c -c -C ../Lefebvre2.col | convert - overview.png

globe.png:
	../planet -w 1024 -h 1024 -p o -l 270 -m 1 -i -0.044 -S -T 0 25 -s .15465831 -g 15 -G 15 -c -c -c -c -C ../Lefebvre2.col | convert - globe.png

world.topo.1024.jpg:
	../planet -w 2048 -h 1024 -p q -m 1 -i -0.044 -S -T 0 25 -s .15465831 -c -c -c -c -E10 -C ../Lefebvre2.col | convert - world.topo.1024.jpg

Srtm.1k_norm.jpg:
	../planet -w 2048 -h 1024 -p q -m 1 -i -0.044 -S -T 0 25 -s .15465831 -C ../greyscale.col | convert - Srtm.1k_norm.jpg

