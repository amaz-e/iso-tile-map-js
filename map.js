    const tileWidth = 88;
    const tileHeight = 43;

    const tileset = {
        0: 'grass.png',
        1: 'water.png',
        2: 'mountain.png'
        // more mappings 
    };

    // Load tile images into an object
    const tileImages = {};
    let imagesLoaded = 0;
    const totalImages = Object.keys(tileset).length;

    function loadImages(callback) {
        for (const key in tileset) {
            const img = new Image();
            img.src = tileset[key];
            img.onload = function() {
                imagesLoaded++;
                if (imagesLoaded === totalImages) {
                    callback();
                }
            };
            img.onerror = function() {
                console.error("Error loading image: " + img.src);
                imagesLoaded++;
                if (imagesLoaded === totalImages) {
                    callback();
                }
            };
            tileImages[key] = img;
        }
    }

    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');

    const mapArray = [
        [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0]
    ];

    // Variables for map scrolling
    let isDragging = false;
    let dragStartX, dragStartY;
    let lastDragX, lastDragY;
    let offsetX = canvas.width / 2;
    let offsetY = 50;

    // Tile selection
    let markedTile = { x: -1, y: -1 };

    // Function to convert screen coordinates to isometric coordinates
    function screenToIso(screenX, screenY) {
        const x = (screenX - offsetX) / (tileWidth / 2);
        const y = (screenY - offsetY) / (tileHeight / 2);
        return { x: (x + y) / 2, y: (y - x) / 2 };
    }

    // Render the map
	function renderMap() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		for (let y = 0; y < mapArray.length; y++) {
			for (let x = 0; x < mapArray[y].length; x++) {
				const isoX = (x - y) * (tileWidth / 2) + offsetX;
				const isoY = (x + y) * (tileHeight / 2) + offsetY;
				const tileType = mapArray[y][x];
				const tileImage = tileImages[tileType];
				if (tileImage) {
					ctx.drawImage(tileImage, isoX, isoY);
					// Draw a border around the marked tile
					if (x === markedTile.x && y === markedTile.y) {
						drawIsometricTileBorder(isoX, isoY, tileWidth, tileHeight, 'red', 2);
					}
				}
			}
		}
	}
	
	function drawIsometricTileBorder(isoX, isoY, tileWidth, tileHeight, color, lineWidth) {
		ctx.strokeStyle = color;
		ctx.lineWidth = lineWidth;
		ctx.beginPath();
		ctx.moveTo(isoX + tileWidth / 2, isoY);
		ctx.lineTo(isoX + tileWidth, isoY + tileHeight / 2);
		ctx.lineTo(isoX + tileWidth / 2, isoY + tileHeight);
		ctx.lineTo(isoX, isoY + tileHeight / 2);
		ctx.closePath();
		ctx.stroke();
	}

    function showTileDescription(x, y) {
        const tileType = mapArray[y][x];
        const description = getTileDescription(tileType);
		document.getElementById('descriptionField').value = "Tile (" + x + ", " +y + ") of type: " +description;
    }

    function getTileDescription(tileType) {
        switch(tileType) {
            case 0:
                return "Grass";
            case 1:
                return "Water";
            case 2:
                return "Mountain";
            default:
                return "Unknown";
        }
    }


	// Handle mouse events
	canvas.addEventListener('click', function(event) {
	if (event.button === 0) { 
		if (isDragging) return; 

		// Adjust input coordinates to match rendered map
		const mouseX = event.clientX - canvas.getBoundingClientRect().left;
		const mouseY = event.clientY - canvas.getBoundingClientRect().top;
		const isoX = (mouseX - offsetX - tileWidth / 2) / (tileWidth / 2);
		const isoY = (mouseY - offsetY ) / (tileHeight / 2);
		const tileX = Math.floor((isoX + isoY) / 2);
		const tileY = Math.floor((isoY - isoX) / 2);

		if (tileX >= 0 && tileX < mapArray[0].length && tileY >= 0 && tileY < mapArray.length) {
			markedTile = { x: tileX, y: tileY };
			console.log("Clicked Tile Coordinates: ", markedTile);
			renderMap();
			showTileDescription(tileX, tileY);
		}}
	});
	
	canvas.addEventListener('mousedown', function(event) {
	if (event.button === 0) { 
		isDragging = true;
		dragStartX = event.clientX;
		dragStartY = event.clientY;
		lastDragX = dragStartX;
		lastDragY = dragStartY;
		}
	});

    canvas.addEventListener('mouseup', function(event) {
        isDragging = false;
    });

    
    canvas.addEventListener('mousemove', function(event) {
        if (isDragging) {
            const deltaX = event.clientX - lastDragX;
            const deltaY = event.clientY - lastDragY;
            offsetX += deltaX;
            offsetY += deltaY;
            lastDragX = event.clientX;
            lastDragY = event.clientY;
            renderMap();
        }
    });

    loadImages(renderMap);

    // Prevent the context menu from appearing on right-click
    canvas.addEventListener('contextmenu', function(event) {
        event.preventDefault();
    });