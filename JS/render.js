// basic 3D renderer for header canvas
// this mostly uses CPU rendering through JS, so output is heavily restricted

const canvas = document.getElementById("draw");
const ctx = canvas.getContext("2d");
let width = canvas.width;
let height = canvas.height;
let canvasObject = canvas.getBoundingClientRect();
let last = performance.now();
let mouseCoords = [0, 0];

canvas.addEventListener("mousemove", (e) => {
  mouseCoords = [e.offsetX, e.offsetY];
});

canvas.addEventListener("mouseleave", () => {
  mouseCoords = [1e9, 1e9];
});

function syncResolution() {
  canvasObject = canvas.getBoundingClientRect();
  
  canvas.width = canvasObject.width / pixelation;
  canvas.height = canvasObject.height / pixelation;
  
  width = canvas.width;
  height = canvas.height;
}

window.addEventListener('resize', syncResolution);

// generates a UV sphere with a given number of rings and segments
function generateSphere(rings, segments) {
  const vertices = [];
  const faces = [];

  for (let r = 0; r <= rings; r++) {
    const phi = (r * Math.PI) / rings;
    for (let s = 0; s <= segments; s++) {
      const theta = (s * 2 * Math.PI) / segments;
      vertices.push([
        Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta)
      ]);
    }
  }

  for (let r = 0; r < rings; r++) {
    for (let s = 0; s < segments; s++) {
      const first = r * (segments + 1) + s;
      const second = first + segments + 1;

      if (r == 0) {
        faces.push([first, second, second + 1]);
      } else if (r == rings - 1) {
        faces.push([first, second, first + 1]);
      } else {
        faces.push([first, second, second + 1]);
        faces.push([first, second + 1, first + 1]);
      }
    }
  }
  return { vertices, faces };
}

class Vec3 {
  static add(a, b) {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  }

  static subtract(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  }

  static cross(a, b) {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0]
    ]
  }

  static normalise(a) {
    const magnitude = Math.sqrt(a[0] ** 2 + a[1] ** 2 + a[2] ** 2);
    return [a[0] / magnitude, a[1] / magnitude, a[2] / magnitude];
  }

  static dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }

  // technically does the same thing as scalePoint, but scalePoint could be changed to accomodate rects
  static multiply(a, scalar) {
    return [a[0] * scalar, a[1] * scalar, a[2] * scalar]
  }
}

// takes bounded (-1 -> 1) co-ords and converts them to screen space (0 -> dim)
function toScreenSpace(point) {
    // point is already projected (divided by Z)
    // Map -1->1 to 0->width
    let screenX = (point[0] + 1) * 0.5 * width;
    let screenY = (1 - (point[1] + 1) * 0.5) * height; // Flip Y for screen space
    
    return [screenX, screenY];
}

function perspective([x, y, z]) {
  const px = x / z;
  const py = y / z;
  
  return [px, py];
}

// could also use full rotation matrix
function rotateObject(point, angles) {
  const [rx, ry, rz] = angles;
  // yaw/pitch/roll
  const rotations = [
    (point) => rotateZ(point, rz),
    (point) => rotateY(point, ry),
    (point) => rotateX(point, rx),
  ];
  return pipeline(point, rotations);
}

function rotateX([x, y, z], angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return [
    x,
    y * cos - z * sin,
    y * sin + z * cos
  ]
}

function rotateY([x, y, z], angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return [
    x * cos + z * sin,
    y,
    z * cos - x * sin
  ];
}

function rotateZ([x, y, z], angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return [
    x * cos - y * sin,
    x * sin + y * cos,
    z
  ]
}

function scalePoint(point, factor) {
  return [point[0] * factor, point[1] * factor, point[2] * factor];
}

function translatePoint(point, movement) {
  return [point[0] + movement[0], point[1] + movement[1], point[2] + movement[2]];
}

function normaliseAspectRatio([x, y, z]) {
  const internalAspect = canvas.width / canvas.height;

  return [
    x / internalAspect,
    y,
    z
  ];
}

function drawShape(points, filled=false, colour="rgb(0, 0, 0)") {
  let nextPoint = points[0];

  ctx.beginPath();
  ctx.moveTo(nextPoint[0], nextPoint[1]);
  for (let i = 1; i < points.length; i++) {
    nextPoint = points[i];
    ctx.lineTo(nextPoint[0], nextPoint[1]);
  }
  ctx.closePath();
  ctx.strokeStyle = colour;
  ctx.lineWidth = 1;
  
  if (filled) {
    ctx.fillStyle = colour;
    ctx.fill();
    // patches gaps between tris
    ctx.stroke();
  }
  else {
    ctx.stroke();
  };
}

