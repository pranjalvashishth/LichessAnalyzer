require('dotenv').config();
const axios = require('axios');
const https = require('https');

https.get("https://lichess.org", (res) => {
  console.log(`✅ Lichess is reachable, Status: ${res.statusCode}`);
}).on("error", (err) => {
  console.log(`❌ Cannot reach Lichess: ${err.message}`);
});

const {Client, GatewayIntentBits} = require('discord.js');

const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions
]})

client.on('ready', ()=>{
  console.log(`${client.user.tag}`);
});

client.on('messageCreate',async (message) => {
  if(message.content==='!help'){
    message.channel.send('Hello, I am LichessAnalyser Bot. To analyse a profile just send the command !analyse [username]');
  }
  if (message.content.toLowerCase().startsWith("!analyse")) {
    const args = message.content.split(" ").slice(1);
    if (args.length === 0) {
        return message.reply("Please provide a Lichess username. Usage: `!analyse <username>`");
    }

    const username = args[0]; 
    
    try {
      console.log(`🔍 Fetching data for: ${username}`);
      const response = await axios.get(`https://lichess.org/api/user/${username}`);
      const data = response.data;

      console.log("API Response:", data);

      if (!data || !data.perfs) {
          return message.reply(`❌ No rating data found for **${username}**.`);
      }

      // Extract ratings safely
      const bullet = data.perfs.bullet?.rating ?? "N/A";
      const blitz = data.perfs.blitz?.rating ?? "N/A";
      const rapid = data.perfs.rapid?.rating ?? "N/A";
      const playTimesecs= data.playTime.total ?? "N/A";

      function formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = Math.floor(minutes % 60);
        return `${hours}h ${mins}m`;
      }

      const playTime = formatTime(playTimesecs / 60);

      message.reply(`♟️ **Lichess Ratings for ${username}:**\n🔹 Bullet: **${bullet}**\n🔹 Blitz: **${blitz}**\n🔹 Rapid: **${rapid}**\n🔹Total playtime is **${playTime}**`);
  } catch (error) {
      console.error("❌ Lichess API Error:", error.response ? error.response.data : error.message);
      message.reply(`❌ Could not fetch data for **${username}**. Make sure the username is correct.`);
  }
  }
  if(message.content==='!pred'){
    const randomBool = Math.random() < 0.5;
    if(randomBool){
    message.channel.send('You will win your next game! Lets gooooooo');
    }
    else{
      message.channel.send("Womp Womp you're going to lose your next game!")
    }
  }
});

client.on('messageReactionAdd', async (reaction, user) => {
  console.log(`User ${user.tag} reacted with ${reaction.emoji.name} on message: "${reaction.message.content}"`);
  if (reaction.emoji.name.toLowerCase() === "😆" || reaction.emoji.name.toLowerCase() === "😂" || reaction.emoji.name.toLowerCase() === "🤣") {
      try {
          await reaction.message.reply("⚠️ This is a serious channel. No laughing in chat.");
      } catch (error) {
          console.error("Failed to reply:", error);
      }
  }
});

let trackedUser=null;

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith('!track') || message.author.bot) return;

  const args = message.content.split(" ").slice(1);
  if (args.length === 0) {
      message.reply("❌ Please specify a Lichess username to track.");
      return;
  }

  const username = args[0];
  
  if (username) {
    trackedUser = username;
    message.reply(`✅ Now tracking **${username}** on Lichess. I'll notify when they're online.`);
} else {
    message.channel.send('Please provide a valid Lichess username!');
}

});

async function checkLichessStatus(username) {
  try {
      const response = await axios.get(`https://lichess.org/api/users/status?ids=${username}`);
      console.log('Response Data:', response.data);
      const isOnline = response.data.online;
      return isOnline;
  } catch (error) {
      console.error(`Failed to check status for ${username}:`, error);
      return false;
  }
}

setInterval(async () => {
  if (trackedUser) {
    const isOnline = await checkLichessStatus(trackedUser);
    if (isOnline) {
      channel.send(`**${trackedUser}** is now online on Lichess!`);
    }
}
}, 10000);

client.login(process.env.DISCORDJS_BOT_TOKEN);

