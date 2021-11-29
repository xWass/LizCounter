const Discord = require('discord.js');
const sqlite = require('sqlite3')
const client = new Discord.Client();

client.once("ready", async function () {
	console.log(client.user.username + " is ready!");
	client.user.setActivity("your numbers.", {
		type: "WATCHING"
	});
	let db = new sqlite.Database('./num.db', sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE);
	db.run(`CREATE TABLE IF NOT EXISTS data(guildid INTEGER NOT NULL, number INTEGER NOT NULL)`);
    return;
});

client.on('message', async (message) => {
    if (message.author.bot || message.channel.type === "dm") return;
    if (message.guild.id !== "739572662728261642") return;
	const counts = client.channels.cache.get("908142027521282078");
	if (message.channel.id !== counts) return
    let guildid = message.guild.id
    let query = `SELECT * FROM data WHERE guildid = ?`;
    let db = new sqlite.Database('./num.db', sqlite.OPEN_READWRITE);
    db.get(query, [guildid], async (err, row) => {
        if (err) {
            console.log(err);
            return;
        }
        if (row === undefined) {
			let insertdata = db.prepare(`INSERT INTO data VALUES(?,?)`);
			insertdata.run(guildid, 0);
			insertdata.finalize();
			return;
		}

        let fail = new Discord.MessageEmbed()
        .setDescription(`**${message.author} ruined the counting!** \n**Content of message: "${message.content}"**`)
        .setColor("RANDOM")
        .setTimestamp()
        .setFooter("LizSwitch","https://cdn.discordapp.com/avatars/692155745818509461/6c6b8f503a1b4bae9143c0988413a82f.png?size=320")
    

        let numUpdate = row.number + 1
	if (message.content.startsWith("!")) return;
        if (counts) {
            if (row.number === 0 && message.content != numUpdate) {
                return;
            }
            if (message.content != numUpdate) {
                db.run(`UPDATE data SET number = ? WHERE guildid = ?`, [0, guildid])
                message.reply(fail)
                return;
            }
            db.run(`UPDATE data SET number = ? WHERE guildid = ?`, [numUpdate, guildid])
            return;
        }
    })
})
client.login(process.env.DISCORD_TOKEN);
