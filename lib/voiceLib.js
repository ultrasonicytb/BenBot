const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const { OpusEncoder } = require('@discordjs/opus');
const fs = require('node:fs');
const path = require('node:path');

let streamPath = path.join(__dirname, '../src/streams');

const join = (channel, options = {}) => {
    let data = {
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    }
    data = Object.assign(data, options);
    const connection = joinVoiceChannel(data);
    channel.client.logger.info(`Joined ${channel.name}`);
    return connection;
}

const leave = (connection) => {
    
    connection.destroy();
}

const listen = (connection, userId) => {
    const encoder = new OpusEncoder(48000, 2);
    // Create a write stream to write our data to a file
    const writeStream = fs.createWriteStream(path.join(streamPath, `${userId}.pcm`));
    // Create a receiver
    const receiver = connection.receiver;
    connection.on('error', console.warn);
    connection.on('debug', console.log);
    connection.on('close', () => {
        console.log("close")
        writeStream.end();
        connection.destroy();
    });
    // Create a stream to write our data to a file
    const stream = receiver.subscribe(userId);
    stream.on('error', console.warn);
    stream.on("data", (data) => {
        console.log(data.length);
        // Decode the data
        const decoded = encoder.decode(data);
        // Write the decoded data to the file
        writeStream.write(decoded);
    })
    return writeStream
}

const stop = (channel) => {
    const connection = getVoiceConnection(channel.guild.id);
    if (connection) {
        connection.destroy();
    }
}

module.exports.voiceLib = {
    join : join,
    leave : leave,
    listen : listen,
    stop : stop
}