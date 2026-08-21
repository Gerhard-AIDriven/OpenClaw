import os
import requests
def send_simple_message():
  	return requests.post(
  		"https://api.mailgun.net/v3/sandbox6f5a1a1f0af6458eb85d74d71e50bcf2.mailgun.org/messages",
  		auth=("api", os.getenv('API_KEY', 'API_KEY')),
  		data={"from": "Mailgun Sandbox <postmaster@sandbox6f5a1a1f0af6458eb85d74d71e50bcf2.mailgun.org>",
			"to": "Gerhard Stimie <gerhard@aidriven.biz>",
  			"subject": "Hello Gerhard Stimie",
  			"text": "Congratulations Gerhard Stimie, you just sent an email with Mailgun! You are truly awesome!"})