function renderAnimatedSphere(scale=1) {
  const frequency = 0.25 * rotSpeedMult;
  const moveFrequency = 0.2 * movSpeedMult;

  const now = performance.now() / 1000;
  const timeRads = now * 2 * Math.PI;
  const rotation = timeRads * frequency;
  const offsetX = Math.sin(timeRads * moveFrequency) * 0.2 * movDistMult;
  const offsetY = Math.cos(timeRads * moveFrequency) * 0.2 * movDistMult;
  const offsetZ = camDistOffset + Math.sin(timeRads * moveFrequency / 2) * 0.25;

  renderShape(sphereData.vertices, sphereData.faces, scale, [rotation / 3, rotation, -rotation / 2], [offsetX, offsetY, offsetZ]);
}

function getCentroid(points) {
  let centers = [];
  for (let i = 0; i < points.length; i++) {
    centers.push(getAvg(points, i));
  }
  return centers;
}

function getObjData(vertices, faces) {
  const orderedFaces = orderFaces(vertices, faces);
  const faceNormals = getNormals(vertices, orderedFaces);

  return {faces: orderedFaces, normals: faceNormals};
}

function orderFaces(vertices, faces) {
  const faceDepth = faces.map(faceIndices => {
    const facePoints = faceIndices.map(index => vertices[index]);
    const avgZ = getAvg(facePoints, 2);

    return {
      indices: faceIndices,
      z: avgZ
    };
  });
  faceDepth.sort((a, b) => b.z - a.z);
  return faceDepth.map(face => face.indices);
}

// gets the normal of a given face by computing the cross product
// of two edges
function getNormals(vertices, faces) {
  return faces.map(faceIndices => {
    const v1 = vertices[faceIndices[0]];
    const v2 = vertices[faceIndices[1]];
    const v3 = vertices[faceIndices[2]];

    const e1 = Vec3.subtract(v2, v1);
    const e2 = Vec3.subtract(v3, v1);

    const normal = Vec3.cross(e1, e2);
    const magSquared = normal[0]**2 + normal[1]**2 + normal[2]**2;
    // if the vector has extremely low magnitude, (i.e. 0), this can cause flickering
    // this fixes that by approximating the face normal as a vertex
    if (magSquared < 1e-8) {
      return Vec3.normalise(v1);
    }
    return Vec3.normalise(normal);
  });
}

// applies n functions sequentially to a value
const pipeline = (value, functions) => functions.reduce((val, fn) => fn(val), value);
// calculates euclidean distance between two 2D points 
const distance = (point1, point2) => Math.sqrt((point2[0] - point1[0]) ** 2 + (point2[1] - point1[1]) ** 2);
// returns a boolean depending on whether any point in an array is within a given distance from another point
const isWithinDistance = (points, comparisonPoint, dist) => distance(getCentroid(points), comparisonPoint) < dist;
// gets the central position of a collection of points
const getAvg = (points, index) => points.reduce((sum, point) => sum + point[index], 0) / points.length;
// gets the coords of the mouse in canvas space
const getCanvasMouseCoords = (mousePos) => [(mousePos[0] - canvasObject.left) / canvasObject.width * width, (mousePos[1] - canvasObject.top) / canvasObject.height * height];
// snaps the given value (0-1) to the closest "quantisation level"
function quantise(value, levels=10) {
  const step = 1 / (levels - 1);
  return Math.floor((value + step / 2) * (levels - 1)) * step;
}
// gets the brightness of a given normal for n directional lights by calculating diffuse for each light + ambient
const getBrightness = (normal) => Math.min(lights.reduce((sum, l) => sum + Math.max(Vec3.dot(l.direction, normal) * l.brightness, 0), 0) + ambient, 1);
// converts a Vec3 to a usable rgb() value
const toRGBString = (colour) => `rgb(${colour[0]}, ${colour[1]}, ${colour[2]})`;
// for debugging - logs a value and returns it
const logValue = (value) => {console.log(value); return value}

