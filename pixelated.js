/**
 *  Pixelated.js
 * 
 *  Automatically scale img tags using nearest-neighbor.
 *  Just add the "pixelated" attribute to your img.
 * 
 *  @author Maximillian Laumeister
 *  @link https://github.com/MaxLaumeister/pixelated-polyfill
 *  @license http://opensource.org/licenses/MIT MIT License
 *  @copyright 2020 Maximillian Laumeister
 */
(function() {
    class PixelatedImage {
        constructor(img) {
            this.img = img;
            this.originalImg = img.cloneNode(true);
            if (img.complete) {
                this.init();
            } else {
                img.onload = () => {
                    img.onload = null;
                    this.init();
                };
            }
        }

        init() {
            // First try native
            
            this.img.style.imageRendering = "pixelated";
            
            // Then, polyfill time

            if (!CSS.supports("image-rendering", "pixelated")) {
                // Lock dimensions
                if (!this.img.getAttribute("width") && !this.img.getAttribute("height")) {
                    this.img.width = this.img.naturalWidth;
                    this.img.height = this.img.naturalHeight;
                }
                // Set up canvas
                this.canvas = document.createElement('canvas');
                this.ctx = this.canvas.getContext("2d");

                // Size the canvas and draw

                this.updateCanvas();

                // Listen for size changes

                new ResizeObserver(this.updateCanvas.bind(this)).observe(this.img);
            }
        }

        updateCanvas() {
            // Debounce
            if (!this.canvasDebounceTimeout) {
                // Update canvas size
                const dpr = window.devicePixelRatio || 1;
                const w = this.img.clientWidth * dpr;
                const h = this.img.clientHeight * dpr;
                this.canvas.width = w;
                this.canvas.height = h;
                // Redraw
                this.ctx.save();
                this.ctx.imageSmoothingEnabled = false;
                this.ctx.drawImage(this.originalImg, 0, 0, this.canvas.width, this.canvas.height);
                this.ctx.restore();
                // Draw canvas to img element
                this.img.src = this.canvas.toDataURL();
                // Set debounce
                this.canvasDebounceTimeout = setTimeout(() => {
                    this.canvasDebounceTimeout = null;
                }, 500);
                // Set final timeout
                clearTimeout(this.canvasFinalTimeout);
                this.canvasFinalTimeout = setTimeout(this.updateCanvas.bind(this), 500);
            }
        }
    }

    function processImage(img) {
        img.style.imageRendering = "pixelated";
        new PixelatedImage(img);
    }

    document.addEventListener("DOMContentLoaded", function() {
        // Process existing images
        const imgs = document.querySelectorAll("img[pixelated]");
        imgs.forEach( img => {
            if (img instanceof HTMLImageElement) {
                processImage(img);
            }
        });
    });
})();
