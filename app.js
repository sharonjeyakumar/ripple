//Title Screen
const titleScreen = document.getElementById('titleScreen');

const endingsBtn = document.getElementById('endingsBtn');
const endingBox = document.getElementById('endingBox');
const initialPrompt = document.getElementById('initialPrompt');

const newGameBtn = document.getElementById('newGameBtn');
const continueGameBtn = document.getElementById('continueGameBtn');
const resetBtn = document.getElementById('resetBtn');

// const continueBtn = document.getElementById('continueBtn');

const vinyl = document.querySelector('.vinyl');
const vinylMusicName = document.getElementById('musicName');

let currentState = 'initial_prompt';
// localStorage.clear();
checkSaveFile();
let userInteracted = false;

initialPrompt.addEventListener('click',()=>{
    userInteracted = true;
    initialPrompt.classList.add('close');
    currentState = 'main_menu';
    setTimeout(()=>{
        vinyl.classList.add('spin');
        playSound(sounds.mainmenu);
        vinylHandler("Main Menu");
    },50);
    setupMainMenu();
});

function vinylHandler(ost){
    vinylMusicName.textContent =ost;
}


let isEndingBoxOpened = false;

const endings = ['Died by Poison', 'Defeated Final Boss'];
let endingsAchieved = new Set();

function setupMainMenu() {
    newGameBtn.addEventListener('click',()=>{
        startNewGame();
    })
    continueGameBtn.addEventListener('click',()=>{
        continueGame();
    })
    // resetBtn.addEventListener('click',()=>{
    //     dialoguebox.innerHTML = '';
    // })

    // Toggle endings
    endingsBtn.addEventListener('click', () => {
        handleEndingBox();
    });
    loadEnding();

    // Append endings list
    appendEndings();
}

function handleEndingBox(){
if (!isEndingBoxOpened) {
            endingsBtn.style.backgroundColor = '#301b07';
            endingBox.classList.add('show');
            isEndingBoxOpened = true;
        } else {
            endingsBtn.style.backgroundColor = '#4e2c0b';
            endingBox.classList.remove('show');
            isEndingBoxOpened = false;
        }
}

function appendEndings(){


    endingBox.innerHTML = ""; 
    endings.forEach((ending, index) => {
        const div = document.createElement("div");
        const h2 = document.createElement("h2");
        div.classList.add('endingsDiv');

        if (endingsAchieved.has(ending)) {
            h2.textContent = `${index + 1}. ${ending}`;
        } else {
            h2.textContent = `${index + 1}. [Unknown]`;
        }

        div.appendChild(h2);
        endingBox.appendChild(div);
    });
}
function startNewGame(){
    
    if(isEndingBoxOpened){
        endingsBtn.style.backgroundColor = '#4e2c0b';
        endingBox.classList.remove('show');
        isEndingBoxOpened = false;
    }

    currentScene = 'intro';
    currentDialogue = 0;
    dialogue = [];
    choicesShown = false;
    suppressClickSound = false;
    actions = [];
    visitedScenes = new Set();

    highlightNextLine = false;
    canAdvanceDialogue = true;
    dialogueHistory = [];

    currentCharacter = null;
    currentEnemy = null;


    Sharon.restoreFullHp();
    Varshan.restoreFullHp();
    Pranav.restoreFullHp();

    dialoguebox.innerHTML = "";
    healthContainer.innerHTML = "";
    ehealthContainer.innerHTML = "";
    characterName.textContent = "";
    echaracterName.textContent = "";
    healthText.textContent = "";
    ehealthText.textContent = "";


    dialoguebox.innerHTML = "";
    closeTitleScreen();
    setTimeout(()=>{
        vinyl.classList.remove('spin');
        gameScreen.style.display = 'flex';
        renderScene();
        addDialogue();
    },300)
}

function closeTitleScreen() {
    titleScreen.classList.add('fadeOut'); // start fade
    

    setTimeout(()=>{

        titleScreen.classList.add('hidden');
    },50)
 
}

function checkSaveFile() {
    const saveData = localStorage.getItem("myGameSave");
    console.log(saveData);
    if (saveData) {
        continueGameBtn.disabled = false; // enable if save exists
    } else {
        continueGameBtn.disabled = true;  // keep disabled otherwise
    }
}

