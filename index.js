require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const channelID = process.env.CHANNEL_ID;
const token = process.env.DISCORD_APP_TOKEN;

client.on('ready', async () => {
    const channel = await client.channels.fetch(channelID);
    if (channel.type !== 'voice') {
        return;
    }

    const connection = await channel.join();
    const dispatcher = connection.play('http://kpop.bigbradio.net/');
    const onChannelChange = () => {
        if (channel.members.size <= 1) dispatcher.pause();
        else if (dispatcher.paused) dispatcher.resume();
    };

    onChannelChange();
    client.on('voiceStateUpdate', onChannelChange);
});

client.login(token);
