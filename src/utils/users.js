const users = []

const addUser = ({ id, username, room }) => {

    //Limpiar datos
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validar los datos
    if( ! username || ! room ){
        return{
            error: 'Usuario y sala son valores requeridos'
        }
    }

    //Verificar un usuario existente
    const existingUser = users.find( user => {
        return user.room === room && user.username === username
    })

    //Validar el username
    if( existingUser ){
        return{
            error: 'El nombre de usuario ya esta en uso'
        }
    }

    //Guardar el usuario
    const user = { id, username, room }
    users.push( user )
    return {
        user
    }
}

const removeUser = ( id ) => {
    const index = users.findIndex( user => user.id === id )

    if( index !== -1 ){
        return users.splice( index, 1 )[0]
    }
}

const getUser = ( id ) => users.find( user => user.id === id )

const getUsersInRoom = room => {
    room = room.trim().toLowerCase()
    return users.filter( user => user.room === room )
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}