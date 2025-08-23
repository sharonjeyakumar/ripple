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
}

// Init game only once
function initGame() {
    // Ensure listener is not duplicated
    document.body.removeEventListener("click", globalClickHandler);
    document.body.addEventListener("click", globalClickHandler);

    renderScene();
    addDialogue();
}





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
            dialogueContainer.style.color = line.color;
        }

        setTimeout(() => {
            element.classList.add('show');
            dialogueContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 50);

        currentDialogue++; 

    } else if (!choicesShown) {
        choicesShown= true;
        const scene = scenes[currentScene];

        if (scene.continue) {
            currentScene = scene.continue[0].next;
            renderScene();
            addDialogue();
        } else if (scene.choices) {
            showChoices(scenes[currentScene].choices);
            playSound(choiceSound);
        } else if (scene.timedchoices) {
            showTimedChoices(scene.timedchoices, 3000);
            playSound(choiceSound);
    }
    }
}

function showTimedChoices(choices, timeLimit = 3000) {
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
            textSpan.style.color = chapterColor;

            btn.appendChild(indexSpan);
            btn.appendChild(textSpan);
        } else {
            btn.textContent = choice.text;
        }

        setTimeout(() => btn.classList.add('show'));

        btn.onclick = (e) => {
            
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
    choicesContainer.appendChild(timerBar);

    gameScreen.appendChild(choicesContainer);

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

        // Split into index and text (expects "1. Choice text")
        const match = choice.text.match(/^(\d+\.)\s*(.*)$/);

        if (match) {
            const indexSpan = document.createElement('span');
            indexSpan.textContent = match[1]; 
            indexSpan.style.color = "white"; 

            const textSpan = document.createElement('span');
            textSpan.textContent = " " + match[2];
            textSpan.style.color = chapterColor;   

            btn.appendChild(indexSpan);
            btn.appendChild(textSpan);
        } else {
            // fallback (if no number prefix)
            btn.textContent = choice.text;
        }

        setTimeout(() => {
            btn.classList.add('show');
            choicesContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
        });

        btn.onclick = (e) => {
          
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
        };

        choicesContainer.appendChild(btn);
    });
    gameScreen.appendChild(choicesContainer);
}


// gameScreen.addEventListener('click', () => {
//     addDialogue();
// });


const chapterColor = '#ca4646ff';

const scenes = {
    intro: {
        text: [
            // {text: `Chapter 1: Introduction`, color:`${chapterColor}`},
            // {text: `Anna: “Thanks for doing this, Jason… you know it means a lot to me.”`},
            // {text: `Jason shrugged, lips twitching. “You don’t have to mention it. It’s the least I can do.”`},
            // {text: `A playful glint danced in Anna’s eyes as she stepped closer. “Then I’ll make sure to repay you… in the way you like best.”`},
            // {text: `Jason glanced at the deck, where the others laughed. “I wish you could do that now… our friends are outside.”`},
            // {text: `Anna smirked. “You’ll have to wait… it’s always better that way.”`},
            // {text: `Max’s voice cut sharply across the deck. “yo Jason! What did I tell you? It’s your dog again!”`},
            // {text: `Anna: “Come on, let’s see.”`},
            // {text: `Max: “Can’t believe you brought your sick dog on a trip. Hope there’s a vet on this godforsaken island.”`},
            // {text: `Jason: “He wasn’t sick before. Maybe just sea sickness.”`},
            // {text: `Linda: “Yeah, he was fine at first… sounds like classic sea sickness to me.”`},
            // {text: `Anna: “Poor Spike… hang in there, we’ll be there soon.”`},
            // {text: `Jason: “Matthew, how long until we reach the island?”`},
            // {text: `Matthew: “By seven.”`},
            // {text: `Linda: “Can’t you guys choose somewhere nice? It had to be a place from the nightmare?”`},
            // {text: `Matthew grinned slightly. “Be positive for once.”`},
            // {text: `Spike trotted toward Jason, tail wagging. He nudged his nose into Jason’s leg, looking up with trusting eyes.`},
            // {text: `Anna laughed softly. “He clearly likes you a lot… I think I’m getting a little possessive.”`},
            // {text: `Jason knelt and scratched behind Spike’s ears. “You’re the best little guy. Always look out for us.”`},
            // {text: `The sea seemed unnaturally calm… no waves, just bleak, silent blackness stretching to the horizon.`},
            // {text: `Spike’s teeth snagged Jason’s pants, a feeble attempt to hold on that slipped almost immediately.`},
            // {text: `Spike shivered suddenly, ears flattening. Then he convulsed violently, a guttural, unnatural growl escaping him. He began biting himself.`},
            // {text: `Max froze. “yo yo… does this look like sea sickness to anyone?”`},
            // {text: `Anna stepped closer, hand trembling. “Spike… what’s happening?”`},
            // {text: `Jason: “Step back! Let me handle him!”`},
            // {text: `Jason: “What’s happening to him? He’s acting… aggressively! Someone bring me water!”`},
            // {text: `Without warning, Spike leapt at Jason, jaws clamping down on his neck.`},
            // {text: `Anna screamed. “Oh no! Someone help him!”`},
            // {text: `Matthew lunged forward. “What even is happening?”`},
            // {text: `He tried to pull Spike off Jason, but the dog’s jaws clenched harder, almost impossibly strong.`},
            // {text: `Anna’s voice shook. “Oh please… no, Jason!”`},
            {text: `Jason felt the world tilt and blur. Pain, fear, and a strangled sense of helplessness consumed him. Voices echoed around him—distant, muffled—but one voice pierced through clearly:`},
            {text: `"Jason… Jason… Please stay with me… You promised."`},
        ],
         timedchoices: [
            { text: "1. Give Up", next: "give_up" },
            { text: "2. Fight back", next: "fight_back" }
        ]
    },
    give_up: {
        text: [
            {text: `The will to fight back flares, stubborn and fierce.`},
            {text: `A bright light rises on the horizon, growing sharper and blinding with every second. Jason closed his eyes, struggling to hold on.`},
            {text: `When he opened them again, Anna is kneeling beside him, tears streaking her face.`},
            {text: `Anna: "Thank God… you’re back."`},
            {text: `Jason’s chest heaved. His vision was still blurry, the world spinning slightly, but the danger had passed… for now.`},
        ],
        choices: [

        ],
        continue: [

        ]
    },
    fight_back: {
        text: [
            {text: `The will to go on feels… extinguished.`},
            {text: `A bright light rises on the horizon, growing sharper and blinding with every second. he closed his eyes, struggling to hold on.`},
            {text: `When he open them again, Anna is kneeling beside him, tears streaking her face.`},
            {text: `Anna: "Thank God… you’re alive."`},
            {text: `Jason’s chest heaved. His vision was still blurry, the world spinning slightly, but the danger had passed… for now.`},
        ],
        choices: [
            {text: "1. Its nothing"}
        ],
        continue: [

        ]
    },
    fight_backs: {
        text: [
            {text: ``},
        ],
        choices: [

        ],
        continue: [

        ]
    },
}

// Call initGame once on startup
initGame();
