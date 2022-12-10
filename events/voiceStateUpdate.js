module.exports = {
    eventString : 'voiceStateUpdate',
    async execute(oldState, newState){
        user = newState.member.user;

        if (newState.channelId == null || oldState.channelId != null) {
            // User left a voice channel
            console.log(`${user.username} left ${oldState.channel.name}`);
        }if (oldState.channelId == null || newState.channelId != null){
            // User joined a voice channel
            console.log(`${user.username} joined ${newState.channel.name}`);
        }

    }
}