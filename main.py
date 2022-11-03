from flask import Flask, request
import requests
import json

#yelp API need key
yelpApiKey = ""
yelpEndPoint = "https://api.yelp.com/v3"
businessSearchPath = "/businesses/search"
businessDetailPath = "/businesses/{}"

app = Flask(__name__)


@app.route("/")
def home():
  return app.send_static_file("mainpage.html")

@app.route("/form", methods = ["GET"])
def form():
  # make some if condition
  term = request.args.get("keyword")
  lat = request.args.get("lat")
  lng = request.args.get("lng")
  category = request.args.get("category")
  radius = request.args.get("distance")
  
  print(term + " " + lat + " " + lng + " " + category + " " + radius)
  
  #set parameters for Yelp search url
  headers = {'Authorization': 'Bearer %s' % yelpApiKey}
  params = {'term':term, 'latitude':lat, 'longitude':lng, 'categories':category, 'radius':radius}
  #request from yelp search
  response = requests.get(yelpEndPoint + businessSearchPath, params = params, headers = headers)
  responseJson = json.loads(response.text)
  #send result back to JS
  return responseJson

@app.route("/detail", methods = ["GET"])
def detail():
  id = request.args.get("id")
  print(id)

  #set parameters for Yelp detail url
  headers = {'Authorization': 'Bearer %s' % yelpApiKey}
  url = "https://api.yelp.com/v3/businesses/{}".format(id)
  #request from yelp detail
  response = requests.get(url, headers = headers)
  responseJson = json.loads(response.text)
  #send result back to JS
  return responseJson


if __name__ == "__main__":
  app.run(debug=True)
