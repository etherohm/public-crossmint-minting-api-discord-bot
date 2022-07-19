// Require the slash command builder
const { SlashCommandBuilder } = require('@discordjs/builders');
const CrossMint = require("../../crossmint/mint.js");
const Web3 = require('web3');
const DiscordHelper = require("../util/helpers.js")

// Export module for our command
module.exports = {
  data: new SlashCommandBuilder() // command details
    .setName('mint')
    .setDescription('Mint an NFT using CrossMint Minting API')
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Title of the NFT')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Description of the NFT')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('method')
        .setDescription('How are we delivering this NFT?')
        .setRequired(true)
        .addChoices(
          { name: 'E-mail', value: 'email' },
          { name: 'Web3 Wallet', value: 'web3' }
        ))
    .addStringOption(option =>
      option.setName('network')
        .setDescription('Which network do we use? Note, we only have one network for now.')
        .setRequired(true)
        .addChoices(
          { name: 'Polygon (Mumbai)', value: 'poly' }
        ))
    .addStringOption(option =>
      option.setName('recipient')
        .setDescription('Your recipients address')
        .setRequired(true))
    .addAttachmentOption((option) => option
      .setRequired(true)
      .setName("image")
      .setDescription("Image you would like to convert into an NFT")),

  async execute(interaction) {
    try {
      await interaction.reply({ content: `Please wait, processing your request.`, ephemeral: true });
      // read inputs, parse them into our data object
      const nft_data = {
        discord_userid: interaction.user.id,
        nft_name: interaction.options.get("title").value,
        nft_description: interaction.options.get("description").value,
        nft_image: interaction.options.get("image").attachment.url,
        nft_deliveryMethod: interaction.options.get("method").value,
        nft_network: interaction.options.get("network").value,
        nft_recipient: interaction.options.get("recipient").value
      }

      // validate some inputs, leaving this open for now in the event other options pop up in the future
      // This could be cleaner but it certainly helps the user understand where their error is
      var validEmailRegex = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
      if (nft_data.nft_deliveryMethod == "email") {
        if (!nft_data.nft_recipient.match(validEmailRegex)) {
          await interaction.reply({ content: `You selected email as the delivery option. ${nft_data.nft_recipient} is not a valid email.`, ephemeral: true });
          return;
        }
      }
      else {
        if (!Web3.utils.isAddress(nft_data.nft_recipient)) {
          await interaction.reply({ content: `You selected web3 as the delivery option. ${nft_data.nft_recipient} is not a valid web3 wallet.`, ephemeral: true });
          return;
        }
      }

      // mint the nft, give the user relevant info
      const mint_data = await CrossMint.mint(nft_data);
      nft_data.crossmintid = mint_data.requestId;
      await interaction.followUp({ content: `Everything checks out, attempting to mint your NFT! Please note that depending on network speed this could take anywhere from a few seconds to a few hours.\n**CrossMint Request ID: ${mint_data.requestId}**`, ephemeral: true });
      // check for a successful mint, alert the user. assuming no bad mints
      let mint_status = CrossMint.checkStatus(mint_data.requestId);
      while (mint_status.status != "success") {
        await new Promise(r => setTimeout(r, 5000)); // 5 second updates
        mint_status = await CrossMint.checkStatus(mint_data.requestId);
      }
      let embed = await DiscordHelper.createMintedEmbed(nft_data);
      // let the user know all relevant info on good mint
      await interaction.followUp({ embeds: [embed], ephemeral: true });

    } catch (e) {
      console.log(e);
    }
  },
};