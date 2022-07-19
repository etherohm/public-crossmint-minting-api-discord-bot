const config = require("../../config.json");
const Discord = require('discord.js');

// == Create embed for minting information success ==
async function createMintedEmbed(nft_data) {
    try {
        const embed = new Discord.MessageEmbed()
            .setColor(config.botEmbedColor)
            .setTitle(`Your NFT was minted!\n(CrossMint ID: ${nft_data.crossmintid})`)
            .setDescription(`**${nft_data.nft_name}**\n*${nft_data.nft_description}*`)
            .addFields(
                { name: 'Recipient:', value: nft_data.nft_recipient, inline: true },
                { name: 'Network:', value: nft_data.nft_network, inline: true },
                { name: 'Transaction:', value: `[Scanner Link](${getTxURL(nft_data.txId, nft_data.nft_network)})`, inline: true })
            .setThumbnail(nft_data.nft_image)
            .setFooter({ text: `powered by crossmint.io`, iconURL: config.botLogo })
            .setTimestamp();
        return embed;
    } catch (e) {
        console.log(e)
    }
}

// == helps generate a url for embed tx info ==
function getTxURL(txId, network) {
    switch (network) {
        case "poly":
            if (config.staging) {
                return config.polygonscan_mumbai + txId;
            }
            else {
                return config.polygonscan_mainnet + txId;
            }
        case "sol":
            return config.solscan + txId;
        default:
            return `No TX for ${txId} on ${network} available.`
    }
}

module.exports = { createMintedEmbed };