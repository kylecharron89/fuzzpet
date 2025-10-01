"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../");
// --- Main App Logic ---
(0, __1.createR1App)(async (sdk) => {
    // 1. State Management
    let state = {
        name: 'Fuzz',
        hunger: 50,
        happiness: 50,
        cleanliness: 80,
        isSleeping: false,
        punkAttitude: 75,
        isMusicOn: true,
        lastUpdate: Date.now(),
        age: 0,
    };
    const appContainer = document.getElementById('app');
    // 2. View / Renderer
    function render(state) {
        if (!appContainer) {
            console.error("The '#app' container is missing from the DOM.");
            return;
        }
        const { hunger, happiness, cleanliness, isSleeping, isMusicOn, punkAttitude, age } = state;
        const isHappy = happiness > 50 && cleanliness > 50 && hunger > 30;
        const face = isSleeping ? '( - . - )' : isHappy ? '( ^ . ^ )' : '( > . < )';
        // Easter Egg 1: High punk attitude gives Fuzz sunglasses
        const punkFace = punkAttitude > 90 ? '(⌐■_■)' : face;
        appContainer.innerHTML = `
      <div class="fuzz-container" style="width: ${__1.R1_DIMENSIONS.width}px; height: ${__1.R1_DIMENSIONS.height}px;">
        <div class="fuzz-face">${punkFace}</div>
        <div class="stats">
          <div>HNG: ${Math.round(hunger)}</div>
          <div>HAP: ${Math.round(happiness)}</div>
          <div>CLN: ${Math.round(cleanliness)}</div>
        </div>
        <div class="menu">
          <div id="feed">Feed</div>
          <div id="play">Play</div>
          <div id="clean">Clean</div>
          <div id="music">${isMusicOn ? 'Music: ON' : 'Music: OFF'}</div>
        </div>
        <div class="age">Age: ${age.toFixed(2)}</div>
      </div>
    `;
        updateMenuSelection();
    }
    // 3. Actions
    const actions = {
        feed: () => {
            state.hunger = Math.min(100, state.hunger + 15);
            state.happiness = Math.min(100, state.happiness + 5);
            if (state.hunger > 90) {
                console.log("Fuzz: 'Burp! 'scuse me.'");
            }
            render(state);
        },
        play: () => {
            state.happiness = Math.min(100, state.happiness + 20);
            state.hunger = Math.max(0, state.hunger - 5);
            render(state);
        },
        clean: () => {
            state.cleanliness = Math.min(100, state.cleanliness + 30);
            render(state);
        },
        toggleMusic: () => {
            state.isMusicOn = !state.isMusicOn;
            console.log(`Fuzz: 'Music is now ${state.isMusicOn ? 'ON' : 'OFF'}. Crank it up!'`);
            render(state);
        },
        updateStats: () => {
            const now = Date.now();
            const elapsedSeconds = (now - state.lastUpdate) / 1000;
            if (!state.isSleeping) {
                state.hunger = Math.max(0, state.hunger - elapsedSeconds * 0.5);
                state.happiness = Math.max(0, state.happiness - elapsedSeconds * 0.3);
                state.cleanliness = Math.max(0, state.cleanliness - elapsedSeconds * 0.2);
            }
            state.age += elapsedSeconds / 3600; // Age in hours
            state.lastUpdate = now;
            render(state);
        },
        saveState: () => {
            sdk.storage.plain.setItem('fuzzState', JSON.stringify(state));
        },
        loadState: async () => {
            const savedState = await sdk.storage.plain.getItem('fuzzState');
            if (savedState) {
                state = { ...JSON.parse(savedState), lastUpdate: Date.now() };
            }
        }
    };
    // 4. Hardware Integration
    let selectedMenuItem = 0;
    const menuItems = ['feed', 'play', 'clean', 'toggleMusic'];
    function updateMenuSelection() {
        menuItems.forEach((id, index) => {
            const elementId = id === 'toggleMusic' ? 'music' : id;
            const el = document.getElementById(elementId);
            if (el) {
                el.style.backgroundColor = index === selectedMenuItem ? '#FF7A00' : 'transparent';
                el.style.color = index === selectedMenuItem ? '#000' : '#fff';
            }
        });
    }
    sdk.hardware.on('scrollDown', () => {
        selectedMenuItem = (selectedMenuItem + 1) % menuItems.length;
        updateMenuSelection();
    });
    sdk.hardware.on('scrollUp', () => {
        selectedMenuItem = (selectedMenuItem - 1 + menuItems.length) % menuItems.length;
        updateMenuSelection();
    });
    sdk.hardware.on('sideClick', () => {
        const actionName = menuItems[selectedMenuItem];
        const action = actions[actionName];
        if (action) {
            action();
        }
    });
    if (await sdk.accelerometer.isAvailable()) {
        sdk.accelerometer.start(({ x, y, z }) => {
            const magnitude = Math.sqrt(x * x + y * y + z * z);
            if (magnitude > 20) { // Increased threshold for shaking
                state.happiness = Math.max(0, state.happiness - 2);
                state.punkAttitude = Math.min(100, state.punkAttitude + 2);
                console.log("Fuzz: 'Woah, dude! Is this a mosh pit?'");
                render(state);
            }
        });
    }
    // Easter Egg 2: Magic Eye
    if (await sdk.camera.isAvailable()) {
        console.log("Easter Egg: Fuzz might react if you cover the magic eye...");
        // This is a mock. Real implementation would require camera brightness feedback.
        // For now, let's create a joke command.
        window.magicEye = () => {
            console.log("Fuzz: 'Hey! Who turned out the lights? I'm not afraid of the dark, you know.'");
            state.punkAttitude = Math.min(100, state.punkAttitude + 5);
            render(state);
        };
    }
    // 5. Game Loop
    setInterval(() => {
        actions.updateStats();
        actions.saveState();
    }, 5000);
    // 6. Initialization
    await actions.loadState();
    render(state); // Initial render
});
//# sourceMappingURL=index.js.map