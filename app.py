# Server for the Martello Murder Analyzer

import murderAnalyzer
import json
import numpy

from flask import Flask, jsonify, request, render_template #import objects from the Flask model
app = Flask(__name__) #define app using Flask

# exec('murderAnalyzer.py')
murderAnalyzer.main()

with open('analyzedData.json') as json_file:
	analyzedData = json.load(json_file)

@app.route('/')
def index():
	return render_template('martello_challenge.html')

@app.route('/time/<string:epoch>', methods=['GET'])
def sendData(epoch):
    response = {}
    #looping through the guests and checking each epoch against the qurried value
    for guest in analyzedData:
        #default value
        closestEpoch = "0"
        #looping through each guests data
        for curr_epoch in analyzedData[guest]:
            #if we have passed the largest epoch
            if int(curr_epoch) > int(epoch):
                break
            closestEpoch = curr_epoch
        if(closestEpoch != "0"): 
            response[guest] = analyzedData[guest][closestEpoch]
    return jsonify(response)

if __name__ == '__main__':
	app.run(debug=True, port=8080) #run app on port 8080 in debug mode