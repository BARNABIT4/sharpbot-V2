const xkcd = require('xkcd-imgs');
const utils = require('../utils');

exports.run = function (bot, msg) {
    msg.edit(':arrows_counterclockwise: Loading comic...').then(m => {
        xkcd.img((err, res) => {
            if (err) {
                m.edit(':no_entry_sign: An error has occurred!');
                console.log(JSON.stringify(err));
                return;
            }
            m.edit('', {
                embed: utils.embed('', res.title, [], { url: res.url })
            });
        });
    });
};

exports.info = {
    name: 'void',
    usage: 'void',
    description: 'Shows you random comic from the void'
};