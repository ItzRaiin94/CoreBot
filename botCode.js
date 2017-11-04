//Initalize
var mineflayer = require('mineflayer');
var navigatePlugin = require('mineflayer-navigate')(mineflayer);
var readline = require("readline");
var fs = require('fs');
const config = require('./config.json');

//Create Bot
const bot = mineflayer.createBot({
	host: config.host,              //Server's hostname. (e.g. play.totalfreedom.me)
	port: config.port,              //Server's port. (e.g. 25565)
	version: config.version,        //Server's version. (e.g. 1.12.1)
	username: config.username,      //Bot's username [Email for Premium] (e.g. BotUser4 or BotUser4@bot.co)
	// password: config.password,   //Bot's password [Premium Only] (e.g. Password123456)
})

//Chat Patterns
bot.chatAddPattern(/^.* <(.*)> (.*)$/, 'tagchat', 'Tag Chat');

//Initalize Follow
var follow = false;
var foloutId = undefined;
var attoutId = undefined;
navigatePlugin(bot);
function followTarget() {
    var path = bot.navigate.findPathSync(global.target.position, {
      timeout: 999,
      endRadius: 1,
    });
    bot.navigate.walk(path.path)
}

//Initalize Console
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
rl.setPrompt('core$');
rl.prompt();

//OnConnect
bot.on('login', function() {
	bot.chat('/tag set '+config.tag);
	bot.chat('/nick '+config.nickname);
    bot.chat(config.login);
});

//Variables
var displayprocess = undefined;
var inventoryprocess = undefined;

//Inventory Manager Functions
function sayItems (items = bot.inventory.items()) {
	const output = items.map(itemToString).join(', ')
	if (output) {
		console.log('[================[Command: Inventory]===============]');
		console.log('I have '+output+'.');
		console.log('[===================================================]');
	} else {
		console.log('[================[Command: Inventory]===============]');
		console.log('I have no items.');
		console.log('[===================================================]');
    }
	rl.prompt();
}
function tossItem (name, amount) {
  amount = parseInt(amount, 10)
  const item = itemByName(name)
  if (!item) {
	console.log('[================[Command: Inventory]===============]');
    console.log('I have no '+name+'.');
	console.log('[===================================================]');
  } else if (amount) {
    bot.toss(item.type, null, amount, checkIfTossed)
  } else {
    bot.tossStack(item, checkIfTossed)
  }
  function checkIfTossed (err) {
    if (err) {
      bot.chat('[ERROR] Unable to toss '+name+':'+err.message)
    } else if (amount) {
		console.log('[================[Command: Inventory]===============]');	
        console.log('Tossed '+amount+' of '+name+'.');
		console.log('[===================================================]');
    } else {
 		console.log('[================[Command: Inventory]===============]');	
        console.log('Tossed '+name+'.');
		console.log('[===================================================]');
    }
  }
  rl.prompt();
}
function equipItem (name, destination) {
  const item = itemByName(name)
  if (item) {
    bot.equip(item, destination, checkIfEquipped)
  } else {
	console.log('[================[Command: Inventory]===============]');
    console.log('I have no '+name+'.')
	console.log('[===================================================]');
	rl.prompt();
  }
  function checkIfEquipped (err) {
    if (err) {
      console.log('[ERROR] Cannot equip '+name+':'+err.message)
    } else {
		console.log('[================[Command: Inventory]===============]');
        console.log('Equipped '+name+'.')
		console.log('[===================================================]');	
		rl.prompt();
    }
  }
}
function unequipItem(destination) {
  bot.unequip(destination, (err) => {
    if (err) {
      bot.chat('[ERROR] Cannot unequip '+destination+':'+err.message)
    } else {
		console.log('[================[Command: Inventory]===============]');
        console.log('Unequipped '+destination+'.');
		console.log('[===================================================]');	
		rl.prompt();
    }
  })
}
function useEquippedItem () {
	console.log('[================[Command: Inventory]===============]');
    console.log('Using equipped item.');
	console.log('[===================================================]');	
    bot.activateItem()
}
function craftItem (name, amount) {
	amount = parseInt(amount, 10)
	const item = require('minecraft-data')(bot.version).findItemOrBlockByName(name)
	const craftingTable = bot.findBlock({
		matching: 58
	})
	if (item) {
		const recipe = bot.recipesFor(item.id, null, 1, craftingTable)[0]
		if (recipe) {
			console.log('[================[Command: Inventory]===============]');
			console.log('I can make '+name+'.');
			console.log('[===================================================]');	
			bot.craft(recipe, amount, craftingTable, (err) => {
			if (err) {
				bot.chat('[ERROR] Failed to make '+name+'.')
			} else {
				console.log('[================[Command: Inventory]===============]');
				console.log('Completed the recipe for '+name+' '+amount+'times.');
				console.log('[===================================================]');
			}
		})
		} else {
			console.log('[================[Command: Inventory]===============]');
			console.log('I can\'t make '+name+'.');
			console.log('[===================================================]');
		}
	} else {
		console.log('[ERROR]Unknown item: '+name+'.')
	}
	rl.prompt();
}
function itemToString (item) {
  if (item) {
    return (item.name+' x '+item.count);
  } else {
    return '(nothing)'
  }
}
function itemByName (name) {
  return bot.inventory.items().filter(item => item.name === name)[0]
}

