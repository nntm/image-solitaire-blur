import p5 from "p5";
import { IMG_FILE_NAME, IMG_HEIGHT_RATIO } from "./settings";

//-----------------------------------------------------------------------------//
//-----------------------------------------------------------------------------//
//-----------------------------------------------------------------------------//

const sketch = (p) => {
    let img;

    //-----------------------------------------------------------------------------//

    p.setup = async () => {
        img = await loadImage(IMG_FILE_NAME);

        p.createCanvas(window.innerWidth, window.innerHeight);
        p.background(255);
        p.imageMode(p.CENTER);
    };

    const loadImage = async (url) => {
        const img = await p.loadImage(url);
        img.resize(0, IMG_HEIGHT_RATIO * window.innerHeight);

        return img;
    };

    //-----------------------------------------------------------------------------//

    p.draw = () => {
        p.translate(p.mouseX, p.mouseY);
        // p.filter(p.POSTERIZE, 150);
        p.filter(p.DILATE);
        // p.filter(p.ERODE);
        p.filter(p.BLUR, 0.5);
        p.image(img, 0, 0);
    };

    //-----------------------------------------------------------------------------//

    p.windowResized = () => {
        p.resizeCanvas(window.innerWidth, window.innerHeight);
    };
};

new p5(sketch);
