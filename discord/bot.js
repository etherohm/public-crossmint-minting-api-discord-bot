const config = require("../config.json");
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Intents } = require('discord.js');
const CommandDeployer = require("./deploy-commands.js");

// New client instance with specified intents - partials needed for DM if we go this route
const client = new Client({
  partials: ["CHANNEL"], intents: [
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGE_TYPING,
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS]
});

// == Read commands ==
client.commands = new Collection();
const commandsPath = path.join(__dirname, '/commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

// == Joined a server, update commands there ==
client.on("guildCreate", guild => {
  const all_guilds = client.guilds.cache.map(guild => guild.id);
  CommandDeployer.deployCommands([guild.id]);
})

// == Notify that the bot is online, update info, register commands ==
client.on('ready', () => {
  client.user.setAvatar(config.botLogo);
  client.user.setUsername(config.botUsername);
  const all_guilds = client.guilds.cache.map(guild => guild.id);
  CommandDeployer.deployCommands(all_guilds);
});

// == Dynamically execute given slash commands ==
client.on('interactionCreate', async interaction => {
  try {
    if (!interaction.isCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

// == Login to Discord, start bot ==
client.login(config.botToken);
