window.onload = function () {
	const canvas = document.getElementById("cv");
	const ctx = document.getElementById("cv").getContext("2d");
	const form = document.getElementById("form");
	const subButton = document.getElementById("submit");

	form.addEventListener("submit", function(event) {
            subButton.disabled = true;
            
			resolution = {
				'720p': {height: 600, width: 921},
				'1080p': {height: 1080, width: 1920},
				'4k': {height: 2160, width: 3840},
				'8k': {height: 4320, width: 7680}
			}[document.querySelector('input[name="resolution"]:checked').value];
			
			const canvasDimensions = { height: resolution.height, width: resolution.width };
			canvas.height = canvasDimensions.height;
			canvas.width = canvasDimensions.width;
                        canvas.style.width = "100%"

            const dimensions = {
		    height: canvasDimensions.height, 
		    width: canvasDimensions.width,
		    xmax: +document.getElementById("xmax").value,
		    xmin: +document.getElementById("xmin").value,
		    ymin: +document.getElementById("ymin").value,
		    ymax: +document.getElementById("ymax").value,
		    iter: +document.getElementById("iter").value
	    };

            const numWorkers = +document.getElementById("worker").value;
            for(let w = 0; w < numWorkers; w += 1) {
                const worker = new Worker('worker.js');
                worker.onmessage = receiveMessage(dimensions, ctx, subButton);
                worker.postMessage({dimensions, teamwork: {workerN: w, skip: numWorkers}});
            }
            event.preventDefault();
	});
}

function receiveMessage(dimensions, ctx, subButton){ return function({data: {imageData, ln, done}}) {
    if (imageData) {
		renderRow(dimensions, ctx, ln, imageData);
	} else if (done) {
		subButton.disabled = false;
	}
}}

function renderRow(dim, ctx, ln, imageData){
	ctx.putImageData(imageData, 0, ln, 0, 0, dim.width, 1);
}
