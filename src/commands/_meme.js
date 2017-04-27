const got = require('got');
const utils = require('../utils');
var templates = [];

got('https://memegen.link/templates/').then(res => {
    var data = JSON.parse(res.body);
    templates = [];
    var promises = [];
    for (var key in data) {
        promises.push(_loadMeme(data[key]));
    }

    Promise.all(promises).then(() => {
        templates = templates.filter(e => !!e);
        templates.sort((a, b) => a.name.localeCompare(b.name));
    }).catch(console.error);
}).catch(console.error);

function _loadMeme(url) {
    return got(url).then(res => {
        var singleData = JSON.parse(res.body);

        templates.push({
            name: url.replace(/https\:\/\/memegen\.link\/api\/templates\/(.*)/, '$1'),
            url: url.replace('/api/templates', ''),
            styles: singleData.styles
        });
    });
}

function getMeme(name) {
    return templates.find(m => m.name.toLowerCase() === name.toLowerCase());
}

function cleanInput(input) {
    if (!input) return '';
    return input.replace(/"/g, '\'\'').replace(/\#/g, '~h')
        .replace(/\-/g, '--').replace(/\_/g, '__')
        .replace(' ', '_').replace(/\?/g, '~q')
        .replace(/\%/g, '~p').replace(/\//g, '~s');
}

exports.run = (bot, msg, args) => {
    if (templates.length < 1) {
        throw 'The memes haven\'t loaded yet!';
    }

    if (/^(h(elp)?|\?)$/i.test(args[0])) {
        return bot.commands.get('help').run(bot, msg, 'meme');
    }

    if (/^(ls|list|s(earch)?)$/i.test(args[0])) {
        msg.delete();
        return msg.channel.sendEmbed(
            bot.utils.embed('Available Memes', '*This message will vanish in 30 seconds*\n\n' + templates.map(meme => `- \`${meme.name}\``).join('\n'))
        ).then(m => m.delete(30000));
    }

    if (/^(i(nf(o)?)?)$/i.test(args[0])) {
        if (args.length < 2) {
            throw 'You must provide a meme to get info about!';
        }

        var info = getMeme(args[1]);
        if (!info) {
            throw `That is not a valid meme! Do \`${bot.config.prefix}${this.info.name} list\` to see available memes.`;
        }

        msg.delete();
        return msg.channel.sendEmbed(
            bot.utils.embed(`\`${info.name}\``, `Styles: ${info.styles && info.styles.length > 1 ? info.styles.map(s => `\n- \`${s}\``).join('') : 'None'}`)
        ).then(m => m.delete(15000));
    }

    var input = args.join(' ');
    var parts = input.split('|').map(p => p.trim());

    if (parts < 3) {
        throw `Do \`${bot.config.prefix}help ${this.info.name}\` for info on how to use this`;
    }

    var meme = getMeme(args[0]);
    if (!meme) {
        throw `That is not a valid meme! Do \`${bot.config.prefix}${this.info.name} list\` to see available memes.`;
    }

    var url = `${meme.url}/${cleanInput(parts[1])}/${cleanInput(parts[2])}.jpg`;
    if (parts[3]) url += `?alt=${parts[3]}`;

    msg.edit(':arrows_counterclockwise:');
    msg.channel.sendFile(url, parts[0] + '.jpg')
        .then(() => msg.delete())
        .catch(msg.error);
};

exports.info = {
    name: 'meme',
    usage: 'meme list | info <name> | [<name> | <line 1> | <line 2> | [style]]',
    examples: [
        'meme info sad-biden',
        'meme facepalm | please, oh please | rtfm',
        'meme sad-biden | sad joe biden | doesn\'t have discord | scowl'
    ]
};
