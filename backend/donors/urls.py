from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DonorViewSet, upcoming_events,
    confirm_donor, next_time_donor, reject_donor,
    confirmed_donors_list, complete_confirmed, reject_confirmed,
)

router = DefaultRouter()
router.register(r'donors', DonorViewSet, basename='donor')

urlpatterns = [
    path('', include(router.urls)),

    # Sidebar upcoming
    path('upcoming/<str:event_type>/', upcoming_events, name='upcoming-events'),

    # Sidebar actions
    path('confirm-donor/',              confirm_donor,   name='confirm-donor'),
    path('next-time-donor/',            next_time_donor, name='next-time-donor'),
    path('reject-donor/<int:donor_id>/', reject_donor,  name='reject-donor'),

    # Confirmed donors page
    path('confirmed-donors/',                              confirmed_donors_list, name='confirmed-donors'),
    path('confirmed-donors/<int:confirmed_id>/complete/',  complete_confirmed,    name='complete-confirmed'),
    path('confirmed-donors/<int:confirmed_id>/reject/',    reject_confirmed,      name='reject-confirmed'),
]