function continueGame(){
    vinyl.classList.remove('spin');
    closeTitleScreen();
    setTimeout(()=>{
        gameScreen.style.display = 'flex';
         loadGame();
    },300)
}

function loadGame(){
    const data = localStorage.getItem("myGameSave");
    if (!data) {
        console.log("No save found.");
        return;
  }
    const saveData = JSON.parse(data);

    currentScene = saveData.currentScene;
    currentDialogue = saveData.currentDialogue;
    dialogueHistory = saveData.dialogueHistory || [];
    actions = new Set(saveData.actions || []);
    visitedScenes = new Set(saveData.visitedScenes || []);
    dialogue = scenes[currentScene].text || [];

    Sharon.currentHealth = saveData.characters.Sharon;
    Varshan.currentHealth = saveData.characters.Varshan;
    Pranav.currentHealth = saveData.enemies.Pranav;

    if (saveData.currentCharacter) {
        if (saveData.currentCharacter.name === "Sharon") currentCharacter = Sharon;
        if (saveData.currentCharacter.name === "Varshan") currentCharacter = Varshan;
        currentCharacter.currentHealth = saveData.currentCharacter.hp;
        updateCharacterSwitch(currentCharacter);
    }

    if (saveData.currentEnemy) {
        if (saveData.currentEnemy.name === "Pranav") currentEnemy = Pranav;
        currentEnemy.currentHealth = saveData.currentEnemy.hp;
        updateECharacterSwitch(currentEnemy);
    }

    updateHealth();
    updateEHealth();

    dialoguebox.innerHTML = "";
    printHistory();


    console.log("✅ Game Loaded", saveData);
}

function printHistory() {
    dialoguebox.innerHTML = ""; // clear
    dialogueHistory.forEach(entry => {
        const dialogueContainer = document.createElement('div');
        dialogueContainer.classList.add('dialogueContainer');

        const element = document.createElement('h2');
        element.textContent = entry.text;

        if (entry.color) element.style.color = entry.color;

        dialogueContainer.appendChild(element);
        dialoguebox.appendChild(dialogueContainer);

        // animation like before
        requestAnimationFrame(() => {
            element.classList.add('show');
            dialogueContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
        });
    });
}
const musicName = document.getElementById('musicName');



//Save Handling
function saveGame(){
    const saveData = {
        currentScene,
        currentDialogue,
        dialogueHistory,
        actions: [...actions],
        visitedScenes: [...visitedScenes],
    characters: {
            Sharon: Sharon.currentHealth,
            Varshan: Varshan.currentHealth
        },
        enemies: {
            Pranav: Pranav.currentHealth
        },
        currentCharacter: currentCharacter ? {
            name: currentCharacter.name,
            hp: currentCharacter.currentHealth,
            maxHp: currentCharacter.maxHealth
        } : null,
        currentEnemy: currentEnemy ? {
            name: currentEnemy.name,
            hp: currentEnemy.currentHealth,
            maxHp: currentEnemy.maxHealth
        } : null
    }
    localStorage.setItem("myGameSave", JSON.stringify(saveData));
    console.log("gameSaved", saveData);
}

function saveEnding(){
    const endingData ={
        endingsAchieved: Array.from(endingsAchieved),
    }
    localStorage.setItem("myEndings", JSON.stringify(endingData))
}

