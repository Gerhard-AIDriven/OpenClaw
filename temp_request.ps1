$body = @{
    raw_text = 'Sole mandate in Orewa. Double level 4 bed, 2 bath upstairs, lounge, dining room, kitchen with modern appliances and granite tops, family room and guest toilet downstairs. Lovely secured lot with landscaped garden. Undercover patio with outside gas barbecue. Double lockup car parking with direct access to house. Price 2.5million. Municipal taxes 600 per month. Write add for Trademe and Realestate.co.nz'
    agent_id = 'seb'
    session_id = 'aa464b00-f578-467a-b941-0dcd5520e6a6'
}
$json = $body | ConvertTo-Json
$response = Invoke-RestMethod -Uri 'http://127.0.0.1:8000' -Method Post -ContentType 'application/json' -Body $json
$response.listing_text
