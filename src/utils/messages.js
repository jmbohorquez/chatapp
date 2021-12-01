const generateMessage = ( username, text ) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = ( username, long, lat ) => {
    return{
        username,
        link: `https://google.com/maps?q=${ long },${ lat }`,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}