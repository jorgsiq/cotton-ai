import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

let loadInterval

//makes bot typing effect
function loader(element) {
    element.textContent = ''

    loadInterval = setInterval(() => {
        // Update the text content of the loading indicator
        element.textContent += '.';

        // If the loading indicator has reached three dots, reset it
        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

//typing line per line effect
function typeText(element, text) {
    let index = 0

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index)
            index++
        } else {
            clearInterval(interval)
        }
    }, 20)
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

// verifies and makes message style for bot or user
function chatStripe(isAi, value, uniqueId) {
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
    )
}

const startup = () => {
    setTimeout(() => {
        chatContainer.innerHTML += `<div class="wrapper ai"><div class="chat"><div class="profile"><img src=${bot}  alt="bot" /></div><div class="message" id="startup2">I can also recommend movies and books, generate and summarize text, write poetry and songs, perform sentiment analysis, generate programming code, and much more..</div></div>`;
    }, "1000");
    setTimeout(() => {
        chatContainer.innerHTML += `<div class="wrapper ai"><div class="chat"><div class="profile"><img src=${bot}  alt="bot" /></div><div class="message" id="startup2">Sometimes it takes me a moment to start up, so please don't be alarmed if there's a slight delay in my response to your first message.</div></div>`;
    }, "3000");
   

}

const isEmptyOrSpaces = (str) => {
    return str === null || str.match(/^ *$/) !== null;
}

const handleSubmit = async (e) => {
    e.preventDefault()

    const data = new FormData(form)

    if (isEmptyOrSpaces(data.get('prompt'))) {
        return;
    }

    // user's chatstripe
    chatContainer.innerHTML += (chatStripe(false, data.get('prompt').charAt(0).toUpperCase() + data.get('prompt').slice(1)))

    // to clear the textarea input 
    form.reset()

    // bot's chatstripe
    const uniqueId = generateUniqueId()
    chatContainer.innerHTML += chatStripe(true, "", uniqueId)

    // to focus scroll to the bottom 
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // specific message div 
    const messageDiv = document.getElementById(uniqueId)

    // messageDiv.innerHTML = "..."
    loader(messageDiv)

    const response = await fetch('https://cotton-ai.onrender.com', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    })

    clearInterval(loadInterval)
    messageDiv.innerHTML = ""

    if (response.ok) {
        const data = await response.json();
        const parsedData = data.bot.trim() // trims any trailing spaces/'\n' 

        typeText(messageDiv, parsedData)
    } else {
        const err = await response.text()

        messageDiv.innerHTML = "Sorry, I can't answer you at this moment.."
    }
}

startup();
form.addEventListener('submit', handleSubmit);
document.querySelector('#submit-button').addEventListener('click', (e) => {
    e.preventDefault();
    handleSubmit(e);
});