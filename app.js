// Assets Importing
const fxchoiceSound = "sfx/choicesound.mp3";
const choiceSound = new Audio(fxchoiceSound);

const fxchoiceConfirm = "sfx/choiceconfirm.mp3";
const choiceConfirm = new Audio(fxchoiceConfirm);

const fxClickSound = `sfx/click-sound3.mp3`;
const clickSound = new Audio(fxClickSound);

//Game Screen
const gameScreen = document.getElementById('gamescreen');

function playSound(sound) {
  try {
    sound.pause();         
    sound.currentTime = 0;
    sound.play();
  } catch (err) {
    console.warn("Sound play failed:", err);
  }
}

// Global click handler
function globalClickHandler(e) {
    
    createClickAnimation(e);
    if (!e.target.closest('#gamescreen')) return;
    // Don't advance dialogue if clicked anywhere inside a choice button
    if (e.target.closest('.choiceBtn')) return;
    addDialogue();

    if(showChoices){
        // gameScreen.scrollTo({ top: gameScreen.scrollHeight, behavior: 'smooth' });
    }
}

// Init game only once
function initGame() {
    // Ensure listener is not duplicated
    document.body.removeEventListener("click", globalClickHandler);
    document.body.addEventListener("click", globalClickHandler);

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
 
let currentScene = "intro";
let currentDialogue = 0;
let dialogue = [];
let choicesShown = false;
let suppressClickSound = false;

let actions = [];

function renderScene(){
    const scene = scenes[currentScene];
    currentDialogue = 0;
    dialogue = scene.text;
    choicesShown = false;

}

function addDialogue(){
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

        gameScreen.appendChild(dialogueContainer);

        if (line.color) {
            element.style.color = line.color;
        }

        // Handle any actions/outcomes attached to this line
        if (line.outcome) {
            line.outcome.forEach(item => {
                if (item.text) {
                    // Optionally, display additional info text
                    const infoEl = document.createElement('div');
                    infoEl.classList.add('infoText');
                    const element = document.createElement('h2');
                    element.textContent = item.text;
                    infoEl.appendChild(element)
                    gameScreen.appendChild(infoEl);
                    setTimeout(() => {
                        infoEl.classList.add('show');
                        infoEl.scrollIntoView({ behavior: 'smooth', block: 'end' });
                    }, 300);
                }
                if (item.action) {
                    // Add the action to global actions array
                    actions.push(item.action);
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
        choicesShown= true;
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

        } else if (scene.end){
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

        const match = choice.text.match(/^(\d+\.)\s*(.*)$/);
        if (match) {
            const indexSpan = document.createElement('span');
            indexSpan.textContent = match[1];
            indexSpan.style.color = "white";

            const textSpan = document.createElement('span');
            textSpan.textContent = " " + match[2];
            textSpan.style.color = choiceBtnColor;

            btn.appendChild(indexSpan);
            btn.appendChild(textSpan);
        } else {
            btn.textContent = choice.text;
        }

        setTimeout(() => btn.classList.add('show'));

        btn.onclick = () => {
            
            if (picked) return;
            picked = true;
            clearTimeout(timeoutId);

            timerBar.style.display = "none";

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
    const timerFill = document.createElement('div');
    timerFill.classList.add('timerFill');
    timerBar.appendChild(timerFill);
    gameScreen.appendChild(choicesContainer);
    gameScreen.appendChild(timerBar);

    setTimeout(() => {
            timerBar.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 50);

    // Animate bar
    setTimeout(() => {
        timerFill.style.transitionDuration = timeLimit + "ms";
        timerFill.style.width = "0%";
    });

    // Auto-pick first choice after timer
    timeoutId = setTimeout(() => {
        if (!picked) {
        const firstBtn = choicesContainer.querySelector('.choiceBtn');
        if (firstBtn) {
            // Instead of firstBtn.click(), call the handler directly
            firstBtn.onclick({ 
                // fake event object but won't be used in animation
                target: firstBtn,
                preventDefault: () => {},
                stopPropagation: () => {}
            });
        }
    }

     timerBar.style.display = "none";
    }, timeLimit);
}

function lockChoices(selectedBtn) {
    const container = selectedBtn.parentElement;
    container.querySelectorAll('.choiceBtn').forEach(b => {
        if (b !== selectedBtn) {
            b.style.opacity = '0.5';
            b.disabled = true;
        } else {
            b.style.opacity = '1';
            b.disabled = true;
        }
    });
}


function showChoices(choices) {
    const choicesContainer = document.createElement('div');
    choicesContainer.classList.add('choicesContainer');

    choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.classList.add('choiceBtn');

        //locked choices
        let isLocked = false;
        if (choice.requires) {
            if (Array.isArray(choice.requires)) {
                isLocked = !choice.requires.every(req => actions.includes(req));
            } else {
            isLocked = !actions.includes(choice.requires);
            }   
        }
        
        // Split into index and text (expects "1. Choice text")
        const match = choice.text.match(/^(\d+\.)\s*(.*)$/);

        if (match) {
            const indexSpan = document.createElement('span');
            indexSpan.textContent = match[1]; 
            indexSpan.style.color = "white"; 

            const textSpan = document.createElement('span');
            textSpan.textContent = " " + match[2];
            textSpan.style.color = choiceBtnColor;   

            btn.appendChild(indexSpan);
            if(!isLocked){
                btn.appendChild(textSpan);
            }
            setTimeout(() => {
                btn.classList.add('show');
                choicesContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
            },0);
            setTimeout(() => {
               if (isLocked){
                const lockSpan = document.createElement('span');
                lockSpan.textContent = " [...]";
                lockSpan.style.color = "gray";
                btn.appendChild(lockSpan);
                btn.disabled = true;
            }
            },5);
            
        } else {
            btn.textContent = choice.text + (isLocked ? " [...]" : "");
        }



        if (!isLocked) {
            btn.onclick = () => {
            suppressClickSound = true;
            playSound(choiceConfirm);

            btn.style.pointerEvents = "none";
            const container = btn.parentElement;
            container.querySelectorAll('.choiceBtn').forEach(b => {
            if (b !== btn) {
                b.style.opacity = '0.5';
                b.disabled = true;
            } else {
                b.style.opacity = '1';
            }
        });

        currentScene = choice.next;
        renderScene();
        addDialogue();
    };
}

        choicesContainer.appendChild(btn);
    });
    gameScreen.appendChild(choicesContainer);
}

const chapterColor = '#ca4646ff';
const choiceColor = '#caa046ff';
const choiceBtnColor = '#e7e7e7ff'

const scenes = {
    intro: {
        text: [
            {text: `There is a desk in front of you.`},
            {text: `It is wise to check what is inside that.`},
            
        ],
        timedchoices: [
            { text: "1. Open Desk", next: "desk_opened" },
            { text: "2. Don't Waste Time", next: "desk_unopened" },
            
        ]
    },
    desk_opened: {
        text: [
            {text: `You opened the Desk`, color:`${choiceColor}`, 
            outcome: [
                {text : `ⓘ You found a gun`},
                {action: `desk_opened_gun_found`}
            ]},
            {text: `A Revolver`},
            {text: `There is just a single bullet inside.`},
            {text: `Hope i don't have to use it.`}
          ],
        choices: [

        ],
        continue: [
            {next: 'confrontation'}
        ]
    },
    desk_unopened: {
        text: [
            {text: `You changed your mind, Maybe its not wise to open the desk,`, color:`${choiceColor}`,
            outcome: [
                {action: `desk_remains_closed`}
            ]},
            {text: `I don't have time to waste checking a desk at this time`},
        ],
        choices: [

        ],
        continue: [
            {next: 'confrontation'}
        ]
    },
    confrontation: {
        text: [
            {text: `You see a guy holding a child at gun point`},
            {text: `Don't come any near or i will shoot`},
            {text: `You know i don't have nothing to lose`},
        ],
        choices: [
            { text: "1. Assure", next: "reason_with_enemy" },
            { text: "2. Request", next: "request_with_enemy" },
            { text: "3. Shoot Gun", next: "shoot_gun", requires: 'desk_opened_gun_found'},
            { text: "4. Inimidate With Gun", next: "shoot_gun", requires: ['desk_opened_gun_found','shooting_skills']}
        ]
    },
    reason_with_enemy: {
        text: [
            {text: `You don't have to do this.`, color:`${choiceColor}`},
            {text: `I will make sure you get that money. Leave that girl alone.`},
            {text: `She is what keeping me alive, I can see through those lying eyes.`},
            {text: `You try to go near the enemy`},
        ],
        end: [
            {text: `He shoots at you. The bullet hits your right temple.`},
            {text: 'Game Over: Instant Death'}
        ]
    },
    request_with_enemy: {
        text: [
            {text: `You see a guy holding a child at gun point`, color:`${choiceColor}`},
            {text: `Don't come any near or i will shoot`},
            {text: `You know i don't have nothing to lose`},
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
            {text: `Now you got nothing to lose and no way to win.`},
        ],
        end: [
            {text:'He surrenders and let go of the girl.'},
            {text: 'Game Won'}
        ]
    },
}

renderScene();
addDialogue();