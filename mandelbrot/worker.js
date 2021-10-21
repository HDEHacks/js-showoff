self.onmessage = function receiveMessage(msg) {
    const data = msg.data;
    const {workerN, skip} = data.teamwork;
    const dim = data.dimensions;
    
    const generator = fieldGenerator(dim.xmin, dim.ymin, dim.xmax, dim.ymax, dim.width, dim.height);

    for (let row = workerN; row < dim.height; row += skip) {
        const imageData = new ImageData(dim.width, 1);
        for (let col = 0; col < dim.width; col += 1) {
            const [real, img] = generator(col, row);
            const value = iterateOn(real, img, dim.iter);
            const render = value < 0 ? 0 : 0xFFFFFF*Math.pow(value/dim.iter, 0.5);

            const offset = col*4;
            imageData.data[offset]     = (render & 0xFF00000) >>> 16;
            imageData.data[offset + 1] = (render & 0xFF00) >>> 8;
            imageData.data[offset + 2] =  render & 0xFF
            imageData.data[offset + 3] = 255;
        }
        self.postMessage({imageData, ln: row});
    }

    self.postMessage({done: true});
}


// Generates points in C for the window
function fieldGenerator(minX, minY, maxX, maxY, winWidth, winHeight) {
	const dX = (maxX - minX) / winWidth;
	const dY = (maxY - minY) /winHeight;

	return ((x,y) => [minX + dX*x, minY + dY*y]);
}

// Operations on C
function absEscaped(real, img) {
	return real*real + img*img > 4;
}

function squareAndAdd(real, img, realAddend, imgAddend) {
	return [
		real*real - img*img + realAddend,
		2*real*img + imgAddend
	];
}

function iterateOn(real, img, num) {
	const realC = real;
	const imgC = img;

	for (let i = 0; i< num; i+= 1) {
		if (absEscaped(real, img)) {
			return i;
		} else {
			const r = real;
			const i = img;
			real = r*r - i*i + realC;
			img = 2*r*i + imgC
		}
	}

	if (absEscaped(real, img)) {
		return num;
	} else {
		return -1;
	}
}
