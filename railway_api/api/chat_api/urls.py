from django.urls import include, path

from . import views

urlpatterns = [
    path('users/', views.MessageListView.msg_history),
    #path('', views.MForm.as_view()),
    path('', views.MForm.invokeBot),
]