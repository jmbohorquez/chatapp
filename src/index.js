const path = require( 'path' )
const http = require( 'http' )
const express = require( 'express' )
const socketio = require( 'socket.io' )
const Filter = require( 'bad-words' )
const { generateMessage, generateLocationMessage } = require( './utils/messages' )
const { addUser, removeUser, getUser, getUsersInRoom } = require( './utils/users' )

const app = express()
const server = http.createServer( app )
const io = socketio( server )

const port = process.env.PORT || '8000'
const publicDirectoryPath = path.join( __dirname, '../public' )

app.use( express.static( publicDirectoryPath ) )

io.on( 'connection', ( socket ) => {

    //socket.emit = Enviar un evento a un cliente especifico
    //io.emit = enviar un evento a todo cliente conectado
    //socket.broadcast.emit = envia un evento a cada cliente conectado excepto al que lo emite
    //io.to.emit = emite eventos a todos los que esten en una sala especifica
    //socket.broadcast.to.emit = emite un evento a todos excepto el emisor en una sala especifica

    console.log( 'New conection...' )

    socket.on( 'join', ( { username, room }, callback ) => {
        const { error, user } = addUser({ id: socket.id, username, room })

        if( error ){
            return callback( error )
        }

        socket.join( user.room )

        socket.emit( 'message', generateMessage( user.username, 'Welcome!' ) )
        socket.broadcast.to( user.room ).emit( 'message', generateMessage( `${ user.username } se ha unido` ) )
        io.to( user.room ).emit( 'roomData', {
            room: user.room,
            users: getUsersInRoom( user.room )
        } )

        callback()

    } )

    socket.on( 'sendMessage', ( message, callback ) => {
        const user = getUser( socket.id )  
        const filter = new Filter()

        if( filter.isProfane( message ) ){
            return callback( 'La vulgaridad no esta permitida' )
        }
        
        io.to( user.room ).emit( 'message', generateMessage( user.username, message ) )
        callback()
    } )

    socket.on( 'sendLocation', ( location, callback ) => { 
        const user = getUser( socket.id )
        
        io.to( user.room ).emit( 'locationMessage', generateLocationMessage( user.username, location[0], location[1] ) )
        callback()
    } )

    socket.on( 'disconnect', () => {
        const user = removeUser( socket.id )

        if( user ){
            io.to( user.room ).emit( 'message', generateMessage( user.username, 'se ha desconectado' ) )
            io.to( user.room ).emit( 'roomData', {
                room: user.room,
                users: getUsersInRoom( user.room )
            } )
        }

    } )
    
} )

server.listen( port, () => {
    console.log( `Escuchando en el puerto... ${ port }` )
} )
