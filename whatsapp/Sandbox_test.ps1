curl -s --user 'api:API_KEY' \
  https://api.mailgun.net/v3/sandbox6f5a1a1f0af6458eb85d74d71e50bcf2.mailgun.org/messages \
  -F from='Mailgun Sandbox <postmaster@sandbox6f5a1a1f0af6458eb85d74d71e50bcf2.mailgun.org>' \
  -F to='Gerhard Stimie <gerhard@aidriven.biz>' \
  -F subject='Hello Gerhard Stimie' \
  -F text='Congratulations Gerhard Stimie, you just sent an email with Mailgun! You are truly awesome!' \
