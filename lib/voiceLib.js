const { joinVoiceChannel, getVoiceConnection, createAudioResource, createAudioPlayer, AudioPlayerStatus, NoSubscriberBehavior, StreamType } = require('@discordjs/voice');
const { OpusEncoder } = require('@discordjs/opus');
const Stream = require('stream')
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
    // Check if the connection exists
    if (!connection.destroyed) {
        connection.destroy();
    }
}

const listen = (connection, userId, write = false) => {
    // Create a receiver
    const receiver = connection.receiver;
    connection.on('error', console.warn);
    connection.on('debug', console.log);
    // Subscribe to the user's voice data
    const stream = receiver.subscribe(userId);
    // If we don't want to write the data to a file, return the stream
    if (!write) {
        connection.on('close', () => {
            console.log("close")
            connection.destroy();
        });
        return stream
    }
    // Create an Opus encoder
    const encoder = new OpusEncoder(48000, 2);
    // Create a write stream to write our data to a file
    const writeStreamFile = fs.createWriteStream(path.join(streamPath, `${userId}.pcm`));
    connection.on('close', () => {
        console.log("close")
        writeStreamFile.end();
        connection.destroy();
    });
    stream.on('error', console.warn);
    stream.on("data", (data) => {
        // Decode the data
        const decoded = encoder.decode(data);
        // Write the decoded data to the file
        writeStreamFile.write(decoded);
    })
    return stream;
}

const stop = (channel) => {
    const connection = getVoiceConnection(channel.guild.id);
    if (connection) {
        connection.destroy();
    }
}

const playStream = (connection, stream) => {
    const player = createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Pause,
        },
    });
    const resource = createAudioResource(stream, { inputType: StreamType.Opus });
    player.play(resource);
    
    player.on('stateChange', (oldState, newState) => {
        if (oldState.status === AudioPlayerStatus.Idle && newState.status === AudioPlayerStatus.Playing) {
            console.log('Playing audio output on audio player');
        } else if (newState.status === AudioPlayerStatus.Idle) {
            console.log('Playback has stopped. Attempting to restart.');
            // const resource = createAudioResource(stream, { inputType: StreamType.Raw });
            // player.play(resource);
        }
    });
    player.on('error', console.warn);
    player.on('debug', console.log);
    player.on('close', () => {
        console.log("close")
    });
    setTimeout(() => {
        connection.subscribe(player)
    }, 1000);
    return player;

}

module.exports.voiceLib = {
    join : join,
    leave : leave,
    listen : listen,
    stop : stop,
    playStream : playStream,
    createAudioResource : createAudioResource,
}