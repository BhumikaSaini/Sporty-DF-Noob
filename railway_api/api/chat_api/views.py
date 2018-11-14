from django.shortcuts import render

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from rest_framework import generics
from . import models
from . import serializers
from . import forms

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
	serializer_class = serializers.MessageSerializer