import socket from './net.js';
import endpoint from './net.js';

// username is used to be compared with 'from' in 'msg' events
let username;

window.addEventListener('load', () => {

    const $messageInput = document.getElementById('messageInput');
    const $messageForm = document.getElementById('messageForm')
    const $messagesContainer = document.getElementById('messagesContainer')

    // Send Message
    $messageForm.addEventListener('submit', function(event) {
        event.preventDefault()
        const message = $messageInput.value;
        $messageInput.value = "";
        // Send
        socket.emit('msg', message);
    })

    // Tanyakan Username:
    username = prompt("Username");
    login(username);

    function login(name) {
        console.log("Login", username);
        socket.emit('login', username)
    }

    // Pesan Diterima
    socket.on('msg', (data) => {
        console.log('Message recevied');
        if (data.from != username) {
            say(data.from, data.message)
        } else {
            say('me', data.message)
        }
    })
    
    function say(name, message) {
        console.log('Say called');
        $messagesContainer.innerHTML +=
        `<div class="chat-message">
            <span style="color: red; font-weight: bold;">${name}:</span> <span class="msg">${message}</span>
        </div>`
        // Scroll down to last message
        $messagesContainer.scrollTop = $messagesContainer.scrollHeight
    }
})

