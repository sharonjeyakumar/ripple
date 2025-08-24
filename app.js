// Character System
class Character{
    constructor(name,maxHealth,currentHealth){
        this.name = name;
        this.maxHealth = maxHealth;
        this.currentHealth = currentHealth;
    }

    takeDamage(amount) {
        this.currentHealth -=amount;
        if(this.currentHealth < 0){
            this.currentHealth = 0;
        }
        updateHealth();
    }
}

class Enemy{
    constructor(name,maxHealth,currentHealth){
        this.name = name;
        this.maxHealth = maxHealth;
        this.currentHealth = currentHealth;
    }

    takeDamage(amount) {
        this.currentHealth -=amount;
        if(this.currentHealth < 0){
            this.currentHealth = 0;
        }
        updateEHealth();
    }
}



const Sharon = new Character('Sharon',5,5);
const Varshan = new Character('Varshan',2,2);

const Pranav = new Enemy('Pranav', 3,3);

//Health System
let currentCharacter = null;
let currentEnemy = null;
// console.log(currentCharacter);




const healthContainer = document.querySelector('.health_container');
const healthBar = document.querySelector('.health_bar');
const healthText = document.querySelector('.health_text');
const characterName = document.querySelector('.characterName');

const ehealthContainer = document.querySelector('.ehealth_container');
const ehealthBar = document.querySelector('.ehealth_bar');
const ehealthText = document.querySelector('.ehealth_text');
const echaracterName = document.querySelector('.echaracterName');


function updateHealthBar(){
    for (let i = 0; i < currentCharacter.maxHealth; i++) {
        const healthBar = document.createElement('div');
        healthBar.classList.add('health_bar');
        healthContainer.appendChild(healthBar);
    }
}
function updateEHealthBar(){
    for (let i = 0; i < currentEnemy.maxHealth; i++) {
        const ehealthBar = document.createElement('div');
        ehealthBar.classList.add('ehealth_bar');
        ehealthContainer.appendChild(ehealthBar);
    }
}

function updateHealth() {
    const bars = document.querySelectorAll('.health_bar');
    bars.forEach((bar, index) => {
        if (index < currentCharacter.currentHealth) {
            bar.style.backgroundColor = "#e96408"; // filled
        } else {
            bar.style.backgroundColor = "#353535ff"; // empty
        }
    });

    if (healthText) {
        healthText.textContent = `${currentCharacter.currentHealth}/${currentCharacter.maxHealth}`;
    }
}
function updateEHealth() {
    const bars = document.querySelectorAll('.ehealth_bar');
    bars.forEach((bar, index) => {
        if (index < currentEnemy.currentHealth) {
            bar.style.backgroundColor = "#0d758f"; // filled
        } else {
            bar.style.backgroundColor = "#353535ff"; // empty
        }
    });

    if (ehealthText) {
        ehealthText.textContent = `${currentEnemy.currentHealth}/${currentEnemy.maxHealth}`;
    }
}

function updateCharacterSwitch(char){
    characterName.textContent = char.name+':';
    healthContainer.innerHTML ="";
    updateHealthBar();
    updateHealth();
}

function updateECharacterSwitch(echar){
    echaracterName.textContent = echar.name+':';
    ehealthContainer.innerHTML ="";
    updateEHealthBar();
    updateEHealth();
}









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

let highlightNextLine = false;

function renderScene() {
    const scene = scenes[currentScene];
    currentDialogue = 0;
    dialogue = scene.text;
    choicesShown = false;
}

function outcome(input){
    const infoEl = document.createElement('div');
    infoEl.classList.add('infoText');
    const element = document.createElement('h2');
    element.textContent = input;
    infoEl.appendChild(element);
    dialoguebox.appendChild(infoEl);
    return infoEl;
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
        } else if (highlightNextLine && currentDialogue === 0) {
            element.style.color = choiceColor;
            highlightNextLine = false;
        }

        // Handle any actions/outcomes attached to this line
        if (line.outcome) {
            line.outcome.forEach((item) => {
                if (item.text) {
                    // Optionally, display additional info text
                    const infoEl = outcome(item.text);
                    setTimeout(() => {
                        playSound(itemFound);
                        infoEl.style.color = gotNewItemColor;
                        infoEl.classList.add('show');
                        infoEl.scrollIntoView({ behavior: 'smooth', block: 'end' });
                    }, 300);
                }
                if (item.action) {
                    actions.push(...item.action);
                    console.log(actions);
                }
                
            });
        }

        if(line.damage) {
            const infoEl = outcome(`ⓘ Damaged Health -${line.damage}`);
            setTimeout(() => {
                playSound(itemFound);
                infoEl.style.color = redColor;
                infoEl.classList.add('show');
                currentCharacter.takeDamage(line.damage);
                infoEl.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }, 300);   
        }
        if(line.attack) {
            const infoEl = outcome(`ⓘ Damaged Enemy's Health -${line.attack}`);
            setTimeout(() => {
                playSound(itemFound);
                infoEl.style.color = enemydamageColor;
                infoEl.classList.add('show');
                currentEnemy.takeDamage(line.attack);
                infoEl.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }, 300);   
        }

        if(line.characterSwitch){
            currentCharacter = line.characterSwitch;
            updateCharacterSwitch(line.characterSwitch);
        }
        if(line.enemySwitch){
            currentEnemy = line.enemySwitch;
            updateECharacterSwitch(line.enemySwitch);
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

            highlightNextLine = true;

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
                highlightNextLine = true;
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

const redColor = '#b72100';
const choiceColor = '#caa046ff';
const choiceBtnColor = '#e7e7e7ff';
const gotNewItemColor = '#596b4f';
const enemydamageColor = '#005fb7ff';

const scenes = {
    intro: {
        text: [
            {text: `You open your eyes and to your horror.`},
            {text: `Pranav, Son of Kratos Stands before you.`, enemySwitch:Pranav},
            {text: `Sharon: "My name is sharon and i will handle this."`, characterSwitch:Sharon},
            {text: `Gets punched in the face`, damage:1},
            {text: `Varshan: "My name is Varshan and i will handle this."`,characterSwitch:Varshan},
            {text: `Gets Kicked in the face`, damage:1},
            {text: `Sharon: "Guess I have to handle it again"`, characterSwitch:Sharon},
        ],
        choices: [
            {text: 'Punch Him or Die Trying', next: 'pranav_gets_punched'},
            {text: 'Beg for your life', next: 'pranav_laughs'},
        ]
    },
    
    pranav_gets_punched: {
        text: [
            {text: `Sharon Punches Pranav with all he got.`, attack:1},
            {text: `He would have gotten -0.5 damage if the game would have allowed it.`},
        ],
        end:[
            {text:'Sharon Died out of heartattack.', damage:4},
            {text: '****The End****'}
        ]
    },
    pranav_laughs: {
        text: [
            {text: `Sharon: "Please don't kill me."`},
            {text: `Pranav Laughs and procedes to kill Sharon.`},
            {text:'Sharon Died with Shame.', damage:4},
        ],
        end:[
            {text: '****The End****'}
        ]
    },

}

renderScene();
addDialogue();