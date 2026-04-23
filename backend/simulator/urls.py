from django.urls import path
from .views import TripSimulationView, RegisterView, LoginView

urlpatterns = [
    path('simulate-trip/', TripSimulationView.as_view(), name='simulate-trip'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
]
