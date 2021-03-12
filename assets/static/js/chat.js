import socket from './net.js';

// username is used to be compared with 'from' in 'msg' events
let username;

window.addEventListener('load', () => {

    const $messageInput = document.getElementById('messageInput');
    const $messageForm = document.getElementById('messageForm');
    const $messagesContainer = document.getElementById('msg_history');
    const $nameInput = document.getElementById('inputName');

    // Send Message
    $messageForm.addEventListener('submit', function(event) {
        event.preventDefault();
        username = $nameInput.value;
        const message = $messageInput.value;
        $messageInput.value = "";
        // Send
        socket.emit('msg', message);
    });

    // Pesan Diterima
    socket.on('msg', (data) => {
        console.log('Message recevied');
        if (data.from != username) {
            push_msg(true, data.from, data.message)
        } else {
            push_msg(false, 'me', data.message)
        }
    })
    
    function push_msg(is_incoming, username, msg){
        var today = new Date();
        var month = new Array();
        month[0] = "January";
        month[1] = "February";
        month[2] = "March";
        month[3] = "April";
        month[4] = "May";
        month[5] = "June";
        month[6] = "July";
        month[7] = "August";
        month[8] = "September";
        month[9] = "October";
        month[10] = "November";
        month[11] = "December";
        var time = today.getHours() + ':' + today.getMinutes() + ' | ' + month[today.getMonth()] + ' ' + today.getDate();
        if(is_incoming){
            $messagesContainer.innerHTML +=
            `
            <div class="incoming_msg">
                <div class="received_msg">
                    <div class="received_withd_msg">
                        <p><b>${username}</b><br>${msg}</p>
                        <span class="time_date"> ${time}</span>
                    </div>
                </div>
            </div>
            `
        }else{
            $messagesContainer.innerHTML +=
            `
            <div class="outgoing_msg">
                <div class="sent_msg">
                    <p><b>You</b><br>${msg}</p>
                    <span class="time_date"> ${time}</span>
                </div>
            </div>
            `
        }
        // Scroll down to last message
        $messagesContainer.scrollTop = $messagesContainer.scrollHeight
    }
})

