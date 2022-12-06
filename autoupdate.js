const { sshGit,infoChannel,branch } = require('./config.json');
const { exec } = require('child_process');
const simpleGit = require('simple-git');

module.exports = {
    // This function is called when the bot is started
    // This function check for an update of the main branch of the repository every 5 minutes (passphrase needed to check for update)
    // If an update is found, send a message to the info channel, pull the update and restart the bot
    async autoupdate(client){
        const git = new simpleGit()
        setInterval(async () => {
            await git.fetch()
            const status = await git.status(sshGit, branch, { "-uno": null })
            if (status.behind > 0){
                client.logger.info(`Update found on branch ${branch}`)
                await client.channels.cache.get(infoChannel).send("Une mise à jour est disponible, je vais la télécharger")
                // Reset the branch to the main branch
                await git.reset('hard', branch)
                // Pull the update
                await git.pull(sshGit, branch).catch(async err => {
                    client.logger.error(err);
                    await client.channels.cache.get(infoChannel).send("Erreur lors de la mise à jour. Veuillez vérifier les logs.")
                    return;})
                // Do npm install
                exec('npm install', async (err, stdout, stderr) => {
                    if (err) {
                        client.logger.error(`Npm install error: ${err}`)
                        await client.channels.cache.get(infoChannel).send("Erreur lors de la mise à jour (npm). Veuillez vérifier les logs.")
                        return;
                    }
                });
                client.logger.info("Update successfully downloaded")
                await client.channels.cache.get(infoChannel).send("Mise à jour téléchargée, je vais redémarrer dans 10 minutes...")              
                setTimeout(async () => {
                    await client.destroy()
                    process.exit(1);
                }, 600000)
            }
        }, 300000)
    }
}