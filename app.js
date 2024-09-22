// app.js

// Firebase Initialization
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

let currentUser = null;
let currentToggleRef = null;
let toggleData = null;
let isRenaming = false; // Add this line

// DOM Elements
const homeScreen = document.getElementById('home-screen');
const createToggleBtn = document.getElementById('create-toggle-btn');
const joinToggleBtn = document.getElementById('join-toggle-btn');
const createToggleModal = document.getElementById('create-toggle-modal');
const joinToggleModal = document.getElementById('join-toggle-modal');
const createToggleClose = document.getElementById('create-toggle-close');
const joinToggleClose = document.getElementById('join-toggle-close');
const toggleLabelInput = document.getElementById('toggle-label');
const saveToggleBtn = document.getElementById('save-toggle-btn');
const toggleScreen = document.getElementById('toggle-screen');
const toggleLabelDisplay = document.getElementById('toggle-label-display');
const togglePinDisplay = document.getElementById('toggle-pin-display');
const sharedToggle = document.getElementById('shared-toggle');
const renameToggleBtn = document.getElementById('rename-toggle-btn');
const toggleNotificationsBtn = document.getElementById('toggle-notifications-btn');
const leaveToggleBtn = document.getElementById('leave-toggle-btn');
const togglePinInput = document.getElementById('toggle-pin');
const joinToggleBtnModal = document.getElementById('join-toggle-btn-modal');

// Event Listeners

// Create Toggle Button
createToggleBtn.addEventListener('click', () => {
  isRenaming = false; // Ensure we're in create mode
  toggleLabelInput.value = ''; // Clear the input field
  createToggleModal.style.display = 'block'; // Open the modal
});

// Join Toggle Button
joinToggleBtn.addEventListener('click', () => {
  joinToggleModal.style.display = 'block';
});

// Close Modals
createToggleClose.addEventListener('click', () => {
  isRenaming = false; // Reset renaming mode
  createToggleModal.style.display = 'none';
});

joinToggleClose.addEventListener('click', () => {
  joinToggleModal.style.display = 'none';
});

// Toggle Label Input
toggleLabelInput.addEventListener('input', () => {
  saveToggleBtn.disabled = !toggleLabelInput.value.trim();
});

// Save Button
saveToggleBtn.addEventListener('click', () => {
  if (isRenaming) {
    renameToggle();
  } else {
    createToggle();
  }
});

// Join Toggle Input
togglePinInput.addEventListener('input', () => {
  joinToggleBtnModal.disabled = !togglePinInput.value.trim();
});

// Join Toggle Button in Modal
joinToggleBtnModal.addEventListener('click', joinToggle);

// Rename Toggle Button
renameToggleBtn.addEventListener('click', () => {
  toggleLabelInput.value = toggleData.label; // Pre-fill with current label
  isRenaming = true; // Set renaming mode to true
  createToggleModal.style.display = 'block'; // Open the modal
});

// Leave Toggle Button
leaveToggleBtn.addEventListener('click', leaveToggle);

// Shared Toggle Switch
sharedToggle.addEventListener('change', updateToggleState);

// Functions

// Anonymous Authentication
auth.signInAnonymously().then((user) => {
  currentUser = user.user;

  // Check if user has a saved toggle
  const lastTogglePin = localStorage.getItem('lastTogglePin');
  if (lastTogglePin) {
    joinToggleByPin(lastTogglePin);
  }
});


// Create Toggle
function createToggle() {
  const label = toggleLabelInput.value.trim();
  const togglePin = generatePin();
  toggleData = {
    label,
    state: false,
    notifications: true,
    pin: togglePin,
  };

  currentToggleRef = database.ref('toggles/' + togglePin);
  currentToggleRef.set(toggleData);

  // Save to localStorage
  localStorage.setItem('lastTogglePin', togglePin);

  displayToggleScreen();

  createToggleModal.style.display = 'none';
}

// Rename Toggle
function renameToggle() {
  const newLabel = toggleLabelInput.value.trim();
  if (newLabel) {
    currentToggleRef.update({
      label: newLabel,
    });
    toggleLabelDisplay.textContent = newLabel; // Update the label on the screen
    isRenaming = false; // Reset the renaming mode
    createToggleModal.style.display = 'none'; // Close the modal
  }
}

// Join Toggle
function joinToggle() {
  const pin = togglePinInput.value.trim();
  joinToggleByPin(pin);
  joinToggleModal.style.display = 'none';
}

function joinToggleByPin(pin) {
  currentToggleRef = database.ref('toggles/' + pin);
  currentToggleRef.once('value').then((snapshot) => {
    if (snapshot.exists()) {
      toggleData = snapshot.val();
      // Save to localStorage
      localStorage.setItem('lastTogglePin', pin);
      displayToggleScreen();
    } else {
      alert('Toggle not found.');
    }
  });
}


// Display Toggle Screen
function displayToggleScreen() {
  homeScreen.style.display = 'none';
  toggleScreen.style.display = 'block';
  toggleLabelDisplay.textContent = toggleData.label;
  togglePinDisplay.textContent = toggleData.pin;
  sharedToggle.checked = toggleData.state;

  // Listen for toggle changes
  currentToggleRef.on('value', (snapshot) => {
    toggleData = snapshot.val();
    sharedToggle.checked = toggleData.state;
    toggleLabelDisplay.textContent = toggleData.label;
  });
}

// Update Toggle State
function updateToggleState() {
  currentToggleRef.update({
    state: sharedToggle.checked,
  });
}

// Leave Toggle
function leaveToggle() {
  currentToggleRef.off();
  localStorage.removeItem('lastTogglePin');
  toggleScreen.style.display = 'none';
  homeScreen.style.display = 'block';
}

// Generate Unique PIN
function generatePin() {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
}
