import os
import requests
def send_simple_message():
  	return requests.post(
  		"https://api.mailgun.net/v3/mg.aidriven.biz.mailgun.org/messages",
  		auth=("api", os.getenv('API_KEY', 'API_KEY')),
  		data={"from": "Mailgun mg domain <postmaster@aidriven.mailgun.org>",
			"to": "Gerhard Stimie <gerhard@aidriven.biz>",
  			"subject": "Hello Gerhard Stimie",
  			"text": "Congratulations Gerhard Stimie, you just sent an email with Mailgun! You are truly awesome!"})