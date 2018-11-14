from django.forms import ModelForm
from . import models

class MsgForm(ModelForm):
	class Meta:
		model = models.Message
		fields = ('msg', 'userid')
