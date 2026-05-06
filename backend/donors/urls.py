from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DonorViewSet, upcoming_events

router = DefaultRouter()
router.register(r'donors', DonorViewSet, basename='donor')

urlpatterns = [
    path('', include(router.urls)),
    path('upcoming/<str:event_type>/', upcoming_events, name='upcoming-events'),
]