function renderShape(vertices, faces, scale=1, rotation=[0, 0, 0], offset=[0, 0, 0]) {
  // functions which change only the internal representation of the object (i.e. object space)
  // could add an additional translate/rotate pair for rotation about a pivot
  const preOrderFunctions = [
    (point) => scalePoint(point, scale),
    (point) => rotateObject(point, rotation),
    (point) => translatePoint(point, offset),
  ];
  // functions which directly change how the object is rendered on the screen
  const postOrderFunctions = [
    perspective,
    normaliseAspectRatio,
    toScreenSpace,
  ];

  const colourFunctions = [
    getBrightness,
    (colour) => quantise(colour, quantisationLevel),
    (colour) => colour * 255,
    (colour) => [colour, colour, colour],
    toRGBString,
  ];

  const objectVerts = vertices.map(vert => pipeline(vert, preOrderFunctions));
  const faceData = getObjData(objectVerts, faces);
  const screenVerts = objectVerts.map(vert => pipeline(vert, postOrderFunctions));

  const canvasSpaceMouse = getCanvasMouseCoords(mouseCoords);
  const detectionDistance = canvas.height / 4;
  for (let i = 0; i < faceData.faces.length; i++) {
    const face = faceData.faces[i];
    const normal = faceData.normals[i];
    const objPoints = face.map(index => objectVerts[index]);

    // near plane check - if depth of current object is behind camera, do not render it
    if (objPoints.some(vert => vert[2] < nearPlane)) continue;

    const facePoints = face.map(index => screenVerts[index]);
    const colour = pipeline(normal, colourFunctions);
    if (doHover) {
      const fullFaceDrawn = isWithinDistance(facePoints, canvasSpaceMouse, detectionDistance);
      drawShape(facePoints, fullFaceDrawn, colour);
    } else {
      drawShape(facePoints, true, colour);
    }
  }
}

function renderLoop() {
  const now = performance.now();
  const dt = now - last;
  last = now;

  ctx.clearRect(0, 0, width, height);

  renderAnimatedSphere(sphereScale);
  requestAnimationFrame(renderLoop);
}

const nearPlane = 0.04; 
let sphereData = generateSphere(6, 8);
let pixelation = 3;
let quantisationLevel = 2 ** 4;
let rotSpeedMult = 1;
let movDistMult = 1;
let movSpeedMult = 1;
let sphereScale = 1.7;
let doHover = true;
let camDistOffset = 3;
let lightXOffset = 1;

const moveSpeedSlider = document.getElementById("move-speed");
const moveRangeSlider = document.getElementById("move-distance");
const rotSpeedSlider = document.getElementById("rotation-speed");
const sphereSizeSlider = document.getElementById("sphere-size");
const camDistSlider = document.getElementById("cam-distance");

const hoverToggle = document.getElementById("toggle-sphere-hover");
const lightPosSlider = document.getElementById("light-position");
const quantLevelSlider = document.getElementById("quantisation-level");
const pixelationSlider = document.getElementById("pixelation-level");
const sphereDetailSlider = document.getElementById("sphere-detail");

moveSpeedSlider.oninput = () => movSpeedMult = moveSpeedSlider.value / 10;
moveRangeSlider.oninput = () => movDistMult = moveRangeSlider.value / 10;
rotSpeedSlider.oninput = () => rotSpeedMult = rotSpeedSlider.value / 10;
sphereSizeSlider.oninput = () => sphereScale = sphereSizeSlider.value / 10;
camDistSlider.oninput = () => camDistOffset = camDistSlider.value / 10;

hoverToggle.oninput = () => doHover = !doHover;
lightPosSlider.oninput = () => {lightXOffset = lightPosSlider.value / 10; lights = [{direction: Vec3.normalise([lightXOffset, -0.5, 0.3]), brightness: 0.9}]};
quantLevelSlider.oninput = () => quantisationLevel = 2 ** (8 - quantLevelSlider.value);
pixelationSlider.oninput = () => {pixelation = pixelationSlider.value; syncResolution();}
sphereDetailSlider.oninput = () => sphereData = generateSphere(parseInt(sphereDetailSlider.value), parseInt(sphereDetailSlider.value) + 2);

const camLight = {direction: Vec3.normalise([lightXOffset, -0.5, 0.3]), brightness: 0.9};
const ambient = 0.05;
let lights = [camLight];

syncResolution();
requestAnimationFrame(renderLoop);