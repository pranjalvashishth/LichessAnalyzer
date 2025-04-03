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
    GatewayIntentBits.GuildMembers
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

    const username = args[0]; // Get the username
    
    try {
      console.log(`🔍 Fetching data for: ${username}`);
      const response = await axios.get(`https://lichess.org/api/user/${username}`);
      const data = response.data;

      console.log("📊 API Response:", data); // Debugging output

      if (!data || !data.perfs) {
          return message.reply(`❌ No rating data found for **${username}**.`);
      }

      // Extract ratings safely
      const bullet = data.perfs.bullet?.rating ?? "N/A";
      const blitz = data.perfs.blitz?.rating ?? "N/A";
      const rapid = data.perfs.rapid?.rating ?? "N/A";

      message.reply(`♟️ **Lichess Ratings for ${username}:**\n🔹 Bullet: **${bullet}**\n🔹 Blitz: **${blitz}**\n🔹 Rapid: **${rapid}**`);
  } catch (error) {
      console.error("❌ Lichess API Error:", error.response ? error.response.data : error.message);
      message.reply(`❌ Could not fetch data for **${username}**. Make sure the username is correct.`);
  }
  }
});

client.login(process.env.DISCORDJS_BOT_TOKEN);