//Coding Events
rl.on('line', function (command) {
	if (command == 'exit') {
		bot.quit();
		rl.close();
	}
	if (command == 'info') {
		console.log('[==================[Command: Info]==================]');
		console.log('[=] Bot Codename: CoreBot                         [=]');
        console.log('[=] Version: Alpha Build 5                        [=]');
		console.log('[=] Version Codename: Hail                        [=]');
		console.log('[=] Creator: Crimson7200                          [=]');
		console.log('[=] Contributors: AndOOF2561                      [=]');
		console.log('[===================================================]');
		rl.prompt();
	}
	if (command == 'stoptasks'){
        bot.navigate.stop()
        bot.clearControlStates()
        if (follow === true) {
            follow = false
            clearInterval(foloutId)
            clearInterval(attoutId)
		}
        console.log('[===============[Command: Stop Tasks]===============]');
		console.log('[=] Stopping all tasks.                           [=]');
		console.log('[===================================================]');
		rl.prompt();
    }
	if (command.startsWith('chat ')) {
		if (command.substring(5).startsWith('/')) {
			console.log('[WARN] Use the "command" function to use commands.');
		} else {
			bot.chat(command.substring(5));
			console.log('[==================[Command: Chat]==================]');
			console.log('[=] Message sent in game.                         [=]');
			console.log('[===================================================]');
		}
		rl.prompt();
	}
	if (command.startsWith('command ')) {
		bot.chat('/'+command.substring(8));
		console.log('[=================[Command: Command]================]');
		console.log('[=] Command sent in game.                         [=]');
		console.log('[===================================================]');
		rl.prompt();
	}
	if (command.startsWith('display ')) {
		displayprocess = command.substring(8);
		if (displayprocess == 'health') {
			bot.chat('I have '+(Math.round(bot.health*100)/100)+' health!')
			console.log('[=================[Command: Display]================]');
			console.log('[=] Health displayed in game.                     [=]');
			console.log('[===================================================]');
		} else if (displayprocess == 'food') {
			bot.chat('I have '+(Math.round(bot.food*100)/100)+' food!')
			console.log('[=================[Command: Display]================]');
			console.log('[=] Food displayed in game.                       [=]');
			console.log('[===================================================]');
		} else {
			console.log('[WARN] No valid display function.')
		}
		rl.prompt();
	}
	if (command.startsWith('attack ')) {
		var plnam = (command.substring(7)).trim()
		var attacktarg = bot.players[plnam].entity;
		if (attacktarg != null) {
			bot.attack(attacktarg)
			console.log('[=================[Command: Attack]=================]');
			console.log('[=] Attacking specified player                    [=]');
			console.log('[===================================================]');
        } else {
        console.log('[WARN] Could not find player')
        } 
		rl.prompt();
    }
	if (command.startsWith('follow ')) {
        follow = true
        var plnam = (command.substring(7)).trim()
        global.target = bot.players[plnam].entity;
        if (global.target != null) {
			foloutId = setInterval(followTarget, 1000);
			console.log('[=================[Command: Follow]=================]');
			console.log('[=] Following specified player                    [=]');
			console.log('[===================================================]');
        } else {
			console.log('[WARN] Could not find player.')
        }
		rl.prompt();
    }
	if (command.startsWith('inventory ')) {
		inventoryprocess = command.substring(10)
		var array = inventoryprocess.split(' ');
		if (inventoryprocess == 'list') {
			sayItems()
		} else if (inventoryprocess.startsWith('toss')) {
			tossItem(array[2], array[1])
		} else if (inventoryprocess.startsWith('equip')) {
			equipItem(array[2], array[1])
		} else if (inventoryprocess.startsWith('unequip')) {
			unequipItem(array[1])
		} else if (inventoryprocess.startsWith('craft')) {
			craftItem(array[2], array[1])
		} else {
			console.log('[ERROR] Invalid inventory function.');
		}
	}
});
bot.on('entityGone', function(entity) {
    if (entity === global.target) {
      bot.navigate.stop();
    }
});
bot.on('death', function() {
    console.log(config.death)
    clearInterval(foloutId)
    clearInterval(attoutId)
    bot.navigate.stop();
});