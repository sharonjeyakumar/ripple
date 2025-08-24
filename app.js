// Assets Importing
const fxchoiceSound = 'sfx/choicesound.mp3';
const choiceSound = new Audio(fxchoiceSound);

const fxchoiceConfirm = 'sfx/choiceconfirm.mp3';
const choiceConfirm = new Audio(fxchoiceConfirm);

const fxClickSound = `sfx/click-sound3.mp3`;
const clickSound = new Audio(fxClickSound);

const fxItemFound = `sfx/item-found.mp3`;
const itemFound = new Audio(fxItemFound);

//Game Screen
const gameScreen = document.getElementById('gamescreen');
const dialoguebox = document.getElementById('dialoguebox');
const gameWrapper = document.getElementById('gameWrapper');

function playSound(sound) {
    try {
        sound.pause();
        sound.currentTime = 0;
        sound.play();
    } catch (err) {
        console.warn('Sound play failed:', err);
    }
}

// Global click handler
function globalClickHandler(e) {
    createClickAnimation(e);
    if (!e.target.closest('#gameWrapper')) return;
    // Don't advance dialogue if clicked anywhere inside a choice button
    if (e.target.closest('.choiceBtn')) return;
    addDialogue();

    if (showChoices) {
        dialoguebox.scrollTo({ top: dialoguebox.scrollHeight, behavior: 'smooth' });
    }
}

// Init game only once
function initGame() {
    // Ensure listener is not duplicated
    if (!gameWrapper) {
        console.error('❌ gameScreen element not found');
        return;
    }
    document.body.removeEventListener('click', globalClickHandler);
    document.body.addEventListener('click', globalClickHandler);
}

// Call initGame once on startup
initGame();

function createClickAnimation(e) {
    const effect = document.createElement('div');
    effect.classList.add('click-effect');
    effect.style.left = e.pageX + 'px';
    effect.style.top = e.pageY + 'px';

    const dot = document.createElement('div');
    dot.classList.add('dot');
    effect.appendChild(dot);

    const ring = document.createElement('div');
    ring.classList.add('ring');
    effect.appendChild(ring);

    document.body.appendChild(effect);

    ring.addEventListener('animationend', () => effect.remove());
    dot.addEventListener('animationend', () => dot.remove());
}

//Game Scene

let currentScene = 'intro';
let currentDialogue = 0;
let dialogue = [];
let choicesShown = false;
let suppressClickSound = false;

let actions = [];
let visitedScenes = new Set();

function renderScene() {
    const scene = scenes[currentScene];
    currentDialogue = 0;
    dialogue = scene.text;
    choicesShown = false;
}

