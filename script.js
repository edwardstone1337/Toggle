// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDmOUcBPzDOyLWFqg9Mr7ZuOJb84yNE-nI",
    authDomain: "toggle-a7f26.firebaseapp.com",
    databaseURL: "https://toggle-a7f26-default-rtdb.firebaseio.com",
    projectId: "toggle-a7f26",
    storageBucket: "toggle-a7f26.appspot.com",
    messagingSenderId: "865398263264",
    appId: "1:865398263264:web:cc77ff9aa7b37bb59a6f85",
    measurementId: "G-22CKZ3X4F4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// DOM Elements
const pairCodeInput = document.getElementById("pairCode");
const toggleContainer = document.getElementById("toggleContainer");
const userToggle = document.getElementById("userToggle");

// On page load, check if there's a saved pair code in localStorage
window.addEventListener("DOMContentLoaded", () => {
    const savedPairCode = localStorage.getItem('pairCode');
    if (savedPairCode) {
        pairCodeInput.value = savedPairCode; // Display the saved pair code
        joinPair(savedPairCode); // Automatically join the saved pair
    }
});

// Generate a random pairing code
document.getElementById("generateCode").addEventListener("click", () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    pairCodeInput.value = code;
});

// Join a pair
document.getElementById("joinPair").addEventListener("click", () => {
    const pairCode = pairCodeInput.value;
    if (pairCode) {
        localStorage.setItem('pairCode', pairCode); // Save the pair code in localStorage
        joinPair(pairCode);
    }
});

// Function to join a pair and sync toggle state
function joinPair(pairCode) {
    const pairRef = ref(database, `pairs/${pairCode}`);
    toggleContainer.style.display = 'block';

    // Sync the toggle state from Firebase
    onValue(pairRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            userToggle.checked = data.state === 'on';
        }
    });

    // Update Firebase when the local toggle changes
    userToggle.addEventListener("change", () => {
        const newState = userToggle.checked ? 'on' : 'off';
        set(pairRef, { state: newState });
    });
}
