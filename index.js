const { Telegraf } = require('telegraf')
 
const bot = new Telegraf('--REPLACE--ME--WITH--TOKEN--') // It's a test bot ... Don't bother using this token after Jan 1 2021.

/**
 * To test this bot, goto the hosted bot and press start Then when it replies `hi` send /another command. 
 * You will notice the problem and the bot won't be able to stop texting you.
 */

const {session} = require('telegraf')
const {Stage} = require('telegraf')
const { BaseScene } = require('telegraf')
const { leave } = Stage

// Greeter scene
const greeter = new BaseScene('greeter')
greeter.enter((ctx) => ctx.reply('Hi'))

greeter.command('/another' , ctx => {
    ctx.session.route = 'another'
    ctx.scene.leave()
})

greeter.leave((ctx) => {
    ctx.reply('Bye')

    // This is the part that makes it fail ... `ctx.scene.enter` is calling `ctx.scene.leave` under the hood
    // Which causes an infinite loop to form and end up sending huge amount of text to the user ( the reply on line 20 ).
    // I suspect this was a design decision but there should be an option to disable this
    if (ctx.session.route == 'another') ctx.scene.enter('scene_2')       
    // else if (ctx.session.route == 'feedback') ctx.scene.enter('')   // This will go to a different scene, not right now tho.
})

greeter.hears(/hi/gi, leave())
greeter.on('message', (ctx) => ctx.reply('Send `hi`'))

const anotherScene = new BaseScene('scene_2')
anotherScene.enter((ctx) => ctx.reply('Another one - DJ Khalid'))
anotherScene.leave((ctx) => ctx.reply('-- BYE --'))
anotherScene.on('text' , ctx => ctx.scene.enter('greeter')) 

// Create scene manager
const stage = new Stage()
stage.command('cancel', leave())

// Scene registration
stage.register(greeter)
stage.register(anotherScene)

bot.use(session())
bot.use(stage.middleware())
bot.start(ctx => ctx.scene.enter('greeter'))

bot.startPolling()