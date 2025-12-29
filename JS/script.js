const contactLink = document.getElementById("contact-link");
const dropdownMenu = document.getElementById("contact-dropdown");

const gridWrapper = document.querySelector(".language-container");
const leftScroll = document.getElementById("left-scroll");
const rightScroll = document.getElementById("right-scroll");
const canvas = document.getElementById("header-canvas");
const headerBox = document.getElementById("header-box");
const ctx = canvas.getContext("2d");

const players = new Map();
const sphereVertices = [
    [0.0, 0.0, -1.0],
    [0.7236073017120361, -0.5257253050804138, -0.44721952080726624],
    [-0.276388019323349, -0.8506492376327515, -0.4472198486328125],
    [-0.8944262266159058, 0.0, -0.44721561670303345],
    [-0.276388019323349, 0.8506492376327515, -0.4472198486328125],
    [0.7236073017120361, 0.5257253050804138, -0.44721952080726624],
    [0.276388019323349, -0.8506492376327515, 0.4472198486328125],
    [-0.7236073017120361, -0.5257253050804138, 0.44721952080726624],
    [-0.7236073017120361, 0.5257253050804138, 0.44721952080726624],
    [0.276388019323349, 0.8506492376327515, 0.4472198486328125],
    [0.8944262266159058, 0.0, 0.44721561670303345],
    [0.0, 0.0, 1.0],
    [-0.16245555877685547, -0.49999526143074036, -0.8506544232368469],
    [0.42532268166542053, -0.30901139974594116, -0.8506541848182678],
    [0.26286882162094116, -0.8090116381645203, -0.5257376432418823],
    [0.8506478667259216, 0.0, -0.5257359147071838],
    [0.42532268166542053, 0.30901139974594116, -0.8506541848182678],
    [-0.525729775428772, 0.0, -0.8506516814231873],
    [-0.6881893873214722, -0.49999693036079407, -0.5257362127304077],
    [-0.16245555877685547, 0.49999526143074036, -0.8506544232368469],
    [-0.6881893873214722, 0.49999693036079407, -0.5257362127304077],
    [0.26286882162094116, 0.8090116381645203, -0.5257376432418823],
    [0.9510578513145447, -0.30901262164115906, 0.0],
    [0.9510578513145447, 0.30901262164115906, 0.0],
    [0.0, -0.9999999403953552, 0.0],
    [0.5877856016159058, -0.8090167045593262, 0.0],
    [-0.9510578513145447, -0.30901262164115906, 0.0],
    [-0.5877856016159058, -0.8090167045593262, 0.0],
    [-0.5877856016159058, 0.8090167045593262, 0.0],
    [-0.9510578513145447, 0.30901262164115906, 0.0],
    [0.5877856016159058, 0.8090167045593262, 0.0],
    [0.0, 0.9999999403953552, 0.0],
    [0.6881893873214722, -0.49999693036079407, 0.5257362127304077],
    [-0.26286882162094116, -0.8090116381645203, 0.5257376432418823],
    [-0.8506478667259216, 0.0, 0.5257359147071838],
    [-0.26286882162094116, 0.8090116381645203, 0.5257376432418823],
    [0.6881893873214722, 0.49999693036079407, 0.5257362127304077],
    [0.16245555877685547, -0.49999526143074036, 0.8506543636322021],
    [0.525729775428772, 0.0, 0.8506516814231873],
    [-0.42532268166542053, -0.30901139974594116, 0.8506541848182678],
    [-0.42532268166542053, 0.30901139974594116, 0.8506541848182678],
    [0.16245555877685547, 0.49999526143074036, 0.8506543636322021]
]
const sphereFaces = [
    [0, 13, 12],
    [1, 13, 15],
    [0, 12, 17],
    [0, 17, 19],
    [0, 19, 16],
    [1, 15, 22],
    [2, 14, 24],
    [3, 18, 26],
    [4, 20, 28],
    [5, 21, 30],
    [1, 22, 25],
    [2, 24, 27],
    [3, 26, 29],
    [4, 28, 31],
    [5, 30, 23],
    [6, 32, 37],
    [7, 33, 39],
    [8, 34, 40],
    [9, 35, 41],
    [10, 36, 38],
    [38, 41, 11],
    [38, 36, 41],
    [36, 9, 41],
    [41, 40, 11],
    [41, 35, 40],
    [35, 8, 40],
    [40, 39, 11],
    [40, 34, 39],
    [34, 7, 39],
    [39, 37, 11],
    [39, 33, 37],
    [33, 6, 37],
    [37, 38, 11],
    [37, 32, 38],
    [32, 10, 38],
    [23, 36, 10],
    [23, 30, 36],
    [30, 9, 36],
    [31, 35, 9],
    [31, 28, 35],
    [28, 8, 35],
    [29, 34, 8],
    [29, 26, 34],
    [26, 7, 34],
    [27, 33, 7],
    [27, 24, 33],
    [24, 6, 33],
    [25, 32, 6],
    [25, 22, 32],
    [22, 10, 32],
    [30, 31, 9],
    [30, 21, 31],
    [21, 4, 31],
    [28, 29, 8],
    [28, 20, 29],
    [20, 3, 29],
    [26, 27, 7],
    [26, 18, 27],
    [18, 2, 27],
    [24, 25, 6],
    [24, 14, 25],
    [14, 1, 25],
    [22, 23, 10],
    [22, 15, 23],
    [0, 13, 12],
    [1, 13, 15],
    [0, 12, 17],
    [0, 17, 19],
    [0, 19, 16],
    [1, 15, 22],
    [2, 14, 24],
    [3, 18, 26],
    [4, 20, 28],
    [5, 21, 30],
    [1, 22, 25],
    [2, 24, 27],
    [3, 26, 29],
    [4, 28, 31],
    [5, 30, 23],
    [6, 32, 37],
    [7, 33, 39],
    [8, 34, 40],
    [9, 35, 41],
    [10, 36, 38],
    [38, 41, 11],
    [38, 36, 41],
    [36, 9, 41],
    [41, 40, 11],
    [41, 35, 40],
    [35, 8, 40],
    [40, 39, 11],
    [40, 34, 39],
    [34, 7, 39],
    [39, 37, 11],
    [39, 33, 37],
    [33, 6, 37],
    [37, 38, 11],
    [37, 32, 38],
    [32, 10, 38],
    [23, 36, 10],
    [23, 30, 36],
    [30, 9, 36],
    [31, 35, 9],
    [31, 28, 35],
    [28, 8, 35],
    [29, 34, 8],
    [29, 26, 34],
    [26, 7, 34],
    [27, 33, 7],
    [27, 24, 33],
    [24, 6, 33],
    [25, 32, 6],
    [25, 22, 32],
    [22, 10, 32],
    [30, 31, 9],
    [30, 21, 31],
    [21, 4, 31],
    [28, 29, 8],
    [28, 20, 29],
    [20, 3, 29],
    [26, 27, 7],
    [26, 18, 27],
    [18, 2, 27],
    [24, 25, 6],
    [24, 14, 25],
    [14, 1, 25],
    [22, 23, 10],
    [22, 15, 23]
]