function addDialogue() {
    if (currentDialogue <= dialogue.length - 1) {
        if (!suppressClickSound) {
            playSound(clickSound); // normal dialogue click
        } else {
            suppressClickSound = false; // consume it for choice confirm
        }
        const line = dialogue[currentDialogue];
        const dialogueContainer = document.createElement('div');
        dialogueContainer.classList.add('dialogueContainer');

        const element = document.createElement('h2');
        element.textContent = line.text;
        dialogueContainer.appendChild(element);
        element.classList.add('dialogue');

        dialoguebox.appendChild(dialogueContainer);

        if (line.color) {
            element.style.color = line.color;
        }

        // Handle any actions/outcomes attached to this line
        if (line.outcome) {
            line.outcome.forEach((item) => {
                if (item.text) {
                    // Optionally, display additional info text
                    const infoEl = document.createElement('div');
                    infoEl.classList.add('infoText');
                    const element = document.createElement('h2');
                    element.textContent = item.text;
                    infoEl.appendChild(element);
                    dialoguebox.appendChild(infoEl);
                    setTimeout(() => {
                        playSound(itemFound);
                        infoEl.classList.add('show');
                        infoEl.scrollIntoView({ behavior: 'smooth', block: 'end' });
                    }, 300);
                }
                if (item.action) {
                    // Add the action to global actions array
                    // actions.push(item.action);
                    actions.push(...item.action);
                    console.log(actions);
                }
            });
        }

        setTimeout(() => {
            element.classList.add('show');
            dialogueContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 50);

        currentDialogue++;
    } else if (!choicesShown) {
        choicesShown = true;
        const scene = scenes[currentScene];

        if (scene.continue && !scene.end) {
            currentScene = scene.continue[0].next;
            renderScene();
            addDialogue();
        } else if (scene.choices) {
            showChoices(scenes[currentScene].choices);
            playSound(choiceSound);
        } else if (scene.timedchoices) {
            showTimedChoices(scene.timedchoices, 6000);
            playSound(choiceSound);
        } else if (scene.end) {
            dialogue = scene.end;
            currentDialogue = 0;
            choicesShown = true; // prevent showing choices
            addDialogue();
        }
    }
}

function showTimedChoices(choices, timeLimit = 6000) {
    const choicesContainer = document.createElement('div');
    choicesContainer.classList.add('choicesContainer');

    let picked = false;
    let timeoutId;

    choices.forEach((choice, index) => {
        const btn = document.createElement('button');
        btn.classList.add('choiceBtn');

        // Check lock condition
        let isLocked = false;
        let hadRequires = false;

        let isCannotVisit = false;
        let showText = true;
        if (choice.requires) {
            hadRequires = true;
            if (Array.isArray(choice.requires)) {
                isLocked = !choice.requires.every((req) => actions.includes(req));
            } else {
                isLocked = !actions.includes(choice.requires);
            }
        }

        // Check visited array
        if (choice.visited) {
            if (Array.isArray(choice.visited)) {
                isCannotVisit = !choice.visited.every((v) => visitedScenes.has(v));
            } else {
                isCannotVisit = !visitedScenes.has(choice.visited);
            }
        }

        const indexSpan = document.createElement('span');
        indexSpan.textContent = `${index + 1}. `;
        indexSpan.style.color = 'white';

        btn.appendChild(indexSpan);

        setTimeout(() => btn.classList.add('show'));

        setTimeout(()=>{

            if (isLocked || isCannotVisit) {
                const lockSpan = document.createElement('span');
                lockSpan.textContent = ' [...]';
                lockSpan.style.color = 'gray';
                btn.appendChild(lockSpan);
                btn.disabled = true;
                showText = false;
            }
    
           
            if (!isLocked) {
                if (showText) {
                    const textSpan = document.createElement('span');
                    textSpan.textContent = choice.text;
                    textSpan.style.color = choiceBtnColor;
                    btn.appendChild(textSpan);
    
                    if (hadRequires) {
                        const unlockSpan = document.createElement('span');
                        unlockSpan.textContent = ' [Unlocked]';
                        // unlockSpan.style.color = choiceColor;
                        unlockSpan.style.color = 'white';
                        btn.appendChild(unlockSpan);
                    }
                    if (visitedScenes.has(choice.next)) {
                        const visitedSpan = document.createElement('span');
                        visitedSpan.textContent = ' [Visited]';
                        visitedSpan.style.color = 'gray';
                        btn.appendChild(visitedSpan);
                        btn.disabled = true;
                        btn.style.opacity = '0.5';
                    }
                }
            }
        },5)
        
         btn.onclick = () => {
            if (picked) return;
            picked = true;
            clearTimeout(timeoutId);

            timerBar.style.display = 'none';
            visitedScenes.add(choice.next);
            suppressClickSound = true;
            playSound(choiceConfirm);

            lockChoices(btn);
            currentScene = choice.next;
            renderScene();
            addDialogue();
        };


        choicesContainer.appendChild(btn);
    });

    // ⏳ Timer bar
    const timerBar = document.createElement('div');
    timerBar.classList.add('timerBar');
    timerBar.style.opacity = '0';
    const timerFill = document.createElement('div');
    timerFill.classList.add('timerFill');
    timerBar.appendChild(timerFill);
    dialoguebox.appendChild(choicesContainer);
    dialoguebox.appendChild(timerBar);

    setTimeout(() => {
        timerBar.scrollIntoView({ behavior: 'smooth', block: 'end' });
        timerBar.style.opacity = '1';
    }, 55);

    // Animate bar
    setTimeout(() => {
        timerFill.style.transitionDuration = timeLimit + 'ms';
        timerFill.style.width = '0%';
    });

    // Auto-pick first choice after timer
    timeoutId = setTimeout(() => {
        if (!picked) {
            const btns = choicesContainer.querySelectorAll('.choiceBtn');
            const lastBtn = btns[btns.length - 1];
            if (lastBtn) {
                // Instead of lastBtn.click(), call the handler directly
                lastBtn.onclick({
                    // fake event object but won't be used in animation
                    target: lastBtn,
                    // preventDefault: () => {},
                    // stopPropagation: () => {}
                });
            }
        }

        timerBar.style.display = 'none';
    }, timeLimit);
}

function lockChoices(selectedBtn) {
    const container = selectedBtn.parentElement;
    container.querySelectorAll('.choiceBtn').forEach((b) => {
        if (b !== selectedBtn) {
            b.style.opacity = '0.5';
            b.disabled = true;
            b.style.pointerEvents = 'none';
        } else {
            b.style.opacity = '1';
            b.setAttribute('aria-disabled', 'true');
            b.style.pointerEvents = 'none';
            b.onclick = null;
        }
    });
}

function showChoices(choices) {
    const choicesContainer = document.createElement('div');
    choicesContainer.classList.add('choicesContainer');
    let picked = false;

    choices.forEach((choice, index) => {
        const btn = document.createElement('button');
        btn.classList.add('choiceBtn');
        //locked choices
        let isLocked = false;
        let hadRequires = false;

        let isCannotVisit = false;
        let showText = true;
        if (choice.requires) {
            hadRequires = true;
            if (Array.isArray(choice.requires)) {
                isLocked = !choice.requires.every((req) => actions.includes(req));
            } else {
                isLocked = !actions.includes(choice.requires);
            }
        }

        // Check visited array
        if (choice.visited) {
            if (Array.isArray(choice.visited)) {
                isCannotVisit = !choice.visited.every((v) => visitedScenes.has(v));
            } else {
                isCannotVisit = !visitedScenes.has(choice.visited);
            }
        }

        const indexSpan = document.createElement('span');
        indexSpan.textContent = `${index + 1}. `;
        indexSpan.style.color = 'white';

        const textSpan = document.createElement('span');
        textSpan.textContent = choice.text;
        textSpan.style.color = choiceBtnColor;

        btn.appendChild(indexSpan);

        setTimeout(() => {
            btn.classList.add('show');
            choicesContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 0);

        setTimeout(() => {
            if (isLocked || isCannotVisit) {
                const lockSpan = document.createElement('span');
                lockSpan.textContent = ' [...]';
                lockSpan.style.color = 'gray';
                btn.appendChild(lockSpan);
                btn.disabled = true;
                showText = false;
            }
            
            if (showText) {
                const textSpan = document.createElement('span');
                textSpan.textContent = choice.text;
                textSpan.style.color = choiceBtnColor;
                btn.appendChild(textSpan);
                
                if (hadRequires) {
                    const unlockSpan = document.createElement('span');
                    unlockSpan.textContent = ' [Unlocked]';
                    unlockSpan.style.color = 'gray';
                    btn.appendChild(unlockSpan);
                }
                
                if (visitedScenes.has(choice.next)) {
                    const visitedSpan = document.createElement('span');
                    visitedSpan.textContent = ' [Visited]';
                    visitedSpan.style.color = 'gray';
                    btn.appendChild(visitedSpan);
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                }
            }
            
        }, 5);
        if (!isLocked) {
            btn.onclick = () => {
                lockChoices(btn);
                suppressClickSound = true;
                playSound(choiceConfirm);

                visitedScenes.add(choice.next);
                console.log(visitedScenes);
                btn.style.pointerEvents = 'none';
                currentScene = choice.next;
                renderScene();
                addDialogue();
            };
        }

        choicesContainer.appendChild(btn);
    });
    dialoguebox.appendChild(choicesContainer);
}
actions.push('soul');
const chapterColor = '#ca4646ff';
const choiceColor = '#caa046ff';
const choiceBtnColor = '#e7e7e7ff';
const gotNewItem = '#596b4f';

const scenes = {
    intro: {
        text: [
            {text: `There is a desk in front of you.`},
            {text: `It is not wise to check what is inside.`},
        ],
        choices: [
            { text: "Open Desk", next: "desk_opened"},
            { text: "Don't Waste Time", next: "desk_unopened"},
        ]
    },
    desk_opened: {
        text: [
            {text: `You changed your mind, Maybe it is wise to open the desk.`, color:`${choiceColor}`},
            {text: `You opened the Desk`, 
            outcome: [
                {text : `ⓘ You found a gun`},
                {action: [`desk_opened_gun_found`,`letter`]}
            ]},
            {text: `A Revolver`},
            {text: `There is just a single bullet inside.`},
            {text: `"Hope i don't have to use it."`}
          ],
        choices: [

        ],
        continue: [
            {next: 'confrontation'}
        ]
    },
    desk_unopened: {
        text: [
            {text: `"I don't have time to waste checking a desk at this time."`, color:`${choiceColor}`,
            outcome: [
                {action: `desk_remains_closed`}
            ]},
        
        ],
        choices: [

        ],
        continue: [
            {next: 'confrontation'}
        ]
    },
    confrontation: {
        text: [
            {text: `You go to the balcony.`},
            {text: `You see a guy holding a child at gun point`},
            {text: `"Don't come any near or i will shoot."`},
            {text: `"You know i have nothing to lose."`},
        ],
        timedchoices: [
            { text: "Shoot Gun", next: "shoot_gun", requires: 'desk_opened_gun_found'},
            { text: "Inimidate With Gun", next: "shoot_gun", requires: ['desk_opened_gun_found','shooting_skills']},
            { text: "Assure", next: "reason_with_enemy" },
            { text: "Request", next: "request_with_enemy" },
        ]
    },
    reason_with_enemy: {
        text: [
            {text: `"You don't have to do this."`, color:`${choiceColor}`},
            {text: `"I will make sure you get that money. Leave that girl alone."`},
            {text: `"She is what keeping me alive, I can see through those lying eyes."`},
            {text: `You try to go near the enemy`},
        ],
        end: [
            {text: `He shoots at you. The bullet hits your right temple.`},
            {text: 'Game Over: Instant Death'}
        ]
    },
    request_with_enemy: {
        text: [
            {text: `Please don't do this.`, color:`${choiceColor}`},
            {text: `"She is just a child, Leave her out of this."`},
            {text: `"Don't come any near or i will shoot."`},
            {text: `You try to go near the enemy`},
        ],
        end: [
            {text: `He shoots at you. The bullet hits at your heart.`},
            {text: 'Game Over: You collapse on the ground bleeding to death.'}
        ]
    },
    shoot_gun: {
        text: [
            {text: `In a Second you aim at his hand and shoot.`, color:`${choiceColor}`},
            {text: `The bullet hits his hand causing his grip on the gun to lose`},
            {text: `"Now you got nothing to lose and no way to win."`},
        ],
        end: [
            {text:'He surrenders and let go of the girl.'},
            {text:'Game Won'}
        ]
    },
}

renderScene();
addDialogue();