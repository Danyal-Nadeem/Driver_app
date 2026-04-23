from django.db import models
from django.contrib.auth.models import User

class DriverProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    truck_id = models.CharField(max_length=50)
    full_name = models.CharField(max_length=100)

    def __str__(self):
        return self.full_name
