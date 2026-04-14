"""
URL configuration for vibeo_api project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include

BASE_URL = 'api/v1/'

urlpatterns = [
    path('admin/', admin.site.urls),
    path(BASE_URL, include('movies.urls')),
]
