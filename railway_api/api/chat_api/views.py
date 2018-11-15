from django.shortcuts import render

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from rest_framework import generics
from . import models
from . import serializers
from . import forms
import requests

from django.db.models import Q

class MessageListView(generics.ListCreateAPIView):
    #queryset = models.Message.objects.all()
    #serializer_class = serializers.MessageSerializer

	@api_view(['GET'])
	def msg_history(request):
		#ans = []
		#queryset = models.Message.objects.all().filter(Q(userid=request.GET['userid']))
		#for q in queryset:
		#	serializer = serializers.MessageSerializer(q)
		#	ans.append(serializer.data)
		#return ans
		queryset = models.Message.objects.all().filter(Q(userid=request.GET['userid']))
		serializer = serializers.MessageSerializer(queryset, many=True)
		return Response(serializer.data)

class MForm(generics.CreateAPIView):
	
	#serializer_class = serializers.MessageSerializer

	@api_view(['GET','POST'])
	def invokeBot(request):
		#serializer_class = serializers.MessageSerializer
		#umsg = serializer_class.getMsg()
		umsg = request.GET['msg']
		url = "https://api.dialogflow.com/v1/query?v=20150910&lang=en&query="+umsg+"&sessionId=11111"
		headers = {'Authorization' : 'Bearer def009d7b99046678c492c0499e1f2ca'}
		r = requests.get(url, headers=headers)
		mjson = r.json()
		botReply = mjson['result']['fulfillment']['speech']
		srcStation =  mjson.get('result').get('parameters').get('sourceStation','')
		destnStation =  mjson.get('result').get('parameters').get('destinationStation','')
		travelDate =  mjson.get('result').get('parameters').get('travelDate','')
		# if all 3 params non-empty
		# get src code
		# get dstn code
		# get train info
		mjson = ""
		if srcStation != '' and destnStation != '' and travelDate != '':
			url = "http://api.railwayapi.com/v2/name-to-code/station/"+srcStation+"/apikey/pi9h941fgc/"
			r = requests.get(url)
			mjson = r.json()
			srcCode = mjson['stations'][0]['code']
			url = "http://api.railwayapi.com/v2/name-to-code/station/"+destnStation+"/apikey/pi9h941fgc/"
			r = requests.get(url)
			mjson = r.json()
			destnCode = mjson['stations'][0]['code']
			# re-arrange the travel date returned by bot
			yyyy = travelDate[:4]
			mm = travelDate[5:7]
			dd = travelDate[8:10]
			tDate = dd+"-"+mm+"-"+yyyy
			#get train info
			url = "http://api.railwayapi.com/v2/between/source/"+srcCode+"/dest/"+destnCode+"/date/"+tDate+"/apikey/pi9h941fgc/"
			r = requests.get(url)
			mjson = r.text

		return Response(botReply+'<br/>'+mjson)

#	invokeBot()