const socket = io()

//Elements
const messageForm = document.querySelector( '#chatForm' )
const messageFormInput = messageForm.querySelector( 'input' )
const messageFormButton = messageForm.querySelector( 'button' )
const sendLocationButton = document.querySelector( '#send-location' )
const messages = document.querySelector( '#messages' )

//Templates
const messageTemplate = document.querySelector( '#message-template' ).innerHTML
const locationMessageTemplate = document.querySelector( '#location-message-template' ).innerHTML
const sidebarTemplate = document.querySelector( '#sidebar-template' ).innerHTML

//options
const { username, room } = Qs.parse( location.search, { ignoreQueryPrefix: true } )

const autoScroll = () => {
    //elemento nuevo mensaje
    const newMessage = messages.lastElementChild

    //altura del nuevo mensaje
    const newMessageStyles = getComputedStyle( newMessage )
    const newMessageMargin = parseInt( newMessageStyles.marginBottom )
    const newMessageHight = newMessage.offsetHeight + newMessageMargin

    //altura visible
    const visibleHeight = messages.offsetHeight

    //Altura del contenedor de mensajes
    const containerHeight = messages.scrollHeight

    //Que tanto hay que hacer scroll
    const scrollOffset = messages.scrollTop + visibleHeight

    if( containerHeight - newMessageHight <= scrollOffset ){
        messages.scrollTop = messages.scrollHeight
    }

}

socket.on( 'message', ( message ) => {
    console.log( message )

    const html = Mustache.render( messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment( message.createdAt ).format( 'h:mm a' )
    } )
    messages.insertAdjacentHTML( 'beforeend', html )
    autoScroll()
} )

socket.on( 'locationMessage', ( url ) => {
    console.log( url )

    const html = Mustache.render( locationMessageTemplate, {
        username: url.username,
        url: url.link,
        createdAt: moment( url.createdAt ).format( 'h:mm a' )
    } )
    messages.insertAdjacentHTML( 'beforeend', html )
    autoScroll()
} )

socket.on( 'roomData', ({ room, users }) => {
    const html = Mustache.render( sidebarTemplate, {
        room,
        users
    } )

    document.querySelector( '#sidebar' ).innerHTML = html
})

messageForm.addEventListener( 'submit', ( e ) => {
    e.preventDefault()

    messageFormButton.setAttribute( 'disabled', 'disabled' )

    const message = e.target.elements.chat_text.value

    socket.emit( 'sendMessage', message, ( error ) => {

        messageFormButton.removeAttribute( 'disabled' )
        messageFormInput.value = ''
        messageFormInput.focus()

        if( error ){
            return console.log( error )
        }

        console.log( 'mensaje entregado' )
    } )

} )

sendLocationButton.addEventListener( 'click', () => {

    if( ! navigator.geolocation ){
        return alert( 'No es posible obtener la ubicacion' )
    }

    sendLocationButton.setAttribute( 'disabled', 'disabled' )

    navigator.geolocation.getCurrentPosition( ( position ) => {
        //console.log( position.coords )

        const location = [ position.coords.latitude, position.coords.longitude ]

        socket.emit( 'sendLocation', location, () => {
            console.log('Ubicacion compartida')
            sendLocationButton.removeAttribute( 'disabled' )
        } )
    } )

} )

socket.emit( 'join', { username, room }, error => {
    if( error ){
        alert( error )
        location.href = '/'
    }
} )