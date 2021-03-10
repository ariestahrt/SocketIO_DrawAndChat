// Socket Connect

// Get endpoint from the url
let url = location.pathname.split('/');
const endpoint = url[url.length - 1];
console.log('endpoint: ',endpoint);
// socket is the global object used to listen on incoming messages and send (emit) ones to the server.
const socket = io(`/${endpoint}`)

window.addEventListener('load', () => {
    // document.getElementById('title').innerText = `Endpoint: ${endpoint}`
    document.title = endpoint
})

window.onunload = () => {
    socket.close()
}

let view_only = false;

let password = '12345';
if(endpoint == 'Admin%20Only'){
    let inputpasswd = prompt("Passwordnya");
    while(inputpasswd != password){
        inputpasswd = prompt("Password salah!, input lagi");
    }
}

export default socket;
export {endpoint};