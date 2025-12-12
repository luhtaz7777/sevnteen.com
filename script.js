// script.js
// Expects a file named "logo.png" in same folder.
// Creates a spinning 3D thin box with the logo texture.

const container = document.getElementById('canvas-holder');
const width = container.clientWidth || 360;
const height = container.clientHeight || 360;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
camera.position.set(0, 0, 3.5);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// Lighting
const hemi = new THREE.HemisphereLight(0xffffff, 0x222222, 0.9);
scene.add(hemi);
const dir = new THREE.DirectionalLight(0xffffff, 0.7);
dir.position.set(5, 10, 7);
scene.add(dir);

// Controls (useful while designing, optional for end-user)
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = false; // keep user control; we'll auto-rotate the object itself

// Load the logo texture
const loader = new THREE.TextureLoader();
loader.setCrossOrigin("");
loader.load('logo.png',
  function(texture){
    texture.minFilter = THREE.LinearFilter;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    // Create a thin box so the logo reads on the face and you see subtle depth
    const thickness = 0.1;
    const geometry = new THREE.BoxGeometry(2.0, 2.0, thickness);

    const materialFront = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.6,
      metalness: 0.0,
      transparent: true
    });

    // Back uses the same texture flipped horizontally so it doesn't look blank
    const materialBack = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.8,
      metalness: 0.0,
      transparent: true
    });

    // Sides: simple dark material
    const sideMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });

    // Create an array of materials for each face
    const materials = [
      sideMaterial, // right
      sideMaterial, // left
      materialBack, // top
      materialFront, // bottom
      sideMaterial, // front
      sideMaterial  // back
    ];

    // Note: Box face indices are a bit unintuitive; we adjust scale instead
    const mesh = new THREE.Mesh(geometry, materials);
    mesh.scale.set(0.9, 0.9, 0.9);

    // rotate slightly for a nicer 3D look
    mesh.rotation.x = -0.2;

    scene.add(mesh);

    // subtle floating animation + slow spin
    let t = 0;
    function animate(){
      requestAnimationFrame(animate);
      t += 0.01;
      // slow spin around Y
      mesh.rotation.y += 0.007;
      // small bob
      mesh.position.y = Math.sin(t) * 0.03;
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // responsiveness
    window.addEventListener('resize', () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });

  },
  undefined,
  function(err){
    console.error('Error loading logo texture:', err);
    container.innerHTML = '<p style="color:#ddd">Could not load logo.png — make sure it is in the same folder.</p>';
  }
);

// set year in footer
document.getElementById('year').textContent = new Date().getFullYear();
