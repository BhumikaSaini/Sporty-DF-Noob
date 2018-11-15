from rest_framework import serializers
from . import models

class MessageSerializer(serializers.ModelSerializer):
	msg = serializers.CharField()
	userid = serializers.IntegerField()
	isReceived = serializers.IntegerField()
	msgTime = serializers.DateTimeField()

	class Meta:
		model = models.Message
		fields = ('msg', 'userid', 'isReceived', 'msgTime')
		read_only_fields = ('isReceived', 'msgTime')

	def getMsg(self):
		return self.msg