// Dependencies
import { Telegraf, ContextMessageUpdate, Extra } from 'telegraf'
import { strings } from '../helpers/strings'
import { checkIfFromReplier } from '../middlewares/checkIfFromReplier'
import { checkLock } from '../middlewares/checkLock'

const options = [['10', '20', '30'], ['60', '120', '240']]

export function setupTimeLimit(bot: Telegraf<ContextMessageUpdate>) {
  bot.command('timeLimit', checkLock, ctx => {
    ctx.replyWithMarkdown(
      strings(ctx.dbchat, 'time_limit'),
      Extra.inReplyTo(ctx.message.message_id).markup(m =>
        m.inlineKeyboard(
          options.map(a =>
            a.map(o =>
              m.callbackButton(`${o} ${strings(ctx.dbchat, 'seconds')}`, o)
            )
          )
        )
      )
    )
  })

  bot.action(
    options.reduce((p, c) => p.concat(c), []),
    checkIfFromReplier,
    async ctx => {
      let chat = ctx.dbchat
      chat.timeGiven = Number(ctx.callbackQuery.data)
      chat = await (chat as any).save()
      const message = ctx.callbackQuery.message

      ctx.telegram.editMessageText(
        message.chat.id,
        message.message_id,
        undefined,
        `${strings(chat, 'time_limit_selected')} (${chat.timeGiven} ${strings(
          chat,
          'seconds'
        )})`
      )
    }
  )
}
