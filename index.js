require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const channelID = process.env.CHANNEL_ID;
const token = process.env.DISCORD_APP_TOKEN;

const getNonDeafMemberCount = channel => {
    if (!channel.members) return 0;
    return channel.members.reduce((count, member) => count + +!member.deaf, 0);
}

client.on('ready', async () => {

    const channel = await client.channels.fetch(channelID);
    if (channel.type !== 'voice') {
        return;
    }

    const connection = await channel.join();
    if (connection.dispatcher) connection.dispatcher.end();

    let dispatcher = connection.play('http://kpop.bigbradio.net/');
    const onDispatcherFinish = () => {
        if (connection.dispatcher) return;
        if (dispatcher) dispatcher.end();
        dispatcher = connection.play('http://kpop.bigbradio.net/');
        dispatcher.on('finish', onDispatcherFinish);
    };
    dispatcher.on('finish', onDispatcherFinish);

    const onChannelChange = () => {
        if (getNonDeafMemberCount(channel) <= 1) { // Bot itself is not deaf, that's why 1 instead of 0
            console.log('Not enough members', getNonDeafMemberCount(channel), 'Pausing...');
            dispatcher.pause();
        } else if (dispatcher.paused) {
            console.log('Continuing...');
            dispatcher.resume();
        }
    };

    onChannelChange();
    client.on('voiceStateUpdate', onChannelChange);
});

client.login(token);
