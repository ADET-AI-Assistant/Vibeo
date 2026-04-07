from django.db import models
from django.contrib.auth.models import User

class WatchlistItem(models.Model):
    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('watching', 'Watching'),
        ('completed', 'Completed'),
        ('dropped', 'Dropped'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='watchlist')
    tmdb_id = models.IntegerField()
    title = models.CharField(max_length=255, null=True, blank=True)
    name = models.CharField(max_length=255, null=True, blank=True) # For TV shows
    poster_path = models.CharField(max_length=255, null=True, blank=True)
    media_type = models.CharField(max_length=20, default='movie')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning')
    added_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'tmdb_id', 'media_type')

    def __str__(self):
        return f"{self.title or self.name} ({self.user.username})"

class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    tmdb_id = models.IntegerField()
    title = models.CharField(max_length=255, null=True, blank=True)
    name = models.CharField(max_length=255, null=True, blank=True)
    poster_path = models.CharField(max_length=255, null=True, blank=True)
    media_type = models.CharField(max_length=20, default='movie')
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'tmdb_id', 'media_type')

    def __str__(self):
        return f"{self.title or self.name} (Fav: {self.user.username})"

class WatchHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='watch_history')
    tmdb_id = models.IntegerField()
    title = models.CharField(max_length=255, null=True, blank=True)
    name = models.CharField(max_length=255, null=True, blank=True)
    poster_path = models.CharField(max_length=255, null=True, blank=True)
    media_type = models.CharField(max_length=20, default='movie')
    watched_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Watch histories"
        ordering = ['-watched_at']

class UserStat(models.Model):
    firebase_uid = models.CharField(max_length=128, unique=True)
    username = models.CharField(max_length=255, null=True, blank=True)
    avatar_url = models.URLField(max_length=500, null=True, blank=True)
    total_watch_time = models.IntegerField(default=0)
    current_streak = models.IntegerField(default=0)
    highest_streak = models.IntegerField(default=0)
    last_synced = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-current_streak', '-total_watch_time']

    def __str__(self):
        return f"{self.username or self.firebase_uid} (Streak: {self.current_streak})"
