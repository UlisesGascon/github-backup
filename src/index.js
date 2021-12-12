const { repoSync } = require('./workflow')
const CronJob = require('cron').CronJob
const { cronTime, cronTimezone } = require('./config')

;(async () => {
  if (cronTime) {
    console.log(`Initialization trigger is programmed by Cron with pattern (${cronTime})`)
    const job = new CronJob(cronTime, async () => {
      console.log(`Cron has being triggered (${cronTime})`)
      await repoSync()
    }, null, true, cronTimezone)
    job.start()
  } else {
    await repoSync()
    process.exit(1)
  }
})()
