import socket from './net.js'
const $loginState = document.getElementById('login_state');
const $drawState = document.getElementById('draw_state');

const $loginForm = document.getElementById('login_form');
const $nameInput = document.getElementById('inputName');
const $roomEndpoint = document.getElementById('roomEndpoint');
const $wrongPassword = document.getElementById('wrongPassword');

const $drawingCanvas = document.getElementById('drawingCanvas');

// Begin of drawing function

var canvas = $drawingCanvas;
var colors = document.getElementsByClassName('color');
var context = canvas.getContext('2d');

var current = {
    color: getRandomColor(),
};
var drawing = false;

canvas.addEventListener('mousedown', onMouseDown, false);
canvas.addEventListener('mouseup', onMouseUp, false);
canvas.addEventListener('mouseout', onMouseUp, false);
canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);

for (var i = 0; i < colors.length; i++) {
    colors[i].addEventListener('click', onColorUpdate, false);
}

socket.on('drawing', onDrawingEvent);

window.addEventListener('resize', onResize, false);
onResize();


function drawLine(x0, y0, x1, y1, color, emit) {
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();
    context.closePath();

    if (!emit) {
        return;
    }
    var w = canvas.width;
    var h = canvas.height;

    socket.emit('drawing', {
        x0: x0 / w,
        y0: y0 / h,
        x1: x1 / w,
        y1: y1 / h,
        color: color
    });
}

function onMouseDown(e) {
    drawing = true;
    current.x = e.clientX || e.touches[0].clientX;
    current.y = e.clientY || e.touches[0].clientY;
}

function onMouseUp(e) {
    if (!drawing) {
        return;
    }
    drawing = false;
    drawLine(current.x, current.y, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, current.color, true);
}

function onMouseMove(e) {
    if (!drawing) {
        return;
    }
    drawLine(current.x, current.y, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, current.color, true);
    current.x = e.clientX || e.touches[0].clientX;
    current.y = e.clientY || e.touches[0].clientY;
}

function onColorUpdate(e) {
    current.color = e.target.className.split(' ')[1];
}

// limit the number of events per second
function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function() {
        var time = new Date().getTime();

        if ((time - previousCall) >= delay) {
            previousCall = time;
            callback.apply(null, arguments);
        }
    };
}

//random color
function getRandomColor() {
    var randomColor = Math.floor(Math.random()*16777215).toString(16);
    return '#'+randomColor;

}

function onDrawingEvent(data) {
    var w = canvas.width;
    var h = canvas.height;
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
}

// make the canvas fill its parent
function onResize() {
    canvas.width = window.innerWidth * 0.7;
    canvas.height = window.innerHeight;
}

// End of drawing function

// Begin of LOGIN things

let name;
let password;

// Send Message
$loginForm.addEventListener('submit', function(event) {
    event.preventDefault()
    name = $nameInput.value;
    if($roomEndpoint.value == 'AdminOnly'){
        password = document.getElementById('inputPassword').value;
        authPassword(password);
    }else if($roomEndpoint.value == 'ViewOnly'){
        authViewOnly(name);
    }else{
        login(name);
    }
});

function authPassword(password){
    socket.emit('authPassword', password);

    socket.on('authPasswordResponse', (response) => {
        if(response.errorcode == 0){
            login(name);
        }else{
            $wrongPassword.style.display = 'block';
        }
    });
}

function authViewOnly(authName){
    socket.emit('authViewOnly', authName);

    socket.on('authViewOnlyResponse', (response) => {
        if(response.errorcode == 1){
            canvas.removeEventListener('mousedown', onMouseDown, false);
            canvas.removeEventListener('mouseup', onMouseUp, false);
            canvas.removeEventListener('mouseout', onMouseUp, false);
            canvas.removeEventListener('mousemove', throttle(onMouseMove, 10), false);
        }
        login(name);
    });
}

function login(name) {
    console.log("Login", name);
    socket.emit('login', name);
    $loginState.style.display = 'none';
    $drawState.style.display = 'block';
}

// End of LOGIN things