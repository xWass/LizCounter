const Discord = require('discord.js');
const sqlite = require('sqlite3')
const client = new Discord.Client();

client.once("ready", async function () {
	console.log(client.user.username + " is ready!");
	client.user.setActivity("your numbers.", {
		type: "WATCHING"
	});
	let db = new sqlite.Database('./num.db', sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE);
	db.run(`CREATE TABLE IF NOT EXISTS data(guildid INTEGER NOT NULL, number INTEGER NOT NULL, authorid INTEGER NOT NULL)`);
    return;
});

client.on('message', async (message) => {
	if (message.author.bot) return;
    if (message.channel.type === "dm") return;
    if (message.guild.id !== "739572662728261642") return;
	if (message.channel.id !== "908142027521282078") return;
	const counts = client.channels.cache.get("908142027521282078");
    let guildid = message.guild.id
    let query = `SELECT * FROM data WHERE guildid = ?`;
    let db = new sqlite.Database('./num.db', sqlite.OPEN_READWRITE);
    db.get(query, [guildid], async (err, row) => {
        if (err) {
            console.log(err);
            return;
        }
        let auth = message.author.id
        if (row === undefined) {
			let insertdata = db.prepare(`INSERT INTO data VALUES(?,?,?)`);
			insertdata.run(guildid, 0, 0);
			insertdata.finalize();
			return;
		}

        let embed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setTimestamp()
        .setFooter("LizSwitch","https://cdn.discordapp.com/avatars/692155745818509461/6c6b8f503a1b4bae9143c0988413a82f.png?size=320")


        let numUpdate = row.number + 1
        if (counts) {
            if (row.number === 0 && message.content != numUpdate) {
                return;
            }
            if (message.content.startsWith("!")) return;
            if (message.author.id == row.authorid) {
                if (message.content != numUpdate) {
                    await embed.setDescription(`**${message.author} ruined the counting!** \n**Content of message: "${message.content}"**`)
                    message.channel.send(embed)
                    message.react("❌")
                    await db.run(`UPDATE data SET number = ? WHERE guildid = ?`, [0, guildid])
                    await db.run(`UPDATE data SET authorid = ? WHERE guildid = ?`, [0, guildid])
                    return;    
                }
                await embed.setDescription(`**${message.author} ruined the counting!** \n**User counted twice in a row!** \n**Content of message: "${message.content}"**`)
                message.channel.send(embed)
                message.react("❌")
                await db.run(`UPDATE data SET number = ? WHERE guildid = ?`, [0, guildid])
                await db.run(`UPDATE data SET authorid = ? WHERE guildid = ?`, [0, guildid])
                return;
            }
            if (message.content != numUpdate) {
                await db.run(`UPDATE data SET number = ? WHERE guildid = ?`, [0, guildid])
                await db.run(`UPDATE data SET authorid = ? WHERE guildid = ?`, [0, guildid])
                await embed.setDescription(`**${message.author} ruined the counting!** \n**Content of message: "${message.content}"**`)
                message.channel.send(embed)
                message.react("❌")
                return;
            }
        }
        await db.run(`UPDATE data SET number = ? WHERE guildid = ?`, [numUpdate, guildid])
        await db.run(`UPDATE data SET authorid = ? WHERE guildid = ?`, [auth, guildid])
        message.react("✔️")
        return;

    })
})
client.login(process.env.DISCORD_TOKEN);