function loadEnding(){
    const data = localStorage.getItem("myEndings");
    if (!data) {
        console.log("No Ending data is found.");
        return;
  }
    const saveData = JSON.parse(data);

    if (Array.isArray(saveData.endingsAchieved)) {
        endingsAchieved = new Set(saveData.endingsAchieved);
    } else {
        endingsAchieved = new Set();
    }
}





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

    restoreFullHp() {
    this.currentHealth = this.maxHealth;
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

    restoreFullHp() {
    this.currentHealth = this.maxHealth;
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

    if (healthText && currentCharacter) {
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

    if (ehealthText && currentEnemy) {
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






const sounds = {
    mainmenu: new Audio("ost/mainmenu.wav"),
    choice: new Audio("sfx/choicesound.mp3"),
    choiceConfirm: new Audio("sfx/choiceconfirm.mp3"),
    click: new Audio("sfx/click-sound3.mp3"),
    itemFound: new Audio("sfx/item-found.mp3")
};






//Game Screen
const gameScreen = document.getElementById('gamescreen');
const dialoguebox = document.getElementById('dialoguebox');
const gameWrapper = document.getElementById('gameWrapper');
const backBtn = document.getElementById('backBtn');
const saveBtn = document.getElementById('saveBtn');

backBtn.addEventListener('click',()=>{
   goBackToMainMenu();
//    saveGame();
   choicesShown = false;
})

function goBackToMainMenu(){
 // saveGame();
    currentState = 'main_menu';
    
    checkSaveFile();
    gameScreen.style.display = 'none';
    titleScreen.classList.remove('hidden', 'fadeOut');
    vinyl.classList.add('spin');
    // titleScreen.style.opacity = "1";
}
saveBtn.addEventListener('click',()=>{
    saveGame();
})

function deleteSave(){
    try{
        localStorage.removeItem("myGameSave");
    }catch{
        
    }

}

function playSound(sound) {
    try {
         if (!userInteracted) return;
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
    // if (!e.target.closest('#continueBtn')) return;
    if (!e.target.closest('#gameWrapper')) return;
    if (e.target.closest('#backBtn')) return;
    if (e.target.closest('#saveBtn')) return;
    if (e.target.closest('#game')) return;

    if (e.target.closest('#resetBtn')) return;
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

// continueBtn.addEventListener('click',()=>{
//     addDialogue();
//     if (showChoices) {
//         dialoguebox.scrollTo({ top: dialoguebox.scrollHeight, behavior: 'smooth' });
//     }
// })

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
let canAdvanceDialogue = true;
let dialogueHistory = [];

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

    if(!canAdvanceDialogue) return;
    if (currentDialogue <= dialogue.length - 1) {
        if (!suppressClickSound) {
            playSound(sounds.click); // normal dialogue click
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

       dialogueHistory.push({
            type: "dialogue",
            text: line.text,
            color: line.color || (highlightNextLine && currentDialogue === 0 && choicesShown ? choiceColor : null)
        });

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
                    canAdvanceDialogue = false;
                    setTimeout(() => {
                        const infoEl = outcome(item.text);
                        playSound(sounds.itemFound);
                        infoEl.style.color = gotNewItemColor;
                        requestAnimationFrame(() => {
                            infoEl.classList.add('show');
                            infoEl.scrollIntoView({ behavior: 'smooth', block: 'end' });
                        });
                        canAdvanceDialogue=true;
                    }, 300);
                    dialogueHistory.push({
                        type: "outcome",
                        text: `ⓘ ${item.text}`,
                        color: gotNewItemColor
                    });
                }
                if (item.action) {
                // If it's an array, push all items; else push single action
                if (Array.isArray(item.action)) {
                    actions.push(...item.action);
                    
                } else {
                    actions.push(item.action);
                    
                }
                console.log(actions);
                }
                
            });
        }
        console.log(canAdvanceDialogue);

        if(line.damage) {
            currentCharacter.takeDamage(line.damage);
            dialogueHistory.push({
                type: "damage",
                text: `ⓘ Damaged Health -${line.damage}`,
                color: redColor
            });
            canAdvanceDialogue = false;
            setTimeout(() => {
                const infoEl = outcome(`ⓘ Damaged Health -${line.damage}`);
                playSound(sounds.itemFound);
                infoEl.style.color = redColor;
                requestAnimationFrame(() => {
                    infoEl.classList.add('show');
                    infoEl.scrollIntoView({ behavior: 'smooth', block: 'end' });
                });
                canAdvanceDialogue=true;
            }, 300);   
        }
        if(line.attack) {
            canAdvanceDialogue = false;
            currentEnemy.takeDamage(line.attack);
            dialogueHistory.push({
                type: "attack",
                text: `ⓘ Damaged Enemy's Health -${line.attack}`,
                color: enemydamageColor
            });
            setTimeout(() => {
                const infoEl = outcome(`ⓘ Damaged Enemy's Health -${line.attack}`);
                playSound(sounds.itemFound);
                infoEl.style.color = enemydamageColor;
                requestAnimationFrame(() => {
                    infoEl.classList.add('show');
                    infoEl.scrollIntoView({ behavior: 'smooth', block: 'end' });
                });
                canAdvanceDialogue=true;
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

        if(line.ending){
            setTimeout(() => {
                const infoEl = outcome(`ⓘ Ending: ${line.ending}`);
                playSound(sounds.itemFound);
                infoEl.style.color = redColor;
                requestAnimationFrame(() => {
                    infoEl.classList.add('show');
                    infoEl.scrollIntoView({ behavior: 'smooth', block: 'end' });
                });
                setTimeout(()=>{
                    showEndingPrompt();
                },50)
            }, 300);  
           if (!endingsAchieved.has(line.ending)) {
                endingsAchieved.add(line.ending);
                appendEndings();
                saveEnding();
                console.log(endingsAchieved)
                console.log("New ending unlocked: " + line.ending);

            }
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
            playSound(sounds.choice);
        } else if (scene.timedchoices) {
            showTimedChoices(scene.timedchoices, 6000);
            playSound(sounds.choice);
        } else if (scene.end) {

            dialogue = scene.end;
            currentDialogue = 0;
            choicesShown = true;
            highlightNextLine = false;// prevent showing choices
            addDialogue();
        }
    }
}

function showEndingPrompt(){
    const endingPromptContanier = document.createElement('div');
    endingPromptContanier.classList.add('endingPromptContanier');

    const playAgainBtn = document.createElement('button');
    playAgainBtn.classList.add('endingPromptBtns');
    const goToMainMenuBtn = document.createElement('button');
    goToMainMenuBtn.classList.add('endingPromptBtns');

    const retryIcon = document.createElement('span');
    retryIcon.textContent = '↺';
    retryIcon.classList.add('icon');
    retryIcon.style.marginBottom = '5px';

    const backIcon = document.createElement('span');
    backIcon.textContent = '←';
    backIcon.classList.add('icon');
    backIcon.style.marginBottom = '8px';

    // Create text spans
    const retryText = document.createElement('span');
    retryText.textContent = 'Play Again';

    const backText = document.createElement('span');
    backText.textContent = 'Go to Main Menu';

   function isPC() {
    const ua = navigator.userAgent;
    return !/Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(ua);
}

// Append icons + text conditionally
if (!isPC()) { // only append icons if NOT a PC
    playAgainBtn.appendChild(retryIcon);
    goToMainMenuBtn.appendChild(backIcon);
}

    playAgainBtn.appendChild(retryText);
    goToMainMenuBtn.appendChild(backText);
    endingPromptContanier.appendChild(playAgainBtn);
    endingPromptContanier.appendChild(goToMainMenuBtn);

    playAgainBtn.style.color = choiceBtnColor;
    goToMainMenuBtn.style.color = choiceBtnColor;
    dialoguebox.appendChild(endingPromptContanier);

    goToMainMenuBtn.addEventListener('click',()=>{
        deleteSave();
        goBackToMainMenu();
    });
    playAgainBtn.addEventListener('click',()=>{
        currentScene = 'intro';
        currentDialogue = 0;
        dialogue = [];
        choicesShown = false;
        suppressClickSound = false;
        actions = [];
        visitedScenes = new Set();

        highlightNextLine = false;
        canAdvanceDialogue = true;
        dialogueHistory = [];

        currentCharacter = null;
        currentEnemy = null;


        Sharon.restoreFullHp();
        Varshan.restoreFullHp();
        Pranav.restoreFullHp();

        dialoguebox.innerHTML = "";
        healthContainer.innerHTML = "";
        ehealthContainer.innerHTML = "";
        characterName.textContent = "";
        echaracterName.textContent = "";
        healthText.textContent = "";
        ehealthText.textContent = "";


        dialoguebox.innerHTML = "";
        deleteSave();
        renderScene();
        addDialogue();
        });

    setTimeout(() => {
        playAgainBtn.classList.add('show');
        goToMainMenuBtn.classList.add('show');
        endingPromptContanier.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 300);


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
            playSound(sounds.choiceConfirm);

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
                playSound(sounds.choiceConfirm);
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
            {text: '****The End****',ending:'Defeated Final Boss'},
        ]
    },

}

renderScene();
addDialogue();