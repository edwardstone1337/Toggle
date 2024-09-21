import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

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
const labelOnInput = document.getElementById("labelOn");
const labelOffInput = document.getElementById("labelOff");
const stateLabel = document.getElementById("stateLabel");

// On page load, check if there's a saved pair code in localStorage
window.addEventListener("DOMContentLoaded", () => {
    const savedPairCode = localStorage.getItem('pairCode');
    if (savedPairCode) {
        pairCodeInput.value = savedPairCode;
        joinPair(savedPairCode);
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
        localStorage.setItem('pairCode', pairCode);
        joinPair(pairCode);
    }
});

// Function to join a pair and sync toggle state
function joinPair(pairCode) {
    const pairRef = ref(database, `pairs/${pairCode}`);
    toggleContainer.style.display = 'block';

    // Sync the toggle state and labels from Firebase
    onValue(pairRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            userToggle.checked = data.state === 'on';
            labelOnInput.value = data.labelOn || 'On';
            labelOffInput.value = data.labelOff || 'Off';
            updateLabel(data.state);
        }
    });

    // Update Firebase when the local toggle or labels change
    userToggle.addEventListener("change", () => {
        const newState = userToggle.checked ? 'on' : 'off';
        set(pairRef, {
            state: newState, // Shared state for both users
            labelOn: labelOnInput.value,
            labelOff: labelOffInput.value
        });
    });

    labelOnInput.addEventListener("input", () => {
        const newState = userToggle.checked ? 'on' : 'off';
        set(pairRef, {
            state: newState,
            labelOn: labelOnInput.value,
            labelOff: labelOffInput.value
        });
    });

    labelOffInput.addEventListener("input", () => {
        const newState = userToggle.checked ? 'on' : 'off';
        set(pairRef, {
            state: newState,
            labelOn: labelOnInput.value,
            labelOff: labelOffInput.value
        });
    });
}

// Update the visible label based on the current state
function updateLabel(state) {
    if (state === 'on') {
        stateLabel.textContent = labelOnInput.value;
    } else {
        stateLabel.textContent = labelOffInput.value;
    }
}
