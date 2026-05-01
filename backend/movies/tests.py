from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from .models import UserStat, WatchlistItem, WatchHistory

class VibeoAPITests(APITestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(username='testuser', password='password123')
        
        # API Endpoints (Versioned)
        self.register_url = '/api/v1/auth/register/'
        self.login_url = '/api/v1/auth/login/'
        self.leaderboard_url = '/api/v1/leaderboard/'
        self.sync_url = '/api/v1/sync-stats/'
        self.watchlist_url = '/api/v1/watchlist/'

    def test_user_registration(self):
        """Test that a new user can register successfully."""
        data = {
            'username': 'newuser',
            'password': 'newpassword123',
            'email': 'new@vibeo.com'
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)

    def test_user_login(self):
        """Test that an existing user can login."""
        data = {
            'username': 'testuser',
            'password': 'password123'
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    def test_leaderboard_access(self):
        """Test that the leaderboard is accessible to everyone."""
        response = self.client.get(self.leaderboard_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_protected_watchlist(self):
        """Test that unauthorized users cannot access the watchlist."""
        response = self.client.get(self.watchlist_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Now login and test
        login_response = self.client.post(self.login_url, {'username': 'testuser', 'password': 'password123'})
        token = login_response.data['token']
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)
        
        response = self.client.get(self.watchlist_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_watchlist_crud_data_flow(self):
        """Test create, retrieve, update, and delete through the protected API."""
        login_response = self.client.post(self.login_url, {'username': 'testuser', 'password': 'password123'})
        token = login_response.data['token']
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)

        create_response = self.client.post(self.watchlist_url, {
            'tmdb_id': 157336,
            'title': 'Interstellar',
            'media_type': 'movie',
            'status': 'planning',
        })
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(create_response.data['title'], 'Interstellar')
        self.assertTrue(WatchlistItem.objects.filter(user=self.user, tmdb_id=157336).exists())

        list_response = self.client.get(self.watchlist_url)
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(list_response.data['results'][0]['tmdb_id'], 157336)

        item_id = create_response.data['id']
        update_response = self.client.patch(f'{self.watchlist_url}{item_id}/', {'status': 'completed'})
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data['status'], 'completed')

        delete_response = self.client.delete(f'{self.watchlist_url}{item_id}/')
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(WatchlistItem.objects.filter(user=self.user, tmdb_id=157336).exists())

    def test_history_create_from_mobile_flow(self):
        """Test that the mobile app can post watch history to the shared API."""
        login_response = self.client.post(self.login_url, {'username': 'testuser', 'password': 'password123'})
        token = login_response.data['token']
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)

        response = self.client.post('/api/v1/history/', {
            'tmdb_id': 550,
            'title': 'Fight Club',
            'media_type': 'movie',
        })

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(WatchHistory.objects.filter(user=self.user, tmdb_id=550).exists())

    def test_sync_stats(self):
        """Test the stats synchronization endpoint."""
        data = {
            'firebase_uid': 'firebase_test_123',
            'username': 'FirebaseUser',
            'total_watch_time': 3600,
            'current_streak': 10
        }
        response = self.client.post(self.sync_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify database record
        stat = UserStat.objects.get(firebase_uid='firebase_test_123')
        self.assertEqual(stat.total_watch_time, 3600)
        self.assertEqual(stat.current_streak, 10)
