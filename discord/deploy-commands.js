// == Imports == 
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('node:fs');
const config = require("../config.json");

// == Find all commands ==
const commands = [];
const commandFiles = fs.readdirSync('discord/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

// == Register the commands ==
async function deployCommands(guilds) {
  const rest = new REST({ version: '9' }).setToken(config.botToken);
  for (let ii = 0; ii < guilds.length; ii++) {
    (async () => {
      try {

        await rest.put(
          Routes.applicationGuildCommands(config.botClientID, guilds[ii]),
          { body: commands },
        );

      } catch (error) {
        console.log(error);
      }
    })();
  }
}

module.exports = { deployCommands };
// Use Routes.applicationCommands(clientId) to register global commands (NOTE: global commands take ONE HOUR to update)