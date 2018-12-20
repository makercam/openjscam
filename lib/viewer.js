"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const THREE = __importStar(require("three"));
if (typeof window !== 'undefined') {
    window.THREE = THREE;
    require('three/examples/js/controls/OrbitControls');
}
exports.default = (state, containerEl) => {
    var renderer = new THREE.WebGLRenderer();
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0xaaaaaa);
    var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 1000);
    var controls = new THREE.OrbitControls(camera);
    controls.screenSpacePanning = true;
    var size = 1000;
    var divisions = 100;
    var grid = new THREE.GridHelper(size, divisions, 0xaaaaaa, 0xbbbbbb);
    var array = grid.geometry.attributes.color.array;
    for (var i = 0; i < array.length; i += 60) {
        for (var j = 0; j < 12; j++) {
            array[i + j] = 0.56;
        }
    }
    grid.geometry.rotateX(Math.PI / 2);
    var vector = new THREE.Vector3(0, 0, 1);
    grid.lookAt(vector);
    scene.add(grid);
    var axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    renderer.setSize(window.innerWidth, window.innerHeight);
    (containerEl || document.body).appendChild(renderer.domElement);
    var rapidMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff, opacity: 0.5, transparent: true });
    var cutMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    let shapes = state.shapes;
    shapes.forEach(shape => {
        if (shape instanceof THREE.LineCurve3) {
            const geometry = new THREE.Geometry();
            geometry.vertices.push(shape.v1);
            geometry.vertices.push(shape.v2);
            scene.add(new THREE.Line(geometry, shape.isRapid ? rapidMaterial : cutMaterial));
        }
        if (shape instanceof THREE.EllipseCurve) {
            const geometry = new THREE.BufferGeometry().setFromPoints(shape.getPoints(64));
            scene.add(new THREE.Line(geometry, cutMaterial));
        }
    });
    camera.position.set(0, 0, 200);
    camera.lookAt(new THREE.Vector3());
    controls.update();
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
};
//# sourceMappingURL=viewer.js.map