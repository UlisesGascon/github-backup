const path = require('path')
const {
  GITHUB_TOKEN: githubToken,
  PASSPHRASE: passphrase,
  TARGET_ORGANIZATIONS: targetOrganizations,
  TARGET_PUBLIC_ORGANIZATIONS: targetPublicOrganizations,
  TARGET_USERS: targetUsers,
  CRON_TIME: cronTime,
  CRON_TIMEZONE: cronTimezone
} = process.env

const getFullPath = realtivePath => path.join(process.cwd(), realtivePath)
const stringToArray = (string = '') => string ? string.split(',') : []

module.exports = {
  githubToken,
  passphrase,
  organizations: stringToArray(targetOrganizations),
  organizationsPublicOnly: stringToArray(targetPublicOrganizations),
  users: stringToArray(targetUsers),
  paths: {
    publicRepos: getFullPath('repos/public_repos'),
    privateRepos: getFullPath('repos/private_repos'),
    privateReposEncryptFile: getFullPath('repos/private_repos.gpg'),
    logs: getFullPath('logs')
  },
  cronTime: cronTime || false,
  cronTimezone: cronTimezone || 'Europe/Madrid'
}
