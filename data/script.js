// Combined script.js for 3D Golf Club and Sensor Integration

let scene, camera, renderer, golfClub;

// Create the golf club model
function createGolfClub() {
  // Shaft
  const shaftGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 32);
  const shaftMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
  const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
  shaft.position.y = 1;

  // Head
  const headGeometry = new THREE.BoxGeometry(0.1, 0.05, 0.2);
  const headMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.set(0, 2, 0);

  golfClub = new THREE.Group();
  golfClub.add(shaft);
  golfClub.add(head);
  scene.add(golfClub);
}

// Initialize Three.js scene
function init3D() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(5, 5, 5).normalize();
  scene.add(directionalLight);

  createGolfClub();
  animate();
}

// Handle window resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

// EventSource for sensor readings
if (!!window.EventSource) {
  const source = new EventSource('/events');

  source.addEventListener('open', () => {
    console.log("Events Connected");
  }, false);

  source.addEventListener('error', (e) => {
    if (e.target.readyState !== EventSource.OPEN) {
      console.log("Events Disconnected");
    }
  }, false);

  source.addEventListener('gyro_readings', (e) => {
    const obj = JSON.parse(e.data);
    document.getElementById("gyroX").innerHTML = obj.gyroX;
    document.getElementById("gyroY").innerHTML = obj.gyroY;
    document.getElementById("gyroZ").innerHTML = obj.gyroZ;

    // Update golf club rotation
    golfClub.rotation.x = obj.gyroY;
    golfClub.rotation.z = obj.gyroX;
    golfClub.rotation.y = obj.gyroZ;
  }, false);
}

function resetPosition() {
  // Reset the rotation of the golf club
  if (golfClub) {
    golfClub.rotation.set(0, 0, 0);
    renderer.render(scene, camera); // Ensure the scene is re-rendered
  }

  // Optional: Send a request to the server for additional reset logic
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "/reset", true); // Assuming "/reset" is the endpoint for server reset
  xhr.send();
}

// Initialize the 3D scene
init3D();