const cubeVertices = [
    [1, -1, 1],
    [1, -1, -1],
    [-1, -1, 1],
    [-1, -1, -1],
    [1, 1, 1],
    [1, 1, -1],
    [-1, 1, 1],
    [-1, 1, -1]
]

const cubeFaces = [
    [0, 1, 4]
]

let player = null;

// youtube handling
let ytApiReady = false;
window.onYouTubeIframeAPIReady = (() => { ytApiReady = true; });

var tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
var scriptTag = document.getElementsByTagName("script")[0];
scriptTag.parentNode.insertBefore(tag, scriptTag);

dropdownActive = false;

function getScrollAmount() {
    return 100 + window.innerWidth / 5
}

function activateDropdown() {
    const linkRect = contactLink.getBoundingClientRect();

    dropdownMenu.classList.remove("dropdown-recall");
    dropdownMenu.style.top = `${linkRect.bottom + 12}px`;
    dropdownMenu.style.left = `${linkRect.left + linkRect.width / 2}px`;
    dropdownMenu.classList.add("dropdown-animation");
}

function removeDropdown() {
    dropdownMenu.classList.remove("dropdown-animation");
    dropdownMenu.classList.add("dropdown-recall");
}

function drawBackground() {
    const pixelation = 4;

    const dims = headerBox.getBoundingClientRect();
    canvas.width = dims.width / pixelation;
    canvas.height = dims.height / pixelation;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
window.addEventListener("resize", drawBackground);

// takes bounded (-1 -> 1) co-ords and converts them to screen space (0 -> dim)
function toScreenSpace(point) {
    let normDims = ((point[0] + 1) / 2, (point[1] + 1) / 2);
    let screenX = normDims[0] * canvas.width;
    let screenY = (1 - normDims[1]) * canvas.height;
    
    return [screenX / point[2] | 1000, screenY / point[2] | 1000];
}

// inverse of function above
function toObjectSpace(x, y) {
    let objX = (x / canvas.width) * 2 - 1;
    let objY = (1 - (y / canvas.height)) * 2 - 1;

    return [objX, objY];
}

function perspective(point) {
    return [point[0] / point[2], point[1] / point[2]];
}

function rotate(point, angle) {
    return [point[0] * Math.cos(angle) - point[1] * Math.sin(angle), point[0] * Math.sin(angle) + point[1] * Math.cos(angle), point[2]];
}

function scalePoint(point, factor) {
    point.forEach(p => p * factor);
    return point;
}

function translate(point, movement) {
    for (let i = 0; i < point.length; i++) {point[i] += movement[i];}
    return point;
}

function isColliding(bounds, position) {
    return (
        position[0] >= bounds.left && position[0] <= bounds.right &&
        position[1] >= bounds.top && position[1] <= bounds.bottom
    );
}

function mod(n, m) {
    return ((n % m) + m) % m;
}

document.addEventListener("scroll", function () {
    const parallaxElements = document.querySelectorAll(".project-parallax");

    parallaxElements.forEach(parallax => {
        const rect = parallax.getBoundingClientRect();
        const speed = 0.3;
        const offset = (rect.top - window.innerHeight / 2) * speed - rect.height * 0.8;

        parallax.style.setProperty("--parallax-offset", `${offset}px`);
    });
});


window.addEventListener("DOMContentLoaded", function () {
    function initBackground() {
        const pos = toScreenSpace(0, 0);
        const size = canvas.width / 10;
        ctx.fillRect(pos[0] - size / 2, pos[1] - size / 2, size, size);
    }

    function drawScene() {
        drawBackground();
        drawSphere();
        requestAnimationFrame(drawScene);
    }

    function drawSphere() {
        const scale = 30;
        const pos = [0, 0, 0];

        /*
        for (let i = 0; i < sphereFaces.length; i++) {
            let vertices = [];
            points = sphereFaces[i].forEach(index => {
                vertices.push(sphereVertices[index]);
            });
            vertices.forEach(vert => {
                let tPts = translate(vert, pos);
                let sPts = scalePoint(tPts, scale);
                let ssPts = toScreenSpace(sPts);
                vert = ssPts;
            });
            drawShape(vertices);
        }
        */

        ctx.strokeStyle = "green";
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width / 2, canvas.height / 2);
        ctx.closePath();
        ctx.stroke();
    }

    function drawShape(points, colour, fill) {
        const firstPoint = points[0];
        if (colour != null) ctx.strokeStyle = colour;
        else ctx.strokeStyle = "green";

        ctx.beginPath();
        ctx.moveTo(firstPoint[0], firstPoint[1]);
        for (let i = 1; i < points.length; i++) {
            let nextPoint = points[i];
            ctx.lineTo(nextPoint[0], nextPoint[1]);
        }
        ctx.closePath();

        if (fill == true) ctx.fill();
        else ctx.stroke();
    }

    let mousePos = [0, 0];
    canvas.addEventListener("mousemove", (e) => {
        mousePos = [e.clientX, e.clientY];
    });

    canvas.addEventListener("mouseleave", () => {
        mousePos = [9999, 9999];
    });

    requestAnimationFrame(drawScene);

    const projectCards = document.querySelectorAll(".project-article");
    const rotationCap = 4;

    projectCards.forEach(card => {
        const fps = 60;
        const mspf = 1000 / fps;
        let rect = card.getBoundingClientRect();
        let active = false;
        let then = performance.now();

        window.addEventListener("scroll", () => { rect = card.getBoundingClientRect(); });
        window.addEventListener("resize", () => { rect = card.getBoundingClientRect(); });

        function applyTilt(e) {
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;

            const degX = (y - 0.5) * -rotationCap * 2; 
            const degY = (x - 0.5) * rotationCap * 2;
            const degMag = Math.sqrt(degX ** 2 + degY ** 2);
            const degMult = degMag > rotationCap ? rotationCap / degMag : 1;

            card.style.setProperty('--rx', `${degX * degMult}deg`);
            card.style.setProperty('--ry', `${degY * degMult}deg`);
        }

        function loadVideo() {
            const vId = card.getAttribute("data-video");
            const vContainer = card.querySelector(".project-video");

            if (vId && vContainer && !vContainer.dataset.loaded) {
                const playerDivId = `player-${vId}`;
                vContainer.innerHTML = `<div id="${playerDivId}"></div>`;
                
                if (ytApiReady) {
                    new YT.Player(playerDivId, {
                        height: '100%',
                        width: '100%',
                        videoId: vId,
                        playerVars: { 'autoplay': 1, 'rel': 0 }
                    });
                    vContainer.dataset.loaded = "true";

                    return true;
                }
            }
            return false;
        }

        card.addEventListener("mousemove", (e) => {
            if (active) return;

            if (performance.now() - then > mspf) {
                then = performance.now();
                applyTilt(e);
            };
        })

        card.addEventListener("mouseleave", () => {
            card.style.setProperty('--rx', '0deg');
            card.style.setProperty('--ry', '0deg');
        })

        card.addEventListener("click", (e) => {
            if (e.target.closest('a')) {
                return;
            }

            active = !active;
            if (active) {
                if (loadVideo()) {
                    console.log("loaded video id:" + card.getAttribute("data-video"));
                } else {
                    console.log("failed to load video")
                }
            }
            else {
                const vContainer = card.querySelector(".project-video");
                if (vContainer != null) {
                    vContainer.innerHTML = "";
                    delete vContainer.dataset.loaded;
                }
            }

            card.style.setProperty("--rx", "0deg");
            card.style.setProperty("--ry", "0deg");
            card.classList.toggle("active-state");

            setTimeout(() => {
                card.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);

            setTimeout(() => {
                rect = card.getBoundingClientRect();
            }, 500);
        })
    })

    initBackground();
})

//updateButtonState();